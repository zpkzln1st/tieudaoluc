// ============================================================
// ENGINE — ĐỘNG PHỦ (nhà riêng) — THUẦN, CÁCH LY 0-POWER.
//   Chỉ đọc-ghi state.dongPhu. Ảnh hưởng ĐÚNG HAI thứ ra ngoài:
//     (1) trần treo máy idleCapMs  -> qua dongPhuCapBonusH(state)
//     (2) điều kiện reqHouse dựng công trình phụ.
//   KHÔNG chạm deriveCombat / gearBag / Tứ Trụ / stats. Không buff sức mạnh.
//   DTM chỉ ĐỌC knob thuần (dtmBridgeWeekCap / dtmMongNganMult / dongPhuThamMongOpen);
//   engine này KHÔNG import gì từ Đăng Tiên Mộng.
//   Tiền + vật liệu chảy MỘT CHIỀU VÀO. Hủy Xây hoàn 100% liệu, MẤT Bạc.
// ============================================================
import { levelFromXp } from './leveling.js';

export const DONGPHU_MAX_HOUSE = 6;
export const IDLE_BASE_H = 8;            // trần treo NỀN (khớp settings.idleCapHours mặc định)
const H = 3600 * 1000, M = 60 * 1000;

// --- 7 bậc Nhà Chính (index 0..6; bậc 0 = bãi đất trống, không thi công) ---
// reqLevel = gate Doanh Tạo để khởi công TỚI bậc đó. mats keyed theo itemId (data/items.js).
// lore = văn cổ thư (user tự viết, đã duyệt ở mockup — port nguyên văn).
export const HOUSE_TIERS = [
  { lv: 0, name: 'Bãi Đất Trống', img: 'nha_0',
    lore: 'Hoang địa sơ khai, linh mạch vị tỉnh. Nhất thạch định cơ, tông môn tự thử khai thiên.' },
  { lv: 1, name: 'Thảo Lư', img: 'nha_1', reqLevel: 1, buildMs: 30 * M, bac: 500,
    mats: { vanYeu: 40, datSet: 30, cat: 20 },
    lore: 'Thảo lư lâm phong, cô đăng chiếu dạ. Tuy vô hoa vũ, diệc khả tĩnh tâm dưỡng khí.' },
  { lv: 2, name: 'Mộc Xá', img: 'nha_2', reqLevel: 10, buildMs: 2 * H, bac: 2000,
    mats: { vanYeu: 100, gach: 80, thietKhau: 20 },
    lore: 'Mộc xá sơ thành, trà yên vị tán. Môn nhân an cư ư thử, trú tập võ, dạ luyện khí.' },
  { lv: 3, name: 'Trạch Viện', img: 'nha_3', reqLevel: 18, buildMs: 6 * H, bac: 8000,
    mats: { thanhNgoa: 120, luongMoc: 50, gach: 60, thietKhau: 30 },
    lore: 'Thanh ngõa cao tường, viện môn thâm bế. Tông môn căn cơ tiệm ổn, khả thu đồ lập quy.' },
  { lv: 4, name: 'Sơn Trang', img: 'nha_4', reqLevel: 24, buildMs: 12 * H, bac: 30000,
    mats: { thachChuyen: 150, thanhNgoa: 80, luongMoc: 50, gach: 80, thietKhau: 40 },
    lore: 'Sơn trang y lĩnh, lâu viện tương liên. Nhất phương khí vận tiệm tụ, thanh danh thủy động giang hồ.' },
  { lv: 5, name: 'Phủ Đệ', img: 'nha_5', reqLevel: 30, buildMs: 24 * H, bac: 100000,
    mats: { hanNgocChuyen: 160, tinhThachSong: 60, thachChuyen: 100, thanhNgoa: 80, luongMoc: 50 },
    lore: 'Phủ đệ nguy nhiên, trường đăng bất diệt. Tân khách quy phụ, môn hạ đệ tử nhật thịnh.' },
  { lv: 6, name: 'Động Phủ', img: 'nha_6', reqLevel: 38, buildMs: 48 * H, bac: 300000,
    mats: { kimTatTru: 150, hanNgocChuyen: 250, thachChuyen: 250, tinhThachSong: 100, thanhNgoa: 200, thietKhau: 100 },
    lore: 'Động thiên khai cảnh, linh khí thành vân. Chân tu ẩn ư kỳ nội, đạo thống trường tồn bất diệt.' },
];

