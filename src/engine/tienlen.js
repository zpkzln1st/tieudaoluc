// ============================================================
// TIẾN LÊN MIỀN NAM — engine luật + AI (THUẦN, không đụng DOM).
// Gán vào window.TL. Dùng chung cho mockup và (về sau) src/engine/tienlen.js.
//
// MÃ LÁ BÀI: một số nguyên 0..51
//   bậc  = c >> 2   (0=Ba, 1=Bốn … 8=Bồi, 9=Đầm, 10=Già, 11=Ách, 12=Heo)
//   chất = c & 3    (0=Bích, 1=Chuồn, 2=Rô, 3=Cơ)  — Bích < Chuồn < Rô < Cơ
//   ⇒ so hai lá chỉ cần so thẳng mã số. Ba Bích = 0 (lá nhỏ nhất), Heo Cơ = 51 (lá lớn nhất).
// ============================================================
// Bản MODULE cho game thật (mockup: _mockup/tienlen_engine.js). THUẦN — không đụng DOM.


var RANK_TEN = ['Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Bồi', 'Đầm', 'Già', 'Ách', 'Heo'];
var RANK_KY = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
var SUIT_TEN = ['Bích', 'Chuồn', 'Rô', 'Cơ'];

function rankOf(c) { return c >> 2; }
function suitOf(c) { return c & 3; }
function cardTen(c) { return RANK_TEN[rankOf(c)] + ' ' + SUIT_TEN[suitOf(c)]; }
function cardKy(c) { return RANK_KY[rankOf(c)]; }

// ---------- bộ bài + chia bài ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Chia 52 lá cho 4 cửa, mỗi cửa 13 lá đã xếp sẵn. rnd = hàm trả 0..1. */
function deal(rnd) {
  var d = [], i, j, t;
  for (i = 0; i < 52; i++) d.push(i);
  for (i = 51; i > 0; i--) { j = Math.floor(rnd() * (i + 1)); t = d[i]; d[i] = d[j]; d[j] = t; }
  var hands = [[], [], [], []];
  for (i = 0; i < 52; i++) hands[i & 3].push(d[i]);
  for (i = 0; i < 4; i++) hands[i].sort(function (a, b) { return a - b; });
  return hands;
}

// ---------- nhận dạng bộ bài ----------
// Trả { loai, so, hi, bac, doi } hoặc null nếu không phải bộ hợp lệ.
//   loai ∈ 'rac' | 'doi' | 'ba' | 'tuQuy' | 'sanh' | 'doiThong'
//   so   = số lá · hi = mã lá lớn nhất · bac = bậc lá lớn nhất · doi = số đôi (chỉ doiThong)
function classify(cards) {
  var n = cards.length;
  if (!n) return null;
  var cs = cards.slice().sort(function (a, b) { return a - b; });
  var i, rs = [];
  for (i = 0; i < n; i++) rs.push(rankOf(cs[i]));
  var hi = cs[n - 1], bacHi = rs[n - 1];

  // cùng bậc: rác / đôi / ba / tứ quý
  var same = true;
  for (i = 1; i < n; i++) if (rs[i] !== rs[0]) { same = false; break; }
  if (same) {
    if (n === 1) return { loai: 'rac', so: 1, hi: hi, bac: bacHi };
    if (n === 2) return { loai: 'doi', so: 2, hi: hi, bac: bacHi };
    if (n === 3) return { loai: 'ba', so: 3, hi: hi, bac: bacHi };
    if (n === 4) return { loai: 'tuQuy', so: 4, hi: hi, bac: bacHi };
    return null;
  }

  // sảnh: ≥3 lá bậc liên tiếp, KHÔNG được có Heo
  if (n >= 3 && bacHi < 12) {
    var ok = true;
    for (i = 1; i < n; i++) if (rs[i] !== rs[i - 1] + 1) { ok = false; break; }
    if (ok) return { loai: 'sanh', so: n, hi: hi, bac: bacHi };
  }

  // đôi thông: ≥3 đôi bậc liên tiếp, KHÔNG được có Heo
  if (n >= 6 && n % 2 === 0 && bacHi < 12) {
    var ok2 = true;
    for (i = 0; i < n; i += 2) {
      if (rs[i] !== rs[i + 1]) { ok2 = false; break; }
      if (i > 0 && rs[i] !== rs[i - 2] + 1) { ok2 = false; break; }
    }
    if (ok2) return { loai: 'doiThong', so: n, doi: n / 2, hi: hi, bac: bacHi };
  }
  return null;
}

