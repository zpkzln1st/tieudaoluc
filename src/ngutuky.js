// ============================================================
// NGŨ TỬ KỲ (五子棋 / cờ caro) — mini-game 3D (side-content, 0-power)
// Khuôn Kỳ Trận: cách ly tuyệt đối, CHỈ đọc/ghi state.nguTu.
// Bàn cờ 3D = WebGL (Three.js, lazy-load src/lib/three.min.js chỉ khi mở).
// ĐỐI THỦ TÁCH RỜI: hiện là AI (heuristic, độ khó theo rankPower Danh Sĩ);
//   sau cắm PvP online (Supabase) chỉ cần thay nguồn "nước đi đối thủ".
// ============================================================
import { Storage } from './engine/save.js';
import { addKyHon, getKyHon, kyNgheOf, KY_NGHE } from './engine/kyhon.js';   // Kỳ Hồn + danh hiệu Kỳ Nghệ dùng CHUNG với Cờ Tướng
import { getGocNhin, saveGocNhin, clearGocNhin } from './engine/gocnhin.js';   // góc nhìn bàn cờ, mỗi bàn khoá riêng
import { ganToanMan, nutToanManHTML, capKhung, vuaKhung } from './engine/toanman.js';   // phủ kín màn hình + khoá hướng ngang
import { taoTuChinh, nhipDam } from './engine/muot.js';   // tự chỉnh tỉ lệ điểm ảnh + nhịp cho việc phụ

// ---------- ensure/migrate: khởi tạo state.nguTu (gọi mỗi lần load) ----------
export function ensureNguTu(state) {
  if (!state.nguTu) state.nguTu = {};
  const n = state.nguTu;
  if (!n.rec) n.rec = {};            // { danhsiId: { w, l } }
  if (n.wins == null) n.wins = 0;    // tổng ván thắng
  if (n.game === undefined) n.game = null;   // ván dở (giữ qua F5)
  // Kỳ Hồn KHÔNG để ở đây nữa: dùng CHUNG state.kyHon (engine/kyhon.js) với Cờ Tướng.
}

// ---------- lazy-load Three.js (chỉ khi vào ván, khỏi nặng lúc load game) ----------
function ensureThree() {
  if (window.THREE) return Promise.resolve();
  if (window._ntkThreeP) return window._ntkThreeP;
  window._ntkThreeP = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'src/lib/three.min.js';
    s.onload = () => res();
    s.onerror = () => rej(new Error('Không tải được thư viện 3D.'));
    document.head.appendChild(s);
  });
  return window._ntkThreeP;
}

// ---------- CSS (tiêm 1 lần) ----------
function injectStyle() {
  if (document.getElementById('ntk-style')) return;
  const st = document.createElement('style');
  st.id = 'ntk-style';
  st.textContent = `
.ntk-root{position:relative;width:100%;max-width:100%;margin:0 auto;aspect-ratio:16/11;max-height:80dvh;border-radius:16px;overflow:hidden;background:#070d13;box-shadow:0 24px 60px -30px #000;border:1px solid #16303b;touch-action:none;user-select:none;
  --cy:#9fe4f0;--cy2:#33d6c0;--gold:#e6c079;--gold2:#f4d99a;--jade:#2dd4bf;--txt:#eaf3f8;--txt2:#9fb8bd;--txt3:#5f7d8b;--warn:#ff6b6b;--serif:'Lora','Noto Serif SC',Georgia,serif}
.ntk-root *{box-sizing:border-box}
.ntk-scene{position:absolute;inset:0}
.ntk-scene canvas{display:block!important;width:100%!important;height:100%!important}
.ntk-vig{position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 120px -20px rgba(3,10,16,.9)}
.ntk-fb{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--txt2);text-align:center;padding:20px}
.ntk-title{position:absolute;left:17px;top:13px;pointer-events:none;display:flex;align-items:baseline;gap:10px;line-height:1}
.ntk-title .hz{font-family:'Ma Shan Zheng',cursive;font-weight:400;font-size:31px;line-height:1;color:var(--gold2);text-shadow:0 2px 20px rgba(230,192,121,.4)}
.ntk-title .vz{font-family:var(--serif);font-weight:700;font-size:15px;line-height:1;color:var(--gold2);letter-spacing:.02em;position:relative;top:-1px}
.ntk-left{position:absolute;left:12px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:9px;z-index:4}
.ntk-b{display:flex;flex-direction:column;align-items:center;gap:3px;color:var(--txt2);cursor:pointer;width:46px}
.ntk-b .ic{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(10,26,34,.6);border:1px solid rgba(140,200,215,.22);color:var(--cy);transition:.12s}
.ntk-b .ic svg{width:19px;height:19px}
.ntk-b span{font-size:9.5px;white-space:nowrap;text-align:center}
.ntk-b:hover .ic{border-color:var(--cy2);color:#fff}
.ntk-b:active .ic{transform:scale(.92)}
.ntk-b.ready .ic{background:linear-gradient(180deg,#f6dc9c,#e0b45f);border-color:#f0d78f;color:#2a1d04;box-shadow:0 0 16px -4px var(--gold)}
.ntk-b.dis{opacity:.4;pointer-events:none}
.ntk-right{position:absolute;right:12px;top:12px;display:flex;flex-direction:column;gap:8px;align-items:flex-end;pointer-events:none;z-index:4}
.ntk-pc{display:flex;align-items:center;gap:9px;width:172px;padding:7px 10px 7px 7px;border-radius:12px;background:linear-gradient(180deg,rgba(14,32,42,.85),rgba(8,20,27,.92));border:1px solid rgba(140,200,215,.2);transition:.18s}
.ntk-pc.act{border-color:var(--gold);box-shadow:0 0 18px -6px rgba(230,192,121,.55)}
.ntk-pc.wait{filter:grayscale(.3) brightness(.85);border-color:#33424a}
.ntk-av{width:38px;height:38px;border-radius:9px;flex:none;object-fit:cover;object-position:50% 20%;border:1px solid rgba(150,210,230,.35);background:#0c2028}
.ntk-pc .nm{font-family:var(--serif);font-size:12.5px;color:#eaf3f7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ntk-pc .rr{font-size:10px;color:var(--txt3);margin-top:2px;display:flex;align-items:center;gap:5px}
.ntk-dot{width:10px;height:10px;border-radius:50%;flex:none}
.ntk-dot.b{background:radial-gradient(circle at 35% 30%,#8090a0,#0a0f15);border:1px solid #1b2530}
.ntk-dot.w{background:radial-gradient(circle at 35% 30%,#fff,#a8cede)}
.ntk-pc.act .rr{color:var(--gold2)}
.ntk-timer{margin-top:2px;display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--txt2)}
.ntk-timer .pill{font-family:var(--serif);font-variant-numeric:tabular-nums;font-size:14px;color:var(--gold2);background:rgba(6,16,22,.6);border:1px solid rgba(45,212,191,.4);padding:2px 10px;border-radius:99px}
.ntk-timer .pill.low{color:var(--warn);border-color:rgba(255,107,107,.5)}
.ntk-hint{position:absolute;left:50%;bottom:9px;transform:translateX(-50%);font-size:10.5px;color:var(--txt3);background:rgba(6,16,22,.5);padding:3px 10px;border-radius:99px;border:1px solid rgba(140,200,215,.14);pointer-events:none;z-index:4}
.ntk-toast{position:absolute;left:50%;top:14px;transform:translateX(-50%) translateY(-8px);opacity:0;font-size:12px;color:#eaf3f7;background:rgba(8,22,30,.9);border:1px solid rgba(140,200,215,.25);padding:6px 14px;border-radius:99px;pointer-events:none;transition:.2s;z-index:6}
.ntk-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.ntk-view{position:absolute;left:50%;bottom:16px;transform:translateX(-50%) translateY(12px);opacity:0;pointer-events:none;transition:.16s;z-index:9;display:flex;align-items:center;gap:8px;background:rgba(19,36,46,.94);border:1px solid rgba(140,200,215,.3);border-radius:14px;padding:9px 12px;box-shadow:0 18px 44px -22px #000}
.ntk-view.show{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0)}
.ntk-view .lb{font-family:var(--serif);font-size:12px;color:var(--txt2);white-space:nowrap}
.ntk-view .op{font-family:var(--serif);font-size:12.5px;color:var(--cy2);background:rgba(24,50,62,.85);border:1px solid rgba(140,200,215,.28);border-radius:9px;padding:6px 14px;cursor:pointer;transition:.12s;white-space:nowrap}
.ntk-view .op:hover{border-color:var(--cy2);background:rgba(140,200,215,.16);color:#fff}
.ntk-banner{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(4,10,16,.74);z-index:10;text-align:center;padding:20px}
.ntk-banner.show{display:flex}
.ntk-end{position:relative;min-width:270px;max-width:90%;padding:24px 30px 20px;border-radius:18px;overflow:hidden;background:linear-gradient(180deg,rgba(15,29,38,.97),rgba(8,17,24,.98));border:1px solid rgba(140,200,215,.16);box-shadow:0 30px 70px -30px #000,inset 0 1px 0 rgba(255,255,255,.04)}
.ntk-banner.show .ntk-end{animation:ntkPop .3s cubic-bezier(.2,.7,.3,1)}
@keyframes ntkPop{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}
.ntk-end::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,var(--acc,#e6c079),transparent)}
.ntk-end.win{--acc:#f4d99a}.ntk-end.lose{--acc:#93a7b0}.ntk-end.draw{--acc:#5dcaa5}
.ntk-banner .bt{font-family:var(--serif);font-weight:700;font-size:29px;letter-spacing:.03em;color:var(--acc,#f4d99a);text-shadow:0 3px 22px rgba(0,0,0,.5)}
.ntk-end-rule{width:60px;height:1px;margin:11px auto 10px;background:linear-gradient(90deg,transparent,var(--acc,#e6c079),transparent);opacity:.75}
.ntk-banner .bs{font-family:var(--serif);font-style:italic;font-size:13px;color:var(--txt2);line-height:1.5;max-width:330px;margin:0 auto}
.ntk-end-rw{display:none;margin-top:13px;font-family:var(--serif);font-size:12.5px;font-weight:600;color:#f4d99a;background:rgba(230,192,121,.13);border:1px solid rgba(230,192,121,.5);border-radius:99px;padding:4px 15px}
.ntk-end-rw.show{display:inline-block}
.ntk-banner .btns{display:flex;gap:10px;margin-top:18px;justify-content:center}
.ntk-banner .gbtn{padding:9px 22px;border-radius:10px;cursor:pointer;font-family:var(--serif);font-weight:600;font-size:14px;letter-spacing:.04em;color:var(--gold2);background:rgba(9,18,25,.5);border:1px solid rgba(230,192,121,.5);transition:background .15s,border-color .15s}
.ntk-banner .gbtn:hover{background:rgba(230,192,121,.14);border-color:var(--gold2)}
.ntk-banner .gbtn.ghost{color:#cfe2ea;border-color:#33424a;background:#101c26}
.ntk-banner .gbtn.ghost:hover{border-color:#5f7d8b;background:#16242e}
.ntk-chat{position:absolute;left:50%;bottom:8px;transform:translateX(-50%) translateY(10px);width:min(560px,92%);opacity:0;pointer-events:none;transition:.16s;z-index:8;display:flex;flex-direction:column;gap:7px;background:rgba(19,36,46,.9);border:1px solid rgba(140,200,215,.24);border-radius:14px;padding:9px 10px;box-shadow:0 18px 44px -22px #000}
.ntk-chat.show{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0)}
.ntk-chat-ps{display:flex;flex-wrap:wrap;gap:5px}
.ntk-chip{font-size:11px;color:var(--txt2);background:rgba(14,32,42,.7);border:1px solid rgba(140,200,215,.2);border-radius:99px;padding:4px 10px;cursor:pointer;white-space:nowrap;transition:.12s;font-family:var(--serif)}
.ntk-chip:hover{border-color:var(--cy2);color:#eaf3f7}
.ntk-chip:active{transform:scale(.95)}
.ntk-chat-row{display:flex;gap:6px}
.ntk-chat-in{flex:1;min-width:0;background:rgba(4,12,17,.82);border:1px solid rgba(140,200,215,.25);border-radius:9px;padding:6px 10px;color:var(--txt);font-size:12.5px;font-family:var(--serif);outline:none;user-select:text;-webkit-user-select:text;touch-action:auto}
.ntk-chat-in:focus{border-color:var(--cy2)}
.ntk-chat-in::placeholder{color:var(--txt3)}
.ntk-chat-send{flex:none;padding:6px 15px;border-radius:9px;cursor:pointer;font-size:12px;color:#2a1d04;border:1px solid #f0d78f;background:linear-gradient(180deg,#f6dc9c,#e0b45f);font-family:var(--serif);font-weight:700}
.ntk-chat-send:active{transform:scale(.95)}
/* KHUNG THẤP (điện thoại nằm ngang, kể cả lúc phủ toàn màn hình) — lớp do capKhung() gắn.
   Media query KHÔNG thay được: nó đo màn hình, còn đây phải đo CHÍNH khung bàn. */
.kh-nho .ntk-title{left:10px;top:7px}.kh-nho .ntk-title .hz{font-size:19px}.kh-nho .ntk-title .vz{font-size:11px}
.kh-nho .ntk-left{left:8px;gap:6px}.kh-nho .ntk-b{width:auto}
.kh-nho .ntk-b .ic{width:27px;height:27px}.kh-nho .ntk-b .ic svg{width:15px;height:15px}.kh-nho .ntk-b span{font-size:8.5px}
.kh-nho .ntk-right{right:8px;top:7px;gap:5px}.kh-nho .ntk-pc{width:124px;padding:4px 7px 4px 4px}.kh-nho .ntk-av{width:26px;height:26px}
.kh-nho .ntk-pc .nm{font-size:10.5px}.kh-nho .ntk-pc .rr{font-size:9px}
.kh-nho .ntk-view{bottom:10px;gap:6px;padding:6px 9px}.kh-nho .ntk-view .op{padding:5px 10px;font-size:11.5px}
.kh-nho .ntk-chat{bottom:10px}
@media (max-width:600px){.ntk-root{aspect-ratio:5/6;min-height:84dvh;max-height:90dvh}.ntk-title{left:10px;top:8px}.ntk-title .hz{font-size:22px}.ntk-title .vz{font-size:11px}.ntk-left{left:0;right:0;bottom:9px;top:auto;transform:none;flex-direction:row;justify-content:center;gap:15px;z-index:5}.ntk-b{width:auto}.ntk-b .ic{width:40px;height:40px}.ntk-b .ic svg{width:21px;height:21px}.ntk-b span{font-size:9.5px}.ntk-right{right:8px;top:8px;gap:6px}.ntk-pc{width:134px;padding:5px 8px 5px 5px}.ntk-av{width:30px;height:30px}.ntk-pc .nm{font-size:11px}.ntk-pc .rr{font-size:9px}.ntk-toast{left:10px;top:44px;text-align:left;max-width:calc(100% - 152px);font-size:11px;transform:translateY(-6px)}.ntk-toast.show{transform:translateY(0)}.ntk-chat{bottom:74px;width:94%}.ntk-view{bottom:74px;gap:6px;padding:8px 10px}.ntk-view .lb{display:none}.ntk-view .op{padding:6px 11px;font-size:12px}}
`;
  document.head.appendChild(st);
}

