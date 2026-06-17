// ============================================================
// ENGINE — Công thức cấp độ (THUẦN, không phụ thuộc UI)
// Chạy y nguyên được trên server sau này (online-ready).
// ============================================================
export const MAX_LEVEL = 100;

// EXP cần để đi từ `level` lên `level+1`.
// Cong dồn cuối (nền 55×N²) + "thuế đoạn cuối" cho cấp ≥92, neo 99->100 = đúng 1.200.000.
// Tổng Lv1->100 ≈ 20,17 triệu. Dùng CHUNG: Chiến Đấu + 9 nghề (nhân vật) + Linh Thú (pets.js tái dùng).
export function xpForLevel(level) {
  const tail = level >= 92 ? 660945 * Math.pow((level - 91) / 8, 2) : 0;
  return Math.round(55 * level * level + tail);
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
