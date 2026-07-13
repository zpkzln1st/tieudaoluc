/* =====================================================================
   KỲ TRẬN TRẢM YÊU — lõi combat match-3 (ES module, port từ _mockup/match3_combat.html)
   1 TRẬN duy nhất: mount → Lập Trận → đánh → overlay kết quả → onEnd(win,{soul}).
   Module THUẦN: không import, mọi data (tâm pháp/kỹ năng/quái/hero/mods) qua opts.
   Không global (trừ window.KT3 harness khi localStorage kt_dev==='1').
   ===================================================================== */
'use strict';

var N=7;
var TYPES=['kiem','tim','khien','khi','bao'];
var TICON={
  kiem:'<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/>',
  tim:'<path d="M12 21s-7-4.5-9.5-9C1 8.5 3 5 6.5 5 9 5 12 8 12 8s3-3 5.5-3C21 5 23 8.5 21.5 12 19 16.5 12 21 12 21z"/>',
  khien:'<path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6z"/>',
  khi:'<circle cx="12" cy="12" r="8"/><path d="M12 4a4 4 0 0 0 0 8 4 4 0 0 1 0 8"/>',
  bao:'<path d="M4 9h16l-2 8H6z"/><path d="M8 9c0-3 8-3 8 0"/>'
};
var TNAME={ kiem:'Kiếm — Sát thương', tim:'Tâm — Hồi máu', khien:'Thuẫn — Phòng ngự', khi:'Khí — Tích chiêu', bao:'Bảo — Trận Hồn' };
var TVAR={ kiem:'var(--kiem)', tim:'var(--tim)', khien:'var(--khien)', khi:'var(--khi)', bao:'var(--bao)' };
var TIMG={ kiem:'images/kytran/tile_kiem.webp', tim:'images/kytran/tile_tim.webp', khien:'images/kytran/tile_khien.webp', khi:'images/kytran/tile_khi.webp', bao:'images/kytran/tile_bao.webp' };
var POISON_IMG='images/kytran/tile_doc.webp';

var KIEM_DMG=7, TIM_HEAL=6, KHIEN_BLK=6, KHI_GAIN=12, BAO_SOUL=2;
var SINH={ kiem:'khi', khi:'bao', bao:'tim', tim:'khien', khien:'kiem' };

/* Ô đặc biệt: look gán qua SP_LOOK (xếp 4→Phù, 5→Thái Cực Châu, L/T→Cửu Cung Ấn) */
var SP_LOOK={ lineh:12, linev:6, bomb:16, color:'keep' };
var SP_NAME={ lineh:'Kiếm Cang Phù', linev:'Kiếm Cang Phù', bomb:'Cửu Cung Ấn', color:'Thái Cực Châu' };
function spClass(sp){ if(!sp) return ''; var s=' sp sp-'+sp; var fx=SP_LOOK[sp]; if(fx==='keep') s+=' spkeep'; else if(fx) s+=' spfx-'+fx; return s; }

var SK_ICON={
  kiem:'<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/>',
  bao:'<path d="M4 9h16l-2 8H6z"/><path d="M8 9c0-3 8-3 8 0"/>',
  doc:'<path d="M12 3c3 4 6 6 6 10a6 6 0 0 1-12 0c0-4 3-6 6-10z"/>',
  swap:'<path d="M4 8h12l-3-3"/><path d="M20 16H8l3 3"/>',
  convert:'<path d="M5 9a7 7 0 0 1 11-3"/><path d="M19 15a7 7 0 0 1-11 3"/><path d="M16 3v4h-4"/><path d="M8 21v-4h4"/>',
  freeze:'<path d="M12 3v18"/><path d="M4.5 7.5l15 9"/><path d="M19.5 7.5l-15 9"/>',
  bolt:'<path d="M13 3 4 14h6l-1 7 9-11h-6z"/>'
};
var TIERS=['Liên Kích','Nhị Liên','Tam Liên','Tứ Liên!','Ngũ Liên!!','Cuồng Liên!!!','Vô Song!!!'];
var TIERC=['#fde68a','#fde68a','#fbbf24','#fb923c','#fb7185','#f472b6','#e879f9'];

