// ============================================================
// TOÀN MÀN HÌNH — dùng CHUNG cho mọi bàn cờ / chiếu bài của Thiên Cơ Các.
// Bấm một nút là khung bàn phủ kín màn hình, KHÔNG còn thanh đầu trang, sidebar hay
// banner của game; điện thoại thì khoá luôn hướng NGANG cho bàn rộng ra.
//
// Hai đường vào, tự chọn:
//   1) Fullscreen API thật — Android Chrome, desktop. Kèm `screen.orientation.lock('landscape')`
//      (chỉ máy cảm ứng; máy bàn ném NotSupportedError nên phải nuốt lỗi).
//   2) Đường lui CSS — iPhone Safari KHÔNG cho `requestFullscreen` ở thẻ thường (chỉ video).
//      Phủ bằng `position:fixed;inset:0` + khoá cuộn trang. Nhìn giống hệt, chỉ là thanh
//      địa chỉ của trình duyệt vẫn còn.
//
// ⚠ Đường lui KHÔNG tự bắn sự kiện `resize` như Fullscreen API, mà mọi bàn 3D đều bám
//   `window.onresize` để đặt lại cỡ renderer ⇒ phải bắn hộ, không thì canvas giữ cỡ cũ.
// ============================================================

/** Bảng đăng ký: gốc bàn -> hàm gọi lại khi trạng thái đổi. */
const DANG_KY = new Map();
/** Thẻ đang phủ bằng đường lui CSS (chỉ một thẻ tại một lúc). */
let giaEl = null;

const SVG_VAO = '<path d="M8 3H5.5A2.5 2.5 0 0 0 3 5.5V8"/><path d="M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8"/><path d="M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16"/><path d="M16 21h2.5a2.5 2.5 0 0 0 2.5-2.5V16"/>';
const SVG_RA = '<path d="M3 8h2.5A2.5 2.5 0 0 0 8 5.5V3"/><path d="M21 8h-2.5A2.5 2.5 0 0 1 16 5.5V3"/><path d="M3 16h2.5A2.5 2.5 0 0 1 8 18.5V21"/><path d="M21 16h-2.5a2.5 2.5 0 0 0-2.5 2.5V21"/>';

function icon(d) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
}

/**
 * Markup nút, dùng đúng lớp `.<tienTo>-b` của từng bàn nên nó thừa hưởng luôn kiểu icon
 * tròn + nhãn nhỏ của bàn đó, khỏi phải khai lại.
 * ⚠ KHÔNG đặt `data-a`: ba bàn cờ nối `[data-a]` thẳng vào hàm act() của chúng, thêm hành
 *   động lạ vào đó là phải sửa cả ba tệp. Nút này tự nghe lấy qua `ganToanMan`.
 */
export function nutToanManHTML(tienTo) {
  return '<span class="' + tienTo + '-b tm-nut" data-tm="1" title="Toàn Màn Hình">' +
    '<span class="ic">' + icon(SVG_VAO) + '</span><span class="lb">Toàn Màn Hình</span></span>';
}

function themStyle() {
  if (document.getElementById('tm-style')) return;
  const st = document.createElement('style');
  st.id = 'tm-style';
  st.textContent = [
    // Khung bàn vốn bị ghìm bởi aspect-ratio + max-height (82dvh) — vào toàn màn hình phải gỡ hết,
    // không thì nó vẫn giữ đúng khung cũ giữa màn đen.
    '.tm-full{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;',
    '  min-height:0!important;aspect-ratio:auto!important;margin:0!important;border-radius:0!important;',
    '  border:0!important;box-shadow:none!important}',
    '.tm-gia{position:fixed!important;inset:0!important;z-index:2147483000!important;height:100dvh!important;width:100vw!important}',
    'html.tm-khoa,body.tm-khoa{overflow:hidden!important}',
    // Nhãn "Toàn Màn Hình" dài hơn ô 46px của cột nút ⇒ cho nút co theo chữ, và căn GIỮA
    // cột chứa nó (cột vốn `align-items:stretch`, một nút rộng hơn là mấy nút kia lệch trái).
    '.tm-nut{width:auto!important;min-width:46px}',
    ':where(div):has(>.tm-nut){align-items:center}',
  ].join('\n');
  document.head.appendChild(st);
}

function elNative() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

/** Máy này có cho phủ toàn màn hình bằng Fullscreen API thật không. */
function coNative(el) {
  const bat = document.fullscreenEnabled || document.webkitFullscreenEnabled;
  return !!bat && !!(el.requestFullscreen || el.webkitRequestFullscreen);
}

