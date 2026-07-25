// ============================================================
// ENGINE — CỜ TƯỚNG (象棋) THUẦN: luật + AI. KHÔNG DOM, KHÔNG import.
// Dùng bởi src/cotuong.js (lớp 3D/UI). Cách ly để dễ kiểm/thay.
// board[r][c]: r=0..9 (r0 = đáy ĐỎ), c=0..8 · ô trống = null · quân = {t,red}
// t: K tướng · A sĩ · E tượng(voi) · H mã · R xe · C pháo · S tốt
// Nước đi: {fc,fr,tc,tr}
// ============================================================

// ============================================================
//  CO TUONG (Xiangqi) - BO LUAT DAY DU
//  ES module thuan JS: khong DOM, khong thu vien, khong import.
//
//  board[r][c]  ->  r = 0..9 (r0 = day cua DO), c = 0..8
//  o trong = null ; quan co = { t, red }
//  t : 'K' tuong | 'A' si | 'E' tuong(voi) | 'H' ma | 'R' xe | 'C' phao | 'S' tot
//  DO  (red=true)  di ve phia r TANG  , nua san r0..r4 , cung c3..c5 / r0..r2
//  DEN (red=false) di ve phia r GIAM  , nua san r5..r9 , cung c3..c5 / r7..r9
//  Nuoc di : { fc, fr, tc, tr }
// ============================================================

const ROWS = 10;
const COLS = 9;

// [dc, dr] - khai bao 1 lan o module scope de khong cap phat lai trong vong lap
const ORTHO = [[0, 1], [0, -1], [1, 0], [-1, 0]];
const DIAG = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const HORSE = [
  [1, 2], [-1, 2], [1, -2], [-1, -2],
  [2, 1], [2, -1], [-2, 1], [-2, -1]
];
const BACK_RANK = ['R', 'H', 'E', 'A', 'K', 'A', 'E', 'H', 'R'];

function onBoard(c, r) {
  return c >= 0 && c < COLS && r >= 0 && r < ROWS;
}

// ------------------------------------------------------------
//  BAN CO
// ------------------------------------------------------------

/** The khai cuoc chuan (32 quan). */
export function initBoard() {
  const board = new Array(ROWS);
  for (let r = 0; r < ROWS; r++) {
    const row = new Array(COLS);
    for (let c = 0; c < COLS; c++) row[c] = null;
    board[r] = row;
  }
  for (let c = 0; c < COLS; c++) {
    board[0][c] = { t: BACK_RANK[c], red: true };
    board[9][c] = { t: BACK_RANK[c], red: false };
  }
  board[2][1] = { t: 'C', red: true };
  board[2][7] = { t: 'C', red: true };
  board[7][1] = { t: 'C', red: false };
  board[7][7] = { t: 'C', red: false };
  for (let c = 0; c < COLS; c += 2) {
    board[3][c] = { t: 'S', red: true };
    board[6][c] = { t: 'S', red: false };
  }
  return board;
}

/** Copy nong tung hang; quan co la object BAT BIEN nen dung chung an toan. */
export function cloneBoard(board) {
  const out = new Array(ROWS);
  for (let r = 0; r < ROWS; r++) out[r] = board[r].slice();
  return out;
}

/** O (c,r) co nam trong cung cua ben `red` khong. */
export function inPalace(c, r, red) {
  if (c < 3 || c > 5) return false;
  return red ? (r >= 0 && r <= 2) : (r >= 7 && r <= 9);
}

/** Hang r co nam ben nua san cua ben `red` khong (voi khong duoc qua song). */
function ownHalf(r, red) {
  return red ? r <= 4 : r >= 5;
}

// ------------------------------------------------------------
//  SINH NUOC GIA-HOP-LE (chua loc chieu / doi mat tuong)
// ------------------------------------------------------------

function genKing(board, c, r, red, moves) {
  for (let i = 0; i < 4; i++) {
    const tc = c + ORTHO[i][0];
    const tr = r + ORTHO[i][1];
    if (!inPalace(tc, tr, red)) continue;          // khong duoc ra khoi cung
    const q = board[tr][tc];
    if (q && q.red === red) continue;
    moves.push({ fc: c, fr: r, tc, tr });
  }
}

function genAdvisor(board, c, r, red, moves) {
  for (let i = 0; i < 4; i++) {
    const tc = c + DIAG[i][0];
    const tr = r + DIAG[i][1];
    if (!inPalace(tc, tr, red)) continue;          // si cung khong ra khoi cung
    const q = board[tr][tc];
    if (q && q.red === red) continue;
    moves.push({ fc: c, fr: r, tc, tr });
  }
}

function genElephant(board, c, r, red, moves) {
  for (let i = 0; i < 4; i++) {
    const dc = DIAG[i][0];
    const dr = DIAG[i][1];
    const tc = c + dc * 2;
    const tr = r + dr * 2;
    if (!onBoard(tc, tr)) continue;
    if (!ownHalf(tr, red)) continue;               // tuong (voi) khong qua song
    if (board[r + dr][c + dc]) continue;           // "mat tuong" bi can
    const q = board[tr][tc];
    if (q && q.red === red) continue;
    moves.push({ fc: c, fr: r, tc, tr });
  }
}

