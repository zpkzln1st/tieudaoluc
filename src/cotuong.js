// ============================================================
// CỜ TƯỚNG (象棋) — mini-game 3D (side-content, 0-power)
// Khuôn Ngũ Tử Kỳ: cách ly tuyệt đối, CHỈ đọc/ghi state.coTuong.
// Bàn cờ 3D = WebGL (Three.js, lazy-load src/lib/three.min.js chỉ khi mở).
// LUẬT + AI nằm ở engine THUẦN src/engine/cotuong.js (không DOM, dễ kiểm).
// ĐỐI THỦ TÁCH RỜI: hiện là AI; sau cắm PvP online chỉ cần thay nguồn "nước đi đối thủ".
// ============================================================
import { Storage } from './engine/save.js';
import { addKyHon, getKyHon, kyNgheOf } from './engine/kyhon.js';   // Kỳ Hồn + danh hiệu Kỳ Nghệ dùng CHUNG với Ngũ Tử Kỳ
import { getGocNhin, saveGocNhin, clearGocNhin } from './engine/gocnhin.js';   // góc nhìn bàn cờ, mỗi bàn khoá riêng
import { ganToanMan, nutToanManHTML, capKhung } from './engine/toanman.js';   // phủ kín màn hình + khoá hướng ngang

// Engine luật+AI nạp ĐỘNG (chỉ khi vào ván), KHÔNG import tĩnh:
// import tĩnh mà engine lỗi cú pháp thì VỠ CẢ GAME; nạp động thì hỏng cũng chỉ hỏng riêng Cờ Tướng.
let initBoard, legalMoves, doMove, inCheck, searchBest;
function ensureEngine() {
  if (initBoard) return Promise.resolve();
  return import('./engine/cotuong.js').then((m) => {
    initBoard = m.initBoard; legalMoves = m.legalMoves; doMove = m.doMove; inCheck = m.inCheck; searchBest = m.searchBest;
    if (!initBoard || !legalMoves || !doMove || !inCheck || !searchBest) throw new Error('Engine cờ tướng thiếu hàm.');
  });
}

// ---------- ensure/migrate ----------
export function ensureCoTuong(state) {
  if (!state.coTuong) state.coTuong = {};
  const n = state.coTuong;
  if (!n.rec) n.rec = {};            // { danhsiId: { w, l } }
  if (n.wins == null) n.wins = 0;
  if (n.game === undefined) n.game = null;   // ván dở (giữ qua F5)
  // Kỳ Hồn dùng CHUNG với Ngũ Tử Kỳ: nguồn duy nhất state.kyHon (engine/kyhon.js).
}

// ---------- chờ FONT chữ Hán trước khi vẽ texture ----------
// Canvas vẽ chữ mà font chưa tải xong -> rơi về font hệ thống (chữ sai dáng).
// Noto Serif TC = Tống thể PHỒN THỂ, đã nạp subset 18 chữ ở <head> index.html.
const CT_CHARS = '帥仕相傌俥炮兵將士象馬車砲卒楚河漢界';
function ensureFont() {
  try {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.race([
      document.fonts.load('700 100px "Noto Serif TC"', CT_CHARS).catch(() => {}),
      new Promise((r) => setTimeout(r, 2500)),   // font hỏng/mạng chậm thì vẫn vào ván
    ]);
  } catch (e) { return Promise.resolve(); }
}

