// ============================================================
// ENGINE — Công thức cấp độ (THUẦN, không phụ thuộc UI)
// Chạy y nguyên được trên server sau này (online-ready).
// ============================================================
export const MAX_LEVEL = 100;
/**
 * Trần cấp CAO NHẤT một kỹ năng có thể chạm tới: 100 + 10 mỗi lần Trùng Sinh, sáu lần là 160.
 * ⚠ KHÔNG phải chạy lại bộ sinh trần chống gian lận vì con số này. Trần mỗi lần ghi tính theo
 *   TỐC ĐỘ cày (xp mỗi giây × thời gian trôi), mà nâng trần cấp không làm ai cày nhanh hơn —
 *   nó chỉ kéo dài quãng đường. Giữ trần cũ là chặt hơn, và người chơi thật vẫn không chạm tới.
 */
export const MAX_LEVEL_TRAN = 160;

// EXP cần để đi từ `level` lên `level+1`.
// Nền 55×N² + "thuế tám cấp cuối" của vòng, neo cấp áp chót lên trần 100 = đúng 1.200.000.
// Tổng Lv1->100 ≈ 20,17 triệu. Dùng CHUNG: Chiến Đấu + 10 nghề (nhân vật) + Linh Thú (pets.js tái dùng).
//
// ⚠⚠ THUẾ NEO THEO TRẦN CỦA VÒNG, không neo theo cấp tuyệt đối. Trùng Sinh nâng trần thêm 10 cấp,
//   nên mỗi vòng phải có đoạn dốc riêng giống hệt đoạn 92–100 của vòng đầu. Neo theo cấp tuyệt đối
//   thì đuôi bậc hai chạy tiếp: cấp 159 lên 160 cần 49,1 triệu — gấp 41 lần cấp 99 lên 100, tức
//   6,4 năm cày liên tục cho MỘT nghề.
// ⚠ `tran` mặc định 100 nên mọi chỗ gọi cũ ra ĐÚNG từng con số như trước. Đã đối chiếu cả 99 cấp.
export function xpForLevel(level, tran) {
  const T = (typeof tran === 'number' && tran >= 10) ? tran : MAX_LEVEL;
  const tail = level >= T - 8 ? 660945 * Math.pow((level - (T - 9)) / 8, 2) : 0;
  return Math.round(55 * level * level + tail);
}

// Từ tổng EXP -> { level, into, need, frac }
export function xpProgress(totalXp, tran) {
  const T = (typeof tran === 'number' && tran >= 10) ? tran : MAX_LEVEL;
  let level = 1, rem = Math.max(0, totalXp | 0);
  while (level < T && rem >= xpForLevel(level, T)) {
    rem -= xpForLevel(level, T);
    level++;
  }
  const need = xpForLevel(level, T);
  return { level, into: rem, need, frac: Math.min(1, rem / need), tran: T };
}

export function levelFromXp(totalXp, tran) {
  return xpProgress(totalXp, tran).level;
}

/** Tổng EXP để đi từ cấp 1 lên đúng `tran`. Dùng cho bộ sinh trần chống gian lận và Cẩm Nang. */
export function xpTronDuong(tran) {
  const T = (typeof tran === 'number' && tran >= 10) ? tran : MAX_LEVEL;
  let s = 0;
  for (let i = 1; i < T; i++) s += xpForLevel(i, T);
  return s;
}

/**
 * He so kinh nghiem TOAN MAY CHU (Lenh Bai dot 5, bang `he_so_may_chu`).
 * Client dem so nay vao `state.heSo.exp` moi nhip doc; mat mang thi giu nguyen so cu.
 * ⚠⚠ NHAN O DAY, khong nhan o tung cho goi. Moi duong cong xp deu di qua `addSkillXp`
 *   (activity.js treo may · awardKill · dungeon.js · worldboss.js). Nhan rai rac la chac chan
 *   sot mot duong, va duong sot do se lech voi tran chong gian lan phia may chu.
 * ⚠ Chot phia may chu cung nhan dung he so nay vao tran (xem docs/SQL_CHONG_GIAN_LAN.sql).
 *   Doi mot ben ma quen ben kia la ca lang bi ghi so oan.
 */
export function heSoExp(state) {
  const h = state && state.heSo && state.heSo.exp;
  return (typeof h === 'number' && isFinite(h) && h > 0) ? h : 1;
}

export function addSkillXp(state, skillId, xp) {
  if (!state.skills[skillId]) state.skills[skillId] = { xp: 0 };
  state.skills[skillId].xp += Math.round(xp * heSoExp(state));   // he so co the le (1,5) — dung de xp thanh so le
}
export function addStatXp(state, statId, xp) {
  if (!state.stats[statId]) state.stats[statId] = { xp: 0 };
  state.stats[statId].xp += xp;
}
