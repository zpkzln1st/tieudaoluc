// ============================================================
// MAIN — Bootstrap: nối ENGINE (logic thuần) với UI (Alpine).
// ============================================================
import Alpine from 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/module.esm.js';
import { SKILLS, STATS } from './data/skills.js';
import { ITEMS, QUALITY, ITEM_TYPES, DOPHO_IDS } from './data/items.js';
import { LOCATIONS, REALM_TIERS } from './data/locations.js';
import { AVATARS, COVERS } from './data/avatars.js';
import { LOGIN_REWARDS } from './data/daily.js';
import { TUTORIAL_QUESTS, DAILY_QUESTS, WEEKLY_QUESTS, MONTHLY_QUESTS } from './data/quests.js';
import { LINH_THACH } from './data/linhthach.js';
import { NAV, VIEW_NAMES } from './data/nav.js';
import { EQUIP_SLOTS, TOOL_SLOTS, SECONDARY_STATS, RETIRED_SLOTS } from './data/ui.js';
import { GEAR_IDS, instanceFromCatalog, rollGearInstance, rollMonsterDrop, MONSTER_DROP_CHANCE, AFFIX } from './data/gear.js';
import { CLASSES, CLASS_GROUPS, NGHE, skillExpMultiplier } from './data/classes.js';
import { createInitialState } from './engine/state.js';
import { Storage } from './engine/save.js';
import {
  startActivity, startCombat, startTravel, stopActivity, advance, getAction, idleCapMs, SUY_YEU_MS,
  canStartAction, inputStatus, startDungeon, autoEatTick, autoDanNL,
} from './engine/activity.js';
import { deriveCombat, combatProfile, simFight, makeFight, stepFight, CHIEU, BO_PHAP, BI_DONG, TAM_PHAP, TAM_PHAP_POOL, tamPhapById, chieuById, biDongById, normBiDong, NGU_HANH, NGU_HANH_LIST, nguHanhMod, heName, heInfo, maxComboSlots, maxChieuSlots, nextSlotLevel, COMBAT_CYCLE_MS, boPhapById, boPhapStats, normBoPhap, MON_PHAI, monPhaiOf, chieuCost, tamPhapCost, biDongCost, skillSource, normOwned, starterLoadoutFor, TIER_LABEL, TIER_ORDER, TIER_STYLE, tierStyle } from './data/votong.js';
import { ENEMIES, STANCES, YEU_VUONG, YEU_VUONG_BY_ID } from './data/combat.js';
import { DUNGEONS, DUNGEON_BY_ID, DUNGEON_IDS } from './data/dungeon.js';
import { MERCHANT, SHOP_MAT, SHOP_FOOD, SHOP_BAIT, AVATAR_PRICE, COVER_PRICE } from './data/merchant.js';
import { addItem, removeItem } from './engine/inventory.js';
import { derivedStats } from './engine/stats.js';
import { CODEX_CATS, CODEX_BY_KEY } from './data/codex.js';
import { ensureCodex, codexCount, codexCatDone, codexBonus } from './engine/codex.js';
import { gearPlus, enhanceMul, enhanceStep, canEnhance, tryEnhance, MAX_PLUS } from './engine/enhance.js';
import { equipItem, unequipItem, addGearInstance, removeGearByUid, findGear } from './engine/equip.js';
import { xpProgress, levelFromXp, xpForLevel, addSkillXp, addStatXp } from './engine/leveling.js';
import { pushNotif } from './engine/notif.js';
import { startIncubation, finishHatch, incubRemainMs, incubReady, incubSkipCost, hatchDurMs, petStatAt, activePet, gainPetXp, petXpToNext, petCombatCycle, petStamView, petStamMax, petHpMax, petPassive, petActive, petActiveEff, petAwkPassive, fusePreview, fuseMany, releaseReward, releasePet, devSpawnPet, awakenCost, canAwaken, awakenAfford, awakenPet, activeAwkVal, startHunt, stopHunt, resolvePetHunts, nguThuLv, huntSlots, huntSlotsUsed, petBusy, HUNT_TICK_MS } from './engine/pets.js';
import { PET_SPECIES, PET_QUALITY, PET_OPT_BY_ID, AWK_PASSIVES } from './data/pets.js';
import { genRoster, botCombatLv, botTotalLv, botDominant, botTitleFor, botCatFor, botAvatar, botActivity, nearbyBotsBy, ensureWorld, genJiangHuFeed } from './engine/bots.js';
import { BOT_COUNT, CAT_HEX } from './data/bots.js';
import { teleportCost, travelTimeMs, mapDistance } from './engine/travel.js';
import { bossHe, bossReady, bossCdEnd, bossQueued, setBossQueue, runBossFight, applyBossWin, applyBossLose, applyBossRetreat, resolveBossQueue as resolveBossQueueEngine, genBossFeed, bossCurHp, bossMaxHp, bossHealing, bossHealLeftMs } from './engine/worldboss.js';
import { cloudSignUp, cloudSignIn, cloudSignOut, cloudGetUser, cloudOnAuth, cloudLoadSave, cloudPushSave } from './cloud.js';

const now = () => Date.now();
let _lbBots = null, _lbBotKey = '';   // cache hàng bot BXH (module-level, non-reactive) — memo theo (seed:createdAt:phút)
let _nbData = null, _nbKey = '';      // cache Đồng Đạo Lân Cận theo (skill:phút)
const CYCLE_MS = COMBAT_CYCLE_MS; // 1 vòng giao chiến = 8s (nguồn chung votong.js); hết vòng mới hiện trọn chiến báo + kết quả
const BOSS_TURN_MS = 3000;        // Yêu Vương: lộ 1 lượt (frame) mỗi 3 giây khi xem live
// Chi phí Bạc học nghề theo BẬC (index = số nghề đã học). Leo thang mạnh (làm tròn).
const PROF_COST = [50000, 120000, 280000, 650000, 1500000, 3500000, 8000000, 20000000, 50000000];
const PROF_LV_STEP = 80; // mỗi 80 Tổng Lv mở thêm 1 nghề
// Cổng Bảng Dev (F9): so HASH (FNV-1a) của mật khẩu — KHÔNG để plaintext trong source (repo deploy public).
// Đổi mật khẩu: chạy devHash('matkhaumoi') rồi thay DEV_PASS_HASH. (Gate client-side chặn người chơi thường; F12 vẫn lách được — đã rõ, chống cheat thật cần server.)
function devHash(s) { let h = 2166136261 >>> 0; const str = String(s); for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const DEV_PASS_HASH = 1011525020;   // hash mật khẩu Dev (KHÔNG ghi plaintext ở đây — repo deploy public)
// Dịch lỗi Auth Supabase (tiếng Anh) sang tiếng Việt cho các lỗi hay gặp.
function authErrVi(msg) {
  const m = (msg || '').toLowerCase();
  if (m.includes('invalid login')) return 'Sai email hoặc mật khẩu.';
  if (m.includes('already registered') || m.includes('already been registered') || m.includes('user already')) return 'Email này đã được đăng ký.';
  if (m.includes('email not confirmed')) return 'Email chưa xác nhận — mở hộp thư bấm xác nhận trước.';
  if (m.includes('password should be at least') || m.includes('at least 6')) return 'Mật khẩu quá ngắn (tối thiểu 6 ký tự).';
  if ((m.includes('email') && m.includes('invalid')) || m.includes('unable to validate email') || m.includes('invalid format')) return 'Email không hợp lệ (thử email thật, đừng dùng @example.com).';
  if (m.includes('rate limit') || m.includes('too many') || m.includes('for security purposes')) return 'Thao tác quá nhiều lần — đợi chút rồi thử lại.';
  return msg || 'Có lỗi xảy ra.';
}
// Dịch lỗi Cloud save (DB/RLS) sang tiếng Việt.
function cloudErrVi(msg) {
  const m = (msg || '').toLowerCase();
  if (m.includes('does not exist') || m.includes('relation') || m.includes('schema cache')) return 'Chưa tạo bảng lưu trên cloud (chạy SQL khởi tạo).';
  if (m.includes('row-level security') || m.includes('rls') || m.includes('policy')) return 'Quyền cloud chưa đúng (kiểm tra RLS bảng saves).';
  if (m.includes('jwt') || m.includes('expired') || m.includes('not authenticated')) return 'Phiên hết hạn — đăng nhập lại.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Không kết nối được cloud (mạng?).';
  return 'Đồng bộ cloud lỗi: ' + (msg || 'không rõ');
}
// Ngày địa phương dạng YYYY-MM-DD (cho điểm danh)
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayStr = () => ymd(new Date());
const yestStr = () => ymd(new Date(Date.now() - 86400000));
// Neo TUẦN theo Thứ 2 (id = ymd của Thứ 2 trong tuần); THÁNG theo YYYY-MM.
function weekStr() {
  const d = new Date();
  const dow = (d.getDay() + 6) % 7; // 0=Thứ2 ... 6=Chủ Nhật
  const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow);
  return ymd(mon);
}
function monthStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }

// ---- Khởi tạo state + offline gains ----
let state = Storage.load() || createInitialState();
// lastSave NGAY LÚC NẠP từ đĩa (trước khi vòng game autosave bump) — mốc so sánh cloud đáng tin (xem cloudSyncOnLogin)
const _loadedLastSave = (state && state.lastSave) || 0;
if (!state.equipment) state.equipment = {};
if (!state.enhance) state.enhance = {};   // (legacy) cường hóa theo id — dời vào instance.plus ở migration dưới
if (!Array.isArray(state.gearBag)) state.gearBag = [];
// Migrate: slot trang bị đã bỏ (Quần/Phụ Khí/Bội Sức) -> trả món đang mặc về túi.
RETIRED_SLOTS.forEach((slot) => {
  const id = state.equipment[slot];
  if (id) { if (typeof id === 'string') state.inventory[id] = (state.inventory[id] || 0) + 1; else if (id.gearId) state.gearBag.push(id); }
  delete state.equipment[slot];
});
// MIGRATION LOOT-HUNT (idempotent): gear cũ (equipment id-string + inventory eq_*) -> instance.
//   Giữ NGUYÊN stat/phẩm catalog (instanceFromCatalog) để người đang chơi không đổi sức mạnh. plus lấy từ state.enhance cũ.
for (const slot in state.equipment) {
  const v = state.equipment[slot];
  if (typeof v === 'string') {
    state.equipment[slot] = instanceFromCatalog(v, (state.enhance && state.enhance[v]) || 0) || null;
  }
}
for (const id of Object.keys(state.inventory)) {
  if (ITEMS[id] && ITEMS[id].equip) {   // mọi món equippable (eq_* + legacy tichSao/thietKiem/tichGiap) -> instance
    const qty = state.inventory[id] || 0;
    for (let i = 0; i < qty; i++) { const inst = instanceFromCatalog(id, 0); if (inst) state.gearBag.push(inst); }
    delete state.inventory[id];
  }
}
if (!state.login) state.login = { lastDay: null, streak: 0 };
if (!state.counters) state.counters = { produced: {}, kills: {} };
ensureCodex(state); // Vạn Vật Phổ: khởi tạo + backfill tiến độ đã chơi (kills/obtained/pets/dungeon)
if (!state.quests) state.quests = { tutorial: { index: 0, base: 0 }, daily: { period: null, list: [] }, weekly: { period: null, list: [] }, monthly: { period: null, list: [] } };
if (!state.quests.tutorial) state.quests.tutorial = { index: 0, base: 0 };
if (!state.quests.daily) state.quests.daily = { period: null, list: [] };
if (!state.quests.weekly) state.quests.weekly = { period: null, list: [] };
if (!state.quests.monthly) state.quests.monthly = { period: null, list: [] };
if (!state.linhThach) state.linhThach = {};
if (!state.combat) state.combat = { sinhLuc: null, noiThuong: false, suyYeuUntil: 0, loadout: { tamPhap: 'viemDuong', boPhap: ['tanToc'], chieu: ['lhd', 'htd', 'ptd'] } };
if (state.combat.petHp === undefined) { state.combat.petHp = null; state.combat.petFainted = false; } // Linh Thú P4: HP pet + ngất (per phiên)
if (!state.combat.loadout) state.combat.loadout = { tamPhap: 'viemDuong', boPhap: ['tanToc'], chieu: ['lhd', 'htd', 'ptd'] };
if (typeof state.combat.loadout.boPhap === 'string') state.combat.loadout.boPhap = [state.combat.loadout.boPhap]; // cũ: 1 chuỗi -> mảng
if (!Array.isArray(state.combat.loadout.boPhap) || !state.combat.loadout.boPhap.length) state.combat.loadout.boPhap = ['tanToc'];
// Tâm Pháp (Bước 4): trường mới — đổi được, mặc định Viêm Dương (Hỏa)
if (!state.combat.loadout.tamPhap || !TAM_PHAP_POOL.some((t) => t.id === state.combat.loadout.tamPhap)) state.combat.loadout.tamPhap = 'viemDuong';
// Bị Động: pool chọn tối đa 2 — trường mới, mặc định +ST Hỏa + hồi máu
if (!Array.isArray(state.combat.loadout.biDong)) state.combat.loadout.biDong = ['viemDuongHoThe', 'sinhSinhBatTuc'];
state.combat.loadout.biDong = normBiDong(state.combat.loadout);
// Số ô chiêu mở theo Chiến Đấu Lv (4 ô gồm Tâm Pháp, +1 mỗi 30 cấp) — clamp loadout cũ (có thể 4 chiêu) xuống số ô hiện có
if (!Array.isArray(state.combat.loadout.chieu)) state.combat.loadout.chieu = ['lhd', 'htd', 'ptd']; // guard save hỏng/thiếu -> tránh crash combat (chosen.map)
if (Array.isArray(state.combat.loadout.chieu)) {
  const _cl = levelFromXp(state.skills?.chienDau?.xp || 0);
  state.combat.loadout.chieu = state.combat.loadout.chieu.slice(0, maxChieuSlots(_cl));
}
// Sở hữu võ học (Bước 6): trường mới — vá save cũ bằng cách cấp sở hữu cho mọi thứ ĐANG lắp + bộ nhập môn.
state.combat.owned = normOwned(state.combat);
if (state.combat.suyYeuUntil == null) state.combat.suyYeuUntil = 0;
// Ô Món Ăn + Ô Đan (tự dùng khi < 25%) — trường mới, vá save cũ
if (state.combat.luongThuc === undefined) state.combat.luongThuc = null;
if (state.combat.dan === undefined) state.combat.dan = null;
if (state.combat.noiLuc === undefined) state.combat.noiLuc = null;
// Combat đang chạy dở từ save cũ: ép cadence về vòng 8s (trước đây = timePerKill nhảy theo giây)
if (state.activity && state.activity.type === 'combat') state.activity.cycleMs = COMBAT_CYCLE_MS;
if (!state.player || typeof state.player !== 'object') state.player = { name: '', gender: null, class: null, professions: [], doPho: {}, cover: { x: 50, y: 50, z: 1 }, face: { x: 50, y: 50, z: 1 }, created: false, location: 'lamLinhCoc' }; // guard save hỏng/thiếu player -> tránh crash đọc player.*
if (!state.player.location) state.player.location = 'lamLinhCoc';
if (typeof state.player.bio !== 'string') state.player.bio = ''; // tiểu sử (≤250 ký tự)
if (state.player.gender === undefined) state.player.gender = null; // giang hồ tự do: chỉ Nam/Nữ
state.player.class = null; // bỏ class — giang hồ tự do
if (!Array.isArray(state.player.professions)) state.player.professions = []; // Nghề đã học (bái sư)
if (Array.isArray(state.player.doPho)) { const _m = {}; state.player.doPho.forEach((gid) => { _m[gid] = 99; }); state.player.doPho = _m; } // save cũ (mảng = unlock VĨNH VIỄN) -> cấp 99 lượt rèn, không thiệt người chơi cũ
if (!state.player.doPho || typeof state.player.doPho !== 'object') state.player.doPho = {}; // Đồ Phổ: { gearId: số lượt rèn còn lại } (mỗi lượt rèn 1 món)
if (!state.player.cover) state.player.cover = { x: 50, y: 50, z: 1 };
if (!state.player.face) state.player.face = { x: 50, y: 50, z: 1 };
if (state.player.fxVer !== 3) { state.player.cover = { x: 50, y: 50, z: 1 }; state.player.face = { x: 50, y: 50, z: 1 }; state.player.fxVer = 3; } // đổi hệ khung -> background-position
if (!Array.isArray(state.player.ownedAvatars)) state.player.ownedAvatars = []; // Ảnh Đại Diện đã mua (Thương Điếm); free = ảnh theo giới tính
if (!Array.isArray(state.player.ownedCovers)) state.player.ownedCovers = [];   // Ảnh Bìa đã mua
if (state.player.avatar && !state.player.ownedAvatars.includes(state.player.avatar)) state.player.ownedAvatars.push(state.player.avatar); // giữ ảnh đang dùng của save cũ
if (state.player.coverImg && !state.player.ownedCovers.includes(state.player.coverImg)) state.player.ownedCovers.push(state.player.coverImg);
if (state.travel) state.travel = null; // bỏ field cũ (Khinh Công giờ là activity 'travel')
if (!state.dungeon) state.dungeon = { lastResult: null, history: [] }; // Bí Cảnh: kết quả lần chạy gần nhất + lịch sử
if (!Array.isArray(state.notifications)) state.notifications = []; // Thông Báo (feed chung: chuông + Phi Cáp Đài)
if (!Array.isArray(state.pets)) state.pets = []; // Linh Thú (pet) — nở từ trứng
if (state.hatchery === undefined) state.hatchery = null; // Lò Ấp Noãn (P3, đơn): {pet,base,eggId,eggQuality,startedAt,readyAt,durMs,notified} | null
// Tháo trang bị VƯỢT CẤP (combatLevel tụt do dev/sửa save) -> trả về túi, không cho hưởng chỉ số lậu
(() => {
  const _cl = levelFromXp(state.skills?.chienDau?.xp || 0);
  for (const slot in (state.equipment || {})) {
    const inst = state.equipment[slot]; if (!inst) continue;
    const e = (ITEMS[inst.gearId] || {}).equip;
    const lvl = (e && e.gatherSkill) ? levelFromXp(state.skills?.[e.gatherSkill]?.xp || 0) : _cl; // công cụ: cấp NGHỀ
    const req = inst.reqLevel || (e && e.reqLevel) || 0;
    if (req > 1 && lvl < req) { state.gearBag.push(inst); state.equipment[slot] = null; }   // trả instance về túi
  }
})();
if (state.dungeon.lastResult && !state.dungeon.lastResult.log) state.dungeon.lastResult = null; // bỏ kết quả format cũ (thiếu log) -> không bật modal rỗng
if (Array.isArray(state.dungeon.history)) state.dungeon.history = state.dungeon.history.filter((h) => h && h.log); // bỏ entry lịch sử cũ thiếu chi tiết
let offlineReport = null;
if (state.activity) {
  const r = advance(state, now());
  if (r && r.cycles > 0) offlineReport = { itemId: r.itemId, cycles: r.cycles, xp: r.xp };
  if (r && r.cycles > 0 && r.itemId) { const _it = ITEMS[r.itemId]; pushNotif(state, 'thuThap', 'Thu thập hoàn tất', '+' + r.cycles + ' ' + (_it ? _it.name : r.itemId) + ' · +' + r.xp + ' EXP (trong lúc vắng mặt)', now()); }
}
// Lò Ấp Noãn: trứng nở xong trong lúc vắng mặt -> báo 1 lần (chờ khai noãn).
if (state.hatchery && now() >= state.hatchery.readyAt && !state.hatchery.notified) {
  state.hatchery.notified = true;
  const _sp = PET_SPECIES[state.hatchery.base];
  pushNotif(state, 'linhThu', 'Noãn đã nở', (_sp ? _sp.name : 'Linh thú') + ' phá vỏ — vào Linh Thú khai noãn.', now());
}

// ---- Helper định dạng ----
function fmt(n) {
  n = Math.floor(n || 0);
  const neg = n < 0;
  // Số đầy đủ, tách hàng nghìn bằng dấu chấm (kiểu Việt Nam): 1250000 -> "1.250.000"
  const s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return neg ? '-' + s : s;
}
// Rút gọn cho chỗ chật (header tiền tệ) — HỆ ĐẾM HÁN: <1 Vạn giữ nguyên; rồi Vạn(10^4)/Ức(10^8)/Triệu(10^12).
// Vd: 9999->"9.999" · 50000->"5Vạn" · 1150000->"115Vạn" · 2.5e8->"2,5Ức" · 5e12->"5Triệu".
function fmtC(n) {
  n = Math.floor(n || 0);
  const neg = n < 0, a = Math.abs(n);
  const trim = x => (x < 100 ? (Math.round(x * 10) / 10).toString().replace('.', ',') : Math.round(x).toString());
  let out;
  if (a < 1e4) out = fmt(a);
  else if (a < 1e8) out = trim(a / 1e4) + 'Vạn';
  else if (a < 1e12) out = trim(a / 1e8) + 'Ức';
  else out = trim(a / 1e12) + 'Triệu';
  return neg ? '-' + out : out;
}
function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}
function fmtClock(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const p = (x) => String(x).padStart(2, '0');
  return `${p(h)}:${p(m)}:${p(s)}`;
}

// ---- groupsOpen mặc định: mở hết ----
const groupsOpen = {};
NAV.forEach((g) => { groupsOpen[g.title] = true; });

// ---- Bản đồ icon: id -> thư mục ảnh (ico() tự tìm đúng folder, không cần sửa chỗ gọi) ----
const ICON_FOLDERS = {};
Object.keys(ITEMS).forEach((id) => { ICON_FOLDERS[id] = 'items'; });
Object.keys(SKILLS).forEach((id) => { ICON_FOLDERS[id] = 'skills'; });
Object.keys(ENEMIES).forEach((id) => { ICON_FOLDERS[id] = 'enemies'; });
Object.keys(CLASSES).forEach((id) => { ICON_FOLDERS[id] = 'classes'; });
NGHE.forEach((n) => { ICON_FOLDERS[n.id] = 'nghe'; }); // nghề: images/nghe/<id>.png (ghi đè id trùng class)
Object.keys(STATS).forEach((id) => { ICON_FOLDERS[id] = 'stats'; });
LOCATIONS.forEach((l) => { ICON_FOLDERS[l.id] = 'locations'; });
REALM_TIERS.forEach((t) => { ICON_FOLDERS[t.id] = 'tiers'; });
NAV.forEach((g) => (g.items || []).forEach((it) => { ICON_FOLDERS[it.view] = 'nav'; }));
ICON_FOLDERS['phongVanBang'] = 'ui';   // GHI ĐÈ SAU NAV: icon BXH ở images/ui/phongVanBang.webp (cùng chỗ banner)
['bac', 'honThach', 'nguyenBao'].forEach((id) => { ICON_FOLDERS[id] = 'currency'; });
if (MERCHANT && MERCHANT.id) ICON_FOLDERS[MERCHANT.id] = 'npc';
// Trang bị thật (id bắt đầu 'eq_') -> art ở images/equip/<id>.png (tách khỏi vật phẩm thường).
Object.keys(ITEMS).forEach((id) => { if (id.startsWith('eq_')) ICON_FOLDERS[id] = 'equip'; });
DUNGEONS.forEach((d) => { ICON_FOLDERS[d.id] = 'dungeons'; }); // art phó bản Bí Cảnh: images/dungeons/<id>.png

let resetting = false; // chặn beforeunload lưu lại khi đang reset