function laHeoLe(b) { return b.loai === 'rac' && b.bac === 12; }
function laHeoDoi(b) { return b.loai === 'doi' && b.bac === 12; }
function laHeoBa(b) { return b.loai === 'ba' && b.bac === 12; }

/** a có đè được b không? b = null nghĩa là đang được đánh tự do. */
function beats(a, b) {
  if (!a) return false;
  if (!b) return true;
  if (a.loai === b.loai && a.so === b.so) return a.hi > b.hi;   // đè thường: cùng loại, cùng số lá
  // --- hàng chặt ---
  if (a.loai === 'tuQuy') {
    if (laHeoLe(b) || laHeoDoi(b)) return true;
    if (b.loai === 'doiThong' && b.doi === 3) return true;
    return false;
  }
  if (a.loai === 'doiThong' && a.doi === 3) return laHeoLe(b);
  if (a.loai === 'doiThong' && a.doi === 4) {
    if (laHeoLe(b) || laHeoDoi(b) || laHeoBa(b)) return true;
    if (b.loai === 'tuQuy') return true;
    if (b.loai === 'doiThong' && b.doi === 3) return true;
    return false;
  }
  return false;
}

/** Bộ này có phải hàng chặt không (dùng để cảnh báo thối + AI tiếc của). */
function laHangChat(b) {
  return !!b && (b.loai === 'tuQuy' || (b.loai === 'doiThong' && b.doi >= 3));
}

// Đọc lên phải nghe như người ta nói ở bàn bài: "ba Ba" là bậy, phải là "3 lá Ba".
function tenBo(b) {
  if (!b) return '';
  if (b.loai === 'rac') return cardTen(b.hi);
  if (b.loai === 'doi') return 'đôi ' + RANK_TEN[b.bac];
  if (b.loai === 'ba') return '3 lá ' + RANK_TEN[b.bac];
  if (b.loai === 'tuQuy') return 'tứ quý ' + RANK_TEN[b.bac];
  if (b.loai === 'sanh') return 'sảnh ' + b.so + ' lá đến ' + RANK_TEN[b.bac];
  if (b.loai === 'doiThong') return b.doi + ' đôi thông đến ' + RANK_TEN[b.bac];
  return '';
}

// ---------- gom lá theo bậc ----------
function theoBac(hand) {
  var m = [], i;
  for (i = 0; i < 13; i++) m.push([]);
  for (i = 0; i < hand.length; i++) m[rankOf(hand[i])].push(hand[i]);
  for (i = 0; i < 13; i++) m[i].sort(function (a, b) { return a - b; });
  return m;
}

function toHop(arr, k) {   // mọi tổ hợp chọn k phần tử
  var out = [];
  (function rec(start, cur) {
    if (cur.length === k) { out.push(cur.slice()); return; }
    for (var i = start; i < arr.length; i++) { cur.push(arr[i]); rec(i + 1, cur); cur.pop(); }
  })(0, []);
  return out;
}

// ---------- sinh nước đi ----------
/**
 * Mọi bộ trong `hand` đè được `cur`. Trả mảng { cards, bo }.
 * Với sảnh và đôi thông chỉ sinh biến thể "rẻ nhất" (lá thấp nhất mỗi bậc) cộng thêm
 * biến thể đổi lá ở bậc cuối — đủ để tìm nước nhỏ nhất mà không nổ tổ hợp.
 */
