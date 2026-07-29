// ============================================================
// BINH XẬP XÁM (十三水) — engine luật + chấm điểm. THUẦN, không đụng DOM.
// Bê nguyên từ mockup đã chốt luật: _mockup/binh_engine.js (40/40 phép thử xanh).
//
// ⚠ MÃ LÁ KHÁC TIẾN LÊN. Xập xám dùng thứ tự POKER: Hai thấp nhất, Ách cao nhất.
//   bậc  = c >> 2   (0=Hai, 1=Ba … 8=Mười, 9=Bồi, 10=Đầm, 11=Già, 12=Ách)
//   chất = c & 3    (0=Bích, 1=Chuồn, 2=Rô, 3=Cơ)
//   (Tiến Lên xếp 3 thấp nhất và Heo cao nhất — ĐỪNG dùng lẫn hai bảng mã.)
//
// Luật: mỗi người 13 lá, xếp thành ba chi — Đầu 3 lá · Giữa 5 lá · Cuối 5 lá.
//   Bắt buộc Cuối ≥ Giữa ≥ Đầu, sai là BINH LỦNG (thua sạch mọi chi với mọi nhà).
//   So từng chi với từng nhà: thắng ăn 1 chi, thua mất 1 chi, bằng thì hoà.
//   Thắng trọn ba chi của một nhà = Sâm Banh, ăn gấp đôi (3 → 6).
// Bảng điểm theo luật phổ biến ở VN (ZingPlay/BigKool) — user chốt 2026-07-29.
// ============================================================

var BAC_TEN = ['Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Bồi', 'Đầm', 'Già', 'Ách'];
var BAC_KY = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
var CHAT_TEN = ['Bích', 'Chuồn', 'Rô', 'Cơ'];

function bacOf(c) { return c >> 2; }
function chatOf(c) { return c & 3; }
function cardTen(c) { return BAC_TEN[bacOf(c)] + ' ' + CHAT_TEN[chatOf(c)]; }
function cardKy(c) { return BAC_KY[bacOf(c)]; }
function laDo(c) { return chatOf(c) >= 2; }        // Rô, Cơ là đỏ

// ---------- hạng bài ----------
// Thang dùng chung cho cả chi 3 lá lẫn 5 lá (chi 3 lá không thể ra sảnh/thùng trở lên).
var HANG = { MAU_THAU: 0, DOI: 1, THU: 2, XAM_CHI: 3, SANH: 4, THUNG: 5, CU_LU: 6, TU_QUY: 7, THUNG_PHA_SANH: 8 };
var HANG_TEN = ['Mậu Thầu', 'Đôi', 'Thú', 'Xám Chi', 'Sảnh', 'Thùng', 'Cù Lũ', 'Tứ Quý', 'Thùng Phá Sảnh'];

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Chia 52 lá cho 4 nhà, mỗi nhà 13 lá đã xếp sẵn theo bậc. */
function deal(rnd) {
  var d = [], i, j, t;
  for (i = 0; i < 52; i++) d.push(i);
  for (i = 51; i > 0; i--) { j = Math.floor(rnd() * (i + 1)); t = d[i]; d[i] = d[j]; d[j] = t; }
  var hands = [[], [], [], []];
  for (i = 0; i < 52; i++) hands[i & 3].push(d[i]);
  for (i = 0; i < 4; i++) hands[i].sort(function (a, b) { return a - b; });
  return hands;
}

/**
 * Chấm một chi (3 hoặc 5 lá) -> { hang, key }.
 * `key` là mảng bậc xếp theo thứ tự phá hoà — so hai chi cùng hạng thì so lần lượt mảng này.
 * ⚠ Chất KHÔNG dùng để phá hoà: hai chi giống hệt bậc là HOÀ, không ai ăn ai.
 */
