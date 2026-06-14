// ============================================================
// ENGINE — Yêu Vương (World Boss). THUẦN.  [cơ chế VÂY SÁT THEO LƯỢT — 2026-06-13]
//   - Hồi sinh THEO BOSS (cooldown bắt đầu khi GIẾT; thua → boss vẫn sống, thử lại tự do).
//   - Ngũ hành NGẪU NHIÊN mỗi lần hồi sinh (roll + lưu; clear khi thắng để lần sau đổi hệ).
//   - Trận = mô phỏng trọn (stepFight) rồi cắt thành FRAME (máu 2 bên + log mỗi nhịp):
//       · LIVE  → store lộ 1 frame / 3 giây (rafLoop), thanh máu boss tụt dần.
//       · NỀN   → lộ hết tức thì + nhận thưởng (hàng đợi auto-resolve khi boss giáng thế).
//   - Hàng đợi: state.boss.queue[id]=true → tới giờ tự vây sát ở nền (kể cả offline).
//   - KHÔNG rơi trang bị. Thắng → Tinh Thể + Hồn Thạch(ít) + Trứng + EXP + Bạc.
//   State: state.boss = { cd:{id:ts_hết}, he:{id:'kim'...}, queue:{id:bool}, history:[...] }.
// ============================================================
import { deriveCombat, makeFight, stepFight, boPhapStats } from '../data/votong.js';
import { YEU_VUONG, YEU_VUONG_BY_ID } from '../data/combat.js';
import { addItem } from './inventory.js';
import { addSkillXp, addStatXp } from './leveling.js';
import { skillExpMultiplier } from '../data/classes.js';

const HE_LIST = ['kim', 'moc', 'thuy', 'hoa', 'tho'];
const HISTORY_CAP = 40;

function ensureBoss(state) {
  if (!state.boss) state.boss = {};
  const b = state.boss;
  if (!b.cd) b.cd = {};
  if (!b.he) b.he = {};
  if (!b.queue) b.queue = {};
  if (!Array.isArray(b.history)) b.history = [];
  if (!b.hp) b.hp = {};                           // máu HIỆN TẠI mỗi boss (carry-over giữa các lần thử)
  if (typeof b.healUntil !== 'number') b.healUntil = 0;  // mốc hết dưỡng thương (toàn cục cho người chơi)
  return b;
}
export const BOSS_HEAL_MS = 180000;               // dưỡng thương 3 phút sau khi bại trận (hoặc item — sau)

// Ngũ hành hiện tại của boss (roll + lưu nếu chưa có).
export function bossHe(state, bossId) {
  const b = ensureBoss(state);
  if (!b.he[bossId]) b.he[bossId] = HE_LIST[Math.floor(Math.random() * HE_LIST.length)];
  return b.he[bossId];
}
export function bossCdEnd(state, bossId) { return ensureBoss(state).cd[bossId] || 0; }
export function bossReady(state, bossId, now) { return now >= bossCdEnd(state, bossId); } // 'alive' khi ready

// Máu boss carry-over (persistent giữa các lần thử; reset đầy khi GIẾT/hồi sinh)
export function bossMaxHp(bossId) { const b = YEU_VUONG_BY_ID[bossId]; return (b && b.hp) || 1; }
export function bossCurHp(state, bossId) {
  const b = ensureBoss(state); const max = bossMaxHp(bossId);
  if (b.hp[bossId] == null) b.hp[bossId] = max;
  if (b.hp[bossId] > max) b.hp[bossId] = max;   // boss bị chỉnh giảm máu tối đa (retune) -> chuẩn hoá lại, không để lố bMax
  return Math.max(0, Math.min(max, b.hp[bossId]));
}
export function bossResetHp(state, bossId) { ensureBoss(state).hp[bossId] = bossMaxHp(bossId); }
// Dưỡng thương (toàn cục): sau khi bại trận, KHÔNG đánh được boss nào tới khi hết
export function bossHealing(state, now) { return now < (ensureBoss(state).healUntil || 0); }
export function bossHealLeftMs(state, now) { return Math.max(0, (ensureBoss(state).healUntil || 0) - now); }