function genMoves(hand, cur) {
  var bac = theoBac(hand), out = [], i, j, k, g;

  function them(cards) {
    var bo = classify(cards);
    if (bo && beats(bo, cur)) out.push({ cards: cards.slice().sort(function (a, b) { return a - b; }), bo: bo });
  }

  // rác · đôi · ba · tứ quý
  for (i = 0; i < 13; i++) {
    g = bac[i];
    if (!g.length) continue;
    for (j = 0; j < g.length; j++) them([g[j]]);
    if (g.length >= 2) { var d = toHop(g, 2); for (j = 0; j < d.length; j++) them(d[j]); }
    if (g.length >= 3) { var t = toHop(g, 3); for (j = 0; j < t.length; j++) them(t[j]); }
    if (g.length === 4) them(g.slice());
  }

  // sảnh: mọi đoạn bậc liên tiếp (bậc 0..11, không lấy Heo)
  for (i = 0; i < 12; i++) {
    if (!bac[i].length) continue;
    for (var len = 3; i + len <= 12; len++) {
      var end = i + len - 1, ok = true;
      for (k = i; k <= end; k++) if (!bac[k].length) { ok = false; break; }
      if (!ok) break;
      var base = [];
      for (k = i; k < end; k++) base.push(bac[k][0]);          // bậc giữa: lấy lá thấp nhất
      for (j = 0; j < bac[end].length; j++) them(base.concat([bac[end][j]]));   // bậc cuối: thử mọi chất
    }
  }

  // đôi thông: mọi đoạn bậc liên tiếp có ≥2 lá mỗi bậc
  for (i = 0; i < 12; i++) {
    if (bac[i].length < 2) continue;
    for (var sd = 3; i + sd <= 12; sd++) {
      var e2 = i + sd - 1, ok2 = true;
      for (k = i; k <= e2; k++) if (bac[k].length < 2) { ok2 = false; break; }
      if (!ok2) break;
      var b2 = [];
      for (k = i; k < e2; k++) { b2.push(bac[k][0]); b2.push(bac[k][1]); }
      var last = bac[e2];
      them(b2.concat([last[0], last[1]]));                                     // đôi cuối rẻ nhất
      if (last.length > 2) them(b2.concat([last[last.length - 2], last[last.length - 1]]));  // đôi cuối cao nhất
    }
  }

  out.sort(function (a, b) { return a.cards.length - b.cards.length || a.bo.hi - b.bo.hi; });
  return out;
}

// ---------- phân rã bài: bài này còn phải đánh bao nhiêu lượt ----------
/**
 * Tách bài thành các bộ (tứ quý → đôi thông → sảnh dài → ba → đôi → rác lẻ).
 * Số bộ càng ít thì bài càng "gọn" — AI dùng chính con số này để chấm nước đi.
 */
function analyze(hand) {
  var con = hand.slice().sort(function (a, b) { return a - b; });
  var bac = theoBac(con), groups = [], i, k;
  var dung = {};   // mã lá đã bị lấy

  function lay(cards) {
    for (var i2 = 0; i2 < cards.length; i2++) dung[cards[i2]] = 1;
    groups.push(cards);
  }
  function conLai(r) {
    var g = bac[r], o = [];
    for (var i2 = 0; i2 < g.length; i2++) if (!dung[g[i2]]) o.push(g[i2]);
    return o;
  }

  // 1. tứ quý
  for (i = 0; i < 13; i++) if (conLai(i).length === 4) lay(conLai(i));
  // 2. đôi thông (đoạn dài nhất trước)
  for (var sd = 4; sd >= 3; sd--) {
    for (i = 0; i + sd <= 12; i++) {
      var ok = true;
      for (k = i; k < i + sd; k++) if (conLai(k).length < 2) { ok = false; break; }
      if (!ok) continue;
      var cc = [];
      for (k = i; k < i + sd; k++) { var g2 = conLai(k); cc.push(g2[0], g2[1]); }
      lay(cc);
    }
  }
  // 3. sảnh dài trước (6 → 3)
  for (var ln = 6; ln >= 3; ln--) {
    for (i = 0; i + ln <= 12; i++) {
      var ok3 = true;
      for (k = i; k < i + ln; k++) if (!conLai(k).length) { ok3 = false; break; }
      if (!ok3) continue;
      var cs = [];
      for (k = i; k < i + ln; k++) cs.push(conLai(k)[0]);
      lay(cs);
    }
  }
  // 4. ba · đôi · rác
  for (i = 0; i < 13; i++) {
    var r = conLai(i);
    while (r.length >= 3) { lay(r.slice(0, 3)); r = conLai(i); }
    while (r.length >= 2) { lay(r.slice(0, 2)); r = conLai(i); }
    while (r.length >= 1) { lay(r.slice(0, 1)); r = conLai(i); }
  }
  return { groups: groups, luot: groups.length };
}