function danhGia(cards) {
  var n = cards.length, i;
  var bac = [], dem = {}, chat = {};
  for (i = 0; i < n; i++) {
    var b = bacOf(cards[i]);
    bac.push(b);
    dem[b] = (dem[b] || 0) + 1;
    chat[chatOf(cards[i])] = (chat[chatOf(cards[i])] || 0) + 1;
  }
  bac.sort(function (a, b) { return b - a; });          // cao xuống thấp

  // gom theo số lượng: nhiều lá trước, bậc cao trước
  var nhom = [];
  for (var k in dem) nhom.push({ b: +k, n: dem[k] });
  nhom.sort(function (a, b) { return b.n - a.n || b.b - a.b; });
  var key = [];
  for (i = 0; i < nhom.length; i++) for (var j = 0; j < nhom[i].n; j++) key.push(nhom[i].b);

  var cungChat = false;
  for (var s in chat) if (chat[s] === n) cungChat = true;

  // sảnh: 5 lá bậc liên tiếp. Ách được tính THẤP trong A-2-3-4-5 (sảnh nhỏ nhất).
  var lienTiep = false, dinhSanh = -1;
  if (n === 5 && nhom.length === 5) {
    var sx = bac.slice();                                // đã cao->thấp, không trùng
    if (sx[0] - sx[4] === 4) { lienTiep = true; dinhSanh = sx[0]; }
    // A-2-3-4-5: bậc 12,3,2,1,0
    else if (sx[0] === 12 && sx[1] === 3 && sx[2] === 2 && sx[3] === 1 && sx[4] === 0) { lienTiep = true; dinhSanh = 3; }
  }

  var hang;
  if (n === 5 && lienTiep && cungChat) hang = HANG.THUNG_PHA_SANH;
  else if (nhom[0].n === 4) hang = HANG.TU_QUY;
  else if (nhom[0].n === 3 && nhom.length === 2) hang = HANG.CU_LU;
  else if (n === 5 && cungChat) hang = HANG.THUNG;
  else if (n === 5 && lienTiep) hang = HANG.SANH;
  else if (nhom[0].n === 3) hang = HANG.XAM_CHI;
  else if (nhom[0].n === 2 && nhom.length === n - 2) hang = HANG.THU;
  else if (nhom[0].n === 2) hang = HANG.DOI;
  else hang = HANG.MAU_THAU;

  if (hang === HANG.SANH || hang === HANG.THUNG_PHA_SANH) key = [dinhSanh];   // sảnh chỉ so lá đỉnh
  return { hang: hang, key: key, so: n };
}

/** So hai chi: 1 = a thắng · -1 = a thua · 0 = hoà. */
function soChi(a, b) {
  if (a.hang !== b.hang) return a.hang > b.hang ? 1 : -1;
  for (var i = 0; i < Math.min(a.key.length, b.key.length); i++) {
    if (a.key[i] !== b.key[i]) return a.key[i] > b.key[i] ? 1 : -1;
  }
  return 0;
}

/**
 * So chi ĐẦU (3 lá) với chi GIỮA (5 lá) — chỉ để bắt lỗi xếp ngược.
 * Số lá khác nhau nên KHÔNG so lá lẻ được: chỉ so hạng rồi bậc chính (bậc của đôi / bộ ba).
 * ⚠ `hopLe` và `xepTuDong` PHẢI dùng chung hàm này, lệch nhau là xếp tự động đẻ ra bài lủng.
 */
function soDauGiua(d, g) {
  if (d.hang !== g.hang) return d.hang > g.hang ? 1 : -1;
  var a = d.key[0] || 0, b = g.key[0] || 0;
  return a === b ? 0 : (a > b ? 1 : -1);
}

/** Ba chi có đúng thứ tự Cuối ≥ Giữa ≥ Đầu không (sai = binh lủng). */
function hopLe(dau, giua, cuoi) {
  if (dau.length !== 3 || giua.length !== 5 || cuoi.length !== 5) return false;
  var d = danhGia(dau), g = danhGia(giua), c = danhGia(cuoi);
  if (soDauGiua(d, g) > 0) return false;          // đầu KHÔNG được mạnh hơn giữa
  if (soChi(c, g) < 0) return false;              // cuối phải ≥ giữa
  return true;
}

