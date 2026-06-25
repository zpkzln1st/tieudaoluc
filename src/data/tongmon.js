// ============================================================
// DATA — TÔNG MÔN (nhánh phụ, lấy đệ tử làm tâm). CÁCH LY: KHÔNG import combat/gear/stats.
// Hằng số + pool sinh đệ tử + công trình. Mọi "thực lực" ở đây CHỈ sống trong nhánh phụ.
// ============================================================

// --- 10 cảnh giới (idle thật, giờ ở tốc Trung Tư chuẩn) ---
export const REALMS = [
  { name: 'Luyện Khí', hours: 2,    uy: 2 },
  { name: 'Trúc Cơ',   hours: 8,    uy: 5 },
  { name: 'Kim Đan',   hours: 24,   uy: 12 },
  { name: 'Nguyên Anh',hours: 72,   uy: 25 },
  { name: 'Hóa Thần',  hours: 168,  uy: 50 },
  { name: 'Luyện Hư',  hours: 384,  uy: 90 },
  { name: 'Hợp Thể',   hours: 768,  uy: 160 },
  { name: 'Đại Thừa',  hours: 1536, uy: 280 },
  { name: 'Độ Kiếp',   hours: 2640, uy: 450 },
  { name: 'Đắc Đạo',   hours: 4320, uy: 800 },
];

// --- TIỂU CẢNH GIỚI: Luyện Khí 9 Tầng + Đại Viên Mãn (10); 9 đại cảnh sau mỗi cái 4 tiểu (tổng 46). ---
// Index = realm. Tên là CHÍNH XÁC cảnh giới hiện tại (đã gồm đại cảnh), hiển thị thẳng.
export const SUB_STAGES = [
  ['Luyện Khí Tầng Một', 'Luyện Khí Tầng Hai', 'Luyện Khí Tầng Ba', 'Luyện Khí Tầng Bốn', 'Luyện Khí Tầng Năm', 'Luyện Khí Tầng Sáu', 'Luyện Khí Tầng Bảy', 'Luyện Khí Tầng Tám', 'Luyện Khí Tầng Chín', 'Luyện Khí Đại Viên Mãn'],
  ['Dẫn Linh Trúc Cơ', 'Khai Mạch Trúc Cơ', 'Ngưng Cơ Trúc Cơ', 'Đạo Cơ Viên Mãn'],
  ['Đan Khí Sơ Ngưng', 'Hư Đan', 'Thực Đan', 'Kim Đan Viên Mãn'],
  ['Anh Thai', 'Ngưng Anh', 'Thành Anh', 'Nguyên Anh Viên Mãn'],
  ['Thần Niệm Sơ Khai', 'Thần Hải Ngưng Tụ', 'Nguyên Thần Hóa Hình', 'Hóa Thần Viên Mãn'],
  ['Hư Thần', 'Hư Thể', 'Động Hư', 'Quy Hư Viên Mãn'],
  ['Thân Hợp', 'Thần Hợp', 'Pháp Hợp', 'Thiên Nhân Hợp Nhất'],
  ['Nhập Thánh', 'Hóa Thánh', 'Pháp Tướng Đại Thành', 'Đại Thừa Viên Mãn'],
  ['Nhất Cửu Thiên Kiếp', 'Tam Cửu Thiên Kiếp', 'Lục Cửu Thiên Kiếp', 'Cửu Cửu Thiên Kiếp'],
  ['Vấn Đạo', 'Minh Đạo', 'Chứng Đạo', 'Đạo Thành'],
];
// Index tiểu cảnh theo xp (0..count-1). atCap=true -> đỉnh trần (tiểu cảnh cuối = Viên Mãn).
export function subStageIndex(realm, xp, atCap) {
  const n = (SUB_STAGES[realm] || []).length || 1;
  return atCap ? n - 1 : Math.max(0, Math.min(n - 1, Math.floor((xp || 0) * n)));
}
export function subStageName(realm, xp, atCap) { return (SUB_STAGES[realm] || [])[subStageIndex(realm, xp, atCap)] || ''; }

// --- 5 tư chất: tốc độ + TRẦN (index cảnh giới tối đa tự nhiên) + trọng số chiêu mộ + màu ---
export const APT = {
  pham:   { name: 'Phàm Tư',  mul: 0.7,  cap: 2, w: 45, color: '#cbd5e1' },
  trung:  { name: 'Trung Tư', mul: 1.0,  cap: 3, w: 30, color: '#34d399' },
  thuong: { name: 'Thượng Tư',mul: 1.4,  cap: 5, w: 17, color: '#60a5fa' },
  tuyet:  { name: 'Tuyệt Tư', mul: 2.0,  cap: 7, w: 7,  color: '#a78bfa' },
  thien:  { name: 'Thiên Tư', mul: 3.2,  cap: 9, w: 1,  color: '#fbbf24' },
};
export const APT_KEYS = ['pham', 'trung', 'thuong', 'tuyet', 'thien'];

// --- Ngũ hành (flavor) ---
// Màu ngũ hành ĐỒNG BỘ bảng chuẩn game (votong.js NGU_HANH): Kim vàng · Mộc lục · Thủy lam · Hỏa cam · Thổ hổ phách.
export const HE = {
  kim: { name: 'Kim', han: '金', color: '#facc15' }, moc: { name: 'Mộc', han: '木', color: '#34d399' },
  thuy:{ name: 'Thủy', han: '水', color: '#38bdf8' }, hoa: { name: 'Hỏa', han: '火', color: '#fb923c' },
  tho: { name: 'Thổ', han: '土', color: '#f59e0b' },
};
export const HE_KEYS = ['kim', 'moc', 'thuy', 'hoa', 'tho'];

// --- Tính cách (ảnh hưởng sự kiện sau) ---
export const TRAITS = ['Lì Lợm', 'Cao Ngạo', 'Cần Mẫn', 'Mưu Trí', 'Hiếu Chiến', 'Nhân Hậu', 'Cô Độc', 'Phóng Khoáng', 'Thận Trọng', 'Si Tình', 'Cuồng Ngạo', 'Trượng Nghĩa'];

