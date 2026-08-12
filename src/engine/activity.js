// ============================================================
// ENGINE — Hoạt động idle (TRÁI TIM của game) — THUẦN
// Hỗ trợ 2 loại: 'skill' (gather/craft, có nguyên liệu) và 'combat' (đánh quái).
// advance() gọi mỗi tick VÀ khi load (offline gains). Chạy được client/server.
// ============================================================
import { SKILLS } from '../data/skills.js';
import { ENEMIES, BAC_DROP_CHANCE, BAC_PER_EXP, LOOT_DROP_MULT } from '../data/combat.js';
import { ITEMS } from '../data/items.js';
import { LINH_THACH, LT_COVER_MS } from '../data/linhthach.js';
import { combatProfile, boPhapStats, COMBAT_CYCLE_MS } from '../data/votong.js';
import { travelTimeMs } from './travel.js';
import { addItem, removeItem } from './inventory.js';
import { addGearInstance } from './equip.js';
import { rollMonsterDrop, rollGearInstance, MONSTER_DROP_CHANCE, MANH_DROP_CHANCE, MANH_DROP_MIN_LV } from '../data/gear.js';
import { titleBonus } from './titles.js';
import { bangNgheBonus, bangKyNangBonus } from './bangbuff.js';
import { ghiKillChinhPhat } from './bangphai.js';   // Bang Phái: điểm Chinh Phạt khi hạ quái (nhánh treo máy)
import { rng, rngHam } from './rng.js';                    // bốc số CÓ HẠT GIỐNG — máy chủ tính lại được (Đợt D)
import { addSkillXp, addStatXp, levelFromXp } from './leveling.js';
import { gainPetXp, resetPetCombat, petCombatCycle, activeAwkVal } from './pets.js';
import { skillExpMultiplier, professionEffMult } from '../data/classes.js';
import { DAMDAO, TIN_VAT_EFF_PCT } from '../data/damdao.js';   // Tín Vật: thưởng Đàm Đạo -> +% hiệu suất nghề
import { DUNGEON_BY_ID } from '../data/dungeon.js';
import { buffVal } from './buff.js';   // Đan Bổ Trợ: +% EXP Chiến Đấu / rơi liệu / Bạc
import { combatExpMult } from './stats.js';   // dòng Tăng EXP trên trang bị (chỉ cấp Chiến Đấu)
import { consumableEffMult } from './setbonus.js';   // dòng ẩn Nhu Tình: +% hiệu lực đan dược & thức ăn
import { grantDungeonRun, finalizeDungeonBatch, newDungeonAcc } from './dungeon.js';
import { dongPhuCapBonusH } from './dongphu.js';   // Động Phủ: +1h trần treo mỗi bậc nhà (điểm móc DUY NHẤT)
import { skMo, skMocDong, skEffBonus, skExpBonus } from './sukien.js';   // Sự Kiện: kĩ năng riêng 6 bậc

export function getAction(skillId, actionId) {
  const skill = SKILLS[skillId];
  if (!skill) return null;
  return skill.actions.find((a) => a.id === actionId) || null;
}

export function idleCapMs(state) {
  return ((state.settings?.idleCapHours || 8) + dongPhuCapBonusH(state)) * 3600 * 1000;
}

export function inputStatus(state, action) {
  if (!action.inputs) return [];
  return action.inputs.map((inp) => {
    const have = state.inventory[inp.itemId] || 0;
    return { itemId: inp.itemId, need: inp.qty, have, ok: have >= inp.qty };
  });
}

export function canStartAction(state, skillId, action) {
  if (levelFromXp(state.skills[skillId]?.xp || 0) < action.reqLevel) return false;
  if (action.needsDoPho && !((((state.player && state.player.doPho) || {})[action.itemId] || 0) > 0)) return false; // bậc 4-7: phải còn lượt Đồ Phổ
  if (action.inputs) {
    for (const inp of action.inputs) {
      if ((state.inventory[inp.itemId] || 0) < inp.qty) return false;
    }
  }
  return true;
}

// ---- Linh Thạch: ĐỐT THEO GIỜ HOẠT ĐỘNG (không còn 1 viên/phiên) ----
// Viên đầu trừ khi bấm Bắt Đầu; sau đó cứ LT_COVER_MS thời gian hoạt động lại đốt tiếp 1 viên
// CÙNG LOẠI đang lắp. Hết loại đó → buff tắt, hoạt động CHẠY TIẾP bình thường.
// effPct CỘNG vào mẫu số cycleMs (gộp cùng Nghề/Công Cụ/Tín Vật) — KHÔNG chia lần hai như trước,
// để mọi nguồn hiệu suất nằm chung một chỗ, dễ soát trần.
function effDenom(state, skillId, effPct) {
  // KĨ NĂNG SỰ KIỆN: hiệu suất CHỈ ăn phụ kiện Bội (0/15/30%) — KHÔNG Nghề/Công Cụ/Tín Vật/bang/
  // Linh Thạch. Trần chống gian lận của sáu track sự kiện tính đúng theo vế này; thêm bất kỳ
  // nguồn nào vào đây là phải sinh lại SQL_CHONG_GIAN_LAN.sql và user chạy lại.
  const _sk = SKILLS[skillId];
  if (_sk && _sk.suKien) return 1 + skEffBonus(state, skillId);
  return professionEffMult(state, skillId) + toolEffBonus(state, skillId) + tinVatEffBonus(state, skillId) + bangEff(state) + (effPct || 0) / 100;
}
function cycleMsFor(state, skillId, action, effPct) {
  return Math.max(1, Math.round(action.time * 1000 / effDenom(state, skillId, effPct)));
}
// Đốt 1 viên nếu còn; trả true nếu buff đang bật sau lời gọi.
function burnLinhThach(state, act) {
  act.buff = null; act.buffMsLeft = 0;
  const itemId = act.ltId;
  if (!itemId) return false;
  const def = LINH_THACH[itemId];
  if (!def) return false;
  if ((state.inventory[itemId] || 0) < 1) return false;   // hết hàng → vẫn giữ lắp, chỉ tắt buff
  removeItem(state, itemId, 1);
  act.buffMsLeft = LT_COVER_MS;
  act.buff = { itemId, expPct: def.expPct || 0, effPct: def.effPct || 0, yieldPct: def.yieldPct || 0, craftOnly: !!def.craftOnly };
  return true;
}

