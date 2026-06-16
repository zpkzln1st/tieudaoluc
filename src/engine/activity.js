// ============================================================
// ENGINE — Hoạt động idle (TRÁI TIM của game) — THUẦN
// Hỗ trợ 2 loại: 'skill' (gather/craft, có nguyên liệu) và 'combat' (đánh quái).
// advance() gọi mỗi tick VÀ khi load (offline gains). Chạy được client/server.
// ============================================================
import { SKILLS } from '../data/skills.js';
import { ENEMIES } from '../data/combat.js';
import { ITEMS } from '../data/items.js';
import { LINH_THACH } from '../data/linhthach.js';
import { combatProfile, boPhapStats, COMBAT_CYCLE_MS } from '../data/votong.js';
import { travelTimeMs } from './travel.js';
import { addItem, removeItem } from './inventory.js';
import { addSkillXp, addStatXp, levelFromXp } from './leveling.js';
import { gainPetXp, resetPetCombat, petCombatCycle, activeAwkVal } from './pets.js';
import { skillExpMultiplier, professionEffMult } from '../data/classes.js';
import { DUNGEON_BY_ID } from '../data/dungeon.js';
import { grantDungeon } from './dungeon.js';

export function getAction(skillId, actionId) {
  const skill = SKILLS[skillId];
  if (!skill) return null;
  return skill.actions.find((a) => a.id === actionId) || null;
}

