// ============================================================
// ENGINE — NHẠC NỀN. Chọn bản theo MÀN và theo VÙNG đang đứng, đổi bản có nhoà tiếng.
// ============================================================
// Phần CHỌN BẢN là hàm thuần, đo được bằng bài kiểm. Phần PHÁT đụng `Audio` nên chỉ chạy ở trình
// duyệt — mọi hàm phát đều tự nuốt lỗi, hỏng nhạc KHÔNG được làm vỡ game.

const THU_MUC = 'audio/nhac/';

// ⚠⚠ BẢNG TRA TAY, TUYỆT ĐỐI ĐỪNG SUY TỪ `id.toLowerCase()`.
//    Mã vùng `phuKhongVien` mà tệp tên `phukhonghoavien.mp3` — viết thường ra `phukhongvien`,
//    lệch một chữ. GitHub Pages PHÂN BIỆT HOA/THƯỜNG nên đó là 404 IM LẶNG: máy mình chạy ngon,
//    lên live thì im bặt. Cùng cái bẫy đã dính với ảnh.
export const NHAC_VUNG = {
  lamLinhCoc: 'lamlinhcoc',
  uLam: 'ulam',
  huyenDo: 'huyendo',
  thuyTinhDong: 'thuytinhdong',
  langTieuPhong: 'langtieuphong',
  meAoLucChau: 'meaolucchau',
  phuKhongVien: 'phukhonghoavien',
  quanTinhDai: 'quantinhdai',
  tichNguDao: 'tichngudao',
  thienThanh: 'thienthanh',
};

/**
 * SÁU BẢN ĐỒ LỄ MƯỢN KÉ nhạc của vùng thường trực — chủ dự án chốt: chưa làm nhạc riêng cho lễ.
 *
 * ⚠⚠ MƯỢN THEO CẢNH, ĐỪNG ĐỂ RƠI VỀ BẢN MẶC ĐỊNH. Không có bảng này thì cả sáu lễ đều rơi về
 *    `lamlinhcoc` — nhạc thung lũng cấp 1 phát trong Cung Trăng và trên bờ Vong Xuyên. Mượn thì
 *    mượn cho đúng cảnh, tốn đúng một bảng tra.
 * ⚠ Không thêm tệp nào. Mỗi mục dưới đây trỏ vào một bản ĐÃ CÓ.
 */
export const NHAC_LE = {
  truongXuanMieuHoi: 'huyendo',        // sân miếu đêm giao thừa, đèn lồng, đông người -> thành người
  bichThaoNguyen: 'lamlinhcoc',        // thảo nguyên xanh sau mưa xuân -> thung lũng cỏ
  doanDuongGiang: 'meaolucchau',       // khúc sông trưa hè, đầm sen -> ốc đảo nhiều nước
  vongXuyenNgan: 'tichngudao',         // bờ Vong Xuyên, hoa đăng, sương lạnh -> đảo tiếng thì thầm
  quangHanNguyetCanh: 'quantinhdai',   // cung trăng lam bạc -> đài ngắm sao
  hanTungTuyetNguyen: 'langtieuphong', // rừng thông tuyết phủ -> đỉnh núi cao lạnh
};

/** Ba bản Chiến Đấu — đổi bản mỗi lần BƯỚC VÀO màn, không đổi giữa chừng. */
export const NHAC_CHIEN_DAU = ['chiendau', 'chiendau2', 'chiendau3'];

// ⚠⚠ XOAY VÒNG, KHÔNG `Math.random()`. Hai lẽ, cả hai đều quan trọng:
//   1. Bài kiểm "tính lại được" CẤM `Math.random` trong `main.js` ngoài hàm dev — cả bộ sinh số
//      của game phải có hạt giống để máy chủ tính lại được.
//   2. Bốc thật sự ngẫu nhiên thì có lúc ra ĐÚNG BẢN VỪA NGHE xong. Xoay vòng thì lần nào bước
//      vào cũng là một bản khác — đúng cái người chơi mong khi thấy có ba bản.
// Mốc bắt đầu lấy theo đồng hồ để hai phiên chơi khác nhau không luôn mở màn bằng cùng một bản.
let _keChienDau = Math.floor(Date.now() / 1000) % NHAC_CHIEN_DAU.length;

