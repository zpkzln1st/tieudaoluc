// ============================================================
// ENGINE — LUẬN VÕ (core DÙNG CHUNG: Tông Môn đệ tử + Danh Sĩ). THUẦN, KHÔNG import combat/gear/stats.
// Trận tỉ thí deterministic: Chiến Lực + ngũ hành khắc + jitter h32. Kết quả SIDE-ONLY (KHÔNG sinh power về main).
// ============================================================

// h32 deterministic (FNV-1a) — cùng seed -> cùng kết quả (để Danh Sĩ tỉ thí theo time-slot tái lập được).
export function h32(s) { let h = 2166136261 >>> 0; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// Ngũ hành tương khắc (X khắc KHAC[X]) — mirror votong.js KHAC + data/tongmon HE (chu trình cố định, khỏi import combat).
const KHAC = { kim: 'moc', moc: 'tho', tho: 'thuy', thuy: 'hoa', hoa: 'kim' };
export function heFactor(aHe, bHe) { if (KHAC[aHe] === bHe) return 1; if (KHAC[bHe] === aHe) return -1; return 0; }   // +1: a khắc b · −1: b khắc a

// Tương khắc LOẠI võ học: 8 loại bí kíp -> 3 nhóm (Nội = trung tính). RPS: Trường khắc Nhanh, Nhanh khắc Cương, Cương khắc Trường.
export const LOAI_CAT = { dao: 'cuong', quyen: 'cuong', kiem: 'truong', chi: 'truong', than: 'nhanh', khinh: 'nhanh', am: 'nhanh', noi: '' };
export const CAT_NAME = { cuong: 'Cương Mãnh', truong: 'Trường Kích', nhanh: 'Thân Pháp Nhanh' };
const CAT_KHAC = { truong: 'nhanh', nhanh: 'cuong', cuong: 'truong' };   // X khắc CAT_KHAC[X]
export function loaiCatFactor(aCat, bCat) { if (!aCat || !bCat) return 0; if (CAT_KHAC[aCat] === bCat) return 1; if (CAT_KHAC[bCat] === aCat) return -1; return 0; }   // +1: a khắc b · −1: b khắc a

// luanVo(a,b,seed): a,b = { name, chienLuc, he }. Deterministic theo seed. Trả người thắng + mức chênh (margin 0..1).
export function luanVo(a, b, seed) {
  const s = h32((seed != null ? seed : '') + '|' + (a.name || 'a') + '|' + (b.name || 'b'));
  const jA = 0.82 + ((s & 0xffff) / 0xffff) * 0.36;             // jitter 0.82..1.18
  const jB = 0.82 + (((s >>> 16) & 0xffff) / 0xffff) * 0.36;
  const hf = heFactor(a.he, b.he);
  const lf = loaiCatFactor(a.loaiCat, b.loaiCat);              // tương khắc loại võ học (+10%)
  const aScore = Math.max(1, a.chienLuc || 1) * jA * (1 + (hf > 0 ? 0.15 : 0) + (lf > 0 ? 0.10 : 0));
  const bScore = Math.max(1, b.chienLuc || 1) * jB * (1 + (hf < 0 ? 0.15 : 0) + (lf < 0 ? 0.10 : 0));
  const aWin = aScore >= bScore;
  const hi = Math.max(aScore, bScore), lo = Math.min(aScore, bScore);
  const margin = hi > 0 ? (hi - lo) / hi : 0;                   // 0..1 (độ áp đảo)
  return { winner: aWin ? 'a' : 'b', winnerName: aWin ? (a.name || '') : (b.name || ''), loserName: aWin ? (b.name || '') : (a.name || ''), margin, aScore: Math.round(aScore), bScore: Math.round(bScore), heFactor: hf, loaiFactor: lf };
}

// nhãn mức độ thắng
export function luanVoMarginLabel(m) { return m >= 0.4 ? 'đại thắng' : (m >= 0.18 ? 'thắng thuyết phục' : (m >= 0.05 ? 'thắng sát nút' : 'thắng trong gang tấc')); }

// ---- luanVoCycle: diễn lại trận tỉ thí theo TỪNG HIỆP (HP + chiến báo) — deterministic, cùng người thắng với luanVo. Margin lớn -> ít hiệp áp đảo; sát nút -> nhiều hiệp giằng co. ----
const LV_MOVES = ['vung một chiêu sấm sét', 'lách người tạt ngang một kiếm', 'dồn kình lực phá thế thủ', 'xuất một thức hiểm hóc', 'liên hoàn ba chiêu như vũ bão', 'thi triển tuyệt kĩ áp trận', 'một quyền nặng tựa thiên cân', 'thân pháp ảo diệu vây công'];
const LV_DEFEND = ['chống đỡ chật vật', 'lảo đảo lùi nửa bước', 'gắng gượng hóa giải', 'trúng đòn loạng choạng', 'né được trong gang tấc', 'đỡ mà hổ khẩu tê dại'];
// chieuPool (tùy chọn, do caller build từ bí kíp đã lĩnh ngộ): [{ ten, lines[] }]. Có thì đấu sĩ "thi triển 〈bí kíp〉" + dùng câu chiến báo riêng; không thì rơi về LV_MOVES.
export function luanVoCycle(a, b, seed) {
  const base = luanVo(a, b, seed);
  const aWin = base.winner === 'a', hf = base.heFactor, lf = base.loaiFactor || 0;
  const aPool = Array.isArray(a.chieuPool) ? a.chieuPool : [], bPool = Array.isArray(b.chieuPool) ? b.chieuPool : [];
  const rounds = base.margin >= 0.4 ? 4 : (base.margin >= 0.18 ? 5 : 6);
  let aHp = 100, bHp = 100;
  const log = [];
  for (let r = 0; r < rounds; r++) {
    const s = h32(seed + ':rd' + r), last = r === rounds - 1;
    const wDmg = last ? 999 : (8 + (s % 12) + Math.round(base.margin * 12));   // người thắng đánh nặng
    const lDmg = last ? 0 : (3 + ((s >>> 8) % 7));                              // kẻ thua gỡ gạc
    if (aWin) { bHp = Math.max(0, bHp - wDmg); aHp = Math.max(12, aHp - lDmg); }
    else { aHp = Math.max(0, aHp - wDmg); bHp = Math.max(12, bHp - lDmg); }
    const atk = aWin ? (a.name || '') : (b.name || ''), def = aWin ? (b.name || '') : (a.name || '');
    const atkPool = aWin ? aPool : bPool, defPool = aWin ? bPool : aPool;
    // người tấn công thi triển bí kíp (nếu có): tên + câu chiêu riêng. Ghi id để UI sáng đúng ô skill.
    let atkTag = '', atkSkillId = '', mv;
    if (atkPool.length) { const bk = atkPool[(s >>> 20) % atkPool.length]; atkTag = bk.ten || ''; atkSkillId = bk.id || ''; const ls = (bk.lines && bk.lines.length) ? bk.lines : LV_MOVES; mv = ls[(s >>> 16) % ls.length]; }
    else mv = LV_MOVES[(s >>> 16) % LV_MOVES.length];
    const df = LV_DEFEND[(s >>> 4) % LV_DEFEND.length];
    let defTag = '', defSkillId = '';
    if (defPool.length) { const bkd = defPool[(s >>> 12) % defPool.length]; defTag = bkd.ten || ''; defSkillId = bkd.id || ''; }   // người thủ vận bí kíp chống đỡ
    const atkPhrase = atkTag ? `${atk} thi triển 〈${atkTag}〉, ${mv}` : `${atk} ${mv}`;
    const defPhrase = defTag ? `${def} vận 〈${defTag}〉 ${df}` : `${def} ${df}`;
    let line = `Hiệp ${r + 1}: ${atkPhrase}; ${defPhrase}.`;
    if (r === 1 && hf !== 0) line = `Hiệp ${r + 1}: ngũ hành tương khắc phát uy — ${atkPhrase}; ${defPhrase}.`;
    else if (r === 2 && lf !== 0) line = `Hiệp ${r + 1}: võ học khắc chế lẫn nhau — ${atkPhrase}; ${defPhrase}.`;
    if (last) line = atkTag
      ? `Hiệp ${r + 1}: ${atk} dốc toàn lực thi triển 〈${atkTag}〉 định thắng bại — ${def}${defTag ? ` dẫu vận 〈${defTag}〉 vẫn` : ''} gục xuống nhận thua.`
      : `Hiệp ${r + 1}: ${atk} dốc toàn lực một chiêu định thắng bại — ${def} gục xuống nhận thua.`;
    log.push({ aHp, bHp, line, atkIsA: aWin, atkSkillId, defSkillId });
    if (aHp <= 0 || bHp <= 0) break;
  }
  return Object.assign({}, base, { marginLabel: luanVoMarginLabel(base.margin), rounds: log, aName: a.name || '', bName: b.name || '' });
}