export function idleCapMs(state) {
  return (state.settings?.idleCapHours || 8) * 3600 * 1000;
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

// ---- Linh Thạch: lắp cho phiên (trừ 1 viên, set buff, giảm cycleMs theo hiệu suất) ----
// Gọi ở đầu mỗi phiên skill. Nếu có lắp & còn hàng → tiêu hao 1, áp buff cho cả phiên.
function applyLinhThach(state, act, skillId) {
  act.buff = null;
  const itemId = state.linhThach && state.linhThach[skillId];
  if (!itemId) return;
  const def = LINH_THACH[itemId];
  if (!def) return;
  if ((state.inventory[itemId] || 0) < 1) return; // hết hàng → vẫn giữ lắp, không kích hoạt
  removeItem(state, itemId, 1);
  act.buff = { itemId, expPct: def.expPct || 0, effPct: def.effPct || 0 };
  if (def.effPct) act.cycleMs = Math.max(1, Math.round(act.cycleMs / (1 + def.effPct / 100)));
}

// ---- Công cụ: bonus hiệu suất khai thác từ tool đang đeo (riu/cuoc/canCau) cho kĩ năng khớp ----
const TOOL_FOR_SKILL = { phatMoc: 'riu', thaiKhoang: 'cuoc', dieuNgu: 'canCau' };
export function toolEffBonus(state, skillId) {
  const slot = TOOL_FOR_SKILL[skillId]; if (!slot) return 0;
  const id = state.equipment && state.equipment[slot];
  const it = id && ITEMS[id];
  return (it && it.equip && it.equip.gatherEff) || 0;
}

// ---- Bắt đầu hoạt động kỹ năng ----
export function startActivity(state, skillId, actionId, now) {
  const action = getAction(skillId, actionId);
  if (!action) return false;
  if (!canStartAction(state, skillId, action)) return false;
  if (state.activity && state.activity.type === 'combat') bankPending(state);
  state.activity = {
    type: 'skill', skillId, actionId,
    cycleMs: Math.max(1, Math.round(action.time * 1000 / (professionEffMult(state, skillId) + toolEffBonus(state, skillId)))), // Nghề + Công cụ: nhanh hơn
    startedAt: now, lastResolved: now,
    sessionCount: 0, progress: 0, capped: false, stalled: false,
    buff: null, buffXpAcc: 0,
  };
  applyLinhThach(state, state.activity, skillId);
  return true;
}

// ---- Túi Chiến Lợi Phẩm: nhập kho an toàn (dừng/đổi/thắng) ----
export function bankPending(state) {
  const pend = state.combat && state.combat.pending;
  if (!pend) return;
  if (pend.bac) state.currencies.bac = (state.currencies.bac || 0) + pend.bac;
  for (const k in pend.items) addItem(state, k, pend.items[k]);
  state.combat.pending = { exp: 0, bac: 0, items: {} };
}
// ---- Trọng Thương: mất 40% túi, nhập 60% còn lại, dính Nội Thương ----
function applyDeathCombat(state) {
  const pend = state.combat.pending;
  pend.bac = Math.round((pend.bac || 0) * 0.6);
  for (const k in pend.items) pend.items[k] = Math.floor(pend.items[k] * 0.6);
  bankPending(state); // nhập 60% còn lại
  state.combat.noiThuong = true;
  state.combat.sinhLuc = 0;
}

// ---- Tự dùng hồi Sinh Lực khi máu < 25%: ưu tiên Món Ăn, hết món thì dùng Đan hồi máu. Trả 0/1. ----
export const AUTO_USE_PCT = 0.25;
export function autoEatTick(state, maxHP) {
  const cb = state.combat; if (!cb) return 0;
  const cur = cb.sinhLuc == null ? maxHP : cb.sinhLuc;
  if (cur >= maxHP * AUTO_USE_PCT) return 0;                 // còn trên 25% -> chưa dùng
  const fid = cb.luongThuc, food = fid && ITEMS[fid];        // 1) Món Ăn
  if (food && food.heal && (state.inventory[fid] || 0) > 0) {
    removeItem(state, fid, 1); cb.sinhLuc = Math.min(maxHP, cur + food.heal); return 1;
  }
  const did = cb.dan, dan = did && ITEMS[did];               // 2) Đan hồi máu (nếu đan đang lắp hồi Sinh Lực)
  if (dan && dan.heal && (state.inventory[did] || 0) > 0) {
    removeItem(state, did, 1); cb.sinhLuc = Math.min(maxHP, cur + dan.heal); return 1;
  }
  return 0;
}
// ---- Tự dùng Đan hồi Nội Lực khi NL < 25%. Trả lượng hồi (0 nếu không dùng). ----
export function autoDanNL(state, maxNL, curNL) {
  const cb = state.combat; if (!cb || !cb.dan) return 0;
  const dan = ITEMS[cb.dan];
  if (!dan || !dan.healNL || (state.inventory[cb.dan] || 0) <= 0) return 0;
  if (curNL >= maxNL * AUTO_USE_PCT) return 0;
  removeItem(state, cb.dan, 1);
  return dan.healNL;
}

// ---- Bắt đầu chiến đấu (Tuyệt Học Phổ — theo bài võ, vào trận đầy Sinh Lực) ----
export function startCombat(state, enemyId, now) {
  const enemy = ENEMIES[enemyId];
  if (!enemy) return false;
  if (levelFromXp(state.skills['chienDau']?.xp || 0) < enemy.reqLevel) return false;
  if (state.combat.noiThuong) return false; // phải về thành dưỡng sức trước
  if (state.activity && state.activity.type === 'combat') bankPending(state);
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
  };
  return true;
}

// ---- Khinh Công: 1 dạng HOẠT ĐỘNG (chiếm ô activity → thay gather/combat đang chạy) ----
export function startTravel(state, toId, now) {
  const fromId = state.player.location;
  if (!toId || toId === fromId) return false;
  if (state.activity && state.activity.type === 'combat') bankPending(state);
  state.activity = {
    type: 'travel', fromId, toId,
    cycleMs: travelTimeMs(fromId, toId),   // tổng thời gian đi
    startedAt: now, lastResolved: now,
    progress: 0, capped: false, stalled: false,
  };
  return true;
}