// --- Xuất thân ---
// label/bio NEUTRAL; xuất thân có giới tính thì thêm biến thể *Nam/*Nu (key GIỮ NGUYÊN để không vỡ save cũ).
export const ORIGINS = [
  { key: 'anMay',   label: 'Ăn mày lưu lạc',     bio: 'Một đứa ăn mày nhặt được bên đường ngày mưa, gầy guộc nhưng ánh mắt không chịu khuất phục.' },
  { key: 'tieuThu', labelNam: 'Công tử sa sút', labelNu: 'Tiểu thư sa sút',
    bioNam: 'Công tử của một gia tộc nay đã lụi tàn, mang trong lòng nỗi hận phục hưng môn hộ.',
    bioNu:  'Tiểu thư của một gia tộc nay đã lụi tàn, mang trong lòng nỗi hận phục hưng môn hộ.' },
  { key: 'theGia',  label: 'Võ lâm thế gia',     bio: 'Hậu duệ một thế gia võ lâm, căn cơ vững vàng, kiêu hãnh trong huyết quản.' },
  { key: 'toiDo',   label: 'Tội đồ hoàn lương',  bio: 'Từng là kẻ sát nhân khét tiếng, nay rửa tay gác kiếm tìm một chốn dung thân.' },
  { key: 'tangNhan',labelNam: 'Tăng nhân hạ sơn', labelNu: 'Ni cô hạ sơn',
    bioNam: 'Một tăng nhân rời cửa Phật, mang theo Phật pháp lẫn một bí mật chưa nói.',
    bioNu:  'Một ni cô rời cửa Phật, mang theo Phật pháp lẫn một bí mật chưa nói.' },
  { key: 'nuHiep',  labelNam: 'Hiệp khách giang hồ', labelNu: 'Nữ hiệp giang hồ',
    bioNam: 'Hiệp khách phiêu bạt giang hồ, kiếm sắc lòng son, chưa tìm được nơi dừng chân.',
    bioNu:  'Nữ hiệp phiêu bạt giang hồ, kiếm sắc lòng son, chưa tìm được nơi dừng chân.' },
  { key: 'biAn',    label: 'Lai lịch bí ẩn',     bio: 'Kẻ bịt mặt không rõ lai lịch, võ công cao thâm khó dò, thân thế là một dấu hỏi.' },
];
// Resolve nhãn/bio xuất thân theo giới tính (vá cả disciple/pool đã sinh trước đó — chỉ cần origin + sex).
export function originLabelOf(key, sex) { const o = ORIGINS.find((x) => x.key === key) || {}; return (sex === 'nu' ? o.labelNu : o.labelNam) || o.label || ''; }
export function originBioOf(key, sex) { const o = ORIGINS.find((x) => x.key === key) || {}; return (sex === 'nu' ? o.bioNu : o.bioNam) || o.bio || ''; }

// --- Chí hướng / mơ ước ---
export const DREAMS = ['Trở thành đệ nhất cao thủ', 'Phục hưng môn hộ đã tàn', 'Báo mối huyết hải thâm thù', 'Cầu một đạo trường sinh', 'Hành hiệp trượng nghĩa khắp thiên hạ', 'Tìm lại cố nhân thất lạc', 'Phá vỡ giới hạn trời định'];
// --- Tâm ma ---
export const TAMMA = ['Hắc ám sát niệm', 'Kiêu căng cố chấp', 'Tình chấp khó dứt', 'Tham luyến quyền lực', 'Sợ hãi thất bại', 'Cô độc lạnh lùng'];

// --- Pool tên Hán-Việt (sinh đệ tử ngẫu nhiên) ---
const HO = ['Lý', 'Tô', 'Mộ Dung', 'Hàn', 'Diệp', 'Lăng', 'Tạ', 'Đoàn', 'Âu Dương', 'Tần', 'Mặc', 'Lạc', 'Phương', 'Tiêu', 'Bạch'];
const TEN_NAM = ['Vô Trần', 'Thanh Phong', 'Kiếm Tâm', 'Phá Quân', 'Tử Hiên', 'Hạo Nhiên', 'Trường Sinh', 'Mặc Hàn', 'Cô Hồng', 'Vân Hạc'];
const TEN_NU  = ['Vân Y', 'Yên Nhi', 'Tuyết Cơ', 'Linh Nhi', 'Thanh Loan', 'Nguyệt Tâm', 'Băng Nhi', 'Tử Yên', 'Như Sương', 'Tịch Nhan'];
const HAN_NAM = '尘风剑破轩然生寒鸿鹤';
const HAN_NU  = '衣烟雪灵鸾月冰嫣霜寂';

// --- Công trình (NỀN, giữ nhẹ; phục vụ đệ tử) ---
export const BUILDINGS = {
  tuHien:  { name: 'Tụ Hiền Đường', han: '宗', desc: 'Sảnh đường chiêu hiền nạp sĩ — nơi quy tụ anh tài bốn phương về dưới trướng tông môn. Bậc càng cao, sức chứa môn đồ càng rộng; cũng là chốn truyền hịch Chiêu Hiền vang khắp giang hồ.', slotBase: 4, slotPerLv: 1 },
  dienVo:  { name: 'Diễn Võ Trường', han: '武', desc: 'Giáo trường luyện võ, ngày đêm vang tiếng binh khí va chạm. Đệ tử khổ luyện nơi đây, đạo cơ ngày một vững, tu vi tăng tiến mau hơn — mở rộng trường thì cả tông cùng hưởng.', buffPerLv: 0.06 },
  tangThu: { name: 'Tàng Thư Lâu',  han: '書', desc: 'Lầu cất giữ kinh thư bí lục của môn phái. Đệ tử nghiền ngẫm điển tịch, lĩnh ngộ huyền cơ — tích góp đều đặn thành Điểm Đấu Giá theo thời gian.', diemPerLvH: 12 },
  yQuan:   { name: 'Y Quán',        han: '醫', desc: 'Đan phòng của tông môn, lò lửa quanh năm không tắt. Theo cổ phương mà nung luyện nguyên liệu trong Túi Đồ thành linh đan đột phá — mỗi mẻ tốn thời gian luyện. Bậc cao mở thêm lò và đan phẩm cao hơn.' },
  duocVien:{ name: 'Dược Viên',     han: '藥', desc: 'Khu vườn ươm trồng linh dược, sương khói lượn quanh các luống đất. Mỗi luống nuôi một vị nguyên liệu, đủ ngày thì chín, hái về Túi Đồ. Bậc cao mở thêm luống và trồng được linh dược bậc cao.' },
  luyenKhiCac:{ name: 'Luyện Khí Các', han: '器', desc: 'Gác lò rèn của tông môn, đe nung đỏ lửa, búa gõ vang chan chát. Tôi luyện gia bảo đệ tử đang đeo lên một tầng uy lực — bậc càng cao thì rèn được càng sâu.' },
  giangDao:{ name: 'Giảng Đạo Đường', han: '講', desc: 'Giảng đường thâm u, cao nhân thuyết đạo cho hậu bối nghe. Thính giảng lâu ngày khai mở tâm khiếu — NÂNG TRẦN tư chất đệ tử, giúp kẻ căn cơ tầm thường vươn xa hơn số trời định. (Đắc Đạo vẫn là cảnh giới chỉ Thiên Tư chạm tới.)' },
  tuLinh:  { name: 'Tụ Linh Trận',  han: '陣', desc: 'Đại trận dẫn linh khí trời đất quy tụ về sơn môn, vận khí hanh thông cát tường. Linh khí dồi dào giúp Khí Vận tông môn tăng tiến, đồng thời bồi thêm tốc độ tu luyện cho toàn môn.', khiPerLv: 4 },
  // --- Công trình XÃ HỘI (nội thất ở chunk riêng) ---
  daiKhachCac:  { name: 'Đãi Khách Các', han: '賓', desc: 'Lầu tiếp đãi tân khách bốn phương, rượu thơm trà nóng quanh năm. Nơi tông môn kết giao các phái giang hồ, đón sứ giả gây dựng bang giao — bậc cao thì đón được nhiều khách quý, uy danh vang xa.' },
  gioiLuatDuong:{ name: 'Giới Luật Đường', han: '律', desc: 'Đường nghiêm trị gia pháp môn quy, roi đồng giới xích lạnh người. Nơi tra xét kẻ sinh tâm ma, xử trí phản đồ, gột cờ xấu giữ sơn môn thanh tịnh — bậc cao thì uy nghiêm càng trọng, trấn tâm ma càng sâu.' },
  luanVoDuong:  { name: 'Luận Võ Đường', han: '論', desc: 'Giảng võ đường cho đệ tử tỉ thí cao thấp, binh khí lách cách suốt ngày. Nơi luận bàn võ học, giao đấu nâng cao sĩ khí toàn môn — bậc cao thì mở thêm đối thủ và đài luận võ.' },
  toSuDien:     { name: 'Tổ Sư Điện', han: '祖', desc: 'Điện thờ tổ sư lịch đại, khói hương nghi ngút trang nghiêm. Nơi cung phụng tiền nhân khai phái, ghi danh đệ tử Xuất Sư, Trưởng Lão cùng những người đã khuất — bậc cao thì bài vị càng nhiều, ấm phúc càng dày.' },
};
export const BUILD_KEYS = ['tuHien', 'dienVo', 'tangThu', 'yQuan', 'duocVien', 'luyenKhiCac', 'giangDao', 'tuLinh', 'daiKhachCac', 'gioiLuatDuong', 'luanVoDuong', 'toSuDien'];

