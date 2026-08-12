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
export const DUR_DECAY_DAYS = 40;        // ĐỘ BỀN: 100% -> 0% trong 40 ngày (2,5%/ngày)
export const DUR_REPAIR_BELOW = 80;      // chỉ mở Sửa Chữa khi độ bền < 80%
const H = 3600 * 1000, M = 60 * 1000;
const DUR_MS = DUR_DECAY_DAYS * 24 * 3600 * 1000;

// --- 7 bậc Nhà Chính (index 0..6; bậc 0 = bãi đất trống, không thi công) ---
// reqLevel = gate Doanh Tạo để khởi công TỚI bậc đó. mats keyed theo itemId (data/items.js).
// lore = văn cổ thư (user tự viết, đã duyệt ở mockup — port nguyên văn).
export const HOUSE_TIERS = [
  { lv: 0, name: 'Bãi Đất Trống', img: 'nha_0',
    lore: 'Mảnh đất hoang sơ, Linh Mạch còn chưa thức tỉnh. Chỉ từ một nền đá đầu tiên, Tông Môn bắt đầu dựng cơ nghiệp.' },
  { lv: 1, name: 'Thảo Lư', img: 'nha_1', reqLevel: 1, buildMs: 12 * H, bac: 300000,
    mats: { vanYeu: 400, datSet: 300, cat: 200 },
    lore: 'Thảo Lư nép giữa rừng, một ngọn đèn sáng trong đêm. Tuy còn đơn sơ, nơi đây đã đủ yên tĩnh để dưỡng khí và tu tâm.' },
  { lv: 2, name: 'Mộc Xá', img: 'nha_2', reqLevel: 10, buildMs: 24 * H, bac: 600000,
    mats: { vanYeu: 1000, gach: 800, thietKhau: 200 },
    lore: 'Mộc Xá vừa dựng xong, khói trà còn vương. Môn nhân có chỗ an cư, ban ngày luyện võ, ban đêm tu khí.' },
  { lv: 3, name: 'Trạch Viện', img: 'nha_3', reqLevel: 18, buildMs: 36 * H, bac: 1100000,
    mats: { thanhNgoa: 1200, luongMoc: 500, gach: 600, thietKhau: 300 },
    lore: 'Tường cao ngói xanh, cổng viện khép sâu. Căn cơ Tông Môn dần ổn định, đã có thể thu nhận đệ tử và lập quy củ.' },
  { lv: 4, name: 'Sơn Trang', img: 'nha_4', reqLevel: 24, buildMs: 54 * H, bac: 2000000,
    mats: { thachChuyen: 1500, thanhNgoa: 800, luongMoc: 500, gach: 800, thietKhau: 400 },
    lore: 'Sơn Trang dựa lưng vào núi, lầu viện nối tiếp nhau. Khí vận dần hội tụ, danh tiếng cũng bắt đầu lan trong giang hồ.' },
  { lv: 5, name: 'Phủ Đệ', img: 'nha_5', reqLevel: 30, buildMs: 72 * H, bac: 3300000,
    mats: { hanNgocChuyen: 1600, tinhThachSong: 600, thachChuyen: 1000, thanhNgoa: 800, luongMoc: 500 },
    lore: 'Phủ Đệ uy nghi, đèn dài đêm không tắt. Khách khứa tìm đến, đệ tử trong môn ngày một đông.' },
  { lv: 6, name: 'Động Phủ', img: 'nha_6', reqLevel: 38, buildMs: 96 * H, bac: 5000000,
    mats: { kimTatTru: 1500, hanNgocChuyen: 2500, thachChuyen: 2500, tinhThachSong: 1000, thanhNgoa: 2000, thietKhau: 1000 },
    lore: 'Động Thiên mở thành một cõi riêng, Linh Khí tụ như mây. Người tu hành ẩn cư bên trong, Đạo Thống từ đây có nơi truyền nối lâu dài.' },
];