// Hàng đợi
export function bossQueued(state, bossId) { return !!ensureBoss(state).queue[bossId]; }
export function setBossQueue(state, bossId, v) { ensureBoss(state).queue[bossId] = !!v; }

// Dự báo: chạy N trận (cùng hệ đã roll) → tỉ lệ thắng + máu tốn TB.
export function bossPredict(state, bossId) {
  const boss = YEU_VUONG_BY_ID[bossId]; if (!boss || !state.combat) return null;
  const he = bossHe(state, bossId);
  const P = deriveCombat(state, state.combat.loadout, { ignoreNoiThuong: true });
  const fightBoss = Object.assign({}, boss, { hp: bossCurHp(state, bossId) });  // dự báo theo máu hiện tại (carry-over)
  const N = 7; let wins = 0, hpLostSum = 0;
  for (let i = 0; i < N; i++) {
    const f = makeFight(P, state.combat.loadout.chieu, fightBoss, P.maxHP, he);
    let g = 0; while (!f.over && g++ < 600) stepFight(f);
    if (f.result === 'win' || f.e.hp <= 0) wins++;
    hpLostSum += Math.max(0, P.maxHP - f.p.hp);
  }
  const winRate = Math.round((wins / N) * 100);
  const hpLostPct = Math.round((hpLostSum / N) / Math.max(1, P.maxHP) * 100);
  let verdict;
  if (winRate >= 95) verdict = 'An Toàn';
  else if (winRate >= 55) verdict = 'Hên Xui';
  else if (winRate > 0) verdict = 'Hiểm';
  else verdict = 'Nguy Hiểm';
  return { he, winRate, hpLostPct, verdict };
}

// Mô phỏng TRỌN 1 trận → cắt thành frame. KHÔNG trao thưởng (gọi applyBossWin ở cuối).
//   frame = { t, pHp, pMax, bHp, bMax, lines:[{h,c}...] (log MỚI của nhịp này) }
export function runBossFight(state, bossId, he) {
  const boss = YEU_VUONG_BY_ID[bossId]; if (!boss || !state.combat) return null;
  const P = deriveCombat(state, state.combat.loadout, { ignoreNoiThuong: true });  // boss có hệ dưỡng thương riêng, KHÔNG dính Trọng Thương thường
  const bMax = boss.hp;                                   // máu tối đa GỐC (cho thanh hiển thị %)
  const curHp = bossCurHp(state, bossId);                 // máu HIỆN TẠI (carry-over)
  const fightBoss = Object.assign({}, boss, { hp: curHp });  // boss khởi đầu ở máu hiện tại
  const f = makeFight(P, state.combat.loadout.chieu, fightBoss, P.maxHP, he);
  const pMax = f.p.maxHP;
  const frames = [{ t: f.t, pHp: pMax, pMax, bHp: curHp, bMax, lines: f.log.slice() }];
  let prev = f.log.length, guard = 0;
  while (!f.over && guard++ < 600) {
    stepFight(f);
    frames.push({ t: f.t, pHp: Math.max(0, Math.round(f.p.hp)), pMax, bHp: Math.max(0, Math.round(f.e.hp)), bMax, lines: f.log.slice(prev) });
    prev = f.log.length;
  }
  const win = f.e.hp <= 0;                                // GIẾT được boss
  const timeout = !f.over;                                // hết 600 nhịp mà chưa phân thắng bại (giằng co — KHÔNG ai gục)
  const bHpEnd = Math.max(0, Math.round(f.e.hp));         // máu boss còn lại (lưu carry-over)
  return { win, timeout, frames, he, pMax, bMax, bHpEnd, dealt: f.dealt, taken: f.taken, t: f.t };
}

