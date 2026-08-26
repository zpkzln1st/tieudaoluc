// ============================================================
// ENGINE — Danh Hiệu (THUẦN). Mở khoá theo cột mốc · cộng nhẹ chỉ số (titleBonus).
//   state.titles = { owned: [id...], equipped: id|null }.
// ============================================================
import { levelFromXp } from './leveling.js';
import { codexCatDone } from './codex.js';
import { CODEX_CATS } from '../data/codex.js';
import { TITLES, TITLE_BY_ID } from '../data/titles.js';
import { TUTORIAL_QUESTS } from '../data/quests.js';
// ⚠ `SKILLS` = ĐÚNG 10 nghề. `state.skills` thì có thêm `chienDau` và 6 kĩ năng sự kiện, nên
//   duyệt thẳng nó là đếm ra một con số KHÁC với Tổng Cấp mà game bày cho người chơi.
import { SKILLS } from '../data/skills.js';
// ⚠⚠ Bộ đếm CHỈ-TIẾN của Yêu Vương. `state.boss.history` bị cắt cứng còn 40 dòng, đếm trên nó là
//   một bộ đếm TỤT ĐƯỢC — xem chú thích dài ở `ensureBoss` trong worldboss.js.
import { soLanThang } from './worldboss.js';

const QORDER = ['phamPham', 'luongPham', 'tinhPham', 'tuyetPham', 'truyenThe', 'thanPham', 'coBan'];
const qRank = (q) => { const i = QORDER.indexOf(q); return i < 0 ? 0 : i; };
const lv = (xp) => levelFromXp(xp || 0);

export function ensureTitles(state) {
  if (!state.titles || typeof state.titles !== 'object') state.titles = { owned: [], equipped: null };
  if (!Array.isArray(state.titles.owned)) state.titles.owned = [];
  // `moAt` = mốc mở khoá từng danh hiệu { id: timestamp }. Danh hiệu mở TRƯỚC khi có sổ này
  // KHÔNG được bịa mốc — để trống, chỗ hiển thị tự giấu dòng ngày.
  if (!state.titles.moAt || typeof state.titles.moAt !== 'object') state.titles.moAt = {};
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
    // ⚠⚠ PHẢI khớp `get totalLevel()` ở main.js: Chiến Đấu + ĐÚNG 10 nghề trong `SKILLS`.
    //    Bản cũ duyệt `state.skills` nên cộng `chienDau` HAI LẦN, lại cộng thêm 6 kĩ năng sự kiện
    //    — con số của danh hiệu lệch hẳn con số Tổng Cấp game bày ra, mở sớm cả trăm cấp.
    case 'totalLv': {
      const sk = state.skills || {};
      let tot = lv(sk.chienDau?.xp);
      for (const id in SKILLS) tot += lv(sk[id]?.xp);
      return tot >= c.v;
    }
    case 'stat':       return lv(state.stats?.[c.id]?.xp) >= c.v;
    case 'skillLv':    return lv(state.skills?.[c.id]?.xp) >= c.v;
    case 'totalKills': { let s = 0; for (const k in (state.counters?.kills || {})) s += state.counters.kills[k] || 0; return s >= c.v; }
    case 'kill':       return (state.counters?.kills?.[c.id] || 0) >= c.v;
    case 'produced':   return (state.counters?.produced?.[c.id] || 0) >= c.v;
    // ⛔⛔ HAI DÒNG DƯỚI trước đây đếm trên `state.boss.history` — sổ đó bị cắt cứng còn 40 dòng
    //    VÀ ghi cả trận THUA/HOÀ. Hậu quả kép: 'Trấn Yêu Thần Tướng' (đòi 100) KHÔNG BAO GIỜ mở
    //    được, còn ba danh hiệu 'Hạ N Yêu Vương' thì tự mở cho người mới chỉ THỬ đánh rồi gục.
    //    `thangTheo` / `tongThang` chỉ cộng trong nhánh `entry.win` và cộng TRƯỚC khi cắt sổ.
    case 'bossDistinct': return Object.keys(state.boss?.thangTheo || {}).length >= c.v;
    case 'bossTotal':  return soLanThang(state) >= c.v;
    // ⛔⛔ `dungeonRuns` đếm CẢ lượt RÚT LUI (dungeon.js:269 ghi rõ). Ba danh hiệu 'Thông quan'
    //    mở cho người thua sạch 30 lượt. Sổ đúng là `dungeonClears`, chỉ cộng khi `run.cleared`.
    case 'dungeonClears': { let s = 0; const dr = state.codex?.dungeonClears || {}; for (const k in dr) s += dr[k] || 0; return s >= c.v; }
    case 'dungeonDistinct': { const dc = state.codex?.dungeonClears || {}; return Object.keys(dc).filter((k) => (dc[k] || 0) > 0).length >= c.v; }
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
export function syncTitles(state, now) {
  ensureTitles(state);
  const owned = state.titles.owned;
  const moc = now || Date.now();
  const newly = [];
  for (const tt of TITLES) {
    if (owned.includes(tt.id)) continue;
    if (titleUnlocked(state, tt.cond)) { owned.push(tt.id); state.titles.moAt[tt.id] = moc; newly.push(tt.id); }
  }
  // ⛔ KHÔNG tự đeo hộ (user chốt 2026-08-04). Trước đây mở được cái đầu tiên là game tự đeo luôn;
  // nay để người chơi tự chọn. Toast báo mở khoá vẫn còn nên không sợ họ không biết.
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
