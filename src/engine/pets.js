// ============================================================
// ENGINE — Linh Thú (pet). THUẦN. hatch/roll/stat/petBonus.
// P1: nở trứng -> pet (roll phẩm + stat + opt). P2: petBonus() cộng vào derivedStats (có CAP ở stats.js).
// ============================================================
import { ITEMS } from '../data/items.js';
import { removeItem, addItem } from './inventory.js';
import { levelFromXp } from './leveling.js';
import { PET_SPECIES, PET_QUALITY, EGG_TO_PET_Q, PET_OPT_POOL, PET_OPT_BY_ID, PET_SKILLS, AWK_PASSIVES, AWK_PASSIVE_IDS } from '../data/pets.js';

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

// % chỉ số pet được NHÂN thêm từ bị động Thức Tỉnh (statMul.all + statMul.<stat>). null nếu không có.
function awkStatMul(pet) {
  const awk = petAwkPassive(pet);
  if (!awk || !awk.statMul) return null;
  const all = awk.statMul.all || 0, m = {};
  for (const k of STAT_KEYS) { const v = all + (awk.statMul[k] || 0); if (v) m[k] = v; }
  return m;
}
// Stat hiện tại của pet @ level (+ thức tỉnh ×1.25 + opt flat + statMul bị động Thức Tỉnh).
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
  if (pet.fuseBonus) for (const k of STAT_KEYS) if (pet.fuseBonus[k]) s[k] = (s[k] || 0) + pet.fuseBonus[k];   // chỉ số hấp thụ từ Dung Hợp
  const sm = awkStatMul(pet);                                                                                  // P7 — bị động Thức Tỉnh nhân % chỉ số
  if (sm) for (const k of STAT_KEYS) if (s[k] && sm[k]) s[k] = Math.round(s[k] * (1 + sm[k]));
  return s;
}

export function activePet(state) { return (state.pets || []).find((p) => p.equipped) || null; }

// Bonus stat từ pet ĐANG MANG — cộng THẲNG toàn bộ (full-add). NGẤT trong combat -> mất sạch bonus.
export function petBonus(state) {
  if (state.activity && state.activity.type === 'combat' && state.combat && state.combat.petFainted) return null;
  const p = activePet(state);
  return p ? petStatAt(p) : null;
}

// ============================================================
// P4 — EXP & LÊN CẤP. Pet đang mang ăn 50% EXP/trận; trần cấp = cấp Chiến Đấu − lệch phẩm.
// ============================================================
export function petXpToNext(level) { return Math.round(40 * Math.pow(level, 1.5)); }      // E.1
const PET_LV_OFFSET = { phamPham: 10, luongPham: 6, tinhPham: 3 };                         // phẩm thấp trần thấp hơn
export function petLevelCap(state, pet) {
  const off = PET_LV_OFFSET[pet.quality] || 0;
  return Math.max(1, levelFromXp(state.skills?.chienDau?.xp || 0) - off);
}
// Cộng EXP cho 1 pet cụ thể, lên cấp tới trần. Trả số cấp lên.
export function addXpToPet(state, p, amount) {
  if (!p || !(amount > 0)) return 0;
  const cap = petLevelCap(state, p);
  const before = p.level;
  p.xp = (p.xp || 0) + amount;
  while (p.level < cap && p.xp >= petXpToNext(p.level)) { p.xp -= petXpToNext(p.level); p.level++; }
  if (p.level >= cap) p.xp = Math.min(p.xp, petXpToNext(p.level));   // tới trần: thanh đầy, không tràn
  return p.level - before;
}
// Pet ĐANG MANG ăn EXP/trận (+ Hiếu Học: petExpBonus). Trả { pet, leveled } hoặc null.
export function gainPetXp(state, amount) {
  const p = activePet(state);
  if (!p || !(amount > 0)) return null;
  const awk = petAwkPassive(p);
  const amt = awk && awk.petExpBonus ? Math.round(amount * (1 + awk.petExpBonus)) : amount;
  return { pet: p, leveled: addXpToPet(state, p, amt) };
}
// Giá trị 1 key bị động Thức Tỉnh của pet ĐANG MANG (0 nếu không có) — cho thưởng money/loot ngoài vòng combat.
export function activeAwkVal(state, key) {
  const p = activePet(state);
  const awk = p ? petAwkPassive(p) : null;
  return (awk && awk[key]) || 0;
}

