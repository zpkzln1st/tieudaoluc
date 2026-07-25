// ============================================================
// NGŨ TỬ KỲ (五子棋 / cờ caro) — mini-game 3D (side-content, 0-power)
// Khuôn Kỳ Trận: cách ly tuyệt đối, CHỈ đọc/ghi state.nguTu.
// Bàn cờ 3D = WebGL (Three.js, lazy-load src/lib/three.min.js chỉ khi mở).
// ĐỐI THỦ TÁCH RỜI: hiện là AI (heuristic, độ khó theo rankPower Danh Sĩ);
//   sau cắm PvP online (Supabase) chỉ cần thay nguồn "nước đi đối thủ".
// ============================================================
import { Storage } from './engine/save.js';

// ---------- ensure/migrate: khởi tạo state.nguTu (gọi mỗi lần load) ----------
export function ensureNguTu(state) {
  if (!state.nguTu) state.nguTu = {};
  const n = state.nguTu;
  if (!n.rec) n.rec = {};            // { danhsiId: { w, l } }
  if (n.kyHon == null) n.kyHon = 0;  // Kỳ Hồn — tiền tệ riêng (thắng được, tiêu sau)
  if (n.wins == null) n.wins = 0;    // tổng ván thắng
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
.ntk-root{position:relative;width:100%;max-width:900px;margin:0 auto;aspect-ratio:16/10;border-radius:16px;overflow:hidden;background:#070d13;box-shadow:0 24px 60px -30px #000;border:1px solid #16303b;touch-action:none;user-select:none;
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
.ntk-banner{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(4,10,16,.74);z-index:7;text-align:center;padding:20px}
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
@media (max-width:600px){.ntk-root{aspect-ratio:2/3;max-height:86dvh}.ntk-title{left:10px;top:8px}.ntk-title .hz{font-size:22px}.ntk-title .vz{font-size:11px}.ntk-left{left:0;right:0;bottom:9px;top:auto;transform:none;flex-direction:row;justify-content:center;gap:15px;z-index:5}.ntk-b{width:auto}.ntk-b .ic{width:40px;height:40px}.ntk-b .ic svg{width:21px;height:21px}.ntk-b span{font-size:9.5px}.ntk-right{right:8px;top:8px;gap:6px}.ntk-pc{width:134px;padding:5px 8px 5px 5px}.ntk-av{width:30px;height:30px}.ntk-pc .nm{font-size:11px}.ntk-pc .rr{font-size:9px}.ntk-toast{max-width:82%;font-size:11px;top:112px}.ntk-chat{bottom:74px;width:94%}}
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
  'Hay! Nước đó tại hạ chịu thua.',
  'Để xem ai vây được ai.',
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
  const diff = Math.max(0.1, Math.min(0.98, opts.difficulty == null ? 0.6 : opts.difficulty));

  host.innerHTML =
    '<div class="ntk-root">' +
      '<div class="ntk-scene"></div><div class="ntk-vig"></div>' +
      '<div class="ntk-fb"><div>Không khởi tạo được 3D trên máy này.</div><div class="fm" style="font-size:12px;color:#5f7d8b"></div></div>' +
      '<div class="ntk-title"><span class="hz">五子棋</span><span class="vz">Ngũ Tử Kỳ</span></div>' +
      '<div class="ntk-left">' +
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
  const fb = (msg) => { const d = $('.ntk-fb'); d.style.display = 'flex'; if (msg) d.querySelector('.fm').textContent = msg; };

  // ---- state ----
  const N = 15, HUMAN = 1, AI = 2;
  let spacing = 8 / 14;
  let board = [], meshAt = {}, moves = [], ghost = null, current = HUMAN, over = false, saidN = 0;
  let renderer, scene, camera, boardGroup, raycaster, pointer, rayPlane, particles = null, rafId = 0;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPH0 = { r: 12.4, theta: 0, phi: 0.66 };   // góc nhìn mặc định (bàn cố định)
  let target, sph = { r: 12.4, theta: 0, phi: 0.66 }, dragging = false, movedFlag = false, lastX = 0, lastY = 0, autorot = false, ret = null;
  let stoneGeo, matB, matW, matBg, matWg;
  const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];
  const inb = (c, r) => c >= 0 && c < N && r >= 0 && r < N;
  const key = (c, r) => c + '_' + r;
  const wx = (i) => -4 + i * spacing;

  // ===== KHẨU CHIẾN — đối thủ nói trong lúc đánh cờ (chọn câu theo diễn biến) =====
  const LINES = {
    start: [
      'Các hạ mời ngồi, ván cờ này tại hạ chờ đã lâu.', 'Bàn cờ đã bày sẵn, các hạ cứ đi trước cho.',
      'Lâu lắm mới có người đáng để ngồi đối diện.', 'Trời đẹp thế này, không đánh vài ván thì phí.',
      'Các hạ cứ thong thả, tại hạ chẳng vội đâu.', 'Nghe danh đã lâu, hôm nay xin được lĩnh giáo.',
      'Mời các hạ ra quân, để xem thử tay nghề.', 'Tại hạ đánh cờ mấy chục năm, chưa từng thua ai.',
      'Các hạ trông tự tin lắm, để xem thực hư.', 'Nước đầu nhường các hạ, xem có chiêu gì hay.',
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
      'Lẽ ra quân ấy nên đặt chỗ khác.', 'A, sai một ly đi một dặm rồi.',
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
      'Các hạ cầm quân chắc tay, chỉ tiếc thiếu chút may.', 'Các hạ để hở một hàng, coi như hết đường.',
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
      'Các hạ thắng đẹp, xin vỗ tay khen thật lòng.', 'Tại hạ chủ quan, để các hạ luồn vào giữa bàn.',
      'Lâu lắm mới có người thắng được tại hạ như thế.', 'Bàn cờ nghiêng hẳn về các hạ, xin chịu thua.',
    ],
    draw: [
      'Ván này hòa rồi, kẻ tám lạng người nửa cân.', 'Tiếc thật, cả bàn cờ mà không phân nổi cao thấp.',
      'Các hạ kín thế thật, tại hạ không tìm ra kẽ hở.', 'Hòa cờ cũng là một cái duyên đấy chứ.',
      'Còn cờ còn đó, hẹn các hạ lần sau phân bại.', 'Ván cờ đẹp thế này, hòa cũng chẳng tiếc.',
      'Nước cuối khóa chặt, hai bên cùng hết đường.', 'Hòa. Xem ra phải thêm ván nữa mới rõ cao thấp.',
      'Đấu tới đấu lui, ai ngờ lại hòa một ván.', 'Các hạ cao thật, gỡ được một ván hòa là may.',
      'Đánh với các hạ, hòa cũng thấy đáng công.', 'Lần sau tái chiến, xin các hạ đừng nhường tay.',
    ],
    reply: [
      'Các hạ ham nói vậy, không sợ lỡ tay đặt nhầm chỗ?', 'Nghe cũng vui tai, nhưng bàn cờ vẫn còn đợi đấy.',
      'Chuyện ấy hay thật, mà nước cờ của các hạ còn hay hơn.', 'Vừa đánh vừa trò chuyện, mới ra cái thú tao nhã.',
      'Hàn huyên gì thì hàn, đừng quên bên trên bàn cờ.', 'Trò chuyện cho vui thôi, thắng thua vẫn ở tay cờ.',
      'Tại hạ thích người biết chuyện trò lúc đánh cờ.', 'Chuyện gẫu thì để mai, bàn cờ đang gấp lắm đấy.',
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

  try { init(); resetGame(); animate(); } catch (e) { fb(String(e && e.message || e)); return { destroy() {}, resize() {} }; }
  setTimeout(onResize, 120); setTimeout(onResize, 500);

  function W() { return scEl.clientWidth || 720; }
  function H() { return scEl.clientHeight || 450; }

  function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W(), H());
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.06;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    window.addEventListener('pointerup', onUp); window.addEventListener('resize', onResize);
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
  function commit(c, r, color) { board[r][c] = color; const m = makeMesh(color, false); m.position.set(wx(c), 0.1, wx(r)); m.castShadow = true; boardGroup.add(m); meshAt[key(c, r)] = m; moves.push({ c, r, color }); return m; }
  function confirmMove() { if (over || !ghost || current !== HUMAN) return; const c = ghost.c, r = ghost.r; clearGhost(); commit(c, r, HUMAN); if (winLineAt(c, r, HUMAN)) return endGame(1, winLineAt(c, r, HUMAN)); if (moves.length >= N * N) return endGame(0, null); current = AI; turnUI(); setTimeout(aiTurn, 440); }
  function aiTurn() { if (over) return; const wasThreat = !!findWinning(HUMAN); const mv = aiPick(); if (!mv) return endGame(0, null); commit(mv.c, mv.r, AI); const wl = winLineAt(mv.c, mv.r, AI); if (wl) return endGame(2, wl); if (moves.length >= N * N) return endGame(0, null); current = HUMAN; turnUI(); maybeBossSay(wasThreat, mv); }

  function winLineAt(c, r, color) { for (let k = 0; k < 4; k++) { const dx = DIRS[k][0], dy = DIRS[k][1]; const cells = [[c, r]]; let i; for (i = 1; inb(c + dx * i, r + dy * i) && board[r + dy * i][c + dx * i] === color; i++) cells.push([c + dx * i, r + dy * i]); for (i = 1; inb(c - dx * i, r - dy * i) && board[r - dy * i][c - dx * i] === color; i++) cells.unshift([c - dx * i, r - dy * i]); if (cells.length >= 5) return cells.slice(0, 5); } return null; }
  function runScore(cnt, ends) { if (cnt >= 5) return 1e6; if (cnt === 4) return ends >= 2 ? 50000 : (ends === 1 ? 4200 : 0); if (cnt === 3) return ends >= 2 ? 4200 : (ends === 1 ? 320 : 0); if (cnt === 2) return ends >= 2 ? 220 : (ends === 1 ? 22 : 0); return ends * 3 + 1; }
  function evalCell(c, r, color) { let total = 0; for (let k = 0; k < 4; k++) { const dx = DIRS[k][0], dy = DIRS[k][1]; let cnt = 1, ends = 0, i; for (i = 1; inb(c + dx * i, r + dy * i) && board[r + dy * i][c + dx * i] === color; i++) cnt++; if (inb(c + dx * i, r + dy * i) && board[r + dy * i][c + dx * i] === 0) ends++; for (i = 1; inb(c - dx * i, r - dy * i) && board[r - dy * i][c - dx * i] === color; i++) cnt++; if (inb(c - dx * i, r - dy * i) && board[r - dy * i][c - dx * i] === 0) ends++; total += runScore(cnt, ends); } return total; }
  function findWinning(color) { for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { if (board[r][c] !== 0) continue; board[r][c] = color; const w = winLineAt(c, r, color); board[r][c] = 0; if (w) return { c, r }; } return null; }
  function candidates() { let any = false; const res = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (board[r][c] !== 0) any = true; if (!any) return [{ c: 7, r: 7 }]; const seen = {}; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { if (board[r][c] === 0) continue; for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) { const nc = c + dc, nr = r + dr; if (inb(nc, nr) && board[nr][nc] === 0) { const k = key(nc, nr); if (!seen[k]) { seen[k] = 1; res.push({ c: nc, r: nr }); } } } } return res; }
  function aiPick() {
    let m = findWinning(AI); if (m) return m;
    // độ khó thấp -> đôi khi KHÔNG chặn (blunder)
    const blunder = Math.random() > (0.35 + diff * 0.6);
    if (!blunder) { m = findWinning(HUMAN); if (m) return m; }
    const cands = candidates(); let best = null, bs = -1;
    for (let i = 0; i < cands.length; i++) { const cc = cands[i]; let s = evalCell(cc.c, cc.r, AI) + (0.5 + diff * 0.5) * evalCell(cc.c, cc.r, HUMAN) + Math.random() * (2 + (1 - diff) * 30); if (s > bs) { bs = s; best = cc; } }
    return best || { c: 7, r: 7 };
  }

  function endGame(result, line) {
    over = true; clearGhost(); updConfirm();
    if (line) for (let i = 0; i < line.length; i++) { const mm = meshAt[key(line[i][0], line[i][1])]; if (mm) { mm.material = mm.material.clone(); mm.material.emissive = new THREE.Color(0xe6c079); mm.material.emissiveIntensity = 0.85; mm.scale.set(1.16, 1.5, 1.16); } }
    const b = $('.ntk-banner'), end = b.querySelector('.ntk-end'), bt = b.querySelector('.bt'), bs = b.querySelector('.bs'), rw = b.querySelector('.ntk-end-rw');
    end.classList.remove('win', 'lose', 'draw'); rw.classList.remove('show');
    if (result === 1) { end.classList.add('win'); bt.textContent = 'Bạn Thắng!'; bs.textContent = opp.name + ': 「' + pick(LINES.lose) + '」'; rw.textContent = 'Kỳ Hồn +12'; rw.classList.add('show'); }
    else if (result === 2) { end.classList.add('lose'); bt.textContent = 'Bạn Thua'; bs.textContent = opp.name + ': 「' + pick(LINES.win) + '」'; }
    else { end.classList.add('draw'); bt.textContent = 'Hòa Cờ'; bs.textContent = opp.name + ': 「' + pick(LINES.draw) + '」'; }
    b.classList.add('show');
    try { if (opts.onEnd) opts.onEnd(result); } catch (e) {}
  }
  function undo() { if (over) return; clearGhost(); let n = 0; while (n < 2 && moves.length > 0) { const mv = moves.pop(); const mm = meshAt[key(mv.c, mv.r)]; if (mm) { boardGroup.remove(mm); delete meshAt[key(mv.c, mv.r)]; } board[mv.r][mv.c] = 0; n++; } current = HUMAN; over = false; turnUI(); }
  function resetGame() { for (const k in meshAt) if (meshAt.hasOwnProperty(k)) boardGroup.remove(meshAt[k]); meshAt = {}; moves = []; clearGhost(); board = []; for (let r = 0; r < N; r++) { board[r] = []; for (let c = 0; c < N; c++) board[r][c] = 0; } current = HUMAN; over = false; saidN = 0; $('.ntk-banner').classList.remove('show'); turnUI(); updConfirm(); try { setTimeout(function () { if (!over) bossSay('start'); }, 750); } catch (e) {} }

  function turnUI() { const you = $('[data-c="you"]'), ai = $('[data-c="ai"]'); if (current === HUMAN) { you.classList.add('act'); you.classList.remove('wait'); ai.classList.remove('act'); ai.classList.add('wait'); } else { ai.classList.add('act'); ai.classList.remove('wait'); you.classList.remove('act'); you.classList.add('wait'); } you.querySelector('.rs').textContent = current === HUMAN ? 'Đang đi…' : 'Chờ'; ai.querySelector('.rs').textContent = current === AI ? 'Đang tính…' : 'Chờ'; }
  function updConfirm() { const b = $('[data-a="confirm"]'); if (!b) return; if (ghost && !over) { b.classList.remove('dis'); b.classList.add('ready'); } else { b.classList.add('dis'); b.classList.remove('ready'); } }
  function toast(t) { const el = $('.ntk-toast'); el.textContent = t; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 1500); }
  // ---- Trò Chuyện: người chơi gõ tự do hoặc bấm câu có sẵn; đối thủ đôi khi đáp lại ----
  function sayPlayer(text) { const t = String(text || '').trim(); if (!t) return; toast(pl.name + ': 「' + t + '」'); if (!over && Math.random() < 0.5) setTimeout(() => { if (!over) bossSay('reply'); }, 850); }
  function sendChat() { const inp = $('.ntk-chat-in'); if (!inp) return; sayPlayer(inp.value); inp.value = ''; }
  function fillPresets() { const box = $('.ntk-chat-ps'); if (!box) return; const pool = PLAYER_PRESETS.slice(), pk = []; for (let i = 0; i < 5 && pool.length; i++) pk.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]); box.innerHTML = pk.map(() => '<span class="ntk-chip"></span>').join(''); box.querySelectorAll('.ntk-chip').forEach((c, i) => { c.textContent = pk[i]; c.addEventListener('click', () => sayPlayer(pk[i])); }); }
  function onKey(e) { if (e.key !== 'Escape') return; const box = $('.ntk-chat'); if (box && box.classList.contains('show')) { e.preventDefault(); box.classList.remove('show'); const inp = $('.ntk-chat-in'); if (inp) inp.blur(); } }   // ESC: đóng khung chat
  // (đã bỏ đồng hồ đếm giờ)

  function act(a) {
    if (a === 'confirm') confirmMove();
    else if (a === 'undo') undo();
    else if (a === 'resign') { if (!over) endGame(2, null); }
    else if (a === 'draw') { if (!over) { toast(opp.name + ': "Được, hòa vậy."'); setTimeout(() => { if (!over) endGame(0, null); }, 700); } }
    else if (a === 'spectate') { autorot = !autorot; if (autorot) { ret = null; toast('Quan Chiến — kéo/xoay bàn cờ (tạm dừng đánh)'); } else { let th = sph.theta % (Math.PI * 2); if (th > Math.PI) th -= Math.PI * 2; else if (th < -Math.PI) th += Math.PI * 2; ret = { r: sph.r, theta: th, phi: sph.phi, t: 0 }; toast('Đã cố định — đưa bàn về góc nhìn ban đầu'); } }
    else if (a === 'chat') { const box = $('.ntk-chat'); if (!box) return; const show = !box.classList.contains('show'); box.classList.toggle('show', show); if (show) { fillPresets(); const inp = $('.ntk-chat-in'); if (inp) setTimeout(() => inp.focus(), 40); } }
    else if (a === 'again') resetGame();
    else if (a === 'exit') { try { if (opts.onExit) opts.onExit(); } catch (e) {} }
  }

  function onDown(e) { dragging = true; movedFlag = false; lastX = e.clientX; lastY = e.clientY; }
  function onMove(e) { if (!dragging) return; const dx = e.clientX - lastX, dy = e.clientY - lastY; if (Math.abs(dx) + Math.abs(dy) > 4) movedFlag = true; lastX = e.clientX; lastY = e.clientY; if (autorot) { sph.theta -= dx * 0.006; sph.phi = Math.max(0.3, Math.min(1.18, sph.phi - dy * 0.005)); updCam(); } }
  function onUp(e) { if (dragging && !movedFlag && !autorot) tapBoard(e); dragging = false; }
  function tapBoard(e) { if (over || current !== HUMAN) return; const rect = renderer.domElement.getBoundingClientRect(); pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1; raycaster.setFromCamera(pointer, camera); const pt = new THREE.Vector3(); if (raycaster.ray.intersectPlane(rayPlane, pt)) { const c = Math.round((pt.x + 4) / spacing), r = Math.round((pt.z + 4) / spacing); if (!inb(c, r) || board[r][c] !== 0) return; if (ghost && ghost.c === c && ghost.r === r) { confirmMove(); return; } setGhost(c, r); } }
  function onResize() { if (!renderer) return; const a = W() / H(); camera.aspect = a; camera.updateProjectionMatrix(); renderer.setSize(W(), H()); sph.r = Math.max(12.4, Math.min(21, 13.5 / a)); SPH0.r = sph.r; updCam(); }   // màn hẹp/dọc: kéo camera lùi cho thấy trọn bàn
  function animate() { rafId = requestAnimationFrame(animate); if (ret) { ret.t = Math.min(1, ret.t + 0.05); const e = 1 - Math.pow(1 - ret.t, 3); sph.r = ret.r + (SPH0.r - ret.r) * e; sph.theta = ret.theta + (SPH0.theta - ret.theta) * e; sph.phi = ret.phi + (SPH0.phi - ret.phi) * e; updCam(); if (ret.t >= 1) ret = null; } if (particles) { const pa = particles.geometry.attributes.position, ar = pa.array; for (let i = 1; i < ar.length; i += 3) { ar[i] += 0.0032; if (ar[i] > 7.6) ar[i] = -0.2; } pa.needsUpdate = true; } renderer.render(scene, camera); }

  function glowTex(col) { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d'); const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(' + col + ',0.8)'); g.addColorStop(0.5, 'rgba(' + col + ',0.28)'); g.addColorStop(1, 'rgba(' + col + ',0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t; }
  function dotTex() { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(185,236,247,0.5)'); g.addColorStop(1, 'rgba(185,236,247,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); }
  function makeParticles() { const n = 64, geo = new THREE.BufferGeometry(), arr = new Float32Array(n * 3); for (let i = 0; i < n; i++) { arr[i * 3] = (Math.random() - 0.5) * 12; arr[i * 3 + 1] = Math.random() * 7; arr[i * 3 + 2] = (Math.random() - 0.5) * 12; } geo.setAttribute('position', new THREE.BufferAttribute(arr, 3)); const mat = new THREE.PointsMaterial({ size: 0.12, map: dotTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xbff0fb, opacity: 0.5, sizeAttenuation: true }); return new THREE.Points(geo, mat); }
  function gridTex() { const cv = document.createElement('canvas'); cv.width = cv.height = 1024; const x = cv.getContext('2d'); x.clearRect(0, 0, 1024, 1024); x.strokeStyle = 'rgba(155,222,242,0.6)'; x.lineWidth = 2.4; x.shadowColor = 'rgba(120,222,246,0.85)'; x.shadowBlur = 6; for (let i = 0; i < N; i++) { const p = i / (N - 1) * 1024; x.beginPath(); x.moveTo(p, 0); x.lineTo(p, 1024); x.stroke(); x.beginPath(); x.moveTo(0, p); x.lineTo(1024, p); x.stroke(); } x.shadowBlur = 0; x.fillStyle = 'rgba(165,228,248,0.85)';[[3, 3], [11, 3], [7, 7], [3, 11], [11, 11]].forEach((h) => { const px = h[0] / (N - 1) * 1024, py = h[1] / (N - 1) * 1024; x.beginPath(); x.arc(px, py, 6, 0, 7); x.fill(); }); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; }
  function gradTex(forEnv) { const cv = document.createElement('canvas'); cv.width = 16; cv.height = 256; const x = cv.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#1c4c5c'); g.addColorStop(0.42, '#123846'); g.addColorStop(0.76, '#0b232d'); g.addColorStop(1, '#071620'); x.fillStyle = g; x.fillRect(0, 0, 16, 256); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; if (forEnv) t.mapping = THREE.EquirectangularReflectionMapping; return t; }

  return {
    destroy() { over = true; if (rafId) cancelAnimationFrame(rafId); window.removeEventListener('pointerup', onUp); window.removeEventListener('resize', onResize); window.removeEventListener('keydown', onKey); try { if (renderer) { renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss(); } } catch (e) {} host.innerHTML = ''; },
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

    ntkInit() {
      ensureNguTu(this.$store.game.state);
      // deep-link: openNguTu(id) đặt sẵn _ntkOpp trên store
      const pre = this.$store.game._ntkOpp; this.$store.game._ntkOpp = null;
      if (pre) { const o = this.opponents.find((x) => x.id === pre); if (o) this.$nextTick(() => this.challenge(o)); }
      // rời view giữa ván → tháo bàn (tính bỏ ván, không ghi thua)
      this.$watch('$store.game.view', (v) => { if (v !== 'nguTuKy' && this._battle) { try { this._battle.destroy(); } catch (e) {} this._battle = null; this.inBattle = false; } });
    },

    challenge(o) {
      if (this.inBattle) return;
      this.opp = o; this.loadErr = ''; this.loading = true; this.inBattle = true;
      ensureThree().then(() => {
        this.loading = false;
        this.$nextTick(() => this._mount());
      }).catch((e) => { this.loading = false; this.inBattle = false; this.loadErr = String(e && e.message || e); });
    },
    _mount() {
      const host = this.$refs.boardHost;
      if (!host) { this.inBattle = false; return; }
      host.innerHTML = '';
      const g = this.$store.game, o = this.opp;
      this._battle = mountNguTu(host, {
        opponent: { name: o.ten || 'Đối Thủ', art: this.faceOf(o) },
        player: { name: (g.state.player || {}).name || 'Bạn', art: g.avatarSrc },
        difficulty: this.diffOf(o),
        onEnd: (result) => this._recordResult(o.id, result),
        onExit: () => this._exit(),
      });
    },
    _recordResult(id, result) {
      const n = this.ntk; if (!n.rec[id]) n.rec[id] = { w: 0, l: 0 };
      if (result === 1) { n.rec[id].w++; n.wins++; n.kyHon += 12; }
      else if (result === 2) { n.rec[id].l++; }
      try { Storage.save(this.$store.game.state); } catch (e) {}
    },
    _exit() { if (this._battle) { try { this._battle.destroy(); } catch (e) {} this._battle = null; } this.inBattle = false; this.opp = null; },
  };
}
