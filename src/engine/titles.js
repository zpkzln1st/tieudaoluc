// ============================================================
// ENGINE — Danh Hiệu (THUẦN). Mở khoá theo cột mốc · cộng nhẹ chỉ số (titleBonus).
//   state.titles = { owned: [id...], equipped: id|null }.
// ============================================================
import { levelFromXp } from './leveling.js';
import { codexCatDone } from './codex.js';
import { CODEX_CATS } from '../data/codex.js';
import { TITLES, TITLE_BY_ID } from '../data/titles.js';
import { TUTORIAL_QUESTS } from '../data/quests.js';

const QORDER = ['phamPham', 'luongPham', 'tinhPham', 'tuyetPham', 'truyenThe', 'thanPham', 'coBan'];
const qRank = (q) => { const i = QORDER.indexOf(q); return i < 0 ? 0 : i; };
const lv = (xp) => levelFromXp(xp || 0);

export function ensureTitles(state) {
  if (!state.titles || typeof state.titles !== 'object') state.titles = { owned: [], equipped: null };
  if (!Array.isArray(state.titles.owned)) state.titles.owned = [];
  // ⛔ KHÔNG cấp sẵn danh hiệu nào. 'Sơ Nhập Giang Hồ' là thưởng của chuỗi Nhiệm Vụ Tân Thủ
  //    (xem cond `tutorial`). Chưa có danh hiệu thì mọi chỗ hiện đều có x-if nên tự ẩn dòng.
  if (state.titles.equipped && !TITLE_BY_ID[state.titles.equipped]) state.titles.equipped = null;
  return state.titles;
}

// Kiểm 1 điều kiện mở khoá -> bool.
export function titleUnlocked(state, c) {
  if (!c) return false;
  switch (c.kind) {
    case 'create':     return true;
    // Xong TRỌN chuỗi Tân Thủ. Danh hiệu chỉ ĐƯỢC THÊM vào `owned`, không bao giờ bị gỡ,
    // nên save cũ đã có 'Sơ Nhập Giang Hồ' thì vẫn giữ nguyên sau khi đổi điều kiện này.
    case 'tutorial':   return (state.quests?.tutorial?.index || 0) >= TUTORIAL_QUESTS.length;
    case 'combatLv':   return lv(state.skills?.chienDau?.xp) >= c.v;
    case 'totalLv': {
      let tot = lv(state.skills?.chienDau?.xp);
      for (const id in (state.skills || {})) tot += lv(state.skills[id].xp);
      return tot >= c.v;
    }
    case 'stat':       return lv(state.stats?.[c.id]?.xp) >= c.v;
    case 'skillLv':    return lv(state.skills?.[c.id]?.xp) >= c.v;
    case 'totalKills': { let s = 0; for (const k in (state.counters?.kills || {})) s += state.counters.kills[k] || 0; return s >= c.v; }
    case 'kill':       return (state.counters?.kills?.[c.id] || 0) >= c.v;
    case 'produced':   return (state.counters?.produced?.[c.id] || 0) >= c.v;
    case 'bossDistinct': return new Set((state.boss?.history || []).map((h) => h.id)).size >= c.v;
    case 'bossTotal':  return (state.boss?.history || []).length >= c.v;
    case 'dungeonClears': { let s = 0; const dr = state.codex?.dungeonRuns || {}; for (const k in dr) s += dr[k] || 0; return s >= c.v; }
    case 'dungeonDistinct': return Object.keys(state.codex?.dungeonRuns || {}).length >= c.v;
    case 'petCount':   return (state.pets || []).length >= c.v;
    case 'petAwk':     return (state.pets || []).filter((p) => p && p.evolved).length >= c.v;
    case 'codexCatAny': { let n = 0; for (const cat of CODEX_CATS) if (codexCatDone(state, cat) >= cat.entries.length) n++; return n >= c.v; }
    case 'gearQ': {
      const need = qRank(c.v);
      const has = (inst) => inst && qRank(inst.quality) >= need;
      if ((state.gearBag || []).some(has)) return true;
      const eq = state.equipment || {}; for (const s in eq) if (has(eq[s])) return true;
      return false;
    }
    case 'bac':        return (state.currencies?.bac || 0) >= c.v;
    case 'nguTuKyHon': return (state.kyHon || 0) >= c.v;   // Kỳ Hồn CHUNG mọi bàn cờ (Ngũ Tử Kỳ + Cờ Tướng) — engine/kyhon.js
    case 'dtmSc': {     // Đăng Tiên Mộng — Sát Cảnh cao nhất qua mọi mộng thân (CHỈ đọc state.dangTien; DTM không ghi ngược vào titles)
      const m = state.dangTien && state.dangTien.scMaxByHero;
      if (!m) return false; const vals = Object.values(m); return (vals.length ? Math.max(0, ...vals) : 0) >= c.v;
    }
    default:           return false;
  }
}

// Quét toàn bộ -> mở khoá những danh hiệu mới đủ điều kiện. Trả [id...] mới mở (để báo).
export function syncTitles(state) {
  ensureTitles(state);
  const owned = state.titles.owned;
  const newly = [];
  for (const tt of TITLES) {
    if (owned.includes(tt.id)) continue;
    if (titleUnlocked(state, tt.cond)) { owned.push(tt.id); newly.push(tt.id); }
  }
  // Chưa đeo gì mà vừa mở được cái đầu tiên thì đeo luôn — không thì người chơi nhận thưởng
  // xong nhìn thẻ nhân vật vẫn trống, tưởng chưa được gì.
  if (!state.titles.equipped && newly.length) state.titles.equipped = newly[0];
  return newly;
}

// Bonus của danh hiệu ĐANG ĐEO (decimal %). 0 nếu không đeo / chưa sở hữu.
export function titleBonus(state) {
  const z = { atkPct: 0, defPct: 0, hpPct: 0, allPct: 0, critPct: 0, spdPct: 0, dodgePct: 0, dropPct: 0, bacPct: 0 };
  const eq = state.titles && state.titles.equipped;
  if (!eq || !(state.titles.owned || []).includes(eq)) return z;
  const tt = TITLE_BY_ID[eq];
  if (tt && tt.bonus) for (const k in tt.bonus) if (z[k] != null) z[k] += tt.bonus[k];
  return z;
}
