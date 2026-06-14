// ============================================================
// ENGINE — BÍ CẢNH (Dungeon idle) — THUẦN.
// runDungeon(state, dungeonId, mode): mô phỏng 1 lượt theo D.tangs[] (số tầng + loại
//   KHÁC NHAU mỗi phó bản) -> {cleared, log[], loot, hpPct, doPhoId, ...}. KHÔNG mutate kho.
// grantDungeon(state, dungeonId, mode, now): chạy runDungeon + NHẬP thưởng + lưu lastResult/history.
//
// Loại tầng (D.tangs):
//   'thuong'/'tinhAnh'/'boss' = combat (HP tốn theo chênh Chiến Đấu Lv vs độ sâu).
//   'hazard' = check môi trường (D.hazard) — đủ cấp thì kháng, kém thì ngấm.
//   'bay'    = né/giải cạm bẫy (Thân Pháp/Ngộ Tính) — qua thì vô sự, hụt thì tổn HP.
//   'coDuyen'= mở rương (Tứ Trụ tốt nhất) — qua thì +bonus loot, hụt thì phản phệ.
//   'kyNgo'  = kỳ ngộ thuần thưởng (không rủi ro, +liệu).
//   Tầng cuối = 'boss': hạ được = THÔNG QUAN (mới rơi Đồ Phổ); HP cạn giữa chừng = RÚT LUI.
// Hằng số cân bằng để TOP cho user tune.
// ============================================================
import { DUNGEON_BY_ID } from '../data/dungeon.js';
import { deriveCombat } from '../data/votong.js';
import { GEAR, BAC_QUALITY } from '../data/gear.js';
import { levelFromXp, addSkillXp } from './leveling.js';
import { addItem } from './inventory.js';