// ---------- lazy-load Three.js ----------
function ensureThree() {
  if (window.THREE) return Promise.resolve();
  if (window._ntkThreeP) return window._ntkThreeP;   // dùng chung promise với Ngũ Tử Kỳ (cùng 1 thư viện)
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
function injectStyle() {
  if (document.getElementById('ct-style')) return;
  const st = document.createElement('style');
  st.id = 'ct-style';
  st.textContent = `
.ct-root{position:relative;width:100%;max-width:100%;margin:0 auto;aspect-ratio:4/3;max-height:82dvh;border-radius:16px;overflow:hidden;background:#0b0906;box-shadow:0 24px 60px -30px #000;border:1px solid #2e2318;touch-action:none;user-select:none;
  --gold:#e0b45f;--gold2:#f3d9a8;--red:#c9483a;--txt:#f0e6d4;--txt2:#b9ac97;--txt3:#7c705f;--warn:#ff6b6b;--serif:'Lora','Noto Serif SC',Georgia,serif}
.ct-root *{box-sizing:border-box}
.ct-scene{position:absolute;inset:0}
.ct-scene canvas{display:block!important;width:100%!important;height:100%!important}
.ct-vig{position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 140px -20px rgba(6,4,2,.9)}
.ct-fb{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--txt2);text-align:center;padding:20px}
.ct-title{position:absolute;left:16px;top:12px;pointer-events:none;display:flex;align-items:baseline;gap:9px;line-height:1}
.ct-title .hz{font-family:'Ma Shan Zheng',cursive;font-weight:400;font-size:30px;line-height:1;color:var(--gold2);text-shadow:0 2px 20px rgba(224,180,95,.4)}
.ct-title .vz{font-family:var(--serif);font-weight:700;font-size:15px;line-height:1;color:var(--gold2);letter-spacing:.02em;position:relative;top:-1px}
.ct-left{position:absolute;left:12px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:9px;z-index:4}
.ct-b{display:flex;flex-direction:column;align-items:center;gap:3px;color:var(--txt2);cursor:pointer;width:46px}
.ct-b .ic{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(30,22,14,.62);border:1px solid rgba(224,180,95,.28);color:var(--gold);transition:.12s}
.ct-b .ic svg{width:19px;height:19px}
.ct-b span{font-size:9.5px;white-space:nowrap;text-align:center}
.ct-b:hover .ic{border-color:var(--gold2);color:#fff}
.ct-b:active .ic{transform:scale(.92)}
.ct-right{position:absolute;right:12px;top:12px;display:flex;flex-direction:column;gap:8px;align-items:flex-end;pointer-events:none;z-index:4}
.ct-pc{display:flex;align-items:center;gap:9px;width:172px;padding:7px 10px 7px 7px;border-radius:12px;background:linear-gradient(180deg,rgba(38,28,18,.88),rgba(22,16,10,.94));border:1px solid rgba(224,180,95,.22);transition:.18s}
.ct-pc.act{border-color:var(--gold);box-shadow:0 0 18px -6px rgba(224,180,95,.55)}
.ct-pc.wait{filter:grayscale(.3) brightness(.85);border-color:#3a2e20}
.ct-av{width:38px;height:38px;border-radius:9px;flex:none;object-fit:cover;object-position:50% 20%;border:1px solid rgba(224,180,95,.35);background:#241a10}
.ct-pc .nm{font-family:var(--serif);font-size:12.5px;color:#f3ead9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ct-pc .rr{font-size:10px;color:var(--txt3);margin-top:2px;display:flex;align-items:center;gap:5px}
.ct-dot{width:10px;height:10px;border-radius:50%;flex:none;border:1px solid rgba(0,0,0,.5)}
.ct-dot.r{background:radial-gradient(circle at 35% 30%,#e0655a,#8e1f16)}
.ct-dot.k{background:radial-gradient(circle at 35% 30%,#4a4a4a,#0b0b0b)}
.ct-pc.act .rr{color:var(--gold2)}
.ct-toast{position:absolute;left:50%;top:14px;transform:translateX(-50%) translateY(-8px);opacity:0;font-size:12px;color:#f3ead9;background:rgba(24,17,10,.92);border:1px solid rgba(224,180,95,.3);padding:6px 14px;border-radius:99px;pointer-events:none;transition:.2s;z-index:6;max-width:70%;text-align:center}
.ct-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.ct-chk{position:absolute;left:50%;top:52px;transform:translateX(-50%);opacity:0;transition:.2s;font-family:var(--serif);font-weight:700;font-size:15px;letter-spacing:.08em;color:#ffd9d2;background:rgba(150,32,22,.85);border:1px solid rgba(255,140,120,.5);padding:4px 16px;border-radius:99px;pointer-events:none;z-index:6}
.ct-chk.show{opacity:1}
.ct-chat{position:absolute;left:50%;bottom:8px;transform:translateX(-50%) translateY(10px);width:min(560px,92%);opacity:0;pointer-events:none;transition:.16s;z-index:8;display:flex;flex-direction:column;gap:7px;background:rgba(30,22,14,.94);border:1px solid rgba(224,180,95,.26);border-radius:14px;padding:9px 10px;box-shadow:0 18px 44px -22px #000}
.ct-chat.show{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0)}
.ct-chat-ps{display:flex;flex-wrap:wrap;gap:5px}
.ct-chip{font-size:11px;color:var(--txt2);background:rgba(48,35,22,.75);border:1px solid rgba(224,180,95,.22);border-radius:99px;padding:4px 10px;cursor:pointer;white-space:nowrap;transition:.12s;font-family:var(--serif)}
.ct-chip:hover{border-color:var(--gold);color:#f3ead9}
.ct-chat-row{display:flex;gap:6px}
.ct-chat-in{flex:1;min-width:0;background:rgba(14,10,6,.85);border:1px solid rgba(224,180,95,.28);border-radius:9px;padding:6px 10px;color:var(--txt);font-size:12.5px;font-family:var(--serif);outline:none;user-select:text;-webkit-user-select:text;touch-action:auto}
.ct-chat-in:focus{border-color:var(--gold)}
.ct-chat-in::placeholder{color:var(--txt3)}
.ct-chat-send{flex:none;padding:6px 15px;border-radius:9px;cursor:pointer;font-size:12px;color:#2a1d04;border:1px solid #f0d78f;background:linear-gradient(180deg,#f6dc9c,#e0b45f);font-family:var(--serif);font-weight:700}
.ct-view{position:absolute;left:50%;bottom:16px;transform:translateX(-50%) translateY(12px);opacity:0;pointer-events:none;transition:.16s;z-index:9;display:flex;align-items:center;gap:8px;background:rgba(30,22,14,.95);border:1px solid rgba(224,180,95,.32);border-radius:14px;padding:9px 12px;box-shadow:0 18px 44px -22px #000}
.ct-view.show{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0)}
.ct-view .lb{font-family:var(--serif);font-size:12px;color:var(--txt2);white-space:nowrap}
.ct-view .op{font-family:var(--serif);font-size:12.5px;color:var(--gold2);background:rgba(48,35,22,.8);border:1px solid rgba(224,180,95,.3);border-radius:9px;padding:6px 14px;cursor:pointer;transition:.12s;white-space:nowrap}
.ct-view .op:hover{border-color:var(--gold2);background:rgba(224,180,95,.16);color:#fff}
.ct-banner{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(8,5,3,.76);z-index:10;text-align:center;padding:20px}
.ct-banner.show{display:flex}
.ct-end{position:relative;min-width:270px;max-width:90%;padding:24px 30px 20px;border-radius:18px;overflow:hidden;background:linear-gradient(180deg,rgba(40,29,19,.97),rgba(20,14,9,.98));border:1px solid rgba(224,180,95,.2);box-shadow:0 30px 70px -30px #000}
.ct-banner.show .ct-end{animation:ctPop .3s cubic-bezier(.2,.7,.3,1)}
@keyframes ctPop{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}
.ct-end::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,var(--acc,#e0b45f),transparent)}
.ct-end.win{--acc:#f3d9a8}.ct-end.lose{--acc:#9b8d7a}.ct-end.draw{--acc:#8fbf9f}
.ct-banner .bt{font-family:var(--serif);font-weight:700;font-size:29px;letter-spacing:.03em;color:var(--acc,#f3d9a8);text-shadow:0 3px 22px rgba(0,0,0,.5)}
.ct-end-rule{width:60px;height:1px;margin:11px auto 10px;background:linear-gradient(90deg,transparent,var(--acc,#e0b45f),transparent);opacity:.75}
.ct-banner .bs{font-family:var(--serif);font-style:italic;font-size:13px;color:var(--txt2);line-height:1.5;max-width:330px;margin:0 auto}
.ct-end-rw{display:none;margin-top:13px;font-family:var(--serif);font-size:12.5px;font-weight:600;color:#f3d9a8;background:rgba(224,180,95,.13);border:1px solid rgba(224,180,95,.5);border-radius:99px;padding:4px 15px}
.ct-end-rw.show{display:inline-block}
.ct-banner .btns{display:flex;gap:10px;margin-top:18px;justify-content:center}
.ct-banner .gbtn{padding:9px 22px;border-radius:10px;cursor:pointer;font-family:var(--serif);font-weight:600;font-size:14px;letter-spacing:.04em;color:var(--gold2);background:rgba(20,14,9,.5);border:1px solid rgba(224,180,95,.5);transition:background .15s,border-color .15s}
.ct-banner .gbtn:hover{background:rgba(224,180,95,.14);border-color:var(--gold2)}
.ct-banner .gbtn.ghost{color:#d9cfbe;border-color:#463829;background:#1b1410}
/* KHUNG THẤP (điện thoại nằm ngang, kể cả lúc phủ toàn màn hình) — lớp do capKhung() gắn.
   Media query KHÔNG thay được: nó đo màn hình, còn đây phải đo CHÍNH khung bàn. */
.kh-nho .ct-title{left:10px;top:7px}.kh-nho .ct-title .hz{font-size:19px}.kh-nho .ct-title .vz{font-size:11px}
.kh-nho .ct-left{left:8px;gap:6px}.kh-nho .ct-b{width:auto}
.kh-nho .ct-b .ic{width:27px;height:27px}.kh-nho .ct-b .ic svg{width:15px;height:15px}.kh-nho .ct-b span{font-size:8.5px}
.kh-nho .ct-right{right:8px;top:7px;gap:5px}.kh-nho .ct-pc{width:124px;padding:4px 7px 4px 4px}.kh-nho .ct-av{width:26px;height:26px}
.kh-nho .ct-pc .nm{font-size:10.5px}.kh-nho .ct-pc .rr{font-size:9px}
.kh-nho .ct-view{bottom:10px;gap:6px;padding:6px 9px}.kh-nho .ct-view .op{padding:5px 10px;font-size:11.5px}
.kh-nho .ct-chat{bottom:10px}
@media (max-width:600px){.ct-root{aspect-ratio:5/6;min-height:84dvh;max-height:90dvh}.ct-title{left:10px;top:8px}.ct-title .hz{font-size:22px}.ct-title .vz{font-size:11px}.ct-left{left:0;right:0;bottom:9px;top:auto;transform:none;flex-direction:row;justify-content:center;gap:15px;z-index:5}.ct-b{width:auto}.ct-b .ic{width:40px;height:40px}.ct-b span{font-size:9.5px}.ct-right{right:8px;top:8px;gap:6px}.ct-pc{width:134px;padding:5px 8px 5px 5px}.ct-av{width:30px;height:30px}.ct-pc .nm{font-size:11px}.ct-pc .rr{font-size:9px}.ct-toast{left:10px;top:44px;text-align:left;max-width:calc(100% - 152px);font-size:11px;transform:translateY(-6px)}.ct-toast.show{transform:translateY(0)}.ct-chk{top:78px}.ct-chat{bottom:74px;width:94%}.ct-view{bottom:74px;gap:6px;padding:8px 10px}.ct-view .lb{display:none}.ct-view .op{padding:6px 11px;font-size:12px}}
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
  'Xin chỉ giáo.', 'Nước này, tiền bối thấy sao?', 'Ván này tại hạ không nhường đâu.',
  'Danh bất hư truyền, phục thật.', 'Hay! Nước đó tại hạ chịu thua.', 'Để xem ai vây được ai.',
  'Tiền bối đánh thong thả quá nhỉ.', 'Chưa chắc ai hơn ai đâu.', 'Tại hạ đi đây, cẩn thận đấy.',
  'Nước cờ hay, học được rồi.', 'Suýt trúng kế tiền bối rồi.', 'Còn lâu tại hạ mới chịu thua.',
  'Ván sau nhất định gỡ lại.', 'Đánh với cao thủ đúng là khác.', 'Thêm một ván nữa nhé?',
  'Thua tiền bối cũng cam lòng.',
];

export function coTuongLines() { return LINES; }
const LINES = {
  start: [
    'Các hạ mời ngồi, ván cờ này tại hạ chờ đã lâu.', 'Bàn cờ đã bày sẵn, các hạ cầm quân đỏ đi trước.',
    'Lâu lắm mới có người đáng để ngồi đối diện.', 'Nghe danh đã lâu, hôm nay xin được lĩnh giáo.',
    'Các hạ cứ thong thả, tại hạ chẳng vội đâu.', 'Mời trà đã, rồi hãy thong thả phân cao thấp.',
    'Tại hạ đánh cờ mấy chục năm, chưa từng thua ai.', 'Đừng thấy tại hạ hiền mà tưởng dễ ăn.',
    'Pháo đầu hay bình phong mã, tuỳ các hạ chọn.', 'Ai thua ván này, ván sau nhớ gỡ lại nhé.',
  ],
  banter: [
    'Nước này đã tính từ lâu, các hạ chậm rồi.', 'Thế cờ thuận tay, tại hạ chưa vội đâu.',
    'Xe của các hạ hở sườn rồi đấy.', 'Mã tại hạ đã sang sông, các hạ liệu hồn.',
    'Pháo này ngắm lâu rồi mới nổ đấy.', 'Các hạ giữ tốt quá kỹ, quên mất trung lộ à?',
    'Nghĩ mãi chưa xuống, hay ra dạo một vòng?', 'Nước ấy khéo thật, tại hạ phải chịu.',
    'Các hạ đánh cờ có khí chất, đẹp mắt.', 'Cờ còn dài, các hạ cứ thong thả.',
    'Đánh cờ cốt ở cái tình, việc gì phải vội.', 'Được thì vui, thua thì học, có gì mà ngại.',
    'Từng tấc đất trên bàn cờ đều phải giành.', 'Hai bên cùng vây, xem ai vây chặt hơn.',
    'Sĩ tượng bền thật, nhưng giữ mãi được không?', 'Ván cờ chưa ngã ngũ, các hạ đừng mừng vội.',
  ],
  press: [
    'Xe pháo đã vào, các hạ đỡ nổi không?', 'Tướng các hạ ngồi không yên rồi đấy.',
    'Đường lui của các hạ hẹp dần rồi.', 'Tại hạ đâu vội, cứ ép dần cho các hạ ngộp.',
    'Các hạ chặn bên này thì hở bên kia thôi.', 'Một nước hở thôi là các hạ trắng tay đấy.',
    'Sĩ tượng long rồi, cung tướng còn gì che?', 'Thế cờ nghiêng cả về đây rồi, các hạ thấy chứ?',
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
    'Các hạ đánh hăng thật, tiếc là hăng nhầm chỗ.', 'Ván sau nhớ giữ sĩ tượng cho kỹ.',
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

// ---------- Lưu/khôi phục ván dở (F5, rời view giữa chừng) ----------
// Thế cờ nén thành chuỗi 90 ký tự: '.' ô trống · CHỮ HOA = ĐỎ · chữ thường = ĐEN.
export function encodeBoard(b) {
  let s = '';
  for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) {
    const p = b[r][c];
    s += p ? (p.red ? p.t : p.t.toLowerCase()) : '.';
  }
  return s;
}
export function decodeBoard(s) {
  if (typeof s !== 'string' || s.length !== 90) return null;
  const b = [];
  for (let r = 0; r < 10; r++) {
    const row = [];
    for (let c = 0; c < 9; c++) {
      const ch = s[r * 9 + c];
      if (ch === '.') { row.push(null); continue; }
      const up = ch.toUpperCase();
      if ('KAEHRCS'.indexOf(up) < 0) return null;
      row.push({ t: up, red: ch === up });
    }
    b.push(row);
  }
  return b;
}

const HAN = {
  red: { K: '帥', A: '仕', E: '相', H: '傌', R: '俥', C: '炮', S: '兵' },
  blk: { K: '將', A: '士', E: '象', H: '馬', R: '車', C: '砲', S: '卒' },
};

// ============================================================
// mountCoTuong(host, opts) -> { destroy(), resize() }
//   opts.opponent {name, art} · opts.player {name, art} · opts.difficulty 0..1
//   opts.onEnd(result) 1 thắng · 2 thua · 0 hòa (góc NGƯỜI CHƠI, cầm ĐỎ)
//   opts.onExit()
// ============================================================
function mountCoTuong(host, opts) {
  injectStyle();
  const THREE = window.THREE;
  const opp = opts.opponent || { name: 'Đối Thủ', art: '' };
  const pl = opts.player || { name: 'Bạn', art: '' };
  const diff = Math.max(0.15, Math.min(1, opts.difficulty == null ? 0.7 : opts.difficulty));

  host.innerHTML =
    '<div class="ct-root">' +
      '<div class="ct-scene"></div><div class="ct-vig"></div>' +
      '<div class="ct-fb"><div>Không khởi tạo được 3D trên máy này.</div><div class="fm" style="font-size:12px;color:#7c705f"></div></div>' +
      '<div class="ct-title"><span class="hz">象棋</span><span class="vz">Cờ Tướng</span></div>' +
      '<div class="ct-left">' +
        nutToanManHTML('ct') +
        '<span class="ct-b" data-a="spectate"><span class="ic">' + ic('eye') + '</span><span>Quan Chiến</span></span>' +
        '<span class="ct-b" data-a="resign"><span class="ic">' + ic('flag') + '</span><span>Nhận Thua</span></span>' +
        '<span class="ct-b" data-a="draw"><span class="ic">' + ic('draw') + '</span><span>Cầu Hòa</span></span>' +
        '<span class="ct-b" data-a="chat"><span class="ic">' + ic('chat') + '</span><span>Trò Chuyện</span></span>' +
      '</div>' +
      '<div class="ct-right">' +
        '<div class="ct-pc wait" data-c="ai"><img class="ct-av" alt="" src="' + opp.art + '" onerror="this.style.visibility=\'hidden\'"><div><div class="nm">' + opp.name + '</div><div class="rr"><span class="ct-dot k"></span><span class="rs">Chờ</span></div></div></div>' +
        '<div class="ct-pc act" data-c="you"><img class="ct-av" alt="" src="' + pl.art + '" onerror="this.style.visibility=\'hidden\'"><div><div class="nm">' + pl.name + '</div><div class="rr"><span class="ct-dot r"></span><span class="rs">Đang đi…</span></div></div></div>' +
      '</div>' +
      '<div class="ct-toast"></div>' +
      '<div class="ct-chk">C H I Ế U</div>' +
      '<div class="ct-view"><span class="lb">Xoay bàn tới góc bạn thích</span>' +
        '<span class="op" data-a="saveview">Khoá Góc Nhìn</span><span class="op" data-a="resetview">Về Mặc Định</span></div>' +
      '<div class="ct-chat">' +
        '<div class="ct-chat-ps"></div>' +
        '<div class="ct-chat-row"><input class="ct-chat-in" type="text" maxlength="60" autocomplete="off" placeholder="Nhập lời muốn nói…"><button class="ct-chat-send">Gửi</button></div>' +
      '</div>' +
      '<div class="ct-banner"><div class="ct-end"><div class="bt"></div><div class="ct-end-rule"></div><div class="bs"></div><div class="ct-end-rw"></div><div class="btns"><span class="gbtn" data-a="again">Chơi Lại</span><span class="gbtn ghost" data-a="exit">Về</span></div></div></div>' +
    '</div>';

  const root = host.firstElementChild;
  const $ = (s) => root.querySelector(s);
  const scEl = $('.ct-scene');
  // Toàn màn hình: phủ CHÍNH thẻ gốc nên vào là mất sạch thanh đầu trang / sidebar / banner.
  const tm = ganToanMan(root, () => onResize());
  const fb = (msg) => { const d = $('.ct-fb'); d.style.display = 'flex'; if (msg) d.querySelector('.fm').textContent = msg; };

  // ---- kích thước bàn (1 đơn vị = 1 ô) ----
  const MG = 0.95, WU = 8 + MG * 2, HU = 9 + MG * 2, TH = 0.66, TOPY = TH / 2;
  const WX = (c) => c - 4, WZ = (r) => 4.5 - r;

  // ---- state ván ----
  let board = null, HUMAN_RED = true, turnRed = true, over = false, saidN = 0;
  let sel = null, hints = [], pieceMesh = {}, anims = [];
  let renderer, scene, camera, boardGroup, raycaster, pointer, rayPlane, particles = null, rafId = 0;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Camera có ĐÍCH riêng + GIẢM CHẤN (đồng bộ cảm giác với Cờ Vua / Ngũ Tử Kỳ):
  // kéo 1:1 rồi dừng phắt là thứ làm cảm giác "cứng". CỐ Ý KHÔNG có quán tính — thả tay là đứng.
  const SPH0 = { r: 15.4, theta: 0, phi: 0.60 };
  let target, sph = { r: 15.4, theta: 0, phi: 0.60 }, tgt = { r: 15.4, theta: 0, phi: 0.60 };
  let dragging = false, movedFlag = false, lastX = 0, lastY = 0, autorot = false, ret = null;
  // THẾ HỆ ván: mỗi lần dựng ván mới / kết ván / tháo bàn là tăng 1. Mọi setTimeout mang theo số thế hệ
  // lúc hẹn, khác số hiện tại là bỏ qua -> hẹn giờ của ván cũ không đi quân vào ván mới.
  let van = 0;
  const hen = (f, ms) => { const v = van; setTimeout(() => { if (v === van && !over) f(v); }, ms); };
  let lockView = opts.view || null;     // góc người chơi đã khoá RIÊNG cho bàn này, null = tự canh
  let fitR = 15.4;                      // khoảng cách VỪA KHUNG ở cỡ màn hiện tại — mốc quy đổi mức phóng
  let firstFit = true;                  // lần khớp khung ĐẦU TIÊN phải đặt thẳng, không giảm chấn
  let pieceGeo, faceGeoR, lacquer, selRing, hintGeo, hintMat, shGeo, shMat, faceCache = {};

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
  function paintWood(x, w, h, ringScale) {
    const img = x.createImageData(w, h), D = img.data; let i = 0; const RING = h / (6.0 * (ringScale || 1));
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
      const wp = (nz(xx * 0.009, y * 0.05) - 0.5) * 46 + (nz(xx * 0.042, y * 0.15) - 0.5) * 13;
      const rc = (y + wp) / RING, t = rc - Math.floor(rc);
      let band = t < 0.5 ? t * 2 : (1 - t) * 2; band = band * band * (3 - 2 * band);
      const pc = (y + wp) / 6.5, pt = pc - Math.floor(pc);
      const pore = pt < 0.30 ? (1 - pt / 0.30) : 0;
      const fib = nz(xx * 0.55, y * 0.014);
      let m = 0.30 + band * 0.44 + (fib - 0.5) * 0.26 - pore * 0.30;
      if (m < 0) m = 0; else if (m > 1) m = 1;
      const mn = (Math.random() - 0.5) * 4;
      D[i++] = 58 + m * 46 + mn; D[i++] = 28 + m * 28 + mn * 0.6; D[i++] = 18 + m * 20 + mn * 0.5; D[i++] = 255;
    }
    x.putImageData(img, 0, 0);
  }
  function woodTex(w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; paintWood(cv.getContext('2d'), w, h, 0.55); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t; }
  function roughTex(w, h) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d');
    const img = x.createImageData(w, h), D = img.data; let i = 0;
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { const n = nz(xx * 0.012, y * 0.012) * 0.6 + nz(xx * 0.05, y * 0.05) * 0.3 + nz(xx * 0.2, y * 0.2) * 0.1; const v = 118 + n * 118; D[i++] = v; D[i++] = v; D[i++] = v; D[i++] = 255; }
    x.putImageData(img, 0, 0); return new THREE.CanvasTexture(cv);
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
  function boardTopTex() {
    const s = 118, w = Math.round(WU * s), h = Math.round(HU * s);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d');
    paintWood(x, w, h, 1);
    const GX = (f) => (MG + f) * s, GY = (r) => (MG + r) * s;
    x.globalAlpha = 0.90; x.lineCap = 'butt'; x.strokeStyle = '#C39A59'; x.lineWidth = Math.max(1.2, s * 0.0092);
    for (let r = 0; r <= 9; r++) { x.beginPath(); x.moveTo(GX(0), GY(r)); x.lineTo(GX(8), GY(r)); x.stroke(); }
    for (let f = 0; f <= 8; f++) {
      x.beginPath();
      if (f === 0 || f === 8) { x.moveTo(GX(f), GY(0)); x.lineTo(GX(f), GY(9)); }
      else { x.moveTo(GX(f), GY(0)); x.lineTo(GX(f), GY(4)); x.moveTo(GX(f), GY(5)); x.lineTo(GX(f), GY(9)); }
      x.stroke();
    }
    [0, 7].forEach((r0) => { x.beginPath(); x.moveTo(GX(3), GY(r0)); x.lineTo(GX(5), GY(r0 + 2)); x.moveTo(GX(5), GY(r0)); x.lineTo(GX(3), GY(r0 + 2)); x.stroke(); });
    x.lineWidth = Math.max(1.2, s * 0.013); x.lineCap = 'round';
    [[1, 2], [7, 2], [1, 7], [7, 7], [0, 3], [2, 3], [4, 3], [6, 3], [8, 3], [0, 6], [2, 6], [4, 6], [6, 6], [8, 6]].forEach((m) => {
      const cx = GX(m[0]), cy = GY(m[1]), d = s * 0.10, L = s * 0.15;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach((q) => {
        if (m[0] === 0 && q[0] < 0) return; if (m[0] === 8 && q[0] > 0) return;
        x.beginPath(); x.moveTo(cx + q[0] * d, cy + q[1] * (d + L)); x.lineTo(cx + q[0] * d, cy + q[1] * d); x.lineTo(cx + q[0] * (d + L), cy + q[1] * d); x.stroke();
      });
    });
    x.globalAlpha = 1; x.fillStyle = '#D7A962';
    x.font = '700 ' + Math.round(s * 0.56) + 'px "Noto Serif TC",serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    const my = (GY(4) + GY(5)) / 2;
    x.fillText('楚', GX(1.5), my); x.fillText('河', GX(2.7), my);
    x.fillText('漢', GX(5.3), my); x.fillText('界', GX(6.5), my);
    x.globalAlpha = 0.85; x.strokeStyle = '#C39A59'; x.lineWidth = Math.max(1.1, s * 0.010);
    x.strokeRect(GX(0) - s * 0.26, GY(0) - s * 0.26, (GX(8) - GX(0)) + s * 0.52, (GY(9) - GY(0)) + s * 0.52);
    x.globalAlpha = 1;
    const t = new THREE.CanvasTexture(cv); t.anisotropy = 8; t.encoding = THREE.sRGBEncoding; return t;
  }
  function faceTex(ch, red) {
    const k = ch + (red ? 'r' : 'k'); if (faceCache[k]) return faceCache[k];
    const S = 256, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d');
    const col = red ? '#B12821' : '#E7E0D0', ring = red ? '#A9241D' : '#CFC9BA', dk = red ? '#4E100C' : '#6A6558';
    const c = S / 2;
    x.strokeStyle = dk; x.lineWidth = S * 0.042; x.beginPath(); x.arc(c, c + S * 0.006, S * 0.415, 0, 7); x.stroke();
    x.strokeStyle = ring; x.lineWidth = S * 0.036; x.beginPath(); x.arc(c, c, S * 0.415, 0, 7); x.stroke();
    x.font = '700 ' + Math.round(S * 0.57) + 'px "Noto Serif TC",serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = dk; x.fillText(ch, c, c + S * 0.028 + S * 0.005);
    x.fillStyle = col; x.fillText(ch, c, c + S * 0.028);
    const t = new THREE.CanvasTexture(cv); t.anisotropy = 8; t.encoding = THREE.sRGBEncoding; faceCache[k] = t; return t;
  }
  function domeTex(top, upper, mid, floorCenter) {
    const cv = document.createElement('canvas'); cv.width = 32; cv.height = 256; const x = cv.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, top); g.addColorStop(0.34, upper); g.addColorStop(0.72, mid); g.addColorStop(1, floorCenter);
    x.fillStyle = g; x.fillRect(0, 0, 32, 256);
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t;
  }
  function envTex() {
    const cv = document.createElement('canvas'); cv.width = 32; cv.height = 256; const x = cv.getContext('2d');
    x.fillStyle = '#0c0d10'; x.fillRect(0, 0, 32, 256);
    const g = x.createLinearGradient(0, 14, 0, 80); g.addColorStop(0, '#131519'); g.addColorStop(.45, '#e9ecf0'); g.addColorStop(1, '#131519');
    x.fillStyle = g; x.fillRect(0, 14, 32, 66);
    const t = new THREE.CanvasTexture(cv); t.mapping = THREE.EquirectangularReflectionMapping; t.encoding = THREE.sRGBEncoding; return t;
  }
  function radialTex(inner, mid, stopMid) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d');
    const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, inner); g.addColorStop(stopMid || 0.55, mid); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(cv);
  }
  function dotTex() { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,240,214,1)'); g.addColorStop(.4, 'rgba(240,200,140,.5)'); g.addColorStop(1, 'rgba(240,200,140,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); }

  function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W(), H());
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.98;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scEl.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x15110e);
    camera = new THREE.PerspectiveCamera(36, W() / H(), 0.1, 200);
    target = new THREE.Vector3(0, 0, 0); updCam();
    try { const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(envTex()).texture; } catch (e) {}

    scene.add(new THREE.HemisphereLight(0xfff3e6, 0x2b2622, 0.14));
    const key = new THREE.DirectionalLight(0xfff8f0, 1.5); key.position.set(6.5, 16, 9); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); const sc = key.shadow.camera; sc.near = 1; sc.far = 60; sc.left = -10; sc.right = 10; sc.top = 11; sc.bottom = -11; key.shadow.bias = -0.0005; scene.add(key);
    const fill = new THREE.DirectionalLight(0xf0eee9, 0.12); fill.position.set(-9, 7, -6); scene.add(fill);
    const rimA = new THREE.PointLight(0xffca86, 0.8, 26); rimA.position.set(-6.5, 2.4, 6.5); scene.add(rimA);
    const rimB = new THREE.PointLight(0xbfd6f0, 0.42, 26); rimB.position.set(6.5, 2.2, -6.5); scene.add(rimB);

    // phông vô cực (không nhận sáng) + sàn chỉ-bóng
    const dp = []; const R0 = 20, RC = 13, WT = 60;
    for (let i = 0; i <= 14; i++) dp.push(new THREE.Vector2(R0 * i / 14, 0));
    for (let i = 1; i <= 20; i++) { const a = (Math.PI / 2) * (i / 20); dp.push(new THREE.Vector2(R0 + RC * Math.sin(a), RC - RC * Math.cos(a))); }
    for (let i = 1; i <= 6; i++) dp.push(new THREE.Vector2(R0 + RC, RC + (WT - RC) * (i / 6)));
    const dome = new THREE.Mesh(new THREE.LatheGeometry(dp, 72), new THREE.MeshBasicMaterial({ map: domeTex('#15110E', '#221C18', '#332B24', '#3E342C'), side: THREE.DoubleSide, fog: false }));
    dome.position.y = -TH / 2 - 0.002; scene.add(dome);
    const sfloor = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.ShadowMaterial({ opacity: 0.42 }));
    sfloor.rotation.x = -Math.PI / 2; sfloor.position.y = -TH / 2 - 0.001; sfloor.receiveShadow = true; scene.add(sfloor);

    boardGroup = new THREE.Group(); scene.add(boardGroup);
    const rough = roughTex(512, 512); rough.wrapS = rough.wrapT = THREE.RepeatWrapping; rough.repeat.set(2, 2);
    const BEV = 0.075, RCn = 0.30;
    const side = woodTex(512, 512); side.wrapS = side.wrapT = THREE.RepeatWrapping; side.repeat.set(0.11, 0.11);
    const slabGeo = new THREE.ExtrudeGeometry(roundedRectShape(WU, HU, RCn), { depth: TH - BEV * 2, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: 4, curveSegments: 20 });
    slabGeo.rotateX(-Math.PI / 2); slabGeo.translate(0, -(TH / 2 - BEV), 0);
    const slab = new THREE.Mesh(slabGeo, new THREE.MeshPhysicalMaterial({ map: side, color: 0x8f8f8f, roughness: .62, roughnessMap: rough, metalness: 0, clearcoat: .22, clearcoatRoughness: .55, envMapIntensity: .28 }));
    slab.receiveShadow = true; slab.castShadow = true; boardGroup.add(slab);
    const topGeo = new THREE.ShapeGeometry(roundedRectShape(WU - BEV * 2, HU - BEV * 2, RCn - BEV), 20);
    const tp = topGeo.attributes.position, tu = topGeo.attributes.uv;
    for (let vi = 0; vi < tp.count; vi++) tu.setXY(vi, (tp.getX(vi) + WU / 2) / WU, (tp.getY(vi) + HU / 2) / HU);
    tu.needsUpdate = true;
    const topM = new THREE.Mesh(topGeo, new THREE.MeshPhysicalMaterial({ map: boardTopTex(), roughness: .52, roughnessMap: rough, metalness: 0, clearcoat: .26, clearcoatRoughness: .48, envMapIntensity: .24 }));
    topM.rotation.x = -Math.PI / 2; topM.position.y = TOPY + 0.002; topM.receiveShadow = true; boardGroup.add(topM);

    // hình quân + vật liệu dùng chung
    const prof = [[0, 0], [0.349, 0], [0.401, 0.04], [0.415, 0.09], [0.415, 0.27], [0.404, 0.318], [0.377, 0.345], [0.349, 0.352], [0, 0.352]].map((p) => new THREE.Vector2(p[0], p[1]));
    pieceGeo = new THREE.LatheGeometry(prof, 56);
    lacquer = new THREE.MeshPhysicalMaterial({ color: 0x030304, roughness: .22, metalness: 0, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: .24 });
    faceGeoR = new THREE.CircleGeometry(0.335, 40);
    shGeo = new THREE.CircleGeometry(0.57, 28);
    shMat = new THREE.MeshBasicMaterial({ map: radialTex('rgba(18,10,6,.5)', 'rgba(18,10,6,.34)', 0.62), transparent: true, depthWrite: false });
    hintGeo = new THREE.CircleGeometry(0.15, 20);
    hintMat = new THREE.MeshBasicMaterial({ color: 0x8fe3c0, transparent: true, opacity: 0.75, depthWrite: false });
    const ringGeo = new THREE.RingGeometry(0.44, 0.50, 40);
    selRing = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xf3d9a8, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }));
    selRing.rotation.x = -Math.PI / 2; selRing.visible = false; boardGroup.add(selRing);

    if (!reduce) { try { particles = makeParticles(); scene.add(particles); } catch (e) {} }

    rayPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(TOPY));
    raycaster = new THREE.Raycaster(); pointer = new THREE.Vector2();
    const el = renderer.domElement;
    el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove);
    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onCancel);
    window.addEventListener('resize', onResize); window.addEventListener('keydown', onKey);
    root.querySelectorAll('.ct-b,[data-a]').forEach((b) => b.addEventListener('click', () => act(b.getAttribute('data-a'))));
    const sendB = $('.ct-chat-send'), chatIn = $('.ct-chat-in');
    if (sendB) sendB.addEventListener('click', sendChat);
    if (chatIn) chatIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendChat(); } });
  }
  function makeParticles() {
    const n = 46, geo = new THREE.BufferGeometry(), arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { arr[i * 3] = (Math.random() - .5) * 17; arr[i * 3 + 1] = Math.random() * 8; arr[i * 3 + 2] = (Math.random() - .5) * 17; }
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({ size: .075, map: dotTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffdca8, opacity: .4, sizeAttenuation: true }));
  }

  // ---------- dựng quân từ board ----------
  function key(c, r) { return c + '_' + r; }
  function buildPieces() {
    for (const k in pieceMesh) if (pieceMesh.hasOwnProperty(k)) { const g = pieceMesh[k]; boardGroup.remove(g.body); boardGroup.remove(g.face); boardGroup.remove(g.sh); }
    pieceMesh = {};
    for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) {
      const p = board[r][c]; if (!p) continue; addPieceMesh(c, r, p);
    }
  }
  function addPieceMesh(c, r, p) {
    const ch = (p.red ? HAN.red : HAN.blk)[p.t];
    const sh = new THREE.Mesh(shGeo, shMat); sh.rotation.x = -Math.PI / 2; sh.position.set(WX(c), TOPY + 0.004, WZ(r)); boardGroup.add(sh);
    const body = new THREE.Mesh(pieceGeo, lacquer); body.position.set(WX(c), TOPY, WZ(r)); body.castShadow = true; body.receiveShadow = true; boardGroup.add(body);
    const face = new THREE.Mesh(faceGeoR, new THREE.MeshBasicMaterial({ map: faceTex(ch, p.red), transparent: true, depthWrite: false }));
    face.rotation.x = -Math.PI / 2; face.position.set(WX(c), TOPY + 0.354, WZ(r)); boardGroup.add(face);
    pieceMesh[key(c, r)] = { body, face, sh };
  }
  function movePieceMesh(mv, captured) {
    const from = key(mv.fc, mv.fr), to = key(mv.tc, mv.tr);
    if (captured && pieceMesh[to]) { const g = pieceMesh[to]; boardGroup.remove(g.body); boardGroup.remove(g.face); boardGroup.remove(g.sh); delete pieceMesh[to]; }
    const g = pieceMesh[from]; if (!g) return;
    delete pieceMesh[from]; pieceMesh[to] = g;
    anims.push({ g, x0: WX(mv.fc), z0: WZ(mv.fr), x1: WX(mv.tc), z1: WZ(mv.tr), t: 0 });
  }

  // ---------- gợi ý nước đi ----------
  function clearHints() { hints.forEach((h) => boardGroup.remove(h)); hints = []; selRing.visible = false; sel = null; }
  function showHints(c, r) {
    clearHints();
    const ms = legalMoves(board, HUMAN_RED).filter((m) => m.fc === c && m.fr === r);
    if (!ms.length) return false;
    sel = { c, r, moves: ms };
    selRing.position.set(WX(c), TOPY + 0.006, WZ(r)); selRing.visible = true;
    ms.forEach((m) => {
      const cap = !!board[m.tr][m.tc];
      const h = new THREE.Mesh(hintGeo, cap ? hintMat.clone() : hintMat);
      if (cap) { h.material.color.setHex(0xe8836e); h.scale.set(1.9, 1.9, 1.9); }
      h.rotation.x = -Math.PI / 2; h.position.set(WX(m.tc), TOPY + 0.006, WZ(m.tr));
      boardGroup.add(h); hints.push(h);
    });
    return true;
  }

  // ---------- lượt đi ----------
  function playerMove(mv) {
    if (over) return;
    const cap = doMove(board, mv);
    movePieceMesh(mv, cap);
    clearHints();
    turnRed = false;              // người chơi cầm ĐỎ -> tới lượt ĐEN (AI)
    afterMove();
    if (!over) hen(aiTurn, 480);
  }
  // ⚠ HAI CHỐT, thiếu cái nào cũng chết: `v !== van` chặn hẹn giờ của VÁN CŨ (bấm Chơi Lại giữa lúc
  // đối thủ đang chờ đi), còn `turnRed === HUMAN_RED` chặn AI cướp lượt của người chơi.
  function aiTurn(v) {
    if (over || v !== van || turnRed === HUMAN_RED) return;
    const wasCheck = inCheck(board, !HUMAN_RED);
    let mv = null;
    // ĐỘ KHÓ TỐI ĐA: để engine làm sâu dần tới 20 tầng, chỉ chặn bằng thời gian; KHÔNG nhiễu ngẫu nhiên.
    try { mv = searchBest(board, !HUMAN_RED, { depth: 20, timeMs: 2400, rand: 0 }); } catch (e) { mv = null; }
    if (over || v !== van) return;             // ván có thể đã kết thúc trong lúc máy nghĩ
    if (!mv) { const ms = legalMoves(board, !HUMAN_RED); mv = ms.length ? ms[(Math.random() * ms.length) | 0] : null; }
    if (!mv) return endGame(1, 'Đối thủ hết nước đi.');
    const cap = doMove(board, mv);
    movePieceMesh(mv, cap);
    turnRed = true;
    afterMove();
    if (!over) maybeBossSay(wasCheck);
  }
  function afterMove() {
    turnUI();
    const checked = inCheck(board, turnRed);   // turnRed = bên SẮP đi
    const chk = $('.ct-chk'); if (chk) chk.classList.toggle('show', !!checked);
    if (!legalMoves(board, turnRed).length) {  // bên sắp đi hết nước = thua
      const humanLost = (turnRed === HUMAN_RED);
      return endGame(humanLost ? 2 : 1, checked ? 'Chiếu bí!' : 'Hết nước đi!');
    }
    persist();
  }
  function maybeBossSay(wasCheck) {
    if (saidN >= 4 || Math.random() > 0.34) return; saidN++;
    let cat = 'banter';
    if (inCheck(board, HUMAN_RED)) cat = 'press'; else if (wasCheck) cat = 'defend';
    bossSay(cat);
  }

  function endGame(result, why) {
    over = true; van++; clearHints();
    stopSpectate(false);                        // kẹt Quan Chiến qua màn kết thì ván sau bấm không ăn
    const chk = $('.ct-chk'); if (chk) chk.classList.remove('show');
    const b = $('.ct-banner'), end = b.querySelector('.ct-end'), bt = b.querySelector('.bt'), bs = b.querySelector('.bs'), rw = b.querySelector('.ct-end-rw');
    end.classList.remove('win', 'lose', 'draw'); rw.classList.remove('show');
    const q = (cat) => opp.name + ': 「' + pick(LINES[cat]) + '」';
    if (result === 1) { end.classList.add('win'); bt.textContent = 'Bạn Thắng!'; bs.textContent = (why ? why + ' ' : '') + q('lose'); rw.textContent = 'Kỳ Hồn +20'; rw.classList.add('show'); }
    else if (result === 2) { end.classList.add('lose'); bt.textContent = 'Bạn Thua'; bs.textContent = (why ? why + ' ' : '') + q('win'); }
    else { end.classList.add('draw'); bt.textContent = 'Hòa Cờ'; bs.textContent = q('draw'); }
    b.classList.add('show');
    try { if (opts.onEnd) opts.onEnd(result); } catch (e) {}
  }

  function resetGame(saved) {
    van++;                                      // sang THẾ HỆ ván mới -> hẹn giờ của ván cũ tự hết hiệu lực
    const rb = (saved && saved.b) ? decodeBoard(saved.b) : null;   // khôi phục ván dở nếu có
    board = rb || initBoard();
    turnRed = rb ? (saved.red !== false) : true;
    over = false; saidN = 0; anims = [];
    stopSpectate(false);                        // ván mới phải chạm được quân ngay
    clearHints(); buildPieces();
    $('.ct-banner').classList.remove('show');
    const chk = $('.ct-chk'); if (chk) chk.classList.remove('show');
    turnUI();
    if (rb) {
      toast('Tiếp tục ván dở');
      if (!turnRed) hen(aiTurn, 700);           // đang tới lượt đối thủ
    } else {
      hen(() => bossSay('start'), 750);
    }
  }
  function persist() {   // lưu thế cờ sau MỖI nước để F5 / rời view vẫn vào lại được
    try { if (opts.onMove) opts.onMove({ b: encodeBoard(board), red: turnRed }); } catch (e) {}
  }

  function turnUI() {
    const you = $('[data-c="you"]'), ai = $('[data-c="ai"]');
    const myTurn = (turnRed === HUMAN_RED);
    if (myTurn) { you.classList.add('act'); you.classList.remove('wait'); ai.classList.remove('act'); ai.classList.add('wait'); }
    else { ai.classList.add('act'); ai.classList.remove('wait'); you.classList.remove('act'); you.classList.add('wait'); }
    you.querySelector('.rs').textContent = myTurn ? 'Đang đi…' : 'Chờ';
    ai.querySelector('.rs').textContent = myTurn ? 'Chờ' : 'Đang tính…';
  }
  function toast(t) { const el = $('.ct-toast'); el.textContent = t; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 1800); }
  function sayPlayer(text) { const t = String(text || '').trim(); if (!t) return; toast(pl.name + ': 「' + t + '」'); if (!over && Math.random() < 0.5) hen(() => bossSay('reply'), 850); }
  function sendChat() { const inp = $('.ct-chat-in'); if (!inp) return; sayPlayer(inp.value); inp.value = ''; }
  function fillPresets() {
    const box = $('.ct-chat-ps'); if (!box) return;
    const pool = PLAYER_PRESETS.slice(), pk = [];
    for (let i = 0; i < 5 && pool.length; i++) pk.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
    box.innerHTML = pk.map(() => '<span class="ct-chip"></span>').join('');
    box.querySelectorAll('.ct-chip').forEach((c, i) => { c.textContent = pk[i]; c.addEventListener('click', () => sayPlayer(pk[i])); });
  }
  function onKey(e) { if (e.key !== 'Escape') return; const box = $('.ct-chat'); if (box && box.classList.contains('show')) { e.preventDefault(); box.classList.remove('show'); const inp = $('.ct-chat-in'); if (inp) inp.blur(); } }

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
    const chat = $('.ct-chat'); if (chat) chat.classList.remove('show');
    $('.ct-view').classList.add('show');
    toast('Quan Chiến — kéo, lăn chuột hoặc chụm hai ngón để chỉnh bàn');
  }
  // ⚠ PHẢI gọi cả ở endGame/resetGame: bỏ sót thì ván mới vẫn kẹt autorot=true,
  // mà onUp chỉ gọi tapBoard khi !autorot -> bàn cờ bấm không ăn, nhìn như game chết.
  function stopSpectate(noiGi) {
    if (!autorot) return;
    autorot = false;
    const bar = $('.ct-view'); if (bar) bar.classList.remove('show');
    normTheta();
    ret = 1; tgt.theta = SPH0.theta; tgt.phi = SPH0.phi; tgt.r = SPH0.r;
    if (noiGi) toast(lockView ? 'Đã cố định — đưa bàn về góc nhìn đã khoá' : 'Đã cố định — đưa bàn về góc nhìn ban đầu');
  }

  function act(a) {
    if (a === 'resign') { if (!over) endGame(2, 'Các hạ nhận thua.'); }
    else if (a === 'draw') { if (!over) { toast(opp.name + ': "Được, hòa vậy."'); hen(() => endGame(0, ''), 700); } }
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
      const box = $('.ct-chat'); if (!box) return;
      const show = !box.classList.contains('show');
      if (show && autorot) stopSpectate(false);     // hai bảng cùng nằm đáy giữa -> chỉ mở MỘT
      box.classList.toggle('show', show);
      if (show) { fillPresets(); const inp = $('.ct-chat-in'); if (inp) setTimeout(() => inp.focus(), 40); }
    }
    else if (a === 'again') resetGame();
    else if (a === 'exit') { try { if (opts.onExit) opts.onExit(); } catch (e) {} }
  }

  function clampPhi(p) { return Math.max(0.16, Math.min(1.18, p)); }
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
    ret = null;
    // Đích đi theo tay 1:1; cái mượt là do giảm chấn ở animate() ĐUỔI THEO đích, không phải quán tính.
    tgt.theta -= dx * 0.006; tgt.phi = clampPhi(tgt.phi - dy * 0.005);
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
  function tapBoard(e) {
    if (over || turnRed !== HUMAN_RED) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const pt = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(rayPlane, pt)) return;
    const c = Math.round(pt.x + 4), r = Math.round(4.5 - pt.z);
    if (c < 0 || c > 8 || r < 0 || r > 9) return;
    if (sel) {
      const mv = sel.moves.find((m) => m.tc === c && m.tr === r);
      if (mv) return playerMove(mv);
    }
    const p = board[r][c];
    if (p && p.red === HUMAN_RED) { showHints(c, r); return; }
    clearHints();
  }

  function updCam() { camera.position.set(target.x + sph.r * Math.sin(sph.phi) * Math.sin(sph.theta), target.y + sph.r * Math.cos(sph.phi), target.z + sph.r * Math.sin(sph.phi) * Math.cos(sph.theta)); camera.lookAt(target); }
  // Bàn có lọt khung ở khoảng cách r không — đo góc THẬT của 6 điểm mép (2 hàng × 3 cột).
  // ⚠ PHẢI tính cả GÓC XOAY NGANG: xoay bàn chéo thì bề ngang nhìn thấy nở ra tới ~1,4 lần.
  // Xoay camera đi theta = xoay BÀN đi -theta rồi đo như lúc theta = 0.
  function fits(r, phi, fovY, fovX, theta) {
    const cy = r * Math.cos(phi), cz = r * Math.sin(phi);
    const dy = -Math.cos(phi), dz = -Math.sin(phi);
    const hw = WU / 2, hd = HU / 2, m = 0.995;
    const ct = Math.cos(theta || 0), st = Math.sin(theta || 0);
    const pts = [];
    for (let i = 0; i < 6; i++) pts.push([(i % 3 === 0) ? -hw : (i % 3 === 1 ? 0 : hw), (i < 3) ? -hd : hd]);
    [[-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd]].forEach((q) => pts.push(q));   // 4 góc bàn: xoay chéo là chúng lòi ra trước
    for (let i = 0; i < pts.length; i++) {
      const px = pts[i][0] * ct - pts[i][1] * st, pz = pts[i][0] * st + pts[i][1] * ct;
      const vy = TOPY - cy, vz = pz - cz;
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
    let lo = 8, hi = 46;
    for (let i = 0; i < 26; i++) { const mid = (lo + hi) / 2; if (fits(mid, phi, _fovY, _fovX, theta === undefined ? sph.theta : theta)) hi = mid; else lo = mid; }
    return hi;
  }
  function onResize() {
    if (!renderer) return;
    capKhung(root);                     // khung thấp -> chrome rút gọn (xem engine/toanman.js)
    const w = W(), h = H(); renderer.setSize(w, h);
    const ar = w / h, portrait = ar < 1.05;
    // Mobile: CHỪA dải TRÊN (thẻ tên đấu thủ) + dải DƯỚI (hàng nút), bàn khớp vào ĐÚNG khoảng giữa
    // -> khung kéo dài lấp màn mà bàn vẫn không đè lên thẻ tên / nút.
    const BTN = portrait ? 72 : 0, TOP = portrait ? 86 : 0;
    const uh = Math.max(80, h - BTN - TOP), a = w / uh;
    camera.aspect = a;
    // Góc KHOÁ (nếu có) đè lên góc tự canh; khoảng cách vẫn tính lại theo khung THẬT rồi mới
    // nhân tỉ lệ phóng — không thì đổi cỡ màn là bàn lòi ra ngoài.
    // màn càng dọc thì nhìn càng từ trên xuống -> bàn "đứng" hơn, lấp khung cao tốt hơn
    const G = lockView;
    const phi = G ? G.phi : (portrait ? Math.max(0.34, 0.60 - (1.05 - ar) * 0.50) : 0.60);
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
      // giảm chấn bò tới: r khởi tạo là 15,4 mà màn dọc cần ~25 -> khung đầu tiên bàn cờ bị CẮT.
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
  // Tâm dọc hộp bao bàn cờ trên màn, đơn vị NDC (-1 = đỉnh khung, +1 = đáy khung).
  // NaN khi chưa đo được (điểm ra sau lưng camera) -> bên gọi bỏ qua, không dịch bừa.
  function ndcGiua() {
    if (!camera) return NaN;
    camera.updateMatrixWorld();
    const hw = WU / 2, hd = HU / 2, v = new THREE.Vector3();
    const pts = [[-hw, -hd], [0, -hd], [hw, -hd], [-hw, hd], [0, hd], [hw, hd], [-hw, 0], [hw, 0]];
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < pts.length; i++) {
      v.set(pts[i][0], TOPY, pts[i][1]).project(camera);
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
        const lift = Math.sin(Math.PI * a.t) * 0.22;
        a.g.body.position.set(x, TOPY + lift, z);
        a.g.face.position.set(x, TOPY + 0.354 + lift, z);
        a.g.sh.position.set(x, TOPY + 0.004, z);
        if (a.t >= 1) anims.splice(i, 1);
      }
    }
    if (particles) { const pa = particles.geometry.attributes.position, ar = pa.array; for (let i = 1; i < ar.length; i += 3) { ar[i] += 0.0032; if (ar[i] > 8.2) ar[i] = -0.3; } pa.needsUpdate = true; }
    renderer.render(scene, camera);
  }

  // KHỞI ĐỘNG PHẢI Ở CUỐI: init() dùng NG/NGRID (const) — gọi sớm hơn dòng khai báo sẽ vướng vùng chết tạm thời.
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
// Alpine factory — view "Cờ Tướng"
// ============================================================
export function coTuong() {
  return {
    _battle: null,
    inBattle: false,
    loading: false,
    loadErr: '',
    opp: null,
    get ct() { return this.$store.game.state.coTuong; },
    get kyHon() { return getKyHon(this.$store.game.state); },
    get kyNgheState() { return kyNgheOf(this.$store.game.state); },
    get opponents() { try { return (this.$store.game.danhSiBang || []).slice(); } catch (e) { return []; } },
    recOf(id) { const r = (this.ct.rec || {})[id]; return r ? (r.w + ' Thắng ' + r.l + ' Bại') : 'Chưa đấu'; },
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
    get savedGame() { const g = this.ct && this.ct.game; return (g && g.b && g.oppId) ? g : null; },
    get savedOpp() { const g = this.savedGame; return g ? this.opponents.find((x) => x.id === g.oppId) : null; },
    resumeSaved() { const o = this.savedOpp; if (o) this.challenge(o, this.savedGame); },
    dropSaved() { if (this.ct) this.ct.game = null; try { Storage.save(this.$store.game.state); } catch (e) {} },

    ctInit() {
      ensureCoTuong(this.$store.game.state);
      const pre = this.$store.game._ctOpp; this.$store.game._ctOpp = null;
      if (pre) { const o = this.opponents.find((x) => x.id === pre); if (o) this.$nextTick(() => this.challenge(o)); }
      // ⚠ ĐỪNG đặt điều kiện `&& this._battle`: rời view TRONG LÚC còn đang tải Three.js/font thì
      // _battle vẫn null, watcher bỏ qua, rồi _mount() chạy muộn trên host đã bị gỡ khỏi DOM -> dựng
      // hẳn một WebGLRenderer + vòng rAF + listener window KHÔNG AI huỷ được. Lặp vài lần là hết
      // ngữ cảnh WebGL, MỌI bàn cờ 3D báo lỗi cho tới khi tải lại trang.
      this.$watch('$store.game.view', (v) => {
        if (v === 'coTuong') return;
        this._boSo = true;
        if (this._battle) { try { this._battle.destroy(); } catch (e) {} this._battle = null; }
        this.inBattle = false; this.loading = false;
      });
    },
    challenge(o, saved) {
      if (this.inBattle) return;
      this._boSo = false;
      this.opp = o; this._saved = saved || null; this.loadErr = ''; this.loading = true; this.inBattle = true;
      Promise.all([ensureThree(), ensureEngine(), ensureFont()]).then(() => { this.loading = false; this.$nextTick(() => this._mount()); })
        .catch((e) => { this.loading = false; this.inBattle = false; this.loadErr = String(e && e.message || e); });
    },
    _mount() {
      // Rời view giữa lúc tải xong -> KHÔNG dựng bàn nữa (xem chú thích ở ctInit).
      if (this._boSo || this.$store.game.view !== 'coTuong') { this._boSo = false; this.inBattle = false; return; }
      const host = this.$refs.boardHost;
      if (!host) { this.inBattle = false; return; }
      host.innerHTML = '';
      const g = this.$store.game, o = this.opp;
      this._battle = mountCoTuong(host, {
        opponent: { name: o.ten || 'Đối Thủ', art: this.faceOf(o) },
        player: { name: (g.state.player || {}).name || 'Bạn', art: g.avatarSrc },
        difficulty: 1,   // TẤT CẢ Danh Sĩ đánh ở mức cao nhất (nhãn tầng chỉ còn là lore theo rank)
        saved: this._saved,
        view: getGocNhin(g.state, 'coTuong'),          // góc nhìn đã khoá RIÊNG của bàn này
        onSaveView: (v) => { const r = saveGocNhin(g.state, 'coTuong', v); try { Storage.save(g.state); } catch (e) {} return r; },
        onResetView: () => { clearGocNhin(g.state, 'coTuong'); try { Storage.save(g.state); } catch (e) {} },
        onMove: (snap) => this._persist(o.id, snap),
        onEnd: (result) => this._recordResult(o.id, result),
        onExit: () => this._exit(),
      });
      this._saved = null;
    },
    _persist(id, snap) {
      const n = this.ct; if (!n) return;
      n.game = { oppId: id, b: snap.b, red: snap.red };
      try { Storage.save(this.$store.game.state); } catch (e) {}
    },
    _recordResult(id, result) {
      const n = this.ct; if (!n.rec[id]) n.rec[id] = { w: 0, l: 0 };
      n.game = null;   // ván đã xong -> bỏ bản lưu dở
      if (result === 1) { n.rec[id].w++; n.wins++; addKyHon(this.$store.game.state, 20); try { this.$store.game.checkTitles(); } catch (e) {} }   // Kỳ Hồn CHUNG + mở khoá Kỳ Nghệ tức thì
      else if (result === 2) { n.rec[id].l++; }
      try { Storage.save(this.$store.game.state); } catch (e) {}
    },
    _exit() { if (this._battle) { try { this._battle.destroy(); } catch (e) {} this._battle = null; } this.inBattle = false; this.opp = null; },
  };
}
