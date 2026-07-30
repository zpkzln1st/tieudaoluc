// ============================================================
// CỜ VUA (西洋棋) — mini-game 3D (side-content, 0-power)
// Khuôn Cờ Tướng: cách ly tuyệt đối, CHỈ đọc/ghi state.coVua.
// Bàn cờ 3D = WebGL (Three.js, lazy-load src/lib/three.min.js chỉ khi mở).
// LUẬT + AI nằm ở engine THUẦN src/engine/covua.js (không DOM, kiểm bằng perft).
// Phần 3D bê nguyên từ mockup đã chốt LOOK (_mockup/covua_3d.html, chất liệu "Sơn Mài").
// ĐỐI THỦ TÁCH RỜI: hiện là AI; sau cắm PvP online chỉ cần thay nguồn "nước đi đối thủ".
// ============================================================
import { Storage } from './engine/save.js';
import { addKyHon, getKyHon, kyNgheOf } from './engine/kyhon.js';   // Kỳ Hồn + danh hiệu Kỳ Nghệ dùng CHUNG
import { getGocNhin, saveGocNhin, clearGocNhin } from './engine/gocnhin.js';   // góc nhìn bàn cờ, mỗi bàn khoá riêng
import { ganToanMan, nutToanManHTML, capKhung } from './engine/toanman.js';   // phủ kín màn hình + khoá hướng ngang

// Engine luật+AI nạp ĐỘNG (chỉ khi vào ván), KHÔNG import tĩnh:
// import tĩnh mà engine lỗi cú pháp thì VỠ CẢ GAME; nạp động thì hỏng cũng chỉ hỏng riêng Cờ Vua.
let E = null;
function ensureEngine() {
  if (E) return Promise.resolve();
  return import('./engine/covua.js').then((m) => {
    const need = ['initPos', 'clonePos', 'fromFEN', 'toFEN', 'posKey', 'legalMoves', 'doMove', 'inCheck', 'gameOver', 'searchBest'];
    for (const k of need) if (typeof m[k] !== 'function') throw new Error('Engine cờ vua thiếu hàm ' + k + '.');
    E = m;
  });
}

// ---------- ensure/migrate ----------
export function ensureCoVua(state) {
  if (!state.coVua) state.coVua = {};
  const n = state.coVua;
  if (!n.rec) n.rec = {};            // { danhsiId: { w, l } }
  if (n.wins == null) n.wins = 0;
  if (n.game === undefined) n.game = null;   // ván dở (giữ qua F5)
  // Kỳ Hồn dùng CHUNG với Ngũ Tử Kỳ / Cờ Tướng: nguồn duy nhất state.kyHon (engine/kyhon.js).
}

// ---------- lazy-load Three.js ----------
function ensureThree() {
  if (window.THREE) return Promise.resolve();
  if (window._ntkThreeP) return window._ntkThreeP;   // dùng chung promise với các bàn cờ khác (cùng 1 thư viện)
  window._ntkThreeP = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'src/lib/three.min.js';
    s.onload = () => res();
    s.onerror = () => rej(new Error('Không tải được thư viện 3D.'));
    document.head.appendChild(s);
  });
  return window._ntkThreeP;
}

// ---------- CSS ----------
// Tiền tố cv- để không đụng ct- (Cờ Tướng) / ntk- (Ngũ Tử Kỳ).
function injectStyle() {
  if (document.getElementById('cv-style')) return;
  const st = document.createElement('style');
  st.id = 'cv-style';
  st.textContent = `
.cv-root{position:relative;width:100%;max-width:100%;margin:0 auto;aspect-ratio:4/3;max-height:82dvh;border-radius:16px;overflow:hidden;background:#0b0906;box-shadow:0 24px 60px -30px #000;border:1px solid #2e2318;touch-action:none;user-select:none;
  --gold:#e0b45f;--gold2:#f3d9a8;--txt:#f0e6d4;--txt2:#b9ac97;--txt3:#7c705f;--serif:'Lora','Noto Serif SC',Georgia,serif}
.cv-root *{box-sizing:border-box}
.cv-scene{position:absolute;inset:0}
.cv-scene canvas{display:block!important;width:100%!important;height:100%!important}
.cv-vig{position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 140px -20px rgba(6,4,2,.9)}
.cv-fb{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--txt2);text-align:center;padding:20px}
.cv-title{position:absolute;left:16px;top:12px;pointer-events:none;display:flex;align-items:baseline;gap:9px;line-height:1}
.cv-title .hz{font-family:'Ma Shan Zheng',cursive;font-weight:400;font-size:30px;line-height:1;color:var(--gold2);text-shadow:0 2px 20px rgba(224,180,95,.4)}
.cv-title .vz{font-family:var(--serif);font-weight:700;font-size:15px;line-height:1;color:var(--gold2);letter-spacing:.02em;position:relative;top:-1px}
.cv-left{position:absolute;left:12px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:9px;z-index:4}
.cv-b{display:flex;flex-direction:column;align-items:center;gap:3px;color:var(--txt2);cursor:pointer;width:46px}
.cv-b .ic{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(30,22,14,.62);border:1px solid rgba(224,180,95,.28);color:var(--gold);transition:.12s}
.cv-b .ic svg{width:19px;height:19px}
.cv-b span{font-size:9.5px;white-space:nowrap;text-align:center}
.cv-b:hover .ic{border-color:var(--gold2);color:#fff}
.cv-b:active .ic{transform:scale(.92)}
.cv-right{position:absolute;right:12px;top:12px;display:flex;flex-direction:column;gap:8px;align-items:flex-end;pointer-events:none;z-index:4}
.cv-pc{display:flex;align-items:center;gap:9px;width:172px;padding:7px 10px 7px 7px;border-radius:12px;background:linear-gradient(180deg,rgba(38,28,18,.88),rgba(22,16,10,.94));border:1px solid rgba(224,180,95,.22);transition:.18s}
.cv-pc.act{border-color:var(--gold);box-shadow:0 0 18px -6px rgba(224,180,95,.55)}
.cv-pc.wait{filter:grayscale(.3) brightness(.85);border-color:#3a2e20}
.cv-av{width:38px;height:38px;border-radius:9px;flex:none;object-fit:cover;object-position:50% 20%;border:1px solid rgba(224,180,95,.35);background:#241a10}
.cv-pc .nm{font-family:var(--serif);font-size:12.5px;color:#f3ead9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cv-pc .rr{font-size:10px;color:var(--txt3);margin-top:2px;display:flex;align-items:center;gap:5px}
.cv-dot{width:10px;height:10px;border-radius:50%;flex:none;border:1px solid rgba(0,0,0,.5)}
.cv-dot.w{background:radial-gradient(circle at 35% 30%,#fbf6ea,#b9b2a3)}
.cv-dot.k{background:radial-gradient(circle at 35% 30%,#4a4a4a,#0b0b0b)}
.cv-pc.act .rr{color:var(--gold2)}
.cv-toast{position:absolute;left:50%;top:14px;transform:translateX(-50%) translateY(-8px);opacity:0;font-size:12px;color:#f3ead9;background:rgba(24,17,10,.92);border:1px solid rgba(224,180,95,.3);padding:6px 14px;border-radius:99px;pointer-events:none;transition:.2s;z-index:6;max-width:70%;text-align:center}
.cv-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.cv-chk{position:absolute;left:50%;top:52px;transform:translateX(-50%);opacity:0;transition:.2s;font-family:var(--serif);font-weight:700;font-size:15px;letter-spacing:.08em;color:#ffd9d2;background:rgba(150,32,22,.85);border:1px solid rgba(255,140,120,.5);padding:4px 16px;border-radius:99px;pointer-events:none;z-index:6}
.cv-chk.show{opacity:1}
/* Chọn quân phong cấp — chỉ hiện khi tốt của người chơi tới hàng cuối */
.cv-view{position:absolute;left:50%;bottom:16px;transform:translateX(-50%) translateY(12px);opacity:0;pointer-events:none;transition:.16s;z-index:9;display:flex;align-items:center;gap:8px;background:rgba(30,22,14,.95);border:1px solid rgba(224,180,95,.32);border-radius:14px;padding:9px 12px;box-shadow:0 18px 44px -22px #000}
.cv-view.show{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0)}
.cv-view .lb{font-family:var(--serif);font-size:12px;color:var(--txt2);white-space:nowrap}
.cv-view .op{font-family:var(--serif);font-size:12.5px;color:var(--gold2);background:rgba(48,35,22,.8);border:1px solid rgba(224,180,95,.3);border-radius:9px;padding:6px 14px;cursor:pointer;transition:.12s;white-space:nowrap}
.cv-view .op:hover{border-color:var(--gold2);background:rgba(224,180,95,.16);color:#fff}
.cv-promo{position:absolute;left:50%;bottom:16px;transform:translateX(-50%) translateY(12px);opacity:0;pointer-events:none;transition:.16s;z-index:9;display:flex;align-items:center;gap:8px;background:rgba(30,22,14,.95);border:1px solid rgba(224,180,95,.32);border-radius:14px;padding:9px 12px;box-shadow:0 18px 44px -22px #000}
.cv-promo.show{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0)}
.cv-promo .lb{font-family:var(--serif);font-size:12px;color:var(--txt2);white-space:nowrap}
.cv-promo .op{font-family:var(--serif);font-size:12.5px;color:var(--gold2);background:rgba(48,35,22,.8);border:1px solid rgba(224,180,95,.3);border-radius:9px;padding:6px 14px;cursor:pointer;transition:.12s;white-space:nowrap}
.cv-promo .op:hover{border-color:var(--gold2);background:rgba(224,180,95,.16);color:#fff}
.cv-chat{position:absolute;left:50%;bottom:8px;transform:translateX(-50%) translateY(10px);width:min(560px,92%);opacity:0;pointer-events:none;transition:.16s;z-index:8;display:flex;flex-direction:column;gap:7px;background:rgba(30,22,14,.94);border:1px solid rgba(224,180,95,.26);border-radius:14px;padding:9px 10px;box-shadow:0 18px 44px -22px #000}
.cv-chat.show{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0)}
.cv-chat-ps{display:flex;flex-wrap:wrap;gap:5px}
.cv-chip{font-size:11px;color:var(--txt2);background:rgba(48,35,22,.75);border:1px solid rgba(224,180,95,.22);border-radius:99px;padding:4px 10px;cursor:pointer;white-space:nowrap;transition:.12s;font-family:var(--serif)}
.cv-chip:hover{border-color:var(--gold);color:#f3ead9}
.cv-chat-row{display:flex;gap:6px}
.cv-chat-in{flex:1;min-width:0;background:rgba(14,10,6,.85);border:1px solid rgba(224,180,95,.28);border-radius:9px;padding:6px 10px;color:var(--txt);font-size:12.5px;font-family:var(--serif);outline:none;user-select:text;-webkit-user-select:text;touch-action:auto}
.cv-chat-in:focus{border-color:var(--gold)}
.cv-chat-in::placeholder{color:var(--txt3)}
.cv-chat-send{flex:none;padding:6px 15px;border-radius:9px;cursor:pointer;font-size:12px;color:#2a1d04;border:1px solid #f0d78f;background:linear-gradient(180deg,#f6dc9c,#e0b45f);font-family:var(--serif);font-weight:700}
.cv-banner{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(8,5,3,.76);z-index:10;text-align:center;padding:20px}
.cv-banner.show{display:flex}
.cv-end{position:relative;min-width:270px;max-width:90%;padding:24px 30px 20px;border-radius:18px;overflow:hidden;background:linear-gradient(180deg,rgba(40,29,19,.97),rgba(20,14,9,.98));border:1px solid rgba(224,180,95,.2);box-shadow:0 30px 70px -30px #000}
.cv-banner.show .cv-end{animation:cvPop .3s cubic-bezier(.2,.7,.3,1)}
@keyframes cvPop{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}
.cv-end::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,var(--acc,#e0b45f),transparent)}
.cv-end.win{--acc:#f3d9a8}.cv-end.lose{--acc:#9b8d7a}.cv-end.draw{--acc:#8fbf9f}
.cv-banner .bt{font-family:var(--serif);font-weight:700;font-size:29px;letter-spacing:.03em;color:var(--acc,#f3d9a8);text-shadow:0 3px 22px rgba(0,0,0,.5)}
.cv-end-rule{width:60px;height:1px;margin:11px auto 10px;background:linear-gradient(90deg,transparent,var(--acc,#e0b45f),transparent);opacity:.75}
.cv-banner .bs{font-family:var(--serif);font-style:italic;font-size:13px;color:var(--txt2);line-height:1.5;max-width:330px;margin:0 auto}
.cv-end-rw{display:none;margin-top:13px;font-family:var(--serif);font-size:12.5px;font-weight:600;color:#f3d9a8;background:rgba(224,180,95,.13);border:1px solid rgba(224,180,95,.5);border-radius:99px;padding:4px 15px}
.cv-end-rw.show{display:inline-block}
.cv-banner .btns{display:flex;gap:10px;margin-top:18px;justify-content:center}
.cv-banner .gbtn{padding:9px 22px;border-radius:10px;cursor:pointer;font-family:var(--serif);font-weight:600;font-size:14px;letter-spacing:.04em;color:var(--gold2);background:rgba(20,14,9,.5);border:1px solid rgba(224,180,95,.5);transition:background .15s,border-color .15s}
.cv-banner .gbtn:hover{background:rgba(224,180,95,.14);border-color:var(--gold2)}
.cv-banner .gbtn.ghost{color:#d9cfbe;border-color:#463829;background:#1b1410}
/* KHUNG THẤP (điện thoại nằm ngang, kể cả lúc phủ toàn màn hình) — lớp do capKhung() gắn.
   Media query KHÔNG thay được: nó đo màn hình, còn đây phải đo CHÍNH khung bàn.
   Chrome cỡ máy bàn trên khung cao ~330px thì nút to lấn hết bàn cờ. */
.kh-nho .cv-title{left:10px;top:7px}.kh-nho .cv-title .hz{font-size:19px}.kh-nho .cv-title .vz{font-size:11px}
.kh-nho .cv-left{left:8px;gap:6px}.kh-nho .cv-b{width:auto}
.kh-nho .cv-b .ic{width:27px;height:27px}.kh-nho .cv-b .ic svg{width:15px;height:15px}.kh-nho .cv-b span{font-size:8.5px}
.kh-nho .cv-right{right:8px;top:7px;gap:5px}.kh-nho .cv-pc{width:124px;padding:4px 7px 4px 4px}.kh-nho .cv-av{width:26px;height:26px}
.kh-nho .cv-pc .nm{font-size:10.5px}.kh-nho .cv-pc .rr{font-size:9px}
.kh-nho .cv-promo,.kh-nho .cv-view{bottom:10px;gap:6px;padding:6px 9px}.kh-nho .cv-promo .op,.kh-nho .cv-view .op{padding:5px 10px;font-size:11.5px}
.kh-nho .cv-chat{bottom:10px}
@media (max-width:600px){.cv-root{aspect-ratio:5/6;min-height:84dvh;max-height:90dvh}.cv-title{left:10px;top:8px}.cv-title .hz{font-size:22px}.cv-title .vz{font-size:11px}.cv-left{left:0;right:0;bottom:9px;top:auto;transform:none;flex-direction:row;justify-content:center;gap:15px;z-index:5}.cv-b{width:auto}.cv-b .ic{width:40px;height:40px}.cv-b span{font-size:9.5px}.cv-right{right:8px;top:8px;gap:6px}.cv-pc{width:134px;padding:5px 8px 5px 5px}.cv-av{width:30px;height:30px}.cv-pc .nm{font-size:11px}.cv-pc .rr{font-size:9px}.cv-toast{left:10px;top:44px;text-align:left;max-width:calc(100% - 152px);font-size:11px;transform:translateY(-6px)}.cv-toast.show{transform:translateY(0)}.cv-chk{top:78px}.cv-chat{bottom:74px;width:94%}.cv-promo,.cv-view{bottom:74px;gap:6px;padding:8px 10px}.cv-promo .lb,.cv-view .lb{display:none}.cv-promo .op,.cv-view .op{padding:6px 11px;font-size:12px}}
`;
  document.head.appendChild(st);
}

