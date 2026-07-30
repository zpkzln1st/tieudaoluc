// ============================================================
// TRUNG QUỐC PHAO ĐẮC KHOÁI (中国跑得快 · Paodekuai) — mini-game bàn bài 3D.
// Khuôn Tiến Lên: cách ly, CHỈ đọc/ghi state.paoDeKuai (+ state.kyHon và state.truMa dùng chung).
// Bàn 3D = WebGL (Three.js, lazy-load src/lib/three.min.js chỉ khi vào chiếu).
// LUẬT + AI nằm ở engine THUẦN src/engine/paodekuai.js (kiểm bằng 66 phép thử + 300 ván mô phỏng).
//
// ⚠ BÀN NÀY BA NGƯỜI, không phải bốn như Tiến Lên / Binh Xập Xám.
//   Chỗ ngồi cách nhau 120°: mình ở mép gần, hai nhà kia ở hai góc TRÊN (trái + phải).
//   Mọi vòng lặp cửa là `s < 3` và `% 3` — sót một chỗ là kẹt lượt.
// ⚠ Bộ bài 48 lá (bỏ ba lá Hai giữ 2♠, bỏ A♠) nên MỘT VÁN CHỈ DÙNG 48/52 ô atlas.
// ⚠ CAMERA TRỰC GIAO — xem chú thích ở init3D, đừng đổi về phối cảnh.
// ============================================================
import { Storage } from './engine/save.js';
import { addKyHon, getKyHon, kyNgheOf } from './engine/kyhon.js';   // Kỳ Hồn + danh hiệu Kỳ Nghệ dùng CHUNG
import { ensureTruMa, soTruMa, doiTruMa, ghiVan, MUC_DOI, TI_GIA } from './engine/truma.js';   // đồng riêng của chiếu bài
import { getGocNhin, saveGocNhin, clearGocNhin } from './engine/gocnhin.js';

// Engine luật+AI nạp ĐỘNG (chỉ khi vào chiếu) — hỏng thì chỉ hỏng riêng Phao Đắc Khoái, không vỡ cả game.
let E = null;
function ensureEngine() {
  if (E) return Promise.resolve();
  return import('./engine/paodekuai.js').then((m) => {
    const need = ['deal', 'classify', 'beats', 'genMoves', 'duocBo', 'aiPick', 'ketSo', 'tenBo'];
    for (const k of need) if (typeof m[k] !== 'function') throw new Error('Engine Phao Đắc Khoái thiếu hàm ' + k + '.');
    E = m;
  });
}

