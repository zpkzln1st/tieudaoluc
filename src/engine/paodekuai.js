// ============================================================
// TRUNG QUỐC PHAO ĐẮC KHOÁI (中国跑得快) — engine luật + AI. THUẦN, không đụng DOM.
// Bê từ mockup đã kiểm: _mockup/pdk_engine.js (66/66 phép thử + 300 ván mô phỏng xanh).
// Bản "kinh điển 16 lá" 3 người, theo bảng luật user chốt 2026-07-29.
//
// ⚠ MÃ LÁ DÙNG CHUNG VỚI TIẾN LÊN (không phải bảng poker của Binh Xập Xám):
//   bậc = c>>2 (0=Ba … 11=Ách, 12=Hai) · chất = c&3. Thứ tự 3 < … < A < 2.
//   KHÁC Tiến Lên: **CHẤT KHÔNG TÍNH** khi so bài.
// BỘ 48 LÁ: bỏ 2 joker · bỏ ba lá Hai (giữ 2♠) · bỏ A♠. Người cầm 3♥ đi trước.
// ============================================================
'use strict';

var BAC_TEN = ['Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Bồi', 'Đầm', 'Già', 'Ách', 'Hai'];
var BAC_KY = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
var CHAT_TEN = ['Bích', 'Chuồn', 'Rô', 'Cơ'];
var HAI = 12;                 // bậc của lá Hai — cao nhất, và bị CẤM nằm trong sảnh
var BA_CO = 3;                // 3♥ = bậc 0, chất 3 -> mã 3. Người cầm lá này đi trước.

// ---- LUẬT CHỐT (user chọn 2026-07-29) ----
var KEM_MOI_BO = 2;           // ba kèm HAI · máy bay mỗi bộ ba kèm 2 lá (2 bộ -> 4 lá lẻ)
var TU_QUY_KEM = 3;           // tứ quý kèm BA lá, và khi kèm thì KHÔNG còn là bom
// Nhà kế còn 1 lá thì KHÔNG được bỏ lượt nếu còn nước chặn (bình thường bỏ lượt tự do).
var EP_CHAN_CUA = true;
// ⚠ Có ÉP luôn phải đánh lá lẻ LỚN NHẤT không? Để `true` thì người chơi không thể phạm lỗi
// "thả người về" nữa, và luật đền thay bên dưới thành mã chết (đo 300 ván: 0 lần xảy ra).
// Để `false` thì người chơi tự chọn — chọn sai thì ăn phạt, đúng tinh thần 放走包赔.
var EP_LA_LON_NHAT = false;
var PHAT_THA_VE = true;       // thả người về thì đền thay nhà thứ ba

function bacOf(c) { return c >> 2; }
function chatOf(c) { return c & 3; }
function cardKy(c) { return BAC_KY[bacOf(c)]; }
function cardTen(c) { return BAC_TEN[bacOf(c)] + ' ' + CHAT_TEN[chatOf(c)]; }

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/** Bộ 48 lá: bỏ A♠ (44) và ba lá Hai ♣♦♥ (49,50,51). */
function boBai() {
  var d = [];
  for (var c = 0; c < 52; c++) {
    if (c === 44 || c === 49 || c === 50 || c === 51) continue;
    d.push(c);
  }
  return d;
}

/** Chia 3 tay × 16 lá, đã sắp tăng dần. Trả { tay, diTruoc }. */
function deal(rnd) {
  rnd = rnd || Math.random;
  var d = boBai();
  for (var i = d.length - 1; i > 0; i--) {
    var j = (rnd() * (i + 1)) | 0;
    var t = d[i]; d[i] = d[j]; d[j] = t;
  }
  var tay = [d.slice(0, 16), d.slice(16, 32), d.slice(32, 48)];
  tay.forEach(function (h) { h.sort(function (a, b) { return a - b; }); });
  var diTruoc = 0;
  for (var s = 0; s < 3; s++) if (tay[s].indexOf(BA_CO) >= 0) diTruoc = s;
  return { tay: tay, diTruoc: diTruoc };
}

// ---------- phân loại bộ bài ----------
function demBac(cards) {
  var dem = {};
  for (var i = 0; i < cards.length; i++) {
    var b = bacOf(cards[i]);
    dem[b] = (dem[b] || 0) + 1;
  }
  return dem;
}
function khoaSort(dem) {
  return Object.keys(dem).map(Number).sort(function (a, b) { return a - b; });
}
function lienTiep(ks) {
  for (var i = 1; i < ks.length; i++) if (ks[i] !== ks[i - 1] + 1) return false;
  return true;
}