const SVG = {
  eye: '<path d="M2.4 12S6 5.6 12 5.6 21.6 12 21.6 12 18 18.4 12 18.4 2.4 12 2.4 12Z"/><circle cx="12" cy="12" r="3"/>',
  flag: '<path d="M4.5 15s.9-.8 3.8-.8 4.8 1.6 7.6 1.6 3.8-.8 3.8-.8V3.7s-1 .8-3.8.8S14.8 3 12.3 3 8.3 3.7 8.3 3.7"/><path d="M4.5 21.5v-18"/>',
  draw: '<path d="M10 12V6.5a1.5 1.5 0 0 1 3 0V11"/><path d="M13 11V5a1.5 1.5 0 0 1 3 0v6"/><path d="M16 11.5V6.5a1.5 1.5 0 0 1 3 0V13a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.2-1.8l-3-3a1.5 1.5 0 0 1 2.1-2.1L10 14"/><path d="M10 12V8a1.5 1.5 0 0 0-3 0v4.5"/>',
  chat: '<path d="M21 11.6a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-4-1L3.5 20.5 5 15.6A8.4 8.4 0 0 1 12.5 3.2 8.4 8.4 0 0 1 21 11.6Z"/><path d="M8.6 11.6h.01M12.5 11.6h.01M16.4 11.6h.01"/>',
};
function ic(name) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + SVG[name] + '</svg>'; }

// Lời chọn sẵn cho NGƯỜI CHƠI
const PLAYER_PRESETS = [
  'Xin chỉ giáo.', 'Quân trắng đi trước, tại hạ không khách khí đâu.', 'Nước này tiền bối thấy sao?',
  'Danh bất hư truyền, phục thật.', 'Hay! Nước đó tại hạ chịu thua.', 'Để xem ai vây được ai.',
  'Tiền bối đánh thong thả quá nhỉ.', 'Chưa chắc ai hơn ai đâu.', 'Tại hạ đi đây, cẩn thận đấy.',
  'Nước cờ hay, học được rồi.', 'Suýt trúng kế tiền bối rồi.', 'Còn lâu tại hạ mới chịu thua.',
  'Ván sau nhất định gỡ lại.', 'Đánh với cao thủ đúng là khác.', 'Thêm một ván nữa nhé?',
  'Thua tiền bối cũng cam lòng.',
];

export function coVuaLines() { return LINES; }
const LINES = {
  start: [
    'Bàn cờ Tây Dương này lạ mắt, nhưng đạo lý vẫn thế thôi.', 'Các hạ cầm quân trắng, xin mời đi trước.',
    'Cờ nào cũng vậy, cốt ở người cầm quân.', 'Nghe danh đã lâu, hôm nay xin được lĩnh giáo.',
    'Các hạ cứ thong thả, tại hạ chẳng vội đâu.', 'Mời trà đã, rồi hãy thong thả phân cao thấp.',
    'Ba mươi hai quân, sáu mươi tư ô, đủ cả một đời người.', 'Đừng thấy tại hạ hiền mà tưởng dễ ăn.',
    'Khai cuộc thế nào là tuỳ các hạ, tại hạ tiếp hết.', 'Ai thua ván này, ván sau nhớ gỡ lại nhé.',
  ],
  banter: [
    'Nước này đã tính từ lâu, các hạ chậm rồi.', 'Thế cờ thuận tay, tại hạ chưa vội đâu.',
    'Xe của các hạ hở sườn rồi đấy.', 'Mã tại hạ đã cắm vào giữa trận, các hạ liệu hồn.',
    'Tượng đi chéo cả bàn, các hạ có thấy đường nó không?', 'Các hạ giữ tốt quá kỹ, quên mất trung lộ à?',
    'Nghĩ mãi chưa xuống, hay ra dạo một vòng?', 'Nước ấy khéo thật, tại hạ phải chịu.',
    'Các hạ đánh cờ có khí chất, đẹp mắt.', 'Cờ còn dài, các hạ cứ thong thả.',
    'Hậu mà ra sớm quá thì chỉ tổ bị đuổi thôi.', 'Được thì vui, thua thì học, có gì mà ngại.',
    'Từng tấc đất trên bàn cờ đều phải giành.', 'Hai bên cùng vây, xem ai vây chặt hơn.',
    'Tốt của các hạ đi được nửa đường rồi đấy.', 'Ván cờ chưa ngã ngũ, các hạ đừng mừng vội.',
  ],
  press: [
    'Xe hậu đã vào, các hạ đỡ nổi không?', 'Vua các hạ ngồi không yên rồi đấy.',
    'Đường lui của các hạ hẹp dần rồi.', 'Tại hạ đâu vội, cứ ép dần cho các hạ ngộp.',
    'Các hạ chặn bên này thì hở bên kia thôi.', 'Một nước hở thôi là các hạ trắng tay đấy.',
    'Hàng tốt che vua đã thủng, còn gì che nữa?', 'Thế cờ nghiêng cả về đây rồi, các hạ thấy chứ?',
    'Các hạ còn nước nào hay thì tính mau đi.', 'Chiếu! Xem các hạ gỡ thế nào.',
  ],
  defend: [
    'Nước đó hiểm thật, may mà đỡ kịp.', 'Chậm chút nữa là trúng kế các hạ rồi.',
    'Các hạ giấu quân khéo lắm, suýt thì không thấy.', 'Nước cờ sắc bén, đỡ xong vẫn thót tim.',
    'Các hạ ép rất gắt, đành lui một bước.', 'Cao thật, nhưng tại hạ nhìn ra kịp rồi.',
    'Một ly nữa thôi là thua trắng rồi.', 'Thoát rồi, phen này hú vía thật.',
    'Các hạ đánh hiểm, không dám lơ là chút nào.', 'Bàn cờ này chưa ngã ngũ đâu.',
  ],
  win: [
    'Ván này các hạ thua rồi, nhưng chơi cũng đáng gờm.', 'Thế cờ ngã rồi, đa tạ các hạ một ván hay.',
    'Thắng thua là chuyện thường, ván sau lại tiếp.', 'Đa tạ ván cờ, các hạ khiến tại hạ phải dốc sức.',
    'Các hạ đánh hăng thật, tiếc là hăng nhầm chỗ.', 'Ván sau nhớ giữ hàng tốt trước vua cho kỹ.',
    'Nói thật, giữa ván các hạ ép tại hạ toát mồ hôi.', 'Các hạ cầm quân chắc tay, chỉ tiếc thiếu chút may.',
  ],
  lose: [
    'Nước cờ vừa rồi tuyệt thật, tại hạ chịu thua.', 'Các hạ cao tay hơn, tâm phục khẩu phục.',
    'Tính thiếu một nước, thành ra bại cả bàn.', 'Gặp được cao thủ như các hạ cũng là cái duyên.',
    'Bàn sau tại hạ gỡ lại, các hạ chờ đấy.', 'Các hạ vây kín bốn phía, hết đường xoay xở.',
    'Tay cờ của các hạ, quả nhiên danh bất hư truyền.', 'Cờ hay đến vậy, thua cũng cam lòng.',
  ],
  draw: [
    'Ván này hòa rồi, kẻ tám lạng người nửa cân.', 'Tiếc thật, cả bàn cờ mà không phân nổi cao thấp.',
    'Hòa cờ cũng là một cái duyên đấy chứ.', 'Còn cờ còn đó, hẹn các hạ lần sau phân bại.',
    'Đánh với các hạ, hòa cũng thấy đáng công.', 'Lần sau tái chiến, xin các hạ đừng nhường tay.',
  ],
  reply: [
    'Nghe cũng vui tai, nhưng bàn cờ vẫn còn đợi đấy.', 'Vừa đánh vừa trò chuyện, mới ra cái thú tao nhã.',
    'Hàn huyên gì thì hàn, đừng quên bên trên bàn cờ.', 'Trò chuyện cho vui thôi, thắng thua vẫn ở tay cờ.',
    'Chuyện gẫu thì để mai, bàn cờ đang gấp lắm đấy.', 'Kể tiếp đi, tại hạ vừa nghe vừa tính đường vây.',
    'Vui thì vui, mà đến lượt hạ quân của các hạ rồi.', 'Nghe các hạ kể, suýt nữa quên mất cả lượt cờ.',
  ],
};

