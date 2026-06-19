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
    const eq = state.equipment || {};
    for (const slot in eq) { const id = eq[slot]; if (id) cx.obtained[id] = Math.max(cx.obtained[id] || 0, 1); }
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
    case 'binhkhi': return ((cx.obtained && cx.obtained[entryId]) || 0) > 0 ? 1 : 0;
    case 'vatpham': return (cx.obtained && cx.obtained[entryId]) || 0;
    case 'linhthu': return (cx.petSeen && cx.petSeen[entryId]) ? 1 : 0;
    case 'bicanh': return (cx.dungeonRuns && cx.dungeonRuns[entryId]) || 0;
    default: return 0;
  }
}

export function codexCatDone(state, cat) {
  let n = 0;
  for (const e of cat.entries) if (codexCount(state, cat.key, e.id) >= cat.threshold) n++;
  return n;
}

// Tổng Phổ Lực (bonus chỉ số % vĩnh viễn) — gọi trong derivedStats. {atkPct,defPct,hpPct,allPct}.
export function codexBonus(state) {
  const out = { atkPct: 0, defPct: 0, hpPct: 0, allPct: 0 };
  if (!state || !state.codex) return out;
  for (const cat of CODEX_CATS) {
    const done = codexCatDone(state, cat);
    if (done > 0 && cat.per && out[cat.per.field] != null) out[cat.per.field] += cat.per.val * done;
    if (done >= cat.entries.length && cat.set && out[cat.set.field] != null) out[cat.set.field] += cat.set.val;
  }
  return out;
}