// ---------- AI ----------
/**
 * BỘ THAM SỐ CHẤM NƯỚC — dò bằng TỰ ĐẤU (`_mockup/_tl_ai_tinh.mjs`), không phải bịa.
 *   0 bớt được một lượt · 1 bài còn rối · 2 lá cao · 3 xả nhiều lá
 *   4 phá Heo lúc NGUY · 5 phá Heo lúc thường · 6 đốt hàng chặt lúc NGUY · 7 lúc thường
 *   8 chặt Heo · 9 phí giành lượt · 10 gần hết bài · 11 chặn người sắp về
 *   12 ngưỡng bỏ lượt lúc NGUY · 13 ngưỡng bỏ lượt thường
 * ⚠ Đổi cách chấm là phải DÒ LẠI: bộ số này bám chặt vào công thức quanh nó.
 */
var TS = [41.96, 6.86, 0.55, 4, 26.11, 168.48, 48, 305.86, 74.25, 5, 22.88, 97.2, 150, 64.19];
/** Nạp bộ tham số khác (công cụ dò dùng). */
function napThamSoAI(ts) { for (var i = 0; i < TS.length && i < ts.length; i++) TS[i] = ts[i]; }

/**
 * Chấm điểm MỌI nước trong `moves` theo bộ TS. Trả { diem:[...], best, bestSc, nguy }.
 * Tách khỏi `aiPick` để phần chọn ứng viên của PIMC dùng chung đúng một cách chấm.
 * THUẦN — không đụng tới rnd, gọi bao nhiêu lần cũng ra y hệt.
 */
function chamCacNuoc(hand, cur, ctx, moves) {
  var n = hand.length, i;
  // ai đó sắp về → phải chặn bằng mọi giá
  var nguy = false, minDich = 99;
  for (i = 0; i < 4; i++) if (i !== ctx.toi && ctx.conLai[i] > 0 && ctx.conLai[i] < minDich) minDich = ctx.conLai[i];
  if (minDich <= 2) nguy = true;

  var base = analyze(hand).luot;
  var best = null, bestSc = -1e9, diem = [];

  for (i = 0; i < moves.length; i++) {
    var mv = moves[i], cards = mv.cards, bo = mv.bo;
    var rest = hand.filter(function (c) { return cards.indexOf(c) < 0; });
    var sc = 0;

    if (!rest.length) {                      // đánh hết = về nhất, không gì hơn được
      diem.push(1e9);
      if (1e9 > bestSc) { bestSc = 1e9; best = mv; }
      continue;
    }

    var sauLuot = analyze(rest).luot;
    sc += (base - sauLuot) * TS[0];          // bớt được một lượt phải đánh = rất đáng
    sc -= sauLuot * TS[1];                   // bài càng gọn càng tốt
    sc -= bo.hi * TS[2];                     // ưu tiên xả lá thấp
    sc += cards.length * TS[3];              // xả được nhiều lá là tốt

    if (bo.bac === 12) sc -= nguy ? TS[4] : TS[5];                        // Heo: để dành chặn
    if (laHangChat(bo) && !laHangChat(cur)) sc -= nguy ? TS[6] : TS[7];   // đừng đốt hàng chặt vô cớ
    if (cur && laHangChat(bo) && cur.bac === 12) sc += TS[8];             // chặt Heo thì đáng

    if (cur) {
      sc -= TS[9];
      if (n <= 5) sc += TS[10];              // gần hết bài thì cứ giành lượt
      if (nguy) sc += TS[11];                // chặn người sắp về
    }
    diem.push(sc);
    if (sc > bestSc) { bestSc = sc; best = mv; }
  }
  return { diem: diem, best: best, bestSc: bestSc, nguy: nguy };
}

/**
 * aiPick(hand, cur, ctx, diff, rnd) -> mảng lá muốn đánh, hoặc null = bỏ lượt.
 *   ctx = { conLai:[4 số lá còn của từng cửa], toi:index, chuBai:index (người ra bộ hiện tại) }
 *   ctx còn nhận thêm (đều là thông tin CÔNG KHAI ở bàn, xem `daRaTu`):
 *     daRa:[mã lá đã đánh] · daBo:[4] · xong:[thứ tự về]  — có đủ thì bật được PIMC.
 *   diff 0..1 — càng cao càng tính kỹ, càng thấp càng hay đánh hớ.
 */