// ---------- Mậu Binh (bài đặc biệt, ăn trắng không cần xếp chi) ----------
// Xếp từ nhẹ tới nặng; hàm trả về loại NẶNG NHẤT mà bài đạt.
// Điểm theo luật phổ biến ở VN (ZingPlay/BigKool): bốn loại nền 6 · Sảnh Rồng 36 · Rồng Cuốn 100.
// ⚠ `mauBinh()` chọn bằng CHUỖI IF chứ không theo thứ tự mảng này — muốn đổi thứ tự ưu tiên
// thì sửa chuỗi if, và giữ nó xuống dần theo điểm.
var MAU_BINH = [
  { id: 'baSanh', ten: 'Ba Cái Sảnh', chi: 6, mo: 'Cả ba chi đều là sảnh.' },
  { id: 'baThung', ten: 'Ba Cái Thùng', chi: 6, mo: 'Cả ba chi đều là thùng.' },
  { id: 'sauDoi', ten: 'Sáu Đôi Rưỡi', chi: 6, mo: 'Sáu đôi cộng một lá lẻ.' },
  { id: 'namDoiMotXam', ten: 'Năm Đôi Một Xám', chi: 6, mo: 'Năm đôi cộng một bộ ba.' },
  { id: 'toanTieu', ten: 'Toàn Tiểu', chi: 8, mo: 'Mười ba lá đều từ Tám trở xuống.' },
  { id: 'toanDai', ten: 'Toàn Đại', chi: 8, mo: 'Mười ba lá đều từ Tám trở lên.' },
  { id: 'dongMau', ten: 'Toàn Đỏ hoặc Toàn Đen', chi: 10, mo: 'Mười ba lá cùng một màu.' },
  { id: 'bonXam', ten: 'Bốn Bộ Xám Chi', chi: 10, mo: 'Bốn bộ ba, một lá lẻ.' },
  { id: 'muoiHaiGiap', ten: 'Mười Hai Con Giáp', chi: 16, mo: 'Mười hai lá là Bồi, Đầm, Già hoặc Ách.' },
  { id: 'rong', ten: 'Sảnh Rồng', chi: 36, mo: 'Đủ mười ba bậc từ Hai đến Ách.' },
  { id: 'rongChat', ten: 'Rồng Cuốn', chi: 100, mo: 'Mười ba bậc liền và cùng một chất.' },
];
function mauBinhOf(id) { for (var i = 0; i < MAU_BINH.length; i++) if (MAU_BINH[i].id === id) return MAU_BINH[i]; return null; }

/** Bài 13 lá này có Mậu Binh không? Trả bản ghi nặng nhất, hoặc null. */
function mauBinh(hand) {
  if (!hand || hand.length !== 13) return null;
  var i, dem = {}, chat = {}, mau = { do: 0, den: 0 }, bacCo = {};
  for (i = 0; i < 13; i++) {
    var b = bacOf(hand[i]);
    dem[b] = (dem[b] || 0) + 1;
    bacCo[b] = 1;
    chat[chatOf(hand[i])] = (chat[chatOf(hand[i])] || 0) + 1;
    if (laDo(hand[i])) mau.do++; else mau.den++;
  }
  var duBac = Object.keys(bacCo).length === 13;                    // đủ 13 bậc = rồng
  if (duBac) {
    for (var s in chat) if (chat[s] === 13) return mauBinhOf('rongChat');
    return mauBinhOf('rong');
  }
  var soHinh = 0;
  for (i = 0; i < 13; i++) if (bacOf(hand[i]) >= 9) soHinh++;      // Bồi trở lên
  if (soHinh >= 12) return mauBinhOf('muoiHaiGiap');

  var doi = 0, xam = 0, tu = 0;
  for (var k in dem) { if (dem[k] === 2) doi++; else if (dem[k] === 3) xam++; else if (dem[k] === 4) tu++; }
  if (xam + tu >= 4) return mauBinhOf('bonXam');                   // tứ quý cũng gánh được vai bộ ba
  if (mau.do === 13 || mau.den === 13) return mauBinhOf('dongMau');

  var nho = 0, lon = 0;
  for (i = 0; i < 13; i++) { if (bacOf(hand[i]) <= 6) nho++; if (bacOf(hand[i]) >= 6) lon++; }   // bậc 6 = Tám
  if (nho === 13) return mauBinhOf('toanTieu');
  if (lon === 13) return mauBinhOf('toanDai');

  if (doi === 5 && xam === 1) return mauBinhOf('namDoiMotXam');
  if (doi === 6) return mauBinhOf('sauDoi');
  return null;    // Ba Cái Sảnh / Ba Cái Thùng phụ thuộc CÁCH XẾP nên xét riêng ở dưới
}

