// ============================================================
// ĐAN ĐIỀN — Tinh · Khí · Thần  (docs/THIET_KE_DAN_DIEN.md)
// ============================================================
// Ba nhánh, chín phẩm, lấp bằng đan dược. Lấp đầy cả lưới là mục tiêu dài hạn.
//
// ⚠⚠ VÌ SAO KHÔNG PHẢI Võ/Kỹ/Phép (game tham khảo): đó là trục LOẠI SÁT THƯƠNG, mà trục đó ở
//    Tiêu Dao Lục đã có rồi — Ngũ Hành. Đo 192 trận thật: chiêu thức ăn 89–95% tổng sát thương,
//    đòn thường 1–5%, hiệu ứng hệ 4–6%. Chia chỉ số theo kiểu sát thương thì một chỉ số thành
//    tất cả, hai chỉ số kia thành đồ trang trí. Tinh/Khí/Thần là ba loại ĐÒN BẨY, không phải ba
//    loại sát thương, nên cả ba đều có việc bất kể sát thương chia thế nào.
//
// ⛔ Thần KHÔNG cộng Bạo Kích. Trần Bạo Kích 75% đã có bốn nguồn tranh nhau; Linh Xảo từng bị hạ
//    hệ số vì một mình nó ăn 55/75 điểm trần, làm dòng Bạo Kích trên đồ bậc cao mất trắng.

export const DD_NHANH = ['tinh', 'khi', 'than'];

export const DD_NHANH_INFO = {
  tinh: { id: 'tinh', ten: 'Tinh', vai: 'Thân thể',   mo: 'Tăng Sinh Lực và Phòng Ngự.',                    mau: '#f87171' },
  khi:  { id: 'khi',  ten: 'Khí',  vai: 'Nội công',   mo: 'Tăng Công Kích, Nội Lực tối đa và tốc hồi Nội Lực.', mau: '#38bdf8' },
  than: { id: 'than', ten: 'Thần', vai: 'Thần thức',  mo: 'Tăng năm dòng Kháng, Chính Xác và rút ngắn khống chế.', mau: '#c084fc' },
};

// Tên chín phẩm. Nhãn Hán-Việt đầy đủ, không viết tắt.
export const DD_PHAM_TEN = ['Nhất Phẩm', 'Nhị Phẩm', 'Tam Phẩm', 'Tứ Phẩm', 'Ngũ Phẩm',
  'Lục Phẩm', 'Thất Phẩm', 'Bát Phẩm', 'Cửu Phẩm'];

// Số ô mỗi phẩm (chung cho cả ba nhánh) — BẬC THANG: phẩm p có p+1 ô.
// Nhất Phẩm 2 ô, mỗi phẩm hơn phẩm trước một ô, Cửu Phẩm 10 ô.
// Tổng một nhánh 54 ô ⇒ CẢ LƯỚI 162 viên.
export const DD_O = [2, 3, 4, 5, 6, 7, 8, 9, 10];

// Phẩm 1-5 nấu ở Dược Lư; phẩm 6-9 CHỈ rơi từ Yêu Vương và Bí Cảnh.
export const DD_PHAM_NAU_TOI = 5;
export const DD_TI_LE_ROI = 0.06;         // mỗi lượt Yêu Vương / Bí Cảnh đủ cấp

// ============================================================
// ĐƯỜNG RƠI — phẩm mấy rơi ở đâu
// ============================================================
// Cấp YÊU CẦU của phó bản / Yêu Vương quyết định phẩm rơi. Bậc thang dưới đây bám ĐÚNG mốc cấp
// của chín Bí Cảnh (10·25·40·55·70·80·85·92·100) và mười Yêu Vương (10·20…·100) đang có, nên mỗi
// bậc đều có ít nhất một cửa thả ra.
// ⚠ ĐỪNG gõ bảng riêng cho từng phó bản: thêm một phó bản mới là quên một dòng. Suy từ CẤP.
export const DD_CAP_THEO_PHAM = [1, 20, 30, 40, 55, 68, 78, 88, 100];

/** Phẩm đan rơi ở cửa có cấp yêu cầu `cap`. Trả 1..9. */
export function ddPhamRoiTheoCap(cap) {
  const c = Number(cap) || 1;
  let p = 1;
  for (let i = 0; i < DD_CAP_THEO_PHAM.length; i++) if (c >= DD_CAP_THEO_PHAM[i]) p = i + 1;
  return p;
}

