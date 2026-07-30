// ============================================================
// BINH XẬP XÁM (十三水) — mini-game bàn bài 3D (side-content, 0-power trừ cược Trù Mã).
// Khuôn Tiến Lên: cách ly, CHỈ đọc/ghi state.binh (+ state.kyHon và state.truMa dùng chung).
// Bàn 3D = WebGL (Three.js, lazy-load src/lib/three.min.js chỉ khi vào chiếu).
// LUẬT + CHẤM ĐIỂM nằm ở engine THUẦN src/engine/binh.js.
// Phần 3D + bảng Xếp Bài bê từ mockup đã chốt LOOK: _mockup/binh_3d.html + binh_view.js.
//
// ⚠ CƠ CHẾ KHÁC HẲN TIẾN LÊN: không đánh theo lượt. Mỗi nhà 13 lá, tự xếp thành ba chi
//   (Đầu 3 · Giữa 5 · Cuối 5) rồi lật so cùng lúc. Đơn vị ăn thua là CHI, không phải hạng về.
// ⚠ CAMERA TRỰC GIAO — xem chú thích ở init3D, đừng đổi về phối cảnh.
// ============================================================
import { Storage } from './engine/save.js';
import { addKyHon, getKyHon, kyNgheOf } from './engine/kyhon.js';   // Kỳ Hồn + danh hiệu Kỳ Nghệ dùng CHUNG
import { ensureTruMa, soTruMa, doiTruMa, ghiVan, MUC_DOI, TI_GIA } from './engine/truma.js';   // đồng riêng của chiếu bài
import { getGocNhin, saveGocNhin, clearGocNhin } from './engine/gocnhin.js';
import { ganToanMan, nutToanManHTML, capKhung, vuaKhung } from './engine/toanman.js';   // phủ kín màn hình + khoá hướng ngang
import { demChia, GIAY_CHIA, GIAY_VAN_MOI } from './engine/demchia.js';   // đếm ngược rồi mới chia bài
import { taoTuChinh, nhipDam } from './engine/muot.js';   // tự chỉnh tỉ lệ điểm ảnh + nhịp cho việc phụ

/** Sổ riêng của Binh Xập Xám. Cách ly hoàn toàn với phần cày chính. */
export function ensureBinh(state) {
  if (!state.binh) state.binh = {};
  const n = state.binh;
  if (!n.rec) n.rec = {};              // { chieuId: { van, thang, samBanh } }
  if (n.van == null) n.van = 0;        // tổng số ván đã chơi
  if (n.thang == null) n.thang = 0;    // tổng số ván ăn chi
  if (n.samBanh == null) n.samBanh = 0;
  if (n.lai == null) n.lai = 0;        // lãi/lỗ TRÙ MÃ cộng dồn (không phải Bạc)
  ensureTruMa(state);
}

// ---------- lazy-load Three.js ----------
function ensureThree() {
  if (window.THREE) return Promise.resolve();
  if (window._ntkThreeP) return window._ntkThreeP;   // dùng chung promise với các bàn cờ khác
  window._ntkThreeP = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'src/lib/three.min.js';
    s.onload = () => res();
    s.onerror = () => rej(new Error('Không tải được thư viện 3D.'));
    document.head.appendChild(s);
  });
  return window._ntkThreeP;
}

// Engine nạp ĐỘNG (chỉ khi vào chiếu) — hỏng thì chỉ hỏng riêng Binh Xập Xám, không vỡ cả game.
let E = null;
function ensureEngine() {
  if (E) return Promise.resolve();
  return import('./engine/binh.js').then((m) => {
    const need = ['deal', 'danhGia', 'soChi', 'hopLe', 'mauBinh', 'thuongChi', 'chamVan', 'xepTuDong', 'tenHang'];
    for (const k of need) if (typeof m[k] !== 'function') throw new Error('Engine Binh Xập Xám thiếu hàm ' + k + '.');
    E = m;
  });
}


var TAY = ['Nam', 'Đông', 'Bắc', 'Tây'];
var R_BAN = 7.15, TH = 0.52, TOPY = TH / 2;
var R_NI = 5.55;
var CW = 0.70, CH = 0.98, CT = 0.022;

// ---- Thang bậc hạng bài: Mậu Thầu < Đôi < Thú < Xám Chi < Sảnh < Thùng < Cù Lũ < Tứ Quý < Thùng Phá Sảnh
// Màu lấy thẳng bảng phẩm chất của game (`src/data/items.js` QUALITY) để nhìn màu là quen mắt ngay:
// xám Thường · lục Tốt · lam Hiếm · tím Cực Hiếm · hồng Sử Thi · cam Truyền Thuyết · hổ phách Độc Nhất.
// Hai bậc đỉnh vượt khỏi bảng nên dùng ngà sáng + quầng vàng — "trên cả hổ phách".
// ⚠ Quầng là TĨNH (box-shadow/text-shadow), không animation — xem feedback-ui-tieudao-glow-icon.
var MAU_HANG = ['#8fa0b5', '#cbd5e1', '#6ee7b7', '#93c5fd', '#c4b5fd', '#f0abfc', '#fdba74', '#fcd34d', '#fff3d0'];
var QUANG_HANG = [0, 0, 0.16, 0.24, 0.32, 0.42, 0.54, 0.68, 0.88];
function rgba(hex, a) {
  var n = parseInt(hex.slice(1), 16);
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}

/**
 * Chip hạng bài — màu, viền và quầng leo theo bậc, liếc một cái là biết chi này mạnh cỡ nào.
 * ⚠ Đã thử kèm thanh vạch 9 nấc, USER BÁC: *"k cần thanh này đâu, tên đổi màu là ổn rồi"*.
 * Đừng làm lại. Chỉ CHỮ ĐỔI MÀU.
 * Để NGOÀI closure cho thuần — trang `_binh_hang.html` gọi thẳng để soi cả thang một lượt.
 */
function hangHTML(dg) {
  if (!dg) return '';
  var h = dg.hang, m = MAU_HANG[h], q = QUANG_HANG[h];
  var st = 'color:' + m + ';background:' + rgba(m, 0.10) + ';border:1px solid ' + rgba(m, 0.34 + q * 0.3);
  if (q) st += ';box-shadow:0 0 11px -2px ' + rgba(m, q * 0.62) + ',inset 0 0 14px -8px ' + rgba(m, q);
  if (q >= 0.5) st += ';text-shadow:0 0 9px ' + rgba(m, q * 0.75);
  return '<span class="bxp-hang" style="' + st + '">' + E.tenHang(dg) + '</span>';
}

// ================= BA KIỂU BÀY BÀI TRÊN BÀN =================
// Chỉ đổi CHỖ ĐẶT, không đụng luật. Ràng buộc chung (user chốt từ vòng 2, đừng phá):
// bốn nhà CÙNG MỘT HƯỚNG (ngửa lên, không xoay theo chỗ ngồi) và CÙNG MỘT CỠ —
// lúc so chi mắt phải quét ngang bốn nhà một lượt.
//   neo(s)        → [x,z] tâm khu của nhà s
//   viTri(s,r,i)  → [dx,dz] lệch so với tâm khu, chi r ô thứ i
//   bao(s)        → {hw,hz} nửa bề khu (dùng cho căn camera + đặt thẻ tên)
//   nhanCho(s)    → thẻ tên treo 'tren' | 'duoi' | 'trai' khu bài
var SUC_CHI = [3, 5, 5];
var BO_CUC = {
  1: {
    ten: 'Bốn Góc Bàn',
    mo: 'Bốn nhà ngồi bốn phía như bàn bài thật. Mỗi nhà một khối ba chi 3·5·5 xếp trái, lá chồng nửa.',
    // ⚠ Cái ghìm cỡ lá ở kiểu này KHÔNG phải bề ngang mà là CHIỀU SÂU: khu rộng 3.96 nên dải x của
    // Nam/Bắc cắt ngang dải x của Đông/Tây, buộc phải lùi Nam/Bắc xa hơn cả chiều sâu một khu
    // (z0 ≥ d) — tới 3.30 là đã chạm mép nỉ, hết đường phóng.
    // Cho lá CHỒNG NỬA (step = 0.5 bề rộng lá) thì khu chỉ còn rộng 2.10·sc, đủ để đẩy Đông/Tây
    // RA KHỎI dải x của Nam/Bắc (x0 ≥ bề rộng khu). Ràng buộc chiều sâu biến mất ⇒ sc 1.06 → 1.42.
    // Chồng nửa vẫn đọc trọn bài: bậc + chất nằm gọn trong nửa TRÁI của lá.
    // Chồng CẢ HAI CHIỀU: ngang `step 0.35` (nửa bề rộng lá) · dọc `buocZ 0.52` (hàng sau đè lên
    // hàng trước, mỗi chi chỉ lộ phần đầu lá). Chồng dọc làm khu NÔNG đi gần một nửa
    // (2.04 lá thay vì 3.15) ⇒ còn chỗ phóng lá tiếp: sc 1.36 → 1.48.
    // Bậc + chất nằm ở GÓC TRÊN-TRÁI nên chồng cả hai chiều vẫn đọc trọn bài.
    sc: 1.48, step: 0.35, buocZ: 0.52,
    // x0 = bề rộng khu (3.11) + khe 0.28. Ép sát thì bốn khu dính thành một mảng, không ra bốn tay bài.
    // z0 3.40: đẩy khu mình và khu đối diện ra SÁT mép nỉ (chừa 0.25), lấy chỗ trống ở giữa
    // cho thoáng thay vì để thừa hai dải nỉ ở trên và dưới.
    NEO: [[0, 3.40], [3.39, 0], [0, -3.40], [-3.39, 0]],
    // Thẻ (chân dung + tên + hạng) ghim ra MÉP KHUNG phía nhà đó, không bám sát khu bài nữa —
    // bốn mảng tối quanh bát giác đang bỏ không, mà thẻ rời khỏi nỉ thì bài thoáng hẳn.
    // Nam/Bắc: thẻ bám SÁT khối bài (trên/dưới) nên thẻ nở thêm dòng thì tự nới ra ngoài,
    // không đè xuống bài. Đông/Tây: ghim ra mép trái/phải khung, chỗ đó rộng rãi.
    nhanGoc: true, MEP: ['duoi', 'phai', 'tren', 'trai'],
    neo: function (s) { return this.NEO[s]; },
    viTri: function (s, r, i) {
      var b = this.step * this.sc;
      return [-4 * b / 2 + i * b, (r - 1) * CH * this.sc * this.buocZ];
    },
    bao: function () {
      return {
        hw: (4 * this.step * this.sc + CW * this.sc) / 2,
        hz: (2 * CH * this.sc * this.buocZ + CH * this.sc) / 2
      };
    },
    nhanCho: function (s) { return s === 0 ? 'duoi' : 'tren'; }
  },
  2: {
    ten: 'Bốn Hàng So Chi',
    mo: 'Mỗi nhà một hàng ngang 3+5+5, bốn hàng chồng lên nhau. Ba chi thẳng cột giữa bốn nhà nên so chi là rà mắt theo CỘT DỌC.',
    // Hàng 13 lá ăn hết bề ngang nỉ nên phải cho lá CHỒNG NHẸ (bước 0.62 < bề rộng lá 0.70,
    // lộ 88% mặt lá — bậc + chất nằm ở góc trên-trái chỉ chiếm ~27% nên vẫn đọc trọn).
    // Nhờ vậy lá to bằng kiểu 1 chứ không bị teo.
    sc: 1.05, step: 0.62, kheChi: 0.5, buocHang: 1.18,
    HANG: [3, 2, 0, 1],        // HANG[nhà] = hàng thứ mấy từ trên xuống; mình luôn ở hàng dưới cùng
    neo: function (s) { return [0, (this.HANG[s] - 1.5) * CH * this.sc * this.buocHang]; },
    viTri: function (s, r, i) {
      var b = this.step * this.sc, kh = this.kheChi * CW * this.sc;
      var truoc = 0;
      for (var k = 0; k < r; k++) truoc += SUC_CHI[k];
      return [-(12 * b + 2 * kh) / 2 + (truoc + i) * b + r * kh, 0];
    },
    bao: function () {
      var b = this.step * this.sc, kh = this.kheChi * CW * this.sc;
      return { hw: (12 * b + 2 * kh + CW * this.sc) / 2, hz: CH * this.sc / 2 };
    },
    nhanCho: function () { return 'trai'; }   // treo trên/dưới thì đè ngay vào hàng kế bên
  },
  3: {
    ten: 'Hai Cặp Đối Nhau',
    mo: 'Bốn khối 3·5·5 xếp lưới hai hàng hai cột, lấp kín mặt nỉ — không còn khoảng trống hình chữ thập ở giữa bàn.',
    sc: 0.95, step: 0.759, buocZ: 1.073, kheX: 0.50, kheZ: 0.50,
    // Bạn dưới-trái, rồi đi thuận chiều kim đồng hồ giữ đúng thứ tự chỗ ngồi
    GOC: [[-1, 1], [1, 1], [1, -1], [-1, -1]],
    neo: function (s) {
      var b = this.bao(), g = this.GOC[s];
      return [g[0] * (b.hw + this.kheX / 2), g[1] * (b.hz + this.kheZ / 2)];
    },
    viTri: function (s, r, i) {
      var b = this.step * this.sc;
      return [-4 * b / 2 + i * b, (r - 1) * CH * this.sc * this.buocZ];
    },
    bao: function () {
      return {
        hw: (4 * this.step * this.sc + CW * this.sc) / 2,
        hz: (2 * CH * this.sc * this.buocZ + CH * this.sc) / 2
      };
    },
    nhanCho: function (s) { return this.GOC[s][1] > 0 ? 'duoi' : 'tren'; }
  }
};