const SVG = {
  eye: '<path d="M2.4 12S6 5.6 12 5.6 21.6 12 21.6 12 18 18.4 12 18.4 2.4 12 2.4 12Z"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="M20 6.5 9.5 17 4 11.5"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H9"/>',
  flag: '<path d="M4.5 15s.9-.8 3.8-.8 4.8 1.6 7.6 1.6 3.8-.8 3.8-.8V3.7s-1 .8-3.8.8S14.8 3 12.3 3 8.3 3.7 8.3 3.7"/><path d="M4.5 21.5v-18"/>',
  draw: '<path d="M10 12V6.5a1.5 1.5 0 0 1 3 0V11"/><path d="M13 11V5a1.5 1.5 0 0 1 3 0v6"/><path d="M16 11.5V6.5a1.5 1.5 0 0 1 3 0V13a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.2-1.8l-3-3a1.5 1.5 0 0 1 2.1-2.1L10 14"/><path d="M10 12V8a1.5 1.5 0 0 0-3 0v4.5"/>',
  chat: '<path d="M21 11.6a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-4-1L3.5 20.5 5 15.6A8.4 8.4 0 0 1 12.5 3.2 8.4 8.4 0 0 1 21 11.6Z"/><path d="M8.6 11.6h.01M12.5 11.6h.01M16.4 11.6h.01"/>',
};
function ic(name) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + SVG[name] + '</svg>'; }

// Lời chọn sẵn cho NGƯỜI CHƠI (bấm nhanh khi Trò Chuyện) — xưng "tại hạ", gọi đối thủ "tiền bối/các hạ".
// Người chơi còn gõ được lời tự do; đây chỉ là gợi ý bấm cho nhanh.
const PLAYER_PRESETS = [
  'Xin chỉ giáo.',
  'Nước này, tiền bối thấy sao?',
  'Ván này tại hạ không nhường đâu.',
  'Danh bất hư truyền, phục thật.',
  'Hay! Nước này tại hạ xin chịu thua.',
  'Để xem cuối cùng ai vây được ai.',
  'Tiền bối đánh thong thả quá nhỉ.',
  'Chưa chắc ai hơn ai đâu.',
  'Tại hạ đi đây, cẩn thận đấy.',
  'Nước cờ hay, học được rồi.',
  'Suýt trúng kế tiền bối rồi.',
  'Còn lâu tại hạ mới chịu thua.',
  'Ván sau nhất định gỡ lại.',
  'Đánh với cao thủ đúng là khác.',
  'Tiền bối định vây tại hạ à?',
  'Thêm một ván nữa nhé?',
  'Nước này tại hạ tính kỹ rồi.',
  'Thua tiền bối cũng cam lòng.',
];