// --- 3 công trình phụ đặc biệt (gắn mini-game) ---
// levels[i] = chi phí TỚI bậc (i+1). buildable=false -> chưa cho xây (Trảm Yêu Đài / Diễn Võ Trường).
export const BUILDINGS = {
  mongDai: {
    key: 'mongDai', name: 'Mộng Đài', img: 'mongdai', nav: 'dangTienMong',
    type: 'Đăng Tiên Mộng', reqHouse: 1, maxLv: 3, buildable: true,
    func: 'Nơi kết nối hư thực, đăng đài nhập mộng — nuôi dưỡng thú vui mộng cảnh, thu cơ duyên ngộ đạo.',
    lore: 'U mộng nhập đài, hương yên dẫn duyên. Môn nhân ngưng thần nhập cảnh, tham huyền ngộ đạo, linh cơ tự hiện.',
    tags: ['Mộng Cảnh', 'Ngộ Đạo', 'Cơ Duyên'],
    eff: [
      'Trần hỗ trợ tuần: 60 → 70 Nguyên Bảo',
      '+10% Mộng Ngân mỗi ván · trần → 75',
      'Mở Thâm Mộng · trần → 80',
    ],
    levels: [
      { bac: 2000, buildMs: 4 * H, mats: { gach: 50, vanYeu: 50, thietKhau: 15 } },
      { bac: 10000, buildMs: 12 * H, mats: { gach: 100, thanhNgoa: 60, luongMoc: 40 } },
      { bac: 40000, buildMs: 24 * H, mats: { thachChuyen: 80, tinhThachSong: 40, hanNgocChuyen: 50 } },
    ],
  },
  tramYeuDai: {
    key: 'tramYeuDai', name: 'Trảm Yêu Đài', img: 'tramyeu',
    type: 'Kỳ Trận Trảm Yêu', reqHouse: 2, maxLv: 3, buildable: false,
    badge: 'Sắp Khai Mở', note: 'Cần tích hợp Kỳ Trận Trảm Yêu',
    func: 'Bày trận đồ cửu cung, triệu Kỳ Trận trảm yêu ngay tại gia.',
    lore: 'Cửu cung bố trận, pháp kiếm trấn đàn. Phù hỏa nhất khởi, yêu vụ tận tán, tà khí bất xâm sơn môn.',
    tags: ['Trảm Yêu', 'Trận Đồ'],
    eff: ['Mở Kỳ Trận Trảm Yêu', 'Mở chương gauntlet mới', 'Chế độ Nhật Trảm'],
    levels: [
      { bac: 2200, buildMs: 4 * H, mats: { gach: 55, vanYeu: 55, thietKhau: 16 } },
      { bac: 11000, buildMs: 12 * H, mats: { gach: 110, thanhNgoa: 66, luongMoc: 44 } },
      { bac: 44000, buildMs: 24 * H, mats: { thachChuyen: 88, tinhThachSong: 44, hanNgocChuyen: 55 } },
    ],
  },
  dienVoTruong: {
    key: 'dienVoTruong', name: 'Diễn Võ Trường', img: 'dienvo',
    type: 'Quần Hùng Kỳ Trận', reqHouse: 99, maxLv: 0, buildable: false,
    grey: true, badge: 'Chưa Khai Phá',
    tease: 'Đất trống ngàn thước, chờ ngày quần hùng khai chiến.',
    lore: 'Diễn võ trường khai, quần hùng tề tụ. Đài cao kỳ liệt, thắng phụ nhất chưởng chi gian.',
    tags: ['Autochess', 'Chưa Mở'],
  },
};
export const BUILDING_KEYS = ['mongDai', 'tramYeuDai', 'dienVoTruong'];