// --- 3 công trình phụ đặc biệt (gắn mini-game) ---
// levels[i] = chi phí TỚI bậc (i+1). buildable=false -> chưa cho xây (Trảm Yêu Đài / Diễn Võ Trường).
export const BUILDINGS = {
  mongDai: {
    key: 'mongDai', name: 'Mộng Đài', img: 'mongdai', nav: 'dangTienMong',
    type: 'Đăng Tiên Mộng', reqHouse: 1, maxLv: 3, buildable: true,
    func: 'Nơi giao nhau giữa hư và thực. Bước lên đài để nhập mộng, trải nghiệm các thú vui trong mộng cảnh và tìm cơ duyên Ngộ Đạo.',
    lore: 'Hương khói dẫn lối vào U Mộng. Môn nhân tĩnh tâm nhập cảnh, tham ngộ huyền cơ và chờ Linh Cơ tự hiện.',
    tags: ['Mộng Cảnh', 'Ngộ Đạo', 'Cơ Duyên'],
    eff: [
      'Giới Hạn Quy Đổi Tuần: 60 → 70 Nguyên Bảo',
      '+10% Mộng Ngân mỗi ván · giới hạn → 75',
      'Mở Thâm Mộng · giới hạn → 80',
    ],
    levels: [
      { bac: 20000, buildMs: 12 * H, mats: { gach: 500, vanYeu: 500, thietKhau: 150 } },
      { bac: 100000, buildMs: 24 * H, mats: { gach: 1000, thanhNgoa: 600, luongMoc: 400 } },
      { bac: 440000, buildMs: 48 * H, mats: { thachChuyen: 800, tinhThachSong: 400, hanNgocChuyen: 500 } },
    ],
  },
  tramYeuDai: {
    key: 'tramYeuDai', name: 'Trảm Yêu Đài', img: 'tramyeu', nav: 'kyTran',
    type: 'Kỳ Trận Trảm Yêu', reqHouse: 2, maxLv: 3, buildable: true,
    func: 'Bày trận đồ cửu cung, triệu Kỳ Trận trảm yêu ngay tại gia — thêm lượt xuất trận mỗi tuần.',
    lore: 'Cửu Cung bày trận, Pháp Kiếm trấn đàn. Phù Hỏa vừa cháy, Yêu Vụ tan dần, giúp bảo vệ sơn môn khỏi Tà Khí.',
    tags: ['Trảm Yêu', 'Trận Đồ'],
    eff: [
      'Lượt Kỳ Trận Mỗi Tuần: 12 → 13',
      '+1 lượt xuất trận · tuần → 14',
      '+1 lượt xuất trận · tuần → 15',
    ],
    levels: [
      { bac: 22000, buildMs: 12 * H, mats: { gach: 550, vanYeu: 550, thietKhau: 160 } },
      { bac: 110000, buildMs: 24 * H, mats: { gach: 1100, thanhNgoa: 660, luongMoc: 440 } },
      { bac: 440000, buildMs: 48 * H, mats: { thachChuyen: 880, tinhThachSong: 440, hanNgocChuyen: 550 } },
    ],
  },
  dienVoTruong: {
    key: 'dienVoTruong', name: 'Diễn Võ Trường', img: 'dienvo',
    type: 'Quần Hùng Kỳ Trận', reqHouse: 99, maxLv: 0, buildable: false,
    grey: true, badge: 'Chưa Khai Phá',
    tease: 'Đất trống ngàn thước, chờ ngày quần hùng khai chiến.',
    lore: 'Diễn Võ Trường mở cửa, quần hùng tụ hội. Trên đài cao, thắng bại có khi chỉ được định trong một chưởng.',
    tags: ['Autochess', 'Chưa Mở'],
  },
};
export const BUILDING_KEYS = ['mongDai', 'tramYeuDai', 'dienVoTruong'];