/** Bàn đang phủ toàn màn hình (dù bằng đường nào). */
export function dangToanMan(el) {
  return elNative() === el || giaEl === el;
}

/**
 * Gắn lớp `kh-nho` khi KHUNG BÀN thấp — điện thoại nằm ngang (kể cả lúc phủ toàn màn hình),
 * cửa sổ bé. Mỗi bàn tự khai kiểu rút gọn của mình dưới `.kh-nho`.
 * ⚠ Không thay được bằng media query: media query đo MÀN HÌNH, mà khung bàn nằm trong trang nên
 *   cao hơn hay thấp hơn màn hình đều được. Gọi trong onResize của từng bàn.
 */
export function capKhung(root) {
  root.classList.toggle('kh-nho', root.clientHeight < 460);
}

/**
 * Ép một bảng (bảng tổng kết cuối ván) VỪA HẲN trong khung bàn — user chốt 2026-07-30:
 * *"thiết kế cho phần kết thúc này k cần lăn chuột đc k … tôi k muốn lăn chuột để xem cái kết quả"*.
 * Đo chiều cao THẬT rồi thu nhỏ bằng `transform: scale`, thay vì cho cuộn.
 * ⚠ Phải gọi SAU khi bảng đã hiện (đang `display:none` thì đo ra 0).
 * ⚠ Phải gỡ `max-height` + `overflow` tạm thời mới đo được chiều cao thật, không thì CSS đã kẹp
 *   sẵn rồi, đo ra đúng bằng khung và tưởng là vừa.
 * @param {Element} bang  thẻ bảng (vd .bx-end)
 * @param {Element} khung thẻ gốc của bàn
 */
export function vuaKhung(bang, khung) {
  if (!bang || !khung) return;
  // ⚠ Chữ (Lora / Ma Shan Zheng) nạp SAU nên lần đo đầu ra thấp hơn thật ⇒ thu chưa đủ, bảng
  //   vẫn thò khỏi khung. Hẹn đo lại một nhịp nữa cho chắc.
  if (!bang._tmLai) {
    bang._tmLai = 1;
    setTimeout(function () { bang._tmLai = 0; if (bang.offsetParent) vuaKhung(bang, khung); }, 260);
  }
  const s = bang.style;
  s.removeProperty('transform');
  s.maxHeight = 'none';
  s.overflow = 'visible';
  const cao = bang.offsetHeight, rong = bang.offsetWidth;
  if (!cao || !rong) return;
  const H = khung.clientHeight - 14, W = khung.clientWidth - 14;
  let k = Math.min(1, H / cao, W / rong);
  bang.dataset.tm = cao + '/' + rong + ' trong ' + H + '/' + W + ' -> ' + k.toFixed(3);   // để trang đo đọc
  if (k >= 0.999) { s.removeProperty('transform'); s.maxHeight = ''; s.overflow = ''; return; }
  // Thu quá 0,52 thì chữ bé không đọc nổi — dừng ở đó và trả lại quyền cuộn cho phần dư.
  if (k < 0.52) { k = 0.52; s.maxHeight = Math.round(H / k) + 'px'; s.overflow = 'auto'; }
  s.transformOrigin = 'center center';
  // ⚠ PHẢI `!important`: bảng có sẵn animation bung ra (`bxPop`) mà **animation thắng style nội
  //   tuyến thường** — đặt suông thì tỉ lệ thu bị animation nuốt, bảng vẫn thò khỏi khung
  //   (đo được: tính đúng 0,821 mà thực tế vẫn là 0,97 của khung hình đầu animation).
  //   Chỉ `!important` của tác giả mới đứng trên animation trong thứ tự tầng bậc.
  s.setProperty('transform', 'scale(' + k.toFixed(3) + ')', 'important');
}

function camUng() {
  try { return window.matchMedia && matchMedia('(pointer:coarse)').matches; } catch (e) { return false; }
}

// Khoá hướng NGANG: chỉ có nghĩa trên máy cảm ứng và chỉ chạy được khi đang toàn màn hình.
// Máy bàn ném NotSupportedError — nuốt, đừng để nó nổi lên thành lỗi trang.
function khoaNgang() {
  if (!camUng()) return;
  try {
    const o = screen.orientation;
    if (o && o.lock) { const p = o.lock('landscape'); if (p && p.catch) p.catch(() => {}); }
  } catch (e) { /* máy không cho khoá hướng — kệ, vẫn toàn màn hình được */ }
}
function moKhoaNgang() {
  try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) { }
}

