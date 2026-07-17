// ============================================================
// ENGINE — BÍ CẢNH (Dungeon idle) — THUẦN.
// runDungeon(state, dungeonId): mô phỏng 1 lượt theo D.tangs[] (số tầng + loại KHÁC NHAU mỗi phó
//   bản) -> {cleared, log[], loot, hpPct, doPhoId, ...}. KHÔNG mutate kho. Loot = base × RUN × D.pace.
// LỊCH LUYỆN gộp N lượt: grantDungeonRun(state,id,acc,now) chạy+nhập 1 lượt & gom vào acc;
//   finalizeDungeonBatch(state,id,acc,now) chốt tổng kết (lastResult+history+1 thông báo).
//   grantDungeon(state,id,count,now) = chạy count lượt liền rồi chốt (dev/entry đơn giản).
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
import { ITEMS, itemNameHtml } from '../data/items.js';   // tên vật phẩm (tô màu phẩm chất) cho thông báo Phi Cáp Đài
import { BICANH_BK_CHANCE, rollBiCanhBiKip, BI_KIP_BY_ID, BI_KIP_TIER } from '../data/tongmon.js';   // rơi bí kíp về Tông Môn (main->phụ 1 chiều, side-only)
import { deriveCombat } from '../data/votong.js';
import { GEAR, BAC_QUALITY } from '../data/gear.js';
import { levelFromXp, addSkillXp } from './leveling.js';
import { addItem } from './inventory.js';
import { pushNotif } from './notif.js';

// ---- Hằng số cân bằng (TUNE) ----
// Thưởng NỀN mỗi lượt (kế thừa "Treo Luyện" cũ). Nhân thêm D.pace để giữ loot/giờ khi durMs rút ngắn.
const RUN = { bacMul: 3, expMul: 3, honMul: 2, lieuN: 2, daChance: 0.70, doPhoMul: 1.6, rareMul: 1.5 };
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
  const byQual = Object.values(GEAR).filter((g) => g.equip && !g.equip.set && quals.includes(g.quality)); // loại Bộ Trang (set curate, không rơi Đồ Phổ random)
  let pool = byQual;
  if (dp.slots !== 'all') { const bySlot = byQual.filter((g) => dp.slots.includes(g.equip.slot)); if (bySlot.length) pool = bySlot; } // slot cấu hình sai/rỗng -> fallback phẩm chất (không phí lượt trúng)
  if (!pool.length) return null;
  return 'dp_' + pick(pool).id;
}

// Đồ Phổ CÔNG CỤ (rìu/cuốc/cần câu) — roll RIÊNG, pool chỉ tool -> KHÔNG làm loãng drop gear combat. Trả 'dp_<toolId>' | null.
const TOOL_DP_SLOTS = ['riu', 'cuoc', 'canCau'];
function rollToolDoPhoId(D) {
  const td = D.loot.toolDoPho; if (!td) return null;
  const bacs = Array.isArray(td.bac) ? td.bac : [td.bac];
  const quals = bacs.map((b) => BAC_QUALITY[b]);
  const pool = Object.values(GEAR).filter((g) => g.equip && TOOL_DP_SLOTS.includes(g.equip.slot) && quals.includes(g.quality));
  if (!pool.length) return null;
  return 'dp_' + pick(pool).id;
}