// ===== LUYỆN ĐAN: nguyên liệu (MATS) -> đan đột phá (PILLS) theo CÔNG THỨC =====
// 6 nguyên liệu, 3 bậc · art images/tongmon/mats/<id>.webp (emoji = fallback).
export const MATS = {
  mat_tulinhthao: { id: 'mat_tulinhthao', name: 'Tụ Linh Thảo',       tier: 1, emoji: '🌿' },
  mat_hantinh:    { id: 'mat_hantinh',    name: 'Hàn Tinh Thạch',     tier: 1, emoji: '🔷' },
  mat_bachnien:   { id: 'mat_bachnien',   name: 'Bách Niên Linh Chi', tier: 2, emoji: '🍄' },
  mat_huyenthiet: { id: 'mat_huyenthiet', name: 'Huyền Thiết Tinh',   tier: 2, emoji: '🪨' },
  mat_cuudiep:    { id: 'mat_cuudiep',    name: 'Cửu Diệp Linh Sâm',  tier: 3, emoji: '🌱' },
  mat_tinhhon:    { id: 'mat_tinhhon',    name: 'Tinh Hồn Thạch',     tier: 3, emoji: '🔮' },
};
export const MAT_KEYS = Object.keys(MATS);
// 9 đan đột phá: realm = cảnh giới HIỆN TẠI (đột phá lên realm+1). recipe {matId:qty}. lvReq = cấp Y Quán cần để luyện.
export const PILLS = {
  trucCoDan:   { id: 'trucCoDan',   name: 'Trúc Cơ Đan',   realm: 0, lvReq: 1, emoji: '🟢', recipe: { mat_tulinhthao: 3,  mat_hantinh: 2 } },
  ketDanDan:   { id: 'ketDanDan',   name: 'Kết Đan Đan',   realm: 1, lvReq: 1, emoji: '🔵', recipe: { mat_tulinhthao: 5,  mat_hantinh: 4 } },
  ngungAnhDan: { id: 'ngungAnhDan', name: 'Ngưng Anh Đan', realm: 2, lvReq: 3, emoji: '🟣', recipe: { mat_bachnien: 3,   mat_huyenthiet: 2 } },
  hoaThanDan:  { id: 'hoaThanDan',  name: 'Hóa Thần Đan',  realm: 3, lvReq: 3, emoji: '🟪', recipe: { mat_bachnien: 5,   mat_huyenthiet: 4 } },
  quyHuDan:    { id: 'quyHuDan',    name: 'Quy Hư Đan',    realm: 4, lvReq: 5, emoji: '🟠', recipe: { mat_cuudiep: 3,    mat_tinhhon: 2 } },
  hopDaoDan:   { id: 'hopDaoDan',   name: 'Hợp Đạo Đan',   realm: 5, lvReq: 5, emoji: '🔶', recipe: { mat_cuudiep: 5,    mat_tinhhon: 4 } },
  daiThuaDan:  { id: 'daiThuaDan',  name: 'Đại Thừa Đan',  realm: 6, lvReq: 6, emoji: '🟡', recipe: { mat_cuudiep: 7,    mat_tinhhon: 6 } },
  doKiepDan:   { id: 'doKiepDan',   name: 'Độ Kiếp Đan',   realm: 7, lvReq: 7, emoji: '🔴', recipe: { mat_cuudiep: 10,   mat_tinhhon: 8 } },
  phiThangDan: { id: 'phiThangDan', name: 'Phi Thăng Đan', realm: 8, lvReq: 8, emoji: '⭐', recipe: { mat_cuudiep: 14,   mat_tinhhon: 12 } },
};
export const PILL_KEYS = Object.keys(PILLS);
export const PILL_BY_REALM = {}; PILL_KEYS.forEach((k) => { PILL_BY_REALM[PILLS[k].realm] = k; });
// Đột phá realm R: cần 1 đan PILL_BY_REALM[R] + Hồn Thạch (main, 1 chiều). DRAFT.
export const BREAK_HONTHACH = [100, 300, 800, 1800, 3500, 6500, 11000, 18000, 30000];