/** Mậu Binh phụ thuộc cách xếp: ba chi đều sảnh, hoặc đều thùng. */
function mauBinhXep(dau, giua, cuoi) {
  var d = danhGia(dau), g = danhGia(giua), c = danhGia(cuoi);
  var gSanh = (g.hang === HANG.SANH || g.hang === HANG.THUNG_PHA_SANH);
  var cSanh = (c.hang === HANG.SANH || c.hang === HANG.THUNG_PHA_SANH);
  var gThung = (g.hang === HANG.THUNG || g.hang === HANG.THUNG_PHA_SANH);
  var cThung = (c.hang === HANG.THUNG || c.hang === HANG.THUNG_PHA_SANH);
  // chi đầu 3 lá: tự xét liên tiếp / cùng chất
  var b = [bacOf(dau[0]), bacOf(dau[1]), bacOf(dau[2])].sort(function (x, y) { return x - y; });
  var dSanh = (b[1] === b[0] + 1 && b[2] === b[1] + 1) || (b[0] === 0 && b[1] === 1 && b[2] === 12);
  var dThung = (chatOf(dau[0]) === chatOf(dau[1]) && chatOf(dau[1]) === chatOf(dau[2]));
  if (dSanh && gSanh && cSanh) return mauBinhOf('baSanh');
  if (dThung && gThung && cThung) return mauBinhOf('baThung');
  return null;
}

// ---------- thưởng chi cho bộ lớn ----------
// Đầu: xám chi 3 · Giữa và Cuối như nhau: cù lũ 2, tứ quý 8, thùng phá sảnh 10.
function thuongChi(viTri, dg) {
  if (viTri === 0) return dg.hang === HANG.XAM_CHI ? 3 : 0;
  if (viTri === 1) {
    if (dg.hang === HANG.THUNG_PHA_SANH) return 10;
    if (dg.hang === HANG.TU_QUY) return 8;
    if (dg.hang === HANG.CU_LU) return 2;
    return 0;
  }
  // Chi cuối ăn thưởng Y HỆT chi giữa (luật phổ biến ở VN — ZingPlay/BigKool).
  if (dg.hang === HANG.THUNG_PHA_SANH) return 10;
  if (dg.hang === HANG.TU_QUY) return 8;
  if (dg.hang === HANG.CU_LU) return 2;
  return 0;
}

/**
 * Chấm cả ván.
 *   xep[i] = { dau, giua, cuoi } hoặc null (không xếp = coi như lủng)
 *   hands[i] = 13 lá gốc (để xét Mậu Binh không phụ thuộc cách xếp)
 * Trả { chi:[4], chiTiet:[4][] , lung:[4], mb:[4] } — chi là số CHI ăn/thua, nhân với tiền mỗi chi ở lớp trên.
 */
function chamVan(hands, xep) {
  var i, j, n = 4;
  var chi = [0, 0, 0, 0], chiTiet = [[], [], [], []], lung = [false, false, false, false], mb = [null, null, null, null];
  var dg = [];      // dg[i] = [chiĐầu, chiGiữa, chiCuối] đã chấm hạng

  for (i = 0; i < n; i++) {
    var x = xep[i];
    if (!x || !x.dau || !x.giua || !x.cuoi || x.dau.length !== 3 || x.giua.length !== 5 || x.cuoi.length !== 5) {
      lung[i] = true; dg.push(null); continue;
    }
    var m = mauBinh(hands[i]) || mauBinhXep(x.dau, x.giua, x.cuoi);
    if (m) mb[i] = m;
    if (!hopLe(x.dau, x.giua, x.cuoi)) { lung[i] = true; dg.push(null); continue; }
    dg.push([danhGia(x.dau), danhGia(x.giua), danhGia(x.cuoi)]);
  }

  // Mậu Binh ăn trắng của MỌI nhà không có Mậu Binh; hai nhà cùng có thì so mức, bằng mức thì hoà.
  for (i = 0; i < n; i++) {
    if (!mb[i]) continue;
    for (j = 0; j < n; j++) {
      if (j === i) continue;
      if (mb[j] && mb[j].chi >= mb[i].chi) continue;      // nhà kia mạnh hơn hoặc bằng: để lượt của nó xử
      var an = mb[i].chi - (mb[j] ? mb[j].chi : 0);
      chi[i] += an; chi[j] -= an;
      chiTiet[i].push({ ly: mb[i].ten + ' — ăn trắng ' + CUA(j), chi: an });
      chiTiet[j].push({ ly: 'Thua ' + mb[i].ten + ' của ' + CUA(i), chi: -an });
    }
  }

  for (i = 0; i < n; i++) {
    for (j = i + 1; j < n; j++) {
      if (mb[i] || mb[j]) continue;                       // đã xử ở vòng Mậu Binh
      var a = dg[i], b = dg[j];
      if (lung[i] && lung[j]) continue;
      if (lung[i] || lung[j]) {
        var thua = lung[i] ? i : j, thang = lung[i] ? j : i;
        chi[thang] += 3; chi[thua] -= 3;
        chiTiet[thang].push({ ly: CUA(thua) + ' binh lủng', chi: 3 });
        chiTiet[thua].push({ ly: 'Binh lủng — thua sạch với ' + CUA(thang), chi: -3 });
        continue;
      }
      var d = 0, thangHet = true, thuaHet = true;
      for (var v = 0; v < 3; v++) {
        var r = soChi(a[v], b[v]);
        d += r;
        if (r <= 0) thangHet = false;
        if (r >= 0) thuaHet = false;
      }
      // thưởng bộ lớn: cộng cho người CÓ bộ, trừ người kia — không phụ thuộc thắng thua chi đó
      for (var v2 = 0; v2 < 3; v2++) {
        var ta = thuongChi(v2, a[v2]), tb = thuongChi(v2, b[v2]);
        if (ta) { d += ta; chiTiet[i].push({ ly: HANG_TEN[a[v2].hang] + ' ' + CHI_TEN[v2], chi: ta }); }
        if (tb) { d -= tb; chiTiet[j].push({ ly: HANG_TEN[b[v2].hang] + ' ' + CHI_TEN[v2], chi: tb }); }
      }
      if (thangHet) { d += 3; chiTiet[i].push({ ly: 'Sâm Banh ' + CUA(j), chi: 3 }); }      // thắng cả 3 chi: ăn gấp đôi
      if (thuaHet) { d -= 3; chiTiet[j].push({ ly: 'Sâm Banh ' + CUA(i), chi: 3 }); }
      chi[i] += d; chi[j] -= d;
    }
  }
  return { chi: chi, chiTiet: chiTiet, lung: lung, mb: mb, dg: dg };
}
var CHI_TEN = ['chi Đầu', 'chi Giữa', 'chi Cuối'];
var TEN_CUA = ['Nam', 'Đông', 'Bắc', 'Tây'];
function CUA(i) { return TEN_CUA[i] || ('cửa ' + i); }