/**
 * Nhận diện bộ bài. Trả { loai, n, hi, soBo } hoặc null nếu không hợp lệ.
 *   loai: don · doi · ba · baKem · sanh · doiThong · mayBay · mayBayCanh · bom · tuQuyKem
 *   hi  : bậc CHÍNH để so lớn nhỏ (bộ ba/tứ quý/đỉnh sảnh) — lá kèm KHÔNG tính.
 * ⚠ `ba` (ba lá trơn) chỉ được đánh khi là toàn bộ bài còn lại — luật đó nằm ở genMoves,
 *   không nằm ở đây, vì hàm này chỉ nói "bộ này là bộ gì".
 */
function classify(cards) {
  if (!cards || !cards.length) return null;
  var n = cards.length, dem = demBac(cards), ks = khoaSort(dem);
  var i, k;

  // toàn bộ cùng một bậc
  if (ks.length === 1) {
    if (n === 1) return { loai: 'don', n: 1, hi: ks[0] };
    if (n === 2) return { loai: 'doi', n: 2, hi: ks[0] };
    if (n === 3) return { loai: 'ba', n: 3, hi: ks[0] };
    if (n === 4) return { loai: 'bom', n: 4, hi: ks[0] };
    return null;
  }

  var moiBac1 = true, moiBac2 = true, moiBac3 = true;
  for (i = 0; i < ks.length; i++) {
    if (dem[ks[i]] !== 1) moiBac1 = false;
    if (dem[ks[i]] !== 2) moiBac2 = false;
    if (dem[ks[i]] !== 3) moiBac3 = false;
  }
  var dinh = ks[ks.length - 1], noiNhau = lienTiep(ks);

  // sảnh: >=5 lá, mỗi bậc đúng 1, liên tiếp, KHÔNG chứa lá Hai
  if (n >= 5 && moiBac1 && noiNhau && dinh < HAI) return { loai: 'sanh', n: n, hi: dinh };
  // đôi thông: >=2 đôi liên tiếp (lá Hai chỉ có một nên tự nó không vào được)
  if (moiBac2 && ks.length >= 2 && noiNhau && dinh < HAI) return { loai: 'doiThong', n: n, soBo: ks.length, hi: dinh };
  // máy bay trơn: >=2 bộ ba liên tiếp
  if (moiBac3 && ks.length >= 2 && noiNhau) return { loai: 'mayBay', n: n, soBo: ks.length, hi: dinh };

  // ba kèm hai
  if (n === 3 + KEM_MOI_BO) {
    for (i = 0; i < ks.length; i++) if (dem[ks[i]] === 3) return { loai: 'baKem', n: n, hi: ks[i] };
    return null;
  }
  // tứ quý kèm ba — kèm rồi thì KHÔNG còn là bom nữa
  if (n === 4 + TU_QUY_KEM) {
    for (i = 0; i < ks.length; i++) if (dem[ks[i]] === 4) return { loai: 'tuQuyKem', n: n, hi: ks[i] };
    // 7 lá cũng có thể là sảnh 7 — đã bắt ở trên rồi
    return null;
  }
  // máy bay có cánh: k bộ ba liên tiếp + k*KEM_MOI_BO lá lẻ
  if (n % (3 + KEM_MOI_BO) === 0) {
    var soBo = n / (3 + KEM_MOI_BO);
    if (soBo >= 2) {
      var du = [];                                  // các bậc có ÍT NHẤT 3 lá
      for (i = 0; i < ks.length; i++) if (dem[ks[i]] >= 3) du.push(ks[i]);
      for (i = 0; i + soBo <= du.length; i++) {
        var cua = du.slice(i, i + soBo);
        if (!lienTiep(cua)) continue;
        // đủ chỗ cho cánh: tổng lá trừ 3*soBo phải đúng bằng soBo*KEM_MOI_BO (luôn đúng vì n cố định)
        return { loai: 'mayBayCanh', n: n, soBo: soBo, hi: cua[cua.length - 1] };
      }
    }
  }
  return null;
}

/**
 * `a` có đè được `b` không. `b` null nghĩa là đang mở vòng — đánh gì cũng được.
 * ⚠ Bom chặn MỌI bài thường; bom so với bom thì so bậc. Tứ quý KÈM BÀI không phải bom.
 * Bài thường: phải CÙNG LOẠI và CÙNG SỐ LÁ, rồi mới so bậc chính.
 */
