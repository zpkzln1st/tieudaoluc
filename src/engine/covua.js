// ============================================================
//  CỜ VUA (Chess) — ENGINE LUẬT + AI. THUẦN JS: không DOM, không import.
//  Khuôn mẫu tổ chức lấy từ src/engine/cotuong.js (luật ở ngoài, AI trong closure _AI).
//
//  b[r][c] : r = 0..7 (r0 = hàng 1, hàng đáy của TRẮNG), c = 0..7 (c0 = cột a)
//  ô trống = null ; quân = { t, w }   t ∈ 'K','Q','R','B','N','P' · w=true là TRẮNG
//  Position = { b, w, cr, ep, half, full }
//     cr   : bitmask nhập thành  1=trắng O-O · 2=trắng O-O-O · 4=đen O-O · 8=đen O-O-O
//     ep   : Ô ĐÍCH bắt tốt qua đường {c,r} hoặc null
//  Move = { fc, fr, tc, tr, p }   p = 'Q'|'R'|'B'|'N' khi phong cấp (ngoài ra để undefined)
//  Nhập thành = nước đi CỦA VUA 2 ô (e1->g1), không có cờ riêng.
//
//  BẢN B — ưu tiên HIỆU NĂNG:
//   · bảng tra hướng dựng sẵn: RAYS[ô][hướng], KN_TG[ô], KG_TG[ô] (không tính lại trong vòng lặp)
//   · sinh nước ĂN riêng khỏi nước yên -> quiescence khỏi lọc lại
//   · cache ô vua trong Position (_kw/_kb) nhưng KIỂM CHỨNG trước khi dùng,
//     nên vẫn nuốt được Position do engine khác tạo ra
//   · lọc nước hợp lệ bằng thử-hoàn KHÔNG cấp phát object (tryOk)
// ============================================================

/* ============================================================
   0. HẰNG SỐ + BẢNG TRA DỰNG SẴN
   ============================================================ */

// 8 hướng [dc, dr]: 0..3 là thẳng (xe), 4..7 là chéo (tượng). Thứ tự này được
// dùng làm lát cắt trong genSlide/isAttacked nên KHÔNG được đổi.
const DIRS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [-1, 1], [1, -1], [-1, -1]
];

const KNIGHT_OFF = [
  [1, 2], [2, 1], [2, -1], [1, -2],
  [-1, -2], [-2, -1], [-2, 1], [-1, 2]
];

const FILES = 'abcdefgh';
const BACK = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];

// Quân cờ dùng chung (singleton) — engine KHÔNG BAO GIỜ sửa thuộc tính quân,
// nên chia sẻ object là an toàn và làm clonePos chỉ còn là slice từng hàng.
const PIECE = {
  K: [{ t: 'K', w: true }, { t: 'K', w: false }],
  Q: [{ t: 'Q', w: true }, { t: 'Q', w: false }],
  R: [{ t: 'R', w: true }, { t: 'R', w: false }],
  B: [{ t: 'B', w: true }, { t: 'B', w: false }],
  N: [{ t: 'N', w: true }, { t: 'N', w: false }],
  P: [{ t: 'P', w: true }, { t: 'P', w: false }]
};
function pc(t, white) { return PIECE[t][white ? 0 : 1]; }

// Danh sách ô đích của mã / vua cho từng ô — tính 1 lần lúc nạp module.
const KN_TG = new Array(64);
const KG_TG = new Array(64);
// RAYS[ô][hướng] = Int8Array các ô trên tia, xa dần. Nhờ nó vòng quét quân trượt
// không phải kiểm biên từng bước nữa.
const RAYS = new Array(64);
(function buildTables() {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = r * 8 + c;
      const kn = [];
      for (let i = 0; i < 8; i++) {
        const tc = c + KNIGHT_OFF[i][0], tr = r + KNIGHT_OFF[i][1];
        if (tc >= 0 && tc < 8 && tr >= 0 && tr < 8) kn.push(tr * 8 + tc);
      }
      KN_TG[sq] = Int8Array.from(kn);

      const kg = [];
      for (let i = 0; i < 8; i++) {
        const tc = c + DIRS[i][0], tr = r + DIRS[i][1];
        if (tc >= 0 && tc < 8 && tr >= 0 && tr < 8) kg.push(tr * 8 + tc);
      }
      KG_TG[sq] = Int8Array.from(kg);

      const rays = new Array(8);
      for (let d = 0; d < 8; d++) {
        const dc = DIRS[d][0], dr = DIRS[d][1];
        const list = [];
        let cc = c + dc, rr = r + dr;
        while (cc >= 0 && cc < 8 && rr >= 0 && rr < 8) {
          list.push(rr * 8 + cc);
          cc += dc; rr += dr;
        }
        rays[d] = Int8Array.from(list);
      }
      RAYS[sq] = rays;
    }
  }
})();

// Mặt nạ quyền nhập thành: cr &= CR_MASK[ô đi] & CR_MASK[ô đến].
// Gộp cả 3 việc (vua đi, xe đi, xe BỊ ĂN tại góc) vào một phép AND.
const CR_MASK = new Int32Array(64).fill(15);
CR_MASK[4] = 12;   // e1: trắng mất cả hai quyền
CR_MASK[0] = 13;   // a1: mất O-O-O trắng
CR_MASK[7] = 14;   // h1: mất O-O trắng
CR_MASK[60] = 3;   // e8
CR_MASK[56] = 7;   // a8
CR_MASK[63] = 11;  // h8

/* ============================================================
   1. THẾ CỜ: khởi tạo · sao chép · FEN · khoá thế cờ
   ============================================================ */

function emptyBoard() {
  const b = new Array(8);
  for (let r = 0; r < 8; r++) {
    const row = new Array(8);
    for (let c = 0; c < 8; c++) row[c] = null;
    b[r] = row;
  }
  return b;
}

/** Thế khai cuộc chuẩn. */
export function initPos() {
  const b = emptyBoard();
  for (let c = 0; c < 8; c++) {
    b[0][c] = pc(BACK[c], true);
    b[1][c] = pc('P', true);
    b[6][c] = pc('P', false);
    b[7][c] = pc(BACK[c], false);
  }
  return { b: b, w: true, cr: 15, ep: null, half: 0, full: 1, _kw: 4, _kb: 60 };
}

/** Bản sao ĐỘC LẬP: sửa bản sao không đụng bản gốc. */
export function clonePos(pos) {
  const b = new Array(8);
  for (let r = 0; r < 8; r++) b[r] = pos.b[r].slice();
  return {
    b: b,
    w: pos.w,
    cr: pos.cr,
    ep: pos.ep ? { c: pos.ep.c, r: pos.ep.r } : null,
    half: pos.half,
    full: pos.full,
    _kw: pos._kw,
    _kb: pos._kb
  };
}

/**
 * Bỏ quyền nhập thành "ma": FEN bên ngoài có thể ghi KQkq trong khi vua/xe đã rời chỗ.
 * Dọn ngay lúc nạp để genCastle khỏi phải phòng thủ và để toFEN/posKey ổn định.
 */
function sanitizeCR(pos) {
  const b = pos.b;
  let cr = pos.cr & 15;
  const wk = b[0][4], bk = b[7][4];
  if (!wk || wk.t !== 'K' || !wk.w) cr &= ~3;
  if (!bk || bk.t !== 'K' || bk.w) cr &= ~12;
  const h1 = b[0][7], a1 = b[0][0], h8 = b[7][7], a8 = b[7][0];
  if (!h1 || h1.t !== 'R' || !h1.w) cr &= ~1;
  if (!a1 || a1.t !== 'R' || !a1.w) cr &= ~2;
  if (!h8 || h8.t !== 'R' || h8.w) cr &= ~4;
  if (!a8 || a8.t !== 'R' || a8.w) cr &= ~8;
  pos.cr = cr;
}

