// ============================================================
// DATA — SÀN GIAO DỊCH (Giao Dịch Hành). Bảng số thuần.
//
// Bản thiết kế gốc: docs/NOI_DUNG_GAME.md mục H2 (sổ lệnh hai chiều, thuế bán 15%)
// + docs/THIET_KE_BOT_WORLD.md §7 (van cân bằng kinh tế bot, ghi sẵn từ 2026-06).
//
// ⚠ USER CHỐT 2026-07-29: bán MỌI THỨ, chặn bằng GIÁ và THUẾ chứ không cấm loại.
//    Nghĩa là mọi van dưới đây phải làm việc thật, không được để trang trí.
// ⚠ Kinh tế chính đang cân ở time-to-100 ~577 giờ. Sàn KHÔNG được thành đường tắt:
//    mua nguyên liệu bằng Bạc luôn đắt hơn tự cày, nhờ chênh lệch mua/bán + thuế.
// ============================================================

/** Một phiên sàn — hết phiên thì lệnh của bot đổi lứa. */
export const PHIEN_MS = 20 * 60 * 1000;

/** Thuế người bán chịu, trừ thẳng vào tiền về túi (sink Bạc). */
export const THUE_BAN = 0.15;

/**
 * Chênh lệch quanh giá tham chiếu. Đây là VAN CHÍNH:
 *   · người chơi MUA của bot  -> trả  giá × (1 + MUA)
 *   · người chơi BÁN cho bot  -> nhận giá × (1 − BAN) rồi mới trừ thuế
 * Vòng mua-rồi-bán-lại luôn lỗ, nên không đầu cơ qua lại được.
 */
export const CHENH_MUA = 0.18;
export const CHENH_BAN = 0.12;

/**
 * Biên dao động giá theo phiên (mean-revert quanh 1,0). Giá lên xuống để sàn có
 * nhịp, nhưng không đủ rộng để "canh sóng" thắng nổi chênh lệch mua/bán ở trên.
 */
export const BIEN_GIA = 0.22;

/** Ngân sách MUA của bot trong một phiên, theo Bạc. Hết là hết, không in thêm. */
export const NGAN_SACH_PHIEN = 240000;

/**
 * Co giãn giá: đổ càng nhiều một món trong phiên thì giá món đó càng tụt.
 * Cứ mỗi `CO_GIAN_MOC` món đã bán trong phiên, giá bán tụt `CO_GIAN_BUOC`,
 * chạm sàn `CO_GIAN_DAY`. Đây là van chặn cày-một-món-rồi-xả-vô-hạn.
 */
export const CO_GIAN_MOC = 40;
export const CO_GIAN_BUOC = 0.06;
export const CO_GIAN_DAY = 0.35;

/** Số lệnh bot hiện mỗi phiên. */
export const RAO_N = 14;   // bot rao bán
export const MUA_N = 10;   // bot đặt thu mua

/** Trần lệnh của người chơi cùng lúc. */
export const LENH_TA_TRAN = 8;

/** Giữ tối đa bấy nhiêu dòng nhật ký giao dịch. */
export const NHAT_KY_MAX = 60;

/** Lệnh của người chơi tự hết hạn sau bấy lâu (không treo mãi làm loãng sàn). */
export const HAN_LENH_MS = 24 * 60 * 60 * 1000;

/**
 * Hệ số giá theo phẩm chất. `value` trong items.js đã phản ánh phần lớn, đây chỉ
 * là lớp phụ để đồ hiếm không bị định giá ngang đồ thường khi cùng `value`.
 */
export const HE_SO_PHAM = {
  phamPham: 1, luongPham: 1.05, tinhPham: 1.12, tuyetPham: 1.22,
  truyenThe: 1.35, thanPham: 1.5, coBan: 1.7,
};

/** Nhóm hàng để lọc trên sàn. Khớp `type` của items.js. */
export const NHOM_SAN = [
  { id: 'all', ten: 'Tất Cả', types: null },
  { id: 'lieu', ten: 'Nguyên Liệu Thô', types: ['go', 'khoang', 'ca', 'thaoDuoc'] },
  { id: 'cheBien', ten: 'Liệu Đã Luyện', types: ['dinh', 'vatlieu'] },
  { id: 'dungPham', ten: 'Đan Dược & Món Ăn', types: ['dan', 'monan', 'moi'] },
  { id: 'trangbi', ten: 'Trang Bị', types: ['trangbi'] },
  { id: 'doPho', ten: 'Đồ Phổ', types: ['doPho'] },
  { id: 'khac', ten: 'Khác', types: ['khac', 'trung'] },
];