/** Số [0,1) trỏ tới bản Chiến Đấu KẾ TIẾP. Truyền thẳng vào `chonBan`. */
export function nhacChienDauKeTiep() {
  _keChienDau = (_keChienDau + 1) % NHAC_CHIEN_DAU.length;
  // Cộng nửa ô để `Math.floor(r * 3)` rơi đúng giữa ô, khỏi lo sai số dấu phẩy động ở mép.
  return (_keChienDau + 0.5) / NHAC_CHIEN_DAU.length;
}

/** Màn mang nhạc RIÊNG, đè lên nhạc vùng. */
export const NHAC_MAN = { combat: '@chienDau', worldboss: 'yeuvuong', dungeon: 'bicanh' };

export const NHAC_KHAI_TICH = 'khaitich';
export const NHAC_MAC_DINH = 'lamlinhcoc';

/**
 * Bản nào hợp với màn `view` khi đang đứng ở vùng `vungId`. HÀM THUẦN.
 *
 * ⚠⚠ MÀN MENU KHÔNG ĐỔI NHẠC. Hồ Sơ · Hành Lý · Trang Bị · Tông Môn… đều trả về NHẠC VÙNG, nên
 *    người chơi mở túi đồ rồi quay ra thì bản nhạc vẫn đang chạy dở chỗ cũ. Cho mỗi màn một bản
 *    là cứ bấm một cái lại cắt nhạc — đó là thứ khiến game nghe rẻ tiền.
 *
 * @param r số ngẫu nhiên [0,1) CHỈ dùng cho màn Chiến Đấu.
 */
export function chonBan(view, vungId, r) {
  const rieng = NHAC_MAN[view];
  if (rieng === '@chienDau') {
    const i = Math.floor((Number(r) || 0) * NHAC_CHIEN_DAU.length);
    return NHAC_CHIEN_DAU[Math.max(0, Math.min(NHAC_CHIEN_DAU.length - 1, i))];
  }
  if (rieng) return rieng;
  return NHAC_VUNG[vungId] || NHAC_LE[vungId] || NHAC_MAC_DINH;
}

/** Đường tới tệp của một bản. */
export function duongBan(ban) { return THU_MUC + ban + '.mp3'; }

/**
 * Âm lượng THẬT từ nấc trên thanh trượt.
 * ⚠ Bình phương chứ không tuyến tính: tai nghe theo lô-ga-rít, để tuyến tính thì kéo tới nửa
 *   thanh đã thấy gần như to hết cỡ, còn nửa dưới thì chen chúc không chỉnh được gì.
 */
export function amLuongThat(nac) {
  const p = Math.max(0, Math.min(100, Number(nac) || 0)) / 100;
  return p * p;
}

// ============================================================
// BỘ PHÁT
// ============================================================
// Hai thẻ `Audio` thay phiên nhau để NHOÀ TIẾNG lúc đổi bản. Cắt phựt một cái là nghe rất rẻ.

const NHOA_MS = 900;
let _A = null, _B = null;      // hai thẻ phát
let _dang = null;              // thẻ đang phát
let _banHien = '';             // mã bản đang phát
let _nac = 55;                 // nấc trên thanh trượt
let _bat = true;               // người chơi có bật nhạc không
let _moKhoa = false;           // trình duyệt đã cho phát chưa
let _cho = '';                 // bản đang đợi mở khoá
let _hen = null;               // bộ đếm nhoà tiếng
let _daBaoLoi = {};            // mã bản -> đã kêu lỗi rồi, khỏi kêu lại mỗi nhịp

function taoThe() {
  const a = new Audio();
  a.loop = true;
  a.preload = 'auto';
  a.volume = 0;
  return a;
}

function dungBoDem() { if (_hen) { clearInterval(_hen); _hen = null; } }