/** Chuỗi bố trí quân theo lối FEN (hàng 8 trước). Dùng chung cho toFEN và posKey. */
function placement(b) {
  let s = '';
  for (let r = 7; r >= 0; r--) {
    let gap = 0;
    const row = b[r];
    for (let c = 0; c < 8; c++) {
      const p = row[c];
      if (!p) { gap++; continue; }
      if (gap) { s += gap; gap = 0; }
      s += p.w ? p.t : p.t.toLowerCase();
    }
    if (gap) s += gap;
    if (r > 0) s += '/';
  }
  return s;
}

function crText(cr) {
  if (!cr) return '-';
  let s = '';
  if (cr & 1) s += 'K';
  if (cr & 2) s += 'Q';
  if (cr & 4) s += 'k';
  if (cr & 8) s += 'q';
  return s;
}

function sqText(ep) { return ep ? (FILES[ep.c] + (ep.r + 1)) : '-'; }

/** Position -> chuỗi FEN đầy đủ 6 trường. */
export function toFEN(pos) {
  return placement(pos.b) + ' ' + (pos.w ? 'w' : 'b') + ' ' + crText(pos.cr)
    + ' ' + sqText(pos.ep) + ' ' + pos.half + ' ' + pos.full;
}

/**
 * FEN -> Position, hoặc null nếu chuỗi hỏng.
 * Chịu được FEN thiếu 2 trường cuối (nhiều bộ thế cờ chỉ ghi 4 trường).
 */
export function fromFEN(fen) {
  if (typeof fen !== 'string') return null;
  const parts = fen.trim().split(/\s+/);
  if (parts.length < 1 || !parts[0]) return null;
  const rows = parts[0].split('/');
  if (rows.length !== 8) return null;

  const b = emptyBoard();
  for (let i = 0; i < 8; i++) {
    const r = 7 - i;                 // dòng đầu của FEN là hàng 8 = r7
    const s = rows[i];
    let c = 0;
    for (let k = 0; k < s.length; k++) {
      const ch = s.charAt(k);
      if (ch >= '1' && ch <= '8') { c += ch.charCodeAt(0) - 48; continue; }
      const up = ch.toUpperCase();
      if ('KQRBNP'.indexOf(up) < 0) return null;
      if (c > 7) return null;
      // TỐT KHÔNG THỂ ĐỨNG Ở HÀNG 1 / HÀNG 8 (đã phong cấp rồi). Nhận bừa thì genPawn
      // tính nr = r ± 1 vọt ra ngoài bảng và đọc b[8] = undefined -> vỡ ván.
      if (up === 'P' && (r === 0 || r === 7)) return null;
      b[r][c] = pc(up, ch === up);
      c++;
    }
    if (c !== 8) return null;
  }

  const side = parts[1] ? parts[1].charAt(0).toLowerCase() : 'w';
  if (side !== 'w' && side !== 'b') return null;

  const cs = parts[2] || '-';
  let cr = 0;
  if (cs.indexOf('K') >= 0) cr |= 1;
  if (cs.indexOf('Q') >= 0) cr |= 2;
  if (cs.indexOf('k') >= 0) cr |= 4;
  if (cs.indexOf('q') >= 0) cr |= 8;

  let ep = null;
  const es = parts[3] || '-';
  if (es !== '-' && es.length >= 2) {
    const c = es.charCodeAt(0) - 97, r = es.charCodeAt(1) - 49;
    if (c >= 0 && c < 8 && r >= 0 && r < 8) ep = { c: c, r: r };
  }

  let half = 0, full = 1;
  if (parts.length > 4) { const v = parseInt(parts[4], 10); if (isFinite(v) && v >= 0) half = v; }
  if (parts.length > 5) { const v = parseInt(parts[5], 10); if (isFinite(v) && v >= 1) full = v; }

  const pos = { b: b, w: side === 'w', cr: cr, ep: ep, half: half, full: full, _kw: -1, _kb: -1 };
  sanitizeCR(pos);
  const kw = findKing(b, true), kb = findKing(b, false);
  pos._kw = kw ? kw.r * 8 + kw.c : -1;
  pos._kb = kb ? kb.r * 8 + kb.c : -1;
  return pos;
}

/**
 * Ô qua đường có THẬT SỰ ăn được không.
 * Luật FIDE hiện hành: hai thế cờ chỉ khác nhau ở ô qua đường mà KHÔNG bên nào ăn được
 * thì vẫn là MỘT thế — ghi vô điều kiện (lối FEN cũ) sẽ làm đếm lặp nước bỏ sót,
 * ván thua bị kéo dài thay vì được xử hoà. Chỉ gọi khi pos.ep khác null nên rất rẻ.
 */
function epUsable(pos) {
  if (!pos.ep) return false;
  const ms = legalMoves(pos);
  for (let i = 0; i < ms.length; i++) {
    const m = ms[i];
    if (m.tc === pos.ep.c && m.tr === pos.ep.r && pos.b[m.fr][m.fc] && pos.b[m.fr][m.fc].t === 'P') return true;
  }
  return false;
}

/**
 * Khoá thế cờ để đếm lặp nước: bố trí + lượt + quyền nhập thành + ô qua đường.
 * KHÔNG gồm half/full — hai số đó không làm thế cờ khác đi.
 */
export function posKey(pos) {
  return placement(pos.b) + ' ' + (pos.w ? 'w' : 'b') + ' ' + crText(pos.cr)
    + ' ' + (epUsable(pos) ? sqText(pos.ep) : '-');
}

/* ============================================================
   2. SINH NƯỚC GIẢ-HỢP-LỆ
   ============================================================ */

function addProm(out, fc, fr, tc, tr, caps) {
  out.push({ fc: fc, fr: fr, tc: tc, tr: tr, p: 'Q' });
  // Ở chế độ "chỉ nước ăn" (quiescence) chỉ lấy hậu: phong xe/tượng/mã gần như
  // không bao giờ đổi kết quả chiến thuật mà lại nhân ba số nhánh.
  if (caps) return;
  out.push({ fc: fc, fr: fr, tc: tc, tr: tr, p: 'R' });
  out.push({ fc: fc, fr: fr, tc: tc, tr: tr, p: 'B' });
  out.push({ fc: fc, fr: fr, tc: tc, tr: tr, p: 'N' });
}

function genPawn(b, c, r, white, ep, out, caps) {
  const dir = white ? 1 : -1;
  const nr = r + dir;                 // tốt không bao giờ đứng ở hàng cuối nên nr luôn trong bàn
  const last = white ? 7 : 0;

  if (!b[nr][c]) {
    if (nr === last) {
      addProm(out, c, r, c, nr, caps);
    } else if (!caps) {
      out.push({ fc: c, fr: r, tc: c, tr: nr });
      const start = white ? 1 : 6;
      if (r === start) {
        const r2 = r + dir * 2;
        if (!b[r2][c]) out.push({ fc: c, fr: r, tc: c, tr: r2 });
      }
    }
  }

  for (let k = -1; k <= 1; k += 2) {
    const tc = c + k;
    if (tc < 0 || tc > 7) continue;
    const q = b[nr][tc];
    if (q) {
      if (q.w === white) continue;
      if (nr === last) addProm(out, c, r, tc, nr, caps);
      else out.push({ fc: c, fr: r, tc: tc, tr: nr });
    } else if (ep && ep.r === nr && ep.c === tc) {
      // Bắt tốt qua đường. PHẢI soi lại quân bị ăn nằm ở [r][tc] có ĐÚNG là tốt địch không:
      // nếu chỉ tin vào pos.ep thì một FEN bậy (save bị sửa tay) sẽ khiến ta ăn quân NHÀ,
      // hoặc thả tốt xuống hàng 1/8 mà không phong cấp rồi vỡ ở lượt sau.
      const vic = b[r][tc];
      if (vic && vic.w !== white && vic.t === 'P') out.push({ fc: c, fr: r, tc: tc, tr: nr });
    }
  }
}

function genJump(b, sq, white, tg, out, caps) {
  const fc = sq & 7, fr = sq >> 3;
  for (let i = 0; i < tg.length; i++) {
    const t = tg[i], tr = t >> 3, tc = t & 7;
    const q = b[tr][tc];
    if (q) { if (q.w === white) continue; }
    else if (caps) continue;
    out.push({ fc: fc, fr: fr, tc: tc, tr: tr });
  }
}