/** Mã viên đan rơi ở cửa cấp `cap`, nhánh bốc theo `r` trong [0,1). */
export function ddDanRoi(cap, r) {
  const nh = DD_NHANH[Math.min(DD_NHANH.length - 1, Math.floor((Number(r) || 0) * DD_NHANH.length))];
  return ddItemId(nh, ddPhamRoiTheoCap(cap));
}

export const DD_TONG_O = DD_O.reduce((s, n) => s + n, 0) * DD_NHANH.length;          // 162
export const DD_TONG_NAU = DD_O.slice(0, DD_PHAM_NAU_TOI).reduce((s, n) => s + n, 0) * DD_NHANH.length;  // 60
export const DD_TONG_ROI = DD_TONG_O - DD_TONG_NAU;                                  // 102

// ============================================================
// GIÁ TRỊ MỖI VIÊN — suy từ NGÂN SÁCH CẢ LƯỚI, không gõ tay từng phẩm
// ============================================================
// ⚠ Gõ tay 27 con số thì tổng sẽ lệch ngân sách mà không ai phát hiện. Ở đây chia theo TRỌNG SỐ:
//   viên phẩm p nặng bằng p. Tổng trọng số một nhánh = Σ (ô[p] × p) = 330.
//   ⇒ viên phẩm p cho: ngân_sách × p / 330. Cộng đủ 54 ô thì ra ĐÚNG ngân sách, sai số làm tròn 0.
export const DD_TRONG_SO = DD_O.reduce((s, n, i) => s + n * (i + 1), 0);   // 330

// Ngân sách khi lưới ĐẦY.
// CHỐT: lưới đầy cho +20% mỗi dòng, Đan Hồn mở hết nhân thêm 37% ⇒ Sinh Lực · Phòng Ngự ·
//   Công Kích mỗi thứ +27,4%. Nhìn cạnh Vạn Vật Phổ (allPct +56,6% khi trọn bảy phổ) thì
//   Đan Điền nhẹ hơn một bậc — đúng vai: 162 viên đan dễ gom hơn 417 mục sưu tập.
export const DD_NGAN_SACH = {
  tinh: { hpPct: 0.20, defPct: 0.20 },
  khi:  { atkPct: 0.20, nlMax: 30, nlRegenPct: 0.20 },
  than: { khangPct: 0.12, menhTrung: 60, ccGiamPct: 0.20 },
};

/** Giá trị MỘT viên nhánh `nhanh` phẩm `pham` (1..9). Trả object cùng khoá với ngân sách. */
export function ddMoiVien(nhanh, pham) {
  const ns = DD_NGAN_SACH[nhanh]; if (!ns) return {};
  const ra = {};
  for (const k in ns) ra[k] = ns[k] * pham / DD_TRONG_SO;
  return ra;
}

// ============================================================
// ĐAN HỒN — mốc chéo nhánh
// ============================================================
// Lấp đủ MỘT phẩm ở CẢ BA nhánh mới mở. Đây là chỗ chặn lối dồn hết vào một nhánh.
// Thưởng: cộng thêm % lên chính ba chỉ số, ăn trên tổng.
export const DD_HON_THUONG = [0.02, 0.02, 0.03, 0.03, 0.04, 0.04, 0.05, 0.06, 0.08];  // tổng +37%

export function ddHonTen(pham) { return 'Đan Hồn ' + DD_PHAM_TEN[pham - 1]; }

// ============================================================
// VẬT PHẨM — 27 viên, sinh từ cấu hình (KHÔNG gõ tay 27 khối)
// ============================================================
// ⚠ Art: chưa có ảnh riêng. MƯỢN icon đan sẵn có cho tới khi vẽ xong — xem `ddArtMuon`.
//   Đừng thay art thiếu bằng chữ hay emoji.
// ⚠ MÃ phẩm chất, KHÔNG phải tên hiển thị. Bảng cũ ghi 'thuong' / 'hiem' / 'huyenThoai' — không mã
//   nào trong số đó có trong `QUALITY` của items.js, nên viên đan rơi về ô xám và Cẩm Nang in ra
//   nguyên mã tiếng Anh. Mã thật: phamPham · luongPham · tinhPham · tuyetPham · truyenThe ·
//   thanPham · coBan (bài kiểm Cẩm Nang bắt được lỗi này ngay khi 27 viên vào bảng vật phẩm).
const PHAM_QUALITY = ['phamPham', 'luongPham', 'tinhPham', 'tuyetPham', 'truyenThe', 'truyenThe', 'thanPham', 'thanPham', 'coBan'];