// ---------- ensure/migrate ----------
export function ensurePaoDeKuai(state) {
  if (!state.paoDeKuai) state.paoDeKuai = {};
  const n = state.paoDeKuai;
  if (!n.rec) n.rec = {};              // { chieuId: { van, nhat, bom } }
  if (n.van == null) n.van = 0;        // tổng số ván đã chơi
  if (n.nhat == null) n.nhat = 0;      // tổng số ván chạy hết bài trước
  if (n.bom == null) n.bom = 0;        // tổng số quả bom đã đánh
  if (n.lai == null) n.lai = 0;        // lãi/lỗ TRÙ MÃ cộng dồn (không phải Bạc)
  if (n.game === undefined) n.game = null;   // ván dở (giữ qua F5) = { chieuId, van }
  // Kỳ Hồn dùng CHUNG: nguồn duy nhất state.kyHon (engine/kyhon.js).
  // Trù Mã dùng CHUNG cho mọi trò có cược: nguồn duy nhất state.truMa (engine/truma.js).
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
'use strict';

var TAY = ['Nam', 'Đông', 'Bắc', 'Tây'];      // cửa 0 = người chơi, đi vòng 0→1→2→3
var HANG_TEN = ['Nhất', 'Nhì', 'Ba', 'Bét'];

// ---------- kích thước (đơn vị thế giới) ----------
var R_BAN = 7.15, TH = 0.52, TOPY = TH / 2;       // bàn bát giác
var R_NI = 5.55;                                  // vùng nỉ
var CW = 0.70, CH = 0.98, CT = 0.022;             // lá bài: rộng · cao · dày

function injectStyle() {
  if (document.getElementById('pk-style')) return;
  var st = document.createElement('style');
  st.id = 'pk-style';
  st.textContent = [
    // nền + viền lấy đúng tông game (xanh đêm #0b0e16), KHÔNG dùng nâu riêng — bàn gỗ đã đủ ấm rồi
'.pk-root{position:relative;width:100%;max-width:100%;margin:0 auto;aspect-ratio:16/11;max-height:82dvh;border-radius:16px;overflow:hidden;background:#0b0e16;box-shadow:0 24px 60px -30px #000;border:1px solid #1e2b3a;touch-action:none;user-select:none;',
    '  --gold:#e6c079;--gold2:#f4d99a;--cy:#9fe4f0;--jade:#2dd4bf;--txt:#f0e7d8;--txt2:#b6a68f;--txt3:#7d6c58;--warn:#e08a6a;--serif:\'Lora\',Georgia,serif}',
    '.pk-root *{box-sizing:border-box}',
    '.pk-scene{position:absolute;inset:0}',
    '.pk-scene canvas{display:block!important;width:100%!important;height:100%!important}',
    '.pk-vig{position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 140px -22px rgba(4,7,12,.95)}',
// nhịp sáng viền khi TỚI LƯỢT MÌNH — chỉ có dòng chữ thì rất dễ ngồi ngẩn ra không biết đến lượt
'.pk-turn{position:absolute;inset:0;pointer-events:none;z-index:3;border-radius:16px}',
'.pk-turn.on{animation:tlTurn 1.15s ease}',
'@keyframes tlTurn{0%{box-shadow:inset 0 0 0 2px rgba(230,192,121,0),inset 0 0 34px rgba(230,192,121,0)}',
'  26%{box-shadow:inset 0 0 0 2px rgba(230,192,121,.55),inset 0 0 44px rgba(230,192,121,.16)}',
'  100%{box-shadow:inset 0 0 0 2px rgba(230,192,121,0),inset 0 0 34px rgba(230,192,121,0)}}',
'@media (prefers-reduced-motion:reduce){.pk-turn.on{animation:none}}',
    '.pk-fb{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--txt2);text-align:center;padding:20px;font-family:var(--serif)}',
    // tiêu đề
    '.pk-title{position:absolute;left:16px;top:12px;pointer-events:none;display:flex;align-items:baseline;gap:9px;line-height:1;z-index:4}',
    '.pk-title .hz{font-family:\'Ma Shan Zheng\',cursive;font-size:26px;line-height:1;color:var(--gold2);text-shadow:0 2px 18px rgba(230,192,121,.45);letter-spacing:.02em}',
    '.pk-title .vz{font-family:var(--serif);font-weight:700;font-size:14.5px;color:var(--gold2);letter-spacing:.02em;position:relative;top:-1px}',
    '.pk-chieu{position:absolute;left:17px;top:44px;font-family:var(--serif);font-size:11px;color:var(--txt3);z-index:4;pointer-events:none;letter-spacing:.03em}',
    // thẻ đối thủ (bám theo vị trí thật quanh bàn)
    '.pk-seat{position:absolute;transform:translate(-50%,-50%);display:flex;align-items:center;gap:8px;padding:6px 11px 6px 6px;border-radius:12px;background:linear-gradient(180deg,rgba(32,23,16,.9),rgba(18,13,9,.94));border:1px solid rgba(230,192,121,.2);z-index:5;pointer-events:none;transition:border-color .18s,box-shadow .18s,filter .18s;white-space:nowrap}',
    '.pk-seat.act{border-color:var(--gold);box-shadow:0 0 20px -6px rgba(230,192,121,.6)}',
    '.pk-seat.pass{filter:grayscale(.45) brightness(.8)}',
    '.pk-seat.done{border-color:var(--jade);box-shadow:0 0 18px -7px rgba(45,212,191,.6)}',
    '.pk-av{width:34px;height:34px;border-radius:8px;flex:none;object-fit:cover;object-position:50% 18%;border:1px solid rgba(230,192,121,.3);background:#1a120c}',
    '.pk-seat .nm{font-family:var(--serif);font-size:12px;color:var(--txt);line-height:1.25}',
    '.pk-seat .bh{font-size:9.5px;color:var(--txt3);line-height:1.25}',
    '.pk-seat .ct{display:flex;align-items:center;gap:4px;margin-top:2px;font-size:10px;color:var(--gold2)}',
    '.pk-seat .ct .bd{display:inline-block;width:7px;height:10px;border-radius:1.5px;background:linear-gradient(160deg,#8d2c24,#5d1a15);border:1px solid rgba(230,192,121,.45)}',
    '.pk-seat.pass .ct{color:var(--txt3)}',
    '.pk-say{position:absolute;transform:translate(-50%,0);width:max-content;max-width:min(230px,42%);padding:6px 11px;border-radius:11px;background:rgba(28,20,14,.96);border:1px solid rgba(230,192,121,.35);color:var(--txt);font-family:var(--serif);font-size:11.5px;line-height:1.4;z-index:7;pointer-events:none;opacity:0;transition:opacity .2s;white-space:normal;text-align:center}',
    '.pk-say.show{opacity:1}',
    // thanh trạng thái giữa
    '.pk-cur{position:absolute;left:50%;top:11px;transform:translateX(-50%);display:flex;align-items:center;gap:9px;padding:5px 14px;border-radius:99px;background:rgba(24,17,11,.82);border:1px solid rgba(230,192,121,.26);font-family:var(--serif);font-size:12px;color:var(--txt2);z-index:5;pointer-events:none;white-space:nowrap}',
    '.pk-cur b{color:var(--gold2);font-weight:600}',
    '.pk-cur .dot{width:6px;height:6px;border-radius:50%;background:var(--gold);flex:none}',
    // cột nút trái
    // đặt ở 50% thì cột nút đè lên thẻ tên nhà bên trái — hạ xuống dưới thẻ
    '.pk-left{position:absolute;left:11px;top:66%;transform:translateY(-50%);display:flex;flex-direction:column;gap:9px;z-index:6}',
    '.pk-b{display:flex;flex-direction:column;align-items:center;gap:3px;color:var(--txt2);cursor:pointer;width:46px}',
    '.pk-b .ic{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(30,21,14,.72);border:1px solid rgba(230,192,121,.24);color:var(--gold);transition:.12s}',
    '.pk-b .ic svg{width:18px;height:18px}',
    '.pk-b span{font-size:9.5px;white-space:nowrap;font-family:var(--serif)}',
    '.pk-b:hover .ic{border-color:var(--gold2);color:#fff}',
    '.pk-b:active .ic{transform:scale(.92)}',
    // hàng nút dưới
    '.pk-act{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);display:flex;gap:9px;z-index:6;align-items:center}',
    '.pk-btn{font-family:var(--serif);font-size:13px;font-weight:600;letter-spacing:.03em;padding:8px 20px;border-radius:10px;cursor:pointer;transition:background .14s,border-color .14s,color .14s;white-space:nowrap;color:var(--gold2);background:rgba(26,18,12,.78);border:1px solid rgba(230,192,121,.45)}',
    '.pk-btn:hover{background:rgba(230,192,121,.15);border-color:var(--gold2)}',
    '.pk-btn.pri{color:#2a1c06;background:linear-gradient(180deg,#f6dc9c,#dfb45f);border-color:#f0d78f;box-shadow:0 0 20px -7px var(--gold)}',
    '.pk-btn.pri:hover{background:linear-gradient(180deg,#fce7ad,#e8bf6c)}',
    '.pk-btn.ghost{color:#cdbda6;border-color:#4a382a;background:rgba(20,14,9,.7)}',
    '.pk-btn.ghost:hover{border-color:#7d6c58;background:rgba(40,29,19,.8)}',
    '.pk-btn.dis{opacity:.34;pointer-events:none}',
    // ===== BÁO SỰ KIỆN GIỮA BÀN — port nguyên khuôn `skillCue()` của Kỳ Trận Trảm Yêu =====
    // 4 lớp: vệt sáng quét ngang · chớp tròn giữa · tên chiêu chữ TRẮNG bung ra · 10 mảnh sáng bắn tỏa.
    '.pk-skcue{position:absolute;inset:0;z-index:11;pointer-events:none;overflow:hidden}',
    '.pk-skcue .sk-streak{position:absolute;left:-45%;top:41%;width:62%;height:24px;transform:translateY(-50%) skewX(-24deg);background:linear-gradient(90deg,transparent,var(--acc),#fff,var(--acc),transparent);box-shadow:0 0 22px var(--acc);opacity:0}',
    '.pk-skcue .sk-streak.go{animation:tlSkStreak .55s cubic-bezier(.4,0,.2,1) forwards}',
    '@keyframes tlSkStreak{0%{opacity:0;left:-45%}30%{opacity:1}70%{opacity:1}100%{opacity:0;left:132%}}',
    '.pk-skcue .sk-flash{position:absolute;left:50%;top:41%;width:46%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.5),var(--soft) 45%,transparent 70%);opacity:0;mix-blend-mode:screen}',
    '.pk-skcue .sk-flash.go{animation:tlSkFlash .5s ease-out .16s forwards}',
    '@keyframes tlSkFlash{0%{opacity:0;transform:translate(-50%,-50%) scale(.7)}35%{opacity:.85;transform:translate(-50%,-50%) scale(1.05)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.2)}}',
    // chữ TRẮNG, glow theo màu bậc — nền bàn có bài trắng nên phải chồng thêm bóng đen cho nổi
    '.pk-skcue .sk-nm{position:absolute;left:50%;top:41%;transform:translate(-50%,-50%) scale(1.25);font-family:var(--serif);font-weight:700;letter-spacing:.03em;color:#fff;text-shadow:0 0 18px var(--acc),0 0 40px var(--acc),0 2px 9px #000,0 0 22px rgba(0,0,0,.95);opacity:0;white-space:nowrap}',
    '.pk-skcue .sk-nm.go{animation:tlSkNm 1.05s cubic-bezier(.2,.7,.3,1) forwards}',
    '@keyframes tlSkNm{0%{opacity:0;transform:translate(-50%,-50%) scale(1.28)}18%{opacity:1;transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.02)}}',
    '.pk-skcue .sk-who{position:absolute;left:50%;top:41%;margin-top:30px;transform:translate(-50%,0);font-family:var(--serif);font-size:13px;font-weight:600;letter-spacing:.03em;color:#f6ecd8;text-shadow:0 2px 8px #000,0 0 18px rgba(0,0,0,.95);opacity:0;white-space:nowrap}',
    '.pk-skcue .sk-who.go{animation:tlSkWho 1.05s ease forwards}',
    '@keyframes tlSkWho{0%{opacity:0}24%{opacity:1}80%{opacity:1}100%{opacity:0}}',
    '.pk-skcue .sk-shard{position:absolute;left:50%;top:41%;width:9px;height:2px;border-radius:2px;background:var(--acc);box-shadow:0 0 6px var(--acc);opacity:0}',
    '.pk-skcue .sk-shard.go{animation:tlSkShard var(--d,420ms) ease-out .12s forwards}',
    '@keyframes tlSkShard{0%{opacity:0;transform:translate(-50%,-50%) rotate(var(--r,0deg))}30%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--tx,0px)),calc(-50% + var(--ty,0px))) rotate(var(--r,0deg))}}',
    // bậc thấp thì bỏ bớt lớp cho đỡ ồn: bậc 0 chỉ có chữ, bậc 1 thêm chớp
    '.pk-skcue.b0 .sk-streak,.pk-skcue.b0 .sk-flash,.pk-skcue.b0 .sk-shard,.pk-skcue.b1 .sk-streak,.pk-skcue.b1 .sk-shard{display:none}',
    '.pk-scene.sk{animation:tlShake .34s ease}',
    '@keyframes tlShake{0%,100%{transform:translate(0,0)}20%{transform:translate(-4px,2px)}40%{transform:translate(4px,-2px)}60%{transform:translate(-3px,-1px)}80%{transform:translate(3px,1px)}}',
    '.pk-skcue.giu .sk-nm{opacity:1;animation:none;transform:translate(-50%,-50%) scale(1)}',
    '.pk-skcue.giu .sk-who{opacity:1;animation:none}',
    '.pk-skcue.giu .sk-flash{opacity:.55;animation:none;transform:translate(-50%,-50%) scale(1.05)}',
    '.pk-skcue.giu .sk-streak{opacity:1;animation:none;left:24%}',
    '.pk-skcue.giu .sk-shard{opacity:1;animation:none;transform:translate(calc(-50% + var(--tx,0px)),calc(-50% + var(--ty,0px))) rotate(var(--r,0deg))}',
    '@media (prefers-reduced-motion:reduce){.pk-skcue *{animation:none!important}.pk-skcue .sk-nm{opacity:1;transform:translate(-50%,-50%) scale(1)}}',
    // toast — tin phụ, nằm GÓC TRÁI: để giữa trên thì nó đè đúng vào thẻ tên nhà đối diện
    '.pk-toast{position:absolute;left:16px;top:70px;transform:translateY(-6px);opacity:0;font-family:var(--serif);font-size:12.5px;color:var(--txt);background:rgba(26,18,12,.94);border:1px solid rgba(230,192,121,.3);padding:6px 15px;border-radius:99px;pointer-events:none;transition:.2s;z-index:8;white-space:nowrap;max-width:calc(100% - 32px);overflow:hidden;text-overflow:ellipsis}',
    '.pk-toast.show{opacity:1;transform:translateY(0)}',
    // khoá góc nhìn
    '.pk-view{position:absolute;left:50%;bottom:14px;transform:translateX(-50%) translateY(12px);opacity:0;pointer-events:none;transition:.16s;z-index:9;display:flex;align-items:center;gap:8px;background:rgba(34,24,16,.95);border:1px solid rgba(230,192,121,.34);border-radius:14px;padding:9px 12px}',
    '.pk-view.show{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0)}',
    '.pk-view .lb{font-family:var(--serif);font-size:12px;color:var(--txt2);white-space:nowrap}',
    '.pk-view .op{font-family:var(--serif);font-size:12.5px;color:var(--gold2);background:rgba(48,34,22,.9);border:1px solid rgba(230,192,121,.32);border-radius:9px;padding:6px 14px;cursor:pointer;white-space:nowrap;transition:.12s}',
    '.pk-view .op:hover{border-color:var(--gold2);background:rgba(230,192,121,.16);color:#fff}',
    // trò chuyện
    '.pk-chat{position:absolute;left:50%;bottom:12px;transform:translateX(-50%) translateY(10px);width:min(560px,92%);opacity:0;pointer-events:none;transition:.16s;z-index:9;display:flex;flex-direction:column;gap:7px;background:rgba(34,24,16,.94);border:1px solid rgba(230,192,121,.3);border-radius:14px;padding:9px 10px}',
    '.pk-chat.show{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0)}',
    '.pk-chat-ps{display:flex;flex-wrap:wrap;gap:5px}',
    '.pk-chip{font-family:var(--serif);font-size:11px;color:var(--txt2);background:rgba(48,34,22,.8);border:1px solid rgba(230,192,121,.24);border-radius:99px;padding:4px 10px;cursor:pointer;white-space:nowrap;transition:.12s}',
    '.pk-chip:hover{border-color:var(--gold2);color:var(--txt)}',
    '.pk-chat-row{display:flex;gap:6px}',
    '.pk-chat-in{flex:1;min-width:0;background:rgba(14,10,6,.86);border:1px solid rgba(230,192,121,.28);border-radius:9px;padding:6px 10px;color:var(--txt);font-size:12.5px;font-family:var(--serif);outline:none;user-select:text;-webkit-user-select:text;touch-action:auto}',
    '.pk-chat-in:focus{border-color:var(--gold2)}',
    '.pk-chat-in::placeholder{color:var(--txt3)}',
    '.pk-chat-send{flex:none;padding:6px 15px;border-radius:9px;cursor:pointer;font-size:12px;color:#2a1c06;border:1px solid #f0d78f;background:linear-gradient(180deg,#f6dc9c,#dfb45f);font-family:var(--serif);font-weight:700}',
    // màn kết
    '.pk-banner{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(8,5,3,.8);z-index:12;padding:18px}',
    '.pk-banner.show{display:flex}',
    '.pk-end{position:relative;width:min(470px,96%);max-height:94%;overflow:auto;padding:22px 26px 18px;border-radius:18px;background:linear-gradient(180deg,rgba(36,26,18,.98),rgba(19,13,9,.99));border:1px solid rgba(230,192,121,.22);box-shadow:0 30px 70px -30px #000}',
    '.pk-banner.show .pk-end{animation:tlPop .3s cubic-bezier(.2,.7,.3,1)}',
    '@keyframes tlPop{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}',
    '.pk-end::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,var(--acc,#e6c079),transparent)}',
    '.pk-end.win{--acc:#f4d99a}.pk-end.mid{--acc:#c9b48d}.pk-end.lose{--acc:#a08874}',
    '.pk-end .bt{font-family:var(--serif);font-weight:700;font-size:27px;letter-spacing:.03em;color:var(--acc);text-align:center}',
    '.pk-end .rule{width:64px;height:1px;margin:10px auto 12px;background:linear-gradient(90deg,transparent,var(--acc),transparent);opacity:.8}',
    '.pk-end .bs{font-family:var(--serif);font-style:italic;font-size:12.5px;color:var(--txt2);line-height:1.55;text-align:center;margin-bottom:14px}',
    '.pk-tab{width:100%;border-collapse:collapse;font-family:var(--serif);font-size:12px}',
    '.pk-tab th{font-size:10px;font-weight:600;color:var(--txt3);text-align:left;padding:0 6px 5px;letter-spacing:.05em;text-transform:uppercase;border-bottom:1px solid rgba(230,192,121,.16)}',
    '.pk-tab th.r,.pk-tab td.r{text-align:right}',
    '.pk-tab td{padding:6px;color:var(--txt2);border-bottom:1px solid rgba(230,192,121,.07);vertical-align:top}',
    '.pk-tab tr.me td{color:var(--txt)}',
    '.pk-tab tr.me td:first-child{color:var(--gold2);font-weight:600}',
    '.pk-tab .pos{color:#7fd6b5}.pk-tab .neg{color:var(--warn)}',
    '.pk-tab .sub{display:block;font-size:10px;color:var(--txt3);font-style:italic;margin-top:2px}',
    '.pk-rw{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px}',
    '.pk-rw span{font-family:var(--serif);font-size:12px;font-weight:600;color:var(--gold2);background:rgba(230,192,121,.12);border:1px solid rgba(230,192,121,.45);border-radius:99px;padding:4px 14px}',
    '.pk-end .btns{display:flex;gap:10px;margin-top:16px;justify-content:center}',
    // mobile
    // ⚠ KHÔNG đặt min-height cạnh aspect-ratio: chiều cao tối thiểu sẽ kéo chiều rộng phình ra
    //   quá màn hình (390px → 577px) và cả trang tràn ngang.
    '@media (max-width:600px){.pk-root{aspect-ratio:3/4;max-height:86dvh}',
    '  .pk-title{left:10px;top:6px}.pk-title .hz{font-size:17px}.pk-title .vz{font-size:11px}.pk-chieu{left:11px;top:27px;font-size:9.5px}',
    '  .pk-left{left:0;right:0;top:auto;bottom:56px;transform:none;flex-direction:row;justify-content:center;gap:14px}',
    '  .pk-b{width:auto}.pk-b .ic{width:33px;height:33px}',
    '  .pk-act{bottom:9px;gap:5px;flex-wrap:wrap;justify-content:center;width:97%}.pk-btn{padding:6px 11px;font-size:11.5px}',
    '  .pk-seat{padding:3px 7px 3px 3px;gap:5px;max-width:46%}.pk-av{width:25px;height:25px}.pk-seat .nm{font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pk-seat .bh{display:none}.pk-seat .ct{font-size:9px}',
    '  .pk-cur{font-size:10.5px;padding:4px 10px;top:47px;max-width:94%;overflow:hidden;text-overflow:ellipsis;display:block;white-space:nowrap}',
    '  .pk-toast{font-size:11px;top:68px;left:10px;max-width:calc(100% - 20px)}.pk-chat{bottom:96px}.pk-view{bottom:96px}.pk-view .lb{display:none}',
    '  .pk-end{padding:18px 16px 14px}.pk-end .bt{font-size:22px}.pk-tab{font-size:11px}}'
  ].join('\n');
  document.head.appendChild(st);
}

var SVG = {
  eye: '<path d="M2.4 12S6 5.6 12 5.6 21.6 12 21.6 12 18 18.4 12 18.4 2.4 12 2.4 12Z"/><circle cx="12" cy="12" r="3"/>',
  chat: '<path d="M21 11.6a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-4-1L3.5 20.5 5 15.6A8.4 8.4 0 0 1 12.5 3.2 8.4 8.4 0 0 1 21 11.6Z"/><path d="M8.6 11.6h.01M12.5 11.6h.01M16.4 11.6h.01"/>',
  exit: '<path d="M14 4h4.5a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 8l-4 4 4 4"/><path d="M6 12h9"/>',
  sort: '<path d="M4 7h11M4 12h8M4 17h5"/><path d="M17.5 9.5 20 7l2.5 2.5"/><path d="M20 7v10"/>'
};
function ic(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + SVG[n] + '</svg>'; }

// ---------- lời thoại NPC ----------
var LOI = {
  vao: ['Chia bài đi, tay tôi đang ngứa.', 'Ván này ai cầm Ba Bích thì mở màn.', 'Bài bạc là chuyện nhỏ, thua keo này ta bày keo khác.', 'Ngồi xuống thì đừng tính đường rút.', 'Lâu rồi mới có người dám ngồi cùng chiếu.'],
  heo: ['Heo đây, ai chặt được thì chặt.', 'Con này chắc không ai đè nổi đâu nhỉ.', 'Thả Heo dò đường một cái.', 'Tôi ra Heo, các vị liệu mà giữ hàng.'],
  chatDuoc: ['Chặt! Cất Heo đi mà tiếc.', 'Đợi mãi mới có con Heo để chém.', 'Hàng này tôi giữ từ đầu ván đấy.', 'Xin lỗi, tứ quý nằm sẵn trong tay rồi.'],
  biChat: ['Thôi xong, đụng hàng chặt rồi.', 'Giấu kỹ thế cơ à.', 'Tôi tưởng cả làng hết hàng chặt rồi chứ.', 'Đau, con Heo đó tôi tính để về đấy.'],
  bo: ['Không đè nổi, tôi bỏ.', 'Bài tôi kẹt, mời các vị.', 'Bỏ lượt, để dành sức.', 'Nước này tôi chịu.'],
  sapVe: ['Tôi còn hai lá thôi đấy, liệu mà chặn.', 'Sắp hết bài rồi, ai chặn được không?', 'Một lượt nữa là tôi về.'],
  veNhat: ['Về Nhất! Thu tiền thôi.', 'Bài đẹp thì đánh kiểu gì cũng thắng.', 'Tôi đi trước, các vị chia nhau phần thối nhé.'],
  thua: ['Bét rồi, hôm nay tay tôi lạnh quá.', 'Bài xấu thì đành chịu, ván sau gỡ.', 'Thua tâm phục, không kêu ca.'],
  khen: ['Nước đó đẹp đấy.', 'Tay bài này chắc chơi lâu năm rồi.', 'Được, các hạ có nghề.'],
  dap: ['Nói ít thôi, đánh đi.', 'Ừ thì cứ đánh rồi biết.', 'Còn lâu mới tới lượt các hạ mừng.', 'Hay lắm, để xem cuối ván ai cười.', 'Được, tôi nghe đây.']
};
var CHIP_NGUOI = ['Chia bài đi.', 'Bài này khó nhằn đấy.', 'Chặt luôn cho nhanh.', 'Ai còn Heo thì ra đi.', 'Ván này tôi không nhường.', 'Nước đó đẹp thật.', 'Thua keo này bày keo khác.', 'Từ từ, để tôi tính đã.'];

// ============================================================
function mountPaoDeKuai(host, opts) {
  injectStyle();
  var THREE = window.THREE, TL = E;
  var cuoc = opts.cuoc || 200;
  var seed = opts.seed || null;
  var rnd = seed ? TL.mulberry32(seed) : Math.random;
  var nguoi = opts.nguoiChoi || { ten: 'Bạn', art: '' };
  var doiThu = opts.doiThu || [];

  // cửa 0 = người chơi; 1,2,3 = Đông, Bắc, Tây
  var CUA = [{ ten: nguoi.ten, bietHieu: 'Khách qua đường', art: nguoi.art, rank: 0 }];
  for (var q = 0; q < 2; q++) {                 // bàn BA người: chỉ hai đối thủ
    var d = doiThu[q] || { ten: 'Đối Thủ', bietHieu: '', rank: 700, id: '' };
    CUA.push({ ten: d.ten, bietHieu: d.bietHieu, art: d.art || ('../images/danhsi/' + d.id + '.webp'), rank: d.rank });
  }

  host.innerHTML =
    '<div class="pk-root">' +
      '<div class="pk-scene"></div><div class="pk-vig"></div><div class="pk-turn"></div>' +
      '<div class="pk-fb"><div>Không khởi tạo được 3D trên máy này.</div><div class="fm" style="font-size:11.5px;color:#7d6c58"></div></div>' +
      '<div class="pk-title"><span class="hz">中国跑得快</span><span class="vz">Tiến Lên Trung Quốc</span></div>' +
      '<div class="pk-chieu">' + (opts.chieu || '') + ' · cược ' + fmt(cuoc) + ' Trù Mã mỗi cửa</div>' +
      '<div class="pk-cur"><span class="dot"></span><span class="ct"></span></div>' +
      '<div class="pk-left">' +
        '<span class="pk-b" data-a="spectate"><span class="ic">' + ic('eye') + '</span><span>Quan Chiến</span></span>' +
        '<span class="pk-b" data-a="chat"><span class="ic">' + ic('chat') + '</span><span>Trò Chuyện</span></span>' +
        '<span class="pk-b" data-a="exit"><span class="ic">' + ic('exit') + '</span><span>Rời Chiếu</span></span>' +
      '</div>' +
      '<div class="pk-act">' +
        '<span class="pk-btn pri dis" data-a="danh">Đánh</span>' +
        '<span class="pk-btn dis" data-a="bo">Bỏ Lượt</span>' +
        '<span class="pk-btn ghost" data-a="goiy">Gợi Ý</span>' +
        '<span class="pk-btn ghost" data-a="xep">Xếp Theo Bộ</span>' +
      '</div>' +
      '<div class="pk-toast"></div>' +
      '<div class="pk-view"><span class="lb">Xoay bàn tới góc bạn thích</span>' +
        '<span class="op" data-a="saveview">Khoá Góc Nhìn</span><span class="op" data-a="resetview">Về Mặc Định</span></div>' +
      '<div class="pk-chat"><div class="pk-chat-ps"></div>' +
        '<div class="pk-chat-row"><input class="pk-chat-in" type="text" maxlength="70" autocomplete="off" placeholder="Nhập lời muốn nói…"><button class="pk-chat-send">Gửi</button></div></div>' +
      '<div class="pk-banner"><div class="pk-end"><div class="bt"></div><div class="rule"></div><div class="bs"></div>' +
        '<table class="pk-tab"><thead><tr><th>Cửa</th><th>Hạng</th><th class="r">Bạc</th></tr></thead><tbody></tbody></table>' +
        '<div class="pk-rw"></div>' +
        '<div class="btns"><span class="pk-btn pri" data-a="again">Ván Mới</span><span class="pk-btn ghost" data-a="leave">Rời Chiếu</span></div></div></div>' +
    '</div>';

  var root = host.firstElementChild;
  var $ = function (s) { return root.querySelector(s); };
  var scEl = $('.pk-scene');
  function fb(m) { var d = $('.pk-fb'); d.style.display = 'flex'; if (m) d.querySelector('.fm').textContent = m; }
  function fmt(n) { return (n | 0).toLocaleString('vi-VN'); }

  // ---------- trạng thái ván ----------
  var hands = [[], [], [], []];      // bài từng cửa
  var curCards = [];                 // lá của bộ đang phải đè (để lưu ván dở)
  var luot = 0, cur = null, chuBai = 0;
  var daBo = [false, false, false], raBai = [false, false, false];
  var xong = [];                     // thứ tự về
  var chon = {};                     // mã lá đang được chọn (cửa 0)
  var over = false, xepBo = false, dangCho = false, saidN = 0;
  var moBai = false;                 // PDK không có luật "bộ đầu ván phải kèm lá 3"
  // Ai chạy hết bài ván trước — ván sau người đó mở lượt (thay cho luật "ai cầm 3♥").
  // Chỉ sống trong một lần ngồi chiếu; rời chiếu là quên.
  var viTruoc = null;
  var bomDem = [0, 0, 0];            // số quả bom mỗi nhà đã đánh — mỗi quả ăn 5 điểm từ MỖI đối thủ
  // Nghi án "thả người về" (放走包赔): đánh BÀI LẺ không phải lá lẻ lớn nhất trong tay lúc nhà kế
  // chỉ còn 1 lá, rồi nhà đó về ngay. Người phạm gánh luôn phần điểm của nhà thứ ba.
  var thaVe = -1, loiTu = -1, loiCho = -1;

  // ---------- Three ----------
  var renderer, scene, camera, banGroup, pileGroup, raf = 0;
  var sph = { r: 17, theta: 0, phi: 0.60 }, rFit = 17, target = new THREE.Vector3(0, 0, 0);
  var drag = false, moved = 0, lx = 0, ly = 0, spectate = false;
  var tweens = [], meshOf = {}, handGroups = [], atlasTex = null, backTex = null, particles = null;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var boCanShadow = true;            // cờ: còn cần vẽ lại bản đồ bóng một lần nữa không
  var ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  var GEO = {}, MAT = {};

  // ============ hoa văn & chất bài (vẽ tay, không lệ thuộc font biểu tượng) ============
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

  // bố cục pip chuẩn cho lá số 3..10 — [x, y, lộn ngược]
  var PIP = {
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
    // ⚠ biến `s` ở ĐÂY là CHẤT BÀI (4 chất), KHÔNG phải cửa ngồi — bàn ba người vẫn phải vẽ đủ BỐN hàng.
    // Đổi nhầm thành 3 thì hàng chất Cơ không được vẽ, mọi lá ♥ ra một miếng đen thui.
    for (var s = 0; s < 4; s++) for (var r = 0; r < 13; r++) veMatBai(x, r * W, s * H, W, H, r, s);

    return loNet(new THREE.CanvasTexture(cv));
  }

  function veMatBai(x, X0, Y0, W, H, r, s) {
    var ky = TL.BAC_KY[r], mau = MAU_CHAT[s], ve = VE_CHAT[s], heo = (r === 12), ach = (r === 11);
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
      x.font = '700 ' + Math.round(W * (r === 7 ? 0.20 : 0.245)) + 'px "Lora",Georgia,serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(ky, W * 0.135, H * 0.093);
      ve(x, W * 0.135, H * 0.175, W * 0.058, mau);
      x.restore();
    }
    goc(0); goc(1);

    // ruột lá
    var IX = W * 0.235, IW = W * 0.53, IY = H * 0.085, IH = H * 0.83;
    if (r <= 7) {
      var ps = PIP[r + 3];
      for (var p = 0; p < ps.length; p++) {
        var px = IX + ps[p][0] * IW, py = IY + ps[p][1] * IH, sz = W * 0.105;
        if (ps[p][2]) { x.save(); x.translate(px, py); x.rotate(Math.PI); ve(x, 0, 0, sz, mau); x.restore(); }
        else ve(x, px, py, sz, mau);
      }
    } else if (r <= 10) {
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
  function H() { return scEl.clientHeight || 620; }

  function init3D() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W(), H());
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;      // tự bật needsUpdate trong animate khi có vật đang động
    scEl.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0e16);        // đồng bộ nền xanh đêm của game
    // ⚠ CAMERA TRỰC GIAO, KHÔNG phải phối cảnh.
    // Camera phối cảnh nhìn chéo thì MỌI đường song song đều hội tụ về điểm tụ ⇒ hàng bài của nhà
    // Đông/Tây (chạy dọc trục z) luôn NGHIÊNG, hạ fov chỉ đỡ chứ không hết. Trực giao thì đường song
    // song vẫn song song ⇒ hàng bài thẳng tuyệt đối, mà vẫn còn khối 3D (cạnh bàn, độ dày lá bài).
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 320);
    try { var pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(envTex()).texture; } catch (e) { }

    scene.add(new THREE.HemisphereLight(0xfff1dd, 0x241c16, 0.26));
    var key = new THREE.DirectionalLight(0xfff6ea, 1.16);
    key.position.set(5.5, 15.5, 7.5); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);         // bàn nhỏ, bóng lá bài mềm — 2048 chỉ tổ tốn
    var sc = key.shadow.camera; sc.near = 1; sc.far = 52; sc.left = -11; sc.right = 11; sc.top = 12; sc.bottom = -12;
    key.shadow.bias = -0.0006; scene.add(key);
    var fill = new THREE.DirectionalLight(0xf3ece2, 0.19); fill.position.set(-9, 7, -6); scene.add(fill);
    var rimA = new THREE.PointLight(0xffbe78, 0.42, 30); rimA.position.set(-8, 3.2, 7); scene.add(rimA);
    var rimB = new THREE.PointLight(0xc6d8f0, 0.20, 30); rimB.position.set(8, 3.0, -7); scene.add(rimB);

    // phông vô cực (không nhận sáng — tránh vệt nối chỗ sàn cong lên)
    var dp = [], i, R0 = 24, RC = 15, WT = 62;
    for (i = 0; i <= 14; i++) dp.push(new THREE.Vector2(R0 * i / 14, 0));
    for (i = 1; i <= 20; i++) { var a = (Math.PI / 2) * (i / 20); dp.push(new THREE.Vector2(R0 + RC * Math.sin(a), RC - RC * Math.cos(a))); }
    for (i = 1; i <= 6; i++) dp.push(new THREE.Vector2(R0 + RC, RC + (WT - RC) * (i / 6)));
    var dome = new THREE.Mesh(new THREE.LatheGeometry(dp, 72),
      new THREE.MeshBasicMaterial({ map: domeTex(), side: THREE.DoubleSide, fog: false }));
    dome.position.y = -TH / 2 - 0.002; scene.add(dome);
    var sf = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.42 }));
    sf.rotation.x = -Math.PI / 2; sf.position.y = -TH / 2 - 0.001; sf.receiveShadow = true; scene.add(sf);

    banGroup = new THREE.Group(); scene.add(banGroup);

    // thân bàn bát giác gỗ gụ
    var go = goTex(512, 512); go.wrapS = go.wrapT = THREE.RepeatWrapping; go.repeat.set(0.16, 0.16);
    var BEV = 0.08;
    var slabGeo = new THREE.ExtrudeGeometry(batGiacShape(R_BAN),
      { depth: TH - BEV * 2, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: 3, curveSegments: 2 });
    slabGeo.rotateX(-Math.PI / 2); slabGeo.translate(0, -(TH / 2 - BEV), 0);
    var slab = new THREE.Mesh(slabGeo, new THREE.MeshPhysicalMaterial({
      map: go, color: 0x9a9a9a, roughness: 0.60, metalness: 0, clearcoat: 0.24, clearcoatRoughness: 0.5, envMapIntensity: 0.26
    }));
    slab.castShadow = true; slab.receiveShadow = true; banGroup.add(slab);

    // mặt nỉ — PHẢI nằm TRÊN mặt slab (slab đã ở TOPY), không thì bị chính thân bàn che
    var NI_Y = TOPY + 0.004, GO_Y = TOPY + 0.006, GO_DAY = 0.05;
    var niGeo = new THREE.ShapeGeometry(batGiacShape(R_NI), 2);
    var np = niGeo.attributes.position, nu = niGeo.attributes.uv;
    for (var ni = 0; ni < np.count; ni++) nu.setXY(ni, (np.getX(ni) + R_NI) / (R_NI * 2), (np.getY(ni) + R_NI) / (R_NI * 2));
    nu.needsUpdate = true;
    var ni2 = new THREE.Mesh(niGeo, new THREE.MeshPhysicalMaterial({
      map: niTex(1024), roughness: 0.95, metalness: 0, envMapIntensity: 0.06
    }));
    ni2.rotation.x = -Math.PI / 2; ni2.position.y = NI_Y; ni2.receiveShadow = true; banGroup.add(ni2);

    // vành gỗ = khối ĐÙN có lỗ bát giác (đùn mới có thành đứng → gờ thật, nỉ trũng xuống)
    var vanhShape = batGiacShape(R_BAN - BEV);
    vanhShape.holes.push(batGiacShape(R_NI));
    var vanhGeo = new THREE.ExtrudeGeometry(vanhShape, { depth: GO_DAY, bevelEnabled: false, curveSegments: 2 });
    vanhGeo.rotateX(-Math.PI / 2);
    var go2 = goTex(512, 512); go2.wrapS = go2.wrapT = THREE.RepeatWrapping; go2.repeat.set(0.1, 0.1);
    var vanh = new THREE.Mesh(vanhGeo, new THREE.MeshPhysicalMaterial({
      map: go2, color: 0xb0a89e, roughness: 0.5, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.42, envMapIntensity: 0.24
    }));
    vanh.position.y = GO_Y + GO_DAY; vanh.receiveShadow = true; vanh.castShadow = true; banGroup.add(vanh);

    // chỉ vàng chạy quanh mép trong của gờ
    var pts = [], i2;
    for (i2 = 0; i2 <= 8; i2++) { var aa = Math.PI / 8 + i2 * Math.PI / 4; pts.push(new THREE.Vector3(Math.cos(aa) * (R_NI + 0.012), GO_Y + GO_DAY + 0.001, Math.sin(aa) * (R_NI + 0.012))); }
    banGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x8d7343, transparent: true, opacity: 0.75 })));

    // hình học + vật liệu lá bài dùng chung
    var BEVC = 0.004;
    var laGeo = new THREE.ExtrudeGeometry(laBaiShape(),
      { depth: CT, bevelEnabled: true, bevelThickness: BEVC, bevelSize: 0.006, bevelSegments: 1, curveSegments: 3 });
    // ExtrudeGeometry trải z từ -bevelThickness tới depth+bevelThickness ⇒ KHÔNG đối xứng quanh 0.
    // Dịch đúng -depth/2 mới cân; dịch quá tay thì mặt lưng bị chôn vào trong thân và biến mất.
    laGeo.translate(0, 0, -CT / 2);
    GEO.la = laGeo;
    GEO.nua = CT / 2 + BEVC + 0.0016;           // nửa độ dày THẬT + kẽ hở, để mặt bài nằm NGOÀI thân
    GEO.mat = new THREE.PlaneGeometry(CW * 0.985, CH * 0.985);
    atlasTex = atlas(); backTex = lungBai();
    MAT.than = new THREE.MeshPhysicalMaterial({ color: 0xa39a88, roughness: 0.55, metalness: 0, clearcoat: 0.2, clearcoatRoughness: 0.4, envMapIntensity: 0.16 });
    // Mặt bài là GIẤY: bỏ hẳn clearcoat (lớp bóng phủ chính là cái "phản quang mờ mờ"), nhám cao,
    // gần như không bắt phản chiếu môi trường ⇒ chữ và chất ăn màu thật, sắc nét.
    MAT.mat = new THREE.MeshStandardMaterial({ map: atlasTex, roughness: 0.82, metalness: 0, envMapIntensity: 0.03 });
    MAT.lung = new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.78, metalness: 0, envMapIntensity: 0.04 });
    MAT.mo = new THREE.MeshBasicMaterial({ color: 0x05070b, transparent: true, opacity: 0.52, depthWrite: false });

    pileGroup = new THREE.Group(); scene.add(pileGroup);
    // bụi sáng lơ lửng bay lên — cùng khuôn với Cờ Tướng / Cờ Vua / Ngũ Tử Kỳ
    if (!reduce) { try { particles = taoBui(); scene.add(particles); } catch (e) { } }
    for (var s2 = 0; s2 < 3; s2++) { var g3 = new THREE.Group(); handGroups.push(g3); scene.add(g3); }

    var el = renderer.domElement;
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);
  }

  /** UV con trong atlas cho lá `c`. */
  function matGeoFor(c) {
    var g = GEO.mat.clone();
    var r = TL.bacOf(c), s = TL.chatOf(c);
    var u0 = r / 13, du = 1 / 13, v0 = 1 - (s + 1) / 4, dv = 1 / 4;
    var m = 0.004;   // co vào chút cho khỏi rỉ pixel ô bên cạnh
    var uv = g.attributes.uv;
    uv.setXY(0, u0 + du * m, v0 + dv * (1 - m)); uv.setXY(1, u0 + du * (1 - m), v0 + dv * (1 - m));
    uv.setXY(2, u0 + du * m, v0 + dv * m); uv.setXY(3, u0 + du * (1 - m), v0 + dv * m);
    uv.needsUpdate = true;
    return g;
  }

  /** Một lá bài = group (thân + mặt + lưng). */
  function taoLa(c) {
    var g = new THREE.Group();
    var than = new THREE.Mesh(GEO.la, MAT.than);
    than.castShadow = true; g.add(than);
    var mat = new THREE.Mesh(matGeoFor(c), MAT.mat); mat.position.z = GEO.nua; g.add(mat);
    var lung = new THREE.Mesh(GEO.mat, MAT.lung); lung.position.z = -GEO.nua; lung.rotation.y = Math.PI; g.add(lung);
    // children[3] = màn mờ phủ mặt bài, bật khi lá KHÔNG góp được vào nước hợp lệ nào.
    // Phải làm bằng mesh phủ chứ đừng đổi material: 52 lá dùng CHUNG một material, đổi là đổi hết.
    // material RIÊNG cho từng lá (rẻ — không texture) để mờ dần được; dùng chung thì cả bộ bài mờ theo
    var mo = new THREE.Mesh(GEO.mat, new THREE.MeshBasicMaterial({ color: 0x05070b, transparent: true, opacity: 0, depthWrite: false }));
    mo.position.z = GEO.nua + 0.0014; mo.visible = false; mo.userData.mo = false; g.add(mo);
    g.userData.card = c;
    return g;
  }

  // ---------- tween ----------
  // tucThi = dựng thế TĨNH ngay (dùng khi chụp ảnh: thời gian ảo của headless không nhả rAF đủ khung)
  var tucThi = !!opts.tucThi;
  function tween(obj, p1, q1, dur, delay) {
    if (tucThi) { obj.position.copy(p1); obj.quaternion.copy(q1); return; }
    tweens.push({ o: obj, p0: obj.position.clone(), p1: p1, q0: obj.quaternion.clone(), q1: q1, t: -(delay || 0), d: dur });
  }
  function stepTweens(dt) {
    for (var i = tweens.length - 1; i >= 0; i--) {
      var w = tweens[i]; w.t += dt;
      if (w.t < 0) continue;
      var u = Math.min(1, w.t / w.d), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      w.o.position.lerpVectors(w.p0, w.p1, e);
      w.o.quaternion.copy(w.q0).slerp(w.q1, e);   // API instance — static Quaternion.slerp đã bỏ ở bản mới
      if (u >= 1) tweens.splice(i, 1);
    }
  }
  function tweensXong() { return tweens.length === 0; }

  // ---------- bố trí bài ----------
  // XẾP HÀNG NGANG THẲNG (arc = 0). Xòe theo cung thì lá sau đè chéo lên lá trước, nhìn không ra đủ bài.
  //   step PHẢI ≥ bề rộng lá (CW × scale) thì mỗi lá mới hiện trọn:
  //   người chơi 0.70×0.94 = 0.658 < 0.66 ⇒ 13 lá liền nhau, không lá nào bị che.
  // Ba nhà để bài NẰM SẤP HẲN (tilt = +π/2 ⇒ lưng đỏ ngửa lên). ⚠ Đừng để nghiêng dở dang (1.42 ≈ lệch
  // 8,6°): 13 lá nghiêng chồng lên nhau thì mép chồng thành đường răng cưa CHÉO, nhìn như xếp lệch hàng.
  var HAND_ANCHOR = [
    // step 0.52 < bề rộng lá (0.70×1.88 = 1.32) ⇒ chồng ~60%, nhưng góc trên-trái (bậc + chất) chỉ
    // chiếm ~0.27 nên vẫn đọc thoải mái, mà 13 lá nằm gọn trong mép bàn thay vì thò ra ngoài.
    // ⚠ y phải đủ cao: lá nghiêng 58° nên ĐÁY lá tụt xuống 0.48 so với tâm. Để y=0.72 thì đáy rơi xuống
    //   0.24 — thấp hơn mặt nỉ (0.264) và vành gỗ (0.316) ⇒ hai đầu bài bị vành gỗ CẮT NGANG mất chân.
    //   y=0.90 ⇒ đáy ở 0.42, nổi hẳn trên vành, đúng kiểu bài đang cầm trên tay.
    // ⚠ BA cửa: mình ở mép gần, hai nhà kia HAI BÊN (trái · phải). KHÔNG có nhà đối diện —
    // user chốt bằng ảnh mẫu. Bản trước kê hai nhà ở hai góc trên (φ = ±120°) thì quạt bài
    // chạy chéo vào giữa bàn, nhìn ra hai dải xiên — HỎNG, đừng làm lại.
    // rotY = ∓π/2 làm quạt bài chạy dọc trục z ⇒ trên màn là một CỘT DỌC gọn ở mép trái/phải.
    //
    // ⚠ 16 lá chứ không phải 13 như Tiến Lên: giữ step 0.52 là trải 14.7, thò hẳn ra ngoài mép bàn.
    // 0.41 cho trải 11.6 — đúng bằng bề ngang Tiến Lên vẫn dùng, lá lộ 59% (bậc+chất chỉ chiếm 27%).
    { pos: [0, 0.90, 3.95], rotY: 0, tilt: -1.02, arc: 0, step: 0.41, scale: 1.88 },
    { pos: [4.45, 0.30, -0.95], rotY: -Math.PI / 2, tilt: Math.PI / 2, arc: 0, step: 0.24, scale: 0.72 },
    { pos: [-4.45, 0.30, -0.95], rotY: Math.PI / 2, tilt: Math.PI / 2, arc: 0, step: 0.24, scale: 0.72 }
  ];

  /**
   * Khổ dọc: trải hết 13 lá không chồng thì camera phải lùi xa, lá bé tí không đọc nổi.
   * Nên ở màn hẹp cho chồng một phần (vẫn THẲNG HÀNG) đổi lấy lá to — góc trên trái vẫn đọc rõ bậc + chất.
   */
  function anchorOf(s) {
    var A = HAND_ANCHOR[s];
    if (s === 0 && W() / H() < 1) return { pos: A.pos, rotY: A.rotY, tilt: A.tilt, arc: 0, step: 0.39, scale: 2.0 };
    return A;
  }

  /** Vị trí đích của lá thứ i / tổng n trên tay cửa `s`. */
  function viTriTay(s, i, n, nhac) {
    var A = anchorOf(s);
    var mid = (n - 1) / 2, off = i - mid;
    var lx2 = off * A.step * A.scale;
    var ly2 = -Math.abs(off) * A.arc * A.scale * A.scale + (nhac ? 0.30 : 0);
    var lz2 = i * 0.0035;
    var rz = -off * A.arc * 0.55;

    var e = new THREE.Euler(A.tilt, 0, 0, 'XYZ');
    var qTilt = new THREE.Quaternion().setFromEuler(e);
    var qYaw = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, A.rotY, 0, 'XYZ'));
    var qRz = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, rz, 'XYZ'));
    var q = new THREE.Quaternion().multiplyQuaternions(qYaw, qTilt).multiply(qRz);

    var v = new THREE.Vector3(lx2, ly2, lz2).applyQuaternion(new THREE.Quaternion().multiplyQuaternions(qYaw, qTilt));
    var p = new THREE.Vector3(A.pos[0], A.pos[1], A.pos[2]).add(v);
    return { p: p, q: q, s: A.scale };
  }

  function xepLai(s, animate) {
    var g = handGroups[s], list = hands[s], i;
    // cửa NPC chỉ hiện lưng bài; cửa người chơi hiện mặt
    for (i = 0; i < g.children.length; i++) g.children[i].userData.keep = false;
    var can = {};
    for (i = 0; i < list.length; i++) can[list[i]] = 1;
    for (i = g.children.length - 1; i >= 0; i--) {
      var ch = g.children[i];
      if (!can[ch.userData.card]) { g.remove(ch); }
    }
    var thuTu = list.slice();
    if (s === 0 && xepBo) thuTu = xepTheoBo(list);
    for (i = 0; i < thuTu.length; i++) {
      var c = thuTu[i], m = null, j;
      for (j = 0; j < g.children.length; j++) if (g.children[j].userData.card === c) { m = g.children[j]; break; }
      if (!m) { m = taoLa(c); g.add(m); }
      var t = viTriTay(s, i, thuTu.length, s === 0 && chon[c]);
      m.scale.setScalar(t.s);
      m.renderOrder = i;
      // bài ba nhà nằm sấp sát mặt bàn, bóng gần như không thấy — bỏ đổ bóng, còn ~26 vật thay vì 52
      m.children[0].castShadow = (s === 0);
      if (s !== 0) { m.children[1].visible = false; }   // giấu mặt bài NPC
      if (animate) tween(m, t.p, t.q, 0.28, i * 0.012);
      else { m.position.copy(t.p); m.quaternion.copy(t.q); }
    }
  }

  /**
   * Xếp bài theo bộ: các lá cùng bậc đứng liền nhau, bậc nào NHIỀU lá đứng trước.
   * PDK không có hàm tháo bài sẵn như Tiến Lên nên gom tay bằng chính bảng đếm bậc —
   * đủ để mắt thấy ngay "chỗ này có tứ quý, chỗ kia có đôi".
   */
  function xepTheoBo(list) {
    var m = {};
    for (var i = 0; i < list.length; i++) (m[TL.bacOf(list[i])] || (m[TL.bacOf(list[i])] = [])).push(list[i]);
    var gs = Object.keys(m).map(Number).map(function (b) { return m[b]; });
    gs.sort(function (a, b) { return b.length - a.length || a[0] - b[0]; });
    var o = [];
    for (var g = 0; g < gs.length; g++) for (var j = 0; j < gs[g].length; j++) o.push(gs[g][j]);
    return o;
  }

  // Bước xếp chồng = ĐÚNG bề dày một lá + kẽ hở nhỏ chống z-fighting.
  // Bề dày thật một lá = 2 × GEO.nua = 2 × (CT/2 + BEVC + 0.0016) = 0.0332.
  // Bề dày KHÔNG còn bị phóng theo (xem m.scale.set(2,2,1) dưới), nên bước cũ 0.072
  // giờ là thừa hơn gấp đôi — để nguyên thì lá nằm lơ lửng cách nhau.
  var pileN = 0, lopLa = 0;
  var DAY_LA = 0.035, PILE_MAX = 12;
  function raBaiRa(s, cards) {
    var g = handGroups[s], i, k = 0;
    var n = cards.length, mid = (n - 1) / 2;
    var lop = pileN++;
    for (i = 0; i < n; i++) {
      var c = cards[i], m = null, j;
      for (j = 0; j < g.children.length; j++) if (g.children[j].userData.card === c) { m = g.children[j]; break; }
      if (!m) { m = taoLa(c); }
      else g.remove(m);
      // Phóng MẶT bài ×2 cho dễ nhìn giữa bàn, nhưng GIỮ NGUYÊN BỀ DÀY (trục z là bề dày,
      // vì hình được đùn theo z rồi mới xoay nằm ngang). Trước đây setScalar(2) phóng cả bề
      // dày lên 0,066 — lá bài ném xuống bàn mà tự dày gấp đôi, chồng lên thành núi.
      m.scale.set(2, 2, 1);
      m.children[1].visible = true;
      pileGroup.add(m);
      var ang = (lop * 0.9) % (Math.PI * 2);
      var spread = Math.min(0.92, 5.2 / Math.max(1, n));
      var px = (i - mid) * spread, pz = 0;
      var rx = Math.cos(ang) * px - Math.sin(ang) * pz;
      var rz = Math.sin(ang) * px + Math.cos(ang) * pz;
      var jit = (lop % 5 - 2) * 0.10;
      var p = new THREE.Vector3(rx + jit * 0.4, TOPY + 0.026 + (lopLa++) * DAY_LA, rz + jit * 0.3);
      var q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, -ang + (i - mid) * 0.03, 'YXZ'));
      m.position.copy(m.getWorldPosition(new THREE.Vector3()));
      m.quaternion.copy(m.getWorldQuaternion(new THREE.Quaternion()));
      m.children[0].castShadow = true;
      if (m.children[3]) m.children[3].visible = false;      // bài đã ra thì bỏ màn mờ
      tween(m, p, q, 0.34, k * 0.045); k++;
    }
    // Dọn bớt bài cũ cho nhẹ, RỒI HẠ CẢ ĐỐNG XUỐNG đúng phần vừa bỏ — không hạ thì đống cứ cao mãi
    // theo số lá đã từng đánh và trôi dần lên khỏi mặt bàn.
    var boDem = 0;
    while (pileGroup.children.length > PILE_MAX) { pileGroup.remove(pileGroup.children[0]); boDem++; }
    if (boDem) {
      var dy = boDem * DAY_LA;
      lopLa -= boDem;
      for (var q = 0; q < pileGroup.children.length; q++) pileGroup.children[q].position.y -= dy;
      // lá đang bay cũng phải hạ theo, cả điểm đi lẫn điểm đến
      for (var w = 0; w < tweens.length; w++) {
        if (tweens[w].o.parent === pileGroup) { tweens[w].p0.y -= dy; tweens[w].p1.y -= dy; }
      }
    }
  }

  function chiaBaiAnim() {
    var s, i;
    for (s = 0; s < 3; s++) {
      var g = handGroups[s];
      while (g.children.length) g.remove(g.children[0]);
      for (i = 0; i < hands[s].length; i++) {
        var m = taoLa(hands[s][i]);
        if (s !== 0) m.children[1].visible = false;
        m.position.set(0, TOPY + 0.9, 0);
        m.quaternion.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0, 'XYZ'));
        m.scale.setScalar(HAND_ANCHOR[s].scale);
        g.add(m);
        var t = viTriTay(s, i, hands[s].length, false);
        tween(m, t.p, t.q, 0.34, i * 0.028 + s * 0.018);   // chia xong trong ~0.8s, đừng bắt người chơi ngồi đợi
      }
    }
    while (pileGroup.children.length) pileGroup.remove(pileGroup.children[0]);
    pileN = 0; lopLa = 0;
  }

  // ---------- camera ----------
  /** 4 góc THẬT của lá thứ i trên tay cửa s (đã tính nghiêng + phóng + lúc nhấc lá lên). */
  function gocLa(s, i, n) {
    var t = viTriTay(s, i, n, s === 0), o = [];
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) {
      o.push(new THREE.Vector3(c[0] * CW / 2 * t.s, c[1] * CH / 2 * t.s, 0).applyQuaternion(t.q).add(t.p));
    });
    return o;
  }
  /** Mốc canh khung: mép bàn + góc bài của CẢ BỐN cửa. Thiếu bài ba nhà là họ bị cắt mép. */
  function moc() {
    var p = [], i, s;
    // Khổ dọc: ôm trọn cả vành gỗ thì camera lùi xa, lá bài bé không đọc nổi.
    // Cho phép cắt bớt vành, chỉ giữ trọn mặt nỉ — đổi lại lá bài to hơn ~1/4.
    var Rm = (W() / H() < 1) ? R_NI + 0.30 : R_BAN;
    for (i = 0; i < 8; i++) {
      var a = Math.PI / 8 + i * Math.PI / 4;
      p.push(new THREE.Vector3(Math.cos(a) * Rm, TOPY, Math.sin(a) * Rm));
      p.push(new THREE.Vector3(Math.cos(a) * Rm, -TH / 2, Math.sin(a) * Rm));
    }
    for (s = 0; s < 3; s++) {
      [0, 8, 15].forEach(function (i2) { Array.prototype.push.apply(p, gocLa(s, i2, 16)); });   // 16 lá, không phải 13
    }
    return p;
  }
  // Trực giao: khoảng cách camera KHÔNG quyết định to/nhỏ nữa, chỉ cần đủ xa để near không cắt bàn.
  // ⚠ ĐỪNG để xa quá: tia chiếu song song xuất phát từ cả một MẶT PHẲNG rộng bằng khung ngắm, đặt ở 70
  //   thì mép dưới mặt phẳng đó nằm ngoài vòm phông → nửa màn hình đen kịt vì nhìn vào lưng vòm.
  var R_CAM = 20;
  function camAt(r) {
    return new THREE.Vector3(
      target.x + r * Math.sin(sph.phi) * Math.sin(sph.theta),
      target.y + r * Math.cos(sph.phi),
      target.z + r * Math.sin(sph.phi) * Math.cos(sph.theta));
  }
  /** Đặt bề cao khung ngắm (đơn vị thế giới) — với trực giao đây mới là thứ quyết định to/nhỏ. */
  function datKhoOng(size) {
    var a = W() / H();
    camera.left = -size * a / 2; camera.right = size * a / 2;
    camera.top = size / 2; camera.bottom = -size / 2;
    camera.updateProjectionMatrix();
  }
  /** Nhị phân tìm khung ngắm NHỎ nhất mà mọi điểm mốc còn lọt, rồi bù lệch cho CÂN. */
  function canKhung() {
    if (!camera) return;
    // màn dọc: chiều ngang là ràng buộc, siết nhẹ hơn kẻo bàn bị đẩy ra xa thành bé tí
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
    // 3 vòng: siết khung rồi canh giữa (đổi target thì hộp bao đổi theo)
    for (var pass = 0; pass < 3; pass++) {
      var lo = 2, hi = 90, mid;
      for (var it = 0; it < 26; it++) {
        mid = (lo + hi) / 2;
        var b = boxAt(mid);
        var vua = Math.max(-b.mnx, b.mxx, -b.mny, b.mxy) <= LIM;
        if (vua) hi = mid; else lo = mid;
      }
      rFit = hi;
      var b2 = boxAt(rFit);
      var cx = (b2.mnx + b2.mxx) / 2, cy = (b2.mny + b2.mxy) / 2;
      if (Math.abs(cx) < 0.004 && Math.abs(cy) < 0.004) break;
      // dịch tâm ngắm theo hai trục màn hình để hộp bao về giữa
      var right = new THREE.Vector3(), up = new THREE.Vector3();
      camera.matrixWorld.extractBasis(right, up, new THREE.Vector3());
      var hH = rFit, hW = hH * (W() / H());          // trực giao: khung ngắm CHÍNH LÀ bề rộng thế giới
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
    datSeat();      // thẻ tên bám theo camera — chỉ cần tính lại ĐÚNG LÚC camera đổi
  }
  function onResize() {
    if (!renderer) return;
    renderer.setSize(W(), H());
    var z = sph.zoom || 1; target.set(0, 0, 0); canKhung(); sph.zoom = z; updCam();
  }

  // ---------- tương tác ----------
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
  function onUp(e) {
    if (drag && moved < 6 && !spectate) pick(e);
    drag = false;
  }
  function onWheel(e) {
    if (!spectate) return;
    e.preventDefault();
    sph.zoom = Math.max(0.62, Math.min(1.55, (sph.zoom || 1) + e.deltaY * 0.0009));
    updCam();
  }
  function pick(e) {
    if (over || dangCho || luot !== 0) return;
    var rc = renderer.domElement.getBoundingClientRect();
    ptr.x = ((e.clientX - rc.left) / rc.width) * 2 - 1;
    ptr.y = -((e.clientY - rc.top) / rc.height) * 2 + 1;
    ray.setFromCamera(ptr, camera);
    var hits = ray.intersectObjects(handGroups[0].children, true);
    if (!hits.length) return;
    var o = hits[0].object;
    while (o && o.userData.card === undefined) o = o.parent;
    if (!o) return;
    var c = o.userData.card;
    if (chon[c]) delete chon[c]; else chon[c] = 1;
    xepLai(0, true);
    capNhatNut();
  }

  // ---------- HUD ----------
  var seatEls = [], sayEls = [];
  function taoSeat() {
    for (var s = 1; s < 3; s++) {
      var d = document.createElement('div');
      d.className = 'pk-seat';
      d.innerHTML = '<img class="pk-av" alt="" src="' + CUA[s].art + '" onerror="this.style.visibility=\'hidden\'">' +
        '<div><div class="nm">' + CUA[s].ten + '</div><div class="bh">' + (CUA[s].bietHieu || '') + '</div>' +
        '<div class="ct"><span class="bd"></span><span class="n">13 lá</span></div></div>';
      root.appendChild(d); seatEls[s] = d;
      var b = document.createElement('div'); b.className = 'pk-say'; root.appendChild(b); sayEls[s] = b;
    }
  }
  // neo thẻ tên ra NGOÀI mép bàn, không thì nó nằm đè lên chính bài của nhà đó
  // Hai nhà ngồi hai bên ⇒ thẻ tên treo ở hai góc TRÊN, lệch hẳn ra ngoài cột bài.
  var SEAT_ANCHOR = [null, new THREE.Vector3(8.4, 2.2, -1.2), new THREE.Vector3(-8.4, 2.2, -1.2)];
  // Khung hẹp thì thẻ tên đứng CỐ ĐỊNH: bám theo vị trí 3D ở màn nhỏ là kiểu gì cũng có lúc lòi ra mép.
  var SEAT_CO_DINH = [null, { x: 0.86, y: 0.40 }, { x: 0.14, y: 0.40 }];
  // ⚠ ĐỪNG gọi mỗi khung: mỗi lượt gọi là 6 lần getBoundingClientRect ⇒ 6 lần ép trình duyệt
  // tính lại bố cục. Camera đứng yên thì vị trí thẻ cũng đứng yên — chỉ gọi khi camera/nội dung đổi.
  function datSeat() {
    if (!camera || !seatEls[1]) return;
    var rc = { w: scEl.clientWidth, h: scEl.clientHeight }, hep = rc.w < 620;
    for (var s = 1; s < 3; s++) {
      var el = seatEls[s], w = el.getBoundingClientRect().width || 150, h = el.getBoundingClientRect().height || 44;
      var px, py;
      if (hep) {
        px = SEAT_CO_DINH[s].x * rc.w; py = SEAT_CO_DINH[s].y * rc.h;
      } else {
        var v = SEAT_ANCHOR[s].clone().project(camera);
        px = (v.x * 0.5 + 0.5) * rc.w; py = (-v.y * 0.5 + 0.5) * rc.h;
      }
      // ⚠ KHÔNG ghim thẻ lên đỉnh khung. Đó là luật của bàn BỐN người (nhà đối diện nằm sát mép xa
      // nên thẻ phải trốn lên trên). Bàn ba người thì hai nhà ngồi HAI BÊN, thẻ treo ngang cột bài
      // của chính họ mới đọc ra ai là ai — mà ghim lên đỉnh thì nó còn đè lên tiêu đề và toast.
      // Không cần chốt chống đè: thẻ ở x = ±8.4, cột bài ở ±4.45, cách nhau hẳn theo trục ngang.
      px = Math.max(w / 2 + 5, Math.min(rc.w - w / 2 - 5, px));
      py = Math.max(h / 2 + (hep ? 76 : 6), Math.min(rc.h - h / 2 - 74, py));
      el.style.left = px + 'px'; el.style.top = py + 'px';
      // Bong bóng thoại xuống DƯỚI thẻ (để phía trên thì nó đè tiêu đề) và phải CLAMP RIÊNG theo
      // bề rộng của chính nó — bám tâm thẻ thì nhà ngồi sát mép là lời thoại bị cắt cụt.
      var sEl = sayEls[s], sw = sEl.getBoundingClientRect().width || 170;
      var sx = Math.max(sw / 2 + 6, Math.min(rc.w - sw / 2 - 6, px));
      sEl.style.left = sx + 'px'; sEl.style.top = (py + h / 2 + 6) + 'px';
    }
  }
  function capNhatSeat() {
    for (var s = 1; s < 3; s++) {
      var el = seatEls[s];
      el.className = 'pk-seat' + (luot === s && !over ? ' act' : '') + (daBo[s] && hands[s].length ? ' pass' : '') + (hands[s].length === 0 ? ' done' : '');
      var n = el.querySelector('.ct .n');
      if (hands[s].length === 0) {
        var h = xong.indexOf(s);
        n.textContent = 'Hết bài';
      } else n.textContent = hands[s].length + ' lá' + (daBo[s] ? ' · đã bỏ lượt' : '');
    }
    datSeat();      // chữ đổi ⇒ bề rộng thẻ đổi ⇒ phải canh lại
  }
  var sayTimer = [];
  function noi(s, text) {
    if (s === 0 || !sayEls[s]) return;
    sayEls[s].textContent = text;
    sayEls[s].classList.add('show');
    datSeat();      // bong bóng vừa có chữ ⇒ có bề rộng ⇒ canh lại cho khỏi lòi mép
    clearTimeout(sayTimer[s]);
    sayTimer[s] = setTimeout(function () { sayEls[s].classList.remove('show'); }, 2600);
  }
  function npcNoi(s, nhom, ep) {
    if (!ep && (saidN >= 5 || rnd() > 0.3)) return;
    var ds = LOI[nhom]; if (!ds || !ds.length) return;
    saidN++;
    noi(s, ds[Math.floor(rnd() * ds.length)]);
  }

  // Bậc báo sự kiện: 0 thường · 1 đáng chú ý · 2 mạnh · 3 chặt · 4 về Nhất (to nhất, rung bàn)
  // `glow` = màu pha loãng cho vòng chớp — Kỳ Trận pha accent chỉ ~30%, đậm hơn là loá cả bàn
  var CUE_BAC = [
    { co: 21, mau: '#cdbb99', glow: 'rgba(205,187,153,.16)' },
    { co: 26, mau: '#f4d99a', glow: 'rgba(230,192,121,.22)' },
    { co: 33, mau: '#f0a868', glow: 'rgba(240,168,104,.26)' },
    { co: 40, mau: '#ef7d6a', glow: 'rgba(239,125,106,.30)' },
    { co: 48, mau: '#ffd76a', glow: 'rgba(255,215,106,.34)' }
  ];
  var cueT = 0, giuCue = false;
  /** Báo sự kiện lớn GIỮA BÀN — dựng lại DOM mỗi lần như `skillCue()` của Kỳ Trận. */
  function cue(txt, bac, ai) {
    bac = Math.max(0, Math.min(4, bac | 0));
    var b = CUE_BAC[bac], hep = scEl.clientWidth < 620;
    var cu = root.querySelector('.pk-skcue'); if (cu) cu.remove();
    var box = document.createElement('div');
    box.className = 'pk-skcue b' + bac;
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
    if (giuCue) { box.classList.add('giu'); return; }       // ?cue=0..4 — giữ nguyên để chụp ảnh
    requestAnimationFrame(function () {
      var ds = box.querySelectorAll('.sk-streak,.sk-flash,.sk-nm,.sk-who,.sk-shard');
      for (var k = 0; k < ds.length; k++) ds[k].classList.add('go');
    });
    if (bac >= 3) { scEl.classList.remove('sk'); void scEl.offsetWidth; scEl.classList.add('sk'); }
    clearTimeout(cueT);
    cueT = setTimeout(function () { try { box.remove(); } catch (e) { } scEl.classList.remove('sk'); }, 1300);
  }

  var toastT = 0;
  function toast(m) {
    var t = $('.pk-toast'); t.textContent = m; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2100);
  }
  function capNhatCur() {
    var el = $('.pk-cur'), c = el.querySelector('.ct');
    if (over) { el.style.display = 'none'; return; }
    el.style.display = '';
    if (!cur) c.innerHTML = (luot === 0 ? '<b>Lượt bạn</b> — được đánh tự do' : '<b>' + CUA[luot].ten + '</b> đang mở lượt');
    else c.innerHTML = 'Phải đè <b>' + TL.tenBo(cur) + '</b> của ' + CUA[chuBai].ten + (luot === 0 ? ' — <b>lượt bạn</b>' : '');
  }
  /**
   * Mờ những lá KHÔNG góp được vào bất kỳ nước hợp lệ nào — nhìn phát biết ngay còn đường nào không,
   * khỏi phải rà từng lá. Chỉ mờ khi ĐANG tới lượt mình; lượt người khác thì để nguyên cả bài.
   */
  function capNhatMo() {
    var g = handGroups[0], i, j, dung = {};
    if (luot === 0 && !over && !dangCho) {
      var mv = TL.genMoves(hands[0], cur);
      if (moBai) mv = mv.filter(function (m) { return m.cards.indexOf(0) >= 0; });
      for (i = 0; i < mv.length; i++) for (j = 0; j < mv[i].cards.length; j++) dung[mv[i].cards[j]] = 1;
    } else {
      for (i = 0; i < hands[0].length; i++) dung[hands[0][i]] = 1;
    }
    for (i = 0; i < g.children.length; i++) {
      var m = g.children[i];
      if (m.children[3]) m.children[3].userData.mo = !dung[m.userData.card];   // chỉ đặt ĐÍCH, animate lo phần mờ dần
    }
  }

  /** Mờ dần/sáng dần màn phủ — bật tắt thẳng thì nó nhảy bụp một cái, rất chối mắt. */
  function stepMo(dt) {
    var g = handGroups[0], k = Math.min(1, dt * 9), i;
    for (i = 0; i < g.children.length; i++) {
      var mo = g.children[i].children[3]; if (!mo) continue;
      var to = mo.userData.mo ? 0.5 : 0, o = mo.material.opacity;
      if (Math.abs(o - to) < 0.004) o = to; else o += (to - o) * k;
      mo.material.opacity = o;
      mo.visible = o > 0.012;
    }
  }

  var luotCu = -1;
  function nhipLuot() {
    if (luot === luotCu) return;
    var truoc = luotCu; luotCu = luot;
    if (luot !== 0 || over || truoc < 0) return;
    var el = $('.pk-turn');
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  }

  function capNhatNut() {
    capNhatMo(); nhipLuot();
    var cs = Object.keys(chon).map(Number);
    var bo = cs.length ? TL.classify(cs) : null;
    var hopLe = !!bo && TL.beats(bo, cur);
    if (hopLe && moBai && cs.indexOf(0) < 0) hopLe = false;    // lượt mở màn phải có Ba Bích
    var bDanh = $('[data-a="danh"]'), bBo = $('[data-a="bo"]');
    bDanh.className = 'pk-btn pri' + (hopLe && luot === 0 && !over && !dangCho ? '' : ' dis');
    bBo.className = 'pk-btn' + (luot === 0 && cur && !over && !dangCho ? '' : ' dis');
    $('[data-a="goiy"]').className = 'pk-btn ghost' + (luot === 0 && !over && !dangCho ? '' : ' dis');
  }

  // ---------- luồng ván ----------
  // ---------- ván dở: giữ qua F5 / rời view giữa chừng ----------
  /** Chụp lại ván đang chơi. Trả null nếu ván đã xong (không có gì để giữ). */
  function chupVan() {
    if (over) return null;
    return {
      hands: hands.map(function (h) { return h.slice(); }),
      cur: curCards.slice(),                 // lưu LÁ, dựng lại bộ bằng classify cho khỏi lệch phiên bản
      luot: luot, chuBai: chuBai, moBai: moBai,
      daBo: daBo.slice(), raBai: raBai.slice(), xong: xong.slice()
    };
  }
  function luuVan() { if (opts.onSave) { try { opts.onSave(chupVan()); } catch (e) { } } }

  function khoiPhuc(s) {
    var giu = tucThi; tucThi = true;         // dựng lại TĨNH — bài bay lả tả lúc F5 xong thì vô nghĩa
    hands = s.hands.map(function (h) { return h.slice(); });
    curCards = (s.cur || []).slice();
    cur = curCards.length ? TL.classify(curCards) : null;
    luot = s.luot | 0; chuBai = s.chuBai | 0; moBai = !!s.moBai;
    daBo = (s.daBo || []).slice(); raBai = (s.raBai || []).slice(); xong = (s.xong || []).slice();
    chon = {}; over = false; saidN = 0; dangCho = false;
    $('.pk-banner').classList.remove('show');
    for (var i = 0; i < 3; i++) { var g = handGroups[i]; while (g.children.length) g.remove(g.children[0]); xepLai(i, false); }
    while (pileGroup.children.length) pileGroup.remove(pileGroup.children[0]);
    pileN = 0; lopLa = 0;
    if (curCards.length) raBaiRa(chuBai, curCards);
    tucThi = giu;
    capNhatSeat(); capNhatCur(); capNhatNut();
    toast('Ván dở đã được bày lại.');
    if (luot !== 0) setTimeout(aiDi, 700);
  }

  function vanMoi(saved) {
    if (saved && saved.hands && saved.hands.length === 3) { khoiPhuc(saved); return; }
    var _chia = TL.deal(rnd); hands = _chia.tay;
    bomDem = [0, 0, 0]; thaVe = -1; loiTu = -1; loiCho = -1;
    cur = null; curCards = []; daBo = [false, false, false]; raBai = [false, false, false];
    // ⚠ PDK: cầm 3♥ chỉ để ĐI TRƯỚC — lượt mở màn KHÔNG bắt buộc phải kèm lá đó (khác Tiến Lên,
    // ở đó bộ đầu ván buộc có Ba Bích). Nên `moBai` để false luôn, mọi chốt ăn theo nó tự tắt.
    xong = []; chon = {}; over = false; saidN = 0; moBai = false; dangCho = true;
    // Ván đầu chiếu: ai cầm 3♥ đi trước. Từ ván sau: người chạy hết bài ván trước mở lượt.
    luot = (viTruoc == null) ? _chia.diTruoc : viTruoc; chuBai = luot;
    $('.pk-banner').classList.remove('show');
    chiaBaiAnim();
    capNhatSeat(); capNhatCur(); capNhatNut();
    setTimeout(function () {
      npcNoi(1 + Math.floor(rnd() * 3), 'vao', true);
      toast(luot === 0 ? 'Bạn cầm Ba Cơ — được mở lượt trước.' : CUA[luot].ten + ' cầm Ba Cơ, mở lượt.');
      dangCho = false; capNhatNut();
      if (luot !== 0) setTimeout(aiDi, 700);
      else if (opts.tuChoi) setTimeout(tuDanhHo, 200);
    }, tucThi ? 30 : 1000);
  }

  function sangLuot() {
    // vòng mới nếu mọi người còn bài đều đã bỏ
    var conDanh = 0, i;
    for (i = 0; i < 3; i++) if (i !== chuBai && hands[i].length && !daBo[i]) conDanh++;
    if (conDanh === 0) {
      cur = null; curCards = []; daBo = [false, false, false];

      luot = hands[chuBai].length ? chuBai : keTiep(chuBai);
      // chỉ báo khi tới lượt NGƯỜI CHƠI — ai đang mở lượt thì thanh trạng thái đã ghi rồi, khỏi kêu thêm
      if (!over && luot === 0) cue('Đánh Tự Do', 1, 'Cả làng đã bỏ lượt');
    } else {
      luot = keTiep(luot);
    }
    capNhatSeat(); capNhatCur(); capNhatNut();
    if (over) return;
    luuVan();                                                   // chốt sổ MỖI lượt → F5 vào lại đúng thế
    if (luot !== 0) setTimeout(aiDi, tucThi ? 8 : 620 + rnd() * 420);
    else if (opts.tuChoi) setTimeout(tuDanhHo, 120);            // ảnh chụp màn kết: máy đánh hộ cho hết ván
    else if (tucThi && !Object.keys(chon).length) chonGoiY();   // ảnh chụp: cầm sẵn một bộ đã chọn
  }
  function keTiep(t) {
    var n = t;
    for (var k = 0; k < 3; k++) { n = (n + 1) % 3; if (hands[n].length && !daBo[n]) return n; }
    return t;
  }

  function danhBo(s, cards) {
    var bo = TL.classify(cards);
    // "Hàng chặt" của PDK chỉ có BOM (tứ quý trơn) — tứ quý kèm bài thì mất tư cách bom.
    var biChat = !!cur && bo.loai === 'bom' && cur.loai !== 'bom';
    var chuCu = chuBai;
    // ---- ghi nhận thả-người-về: xét TRƯỚC khi rút bài khỏi tay ----
    var keS = (s + 1) % 3, chanS = hands[keS].length === 1;
    var maxLe = -1;
    for (var q = 0; q < hands[s].length; q++) maxLe = Math.max(maxLe, TL.bacOf(hands[s][q]));
    if (loiCho === s) { loiCho = -1; }          // nhà bị nghi đã đánh mà chưa về ở nhịp trước
    hands[s] = hands[s].filter(function (c) { return cards.indexOf(c) < 0; });
    if (bo.loai === 'bom') bomDem[s]++;
    if (chanS && bo.loai === 'don' && bo.hi < maxLe) { loiTu = s; loiCho = keS; }
    else if (chanS && bo.loai === 'don') { loiTu = -1; loiCho = -1; }
    if (!hands[s].length && loiCho === -1 && loiTu >= 0 && s === ((loiTu + 1) % 3)) thaVe = loiTu;
    cur = bo; curCards = cards.slice(); chuBai = s; raBai[s] = true;
    if (s === 0) chon = {};
    raBaiRa(s, cards);
    xepLai(s, true);        // PHẢI gom cả bài của người chơi, không thì đánh xong để lại khe trống
    if (biChat && chuCu !== s) {
      // PDK chỉ có MỘT hàng chặt: bom tứ quý. Mỗi quả còn ăn thêm 5 điểm từ mỗi nhà.
      cue('Bom ' + TL.BAC_TEN[bo.hi] + '!', 3, s === 0 ? 'Bạn' : CUA[s].ten);
      if (chuCu !== 0) npcNoi(chuCu, 'biChat');
      npcNoi(s, 'chatDuoc', s !== 0 && rnd() < 0.6);
    } else if (bo.hi === 12 && (bo.loai === 'don' || bo.loai === 'doi')) {
      // Cả bộ 48 lá chỉ có ĐÚNG MỘT lá Hai, nên nó ra là đáng báo.
      cue('Lá Hai!', 2, s === 0 ? 'Bạn' : CUA[s].ten);
      if (s !== 0) npcNoi(s, 'heo');
    }
    if (hands[s].length === 1 && s !== 0) npcNoi(s, 'sapVe');
    if (!hands[s].length) {
      xong.push(s);
      // ⚠ PDK dừng NGAY khi có người chạy hết bài — hai nhà kia chấm theo số lá còn lại,
      // không đánh tiếp để phân hạng nhì/ba như Tiến Lên.
      viTruoc = s;                             // ván sau người này mở lượt
      cue('Chạy Hết Bài!', 4, s === 0 ? 'Bạn' : CUA[s].ten);
      if (s !== 0) npcNoi(s, 'veNhat', true);
      setTimeout(ketVan, 1050); capNhatSeat(); return;
    }
    capNhatSeat(); capNhatCur(); capNhatNut();
    setTimeout(sangLuot, tucThi ? 6 : 380);
  }

  function boLuot(s) {
    daBo[s] = true;
    if (s !== 0) npcNoi(s, 'bo');
    else cue('Bỏ Lượt', 0, 'Bạn');     // nhà máy bỏ lượt thì thẻ tên đã ghi rồi, khỏi báo giữa bàn
    capNhatSeat();
    setTimeout(sangLuot, tucThi ? 6 : 260);
  }

  /** Chỉ dùng khi chụp ảnh: đánh hộ người chơi để ván chạy tới màn kết. */
  function tuDanhHo() {
    if (over || luot !== 0) return;
    // PDK không có hàm gợi ý riêng — lấy thẳng nước đầu tiên hợp lệ.
    var mvT = TL.genMoves(hands[0], cur, {});
    var g = mvT.length ? mvT[0].cards : null;
    if (g) danhBo(0, g); else boLuot(0);
  }

  function aiDi() {
    if (over || luot === 0) return;
    var s = luot;
    var conLai = [hands[0].length, hands[1].length, hands[2].length];
    var diff = Math.max(0.15, Math.min(0.96, (CUA[s].rank - 480) / 500));
    // chanCua: nhà kế còn ĐÚNG 1 lá ⇒ không được bỏ lượt nếu còn nước chặn (有大必出 rút gọn)
    var ctx = { conLai: conLai, toi: s, kho: diff, chanCua: conLai[(s + 1) % 3] === 1 };
    var pick2 = null;
    if (moBai) {
      var mv = TL.genMoves(hands[s], null).filter(function (m) { return m.cards.indexOf(0) >= 0; });
      pick2 = mv.length ? mv[Math.floor(rnd() * Math.min(mv.length, 3))].cards : [0];
    } else {
      var mv2 = TL.aiPick(hands[s], cur, ctx, rnd);      // PDK trả {cards, dg} hoặc null
      pick2 = mv2 ? mv2.cards : null;
    }
    if (pick2 && pick2.length) danhBo(s, pick2); else boLuot(s);
  }

  // ---------- kết ván ----------
  function ketVan() {
    over = true;
    luuVan();                      // over=true ⇒ chupVan() trả null ⇒ xoá bản lưu dở
    // PDK chấm theo ĐIỂM, không theo hạng về: người về ăn đúng số lá còn trên tay của hai nhà kia,
    // nhà chưa đánh được lượt nào thì nhân đôi, mỗi quả bom ăn 5 điểm từ mỗi đối thủ,
    // và nhà thả người về gánh luôn phần của nhà thứ ba.
    var i, nguoiVe = xong.length ? xong[0] : 0;
    var conLai = [hands[0].length, hands[1].length, hands[2].length];
    var chuaDanh = [raBai[0] ? 0 : 1, raBai[1] ? 0 : 1, raBai[2] ? 0 : 1];
    var diem = TL.ketSo(nguoiVe, conLai, chuaDanh, bomDem, thaVe);
    var toi = diem[0];

    var el = $('.pk-end');
    el.className = 'pk-end ' + (toi > 0 ? 'win' : toi < 0 ? 'lose' : 'mid');
    el.querySelector('.bt').textContent = toi > 0 ? 'Ăn ' + fmt(toi) + ' Điểm'
      : toi < 0 ? 'Chung ' + fmt(-toi) + ' Điểm' : 'Hoà Cả Chiếu';
    el.querySelector('.bs').textContent = nguoiVe === 0
      ? 'Chạy hết bài trước cả làng — điểm hai nhà kia về tay bạn.'
      : (thaVe === 0 ? 'Thả người ta về mà bài lẻ còn to hơn trong tay — phải đền thay cả nhà thứ ba.'
        : 'Còn ' + conLai[0] + ' lá trên tay. Bài đọng lại bao nhiêu là mất bấy nhiêu.');

    var tb = el.querySelector('tbody'), html = '';
    var thuTu = [0, 1, 2].sort(function (a, b) { return diem[b] - diem[a]; });
    for (i = 0; i < 3; i++) {
      var s = thuTu[i], t = diem[s], ghi = [];
      if (s === nguoiVe) ghi.push('về nhất');
      else ghi.push('còn ' + conLai[s] + ' lá' + (chuaDanh[s] ? ' · chưa ra được lá nào, nhân đôi' : ''));
      if (bomDem[s]) ghi.push(bomDem[s] + ' quả bom');
      if (s === thaVe) ghi.push('đền thay nhà thứ ba');
      html += '<tr class="' + (s === 0 ? 'me' : '') + '"><td>' + (s === 0 ? 'Bạn' : CUA[s].ten) +
        '<span class="sub">' + ghi.join(' · ') + '</span></td>' +
        '<td>' + (s === nguoiVe ? '0 lá' : conLai[s] + ' lá') + '</td>' +
        '<td class="r ' + (t >= 0 ? 'pos' : 'neg') + '">' + (t >= 0 ? '+' : '−') + fmt(Math.abs(t)) + '</td></tr>';
    }
    tb.innerHTML = html;

    var kyHon = nguoiVe === 0 ? 20 : toi > 0 ? 6 : 0;
    var rw = el.querySelector('.pk-rw');
    rw.innerHTML = (kyHon ? '<span>Kỳ Hồn +' + kyHon + '</span>' : '') +
      '<span>Trù Mã ' + (toi >= 0 ? '+' : '−') + fmt(Math.abs(toi * cuoc)) + '</span>';

    $('.pk-banner').classList.add('show');
    var bet = -1, xau = 1e9;
    for (i = 1; i < 3; i++) if (diem[i] < xau) { xau = diem[i]; bet = i; }
    if (bet >= 1) npcNoi(bet, 'thua', true);
    capNhatSeat(); capNhatCur();
    if (opts.onEnd) opts.onEnd({ diem: toi, bac: toi * cuoc, veNhat: nguoiVe === 0, bom: bomDem[0], kyHon: kyHon });
  }

  // ---------- nút ----------
  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-a]'); if (!t) return;
    var a = t.getAttribute('data-a');
    if (a === 'danh') {
      var cs = Object.keys(chon).map(Number).sort(function (x, y) { return x - y; });
      var bo = TL.classify(cs);
      if (!bo) { toast('Mấy lá này không thành bộ.'); return; }
      if (!TL.beats(bo, cur)) { toast('Bộ này không đè được ' + TL.tenBo(cur) + '.'); return; }
      if (moBai && cs.indexOf(0) < 0) { toast('Lượt mở màn phải đánh kèm Ba Bích.'); return; }
      danhBo(0, cs);
    } else if (a === 'bo') {
      if (luot !== 0 || !cur) return;
      boLuot(0);
    } else if (a === 'goiy') {
      if (!chonGoiY()) toast('Không có bộ nào đè được — đành bỏ lượt.');
    } else if (a === 'xep') {
      xepBo = !xepBo;
      t.textContent = xepBo ? 'Xếp Theo Bậc' : 'Xếp Theo Bộ';
      xepLai(0, true);
    } else if (a === 'spectate') {
      spectate = !spectate;
      $('.pk-view').classList.toggle('show', spectate);
      toast(spectate ? 'Quan Chiến: kéo để xoay bàn, lăn chuột để phóng.' : 'Thoát Quan Chiến.');
    } else if (a === 'saveview') {
      spectate = false; $('.pk-view').classList.remove('show');
      if (opts.onSaveView) opts.onSaveView({ theta: sph.theta, phi: sph.phi, zoom: sph.zoom || 1 });
      toast('Đã khoá góc nhìn cho bàn này.');
    } else if (a === 'resetview') {
      sph.theta = 0; sph.phi = 0.60; sph.zoom = 1;
      target.set(0, 0, 0); canKhung();
      if (opts.onClearView) opts.onClearView();
      toast('Góc nhìn về mặc định.');
    } else if (a === 'chat') {
      var c = $('.pk-chat'), show = !c.classList.contains('show');
      c.classList.toggle('show', show);
      if (show) { napChip(); setTimeout(function () { $('.pk-chat-in').focus(); }, 40); }
    } else if (a === 'again') {
      vanMoi(null);                 // "Ván Mới" luôn chia lại từ đầu
    } else if (a === 'exit' || a === 'leave') {
      if (opts.onExit) opts.onExit();
    }
  });

  /** Chọn sẵn bộ rẻ nhất đè được (nút Gợi Ý). Trả false nếu bí. */
  function chonGoiY() {
    // PDK không có hàm gợi ý riêng: genMoves đã sinh theo thứ tự từ nhỏ tới lớn nên lấy nước ĐẦU
    // là gần đúng "bộ rẻ nhất đè được".
    var mvG = TL.genMoves(hands[0], cur, { chanCua: hands[1].length === 1 });
    var g = mvG.length ? mvG[0].cards : null;
    if (!g) return false;
    chon = {}; for (var i = 0; i < g.length; i++) chon[g[i]] = 1;
    xepLai(0, true); capNhatNut();
    return true;
  }

  function napChip() {
    var box = $('.pk-chat-ps'), ds = CHIP_NGUOI.slice().sort(function () { return rnd() - 0.5; }).slice(0, 5);
    box.innerHTML = ds.map(function (s) { return '<span class="pk-chip">' + s + '</span>'; }).join('');
    Array.prototype.forEach.call(box.children, function (ch) {
      ch.addEventListener('click', function () { guiLoi(ch.textContent); });
    });
  }
  function guiLoi(txt) {
    txt = (txt || '').trim(); if (!txt) return;
    toast('Bạn: ' + txt);
    $('.pk-chat-in').value = '';
    if (rnd() < 0.72) {
      var s = 1 + Math.floor(rnd() * 3);
      setTimeout(function () { npcNoi(s, 'dap', true); }, 520 + rnd() * 500);
    }
  }
  $('.pk-chat-send').addEventListener('click', function () { guiLoi($('.pk-chat-in').value); });
  $('.pk-chat-in').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { guiLoi(this.value); e.preventDefault(); }
    if (e.key === 'Escape') { $('.pk-chat').classList.remove('show'); this.blur(); }
    e.stopPropagation();
  });
  function onEsc(e) {
    if (e.key !== 'Escape') return;
    if ($('.pk-chat').classList.contains('show')) { $('.pk-chat').classList.remove('show'); return; }
    if (spectate) { spectate = false; $('.pk-view').classList.remove('show'); }
  }
  window.addEventListener('keydown', onEsc);

  // ---------- vòng vẽ ----------
  var last = 0;
  function animate(ts) {
    raf = requestAnimationFrame(animate);
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts;
    stepTweens(dt);
    stepMo(dt);
    if (particles) {
      var pa = particles.geometry.attributes.position, ar = pa.array;
      for (var i = 1; i < ar.length; i += 3) { ar[i] += 0.0032; if (ar[i] > 8.2) ar[i] = -0.3; }
      pa.needsUpdate = true;
    }
    // Bản đồ bóng CHỈ vẽ lại khi có gì đang động. Để autoUpdate thì nó dựng lại toàn cảnh MỖI khung,
    // đây là thứ ngốn khung hình nặng nhất của bàn này.
    if (tweens.length) { renderer.shadowMap.needsUpdate = true; boCanShadow = true; }
    else if (boCanShadow) { renderer.shadowMap.needsUpdate = true; boCanShadow = false; }
    renderer.render(scene, camera);
  }

  // ---------- khởi động ----------
  try {
    init3D();
    taoSeat();
    sph.zoom = 1;
    if (opts.gocNhin) { sph.theta = opts.gocNhin.theta; sph.phi = opts.gocNhin.phi; sph.zoom = opts.gocNhin.zoom || 1; }
    canKhung();
    vanMoi(opts.saved || null);    // có ván dở thì bày lại, không thì chia mới
    setTimeout(onResize, 120); setTimeout(onResize, 480);
    setTimeout(datSeat, 900); setTimeout(datSeat, 2000);   // chân dung tải xong thì thẻ đổi cỡ, canh lại
    animate(0);
    // móc chẩn đoán cho trang mockup — đọc được TỪNG lá thay vì ngồi đoán qua ảnh
    window.__pdk = { scene: scene, camera: camera, handGroups: handGroups, hands: hands, MAT: MAT, GEO: GEO };
  } catch (err) {
    fb(String(err && err.message || err));
    if (window.console) console.error(err);
  }

  return {
    destroy: function () {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('keydown', onEsc);
      try { renderer.dispose(); } catch (e) { }
      host.innerHTML = '';
    },
  };
}

