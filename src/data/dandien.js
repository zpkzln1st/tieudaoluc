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

// Ngân sách khi lưới ĐẦY (DRAFT — phải đo lại time-to-100 sau khi ráp).
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
const PHAM_QUALITY = ['thuong', 'tot', 'hiem', 'cucHiem', 'truyenThe', 'truyenThe', 'huyenThoai', 'huyenThoai', 'docNhat'];

// Art MƯỢN: chưa vẽ art riêng cho 27 viên. Mượn 9 ảnh đan sẵn có trong `images/items/`, mỗi phẩm
// một ảnh, dùng chung cho cả ba nhánh — nhánh phân biệt bằng MÀU VIỀN.
// ⛔ Đừng thay art thiếu bằng chữ hay emoji. Vẽ xong 27 ảnh thật thì đổi đúng bảng này.
export const DD_ART_MUON = ['hoiKhiDan', 'hoatHuyetDan', 'quanKhiDan', 'cuongNguyenDan', 'duongThuDan',
  'ngoDaoDan', 'bachBaoDan', 'hoanHonDan', 'moiGiaoLongDan'];

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
        desc: 'Nạp vào Đan Điền, mở một ô ' + DD_NHANH_INFO[nh].ten + ' ' + DD_PHAM_TEN[p - 1] + '.',
      };
    }
  }
  return ra;
}