function aiPick(hand, cur, ctx, diff, rnd) {
  var rand = rnd || Math.random;
  var d = diff == null ? 1 : diff;
  // ⚠ Thứ tự vế && là CỐ Ý: bot dưới `khoTu` không tiêu một số ngẫu nhiên nào, nên hành vi
  //   của mấy chiếu thấp giữ nguyên KHÔNG SAI MỘT LI so với trước khi có PIMC.
  if (PIMC.bat && ctx && ctx.daRa && d > PIMC.khoTu && rand() < tiLePimc(d)) {
    var r = aiPimc(hand, cur, ctx, rand);
    if (r !== undefined) return r;           // undefined = không đủ điều kiện, rơi về heuristic
  }
  return aiHeuristic(hand, cur, ctx, d, rand);
}

/** Bộ óc HEURISTIC một nước — cũng là chính sách đánh nốt ván của PIMC. */
function aiHeuristic(hand, cur, ctx, diff, rnd) {
  var rand = rnd || Math.random;
  var moves = genMoves(hand, cur);
  if (!moves.length) return null;

  var c = chamCacNuoc(hand, cur, ctx, moves);

  // ngưỡng bỏ lượt: đang phải theo, nước rẻ nhất vẫn đắt thì nhường
  if (cur && c.bestSc < (c.nguy ? -TS[12] : -TS[13]) && rand() < 0.55 + diff * 0.4) return null;

  // đánh hớ theo độ khó: tay non thỉnh thoảng bốc bừa một nước hợp lệ
  if (rand() > 0.35 + diff * 0.65) {
    var pick = moves[Math.floor(rand() * Math.min(moves.length, 5))];
    if (pick) return pick.cards;
  }
  return c.best ? c.best.cards : null;
}

// ============================================================
// PIMC — MÔ PHỎNG PHỐI BÀI (Perfect Information Monte Carlo)
// ------------------------------------------------------------
// Heuristic ở trên chỉ nhìn ĐÚNG MỘT NƯỚC. PIMC nhìn tới CUỐI VÁN:
//   1. lấy những lá chưa ai thấy (52 − bài mình − lá đã đánh)
//   2. chia thử cho ba nhà kia theo đúng số lá họ đang cầm  → một "phối bài"
//   3. trong phối bài đó, đánh nốt ván bằng chính heuristic trên
//   4. lặp nhiều phối bài, nước nào TIỀN TRUNG BÌNH cao nhất thì đánh
// Mọi nước ứng viên dùng CHUNG một bộ phối bài và CHUNG hạt ngẫu nhiên
// (common random numbers) — không thế thì nhiễu nuốt hết chênh lệch.
//
// ⚠ Chỉ đọc thông tin CÔNG KHAI: số lá từng nhà, lá đã đánh, ai đã bỏ lượt.
//    KHÔNG bao giờ nhận bài thật của nhà khác — xem `daRaTu`.
// ============================================================
var PIMC = {
  bat: true,        // bật/tắt toàn bộ
  phoi: 64,         // TRẦN số phối bài mỗi lần nghĩ — thực tế `hanMs` mới là thứ cắt.
                    //   Đo ghép cặp: 40 hơn 24 (+0,045) · 64 hơn 40 (+0,052). Lãi giảm dần,
                    //   nhưng để trần cao thì máy khoẻ tự nghĩ sâu hơn trong cùng ngân sách.
  ungVien: 6,       // số nước mang đi mô phỏng (lọc trước bằng heuristic)
  nguong: 52,       // chỉ chạy khi TỔNG lá còn lại của bốn nhà ≤ số này. 52 = CẢ VÁN.
                    //   Đo (phối 24, so với heuristic): 20→+0,312 · 28→+0,431 · 36→+0,451 · 52→+0,518.
                    //   Đầu ván phối bài mù hơn thật, nhưng vẫn hơn nhìn một nước — và `hanMs` lo phần giá.
  khoTu: 0.55,      // độ khó bắt đầu được dùng PIMC — xem `tiLePimc`
  hanMs: 120        // TRẦN thời gian nghĩ một lượt (0 = không hạn)
};

/**
 * Tỉ lệ lượt được nghĩ bằng PIMC, theo độ khó của bot. `khoTu` → 0% · 1,0 → 100%.
 * ⚠ Phải là DỐC THOẢI chứ không phải ngưỡng cứng: heuristic vốn có nhánh "đánh hớ"
 * (`rand() > 0.35 + diff*0.65`), mà PIMC thì không bao giờ hớ. Cắt cứng ở `khoTu` là
 * bot chiếu này hớ 27% số nước, bot chiếu kế KHÔNG BAO GIỜ hớ — bậc thang độ khó giữa
 * các chiếu gãy làm đôi. Thoải thì Chiếu Kim Tôn vẫn khó hơn Lưu Vân đúng một nấc.
 */
