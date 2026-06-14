// ============================================================
// DATA — Phường Thị (NPC bán hàng). Phase 1: 1 merchant chung.
// Mua: giá cố định (Bạc). Bán: theo item.value.
// ============================================================
export const MERCHANT = {
  id: 'trieuLaoBan', name: 'Triệu Lão Bản', gloss: 'General Merchant', icon: '🏪',
  quote: 'Khách quan cần gì? Hàng tốt giá phải chăng — bán đồ cũng được giá!',
};

// Danh sách hàng bán (nguyên liệu thô để feed chế tạo)
export const SHOP_BUY = [
  { itemId: 'hacThan',     price: 10 },
  { itemId: 'tungMoc',     price: 6 },
  { itemId: 'tichKhoang',  price: 8 },
  { itemId: 'dongKhoang',  price: 14 },
  { itemId: 'thietKhoang', price: 22 },
  { itemId: 'caTuyet',     price: 6 },
  { itemId: 'datSet',      price: 5 },
];
