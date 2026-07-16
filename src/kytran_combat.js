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
var TVAR={ kiem:'var(--kiem)', tim:'var(--tim)', khien:'var(--khien)', khi:'var(--khi)', bao:'var(--bao)' };
var TIMG={ kiem:'images/kytran/tile_kiem.webp', tim:'images/kytran/tile_tim.webp', khien:'images/kytran/tile_khien.webp', khi:'images/kytran/tile_khi.webp', bao:'images/kytran/tile_bao.webp' };

var KIEM_DMG=7, TIM_HEAL=6, KHIEN_BLK=6, KHI_GAIN=12, BAO_SOUL=2;
var SINH={ kiem:'khi', khi:'bao', bao:'tim', tim:'khien', khien:'kiem' };
/* ĐỐI TRẬN: trần dmg/lượt — địch→người 0.30 (chống one-shot người); người→địch 0.50 (nới, mob HP thấp chết nhanh). Tử Chiến từ lượt ≥24. */
var CAP_FRAC=0.30, ENEMY_CAP=0.50, SUDDEN_START=24, ENEMY_KHI_REGEN=14, BOSS_CAP_ABS=60;   /* BOSS_CAP_ABS: trần tuyệt đối dmg người→boss/lượt (ép trận boss dài, cân hero full-power) — tune ở đây */
/* PHA 2 — palette chiêu Cung Chủ (name/acc/icon). Hiệu ứng ở enemySkillCore (dùng chung visual+harness). */
var EN_SKILLS={
  cuongTap:       { name:'Cường Tập',        acc:'#e2e8f0', icon:'images/kytran/esk_cuongTap.webp' },
  coDoc:          { name:'Cổ Độc',           acc:'#84cc16', icon:'images/kytran/esk_coDoc.webp' },
  lietDiem:       { name:'Liệt Diễm',        acc:'#fb923c', icon:'images/kytran/esk_lietDiem.webp' },
  hanNgung:       { name:'Hàn Ngưng',        acc:'#7dd3fc', icon:'images/kytran/esk_hanNgung.webp' },
  cuongThachGiap: { name:'Cương Thạch Giáp', acc:'#d6a760', icon:'images/kytran/esk_cuongThach.webp' },
  baDaoThon:      { name:'Ba Đào Thôn',      acc:'#3f9fb8', icon:'images/kytran/esk_baDao.webp' },
  cuuTieuLoi:     { name:'Cửu Tiêu Lôi',     acc:'#c084fc', icon:'images/kytran/esk_cuuTieuLoi.webp' },
  thonKhi:        { name:'Thôn Khí',         acc:'#22d3ee', icon:'images/kytran/esk_thonKhi.webp' },
  maDeDietThe:    { name:'Ma Đế Diệt Thế',   acc:'#fb7185', icon:'images/kytran/esk_dietThe.webp' }
};

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
'  position:relative; height:min(660px,calc(100vh - 200px)); min-height:440px; display:flex; flex-direction:column; gap:8px; color:var(--tx); font-size:14px; font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }',
'.ktb, .ktb *{ box-sizing:border-box; -webkit-tap-highlight-color:transparent; }',
'.ktb img{ -webkit-user-drag:none; user-select:none; }',
'.ktb button{ font:inherit; color:inherit; background:none; border:none; cursor:pointer; padding:0; }',
'.ktb .fserif{ font-family:"Lora",serif; font-weight:700; }',
'.ktb .btn{ padding:8px 14px; border-radius:8px; font-weight:700; font-size:.82rem; background:var(--ink3); border:1px solid var(--bd); color:var(--tx); }',
'.ktb .btn:disabled{ opacity:.4; cursor:not-allowed; }',
'.ktb .ktb-top{ flex:none; display:flex; align-items:center; justify-content:space-between; gap:8px; }',
'.ktb .ktb-soul{ display:flex; align-items:baseline; gap:6px; padding:4px 12px; border-radius:99px; background:var(--ink2); border:1px solid var(--bd); font-size:.82rem; font-weight:700; color:var(--gold); }',
'.ktb .ktb-soul .l{ font-weight:400; color:var(--tx3); font-size:.66rem; }',
'.ktb .ktb-soul .soulic{ width:18px; height:18px; object-fit:contain; align-self:center; }',
'.ktb .ktb-retreat{ padding:5px 12px; border-radius:8px; font-size:.72rem; font-weight:700; color:var(--tx2); background:var(--ink3); border:1px solid var(--bd); }',
'.ktb .stage{ flex:1; min-height:0; display:flex; gap:12px; align-items:stretch; justify-content:center; }',
'.ktb .side{ width:190px; flex:none; display:flex; flex-direction:column; gap:8px; min-height:0; }',
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
'.ktb .blockpip{ font-size:.66rem; color:#cbd5e1; min-height:15px; line-height:15px; }',
'.ktb .intent{ font-size:.68rem; color:var(--rose); text-align:center; padding:2px; }',
'.ktb .ktb-turn{ display:inline-flex; align-items:center; gap:6px; padding:4px 11px; border-radius:99px; font-family:"Lora",serif; font-weight:700; font-size:.76rem; border:1px solid var(--bd); background:var(--ink3); white-space:nowrap; flex:none; }',
'.ktb .ktb-turn .dot{ width:8px; height:8px; border-radius:99px; background:currentColor; box-shadow:0 0 7px currentColor; }',
'.ktb .ktb-turn.hero{ color:var(--jade); border-color:color-mix(in srgb,var(--jade) 45%,var(--bd)); }',
'.ktb .ktb-turn.enemy{ color:var(--rose); border-color:color-mix(in srgb,var(--rose) 45%,var(--bd)); }',
'.ktb .fighter .fport.active{ border-color:var(--gold); box-shadow:0 0 0 2px color-mix(in srgb,var(--gold) 38%,transparent), 0 0 26px -4px var(--gold); }',
'.ktb .ekhiwrap{ opacity:.9; }',
'.ktb .eblockpip{ min-height:15px; line-height:15px; }',
'.ktb .ktb-turnwrap{ display:flex; align-items:center; gap:8px; }',   /* nhóm GIỮA: pill lượt + chip Đi thêm (thanh top, không đè bàn) */
'.ktb .ktb-extra{ display:none; align-items:center; gap:5px; padding:4px 11px; border-radius:99px; font-family:"Lora",serif; font-weight:700; font-size:.72rem; color:#3a2606; background:linear-gradient(180deg,#f7e2a8,#f5b942); box-shadow:0 0 14px -3px var(--gold); white-space:nowrap; }',
'.ktb .ktb-extra.on{ display:inline-flex; animation:ktbExtraPulse 1s ease-in-out infinite; }',
'@keyframes ktbExtraPulse{ 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.06); } }',
'.ktb .tile.aisel .tin{ transform:scale(1.06); box-shadow:0 0 0 2px var(--rose), inset 0 -3px 8px rgba(0,0,0,.35); }',
'.ktb .boardcol{ flex:1 1 auto; min-width:0; min-height:0; display:flex; align-items:center; justify-content:center; }',
'.ktb .board{ position:relative; aspect-ratio:1; max-width:100%; max-height:100%; margin:0 auto; background:rgba(3,7,16,.55); border:2px solid #2a3346; border-radius:12px; padding:4px; box-shadow:inset 0 0 40px -10px #000; }',
'.ktb .board.busy{ pointer-events:none; }',
'.ktb .board.targeting{ cursor:crosshair; box-shadow:inset 0 0 0 2px var(--cyan), inset 0 0 40px -10px #000; }',
'.ktb .tile{ position:absolute; left:0; top:0; width:calc(100%/7); height:calc(100%/7); padding:3px; transform:translate(0,0); transition:transform .19s ease; cursor:pointer; z-index:1; }',
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
'.ktb .tile.burn .tin{ box-shadow:0 0 0 2px #f97316, inset 0 0 13px rgba(249,115,22,.52); }',
'.ktb .tile.burn .tin::after{ content:""; position:absolute; inset:0; border-radius:9px; background:radial-gradient(circle at 50% 80%, rgba(255,230,150,.55), rgba(249,115,22,.36) 44%, transparent 70%); animation:ktbBurnpulse 1.1s ease-in-out infinite; }',
'.ktb .tile.burn .tin::before{ content:""; position:absolute; left:42%; bottom:22%; width:3px; height:3px; border-radius:50%; z-index:2; background:#fff0b8; box-shadow:7px 3px 0 0 #fdba74, -8px 7px 0 -.5px #fb923c, 12px 10px 0 -.5px #fca85a, -3px 14px 0 -1px #f97316, 9px 18px 0 -1px #ffd27a, -10px 22px 0 -1px #fb923c, 3px 25px 0 -1.5px #fdba74; animation:ktbEmber 1.25s linear infinite; }',
'.ktb .tile.burn .pcd{ color:#fff7ed; background:rgba(70,20,4,.9); border-color:#fb923c; }',
'@keyframes ktbBurnpulse{ 0%,100%{opacity:.5} 50%{opacity:.94} }',
'@keyframes ktbEmber{ 0%{ transform:translateY(2px); opacity:0 } 22%{ opacity:1 } 100%{ transform:translateY(-44px); opacity:0 } }',
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
/* ===== Cue phát chiêu "Phá Trận" (tên chiêu — màu theo accent chiêu, port từ mockup đã duyệt) ===== */
'.ktb .skcue{ position:absolute; inset:0; z-index:33; pointer-events:none; overflow:hidden; }',
'.ktb .skcue-streak{ position:absolute; left:-45%; top:50%; width:62%; height:24px; transform:translateY(-50%) skewX(-24deg); background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--acc) 72%,#fff),#fff,color-mix(in srgb,var(--acc) 72%,#fff),transparent); box-shadow:0 0 22px var(--acc); opacity:0; }',
'.ktb .skcue-streak.go{ animation:ktbCueStreak .55s cubic-bezier(.4,0,.2,1) forwards; }',
'@keyframes ktbCueStreak{ 0%{opacity:0; left:-45%;} 30%{opacity:1;} 70%{opacity:1;} 100%{opacity:0; left:132%;} }',
'.ktb .skcue-flash{ position:absolute; left:50%; top:50%; width:54%; aspect-ratio:1; transform:translate(-50%,-50%); border-radius:50%; background:radial-gradient(circle,rgba(255,255,255,.5),color-mix(in srgb,var(--acc) 30%,transparent) 45%,transparent 70%); opacity:0; mix-blend-mode:screen; }',
'.ktb .skcue-flash.go{ animation:ktbCueFlash .5s ease-out .16s forwards; }',
'@keyframes ktbCueFlash{ 0%{opacity:0; transform:translate(-50%,-50%) scale(.7);} 35%{opacity:.8; transform:translate(-50%,-50%) scale(1.05);} 100%{opacity:0; transform:translate(-50%,-50%) scale(1.2);} }',
'.ktb .skcue-nm{ position:absolute; left:50%; top:50%; transform:translate(-50%,-50%) scale(1.25); font-family:"Lora",serif; font-weight:700; font-size:clamp(1.05rem,4.6vw,1.8rem); color:#fff; text-shadow:0 0 16px var(--acc), 0 2px 7px #000; opacity:0; white-space:nowrap; }',
'.ktb .skcue-nm.go{ animation:ktbCueNm 1s cubic-bezier(.2,.7,.3,1) forwards; }',
'@keyframes ktbCueNm{ 0%{opacity:0; transform:translate(-50%,-50%) scale(1.28);} 18%{opacity:1; transform:translate(-50%,-50%) scale(1);} 80%{opacity:1;} 100%{opacity:0; transform:translate(-50%,-50%) scale(1.02);} }',
/* PHA 2 — icon chiêu boss: đĩa TO trong cast cue + icon nhỏ ở telegraph (eIntent) */
'.ktb .skcue-ic{ position:absolute; left:50%; top:41%; width:90px; height:90px; transform:translate(-50%,-50%); border-radius:50%; display:grid; place-items:center; overflow:hidden; background:radial-gradient(70% 70% at 50% 38%, color-mix(in srgb,var(--acc) 30%,#0b1018), #060a12 88%); border:2px solid color-mix(in srgb,var(--acc) 70%,#1b2436); box-shadow:0 0 0 3px color-mix(in srgb,var(--acc) 24%,transparent), 0 0 30px -4px var(--acc), inset 0 0 18px -4px #000; opacity:0; }',
'.ktb .skcue-ic>img{ width:100%; height:100%; object-fit:contain; border-radius:50%; filter:drop-shadow(0 2px 4px #000) brightness(1.18) contrast(1.06); }',
'.ktb .skcue-ic.noimg{ display:none; }',
'.ktb .skcue-ic.go{ animation:ktbCueIc .95s cubic-bezier(.2,.7,.3,1) forwards; }',
'@keyframes ktbCueIc{ 0%{opacity:0; transform:translate(-50%,-50%) scale(.55) rotate(-8deg);} 20%{opacity:1; transform:translate(-50%,-50%) scale(1.06) rotate(0);} 78%{opacity:1; transform:translate(-50%,-50%) scale(1);} 100%{opacity:0; transform:translate(-50%,-50%) scale(1.04);} }',
'.ktb .skcue.has-ic .skcue-nm{ top:72%; font-size:clamp(.92rem,3.9vw,1.5rem); }',
'.ktb .skcue-shard{ position:absolute; left:50%; top:50%; width:8px; height:2px; border-radius:2px; background:var(--acc); box-shadow:0 0 6px var(--acc); opacity:0; }',
'.ktb .skcue-shard.go{ animation:ktbCueShard var(--d,420ms) ease-out .12s forwards; }',
'@keyframes ktbCueShard{ 0%{opacity:0; transform:translate(-50%,-50%) rotate(var(--r,0deg));} 30%{opacity:1;} 100%{opacity:0; transform:translate(calc(-50% + var(--tx,0px)),calc(-50% + var(--ty,0px))) rotate(var(--r,0deg));} }',
'.ktb .shake{ animation:ktbShk .3s; } @keyframes ktbShk{ 0%,100%{transform:translate(0,0);} 25%{transform:translate(-4px,2px);} 60%{transform:translate(5px,-2px);} }',
'.ktb .overlay{ position:fixed; inset:0; z-index:520; background:rgba(3,6,14,.82); backdrop-filter:blur(3px); display:none; align-items:center; justify-content:center; padding:16px; }',
'.ktb .overlay.show{ display:flex; }',
'.ktb .obox{ max-width:450px; width:100%; padding:26px 24px; text-align:center; border-radius:14px; background:var(--ink2); border:1px solid var(--bd); }',
'.ktb .obox h1{ font-family:"Lora",serif; font-weight:700; font-size:1.5rem; color:var(--gold); margin:0 0 4px; }',
'.ktb .obox h1.lose{ color:var(--rose); }',
'.ktb .obox .osub{ color:var(--tx2); font-size:.84rem; margin-bottom:14px; }',
/* ===== Màn kết trận — Cuốn Trận Đồ (banner ngang, chân dung địch) ===== */
'.ktb .ores{ width:520px; max-width:94vw; border-radius:16px; overflow:hidden; position:relative; border:1px solid var(--bd); background:linear-gradient(180deg,#0f1826,#0a0f1a); box-shadow:0 30px 80px -24px #000; }',
'.ktb .ores-band{ display:flex; align-items:stretch; }',
'.ktb .ores-port{ position:relative; width:150px; flex:none; overflow:hidden; background:#0b1020; }',
'.ktb .ores-port>img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:50% 15%; filter:grayscale(.4) brightness(.6); }',
'.ktb .ores-port .fade{ position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(15,24,38,.92)); }',
'.ktb .ores.lose .ores-port>img{ filter:grayscale(.75) brightness(.4); }',
'.ktb .ores-main{ flex:1; min-width:0; padding:20px 22px; }',
'.ktb .ores-main .kick{ font-size:.68rem; letter-spacing:3px; text-transform:uppercase; color:var(--jade); font-weight:700; }',
'.ktb .ores.lose .ores-main .kick{ color:var(--rose); }',
'.ktb .ores-main .ttl{ font-family:"Lora",serif; font-weight:700; font-size:1.42rem; color:var(--gold2); margin-top:3px; line-height:1.1; }',
'.ktb .ores.lose .ores-main .ttl{ color:var(--rose); }',
'.ktb .ores-main .sub{ color:var(--tx2); font-size:.8rem; margin-top:4px; font-style:italic; font-family:"Lora",serif; }',
'.ktb .ores-loot{ margin-top:13px; display:inline-flex; align-items:center; gap:8px; padding:7px 14px; border-radius:10px; background:rgba(245,185,66,.1); border:1px solid rgba(245,185,66,.28); }',
'.ktb .ores-loot img{ width:22px; height:22px; object-fit:contain; }',
'.ktb .ores-loot b{ font-family:"Lora",serif; font-weight:700; font-size:1.05rem; color:var(--gold2); }',
'.ktb .ores-loot span{ font-size:.72rem; color:var(--tx2); }',
'.ktb .ores-loot.dim{ background:rgba(148,163,184,.06); border-color:var(--bd); }',
'.ktb .ores-loot.dim span{ color:var(--tx3); font-style:italic; }',
'.ktb .ores-break{ margin-top:8px; font-size:.7rem; color:var(--tx3); }',
'.ktb .ores-unlocks{ margin-top:9px; display:flex; flex-wrap:wrap; gap:6px; justify-content:center; }',
'.ktb .ores-unlock{ font-family:"Lora",serif; font-size:.7rem; font-weight:700; color:#3a2606; background:linear-gradient(180deg,#f7e2a8,#f5b942); border-radius:20px; padding:3px 11px; box-shadow:0 2px 8px -3px rgba(245,185,66,.5); }',
'.ktb .ores-acts{ display:flex; gap:9px; padding:15px 22px 20px; border-top:1px solid rgba(255,255,255,.05); }',
'.ktb .ores-btn{ flex:1; font-family:"Lora",serif; font-weight:700; font-size:.9rem; padding:11px; border-radius:11px; cursor:pointer; border:1px solid var(--bd2); background:linear-gradient(180deg,#141d2c,#0e1622); color:var(--tx); transition:.14s; }',
'.ktb .ores-btn:hover{ filter:brightness(1.12); }',
'.ktb .ores-btn:disabled{ opacity:.5; cursor:default; }',
'.ktb .ores-btn.next{ border-color:color-mix(in srgb,var(--jade) 45%,var(--bd)); color:var(--jade); }',
'.ktb .toast{ position:fixed; top:14px; left:50%; transform:translateX(-50%); z-index:560; background:rgba(15,21,33,.96); border:1px solid var(--bd); color:var(--tx); font-size:.8rem; padding:7px 16px; border-radius:99px; opacity:0; transition:opacity .25s; pointer-events:none; max-width:90vw; }',
'.ktb .toast.show{ opacity:1; }',
/* ===== Skill bar trong trận — huy chương tròn (đồng bộ Lập Trận) ===== */
'.ktb .skillbar{ margin-top:6px; display:flex; flex-direction:column; gap:9px; }',
'.ktb .skmed{ display:flex; align-items:center; gap:10px; text-align:left; background:none; border:none; padding:0; width:100%; }',
'.ktb .skmed:disabled{ cursor:not-allowed; }',
'.ktb .skmed .skdisc{ position:relative; width:54px; height:54px; flex:none; border-radius:50%; display:grid; place-items:center; background:radial-gradient(70% 70% at 50% 38%, color-mix(in srgb,var(--a) 20%,transparent), #0b1018 82%); border:2px solid color-mix(in srgb,var(--a) 40%,#1b2436); transition:border-color .15s, box-shadow .15s, filter .15s; }',
'.ktb .skmed .skdisc>img{ width:50px; height:50px; border-radius:50%; object-fit:contain; filter:drop-shadow(0 2px 4px rgba(0,0,0,.5)); position:relative; z-index:1; }',
'.ktb .skmed .skdisc svg{ width:52%; height:52%; color:var(--a); }',
'.ktb .skmed .skdisc .sktile{ position:absolute; right:-3px; bottom:-3px; width:17px; height:17px; object-fit:contain; z-index:2; filter:drop-shadow(0 1px 2px #000); }',
'.ktb .skmed.ready .skdisc{ border-color:var(--a); box-shadow:0 0 0 2px color-mix(in srgb,var(--a) 30%,transparent), 0 0 18px -3px var(--a); }',
'.ktb .skmed:not(.ready) .skdisc{ filter:grayscale(.5) brightness(.68); }',
'.ktb .skmed .skm{ min-width:0; flex:1; }',
'.ktb .skmed .skm .nm{ font-family:"Lora",serif; font-weight:700; font-size:.64rem; color:#eef3fa; line-height:1.15; white-space:nowrap; }',   /* tên 1 hàng ĐỦ, không cắt/ellipsis (side 190px, font dư chỗ cho "Ngũ Hành Đại Chuyển") */
'.ktb .skmed .skm .st{ font-size:.66rem; color:var(--tx3); margin-top:2px; }',
'.ktb .skmed.ready .skm .st{ color:color-mix(in srgb,var(--a) 82%,#dfe6f0); }',
'.ktb .skmed .skm .mini{ height:5px; border-radius:4px; background:rgba(6,10,20,.85); overflow:hidden; margin-top:4px; }',
'.ktb .skmed .skm .mini>i{ display:block; height:100%; background:linear-gradient(90deg, color-mix(in srgb,var(--a) 55%,#0891b2), var(--a)); }',
'.ktb .skmed .skm .dots{ display:flex; gap:3px; margin-top:4px; }',
'.ktb .skmed .skm .dots i{ width:8px; height:8px; border-radius:50%; background:#334155; }',
'.ktb .skmed .skm .dots i.on{ background:var(--a); box-shadow:0 0 5px -1px var(--a); }',
/* ===== PHA 3: cột Tuyệt Học Cung Chủ (enemy, mirror hero .skmed) ===== */
'.ktb .eskillbar{ margin-top:8px; display:flex; flex-direction:column; gap:9px; }',
'.ktb .eskill-hd{ font-size:.6rem; letter-spacing:.06em; text-transform:uppercase; color:var(--tx3); border-top:1px solid var(--bd); padding-top:7px; }',
'.ktb .eskill-hd b{ color:var(--rose); font-weight:700; }',
'.ktb .skmed.emed{ cursor:default; }',
'.ktb .skmed.emed .skdisc{ width:48px; height:48px; }',
'.ktb .skmed.emed .skdisc>img{ width:44px; height:44px; filter:drop-shadow(0 2px 4px rgba(0,0,0,.5)) brightness(1.15) contrast(1.05); }',
'.ktb .skmed.emed .skdisc .fb{ font-family:"Lora",serif; font-weight:700; font-size:18px; color:color-mix(in srgb,var(--a) 70%,#cbd5e1); }',
'.ktb .skmed.emed:not(.ready) .skdisc{ filter:none; }',   /* enemy medallion không xám như hero-chưa-sẵn-sàng */
'.ktb .skmed.emed .skm .nm{ color:#f0e3d0; }',
'.ktb .skmed.emed .st.soon{ color:var(--gold); font-weight:700; }',
'.ktb .skmed.emed.warn .skdisc{ border-color:color-mix(in srgb,var(--a) 80%,#1b2436); box-shadow:0 0 0 2px color-mix(in srgb,var(--a) 24%,transparent), 0 0 14px -4px var(--a); }',
'.ktb .skmed.emed.ready .skdisc{ border-color:var(--gold); box-shadow:0 0 0 2px color-mix(in srgb,var(--gold) 40%,transparent), 0 0 20px -3px var(--gold); animation:ktbSigPulse 1.1s ease-in-out infinite; }',
'@keyframes ktbSigPulse{ 0%,100%{ box-shadow:0 0 0 2px color-mix(in srgb,var(--gold) 40%,transparent), 0 0 20px -3px var(--gold); } 50%{ box-shadow:0 0 0 3px color-mix(in srgb,var(--gold) 55%,transparent), 0 0 28px -2px var(--gold); } }',
/* badge trên đĩa chiêu — địch: đếm lượt/'!' · hero: số Kho Bảo (chiêu 'stock'). Mặc định ẩn (desktop đã có status chữ), CHỈ bật ở mobile (media query bên dưới) nơi .st bị ẩn cho gọn. */
'.ktb .skmed .ecd{ display:none; position:absolute; top:-4px; right:-4px; min-width:16px; height:16px; padding:0 3px; border-radius:99px; background:#141d2c; border:1px solid color-mix(in srgb,var(--a) 70%,#1b2436); color:#f0e3d0; font-family:"Lora",serif; font-weight:700; font-size:10px; line-height:14px; text-align:center; z-index:3; box-shadow:0 1px 3px rgba(0,0,0,.5); }',
'.ktb .skmed .ecd.hot{ background:var(--gold); color:#3a2606; border-color:var(--gold); box-shadow:0 0 8px -1px var(--gold); }',
/* ===== Lập Trận v4 (scope .ktb .ltbox — tránh đụng class combat) ===== */
'.ktb .ltbox{ width:min(1000px,96vw); height:min(660px,92dvh); overflow:hidden; position:relative; display:flex; flex-direction:column; background:linear-gradient(180deg,rgba(20,29,45,.96),rgba(11,18,32,.98)),#0b1220; border:1px solid #26344a; border-radius:18px; box-shadow:0 34px 90px -24px rgba(0,0,0,.82), inset 0 1px 0 rgba(255,255,255,.05); }',
'.ktb .ltbox::before{ content:""; position:absolute; inset:0 0 auto 0; height:2px; background:linear-gradient(90deg,transparent,rgba(245,185,66,.55),transparent); opacity:.75; z-index:2; }',
'.ktb .ltbox .lt-hdr{ flex:none; padding:12px 22px; border-bottom:1px solid #1e293b; display:flex; align-items:center; gap:13px; background:linear-gradient(180deg,rgba(30,41,59,.34),transparent); }',
'.ktb .ltbox .lt-mk{ width:40px; height:40px; flex:none; border-radius:11px; display:grid; place-items:center; overflow:hidden; background:radial-gradient(70% 70% at 50% 32%,rgba(245,185,66,.22),#0b1018 84%); border:1px solid rgba(245,185,66,.34); box-shadow:0 0 18px -8px #f5b942; }',
'.ktb .ltbox .lt-mk img{ width:100%; height:100%; object-fit:contain; }',
'.ktb .ltbox .lt-mk .fb{ font-family:"Lora",serif; font-weight:700; font-size:19px; color:#f3e2b0; }',
'.ktb .ltbox h1{ margin:0; font-family:"Lora",serif; font-weight:700; font-size:22px; letter-spacing:.6px; background:linear-gradient(180deg,#f7e2a8,#f5b942 56%,#c9932e); -webkit-background-clip:text; background-clip:text; color:transparent; }',
'.ktb .ltbox .lt-thread{ margin-left:14px; flex:1; height:1px; background:linear-gradient(90deg,rgba(245,185,66,.3),transparent 70%); }',
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
'.ktb .ltbox .lt-close{ position:absolute; top:12px; right:13px; z-index:6; width:32px; height:32px; border-radius:9px; display:grid; place-items:center; cursor:pointer; color:#94a3b8; background:rgba(15,21,33,.55); border:1px solid #26344a; transition:.14s; }',
'.ktb .ltbox .lt-close:hover{ color:#e2e8f0; border-color:#3a4a63; background:rgba(30,41,59,.7); }',
'.ktb .ltbox .lt-close svg{ width:16px; height:16px; }',
'.ktb .ltbox .lt-go{ display:inline-block; cursor:pointer; border:15px solid transparent; border-width:15px 46px; border-image:url("images/dongphu/ui/btn_gold.webp") 48 150 fill / 15px 46px / 0 stretch; color:#f3e7c7; font-family:"Lora",serif; font-weight:700; font-size:15px; letter-spacing:.24em; text-shadow:0 1px 2px rgba(60,30,0,.55); line-height:1; padding:8px 10px; background:transparent; transition:filter .15s, transform .1s; }',
'.ktb .ltbox .lt-go:hover{ filter:brightness(1.08); } .ktb .ltbox .lt-go:active{ transform:translateY(1px); }',
'.ktb .ltbox .lt-go.off{ filter:grayscale(.75) brightness(.72); cursor:not-allowed; pointer-events:none; }',
'@media (max-width:767px){',
'  .ktb .ktb-top{ gap:6px; }',   /* thanh trên: khỏi wrap khi chip "Đi thêm!" hiện */
'  .ktb .ktb-soul{ flex:none; padding:4px 10px; }  .ktb .ktb-soul .l{ display:none; }',   /* ẩn nhãn "Trận Hồn" — giữ icon魂 + số, đủ chỗ cho pill lượt + Đi thêm */
'  .ktb .ktb-turnwrap{ flex:none; }  .ktb .ktb-retreat{ flex:none; }',
'  .ktb .stage{ flex-direction:column; gap:6px; }',
'  .ktb .side{ width:100%; flex-direction:row; align-items:center; gap:10px; }',
'  .ktb .side .fighter{ flex:1; flex-direction:row; align-items:center; gap:8px; }',
'  .ktb .side .fighter .fport{ width:46px; height:54px; aspect-ratio:auto; flex:none; }',
'  .ktb .side .fighter .fmeta{ flex:1; } .ktb .side .fighter .fname{ margin-top:0; }',
'  .ktb .side.hero{ order:3; } .ktb .boardcol{ order:2; } .ktb .side.enemy{ order:1; }',
'  .ktb .tampham{ display:none; }',
'  .ktb .ltbox{ width:100%; height:auto; max-height:92dvh; overflow-y:auto; }',
'  .ktb .side.hero .skillbar, .ktb .side.enemy .eskillbar{ flex-direction:row; width:100%; flex:none; margin-top:0; }',
'  .ktb .side.hero .fighter, .ktb .side.enemy .fighter{ flex-wrap:wrap; }',
'  .ktb .eskill-hd{ display:none; }',
'  .ktb .skmed.emed{ flex:1; min-width:0; flex-direction:column; gap:3px; text-align:center; }',
'  .ktb .skmed.emed .skdisc{ width:38px; height:38px; }',
'  .ktb .skmed.emed .skdisc>img{ width:34px; height:34px; }',
'  .ktb .skmed .ecd{ display:grid; place-items:center; }',
'  .ktb .skmed.emed .skm .nm{ font-size:.56rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }',
'  .ktb .skmed.emed .skm .st{ display:none; }',
'  .ktb .skmed{ flex:1; min-width:0; flex-direction:column; gap:3px; text-align:center; }',
'  .ktb .skmed .skdisc{ width:46px; height:46px; }',
'  .ktb .skmed .skdisc>img{ width:42px; height:42px; }',
'  .ktb .skmed .skm .nm{ font-size:.58rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }',
'  .ktb .skmed .skm .st{ display:none; }',
'}',
/* Màn RẤT hẹp (<=380px): vì .ktb-top đã khoá flex:none + nowrap nên không co được -> nội dung (~308px) tràn pane (~298px)
   và nút "Rút Lui" bị cắt mất. Nén padding/font 4 mục cho vừa, vẫn giữ 1 hàng. */