// ---- Icon đường nét (SVG, đồng bộ chủ đề; thay emoji "rác" của hệ thống) ----
const SVG_PATHS = {
  pin:    '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  heart:  '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.49 4.04 3 5.5l7 7z"/>',
  zap:    '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  map:    '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14"/><path d="M15 6v14"/>',
  bag:    '<path d="M6 2 3 6.5V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.5L18 2z"/><path d="M3 6.5h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  collect:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
  sword:  '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/>',
  scope:  '<circle cx="12" cy="12" r="9"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/><circle cx="12" cy="12" r="2"/>',
  clock:  '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  crack:  '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.49 4.04 3 5.5l7 7z"/><path d="M12 5 9.5 9.5l3 2.5-2 4"/>',
  scroll: '<path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8 12.5h8"/><path d="M8 16.5h6"/>',
  steps:  '<path d="M4 16v-2.4C4 11.5 3 10.5 3 8c0-2.7 1.5-6 4.5-6C9.4 2 10 3.8 10 5.5c0 3.1-2 5.7-2 8.7V16a2 2 0 1 1-4 0z"/><path d="M20 20v-2.4c0-2.1 1-3.1 1-5.6 0-2.7-1.5-6-4.5-6C14.6 6 14 7.8 14 9.5c0 3.1 2 5.7 2 8.7V20a2 2 0 1 0 4 0z"/>',
  home:   '<path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
  // Biểu trưng từng Bộ Pháp
  shield: '<path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5z"/>',
  flame:  '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  wind:   '<path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/><path d="M17.7 7.7A2.5 2.5 0 1 1 19.5 12H2"/>',
  scales: '<path d="M12 3v18"/><path d="M5 7h14"/><path d="M5 7l-3 6a3 3 0 0 0 6 0z"/><path d="M19 7l-3 6a3 3 0 0 0 6 0z"/><path d="M8 21h8"/>',
  inbox:  '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  gate:   '<path d="M3 21V9l9-5 9 5v12"/><path d="M3 9h18"/><path d="M8 21v-6a4 4 0 0 1 8 0v6"/>',
  bulb:   '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.5.5 1 1.5 1 2.5h6c0-1 .5-2 1-2.5A6 6 0 0 0 12 3z"/>',
  star:   '<path d="M12 2.5l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.2 5.8 20.8l1.6-6.8L2.2 9.4l6.9-.6z"/>',
  coin:   '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/>',
  trend:  '<path d="M3 17l6-6 4 4 7-7"/><path d="M14 7h7v7"/>',
  chevR:  '<path d="M9 6l6 6-6 6"/>',
  // Ngũ hành (line-icon tối giản)
  kim:    '<path d="M12 2l9 7-9 13L3 9z"/><path d="M3 9h18"/>',
  moc:    '<path d="M12 21V9"/><path d="M12 9C12 5 9 3 5 3c0 4 3 6 7 6z"/><path d="M12 12c0-3 3-5 7-5 0 4-3 5-7 5z"/>',
  thuy:   '<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>',
  tho:    '<path d="M3 20h18"/><path d="M5 20l5-9 3 5 2-3 4 7z"/>',
  lock:   '<rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  book:   '<path d="M4 4.5A2 2 0 0 1 6 3h13v16H6a2 2 0 0 0-2 2z"/><path d="M19 19H6a2 2 0 0 0-2 2"/>',
  gem:    '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20"/><path d="M9 3 6 9l6 12 6-12-3-6"/>',
  info:   '<circle cx="12" cy="12" r="9"/><path d="M12 11.5v5"/><path d="M12 8h.01"/>',
  // Lịch: Ngày (1 chấm) · Tuần (1 hàng) · Tháng (lưới chấm) — line-icon đồng bộ với nav
  calDay:   '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M12 14.5h.01"/>',
  calWeek:  '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M7 14.5h10"/>',
  calMonth: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M7.5 13h.01M12 13h.01M16.5 13h.01M7.5 16.5h.01M12 16.5h.01M16.5 16.5h.01"/>',
};