function mountBinh(host, opts) {
  var THREE = window.THREE, B = E;
  opts = opts || {};
  var cuoc = opts.cuoc || 1000;
  var rnd = opts.seed ? B.mulberry32(opts.seed) : Math.random;
  var CUA = [{ ten: (opts.nguoiChoi && opts.nguoiChoi.ten) || 'Bạn' }];
  for (var q = 0; q < 3; q++) {
    var d = (opts.doiThu && opts.doiThu[q]) || {};
    CUA.push({ ten: d.ten || ('Nhà ' + TAY[q + 1]), bietHieu: d.bietHieu || '', art: d.art || '' });
  }

  // ⚠ Bảng SVG phải nằm TRƯỚC chỗ dựng markup: `var` được cẩu lên nhưng GIÁ TRỊ thì không,
  // để dưới là lúc gọi ic() nó còn undefined và ném ngay, markup không kịp gắn.
  var SVG_I = {
    eye: '<path d="M2.4 12S6 5.6 12 5.6 21.6 12 21.6 12 18 18.4 12 18.4 2.4 12 2.4 12Z"/><circle cx="12" cy="12" r="3"/>',
    exit: '<path d="M14 4h4.5a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 8l-4 4 4 4"/><path d="M6 12h9"/>'
  };
  function ic(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + SVG_I[n] + '</svg>'; }

  injectStyle();
  host.innerHTML =
    '<div class="bx-root">' +
      '<div class="bx-scene"></div><div class="bx-vig"></div>' +
      '<div class="bx-fb"><div>Không khởi tạo được 3D trên máy này.</div><div class="fm"></div></div>' +
      '<div class="bx-title"><span class="hz">十三水</span><span class="vz">Binh Xập Xám</span></div>' +
      '<div class="bx-sub">' + (opts.chieu || '') + ' · cược ' + fmt(cuoc) + ' Trù Mã mỗi chi</div>' +
      '<div class="bx-canh"></div>' +
      // popup xếp bài — thao tác 2D, thấy rõ ba chi và bài chờ cùng lúc
      '<div class="bxp-wrap"><div class="bxp">' +
        '<div class="bxp-top"><b>Xếp Bài</b><span class="bxp-canh"></span>' +
          '<span class="bxp-dh"></span><span class="bxp-x" data-a="dong" title="Đóng, ra bàn xem">✕</span></div>' +
        '<div class="bxp-mb"></div>' +
        '<div class="bxp-body"></div>' +
        '<div class="bxp-act">' +
          '<span class="bx-btn pri dis" data-a="binh">Binh</span>' +
          '<span class="bx-btn" data-a="tudong">Xếp Tự Động</span>' +
          '<span class="bx-btn ghost" data-a="xoa">Xếp Lại</span>' +
        '</div>' +
      '</div></div>' +
      '<div class="bx-left">' +
        nutToanManHTML('bx') +
        '<span class="bx-b" data-a="spectate"><span class="ic">' + ic('eye') + '</span><span>Quan Chiến</span></span>' +
        '<span class="bx-b" data-a="exit"><span class="ic">' + ic('exit') + '</span><span>Rời Chiếu</span></span>' +
      '</div>' +
      '<div class="bx-act"><span class="bx-btn" data-a="mo">Mở Bảng Xếp Bài</span></div>' +
      '<div class="bx-toast"></div>' +
      '<div class="bx-banner"><div class="bx-end"><div class="bt"></div><div class="rule"></div><div class="bs"></div>' +
        '<table class="bx-luoi"></table>' +
        '<div class="btns"><span class="bx-btn pri" data-a="again">Ván Mới</span><span class="bx-btn ghost" data-a="exit">Rời Chiếu</span></div>' +
      '</div></div>' +
    '</div>';

  var root = host.firstElementChild;
  var $ = function (s) { return root.querySelector(s); };
  var scEl = $('.bx-scene');
  // Toàn màn hình: phủ CHÍNH thẻ gốc nên vào là mất sạch thanh đầu trang / sidebar / banner.
  // Vào ra đều phải tính lại camera + cỡ renderer ⇒ truyền thẳng onResize.
  var tm = ganToanMan(root, function () { onResize(); coLaPopup(); });
  function fmt(n) { return (n | 0).toLocaleString('vi-VN'); }


function injectStyle() {
  if (document.getElementById('bx-style')) return;
  var st = document.createElement('style');
  st.id = 'bx-style';
  st.textContent = [
    '.bx-root{position:relative;width:100%;max-width:100%;margin:0 auto;aspect-ratio:16/11;max-height:82dvh;border-radius:16px;overflow:hidden;background:#0b0e16;box-shadow:0 24px 60px -30px #000;border:1px solid #1e2b3a;touch-action:none;user-select:none;',
    '  --gold:#e6c079;--gold2:#f4d99a;--txt:#f0e7d8;--txt2:#b6a68f;--txt3:#7d6c58;--warn:#e08a6a;--serif:\'Lora\',Georgia,serif}',
    '.bx-root *{box-sizing:border-box}',
    '.bx-scene{position:absolute;inset:0}',
    '.bx-scene canvas{display:block!important;width:100%!important;height:100%!important}',
    '.bx-vig{position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 140px -22px rgba(4,7,12,.95)}',
    '.bx-fb{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--txt2);text-align:center;padding:20px;font-family:var(--serif)}',
    '.bx-title{position:absolute;left:16px;top:12px;pointer-events:none;display:flex;align-items:baseline;gap:9px;line-height:1;z-index:4}',
    '.bx-title .hz{font-family:\'Ma Shan Zheng\',cursive;font-size:27px;color:var(--gold2);text-shadow:0 2px 18px rgba(230,192,121,.45)}',
    '.bx-title .vz{font-family:var(--serif);font-weight:700;font-size:14.5px;color:var(--gold2)}',
    '.bx-sub{position:absolute;left:17px;top:44px;font-family:var(--serif);font-size:11px;color:var(--txt3);z-index:4;pointer-events:none}',
    // ba nhãn chi xếp dọc bên phải, theo đúng thứ tự từ chi Cuối lên chi Đầu như trên bàn
    '.bx-right{position:absolute;right:12px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:8px;z-index:5;pointer-events:none}',
    '.bx-chi{font-family:var(--serif);font-size:12px;color:var(--txt2);background:rgba(15,21,33,.88);border:1px solid #1e2b3a;border-radius:10px;padding:6px 12px;white-space:nowrap;transition:.15s}',
    '.bx-chi.du{color:var(--gold2);border-color:rgba(230,192,121,.5)}',
    // Pill trạng thái dời sang PHẢI: đỉnh-giữa là chỗ của thẻ tên nhà Bắc (khu bài nhà Bắc
    // nằm đúng giữa màn), để ở giữa là hai cái chồng nhau.
    '.bx-canh{position:absolute;right:14px;top:12px;font-family:var(--serif);font-size:12px;color:var(--txt2);background:rgba(15,21,33,.85);border:1px solid #1e2b3a;border-radius:99px;padding:5px 15px;z-index:5;pointer-events:none;white-space:nowrap}',
    '.bx-canh.xau{color:var(--warn);border-color:rgba(224,138,106,.5)}',
    '.bx-left{position:absolute;left:11px;top:66%;transform:translateY(-50%);display:flex;flex-direction:column;gap:9px;z-index:6}',
    '.bx-b{display:flex;flex-direction:column;align-items:center;gap:3px;color:var(--txt2);cursor:pointer;width:46px}',
    '.bx-b .ic{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(15,21,33,.8);border:1px solid rgba(230,192,121,.24);color:var(--gold);transition:.12s}',
    '.bx-b .ic svg{width:18px;height:18px}',
    '.bx-b span{font-size:9.5px;white-space:nowrap;font-family:var(--serif)}',
    '.bx-b:hover .ic{border-color:var(--gold2);color:#fff}',
    '.bx-act{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);display:flex;gap:9px;z-index:6}',
    '.bx-btn{font-family:var(--serif);font-size:13px;font-weight:600;letter-spacing:.03em;padding:8px 20px;border-radius:10px;cursor:pointer;transition:.14s;white-space:nowrap;color:var(--gold2);background:rgba(15,21,33,.85);border:1px solid rgba(230,192,121,.45)}',
    '.bx-btn:hover{background:rgba(230,192,121,.15);border-color:var(--gold2)}',
    '.bx-btn.pri{color:#2a1c06;background:linear-gradient(180deg,#f6dc9c,#dfb45f);border-color:#f0d78f;box-shadow:0 0 20px -7px var(--gold)}',
    '.bx-btn.ghost{color:#cdbda6;border-color:#33424a;background:rgba(11,17,26,.8)}',
    '.bx-btn.dis{opacity:.34;pointer-events:none}',
    '.bx-toast{position:absolute;left:16px;top:70px;transform:translateY(-6px);opacity:0;font-family:var(--serif);font-size:12.5px;color:var(--txt);background:rgba(15,21,33,.94);border:1px solid rgba(230,192,121,.3);padding:6px 15px;border-radius:99px;pointer-events:none;transition:.2s;z-index:8;max-width:calc(100% - 32px)}',
    '.bx-toast.show{opacity:1;transform:translateY(0)}',
    '.bx-banner{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(6,9,14,.8);z-index:12;padding:18px}',
    '.bx-banner.show{display:flex}',
    '.bx-end{position:relative;width:min(470px,96%);max-height:94%;overflow:auto;padding:22px 26px 18px;border-radius:18px;background:linear-gradient(180deg,rgba(19,27,40,.98),rgba(11,16,24,.99));border:1px solid rgba(230,192,121,.22);box-shadow:0 30px 70px -30px #000}',
    '.bx-banner.show .bx-end{animation:bxPop .3s cubic-bezier(.2,.7,.3,1)}',
    '@keyframes bxPop{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}',
    '.bx-end::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,var(--acc,#e6c079),transparent)}',
    '.bx-end.win{--acc:#f4d99a}.bx-end.hoa{--acc:#c9b48d}.bx-end.lose{--acc:#a08874}',
    '.bx-end .bt{font-family:var(--serif);font-weight:700;font-size:27px;color:var(--acc);text-align:center}',
    '.bx-end .rule{width:64px;height:1px;margin:10px auto 12px;background:linear-gradient(90deg,transparent,var(--acc),transparent);opacity:.8}',
    '.bx-end .bs{font-family:var(--serif);font-style:italic;font-size:12.5px;color:var(--txt2);line-height:1.55;text-align:center;margin-bottom:14px}',
    '.bx-tab{width:100%;border-collapse:collapse;font-family:var(--serif);font-size:12px}',
    '.bx-tab th{font-size:10px;font-weight:600;color:var(--txt3);text-align:left;padding:0 6px 5px;letter-spacing:.05em;text-transform:uppercase;border-bottom:1px solid rgba(230,192,121,.16)}',
    '.bx-tab th.r,.bx-tab td.r{text-align:right}',
    '.bx-tab td{padding:6px;color:var(--txt2);border-bottom:1px solid rgba(230,192,121,.07);vertical-align:top}',
    '.bx-tab tr.me td:first-child{color:var(--gold2);font-weight:600}',
    '.bx-tab .pos{color:#7fd6b5}.bx-tab .neg{color:var(--warn)}',
    '.bx-tab .sub{display:block;font-size:10px;color:var(--txt3);font-style:italic;margin-top:2px}',
    '.bx-tab .sub .xau{color:var(--warn)}.bx-tab .sub .mb{color:#f4d99a}',
    // bảng LƯỚI: hàng = ba chi, cột = bốn nhà — nhìn phát thấy chi nào ăn chi nào thua
    '.bx-luoi{width:100%;border-collapse:collapse;font-family:var(--serif);font-size:11.5px;table-layout:fixed}',
    '.bx-luoi th{font-size:10px;font-weight:600;color:var(--txt3);padding:0 4px 6px;text-align:center;border-bottom:1px solid rgba(230,192,121,.16);vertical-align:bottom}',
    '.bx-luoi th.me{color:var(--gold2)}',
    // Chân dung + tên trên đầu cột. Tên PHẢI một dòng có dấu ba chấm: "Tề Mạc Sơn" mà cho xuống
    // dòng thì đầu bảng cao gấp ba, đẩy bảng tràn khỏi khung ở khổ điện thoại.
    '.bx-luoi th .av{display:block;width:26px;height:26px;border-radius:7px;object-fit:cover;object-position:50% 16%;',
    '  margin:0 auto 4px;border:1px solid rgba(230,192,121,.35);background:#141c28}',
    '.bx-luoi th .nm{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.bx-luoi td{padding:7px 4px;color:var(--txt2);text-align:center;border-bottom:1px solid rgba(230,192,121,.07);line-height:1.3}',
    '.bx-luoi td.lb{text-align:left;color:var(--txt3);font-size:10.5px;white-space:nowrap;width:64px}',
    '.bx-luoi td.me{color:var(--txt)}',
    // Cột của mình sáng lên thành một dải dọc — liếc là biết cột nào đọc trước.
    '.bx-luoi th.me,.bx-luoi td.me{background:rgba(230,192,121,.07)}',
    '.bx-luoi td b{display:block;font-size:11px;margin-top:2px}',
    '.bx-luoi .pos{color:#7fd6b5}.bx-luoi .neg{color:var(--warn)}',
    '.bx-luoi tr.tong td{border-bottom:0;padding-top:9px;padding-bottom:8px;font-weight:600;background:rgba(230,192,121,.09)}',
    '.bx-luoi tr.tong td.me{background:rgba(230,192,121,.15)}',
    '.bx-luoi tr.tong td:first-child{border-radius:9px 0 0 9px}.bx-luoi tr.tong td:last-child{border-radius:0 9px 9px 0}',
    // nhãn tên nhà bám theo khu bài trên bàn
    '.bx-nhan{position:absolute;transform:translate(-50%,-50%);text-align:center;pointer-events:none;z-index:5;',
    '  display:flex;align-items:center;gap:8px;',
    '  background:rgba(11,17,26,.82);border:1px solid #1e2b3a;border-radius:10px;padding:4px 10px;',
    // ⚠ Phải chặn bề rộng: dòng Sâm Banh có thể liệt kê hai tên nhà, thẻ nở ra là thò vào đè bài.
    '  white-space:nowrap;max-width:236px}',
    '.bx-nhan .tx{min-width:0}',
    // ⚠ Chân dung 36px: khu nhà Bắc đã đẩy sát mép nỉ nên chỗ còn lại tới mép khung rất hẹp,
    // ảnh to hơn là thẻ cao lên và đè xuống mép bài.
    '.bx-nhan .av{width:36px;height:36px;border-radius:8px;object-fit:cover;flex:none;',
    '  border:1px solid rgba(230,192,121,.42);background:#141c28}',
    '.bx-nhan .tx{text-align:left}',
    '.bx-nhan .nm{font-family:var(--serif);font-size:11px;color:var(--txt3);line-height:1.25}',
    // Hạng bài + kết quả chi nằm CHUNG một dòng — thẻ nhà Bắc chỉ chừa ~65px tới mép khung,
    // tách thành hai dòng nữa là thẻ cao quá, bị đẩy đè lên bài.
    // wrap: thẻ Đông/Tây bị bó theo lề, hạng dài như "Thùng Phá Sảnh" mà không cho xuống dòng
    // thì số chi tràn đè lên tên hạng
    '.bx-nhan .d2{display:flex;align-items:baseline;gap:8px;margin-top:1px;flex-wrap:wrap}',
    '.bx-nhan .hg{font-family:var(--serif);font-size:13.5px;font-weight:700;letter-spacing:.02em;line-height:1.25}',
    '.bx-nhan .ch{font-family:var(--serif);font-size:11.5px;font-weight:600;color:var(--txt2)}',
    '.bx-nhan .ch.pos{color:#7fd6b5}.bx-nhan .ch.neg{color:var(--warn)}',
    '.bx-nhan .th{font-family:var(--serif);font-size:10px;font-style:italic;color:#e6c079;margin-top:1px;line-height:1.3;white-space:normal}',
    '.bx-nhan .th:empty{display:none}',
    '.bx-nhan.sam{border-color:rgba(230,192,121,.75);box-shadow:0 0 15px -3px rgba(230,192,121,.5)}',
    '.bx-nhan.xau{border-color:rgba(214,109,79,.55)}',
    // ===== KHUNG THẤP (điện thoại nằm ngang, kể cả lúc phủ toàn màn hình) =====
    // Bốn khối bài chiếm gần hết mặt nỉ, thẻ to là kiểu gì cũng đè lên bài; chrome cỡ máy bàn
    // trên khung cao ~330px thì nút to lấn hết bàn (user: "nút lúc phóng to màn hình to quá").
    '.kh-nho .bx-nhan{padding:2px 6px;gap:5px;max-width:184px}',
    '.kh-nho .bx-nhan .av{width:22px;height:22px;border-radius:5px}',
    '.kh-nho .bx-nhan .nm{font-size:9px}.kh-nho .bx-nhan .hg{font-size:11px}',
    '.kh-nho .bx-nhan .ch{font-size:9.5px}.kh-nho .bx-nhan .th{font-size:8.5px}',
    '.kh-nho .bx-title{left:10px;top:7px}.kh-nho .bx-title .hz{font-size:18px}.kh-nho .bx-title .vz{font-size:11px}',
    '.kh-nho .bx-sub{top:28px;left:11px;font-size:9.5px}',
    '.kh-nho .bx-canh{top:8px;right:10px;font-size:10.5px;padding:4px 11px;max-width:46%;overflow:hidden;text-overflow:ellipsis}',
    // width:auto — nhãn dài hơn ô 46px thì tràn ra hai bên rồi bị mép khung xén mất chữ đầu
    '.kh-nho .bx-left{left:8px;gap:6px}.kh-nho .bx-b{width:auto}',
    '.kh-nho .bx-b .ic{width:27px;height:27px}.kh-nho .bx-b .ic svg{width:15px;height:15px}.kh-nho .bx-b span{font-size:8.5px}',
    '.kh-nho .bx-act{bottom:8px}.kh-nho .bx-btn{padding:5px 13px;font-size:11.5px}',
    // ===== dấu báo cạnh khối bài =====
    // ===== báo sự kiện giữa bàn — cùng khuôn skillCue đã dùng ở Tiến Lên =====
    '.bx-skcue{position:absolute;inset:0;z-index:11;pointer-events:none;overflow:hidden}',
    '.bx-skcue .sk-streak{position:absolute;left:-45%;top:47%;width:62%;height:24px;transform:translateY(-50%) skewX(-24deg);background:linear-gradient(90deg,transparent,var(--acc),#fff,var(--acc),transparent);box-shadow:0 0 22px var(--acc);opacity:0}',
    '.bx-skcue .sk-streak.go{animation:bxStreak .55s cubic-bezier(.4,0,.2,1) forwards}',
    '@keyframes bxStreak{0%{opacity:0;left:-45%}30%{opacity:1}70%{opacity:1}100%{opacity:0;left:132%}}',
    '.bx-skcue .sk-flash{position:absolute;left:50%;top:47%;width:44%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.5),var(--soft) 45%,transparent 70%);opacity:0;mix-blend-mode:screen}',
    '.bx-skcue .sk-flash.go{animation:bxFlash .5s ease-out .16s forwards}',
    '@keyframes bxFlash{0%{opacity:0;transform:translate(-50%,-50%) scale(.7)}35%{opacity:.85;transform:translate(-50%,-50%) scale(1.05)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.2)}}',
    '.bx-skcue .sk-nm{position:absolute;left:50%;top:47%;transform:translate(-50%,-50%) scale(1.25);font-family:var(--serif);font-weight:700;letter-spacing:.03em;color:#fff;text-shadow:0 0 18px var(--acc),0 0 40px var(--acc),0 2px 9px #000,0 0 22px rgba(0,0,0,.95);opacity:0;white-space:nowrap}',
    '.bx-skcue .sk-nm.go{animation:bxNm 1.05s cubic-bezier(.2,.7,.3,1) forwards}',
    '@keyframes bxNm{0%{opacity:0;transform:translate(-50%,-50%) scale(1.28)}18%{opacity:1;transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.02)}}',
    '.bx-skcue .sk-who{position:absolute;left:50%;top:47%;margin-top:30px;transform:translate(-50%,0);font-family:var(--serif);font-size:13px;font-weight:600;color:#f6ecd8;text-shadow:0 2px 8px #000,0 0 18px rgba(0,0,0,.95);opacity:0;white-space:nowrap}',
    '.bx-skcue .sk-who.go{animation:bxWho 1.05s ease forwards}',
    '@keyframes bxWho{0%{opacity:0}24%{opacity:1}80%{opacity:1}100%{opacity:0}}',
    '.bx-skcue .sk-shard{position:absolute;left:50%;top:47%;width:9px;height:2px;border-radius:2px;background:var(--acc);box-shadow:0 0 6px var(--acc);opacity:0}',
    '.bx-skcue .sk-shard.go{animation:bxShard var(--d,420ms) ease-out .12s forwards}',
    '@keyframes bxShard{0%{opacity:0;transform:translate(-50%,-50%) rotate(var(--r,0deg))}30%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--tx,0px)),calc(-50% + var(--ty,0px))) rotate(var(--r,0deg))}}',
    '@media (prefers-reduced-motion:reduce){.bx-skcue *{animation:none!important}.bx-skcue .sk-nm{opacity:1;transform:translate(-50%,-50%) scale(1)}}',
    // ===== popup xếp bài =====
    '.bxp-wrap{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(6,9,14,.72);z-index:14;padding:14px}',
    '.bxp-wrap.show{display:flex}',
    // ⚠ `width:fit-content` chứ đừng chốt `min(840px,98%)`: khung NGANG rộng hơn khối bài nhiều
    //   nên bảng chiếm hết bề ngang mà khối bài dồn về mép trái, thừa hẳn một mảng bên phải
    //   (user chụp được). Bảng ôm sát nội dung thì tự nằm giữa màn.
    '.bxp{width:fit-content;min-width:min(320px,96%);max-width:min(840px,98%);max-height:96%;',
    '  overflow:auto;border-radius:16px;padding:14px 16px 12px;',
    '  background:linear-gradient(180deg,rgba(19,27,40,.99),rgba(11,16,24,.99));border:1px solid rgba(230,192,121,.24)}',
    '.bxp-top{display:flex;align-items:baseline;gap:10px;margin-bottom:8px}',
    '.bxp-top b{font-family:var(--serif);font-size:16px;color:var(--gold2)}',
    // đồng hồ đẩy sát phải bằng margin-left:auto, ✕ nằm ngoài cùng
    '.bxp-dh{margin-left:auto;font-family:var(--serif);font-size:12.5px;font-weight:600;color:var(--txt2);white-space:nowrap}',
    '.bxp-dh.gap{color:var(--warn)}',
    '.bxp-x{font-size:15px;line-height:1;color:var(--txt3);cursor:pointer;padding:2px 2px 2px 4px;align-self:center}',
    '.bxp-x:hover{color:var(--gold2)}',
    '.bxp-canh{font-family:var(--serif);font-size:12px;color:var(--txt2)}',
    '.bxp-canh.xau{color:var(--warn);font-weight:700;font-size:14px}',
    // Khổ hẹp: bốn thứ (tiêu đề · dòng nhắc · đồng hồ · ✕) không đứng nổi một hàng — dòng nhắc
    // xuống hàng riêng, hàng trên chỉ còn tiêu đề + đồng hồ + ✕.
    '.bxp.hep .bxp-top{flex-wrap:wrap;gap:5px 8px;margin-bottom:6px}',
    '.bxp.hep .bxp-canh{order:9;flex-basis:100%;font-size:10.5px}',
    '.bxp.hep .bxp-canh.xau{font-size:12px}',
    '.bxp.hep .bxp-mb{font-size:10.5px;padding:4px 9px;margin-bottom:6px}',
    '.bxp-mb{font-family:var(--serif);font-size:11.5px;color:#f4d99a;background:rgba(230,192,121,.1);border:1px solid rgba(230,192,121,.4);border-radius:9px;padding:5px 11px;margin-bottom:8px}',
    // Ba hàng TÁCH HẲN nhau (user chốt) — bỏ kiểu chồng bậc thang cũ. Đọc từng chi rõ hơn hẳn,
    // đổi lại tốn chiều dọc: khối bài cao 3 lá thay vì 2. Cỡ lá giữ nguyên vì vẫn vừa popup.
    // Nhãn chi tách hẳn thành CỘT RIÊNG bên trái — dán đè lên lá thì che mất mặt bài,
    // để bên phải thì hàng 5 lá đẩy nó lòi khỏi popup.
    // Khối ba chi luôn nằm GIỮA bảng — đầu bảng (tiêu đề + đồng hồ) có khi rộng hơn khối bài,
    // để mặc định là khối bài lệch trái.
    '.bxp-chong{padding:2px 0 4px;display:flex;flex-direction:column;align-items:center}',
    // Nhãn chi và hàng bài là HAI Ô CỦA MỘT FLEX, không còn dán tuyệt đối: cột nhãn chỉ cần
    // đổi hướng flex là nhảy lên trên hàng bài, khỏi tính lại toạ độ cho khổ hẹp.
    '.bxp-chi{display:flex;align-items:center;gap:12px}',
    '.bxp-chi+.bxp-chi{margin-top:12px}',
    '.bxp-r{display:flex;gap:10px;align-items:flex-start}',
    '.bxp-tag{width:92px;flex:none;text-align:right;white-space:nowrap;pointer-events:none}',
    '.bxp-tag b{display:block;font-family:var(--serif);font-size:12.5px;color:var(--gold2)}',
    // Khổ HẸP (điện thoại dựng): nhãn lên một dòng riêng phía trên, hàng bài lấy TRỌN bề ngang
    // — cột nhãn 104px trên màn 412px là ăn mất một phần năm chỗ của bài.
    '.bxp.hep .bxp-chi{flex-direction:column;align-items:flex-start;gap:2px}',
    '.bxp.hep .bxp-chi+.bxp-chi{margin-top:8px}',
    '.bxp.hep .bxp-r{gap:6px}',
    '.bxp.hep .bxp-tag{width:auto;text-align:left;display:flex;align-items:baseline;gap:8px}',
    '.bxp.hep .bxp-tag b{display:inline;font-size:11px}',
    '.bxp.hep .bxp-hang{margin-top:0}',
    // Chip hạng bài — màu + quầng leo dần theo bậc. Cho xuống dòng được: "Thùng Phá Sảnh"
    // dài hơn cột nhãn, để nowrap thì nó thò hẳn ra ngoài popup.
    '.bxp-hang{display:inline-block;margin-top:5px;padding:2px 5px;border-radius:99px;',
    '  font-family:var(--serif);font-size:10px;font-weight:600;line-height:1.35;',
    '  white-space:normal;max-width:100%;text-align:center}',
    // ⚠ Cỡ lá do JS ĐO rồi đặt (`coLaPopup`), không còn media query đoán mò: khung bàn nằm
    //   trong trang nên bề ngang của nó KHÔNG bằng bề ngang màn hình — đoán theo màn là tràn.
    //   Ảnh mặt bài cắt bằng background-size theo PHẦN TRĂM nên co giãn theo, khỏi đụng.
    '.bxp-la{width:var(--bxp-la,118px);height:calc(var(--bxp-la,118px) * 1.398);',
    '  border-radius:8px;flex:none;cursor:grab;touch-action:none;box-shadow:0 3px 10px -3px #000}',
    // KHÔNG nhấc lá khi rê chuột — bài nảy lên nảy xuống lúc quét mắt rất rối
    '.bxp-la.sel{z-index:9;box-shadow:0 0 0 3px #f4d99a,0 0 22px -2px rgba(244,217,154,.7),0 8px 16px -5px #000}',
    '.bxp-la.bay{z-index:10}',
    '.bxp-la:active{cursor:grabbing}',
    '.bxp-act{display:flex;gap:9px;justify-content:center;margin-top:10px}',
    '.bx-end .btns{display:flex;gap:10px;margin-top:16px;justify-content:center}',
    // ================= khổ ĐIỆN THOẠI DỰNG =================
    // Khung bàn LẤP ĐẦY chiều cao còn lại thay vì ôm tỉ lệ 3/4: tỉ lệ cứng để thừa gần 240px
    // trống dưới khung trong khi bàn thì bé.
    '@media (max-width:600px){.bx-root{aspect-ratio:auto;height:84dvh;max-height:none;min-height:360px}',
    // ⚠ Mặt 3D thụt vào, chừa hai DẢI CHROME trên/dưới. Nhờ vậy camera canh khung trong dải giữa,
    //   bài không bao giờ chạm tới thanh tiêu đề hay hàng nút — thẻ tên cũng thế (datNhan kẹp
    //   trong đúng dải này). Đây là cách chặn tận gốc chuyện chữ đè lên bài.
    // Dải trên 64px: thẻ tên nhà Bắc lúc cuối ván cao tới ~60px, dải mỏng hơn là nó không còn
    // chỗ treo phía trên khối bài, phải rơi xuống dưới rồi cấn vào khối bài nhà Tây.
    // Cắt bớt chiều cao dải giữa gần như KHÔNG làm bàn nhỏ đi: màn dọc canh khung theo BỀ NGANG.
    '  .bx-scene{inset:64px 0 92px}',
    '  .bx-title{left:10px;top:6px}.bx-title .hz{font-size:19px}.bx-title .vz{font-size:11px}.bx-sub{top:26px;left:11px;font-size:9.5px}',
    '  .bx-canh{top:9px;right:10px;font-size:10.5px;padding:4px 11px;max-width:52%;overflow:hidden;text-overflow:ellipsis}',
    '  .bx-right{right:8px;gap:6px}.bx-chi{font-size:10px;padding:4px 8px}',
    '  .bx-left{left:0;right:0;top:auto;bottom:50px;transform:none;flex-direction:row;justify-content:center;gap:16px}',
    '  .bx-b{width:auto}.bx-b .ic{width:30px;height:30px}.bx-b .ic svg{width:16px;height:16px}.bx-b span{font-size:9px}',
    '  .bx-act{bottom:8px;gap:6px}.bx-btn{padding:6px 12px;font-size:11.5px}',
    '  .bx-toast{top:44px;left:10px;font-size:11px}',
    // Thẻ tên co lại: màn hẹp thì lề quanh khối bài chỉ còn vài chục px.
    // ⚠ 152px chứ không rộng hơn: khe nỉ trống giữa hai khối bài trên màn dọc chỉ ~137px, thẻ
    //   rộng hơn khe thì đặt đâu cũng cấn vào bài.
    '  .bx-nhan{padding:3px 7px;gap:6px;max-width:152px}',
    '  .bx-nhan .av{width:27px;height:27px;border-radius:6px}',
    '  .bx-nhan .nm{font-size:9.5px}.bx-nhan .hg{font-size:11.5px}.bx-nhan .ch{font-size:10px}',
    // ⚠ Dòng "thưởng bộ" ẨN ở màn dọc: nó làm thẻ cao lên ba dòng, mà khe nỉ trống chỉ đủ cho
    //   thẻ hai dòng ⇒ thẻ đành đè lên bài (đo được 1.087 px² lúc so chi Đầu). Khoản thưởng
    //   ĐÃ nằm trong số chi ăn/thua ngay cạnh rồi, không mất thông tin.
    '  .bx-nhan .th{display:none}',
    '  .bxp-wrap{padding:8px}.bxp{padding:10px 10px 9px}.bxp-top b{font-size:14px}',
    // Bảng tổng kết: cột hẹp nên chữ và ảnh phải nhỏ lại, không thì "Thùng Phá Sảnh" vỡ ba dòng.
    '  .bx-banner{padding:10px}.bx-end{padding:16px 12px 14px}.bx-end .bt{font-size:22px}.bx-end .bs{font-size:11.5px;margin-bottom:10px}',
    '  .bx-luoi{font-size:10px}.bx-luoi th{font-size:9px;padding:0 2px 5px}',
    '  .bx-luoi th .av{width:22px;height:22px;border-radius:6px;margin-bottom:3px}',
    '  .bx-luoi td{padding:5px 2px}.bx-luoi td.lb{font-size:9.5px;width:52px}.bx-luoi td b{font-size:10px}}'
  ].join('\n');
  document.head.appendChild(st);
}
function veCo(x, cx, cy, s, mau) {           // ♥ Cơ
  x.fillStyle = mau; x.beginPath();
  x.moveTo(cx, cy + s * 0.62);
  x.bezierCurveTo(cx - s * 1.15, cy - s * 0.12, cx - s * 0.52, cy - s * 0.92, cx, cy - s * 0.34);
  x.bezierCurveTo(cx + s * 0.52, cy - s * 0.92, cx + s * 1.15, cy - s * 0.12, cx, cy + s * 0.62);
  x.closePath(); x.fill();
}
function veRo(x, cx, cy, s, mau) {           // ♦ Rô — bụng phải phình, hẹp quá thì ra cái gạch dọc
  x.fillStyle = mau; x.beginPath();
  x.moveTo(cx, cy - s * 0.84);
  x.bezierCurveTo(cx + s * 0.40, cy - s * 0.40, cx + s * 0.64, cy - s * 0.10, cx + s * 0.64, cy);
  x.bezierCurveTo(cx + s * 0.64, cy + s * 0.10, cx + s * 0.40, cy + s * 0.40, cx, cy + s * 0.84);
  x.bezierCurveTo(cx - s * 0.40, cy + s * 0.40, cx - s * 0.64, cy + s * 0.10, cx - s * 0.64, cy);
  x.bezierCurveTo(cx - s * 0.64, cy - s * 0.10, cx - s * 0.40, cy - s * 0.40, cx, cy - s * 0.84);
  x.closePath(); x.fill();
}
function veBich(x, cx, cy, s, mau) {         // ♠ Bích
  x.fillStyle = mau; x.beginPath();
  x.moveTo(cx, cy - s * 0.78);
  x.bezierCurveTo(cx + s * 0.50, cy - s * 0.16, cx + s * 1.02, cy + s * 0.22, cx + s * 0.36, cy + s * 0.44);
  x.bezierCurveTo(cx + s * 0.16, cy + s * 0.50, cx + s * 0.06, cy + s * 0.40, cx + s * 0.04, cy + s * 0.30);
  x.lineTo(cx + s * 0.04, cy + s * 0.30);
  x.bezierCurveTo(cx + s * 0.10, cy + s * 0.55, cx + s * 0.22, cy + s * 0.70, cx + s * 0.30, cy + s * 0.80);
  x.lineTo(cx - s * 0.30, cy + s * 0.80);
  x.bezierCurveTo(cx - s * 0.22, cy + s * 0.70, cx - s * 0.10, cy + s * 0.55, cx - s * 0.04, cy + s * 0.30);
  x.bezierCurveTo(cx - s * 0.06, cy + s * 0.40, cx - s * 0.16, cy + s * 0.50, cx - s * 0.36, cy + s * 0.44);
  x.bezierCurveTo(cx - s * 1.02, cy + s * 0.22, cx - s * 0.50, cy - s * 0.16, cx, cy - s * 0.78);
  x.closePath(); x.fill();
}
function veChuon(x, cx, cy, s, mau) {        // ♣ Chuồn
  x.fillStyle = mau;
  var r = s * 0.34;
  x.beginPath(); x.arc(cx, cy - s * 0.40, r, 0, 7); x.fill();
  x.beginPath(); x.arc(cx - s * 0.44, cy + s * 0.16, r, 0, 7); x.fill();
  x.beginPath(); x.arc(cx + s * 0.44, cy + s * 0.16, r, 0, 7); x.fill();
  x.beginPath();
  x.moveTo(cx - s * 0.28, cy + s * 0.82); x.quadraticCurveTo(cx - s * 0.04, cy + s * 0.44, cx - s * 0.05, cy + s * 0.06);
  x.lineTo(cx + s * 0.05, cy + s * 0.06); x.quadraticCurveTo(cx + s * 0.04, cy + s * 0.44, cx + s * 0.28, cy + s * 0.82);
  x.closePath(); x.fill();
}
var VE_CHAT = [veBich, veChuon, veRo, veCo];
var MAU_CHAT = ['#17120f', '#17120f', '#B12821', '#B12821'];

// bố cục pip chuẩn cho lá số 2..10 — [x, y, lộn ngược]. Xập xám có lá Hai nên phải thêm mục 2.
var PIP = {
  2: [[.5, .22, 0], [.5, .78, 1]],
  3: [[.5, .20, 0], [.5, .50, 0], [.5, .80, 1]],
  4: [[.30, .20, 0], [.70, .20, 0], [.30, .80, 1], [.70, .80, 1]],
  5: [[.30, .20, 0], [.70, .20, 0], [.5, .50, 0], [.30, .80, 1], [.70, .80, 1]],
  6: [[.30, .20, 0], [.70, .20, 0], [.30, .50, 0], [.70, .50, 0], [.30, .80, 1], [.70, .80, 1]],
  7: [[.30, .20, 0], [.70, .20, 0], [.5, .35, 0], [.30, .50, 0], [.70, .50, 0], [.30, .80, 1], [.70, .80, 1]],
  8: [[.30, .20, 0], [.70, .20, 0], [.5, .35, 0], [.30, .50, 0], [.70, .50, 0], [.5, .65, 1], [.30, .80, 1], [.70, .80, 1]],
  9: [[.30, .18, 0], [.70, .18, 0], [.30, .39, 0], [.70, .39, 0], [.5, .50, 0], [.30, .61, 1], [.70, .61, 1], [.30, .82, 1], [.70, .82, 1]],
  10: [[.30, .18, 0], [.70, .18, 0], [.5, .29, 0], [.30, .39, 0], [.70, .39, 0], [.30, .61, 1], [.70, .61, 1], [.5, .71, 1], [.30, .82, 1], [.70, .82, 1]]
};

function veKhungHoiVan(x, X, Y, W, H, mau, dam) {
  x.strokeStyle = mau; x.lineWidth = dam; x.strokeRect(X, Y, W, H);
  var g = dam * 3.4;                                  // 4 góc kiểu hồi văn
  x.lineWidth = dam * 0.85;
  [[X, Y, 1, 1], [X + W, Y, -1, 1], [X, Y + H, 1, -1], [X + W, Y + H, -1, -1]].forEach(function (c) {
    x.beginPath();
    x.moveTo(c[0] + c[2] * g * 0.55, c[1] + c[3] * g * 1.5);
    x.lineTo(c[0] + c[2] * g * 0.55, c[1] + c[3] * g * 0.55);
    x.lineTo(c[0] + c[2] * g * 1.5, c[1] + c[3] * g * 0.55);
    x.stroke();
  });
}

/**
 * ⚠ Ảnh KHÔNG phải lũy thừa của 2 + minFilter mặc định (có mipmap) ⇒ Three TỰ THU ẢNH xuống POT gần
 * nhất: atlas 1924 rơi về 1024, lưng bài 148 rơi về 128. Mất gần nửa độ nét — nhìn như phủ tấm mờ.
 * Chữa: tắt mipmap + minFilter Linear (lá bài luôn cùng cỡ trên màn nên không cần mipmap).
 */
function loNet(t) {
  t.generateMipmaps = false;
  t.minFilter = THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  try { t.anisotropy = renderer.capabilities.getMaxAnisotropy(); } catch (e) { t.anisotropy = 8; }
  t.encoding = THREE.sRGBEncoding;
  t.needsUpdate = true;
  return t;
}

/** Atlas 52 mặt bài: 13 cột (bậc) × 4 hàng (chất). */
function atlas() {
  var W = 220, H = 308, cv = document.createElement('canvas');   // lá bài nay to gấp đôi ⇒ cần nhiều điểm ảnh hơn
  cv.width = W * 13; cv.height = H * 4;
  var x = cv.getContext('2d');
  for (var s = 0; s < 4; s++) for (var r = 0; r < 13; r++) veMatBai(x, r * W, s * H, W, H, r, s);
  atlasCv = cv;                       // popup 2D cắt lá từ đúng atlas này, khỏi vẽ hai lần
  return loNet(new THREE.CanvasTexture(cv));
}

function veMatBai(x, X0, Y0, W, H, r, s) {
  // Bậc POKER: 0..8 = Hai..Mười (vẽ pip) · 9,10,11 = Bồi/Đầm/Già (chữ trong khung) · 12 = Ách.
  // Ách là lá cao nhất nên được viền vàng, khác Tiến Lên (ở đó lá Heo mới là cao nhất).
  var ky = B.BAC_KY[r], mau = MAU_CHAT[s], ve = VE_CHAT[s], heo = (r === 12), ach = (r === 12);
  var pad = W * 0.035, rr = W * 0.085;
  x.save(); x.translate(X0, Y0);
  // nền ngà, hơi ngả vàng ở rìa
  x.beginPath(); rrect(x, pad * 0.5, pad * 0.5, W - pad, H - pad, rr); x.clip();
  var g = x.createLinearGradient(0, 0, W * 0.7, H);
  g.addColorStop(0, '#F6F0E2'); g.addColorStop(0.55, '#EFE6D3'); g.addColorStop(1, '#E2D6BE');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  // gân giấy rất mờ
  x.globalAlpha = 0.05; x.strokeStyle = '#8a7758'; x.lineWidth = 1;
  for (var i = 0; i < 26; i++) { x.beginPath(); x.moveTo(0, i * H / 26 + (i % 3)); x.lineTo(W, i * H / 26 - (i % 2)); x.stroke(); }
  x.globalAlpha = 1;
  x.restore();

  x.save(); x.translate(X0, Y0);
  // viền lá
  x.beginPath(); rrect(x, pad * 0.5, pad * 0.5, W - pad, H - pad, rr);
  x.strokeStyle = heo ? '#C2952F' : '#C9BCA0'; x.lineWidth = heo ? 3 : 1.6; x.stroke();
  if (heo) { x.beginPath(); rrect(x, pad * 1.5, pad * 1.5, W - pad * 3, H - pad * 3, rr * 0.7); x.strokeStyle = '#D9B45E'; x.lineWidth = 1; x.stroke(); }

  // góc: bậc + chất nhỏ (góc dưới phải lộn ngược)
  function goc(flip) {
    x.save();
    if (flip) { x.translate(W, H); x.rotate(Math.PI); }
    x.fillStyle = mau;
    // ⚠ Chỉ con MƯỜI mới hạ cỡ (hai chữ số). Bậc 8 là '10', bậc 7 là '9' —
    // trước ghi nhầm `r === 7` nên con 9 bị thu nhỏ còn con 10 thì tràn, cỡ chữ trông so le.
    x.font = '700 ' + Math.round(W * (r === 8 ? 0.20 : 0.245)) + 'px "Lora",Georgia,serif';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(ky, W * 0.135, H * 0.093);
    ve(x, W * 0.135, H * 0.175, W * 0.058, mau);
    x.restore();
  }
  goc(0); goc(1);

  // ruột lá
  var IX = W * 0.235, IW = W * 0.53, IY = H * 0.085, IH = H * 0.83;
  if (r <= 8) {
    var ps = PIP[r + 2];
    for (var p = 0; p < ps.length; p++) {
      var px = IX + ps[p][0] * IW, py = IY + ps[p][1] * IH, sz = W * 0.105;
      if (ps[p][2]) { x.save(); x.translate(px, py); x.rotate(Math.PI); ve(x, 0, 0, sz, mau); x.restore(); }
      else ve(x, px, py, sz, mau);
    }
  } else if (r <= 11) {
    // Bồi / Đầm / Già — chữ lớn trong khung hồi văn, 4 chất ở 4 góc khung
    var FX = W * 0.20, FY = H * 0.175, FW = W * 0.60, FH = H * 0.65;
    veKhungHoiVan(x, FX, FY, FW, FH, '#BFA160', 1.7);
    x.save(); x.beginPath(); x.rect(FX, FY, FW, FH); x.clip();
    x.globalAlpha = 0.10;
    for (var d = -FH; d < FW; d += 9) { x.beginPath(); x.moveTo(FX + d, FY); x.lineTo(FX + d + FH, FY + FH); x.strokeStyle = '#9C8149'; x.lineWidth = 1; x.stroke(); }
    x.globalAlpha = 1; x.restore();
    x.fillStyle = mau; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '700 ' + Math.round(W * 0.40) + 'px "Lora",Georgia,serif';
    x.fillStyle = 'rgba(90,70,40,.22)'; x.fillText(ky, W * 0.5 + 1.5, H * 0.505 + 2);
    x.fillStyle = mau; x.fillText(ky, W * 0.5, H * 0.5);
    var cs = W * 0.05;
    ve(x, FX + FW * 0.13, FY + FH * 0.10, cs, mau); ve(x, FX + FW * 0.87, FY + FH * 0.10, cs, mau);
    x.save(); x.translate(FX + FW * 0.13, FY + FH * 0.90); x.rotate(Math.PI); ve(x, 0, 0, cs, mau); x.restore();
    x.save(); x.translate(FX + FW * 0.87, FY + FH * 0.90); x.rotate(Math.PI); ve(x, 0, 0, cs, mau); x.restore();
  } else {
    // Ách / Heo — một chất lớn giữa, có vòng trang trí
    var cx = W * 0.5, cy = H * 0.5;
    x.strokeStyle = heo ? '#C2952F' : '#C4B392'; x.lineWidth = heo ? 2.2 : 1.5;
    x.beginPath(); x.arc(cx, cy, W * 0.285, 0, 7); x.stroke();
    x.lineWidth = 1; x.globalAlpha = 0.75;
    x.beginPath(); x.arc(cx, cy, W * 0.315, 0, 7); x.stroke(); x.globalAlpha = 1;
    for (var k = 0; k < 8; k++) {           // tia trang trí quanh vòng
      var a = k * Math.PI / 4 + Math.PI / 8;
      x.beginPath();
      x.moveTo(cx + Math.cos(a) * W * 0.33, cy + Math.sin(a) * W * 0.33);
      x.lineTo(cx + Math.cos(a) * W * 0.385, cy + Math.sin(a) * W * 0.385);
      x.strokeStyle = heo ? '#C2952F' : '#C4B392'; x.lineWidth = 1.6; x.stroke();
    }
    ve(x, cx, cy, W * (ach ? 0.20 : 0.215), mau);
  }
  x.restore();
}

function rrect(x, X, Y, W, H, r) {
  x.moveTo(X + r, Y); x.lineTo(X + W - r, Y); x.quadraticCurveTo(X + W, Y, X + W, Y + r);
  x.lineTo(X + W, Y + H - r); x.quadraticCurveTo(X + W, Y + H, X + W - r, Y + H);
  x.lineTo(X + r, Y + H); x.quadraticCurveTo(X, Y + H, X, Y + H - r);
  x.lineTo(X, Y + r); x.quadraticCurveTo(X, Y, X + r, Y);
}

/** Lưng bài: đỏ son + hồi văn vàng + medallion. */
function lungBai() {
  var W = 220, H = 308, cv = document.createElement('canvas');
  cv.width = W; cv.height = H; var x = cv.getContext('2d');
  var pad = W * 0.035, rr = W * 0.085;
  x.beginPath(); rrect(x, 0, 0, W, H, rr); x.fillStyle = '#EFE6D3'; x.fill();
  x.save(); x.beginPath(); rrect(x, pad * 1.6, pad * 1.6, W - pad * 3.2, H - pad * 3.2, rr * 0.7); x.clip();
  var g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#8A2E23'); g.addColorStop(0.5, '#6F221B'); g.addColorStop(1, '#5A1A14');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(226,186,110,.30)'; x.lineWidth = 1;      // lưới hồi văn chéo
  for (var d = -H; d < W + H; d += 11) {
    x.beginPath(); x.moveTo(d, 0); x.lineTo(d + H, H); x.stroke();
    x.beginPath(); x.moveTo(d, H); x.lineTo(d + H, 0); x.stroke();
  }
  x.restore();
  x.beginPath(); rrect(x, pad * 1.6, pad * 1.6, W - pad * 3.2, H - pad * 3.2, rr * 0.7);
  x.strokeStyle = '#D8AE60'; x.lineWidth = 2; x.stroke();
  var cx = W / 2, cy = H / 2;                                     // medallion
  x.fillStyle = 'rgba(30,10,8,.5)'; x.beginPath(); x.arc(cx, cy, W * 0.24, 0, 7); x.fill();
  x.strokeStyle = '#E2BA6E'; x.lineWidth = 2.2; x.beginPath(); x.arc(cx, cy, W * 0.24, 0, 7); x.stroke();
  x.lineWidth = 1; x.beginPath(); x.arc(cx, cy, W * 0.275, 0, 7); x.stroke();
  for (var k = 0; k < 8; k++) {                                   // 8 cánh mây
    var a = k * Math.PI / 4;
    x.beginPath();
    x.moveTo(cx + Math.cos(a) * W * 0.055, cy + Math.sin(a) * W * 0.055);
    x.quadraticCurveTo(cx + Math.cos(a + 0.35) * W * 0.15, cy + Math.sin(a + 0.35) * W * 0.15,
      cx + Math.cos(a) * W * 0.205, cy + Math.sin(a) * W * 0.205);
    x.strokeStyle = '#E2BA6E'; x.lineWidth = 1.8; x.stroke();
  }
  x.beginPath(); x.arc(cx, cy, W * 0.045, 0, 7); x.fillStyle = '#E2BA6E'; x.fill();

  return loNet(new THREE.CanvasTexture(cv));
}

// ---------- vân gỗ + nỉ (value-noise) ----------
var NG = 128, NGRID = (function () { var g = new Float32Array(NG * NG), i; for (i = 0; i < NG * NG; i++) g[i] = Math.random(); return g; })();
function nz(x, y) {
  var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  ix = ((ix % NG) + NG) % NG; iy = ((iy % NG) + NG) % NG;
  var ix1 = (ix + 1) % NG, iy1 = (iy + 1) % NG;
  var v00 = NGRID[iy * NG + ix], v10 = NGRID[iy * NG + ix1], v01 = NGRID[iy1 * NG + ix], v11 = NGRID[iy1 * NG + ix1];
  var ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  var a = v00 + (v10 - v00) * ux, b = v01 + (v11 - v01) * ux;
  return a + (b - a) * uy;
}
function goTex(w, h) {
  var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  var x = cv.getContext('2d'), img = x.createImageData(w, h), D = img.data, i = 0, RING = h / 5.2;
  for (var y = 0; y < h; y++) for (var xx = 0; xx < w; xx++) {
    var wp = (nz(xx * 0.009, y * 0.05) - 0.5) * 44 + (nz(xx * 0.042, y * 0.15) - 0.5) * 12;
    var rc = (y + wp) / RING, t = rc - Math.floor(rc);
    var band = t < 0.5 ? t * 2 : (1 - t) * 2; band = band * band * (3 - 2 * band);
    var pc = (y + wp) / 6.5, pt = pc - Math.floor(pc), pore = pt < 0.30 ? (1 - pt / 0.30) : 0;
    var fib = nz(xx * 0.55, y * 0.014);
    var m = 0.30 + band * 0.44 + (fib - 0.5) * 0.26 - pore * 0.30;
    m = m < 0 ? 0 : (m > 1 ? 1 : m);
    var mn = (Math.random() - 0.5) * 4;
    D[i++] = 56 + m * 44 + mn; D[i++] = 27 + m * 27 + mn * 0.6; D[i++] = 18 + m * 19 + mn * 0.5; D[i++] = 255;
  }
  x.putImageData(img, 0, 0);
  var t2 = new THREE.CanvasTexture(cv); t2.encoding = THREE.sRGBEncoding; return t2;
}
/** Mặt nỉ: sợi vải + tối dần ra rìa + vòng hoa văn chìm rất mờ ở tâm. */
function niTex(S) {
  var cv = document.createElement('canvas'); cv.width = cv.height = S;
  var x = cv.getContext('2d'), img = x.createImageData(S, S), D = img.data, i = 0, c = S / 2;
  for (var y = 0; y < S; y++) for (var xx = 0; xx < S; xx++) {
    var f = nz(xx * 0.9, y * 0.22) * 0.5 + nz(xx * 0.22, y * 0.9) * 0.5;   // sợi đan hai chiều
    var m = nz(xx * 0.02, y * 0.02);
    var dx = (xx - c) / c, dy = (y - c) / c, rd = Math.sqrt(dx * dx + dy * dy);
    var vg = 1 - Math.min(1, Math.max(0, (rd - 0.42) / 0.62)) * 0.42;      // tối dần ra rìa
    var v = (0.44 + (f - 0.5) * 0.30 + (m - 0.5) * 0.20) * vg;
    D[i++] = 16 + v * 26; D[i++] = 46 + v * 54; D[i++] = 39 + v * 44; D[i++] = 255;
  }
  x.putImageData(img, 0, 0);
  // vòng hoa văn chìm ở tâm (rất mờ — chỉ để mặt nỉ không phải mảng màu chết)
  x.globalAlpha = 0.052; x.strokeStyle = '#dcc79a';
  x.lineWidth = S * 0.006;
  x.beginPath(); x.arc(c, c, S * 0.20, 0, 7); x.stroke();
  x.beginPath(); x.arc(c, c, S * 0.225, 0, 7); x.stroke();
  x.beginPath(); x.arc(c, c, S * 0.325, 0, 7); x.stroke();
  for (var k = 0; k < 16; k++) {
    var a = k * Math.PI / 8;
    x.beginPath();
    x.moveTo(c + Math.cos(a) * S * 0.235, c + Math.sin(a) * S * 0.235);
    x.quadraticCurveTo(c + Math.cos(a + 0.2) * S * 0.28, c + Math.sin(a + 0.2) * S * 0.28,
      c + Math.cos(a) * S * 0.318, c + Math.sin(a) * S * 0.318);
    x.stroke();
  }
  x.globalAlpha = 1;

  var t = new THREE.CanvasTexture(cv); t.anisotropy = 8; t.encoding = THREE.sRGBEncoding; return t;
}
function dotTex() {
  var cv = document.createElement('canvas'); cv.width = cv.height = 64;
  var x = cv.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,240,214,1)'); g.addColorStop(.4, 'rgba(240,200,140,.5)'); g.addColorStop(1, 'rgba(240,200,140,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(cv);
}
function taoBui() {
  var n = 46, geo = new THREE.BufferGeometry(), arr = new Float32Array(n * 3);
  for (var i = 0; i < n; i++) { arr[i * 3] = (Math.random() - .5) * 17; arr[i * 3 + 1] = Math.random() * 8; arr[i * 3 + 2] = (Math.random() - .5) * 17; }
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  // ⚠ Bàn này dùng camera TRỰC GIAO nên KHÔNG dùng sizeAttenuation như ba bàn cờ kia
  // (chiếu song song ⇒ hạt teo lại gần như vô hình). Đặt cỡ thẳng bằng pixel.
  return new THREE.Points(geo, new THREE.PointsMaterial({
    size: 3.4, map: dotTex(), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, color: 0xffdca8, opacity: .5, sizeAttenuation: false
  }));
}

function radialTex(inner, mid, stopMid) {
  var cv = document.createElement('canvas'); cv.width = cv.height = 256;
  var x = cv.getContext('2d'), g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner); g.addColorStop(stopMid || 0.55, mid); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(cv);
}
function domeTex() {
  var cv = document.createElement('canvas'); cv.width = 32; cv.height = 256;
  var x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256);
  // vòm phông theo tông xanh đêm của game (trước là nâu, chỏi với khung ngoài)