// ============================================================
// P4 — THỂ LỰC + HP TRONG COMBAT (doc §D). Pet ĐANG MANG chia lửa 20% đòn quái -> HP pet;
// −4 Thể Lực/cycle; kiệt Thể Lực -> RÚT (chỉ stat tĩnh còn cộng); HP=0 -> NGẤT (mất hết bonus
// tới khi rời trận / hồi). Thể Lực hồi +10/phút thời gian thực khi rảnh.
// ============================================================
export const PET_STAM_MAX = 100;
const STAM_PER_CYCLE = 4, STAM_REGEN_PER_MIN = 10, CHIA_LUA = 0.20, PET_AUTO_PCT = 0.25, SKILL_STAM = 6;
export function petPassive(pet) { return (PET_SKILLS[pet.base] || {}).passive || {}; }   // bị động signature theo loài (THÔ — để hiển thị danh tính)
export function petActive(pet) { return (PET_SKILLS[pet.base] || {}).active || null; }     // chủ động (THÔ)
export const AWK_SKILL_MUL = 1.3;                                                          // Thức Tỉnh: tuyệt kĩ bản _awk mạnh ~+30%
export function petAwkPassive(pet) { return pet && pet.awkPassive ? (AWK_PASSIVES[pet.awkPassive] || null) : null; }   // bị động Thức Tỉnh (P7)
const AWK_NUM_KEYS = ['dmgBonus', 'absorb', 'lifesteal', 'petHp'];
// Passive signature có NHÂN hệ thức tỉnh (chỉ số ×1.3 khi evolved; cdCut giữ nguyên — số nguyên nhịp).
export function petPassiveEff(pet) {
  const pas = petPassive(pet);
  if (!pet.evolved) return pas;
  const out = { ...pas };
  for (const k of AWK_NUM_KEYS) if (out[k]) out[k] = Math.round(out[k] * AWK_SKILL_MUL * 100) / 100;
  return out;
}
// Active có NHÂN hệ thức tỉnh (mult + healMul ×1.3 khi evolved).
export function petActiveEff(pet) {
  const a = petActive(pet);
  if (!a || !pet.evolved) return a;
  return { ...a, mult: Math.round(a.mult * AWK_SKILL_MUL * 100) / 100, healMul: a.healMul ? Math.round(a.healMul * AWK_SKILL_MUL * 100) / 100 : a.healMul };
}
// Tổng bị động dùng cho COMBAT: signature(eff) + bị động Thức Tỉnh, gộp số học các key hiệu ứng.
export function petPassiveTotal(pet) {
  const base = { ...petPassiveEff(pet) };
  const awk = petAwkPassive(pet);
  if (awk) for (const k of [...AWK_NUM_KEYS, 'cdCut', 'stamCostCut', 'cycleHealPct']) if (awk[k]) base[k] = (base[k] || 0) + awk[k];   // awk-only key (stamCostCut/cycleHealPct) cộng thẳng, không ×1.3
  return base;
}
export function petHpMax(pet) { return Math.round(((petStatAt(pet) || {}).sinhLuc || 1) * 1.5 * (1 + (petPassiveTotal(pet).petHp || 0))); }
// Thể Lực hiện tại (THUẦN, không ghi): tl + hồi 10/phút từ mốc tlAt. tl null/đầy -> 100.
export function petStamView(pet, now) {
  if (!pet || pet.tl == null || pet.tl >= PET_STAM_MAX) return PET_STAM_MAX;
  const regen = Math.floor((now - (pet.tlAt || now)) / 60000) * STAM_REGEN_PER_MIN;
  return Math.max(0, Math.min(PET_STAM_MAX, pet.tl + regen));
}
// Reset HP pet đầu phiên combat (gọi trong startCombat).
export function resetPetCombat(state) {
  const cb = state.combat; if (!cb) return;
  const p = activePet(state);
  cb.petHp = p ? petHpMax(p) : null;
  cb.petFainted = false;
  cb.petCd = 0;   // tuyệt kĩ chủ động sẵn sàng đầu phiên
}
// Pet tự dùng Món Ăn/Đan hồi HP khi <25% (chung ô với chủ -> tốn thêm item). Trả lượng hồi.
function petAutoHeal(state) {
  const cb = state.combat; if (!cb) return 0;
  const fid = cb.luongThuc, food = fid && ITEMS[fid];
  if (food && food.heal && (state.inventory[fid] || 0) > 0) { removeItem(state, fid, 1); return food.heal; }
  const did = cb.dan, dan = did && ITEMS[did];
  if (dan && dan.heal && (state.inventory[did] || 0) > 0) { removeItem(state, did, 1); return dan.heal; }
  return 0;
}
// 1 cycle combat của pet ĐANG MANG: gánh 20% sát thương (dmg) -> HP pet, −4 Thể Lực, auto-heal, ngất.
// Trả lượng pet GÁNH (hoàn cho chủ). Không gánh nếu kiệt Thể Lực / đã ngất.
export function petCombatCycle(state, dmg, now) {
  const cb = state.combat; if (!cb) return { absorb: 0, heal: 0, skill: null };
  const p = activePet(state); if (!p) return { absorb: 0, heal: 0, skill: null };
  if (cb.petHp == null) cb.petHp = petHpMax(p);
  if (cb.petFainted) return { absorb: 0, heal: 0, skill: null };
  const stam = petStamView(p, now);
  if (stam <= 0) return { absorb: 0, heal: 0, skill: null };     // kiệt -> rút
  const pas = petPassiveTotal(p), act = petActiveEff(p), st = petStatAt(p) || {};
  const hpMax = petHpMax(p), atk = st.congKich || 0, gross = dmg || 0;
  // chia lửa — pet GÁNH bằng HP (bị động absorb cộng thêm %)
  const chia = Math.min(cb.petHp, Math.round(gross * (CHIA_LUA + (pas.absorb || 0))));
  cb.petHp -= chia;
  let heal = pas.lifesteal ? Math.round(atk * pas.lifesteal) : 0;   // bị động hút máu mỗi cycle
  if (pas.cycleHealPct) heal += Math.round((st.sinhLuc || 0) * pas.cycleHealPct);   // P7 — Hồi Xuân: hồi chủ = % Sinh Lực pet/nhịp
  // chủ động (đủ nhịp + còn Thể Lực): burst đỡ thêm sát thương + hồi; tốn thêm Thể Lực
  let offense = 0, skill = null, extraStam = 0;
  if (act) {
    if ((cb.petCd || 0) <= 0) {
      const burst = Math.round(atk * act.mult * (1 + (pas.dmgBonus || 0)));
      offense = burst + (act.block ? gross : 0);
      if (act.healMul) heal += Math.round(burst * act.healMul);
      cb.petCd = Math.max(1, (act.cd || 3) - (pas.cdCut || 0));
      extraStam = SKILL_STAM;
      skill = { name: act.name, dmg: burst, heal: 0 };
    } else { cb.petCd = (cb.petCd || 0) - 1; }
  }
  const reduce = Math.min(gross, chia + offense);                // tổng giảm sát thương cho chủ ≤ đòn cycle
  p.tl = Math.max(0, stam - Math.max(1, STAM_PER_CYCLE - (pas.stamCostCut || 0)) - extraStam); p.tlAt = now;   // P7 — Bền Bỉ: giảm Thể Lực tiêu/nhịp (tối thiểu vẫn tốn 1)
  if (cb.petHp > 0 && cb.petHp < hpMax * PET_AUTO_PCT) { const h = petAutoHeal(state); if (h > 0) cb.petHp = Math.min(hpMax, cb.petHp + h); }
  if (cb.petHp <= 0) { cb.petHp = 0; cb.petFainted = true; }     // ngất
  if (skill) skill.heal = heal;
  return { absorb: reduce, heal, skill };
}