function shuffleArr(a){ for(var i=a.length-1;i>0;i--){ var j=(Math.random()*(i+1))|0; var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }

/* ---------- CSS (inject 1 lần, mọi selector scoped .ktb, keyframes tiền tố ktb) ---------- */
var KTB_STYLE_ID='ktb-style';
var KTB_CSS=[
'.ktb{ --ink:#070b14; --ink2:#0f1521; --ink3:#141b2a; --bd:#1e293b; --jade:#14b8a6; --cyan:#22d3ee; --gold:#f5b942; --rose:#fb7185; --tx:#e2e8f0; --tx2:#94a3b8; --tx3:#64748b; --kiem:#fb7185; --tim:#22c55e; --khien:#a78bfa; --khi:#22d3ee; --bao:#f5b942;',
'  position:relative; height:100%; min-height:420px; display:flex; flex-direction:column; gap:8px; color:var(--tx); font-size:14px; font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }',
'.ktb, .ktb *{ box-sizing:border-box; -webkit-tap-highlight-color:transparent; }',
'.ktb img{ -webkit-user-drag:none; user-select:none; }',
'.ktb button{ font:inherit; color:inherit; background:none; border:none; cursor:pointer; padding:0; }',
'.ktb .fserif{ font-family:"Lora",serif; font-weight:700; }',
'.ktb .btn{ padding:8px 14px; border-radius:8px; font-weight:700; font-size:.82rem; background:var(--ink3); border:1px solid var(--bd); color:var(--tx); }',
'.ktb .btn.pri{ background:var(--jade); border-color:var(--jade); color:#04211c; }',
'.ktb .btn:disabled{ opacity:.4; cursor:not-allowed; }',
'.ktb .ktb-top{ flex:none; display:flex; align-items:center; justify-content:space-between; gap:8px; }',
'.ktb .ktb-soul{ display:flex; align-items:baseline; gap:6px; padding:4px 12px; border-radius:99px; background:var(--ink2); border:1px solid var(--bd); font-size:.82rem; font-weight:700; color:var(--gold); }',
'.ktb .ktb-soul .l{ font-weight:400; color:var(--tx3); font-size:.66rem; }',
'.ktb .ktb-soul .soulic{ width:18px; height:18px; object-fit:contain; align-self:center; }',
'.ktb .ktb-retreat{ padding:5px 12px; border-radius:8px; font-size:.72rem; font-weight:700; color:var(--tx2); background:var(--ink3); border:1px solid var(--bd); }',
'.ktb .stage{ flex:1; min-height:0; display:flex; gap:12px; align-items:stretch; justify-content:center; }',
'.ktb .side{ width:168px; flex:none; display:flex; flex-direction:column; gap:8px; min-height:0; }',
'.ktb .side.hero{ justify-content:flex-end; } .ktb .side.enemy{ justify-content:flex-start; }',
'.ktb .fighter{ display:flex; flex-direction:column; gap:6px; }',
'.ktb .fighter .fport{ position:relative; width:100%; aspect-ratio:1/1.18; border-radius:14px; overflow:hidden; border:2px solid var(--fc,#475569); box-shadow:0 6px 26px -8px rgba(0,0,0,.7), 0 0 18px -6px var(--fc); background:#0b1020; }',
'.ktb .fighter .fport>img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:50% 12%; }',
'.ktb .fighter .fport .flash{ position:absolute; inset:0; background:#fff; opacity:0; mix-blend-mode:screen; }',
'.ktb .fighter .fport .flash.on{ animation:ktbFlash .28s; } @keyframes ktbFlash{ 0%{opacity:0} 20%{opacity:.85} 100%{opacity:0} }',
'.ktb .fighter .fport.dead{ opacity:0; transform:scale(.85); transition:.6s; }',
'.ktb .fighter .fname{ font-family:"Lora",serif; font-weight:700; font-size:.86rem; margin-top:2px; }',
'.ktb .fighter .fname .sub{ font-size:.64rem; color:var(--tx2); }',
'.ktb .tampham{ font-size:.62rem; color:var(--cyan); }',
'.ktb .bar{ height:15px; border-radius:6px; background:rgba(6,10,20,.8); border:1px solid rgba(255,255,255,.07); overflow:hidden; position:relative; }',
'.ktb .bar>i{ display:block; height:100%; transition:width .3s; }',
'.ktb .bar.hp>i{ background:linear-gradient(90deg,#16a34a,#4ade80); }',
'.ktb .bar.ehp>i{ background:linear-gradient(90deg,#e11d48,#fb7185); }',
'.ktb .bar.khi{ height:10px; } .ktb .bar.khi>i{ background:linear-gradient(90deg,#0891b2,#22d3ee); }',
'.ktb .bar .bt{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:.64rem; font-weight:700; text-shadow:0 1px 2px #000; }',
'.ktb .blockpip{ font-size:.66rem; color:#cbd5e1; }',
'.ktb .intent{ font-size:.68rem; color:var(--rose); text-align:center; padding:2px; }',
'.ktb .intent.heavy{ color:var(--gold); font-weight:700; }',
'.ktb .boardcol{ flex:1 1 auto; min-width:0; min-height:0; display:flex; align-items:center; justify-content:center; }',
'.ktb .board{ position:relative; aspect-ratio:1; max-width:100%; max-height:100%; margin:0 auto; background:rgba(3,7,16,.55); border:2px solid #2a3346; border-radius:12px; padding:4px; box-shadow:inset 0 0 40px -10px #000; }',
'.ktb .board.busy{ pointer-events:none; }',
'.ktb .board.targeting{ cursor:crosshair; box-shadow:inset 0 0 0 2px var(--cyan), inset 0 0 40px -10px #000; }',
'.ktb .tile{ position:absolute; width:calc(100%/7); height:calc(100%/7); padding:3px; transition:left .18s ease, top .2s ease; cursor:pointer; z-index:1; }',
'.ktb .tile .tin{ position:relative; width:100%; height:100%; border-radius:10px; display:flex; align-items:center; justify-content:center; background:radial-gradient(120% 120% at 32% 24%, #1b2436, #0a0f1c); box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--tc) 50%,transparent), inset 0 -4px 10px rgba(0,0,0,.45), 0 0 10px -4px var(--tc); transition:transform .12s, box-shadow .12s; }',
'.ktb .tile .ticon{ width:84%; height:84%; object-fit:contain; filter:drop-shadow(0 2px 3px rgba(0,0,0,.6)); pointer-events:none; }',
'.ktb .tile .ticon-fb{ width:56%; height:56%; color:#fff; filter:drop-shadow(0 1px 2px rgba(0,0,0,.5)); }',
'.ktb .tile.sel .tin{ transform:scale(1.08); box-shadow:0 0 0 2px var(--gold), inset 0 -3px 8px rgba(0,0,0,.35); }',
'.ktb .tile.clear .tin{ animation:ktbTclear .22s ease forwards; } @keyframes ktbTclear{ 0%{ transform:scale(1);} 40%{ transform:scale(1.2); filter:brightness(1.8);} 100%{ transform:scale(0); opacity:0; } }',
'.ktb .tile.spawn{ animation:ktbTspawn .22s ease; } @keyframes ktbTspawn{ 0%{ opacity:0; } 100%{ opacity:1; } }',
'.ktb .tile.psn .tin{ box-shadow:0 0 0 2px #84cc16, inset 0 0 12px rgba(132,204,22,.6); }',
'.ktb .tile.psn .tin::after{ content:""; position:absolute; inset:0; border-radius:9px; background:radial-gradient(circle at 50% 45%, rgba(132,204,22,.45), transparent 65%); animation:ktbPsnpulse 1.4s ease-in-out infinite; }',
'@keyframes ktbPsnpulse{ 0%,100%{opacity:.55} 50%{opacity:.95} }',
'.ktb .tile .pcd{ position:absolute; top:1px; right:2px; z-index:2; font-size:.6rem; font-weight:700; color:#ecfccb; background:rgba(20,40,4,.85); border:1px solid #84cc16; border-radius:99px; padding:0 4px; }',
'.ktb .tile .deco{ position:absolute; inset:0; pointer-events:none; z-index:2; }',
'.ktb .tile.sp .tin{ box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--tc) 82%,#fff), inset 0 0 16px color-mix(in srgb,var(--tc) 50%,transparent), 0 0 16px -3px var(--tc); }',
'.ktb .tile.sp .ticon{ filter:drop-shadow(0 0 6px var(--tc)) drop-shadow(0 2px 3px rgba(0,0,0,.6)) brightness(1.1); }',
'@property --ktb-ang{ syntax:"<angle>"; inherits:false; initial-value:0deg; }',
'@keyframes ktbAngspin{ to{ --ktb-ang:360deg } }',
'@keyframes ktbFxspin{ to{ transform:rotate(360deg) } }',
'@keyframes ktbFxsweep{ 0%{ left:-45% } 55%,100%{ left:125% } }',
'.ktb .tile.spfx-6 .deco::before{ content:""; position:absolute; inset:9%; border-radius:50%; border:2px dashed color-mix(in srgb,var(--tc) 80%,#fff); box-shadow:0 0 11px var(--tc), inset 0 0 9px color-mix(in srgb,var(--tc) 45%,transparent); animation:ktbFxspin 6s linear infinite; }',
'.ktb .tile.spfx-6 .deco::after{ content:""; position:absolute; inset:21%; border-radius:50%; border:1px solid color-mix(in srgb,var(--tc) 55%,transparent); animation:ktbFxspin 9s linear infinite reverse; }',
'.ktb .tile.spfx-12 .deco{ border-radius:10px; padding:2.5px; -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite:exclude; filter:drop-shadow(0 0 7px var(--tc)); background:conic-gradient(from var(--ktb-ang), transparent 0 22%, color-mix(in srgb,var(--tc) 45%,#fff) 40%, #fff 45%, transparent 50% 72%, color-mix(in srgb,var(--tc) 45%,#fff) 90%, #fff 95%, transparent 100%); animation:ktbAngspin 2.6s linear infinite; }',
'.ktb .tile.spfx-16 .deco{ overflow:hidden; border-radius:10px; background:linear-gradient(135deg, rgba(255,255,255,.14) 0%, transparent 42%), linear-gradient(315deg, rgba(255,255,255,.08), transparent 46%); }',
'.ktb .tile.spfx-16 .deco::before{ content:""; position:absolute; top:-40%; left:-45%; width:26%; height:180%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.92),transparent); transform:rotate(24deg); filter:blur(1px); animation:ktbFxsweep 2.8s ease-in-out infinite; }',
'.ktb .tile.sp-color.spkeep .tin{ background:conic-gradient(from 0deg,#fb7185,#f5b942,#22c55e,#22d3ee,#a78bfa,#fb7185); }',
'.ktb .tile.sp-color.spkeep .tin .ticon{ filter:drop-shadow(0 0 4px #000) brightness(1.3); }',
'.ktb .fx{ position:absolute; inset:0; pointer-events:none; z-index:30; overflow:visible; }',
'.ktb .fnum{ position:absolute; transform:translate(-50%,-50%); font-family:"Lora",serif; font-weight:700; font-size:22px; text-shadow:0 2px 6px #000; animation:ktbFnum 1s ease forwards; white-space:nowrap; }',
'@keyframes ktbFnum{ 0%{opacity:0; transform:translate(-50%,-30%) scale(.7);} 22%{opacity:1;} 100%{opacity:0; transform:translate(-50%,-130%) scale(1.1);} }',
'.ktb .combolabel{ position:absolute; top:8px; left:50%; transform:translateX(-50%); z-index:31; font-family:"Lora",serif; font-weight:700; color:var(--gold); text-shadow:0 2px 8px #000; opacity:0; pointer-events:none; }',
'.ktb .combolabel.on{ animation:ktbCombo 1s ease; } @keyframes ktbCombo{ 0%{opacity:0; transform:translateX(-50%) scale(.7);} 25%{opacity:1;} 80%{opacity:1;} 100%{opacity:0;} }',
'.ktb .shake{ animation:ktbShk .3s; } @keyframes ktbShk{ 0%,100%{transform:translate(0,0);} 25%{transform:translate(-4px,2px);} 60%{transform:translate(5px,-2px);} }',
'.ktb .legend{ flex:none; display:flex; gap:10px; justify-content:center; flex-wrap:wrap; padding:6px; font-size:.66rem; color:var(--tx2); }',
'.ktb .legend span{ display:flex; align-items:center; gap:4px; }',
'.ktb .overlay{ position:fixed; inset:0; z-index:520; background:rgba(3,6,14,.82); backdrop-filter:blur(3px); display:none; align-items:center; justify-content:center; padding:16px; }',
'.ktb .overlay.show{ display:flex; }',
'.ktb .obox{ max-width:450px; width:100%; padding:26px 24px; text-align:center; border-radius:14px; background:var(--ink2); border:1px solid var(--bd); }',
'.ktb .obox h1{ font-family:"Lora",serif; font-weight:700; font-size:1.5rem; color:var(--gold); margin:0 0 4px; }',
'.ktb .obox h1.lose{ color:var(--rose); }',
'.ktb .obox .osub{ color:var(--tx2); font-size:.84rem; margin-bottom:14px; }',
'.ktb .toast{ position:fixed; top:14px; left:50%; transform:translateX(-50%); z-index:560; background:rgba(15,21,33,.96); border:1px solid var(--bd); color:var(--tx); font-size:.8rem; padding:7px 16px; border-radius:99px; opacity:0; transition:opacity .25s; pointer-events:none; max-width:90vw; }',
'.ktb .toast.show{ opacity:1; }',
'.ktb .skillbar{ margin-top:4px; display:flex; flex-direction:column; gap:5px; }',
'.ktb .skpill{ display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:10px; text-align:left; background:rgba(15,21,33,.7); border:1px solid var(--bd); color:var(--tx); position:relative; overflow:hidden; }',
'.ktb .skpill:disabled{ opacity:.45; cursor:not-allowed; }',
'.ktb .skpill.ready{ border-color:var(--cyan); box-shadow:0 0 11px -3px var(--cyan); }',
'.ktb .skpill .skicon{ position:relative; width:30px; height:30px; flex:none; border-radius:8px; display:flex; align-items:center; justify-content:center; background:radial-gradient(120% 120% at 32% 24%,#1b2436,#0a0f1c); box-shadow:inset 0 0 0 1.4px color-mix(in srgb,var(--sc) 55%,transparent); color:var(--sc); }',
'.ktb .skpill .skicon svg{ width:64%; height:64%; }',
'.ktb .skpill .skicon .skart{ width:82%; height:82%; object-fit:contain; }',
'.ktb .skpill .skicon .sktile{ position:absolute; right:-4px; bottom:-4px; width:15px; height:15px; object-fit:contain; filter:drop-shadow(0 1px 2px #000); }',
'.ktb .skpill .skmeta{ flex:1; min-width:0; }',
'.ktb .skpill .skmeta b{ display:block; font-family:"Lora",serif; font-size:.76rem; line-height:1.15; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.ktb .skpill .skcost{ font-size:.6rem; color:var(--tx3); }',
'.ktb .skpill.ready .skcost{ color:var(--cyan); }',
'.ktb .skpill .skdots{ display:flex; gap:3px; margin-top:2px; }',
'.ktb .skpill .skdots i{ width:7px; height:7px; border-radius:99px; background:#334155; }',
'.ktb .skpill .skdots i.on{ background:var(--cyan); box-shadow:0 0 5px -1px var(--cyan); }',
'.ktb .skpill .skmeter{ position:absolute; left:0; top:0; bottom:0; width:3px; background:rgba(34,211,238,.12); }',
'.ktb .skpill .skmeter>i{ position:absolute; bottom:0; left:0; right:0; background:var(--cyan); }',
'.ktb .picktype{ position:fixed; inset:0; z-index:540; display:none; align-items:center; justify-content:center; background:rgba(3,6,14,.5); }',
'.ktb .picktype.show{ display:flex; }',
'.ktb .picktype .ptbox{ display:flex; gap:8px; flex-wrap:wrap; justify-content:center; max-width:340px; padding:16px; background:var(--ink2); border:1px solid var(--bd); border-radius:14px; }',
'.ktb .picktype .ptttl{ width:100%; text-align:center; font-family:"Lora",serif; font-weight:700; color:var(--gold); margin-bottom:2px; }',
'.ktb .pt-btn{ display:flex; flex-direction:column; align-items:center; gap:3px; width:78px; padding:8px 4px; border-radius:10px; background:var(--ink3); border:1px solid var(--bd); color:var(--tx); font-size:.68rem; }',
'.ktb .pt-btn img{ width:26px; height:26px; object-fit:contain; }',
'.ktb .pt-btn.pt-cancel{ width:100%; flex-direction:row; justify-content:center; color:var(--tx2); }',
/* ===== Lập Trận v4 (scope .ktb .ltbox — tránh đụng class combat) ===== */
'.ktb .ltbox{ width:min(1000px,96vw); height:min(660px,92dvh); overflow:hidden; position:relative; display:flex; flex-direction:column; background:linear-gradient(180deg,rgba(20,29,45,.96),rgba(11,18,32,.98)),#0b1220; border:1px solid #26344a; border-radius:18px; box-shadow:0 34px 90px -24px rgba(0,0,0,.82), inset 0 1px 0 rgba(255,255,255,.05); }',
'.ktb .ltbox::before{ content:""; position:absolute; inset:0 0 auto 0; height:2px; background:linear-gradient(90deg,transparent,rgba(245,185,66,.55),transparent); opacity:.75; z-index:2; }',
'.ktb .ltbox .lt-hdr{ flex:none; padding:12px 22px; border-bottom:1px solid #1e293b; display:flex; align-items:center; gap:13px; background:linear-gradient(180deg,rgba(30,41,59,.34),transparent); }',
'.ktb .ltbox .lt-mk{ width:40px; height:40px; flex:none; border-radius:11px; display:grid; place-items:center; overflow:hidden; background:radial-gradient(70% 70% at 50% 32%,rgba(245,185,66,.22),#0b1018 84%); border:1px solid rgba(245,185,66,.34); box-shadow:0 0 18px -8px #f5b942; }',
'.ktb .ltbox .lt-mk img{ width:100%; height:100%; object-fit:contain; }',
'.ktb .ltbox .lt-mk .fb{ font-family:"Lora",serif; font-weight:700; font-size:19px; color:#f3e2b0; }',
'.ktb .ltbox h1{ margin:0; font-family:"Lora",serif; font-weight:700; font-size:22px; letter-spacing:.6px; background:linear-gradient(180deg,#f7e2a8,#f5b942 56%,#c9932e); -webkit-background-clip:text; background-clip:text; color:transparent; }',
'.ktb .ltbox .lt-thread{ margin-left:14px; flex:1; height:1px; background:linear-gradient(90deg,rgba(245,185,66,.3),transparent 70%); }',
'.ktb .ltbox .lt-body{ flex:1; min-height:0; display:grid; grid-template-columns:258px 1fr 258px; gap:15px; padding:15px 17px; }',
'.ktb .ltbox .lt-col{ display:flex; flex-direction:column; min-height:0; }',
'.ktb .ltbox .lt-colh{ flex:none; display:flex; align-items:center; gap:8px; margin-bottom:11px; }',
'.ktb .ltbox .lt-colh .t{ font-family:"Lora",serif; font-weight:700; font-size:15px; color:#e8c877; letter-spacing:.4px; }',
'.ktb .ltbox .lt-colh .pick{ margin-left:auto; font-size:11px; color:#64748b; border:1px solid #26344a; border-radius:20px; padding:1px 9px; }',
'.ktb .ltbox .lt-colh .pick b{ color:#f5b942; }',
'.ktb .ltbox .lt-colh .pick.ok{ border-color:rgba(45,212,191,.42); color:#2dd4bf; }',
'.ktb .ltbox .lt-colh .pick.ok b{ color:#2dd4bf; }',
'.ktb .ltbox .lt-grid{ flex:1; min-height:0; display:grid; grid-template-columns:1fr 1fr; gap:9px 8px; align-content:start; }',
'.ktb .ltbox .mc{ display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; }',
'.ktb .ltbox .mc .disc{ position:relative; width:78px; height:78px; border-radius:50%; display:grid; place-items:center; background:radial-gradient(70% 70% at 50% 38%,color-mix(in srgb,var(--a) 20%,transparent),#0b1018 82%); border:2px solid color-mix(in srgb,var(--a) 42%,#1b2436); transition:border-color .14s, box-shadow .14s, transform .12s; }',
'.ktb .ltbox .mc:hover .disc{ transform:translateY(-2px); border-color:color-mix(in srgb,var(--a) 66%,#1b2436); box-shadow:0 8px 18px -10px rgba(0,0,0,.8); }',
'.ktb .ltbox .mc .disc>img{ position:relative; z-index:1; width:74px; height:74px; border-radius:50%; object-fit:contain; filter:drop-shadow(0 3px 6px rgba(0,0,0,.5)); }',
'.ktb .ltbox .mc .disc .g{ position:absolute; inset:0; display:grid; place-items:center; font-family:"Lora",serif; font-weight:700; font-size:29px; color:color-mix(in srgb,var(--a) 60%,#5b6b82); }',
'.ktb .ltbox .mc.on .disc{ border-color:var(--a); box-shadow:0 0 0 2px color-mix(in srgb,var(--a) 32%,transparent), 0 0 22px -4px var(--a); }',
'.ktb .ltbox .mc.view .disc{ border-color:color-mix(in srgb,var(--a) 78%,#1b2436); }',
'.ktb .ltbox .mc.lock{ opacity:.4; } .ktb .ltbox .mc.lock .disc{ filter:grayscale(.62) brightness(.66); }',
'.ktb .ltbox .mc .chk{ position:absolute; z-index:2; right:-2px; top:-2px; width:22px; height:22px; border-radius:50%; display:grid; place-items:center; color:#0b1018; background:linear-gradient(180deg,#e8c877,#f5b942); border:2px solid #0b1220; box-shadow:0 2px 7px -2px rgba(0,0,0,.7); }',
'.ktb .ltbox .mc .chk svg{ width:12px; height:12px; }',
'.ktb .ltbox .mc .pil{ display:flex; flex-direction:column; align-items:center; gap:1px; max-width:114px; }',
'.ktb .ltbox .mc .pil .nm{ font-size:12px; font-weight:600; color:#94a3b8; line-height:1.18; text-align:center; }',
'.ktb .ltbox .mc.on .pil .nm{ color:color-mix(in srgb,var(--a) 80%,#ffffff); }',
'.ktb .ltbox .mc .pil .cost{ font-size:10px; color:#64748b; }',
'.ktb .ltbox .lt-center{ min-height:0; display:flex; flex-direction:column; }',
'.ktb .ltbox .lt-en{ flex:none; display:flex; flex-direction:column; align-items:center; }',
'.ktb .ltbox .lt-en .lbl{ font-size:10px; letter-spacing:3px; color:#fb7185; font-weight:700; text-transform:uppercase; opacity:.82; margin-bottom:6px; }',
'.ktb .ltbox .lt-en .frame{ position:relative; width:132px; height:132px; border-radius:16px; display:grid; place-items:center; background:radial-gradient(72% 66% at 50% 40%,rgba(251,113,133,.17),#0a0f18 84%); border:1px solid #402a34; box-shadow:inset 0 0 0 1px rgba(245,185,66,.1), inset 0 -8px 20px rgba(0,0,0,.5), 0 10px 26px -10px rgba(0,0,0,.75); }',
'.ktb .ltbox .lt-en .frame::before{ content:""; position:absolute; inset:5px; border-radius:12px; border:1px solid rgba(245,185,66,.15); }',
'.ktb .ltbox .lt-en .frame img{ width:118px; height:118px; object-fit:cover; object-position:50% 12%; border-radius:11px; position:relative; z-index:1; }',
'.ktb .ltbox .lt-en .nm{ margin-top:8px; font-family:"Lora",serif; font-weight:600; font-size:16px; color:#f2e2c4; }',
'.ktb .ltbox .lt-en .mech{ margin-top:6px; display:inline-flex; align-items:center; gap:7px; padding:4px 11px; border-radius:20px; font-size:11.5px; font-weight:600; color:#f6cdd4; background:rgba(251,113,133,.12); border:1px solid rgba(251,113,133,.32); }',
'.ktb .ltbox .lt-en .mech svg{ width:12px; height:12px; }',
'.ktb .ltbox .lt-detail{ flex:none; height:126px; margin-top:11px; display:flex; gap:13px; padding:12px 13px; border-radius:14px; background:linear-gradient(180deg,#141d2e,#0f1826); border:1px solid #26344a; position:relative; overflow:hidden; }',
'.ktb .ltbox .lt-detail::after{ content:""; position:absolute; inset:0; pointer-events:none; box-shadow:inset 0 0 34px -15px color-mix(in srgb,var(--a,#334155) 60%,transparent); }',
'.ktb .ltbox .lt-detail .big{ flex:none; width:84px; height:84px; position:relative; display:grid; place-items:center; align-self:center; border-radius:var(--br,14px); background:radial-gradient(72% 72% at 50% 38%,color-mix(in srgb,var(--a,#4a5568) 26%,transparent),#0b1018 82%); border:1px solid color-mix(in srgb,var(--a,#4a5568) 48%,#2a3245); }',
'.ktb .ltbox .lt-detail .big img{ width:74px; height:74px; object-fit:contain; filter:drop-shadow(0 4px 8px rgba(0,0,0,.55)); position:relative; z-index:1; border-radius:var(--br,14px); }',
'.ktb .ltbox .lt-detail .big .g{ position:absolute; inset:0; display:grid; place-items:center; font-family:"Lora",serif; font-weight:700; font-size:36px; color:color-mix(in srgb,var(--a,#4a5568) 72%,#cbd5e1); }',
'.ktb .ltbox .lt-detail.tp .big, .ktb .ltbox .lt-detail.tp .big img{ --br:50%; }',
'.ktb .ltbox .lt-detail .info{ min-width:0; flex:1; display:flex; flex-direction:column; justify-content:center; }',
'.ktb .ltbox .lt-detail .kind{ font-size:10px; letter-spacing:2px; text-transform:uppercase; color:color-mix(in srgb,var(--a,#8a94a8) 80%,#8a94a8); font-weight:700; }',
'.ktb .ltbox .lt-detail .nm{ margin-top:3px; font-family:"Lora",serif; font-weight:700; font-size:17px; color:#f0f5fc; line-height:1.1; }',
'.ktb .ltbox .lt-detail .lore{ margin-top:4px; font-family:"Lora",serif; font-style:italic; font-size:11.5px; color:color-mix(in srgb,var(--a,#8a94a8) 55%,#93a1b8); line-height:1.25; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }',
'.ktb .ltbox .lt-detail .desc{ margin-top:6px; font-size:12px; line-height:1.4; color:#c4cddb; overflow:hidden; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; }',
'.ktb .ltbox .lt-detail.empty{ align-items:center; justify-content:center; }',
'.ktb .ltbox .lt-detail.empty .ph{ text-align:center; color:#64748b; font-size:12px; }',
'.ktb .ltbox .lt-detail.empty .ph b{ display:block; font-family:"Lora",serif; color:#94a3b8; font-size:14px; margin-bottom:3px; }',
'.ktb .ltbox .lt-load{ flex:none; margin-top:12px; display:flex; align-items:stretch; gap:12px; }',
'.ktb .ltbox .lt-slotlab{ font-size:9.5px; letter-spacing:1.5px; text-transform:uppercase; color:#64748b; font-weight:700; text-align:center; margin-bottom:5px; }',
'.ktb .ltbox .lt-tpwrap{ flex:none; display:flex; flex-direction:column; }',
'.ktb .ltbox .lt-tpslot{ position:relative; width:70px; height:70px; border-radius:50%; display:grid; place-items:center; margin:0 auto; border:2px dashed #33425c; background:rgba(9,14,24,.5); }',
'.ktb .ltbox .lt-tpslot.fill{ border:2px solid color-mix(in srgb,var(--a,#f5b942) 60%,#2a3245); background:radial-gradient(70% 70% at 50% 36%,color-mix(in srgb,var(--a,#f5b942) 22%,transparent),#0b1018 84%); box-shadow:0 0 18px -6px color-mix(in srgb,var(--a,#f5b942) 55%,transparent); }',
'.ktb .ltbox .lt-tpslot.fill img{ width:64px; height:64px; border-radius:50%; object-fit:contain; filter:drop-shadow(0 2px 5px rgba(0,0,0,.5)); position:relative; z-index:1; }',
'.ktb .ltbox .lt-tpslot .g{ position:absolute; inset:0; display:grid; place-items:center; font-family:"Lora",serif; font-weight:700; font-size:24px; color:#3a475d; }',
'.ktb .ltbox .lt-tpslot.fill .g{ color:color-mix(in srgb,var(--a,#f5b942) 78%,#cfd7e2); }',
'.ktb .ltbox .lt-divx{ flex:none; width:1px; align-self:center; height:56px; background:linear-gradient(180deg,transparent,#26344a,transparent); }',
'.ktb .ltbox .lt-skwrap{ flex:1; }',
'.ktb .ltbox .lt-skrow{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:9px; }',
'.ktb .ltbox .lt-slot{ position:relative; height:70px; border-radius:12px; display:grid; place-items:center; border:1px dashed #2c3a52; background:rgba(9,14,24,.5); }',
'.ktb .ltbox .lt-slot .n{ font-family:"Lora",serif; font-weight:700; font-size:20px; color:#334157; }',
'.ktb .ltbox .lt-slot.fill{ border:1px solid color-mix(in srgb,var(--a,#2dd4bf) 52%,#2a3245); background:radial-gradient(70% 70% at 50% 34%,color-mix(in srgb,var(--a,#2dd4bf) 20%,transparent),#0b1018 86%); }',
'.ktb .ltbox .lt-slot.fill img{ width:42px; height:42px; object-fit:contain; filter:drop-shadow(0 2px 4px rgba(0,0,0,.5)); position:relative; z-index:1; }',
'.ktb .ltbox .lt-slot.fill .g{ position:absolute; inset:0; display:grid; place-items:center; font-family:"Lora",serif; font-weight:700; font-size:20px; color:color-mix(in srgb,var(--a,#2dd4bf) 78%,#cfd7e2); }',
'.ktb .ltbox .lt-slot .cap{ position:absolute; bottom:3px; left:4px; right:4px; text-align:center; font-size:9px; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.ktb .ltbox .lt-foot{ flex:none; margin-top:auto; padding-top:12px; display:flex; align-items:center; gap:12px; }',
'.ktb .ltbox .lt-back{ display:inline-flex; align-items:center; gap:7px; cursor:pointer; font-family:"Lora",serif; font-weight:600; font-size:13px; color:#94a3b8; padding:9px 16px; border-radius:10px; background:linear-gradient(180deg,#141d2c,#0e1622); border:1px solid #26344a; transition:.14s; }',
'.ktb .ltbox .lt-back:hover{ color:#e2e8f0; border-color:#3a4a63; }',
'.ktb .ltbox .lt-back svg{ width:15px; height:15px; }',
'.ktb .ltbox .lt-go{ margin-left:auto; display:inline-block; cursor:pointer; border:15px solid transparent; border-width:15px 46px; border-image:url("images/dongphu/ui/btn_gold.webp") 48 150 fill / 15px 46px / 0 stretch; color:#f3e7c7; font-family:"Lora",serif; font-weight:700; font-size:15px; letter-spacing:.24em; text-shadow:0 1px 2px rgba(60,30,0,.55); line-height:1; padding:8px 10px; background-color:rgba(120,80,20,.14); border-radius:4px; transition:filter .15s, transform .1s; }',
'.ktb .ltbox .lt-go:hover{ filter:brightness(1.08); } .ktb .ltbox .lt-go:active{ transform:translateY(1px); }',
'.ktb .ltbox .lt-go.off{ filter:grayscale(.75) brightness(.72); cursor:not-allowed; pointer-events:none; }',
'@media (max-width:767px){',
'  .ktb .stage{ flex-direction:column; gap:6px; }',
'  .ktb .side{ width:100%; flex-direction:row; align-items:center; gap:10px; }',
'  .ktb .side .fighter{ flex:1; flex-direction:row; align-items:center; gap:8px; }',
'  .ktb .side .fighter .fport{ width:46px; height:54px; aspect-ratio:auto; flex:none; }',
'  .ktb .side .fighter .fmeta{ flex:1; } .ktb .side .fighter .fname{ margin-top:0; }',
'  .ktb .side.hero{ order:3; } .ktb .boardcol{ order:2; } .ktb .side.enemy{ order:1; }',
'  .ktb .tampham{ display:none; }',
'  .ktb .ltbox{ width:100%; height:auto; max-height:92dvh; overflow-y:auto; }',
'  .ktb .ltbox .lt-body{ grid-template-columns:1fr; }',
'  .ktb .ltbox .lt-center{ order:-1; }',
'  .ktb .ltbox .lt-detail{ height:auto; }',
'  .ktb .side.hero .skillbar{ flex-direction:row; width:100%; flex:none; margin-top:0; }',
'  .ktb .side.hero .fighter{ flex-wrap:wrap; }',
'  .ktb .skpill{ flex:1; padding:6px 5px; }',
'  .ktb .skpill .skmeta b{ font-size:.66rem; }',
'}',
'@media (prefers-reduced-motion:reduce){ .ktb .tile{ transition:none; } .ktb .tile.clear .tin,.ktb .tile.spawn,.ktb .shake,.ktb .flash.on,.ktb .tile.psn .tin::after,.ktb .tile.spfx-6 .deco::before,.ktb .tile.spfx-6 .deco::after,.ktb .tile.spfx-12 .deco,.ktb .tile.spfx-16 .deco::before,.ktb .combolabel.on,.ktb .fnum{ animation:none; } }'
].join('\n');

function ensureStyle(){
  if(document.getElementById(KTB_STYLE_ID)) return;
  var st=document.createElement('style'); st.id=KTB_STYLE_ID; st.textContent=KTB_CSS;
  document.head.appendChild(st);
}

/* ---------- Markup (không id — mọi lookup query trong host) ---------- */
var KTB_TPL=''+
'<div class="ktb">'+
  '<div class="ktb-top">'+
    '<div class="ktb-soul"><img class="soulic" src="images/kytran/tranhon.webp" alt="" onerror="this.style.display=\'none\'"><b class="soulv">0</b><span class="l">Trận Hồn</span></div>'+
    '<button class="ktb-retreat" type="button">Rút Lui</button>'+
  '</div>'+
  '<div class="stage">'+
    '<div class="side enemy"><div class="fighter">'+
      '<div class="fport eport" style="--fc:var(--rose)"><img class="eimg" alt=""><div class="flash"></div></div>'+
      '<div class="fmeta"><div class="fname ename"></div>'+
      '<div class="bar ehp"><i class="ehpbar"></i><div class="bt ehptxt"></div></div>'+
      '<div class="intent eintent"></div></div>'+
    '</div></div>'+
    '<div class="boardcol"><div class="board"><div class="fx"></div><div class="combolabel"></div></div></div>'+
    '<div class="side hero"><div class="fighter">'+
      '<div class="fport hport" style="--fc:var(--jade)"><img class="himg" alt=""><div class="flash"></div></div>'+
      '<div class="fmeta"><div class="fname hname"></div><div class="tampham"></div>'+
      '<div class="bar hp"><i class="hhpbar"></i><div class="bt hhptxt"></div></div>'+
      '<div class="bar khi"><i class="khibar"></i></div>'+
      '<div class="blockpip"></div></div>'+
      '<div class="skillbar"></div>'+
    '</div></div>'+
  '</div>'+
  '<div class="legend"></div>'+
  '<div class="overlay"></div>'+
  '<div class="picktype"></div>'+
  '<div class="toast"></div>'+
'</div>';

/* =====================================================================
   mountKtBattle(host, opts) -> { destroy(), resize() }
   ===================================================================== */
export function mountKtBattle(host, opts){
  ensureStyle();

  /* ----- cấu hình từ opts (module thuần, không import) ----- */
  var HERO={ name:opts.hero.name, sub:opts.hero.sub||'', art:opts.hero.art, maxHp:opts.hero.maxHp, maxKhi:opts.hero.maxKhi };
  var EN=opts.enemy;
  var TP_DATA=(opts.tpData||[]).slice();
  var SK_DATA=(opts.skData||[]).slice();
  var tpAllow=(opts.pools&&opts.pools.tp)||TP_DATA.map(function(t){ return t.id; });
  var skAllow=(opts.pools&&opts.pools.sk)||SK_DATA.map(function(s){ return s.id; });
  var tpChoices=TP_DATA.filter(function(t){ return tpAllow.indexOf(t.id)>=0; });
  var skChoices=SK_DATA.filter(function(s){ return skAllow.indexOf(s.id)>=0; });
  var NEED=Math.min(3, skChoices.length);
  var mods=Object.assign({ dmg:1, heal:1, block:1, khi:1, crit:0, critMul:1.6, lv:{} }, opts.mods||{});
  /* Mốc Ngũ Hành Cấp 4/7/10 (mods.lv) — cơ chế thật trong trận:
     Mộc: 4 hồi dư→Hộ Thuẫn · 7 đầu lượt hồi 3% · 10 gục lần đầu hồi 40%
     Hỏa: 4 xếp ≥4 Kiếm→thiêu 3 lượt · 7 địch cháy +30% st · 10 bạo ×2.4 + thiêu thêm
     Thổ: 4 phản 25% phần bị chặn · 7 đầu lượt +3 Hộ Thuẫn · 10 miễn đòn nặng đầu
     Kim: 4 xếp ≥4 Kiếm→đòn +50% · 7 có Hộ Thuẫn→bạo +25% · 10 kết liễu địch <15%
     Thủy: 4 xếp ≥4 Khí→địch hoãn 1 lượt · 7 dùng chiêu→sinh 2 ô Khí · 10 nối lượt vượt cap 1 lần/trận */
  var LV=mods.lv||{};
  function lvAt(k,n){ return (LV[k]||0)>=n; }

  /* loadout mặc định — chỉ giữ id nằm trong pools */
  var ltIn=opts.lt||{};
  var lt0tp=ltIn.tamPhap;
  if(!tpChoices.some(function(t){ return t.id===lt0tp; })) lt0tp=tpChoices.length?tpChoices[0].id:null;
  var lt0sk=(ltIn.skills||[]).filter(function(id){ return skChoices.some(function(s){ return s.id===id; }); });
  lt0sk=lt0sk.filter(function(id,i){ return lt0sk.indexOf(id)===i; }).slice(0,NEED);
  var LT={ tamPhap:lt0tp, skills:lt0sk };

  /* ----- lifecycle ----- */
  var dead=false, ended=false;
  function fireEnd(win){
    if(ended) return; ended=true;
    try{ if(opts.onEnd) opts.onEnd(win, { soul:S?S.soul:0 }); }catch(e){}
  }

  /* ----- DOM ----- */
  host.innerHTML=KTB_TPL;
  var root=host.firstElementChild;
  function q(s){ return root.querySelector(s); }
  var boardEl=q('.board'), fxEl=q('.fx'), comboEl=q('.combolabel');
  var ePort=q('.eport'), eImg=q('.eimg'), eName=q('.ename'), eHpBar=q('.ehpbar'), eHpTxt=q('.ehptxt'), eIntent=q('.eintent');
  var hPort=q('.hport'), hImg=q('.himg'), hName=q('.hname'), tamPhamEl=q('.tampham');
  var hHpBar=q('.hhpbar'), hHpTxt=q('.hhptxt'), khiBar=q('.khibar'), blockPip=q('.blockpip');
  var skillBarEl=q('.skillbar'), legendEl=q('.legend'), overlayEl=q('.overlay'), pickEl=q('.picktype'), toastEl=q('.toast');
  var soulEl=q('.soulv'), retreatBtn=q('.ktb-retreat');

  function el(t,c,h){ var e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e; }
  var toastTimer=null;
  function toast(m){ toastEl.textContent=m; toastEl.classList.add('show'); if(toastTimer) clearTimeout(toastTimer); toastTimer=setTimeout(function(){ toastEl.classList.remove('show'); },1600); }
  function sleep(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }

  /* ----- trạng thái trận ----- */
  var board=[], tileEls={}, uid=1;
  var S=null, sel=null, busy=false;

  /* ----- loadout / tâm pháp / kỹ năng ----- */
  function tpById(id){ for(var i=0;i<TP_DATA.length;i++) if(TP_DATA[i].id===id) return TP_DATA[i]; return tpChoices[0]||TP_DATA[0]||{ id:null, name:'', counters:'' }; }
  function skillById(id){ for(var i=0;i<SK_DATA.length;i++) if(SK_DATA[i].id===id) return SK_DATA[i]; return null; }
  function hasTP(id){ return LT.tamPhap===id; }
  function hasSkill(id){ return LT.skills.indexOf(id)>=0; }
  function effVal(count){ return hasTP('tuSa') ? Math.pow(Math.min(count,9),1.5) : count; }
  function dealKiemBonus(){ var b=0;
    if(hasTP('kimCang') && !S._kimCangTurn){ var kb=Math.floor(S.block*0.25); if(kb>0){ b+=kb; S._kimCangTurn=true; } }
    if(hasTP('hoaDoc') && S.docTinh>0){ b+=S.docTinh*4; S.docTinh=0; }
    return Math.round(b);
  }
  /* Đòn Kiếm (ô Kiếm + skill đánh thẳng hệ Kiếm): nhân Ngũ Hành mods.dmg + roll bạo kích */
  function kiemStrike(raw){
    var d=Math.round(raw*(mods.dmg||1))+dealKiemBonus();
    var cc=(mods.crit||0)+((lvAt('kim',7)&&S.block>0)?0.25:0);            /* Kim C7: có Hộ Thuẫn -> bạo +25% */
    var crit=Math.random()<cc;
    if(crit){
      var cm=(mods.critMul||1.6)+(lvAt('hoa',10)?0.8:0);                   /* Hỏa C10: Diệt Thế Hỏa — bạo ×2.4 */
      d=Math.round(d*cm);
      if(lvAt('hoa',10)) S.eBurn=Math.min(5,(S.eBurn||0)+1);               /* ... và thiêu địch thêm 1 lượt */
    }
    if((S.eBurn||0)>0&&lvAt('hoa',7)) d=Math.round(d*1.3);                 /* Hỏa C7: địch đang cháy +30% */
    return { d:d, crit:crit };
  }
  function fnumHit(hit,suffix,baseColor){ fnum('e','-'+hit.d+(suffix||'')+(hit.crit?' 暴':''), hit.crit?'#f5b942':baseColor); }

  function initSkillState(){
    S.sk={}; S.goldStock=0; S.docTinh=0; S.enemyFrozen=false; S._kimCangTurn=false;
    LT.skills.forEach(function(id){ var sk=skillById(id); if(sk && sk.kind==='charge') S.sk[id]={ charges:sk.charges }; });
    S.extraCap = hasTP('thaiCuc')?3:2;
  }
  function skillReady(sk){
    if(!sk) return false;
    if(sk.kind==='khi') return S.khi>=sk.cost;
    if(sk.kind==='charge') return !!(S.sk[sk.id] && S.sk[sk.id].charges>0);
    if(sk.kind==='stock') return S.goldStock>0;
    return false;
  }
  function spendSkill(sk){
    if(sk.kind==='khi') S.khi=Math.max(0,S.khi-sk.cost);
    else if(sk.kind==='charge' && S.sk[sk.id]) S.sk[sk.id].charges--;
  }

  /* ----- bàn cờ ----- */
  function randType(){ return TYPES[(Math.random()*TYPES.length)|0]; }
  function makeBoard(){
    board=[]; tileEls={}; boardEl.querySelectorAll('.tile').forEach(function(n){ n.remove(); });
    for(var r=0;r<N;r++){ board[r]=[]; for(var c=0;c<N;c++){
      var t,guard=0;
      do{ t=randType(); guard++; }
      while(guard<20 && ((c>=2&&board[r][c-1].type===t&&board[r][c-2].type===t)||(r>=2&&board[r-1][c].type===t&&board[r-2][c].type===t)));
      board[r][c]={ id:uid++, type:t };
    }}
    renderBoard(true);
  }
  function sizeBoard(){
    if(dead) return;
    var col=q('.boardcol'); if(!col) return;
    var w=col.clientWidth, h=col.clientHeight;
    if(w<60) return;
    var s=(h>=60)?Math.min(w,h):Math.min(w,560); /* host chưa có chiều cao -> co theo ngang */
    boardEl.style.width=s+'px';
  }
  function cellPct(i){ return (i*100/N)+'%'; }
  function renderBoard(initial){
    var seen={};
    for(var r=0;r<N;r++) for(var c=0;c<N;c++){
      var t=board[r][c]; if(!t) continue; seen[t.id]=true;
      var e=tileEls[t.id];
      if(!e){
        e=el('div','tile'+(initial?'':' spawn')+spClass(t.sp));
        e.innerHTML='<div class="tin" style="--tc:'+TVAR[t.type]+'"><img class="ticon" src="'+TIMG[t.type]+'" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><svg class="ticon-fb" style="display:none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+TICON[t.type]+'</svg><span class="deco"></span><span class="pcd" style="display:none"></span></div>';
        e.dataset.id=t.id;
        e.addEventListener('click', function(){ onTileClick(this); });
        tileEls[t.id]=e; boardEl.appendChild(e);
        if(!initial){ e.style.left=cellPct(c); e.style.top=cellPct(r-N); void e.offsetWidth; }
      }
      e.style.left=cellPct(c); e.style.top=cellPct(r); e.dataset.r=r; e.dataset.c=c;
      e.classList.toggle('sel', !!(sel&&sel.id===t.id));
      e.classList.toggle('psn', !!t.poison);
      var pcd=e.querySelector('.pcd');
      if(t.poison){ pcd.style.display='block'; pcd.textContent=t.pcd; } else pcd.style.display='none';
    }
    for(var id in tileEls){ if(!seen[id]){ tileEls[id].remove(); delete tileEls[id]; } }
  }
  function findTilePos(id){ for(var r=0;r<N;r++) for(var c=0;c<N;c++){ if(board[r][c]&&board[r][c].id==id) return {r:r,c:c}; } return null; }

  /* ----- match / ô đặc biệt ----- */
  function findGroups(){
    var groups=[];
    for(var r=0;r<N;r++){ var run=1; for(var c=1;c<=N;c++){
      var same=c<N&&board[r][c]&&board[r][c-1]&&board[r][c].type===board[r][c-1].type;
      if(same) run++; else { if(run>=3){ var cells=[]; for(var k=c-run;k<c;k++) cells.push([r,k]); groups.push({type:board[r][c-1].type,dir:'h',cells:cells,len:run}); } run=1; }
    }}
    for(var c2=0;c2<N;c2++){ var run2=1; for(var r2=1;r2<=N;r2++){
      var same2=r2<N&&board[r2][c2]&&board[r2-1][c2]&&board[r2][c2].type===board[r2-1][c2].type;
      if(same2) run2++; else { if(run2>=3){ var cells2=[]; for(var k2=r2-run2;k2<r2;k2++) cells2.push([k2,c2]); groups.push({type:board[r2-1][c2].type,dir:'v',cells:cells2,len:run2}); } run2=1; }
    }}
    return groups;
  }
  function hasMatch(){ return findGroups().length>0; }
  /* Phân tích match: cell bị xóa + ô đặc biệt cần TẠO (không xóa ô thành special) */
  function analyzeMatches(swapCells){
    var groups=findGroups(); if(!groups.length) return null;
    var key=function(r,c){ return r+','+c; };
    var clearSet={}, specials=[];
    var swapSet={}; (swapCells||[]).forEach(function(p){ swapSet[key(p.r,p.c)]=true; });
    var cellRuns={};
    groups.forEach(function(run){ run.cells.forEach(function(cc){ var k=key(cc[0],cc[1]); (cellRuns[k]=cellRuns[k]||[]).push(run); clearSet[k]=true; }); });
    var used={};
    groups.forEach(function(run){
      var pv=run.cells.find(function(cc){ return swapSet[key(cc[0],cc[1])]; })
          || run.cells.find(function(cc){ return (cellRuns[key(cc[0],cc[1])]||[]).length>=2; }) /* ưu tiên ô giao (L/T cascade) */
          || run.cells[(run.len/2)|0];
      var pk=key(pv[0],pv[1]);
      var crossing=(cellRuns[pk]||[]).length>=2;
      var sp=null;
      if(crossing) sp='bomb';
      else if(run.len>=5) sp='color';
      else if(run.len===4) sp='line'+run.dir;
      if(sp && !used[pk]){ used[pk]=true; specials.push({r:pv[0],c:pv[1],sp:sp,type:run.type}); }
    });
    /* Chỉ bỏ pivot khỏi clearSet nếu ô đó CHƯA là special (đang special -> expandSpecials nổ trước rồi mới đặt cái mới) */
    specials.forEach(function(s){ if(!(board[s.r][s.c]&&board[s.r][s.c].sp)) delete clearSet[key(s.r,s.c)]; });
    return { clearSet:clearSet, specials:specials };
  }
  function blastCells(r,c,sp,colorType){
    var out=[];
    if(sp==='lineh'){ for(var cc=0;cc<N;cc++) out.push([r,cc]); }
    else if(sp==='linev'){ for(var rr=0;rr<N;rr++) out.push([rr,c]); }
    else if(sp==='bomb'){ for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){ var nr=r+dr,nc=c+dc; if(nr>=0&&nr<N&&nc>=0&&nc<N) out.push([nr,nc]); } }
    else if(sp==='color'){ var tt=colorType||(board[r][c]&&board[r][c].type); for(var rr2=0;rr2<N;rr2++)for(var cc2=0;cc2<N;cc2++){ if(board[rr2][cc2]&&board[rr2][cc2].type===tt) out.push([rr2,cc2]); } }
    return out;
  }
  /* Ô đặc biệt nằm trong vùng xóa -> kích blast + dây chuyền.
     GOTCHA giữ nguyên: chỉ special seed BAN ĐẦU dùng colorHint; chain sau dùng màu riêng (undefined). */
  function expandSpecials(clearSet, colorHint){
    var key=function(r,c){ return r+','+c; };
    var queue=[], seen={};
    Object.keys(clearSet).forEach(function(k){ var p=k.split(','); var t=board[p[0]][p[1]]; if(t&&t.sp){ queue.push({r:+p[0],c:+p[1],sp:t.sp,hint:colorHint}); seen[k]=true; } });
    var chained=0;
    while(queue.length){
      var qi=queue.shift();
      blastCells(qi.r,qi.c,qi.sp,qi.hint).forEach(function(cc){ var k=key(cc[0],cc[1]); if(!clearSet[k]) clearSet[k]=true; var t=board[cc[0]][cc[1]]; if(t&&t.sp&&!seen[k]){ seen[k]=true; chained++; queue.push({r:cc[0],c:cc[1],sp:t.sp,hint:undefined}); } });
    }
    return chained;
  }
  function gravity(){ for(var c=0;c<N;c++){ var col=[]; for(var r=0;r<N;r++) if(board[r][c]) col.push(board[r][c]); var empty=N-col.length; for(var r2=0;r2<N;r2++) board[r2][c]= r2<empty?null:col[r2-empty]; } }
  function refill(biasType){ for(var r=0;r<N;r++) for(var c=0;c<N;c++) if(!board[r][c]){ var tp=(biasType&&hasTP('canKhon')&&Math.random()<0.55)?biasType:randType(); board[r][c]={ id:uid++, type:tp }; } }
  function adjacent(a,b){ return (a.r===b.r&&Math.abs(a.c-b.c)===1)||(a.c===b.c&&Math.abs(a.r-b.r)===1); }

  /* Ngũ Hành mods: Kiếm ×dmg (+crit) · Tâm ×heal · Thuẫn ×block · Khí ×khi · Bảo -> Trận Hồn */
  function applyCounts(counts, mul){
    if(counts.kiem){
      var kraw=effVal(counts.kiem)*KIEM_DMG*mul;
      if(lvAt('kim',4)&&counts.kiem>=4) kraw*=1.5;                                             /* Kim C4: xếp ≥4 Kiếm -> đòn +50% */
      var hit=kiemStrike(kraw); S.enemy.hp=Math.max(0,S.enemy.hp-hit.d); fnumHit(hit,'','#fecaca'); flash(ePort);
      if(lvAt('hoa',4)&&counts.kiem>=4&&S.enemy.hp>0){ S.eBurn=Math.max(S.eBurn||0,3); fnum('e','燃','#fb923c'); } /* Hỏa C4: thiêu 3 lượt */
      if(lvAt('kim',10)&&S.enemy.hp>0&&S.enemy.hp<=S.enemy.max*0.15){ S.enemy.hp=0; combo(0,'Nhất Kiếm Quang'); } /* Kim C10: kết liễu <15% */
    }
    if(counts.tim){
      var h=Math.round(effVal(counts.tim)*TIM_HEAL*(mods.heal||1));
      var over=Math.max(0,(S.hp+h)-HERO.maxHp);
      S.hp=Math.min(HERO.maxHp,S.hp+h); fnum('h','+'+h,'#4ade80');
      if(over>0&&lvAt('moc',4)){ S.block+=over; fnum('h','⛨'+over,'#4ade80'); }                 /* Mộc C4: hồi dư -> Hộ Thuẫn */
    }
    if(counts.khien){ var blk=Math.round(effVal(counts.khien)*KHIEN_BLK*(mods.block||1)); S.block+=blk; fnum('h','⛨'+blk,'#cbd5e1'); }
    if(counts.khi){
      S.khi=Math.min(HERO.maxKhi,S.khi+Math.round(counts.khi*KHI_GAIN*(mods.khi||1)));
      if(lvAt('thuy',4)&&counts.khi>=4&&!S.enemyFrozen){ S.enemyFrozen=true; combo(0,'Hàn Lưu Trệ Trận'); }        /* Thủy C4: hoãn đòn địch */
    }
    if(counts.bao){ S.soul+=counts.bao*BAO_SOUL; if(hasSkill('hoangKim')) S.goldStock+=counts.bao*BAO_SOUL; }
  }

  /* ----- kích hoạt kỹ năng (không kết thúc lượt — chỉ match mới sang lượt địch) ----- */
  async function activateSkill(id){
    if(busy||S.over||S.tmode) return;
    var sk=skillById(id); if(!sk||!hasSkill(id)) return;
    if(!skillReady(sk)){ toast('Chưa đủ điều kiện'); return; }
    if(id==='hoanTinh'){ enterTarget(sk); return; }
    if(id==='nguHanh'){ enterPickType(sk); return; }
    busy=true; boardEl.classList.add('busy'); S._kimCangTurn=false;
    var ok=true;
    if(id==='kiemKhi') await skKiemKhi();
    else if(id==='huyetSat') ok=await skHuyetSat();
    else if(id==='hoangKim') ok=skHoangKim();
    else if(id==='oLong') await skOLong();
    else if(id==='ngungSuong') skNgungSuong();
    else if(id==='nguLoi') ok=await skNguLoi();
    if(dead) return;
    if(ok!==false){ spendSkill(sk); afterSkillCast(); }
    renderAll();
    if(S.enemy.hp<=0){ await sleep(250); if(dead) return; winFight(); return; }
    busy=false; boardEl.classList.remove('busy');
  }

  async function skKiemKhi(){
    var hit=kiemStrike(55); S.enemy.hp=Math.max(0,S.enemy.hp-hit.d);
    fnumHit(hit,' 劍','#fde68a'); flash(ePort); shake(); combo(0,'Kiếm Khí Trảm'); renderAll(); await sleep(160);
    if(dead) return;
    var r=(Math.random()*N)|0; var cs={}; for(var c=0;c<N;c++) cs[r+','+c]=true;
    await resolveCascades(cs);
  }
  async function skHuyetSat(){
    var cells=[]; for(var r=0;r<N;r++)for(var c=0;c<N;c++){ if(board[r][c]&&board[r][c].type==='kiem'&&!board[r][c].sp) cells.push([r,c]); }
    var n=cells.length; if(n===0){ toast('Không có ô Kiếm nào'); busy=false; boardEl.classList.remove('busy'); return false; }
    var hit=kiemStrike(n*4), h=n*2;
    S.enemy.hp=Math.max(0,S.enemy.hp-hit.d); S.hp=Math.min(HERO.maxHp,S.hp+h);
    fnumHit(hit,' 劍','#fecaca'); fnum('h','+'+h,'#4ade80'); flash(ePort); shake(); combo(0,'Huyết Sát');
    cells.forEach(function(p){ var t=board[p[0]][p[1]]; if(t&&tileEls[t.id]) tileEls[t.id].classList.add('clear'); });
    renderAll(); await sleep(215);
    if(dead) return false;
    cells.forEach(function(p){ var t=board[p[0]][p[1]]; if(t&&t.type==='kiem'&&!t.sp){ if(t.poison&&t.pown!=='hero'&&hasTP('hoaDoc')) S.docTinh=Math.min(8,S.docTinh+1); board[p[0]][p[1]]=null; } });
    gravity(); refill(); renderBoard(); renderAll(); await sleep(210);
    if(dead) return false;
    await resolveCascades(null,null);
    return true;
  }
  function skHoangKim(){
    if(S.goldStock<=0){ toast('Kho Bảo trống'); busy=false; boardEl.classList.remove('busy'); return false; }
    var d=S.goldStock; S.goldStock=0; S.enemy.hp=Math.max(0,S.enemy.hp-d);
    fnum('e','-'+d+' 金','#fde68a'); flash(ePort); shake(); combo(0,'Hoàng Kim Nhất Kích'); renderAll();
    return true;
  }
  async function skOLong(){
    var pcells=[]; for(var r=0;r<N;r++)for(var c=0;c<N;c++){ if(board[r][c]&&board[r][c].poison&&board[r][c].pown!=='hero') pcells.push([r,c]); }
    if(pcells.length){
      var refl=pcells.length*(S.enemy.poisonDmg||6);
      pcells.forEach(function(p){ board[p[0]][p[1]]={ id:uid++, type:'kiem' }; });
      S.enemy.hp=Math.max(0,S.enemy.hp-refl);
      fnum('e','-'+refl+' 毒','#bef264'); flash(ePort); shake(); combo(0,'Ô Long Giao Tranh');
      renderBoard(); renderAll(); await sleep(220);
      if(dead) return;
      await resolveCascades(null,null);
    } else {
      var free=[]; for(var r2=0;r2<N;r2++)for(var c2=0;c2<N;c2++){ if(board[r2][c2]&&!board[r2][c2].poison) free.push([r2,c2]); }
      shuffleArr(free);
      for(var i=0;i<3&&i<free.length;i++){ var p=free[i]; board[p[0]][p[1]].poison=true; board[p[0]][p[1]].pcd=2; board[p[0]][p[1]].pown='hero'; }
      combo(0,'Gieo Độc Phản Chủ'); renderBoard(); renderAll(); await sleep(180);
    }
  }
  function skNgungSuong(){ S.enemyFrozen=true; combo(0,'Ngưng Sương Quyết'); toast('Địch bị đóng băng một lượt'); renderAll(); }
  async function skNguLoi(){
    var sp=[]; for(var r=0;r<N;r++)for(var c=0;c<N;c++){ if(board[r][c]&&board[r][c].sp) sp.push([r,c]); }
    if(sp.length===0){ toast('Không có ô đặc thù nào'); busy=false; boardEl.classList.remove('busy'); return false; }
    var d=sp.length*8; S.enemy.hp=Math.max(0,S.enemy.hp-d);
    fnum('e','-'+d+' 雷','#fde68a'); flash(ePort); shake(); combo(0,'Ngũ Lôi Chính Pháp'); renderAll(); await sleep(200);
    if(dead) return false;
    var cs={}; sp.forEach(function(p){ cs[p[0]+','+p[1]]=true; });
    await resolveCascades(cs);
    return true;
  }

  /* --- Hoán Tinh Di Đẩu: đổi tự do 2 ô (bấm lại ô đầu = hủy, không tốn charge) --- */
  function enterTarget(sk){ S.tmode={ sk:sk.id, picked:[] }; sel=null; boardEl.classList.add('targeting'); toast('Chọn hai ô để Hoán Tinh Di Đẩu'); renderBoard(); }
  async function doHoanTinh(a,b){
    var A=board[a.r][a.c], B=board[b.r][b.c];
    board[a.r][a.c]=B; board[b.r][b.c]=A;
    S.tmode=null; boardEl.classList.remove('targeting');
    busy=true; boardEl.classList.add('busy'); S._kimCangTurn=false;
    renderBoard(); await sleep(180);
    if(dead) return;
    await resolveCascades(null,null);
    if(dead) return;
    spendSkill(skillById('hoanTinh')); afterSkillCast();
    renderAll();
    if(S.enemy.hp<=0){ await sleep(250); if(dead) return; winFight(); return; }
    busy=false; boardEl.classList.remove('busy');
  }

  /* --- Ngũ Hành Đại Chuyển: chọn hệ -> biến 3×3 giữa --- */
  function convertRegion(type){ for(var r=2;r<=4;r++)for(var c=2;c<=4;c++){ board[r][c]={ id:uid++, type:type }; } }
  function enterPickType(sk){
    pickEl.innerHTML='';
    var box=el('div','ptbox','<div class="ptttl">Ngũ Hành Đại Chuyển — chọn hệ</div>');
    TYPES.forEach(function(t){ var b=el('button','pt-btn','<img src="'+TIMG[t]+'"><span>'+TNAME[t].split(' — ')[0]+'</span>'); b.onclick=function(){ closePickType(); runNguHanh(t); }; box.appendChild(b); });
    var cancel=el('button','pt-btn pt-cancel',null); cancel.textContent='Hủy'; cancel.onclick=closePickType; box.appendChild(cancel);
    pickEl.appendChild(box); pickEl.classList.add('show');
  }
  function closePickType(){ pickEl.classList.remove('show'); }
  async function runNguHanh(type){
    if(busy||S.over) return;
    busy=true; boardEl.classList.add('busy'); S._kimCangTurn=false;
    convertRegion(type); renderBoard(); combo(0,'Ngũ Hành Đại Chuyển'); await sleep(220);
    if(dead) return;
    await resolveCascades(null,null);
    if(dead) return;
    spendSkill(skillById('nguHanh')); afterSkillCast();
    renderAll();
    if(S.enemy.hp<=0){ await sleep(250); if(dead) return; winFight(); return; }
    busy=false; boardEl.classList.remove('busy');
  }

  /* ----- thanh kỹ năng trong trận ----- */
  function skillIconSVG(icon){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(SK_ICON[icon]||SK_ICON.bolt)+'</svg>'; }
  function renderSkillBar(){
    if(!skillBarEl||!S) return; skillBarEl.innerHTML='';
    LT.skills.forEach(function(id){
      var sk=skillById(id); if(!sk) return;
      var ready=!S.over && skillReady(sk);
      var slot=el('button','skpill'+(ready?' ready':''));
      var cost;
      if(sk.kind==='khi'){ var pct=Math.min(100,S.khi/sk.cost*100); cost='<div class="skmeter"><i style="height:'+pct+'%"></i></div><span class="skcost">'+Math.floor(S.khi)+'/'+sk.cost+' Khí</span>'; }
      else if(sk.kind==='charge'){ var ch=S.sk[id]?S.sk[id].charges:sk.charges; var dots=''; for(var i=0;i<sk.charges;i++) dots+='<i class="'+(i<ch?'on':'')+'"></i>'; cost='<div class="skdots">'+dots+'</div>'; }
      else { cost='<span class="skcost">Kho: '+S.goldStock+'</span>'; }
      var tileIcon = sk.tile?'<img class="sktile" src="'+TIMG[sk.tile]+'">':'';
      var artIcon='<img class="skart" src="images/kytran/sk_'+id+'.webp" alt="" onerror="this.style.display=\'none\';var s=this.nextElementSibling;if(s)s.style.display=\'block\'"><span class="skfb" style="display:none">'+skillIconSVG(sk.icon)+'</span>';
      slot.innerHTML='<div class="skicon" style="--sc:'+(sk.tile?TVAR[sk.tile]:'var(--cyan)')+'">'+artIcon+tileIcon+'</div><div class="skmeta"><b>'+sk.name+'</b>'+cost+'</div>';
      slot.disabled=!ready; slot.onclick=function(){ activateSkill(id); };
      skillBarEl.appendChild(slot);
    });
  }

  /* ----- màn Lập Trận (mở đầu trận, chọn từ pools đã mở) ----- */
  function luuPhaiName(tp,sk){
    if(tp==='hoaDoc' && sk.indexOf('huyetSat')>=0) return 'Độc Sát Lưu';
    if(tp==='kimCang' && sk.indexOf('ngungSuong')>=0) return 'Kim Cang Lưu';
    if(tp==='thaiCuc' && sk.indexOf('nguLoi')>=0) return 'Lôi Trận Lưu';
    if(tp==='tuSa') return 'Tụ Sa Lưu';
    if(tp==='canKhon') return 'Sinh Hóa Lưu';
    return 'Tán Tu Lưu';
  }
  function skCostLabel(s){ return s.kind==='khi'?s.cost+' Khí':(s.kind==='charge'?s.charges+'/trận':'Kho Bảo'); }
  function lapTran(){
    busy=true;
    var tpSel=LT.tamPhap, skSel=LT.skills.slice(), viewId=null;
    var o=overlayEl; o.classList.add('show'); o.innerHTML='';
    var box=el('div','ltbox'); o.appendChild(box);
    var mechTxt = EN.poisonEvery?('Rải Ô Độc mỗi '+EN.poisonEvery+' lượt'):(EN.heavyEvery?('Đòn Nặng mỗi '+EN.heavyEvery+' lượt'):'Đánh thường');
    var CHK='<span class="chk"><svg viewBox="0 0 24 24" fill="none" stroke="#4a2e05" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 6.5"/></svg></span>';
    var MECHSVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>';
    var BACKSVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
    function isTp(id){ for(var i=0;i<TP_DATA.length;i++) if(TP_DATA[i].id===id) return true; return false; }  /* tra thật — tpById có fallback trả tuSa cho id lạ */
    function itemById(id){ return isTp(id) ? tpById(id) : skillById(id); }
    function acc(x){ return (x&&x.accent)||'#94a3b8'; }
    function medHTML(kind,x,on,view,lock){
      return '<div class="mc'+(on?' on':'')+(view&&!on?' view':'')+(lock?' lock':'')+'" style="--a:'+acc(x)+'" data-k="'+kind+'" data-id="'+x.id+'">'+
        '<div class="disc"><img src="images/kytran/'+kind+'_'+x.id+'.webp" alt="" onerror="this.style.display=\'none\'">'+(on?CHK:'')+'</div>'+
        '<div class="pil"><span class="nm fserif">'+x.name+'</span>'+(kind==='sk'?'<span class="cost">'+skCostLabel(x)+'</span>':'')+'</div></div>';
    }
    box.innerHTML=
      '<div class="lt-hdr"><div class="lt-mk"><img src="images/nav/kyTran.webp" alt="" onerror="this.remove()"></div><h1>Lập Trận</h1><div class="lt-thread"></div></div>'+
      '<div class="lt-body">'+
        '<div class="lt-col"><div class="lt-colh"><span class="t fserif">Tâm Pháp</span><span class="pick lt-tppick">0 / 1</span></div><div class="lt-grid lt-tplist"></div></div>'+
        '<div class="lt-center">'+
          '<div class="lt-en"><div class="lbl">Địch Thủ</div><div class="frame"><img src="'+EN.art+'" alt="" onerror="this.style.visibility=\'hidden\'"></div><div class="nm fserif">'+EN.name+'</div><div class="mech">'+MECHSVG+' '+mechTxt+'</div></div>'+
          '<div class="lt-detail empty" style="--a:#334155"><div class="ph"><b class="fserif">Xem Chi Tiết</b>Bấm một Tâm Pháp hoặc Kỹ Năng để đọc công năng.</div></div>'+
          '<div class="lt-load"><div class="lt-tpwrap"><div class="lt-slotlab">Tâm Pháp</div><div class="lt-tpslot" style="--a:#f5b942"></div></div><div class="lt-divx"></div><div class="lt-skwrap"><div class="lt-slotlab">Ba Kỹ Năng</div><div class="lt-skrow"></div></div></div>'+
          '<div class="lt-foot"><span class="lt-back fserif">'+BACKSVG+' Quay Lại</span><span class="lt-go off fserif">Phá Trận</span></div>'+
        '</div>'+
        '<div class="lt-col"><div class="lt-colh"><span class="t fserif">Kỹ Năng</span><span class="pick lt-skpick">0 / '+NEED+'</span></div><div class="lt-grid lt-sklist"></div></div>'+
      '</div>';
    var tpListEl=box.querySelector('.lt-tplist'), skListEl=box.querySelector('.lt-sklist');
    var tpPickEl=box.querySelector('.lt-tppick'), skPickEl=box.querySelector('.lt-skpick');
    var detailEl=box.querySelector('.lt-detail'), tpSlotEl=box.querySelector('.lt-tpslot'), skRowEl=box.querySelector('.lt-skrow');
    var goEl=box.querySelector('.lt-go');
    function renderTP(){ tpListEl.innerHTML=tpChoices.map(function(t){ return medHTML('tp',t,tpSel===t.id,viewId===t.id,false); }).join('');
      tpPickEl.textContent=(tpSel?1:0)+' / 1'; tpPickEl.classList.toggle('ok',!!tpSel); }
    function renderSK(){ var full=skSel.length>=NEED; skListEl.innerHTML=skChoices.map(function(s){ var on=skSel.indexOf(s.id)>=0; return medHTML('sk',s,on,viewId===s.id,!on&&full); }).join('');
      skPickEl.textContent=skSel.length+' / '+NEED; skPickEl.classList.toggle('ok',full); }
    function showDetail(id){
      var x=id?itemById(id):null;
      if(!x){ detailEl.className='lt-detail empty'; detailEl.style.setProperty('--a','#334155'); detailEl.innerHTML='<div class="ph"><b class="fserif">Xem Chi Tiết</b>Bấm một Tâm Pháp hoặc Kỹ Năng để đọc công năng.</div>'; return; }
      var tp=isTp(id); detailEl.className='lt-detail'+(tp?' tp':''); detailEl.style.setProperty('--a',acc(x));
      var kind=tp?('Tâm Pháp · '+(x.role||'')):('Kỹ Năng · '+skCostLabel(x)); var body=tp?x.rule:x.desc;
      detailEl.innerHTML='<div class="big"><img src="images/kytran/'+(tp?'tp':'sk')+'_'+x.id+'.webp" alt="" onerror="this.style.display=\'none\'"></div>'+
        '<div class="info"><div class="kind">'+kind+'</div><div class="nm fserif">'+x.name+'</div><div class="lore fserif">“'+x.lore+'”</div><div class="desc">'+body+'</div></div>';
    }
    function renderTpSlot(){ if(!tpSel){ tpSlotEl.className='lt-tpslot'; tpSlotEl.style.setProperty('--a','#f5b942'); tpSlotEl.innerHTML=''; return; }
      var x=tpById(tpSel); tpSlotEl.className='lt-tpslot fill'; tpSlotEl.style.setProperty('--a',acc(x)); tpSlotEl.innerHTML='<img src="images/kytran/tp_'+x.id+'.webp" alt="" onerror="this.style.display=\'none\'">'; }
    function renderSlots(){ skRowEl.innerHTML=[0,1,2].map(function(i){ var id=skSel[i]; if(!id) return '<div class="lt-slot"><span class="n fserif">'+(i+1)+'</span></div>';
      var x=skillById(id); return '<div class="lt-slot fill" style="--a:'+acc(x)+'"><img src="images/kytran/sk_'+x.id+'.webp" alt="" onerror="this.style.display=\'none\'"><span class="cap">'+x.name+'</span></div>'; }).join(''); }
    function renderGo(){ goEl.classList.toggle('off', !(tpSel && skSel.length===NEED)); }
    function ltAll(){ renderTP(); renderSK(); showDetail(viewId); renderTpSlot(); renderSlots(); renderGo(); }
    box.addEventListener('click', function(e){
      var mc=e.target.closest('.mc');
      if(mc){ var k=mc.getAttribute('data-k'), id=mc.getAttribute('data-id'); viewId=id;
        if(k==='tp'){ tpSel = (tpSel===id) ? null : id; }
        else { var i=skSel.indexOf(id); if(i>=0) skSel.splice(i,1); else if(skSel.length<NEED) skSel.push(id); }
        ltAll(); return; }
      if(e.target.closest('.lt-go') && !goEl.classList.contains('off')){
        LT.tamPhap=tpSel; LT.skills=skSel.slice();
        try{ if(opts.onLoadout) opts.onLoadout({ tamPhap:LT.tamPhap, skills:LT.skills.slice() }); }catch(e2){}
        commitLoadout(); return; }
      if(e.target.closest('.lt-back')){ cancelLoadout(); return; }
    });
    box.addEventListener('mouseover', function(e){ var mc=e.target.closest('.mc'); if(!mc) return; var id=mc.getAttribute('data-id'); if(id===viewId) return; viewId=id;
      box.querySelectorAll('.mc').forEach(function(m){ m.classList.toggle('view', m.getAttribute('data-id')===id && !m.classList.contains('on')); });
      showDetail(id); });
    ltAll();
  }
  function commitLoadout(){ try{ if(opts.onBattleStart) opts.onBattleStart(); }catch(e){} overlayEl.classList.remove('show'); overlayEl.innerHTML=''; initSkillState(); renderAll(); busy=false; boardEl.classList.remove('busy'); }
  function cancelLoadout(){ try{ if(opts.onCancel) opts.onCancel(); }catch(e){} }

  /* ----- khởi trận (1 trận duy nhất) ----- */
  function startBattle(){
    S={ hp:HERO.maxHp, khi:0, block:0, soul:0, enemy:null, eTurn:0, over:false, extraStreak:0, _transit:false,
        tmode:null, sk:{}, goldStock:0, docTinh:0, enemyFrozen:false, extraCap:2, _kimCangTurn:false,
        eBurn:0, _mocRevive:false, _thoShield:false, _thuyUsed:false };
    hImg.src=HERO.art; hImg.onerror=function(){ this.style.visibility='hidden'; };
    hName.innerHTML=HERO.name+(HERO.sub?' <span class="sub">'+HERO.sub+'</span>':'');
    buildLegend(); loadEnemy(); makeBoard(); renderAll();
    requestAnimationFrame(sizeBoard); setTimeout(sizeBoard,80);
    lapTran();
  }
  function loadEnemy(){
    S.enemy={ name:EN.name, sub:EN.sub||'', art:EN.art, hp:EN.hp, max:EN.hp, atk:EN.atk, heavyEvery:EN.heavyEvery||0, heavyMul:EN.heavyMul||1.8, poisonEvery:EN.poisonEvery||0, poisonK:EN.poisonK||0, poisonDmg:EN.poisonDmg||6, boss:!!EN.boss };
    S.eTurn=0; S.block=0; S.khi=0; S.extraStreak=0; initSkillState();
    eImg.src=EN.art; eImg.onerror=function(){ this.style.visibility='hidden'; };
    eName.innerHTML=EN.name+(EN.sub?' <span class="sub">'+EN.sub+'</span>':'');
    ePort.classList.remove('dead');
  }
  function buildLegend(){
    legendEl.innerHTML='';
    TYPES.forEach(function(t){ legendEl.appendChild(el('span',null,'<img src="'+TIMG[t]+'" style="width:17px;height:17px;object-fit:contain">'+TNAME[t])); });
    legendEl.appendChild(el('span',null,'<img src="'+POISON_IMG+'" style="width:17px;height:17px;object-fit:contain">Ô Độc — xóa trước khi nổ!'));
  }

  /* ----- vòng chơi ----- */
  async function attemptSwap(aPos,bPos){
    if(busy||S.over) return; busy=true; boardEl.classList.add('busy'); sel=null; S._kimCangTurn=false; /* re-arm Kim Cang mỗi lượt match */
    var A=board[aPos.r][aPos.c], B=board[bPos.r][bPos.c];
    var extra;
    if(A.sp && B.sp){ /* HỢP BÍCH: kích cả hai ô đặc biệt */
      board[aPos.r][aPos.c]=B; board[bPos.r][bPos.c]=A; renderBoard(); await sleep(170);
      if(dead) return;
      var cs={}; cs[aPos.r+','+aPos.c]=true; cs[bPos.r+','+bPos.c]=true;
      combo(0,'HỢP BÍCH!'); shake();
      extra=await resolveCascades(cs);
    } else if(A.sp || B.sp){ /* kích ô đặc biệt bằng ô thường (color: xóa theo màu ô thường) */
      var spTile=A.sp?A:B, other=A.sp?B:A;
      board[aPos.r][aPos.c]=B; board[bPos.r][bPos.c]=A; renderBoard(); await sleep(170);
      if(dead) return;
      var np=findTilePos(spTile.id); var cs2={}; cs2[np.r+','+np.c]=true;
      combo(0, SP_NAME[spTile.sp]||'Kích Phù');
      extra=await resolveCascades(cs2, other.type);
    } else { /* đổi thường -> cần tạo match */
      board[aPos.r][aPos.c]=B; board[bPos.r][bPos.c]=A; renderBoard(); await sleep(180);
      if(dead) return;
      if(!hasMatch()){ board[aPos.r][aPos.c]=A; board[bPos.r][bPos.c]=B; renderBoard(); await sleep(180); if(dead) return; busy=false; boardEl.classList.remove('busy'); return; }
      extra=await resolveCascades(null, null, [{r:aPos.r,c:aPos.c},{r:bPos.r,c:bPos.c}]);
    }
    if(dead||S.over) return;
    renderAll();
    if(S.enemy.hp<=0){ await sleep(300); if(dead) return; winFight(); return; }
    if(extra && (S.extraStreak||0) < S.extraCap){ S.extraStreak=(S.extraStreak||0)+1; } /* thêm lượt nhưng CAP theo Tâm Pháp (2, Thái Cực 3) */
    else if(extra && lvAt('thuy',10) && !S._thuyUsed){ S._thuyUsed=true; S.extraStreak=0; combo(0,'Thủy Nghịch Càn Khôn'); } /* Thủy C10: 1 lần/trận nối lượt vượt cap */
    else { S.extraStreak=0; await enemyTurn(); if(dead||S.over) return; }
    if(S.hp<=0){ loseFight(); return; }
    if(!S._transit){ busy=false; boardEl.classList.remove('busy'); } /* giữ khóa nếu đang chuyển cảnh thắng (winFight) */
  }
  async function resolveCascades(initSet, colorHint, swapCells){
    var step=0, grantExtra=false, pending=initSet;
    while(true){
      var clearSet, newSpecials=[];
      if(pending){ clearSet=pending; pending=null; }
      else { var an=analyzeMatches(swapCells); swapCells=null; if(!an) break; clearSet=an.clearSet; newSpecials=an.specials; }
      var chained=expandSpecials(clearSet, colorHint); colorHint=null;
      newSpecials.forEach(function(s){ delete clearSet[s.r+','+s.c]; }); /* ô sẽ thành special: đừng đếm/xóa/nháy */
      if(newSpecials.length) grantExtra=true; /* tạo ô đặc biệt (xếp 4+) -> thêm lượt */
      if(hasTP('thaiCuc')){ if(newSpecials.length) S.khi=Math.min(HERO.maxKhi,S.khi+15*newSpecials.length); if(chained>0) S.khi=Math.min(HERO.maxKhi,S.khi+8*chained); }
      var tier=step+(chained>0?1:0);
      if(tier>=1) combo(tier);
      Object.keys(clearSet).forEach(function(k){ var p=k.split(','); var t=board[p[0]][p[1]]; if(t&&tileEls[t.id]) tileEls[t.id].classList.add('clear'); });
      await sleep(215);
      if(dead) return grantExtra;
      var counts={};
      Object.keys(clearSet).forEach(function(k){ var p=k.split(','); var t=board[p[0]][p[1]]; if(t){ counts[t.type]=(counts[t.type]||0)+1; if(t.poison&&t.pown!=='hero'&&hasTP('hoaDoc')) S.docTinh=Math.min(8,S.docTinh+1); } });
      Object.keys(clearSet).forEach(function(k){ var p=k.split(','); board[p[0]][p[1]]=null; });
      applyCounts(counts, 1+0.25*step);
      if(Object.keys(clearSet).length>=8) shake();
      newSpecials.forEach(function(s){ board[s.r][s.c]={ id:uid++, type:s.type, sp:s.sp }; });
      var dom=null,dmax=0; for(var tk in counts){ if(counts[tk]>dmax){ dmax=counts[tk]; dom=tk; } }
      gravity(); refill((hasTP('canKhon')&&dom)?SINH[dom]:null); renderBoard(); renderAll(); await sleep(230);
      if(dead) return grantExtra;
      step++; if(step>40) break;
    }
    return grantExtra;
  }
  function spawnPoison(k){
    var free=[]; for(var r=0;r<N;r++)for(var c=0;c<N;c++){ if(board[r][c]&&!board[r][c].poison) free.push([r,c]); }
    shuffleArr(free);
    for(var i=0;i<k&&i<free.length;i++){ var p=free[i]; board[p[0]][p[1]].poison=true; board[p[0]][p[1]].pcd=2; board[p[0]][p[1]].pown='enemy'; }
  }
  function tickPoison(){
    var h=0,e=0;
    for(var r=0;r<N;r++)for(var c=0;c<N;c++){ var t=board[r][c]; if(t&&t.poison){ t.pcd--; if(t.pcd<=0){ if(t.pown==='hero') e++; else h++; t.poison=false; delete t.pcd; delete t.pown; } } }
    return { hero:h, enemy:e };
  }
  /* Mộc C10: gục lần đầu -> hồi 40% Sinh Lực (1 lần/trận) */
  function checkRevive(){
    if(S.hp>0||S._mocRevive||!lvAt('moc',10)) return;
    S._mocRevive=true; S.hp=Math.round(HERO.maxHp*0.4);
    combo(0,'Bất Tử Mộc'); fnum('h','+'+S.hp,'#4ade80');
  }
  /* Đầu lượt người chơi (sau lượt địch): Mộc C7 hồi 3% + Thổ C7 tích Hộ Thuẫn */
  function newTurnGrants(){
    if(S.over||S.hp<=0) return;
    if(lvAt('moc',7)&&S.hp<HERO.maxHp){ var mh=Math.max(1,Math.round(HERO.maxHp*0.03*(mods.heal||1))); S.hp=Math.min(HERO.maxHp,S.hp+mh); fnum('h','+'+mh,'#4ade80'); }
    if(lvAt('tho',7)){ S.block+=Math.max(1,Math.round(3*(mods.block||1))); }
  }
  /* Thủy C7: dùng chiêu -> sinh 2 ô Khí (thay ô thường bằng ô mới, giữ diff renderBoard theo id) */
  function spawnKhiTiles(n){
    var cand=[]; for(var r=0;r<N;r++)for(var c=0;c<N;c++){ var t=board[r][c]; if(t&&!t.sp&&!t.poison&&t.type!=='khi') cand.push([r,c]); }
    shuffleArr(cand);
    for(var i=0;i<n&&i<cand.length;i++){ var p=cand[i]; board[p[0]][p[1]]={ id:uid++, type:'khi' }; }
    if(n>0) renderBoard();
  }
  function afterSkillCast(){ if(lvAt('thuy',7)) spawnKhiTiles(2); }
  async function enemyTurn(){
    if(dead||S.over) return;
    /* 0) Hỏa: địch đang cháy — trừ máu đầu lượt địch */
    if((S.eBurn||0)>0){
      var bd=Math.round(6*(mods.dmg||1)); S.eBurn--;
      S.enemy.hp=Math.max(0,S.enemy.hp-bd);
      fnum('e','-'+bd+' 燃','#fb923c'); flash(ePort); renderAll(); await sleep(200);
      if(dead) return;
      if(S.enemy.hp<=0){ winFight(); return; }
    }
    /* 1) ô Độc đếm ngược + nổ (địch-gieo hại người; người-gieo [Ô Long] hại địch) */
    var deto=tickPoison();
    renderBoard(); /* đồng bộ badge đếm ngược ngay cả lượt chỉ tick (không nổ) */
    if(deto.enemy>0){
      var ed=deto.enemy*(S.enemy.poisonDmg||6); S.enemy.hp=Math.max(0,S.enemy.hp-ed);
      fnum('e','-'+ed+' 毒','#bef264'); flash(ePort); renderAll(); await sleep(220);
      if(dead) return;
      if(S.enemy.hp<=0){ winFight(); return; }
    }
    if(deto.hero>0){
      var pd=deto.hero*S.enemy.poisonDmg; var d=pd; if(S.block>0){ var ab=Math.min(S.block,d); S.block-=ab; d-=ab; }
      if(d>0){ S.hp=Math.max(0,S.hp-d); fnum('h','-'+d+' 毒','#bef264'); flash(hPort); shake(); checkRevive(); }
      renderBoard(); renderAll(); await sleep(260);
      if(dead) return;
      if(S.hp<=0) return;
    }
    /* 2) Ngưng Sương Quyết / Thủy C4: bỏ qua đòn + lượt rải Độc này */
    if(S.enemyFrozen){ S.enemyFrozen=false; combo(0,'Địch Bị Đóng Băng'); newTurnGrants(); renderAll(); await sleep(220); return; }
    /* 3) đánh thường / đòn nặng */
    S.eTurn++;
    var heavy=S.enemy.heavyEvery&&(S.eTurn%S.enemy.heavyEvery===0);
    if(heavy && lvAt('tho',10) && !S._thoShield){
      /* Thổ C10: Bất Hoại — miễn trọn đòn nặng đầu tiên mỗi trận */
      S._thoShield=true; combo(0,'Bất Hoại Kim Thân'); fnum('h','⛨ Miễn Đòn Nặng','#d6a760'); renderAll(); await sleep(240);
      if(dead) return;
    } else {
      var dmg=Math.round(S.enemy.atk*(heavy?S.enemy.heavyMul:1)); var d2=dmg;
      if(S.block>0){
        var ab2=Math.min(S.block,d2); S.block-=ab2; d2-=ab2;
        if(ab2>0){
          fnum('h','⛨'+ab2,'#cbd5e1');
          if(lvAt('tho',4)){ var ref=Math.round(ab2*0.25); if(ref>0){ S.enemy.hp=Math.max(0,S.enemy.hp-ref); fnum('e','-'+ref+' 反','#d6a760'); flash(ePort); } } /* Thổ C4: phản 25% phần bị chặn */
        }
      }
      await sleep(120);
      if(dead) return;
      if(d2>0){ S.hp=Math.max(0,S.hp-d2); fnum('h','-'+d2,'#fda4af'); flash(hPort); shake(); checkRevive(); }
      renderAll(); await sleep(120);
      if(dead) return;
      if(S.enemy.hp<=0){ winFight(); return; } /* phản đòn Thổ C4 kết liễu địch */
      if(S.hp<=0) return;
    }
    /* 4) rải Độc */
    if(S.enemy.poisonEvery && S.eTurn%S.enemy.poisonEvery===0){ spawnPoison(S.enemy.poisonK); combo(0,'Độc Vụ Lan Tràn'); renderBoard(); renderAll(); await sleep(220); }
    /* 5) đầu lượt người chơi: Mộc C7 hồi máu + Thổ C7 tích Hộ Thuẫn */
    newTurnGrants(); renderAll();
  }

  /* ----- kết trận (idempotent qua _transit + latch fireEnd) ----- */
  function winFight(){
    if(S.over || S._transit) return; S._transit=true; ePort.classList.add('dead'); busy=true;
    setTimeout(function(){ if(dead||S.over) return; S._transit=false; endGame(true); },700);
  }
  function loseFight(){ if(S.over) return; endGame(false); }
  function endGame(win){
    S.over=true; busy=true; boardEl.classList.add('busy');
    var o=overlayEl; o.classList.add('show'); o.innerHTML='';
    var b=el('div','obox');
    b.innerHTML='<h1 class="'+(win?'':'lose')+'">'+(win?'Trảm Yêu Thành Công':'Bại Trận')+'</h1>'+
      '<div class="osub">'+(win?(S.enemy.name+' phục pháp, trận đồ thu quang.'):'Phân thân tan rã giữa trận đồ.')+'</div>'+
      '<div style="font-size:.84rem;color:var(--gold);margin-bottom:16px">'+(win?('Thu được '+S.soul+' 魂 Trận Hồn'):'Trận Hồn lượm dở tan theo trận đồ')+'</div>'+
      '<div style="text-align:center"><button class="btn pri okbtn" style="padding:11px 34px">Xác Nhận</button></div>';
    o.appendChild(b);
    var ok=b.querySelector('.okbtn');
    ok.addEventListener('click', function(){ ok.disabled=true; fireEnd(win); });
  }
  /* Rút Lui: confirm overlay nhỏ -> tính THUA, onEnd(false) ngay khi xác nhận */
  function askRetreat(){
    if(!S||S.over||S._transit||ended) return;
    if(overlayEl.querySelector('.ltbox')) return; /* đang ở màn Lập Trận */
    var o=overlayEl; o.classList.add('show'); o.innerHTML='';
    var b=el('div','obox');
    b.innerHTML='<h1 class="lose" style="font-size:1.2rem">Rút Lui?</h1>'+
      '<div class="osub">Rời trận giữa chừng tính là bại trận.</div>'+
      '<div style="display:flex;gap:8px"><button class="btn rstay" style="flex:1">Ở Lại</button><button class="btn rgo" style="flex:1;border-color:var(--rose);color:var(--rose)">Rút Lui</button></div>';
    o.appendChild(b);
    b.querySelector('.rstay').addEventListener('click', function(){ o.classList.remove('show'); o.innerHTML=''; });
    b.querySelector('.rgo').addEventListener('click', function(){ S.over=true; b.querySelector('.rgo').disabled=true; fireEnd(false); });
  }
  retreatBtn.addEventListener('click', askRetreat);

  function onTileClick(e){
    if(busy||S.over) return;
    var id=+e.dataset.id, pos=findTilePos(id); if(!pos) return;
    if(S.tmode){ /* Hoán Tinh Di Đẩu: chọn 2 ô */
      var pk=S.tmode.picked;
      if(pk.length===1 && pk[0].r===pos.r && pk[0].c===pos.c){ var ft=board[pk[0].r][pk[0].c]; if(ft&&tileEls[ft.id]) tileEls[ft.id].classList.remove('sel'); S.tmode=null; boardEl.classList.remove('targeting'); toast('Đã hủy Hoán Tinh Di Đẩu'); return; } /* bấm lại ô đầu = hủy (không tốn charge) */
      pk.push(pos);
      var tt=board[pos.r][pos.c]; if(tt&&tileEls[tt.id]) tileEls[tt.id].classList.add('sel');
      if(pk.length>=2) doHoanTinh(pk[0],pk[1]); else toast('Chọn ô thứ hai');
      return;
    }
    if(!sel){ sel=board[pos.r][pos.c]; renderBoard(); return; }
    var sp=findTilePos(sel.id);
    if(!sp){ sel=board[pos.r][pos.c]; renderBoard(); return; } /* ô đã chọn bị skill xóa mất -> chọn lại, tránh adjacent(null) */
    if(sel.id===id){ sel=null; renderBoard(); return; }
    if(adjacent(sp,pos)){ attemptSwap(sp,pos); } else { sel=board[pos.r][pos.c]; renderBoard(); }
  }

  function renderAll(){
    if(!S||!S.enemy) return;
    var e=S.enemy;
    eHpBar.style.width=(e.hp/e.max*100)+'%'; eHpTxt.textContent=Math.ceil(e.hp)+' / '+e.max;
    var heavyNext=e.heavyEvery&&((S.eTurn+1)%e.heavyEvery===0);
    var poisonNext=e.poisonEvery&&((S.eTurn+1)%e.poisonEvery===0);
    eIntent.className='intent eintent'+(heavyNext?' heavy':'');
    eIntent.textContent=(heavyNext?'重 Đòn Nặng sắp tới':(poisonNext?'毒 Sắp rải Độc':'Sát khí: '+e.atk))+((S.eBurn||0)>0?' · 燃 Cháy '+S.eBurn+' lượt':'');
    hHpBar.style.width=(S.hp/HERO.maxHp*100)+'%'; hHpTxt.textContent=Math.ceil(S.hp)+' / '+HERO.maxHp;
    khiBar.style.width=(S.khi/HERO.maxKhi*100)+'%';
    blockPip.textContent=S.block>0?('⛨ Phòng ngự '+S.block):'';
    tamPhamEl.textContent='Tâm Pháp: '+(LT.tamPhap?tpById(LT.tamPhap).name:'—');
    renderSkillBar();
    soulEl.textContent=S.soul;
  }

  /* ----- FX ----- */
  function fnum(who,val,color){
    var port=(who==='e'?ePort:hPort);
    var p=port.getBoundingClientRect(), hostR=boardEl.getBoundingClientRect();
    var f=el('div','fnum',val); f.style.color=color;
    var x=p.left+p.width/2-hostR.left, y=p.top+p.height/2-hostR.top;
    if(p.left<hostR.left-5||p.left>hostR.right+5){ x=(who==='e'?hostR.width*0.14:hostR.width*0.86); y=hostR.height*0.14; }
    f.style.left=x+'px'; f.style.top=y+'px';
    fxEl.appendChild(f); setTimeout(function(){ f.remove(); },1000);
  }
  function flash(portEl){ var f=portEl.querySelector('.flash'); if(!f) return; f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }
  function shake(){ boardEl.classList.remove('shake'); void boardEl.offsetWidth; boardEl.classList.add('shake'); }
  function combo(n,txt){ var i=Math.min(n|0,TIERS.length-1);
    comboEl.textContent = txt || TIERS[i]; comboEl.style.color = txt ? '#f5b942' : TIERC[i];
    comboEl.style.fontSize = (Math.min(2.2, 1.1 + (n|0)*0.2)) + 'rem';
    comboEl.classList.remove('on'); void comboEl.offsetWidth; comboEl.classList.add('on'); }

  /* ----- harness dev (chỉ khi localStorage kt_dev==='1') — sync, không animate ----- */
  var devOn=false;
  try{ devOn=(typeof localStorage!=='undefined' && localStorage.getItem('kt_dev')==='1'); }catch(e){}
  var harness=null;
  function resolveSync(initSet, colorHint){
    var step=0, extra=false, pending=initSet;
    while(true){
      var clearSet, newSpecials=[];
      if(pending){ clearSet=pending; pending=null; }
      else { var an=analyzeMatches(null); if(!an) break; clearSet=an.clearSet; newSpecials=an.specials; }
      var chained=expandSpecials(clearSet, colorHint); colorHint=null;
      newSpecials.forEach(function(s){ delete clearSet[s.r+','+s.c]; });
      if(newSpecials.length) extra=true;
      if(hasTP('thaiCuc')){ if(newSpecials.length) S.khi=Math.min(HERO.maxKhi,S.khi+15*newSpecials.length); if(chained>0) S.khi=Math.min(HERO.maxKhi,S.khi+8*chained); }
      var counts={}; Object.keys(clearSet).forEach(function(k){ var p=k.split(','); var t=board[p[0]][p[1]]; if(t){ counts[t.type]=(counts[t.type]||0)+1; if(t.poison&&t.pown!=='hero'&&hasTP('hoaDoc')) S.docTinh=Math.min(8,S.docTinh+1); } });
      Object.keys(clearSet).forEach(function(k){ var p=k.split(','); board[p[0]][p[1]]=null; });
      applyCounts(counts, 1+0.25*step);
      newSpecials.forEach(function(s){ board[s.r][s.c]={ id:uid++, type:s.type, sp:s.sp }; });
      var dom=null,dmax=0; for(var tk in counts){ if(counts[tk]>dmax){ dmax=counts[tk]; dom=tk; } }
      gravity(); refill((hasTP('canKhon')&&dom)?SINH[dom]:null); step++; if(step>40) break;
    }
    return extra;
  }
  function enemyTurnSync(){
    var deto=tickPoison();
    if(deto.enemy>0){ S.enemy.hp=Math.max(0,S.enemy.hp-deto.enemy*(S.enemy.poisonDmg||6)); if(S.enemy.hp<=0) return; }
    if(deto.hero>0){ var pd=deto.hero*S.enemy.poisonDmg,d=pd; if(S.block>0){ var ab=Math.min(S.block,d); S.block-=ab; d-=ab; } S.hp=Math.max(0,S.hp-d); if(S.hp<=0) return; }
    if(S.enemyFrozen){ S.enemyFrozen=false; return; }
    S.eTurn++; var heavy=S.enemy.heavyEvery&&(S.eTurn%S.enemy.heavyEvery===0); var dmg=Math.round(S.enemy.atk*(heavy?S.enemy.heavyMul:1)); var d2=dmg;
    if(S.block>0){ var ab2=Math.min(S.block,d2); S.block-=ab2; d2-=ab2; } S.hp=Math.max(0,S.hp-d2);
    if(S.enemy.poisonEvery && S.eTurn%S.enemy.poisonEvery===0) spawnPoison(S.enemy.poisonK);
  }
  if(devOn){
    harness={
      get S(){ return S; }, get board(){ return board; }, get LT(){ return LT; },
      findBestMove:function(){
        var need=S.hp<HERO.maxHp*0.45?'tim':'kiem'; var best=null,bs=-1;
        for(var r=0;r<N;r++)for(var c=0;c<N;c++){ var dirs=[[0,1],[1,0]];
          for(var d=0;d<2;d++){ var r2=r+dirs[d][0],c2=c+dirs[d][1]; if(r2>=N||c2>=N)continue;
            var A=board[r][c],B=board[r2][c2]; if(!A||!B) continue; var score=-1;
            if(A.sp||B.sp){ /* kích / hợp bích: ước lượng số kiếm bị nổ */
              var cs={}; if(A.sp&&B.sp){ cs[r+','+c]=true; cs[r2+','+c2]=true; } else { if(A.sp)cs[r+','+c]=true; else cs[r2+','+c2]=true; }
              var hint=A.sp?B.type:A.type; var set={}; for(var kk in cs) set[kk]=true; expandSpecials(set, hint);
              var kd=0; Object.keys(set).forEach(function(k){ var p=k.split(','); var t=board[p[0]][p[1]]; if(t&&t.type==='kiem')kd++; });
              score=9 + kd*1.7 + Object.keys(set).length*0.3;
            } else {
              board[r][c]=B; board[r2][c2]=A; var gs=findGroups();
              if(gs.length){ var counts={},maxLen=0; gs.forEach(function(g){ counts[g.type]=(counts[g.type]||0)+g.len; if(g.len>maxLen)maxLen=g.len; });
                score=gs.length+(maxLen>=4?7:0)+(maxLen>=5?6:0)+(counts.kiem||0)*1.4;
                if(need==='tim') score+=(counts.tim||0)*5;
                if(S.khi<HERO.maxKhi) score+=(counts.khi||0)*2.2; }
              board[r][c]=A; board[r2][c2]=B;
            }
            if(score>bs){ bs=score; best={a:{r:r,c:c},b:{r:r2,c:c2}}; }
          }} return best;
      },
      _exec:function(mv){
        var A=board[mv.a.r][mv.a.c], B=board[mv.b.r][mv.b.c];
        if(A.sp&&B.sp){ board[mv.a.r][mv.a.c]=B; board[mv.b.r][mv.b.c]=A; var cs={}; cs[mv.a.r+','+mv.a.c]=true; cs[mv.b.r+','+mv.b.c]=true; return resolveSync(cs, A.type); }
        if(A.sp||B.sp){ var spT=A.sp?A:B, oth=A.sp?B:A; board[mv.a.r][mv.a.c]=B; board[mv.b.r][mv.b.c]=A; var np=findTilePos(spT.id); var cs2={}; cs2[np.r+','+np.c]=true; return resolveSync(cs2, oth.type); }
        board[mv.a.r][mv.a.c]=B; board[mv.b.r][mv.b.c]=A; if(!hasMatch()){ board[mv.a.r][mv.a.c]=A; board[mv.b.r][mv.b.c]=B; return 'nomatch'; } return resolveSync(null,null);
      },
      autoRunSmart:function(maxSteps){
        maxSteps=maxSteps||1500; var log=[];
        for(var i=0;i<maxSteps;i++){
          if(hasSkill('kiemKhi') && S.khi>=HERO.maxKhi){ S.khi-=HERO.maxKhi; S._kimCangTurn=false; var hit=kiemStrike(55); S.enemy.hp=Math.max(0,S.enemy.hp-hit.d); }
          if(S.enemy.hp<=0){ log.push('WIN'); S.over=true; break; }
          var mv=this.findBestMove(); if(!mv){ makeBoard(); continue; }
          var extra=this._exec(mv); if(extra==='nomatch'){ makeBoard(); continue; }
          if(S.enemy.hp<=0){ log.push('WIN'); S.over=true; break; }
          if(extra && (S.extraStreak||0)<S.extraCap){ S.extraStreak=(S.extraStreak||0)+1; }
          else { S.extraStreak=0; enemyTurnSync(); if(S.hp<=0){ log.push('LOSE (turn '+S.eTurn+')'); S.over=true; break; } }
        }
        renderBoard(); renderAll();
        return { log:log, over:S.over, hp:Math.ceil(S.hp), soul:S.soul };
      },
      analyze:function(swapCells){ var an=analyzeMatches(swapCells); return an?{ clearCount:Object.keys(an.clearSet).length, specials:an.specials.map(function(s){ return s.sp; }) }:null; },
      place:function(r,c,type,sp){ board[r][c]={ id:uid++, type:type, sp:sp||null }; },
      testClear:function(initSet, hint){ var cs={}; for(var k in initSet) cs[k]=true; expandSpecials(cs, hint); var byType={}; Object.keys(cs).forEach(function(k){ var p=k.split(','); var t=board[p[0]][p[1]]; if(t)byType[t.type]=(byType[t.type]||0)+1; }); return byType; },
      simResolve:function(initSet,colorHint){ var e2=resolveSync(initSet,colorHint); renderBoard(); renderAll(); return e2; },
      poisonCount:function(){ var n2=0; for(var r=0;r<N;r++)for(var c=0;c<N;c++) if(board[r][c]&&board[r][c].poison)n2++; return n2; },
      eTurn:function(){ enemyTurnSync(); renderBoard(); renderAll(); },
      begin:function(tp,skills){
        if(tp) LT.tamPhap=tp; if(skills) LT.skills=skills.slice();
        S={ hp:HERO.maxHp, khi:0, block:0, soul:0, enemy:null, eTurn:0, over:false, extraStreak:0, _transit:false, tmode:null, sk:{}, goldStock:0, docTinh:0, enemyFrozen:false, extraCap:2, _kimCangTurn:false };
        loadEnemy(); makeBoard(); overlayEl.classList.remove('show'); overlayEl.innerHTML=''; busy=false; boardEl.classList.remove('busy'); renderAll();
        return { tamPhap:LT.tamPhap, skills:LT.skills.slice() };
      },
      loadout:function(){ return { tamPhap:LT.tamPhap, skills:LT.skills.slice(), khi:S.khi, docTinh:S.docTinh, goldStock:S.goldStock, soul:S.soul, charges:S.sk }; }
    };
    window.KT3=harness;
  }

  /* ----- resize + destroy ----- */
  var onResize=function(){ sizeBoard(); };
  window.addEventListener('resize', onResize);

  function destroy(){
    dead=true;
    window.removeEventListener('resize', onResize);
    if(toastTimer) clearTimeout(toastTimer);
    if(devOn && window.KT3===harness){ try{ delete window.KT3; }catch(e){ window.KT3=undefined; } }
    host.innerHTML='';
  }

  startBattle();

  return { destroy:destroy, resize:sizeBoard };
}