function tiLePimc(d) {
  if (PIMC.khoTu >= 1) return 0;
  var t = (d - PIMC.khoTu) / (1 - PIMC.khoTu);
  return t < 0 ? 0 : t > 1 ? 1 : t;
}
// ⛔ ĐÃ ĐO RỒI BỎ — đừng làm lại: bốc lại phối bài cho KHỚP với việc ai đã bỏ lượt
//    (nhà đã bỏ thì trong tay không nên có nước đè `cur`). Đo ghép cặp 2.000 ván:
//    **+0,012 tiền/ván, t=0,6** — không có gì. Lý do: máy này bỏ lượt vì THẤY ĐẮT chứ không
//    phải vì KHÔNG CÓ nước, nên "đã bỏ" gần như không mang tin về bài họ cầm.
/** Chỉnh tham số PIMC (công cụ đo dùng). */
function napPimc(c) { for (var k in c) if (Object.prototype.hasOwnProperty.call(c, k)) PIMC[k] = c[k]; }

/**
 * Lá ĐÃ ĐÁNH = trọn bộ 52 lá trừ đi bài còn trên tay bốn nhà.
 * Dùng ở lớp view để dựng `ctx.daRa` — kết quả là thông tin ai ngồi bàn cũng biết,
 * nên đưa cho AI KHÔNG phải là nhìn trộm bài.
 */
function daRaTu(hands) {
  var co = {}, i, j, out = [];
  for (i = 0; i < hands.length; i++) for (j = 0; j < hands[i].length; j++) co[hands[i][j]] = 1;
  for (i = 0; i < 52; i++) if (!co[i]) out.push(i);
  return out;
}

/** Chia `an` (lá chưa thấy) cho ba nhà kia theo đúng số lá họ đang cầm. */
function phoiBai(an, ctx, rp) {
  var d = an.slice(), i, j, t;
  for (i = d.length - 1; i > 0; i--) { j = (rp() * (i + 1)) | 0; t = d[i]; d[i] = d[j]; d[j] = t; }
  var tay = [[], [], [], []], p = 0, s;
  for (s = 0; s < 4; s++) {
    if (s === ctx.toi) continue;
    for (i = 0; i < ctx.conLai[s]; i++) tay[s].push(d[p++]);
    tay[s].sort(function (a, b) { return a - b; });
  }
  return tay;
}

/**
 * Đánh nốt ván từ thế đang có, mọi nhà dùng heuristic. Trả TIỀN của nhà `toiLa`.
 * Chép đúng vòng đánh của game: đi vòng tròn, hết người theo thì chủ bài mở lượt mới.
 */
function danhNot(hands, cur, toi, chuBai, daBo, raBai, xong, toiLa, rp) {
  var lap = 0, s;
  while (xong.length < 3 && lap++ < 800) {
    if (!hands[toi].length || daBo[toi]) { toi = (toi + 1) % 4; continue; }
    var ctx2 = { conLai: [hands[0].length, hands[1].length, hands[2].length, hands[3].length], toi: toi, chuBai: chuBai };
    var cards = aiHeuristic(hands[toi], cur, ctx2, 1, rp);
    if (cards && cards.length) {
      var bo = classify(cards);
      if (!bo || (cur && !beats(bo, cur))) cards = null;
    }
    if (!cards || !cards.length) {
      if (cur) daBo[toi] = true;
      toi = (toi + 1) % 4;
    } else {
      cur = classify(cards);
      chuBai = toi;
      hands[toi] = hands[toi].filter(function (c) { return cards.indexOf(c) < 0; });
      raBai[toi] = true;
      if (!hands[toi].length) xong.push(toi);
      toi = (toi + 1) % 4;
    }
    var theo = 0;
    for (s = 0; s < 4; s++) if (s !== chuBai && hands[s].length && !daBo[s]) theo++;
    if (!theo) {
      cur = null;
      for (s = 0; s < 4; s++) daBo[s] = false;
      toi = hands[chuBai].length ? chuBai : (chuBai + 1) % 4;
      var ve = 0;
      while (!hands[toi].length && xong.length < 3 && ve++ < 8) toi = (toi + 1) % 4;
    }
  }
  var het = xong.slice();
  for (s = 0; s < 4; s++) if (het.indexOf(s) < 0) het.push(s);
  var th = [0, 0, 0, 0];
  for (s = 0; s < 4; s++) th[het[s]] = s + 1;
  return ketSo(hands, th, raBai, 1).dong[toiLa];
}

