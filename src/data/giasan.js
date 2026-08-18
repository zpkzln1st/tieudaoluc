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
//
// ⚠ Mốc cắt băng giá đan lấy THẲNG từ `dandien.js` — gõ lại số 5 ở đây là hai bản lệch nhau lúc
//   nào không biết. Nới `DD_PHAM_NAU_TOI` là băng giá tự dịch theo.
import { DD_PHAM_NAU_TOI } from './dandien.js';
export { DD_PHAM_NAU_TOI };   // bộ sinh bảng giá đọc lại qua đây, khỏi import hai nguồn

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

// ============================================================
// ĐAN ĐAN ĐIỀN — HAI BĂNG GIÁ, cắt đúng chỗ nấu / rơi
// ============================================================
// Phẩm 1–5 nấu ở Dược Lư: 0,06–0,25 giờ máy chạy một viên. Chúng đi theo nhánh mặc định `value + 3`.
// Phẩm 6–9 KHÔNG có công thức, chỉ rơi 6% mỗi lượt Yêu Vương · Bí Cảnh rồi bốc 1 trong 3 nhánh:
//   37,5 · 41,7 · 47,2 · 50 giờ máy chạy cho MỘT viên (đo bằng `_covua_wip/_do_gio_dan.mjs`).
// ⚠⚠ KHÔNG hệ số nào bắc qua được vách này. Từ phẩm 5 lên phẩm 6, công cày gấp 150 lần còn `value`
//    chỉ nhích 1,44 lần. Ép cả chín phẩm về một hệ số là hoặc dìm khúc rơi, hoặc thổi khúc nấu.
// ⚠ Hệ số 80 = `HS_PHAM.tinhPham` sẵn có, không phải số bịa: một viên đan rơi ngang một trang bị
//   HIẾM cùng giá NPC. Sàn ra 56–95% công cày thật — luôn dưới 1 nên vẫn còn lý do để bán.
// ⛔ ĐỪNG lấy `HS_PHAM` theo `quality` của chính viên đan. Phẩm 9 mang mã `coBan` (×1160) sẽ ra
//    3,76 triệu Bạc cho một viên tốn 50 giờ — nước đi trông hợp lý nhất và sai nặng nhất.
export const HS_DAN_ROI = HS_PHAM.tinhPham;   // 80

// ============================================================
// PHÂN LOẠI — MỘT CHỖ DUY NHẤT
// ============================================================
// ⚠⚠ `_sinh_bang_gia.mjs` trước đây giữ BẢN CHÉP riêng của ba phép này, và bảng `san_gia_vp` trên
//    máy chủ sinh ra từ bản chép đó. Bản chép nhận dạng công cụ bằng regex dò chuỗi chứ không so
//    đúng ô, nên hai bên có thể xếp cùng một món vào hai nhóm giá khác nhau mà không ai thấy.
export function laCongCu(it) { return !!(it && it.equip && O_CONG_CU.includes(it.equip.slot)); }

/** Trang bị = có ô mặc VÀ có cấp món. Công cụ không tính — công cụ xếp chồng. */
export function laTrangBi(it) { return !!(it && it.equip && it.equip.itemLv && !laCongCu(it)); }

/** Mọi món XẾP CHỒNG có giá. Đây đúng là danh sách dòng của bảng `san_gia_vp`. */
export function dsXepChong(ITEMS) {
  return Object.values(ITEMS || {}).filter((it) => it && it.value > 0 && !laTrangBi(it));
}

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
  // ⚠ Đan Đan Điền xét TRƯỚC nhánh hàng hiếm: phẩm quyết định băng giá, không phải `type`.
  if (it && it.type === 'danDien') {
    const roi = (Number(it.pham) || 0) > DD_PHAM_NAU_TOI;
    return len(v * (roi ? HS_DAN_ROI : 1) + CHENH);
  }
  const hiem = laCongCu(it) || (it && LOAI_HIEM.includes(it.type));
  return len(hiem ? v * HS_HIEM + CHENH : v + CHENH);
}