// ===== THIÊN KIẾP: đột phá CẢNH CAO (realm 7,8) = độ kiếp có RỦI RO. realm 8->9 (Đắc Đạo) thất bại CÓ THỂ TỬ VONG. Cảnh thấp vẫn đột phá tức thì. DRAFT. =====
// key = realm ĐANG đột phá TỪ (doBreakthrough đọc d.realm trước khi tăng). baseOdds = tỉ lệ thành nền.
export const THIEN_KIEP = {
  7: { name: 'Đại Thừa Thiên Kiếp', baseOdds: 0.74, deadly: false, deathOnFail: 0 },    // Đại Thừa -> Độ Kiếp: thất bại = tổn đạo, KHÔNG chết
  8: { name: 'Cửu Cửu Thiên Kiếp',  baseOdds: 0.56, deadly: true,  deathOnFail: 0.40 },  // Độ Kiếp -> Đắc Đạo: thất bại có thể HỒN PHI PHÁCH TÁN
};
export const KIEP_CD_H = 12;   // giờ tĩnh dưỡng giữa 2 lần độ kiếp sau khi thất bại (DRAFT)
export function thienKiepOf(realm) { return THIEN_KIEP[realm] || null; }
// Tỉ lệ THÀNH công độ kiếp (0..1): nền + phẩm đan (phamBonus) − gánh nặng tâm ma (0.05/bậc) + Khí Vận + tư chất.
export function kiepOdds(d, phamBonus, khiVan) {
  const k = THIEN_KIEP[d.realm]; if (!k) return 1;
  let p = k.baseOdds + (phamBonus || 0) - 0.05 * (d.tamMaLv || 0) + (((khiVan == null ? 50 : khiVan) - 50) / 250);
  if (d.apt === 'thien') p += 0.10; else if (d.apt === 'tuyet') p += 0.04;
  return Math.max(0.05, Math.min(0.95, p));
}
// Luyện đan TỐN THỜI GIAN (lò Y Quán): giờ chín theo từng đan (DRAFT, scale theo cảnh giới).
export const PILL_BREW_H = { trucCoDan: 2, ketDanDan: 3, ngungAnhDan: 5, hoaThanDan: 8, quyHuDan: 12, hopDaoDan: 16, daiThuaDan: 24, doKiepDan: 36, phiThangDan: 48 };
export function pillBrewH(pillId) { return PILL_BREW_H[pillId] || 4; }
// Số LÒ luyện song song theo bậc Y Quán (DRAFT): Bậc 1 = 1 lò, +1 mỗi 3 bậc.
export function yQuanFurnaces(lv) { return 1 + Math.floor((lv || 0) / 3); }

// ===== ĐAN PHẨM (phẩm chất đan) — roll lúc KHỞI LÒ theo bậc Y Quán + Khí Vận. breakBonus = CỘNG vào tỉ lệ vượt Thiên Kiếp (hệ Thiên Kiếp dùng). Lưu SONG SONG t.pillQual, t.pills giữ TỔNG (save-safe). DRAFT. =====
export const PILL_PHAM = [
  { key: 'ha',     name: 'Hạ Phẩm',     short: 'Hạ',     color: '#94a3b8', breakBonus: 0.00 },
  { key: 'trung',  name: 'Trung Phẩm',  short: 'Trung',  color: '#34d399', breakBonus: 0.06 },
  { key: 'thuong', name: 'Thượng Phẩm', short: 'Thượng', color: '#60a5fa', breakBonus: 0.14 },
  { key: 'cuc',    name: 'Cực Phẩm',    short: 'Cực',    color: '#f5b942', breakBonus: 0.24 },
];
export const PILL_PHAM_KEYS = PILL_PHAM.map((p) => p.key);   // thứ tự THẤP -> CAO
export const PILL_PHAM_BY_KEY = {}; PILL_PHAM.forEach((p) => { PILL_PHAM_BY_KEY[p.key] = p; });
export function pillPham(key) { return PILL_PHAM_BY_KEY[key] || PILL_PHAM[0]; }
// Roll phẩm 1 mẻ đan: bậc Y Quán + Khí Vận đẩy phẩm cao. Trả key.
export function rollPillPham(yQuanLv, khiVan) {
  const lift = Math.max(0, (yQuanLv || 0) * 0.6 + (((khiVan == null ? 50 : khiVan) - 50) / 50) * 1.6);
  const w = {
    ha:     Math.max(1, 10 - lift * 1.6),
    trung:  5 + lift * 0.5,
    thuong: Math.max(0.2, (lift - 1) * 0.8),
    cuc:    Math.max(0.04, (lift - 3.2) * 0.6),
  };
  let tot = 0; PILL_PHAM_KEYS.forEach((k) => (tot += w[k])); let r = Math.random() * tot;
  for (const k of PILL_PHAM_KEYS) { r -= w[k]; if (r <= 0) return k; } return 'ha';
}

// ===== LỊCH LUYỆN: phái đệ tử RẢNH đi kiếm nguyên liệu (nguồn chính, không mua-điểm) =====
export const LICH_LUYEN_H = 4;   // giờ thực / chuyến (DRAFT)
export function lichLuyenTier(realm) { return realm <= 1 ? 1 : (realm <= 3 ? 2 : 3); }   // bậc liệu theo cảnh giới đệ tử

// ===== DƯỢC VIÊN: trồng nguyên liệu idle (luống · gieo -> chờ giờ thực -> thu tay). Nguồn liệu phụ, idle thật. =====
export const DUOC_PLOT_BASE = 2;                  // số luống ở Bậc 1 (DRAFT)
export const DUOC_GROW_H = { 1: 2, 2: 5, 3: 10 }; // giờ chín theo BẬC nguyên liệu (DRAFT)
export const DUOC_YIELD  = { 1: 4, 2: 3, 3: 2 };  // thu hoạch / luống theo bậc liệu (DRAFT)
export function duocPlotCount(t) { const lv = (t && t.buildings && t.buildings.duocVien) || 0; return lv < 1 ? 0 : DUOC_PLOT_BASE + (lv - 1); }   // Bậc1=2 luống, +1/bậc
export function duocMaxTier(t) { const lv = (t && t.buildings && t.buildings.duocVien) || 0; return lv <= 2 ? 1 : (lv <= 4 ? 2 : 3); }            // trồng tới bậc liệu nào

// ===== LUYỆN KHÍ CÁC: cường hóa Gia Bảo đệ tử — SIDE-ONLY, ghi inst.tmPlus (chỉ gearPow đọc; reclaim xóa). =====
export function lkcMaxPlus(lv) { return (lv || 0) < 1 ? 0 : 3 * (lv || 0); }   // trần tmPlus = 3 × bậc Luyện Khí Các (DRAFT)
export function lkcStep(tmPlus) { const p = tmPlus || 0; return { mat: 'mat_huyenthiet', matQty: 2 + p, honThach: Math.round(60 * Math.pow(1.45, p)) }; }   // liệu để lên tmPlus+1 (DRAFT)