// Trao thưởng THẮNG + bật cooldown + đổi hệ + ghi lịch sử. Trả reward.
export function applyBossWin(state, bossId, now) {
  const boss = YEU_VUONG_BY_ID[bossId]; if (!boss) return null;
  const reward = grantReward(state, boss);
  const b = ensureBoss(state);
  b.cd[bossId] = now + boss.wb.cdHours * 3600 * 1000;   // hồi sinh
  delete b.he[bossId];                                  // lần sau đổi hệ
  b.queue[bossId] = false;                              // rời hàng đợi
  b.hp[bossId] = boss.hp;                               // GIẾT → hồi sinh lần sau MÁU ĐẦY
  b.healUntil = 0;                                      // thắng = không còn dưỡng thương (phòng thủ: không để mốc cũ chặn trận sau)
  recordHistory(state, { id: bossId, name: boss.name, eggBase: boss.wb.eggBase, t: now, win: true, reward, rare: isRareReward(reward) });
  return reward;
}
// THUA: boss GIỮ máu đã mất (carry-over, KHÔNG về 100%), người chơi dưỡng thương 3p, rời hàng đợi, ghi lịch sử.
export function applyBossLose(state, bossId, now, bHpEnd) {
  const boss = YEU_VUONG_BY_ID[bossId]; if (!boss) return;
  const b = ensureBoss(state);
  b.queue[bossId] = false;
  if (typeof bHpEnd === 'number') b.hp[bossId] = Math.max(0, Math.min(boss.hp, bHpEnd));  // boss giữ máu hiện tại
  b.healUntil = now + BOSS_HEAL_MS;                     // dưỡng thương 3 phút
  recordHistory(state, { id: bossId, name: boss.name, eggBase: boss.wb.eggBase, t: now, win: false, bHpLeftPct: Math.round(bossCurHp(state, bossId) / boss.hp * 100) });
}
// GIẰNG CO (timeout 600 nhịp, KHÔNG ai gục): boss giữ máu đã mất, KHÔNG dưỡng thương (người chơi còn sống), KHÔNG cd. Thử lại ngay.
export function applyBossRetreat(state, bossId, now, bHpEnd) {
  const boss = YEU_VUONG_BY_ID[bossId]; if (!boss) return;
  const b = ensureBoss(state);
  b.queue[bossId] = false;
  if (typeof bHpEnd === 'number') b.hp[bossId] = Math.max(0, Math.min(boss.hp, bHpEnd));
  recordHistory(state, { id: bossId, name: boss.name, eggBase: boss.wb.eggBase, t: now, win: false, draw: true, bHpLeftPct: Math.round(bossCurHp(state, bossId) / boss.hp * 100) });
}

function recordHistory(state, entry) {
  const b = ensureBoss(state);
  b.history.unshift(entry);
  if (b.history.length > HISTORY_CAP) b.history.length = HISTORY_CAP;
}
function isRareReward(rw) {
  if (!rw || !rw.items) return false;
  // hiếm = nhặt trứng Thần Phẩm (suf 'than') hoặc >=3 Tinh Thể
  if ((rw.items.tinhTheYeuVuong || 0) >= 3) return true;
  return Object.keys(rw.items).some((id) => id.startsWith('egg_') && id.endsWith('_than'));
}

// Cấp thưởng THẮNG. Trả { exp, bac, honThach, items:{itemId:qty} }.
function grantReward(state, boss) {
  const wb = boss.wb;
  const r = { exp: 0, bac: wb.bac, honThach: wb.honThach, items: {} };
  const xp = Math.max(1, Math.round(boss.exp * skillExpMultiplier(state, 'chienDau')));
  addSkillXp(state, 'chienDau', xp); r.exp = xp;
  for (const st of boPhapStats(state.combat.loadout)) addStatXp(state, st, boss.statXp * 3);
  state.currencies.bac = (state.currencies.bac || 0) + wb.bac;
  state.currencies.honThach = (state.currencies.honThach || 0) + wb.honThach;
  if (Math.random() < 0.10) { addItem(state, 'tinhTheYeuVuong', wb.tinhThe); r.items.tinhTheYeuVuong = wb.tinhThe; }   // Tinh Thể: 10% (KHÔNG còn đảm bảo)
  for (const e of wb.eggs) { if (Math.random() < e.chance) { addItem(state, e.itemId, 1); r.items[e.itemId] = (r.items[e.itemId] || 0) + 1; } }
  return r;
}

