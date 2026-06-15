// ============================================================
// ENGINE — Tính chỉ số chiến đấu dẫn xuất (THUẦN)
// derived = Tứ Trụ (level) + cộng dồn từ trang bị đang mặc.
// ============================================================
import { ITEMS } from '../data/items.js';
import { levelFromXp } from './leveling.js';
import { gearPlus, enhanceMul } from './enhance.js';
import { petBonus } from './pets.js';

const PET_STAT_CAP = 0.12; // Linh Thú đang mang: mỗi stat cộng tối đa 12% stat chủ (chưa kể pet) — chống bá đạo

export function gearStats(state) {
  const g = { congKich: 0, hoThe: 0, neTranh: 0, menhTrung: 0, sinhLuc: 0 };
  const eq = state.equipment || {};
  for (const slot of Object.keys(eq)) {
    const id = eq[slot];
    if (!id) continue;
    const item = ITEMS[id];
    if (item && item.equip && item.equip.stats) {
      const mul = enhanceMul(gearPlus(state, id));   // +8%/cấp cường hóa
      for (const k of Object.keys(item.equip.stats)) g[k] = (g[k] || 0) + item.equip.stats[k] * mul;
    }
  }
  for (const k in g) g[k] = Math.round(g[k]);
  return g;
}

// Cộng hưởng Ngũ Hành từ trang bị đang mặc: mỗi món có he + eleDmg → +% ST chiêu CÙNG hệ.
export function gearEle(state) {
  const e = { kim: 0, moc: 0, thuy: 0, hoa: 0, tho: 0 };
  const eq = state.equipment || {};
  for (const slot of Object.keys(eq)) {
    const id = eq[slot];
    if (!id) continue;
    const item = ITEMS[id];
    const eq2 = item && item.equip;
    if (eq2 && eq2.he && eq2.eleDmg && e[eq2.he] != null) e[eq2.he] += eq2.eleDmg;
  }
  return e;
}

export function derivedStats(state, opts) {
  const sl = (id) => levelFromXp(state.stats[id]?.xp || 0);
  const g = gearStats(state);
  let congKich  = sl('lucDao') * 5 + g.congKich;
  let hoThe     = sl('hoThe') * 5 + g.hoThe;
  let neTranh   = sl('thanPhap') * 5 + g.neTranh;
  let menhTrung = sl('linhXao') * 5 + g.menhTrung;
  let sinhLuc   = 100 + sl('hoThe') * 10 + g.sinhLuc;
  // Linh Thú đang mang: cộng có CAP (đo trên stat CHƯA kể pet). noPet=true -> bỏ qua (cho UI so sánh).
  if (!(opts && opts.noPet)) {
    const pb = petBonus(state);
    if (pb) {
      congKich  += Math.min(pb.congKich  || 0, Math.round(PET_STAT_CAP * congKich));
      hoThe     += Math.min(pb.hoThe     || 0, Math.round(PET_STAT_CAP * hoThe));
      neTranh   += Math.min(pb.neTranh   || 0, Math.round(PET_STAT_CAP * neTranh));
      menhTrung += Math.min(pb.menhTrung || 0, Math.round(PET_STAT_CAP * menhTrung));
      sinhLuc   += Math.min(pb.sinhLuc   || 0, Math.round(PET_STAT_CAP * sinhLuc));
    }
  }
  const combatLv  = levelFromXp(state.skills['chienDau']?.xp || 0);
  const chienLuc  = congKich + hoThe + neTranh + menhTrung + combatLv * 3;
  return { congKich, hoThe, neTranh, menhTrung, sinhLuc, chienLuc };
}