// ===== GIẢNG ĐẠO ĐƯỜNG: thính giảng idle -> +1 TRẦN tư chất (capBonus). Tối đa +2/đệ tử; Đắc Đạo vẫn độc quyền Thiên (luật disciCap). =====
export const GIANG_H = 48;            // giờ thực / khóa thính giảng (+1 trần) — DRAFT
export const GIANG_MAX_BONUS = 2;     // trần cộng tối đa từ Giảng Đạo / đệ tử
export function giangSeats(lv) { return lv || 0; }   // số ghế thính giảng đồng thời = bậc công trình

// ===== GIỚI LUẬT ĐƯỜNG: răn dạy đệ tử sinh tâm ma / cờ xấu -> gột cờ xấu + giảm tâm ma (mạnh theo bậc). DRAFT. =====
export const GIOI_LUAT_CD_H = 6;                                                  // giờ tĩnh tâm giữa 2 lần răn 1 đệ tử
export const GIOI_LUAT_BAD_FLAGS = ['oanTham', 'tamMaSeed', 'batPhuc', 'phatPhan'];   // cờ xấu Giới Luật gột được
export function gioiLuatPotency(lv) { return 1 + Math.floor((lv || 1) / 2); }     // số bậc tâm ma gột mỗi lần (theo bậc công trình)

// ===== LUẬN VÕ ĐƯỜNG: tỉ thí đệ tử (kết quả SIDE-ONLY: uy/record cosmetic, KHÔNG sinh power về main). DRAFT. =====
export const LUANVO_CD_H = 2;        // giờ hồi sức của đấu sĩ sau 1 trận
export const LUANVO_WIN_UY = 8;      // Uy Danh thưởng người thắng (cosmetic, side-only)

// ===== ĐÃI KHÁCH CÁC: bang giao bot-sect. rep -> bậc giao tình (Người Lạ/Sơ Giao/Hữu Hảo/Kết Minh). Thưởng SIDE-ONLY (uy/mats/cosmetic, KHÔNG bac/honThach/power). DRAFT. =====
export const DIPLO_HOST_REP = 8;          // giao tình mỗi lần Tiếp Đãi
export const DIPLO_HOST_UY = 4;           // uy mỗi Tiếp Đãi
export const DIPLO_HOST_CD_H = 8;         // giờ giữa 2 lần tiếp đãi 1 sect
export const DIPLO_GIFT_REP = 22;         // giao tình mỗi lần Tặng Lễ
export const DIPLO_GIFT_UY = 10;          // uy mỗi Tặng Lễ
export const DIPLO_GIFT_DIEM = 60;        // tốn Điểm Đấu Giá / lần tặng lễ (sink side)
export const DIPLO_ALLY_UY = 80;          // uy thưởng 1 lần khi đạt Kết Minh
export const DIPLO_ALLY_MATS = { mat_bachnien: 3, mat_huyenthiet: 2 };   // quà liệu 1 lần khi đạt Kết Minh
export const DIPLO_TIERS = [
  { key: 'la',      name: 'Người Lạ', min: 0,   color: '#64748b' },
  { key: 'soGiao',  name: 'Sơ Giao',  min: 20,  color: '#94a3b8' },
  { key: 'huuHao',  name: 'Hữu Hảo',  min: 60,  color: '#34d399' },
  { key: 'ketMinh', name: 'Kết Minh', min: 120, color: '#f5b942' },
];
export function diploTier(rep) { let cur = DIPLO_TIERS[0]; for (const x of DIPLO_TIERS) if ((rep || 0) >= x.min) cur = x; return cur; }
export function diploNextMin(rep) { for (const x of DIPLO_TIERS) if ((rep || 0) < x.min) return x.min; return null; }   // ngưỡng bậc kế (null = đã max)