// ============================================================
// mountNguTu(host, opts) -> { destroy(), resize() }
//   opts.opponent = { name, art, dotClass:'w' }  (đối thủ = AI cầm Trắng)
//   opts.player   = { name, art }                 (người chơi cầm Đen, đi trước)
//   opts.difficulty = 0..1                          (theo rankPower Danh Sĩ)
//   opts.onEnd(result)  result: 1 thắng · 2 thua · 0 hòa (theo góc NGƯỜI CHƠI)
//   opts.onExit()       bấm "Về" ở màn kết
// ============================================================
function mountNguTu(host, opts) {
  injectStyle();
  const THREE = window.THREE;
  const opp = opts.opponent || { name: 'Đối Thủ', art: '' };
  const pl = opts.player || { name: 'Bạn', art: '' };
  const diff = Math.max(0.1, Math.min(1, opts.difficulty == null ? 0.6 : opts.difficulty));

  host.innerHTML =
    '<div class="ntk-root">' +
      '<div class="ntk-scene"></div><div class="ntk-vig"></div>' +
      '<div class="ntk-fb"><div>Thiết bị này không thể khởi tạo chế độ 3D.</div><div class="fm" style="font-size:12px;color:#5f7d8b"></div></div>' +
      '<div class="ntk-title"><span class="hz">五子棋</span><span class="vz">Ngũ Tử Kỳ</span></div>' +
      '<div class="ntk-left">' +
        nutToanManHTML('ntk') +
        '<span class="ntk-b" data-a="spectate"><span class="ic">' + ic('eye') + '</span><span>Quan Chiến</span></span>' +
        '<span class="ntk-b" data-a="resign"><span class="ic">' + ic('flag') + '</span><span>Nhận Thua</span></span>' +
        '<span class="ntk-b" data-a="draw"><span class="ic">' + ic('draw') + '</span><span>Cầu Hòa</span></span>' +
        '<span class="ntk-b" data-a="chat"><span class="ic">' + ic('chat') + '</span><span>Trò Chuyện</span></span>' +
      '</div>' +
      '<div class="ntk-right">' +
        '<div class="ntk-pc wait" data-c="ai"><img class="ntk-av" alt="" src="' + opp.art + '" onerror="this.style.visibility=\'hidden\'"><div><div class="nm">' + opp.name + '</div><div class="rr"><span class="ntk-dot w"></span><span class="rs">Chờ</span></div></div></div>' +
        '<div class="ntk-pc act" data-c="you"><img class="ntk-av" alt="" src="' + pl.art + '" onerror="this.style.visibility=\'hidden\'"><div><div class="nm">' + pl.name + '</div><div class="rr"><span class="ntk-dot b"></span><span class="rs">Đang đi…</span></div></div></div>' +
        '' +
      '</div>' +
      '<div class="ntk-toast"></div>' +
      '<div class="ntk-view"><span class="lb">Xoay bàn tới góc bạn thích</span>' +
        '<span class="op" data-a="saveview">Khoá Góc Nhìn</span><span class="op" data-a="resetview">Về Mặc Định</span></div>' +
      '<div class="ntk-chat">' +
        '<div class="ntk-chat-ps"></div>' +
        '<div class="ntk-chat-row"><input class="ntk-chat-in" type="text" maxlength="60" autocomplete="off" placeholder="Nhập lời muốn nói…"><button class="ntk-chat-send">Gửi</button></div>' +
      '</div>' +
      '' +
      '<div class="ntk-banner"><div class="ntk-end"><div class="bt"></div><div class="ntk-end-rule"></div><div class="bs"></div><div class="ntk-end-rw"></div><div class="btns"><span class="gbtn" data-a="again">Chơi Lại</span><span class="gbtn ghost" data-a="exit">Về</span></div></div></div>' +
    '</div>';

  const root = host.firstElementChild;
  const $ = (s) => root.querySelector(s);
  const scEl = $('.ntk-scene');
  // Toàn màn hình: phủ CHÍNH thẻ gốc nên vào là mất sạch thanh đầu trang / sidebar / banner.
  const tm = ganToanMan(root, () => onResize());
  const fb = (msg) => { const d = $('.ntk-fb'); d.style.display = 'flex'; if (msg) d.querySelector('.fm').textContent = msg; };

  // ---- state ----
  const N = 15, HUMAN = 1, AI = 2;
  let spacing = 8 / 14;
  let board = [], meshAt = {}, moves = [], ghost = null, current = HUMAN, over = false, saidN = 0;
  let renderer, scene, camera, boardGroup, raycaster, pointer, rayPlane, particles = null, rafId = 0;
  let tuChinh = () => {};                               // bộ tự chỉnh tỉ lệ điểm ảnh
  const nhipBui = nhipDam(33);                          // bụi bay ~30 nhịp/giây là đủ
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Camera có ĐÍCH riêng + GIẢM CHẤN (đồng bộ cảm giác với Cờ Tướng / Cờ Vua):
  // kéo 1:1 rồi dừng phắt là thứ làm cảm giác "cứng". CỐ Ý KHÔNG có quán tính — thả tay là đứng.
  const SPH0 = { r: 12.4, theta: 0, phi: 0.66 };   // góc nhìn mặc định (bàn cố định)
  let target, sph = { r: 12.4, theta: 0, phi: 0.66 }, tgt = { r: 12.4, theta: 0, phi: 0.66 };
  let dragging = false, movedFlag = false, lastX = 0, lastY = 0, autorot = false, ret = null;
  // THẾ HỆ ván: mỗi lần dựng ván mới / kết ván / tháo bàn là tăng 1. Mọi setTimeout mang theo số thế hệ
  // lúc hẹn, khác số hiện tại là bỏ qua -> hẹn giờ của ván cũ không đi quân vào ván mới.
  let van = 0;
  const hen = (f, ms) => { const v = van; setTimeout(() => { if (v === van && !over) f(v); }, ms); };
  let lockView = opts.view || null;     // góc người chơi đã khoá RIÊNG cho bàn này, null = tự canh
  let fitR = 12.4;                      // khoảng cách VỪA KHUNG ở cỡ màn hiện tại — mốc quy đổi mức phóng
  let firstFit = true;                  // lần khớp khung ĐẦU TIÊN phải đặt thẳng, không giảm chấn
  let stoneGeo, matB, matW, matBg, matWg;
  const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];
  const inb = (c, r) => c >= 0 && c < N && r >= 0 && r < N;
  const key = (c, r) => c + '_' + r;
  const wx = (i) => -4 + i * spacing;

  // ===== KHẨU CHIẾN — đối thủ nói trong lúc đánh cờ (chọn câu theo diễn biến) =====
  const LINES = {
    start: [
      'Các hạ mời ngồi, ván cờ này tại hạ chờ đã lâu.', 'Bàn cờ đã bày sẵn, các hạ cứ đi trước cho.',
      'Lâu lắm rồi mới gặp người đáng để ngồi đối diện.', 'Trời đẹp thế này, không đánh vài ván thì phí.',
      'Các hạ cứ thong thả, tại hạ chẳng vội đâu.', 'Nghe danh đã lâu, hôm nay xin được lĩnh giáo.',
      'Mời các hạ ra quân, để tại hạ xem thử bản lĩnh.', 'Tại hạ đánh cờ mấy chục năm, chưa từng thua ai.',
      'Các hạ có vẻ rất tự tin. Để xem thực lực đến đâu.', 'Nước đầu nhường các hạ, xem có chiêu gì hay.',
      'Đừng ngại, bàn cờ này không cắn người đâu.', 'Đã lâu chưa gặp ai khiến tại hạ phải động não.',
      'Mời trà đã, rồi hãy thong thả phân cao thấp.', 'Các hạ thích đen hay trắng, tùy ý mà chọn.',
      'Chơi cho vui thôi, hà tất phải căng thẳng.', 'Cứ ra quân đi, chiêu nào tại hạ cũng tiếp được.',
      'Ngồi vào đây, xem ai giữ nổi năm quân liền.', 'Gió mát, trà thơm, thêm ván cờ nữa là trọn.',
      'Các hạ tới đúng lúc, tại hạ đang buồn tay.', 'Xem chừng hôm nay tại hạ gặp cao thủ rồi.',
      'Đừng thấy tại hạ hiền mà tưởng dễ ăn.', 'Ngồi lâu chồn chân, đánh ván cờ cho giãn gân.',
      'Thế cờ còn trống, các hạ đã tính đường chưa?', 'Ai thua ván này, ván sau nhớ gỡ lại nhé.',
      'Một ván thôi cũng được, chỉ e các hạ đâm ghiền.', 'Không cần khách sáo, cứ đánh hết sức là được.',
    ],
    banter: [
      'Nước này đã tính từ lâu, các hạ chậm rồi.', 'Thế cờ thuận tay, tại hạ chưa vội đâu.',
      'Các hạ cứ vây, ở đây có đường ra cả.', 'Quân đen trong tay, chưa từng sợ ai bao giờ.',
      'Bước này bày sẵn, chỉ chờ các hạ ghé qua.', 'Bàn cờ sáng dần, thế đang dồn về một mối.',
      'Các hạ gỡ được nước này, tại hạ phục liền.', 'Đường quân của tại hạ, đi trước các hạ một bước.',
      'Nước đó, các hạ đã chắc chưa đấy?', 'Đánh nhanh tay ghê, thua cũng nhanh chứ?',
      'Nghĩ mãi chưa xuống, hay ra dạo một vòng?', 'Tay đặt quân, mà mắt lại liếc đi đâu?',
      'Các hạ đổ mồ hôi rồi kìa, nóng nảy à?', 'Các hạ có tin nước vừa rồi là sai không?',
      'Chậm thế, coi chừng cơm người ta ăn trước.', 'Các hạ gỡ hoài một chỗ, hết đường rồi phải không?',
      'Tay run kìa, hay tại hạ rót chén trà đã?', 'Nghĩ kỹ vào, kẻo lát mặt lại tiếc.',
      'Nước ấy khéo thật, tại hạ phải chịu.', 'Các hạ đánh cờ có khí chất, đẹp mắt.',
      'Thế chặn vừa rồi sắc bén, khó cho tại hạ.', 'Cao thật, nước đó tại hạ không ngờ tới.',
      'Các hạ đánh dịu mà quân sắc như dao.', 'Nước này học được rồi, tại hạ cảm ơn các hạ.',
      'Các hạ không dễ chơi chút nào, phải thận trọng.', 'Nước vừa rồi đánh vội, tiếc thật.',
      'Quân ấy đặt ở vị trí khác có lẽ hay hơn.', 'A, sai một ly đi một dặm rồi.',
      'Giá chặn sớm một nước thì đã khác.', 'Tham một nước, giờ thành ra khó xử.',
      'Nước đó lẽ ra đẹp hơn, đánh hỏng rồi.', 'Cờ còn dài, các hạ cứ thong thả.',
      'Đánh cờ cốt ở cái tình, việc gì phải vội.', 'Một ván cờ, một chén trà, thong dong là được.',
      'Ngồi đây mát mẻ, đánh chậm chút cũng không sao.', 'Gió thổi bên ngoài, trong lòng vẫn tĩnh lặng.',
      'Được thì vui, thua thì học, có gì mà ngại.', 'Đánh một nước, lại nghĩ tới bữa cơm chiều.',
      'Quân đen quân trắng, cuối cùng ai còn nhớ?', 'Đánh cờ với các hạ, vui hơn nghe đàn.',
      'Lâu rồi mới có ván cờ ngọt như rượu.', 'Bàn cờ vui đấy, lâu lắm mới gặp đối thủ.',
      'Ván cờ hay khiến người ta quên cả đói khát.', 'Các hạ với tại hạ, xem ai chịu ai trước.',
      'Thử một nước cho vui, các hạ đừng cười.', 'Góc trên đang nóng lên rồi đấy.',
      'Hai bên cùng vây, xem ai vây chặt hơn.', 'Thế này giằng co, chưa ai chịu nhường.',
      'Từng tấc đất trên bàn cờ đều phải giành.', 'Cả bàn cờ dồn chặt lại, khó thở ghê.',
      'Đường quân hai bên quấn vào nhau rồi.', 'Quân các hạ bắt đầu nối thành hàng.',
      'Góc dưới còn trống, còn chỗ mà xoay.', 'Hai luồng quân gặp nhau, sắp có chuyện rồi.',
      'Một nước của các hạ, nghĩ mãi chưa ra.', 'Ván cờ chưa ngã ngũ, các hạ đừng mừng vội.',
    ],
    press: [
      'Nước này của tại hạ, các hạ đỡ nổi không?', 'Bốn quân liền rồi, các hạ tính sao đây?',
      'Quân đen vây kín rồi, các hạ còn đường nào?', 'Đỡ được nước này thì tại hạ mới phục các hạ.',
      'Một quân nữa thôi, ván này coi như ngã ngũ.', 'Các hạ chống đỡ trông vất vả quá nhỉ.',
      'Thế cờ nghiêng cả về đây rồi, các hạ thấy chứ?', 'Các hạ chặn đầu này thì hở đầu kia thôi.',
      'Đường lui của các hạ hẹp dần rồi đấy.', 'Tại hạ đặt quân này, các hạ khó thở chưa?',
      'Thành thế đôi rồi các hạ ơi, chặn bên nào?', 'Tại hạ đâu vội, cứ ép dần cho các hạ ngộp.',
      'Ván này gió thổi về phía tại hạ mất rồi.', 'Các hạ còn nước nào hay thì tính mau đi.',
      'Chỉ chờ một nước nữa là năm quân liền châu.', 'Các hạ lo nước trước, quên mất nước sau rồi.',
      'Tại hạ đi thong thả thôi, các hạ vẫn thua.', 'Hàng này sắp thông tới nơi, các hạ liệu hồn.',
      'Các hạ lùi đâu tại hạ theo đó, khó thoát lắm.', 'Nước này hiểm đấy, các hạ đỡ cho khéo vào.',
      'Các hạ vây mãi không xong, giờ tới lượt bị vây.', 'Một nước hở thôi là các hạ trắng tay đấy.',
      'Các hạ thở gấp rồi kìa, chưa gì đã cuống.', 'Thế này thì các hạ chỉ còn đỡ, hết đường công.',
      'Nhìn hàng quân đen này mà xem, đẹp đấy chứ?', 'Các hạ chạy đâu cho thoát cái lưới này đây.',
      'Chỉ e các hạ chưa kịp gỡ đã thua mất.', 'Nước cờ vừa rồi khóa chặt các hạ luôn rồi.',
      'Bốn liền một hàng, đoán xem tại hạ đi đâu?', 'Thế cờ siết lại rồi, các hạ gỡ sao đây?',
    ],
    defend: [
      'Nước đó hiểm thật, may mà chặn kịp.', 'Chậm chút nữa là trúng kế các hạ rồi.',
      'Hàng này phải bịt lại, không thể buông.', 'Các hạ giấu quân khéo lắm, suýt thì không thấy.',
      'Một nước chặn, thở phào nhẹ nhõm.', 'Thế này đẹp đấy, tiếc là đỡ được rồi.',
      'Các hạ ép rất gắt, đành lui một bước.', 'Nước cờ sắc bén, chặn xong vẫn thót tim.',
      'Các hạ vây khéo, gỡ mãi mới ra.', 'Bịt được hàng này, coi như thoát một phen.',
      'Cao thật, nhưng tại hạ nhìn ra kịp rồi.', 'Các hạ đánh hiểm, không dám lơ là chút nào.',
      'Một ly nữa thôi là thua trắng rồi.', 'Chặn được rồi, ngồi thở cho lại sức đã.',
      'Thế vây chặt quá, phải gồng mà chống.', 'Suýt chút là năm quân của các hạ thông.',
      'Khéo thật, nhưng bàn cờ này tại hạ thuộc lòng.', 'May còn kịp, chậm nhịp là hỏng cả ván.',
      'Bịt hàng xong, trong lòng mới tạm yên.', 'Các hạ ra đòn như vũ bão, đành lui giữ.',
      'Thoát rồi, phen này hú vía thật.', 'Chặn được chỗ hiểm, coi như qua ải.',
      'Nước cờ đẹp, tiếc là không lọt qua được.', 'Con nước này buộc phải chặn, không thể tiếc.',
      'Giỏi thật, suýt thì không kịp trở tay.', 'Bịt lại rồi, bàn cờ này chưa ngã ngũ đâu.',
      'Các hạ giấu đòn khéo, nhưng chưa qua mắt tại hạ.', 'Chặn xong, hai vai mới thấy nhẹ đi.',
      'Thế trận nguy, nhưng chưa chịu buông đâu.', 'Các hạ nước nào cũng sắc, chẳng dám khinh.',
    ],
    win: [
      'Ván này các hạ thua rồi, nhưng chơi cũng đáng gờm.', 'Thế cờ ngã rồi, đa tạ các hạ một ván hay.',
      'Thắng thua là chuyện thường, ván sau lại tiếp.', 'Đa tạ ván cờ, các hạ khiến tại hạ phải dốc sức.',
      'Các hạ thua mà mặt vẫn bình thản gớm nhỉ.', 'Ván sau nhớ chặn sớm hơn, kẻo lại thua đấy.',
      'Nhường các hạ đi trước, vậy mà vẫn thua tại hạ.', 'Các hạ đánh hăng thật, tiếc là hăng nhầm chỗ.',
      'Năm quân liền một hàng, thế là xong ván này.', 'Bẫy giăng từ giữa ván, các hạ không nhận ra sao.',
      'Các hạ tính nước nào cũng bị đoán ra cả.', 'Nước cuối đặt xong, bàn cờ này về tay tại hạ.',
      'Nói thật, giữa ván các hạ ép tại hạ toát mồ hôi.', 'Chậm nửa nhịp thôi, các hạ đã vây được tại hạ rồi.',
      'Các hạ cầm quân chắc tay, chỉ tiếc thiếu chút may.', 'Các hạ để hở một hàng rồi — e là khó cứu.',
      'Tiếc cho các hạ, sai đúng một nước ở góc kia.', 'Các hạ mải công một bên, quên mất bên kia bị vây.',
    ],
    lose: [
      'Nước cờ vừa rồi tuyệt thật, tại hạ chịu thua.', 'Các hạ cao tay hơn, tâm phục khẩu phục.',
      'Năm quân liền một mạch, đẹp đến phải khen.', 'Tính thiếu một nước, thành ra bại cả bàn.',
      'Gặp được cao thủ như các hạ cũng là cái duyên.', 'Bàn sau tại hạ gỡ lại, các hạ chờ đấy.',
      'Thế cờ ấy nhìn mãi không ra, đành chịu.', 'Các hạ vây kín bốn phía, hết đường xoay xở.',
      'Gừng càng già càng cay, chịu thua thôi.', 'Các hạ đi quân gọn ghẽ, tại hạ theo không kịp.',
      'Thua ván này, học được không ít.', 'Tay cờ của các hạ, quả nhiên danh bất hư truyền.',
      'Cờ hay đến vậy, thua cũng cam lòng.', 'Ván nữa đi, tại hạ chưa phục hẳn đâu.',
      'Các hạ thắng đẹp, xin vỗ tay khen thật lòng.', 'Tại hạ chủ quan, để các hạ chen được vào giữa thế trận.',
      'Lâu lắm mới có người thắng được tại hạ như thế.', 'Bàn cờ nghiêng hẳn về các hạ, xin chịu thua.',
    ],
    draw: [
      'Ván này hòa rồi, kẻ tám lạng người nửa cân.', 'Tiếc thật, cả bàn cờ mà không phân nổi cao thấp.',
      'Các hạ kín thế thật, tại hạ không tìm ra kẽ hở.', 'Hòa cờ cũng là một cái duyên đấy chứ.',
      'Còn cờ còn đó, hẹn các hạ lần sau phân bại.', 'Ván cờ đẹp thế này, hòa cũng chẳng tiếc.',
      'Nước cuối khóa chặt, hai bên cùng hết đường.', 'Hòa. Xem ra phải thêm một ván nữa mới phân rõ cao thấp.',
      'Đấu tới đấu lui, ai ngờ lại hòa một ván.', 'Các hạ cao thật, gỡ được một ván hòa là may.',
      'Đánh với các hạ, hòa cũng thấy đáng công.', 'Lần sau tái chiến, xin các hạ đừng nhường tay.',
    ],
    reply: [
      'Các hạ ham nói vậy, không sợ lỡ tay đặt nhầm chỗ?', 'Nghe cũng vui tai, nhưng bàn cờ vẫn còn đợi đấy.',
      'Chuyện ấy hay thật, mà nước cờ của các hạ còn hay hơn.', 'Vừa đánh vừa trò chuyện, mới ra cái thú tao nhã.',
      'Hàn huyên gì thì hàn, đừng quên bên trên bàn cờ.', 'Trò chuyện cho vui thôi, thắng thua vẫn ở tay cờ.',
      'Tại hạ thích người biết chuyện trò lúc đánh cờ.', 'Chuyện gẫu để sau. Ván cờ đang đến lúc căng rồi.',
      'Nghe thì cứ nghe, mà tay chẳng rời quân cờ.', 'Các hạ khôn khéo lắm, chỉ tiếc không ở thế cờ.',
      'Lời ngọt thật, song tại hạ không vì thế mà nhường.', 'Đánh cờ mà có bạn trò chuyện, cũng đỡ buồn tay.',
      'Chuyện đâu chuyện đó, quân đến cửa các hạ kia.', 'Kể tiếp đi, tại hạ vừa nghe vừa tính đường vây.',
      'Ngồi lâu mới có bạn nói chuyện, cũng là cái duyên.', 'Các hạ giữ sức mà nói, còn phải nghĩ nước cờ dài.',
      'Vui thì vui, mà đến lượt hạ quân của các hạ rồi.', 'Các hạ vui tính thật, ngặt nỗi đến lượt bên này rồi.',
      'Các hạ cứ tha hồ kể, từng nước vẫn đếm đủ cả.', 'Nghe các hạ kể, suýt nữa quên mất cả lượt cờ.',
    ],
  };
  let _lastLine = '';
  function pick(arr) { if (!arr || !arr.length) return ''; let s, n = 0; do { s = arr[(Math.random() * arr.length) | 0]; n++; } while (s === _lastLine && n < 5); _lastLine = s; return s; }
  function bossSay(cat) { const l = pick(LINES[cat]); if (l) toast(opp.name + ': 「' + l + '」'); }
  function maybeBossSay(wasThreat, mv) { if (saidN >= 4 || Math.random() > 0.34) return; saidN++; let cat = 'banter'; if (wasThreat) cat = 'defend'; else if (evalCell(mv.c, mv.r, AI) >= 4000) cat = 'press'; bossSay(cat); }   // giới hạn ~4 câu/ván cho đỡ rối

  try { init(); resetGame(opts.saved); animate(); } catch (e) { fb(String(e && e.message || e)); return { destroy() {}, resize() {} }; }
  setTimeout(onResize, 120); setTimeout(onResize, 500);

  function W() { return scEl.clientWidth || 720; }
  function H() { return scEl.clientHeight || 450; }

  function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    tuChinh = taoTuChinh(renderer, onResize);    // tỉ lệ điểm ảnh do bộ tự chỉnh đặt, xem engine/muot.js
    renderer.setSize(W(), H());
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.06;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;       // chỉ vẽ lại bóng khi bàn đổi (datBong)
    renderer.shadowMap.needsUpdate = true;
    scEl.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    scene.background = gradTex(false);
    scene.fog = new THREE.Fog(0x0a2029, 12, 30);
    camera = new THREE.PerspectiveCamera(38, W() / H(), 0.1, 120);
    target = new THREE.Vector3(0, 0, 0); updCam();
    scene.add(new THREE.HemisphereLight(0xbfe9f2, 0x061620, 0.55));
    const dir = new THREE.DirectionalLight(0xffffff, 1.05); dir.position.set(5, 12, 6); dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048); const sc = dir.shadow.camera; sc.near = 1; sc.far = 44; sc.left = -8; sc.right = 8; sc.top = 8; sc.bottom = -8; dir.shadow.bias = -0.0004; scene.add(dir);
    const p1 = new THREE.PointLight(0x8fe6ff, 0.6, 44); p1.position.set(-5, 5, -4); scene.add(p1);
    const p2 = new THREE.PointLight(0xffe6b0, 0.34, 44); p2.position.set(6, 4, 5); scene.add(p2);
    try { const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(gradTex(true)).texture; } catch (e) {}
    boardGroup = new THREE.Group(); scene.add(boardGroup);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(9, 0.5, 9), new THREE.MeshPhysicalMaterial({ color: 0x0e2a35, roughness: 0.34, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.35, transparent: true, opacity: 0.95 }));
    slab.position.y = -0.25; slab.receiveShadow = true; boardGroup.add(slab);
    const rim = new THREE.Mesh(new THREE.BoxGeometry(9.25, 0.53, 9.25), new THREE.MeshBasicMaterial({ color: 0x5fc7dd, transparent: true, opacity: 0.1 }));
    rim.position.y = -0.25; boardGroup.add(rim);
    const gp = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({ map: gridTex(), transparent: true, depthWrite: false }));
    gp.rotation.x = -Math.PI / 2; gp.position.y = 0.02; boardGroup.add(gp);
    const bgHaze = new THREE.Mesh(new THREE.PlaneGeometry(46, 28), new THREE.MeshBasicMaterial({ map: glowTex('70,170,200'), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
    bgHaze.position.set(0, 5.5, -11); scene.add(bgHaze);
    const uGlow = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({ map: glowTex('90,215,240'), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
    uGlow.rotation.x = -Math.PI / 2; uGlow.position.y = -0.42; boardGroup.add(uGlow);
    if (!reduce) { try { particles = makeParticles(); scene.add(particles); } catch (e) {} }
    rayPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    raycaster = new THREE.Raycaster(); pointer = new THREE.Vector2();
    stoneGeo = new THREE.SphereGeometry(0.26, 28, 18); stoneGeo.scale(1, 0.42, 1);
    matB = new THREE.MeshPhysicalMaterial({ color: 0x05070b, roughness: 0.2, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.1 });   // hắc diện thạch: đen sâu, bỏ metalness (khỏi ám xanh env), giữ clearcoat cho bóng
    matW = new THREE.MeshPhysicalMaterial({ color: 0xdff1f8, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, emissive: 0x14323f, emissiveIntensity: 0.28 });
    matBg = matB.clone(); matBg.transparent = true; matBg.opacity = 0.42;
    matWg = matW.clone(); matWg.transparent = true; matWg.opacity = 0.42;
    const el = renderer.domElement;
    el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove);
    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onCancel);
    window.addEventListener('resize', onResize);
    root.querySelectorAll('.ntk-b,[data-a]').forEach((b) => b.addEventListener('click', () => act(b.getAttribute('data-a'))));
    const sendB = $('.ntk-chat-send'), chatIn = $('.ntk-chat-in');
    if (sendB) sendB.addEventListener('click', sendChat);
    if (chatIn) chatIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendChat(); } });
    window.addEventListener('keydown', onKey);
  }

  function updCam() { camera.position.set(target.x + sph.r * Math.sin(sph.phi) * Math.sin(sph.theta), target.y + sph.r * Math.cos(sph.phi), target.z + sph.r * Math.sin(sph.phi) * Math.cos(sph.theta)); camera.lookAt(target); }
  function makeMesh(color, gh) { return new THREE.Mesh(stoneGeo, gh ? (color === HUMAN ? matBg : matWg) : (color === HUMAN ? matB : matW)); }
  function clearGhost() { if (ghost) { boardGroup.remove(ghost.mesh); ghost = null; } updConfirm(); }
  function setGhost(c, r) { if (over || current !== HUMAN) return; if (!inb(c, r) || board[r][c] !== 0) return; if (!ghost) { ghost = { c, r, mesh: makeMesh(HUMAN, true) }; boardGroup.add(ghost.mesh); } ghost.c = c; ghost.r = r; ghost.mesh.position.set(wx(c), 0.1, wx(r)); updConfirm(); }
  function commit(c, r, color) { board[r][c] = color; const m = makeMesh(color, false); m.position.set(wx(c), 0.1, wx(r)); m.castShadow = true; boardGroup.add(m); meshAt[key(c, r)] = m; moves.push({ c, r, color }); datBong(); return m; }
  function confirmMove() { if (over || !ghost || current !== HUMAN) return; const c = ghost.c, r = ghost.r; clearGhost(); commit(c, r, HUMAN); if (winLineAt(c, r, HUMAN)) return endGame(1, winLineAt(c, r, HUMAN)); if (moves.length >= N * N) return endGame(0, null); current = AI; turnUI(); persist(); hen(aiTurn, 440); }
  // ⚠ HAI CHỐT: `v !== van` chặn hẹn giờ của VÁN CŨ, `current !== AI` chặn AI cướp lượt người chơi.
  function aiTurn(v) { if (over || v !== van || current !== AI) return; const wasThreat = !!findWinning(HUMAN); const mv = aiPick(); if (!mv) return endGame(0, null); commit(mv.c, mv.r, AI); const wl = winLineAt(mv.c, mv.r, AI); if (wl) return endGame(2, wl); if (moves.length >= N * N) return endGame(0, null); current = HUMAN; turnUI(); persist(); maybeBossSay(wasThreat, mv); }

  function winLineAt(c, r, color) { for (let k = 0; k < 4; k++) { const dx = DIRS[k][0], dy = DIRS[k][1]; const cells = [[c, r]]; let i; for (i = 1; inb(c + dx * i, r + dy * i) && board[r + dy * i][c + dx * i] === color; i++) cells.push([c + dx * i, r + dy * i]); for (i = 1; inb(c - dx * i, r - dy * i) && board[r - dy * i][c - dx * i] === color; i++) cells.unshift([c - dx * i, r - dy * i]); if (cells.length >= 5) return cells.slice(0, 5); } return null; }
  function runScore(cnt, ends) { if (cnt >= 5) return 1e6; if (cnt === 4) return ends >= 2 ? 50000 : (ends === 1 ? 4200 : 0); if (cnt === 3) return ends >= 2 ? 4200 : (ends === 1 ? 320 : 0); if (cnt === 2) return ends >= 2 ? 220 : (ends === 1 ? 22 : 0); return ends * 3 + 1; }
  function evalCell(c, r, color) { let total = 0; for (let k = 0; k < 4; k++) { const dx = DIRS[k][0], dy = DIRS[k][1]; let cnt = 1, ends = 0, i; for (i = 1; inb(c + dx * i, r + dy * i) && board[r + dy * i][c + dx * i] === color; i++) cnt++; if (inb(c + dx * i, r + dy * i) && board[r + dy * i][c + dx * i] === 0) ends++; for (i = 1; inb(c - dx * i, r - dy * i) && board[r - dy * i][c - dx * i] === color; i++) cnt++; if (inb(c - dx * i, r - dy * i) && board[r - dy * i][c - dx * i] === 0) ends++; total += runScore(cnt, ends); } return total; }
  function findWinning(color) { for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { if (board[r][c] !== 0) continue; board[r][c] = color; const w = winLineAt(c, r, color); board[r][c] = 0; if (w) return { c, r }; } return null; }
  function candidates() { let any = false; const res = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (board[r][c] !== 0) any = true; if (!any) return [{ c: 7, r: 7 }]; const seen = {}; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { if (board[r][c] === 0) continue; for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) { const nc = c + dc, nr = r + dr; if (inb(nc, nr) && board[nr][nc] === 0) { const k = key(nc, nr); if (!seen[k]) { seen[k] = 1; res.push({ c: nc, r: nr }); } } } } return res; }
  // ===== Nhận diện đe doạ (đọc mẫu trên đường 9 ô quanh ô đặt; xử cả NGẮT QUÃNG) =====
  function lineStr(c, r, dx, dy, color) {   // '.' trống · 'A' quân color (kể cả ô đang xét) · 'H' đối thủ · 'X' ngoài bàn
    let s = '';
    for (let k = -4; k <= 4; k++) {
      if (k === 0) { s += 'A'; continue; }
      const nc = c + dx * k, nr = r + dy * k;
      if (!inb(nc, nr)) { s += 'X'; continue; }
      const v = board[nr][nc]; s += v === 0 ? '.' : (v === color ? 'A' : 'H');
    }
    return s;
  }
  const RE_FOUR = /AAAA\.|\.AAAA|AAA\.A|A\.AAA|AA\.AA/, RE_O3 = /\.AAA\.|\.AA\.A\.|\.A\.AA\./;
  function threatOf(c, r, color) {   // giả lập đặt color tại (c,r) -> đếm: ngũ / tứ-hở / tứ / tam-hở theo 4 hướng
    let five = 0, of = 0, four = 0, o3 = 0;
    for (let d = 0; d < 4; d++) {
      const s = lineStr(c, r, DIRS[d][0], DIRS[d][1], color);
      if (s.indexOf('AAAAA') >= 0) five++;
      else if (s.indexOf('.AAAA.') >= 0) of++;
      else if (RE_FOUR.test(s)) four++;
      else if (RE_O3.test(s)) o3++;
    }
    return { five, of, four, o3 };
  }
  function forceLv(t) {   // mức "buộc nước" của một ô
    if (t.five) return 1e6;                       // thành 5 = thắng
    if (t.of) return 1e5;                         // tứ hở = thắng chắc (chặn 1 đầu vẫn thua)
    if (t.four >= 2) return 9e4;                  // song tứ (đòn đôi)
    if (t.four >= 1 && t.o3 >= 1) return 8e4;     // tứ + tam (đòn đôi)
    if (t.o3 >= 2) return 6e4;                    // song/tam/tứ tam (đòn đôi/ba/bốn)
    if (t.four >= 1) return 1500;                 // tứ đơn (buộc chặn)
    if (t.o3 >= 1) return 400;                    // tam hở đơn
    return 0;
  }
  function aiPick() {
    const cands = candidates(), n = cands.length;
    const la = new Array(n), lh = new Array(n);
    let bestA = cands[0] || { c: 7, r: 7 }, avA = -1, bestH = cands[0], avH = -1;
    for (let i = 0; i < n; i++) {
      const cc = cands[i];
      la[i] = forceLv(threatOf(cc.c, cc.r, AI)); if (la[i] > avA) { avA = la[i]; bestA = cc; }
      lh[i] = forceLv(threatOf(cc.c, cc.r, HUMAN)); if (lh[i] > avH) { avH = lh[i]; bestH = cc; }
    }
    if (avA >= 1e6) return bestA;   // 1) AI thành 5 luôn
    if (avH >= 1e6) return bestH;   // 2) chặn đối thủ sắp thành 5
    if (avA >= 6e4) return bestA;   // 3) AI có đòn thắng (tứ hở / song tứ / tứ+tam / song tam) -> tung ra
    if (avH >= 6e4) return bestH;   // 4) chặn ĐÒN ĐÔI/BA/BỐN của đối thủ TRƯỚC khi thành hình
    // 5) thế cờ: công (forceLv AI) + thủ (forceLv HUMAN, ưu tiên hơn) + điểm pattern nhỏ + nhiễu (≈0 khi diff cao)
    let best = bestA, bs = -1e18;
    for (let i = 0; i < n; i++) {
      const cc = cands[i];
      const s = la[i] + 1.15 * lh[i] + 0.02 * evalCell(cc.c, cc.r, AI) + 0.02 * evalCell(cc.c, cc.r, HUMAN) + Math.random() * (0.5 + (1 - diff) * 40);
      if (s > bs) { bs = s; best = cc; }
    }
    return best || { c: 7, r: 7 };
  }

  function endGame(result, line) {
    over = true; van++;
    stopSpectate(false);                        // kẹt Quan Chiến qua màn kết thì ván sau bấm không ăn
    clearGhost(); updConfirm();
    if (line) for (let i = 0; i < line.length; i++) { const mm = meshAt[key(line[i][0], line[i][1])]; if (mm) { mm.material = mm.material.clone(); mm.material.emissive = new THREE.Color(0xe6c079); mm.material.emissiveIntensity = 0.85; mm.scale.set(1.16, 1.5, 1.16); } }
    const b = $('.ntk-banner'), end = b.querySelector('.ntk-end'), bt = b.querySelector('.bt'), bs = b.querySelector('.bs'), rw = b.querySelector('.ntk-end-rw');
    end.classList.remove('win', 'lose', 'draw'); rw.classList.remove('show');
    if (result === 1) { end.classList.add('win'); bt.textContent = 'Bạn Thắng!'; bs.textContent = opp.name + ': 「' + pick(LINES.lose) + '」'; rw.textContent = 'Kỳ Hồn +12'; rw.classList.add('show'); }
    else if (result === 2) { end.classList.add('lose'); bt.textContent = 'Bạn Thua'; bs.textContent = opp.name + ': 「' + pick(LINES.win) + '」'; }
    else { end.classList.add('draw'); bt.textContent = 'Hòa Cờ'; bs.textContent = opp.name + ': 「' + pick(LINES.draw) + '」'; }
    b.classList.add('show');
    vuaKhung(end, root);   // ep bang tong ket vua khung, khoi phai lan chuot
    try { if (opts.onEnd) opts.onEnd(result); } catch (e) {}
  }
  function undo() { if (over) return; clearGhost(); let n = 0; while (n < 2 && moves.length > 0) { const mv = moves.pop(); const mm = meshAt[key(mv.c, mv.r)]; if (mm) { boardGroup.remove(mm); delete meshAt[key(mv.c, mv.r)]; } board[mv.r][mv.c] = 0; n++; } current = HUMAN; over = false; turnUI(); }
  function resetGame(saved) {
    van++;                                      // sang THẾ HỆ ván mới -> hẹn giờ của ván cũ tự hết hiệu lực
    stopSpectate(false);                        // ván mới phải chạm được quân ngay
    for (const k in meshAt) if (meshAt.hasOwnProperty(k)) boardGroup.remove(meshAt[k]);
    meshAt = {}; moves = []; clearGhost(); datBong();
    board = []; for (let r = 0; r < N; r++) { board[r] = []; for (let c = 0; c < N; c++) board[r][c] = 0; }
    const s = (saved && typeof saved.b === 'string' && saved.b.length === N * N) ? saved.b : null;
    if (s) {   // khôi phục ván dở: dựng lại quân trên bàn
      for (let i = 0; i < N * N; i++) {
        const v = s.charCodeAt(i) - 48; if (v !== HUMAN && v !== AI) continue;
        const c = i % N, r = (i / N) | 0;
        commit(c, r, v);
      }
    }
    current = s ? (saved.cur === AI ? AI : HUMAN) : HUMAN;
    over = false; saidN = 0;
    $('.ntk-banner').classList.remove('show'); turnUI(); updConfirm();
    // ⚠⚠ PHẢI TRUYỀN SỐ THẾ HỆ VÁN. `aiTurn(v)` mở đầu bằng `if (over || v !== van || …) return;`
    //    — gọi rỗng thì `undefined !== van` (van vừa ++ ở trên) nên nó thoát ngay: vào lại ván dở
    //    đúng lượt đối thủ là bàn cờ ĐỨNG HÌNH, không đặt được quân nào. Cờ Vua và Cờ Tướng gọi
    //    qua `hen()` nên truyền đúng thế hệ và không dính.
    if (s) { toast('Tiếp tục ván dở'); if (current === AI) { const vNay = van; setTimeout(function () { if (!over) aiTurn(vNay); }, 700); } }
    else { try { setTimeout(function () { if (!over) bossSay('start'); }, 750); } catch (e) {} }
  }
  function persist() {   // lưu sau MỖI nước để F5 / rời view vẫn vào lại được
    try {
      if (!opts.onMove) return;
      let s = ''; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) s += board[r][c];
      opts.onMove({ b: s, cur: current });
    } catch (e) {}
  }

  function turnUI() { const you = $('[data-c="you"]'), ai = $('[data-c="ai"]'); if (current === HUMAN) { you.classList.add('act'); you.classList.remove('wait'); ai.classList.remove('act'); ai.classList.add('wait'); } else { ai.classList.add('act'); ai.classList.remove('wait'); you.classList.remove('act'); you.classList.add('wait'); } you.querySelector('.rs').textContent = current === HUMAN ? 'Đang đi…' : 'Chờ'; ai.querySelector('.rs').textContent = current === AI ? 'Đang tính…' : 'Chờ'; }
  function updConfirm() { const b = $('[data-a="confirm"]'); if (!b) return; if (ghost && !over) { b.classList.remove('dis'); b.classList.add('ready'); } else { b.classList.add('dis'); b.classList.remove('ready'); } }
  function toast(t) { const el = $('.ntk-toast'); el.textContent = t; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 1500); }
  // ---- Trò Chuyện: người chơi gõ tự do hoặc bấm câu có sẵn; đối thủ đôi khi đáp lại ----
  function sayPlayer(text) { const t = String(text || '').trim(); if (!t) return; toast(pl.name + ': 「' + t + '」'); if (!over && Math.random() < 0.5) hen(() => bossSay('reply'), 850); }
  function sendChat() { const inp = $('.ntk-chat-in'); if (!inp) return; sayPlayer(inp.value); inp.value = ''; }
  function fillPresets() { const box = $('.ntk-chat-ps'); if (!box) return; const pool = PLAYER_PRESETS.slice(), pk = []; for (let i = 0; i < 5 && pool.length; i++) pk.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]); box.innerHTML = pk.map(() => '<span class="ntk-chip"></span>').join(''); box.querySelectorAll('.ntk-chip').forEach((c, i) => { c.textContent = pk[i]; c.addEventListener('click', () => sayPlayer(pk[i])); }); }
  function onKey(e) { if (e.key !== 'Escape') return; const box = $('.ntk-chat'); if (box && box.classList.contains('show')) { e.preventDefault(); box.classList.remove('show'); const inp = $('.ntk-chat-in'); if (inp) inp.blur(); } }   // ESC: đóng khung chat
  // (đã bỏ đồng hồ đếm giờ)

  // ---------- Quan Chiến (xoay tự do) ----------
  // Gỡ số vòng đã xoay: giảm chấn đuổi theo hiệu số, để nguyên 5 vòng thì camera quay ngược 5 vòng.
  function normTheta() {
    let th = sph.theta % (Math.PI * 2);
    if (th > Math.PI) th -= Math.PI * 2; else if (th < -Math.PI) th += Math.PI * 2;
    sph.theta = th;
  }
  function startSpectate() {
    autorot = true; ret = null;
    tgt.theta = sph.theta; tgt.phi = sph.phi; tgt.r = sph.r;   // bám camera ĐANG ở đâu, đừng trôi tiếp về đích cũ
    const chat = $('.ntk-chat'); if (chat) chat.classList.remove('show');
    $('.ntk-view').classList.add('show');
    toast('Quan Chiến — kéo để xoay, lăn chuột hoặc chụm hai ngón để phóng to/thu nhỏ bàn.');
  }
  // ⚠ PHẢI gọi cả ở endGame/resetGame: bỏ sót thì ván mới vẫn kẹt autorot=true,
  // mà onUp chỉ gọi tapBoard khi !autorot -> bàn cờ bấm không ăn, nhìn như game chết.
  function stopSpectate(noiGi) {
    if (!autorot) return;
    autorot = false;
    const bar = $('.ntk-view'); if (bar) bar.classList.remove('show');
    normTheta();
    ret = 1; tgt.theta = SPH0.theta; tgt.phi = SPH0.phi; tgt.r = SPH0.r;
    if (noiGi) toast(lockView ? 'Đã cố định — đưa bàn về góc nhìn đã khoá' : 'Đã cố định — đưa bàn về góc nhìn ban đầu');
  }

  function act(a) {
    if (a === 'confirm') confirmMove();
    else if (a === 'undo') undo();
    else if (a === 'resign') { if (!over) endGame(2, null); }
    else if (a === 'draw') { if (!over) { toast(opp.name + ': "Được, hòa vậy."'); hen(() => endGame(0, null), 700); } }
    else if (a === 'spectate') { if (autorot) stopSpectate(true); else startSpectate(); }
    // Khoá góc: ghi TỈ LỆ phóng (r / khoảng cách vừa khung) chứ không ghi r — đổi cỡ màn thì
    // khoảng cách vừa khung tính lại, nhân tỉ lệ này vào là ra đúng góc đã khoá.
    else if (a === 'saveview') {
      // Đo lại khoảng cách vừa khung THEO GÓC VỪA CHỈNH: fitR đang giữ số của lần khớp khung gần nhất.
      const f = fitAt(sph.phi) || fitR || sph.r || 1;
      lockView = { theta: sph.theta, phi: sph.phi, zoom: sph.r / f };
      try { if (opts.onSaveView) lockView = opts.onSaveView(lockView) || lockView; } catch (e) {}
      fitR = f;
      SPH0.theta = lockView.theta; SPH0.phi = lockView.phi; SPH0.r = f * lockView.zoom;
      toast('Đã khoá góc nhìn cho bàn này');
    }
    else if (a === 'resetview') {
      lockView = null;
      try { if (opts.onResetView) opts.onResetView(); } catch (e) {}
      normTheta();
      onResize();
      ret = 1; tgt.theta = SPH0.theta; tgt.phi = SPH0.phi; tgt.r = SPH0.r;
      toast('Đã bỏ khoá — bàn cờ trở lại góc mặc định');
    }
    else if (a === 'chat') {
      const box = $('.ntk-chat'); if (!box) return;
      const show = !box.classList.contains('show');
      if (show && autorot) stopSpectate(false);     // hai bảng cùng nằm đáy giữa -> chỉ mở MỘT
      box.classList.toggle('show', show);
      if (show) { fillPresets(); const inp = $('.ntk-chat-in'); if (inp) setTimeout(() => inp.focus(), 40); }
    }
    else if (a === 'again') resetGame();
    else if (a === 'exit') { try { if (opts.onExit) opts.onExit(); } catch (e) {} }
  }

  function clampPhi(p) { return Math.max(0.3, Math.min(1.18, p)); }
  // ⚠ PHẢI theo dõi TỪNG NGÓN: dùng chung một cặp lastX/lastY thì ngón thứ hai chạm xuống sẽ ghi đè,
  // rồi dx tính bằng hiệu toạ độ với ngón KIA -> bàn giật loạn khi chạm hai ngón trên điện thoại.
  const ngon = {};
  let dragId = -1, pinch0 = 0, pinchR0 = 0;
  function twoIds() { const k = Object.keys(ngon); return k.length >= 2 ? k.slice(0, 2) : null; }
  function pinchDist() { const k = twoIds(); if (!k) return 0; const a = ngon[k[0]], b = ngon[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
  function zoomTo(r) { const lo = fitR * 0.62, hi = fitR * 1.55; tgt.r = Math.max(lo, Math.min(hi, r)); }
  function onDown(e) {
    ngon[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (twoIds() && autorot) { pinch0 = pinchDist(); pinchR0 = tgt.r; dragging = false; movedFlag = true; return; }
    if (dragId >= 0) return;
    dragId = e.pointerId; dragging = true; movedFlag = false; lastX = e.clientX; lastY = e.clientY;
    const el = renderer.domElement; if (el.setPointerCapture) { try { el.setPointerCapture(e.pointerId); } catch (er) {} }
  }
  // Đích đi theo tay 1:1; cái mượt là do giảm chấn ở animate() ĐUỔI THEO đích, không phải quán tính.
  function onMove(e) {
    if (ngon[e.pointerId]) { ngon[e.pointerId].x = e.clientX; ngon[e.pointerId].y = e.clientY; }
    if (twoIds() && autorot) {                    // chụm/giãn hai ngón -> phóng/thu
      const d = pinchDist();
      if (pinch0 > 8 && d > 8) { ret = null; zoomTo(pinchR0 * (pinch0 / d)); }
      return;
    }
    if (!dragging || e.pointerId !== dragId) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 4) movedFlag = true;
    lastX = e.clientX; lastY = e.clientY;
    if (!autorot) return;
    ret = null; tgt.theta -= dx * 0.006; tgt.phi = clampPhi(tgt.phi - dy * 0.005);
  }
  function onUp(e) {
    delete ngon[e.pointerId];
    if (Object.keys(ngon).length < 2) pinch0 = 0;
    if (e.pointerId !== dragId) return;
    if (dragging && !movedFlag && !autorot) tapBoard(e);
    dragging = false; dragId = -1;
  }
  // Trình duyệt di động HUỶ pointer khi nhận ra cử chỉ cuộn/hệ thống — không nghe thì kẹt dragging = true.
  function onCancel(e) { delete ngon[e.pointerId]; pinch0 = 0; if (e.pointerId === dragId) { dragging = false; dragId = -1; } }
  function onWheel(e) { if (!autorot) return; e.preventDefault(); ret = null; zoomTo((tgt.r || sph.r) * (1 + e.deltaY * 0.0011)); }
  function tapBoard(e) { if (over || current !== HUMAN) return; const rect = renderer.domElement.getBoundingClientRect(); pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1; raycaster.setFromCamera(pointer, camera); const pt = new THREE.Vector3(); if (raycaster.ray.intersectPlane(rayPlane, pt)) { const c = Math.round((pt.x + 4) / spacing), r = Math.round((pt.z + 4) / spacing); if (!inb(c, r) || board[r][c] !== 0) return; if (ghost && ghost.c === c && ghost.r === r) { confirmMove(); return; } setGhost(c, r); } }
  // Bàn có lọt khung ở khoảng cách r không — đo góc THẬT của 6 điểm mép (bàn 9.25 × 9.25).
  // ⚠ PHẢI tính cả GÓC XOAY NGANG: xoay bàn 45° thì bề ngang nhìn thấy nở ra tới 1,41 lần.
  // Xoay camera đi theta = xoay BÀN đi -theta rồi đo như lúc theta = 0.
  function fits(r, phi, fovY, fovX, theta) {
    const cy = r * Math.cos(phi), cz = r * Math.sin(phi);
    const dy = -Math.cos(phi), dz = -Math.sin(phi);
    const hb = 4.63, m = 0.995;
    const ct = Math.cos(theta || 0), st = Math.sin(theta || 0);
    const pts = [];
    for (let i = 0; i < 6; i++) pts.push([(i % 3 === 0) ? -hb : (i % 3 === 1 ? 0 : hb), (i < 3) ? -hb : hb]);
    [[-hb, -hb], [hb, -hb], [-hb, hb], [hb, hb]].forEach((q) => pts.push(q));   // 4 góc bàn: xoay chéo là chúng lòi ra trước
    for (let i = 0; i < pts.length; i++) {
      const px = pts[i][0] * ct - pts[i][1] * st, pz = pts[i][0] * st + pts[i][1] * ct;
      const vy = 0.05 - cy, vz = pz - cz;
      const fwd = vy * dy + vz * dz;
      if (fwd <= 0.01) return false;
      const uy = vy - fwd * dy, uz = vz - fwd * dz;
      if (Math.atan2(Math.sqrt(uy * uy + uz * uz), fwd) > fovY / 2 * m) return false;   // dọc
      if (Math.atan2(Math.abs(px), fwd) > fovX / 2 * m) return false;                   // ngang
    }
    return true;
  }
  // Khoảng cách VỪA KHUNG cho một góc bất kỳ (dùng khi khoá góc, không chỉ lúc resize).
  let _fovY = 0.6283, _fovX = 0.6283;
  function fitAt(phi, theta) {
    let lo = 7, hi = 40;
    for (let i = 0; i < 26; i++) { const mid = (lo + hi) / 2; if (fits(mid, phi, _fovY, _fovX, theta === undefined ? sph.theta : theta)) hi = mid; else lo = mid; }
    return hi;
  }
  function onResize() {
    if (!renderer) return;
    capKhung(root);                     // khung thấp -> chrome rút gọn (xem engine/toanman.js)
    if ($('.ntk-banner').classList.contains('show')) vuaKhung($('.ntk-end'), root);
    const w = W(), h = H(); renderer.setSize(w, h);
    const ar = w / h, portrait = ar < 1.05;
    // Mobile: CHỪA dải TRÊN (thẻ tên đấu thủ) + dải DƯỚI (hàng nút), bàn khớp vào ĐÚNG khoảng giữa
    // -> khung kéo dài lấp màn mà bàn vẫn không đè lên thẻ tên / nút.
    const BTN = portrait ? 72 : 0, TOP = portrait ? 86 : 0;
    const uh = Math.max(80, h - BTN - TOP), a = w / uh;
    camera.aspect = a;
    // Góc KHOÁ (nếu có) đè lên góc tự canh; khoảng cách vẫn tính lại theo khung THẬT rồi mới
    // nhân tỉ lệ phóng — không thì đổi cỡ màn là bàn lòi ra ngoài.
    const G = lockView;
    const phi = G ? G.phi : (portrait ? Math.max(0.38, 0.66 - (1.05 - ar) * 0.45) : 0.66);   // màn dọc -> nhìn từ trên xuống hơn
    const theta = G ? G.theta : 0;
    SPH0.phi = phi; SPH0.theta = theta;
    _fovY = camera.fov * Math.PI / 180; _fovX = 2 * Math.atan(Math.tan(_fovY / 2) * a);
    const truoc = fitR;                                           // mốc cũ, để giữ nguyên mức phóng khi đổi khung
    fitR = fitAt(phi, theta);
    SPH0.r = fitR * (G ? G.zoom : 1);
    if (autorot) {
      // ĐANG xoay tự do: KHÔNG giật góc của người chơi, nhưng khoảng cách VẪN phải bám khung mới
      // (bản trước bọc cả cụm này trong !autorot -> đổi cỡ màn giữa lúc Quan Chiến là bàn lệch hẳn).
      const tiLe = truoc ? (sph.r / truoc) : 1;
      tgt.r = fitAt(sph.phi) * tiLe; sph.r = tgt.r;
    } else {
      tgt.phi = phi; tgt.theta = theta; tgt.r = SPH0.r;
      if (!ret) { sph.phi = phi; if (G) sph.theta = theta; }
      // LẦN ĐẦU (và khi xoay ngang/dọc làm khoảng cách đổi mạnh) phải ĐẶT THẲNG, không thả cho
      // giảm chấn bò tới: r khởi tạo là 15 mà màn dọc cần ~24 -> khung đầu tiên bàn cờ bị CẮT.
      if (firstFit || Math.abs(sph.r - SPH0.r) > SPH0.r * 0.25) { sph.r = SPH0.r; firstFit = false; }
    }
    if (scene && scene.fog) { scene.fog.near = sph.r * 0.97; scene.fog.far = sph.r * 2.42; }   // co giãn fog theo r (khỏi xỉn màu)
    camera.updateProjectionMatrix();
    camera.setViewOffset(w, uh, 0, -TOP, w, h);
    updCam();
    // ⚠ CÂN DỌC. fits() chỉ bảo đảm bàn LỌT khung, KHÔNG bảo đảm nằm GIỮA: mép gần chiếu to hơn
    // mép xa nên hộp bao luôn bị đẩy lệch. Đo hộp bao THẬT trên màn rồi dịch khung bù lại.
    // Tăng offsetY thì nội dung dâng LÊN.
    const lech = ndcGiua();
    if (isFinite(lech) && Math.abs(lech) > 0.002) { camera.setViewOffset(w, uh, 0, -TOP + lech * h / 2, w, h); updCam(); }
  }
  // Tâm dọc hộp bao bàn cờ trên màn, đơn vị NDC (-1 = đỉnh khung, +1 = đáy khung).
  // NaN khi chưa đo được (điểm ra sau lưng camera) -> bên gọi bỏ qua, không dịch bừa.
  function ndcGiua() {
    if (!camera) return NaN;
    camera.updateMatrixWorld();
    const hb = 4.63, v = new THREE.Vector3();
    const pts = [[-hb, -hb], [0, -hb], [hb, -hb], [-hb, hb], [0, hb], [hb, hb], [-hb, 0], [hb, 0]];
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < pts.length; i++) {
      v.set(pts[i][0], 0.05, pts[i][1]).project(camera);
      const y = -v.y;
      if (!isFinite(y) || Math.abs(y) > 5) return NaN;
      if (y < lo) lo = y; if (y > hi) hi = y;
    }
    return (lo + hi) / 2;
  }
  // camera ĐUỔI THEO đích (giảm chấn) -> mọi thao tác đều mềm, không giật
  function animate(t) {
    rafId = requestAnimationFrame(animate);
    tuChinh(t);                                  // tự hạ/nâng tỉ lệ điểm ảnh theo sức máy
    const k = 0.16, dt = tgt.theta - sph.theta, dp = tgt.phi - sph.phi, drr = tgt.r - sph.r;
    if (Math.abs(dt) > 1e-5 || Math.abs(dp) > 1e-5 || Math.abs(drr) > 1e-4) { sph.theta += dt * k; sph.phi += dp * k; sph.r += drr * k * 0.9; updCam(); }
    else if (ret) ret = null;
    // Bụi bay chạy theo nhịp ~33ms thay vì mỗi khung (xem chú thích cùng chỗ ở covua.js).
    if (particles && nhipBui(t)) {
      const pa = particles.geometry.attributes.position, ar = pa.array;
      for (let i = 1; i < ar.length; i += 3) { ar[i] += 0.0176; if (ar[i] > 7.6) ar[i] = -0.2; }
      pa.needsUpdate = true;
    }
    // Bàn cờ caro không có quân bay: bóng chỉ đổi lúc đặt quân, `datBong()` tự bật needsUpdate.
    renderer.render(scene, camera);
  }
  /** Gọi khi bàn đổi (đặt quân / ván mới) để vẽ lại bản đồ bóng đúng một lần. */
  function datBong() { if (renderer) renderer.shadowMap.needsUpdate = true; }

  function glowTex(col) { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d'); const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(' + col + ',0.8)'); g.addColorStop(0.5, 'rgba(' + col + ',0.28)'); g.addColorStop(1, 'rgba(' + col + ',0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t; }
  function dotTex() { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(185,236,247,0.5)'); g.addColorStop(1, 'rgba(185,236,247,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); }
  function makeParticles() { const n = 64, geo = new THREE.BufferGeometry(), arr = new Float32Array(n * 3); for (let i = 0; i < n; i++) { arr[i * 3] = (Math.random() - 0.5) * 12; arr[i * 3 + 1] = Math.random() * 7; arr[i * 3 + 2] = (Math.random() - 0.5) * 12; } geo.setAttribute('position', new THREE.BufferAttribute(arr, 3)); const mat = new THREE.PointsMaterial({ size: 0.12, map: dotTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xbff0fb, opacity: 0.5, sizeAttenuation: true }); return new THREE.Points(geo, mat); }
  function gridTex() { const cv = document.createElement('canvas'); cv.width = cv.height = 1024; const x = cv.getContext('2d'); x.clearRect(0, 0, 1024, 1024); x.strokeStyle = 'rgba(155,222,242,0.6)'; x.lineWidth = 2.4; x.shadowColor = 'rgba(120,222,246,0.85)'; x.shadowBlur = 6; for (let i = 0; i < N; i++) { const p = i / (N - 1) * 1024; x.beginPath(); x.moveTo(p, 0); x.lineTo(p, 1024); x.stroke(); x.beginPath(); x.moveTo(0, p); x.lineTo(1024, p); x.stroke(); } x.shadowBlur = 0; x.fillStyle = 'rgba(165,228,248,0.85)';[[3, 3], [11, 3], [7, 7], [3, 11], [11, 11]].forEach((h) => { const px = h[0] / (N - 1) * 1024, py = h[1] / (N - 1) * 1024; x.beginPath(); x.arc(px, py, 6, 0, 7); x.fill(); }); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; }
  function gradTex(forEnv) { const cv = document.createElement('canvas'); cv.width = 16; cv.height = 256; const x = cv.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#1c4c5c'); g.addColorStop(0.42, '#123846'); g.addColorStop(0.76, '#0b232d'); g.addColorStop(1, '#071620'); x.fillStyle = g; x.fillRect(0, 0, 16, 256); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; if (forEnv) t.mapping = THREE.EquirectangularReflectionMapping; return t; }

  return {
    destroy() { over = true; van++; if (rafId) cancelAnimationFrame(rafId); tm.destroy(); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onCancel); window.removeEventListener('resize', onResize); window.removeEventListener('keydown', onKey); try { if (renderer) { renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss(); } } catch (e) {} host.innerHTML = ''; },
    resize() { onResize(); },
  };
}

// ============================================================
// Alpine factory — view "Ngũ Tử Kỳ" (chọn Danh Sĩ khiêu chiến → mount bàn)
// ============================================================
export function nguTuKy() {
  return {
    _battle: null,
    inBattle: false,
    loading: false,
    loadErr: '',
    opp: null,          // Danh Sĩ đang đấu (đối tượng từ danhSiBang)
    get ntk() { return this.$store.game.state.nguTu; },
    // danh sách đối thủ: Danh Sĩ Giang Hồ (đối thủ thật, sau này thêm "người chơi online")
    get opponents() { try { return (this.$store.game.danhSiBang || []).slice(); } catch (e) { return []; } },
    recOf(id) { const r = (this.ntk.rec || {})[id]; return r ? (r.w + ' Thắng ' + r.l + ' Bại') : 'Chưa đấu'; },
    diffOf(o) { const rp = (o && o.rankPower) || 500; return Math.max(0.15, Math.min(0.95, (rp - 400) / 620)); },
    diffLabel(o) { const d = this.diffOf(o); return d < 0.35 ? 'Dễ' : d < 0.6 ? 'Vừa' : d < 0.8 ? 'Khó' : 'Cao Thủ'; },
    // gom Danh Sĩ theo tầng (Cao Thủ/Khó/Vừa/Dễ) cho lưới Kỳ Đài
    get tiers() { const g = { 'Cao Thủ': [], 'Khó': [], 'Vừa': [], 'Dễ': [] }; this.opponents.forEach((o) => { const t = this.diffLabel(o); if (g[t]) g[t].push(o); }); const col = { 'Cao Thủ': '#e6c079', 'Khó': '#f0997b', 'Vừa': '#5dcaa5', 'Dễ': '#97c459' }; return ['Cao Thủ', 'Khó', 'Vừa', 'Dễ'].filter((t) => g[t].length).map((t) => ({ name: t, color: col[t], list: g[t] })); },
    faceOf(o) { return (o && o.face) || ('images/danhsi/' + (o && o.id) + '.webp'); },   // truyền nhân (kế vị) mượn chân dung tổ tiên qua o.face
    // Kỳ Hồn + Kỳ Nghệ: dùng CHUNG state.kyHon với Cờ Tướng (mốc ở engine/kyhon.js)
    kyNghe: KY_NGHE,
    get kyHon() { return getKyHon(this.$store.game.state); },
    get kyNgheState() { return kyNgheOf(this.$store.game.state); },

    // ---- ván dở: giữ qua F5 / rời view giữa chừng ----
    get savedGame() { const g = this.ntk && this.ntk.game; return (g && g.b && g.oppId) ? g : null; },
    get savedOpp() { const g = this.savedGame; return g ? this.opponents.find((x) => x.id === g.oppId) : null; },
    resumeSaved() { const o = this.savedOpp; if (o) this.challenge(o, this.savedGame); },
    dropSaved() { if (this.ntk) this.ntk.game = null; try { Storage.save(this.$store.game.state); } catch (e) {} },

    ntkInit() {
      ensureNguTu(this.$store.game.state);
      // deep-link: openNguTu(id) đặt sẵn _ntkOpp trên store
      const pre = this.$store.game._ntkOpp; this.$store.game._ntkOpp = null;
      if (pre) { const o = this.opponents.find((x) => x.id === pre); if (o) this.$nextTick(() => this.challenge(o)); }
      // rời view giữa ván → tháo bàn (tính bỏ ván, không ghi thua)
      // ⚠ ĐỪNG đặt điều kiện `&& this._battle`: rời view TRONG LÚC còn đang tải Three.js thì _battle
      // vẫn null, watcher bỏ qua, rồi _mount() chạy muộn trên host đã bị gỡ khỏi DOM -> dựng hẳn một
      // WebGLRenderer + vòng rAF + listener window KHÔNG AI huỷ được.
      this.$watch('$store.game.view', (v) => {
        if (v === 'nguTuKy') return;
        this._boSo = true;
        if (this._battle) { try { this._battle.destroy(); } catch (e) {} this._battle = null; }
        this.inBattle = false; this.loading = false;
      });
    },

    challenge(o, saved) {
      if (this.inBattle) return;
      this._boSo = false;
      this.opp = o; this._saved = saved || null; this.loadErr = ''; this.loading = true; this.inBattle = true;
      ensureThree().then(() => {
        this.loading = false;
        this.$nextTick(() => this._mount());
      }).catch((e) => { this.loading = false; this.inBattle = false; this.loadErr = String(e && e.message || e); });
    },
    _mount() {
      // Rời view giữa lúc tải xong -> KHÔNG dựng bàn nữa (xem chú thích ở ntkInit).
      if (this._boSo || this.$store.game.view !== 'nguTuKy') { this._boSo = false; this.inBattle = false; return; }
      const host = this.$refs.boardHost;
      if (!host) { this.inBattle = false; return; }
      host.innerHTML = '';
      const g = this.$store.game, o = this.opp;
      this._battle = mountNguTu(host, {
        opponent: { name: o.ten || 'Đối Thủ', art: this.faceOf(o) },
        player: { name: (g.state.player || {}).name || 'Bạn', art: g.avatarSrc },
        difficulty: 1,   // TẤT CẢ đối thủ đánh ở mức khó tối đa (tier chỉ còn là nhãn lore theo rank)
        saved: this._saved,
        view: getGocNhin(g.state, 'nguTu'),          // góc nhìn đã khoá RIÊNG của bàn này
        onSaveView: (v) => { const r = saveGocNhin(g.state, 'nguTu', v); try { Storage.save(g.state); } catch (e) {} return r; },
        onResetView: () => { clearGocNhin(g.state, 'nguTu'); try { Storage.save(g.state); } catch (e) {} },
        onMove: (snap) => this._persist(o.id, snap),
        onEnd: (result) => this._recordResult(o.id, result),
        onExit: () => this._exit(),
      });
      this._saved = null;
    },
    _persist(id, snap) {
      const n = this.ntk; if (!n) return;
      n.game = { oppId: id, b: snap.b, cur: snap.cur };
      try { Storage.save(this.$store.game.state); } catch (e) {}
    },
    _recordResult(id, result) {
      const n = this.ntk; if (!n.rec[id]) n.rec[id] = { w: 0, l: 0 };
      n.game = null;   // ván đã xong -> bỏ bản lưu dở
      if (result === 1) { n.rec[id].w++; n.wins++; addKyHon(this.$store.game.state, 12); try { this.$store.game.checkTitles(); } catch (e) {} }   // Kỳ Hồn CHUNG + mở khoá Kỳ Nghệ tức thì
      else if (result === 2) { n.rec[id].l++; }
      try { Storage.save(this.$store.game.state); } catch (e) {}
    },
    _exit() { if (this._battle) { try { this._battle.destroy(); } catch (e) {} this._battle = null; } this.inBattle = false; this.opp = null; },
  };
}