'@media (max-width:380px){',
'  .ktb .ktb-top{ gap:4px; }',
'  .ktb .ktb-soul{ padding:4px 7px; font-size:.74rem; }',
'  .ktb .ktb-soul .soulic{ width:15px; height:15px; }',
'  .ktb .ktb-turnwrap{ gap:5px; }',
'  .ktb .ktb-turn{ padding:4px 8px; font-size:.7rem; gap:5px; }',
'  .ktb .ktb-extra{ padding:4px 7px; font-size:.66rem; }',
'  .ktb .ktb-retreat{ padding:5px 8px; font-size:.66rem; }',
'}',
'@media (prefers-reduced-motion:reduce){ .ktb .tile{ transition:none; } .ktb .tile.clear .tin,.ktb .tile.spawn,.ktb .shake,.ktb .flash.on,.ktb .tile.psn .tin::after,.ktb .tile.burn .tin::after,.ktb .tile.burn .tin::before,.ktb .tile.spfx-6 .deco::before,.ktb .tile.spfx-6 .deco::after,.ktb .tile.spfx-12 .deco,.ktb .tile.spfx-16 .deco::before,.ktb .combolabel.on,.ktb .fnum{ animation:none; } }',
/* ===== Lap Tran 2 buoc (l2-*) — override + layout wizard ===== */
'.ktb .ltbox{ width:min(460px,96vw); height:min(760px,94dvh); overflow:hidden; }',
'.ktb .ltbox .lt-go{ font-size:13px; letter-spacing:.16em; padding:7px 12px; white-space:nowrap; flex:0 0 auto; }',
'.ktb .ltbox .l2-steps{ flex:none; display:flex; gap:8px; padding:9px 15px; }',
'.ktb .ltbox .l2-stp{ flex:1; display:flex; align-items:center; gap:8px; padding:7px 11px; border-radius:11px; border:1px solid #26344a; background:rgba(15,21,33,.4); cursor:pointer; }',
'.ktb .ltbox .l2-stp .no{ width:22px; height:22px; flex:none; border-radius:50%; display:grid; place-items:center; font-family:"Lora",serif; font-size:12px; font-weight:700; color:#64748b; border:1px solid #33425c; }',
'.ktb .ltbox .l2-stp .v{ font-family:"Lora",serif; font-size:14px; font-weight:600; color:#94a3b8; line-height:1.1; white-space:nowrap; }',
'.ktb .ltbox .l2-stp.on{ border-color:rgba(245,185,66,.5); background:rgba(245,185,66,.1); }',
'.ktb .ltbox .l2-stp.on .no{ color:#3a2606; border-color:transparent; background:linear-gradient(180deg,#e8c877,#f5b942); }',
'.ktb .ltbox .l2-stp.on .v{ color:#f5d68a; }',
'.ktb .ltbox .l2-stp.done .no{ color:#2dd4bf; border-color:rgba(45,212,191,.5); }',
'.ktb .ltbox .l2-en{ flex:none; display:flex; align-items:center; gap:10px; margin:2px 15px 0; padding:7px 11px; border-radius:12px; background:linear-gradient(180deg,rgba(35,20,26,.55),rgba(15,10,14,.4)); border:1px solid #3a2830; }',
'.ktb .ltbox .l2-en .por{ width:40px; height:40px; flex:none; border-radius:10px; overflow:hidden; border:1px solid rgba(245,185,66,.14); background:radial-gradient(72% 66% at 50% 40%,rgba(251,113,133,.17),#0a0f18 84%); }',
'.ktb .ltbox .l2-en .por img{ width:100%; height:100%; object-fit:cover; object-position:50% 12%; }',
'.ktb .ltbox .l2-en .info{ min-width:0; flex:1; }',
'.ktb .ltbox .l2-en .lbl{ font-size:8.5px; letter-spacing:2px; color:#fb7185; font-weight:700; text-transform:uppercase; opacity:.8; }',
'.ktb .ltbox .l2-en .nm{ font-family:"Lora",serif; font-size:14px; font-weight:700; color:#f2e2c4; }',
'.ktb .ltbox .l2-en .mech{ font-size:11px; color:#f6cdd4; }',
'.ktb .ltbox .l2-main{ flex:1; min-height:0; display:flex; flex-direction:column; }',
'.ktb .ltbox .l2-step{ display:none; flex:1; min-height:0; flex-direction:column; padding:12px 15px 0; }',
'.ktb .ltbox .l2-step.on{ display:flex; }',
'.ktb .ltbox .l2-sech{ flex:none; display:flex; align-items:center; gap:8px; margin-bottom:11px; }',
'.ktb .ltbox .l2-sech .t{ font-family:"Lora",serif; font-size:15px; font-weight:700; color:#e8c877; letter-spacing:.4px; }',
'.ktb .ltbox .l2-sech .hint{ font-size:11px; color:#64748b; }',
'.ktb .ltbox .l2-sech .pick{ margin-left:auto; font-size:11px; color:#94a3b8; border:1px solid #26344a; border-radius:20px; padding:1px 10px; }',
'.ktb .ltbox .l2-sech .pick b{ color:#f5b942; } .ktb .ltbox .l2-sech .pick.ok{ border-color:rgba(45,212,191,.42); color:#2dd4bf; } .ktb .ltbox .l2-sech .pick.ok b{ color:#2dd4bf; }',
'.ktb .ltbox .l2-tabs{ flex:none; display:flex; gap:7px; margin-bottom:11px; overflow-x:auto; scrollbar-width:none; padding-bottom:2px; }',
'.ktb .ltbox .l2-tabs::-webkit-scrollbar{ display:none; }',
'.ktb .ltbox .l2-tab{ flex:none; font-size:12px; font-weight:600; padding:5px 13px; border-radius:20px; border:1px solid #26344a; color:#94a3b8; cursor:pointer; white-space:nowrap; background:rgba(15,21,33,.4); }',
'.ktb .ltbox .l2-tab .c{ opacity:.55; font-weight:400; margin-left:3px; }',
'.ktb .ltbox .l2-tab.on{ border-color:rgba(245,185,66,.5); color:#f5b942; background:rgba(245,185,66,.12); }',
'.ktb .ltbox .l2-gw{ flex:1; min-height:0; overflow-y:auto; scrollbar-width:thin; padding:5px 3px 8px; }',
'.ktb .ltbox .l2-g{ display:grid; gap:13px 8px; }',
'.ktb .ltbox .l2-g.tp{ grid-template-columns:repeat(3,1fr); }',
'.ktb .ltbox .l2-g.sk{ grid-template-columns:repeat(4,1fr); }',
'.ktb .ltbox .l2-g .mc .disc{ width:100%; max-width:74px; height:auto; aspect-ratio:1; }',
'.ktb .ltbox .l2-g .mc .disc>img{ width:86%; height:86%; border-radius:0; }',
'.ktb .ltbox .l2-g .mc .pil{ max-width:none; } .ktb .ltbox .l2-g .mc .pil .nm{ font-size:11px; }',
'.ktb .ltbox .l2-ds{ flex:none; height:120px; margin:2px 15px 0; display:flex; gap:11px; padding:11px 12px; border-radius:14px; background:linear-gradient(180deg,#141d2e,#0f1826); border:1px solid #26344a; overflow:hidden; }',
'.ktb .ltbox .l2-ds.empty{ align-items:center; justify-content:center; text-align:center; color:#64748b; font-size:12px; }',
'.ktb .ltbox .l2-ds .big{ flex:none; width:56px; height:56px; align-self:center; border-radius:14px; display:grid; place-items:center; overflow:hidden; background:radial-gradient(72% 72% at 50% 38%,color-mix(in srgb,var(--a,#4a5568) 24%,transparent),#0b1018 82%); border:1px solid color-mix(in srgb,var(--a,#4a5568) 46%,#2a3245); }',
'.ktb .ltbox .l2-ds.tp .big{ border-radius:50%; } .ktb .ltbox .l2-ds .big img{ width:84%; height:84%; object-fit:contain; }',
'.ktb .ltbox .l2-ds .info{ min-width:0; align-self:center; }',
'.ktb .ltbox .l2-ds .kind{ font-size:10px; letter-spacing:1.5px; text-transform:uppercase; font-weight:700; }',
'.ktb .ltbox .l2-ds .dnm{ font-family:"Lora",serif; font-size:15px; font-weight:700; color:#f0f5fc; margin:1px 0 3px; }',
'.ktb .ltbox .l2-ds .desc{ font-size:11.5px; line-height:1.38; color:#c4cddb; display:-webkit-box; -webkit-line-clamp:5; -webkit-box-orient:vertical; overflow:hidden; }',
'.ktb .ltbox .l2-ft{ flex:none; display:flex; flex-direction:column; align-items:center; gap:9px; padding:10px 14px calc(10px + env(safe-area-inset-bottom)); border-top:1px solid #26344a; background:linear-gradient(0deg,rgba(11,18,32,.99),rgba(15,23,38,.96)); box-shadow:0 -8px 26px -10px rgba(0,0,0,.7); }',
/* Đội hình đã chọn — dải preview RIÊNG, tách hẳn nút Phá Trận (hết lệch phải/lỗi layout) */
'.ktb .ltbox .l2-selrow{ display:flex; align-items:center; justify-content:center; gap:9px; }',
'.ktb .ltbox .l2-sellab{ font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:#64748b; font-weight:700; white-space:nowrap; }',
'.ktb .ltbox .l2-mini{ display:flex; align-items:center; gap:5px; }',
'.ktb .ltbox .l2-mini .s{ position:relative; width:34px; height:34px; border-radius:9px; display:grid; place-items:center; border:1px dashed #2c3a52; background:rgba(9,14,24,.5); overflow:hidden; }',
'.ktb .ltbox .l2-mini .s.tp{ border-radius:50%; }',
'.ktb .ltbox .l2-mini .s.fill{ border-style:solid; border-color:color-mix(in srgb,var(--a) 55%,#2a3245); background:radial-gradient(70% 70% at 50% 34%,color-mix(in srgb,var(--a) 20%,transparent),#0b1018 86%); }',
'.ktb .ltbox .l2-mini .s img{ width:82%; height:82%; object-fit:contain; }',
'.ktb .ltbox .l2-mini .s .n{ font-family:"Lora",serif; font-size:13px; font-weight:700; color:#334157; }',
'.ktb .ltbox .l2-mini .dv{ width:1px; height:24px; background:#26344a; margin:0 3px; }'
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
    '<div class="ktb-turnwrap"><div class="ktb-turn hero"><span class="dot"></span><span class="tt">Lượt: Ngươi</span></div><div class="ktb-extra">✦ Đi thêm!</div></div>'+
    '<button class="ktb-retreat" type="button">Rút Lui</button>'+
  '</div>'+
  '<div class="stage">'+
    '<div class="side enemy"><div class="fighter">'+
      '<div class="fport eport" style="--fc:var(--rose)"><img class="eimg" alt=""><div class="flash"></div></div>'+
      '<div class="fmeta"><div class="fname ename"></div>'+
      '<div class="bar ehp"><i class="ehpbar"></i><div class="bt ehptxt"></div></div>'+
      '<div class="bar khi ekhiwrap"><i class="ekhibar"></i></div>'+
      '<div class="blockpip eblockpip"></div>'+
      '<div class="intent eintent"></div></div>'+
      '<div class="eskillbar"></div>'+
    '</div></div>'+
    '<div class="boardcol"><div class="board"><div class="fx"></div><div class="combolabel"></div></div></div>'+
    '<div class="side hero"><div class="fighter">'+
      '<div class="fport hport" style="--fc:var(--jade)"><img class="himg" alt=""><div class="flash"></div></div>'+
      '<div class="fmeta"><div class="fname hname"></div><div class="tampham"></div>'+
      '<div class="bar hp"><i class="hhpbar"></i><div class="bt hhptxt"></div></div>'+
      '<div class="bar khi"><i class="khibar"></i></div>'+
      '<div class="blockpip hblockpip"></div></div>'+
      '<div class="skillbar"></div>'+
    '</div></div>'+
  '</div>'+
  '<div class="overlay"></div>'+
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
  var dead=false, ended=false, resolved=false, ltKeyHandler=null;
  function fireResolve(win){   /* ghi thắng 1 lần khi trận phân định — trước cả nút Xác Nhận/Trận Kế (bảo toàn thưởng mọi đường thoát) */
    if(resolved) return; resolved=true;
    try{ if(opts.onResolve) opts.onResolve(win, { soul:S?S.soul:0 }); }catch(e){}
  }
  function fireEnd(win){
    if(ended) return; ended=true;
    try{ if(opts.onEnd) opts.onEnd(win, { soul:S?S.soul:0 }); }catch(e){}
  }
  function fireNext(){   /* "Trận Kế" — báo parent đánh trận tiếp (giữ loadout) */
    if(ended) return; ended=true;
    try{ if(opts.onNext) opts.onNext({ soul:S?S.soul:0 }); }catch(e){}
  }

  /* ----- DOM ----- */
  host.innerHTML=KTB_TPL;
  var root=host.firstElementChild;
  function q(s){ return root.querySelector(s); }
  var boardEl=q('.board'), fxEl=q('.fx'), comboEl=q('.combolabel');
  var ePort=q('.eport'), eImg=q('.eimg'), eName=q('.ename'), eHpBar=q('.ehpbar'), eHpTxt=q('.ehptxt'), eIntent=q('.eintent');
  var eKhiBar=q('.ekhibar'), eBlockPip=q('.eblockpip'), turnPill=q('.ktb-turn'), extraBadge=q('.ktb-extra'), eSkillBar=q('.eskillbar');
  var hPort=q('.hport'), hImg=q('.himg'), hName=q('.hname'), tamPhamEl=q('.tampham');
  var hHpBar=q('.hhpbar'), hHpTxt=q('.hhptxt'), khiBar=q('.khibar'), blockPip=q('.hblockpip');   /* class riêng — tránh vớ nhầm .blockpip của địch (đứng trước trong DOM) */
  var skillBarEl=q('.skillbar'), overlayEl=q('.overlay'), toastEl=q('.toast');
  var soulEl=q('.soulv'), retreatBtn=q('.ktb-retreat');

  function el(t,c,h){ var e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e; }
  var toastTimer=null;
  function toast(m){ toastEl.textContent=m; toastEl.classList.add('show'); if(toastTimer) clearTimeout(toastTimer); toastTimer=setTimeout(function(){ toastEl.classList.remove('show'); },1600); }
  function sleep(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }

  /* ----- trạng thái trận ----- */
  var board=[], tileEls={}, uid=1;
  var S=null, sel=null, busy=false, vis=true;   /* vis=false: harness AI-vs-AI chạy không animate/DOM */
  var EN_DMGMUL=(EN.dmgMul!=null)?EN.dmgMul:1;   /* sát thương phẳng ô Kiếm địch = count×7×mul×EN_DMGMUL (đã gộp Trùng ở component) */
  var EN_TIER=EN.tier||1;

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
  /* Định vị tile bằng transform:translate (GPU compositing) thay left/top → hết layout+paint mỗi frame khi cascade (mobile mượt hơn hẳn). % của translate tính theo CỠ TILE = 1 ô, nên c*100%,r*100% đặt đúng ô (r,c). */
  function tileXform(r,c){ return 'translate('+(c*100)+'%,'+(r*100)+'%)'; }
  function renderBoard(initial){
    if(!vis) return;
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
        if(!initial){ e.style.transform=tileXform(r-N,c); void e.offsetWidth; }
      }
      e.style.transform=tileXform(r,c); e.dataset.r=r; e.dataset.c=c;
      e.classList.toggle('sel', !!(sel&&sel.id===t.id));
      var burning=!!(t.poison&&t.pkind==='chay');
      e.classList.toggle('psn', !!t.poison&&!burning);
      e.classList.toggle('burn', burning);
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

  /* ====== ĐỐI TRẬN: trần dmg/lượt qua dealDmg. side='hero'|'enemy'=nạn nhân. ====== */
  function dealDmg(side, raw, opts){
    opts=opts||{};
    raw=Math.round(raw); if(raw<=0) return 0;
    var pen=opts.penetrate||0;   /* xuyên giáp: chỉ (1-pen) block người có tác dụng */
    if(side==='hero'){ if(S.block>0){ var usable=Math.floor(S.block*(1-pen)); var ab=Math.min(usable,raw); S.block-=ab; raw-=ab; if(ab>0) fnum('h','⛨'+ab,'#cbd5e1'); } }
    else { if(S.enemy.block>0){ var ab2=Math.min(S.enemy.block,raw); S.enemy.block-=ab2; raw-=ab2; } }
    if(raw<=0) return 0;
    var maxHp=side==='hero'?HERO.maxHp:S.enemy.max, cap;
    if(side==='hero') cap=Math.round(maxHp*(opts.capFrac||CAP_FRAC));   /* địch→người: 0.30 (sig boss 0.38-0.40) chống one-shot */
    else if(S.enemy.boss){ var bc=(typeof window!=='undefined'&&window.__ktBossCap)||BOSS_CAP_ABS; cap=Math.min(Math.round(S.enemy.max*0.40), Math.max(bc, Math.round(S.enemy.max/11))); }   /* người→BOSS: trần thấp → trận DÀI (boss đủ lượt); nhưng scale theo HP để Trùng cao không lê thê */
    else cap=Math.round(S.enemy.max*0.55);   /* người→MOB: nới → HP thấp chết nhanh 2-3 nước */
    var already=side==='hero'?(S._dmgToHero||0):(S._dmgToEnemy||0);
    var allow=Math.max(0,cap-already);
    var dealt=Math.min(raw,allow);
    if(dealt<raw) S._capCut=true;
    if(side==='hero'){ S.hp=Math.max(0,S.hp-dealt); S._dmgToHero=already+dealt; if(S.hp<=0) checkRevive(); }
    else {
      S.enemy.hp=Math.max(0,S.enemy.hp-dealt); S._dmgToEnemy=already+dealt;
      /* Cương Thạch Giáp: phản % đòn người gây trong lượt người (không đệ quy, trần riêng người) */
      if(!opts._noReflect && (S.enemy.reflect||0)>0 && S.turn==='hero' && dealt>0){
        var hcap=Math.round(HERO.maxHp*CAP_FRAC), hroom=Math.max(0,hcap-(S._dmgToHero||0));
        var refl=Math.min(Math.round(dealt*S.enemy.reflect), hroom);
        if(refl>0){ S.hp=Math.max(0,S.hp-refl); S._dmgToHero=(S._dmgToHero||0)+refl; S._reflectedThisTurn=(S._reflectedThisTurn||0)+refl; if(S.hp<=0) checkRevive(); }
      }
    }
    if(typeof window!=='undefined' && window.__ktTrackDmg && (S._dmgToHero||0)>(window.__ktMaxDmg||0)) window.__ktMaxDmg=S._dmgToHero;
    return dealt;
  }
  /* Nhánh ĐỊCH: 5 hiệu ứng PHẲNG (không effVal/mods/crit/mốc/Tâm Pháp). */
  function applyCountsEnemy(counts, mul){
    if(counts.kiem){ var raw=counts.kiem*KIEM_DMG*mul*EN_DMGMUL; var d=dealDmg('hero', raw); if(d>0){ fnum('h','-'+d,'#fda4af'); flash(hPort); shake(); } }
    if(counts.tim){ var h=Math.round(counts.tim*TIM_HEAL*0.7); var b0=S.enemy.hp; S.enemy.hp=Math.min(S.enemy.max,S.enemy.hp+h); if(S.enemy.hp>b0) fnum('e','+'+(S.enemy.hp-b0),'#86efac'); }
    if(counts.khien){ var blk=Math.round(counts.khien*KHIEN_BLK); S.enemy.block+=blk; fnum('e','⛨'+blk,'#cbd5e1'); }
    if(counts.khi){ S.enemy.khi=Math.min(100,(S.enemy.khi||0)+Math.round(counts.khi*KHI_GAIN)); }
    if(counts.bao){ S.enemy.soul=(S.enemy.soul||0)+counts.bao*BAO_SOUL; }
  }

  /* Ngũ Hành mods: Kiếm ×dmg (+crit) · Tâm ×heal · Thuẫn ×block · Khí ×khi · Bảo -> Trận Hồn */
  function applyCounts(counts, mul, actor){
    if(actor==='enemy'){ applyCountsEnemy(counts, mul); return; }
    if(counts.kiem){
      var kraw=effVal(counts.kiem)*KIEM_DMG*mul;
      if(lvAt('kim',4)&&counts.kiem>=4) kraw*=1.5;                                             /* Kim C4: xếp ≥4 Kiếm -> đòn +50% */
      var hit=kiemStrike(kraw); var kd=dealDmg('enemy', hit.d); if(kd>0){ fnumHit({d:kd,crit:hit.crit},'','#fecaca'); flash(ePort); }
      if(lvAt('hoa',4)&&counts.kiem>=4&&S.enemy.hp>0){ S.eBurn=Math.max(S.eBurn||0,3); fnum('e','燃','#fb923c'); } /* Hỏa C4: thiêu 3 lượt */
      if(lvAt('kim',10)&&S.enemy.hp>0&&S.enemy.hp<=S.enemy.max*0.15){ S.enemy.hp=0; combo(0,'Nhất Kiếm Quang'); } /* Kim C10: kết liễu <15% */
    }
    if(counts.tim){
      var h=Math.round(effVal(counts.tim)*TIM_HEAL*(mods.heal||1));
      if(S.totalTurns<=(S.healCutUntil||0)) h=Math.round(h*0.5);   /* Phệ Tâm (Cổ Độc/Liệt Diễm): hồi máu −50% */
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
    if(id==='nguHanh'){ runNguHanh(randType()); return; }   /* ngẫu nhiên 1 hệ, bỏ bước chọn */
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
    var hit=kiemStrike(55); var kd=dealDmg('enemy',hit.d);
    fnumHit({d:kd,crit:hit.crit},' 劍','#fde68a'); flash(ePort); shake(); skillCue('Kiếm Khí Trảm', accOf('kiemKhi')); renderAll(); await sleep(160);
    if(dead) return;
    var r=(Math.random()*N)|0; var cs={}; for(var c=0;c<N;c++) cs[r+','+c]=true;
    await resolveCascades(cs);
  }
  async function skHuyetSat(){
    var cells=[]; for(var r=0;r<N;r++)for(var c=0;c<N;c++){ if(board[r][c]&&board[r][c].type==='kiem'&&!board[r][c].sp) cells.push([r,c]); }
    var n=cells.length; if(n===0){ toast('Không có ô Kiếm nào'); busy=false; boardEl.classList.remove('busy'); return false; }
    var hit=kiemStrike(n*4), h=n*2;
    var kd=dealDmg('enemy',hit.d); S.hp=Math.min(HERO.maxHp,S.hp+h);
    fnumHit({d:kd,crit:hit.crit},' 劍','#fecaca'); fnum('h','+'+h,'#4ade80'); flash(ePort); shake(); skillCue('Huyết Sát', accOf('huyetSat'));
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
    var d=S.goldStock; S.goldStock=0; var kd=dealDmg('enemy',d);
    fnum('e','-'+kd+' 金','#fde68a'); flash(ePort); shake(); skillCue('Hoàng Kim Nhất Kích', accOf('hoangKim')); renderAll();
    return true;
  }
  async function skOLong(){
    var pcells=[]; for(var r=0;r<N;r++)for(var c=0;c<N;c++){ if(board[r][c]&&board[r][c].poison&&board[r][c].pown!=='hero') pcells.push([r,c]); }
    if(pcells.length){
      var refl=pcells.length*(S.enemy.poisonDmg||6);
      pcells.forEach(function(p){ board[p[0]][p[1]]={ id:uid++, type:'kiem' }; });
      var kd=dealDmg('enemy',refl);
      fnum('e','-'+kd+' 毒','#bef264'); flash(ePort); shake(); skillCue('Ô Long Giao Tranh', accOf('oLong'));
      renderBoard(); renderAll(); await sleep(220);
      if(dead) return;
      await resolveCascades(null,null);
    } else {
      var free=[]; for(var r2=0;r2<N;r2++)for(var c2=0;c2<N;c2++){ if(board[r2][c2]&&!board[r2][c2].poison) free.push([r2,c2]); }
      shuffleArr(free);
      for(var i=0;i<3&&i<free.length;i++){ var p=free[i]; board[p[0]][p[1]].poison=true; board[p[0]][p[1]].pcd=2; board[p[0]][p[1]].pown='hero'; }
      skillCue('Gieo Độc Phản Chủ', accOf('oLong')); renderBoard(); renderAll(); await sleep(180);
    }
  }
  function skNgungSuong(){ S.enemyFrozen=true; skillCue('Ngưng Sương Quyết', accOf('ngungSuong')); toast('Địch bị đóng băng một lượt'); renderAll(); }
  async function skNguLoi(){
    var sp=[]; for(var r=0;r<N;r++)for(var c=0;c<N;c++){ if(board[r][c]&&board[r][c].sp) sp.push([r,c]); }
    if(sp.length===0){ toast('Không có ô đặc thù nào'); busy=false; boardEl.classList.remove('busy'); return false; }
    var d=sp.length*8; var kd=dealDmg('enemy',d);
    fnum('e','-'+kd+' 雷','#fde68a'); flash(ePort); shake(); skillCue('Ngũ Lôi Chính Pháp', accOf('nguLoi')); renderAll(); await sleep(200);
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

  /* --- Ngũ Hành Đại Chuyển: biến 3×3 giữa thành 1 hệ NGẪU NHIÊN (bước chọn hệ đã bỏ — xem activateSkill) --- */
  function convertRegion(type){ for(var r=2;r<=4;r++)for(var c=2;c<=4;c++){ board[r][c]={ id:uid++, type:type }; } }
  async function runNguHanh(type){
    if(busy||S.over) return;
    busy=true; boardEl.classList.add('busy'); S._kimCangTurn=false;
    convertRegion(type); renderBoard(); skillCue('Ngũ Hành Đại Chuyển', accOf('nguHanh')); await sleep(220);
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
      var acc=sk.accent||'#22d3ee';
      var slot=el('button','skmed'+(ready?' ready':''));
      slot.style.setProperty('--a', acc);
      var st, badge='';
      if(sk.kind==='khi'){ var pct=Math.min(100,S.khi/sk.cost*100); st='<div class="st">'+Math.floor(S.khi)+' / '+sk.cost+' Khí</div><div class="mini"><i style="width:'+pct+'%"></i></div>'; }
      else if(sk.kind==='charge'){ var ch=S.sk[id]?S.sk[id].charges:sk.charges; var dots=''; for(var i=0;i<sk.charges;i++) dots+='<i class="'+(i<ch?'on':'')+'"></i>'; st='<div class="st">Còn '+ch+' lượt</div><div class="dots">'+dots+'</div>'; }
      /* stock: .st là kênh DUY NHẤT hiện số Kho Bảo (khác khi=.mini, charge=.dots) — mobile ẩn .st nên phải có badge trên đĩa, không thì mất sạch số mà cơ chế lại "càng gom càng nặng" */
      else { st='<div class="st">Kho Bảo: '+S.goldStock+'</div>'; badge=''+S.goldStock; }
      var art='<img src="images/kytran/sk_'+id+'.webp" alt="" onerror="this.style.display=\'none\';var s=this.nextElementSibling;if(s)s.style.display=\'block\'"><span style="display:none">'+skillIconSVG(sk.icon)+'</span>';
      var tile = sk.tile?'<img class="sktile" src="'+TIMG[sk.tile]+'">':'';
      var cd = badge?'<span class="ecd">'+badge+'</span>':'';
      slot.innerHTML='<div class="skdisc">'+art+tile+cd+'</div><div class="skm"><div class="nm">'+sk.name+'</div>'+st+'</div>';
      slot.disabled=!ready; slot.onclick=function(){ activateSkill(id); };
      skillBarEl.appendChild(slot);
    });
  }

  /* ----- màn Lập Trận (mở đầu trận, chọn từ pools đã mở) ----- */
  function skCostLabel(s){ return s.kind==='khi'?s.cost+' Khí':(s.kind==='charge'?s.charges+'/trận':'Kho Bảo'); }
  function lapTran(){
    busy=true;
    var SKGRP={ kiemKhi:'Sát Phạt', huyetSat:'Sát Phạt', hoangKim:'Sát Phạt', nguLoi:'Sát Phạt', hoanTinh:'Biến Ảo', nguHanh:'Biến Ảo', ngungSuong:'Khống Chế', oLong:'Khống Chế' };
    var SKCATS=['Tất Cả','Sát Phạt','Biến Ảo','Khống Chế'];
    var useTabs=skChoices.length>10;   /* tab phan nhom tu an khi it ky nang, bat khi nhieu */
    var step=1, tpSel=LT.tamPhap, skSel=LT.skills.slice(), skCat='Tất Cả';
    var o=overlayEl; o.classList.add('show'); o.innerHTML='';
    var box=el('div','ltbox'); o.appendChild(box);
    var mechTxt = EN.poisonEvery?('Rải Ô Độc mỗi '+EN.poisonEvery+' lượt'):(EN.heavyEvery?('Đòn Nặng mỗi '+EN.heavyEvery+' lượt'):'Đánh thường');
    var CHK='<span class="chk"><svg viewBox="0 0 24 24" fill="none" stroke="#4a2e05" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 6.5"/></svg></span>';
    var BOLT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px;vertical-align:-1px"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>';
    var XSVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    function acc(x){ return (x&&x.accent)||'#94a3b8'; }
    function med(kind,x,on,lock){ return '<div class="mc'+(on?' on':'')+(lock?' lock':'')+'" style="--a:'+acc(x)+'" data-k="'+kind+'" data-id="'+x.id+'"><div class="disc"><img src="images/kytran/'+kind+'_'+x.id+'.webp" alt="" onerror="this.style.display=\'none\'">'+(on?CHK:'')+'</div><div class="pil"><span class="nm fserif">'+x.name+'</span></div></div>'; }
    box.innerHTML=
      '<span class="lt-close" title="Đóng (Esc)">'+XSVG+'</span>'+
      '<div class="lt-hdr"><div class="lt-mk"><img src="images/nav/kyTran.webp" alt="" onerror="this.remove()"></div><h1>Lập Trận</h1><div class="lt-thread"></div></div>'+
      '<div class="l2-steps"><div class="l2-stp" data-go="1"><span class="no">1</span><span class="v">Tâm Pháp</span></div><div class="l2-stp" data-go="2"><span class="no">2</span><span class="v">Kỹ Năng</span></div></div>'+
      '<div class="l2-en"><span class="por"><img src="'+EN.art+'" alt="" onerror="this.style.visibility=\'hidden\'"></span><span class="info"><span class="lbl">Địch Thủ</span><div class="nm">'+EN.name+'</div><span class="mech">'+BOLT+' '+mechTxt+'</span></span></div>'+
      '<div class="l2-main">'+
        '<div class="l2-step s1 on"><div class="l2-sech"><span class="t">Tâm Pháp</span><span class="hint">chọn 1 (hoặc bỏ trống)</span><span class="pick l2-tppick">0 / 1</span></div><div class="l2-gw"><div class="l2-g tp l2-tplist"></div></div></div>'+
        '<div class="l2-step s2"><div class="l2-sech"><span class="t">Kỹ Năng</span><span class="hint">tối đa '+NEED+'</span><span class="pick l2-skpick">0 / '+NEED+'</span></div>'+(useTabs?'<div class="l2-tabs l2-sktabs"></div>':'')+'<div class="l2-gw"><div class="l2-g sk l2-sklist"></div></div></div>'+
      '</div>'+
      '<div class="l2-ds empty">Bấm một Tâm Pháp để đọc công năng.</div>'+
      '<div class="l2-ft"></div>';
    var tpListEl=box.querySelector('.l2-tplist'), skListEl=box.querySelector('.l2-sklist'), tabsEl=box.querySelector('.l2-sktabs');
    var tpPickEl=box.querySelector('.l2-tppick'), skPickEl=box.querySelector('.l2-skpick');
    var detEl=box.querySelector('.l2-ds'), footEl=box.querySelector('.l2-ft');
    function slotMini(){ var tpx=tpSel?tpById(tpSel):null; var m='<div class="s tp'+(tpx?' fill':'')+'"'+(tpx?(' style="--a:'+acc(tpx)+'"'):'')+'>'+(tpx?'<img src="images/kytran/tp_'+tpx.id+'.webp" onerror="this.style.display=\'none\'">':'<span class="n">心</span>')+'</div><div class="dv"></div>';
      for(var i=0;i<NEED;i++){ var id=skSel[i], x=id?skillById(id):null; m+='<div class="s'+(x?' fill':'')+'"'+(x?(' style="--a:'+acc(x)+'"'):'')+'>'+(x?'<img src="images/kytran/sk_'+x.id+'.webp" onerror="this.style.display=\'none\'">':'<span class="n">'+(i+1)+'</span>')+'</div>'; } return m; }
    function renderFoot(){ if(step===1){ footEl.innerHTML='<span class="lt-go" data-act="next">Chọn Kỹ Năng ›</span>'; } else { footEl.innerHTML='<div class="l2-selrow"><span class="l2-sellab">Đội Hình</span><div class="l2-mini">'+slotMini()+'</div></div><span class="lt-go" data-act="go">Phá Trận</span>'; } }
    function renderTP(){ tpListEl.innerHTML=tpChoices.map(function(t){ return med('tp',t,tpSel===t.id,false); }).join(''); tpPickEl.textContent=(tpSel?1:0)+' / 1'; tpPickEl.classList.toggle('ok',!!tpSel); }
    function renderSK(){ var full=skSel.length>=NEED;
      if(tabsEl){ tabsEl.innerHTML=SKCATS.map(function(c){ var n=c==='Tất Cả'?skChoices.length:skChoices.filter(function(s){return SKGRP[s.id]===c;}).length; return '<span class="l2-tab'+(skCat===c?' on':'')+'" data-c="'+c+'">'+c+'<span class="c">'+n+'</span></span>'; }).join(''); }
      var show=useTabs?skChoices.filter(function(s){ return skCat==='Tất Cả'||SKGRP[s.id]===skCat; }):skChoices;
      skListEl.innerHTML=show.map(function(s){ var on=skSel.indexOf(s.id)>=0; return med('sk',s,on,!on&&full); }).join('');
      skPickEl.textContent=skSel.length+' / '+NEED; skPickEl.classList.toggle('ok',full); }
    function renderSteps(){ box.querySelectorAll('.l2-stp').forEach(function(s){ var n=+s.getAttribute('data-go'); s.classList.toggle('on',n===step); s.classList.toggle('done',n===1&&step>1); });
      box.querySelector('.l2-step.s1').classList.toggle('on',step===1); box.querySelector('.l2-step.s2').classList.toggle('on',step===2); }
    function showDet(kind,id){ var x=kind==='tp'?tpById(id):skillById(id); if(!x){ resetDet(); return; }
      var tp=kind==='tp'; detEl.className='l2-ds'+(tp?' tp':''); detEl.style.setProperty('--a',acc(x));
      var kindTxt=tp?('Tâm Pháp · '+(x.role||'')):('Kỹ Năng · '+skCostLabel(x)); var body=tp?x.rule:x.desc;
      detEl.innerHTML='<div class="big"><img src="images/kytran/'+(tp?'tp':'sk')+'_'+x.id+'.webp" onerror="this.style.display=\'none\'"></div><div class="info"><div class="kind" style="color:'+acc(x)+'">'+kindTxt+'</div><div class="dnm">'+x.name+'</div><div class="desc">'+body+'</div></div>'; }
    function resetDet(){ detEl.className='l2-ds empty'; detEl.style.removeProperty('--a'); detEl.textContent=(step===1?'Bấm một Tâm Pháp để đọc công năng.':'Bấm một kỹ năng để đọc công năng.'); }
    function ltAll(){ renderTP(); renderSK(); renderSteps(); renderFoot(); }
    function goStep(n){ step=n; ltAll(); resetDet(); var gw=box.querySelector('.l2-step.on .l2-gw'); if(gw) gw.scrollTop=0; }
    box.addEventListener('click', function(e){
      if(e.target.closest('.lt-close')){ cancelLoadout(); return; }
      var stp=e.target.closest('.l2-stp'); if(stp){ goStep(+stp.getAttribute('data-go')); return; }
      var tab=e.target.closest('.l2-tab'); if(tab){ skCat=tab.getAttribute('data-c'); renderSK(); return; }
      var mc=e.target.closest('.mc'); if(mc){ var k=mc.getAttribute('data-k'), id=mc.getAttribute('data-id'); showDet(k,id);
        if(k==='tp'){ tpSel=(tpSel===id)?null:id; } else { var i=skSel.indexOf(id); if(i>=0) skSel.splice(i,1); else if(skSel.length<NEED) skSel.push(id); }
        ltAll(); return; }
      var go=e.target.closest('.lt-go'); if(go){ if(go.getAttribute('data-act')==='next'){ goStep(2); } else {
        LT.tamPhap=tpSel; LT.skills=skSel.slice();
        try{ if(opts.onLoadout) opts.onLoadout({ tamPhap:LT.tamPhap, skills:LT.skills.slice() }); }catch(e2){}
        commitLoadout(); } return; }
    });
    ltKeyHandler=function(e){ if(e.key==='Escape'||e.keyCode===27){ e.preventDefault(); cancelLoadout(); } };
    document.addEventListener('keydown', ltKeyHandler);
    ltAll(); resetDet();
  }
  function clearLtKey(){ if(ltKeyHandler){ document.removeEventListener('keydown', ltKeyHandler); ltKeyHandler=null; } }
  function commitLoadout(){ clearLtKey(); try{ if(opts.onBattleStart) opts.onBattleStart(); }catch(e){} overlayEl.classList.remove('show'); overlayEl.innerHTML=''; initSkillState(); renderAll(); busy=false; boardEl.classList.remove('busy'); }
  function cancelLoadout(){ clearLtKey(); try{ if(opts.onCancel) opts.onCancel(); }catch(e){} }

  /* ----- khởi trận (1 trận duy nhất) ----- */
  function startBattle(){
    S={ hp:HERO.maxHp, khi:0, block:0, soul:0, enemy:null, eTurn:0, over:false, extraStreak:0, _transit:false,
        tmode:null, sk:{}, goldStock:0, docTinh:0, enemyFrozen:false, extraCap:2, _kimCangTurn:false,
        eBurn:0, _mocRevive:false, _thoShield:false, _thuyUsed:false,
        turn:'hero', totalTurns:0, _dmgToHero:0, _dmgToEnemy:0, _capCut:false };
    hImg.src=HERO.art; hImg.onerror=function(){ this.style.visibility='hidden'; };
    hName.innerHTML=HERO.name+(HERO.sub?' <span class="sub">'+HERO.sub+'</span>':'');
    loadEnemy(); makeBoard(); renderAll();
    requestAnimationFrame(sizeBoard); setTimeout(sizeBoard,80);
    if(opts.skipLoadout){ commitLoadout(); } else { lapTran(); }
  }
  function loadEnemy(){
    S.enemy={ name:EN.name, sub:EN.sub||'', art:EN.art, hp:EN.hp, max:EN.hp, atk:EN.atk, heavyEvery:EN.heavyEvery||0, heavyMul:EN.heavyMul||1.8, poisonEvery:EN.poisonEvery||0, poisonK:EN.poisonK||5, poisonDmg:EN.poisonDmg||11, boss:!!EN.boss,
      block:0, khi:0, soul:0,
      atkRef:EN.atkRef||18, sig:EN.sig||null, sigEvery:EN.sigEvery||0, sigCounter:0, khiSkills:(EN.khiSkills||[]).slice(), bite:EN.bite||0, escalate:0, reflect:0, telegraph:null };
    S.eTurn=0; S.block=0; S.khi=0; S.extraStreak=0; S.turn='hero'; S.totalTurns=0; S._dmgToHero=0; S._dmgToEnemy=0;
    S.healCutUntil=0; S.debuffNextMatch=false; S._frozeLast=false; S.heroFrozen=false; S._reflectedThisTurn=0; initSkillState();
    eImg.src=EN.art; eImg.onerror=function(){ this.style.visibility='hidden'; };
    eName.innerHTML=EN.name+(EN.sub?' <span class="sub">'+EN.sub+'</span>':'');
    ePort.classList.remove('dead');
  }

  /* ----- vòng chơi ----- */
  async function attemptSwap(aPos,bPos){
    if(busy||S.over||S.turn!=='hero') return; busy=true; boardEl.classList.add('busy'); sel=null; S._kimCangTurn=false; /* re-arm Kim Cang mỗi lượt match */
    var A=board[aPos.r][aPos.c], B=board[bPos.r][bPos.c];
    var baseMul=((S.extraStreak||0)>=2)?0.6:1;   /* chuỗi extra 2+ ×0.6 (anti-swing) */
    if(S.debuffNextMatch){ baseMul*=0.6; S.debuffNextMatch=false; }   /* Hàn Ngưng: nước xếp kế −40% */
    var extra;
    if(A.sp && B.sp){ /* HỢP BÍCH: kích cả hai ô đặc biệt */
      board[aPos.r][aPos.c]=B; board[bPos.r][bPos.c]=A; renderBoard(); await sleep(170);
      if(dead) return;
      var cs={}; cs[aPos.r+','+aPos.c]=true; cs[bPos.r+','+bPos.c]=true;
      combo(0,'HỢP BÍCH!'); shake();
      extra=await resolveCascades(cs, null, null, 'hero', baseMul);
    } else if(A.sp || B.sp){ /* kích ô đặc biệt bằng ô thường (color: xóa theo màu ô thường) */
      var spTile=A.sp?A:B, other=A.sp?B:A;
      board[aPos.r][aPos.c]=B; board[bPos.r][bPos.c]=A; renderBoard(); await sleep(170);
      if(dead) return;
      var np=findTilePos(spTile.id); var cs2={}; cs2[np.r+','+np.c]=true;
      combo(0, SP_NAME[spTile.sp]||'Kích Phù');
      extra=await resolveCascades(cs2, other.type, null, 'hero', baseMul);
    } else { /* đổi thường -> cần tạo match */
      board[aPos.r][aPos.c]=B; board[bPos.r][bPos.c]=A; renderBoard(); await sleep(180);
      if(dead) return;
      if(!hasMatch()){ board[aPos.r][aPos.c]=A; board[bPos.r][bPos.c]=B; renderBoard(); await sleep(180); if(dead) return; busy=false; boardEl.classList.remove('busy'); return; }
      extra=await resolveCascades(null, null, [{r:aPos.r,c:aPos.c},{r:bPos.r,c:bPos.c}], 'hero', baseMul);
    }
    if(dead||S.over) return;
    renderAll();
    if(S.enemy.hp<=0){ await sleep(300); if(dead) return; winFight(); return; }
    if(extra && (S.extraStreak||0) < S.extraCap){ S.extraStreak=(S.extraStreak||0)+1; showExtra(true); } /* thêm lượt nhưng CAP theo Tâm Pháp (2, Thái Cực 3) */
    else if(extra && lvAt('thuy',10) && !S._thuyUsed){ S._thuyUsed=true; S.extraStreak=0; showExtra(true); combo(0,'Thủy Nghịch Càn Khôn'); } /* Thủy C10: 1 lần/trận nối lượt vượt cap */
    else {
      S.extraStreak=0; showExtra(false);
      await aiTurn(); if(dead||S.over) return;
      if(S.hp<=0){ loseFight(); return; }
      await startTurn('hero'); if(dead||S.over) return;   /* lượt người mới: reset trần dmg + Mộc C7/Thổ C7 */
      if(S.enemy.hp<=0){ winFight(); return; }
      if(S.hp<=0){ loseFight(); return; }
      /* Hàn Ngưng: người bị đóng băng → bỏ lượt người, địch đánh tiếp (frozeLast chặn băng liên tiếp) */
      while(S.heroFrozen && !dead && !S.over){
        S.heroFrozen=false;
        if(vis){ combo(0,'Ngươi Bị Đóng Băng'); renderTurn(); renderAll(); await sleep(650); }
        await aiTurn(); if(dead||S.over) return;
        if(S.hp<=0){ loseFight(); return; }
        await startTurn('hero'); if(dead||S.over) return;
        if(S.enemy.hp<=0){ winFight(); return; }
        if(S.hp<=0){ loseFight(); return; }
      }
      S._frozeLast=false;   /* lượt người bình thường diễn ra → hết chuỗi băng */
      renderAll();
    }
    if(!S._transit){ busy=false; boardEl.classList.remove('busy'); } /* giữ khóa nếu đang chuyển cảnh thắng (winFight) */
  }
  async function resolveCascades(initSet, colorHint, swapCells, actor, baseMul){
    actor=actor||'hero'; baseMul=(baseMul==null)?1:baseMul;
    var step=0, grantExtra=false, pending=initSet;
    while(true){
      var clearSet, newSpecials=[];
      if(pending){ clearSet=pending; pending=null; }
      else { var an=analyzeMatches(swapCells); swapCells=null; if(!an) break; clearSet=an.clearSet; newSpecials=an.specials; }
      var chained=expandSpecials(clearSet, colorHint); colorHint=null;
      newSpecials.forEach(function(s){ delete clearSet[s.r+','+s.c]; }); /* ô sẽ thành special: đừng đếm/xóa/nháy */
      if(newSpecials.length) grantExtra=true; /* tạo ô đặc biệt (xếp 4+) -> thêm lượt */
      if(actor==='hero'&&hasTP('thaiCuc')){ if(newSpecials.length) S.khi=Math.min(HERO.maxKhi,S.khi+15*newSpecials.length); if(chained>0) S.khi=Math.min(HERO.maxKhi,S.khi+8*chained); }
      var tierC=step+(chained>0?1:0);
      if(tierC>=1) combo(tierC);
      Object.keys(clearSet).forEach(function(k){ var p=k.split(','); var t=board[p[0]][p[1]]; if(t&&tileEls[t.id]) tileEls[t.id].classList.add('clear'); });
      await sleep(actor==='enemy'?130:215);
      if(dead) return grantExtra;
      var counts={};
      Object.keys(clearSet).forEach(function(k){ var p=k.split(','); var t=board[p[0]][p[1]]; if(t){ counts[t.type]=(counts[t.type]||0)+1; if(actor==='hero'&&t.poison&&t.pown!=='hero'&&hasTP('hoaDoc')) S.docTinh=Math.min(8,S.docTinh+1); } });
      Object.keys(clearSet).forEach(function(k){ var p=k.split(','); board[p[0]][p[1]]=null; });
      var stepMul=(actor==='enemy')?Math.min(1.6,1+0.2*step):(1+0.25*step);
      applyCounts(counts, baseMul*stepMul, actor);
      if(S._capCut){ combo(0,'⛨ Trận Hộ'); S._capCut=false; }
      if(Object.keys(clearSet).length>=8) shake();
      newSpecials.forEach(function(s){ board[s.r][s.c]={ id:uid++, type:s.type, sp:s.sp }; });
      var dom=null,dmax=0; for(var tk in counts){ if(counts[tk]>dmax){ dmax=counts[tk]; dom=tk; } }
      gravity(); refill((actor==='hero'&&hasTP('canKhon')&&dom)?SINH[dom]:null); renderBoard(); renderAll(); await sleep(actor==='enemy'?150:230);
      if(dead) return grantExtra;
      if(actor==='hero'&&S.enemy.hp<=0) break;
      if(actor==='enemy'&&S.hp<=0) break;
      step++; if(step>40) break;
    }
    return grantExtra;
  }
  function spawnPoison(k, owner, pdmg, kind){
    owner=owner||'enemy';
    var free=[]; for(var r=0;r<N;r++)for(var c=0;c<N;c++){ if(board[r][c]&&!board[r][c].poison&&!board[r][c].sp) free.push([r,c]); }
    shuffleArr(free);
    for(var i=0;i<k&&i<free.length;i++){ var p=free[i]; board[p[0]][p[1]].poison=true; board[p[0]][p[1]].pcd=2; board[p[0]][p[1]].pown=owner; if(pdmg!=null) board[p[0]][p[1]].pdmg=pdmg; if(kind==='chay') board[p[0]][p[1]].pkind='chay'; }
  }
  function tickPoison(){
    var h=0,e=0;
    for(var r=0;r<N;r++)for(var c=0;c<N;c++){ var t=board[r][c]; if(t&&t.poison){ t.pcd--; if(t.pcd<=0){ if(t.pown==='hero') e++; else h++; t.poison=false; delete t.pcd; delete t.pown; delete t.pkind; } } }
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

  /* ====== ĐỐI TRẬN — startTurn + AI địch xếp bàn (thay enemyTurn kịch bản) ====== */
  function hasAnyMove(){
    for(var r=0;r<N;r++)for(var c=0;c<N;c++){ if(board[r][c]&&board[r][c].sp) return true; }
    for(var r2=0;r2<N;r2++)for(var c2=0;c2<N;c2++){ var dirs=[[0,1],[1,0]];
      for(var d=0;d<2;d++){ var r3=r2+dirs[d][0],c3=c2+dirs[d][1]; if(r3>=N||c3>=N)continue;
        var A=board[r2][c2],B=board[r3][c3]; if(!A||!B)continue;
        board[r2][c2]=B; board[r3][c3]=A; var m=hasMatch(); board[r2][c2]=A; board[r3][c3]=B; if(m) return true; } }
    return false;
  }
  function tickPoisonSide(side){   /* độc/cháy do đối phương của `side` gieo → tick, hại `side` (pdmg riêng từng ô) */
    var owner=side==='hero'?'enemy':'hero', hits=0, dmg=0, burn=false;
    for(var r=0;r<N;r++)for(var c=0;c<N;c++){ var t=board[r][c]; if(t&&t.poison&&t.pown===owner){ t.pcd--; if(t.pcd<=0){ hits++; dmg+=(t.pdmg!=null?t.pdmg:(S.enemy.poisonDmg||6)); if(t.pkind==='chay') burn=true; t.poison=false; delete t.pcd; delete t.pown; delete t.pdmg; delete t.pkind; } } }
    return { hits:hits, dmg:dmg, burn:burn };
  }
  async function startTurn(side){
    S.turn=side;
    S.totalTurns=(S.totalTurns||0)+1;
    S._dmgToHero=0; S._dmgToEnemy=0; S._capCut=false; S._reflectedThisTurn=0;
    if(side==='hero') S._kimCangTurn=false;
    if(side==='enemy'){ S.enemy.reflect=0; if(S.enemy.khiSkills&&S.enemy.khiSkills.length) S.enemy.khi=Math.min(100,(S.enemy.khi||0)+ENEMY_KHI_REGEN); }
    /* Tử Chiến: từ lượt tổng ≥24, chip tăng dần cả hai (chống treo) */
    if(S.totalTurns>=SUDDEN_START){
      var chip=2+(S.totalTurns-SUDDEN_START);
      S.hp=Math.max(0,S.hp-chip); S.enemy.hp=Math.max(0,S.enemy.hp-chip);
      if(vis){ combo(0,'Tử Chiến −'+chip); fnum('h','-'+chip,'#f0abfc'); fnum('e','-'+chip,'#f0abfc'); renderAll(); await sleep(300); }
      if(dead) return;
    }
    /* Hỏa: địch đang cháy — trừ máu ở đầu lượt địch (qua dealDmg, trong trần) */
    if(side==='enemy' && (S.eBurn||0)>0){
      var bd=Math.round(6*(mods.dmg||1)); S.eBurn--;
      var db=dealDmg('enemy', bd);
      if(vis && db>0){ fnum('e','-'+db+' 燃','#fb923c'); flash(ePort); renderBoard(); renderAll(); await sleep(180); }
    }
    /* Độc/Cháy: người-gieo (Ô Long) tick hại địch ở lượt địch; địch-gieo (Cổ Độc/Liệt Diễm) tick hại người ở lượt người */
    var pz=tickPoisonSide(side);
    if(pz.hits>0){
      var dp=dealDmg(side, pz.dmg), gly=pz.burn?' 燃':' 毒', gcl=pz.burn?'#fb923c':'#bef264';
      if(vis && dp>0){ if(side==='enemy'){ fnum('e','-'+dp+gly,gcl); flash(ePort); } else { fnum('h','-'+dp+gly,gcl); flash(hPort); shake(); } renderBoard(); renderAll(); await sleep(200); }
    }
    if(side==='hero') newTurnGrants();
  }

  /* AI: mô phỏng nước đi (clone SÂU + accumulator thuần + restore) */
  function cloneBoard(){ var nb=[]; for(var r=0;r<N;r++){ nb[r]=[]; for(var c=0;c<N;c++){ var t=board[r][c]; nb[r][c]=t?{ id:t.id, type:t.type, sp:t.sp||null, poison:t.poison||false, pcd:t.pcd, pown:t.pown, pkind:t.pkind }:null; } } return nb; }
  function resolveAccum(initSet, colorHint, swapCells, res){
    var step=0, pending=initSet;
    while(true){
      var clearSet, newSpecials=[];
      if(pending){ clearSet=pending; pending=null; }
      else { var an=analyzeMatches(swapCells); swapCells=null; if(!an) break; clearSet=an.clearSet; newSpecials=an.specials; }
      var chained=expandSpecials(clearSet, colorHint); colorHint=null;
      newSpecials.forEach(function(s){ delete clearSet[s.r+','+s.c]; });
      if(newSpecials.length) res.specialsMade+=newSpecials.length;
      res.chained+=chained;
      var counts={};
      Object.keys(clearSet).forEach(function(k){ var p=k.split(','); var t=board[p[0]][p[1]]; if(t){ counts[t.type]=(counts[t.type]||0)+1; res.clearSet[k]=true; } });
      res.clearCount+=Object.keys(clearSet).length;
      Object.keys(clearSet).forEach(function(k){ var p=k.split(','); board[p[0]][p[1]]=null; });
      res.kiem+=counts.kiem||0; res.tim+=counts.tim||0; res.khien+=counts.khien||0; res.khi+=counts.khi||0; res.bao+=counts.bao||0;
      newSpecials.forEach(function(s){ board[s.r][s.c]={ id:uid++, type:s.type, sp:s.sp }; });
      gravity(); refill(null);
      step++; if(step>40) break;
    }
    return res;
  }
  function simMove(mv){
    var saved=board, clone=cloneBoard();
    var res={ kiem:0,tim:0,khien:0,khi:0,bao:0, specialsMade:0, chained:0, clearCount:0, clearSet:{}, invalid:false };
    try{
      board=clone;
      var A=board[mv.a.r][mv.a.c], B=board[mv.b.r][mv.b.c];
      if(!A||!B){ res.invalid=true; }
      else if(A.sp&&B.sp){ board[mv.a.r][mv.a.c]=B; board[mv.b.r][mv.b.c]=A; var cs={}; cs[mv.a.r+','+mv.a.c]=true; cs[mv.b.r+','+mv.b.c]=true; resolveAccum(cs, A.type, null, res); }
      else if(A.sp||B.sp){ var spT=A.sp?A:B, oth=A.sp?B:A; board[mv.a.r][mv.a.c]=B; board[mv.b.r][mv.b.c]=A; var np=findTilePos(spT.id); var cs2={}; cs2[np.r+','+np.c]=true; resolveAccum(cs2, oth.type, null, res); }
      else { board[mv.a.r][mv.a.c]=B; board[mv.b.r][mv.b.c]=A; if(!hasMatch()) res.invalid=true; else resolveAccum(null, null, [{r:mv.a.r,c:mv.a.c},{r:mv.b.r,c:mv.b.c}], res); }
    } finally { board=saved; }
    return res;
  }
  function enumMoves(){ var moves=[]; for(var r=0;r<N;r++)for(var c=0;c<N;c++){ var dirs=[[0,1],[1,0]]; for(var d=0;d<2;d++){ var r2=r+dirs[d][0],c2=c+dirs[d][1]; if(r2>=N||c2>=N)continue; if(!board[r][c]||!board[r2][c2])continue; moves.push({ a:{r:r,c:c}, b:{r:r2,c:c2} }); } } return moves; }
  function heroThreatScan(){
    var best={ val:0, cells:{} };
    for(var r=0;r<N;r++)for(var c=0;c<N;c++){ var dirs=[[0,1],[1,0]];
      for(var d=0;d<2;d++){ var r2=r+dirs[d][0],c2=c+dirs[d][1]; if(r2>=N||c2>=N)continue;
        var A=board[r][c],B=board[r2][c2]; if(!A||!B||A.sp||B.sp)continue;
        board[r][c]=B; board[r2][c2]=A; var an=analyzeMatches([{r:r,c:c},{r:r2,c:c2}]); board[r][c]=A; board[r2][c2]=B;
        if(an){ var cells=an.clearSet, kd=0, tot=0; for(var k in cells){ tot++; var p=k.split(','); var t=board[p[0]][p[1]]; if(t&&t.type==='kiem')kd++; }
          var val=tot + kd*1.4 + an.specials.length*6; if(val>best.val){ best.val=val; best.cells=cells; } }
      }}
    return best;
  }
  function intersectClear(a,b){ for(var k in a){ if(b[k]) return true; } return false; }
  function scoreEnemyMove(mv, threat){
    var sim=simMove(mv); if(sim.invalid) return { score:-1, lethal:false };
    var maxE=S.enemy.max;
    var dmgEst=Math.round(sim.kiem*KIEM_DMG*EN_DMGMUL) - S.block;
    var cap=Math.round(HERO.maxHp*CAP_FRAC);
    var clamped=Math.min(Math.max(0,dmgEst), cap);
    var lethal=clamped>=S.hp;
    var score = 1.6*sim.kiem*(S.block<6?1.4:1)
      + (S.enemy.hp<0.45*maxE?5:0.6)*sim.tim
      + (S.enemy.hp<0.5*maxE?1.2:0.6)*sim.khien
      + 0.4*sim.khi
      + 1.0*sim.bao
      + 7*sim.specialsMade
      + 3*sim.chained;
    if(EN_TIER>=3 && threat && threat.val>0 && intersectClear(sim.clearSet, threat.cells)) score += 0.9*threat.val;
    return { score:score, lethal:lethal };
  }
  function smartProb(){ var t=EN_TIER||1; return Math.min(0.97, 0.5+(t-1)*0.09); }
  function findBestMoveEnemy(){
    var moves=enumMoves();
    var threat=(EN_TIER>=3)?heroThreatScan():{ val:0, cells:{} };
    var scored=[];
    for(var i=0;i<moves.length;i++){ var sc=scoreEnemyMove(moves[i], threat); if(sc.lethal){ return moves[i]; } if(sc.score>-1) scored.push({ mv:moves[i], score:sc.score }); }
    if(!scored.length) return null;
    scored.sort(function(a,b){ return b.score-a.score; });
    if(Math.random()<smartProb()) return scored[0].mv;
    var K=Math.min(4,scored.length); return scored[(Math.random()*K)|0].mv;
  }
  async function aiTelegraph(mv){
    if(!vis) return;
    var A=board[mv.a.r][mv.a.c], B=board[mv.b.r][mv.b.c];
    if(A&&tileEls[A.id]) tileEls[A.id].classList.add('aisel');
    if(B&&tileEls[B.id]) tileEls[B.id].classList.add('aisel');
    combo(0,'Suy Tính…');
    await sleep(450);
    if(A&&tileEls[A.id]) tileEls[A.id].classList.remove('aisel');
    if(B&&tileEls[B.id]) tileEls[B.id].classList.remove('aisel');
  }
  async function aiExecMove(mv, baseMul){
    var A=board[mv.a.r][mv.a.c], B=board[mv.b.r][mv.b.c], extra;
    if(A.sp&&B.sp){ board[mv.a.r][mv.a.c]=B; board[mv.b.r][mv.b.c]=A; renderBoard(); await sleep(140);
      var cs={}; cs[mv.a.r+','+mv.a.c]=true; cs[mv.b.r+','+mv.b.c]=true; combo(0,'Địch — HỢP BÍCH!'); shake();
      extra=await resolveCascades(cs, null, null, 'enemy', baseMul); }
    else if(A.sp||B.sp){ var spT=A.sp?A:B, oth=A.sp?B:A; board[mv.a.r][mv.a.c]=B; board[mv.b.r][mv.b.c]=A; renderBoard(); await sleep(140);
      var np=findTilePos(spT.id); var cs2={}; cs2[np.r+','+np.c]=true; combo(0,'Địch — '+(SP_NAME[spT.sp]||'Kích'));
      extra=await resolveCascades(cs2, oth.type, null, 'enemy', baseMul); }
    else { board[mv.a.r][mv.a.c]=B; board[mv.b.r][mv.b.c]=A; renderBoard(); await sleep(150);
      extra=await resolveCascades(null, null, [{r:mv.a.r,c:mv.a.c},{r:mv.b.r,c:mv.b.c}], 'enemy', baseMul); }
    return extra;
  }
  /* ====== PHA 2 — CHIÊU CUNG CHỦ (nạp kép sig/khi + bite + telegraph) ====== */
  function enemyPoisonCount(){ var n=0; for(var r=0;r<N;r++)for(var c=0;c<N;c++){ var t=board[r][c]; if(t&&t.poison&&t.pown==='enemy') n++; } return n; }
  function boardSpecialCount(){ var n=0; for(var r=0;r<N;r++)for(var c=0;c<N;c++){ if(board[r][c]&&board[r][c].sp) n++; } return n; }
  /* enemySkillCore(id,isSig) — hiệu ứng chiêu (sync, dùng chung visual+harness). Sát thương qua dealDmg (trần). */
  function enemySkillCore(id, isSig){
    var e=S.enemy, out={ dmg:0, board:false }, aR=e.atkRef||18;
    if(typeof window!=='undefined' && window.__ktSkillCounts) window.__ktSkillCounts[id]=(window.__ktSkillCounts[id]||0)+1;
    if(id==='cuongTap'){
      var raw=Math.round(aR*(e.heavyMul||1.8)*(isSig?1.15:1)); var pen=isSig?0.8:0.5;
      out.dmg=dealDmg('hero', raw, { penetrate:pen, capFrac:isSig?0.38:0.30 });
    } else if(id==='coDoc'){
      spawnPoison(e.poisonK||5, 'enemy', e.poisonDmg||11); S.healCutUntil=S.totalTurns+4; out.board=true;   /* Phệ Tâm: hồi máu người −50% ~2 lượt */
    } else if(id==='lietDiem'){
      spawnPoison(e.poisonK||5, 'enemy', e.poisonDmg||12, 'chay'); S.healCutUntil=S.totalTurns+4; out.dmg=dealDmg('hero', Math.round(aR*0.4)); out.board=true;   /* Hỏa DoT: 5 ô cháy + thiêu chip + Phệ Tâm */
    } else if(id==='hanNgung'){
      if(S._frozeLast){ S.debuffNextMatch=true; } else { S.heroFrozen=true; S._frozeLast=true; S.debuffNextMatch=true; }
    } else if(id==='cuongThachGiap'){
      e.block += 40; e.reflect=0.45; out.dmg=dealDmg('hero', Math.round(aR*0.7));   /* +giáp + phản + thân đè chip */
    } else if(id==='baDaoThon'){
      var rr=(Math.random()*N)|0, cc=(Math.random()*N)|0, cells={};
      for(var c=0;c<N;c++) cells[rr+','+c]=true; for(var rw=0;rw<N;rw++) cells[rw+','+cc]=true;
      Object.keys(cells).forEach(function(k){ var p=k.split(','); board[p[0]][p[1]]=null; });
      var cnt=Object.keys(cells).length; e.hp=Math.min(e.max, e.hp+cnt*3); gravity(); refill(null); out.board=true;
      out.dmg=dealDmg('hero', Math.round(aR*0.5));   /* cuốn hàng+cột (deny) + hồi + sóng đập chip */
    } else if(id==='cuuTieuLoi'){
      var sp=[]; for(var r2=0;r2<N;r2++)for(var c2=0;c2<N;c2++){ if(board[r2][c2]&&board[r2][c2].sp) sp.push([r2,c2]); }
      out.dmg=dealDmg('hero', 6*sp.length);
      if(sp.length){ var cs={}; sp.forEach(function(p){ cs[p[0]+','+p[1]]=true; }); expandSpecials(cs,null); Object.keys(cs).forEach(function(k){ var p=k.split(','); board[p[0]][p[1]]=null; }); gravity(); refill(null); out.board=true; }
    } else if(id==='thonKhi'){
      S.khi=0; e.khi=Math.min(100,(e.khi||0)+30); e.hp=Math.min(e.max,e.hp+8);   /* rút Khí người + tự hồi */
    } else if(id==='maDeDietThe'){
      var esc=e.escalate||0, capF=Math.min(0.44, 0.29+0.06*esc);   /* leo tới 0.44×150=66 (trùm cuối, không one-shot từ full) */
      out.dmg=dealDmg('hero', Math.round(aR*(1.45+0.3*esc)), { capFrac:capF }); e.escalate=esc+1;
      S.healCutUntil=S.totalTurns+5;   /* diệt thế phong hồi phục dài (chặn sustain full-power) */
    }
    return out;
  }
  async function applyEnemySkill(id, isSig){
    var sk=EN_SKILLS[id]||{ name:id, acc:'#f5b942' };
    skillCue(sk.name, sk.acc, sk.icon); if(vis) await sleep(520); if(dead) return;
    var r=enemySkillCore(id, isSig); S._capCut=false;
    if(vis){ if(r.dmg>0){ fnum('h','-'+r.dmg,'#fda4af'); flash(hPort); shake(); } renderBoard(); renderAll(); await sleep(220); }
  }
  function applyEnemySkillSync(id, isSig){ enemySkillCore(id, isSig); }
  function enemyBite(){ var b=S.enemy.bite||0; if(b<=0) return 0; var d=dealDmg('hero', b); if(vis&&d>0){ fnum('h','-'+d,'#fecaca'); flash(hPort); } return d; }
  function useSkillProb(){ return S.enemy.boss?0.85:0; }
  function pickEnemyKhiSkill(){
    var e=S.enemy, ks=e.khiSkills||[];
    for(var i=0;i<ks.length;i++){ var id=ks[i];
      if(id==='cuuTieuLoi'){ if(boardSpecialCount()>=2) return id; }
      else if(id==='coDoc'||id==='lietDiem'){ if(enemyPoisonCount() < (e.poisonK||5)) return id; }
      else if(id==='hanNgung'){ if(!S._frozeLast) return id; }
      else if(id==='thonKhi'){ if(S.khi>=40) return id; }
      else return id;
    }
    return ks.length?ks[ks.length-1]:null;
  }
  function enemyMaybeTelegraph(){
    var e=S.enemy; if(e.telegraph) return;
    e.sigCounter=(e.sigCounter||0)+1;
    if(e.sig && e.sigEvery>0 && e.sigCounter>=e.sigEvery){ e.telegraph={ id:e.sig, kind:'sig' }; e.sigCounter=0; return; }
    if(e.khiSkills && e.khiSkills.length && (e.khi||0)>=100 && Math.random()<useSkillProb()){
      var sid=pickEnemyKhiSkill(); if(sid) e.telegraph={ id:sid, kind:'khi' };
    }
  }
  async function aiTurn(){
    if(dead||S.over) return;
    await startTurn('enemy'); if(dead) return; renderAll();
    if(S.enemy.hp<=0){ winFight(); return; }
    if(S.hp<=0){ loseFight(); return; }
    if(S.enemyFrozen){ S.enemyFrozen=false; if(vis){ combo(0,'Địch Bị Đóng Băng'); renderAll(); await sleep(320); } return; }
    if(enemyBite()>0){ if(vis){ renderAll(); await sleep(120); } if(S.hp<=0){ loseFight(); return; } }
    /* chiêu telegraph vòng trước → PHÁT NGAY (sig không tốn Khí; khi-skill trừ Khí) — cast = trọn lượt địch */
    if(S.enemy.telegraph){ var tg=S.enemy.telegraph; S.enemy.telegraph=null; if(tg.kind==='khi') S.enemy.khi=0; await applyEnemySkill(tg.id, tg.kind==='sig'); if(dead||S.over) return; renderAll(); if(S.hp<=0){ loseFight(); return; } if(S.enemy.hp<=0){ winFight(); return; } return; }
    var extraCapE=S.enemy.boss?2:1, streak=0;
    while(true){
      if(!hasAnyMove()){ makeBoard(); renderBoard(); }
      var mv=findBestMoveEnemy(); if(!mv) break;
      await aiTelegraph(mv); if(dead) return;
      var extra=await aiExecMove(mv, (streak>=2)?0.6:1); if(dead||S.over) return;
      renderAll();
      if(S.hp<=0){ loseFight(); return; }
      if(S.enemy.hp<=0) return;
      if(extra && streak<extraCapE){ streak++; showExtra(true); combo(0,'Địch Đi Thêm!'); await sleep(300); showExtra(false); continue; }
      break;
    }
    /* cuối lượt: quyết telegraph cho lượt sau (sig theo bộ đếm ưu tiên / khi-skill khi đủ Khí) */
    enemyMaybeTelegraph();
    renderAll();
  }

  /* ----- kết trận (idempotent qua _transit + latch fireEnd) ----- */
  function winFight(){
    if(S.over || S._transit) return;
    fireResolve(true);   /* ghi thắng NGAY khi phân định — bảo toàn thưởng dù rời view/refresh trước khi bấm nút */
    S._transit=true; ePort.classList.add('dead'); busy=true;
    setTimeout(function(){ if(dead||S.over) return; S._transit=false; endGame(true); },700);
  }
  function loseFight(){ if(S.over) return; endGame(false); }
  function endGame(win){
    S.over=true; busy=true; boardEl.classList.add('busy');
    var o=overlayEl; o.classList.add('show'); o.innerHTML='';
    var b=el('div','ores'+(win?'':' lose'));
    var wr = opts.winReward || { bonus:0, unlocks:[] };
    var total = S.soul + (wr.bonus||0);
    var breakdown = (win && wr.bonus>0) ? '<div class="ores-break">Nhặt trong trận '+S.soul+' · Thưởng thắng +'+wr.bonus+'</div>' : '';
    var unlocks = (win && wr.unlocks && wr.unlocks.length) ? '<div class="ores-unlocks">'+wr.unlocks.map(function(u){ return '<span class="ores-unlock">Mở · '+u+'</span>'; }).join('')+'</div>' : '';
    var loot = win
      ? '<div class="ores-loot"><img src="images/kytran/tranhon.webp" alt="" onerror="this.style.display=\'none\'"><b>+'+total+'</b><span>Trận Hồn</span></div>'+breakdown+unlocks
      : '<div class="ores-loot dim"><span>Trận Hồn lượm dở tan theo trận đồ.</span></div>';
    var nextBtn = (win && opts.nextBattle) ? '<button class="ores-btn next onext">Trận Kế ›</button>' : '';
    b.innerHTML=
      '<div class="ores-band">'+
        '<div class="ores-port"><img src="'+S.enemy.art+'" alt="" onerror="this.style.display=\'none\'"><div class="fade"></div></div>'+
        '<div class="ores-main"><div class="kick">'+(win?'Trảm Yêu · Thắng':'Trảm Yêu · Bại')+'</div>'+
          '<div class="ttl">'+(win?'Trảm Yêu Thành Công':'Bại Trận')+'</div>'+
          '<div class="sub">'+(win?(S.enemy.name+' phục pháp, trận đồ thu quang.'):'Phân thân tan rã giữa trận đồ.')+'</div>'+loot+'</div>'+
      '</div>'+
      '<div class="ores-acts"><button class="ores-btn ook">Xác Nhận</button>'+nextBtn+'</div>';
    o.appendChild(b);
    b.querySelector('.ook').addEventListener('click', function(){ this.disabled=true; fireEnd(win); });
    var nx=b.querySelector('.onext');
    if(nx) nx.addEventListener('click', function(){ this.disabled=true; fireNext(); });
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
    b.querySelector('.rgo').addEventListener('click', function(){ if(!S||S.over||S._transit||ended) return; S.over=true; b.querySelector('.rgo').disabled=true; fireEnd(false); });
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

  /* Cột Tuyệt Học Cung Chủ (mirror hero .skmed): sig highlight + đếm "N lượt"; khi-skill "Khí x/100" + thanh mini. Mob: ẩn. */
  function renderEnemySkills(){
    if(!vis||!eSkillBar) return;
    var e=S&&S.enemy, ids=[];
    if(e&&e.sig) ids.push({ id:e.sig, kind:'sig' });
    if(e&&e.khiSkills) e.khiSkills.forEach(function(id){ ids.push({ id:id, kind:'khi' }); });
    if(!ids.length){ eSkillBar.style.display='none'; eSkillBar.innerHTML=''; return; }
    eSkillBar.style.display='';
    var tel=e.telegraph;
    var html='<div class="eskill-hd">Tuyệt Học · <b>'+e.name+'</b></div>';
    ids.forEach(function(o){
      var sk=EN_SKILLS[o.id]||{ name:o.id, acc:'#f5b942', icon:'' };
      var telActive=!!(tel && tel.id===o.id), cls='skmed emed', st, badge='';
      if(o.kind==='sig'){
        var n=Math.max(1,(e.sigEvery||0)-(e.sigCounter||0));
        if(telActive){ cls+=' ready'; st='<div class="st soon">Chuẩn bị thi triển!</div>'; badge='!'; }
        else { if(n<=1) cls+=' warn'; st='<div class="st'+(n<=1?' soon':'')+'">Chuẩn bị thi triển · '+n+' lượt</div>'; badge=''+n; }
      } else {
        if(telActive){ cls+=' ready'; st='<div class="st soon">Chuẩn bị thi triển!</div>'; badge='!'; }
        else { var pct=Math.min(100,(e.khi||0)/100*100); st='<div class="st">Khí '+Math.floor(e.khi||0)+'/100</div><div class="mini"><i style="width:'+pct+'%"></i></div>'; }
      }
      var art='<img src="'+(sk.icon||'')+'" alt="" onerror="this.style.display=\'none\';var s=this.nextElementSibling;if(s)s.style.display=\'block\'"><span class="fb" style="display:none">'+sk.name.charAt(0)+'</span>';
      /* badge đếm lượt/'!' — ẩn desktop (đã có status chữ), CHỈ hiện mobile (nơi status bị ẩn cho gọn) */
      var cd = badge?'<span class="ecd'+(telActive?' hot':'')+'">'+badge+'</span>':'';
      html+='<div class="'+cls+'" style="--a:'+sk.acc+'"><div class="skdisc">'+art+cd+'</div><div class="skm"><div class="nm">'+sk.name+'</div>'+st+'</div></div>';
    });
    eSkillBar.innerHTML=html;
  }
  function renderAll(){
    if(!vis) return;
    if(!S||!S.enemy) return;
    var e=S.enemy;
    eHpBar.style.width=(Math.max(0,e.hp)/e.max*100)+'%'; eHpTxt.textContent=Math.ceil(Math.max(0,e.hp))+' / '+e.max;
    var hasKhiSk=(e.khiSkills&&e.khiSkills.length)>0, hasSkills=(!!e.sig||hasKhiSk);
    if(eKhiBar&&eKhiBar.parentNode) eKhiBar.parentNode.style.display='none';   /* thanh Khí cũ dưới HP ẩn — Khí hiện ở cột huy chương chiêu */
    eIntent.className='intent eintent';   /* bỏ telegraph "sắp phát" dưới avatar — đã có ở cột huy chương chiêu boss; chỉ giữ Sát khí (mob) + Cháy */
    eIntent.textContent=(hasSkills?'':'Sát khí ô Kiếm')+((S.eBurn||0)>0?((hasSkills?'':' · ')+'燃 Cháy '+S.eBurn+' lượt'):'');
    renderEnemySkills();
    if(eBlockPip) eBlockPip.textContent=(e.block>0?('⛨ '+e.block+'  '):'')+((e.reflect||0)>0?'↩ Phản '+Math.round(e.reflect*100)+'%':'');
    hHpBar.style.width=(Math.max(0,S.hp)/HERO.maxHp*100)+'%'; hHpTxt.textContent=Math.ceil(Math.max(0,S.hp))+' / '+HERO.maxHp;
    khiBar.style.width=(S.khi/HERO.maxKhi*100)+'%';
    blockPip.textContent=S.block>0?('⛨ Phòng ngự '+S.block):'';
    tamPhamEl.textContent='Tâm Pháp: '+(LT.tamPhap?tpById(LT.tamPhap).name:'—');
    renderSkillBar();
    soulEl.textContent=S.soul;
    renderTurn();
  }
  function renderTurn(){
    if(!vis||!turnPill) return;
    var t=(S&&S.turn)||'hero';
    turnPill.className='ktb-turn '+(t==='enemy'?'enemy':'hero');
    var tt=turnPill.querySelector('.tt'); if(tt) tt.textContent = t==='enemy'?'Lượt: Địch':'Lượt: Ngươi';
    hPort.classList.toggle('active', t==='hero');
    ePort.classList.toggle('active', t==='enemy');
    if(t!=='hero') showExtra(false);
  }
  function showExtra(on){ if(extraBadge) extraBadge.classList.toggle('on', !!on); }

  /* ----- FX ----- */
  function fnum(who,val,color){
    if(!vis) return;
    var port=(who==='e'?ePort:hPort);
    var p=port.getBoundingClientRect(), hostR=boardEl.getBoundingClientRect();
    var f=el('div','fnum',val); f.style.color=color;
    var x=p.left+p.width/2-hostR.left, y=p.top+p.height/2-hostR.top;
    if(p.left<hostR.left-5||p.left>hostR.right+5){ x=(who==='e'?hostR.width*0.14:hostR.width*0.86); y=hostR.height*0.14; }
    f.style.left=x+'px'; f.style.top=y+'px';
    fxEl.appendChild(f); setTimeout(function(){ f.remove(); },1000);
  }
  function flash(portEl){ if(!vis) return; var f=portEl.querySelector('.flash'); if(!f) return; f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }
  function shake(){ if(!vis) return; boardEl.classList.remove('shake'); void boardEl.offsetWidth; boardEl.classList.add('shake'); }
  function combo(n,txt){ if(!vis) return; var i=Math.min(n|0,TIERS.length-1);
    comboEl.textContent = txt || TIERS[i]; comboEl.style.color = txt ? '#f5b942' : TIERC[i];
    comboEl.style.fontSize = (Math.min(2.2, 1.1 + (n|0)*0.2)) + 'rem';
    comboEl.classList.remove('on'); void comboEl.offsetWidth; comboEl.classList.add('on'); }
  function accOf(id){ var s=skillById(id); return (s&&s.accent)||'#f5b942'; }
  /* Cue phát chiêu "Phá Trận": vệt quét + chớp trắng + tên bật ra + mảnh sáng văng — màu theo accent chiêu (giữ module thuần). */
  function skillCue(txt,acc,icon){
    if(!vis) return;
    acc=acc||'#f5b942';
    var old=boardEl.querySelector('.skcue'); if(old) old.remove();
    var box=el('div','skcue'+(icon?' has-ic':'')); box.style.setProperty('--acc',acc);
    var sh='';
    for(var i=0;i<10;i++){ var a=(i/10)*6.2832; sh+='<i class="skcue-shard" style="--tx:'+Math.round(Math.cos(a)*130)+'px;--ty:'+Math.round(Math.sin(a)*72)+'px;--r:'+Math.round(a*57)+'deg;--d:'+(360+(i%3)*130)+'ms"></i>'; }
    var icHtml = icon ? '<div class="skcue-ic"><img src="'+icon+'" alt="" onerror="this.parentNode.classList.add(\'noimg\')"></div>' : '';
    box.innerHTML='<div class="skcue-streak"></div><div class="skcue-flash"></div>'+icHtml+'<div class="skcue-nm">'+txt+'</div>'+sh;
    boardEl.appendChild(box);
    requestAnimationFrame(function(){ box.querySelectorAll('.skcue-streak,.skcue-flash,.skcue-ic,.skcue-nm,.skcue-shard').forEach(function(e){ e.classList.add('go'); }); });
    setTimeout(function(){ try{ box.remove(); }catch(e){} }, 1250);
  }

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
  /* ====== ĐỐI TRẬN — harness AI-vs-AI (sync, vis=false) ====== */
  function resolveSyncDuel(initSet, colorHint, swapCells, actor, baseMul){
    actor=actor||'hero'; baseMul=(baseMul==null)?1:baseMul;
    var step=0, grantExtra=false, pending=initSet;
    while(true){
      var clearSet, newSpecials=[];
      if(pending){ clearSet=pending; pending=null; }
      else { var an=analyzeMatches(swapCells); swapCells=null; if(!an) break; clearSet=an.clearSet; newSpecials=an.specials; }
      var chained=expandSpecials(clearSet, colorHint); colorHint=null;
      newSpecials.forEach(function(s){ delete clearSet[s.r+','+s.c]; });
      if(newSpecials.length) grantExtra=true;
      if(actor==='hero'&&hasTP('thaiCuc')){ if(newSpecials.length) S.khi=Math.min(HERO.maxKhi,S.khi+15*newSpecials.length); if(chained>0) S.khi=Math.min(HERO.maxKhi,S.khi+8*chained); }
      var counts={};
      Object.keys(clearSet).forEach(function(k){ var p=k.split(','); var t=board[p[0]][p[1]]; if(t){ counts[t.type]=(counts[t.type]||0)+1; if(actor==='hero'&&t.poison&&t.pown!=='hero'&&hasTP('hoaDoc')) S.docTinh=Math.min(8,S.docTinh+1); } });
      Object.keys(clearSet).forEach(function(k){ var p=k.split(','); board[p[0]][p[1]]=null; });
      var stepMul=(actor==='enemy')?Math.min(1.6,1+0.2*step):(1+0.25*step);
      applyCounts(counts, baseMul*stepMul, actor);
      newSpecials.forEach(function(s){ board[s.r][s.c]={ id:uid++, type:s.type, sp:s.sp }; });
      var dom=null,dmax=0; for(var tk in counts){ if(counts[tk]>dmax){ dmax=counts[tk]; dom=tk; } }
      gravity(); refill((actor==='hero'&&hasTP('canKhon')&&dom)?SINH[dom]:null);
      if(actor==='hero'&&S.enemy.hp<=0) break;
      if(actor==='enemy'&&S.hp<=0) break;
      step++; if(step>40) break;
    }
    return grantExtra;
  }
  function execMoveSync(mv, actor, baseMul){
    var A=board[mv.a.r][mv.a.c], B=board[mv.b.r][mv.b.c];
    if(A.sp&&B.sp){ board[mv.a.r][mv.a.c]=B; board[mv.b.r][mv.b.c]=A; var cs={}; cs[mv.a.r+','+mv.a.c]=true; cs[mv.b.r+','+mv.b.c]=true; return resolveSyncDuel(cs, A.type, null, actor, baseMul); }
    if(A.sp||B.sp){ var spT=A.sp?A:B, oth=A.sp?B:A; board[mv.a.r][mv.a.c]=B; board[mv.b.r][mv.b.c]=A; var np=findTilePos(spT.id); var cs2={}; cs2[np.r+','+np.c]=true; return resolveSyncDuel(cs2, oth.type, null, actor, baseMul); }
    board[mv.a.r][mv.a.c]=B; board[mv.b.r][mv.b.c]=A; if(!hasMatch()){ board[mv.a.r][mv.a.c]=A; board[mv.b.r][mv.b.c]=B; return 'nomatch'; }
    return resolveSyncDuel(null, null, [{r:mv.a.r,c:mv.a.c},{r:mv.b.r,c:mv.b.c}], actor, baseMul);
  }
  function startTurnSync(side){
    S.turn=side; S.totalTurns=(S.totalTurns||0)+1; S._dmgToHero=0; S._dmgToEnemy=0; S._capCut=false; S._reflectedThisTurn=0;
    if(side==='hero') S._kimCangTurn=false;
    if(side==='enemy'){ S.enemy.reflect=0; if(S.enemy.khiSkills&&S.enemy.khiSkills.length) S.enemy.khi=Math.min(100,(S.enemy.khi||0)+ENEMY_KHI_REGEN); }
    if(S.totalTurns>=SUDDEN_START){ var chip=2+(S.totalTurns-SUDDEN_START); S.hp=Math.max(0,S.hp-chip); S.enemy.hp=Math.max(0,S.enemy.hp-chip); }
    if(side==='enemy'&&(S.eBurn||0)>0){ S.eBurn--; dealDmg('enemy', Math.round(6*(mods.dmg||1))); }
    var pz=tickPoisonSide(side); if(pz.hits>0) dealDmg(side, pz.dmg);
    if(side==='hero') newTurnGrants();
  }
  function heroAutoPlaySync(){
    if(hasSkill('kiemKhi') && S.khi>=HERO.maxKhi){ S.khi-=HERO.maxKhi; S._kimCangTurn=false; var hit=kiemStrike(55); dealDmg('enemy', hit.d); if(S.enemy.hp<=0) return; }
    var cap=S.extraCap||2, streak=0;
    while(true){
      if(!hasAnyMove()) makeBoard();
      var mv=harnessFindBestHero(); if(!mv) break;
      var ex=execMoveSync(mv,'hero',(streak>=2)?0.6:1);
      if(ex==='nomatch'){ makeBoard(); continue; }
      if(S.enemy.hp<=0) return;
      if(ex&&streak<cap){ streak++; continue; }
      break;
    }
  }
  function enemyAutoPlaySync(){
    if(enemyBite()>0 && S.hp<=0) return;
    if(S.enemy.telegraph){ var tg=S.enemy.telegraph; S.enemy.telegraph=null; if(tg.kind==='khi') S.enemy.khi=0; applyEnemySkillSync(tg.id, tg.kind==='sig'); return; }
    var cap=S.enemy.boss?2:1, streak=0;
    while(true){
      if(!hasAnyMove()) makeBoard();
      var mv=findBestMoveEnemy(); if(!mv) break;
      var ex=execMoveSync(mv,'enemy',(streak>=2)?0.6:1);
      if(ex==='nomatch'){ makeBoard(); continue; }
      if(S.hp<=0) return;
      if(ex&&streak<cap){ streak++; continue; }
      break;
    }
    enemyMaybeTelegraph();
  }
  function harnessFindBestHero(){
    var need=S.hp<HERO.maxHp*0.45?'tim':'kiem'; var best=null,bs=-1;
    for(var r=0;r<N;r++)for(var c=0;c<N;c++){ var dirs=[[0,1],[1,0]];
      for(var d=0;d<2;d++){ var r2=r+dirs[d][0],c2=c+dirs[d][1]; if(r2>=N||c2>=N)continue;
        var A=board[r][c],B=board[r2][c2]; if(!A||!B) continue; var score=-1;
        if(A.sp||B.sp){ var cs={}; if(A.sp&&B.sp){ cs[r+','+c]=true; cs[r2+','+c2]=true; } else { if(A.sp)cs[r+','+c]=true; else cs[r2+','+c2]=true; }
          var hint=A.sp?B.type:A.type; var set={}; for(var kk in cs) set[kk]=true; expandSpecials(set, hint);
          var kd=0; Object.keys(set).forEach(function(k){ var p=k.split(','); var t=board[p[0]][p[1]]; if(t&&t.type==='kiem')kd++; });
          score=9 + kd*1.7 + Object.keys(set).length*0.3;
        } else { board[r][c]=B; board[r2][c2]=A; var gs=findGroups();
          if(gs.length){ var counts={},maxLen=0; gs.forEach(function(g){ counts[g.type]=(counts[g.type]||0)+g.len; if(g.len>maxLen)maxLen=g.len; });
            score=gs.length+(maxLen>=4?7:0)+(maxLen>=5?6:0)+(counts.kiem||0)*1.4;
            if(need==='tim') score+=(counts.tim||0)*5; if(S.khi<HERO.maxKhi) score+=(counts.khi||0)*2.2; }
          board[r][c]=A; board[r2][c2]=B; }
        if(score>bs){ bs=score; best={a:{r:r,c:c},b:{r:r2,c:c2}}; }
      }} return best;
  }
  function freshDuelState(){
    S={ hp:HERO.maxHp, khi:0, block:0, soul:0, enemy:null, eTurn:0, over:false, extraStreak:0, _transit:false,
        tmode:null, sk:{}, goldStock:0, docTinh:0, enemyFrozen:false, extraCap:2, _kimCangTurn:false,
        eBurn:0, _mocRevive:false, _thoShield:false, _thuyUsed:false,
        turn:'hero', totalTurns:0, _dmgToHero:0, _dmgToEnemy:0, _capCut:false };
    loadEnemy(); makeBoard();
  }
  function runDuelSim(maxRounds){
    var prevVis=vis; vis=false;
    freshDuelState();
    var winner=null, r=0, maxDmg=0; maxRounds=maxRounds||150;
    while(r<maxRounds){
      r++;
      startTurnSync('hero');
      if(S.enemy.hp<=0){ winner='hero'; break; } if(S.hp<=0){ winner='enemy'; break; }
      if(S.heroFrozen){ S.heroFrozen=false; } else { S._frozeLast=false; heroAutoPlaySync(); if(S.enemy.hp<=0){ winner='hero'; break; } }
      startTurnSync('enemy');
      if(S.hp<=0){ winner='enemy'; break; } if(S.enemy.hp<=0){ winner='hero'; break; }
      if(S.enemyFrozen){ S.enemyFrozen=false; } else { enemyAutoPlaySync(); if((S._dmgToHero||0)>maxDmg) maxDmg=S._dmgToHero; if(S.hp<=0){ winner='enemy'; break; } }
    }
    vis=prevVis;
    return { winner:winner||'timeout', turns:S.totalTurns, hp:Math.max(0,Math.round(S.hp)), ehp:Math.max(0,Math.round(S.enemy.hp)), maxTurnDmgHero:maxDmg };
  }
  function runBatch(n, bopts){
    bopts=bopts||{};
    n=n||30; var hero=0,enemy=0,to=0,sumT=0,maxT=0,maxDmg=0;
    if(bopts.countSkills && typeof window!=='undefined') window.__ktSkillCounts={};
    for(var i=0;i<n;i++){ var o=runDuelSim(150); if(o.winner==='hero')hero++; else if(o.winner==='enemy')enemy++; else to++; sumT+=o.turns; if(o.turns>maxT)maxT=o.turns; if(o.maxTurnDmgHero>maxDmg)maxDmg=o.maxTurnDmgHero; }
    var res={ n:n, tier:EN_TIER, dmgMul:Math.round(EN_DMGMUL*100)/100, heroWin:hero, enemyWin:enemy, timeout:to, winRate:Math.round(hero/n*100), avgTurns:Math.round(sumT/n), maxTurns:maxT, maxTurnDmgHero:maxDmg };
    if(bopts.countSkills && typeof window!=='undefined') res.skillCounts=JSON.parse(JSON.stringify(window.__ktSkillCounts||{}));
    return res;
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
        S={ hp:HERO.maxHp, khi:0, block:0, soul:0, enemy:null, eTurn:0, over:false, extraStreak:0, _transit:false, tmode:null, sk:{}, goldStock:0, docTinh:0, enemyFrozen:false, extraCap:2, _kimCangTurn:false, eBurn:0, _mocRevive:false, _thoShield:false, _thuyUsed:false, turn:'hero', totalTurns:0, _dmgToHero:0, _dmgToEnemy:0, _capCut:false };
        loadEnemy(); makeBoard(); overlayEl.classList.remove('show'); overlayEl.innerHTML=''; busy=false; boardEl.classList.remove('busy'); renderAll();
        return { tamPhap:LT.tamPhap, skills:LT.skills.slice() };
      },
      loadout:function(){ return { tamPhap:LT.tamPhap, skills:LT.skills.slice(), khi:S.khi, docTinh:S.docTinh, goldStock:S.goldStock, soul:S.soul, charges:S.sk }; },
      /* ĐỐI TRẬN PHA 1 — AI-vs-AI + kiểm mô phỏng */
      runDuelSim:function(mr){ return runDuelSim(mr); },
      runBatch:function(n,o){ return runBatch(n,o); },
      findBestMoveEnemy:function(){ return findBestMoveEnemy(); },
      simMove:function(mv){ return simMove(mv); },
      info:function(){ return { tier:EN_TIER, dmgMul:EN_DMGMUL, enemyMaxHp:S&&S.enemy?S.enemy.max:null, heroMaxHp:HERO.maxHp, sig:S&&S.enemy?S.enemy.sig:null, khiSkills:S&&S.enemy?S.enemy.khiSkills:null, bite:S&&S.enemy?S.enemy.bite:null }; },
      render:function(){ renderAll(); },   /* verify: ép render sau khi set state */
      setTelegraph:function(id,kind){ if(S&&S.enemy){ S.enemy.telegraph={ id:id, kind:kind||'sig' }; renderAll(); } },
      cue:function(id){ var sk=EN_SKILLS[id]; if(sk) skillCue(sk.name, sk.acc, sk.icon); return sk?sk.icon:null; }
    };
    window.KT3=harness;
  }

  /* ----- resize + destroy ----- */
  var onResize=function(){ sizeBoard(); };
  window.addEventListener('resize', onResize);

  function destroy(){
    dead=true;
    clearLtKey();
    window.removeEventListener('resize', onResize);
    if(toastTimer) clearTimeout(toastTimer);
    if(devOn && window.KT3===harness){ try{ delete window.KT3; }catch(e){ window.KT3=undefined; } }
    host.innerHTML='';
  }

  startBattle();

  return { destroy:destroy, resize:sizeBoard };
}
