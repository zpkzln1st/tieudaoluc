// ============================================================
// DATA — THỈNH KINH (docs/THIET_KE_THINH_KINH.md)
// ============================================================
// Phái một Hộ Kinh Sứ cưỡi mây áp tải kinh thư về Tàng Kinh Các. Chuyến chạy nền theo giờ máy chủ.
//
// ⚠⚠ TÊN ĐÃ GREP SẠCH TRƯỚC KHI ĐẶT. `Tiêu Cục` KHÔNG dùng được — đã là đuôi tên Bang Phái trong
//    `engine/bangphai.js`. `Vân Lộ` vướng linh thảo `vanLoChi`. `Bạch Lộc` · `Huyền Quy` ·
//    `Cửu Thiên` đều đã có chủ. Năm tên dưới đây chưa xuất hiện ở đâu trong kho.
//
// ⛔ KHÔNG bê Đường Tăng · Bạch Long Mã · Trư Bát Giới của game tham khảo sang. Tiêu Dao Lục là
//    võ hiệp huyền huyễn, không có nhân vật Tây Du nào; đặt Trư Bát Giới cạnh Hỏa Lân Yêu Vương là
//    hai thế giới đâm nhau. Giữ nguyên bố cục NĂM Ô, chỉ đổi danh tính.

/** Trần cấp của một Hộ Kinh Sứ. */
export const TK_CAP_TRAN = 10;
/** EXP một chuyến trọn vẹn. Bị cướp KHÔNG trừ EXP. */
export const TK_EXP_CHUYEN = 100;
/** Mỗi cấp cộng thêm ngần này vào thưởng. */
export const TK_MOI_CAP = 0.08;

/** Lượt mỗi ngày. */
export const TK_LUOT = { thinh: 3, cuop: 5, hoVe: 2 };

/** Số lần một chuyến chịu bị cướp, và phần Bạc mất mỗi lần. */
export const TK_CUOP_TOI_DA = 4;
export const TK_CUOP_MAT = 0.12;

/**
 * Xác suất MỖI CỬA ẢI thành một lần bị cướp. Chủ dự án chốt **0,50** (2026-08-27).
 * Một chuyến đi qua `TK_CUOP_TOI_DA − số hộ vệ` cửa ải, rải đều trên hành trình.
 *
 * ⚠⚠ CON SỐ NÀY THẾ GIỚI ĐÃ TỰ QUẢNG CÁO TRƯỚC. Mỗi đoàn bot trên Đường mây hiện
 *    `daBiCuop = hash % (TK_CUOP_TOI_DA + 1)`, tức rải đều 0–4, trung bình **2 trên 4 cửa**.
 *    Đặt tỉ lệ khác 0,50 là bảng tin của đoàn bot nói một đằng, chuyến của mình một nẻo.
 *
 * Số đo (`_do_thinhkinh_bicuop.mjs`, tính chính xác trên cả 125 tổ hợp ba chuyến một ngày):
 *   không hộ vệ : mất 5.674 Bạc/ngày = **24,0%** thu nhập = 1,04 giờ cày
 *   2 hộ vệ dồn : mất 3.835 Bạc/ngày = 16,2%
 *   Hai hộ vệ giữ được 1.839 Bạc/ngày — đó là giá của một suất đệ tử Tông Môn.
 *   Đối chiếu: đi CƯỚP bot được 4.823 Bạc/ngày. Biết cử hộ vệ thì còn dương, không cử thì âm
 *   hơn phần cướp được. Chịu khó thì có lời — đúng hình dạng cần.
 *   Ca xấu nhất: mất 48% Bạc của chuyến, xác suất 6,25% khi không hộ vệ.
 *
 * ⛔ ĐỪNG cho tỉ lệ chạy theo bậc. Bảng dưới đã chốt *"bậc càng cao: chuyến NGẮN HƠN mà thưởng
 *    LỚN HƠN, hai vế cùng chiều là thứ làm người chơi muốn bấm Làm Mới"*. Bậc cao bị nhòm nhiều
 *    hơn là thêm một vế NGƯỢC CHIỀU, làm loãng đúng chủ ý đó.
 */
export const TK_CUOP_TI_LE = 0.50;

/** Làm Mới: lần đầu mỗi lượt miễn phí, từ lần hai tốn ngần này Nguyên Bảo. */
export const TK_LAM_MOI_GIA = 20;

/** Cướp của đoàn khác: phần thưởng chuyến của họ mà mình lấy được. */
export const TK_CUOP_AN = 0.09;
/** Kẹp hệ số chênh cấp — cấp mục tiêu càng thấp, cướp được càng ít. */
export const TK_CUOP_KEP = [0.3, 1.0];

