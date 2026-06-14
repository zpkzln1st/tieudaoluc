// ============================================================
// DATA — Linh Thạch (Essence Crystal): buff PER-SKILL cho kỹ năng gather/craft.
// Mỗi skill 1 "family" riêng. Lắp vào ô Linh Thạch của modal hành động → khi
// Bắt Đầu / Làm Mới một phiên sẽ TIÊU HAO 1 viên và áp buff cho cả phiên:
//   expPct: +% EXP kỹ năng (nhân vào EXP mỗi vòng)
//   effPct: +% Hiệu Suất (giảm thời gian mỗi vòng → nhiều vòng hơn trong cùng thời gian)
// Combat KHÔNG dùng Linh Thạch (combat buff bằng Đan — hệ riêng).
// ============================================================
export const LINH_THACH = {
  // skillId: phải khớp id trong SKILLS. itemId: phải là 1 item trong ITEMS (craft ở Luyện Đan).
  tieuPhuLinhThach:   { itemId: 'tieuPhuLinhThach',   skillId: 'phatMoc',    expPct: 10, effPct: 2 },
  khoangPhuLinhThach: { itemId: 'khoangPhuLinhThach', skillId: 'thaiKhoang', expPct: 10, effPct: 2 },
};

// Danh sách family hợp với 1 skill (UI picker).
export function linhThachForSkill(skillId) {
  return Object.values(LINH_THACH).filter((d) => d.skillId === skillId);
}
