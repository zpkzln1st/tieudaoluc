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
 * ===== BỘ ÓC BINH BÀI =====
 *
 * Duyệt TRỌN VẸN 72.072 cách xếp (C(13,5) × C(8,5)) rồi lấy cách có KỲ VỌNG SỐ CHI cao nhất.
 * Phần duyệt vốn đã đủ; thứ quyết định mạnh yếu là HÀM CHẤM.
 *
 * ⚠ Bản cũ chấm theo HẠNG suông (`sC.hang*100 + sG.hang*60 + sD.hang*40`). Ba chỗ hỏng:
 *   1. Bỏ qua BẬC trong hạng: "Đôi 3" và "Đôi Ách" ở chi Giữa được chấm y như nhau, trong khi
 *      cái trước gần như chắc thua còn cái sau gần như chắc thắng.
 *   2. Trọng số 100/60/40 là số bịa. Ba chi đều đáng ĐÚNG 1 chi như nhau; chi Cuối chỉ hơn ở
 *      chỗ thưởng bộ, chứ không đáng gấp 2,5 lần chi Đầu.
 *   3. Không hề biết Mậu Binh THEO CÁCH XẾP (Ba Thùng / Ba Sảnh) — bỏ lỡ 6 chi × 3 nhà = 18 chi.
 *
 * Bản này chấm ĐÚNG THEO LUẬT TÍNH TIỀN trong `chamVan`, tính cho MỘT nhà đối thủ:
 *      EV = Σ_chi [ P(thắng) − P(thua) ]        ← mỗi chi ăn/thua đúng 1
 *         + Σ_chi thưởng bộ                      ← CỘNG VÔ ĐIỀU KIỆN, không phụ thuộc thắng thua
 *         + 3·Π P(thắng) − 3·Π P(thua)           ← Sâm Banh (thắng/thua trọn ba chi)
 * Mậu Binh theo cách xếp thì ăn thẳng `chi` mỗi nhà, so trực tiếp với EV trên.
 * (Nhân 3 nhà là hằng số chung, không đổi thứ hạng nên bỏ.)
 *
 * P(thắng) tra từ BẢNG PHÂN VỊ dựng bằng tự đấu — xem `_mockup/_binh_ai_bang.mjs`.
 */

// 256 mốc phân vị (tăng dần) của giá trị chi mà một nhà đặt ở vị trí đó. Dựng bằng tự đấu.
var PW = [null, null, null], CO_BANG = false;
// KHO THẾ BÀI ĐỐI THỦ: từng bộ ba (giá trị chi Đầu, Giữa, Cuối) lấy thẳng từ tự đấu.
// ⚠ Vì sao cần, khi đã có bảng xác suất: bảng chỉ cho biết TỪNG chi thắng bao nhiêu phần trăm,
// muốn ra Sâm Banh phải nhân ba số đó — tức GIẢ ĐỊNH ba chi độc lập. Thực tế bài mạnh thì mạnh
// cả ba chi (tương quan dương) nên nhân vào là ước lượng THẤP, máy coi nhẹ thế bài cân.
// Chấm thẳng trên kho thế bài thật thì Sâm Banh tính đúng, không phải giả định gì.
var _HO = null, _SO_HO = 0;
/** Nạp bảng xác suất + kho thế bài (công cụ dựng gọi; bản phát hành nạp sẵn ở cuối tệp). */
function napBangAI(bang, ho) {
  PW = [Float64Array.from(bang[0]), Float64Array.from(bang[1]), Float64Array.from(bang[2])];
  CO_BANG = true;
  if (ho && ho.length) { _HO = Float64Array.from(ho); _SO_HO = (ho.length / 3) | 0; }
}
/** [P(thắng), P(thua)] khi đặt giá trị `v` ở chi thứ `r` — hoà là phần còn lại. */
function xacSuat(r, v, out) {
  var q = PW[r], n = q.length, lo = 0, hi = n, m;
  while (lo < hi) { m = (lo + hi) >> 1; if (q[m] < v) lo = m + 1; else hi = m; }
  var duoi = lo;
  lo = 0; hi = n;
  while (lo < hi) { m = (lo + hi) >> 1; if (q[m] <= v) lo = m + 1; else hi = m; }
  out[0] = duoi / n;
  out[1] = (n - lo) / n;
}

// Bảng tổ hợp + tra ngược theo BIT MASK: dựng một lần, dùng cho mọi ván.
var TH5 = null, TH3 = null, IDX8 = null, M5 = null, M3 = null, MASK5 = null;
function dungBangToHop() {
  if (TH5) return;
  var moi = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  TH5 = toHop(moi, 5); TH3 = toHop(moi, 3); IDX8 = toHop([0, 1, 2, 3, 4, 5, 6, 7], 5);
  M5 = new Int16Array(8192).fill(-1); M3 = new Int16Array(8192).fill(-1);
  MASK5 = new Int16Array(TH5.length);
  var i, k, m;
  for (i = 0; i < TH5.length; i++) { m = 0; for (k = 0; k < 5; k++) m |= 1 << TH5[i][k]; M5[m] = i; MASK5[i] = m; }
  for (i = 0; i < TH3.length; i++) { m = 0; for (k = 0; k < 3; k++) m |= 1 << TH3[i][k]; M3[m] = i; }
}

