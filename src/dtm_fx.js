// Engine hieu ung danh the cho Dang Tien Mong (port tu mockup _mockup/fx_src, da verify).
// Cach ly: chi dung DOM (the dang danh + panel con quai); KHONG dung state combat/gear/currencies.
import { DTM_FX_KEYS, DTM_FX_DOM, DTM_FX_PLAY } from './dtm_fx_data.js';

export const DTM_VANISH_MS = 250;   // thoi gian the bien mat khoi tay (user chot moi)
export const DTM_VANISH_LEAD = 360; // bat dau bien mat sau khi danh
const FX_SPEED = 0.75;              // toc do hieu ung (user chot moi): <1 = cham hon
export { DTM_FX_KEYS };
try { document.documentElement.style.setProperty('--dtmv', (DTM_VANISH_MS / 1000) + 's'); } catch (e) {}

// ===== chon hieu ung TAN CONG theo CO CHE the (chi goi khi the GAY SAT THUONG) =====
export function castFxFor(c) {
  if (!c) return 'tram';
  if (c.aoe) return 'taoQuet';
  if ((c.hits || 1) > 1) return 'vu';
  if (c.drain) return 'hapTinh';
  if (c.poison) return 'kichDoc';
  if (c.he === 'hoa') return 'phan';
  if (((/Quyền|Chưởng|Trượng|Phá|Bạo|Băng/.test(c.name || '')) && !/Cơ Bản/.test(c.name || '')) || (c.cost || 0) >= 3) return 'bao';   // đòn nặng (La Hán/Đạt Ma/Thiên Vương…), trừ "Cơ Bản"
  return 'tram';
}
// the co GAY SAT THUONG quai khong? (quyet dinh co chay hieu ung TAN CONG hay khong)
export function dealsDamage(c) { return !!(c && c.dmg); }

// ===== helpers DOM (bridge) =====
function reflow(el) { if (el) void el.offsetWidth; }
function addCls(el, cls, ms) { if (!el) return; el.classList.remove(cls); reflow(el); el.classList.add(cls); if (ms) setTimeout(() => { try { el.classList.remove(cls); } catch (e) {} }, ms); }
function portraitOf(host) { const p = host && host.closest('.dtm-enemy'); return p ? p.querySelector('.dtm-portwrap') : null; }
function flashEl(host) { if (!host) return; const f = host.querySelector('.dtm-eflash'); if (f) addCls(f, 'on', 340); }
function knockEl(host, dx, dy, rot) { const p = portraitOf(host); if (!p) return; p.style.setProperty('--kx', (dx || 0) + 'px'); p.style.setProperty('--ky', (dy || 0) + 'px'); p.style.setProperty('--kr', (rot || 0) + 'deg'); addCls(p, 'dtm-eknock', 620); }
function squashEl(host) { const p = portraitOf(host); if (p) addCls(p, 'dtm-esquash', 460); }
function spawn(parent, cls, n, eachFn) {
  if (!parent) return;
  for (let i = 0; i < n; i++) { const s = document.createElement('span'); s.className = cls; s.dataset.fxspark = '1'; if (eachFn) eachFn(s, i); parent.appendChild(s); setTimeout(() => { try { s.remove(); } catch (e) {} }, 1500); }
}

function clearFx(card, hosts) {
  const roots = [card].concat(hosts).filter(Boolean);
  roots.forEach((r) => r.querySelectorAll('[data-fxspark],[data-fxdom]').forEach((x) => { try { x.remove(); } catch (e) {} }));
}
function injectDom(el, html) { if (el && html) { const tpl = document.createElement('template'); tpl.innerHTML = html; Array.from(tpl.content.childNodes).forEach((n) => { if (n.setAttribute) n.setAttribute('data-fxdom', '1'); el.appendChild(n); }); } }

const _compiled = {};
function compile(key) {
  if (_compiled[key]) return _compiled[key];
  const body = DTM_FX_PLAY[key];
  if (!body) { _compiled[key] = function () {}; return _compiled[key]; }
  try {
    _compiled[key] = new Function('card', 'eport', 'stage', 'ehp', 'dmgFloat', 'shake', 'hitStop', 'enemyFlash', 'enemyKnock', 'enemySquash', 'spawn', 'reflow', 'addCls', 'eachEnemy', 'flashEnemy', 'knockEnemy', 'squashEnemy', 'floatOn', body);
  } catch (e) { console.error('DTM FX compile', key, e); _compiled[key] = function () {}; }
  return _compiled[key];
}

