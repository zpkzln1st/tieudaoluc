// Engine hieu ung danh the cho Dang Tien Mong (port tu mockup _mockup/fx_src, da verify).
// Cach ly: chi dung DOM (the dang danh + panel con quai); KHONG dung state combat/gear/currencies.
import { DTM_FX_KEYS, DTM_FX_DOM, DTM_FX_PLAY } from './dtm_fx_data.js';

export const DTM_VANISH_MS = 700;   // thoi gian the bien mat khoi tay (user chot)
export const DTM_VANISH_LEAD = 380; // bat dau bien mat sau khi danh
const FX_SPEED = 0.45;              // toc do hieu ung (user chot): <1 = cham hon
export { DTM_FX_KEYS };

// ===== chon hieu ung theo LOAI + CO CHE the =====
export function castFxFor(c) {
  if (!c) return 'tram';
  if (c.aoe) return 'taoQuet';
  if (c.type === 'def') return 'hoThuan';
  if (c.type === 'ky') return 'khi';
  // type atk:
  if ((c.hits || 1) > 1) return 'vu';
  if (c.drain) return 'hapTinh';
  if (c.poison) return 'kichDoc';
  if (c.he === 'hoa') return 'phan';
  if (/Quyền|Chưởng|Phá|Trượng|Bạo|Băng/.test(c.name || '') || (c.cost || 0) >= 3) return 'bao';
  return 'tram';
}

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