// Bộ đệm chấm sẵn cho MỘT ván — hoisted để khỏi cấp phát lại mỗi lần gọi.
var _v5, _h5, _k5, _wG, _lG, _wC, _lC, _tG, _tC, _thung5, _sanh5;
var _v3, _h3, _k3, _wD, _lD, _tD, _chat3, _lien3;
function capBoDem() {
  if (_v5) return;
  var a = TH5.length, b = TH3.length;
  _v5 = new Float64Array(a); _h5 = new Uint8Array(a); _k5 = new Uint8Array(a);
  _wG = new Float64Array(a); _lG = new Float64Array(a); _wC = new Float64Array(a); _lC = new Float64Array(a);
  _tG = new Float64Array(a); _tC = new Float64Array(a);
  _thung5 = new Uint8Array(a); _sanh5 = new Uint8Array(a);
  _v3 = new Float64Array(b); _h3 = new Uint8Array(b); _k3 = new Uint8Array(b);
  _wD = new Float64Array(b); _lD = new Float64Array(b); _tD = new Float64Array(b);
  _chat3 = new Uint8Array(b); _lien3 = new Uint8Array(b);
}

// Giữ K ứng viên tốt nhất của vòng một. K nhỏ nên chèn tuyến tính là rẻ nhất.
var SO_TOP = 400;
var topEv = new Float64Array(SO_TOP), topC = new Int16Array(SO_TOP);
var topG = new Int16Array(SO_TOP), topD = new Int16Array(SO_TOP), nTop = 0;
function giuTop(ev, c, g, d) {
  if (nTop === SO_TOP && ev <= topEv[nTop - 1]) return;
  var i = (nTop < SO_TOP) ? nTop++ : SO_TOP - 1;
  while (i > 0 && topEv[i - 1] < ev) {
    topEv[i] = topEv[i - 1]; topC[i] = topC[i - 1]; topG[i] = topG[i - 1]; topD[i] = topD[i - 1];
    i--;
  }
  topEv[i] = ev; topC[i] = c; topG[i] = g; topD[i] = d;
}
/** Kỳ vọng số chi với MỘT nhà bất kỳ, chấm thẳng trên kho thế bài (Sâm Banh tính đúng). */
function evTheoHo(vd, vg, vc, kho, soKho) {
  var t = 0, i, p = 0;
  var HO = kho || _HO, SO_HO = soKho || _SO_HO;
  for (i = 0; i < SO_HO; i++) {
    var a = vd - HO[p], b = vg - HO[p + 1], c = vc - HO[p + 2]; p += 3;
    var s = (a > 0 ? 1 : a < 0 ? -1 : 0) + (b > 0 ? 1 : b < 0 ? -1 : 0) + (c > 0 ? 1 : c < 0 ? -1 : 0);
    if (s === 3) s = 6;                        // thắng trọn ba chi = Sâm Banh, ăn gấp đôi
    else if (s === -3) s = -6;
    t += s;
  }
  return t / SO_HO;
}

