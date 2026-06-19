// ============================================================
// DATA — Cấu trúc điều hướng sidebar (kiểu IdleMMO, gom nhóm).
// group.skills = true -> render danh sách 9 kỹ năng.
// 'soon: true' -> trang placeholder "đang phát triển".
// ============================================================
export const NAV = [
  { title: 'Nhân Vật', items: [
    { view: 'profile',   name: 'Hồ Sơ',   gloss: 'Profile',   icon: '👤' },
    { view: 'trangbi',   name: 'Trang Bị', gloss: 'Equipment', icon: '🛡️' },
    { view: 'inventory', name: 'Hành Lý', gloss: 'Inventory', icon: '🎒' },
    { view: 'tangkinhcac',name: 'Tàng Kinh Các', gloss: 'Skill Library', icon: '📖' },
    { view: 'map',       name: 'Bản Đồ',  gloss: 'Map',       icon: '🗺️' },
    { view: 'nhiemVu',   name: 'Nhiệm Vụ', gloss: 'Quests',   icon: '📜' },
    { view: 'phiCapDai', name: 'Phi Cáp Đài', gloss: 'Notifications', icon: '🔔' },
  ] },
  { title: 'Kỹ Năng', skills: true },
  { title: 'Chiến Đấu', items: [
    { view: 'combat',     name: 'Chiến Đấu',     gloss: 'Battle',        icon: '⚔️' },
    { view: 'dungeon',    name: 'Bí Cảnh',       gloss: 'Dungeon',       icon: '🏛️' },
    { view: 'worldboss',  name: 'Yêu Vương',     gloss: 'World Boss',     icon: '🐲' },
  ] },
  { title: 'Linh Thú', items: [
    { view: 'pets', name: 'Linh Thú', gloss: 'Pets', icon: '🐾' },
  ] },
  { title: 'Giang Hồ', items: [
    { view: 'phongVanBang', name: 'Phong Vân Bảng', gloss: 'Leaderboard', icon: '🏆' },
  ] },
  { title: 'Giao Thương', items: [
    { view: 'merchant', name: 'Thương Điếm',    gloss: 'Merchant', icon: '🏪' },
    { view: 'market',   name: 'Sàn Giao Dịch',  gloss: 'Market',   icon: '⚖️', soon: true },
  ] },
  { title: 'Khác', items: [
    { view: 'guild',      name: 'Bang Phái',  gloss: 'Guild',      icon: '🏯', soon: true },
    { view: 'tavern',     name: 'Tửu Lâu',    gloss: 'Tavern',     icon: '🍶', soon: true },
    { view: 'collection', name: 'Vạn Vật Phổ', gloss: 'Collection', icon: '📖' },
  ] },
];

// Tên hiển thị cho mỗi view (cho tiêu đề trang placeholder)
export const VIEW_NAMES = {
  profile: 'Hồ Sơ', trangbi: 'Trang Bị', inventory: 'Hành Lý', map: 'Bản Đồ', nhiemVu: 'Nhiệm Vụ',
  combat: 'Chiến Đấu', tangkinhcac: 'Tàng Kinh Các', dungeon: 'Bí Cảnh', worldboss: 'Yêu Vương',
  pets: 'Linh Thú', phongVanBang: 'Phong Vân Bảng', merchant: 'Thương Điếm', market: 'Sàn Giao Dịch',
  guild: 'Bang Phái', tavern: 'Tửu Lâu', collection: 'Vạn Vật Phổ',
};