function genHorse(board, c, r, red, moves) {
  for (let i = 0; i < 8; i++) {
    const dc = HORSE[i][0];
    const dr = HORSE[i][1];
    const tc = c + dc;
    const tr = r + dr;
    if (!onBoard(tc, tr)) continue;
    // "can chan ma": o ke ben theo huong DI 2 O phai trong
    let legC, legR;
    if (dr === 2 || dr === -2) { legC = c; legR = r + (dr >> 1); }
    else { legC = c + (dc >> 1); legR = r; }
    if (board[legR][legC]) continue;
    const q = board[tr][tc];
    if (q && q.red === red) continue;
    moves.push({ fc: c, fr: r, tc, tr });
  }
}

function genRook(board, c, r, red, moves) {
  for (let i = 0; i < 4; i++) {
    const dc = ORTHO[i][0];
    const dr = ORTHO[i][1];
    let tc = c + dc;
    let tr = r + dr;
    while (onBoard(tc, tr)) {
      const q = board[tr][tc];
      if (!q) {
        moves.push({ fc: c, fr: r, tc, tr });
      } else {
        if (q.red !== red) moves.push({ fc: c, fr: r, tc, tr });
        break;
      }
      tc += dc;
      tr += dr;
    }
  }
}

function genCannon(board, c, r, red, moves) {
  for (let i = 0; i < 4; i++) {
    const dc = ORTHO[i][0];
    const dr = ORTHO[i][1];
    let tc = c + dc;
    let tr = r + dr;
    // doan 1: di nhu xe, KHONG an, khong nhay
    while (onBoard(tc, tr) && !board[tr][tc]) {
      moves.push({ fc: c, fr: r, tc, tr });
      tc += dc;
      tr += dr;
    }
    if (!onBoard(tc, tr)) continue;
    // (tc,tr) la "ngoi" - vuot qua ngoi, tim quan dau tien phia sau
    tc += dc;
    tr += dr;
    while (onBoard(tc, tr) && !board[tr][tc]) {
      tc += dc;
      tr += dr;
    }
    if (!onBoard(tc, tr)) continue;
    if (board[tr][tc].red !== red) moves.push({ fc: c, fr: r, tc, tr });
  }
}

function genSoldier(board, c, r, red, moves) {
  const fwd = red ? 1 : -1;
  const tr = r + fwd;
  if (tr >= 0 && tr < ROWS) {
    const q = board[tr][c];
    if (!q || q.red !== red) moves.push({ fc: c, fr: r, tc: c, tr });
  }
  // qua song moi duoc di ngang; KHONG BAO GIO lui
  const crossed = red ? (r >= 5) : (r <= 4);
  if (!crossed) return;
  if (c - 1 >= 0) {
    const q = board[r][c - 1];
    if (!q || q.red !== red) moves.push({ fc: c, fr: r, tc: c - 1, tr: r });
  }
  if (c + 1 < COLS) {
    const q = board[r][c + 1];
    if (!q || q.red !== red) moves.push({ fc: c, fr: r, tc: c + 1, tr: r });
  }
}

/** Tat ca nuoc gia-hop-le cua ben `red` (CHUA loc tu chieu / doi mat tuong). */
export function genPseudo(board, red) {
  const moves = [];
  for (let r = 0; r < ROWS; r++) {
    const row = board[r];
    for (let c = 0; c < COLS; c++) {
      const p = row[c];
      if (!p || p.red !== red) continue;
      switch (p.t) {
        case 'K': genKing(board, c, r, red, moves); break;
        case 'A': genAdvisor(board, c, r, red, moves); break;
        case 'E': genElephant(board, c, r, red, moves); break;
        case 'H': genHorse(board, c, r, red, moves); break;
        case 'R': genRook(board, c, r, red, moves); break;
        case 'C': genCannon(board, c, r, red, moves); break;
        case 'S': genSoldier(board, c, r, red, moves); break;
        default: break;
      }
    }
  }
  return moves;
}

// ------------------------------------------------------------
//  DI / HOAN NUOC  (doi xung tuyet doi)
// ------------------------------------------------------------

/** MUTATE board. Tra ve quan bi an, hoac null. */
export function doMove(board, mv) {
  const captured = board[mv.tr][mv.tc];
  board[mv.tr][mv.tc] = board[mv.fr][mv.fc];
  board[mv.fr][mv.fc] = null;
  return captured || null;
}

/** MUTATE board tra lai y nguyen trang thai truoc doMove. */
export function undoMove(board, mv, captured) {
  board[mv.fr][mv.fc] = board[mv.tr][mv.tc];
  board[mv.tr][mv.tc] = captured || null;
}

// ------------------------------------------------------------
//  TAN CONG / CHIEU TUONG
// ------------------------------------------------------------

/**
 * O (c,r) co bi ben `byRed` tan cong khong.
 * Quet NGUOC tu o dich (nhanh hon nhieu so voi sinh toan bo nuoc di).
 * KHONG tinh luat "tuong doi mat" - the do xu ly rieng o kingsFace()/legalMoves().
 */