function beats(a, b) {
  if (!a) return false;
  if (!b) return true;
  if (a.loai === 'bom' && b.loai !== 'bom') return true;
  if (a.loai !== 'bom' && b.loai === 'bom') return false;
  if (a.loai !== b.loai) return false;
  if (a.n !== b.n) return false;
  return a.hi > b.hi;
}

// ---------- sinh nước đi ----------
function theoBac(hand) {
  var m = {};
  for (var i = 0; i < hand.length; i++) {
    var b = bacOf(hand[i]);
    (m[b] || (m[b] = [])).push(hand[i]);
  }
  return m;
}
/** Chọn k lá lẻ từ `con`, KHÔNG đụng vào các bậc trong `cam`. Trả mảng các tổ hợp. */
function chonKem(con, cam, k) {
  var pool = con.filter(function (c) { return cam.indexOf(bacOf(c)) < 0; });
  var out = [];
  (function rec(start, cur) {
    if (cur.length === k) { out.push(cur.slice()); return; }
    for (var i = start; i < pool.length; i++) { cur.push(pool[i]); rec(i + 1, cur); cur.pop(); }
  })(0, []);
  return out;
}
function boDi(hand, cards) {
  var h = hand.slice();
  for (var i = 0; i < cards.length; i++) h.splice(h.indexOf(cards[i]), 1);
  return h;
}

/**
 * Mọi nước đi hợp lệ. `cur` null = mở vòng.
 * opt.chanCua = true (nhà kế còn 1 lá): nếu đánh BÀI LẺ thì buộc phải là lá lẻ LỚN NHẤT trong tay —
 *   đánh lá nhỏ cho người ta về là dính luật đền thay (放走包赔).
 * ⚠ Ba lá trơn CHỈ hợp lệ khi đó là toàn bộ bài còn lại.
 */
function genMoves(hand, cur, opt) {
  opt = opt || {};
  var m = theoBac(hand), ks = Object.keys(m).map(Number).sort(function (a, b) { return a - b; });
  var out = [], i, j, k;

  function them(cards) {
    var dg = classify(cards);
    if (!dg) return;
    if (dg.loai === 'ba' && cards.length !== hand.length) return;   // ba lá trơn: chỉ khi là bài cuối
    if (!beats(dg, cur)) return;
    out.push({ cards: cards.slice().sort(function (a, b) { return a - b; }), dg: dg });
  }

  // đơn / đôi / ba / bom theo từng bậc
  for (i = 0; i < ks.length; i++) {
    var g = m[ks[i]];
    them([g[0]]);
    if (g.length >= 2) them([g[0], g[1]]);
    if (g.length >= 3) them([g[0], g[1], g[2]]);
    if (g.length >= 4) them([g[0], g[1], g[2], g[3]]);
  }
  // ba kèm hai
  for (i = 0; i < ks.length; i++) {
    if (m[ks[i]].length < 3) continue;
    var bo3 = m[ks[i]].slice(0, 3);
    var ke2 = chonKem(boDi(hand, bo3), [ks[i]], KEM_MOI_BO);
    for (j = 0; j < ke2.length; j++) them(bo3.concat(ke2[j]));
  }
  // tứ quý kèm ba
  for (i = 0; i < ks.length; i++) {
    if (m[ks[i]].length < 4) continue;
    var bo4 = m[ks[i]].slice(0, 4);
    var ke3 = chonKem(boDi(hand, bo4), [ks[i]], TU_QUY_KEM);
    for (j = 0; j < ke3.length; j++) them(bo4.concat(ke3[j]));
  }
  // sảnh (>=5 bậc liên tiếp, không chứa Hai)
  for (i = 0; i < ks.length; i++) {
    var run = [ks[i]];
    for (j = i + 1; j < ks.length && ks[j] === ks[j - 1] + 1; j++) run.push(ks[j]);
    for (k = 5; k <= run.length; k++) {
      for (var s = 0; s + k <= run.length; s++) {
        var cua = run.slice(s, s + k);
        if (cua[cua.length - 1] >= HAI) continue;
        them(cua.map(function (b) { return m[b][0]; }));
      }
    }
    i = i + run.length - 1;
  }
  // đôi thông + máy bay + máy bay có cánh: quét cửa sổ trên các bậc đủ số lá
  function cuaSo(minSo, fn) {
    var du = ks.filter(function (b) { return m[b].length >= minSo; });
    for (var a = 0; a < du.length; a++) {
      var run2 = [du[a]];
      for (var b2 = a + 1; b2 < du.length && du[b2] === du[b2 - 1] + 1; b2++) run2.push(du[b2]);
      for (var w = 2; w <= run2.length; w++) {
        for (var s2 = 0; s2 + w <= run2.length; s2++) fn(run2.slice(s2, s2 + w));
      }
      a = a + run2.length - 1;
    }
  }
  cuaSo(2, function (cua) {
    if (cua[cua.length - 1] >= HAI) return;
    var cs = [];
    cua.forEach(function (b) { cs.push(m[b][0], m[b][1]); });
    them(cs);
  });
  cuaSo(3, function (cua) {
    var cs = [];
    cua.forEach(function (b) { cs.push(m[b][0], m[b][1], m[b][2]); });
    them(cs);                                            // máy bay trơn
    var canh = chonKem(boDi(hand, cs), cua, cua.length * KEM_MOI_BO);
    for (var x = 0; x < canh.length && x < 400; x++) them(cs.concat(canh[x]));
  });

  // Chặn cửa: nếu đánh bài lẻ thì phải là lá lẻ LỚN NHẤT trong tay.
  if (EP_LA_LON_NHAT && opt.chanCua) {
    var caoNhat = -1;
    for (i = 0; i < hand.length; i++) caoNhat = Math.max(caoNhat, bacOf(hand[i]));
    out = out.filter(function (mv) { return mv.dg.loai !== 'don' || mv.dg.hi === caoNhat; });
  }
  return out;
}

