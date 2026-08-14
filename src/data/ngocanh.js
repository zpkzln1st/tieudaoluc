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
/**
 * Mỗi lần Trùng Sinh nâng TRẦN CẤP thêm ngần này. Sáu lần: 100 -> 160.
 * ⚠⚠ Phải chạm trần HIỆN TẠI mới Trùng Sinh tiếp được. Sáu vòng cày hết 14.780 giờ một nghề
 *   (nghề nhanh nhất, chưa nhân hệ số nào) — luật cũ trần đứng yên ở 100 chỉ tốn 5.706 giờ.
 * ⚠ Đổi số này thì phải chạy lại `_mockup/_covua_wip/_sinh_sql_tran.mjs`: chốt chống gian lận
 *   tính trần mỗi lần ghi theo tổng đường cong tới trần cao nhất.
 */
export const CAP_MOI_LAN = 10;
export const DIEM_TRAN = TRUNG_SINH_MAX * DIEM_MOI_LAN;

// `gia` = điểm cho MỖI bậc. `max` = số bậc.
// ⚠ Mua hết bảng cần 31 điểm mà chỉ có 18 — CỐ Ý. Không chọn được hết thì mỗi người một hướng.
export const NGO_CANH_NUT = [
  // ---------- NHÁNH MỘC: lấy được nhiều hơn ----------
  { id: 'luongDoan', nhanh: 'moc', art: 'tinvat/phatMoc', ten: 'Nhất Đao Lưỡng Đoạn', max: 3, gia: 1,
    eff: 'Tăng {v}% tỉ lệ nhân đôi vật phẩm khai thác.', khoa: 'nhanDoiPct', moiBac: 15 },
  { id: 'thanhKim', nhanh: 'moc', art: 'tinvat/doanhTao', ten: 'Điểm Mộc Thành Kim', max: 2, gia: 2,
    eff: 'Tăng {v}% tỉ lệ khai thác ra tài nguyên cao hơn 1 bậc.', khoa: 'vuotBacPct', moiBac: 8 },
  { id: 'coThu', nhanh: 'moc', art: 'tinvat/thaiDuoc', ten: 'Cửu Chuyển Đại Thành', max: 1, gia: 4,
    eff: 'Tăng {v}% sản lượng khi cấp nghề đạt 100.', khoa: 'daiThanhPct', moiBac: 30,
    canNut: 'luongDoan' },   // phải mua đủ 3 bậc Nhất Đao Lưỡng Đoạn

  // ---------- NHÁNH TỐC: cày lại nhanh hơn ----------
  // Bậc KHÔNG đổi %, chỉ nới ngưỡng cấp được hưởng: 50 -> 75 -> 100.
  { id: 'thucLo', nhanh: 'toc', art: 'tinvat/thaiKhoang', ten: 'Thục Lộ', max: 3, gia: 1,
    eff: 'Tăng 25% EXP khi cấp nghề dưới {nguong}.', khoa: 'thucLoPct', moiBac: 0,
    pct: 25, nguong: [50, 75, 100] },
  { id: 'thuThuc', nhanh: 'toc', art: 'tinvat/daLuyen', ten: 'Thủ Thục', max: 3, gia: 1,
    eff: 'Tăng {v}% tốc độ khai thác.', khoa: 'tocPct', moiBac: 10 },
  { id: 'cuuNghiep', nhanh: 'toc', art: 'tinvat/phanhNham', ten: 'Cựu Nghiệp', max: 2, gia: 2,
    eff: 'Giảm yêu cầu cấp của mọi việc xuống {v} cấp.', khoa: 'giamCap', moiBac: 15 },

  // ---------- NHÁNH ĐẠO: bớt phiền khi reset ----------
  { id: 'nhiDung', nhanh: 'dao', art: 'tinvat/luyenDan', ten: 'Nhất Tâm Nhị Dụng', max: 2, gia: 2,
    eff: 'Tăng thời gian làm nghề tối đa thêm {v} tiếng.', khoa: 'tranGio', moiBac: 3 },
  { id: 'voCau', nhanh: 'dao', art: 'tinvat/daTao', ten: 'Vô Câu Địa Giới', max: 1, gia: 2,
    eff: 'Làm được mọi việc của nghề ở bất kỳ vùng nào.', khoa: 'boKhoaVung', moiBac: 1 },
  { id: 'truyenThua', nhanh: 'dao', art: 'tinvat/toaQuan', ten: 'Truyền Thừa', max: 2, gia: 3,
    eff: 'Tăng {v}% EXP mọi nghề khác.', khoa: 'ngheKhacPct', moiBac: 15 },
];

export const NGO_CANH_BY_ID = Object.fromEntries(NGO_CANH_NUT.map((n) => [n.id, n]));

export const NHANH = {
  moc: { ten: 'Nhánh Mộc', mo: 'lấy được nhiều hơn', mau: '#34d399' },
  toc: { ten: 'Nhánh Tốc', mo: 'cày lại nhanh hơn', mau: '#60a5fa' },
  dao: { ten: 'Nhánh Đạo', mo: 'bớt phiền khi reset', mau: '#f5b942' },
};

/** Tổng điểm cần để mua trọn bảng — tính từ data, đừng gõ tay. */
export const DIEM_MUA_HET = NGO_CANH_NUT.reduce((s, n) => s + n.gia * n.max, 0);

/**
 * Câu hiệu lực của một nút ở bậc `bac`.
 * ⚠ Trả về SỐ ĐANG CÓ, không phải số mỗi bậc. Mua 3 bậc Nhất Đao Lưỡng Đoạn thì phải đọc ra
 *   "Tăng 45%", không phải "Tăng 15%" — bắt người chơi tự nhân là sai.
 *   Chưa mua (bậc 0) thì hiện số của bậc 1, tức thứ nhận được nếu bỏ điểm vào.
 */
export function nutEffText(nut, bac) {
  const n = Math.max(1, bac || 0);
  if (nut.nguong) {
    const i = Math.min(n, nut.nguong.length) - 1;
    return nut.eff.replace('{nguong}', nut.nguong[i]);
  }
  return nut.eff.replace('{v}', String(nut.moiBac * n));
}