export const CHIEU = [
  { id: 'truongDinh', ten: 'Chiếu Trường Đình', cuoc: 20, tang: 1,
    lore: 'Quán nước đầu đường, hai người khách chờ đò rủ nhau đánh cho hết buổi.',
    ds: ['thanhVuTieuKiem', 'nhamTuyDao'] },
  { id: 'thaoLu', ten: 'Chiếu Thảo Lư', cuoc: 100, tang: 1,
    lore: 'Mái tranh ba gian, bài chia nhanh, ai chậm tay là ôm cả nắm bài ế.',
    ds: ['doanMocVoTranh', 'lacBangNhi'] },
  { id: 'kimTon', ten: 'Chiếu Kim Tôn', cuoc: 500, tang: 2,
    lore: 'Rượu rót ba tuần, bài chia ba ván, chưa ai chịu đứng dậy trước.',
    ds: ['huyetTiBaCo', 'doDuocMaCo'] },
  { id: 'ngocTran', ten: 'Chiếu Ngọc Trản', cuoc: 2000, tang: 2,
    lore: 'Chén ngọc đặt giữa bàn — thắng thì uống, thua thì trả tiền rượu cả chiếu.',
    ds: ['toUyenNghiet', 'namCungLietHoa'] },
  { id: 'vanDai', ten: 'Chiếu Vân Đài', cuoc: 10000, tang: 3,
    lore: 'Hai tay bài đều có danh trên giang hồ. Ngồi xuống là đã mất nửa phần thắng.',
    ds: ['bangPhachNuHiep', 'coNhanMaiKiem'] },
  { id: 'thienNguyen', ten: 'Chiếu Thiên Nguyên', cuoc: 50000, tang: 4,
    lore: 'Chiếu cao nhất trong thiên hạ. Người thường không được mời ngồi.',
    ds: ['vanVongNuong', 'lacVoTran'] },
];
/** Trù Mã cần có để ngồi: gánh nổi ván xấu nhất (16 lá còn tay × 2 vì chưa ra được lá nào,
 *  cộng vài quả bom của làng). */