// Resolve HÀNG ĐỢI: với mỗi boss queue=true ĐÃ giáng thế (now>=cd) & mở khóa → tự vây sát ở nền.
//   isUnlocked(boss) do store truyền (theo Chiến Đấu Lv). Trả [{id,name,win,reward}] để báo.
export function resolveBossQueue(state, now, isUnlocked) {
  const out = [];
  if (bossHealing(state, now)) return out;          // đang dưỡng thương → chưa đánh được boss nào
  for (const boss of YEU_VUONG) {
    const id = boss.id;
    if (!bossQueued(state, id)) continue;
    if (isUnlocked && !isUnlocked(boss)) continue;
    if (now < bossCdEnd(state, id)) continue;       // chưa giáng thế
    const he = bossHe(state, id);
    const res = runBossFight(state, id, he);
    if (!res) { setBossQueue(state, id, false); continue; }
    if (res.win) { const reward = applyBossWin(state, id, now); out.push({ id, name: boss.name, win: true, reward }); }
    else if (res.timeout) { applyBossRetreat(state, id, now, res.bHpEnd); out.push({ id, name: boss.name, win: false, timeout: true }); }  // giằng co — không dưỡng thương, tiếp tục boss kế
    else { applyBossLose(state, id, now, res.bHpEnd); out.push({ id, name: boss.name, win: false }); break; } // gục → dưỡng thương, dừng resolve các boss còn lại
  }
  return out;
}

// ----- Feed Giang Hồ (mô phỏng đạo hữu — KHÔNG lưu, chỉ tạo không khí). Thuần. -----
const FEED_NAMES = ['Mộ Dung Tuyết', 'Diệp Cô Thành', 'Lý Tầm Hoan', 'Tạ Yên Khách', 'Đông Phương Bạch', 'Nam Cung Vũ', 'Hoa Mãn Lâu', 'Thượng Quan Kiếm', 'Tây Môn Tuyết', 'Hàn Lập', 'Cố Trường Phong', 'Lạc Thần Y', 'Tiêu Thập Nhất Lang', 'Yến Thanh'];
const _pick = (a) => a[Math.floor(Math.random() * a.length)];
export function genBossFeed(boss) {
  const tier = boss.wb;
  const firstNm = boss.name.split(' ')[0];
  const tmpl = [
    { win: true, rare: true, ago: '6 phút trước', txt: 'trảm ' + boss.name + ', trúng <b class="text-amber-300">Trứng Thần Phẩm</b> ★' },
    { win: true, ago: '12 phút trước', txt: 'hạ ' + boss.name + ' · ' + tier.tinhThe + '× Tinh Thể, 1× Trứng Phàm' },
    { win: false, ago: '18 phút trước', txt: 'bại trận dưới ' + boss.skill.name + ' — trọng thương lui về' },
    { win: true, ago: '27 phút trước', txt: 'nhặt được <b class="text-emerald-300">Trứng ' + firstNm + ' · Linh Phẩm</b>' },
    { win: true, rare: true, ago: '41 phút trước', txt: 'độc đoạt <b class="text-amber-300">' + (tier.tinhThe + 2) + '× Tinh Thể</b> trong một trận ★' },
    { win: true, ago: '1 giờ trước', txt: 'hạ ' + boss.name + ' · Hồn Thạch ×' + tier.honThach },
    { win: false, ago: '2 giờ trước', txt: 'khiêu chiến thất bại, để ' + firstNm + ' đào thoát' },
  ];
  return tmpl.map((r) => ({ who: _pick(FEED_NAMES), me: false, win: r.win, rare: !!r.rare, ago: r.ago, txt: r.txt }));
}