// ---- Khởi tạo + vá save cũ (idempotent, fail-safe job mồ côi) ----
export function ensureDongPhu(state) {
  if (!state.dongPhu || typeof state.dongPhu !== 'object') state.dongPhu = {};
  const dp = state.dongPhu;
  if (typeof dp.house !== 'number' || !isFinite(dp.house)) dp.house = 0;
  dp.house = Math.max(0, Math.min(DONGPHU_MAX_HOUSE, Math.floor(dp.house)));
  if (!dp.buildings || typeof dp.buildings !== 'object') dp.buildings = {};
  for (const k of BUILDING_KEYS) {
    const max = k === 'dienVoTruong' ? 0 : BUILDINGS[k].maxLv;
    if (typeof dp.buildings[k] !== 'number' || !isFinite(dp.buildings[k])) dp.buildings[k] = 0;
    dp.buildings[k] = Math.max(0, Math.min(max, Math.floor(dp.buildings[k])));
  }
  if (!Array.isArray(dp.log)) dp.log = [];
  if (typeof dp.doneUnseen !== 'boolean') dp.doneUnseen = false;
  // Validate job đang chạy — job mồ côi/hỏng -> hoàn liệu theo biên lai rồi xóa (fail-safe về phía người chơi).
  if (dp.build != null) {
    const b = dp.build;
    const maxLv = b && b.target === 'house' ? DONGPHU_MAX_HOUSE : (b && BUILDINGS[b.target] ? BUILDINGS[b.target].maxLv : 0);
    const bad = !b || typeof b !== 'object' || !b.target
      || (b.target !== 'house' && !BUILDINGS[b.target])
      || typeof b.toLevel !== 'number' || b.toLevel < 1 || b.toLevel > maxLv
      || typeof b.endsAt !== 'number' || typeof b.startedAt !== 'number';
    if (bad) { _giveMats(state, b && b.paid && b.paid.mats); dp.build = null; }
  } else dp.build = null;
  return dp;
}

// ---- Resolve: job xong theo giờ thực -> nâng bậc (idempotent Math.max). Trả {done} để caller bắn toast. ----
export function resolveDongPhu(state, now) {
  const dp = state.dongPhu; if (!dp || !dp.build) return null;
  const b = dp.build;
  if (now < b.endsAt) return null;                        // chưa xong (đồng hồ lùi -> vô hại)
  if (b.target === 'house') dp.house = Math.max(dp.house || 0, b.toLevel);
  else dp.buildings[b.target] = Math.max(dp.buildings[b.target] || 0, b.toLevel);
  dp.log.unshift({ t: b.endsAt, target: b.target, toLevel: b.toLevel });
  if (dp.log.length > 20) dp.log.length = 20;
  dp.doneUnseen = true;
  dp.build = null;
  return { done: true, target: b.target, toLevel: b.toLevel };
}

// ---- Kế hoạch nâng cấp kế (null nếu đã kịch trần / chưa cho xây) ----
export function planBuild(state, target) {
  const dp = state.dongPhu || {};
  if (target === 'house') {
    const cur = dp.house || 0; if (cur >= DONGPHU_MAX_HOUSE) return null;
    const t = HOUSE_TIERS[cur + 1]; if (!t) return null;
    return { target: 'house', toLevel: cur + 1, bac: t.bac, mats: t.mats, buildMs: t.buildMs, reqLevel: t.reqLevel };
  }
  const B = BUILDINGS[target]; if (!B || !B.buildable || !B.levels) return null;
  const cur = (dp.buildings && dp.buildings[target]) || 0; if (cur >= B.maxLv) return null;
  const c = B.levels[cur]; if (!c) return null;
  return { target, toLevel: cur + 1, bac: c.bac, mats: c.mats, buildMs: c.buildMs, reqHouse: B.reqHouse };
}