// ---- MÔ PHỎNG 1 LƯỢT (thuần, không mutate kho) ----
export function runDungeon(state, dungeonId) {
  const D = DUNGEON_BY_ID[dungeonId];
  if (!D) return null;
  const P = D.pace || 1;   // hệ số giữ loot/giờ = Treo Luyện cũ (durMs rút ngắn từ treoMs cũ)
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
  const bac = Math.round(randInt(D.loot.bac[0], D.loot.bac[1]) * RUN.bacMul * P * partialMul);
  const exp = Math.round((D.loot.exp || 0) * RUN.expMul * P * (cleared ? 1 : 0.5));
  const honThach = Math.round(randInt(D.loot.honThach[0], D.loot.honThach[1]) * RUN.honMul * P * partialMul);

  const lieuN = Math.max(1, Math.round(RUN.lieuN * P)) + (coDuyenBonus ? 1 : 0) + kyNgoBonus;   // cơ duyên + mỗi kỳ ngộ -> thêm 1 lượt rải liệu
  for (let i = 0; i < lieuN; i++) { if (!D.loot.lieu.length) break; addLoot(pick(D.loot.lieu), randInt(1, 2)); }
  if (D.loot.da.length && Math.random() < RUN.daChance * P) addLoot(pick(D.loot.da), 1 + (coDuyenBonus ? 1 : 0));

  let doPhoId = null;
  if (cleared && D.loot.doPho) {
    const chance = (D.loot.doPhoChance || 0) * RUN.doPhoMul * P * (coDuyenBonus ? 1.3 : 1);
    if (Math.random() < chance) { doPhoId = rollDoPhoId(D); if (doPhoId) addLoot(doPhoId, 1); }
  }
  // Đồ Phổ CÔNG CỤ: roll RIÊNG (pool tool), không cạnh tranh với doPho gear combat -> không loãng loot trang bị
  let toolDoPhoId = null;
  if (cleared && D.loot.toolDoPho) {
    const tchance = (D.loot.toolDoPho.chance || 0) * RUN.doPhoMul * P * (coDuyenBonus ? 1.3 : 1);
    if (Math.random() < tchance) { toolDoPhoId = rollToolDoPhoId(D); if (toolDoPhoId) addLoot(toolDoPhoId, 1); }
  }
  if (cleared && D.loot.rare) for (const r of D.loot.rare) { if (Math.random() < (r.chance || 0) * RUN.rareMul * P) addLoot(r.itemId, 1); }

  // BÍ KÍP -> Tông Môn (main->phụ 1 chiều): roll thuần, KHÔNG vào kho main; grant nạp vào biKipBag
  let biKipDropId = null;
  if (cleared) {
    const bkChance = BICANH_BK_CHANCE * RUN.doPhoMul * P * (coDuyenBonus ? 1.3 : 1);
    if (Math.random() < bkChance) biKipDropId = rollBiCanhBiKip(D.reqLevel);
  }

  return { dungeonId, cleared, reachedTang, hpPct, power, log, doPhoId, toolDoPhoId, biKipDropId, loot: { items, bac, exp, honThach } };
}

// ---- LỊCH LUYỆN: gộp N lượt. Bộ tích luỹ (acc) gom loot cả lịch để tổng kết + thông báo 1 lần. ----
export function newDungeonAcc() {
  return { items: {}, bac: 0, exp: 0, honThach: 0, clears: 0, runs: 0, doPhoIds: [], biKipDrops: [], perRun: [], lastRun: null, power: 0 };
}

// Chạy 1 lượt: nhập thưởng THẲNG vào state (loot dồn vào kho ngay) + gom vào acc.
export function grantDungeonRun(state, dungeonId, acc, now) {
  const run = runDungeon(state, dungeonId);
  if (!run) return null;
  if (state.codex && state.codex.dungeonRuns) state.codex.dungeonRuns[dungeonId] = (state.codex.dungeonRuns[dungeonId] || 0) + 1;
  if (run.loot.bac) state.currencies.bac = (state.currencies.bac || 0) + run.loot.bac;
  if (run.loot.honThach) state.currencies.honThach = (state.currencies.honThach || 0) + run.loot.honThach;
  if (run.loot.exp) addSkillXp(state, 'chienDau', run.loot.exp);
  for (const id in run.loot.items) addItem(state, id, run.loot.items[id]);
  // BÍ KÍP -> Tàng Thư Lâu Tông Môn (main->phụ 1 chiều; side-only)
  if (run.biKipDropId && state.tongMon) {
    const bag = state.tongMon.biKipBag || (state.tongMon.biKipBag = {});
    bag[run.biKipDropId] = (bag[run.biKipDropId] || 0) + 1;
    const _bk = BI_KIP_BY_ID[run.biKipDropId];
    if (_bk) run.biKipDrop = { id: run.biKipDropId, ten: _bk.ten, tier: _bk.tier, tierName: (BI_KIP_TIER[_bk.tier] || {}).name, tierColor: (BI_KIP_TIER[_bk.tier] || {}).color, he: _bk.he };
  }
  acc.runs++; acc.bac += run.loot.bac || 0; acc.exp += run.loot.exp || 0; acc.honThach += run.loot.honThach || 0;
  for (const id in run.loot.items) acc.items[id] = (acc.items[id] || 0) + run.loot.items[id];
  if (run.cleared) acc.clears++;
  if (run.doPhoId) acc.doPhoIds.push(run.doPhoId);
  if (run.toolDoPhoId) acc.doPhoIds.push(run.toolDoPhoId);   // Đồ Phổ công cụ -> hiển thị chung danh sách Đồ Phổ
  if (run.biKipDrop) acc.biKipDrops.push(run.biKipDrop);
  acc.perRun.push({ cleared: run.cleared, hpPct: run.hpPct, loot: run.loot, doPhoId: run.doPhoId, biKipDrop: run.biKipDrop || null });
  acc.lastRun = run; acc.power = run.power;
  return run;
}