function genSlide(b, sq, white, d0, d1, out, caps) {
  const fc = sq & 7, fr = sq >> 3;
  const rays = RAYS[sq];
  for (let d = d0; d < d1; d++) {
    const ray = rays[d];
    for (let i = 0; i < ray.length; i++) {
      const t = ray[i], tr = t >> 3, tc = t & 7;
      const q = b[tr][tc];
      if (!q) { if (!caps) out.push({ fc: fc, fr: fr, tc: tc, tr: tr }); continue; }
      if (q.w !== white) out.push({ fc: fc, fr: fr, tc: tc, tr: tr });
      break;
    }
  }
}

/**
 * Nhập thành. Kiểm luôn "vua không bị chiếu / ô đi qua / ô đến không bị tấn công"
 * ngay ở đây (chuẩn mực chung) — bộ lọc hợp lệ sau đó chỉ còn phải lo ô đến.
 * Nhớ b1/b8 (cột 1) cũng phải trống cho O-O-O.
 */
function genCastle(pos, b, c, r, white, out) {
  const home = white ? 0 : 7;
  if (r !== home || c !== 4) return;
  const row = b[home];
  const cr = pos.cr;
  const kBit = white ? 1 : 4, qBit = white ? 2 : 8;

  if ((cr & kBit) && !row[5] && !row[6]) {
    const rk = row[7];
    if (rk && rk.t === 'R' && rk.w === white
      && !isAttacked(b, 4, home, !white)
      && !isAttacked(b, 5, home, !white)
      && !isAttacked(b, 6, home, !white)) {
      out.push({ fc: 4, fr: home, tc: 6, tr: home });
    }
  }
  if ((cr & qBit) && !row[1] && !row[2] && !row[3]) {
    const rk = row[0];
    if (rk && rk.t === 'R' && rk.w === white
      && !isAttacked(b, 4, home, !white)
      && !isAttacked(b, 3, home, !white)
      && !isAttacked(b, 2, home, !white)) {
      out.push({ fc: 4, fr: home, tc: 2, tr: home });
    }
  }
}

/** caps=true: chỉ sinh nước ĂN + phong cấp (dành cho quiescence). */
function genAll(pos, out, caps) {
  const b = pos.b, w = pos.w, ep = pos.ep;
  for (let r = 0; r < 8; r++) {
    const row = b[r];
    for (let c = 0; c < 8; c++) {
      const p = row[c];
      if (!p || p.w !== w) continue;
      const sq = r * 8 + c;
      switch (p.t) {
        case 'P': genPawn(b, c, r, w, ep, out, caps); break;
        case 'N': genJump(b, sq, w, KN_TG[sq], out, caps); break;
        case 'B': genSlide(b, sq, w, 4, 8, out, caps); break;
        case 'R': genSlide(b, sq, w, 0, 4, out, caps); break;
        case 'Q': genSlide(b, sq, w, 0, 8, out, caps); break;
        case 'K':
          genJump(b, sq, w, KG_TG[sq], out, caps);
          if (!caps) genCastle(pos, b, c, r, w, out);
          break;
        default: break;
      }
    }
  }
  return out;
}

/** Toàn bộ nước giả-hợp-lệ của bên tới lượt (chưa lọc tự chiếu). */
export function genPseudo(pos) {
  return genAll(pos, [], false);
}

/* ============================================================
   3. ĐI / HOÀN NƯỚC (đối xứng tuyệt đối)
   ============================================================ */

function setKing(pos, white, c, r) {
  if (white) pos._kw = r * 8 + c; else pos._kb = r * 8 + c;
}

/**
 * Ô của vua bên `white`, dạng chỉ số 0..63 (hoặc -1).
 * Đọc cache trước NHƯNG kiểm chứng lại bằng đúng một lần truy cập mảng — nhờ vậy
 * Position do engine khác dựng (không có _kw/_kb) vẫn chạy đúng.
 */
function kingOf(pos, white) {
  const b = pos.b;
  const s = white ? pos._kw : pos._kb;
  if (s >= 0 && s < 64) {
    const p = b[s >> 3][s & 7];
    if (p && p.t === 'K' && p.w === white) return s;
  }
  for (let r = 0; r < 8; r++) {
    const row = b[r];
    for (let c = 0; c < 8; c++) {
      const q = row[c];
      if (q && q.t === 'K' && q.w === white) {
        const t = r * 8 + c;
        if (white) pos._kw = t; else pos._kb = t;
        return t;
      }
    }
  }
  if (white) pos._kw = -1; else pos._kb = -1;
  return -1;
}

/**
 * MUTATE pos (cả w, cr, ep, half, full). Trả về `undo` để hoàn nước.
 * undo giữ luôn quân đi + ô quân bị ăn: nhờ đó AI cập nhật khoá Zobrist được
 * mà không phải suy ngược từ bàn cờ.
 */
export function doMove(pos, mv) {
  const b = pos.b;
  const fc = mv.fc, fr = mv.fr, tc = mv.tc, tr = mv.tr;
  const p = b[fr][fc];
  const white = p.w;

  const undo = {
    p: p, cap: null, capC: -1, capR: -1,
    cr: pos.cr, ep: pos.ep, half: pos.half, full: pos.full,
    castle: 0
  };

  let cap = b[tr][tc];
  let capC = tc, capR = tr;
  // Tốt đi chéo vào ô trống thì chỉ có thể là bắt qua đường: quân bị ăn KHÔNG
  // nằm ở ô đến. Nhận diện bằng hình dạng nước đi (không tin vào pos.ep) cho chắc.
  if (!cap && p.t === 'P' && tc !== fc) {
    capR = fr; capC = tc;
    cap = b[capR][capC];
    b[capR][capC] = null;
  }
  undo.cap = cap; undo.capC = capC; undo.capR = capR;

  b[fr][fc] = null;
  b[tr][tc] = mv.p ? pc(mv.p, white) : p;

  if (p.t === 'K') {
    setKing(pos, white, tc, tr);
    const dx = tc - fc;
    if (dx === 2) { b[tr][5] = b[tr][7]; b[tr][7] = null; undo.castle = 1; }
    else if (dx === -2) { b[tr][3] = b[tr][0]; b[tr][0] = null; undo.castle = 2; }
  }

  pos.cr = pos.cr & CR_MASK[fr * 8 + fc] & CR_MASK[tr * 8 + tc];
  pos.ep = (p.t === 'P' && (tr - fr === 2 || tr - fr === -2))
    ? { c: fc, r: (fr + tr) >> 1 } : null;
  pos.half = (p.t === 'P' || cap) ? 0 : pos.half + 1;
  if (!white) pos.full++;
  pos.w = !white;

  return undo;
}

/** MUTATE pos trả về Y NGUYÊN trạng thái trước doMove. */
export function undoMove(pos, mv, undo) {
  const b = pos.b;
  const p = undo.p;
  b[mv.fr][mv.fc] = p;
  b[mv.tr][mv.tc] = null;
  if (undo.cap) b[undo.capR][undo.capC] = undo.cap;   // đặt SAU khi xoá ô đến (ăn thường trùng ô)

  if (undo.castle === 1) { b[mv.tr][7] = b[mv.tr][5]; b[mv.tr][5] = null; }
  else if (undo.castle === 2) { b[mv.tr][0] = b[mv.tr][3]; b[mv.tr][3] = null; }

  if (p.t === 'K') setKing(pos, p.w, mv.fc, mv.fr);

  pos.cr = undo.cr;
  pos.ep = undo.ep;
  pos.half = undo.half;
  pos.full = undo.full;
  pos.w = p.w;
}

/* ============================================================
   4. TẤN CÔNG / CHIẾU / LỌC NƯỚC HỢP LỆ
   ============================================================ */