var _xs = [0, 0], _bo5 = new Array(5), _bo3 = new Array(3);
function xepTuDong(hand, khoRieng) {
  dungBangToHop(); capBoDem();
  nTop = 0;
  var i, j, k, m;
  // ---- chấm sẵn MỌI tổ hợp 5 lá và 3 lá của bàn tay này (1287 + 286 lần, thay vì 144k) ----
  for (i = 0; i < TH5.length; i++) {
    var p5 = TH5[i];
    for (k = 0; k < 5; k++) _bo5[k] = hand[p5[k]];
    var s = chamSo(_bo5, 5);
    _v5[i] = s.v; _h5[i] = s.hang; _k5[i] = s.k0;
    _tG[i] = thuongChi(1, s); _tC[i] = thuongChi(2, s);
    _thung5[i] = (s.hang === HANG.THUNG || s.hang === HANG.THUNG_PHA_SANH) ? 1 : 0;
    _sanh5[i] = (s.hang === HANG.SANH || s.hang === HANG.THUNG_PHA_SANH) ? 1 : 0;
    if (CO_BANG) {
      xacSuat(1, s.v, _xs); _wG[i] = _xs[0]; _lG[i] = _xs[1];
      xacSuat(2, s.v, _xs); _wC[i] = _xs[0]; _lC[i] = _xs[1];
    }
  }
  for (i = 0; i < TH3.length; i++) {
    var p3 = TH3[i];
    for (k = 0; k < 3; k++) _bo3[k] = hand[p3[k]];
    var s3 = chamSo(_bo3, 3);
    _v3[i] = s3.v; _h3[i] = s3.hang; _k3[i] = s3.k0;
    _tD[i] = thuongChi(0, s3);
    var c0 = chatOf(_bo3[0]);
    _chat3[i] = (chatOf(_bo3[1]) === c0 && chatOf(_bo3[2]) === c0) ? 1 : 0;
    var b0 = bacOf(_bo3[0]), b1 = bacOf(_bo3[1]), b2 = bacOf(_bo3[2]), t;
    if (b0 > b1) { t = b0; b0 = b1; b1 = t; }
    if (b1 > b2) { t = b1; b1 = b2; b2 = t; }
    if (b0 > b1) { t = b0; b0 = b1; b1 = t; }
    _lien3[i] = ((b1 === b0 + 1 && b2 === b1 + 1) || (b0 === 0 && b1 === 1 && b2 === 12)) ? 1 : 0;
    if (CO_BANG) { xacSuat(0, s3.v, _xs); _wD[i] = _xs[0]; _lD[i] = _xs[1]; }
  }

  // ---- duyệt trọn 72.072 cách xếp ----
  var FULL = 8191, con = new Array(8);
  var bC = -1, bG = -1, bD = -1, best = -1e9;
  for (i = 0; i < TH5.length; i++) {
    var mc = MASK5[i], vc = _v5[i], t8 = 0;
    for (k = 0; k < 13; k++) if (!(mc & (1 << k))) con[t8++] = k;
    for (j = 0; j < 56; j++) {
      var pg = IDX8[j];
      m = 0; for (k = 0; k < 5; k++) m |= 1 << con[pg[k]];
      var gi = M5[m];
      if (_v5[gi] > vc) continue;                     // cuối phải ≥ giữa
      var di = M3[FULL ^ mc ^ m];
      if (_h3[di] > _h5[gi] || (_h3[di] === _h5[gi] && _k3[di] > _k5[gi])) continue;   // đầu ≤ giữa
      var ev;
      // Mậu Binh theo CÁCH XẾP: ăn trắng `chi` mỗi nhà, so thẳng với kỳ vọng của cách xếp thường.
      if ((_thung5[i] && _thung5[gi] && _chat3[di]) || (_sanh5[i] && _sanh5[gi] && _lien3[di])) {
        ev = 6;
      } else if (CO_BANG) {
        var wd = _wD[di], wg = _wG[gi], wc = _wC[i];
        var ld = _lD[di], lg = _lG[gi], lc = _lC[i];
        ev = (wd - ld) + (wg - lg) + (wc - lc) + _tD[di] + _tG[gi] + _tC[i]
          + 3 * wd * wg * wc - 3 * ld * lg * lc;
      } else {
        // Chỉ dùng lúc DỰNG BẢNG (vòng mồi): chấm theo hạng như bản cũ.
        ev = _h5[i] * 100 + _h5[gi] * 60 + _h3[di] * 40
          + _tC[i] * 12 + _tG[gi] * 12 + _tD[di] * 12;
      }
      ev += vc * 1e-9;                                 // phá hoà: chi Cuối mạnh hơn thì hơn
      if (ev > best) { best = ev; bC = i; bG = gi; bD = di; }
      if (_SO_HO) giuTop(ev, i, gi, di);
    }
  }
  // ---- VÒNG HAI: mấy chục ứng viên đầu bảng đem chấm lại trên KHO THẾ BÀI thật ----
  // Vòng một chỉ để LỌC (nó giả định ba chi độc lập nên ước lượng Sâm Banh thấp). Vòng hai đắt
  // hơn nhiều nhưng chỉ chạy trên K ứng viên nên vẫn rẻ, mà số ra là kỳ vọng ĐÚNG.
  if (_SO_HO && nTop) {
    var b2 = -1e9;
    for (i = 0; i < nTop; i++) {
      var ci = topC[i], gj = topG[i], dk = topD[i];
      var e2 = _thung5[ci] && _thung5[gj] && _chat3[dk] ? 6
        : (_sanh5[ci] && _sanh5[gj] && _lien3[dk] ? 6
          : evTheoHo(_v3[dk], _v5[gj], _v5[ci], khoRieng, khoRieng ? (khoRieng.length / 3) | 0 : 0) + _tD[dk] + _tG[gj] + _tC[ci]);
      e2 += _v5[ci] * 1e-9;
      if (e2 > b2) { b2 = e2; bC = ci; bG = gj; bD = dk; }
    }
  }
  if (bC < 0) return null;
  var raC = [], raG = [], raD = [];
  for (k = 0; k < 5; k++) { raC.push(hand[TH5[bC][k]]); raG.push(hand[TH5[bG][k]]); }
  for (k = 0; k < 3; k++) raD.push(hand[TH3[bD][k]]);
  return { dau: raD, giua: raG, cuoi: raC };
}

function tenHang(dg) { return HANG_TEN[dg.hang]; }