export function isAttacked(board, c, r, byRed) {
  // 1) Xe / Phao / Tuong (ke) theo 4 tia thang
  for (let i = 0; i < 4; i++) {
    const dc = ORTHO[i][0];
    const dr = ORTHO[i][1];
    let cc = c + dc;
    let rr = r + dr;
    let dist = 1;
    let first = null;
    while (onBoard(cc, rr)) {
      const q = board[rr][cc];
      if (q) { first = q; break; }
      cc += dc;
      rr += dr;
      dist++;
    }
    if (!first) continue;
    if (first.red === byRed) {
      if (first.t === 'R') return true;
      if (first.t === 'K' && dist === 1 && inPalace(c, r, byRed)) return true;
    }
    // vuot qua "ngoi" -> quan thu hai la Phao thi bi an
    cc += dc;
    rr += dr;
    while (onBoard(cc, rr)) {
      const q2 = board[rr][cc];
      if (q2) {
        if (q2.red === byRed && q2.t === 'C') return true;
        break;
      }
      cc += dc;
      rr += dr;
    }
  }

  // 2) Ma (can chan ma tinh tu vi tri CON MA)
  for (let i = 0; i < 8; i++) {
    const dc = HORSE[i][0];
    const dr = HORSE[i][1];
    const hc = c + dc;
    const hr = r + dr;
    if (!onBoard(hc, hr)) continue;
    const q = board[hr][hc];
    if (!q || q.red !== byRed || q.t !== 'H') continue;
    let legC, legR;
    if (dr === 2 || dr === -2) { legC = hc; legR = hr - (dr >> 1); }
    else { legC = hc - (dc >> 1); legR = hr; }
    if (!board[legR][legC]) return true;
  }

  // 3) Tuong (voi) - dung 2 o cheo, mat tuong phai trong, KHONG qua song.
  //    Guong lai dung chot song cua genElephant(): o bi tan cong (c,r) chinh la
  //    o DICH cua con voi, nen no phai nam ben nua san cua ben `byRed`.
  if (ownHalf(r, byRed)) {
    for (let i = 0; i < 4; i++) {
      const dc = DIAG[i][0];
      const dr = DIAG[i][1];
      const ec = c + dc * 2;
      const er = r + dr * 2;
      if (!onBoard(ec, er)) continue;
      const q = board[er][ec];
      if (!q || q.red !== byRed || q.t !== 'E') continue;
      if (!board[r + dr][c + dc]) return true;
    }
  }

  // 4) Si - chi an duoc trong pham vi cung
  if (inPalace(c, r, byRed)) {
    for (let i = 0; i < 4; i++) {
      const ac = c + DIAG[i][0];
      const ar = r + DIAG[i][1];
      if (!inPalace(ac, ar, byRed)) continue;
      const q = board[ar][ac];
      if (q && q.red === byRed && q.t === 'A') return true;
    }
  }

  // 5) Tot
  if (byRed) {
    if (r - 1 >= 0) {
      const q = board[r - 1][c];                    // tot DO tien len (r tang)
      if (q && q.red && q.t === 'S') return true;
    }
    if (r >= 5) {                                   // tot DO da qua song moi an ngang
      if (c - 1 >= 0) {
        const q = board[r][c - 1];
        if (q && q.red && q.t === 'S') return true;
      }
      if (c + 1 < COLS) {
        const q = board[r][c + 1];
        if (q && q.red && q.t === 'S') return true;
      }
    }
  } else {
    if (r + 1 < ROWS) {
      const q = board[r + 1][c];                    // tot DEN tien xuong (r giam)
      if (q && !q.red && q.t === 'S') return true;
    }
    if (r <= 4) {                                   // tot DEN da qua song
      if (c - 1 >= 0) {
        const q = board[r][c - 1];
        if (q && !q.red && q.t === 'S') return true;
      }
      if (c + 1 < COLS) {
        const q = board[r][c + 1];
        if (q && !q.red && q.t === 'S') return true;
      }
    }
  }

  return false;
}

/** Vi tri tuong ben `red`, hoac null. Quet cung truoc cho nhanh. */
export function findKing(board, red) {
  const r0 = red ? 0 : 7;
  const r1 = red ? 2 : 9;
  for (let r = r0; r <= r1; r++) {
    const row = board[r];
    for (let c = 3; c <= 5; c++) {
      const p = row[c];
      if (p && p.t === 'K' && p.red === red) return { c, r };
    }
  }
  // du phong: the co bat thuong (tuong nam ngoai cung)
  for (let r = 0; r < ROWS; r++) {
    const row = board[r];
    for (let c = 0; c < COLS; c++) {
      const p = row[c];
      if (p && p.t === 'K' && p.red === red) return { c, r };
    }
  }
  return null;
}

/** Hai tuong cung cot va giua khong con quan nao ("phi tuong"). */
export function kingsFace(board) {
  const a = findKing(board, true);
  if (!a) return false;
  const b = findKing(board, false);
  if (!b) return false;
  if (a.c !== b.c) return false;
  const lo = (a.r < b.r ? a.r : b.r) + 1;
  const hi = (a.r < b.r ? b.r : a.r);
  for (let r = lo; r < hi; r++) {
    if (board[r][a.c]) return false;
  }
  return true;
}

/** Tuong ben `red` co dang bi chieu khong. */
export function inCheck(board, red) {
  const k = findKing(board, red);
  if (!k) return false;
  return isAttacked(board, k.c, k.r, !red);
}

