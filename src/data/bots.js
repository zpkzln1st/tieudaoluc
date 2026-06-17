// ============================================================
// DATA — Hệ Giang Hồ AI (bot). Hằng số gom 1 chỗ. Xem THIET_KE_BOT_WORLD.md.
// Bot = MÔ PHỎNG client-side; stat suy ra từ (seed, bornAt, now) — không lưu, không vòng lặp nền.
// ============================================================

export const BOT_COUNT = 200;                 // dân số "đám đông"
export const BASE_RATE_PER_DAY = 95000;       // xp-effort / ngày-online (calibrate pace; tune theo phân bố)
export const BORNAT_SPREAD_DAYS = [3, 365];   // "tuổi" bot — LỆCH về trẻ (rng^2): đa số mới, ít lão làng gần trần
export const BORNAT_SKEW = 2;                 // số mũ lệch tuổi
export const ONLINE_FRAC = [0.12, 0.6];       // bot không on 24/7
export const RATE_JITTER = [0.55, 1.5];       // nhân thêm vào rate mỗi bot -> đa dạng

// Tỉ trọng EFFORT trên 10 track (chienDau + 9 nghề). Số tương đối — engine tự chuẩn hoá tổng=1.
// Track key TRÙNG state.skills + 'chienDau'.
export const ARCHETYPES = {
  satThu:   { id: 'satThu',   name: 'Sát Thủ',   titles: ['Kiếm Khách', 'Độc Hành Khách', 'Lãnh Diện Tu La', 'Vô Danh Kiếm'],
    w: { chienDau: 60, phatMoc: 4, thaiKhoang: 4, dieuNgu: 3, daLuyen: 5, phanhNham: 4, luyenDan: 8, daTao: 5, toaQuan: 5, doanhTao: 2 } },
  sanBoss:  { id: 'sanBoss',  name: 'Săn Yêu',   titles: ['Đồ Tể Yêu Vương', 'Liệp Ma Nhân', 'Trảm Yêu Sứ', 'Phục Ma Giả'],
    w: { chienDau: 68, phatMoc: 3, thaiKhoang: 3, dieuNgu: 2, daLuyen: 4, phanhNham: 5, luyenDan: 7, daTao: 3, toaQuan: 3, doanhTao: 2 } },
  cayNghe:  { id: 'cayNghe',  name: 'Bách Nghệ', titles: ['Bách Nghệ Tượng', 'Lão Tiều', 'Khoáng Sư', 'Thần Trù'],
    w: { chienDau: 18, phatMoc: 16, thaiKhoang: 16, dieuNgu: 12, daLuyen: 12, phanhNham: 8, luyenDan: 6, daTao: 8, toaQuan: 2, doanhTao: 8 } },
  phuThuong:{ id: 'phuThuong', name: 'Phú Thương', titles: ['Phú Thương', 'Tài Thần', 'Khách Thương', 'Đào Chu Công'],
    w: { chienDau: 25, phatMoc: 10, thaiKhoang: 12, dieuNgu: 6, daLuyen: 14, phanhNham: 8, luyenDan: 8, daTao: 13, toaQuan: 2, doanhTao: 10 } },
  loMo:     { id: 'loMo',     name: 'Tản Nhân',  titles: ['Tản Nhân', 'Du Hiệp', 'Nhàn Vân Dã Hạc', 'Quá Khách'],
    w: { chienDau: 32, phatMoc: 10, thaiKhoang: 10, dieuNgu: 8, daLuyen: 8, phanhNham: 8, luyenDan: 6, daTao: 8, toaQuan: 4, doanhTao: 8 } },
};
export const ARCHETYPE_IDS = Object.keys(ARCHETYPES);
// Tỉ lệ xuất hiện (đám đông): nhiều tản nhân/cày nghề, ít sát thủ/săn boss đỉnh.
export const ARCHETYPE_WEIGHTS = { loMo: 34, cayNghe: 26, satThu: 18, phuThuong: 14, sanBoss: 8 };

// Track combat dùng cho cờ "đang đánh"; còn lại là 9 nghề.
export const TRACK_KEYS = ['chienDau', 'phatMoc', 'thaiKhoang', 'dieuNgu', 'daLuyen', 'phanhNham', 'luyenDan', 'daTao', 'toaQuan', 'doanhTao'];