/**
 * Nhoà từ thẻ đang phát sang thẻ mới.
 * ⚠ Nhoà bằng một bộ đếm DUY NHẤT, và dừng bộ đếm cũ trước khi mở bộ mới. Hai bộ đếm cùng kéo
 *   một `volume` thì âm lượng nhảy loạn.
 */
function nhoaSang(the, dich) {
  dungBoDem();
  const cu = _dang, batDau = performance.now();
  const cuTu = cu ? cu.volume : 0;
  _hen = setInterval(() => {
    const t = Math.min(1, (performance.now() - batDau) / NHOA_MS);
    the.volume = dich * t;
    if (cu && cu !== the) cu.volume = cuTu * (1 - t);
    if (t >= 1) {
      dungBoDem();
      if (cu && cu !== the) { try { cu.pause(); } catch (e) {} }
    }
  }, 40);
  _dang = the;
}

/** Trình duyệt CẤM phát tiếng trước khi người dùng bấm một cái gì đó. Chờ cú bấm đầu tiên. */
export function moKhoaKhiBam() {
  if (_moKhoa) return;
  const mo = () => {
    if (_moKhoa) return;
    _moKhoa = true;
    ['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.removeEventListener(e, mo));
    if (_cho) { const b = _cho; _cho = ''; datBan(b); }
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.addEventListener(e, mo, { passive: true }));
}

/**
 * Phát bản `ban`. Đang phát đúng bản đó rồi thì KHÔNG làm gì — đây là chỗ giữ cho nhạc không bị
 * cắt mỗi lần người chơi bấm sang màn khác.
 */
export function datBan(ban) {
  if (!ban) return;
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
  if (!_bat) { _banHien = ban; return; }        // đang tắt: nhớ bản, bật lên là phát đúng nó
  if (!_moKhoa) { _cho = ban; return; }
  if (ban === _banHien && _dang && !_dang.paused) return;
  try {
    if (!_A) { _A = taoThe(); _B = taoThe(); }
    const the = (_dang === _A) ? _B : _A;
    the.src = duongBan(ban);
    the.currentTime = 0;
    the.volume = 0;
    the.onerror = () => {
      if (_daBaoLoi[ban]) return;
      _daBaoLoi[ban] = 1;
      console.warn('[nhac] khong nap duoc ' + duongBan(ban));
    };
    const p = the.play();
    // ⚠⚠ CHỈ `NotAllowedError` mới là "trình duyệt chặn tiếng". Đổi bản nhanh liên tiếp thì lời
    //    hứa `play()` trước bị huỷ với `AbortError` — vơ cả hai vào một rọ là nhạc TẮT HẲN cho
    //    tới cú bấm kế tiếp, mà người chơi không hiểu vì sao. Đo được: bấm qua lại giữa hai màn
    //    12 lần là im bặt, và `banDangPhat()` đứng lại ở bản cũ.
    if (p && p.catch) p.catch((loi) => {
      if (loi && loi.name === 'NotAllowedError') { _moKhoa = false; _cho = ban; moKhoaKhiBam(); }
    });
    _banHien = ban;
    nhoaSang(the, amLuongThat(_nac));
  } catch (e) { /* hong nhac KHONG duoc lam vo game */ }
}

/** Bật/tắt. Tắt thì dừng hẳn; bật lại thì phát tiếp bản đang nhớ. */
export function datBat(bat) {
  _bat = !!bat;
  if (!_bat) {
    dungBoDem();
    [_A, _B].forEach((t) => { if (t) { try { t.pause(); } catch (e) {} } });
    _dang = null;
    return;
  }
  const b = _banHien || _cho;
  _banHien = '';
  if (b) datBan(b);
}

export function datAmLuong(nac) {
  _nac = Math.max(0, Math.min(100, Number(nac) || 0));
  dungBoDem();
  if (_dang) { try { _dang.volume = amLuongThat(_nac); } catch (e) {} }
}

export function banDangPhat() { return _banHien; }
export function dangBat() { return _bat; }
export function daMoKhoa() { return _moKhoa; }