// ============================================================
// P6 — DUNG HỢP (nuốt pet phụ → tu vi + cơ hội đột phá phẩm) + PHÓNG SANH (thả → Bạc/Hồn Thạch/Linh Phách).
// ============================================================
const Q_ORDER = Object.keys(PET_QUALITY);   // phamPham..coBan (theo thứ tự data)
export function qRank(quality) { return Math.max(0, Q_ORDER.indexOf(quality)); }
function petCumXp(level) { let s = 0; for (let i = 1; i < level; i++) s += petXpToNext(i); return s; }
export function petXpValue(pet) { return Math.round(petCumXp(pet.level) + (qRank(pet.quality) + 1) * 50); }
const FUSE_UPGRADE = { phamPham: 0.70, luongPham: 0.55, tinhPham: 0.42, tuyetPham: 0.30, truyenThe: 0.20, thanPham: 0.10, coBan: 0 };

function recomputePetStats(pet) {   // đổi phẩm -> tính lại baseStats/growth ở phẩm mới (giữ level/xp)
  const sp = PET_SPECIES[pet.base], pq = PET_QUALITY[pet.quality];
  const bs = {}, gr = {};
  for (const k of STAT_KEYS) { const b = sp.stats[k] || 0; if (b > 0) { bs[k] = Math.max(1, Math.round(b * pq.qMul)); gr[k] = Math.round(b * (k === 'sinhLuc' ? 0.09 : 0.11) * pq.gMul * 100) / 100; } }
  pet.baseStats = bs; pet.growth = gr;
}
export function upgradePetQuality(pet) {
  const i = qRank(pet.quality); if (i >= Q_ORDER.length - 1) return false;
  pet.quality = Q_ORDER[i + 1];
  recomputePetStats(pet);
  const need = PET_QUALITY[pet.quality].optSlots - (pet.opts ? pet.opts.length : 0);   // mở thêm ô opt nếu phẩm mới nhiều hơn
  if (need > 0) pet.opts = (pet.opts || []).concat(rollOpts(pet.quality).slice(0, need));
  return true;
}
// % chỉ số donor mà target HẤP THỤ (vĩnh viễn): cùng dòng+phẩm 5% / cùng 1 thứ 3% / khác 1%.
export function fuseAbsorbPct(t, d) {
  const sb = t.base === d.base, sq = t.quality === d.quality;
  return (sb && sq) ? 0.05 : (sb || sq) ? 0.03 : 0.01;
}
// Xem trước 1 donor (KHÔNG mutate). null nếu không hợp lệ.
export function fusePreview(state, targetId, donorId) {
  const pets = state.pets || [];
  const t = pets.find((p) => p.id === targetId), d = pets.find((p) => p.id === donorId);
  if (!t || !d || t.id === d.id || d.equipped) return null;
  const same = (t.base === d.base && t.quality === d.quality);
  let xp = Math.round(petXpValue(d) * 0.7); if (same) xp = Math.round(xp * 1.15);   // cùng dòng+phẩm: +15% + cơ hội đột phá
  return { xp, same, upChance: same ? (FUSE_UPGRADE[t.quality] || 0) : 0, pct: fuseAbsorbPct(t, d) };
}
// Dung hợp NHIỀU donor 1 lần: tu vi + HẤP THỤ chỉ số (vào fuseBonus) + 1 lần đột phá (chance gộp từ các con cùng dòng+phẩm). Trả tóm tắt | null.
export function fuseMany(state, targetId, donorIds) {
  const pets = state.pets || [];
  const t = pets.find((p) => p.id === targetId);
  if (!t || !donorIds || !donorIds.length) return null;
  const donors = donorIds.map((id) => pets.find((p) => p.id === id)).filter((d) => d && d.id !== t.id && !d.equipped);
  if (!donors.length) return null;
  if (!t.fuseBonus) t.fuseBonus = {};
  let xp = 0, pSurv = 1; const absorbed = {};
  for (const d of donors) {
    const same = (t.base === d.base && t.quality === d.quality);
    let dxp = Math.round(petXpValue(d) * 0.7); if (same) dxp = Math.round(dxp * 1.15);
    xp += dxp;
    const pct = fuseAbsorbPct(t, d), ds = petStatAt(d) || {};
    for (const k of STAT_KEYS) { if (ds[k]) { const a = Math.round(ds[k] * pct); if (a > 0) { t.fuseBonus[k] = (t.fuseBonus[k] || 0) + a; absorbed[k] = (absorbed[k] || 0) + a; } } }
    if (same) pSurv *= (1 - (FUSE_UPGRADE[t.quality] || 0));
  }
  const dset = new Set(donors.map((d) => d.id));
  state.pets = pets.filter((p) => !dset.has(p.id));
  const leveled = addXpToPet(state, t, xp);
  let upgraded = false;
  const upChance = 1 - pSurv;
  if (upChance > 0 && Math.random() < upChance) upgraded = upgradePetQuality(t);
  return { target: t, count: donors.length, xp, leveled, absorbed, upgraded };
}
// Phần thưởng phóng sanh (Bạc luôn; Hồn Thạch ≥Tuyệt; Linh Phách ≥Tinh).
export function releaseReward(pet) {
  const r = qRank(pet.quality);
  return { bac: pet.level * 50 + (r + 1) * 500, honThach: r >= 3 ? Math.floor(r / 2) : 0, linhPhach: r >= 2 ? (r - 1) : 0 };
}
// ---- Dev: tạo pet chỉ định loài/phẩm/cấp (bỏ qua ấp nở). ----
export function devSpawnPet(state, base, quality, level) {
  if (!PET_SPECIES[base] || !PET_QUALITY[quality]) return null;
  const p = rollPet(base, quality, state);
  p.level = Math.max(1, Math.min(99, Math.floor(level || 1)));
  if (!Array.isArray(state.pets)) state.pets = [];
  state.pets.push(p);
  return p;
}