// ---- BÍ CẢNH: hoạt động idle treo (timer-1-phát, như Khinh Công). Phí vào do STORE trừ trước. ----
export function startDungeon(state, dungeonId, mode, now) {
  const D = DUNGEON_BY_ID[dungeonId];
  if (!D) return false;
  if (levelFromXp(state.skills['chienDau']?.xp || 0) < D.reqLevel) return false;
  if (state.activity && state.activity.type === 'combat') bankPending(state);
  const treo = mode === 'treo';
  state.activity = {
    type: 'dungeon', dungeonId, mode: treo ? 'treo' : 'nhanh',
    cycleMs: treo ? D.treoMs : D.nhanhMs,   // tổng thời gian treo (không phải chu kỳ lặp)
    startedAt: now, lastResolved: now,
    progress: 0, capped: false, stalled: false,
  };
  return true;
}

export function stopActivity(state) { if (state.activity && state.activity.type === 'combat') bankPending(state); state.activity = null; }

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

  // Bí Cảnh: timer 1 lần. Tới giờ -> roll 5 tầng + loot, nhập thưởng, kết thúc (nhàn rỗi).
  if (act.type === 'dungeon') {
    const total = act.cycleMs || 1;
    const elapsed = now - act.startedAt;
    if (elapsed >= total) {
      const result = grantDungeon(state, act.dungeonId, act.mode, now);
      state.activity = null;
      return { dungeon: true, dungeonId: act.dungeonId, result };
    }
    act.progress = Math.min(1, elapsed / total);
    return null;
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
      const mult = skillExpMultiplier(state, 'chienDau');
      const gainXp = Math.max(1, Math.round(enemy.exp * mult));
      const stats = boPhapStats(cb.loadout);               // Tứ Trụ nhận EXP theo các Bộ Pháp (1-2)
      const hpLost = act.hpLostPerKill || 0;               // máu mất mỗi con (từ Suy Tính)
      const maxHP = act.maxHP || (act.maxHP = combatProfile(state, cb.loadout, enemy).maxHP); // mốc ngưỡng tự ăn (memo cho save cũ)
      const bacPer = Math.max(1, Math.round(enemy.exp * 1.5));
      const moneyMul = 1 + activeAwkVal(state, 'moneyBonus');             // P7 — Tham Tài
      const lootMul = 1 + activeAwkVal(state, 'lootBonus');               // P7 — Lùng Sục
      let done = 0, died = false;
      for (let i = 0; i < cyclesByTime; i++) {
        autoEatTick(state, maxHP);                          // Ô Lương Thực: tự ăn nếu máu dưới ngưỡng (trước khi vào con)
        const pc = petCombatCycle(state, hpLost, now);                     // Linh Thú: chia lửa + bị động + chủ động
        let hp = Math.max(0, hpLost - (pc.absorb || 0));
        if (pc.heal && cb.sinhLuc != null) cb.sinhLuc = Math.min(maxHP, cb.sinhLuc + pc.heal);
        if (hp > 0 && cb.sinhLuc - hp <= 0) { died = true; break; }        // gục ở con này
        if (hp > 0) cb.sinhLuc -= hp;
        addSkillXp(state, 'chienDau', gainXp);             // EXP vào thẳng (không mất khi gục)
        for (const st of stats) addStatXp(state, st, enemy.statXp);
        if (enemy.loot) for (const l of enemy.loot) { if (Math.random() < l.chance * lootMul) cb.pending.items[l.itemId] = (cb.pending.items[l.itemId] || 0) + 1; }
        cb.pending.bac += Math.round(bacPer * moneyMul);   // loot + Bạc -> túi tạm (mất 40% nếu gục)
        state.counters.kills[act.enemyId] = (state.counters.kills[act.enemyId] || 0) + 1;
        done++;
      }
      if (done > 0) gainPetXp(state, Math.round(gainXp * 0.5) * done, done);   // Linh Thú đang mang ăn 50% EXP/trận (gộp offline) + Ngự Thú XP × done
      const sk = state.skills['chienDau'];
      if (sk) { sk.gathered = (sk.gathered || 0) + done; sk.timeMs = (sk.timeMs || 0) + done * act.cycleMs; }
      act.sessionCount += done;
      act.lastResolved += done * act.cycleMs;
      report = { cycles: done, itemId: null, xp: done * gainXp };
      if (died) { applyDeathCombat(state); state.activity = null; return report; }
    }
  } else {
    const skill = SKILLS[act.skillId];
    const action = getAction(act.skillId, act.actionId);
    let cyclesByInputs = Infinity;
    if (action.inputs && action.inputs.length) {
      for (const inp of action.inputs) {
        cyclesByInputs = Math.min(cyclesByInputs, Math.floor((state.inventory[inp.itemId] || 0) / inp.qty));
      }
    }
    let cyclesByCharge = Infinity;
    if (action.needsDoPho) cyclesByCharge = (((state.player && state.player.doPho) || {})[action.itemId]) || 0; // bậc 4-7: tối đa = số lượt Đồ Phổ còn
    if (action.needsDoPho && cyclesByCharge <= 0) { state.activity = null; return null; } // hết lượt Đồ Phổ -> tự dừng rèn (không treo tiến độ rỗng)
    const cycles = Math.min(cyclesByTime, cyclesByInputs, cyclesByCharge);
    if (cycles > 0) {
      const mult = skillExpMultiplier(state, act.skillId);
      const gainXp = Math.max(1, Math.round(action.xp * mult));
      for (let i = 0; i < cycles; i++) {
        if (action.inputs) for (const inp of action.inputs) removeItem(state, inp.itemId, inp.qty);
        if (action.itemId) addItem(state, action.itemId, 1);
        addSkillXp(state, act.skillId, gainXp);
        if (skill.stat) addStatXp(state, skill.stat, action.statXp);
        if (skill.stat2) addStatXp(state, skill.stat2, action.statXp);
      }
      // Linh Thạch: cộng phần EXP% — TÍCH LŨY phân số qua các lần advance rồi flush phần
      // nguyên. Tránh mất buff do làm tròn khi EXP nhỏ (foreground mỗi lần chỉ 1 vòng:
      // +10% của 4 = 0.4 → round = 0). Acc nằm trên activity nên bền qua reload/offline.
      let buffXp = 0;
      if (act.buff && act.buff.expPct) {
        act.buffXpAcc = (act.buffXpAcc || 0) + action.xp * mult * (act.buff.expPct / 100) * cycles;
        buffXp = Math.floor(act.buffXpAcc);
        if (buffXp > 0) { addSkillXp(state, act.skillId, buffXp); act.buffXpAcc -= buffXp; }
      }
      const sk = state.skills[act.skillId];
      if (sk) { sk.gathered = (sk.gathered || 0) + cycles; sk.timeMs = (sk.timeMs || 0) + cycles * act.cycleMs; }
      if (action.itemId) state.counters.produced[action.itemId] = (state.counters.produced[action.itemId] || 0) + cycles;
      act.sessionCount += cycles;
      act.lastResolved += cycles * act.cycleMs;
      report = { cycles, itemId: action.itemId, xp: cycles * gainXp + buffXp };
    }
    if (action.needsDoPho && cycles > 0 && state.player && state.player.doPho) { // trừ lượt Đồ Phổ đã dùng
      state.player.doPho[action.itemId] = Math.max(0, (state.player.doPho[action.itemId] || 0) - cycles);
      if (state.player.doPho[action.itemId] <= 0) delete state.player.doPho[action.itemId];
    }
    ranOut = ((cyclesByInputs !== Infinity) && (cyclesByInputs < cyclesByTime)) || ((cyclesByCharge !== Infinity) && (cyclesByCharge < cyclesByTime));
  }

  if (ranOut) {
    act.stalled = true;
    act.lastResolved = now;
  } else {
    act.stalled = false;
    if (cappedByTime && (act.lastResolved - act.startedAt) >= cap) act.capped = true;
  }

  if (act.stalled) act.progress = 0;
  else if (act.capped && (act.lastResolved - act.startedAt) >= cap) act.progress = 1;
  else act.progress = Math.min(1, (now - act.lastResolved) / act.cycleMs);

  return report;
}