const HE_SO_NGOI = 45;
const TANG_TEN = ['', 'Sơ Nhập', 'Thành Danh', 'Cao Thủ', 'Tuyệt Đỉnh'];
const TANG_MAU = ['', '#97c459', '#5dcaa5', '#f0997b', '#e6c079'];

// CSS Sảnh Bài — tiêm lúc vào view (KHÔNG để trong <template x-if>: thẻ style trong đó chỉ
// tồn tại đúng lúc đang ở view, đã dính một lần ở Cờ Tướng).
function injectSanhStyle() {
  if (document.getElementById('pks-style')) return;
  const st = document.createElement('style');
  st.id = 'pks-style';
  st.textContent = [
    // nền + viền LẤY ĐÚNG .panel của game (#0f1521 / #1e293b), đừng dùng nâu riêng cho chỏi
    '.pks-chieu{position:relative;display:flex;align-items:center;gap:15px;padding:13px 15px;border-radius:14px;',
    '  background:#0f1521;border:1px solid #1e293b;',
    '  cursor:pointer;transition:transform .14s,border-color .14s,box-shadow .14s}',
    '.pks-chieu:hover{transform:translateY(-3px);border-color:rgba(230,192,121,.55);box-shadow:0 0 26px -10px rgba(230,192,121,.6)}',
    '.pks-chieu.locked{opacity:.5;cursor:not-allowed}',
    '.pks-chieu.locked:hover{transform:none;border-color:#1e293b;box-shadow:none}',
    // 3 chân dung xòe như quạt bài — nhắc luôn đây là bàn BÀI chứ không phải bàn cờ
    '.pks-quat{position:relative;width:112px;height:84px;flex:none}',
    '.pks-quat img{position:absolute;width:50px;height:66px;object-fit:cover;object-position:50% 16%;border-radius:6px;',
    '  border:1px solid rgba(230,192,121,.34);background:#0b111a;box-shadow:0 6px 14px -6px #000}',
    '.pks-quat img:nth-child(1){left:0;top:12px;transform:rotate(-13deg)}',
    '.pks-quat img:nth-child(2){left:31px;top:5px;z-index:2}',
    '.pks-quat img:nth-child(3){left:62px;top:12px;transform:rotate(13deg)}',
    '.pks-i{min-width:0;flex:1}',
    '.pks-tn{font-weight:700;font-size:15.5px;color:#f4d99a;line-height:1.2}',
    '.pks-lo{font-style:italic;font-size:11.5px;color:#8b7a63;margin-top:3px;line-height:1.45}',
    '.pks-ds{font-size:11.5px;color:#b6a68f;margin-top:6px;line-height:1.5}',
    '.pks-mt{display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap}',
    '.pks-tag{font-size:11px;border-radius:99px;padding:3px 11px;white-space:nowrap;color:#d9c39a;',
    '  background:rgba(230,192,121,.09);border:1px solid rgba(230,192,121,.3)}',
    '.pks-tag.warn{color:#e08a8a;border-color:rgba(224,120,120,.45);background:rgba(224,120,120,.1)}',
    // KHÔNG có nút "Nhập Chiếu": bấm vào cả thẻ là vào chiếu rồi, thêm nút chỉ tổ đè lên chip thành tích.
    '@media (max-width:640px){.pks-chieu{gap:11px;padding:11px}.pks-quat{width:96px;height:74px}',
    '  .pks-quat img{width:44px;height:58px}.pks-quat img:nth-child(2){left:26px}.pks-quat img:nth-child(3){left:52px}}',
  ].join('\n');
  document.head.appendChild(st);
}

