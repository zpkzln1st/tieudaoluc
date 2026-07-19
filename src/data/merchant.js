// ============================================================
// DATA — Thương Điếm (Triệu Lão Bản). 3 gian: Ảnh Đại Diện · Ảnh Bìa · Vật Phẩm.
// Ảnh đại diện/bìa: mua bằng Hồn Thạch (đồng giá). Vật phẩm: Bạc = value × 1.2.
// Bán đồ: thao tác trong Hành Lý (modal chi tiết item).
// ============================================================
export const MERCHANT = {
  id: 'trieuLaoBan', name: 'Triệu Lão Bản', gloss: 'General Merchant', icon: '🏪',
  quote: 'Bảo vật có giá, cơ duyên vô giá. Khách quan đã đến, hà tất không xem?',
};

// Đồng giá mua bằng Hồn Thạch
export const AVATAR_PRICE = 500;   // Ảnh Đại Diện / ảnh
export const COVER_PRICE  = 1000;  // Ảnh Bìa / ảnh

// Gian VẬT PHẨM (mua bằng Bạc = value × 1.2). Nguyên liệu cơ bản bậc 1 + thức ăn bậc 1 + 7 bậc mồi câu.
export const SHOP_MAT  = ['tungMoc', 'hacThan', 'tichKhoang', 'datSet', 'cat', 'thanhNgaiThao'];
export const SHOP_FOOD = ['khaoCaTuyet'];
export const SHOP_BAIT = ['moiHongTrung', 'moiTepDong', 'moiTuuKhuc', 'moiHanTuy', 'moiVanMong', 'moiGiaoLongDan', 'moiThienCau'];
