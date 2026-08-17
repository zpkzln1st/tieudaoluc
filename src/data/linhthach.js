// ============================================================
// DATA — Linh Thạch (Essence Crystal): buff cho kỹ năng gather/craft.
// DÙNG CHUNG mọi nghề (KHÔNG còn field skillId — giữ per-skill sẽ thành 10 nghề × 9 viên = 90 vật phẩm).
//
// Lắp vào ô Linh Thạch của modal hành động. TIÊU HAO 1 viên khi bắt đầu, sau đó cứ
// LT_COVER_MS thời gian hoạt động lại đốt tiếp 1 viên CÙNG LOẠI. Hết loại đang lắp →
// buff tắt, hoạt động CHẠY TIẾP bình thường (không tự đổi sang loại khác trong kho).
//
// 3 dòng × 3 bậc:
//   expPct   — +% EXP nghề (Tụ Khí Thạch)
//   effPct   — +% Hiệu Suất, CỘNG vào mẫu số cycleMs (Thôi Vận Thạch)
//   yieldPct — % cơ hội nhân đôi sản vật (Bội Sản Thạch) — craftOnly
//
// craftOnly: chỉ áp cho hành động CÓ nguyên liệu đầu vào VÀ sản phẩm KHÔNG phải trang bị.
//   Luật này nằm ở engine (advance) chứ không phải danh sách nghề — vì lỗ hổng nằm ở ACTION:
//   doanhTao là nghề craft nhưng có datSet/cat không tốn liệu, còn daTao ra gear instance
//   (nhân đôi = thêm một lần roll affix miễn phí, phá loot-hunt).
//
// Combat KHÔNG dùng Linh Thạch (combat buff bằng Đan — hệ riêng).
// ============================================================

// Một viên phủ bao nhiêu thời gian HOẠT ĐỘNG.
// CHỐT: 20 phút một viên, tức mười viên gánh 3,3 giờ cày. Chín loại linh thạch chia ba dòng.
export const LT_COVER_MS = 20 * 60 * 1000;

export const LINH_THACH = {
  // --- TỤ KHÍ THẠCH — +% EXP nghề ---
  // Bậc Sơ GIỮ id cũ 'tieuPhuLinhThach': save cũ tự khớp, tồn kho tự nâng vai, tái dùng luôn art.
  tieuPhuLinhThach:  { itemId: 'tieuPhuLinhThach',  expPct: 10, effPct: 0, yieldPct: 0 },
  tuKhiThachTrung:   { itemId: 'tuKhiThachTrung',   expPct: 18, effPct: 0, yieldPct: 0 },
  tuKhiThachThuong:  { itemId: 'tuKhiThachThuong',  expPct: 25, effPct: 0, yieldPct: 0 },
  // --- THÔI VẬN THẠCH — +% Hiệu Suất ---
  thoiVanThachSo:    { itemId: 'thoiVanThachSo',    expPct: 0, effPct: 2, yieldPct: 0 },
  thoiVanThachTrung: { itemId: 'thoiVanThachTrung', expPct: 0, effPct: 5, yieldPct: 0 },
  thoiVanThachThuong:{ itemId: 'thoiVanThachThuong',expPct: 0, effPct: 8, yieldPct: 0 },
  // --- BỘI SẢN THẠCH — % nhân đôi sản vật (craftOnly) ---
  boiSanThachSo:     { itemId: 'boiSanThachSo',     expPct: 0, effPct: 0, yieldPct: 5,  craftOnly: true },
  boiSanThachTrung:  { itemId: 'boiSanThachTrung',  expPct: 0, effPct: 0, yieldPct: 9,  craftOnly: true },
  boiSanThachThuong: { itemId: 'boiSanThachThuong', expPct: 0, effPct: 0, yieldPct: 14, craftOnly: true },
};

// Nghề CHẾ TÁC — chỉ các nghề này mới thấy Bội Sản Thạch trong picker.
// (Rào thật nằm ở engine theo action; danh sách này chỉ để KHỎI hiện lựa chọn vô dụng.)
export const CRAFT_SKILLS = ['daLuyen', 'phanhNham', 'luyenDan', 'daTao', 'doanhTao'];

// Danh sách viên lắp được cho 1 skill (UI picker). Dùng chung mọi nghề; Bội Sản lọc theo craftOnly.
export function linhThachForSkill(skillId) {
  const craft = CRAFT_SKILLS.indexOf(skillId) >= 0;
  return Object.values(LINH_THACH).filter((d) => !d.craftOnly || craft);
}