// ---- Khởi tạo + vá save cũ (idempotent, fail-safe job mồ côi) ----
export function ensureDongPhu(state, now) {
  const _n = now || Date.now();
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
  // ĐỘ BỀN: dur[key] = mốc thời gian ĐẦY 100% gần nhất (xây/nâng/sửa). Save cũ / công trình đã có mà thiếu mốc -> coi như vừa đầy (không phạt hồi tố).
  if (!dp.dur || typeof dp.dur !== 'object') dp.dur = {};
  if ((dp.house || 0) >= 1 && !dp.dur.house) dp.dur.house = _n;
  for (const k of BUILDING_KEYS) if ((dp.buildings[k] || 0) >= 1 && !dp.dur[k]) dp.dur[k] = _n;
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
  if (!dp.dur) dp.dur = {};
  dp.dur[b.target] = b.endsAt;                            // vừa xây/nâng xong -> độ bền 100% tính từ lúc hoàn công
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

// ---- ĐỘ BỀN + SỬA CHỮA (thuần, tính theo giờ thực, offline-safe) ----
function currentBuildMats(state, key) {   // bộ liệu xây CẤP HIỆN TẠI (nền tính chi phí sửa theo %)
  const dp = state.dongPhu || {};
  if (key === 'house') { const t = HOUSE_TIERS[dp.house || 0]; return (t && t.mats) || {}; }
  const B = BUILDINGS[key]; const lv = (dp.buildings && dp.buildings[key]) || 0;
  return (B && B.levels && B.levels[lv - 1] && B.levels[lv - 1].mats) || {};
}
export function constructionExists(state, key) {
  const dp = state.dongPhu; if (!dp) return false;
  return key === 'house' ? (dp.house || 0) >= 1 : !!(dp.buildings && (dp.buildings[key] || 0) >= 1);
}
// Độ bền hiện tại 0..100 (null nếu công trình chưa tồn tại). Hao tuyến tính 100→0 trong DUR_DECAY_DAYS.
export function durabilityPct(state, key, now) {
  if (!constructionExists(state, key)) return null;
  const t0 = state.dongPhu.dur && state.dongPhu.dur[key];
  if (!t0) return 100;
  return Math.max(0, Math.min(100, 100 - ((now - t0) / DUR_MS) * 100));
}
// Chức năng còn hiệu lực? >0% = đầy đủ; =0% = TẮT + khóa truy cập. Chưa xây -> false.
export function isFunctional(state, key, now) {
  const p = durabilityPct(state, key, now);
  return p != null && p > 0;
}
// Công trình phụ có VÀO được mini-game không (đã xây + độ bền > 0). Dùng cho gate nav.
export function buildingUsable(state, key, now) {
  return constructionExists(state, key) && isFunctional(state, key, now == null ? Date.now() : now);
}
// Chi phí sửa về 100% (null nếu chưa cần sửa / không có công trình).
export function repairCost(state, key, now) {
  const p = durabilityPct(state, key, now);
  if (p == null || p >= DUR_REPAIR_BELOW) return null;
  const frac = (100 - p) / 100, base = currentBuildMats(state, key), mats = {};
  for (const id in base) mats[id] = Math.ceil(base[id] * frac);
  return { pct: p, mats };
}
export function repairBuild(state, key, now) {
  const c = repairCost(state, key, now);
  if (!c) return { ok: false, msg: 'Chưa cần sửa (độ bền còn ≥80%) hoặc không có công trình.' };
  for (const id in c.mats) if ((state.inventory[id] || 0) < c.mats[id]) return { ok: false, msg: 'Thiếu nguyên liệu.' };
  for (const id in c.mats) { state.inventory[id] = (state.inventory[id] || 0) - c.mats[id]; if (state.inventory[id] <= 0) delete state.inventory[id]; }
  if (!state.dongPhu.dur) state.dongPhu.dur = {};
  state.dongPhu.dur[key] = now;                            // về 100% (mốc mới = now)
  return { ok: true, mats: c.mats };
}

// ---- Knob thuần (đọc bởi hệ khác) — CÁCH LY: chiều phụ thuộc luôn HƯỚNG VÀO dongphu. Gate theo ĐỘ BỀN. ----
export function dongPhuCapBonusH(state) {
  const h = (state.dongPhu && state.dongPhu.house) || 0;
  if (h < 1) return 0;
  if (!isFunctional(state, 'house', Date.now())) return 0;    // nhà hỏng (0%) -> mất bonus trần treo, về nền
  return Math.min(6, h);
}
export function dtmBridgeWeekCap(state) {
  const lv = (state.dongPhu && state.dongPhu.buildings && state.dongPhu.buildings.mongDai) || 0;
  if (lv < 1) return 60;                                       // chưa xây Mộng Đài -> trần nền 60
  if (!isFunctional(state, 'mongDai', Date.now())) return 0;   // xây rồi mà hỏng (0%) -> KHÓA quy đổi (không đổi được)
  return [60, 70, 75, 80][Math.min(3, lv)];
}
export function dtmMongNganMult(state) {
  const lv = (state.dongPhu && state.dongPhu.buildings && state.dongPhu.buildings.mongDai) || 0;
  if (lv < 2 || !isFunctional(state, 'mongDai', Date.now())) return 1.0;
  return 1.10;
}
export function dongPhuThamMongOpen(state) {
  const lv = (state.dongPhu && state.dongPhu.buildings && state.dongPhu.buildings.mongDai) || 0;
  return lv >= 3 && isFunctional(state, 'mongDai', Date.now());
}
// Trảm Yêu Đài -> +1 lượt Kỳ Trận/tuần mỗi bậc (gate độ bền: hỏng 0% -> mất bonus, về nền).
export function dongPhuTramYeuBonus(state) {
  const lv = (state.dongPhu && state.dongPhu.buildings && state.dongPhu.buildings.tramYeuDai) || 0;
  if (lv < 1) return 0;
  if (!isFunctional(state, 'tramYeuDai', Date.now())) return 0;
  return lv;
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
