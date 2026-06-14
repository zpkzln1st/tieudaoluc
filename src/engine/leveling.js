// ============================================================
// ENGINE — Công thức cấp độ (THUẦN, không phụ thuộc UI)
// Chạy y nguyên được trên server sau này (online-ready).
// ============================================================
export const MAX_LEVEL = 100;

// EXP cần để đi từ `level` lên `level+1`
export function xpForLevel(level) {
  return Math.floor(50 * Math.pow(level, 1.6)) + 50 * level;
}

// Từ tổng EXP -> { level, into, need, frac }
export function xpProgress(totalXp) {
  let level = 1, rem = Math.max(0, totalXp | 0);
  while (level < MAX_LEVEL && rem >= xpForLevel(level)) {
    rem -= xpForLevel(level);
    level++;
  }
  const need = xpForLevel(level);
  return { level, into: rem, need, frac: Math.min(1, rem / need) };
}

export function levelFromXp(totalXp) {
  return xpProgress(totalXp).level;
}

export function addSkillXp(state, skillId, xp) {
  if (!state.skills[skillId]) state.skills[skillId] = { xp: 0 };
  state.skills[skillId].xp += xp;
}
export function addStatXp(state, statId, xp) {
  if (!state.stats[statId]) state.stats[statId] = { xp: 0 };
  state.stats[statId].xp += xp;
}