g.addColorStop(0, '#080B11'); g.addColorStop(0.34, '#0E141D'); g.addColorStop(0.72, '#18222E'); g.addColorStop(1, '#1E2A38');
  x.fillStyle = g; x.fillRect(0, 0, 32, 256);
  var t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t;
}
function envTex() {
  var cv = document.createElement('canvas'); cv.width = 32; cv.height = 256;
  var x = cv.getContext('2d'); x.fillStyle = '#0a0908'; x.fillRect(0, 0, 32, 256);
  var g = x.createLinearGradient(0, 14, 0, 84);
  g.addColorStop(0, '#12100e'); g.addColorStop(.45, '#B9BEC6'); g.addColorStop(1, '#12100e');
  x.fillStyle = g; x.fillRect(0, 14, 32, 70);
  var t = new THREE.CanvasTexture(cv); t.mapping = THREE.EquirectangularReflectionMapping; t.encoding = THREE.sRGBEncoding; return t;
}

function batGiacShape(R) {
  var s = new THREE.Shape(), i;
  for (i = 0; i < 8; i++) {
    var a = Math.PI / 8 + i * Math.PI / 4, px = Math.cos(a) * R, py = Math.sin(a) * R;
    if (i === 0) s.moveTo(px, py); else s.lineTo(px, py);
  }
  s.closePath(); return s;
}
function laBaiShape() {
  var s = new THREE.Shape(), w = CW, h = CH, r = CW * 0.085;
  rrectShape(s, -w / 2, -h / 2, w, h, r); return s;
}
function rrectShape(s, X, Y, W, H, r) {
  s.moveTo(X + r, Y); s.lineTo(X + W - r, Y); s.quadraticCurveTo(X + W, Y, X + W, Y + r);
  s.lineTo(X + W, Y + H - r); s.quadraticCurveTo(X + W, Y + H, X + W - r, Y + H);
  s.lineTo(X + r, Y + H); s.quadraticCurveTo(X, Y + H, X, Y + H - r);
  s.lineTo(X, Y + r); s.quadraticCurveTo(X, Y, X + r, Y);
}

