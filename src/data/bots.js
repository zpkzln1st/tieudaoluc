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

export const BOT_TEN = [
  'Thiên', 'Vô Kỵ', 'Tuyết', 'Phong', 'Vân', 'Hàn', 'Tịch', 'Dao', 'Ảnh', 'Tà',
  'Phi', 'Trần', 'Tuyền', 'Hạo Nhiên', 'Thanh', 'Minh', 'Khiêm', 'Lăng', 'Hiên', 'Nhiên',
  'Trác', 'Du', 'Khinh Vũ', 'Mặc Hàn', 'Tử Hiên', 'Lạc Trần', 'Vô Song', 'Bất Phàm', 'Thương Lan', 'Mộ Vũ',
  'Cô Hồng', 'Trường Phong', 'Ngạo Thiên', 'Phá Quân', 'Tịnh Tâm', 'Linh Nhi', 'Tiêu Dao', 'Cuồng Sinh', 'Sương', 'Hành',
  'Vọng', 'Huyền', 'Lệ', 'Băng', 'Tận', 'Dạ', 'Tuyệt', 'Phù Sinh', 'Lăng Tiêu', 'Vân Thâm',
];