// Art MƯỢN: chưa vẽ art riêng cho 27 viên. Mượn 9 ảnh đan sẵn có trong `images/items/`, mỗi phẩm
// một ảnh, dùng chung cho cả ba nhánh — nhánh phân biệt bằng MÀU VIỀN.
// ⛔ Đừng thay art thiếu bằng chữ hay emoji. Vẽ xong 27 ảnh thật thì đổi đúng bảng này.
export const DD_ART_MUON = ['hoiKhiDan', 'hoatHuyetDan', 'quanKhiDan', 'cuongNguyenDan', 'duongThuDan',
  'ngoDaoDan', 'bachBaoDan', 'hoanHonDan', 'moiGiaoLongDan'];

// Nhánh nào ĐÃ CÓ ART THẬT thì thêm vào đây — nhánh đó thôi mượn, dùng `ddTinh1`…`ddTinh9`.
// ⚠ Thêm nhánh vào danh sách này TRƯỚC KHI thả tệp vào `images/items/` là ô trống trơn: `ico()`
//   rơi về emoji chứ không rơi ngược về art mượn. Thả tệp xong mới thêm tên nhánh.
// Đủ art thật cho CẢ BA nhánh: 27 tệp `ddTinh1`…`ddThan9`, 500×500, nền trong suốt, 30–102 KB.
// Đo bằng `_mockup/_do_anh_dan_v3.html` + `_mockup/_soi_dan_34.html`: phủ mực ở ô 34px là
// 15,6–51,3%, nằm dưới mốc 90% của 246 art vật phẩm khác (52,9%).
export const DD_ART_THAT = ['tinh', 'khi', 'than'];

/** Art của một ô: art thật nếu nhánh đã có, không thì mượn theo phẩm. */
export function ddArtCua(nhanh, pham) {
  return DD_ART_THAT.includes(nhanh) ? ddItemId(nhanh, pham) : DD_ART_MUON[pham - 1];
}

export function ddItemId(nhanh, pham) { return 'dd' + nhanh[0].toUpperCase() + nhanh.slice(1) + pham; }

/** Bảng 27 vật phẩm đan, để items.js trộn vào ITEMS. */
export function ddItems() {
  const ra = {};
  for (const nh of DD_NHANH) {
    for (let p = 1; p <= 9; p++) {
      const id = ddItemId(nh, p);
      ra[id] = {
        id, name: DD_NHANH_INFO[nh].ten + ' Đan · ' + DD_PHAM_TEN[p - 1],
        icon: '⚱️', type: 'danDien', nhanh: nh, pham: p,
        quality: PHAM_QUALITY[p - 1] || 'thuong',
        value: 40 * p * p,
        // ⚠ MỘT động từ cho một việc: mọi nút và mọi câu đều là "sử dụng / dùng". Trước đây mô tả
        //   ghi "nạp" còn nút ghi "dùng" — hai chữ cho cùng một hành động.
        desc: 'Sử dụng để lấp một ô ' + DD_NHANH_INFO[nh].ten + ' ' + DD_PHAM_TEN[p - 1] + '.',
      };
    }
  }
  return ra;
}