// ===== BÍ KÍP / VÕ HỌC (Tàng Thư Lâu cho đệ tử LĨNH NGỘ). Bậc giống main (Sơ/Trung/Cao/Tuyệt). Hiệu ứng SIDE-ONLY (disciStats/Luận Võ/Uy, KHÔNG về combat main). DRAFT. =====
// Bậc: mul = hệ số nhân hiệu ứng, learnH = giờ lĩnh ngộ, weight = độ phổ biến (sơ/trung dễ, cao/tuyệt hiếm). Màu khớp votong TIER_STYLE.
export const BI_KIP_TIER = {
  'sơ':    { key: 'sơ',    name: 'Sơ',    mul: 1.0, learnH: 6,  weight: 50, color: '#cbd5e1' },
  'trung': { key: 'trung', name: 'Trung', mul: 1.9, learnH: 14, weight: 30, color: '#7dd3fc' },
  'cao':   { key: 'cao',   name: 'Cao',   mul: 3.2, learnH: 30, weight: 14, color: '#fbbf24' },
  'tuyệt': { key: 'tuyệt', name: 'Tuyệt', mul: 5.0, learnH: 60, weight: 6,  color: '#e879f9' },
};
export const BI_KIP_TIER_ORDER = ['sơ', 'trung', 'cao', 'tuyệt'];
// 8 loại võ học: tên + hồ sơ chỉ số (key trùng disciStats). atk/def/spd/maxHP/critDmg = NHÂN %, crit/dodge = CỘNG xác suất.
export const BI_KIP_LOAI = {
  kiem:  { name: 'Kiếm Pháp',  prof: { crit: 0.05, atk: 0.10 } },
  dao:   { name: 'Đao Pháp',   prof: { atk: 0.18 } },
  quyen: { name: 'Quyền Pháp', prof: { atk: 0.10, maxHP: 0.12 } },
  chi:   { name: 'Chỉ Pháp',   prof: { crit: 0.04, critDmg: 0.14 } },
  than:  { name: 'Thân Pháp',  prof: { dodge: 0.06, spd: 0.10 } },
  noi:   { name: 'Nội Công',   prof: { maxHP: 0.16, def: 0.12 } },
  khinh: { name: 'Khinh Công', prof: { spd: 0.16, dodge: 0.04 } },
  am:    { name: 'Ám Khí',     prof: { crit: 0.06, atk: 0.08 } },
};
export const BI_KIP_ADD_STATS = ['crit', 'dodge'];   // stat CỘNG (xác suất); còn lại NHÂN %
// chieu = đòn thi triển trong Đài Tỉ Võ (BK4). flavor = các vế chiến báo.
export const BI_KIP = [
  // --- SƠ (dễ kiếm) ---
  { id: 'bk_cobankiem', ten: 'Cơ Bản Kiếm Quyết', loai: 'kiem', tier: 'sơ', he: 'kim', lore: 'Thập tam thức kiếm nhập môn, mộc mạc mà vững như rễ tùng.', chieu: ['vạch một kiếm cương trực', 'kiếm quyết nhập môn mà chắc nịch'] },
  { id: 'bk_badao', ten: 'Bá Đao Thuật', loai: 'dao', tier: 'sơ', he: 'hoa', lore: 'Đao đi đường bá, một nhát bổ xuống nặng tựa núi đè.', chieu: ['vung một đao bá đạo', 'đao thế hung mãnh chẻ ngang'] },
  { id: 'bk_lahan', ten: 'La Hán Quyền', loai: 'quyen', tier: 'sơ', he: 'tho', lore: 'Quyền pháp nhà Phật, cương mãnh trầm ổn, lấy nhu khắc cương.', chieu: ['tung một quyền La Hán trầm ổn', 'quyền kình như chuông đại hồng'] },
  { id: 'bk_luuvan', ten: 'Lưu Vân Thân Pháp', loai: 'than', tier: 'sơ', he: 'thuy', lore: 'Thân pháp lượn như mây trôi, lách qua kẽ chiêu nhẹ nhàng.', chieu: ['lách người như mây lượn', 'thân ảnh phiêu hốt khó nắm bắt'] },
  { id: 'bk_thanhtam', ten: 'Thanh Tâm Quyết', loai: 'noi', tier: 'sơ', he: 'moc', lore: 'Nội công dưỡng khí, khí hải sung mãn, đạo tâm an định.', chieu: ['vận nội tức điều hòa nghênh đòn', 'chân khí hộ thân vững vàng'] },
  { id: 'bk_truyphong', ten: 'Truy Phong Bộ', loai: 'khinh', tier: 'sơ', he: 'thuy', lore: 'Bộ pháp đuổi gió, sải chân nhanh hơn cả tiếng vỡ.', chieu: ['lướt nhanh như truy phong', 'bộ pháp khinh linh chiếm tiên cơ'] },
  // --- TRUNG ---
  { id: 'bk_luuquang', ten: 'Lưu Quang Kiếm Pháp', loai: 'kiem', tier: 'trung', he: 'kim', lore: 'Kiếm nhanh như tia chớp lưu quang, chưa thấy ánh đã thấy máu.', chieu: ['kiếm quang vụt như lưu quang', 'một đạo bạch hồng xé hư không'] },
  { id: 'bk_cuongphong', ten: 'Cuồng Phong Đao Pháp', loai: 'dao', tier: 'trung', he: 'moc', lore: 'Đao cuốn cuồng phong, mỗi chiêu kéo theo gió táp loạn vây.', chieu: ['đao quang cuốn cuồng phong', 'gió đao vây bủa tứ phía'] },
  { id: 'bk_phichlich', ten: 'Phích Lịch Thần Chỉ', loai: 'chi', tier: 'trung', he: 'hoa', lore: 'Một chỉ điểm ra tựa sấm sét, kình lực tụ một điểm xuyên giáp.', chieu: ['điểm một chỉ như sấm phích lịch', 'chỉ kình tụ điểm xuyên phá'] },
  { id: 'bk_huyenquy', ten: 'Huyền Quy Nội Công', loai: 'noi', tier: 'trung', he: 'tho', lore: 'Nội công nhà rùa, thủ vững như mai cứng, càng đánh càng lì.', chieu: ['vận Huyền Quy khí hộ thể', 'thân tựa quy giáp nuốt trọn đòn'] },
  { id: 'bk_thiemdien', ten: 'Thiểm Điện Khinh Công', loai: 'khinh', tier: 'trung', he: 'hoa', lore: 'Khinh công nhanh tựa chớp giật, chớp mắt đã đổi mười bộ.', chieu: ['di hình như thiểm điện', 'bóng người chớp tắt sau lưng địch'] },
  // --- CAO (khó) ---
  { id: 'bk_ngaotuyet', ten: 'Ngạo Tuyết Kiếm Đạo', loai: 'kiem', tier: 'cao', he: 'thuy', lore: 'Kiếm ý lạnh như tuyết đỉnh non, một kiếm ra hàn khí đóng băng hơi thở.', chieu: ['vung Ngạo Tuyết, hàn quang phủ trắng', 'kiếm ý lạnh thấu xương ép tới'] },
  { id: 'bk_phaquan', ten: 'Phá Quân Đao Pháp', loai: 'dao', tier: 'cao', he: 'kim', lore: 'Đao phá vạn quân, một nhát mở đường máu giữa thiên binh.', chieu: ['bổ Phá Quân một đao mở đường', 'đao thế phá tan mọi phòng tuyến'] },
  { id: 'bk_kimcuong', ten: 'Kim Cương Bất Hoại Thể', loai: 'noi', tier: 'cao', he: 'tho', lore: 'Luyện thân tới mức đao thương khó tổn, thân như kim cương trường tồn.', chieu: ['vận Kim Cương Thể nghênh chính diện', 'thân bất hoại nuốt trọn cường kích'] },
  // --- TUYỆT (cực hiếm) ---
  { id: 'bk_thaihu', ten: 'Thái Hư Kiếm Ý', loai: 'kiem', tier: 'tuyệt', he: 'kim', lore: 'Kiếm ý hợp với hư không, vô chiêu thắng hữu chiêu — một niệm phân sinh tử.', chieu: ['kiếm ý hợp hư không, vô chiêu thắng hữu chiêu', 'một niệm Thái Hư, kiếm tới trước cả ý'] },
  { id: 'bk_votuong', ten: 'Vô Tướng Ma Công', loai: 'am', tier: 'tuyệt', he: 'moc', lore: 'Ma công vô tướng vô hình, sát chiêu đến từ nơi không ai ngờ tới.', chieu: ['ám khí Vô Tướng đến từ hư vô', 'sát chiêu vô hình không cách nào phòng'] },
];
export const BI_KIP_BY_ID = {}; BI_KIP.forEach((b) => { BI_KIP_BY_ID[b.id] = b; });
export const BI_KIP_KEYS = BI_KIP.map((b) => b.id);
// stat mods 1 bí kíp (đã nhân bậc) — trả {stat: value}
export function biKipMods(bk) { const out = {}; if (!bk) return out; const prof = (BI_KIP_LOAI[bk.loai] || {}).prof || {}, mul = (BI_KIP_TIER[bk.tier] || {}).mul || 1; for (const k in prof) out[k] = prof[k] * mul; return out; }
export function biKipPower(bk) { return bk ? Math.round(55 * ((BI_KIP_TIER[bk.tier] || {}).mul || 1)) : 0; }   // +Chiến Lực side-only / bí kíp
export function biKipSlotMax(realm) { return 1 + Math.floor((realm || 0) / 2); }   // trần số bí kíp học được theo cảnh giới (realm 0→1 ... 9→5)
export function biKipLearnH(bk) { return bk ? ((BI_KIP_TIER[bk.tier] || {}).learnH || 6) : 6; }

