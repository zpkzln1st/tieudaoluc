// ============================================================
// ENGINE — LUẬN VÕ (core DÙNG CHUNG: Tông Môn đệ tử + Danh Sĩ). THUẦN, KHÔNG import combat/gear/stats.
// Trận tỉ thí deterministic: Chiến Lực + ngũ hành khắc + jitter h32. Kết quả SIDE-ONLY (KHÔNG sinh power về main).
// ============================================================

// h32 deterministic (FNV-1a) — cùng seed -> cùng kết quả (để Danh Sĩ tỉ thí theo time-slot tái lập được).
export function h32(s) { let h = 2166136261 >>> 0; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// Ngũ hành tương khắc (X khắc KHAC[X]) — mirror votong.js KHAC + data/tongmon HE (chu trình cố định, khỏi import combat).
const KHAC = { kim: 'moc', moc: 'tho', tho: 'thuy', thuy: 'hoa', hoa: 'kim' };
export function heFactor(aHe, bHe) { if (KHAC[aHe] === bHe) return 1; if (KHAC[bHe] === aHe) return -1; return 0; }   // +1: a khắc b · −1: b khắc a

// luanVo(a,b,seed): a,b = { name, chienLuc, he }. Deterministic theo seed. Trả người thắng + mức chênh (margin 0..1).
export function luanVo(a, b, seed) {
  const s = h32((seed != null ? seed : '') + '|' + (a.name || 'a') + '|' + (b.name || 'b'));
  const jA = 0.82 + ((s & 0xffff) / 0xffff) * 0.36;             // jitter 0.82..1.18
  const jB = 0.82 + (((s >>> 16) & 0xffff) / 0xffff) * 0.36;
  const hf = heFactor(a.he, b.he);
  const aScore = Math.max(1, a.chienLuc || 1) * jA * (1 + (hf > 0 ? 0.15 : 0));
  const bScore = Math.max(1, b.chienLuc || 1) * jB * (1 + (hf < 0 ? 0.15 : 0));
  const aWin = aScore >= bScore;
  const hi = Math.max(aScore, bScore), lo = Math.min(aScore, bScore);
  const margin = hi > 0 ? (hi - lo) / hi : 0;                   // 0..1 (độ áp đảo)
  return { winner: aWin ? 'a' : 'b', winnerName: aWin ? (a.name || '') : (b.name || ''), loserName: aWin ? (b.name || '') : (a.name || ''), margin, aScore: Math.round(aScore), bScore: Math.round(bScore), heFactor: hf };
}

// nhãn mức độ thắng
export function luanVoMarginLabel(m) { return m >= 0.4 ? 'đại thắng' : (m >= 0.18 ? 'thắng thuyết phục' : (m >= 0.05 ? 'thắng sát nút' : 'thắng trong gang tấc')); }