// ---- Hằng số cân bằng (TUNE) ----
const MODE = {
  nhanh: { label: 'Chạy Nhanh', bacMul: 1, expMul: 1, honMul: 1, lieuN: 1, daChance: 0.40, doPhoMul: 1.0 },
  treo:  { label: 'Treo Luyện', bacMul: 3, expMul: 3, honMul: 2, lieuN: 2, daChance: 0.70, doPhoMul: 1.6 },
};
const COMBAT_BASE_LOSS = { thuong: 9, tinhAnh: 15, boss: 24 };   // % máu/tầng combat (trước hệ số chênh cấp)
const ORD = ['Một', 'Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'Tám'];
const HAZARD_NAME_BY_STAT = { sinhLuc: 'sinh khí', hoThe: 'thể chất', thanPhap: 'thân pháp', linhXao: 'ngộ tính', lucDao: 'sức mạnh' };

function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function randInt(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
function statLv(state, id) { return levelFromXp(state.stats?.[id]?.xp || 0); }

// Chọn 1 Đồ Phổ ngẫu nhiên hợp pool phó bản (bậc -> phẩm chất + slot). Trả 'dp_<gearId>' | null.
function rollDoPhoId(D) {
  const dp = D.loot.doPho; if (!dp) return null;
  const quals = dp.bac.map((b) => BAC_QUALITY[b]);
  const byQual = Object.values(GEAR).filter((g) => g.equip && quals.includes(g.quality));
  let pool = byQual;
  if (dp.slots !== 'all') { const bySlot = byQual.filter((g) => dp.slots.includes(g.equip.slot)); if (bySlot.length) pool = bySlot; } // slot cấu hình sai/rỗng -> fallback phẩm chất (không phí lượt trúng)
  if (!pool.length) return null;
  return 'dp_' + pick(pool).id;
}

// ---- MÔ PHỎNG 1 LƯỢT (thuần, không mutate kho) ----
export function runDungeon(state, dungeonId, mode) {
  const D = DUNGEON_BY_ID[dungeonId];
  if (!D) return null;
  const m = MODE[mode] || MODE.nhanh;
  const C = deriveCombat(state, state.combat && state.combat.loadout, { ignoreNoiThuong: true }); // phòng thủ: state.combat thiếu vẫn chạy
  const dodge = clamp(C.dodge || 0, 0, 0.35);
  const cl = levelFromXp(state.skills?.chienDau?.xp || 0);
  const req = D.reqLevel;
  const power = Math.round(C.atk + C.def * 1.4 + C.maxHP * 0.12 + C.spd * 0.6);

  const tangs = (D.tangs && D.tangs.length) ? D.tangs : ['thuong', 'boss'];
  const total = tangs.length;
  let hp = 100, cleared = false, reachedTang = 0, coDuyenBonus = false, kyNgoBonus = 0;
  const log = [];
  const add = (tang, kind, title, text, tone) => log.push({ tang, kind, title, text, tone });
  const combatLoss = (base, threatLv, dm) => clamp(Math.round(base * clamp(1 + (threatLv - cl) * 0.05, 0.45, 2.4) * (1 - dodge * (dm || 0.55))), 2, 75);

  for (let i = 0; i < total; i++) {
    if (hp <= 0) break;
    const type = tangs[i];
    const ord = 'Tầng ' + (ORD[i] || (i + 1));
    const depth = total > 1 ? i / (total - 1) : 1;   // 0..1: tầng càng sâu địch càng mạnh
    reachedTang = i + 1;

    if (type === 'boss') {
      const loss = combatLoss(COMBAT_BASE_LOSS.boss, req + 16);
      if (hp - loss > 0) { hp -= loss; cleared = true;
        add(i + 1, 'boss', ord + ' · Thủ Lĩnh', `<b class="text-purple-300">${D.boss}</b> giáng thế! Tử chiến hạ gục — hao <b class="dmgr">${loss}%</b>. <span class="text-emerald-300 font-bold">Thông quan!</span>`, 'boss');
      } else {
        add(i + 1, 'boss', ord + ' · Thủ Lĩnh', `<b class="text-purple-300">${D.boss}</b> quá mạnh, sinh lực đã cạn — đành <span class="text-rose-300 font-bold">rút lui</span>.`, 'fail');
        hp = 0;
      }
    } else if (type === 'tinhAnh' || type === 'thuong') {
      const elite = type === 'tinhAnh';
      const mob = D.mobs[elite ? 1 : 0] || D.mobs[0] || 'yêu thú';
      const loss = combatLoss(COMBAT_BASE_LOSS[type], req + Math.round(depth * 12));
      hp -= loss;
      add(i + 1, type, ord + ' · ' + (elite ? 'Tinh Anh' : 'Tao Ngộ'),
        elite ? `<b>${mob}</b> trấn giữ tầng sâu — ác chiến hạ gục, hao <b class="dmgr">${loss}%</b>.`
              : `Đàn <b>${mob}</b> lao ra cản đường — ngươi đánh dạt, hao <b class="dmgr">${loss}%</b>.`, 'win');
    } else if (type === 'hazard') {
      const lv = statLv(state, D.hazard); const sName = HAZARD_NAME_BY_STAT[D.hazard] || D.hazard;
      if (lv >= req) { const loss = clamp(Math.round(4 * (1 - dodge * 0.4)), 1, 6); hp -= loss;
        add(i + 1, 'hazard', ord + ' · ' + D.hazardName, `<b>${D.hazardName}</b> ập tới, ${sName} thâm hậu chống đỡ ung dung — chỉ hao <b class="dmgr">${loss}%</b>.`, 'win');
      } else { const loss = clamp(Math.round((9 + (req - lv) * 0.6) * (1 - dodge * 0.3)), 8, 42); hp -= loss;
        add(i + 1, 'hazard', ord + ' · ' + D.hazardName, `<b>${D.hazardName}</b> ngấm vào tạng phủ — ${sName} chưa đủ, tổn <b class="dmgr">${loss}%</b>.`, 'hurt');
      }
    } else if (type === 'bay') {
      const tn = statLv(state, 'thanPhap'), lx = statLv(state, 'linhXao');
      const useLx = lx >= tn; const lv = useLx ? lx : tn; const via = useLx ? 'Ngộ Tính' : 'Thân Pháp';
      if (lv >= req + 2) {
        add(i + 1, 'bay', ord + ' · Cạm Bẫy', `Cơ quan kích phát, ngươi cậy <span class="text-amber-300">${via}</span> né gọn — bình an vô sự.`, 'win');
      } else { const loss = clamp(randInt(11, 18), 8, 28); hp -= loss;
        add(i + 1, 'bay', ord + ' · Cạm Bẫy', `Trúng cạm bẫy cơ quan, né không kịp — tổn <b class="dmgr">${loss}%</b> sinh lực.`, 'hurt');
      }
    } else if (type === 'coDuyen') {
      const cands = [
        { lv: statLv(state, 'linhXao'), verb: 'dùng trí giải trận', via: 'Ngộ Tính', loss: 0 },
        { lv: statLv(state, 'thanPhap'), verb: 'nhanh tay mở khoá', via: 'Thân Pháp', loss: 0 },
        { lv: statLv(state, 'lucDao'), verb: 'cường hành phá ấn', via: 'Sức Mạnh', loss: 6 },
      ];
      const best = cands.reduce((a, b) => (b.lv > a.lv ? b : a));
      if (best.lv >= req + 4) { coDuyenBonus = true; if (best.loss) hp -= best.loss;
        add(i + 1, 'coDuyen', ord + ' · Cơ Duyên', `Trước cổ rương phong ấn, ngươi ${best.verb} <span class="text-amber-300">(${best.via})</span> — <span class="text-amber-300 font-bold">đoạt trân bảo!</span>${best.loss ? ` (hao <b class="dmgr">${best.loss}%</b>)` : ''}`, 'fortune');
      } else { const loss = clamp(randInt(10, 15), 6, 24); hp -= loss;
        add(i + 1, 'coDuyen', ord + ' · Cơ Duyên', `Cổ rương khoá chặt, phá không nổi mà dính phản phệ — tổn <b class="dmgr">${loss}%</b>, lỡ trân bảo.`, 'hurt');
      }
    } else if (type === 'kyNgo') {
      kyNgoBonus++;
      add(i + 1, 'kyNgo', ord + ' · Kỳ Ngộ', `Gặp kỳ ngộ giữa đường — nhặt thêm chiến lợi phẩm, sinh lực vẹn nguyên.`, 'fortune');
    }
  }

  // Rút lui GIỮA CHỪNG (chưa tới boss) -> thêm dòng tổng kết (boss-fail đã tự ghi rồi)
  if (hp <= 0 && !cleared && reachedTang < total) add(reachedTang, 'fail', 'Rút Lui', `Sinh lực cạn kiệt, ngươi buộc phải <span class="text-rose-300 font-bold">rút lui</span> khỏi ${D.name}.`, 'fail');
  const hpPct = Math.max(0, Math.round(hp));
  if (!cleared) coDuyenBonus = false; // rút lui -> bỏ bonus cơ duyên

  // ---- ROLL LOOT ----
  const items = {};
  const addLoot = (id, qty) => { if (id && qty > 0) items[id] = (items[id] || 0) + qty; };
  const partialMul = cleared ? 1 : 0.4;
  const bac = Math.round(randInt(D.loot.bac[0], D.loot.bac[1]) * m.bacMul * partialMul);
  const exp = Math.round((D.loot.exp || 0) * m.expMul * (cleared ? 1 : 0.5));
  const honThach = Math.round(randInt(D.loot.honThach[0], D.loot.honThach[1]) * m.honMul * partialMul);

  const lieuN = m.lieuN + (coDuyenBonus ? 1 : 0) + kyNgoBonus;   // cơ duyên + mỗi kỳ ngộ -> thêm 1 lượt rải liệu
  for (let i = 0; i < lieuN; i++) { if (!D.loot.lieu.length) break; addLoot(pick(D.loot.lieu), randInt(1, 2)); }
  if (D.loot.da.length && Math.random() < m.daChance) addLoot(pick(D.loot.da), 1 + (coDuyenBonus ? 1 : 0));

  let doPhoId = null;
  if (cleared && D.loot.doPho) {
    const chance = (D.loot.doPhoChance || 0) * m.doPhoMul * (coDuyenBonus ? 1.3 : 1);
    if (Math.random() < chance) { doPhoId = rollDoPhoId(D); if (doPhoId) addLoot(doPhoId, 1); }
  }
  if (cleared && D.loot.rare) for (const r of D.loot.rare) { if (Math.random() < (r.chance || 0) * (mode === 'treo' ? 1.5 : 1)) addLoot(r.itemId, 1); }

  return { dungeonId, mode, modeLabel: m.label, cleared, reachedTang, hpPct, power, log, doPhoId, loot: { items, bac, exp, honThach } };
}

// ---- CHẠY THẬT: runDungeon + nhập thưởng + lưu kết quả ----
export function grantDungeon(state, dungeonId, mode, now) {
  const run = runDungeon(state, dungeonId, mode);
  if (!run) return null;
  if (run.loot.bac) state.currencies.bac = (state.currencies.bac || 0) + run.loot.bac;
  if (run.loot.honThach) state.currencies.honThach = (state.currencies.honThach || 0) + run.loot.honThach;
  if (run.loot.exp) addSkillXp(state, 'chienDau', run.loot.exp);
  for (const id in run.loot.items) addItem(state, id, run.loot.items[id]);
  if (!state.dungeon) state.dungeon = { lastResult: null, history: [] };
  const summary = { ...run, at: now };
  state.dungeon.lastResult = { ...summary, seen: false };
  state.dungeon.history = [summary, ...(state.dungeon.history || [])].slice(0, 20); // lưu FULL để bấm xem lại
  return state.dungeon.lastResult;
}