/** Có được BỎ LƯỢT không. Chặn cửa mà còn nước chặn thì không được bỏ. */
function duocBo(hand, cur, opt) {
  if (!cur) return false;                                // đang mở vòng thì phải đánh
  if (!EP_CHAN_CUA || !(opt && opt.chanCua)) return true;
  return genMoves(hand, cur, opt).length === 0;
}

// ---------- ước lượng số lượt còn phải đánh (cho AI) ----------
/** Tháo bài kiểu tham lam: bom -> máy bay -> sảnh -> đôi thông -> ba -> đôi -> lẻ. */
function uocLuot(hand) {
  var dem = demBac(hand), luot = 0, b;
  function co(bac, so) { return (dem[bac] || 0) >= so; }
  function tru(bac, so) { dem[bac] -= so; }
  for (b = 12; b >= 0; b--) if (co(b, 4)) { tru(b, 4); luot++; }
  for (b = 0; b <= 12; b++) {                            // máy bay
    var w = 0; while (co(b + w, 3)) w++;
    if (w >= 2) { for (var i = 0; i < w; i++) tru(b + i, 3); luot++; b += w - 1; }
  }
  for (b = 0; b <= 12 - 4; b++) {                        // sảnh >=5
    var w2 = 0; while (b + w2 < HAI && co(b + w2, 1)) w2++;
    if (w2 >= 5) { for (var j = 0; j < w2; j++) tru(b + j, 1); luot++; b += w2 - 1; }
  }
  for (b = 0; b <= 12; b++) {                            // đôi thông >=2
    var w3 = 0; while (b + w3 < HAI && co(b + w3, 2)) w3++;
    if (w3 >= 2) { for (var k = 0; k < w3; k++) tru(b + k, 2); luot++; b += w3 - 1; }
  }
  for (b = 0; b <= 12; b++) {
    while (co(b, 3)) { tru(b, 3); luot++; }
    while (co(b, 2)) { tru(b, 2); luot++; }
    while (co(b, 1)) { tru(b, 1); luot++; }
  }
  return luot;
}

/**
 * AI chọn nước. `ctx = { conLai: [số lá của 3 nhà], toi, chanCua, kho }`.
 * `kho` 0..1 — độ khó, càng cao càng ít đánh ngẫu nhiên.
 */