export function paoDeKuai() {
  return {
    _battle: null,
    inBattle: false,
    loading: false,
    loadErr: '',
    chieu: null,

    get pk() { return this.$store.game.state.paoDeKuai; },
    get kyHon() { return getKyHon(this.$store.game.state); },
    get kyNgheState() { return kyNgheOf(this.$store.game.state); },
    // ⚠ Chiếu bài KHÔNG đụng Bạc nhân vật. Mọi cược ăn thua bằng TRÙ MÃ.
    get truMa() { void this.$store.game._tick; return soTruMa(this.$store.game.state); },
    get bac() { return (this.$store.game.state.currencies || {}).bac || 0; },
    get mucDoi() { return MUC_DOI; },
    get tiGia() { return TI_GIA; },

    // ---- cửa đổi Trù Mã (popup) ----
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
      try { this.$store.game.showToast('Đổi ' + fmt(r.tru) + ' Bạc lấy ' + fmt(r.nhan) + ' Trù Mã.'); } catch (e) { }
    },

    _ds(id) { try { return (this.$store.game.danhSiBang || []).find((x) => x.id === id) || null; } catch (e) { return null; } },
    faceOf(o) { return (o && o.face) || ('images/danhsi/' + (o && o.id) + '.webp'); },
    tenTang(c) { return TANG_TEN[c.tang] || ''; },
    mauTang(c) { return TANG_MAU[c.tang] || '#e6c079'; },
    // Chưa ngồi thì trả '' — thẻ ẩn luôn chip, đỡ một dòng chữ thừa trên MỌI chiếu lúc mới vào.
    recOf(id) {
      const r = (this.pk.rec || {})[id];
      return (r && r.van) ? (r.nhat + ' lần chạy nhất / ' + r.van + ' ván') : '';
    },
    // Ngồi được khi gánh nổi ván xấu nhất (16 lá đọng tay, nhân đôi, cộng bom của làng).
    get chieuList() {
      return CHIEU.map((c) => ({
        ...c,
        list: c.ds.map((id) => this._ds(id)).filter(Boolean),
        khoa: this.truMa < c.cuoc * HE_SO_NGOI,
        can: c.cuoc * HE_SO_NGOI,
      }));
    },

    pkInit() {
      ensurePaoDeKuai(this.$store.game.state);
      injectSanhStyle();
      // ⚠ Rời view trong lúc còn đang tải Three.js thì _battle vẫn null; phải có cờ _boSo,
      // không thì _mount() chạy muộn trên host đã gỡ khỏi DOM -> rò WebGLRenderer + vòng rAF.
      this.$watch('$store.game.view', (v) => {
        if (v === 'paoDeKuai') return;
        this._boSo = true;
        if (this._battle) { try { this._battle.destroy(); } catch (e) { } this._battle = null; }
        this.inBattle = false; this.loading = false;
      });
    },

    // ---- ván dở: giữ qua F5 / rời view giữa chừng ----
    get savedGame() { const g = this.pk && this.pk.game; return (g && g.chieuId && g.van) ? g : null; },
    get savedChieu() { const g = this.savedGame; return g ? (this.chieuList.find((c) => c.id === g.chieuId) || null) : null; },
    resumeSaved() { const c = this.savedChieu; if (c) this.nhapChieu(c, this.savedGame.van); },
    dropSaved() { if (this.pk) this.pk.game = null; try { Storage.save(this.$store.game.state); } catch (e) { } },

    nhapChieu(c, saved) {
      if (this.inBattle) return;
      if (this.truMa < c.cuoc * HE_SO_NGOI) { try { this.$store.game.showToast('Chưa đủ Trù Mã để ngồi chiếu này — đổi thêm ở Sảnh Bài.'); } catch (e) { } return; }
      // ngồi chiếu KHÁC thì bỏ ván dở cũ — mỗi lúc chỉ giữ một ván
      if (!saved && this.savedGame && this.savedGame.chieuId !== c.id) this.dropSaved();
      this._boSo = false; this._saved = saved || null;
      this.chieu = c; this.loadErr = ''; this.loading = true; this.inBattle = true;
      Promise.all([ensureThree(), ensureEngine()])
        .then(() => { this.loading = false; this.$nextTick(() => this._mount()); })
        .catch((e) => { this.loading = false; this.inBattle = false; this.loadErr = String(e && e.message || e); });
    },

    _mount() {
      if (this._boSo || this.$store.game.view !== 'paoDeKuai') { this._boSo = false; this.inBattle = false; return; }
      const host = this.$refs.boardHost;
      if (!host) { this.inBattle = false; return; }
      host.innerHTML = '';
      const g = this.$store.game, c = this.chieu;
      this._battle = mountPaoDeKuai(host, {
        chieu: c.ten,
        cuoc: c.cuoc,
        nguoiChoi: { ten: (g.state.player || {}).name || 'Bạn', art: g.avatarSrc },
        doiThu: c.ds.map((id) => {
          const o = this._ds(id) || { id, ten: 'Đối Thủ', bietHieu: '', rankPower: 700 };
          return { id: o.id, ten: o.ten, bietHieu: o.bietHieu || '', rank: o.rankPower || 700, art: this.faceOf(o) };
        }),
        gocNhin: getGocNhin(g.state, 'paoDeKuai'),
        saved: this._saved,
        onSave: (snap) => this._persist(c.id, snap),
        onSaveView: (v) => { const r = saveGocNhin(g.state, 'paoDeKuai', v); try { Storage.save(g.state); } catch (e) { } return r; },
        onClearView: () => { clearGocNhin(g.state, 'paoDeKuai'); try { Storage.save(g.state); } catch (e) { } },
        onEnd: (kq) => this._ketVan(c.id, kq),
        onExit: () => this._exit(),
      });
      this._saved = null;
    },

    /** snap = null nghĩa là ván đã xong -> bỏ bản lưu dở. */
    _persist(chieuId, snap) {
      const n = this.pk; if (!n) return;
      n.game = snap ? { chieuId: chieuId, van: snap } : null;
      try { Storage.save(this.$store.game.state); } catch (e) { }
    },

    /**
     * Ăn/chung bằng TRÙ MÃ + ghi sổ.
     * ⚠ TUYỆT ĐỐI KHÔNG cộng vào state.currencies.bac — thắng bài mà ra Bạc thì
     *   ngồi chiếu vài ván là giàu, hỏng cả đường cày. Xem engine/truma.js.
     */
    _ketVan(id, kq) {
      const st = this.$store.game.state, n = this.pk;
      if (!n.rec[id]) n.rec[id] = { van: 0, nhat: 0, bom: 0 };
      n.rec[id].van++; n.van++;
      if (kq.veNhat) { n.rec[id].nhat++; n.nhat++; }
      if (kq.bom) { n.rec[id].bom += kq.bom; n.bom = (n.bom || 0) + kq.bom; }
      ghiVan(st, kq.bac || 0);
      n.lai = (n.lai || 0) + (kq.bac || 0);
      if (kq.kyHon) { addKyHon(st, kq.kyHon); try { this.$store.game.checkTitles(); } catch (e) { } }
      try { Storage.save(st); } catch (e) { }
    },

    _exit() {
      if (this._battle) { try { this._battle.destroy(); } catch (e) { } this._battle = null; }
      this.inBattle = false; this.chieu = null;
    },
  };
}