// Chốt cả lịch: lưu lastResult (tổng kết) + history + 1 thông báo gộp.
export function finalizeDungeonBatch(state, dungeonId, acc, now) {
  if (!acc || !acc.runs) return null;
  if (!state.dungeon) state.dungeon = { lastResult: null, history: [] };
  const single = acc.runs === 1;
  const summary = {
    dungeonId, at: now, runs: acc.runs, clears: acc.clears,
    loot: { items: acc.items, bac: acc.bac, exp: acc.exp, honThach: acc.honThach },
    doPhoIds: acc.doPhoIds.slice(), biKipDrops: acc.biKipDrops.slice(), perRun: acc.perRun.slice(),
    power: acc.power,
    // tương thích hiển thị 1 lượt (giữ narrative + doPho/biKip đơn khi single)
    log: single && acc.lastRun ? acc.lastRun.log : null,
    hpPct: single && acc.lastRun ? acc.lastRun.hpPct : null,
    cleared: acc.clears > 0,
    doPhoId: single ? (acc.doPhoIds[0] || null) : null,
    biKipDrop: single ? (acc.biKipDrops[0] || null) : null,
  };
  state.dungeon.lastResult = { ...summary, seen: false };
  state.dungeon.history = [summary, ...(state.dungeon.history || [])].slice(0, 20);
  // ---- Thông báo (chuông + Phi Cáp Đài) ----
  const _dn = (DUNGEON_BY_ID[dungeonId] || {}).name || 'Bí Cảnh';
  const _p = [];
  if (acc.bac) _p.push(acc.bac.toLocaleString('vi-VN') + ' Bạc');
  if (acc.exp) _p.push(acc.exp.toLocaleString('vi-VN') + ' EXP');
  if (acc.honThach) _p.push(acc.honThach + ' Hồn Thạch');
  const dpCount = {};
  acc.doPhoIds.forEach((id) => { dpCount[id] = (dpCount[id] || 0) + 1; });
  for (const id in dpCount) _p.push(itemNameHtml(id, (ITEMS[id] || {}).name || 'Đồ Phổ') + (dpCount[id] > 1 ? ' ×' + dpCount[id] : ''));
  acc.biKipDrops.forEach((bk) => _p.push('Bí Kíp 「' + bk.ten + '」 → Tông Môn'));
  const _items = [];
  for (const id in acc.items) { if (id.slice(0, 3) === 'dp_') continue; _items.push(itemNameHtml(id) + ' ×' + acc.items[id]); }
  if (_items.length) _p.push('Nhận: ' + (_items.length > 6 ? _items.slice(0, 6).join(', ') + ' … +' + (_items.length - 6) + ' loại' : _items.join(', ')));
  const title = single
    ? (acc.clears ? 'Thông quan ' : 'Rút lui ') + _dn
    : 'Lịch Luyện ' + _dn + ' · ' + acc.clears + '/' + acc.runs + ' thông quan';
  pushNotif(state, 'biCanh', title, _p.join(' · '), now);
  return state.dungeon.lastResult;
}

// Chạy NGAY N lượt liên tiếp rồi chốt (dùng cho dev / entry đơn giản).
export function grantDungeon(state, dungeonId, count, now) {
  if (!DUNGEON_BY_ID[dungeonId]) return null;
  const n = Math.max(1, Math.floor(count) || 1);
  const acc = newDungeonAcc();
  for (let i = 0; i < n; i++) grantDungeonRun(state, dungeonId, acc, now);
  return finalizeDungeonBatch(state, dungeonId, acc, now);
}