// ============================================================
// NĂM HỘ KINH SỨ
// ============================================================
// ⚠⚠ `ti` là TRỌNG SỐ BỐC, không phải phần trăm gõ tay. Gõ phần trăm thì sửa một dòng là tổng
//    lệch 100% mà không ai thấy; để trọng số thì `tkBocSu` tự chia cho tổng.
// ⚠ Bậc càng cao: chuyến NGẮN HƠN mà thưởng LỚN HƠN. Hai vế cùng chiều là thứ làm người chơi muốn
//   bấm Làm Mới.
//
// ⚠⚠ NEO VÀO KỲ VỌNG MỘT NGÀY, KHÔNG NEO VÀO BẠC/GIỜ. Bảng đầu tiên tôi viết lấy Bạc/giờ làm mốc
//    rồi kết luận "hơn gấp đôi mức cày" — đo lại thì Bạch Trạch ra **600.000 Bạc/giờ**, gấp 110
//    lần. Bạc/giờ là thước SAI cho màn này: chuyến chỉ 15–30 phút và mỗi ngày đúng ba lượt, nên
//    thứ có thật là TỔNG MỘT NGÀY.
// Số đo của bảng dưới (`_check_thinhkinh` mục E tính lại):
//   kỳ vọng một lượt 7.880 Bạc · ba lượt 23.640 Bạc/ngày = **4,3 giờ cày** ở mức cuối game (5.468).
//   Cấp 10 (×1,72) lên 40.661 Bạc/ngày = 7,4 giờ. Ba lượt Bạch Trạch cấp 10 (rất hiếm) = 49 giờ.
//   Một tháng đều đặn = 709.200 Bạc = 0,71 món Cực Hiếm cấp 100 — một tháng chưa mua nổi một món.
// ⛔ Bảng cũ 6.000/15.000/34.000/72.000/150.000 cho 12,6 giờ cày MỖI NGÀY, và 142 giờ ở ca xấu
//    nhất. Bảy ngày là bằng cả hành trình 577 giờ lên cấp 100. Đó là máy in Bạc, đã hạ ×0,35.
export const TK_SU = [
  { id: 'hksThanhNguu', ten: 'Thanh Ngưu',  bac: 1, ti: 44, phut: 30, bac_: 2000,  honThach: 4,  mau: '#7f9a7a' },
  { id: 'hksThachLan',  ten: 'Thạch Lân',   bac: 2, ti: 28, phut: 26, bac_: 5000,  honThach: 9,  mau: '#a89070' },
  { id: 'hksTuyetVien', ten: 'Tuyết Viên',  bac: 3, ti: 17, phut: 22, bac_: 12000, honThach: 18, mau: '#8fc6dd' },
  { id: 'hksDangXa',    ten: 'Đằng Xà',     bac: 4, ti: 8,  phut: 18, bac_: 25000, honThach: 34, mau: '#a882e0' },
  { id: 'hksBachTrach', ten: 'Bạch Trạch',  bac: 5, ti: 3,  phut: 15, bac_: 52000, honThach: 70, mau: '#e8c76a' },
];

export const TK_SU_BY_ID = Object.fromEntries(TK_SU.map((s) => [s.id, s]));
export const TK_TONG_TI = TK_SU.reduce((t, s) => t + s.ti, 0);

/** Art của một Hộ Kinh Sứ. Cùng mã với `id` — chưa có tệp thì `ico()` tự rơi về emoji. */
export const TK_ART_TRONG = 'daiMayTrong';

/** EXP cần để đi từ cấp `cap` lên cấp sau. */
export function tkExpLenCap(cap) { return 400 + 100 * Math.max(1, Math.floor(cap || 1)); }

/** Hệ số thưởng theo cấp Hộ Kinh Sứ. */
export function tkHeSoCap(cap) {
  const c = Math.max(1, Math.min(TK_CAP_TRAN, Math.floor(cap || 1)));
  return 1 + TK_MOI_CAP * (c - 1);
}

/** Thưởng trọn vẹn của một chuyến, chưa trừ phần bị cướp. */
export function tkThuong(suId, cap) {
  const s = TK_SU_BY_ID[suId];
  if (!s) return { bac: 0, honThach: 0 };
  const h = tkHeSoCap(cap);
  return { bac: Math.round(s.bac_ * h), honThach: Math.round(s.honThach * h) };
}

/**
 * Bốc một Hộ Kinh Sứ theo trọng số.
 * ⚠⚠ `r` phải lấy từ miền RNG RIÊNG `tkSu`. Dùng chung miền với đường bốc khác là trần chống gian
 *    lận đếm nhầm — cùng lỗi đã vá ở đan Đan Điền.
 */
export function tkBocSu(r) {
  let x = (Number(r) || 0) * TK_TONG_TI;
  for (const s of TK_SU) { x -= s.ti; if (x < 0) return s.id; }
  return TK_SU[0].id;
}