// ---------- dựng cảnh ----------
function W() { return scEl.clientWidth || 900; }

// ================= bố cục =================
// khu 0 = 13 lá chờ xếp · 1 = chi Đầu (3 lá) · 2 = chi Giữa (5) · 3 = chi Cuối (5)
// Ba chi nằm PHẲNG trên nỉ (tilt −π/2, mặt ngửa lên); hàng chờ dựng nghiêng về phía người chơi.
var SUC = [13, 3, 5, 5];
var KHU_TEN = ['Bài Chờ', 'Chi Đầu', 'Chi Giữa', 'Chi Cuối'];
// BÀN CHỈ ĐỂ SO BÀI. Xếp chi làm ở popup 2D riêng — trên bàn 3D thao tác vừa khó vừa che nhau.
// Bốn nhà bày CÙNG MỘT HƯỚNG (ngửa lên, không xoay theo chỗ ngồi) và CÙNG MỘT CỠ,
// vì lúc so chi mắt phải quét ngang bốn nhà một lượt — xoay mỗi nhà một phách là không đọc nổi.
// Ba chi TÁCH HẲN và xếp TRÁI — y hệt bảng Xếp Bài, để thế bài mình vừa binh xong
// hiện lên bàn đúng như lúc xếp. Tỉ lệ khe lấy thẳng từ popup:
//   khe ngang = 10/118 bề rộng lá  ·  bước hàng = 1 + 12/165 chiều cao lá.
// ⚠ Ở kiểu Bốn Góc Bàn: bốn khu KHÔNG xoay nên khu nào cũng rộng ngang · nông dọc. Chống chồng
// nhau bằng cách đẩy Nam/Bắc ra xa hơn CHIỀU SÂU một khu (z0 ≥ d), chứ đẩy Đông/Tây thì lòi
// khỏi mặt nỉ ngay. Ba kiểu bày nằm ở bảng BO_CUC trên đầu tệp.
var BC = BO_CUC[opts.boCuc] || BO_CUC[1];
var SC_SO = BC.sc;
// Chồng nhau thì phải nhích cao dần, không thì hai mặt đồng phẳng tranh nhau (z-fighting)
// và không rõ lá nào nằm trên. Hai trục chồng ⇒ hai bước nhích:
//   DY_LA  theo ô trong hàng (lá phải đè lá trái)
//   DY_HANG theo hàng (chi Cuối ở gần người chơi nhất, phải nằm trên cùng)
// ⚠ DY_HANG phải LỚN HƠN tổng nhích trong một hàng (4 × DY_LA), không thì lá cuối hàng trước
// trồi lên trên cả hàng sau.
var DY_LA = (BC.step < CW) ? 0.010 : 0;
var DY_HANG = (BC.buocZ && BC.buocZ < 1) ? 0.05 : 0;
var NEO_SO = [];
for (var nb = 0; nb < 4; nb++) {
  var np = BC.neo(nb);
  NEO_SO.push({ pos: [np[0], TOPY + 0.05, np[1]] });
}

// ================= trạng thái ván =================
var hands = [[], [], [], []];
var khu = [[], [], [], []];
var xepNha = [null, null, null, null];
var chon = {}, daBinh = false, over = false;

var renderer, scene, camera, banGroup, raf = 0, ro = null;
var tuChinh = function () { };                // bộ tự chỉnh tỉ lệ điểm ảnh (engine/muot.js)
var nhipBui = nhipDam(33);                    // bụi bay ~30 nhịp/giây là đủ, khỏi nạp lại vùng đệm 120 lần
var sph = { r: 17, theta: 0, phi: 0.60, zoom: 1 }, rFit = 17, target = new THREE.Vector3(0, 0, 0);
var R_CAM = 20;
var drag = false, moved = 0, lx = 0, ly = 0, spectate = false;
var tweens = [], atlasTex = null, backTex = null, particles = null;
var ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
var GEO = {}, MAT = {}, nhaGroup = [], atlasCv = null;
var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var boCanShadow = true;

function W() { return scEl.clientWidth || 900; }
function H() { return scEl.clientHeight || 620; }