/**
 * aiPimc -> mảng lá · null (bỏ lượt) · undefined (không đủ điều kiện, hãy dùng heuristic).
 */
function aiPimc(hand, cur, ctx, rand) {
  var moves = genMoves(hand, cur), i, s, d;
  if (!moves.length) return null;
  for (i = 0; i < moves.length; i++) if (moves[i].cards.length === hand.length) return moves[i].cards;   // về được thì về

  var tong = 0;
  for (s = 0; s < 4; s++) tong += ctx.conLai[s];
  if (tong > PIMC.nguong) return undefined;                 // còn nhiều bài quá, phối bài chỉ là đoán mò

  // lá chưa ai thấy
  var thay = {}, k;
  for (k = 0; k < hand.length; k++) thay[hand[k]] = 1;
  for (k = 0; k < ctx.daRa.length; k++) thay[ctx.daRa[k]] = 1;
  var an = [];
  for (k = 0; k < 52; k++) if (!thay[k]) an.push(k);
  var can = 0;
  for (s = 0; s < 4; s++) if (s !== ctx.toi) can += ctx.conLai[s];
  if (an.length !== can || !can) return undefined;          // số liệu không khớp thì đừng liều

  // lọc ứng viên bằng heuristic — mô phỏng hết mọi nước thì quá đắt mà phần đuôi toàn nước dở
  var cham = chamCacNuoc(hand, cur, ctx, moves);
  var thuTu = [];
  for (i = 0; i < moves.length; i++) thuTu.push(i);
  thuTu.sort(function (a, b) { return cham.diem[b] - cham.diem[a]; });
  var uv = [];
  for (i = 0; i < thuTu.length && uv.length < PIMC.ungVien; i++) uv.push(moves[thuTu[i]].cards);
  if (cur) uv.push(null);                                   // bỏ lượt cũng là một lựa chọn
  if (uv.length < 2) return uv[0] === undefined ? undefined : uv[0];

  var diem = [];
  for (i = 0; i < uv.length; i++) diem.push(0);
  var goc = (rand() * 4294967296) | 0;

  var daBoGoc = ctx.daBo ? ctx.daBo.slice() : [false, false, false, false];
  var xongGoc = ctx.xong ? ctx.xong.slice() : [];
  var raBaiGoc = [];
  for (s = 0; s < 4; s++) raBaiGoc.push(ctx.conLai[s] < 13);   // ai còn đủ 13 lá thì chưa ra bài lần nào

  // ⚠ Trần thời gian: máy điện thoại chậm hơn máy bàn nhiều lần. Cắt theo ĐỒNG HỒ chứ đừng
  //   chốt cứng số phối bài — máy khoẻ vẫn nghĩ đủ sâu, máy yếu tự rút bớt thay vì làm khựng bàn.
  var moc = PIMC.hanMs > 0 ? Date.now() + PIMC.hanMs : 0;

  for (d = 0; d < PIMC.phoi; d++) {
    if (moc && d > 0 && Date.now() > moc) break;      // luôn chạy trọn ít nhất MỘT phối bài
    var tay = phoiBai(an, ctx, mulberry32(goc + d * 2654435761));
    for (i = 0; i < uv.length; i++) {
      var hands = [], chon = uv[i];
      for (s = 0; s < 4; s++) hands.push(s === ctx.toi ? hand.slice() : tay[s].slice());
      var daBo = daBoGoc.slice(), raBai = raBaiGoc.slice(), xong = xongGoc.slice();
      var c = cur, chuBai = ctx.chuBai, toi = ctx.toi;

      if (chon) {
        hands[toi] = hands[toi].filter(function (x) { return chon.indexOf(x) < 0; });
        c = classify(chon); chuBai = toi; raBai[toi] = true;
        if (!hands[toi].length) xong.push(toi);
      } else {
        daBo[toi] = true;
      }
      toi = (toi + 1) % 4;
      // hết người theo → chủ bài mở lượt mới (đúng thứ tự của vòng đánh thật)
      var theo = 0;
      for (s = 0; s < 4; s++) if (s !== chuBai && hands[s].length && !daBo[s]) theo++;
      if (!theo) {
        c = null;
        for (s = 0; s < 4; s++) daBo[s] = false;
        toi = hands[chuBai].length ? chuBai : (chuBai + 1) % 4;
        var ve = 0;
        while (!hands[toi].length && xong.length < 3 && ve++ < 8) toi = (toi + 1) % 4;
      }
      // CÙNG một hạt cho mọi ứng viên trong cùng phối bài — chênh lệch mới là do NƯỚC ĐI
      diem[i] += danhNot(hands, c, toi, chuBai, daBo, raBai, xong, ctx.toi, mulberry32(goc ^ (d * 40503 + 7)));
    }
  }

  var bi = 0;
  for (i = 1; i < uv.length; i++) if (diem[i] > diem[bi]) bi = i;
  return uv[bi];
}

