// ============================================================
// ENGINE — Linh Thú (pet). THUẦN. hatch/roll/stat/petBonus.
// P1: nở trứng -> pet (roll phẩm + stat + opt). P2: petBonus() cộng vào derivedStats (có CAP ở stats.js).
// ============================================================
import { ITEMS } from '../data/items.js';
import { removeItem } from './inventory.js';
import { PET_SPECIES, PET_QUALITY, EGG_TO_PET_Q, PET_OPT_POOL, PET_OPT_BY_ID } from '../data/pets.js';

const STAT_KEYS = ['congKich', 'hoThe', 'neTranh', 'menhTrung', 'sinhLuc'];

function rollEggQuality(eggQ) {
  const t = EGG_TO_PET_Q[eggQ] || EGG_TO_PET_Q.phamPham;
  let r = Math.random(), acc = 0;
  for (const [q, p] of t) { acc += p; if (r < acc) return q; }
  return t[t.length - 1][0];
}

function weightedPick(pool) {
  const tot = pool.reduce((s, o) => s + o.w, 0);
  let r = Math.random() * tot;
  for (const o of pool) { r -= o.w; if (r <= 0) return o; }
  return pool[pool.length - 1];
}
function rollOptVal(o, pq) {
  const pos = Math.max(0, Math.min(1, pq.bias + (Math.random() - 0.5) * 0.25));
  let v = Math.round((o.lo + pos * (o.hi - o.lo)) * pq.qMul);
  v = Math.max(o.lo, v);
  if (o.cap) v = Math.min(v, o.cap);
  return v;
}
function rollOpts(quality) {
  const pq = PET_QUALITY[quality]; const n = pq.optSlots;
  const used = new Set(); const out = [];
  const combat = PET_OPT_POOL.filter((o) => o.group === 'combat');
  const util = PET_OPT_POOL.filter((o) => o.group === 'utility');
  const pick = (pool, count) => {
    for (let i = 0; i < count; i++) {
      const avail = pool.filter((o) => !used.has(o.id));
      if (!avail.length) break;
      const o = weightedPick(avail); used.add(o.id);
      out.push({ id: o.id, val: rollOptVal(o, pq) });
    }
  };
  pick(combat, Math.min(2, n));    // ≤2 opt combat-stat (chống cap nuốt)
  pick(util, n - out.length);      // còn lại utility
  pick(combat, n - out.length);    // util hết -> thêm combat
  if (Math.random() < 0.25 && !used.has('eleDmg') && out.length) {  // 25% ép 1 opt = eleDmg cùng hệ
    out[out.length - 1] = { id: 'eleDmg', val: rollOptVal(PET_OPT_BY_ID.eleDmg, pq) };
  }
  return out;
}

function rollPet(base, quality, state) {
  const sp = PET_SPECIES[base]; const pq = PET_QUALITY[quality];
  const baseStats = {}, growth = {};
  for (const k of STAT_KEYS) {
    const b = sp.stats[k] || 0;
    if (b > 0) {
      baseStats[k] = Math.max(1, Math.round(b * pq.qMul));
      growth[k] = Math.round(b * (k === 'sinhLuc' ? 0.09 : 0.11) * pq.gMul * 100) / 100;
    }
  }
  state._petSeq = (state._petSeq || 0) + 1;
  return { id: 'pet' + state._petSeq, base, quality, level: 1, xp: 0, baseStats, growth, opts: rollOpts(quality), equipped: false, evolved: false };
}

// Ấp nở 1 trứng -> trả pet (đã push vào state.pets) hoặc null.
export function hatchEgg(state, eggId) {
  const egg = ITEMS[eggId];
  if (!egg || egg.type !== 'trung' || !egg.petBase) return null;
  if ((state.inventory[eggId] || 0) < 1) return null;
  removeItem(state, eggId, 1);
  const pet = rollPet(egg.petBase, rollEggQuality(egg.quality), state);
  if (!Array.isArray(state.pets)) state.pets = [];
  state.pets.push(pet);
  return pet;
}

// ============================================================
// P3 — ẤP NỞ THEO THỜI GIAN (lò đơn). Roll pet NGAY lúc đặt ấp (giấu phẩm tới khi khai noãn);
// hẹn giờ theo readyAt vs now() -> sống qua reload/offline, không cần tick riêng.
// ============================================================
export const HATCH_MS = { phamPham: 2 * 3600e3, tinhPham: 8 * 3600e3, thanPham: 24 * 3600e3 }; // Phàm 2h / Linh 8h / Thần 24h
export function hatchDurMs(eggQ) { return HATCH_MS[eggQ] || HATCH_MS.phamPham; }
export function incubRemainMs(state, now) { const h = state.hatchery; return h ? Math.max(0, h.readyAt - now) : 0; }
export function incubReady(state, now) { const h = state.hatchery; return !!h && now >= h.readyAt; }
export function incubSkipCost(state, now) { return Math.ceil(incubRemainMs(state, now) / 3600000) * 100; } // 100 Hồn Thạch / giờ còn lại

// Đặt 1 trứng vào lò: tiêu trứng, roll pet NGAY (ẩn phẩm), hẹn giờ. Trả record lò | null (lò bận / trứng sai).
export function startIncubation(state, eggId, now) {
  if (state.hatchery) return null;                                  // v1: lò đơn — đang bận thì thôi
  const egg = ITEMS[eggId];
  if (!egg || egg.type !== 'trung' || !egg.petBase) return null;
  if ((state.inventory[eggId] || 0) < 1) return null;
  removeItem(state, eggId, 1);
  const pet = rollPet(egg.petBase, rollEggQuality(egg.quality), state);
  const dur = hatchDurMs(egg.quality);
  state.hatchery = { pet, base: egg.petBase, eggId, eggQuality: egg.quality, startedAt: now, readyAt: now + dur, durMs: dur, notified: false };
  return state.hatchery;
}

// Khai noãn: đủ giờ -> push pet vào state.pets, dọn lò, trả pet. Chưa đủ -> null.
export function finishHatch(state, now) {
  const h = state.hatchery;
  if (!h || now < h.readyAt) return null;
  if (!Array.isArray(state.pets)) state.pets = [];
  state.pets.push(h.pet);
  state.hatchery = null;
  return h.pet;
}

// Stat hiện tại của pet @ level (+ thức tỉnh ×1.25 + opt flat).
export function petStatAt(pet) {
  if (!pet) return null;
  const ev = pet.evolved ? 1.25 : 1;
  const s = {};
  for (const k of STAT_KEYS) {
    const v = (pet.baseStats[k] || 0) + (pet.growth[k] || 0) * (pet.level - 1);
    if (v > 0) s[k] = Math.round(v * ev);
  }
  for (const o of (pet.opts || [])) {
    const d = PET_OPT_BY_ID[o.id];
    if (d && d.fmt === 'flat' && d.stat) s[d.stat] = (s[d.stat] || 0) + o.val;
  }
  return s;
}

export function activePet(state) { return (state.pets || []).find((p) => p.equipped) || null; }

// Bonus stat từ pet ĐANG MANG (chưa cap — CAP áp ở derivedStats stats.js).
export function petBonus(state) { const p = activePet(state); return p ? petStatAt(p) : null; }