// scale toc do moi animation hieu ung (tru vanish co nhip rieng)
function applySpeed(card, hosts) {
  if (FX_SPEED === 1) return;
  // quét cả PANEL quái (để knock/flash/squash trên chân dung cũng chậm đồng bộ với hạt) + thẻ
  let panels = [];
  try { panels = Array.from(document.querySelectorAll('.dtm-enemy')); } catch (e) {}
  const els = [card].concat(panels).filter(Boolean);
  const sweep = () => {
    try {
      els.forEach((el) => {
        if (!el.getAnimations) return;
        el.getAnimations({ subtree: true }).forEach((a) => {
          const nm = a.animationName || '';
          if (nm.indexOf('Vanish') < 0) { try { a.playbackRate = FX_SPEED; } catch (e) {} }
        });
      });
    } catch (e) {}
  };
  sweep();
  const iv = setInterval(sweep, 30);
  setTimeout(() => clearInterval(iv), 1800);
}

// runFx(key, the DOM, host con quai dang nham, { hosts: [tat ca host], shake, hitStop, stage })
export function runFx(key, cardEl, hostEl, opts) {
  opts = opts || {};
  const hosts = opts.hosts && opts.hosts.length ? opts.hosts : (hostEl ? [hostEl] : []);
  const shake = opts.shake || function () {};
  const hitStop = opts.hitStop || function () {};
  const stage = opts.stage || null;
  const fn = compile(key);
  const cardSafe = cardEl || document.createElement('div');     // phong null -> effect query khong vo
  const hostSafe = hostEl || document.createElement('div');
  clearFx(cardSafe, hosts);
  const dom = DTM_FX_DOM[key] || {};
  if (dom.domCard) injectDom(cardSafe, dom.domCard);
  if (dom.domEnemy) hosts.forEach((h) => injectDom(h, dom.domEnemy));
  const noop = function () {};
  const enemyFlash = () => flashEl(hostSafe);
  const enemyKnock = (dx, dy, rot) => knockEl(hostSafe, dx, dy, rot);
  const enemySquash = () => squashEl(hostSafe);
  const eachEnemy = (cb) => hosts.forEach((h, i) => { try { cb(h, i); } catch (e) {} });
  try {
    fn(cardSafe, hostSafe, stage, null, noop, shake, hitStop, enemyFlash, enemyKnock, enemySquash, spawn, reflow, addCls, eachEnemy, flashEl, knockEl, squashEl, noop);
  } catch (e) { console.error('DTM FX run', key, e); }
  applySpeed(cardSafe, hosts);
  setTimeout(() => clearFx(cardSafe, hosts), 1900);
}

// ===== CUE phu/self (KHONG tan cong dich): +Ho/Hoi/Luc/Ne/Rut tren NHAN VAT; Suy Yeu tren con quai =====
const DTM_CUES = {
  shield(host) { spawn(host, 'cue-shield', 1, function () {}); },
  heal(host) { spawn(host, 'cue-heal', 1, function () {}); spawn(host, 'cue-healmote', 6, function (s) { s.style.setProperty('--mx', ((Math.random() * 2 - 1) * 28) + 'px'); s.style.setProperty('--md', (Math.random() * 0.3).toFixed(2) + 's'); }); },
  power(host) { spawn(host, 'cue-power', 1, function () {}); },
  dodge(host) { spawn(host, 'cue-dodge', 1, function () {}); },
  draw(host) { spawn(host, 'cue-draw', 4, function (s, i) { s.style.setProperty('--dx', ((i - 1.5) * 18) + 'px'); s.style.setProperty('--md', (i * 0.05).toFixed(2) + 's'); }); },
  weaken(host) { spawn(host, 'cue-weaken', 1, function () {}); },
};
// playerHost = .dtm-pfx (nhan vat); enemyHost = .dtm-efx con quai dang nham
export function runCues(c, playerHost, enemyHost) {
  if (!c) return;
  const ph = playerHost || document.createElement('div');
  try {
    if (c.blk) DTM_CUES.shield(ph);
    if (c.heal) DTM_CUES.heal(ph);
    if (c.str) DTM_CUES.power(ph);
    if (c.dodge) DTM_CUES.dodge(ph);
    if (c.draw) DTM_CUES.draw(ph);
    if (c.weaken && enemyHost) DTM_CUES.weaken(enemyHost);
    setTimeout(function () { try { ph.querySelectorAll('[data-fxspark]').forEach(function (x) { x.remove(); }); } catch (e) {} }, 1500);
  } catch (e) { console.error('DTM cues', e); }
}