function banTin() {
  DANG_KY.forEach((cbs, el) => {
    const on = dangToanMan(el);
    el.classList.toggle('tm-full', on);
    veNut(el, on);
    cbs.forEach((fn) => { try { fn(on); } catch (e) { } });
  });
  // Bàn 3D đặt lại cỡ renderer theo `window.onresize`. Fullscreen API tự bắn, đường lui thì không.
  try { window.dispatchEvent(new Event('resize')); } catch (e) { }
}

function veNut(el, on) {
  const n = el.querySelector('.tm-nut');
  if (!n) return;
  const ic = n.querySelector('.ic'), lb = n.querySelector('.lb');
  if (ic) ic.innerHTML = icon(on ? SVG_RA : SVG_VAO);
  if (lb) lb.textContent = on ? 'Thu Nhỏ' : 'Toàn Màn Hình';
  n.setAttribute('title', on ? 'Thu Nhỏ' : 'Toàn Màn Hình');
}

function batGia(el) {
  giaEl = el;
  el.classList.add('tm-gia');
  document.documentElement.classList.add('tm-khoa');
  document.body.classList.add('tm-khoa');
  banTin();
}
function tatGia() {
  if (!giaEl) return;
  giaEl.classList.remove('tm-gia');
  document.documentElement.classList.remove('tm-khoa');
  document.body.classList.remove('tm-khoa');
  giaEl = null;
  banTin();
}

export function batToanMan(el) {
  themStyle();
  if (dangToanMan(el)) return;
  if (!coNative(el)) { batGia(el); khoaNgang(); return; }
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  let p = null;
  try { p = req.call(el, { navigationUI: 'hide' }); } catch (e) { p = null; }
  if (p && p.then) p.then(khoaNgang, () => batGia(el));      // bị từ chối thì lui về đường CSS
  else { khoaNgang(); setTimeout(() => { if (elNative() !== el) batGia(el); }, 260); }
}

export function tatToanMan(el) {
  if (giaEl === el) { tatGia(); moKhoaNgang(); return; }
  if (elNative() !== el) return;
  moKhoaNgang();
  try {
    const ex = document.exitFullscreen || document.webkitExitFullscreen;
    if (ex) { const p = ex.call(document); if (p && p.catch) p.catch(() => {}); }
  } catch (e) { }
}

export function chuyenToanMan(el) {
  if (dangToanMan(el)) tatToanMan(el); else batToanMan(el);
}

// ⛔ ĐÃ THỬ RỒI BỎ (2026-07-30): tự phủ màn hình ngay khi ngồi xuống chiếu. User bác thẳng —
//    *"k dc, bỏ cơ chế tự full màn hình đi, vẫn phải cần thao tác vào nút phóng to thì game mới
//    toàn màn hình hoàn chỉnh được"*. Phải do người chơi tự bấm. ĐỪNG làm lại.

let daNoi = false;
function noiSuKien() {
  if (daNoi) return;
  daNoi = true;
  const doi = () => { if (!elNative()) moKhoaNgang(); banTin(); };
  document.addEventListener('fullscreenchange', doi);
  document.addEventListener('webkitfullscreenchange', doi);
  // Đường lui không có ESC sẵn — phải tự bắt. (Đường thật thì trình duyệt nuốt ESC luôn.)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && giaEl) { e.stopPropagation(); tatGia(); moKhoaNgang(); }
  }, true);
}

/**
 * Gắn nút Toàn Màn Hình cho một bàn.
 * @param {Element} root  thẻ gốc của bàn (chính thẻ sẽ được phủ kín màn hình)
 * @param {Function} [onDoi]  gọi lại mỗi lần vào/ra toàn màn hình — bàn 3D truyền `onResize`
 * @returns {{destroy:Function}}
 */
export function ganToanMan(root, onDoi) {
  themStyle();
  noiSuKien();
  const cbs = DANG_KY.get(root) || [];
  if (onDoi) cbs.push(onDoi);
  DANG_KY.set(root, cbs);
  const nut = root.querySelector('.tm-nut');
  const bam = (e) => { e.preventDefault(); e.stopPropagation(); chuyenToanMan(root); };
  if (nut) nut.addEventListener('click', bam);
  veNut(root, dangToanMan(root));
  return {
    destroy() {
      if (nut) nut.removeEventListener('click', bam);
      // Rời bàn mà vẫn đang phủ màn hình thì phải nhả ra, không thì người chơi kẹt ở màn đen.
      if (dangToanMan(root)) tatToanMan(root);
      DANG_KY.delete(root);
    }
  };
}