// ============================================================
// mountCoVua(host, opts) -> { destroy(), resize() }
//   opts.opponent {name, art} · opts.player {name, art} · opts.difficulty 0..1
//   opts.onEnd(result) 1 thắng · 2 thua · 0 hòa (góc NGƯỜI CHƠI, cầm TRẮNG)
//   opts.onMove({fen, hist}) · opts.onExit()
// ============================================================
function mountCoVua(host, opts) {
  injectStyle();
  const THREE = window.THREE;
  const opp = opts.opponent || { name: 'Đối Thủ', art: '' };
  const pl = opts.player || { name: 'Bạn', art: '' };

  host.innerHTML =
    '<div class="cv-root">' +
      '<div class="cv-scene"></div><div class="cv-vig"></div>' +
      '<div class="cv-fb"><div>Không khởi tạo được 3D trên máy này.</div><div class="fm" style="font-size:12px;color:#7c705f"></div></div>' +
      '<div class="cv-title"><span class="hz">西洋棋</span><span class="vz">Cờ Vua</span></div>' +
      '<div class="cv-left">' +
        nutToanManHTML('cv') +
        '<span class="cv-b" data-a="spectate"><span class="ic">' + ic('eye') + '</span><span>Quan Chiến</span></span>' +
        '<span class="cv-b" data-a="resign"><span class="ic">' + ic('flag') + '</span><span>Nhận Thua</span></span>' +
        '<span class="cv-b" data-a="draw"><span class="ic">' + ic('draw') + '</span><span>Cầu Hòa</span></span>' +
        '<span class="cv-b" data-a="chat"><span class="ic">' + ic('chat') + '</span><span>Trò Chuyện</span></span>' +
      '</div>' +
      '<div class="cv-right">' +
        '<div class="cv-pc wait" data-c="ai"><img class="cv-av" alt="" src="' + opp.art + '" onerror="this.style.visibility=\'hidden\'"><div><div class="nm">' + opp.name + '</div><div class="rr"><span class="cv-dot k"></span><span class="rs">Chờ</span></div></div></div>' +
        '<div class="cv-pc act" data-c="you"><img class="cv-av" alt="" src="' + pl.art + '" onerror="this.style.visibility=\'hidden\'"><div><div class="nm">' + pl.name + '</div><div class="rr"><span class="cv-dot w"></span><span class="rs">Đang đi…</span></div></div></div>' +
      '</div>' +
      '<div class="cv-toast"></div>' +
      '<div class="cv-chk">C H I Ế U</div>' +
      '<div class="cv-view"><span class="lb">Xoay bàn tới góc bạn thích</span>' +
        '<span class="op" data-a="saveview">Khoá Góc Nhìn</span><span class="op" data-a="resetview">Về Mặc Định</span></div>' +
      '<div class="cv-promo"><span class="lb">Tốt phong thành</span>' +
        '<span class="op" data-p="Q">Hậu</span><span class="op" data-p="R">Xe</span>' +
        '<span class="op" data-p="B">Tượng</span><span class="op" data-p="N">Mã</span></div>' +
      '<div class="cv-chat">' +
        '<div class="cv-chat-ps"></div>' +
        '<div class="cv-chat-row"><input class="cv-chat-in" type="text" maxlength="60" autocomplete="off" placeholder="Nhập lời muốn nói…"><button class="cv-chat-send">Gửi</button></div>' +
      '</div>' +
      '<div class="cv-banner"><div class="cv-end"><div class="bt"></div><div class="cv-end-rule"></div><div class="bs"></div><div class="cv-end-rw"></div><div class="btns"><span class="gbtn" data-a="again">Chơi Lại</span><span class="gbtn ghost" data-a="exit">Về</span></div></div></div>' +
    '</div>';

  const root = host.firstElementChild;
  const $ = (s) => root.querySelector(s);
  const scEl = $('.cv-scene');
  // Toàn màn hình: phủ CHÍNH thẻ gốc nên vào là mất sạch thanh đầu trang / sidebar / banner.
  const tm = ganToanMan(host, () => onResize());   // phủ THẺ BỌC NGOÀI, xem chú thích ở binh.js
  const fb = (msg) => { const d = $('.cv-fb'); d.style.display = 'flex'; if (msg) d.querySelector('.fm').textContent = msg; };

  // ---- kích thước bàn (1 ô = 1 đơn vị, theo mockup đã chốt) ----
  const MG = 0.86, WU = 8 + MG * 2, HU = 8 + MG * 2, TH = 0.56, TOPY = TH / 2;
  const WX = (c) => c - 3.5, WZ = (r) => 3.5 - r;   // r=0 là hàng đáy TRẮNG (phía người chơi)

  // ---- state ván ----
  const HUMAN_W = true;                 // người chơi luôn cầm TRẮNG, đi trước
  let pos = null, over = false, saidN = 0, repHist = [];
  let sel = null, hints = [], pieceMesh = {}, anims = [], pendingPromo = null;
  let renderer, scene, camera, boardGroup, raycaster, pointer, rayPlane, particles = null, rafId = 0;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Camera có ĐÍCH riêng + GIẢM CHẤN: kéo 1:1 rồi dừng phắt là thứ làm cảm giác "cứng",
  // ở đây camera luôn ĐUỔI THEO đích nên vẫn mượt. CỐ Ý KHÔNG có quán tính —
  // thả tay là dừng đúng chỗ đã thả (user chê kiểu trượt thêm một đoạn).
  const SPH0 = { r: 15, theta: 0, phi: 0.60 };
  let sph = { r: 15, theta: 0, phi: 0.60 }, tgt = { r: 15, theta: 0, phi: 0.60 };
  let target, dragging = false, movedFlag = false, lastX = 0, lastY = 0, autorot = false, ret = null;
  // THẾ HỆ ván: mỗi lần dựng ván mới / kết ván / tháo bàn là tăng 1. Mọi setTimeout đều mang theo số
  // thế hệ lúc hẹn, khác số hiện tại là bỏ qua -> hẹn giờ của ván cũ không đi quân vào ván mới.
  let van = 0;
  const hen = (f, ms) => { const v = van; setTimeout(() => { if (v === van && !over) f(v); }, ms); };
  let lockView = opts.view || null;     // góc người chơi đã khoá RIÊNG cho bàn này, null = tự canh
  let fitR = 15;                        // khoảng cách VỪA KHUNG ở cỡ màn hiện tại — mốc quy đổi mức phóng
  let firstFit = true;                  // lần khớp khung ĐẦU TIÊN phải đặt thẳng, không giảm chấn
  let pieceMatW, pieceMatB, feltMat, selRing, hintGeo, hintMat, shGeo, shMat;
  const GEO = {};                       // hình học DÙNG CHUNG cho 32 quân (đừng dựng lại mỗi quân)

  let _lastLine = '';
  function pick(arr) { if (!arr || !arr.length) return ''; let s, n = 0; do { s = arr[(Math.random() * arr.length) | 0]; n++; } while (s === _lastLine && n < 5); _lastLine = s; return s; }
  function bossSay(cat) { const l = pick(LINES[cat]); if (l) toast(opp.name + ': 「' + l + '」'); }

  function W() { return scEl.clientWidth || 720; }
  function H() { return scEl.clientHeight || 450; }

  // ---------- nhiễu + gỗ (theo mockup đã chốt) ----------
  const NG = 128, NGRID = (function () { const g = new Float32Array(NG * NG); for (let i = 0; i < NG * NG; i++) g[i] = Math.random(); return g; })();
  function nz(x, y) {
    let ix = Math.floor(x), iy = Math.floor(y); const fx = x - ix, fy = y - iy;
    ix = ((ix % NG) + NG) % NG; iy = ((iy % NG) + NG) % NG;
    const ix1 = (ix + 1) % NG, iy1 = (iy + 1) % NG;
    const v00 = NGRID[iy * NG + ix], v10 = NGRID[iy * NG + ix1], v01 = NGRID[iy1 * NG + ix], v11 = NGRID[iy1 * NG + ix1];
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const a = v00 + (v10 - v00) * ux, b = v01 + (v11 - v01) * ux;
    return a + (b - a) * uy;
  }
  // pal = [r0,g0,b0, dr,dg,db] : màu tối -> sáng
  function woodCanvas(w, h, pal, ringScale) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d');
    const img = x.createImageData(w, h), D = img.data; let i = 0; const RING = h / (5.0 * (ringScale || 1));
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
      const wp = (nz(xx * 0.010, y * 0.05) - 0.5) * 40 + (nz(xx * 0.045, y * 0.16) - 0.5) * 12;
      const rc = (y + wp) / RING, t = rc - Math.floor(rc);
      let band = t < 0.5 ? t * 2 : (1 - t) * 2; band = band * band * (3 - 2 * band);
      const pc = (y + wp) / 5.5, pt = pc - Math.floor(pc);
      const pore = pt < 0.28 ? (1 - pt / 0.28) : 0;
      const fib = nz(xx * 0.6, y * 0.014);
      let m = 0.30 + band * 0.42 + (fib - 0.5) * 0.24 - pore * 0.26;
      if (m < 0) m = 0; else if (m > 1) m = 1;
      const mn = (Math.random() - 0.5) * 4;
      D[i++] = pal[0] + m * pal[3] + mn; D[i++] = pal[1] + m * pal[4] + mn * 0.6; D[i++] = pal[2] + m * pal[5] + mn * 0.5; D[i++] = 255;
    }
    x.putImageData(img, 0, 0); return cv;
  }
  function roundedRectShape(w, h, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  // ---------- mặt bàn: 64 ô khảm xen kẽ + VIỀN KHẢM vàng ----------
  function boardTopTex() {
    const s = 118, w = Math.round(WU * s), h = Math.round(HU * s);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d');
    const frame = woodCanvas(512, 512, [46, 26, 16, 58, 36, 24], 0.6);
    for (let ty = 0; ty < h; ty += 512) for (let tx = 0; tx < w; tx += 512) x.drawImage(frame, tx, ty);
    // mỗi ô lấy 1 vùng NGẪU NHIÊN của tấm gỗ -> vân từng ô khác nhau như khảm thật
    const dark = woodCanvas(512, 512, [64, 36, 20, 62, 40, 26], 0.8);
    const light = woodCanvas(512, 512, [176, 140, 92, 62, 46, 30], 0.8);
    const S = s, off = Math.round(MG * s);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const src = ((r + c) % 2 === 0) ? dark : light;
      const sx = Math.floor(Math.random() * (512 - S)), sy = Math.floor(Math.random() * (512 - S));
      x.drawImage(src, sx, sy, S, S, off + c * S, off + r * S, S, S);
    }
    const GOLD = '#c8a45c', GOLD2 = '#e6c98a';
    const x0 = off, y0 = off, x1 = off + 8 * S, y1 = off + 8 * S;
    x.strokeStyle = GOLD2; x.lineWidth = Math.max(1.5, s * 0.018); x.strokeRect(x0 - s * 0.02, y0 - s * 0.02, (x1 - x0) + s * 0.04, (y1 - y0) + s * 0.04);
    const bw = s * 0.34, bx0 = x0 - s * 0.30, by0 = y0 - s * 0.30, bx1 = x1 + s * 0.30, by1 = y1 + s * 0.30;
    x.strokeStyle = GOLD; x.lineWidth = Math.max(1.2, s * 0.012); x.strokeRect(bx0 - bw, by0 - bw, (bx1 - bx0) + bw * 2, (by1 - by0) + bw * 2);
    x.strokeRect(bx0, by0, bx1 - bx0, by1 - by0);
    x.fillStyle = 'rgba(226,201,138,.85)';
    const step = s * 0.42, dr = s * 0.085, cy0 = by0 - bw / 2, cy1 = by1 + bw / 2, cx0 = bx0 - bw / 2, cx1 = bx1 + bw / 2;
    const diamond = (px, py) => { x.beginPath(); x.moveTo(px, py - dr); x.lineTo(px + dr, py); x.lineTo(px, py + dr); x.lineTo(px - dr, py); x.closePath(); x.fill(); };
    for (let px = bx0 - bw / 2; px <= bx1 + bw / 2 + 1; px += step) { diamond(px, cy0); diamond(px, cy1); }
    for (let py = by0 - bw / 2; py <= by1 + bw / 2 + 1; py += step) { diamond(cx0, py); diamond(cx1, py); }
    const t = new THREE.CanvasTexture(cv); t.anisotropy = 8; t.encoding = THREE.sRGBEncoding; return t;
  }
  function envTex() {
    const cv = document.createElement('canvas'); cv.width = 32; cv.height = 256; const x = cv.getContext('2d');
    x.fillStyle = '#0c0d10'; x.fillRect(0, 0, 32, 256);
    // Dải sáng để '#b9bec6' chứ KHÔNG phải trắng: env quá chói sẽ kéo quân đen thành xám.
    const g = x.createLinearGradient(0, 14, 0, 80); g.addColorStop(0, '#131519'); g.addColorStop(.45, '#b9bec6'); g.addColorStop(1, '#131519');
    x.fillStyle = g; x.fillRect(0, 14, 32, 66);
    const t = new THREE.CanvasTexture(cv); t.mapping = THREE.EquirectangularReflectionMapping; t.encoding = THREE.sRGBEncoding; return t;
  }
  function domeTex(top, upper, mid, floorC) {
    const cv = document.createElement('canvas'); cv.width = 32; cv.height = 256; const x = cv.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, top); g.addColorStop(.34, upper); g.addColorStop(.72, mid); g.addColorStop(1, floorC);
    x.fillStyle = g; x.fillRect(0, 0, 32, 256);
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t;
  }
  function radialTex(inner, mid, stopMid) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d');
    const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, inner); g.addColorStop(stopMid || 0.55, mid); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(cv);
  }
  function dotTex() { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,240,214,1)'); g.addColorStop(.4, 'rgba(240,200,140,.5)'); g.addColorStop(1, 'rgba(240,200,140,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); }

  // ---------- QUÂN CỜ kiểu Staunton (bê nguyên tỉ lệ đã chốt ở mockup) ----------
  // MẤU CHỐT ĐỘ HOÀN THIỆN: nội suy SPLINE rồi lấy mẫu thay vì nối thẳng điểm điều khiển.
  // Nối thẳng -> silhouette gãy khúc, nhìn ra "đồ chơi". Cái quyết định là CÓ nội suy spline,
  // KHÔNG phải lấy mẫu dày cỡ nào.
  //
  // ⚠ ĐỘ MỊN PHẢI CHỊU ĐƯỢC 32 QUÂN CÙNG LÚC. Mockup chỉ đứng yên nên để 170 điểm × 96 cạnh cũng
  // không sao; vào game có hoạt ảnh thì đo được 1.219.522 tam giác/khung (Cờ Tướng chỉ 38.448)
  // và bản đồ bóng vẽ lại toàn cảnh lần hai -> GIẬT. Nay 80 × 44: mỗi cạnh 8,2° trên quân rộng
  // chưa tới 1 ô, mắt không thấy khác, mà nhẹ đi ~4,7 lần.
  const PROF_PTS = 80, LATHE_SEG = 44;
  function lathe(prof, seg) {
    const v = prof.map((p) => new THREE.Vector2(p[0], p[1]));
    const pts = new THREE.SplineCurve(v).getPoints(PROF_PTS);
    for (let i = 0; i < pts.length; i++) if (pts[i].x < 0.0006) pts[i].x = 0.0006;   // spline có thể vọt qua trục
    return new THREE.LatheGeometry(pts, seg || LATHE_SEG);
  }
  // Tỉ lệ Staunton thi đấu: đế BÈ (vua ~0.8 ô đường kính, tốt ~0.5 ô) VÀ thân CAO (cao/đk vua ~1.9).
  // Từ đế phải LOE CONG HÌNH CHUÔNG lên eo (concave) — thiếu nó thì ra cái nấm hoặc cây tăm.
  const PROF = {
    P: [[0, 0], [0.245, 0], [0.245, 0.032], [0.236, 0.052], [0.206, 0.066], [0.166, 0.092], [0.136, 0.128],
        [0.116, 0.178], [0.104, 0.240], [0.100, 0.310], [0.104, 0.372], [0.118, 0.418], [0.140, 0.452],
        [0.156, 0.474], [0.136, 0.492], [0.108, 0.506], [0.092, 0.530], [0.090, 0.556], [0.0006, 0.560]],
    R: [[0, 0], [0.275, 0], [0.275, 0.034], [0.266, 0.056], [0.234, 0.072], [0.192, 0.100], [0.164, 0.140],
        [0.150, 0.190], [0.144, 0.250], [0.142, 0.330], [0.144, 0.430], [0.150, 0.500], [0.164, 0.556],
        [0.186, 0.596], [0.206, 0.624], [0.196, 0.646], [0.182, 0.658], [0.200, 0.678], [0.224, 0.700],
        [0.232, 0.730], [0.0006, 0.734]],
    N: [[0, 0], [0.275, 0], [0.275, 0.034], [0.266, 0.056], [0.234, 0.072], [0.194, 0.100], [0.168, 0.140],
        [0.156, 0.186], [0.152, 0.236], [0.158, 0.282], [0.172, 0.320], [0.184, 0.348], [0.0006, 0.352]],
    B: [[0, 0], [0.272, 0], [0.272, 0.034], [0.263, 0.056], [0.231, 0.072], [0.190, 0.100], [0.162, 0.140],
        [0.144, 0.190], [0.132, 0.256], [0.128, 0.330], [0.134, 0.404], [0.148, 0.466], [0.170, 0.516],
        [0.192, 0.552], [0.174, 0.578], [0.148, 0.594], [0.160, 0.620], [0.180, 0.648], [0.164, 0.676],
        [0.138, 0.700], [0.146, 0.746], [0.156, 0.810], [0.148, 0.884], [0.124, 0.958], [0.090, 1.026],
        [0.050, 1.080], [0.022, 1.116], [0.0006, 1.130]],
    Q: [[0, 0], [0.330, 0], [0.330, 0.038], [0.320, 0.062], [0.284, 0.080], [0.236, 0.112], [0.202, 0.156],
        [0.180, 0.212], [0.164, 0.286], [0.158, 0.370], [0.162, 0.456], [0.176, 0.532], [0.198, 0.596],
        [0.222, 0.644], [0.204, 0.676], [0.176, 0.696], [0.190, 0.728], [0.212, 0.760], [0.194, 0.792],
        [0.166, 0.818], [0.180, 0.874], [0.210, 0.950], [0.238, 1.024], [0.252, 1.080], [0.222, 1.112],
        [0.198, 1.132], [0.0006, 1.140]],
    K: [[0, 0], [0.372, 0], [0.372, 0.040], [0.361, 0.066], [0.322, 0.086], [0.268, 0.120], [0.230, 0.168],
        [0.204, 0.230], [0.186, 0.310], [0.178, 0.400], [0.182, 0.492], [0.196, 0.574], [0.220, 0.642],
        [0.246, 0.694], [0.226, 0.728], [0.196, 0.750], [0.210, 0.784], [0.232, 0.818], [0.214, 0.850],
        [0.186, 0.878], [0.200, 0.936], [0.230, 1.014], [0.258, 1.090], [0.272, 1.148], [0.240, 1.182],
        [0.214, 1.204], [0.0006, 1.212]],
  };
  const BASE_R = { P: 0.245, R: 0.275, N: 0.275, B: 0.272, Q: 0.330, K: 0.372 };
  const KSC = 1.376;
  // Mặt trước đầu ngựa (ức -> hàm -> mõm -> trán -> hai tai)
  const KFRONT = [[0.045, 0.000], [0.108, 0.040], [0.128, 0.110], [0.120, 0.170], [0.150, 0.212], [0.196, 0.196],
                  [0.240, 0.212], [0.262, 0.252], [0.258, 0.310], [0.232, 0.372], [0.180, 0.425], [0.115, 0.455],
                  [0.060, 0.470], [0.030, 0.520], [0.005, 0.480], [-0.045, 0.545], [-0.055, 0.470]];
  const KNAPE = [[-0.100, 0.462], [-0.150, 0.420], [-0.185, 0.350], [-0.190, 0.250], [-0.150, 0.120], [-0.085, 0.000]];
  // Đầu ngựa: MỘT bóng cắt liền, cong mượt. GIỮ ĐƠN GIẢN — không bờm sợi, không mắt/mũi/miệng rời.
  function knightShape(sc) {
    const pts = KFRONT.concat(KNAPE).map((p) => new THREE.Vector2(p[0] * sc, p[1] * sc));
    const s = new THREE.Shape();
    s.moveTo(pts[0].x, pts[0].y);
    s.splineThru(pts.slice(1));
    s.closePath();
    return s;
  }
  // TIẾT DIỆN VỒNG: vát chiếm phần lớn bề dày -> nhìn ngang không ra tấm bìa.
  // ⚠ bevelSize PHẢI nhỏ hơn 1/2 chi tiết nhỏ nhất (tai rộng ~0.069): vát 0.052 sẽ ĂN MẤT tai/mõm.
  const KD = 0.075, KBT = 0.055, KBS = 0.026;

  // Dựng TRƯỚC toàn bộ hình học dùng chung — 32 quân chỉ tham chiếu lại, không dựng lại lathe 32 lần.
  function buildGeo() {
    GEO.body = {}; GEO.felt = {}; GEO.bead = {}; GEO.bead2 = {};
    for (const t in PROF) {
      GEO.body[t] = lathe(PROF[t]);
      const fr = BASE_R[t] * 0.93;
      GEO.felt[t] = new THREE.CylinderGeometry(fr, fr, 0.016, LATHE_SEG);
      // vòng chỉ tiện chỉ dày 0,011 — tiết diện 8 mặt là quá đủ, 12×48 chỉ tổ nặng
      GEO.bead[t] = new THREE.TorusGeometry(BASE_R[t] * 0.995, 0.011, 8, LATHE_SEG);
      if (t === 'Q' || t === 'K') GEO.bead2[t] = new THREE.TorusGeometry(BASE_R[t] * 0.74, 0.009, 8, LATHE_SEG);
    }
    const kg = new THREE.ExtrudeGeometry(knightShape(KSC), { depth: KD, bevelEnabled: true, bevelThickness: KBT, bevelSize: KBS, bevelSegments: 5, curveSegments: 14 });
    kg.translate(0, 0, -(KD / 2 + KBT));
    GEO.knight = kg;
    GEO.pawnTop = new THREE.SphereGeometry(0.118, 24, 16);
    GEO.rookMerlon = new THREE.BoxGeometry(0.088, 0.102, 0.072);
    GEO.bishopTop = new THREE.SphereGeometry(0.050, 18, 12);
    GEO.queenPt = new THREE.SphereGeometry(0.048, 14, 10);
    GEO.queenTop = new THREE.SphereGeometry(0.058, 18, 12);
    GEO.kingBand = new THREE.CylinderGeometry(0.216, 0.216, 0.052, 48);
    GEO.kingCrossV = new THREE.BoxGeometry(0.058, 0.215, 0.058);
    GEO.kingCrossH = new THREE.BoxGeometry(0.168, 0.058, 0.058);
  }
  // ⚠ CHỈ THÂN QUÂN (và đầu mã) ĐỔ BÓNG. Cho từng chi tiết nhỏ đổ bóng thì 32 quân sinh 151 vật
  // đổ bóng -> bản đồ bóng phải vẽ lại TOÀN CẢNH lần thứ hai mỗi khung, giật thấy rõ. Bóng của
  // chỏm tốt / chấu vương miện / thánh giá dù sao cũng nằm gọn trong bóng của chính thân quân.
  function makePiece(t, white) {
    const mat = white ? pieceMatW : pieceMatB;
    const g = new THREE.Group();
    const body = new THREE.Mesh(GEO.body[t], mat);
    body.castShadow = true; body.receiveShadow = true; g.add(body);
    const felt = new THREE.Mesh(GEO.felt[t], feltMat);       // đế nỉ xanh — chi tiết bộ sưu tầm
    felt.position.y = 0.008; g.add(felt);
    if (t === 'P') {
      const hd = new THREE.Mesh(GEO.pawnTop, mat); hd.position.y = 0.660; g.add(hd);
    } else if (t === 'R') {                                   // xe: 8 lỗ châu mai trên vành
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        const m = new THREE.Mesh(GEO.rookMerlon, mat);
        m.position.set(Math.cos(a) * 0.180, 0.785, Math.sin(a) * 0.180); m.rotation.y = -a; g.add(m);
      }
    } else if (t === 'B') {
      const b1 = new THREE.Mesh(GEO.bishopTop, mat); b1.position.y = 1.158; g.add(b1);
    } else if (t === 'Q') {                                   // hậu: vương miện 9 chấu + chỏm
      for (let j = 0; j < 9; j++) {
        const aj = j / 9 * Math.PI * 2;
        const q = new THREE.Mesh(GEO.queenPt, mat);
        q.position.set(Math.cos(aj) * 0.208, 1.174, Math.sin(aj) * 0.208); g.add(q);
      }
      const qt = new THREE.Mesh(GEO.queenTop, mat); qt.position.y = 1.196; g.add(qt);
    } else if (t === 'K') {                                   // vua: vành mũ + thánh giá
      const band = new THREE.Mesh(GEO.kingBand, mat); band.position.y = 1.240; g.add(band);
      const k1 = new THREE.Mesh(GEO.kingCrossV, mat); k1.position.y = 1.372; g.add(k1);
      const k2 = new THREE.Mesh(GEO.kingCrossH, mat); k2.position.y = 1.396; g.add(k2);
    } else if (t === 'N') {                                   // mã: đầu quay về phía đối phương
      const hm = new THREE.Mesh(GEO.knight, mat);
      hm.castShadow = true; hm.receiveShadow = true;          // đầu mã CÓ đổ bóng: bóng nó thò ra khỏi thân
      hm.position.y = 0.330; hm.rotation.y = white ? Math.PI / 2 : -Math.PI / 2; g.add(hm);
    }
    // vòng chỉ tiện ở chân đế — làm quân "ra hàng tiện" thay vì khối đúc
    const bd = new THREE.Mesh(GEO.bead[t], mat); bd.rotation.x = Math.PI / 2; bd.position.y = 0.036; g.add(bd);
    if (GEO.bead2[t]) { const b2 = new THREE.Mesh(GEO.bead2[t], mat); b2.rotation.x = Math.PI / 2; b2.position.y = 0.078; g.add(b2); }
    return g;
  }

  function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W(), H());
    renderer.outputEncoding = THREE.sRGBEncoding;
    // Tổng sáng phải giữ thấp: màu trắng 0.72 × tổng đèn 1.50 = 1.08. Vượt ~1.35 là trắng cháy bệt.
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scEl.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x15110e);
    camera = new THREE.PerspectiveCamera(36, W() / H(), 0.1, 200);
    target = new THREE.Vector3(0, 0, 0); updCam();
    try { const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(envTex()).texture; } catch (e) {}

    scene.add(new THREE.HemisphereLight(0xfff3e6, 0x2b2622, 0.22));
    const key = new THREE.DirectionalLight(0xfff8f0, 1.10); key.position.set(6, 15, 8); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); const sc = key.shadow.camera; sc.near = 1; sc.far = 56; sc.left = -9; sc.right = 9; sc.top = 10; sc.bottom = -10; key.shadow.bias = -0.0005; scene.add(key);
    const fill = new THREE.DirectionalLight(0xf0eee9, 0.18); fill.position.set(-9, 7, -6); scene.add(fill);
    const rimA = new THREE.PointLight(0xffca86, 0.30, 26); rimA.position.set(-6.5, 2.4, 6.5); scene.add(rimA);

    // phông vô cực (KHÔNG nhận sáng, tránh vệt ngang chỗ sàn cong) + sàn riêng chỉ-bóng
    const dp = []; const R0 = 20, RC = 13, WT = 60;
    for (let i = 0; i <= 14; i++) dp.push(new THREE.Vector2(R0 * i / 14, 0));
    for (let i = 1; i <= 20; i++) { const a = (Math.PI / 2) * (i / 20); dp.push(new THREE.Vector2(R0 + RC * Math.sin(a), RC - RC * Math.cos(a))); }
    for (let i = 1; i <= 6; i++) dp.push(new THREE.Vector2(R0 + RC, RC + (WT - RC) * (i / 6)));
    const dome = new THREE.Mesh(new THREE.LatheGeometry(dp, 72), new THREE.MeshBasicMaterial({ map: domeTex('#15110E', '#221C18', '#332B24', '#3E342C'), side: THREE.DoubleSide, fog: false }));
    dome.position.y = -TH / 2 - 0.002; scene.add(dome);
    const sfloor = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.ShadowMaterial({ opacity: 0.40 }));
    sfloor.rotation.x = -Math.PI / 2; sfloor.position.y = -TH / 2 - 0.001; sfloor.receiveShadow = true; scene.add(sfloor);
    const uglow = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), new THREE.MeshBasicMaterial({ map: radialTex('rgba(235,168,92,.85)', 'rgba(235,168,92,.26)'), transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
    uglow.rotation.x = -Math.PI / 2; uglow.position.y = -TH / 2 + 0.012; scene.add(uglow);

    boardGroup = new THREE.Group(); scene.add(boardGroup);
    const sideTex = new THREE.CanvasTexture(woodCanvas(512, 512, [46, 26, 16, 58, 36, 24], 0.55));
    sideTex.encoding = THREE.sRGBEncoding; sideTex.wrapS = sideTex.wrapT = THREE.RepeatWrapping; sideTex.repeat.set(0.11, 0.11);
    const BEV = 0.07, RCn = 0.26;
    const slabGeo = new THREE.ExtrudeGeometry(roundedRectShape(WU, HU, RCn), { depth: TH - BEV * 2, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: 4, curveSegments: 20 });
    slabGeo.rotateX(-Math.PI / 2); slabGeo.translate(0, -(TH / 2 - BEV), 0);
    const slab = new THREE.Mesh(slabGeo, new THREE.MeshPhysicalMaterial({ map: sideTex, roughness: .55, metalness: 0, clearcoat: .28, clearcoatRoughness: .5, envMapIntensity: .3 }));
    slab.castShadow = true; slab.receiveShadow = true; boardGroup.add(slab);
    const topGeo = new THREE.ShapeGeometry(roundedRectShape(WU - BEV * 2, HU - BEV * 2, RCn - BEV), 20);
    const tp = topGeo.attributes.position, tu = topGeo.attributes.uv;
    for (let vi = 0; vi < tp.count; vi++) tu.setXY(vi, (tp.getX(vi) + WU / 2) / WU, (tp.getY(vi) + HU / 2) / HU);
    tu.needsUpdate = true;
    const topM = new THREE.Mesh(topGeo, new THREE.MeshPhysicalMaterial({ map: boardTopTex(), roughness: .38, metalness: 0, clearcoat: .5, clearcoatRoughness: .3, envMapIntensity: .35 }));
    topM.rotation.x = -Math.PI / 2; topM.position.y = TOPY + 0.002; topM.receiveShadow = true; boardGroup.add(topM);

    // Chất liệu "Sơn Mài" (bộ đã chốt). Màu ở KHÔNG GIAN TUYẾN TÍNH: bên đen phải đặt rất tối
    // (0x1a1a1a sẽ render ra xám nhạt), bên trắng giữ dưới ~0.72 kẻo cháy mất khối.
    pieceMatW = new THREE.MeshPhysicalMaterial({ color: 0xb8b4ab, roughness: .26, metalness: 0, clearcoat: .90, clearcoatRoughness: .07, envMapIntensity: .30 });
    pieceMatB = new THREE.MeshPhysicalMaterial({ color: 0x030303, roughness: .22, metalness: 0, clearcoat: .95, clearcoatRoughness: .05, envMapIntensity: .22 });
    feltMat = new THREE.MeshStandardMaterial({ color: 0x0d2415, roughness: .98, metalness: 0 });
    buildGeo();

    shGeo = new THREE.CircleGeometry(0.50, 28);
    shMat = new THREE.MeshBasicMaterial({ map: radialTex('rgba(18,10,6,.5)', 'rgba(18,10,6,.34)', 0.62), transparent: true, depthWrite: false });
    hintGeo = new THREE.CircleGeometry(0.14, 20);
    hintMat = new THREE.MeshBasicMaterial({ color: 0x8fe3c0, transparent: true, opacity: 0.75, depthWrite: false });
    selRing = new THREE.Mesh(new THREE.RingGeometry(0.40, 0.46, 40), new THREE.MeshBasicMaterial({ color: 0xf3d9a8, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }));
    selRing.rotation.x = -Math.PI / 2; selRing.visible = false; boardGroup.add(selRing);

    if (!reduce) { try { particles = makeParticles(); scene.add(particles); } catch (e) {} }

    rayPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(TOPY));
    raycaster = new THREE.Raycaster(); pointer = new THREE.Vector2();
    const el = renderer.domElement;
    el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove);
    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onCancel);
    window.addEventListener('resize', onResize); window.addEventListener('keydown', onKey);
    root.querySelectorAll('.cv-b,[data-a]').forEach((b) => b.addEventListener('click', () => act(b.getAttribute('data-a'))));
    root.querySelectorAll('.cv-promo .op').forEach((b) => b.addEventListener('click', () => choosePromo(b.getAttribute('data-p'))));
    const sendB = $('.cv-chat-send'), chatIn = $('.cv-chat-in');
    if (sendB) sendB.addEventListener('click', sendChat);
    if (chatIn) chatIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendChat(); } });
  }
  function makeParticles() {
    const n = 46, geo = new THREE.BufferGeometry(), arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { arr[i * 3] = (Math.random() - .5) * 17; arr[i * 3 + 1] = Math.random() * 8; arr[i * 3 + 2] = (Math.random() - .5) * 17; }
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({ size: .075, map: dotTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffdca8, opacity: .4, sizeAttenuation: true }));
  }

  // ---------- dựng quân từ thế cờ ----------
  function key(c, r) { return c + '_' + r; }
  function dropMesh(k) {
    const m = pieceMesh[k]; if (!m) return;
    boardGroup.remove(m.g); boardGroup.remove(m.sh); delete pieceMesh[k];
  }
  function buildPieces() {
    for (const k in pieceMesh) if (Object.prototype.hasOwnProperty.call(pieceMesh, k)) { boardGroup.remove(pieceMesh[k].g); boardGroup.remove(pieceMesh[k].sh); }
    pieceMesh = {};
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = pos.b[r][c]; if (p) addPieceMesh(c, r, p.t, p.w); }
  }
  function addPieceMesh(c, r, t, white) {
    const sh = new THREE.Mesh(shGeo, shMat); sh.rotation.x = -Math.PI / 2; sh.position.set(WX(c), TOPY + 0.004, WZ(r)); boardGroup.add(sh);
    const g = makePiece(t, white); g.position.set(WX(c), TOPY, WZ(r)); boardGroup.add(g);
    pieceMesh[key(c, r)] = { g, sh, t, w: white };
  }
  // Dời mesh theo nước đi. Nhập thành / bắt tốt qua đường / phong cấp đều suy ra được từ THẾ CỜ TRƯỚC
  // khi đi + bản thân nước đi, nên view không cần engine trả thêm gì.
  function applyMoveMesh(mv, info) {
    if (info.capAt) dropMesh(key(info.capAt.c, info.capAt.r));
    const from = key(mv.fc, mv.fr), to = key(mv.tc, mv.tr);
    const m = pieceMesh[from];
    if (!m) return;
    delete pieceMesh[from]; pieceMesh[to] = m;
    // Phong cấp: thay hẳn mesh khi bay tới nơi. PHẢI soi lại ô đích còn đúng con tốt vừa bay tới không —
    // hoạt ảnh chạy trễ ~10 khung, trong khoảng đó ô đó có thể đã sang tay quân khác.
    const done = mv.p ? () => {
      if (pieceMesh[to] !== m) return;
      dropMesh(to);
      addPieceMesh(mv.tc, mv.tr, mv.p, m.w);
    } : null;
    anims.push({ m, x0: WX(mv.fc), z0: WZ(mv.fr), x1: WX(mv.tc), z1: WZ(mv.tr), t: 0, done });
    if (info.rook) {                                  // nhập thành: xe đi kèm
      const rf = key(info.rook.fc, info.rook.fr), rt = key(info.rook.tc, info.rook.tr);
      const rm = pieceMesh[rf];
      if (rm) {
        delete pieceMesh[rf]; pieceMesh[rt] = rm;
        anims.push({ m: rm, x0: WX(info.rook.fc), z0: WZ(info.rook.fr), x1: WX(info.rook.tc), z1: WZ(info.rook.tr), t: 0, done: null });
      }
    }
  }
  // Đọc thế cờ TRƯỚC khi đi để biết nước này ăn ở ô nào / có kéo theo xe không.
  function moveInfo(mv) {
    const p = pos.b[mv.fr][mv.fc];
    const info = { capAt: null, rook: null };
    if (!p) return info;
    if (pos.b[mv.tr][mv.tc]) info.capAt = { c: mv.tc, r: mv.tr };
    else if (p.t === 'P' && mv.fc !== mv.tc) info.capAt = { c: mv.tc, r: mv.fr };     // bắt tốt qua đường
    if (p.t === 'K' && Math.abs(mv.tc - mv.fc) === 2) {
      const kingSide = mv.tc > mv.fc;
      info.rook = kingSide
        ? { fc: 7, fr: mv.fr, tc: 5, tr: mv.fr }
        : { fc: 0, fr: mv.fr, tc: 3, tr: mv.fr };
    }
    return info;
  }

  // ---------- gợi ý nước đi ----------
  function clearHints() { hints.forEach((h) => boardGroup.remove(h)); hints = []; selRing.visible = false; sel = null; }
  function showHints(c, r) {
    clearHints();
    const ms = E.legalMoves(pos).filter((m) => m.fc === c && m.fr === r);
    if (!ms.length) return false;
    sel = { c, r, moves: ms };
    selRing.position.set(WX(c), TOPY + 0.006, WZ(r)); selRing.visible = true;
    const seen = {};
    ms.forEach((m) => {
      const kk = key(m.tc, m.tr); if (seen[kk]) return; seen[kk] = 1;   // 4 nước phong cấp cùng 1 ô -> 1 chấm
      const cap = !!pos.b[m.tr][m.tc] || (pos.b[r][c].t === 'P' && m.fc !== m.tc);
      const h = new THREE.Mesh(hintGeo, cap ? hintMat.clone() : hintMat);
      if (cap) { h.material.color.setHex(0xe8836e); h.scale.set(1.9, 1.9, 1.9); }
      h.rotation.x = -Math.PI / 2; h.position.set(WX(m.tc), TOPY + 0.006, WZ(m.tr));
      boardGroup.add(h); hints.push(h);
    });
    return true;
  }

  // ---------- lượt đi ----------
  function applyMove(mv) {
    const info = moveInfo(mv);
    E.doMove(pos, mv);
    applyMoveMesh(mv, info);
    if (pos.half === 0) repHist.length = 0;    // nước không hoàn nguyên -> thế cũ không bao giờ lặp lại nữa
    repHist.push(E.posKey(pos));
  }
  function repCount() {
    const k = repHist.length ? repHist[repHist.length - 1] : '';
    let n = 0; for (let i = 0; i < repHist.length; i++) if (repHist[i] === k) n++;
    return n;
  }
  function playerMove(mv) {
    if (over) return;
    applyMove(mv);
    clearHints();
    afterMove();
    if (!over) hen(aiTurn, 420);
  }
  // ⚠ HAI CHỐT, thiếu cái nào cũng chết: `v !== van` chặn hẹn giờ của VÁN CŨ (bấm Chơi Lại giữa lúc
  // đối thủ đang chờ đi), còn `pos.w === HUMAN_W` chặn AI cướp lượt của người chơi.
  function aiTurn(v) {
    if (over || v !== van || pos.w === HUMAN_W) return;
    const wasCheck = E.inCheck(pos);           // AI có đang BỊ chiếu không (để chọn câu "đỡ đòn")
    let mv = null;
    // ĐỘ KHÓ TỐI ĐA: để engine làm sâu dần, chỉ chặn bằng thời gian; KHÔNG nhiễu ngẫu nhiên.
    try { mv = E.searchBest(pos, { depth: 24, timeMs: 2200, rand: 0 }); } catch (e) { mv = null; }
    if (over || v !== van) return;             // ván có thể đã kết thúc trong lúc máy nghĩ (nhận thua / rời view)
    if (!mv) { const ms = E.legalMoves(pos); mv = ms.length ? ms[(Math.random() * ms.length) | 0] : null; }
    if (!mv) return endGame(1, 'Đối thủ hết nước đi.');
    applyMove(mv);
    afterMove();
    if (!over) maybeBossSay(wasCheck);
  }
  function afterMove() {
    turnUI();
    const checked = E.inCheck(pos);            // bên SẮP đi có bị chiếu không
    const chk = $('.cv-chk'); if (chk) chk.classList.toggle('show', !!checked);
    const res = E.gameOver(pos, repCount());
    if (res) {
      let r = 0;
      if (res.winner === true) r = HUMAN_W ? 1 : 2;
      else if (res.winner === false) r = HUMAN_W ? 2 : 1;
      return endGame(r, res.note || '');
    }
    persist();
  }
  function maybeBossSay(wasCheck) {
    if (saidN >= 4 || Math.random() > 0.34) return; saidN++;
    let cat = 'banter';
    if (E.inCheck(pos)) cat = 'press'; else if (wasCheck) cat = 'defend';
    bossSay(cat);
  }

  // ---------- phong cấp ----------
  function askPromo(moves) {
    pendingPromo = moves;
    const chat = $('.cv-chat'); if (chat) chat.classList.remove('show');   // hai bảng cùng nằm đáy giữa
    $('.cv-promo').classList.add('show');
  }
  function choosePromo(p) {
    const moves = pendingPromo; pendingPromo = null;
    $('.cv-promo').classList.remove('show');
    if (!moves) return;
    const mv = moves.find((m) => m.p === p) || moves[0];
    playerMove(mv);
  }

  function endGame(result, why) {
    over = true; van++; clearHints();
    stopSpectate(false);                        // kẹt Quan Chiến qua màn kết thì ván sau bấm không ăn
    pendingPromo = null; $('.cv-promo').classList.remove('show');
    const chk = $('.cv-chk'); if (chk) chk.classList.remove('show');
    const b = $('.cv-banner'), end = b.querySelector('.cv-end'), bt = b.querySelector('.bt'), bs = b.querySelector('.bs'), rw = b.querySelector('.cv-end-rw');
    end.classList.remove('win', 'lose', 'draw'); rw.classList.remove('show');
    const q = (cat) => opp.name + ': 「' + pick(LINES[cat]) + '」';
    if (result === 1) { end.classList.add('win'); bt.textContent = 'Bạn Thắng!'; bs.textContent = (why ? why + ' ' : '') + q('lose'); rw.textContent = 'Kỳ Hồn +20'; rw.classList.add('show'); }
    else if (result === 2) { end.classList.add('lose'); bt.textContent = 'Bạn Thua'; bs.textContent = (why ? why + ' ' : '') + q('win'); }
    else { end.classList.add('draw'); bt.textContent = 'Hòa Cờ'; bs.textContent = (why ? why + ' ' : '') + q('draw'); }
    b.classList.add('show');
    try { if (opts.onEnd) opts.onEnd(result); } catch (e) {}
  }

  function resetGame(saved) {
    van++;                                      // sang THẾ HỆ ván mới -> mọi hẹn giờ của ván cũ tự hết hiệu lực
    const rp = (saved && saved.fen) ? E.fromFEN(saved.fen) : null;   // khôi phục ván dở nếu có
    pos = rp || E.initPos();
    repHist = (rp && Array.isArray(saved.hist)) ? saved.hist.slice() : [E.posKey(pos)];
    over = false; saidN = 0; anims = []; pendingPromo = null;
    stopSpectate(false);                        // ván mới phải chạm được quân ngay
    clearHints(); buildPieces();
    $('.cv-banner').classList.remove('show');
    $('.cv-promo').classList.remove('show');
    const chk = $('.cv-chk'); if (chk) chk.classList.remove('show');
    turnUI();
    if (rp) {
      toast('Tiếp tục ván dở');
      if (pos.w !== HUMAN_W) hen(aiTurn, 700);  // đang tới lượt đối thủ
    } else {
      hen(() => bossSay('start'), 750);
    }
  }
  function persist() {   // lưu sau MỖI nước để F5 / rời view vẫn vào lại được
    try { if (opts.onMove) opts.onMove({ fen: E.toFEN(pos), hist: repHist.slice() }); } catch (e) {}
  }

  function turnUI() {
    const you = $('[data-c="you"]'), ai = $('[data-c="ai"]');
    const myTurn = (pos.w === HUMAN_W);
    if (myTurn) { you.classList.add('act'); you.classList.remove('wait'); ai.classList.remove('act'); ai.classList.add('wait'); }
    else { ai.classList.add('act'); ai.classList.remove('wait'); you.classList.remove('act'); you.classList.add('wait'); }
    you.querySelector('.rs').textContent = myTurn ? 'Đang đi…' : 'Chờ';
    ai.querySelector('.rs').textContent = myTurn ? 'Chờ' : 'Đang tính…';
  }
  function toast(t) { const el = $('.cv-toast'); el.textContent = t; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 1800); }
  function sayPlayer(text) { const t = String(text || '').trim(); if (!t) return; toast(pl.name + ': 「' + t + '」'); if (!over && Math.random() < 0.5) hen(() => bossSay('reply'), 850); }
  function sendChat() { const inp = $('.cv-chat-in'); if (!inp) return; sayPlayer(inp.value); inp.value = ''; }
  function fillPresets() {
    const box = $('.cv-chat-ps'); if (!box) return;
    const pool = PLAYER_PRESETS.slice(), pk = [];
    for (let i = 0; i < 5 && pool.length; i++) pk.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
    box.innerHTML = pk.map(() => '<span class="cv-chip"></span>').join('');
    box.querySelectorAll('.cv-chip').forEach((c, i) => { c.textContent = pk[i]; c.addEventListener('click', () => sayPlayer(pk[i])); });
  }
  function onKey(e) {
    if (e.key !== 'Escape') return;
    if (pendingPromo) { e.preventDefault(); pendingPromo = null; $('.cv-promo').classList.remove('show'); return; }
    const box = $('.cv-chat');
    if (box && box.classList.contains('show')) { e.preventDefault(); box.classList.remove('show'); const inp = $('.cv-chat-in'); if (inp) inp.blur(); }
  }

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
    const chat = $('.cv-chat'); if (chat) chat.classList.remove('show');
    if (pendingPromo) { pendingPromo = null; $('.cv-promo').classList.remove('show'); }
    $('.cv-view').classList.add('show');
    toast('Quan Chiến — kéo, lăn chuột hoặc chụm hai ngón để chỉnh bàn');
  }
  // ⚠ PHẢI gọi cả ở endGame/resetGame: bỏ sót thì ván mới vẫn kẹt autorot=true,
  // mà onUp chỉ gọi tapBoard khi !autorot -> bàn cờ bấm không ăn, nhìn như game chết.
  function stopSpectate(noiGi) {
    if (!autorot) return;
    autorot = false;
    const bar = $('.cv-view'); if (bar) bar.classList.remove('show');
    normTheta();
    ret = 1; tgt.theta = SPH0.theta; tgt.phi = SPH0.phi; tgt.r = SPH0.r;   // giảm chấn tự đưa về
    if (noiGi) toast(lockView ? 'Đã cố định — đưa bàn về góc nhìn đã khoá' : 'Đã cố định — đưa bàn về góc nhìn ban đầu');
  }

  function act(a) {
    if (a === 'resign') { if (!over) endGame(2, 'Các hạ nhận thua.'); }
    else if (a === 'draw') { if (!over) { toast(opp.name + ': "Được, hòa vậy."'); hen(() => endGame(0, ''), 700); } }
    else if (a === 'spectate') { if (autorot) stopSpectate(true); else startSpectate(); }
    // Khoá góc: ghi TỈ LỆ phóng (r / khoảng cách vừa khung) chứ không ghi r — đổi cỡ màn thì
    // khoảng cách vừa khung tính lại, nhân tỉ lệ này vào là ra đúng góc đã khoá.
    else if (a === 'saveview') {
      // Phải đo lại khoảng cách vừa khung THEO GÓC NGẨNG VỪA CHỈNH: fitR đang giữ số của góc ngẩng
      // lúc khớp khung gần nhất, lấy nó chia ra thì tỉ lệ phóng ghi vào save sẽ lệch.
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
      normTheta();                                  // gỡ số vòng đã xoay, kẻo camera quay ngược cả vòng
      onResize();                                   // tính lại góc tự canh
      ret = 1; tgt.theta = SPH0.theta; tgt.phi = SPH0.phi; tgt.r = SPH0.r;
      toast('Đã bỏ khoá — bàn cờ trở lại góc mặc định');
    }
    else if (a === 'chat') {
      const box = $('.cv-chat'); if (!box) return;
      const show = !box.classList.contains('show');
      if (show && autorot) stopSpectate(false);     // hai bảng cùng nằm đáy giữa -> chỉ mở MỘT
      box.classList.toggle('show', show);
      if (show) { fillPresets(); const inp = $('.cv-chat-in'); if (inp) setTimeout(() => inp.focus(), 40); }
    }
    else if (a === 'again') resetGame();
    else if (a === 'exit') { try { if (opts.onExit) opts.onExit(); } catch (e) {} }
  }

  // ⚠ PHẢI theo dõi TỪNG NGÓN: dùng chung một cặp lastX/lastY thì ngón thứ hai chạm xuống sẽ ghi đè,
  // rồi dx tính bằng hiệu toạ độ với ngón KIA -> bàn giật loạn khi chạm hai ngón trên điện thoại.
  const ngon = {};                       // pointerId -> {x, y}
  let dragId = -1, pinch0 = 0, pinchR0 = 0;
  function twoIds() { const k = Object.keys(ngon); return k.length >= 2 ? k.slice(0, 2) : null; }
  function pinchDist() { const k = twoIds(); if (!k) return 0; const a = ngon[k[0]], b = ngon[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
  function zoomTo(r) { const lo = fitR * 0.62, hi = fitR * 1.55; tgt.r = Math.max(lo, Math.min(hi, r)); }
  function onDown(e) {
    ngon[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (twoIds() && autorot) { pinch0 = pinchDist(); pinchR0 = tgt.r; dragging = false; movedFlag = true; return; }
    if (dragId >= 0) return;             // đã có ngón đang kéo -> bỏ qua ngón sau
    dragId = e.pointerId; dragging = true; movedFlag = false; lastX = e.clientX; lastY = e.clientY;
    const el = renderer.domElement; if (el.setPointerCapture) { try { el.setPointerCapture(e.pointerId); } catch (er) {} }
  }
  function onMove(e) {
    if (ngon[e.pointerId]) { ngon[e.pointerId].x = e.clientX; ngon[e.pointerId].y = e.clientY; }
    if (twoIds() && autorot) {           // chụm/giãn hai ngón -> phóng/thu
      const d = pinchDist();
      if (pinch0 > 8 && d > 8) { ret = null; zoomTo(pinchR0 * (pinch0 / d)); }
      return;
    }
    if (!dragging || e.pointerId !== dragId) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 4) movedFlag = true;
    lastX = e.clientX; lastY = e.clientY;
    if (!autorot) return;
    ret = null;
    // Đích đi theo tay 1:1; cái mượt là do giảm chấn ở animate() ĐUỔI THEO đích,
    // KHÔNG phải quán tính -> nhấc tay lên là bàn đứng lại ngay chỗ đó.
    tgt.theta -= dx * 0.0060; tgt.phi = clampPhi(tgt.phi - dy * 0.0050);
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
  function clampPhi(p) { return Math.max(0.16, Math.min(1.18, p)); }
  function tapBoard(e) {
    if (over || pos.w !== HUMAN_W || pendingPromo) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const pt = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(rayPlane, pt)) return;
    const c = Math.round(pt.x + 3.5), r = Math.round(3.5 - pt.z);
    if (c < 0 || c > 7 || r < 0 || r > 7) return;
    if (sel) {
      const ms = sel.moves.filter((m) => m.tc === c && m.tr === r);
      if (ms.length > 1) { clearHints(); return askPromo(ms); }     // 4 lựa chọn phong cấp
      if (ms.length === 1) return playerMove(ms[0]);
    }
    const p = pos.b[r][c];
    if (p && p.w === HUMAN_W) { showHints(c, r); return; }
    clearHints();
  }

  function updCam() { camera.position.set(target.x + sph.r * Math.sin(sph.phi) * Math.sin(sph.theta), target.y + sph.r * Math.cos(sph.phi), target.z + sph.r * Math.sin(sph.phi) * Math.cos(sph.theta)); camera.lookAt(target); }
  // Khớp khung: kiểm CẢ 6 mép bàn LẪN 6 đỉnh quân hàng cuối — thiếu vế sau thì cụt ngọn vua (cao ~1.42 ô).
  const PTOP = 1.52;
  // ⚠ PHẢI tính cả GÓC XOAY NGANG: xoay bàn 45° thì bề ngang nhìn thấy nở ra tới 1,41 lần.
  // Bản đầu bỏ qua theta nên góc khoá chéo bị cắt mất hai góc bàn.
  // Xoay camera đi theta = xoay BÀN đi -theta rồi đo như lúc theta = 0.
  function fits(r, phi, fovY, fovX, theta) {
    const cy = r * Math.cos(phi), cz = r * Math.sin(phi);
    const dy = -Math.cos(phi), dz = -Math.sin(phi);
    const hw = WU / 2, hd = HU / 2, m = 0.995;
    const ct = Math.cos(theta || 0), st = Math.sin(theta || 0);
    const pts = [];
    for (let i = 0; i < 6; i++) pts.push([(i % 3 === 0) ? -hw : ((i % 3 === 1) ? 0 : hw), TOPY, (i < 3) ? -hd : hd]);
    for (let i = 0; i < 6; i++) pts.push([(i % 3 === 0) ? -3.5 : ((i % 3 === 1) ? 0 : 3.5), TOPY + PTOP, (i < 3) ? -3.5 : 3.5]);
    // 4 góc bàn: xoay chéo thì chính hai góc này lòi ra trước
    [[-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd]].forEach((q) => pts.push([q[0], TOPY, q[1]]));
    for (let i = 0; i < pts.length; i++) {
      const px = pts[i][0] * ct - pts[i][2] * st, pz = pts[i][0] * st + pts[i][2] * ct;
      const vy = pts[i][1] - cy, vz = pz - cz;
      const fwd = vy * dy + vz * dz;
      if (fwd <= 0.01) return false;
      const uy = vy - fwd * dy, uz = vz - fwd * dz;
      if (Math.atan2(Math.sqrt(uy * uy + uz * uz), fwd) > fovY / 2 * m) return false;
      if (Math.atan2(Math.abs(px), fwd) > fovX / 2 * m) return false;
    }
    return true;
  }
  // Khoảng cách VỪA KHUNG cho một góc ngẩng/xoay bất kỳ (dùng khi khoá góc, không chỉ lúc resize).
  let _fovY = 0.6283, _fovX = 0.6283;
  function fitAt(phi, theta) {
    let lo = 7, hi = 42;
    for (let i = 0; i < 26; i++) { const mid = (lo + hi) / 2; if (fits(mid, phi, _fovY, _fovX, theta === undefined ? sph.theta : theta)) hi = mid; else lo = mid; }
    return hi;
  }
  function onResize() {
    if (!renderer) return;
    capKhung(root);                     // khung thấp -> chrome rút gọn (xem engine/toanman.js)
    const w = W(), h = H(); renderer.setSize(w, h);
    const ar = w / h, portrait = ar < 1.05;
    // Mobile: CHỪA dải TRÊN (thẻ tên) + dải DƯỚI (hàng nút) để bàn không đè lên chúng.
    const BTN = portrait ? 72 : 0, TOP = portrait ? 86 : 0;
    const uh = Math.max(80, h - BTN - TOP), a = w / uh;
    camera.aspect = a;
    // Góc KHOÁ (nếu người chơi đã khoá) đè lên góc tự canh — nhưng khoảng cách vẫn phải tính lại
    // theo khung THẬT rồi mới nhân tỉ lệ phóng, không thì đổi cỡ màn là bàn lòi ra ngoài.
    const G = lockView;
    const phi = G ? G.phi : (portrait ? Math.max(0.34, 0.60 - (1.05 - ar) * 0.50) : 0.60);
    const theta = G ? G.theta : 0;
    SPH0.phi = phi; SPH0.theta = theta;
    _fovY = camera.fov * Math.PI / 180; _fovX = 2 * Math.atan(Math.tan(_fovY / 2) * a);
    const truoc = fitR;                                           // mốc cũ, để giữ nguyên mức phóng khi đổi khung
    fitR = fitAt(phi, theta);                                     // khoảng cách VỪA KHUNG ở khung MỚI
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
    camera.updateProjectionMatrix();
    camera.setViewOffset(w, uh, 0, -TOP, w, h);
    updCam();
    // ⚠ CÂN DỌC. fits() chỉ bảo đảm bàn LỌT khung, KHÔNG bảo đảm nằm GIỮA: mép gần chiếu to hơn
    // mép xa nên hộp bao luôn bị đẩy lệch. Đo hộp bao THẬT trên màn rồi dịch khung bù lại.
    // Tăng offsetY thì nội dung dâng LÊN.
    const lech = ndcGiua();
    if (isFinite(lech) && Math.abs(lech) > 0.002) { camera.setViewOffset(w, uh, 0, -TOP + lech * h / 2, w, h); updCam(); }
  }
  // Tâm dọc hộp bao (bàn + ĐỈNH QUÂN) trên màn, đơn vị NDC (-1 = đỉnh khung, +1 = đáy khung).
  // NaN khi chưa đo được (điểm ra sau lưng camera) -> bên gọi bỏ qua, không dịch bừa.
  function ndcGiua() {
    if (!camera) return NaN;
    camera.updateMatrixWorld();
    const hw = WU / 2, hd = HU / 2, v = new THREE.Vector3();
    const pts = [];
    [[-hw, -hd], [0, -hd], [hw, -hd], [-hw, hd], [0, hd], [hw, hd], [-hw, 0], [hw, 0]].forEach((q) => pts.push([q[0], TOPY, q[1]]));
    [-3.5, 0, 3.5].forEach((x) => [-3.5, 3.5].forEach((z) => pts.push([x, TOPY + PTOP, z])));   // đỉnh quân hàng cuối
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < pts.length; i++) {
      v.set(pts[i][0], pts[i][1], pts[i][2]).project(camera);
      const y = -v.y;
      if (!isFinite(y) || Math.abs(y) > 5) return NaN;
      if (y < lo) lo = y; if (y > hi) hi = y;
    }
    return (lo + hi) / 2;
  }
  function animate() {
    rafId = requestAnimationFrame(animate);
    // camera ĐUỔI THEO đích (giảm chấn) -> mọi thao tác đều mềm, không giật
    const k = 0.16, dt = tgt.theta - sph.theta, dp = tgt.phi - sph.phi, drr = tgt.r - sph.r;
    if (Math.abs(dt) > 1e-5 || Math.abs(dp) > 1e-5 || Math.abs(drr) > 1e-4) {
      sph.theta += dt * k; sph.phi += dp * k; sph.r += drr * k * 0.9; updCam();
    } else if (ret) ret = null;
    if (anims.length) {
      for (let i = anims.length - 1; i >= 0; i--) {
        const a = anims[i]; a.t = Math.min(1, a.t + 0.11);
        const e = 1 - Math.pow(1 - a.t, 3);
        const x = a.x0 + (a.x1 - a.x0) * e, z = a.z0 + (a.z1 - a.z0) * e;
        const lift = Math.sin(Math.PI * a.t) * 0.20;
        a.m.g.position.set(x, TOPY + lift, z);
        a.m.sh.position.set(x, TOPY + 0.004, z);
        if (a.t >= 1) { const d = a.done; anims.splice(i, 1); if (d) d(); }
      }
    }
    if (particles) { const pa = particles.geometry.attributes.position, ar = pa.array; for (let i = 1; i < ar.length; i += 3) { ar[i] += 0.0032; if (ar[i] > 8.2) ar[i] = -0.3; } pa.needsUpdate = true; }
    renderer.render(scene, camera);
  }

  // KHỞI ĐỘNG PHẢI Ở CUỐI: init() dùng NG/NGRID/PROF (const) — gọi sớm hơn dòng khai báo sẽ vướng vùng chết tạm thời.
  try { init(); resetGame(opts.saved); animate(); } catch (e) { fb(String(e && e.message || e)); return { destroy() {}, resize() {} }; }
  setTimeout(onResize, 120); setTimeout(onResize, 500);

  return {
    destroy() {
      over = true; van++; if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onCancel);
      tm.destroy();                     // rời bàn mà còn phủ màn hình là kẹt ở màn đen
      window.removeEventListener('resize', onResize); window.removeEventListener('keydown', onKey);
      try { if (renderer) { renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss(); } } catch (e) {}
      host.innerHTML = '';
    },
    resize() { onResize(); },
  };
}

