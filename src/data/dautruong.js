// ============================================================
// DATA — ĐẤU TRƯỜNG (mục 5.1 lộ trình, cờ `dauTruong`).
//
// PvP KHÔNG ĐỒNG BỘ: đánh với BẢN CHỤP bộ chiến đấu của người khác, không cần hai máy cùng lúc.
// Bảng số THUẦN, không import gì — engine và bài kiểm cùng đọc một chỗ.
//
// ⚠⚠ Đấu Điểm do MÁY NGƯỜI CHƠI khai (cùng lớp với `chien_luc` đã khai từ đợt A2). Vì vậy
//    Đấu Trường CHỈ trả Bạc và Đấu Điểm — KHÔNG vật phẩm, KHÔNG chỉ số, KHÔNG mở khoá.
//    Xem khối cảnh báo cuối docs/SQL_DAU_TRUONG.sql.
// ============================================================

/** Số trận đánh được mỗi ngày. */
export const DT_LUOT_NGAY = 5;
/** Đấu Điểm khởi đầu của mọi người. */
export const DT_DIEM_NEN = 1000;
/** Hệ số Elo: thắng người ngang cơ được +12, thắng người trên cơ được nhiều hơn. */
export const DT_K = 24;
/** Đấu Điểm không bao giờ tụt xuống dưới mức này — thua liên tiếp vẫn còn đường đánh tiếp. */
export const DT_DIEM_SAN = 600;
/** Sử giữ lại mấy trận gần nhất. */
export const DT_SU_CAP = 20;
/** Bạc thưởng: nền + cấp Chiến Đấu nhân hệ số. Thua vẫn có, ít. */
export const DT_BAC_NEN = 300;
export const DT_BAC_MOI_CAP = 12;
export const DT_BAC_KHI_THUA = 0.25;
/** Trần số nhịp mô phỏng một trận — chặn vòng lặp vô hạn khi hai bên đều không hạ nổi nhau. */
export const DT_TRAN_VONG = 600;
/**
 * Dải ghép cặp: chỉ bày người có Đấu Điểm lệch trong khoảng này. Giang hồ còn ít người thì
 * nới dần ra, nhưng KHÔNG bỏ hẳn — đánh người hơn mình 900 điểm là trận vô nghĩa cả hai bên.
 */
export const DT_DAI_GHEP = 250;
/** Bày nhiều nhất chừng này đối thủ một lần. */
export const DT_SO_DOI_THU = 8;

/**
 * Bậc Đấu Trường theo Đấu Điểm. Nhãn nằm ở data, không gõ tay trong giao diện.
 * ⚠ Xếp GIẢM DẦN và bậc cuối bắt mọi số — `find` lấy bậc đầu tiên khớp.
 */
export const DT_BAC = [
  { tu: 1600, ma: 'thanh', ten: 'Thánh Thủ', mau: '#f5b942' },
  { tu: 1400, ma: 'tuyet', ten: 'Tuyệt Đỉnh', mau: '#e879f9' },
  { tu: 1200, ma: 'caothu', ten: 'Cao Thủ', mau: '#a78bfa' },
  { tu: 1000, ma: 'hao', ten: 'Hào Kiệt', mau: '#38bdf8' },
  { tu: 800, ma: 'nhap', ten: 'Nhập Môn', mau: '#5dcaa5' },
  { tu: 0, ma: 'so', ten: 'Sơ Học', mau: '#94a3b8' },
];