// ================= dựng cảnh =================
function init3D() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  tuChinh = taoTuChinh(renderer, onResize);    // tỉ lệ điểm ảnh do bộ tự chỉnh đặt, xem engine/muot.js
  renderer.setSize(W(), H());
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  scEl.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0e16);
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 320);   // TRỰC GIAO: hàng bài mới thẳng
  try { var pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(envTex()).texture; } catch (e) { }

  scene.add(new THREE.HemisphereLight(0xfff1dd, 0x241c16, 0.26));
  var key = new THREE.DirectionalLight(0xfff6ea, 1.16);
  key.position.set(5.5, 15.5, 7.5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  var sc = key.shadow.camera; sc.near = 1; sc.far = 52; sc.left = -11; sc.right = 11; sc.top = 12; sc.bottom = -12;
  key.shadow.bias = -0.0006; scene.add(key);
  var fill = new THREE.DirectionalLight(0xf3ece2, 0.19); fill.position.set(-9, 7, -6); scene.add(fill);
  var rimA = new THREE.PointLight(0xffbe78, 0.42, 30); rimA.position.set(-8, 3.2, 7); scene.add(rimA);
  var rimB = new THREE.PointLight(0xc6d8f0, 0.20, 30); rimB.position.set(8, 3.0, -7); scene.add(rimB);

  var dp = [], i, R0 = 24, RC = 15, WT = 62;
  for (i = 0; i <= 14; i++) dp.push(new THREE.Vector2(R0 * i / 14, 0));
  for (i = 1; i <= 20; i++) { var a = (Math.PI / 2) * (i / 20); dp.push(new THREE.Vector2(R0 + RC * Math.sin(a), RC - RC * Math.cos(a))); }
  for (i = 1; i <= 6; i++) dp.push(new THREE.Vector2(R0 + RC, RC + (WT - RC) * (i / 6)));
  var dome = new THREE.Mesh(new THREE.LatheGeometry(dp, 72), new THREE.MeshBasicMaterial({ map: domeTex(), side: THREE.DoubleSide, fog: false }));
  dome.position.y = -TH / 2 - 0.002; scene.add(dome);
  var sf = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.42 }));
  sf.rotation.x = -Math.PI / 2; sf.position.y = -TH / 2 - 0.001; sf.receiveShadow = true; scene.add(sf);

  banGroup = new THREE.Group(); scene.add(banGroup);
  var go = goTex(512, 512); go.wrapS = go.wrapT = THREE.RepeatWrapping; go.repeat.set(0.16, 0.16);
  var BEV = 0.08;
  var slabGeo = new THREE.ExtrudeGeometry(batGiacShape(R_BAN), { depth: TH - BEV * 2, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: 3, curveSegments: 2 });
  slabGeo.rotateX(-Math.PI / 2); slabGeo.translate(0, -(TH / 2 - BEV), 0);
  var slab = new THREE.Mesh(slabGeo, new THREE.MeshPhysicalMaterial({ map: go, color: 0x9a9a9a, roughness: 0.60, metalness: 0, clearcoat: 0.24, clearcoatRoughness: 0.5, envMapIntensity: 0.26 }));
  slab.castShadow = true; slab.receiveShadow = true; banGroup.add(slab);

  var NI_Y = TOPY + 0.004, GO_Y = TOPY + 0.006, GO_DAY = 0.05;
  var niGeo = new THREE.ShapeGeometry(batGiacShape(R_NI), 2);
  var np = niGeo.attributes.position, nu = niGeo.attributes.uv;
  for (var ni = 0; ni < np.count; ni++) nu.setXY(ni, (np.getX(ni) + R_NI) / (R_NI * 2), (np.getY(ni) + R_NI) / (R_NI * 2));
  nu.needsUpdate = true;
  var ni2 = new THREE.Mesh(niGeo, new THREE.MeshPhysicalMaterial({ map: niTex(1024), roughness: 0.95, metalness: 0, envMapIntensity: 0.06 }));
  ni2.rotation.x = -Math.PI / 2; ni2.position.y = NI_Y; ni2.receiveShadow = true; banGroup.add(ni2);

  var vanhShape = batGiacShape(R_BAN - BEV);
  vanhShape.holes.push(batGiacShape(R_NI));
  var vanhGeo = new THREE.ExtrudeGeometry(vanhShape, { depth: GO_DAY, bevelEnabled: false, curveSegments: 2 });
  vanhGeo.rotateX(-Math.PI / 2);
  var go2 = goTex(512, 512); go2.wrapS = go2.wrapT = THREE.RepeatWrapping; go2.repeat.set(0.1, 0.1);
  var vanh = new THREE.Mesh(vanhGeo, new THREE.MeshPhysicalMaterial({ map: go2, color: 0xb0a89e, roughness: 0.5, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.42, envMapIntensity: 0.24 }));
  vanh.position.y = GO_Y + GO_DAY; vanh.receiveShadow = true; vanh.castShadow = true; banGroup.add(vanh);

  if (!reduce) { try { particles = taoBui(); scene.add(particles); } catch (e) { } }

  var BEVC = 0.004;
  var laGeo = new THREE.ExtrudeGeometry(laBaiShape(), { depth: CT, bevelEnabled: true, bevelThickness: BEVC, bevelSize: 0.006, bevelSegments: 1, curveSegments: 3 });
  laGeo.translate(0, 0, -CT / 2);
  GEO.la = laGeo;
  GEO.nua = CT / 2 + BEVC + 0.0016;
  GEO.mat = new THREE.PlaneGeometry(CW * 0.985, CH * 0.985);
  atlasTex = atlas(); backTex = lungBai();
  MAT.than = new THREE.MeshPhysicalMaterial({ color: 0xa39a88, roughness: 0.55, metalness: 0, clearcoat: 0.2, clearcoatRoughness: 0.4, envMapIntensity: 0.16 });
  MAT.mat = new THREE.MeshStandardMaterial({ map: atlasTex, roughness: 0.82, metalness: 0, envMapIntensity: 0.03 });
  MAT.lung = new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.78, metalness: 0, envMapIntensity: 0.04 });
  // bản mờ của mặt bài — dùng cho những chi CHƯA tới lượt so, để chi đang so nổi hẳn lên
  MAT.matMo = new THREE.MeshStandardMaterial({ map: atlasTex, roughness: 0.82, metalness: 0, envMapIntensity: 0.03, transparent: true, opacity: 0.34 });

  // Bốn nhà, mỗi nhà một nhóm. KHÔNG còn khay 3D: việc xếp chi chuyển hẳn sang popup 2D.
  // ⚠ Nhóm này CHỈ chứa lá bài — nhiều chỗ duyệt `g.children[i]` coi mỗi con là một lá.
  for (var h = 0; h < 4; h++) { var hg = new THREE.Group(); nhaGroup[h] = hg; scene.add(hg); }
  napAnhLa();                          // tiêm ảnh atlas MỘT lần vào CSS dùng chung

  var el = renderer.domElement;
  el.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  el.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('resize', onResize);
  // ⚠ Bám `window.onresize` KHÔNG đủ: khung bàn còn đổi cỡ khi trang tự bày lại (sidebar hiện/ẩn),
  //   khi vào toàn màn hình bằng đường CSS, khi máy xoay. Đo THẲNG cái khung mới chắc.
  //   Đã dính: đổi bề ngang cửa sổ mà bảng Xếp Bài giữ nguyên cỡ lá cũ ⇒ tràn ngang 47px.
  if (window.ResizeObserver) {
    ro = new ResizeObserver(function () { onResize(); });
    ro.observe(root);
  }
}

function matGeoFor(c) {
  var g = GEO.mat.clone();
  var r = B.bacOf(c), s = B.chatOf(c);
  var u0 = r / 13, du = 1 / 13, v0 = 1 - (s + 1) / 4, dv = 1 / 4, m = 0.004;
  var uv = g.attributes.uv;
  uv.setXY(0, u0 + du * m, v0 + dv * (1 - m)); uv.setXY(1, u0 + du * (1 - m), v0 + dv * (1 - m));
  uv.setXY(2, u0 + du * m, v0 + dv * m); uv.setXY(3, u0 + du * (1 - m), v0 + dv * m);
  uv.needsUpdate = true;
  return g;
}
function taoLa(c) {
  var g = new THREE.Group();
  var than = new THREE.Mesh(GEO.la, MAT.than); than.castShadow = true; g.add(than);
  var mat = new THREE.Mesh(matGeoFor(c), MAT.mat); mat.position.z = GEO.nua; g.add(mat);
  var lung = new THREE.Mesh(GEO.mat, MAT.lung); lung.position.z = -GEO.nua; lung.rotation.y = Math.PI; g.add(lung);
  g.userData.card = c;
  return g;
}

function tween(obj, p1, q1, dur, delay) {
  tweens.push({ o: obj, p0: obj.position.clone(), p1: p1, q0: obj.quaternion.clone(), q1: q1, t: -(delay || 0), d: dur });
}
function stepTweens(dt) {
  for (var i = tweens.length - 1; i >= 0; i--) {
    var w = tweens[i]; w.t += dt;
    if (w.t < 0) continue;
    var u = Math.min(1, w.t / w.d), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    w.o.position.lerpVectors(w.p0, w.p1, e);
    w.o.quaternion.copy(w.q0).slerp(w.q1, e);
    if (u >= 1) tweens.splice(i, 1);
  }
}


// ================= bày bài lên bàn (chỉ dùng khi SO) =================
/** Vị trí lá thứ i của chi `r` (0 Đầu · 1 Giữa · 2 Cuối) trong khu của nhà `s`. */
function viTriSo(s, r, i, n) {
  var A = NEO_SO[s], d = BC.viTri(s, r, i);
  var dy = r * DY_HANG + i * DY_LA;
  var p = new THREE.Vector3(A.pos[0] + d[0], A.pos[1] + dy, A.pos[2] + d[1]);
  return { p: p, dy: dy };
}

/**
 * Đặt một lá NGỬA hay ÚP.
 * ⚠ KHÔNG được chỉ bật/tắt hai mặt. Lá nằm sấp theo `Euler(-π/2)` thì mặt LƯNG quay XUỐNG bàn;
 * tắt mặt bài đi là chỉ còn nhìn thấy THÂN lá — ra một miếng trắng bóc, mất sạch hoa văn lưng.
 * Úp bài phải LẬT hẳn lá (xoay +π/2 thay vì −π/2) cho lưng ngửa lên trời.
 */
var Q_NGUA = null, Q_UP = null;
function datMat(m, lat) {
  if (!Q_NGUA) {
    Q_NGUA = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0, 'XYZ'));
    Q_UP = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0, 'XYZ'));
  }
  m.children[1].visible = !!lat;      // mặt bài
  m.children[2].visible = !lat;       // lưng
  m.quaternion.copy(lat ? Q_NGUA : Q_UP);
}

/** Bày bài một nhà. `lat` = false thì úp lưng (lúc chờ binh). */
function bayNha(s, lat) {
  var g = nhaGroup[s];
  while (g.children.length) g.remove(g.children[0]);
  var xp = xepNha[s];
  var hang = xp ? [xp.dau, xp.giua, xp.cuoi]
    : [hands[s].slice(0, 3), hands[s].slice(3, 8), hands[s].slice(8, 13)];
  for (var r = 0; r < 3; r++) {
    for (var i = 0; i < hang[r].length; i++) {
      var m = taoLa(hang[r][i]);
      m.scale.setScalar(SC_SO);
      var t = viTriSo(s, r, i, hang[r].length);
      m.position.copy(t.p);
      datMat(m, lat);
      m.children[0].castShadow = false;   // bài nằm sát bàn, bóng không thấy mà lại tốn
      m.userData.chi = r;
      m.userData.dy = t.dy;               // chỗ nào đặt lại y phải CỘNG cái này, không thì mất nếp chồng
      g.add(m);
    }
  }
}
function bayTatCa(lat) { for (var s = 0; s < 4; s++) bayNha(s, lat); }

/** Chia bài: 52 lá bay từ giữa bàn ra bốn khu. Gọi `xong` khi bay hết. */
function chiaBaiAnim(xong) {
  var giua = new THREE.Vector3(0, TOPY + 0.9, 0);
  var qNam = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0, 'XYZ'));
  var n = 0;
  for (var s = 0; s < 4; s++) {
    bayNha(s, false);
    var g = nhaGroup[s];
    for (var i = 0; i < g.children.length; i++) {
      var m = g.children[i];
      var p1 = m.position.clone(), q1 = m.quaternion.clone();
      m.position.copy(giua); m.quaternion.copy(qNam);
      tween(m, p1, q1, 0.34, (i * 4 + s) * 0.011);
      n++;
    }
  }
  boCanShadow = true;
  setTimeout(xong, 300 + n * 11 + 420);
}

// ================= popup xếp bài (2D) =================
// Lá bài trong popup cắt thẳng từ atlas đã vẽ cho bàn 3D — khỏi vẽ hai lần, và luôn khớp mặt bài.
/**
 * ⚠ ẢNH ATLAS PHẢI NẰM TRONG MỘT RULE CSS DÙNG CHUNG, tuyệt đối không nhét vào style từng lá:
 * chuỗi dataURL của atlas nặng vài MB, mỗi lá một bản là mười ba lần chuỗi đó trong DOM —
 * gõ một cái là trình duyệt parse lại toàn bộ, popup lag thấy rõ.
 */
function napAnhLa() {
  if (document.getElementById('bxp-atlas') || !atlasCv) return;
  var st = document.createElement('style');
  st.id = 'bxp-atlas';
  st.textContent = '.bxp-la{background-image:url(' + atlasCv.toDataURL('image/webp', 0.92) + ');background-size:1300% 400%}';
  document.head.appendChild(st);
}
function laHTML(c, cls) {
  var r = B.bacOf(c), s = B.chatOf(c);
  return '<span class="bxp-la ' + (cls || '') + '" data-c="' + c + '" style="background-position:' +
    (r * 100 / 12) + '% ' + (s * 100 / 3) + '%"></span>';
}
/**
 * KHÔNG có hàng Bài Chờ: chia xong là ba chi đã đầy sẵn (xếp tự động), người chơi chỉ ĐỔI CHỖ hai lá.
 * Số lá mỗi chi cố định 3·5·5 nên đổi chỗ là thao tác đúng — bỏ được cả hàng chờ lẫn ô trống,
 * popup thấp hẳn xuống và lá bài to lên.
 */
function vePopup() {
  var p = $('.bxp');
  var kh = ['', 'Chi Đầu', 'Chi Giữa', 'Chi Cuối'];
  // Ba chi CHỒNG BẬC THANG, hàng dưới đè lên hàng trên và chỉ để lộ phần đầu lá.
  // Nhờ vậy chiều dọc chỉ tốn bằng hai lá thay vì ba, đổi lại lá bài to gấp đôi.
  var h = '<div class="bxp-chong">';
  for (var k = 1; k <= 3; k++) {
    var dg = khu[k].length === SUC[k] ? B.danhGia(khu[k]) : null;
    h += '<div class="bxp-chi">' +
      '<span class="bxp-tag"><b>' + kh[k] + '</b>' + hangHTML(dg) + '</span>' +
      '<div class="bxp-r r' + k + '" data-khu="' + k + '">' +
      khu[k].map(function (c) { return laHTML(c, laChon === c ? 'sel' : ''); }).join('') +
      '</div></div>';
  }
  h += '</div>';
  p.querySelector('.bxp-body').innerHTML = h;
  coLaPopup();

  var du = khu[1].length === 3 && khu[2].length === 5 && khu[3].length === 5;
  var lung = du && !B.hopLe(khu[1], khu[2], khu[3]);
  var c = p.querySelector('.bxp-canh');
  if (lung) c.textContent = 'Binh Lủng — chi dưới phải mạnh hơn chi trên';
  else c.textContent = 'Kéo một lá thả sang lá khác để đổi chỗ';
  c.classList.toggle('xau', !!lung);
  p.querySelector('[data-a="binh"]').className = 'bx-btn pri' + (du && !lung ? '' : ' dis');
  var mb = B.mauBinh(hands[0]);
  var mbEl = p.querySelector('.bxp-mb');
  mbEl.style.display = mb ? '' : 'none';
  if (mb) mbEl.innerHTML = '<b>' + mb.ten + '</b> — ' + mb.mo + ' (ăn ' + mb.chi + ' chi mỗi nhà)';
}
/**
 * Cỡ lá trong bảng Xếp Bài — ĐO khung rồi tính, không đoán bằng media query.
 * Media query ăn theo bề ngang MÀN HÌNH, mà bảng này nằm trong khung bàn nằm trong trang:
 * trên máy 412px thì hàng 5 lá 62px + cột nhãn 64px = 398px, khung chỉ có 344px ⇒ tràn ngang,
 * lá thứ năm bị cắt (đúng lỗi user chụp). Tính từ bề ngang THẬT thì không bao giờ tràn.
 */
function coLaPopup() {
  var p = $('.bxp');
  if (!p) return;
  // Nhãn chi lên trên hàng bài khi cột nhãn 104px ăn quá nhiều bề ngang. Khung NGANG (điện thoại
  // xoay ngang / toàn màn hình) thì ngược lại: thừa ngang, thiếu dọc ⇒ giữ cột nhãn để đỡ tốn
  // ba dòng chiều cao.
  var hep = root.clientWidth < 520;
  p.classList.toggle('hep', hep);
  var khe = hep ? 6 : 10;                       // khe giữa hai lá (khớp .bxp-r gap)
  var vien = hep ? 8 : 14;                      // .bxp-wrap padding
  var dem = hep ? 20 : 32;                      // .bxp padding trái+phải
  var cot = hep ? 0 : 104;                      // cột nhãn chi (92 + gap 12)
  var wKhung = Math.min(840, root.clientWidth - vien * 2) - dem;
  var w = Math.min(118, Math.floor((wKhung - cot - 4 * khe) / 5));
  w = Math.max(30, w);
  p.style.setProperty('--bxp-la', w + 'px');
  // Cao quá thì phải cuộn — ĐO thật rồi rút, đừng cộng nhẩm chiều cao từng phần (đầu bảng ·
  // dòng Mậu Binh · ba nhãn chi · hàng nút đều co giãn theo nội dung).
  // ⚠ Rút theo TỪNG NẤC CỐ ĐỊNH thì màn thấp (điện thoại nằm ngang) chạy hết vòng vẫn còn tràn.
  //   Chia phần thừa cho ba hàng rồi đổi sang bề rộng là hai vòng đã khít.
  if (!$('.bxp-wrap').classList.contains('show')) return;
  for (var i = 0; i < 6; i++) {
    var thua = p.scrollHeight - p.clientHeight;
    if (thua <= 1 || w <= 30) break;
    var moi = Math.floor(w - (thua / 3) / 1.398 - 1);
    if (moi >= w) moi = w - 2;
    w = Math.max(30, moi);
    p.style.setProperty('--bxp-la', w + 'px');
  }
}
function moPopup() { $('.bxp-wrap').classList.add('show'); vePopup(); veDongHo(); }
function dongPopup() { $('.bxp-wrap').classList.remove('show'); }

// ================= đồng hồ xếp bài =================
// 45 giây để binh. Đóng bảng ra xem bàn thì đồng hồ VẪN chạy — nên số giây phải hiện
// ở cả hai chỗ: trong bảng và trên thanh trạng thái của bàn.
var GIAY_XEP = 45;
var dongHo = null, conLai = 0;
function veDongHo() {
  var t = conLai > 0 ? conLai : 0;
  var e = $('.bxp-dh');
  e.textContent = 'Còn ' + t + ' giây';
  e.classList.toggle('gap', t <= 10);
  if (!daBinh) $('.bx-canh').textContent = 'Xếp bài — còn ' + t + ' giây';
}
function tatDongHo() { if (dongHo) { clearInterval(dongHo); dongHo = null; } }
function batDongHo() {
  tatDongHo();
  conLai = GIAY_XEP;
  veDongHo();
  dongHo = setInterval(function () {
    conLai--;
    veDongHo();
    if (conLai > 0 || daBinh) return;
    tatDongHo();
    // Hết giờ thì binh luôn thế đang có. Đang lủng thì để máy binh hộ, chứ để nguyên
    // là thua sạch ba chi — phạt nặng chỉ vì hết giờ thì quá tay.
    if (!B.hopLe(khu[1], khu[2], khu[3])) tuDong();
    binh();
  }, 1000);
}

function khuCua(c) { for (var k = 1; k <= 3; k++) if (khu[k].indexOf(c) >= 0) return k; return -1; }

/**
 * Đổi chỗ hai lá — ĐÚNG VỊ TRÍ, lá này vào đúng ô lá kia vừa đứng.
 * ⚠ TUYỆT ĐỐI KHÔNG sắp lại chi sau khi đổi: sắp theo bậc thì lá vừa thả nhảy sang ô khác,
 * người chơi bấm một chỗ mà nó hiện ra chỗ khác. Thứ tự trong chi không ảnh hưởng luật.
 */