// Pool tên Hán-Việt: HỌ × TÊN -> đủ tổ hợp cho ~200 bot không trùng.
export const BOT_HO = [
  'Mộ Dung', 'Độc Cô', 'Tư Mã', 'Gia Cát', 'Thượng Quan', 'Âu Dương', 'Hoàng Phủ', 'Tây Môn', 'Đông Phương', 'Nam Cung',
  'Bắc Đường', 'Lệnh Hồ', 'Hạ Hầu', 'Công Tôn', 'Diệp', 'Lý', 'Vương', 'Trương', 'Triệu', 'Lâm',
  'Tần', 'Hàn', 'Tiêu', 'Cố', 'Mặc', 'Phong', 'Lạc', 'Sở', 'Yến', 'Trầm',
  'Liễu', 'Mạnh', 'Chu', 'Quan', 'Đường', 'Tạ', 'Bạch', 'Tống', 'Hứa', 'Lữ',
];
// Danh hiệu THEO NGHỀ THẬT: theo track ĐỈNH của bot, 4 bậc cấp [<40 sơ · <70 trung · <90 cao · ≥90 đỉnh].
export const TRACK_TITLES = {
  chienDau:   ['Võ Đồ',     'Kiếm Sĩ',    'Cao Thủ',      'Võ Tông'],
  phatMoc:    ['Tiều Đồng',  'Tiều Phu',   'Lão Tiều',     'Phủ Thánh'],
  thaiKhoang: ['Khoáng Đồ',  'Thợ Mỏ',     'Khoáng Sư',    'Khoáng Tổ'],
  dieuNgu:    ['Điếu Đồng',  'Ngư Phủ',    'Điếu Tẩu',     'Ngư Tiên'],
  daLuyen:    ['Lô Đồng',    'Thợ Luyện',  'Luyện Kim Sư', 'Hỏa Thần Tượng'],
  phanhNham:  ['Táo Đồng',   'Hỏa Đầu Quân','Đầu Bếp',     'Thần Trù'],
  luyenDan:   ['Dược Đồng',  'Dược Sư',    'Đan Sư',       'Đan Vương'],
  daTao:      ['Học Đồ Rèn', 'Thợ Rèn',    'Đại Tượng',    'Thần Binh Tượng'],
  toaQuan:    ['Tọa Đồ',     'Tu Sĩ',      'Thiền Giả',    'Cao Tăng'],
  doanhTao:   ['Phu Lực',    'Thợ Cả',     'Doanh Tạo Sư', 'Lỗ Ban Tái Thế'],
};
// Phân loại track -> màu danh hiệu (combat/gather/craft/support).
export const TRACK_CAT = {
  chienDau: 'combat',
  phatMoc: 'gather', thaiKhoang: 'gather', dieuNgu: 'gather',
  daLuyen: 'craft', phanhNham: 'craft', daTao: 'craft', doanhTao: 'craft',
  luyenDan: 'support', toaQuan: 'support',
};
export const CAT_HEX = { combat: '#fb7185', gather: '#34d399', craft: '#fbbf24', support: '#a78bfa' };

// Pool avatar cho BOT — chỉ id ĐÃ CÓ ART (images/avatars/<id>.webp) -> bot hiện ảnh thật, không rơi fallback 男/女.
// (id sect như caibang/vodang KHÔNG nằm trong AVATARS data -> botAvatar trả id + char/màu mặc định, ảnh vẫn load.)
export const BOT_AVATAR_IDS = [
  'nam', 'nam1', 'nam2', 'nam3', 'nam4', 'nam5', 'nam6', 'nam7', 'nam8', 'nam9',
  'nu', 'nu1', 'nu2', 'nu3', 'nu4', 'nu5', 'nu6', 'nu7',
  'caibang', 'duongmon', 'hoason', 'ngami', 'ngudoc', 'thiennhan', 'thienvuong', 'thieulam', 'thuyyen', 'vodang',
];

export const BOT_TEN = [
  'Thiên', 'Vô Kỵ', 'Tuyết', 'Phong', 'Vân', 'Hàn', 'Tịch', 'Dao', 'Ảnh', 'Tà',
  'Phi', 'Trần', 'Tuyền', 'Hạo Nhiên', 'Thanh', 'Minh', 'Khiêm', 'Lăng', 'Hiên', 'Nhiên',
  'Trác', 'Du', 'Khinh Vũ', 'Mặc Hàn', 'Tử Hiên', 'Lạc Trần', 'Vô Song', 'Bất Phàm', 'Thương Lan', 'Mộ Vũ',
  'Cô Hồng', 'Trường Phong', 'Ngạo Thiên', 'Phá Quân', 'Tịnh Tâm', 'Linh Nhi', 'Tiêu Dao', 'Cuồng Sinh', 'Sương', 'Hành',
  'Vọng', 'Huyền', 'Lệ', 'Băng', 'Tận', 'Dạ', 'Tuyệt', 'Phù Sinh', 'Lăng Tiêu', 'Vân Thâm',
];