// ==== BẢNG XÁC SUẤT THẮNG + KHO THẾ BÀI (dựng bằng tự đấu — _mockup/_binh_ai_bang.mjs) ====
// Ba mảng đầu: 256 mốc phân vị giá trị chi Đầu · Giữa · Cuối mà một nhà đặt xuống.
// Mảng cuối: 512 thế bài đối thủ THẬT (mỗi thế 3 số) cho vòng chấm thứ hai.
// Dựng bằng tự đấu, trộn theo 1/n (fictitious play) tới khi bảng hết đổi.
// ⚠ ĐỪNG sửa tay: đổi cách chấm là phải DỰNG LẠI, không thì máy tối ưu theo phân bố cũ.
napBangAI([
[
  203597,279194,341862,399258,424371,467584,484506,519040,
  538394,546995,551808,566912,594176,603469,608717,611866,
  617600,619981,624768,631398,644070,661146,666291,670029,
  671974,673664,675174,679578,681344,682675,687181,688973,
  689818,698522,703462,712499,716749,721101,727782,733952,
  736742,738074,739482,740992,742272,742938,743808,744294,
  745088,745933,746419,746906,747136,747597,753894,755789,
  756813,757939,765926,767309,771968,773811,774912,778138,
  780186,781773,785510,786509,787712,791450,793472,797286,
  798618,799898,803840,805478,806451,807066,807834,808678,
  809651,810726,811571,811904,812390,812800,813082,813491,
  813670,814157,814541,814694,815309,815514,815667,816000,
  816256,820173,844211,846157,847923,848102,848922,851968,
  853299,854682,855808,856704,857344,860826,862029,862976,
  863898,864410,865050,889907,892467,893747,894822,896973,
  897920,923930,926438,930970,933914,938010,965222,970573,
  996531,1023309,1031501,1083443,1093120,1102157,1114496,1121050,
  1132544,1164237,1178189,1189658,1196211,1207296,1219584,1228595,
  1237197,1247027,1256858,1268762,1279002,1286374,1293747,1298662,
  1311565,1321011,1330867,1336576,1342771,1348454,1358746,1364915,
  1371827,1376768,1384576,1389517,1395533,1402573,1412429,1416960,
  1422720,1428045,1431578,1436954,1444787,1448499,1455053,1462451,
  1465318,1471898,1476813,1483366,1488538,1495552,1499674,1502566,
  1511168,1514061,1518157,1521843,1525965,1529651,1534976,1538688,
  1544832,1553024,1555482,1560806,1565517,1568026,1570534,1574630,
  1576704,1580826,1583283,1585741,1591091,1598054,1605427,1613210,
  1618150,1623475,1627162,1629619,1632922,1633741,1636198,1637427,
  1640704,1642752,1667072,1671168,1677722,1691648,1703117,1713766,
  1724006,1730560,1737523,1740800,1746534,1750630,1753907,1758003,
  1761690,1767424,1771930,1778893,1782170,1788723,1801830,1809203,
  1816986,1822310,1829683,1832550,1839104,1844429,1849754,1851802,
  1855898,1860403,1863270,1870234,1874330,1877606,2950758,3373056],
[
  675403,740912,745689,772663,804314,813082,813350,815477,
  817751,843737,973642,992667,1051235,1088004,1134490,1212558,
  1235786,1261251,1281499,1288430,1323864,1337360,1345862,1363786,
  1383970,1397283,1405795,1415835,1430389,1439117,1455123,1464410,
  1476442,1481789,1488890,1504014,1514683,1526034,1531080,1539990,
  1544848,1551659,1565918,1581214,1585954,1593115,1596994,1600403,
  1606464,1615397,1619267,1630485,1643504,1649752,1655366,1664715,
  1667990,1670909,1673818,1681717,1687398,1693763,1698958,1709685,
  1711987,1714397,1721885,1735307,1741450,1744494,1751874,1754216,
  1757458,1765168,1767413,1775498,1783083,1785702,1820438,1822638,
  1826659,1828530,1833080,1841731,1843725,1848032,1852002,1858030,
  1861336,1868392,1871427,1872389,1873870,1876282,1882101,1883202,
  1888123,1899099,1900738,1901422,1905579,1907403,1909451,1910186,
  1911610,1917517,1946805,1954352,1955610,1960464,1967374,1968755,
  1997894,2009126,2038744,2084394,2126093,2128005,2141706,2149690,
  2151285,2169434,2204782,2211493,2224286,2254322,2266533,2281043,
  2283392,2300496,2308622,2316446,2322970,2365800,2380186,2397774,
  2406301,2447411,2455398,2464845,2485299,2488192,2495718,2514278,
  2526080,2529971,2537702,2557645,2560870,2567910,2574771,2589005,
  2592410,2612122,2616115,2622182,2634342,2641434,2652877,2657766,
  2664653,2674662,2689715,2694298,2699802,2707789,2715315,2744806,
  2756480,2773888,2790579,2805709,2817562,2838733,2864384,2934118,
  2947558,2955571,2963430,3010509,3090509,3136102,3199002,3262413,
  3351373,3409536,3454464,3513421,3562470,3640858,3752576,3871386,
  3971149,4065101,4186163,4347162,4372941,4430234,4449894,4463002,
  4476109,4482662,4495770,4515430,4528538,4541645,4548198,4561306,
  4580966,4594074,4607181,4626842,4626842,4659610,4672717,4679270,
  4692378,4712038,4731699,4751360,4764467,4784128,4810342,4884587,
  4917791,4950560,4969730,4983682,5010331,5036604,5048400,5210789,
  5447473,5609583,5794191,5841706,5863222,5901022,5911641,5937935,
  5941696,5969634,5987611,6004476,6009171,6011893,6034572,6056594,
  6068296,6096109,6106107,6271873,6409011,6526976,6680576,6898483],
[
  1507768,1646942,1723230,1779734,1833914,1869878,1912619,1944832,
  2024546,2162549,2263680,2332851,2361011,2389069,2560794,2581222,
  2608614,2627482,2652186,2667674,2678298,2700262,2722304,2739354,
  2755174,2765184,2778547,2809933,2815437,2828211,2844570,2875776,
  2884326,2900762,2911795,2934016,2956109,3113933,3123430,3142093,
  3169690,3182515,3657318,3979802,3989734,4319309,4340608,4495770,
  4570013,4590083,4609334,4635984,4642949,4656085,4668701,4688770,
  4708507,4721947,4728557,4754821,4766184,4780112,4793627,4806791,
  4819925,4826861,4846568,4853130,4866589,4886279,4892858,4912542,
  4919101,4929589,4950504,4970221,4977179,5044026,5064919,5084627,
  5098603,5117837,5125205,5138752,5163683,5170705,5238852,5388106,
  5537415,5645616,5733874,5764135,5780577,5861721,5882801,5896760,
  5914714,5933834,5942490,5944903,5951614,5959481,5961310,5972659,
  5988142,6000164,6003614,6005507,6011675,6014076,6015389,6016699,
  6018187,6022801,6023975,6033869,6047512,6055021,6061898,6064062,
  6066377,6067638,6068978,6070321,6071192,6072070,6072992,6073499,
  6074298,6074826,6076115,6076440,6098493,6098692,6121093,6232447,
  6257588,6304973,6310707,6316442,6323405,6334054,6349210,6358630,
  6368461,6373786,6379520,6385254,6394675,6406963,6419661,6429491,
  6436454,6440960,6447923,6457754,6470042,6479872,6489702,6497485,
  6502810,6509363,6517555,6526976,6537626,6549094,6560154,6563840,
  6569574,6576128,6585139,6596198,6606848,6616269,6625280,6630195,
  6635520,6642893,6649856,6659686,6672794,6686720,6691226,6694912,
  6700237,6705152,6713344,6721126,6736282,6747750,6755123,6759629,
  6764134,6768230,6773965,6781747,6793626,6804275,6818611,6823526,
  6827213,6831718,6837453,6842778,6850560,6864077,6878413,6885786,
  6889882,6894387,6898893,6902989,6908723,6915686,6931251,6943539,
  6950912,6955008,6959104,6963200,6967706,6973030,6977946,6986547,
  7003750,7015219,7019315,7023002,7026688,7031194,7035290,7041024,
  7048397,7060275,7078707,7082394,7086080,7089766,7094272,7099187,
  7103693,7110246,7140557,7302349,7457997,7553024,7658701,7754957,
  7858995,7963853,8055194,8188723,8670413,8814592,8965325,9116058],
], [
  750336,4784128,5923890,1683456,2569728,2629632,689920,737808,6905856,834048,1668416,5932304,
  759552,1597696,6508544,694016,742432,6692864,1683456,1733120,6705152,1650688,1881888,2641920,
  266240,5994064,7086080,1081344,1812240,1856544,1269760,1614080,6076737,619776,3817728,7122944,
  1880064,2365440,7561216,1474560,1812224,4456448,667648,5936996,6365184,1556480,1811488,6356992,
  1880064,2429696,4849664,1748992,2495488,2564096,764160,1069584,6762496,759552,1266720,6688768,
  759040,815888,6856704,1593344,1741056,2503168,1867776,2774784,6002737,1875968,2430720,6893568,
  1851392,2822912,4849664,750848,6076994,6815744,815872,4784128,5793057,624384,3167232,7081984,
  1798144,2626560,2696448,828928,2707712,4456448,676864,4980736,6303744,1810432,1873408,2433792,
  1622016,2438144,2564096,745984,1864704,6959104,807424,6750208,7028736,834048,1519872,6701056,
  834048,3682304,7684096,829696,2573568,7471104,820992,4456448,4849664,824320,4653056,6332416,
  1871872,2642688,2760960,812288,6320128,6594560,833536,2372096,2492160,1581056,1655040,7032832,
  1458176,6002513,6950912,1077248,1688352,1738048,833792,1340944,6815744,829184,6565888,7032832,
  1597440,1733632,6369280,1658880,1878016,2303488,1794048,1876224,4718592,1323008,1401088,4915200,
  758272,4718592,7090176,1056768,4587520,4784128,1339392,1683712,6496256,1654784,1876736,2650624,
  624384,4587520,7053312,834048,1476384,4456448,1486848,1733376,6377472,833792,2762240,4784128,
  1712128,4587520,4980736,1474560,1812304,6893568,1609728,2443008,4390912,1482752,1540352,4456448,
  755456,1332000,6295552,1794048,2638336,4390912,1716224,1860096,6766592,1601536,1819648,6426624,
  1728512,1873152,4653056,745984,1864464,6635520,729088,4718592,4849664,1163264,1544992,1615440,
  833792,1406528,6422528,274688,4915200,6002516,1478656,1738544,6059024,1527808,1810960,2491392,
  820224,2163456,4587520,824064,3678208,7036928,624384,4456448,6643712,816128,1782288,6905856,
  1716224,2576640,2622464,764160,1528880,6823936,833792,2574336,6299648,1114112,4653056,4980736,
  1802240,1872672,2490624,816128,1401088,6434816,829440,2576384,2703616,1818624,2789376,6844416,
  755200,1274912,6623232,1818624,2437632,6071824,1789952,1872928,5932353,1851392,2854912,5722913,
  829696,2428928,6002787,1056768,4653056,4718592,1871872,2230016,4915200,1875968,2855168,4718592,
  694272,4456448,6071602,764160,1405440,6075442,828928,1807648,4653056,1474560,1680688,7012352,
  1204224,1878096,7012352,824320,2297856,4915200,1683456,1729296,2572800,825344,3822080,7016448,
  1880064,2511104,2688768,745984,1659920,6750208,1748992,2646784,2715648,816640,3154176,6631424,
  1785856,2707968,5784352,1462272,1881120,6815744,1880064,2630912,2713344,833792,1073936,6823936,
  1421312,1484816,4390912,829440,1471760,6897664,679936,1869584,6496256,1794048,1872896,2626304,
  742400,1872656,6844416,1687552,1729808,2622464,833792,1541632,6963200,763136,6295552,6914048,
  1662976,1869632,6365184,1134592,4587520,4980736,1875968,2824448,4653056,764160,1081872,8138752,
  685056,5998096,6471680,1740800,3368192,7110656,1413120,4915200,7745536,623616,1864480,7053312,
  1613824,1882368,4456448,1748992,2687488,6504448,759808,812065,6631424,676608,1869584,6684672,
  541184,3805184,7122944,1851392,2822656,4718592,825344,2443008,2757120,1609728,1734144,2371840,
  829440,2438656,2828032,833280,2708224,5927969,742144,3612672,6950912,1552384,1742384,6311936,
  832256,4587520,6006625,763648,1331456,7086080,820480,5927712,6005264,671744,4653056,7110656,
  1753088,2557952,4587520,825344,1139200,6076227,1740800,1881680,2371584,1196032,1881904,6881280,
  755200,2687744,4587520,1163264,4653056,4980736,1802240,2761472,6635520,1687552,4718592,6077025,
  1855488,2687744,5928531,1359872,2297856,6002770,1462272,1602592,6369280,825344,1332000,6075985,
  1871872,3289344,6971392,1597440,1882416,6443008,833792,2651648,6504448,831744,4587520,4653056,
  1753088,2646784,2688768,763648,2233600,2491136,1093632,1213456,1877840,1613824,1881120,6623232,
  1732608,1819936,6492160,1511424,6002736,6050865,692992,1799456,6717440,1728512,1819920,6451200,
  1601536,1872896,6950912,689920,812065,7041024,832768,2720000,4456448,1818624,2757888,6782976,
  825344,1458688,6076176,1687552,2509568,2564352,1613824,1819136,2495488,754688,4849664,6488064,
  1531904,1811760,6071616,829184,1807664,6701056,1867776,3875072,7561216,763648,807969,6524928,
  833536,1729792,5796640,1687552,2304000,2431744,1683456,1754144,6631424,824832,2626560,4587520,
  1601536,2499840,6303744,1617920,1741568,8142848,694272,3428352,7020544,663808,1799168,7110656,
  618496,807985,7036928,816640,4390912,4784128,1810432,2425856,2627328,1859584,2704128,2760704,
  1859584,2573056,2625536,833536,1664000,7544832,823296,4718592,6397952,1732608,2433024,6076800,
  1347584,1819920,6496256,759552,812081,6815744,832256,1725472,6713344,692480,5927712,6075970,
  833024,1655040,6782976,763392,807969,6815744,1077248,1808416,4521984,741632,1864192,6852608,
  820992,1458688,6885376,1748992,2164736,6002259,1724416,2629888,2687744,834048,1475088,6897664,
  667648,4849664,5994048,806912,4718592,6492160,479232,6007106,6076482,833280,1655568,6955008,
  483328,5932900,6072434,1679360,1881888,2438656,811008,2434048,6828032,828416,2425600,4915200,
  672256,5862962,6067761,1155072,1807872,1864752,1601536,1872944,7020544,833792,2234112,2622208,
  832256,5936980,6002464,764160,1340720,9109504,471040,4915200,6443008,1617920,1741824,6762496,
  811776,4456448,4980736,1146880,1348096,5998432,671744,4587520,7081984,829440,1667872,4521984,
  824832,3227648,6463488,1867776,2494976,2835200,606464,1729824,7012352,1855488,4390912,4915200,
  828928,2621952,6766592,1196032,1546288,7077888,827648,4718592,7024640,819456,4587520,5727265,
  827904,4456448,6852608,1810432,2564864,6381568,832768,1729536,5854257,623104,812304,6791168,
  754176,6356992,6897664,1650688,1881888,5919794,759808,1405184,6561792,825344,2428928,7028736,
  1613824,2708992,4390912,825344,1720832,6512640,694272,4456448,6002804,553216,4390912,6705152,
  1347584,1470992,4915200,820480,2363904,4915200,790528,4653056,6002224,1642496,6006032,6076739,
  1425408,4390912,4849664,1875968,2365696,2438912,1617920,2434816,2506752,1216512,1549632,6488064,
  1163264,1483264,1684800,825344,6076225,6299648,1597440,1882448,4653056,344576,4980736,5849888,
  764160,2504448,7077888,1753088,1803824,2707712,1798144,2635264,2691072,1220608,1405952,1807888,
  471040,4849664,7098368,1769472,1865024,6955008,693248,820001,6316032,266240,1869088,6774784,
  832768,2564864,5792528,1122304,6002786,6059603,1712128,1869072,2715648,1781760,1869312,6909952,
  1667072,1882112,6963200,1867776,2692864,6006066,1351680,1384704,4915200,1458176,1671936,6950912,
  833792,2630656,2754304,829184,1803856,6058785,1617920,1734176,2295040,1609728,2163456,4653056,
  1245184,4849664,5858336,1208320,1803856,1847552,820736,1786624,6885376,1859584,2642944,6006337,
  1335296,1882416,2232320,833024,2785792,4456448,1572864,1881888,6631424,1331200,2232320,4915200,
  1683456,2371840,6422528,1867776,3764224,6967296,1687552,1812272,2229504,1880064,2765312,4784128,
  1617920,1729840,1872400,1224704,1283088,1602816,1622016,2233600,7614464,1335296,1812480,4784128,
  759808,1139456,9175040,1855488,3228416,6975488,755456,4653056,6983680,832768,1733632,6717440,
  1474560,1683984,4456448,833536,2429440,4849664,1662976,1869568,6434816,763904,812321,6582272,
  1794048,1847824,2786304,820224,6067472,7041024,824832,5936721,6504448,335872,6001424,6076516,
  1343488,1488160,7081984,757760,4653056,7086080,759552,1323520,6688768,1597440,1882384,2303232,
  816384,2753536,4587520,1794048,2692352,6299648,1667072,2233856,6006576,1687552,1750800,2642432,
  1404928,1820192,4456448,1490944,1812288,6365184,829184,1664000,6631424,759808,1340720,4390912,
  549120,676912,6914048,764160,4456448,4653056,1146880,1742336,6050866,829440,1663488,7016448,
  1138688,1865008,6006628,1339392,1808480,6492160,688640,6077027,6377472,1613824,1689104,4653056,
  1601536,1882416,2426368,759040,4390912,6979584,815872,6005792,6717440,1531904,1819936,5937184,
  1478656,1614848,4456448,833792,2511104,2630400,1617920,2511360,6504448,758784,807712,6975488,
  819456,4653056,6006832,3473408,3637760,4390912,1220608,1685008,6750208,834048,1528592,6897664,
  1662976,1819936,6963200,1593344,1729280,2564352,1597440,1873168,2360064,1265664,1808128,8716288,
  1671168,2498816,7090176,825344,1275136,5936160,1740800,1819920,7823360,624384,4390912,5927985,
  1871872,2373120,6750208,1818624,4587520,6067776,414464,4980736,6451200,1294336,1487360,1742656,
  692992,3498496,6844416,1794048,1872128,4653056,1093632,1151776,1877856,693760,3162624,7041024,
  829696,2634752,6619136,754176,6007137,6578176,622592,4587520,7122944,1163264,4849664,5989408,
  758784,811536,6758400,1331200,1872672,6684672,1159168,1209920,1873920,832000,6557696,6922240,
  763904,5928514,5994051,1798144,1873216,5936705,763648,812304,6823936,266240,5989681,6782976,
  834048,1414176,8847360,829696,2556416,4521984,1527808,1882384,2301952,1331200,2294016,4915200,
  811008,4587520,4849664,1290240,1480736,6623232,833280,2506752,2699520,832512,1733408,6316032,
  759552,1598208,6967296,729088,4980736,6578176,832768,2626304,6881280,1654784,1802496,4587520,
  764160,2557184,6828032,1474560,2294016,6072641,829440,2576896,2691072,763904,3306752,7081984,
  825344,2761728,6619136,834048,1475600,6631424,668160,1474816,6002805,832256,1602048,4521984,
  833024,2626816,6307840,1114112,4653056,4915200,623872,6762496,8134656,829184,3232256,6729728,
  1208320,4521984,4915200,1191936,6059536,6068257,685056,1663488,6836224,1794048,2717184,2764800,
  676608,1808128,6389760,833792,1598240,6750208,794624,6075698,6840320,1609728,2510848,2564352,
  1351680,1673040,1777920,689664,737808,6647808,833792,2756608,6520832,811520,2765056,4784128,
  1818624,2716160,5792545,1585152,2572288,6071600,1294336,4915200,5993760,1654784,1750288,6055200,
  833792,1340160,7491584,1748992,2443264,2691584,759808,1463312,6946816,825344,2753280,4587520,
  1748992,2578688,4390912,763392,1873152,6762496,1404928,1807872,1851920,1798144,2295040,4784128,
  1662976,2441728,2627328,1454080,1688064,9109504,828928,6787072,7553024,1486848,1611568,4521984,
  205056,4784128,4980736,764160,1471536,6071328,663808,1406464,7090176,758784,4587520,4849664,
  1753088,2164480,7749632,825344,1528880,7016448,1798144,3555584,7098368,829696,3170816,6795264,
  1597440,1807680,1843456,619520,746256,6455296,758528,6046497,6077056,761856,4653056,6070800,
  1093632,1266720,4784128,1650688,1881360,6447104,1818624,2622208,6451200,1667072,1812048,4390912,
  807424,5784352,8060928,807424,1733392,6840320,833792,2503680,5928208,598016,4784128,6075968,
  832512,2650368,6488064,1867776,2495488,6955008,397312,6072419,6459392,1458176,4915200,6075987,
  1196032,1732864,4784128,1818624,2557440,2634240,1441792,6071617,6496256,1687552,2370048,2627072,
  829440,1401872,6881280,1875968,2646528,2820352,829696,4521984,6860800,1290240,1410048,5932833,
  1445888,4456448,4915200,833536,6072704,6516736,667648,1873424,6598656,1658880,1819664,2631168,
  1449984,1878016,6001953,1875968,2369280,2428928,694272,1450240,7090176,545024,5932610,6336512,
  754944,3350528,7081984,1613824,6077043,6553600,1646592,1749248,4587520,1748992,2623744,4653056,
  1556480,1610512,4587520,688640,5858337,7098368,689408,1524240,7077888,1544192,1882208,4456448,
  825088,1131264,6077012,1839104,4849664,5722896,1662976,1882192,4587520,833024,2565120,2687232,
  824320,2502656,4915200,1880064,2716416,2773248,1794048,3813632,7106560,685312,746529,6893568,
  623104,6076512,6754304,1736704,1807120,2491648,834048,6553600,6631424,829696,1410608,6307840,
  692736,812304,6762496,1204224,1750784,5867329,1474560,1811744,1851648,1261568,1865248,6881280,
  1282048,1819136,6950912,831744,2699264,6971392,1789952,2581504,7086080,1679360,2639104,5992976,
  815872,1725456,6815744,824064,2818560,4587520,1724416,2581504,6067249,1810432,1872672,4653056,
  336128,4653056,6063666,816640,2163456,7872512,1650688,1876224,6713344,1486848,2370048,2425088,
  829696,2295040,7503872,745728,4456448,6983680,759040,1737472,7094272,692480,1598464,6508544,
  1617920,1679616,4587520,1720320,1806864,6782976,1290240,1419280,1664032,833536,1463344,6750208,
  1875968,2835712,5858080,1740800,1803856,4390912,1589248,1876480,2580736,763904,1659392,6688768,
  1740800,1819920,6578176,819200,1729040,6524928,1646592,1882640,4587520,1413120,1812256,2294784]);

export {
  BAC_TEN, BAC_KY, CHAT_TEN, HANG, HANG_TEN, MAU_BINH, CHI_TEN,
  bacOf, chatOf, cardTen, cardKy, laDo,
  mulberry32, deal,
  danhGia, soChi, hopLe, tenHang,
  mauBinh, mauBinhXep, thuongChi,
  chamVan, xepTuDong, napBangAI,
  // giaTri: cho công cụ dựng bảng — ĐÚNG thang số mà bộ óc dùng để so chi.
  chamSo as giaTri,
};
