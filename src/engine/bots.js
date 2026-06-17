// ============================================================
// ENGINE — Hệ Giang Hồ AI (bot). THUẦN. Lazy-sim: stat suy ra từ (seed, bornAt, now).
// Deterministic (sống qua reload) + monotonic (cấp không tụt — tính từ thời gian tuyệt đối).
// ============================================================
import { levelFromXp } from './leveling.js';
import { LOCATIONS } from '../data/locations.js';
import { SKILLS } from '../data/skills.js';
import {
  ARCHETYPES, ARCHETYPE_IDS, ARCHETYPE_WEIGHTS, BOT_COUNT, BASE_RATE_PER_DAY,
  BORNAT_SPREAD_DAYS, BORNAT_SKEW, ONLINE_FRAC, RATE_JITTER, TRACK_KEYS, BOT_HO, BOT_TEN,
} from '../data/bots.js';

const DAY_MS = 86400000;
const RATE_PER_MS = BASE_RATE_PER_DAY / DAY_MS;

// ---- PRNG mulberry32 (deterministic từ seed nguyên) ----
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash2(a, b) {
  let h = (a | 0) ^ Math.imul(b | 0, 0x9E3779B1);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  return (h ^ (h >>> 16)) >>> 0;
}
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const lerp = (rng, [lo, hi]) => lo + rng() * (hi - lo);
function weightedArch(rng) {
  const tot = ARCHETYPE_IDS.reduce((s, id) => s + (ARCHETYPE_WEIGHTS[id] || 1), 0);
  let r = rng() * tot;
  for (const id of ARCHETYPE_IDS) { r -= (ARCHETYPE_WEIGHTS[id] || 1); if (r <= 0) return id; }
  return ARCHETYPE_IDS[ARCHETYPE_IDS.length - 1];
}

// ---- Roster: sinh THUẦN từ world.seed + createdAt (cache theo seed) ----
let _cacheKey = null, _cacheRoster = null;
export function genRoster(seed, createdAt) {
  const ck = seed + ':' + createdAt;
  if (_cacheKey === ck && _cacheRoster) return _cacheRoster;
  const used = new Set(), out = [];
  for (let i = 0; i < BOT_COUNT; i++) {
    const rng = mulberry32(hash2(seed, i + 1));
    const arch = weightedArch(rng);
    let name, guard = 0;
    do { name = pick(rng, BOT_HO) + ' ' + pick(rng, BOT_TEN); guard++; } while (used.has(name) && guard < 12);
    used.add(name);
    const ageDays = BORNAT_SPREAD_DAYS[0] + (BORNAT_SPREAD_DAYS[1] - BORNAT_SPREAD_DAYS[0]) * Math.pow(rng(), BORNAT_SKEW);   // lệch về trẻ
    out.push({
      id: 'bot' + i, name, arch,
      bornAt: createdAt - Math.round(ageDays * DAY_MS),
      rate: lerp(rng, RATE_JITTER),
      onlineFrac: lerp(rng, ONLINE_FRAC),
      titleSeed: Math.floor(rng() * 1000),
      actSeed: Math.floor(rng() * 1000),
    });
  }
  _cacheKey = ck; _cacheRoster = out;
  return out;
}

// ---- Tiến trình (suy ra, monotonic theo now) ----
function botEffort(bot, now) { return Math.max(0, RATE_PER_MS * (now - bot.bornAt) * bot.onlineFrac * bot.rate); }
const _normW = {};
function archNormW(arch) {
  if (_normW[arch]) return _normW[arch];
  const w = ARCHETYPES[arch].w, tot = TRACK_KEYS.reduce((s, k) => s + (w[k] || 0), 0) || 1;
  const out = {}; TRACK_KEYS.forEach((k) => { out[k] = (w[k] || 0) / tot; });
  _normW[arch] = out; return out;
}
export function botCombatLv(bot, now) { return levelFromXp(botEffort(bot, now) * archNormW(bot.arch).chienDau); }
export function botTotalLv(bot, now) {
  const eff = botEffort(bot, now), w = archNormW(bot.arch);
  let s = 0; for (const k of TRACK_KEYS) s += levelFromXp(eff * w[k]);
  return s;
}
export function botTitle(bot) { const t = ARCHETYPES[bot.arch].titles; return t[bot.titleSeed % t.length]; }
export function botArchName(bot) { return ARCHETYPES[bot.arch].name; }

// ---- Flavor "đang làm gì" (đổi theo thời gian + hợp cấp/vùng) ----
const GENERIC_ACTS = ['vây sát yêu thú', 'luyện công', 'tầm sư học đạo', 'chinh chiến giang hồ'];
export function botActivity(bot, now) {
  const lv = botCombatLv(bot, now);
  const open = LOCATIONS.filter((l) => l.reqLevel <= Math.max(1, lv));
  const loc = (open.length ? open[(bot.actSeed + Math.floor(now / 3600000)) % open.length] : LOCATIONS[0]);
  const bucket = (bot.actSeed + Math.floor(now / 1800000)) % 5;   // đổi mỗi ~30'
  switch (bot.arch) {
    case 'sanBoss':   return bucket < 3 ? 'vây sát Yêu Vương' : ('luyện công ở ' + loc.name);
    case 'cayNghe':   { const sk = TRACK_KEYS[1 + ((bot.actSeed + bucket) % 9)]; return (SKILLS[sk] ? SKILLS[sk].name : 'cày nghề') + ' ở ' + loc.name; }
    case 'phuThuong': return bucket < 2 ? 'gom hàng buôn bán' : ('rèn đúc binh khí · ' + loc.name);
    default:          return GENERIC_ACTS[bucket % GENERIC_ACTS.length] + ' ở ' + loc.name;
  }
}

// ---- Khởi tạo world (seed + createdAt) nếu thiếu — gọi on-load (như ensureQuests) ----
export function ensureWorld(state, now) {
  if (!state.world || typeof state.world.seed !== 'number') {
    state.world = { seed: (Math.floor(Math.random() * 2147483646) + 1), createdAt: now };
  }
  return state.world;
}
