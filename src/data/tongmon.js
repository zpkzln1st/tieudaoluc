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
export const HE = {
  kim: { name: 'Kim', han: '金', color: '#cbd5e1' }, moc: { name: 'Mộc', han: '木', color: '#34d399' },
  thuy:{ name: 'Thủy', han: '水', color: '#60a5fa' }, hoa: { name: 'Hỏa', han: '火', color: '#fb923c' },
  tho: { name: 'Thổ', han: '土', color: '#fbbf24' },
};
export const HE_KEYS = ['kim', 'moc', 'thuy', 'hoa', 'tho'];

// --- Tính cách (ảnh hưởng sự kiện sau) ---
export const TRAITS = ['Lì Lợm', 'Cao Ngạo', 'Cần Mẫn', 'Mưu Trí', 'Hiếu Chiến', 'Nhân Hậu', 'Cô Độc', 'Phóng Khoáng', 'Thận Trọng', 'Si Tình', 'Cuồng Ngạo', 'Trượng Nghĩa'];

// --- Xuất thân ---
export const ORIGINS = [
  { key: 'anMay',   label: 'Ăn mày lưu lạc',     bio: 'Một đứa ăn mày nhặt được bên đường ngày mưa, gầy guộc nhưng ánh mắt không chịu khuất phục.' },
  { key: 'tieuThu', label: 'Tiểu thư sa sút',    bio: 'Tiểu thư của một gia tộc nay đã lụi tàn, mang trong lòng nỗi hận phục hưng môn hộ.' },
  { key: 'theGia',  label: 'Võ lâm thế gia',     bio: 'Hậu duệ một thế gia võ lâm, căn cơ vững vàng, kiêu hãnh trong huyết quản.' },
  { key: 'toiDo',   label: 'Tội đồ hoàn lương',  bio: 'Từng là kẻ sát nhân khét tiếng, nay rửa tay gác kiếm tìm một chốn dung thân.' },
  { key: 'tangNhan',label: 'Tăng nhân hạ sơn',   bio: 'Một tăng nhân rời cửa Phật, mang theo Phật pháp lẫn một bí mật chưa nói.' },
  { key: 'nuHiep',  label: 'Nữ hiệp giang hồ',   bio: 'Nữ hiệp phiêu bạt giang hồ, kiếm sắc lòng son, chưa tìm được nơi dừng chân.' },
  { key: 'biAn',    label: 'Lai lịch bí ẩn',     bio: 'Kẻ bịt mặt không rõ lai lịch, võ công cao thâm khó dò, thân thế là một dấu hỏi.' },
];

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
  yQuan:   { name: 'Y Quán',        han: '醫', desc: 'Hóa giải thương thế & tâm ma đệ tử.', },
  tuLinh:  { name: 'Tụ Linh Trận',  han: '陣', desc: 'Tăng Khí Vận + chút tốc tu luyện.', khiPerLv: 4 },
};
export const BUILD_KEYS = ['tuHien', 'dienVo', 'tangThu', 'yQuan', 'tuLinh'];

// --- Đấu Giá Hội: tiêu ĐIỂM ĐẤU GIÁ (t.diem). TẤT CẢ phần thưởng SIDE-ONLY / cosmetic (giữ cách ly) ---
// cost DRAFT — tune. input:true -> cần nhập tên · dao:true -> chọn Chính/Tà/Trung
export const TM_SHOP = [
  { id: 'khiVan',  name: 'Khí Vận Phù',       han: '運', cost: 80,  desc: 'Tế trời cầu vận — +15 Khí Vận tông môn (tối đa 100).' },
  { id: 'recruit', name: 'Chiêu Hiền Lệnh',   han: '賢', cost: 150, desc: 'Truyền hịch khắp giang hồ — làm mới lứa Chiêu Hiền, tư chất vượt trội hơn hẳn.' },
  { id: 'advisor', name: 'Cố Vấn Điểm Hóa',   han: '悟', cost: 200, desc: 'Mời cao nhân giảng đạo — toàn bộ đệ tử đang tu +25% tiến độ cảnh giới.' },
  { id: 'calm',    name: 'Tịnh Tâm Lệnh',     han: '淨', cost: 250, desc: 'Lập đàn tịnh tâm — gột sạch cờ xấu (oán thầm / mầm tâm ma / bất phục…) toàn tông.' },
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
  const oinfo = ORIGINS.find((x) => x.key === origin) || {};
  const i = Math.floor(Math.random() * (sex === 'nam' ? TEN_NAM : TEN_NU).length);
  const ten = sex === 'nam' ? TEN_NAM[i] : TEN_NU[i];
  const han = (sex === 'nam' ? HAN_NAM : HAN_NU)[i] || '俠';
  const nT = Math.random() < 0.35 ? 2 : 1;
  const traits = []; while (traits.length < nT) { const t = pick(TRAITS); if (!traits.includes(t)) traits.push(t); }
  return {
    uid: 'd' + (Date.now().toString(36)) + (_uidc++),
    name: opt.name || (pick(HO) + ' ' + ten),
    sex, han: opt.han || han, origin, originLabel: oinfo.label || '', bio: oinfo.bio || '', apt,
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