var laChon = null;
function doiCho(a, b) {
  var ka = khuCua(a), kb = khuCua(b);
  if (ka < 1 || kb < 1 || a === b) return;
  var ia = khu[ka].indexOf(a), ib = khu[kb].indexOf(b);
  khu[ka][ia] = b;
  khu[kb][ib] = a;
}
/** Chạm: lá đầu chọn, lá sau đổi chỗ. Dành cho cảm ứng — kéo thả dễ hụt ngón. */
function chamLaPopup(c) {
  if (laChon === null || laChon === c) { laChon = (laChon === c) ? null : c; vePopup(); return; }
  doiChoMuot(laChon, c);            // doiChoMuot tự tắt vòng vàng trước khi vẽ lại
}

/**
 * Đổi chỗ CÓ chuyển động: đo chỗ cũ của hai lá, vẽ lại, rồi kéo chúng từ chỗ cũ về chỗ mới.
 * Đổi thẳng rồi vẽ lại thì hai lá nhảy cái tách — nhìn rất thô, không thấy được mình vừa đổi gì với gì.
 */
function rectLa(c) {
  var el = root.querySelector('.bxp-la[data-c="' + c + '"]');
  return el ? el.getBoundingClientRect() : null;
}
function bayVe(c, r0) {
  if (!r0) return;
  var el = root.querySelector('.bxp-la[data-c="' + c + '"]');
  if (!el) return;
  var r1 = el.getBoundingClientRect();
  var dx = r0.left - r1.left, dy = r0.top - r1.top;
  if (!dx && !dy) return;
  el.classList.add('bay');
  el.style.transition = 'none';
  el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  requestAnimationFrame(function () {
    el.style.transition = 'transform .26s cubic-bezier(.2,.7,.3,1)';
    el.style.transform = 'translate(0,0)';
    setTimeout(function () { el.classList.remove('bay'); el.style.transition = ''; el.style.transform = ''; }, 300);
  });
}
function doiChoMuot(a, b) {
  // ⚠ Tắt vòng vàng TRƯỚC khi vẽ lại. Xoá laChon sau vePopup() thì lá vừa đổi vẫn còn viền +
  // quầng sáng, mà không có nhịp vẽ nào nữa để gỡ ⇒ đổi xong tay vẫn thấy "còn dính lá cũ".
  laChon = null;
  var ra = rectLa(a), rb = rectLa(b);
  doiCho(a, b);
  vePopup();
  bayVe(a, ra); bayVe(b, rb);
}

function tuDong() {
  var x = B.xepTuDong(hands[0]);
  if (!x) return;
  var sx = function (m) { return m.slice().sort(function (p, q) { return p - q; }); };
  khu = [[], sx(x.dau), sx(x.giua), sx(x.cuoi)];   // chỉ sắp MỘT lần lúc máy binh, sau đó giữ nguyên chỗ
  laChon = null; vePopup();
}
function xepLai() { tuDong(); }        // không còn "dọn hết ra", chỉ binh lại theo máy
// ================= camera =================
function camAt(r) {
  return new THREE.Vector3(
    target.x + r * Math.sin(sph.phi) * Math.sin(sph.theta),
    target.y + r * Math.cos(sph.phi),
    target.z + r * Math.sin(sph.phi) * Math.cos(sph.theta));
}
function datKhoOng(size) {
  var a = W() / H();
  camera.left = -size * a / 2; camera.right = size * a / 2;
  camera.top = size / 2; camera.bottom = -size / 2;
  camera.updateProjectionMatrix();
}
function moc() {
  var p = [], i, k;
  // ⚠ Ôm trọn vành gỗ (R_BAN 7.15) là thứ ghìm cỡ lá trên MÀN HÌNH nhiều nhất — vành chỉ là
  // khung trang trí. Ngắm sát mép nỉ, chấp nhận cắt bớt vành, thì mọi thứ to thêm ~1/5.
  // (Cùng cách đã dùng cho màn dọc ở Tiến Lên.)
  // Màn DỌC: ngắm hẹp hơn cả mép nỉ (chấp nhận cắt hai chỏm trái/phải của bát giác) — bốn khối
  // bài vẫn lọt trọn vì chúng mới là mốc rộng nhất, mà bài thì to thêm ~1/6. Màn dọc vốn thừa
  // chiều cao và thiếu bề ngang, giữ trọn vành nỉ chỉ để đổi lấy bài bé.
  var Rm = (W() / H() < 1) ? R_NI - 0.55 : R_NI + 0.42;
  for (i = 0; i < 8; i++) {
    var a = Math.PI / 8 + i * Math.PI / 4;
    p.push(new THREE.Vector3(Math.cos(a) * Rm, TOPY, Math.sin(a) * Rm));
    p.push(new THREE.Vector3(Math.cos(a) * Rm, -TH / 2, Math.sin(a) * Rm));
  }
  // bốn khu bài — lấy bốn góc ngoài cùng của từng khu làm mốc
  var b0 = BC.bao(), hw = b0.hw + 0.12, hz = b0.hz + 0.12;
  for (k = 0; k < 4; k++) {
    var A = NEO_SO[k];
    [-1, 1].forEach(function (sx) {
      [-1, 1].forEach(function (sz) {
        p.push(new THREE.Vector3(A.pos[0] + sx * hw, A.pos[1], A.pos[2] + sz * hz));
      });
    });
  }
  return p;
}
function canKhung() {
  if (!camera) return;
  var pts = moc(), LIM = (W() / H() < 1) ? 0.975 : 0.945;
  function boxAt(size) {
    datKhoOng(size);
    camera.position.copy(camAt(R_CAM)); camera.lookAt(target); camera.updateMatrixWorld();
    var mnx = 9, mxx = -9, mny = 9, mxy = -9;
    for (var i = 0; i < pts.length; i++) {
      var v = pts[i].clone().project(camera);
      if (v.x < mnx) mnx = v.x; if (v.x > mxx) mxx = v.x;
      if (v.y < mny) mny = v.y; if (v.y > mxy) mxy = v.y;
    }
    return { mnx: mnx, mxx: mxx, mny: mny, mxy: mxy };
  }
  for (var pass = 0; pass < 3; pass++) {
    var lo = 2, hi = 90, mid;
    for (var it = 0; it < 26; it++) {
      mid = (lo + hi) / 2;
      var b = boxAt(mid);
      if (Math.max(-b.mnx, b.mxx, -b.mny, b.mxy) <= LIM) hi = mid; else lo = mid;
    }
    rFit = hi;
    var b2 = boxAt(rFit);
    var cx = (b2.mnx + b2.mxx) / 2, cy = (b2.mny + b2.mxy) / 2;
    if (Math.abs(cx) < 0.004 && Math.abs(cy) < 0.004) break;
    var right = new THREE.Vector3(), up = new THREE.Vector3();
    camera.matrixWorld.extractBasis(right, up, new THREE.Vector3());
    var hH = rFit, hW = hH * (W() / H());
    target.addScaledVector(right, cx * hW / 2);
    target.addScaledVector(up, cy * hH / 2);
    target.y = Math.max(-1.4, Math.min(1.4, target.y));
  }
  updCam();
}
function updCam() {
  if (!camera) return;
  datKhoOng(rFit * (sph.zoom || 1));
  camera.position.copy(camAt(R_CAM)); camera.lookAt(target);
  nhanBan = true;                    // camera đổi ⇒ khối bài chiếu ra chỗ khác ⇒ treo lại thẻ
}
function onResize() {
  // Khung THẤP (điện thoại xoay ngang, cửa sổ bé): chrome rút gọn lại, không thì bốn thẻ
  // to bằng khung không còn chỗ nào không đè lên bài, và hàng nút thì to lấn hết bàn.
  capKhung(root);
  coLaPopup();                       // xoay ngang / vào toàn màn hình là bảng xếp phải tính lại cỡ lá
  if ($('.bx-banner').classList.contains('show')) vuaKhung($('.bx-end'), root);
  if (!renderer) return;
  renderer.setSize(W(), H());
  var z = sph.zoom || 1; target.set(0, 0, 0); canKhung(); sph.zoom = z; updCam();
}


// ================= tương tác trên bàn (chỉ còn xoay ngắm) =================
function onDown(e) { drag = true; moved = 0; lx = e.clientX; ly = e.clientY; }
function onMove(e) {
  if (!drag) return;
  var dx = e.clientX - lx, dy = e.clientY - ly;
  moved += Math.abs(dx) + Math.abs(dy);
  if (spectate) {
    sph.theta -= dx * 0.006;
    sph.phi = Math.max(0.16, Math.min(1.18, sph.phi - dy * 0.005));
    updCam();
  }
  lx = e.clientX; ly = e.clientY;
}
function onUp(e) { drag = false; }     // bàn 3D chỉ để NGẮM; mọi thao tác xếp bài nằm ở popup
function onWheel(e) {
  if (!spectate) return;
  e.preventDefault();
  sph.zoom = Math.max(0.62, Math.min(1.55, (sph.zoom || 1) + e.deltaY * 0.0009));
  updCam();
}


// Báo sự kiện GIỮA BÀN — bê khuôn `skillCue` của Kỳ Trận, đã dùng ở Tiến Lên.
var CUE_BAC = [
  { co: 26, mau: '#f4d99a', glow: 'rgba(230,192,121,.22)' },
  { co: 33, mau: '#f0a868', glow: 'rgba(240,168,104,.26)' },
  { co: 40, mau: '#ef7d6a', glow: 'rgba(239,125,106,.30)' },
  { co: 48, mau: '#ffd76a', glow: 'rgba(255,215,106,.34)' }
];
var cueT = 0;
function cue(txt, bac, ai) {
  bac = Math.max(0, Math.min(3, bac | 0));
  var b = CUE_BAC[bac], hep = scEl.clientWidth < 620;
  var cu = root.querySelector('.bx-skcue'); if (cu) cu.remove();
  var box = document.createElement('div');
  box.className = 'bx-skcue';
  box.style.setProperty('--acc', b.mau);
  box.style.setProperty('--soft', b.glow);
  var sh = '', i, a;
  for (i = 0; i < 10; i++) {
    a = (i / 10) * 6.2832;
    sh += '<i class="sk-shard" style="--tx:' + Math.round(Math.cos(a) * 150) + 'px;--ty:' +
      Math.round(Math.sin(a) * 84) + 'px;--r:' + Math.round(a * 57) + 'deg;--d:' + (360 + (i % 3) * 130) + 'ms"></i>';
  }
  box.innerHTML = '<div class="sk-streak"></div><div class="sk-flash"></div>' +
    '<div class="sk-nm" style="font-size:' + Math.round(b.co * (hep ? 0.66 : 1)) + 'px">' + txt + '</div>' +
    (ai ? '<div class="sk-who">' + ai + '</div>' : '') + sh;
  root.appendChild(box);
  requestAnimationFrame(function () {
    var ds = box.querySelectorAll('.sk-streak,.sk-flash,.sk-nm,.sk-who,.sk-shard');
    for (var k = 0; k < ds.length; k++) ds[k].classList.add('go');
  });
  clearTimeout(cueT);
  cueT = setTimeout(function () { try { box.remove(); } catch (e) { } }, 1300);
}

var toastT = 0;
function toast(m) {
  var t = $('.bx-toast'); t.textContent = m; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2100);
}

// ================= binh → so từng chi → tổng =================
var kqVan = null;

function binh() {
  if (daBinh) return;
  if (!B.hopLe(khu[1], khu[2], khu[3])) return;
  daBinh = true;
  tatDongHo();
  dongPopup();
  // Binh xong thì nút "Mở Bảng Xếp Bài" thành nút chết (`mo` có chốt `if (!daBinh)`),
  // mà nó lại chiếm đúng chỗ thẻ tên của mình ở mép dưới. Giấu đi.
  $('.bx-act').style.display = 'none';
  xepNha[0] = { dau: khu[1].slice(), giua: khu[2].slice(), cuoi: khu[3].slice() };
  for (var s = 1; s < 4; s++) xepNha[s] = B.xepTuDong(hands[s]);
  kqVan = B.chamVan(hands, xepNha);
  // Bài mình ngửa ngay cho thấy thế vừa binh; ba nhà kia còn úp, mở dần theo từng chi.
  bayNha(0, true);
  for (var s2 = 1; s2 < 4; s2++) bayNha(s2, false);
  datNhan();
  $('.bx-canh').textContent = 'Đang đợi các nhà khác…';
  setTimeout(function () { if (daBinh) soTungChi(0); }, 1800);
}

/**
 * Lật từng chi một: làm nổi hàng đang so ở CẢ BỐN nhà, ghi hạng bài + số chi ăn/thua ngay dưới tên nhà.
 * Bảng tổng chỉ hiện sau khi soi xong ba chi — bày một cục số ra ngay thì không ai hiểu vì sao thắng thua.
 */
function soTungChi(r) {
  if (r > 2) { setTimeout(hienTong, 900); return; }
  var CHI_TEN = ['Chi Đầu', 'Chi Giữa', 'Chi Cuối'];
  $('.bx-canh').textContent = 'Đang so ' + CHI_TEN[r];
  cue(CHI_TEN[r], r, r === 2 ? 'Chi quyết định' : '');   // chữ bung giữa bàn, chi Cuối nặng ký nhất
  // Mở bài THEO TỪNG CHI: ba nhà kia chỉ lật tới đúng chi đang so, chi sau vẫn úp.
  // (Nhà mình ngửa sẵn từ lúc binh — bài của mình thì mình biết rồi.)
  // Đồng thời mờ các chi đã so xong, làm nổi chi đang so.
  for (var s = 0; s < 4; s++) {
    var g = nhaGroup[s];
    for (var i = 0; i < g.children.length; i++) {
      var m = g.children[i], chi = m.userData.chi;
      var ngua = (s === 0) || chi <= r;
      var noi = (chi === r);
      datMat(m, ngua);
      m.position.y = NEO_SO[s].pos[1] + (m.userData.dy || 0) + (noi ? 0.16 : 0);
      if (ngua) m.children[1].material = noi ? MAT.mat : MAT.matMo;
    }
  }
  veChe(r);
  boCanShadow = true;
  // 1,6s là vừa đủ đọc chi của MÌNH; user xin thêm 2 giây để còn kịp soi bài ba nhà kia.
  setTimeout(function () { soTungChi(r + 1); }, 3600);
}

function hienTong() {
  over = true;
  $('.bx-canh').textContent = 'Xong ván';   // không thì thanh trạng thái đứng ở "Đang so Chi Cuối"
  for (var s = 0; s < 4; s++) {
    var g = nhaGroup[s];
    for (var i = 0; i < g.children.length; i++) {
      g.children[i].position.y = NEO_SO[s].pos[1] + (g.children[i].userData.dy || 0);
      g.children[i].children[1].material = MAT.mat;
    }
  }
  var toi = kqVan.chi[0];
  var el = $('.bx-end');
  el.className = 'bx-end ' + (toi > 0 ? 'win' : toi < 0 ? 'lose' : 'hoa');
  el.querySelector('.bt').textContent = toi > 0 ? 'Ăn ' + toi + ' Chi' : toi < 0 ? 'Chung ' + (-toi) + ' Chi' : 'Hoà Cả Làng';
  var mb = kqVan.mb[0];
  el.querySelector('.bs').textContent = kqVan.lung[0] ? 'Binh lủng — thua sạch ba chi với cả làng.'
    : mb ? (mb.ten + ' — ' + mb.mo) : '';

  // bảng LƯỚI: hàng = ba chi, cột = bốn nhà. Nhìn phát thấy ngay chi nào ăn chi nào thua.
  var CHI_TEN = ['Chi Đầu', 'Chi Giữa', 'Chi Cuối'];
  var h = '<tr><th></th>';
  for (var s3 = 0; s3 < 4; s3++) {
    // Chân dung trên đầu cột: nhìn mặt là biết cột nào của ai, khỏi phải đọc tên bị cắt cụt.
    var av3 = (s3 > 0 && CUA[s3].art) ? '<img class="av" src="' + CUA[s3].art + '" alt="" onerror="this.remove()">' : '';
    h += '<th class="' + (s3 === 0 ? 'me' : '') + '">' + av3 +
      '<span class="nm">' + (s3 === 0 ? 'Bạn' : CUA[s3].ten) + '</span></th>';
  }
  h += '</tr>';
  for (var r = 0; r < 3; r++) {
    h += '<tr><td class="lb">' + CHI_TEN[r] + '</td>';
    for (var s4 = 0; s4 < 4; s4++) {
      var d = kqVan.dg[s4], n = 0, txt = '—';
      if (d && !kqVan.mb[s4] && !kqVan.lung[s4]) {
        n = netChiCua(s4, r);       // DÙNG CHUNG công thức với thẻ, không thì hai chỗ lệch nhau
        txt = '<span style="color:' + MAU_HANG[d[r].hang] + '">' + B.tenHang(d[r]) + '</span>';
      }
      h += '<td class="' + (s4 === 0 ? 'me' : '') + '">' + txt +
        (d && !kqVan.mb[s4] && !kqVan.lung[s4] ? '<b class="' + (n > 0 ? 'pos' : n < 0 ? 'neg' : '') + '">' + (n > 0 ? '+' : '') + n + '</b>' : '') + '</td>';
    }
    h += '</tr>';
  }
  h += '<tr class="tong"><td class="lb">Tổng</td>';
  for (var s5 = 0; s5 < 4; s5++) {
    var t = kqVan.chi[s5];
    h += '<td class="' + (s5 === 0 ? 'me ' : '') + (t >= 0 ? 'pos' : 'neg') + '">' + (t >= 0 ? '+' : '−') + Math.abs(t) + ' chi<b>' +
      (t >= 0 ? '+' : '−') + fmt(Math.abs(t) * cuoc) + '</b></td>';
  }
  h += '</tr>';
  el.querySelector('.bx-luoi').innerHTML = h;

  // ⛔ ĐÃ BỎ dòng liệt kê thưởng bộ dưới bảng (user: "bỏ cái dòng giải thích dài ngoằn đi").
  //    Nó vừa dài vừa lặp — `chiTiet` ghi khoản thưởng một lần cho MỖI nhà bị so, nên một bộ
  //    Thùng Phá Sảnh hiện ra ba lần y hệt nhau. Số thưởng đã nằm trong ô chi rồi.
  $('.bx-banner').classList.add('show');
  vuaKhung($('.bx-end'), root);      // ép bảng vừa khung, khỏi phải lăn chuột xem kết quả
  // Đếm số nhà mình sập trọn ba chi (Sâm Banh) — dùng cho sổ thành tích.
  var samBanh = 0, dTa = kqVan.dg[0];
  if (dTa && !kqVan.mb[0] && !kqVan.lung[0]) {
    for (var sk = 1; sk < 4; sk++) {
      if (!kqVan.dg[sk] || kqVan.mb[sk] || kqVan.lung[sk]) continue;
      var trongVen = true;
      for (var vk = 0; vk < 3; vk++) if (B.soChi(dTa[vk], kqVan.dg[sk][vk]) <= 0) trongVen = false;
      if (trongVen) samBanh++;
    }
  }
  // Kỳ Hồn: chỉ thưởng khi ĂN, và thưởng đậm cho ván lớn — cùng thang với Tiến Lên (Nhất 20).
  var kyHon = toi >= 6 ? 20 : toi > 0 ? 10 : 0;
  if (opts.onEnd) opts.onEnd({
    chi: toi, bac: toi * cuoc, samBanh: samBanh, kyHon: kyHon,
    mauBinh: mb ? mb.id : null, lung: kqVan.lung[0],
  });
}