function aiPick(hand, cur, ctx, rnd) {
  ctx = ctx || {}; rnd = rnd || Math.random;
  var mv = genMoves(hand, cur, { chanCua: ctx.chanCua });
  if (!mv.length) return null;
  if (cur && duocBo(hand, cur, { chanCua: ctx.chanCua }) === false) {
    // buộc phải đánh — cứ chấm điểm bình thường, chỉ là không được trả null
  }
  var kho = ctx.kho == null ? 0.75 : ctx.kho;
  var gapNguy = false;                                   // có nhà nào sắp về không
  if (ctx.conLai) for (var i = 0; i < ctx.conLai.length; i++) {
    if (i !== ctx.toi && ctx.conLai[i] > 0 && ctx.conLai[i] <= 2) gapNguy = true;
  }
  var best = null, bestSc = -1e9;
  for (var k = 0; k < mv.length; k++) {
    var m = mv[k], con = boDi(hand, m.cards);
    var sc = -uocLuot(con) * 10 - con.length * 0.35;
    if (con.length === 0) sc += 1000;                    // về được thì về ngay
    if (m.dg.loai === 'bom') sc -= gapNguy ? 4 : 26;     // giữ bom, trừ khi phải chặn gấp
    if (m.dg.hi === HAI) sc -= gapNguy ? 2 : 9;          // giữ lá Hai
    if (m.dg.loai === 'don' && m.dg.hi >= 10) sc -= 4;   // đừng phá lá lẻ lớn sớm
    if (!cur) sc += m.cards.length * 0.5;                // mở vòng thì đẩy được nhiều lá càng tốt
    if (gapNguy && cur) sc += 6;                         // đang phải chặn thì cứ chặn
    sc += rnd() * (1 - kho) * 14;
    if (sc > bestSc) { bestSc = sc; best = m; }
  }
  // được phép bỏ lượt mà nước tốt nhất vẫn tệ thì bỏ
  if (cur && duocBo(hand, cur, { chanCua: ctx.chanCua })) {
    var giu = uocLuot(hand) * 10 + hand.length * 0.35;
    if (-bestSc > -(-giu) + 6 && rnd() < kho) return null;
  }
  return best;
}

/**
 * Chấm điểm cuối ván.
 *   nguoiVe   — ai về nhất
 *   conLai[i] — số lá còn trên tay
 *   chuaDanh[i] — chưa đánh được lượt nào (bị khoá cửa) -> điểm thua NHÂN ĐÔI
 *   bom[i]    — số lần đánh bom thành công -> mỗi lần ăn 5 điểm từ MỖI đối thủ
 *   thaVe     — chỉ số nhà bị bắt lỗi "thả người về" (hoặc -1)
 * Trả mảng điểm 3 nhà, tổng luôn bằng 0.
 */
function ketSo(nguoiVe, conLai, chuaDanh, bom, thaVe) {
  var d = [0, 0, 0], i, j;
  for (i = 0; i < 3; i++) {
    if (i === nguoiVe) continue;
    var mat = conLai[i] * (chuaDanh[i] ? 2 : 1);
    d[i] -= mat; d[nguoiVe] += mat;
  }
  // đền thay: nhà thả người về gánh luôn phần của nhà thứ ba
  if (PHAT_THA_VE && thaVe != null && thaVe >= 0) {
    for (i = 0; i < 3; i++) {
      if (i === nguoiVe || i === thaVe) continue;
      var chuyen = conLai[i] * (chuaDanh[i] ? 2 : 1);
      d[i] += chuyen; d[thaVe] -= chuyen;
    }
  }
  // thưởng bom: mỗi quả ăn 5 điểm từ mỗi đối thủ
  if (bom) for (i = 0; i < 3; i++) {
    for (j = 0; j < 3; j++) {
      if (i === j || !bom[i]) continue;
      d[i] += 5 * bom[i]; d[j] -= 5 * bom[i];
    }
  }
  return d;
}

function tenBo(dg) {
  if (!dg) return '';
  var b = BAC_TEN[dg.hi];
  switch (dg.loai) {
    case 'don': return 'lá ' + b;
    case 'doi': return 'đôi ' + b;
    case 'ba': return '3 lá ' + b;
    case 'baKem': return '3 lá ' + b + ' kèm ' + KEM_MOI_BO;
    case 'sanh': return 'sảnh ' + dg.n + ' lá đến ' + b;
    case 'doiThong': return dg.soBo + ' đôi thông đến ' + b;
    case 'mayBay': return 'máy bay ' + dg.soBo + ' bộ đến ' + b;
    case 'mayBayCanh': return 'máy bay ' + dg.soBo + ' bộ có cánh, đến ' + b;
    case 'bom': return 'bom tứ quý ' + b;
    case 'tuQuyKem': return 'tứ quý ' + b + ' kèm ' + TU_QUY_KEM;
  }
  return '';
}

export {
  BAC_TEN, BAC_KY, CHAT_TEN, HAI, BA_CO,
  KEM_MOI_BO, TU_QUY_KEM, EP_CHAN_CUA, EP_LA_LON_NHAT, PHAT_THA_VE,
  bacOf, chatOf, cardKy, cardTen,
  mulberry32, boBai, deal,
  classify, beats, genMoves, duocBo, uocLuot, aiPick, ketSo, tenBo,
};