// Phóng sanh: thả pet -> nhận thưởng. Trả reward | null (đang mang thì không thả).
export function releasePet(state, id) {
  const p = (state.pets || []).find((x) => x.id === id);
  if (!p || p.equipped) return null;
  const r = releaseReward(p);
  state.pets = (state.pets || []).filter((x) => x.id !== id);
  state.currencies.bac = (state.currencies.bac || 0) + r.bac;
  if (r.honThach) state.currencies.honThach = (state.currencies.honThach || 0) + r.honThach;
  if (r.linhPhach) addItem(state, 'linhPhach', r.linhPhach);
  return r;
}

// ============================================================
// P7 — THỨC TỈNH (doc §E.5). Đạt TRẦN Lv phẩm + tốn liệu + Hồn Thạch → evolved=true:
//   stat ×1.25 (petStatAt sẵn) · tuyệt kĩ bản _awk +30% (petPassiveEff/petActiveEff) · +1 Dị Bẩm ·
//   mở 1 bị động Thức Tỉnh (awkPassive) · 15% biến dị thăng 1 phẩm · đổi ART _awk. KHÔNG reset cấp.
// Liệu: phẩm < Thần → Linh Phách; Thần+ → Tinh Thể Yêu Vương (khỏi tranh tài nguyên với cường hóa gear).
// ============================================================
const AWK_HONTHACH = { phamPham: 500, luongPham: 900, tinhPham: 1300, tuyetPham: 1700, truyenThe: 2100, thanPham: 2600, coBan: 3000 };
const AWK_MAT_QTY  = { phamPham: 3,   luongPham: 5,   tinhPham: 8,    tuyetPham: 12,   truyenThe: 18,   thanPham: 2,    coBan: 3 };
const AWK_THAN_RANK = qRank('thanPham');
export function awakenMat(pet) { return qRank(pet.quality) >= AWK_THAN_RANK ? 'tinhTheYeuVuong' : 'linhPhach'; }
export function awakenCost(pet) { return { honThach: AWK_HONTHACH[pet.quality] || 500, matId: awakenMat(pet), matQty: AWK_MAT_QTY[pet.quality] || 3 }; }
// Đủ điều kiện thức tỉnh? (chưa thức tỉnh + đạt TRẦN Lv phẩm). KHÔNG xét tài nguyên.
export function canAwaken(state, pet) { return !!pet && !pet.evolved && pet.level >= petLevelCap(state, pet); }
export function awakenAfford(state, pet) {
  if (!pet) return false;
  const c = awakenCost(pet);
  return (state.currencies.honThach || 0) >= c.honThach && (state.inventory[c.matId] || 0) >= c.matQty;
}
function addOneOpt(pet) {   // khai mở thêm 1 dị bẩm (opt mới, không trùng id sẵn có)
  const pq = PET_QUALITY[pet.quality];
  const used = new Set((pet.opts || []).map((o) => o.id));
  const avail = PET_OPT_POOL.filter((o) => !used.has(o.id));
  if (!avail.length) return null;
  const o = weightedPick(avail);
  const opt = { id: o.id, val: rollOptVal(o, pq) };
  pet.opts = (pet.opts || []).concat(opt);
  return opt;
}
function pickAwkPassive() { return AWK_PASSIVE_IDS[Math.floor(Math.random() * AWK_PASSIVE_IDS.length)]; }
// Thực thi thức tỉnh. Trả tóm tắt { pet, cost, newOpt, awkPassive, mutated } | null.
export function awakenPet(state, id) {
  const p = (state.pets || []).find((x) => x.id === id);
  if (!p || !canAwaken(state, p) || !awakenAfford(state, p)) return null;
  const c = awakenCost(p);
  state.currencies.honThach = (state.currencies.honThach || 0) - c.honThach;
  removeItem(state, c.matId, c.matQty);
  p.evolved = true;
  const newOpt = addOneOpt(p);
  p.awkPassive = pickAwkPassive();
  let mutated = false;
  if (Math.random() < 0.15) mutated = upgradePetQuality(p);   // 15% biến dị thăng 1 phẩm (recompute stat + mở opt slot nếu có)
  return { pet: p, cost: c, newOpt, awkPassive: p.awkPassive, mutated };
}
