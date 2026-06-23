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
  tuHien:  { name: 'Tụ Hiền Đường', han: '宗', desc: 'Tăng số đệ tử nuôi được + mở Chiêu Hiền.', slotBase: 4, slotPerLv: 1 },
  dienVo:  { name: 'Diễn Võ Trường', han: '武', desc: 'Tăng tốc tu luyện toàn bộ đệ tử.', buffPerLv: 0.06 },
  tangThu: { name: 'Tàng Thư Lâu',  han: '書', desc: 'Sinh Điểm Đấu Giá theo giờ.', diemPerLvH: 12 },
  yQuan:   { name: 'Y Quán',        han: '醫', desc: 'Luyện đan đột phá theo CÔNG THỨC (tốn nguyên liệu trong Túi Đồ). Cấp cao mở luyện đan bậc cao hơn.' },
  tuLinh:  { name: 'Tụ Linh Trận',  han: '陣', desc: 'Tăng Khí Vận + chút tốc tu luyện.', khiPerLv: 4 },
};
export const BUILD_KEYS = ['tuHien', 'dienVo', 'tangThu', 'yQuan', 'tuLinh'];

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

// ===== LỊCH LUYỆN: phái đệ tử RẢNH đi kiếm nguyên liệu (nguồn chính, không mua-điểm) =====
export const LICH_LUYEN_H = 4;   // giờ thực / chuyến (DRAFT)
export function lichLuyenTier(realm) { return realm <= 1 ? 1 : (realm <= 3 ? 2 : 3); }   // bậc liệu theo cảnh giới đệ tử

// --- Đấu Giá Hội: tiêu ĐIỂM ĐẤU GIÁ (t.diem). TẤT CẢ phần thưởng SIDE-ONLY / cosmetic (giữ cách ly) ---
// cost DRAFT — tune. input:true -> cần nhập tên · dao:true -> chọn Chính/Tà/Trung
export const TM_SHOP = [
  { id: 'khiVan',  name: 'Khí Vận Phù',       han: '運', cost: 80,  desc: 'Tế trời cầu vận — +15 Khí Vận tông môn (tối đa 100).' },
  { id: 'recruit', name: 'Chiêu Hiền Lệnh',   han: '賢', cost: 150, desc: 'Truyền hịch khắp giang hồ — làm mới lứa Chiêu Hiền, tư chất vượt trội hơn hẳn.' },
  { id: 'advisor', name: 'Cố Vấn Điểm Hóa',   han: '悟', cost: 200, cdH: 24, desc: 'Mời cao nhân giảng đạo — toàn bộ đệ tử đang tu +25% tiến độ cảnh giới. (mỗi 24h)' },
  { id: 'calm',    name: 'Tịnh Tâm Lệnh',     han: '淨', cost: 250, cdH: 24, desc: 'Lập đàn tịnh tâm — gột sạch cờ xấu (oán thầm / mầm tâm ma / bất phục…) toàn tông. (mỗi 24h)' },
  { id: 'rename',  name: 'Đổi Tên Tông Môn',  han: '名', cost: 300, desc: 'Khắc lại biển hiệu sơn môn — đặt một tên mới cho tông.', input: true },
  { id: 'dao',     name: 'Cải Đạo Tông Môn',  han: '道', cost: 400, desc: 'Chuyển hướng đạo thống (Chính / Tà / Trung Dung) — đổi cách giang hồ nhìn tông.', dao: true },
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
    traits, dream: pick(DREAMS), tamMa: pick(TAMMA),
    realm: 0, xp: 0, capBonus: 0,          // capBonus: số bậc trần được NÂNG (Gia Bảo/kỳ ngộ…)
    flags: {},                              // cờ do SỰ KIỆN gắn (daoLu/oanTham/tamMaSeed/biệt hiệu…) — side-only
    gear: {},                               // { slotId: gearInstance } — Gia Bảo, side-only
    state: 'tu',                            // tu | rest
    awaiting: false,                        // chờ Đắc Đạo -> chọn Xuất Sư/Trưởng Lão
    bornAt: Date.now(),
  };
}

// trần cảnh giới thực của 1 đệ tử = trần tư chất + capBonus (tối đa 9 = Đắc Đạo)
export function disciCap(d) { return Math.min(9, APT[d.apt].cap + (d.capBonus || 0)); }
