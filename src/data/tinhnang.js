// ============================================================
// DATA — TÍNH NĂNG: danh sách cờ bật/tắt của cả lộ trình (docs/LO_TRINH_3_NAM.md).
//
// ⚠⚠ ĐÂY LÀ DANH SÁCH CHO PHÉP phía client, và nó phải khớp TỪNG MÃ với ràng buộc
//    `tinh_nang_ma_hop_le` trong docs/SQL_LENH_BAI_9.sql. Gõ sai một mã thì máy chủ từ chối,
//    không âm thầm đẻ ra một cờ lạ không ai đọc. Bài kiểm 43 soi hai đầu.
//
// ⚠⚠ `daDung` = ĐÃ CÓ MÀN NÀO ĐỌC CỜ NÀY CHƯA. Không phải chú thích cho vui:
//    bài kiểm 43 quét `moChua('<mã>')` trong src/ và index.html rồi đối chiếu CẢ HAI CHIỀU.
//    Khai `true` mà không có chỗ đọc là báo đỏ. Có chỗ đọc mà khai `false` cũng báo đỏ.
//    Đây là cách chặn công tắc chết, cùng một luật với bài kiểm 27 của màn Cài Đặt.
//
// Mở một tính năng mới thì đổi ĐÚNG MỘT chỗ: `daDung: false` -> `true`. Không sửa SQL.
// ============================================================

/**
 * `dot` = quãng nào của lộ trình. Chỉ để xếp nhóm ở tab Tính Năng, không dính vào phép tính nào.
 * `mo` = một câu, động từ đứng đầu. Đây là câu tác giả đọc lúc quyết định có bật hay không.
 */
export const TINH_NANG = [
  { ma: 'noiDungBac2',  ten: 'Nội Dung Chiến Đấu Bậc Hai', dot: 'Năm thứ nhất', daDung: false,
    mo: 'Yêu Vương và Bí Cảnh thêm bậc khó thứ hai.' },
  { ma: 'tongMonDrama', ten: 'Tông Môn Bậc Hai',           dot: 'Năm thứ nhất', daDung: false,
    mo: 'Mở nhánh đệ tử và năm quyển Bí Kíp.' },
  { ma: 'bangChien',    ten: 'Bang Phái Tranh Chấp',       dot: 'Năm thứ nhất', daDung: false,
    mo: 'Bang Phái tranh chấp theo mốc mỗi tuần.' },
  { ma: 'sanThuMua',    ten: 'Sàn Thu Mua',                dot: 'Năm thứ nhất', daDung: true,
    mo: 'Sàn Giao Dịch thêm đơn Thu Mua.' },
  // ⚠ Mã NGOÀI lộ trình ba năm — thêm mã mới thì phải sửa cả chốt `tinh_nang_ma_hop_le` trong
  //   docs/SQL_LENH_BAI_9.sql, và chủ dự án chạy lại tệp đó. Bài kiểm 43 soi hai đầu.
  { ma: 'thinhKinh',    ten: 'Thỉnh Kinh',                 dot: 'Năm thứ nhất', daDung: true,
    mo: 'Mở màn Thỉnh Kinh: phái Hộ Kinh Sứ áp tải kinh thư.' },
  { ma: 'phoLuc',       ten: 'Phổ Lực',                    dot: 'Năm thứ nhất', daDung: false,
    mo: 'Vạn Vật Phổ trả thưởng Phổ Lực.' },
  { ma: 'dauTruong',    ten: 'Đấu Trường',                 dot: 'Năm thứ hai',  daDung: false,
    mo: 'Đấu với bản chụp hồ sơ của người khác.' },
  { ma: 'muaGiai',      ten: 'Mùa Giải',                   dot: 'Năm thứ hai',  daDung: false,
    mo: 'Bảng xếp hạng đóng băng ba tháng một lần.' },
  { ma: 'bangChienPvp', ten: 'Bang Chiến',                 dot: 'Năm thứ hai',  daDung: false,
    mo: 'Hai bang tranh một địa điểm trên bản đồ.' },
  { ma: 'coOnline',     ten: 'Kỳ Bài Đối Chiến',           dot: 'Năm thứ hai',  daDung: false,
    mo: 'Ngũ Tử Kỳ và ba trò bài đấu người thật.' },
  { ma: 'dongPhuHub',   ten: 'Động Phủ Mở Rộng',           dot: 'Năm thứ hai',  daDung: false,
    mo: 'Động Phủ nhận mini-game kèm mốc thưởng mỗi ngày.' },
  { ma: 'banDoBac3',    ten: 'Bản Đồ Bậc Ba',              dot: 'Năm thứ ba',   daDung: false,
    mo: 'Thêm vùng đất mới và tuyến nhiệm vụ dài.' },
  { ma: 'cheTacBac3',   ten: 'Chế Tác Bậc Ba',             dot: 'Năm thứ ba',   daDung: false,
    mo: 'Đúc lại dòng roll, ghép Bộ Trang, tinh luyện Linh Thú.' },
  { ma: 'cotTruyen2',   ten: 'Cốt Truyện Phần Hai',        dot: 'Năm thứ ba',   daDung: false,
    mo: 'Đàm Đạo mở phần hai, gắn với bản đồ mới.' },
];

export const TINH_NANG_MA = TINH_NANG.map((t) => t.ma);
export const TINH_NANG_BY_MA = Object.fromEntries(TINH_NANG.map((t) => [t.ma, t]));

/** Ba quãng lộ trình, theo đúng thứ tự bày ở tab Tính Năng. */
export const TINH_NANG_DOT = ['Năm thứ nhất', 'Năm thứ hai', 'Năm thứ ba'];