// --- ĐẤU GIÁ BÍ KÍP: phiên rao bán N lô bí kíp ở Đấu Giá Hội, làm mới mỗi BK_AUCTION_REFRESH_H giờ. Tiêu Điểm Đấu Giá (sinh từ Tàng Thư Lâu). Bậc cao hiếm + GATE theo cấp Tàng Thư Lâu (kho càng giàu, bí lục càng quý). SIDE-ONLY. DRAFT — tune. ---
export const BK_AUCTION_SLOTS = 4;            // số lô mỗi phiên
export const BK_AUCTION_REFRESH_H = 8;        // giờ làm mới phiên (bán hết -> đợi phiên sau = rate-limit "assist CHẬM")
export const BK_AUCTION_PRICE = { 'sơ': 60, 'trung': 200, 'cao': 650, 'tuyệt': 1600 };   // Điểm theo bậc
export const BK_TIER_GATE  = { 'sơ': 0, 'trung': 1, 'cao': 3, 'tuyệt': 5 };               // cấp Tàng Thư Lâu tối thiểu để lô bậc này xuất hiện
export function bkLotPrice(tier) { return Math.round((BK_AUCTION_PRICE[tier] || 100) * (0.9 + Math.random() * 0.3)); }
// sinh 1 phiên đấu giá: chọn (không trùng) theo weight bậc (sơ/trung dễ ra, cao/tuyệt hiếm), lọc theo gate cấp Tàng Thư Lâu
export function genBkAuction(tangThuLv) {
  const lv = tangThuLv || 0;
  const pool = BI_KIP.filter((b) => (BK_TIER_GATE[b.tier] || 0) <= lv);
  const used = new Set(), lots = [];
  let guard = 0;
  while (lots.length < BK_AUCTION_SLOTS && guard++ < 300) {
    let tot = 0; pool.forEach((b) => { if (!used.has(b.id)) tot += (BI_KIP_TIER[b.tier] || {}).weight || 1; });
    if (tot <= 0) break;
    let r = Math.random() * tot, pick = null;
    for (const b of pool) { if (used.has(b.id)) continue; r -= (BI_KIP_TIER[b.tier] || {}).weight || 1; if (r <= 0) { pick = b; break; } }
    if (!pick) break;
    used.add(pick.id);
    lots.push({ id: pick.id, price: bkLotPrice(pick.tier) });
  }
  return lots;
}

// --- RƠI BÍ KÍP TỪ BÍ CẢNH (main -> phụ 1 chiều, vào biKipBag tông môn). Bậc tối đa GATE theo độ khó phó bản (reqLevel): bí lục quý chỉ rơi ở bí cảnh thâm sâu. SIDE-ONLY. DRAFT. ---
export const BICANH_BK_CHANCE = 0.06;   // xác suất nền khi THÔNG QUAN (×mode doPhoMul ×cơ duyên) — tune
export function biCanhBkMaxTier(reqLevel) {
  const lv = reqLevel || 0;
  if (lv >= 90) return 'tuyệt';
  if (lv >= 70) return 'cao';
  if (lv >= 40) return 'trung';
  return 'sơ';
}
export function rollBiCanhBiKip(reqLevel) {
  const maxIdx = BI_KIP_TIER_ORDER.indexOf(biCanhBkMaxTier(reqLevel));
  const pool = BI_KIP.filter((b) => BI_KIP_TIER_ORDER.indexOf(b.tier) <= maxIdx);
  if (!pool.length) return null;
  let tot = 0; pool.forEach((b) => { tot += (BI_KIP_TIER[b.tier] || {}).weight || 1; });
  let r = Math.random() * tot;
  for (const b of pool) { r -= (BI_KIP_TIER[b.tier] || {}).weight || 1; if (r <= 0) return b.id; }
  return pool[0].id;
}

// --- DANH SĨ TRUYỀN DẠY BÍ KÍP (main -> phụ): bậc theo thực lực danh sĩ (rankPower), ưu tiên trùng ngũ hành. DETERMINISTIC (hashVal từ h32 phía gọi). capTier giới hạn bậc (kỳ ngộ không gate -> cap Trung; bái sư gate Uy cao -> tới Tuyệt). SIDE-ONLY. DRAFT. ---
export function danhSiBiKipId(rankPower, he, hashVal, capTier) {
  const rp = rankPower || 500;
  let idx = rp >= 880 ? 3 : rp >= 760 ? 2 : rp >= 620 ? 1 : 0;   // tuyệt / cao / trung / sơ theo thực lực
  const capIdx = capTier ? BI_KIP_TIER_ORDER.indexOf(capTier) : 3;
  idx = Math.max(0, Math.min(idx, capIdx < 0 ? 3 : capIdx));
  const tier = BI_KIP_TIER_ORDER[idx];
  const pool = BI_KIP.filter((b) => b.tier === tier);
  const heMatch = pool.filter((b) => b.he === he);
  const use = heMatch.length ? heMatch : pool;
  if (!use.length) return BI_KIP[0].id;
  return use[(hashVal >>> 0) % use.length].id;
}

// ===== TÂM MA KIẾP: tích lũy tâm ma (SỐ d.tamMaLv/tamMaXp) -> nổ KIẾP khi đầy bậc. HYBRID: bậc thấp tự áp chế (auto), bậc cao (>=CHOICE) thành SỰ KIỆN CHỌN. DRAFT — tune theo cảm giác. =====
export const TAMMA_MAX = 5;            // bậc tâm ma tối đa
export const TAMMA_BASE_H = 240;       // giờ thực để đầy 1 bậc ở NỀN (không cờ) — chill, hiếm khi tự tới
export const TAMMA_CHOICE_LV = 3;      // tamMaLv (sau khi tăng) >= mức này -> kiếp thành SỰ KIỆN CHỌN (drama); dưới -> auto tự áp chế
// cờ ĐẨY (dương) / DỊU (âm) tốc tích tâm ma — cộng dồn vào hệ số
export const TAMMA_FLAG_ACCEL = { tamMaSeed: 1.4, oanTham: 1.2, batPhuc: 1.0, phatPhan: 0.4, cuuChuoc: -0.5, triAn: -0.4, daoLu: -0.2 };
export const TAMMA_TRAIT_PRONE = ['Cô Độc', 'Cuồng Ngạo', 'Cao Ngạo', 'Hiếu Chiến', 'Si Tình'];   // tính cách dễ sa tâm ma (+)
export const TAMMA_TRAIT_CALM  = ['Nhân Hậu', 'Trượng Nghĩa', 'Thận Trọng', 'Cần Mẫn'];           // tính cách an định (−)
// 6 bậc tâm ma (0..5): tên + màu (leo từ lục an -> tím -> đỏ phệ)
export const TAMMA_TIERS = [
  { lv: 0, name: 'Đạo Tâm Trong Sáng',  color: '#34d399' },
  { lv: 1, name: 'Tâm Phù Động',        color: '#94a3b8' },
  { lv: 2, name: 'Tâm Ma Chớm Nứt',     color: '#a78bfa' },
  { lv: 3, name: 'Tâm Ma Thâm Trầm',    color: '#f5b942' },
  { lv: 4, name: 'Ma Chướng Triền Thân',color: '#fb923c' },
  { lv: 5, name: 'Tâm Ma Phệ Đỉnh',     color: '#fb7185' },
];
export function tamMaTier(lv) { return TAMMA_TIERS[Math.max(0, Math.min(TAMMA_MAX, lv || 0))]; }
// Hệ số tốc tích tâm ma của 1 đệ tử (theo cờ + tính cách + đạo thống tông). Kẹp 0.2..6.
export function tamMaMult(d, dao) {
  let m = 1;
  for (const k in (d.flags || {})) if (k in TAMMA_FLAG_ACCEL) m += TAMMA_FLAG_ACCEL[k];
  (d.traits || []).forEach((tr) => { if (TAMMA_TRAIT_PRONE.includes(tr)) m += 0.3; if (TAMMA_TRAIT_CALM.includes(tr)) m -= 0.25; });
  if (dao === 'ta') m += 0.5; else if (dao === 'chinh') m -= 0.3;
  return Math.max(0.2, Math.min(6, m));
}