/** Ô (c,r) có bị bên `byWhite` tấn công không. Quét NGƯỢC từ ô đích cho rẻ. */
export function isAttacked(b, c, r, byWhite) {
  const sq = r * 8 + c;

  // 1) Tốt — tốt trắng ăn chéo LÊN, nên kẻ tấn công nằm ở hàng dưới ô đích.
  if (byWhite) {
    const pr = r - 1;
    if (pr >= 0) {
      let q;
      if (c > 0) { q = b[pr][c - 1]; if (q && q.w && q.t === 'P') return true; }
      if (c < 7) { q = b[pr][c + 1]; if (q && q.w && q.t === 'P') return true; }
    }
  } else {
    const pr = r + 1;
    if (pr < 8) {
      let q;
      if (c > 0) { q = b[pr][c - 1]; if (q && !q.w && q.t === 'P') return true; }
      if (c < 7) { q = b[pr][c + 1]; if (q && !q.w && q.t === 'P') return true; }
    }
  }

  // 2) Mã
  const kn = KN_TG[sq];
  for (let i = 0; i < kn.length; i++) {
    const t = kn[i];
    const q = b[t >> 3][t & 7];
    if (q && q.w === byWhite && q.t === 'N') return true;
  }

  // 3) Vua
  const kg = KG_TG[sq];
  for (let i = 0; i < kg.length; i++) {
    const t = kg[i];
    const q = b[t >> 3][t & 7];
    if (q && q.w === byWhite && q.t === 'K') return true;
  }

  // 4) Quân trượt: 0..3 xe/hậu, 4..7 tượng/hậu
  const rays = RAYS[sq];
  for (let d = 0; d < 8; d++) {
    const ray = rays[d];
    for (let i = 0; i < ray.length; i++) {
      const t = ray[i];
      const q = b[t >> 3][t & 7];
      if (!q) continue;
      if (q.w === byWhite && (q.t === 'Q' || q.t === (d < 4 ? 'R' : 'B'))) return true;
      break;
    }
  }
  return false;
}

/** Vị trí vua bên `white` trên bàn `b`, hoặc null. */
export function findKing(b, white) {
  for (let r = 0; r < 8; r++) {
    const row = b[r];
    for (let c = 0; c < 8; c++) {
      const p = row[c];
      if (p && p.t === 'K' && p.w === white) return { c: c, r: r };
    }
  }
  return null;
}

/** Bên TỚI LƯỢT có đang bị chiếu không. */
export function inCheck(pos) {
  const ks = kingOf(pos, pos.w);
  if (ks < 0) return false;
  return isAttacked(pos.b, ks & 7, ks >> 3, !pos.w);
}

/**
 * Thử một nước rồi hoàn ngay, chỉ để xem vua mình có bị ăn không.
 * KHÔNG cấp phát undo object (đây là chỗ nóng nhất của engine).
 * Phong cấp cứ để nguyên con tốt: quân nào đứng ở ô đến cũng chắn giống nhau,
 * còn nó có chiếu đối phương hay không thì không liên quan tới vua MÌNH.
 */
function tryOk(pos, mv, white) {
  const b = pos.b;
  const fc = mv.fc, fr = mv.fr, tc = mv.tc, tr = mv.tr;
  const p = b[fr][fc];

  let cap = b[tr][tc], capC = tc, capR = tr;
  if (!cap && p.t === 'P' && tc !== fc) {
    capR = fr; capC = tc; cap = b[capR][capC]; b[capR][capC] = null;
  }
  b[fr][fc] = null;
  b[tr][tc] = p;

  let rc = 0;
  if (p.t === 'K') {
    const dx = tc - fc;
    if (dx === 2) { b[tr][5] = b[tr][7]; b[tr][7] = null; rc = 1; }
    else if (dx === -2) { b[tr][3] = b[tr][0]; b[tr][0] = null; rc = 2; }
  }

  let ok;
  if (p.t === 'K') ok = !isAttacked(b, tc, tr, !white);
  else {
    const ks = kingOf(pos, white);       // cache còn đúng vì quân đi không phải vua
    ok = ks < 0 ? true : !isAttacked(b, ks & 7, ks >> 3, !white);
  }

  b[fr][fc] = p;
  b[tr][tc] = null;
  if (cap) b[capR][capC] = cap;
  if (rc === 1) { b[tr][7] = b[tr][5]; b[tr][5] = null; }
  else if (rc === 2) { b[tr][0] = b[tr][3]; b[tr][3] = null; }
  return ok;
}

function legalGen(pos, caps) {
  const ps = genAll(pos, [], caps);
  const out = [];
  const w = pos.w;
  for (let i = 0; i < ps.length; i++) {
    if (tryOk(pos, ps[i], w)) out.push(ps[i]);
  }
  return out;
}

/** Nước đi THẬT SỰ hợp lệ của bên tới lượt. */
export function legalMoves(pos) {
  return legalGen(pos, false);
}

/* ============================================================
   5. KẾT CỤC VÁN CỜ
   ============================================================ */

/** K-K · K+B-K · K+N-K · K+B-K+B cùng màu ô: không thể chiếu bí. */
function insufficient(b) {
  let wb = 0, wn = 0, bb = 0, bn = 0;
  let wbColor = -1, bbColor = -1;
  for (let r = 0; r < 8; r++) {
    const row = b[r];
    for (let c = 0; c < 8; c++) {
      const p = row[c];
      if (!p) continue;
      const t = p.t;
      if (t === 'P' || t === 'R' || t === 'Q') return false;   // còn quân chiếu bí được
      if (t === 'K') continue;
      if (t === 'B') {
        if (p.w) { wb++; wbColor = (r + c) & 1; } else { bb++; bbColor = (r + c) & 1; }
      } else if (t === 'N') {
        if (p.w) wn++; else bn++;
      }
    }
  }
  const wm = wb + wn, bm = bb + bn;
  if (wm === 0 && bm === 0) return true;                       // K-K
  if (wm === 1 && bm === 0) return true;                       // K+B hoặc K+N vs K
  if (wm === 0 && bm === 1) return true;
  if (wb === 1 && bb === 1 && wn === 0 && bn === 0 && wbColor === bbColor) return true;
  return false;
}

/**
 * null nếu còn đánh được, ngược lại { res, winner, note }.
 * Thứ tự xét: chiếu bí / hết nước -> thiếu quân -> 50 nước -> lặp 3 lần.
 * repCount = số lần thế cờ hiện tại đã xuất hiện (kể cả lần này).
 */
export function gameOver(pos, repCount) {
  const ms = legalMoves(pos);
  if (ms.length === 0) {
    if (inCheck(pos)) return { res: 'mate', winner: !pos.w, note: 'Chiếu bí!' };
    return { res: 'stalemate', winner: null, note: 'Hết nước đi (hòa cờ)' };
  }
  if (insufficient(pos.b)) return { res: 'material', winner: null, note: 'Không đủ quân chiếu bí' };
  if (pos.half >= 100) return { res: 'fifty', winner: null, note: 'Luật 50 nước' };
  if ((repCount || 1) >= 3) return { res: 'repetition', winner: null, note: 'Lặp nước 3 lần' };
  return null;
}

/* ============================================================
   6. KÝ HIỆU ĐẠI SỐ (SAN)
   ============================================================ */

/** Ký hiệu SAN của nước `mv` tại thế `pos`. Phải gọi TRƯỚC doMove. */
export function moveSAN(pos, mv) {
  const b = pos.b;
  const p = b[mv.fr][mv.fc];
  if (!p) return '';
  let san;

  if (p.t === 'K' && (mv.tc - mv.fc === 2 || mv.tc - mv.fc === -2)) {
    san = mv.tc === 6 ? 'O-O' : 'O-O-O';
  } else {
    const isCap = !!b[mv.tr][mv.tc] || (p.t === 'P' && mv.tc !== mv.fc);
    const dest = FILES[mv.tc] + (mv.tr + 1);
    if (p.t === 'P') {
      san = (isCap ? FILES[mv.fc] + 'x' : '') + dest;
      if (mv.p) san += '=' + mv.p;
    } else {
      // Nhập nhằng: quân CÙNG LOẠI khác cũng đi hợp lệ tới ô đó -> thêm cột,
      // không đủ thì thêm hàng, vẫn không đủ thì cả hai (Nbd2 / R1e2 / Qh4e1).
      const all = legalMoves(pos);
      let amb = false, sameFile = false, sameRank = false;
      for (let i = 0; i < all.length; i++) {
        const m = all[i];
        if (m.tc !== mv.tc || m.tr !== mv.tr) continue;
        if (m.fc === mv.fc && m.fr === mv.fr) continue;
        const q = b[m.fr][m.fc];
        if (!q || q.t !== p.t || q.w !== p.w) continue;
        amb = true;
        if (m.fc === mv.fc) sameFile = true;
        if (m.fr === mv.fr) sameRank = true;
      }
      let dis = '';
      if (amb) {
        if (!sameFile) dis = FILES[mv.fc];
        else if (!sameRank) dis = String(mv.fr + 1);
        else dis = FILES[mv.fc] + (mv.fr + 1);
      }
      san = p.t + dis + (isCap ? 'x' : '') + dest;
    }
  }

  const u = doMove(pos, mv);
  if (inCheck(pos)) san += legalMoves(pos).length === 0 ? '#' : '+';
  undoMove(pos, mv, u);
  return san;
}