// ============================================================
// FEED GIANG HỒ (tin bot) — P1 mảnh cuối. Sinh DETERMINISTIC theo (seed, slot thời gian):
// mỗi ~FEED_PERIOD_MS có 1 tin nổi bật; nội dung suy ra từ trạng thái THẬT của bot tại thời điểm slot.
// KHÔNG lưu, KHÔNG reroll mỗi render (memo theo slot). Xem engine/bots.js genJiangHuFeed.
// ============================================================
export const FEED_PERIOD_MS = 1000 * 60 * 3;             // nhịp tin: 1 sự kiện nổi bật mỗi ~3 phút
export const FEED_SHOW = 18;                             // số tin dựng (panel hiện đủ; ticker cắt bớt)
export const FEED_BREAK_WINDOW_MS = 1000 * 60 * 60 * 12; // cửa sổ dò "vừa đột phá" — chỉ báo lên cấp khi cấp THẬT tăng trong 12h

// Kho kỳ trân cho tin "đắc bảo": tên + phẩm (id QUALITY, tô màu khi hiện) + minLv (chỉ phát cho bot đủ cấp -> khớp độ hiếm).
export const FEED_TREASURES = [
  { name: 'Tụ Khí Tán',            q: 'tinhPham',  minLv: 10 },
  { name: 'Hàn Thiết Lệnh Bài',    q: 'tinhPham',  minLv: 15 },
  { name: 'Bích Lân Hộ Tâm Kính',  q: 'tinhPham',  minLv: 22 },
  { name: 'Tử Hà Ngọc Bội',        q: 'tuyetPham', minLv: 30 },
  { name: 'Lưu Vân Toả',           q: 'tuyetPham', minLv: 36 },
  { name: 'Thanh Minh Kiếm Tuệ',   q: 'tuyetPham', minLv: 43 },
  { name: 'Ngũ Hành Linh Châu',    q: 'truyenThe', minLv: 50 },
  { name: 'Phượng Vũ Lưu Kim Sam', q: 'truyenThe', minLv: 57 },
  { name: 'Thôn Thiên Ma Giới',    q: 'truyenThe', minLv: 64 },
  { name: 'Cửu Chuyển Hồi Hồn Đan',q: 'thanPham',  minLv: 70 },
  { name: 'Long Tước Thần Cung',   q: 'thanPham',  minLv: 78 },
  { name: 'Tinh Phách Bảo Giáp',   q: 'thanPham',  minLv: 84 },
  { name: 'Hỗn Độn Tinh Thạch',    q: 'coBan',     minLv: 90 },
  { name: 'Tru Tiên Cổ Kiếm',      q: 'coBan',     minLv: 95 },
  { name: 'Thiên Đạo Lệnh',        q: 'coBan',     minLv: 100 },
];

// Tuyệt học cho tin "lĩnh ngộ" (tô tím · bí kíp). Tên huyền thoại giang hồ.
export const FEED_TUYET_HOC = [
  'Thái Huyền Kiếm Quyết', 'Cửu Âm Chân Kinh', 'Bắc Minh Thần Công', 'Lăng Ba Vi Bộ',
  'Hàng Long Thập Bát Chưởng', 'Độc Cô Cửu Kiếm', 'Tịch Tà Kiếm Phổ', 'Quỳ Hoa Bảo Điển',
  'Dịch Cân Tẩy Tủy Kinh', 'Nhất Dương Chỉ', 'Huyền Thiên Cửu Biến', 'Vô Tướng Kiếp Chỉ',
];

// Tin "nghề" — vật phẩm danh tiếng theo TỪNG track (gather/craft/support) để câu chữ KHỚP nghề, không lẫn lộn.
export const FEED_FORGE = ['Trảm Mã Đại Đao', 'Hàn Quang Kiếm', 'Phá Quân Thương', 'Liệt Diễm Đao', 'Thanh Phong Tế Vũ Kiếm', 'Bá Vương Trọng Kích']; // daTao (rèn)
export const FEED_DAN   = ['Đại Hoàn Đan', 'Tục Mệnh Đan', 'Tẩy Tủy Dịch', 'Bồi Nguyên Đan', 'Cửu Hoa Ngọc Lộ Hoàn', 'Tử Kim Đan'];               // luyenDan (luyện đan)
export const FEED_MOC    = ['Thiết Tâm Mộc', 'Vạn Niên Âm Trầm', 'Lôi Kích Tử Đàn', 'Hồng Tâm Cổ Mộc', 'Bách Niên Hoàng Hoa Lê'];                  // phatMoc (đốn củi)
export const FEED_KHOANG = ['Huyền Thiết', 'Tinh Ngân Mạch', 'Hàn Ngọc Tủy', 'Vẫn Lạc Tinh Thiết', 'Tử Tinh Sa'];                                  // thaiKhoang (đào khoáng)
export const FEED_NGU    = ['Cửu Vĩ Linh Ngư', 'Hắc Giao', 'Băng Phách Hàn Ngư', 'Long Môn Xích Lý', 'Bạch Lân Tiên Ngư'];                         // dieuNgu (câu cá)