// ---- Khởi công: guard 1-job + gate + đủ liệu/Bạc -> trừ atomic, ghi biên lai `paid`. ----
export function startBuild(state, target, now) {
  const dp = state.dongPhu;
  if (!dp) return { ok: false, msg: 'Chưa khởi tạo Động Phủ.' };
  if (dp.build) return { ok: false, msg: 'Đang có công trình thi công — mỗi lúc chỉ một.' };
  const plan = planBuild(state, target);
  if (!plan) return { ok: false, msg: 'Không thể nâng cấp lúc này.' };
  if (target === 'house') {
    const lv = levelFromXp((state.skills && state.skills.doanhTao && state.skills.doanhTao.xp) || 0);
    if (lv < plan.reqLevel) return { ok: false, msg: 'Cần Doanh Tạo cấp ' + plan.reqLevel + '.' };
  } else {
    if ((dp.house || 0) < plan.reqHouse) return { ok: false, msg: 'Cần Nhà Chính bậc ' + plan.reqHouse + '.' };
  }
  if ((state.currencies && state.currencies.bac || 0) < plan.bac) return { ok: false, msg: 'Thiếu Bạc.' };
  for (const id in plan.mats) if ((state.inventory[id] || 0) < plan.mats[id]) return { ok: false, msg: 'Thiếu nguyên liệu.' };
  // trừ atomic
  state.currencies.bac = (state.currencies.bac || 0) - plan.bac;
  for (const id in plan.mats) {
    state.inventory[id] = (state.inventory[id] || 0) - plan.mats[id];
    if (state.inventory[id] <= 0) delete state.inventory[id];
  }
  dp.build = {
    target, toLevel: plan.toLevel, startedAt: now, endsAt: now + plan.buildMs,
    paid: { bac: plan.bac, mats: { ...plan.mats } },   // biên lai — nguồn chân lý khi Hủy Xây
  };
  return { ok: true, build: dp.build };
}

// ---- Hủy Xây: hoàn 100% VẬT LIỆU theo biên lai, MẤT trắng Bạc. ----
export function cancelBuild(state) {
  const dp = state.dongPhu;
  if (!dp || !dp.build) return { ok: false, msg: 'Không có công trình đang thi công.' };
  const b = dp.build;
  _giveMats(state, b.paid && b.paid.mats);
  const lostBac = (b.paid && b.paid.bac) || 0;
  dp.build = null;
  return { ok: true, lostBac };
}

function _giveMats(state, mats) {
  if (!mats || !state) return;
  if (!state.inventory) state.inventory = {};
  for (const id in mats) state.inventory[id] = (state.inventory[id] || 0) + mats[id];
}

// ---- Knob thuần (đọc bởi hệ khác) — CÁCH LY: chiều phụ thuộc luôn HƯỚNG VÀO dongphu ----
export function dongPhuCapBonusH(state) { return Math.min(6, (state.dongPhu && state.dongPhu.house) || 0); }
export function dtmBridgeWeekCap(state) {
  const lv = (state.dongPhu && state.dongPhu.buildings && state.dongPhu.buildings.mongDai) || 0;
  return [60, 70, 75, 80][Math.min(3, lv)];
}
export function dtmMongNganMult(state) {
  const lv = (state.dongPhu && state.dongPhu.buildings && state.dongPhu.buildings.mongDai) || 0;
  return lv >= 2 ? 1.10 : 1.0;
}
export function dongPhuThamMongOpen(state) {
  const lv = (state.dongPhu && state.dongPhu.buildings && state.dongPhu.buildings.mongDai) || 0;
  return lv >= 3;
}

// ---- Helper hiển thị (thuần, không đụng UI) ----
export function houseCapH(house) { return IDLE_BASE_H + Math.min(6, house || 0); }
export function buildingsUnlocked(house) {   // số công trình phụ đã mở (Diễn Võ gác -> không đếm)
  let n = 0;
  for (const k of ['mongDai', 'tramYeuDai']) if (BUILDINGS[k].reqHouse <= (house || 0)) n++;
  return n;
}
export function unlocksAtHouse(house) {       // công trình mở ĐÚNG tại bậc này (cho dòng "Mở Công Trình Phụ")
  const names = [];
  for (const k of ['mongDai', 'tramYeuDai']) if (BUILDINGS[k].reqHouse === house) names.push(BUILDINGS[k].name);
  return names.join(', ') || '—';
}