/**
 * The co (sau khi da di) co HOP LE voi ben `red` khong:
 *  - tuong minh con tren ban
 *  - khong de 2 tuong doi mat
 *  - tuong minh khong bi chieu
 * Gop 3 viec de chi phai tim tuong 1 lan cho moi nuoc thu.
 */
function positionOk(board, red) {
  const mine = findKing(board, red);
  if (!mine) return false;
  const foe = findKing(board, !red);
  if (foe && foe.c === mine.c) {
    const lo = (mine.r < foe.r ? mine.r : foe.r) + 1;
    const hi = (mine.r < foe.r ? foe.r : mine.r);
    let blocked = false;
    for (let r = lo; r < hi; r++) {
      if (board[r][mine.c]) { blocked = true; break; }
    }
    if (!blocked) return false;                     // phi tuong -> bat hop le
  }
  return !isAttacked(board, mine.c, mine.r, !red);
}

/** Nuoc di THAT SU hop le cua ben `red`. */
export function legalMoves(board, red) {
  const pseudo = genPseudo(board, red);
  const out = [];
  for (let i = 0; i < pseudo.length; i++) {
    const mv = pseudo[i];
    const captured = doMove(board, mv);
    const ok = positionOk(board, red);
    undoMove(board, mv, captured);
    if (ok) out.push(mv);
  }
  return out;
}

/** null neu con danh duoc; 'lose' neu ben `red` het nuoc (chieu bi hay bi vay chet deu thua). */
export function gameOver(board, red) {
  return legalMoves(board, red).length === 0 ? 'lose' : null;
}


/* ==========================================================================
   AI CO TUONG  -  minimax + cat tia alpha-beta + lam sau dan (iterative deepening)
   --------------------------------------------------------------------------
   Gia su cac ham LUAT da co san trong cung file (KHONG dinh nghia lai):
     initBoard, cloneBoard, inPalace, genPseudo, doMove, undoMove,
     isAttacked, findKing, kingsFace, inCheck, legalMoves, gameOver
   Toan bo phan AI nam trong closure _AI de khong dam ten voi phan luat.
   ========================================================================== */
