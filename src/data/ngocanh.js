// ============================================================
// DATA — ĐỐN NGỘ CẢNH (Trùng Sinh nghề). Bảng số thuần, không logic, không DOM.
//
// Nghề chạm Lv100 thì mở Trùng Sinh: cấp nghề về 1, phải cày lại từ nguyên liệu cấp thấp.
// Mỗi lần Trùng Sinh nhận DIEM_MOI_LAN điểm, tiêu vào bảng dưới đây. Nút đã mua giữ VĨNH VIỄN,
// Trùng Sinh lần sau không mất.
//
// ⚠ MỘT KHUNG DÙNG CHUNG CHO CẢ MƯỜI NGHỀ. Chín ô y hệt nhau, chỉ khác tên nghề trong câu chữ.
//   Làm mười bảng riêng thì mỗi lần chỉnh số phải sửa mười chỗ, và không ai cân bằng nổi.
// ============================================================

export const TRUNG_SINH_MAX = 6;      // trùng sinh tối đa 6 lần mỗi nghề
export const DIEM_MOI_LAN = 3;        // mỗi lần được 3 điểm  ->  tổng 18
export const DIEM_TRAN = TRUNG_SINH_MAX * DIEM_MOI_LAN;

// `gia` = điểm cho MỖI bậc. `max` = số bậc.
// ⚠ Mua hết bảng cần 31 điểm mà chỉ có 18 — CỐ Ý. Không chọn được hết thì mỗi người một hướng.
export const NGO_CANH_NUT = [
  // ---------- NHÁNH MỘC: lấy được nhiều hơn ----------
  { id: 'luongDoan', nhanh: 'moc', ten: 'Nhất Đao Lưỡng Đoạn', max: 3, gia: 1,
    eff: 'Tăng 15% tỉ lệ nhân đôi vật phẩm khai thác.', khoa: 'nhanDoiPct', moiBac: 15 },
  { id: 'thanhKim', nhanh: 'moc', ten: 'Điểm Mộc Thành Kim', max: 2, gia: 2,
    eff: 'Tăng 8% tỉ lệ khai thác ra tài nguyên cao hơn 1 bậc.', khoa: 'vuotBacPct', moiBac: 8 },
  { id: 'coThu', nhanh: 'moc', ten: 'Cửu Chuyển Đại Thành', max: 1, gia: 4,
    eff: 'Tăng 30% sản lượng khi cấp nghề đạt 100.', khoa: 'daiThanhPct', moiBac: 30,
    canNut: 'luongDoan' },   // phải mua đủ 3 bậc Nhất Đao Lưỡng Đoạn

  // ---------- NHÁNH TỐC: cày lại nhanh hơn ----------
  // Bậc KHÔNG đổi %, chỉ nới ngưỡng cấp được hưởng: 50 -> 75 -> 100.
  { id: 'thucLo', nhanh: 'toc', ten: 'Thục Lộ', max: 3, gia: 1,
    eff: 'Tăng 25% EXP khi cấp nghề dưới {nguong}.', khoa: 'thucLoPct', moiBac: 0,
    pct: 25, nguong: [50, 75, 100] },
  { id: 'thuThuc', nhanh: 'toc', ten: 'Thủ Thục', max: 3, gia: 1,
    eff: 'Tăng 10% tốc độ khai thác.', khoa: 'tocPct', moiBac: 10 },
  { id: 'cuuNghiep', nhanh: 'toc', ten: 'Cựu Nghiệp', max: 2, gia: 2,
    eff: 'Giảm yêu cầu cấp của mọi việc xuống 15 cấp.', khoa: 'giamCap', moiBac: 15 },

  // ---------- NHÁNH ĐẠO: bớt phiền khi reset ----------
  { id: 'nhiDung', nhanh: 'dao', ten: 'Nhất Tâm Nhị Dụng', max: 2, gia: 2,
    eff: 'Tăng thời gian làm nghề tối đa thêm 3 tiếng.', khoa: 'tranGio', moiBac: 3 },
  { id: 'voCau', nhanh: 'dao', ten: 'Vô Câu Địa Giới', max: 1, gia: 2,
    eff: 'Làm được mọi việc của nghề ở bất kỳ vùng nào.', khoa: 'boKhoaVung', moiBac: 1 },
  { id: 'truyenThua', nhanh: 'dao', ten: 'Truyền Thừa', max: 2, gia: 3,
    eff: 'Tăng 15% EXP mọi nghề khác.', khoa: 'ngheKhacPct', moiBac: 15 },
];

export const NGO_CANH_BY_ID = Object.fromEntries(NGO_CANH_NUT.map((n) => [n.id, n]));

export const NHANH = {
  moc: { ten: 'Nhánh Mộc', mo: 'lấy được nhiều hơn', mau: '#34d399' },
  toc: { ten: 'Nhánh Tốc', mo: 'cày lại nhanh hơn', mau: '#60a5fa' },
  dao: { ten: 'Nhánh Đạo', mo: 'bớt phiền khi reset', mau: '#f5b942' },
};

/** Tổng điểm cần để mua trọn bảng — tính từ data, đừng gõ tay. */
export const DIEM_MUA_HET = NGO_CANH_NUT.reduce((s, n) => s + n.gia * n.max, 0);

/** Câu hiệu lực của một nút ở bậc `bac` (0 = chưa mua, hiện câu của bậc 1). */
export function nutEffText(nut, bac) {
  if (!nut.nguong) return nut.eff;
  const i = Math.min(Math.max(1, bac) , nut.nguong.length) - 1;
  return nut.eff.replace('{nguong}', nut.nguong[i]);
}