/** Gợi ý cho NGƯỜI CHƠI: nước hợp lệ rẻ nhất (không đụng Heo/hàng chặt nếu còn đường khác). */
function goiY(hand, cur) {
  var moves = genMoves(hand, cur);
  if (!moves.length) return null;
  var re = moves.filter(function (m) { return m.bo.bac !== 12 && !laHangChat(m.bo); });
  var ds = re.length ? re : moves;
  return ds[0].cards;
}

// ---------- tính tiền cuối ván ----------
/**
 * ketSo(hands, thuHang, raBai, cuoc) -> { dong:[4], chiTiet:[[...],…] }
 *   hands   = bài CÒN LẠI của từng cửa lúc tàn cuộc
 *   thuHang = [4] hạng 1..4 của từng cửa
 *   raBai   = [4] cửa đó đã từng ra được bài chưa (false = bị cóng)
 * Nhất +2 cược · Nhì +1 · Ba −1 · Bét −2, cộng thêm phần phạt thối — phần phạt về tay người Nhất.
 */
function ketSo(hands, thuHang, raBai, cuoc) {
  var dong = [0, 0, 0, 0], chiTiet = [[], [], [], []], i, nhat = 0;
  var CO_BAN = { 1: 2, 2: 1, 3: -1, 4: -2 };
  for (i = 0; i < 4; i++) {
    if (thuHang[i] === 1) nhat = i;
    dong[i] += CO_BAN[thuHang[i]] * cuoc;
    chiTiet[i].push({ ly: 'Hạng ' + ['Nhất', 'Nhì', 'Ba', 'Bét'][thuHang[i] - 1], tien: CO_BAN[thuHang[i]] * cuoc });
  }
  var phat = 0;
  for (i = 0; i < 4; i++) {
    if (i === nhat) continue;
    var h = hands[i] || [], p = 0, bac = theoBac(h), r;
    var soHeo = bac[12].length;
    if (soHeo) { p += soHeo * cuoc; chiTiet[i].push({ ly: 'Thối ' + soHeo + ' con Heo', tien: -soHeo * cuoc }); }
    var tq = 0;
    for (r = 0; r < 13; r++) if (bac[r].length === 4) tq++;
    if (tq) { p += tq * 2 * cuoc; chiTiet[i].push({ ly: 'Thối ' + tq + ' tứ quý', tien: -tq * 2 * cuoc }); }
    var dt = 0;
    for (r = 0; r + 3 <= 12; r++) {
      var ok = true, k;
      for (k = r; k < r + 3; k++) if (bac[k].length < 2) { ok = false; break; }
      if (ok) { dt++; r += 2; }
    }
    if (dt) { p += dt * cuoc; chiTiet[i].push({ ly: 'Thối ' + dt + ' bộ ba đôi thông', tien: -dt * cuoc }); }
    if (!raBai[i]) { p += 2 * cuoc; chiTiet[i].push({ ly: 'Bị cóng — cả ván không ra nổi lá nào', tien: -2 * cuoc }); }
    dong[i] -= p; phat += p;
  }
  if (phat) { dong[nhat] += phat; chiTiet[nhat].push({ ly: 'Thu tiền thối của làng', tien: phat }); }
  return { dong: dong, chiTiet: chiTiet };
}

export {
  RANK_TEN, RANK_KY, SUIT_TEN,
  rankOf, suitOf, cardTen, cardKy,
  mulberry32, deal,
  classify, beats, laHangChat, tenBo,
  genMoves, analyze, aiPick, goiY, ketSo, theoBac, napThamSoAI,
  aiHeuristic, aiPimc, napPimc, daRaTu
};