const _AI = (function () {
  'use strict';

  /* ---------------------------------------------------------------- hang so */
  const TI = { K: 0, A: 1, E: 2, H: 3, R: 4, C: 5, S: 6 }; // chi so loai quan
  const PV = [100000, 200, 200, 400, 900, 450, 100];       // gia tri quan theo TI

  const INF = 1e9;
  const MATE = 500000;          // diem "bi chieu bi"
  const MATE_NEAR = MATE - 1000;
  const MAX_PLY = 64;
  const Q_CHECK_MAX = 4;        // so tang gia han khi bi chieu trong quiescence
  const DELTA_MARGIN = 200;     // cat tia delta trong quiescence

  // trong so tinh co dong (nhe)
  const MOB_R = 2, MOB_C = 1, MOB_H = 3;

  /* -------------------------------------------- bang vi tri (piece-square) --
     Viet theo goc nhin ben DO: [r][c], r=0 la day nha DO, r tang = tien len.
     Ben DEN dung o guong: sq -> MIRROR[sq].
     Don vi cung he voi gia tri quan (tot = 100).                             */
  function flat(rows) {
    const a = new Int32Array(90);
    for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) a[r * 9 + c] = rows[r][c];
    return a;
  }

  // Tot: gan nhu vo dung ben nha, TANG MANH khi qua song (r >= 5)
  const PST_S = flat([
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 4, 0, 2, 0, 0],
    [2, 0, 4, 0, 6, 0, 4, 0, 2],
    [10, 14, 18, 24, 28, 24, 18, 14, 10],
    [18, 22, 26, 34, 40, 34, 26, 22, 18],
    [26, 32, 40, 52, 58, 52, 40, 32, 26],
    [28, 38, 48, 62, 68, 62, 48, 38, 28],
    [20, 28, 36, 46, 50, 46, 36, 28, 20]
  ]);

  // Ma: thich trung lo, ghet bien; tien len giua san la manh
  const PST_H = flat([
    [0, -2, 2, 0, 2, 0, 2, -2, 0],
    [-2, 2, 4, 5, 4, 5, 4, 2, -2],
    [2, 4, 6, 8, 6, 8, 6, 4, 2],
    [0, 5, 8, 8, 10, 8, 8, 5, 0],
    [2, 6, 10, 12, 12, 12, 10, 6, 2],
    [2, 8, 12, 14, 14, 14, 12, 8, 2],
    [4, 10, 14, 16, 16, 16, 14, 10, 4],
    [2, 8, 12, 14, 14, 14, 12, 8, 2],
    [-2, 4, 8, 10, 10, 10, 8, 4, -2],
    [-4, 0, 2, 4, 4, 4, 2, 0, -4]
  ]);

  // Phao: thich cot giua + hang ngang tan cong ben san dich
  const PST_C = flat([
    [0, 0, 2, 6, 6, 6, 2, 0, 0],
    [0, 2, 4, 6, 6, 6, 4, 2, 0],
    [4, 2, 6, 6, 8, 6, 6, 2, 4],
    [0, 0, 0, 2, 4, 2, 0, 0, 0],
    [-2, 0, 4, 2, 6, 2, 4, 0, -2],
    [0, 0, 2, 4, 6, 4, 2, 0, 0],
    [4, 4, 4, 6, 8, 6, 4, 4, 4],
    [2, 4, 6, 8, 10, 8, 6, 4, 2],
    [0, 4, 6, 8, 8, 8, 6, 4, 0],
    [0, 2, 4, 6, 6, 6, 4, 2, 0]
  ]);

  // Xe: thich cot thoang + hang 2 bay va day sau cua dich
  const PST_R = flat([
    [-2, 6, 4, 12, 12, 12, 4, 6, -2],
    [8, 12, 12, 14, 16, 14, 12, 12, 8],
    [4, 8, 8, 12, 14, 12, 8, 8, 4],
    [-2, 8, 6, 12, 14, 12, 6, 8, -2],
    [6, 10, 8, 14, 16, 14, 8, 10, 6],
    [6, 10, 8, 14, 16, 14, 8, 10, 6],
    [6, 12, 10, 16, 18, 16, 10, 12, 6],
    [10, 14, 12, 18, 20, 18, 12, 14, 10],
    [12, 16, 14, 20, 22, 20, 14, 16, 12],
    [6, 10, 12, 16, 16, 16, 12, 10, 6]
  ]);

  // Si / Tuong(voi): chi thuong nhe khi dung dung cho thu
  const PST_A = flat([
    [0, 0, 0, 2, 0, 2, 0, 0, 0],
    [0, 0, 0, 0, 6, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ]);
  const PST_E = flat([
    [0, 0, 3, 0, 0, 0, 3, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 7, 0, 0, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ]);
  // Tuong (soai): nen ngoi yen day cung
  const PST_K = flat([
    [0, 0, 0, 6, 8, 6, 0, 0, 0],
    [0, 0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 0, -4, -6, -4, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ]);

  const PST = [PST_K, PST_A, PST_E, PST_H, PST_R, PST_C, PST_S]; // theo TI

  const MIRROR = new Int32Array(90);
  for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) MIRROR[r * 9 + c] = (9 - r) * 9 + c;

  const DIR4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  // ma: [dc, dr, chan_dc, chan_dr]
  const HORSE8 = [
    [1, 2, 0, 1], [-1, 2, 0, 1], [1, -2, 0, -1], [-1, -2, 0, -1],
    [2, 1, 1, 0], [2, -1, 1, 0], [-2, 1, -1, 0], [-2, -1, -1, 0]
  ];

  /* ------------------------------------------------------------- tinh co dong
     Cac ham dem duoi day CHI phuc vu ham danh gia (khong phai luat co).       */
  function rookMob(board, c, r, red) {
    let n = 0;
    for (let i = 0; i < 4; i++) {
      const dc = DIR4[i][0], dr = DIR4[i][1];
      let cc = c + dc, rr = r + dr;
      while (cc >= 0 && cc < 9 && rr >= 0 && rr < 10) {
        const q = board[rr][cc];
        if (!q) { n++; cc += dc; rr += dr; continue; }
        if (q.red !== red) n++;
        break;
      }
    }
    return n;
  }
  function cannonMob(board, c, r) {
    let n = 0;
    for (let i = 0; i < 4; i++) {
      const dc = DIR4[i][0], dr = DIR4[i][1];
      let cc = c + dc, rr = r + dr;
      while (cc >= 0 && cc < 9 && rr >= 0 && rr < 10 && !board[rr][cc]) { n++; cc += dc; rr += dr; }
    }
    return n;
  }
  function horseMob(board, c, r, red) {
    let n = 0;
    for (let i = 0; i < 8; i++) {
      const h = HORSE8[i];
      const lc = c + h[2], lr = r + h[3];
      if (lc < 0 || lc > 8 || lr < 0 || lr > 9) continue;
      if (board[lr][lc]) continue;                 // can chan ma
      const cc = c + h[0], rr = r + h[1];
      if (cc < 0 || cc > 8 || rr < 0 || rr > 9) continue;
      const q = board[rr][cc];
      if (q && q.red === red) continue;
      n++;
    }
    return n;
  }

  /* ------------------------------------------------------------- danh gia the
     Tra ve diem theo GOC NHIN ben `red` (duong = ben do dang loi the).        */
  function evaluate(board, red) {
    let sc = 0;              // diem theo goc nhin ben DO
    let kR = false, kB = false;
    for (let r = 0; r < 10; r++) {
      const row = board[r];
      for (let c = 0; c < 9; c++) {
        const p = row[c];
        if (!p) continue;
        const ti = TI[p.t];
        if (ti === undefined) continue;
        const sq = r * 9 + c;
        let v = PV[ti] + PST[ti][p.red ? sq : MIRROR[sq]];
        if (ti === 4) v += MOB_R * rookMob(board, c, r, p.red);
        else if (ti === 5) v += MOB_C * cannonMob(board, c, r);
        else if (ti === 3) v += MOB_H * horseMob(board, c, r, p.red);
        else if (ti === 0) { if (p.red) kR = true; else kB = true; }
        sc += p.red ? v : -v;
      }
    }
    // phong ho: mat tuong = thua trang
    if (!kR && kB) sc = -MATE;
    else if (kR && !kB) sc = MATE;
    return red ? sc : -sc;
  }

  /* ------------------------------------------------------------ ma hoa nuoc di
     enc = (o_di * 90) + o_den   (0..8099); 0 duoc dung lam "khong co nuoc".   */
  function enc(mv) { return ((mv.fr * 9 + mv.fc) * 90) + (mv.tr * 9 + mv.tc); }

  /* --------------------------------------------------------- bang bam Zobrist */
  const TT_BITS = 18, TT_SIZE = 1 << TT_BITS, TT_MASK = TT_SIZE - 1;
  const ttKey = new Int32Array(TT_SIZE);   // nua cao cua khoa (kiem chung)
  const ttScr = new Int32Array(TT_SIZE);
  const ttMv = new Int32Array(TT_SIZE);
  const ttMeta = new Int32Array(TT_SIZE);  // ((depth+1) << 2) | flag ; 0 = trong
  const F_EXACT = 0, F_LOWER = 1, F_UPPER = 2;

  const ZL = new Int32Array(14 * 90), ZH = new Int32Array(14 * 90);
  let ZSL = 0, ZSH = 0;
  (function initZobrist() {
    let s = 0x9e3779b9 | 0;
    function xs32() {
      s ^= s << 13; s |= 0;
      s ^= s >>> 17;
      s ^= s << 5; s |= 0;
      return s;
    }
    for (let i = 0; i < 14 * 90; i++) { ZL[i] = xs32(); ZH[i] = xs32(); }
    ZSL = xs32(); ZSH = xs32();
  })();

  function pieceIdx(p) { return (TI[p.t] << 1) | (p.red ? 0 : 1); }

  let hLo = 0, hHi = 0;   // khoa bam the co hien tai trong luc tim kiem

  function computeHash(board, redToMove) {
    let lo = 0, hi = 0;
    for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (!p || TI[p.t] === undefined) continue;
      const k = pieceIdx(p) * 90 + r * 9 + c;
      lo ^= ZL[k]; hi ^= ZH[k];
    }
    if (redToMove) { lo ^= ZSL; hi ^= ZSH; }
    hLo = lo | 0; hHi = hi | 0;
  }

  // di quan + cap nhat khoa bam (nguoi goi tu luu/khoi phuc hLo,hHi)
  function makeMove(board, mv) {
    const p = board[mv.fr][mv.fc];
    const v = board[mv.tr][mv.tc];
    const fsq = mv.fr * 9 + mv.fc, tsq = mv.tr * 9 + mv.tc;
    const b = pieceIdx(p) * 90;
    hLo ^= ZL[b + fsq] ^ ZL[b + tsq] ^ ZSL;
    hHi ^= ZH[b + fsq] ^ ZH[b + tsq] ^ ZSH;
    if (v) {
      const vb = pieceIdx(v) * 90;
      hLo ^= ZL[vb + tsq]; hHi ^= ZH[vb + tsq];
    }
    return doMove(board, mv);
  }

  function toTT(s, ply) { return s > MATE_NEAR ? s + ply : (s < -MATE_NEAR ? s - ply : s); }
  function fromTT(s, ply) { return s > MATE_NEAR ? s - ply : (s < -MATE_NEAR ? s + ply : s); }

  /* ------------------------------------------------- trang thai mot lan tim */
  const history = new Int32Array(8100);
  const killers = new Int32Array(MAX_PLY * 2);
  let nodes = 0, deadline = 0, aborted = false;

  const _now = (typeof performance !== 'undefined' && performance && typeof performance.now === 'function')
    ? function () { return performance.now(); }
    : function () { return Date.now(); };

  function outOfTime() {
    if ((nodes & 1023) !== 0) return false;
    if (_now() >= deadline) { aborted = true; return true; }
    return false;
  }

  function addKiller(ply, e) {
    const i = ply << 1;
    if (killers[i] === e) return;
    killers[i + 1] = killers[i];
    killers[i] = e;
  }

  /* ------------------------------------------------------- sap xep nuoc di --
     Uu tien: nuoc cua bang bam -> an quan (MVV-LVA) -> killer -> lich su.     */
  function orderMoves(board, moves, ply, ttBest) {
    const n = moves.length;
    const sc = new Array(n);
    const k1 = killers[ply << 1], k2 = killers[(ply << 1) + 1];
    for (let i = 0; i < n; i++) {
      const mv = moves[i];
      const e = enc(mv);
      let s;
      const vic = board[mv.tr][mv.tc];
      if (e === ttBest) s = 1e7;
      else if (vic) {
        const att = board[mv.fr][mv.fc];
        s = 1e6 + (PV[TI[vic.t]] << 4) - PV[TI[att.t]];  // MVV-LVA
      } else if (e === k1) s = 9e5;
      else if (e === k2) s = 8e5;
      else s = history[e];
      sc[i] = s;
    }
    // sap xep chen (n nho, tranh cap phat ham so sanh)
    for (let i = 1; i < n; i++) {
      const s = sc[i], m = moves[i];
      let j = i - 1;
      while (j >= 0 && sc[j] < s) { sc[j + 1] = sc[j]; moves[j + 1] = moves[j]; j--; }
      sc[j + 1] = s; moves[j + 1] = m;
    }
  }

  function orderCaptures(board, moves) {
    const n = moves.length;
    const sc = new Array(n);
    for (let i = 0; i < n; i++) {
      const mv = moves[i];
      const vic = board[mv.tr][mv.tc];
      const att = board[mv.fr][mv.fc];
      sc[i] = vic ? (PV[TI[vic.t]] << 4) - PV[TI[att.t]] : 0;
    }
    for (let i = 1; i < n; i++) {
      const s = sc[i], m = moves[i];
      let j = i - 1;
      while (j >= 0 && sc[j] < s) { sc[j + 1] = sc[j]; moves[j + 1] = moves[j]; j--; }
      sc[j + 1] = s; moves[j + 1] = m;
    }
  }

  function hasHeavy(board, red) {
    for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p && p.red === red && (p.t === 'R' || p.t === 'C' || p.t === 'H')) return true;
    }
    return false;
  }

  /* ------------------------------------------------------- tim yen (quiescence)
     Chi xet nuoc AN QUAN (va nuoc go chieu) de tranh "chan troi" khi dung do sau. */
  function quiesce(board, side, alpha, beta, ply, qd) {
    if (aborted) return 0;
    nodes++;
    if (outOfTime()) return 0;
    if (ply >= MAX_PLY - 2) return evaluate(board, side);

    const check = inCheck(board, side);
    let best, moves;

    if (check && qd > 0) {
      moves = legalMoves(board, side);
      if (moves.length === 0) return -MATE + ply;   // bi chieu bi
      best = -INF;
    } else {
      best = evaluate(board, side);
      if (best >= beta) return best;
      if (best > alpha) alpha = best;
      if (check) return best;                       // het gia han chieu -> dung
      const all = legalMoves(board, side);
      moves = [];
      for (let i = 0; i < all.length; i++) if (board[all[i].tr][all[i].tc]) moves.push(all[i]);
      if (moves.length === 0) return best;
    }

    orderCaptures(board, moves);

    for (let i = 0; i < moves.length; i++) {
      const mv = moves[i];
      const vic = board[mv.tr][mv.tc];
      if (!check && vic && best + PV[TI[vic.t]] + DELTA_MARGIN < alpha) continue; // cat tia delta
      const cap = doMove(board, mv);
      const s = -quiesce(board, !side, -beta, -alpha, ply + 1, check ? qd - 1 : qd);
      undoMove(board, mv, cap);
      if (aborted) return 0;
      if (s > best) best = s;
      if (s > alpha) alpha = s;
      if (alpha >= beta) break;
    }
    return best;
  }

  /* -------------------------------------------------- minimax + alpha-beta -- */
  function negamax(board, side, depth, alpha, beta, ply, allowNull) {
    if (aborted) return 0;
    nodes++;
    if (outOfTime()) return 0;
    if (ply >= MAX_PLY - 2) return evaluate(board, side);

    const idx = (hLo >>> 0) & TT_MASK;
    let ttBest = 0;
    const meta = ttMeta[idx];
    if (meta !== 0 && ttKey[idx] === hHi) {
      ttBest = ttMv[idx];                              // luon dung de sap xep nuoc
      // chi cat theo diem da luu o nut KHONG-PV (cua so hep) cho khoi sai lech
      if (ply > 0 && beta - alpha <= 1 && ((meta >> 2) - 1) >= depth) {
        const s = fromTT(ttScr[idx], ply);
        const fl = meta & 3;
        if (fl === F_EXACT) return s;
        if (fl === F_LOWER && s >= beta) return s;
        if (fl === F_UPPER && s <= alpha) return s;
      }
    }

    const check = inCheck(board, side);
    let d = depth;
    if (check && ply < 40) d++;                       // gia han khi bi chieu

    if (d <= 0) return quiesce(board, side, alpha, beta, ply, Q_CHECK_MAX);

    // cat tia nuoc rong (null move): bo luot ma van con hon beta -> cat
    if (allowNull && !check && d >= 3 && beta < MATE_NEAR && beta > -MATE_NEAR
        && hasHeavy(board, side) && !kingsFace(board)) {
      const sLo = hLo, sHi = hHi;
      hLo ^= ZSL; hHi ^= ZSH;
      const R = d > 6 ? 3 : 2;
      const s = -negamax(board, !side, d - 1 - R, -beta, -beta + 1, ply + 1, false);
      hLo = sLo; hHi = sHi;
      if (aborted) return 0;
      if (s >= beta) return s < MATE_NEAR ? s : beta;
    }

    const moves = legalMoves(board, side);
    if (moves.length === 0) return -MATE + ply;        // het nuoc di = THUA

    orderMoves(board, moves, ply, ttBest);

    const alpha0 = alpha;
    let best = -INF, bestE = 0;

    for (let i = 0; i < moves.length; i++) {
      const mv = moves[i];
      const sLo = hLo, sHi = hHi;
      const cap = makeMove(board, mv);
      let s;
      if (i === 0) {
        s = -negamax(board, !side, d - 1, -beta, -alpha, ply + 1, true);
      } else {
        s = -negamax(board, !side, d - 1, -alpha - 1, -alpha, ply + 1, true);
        if (!aborted && s > alpha && s < beta) {
          s = -negamax(board, !side, d - 1, -beta, -alpha, ply + 1, true);
        }
      }
      undoMove(board, mv, cap);
      hLo = sLo; hHi = sHi;
      if (aborted) return 0;

      if (s > best) { best = s; bestE = enc(mv); }
      if (s > alpha) alpha = s;
      if (alpha >= beta) {
        if (!cap) {
          const e = enc(mv);
          addKiller(ply, e);
          const h = history[e] + d * d;
          history[e] = h > 1e8 ? 1e8 : h;             // chan tran so
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

  /* --------------------------------------------------------------- goc (root) */
  function cp(mv) { return { fc: mv.fc, fr: mv.fr, tc: mv.tc, tr: mv.tr }; }

  function searchBest(board, red, opts) {
    opts = opts || {};
    const timeMs = (typeof opts.timeMs === 'number' && opts.timeMs > 0) ? opts.timeMs : 900;
    const maxDepth = Math.max(1, Math.min(
      (typeof opts.depth === 'number' && opts.depth > 0) ? Math.floor(opts.depth) : 8, MAX_PLY - 8));
    const noise = Math.max(0, Math.min(1, typeof opts.rand === 'number' ? opts.rand : 0));

    const rootMoves = legalMoves(board, red);
    if (!rootMoves || rootMoves.length === 0) return null;   // het nuoc = thua
    if (rootMoves.length === 1) return cp(rootMoves[0]);

    nodes = 0; aborted = false;
    const t0 = _now();
    deadline = t0 + timeMs;
    history.fill(0); killers.fill(0);
    computeHash(board, red);

    // danh sach nuoc goc + diem cua lan lap gan nhat
    const list = new Array(rootMoves.length);
    for (let i = 0; i < rootMoves.length; i++) {
      const mv = rootMoves[i];
      const vic = board[mv.tr][mv.tc];
      list[i] = {
        mv: mv,
        sc: vic ? PV[TI[vic.t]] : 0,   // sap xep tho cho lan lap dau
        depth: 0,
        exact: false
      };
    }
    list.sort(function (a, b) { return b.sc - a.sc; });

    let bestMv = list[0].mv, bestSc = -INF, doneDepth = 0;

    for (let d = 1; d <= maxDepth; d++) {
      if (d > 1 && (_now() - t0) > timeMs * 0.55) break;   // khong kip lam sau nua

      let alpha = -INF;
      let iterBest = null, iterSc = -INF;

      for (let i = 0; i < list.length; i++) {
        const it = list[i];
        const sLo = hLo, sHi = hHi;
        const cap = makeMove(board, it.mv);
        let s;
        if (i === 0) {
          s = -negamax(board, !red, d - 1, -INF, -alpha, 1, true);
          it.exact = true;
        } else {
          s = -negamax(board, !red, d - 1, -alpha - 1, -alpha, 1, true);
          if (!aborted && s > alpha) {
            s = -negamax(board, !red, d - 1, -INF, -alpha, 1, true);
            it.exact = true;
          } else {
            it.exact = false;    // chi la CAN TREN (fail-low)
          }
        }
        undoMove(board, it.mv, cap);
        hLo = sLo; hHi = sHi;
        if (aborted) break;

        it.sc = s; it.depth = d;
        if (s > iterSc) { iterSc = s; iterBest = it.mv; }
        if (s > alpha) alpha = s;
      }

      if (iterBest && iterSc > -INF) { bestMv = iterBest; bestSc = iterSc; doneDepth = d; }
      if (aborted) break;

      list.sort(function (a, b) { return b.sc - a.sc; });
      if (bestSc >= MATE_NEAR) break;    // da thay duong chieu bi
    }

    if (noise <= 0 || doneDepth === 0) return cp(bestMv);

    /* --- them nhieu nho: chon ngau nhien trong nhom nuoc "gan bang nhau" --- */
    const margin = Math.round(10 + noise * 90);        // toi da ~ 1 con tot
    const lo = bestSc - margin;
    const pool = [];
    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      if (it.depth !== doneDepth || it.sc < lo) continue;
      pool.push(it);
    }
    if (pool.length <= 1) return cp(bestMv);

    // nuoc fail-low chi co CAN TREN -> tim lai voi cua so (lo-1, +vc) cho chac
    aborted = false;
    deadline = _now() + Math.min(timeMs * 0.3, 250);
    const ok = [];
    for (let i = 0; i < pool.length; i++) {
      const it = pool[i];
      if (it.exact) { ok.push(it); continue; }
      if (aborted) continue;
      const sLo = hLo, sHi = hHi;
      const cap = makeMove(board, it.mv);
      const s = -negamax(board, !red, doneDepth - 1, -INF, -(lo - 1), 1, true);
      undoMove(board, it.mv, cap);
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

  return { evaluate: evaluate, searchBest: searchBest };
})();

/* Diem the co theo goc nhin ben `red` (duong = ben `red` dang loi the). */
export function evaluate(board, red) { return _AI.evaluate(board, red); }

/* Tim nuoc tot nhat cho ben `red`.
   opts = { depth: so tang toi da (mac dinh 8),
            timeMs: chan thoi gian ms (mac dinh 900),
            rand: 0..1 do ngau nhien (mac dinh 0) }
   Tra ve {fc,fr,tc,tr} hoac null neu het nuoc di (thua). */
export function searchBest(board, red, opts) { return _AI.searchBest(board, red, opts); }