// ---- Công cụ: bonus hiệu suất khai thác từ tool đang đeo (riu/cuoc/canCau) cho kĩ năng khớp ----
const TOOL_FOR_SKILL = { phatMoc: 'riu', thaiKhoang: 'cuoc', dieuNgu: 'canCau', thaiDuoc: 'duocLiem' };
/** Buff nghề từ Bang Phái: Thổ Mộc Chân Quyết (mọi nơi) + thứ hạng Chinh Phạt tại vùng đang đứng. */
function bangEff(state) {
  try { return bangNgheBonus(state, (state.player && state.player.location) || ''); } catch (e) { return 0; }
}
export function toolEffBonus(state, skillId) {
  const slot = TOOL_FOR_SKILL[skillId]; if (!slot) return 0;
  const inst = state.equipment && state.equipment[slot];
  const e = inst && (ITEMS[inst.gearId] || {}).equip;
  return (e && e.gatherEff) || 0;
}

// ---- Tín Vật (thưởng Đàm Đạo): đọc HẾT trọn arc 1 NPC -> +TIN_VAT_EFF_PCT% hiệu suất nghề đó ----
export function tinVatDone(state, skillId) {
  const arc = DAMDAO[skillId]; if (!arc) return false;
  const seen = (state.damDao && state.damDao[skillId]) || [];
  return arc.chapters.every((c) => seen.includes(c.id));
}
export function tinVatEffBonus(state, skillId) { return tinVatDone(state, skillId) ? TIN_VAT_EFF_PCT / 100 : 0; }

