// ============================================================
// GIÁ SÀN TỐI THIỂU — treo bán thấp hơn mức này thì máy chủ từ chối
// ============================================================
// Bảng đối chiếu đầy đủ: docs/BANG_GIA_SAN.md (máy sinh bởi _covua_wip/_sinh_bang_gia.mjs).
//
// ⚠⚠ CÔNG THỨC NÀY CÓ BẢN SONG SINH BẰNG SQL (docs/SQL_SAN_GIAO_DICH.sql, hàm `san_gia_toi_thieu`).
//    Client tính để HIỆN cho người chơi; máy chủ tính để CHẶN. Sửa một bên mà quên bên kia là
//    người chơi thấy một giá, bấm vào lại bị từ chối vì một giá khác. Bài kiểm `_check_giasan.mjs`
//    so hai bản trên vài chục ca — sửa xong phải chạy lại nó.
//
// ⚠ Mốc chốt: CỰC HIẾM cấp 100 = 1 triệu Bạc (~183 giờ cày ở quái cuối game, 5.468 Bạc/giờ).
//   Bốn bậc dưới giữ tỉ lệ đo từ `MONSTER_QUALITY_W` (60/25/10/5), rồi kéo cả thang lên cho khớp mốc.
//   Ba bậc trên leo THOẢI hơn (×1,8): để ×2,6 thì Độc Nhất ra 3.213 giờ, mà cả hành trình lên cấp
//   100 chỉ có 577 giờ — món đắt gấp tám lần cả cuộc chơi thì không bao giờ có ai mua.
export const HS_PHAM = {
  phamPham: 13, luongPham: 33, tinhPham: 80, tuyetPham: 199,
  truyenThe: 358, thanPham: 645, coBan: 1160,
};

// Chi phí ép KỲ VỌNG quy ra Bạc — lấy `value` của chính viên đá/Tinh Thể, nhân số lần kỳ vọng
// (bảng cường hoá có tỉ lệ hỏng nên một cấp phải đánh nhiều lần). Cộng THẲNG, không nhân theo
// phẩm: tiền ép là chi phí chìm có thật, món phẩm nào ép cũng tốn từng ấy.
export const CP_EP = [0, 21, 51, 89, 145, 283, 425, 750, 1120, 1617, 2308, 4230, 10661, 20328, 34067, 62067];

// ⚠ Giá sàn KHÔNG BAO GIỜ bằng giá NPC. Bằng nhau thì chẳng ai buồn lên sàn.
export const CHENH = 3;

// Hàng hiếm xếp chồng: công cụ · đồ phổ · trứng pet.
export const HS_HIEM = 5;
export const LOAI_HIEM = ['doPho', 'trung'];
export const O_CONG_CU = ['riu', 'cuoc', 'canCau', 'duocLiem', 'toaKy'];

// ⚠ TIỀN LÀM TRÒN LÊN — hệ thống không lỗ.
const len = (n) => Math.ceil(n);

/** Giá NPC của một trang bị theo cấp món — cùng công thức `value` trong gear.js. */
export function giaNpcTrangBi(itemLv) { return Math.round(itemLv * itemLv * 0.5 + 20); }

/** Giá sàn của MỘT instance trang bị. */
export function giaSanTrangBi(itemLv, quality, plus) {
  const hs = HS_PHAM[quality] || HS_PHAM.phamPham;
  const ep = CP_EP[Math.max(0, Math.min(15, Math.floor(plus || 0)))] || 0;
  return len(giaNpcTrangBi(itemLv) * hs + ep + CHENH);
}

/** Giá sàn của MỘT vật phẩm xếp chồng (một cái, chưa nhân số lượng). */
export function giaSanVatPham(it) {
  const v = (it && it.value) || 0;
  const laCongCu = !!(it && it.equip && O_CONG_CU.includes(it.equip.slot));
  const hiem = laCongCu || (it && LOAI_HIEM.includes(it.type));
  return len(hiem ? v * HS_HIEM + CHENH : v + CHENH);
}