// --- Đấu Giá Hội: tiêu ĐIỂM ĐẤU GIÁ (t.diem). TẤT CẢ phần thưởng SIDE-ONLY / cosmetic (giữ cách ly) ---
// cost DRAFT — tune. input:true -> cần nhập tên · dao:true -> chọn Chính/Tà/Trung
export const TM_SHOP = [
  { id: 'khiVan',  name: 'Khí Vận Phù',       han: '運', cost: 80,  color: '#22d3ee', desc: 'Tế trời cầu vận — +15 Khí Vận tông môn (tối đa 100).' },
  { id: 'recruit', name: 'Chiêu Hiền Lệnh',   han: '賢', cost: 150, color: '#34d399', desc: 'Truyền hịch khắp giang hồ — làm mới lứa Chiêu Hiền, tư chất vượt trội hơn hẳn.' },
  { id: 'advisor', name: 'Cố Vấn Điểm Hóa',   han: '悟', cost: 200, cdH: 24, color: '#a78bfa', desc: 'Mời cao nhân giảng đạo — toàn bộ đệ tử đang tu +25% tiến độ cảnh giới. (mỗi 24h)' },
  { id: 'calm',    name: 'Tịnh Tâm Lệnh',     han: '淨', cost: 250, cdH: 24, color: '#93c5fd', desc: 'Lập đàn tịnh tâm — gột sạch cờ xấu (oán thầm / mầm tâm ma / bất phục…) toàn tông. (mỗi 24h)' },
  { id: 'rename',  name: 'Đổi Tên Tông Môn',  han: '名', cost: 300, color: '#f5b942', desc: 'Khắc lại biển hiệu sơn môn — đặt một tên mới cho tông.', input: true },
  { id: 'dao',     name: 'Cải Đạo Tông Môn',  han: '道', cost: 400, color: '#e879f9', desc: 'Chuyển hướng đạo thống (Chính / Tà / Trung Dung) — đổi cách giang hồ nhìn tông.', dao: true },
];
// chi phí nâng 1 công trình lên bậc kế (DRAFT — TUNE): theo bậc hiện tại
export function buildCost(lv) { return { bac: Math.round(800 * Math.pow(1.9, lv)), congHien: Math.round(40 * Math.pow(1.7, lv)) }; }

// ---- Sinh 1 đệ tử ngẫu nhiên (ứng viên chiêu mộ / starter) ----
let _uidc = 1;
export function genDisciple(opt = {}) {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const wPick = (keys, weightOf) => { let t = 0; keys.forEach((k) => (t += weightOf(k))); let r = Math.random() * t; for (const k of keys) { r -= weightOf(k); if (r <= 0) return k; } return keys[0]; };
  const sex = opt.sex || (Math.random() < 0.5 ? 'nam' : 'nu');
  const apt = opt.apt || wPick(APT_KEYS, (k) => APT[k].w);
  const origin = opt.origin || pick(ORIGINS).key;
  const i = Math.floor(Math.random() * (sex === 'nam' ? TEN_NAM : TEN_NU).length);
  const ten = sex === 'nam' ? TEN_NAM[i] : TEN_NU[i];
  const han = (sex === 'nam' ? HAN_NAM : HAN_NU)[i] || '俠';
  const nT = Math.random() < 0.35 ? 2 : 1;
  const traits = []; while (traits.length < nT) { const t = pick(TRAITS); if (!traits.includes(t)) traits.push(t); }
  return {
    uid: 'd' + (Date.now().toString(36)) + (_uidc++),
    name: opt.name || (pick(HO) + ' ' + ten),
    sex, han: opt.han || han, origin, originLabel: originLabelOf(origin, sex), bio: originBioOf(origin, sex), apt,
    he: opt.he || pick(HE_KEYS),
    traits, dream: pick(DREAMS), tamMa: pick(TAMMA),   // tamMa = LORE STRING (hiển thị) — KHÔNG phải số
    tamMaLv: 0, tamMaXp: 0,                            // hệ Tâm Ma Kiếp (SỐ): tamMaLv = bậc tâm ma (mức độ), tamMaXp = tích lũy trong bậc (0..1)
    realm: 0, xp: 0, capBonus: 0, giangBonus: 0,   // capBonus: bậc trần được NÂNG (sự kiện + Giảng Đạo); giangBonus: phần đến TỪ Giảng Đạo (cap GIANG_MAX_BONUS)
    flags: {},                              // cờ do SỰ KIỆN gắn (daoLu/oanTham/tamMaSeed/biệt hiệu…) — side-only
    skills: [],                             // bí kíp đã LĨNH NGỘ (id BI_KIP) — side-only, cộng disciStats/Luận Võ/Uy
    gear: {},                               // { slotId: gearInstance } — Gia Bảo, side-only
    state: 'tu',                            // tu | rest
    awaiting: false,                        // chờ Đắc Đạo -> chọn Xuất Sư/Trưởng Lão
    bornAt: Date.now(),
  };
}

// Trần TUYỆT ĐỐI theo tư chất: Đắc Đạo (9) ĐỘC QUYỀN Thiên Tư — non-Thiên tối đa Độ Kiếp (8). 1 NGUỒN (chống lệch 4 chỗ: disciCap/giangAbsMax/sim/UI).
export function aptHardCap(d) { return (d && d.apt === 'thien') ? 9 : 8; }
// trần cảnh giới thực = min(trần tuyệt đối, trần tư chất + capBonus).
export function disciCap(d) { return Math.min(aptHardCap(d), APT[d.apt].cap + (d.capBonus || 0)); }