// ============================================================
// NHẬT KÝ NGÀY — sổ ghi để vẽ biểu đồ "Hoạt Động (7 ngày)" ở màn Hồ Sơ.
// ⚠ Game trước đây KHÔNG lưu bất kỳ số liệu nào theo ngày, nên biểu đồ chỉ có số TỪ LÚC THÊM SỔ
// này trở đi — không dựng lại được quá khứ.
// ⚠ PHẢI gọi ở CẢ HAI đường thưởng (treo máy ở đây · đánh tại chỗ ở main.js awardKill). Sót một
// vế là hai lối chơi ghi ra hai bộ số khác nhau — đúng cái bẫy đã dính ở Mảnh Trang Bị.
// ============================================================
export const NHATKY_NGAY_GIU = 30;         // giữ 30 ngày gần nhất, đủ cho biểu đồ 7 ngày mà save không phình
export function khoaNgay(ts) {
  const d = new Date(ts);
  const p = (x) => String(x).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
export function ghiNhatKyNgay(state, now, them) {
  if (!them) return;
  if (!state.nhatKyNgay || typeof state.nhatKyNgay !== 'object') state.nhatKyNgay = {};
  const k = khoaNgay(now);
  const o = state.nhatKyNgay[k] || (state.nhatKyNgay[k] = { luot: 0, kill: 0, exp: 0 });
  o.luot += them.luot || 0; o.kill += them.kill || 0; o.exp += them.exp || 0;
  const keys = Object.keys(state.nhatKyNgay);
  if (keys.length > NHATKY_NGAY_GIU) {           // cắt bớt ngày cũ nhất, giữ save gọn
    keys.sort();
    for (let i = 0; i < keys.length - NHATKY_NGAY_GIU; i++) delete state.nhatKyNgay[keys[i]];
  }
}

// ---- Bắt đầu hoạt động kỹ năng ----
// `soLuot` = làm đúng ngần ấy lượt rồi tự dừng. 0 / bỏ trống = chạy tới khi hết nguyên liệu
// hoặc chạm trần nhàn rỗi (nếp cũ).
export function startActivity(state, skillId, actionId, now, soLuot) {
  const action = getAction(skillId, actionId);
  if (!action) return false;
  if (!canStartAction(state, skillId, action)) return false;
  // KĨ NĂNG SỰ KIỆN: sự kiện phải ĐANG MỞ và người chơi phải ĐỨNG TRONG bản đồ sự kiện.
  // UI có lọc rồi nhưng engine vẫn chặn — kẻ sửa client mà cày ngoài giờ thì phép kiểm
  // ngoai_su_kien phía máy chủ ghi sổ; chặn ở đây để NGƯỜI THẬT không dính oan vì lệch giờ.
  const _skDef = SKILLS[skillId];
  const _laSuKien = !!(_skDef && _skDef.suKien);
  if (_laSuKien && (!skMo(state, _skDef.suKien, now) || (action.zone && state.player.location !== action.zone))) return false;
  state.activity = {
    type: 'skill', skillId, actionId,
    limit: Math.max(0, Math.floor(soLuot || 0)),
    cycleMs: cycleMsFor(state, skillId, action, 0),   // Nghề + Công cụ + Tín Vật (+ Linh Thạch nếu đốt được)
    startedAt: now, lastResolved: now,
    sessionCount: 0, progress: 0, capped: false, stalled: false,
    // ⛔ Kĩ năng sự kiện KHÔNG lắp Linh Thạch — ô Bội/Ấn đã làm đúng việc đó (docs/THIET_KE_SU_KIEN.md III5).
    ltId: _laSuKien ? null : ((state.linhThach && state.linhThach[skillId]) || null),
    buff: null, buffMsLeft: 0, buffXpAcc: 0,
    buffAt: now,       // MỐC đã tính đá tới đâu — xem ghi chú ở advance()
  };
  burnLinhThach(state, state.activity);   // viên đầu trừ ngay khi bấm Bắt Đầu
  if (state.activity.buff) state.activity.cycleMs = cycleMsFor(state, skillId, action, state.activity.buff.effPct);
  return true;
}

// ---- Gục -> Suy Yếu: HP=0, tự hồi đầy trong 60s rồi mới đánh tiếp. KHÔNG mất đồ (loot vào kho ngay mỗi kill). ----
export const SUY_YEU_MS = 60000;
function applyDeathCombat(state, now) {
  state.combat.noiThuong = true;
  state.combat.sinhLuc = 0;
  state.combat.suyYeuUntil = now + SUY_YEU_MS;
}

// ---- Tự dùng hồi Sinh Lực khi máu < 25%: ưu tiên Món Ăn, hết món thì dùng Đan hồi máu. Trả 0/1. ----
export const AUTO_USE_PCT = 0.25;
export function autoEatTick(state, maxHP) {
  const cb = state.combat; if (!cb) return 0;
  const cur = cb.sinhLuc == null ? maxHP : cb.sinhLuc;
  if (cur >= maxHP * AUTO_USE_PCT) return 0;                 // còn trên 25% -> chưa dùng
  // Ô "Hồi Sinh Lực" (cb.luongThuc) nhận CẢ Món Ăn lẫn đan hồi máu — đan hồi máu bản chất là món ăn
  // cao cấp. heal = số phẳng (món ăn) · healPct = % Sinh Lực TỐI ĐA (đan; số phẳng vô dụng ở cấp cao).
  const fid = cb.luongThuc, food = fid && ITEMS[fid];
  if (food && (state.inventory[fid] || 0) > 0) {
    // Dòng ẩn bậc 7 bộ Nhu Tình nhân vào ĐÂY — một chỗ này phủ cả đan lẫn món ăn, cả đánh trực
    // tiếp lẫn cày ngoại tuyến (autoEatTick là đường DUY NHẤT biến healPct/heal thành máu).
    const base = food.healPct ? Math.round(maxHP * food.healPct / 100) : (food.heal || 0);
    const amt = Math.round(base * consumableEffMult(state));
    if (amt > 0) { removeItem(state, fid, 1); cb.sinhLuc = Math.min(maxHP, cur + amt); return 1; }
  }
  return 0;
}
// ---- Tự dùng Đan hồi Nội Lực khi NL < 25%. Trả lượng hồi (0 nếu không dùng). ----
export function autoDanNL(state, maxNL, curNL) {
  const cb = state.combat; if (!cb || !cb.danNL) return 0;
  const dan = ITEMS[cb.danNL];
  if (!dan || !dan.healNL || (state.inventory[cb.danNL] || 0) <= 0) return 0;
  if (curNL >= maxNL * AUTO_USE_PCT) return 0;
  removeItem(state, cb.danNL, 1);
  return Math.round(dan.healNL * consumableEffMult(state));   // dòng ẩn Nhu Tình phủ cả đan Nội Lực
}

// Save cũ chỉ có MỘT ô `cb.dan` dùng chung cho cả hồi máu lẫn hồi nội lực -> tách thành 3 ô.
// Chạy 1 lần lúc load; không được để mất món đang lắp.
export function migrateDanSlots(state) {
  const cb = state.combat; if (!cb) return;
  if (cb.dan) {
    const it = ITEMS[cb.dan] || {};
    if (it.healNL && !cb.danNL) cb.danNL = cb.dan;
    else if ((it.heal || it.healPct) && !cb.luongThuc) cb.luongThuc = cb.dan;
    delete cb.dan;
  }
  if (cb.duocLu === undefined) cb.duocLu = null;
  if (cb.danNL === undefined) cb.danNL = null;
}

// ---- Bắt đầu chiến đấu (Tuyệt Học Phổ — theo bài võ, vào trận đầy Sinh Lực) ----
export function startCombat(state, enemyId, now) {
  const enemy = ENEMIES[enemyId];
  if (!enemy) return false;
  if (levelFromXp(state.skills['chienDau']?.xp || 0) < enemy.reqLevel) return false;
  if (state.combat.noiThuong) return false; // phải về thành dưỡng sức trước
  const profile = combatProfile(state, state.combat.loadout, enemy);
  state.combat.sinhLuc = profile.maxHP; // vào trận đầy Sinh Lực
  state.combat.noiLuc = null;           // Nội Lực đầy khi bắt đầu phiên (sau đó trôi qua các trận)
  resetPetCombat(state);                // Linh Thú: HP pet đầy + xoá trạng thái ngất đầu phiên
  state.activity = {
    type: 'combat', enemyId,
    cycleMs: COMBAT_CYCLE_MS,            // 1 con / vòng 8s — cadence thật, đồng bộ với chu kỳ chiến báo
    hpLostPerKill: profile.hpLostPerKill,
    maxHP: profile.maxHP,               // mốc Sinh Lực tối đa (cho ngưỡng tự ăn ở advance)
    startedAt: now, lastResolved: now,
    sessionCount: 0, progress: 0, capped: false, stalled: false,
    sess: { xp: 0, bac: 0, win: 0, lose: 0, loot: {}, gear: [], gearN: 0 },   // thu hoạch phiên (khay + Túi Tạm + Tổng Kết); gearN đếm ĐỦ, gear giữ 12 snapshot đầu {gearId,quality,uid}
  };
  return true;
}

// ---- Khinh Công: 1 dạng HOẠT ĐỘNG (chiếm ô activity → thay gather/combat đang chạy) ----
export function startTravel(state, toId, now) {
  const fromId = state.player.location;
  if (!toId || toId === fromId) return false;
  state.activity = {
    type: 'travel', fromId, toId,
    cycleMs: travelTimeMs(fromId, toId),   // tổng thời gian đi
    startedAt: now, lastResolved: now,
    progress: 0, capped: false, stalled: false,
  };
  return true;
}

// ---- BÍ CẢNH: hoạt động idle treo (timer-1-phát, như Khinh Công). Phí vào do STORE trừ trước. ----
// Số lượt tối đa đặt được = trần treo máy / thời lượng 1 lượt (tối thiểu 1).
export function maxDungeonRuns(state, D) {
  if (!D || !D.durMs) return 1;
  return Math.max(1, Math.floor(idleCapMs(state) / D.durMs));
}
// LỊCH LUYỆN: đặt N lượt liên tiếp (N*durMs <= trần treo máy). Phí do main trừ trước (N * phí vào).
export function startDungeon(state, dungeonId, runs, now) {
  const D = DUNGEON_BY_ID[dungeonId];
  if (!D) return false;
  if (levelFromXp(state.skills['chienDau']?.xp || 0) < D.reqLevel) return false;
  const n = Math.max(1, Math.min(Math.floor(runs) || 1, maxDungeonRuns(state, D)));
  state.activity = {
    type: 'dungeon', dungeonId,
    runs: n, durMs: D.durMs, cycleMs: n * D.durMs,   // tổng thời gian cả lịch
    startedAt: now, lastResolved: now, progress: 0,
    acc: newDungeonAcc(),
  };
  return true;
}

export function stopActivity(state) { state.activity = null; }

// ---- Tiến độ + trao thưởng ----
export function advance(state, now) {
  const act = state.activity;
  if (!act) return null;
  if (!state.counters) state.counters = { produced: {}, kills: {} };

  // Khinh Công: timer 1 lần. Tới giờ -> cập nhật vị trí, kết thúc (nhàn rỗi).
  if (act.type === 'travel') {
    const total = act.cycleMs || 1;
    const elapsed = now - act.startedAt;
    if (elapsed >= total) {
      state.player.location = act.toId;
      state.activity = null;
      return { arrived: true, toId: act.toId };
    }
    act.progress = Math.min(1, elapsed / total);
    return null;
  }

  // ⚠⚠ SỰ KIỆN ĐÓNG GIỮA LÚC TREO MÁY / NGOẠI TUYẾN — chốt đồng hồ lại ở MỐC ĐÓNG.
  // Không có khối này thì tắt game lúc sự kiện còn mở, mở lại sau ba ngày là ăn trọn ba ngày
  // cày trong vùng đã đóng cửa. Mốc `dong` là thời gian TUYỆT ĐỐI đã đệm sẵn trong save nên
  // suy được cả khi mất mạng — đúng nguyên tắc gốc của engine/lenhbai.js.
  // Cả ba đường việc đều phải chặn: đánh quái sự kiện · lịch luyện Bí Cảnh sự kiện · kĩ năng sự kiện.
  // Cờ `suKien` do data/sukien.js tự ghi danh vào ENEMIES / DUNGEONS / SKILLS.
  // Đây chỉ CẮT phần thưởng quá giờ. Việc DỪNG hẳn + báo cho người chơi là của
  // svDungKhiHetHan() bên store — chỗ đó mới chốt được tổng kết phiên.
  {
    const maSK = act.type === 'combat' ? ((ENEMIES[act.enemyId] || {}).suKien || '')
      : act.type === 'dungeon' ? ((DUNGEON_BY_ID[act.dungeonId] || {}).suKien || '')
      : ((SKILLS[act.skillId] || {}).suKien || '');
    if (maSK) {
      const dong = skMocDong(state, maSK);
      if (dong && now > dong) now = dong;
    }
  }

  // Bí Cảnh (LỊCH LUYỆN): N lượt liên tiếp. Mỗi lượt tới giờ -> roll + dồn loot vào kho NGAY (acc gom lại).
  // Hết cả lịch -> chốt tổng kết (lastResult + thông báo). Về giữa chừng vẫn giữ loot các lượt đã xong.
  if (act.type === 'dungeon') {
    if (!act.durMs || act.runs == null) { state.activity = null; return null; }   // thủ: activity dị dạng -> gỡ, tránh NaN kẹt
    if (!act.acc) act.acc = newDungeonAcc();
    const done = Math.min(act.runs, Math.floor((now - act.startedAt) / (act.durMs || 1)));
    const newRuns = done - act.acc.runs;
    for (let k = 0; k < newRuns; k++) grantDungeonRun(state, act.dungeonId, act.acc, now);
    if (done >= act.runs) {
      const result = finalizeDungeonBatch(state, act.dungeonId, act.acc, now);
      state.activity = null;
      return { dungeon: true, dungeonId: act.dungeonId, result, finished: true };
    }
    act.progress = Math.min(1, (now - act.startedAt) / (act.cycleMs || 1));
    return newRuns > 0 ? { dungeon: true, dungeonId: act.dungeonId, partial: true, runsDone: act.acc.runs } : null;
  }

  const cap = idleCapMs(state);
  const remainingCap = Math.max(0, cap - (act.lastResolved - act.startedAt));
  let elapsed = now - act.lastResolved;
  if (elapsed < 0) elapsed = 0;
  let cappedByTime = false;
  if (elapsed > remainingCap) { elapsed = remainingCap; cappedByTime = true; }

  const cyclesByTime = Math.floor(elapsed / act.cycleMs);
  let report = null;
  let ranOut = false;

  if (act.type === 'combat') {
    const enemy = ENEMIES[act.enemyId];
    const cb = state.combat;
    if (cyclesByTime > 0 && enemy && cb) {
      // Đan Bổ Trợ họ Ngộ Đạo: +% EXP CHIẾN ĐẤU (không đụng EXP nghề nào).
      const mult = skillExpMultiplier(state, 'chienDau') * (1 + buffVal(state, 'cbExpPct', now) / 100) * combatExpMult(state);
      const gainXp = Math.max(1, Math.round(enemy.exp * mult));
      const stats = boPhapStats(cb.loadout);               // Tứ Trụ nhận EXP theo các Bộ Pháp (1-2)
      const hpLost = act.hpLostPerKill || 0;               // máu mất mỗi con (từ Suy Tính)
      const maxHP = act.maxHP || (act.maxHP = combatProfile(state, cb.loadout, enemy).maxHP); // mốc ngưỡng tự ăn (memo cho save cũ)
      const bacPer = Math.max(1, Math.round(enemy.exp * BAC_PER_EXP));   // Bạc/kill khi rơi (exp×0.5 -> L100 = 40)
      const _tb = titleBonus(state);                                     // Danh Hiệu: +Bạc/+rơi đồ nhẹ
      // ⚠ `_bg` PHẢI có mặt ở CẢ HAI đường thưởng (đây + awardKill ở main.js). Thiếu ở đâu là
      // kĩ năng bang TRƠ ở đó — Tham Tài Quyết / Lùng Sục Quyết từng chết hẳn vì cả hai chỗ
      // đều chỉ đọc danh hiệu: tốn 1.600×5 Công Tích, ô hiện "+4.0% Bạc Nhặt", mà không ăn gì.
      const _bg = bangKyNangBonus(state);                                // Kĩ năng bang: Tham Tài / Lùng Sục
      const moneyMul = 1 + activeAwkVal(state, 'moneyBonus') + _tb.bacPct + _bg.bacPct + buffVal(state, 'bacPct', now) / 100;  // P7 — Tham Tài (+ họ Bách Bảo)
      const lootMul = 1 + activeAwkVal(state, 'lootBonus') + _tb.dropPct + _bg.dropPct;   // P7 — Lùng Sục
      // BIẾN RIÊNG cho họ Bách Bảo: CHỈ nhân vào loot nguyên liệu thường, TUYỆT ĐỐI không đụng
      // MONSTER_DROP_CHANCE (gear 0,3%). Cộng thẳng vào lootMul là inflate luôn tỉ lệ rơi trang bị.
      const matMul = lootMul * (1 + buffVal(state, 'lootPct', now) / 100);
      let done = 0, died = false, bacGot = 0;
      const sess = act.sess || (act.sess = { xp: 0, bac: 0, win: 0, lose: 0, loot: {}, gear: [], gearN: 0 });   // thu hoạch phiên (save cũ giữa trận -> tự vá)
      for (let i = 0; i < cyclesByTime; i++) {
        autoEatTick(state, maxHP);                          // Ô Lương Thực: tự ăn nếu máu dưới ngưỡng (trước khi vào con)
        const pc = petCombatCycle(state, hpLost, now);                     // Linh Thú: chia lửa + bị động + chủ động
        let hp = Math.max(0, hpLost - (pc.absorb || 0));
        if (pc.heal && cb.sinhLuc != null) cb.sinhLuc = Math.min(maxHP, cb.sinhLuc + pc.heal);
        if (hp > 0 && cb.sinhLuc - hp <= 0) { died = true; break; }        // gục ở con này
        if (hp > 0) cb.sinhLuc -= hp;
        addSkillXp(state, 'chienDau', gainXp);             // EXP vào thẳng (không mất khi gục)
        try { ghiKillChinhPhat(state, (state.player && state.player.location) || '', false, now); } catch (e) {}   // Bang Phái — Chinh Phạt (khớp awardKill ở main.js)
        for (const st of stats) addStatXp(state, st, enemy.statXp);
        // enemy.loot chứa CẢ 4 chiến lợi phẩm boss unique (liệu chế Tuyệt Kĩ) đi chung vòng lặp với Da Sói.
        // noBoost -> Bách Bảo KHÔNG được thổi phồng chúng; chỉ nguyên liệu thường mới ăn matMul.
        if (enemy.loot) for (const l of enemy.loot) { const m = l.noBoost ? lootMul : matMul; if (rng(state, 'ropVat') < l.chance * m * LOOT_DROP_MULT) { addItem(state, l.itemId, 1); sess.loot[l.itemId] = (sess.loot[l.itemId] || 0) + 1; } }
        if (rng(state, 'ropDo') < MONSTER_DROP_CHANCE * lootMul) { const gi = rollMonsterDrop(enemy.reqLevel || 1, rngHam(state, 'ropDo')); if (gi) { addGearInstance(state, gi); sess.gearN = (sess.gearN || 0) + 1; if ((sess.gear || (sess.gear = [])).length < 12) sess.gear.push({ gearId: gi.gearId, quality: gi.quality, uid: gi.uid }); } }   // loot-hunt: rơi gear instance (offline-safe)
        // ⛔ Mảnh Trang Bị Hoàng Kim KHÔNG còn rơi từ quái (user chốt 2026-08-03). Nay chỉ hai
        // đường: thông quan Bí Cảnh Lv70+ và Yêu Vương Lv90+. Giữ MANH_DROP_* trong data để khỏi
        // vỡ chỗ khác đọc, nhưng đường cày quái đã đóng.
        if (rng(state, 'ropBac') < BAC_DROP_CHANCE) { const bg = Math.round(bacPer * moneyMul); state.currencies.bac = (state.currencies.bac || 0) + bg; bacGot += bg; }   // Bạc rơi ~15%/kill (không phải mỗi con)
        state.counters.kills[act.enemyId] = (state.counters.kills[act.enemyId] || 0) + 1;
        done++;
      }
      sess.xp += done * gainXp; sess.bac += bacGot; sess.win += done; if (died) sess.lose += 1;
      ghiNhatKyNgay(state, now, { kill: done, exp: done * gainXp });   // đường TREO MÁY — vế kia ở main.js awardKill
      if (done > 0) gainPetXp(state, Math.round(gainXp * 0.5) * done, done);   // Linh Thú đang mang ăn 50% EXP/trận (gộp offline) + Ngự Thú XP × done
      const sk = state.skills['chienDau'];
      if (sk) { sk.gathered = (sk.gathered || 0) + done; sk.timeMs = (sk.timeMs || 0) + done * act.cycleMs; }
      act.sessionCount += done;
      act.lastResolved += done * act.cycleMs;
      report = { type: 'combat', enemyId: act.enemyId, cycles: done, xp: done * gainXp, bac: bacGot, capped: cappedByTime };
      if (died) { applyDeathCombat(state, now); state.activity = null; report.died = true; report.sess = sess; return report; }   // gục nền/offline: kèm thu hoạch phiên cho caller báo tổng kết
    }
  } else {
    const skill = SKILLS[act.skillId];
    const action = getAction(act.skillId, act.actionId);
    // SỰ KIỆN ĐÓNG GIỮA LÚC TREO MÁY: chỉ tính thưởng tới MỐC ĐÓNG, phần sau bỏ.
    // Mốc là thời gian tuyệt đối đã đệm trong save nên tính được cả khi ngoại tuyến.
    if (skill && skill.suKien) {
      const _dong = skMocDong(state, skill.suKien);
      if (_dong && now > _dong) {
        if (act.lastResolved >= _dong) { state.activity = null; return null; }   // đã quá giờ từ trước -> dừng hẳn
        elapsed = Math.min(elapsed, _dong - act.lastResolved);
      }
    }
    let cyclesByInputs = Infinity;
    if (action.inputs && action.inputs.length) {
      for (const inp of action.inputs) {
        cyclesByInputs = Math.min(cyclesByInputs, Math.floor((state.inventory[inp.itemId] || 0) / inp.qty));
      }
      // Hết nguyên liệu -> TỰ DỪNG như Đồ Phổ bên dưới (không treo thanh tiến độ chạy rỗng).
      // ranOut để caller báo lý do dừng (toast + chuông). cycles:0 nên không tạo offline report.
      if (cyclesByInputs <= 0) { state.activity = null; return { type: 'skill', skillId: act.skillId, itemId: action.itemId, cycles: 0, xp: 0, ranOut: true }; }
    }
    let cyclesByCharge = Infinity;
    if (action.needsDoPho) cyclesByCharge = (((state.player && state.player.doPho) || {})[action.itemId]) || 0; // bậc 4-7: tối đa = số lượt Đồ Phổ còn
    if (action.needsDoPho && cyclesByCharge <= 0) { state.activity = null; return null; } // hết lượt Đồ Phổ -> tự dừng rèn (không treo tiến độ rỗng)
    // ---- Cắt khoảng thời gian thành TỪNG ĐOẠN phủ Linh Thạch ----
    // Đoạn nào còn đá thì trừ 1 viên + chạy cycleMs CÓ buff; hết đá thì phần còn lại chạy cycleMs thường.
    // Vòng lặp có trần (mỗi vòng tiêu ít nhất min(rem, LT_COVER_MS) hoặc thoát) nên không treo.
    // Số lượt người chơi đặt ở modal — trần thứ BA, ngang hàng với nguyên liệu và lượt Đồ Phổ.
    const conLuot = act.limit > 0 ? Math.max(0, act.limit - (act.sessionCount || 0)) : Infinity;
    let capLeft = Math.min(cyclesByInputs, cyclesByCharge, conLuot);
    let rem = elapsed, leftover = 0, advancedMs = 0;
    let cycles = 0, buffedCycles = 0;
    // ⚠⚠ ĐỪNG trừ thẳng `segMs` vào `buffMsLeft`. `lastResolved` chỉ tiến theo VÒNG ĐÃ XONG,
    // nên phần lẻ chưa đủ một vòng nằm lại trong `elapsed` của MỌI lần gọi sau — trừ thẳng là
    // tính đi tính lại đúng phần lẻ đó. advance() chạy mỗi khung hình ⇒ đo được: 60 phút đốt
    // 1.070 viên thay vì 3 (gấp 357 lần), càng mở game nhìn thì đá càng bay.
    // `buffAt` là MỐC THẬT đã tính đá tới đâu: chỉ tính phần [buffAt → mốc hiện tại].
    const moc = act.lastResolved + elapsed;                                   // "bây giờ" sau khi chặn trần nhàn rỗi
    if (act.buffAt == null || act.buffAt < act.lastResolved) act.buffAt = act.lastResolved;   // save cũ chưa có mốc
    let daTinh = Math.min(elapsed, act.buffAt - act.lastResolved);            // đầu cửa sổ này đã tính rồi bao nhiêu
    const truDa = (msDoan) => {                                               // trừ đá phần CHƯA từng tính
      const moi = Math.max(0, msDoan - daTinh);
      daTinh = Math.max(0, daTinh - msDoan);
      return moi;
    };
    // GIỮ LẠI hiệu ứng của đá đã dùng: hết đá thì burnLinhThach gán act.buff = null NGAY TRONG vòng lặp,
    // nên KHÔNG được đọc act.buff sau vòng lặp để tính thưởng — sẽ mất trắng phần buff của các đoạn đã phủ.
    let buffExpPct = 0, buffYieldPct = 0;
    while (rem > 0 && capLeft > 0) {
      if (act.buffMsLeft <= 0) burnLinhThach(state, act);          // hết đoạn -> đốt viên kế (hoặc tắt buff)
      const buffed = !!act.buff;
      if (buffed) { buffExpPct = act.buff.expPct || 0; buffYieldPct = act.buff.yieldPct || 0; }
      act.cycleMs = cycleMsFor(state, act.skillId, action, buffed ? act.buff.effPct : 0);
      // Đoạn phủ đá dài bằng: phần ĐẦU cửa sổ đã tính đá rồi (`daTinh`) + phần đá còn lại.
      // Cộng `daTinh` vào đây thì đoạn cắt và phép trừ khớp nhau, đá cạn đúng lúc đoạn kết thúc.
      const segMs = buffed ? Math.min(rem, daTinh + act.buffMsLeft) : rem;
      const avail = leftover + segMs;
      let n = Math.floor(avail / act.cycleMs);
      if (n > capLeft) {                                            // chạm trần nguyên liệu/Đồ Phổ giữa đoạn
        n = capLeft;
        const usedMs = Math.max(0, n * act.cycleMs - leftover);
        const truA = truDa(usedMs);
        if (buffed) act.buffMsLeft -= truA;
        rem -= usedMs; advancedMs += n * act.cycleMs; leftover = 0;
        cycles += n; if (buffed) buffedCycles += n;
        capLeft = 0; break;
      }
      leftover = avail - n * act.cycleMs;
      advancedMs += n * act.cycleMs;
      cycles += n; if (buffed) buffedCycles += n;
      capLeft -= n;
      const truB = truDa(segMs);
      if (buffed) act.buffMsLeft -= truB;
      rem -= segMs;
    }
    act.buffAt = Math.max(act.buffAt, moc);   // chốt mốc: lần gọi sau không tính lại khúc này nữa
    if (cycles > 0) {
      // KĨ NĂNG SỰ KIỆN: EXP chỉ ăn phụ kiện Ấn (0/20/40%) — KHÔNG Nghề/Điểm Danh. Cùng lý do
      // với effDenom ở trên: trần chống gian lận của track sự kiện tính đúng theo vế này.
      const mult = (skill && skill.suKien) ? 1 + skExpBonus(state, act.skillId) : skillExpMultiplier(state, act.skillId);
      const gainXp = Math.max(1, Math.round(action.xp * mult));
      // Bội Sản chỉ áp khi hành động CÓ nguyên liệu vào VÀ sản phẩm KHÔNG phải trang bị.
      // Luật theo ACTION chứ không theo nghề: doanhTao có datSet/cat không tốn liệu (sinh vật liệu từ hư không),
      // daTao ra gear instance (nhân đôi = thêm một lần roll affix miễn phí, phá loot-hunt).
      const yieldOk = !!(action.inputs && action.inputs.length) && !(ITEMS[action.itemId] || {}).equip;
      const yieldPct = yieldOk ? buffYieldPct : 0;
      let bonusOut = 0;
      for (let i = 0; i < cycles; i++) {
        if (action.inputs) for (const inp of action.inputs) removeItem(state, inp.itemId, inp.qty);
        // Rèn gear (mọi món có .equip, gồm cả legacy tichSao/thietKiem/tichGiap) -> instance ROLL. Sản phẩm khác (thỏi/đan...) -> xếp chồng.
        if (action.itemId) { if (ITEMS[action.itemId] && ITEMS[action.itemId].equip) addGearInstance(state, rollGearInstance(action.itemId, null, rngHam(state, 'renDo'))); else addItem(state, action.itemId, 1); }
        if (yieldPct && i < buffedCycles && rng(state, 'boiSan') < yieldPct / 100) { addItem(state, action.itemId, 1); bonusOut++; }
        addSkillXp(state, act.skillId, gainXp);
        if (skill.stat) addStatXp(state, skill.stat, action.statXp);
        if (skill.stat2) addStatXp(state, skill.stat2, action.statXp);
      }
      // Linh Thạch: cộng phần EXP% — TÍCH LŨY phân số qua các lần advance rồi flush phần
      // nguyên. Tránh mất buff do làm tròn khi EXP nhỏ (foreground mỗi lần chỉ 1 vòng:
      // +10% của 4 = 0.4 → round = 0). Acc nằm trên activity nên bền qua reload/offline.
      // CHỈ tính trên số vòng THẬT SỰ được phủ buff (buffedCycles), không phải toàn bộ.
      let buffXp = 0;
      if (buffExpPct && buffedCycles > 0) {
        act.buffXpAcc = (act.buffXpAcc || 0) + action.xp * mult * (buffExpPct / 100) * buffedCycles;
        buffXp = Math.floor(act.buffXpAcc);
        if (buffXp > 0) { addSkillXp(state, act.skillId, buffXp); act.buffXpAcc -= buffXp; }
      }
      ghiNhatKyNgay(state, now, { luot: cycles, exp: cycles * gainXp + buffXp });
      if (bonusOut && action.itemId) state.counters.produced[action.itemId] = (state.counters.produced[action.itemId] || 0) + bonusOut;
      const sk = state.skills[act.skillId];
      if (sk) { sk.gathered = (sk.gathered || 0) + cycles; sk.timeMs = (sk.timeMs || 0) + advancedMs; }
      if (action.itemId) state.counters.produced[action.itemId] = (state.counters.produced[action.itemId] || 0) + cycles;
      act.sessionCount += cycles;
      act.lastResolved += advancedMs;   // các đoạn có cycleMs khác nhau -> cộng ms THẬT, không nhân cycles×cycleMs
      report = { type: 'skill', skillId: act.skillId, itemId: action.itemId, cycles, xp: cycles * gainXp + buffXp, capped: cappedByTime };
    }
    if (action.needsDoPho && cycles > 0 && state.player && state.player.doPho) { // trừ lượt Đồ Phổ đã dùng
      state.player.doPho[action.itemId] = Math.max(0, (state.player.doPho[action.itemId] || 0) - cycles);
      if (state.player.doPho[action.itemId] <= 0) delete state.player.doPho[action.itemId];
    }
    // Làm ĐỦ SỐ LƯỢT đã đặt -> dừng hẳn. Khác "hết nguyên liệu": đây là việc xong theo ý người
    // chơi, nên báo bằng lời khác và KHÔNG dựng cờ stalled.
    if (act.limit > 0 && (act.sessionCount || 0) >= act.limit) {
      const xong = report || { type: 'skill', skillId: act.skillId, itemId: action.itemId, cycles: 0, xp: 0 };
      xong.doneLimit = true; xong.limit = act.limit;
      state.activity = null;
      return xong;
    }
    // Dừng vì HẾT nguyên liệu / hết lượt Đồ Phổ (không phải vì hết thời gian): còn thời gian mà trần đã cạn.
    ranOut = (capLeft <= 0) && (rem > 0) && ((cyclesByInputs !== Infinity) || (cyclesByCharge !== Infinity));
  }

  if (ranOut) {
    act.stalled = true;
    act.lastResolved = now;
  } else {
    act.stalled = false;
    // Chạm trần nhàn rỗi: tiêu nốt phần dư (<1 chu kỳ, không đủ thưởng) cho đầy trần -> timer về 0,
    // đánh dấu "đầy" thay vì kẹt lại vài giây vì floor(elapsed/cycleMs)=0 khiến lastResolved đứng yên.
    if (cappedByTime) {
      act.lastResolved = act.startedAt + cap;
      act.capped = true;
    }
  }

  if (act.stalled) act.progress = 0;
  else if (act.capped) act.progress = 1;
  else act.progress = Math.min(1, (now - act.lastResolved) / act.cycleMs);

  return report;
}
