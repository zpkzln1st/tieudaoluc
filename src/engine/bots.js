// ============================================================
// ENGINE — Hệ Giang Hồ AI (bot). THUẦN. Lazy-sim: stat suy ra từ (seed, bornAt, now).
// Deterministic (sống qua reload) + monotonic (cấp không tụt — tính từ thời gian tuyệt đối).
// ============================================================
import { levelFromXp } from './leveling.js';
import { LOCATIONS, REALM_TIERS } from '../data/locations.js';
import { SKILLS } from '../data/skills.js';
import { AVATARS } from '../data/avatars.js';
import { QUALITY } from '../data/items.js';
import { YEU_VUONG } from '../data/combat.js';
import {
  ARCHETYPES, ARCHETYPE_IDS, ARCHETYPE_WEIGHTS, BOT_COUNT, BASE_RATE_PER_DAY,
  MAY_CHU_SEED, MAY_CHU_MO_LUC, TUOI_AN_CU_NGAY, SO_LAO_LANG, LAO_LANG_SINH_TRUOC, LAO_LANG_ONLINE, LAO_LANG_TEN,
  ONLINE_FRAC, RATE_JITTER, TRACK_KEYS, BOT_HO, BOT_TEN,
  TRACK_TITLES, TRACK_CAT, CAT_HEX, BOT_AVATAR_IDS,
  FEED_PERIOD_MS, FEED_SHOW, FEED_BREAK_WINDOW_MS, FEED_TREASURES, FEED_TUYET_HOC,
  FEED_FORGE, FEED_DAN, FEED_MOC, FEED_KHOANG, FEED_NGU,
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
export function hash2(a, b) {
  let h = (a | 0) ^ Math.imul(b | 0, 0x9E3779B1);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  return (h ^ (h >>> 16)) >>> 0;
}
const lerp = (rng, [lo, hi]) => lo + rng() * (hi - lo);
function weightedArch(rng) {
  const tot = ARCHETYPE_IDS.reduce((s, id) => s + (ARCHETYPE_WEIGHTS[id] || 1), 0);
  let r = rng() * tot;
  for (const id of ARCHETYPE_IDS) { r -= (ARCHETYPE_WEIGHTS[id] || 1); if (r <= 0) return id; }
  return ARCHETYPE_IDS[ARCHETYPE_IDS.length - 1];
}

// ============================================================
// ROSTER — giang hồ tại thời điểm `now`. THUẦN, suy ra từ (seed, mốc mở máy chủ, now).
//
// Người đến LIÊN TỤC, cách nhau CHU_KY; ai ở đủ TUOI_AN_CU_NGAY thì ẩn cư rời bảng. Nên tại
// mọi thời điểm, tuổi trải đều 0 → TUOI_AN_CU_NGAY và SÀN KHÔNG BAO GIỜ DÂNG.
// Cộng thêm SO_LAO_LANG người KHÔNG ẩn cư, sinh trước ngày mở máy chủ — để giang hồ luôn có
// vài cao thủ chạm trần cho người chơi có đích mà leo.
//
// ⚠ TÊN phải là hàm THUẦN của số thứ tự đến. Bản cũ khử trùng tên bằng vòng thử-lại trên CẢ
//   danh sách; làm thế ở đây thì tên một người sẽ ĐỔI khi có người khác nhập/rời giang hồ.
//
// ⚠⚠ Cách đặt tên đã SAI MỘT LẦN, ghi lại cho khỏi vấp lại. Bản đầu dùng MỘT hoán vị trên ô
//   tên rồi tách `họ = ô % số họ` và `tên = ô / số họ`. Hai vế ấy không độc lập: đo được TÊN
//   RIÊNG DỒN CỤC gấp 1,5 lần bốc ngẫu nhiên (dồn nhất 14 người so với 7-9), và tệ hơn là
//   dồn THEO THỨ HẠNG — sáu "Vân Thâm" nằm liền nhau ở đầu Phong Vân Bảng. Bảng số không bắt
//   được, chỉ ảnh chụp mới lộ.
//   NAY: họ và tên đi HAI bước riêng, mỗi bước nguyên tố cùng nhau với pool của nó. Theo định
//   lý thặng dư Trung Hoa, cặp (họ, tên) lặp lại sau đúng BCNN(số họ, số tên) lượt — miễn
//   BCNN > quân số luân chuyển thì không ai trùng tên, mà tên riêng rải đều tuyệt đối.
// ============================================================
const SO_LUAN = Math.max(1, BOT_COUNT - SO_LAO_LANG);          // số người trong dòng luân chuyển
const CHU_KY_MS = (TUOI_AN_CU_NGAY * DAY_MS) / SO_LUAN;         // bao lâu thì có một người mới
const ucln = (a, b) => (b ? ucln(b, a % b) : a);
const buocCho = (m, moi) => { let k = Math.max(2, Math.floor(m * moi)); while (ucln(k, m) !== 1) k++; return k; };
const BUOC_HO = buocCho(BOT_HO.length, 0.618);
const BUOC_TEN = buocCho(BOT_TEN.length, 0.382);
/** Chu kì lặp lại của cặp (họ, tên) = BCNN. PHẢI lớn hơn SO_LUAN thì mới chắc không ai trùng tên. */
export const CHU_KI_TEN = (BOT_HO.length * BOT_TEN.length) / ucln(BOT_HO.length, BOT_TEN.length);
const modP = (a, m) => ((a % m) + m) % m;
function tenTheoSo(n) {
  return BOT_HO[modP(n * BUOC_HO, BOT_HO.length)] + ' ' + BOT_TEN[modP(n * BUOC_TEN, BOT_TEN.length)];
}

/** Một người trong dòng luân chuyển, suy từ SỐ THỨ TỰ ĐẾN `n` (n âm = thế hệ khai phái). */
function nguoiThuN(seed, moLuc, n) {
  const rng = mulberry32(hash2(seed, (n | 0) * 2 + 1));
  const arch = weightedArch(rng);
  return {
    id: 'bot' + n, name: tenTheoSo(n), arch,
    bornAt: Math.round(moLuc + n * CHU_KY_MS),
    rate: lerp(rng, RATE_JITTER),
    onlineFrac: lerp(rng, ONLINE_FRAC),
    titleSeed: Math.floor(rng() * 1000),
    actSeed: Math.floor(rng() * 1000),
    avatarId: BOT_AVATAR_IDS[Math.floor(rng() * BOT_AVATAR_IDS.length)],
  };
}
/** Lão làng thứ j — KHÔNG ẩn cư, ô tên nằm ở phần chừa riêng nên không đụng dòng luân chuyển. */
function laoLangThuJ(seed, moLuc, j) {
  const rng = mulberry32(hash2(seed ^ 0x1AA, j + 1));
  const arch = weightedArch(rng);
  return {
    id: 'lao' + j, name: LAO_LANG_TEN[j % LAO_LANG_TEN.length], arch, laoLang: true,
    bornAt: moLuc - (LAO_LANG_SINH_TRUOC[0] + j * LAO_LANG_SINH_TRUOC[1]) * DAY_MS,
    rate: lerp(rng, RATE_JITTER),
    onlineFrac: lerp(rng, LAO_LANG_ONLINE),
    titleSeed: Math.floor(rng() * 1000),
    actSeed: Math.floor(rng() * 1000),
    avatarId: BOT_AVATAR_IDS[Math.floor(rng() * BOT_AVATAR_IDS.length)],
  };
}

// Cache theo (seed, mốc mở, số thứ tự người mới nhất) — chỉ dựng lại khi THẬT SỰ có người mới.
let _cacheKey = null, _cacheRoster = null;
export function genRoster(seedIn, moLucIn, now) {
  // ⚠ Lưới an toàn: nhiều chỗ gọi kèm `|| 0` cho mốc mở. Để nguyên số 0 thì mọi người sinh ở
  //   năm 1970 -> ai cũng chạm trần Lv100. Thiếu thì rơi về đúng hằng số máy chủ.
  const seed = seedIn || MAY_CHU_SEED, moLuc = moLucIn || MAY_CHU_MO_LUC;
  const t = now || Date.now();
  const nMoi = Math.floor((t - moLuc) / CHU_KY_MS);
  const ck = seed + ':' + moLuc + ':' + nMoi;
  if (_cacheKey === ck && _cacheRoster) return _cacheRoster;
  const out = [];
  for (let k = 0; k < SO_LUAN; k++) out.push(nguoiThuN(seed, moLuc, nMoi - k));
  for (let j = 0; j < SO_LAO_LANG; j++) out.push(laoLangThuJ(seed, moLuc, j));
  _cacheKey = ck; _cacheRoster = out;
  return out;
}
/** Còn bao lâu nữa thì có người nhập giang hồ (ms) — cho dòng chữ ở Phong Vân Bảng. */
export function conBaoLauCoNguoiMoi(moLuc, now) {
  const t = now || Date.now();
  return CHU_KY_MS - (((t - moLuc) % CHU_KY_MS) + CHU_KY_MS) % CHU_KY_MS;
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
// "Nghề thật" của bot: NHÓM dồn effort nhiều nhất (combat/gather/craft/support), rồi 1 track CỤ THỂ trong nhóm
// (seed theo bot -> đa dạng + đồng đạo phân bố các nghề). level = cấp track cao nhất trong nhóm (cho bậc danh hiệu).
const CAT_TRACKS = { combat: ['chienDau'], gather: ['phatMoc', 'thaiKhoang', 'dieuNgu', 'thaiDuoc'], craft: ['daLuyen', 'phanhNham', 'daTao', 'doanhTao'], support: ['luyenDan', 'toaQuan'] };
export function botDominant(bot, now) {
  const eff = botEffort(bot, now), w = archNormW(bot.arch);
  let bestCat = 'combat', bestCatXp = -1;
  for (const cat in CAT_TRACKS) {
    let sum = 0; for (const k of CAT_TRACKS[cat]) sum += eff * w[k];
    if (sum > bestCatXp) { bestCatXp = sum; bestCat = cat; }
  }
  const tracks = CAT_TRACKS[bestCat], track = tracks[bot.titleSeed % tracks.length];
  return { track, cat: bestCat, level: levelFromXp(eff * w[track]) };   // bậc = cấp ĐÚNG track hiển thị (tên+bậc khớp)
}
export function botTitleFor(track, level) {                         // danh hiệu theo track + bậc cấp
  const tiers = TRACK_TITLES[track] || ['Tản Nhân'];
  const t = level < 40 ? 0 : level < 70 ? 1 : level < 90 ? 2 : 3;
  return tiers[Math.min(t, tiers.length - 1)];
}
export function botCatFor(track) { return TRACK_CAT[track] || 'combat'; }   // nhóm nghề (cho màu)
export function botTitle(bot, now) { const d = botDominant(bot, now); return botTitleFor(d.track, d.level); }
export function botCat(bot, now) { return botCatFor(botDominant(bot, now).track); }
export function botArchName(bot) { return ARCHETYPES[bot.arch].name; }      // tên loại playstyle
/** Cấp TỪNG track của một bot (Chiến Đấu + 10 nghề) — cho bảng hồ sơ chi tiết. */
export function botTracks(bot, now) {
  const eff = botEffort(bot, now), w = archNormW(bot.arch);
  // ⚠ 'chienDau' KHÔNG nằm trong SKILLS (nó là track chiến đấu, không phải nghề) nên
  // (SKILLS[k]||{}).name rơi về hiện nguyên khoá "chienDau" trên giao diện. Phải vá tay.
  return TRACK_KEYS.map((k) => ({
    key: k, ten: k === 'chienDau' ? 'Chiến Đấu' : ((SKILLS[k] || {}).name || k),
    lv: levelFromXp(eff * w[k]),
  }));
}
export function botAvatar(bot) {   // {id,char,color} — id sect ngoài AVATARS vẫn trả đúng id (ảnh load) + char/màu mặc định
  const a = AVATARS.find((x) => x.id === bot.avatarId);
  return a ? { id: a.id, char: a.char, color: a.color } : { id: bot.avatarId, char: '侠', color: 'from-slate-600 to-slate-700' };
}
// Bot "đồng đạo" của 1 nghề = bot ĐANG LÀM nghề đó (botActivity chứa tên nghề) -> mọi nghề có người + đổi theo giờ. THUẦN.
export function nearbyBotsBy(roster, skillId, now) {
  const nm = (SKILLS[skillId] || {}).name; if (!nm) return [];
  return roster.filter((b) => botActivity(b, now).includes(nm));
}

// ---- Flavor "đang làm gì" (đổi theo thời gian + hợp cấp/vùng) ----
const GENERIC_ACTS = ['vây sát yêu thú', 'luyện công', 'tầm sư học đạo', 'chinh chiến giang hồ'];
export function botActivity(bot, now) {
  const lv = botCombatLv(bot, now);
  const open = LOCATIONS.filter((l) => l.reqLevel <= Math.max(1, lv));
  const loc = (open.length ? open[(bot.actSeed + Math.floor(now / 3600000)) % open.length] : LOCATIONS[0]);
  const bucket = (bot.actSeed + Math.floor(now / 1800000)) % 5;   // đổi mỗi ~30'
  switch (bot.arch) {
    case 'sanBoss':   return bucket < 3 ? 'vây sát Yêu Vương' : ('luyện công ở ' + loc.name);
    // Chia theo SỐ NGHỀ THẬT (TRACK_KEYS trừ chienDau) — trước đây viết cứng số 9, thêm nghề thứ 10 là
    // nghề cuối không bao giờ trúng -> panel "Đồng Đạo Lân Cận" của nghề đó vĩnh viễn trống, không báo lỗi.
    case 'cayNghe':   { const sk = TRACK_KEYS[1 + ((bot.actSeed + bucket) % (TRACK_KEYS.length - 1))]; return (SKILLS[sk] ? SKILLS[sk].name : 'cày nghề') + ' ở ' + loc.name; }
    case 'phuThuong': return bucket < 2 ? 'gom hàng buôn bán' : ('rèn đúc binh khí · ' + loc.name);
    default:          return GENERIC_ACTS[bucket % GENERIC_ACTS.length] + ' ở ' + loc.name;
  }
}

// ---- Khởi tạo world — gọi on-load (như ensureQuests) ----
// MÁY CHỦ CHUNG: seed + mốc mở là HẰNG SỐ, không còn random theo từng save. Save cũ mang seed
// riêng thì chuyển sang máy chủ chung và ghi lại mốc chuyển (`nhapMayChu`) để chỉ dọn một lần.
export function ensureWorld(state, now) {
  const cu = state.world;
  if (!cu || cu.seed !== MAY_CHU_SEED || cu.createdAt !== MAY_CHU_MO_LUC) {
    state.world = {
      seed: MAY_CHU_SEED, createdAt: MAY_CHU_MO_LUC,
      nhapMayChu: now,                                   // lúc save này nhập máy chủ chung
      seedRieng: (cu && typeof cu.seed === 'number') ? cu.seed : null,   // seed riêng cũ (chỉ để tra)
    };
  }
  return state.world;
}

/**
 * Dọn tham chiếu tới người ĐÃ ẨN CƯ (hoặc thuộc giang hồ riêng cũ trước khi nhập máy chủ chung).
 * Ba chỗ trong save giữ mã người: thành viên Tiên Minh, đơn xin nhập minh, và giao tình Tửu Lâu.
 * ⚠ Bỏ qua bước này thì Tiên Minh treo thành viên "ma": tra roster không ra, hồ sơ trả null.
 * Trả { roiMinh, boDon, quenCu } để lớp trên báo người chơi MỘT lần.
 */
export function donNguoiAnCu(state, world, now) {
  const con = new Set(genRoster(world.seed, world.createdAt, now).map((b) => b.id));
  const ket = { roiMinh: 0, boDon: 0, quenCu: 0, ten: [] };
  const bp = state.bangPhai;
  if (bp && bp.bang) {
    if (Array.isArray(bp.bang.tv)) {
      const giu = bp.bang.tv.filter((m) => m && con.has(m.id));
      ket.roiMinh = bp.bang.tv.length - giu.length;
      bp.bang.tv = giu;
    }
    if (Array.isArray(bp.bang.donXin)) {
      const giu = bp.bang.donXin.filter((id) => con.has(id));
      ket.boDon = bp.bang.donXin.length - giu.length;
      bp.bang.donXin = giu;
    }
  }
  const tl = state.tuuLau;
  if (tl && tl.giaoTinh) {
    for (const id in tl.giaoTinh) {
      if (con.has(id)) continue;
      delete tl.giaoTinh[id];
      if (tl.gtPhien) delete tl.gtPhien[id];
      if (tl.hoiLan) delete tl.hoiLan[id];
      ket.quenCu++;
    }
  }
  return ket;
}

// ============================================================
// FEED GIANG HỒ — tin bot. THUẦN + DETERMINISTIC + MONOTONIC.
// Mỗi slot thời gian (slot = floor(now/PERIOD)) sinh ĐÚNG 1 tin từ (seed, slot) + trạng thái bot tại slotTime tuyệt đối.
// Dựng FEED_SHOW slot gần nhất -> mở lại/đổi render KHÔNG reroll; qua mỗi PERIOD 1 tin mới chèn đầu, tin cũ trôi.
// ============================================================
const KIND_HEX  = { breakthrough: '#22d3ee', slayBoss: '#fb7185', rareLoot: '#fbbf24', tuyetHoc: '#c4b5fd', fortune: '#eab308' };
const NGHE_HEX  = { gather: '#34d399', craft: '#fb923c', support: '#a78bfa' };   // màu chip theo NHÓM nghề (gather/craft/support)
// Ấn triện Hán-tự thay icon (chất giang hồ). 5 loại tin chính + 10 ấn RIÊNG từng nghề (màu vẫn theo nhóm -> vừa sang vừa không một khuôn).
const KIND_SEAL = { breakthrough: '破', slayBoss: '斬', rareLoot: '寶', tuyetHoc: '訣', fortune: '緣' };
const NGHE_SEAL = { phatMoc: '樵', thaiKhoang: '礦', dieuNgu: '漁', daTao: '鍛', daLuyen: '冶', phanhNham: '廚', doanhTao: '築', luyenDan: '丹', toaQuan: '禪', thaiDuoc: '藥' };
const pickH = (h, arr) => arr[(h >>> 0) % arr.length];
function realmOf(L) { for (let i = REALM_TIERS.length - 1; i >= 0; i--) { if (L >= REALM_TIERS[i].min) return REALM_TIERS[i]; } return REALM_TIERS[0]; }
function openRegions(L) { const o = LOCATIONS.filter((l) => l.reqLevel <= Math.max(1, L)); return o.length ? o : [LOCATIONS[0]]; }
function bossesUpTo(L) { return YEU_VUONG.filter((b) => b.reqLevel <= L); }

// Chọn loại sự kiện HỢP với bot (archetype + cấp + nghề đỉnh) rồi dựng câu chữ (nhiều mẫu -> không 1 khuôn).
function feedEvent(bot, t, h) {
  const L = botCombatLv(bot, t), arch = bot.arch, d = botDominant(bot, t);
  const whoHex = CAT_HEX[d.cat] || '#94a3b8';
  const Lback = botCombatLv(bot, t - FEED_BREAK_WINDOW_MS);          // cấp 12h trước -> dò lên cấp THẬT
  const cand = [];
  if (L > Lback && L >= 5) cand.push(['breakthrough', 6]);
  if ((arch === 'sanBoss' || arch === 'satThu') && L >= 10) cand.push(['slayBoss', arch === 'sanBoss' ? 6 : 3]);
  else if (arch === 'loMo' && L >= 20) cand.push(['slayBoss', 1]);
  if (L >= 10) cand.push(['rareLoot', 4]);
  if (L >= 30) cand.push(['tuyetHoc', 2]);
  if (d.cat !== 'combat' && L >= 12) cand.push(['nghe', d.cat === 'craft' ? 5 : 4]);   // chỉ bot nghề-đỉnh phi-chiến mới khoe nghề -> không lệch
  cand.push(['fortune', arch === 'phuThuong' ? 5 : 1]);
  let tot = 0; for (const c of cand) tot += c[1];
  let r = (h >>> 0) % tot, kind = cand[cand.length - 1][0];
  for (const c of cand) { if (r < c[1]) { kind = c[0]; break; } r -= c[1]; }
  const hex  = kind === 'nghe' ? (NGHE_HEX[d.cat] || '#94a3b8') : KIND_HEX[kind];
  const seal = kind === 'nghe' ? (NGHE_SEAL[d.track] || '藝') : KIND_SEAL[kind];
  return { kind, seal, hex, whoHex, txt: feedTxt(kind, bot, t, L, d, hash2(h, 0x2F1B)) };
}

function feedTxt(kind, bot, t, L, d, h) {
  const reg = pickH(h, openRegions(L)).name;                          // vùng hợp cấp
  const hp = hash2(h, 7), hx = hash2(h, 13);                          // tách hash: hp = chọn mẫu câu, hx = chọn nội dung
  switch (kind) {
    case 'breakthrough': {
      const Lback = botCombatLv(bot, t - FEED_BREAK_WINDOW_MS);
      const tNow = realmOf(L), tBack = realmOf(Lback);
      if (tNow.id !== tBack.id) return pickH(hp, [
        `phá quan đột phá, chân nguyên thăng nhập cảnh giới <b class="${tNow.text}">${tNow.name}</b>`,
        `một sớm khai khiếu, đường đường bước vào <b class="${tNow.text}">${tNow.name}</b>`,
      ]);
      return pickH(hp, [
        `bế quan xuất thất, tu vi tiến đến Chiến Đấu Lv ${L}`,
        `lĩnh ngộ chân ý, công lực đại tiến đạt Lv ${L}`,
        `khổ luyện có thành, đột phá lên Lv ${L}`,
      ]);
    }
    case 'slayBoss': {
      const bs = bossesUpTo(L), pool = bs.slice(Math.max(0, bs.length - 3));
      const bObj = pickH(hx, pool.length ? pool : bs), boss = bObj.name;
      const open = openRegions(bObj.reqLevel), bReg = pickH(hash2(h, 21), open.slice(Math.max(0, open.length - 2))).name;   // vùng tương xứng TẦM CẤP boss (không gán Yêu Vương cao về thôn tân thủ)
      return pickH(hp, [
        `đơn kiếm trảm <b class="text-rose-300">${boss}</b> nơi ${bReg}`,
        `hợp vây diệt <b class="text-rose-300">${boss}</b>, danh chấn ${bReg}`,
        `kết liễu <b class="text-rose-300">${boss}</b> sau một trận tử chiến`,
        `đoạt mạng <b class="text-rose-300">${boss}</b>, thu trọn chiến lợi phẩm`,
      ]);
    }
    case 'rareLoot': {
      const elig = FEED_TREASURES.filter((x) => x.minLv <= L), tr = pickH(hx, elig.length ? elig : FEED_TREASURES);
      const q = QUALITY[tr.q] || QUALITY.tinhPham, it = `<b class="${q.text}">${tr.name}</b>`;
      return pickH(hp, [
        `khai quật nơi ${reg}, đắc ${it} <span class="${q.text}">· ${q.name}</span>`,
        `mở cổ rương phong ấn, thu được ${it}`,
        `cơ duyên nhặt được ${it} — phẩm ${q.name}, chấn động một phương`,
      ]);
    }
    case 'tuyetHoc': {
      const art = pickH(hx, FEED_TUYET_HOC);
      return pickH(hp, [
        `cơ duyên trùng hợp, lĩnh ngộ tuyệt học <b class="text-violet-300">${art}</b>`,
        `đắc tàn quyển <b class="text-violet-300">${art}</b>, võ công đại tiến`,
        `tham ngộ <b class="text-violet-300">${art}</b>, một thân bản lĩnh tăng vọt`,
      ]);
    }
    case 'nghe': {                                                    // tin nghề — câu chữ KHỚP track đỉnh
      switch (d.track) {
        case 'daTao':   { const w = pickH(hx, FEED_FORGE); return pickH(hp, [`khai lò rèn nên thần binh <b class="text-orange-300">${w}</b>`, `nghìn lần tôi luyện, đúc thành <b class="text-orange-300">${w}</b>`]); }
        case 'luyenDan':{ const dn = pickH(hx, FEED_DAN);  return pickH(hp, [`khởi đỉnh luyện thành <b class="text-orange-300">${dn}</b>`, `đan thành chín chuyển, luyện ra <b class="text-orange-300">${dn}</b>`]); }
        case 'phatMoc': { const m = pickH(hx, FEED_MOC);    return pickH(hp, [`đốn được kỳ mộc <b class="text-emerald-300">${m}</b> nơi ${reg}`, `tầm sơn đẵn gỗ, hạ một cây <b class="text-emerald-300">${m}</b>`]); }
        case 'thaiKhoang': { const k = pickH(hx, FEED_KHOANG); return pickH(hp, [`đào trúng mạch <b class="text-emerald-300">${k}</b> trong ${reg}`, `khai khoáng nơi ${reg}, lộ ra <b class="text-emerald-300">${k}</b>`]); }
        case 'dieuNgu': { const f = pickH(hx, FEED_NGU);    return pickH(hp, [`buông câu Long Môn, câu lên <b class="text-emerald-300">${f}</b>`, `nơi ${reg} câu được <b class="text-emerald-300">${f}</b>`]); }
        case 'daLuyen': return pickH(hp, [`luyện thành một mẻ <b class="text-orange-300">tinh kim thượng phẩm</b>`, `lò lửa ngút trời, tinh luyện ra khối thần thiết`]);
        case 'phanhNham': return pickH(hp, [`nấu nên <b class="text-orange-300">Mãn Hán Trân Hào</b>, hương bay khắp ${reg}`, `một bàn mỹ vị danh chấn ${reg}`]);
        case 'doanhTao': return pickH(hp, [`dựng nên cơ quan kỳ xảo, ${reg} thêm phần vững chãi`, `bài bố trận pháp tinh diệu nơi ${reg}`]);
        case 'toaQuan': return pickH(hp, [`tọa quan nhập định, ngộ ra một tầng huyền cơ`, `thiền tọa nơi ${reg}, đạo tâm thông triệt`]);
        default: { const skn = (SKILLS[d.track] || {}).name || 'bách nghệ'; return pickH(hp, [`${skn} đại thành, danh tiếng vang khắp ${reg}`, `tinh thông ${skn}, được muôn người kính nể`]); }
      }
    }
    case 'fortune':
    default: {
      if (bot.arch === 'phuThuong') { const n = 2 + ((hx >>> 0) % 9); return pickH(hp, [`một chuyến buôn xa, thu về <b class="text-gold">${n} vạn</b> lượng bạc`, `bắt được mối hời nơi Phường Thị, lãi đậm <b class="text-gold">${n} vạn</b> bạc`]); }
      return pickH(hp, [`ngao du ${reg}, gặp một đoạn kỳ duyên hiếm có`, `hành hiệp trượng nghĩa nơi ${reg}, được muôn người truyền tụng`, `luận võ kết giao bằng hữu, thanh danh nổi như cồn`]);
    }
  }
}

let _feedKey = null, _feedList = null;
export function genJiangHuFeed(seed, createdAt, now) {
  const k0 = Math.floor(now / FEED_PERIOD_MS);
  const ck = seed + ':' + createdAt + ':' + k0;
  if (_feedKey === ck && _feedList) return _feedList;
  const roster = genRoster(seed, createdAt, now), out = [];
  const jitMax = Math.max(1, Math.floor(FEED_PERIOD_MS * 0.6));       // lệch ts về QUÁ KHỨ (< PERIOD) -> giờ "X phút trước" tự nhiên, vẫn ≤ now
  for (let i = 0; i < FEED_SHOW; i++) {
    const slot = k0 - i; if (slot < 0) break;
    const slotTime = slot * FEED_PERIOD_MS;
    const bot = roster[hash2(seed ^ 0x51ED2A, slot) % BOT_COUNT];
    const ev = feedEvent(bot, slotTime, hash2(seed ^ 0x9A1B3C, slot));
    const ts = Math.min(now, slotTime - (hash2(seed ^ 0x7C3D5E, slot) % jitMax));
    out.push({ id: 'jh' + slot, kind: ev.kind, seal: ev.seal, hex: ev.hex, who: bot.name, whoHex: ev.whoHex, ts, txt: ev.txt, av: botAvatar(bot) });
  }
  out.sort((a, b) => b.ts - a.ts);
  _feedKey = ck; _feedList = out;
  return out;
}