// ============================================================
// Alpine factory — view "Cờ Vua"
// ============================================================
export function coVua() {
  return {
    _battle: null,
    inBattle: false,
    loading: false,
    loadErr: '',
    opp: null,
    get cv() { return this.$store.game.state.coVua; },
    get kyHon() { return getKyHon(this.$store.game.state); },
    get kyNgheState() { return kyNgheOf(this.$store.game.state); },
    get opponents() { try { return (this.$store.game.danhSiBang || []).slice(); } catch (e) { return []; } },
    recOf(id) { const r = (this.cv.rec || {})[id]; return r ? (r.w + ' Thắng ' + r.l + ' Bại') : 'Chưa đấu'; },
    diffOf(o) { const rp = (o && o.rankPower) || 500; return Math.max(0.2, Math.min(1, (rp - 400) / 620)); },
    diffLabel(o) { const d = this.diffOf(o); return d < 0.35 ? 'Dễ' : d < 0.6 ? 'Vừa' : d < 0.8 ? 'Khó' : 'Cao Thủ'; },
    faceOf(o) { return (o && o.face) || ('images/danhsi/' + (o && o.id) + '.webp'); },
    get tiers() {
      const g = { 'Cao Thủ': [], 'Khó': [], 'Vừa': [], 'Dễ': [] };
      this.opponents.forEach((o) => { const t = this.diffLabel(o); if (g[t]) g[t].push(o); });
      const col = { 'Cao Thủ': '#e6c079', 'Khó': '#f0997b', 'Vừa': '#5dcaa5', 'Dễ': '#97c459' };
      return ['Cao Thủ', 'Khó', 'Vừa', 'Dễ'].filter((t) => g[t].length).map((t) => ({ name: t, color: col[t], list: g[t] }));
    },

    // ---- ván dở: giữ qua F5 / rời view giữa chừng ----
    get savedGame() { const g = this.cv && this.cv.game; return (g && g.fen && g.oppId) ? g : null; },
    get savedOpp() { const g = this.savedGame; return g ? this.opponents.find((x) => x.id === g.oppId) : null; },
    resumeSaved() { const o = this.savedOpp; if (o) this.challenge(o, this.savedGame); },
    dropSaved() { if (this.cv) this.cv.game = null; try { Storage.save(this.$store.game.state); } catch (e) {} },

    cvInit() {
      ensureCoVua(this.$store.game.state);
      const pre = this.$store.game._cvOpp; this.$store.game._cvOpp = null;
      if (pre) { const o = this.opponents.find((x) => x.id === pre); if (o) this.$nextTick(() => this.challenge(o)); }
      // ⚠ ĐỪNG đặt điều kiện `&& this._battle`: rời view TRONG LÚC còn đang tải Three.js thì _battle
      // vẫn null, watcher bỏ qua, rồi _mount() chạy muộn trên host đã bị gỡ khỏi DOM -> dựng hẳn một
      // WebGLRenderer + vòng requestAnimationFrame + listener window KHÔNG AI huỷ được. Lặp vài lần
      // là hết ngữ cảnh WebGL, MỌI bàn cờ 3D báo lỗi cho tới khi tải lại trang.
      this.$watch('$store.game.view', (v) => {
        if (v === 'coVua') return;
        this._boSo = true;                       // ván đang tải: đánh dấu để _mount() đến muộn tự huỷ
        if (this._battle) { try { this._battle.destroy(); } catch (e) {} this._battle = null; }
        this.inBattle = false; this.loading = false;
      });
    },
    challenge(o, saved) {
      if (this.inBattle) return;
      this._boSo = false;
      this.opp = o; this._saved = saved || null; this.loadErr = ''; this.loading = true; this.inBattle = true;
      Promise.all([ensureThree(), ensureEngine()]).then(() => { this.loading = false; this.$nextTick(() => this._mount()); })
        .catch((e) => { this.loading = false; this.inBattle = false; this.loadErr = String(e && e.message || e); });
    },
    _mount() {
      // Rời view giữa lúc tải xong -> KHÔNG dựng bàn nữa (xem chú thích ở cvInit).
      if (this._boSo || this.$store.game.view !== 'coVua') { this._boSo = false; this.inBattle = false; return; }
      const host = this.$refs.boardHost;
      if (!host) { this.inBattle = false; return; }
      host.innerHTML = '';
      const g = this.$store.game, o = this.opp;
      this._battle = mountCoVua(host, {
        opponent: { name: o.ten || 'Đối Thủ', art: this.faceOf(o) },
        player: { name: (g.state.player || {}).name || 'Bạn', art: g.avatarSrc },
        difficulty: 1,   // TẤT CẢ Danh Sĩ đánh ở mức cao nhất (nhãn tầng chỉ còn là lore theo rank)
        saved: this._saved,
        view: getGocNhin(g.state, 'coVua'),          // góc nhìn đã khoá RIÊNG của bàn này
        onSaveView: (v) => { const r = saveGocNhin(g.state, 'coVua', v); try { Storage.save(g.state); } catch (e) {} return r; },
        onResetView: () => { clearGocNhin(g.state, 'coVua'); try { Storage.save(g.state); } catch (e) {} },
        onMove: (snap) => this._persist(o.id, snap),
        onEnd: (result) => this._recordResult(o.id, result),
        onExit: () => this._exit(),
      });
      this._saved = null;
    },
    _persist(id, snap) {
      const n = this.cv; if (!n) return;
      n.game = { oppId: id, fen: snap.fen, hist: snap.hist };
      try { Storage.save(this.$store.game.state); } catch (e) {}
    },
    _recordResult(id, result) {
      const n = this.cv; if (!n.rec[id]) n.rec[id] = { w: 0, l: 0 };
      n.game = null;   // ván đã xong -> bỏ bản lưu dở
      if (result === 1) { n.rec[id].w++; n.wins++; addKyHon(this.$store.game.state, 20); try { this.$store.game.checkTitles(); } catch (e) {} }
      else if (result === 2) { n.rec[id].l++; }
      try { Storage.save(this.$store.game.state); } catch (e) {}
    },
    _exit() { if (this._battle) { try { this._battle.destroy(); } catch (e) {} this._battle = null; } this.inBattle = false; this.opp = null; },
  };
}