// nhãn tên nhà bám theo khu bài trên bàn
var nhanEl = [];
function taoNhan() {
  for (var s = 0; s < 4; s++) {
    var d = document.createElement('div');
    d.className = 'bx-nhan';
    // Chân dung Danh Sĩ ngay trong thẻ — nhìn mặt là biết đang so với ai, khỏi đọc tên.
    // Nhà mình không có art nên thẻ chỉ có chữ (flex tự co lại, không để ô trống).
    d.innerHTML = (s > 0 && CUA[s].art
      ? '<img class="av" src="' + CUA[s].art + '" alt="" onerror="this.remove()">' : '') +
      '<div class="tx"><div class="nm">' + (s === 0 ? 'Bạn' : CUA[s].ten) + '</div>' +
      '<div class="d2"><span class="hg"></span><span class="ch"></span></div>' +
      '<div class="th"></div></div>';
    root.appendChild(d); nhanEl[s] = d;
    canhCu[s] = BC.nhanGoc ? BC.MEP[s] : BC.nhanCho(s);   // khung đầu đã đúng hướng gốc, khỏi nhấp nháy
  }
}
// ================= nội dung ván trên thẻ chân dung =================
// Hạng bài + ăn/thua nằm NGAY CẠNH chân dung (user chốt), không tách ra dấu báo riêng:
// một chỗ duy nhất để đọc "nhà này là ai · chi này bài gì · ăn hay thua".
function anChe() {
  nhanBan = true;
  for (var s = 0; s < 4; s++) {
    var el = nhanEl[s];
    el.className = 'bx-nhan';
    el.querySelector('.hg').textContent = '';
    el.querySelector('.ch').textContent = '';
    el.querySelector('.th').textContent = '';
  }
}

/**
 * Nội dung dấu báo cho chi thứ `r`.
 * ⚠ Số ở đây phải TÍNH ĐÚNG MỘT SỔ với bảng tổng kết, không thì cộng ba chi lại không khớp
 * và người chơi tưởng game chấm sai. Engine tính THEO TỪNG CẶP, mỗi cặp gồm:
 *   so chi trần  +  thưởng bộ của mình  −  thưởng bộ của nhà kia.
 * Nên ở đây cũng phải cộng theo từng cặp y hệt, đừng lấy chi trần rồi cộng thưởng một lần.
 * Cặp dính Binh Lủng / Mậu Binh KHÔNG chia được theo chi (là khoản trọn ván) — mấy nhà đó
 * hiện nhãn riêng, không hiện số từng chi.
 */
/** Ăn/thua chi `r` của nhà `s`, tính THEO TỪNG CẶP y như engine (chi trần + chênh thưởng bộ). */
function netChiCua(s, r) {
  var d = kqVan.dg[s];
  if (!d || kqVan.mb[s] || kqVan.lung[s]) return 0;
  var n = 0, thg = B.thuongChi(r, d[r]);
  for (var j = 0; j < 4; j++) {
    if (j === s || !kqVan.dg[j] || kqVan.mb[j] || kqVan.lung[j]) continue;
    n += B.soChi(d[r], kqVan.dg[j][r]) + thg - B.thuongChi(r, kqVan.dg[j][r]);
  }
  return n;
}

function veChe(r) {
  nhanBan = true;                    // đổi chữ trong thẻ ⇒ thẻ đổi cỡ ⇒ phải tính lại chỗ treo
  for (var s = 0; s < 4; s++) {
    var el = nhanEl[s], hg = el.querySelector('.hg'), kq = el.querySelector('.ch'), th = el.querySelector('.th');
    var d = kqVan.dg[s];
    el.className = 'bx-nhan';
    th.textContent = '';
    hg.style.textShadow = '';
    if (kqVan.mb[s]) {
      hg.textContent = kqVan.mb[s].ten; hg.style.color = '#f4d99a';
      kq.textContent = 'ăn trắng ' + kqVan.mb[s].chi + ' chi/nhà';
      kq.className = 'ch pos';
      el.className = 'bx-nhan sam';
      continue;
    }
    if (kqVan.lung[s] || !d) {
      hg.textContent = 'Binh Lủng'; hg.style.color = 'var(--warn)';
      kq.textContent = 'thua sạch ba chi';
      kq.className = 'ch neg';
      el.className = 'bx-nhan xau';
      continue;
    }
    var thg = B.thuongChi(r, d[r]), n = netChiCua(s, r);
    hg.textContent = B.tenHang(d[r]);
    hg.style.color = MAU_HANG[d[r].hang];
    hg.style.textShadow = QUANG_HANG[d[r].hang] >= 0.5 ? '0 0 10px ' + rgba(MAU_HANG[d[r].hang], 0.6) : '';
    kq.textContent = n > 0 ? ('Ăn ' + n + ' chi') : n < 0 ? ('Mất ' + (-n) + ' chi') : 'Hòa';
    kq.className = 'ch ' + (n > 0 ? 'pos' : n < 0 ? 'neg' : '');
    if (thg) th.textContent = 'Thưởng bộ +' + thg + ' mỗi nhà';
    // Sâm Banh chỉ biết được sau khi so xong CẢ BA chi ⇒ chỉ ghép vào nhịp chi Cuối.
    // ⚠ CÓ HAI VẾ: mình sập nhà kia (+3 nữa, thành ăn 6) và mình BỊ SẬP (−3 nữa, thành mất 6).
    // Chỉ đếm vế ăn là số cộng ra sẽ thiếu — máy đo bắt được 4196/16000 lượt lệch vì đúng lỗi này.
    if (r === 2) {
      var an = [], bi = [];
      for (var k = 0; k < 4; k++) {
        if (k === s || !kqVan.dg[k] || kqVan.mb[k] || kqVan.lung[k]) continue;
        var t1 = 0, t2 = 0;
        for (var v = 0; v < 3; v++) {
          var x = B.soChi(d[v], kqVan.dg[k][v]);
          if (x > 0) t1++; else if (x < 0) t2++;
        }
        if (t1 === 3) an.push(CUA[k].ten);
        if (t2 === 3) bi.push(CUA[k].ten);
      }
      var d1 = an.length ? 'Sâm Banh ' + an.join(', ') : '';
      var d2 = bi.length ? 'Bị sập bởi ' + bi.join(', ') : '';
      if (d1 || d2) {
        th.textContent = [d1, d2].filter(Boolean).join(' · ');
        el.className = 'bx-nhan ' + (an.length ? 'sam' : 'xau');
      }
    }
  }
  // ⚠ Đặt lại thẻ SAU khi điền chữ. Đo lúc thẻ còn một dòng rồi giữ nguyên tâm thì lúc nở ra
  // ba dòng nó phình xuống đúng vào mép bài.
  datNhan();
  setTimeout(datNhan, 30);
}

/** Hộp bao của khối bài nhà `s` sau khi chiếu ra màn (px trong .bx-scene). */
function hopKhu(s, rc) {
  var A = NEO_SO[s], bb = BC.bao();
  var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (var a = 0; a < 4; a++) {
    var v = new THREE.Vector3(A.pos[0] + ((a & 1) ? bb.hw : -bb.hw), A.pos[1],
      A.pos[2] + ((a & 2) ? bb.hz : -bb.hz)).project(camera);
    var qx = (v.x * 0.5 + 0.5) * rc.w, qy = (-v.y * 0.5 + 0.5) * rc.h;
    if (qx < x0) x0 = qx;
    if (qx > x1) x1 = qx;
    if (qy < y0) y0 = qy;
    if (qy > y1) y1 = qy;
  }
  return { x0: x0, x1: x1, y0: y0, y1: y1 };
}

/** Diện tích chồng nhau của hai hộp (px²) — 0 là rời hẳn. */
function chongNhau(a, b) {
  var w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  var h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  return (w > 0 && h > 0) ? w * h : 0;
}

// Hộp của chrome cố định trong khung (tiêu đề · pill trạng thái · hàng nút): thẻ tên phải
// tránh, không thì trên máy hẹp nó nằm chồng đúng lên chữ. Đo lại mỗi 30 khung cho nhẹ.
var chromeHop = [], chromeDem = 0;
var CHROME_SEL = ['.bx-title', '.bx-sub', '.bx-canh', '.bx-left', '.bx-act'];
function hopChrome() {
  if (chromeDem-- > 0) return chromeHop;
  chromeDem = 30;
  var rr = root.getBoundingClientRect(), out = [];
  for (var i = 0; i < CHROME_SEL.length; i++) {
    var e = root.querySelector(CHROME_SEL[i]);
    if (!e || e.offsetParent === null) continue;
    var b = e.getBoundingClientRect();
    if (!b.width || !b.height) continue;
    out.push({ x0: b.left - rr.left, y0: b.top - rr.top, x1: b.right - rr.left, y1: b.bottom - rr.top });
  }
  chromeHop = out;
  return out;
}

/** Mấy chỗ có thể treo thẻ ở một hướng — chỗ đầu là chỗ đẹp nhất của hướng đó. */
function choTreo(ben, k, w, h, rw, rh) {
  var cx = (k.x0 + k.x1) / 2, cy = (k.y0 + k.y1) / 2, m = 6, out = [], i, j;
  if (ben === 'tren' || ben === 'duoi') {
    var y = (ben === 'tren') ? k.y0 - h / 2 - m : k.y1 + h / 2 + m;
    // Hai chỗ cuối là CHÉO GÓC (lệch hẳn sang bên cạnh khối): bốn "góc" của thế chữ thập là
    // vùng nỉ trống duy nhất còn lại trên màn dọc, không cho thử thì thẻ đành đè lên bài.
    var xs = [cx, k.x0 + w / 2, k.x1 - w / 2, w / 2 + 6, rw - w / 2 - 6,
      k.x0 - w / 2 - 8, k.x1 + w / 2 + 8];
    for (i = 0; i < xs.length; i++) out.push([xs[i], y]);
  } else {
    // Chỗ đầu là GHIM RA MÉP KHUNG (bốn mảng tối quanh bát giác vốn bỏ không, thẻ ra đó thì
    // mặt bài sạch hẳn); chỗ sau là bám sát mép khối bài, dùng khi mép khung không đủ chỗ.
    var xs2 = (ben === 'trai')
      ? [Math.min(w / 2 + 10, k.x0 - w / 2 - m), k.x0 - w / 2 - m]
      : [Math.max(rw - w / 2 - 10, k.x1 + w / 2 + m), k.x1 + w / 2 + m];
    var ys = [cy, k.y0 + h / 2, k.y1 - h / 2, h / 2 + 6, rh - h / 2 - 6];
    for (i = 0; i < xs2.length; i++) for (j = 0; j < ys.length; j++) out.push([xs2[i], ys[j]]);
  }
  return out;
}

/** Giá của một chỗ treo: đè lên bài nặng nhất, rồi đến đè chrome / thẻ khác, rồi lòi khỏi khung. */
function giaTreo(p, w, h, khoi, can, rw, rh) {
  var b = { x0: p[0] - w / 2, y0: p[1] - h / 2, x1: p[0] + w / 2, y1: p[1] + h / 2 }, g = 0, i;
  // Đè lên BÀI là tệ nhất (che mất mặt bài) — nặng gấp đôi đè lên chrome hay đè lên thẻ khác.
  for (i = 0; i < khoi.length; i++) g += chongNhau(b, khoi[i]) * 5.0;
  for (i = 0; i < can.length; i++) g += chongNhau(b, can[i]) * 1.4;
  var lo = Math.max(0, -b.x0) + Math.max(0, b.x1 - rw) + Math.max(0, -b.y0) + Math.max(0, b.y1 - rh);
  return g + lo * 130;
}

var huyDem = null;                          // hàm dừng đếm ngược trước khi chia bài
var canhCu = [null, null, null, null];      // hướng đã chọn khung trước — giữ cho thẻ khỏi nhảy qua nhảy lại
// Cờ "phải treo lại thẻ". ⚠ ĐỪNG chạy datNhan mỗi khung: một lượt là 4 getBoundingClientRect +
// ~80 phép thử chỗ treo, ép trình duyệt tính lại bố cục 60 lần/giây ⇒ lúc so chi thấy GIẬT ở
// thẻ tên (user báo). Camera đứng yên và chữ không đổi thì thẻ cũng đứng yên.
var nhanBan = true;

/**
 * ⚠ Chỗ đặt thẻ tên phải ĐO, đừng đoán. Bản cũ nhích cứng ±1.35 theo z — khu bài sâu lên
 * (ba chi tách hẳn) là thẻ rơi ngay vào giữa hàng chi Đầu. Cách đúng: chiếu BỐN GÓC khu bài
 * ra màn, lấy mép, rồi đặt thẻ sát ngoài mép đó. (Tiến Lên đã sai đúng kiểu này ba vòng liền.)
 *
 * ⚠ Và ĐO thôi chưa đủ: trên điện thoại dựng, lề hai bên khối bài gần bằng 0 nên chỗ "đúng"
 * theo hướng ngồi lại là chỗ đè lên bài (user chụp đúng cảnh đó). Nên mỗi thẻ nay THỬ bốn
 * hướng × mấy nấc trượt, chấm điểm theo diện tích đè lên bài / chrome / thẻ đã đặt, lấy chỗ
 * rẻ nhất. Máy rộng thì hướng gốc vẫn luôn thắng vì nó không đè gì (giá 0).
 */
function datNhan() {
  if (!camera) return;
  var rc = { w: scEl.clientWidth, h: scEl.clientHeight };
  if (!rc.w || !rc.h) return;
  // Mặt 3D có thể thụt vào trong khung (khổ điện thoại chừa hai dải chrome) — toạ độ thẻ tính
  // theo ROOT nên phải cộng chỗ thụt, quên là cả bốn thẻ lệch lên trên đúng bằng dải đó.
  var ox = scEl.offsetLeft, oy = scEl.offsetTop;
  var rw = root.clientWidth, rh = root.clientHeight;
  var khoi = [], s;
  for (s = 0; s < 4; s++) {
    var k0 = hopKhu(s, rc);
    khoi.push({ x0: k0.x0 + ox, y0: k0.y0 + oy, x1: k0.x1 + ox, y1: k0.y1 + oy });
  }
  var can = hopChrome().slice();
  var thuTu = [0, 2, 1, 3];                 // đặt nhà mình + nhà đối diện trước, hai bên nhường sau
  for (var q = 0; q < 4; q++) {
    s = thuTu[q];
    var el = nhanEl[s], kh = khoi[s], cu = canhCu[s];
    // ⚠ Thẻ Đông/Tây phải CO theo lề thật giữa khối bài và mép khung. Chặn cứng một con số
    // là có ván thẻ nở rộng hơn lề (dòng Sâm Banh hai tên nhà) rồi bị clamp đẩy ngược vào đè bài.
    if (cu === 'trai' || cu === 'phai') {
      var le = (cu === 'trai' ? kh.x0 : rw - kh.x1) - 16;
      el.style.maxWidth = Math.max(130, Math.round(le)) + 'px';
    } else el.style.maxWidth = '';
    var rr = el.getBoundingClientRect();
    var w = rr.width || 90, h = rr.height || 40;
    var uu = BC.nhanGoc ? BC.MEP[s] : BC.nhanCho(s);
    var ds = [uu], moi = ['duoi', 'tren', 'phai', 'trai'], d, v;
    for (d = 0; d < moi.length; d++) if (moi[d] !== uu) ds.push(moi[d]);
    var re = null, reCanh = uu;
    for (d = 0; d < ds.length; d++) {
      var pos = choTreo(ds[d], kh, w, h, rw, rh);
      for (v = 0; v < pos.length; v++) {
        var gia = giaTreo(pos[v], w, h, khoi, can, rw, rh) + d * 45 + v * 12;
        if (ds[d] === cu) gia -= 300;       // đang đứng đó rồi thì đừng nhảy vì chênh vài chục px²
        if (!re || gia < re.g) { re = { g: gia, p: pos[v] }; reCanh = ds[d]; }
      }
    }
    canhCu[s] = reCanh;
    var px = Math.max(w / 2 + 4, Math.min(rw - w / 2 - 4, re.p[0]));
    var py = Math.max(h / 2 + 4, Math.min(rh - h / 2 - 4, re.p[1]));
    el.style.left = px + 'px'; el.style.top = py + 'px';
    can.push({ x0: px - w / 2, y0: py - h / 2, x1: px + w / 2, y1: py + h / 2 });
  }
  khoiCuoi = khoi;      // trang đo ngoài đọc để kiểm thẻ có đè lên bài không
}
var khoiCuoi = [];

function vanMoi(dem) {
  hands = B.deal(rnd);
  khu = [hands[0].slice(), [], [], []];
  xepNha = [null, null, null, null];
  chon = {}; daBinh = false; over = false; kqVan = null;
  tatDongHo();
  if (huyDem) { huyDem(); huyDem = null; }
  $('.bx-banner').classList.remove('show');
  $('.bx-act').style.display = '';
  $('.bx-canh').textContent = 'Đang chia bài…';
  // Chế độ SOI BỐ CỤC: bày sẵn bốn nhà ngửa hết, không bảng xếp, không đồng hồ, không so chi.
  // Dùng cho trang so ba kiểu bày — xem chỗ đặt bài chứ không chơi.
  if (opts.xemBoCuc) {
    for (var sx = 0; sx < 4; sx++) xepNha[sx] = B.xepTuDong(hands[sx]);
    bayTatCa(true);
    $('.bx-act').style.display = 'none';
    $('.bx-canh').textContent = BC.ten;
    for (var sy = 0; sy < 4; sy++) {
      var dgy = B.danhGia(xepNha[sy].cuoi);
      nhanEl[sy].querySelector('.hg').textContent = B.tenHang(dgy);
      nhanEl[sy].querySelector('.hg').style.color = MAU_HANG[dgy.hang];
      nhanEl[sy].querySelector('.ch').textContent = '';
    }
    datNhan();
    setTimeout(datNhan, 260);
    return;
  }
  for (var s = 0; s < 4; s++) { nhanEl[s].querySelector('.hg').textContent = ''; nhanEl[s].querySelector('.ch').textContent = ''; }
  anChe();
  var chia = function () {
    $('.bx-canh').textContent = 'Đang chia bài…';
    // chia bài xong RỒI mới bật bảng xếp — bật ngay thì người chơi không kịp thấy bàn
    chiaBaiAnim(function () {
      if (daBinh) return;               // đã binh trước khi chia xong thì đừng mở lại bảng
      tuDong();                         // binh sẵn một thế hợp lệ; người chơi chỉ đổi chỗ cho vừa ý
      batDongHo();                      // đếm ngược bắt đầu từ lúc bảng hiện ra, không phải từ lúc chia
      moPopup();
    });
  };
  // Đếm ngược giữa bàn rồi mới chia: ván ĐẦU của chiếu 5 giây, "Ván Mới" 3 giây.
  if (dem) { $('.bx-canh').textContent = 'Sắp chia bài'; huyDem = demChia(root, chia, dem); }
  else chia();
}
// ================= vòng vẽ =================
var last = 0;
function animate(ts) {
  raf = requestAnimationFrame(animate);
  tuChinh(ts);                       // tự hạ/nâng tỉ lệ điểm ảnh theo sức máy
  var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts;
  stepTweens(dt);
  if (nhanBan || tweens.length) { datNhan(); nhanBan = false; }
  // Bụi bay: nhích trên CPU rồi nạp lại cả vùng đệm. Ở màn 120Hz mà chạy mỗi khung là 120 lần
  // nạp mỗi giây cho thứ mắt không phân biệt nổi với 30 lần ⇒ chạy theo nhịp, bù quãng đường.
  if (particles && nhipBui(ts)) {
    var pa = particles.geometry.attributes.position, ar = pa.array;
    for (var i = 1; i < ar.length; i += 3) { ar[i] += 0.0176; if (ar[i] > 8.2) ar[i] = -0.3; }
    pa.needsUpdate = true;
  }
  if (tweens.length) { renderer.shadowMap.needsUpdate = true; boCanShadow = true; }
  else if (boCanShadow) { renderer.shadowMap.needsUpdate = true; boCanShadow = false; }
  renderer.render(scene, camera);
}

