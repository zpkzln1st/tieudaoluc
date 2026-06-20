// ============================================================
// DATA — Huy Hiệu (badge). Mở khi KĨ NĂNG đạt Lv100 (Đại Thành). Thuần vinh danh, không bonus.
//   art: images/ui/huyhieu/<skillId>.webp (fallback emoji của kĩ năng).
// ============================================================
export const BADGES = [
  { skillId: 'chienDau',   name: 'Võ Đạo Tông Sư',     icon: '⚔️', desc: 'Chiến Đấu đạt cảnh giới đại thành — võ học thông thần.' },
  { skillId: 'phatMoc',    name: 'Phủ Thánh',           icon: '🪓', desc: 'Đốn Củi đăng phong tạo cực — một phủ khai sơn.' },
  { skillId: 'thaiKhoang', name: 'Khoáng Thần',         icon: '⛏️', desc: 'Đào Khoáng thấu địa tầm long — moi tận kim nguyên.' },
  { skillId: 'dieuNgu',    name: 'Ngư Ẩn Tông Sư',      icon: '🎣', desc: 'Câu Cá đạt thần cảnh — buông câu kinh động thuỷ cung.' },
  { skillId: 'daLuyen',    name: 'Luyện Kim Thánh Thủ', icon: '🔥', desc: 'Luyện Kim hoả hầu viên mãn — quặng thô thành tinh.' },
  { skillId: 'phanhNham',  name: 'Ngự Trù',             icon: '🍳', desc: 'Nấu Ăn đạt thần thủ — sơn hào hải vị tuỳ tâm.' },
  { skillId: 'luyenDan',   name: 'Đan Vương',           icon: '⚗️', desc: 'Luyện Đan đăng đỉnh — một lò nên tiên đan.' },
  { skillId: 'daTao',      name: 'Thần Binh Tượng',     icon: '🔨', desc: 'Rèn Đúc thông huyền — vạn lần tôi luyện thành thần binh.' },
  { skillId: 'toaQuan',    name: 'Thiền Tâm Đại Sư',    icon: '🧘', desc: 'Thiền Định nhập định viên mãn — tâm như chỉ thuỷ.' },
  { skillId: 'doanhTao',   name: 'Lỗ Ban Tái Thế',      icon: '🏗️', desc: 'Xây Dựng đạt tuyệt kĩ — lầu son gác tía dựng trong tay.' },
];
export const BADGE_LV = 100;   // mốc cấp kĩ năng để mở Huy Hiệu
