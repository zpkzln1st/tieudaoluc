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
    { view: 'dongPhu',   name: 'Động Phủ', gloss: 'Homestead', icon: '🏠' },
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
  // Thiên Cơ Các — nhóm RIÊNG cho mini-game (tách khỏi Chiến Đấu). Thêm game mới thì thêm vào đây.
  // `thuGon: true` -> mặc định GẤP LẠI, chỉ mở khi người chơi tự bấm. Nhóm này dài nhất
  // (6 trò) mà lại là nhánh phụ, để mở sẵn thì đẩy mọi nhóm dưới nó rớt khỏi tầm mắt.
  { title: 'Thiên Cơ Các', thuGon: true, items: [
    { view: 'dangTienMong', name: 'Đăng Tiên Mộng', gloss: 'Card Roguelike', icon: '🎴' },
    { view: 'kyTran', name: 'Kỳ Trận', gloss: 'Match-3 Combat', icon: '🀄' },
    { view: 'nguTuKy', name: 'Ngũ Tử Kỳ', gloss: 'Gomoku 3D', icon: '⚫' },
    { view: 'coTuong', name: 'Cờ Tướng', gloss: 'Xiangqi 3D', icon: '♟' },
    { view: 'coVua', name: 'Cờ Vua', gloss: 'Chess 3D', icon: '♛' },
    { view: 'tienLen', name: 'Tiến Lên', gloss: 'Card Game 3D', icon: '🃏' },
  ] },
  { title: 'Linh Thú', items: [
    { view: 'pets', name: 'Linh Thú', gloss: 'Pets', icon: '🐾' },
  ] },
  { title: 'Tông Môn', items: [
    { view: 'tongmon', name: 'Tông Môn', gloss: 'Sect', icon: '⛩️' },
  ] },
  { title: 'Giang Hồ', items: [
    { view: 'phongVanBang', name: 'Phong Vân Bảng', gloss: 'Leaderboard', icon: '🏆' },
  ] },
  { title: 'Giao Thương', items: [
    { view: 'merchant', name: 'Thương Điếm',    gloss: 'Merchant', icon: '🏪' },
    { view: 'market',   name: 'Sàn Giao Dịch',  gloss: 'Market',   icon: '⚖️', soon: true },
  ] },
  { title: 'Khác', items: [
    { view: 'guild',      name: 'Tiên Minh',  gloss: 'Guild',      icon: '🏯' },
    { view: 'tavern',     name: 'Tửu Lâu',    gloss: 'Tavern',     icon: '🍶' },
    { view: 'collection', name: 'Vạn Vật Phổ', gloss: 'Collection', icon: '📖' },
  ] },
];

// Tên hiển thị cho mỗi view (cho tiêu đề trang placeholder)
export const VIEW_NAMES = {
  profile: 'Hồ Sơ', trangbi: 'Trang Bị', inventory: 'Hành Lý', map: 'Bản Đồ', nhiemVu: 'Nhiệm Vụ',
  combat: 'Chiến Đấu', tangkinhcac: 'Tàng Kinh Các', dungeon: 'Bí Cảnh', worldboss: 'Yêu Vương',
  pets: 'Linh Thú', tongmon: 'Tông Môn', phongVanBang: 'Phong Vân Bảng', merchant: 'Thương Điếm', market: 'Sàn Giao Dịch', dangTienMong: 'Đăng Tiên Mộng', dongPhu: 'Động Phủ', kyTran: 'Kỳ Trận', nguTuKy: 'Ngũ Tử Kỳ', coTuong: 'Cờ Tướng', coVua: 'Cờ Vua', tienLen: 'Tiến Lên',
  guild: 'Tiên Minh', tavern: 'Tửu Lâu', collection: 'Vạn Vật Phổ',
};