// ================= nút =================
// KÉO THẢ để đổi chỗ hai lá. Dùng pointer event chứ không dùng kéo-thả sẵn của trình duyệt:
// cái đó trên cảm ứng gần như không nhả. Kéo hụt (thả vào chỗ trống) thì coi như một cú chạm.
var keoTu = null, keoX = 0, keoY = 0, daKeo = false;
root.addEventListener('pointerdown', function (e) {
  var la = e.target.closest('.bxp-la');
  if (!la) return;
  keoTu = +la.getAttribute('data-c'); keoX = e.clientX; keoY = e.clientY; daKeo = false;
});
root.addEventListener('pointermove', function (e) {
  if (keoTu === null) return;
  if (!daKeo && Math.abs(e.clientX - keoX) + Math.abs(e.clientY - keoY) > 8) daKeo = true;
});
root.addEventListener('pointerup', function (e) {
  if (keoTu === null) return;
  var tu = keoTu; keoTu = null;
  var el = document.elementFromPoint(e.clientX, e.clientY);
  var la = el && el.closest ? el.closest('.bxp-la') : null;
  if (daKeo) {                       // thả xuống lá khác thì đổi chỗ, thả hụt thì thôi
    if (la) { var den = +la.getAttribute('data-c'); if (den !== tu) doiChoMuot(tu, den); }
    return;
  }
  chamLaPopup(tu);                   // không kéo = chạm
});

// Luật modal đã chốt cho cả game: đóng được bằng ✕ + ESC + bấm nền.
$('.bxp-wrap').addEventListener('click', function (e) {
  if (e.target === e.currentTarget) dongPopup();
});
function onPhim(e) {
  if (e.key === 'Escape' && $('.bxp-wrap').classList.contains('show')) dongPopup();
}
window.addEventListener('keydown', onPhim);

root.addEventListener('click', function (e) {
  var t = e.target.closest('[data-a]'); if (!t) return;
  var a = t.getAttribute('data-a');
  if (a === 'binh') binh();
  else if (a === 'tudong') tuDong();
  else if (a === 'xoa') xepLai();
  else if (a === 'dong') dongPopup();   // đóng KHÔNG phải binh — đồng hồ vẫn chạy, mở lại được
  else if (a === 'mo') { if (!daBinh) moPopup(); }
  else if (a === 'again') vanMoi(GIAY_VAN_MOI);   // ván mới: đếm 3 giây
  else if (a === 'spectate') {
    spectate = !spectate;
    if (spectate) toast('Quan Chiến: kéo để xoay bàn, lăn chuột để phóng.');
    else {
      // Thoát Quan Chiến là CHỐT góc đang nhìn. ⚠ Lưu TỈ LỆ phóng (zoom) chứ không lưu khoảng
      // cách tuyệt đối — mỗi màn có khoảng cách "vừa khung" riêng (xem engine/gocnhin.js).
      if (opts.onSaveView) opts.onSaveView({ theta: sph.theta, phi: sph.phi, zoom: sph.zoom || 1 });
      toast('Đã khoá góc nhìn cho bàn này.');
    }
  } else if (a === 'exit') { if (opts.onExit) opts.onExit(); }
});

try {
  init3D();
  taoNhan();
  canKhung();
  // Góc nhìn đã khoá của RIÊNG bàn này. Phải đặt SAU canKhung() vì zoom là tỉ lệ so với
  // khoảng cách vừa-khung mà canKhung() vừa tính ra.
  if (opts.gocNhin) {
    sph.theta = opts.gocNhin.theta;
    sph.phi = opts.gocNhin.phi;
    sph.zoom = opts.gocNhin.zoom || 1;
    updCam();
  }
  vanMoi(GIAY_CHIA);            // ván đầu của chiếu: đếm ngược 5 giây rồi mới chia
  setTimeout(onResize, 120); setTimeout(onResize, 480);
  animate(0);
  // Móc chẩn đoán: trang đo ngoài đọc được vị trí THẬT của từng lá trên bàn, khỏi chép lại
  // công thức rồi tự tin vào con số mình tưởng tượng.
  window.__binh = {
    scene: scene, camera: camera, renderer: renderer, nhaGroup: nhaGroup,
    NEO_SO: NEO_SO, R_NI: R_NI, R_BAN: R_BAN, CW: CW, CH: CH,
    SC_SO: SC_SO, BC: BC, bao: BC.bao(),
    STEP_SO: BC.step, BUOC_Z: BC.buocZ || 0,
    bayNha: bayNha, xepNha: xepNha,
    root: root, nhanEl: nhanEl,
    khoi: function () { return khoiCuoi; },       // hộp bốn khối bài theo toạ độ root
    chrome: hopChrome
  };
} catch (err) {
  var d = $('.bx-fb'); d.style.display = 'flex'; d.querySelector('.fm').textContent = String(err && err.message || err);
  if (window.console) console.error(err);
}

return {
  destroy: function () {
    cancelAnimationFrame(raf);
    tatDongHo();
    if (huyDem) { huyDem(); huyDem = null; }
    tm.destroy();                       // rời chiếu mà còn phủ màn hình là kẹt ở màn đen
    if (ro) { ro.disconnect(); ro = null; }
    window.removeEventListener("keydown", onPhim);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    try { renderer.dispose(); } catch (e) { }
    host.innerHTML = "";
  }
};
}


// ================= Sảnh Bài =================
// Sáu chiếu, mỗi chiếu 3 Danh Sĩ thật. Mức cược tính THEO CHI — một ván xập xám ăn thua
// cỡ ±3..±10 chi (gặp bộ lớn có thể vọt lên vài chục), nên cược mỗi chi phải để THẤP hơn
// Tiến Lên (ở đó cược tính theo VÁN) thì hai trò mới ngang tiền nhau.
export const CHIEU = [
  { id: 'trucAnh', ten: 'Chiếu Trúc Ảnh', cuoc: 50, tang: 1,
    lore: 'Bóng trúc rợp sân, ba người bày bài cho hết buổi trưa.',
    ds: ['coNhanMaiKiem', 'langToCam', 'bangPhachNuHiep'] },
  { id: 'hoeAm', ten: 'Chiếu Hoè Âm', cuoc: 200, tang: 1,
    lore: 'Gốc hoè già đầu ngõ — khách qua đường ghé ngồi một ván rồi lại đi.',
    ds: ['diepTuSuong', 'khongTichThuyenSu', 'lacBangNhi'] },
  { id: 'tramThuy', ten: 'Chiếu Trầm Thuỷ', cuoc: 1000, tang: 2,
    lore: 'Bài úp xuống êm như đá chìm — ở chiếu này ai nóng nảy là thua.',
    ds: ['doCoTuyHan', 'tieuVuTinh', 'doanMocVoTranh'] },
  { id: 'hoaVan', ten: 'Chiếu Hoả Vân', cuoc: 5000, tang: 2,
    lore: 'Ba tay chơi khét tiếng, chi cuối lật lên là có người đổi sắc mặt.',
    ds: ['huyetTiBaCo', 'doDuocMaCo', 'namCungLietHoa'] },
  { id: 'thanhLoan', ten: 'Chiếu Thanh Loan', cuoc: 20000, tang: 3,
    lore: 'Chiếu của bậc thành danh. Xếp hụt một chi là mất cả gia sản một vùng.',
    ds: ['toUyenNghiet', 'doanMucPhong', 'huyetDoTangNguyen'] },
  { id: 'vanDai', ten: 'Chiếu Vân Đài', cuoc: 100000, tang: 4,
    lore: 'Cao nhất thiên hạ. Ngồi được xuống đây đã là một thứ danh vọng.',
    ds: ['vanVongNuong', 'moDungPhiTuyet', 'lacVoTran'] },
];
const TANG_TEN = ['', 'Sơ Nhập', 'Thành Danh', 'Cao Thủ', 'Tuyệt Đỉnh'];
const TANG_MAU = ['', '#97c459', '#5dcaa5', '#f0997b', '#e6c079'];

/** Trù Mã cần có để ngồi: gánh nổi một ván xấu (binh lủng mất 9 chi) cộng đệm cho bộ lớn của làng. */
const HE_SO_NGOI = 20;

// CSS Sảnh Bài — tiêm lúc vào view (KHÔNG để trong <template x-if>: thẻ style trong đó chỉ
// tồn tại đúng lúc đang ở view, đã dính một lần ở Cờ Tướng).
function injectSanhStyle() {
  if (document.getElementById('bxs-style')) return;
  const st = document.createElement('style');
  st.id = 'bxs-style';
  st.textContent = [
    '.bxs-chieu{position:relative;display:flex;align-items:center;gap:15px;padding:13px 15px;border-radius:14px;',
    '  background:#0f1521;border:1px solid #1e293b;',
    '  cursor:pointer;transition:transform .14s,border-color .14s,box-shadow .14s}',
    '.bxs-chieu:hover{transform:translateY(-3px);border-color:rgba(230,192,121,.55);box-shadow:0 0 26px -10px rgba(230,192,121,.6)}',
    '.bxs-chieu.locked{opacity:.5;cursor:not-allowed}',
    '.bxs-chieu.locked:hover{transform:none;border-color:#1e293b;box-shadow:none}',
    '.bxs-bac{position:relative;width:112px;height:84px;flex:none}',
    '.bxs-bac img{position:absolute;width:50px;height:62px;object-fit:cover;object-position:50% 16%;border-radius:6px;',
    '  border:1px solid rgba(230,192,121,.34);background:#0b111a;box-shadow:0 6px 14px -6px #000}',
    '.bxs-bac img:nth-child(1){left:0;top:0}',
    '.bxs-bac img:nth-child(2){left:29px;top:11px;z-index:2}',
    '.bxs-bac img:nth-child(3){left:58px;top:22px;z-index:3}',
    '.bxs-i{min-width:0;flex:1}',
    '.bxs-tn{font-weight:700;font-size:15.5px;color:#f4d99a;line-height:1.2}',
    '.bxs-lo{font-style:italic;font-size:11.5px;color:#8b7a63;margin-top:3px;line-height:1.45}',
    '.bxs-ds{font-size:11.5px;color:#b6a68f;margin-top:6px;line-height:1.5}',
    '.bxs-mt{display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap}',
    '.bxs-tag{font-size:11px;border-radius:99px;padding:3px 11px;white-space:nowrap;color:#d9c39a;',
    '  background:rgba(230,192,121,.09);border:1px solid rgba(230,192,121,.3)}',
    '.bxs-tag.warn{color:#e08a8a;border-color:rgba(224,120,120,.45);background:rgba(224,120,120,.1)}',
    // Khổ điện thoại: một chiếu cũ cao tới ~250px (lời giới thiệu 2 dòng · tên ba Danh Sĩ 2 dòng ·
    // ba thẻ mỗi thẻ một dòng) ⇒ nhìn xong một chiếu đã hết màn. Rút mỗi dòng dài về MỘT dòng
    // có dấu ba chấm, thẻ nhỏ lại cho hai thẻ chung một hàng ⇒ còn ~100px.
    '@media (max-width:640px){.bxs-chieu{gap:10px;padding:10px}.bxs-bac{width:80px;height:62px}',
    '  .bxs-bac img{width:37px;height:47px}.bxs-bac img:nth-child(2){left:21px;top:8px}.bxs-bac img:nth-child(3){left:42px;top:16px}',
    '  .bxs-tn{font-size:14px}',
    '  .bxs-lo{font-size:10.5px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '  .bxs-ds{font-size:10.5px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '  .bxs-mt{gap:6px;margin-top:6px}.bxs-tag{font-size:10px;padding:2px 8px}}',
  ].join('\n');
  document.head.appendChild(st);
}

export function binh() {
  return {
    _battle: null,
    inBattle: false,
    loading: false,
    loadErr: '',
    chieu: null,

    get bx() { return this.$store.game.state.binh; },
    get kyHon() { return getKyHon(this.$store.game.state); },
    get kyNgheState() { return kyNgheOf(this.$store.game.state); },
    // Chiếu bài KHÔNG đụng Bạc nhân vật. Mọi cược ăn thua bằng TRÙ MÃ (engine/truma.js).
    get truMa() { void this.$store.game._tick; return soTruMa(this.$store.game.state); },
    get bac() { return (this.$store.game.state.currencies || {}).bac || 0; },
    get mucDoi() { return MUC_DOI; },
    get tiGia() { return TI_GIA; },

    // ---- cửa đổi Trù Mã ----
    doiSo: 5000,
    get doiHopLe() { const n = Math.floor(this.doiSo || 0); return n > 0 && n <= this.bac; },
    get doiNhan() { return Math.max(0, Math.floor(this.doiSo || 0)) * TI_GIA; },
    datMuc(m) { this.doiSo = Math.min(m, this.bac) || m; },
    doiTatCa() { this.doiSo = this.bac; },
    doiChip(bac) {
      const st = this.$store.game.state;
      const r = doiTruMa(st, bac);
      if (!r.ok) { try { this.$store.game.showToast(r.loi); } catch (e) { } return; }
      st.currencies.bac -= r.tru;
      try { Storage.save(st); } catch (e) { }
      this.$store.game._tick++;
      this.$store.game.closeTruMa();
      try {
        this.$store.game.showToast('Đổi ' + (r.tru | 0).toLocaleString('vi-VN') +
          ' Bạc lấy ' + (r.nhan | 0).toLocaleString('vi-VN') + ' Trù Mã.');
      } catch (e) { }
    },

    _ds(id) { try { return (this.$store.game.danhSiBang || []).find((x) => x.id === id) || null; } catch (e) { return null; } },
    faceOf(o) { return (o && o.face) || ('images/danhsi/' + (o && o.id) + '.webp'); },
    tenTang(c) { return TANG_TEN[c.tang] || ''; },
    mauTang(c) { return TANG_MAU[c.tang] || '#e6c079'; },
    // Chưa ngồi thì trả '' — thẻ ẩn luôn chip, đỡ một dòng chữ thừa trên MỌI chiếu lúc mới vào.
    recOf(id) {
      const r = (this.bx.rec || {})[id];
      return (r && r.van) ? (r.thang + ' ván ăn / ' + r.van + ' ván') : '';
    },
    get chieuList() {
      return CHIEU.map((c) => ({
        ...c,
        list: c.ds.map((id) => this._ds(id)).filter(Boolean),
        khoa: this.truMa < c.cuoc * HE_SO_NGOI,
        can: c.cuoc * HE_SO_NGOI,
      }));
    },

    bxInit() {
      ensureBinh(this.$store.game.state);
      injectSanhStyle();
      // Rời view trong lúc còn đang tải Three.js thì _battle vẫn null; phải có cờ _boSo,
      // không thì _mount() chạy muộn trên host đã gỡ khỏi DOM -> rò WebGLRenderer + vòng rAF.
      this.$watch('$store.game.view', (v) => {
        if (v === 'binh') return;
        this._boSo = true;
        if (this._battle) { try { this._battle.destroy(); } catch (e) { } this._battle = null; }
        this.inBattle = false; this.loading = false;
      });
    },

    nhapChieu(c) {
      if (this.inBattle) return;
      if (this.truMa < c.cuoc * HE_SO_NGOI) {
        try { this.$store.game.showToast('Chưa đủ Trù Mã để ngồi chiếu này — đổi thêm ở Sảnh Bài.'); } catch (e) { }
        return;
      }
      this._boSo = false;
      this.chieu = c; this.loadErr = ''; this.loading = true; this.inBattle = true;
      // ⛔ ĐÃ THỬ tự phủ màn hình khi ngồi xuống chiếu — USER BÁC 2026-07-30: *"k dc, bỏ cơ chế
      //    tự full màn hình đi, vẫn phải cần thao tác vào nút phóng to thì game mới toàn màn
      //    hình hoàn chỉnh được"*. Đừng làm lại.
      Promise.all([ensureThree(), ensureEngine()])
        .then(() => { this.loading = false; this.$nextTick(() => this._mount()); })
        .catch((e) => { this.loading = false; this.inBattle = false; this.loadErr = String(e && e.message || e); });
    },

    _mount() {
      if (this._boSo || this.$store.game.view !== 'binh') { this._boSo = false; this.inBattle = false; return; }
      const host = this.$refs.boardHost;
      if (!host) { this.inBattle = false; return; }
      host.innerHTML = '';
      const g = this.$store.game, c = this.chieu;
      this._battle = mountBinh(host, {
        chieu: c.ten,
        cuoc: c.cuoc,
        nguoiChoi: { ten: (g.state.player || {}).name || 'Bạn', art: g.avatarSrc },
        doiThu: c.ds.map((id) => {
          const o = this._ds(id) || { id, ten: 'Đối Thủ', bietHieu: '' };
          return { id: o.id, ten: o.ten, bietHieu: o.bietHieu || '', art: this.faceOf(o) };
        }),
        gocNhin: getGocNhin(g.state, 'binh'),
        onSaveView: (v) => { const r = saveGocNhin(g.state, 'binh', v); try { Storage.save(g.state); } catch (e) { } return r; },
        onClearView: () => { clearGocNhin(g.state, 'binh'); try { Storage.save(g.state); } catch (e) { } },
        onEnd: (kq) => this._ketVan(c.id, kq),
        onExit: () => this._exit(),
      });
    },

    /**
     * Ăn/chung bằng TRÙ MÃ + ghi sổ.
     * ⚠ TUYỆT ĐỐI KHÔNG cộng vào state.currencies.bac — thắng bài mà ra Bạc thì ngồi chiếu
     *   vài ván là giàu, hỏng cả đường cày. Xem engine/truma.js.
     */
    _ketVan(id, kq) {
      const st = this.$store.game.state, n = this.bx;
      if (!n.rec[id]) n.rec[id] = { van: 0, thang: 0, samBanh: 0 };
      n.rec[id].van++; n.van++;
      if ((kq.chi || 0) > 0) { n.rec[id].thang++; n.thang++; }
      if (kq.samBanh) { n.rec[id].samBanh += kq.samBanh; n.samBanh += kq.samBanh; }
      ghiVan(st, kq.bac || 0);
      n.lai = (n.lai || 0) + (kq.bac || 0);
      if (kq.kyHon) { addKyHon(st, kq.kyHon); try { this.$store.game.checkTitles(); } catch (e) { } }
      try { Storage.save(st); } catch (e) { }
      this.$store.game._tick++;
    },

    _exit() {
      if (this._battle) { try { this._battle.destroy(); } catch (e) { } this._battle = null; }
      this.inBattle = false; this.chieu = null;
    },
  };
}