// ---------- xếp bài tự động (cũng là AI của ba nhà) ----------
function toHop(arr, k) {
  var out = [];
  (function rec(start, cur) {
    if (cur.length === k) { out.push(cur.slice()); return; }
    for (var i = start; i < arr.length; i++) { cur.push(arr[i]); rec(i + 1, cur); cur.pop(); }
  })(0, []);
  return out;
}

// ===== chấm nhanh: trả về MỘT SỐ để so thẳng, không dựng object =====
// Duyệt xếp bài gọi hàm này hàng trăm nghìn lần — dựng object + for..in ở đó là đủ đơ nửa giây.
var _dem = new Int8Array(13), _nb = new Int32Array(13), _nn = new Int32Array(13);
function chamSo(cards, n) {
  var i, j, b, sMask = 0;
  for (i = 0; i < 13; i++) _dem[i] = 0;
  for (i = 0; i < n; i++) { _dem[cards[i] >> 2]++; sMask |= (1 << (cards[i] & 3)); }
  var m = 0;
  for (b = 12; b >= 0; b--) if (_dem[b]) { _nb[m] = b; _nn[m] = _dem[b]; m++; }
  // sắp theo (số lượng giảm, bậc giảm) — m ≤ 5 nên chèn thẳng cho rẻ
  for (i = 1; i < m; i++) {
    var kb = _nb[i], kn = _nn[i];
    for (j = i - 1; j >= 0 && (_nn[j] < kn || (_nn[j] === kn && _nb[j] < kb)); j--) { _nb[j + 1] = _nb[j]; _nn[j + 1] = _nn[j]; }
    _nb[j + 1] = kb; _nn[j + 1] = kn;
  }
  var cungChat = (sMask === 1 || sMask === 2 || sMask === 4 || sMask === 8);
  var lienTiep = false, dinh = -1;
  if (n === 5 && m === 5) {
    if (_nb[0] - _nb[4] === 4) { lienTiep = true; dinh = _nb[0]; }
    else if (_nb[0] === 12 && _nb[1] === 3 && _nb[2] === 2 && _nb[3] === 1 && _nb[4] === 0) { lienTiep = true; dinh = 3; }
  }
  var hang;
  if (n === 5 && lienTiep && cungChat) hang = HANG.THUNG_PHA_SANH;
  else if (_nn[0] === 4) hang = HANG.TU_QUY;
  else if (_nn[0] === 3 && m === 2) hang = HANG.CU_LU;
  else if (n === 5 && cungChat) hang = HANG.THUNG;
  else if (n === 5 && lienTiep) hang = HANG.SANH;
  else if (_nn[0] === 3) hang = HANG.XAM_CHI;
  else if (_nn[0] === 2 && m === n - 2) hang = HANG.THU;
  else if (_nn[0] === 2) hang = HANG.DOI;
  else hang = HANG.MAU_THAU;
  // gộp thành một số: hạng ở đầu, rồi tới các bậc phá hoà (mỗi bậc 4 bit)
  var v = hang;
  if (hang === HANG.SANH || hang === HANG.THUNG_PHA_SANH) v = v * 16 + dinh;
  else for (i = 0; i < m && i < 5; i++) v = v * 16 + _nb[i];
  for (var p = (hang === HANG.SANH || hang === HANG.THUNG_PHA_SANH) ? 1 : m; p < 5; p++) v = v * 16;
  return { v: v, hang: hang, k0: (hang === HANG.SANH || hang === HANG.THUNG_PHA_SANH) ? dinh : _nb[0] };
}