// ============================================================
// DƯỢC PHƯƠNG — 15 công thức nấu đan phẩm 1–5 ở Dược Lư (nghề Luyện Đan)
// ============================================================
// Nguồn của phẩm 1–5 theo docs/THIET_KE_DAN_DIEN.md §3: cấp nghề Luyện Đan + linh thảo nghề Hái Thuốc.
// Phẩm 6–9 KHÔNG có công thức — chúng chỉ rơi từ Yêu Vương và Bí Cảnh.
//
// ⚠⚠ HÀNG RÀO THẬT LÀ CẤP NGHỀ, không phải số linh thảo. Nấu trọn 60 viên chỉ tốn 9,6 giờ máy
//    chạy (8,0 giờ hái thảo + 1,5 giờ nấu), nhưng muốn chạm Ngũ Phẩm thì phải có Luyện Đan 90 VÀ
//    Hái Thuốc 92 — hai nghề đó mới là quãng đường dài. Đo bằng `_check_duoclu` mục E.
//
// ⚠ BA NHÁNH DÙNG CHUNG một bộ linh thảo ở mỗi phẩm. Cố ý: Đan Hồn đòi lấp đủ cả ba nhánh, nên
//   bắt một nhánh đắt hơn hai nhánh kia là phạt người chơi vì thứ họ không chọn được.
//
// Bậc thang xp/giây bám đúng đường cong Luyện Đan sẵn có: 0,67 ở Lv15 → 1,50 ở Lv90.
export const DD_CONG_THUC = {
  1: { reqLevel: 15, time: 45,  xp: 30,  statXp: 2, inputs: [{ itemId: 'thanhNgaiThao', qty: 8 }, { itemId: 'tuDangHoa', qty: 5 }] },
  2: { reqLevel: 30, time: 60,  xp: 48,  statXp: 4, inputs: [{ itemId: 'tuDangHoa', qty: 8 }, { itemId: 'duongQuyCan', qty: 5 }] },
  3: { reqLevel: 50, time: 80,  xp: 74,  statXp: 5, inputs: [{ itemId: 'thachHocLan', qty: 8 }, { itemId: 'tuyetLienHoa', qty: 5 }] },
  4: { reqLevel: 70, time: 100, xp: 125, statXp: 7, inputs: [{ itemId: 'ngocTuyenSam', qty: 8 }, { itemId: 'vanLoChi', qty: 5 }] },
  5: { reqLevel: 90, time: 125, xp: 188, statXp: 9, inputs: [{ itemId: 'thatTinhThao', qty: 8 }, { itemId: 'tramVuLan', qty: 5 }] },
};

// Nền tờ Dược Phương vẽ sau lưng viên đan trong danh sách công thức. Ba tấm cho năm phẩm:
// bậc thấp 1–2 · bậc giữa 3–4 · bậc cao 5. Art ở `images/items/`, giữa tấm để trống sẵn cho viên đan.
const DD_NEN = ['duocphuong_12', 'duocphuong_12', 'duocphuong_34', 'duocphuong_34', 'duocphuong_5'];

/** Mã art nền Dược Phương của phẩm `pham`. Phẩm 6–9 không nấu được nên trả rỗng. */
export function ddNenPhuong(pham) {
  const p = Math.floor(Number(pham) || 0);
  return (p >= 1 && p <= DD_PHAM_NAU_TOI) ? DD_NEN[p - 1] : '';
}

/** Viên đan này có nấu ở Dược Lư được không (dùng để giao diện biết lúc nào vẽ nền tờ phương). */
export function ddNauDuoc(itemId) {
  for (const nh of DD_NHANH) for (let p = 1; p <= DD_PHAM_NAU_TOI; p++) if (ddItemId(nh, p) === itemId) return p;
  return 0;
}

const DD_GLOSS_NHANH = { tinh: 'Essence', khi: 'Qi', than: 'Spirit' };
const DD_GLOSS_PHAM = ['I', 'II', 'III', 'IV', 'V'];

/**
 * 15 công thức cho `SKILLS.luyenDan.actions`. Sinh từ DD_CONG_THUC — KHÔNG gõ tay 15 khối.
 * ⚠ `id` trùng `itemId`, đúng quy ước của mọi công thức khác trong skills.js.
 */
export function ddCongThuc() {
  const ra = [];
  for (const nh of DD_NHANH) {
    for (let p = 1; p <= DD_PHAM_NAU_TOI; p++) {
      const c = DD_CONG_THUC[p]; if (!c) continue;
      const id = ddItemId(nh, p);
      ra.push({
        id, itemId: id,
        name: DD_NHANH_INFO[nh].ten + ' Đan · ' + DD_PHAM_TEN[p - 1],
        gloss: DD_GLOSS_NHANH[nh] + ' Pill ' + DD_GLOSS_PHAM[p - 1],
        reqLevel: c.reqLevel, xp: c.xp, time: c.time, statXp: c.statXp,
        inputs: c.inputs.map((x) => ({ itemId: x.itemId, qty: x.qty })),
      });
    }
  }
  return ra;
}