// ---- Store game ----
const gameStore = {
  state,
  SKILLS, STATS, ITEMS, QUALITY, ITEM_TYPES, LOCATIONS, REALM_TIERS, AVATARS, COVERS, LOGIN_REWARDS, TUTORIAL_QUESTS, DAILY_QUESTS, NAV,
  EQUIP_SLOTS, TOOL_SLOTS, SECONDARY_STATS, CLASSES, CLASS_GROUPS, NGHE, ENEMIES, STANCES, MERCHANT, SHOP_MAT, SHOP_FOOD, SHOP_BAIT, AVATAR_PRICE, COVER_PRICE, LINH_THACH,
  CHIEU, BO_PHAP, BI_DONG, TAM_PHAP, TAM_PHAP_POOL, NGU_HANH, MON_PHAI, DUNGEONS, DUNGEON_BY_ID,
  view: 'profile',
  profileTab: 'profile',
  codexTab: 'yeuthu', codexDetail: null,   // Vạn Vật Phổ
  confirmReset: false,
  lightbox: null,
  toast: '',
  _toastId: 0,
  settingsModal: false,
  navOpen: false,           // ngăn kéo sidebar (drawer) trên mobile/màn hẹp
  dailyModal: false,
  devPanel: false,
  devAuthed: false, devLoginOpen: false, devPass: '', devLoginErr: '', devTab: 'char',   // cổng đăng nhập F9 (theo phiên — reload phải đăng nhập lại)
  // Tài khoản / Cloud (Supabase Auth — Giai đoạn B). Offline-first: KHÔNG đăng nhập vẫn chơi.
  authUser: null, authOpen: false, authMode: 'login', authEmail: '', authPass: '', authErr: '', authMsg: '', authBusy: false,
  // Cloud save (Giai đoạn C) — đồng bộ save ↔ Supabase. cloudConflict = { cloud, local, _cloudData } khi 2 bản lệch.
  cloudSyncing: false, cloudLastSync: 0, cloudErr: '', cloudConflict: null, _cloudLastPushed: -1,
  devLvInput: 50,
  devItemSel: null,
  selectedSkill: 'phatMoc',
  draftName: '',
  draftGender: null,
  draftTamPhap: null,        // Tâm Pháp khởi tu (chọn lúc tạo nhân vật) — quyết định hệ ngũ hành khởi đầu
  groupsOpen,
  offlineReport,
  fmt, fmtC, fmtTime, fmtClock,

  // ---------- Điều hướng ----------
  navTo(view) { this.view = view; this.navOpen = false; if (view === 'nhiemVu') this.ensureQuests(); if (view === 'combat' || view === 'worldboss') this.ensureCombat(); if (view === 'dungeon') this.ensureDungeon(); document.getElementById('mainPane')?.scrollTo({ top: 0 }); },
  navToSkill(id) { this.view = 'skill'; this.navOpen = false; this.selectedSkill = id; const _s = this.skillSubTabsFor(id); if (_s) this.skillTab = _s[0].k; document.getElementById('mainPane')?.scrollTo({ top: 0 }); },
  // Bấm chip hoạt động ở header -> nhảy vào đúng màn của hoạt động đang chạy
  goToActivity() {
    const a = this.state.activity; if (!a) return;
    if (a.type === 'combat') this.navTo('combat');
    else if (a.type === 'dungeon') this.navTo('dungeon');
    else if (a.type === 'travel') this.navTo('map');
    else if (a.skillId) this.navToSkill(a.skillId);
  },
  toggleGroup(title) { this.groupsOpen[title] = !this.groupsOpen[title]; },
  selectSkill(id) { this.selectedSkill = id; },
  setProfileTab(t) { this.profileTab = t; },
  openLightbox(id, emoji, name) { this.lightbox = { id, emoji, name }; },
  closeLightbox() { this.lightbox = null; },
  // Toast nổi (tự ẩn sau 2.5s) — tái dùng cho mọi thông báo nhanh
  showToast(msg) {
    this.toast = msg;
    const id = ++this._toastId;
    setTimeout(() => { if (this._toastId === id) this.toast = ''; }, 2500);
  },
  openSettings() { this.settingsModal = true; },
  closeSettings() { this.settingsModal = false; },
  // ---------- Tài khoản / Cloud (Supabase Auth) ----------
  get isLoggedIn() { return !!this.authUser; },
  get authUserEmail() { return (this.authUser && this.authUser.email) || ''; },
  // Khởi động: khôi phục phiên đã lưu + lắng nghe đổi trạng thái. Bọc try/catch để offline/CDN lỗi KHÔNG vỡ game.
  async initCloud() {
    try {
      this.authUser = await cloudGetUser();
      await cloudOnAuth((user) => { this.authUser = user; });
      if (this.authUser) this.cloudSyncOnLogin();   // đã đăng nhập sẵn (reload) -> kéo/so cloud
    } catch (e) { /* không kết nối được cloud — bỏ qua, game vẫn chạy offline */ }
  },
  openAuth() { this.authErr = ''; this.authMsg = ''; this.authPass = ''; this.authOpen = true; },
  closeAuth() { this.authOpen = false; this.authErr = ''; this.authMsg = ''; this.authPass = ''; },
  setAuthMode(m) { this.authMode = m; this.authErr = ''; this.authMsg = ''; },
  async doAuth() {
    const email = (this.authEmail || '').trim();
    const pass = this.authPass || '';
    this.authErr = ''; this.authMsg = '';
    if (!email || !pass) { this.authErr = 'Nhập email và mật khẩu.'; return; }
    if (this.authMode === 'register' && pass.length < 6) { this.authErr = 'Mật khẩu tối thiểu 6 ký tự.'; return; }
    this.authBusy = true;
    try {
      if (this.authMode === 'register') {
        const { data, error } = await cloudSignUp(email, pass);
        if (error) { this.authErr = authErrVi(error.message); return; }
        if (data && data.session) { this.authUser = data.user; this.closeAuth(); this.showToast('Đã tạo tài khoản & đăng nhập.'); this.cloudSyncOnLogin(); }
        else { this.authMsg = 'Đã gửi email xác nhận. Mở hộp thư bấm xác nhận rồi đăng nhập.'; this.authMode = 'login'; this.authPass = ''; }
      } else {
        const { data, error } = await cloudSignIn(email, pass);
        if (error) { this.authErr = authErrVi(error.message); return; }
        this.authUser = data.user; this.closeAuth(); this.showToast('Đăng nhập thành công.'); this.cloudSyncOnLogin();
      }
    } catch (e) {
      this.authErr = 'Không kết nối được máy chủ (kiểm tra mạng) — thử lại.';
    } finally {
      this.authBusy = false; this.authPass = '';
    }
  },
  async doSignOut() {
    if (this.isLoggedIn) { try { await this._cloudPushNow(); } catch (e) { /* best-effort lưu bản chót */ } }
    try { await cloudSignOut(); } catch (e) { /* vẫn xoá phiên ở client */ }
    this.authUser = null; this.cloudConflict = null; this.cloudErr = ''; this.cloudLastSync = 0; this._cloudLastPushed = -1;
    this.showToast('Đã đăng xuất.');
  },
  // ---------- Cloud save (đồng bộ save ↔ Supabase) ----------
  // Tóm tắt 1 save (để so sánh khi xung đột). combatLv tự tính từ xp -> không phụ thuộc state đang chạy.
  saveSummary(st) {
    return {
      name: (st && st.player && st.player.name) || '',
      created: !!(st && st.player && st.player.created),
      combatLv: levelFromXp((st && st.skills && st.skills.chienDau && st.skills.chienDau.xp) || 0),
      lastSave: (st && st.lastSave) || 0,
    };
  },
  saveTimeText(ts) { return ts ? new Date(ts).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'chưa lưu'; },
  get cloudLastSyncText() {
    if (this.cloudSyncing) return 'đang đồng bộ…';
    if (!this.cloudLastSync) return 'chưa đồng bộ';
    return 'đồng bộ lúc ' + new Date(this.cloudLastSync).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  },
  // Đẩy state hiện tại lên cloud (đảm bảo đã lưu localStorage trước để lastSave mới nhất).
  async _cloudPushNow() {
    if (!this.isLoggedIn) return false;
    this.cloudSyncing = true;
    try {
      const r = await cloudPushSave(this.state);
      if (r.ok) { this._cloudLastPushed = this.state.lastSave || 0; this.cloudLastSync = now(); this.cloudErr = ''; return true; }
      this.cloudErr = cloudErrVi(r.reason); return false;
    } catch (e) { this.cloudErr = 'Không kết nối cloud.'; return false; }
    finally { this.cloudSyncing = false; }
  },
  // Ghi đè localStorage bằng bản cloud rồi tải lại trang (nạp sạch state mới).
  _applyCloudSave(cloudData) {
    Storage.lock();   // chặn autosave RAM cũ ghi đè trong lúc chờ reload
    try { localStorage.setItem('tieudao_save_v1', JSON.stringify(cloudData)); } catch (e) {}
    this._cloudLastPushed = (cloudData && cloudData.lastSave) || 0;
    this.showToast('Đã tải tiến trình từ cloud.');
    setTimeout(() => location.reload(), 700);
  },
  // Lúc đăng nhập / khôi phục phiên: so cloud với local rồi quyết định.
  async cloudSyncOnLogin() {
    if (!this.isLoggedIn) return;
    this.cloudErr = '';
    let res;
    try { res = await cloudLoadSave(); } catch (e) { this.cloudErr = 'Không tải được dữ liệu cloud.'; return; }
    if (!res.ok) { if (res.reason !== 'no-auth') this.cloudErr = cloudErrVi(res.reason); return; }
    const row = res.row;
    if (!row) { await this._cloudPushNow(); return; }            // cloud trống -> đẩy local lên
    const tCloud = row.last_save || 0;
    const tLocal = _loadedLastSave;                              // mốc trên ĐĨA lúc nạp (không bị autosave bump)
    if (tCloud <= tLocal) { await this._cloudPushNow(); return; } // đĩa local mới hơn/bằng cloud -> đẩy local (cùng máy)
    // cloud MỚI HƠN bản trên đĩa máy này:
    if (!this.state.player || !this.state.player.created) { this._applyCloudSave(row.data); return; } // máy này mới tinh -> lấy cloud
    const localSum = this.saveSummary(this.state); localSum.lastSave = tLocal || localSum.lastSave;   // mốc hiển thị = lúc nạp
    this.cloudConflict = { cloud: this.saveSummary(row.data), local: localSum, _cloudData: row.data }; // lệch -> hỏi người chơi
  },
  useCloudSave() { const c = this.cloudConflict; if (!c) return; this.cloudConflict = null; this._applyCloudSave(c._cloudData); },
  useLocalSave() { this.cloudConflict = null; this._cloudPushNow().then((ok) => this.showToast(ok ? 'Đã giữ bản máy này.' : (this.cloudErr || 'Đồng bộ lỗi.'))); },
  async cloudSyncNow() { if (!this.isLoggedIn) return; const ok = await this._cloudPushNow(); this.showToast(ok ? 'Đã đồng bộ lên cloud.' : (this.cloudErr || 'Đồng bộ lỗi.')); },
  // Gọi định kỳ (mỗi 15s) + lúc rời trang: đẩy nếu save đã đổi so với lần đẩy trước.
  cloudAutoPushTick() {
    if (!this.isLoggedIn || this.cloudSyncing || this.cloudConflict) return;
    const ls = this.state.lastSave || 0;
    if (ls > this._cloudLastPushed) this._cloudPushNow();
  },
  // ---------- Tiểu Sử (≤250 ký tự) ----------
  bioModal: false,
  bioDraft: '',
  get playerBio() { return this.state.player.bio || ''; },
  openBioEdit() { this.bioDraft = this.state.player.bio || ''; this.bioModal = true; },
  closeBioEdit() { this.bioModal = false; },
  saveBio() { this.state.player.bio = (this.bioDraft || '').slice(0, 250); this.bioModal = false; Storage.save(this.state); this.showToast('Đã lưu tiểu sử.'); },
  // ---------- Điểm Danh ----------
  openDaily() { this.dailyModal = true; },
  get canClaimDaily() { return this.state.login.lastDay !== todayStr(); },
  get loginStreak() { return this.state.login.streak || 0; },
  get loginNextIndex() {
    const prev = this.state.login.streak || 0;
    const cyc = this.LOGIN_REWARDS.length;
    if (!this.canClaimDaily) return (Math.max(1, prev) - 1) % cyc;
    const consecutive = this.state.login.lastDay === yestStr();
    const newStreak = consecutive ? prev + 1 : 1;
    return (newStreak - 1) % cyc;
  },
  claimDaily() {
    if (!this.canClaimDaily) return;
    const consecutive = this.state.login.lastDay === yestStr();
    const newStreak = consecutive ? (this.state.login.streak || 0) + 1 : 1;
    const r = this.LOGIN_REWARDS[(newStreak - 1) % this.LOGIN_REWARDS.length] || {};
    if (r.bac) this.state.currencies.bac = (this.state.currencies.bac || 0) + r.bac;
    if (r.honThach) this.state.currencies.honThach = (this.state.currencies.honThach || 0) + r.honThach;
    if (r.nguyenBao) this.state.currencies.nguyenBao = (this.state.currencies.nguyenBao || 0) + r.nguyenBao;
    this.state.login.lastDay = todayStr();
    this.state.login.streak = newStreak;
    Storage.save(this.state);
  },

  // ---------- Nhiệm Vụ ----------
  counterValue(q) {
    if (!q) return 0;
    return q.type === 'kill' ? (this.state.counters.kills[q.target] || 0) : (this.state.counters.produced[q.target] || 0);
  },
  grantReward(r) {
    if (!r) return;
    if (r.bac) this.state.currencies.bac = (this.state.currencies.bac || 0) + r.bac;
    if (r.honThach) this.state.currencies.honThach = (this.state.currencies.honThach || 0) + r.honThach;
    if (r.nguyenBao) this.state.currencies.nguyenBao = (this.state.currencies.nguyenBao || 0) + r.nguyenBao;
    if (r.eggPham) {   // Trứng Linh Thú phẩm Thường — NGẪU NHIÊN loài (vốn khởi đầu cho người chơi mới)
      const eggs = Object.keys(this.ITEMS).filter((id) => id.startsWith('egg_') && id.endsWith('_pham'));
      if (eggs.length) {
        const id = eggs[Math.floor(Math.random() * eggs.length)];
        addItem(this.state, id, r.eggPham);
        this.showToast('🥚 Nhận ' + ((this.ITEMS[id] || {}).name || 'Trứng Linh Thú') + ' — ấp nở ở Lò Ấp Noãn (tab Linh Thú).');
      }
    }
  },
  rewardText(r) {
    if (!r) return '';
    const p = [];
    if (r.bac) p.push(this.fmt(r.bac) + ' Bạc');
    if (r.honThach) p.push(r.honThach + ' Hồn Thạch');
    if (r.nguyenBao) p.push(r.nguyenBao + ' Nguyên Bảo');
    if (r.eggPham) p.push((r.eggPham > 1 ? r.eggPham + ' ' : '') + 'Trứng Linh Thú · Thường');
    return p.join(' · ');
  },
  questEmoji(q) {
    if (!q) return '📜';
    if (q.type === 'kill') return (this.ENEMIES[q.target] && this.ENEMIES[q.target].icon) || '⚔️';
    return (this.ITEMS[q.target] && this.ITEMS[q.target].icon) || '📦';
  },
  rewardChips(r) {
    if (!r) return [];
    const c = [];
    if (r.bac) c.push({ id: 'bac', amt: r.bac, cls: 'text-gold', emoji: '🟡' });
    if (r.honThach) c.push({ id: 'honThach', amt: r.honThach, cls: 'text-rose-300', emoji: '🔴' });
    if (r.nguyenBao) c.push({ id: 'nguyenBao', amt: r.nguyenBao, cls: 'text-cyan', emoji: '🔷' });
    if (r.eggPham) c.push({ id: 'egg', amt: r.eggPham, cls: 'text-emerald-300', emoji: '🥚' });
    return c;
  },
  // -- Tân thủ --
  get tutAllDone() { return this.state.quests.tutorial.index >= this.TUTORIAL_QUESTS.length; },
  get tutQuest() { return this.TUTORIAL_QUESTS[this.state.quests.tutorial.index] || null; },
  get tutProgress() {
    const q = this.tutQuest; if (!q) return 0;
    return Math.min(q.count, Math.max(0, this.counterValue(q) - this.state.quests.tutorial.base));
  },
  get tutDone() { const q = this.tutQuest; return !!q && this.tutProgress >= q.count; },
  claimTutorial() {
    if (!this.tutDone) return;
    this.grantReward(this.tutQuest.reward);
    this.state.quests.tutorial.index += 1;
    const next = this.TUTORIAL_QUESTS[this.state.quests.tutorial.index];
    this.state.quests.tutorial.base = next ? this.counterValue(next) : 0;
    Storage.save(this.state);
  },
  // -- Nhiệm vụ theo KỲ (Ngày / Tuần / Tháng) — dùng chung 1 cơ chế --
  periodConfig: {
    daily:   { pool: DAILY_QUESTS,   count: 7, period: () => todayStr() },
    weekly:  { pool: WEEKLY_QUESTS,  count: 7, period: () => weekStr() },
    monthly: { pool: MONTHLY_QUESTS, count: 7, period: () => monthStr() },
  },
  // Đảm bảo danh sách nhiệm vụ của 1 kỳ đúng với kỳ hiện tại; sang kỳ mới thì bốc lại + reset.
  questUnlocked(q) {   // chỉ bốc nhiệm vụ người chơi đủ sức (mục tiêu đã mở theo cấp) -> khó dần + đa dạng theo tiến trình
    const req = q.req || 1;
    return q.type === 'kill' ? this.combatLevel >= req : this.skillLevel(q.skill) >= req;
  },
  ensurePeriodQuests(kind) {
    const cfg = this.periodConfig[kind];
    if (!cfg) return;
    const cur = cfg.period();
    if (!this.state.quests[kind]) this.state.quests[kind] = { period: null, list: [] };
    const st = this.state.quests[kind];
    const want = Math.min(cfg.count, cfg.pool.length);
    // Còn hạn + đủ số + mọi id còn trong pool (đổi data cũ -> bốc lại) thì giữ.
    if (st.period === cur && st.list && st.list.length === want && st.list.every((e) => cfg.pool.some((q) => q.id === e.id))) return;
    // Lọc mục tiêu đủ cấp; thiếu thì lùi về cả pool (người mới vẫn đủ 7 cái).
    const elig = cfg.pool.filter((q) => this.questUnlocked(q));
    const usable = elig.length >= want ? elig : cfg.pool;
    // Bốc ngẫu nhiên `want` cái rồi xếp lại theo thứ tự gốc cho ổn định.
    const idx = usable.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const chosen = idx.slice(0, want).sort((a, b) => a - b);
    st.period = cur;
    st.list = chosen.map((i) => ({ id: usable[i].id, base: this.counterValue(usable[i]), claimed: false }));
    Storage.save(this.state);
  },
  ensureQuests() { this.ensurePeriodQuests('daily'); this.ensurePeriodQuests('weekly'); this.ensurePeriodQuests('monthly'); },
  periodDef(kind, id) { const cfg = this.periodConfig[kind]; return cfg ? (cfg.pool.find((q) => q.id === id) || null) : null; },
  periodList(kind) { return (this.state.quests[kind] && this.state.quests[kind].list) || []; },
  periodProgress(kind, entry) {
    const q = this.periodDef(kind, entry.id); if (!q) return 0;
    return Math.min(q.count, Math.max(0, this.counterValue(q) - entry.base));
  },
  periodDone(kind, entry) {
    const q = this.periodDef(kind, entry.id);
    return !!q && this.periodProgress(kind, entry) >= q.count;
  },
  claimPeriodQuest(kind, i) {
    const entry = this.state.quests[kind] && this.state.quests[kind].list[i];
    if (!entry || entry.claimed || !this.periodDone(kind, entry)) return;
    this.grantReward(this.periodDef(kind, entry.id).reward);
    entry.claimed = true;
    Storage.save(this.state);
  },
  periodClaimable(kind) { return this.periodList(kind).filter((e) => this.periodDone(kind, e) && !e.claimed).length; },

  // -- Tab Nhiệm vụ (UI): Ngày / Tuần / Tháng --
  QUEST_TABS: [
    { kind: 'daily',   icon: 'calDay',   label: 'Ngày',  active: 'text-amber-300',  bar: 'bg-amber-400',  fill: 'bg-amber-400',  info: 'Làm mới 00:00 mỗi ngày' },
    { kind: 'weekly',  icon: 'calWeek',  label: 'Tuần',  active: 'text-sky-300',    bar: 'bg-sky-400',    fill: 'bg-sky-400',    info: 'Làm mới 00:00 Thứ Hai hằng tuần' },
    { kind: 'monthly', icon: 'calMonth', label: 'Tháng', active: 'text-violet-300', bar: 'bg-violet-400', fill: 'bg-violet-400', info: 'Làm mới 00:00 ngày 1 mỗi tháng' },
  ],
  questTab: 'daily',
  setQuestTab(t) { this.questTab = t; },
  // Mốc reset kế tiếp (giờ địa phương): ngày = nửa đêm mai · tuần = 00:00 Thứ Hai tới · tháng = 00:00 ngày 1 tháng sau.
  nextResetMs(kind) {
    const d = new Date();
    if (kind === 'weekly') { const dow = (d.getDay() + 6) % 7; return new Date(d.getFullYear(), d.getMonth(), d.getDate() + (7 - dow)).getTime(); }
    if (kind === 'monthly') { return new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime(); }
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
  },
  resetCountdown(kind) {
    void this._tick;
    let s = Math.max(0, Math.floor((this.nextResetMs(kind) - now()) / 1000));
    const dd = Math.floor(s / 86400); s -= dd * 86400;
    const hh = Math.floor(s / 3600); s -= hh * 3600;
    const mm = Math.floor(s / 60);
    if (dd > 0) return dd + ' ngày ' + hh + ' giờ';
    if (hh > 0) return hh + ' giờ ' + mm + ' phút';
    return mm + ' phút';
  },
  get questTabMeta() { return this.QUEST_TABS.find((t) => t.kind === this.questTab) || this.QUEST_TABS[0]; },
  // Tiện cho UI (tự quy về tab đang chọn)
  get qList() { return this.periodList(this.questTab); },
  qDef(entry) { return this.periodDef(this.questTab, entry.id); },
  qProgress(entry) { return this.periodProgress(this.questTab, entry); },
  qDone(entry) { return this.periodDone(this.questTab, entry); },
  qClaim(i) { this.claimPeriodQuest(this.questTab, i); },

  get hasClaimableQuest() {
    if (this.tutDone) return true;
    return this.periodClaimable('daily') + this.periodClaimable('weekly') + this.periodClaimable('monthly') > 0;
  },
  get freeAvatarId() { return this.state.player.gender === 'nu' ? 'nu' : 'nam'; }, // ảnh theo giới tính: free
  ownsAvatar(id) { return id === this.freeAvatarId || (this.state.player.ownedAvatars || []).includes(id); },
  ownsCover(id) { return (this.state.player.ownedCovers || []).includes(id); }, // 'Giống Avatar' (null) luôn free
  selectAvatar(id) { if (id && !this.ownsAvatar(id)) { this.showToast('Chưa sở hữu Ảnh Đại Diện này — mua ở Thương Điếm.'); return; } this.state.player.avatar = id; },
  get avatarId() { return this.state.player.avatar || this.freeAvatarId; },
  get avatarSrc() { return `images/avatars/${this.avatarId}.webp`; },
  // Ảnh BÌA (banner) tách riêng khỏi avatar — coverImg=null => giống avatar.
  selectCover(id) { if (id && !this.ownsCover(id)) { this.showToast('Chưa sở hữu Ảnh Bìa này — mua ở Thương Điếm.'); return; } this.state.player.coverImg = id; },
  get coverImgId() { return this.state.player.coverImg || this.avatarId; },
  get coverSrc() { return `images/avatars/${this.coverImgId}.webp`; },
  // --- Thu phóng + kéo thả: background-size (zoom) + background-position (pan, tự giới hạn, KHÔNG hở) ---
  // cover (banner rộng) → cover theo CHIỀU NGANG; face (ô vuông) → cover theo CHIỀU DỌC.
  get coverStyle() { const c = this.state.player.cover || { x: 50, y: 50, z: 1 }; const size = c.z > 1 ? `${c.z * 100}% auto` : 'cover'; return `background-image:url('${this.coverSrc}'); background-repeat:no-repeat; background-size:${size}; background-position:${c.x}% ${c.y}%;`; },
  get faceStyle() { const f = this.state.player.face || { x: 50, y: 50, z: 1 }; return `background-image:url('${this.avatarSrc}'); background-repeat:no-repeat; background-size:auto ${f.z * 100}%; background-position:${f.x}% ${f.y}%;`; },
  adjStart(kind, ev) {
    if (ev.button != null && ev.button !== 0) return;
    ev.preventDefault();
    const a = this.state.player[kind]; if (!a) return;
    const r = ev.currentTarget.getBoundingClientRect();
    const st = { sx: ev.clientX, sy: ev.clientY, ox: a.x, oy: a.y, w: r.width, h: r.height };
    const cl = (v) => Math.max(0, Math.min(100, v));
    const move = (e) => {
      a.x = cl(st.ox - (e.clientX - st.sx) / st.w * 100);   // kéo phải -> lộ trái
      a.y = cl(st.oy - (e.clientY - st.sy) / st.h * 100);
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); Storage.save(this.state); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  },
  setAdjZoom(kind, z) { if (this.state.player[kind]) { this.state.player[kind].z = Math.max(1, Math.min(3, +z || 1)); Storage.save(this.state); } },
  adjWheel(kind, ev) { const a = this.state.player[kind]; if (!a) return; a.z = Math.max(1, Math.min(3, (a.z || 1) - ev.deltaY * 0.0015)); Storage.save(this.state); },
  resetAdj(kind) { this.state.player[kind] = { x: 50, y: 50, z: 1 }; Storage.save(this.state); },
  get curAvatar() { return this.AVATARS.find(a => a.id === this.avatarId) || null; },
  dismissOffline() { this.offlineReport = null; },
  // ===== THÔNG BÁO (feed chung: chuông + Phi Cáp Đài) =====
  bellOpen: false,
  notifFilter: 'all',
  NOTIF_TYPES: [
    { id: 'all',      label: 'Tất cả',        col: '#94a3b8', svg: 'inbox',                seal: '總' },
    { id: 'thuThap',  label: 'Thu Thập',      col: '#34d399', art: 'thaiKhoang', ic: '⛏️', seal: '采' }, // mượn art Đào Khoáng
    { id: 'yeuVuong', label: 'Yêu Vương',     col: '#fb7185', art: 'yvBachHo',   ic: '🐲', seal: '妖' }, // boss Bạch Hổ
    { id: 'biCanh',   label: 'Bí Cảnh',       col: '#a78bfa', art: 'dungeon',    ic: '🏛️', seal: '秘' }, // nav Bí Cảnh
    { id: 'linhThu',  label: 'Linh Thú',      col: '#14b8a6', art: 'pets',       ic: '🐾', seal: '獸' }, // nav Linh Thú
    { id: 'khac',     label: 'Khác',          col: '#fbbf24', svg: 'star',                 seal: '他' },
    { id: 'sanGD',    label: 'Sàn Giao Dịch', col: '#22d3ee', art: 'market',     ic: '⚖️', seal: '易' }, // nav Sàn Giao Dịch
  ],
  notifTypeMeta(type) { return this.NOTIF_TYPES.find((t) => t.id === type) || this.NOTIF_TYPES.find((t) => t.id === 'khac'); },
  // Icon nhóm: art game có sẵn (ico) cho nhóm map tính năng; Tất cả/Khác = SVG nền + art ui phủ lên (images/ui/notif_<id>) khi có.
  notifIcon(t, size) {
    if (t && t.art) return this.ico(t.art, t.ic || '✦');
    const id = t ? t.id : '';
    const sv = this.svg((t && t.svg) || 'star', size || 'w-[18px] h-[18px]');
    return `<span class="relative w-full h-full inline-flex items-center justify-center">${sv}<img src="images/ui/notif_${id}.webp" class="absolute inset-0 w-full h-full object-contain p-0.5" alt="" onerror="if(this.src.endsWith('.webp')){this.src='images/ui/notif_${id}.png'}else{this.remove()}"></span>`;
  },
  pushNotif(type, title, body) { pushNotif(this.state, type, title, body, now()); Storage.save(this.state); },
  get notifications() { return this.state.notifications || []; },
  notifFor(type) { const a = this.notifications; return (!type || type === 'all') ? a : a.filter((n) => n.type === type); },
  notifUnread(type) { void this._tick; return this.notifFor(type).filter((n) => !n.read).length; },
  get notifBadge() { void this._tick; const n = this.notifications.filter((x) => !x.read).length; return n > 99 ? '99+' : (n ? String(n) : ''); },
  notifRecent(k) { return this.notifications.slice(0, k || 5); },
  toggleBell() { this.bellOpen = !this.bellOpen; },
  closeBell() { this.bellOpen = false; },
  openPhiCapDai() { this.bellOpen = false; this.navTo('phiCapDai'); },
  setNotifFilter(t) { this.notifFilter = t; },
  notifMarkRead(type) { this.notifFor(type).forEach((n) => { n.read = true; }); Storage.save(this.state); },
  notifClearType(type) { if (!type || type === 'all') this.state.notifications = []; else this.state.notifications = this.notifications.filter((n) => n.type !== type); Storage.save(this.state); },
  notifAgo(ts) { void this._tick; if (!ts) return ''; const s = Math.max(0, Math.floor((now() - ts) / 1000)); if (s < 60) return 'vừa xong'; const m = Math.floor(s / 60); if (m < 60) return m + ' phút trước'; const h = Math.floor(m / 60); if (h < 24) return h + ' giờ trước'; return Math.floor(h / 24) + ' ngày trước'; },
  _bossRewardText(rw) {
    if (!rw) return 'Đã hạ gục.';
    const p = [];
    for (const id in (rw.items || {})) { const it = this.ITEMS[id]; p.push((it ? it.name : id) + ' ×' + rw.items[id]); }
    if (rw.honThach) p.push(this.fmt(rw.honThach) + ' Hồn Thạch');
    if (rw.bac) p.push(this.fmt(rw.bac) + ' Bạc');
    if (rw.exp) p.push(this.fmt(rw.exp) + ' EXP');
    return p.length ? 'Đoạt: ' + p.join(' · ') : 'Đã hạ gục.';
  },
  // ===== LINH THÚ (pet) =====
  PET_SPECIES, PET_QUALITY, AWK_PASSIVES,
  get petList() { return this.state.pets || []; },
  get activePetObj() { return activePet(this.state); },
  petName(pet) { return (PET_SPECIES[pet.base] || {}).name || pet.base; },
  petEmoji(pet) { return (PET_SPECIES[pet.base] || {}).emoji || '🐾'; },
  // Art tile pet: images/pets/pet_<base>_<base|awk>.webp -> png -> tự gỡ (lộ emoji nền dưới). Overlay phủ lên lớp emoji.
  petArtTag(pet) {
    const f = 'pet_' + pet.base + '_' + (pet.evolved ? 'awk' : 'base');
    return `<img src="images/pets/${f}.webp" class="w-full h-full object-contain" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/pets/${f}.png&quot;;}else{this.remove();}'>`;
  },
  hatchArtTag() {
    const h = this.state.hatchery; if (!h) return '';
    const f = 'pet_' + h.base + '_base';
    return `<img src="images/pets/${f}.webp" class="w-full h-full object-contain" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/pets/${f}.png&quot;;}else{this.remove();}'>`;
  },
  petRole(pet) { return (PET_SPECIES[pet.base] || {}).role || ''; },
  petHeName(pet) { const h = (PET_SPECIES[pet.base] || {}).he; return ({ kim: 'Kim', moc: 'Mộc', thuy: 'Thủy', hoa: 'Hỏa', tho: 'Thổ' })[h] || ''; },
  petQ(pet) { return this.QUALITY[pet.quality] || this.QUALITY.phamPham; },
  petStat(pet) { return petStatAt(pet); },
  petElColor(pet) { return ({ kim: '#e2e8f0', moc: '#6ee7b7', thuy: '#67e8f9', hoa: '#fdba74', tho: '#fcd34d' })[(PET_SPECIES[pet.base] || {}).he] || '#94a3b8'; },
  petQHex(pet) { return ({ phamPham: '#cbd5e1', luongPham: '#34d399', tinhPham: '#60a5fa', tuyetPham: '#a78bfa', truyenThe: '#e879f9', thanPham: '#fb923c', coBan: '#fbbf24' })[pet.quality] || '#cbd5e1'; },
  statLabelFull(k) { return ({ congKich: 'Công Kích', hoThe: 'Hộ Thể', neTranh: 'Né Tránh', menhTrung: 'Chính Xác', sinhLuc: 'Sinh Lực' })[k] || k; },
  statIco(k) { const P = { congKich: '<path d="M5 19l3.5-3.5M8.5 15.5l8-8 2 2-8 8zM15 5l4 4"/>', hoThe: '<path d="M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6l7-3z"/>', neTranh: '<path d="M3 9h9a2.5 2.5 0 10-2.5-2.6M3 14h13a2.5 2.5 0 11-2.5 2.6"/>', menhTrung: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.5"/>', sinhLuc: '<path d="M12 20s-7-4.7-7-10a4 4 0 017-2.2A4 4 0 0119 10c0 5.3-7 10-7 10z"/>' }; return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">' + (P[k] || '') + '</svg>'; },
  petXpNext(pet) { return petXpToNext(pet.level); },
  petXpPct(pet) { const n = petXpToNext(pet.level); return n ? Math.max(0, Math.min(100, (pet.xp || 0) / n * 100)) : 0; },
  // P4 — thanh Sinh Lực + Thể Lực pet (Sinh Lực theo phiên combat; Thể Lực bền, hồi thời gian thực).
  get petInCombat() { return !!(this.state.activity && this.state.activity.type === 'combat'); },
  get petFainted() { return this.petInCombat && !!(this.state.combat && this.state.combat.petFainted); },
  get petStamCur() { void this._tick; const p = this.activePetObj; return p ? petStamView(p, now()) : 100; },
  get petStamMaxV() { const p = this.activePetObj; return p ? petStamMax(p) : 100; },   // trần Thể Lực pet đang dắt (theo phẩm/cấp/awk)
  get petHpMaxV() { const p = this.activePetObj; return p ? petHpMax(p) : 0; },
  get petHpCur() { const p = this.activePetObj; if (!p) return 0; const h = this.state.combat && this.state.combat.petHp; return (h == null) ? this.petHpMaxV : Math.max(0, h); },
  get petHpPct() { const m = this.petHpMaxV; return m ? Math.max(0, Math.min(100, Math.round(this.petHpCur / m * 100))) : 0; },
  petPassiveOf(pet) { return petPassive(pet); },   // Tuyệt Kĩ bị động (signature loài)
  petActiveOf(pet) { return petActiveEff(pet) || {}; },   // chủ động (đã nhân hệ thức tỉnh khi evolved)
  petAwkPassiveOf(pet) { return petAwkPassive(pet); },    // P7 — bị động Thức Tỉnh (null nếu chưa)
  petSkillArt(pet, kind) {   // art tuyệt kĩ: images/pets/skill_<base>_<p|a>.webp -> png -> tự gỡ (lộ SVG nền)
    const f = 'skill_' + pet.base + '_' + (kind === 'active' ? 'a' : 'p');
    return `<img src="images/pets/${f}.webp" class="w-full h-full object-cover" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/pets/${f}.png&quot;;}else{this.remove();}'>`;
  },
  awkArtTag(awkId) {   // art bị động Thức Tỉnh: images/pets/awk_<id>.webp -> png -> tự gỡ (lộ SVG sao nền)
    const f = 'awk_' + awkId;
    return `<img src="images/pets/${f}.webp" class="w-full h-full object-cover" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/pets/${f}.png&quot;;}else{this.remove();}'>`;
  },
  // HP / Thể Lực / Ngất THEO TỪNG pet (popup mở pet bất kỳ; chỉ con đang mang + đang combat mới có HP phiên thật)
  petHpMaxOf(pet) { return petHpMax(pet); },
  petHpCurOf(pet) { return (this.petInCombat && this.activePetObj && this.activePetObj.id === pet.id) ? this.petHpCur : petHpMax(pet); },
  petHpPctOf(pet) { const m = petHpMax(pet); return m ? Math.max(0, Math.min(100, Math.round(this.petHpCurOf(pet) / m * 100))) : 0; },
  petStamOf(pet) { void this._tick; return petStamView(pet, now()); },
  petStamMaxOf(pet) { return petStamMax(pet); },   // trần Thể Lực 1 pet bất kỳ (roster/popup)
  petFaintedOf(pet) { return this.petFainted && this.activePetObj && this.activePetObj.id === pet.id; },
  // Popup chi tiết pet (mở từ roster) — mirror tpDetail
  petDetail: null,
  petDetailMode: 'view',   // view | fuse | fuseConfirm | release | awaken | huntPick
  fuseSel: [],
  openPetDetail(id) { this.petDetail = id; this.petDetailMode = 'view'; this.fuseSel = []; },
  closePetDetail() { this.petDetail = null; this.petDetailMode = 'view'; this.fuseSel = []; },
  get petDetailObj() { return this.petDetail ? (this.state.pets || []).find((x) => x.id === this.petDetail) : null; },
  petActiveDmg(pet) { const a = petActiveEff(pet); return a ? Math.round(((petStatAt(pet) || {}).congKich || 0) * (a.mult || 0)) : 0; },   // sát thương chủ động ≈ mult × Công Kích (đã gồm thức tỉnh)
  // --- P6: Dung Hợp (đa vật tế) ---
  get fuseDonors() {   // pet đủ điều kiện làm vật tế; SẮP cùng dòng+phẩm lên đầu rồi phẩm/cấp giảm dần
    const t = this.petDetailObj; if (!t) return [];
    const kin = (d) => (t.base === d.base && t.quality === d.quality) ? 0 : (t.base === d.base ? 1 : (t.quality === d.quality ? 2 : 3));
    return (this.state.pets || []).filter((p) => p.id !== t.id && !petBusy(p))
      .map((d) => ({ pet: d, pv: fusePreview(this.state, t.id, d.id) }))
      .sort((a, b) => kin(a.pet) - kin(b.pet) || this.qualityRank(b.pet.quality) - this.qualityRank(a.pet.quality) || b.pet.level - a.pet.level);
  },
  toggleFuseSel(id) { this.fuseSel = this.fuseSel.includes(id) ? this.fuseSel.filter((x) => x !== id) : [...this.fuseSel, id]; },
  get fuseSelSummary() {
    const t = this.petDetailObj; if (!t || !this.fuseSel.length) return null;
    let xp = 0, pSurv = 1; const absorbed = {};
    for (const id of this.fuseSel) {
      const pv = fusePreview(this.state, t.id, id); if (!pv) continue;
      xp += pv.xp;
      const d = (this.state.pets || []).find((p) => p.id === id); const ds = d ? (petStatAt(d) || {}) : {};
      for (const k of ['congKich', 'hoThe', 'neTranh', 'menhTrung', 'sinhLuc']) { if (ds[k]) { const a = Math.round(ds[k] * pv.pct); if (a > 0) absorbed[k] = (absorbed[k] || 0) + a; } }
      if (pv.same) pSurv *= (1 - pv.upChance);
    }
    return { count: this.fuseSel.length, xp, absorbed, upChance: 1 - pSurv };
  },
  doFuseMany() {
    const t = this.petDetailObj; if (!t || !this.fuseSel.length) return;
    const r = fuseMany(this.state, t.id, this.fuseSel.slice());
    this.fuseSel = []; this.petDetailMode = 'view';
    if (!r) { this.showToast('Không dung hợp được.'); return; }
    Storage.save(this.state);
    let m = this.petName(t) + ' nuốt ' + r.count + ' linh thú · +' + this.fmt(r.xp) + ' tu vi' + (r.leveled ? ' (lên ' + r.leveled + ' cấp)' : '');
    if (r.upgraded) { m += ' — ĐỘT PHÁ ' + (this.QUALITY[t.quality] || {}).name + '!'; this.pushNotif('linhThu', 'Dung Hợp đột phá', this.petName(t) + ' thăng phẩm ' + (this.QUALITY[t.quality] || {}).name + '.'); }
    this.showToast(m);
  },
  // --- P6: Phóng Sanh ---
  get releaseRewardObj() { const p = this.petDetailObj; return p ? releaseReward(p) : null; },
  doRelease() {
    const p = this.petDetailObj; if (!p) return;
    const r = releasePet(this.state, p.id); if (!r) { this.showToast('Đang dắt — thu về trước đã.'); return; }
    Storage.save(this.state); this.closePetDetail();
    const parts = [this.fmt(r.bac) + ' Bạc']; if (r.honThach) parts.push(r.honThach + ' Hồn Thạch'); if (r.linhPhach) parts.push(r.linhPhach + ' Linh Phách');
    this.showToast('Phóng sanh · nhận ' + parts.join(' · ') + '.');
  },
  // --- P7: Thức Tỉnh ---
  get awakenCostObj() { const p = this.petDetailObj; return p ? awakenCost(p) : null; },
  get canAwakenSel() { const p = this.petDetailObj; return p ? canAwaken(this.state, p) : false; },
  get awakenAffordSel() { const p = this.petDetailObj; return p ? awakenAfford(this.state, p) : false; },
  awakenMatName() { const c = this.awakenCostObj; return c ? ((this.ITEMS[c.matId] || {}).name || c.matId) : ''; },
  awakenMatHave() { const c = this.awakenCostObj; return c ? (this.state.inventory[c.matId] || 0) : 0; },
  awakenMatIco() { const c = this.awakenCostObj; return c ? this.ico(c.matId, (this.ITEMS[c.matId] || {}).icon || '🌀') : ''; },
  get awakenBlockReason() {
    const p = this.petDetailObj; if (!p) return '';
    if (p.evolved) return 'Đã Thức Tỉnh.';
    if (!this.canAwakenSel) return 'Phải đạt cảnh giới tối đa (Lv ' + this.petLevelCap(p) + ') mới Thức Tỉnh được.';
    if (!this.awakenAffordSel) return 'Thiếu liệu Thức Tỉnh hoặc Hồn Thạch.';
    return '';
  },
  doAwaken() {
    const p = this.petDetailObj; if (!p) return;
    const before = (this.QUALITY[p.quality] || {}).name;
    const r = awakenPet(this.state, p.id);
    if (!r) { this.showToast(this.awakenBlockReason || 'Chưa thể Thức Tỉnh.'); return; }
    Storage.save(this.state);
    this.petDetailMode = 'view';
    const aw = this.AWK_PASSIVES[r.awkPassive] || {};
    let m = this.petName(p) + ' Thức Tỉnh — lĩnh ngộ 〈' + aw.name + '〉';
    if (r.newOpt) m += ', khai mở ' + this.petOptLabel(r.newOpt);
    if (r.mutated) m += ' · BIẾN DỊ thăng ' + (this.QUALITY[p.quality] || {}).name;
    this.showToast(m + '.');
    this.pushNotif('linhThu', 'Linh Thú Thức Tỉnh', this.petName(p) + ' phá vỏ phàm thai, hiện hình thái thứ hai · lĩnh ngộ 〈' + aw.name + '〉' + (r.mutated ? ' · biến dị thăng phẩm ' + before + ' → ' + (this.QUALITY[p.quality] || {}).name : '') + '.');
  },
  // ===== P7: SĂN MỒI + NGỰ THÚ =====
  get nguThuLvV() { return nguThuLv(this.state); },
  get nguThuProg() { return this.skillProg('nguThu'); },                  // {level,into,need,frac}
  get huntSlotsV() { return huntSlots(this.state); },
  get huntSlotsUsedV() { return huntSlotsUsed(this.state); },
  get huntSlotFree() { return this.huntSlotsUsedV < this.huntSlotsV; },
  get nextSlotLv() { return (Math.floor(this.nguThuLvV / 5) + 1) * 5; },  // cấp Ngự Thú mở slot kế
  get huntingPets() { return (this.state.pets || []).filter((p) => p.state === 'hunt' || p.state === 'rest'); },
  petStateKey(pet) { return pet.equipped ? 'battle' : (pet.state || 'idle'); },
  petStateName(pet) { return ({ battle: 'Xuất Trận', hunt: 'Săn Mồi', rest: 'Dưỡng Sức', idle: 'Chờ Lệnh' })[this.petStateKey(pet)]; },
  petBusyV(pet) { return petBusy(pet); },
  petHuntLocName(pet) { const l = (this.LOCATIONS || []).find((x) => x.id === pet.huntLoc); return l ? l.name : ''; },
  canPhaiSan(pet) { return !petBusy(pet) && this.huntSlotFree; },
  // Vùng pet có thể săn: player đã mở (combatLv ≥ reqLevel); ok = pet đủ cấp vùng.
  huntLocOptions(pet) {
    return (this.LOCATIONS || []).filter((l) => this.combatLevel >= l.reqLevel)
      .map((l) => ({ loc: l, ok: pet.level >= l.reqLevel, lootNames: (l.enemies || []).map((eid) => (this.ENEMIES[eid] || {}).name).filter(Boolean) }));
  },
  phaiSan(petId, locId) {
    const p = (this.state.pets || []).find((x) => x.id === petId);
    if (p && (p.state === 'hunt' || p.state === 'rest')) stopHunt(this.state, petId, now());   // đổi vùng: thu về trước rồi phái lại
    const r = startHunt(this.state, petId, locId, now());
    if (!r) { this.showToast('Không phái được — hết slot hoặc pet chưa đủ cấp vùng.'); return; }
    Storage.save(this.state); this.petDetailMode = 'view';
    this.showToast(this.petName(r) + ' lên đường Săn Mồi · ' + this.petHuntLocName(r) + '.');
  },
  recallHunt(petId) {
    const r = stopHunt(this.state, petId, now());
    if (!r) return;
    Storage.save(this.state);
    this.showToast(this.petName(r) + ' đã thu về, nghỉ trong chuồng.');
  },
  // --- Popup "Lịch Luyện": theo dõi tiến độ săn mồi mọi pet ---
  huntTrackOpen: false,
  openHuntTrack() { this.huntTrackOpen = true; },
  closeHuntTrack() { this.huntTrackOpen = false; },
  changeHuntZone(petId) { this.huntTrackOpen = false; this.openPetDetail(petId); this.petDetailMode = 'huntPick'; },   // Đổi Vùng -> mở bảng chọn vùng của pet
  get huntTrackList() {
    void this._tick;                                                    // đếm giây -> countdown cập nhật
    const t = now();
    return this.huntingPets.map((p) => {
      const stam = petStamView(p, t);
      const max = petStamMax(p);
      const isRest = p.state === 'rest';
      const nextTickMs = isRest ? 0 : Math.max(0, (p.huntAt + HUNT_TICK_MS) - t);
      const restFullSec = isRest ? Math.ceil((max - stam) / 10) * 60 : 0;   // giây tới đầy (xấp xỉ, hồi 10/phút)
      const hs = p.huntStats || { exp: 0, ticks: 0, loot: {} };
      const lootCount = Object.values(hs.loot || {}).reduce((a, b) => a + b, 0);
      return {
        pet: p, stam, stamMax: max, isRest, nextTickMs, restFullSec,
        ticksToSleep: Math.max(0, Math.floor(stam / 10)),
        tickPct: isRest ? 0 : Math.max(0, Math.min(100, (1 - nextTickMs / HUNT_TICK_MS) * 100)),
        restPct: isRest ? Math.max(0, Math.min(100, stam / max * 100)) : 0,
        sessionExp: hs.exp || 0, sessionTicks: hs.ticks || 0, sessionLoot: lootCount,
        locName: this.petHuntLocName(p),
      };
    });
  },
  // Giải quyết săn mồi (gọi mỗi 5s + on-load). Trả mảng tóm tắt | null.
  tickHunts() {
    if (!(this.state.pets || []).some((p) => p.state === 'hunt' || p.state === 'rest')) return null;
    const res = resolvePetHunts(this.state, now(), idleCapMs(this.state));
    if (res.length) Storage.save(this.state);
    return res;
  },
  huntsOnLoad() {
    const res = this.tickHunts();
    if (!res || !res.length) return;
    const totExp = res.reduce((s, r) => s + r.exp, 0);
    const totLoot = res.reduce((s, r) => s + Object.values(r.loot).reduce((a, b) => a + b, 0), 0);
    if (totExp > 0 || totLoot > 0) this.pushNotif('linhThu', 'Linh Thú săn mồi', 'Khi vắng mặt, bầy Linh Thú săn được ' + this.fmt(totExp) + ' tu vi' + (totLoot ? ' + ' + totLoot + ' vật phẩm' : '') + '.');
  },
  petOptLabel(o) { const d = PET_OPT_BY_ID[o.id] || {}; return (d.name || o.id) + ' +' + this.fmt(o.val) + (d.fmt === 'pct' ? '%' : ''); },
  petOptsText(pet) { return (pet.opts || []).map((o) => this.petOptLabel(o)).join('  ·  '); },   // cho tooltip chip "N dị bẩm"
  petLevelCap(pet) { const off = { phamPham: 10, luongPham: 6, tinhPham: 3 }[pet.quality] || 0; return Math.max(1, this.combatLevel - off); },
  get eggsInInventory() {
    return Object.keys(this.state.inventory || {})
      .filter((id) => this.ITEMS[id] && this.ITEMS[id].type === 'trung' && (this.state.inventory[id] || 0) > 0)
      .map((id) => ({ id, qty: this.state.inventory[id], item: this.ITEMS[id] }));
  },
  // --- P3: Lò Ấp Noãn (đơn). Roll pet ở engine lúc Đặt Ấp; ở đây điều phối + tính giờ/giá. ---
  get hatchery() { return this.state.hatchery; },
  get incubating() { void this._tick; const h = this.state.hatchery; return !!h && now() < h.readyAt; },
  get hatchReady() { void this._tick; return incubReady(this.state, now()); },
  get hatchRemainMs() { void this._tick; return incubRemainMs(this.state, now()); },
  get hatchTimeLeft() { return fmtClock(this.hatchRemainMs / 1000); },
  get hatchPct() { const h = this.state.hatchery; if (!h) return 0; void this._tick; return Math.max(0, Math.min(100, (now() - h.startedAt) / h.durMs * 100)); },
  get hatchSkipCost() { void this._tick; return incubSkipCost(this.state, now()); },
  get canAffordHatchSkip() { return (this.state.currencies.honThach || 0) >= this.hatchSkipCost; },
  hatchSpeciesName() { const h = this.state.hatchery; return h ? ((PET_SPECIES[h.base] || {}).name || h.base) : ''; },
  hatchEmoji() { const h = this.state.hatchery; return h ? ((PET_SPECIES[h.base] || {}).emoji || '🥚') : '🥚'; },
  hatchEggTierName() { const h = this.state.hatchery; return h ? ((this.QUALITY[h.eggQuality] || {}).name || '') : ''; },
  hatchEggTierColor() { const h = this.state.hatchery; return h ? ((this.QUALITY[h.eggQuality] || {}).text || 'text-slate-300') : 'text-slate-300'; },
  hatchDurLabel(eggQ) { return Math.round(hatchDurMs(eggQ) / 3600000) + ' giờ'; },
  startIncubate(eggId) {
    if (this.state.hatchery) { this.showToast('Lò ấp đang bận — khai noãn xong đã.'); return; }
    const rec = startIncubation(this.state, eggId, now());
    if (!rec) { this.showToast('Không ấp được trứng này.'); return; }
    Storage.save(this.state);
    this.showToast('Đặt ' + ((PET_SPECIES[rec.base] || {}).name || rec.base) + ' Noãn vào lò ấp.');
  },
  collectHatch() {
    const pet = finishHatch(this.state, now());
    if (!pet) return;
    Storage.save(this.state);
    const nm = this.petName(pet), qn = (this.QUALITY[pet.quality] || {}).name;
    this.showToast('Khai noãn! 〈' + nm + ' · ' + qn + '〉 phá vỏ chào đời.');
    this.pushNotif('linhThu', 'Khai noãn Linh Thú', nm + ' (' + qn + ') phá vỏ gia nhập đội.');
  },
  skipIncubate() {
    const h = this.state.hatchery; if (!h) return;
    const t = now();
    if (t >= h.readyAt) { this.collectHatch(); return; }       // đã đủ giờ -> khai luôn, miễn phí
    const cost = incubSkipCost(this.state, t);
    if ((this.state.currencies.honThach || 0) < cost) { this.showToast('Không đủ Hồn Thạch (cần ' + this.fmt(cost) + ').'); return; }
    this.state.currencies.honThach -= cost;
    h.readyAt = t;
    this.collectHatch();                                        // tự Storage.save + thông báo
  },
  equipPet(petId) { const p = (this.state.pets || []).find((x) => x.id === petId); if (p && (p.state === 'hunt' || p.state === 'rest')) stopHunt(this.state, petId, now()); (this.state.pets || []).forEach((x) => { x.equipped = (x.id === petId); }); Storage.save(this.state); if (p) this.showToast(this.petName(p) + ' đã xuất trận, kề vai cùng ngươi.'); },
  unequipActivePet() { (this.state.pets || []).forEach((p) => { p.equipped = false; }); Storage.save(this.state); },
  // Bonus pet ĐÃ CAP (số thực cộng vào nhân vật) = stats(có pet) − stats(không pet).
  activePetBonusApplied() {
    if (!this.activePetObj) return null;
    const withP = derivedStats(this.state), noP = derivedStats(this.state, { noPet: true });
    const out = {};
    for (const k of ['congKich', 'hoThe', 'neTranh', 'menhTrung', 'sinhLuc']) { const d = withP[k] - noP[k]; if (d > 0) out[k] = d; }
    return out;
  },
  statLabelShort(k) { return ({ congKich: 'Công', hoThe: 'Thủ', neTranh: 'Né', menhTrung: 'Chính Xác', sinhLuc: 'Sinh Lực' })[k] || k; },
  get viewName() { return VIEW_NAMES[this.view] || ''; },
  get isPlaceholderView() { return !['profile', 'trangbi', 'inventory', 'map', 'skill', 'combat', 'merchant', 'tangkinhcac', 'nhiemVu', 'worldboss', 'dungeon', 'phiCapDai', 'pets', 'phongVanBang', 'collection'].includes(this.view); },
  get currentSkill() { return this.SKILLS[this.selectedSkill]; },
  zoneName(id) { const l = (this.LOCATIONS || []).find((x) => x.id === id); return l ? l.name : ''; },  // tên vùng (cho nhãn gathering)
  // Nghề THU THẬP (có zone trên action) → danh sách chỉ hiện tài nguyên của VÙNG đang đứng. Nghề chế tạo (không zone) hiện hết.
  get currentSkillIsGather() { return ((this.currentSkill && this.currentSkill.actions) || []).some((a) => a.zone); },
  // --- Rèn Đúc: lọc theo LOẠI trang bị (slot thường + tiểu loại vũ khí) ---
  forgeSlot: 'all',
  get forgeCats() {
    return [
      { k: 'all', n: 'Tất cả' },
      { k: 'vuKhi', n: 'Vũ Khí', head: true },
      { k: 'kiem', n: '— Kiếm' }, { k: 'dao', n: '— Đao' }, { k: 'cung', n: '— Cung' }, { k: 'amkhi', n: '— Ám Khí' },
      { k: 'mu', n: 'Mũ' }, { k: 'giap', n: 'Áo' }, { k: 'dai', n: 'Đai' }, { k: 'gang', n: 'Găng Tay' }, { k: 'giay', n: 'Giày' },
      { k: 'nhan', n: 'Nhẫn' }, { k: 'trangSuc', n: 'Trang Sức' }, { k: 'toaKy', n: 'Tọa Kỵ' }, { k: 'cuoc', n: 'Công Cụ' },
    ];
  },
  forgeMatch(a) {
    if (this.forgeSlot === 'all') return true;
    const e = (this.ITEMS[a.itemId] || {}).equip || {};
    if (this.forgeSlot === 'vuKhi') return e.slot === 'vuKhi';                                  // toàn bộ vũ khí
    if (['kiem', 'dao', 'cung', 'amkhi'].includes(this.forgeSlot)) return e.slot === 'vuKhi' && e.weaponType === this.forgeSlot; // tiểu loại
    return e.slot === this.forgeSlot;
  },
  get currentSkillActions() {
    const acts = (this.currentSkill && this.currentSkill.actions) || [];
    let out = acts.filter((a) => !a.zone || a.zone === this.currentLocation);
    if (this.selectedSkill === 'daTao' && this.forgeSlot !== 'all') out = out.filter((a) => this.forgeMatch(a));
    if (this.selectedSkill === 'daTao') out = out.filter((a) => this.forgeUnlocked(a.itemId)); // bậc 4-7 cần Đồ Phổ đã lĩnh ngộ
    if (this.skillSubTabsFor(this.selectedSkill)) { const t = this.effectiveSkillTab; out = out.filter((a) => this.skillActionCat(this.selectedSkill, a) === t); } // Luyện Kim/Luyện Đan: lọc theo tab
    return out;
  },
  // Chia 2 tab: Luyện Kim (Đúc Thỏi / Đá Cường Hóa) · Luyện Đan (Linh Thạch / Đan Dược)
  skillTab: 'thoi',
  skillSubTabsFor(skillId) {
    if (skillId === 'daLuyen') return [{ k: 'thoi', n: 'Đúc Thỏi' }, { k: 'da', n: 'Chế Tạo Đá Cường Hóa' }];
    if (skillId === 'luyenDan') return [{ k: 'linhThach', n: 'Linh Thạch' }, { k: 'dan', n: 'Đan Dược' }];
    return null;
  },
  get skillSubTabs() { return this.skillSubTabsFor(this.selectedSkill); },
  get effectiveSkillTab() { const subs = this.skillSubTabs; if (!subs) return null; return subs.some((s) => s.k === this.skillTab) ? this.skillTab : subs[0].k; },
  setSkillTab(k) { this.skillTab = k; },
  skillActionCat(skillId, action) {
    if (skillId === 'daLuyen') return (action.itemId || '').startsWith('daCuongHoa') ? 'da' : 'thoi';
    if (skillId === 'luyenDan') return (this.ITEMS[action.itemId] && this.ITEMS[action.itemId].type === 'dan') ? 'dan' : 'linhThach';
    return null;
  },
  // --- "Có gì ở đây" (modal địa điểm): tách quái thường / boss, + tài nguyên cày được theo vùng ---
  zoneMobs(loc) { return this.locationEnemies(loc).filter((eid) => this.ENEMIES[eid] && !this.ENEMIES[eid].isBoss); },
  zoneBosses(loc) { return this.locationEnemies(loc).filter((eid) => this.ENEMIES[eid] && this.ENEMIES[eid].isBoss); },
  zoneResources(zoneId) {
    const out = [];
    ['phatMoc', 'thaiKhoang', 'dieuNgu'].forEach((sk) => {
      const skill = this.SKILLS[sk]; if (!skill) return;
      (skill.actions || []).forEach((a) => { if (a.zone === zoneId) out.push({ id: a.id, name: a.name, itemId: a.itemId, reqLevel: a.reqLevel, skillName: skill.name }); });
    });
    return out;
  },
  navItemActive(it) { return this.view === it.view; },
  // Icon: tự chọn folder theo id (ICON_FOLDERS), mặc định 'items'; lỗi -> rơi về emoji
  ico(id, emoji) {
    const safe = String(emoji || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const folder = ICON_FOLDERS[id] || 'items';
    const drop = `this.replaceWith(Object.assign(document.createElement(&quot;span&quot;),{textContent:&quot;${safe}&quot;}))`;
    if (id && id.startsWith('dp_')) {   // ĐỒ PHỔ: cuộn nền THEO BẬC + art gear/tool lồng giữa. Tất cả WEBP-FIRST -> png -> emoji.
      const qq = ((this.ITEMS && this.ITEMS[id]) || {}).quality;
      const qmeta = (this.QUALITY && this.QUALITY[qq]) || null;
      const bd = qmeta ? qmeta.border : 'border-slate-500/50';
      const gearId = id.slice(3);
      // Nền cuộn theo bậc: 2-3 Lương/Tinh -> dopho_23 · 4-5 Tuyệt/Truyền Thế -> dopho_45 · 6 Thần -> dopho_6 · 7 Cô Bản -> dopho_7.
      const bgFile = { luongPham: 'dopho_23', tinhPham: 'dopho_23', tuyetPham: 'dopho_45', truyenThe: 'dopho_45', thanPham: 'dopho_6', coBan: 'dopho_7' }[qq] || 'dopho_45';
      const inner = `<img src="images/equip/${gearId}.webp" class="w-full h-full object-contain" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/equip/${gearId}.png&quot;;}else{${drop};}'>`;
      return `<span class="relative block w-full h-full">`
        + `<img src="images/items/${bgFile}.webp" class="absolute inset-0 w-full h-full object-contain" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/items/${bgFile}.png&quot;;}else{${drop};}'>`
        + `<span class="absolute overflow-hidden border ${bd}" style="left:50%;top:49%;transform:translate(-50%,-50%);width:44%;height:44%;border-radius:14%;background:#070908">`
        + inner
        + `</span></span>`;
    }
    if (folder === 'equip') {   // art trang bị (KÉO GIÃN lấp khung): WEBP-FIRST -> png -> emoji.
      return `<img src="images/equip/${id}.webp" class="w-full h-full" style="object-fit:fill" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/equip/${id}.png&quot;;}else{${drop};}'>`;
    }
    return `<img src="images/${folder}/${id}.webp" class="w-full h-full object-contain p-0.5" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/${folder}/${id}.png&quot;;}else{${drop};}'>`;
  },
  // Ảnh chân dung YÊU THÚ — object-cover (lấp đầy khung), fallback emoji. Dùng ở danh sách + popup Suy Tính.
  enemyArt(id, emoji) {
    const safe = String(emoji || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `<img src="images/enemies/${id}.webp" class="w-full h-full object-cover" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/enemies/${id}.png&quot;;}else{this.replaceWith(Object.assign(document.createElement(&quot;span&quot;),{textContent:&quot;${safe}&quot;}));}'>`;
  },
  // Icon đường nét nội tuyến (thay emoji hệ thống). cls điều khiển kích thước/màu.
  svg(name, cls) {
    const p = SVG_PATHS[name]; if (!p) return '';
    return `<svg class="${cls || 'w-4 h-4'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  },

  // ---------- Tạo nhân vật (giang hồ tự do: chỉ Nam/Nữ) ----------
  get needsCreation() { return !this.state.player.created; },
  pickGender(g) { this.draftGender = g; },
  pickTamPhap(id) { this.draftTamPhap = id; },
  draftTamPhapOn(id) { return this.draftTamPhap === id; },
  get canCreate() { return (this.draftName || '').trim().length >= 2 && !!this.draftGender && !!this.draftTamPhap; },
  createCharacter() {
    if (!this.canCreate) return;
    this.state.player.name = this.draftName.trim();
    this.state.player.gender = this.draftGender;
    this.state.player.class = null;
    this.state.player.created = true;
    // Tâm Pháp khởi tu → set bài võ + sở hữu NHẬP MÔN theo hệ đã chọn (không còn ép Hỏa)
    const kit = starterLoadoutFor(this.draftTamPhap);
    const lo = this.state.combat.loadout;
    lo.tamPhap = kit.tamPhap;
    lo.biDong = kit.biDong.slice();
    lo.chieu = kit.chieu.slice(0, this.maxChieuSlots);
    this.state.combat.owned = { chieu: kit.chieu.slice(), tamPhap: [kit.tamPhap], biDong: kit.biDong.slice() };
    Storage.save(this.state);
  },
  get className() { return 'Giang Hồ Tự Do'; },
  get genderLabel() { return this.state.player.gender === 'nu' ? 'Nữ' : (this.state.player.gender === 'nam' ? 'Nam' : '—'); },
  // ---------- Nghề (bái sư, giữ nhiều) ----------
  get professions() { return this.state.player.professions || []; },
  hasProfession(id) { return this.professions.includes(id); },
  get professionCount() { return this.professions.length; },
  get professionNextCost() { const c = PROF_COST[this.professionCount]; return c != null ? c : PROF_COST[PROF_COST.length - 1] * 2; }, // theo BẬC nghề đã học
  professionCostFor() { return this.professionNextCost; },
  get professionLvReq() { return this.professionCount * PROF_LV_STEP; },           // mỗi 80 Tổng Lv mở thêm 1 nghề
  professionLvLocked(id) { return !this.hasProfession(id) && this.totalLevel < this.professionLvReq; },
  learnProfession(id) {
    const n = this.NGHE.find((x) => x.id === id); if (!n || this.hasProfession(id)) return;
    if (this.totalLevel < this.professionLvReq) { this.showToast('Cần Tổng Lv ' + this.professionLvReq + ' để học nghề thứ ' + (this.professionCount + 1) + '.'); return; }
    const cost = this.professionNextCost;
    if ((this.state.currencies.bac || 0) < cost) { this.showToast('Không đủ Bạc (' + this.fmt(cost) + ') để bái sư.'); return; }
    this.state.currencies.bac -= cost;
    this.state.player.professions.push(id);
    Storage.save(this.state);
    this.showToast('Bái sư thành! Đã học nghề ' + n.name + '.');
    this.pushNotif('khac', 'Bái sư thành công', 'Đã học nghề ' + n.name + '.');
  },

  // ---------- Kỹ năng / Tứ Trụ ----------
  skillProg(id) { return xpProgress(this.state.skills[id]?.xp || 0); },
  skillLevel(id) { return levelFromXp(this.state.skills[id]?.xp || 0); },
  statProg(id) { return xpProgress(this.state.stats[id]?.xp || 0); },
  statLevel(id) { return levelFromXp(this.state.stats[id]?.xp || 0); },
  get totalLevel() { return this.combatLevel + Object.keys(this.SKILLS).reduce((s, id) => s + this.skillLevel(id), 0); },
  // ===== GIANG HỒ — Phong Vân Bảng (BXH bot) =====
  initWorld() { ensureWorld(this.state, now()); Storage.save(this.state); },
  get playerActivityText() { return this.state.activity ? (this.actName || 'đang hành tẩu') : 'nhàn rỗi chốn giang hồ'; },
  // Memo 200 hàng BOT ở module-level (đắt: 200×10 levelFromXp) theo (seed:createdAt:phút); hàng PLAYER tính TƯƠI mỗi render (rank/level không trễ).
  get leaderboard() {
    const w = this.state.world; if (!w) return [];
    const t = now(), key = w.seed + ':' + w.createdAt + ':' + Math.floor(t / 60000);
    if (_lbBotKey !== key || !_lbBots) {
      _lbBots = genRoster(w.seed, w.createdAt).map((b) => {
        const d = botDominant(b, t);                                 // 1 lần -> danh hiệu + màu theo nghề thật
        return {
          id: b.id, name: b.name, title: botTitleFor(d.track, d.level), catHex: CAT_HEX[botCatFor(d.track)] || '#94a3b8',
          avatar: botAvatar(b), combatLv: botCombatLv(b, t), totalLv: botTotalLv(b, t), activity: botActivity(b, t), isPlayer: false,
        };
      });
      _lbBotKey = key;
    }
    const rows = _lbBots.concat([{
      id: 'me', name: (this.state.player.name || 'Vô Danh'), title: 'Ngươi', catHex: '#14b8a6',
      avatar: (this.curAvatar || { id: this.avatarId, char: '道', color: 'from-slate-600 to-slate-700' }),
      combatLv: this.combatLevel, totalLv: this.totalLevel, activity: this.playerActivityText, isPlayer: true,
    }]);
    rows.sort((a, b) => b.totalLv - a.totalLv || b.combatLv - a.combatLv || (a.id < b.id ? -1 : 1));
    rows.forEach((r, i) => { r.rank = i + 1; });
    return rows;
  },
  get lbTotal() { return BOT_COUNT + 1; },
  get playerRow() { return this.leaderboard.find((r) => r.isPlayer) || null; },
  get lbTop() { return this.leaderboard.slice(0, 50); },
  get lbNeighbors() {                                                // người chơi ngoài top 50 -> lân cận hạng mình, KHÔNG chồng top 50
    const p = this.playerRow; if (!p || p.rank <= 50) return [];
    const lb = this.leaderboard, i = p.rank - 1;
    return lb.slice(Math.max(50, i - 3), Math.min(lb.length, i + 4));
  },
  get lbDisplay() { const top = this.lbTop, nb = this.lbNeighbors; return nb.length ? [...top, { separator: true, id: 'sep' }, ...nb] : top; },
  // Đồng Đạo Lân Cận: bot chuyên nghề `skillId` (track đỉnh == skillId). Memo theo (skill:phút).
  nearbyBotsList(skillId) {
    const w = this.state.world; if (!w || !skillId) return { bots: [], count: 0 };
    const t = now(), key = skillId + ':' + Math.floor(t / 60000);
    if (_nbKey === key && _nbData) return _nbData;
    const matched = nearbyBotsBy(genRoster(w.seed, w.createdAt), skillId, t);
    _nbData = { bots: matched.slice(0, 5).map((b) => botAvatar(b)), count: matched.length };
    _nbKey = key;
    return _nbData;
  },
  // ===== GIANG HỒ — Feed tin bot (DERIVED thuần, KHÔNG lưu; memo theo slot trong engine). void _tick -> mốc giờ + tin mới tự cập nhật. =====
  get jiangHuFeed() { void this._tick; const w = this.state.world; if (!w) return []; return genJiangHuFeed(w.seed, w.createdAt, now()); },
  get jiangHuTicker() { return this.jiangHuFeed.slice(0, 12); },

  expPerSec(action) { return (action.xp / action.time).toFixed(2); },
  actionInputs(action) { return inputStatus(this.state, action); },
  canStart(skillId, action) { return canStartAction(this.state, skillId, action); },
  startLabel(skillId, action) {
    if (this.skillLevel(skillId) < action.reqLevel) return 'Cần Lv ' + action.reqLevel;
    if (this.actionInputs(action).some((i) => !i.ok)) return 'Thiếu liệu';
    return 'Bắt Đầu';
  },

  // ---------- Metrics / NEARBY / Modal ----------
  skillTotalXp(id) { return this.state.skills[id]?.xp || 0; },
  skillGathered(id) { return this.state.skills[id]?.gathered || 0; },
  skillTimeLabel(id) { return this.fmtTime((this.state.skills[id]?.timeMs || 0) / 1000); },

  actionModal: null,
  openAction(skillId, actionId) { this.actionModal = { skillId, actionId }; },
  closeAction() { this.actionModal = null; },
  get modalSkill() { return this.actionModal ? this.SKILLS[this.actionModal.skillId] : null; },
  get modalAction() { return this.actionModal ? getAction(this.actionModal.skillId, this.actionModal.actionId) : null; },
  // EXP chỉ số phụ (Tứ Trụ) nhận MỖI LẦN làm hành động — vd Đào Khoáng = Lực Đạo (Sức Mạnh) + Hộ Thể.
  get modalStatGains() {
    const sk = this.modalSkill, a = this.modalAction;
    if (!sk || !a || !a.statXp) return [];
    const out = [];
    if (sk.stat && STATS[sk.stat]) out.push({ name: STATS[sk.stat].name, gloss: STATS[sk.stat].gloss, xp: a.statXp });
    if (sk.stat2 && STATS[sk.stat2]) out.push({ name: STATS[sk.stat2].name, gloss: STATS[sk.stat2].gloss, xp: a.statXp });
    return out;
  },
  maxTimes(action) {
    if (!action.inputs || !action.inputs.length) return '∞';
    let m = Infinity;
    for (const inp of action.inputs) m = Math.min(m, Math.floor((this.state.inventory[inp.itemId] || 0) / inp.qty));
    return m;
  },
  startFromModal() {
    if (!this.actionModal) return;
    this.start(this.actionModal.skillId, this.actionModal.actionId);
    this.closeAction();
  },

  // ---------- Linh Thạch (buff per-skill) ----------
  linhThachDef(itemId) { return this.LINH_THACH[itemId] || null; },
  linhThachOwned(itemId) { return this.state.inventory[itemId] || 0; },
  hasLinhThachFamily(skillId) { return Object.values(this.LINH_THACH).some((d) => d.skillId === skillId); },
  // Các Linh Thạch hợp với skill (cho picker), kèm số viên đang có; có hàng lên đầu.
  skillLinhThachOptions(skillId) {
    return Object.values(this.LINH_THACH)
      .filter((d) => d.skillId === skillId)
      .map((d) => ({ ...d, owned: this.state.inventory[d.itemId] || 0 }))
      .sort((a, b) => b.owned - a.owned);
  },
  // Linh Thạch đang lắp cho skill: { itemId, skillId, expPct, effPct } hoặc null.
  currentLinhThach(skillId) {
    const itemId = this.state.linhThach && this.state.linhThach[skillId];
    if (!itemId) return null;
    const def = this.LINH_THACH[itemId];
    return def ? { itemId, ...def } : null;
  },
  linhThachEffectText(def) {
    if (!def) return '';
    const p = [];
    if (def.expPct) p.push('+' + def.expPct + '% EXP');
    if (def.effPct) p.push('+' + def.effPct + '% Hiệu Suất');
    return p.join(' · ');
  },
  assignLinhThach(skillId, itemId) {
    if (!this.state.linhThach) this.state.linhThach = {};
    this.state.linhThach[skillId] = itemId;
    Storage.save(this.state);
  },
  clearLinhThach(skillId) {
    if (this.state.linhThach) delete this.state.linhThach[skillId];
    Storage.save(this.state);
  },
  // Tiện cho modal (luôn quy về skill của modal đang mở)
  get mSkillId() { return this.actionModal ? this.actionModal.skillId : null; },
  get mHasLTFamily() { return this.mSkillId ? this.hasLinhThachFamily(this.mSkillId) : false; },
  get mLinhThach() { return this.mSkillId ? this.currentLinhThach(this.mSkillId) : null; },
  get mLTOptions() { return this.mSkillId ? this.skillLinhThachOptions(this.mSkillId) : []; },
  // Buff của hoạt động đang chạy (badge ở thẻ hoạt động)
  get actBuff() { return (this.act && this.act.buff) ? this.act.buff : null; },
  get actBuffText() { return this.actBuff ? this.linhThachEffectText(this.actBuff) : ''; },

  // ---------- Hoạt động (skill + combat) ----------
  get hasActivity() { return !!this.state.activity; },
  get act() { return this.state.activity; },
  get actIsCombat() { return !!(this.act && this.act.type === 'combat'); },
  get actIsTravel() { return !!(this.act && this.act.type === 'travel'); },
  get actIsDungeon() { return !!(this.act && this.act.type === 'dungeon'); },
  get actDungeon() { return this.actIsDungeon ? this.DUNGEON_BY_ID[this.act.dungeonId] : null; },
  get actEnemy() { return this.actIsCombat ? this.ENEMIES[this.act.enemyId] : null; },
  get actSkill() { return (this.act && !this.actIsCombat) ? this.SKILLS[this.act.skillId] : null; },
  get actAction() { return (this.act && !this.actIsCombat) ? getAction(this.act.skillId, this.act.actionId) : null; },
  get actItem() { return (this.actAction && this.actAction.itemId) ? this.ITEMS[this.actAction.itemId] : null; },
  get actName() { return this.actIsDungeon ? (this.actDungeon ? this.actDungeon.name : 'Bí Cảnh') : (this.actIsTravel ? 'Khinh Công' : (this.actIsCombat ? (this.actEnemy ? this.actEnemy.name : '') : (this.actAction ? this.actAction.name : ''))); },
  get actSub() { return this.actIsDungeon ? ('Bí Cảnh · ' + (this.act && this.act.mode === 'treo' ? 'Treo Luyện' : 'Chạy Nhanh')) : (this.actIsTravel ? ('→ ' + (this.travelToObj ? this.travelToObj.name : '')) : (this.actIsCombat ? 'Chiến Đấu' : (this.actSkill ? this.actSkill.name : ''))); },
  get actIcon() { return this.actIsDungeon ? (this.actDungeon ? this.actDungeon.seal : '🏛️') : (this.actIsTravel ? '🏃' : (this.actIsCombat ? (this.actEnemy ? this.actEnemy.icon : '⚔️') : (this.actItem ? this.actItem.icon : (this.actSkill ? this.actSkill.icon : '⏳')))); },
  get actIconId() { return this.actIsDungeon ? (this.act ? this.act.dungeonId : '') : (this.actIsTravel ? '' : (this.actIsCombat ? (this.act ? this.act.enemyId : '') : (this.actItem ? this.actItem.id : (this.actSkill ? this.actSkill.id : '')))); },
  get actCycleSec() {
    if (this.act && this.act.cycleMs) return this.act.cycleMs / 1000; // dùng cycle thực tế (đã tính buff Hiệu Suất)
    return this.actIsCombat ? (this.actEnemy ? this.actEnemy.time : 1) : (this.actAction ? this.actAction.time : 1);
  },
  get actProgressPct() { return this.act ? this.act.progress * 100 : 0; },
  get actNextInSec() { if (!this.act) return 0; return Math.ceil((1 - this.act.progress) * this.actCycleSec); },
  get actExpPerSec() {
    // Dùng cycleMs THỰC của hoạt động (combat = timePerKill, skill = đã trừ buff Nghề/Hiệu Suất)
    // → đồng bộ với rate thật mà advance() trao thưởng + harvest estimate ở tab Chiến Đấu.
    const cycleSec = (this.act && this.act.cycleMs) ? this.act.cycleMs / 1000 : 0;
    if (this.actIsCombat) {
      if (!this.actEnemy) return '0';
      const mult = skillExpMultiplier(this.state, 'chienDau');
      const expPerKill = Math.max(1, Math.round(this.actEnemy.exp * mult));
      return (cycleSec > 0 ? expPerKill / cycleSec : this.actEnemy.exp / this.actEnemy.time).toFixed(2);
    }
    if (!this.actAction) return '0';
    return (cycleSec > 0 ? this.actAction.xp / cycleSec : this.actAction.xp / this.actAction.time).toFixed(2);
  },
  get actIdleUsed() { return this.act ? (this.act.lastResolved - this.act.startedAt) / 1000 : 0; },
  get actIdleCap() { return idleCapMs(this.state) / 1000; },
  get actRemaining() { return Math.max(0, this.actIdleCap - this.actIdleUsed); },
  get actCapped() { return this.act ? this.act.capped : false; },
  get actStalled() { return this.act ? this.act.stalled : false; },
  get statusText() {
    if (!this.hasActivity) return 'Nhàn rỗi';
    if (this.actIsCombat) return 'Đang chiến đấu' + (this.actEnemy ? ' · ' + this.actEnemy.name : '');
    if (this.actIsTravel) return 'Đang khinh công' + (this.travelToObj ? ' → ' + this.travelToObj.name : '');
    if (this.actIsDungeon) return 'Đang khám phá' + (this.actDungeon ? ' · ' + this.actDungeon.name : '');
    // Hành nghề (thu thập/chế tác): dùng tên Nghề (động từ, vd "Đào Khoáng") + tên cụ thể ("Hắc Thán")
    const nghe = this.actSkill ? this.actSkill.name : '';
    const act = this.actAction ? this.actAction.name : '';
    if (nghe && act && nghe !== act) return 'Đang ' + nghe + ' · ' + act;
    return 'Đang ' + (nghe || act || 'hành tẩu');
  },

  start(skillId, actionId) {
    if (startActivity(this.state, skillId, actionId, now())) Storage.save(this.state);
  },
  stop() { stopActivity(this.state); Storage.save(this.state); },
  refreshActivity() {
    if (!this.act) return;
    const a = this.act;
    stopActivity(this.state);
    if (a.type === 'combat') startCombat(this.state, a.enemyId, now());
    else startActivity(this.state, a.skillId, a.actionId, now());
    Storage.save(this.state);
  },

  // ---------- Combat ----------
  get combatLevel() { return levelFromXp(this.state.skills['chienDau']?.xp || 0); },
  get combatProg() { return xpProgress(this.state.skills['chienDau']?.xp || 0); },
  get combatTotalXp() { return this.state.skills['chienDau']?.xp || 0; },
  get combatGathered() { return this.state.skills['chienDau']?.gathered || 0; },
  get combatTimeLabel() { return this.fmtTime((this.state.skills['chienDau']?.timeMs || 0) / 1000); },
  get stats() { return derivedStats(this.state); },
  get chienLuc() { return this.stats.chienLuc; },

  // ---------- Yêu Vương (World Boss) — VÂY SÁT THEO LƯỢT ----------
  bossSel: null,                                      // boss đang chọn ở rail (master-detail)
  _tick: 0,                                           // nhịp 1s (reactive) → đồng hồ đếm ngược tự cập nhật
  bossFight: null,                                    // trận LIVE: { id, he, frames, total, idx, pMax,bMax,pHp,bHp, log:[], turn, done, win, reward }
  _bossFrameAt: 0,                                    // mốc lộ frame gần nhất
  _bossAwayChecked: false,                            // đã resolve hàng đợi lúc load chưa
  get yeuVuongList() { return YEU_VUONG; },
  bossObj(id) { return YEU_VUONG_BY_ID[id] || null; },
  get bossSelObj() { return YEU_VUONG_BY_ID[this.bossSel] || YEU_VUONG[0]; }, // THUẦN (không ghi state khi render); bossSel set ở ensureCombat
  selectBoss(id) { if (YEU_VUONG_BY_ID[id]) this.bossSel = id; },
  bossHe(id) { return bossHe(this.state, id); },
  bossLocked(id) { const b = YEU_VUONG_BY_ID[id]; return !b || this.combatLevel < b.reqLevel; },
  bossReady(id) { return !this.bossLocked(id) && bossReady(this.state, id, now()); },     // 'alive' (đã giáng thế)
  bossCdMs(id) { return Math.max(0, bossCdEnd(this.state, id) - now()); },
  bossCdText(id) { const ms = this.bossCdMs(id); return ms <= 0 ? '' : this.fmtClock(ms / 1000); },
  bossCdLive(id) { void this._tick; return this.bossCdText(id); },   // bản tick-mỗi-giây cho UI
  // Trạng thái: 'locked' | 'fighting' | 'alive' | 'reviving'
  bossStateOf(id) {
    void this._tick;   // phụ thuộc nhịp 1s → panel chi tiết tự lật 'reviving'→'alive' khi cd về 0
    if (this.bossLocked(id)) return 'locked';
    if (this.bossFight && this.bossFight.id === id && !this.bossFight.done) return 'fighting';
    return this.bossReady(id) ? 'alive' : 'reviving';
  },
  bossQueued(id) { return bossQueued(this.state, id); },
  toggleBossQueue(id) {
    if (this.bossLocked(id)) return;
    setBossQueue(this.state, id, !bossQueued(this.state, id));
    Storage.save(this.state);
  },
  // (dự báo bossPredict + "đề nghị chiến lực" đã gỡ khỏi UI — bỏ luôn cache/getter để tránh 7-sim lãng phí + side-effect roll hệ)

  // --- Máu boss carry-over + dưỡng thương ---
  bossHpPct(id) { void this._tick; const max = bossMaxHp(id) || 1; return Math.max(0, Math.min(100, bossCurHp(this.state, id) / max * 100)); },
  bossHurt(id) { return this.bossHpPct(id) < 99.9; },               // boss đã bị thương (máu < đầy)
  isBossHealing() { void this._tick; return bossHealing(this.state, now()); },
  bossHealText() { void this._tick; const s = Math.ceil(bossHealLeftMs(this.state, now()) / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); },
  canFightBoss(id) { return this.bossReady(id) && !bossHealing(this.state, now()); },

  // --- Trận LIVE (xem từng lượt 3s) ---
  startBossFight(id) {
    if (this.bossLocked(id) || !this.bossReady(id)) return;
    if (bossHealing(this.state, now())) { this.showToast('Đang dưỡng thương — chờ hồi phục hoặc dùng vật phẩm hồi phục.'); return; }
    if (this.bossFight && !this.bossFight.done) return;   // đang đánh trận khác
    setBossQueue(this.state, id, false);                  // tự xử lý → rời hàng đợi (tránh resolve nền trao thưởng 2 lần)
    const he = bossHe(this.state, id);
    const res = runBossFight(this.state, id, he);
    if (!res) return;
    const f0 = res.frames[0];
    this.bossFight = {
      id, he, frames: res.frames, total: res.frames.length, idx: 0,
      pMax: res.pMax, bMax: res.bMax, pHp: f0.pHp, bHp: f0.bHp,
      log: f0.lines.slice().reverse(), turn: 0, done: false, win: res.win, timeout: res.timeout, reward: null,
    };
    this.bossSel = id;
    this._bossFrameAt = now();
  },
  // Lộ frame kế (rafLoop gọi mỗi BOSS_TURN_MS). Gộp frame nếu trận dài → tối đa ~14 lượt.
  revealBossFrame() {
    const F = this.bossFight; if (!F || F.done) return;
    const step = Math.max(1, Math.ceil(F.total / 14));
    const target = Math.min(F.total - 1, F.idx + step);
    for (let i = F.idx + 1; i <= target; i++) {
      const fr = F.frames[i]; F.pHp = fr.pHp; F.bHp = fr.bHp;
      for (const ln of fr.lines) F.log.unshift(ln);
    }
    if (F.log.length > 30) F.log.length = 30;
    F.idx = target; F.turn++;
    if (F.idx >= F.total - 1) this._finishBossFight();
  },
  finishBossFightNow() {   // rời màn → kết thúc tức thì (chạy nền)
    const F = this.bossFight; if (!F || F.done) return;
    for (let i = F.idx + 1; i < F.total; i++) { const fr = F.frames[i]; F.pHp = fr.pHp; F.bHp = fr.bHp; for (const ln of fr.lines) F.log.unshift(ln); }
    if (F.log.length > 30) F.log.length = 30;
    F.idx = F.total - 1;
    this._finishBossFight();
  },
  _finishBossFight() {
    const F = this.bossFight; if (!F || F.done) return;
    F.done = true;
    if (F.win) { F.reward = applyBossWin(this.state, F.id, now()); const _b = YEU_VUONG_BY_ID[F.id]; this.pushNotif('yeuVuong', 'Hạ ' + (_b ? _b.name : 'Yêu Vương'), this._bossRewardText(F.reward)); }
    else if (F.timeout) applyBossRetreat(this.state, F.id, now(), F.bHp);   // giằng co (600 nhịp, không gục) → boss giữ máu, KHÔNG dưỡng thương, thử lại ngay
    else applyBossLose(this.state, F.id, now(), F.bHp);   // gục → boss giữ máu + người chơi dưỡng thương 3p
    Storage.save(this.state);
  },
  closeBossFight() { this.bossFight = null; },
  get bossFightBHpPct() { const F = this.bossFight; return F ? Math.max(0, Math.min(100, F.bHp / Math.max(1, F.bMax) * 100)) : 0; },
  get bossFightPHpPct() { const F = this.bossFight; return F ? Math.max(0, Math.min(100, F.pHp / Math.max(1, F.pMax) * 100)) : 0; },

  // --- Hàng đợi nền + lịch sử + feed giang hồ ---
  resolveBossQueue() {
    if (this.bossFight && !this.bossFight.done) return []; // đang đánh LIVE -> KHÔNG resolve nền (tránh trao thưởng/đụng state trùng)
    const res = resolveBossQueueEngine(this.state, now(), (b) => this.combatLevel >= b.reqLevel);
    if (res.length) {
      const wins = res.filter((r) => r.win).length;
      if (wins > 0) { this.showToast('⚔ Trong lúc vắng mặt, ngươi đã hạ ' + wins + ' Yêu Vương đang chờ! Xem Lịch Sử để rõ chiến quả.'); this.pushNotif('yeuVuong', 'Hạ ' + wins + ' Yêu Vương (vắng mặt)', 'Hàng đợi vây sát thành công — xem Lịch Sử để rõ chiến quả.'); }
      else this.showToast('Khiêu chiến hàng đợi thất bại — Yêu Vương vẫn còn sống, hãy thử lại.');
      Storage.save(this.state);
    }
    return res;
  },
  checkBossAwayOnce() { if (this._bossAwayChecked) return; this._bossAwayChecked = true; this.resolveBossQueue(); },
  bossHistoryOf(id) { return ((this.state.boss && this.state.boss.history) || []).filter((h) => h.id === id); },
  bossFeed(id) { void this._tick; const b = YEU_VUONG_BY_ID[id], w = this.state.world; return (b && w) ? genBossFeed(b, w.seed, w.createdAt, now()) : []; },
  // Trộn lịch sử BẢN THÂN + chiến tích đạo hữu (roster bot thật) cho bảng Giang Hồ
  bossLog(id) {
    const nm = (YEU_VUONG_BY_ID[id] || {}).name || 'Yêu Vương';
    const W = ['trảm', 'hạ gục', 'kết liễu', 'đoạt mạng'];   // động từ luân phiên -> không một khuôn, khớp giọng bot
    const mine = this.bossHistoryOf(id).slice(0, 6).map((h, i) => ({
      uid: 'me_' + i + '_' + h.t, me: true, win: h.win, rare: !!h.rare, ago: this.agoText(h.t),
      txt: h.win
        ? (W[i % W.length] + ' ' + nm + ' · ' + this.rewardSummary(h.reward) + (h.rare ? ' ★' : ''))
        : ('khiêu chiến ' + nm + ' bất thành — trọng thương lui về'),
    }));
    const feed = this.bossFeed(id).map((f, i) => ({ ...f, uid: 'feed_' + i, ago: this.agoText(f.ts) }));
    return mine.concat(feed);
  },
  rewardSummary(rw) {
    if (!rw) return 'chiến lợi phẩm';
    const parts = [];
    if (rw.items && rw.items.tinhTheYeuVuong) parts.push(rw.items.tinhTheYeuVuong + '× Tinh Thể');
    if (rw.items) for (const k in rw.items) if (k.startsWith('egg_')) { const tier = k.endsWith('_than') ? 'Thần' : k.endsWith('_linh') ? 'Linh' : 'Phàm'; parts.push('Trứng ' + tier); }
    if (rw.honThach) parts.push(this.fmt(rw.honThach) + ' Hồn Thạch');
    return parts.join(' · ') || 'chiến lợi phẩm';
  },
  agoText(t) {
    const s = Math.max(0, Math.floor((now() - t) / 1000));
    if (s < 60) return 'vừa xong';
    if (s < 3600) return Math.floor(s / 60) + ' phút trước';
    if (s < 86400) return Math.floor(s / 3600) + ' giờ trước';
    return Math.floor(s / 86400) + ' ngày trước';
  },

  // ---------- Bản đồ hành trình ----------
  locUnlocked(loc) { return this.combatLevel >= loc.reqLevel; },
  // Tầng cảnh giới của 1 mốc cấp
  tierOf(level) { return this.REALM_TIERS.find(t => level >= t.min && level < t.max) || this.REALM_TIERS[this.REALM_TIERS.length - 1]; },
  locTier(loc) { return this.tierOf(loc.reqLevel); },
  locsInTier(t) { return this.LOCATIONS.filter((l) => l.reqLevel >= t.min && l.reqLevel < t.max); },   // nhóm vùng theo tầng cảnh giới (cho list mobile)
  isCurrentTier(t) { const lv = this.combatLevel; return lv >= t.min && lv < t.max; },
  // Đường linh khí cong (quadratic) giữa các vùng kế tiếp; bow nhẹ lên cho mềm
  get mapSegments() {
    const L = this.LOCATIONS, segs = [];
    for (let i = 0; i < L.length - 1; i++) {
      const a = L[i], b = L[i + 1];
      const mx = (a.mapX + b.mapX) / 2, my = (a.mapY + b.mapY) / 2 - 9;
      segs.push({ d: `M ${a.mapX} ${a.mapY} Q ${mx} ${my} ${b.mapX} ${b.mapY}`, reached: this.locUnlocked(b) });
    }
    return segs;
  },

  // ---------- Vị trí & Hành trình ----------
  locationObj(id) { return this.LOCATIONS.find((l) => l.id === id) || null; },
  get currentLocation() { return this.state.player.location || 'lamLinhCoc'; },
  get currentLocationObj() { return this.locationObj(this.currentLocation) || this.LOCATIONS[0]; },
  isCurrentLocation(loc) { return !!loc && loc.id === this.currentLocation; },
  locationEnemies(loc) { return (loc && loc.enemies ? loc.enemies : []).filter((id) => this.ENEMIES[id]); },
  get currentLocationEnemies() { return this.locationEnemies(this.currentLocationObj); },
  // Modal chi tiết vùng
  locationModal: null,
  openLocation(id) { this.locationModal = { id }; },
  closeLocation() { this.locationModal = null; },
  get modalLocation() { return this.locationModal ? this.locationObj(this.locationModal.id) : null; },
  // Phí / thời gian / khoảng cách tới 1 vùng (từ vị trí hiện tại)
  teleCost(loc) { return loc ? teleportCost(this.totalLevel, this.currentLocation, loc.id) : 0; },
  canAffordTele(loc) { return this.state.currencies.bac >= this.teleCost(loc); },
  walkSec(loc) { return loc ? Math.ceil(travelTimeMs(this.currentLocation, loc.id) / 1000) : 0; },
  walkLabel(loc) { return this.fmtTime(this.walkSec(loc)); },
  distLabel(loc) { return loc ? Math.round(mapDistance(this.currentLocation, loc.id) * 12) : 0; }, // ×12 -> "dặm" cho hợp giang hồ
  // Truyền Tống: tốn Bạc, tức thì. Đang Khinh Công thì huỷ; gather/combat khác vẫn giữ.
  teleportTo(id) {
    const loc = this.locationObj(id);
    if (!loc || id === this.currentLocation || !this.locUnlocked(loc)) return;
    const cost = this.teleCost(loc);
    if (this.state.currencies.bac < cost) return;
    this.state.currencies.bac -= cost;
    if (this.actIsTravel) stopActivity(this.state);  // đang đi bộ -> huỷ
    this.state.player.location = id;
    Storage.save(this.state);
    this.closeLocation();
  },
  // Khinh Công là 1 HOẠT ĐỘNG -> THAY hoạt động đang chạy (chặt/đào/đánh) bằng đếm ngược đi đường.
  startKhinhCong(id) {
    const loc = this.locationObj(id);
    if (!loc || id === this.currentLocation || !this.locUnlocked(loc)) return;
    if (startTravel(this.state, id, now())) Storage.save(this.state);
    this.closeLocation();
  },
  cancelTravel() { if (this.actIsTravel) { stopActivity(this.state); Storage.save(this.state); } },
  // Trạng thái đang đi (đọc từ activity type 'travel')
  get isTraveling() { return this.actIsTravel; },
  get travelToObj() { return this.actIsTravel ? this.locationObj(this.act.toId) : null; },
  get travelToId() { return this.actIsTravel ? this.act.toId : null; },
  get travelProgressPct() { return this.actIsTravel ? (this.act.progress || 0) * 100 : 0; },
  get travelRemainSec() {
    if (!this.actIsTravel) return 0;
    return Math.max(0, Math.ceil(this.act.cycleMs * (1 - (this.act.progress || 0)) / 1000));
  },

  // ---------- Combat: Tuyệt Học Phổ ----------
  fmtDur(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h) return h + 'h ' + m + 'm';
    if (m) return m + 'm' + (s ? ' ' + s + 's' : '');
    return s + 's';
  },
  // Thời lượng 1 VÒNG giao chiến (giây) — cadence thật: hạ 1 con mỗi vòng 8s
  get combatRoundSec() { return CYCLE_MS / 1000; },
  // Dự Tính Thu Hoạch theo giờ — bám theo VÒNG 8s (1 con/vòng), khớp với rate widget + advance() thật
  get harvestEstimate() {
    const id = this.combatSel; const e = id && this.ENEMIES[id]; const fc = id && this.combatFc[id];
    if (!e || !fc) return null;
    const roundSec = this.combatRoundSec;                 // 8s/con — không dùng thời lượng trận (sim) cho tốc độ nữa
    const kph = 3600 / roundSec;
    const mult = skillExpMultiplier(this.state, 'chienDau');
    const expPer = Math.max(1, Math.round(e.exp * mult));
    const bacPer = Math.max(1, Math.round(e.exp * 1.5));
    let survival, endureSec;
    if (fc.lvl === '❌' && fc.endure === 'thua') { survival = 0; endureSec = 0; }
    else if (fc.fights === Infinity || fc.hpLostPerKill <= 0) { survival = 99; endureSec = Infinity; }
    else { survival = Math.min(99, Math.round(100 * fc.fights / (fc.fights + 1))); endureSec = fc.fights * roundSec; }
    return {
      expPer, bacPer,
      expH: Math.round(kph * expPer), bacH: Math.round(kph * bacPer), killH: Math.round(kph),
      survival, endure: endureSec === Infinity ? 'Vô hạn' : (endureSec <= 0 ? '—' : this.fmtDur(endureSec)),
      lvl: fc.lvl, verdict: fc.verdict,
    };
  },
  enemyExpPerSec(e) { return (e.exp / (e.time || 1)).toFixed(2); },
  canFight(e) { return this.chienLuc >= (e.power || 0); },
  combatSel: null,
  combatFc: {},
  get loadout() { return this.state.combat.loadout; },
  get combatStats() { return deriveCombat(this.state, this.loadout); },
  get combatMaxHp() { return this.combatStats.maxHP; },
  // ===== NGUỒN SKILL (Bước 6): sở hữu / học (Bạc) / mua (Nguyên Bảo) =====
  get owned() { return this.state.combat.owned || (this.state.combat.owned = normOwned(this.state.combat)); },
  ownsChieu(id) { return this.owned.chieu.includes(id); },
  ownsTamPhap(id) { return this.owned.tamPhap.includes(id); },
  ownsBiDong(id) { return this.owned.biDong.includes(id); },
  chieuCost(c) { return chieuCost(c); },
  tamPhapCost(t) { return tamPhapCost(t); },
  biDongCost(p) { return biDongCost(p); },
  skillSource(cost) { return skillSource(cost); },              // 'hoc' | 'mua'
  monPhaiOf(he) { return monPhaiOf(he); },
  tierLabel(t) { return TIER_LABEL[t] || t; },
  // tiền tệ của 1 món chi phí + kiểm tra đủ + chữ hiển thị
  costCur(cost) { return (cost && cost.nguyenBao) ? 'nguyenBao' : (cost && cost.honThach ? 'honThach' : 'bac'); },
  canAffordCost(cost) { if (!cost) return true; const cur = this.costCur(cost); return (this.state.currencies[cur] || 0) >= cost[cur]; },
  costText(cost) { if (!cost) return ''; const cur = this.costCur(cost); const nm = { bac: 'Bạc', nguyenBao: 'Nguyên Bảo', honThach: 'Hồn Thạch' }[cur]; return this.fmt(cost[cur]) + ' ' + nm; },
  costAmt(cost) { if (!cost) return ''; return this.fmt(cost[this.costCur(cost)]); },
  costEmoji(cost) { return { bac: '🟡', nguyenBao: '🔷', honThach: '🔴' }[this.costCur(cost)]; },
  costIcon(cost) { const cur = this.costCur(cost); return this.ico(cur, this.costEmoji(cost)); },  // ảnh currency thật (images/currency/<cur>.png) + fallback emoji
  // --- Item helpers (popup loot) ---
  // x = string id (vật phẩm xếp chồng) HOẶC view/instance gear (có .quality) — phẩm chất ĐA HÌNH.
  _qKey(x) { return (x && typeof x === 'object') ? x.quality : (this.ITEMS[x] || {}).quality; },
  itemQuality(x) { return this.QUALITY[this._qKey(x)] || this.QUALITY.phamPham; },
  get QUALITY_KEYS() { return Object.keys(this.QUALITY); },                                   // thứ tự thấp -> cao
  qualityRank(x) { const i = this.QUALITY_KEYS.indexOf(this._qKey(x)); return i < 0 ? 1 : i + 1; }, // 1..7
  qualityName(x) { return this.itemQuality(x).name; },
  itemDescOf(x) { const id = (x && typeof x === 'object') ? x.id : x; const it = this.ITEMS[id] || {}; return it.desc || ('Chiến lợi phẩm ' + this.itemQuality(x).name + ', thu được khi hạ yêu thú.'); },
  _spendCost(cost) { if (!cost) return true; const cur = this.costCur(cost); if ((this.state.currencies[cur] || 0) < cost[cur]) return false; this.state.currencies[cur] -= cost[cur]; return true; },
  // HỌC/MUA: trừ tiền + thêm vào sở hữu. Trả true nếu thành công.
  learnChieu(id) {
    const c = chieuById(id); if (!c || this.ownsChieu(id)) return false;
    const cost = this.chieuCost(c), mua = this.skillSource(cost) === 'mua';
    if (!this.canAffordCost(cost)) { this.showToast('Không đủ ' + this.costText(cost) + ' để ' + (mua ? 'mua' : 'học') + ' 〈' + c.name + '〉.'); return false; }
    this._spendCost(cost); this.owned.chieu.push(id); Storage.save(this.state);
    this.showToast((mua ? '🪙 Đã mua bí phổ ' : '📖 Đã học ') + '〈' + c.name + '〉.'); return true;
  },
  learnTamPhap(id) {
    const t = tamPhapById(id); if (!t || this.ownsTamPhap(id)) return false;
    const cost = this.tamPhapCost(t), mua = this.skillSource(cost) === 'mua';
    if (!this.canAffordCost(cost)) { this.showToast('Không đủ ' + this.costText(cost) + ' để ' + (mua ? 'mua' : 'học') + ' 《' + t.name + '》.'); return false; }
    this._spendCost(cost); this.owned.tamPhap.push(id); Storage.save(this.state);
    this.showToast('📖 Đã lĩnh hội nội công 《' + t.name + '》.'); return true;
  },
  learnBiDong(id) {
    const p = biDongById(id); if (!p || this.ownsBiDong(id)) return false;
    const cost = this.biDongCost(p), mua = this.skillSource(cost) === 'mua';
    if (!this.canAffordCost(cost)) { this.showToast('Không đủ ' + this.costText(cost) + ' để ' + (mua ? 'mua' : 'học') + ' 〈' + p.name + '〉.'); return false; }
    this._spendCost(cost); this.owned.biDong.push(id); Storage.save(this.state);
    this.showToast('📖 Đã lĩnh hội tâm pháp bị động 〈' + p.name + '〉.'); return true;
  },
  // --- Tàng Kinh Các: gom toàn bộ võ học theo Môn Phái (hệ) ---
  get tangKinhSections() {
    const order = NGU_HANH_LIST.concat(['vatly', 'buff']);
    return order.map(he => {
      const chieu = CHIEU.filter(c => c.type === he).sort((a, b) => (TIER_ORDER[a.tier] || 0) - (TIER_ORDER[b.tier] || 0)).map(c => ({ kind: 'chieu', id: c.id, obj: c }));
      const tamphap = TAM_PHAP_POOL.filter(t => t.he === he).map(t => ({ kind: 'tamphap', id: t.id, obj: t }));
      const bidong = BI_DONG.filter(p => p.he === he).map(p => ({ kind: 'bidong', id: p.id, obj: p }));
      // Phân loại trong từng Môn Phái: Tâm Pháp (nội công nền) · Chiêu Thức (chủ động) · Bị Động (auto)
      const groups = [
        { key: 'tamphap', label: 'Tâm Pháp', items: tamphap },
        { key: 'chieu', label: 'Chiêu Thức', items: chieu },
        { key: 'bidong', label: 'Bị Động', items: bidong },
      ].filter(g => g.items.length);
      const items = [...tamphap, ...chieu, ...bidong];
      return { he, monPhai: MON_PHAI[he], items, groups };
    });
  },
  itemOwned(it) { return it.kind === 'chieu' ? this.ownsChieu(it.id) : it.kind === 'tamphap' ? this.ownsTamPhap(it.id) : this.ownsBiDong(it.id); },
  itemCost(it) { return it.kind === 'chieu' ? chieuCost(it.obj) : it.kind === 'tamphap' ? tamPhapCost(it.obj) : biDongCost(it.obj); },
  itemImg(it) { return 'images/' + (it.kind === 'tamphap' ? 'tamphap' : it.kind === 'bidong' ? 'bidong' : 'chieu') + '/' + it.id + '.webp'; },
  itemKindLabel(it) { return it.kind === 'chieu' ? 'Chiêu' : it.kind === 'tamphap' ? 'Tâm Pháp' : 'Bị Động'; },
  itemTier(it) { return it.kind === 'chieu' ? it.obj.tier : (it.kind === 'tamphap' ? 'trung' : 'trung'); },
  itemDesc(it) { return it.kind === 'chieu' ? (it.obj.short || '') : (it.obj.short || it.obj.desc || ''); },
  itemTagList(it) { return it.kind === 'chieu' ? this.chieuTags(it.obj) : (it.kind === 'bidong' ? this.biDongTags(it.obj) : []); },
  learnItem(it) { return it.kind === 'chieu' ? this.learnChieu(it.id) : it.kind === 'tamphap' ? this.learnTamPhap(it.id) : this.learnBiDong(it.id); },

  // ---------- Vạn Vật Phổ ----------
  get codexCats() { return CODEX_CATS; },
  get codexCat() { return CODEX_BY_KEY[this.codexTab] || CODEX_CATS[0]; },
  codexCnt(catKey, id) { return codexCount(this.state, catKey, id); },
  codexEntryState(cat, e) { const c = codexCount(this.state, cat.key, e.id); return c >= cat.threshold ? 'done' : (c > 0 ? 'prog' : 'locked'); },
  codexEntryPct(cat, e) { return Math.min(100, Math.round(codexCount(this.state, cat.key, e.id) / cat.threshold * 100)); },
  codexCatDoneN(cat) { return codexCatDone(this.state, cat); },
  codexGroupDone(cat, grp) { let n = 0; for (const e of grp.entries) if (codexCount(this.state, cat.key, e.id) >= cat.threshold) n++; return n; },
  get codexTotalDone() { return CODEX_CATS.reduce((a, c) => a + codexCatDone(this.state, c), 0); },
  get codexTotalAll() { return CODEX_CATS.reduce((a, c) => a + c.entries.length, 0); },
  codexOpen(e) { this.codexDetail = e; },
  closeCodex() { this.codexDetail = null; },
  // Art tile theo loại phổ: quái/pet dùng ảnh thật (fallback emoji nền), gear/vật phẩm dùng ico(), bí cảnh dùng triện.
  codexArtTag(cat, e) {
    const safe = String(e.icon || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const drop = `this.replaceWith(Object.assign(document.createElement(&quot;span&quot;),{className:&quot;text-4xl opacity-90&quot;,textContent:&quot;${safe}&quot;}))`;
    if (cat.kind === 'enemy') return `<img src="images/enemies/${e.id}.webp" class="w-full h-full object-cover" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=this.src.replace(&quot;.webp&quot;,&quot;.png&quot;)}else{${drop}}'>`;
    if (cat.kind === 'pet') return `<img src="images/pets/pet_${e.id}_base.webp" class="w-full h-full object-contain" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=this.src.replace(&quot;.webp&quot;,&quot;.png&quot;)}else{${drop}}'>`;
    if (cat.kind === 'gear' || cat.kind === 'item') return this.ico(e.id, e.icon);
    if (cat.kind === 'dungeon') return `<img src="images/dungeons/${e.id}.webp" class="w-full h-full object-cover" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=this.src.replace(&quot;.webp&quot;,&quot;.png&quot;)}else{${drop}}'>`;
    return `<span class="text-4xl fserif opacity-90">${e.icon || ''}</span>`;
  },
  // Phổ Lực tóm tắt (chuỗi) để hiển thị header
  codexPhoLucText() {
    const b = codexBonus(this.state);
    const parts = [];
    if (b.atkPct || b.allPct) parts.push('+' + (((b.atkPct + b.allPct) * 100).toFixed(1)) + '% Công');
    if (b.defPct || b.allPct) parts.push('+' + (((b.defPct + b.allPct) * 100).toFixed(1)) + '% Thủ');
    if (b.hpPct || b.allPct) parts.push('+' + (((b.hpPct + b.allPct) * 100).toFixed(1)) + '% Sinh Lực');
    return parts.length ? parts.join(' · ') : 'Chưa có';
  },
  tierStyle(t) { return tierStyle(t); },
  // Gom style hiển thị 1 thẻ võ học: phẩm chất (bậc) cho Chiêu · loại cho Tâm Pháp/Bị Động.
  itemMeta(it) {
    const he = it.kind === 'chieu' ? it.obj.type : it.obj.he;
    const han = (NGU_HANH[he] || {}).han || '';
    if (it.kind === 'chieu') {
      const ts = tierStyle(it.obj.tier);
      return { he, han, badgeText: ts.label, badgeCls: ts.badge, borderCls: ts.border, ringCls: ts.ring, glowCls: ts.glow, metaLine: 'Chiêu Thức · ' + ts.label, metaText: ts.text };
    }
    if (it.kind === 'tamphap') return { he, han, badgeText: 'Tâm Pháp', badgeCls: 'bg-amber-500/85 text-ink font-bold', borderCls: 'border-amber-500/55', ringCls: 'ring-1 ring-amber-400/25', glowCls: '', metaLine: 'Tâm Pháp · Nội công nền', metaText: 'text-amber-300/80' };
    return { he, han, badgeText: 'Bị Động', badgeCls: 'bg-violet-600/85 text-violet-50 font-bold', borderCls: 'border-violet-500/55', ringCls: 'ring-1 ring-violet-400/25', glowCls: '', metaLine: 'Bị Động · Tự động', metaText: 'text-violet-300/80' };
  },
  // ---- Popup chi tiết võ học (Tàng Kinh Các): bấm tile -> hiện chỉ số đầy đủ ----
  tkDetail: null,
  openTkDetail(it) { this.tkDetail = it; },
  closeTkDetail() { this.tkDetail = null; },
  // Ước tính sát thương chiêu từ Công thật của nhân vật (chưa trừ thủ địch — bản nền).
  tkChieuDmg(c) {
    const P = this.combatStats; if (!P || !c) return 0;
    let d = P.atk * (c.mult || 0);
    if (c.type && c.type !== 'vatly') { const eleB = (c.type === P.heChinh ? (P.tamPhapHeBonus || 0) : 0) + ((P.eleBonus && P.eleBonus[c.type]) || 0); d *= (1 + eleB); }
    return Math.max(1, Math.round(d));
  },
  // Các dòng chỉ số trong popup, theo loại võ học (chiêu / tâm pháp / bị động).
  tkRows(it) {
    if (!it) return [];
    const o = it.obj, rows = [];
    if (it.kind === 'chieu') {
      rows.push({ k: 'Sát thương', v: '×' + o.mult + ' ST · ≈' + this.fmt(this.tkChieuDmg(o)), hl: true });
      rows.push({ k: 'Hệ', v: o.type === 'vatly' ? 'Vật lý' : heName(o.type) });
      rows.push({ k: 'Nội Lực tiêu', v: o.nl || 0 });
      rows.push({ k: 'Hồi chiêu', v: o.cd ? (o.cd + ' hiệp') : 'Tức thì' });
      if (o.burn) rows.push({ k: 'Bỏng', v: o.burn.dmg + '/hiệp × ' + o.burn.ticks + ' hiệp' });
      if (o.lifesteal) rows.push({ k: 'Hút máu', v: Math.round(o.lifesteal * 100) + '%' });
      if (o.slow) rows.push({ k: 'Làm chậm', v: o.slow + ' hiệp' });
      if (o.pen) rows.push({ k: 'Xuyên giáp', v: Math.round(o.pen * 100) + '%' });
    } else if (it.kind === 'tamphap') {
      rows.push({ k: 'Đổi hệ', v: heName(o.he) });
      rows.push({ k: 'Tăng ST hệ', v: '+' + Math.round((o.heBonus || 0) * 100) + '%', hl: true });
      if (o.noiLuc != null) rows.push({ k: 'Nội Lực', v: o.noiLuc });
      if (o.nlRegen != null) rows.push({ k: 'Hồi Nội Lực', v: '+' + o.nlRegen + '/đánh thường' });
    } else {
      (o.desc || '').split('·').forEach((p, i) => { const t = p.trim(); if (t) rows.push({ k: i === 0 ? 'Hiệu ứng' : '', v: t, hl: i === 0 }); });
      rows.push({ k: 'Loại', v: 'Bị động · luôn bật' });
    }
    return rows;
  },
  get tkFlavor() { const it = this.tkDetail; if (!it) return ''; const o = it.obj; return o.lore || o.short || ''; },
  get tangKinhOwnedCount() { return this.owned.chieu.length + this.owned.tamPhap.length + this.owned.biDong.length; },
  get tangKinhTotalCount() { return CHIEU.length + TAM_PHAP_POOL.length + BI_DONG.length; },
  // --- Tâm Pháp (nội công nền, ĐỔI được — 5 hệ ngũ hành) ---
  get tamPhapObj() { return tamPhapById(this.loadout.tamPhap); },
  tamPhapModal: false,
  openTamPhap() { this.tamPhapModal = true; },
  closeTamPhap() { this.tamPhapModal = false; },
  tamPhapOn(id) { return this.loadout.tamPhap === id; },
  switchTamPhap(id) {
    if (!TAM_PHAP_POOL.some(t => t.id === id)) return;
    if (!this.ownsTamPhap(id)) { this.showToast('Chưa lĩnh hội Tâm Pháp này — học ở Tàng Kinh Các trước.'); return; }
    this.state.combat.loadout.tamPhap = id;
    this.recomputeCombatFc(); Storage.save(this.state);
    this.showToast('Đổi Tâm Pháp: ' + tamPhapById(id).name);
  },
  // --- Popup CHI TIẾT Tâm Pháp khởi tu (màn tạo NV): xem võ học hệ đó trước khi chọn ---
  tpDetail: null,
  openTpDetail(id) { this.tpDetail = id; },
  closeTpDetail() { this.tpDetail = null; },
  get tpDetailObj() { return this.tpDetail ? tamPhapById(this.tpDetail) : null; },
  heChieu(he) { return CHIEU.filter((c) => c.type === he).sort((a, b) => (TIER_ORDER[a.tier] || 0) - (TIER_ORDER[b.tier] || 0)); },
  heBiDong(he) { return BI_DONG.filter((p) => p.he === he); },
  pickTpFromDetail() { if (this.tpDetail) { this.pickTamPhap(this.tpDetail); this.closeTpDetail(); } },
  // --- Popup Thiết Lập Bài Võ (art-tile): Tâm Pháp + Chiêu Thức ---
  baiVoModal: false,
  baiVoPanel: 'chieu',                 // panel khởi tạo khi mở ('chieu' | 'tamphap')
  openBaiVo(panel) { this.baiVoPanel = ['tamphap', 'bidong'].includes(panel) ? panel : 'chieu'; this.baiVoModal = true; },
  closeBaiVo() { this.baiVoModal = false; },
  chieuObj(id) { return chieuById(id); },
  get equippedChieuObjs() { return this.loadout.chieu.map(id => chieuById(id)).filter(Boolean); },
  chieuEquipped(id) { return this.loadout.chieu.includes(id); },
  chieuOrderNo(id) { const i = this.loadout.chieu.indexOf(id); return i < 0 ? null : i + 1; },
  // --- Bị Động (pool chọn tối đa 2) ---
  biDongObj(id) { return biDongById(id); },
  get biDongSel() { return normBiDong(this.loadout); },
  get equippedBiDongObjs() { return this.biDongSel.map(id => biDongById(id)).filter(Boolean); },
  biDongOn(id) { return this.biDongSel.includes(id); },
  get maxBiDongSlots() { return 2; },
  toggleBiDong(id) {
    const arr = this.biDongSel.slice(), i = arr.indexOf(id);
    if (i >= 0) arr.splice(i, 1);
    else { if (!this.ownsBiDong(id)) { this.showToast('Chưa lĩnh hội Bị Động này — học ở Tàng Kinh Các trước.'); return; } if (arr.length >= this.maxBiDongSlots) { this.showToast('Tối đa ' + this.maxBiDongSlots + ' Bị Động — bỏ bớt 1 trước.'); return; } arr.push(id); }
    this.state.combat.loadout.biDong = arr;
    this.recomputeCombatFc(); Storage.save(this.state);
  },
  biDongTags(p) {
    if (!p) return [];
    const t = [];
    if (p.eleDmg) t.push('+' + Math.round(p.eleDmg * 100) + '% ST chiêu ' + heName(p.he));
    if (p.regen) t.push('Hồi ' + (p.regen * 100) + '% Sinh Lực/giây');
    if (p.mod) { const m = p.mod, lbl = { dmg: 'Công', def: 'Thủ', hp: 'Sinh Lực', spd: 'Tốc', crit: 'Bạo kích', critDmg: 'ST bạo', nl: 'Nội Lực', nlRegen: 'hồi NL', dodge: 'Né' };
      for (const k in m) t.push((m[k] > 0 ? '+' : '') + Math.round(m[k] * 100) + '% ' + (lbl[k] || k)); }
    return t;
  },
  // Mô tả hiệu ứng của 1 chiêu (dùng ở bảng chi tiết)
  chieuTags(c) {
    if (!c) return [];
    const t = [];
    if (c.burn) t.push((c.type === 'moc' ? 'Độc' : 'Bỏng') + ' ' + c.burn.dmg + '/hiệp × ' + c.burn.ticks + ' hiệp');
    if (c.lifesteal) t.push('Hút máu ' + Math.round(c.lifesteal * 100) + '% ST');
    if (c.heal) t.push('Hồi ' + Math.round(c.heal * 100) + '% Sinh Lực');
    if (c.slow) t.push('Làm chậm địch ' + c.slow + ' hiệp');
    if (c.stun) t.push('Choáng ' + Math.round(c.stun * 100) + '%');
    if (c.pen) t.push('Xuyên ' + Math.round(c.pen * 100) + '% Thủ');
    if (c.critBonus) t.push('+' + Math.round(c.critBonus * 100) + '% Bạo kích');
    if (c.buff) t.push('+' + Math.round(c.buff.dmg * 100) + '% ST (' + c.buff.ticks + 's)');
    return t;
  },
  // --- Ngũ hành helpers ---
  heName(he) { return heName(he); },
  heInfo(he) { return heInfo(he); },
  heMod(atkHe, defHe) { return nguHanhMod(atkHe, defHe); },
  // Yêu thú đổi hệ NGẪU NHIÊN mỗi trận → cho biết hệ Tâm Pháp của ngươi KHẮC những hệ nào / BỊ hệ nào khắc.
  get myHeMatchup() {
    const my = this.combatStats.heChinh, khac = [], bi = [];
    NGU_HANH_LIST.forEach(h => { const m = nguHanhMod(my, h); if (m > 0) khac.push(h); else if (m < 0) bi.push(h); });
    return { my, khac, bi, khacNames: khac.map(heName).join(' / '), biNames: bi.map(heName).join(' / ') };
  },
  // --- Số ô kĩ năng mở theo Chiến Đấu Lv (4 ô gồm Tâm Pháp, +1 mỗi 30 cấp) ---
  get maxComboSlots() { return maxComboSlots(this.combatLevel); },
  get maxChieuSlots() { return maxChieuSlots(this.combatLevel); },
  get nextSlotLevel() { return nextSlotLevel(this.combatLevel); },
  get chieuSlotsUsed() { return this.loadout.chieu.length; },
  get combatSinhLuc() {
    void this._cycleNow;                                  // nudge: rafLoop bơm _cycleNow lúc suy yếu -> thanh HP hồi mượt
    const c = this.state.combat;
    if (c.noiThuong && c.suyYeuUntil) {                   // suy yếu: HP hồi tuyến tính 0 -> đầy trong 60s
      const frac = Math.max(0, Math.min(1, 1 - (c.suyYeuUntil - now()) / SUY_YEU_MS));
      return Math.round(this.combatMaxHp * frac);
    }
    const s = c.sinhLuc;
    return s == null ? this.combatMaxHp : Math.max(0, Math.min(s, this.combatMaxHp));
  },
  get combatHpPct() { return this.combatMaxHp ? this.combatSinhLuc / this.combatMaxHp * 100 : 0; },
  get combatNoiThuong() { return this.state.combat.noiThuong; },
  get combatSelObj() { return this.combatSel ? this.ENEMIES[this.combatSel] : null; },
  boPhapName(id) { return boPhapById(id).name; },
  get boPhapSel() { return normBoPhap(this.loadout); },          // mảng 1-2 id đang chọn
  boPhapOn(id) { return this.boPhapSel.includes(id); },
  get boPhapSelObjs() { return this.boPhapSel.map(id => boPhapById(id)); },
  boPhapModal: false,
  openBoPhap() { this.boPhapModal = true; },
  closeBoPhap() { this.boPhapModal = false; },
  ensureCombat() {
    const list = this.currentLocationEnemies;
    if (!this.combatSel || !list.includes(this.combatSel)) this.combatSel = list[0] || null;
    if (!this.bossSel || !YEU_VUONG_BY_ID[this.bossSel]) { const fb = YEU_VUONG.find((b) => this.combatLevel >= b.reqLevel) || YEU_VUONG[0]; this.bossSel = fb.id; } // set Yêu Vương mặc định ở đây (bossSelObj giờ THUẦN)
    this.recomputeCombatFc();
  },
  setCombatSel(id) { this.combatSel = id; },
  // Popup Suy Tính: bấm vào quái -> chọn + mở bảng chi tiết
  combatModal: false,
  openCombatModal(id) { this.combatSel = id; this.recomputeCombatFc(); this.combatModal = true; },
  closeCombatModal() { this.combatModal = false; },
  // Chọn 1-2 Bộ Pháp: bấm để bật/tắt; tối thiểu 1, tối đa 2.
  toggleBoPhap(id) {
    const arr = this.boPhapSel.slice(), i = arr.indexOf(id);
    if (i >= 0) { if (arr.length <= 1) { this.showToast('Phải giữ ít nhất 1 Bộ Pháp'); return; } arr.splice(i, 1); }
    else { if (arr.length >= 2) { this.showToast('Tối đa 2 Bộ Pháp'); return; } arr.push(id); }
    this.state.combat.loadout.boPhap = arr;
    this.recomputeCombatFc(); Storage.save(this.state);
  },
  toggleChieu(id) {
    const arr = this.state.combat.loadout.chieu, i = arr.indexOf(id), cap = this.maxChieuSlots;
    if (i >= 0) arr.splice(i, 1);
    else { if (!this.ownsChieu(id)) { this.showToast('Chưa sở hữu chiêu này — học hoặc mua trước.'); return; } if (arr.length >= cap) { this.showToast('Hết ô chiêu (' + cap + '). Mở thêm ô ở Chiến Đấu Lv ' + this.nextSlotLevel + '.'); return; } arr.push(id); }
    this.recomputeCombatFc(); Storage.save(this.state);
  },
  recomputeCombatFc() {
    const o = {};
    for (const id of this.currentLocationEnemies) o[id] = combatProfile(this.state, this.loadout, this.ENEMIES[id]);
    this.combatFc = o;
  },
  combatVerdictCls(id) { const r = this.combatFc[id], l = r ? r.lvl : ''; return l === '✅' ? 'text-jade' : (l === '⚠️' ? 'text-amber-300' : 'text-rose-400'); },
  combatBorderCls(id) { const r = this.combatFc[id], l = r ? r.lvl : ''; return l === '✅' ? 'border-jade/60' : (l === '⚠️' ? 'border-amber-400/60' : 'border-rose-500/60'); },
  combatChieuDmg(c) {
    const e = this.combatSelObj; if (!e || c.type === 'buff') return 0;
    const P = this.combatStats; let d = P.atk * c.mult;
    // Hệ địch ngẫu nhiên mỗi trận → preview là ST NỀN (chưa tính khắc/kháng, sẽ ±30/20% tuỳ trận).
    if (c.type !== 'vatly') { const eleB = (c.type === P.heChinh ? P.tamPhapHeBonus : 0) + ((P.eleBonus && P.eleBonus[c.type]) || 0); d *= (1 + eleB); }
    const defEff = Math.max(0, e.def * (1 - (c.pen || 0)));
    d *= 100 / (100 + defEff);
    return Math.max(1, Math.round(d));
  },
  fight(id) {
    if (this.combatNoiThuong) { this.showToast('Đang suy yếu — chờ hồi phục đầy Sinh Lực.'); return; }
    if (startCombat(this.state, id, now())) { this.chienBao = []; this._cycleStart = 0; this._cycleNow = now(); this._nlNow = null; this._roundNo = 0; Storage.save(this.state); }
  },
  // Suy yếu: số giây hồi phục còn lại (banner đếm ngược). HP% lấy từ combatHpPct.
  get suyYeuRemainSec() { void this._cycleNow; const u = this.state.combat.suyYeuUntil; return u ? Math.max(0, Math.ceil((u - now()) / 1000)) : 0; },
  recoverFromSuyYeu() { this.state.combat.noiThuong = false; this.state.combat.sinhLuc = null; this.state.combat.noiLuc = null; this.state.combat.suyYeuUntil = 0; Storage.save(this.state); this.showToast('Vết thương đã lành — Sinh Lực hồi đầy, có thể chiến đấu tiếp.'); },
  // --- Chiến báo theo CHU KỲ (mỗi vòng 8s = 1 trận; hết vòng mới hiện trọn chiến báo + kết quả) ---
  chienBao: [],             // mảng các BLOCK trận: { lines:[{h,c}], won }
  _cycleStart: 0,           // mốc bắt đầu vòng hiện tại (0 = chưa chạy; vòng đầu chỉ ra sau khi đếm đủ 8s)
  _cycleNow: 0,             // nhịp thời gian (rafLoop cập nhật) -> thanh tiến độ vòng phản ứng
  _nlNow: null,             // Nội Lực sau trận gần nhất (đồng bộ với log)
  _roundNo: 0,              // số thứ tự vòng giao chiến (đánh số vào chiến báo)
  get combatMaxNL() { return Math.round(this.combatStats.maxNL); },
  get combatNoiLucNow() { const v = this.state.combat.noiLuc; return v == null ? this.combatMaxNL : Math.max(0, Math.min(Math.round(v), this.combatMaxNL)); },
  get combatNoiLucPct() { return this.combatMaxNL ? this.combatNoiLucNow / this.combatMaxNL * 100 : 0; },
  get cycleProgressPct() { if (!this.actIsCombat || !this._cycleStart) return 0; return Math.max(0, Math.min(100, (this._cycleNow - this._cycleStart) / CYCLE_MS * 100)); },
  get cycleRemainSec() { if (!this.actIsCombat || !this._cycleStart) return Math.ceil(CYCLE_MS / 1000); return Math.max(0, Math.ceil((CYCLE_MS - (this._cycleNow - this._cycleStart)) / 1000)); },
  // Giải quyết TRỌN 1 trận trong tích tắc, dồn chiến báo + kết quả thành 1 block hiện cùng lúc
  resolveCycle() {
    if (!this.actIsCombat || this.combatNoiThuong) return;
    const enemy = this.ENEMIES[this.act.enemyId]; if (!enemy) return;
    autoEatTick(this.state, this.combatMaxHp);            // tự dùng Món Ăn / Đan hồi máu khi Sinh Lực < 25%
    const maxNL = this.combatMaxNL;                       // Nội Lực trôi qua các trận + tự dùng đan hồi Nội Lực < 25%
    let nl = this.state.combat.noiLuc == null ? maxNL : this.state.combat.noiLuc;
    const rNL = autoDanNL(this.state, maxNL, nl); if (rNL) nl = Math.min(maxNL, nl + rNL);
    const hp0 = this.combatSinhLuc;                          // máu trước trận (cho Linh Thú chia lửa)
    const f = makeFight(this.combatStats, this.loadout.chieu, enemy, this.combatSinhLuc, null, nl);
    let g = 0; while (!f.over && g < 400) { stepFight(f); g++; }
    this.state.combat.noiLuc = Math.round(f.p.nl);        // lưu Nội Lực còn lại (trôi sang trận sau)
    this._nlNow = this.state.combat.noiLuc;               // đồng bộ thanh Nội Lực với log
    this._roundNo = (this._roundNo || 0) + 1;             // đánh số vòng
    this.chienBao.unshift({ no: this._roundNo, lines: f.log.slice(), won: f.result === 'win', he: f.eHe });
    if (this.chienBao.length > 12) this.chienBao = this.chienBao.slice(0, 12);
    const box = document.getElementById('chienBaoBox'); if (box) box.scrollTop = 0;
    if (f.result === 'win') {
      this.awardKill(f);                                    // đã lưu state.combat.sinhLuc = HP còn lại
      const dmg = Math.max(0, hp0 - this.state.combat.sinhLuc);
      const pc = petCombatCycle(this.state, dmg, now());    // Linh Thú: chia lửa + bị động + chủ động
      const add = (pc.absorb || 0) + (pc.heal || 0);
      if (add > 0) this.state.combat.sinhLuc = Math.min(this.combatMaxHp, this.state.combat.sinhLuc + add);
      if (pc.skill && this.chienBao[0]) {                   // tuyệt kĩ phát -> dòng riêng trong chiến báo
        const pn = this.petName(this.activePetObj);
        let h = '<span class="text-jade">✦</span> ' + pn + ' thi triển 〈' + pc.skill.name + '〉, giáng <b class="dmg">' + this.fmt(pc.skill.dmg) + '</b> sát thương phụ trợ';
        if (pc.skill.heal > 0) h += ', hồi <span class="text-jade">' + this.fmt(pc.skill.heal) + '</span> sinh lực cho chủ';
        this.chienBao[0].lines.push({ h: h + '.', c: 'text-jade' });
      }
    } else this.combatDeath();
  },
  awardKill(f) {
    const e = this.ENEMIES[this.act.enemyId]; if (!e) return;
    const mult = skillExpMultiplier(this.state, 'chienDau');
    const xpGain = Math.max(1, Math.round(e.exp * mult));
    addSkillXp(this.state, 'chienDau', xpGain);
    const rp = gainPetXp(this.state, Math.round(xpGain * 0.5));   // Linh Thú đang mang ăn 50% EXP/trận (+ Hiếu Học)
    if (rp && rp.leveled) this.showToast(this.petName(rp.pet) + ' lên Cảnh Lv ' + rp.pet.level + '.');
    for (const st of boPhapStats(this.loadout)) addStatXp(this.state, st, e.statXp);
    const moneyMul = 1 + activeAwkVal(this.state, 'moneyBonus');   // P7 — Tham Tài
    const lootMul = 1 + activeAwkVal(this.state, 'lootBonus');     // P7 — Lùng Sục
    if (e.loot) for (const l of e.loot) if (Math.random() < l.chance * lootMul) addItem(this.state, l.itemId, 1);
    // Loot-hunt: rơi gear instance (tỉ lệ rất nhỏ × lootMul; phẩm cao siêu hiếm, cap Cực Hiếm ở quái thường).
    if (Math.random() < MONSTER_DROP_CHANCE * lootMul) { const gi = rollMonsterDrop(e.reqLevel || 1); if (gi) { addGearInstance(this.state, gi); this.notifyGearDrop(gi); } }
    this.state.currencies.bac = (this.state.currencies.bac || 0) + Math.round(Math.max(1, Math.round(e.exp * 1.5)) * moneyMul);
    this.state.counters.kills[this.act.enemyId] = (this.state.counters.kills[this.act.enemyId] || 0) + 1;
    this.state.combat.sinhLuc = Math.max(0, Math.round(f.p.hp));
    const sk = this.state.skills['chienDau']; if (sk) { sk.gathered = (sk.gathered || 0) + 1; sk.timeMs = (sk.timeMs || 0) + (this.act.cycleMs || 1000); }
    this.act.sessionCount = (this.act.sessionCount || 0) + 1;
  },
  combatDeath() {
    this.state.combat.noiThuong = true;
    this.state.combat.sinhLuc = 0;
    this.state.combat.suyYeuUntil = now() + SUY_YEU_MS;   // suy yếu: HP tự hồi đầy trong 60s rồi mới đánh tiếp
    stopActivity(this.state);
    this.showToast('Trọng thương! Suy yếu — Sinh Lực đang tự hồi phục.');
    Storage.save(this.state);
  },

  // ---------- Ô Món Ăn + Ô Đan (hệ tự dùng khi tài nguyên < 25%) ----------
  foodPicker: false,
  danPicker: false,
  openFoodPicker() { this.foodPicker = true; },
  closeFoodPicker() { this.foodPicker = false; },
  openDanPicker() { this.danPicker = true; },
  closeDanPicker() { this.danPicker = false; },
  get luongThucItem() { const id = this.state.combat.luongThuc; return id && this.ITEMS[id] ? this.ITEMS[id] : null; },
  get luongThucCount() { const id = this.state.combat.luongThuc; return id ? (this.state.inventory[id] || 0) : 0; },
  get danItem() { const id = this.state.combat.dan; return id && this.ITEMS[id] ? this.ITEMS[id] : null; },
  get danCount() { const id = this.state.combat.dan; return id ? (this.state.inventory[id] || 0) : 0; },
  danEffText(it) { if (!it) return ''; if (it.heal) return 'Hồi +' + it.heal + ' Máu'; if (it.healNL) return 'Hồi +' + it.healNL + ' Nội Lực'; return ''; },
  get combatFoodList() {     // món ăn (type monan, có heal) trong túi -> chọn lắp; xếp theo lượng hồi tăng dần
    return Object.keys(this.state.inventory)
      .filter((id) => this.ITEMS[id] && this.ITEMS[id].type === 'monan' && this.ITEMS[id].heal && this.state.inventory[id] > 0)
      .map((id) => ({ ...this.ITEMS[id], id, count: this.state.inventory[id] }))
      .sort((a, b) => a.heal - b.heal);
  },
  get combatDanList() {      // đan (type dan, hồi Máu hoặc Nội Lực) trong túi -> chọn lắp
    return Object.keys(this.state.inventory)
      .filter((id) => this.ITEMS[id] && this.ITEMS[id].type === 'dan' && (this.ITEMS[id].heal || this.ITEMS[id].healNL) && this.state.inventory[id] > 0)
      .map((id) => ({ ...this.ITEMS[id], id, count: this.state.inventory[id] }))
      .sort((a, b) => (a.heal || a.healNL || 0) - (b.heal || b.healNL || 0));
  },
  equipFood(id) {
    if (id && (!this.ITEMS[id] || !this.ITEMS[id].heal)) { this.showToast('Món này không dùng làm Món Ăn.'); return; }
    this.state.combat.luongThuc = id || null;
    this.foodPicker = false;
    Storage.save(this.state);
    if (id) this.showToast('Đã lắp ' + this.ITEMS[id].name + ' vào ô Món Ăn.');
  },
  equipDan(id) {
    if (id && (!this.ITEMS[id] || !(this.ITEMS[id].heal || this.ITEMS[id].healNL))) { this.showToast('Vật phẩm này không dùng làm Đan.'); return; }
    this.state.combat.dan = id || null;
    this.danPicker = false;
    Storage.save(this.state);
    if (id) this.showToast('Đã lắp ' + this.ITEMS[id].name + ' vào ô Đan.');
  },

  // ---------- Phường Thị ----------
  merchantTab: 'avatar',
  setMerchantTab(t) { this.merchantTab = t; },
  buyAvatar(id) {
    if (this.ownsAvatar(id)) return;
    if ((this.state.currencies.honThach || 0) < AVATAR_PRICE) { this.showToast('Không đủ Hồn Thạch (cần ' + this.fmt(AVATAR_PRICE) + ').'); return; }
    this.state.currencies.honThach -= AVATAR_PRICE;
    this.state.player.ownedAvatars.push(id);
    Storage.save(this.state);
    this.showToast('Đã mua Ảnh Đại Diện 〈' + ((this.AVATARS.find((a) => a.id === id) || {}).name || '') + '〉.');
  },
  buyCover(id) {
    if (this.ownsCover(id)) return;
    if ((this.state.currencies.honThach || 0) < COVER_PRICE) { this.showToast('Không đủ Hồn Thạch (cần ' + this.fmt(COVER_PRICE) + ').'); return; }
    this.state.currencies.honThach -= COVER_PRICE;
    this.state.player.ownedCovers.push(id);
    Storage.save(this.state);
    this.showToast('Đã mua Ảnh Bìa 〈' + ((this.COVERS.find((c) => c.id === id) || {}).name || '') + '〉.');
  },
  vatPhamPrice(id) { return Math.ceil((this.ITEMS[id] ? this.ITEMS[id].value : 0) * 1.2); },
  buyVatPham(id) {
    const price = this.vatPhamPrice(id);
    if ((this.state.currencies.bac || 0) < price) { this.showToast('Không đủ Bạc (cần ' + this.fmt(price) + ').'); return; }
    this.state.currencies.bac -= price;
    addItem(this.state, id, 1);
    Storage.save(this.state);
    this.showToast('Đã mua 〈' + ((this.ITEMS[id] || {}).name || '') + '〉.');
  },
  sellItem(itemId, qty) {
    const have = this.state.inventory[itemId] || 0;
    qty = Math.min(qty, have);
    if (qty <= 0) return;
    this.state.currencies.bac += (this.ITEMS[itemId]?.value || 0) * qty;
    removeItem(this.state, itemId, qty);
    Storage.save(this.state);
  },
  sellGear(uid) {                                  // bán 1 instance gear (theo uid trong túi)
    const inst = removeGearByUid(this.state, uid);
    if (!inst) return;
    this.state.currencies.bac = (this.state.currencies.bac || 0) + ((this.ITEMS[inst.gearId] || {}).value || 0);
    Storage.save(this.state);
  },
  // Khoe gear rơi — chỉ Hiếm trở lên (tránh spam Thường/Tốt).
  notifyGearDrop(inst) {
    if (!inst) return;
    const rank = this.QUALITY_KEYS.indexOf(inst.quality);
    if (rank < 2) return;
    const q = this.QUALITY[inst.quality] || {}; const nm = (this.ITEMS[inst.gearId] || {}).name || 'trang bị';
    this.showToast('✦ Rơi ' + (q.name || '') + ' 〈' + nm + '〉 · ' + Object.keys(inst.stats).length + ' dòng!');
  },

  // ---------- Trang Bị ----------
  equipModal: null,
  // View hợp nhất: instance gear + dữ liệu catalog (tên/art/slot...). Dùng cho mọi UI gear. .id = gearId (art/req), .uid = handle.
  gearView(inst) {
    if (!inst) return null;
    const b = this.ITEMS[inst.gearId] || {}; const e = b.equip || {};
    return {
      id: inst.gearId, uid: inst.uid, gearId: inst.gearId, name: b.name, icon: b.icon,
      type: b.type || 'trangbi', value: b.value || 0, quality: inst.quality, stats: inst.stats || {},
      itemLv: inst.itemLv || e.itemLv || 1, reqLevel: inst.reqLevel || e.reqLevel || 1, plus: inst.plus || 0,
      he: inst.he || null, eleDmg: inst.eleDmg || 0, slot: e.slot, weaponType: e.weaponType || null,
      gatherEff: e.gatherEff || 0, gatherSkill: e.gatherSkill || null, rolls: inst.rolls || null, equip: e, _inst: inst,
    };
  },
  equippedItem(slotId) { return this.gearView(this.state.equipment && this.state.equipment[slotId]); },
  slotName(slotId) {
    const s = [...this.EQUIP_SLOTS, ...this.TOOL_SLOTS].find((x) => x.id === slotId);
    return s ? s.name : slotId;
  },
  openEquip(slot) { this.equipModal = { slot }; },
  closeEquip() { this.equipModal = null; },
  equippableForSlot(slot) {
    return (this.state.gearBag || []).map((inst) => this.gearView(inst))
      .filter((v) => v && v.slot === slot)
      .sort((a, b) => this.qualityRank(b) - this.qualityRank(a) || (b.itemLv || 0) - (a.itemLv || 0)); // phẩm cao -> thấp
  },
  // req: nhận view/instance gear (reqLevel+gatherSkill từ chính nó) HOẶC string id (catalog).
  _equipE(x) { if (x && typeof x === 'object') return { reqLevel: x.reqLevel, gatherSkill: x.gatherSkill }; const it = this.ITEMS[x]; return (it && it.equip) || {}; },
  equipReqOf(x) { return this._equipE(x).reqLevel || 0; },                                       // cấp yêu cầu MANG (số)
  // Công cụ (gatherSkill) -> yêu cầu theo cấp NGHỀ tương ứng; còn lại theo Chiến Đấu.
  equipReqCtx(x) {
    const e = this._equipE(x); const req = e.reqLevel || 0;
    if (e.gatherSkill) { const sk = this.SKILLS[e.gatherSkill]; return { req, level: this.skillLevel(e.gatherSkill), label: (sk ? sk.name : 'Nghề') }; }
    return { req, level: this.combatLevel, label: 'Chiến Đấu' };
  },
  canEquip(x) { const c = this.equipReqCtx(x); return c.req <= 1 || c.level >= c.req; },
  equipReqText(x) { const c = this.equipReqCtx(x); return c.label + ' Lv ' + c.req; },           // "Đốn Củi Lv 5" | "Chiến Đấu Lv 10"
  equipCurLevel(x) { return this.equipReqCtx(x).level; },                                         // cấp hiện tại của người chơi theo đúng loại
  doEquip(uid) {
    const v = this.gearView(findGear(this.state, uid)); if (!v) return;
    const c = this.equipReqCtx(v);
    if (c.req > 1 && c.level < c.req) { this.showToast('Cần ' + c.label + ' Lv ' + c.req + ' để mang ' + (v.name || 'món này') + '.'); return; }
    if (equipItem(this.state, uid)) Storage.save(this.state);
  },
  doUnequip(slot) { if (unequipItem(this.state, slot)) Storage.save(this.state); },
  // --- Hiển thị chi tiết trang bị (badge ngũ hành + so sánh) ---
  gearStatLabel(k) { return ({ congKich: 'Công', hoThe: 'Thủ', neTranh: 'Né', menhTrung: 'Chính Xác', sinhLuc: 'Sinh Lực', baoKich: 'Bạo Kích', baoSat: 'Bạo Sát', tocDo: 'Tốc Độ' })[k] || k; },
  // Dòng chỉ số gear ở popup: tên đầy đủ + giá trị + đơn vị (% cho Bạo Kích/Bạo Sát).
  gearLineText(k, v) { const a = AFFIX[k]; return this.statLabel(k) + ' +' + v + (a && a.fmt === 'pct' ? '%' : ''); },
  gearVal(k, v) { const a = AFFIX[k]; return '+' + v + (a && a.fmt === 'pct' ? '%' : ''); },        // chỉ giá trị (tách khỏi tên cho list dọc)
  // Màu dòng theo BẬC ROLL (% trong [min,max]): Phàm trắng → Lương lam → Thượng chàm → Cực tím → Tuyệt cam.
  // KHÔNG dùng lục/đỏ (để dành cho mũi tên so sánh ▲/▼). Món cũ/migrate (không rolls) = xám trung tính.
  gearLineColor(view, k) {
    const pct = view && view.rolls && view.rolls[k];
    if (pct == null) return '#94a3b8';   // neutral xám
    if (pct < 0.25) return '#cbd5e1';     // Phàm  - trắng
    if (pct < 0.50) return '#38bdf8';     // Lương - lam
    if (pct < 0.75) return '#818cf8';     // Thượng- chàm/indigo
    if (pct < 0.92) return '#c084fc';     // Cực   - tím
    return '#fb923c';                      // Tuyệt - cam (cam thật, không vàng)
  },
  // Công cụ: dòng "+X% Hiệu Suất <kĩ năng>". Nhận view/instance gear hoặc string id.
  toolEffText(x) {
    const e = (x && typeof x === 'object') ? x.gatherEff : (((this.ITEMS[x] || {}).equip) || {}).gatherEff;
    if (!e) return null;
    const skId = (x && typeof x === 'object') ? x.gatherSkill : (((this.ITEMS[x] || {}).equip) || {}).gatherSkill;
    const sk = skId && this.SKILLS[skId];
    return '+' + Math.round(e * 100) + '% Hiệu Suất' + (sk ? ' ' + sk.name : '');
  },
  gearHe(x) {
    const he = (x && typeof x === 'object') ? x.he : ((((this.ITEMS[x] || {}).equip) || {}).he);
    if (!he) return null;
    const eleDmg = (x && typeof x === 'object') ? (x.eleDmg || 0) : ((((this.ITEMS[x] || {}).equip) || {}).eleDmg || 0);
    return { he, name: heName(he), info: heInfo(he), eleDmg };
  },
  // So sánh chỉ số view/instance gear `x` với món ĐANG mặc cùng slot -> [{key,label,next,cur,delta}]
  gearCompare(x) {
    if (!x || typeof x !== 'object') return [];
    const slot = x.slot || (((this.ITEMS[x.gearId] || {}).equip) || {}).slot;
    const next = x.stats || {};
    const worn = this.state.equipment && this.state.equipment[slot];
    const cur = (worn && worn.stats) || {};
    const keys = [...new Set([...Object.keys(next), ...Object.keys(cur)])];
    return keys.map((k) => ({ key: k, label: this.gearStatLabel(k), next: next[k] || 0, cur: cur[k] || 0, delta: (next[k] || 0) - (cur[k] || 0) }));
  },
  gearStatIcon(k) { return ({ congKich: 'sword', hoThe: 'shield', neTranh: 'steps', menhTrung: 'scope', sinhLuc: 'heart', baoKich: 'star', baoSat: 'flame', tocDo: 'wind' })[k] || 'zap'; },
  gearGainTotal(x) { return this.gearCompare(x).reduce((s, c) => s + c.delta, 0); },             // tổng chênh stat vs món đang mặc
  equipFilterBetter: false,                                                                       // checkbox "chỉ hiển thị tốt hơn"
  recommendedForSlot(slot) {                                                                      // món NÂNG CẤP tốt nhất (null nếu không có)
    let best = null, bestScore = 0;
    for (const v of this.equippableForSlot(slot)) { if (!this.canEquip(v)) continue; const s = this.gearGainTotal(v); if (s > bestScore) { bestScore = s; best = v; } } // chỉ đề cử món ĐỦ CẤP mang
    return best;
  },
  othersForSlot(slot) {
    const rec = this.recommendedForSlot(slot);
    let list = this.equippableForSlot(slot).filter((v) => !rec || v.uid !== rec.uid);
    if (this.equipFilterBetter) list = list.filter((v) => this.gearGainTotal(v) > 0);
    return list;
  },

  // ---------- Cường Hóa ----------
  enhanceModal: null,            // { slot }
  enhanceMsg: null,              // kết quả lần cường gần nhất {ok:true,plus} | {ok:false}
  MAX_PLUS,
  itemPlus(x) { return (x && typeof x === 'object') ? (x.plus || 0) : 0; },     // +N (view/instance gear); string -> 0
  openEnhance(slot) { this.equipModal = null; this.enhanceMsg = null; this.enhanceModal = { slot }; },
  closeEnhance() { this.enhanceModal = null; this.enhanceMsg = null; },
  enhanceInst() { return this.enhanceModal && this.state.equipment[this.enhanceModal.slot]; },   // INSTANCE đang cường (để ghi)
  enhanceId() { return this.gearView(this.enhanceInst()); },                                      // VIEW để hiển thị
  enhanceMaxed(x) { return this.itemPlus(x) >= MAX_PLUS; },
  enhanceCan(x) { return canEnhance(this.state, (x && x._inst) ? x._inst : x); },
  // Thông tin yêu cầu lần cường kế tiếp (null nếu đã +15)
  enhanceInfo(x) {
    const step = enhanceStep(this.itemPlus(x));
    if (!step) return null;
    return { ...step, ratePct: Math.round(step.rate * 100),
      stoneName: (this.ITEMS[step.stoneId] || {}).name, stoneHave: this.state.inventory[step.stoneId] || 0,
      honHave: this.state.currencies.honThach || 0,
      crystalName: (this.ITEMS[step.crystalId] || {}).name, crystalHave: this.state.inventory[step.crystalId] || 0,
      stoneOk: (this.state.inventory[step.stoneId] || 0) >= step.stoneQty,
      honOk: (this.state.currencies.honThach || 0) >= step.honThach,
      crystalOk: step.crystalQty <= 0 || (this.state.inventory[step.crystalId] || 0) >= step.crystalQty };
  },
  // Xem trước chỉ số (view gear): cấp hiện tại -> cấp kế (làm tròn)
  enhancePreview(x) {
    if (!x || !x.stats) return [];
    const plus = this.itemPlus(x), curMul = enhanceMul(plus), nxtMul = enhanceMul(plus + 1);
    return Object.keys(x.stats).map((k) => ({ key: k, label: this.gearStatLabel(k), icon: this.gearStatIcon(k),
      cur: Math.round(x.stats[k] * curMul), next: Math.round(x.stats[k] * nxtMul) }));
  },
  doEnhance() {
    const inst = this.enhanceInst(); if (!inst) return;
    const r = tryEnhance(this.state, inst);
    if (r.ok) { this.enhanceMsg = r.success ? { ok: true, plus: r.plus } : { ok: false }; Storage.save(this.state); }
  },

  // ---------- Túi đồ ----------
  get inventoryList() {
    return Object.keys(this.state.inventory)
      .map((id) => ({ ...this.ITEMS[id], qty: this.state.inventory[id] }))
      .filter((x) => x && x.id && x.qty > 0)
      .sort((a, b) => b.qty - a.qty);
  },
  get inventoryByType() {
    const groups = {};
    for (const id of Object.keys(this.state.inventory)) {
      const qty = this.state.inventory[id];
      const item = this.ITEMS[id];
      if (!qty || !item) continue;
      const t = item.type || 'khac';
      (groups[t] = groups[t] || []).push({ ...item, qty });
    }
    // Gear loot-hunt: instance trong túi -> nhóm "Trang Bị" (phẩm cao -> thấp).
    const gear = (this.state.gearBag || []).map((inst) => this.gearView(inst)).filter(Boolean)
      .sort((a, b) => this.qualityRank(b) - this.qualityRank(a) || (b.itemLv || 0) - (a.itemLv || 0));
    if (gear.length) groups['trangbi'] = (groups['trangbi'] || []).concat(gear);
    return Object.keys(groups).map((t) => ({
      type: t,
      label: this.ITEM_TYPES[t] || 'Khác',
      items: t === 'trangbi' ? groups[t] : groups[t].sort((a, b) => b.qty - a.qty),
    }));
  },

  // ---------- Popup chi tiết vật phẩm (bấm item ở Hành Lý) ----------
  itemModal: null,                               // ref đang xem: string id (xếp chồng) HOẶC uid gear instance
  openItemModal(ref) { if (findGear(this.state, ref) || this.ITEMS[ref]) this.itemModal = ref; },
  closeItemModal() { this.itemModal = null; },

  // ======================= BÍ CẢNH (Dungeon idle) =======================
  dungeonSel: null,
  ensureDungeon() {
    if (!this.state.dungeon) this.state.dungeon = { lastResult: null, history: [] };
    if (!this.dungeonSel || !this.DUNGEON_BY_ID[this.dungeonSel]) {
      const first = this.DUNGEONS.find((d) => this.combatLevel >= d.reqLevel) || this.DUNGEONS[0];
      this.dungeonSel = first ? first.id : null;
    }
  },
  get dungeonList() { return this.DUNGEONS; },
  dungeonObj(id) { return this.DUNGEON_BY_ID[id] || null; },
  get dungeonSelObj() { return this.dungeonSel ? this.DUNGEON_BY_ID[this.dungeonSel] : null; },
  selectDungeon(id) { if (this.DUNGEON_BY_ID[id]) this.dungeonSel = id; },
  dungeonLocked(id) { void this._tick; const d = this.DUNGEON_BY_ID[id]; return !d || this.combatLevel < d.reqLevel; },
  // Hoạt động Bí Cảnh đang chạy?
  get dungeonRunning() { return !!(this.state.activity && this.state.activity.type === 'dungeon'); },
  get dungeonRunId() { return this.dungeonRunning ? this.state.activity.dungeonId : null; },
  dungeonRunningHere(id) { return this.dungeonRunning && this.state.activity.dungeonId === id; },
  get dungeonRunMode() { return this.dungeonRunning ? this.state.activity.mode : null; },
  // Đếm ngược còn lại (giây) — đọc _tick để reactive theo từng giây.
  dungeonTimeLeft() {
    void this._tick;
    if (!this.dungeonRunning) return 0;
    const a = this.state.activity;
    return Math.max(0, Math.ceil((a.startedAt + a.cycleMs - now()) / 1000));
  },
  get dungeonRunPct() {
    void this._tick;
    if (!this.dungeonRunning) return 0;
    const a = this.state.activity;
    return Math.min(100, ((now() - a.startedAt) / (a.cycleMs || 1)) * 100);
  },
  dungeonDurSec(id, mode) { const d = this.DUNGEON_BY_ID[id]; if (!d) return 0; return (mode === 'treo' ? d.treoMs : d.nhanhMs) / 1000; },
  // Phí vào (Bạc + Hồn Thạch). Đủ tiền?
  canAffordDungeon(id) {
    const d = this.DUNGEON_BY_ID[id]; if (!d) return false; const c = d.cost || {};
    return (this.state.currencies.bac || 0) >= (c.bac || 0) && (this.state.currencies.honThach || 0) >= (c.honThach || 0);
  },
  startDungeonRun(id, mode) {
    const d = this.DUNGEON_BY_ID[id]; if (!d) return;
    if (this.dungeonLocked(id)) { this.showToast('Cần Chiến Đấu Lv ' + d.reqLevel + ' để vào ' + d.name + '.'); return; }
    if (this.dungeonRunning) { this.showToast('Đang có một chuyến Bí Cảnh — chờ hoàn tất đã.'); return; }
    if (!this.canAffordDungeon(id)) { this.showToast('Không đủ phí vào ' + d.name + '.'); return; }
    const c = d.cost || {};
    if (c.bac) this.state.currencies.bac -= c.bac;
    if (c.honThach) this.state.currencies.honThach -= c.honThach;
    if (!startDungeon(this.state, id, mode, now())) {          // lỗi -> hoàn phí
      if (c.bac) this.state.currencies.bac += c.bac;
      if (c.honThach) this.state.currencies.honThach += c.honThach;
      this.showToast('Không thể vào Bí Cảnh.'); return;
    }
    Storage.save(this.state);
    this.showToast('🏛️ Tiến vào ' + d.name + ' · ' + (mode === 'treo' ? 'Treo Luyện' : 'Chạy Nhanh') + '.');
  },
  // Kết quả: TỰ hiện khi chạy xong (lastResult chưa xem) HOẶC khi bấm 1 dòng Lịch Sử (_dungeonView).
  _dungeonView: null,
  get dungeonResult() {
    if (this._dungeonView) return this._dungeonView;
    const r = this.state.dungeon && this.state.dungeon.lastResult;
    return (r && !r.seen) ? r : null;
  },
  get dungeonShowResult() { return !!this.dungeonResult; },
  openDungeonHistory(h) { if (h) this._dungeonView = h; },
  closeDungeonResult() {
    if (this._dungeonView) { this._dungeonView = null; return; }       // đang xem lịch sử -> chỉ đóng
    const r = this.state.dungeon && this.state.dungeon.lastResult;
    if (r && !r.seen) { r.seen = true; Storage.save(this.state); }     // kết quả mới -> đánh dấu đã xem
  },
  get dungeonHistory() { return (this.state.dungeon && this.state.dungeon.history) || []; },
  dungeonResultName() { const r = this.dungeonResult; const d = r && this.DUNGEON_BY_ID[r.dungeonId]; return d ? d.name : ''; },
  dungeonResultItems() { const r = this.dungeonResult; if (!r || !r.loot) return []; return Object.keys(r.loot.items || {}).map((id) => ({ id, qty: r.loot.items[id] })); },
  logToneClass(tone) { return ({ win: 'text-emerald-300', hurt: 'text-rose-300', fortune: 'text-amber-300', boss: 'text-purple-300', fail: 'text-rose-400' })[tone] || 'text-slate-300'; },
  tangLabel(t) { return ({ thuong: 'Quái thường', tinhAnh: 'Tinh anh', boss: 'Boss cuối', hazard: 'Hiểm cảnh', bay: 'Cạm bẫy', coDuyen: 'Cơ duyên', kyNgo: 'Kỳ ngộ' })[t] || t; }, // nhãn loại tầng (preview)
  pctText(c) { const p = (c || 0) * 100; const s = (p > 0 && p < 10) ? p.toFixed(1).replace(/\.0$/, '') : Math.round(p).toString(); return s + '%'; }, // <10% hiện 1 thập phân (0.1%/1.2%/2.5% không bị làm tròn ẩn)
  // Danh mục Đồ Phổ 1 phó bản có thể rớt (gear khớp bậc + slot -> id 'dp_<gearId>'); + modal xem.
  dungeonDoPhoList(dungeonId) {
    const d = this.DUNGEON_BY_ID[dungeonId]; if (!d || !d.loot.doPho) return [];
    const dp = d.loot.doPho;
    const BQ = { 1: 'phamPham', 2: 'luongPham', 3: 'tinhPham', 4: 'tuyetPham', 5: 'truyenThe', 6: 'thanPham', 7: 'coBan' };
    const quals = dp.bac.map((b) => BQ[b]);
    return Object.values(this.ITEMS)
      .filter((it) => it.equip && it.equip.itemLv && quals.includes(it.quality) && (dp.slots === 'all' || dp.slots.includes(it.equip.slot)))
      .map((it) => 'dp_' + it.id);
  },
  dungeonPoolId: null,
  openDungeonPool(id) { this.dungeonPoolId = id; },
  closeDungeonPool() { this.dungeonPoolId = null; },
  get dungeonPoolObj() { return this.dungeonPoolId ? this.DUNGEON_BY_ID[this.dungeonPoolId] : null; },
  get dungeonPoolList() { return this.dungeonPoolId ? this.dungeonDoPhoList(this.dungeonPoolId) : []; },

  // ======================= ĐỒ PHỔ (Lĩnh Ngộ -> mở Rèn Đúc) =======================
  isDoPho(id) { const it = this.ITEMS[id]; return !!(it && it.type === 'doPho'); },
  doPhoCharges(gearId) { return (((this.state.player && this.state.player.doPho) || {})[gearId]) || 0; }, // số LƯỢT rèn còn của 1 gear
  doPhoChargeOf(dpId) { const it = this.ITEMS[dpId]; return (it && it.gearId) ? this.doPhoCharges(it.gearId) : 0; }, // theo id đồ phổ (dp_)
  hasDoPho(gearId) { return this.doPhoCharges(gearId) > 0; },
  doPhoLearned(dpId) { return this.doPhoChargeOf(dpId) > 0; },
  learnDoPho(dpId) {
    const it = this.ITEMS[dpId]; if (!it || it.type !== 'doPho' || !it.gearId) return;
    if ((this.state.inventory[dpId] || 0) < 1) { this.showToast('Không có Đồ Phổ này trong túi.'); return; }
    removeItem(this.state, dpId, 1);
    if (!this.state.player.doPho || typeof this.state.player.doPho !== 'object') this.state.player.doPho = {};
    this.state.player.doPho[it.gearId] = (this.state.player.doPho[it.gearId] || 0) + 1;
    Storage.save(this.state);
    this.showToast('📜 Lĩnh ngộ Đồ Phổ — +1 lượt rèn 〈' + (this.ITEMS[it.gearId] ? this.ITEMS[it.gearId].name : '') + '〉 (mỗi lượt rèn được 1 món).');
  },
  // Gate Rèn Đúc: bậc 1-3 luôn rèn; bậc 4-7 chỉ rèn khi đã lĩnh ngộ Đồ Phổ tương ứng (itemId = gearId).
  forgeUnlocked(itemId) {
    const it = this.ITEMS[itemId]; if (!it) return true;
    const forceDoPho = !!(it.equip && it.equip.forceDoPho); // tool bậc 2-3: ép Đồ Phổ dù phẩm chất thấp
    if (!forceDoPho && ['phamPham', 'luongPham', 'tinhPham'].includes(it.quality)) return true;
    return this.doPhoCharges(itemId) > 0; // bậc 4-7 + tool bậc 2-3: còn lượt Đồ Phổ mới hiện ở Rèn Đúc
  },
  get itemModalObj() {
    const ref = this.itemModal; if (!ref) return null;
    const g = findGear(this.state, ref);
    if (g) return { ...this.gearView(g), qty: 1, isGear: true };     // gear instance
    const it = this.ITEMS[ref];
    return it ? { ...it, qty: this.state.inventory[ref] || 0, isGear: false } : null;
  },
  itemTypeLabel(t) { return this.ITEM_TYPES[t] || 'Khác'; },
  equipSlotLabel(slot) { const s = (this.EQUIP_SLOTS || []).find((x) => x.id === slot) || (this.TOOL_SLOTS || []).find((x) => x.id === slot); return s ? s.name : slot; },
  statLabel(k) { return ({ congKich: 'Công Kích', hoThe: 'Hộ Thể', neTranh: 'Né Tránh', menhTrung: 'Chính Xác', sinhLuc: 'Sinh Lực', baoKich: 'Bạo Kích', baoSat: 'Bạo Sát', tocDo: 'Tốc Độ', thanPhap: 'Thân Pháp', linhXao: 'Linh Xảo', lucDao: 'Lực Đạo', noiLuc: 'Nội Lực' })[k] || k; },
  // Bán nhanh từ popup chi tiết
  sellFromModal(qty) {
    const ref = this.itemModal; if (!ref) return;
    if (findGear(this.state, ref)) { this.sellGear(ref); this.closeItemModal(); return; }
    this.sellItem(ref, qty); if (!(this.state.inventory[ref] > 0)) this.closeItemModal();
  },

  // ---------- Dev / Admin (offline) — cổng mật khẩu F9 ----------
  // F9: đã đăng nhập -> bật/tắt panel; chưa -> mở/đóng màn đăng nhập. Panel CHỈ hiện + dùng được khi devAuthed.
  toggleDev() {
    if (this.devAuthed) { this.devPanel = !this.devPanel; return; }
    this.devLoginOpen = !this.devLoginOpen;
    if (this.devLoginOpen) { this.devPass = ''; this.devLoginErr = ''; }
  },
  devLogin() {
    if (devHash(this.devPass) === DEV_PASS_HASH) { this.devAuthed = true; this.devLoginOpen = false; this.devPanel = true; this.devPass = ''; this.devLoginErr = ''; }
    else { this.devLoginErr = 'Sai mật khẩu.'; this.devPass = ''; }
  },
  closeDevLogin() { this.devLoginOpen = false; this.devPass = ''; this.devLoginErr = ''; },
  devLogout() { this.devAuthed = false; this.devPanel = false; this.devLoginOpen = false; this.devPass = ''; this.devLoginErr = ''; },
  setDevTab(t) { this.devTab = t; },
  devSave() { Storage.save(this.state); },
  devAddCurrency(key, amt) { this.state.currencies[key] = (this.state.currencies[key] || 0) + amt; this.devSave(); },
  devAddSkillXp(id, amt) { addSkillXp(this.state, id, amt); this.devSave(); },
  devAddStatXp(id, amt) { addStatXp(this.state, id, amt); this.devSave(); },
  devSetAllLevel(lv) {
    lv = Math.max(1, Math.min(100, Math.floor(lv || 1)));
    let xp = 0; for (let i = 1; i < lv; i++) xp += xpForLevel(i);
    Object.keys(this.SKILLS).forEach((id) => { this.state.skills[id] = { ...(this.state.skills[id] || {}), xp }; });
    this.state.skills['chienDau'] = { ...(this.state.skills['chienDau'] || {}), xp };
    Object.keys(this.STATS).forEach((id) => { this.state.stats[id] = { ...(this.state.stats[id] || {}), xp }; });
    this.devSave();
  },
  devAddItem(id, qty) { if (!id || !this.ITEMS[id]) return; addItem(this.state, id, qty); this.devSave(); },
  devGiveSampleGear() { GEAR_IDS.forEach((id) => addGearInstance(this.state, rollGearInstance(id))); this.devSave(); },
  // Dev: roll N drop ngẫu nhiên ở cấp `lv` (test loot-hunt: phẩm + số dòng đa dạng).
  devRollDrops(lv, n) { lv = lv || this.combatLevel || 20; n = n || 20; for (let i = 0; i < n; i++) { const gi = rollMonsterDrop(lv); if (gi) addGearInstance(this.state, gi); } this.devSave(); this.showToast('Roll ' + n + ' drop @Lv' + lv); },
  devGiveStones() { ['daCuongHoaSo', 'daCuongHoaTrung', 'daCuongHoaCao', 'tinhTheYeuVuong'].forEach((id) => addItem(this.state, id, 99)); this.state.currencies.honThach = (this.state.currencies.honThach || 0) + 100000; this.devSave(); },
  devGiveAllEggs() {   // toàn bộ Trứng Linh Thú (30) + Tinh Thể + mầm Boss — để xem art
    let n = 0;
    Object.keys(this.ITEMS).forEach((id) => { if (this.ITEMS[id].type === 'trung') { addItem(this.state, id, 1); n++; } });
    ['tinhTheYeuVuong', 'hoPhuDauLinh', 'hachCoLinh', 'cuuViTinh', 'maToTam'].forEach((id) => { if (this.ITEMS[id]) addItem(this.state, id, 5); });
    this.devSave(); this.showToast('Đã nhận ' + n + ' Trứng Linh Thú + Tinh Thể + mầm Boss (test).');
  },
  devGiveAll() {       // TOÀN BỘ vật phẩm đã đăng ký + tiền tệ
    Object.keys(this.ITEMS).forEach((id) => { if (this.ITEMS[id].equip) addGearInstance(this.state, rollGearInstance(id)); else addItem(this.state, id, 20); });
    ['bac', 'honThach', 'nguyenBao'].forEach((k) => { this.state.currencies[k] = (this.state.currencies[k] || 0) + 1000000; });
    this.devSave(); this.showToast('Đã nhận TOÀN BỘ vật phẩm + tiền tệ (test).');
  },
  // ---- Dev: Linh Thú ----
  devPetBase: 'bachHo', devPetQuality: 'tuyetPham', devPetLv: 10,
  devCreatePet() { const p = devSpawnPet(this.state, this.devPetBase, this.devPetQuality, this.devPetLv); if (!p) { this.showToast('Chọn loài + phẩm.'); return; } this.devSave(); this.showToast('Tạo ' + this.petName(p) + ' · ' + (this.QUALITY[p.quality] || {}).name + ' · Lv' + p.level); },
  devGiveEachSpecies() { Object.keys(this.PET_SPECIES).forEach((b) => devSpawnPet(this.state, b, this.devPetQuality, this.devPetLv)); this.devSave(); this.showToast('Tạo 1 con mỗi loài · ' + (this.QUALITY[this.devPetQuality] || {}).name + ' · Lv' + this.devPetLv); },
  devSetPetLevel(lv) { lv = Math.max(1, Math.min(99, Math.floor(lv || 1))); (this.state.pets || []).forEach((p) => { p.level = lv; p.xp = 0; }); this.devSave(); this.showToast('Đặt mọi Linh Thú về Lv' + lv); },
  devAwakenActive() { const p = this.activePetObj; if (!p) { this.showToast('Chưa dắt Linh Thú nào.'); return; } p.evolved = !p.evolved; this.devSave(); this.showToast(this.petName(p) + (p.evolved ? ' — Thức Tỉnh (hiện art _awk).' : ' — về hình thái gốc.')); },
  devClearPets() { this.state.pets = []; this.state.hatchery = null; this.devSave(); this.showToast('Đã xoá hết Linh Thú + lò ấp.'); },
  devGivePetMats() { addItem(this.state, 'linhPhach', 99); addItem(this.state, 'tinhTheYeuVuong', 99); this.state.currencies.honThach = (this.state.currencies.honThach || 0) + 50000; this.devSave(); this.showToast('Nhận 99 Linh Phách + 99 Tinh Thể Yêu Vương + 50k Hồn Thạch (test Thức Tỉnh).'); },
  devSetClass(id) { if (this.CLASSES[id]) { this.state.player.class = id; this.devSave(); } },
  devExport() {
    const blob = new Blob([JSON.stringify(this.state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tieudao_save.json';
    a.click();
    URL.revokeObjectURL(a.href);
  },
  devImport(ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(r.result);
        Storage.save(parsed);
        resetting = true; // chặn beforeunload ghi đè save vừa nhập
        location.reload();
      } catch (e) { alert('File save không hợp lệ.'); }
    };
    r.readAsText(file);
  },

  // ---------- Tiện ích ----------
  resetGame() { this.confirmReset = true; },
  doReset() { resetting = true; this.confirmReset = false; Storage.wipe(); location.reload(); },
};

// ---- Khởi động Alpine ----
window.Alpine = Alpine;
Alpine.store('game', gameStore);
Alpine.start();
Alpine.store('game').ensureQuests();
Alpine.store('game').checkBossAwayOnce();   // resolve hàng đợi Yêu Vương đã giáng thế lúc vắng mặt
Alpine.store('game').huntsOnLoad();         // Săn Mồi: gộp tiến trình lúc vắng mặt + thông báo
Alpine.store('game').initWorld();           // Giang Hồ AI: khởi tạo world seed (roster bot)
Alpine.store('game').initCloud();           // Tài khoản/Cloud: khôi phục phiên Supabase (lazy, offline-safe)

// Cloud save: tự đẩy định kỳ (15s) nếu save đã đổi + đẩy ngay khi ẩn/rời trang (best-effort).
setInterval(() => { const s = window.Alpine?.store('game'); if (s) s.cloudAutoPushTick(); }, 15000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { const s = window.Alpine?.store('game'); if (s) s.cloudAutoPushTick(); } });

// Phím F9: bật/tắt Bảng Dev/Admin (offline)
window.addEventListener('keydown', (e) => {
  if (e.key === 'F9') { e.preventDefault(); const s = window.Alpine?.store('game'); if (s) s.toggleDev(); }
});

// ---- Vòng render mượt (~60fps) ----
function rafLoop() {
  const s = window.Alpine?.store('game');
  if (s) {
    const liveOn = s.view === 'combat' && s.state.activity && s.state.activity.type === 'combat' && !s.state.combat.noiThuong;
    if (liveOn) {
      const t = now();
      s.state.activity.lastResolved = t;   // tạm dừng batch khi đang xem chiến báo theo chu kỳ
      s._cycleNow = t;                      // cho thanh tiến độ vòng cập nhật mượt
      if (!s._cycleStart) { s._cycleStart = t; }                            // vào trận: bắt đầu đếm từ 0 (chưa đánh)
      else if (t - s._cycleStart >= CYCLE_MS) { s._cycleStart = t; s.resolveCycle(); } // đếm đủ 8s -> ra vòng
    } else if (s.state.activity) {
      advance(s.state, now());
    }
    // Suy yếu: bơm _cycleNow để thanh HP hồi mượt; đủ 60s -> tự khỏi (chạy cả khi không ở màn combat)
    if (s.state.combat && s.state.combat.noiThuong) {
      s._cycleNow = now();
      if (s.state.combat.suyYeuUntil && now() >= s.state.combat.suyYeuUntil) s.recoverFromSuyYeu();
    }
    // Yêu Vương — trận LIVE: lộ 1 lượt mỗi 3s khi đang xem; rời màn thì kết thúc tức thì (chạy nền)
    if (s.bossFight && !s.bossFight.done) {
      if (s.view !== 'worldboss') { s.finishBossFightNow(); }
      else {
        const tb = now();
        if (!s._bossFrameAt) s._bossFrameAt = tb;
        else if (tb - s._bossFrameAt >= BOSS_TURN_MS) { s._bossFrameAt = tb; s.revealBossFrame(); }
      }
    }
  }
  requestAnimationFrame(rafLoop);
}
requestAnimationFrame(rafLoop);

// ---- Tự lưu + tiến độ nền mỗi 5s ----
setInterval(() => {
  const s = window.Alpine?.store('game');
  if (!s) return;
  if (s.state.activity) advance(s.state, now());
  if (s.state.combat && s.state.combat.noiThuong && s.state.combat.suyYeuUntil && now() >= s.state.combat.suyYeuUntil) s.recoverFromSuyYeu();   // suy yếu xong khi tab ẩn
  s.tickHunts();          // Săn Mồi: giải quyết lượt săn của Linh Thú (độc lập activity)
  if (document.hidden && s.bossFight && !s.bossFight.done) s.finishBossFightNow(); // tab nền: rafLoop bị throttle → chốt trận LIVE trong 5s, không treo
  s.resolveBossQueue();   // hàng đợi: boss giáng thế khi đang online → tự vây sát ở nền
  Storage.save(s.state);
}, 5000);

// Rời tab khi đang đánh LIVE Yêu Vương → chốt trận ngay (rAF dừng lúc tab ẩn)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  const s = window.Alpine?.store('game');
  if (s && s.bossFight && !s.bossFight.done) s.finishBossFightNow();
});

// ---- Nhịp 1s cho đồng hồ đếm ngược (reactive _tick) ----
setInterval(() => { const s = window.Alpine?.store('game'); if (s) s._tick++; }, 1000);

window.addEventListener('beforeunload', () => {
  if (resetting) return; // đang reset -> KHÔNG lưu đè lên save vừa xoá
  const s = window.Alpine?.store('game');
  if (s) Storage.save(s.state);
});