/**
 * Tìm cách xếp tốt: duyệt chi Cuối (5 lá), rồi chi Giữa trong 8 lá còn lại, phần dư làm chi Đầu;
 * giữ phương án hợp lệ điểm cao nhất. C(13,5) × C(8,5) = 1287 × 56 = 72k tổ hợp.
 * Bảng tổ hợp CHỈ SỐ dựng một lần rồi dùng lại, và không cấp phát mảng trong vòng lặp.
 */
var IDX13 = null, IDX8 = null;
function xepTuDong(hand) {
  if (!IDX13) { IDX13 = toHop([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 5); IDX8 = toHop([0, 1, 2, 3, 4, 5, 6, 7], 5); }
  var cuoi = new Array(5), giua = new Array(5), dau = new Array(3), con = new Array(8);
  var bCuoi = null, bGiua = null, bDau = null, bestSc = -1e9;
  var dungC = new Uint8Array(13), dungG = new Uint8Array(8);
  for (var i = 0; i < IDX13.length; i++) {
    var pc = IDX13[i], k, t;
    for (k = 0; k < 13; k++) dungC[k] = 0;
    for (k = 0; k < 5; k++) { cuoi[k] = hand[pc[k]]; dungC[pc[k]] = 1; }
    t = 0; for (k = 0; k < 13; k++) if (!dungC[k]) con[t++] = hand[k];
    var sC = chamSo(cuoi, 5);
    for (var j = 0; j < IDX8.length; j++) {
      var pg = IDX8[j];
      for (k = 0; k < 8; k++) dungG[k] = 0;
      for (k = 0; k < 5; k++) { giua[k] = con[pg[k]]; dungG[pg[k]] = 1; }
      t = 0; for (k = 0; k < 8; k++) if (!dungG[k]) dau[t++] = con[k];
      var sG = chamSo(giua, 5);
      if (sC.v < sG.v) continue;                       // cuối phải ≥ giữa
      var sD = chamSo(dau, 3);
      if (sD.hang > sG.hang || (sD.hang === sG.hang && sD.k0 > sG.k0)) continue;   // đầu không được mạnh hơn giữa
      var sc = sC.hang * 100 + sG.hang * 60 + sD.hang * 40
        + thuongSo(2, sC.hang) * 12 + thuongSo(1, sG.hang) * 12 + thuongSo(0, sD.hang) * 12
        + sC.v * 1e-9;
      if (sc > bestSc) {
        bestSc = sc;
        bCuoi = cuoi.slice(); bGiua = giua.slice(); bDau = dau.slice();
      }
    }
  }
  return bCuoi ? { dau: bDau, giua: bGiua, cuoi: bCuoi } : null;
}
function thuongSo(viTri, hang) { return thuongChi(viTri, { hang: hang }); }

function tenHang(dg) { return HANG_TEN[dg.hang]; }


export {
  BAC_TEN, BAC_KY, CHAT_TEN, HANG, HANG_TEN, MAU_BINH, CHI_TEN,
  bacOf, chatOf, cardTen, cardKy, laDo,
  mulberry32, deal,
  danhGia, soChi, hopLe, tenHang,
  mauBinh, mauBinhXep, thuongChi,
  chamVan, xepTuDong,
};