/* ============================================================
   7. PERFT
   ============================================================ */

/** Đếm lá cây nước đi tới độ sâu `depth`. Có đi/hoàn tận lá để bắt lỗi doMove. */
export function perft(pos, depth) {
  if (depth <= 0) return 1;
  const ms = legalMoves(pos);
  let n = 0;
  for (let i = 0; i < ms.length; i++) {
    const u = doMove(pos, ms[i]);
    n += perft(pos, depth - 1);
    undoMove(pos, ms[i], u);
  }
  return n;
}

/* ==========================================================================
   8. AI — negamax + alpha-beta + làm sâu dần + quiescence + bảng băm
   --------------------------------------------------------------------------
   Toàn bộ nằm trong closure _AI để không đâm tên với phần luật ở trên.
   Dùng lại các hàm luật đã có: legalGen, genAll, doMove, undoMove, inCheck…
   ========================================================================== */
const _AI = (function () {
  'use strict';

  /* ------------------------------------------------------------- hằng số */
  const TI = { K: 0, Q: 1, R: 2, B: 3, N: 4, P: 5 };
  const PV = [0, 900, 500, 330, 320, 100];        // giá trị quân theo TI
  const PHW = [0, 4, 2, 1, 1, 0];                 // trọng số "pha ván cờ"
  const PHASE_MAX = 24;                            // 4*1(H) + 4*2(X) + 2*4(hậu)

  const INF = 1e9;
  const MATE = 300000;
  const MATE_NEAR = MATE - 1000;
  const MAX_PLY = 64;
  const Q_CHECK_MAX = 3;        // số tầng gia hạn khi bị chiếu trong quiescence
  const DELTA = 180;            // biên cắt tỉa delta

  /* ------------------------------------------- bảng vị trí (piece-square) --
     Viết theo góc nhìn TRẮNG, HÀNG 1 TRƯỚC (khác lối in sách để khỏi lộn r).
     Đen dùng ô gương: sq -> MIRROR[sq]. Đơn vị cùng hệ với giá trị quân.       */
  function flat(a) { return Int32Array.from(a); }

  const PST_P_MG = flat([
    0, 0, 0, 0, 0, 0, 0, 0,
    5, 10, 10, -20, -20, 10, 10, 5,
    5, -5, -10, 0, 0, -10, -5, 5,
    0, 0, 0, 20, 20, 0, 0, 0,
    5, 5, 10, 25, 25, 10, 5, 5,
    10, 10, 20, 30, 30, 20, 10, 10,
    50, 50, 50, 50, 50, 50, 50, 50,
    0, 0, 0, 0, 0, 0, 0, 0
  ]);
  // Tàn cuộc: tốt chỉ có một việc — CHẠY. Càng gần hàng phong càng đáng tiền.
  const PST_P_EG = flat([
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    6, 6, 6, 6, 6, 6, 6, 6,
    14, 14, 14, 14, 14, 14, 14, 14,
    28, 28, 28, 28, 28, 28, 28, 28,
    50, 50, 50, 50, 50, 50, 50, 50,
    85, 85, 85, 85, 85, 85, 85, 85,
    0, 0, 0, 0, 0, 0, 0, 0
  ]);
  const PST_N = flat([
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20, 0, 5, 5, 0, -20, -40,
    -30, 5, 10, 15, 15, 10, 5, -30,
    -30, 0, 15, 20, 20, 15, 0, -30,
    -30, 5, 15, 20, 20, 15, 5, -30,
    -30, 0, 10, 15, 15, 10, 0, -30,
    -40, -20, 0, 0, 0, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50
  ]);
  const PST_B = flat([
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10, 5, 0, 0, 0, 0, 5, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 5, 5, 10, 10, 5, 5, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -20, -10, -10, -10, -10, -10, -10, -20
  ]);
  const PST_R = flat([
    0, 0, 0, 5, 5, 0, 0, 0,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    5, 10, 10, 10, 10, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0
  ]);
  const PST_Q = flat([
    -20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -10, 5, 5, 5, 5, 5, 0, -10,
    0, 0, 5, 5, 5, 5, 0, -5,
    -5, 0, 5, 5, 5, 5, 0, -5,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -20, -10, -10, -5, -5, -10, -10, -20
  ]);
  // Khai/trung cuộc: vua NẤP sau hàng tốt, tránh trung lộ.
  const PST_K_MG = flat([
    20, 30, 10, 0, 0, 10, 30, 20,
    20, 20, 0, 0, 0, 0, 20, 20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30
  ]);
  // TÀN CUỘC: vua PHẢI tiến ra giữa (yêu cầu rõ ràng) — chênh lệch giữa/biên tới 90đ.
  const PST_K_EG = flat([
    -50, -30, -30, -30, -30, -30, -30, -50,
    -30, -30, 0, 0, 0, 0, -30, -30,
    -30, -10, 20, 30, 30, 20, -10, -30,
    -30, -10, 30, 40, 40, 30, -10, -30,
    -30, -10, 30, 40, 40, 30, -10, -30,
    -30, -10, 20, 30, 30, 20, -10, -30,
    -30, -20, -10, 0, 0, -10, -20, -30,
    -50, -40, -30, -20, -20, -30, -40, -50
  ]);

  const PST_MG = [PST_K_MG, PST_Q, PST_R, PST_B, PST_N, PST_P_MG];
  const PST_EG = [PST_K_EG, PST_Q, PST_R, PST_B, PST_N, PST_P_EG];

  const MIRROR = new Int32Array(64);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) MIRROR[r * 8 + c] = (7 - r) * 8 + c;

  const PASSED = [0, 6, 12, 22, 38, 62, 96, 0];   // thưởng tốt thông theo hàng (góc nhìn trắng)
  const DOUBLED = 12, ISOLATED = 16, BISHOP_PAIR = 32, ROOK_OPEN = 16, ROOK_SEMI = 8, TEMPO = 8;

  /* ------------------------------------------------------------- đánh giá thế
     Trả về điểm theo góc nhìn BÊN TỚI LƯỢT (dương = bên tới lượt đang lợi).     */
  // Chỉ cần hàng THẤP NHẤT của tốt trắng và hàng CAO NHẤT của tốt đen: đó đúng là
  // hai đầu "gần hàng phong của đối phương" mà phép thử tốt thông cần tới.
  const wpMin = new Int32Array(8), bpMax = new Int32Array(8);
  const wpCnt = new Int32Array(8), bpCnt = new Int32Array(8);

  function evalPos(pos) {
    const b = pos.b;
    let mg = 0, eg = 0, phase = 0;
    let wB = 0, bB = 0;

    for (let f = 0; f < 8; f++) {
      wpCnt[f] = 0; bpCnt[f] = 0;
      wpMin[f] = 99; bpMax[f] = -1;
    }

    // Lượt 1: gom cấu trúc tốt (cần biết trước để xét tốt thông / cô lập).
    for (let r = 0; r < 8; r++) {
      const row = b[r];
      for (let c = 0; c < 8; c++) {
        const p = row[c];
        if (!p || p.t !== 'P') continue;
        if (p.w) {
          wpCnt[c]++;
          if (r < wpMin[c]) wpMin[c] = r;
        } else {
          bpCnt[c]++;
          if (r > bpMax[c]) bpMax[c] = r;
        }
      }
    }

    // Lượt 2: vật chất + bảng vị trí + vài nét thế trận rẻ tiền.
    for (let r = 0; r < 8; r++) {
      const row = b[r];
      for (let c = 0; c < 8; c++) {
        const p = row[c];
        if (!p) continue;
        const ti = TI[p.t];
        if (ti === undefined) continue;
        const sq = r * 8 + c;
        const isq = p.w ? sq : MIRROR[sq];
        const v = PV[ti];
        let m = v + PST_MG[ti][isq];
        let e = v + PST_EG[ti][isq];
        phase += PHW[ti];

        if (ti === 5) {
          // tốt thông: không còn tốt địch chặn/kèm trên 3 cột lân cận phía trước
          let blocked = false;
          for (let f = c - 1; f <= c + 1; f++) {
            if (f < 0 || f > 7) continue;
            // tốt trắng chạy lên (r tăng) nên bị chặn bởi tốt đen ở hàng CAO hơn;
            // tốt đen chạy xuống nên bị chặn bởi tốt trắng ở hàng THẤP hơn
            if (p.w) { if (bpMax[f] > r) { blocked = true; break; } }
            else { if (wpMin[f] < r) { blocked = true; break; } }
          }
          if (!blocked) {
            const bonus = PASSED[p.w ? r : 7 - r];
            m += bonus >> 1; e += bonus;
          }
          const cnt = p.w ? wpCnt[c] : bpCnt[c];
          if (cnt > 1) { m -= DOUBLED; e -= DOUBLED; }
          const lf = c > 0 ? (p.w ? wpCnt[c - 1] : bpCnt[c - 1]) : 0;
          const rf = c < 7 ? (p.w ? wpCnt[c + 1] : bpCnt[c + 1]) : 0;
          if (lf === 0 && rf === 0) { m -= ISOLATED; e -= ISOLATED; }
        } else if (ti === 2) {
          // xe trên cột thoáng / nửa thoáng
          const own = p.w ? wpCnt[c] : bpCnt[c];
          const foe = p.w ? bpCnt[c] : wpCnt[c];
          if (own === 0) {
            const bo = foe === 0 ? ROOK_OPEN : ROOK_SEMI;
            m += bo; e += bo >> 1;
          }
        } else if (ti === 3) {
          if (p.w) wB++; else bB++;
        }

        if (p.w) { mg += m; eg += e; } else { mg -= m; eg -= e; }
      }
    }

    if (wB >= 2) { mg += BISHOP_PAIR; eg += BISHOP_PAIR + 12; }
    if (bB >= 2) { mg -= BISHOP_PAIR; eg -= BISHOP_PAIR + 12; }

    // Nội suy theo pha: hết hậu/xe thì bảng TÀN CUỘC lên tiếng (vua ra giữa).
    const ph = phase > PHASE_MAX ? PHASE_MAX : phase;
    let sc = ((mg * ph) + (eg * (PHASE_MAX - ph))) / PHASE_MAX;
    sc = sc | 0;
    return (pos.w ? sc : -sc) + TEMPO;
  }

  /* ------------------------------------------------------- mã hoá nước đi --
     enc = ô_đi * 64 + ô_đến (0..4095). Bỏ qua quân phong cấp: bốn nước phong
     cùng ô đi/đến chỉ dùng để SẮP XẾP nên trùng nhau vô hại.                  */
  function enc(mv) { return ((mv.fr << 3 | mv.fc) << 6) | (mv.tr << 3 | mv.tc); }

  /* --------------------------------------------------------- bảng băm Zobrist
     KHÔNG dùng BigInt (chậm): 2 × Int32Array làm khoá 64 bit thủ công.         */
  const TT_BITS = 19, TT_SIZE = 1 << TT_BITS, TT_MASK = TT_SIZE - 1;
  const ttKey = new Int32Array(TT_SIZE);
  const ttScr = new Int32Array(TT_SIZE);
  const ttMv = new Int32Array(TT_SIZE);
  const ttMeta = new Int32Array(TT_SIZE);     // ((depth+1) << 2) | flag ; 0 = trống
  const F_EXACT = 0, F_LOWER = 1, F_UPPER = 2;

  const ZL = new Int32Array(12 * 64), ZH = new Int32Array(12 * 64);
  const ZCL = new Int32Array(16), ZCH = new Int32Array(16);
  const ZEL = new Int32Array(8), ZEH = new Int32Array(8);
  let ZSL = 0, ZSH = 0;
  (function initZobrist() {
    let s = 0x9e3779b9 | 0;
    function xs32() {
      s ^= s << 13; s |= 0;
      s ^= s >>> 17;
      s ^= s << 5; s |= 0;
      return s;
    }
    for (let i = 0; i < 12 * 64; i++) { ZL[i] = xs32(); ZH[i] = xs32(); }
    for (let i = 0; i < 16; i++) { ZCL[i] = xs32(); ZCH[i] = xs32(); }
    for (let i = 0; i < 8; i++) { ZEL[i] = xs32(); ZEH[i] = xs32(); }
    ZSL = xs32(); ZSH = xs32();
  })();

  function pieceIdx(p) { return (TI[p.t] << 1) | (p.w ? 0 : 1); }

  let hLo = 0, hHi = 0;

  function computeHash(pos) {
    let lo = 0, hi = 0;
    const b = pos.b;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = b[r][c];
        if (!p || TI[p.t] === undefined) continue;
        const k = pieceIdx(p) * 64 + r * 8 + c;
        lo ^= ZL[k]; hi ^= ZH[k];
      }
    }
    lo ^= ZCL[pos.cr & 15]; hi ^= ZCH[pos.cr & 15];
    if (pos.ep) { lo ^= ZEL[pos.ep.c]; hi ^= ZEH[pos.ep.c]; }
    if (pos.w) { lo ^= ZSL; hi ^= ZSH; }
    hLo = lo | 0; hHi = hi | 0;
  }

  /** doMove + cập nhật khoá băm. Người gọi tự lưu/khôi phục hLo,hHi quanh nước đi. */
  function mkMove(pos, mv) {
    const oldCr = pos.cr, oldEp = pos.ep;
    const u = doMove(pos, mv);
    const from = mv.fr * 8 + mv.fc, to = mv.tr * 8 + mv.tc;
    const p = u.p;

    let k = pieceIdx(p) * 64 + from;
    hLo ^= ZL[k]; hHi ^= ZH[k];
    const np = pos.b[mv.tr][mv.tc];                 // có thể là quân phong cấp
    k = pieceIdx(np) * 64 + to;
    hLo ^= ZL[k]; hHi ^= ZH[k];

    if (u.cap) {
      k = pieceIdx(u.cap) * 64 + u.capR * 8 + u.capC;
      hLo ^= ZL[k]; hHi ^= ZH[k];
    }
    if (u.castle) {
      const home = mv.tr * 8;
      const rf = u.castle === 1 ? home + 7 : home;
      const rt = u.castle === 1 ? home + 5 : home + 3;
      const rb = pieceIdx(pc('R', p.w)) * 64;
      hLo ^= ZL[rb + rf] ^ ZL[rb + rt];
      hHi ^= ZH[rb + rf] ^ ZH[rb + rt];
    }
    if (oldCr !== pos.cr) {
      hLo ^= ZCL[oldCr & 15] ^ ZCL[pos.cr & 15];
      hHi ^= ZCH[oldCr & 15] ^ ZCH[pos.cr & 15];
    }
    if (oldEp) { hLo ^= ZEL[oldEp.c]; hHi ^= ZEH[oldEp.c]; }
    if (pos.ep) { hLo ^= ZEL[pos.ep.c]; hHi ^= ZEH[pos.ep.c]; }
    hLo ^= ZSL; hHi ^= ZSH;
    return u;
  }

  function toTT(s, ply) { return s > MATE_NEAR ? s + ply : (s < -MATE_NEAR ? s - ply : s); }
  function fromTT(s, ply) { return s > MATE_NEAR ? s - ply : (s < -MATE_NEAR ? s + ply : s); }

  /* ------------------------------------------------ trạng thái một lần tìm */
  const history = new Int32Array(4096);
  const killers = new Int32Array(MAX_PLY * 2);
  const pathLo = new Int32Array(MAX_PLY + 4);
  let nodes = 0, deadline = 0, aborted = false;

  const _now = (typeof performance !== 'undefined' && performance && typeof performance.now === 'function')
    ? function () { return performance.now(); }
    : function () { return Date.now(); };

  function outOfTime() {
    if ((nodes & 2047) !== 0) return false;
    if (_now() >= deadline) { aborted = true; return true; }
    return false;
  }

  function addKiller(ply, e) {
    const i = ply << 1;
    if (killers[i] === e) return;
    killers[i + 1] = killers[i];
    killers[i] = e;
  }

  /* -------------------------------------------------------- sắp xếp nước đi
     Ưu tiên: nước bảng băm -> ăn quân (MVV-LVA) -> killer -> lịch sử.          */
  const scBuf = new Int32Array(320);   // thế cờ nhiều nước nhất từng dựng được ~218

  function orderMoves(pos, moves, ply, ttBest) {
    const b = pos.b;
    const n = moves.length;
    const k1 = killers[ply << 1], k2 = killers[(ply << 1) + 1];
    for (let i = 0; i < n; i++) {
      const mv = moves[i];
      const e = enc(mv);
      let s;
      const vic = b[mv.tr][mv.tc];
      if (e === ttBest) s = 1e7;
      else if (vic) {
        const att = b[mv.fr][mv.fc];
        s = 1e6 + (PV[TI[vic.t]] << 4) - PV[TI[att.t]];
      } else if (mv.p) s = 9.5e5;
      else if (e === k1) s = 9e5;
      else if (e === k2) s = 8e5;
      else s = history[e];
      scBuf[i] = s;
    }
    for (let i = 1; i < n; i++) {
      const s = scBuf[i], m = moves[i];
      let j = i - 1;
      while (j >= 0 && scBuf[j] < s) { scBuf[j + 1] = scBuf[j]; moves[j + 1] = moves[j]; j--; }
      scBuf[j + 1] = s; moves[j + 1] = m;
    }
  }

  function orderCaps(pos, moves) {
    const b = pos.b;
    const n = moves.length;
    for (let i = 0; i < n; i++) {
      const mv = moves[i];
      const vic = b[mv.tr][mv.tc];
      const att = b[mv.fr][mv.fc];
      let s = vic ? (PV[TI[vic.t]] << 4) - PV[TI[att.t]] : 0;
      if (mv.p) s += 8000;
      scBuf[i] = s;
    }
    for (let i = 1; i < n; i++) {
      const s = scBuf[i], m = moves[i];
      let j = i - 1;
      while (j >= 0 && scBuf[j] < s) { scBuf[j + 1] = scBuf[j]; moves[j + 1] = moves[j]; j--; }
      scBuf[j + 1] = s; moves[j + 1] = m;
    }
  }

  /** Bên `white` còn quân nặng/nhẹ (không tính tốt) không — điều kiện cắt nước rỗng. */
  function hasNonPawn(pos, white) {
    const b = pos.b;
    for (let r = 0; r < 8; r++) {
      const row = b[r];
      for (let c = 0; c < 8; c++) {
        const p = row[c];
        if (p && p.w === white && p.t !== 'P' && p.t !== 'K') return true;
      }
    }
    return false;
  }

  /** Giá quân bị ăn của một nước (kể cả bắt qua đường, kể cả phong cấp). */
  function gainOf(pos, mv) {
    const b = pos.b;
    const vic = b[mv.tr][mv.tc];
    let g = vic ? PV[TI[vic.t]] : 0;
    if (!vic && mv.tc !== mv.fc) {
      const mover = b[mv.fr][mv.fc];
      if (mover && mover.t === 'P') g = PV[5];     // bắt tốt qua đường
    }
    if (mv.p) g += PV[TI[mv.p]] - PV[5];
    return g;
  }

  /* ------------------------------------------------------ tìm yên (quiescence)
     Chỉ xét nước ĂN + PHONG CẤP để tránh "chân trời" khi hết độ sâu.
     Quiescence KHÔNG đọc bảng băm nên dùng doMove trần (khỏi tốn công cập nhật khoá). */
  function quiesce(pos, alpha, beta, ply, qd) {
    if (aborted) return 0;
    nodes++;
    if (outOfTime()) return 0;
    if (ply >= MAX_PLY - 2) return evalPos(pos);

    const check = inCheck(pos);
    let best, moves;

    if (check && qd > 0) {
      moves = legalGen(pos, false);                 // đang bị chiếu: phải xét MỌI nước gỡ
      if (moves.length === 0) return -MATE + ply;
      best = -INF;
    } else {
      best = evalPos(pos);
      if (best >= beta) return best;
      if (best > alpha) alpha = best;
      if (check) return best;                       // hết gia hạn chiếu -> dừng
      moves = legalGen(pos, true);
      if (moves.length === 0) return best;
    }

    orderCaps(pos, moves);

    for (let i = 0; i < moves.length; i++) {
      const mv = moves[i];
      if (!check && best + gainOf(pos, mv) + DELTA < alpha) continue;   // cắt tỉa delta
      const u = doMove(pos, mv);
      const s = -quiesce(pos, -beta, -alpha, ply + 1, check ? qd - 1 : qd);
      undoMove(pos, mv, u);
      if (aborted) return 0;
      if (s > best) best = s;
      if (s > alpha) alpha = s;
      if (alpha >= beta) break;
    }
    return best;
  }

  /* --------------------------------------------------- negamax + alpha-beta */
  function negamax(pos, depth, alpha, beta, ply, allowNull) {
    if (aborted) return 0;
    nodes++;
    if (outOfTime()) return 0;
    if (ply >= MAX_PLY - 2) return evalPos(pos);

    if (ply > 0) {
      if (pos.half >= 100) return 0;                       // luật 50 nước = hoà
      // lặp thế cờ trên ĐƯỜNG ĐANG ĐI: chỉ cần thấy 1 lần lặp là coi như hoà,
      // đủ để máy không tự lùa mình vào vòng lặp khi đang thắng.
      const lim = ply - (pos.half > ply ? ply : pos.half);
      for (let j = ply - 2; j >= lim; j -= 2) {
        if (pathLo[j] === hLo) return 0;
      }
    }
    pathLo[ply] = hLo;

    const idx = (hLo >>> 0) & TT_MASK;
    let ttBest = 0;
    const meta = ttMeta[idx];
    if (meta !== 0 && ttKey[idx] === hHi) {
      ttBest = ttMv[idx];
      // chỉ cắt theo điểm đã lưu ở nút KHÔNG-PV (cửa sổ hẹp) cho khỏi sai lệch
      if (ply > 0 && beta - alpha <= 1 && ((meta >> 2) - 1) >= depth) {
        const s = fromTT(ttScr[idx], ply);
        const fl = meta & 3;
        if (fl === F_EXACT) return s;
        if (fl === F_LOWER && s >= beta) return s;
        if (fl === F_UPPER && s <= alpha) return s;
      }
    }

    const check = inCheck(pos);
    let d = depth;
    if (check && ply < 40) d++;                            // gia hạn khi bị chiếu
    if (d <= 0) return quiesce(pos, alpha, beta, ply, Q_CHECK_MAX);

    // cắt tỉa nước rỗng: bỏ lượt mà vẫn hơn beta -> nhánh này quá tốt, cắt.
    // Cấm khi chỉ còn vua+tốt (dễ dính zugzwang) và khi đang bị chiếu.
    if (allowNull && !check && d >= 3 && beta < MATE_NEAR && beta > -MATE_NEAR
      && hasNonPawn(pos, pos.w)) {
      const sEp = pos.ep, sLo = hLo, sHi = hHi;
      pos.w = !pos.w;
      pos.ep = null;                                       // bỏ lượt thì quyền bắt qua đường mất
      hLo ^= ZSL; hHi ^= ZSH;
      if (sEp) { hLo ^= ZEL[sEp.c]; hHi ^= ZEH[sEp.c]; }
      const R = d > 6 ? 3 : 2;
      const s = -negamax(pos, d - 1 - R, -beta, -beta + 1, ply + 1, false);
      pos.w = !pos.w; pos.ep = sEp; hLo = sLo; hHi = sHi;
      if (aborted) return 0;
      if (s >= beta) return s < MATE_NEAR ? s : beta;
    }

    const moves = legalGen(pos, false);
    if (moves.length === 0) return check ? (-MATE + ply) : 0;   // hết nước: bí hoặc HOÀ CỜ

    orderMoves(pos, moves, ply, ttBest);

    const alpha0 = alpha;
    let best = -INF, bestE = 0;

    for (let i = 0; i < moves.length; i++) {
      const mv = moves[i];
      const quiet = !pos.b[mv.tr][mv.tc] && !mv.p;
      const sLo = hLo, sHi = hHi;
      const u = mkMove(pos, mv);
      let s;
      if (i === 0) {
        s = -negamax(pos, d - 1, -beta, -alpha, ply + 1, true);
      } else {
        // giảm sâu nước yên xếp cuối (LMR); nước chiếu thì không giảm
        let red = 0;
        if (d >= 3 && i >= 3 && quiet && !check && !inCheck(pos)) red = (i >= 6 && d >= 5) ? 2 : 1;
        s = -negamax(pos, d - 1 - red, -alpha - 1, -alpha, ply + 1, true);
        if (!aborted && red > 0 && s > alpha) {
          s = -negamax(pos, d - 1, -alpha - 1, -alpha, ply + 1, true);
        }
        if (!aborted && s > alpha && s < beta) {
          s = -negamax(pos, d - 1, -beta, -alpha, ply + 1, true);
        }
      }
      undoMove(pos, mv, u);
      hLo = sLo; hHi = sHi;
      if (aborted) return 0;

      if (s > best) { best = s; bestE = enc(mv); }
      if (s > alpha) alpha = s;
      if (alpha >= beta) {
        if (quiet) {
          const e = enc(mv);
          addKiller(ply, e);
          const h = history[e] + d * d;
          history[e] = h > 1e8 ? 1e8 : h;
        }
        break;
      }
    }

    const flag = best <= alpha0 ? F_UPPER : (best >= beta ? F_LOWER : F_EXACT);
    ttKey[idx] = hHi;
    ttScr[idx] = toTT(best, ply) | 0;
    ttMv[idx] = bestE;
    ttMeta[idx] = ((d + 1) << 2) | flag;
    return best;
  }

  /* ------------------------------------------------------------- gốc (root) */
  function cp(mv) {
    const o = { fc: mv.fc, fr: mv.fr, tc: mv.tc, tr: mv.tr };
    if (mv.p) o.p = mv.p;      // KHÔNG gán null khi không phong cấp
    return o;
  }

  function searchBest(pos, opts) {
    opts = opts || {};
    const timeMs = (typeof opts.timeMs === 'number' && opts.timeMs > 0) ? opts.timeMs : 900;
    const maxDepth = Math.max(1, Math.min(
      (typeof opts.depth === 'number' && opts.depth > 0) ? Math.floor(opts.depth) : 64, MAX_PLY - 8));
    const noise = Math.max(0, Math.min(1, typeof opts.rand === 'number' ? opts.rand : 0));

    const rootMoves = legalMoves(pos);
    if (!rootMoves || rootMoves.length === 0) return null;
    if (rootMoves.length === 1) return cp(rootMoves[0]);

    nodes = 0; aborted = false;
    const t0 = _now();
    deadline = t0 + timeMs;
    history.fill(0); killers.fill(0);
    ttMeta.fill(0);                  // ván mới / thế mới: khoá cũ dễ va nhau, dọn cho sạch
    computeHash(pos);
    pathLo[0] = hLo;                 // thế gốc nằm ở tầng 0 của đường đi (dò lặp nước)

    const list = new Array(rootMoves.length);
    for (let i = 0; i < rootMoves.length; i++) {
      const mv = rootMoves[i];
      list[i] = { mv: mv, sc: gainOf(pos, mv), depth: 0, exact: false };
    }
    list.sort(function (a, b) { return b.sc - a.sc; });

    let bestMv = list[0].mv, bestSc = -INF, doneDepth = 0;

    for (let d = 1; d <= maxDepth; d++) {
      if (d > 1 && (_now() - t0) > timeMs * 0.5) break;   // không kịp làm sâu nữa

      let alpha = -INF;
      let iterBest = null, iterSc = -INF;

      for (let i = 0; i < list.length; i++) {
        const it = list[i];
        const sLo = hLo, sHi = hHi;
        const u = mkMove(pos, it.mv);
        let s;
        if (i === 0) {
          s = -negamax(pos, d - 1, -INF, -alpha, 1, true);
          it.exact = true;
        } else {
          s = -negamax(pos, d - 1, -alpha - 1, -alpha, 1, true);
          if (!aborted && s > alpha) {
            s = -negamax(pos, d - 1, -INF, -alpha, 1, true);
            it.exact = true;
          } else {
            it.exact = false;        // chỉ là CẬN TRÊN (fail-low)
          }
        }
        undoMove(pos, it.mv, u);
        hLo = sLo; hHi = sHi;
        if (aborted) break;

        it.sc = s; it.depth = d;
        if (s > iterSc) { iterSc = s; iterBest = it.mv; }
        if (s > alpha) alpha = s;
      }

      if (iterBest && iterSc > -INF) { bestMv = iterBest; bestSc = iterSc; doneDepth = d; }
      if (aborted) break;

      list.sort(function (a, b) { return b.sc - a.sc; });
      if (bestSc >= MATE_NEAR) break;                     // đã thấy đường chiếu bí
    }

    if (noise <= 0 || doneDepth === 0) return cp(bestMv);

    /* --- thêm nhiễu nhỏ: chọn ngẫu nhiên trong nhóm nước "gần bằng nhau" --- */
    const margin = Math.round(10 + noise * 90);
    const lo = bestSc - margin;
    const pool = [];
    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      if (it.depth !== doneDepth || it.sc < lo) continue;
      pool.push(it);
    }
    if (pool.length <= 1) return cp(bestMv);

    // nước fail-low mới chỉ có CẬN TRÊN -> tìm lại với cửa sổ (lo-1, +vc) cho chắc
    aborted = false;
    deadline = _now() + Math.min(timeMs * 0.3, 250);
    const ok = [];
    for (let i = 0; i < pool.length; i++) {
      const it = pool[i];
      if (it.exact) { ok.push(it); continue; }
      if (aborted) continue;
      const sLo = hLo, sHi = hHi;
      const u = mkMove(pos, it.mv);
      const s = -negamax(pos, doneDepth - 1, -INF, -(lo - 1), 1, true);
      undoMove(pos, it.mv, u);
      hLo = sLo; hHi = sHi;
      if (aborted) continue;
      if (s >= lo) { it.sc = s; ok.push(it); }
    }
    if (ok.length <= 1) return cp(bestMv);

    let total = 0;
    for (let i = 0; i < ok.length; i++) total += (ok[i].sc - lo + 1);
    let pick = Math.random() * total;
    for (let i = 0; i < ok.length; i++) {
      pick -= (ok[i].sc - lo + 1);
      if (pick <= 0) return cp(ok[i].mv);
    }
    return cp(ok[ok.length - 1].mv);
  }

  function lastNodes() { return nodes; }

  return { evaluate: evalPos, searchBest: searchBest, lastNodes: lastNodes };
})();

/** Điểm thế cờ theo góc nhìn BÊN TỚI LƯỢT (dương = bên tới lượt đang lợi). */
export function evaluate(pos) { return _AI.evaluate(pos); }

/** Nước tốt nhất cho bên tới lượt. opts = { depth, timeMs, rand }. null nếu hết nước. */
export function searchBest(pos, opts) { return _AI.searchBest(pos, opts); }

/** Số nút đã duyệt ở lần searchBest gần nhất (dùng để đo tốc độ). */
export function searchNodes() { return _AI.lastNodes(); }
