// ============================================================
// ENGINE — Vạn Vật Phổ. Khởi tạo/backfill state.codex, đếm tích lũy, tính Phổ Lực.
// Ghi nhận (đếm) được móc INLINE ở addItem / grantDungeon / tạo pet (không import vòng).
// ============================================================
import { CODEX_CATS } from '../data/codex.js';

// Khởi tạo + backfill 1 lần từ dữ liệu cũ (để tiến độ đã chơi vẫn tính).
export function ensureCodex(state) {
  if (!state.codex) state.codex = {};
  const cx = state.codex;
  if (!cx.obtained) cx.obtained = {};
  if (!cx.dungeonRuns) cx.dungeonRuns = {};
  if (!cx.petSeen) cx.petSeen = {};
  if (!cx._backfilled) {
    const prod = (state.counters && state.counters.produced) || {};
    for (const id in prod) cx.obtained[id] = Math.max(cx.obtained[id] || 0, prod[id] || 0);
    const inv = state.inventory || {};
    for (const id in inv) cx.obtained[id] = Math.max(cx.obtained[id] || 0, inv[id] || 0);
    // Gear loot-hunt: instance trong túi + đang mặc -> Binh Khí Phổ (theo gearId). Hỗ trợ cả id-string (save rất cũ).
    for (const inst of (state.gearBag || [])) { const gid = inst && inst.gearId; if (gid) cx.obtained[gid] = Math.max(cx.obtained[gid] || 0, 1); }
    const eq = state.equipment || {};
    for (const slot in eq) { const v = eq[slot]; const gid = v && (typeof v === 'string' ? v : v.gearId); if (gid) cx.obtained[gid] = Math.max(cx.obtained[gid] || 0, 1); }
    for (const p of (state.pets || [])) { if (p && p.base) cx.petSeen[p.base] = 1; }
    if (state.hatchery && state.hatchery.pet && state.hatchery.pet.base) cx.petSeen[state.hatchery.pet.base] = 1;
    for (const h of ((state.dungeon && state.dungeon.history) || [])) { const id = h && h.dungeonId; if (id) cx.dungeonRuns[id] = (cx.dungeonRuns[id] || 0) + 1; }
    cx._backfilled = 1;
  }
  return cx;
}

// Số tích lũy của 1 entry theo phổ.
export function codexCount(state, catKey, entryId) {
  const cx = state.codex || {};
  switch (catKey) {
    case 'yeuthu': return ((state.counters && state.counters.kills) || {})[entryId] || 0;
    case 'binhkhi': case 'bachtrang': return ((cx.obtained && cx.obtained[entryId]) || 0) > 0 ? 1 : 0;   // món bộ ghép xong -> addGearInstance ghi cx.obtained (chung đường với đồ thường)
    case 'vatpham': return (cx.obtained && cx.obtained[entryId]) || 0;
    case 'linhthu': return (cx.petSeen && cx.petSeen[entryId]) ? 1 : 0;
    case 'bicanh': return (cx.dungeonRuns && cx.dungeonRuns[entryId]) || 0;
    case 'danhsi': return ((state.danhSi && state.danhSi.seen) || []).includes(entryId) ? 1 : 0;
    default: return 0;
  }
}

export function codexCatDone(state, cat) {
  let n = 0;
  for (const e of cat.entries) if (codexCount(state, cat.key, e.id) >= cat.threshold) n++;
  return n;
}

// ⚠⚠ CÁI NÀY TỪNG LÀ 52% CHI PHÍ CỦA MỖI LẦN DẪN XUẤT CHỈ SỐ.
// Nó duyệt **417 mục** của cả bảy phổ (yêu thú 33 · binh khí 112 · vật phẩm 156 · linh thú 10 ·
// bí cảnh 9 · danh sĩ 20 · bách trang 77), mỗi mục vài lượt đọc — mà mọi lượt đọc đều đi qua lớp
// proxy của Alpine nên đắt gấp ~7 lần. Đo được: 81 µs mỗi lần gọi, 1.952 lượt đọc qua proxy.
// Trong một khung kết vòng đánh nó bị gọi tới 22 lần (mỗi chỗ bám chỉ số trong template một lần).
//
// Chữa bằng bộ nhớ đệm THEO THỜI GIAN, cố ý KHÔNG đi liệt kê chỗ ghi:
//   - Trong cùng một khung thì 22 lượt gọi chỉ còn MỘT lần duyệt thật.
//   - Chậm nhất 1 giây là tự tính lại, nên dù có quên chỗ ghi nào cũng tự lành.
// Phổ Lực là bonus VĨNH VIỄN, trễ dưới một giây thì không ai thấy — còn đi đếm cho đủ sáu chỗ
// ghi (addItem · kho trang bị · bộ đếm hạ gục · linh thú · bí cảnh · danh sĩ) thì sót một chỗ là
// chỉ số đứng hình cho tới lần ghi sau, tệ hơn nhiều.
const CB_HAN = 1000;
let _cbVal = null, _cbMoc = 0, _cbState = null;
export function codexBonus(state) {
  const out = { atkPct: 0, defPct: 0, hpPct: 0, allPct: 0 };
  if (!state || !state.codex) return out;
  const t = Date.now();
  if (_cbVal && _cbState === state && t - _cbMoc < CB_HAN) return _cbVal;
  for (const cat of CODEX_CATS) {
    const done = codexCatDone(state, cat);
    if (done > 0 && cat.per && out[cat.per.field] != null) out[cat.per.field] += cat.per.val * done;
    if (done >= cat.entries.length && cat.set && out[cat.set.field] != null) out[cat.set.field] += cat.set.val;
  }
  _cbVal = out; _cbMoc = t; _cbState = state;
  return out;
}
/** Xoá đệm ngay — gọi khi vừa mở khoá mục phổ và muốn thấy bonus tức thì. */
export function codexQuenDem() { _cbVal = null; }
