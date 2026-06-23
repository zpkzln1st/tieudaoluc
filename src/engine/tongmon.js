// ============================================================
// ENGINE — TÔNG MÔN (nhánh phụ). CÁCH LY: KHÔNG import combat/deriveCombat/stats.
// Lazy-sim idle (tu luyện + sản lượng) theo thời gian thực. Mọi thực lực side-only.
// ============================================================
import { REALMS, APT, APT_KEYS, HE, BUILDINGS, BUILD_KEYS, TM_SHOP, BREAK_REQ, THAO_PRICE, genDisciple, disciCap, buildCost } from '../data/tongmon.js';
import { TM_EVENTS, TM_EVENT_BY_ID } from '../data/tongmon_events.js';

const QRANK = { phamPham: 1, luongPham: 2, tinhPham: 3, tuyetPham: 4, truyenThe: 5, thanPham: 6, coBan: 7 };
// uy cộng dồn tới từng cảnh giới (để tính Uy Danh "tổng" của 1 đệ tử)
const CUM_UY = REALMS.reduce((a, r, i) => { a.push((a[i - 1] || 0) + r.uy); return a; }, []);

// ---- Khởi tạo / backfill ----
export function ensureTongMon(state, nowMs) {
  if (!state.tongMon) {
    const t = {
      name: 'Tiêu Dao Tông', dao: 'trung', level: 1,
      congHien: 0, diem: 0, khiVan: 50,
      linhThao: 0, linhDan: 0,                                            // Linh Thảo (mua) -> Y Quán tinh luyện -> Linh Đan (đột phá)
      buildings: { tuHien: 1, dienVo: 1, tangThu: 1, yQuan: 0, tuLinh: 0 },
      disciples: [], elders: [], legends: [], soSach: [],
      recruitPool: [], recruitAt: 0,
      uyBonus: 0,                                                         // +Uy Danh tích từ SỰ KIỆN (uyDanhOf cộng vào)
      shopCd: {},                                                         // cooldown Đấu Giá Hội (id -> untilMs); giữ "assist CHẬM" theo hợp đồng cách ly
      events: { pending: [], cd: {}, queue: [], rebels: [], seen: 0 },    // sự kiện giang hồ chọn-mù
      lastSimAt: nowMs || Date.now(),
    };
    // đệ tử khởi đầu: "Tiểu Thất" (ăn mày · Trung Tư · Kim · Lì Lợm)
    const d0 = genDisciple({ name: 'Tiểu Thất', sex: 'nam', han: '七', origin: 'anMay', apt: 'trung', he: 'kim' });
    d0.traits = ['Lì Lợm']; d0.tamMa = 'Hắc ám sát niệm';
    t.disciples.push(d0);
    refreshRecruitPool(t, nowMs || Date.now());
    state.tongMon = t;
    return;
  }
  const t = state.tongMon;
  if (!Array.isArray(t.disciples)) t.disciples = [];
  if (!Array.isArray(t.elders)) t.elders = [];
  if (!Array.isArray(t.legends)) t.legends = [];
  if (!Array.isArray(t.soSach)) t.soSach = [];
  if (!t.buildings) t.buildings = { tuHien: 1, dienVo: 1, tangThu: 1, yQuan: 0, tuLinh: 0 };
  if (!Array.isArray(t.recruitPool)) t.recruitPool = [];
  if (!t.lastSimAt) t.lastSimAt = nowMs || Date.now();
  // --- backfill SỰ KIỆN + cờ đệ tử (bản cũ chưa có) ---
  if (typeof t.uyBonus !== 'number') t.uyBonus = 0;
  if (typeof t.linhDan !== 'number') t.linhDan = 0;
  if (typeof t.linhThao !== 'number') t.linhThao = (typeof t.linhLieu === 'number' ? t.linhLieu : 0);   // migrate Linh Liệu cũ -> Linh Thảo
  if (!t.shopCd) t.shopCd = {};
  if (!t.events) t.events = { pending: [], cd: {}, queue: [], rebels: [], seen: 0 };
  ['pending', 'queue', 'rebels'].forEach((k) => { if (!Array.isArray(t.events[k])) t.events[k] = []; });
  if (!t.events.cd) t.events.cd = {};
  for (const d of t.disciples) if (!d.flags) d.flags = {};
}

function chronicle(t, text, gid) { const e = { t: Date.now(), text }; if (gid) e.gid = gid; t.soSach.unshift(e); if (t.soSach.length > 80) t.soSach.length = 80; }

// ============================================================
// SỰ KIỆN GIANG HỒ (chọn-mù) — roll trong simTongMon, resolve khi người chơi chọn.
// CÁCH LY: chỉ đụng state.tongMon + state.currencies.bac (sink 1 chiều). KHÔNG combat/gear-power.
// ============================================================
const EVT_LAMBDA_H = 0.22;     // sự kiện/giờ (TUNE 2026-06-22: 0.15 -> 0.22, ~5.3/ngày)
const EVT_MAXGEN = 3;          // cap số sự kiện sinh mỗi lần sim (chống dội offline)
const EVT_PENDING_CAP = 4;     // tối đa pending tồn đọng
const REALM_COLORS = ['#cbd5e1', '#34d399', '#60a5fa', '#22d3ee', '#a78bfa', '#c4b5fd', '#e879f9', '#fb923c', '#f5b942', '#fbbf24'];
const FLAG_LABEL = {
  daoLu:     { t: 'Cờ · Đạo Lữ', c: '#34d399' },
  oanTham:   { t: 'Cờ · Oán Thầm', c: '#fb7185' },
  tamMaSeed: { t: 'Cờ · Mầm Tâm Ma', c: '#a78bfa' },
  tinhTrieu: { t: 'Cờ · Tình Triều', c: '#f472b6' },
  cuuChuoc:  { t: 'Cờ · Cải Tà', c: '#34d399' },
  triAn:     { t: 'Cờ · Tri Ân', c: '#34d399' },
  batPhuc:   { t: 'Cờ · Bất Phục', c: '#fb7185' },
  phatPhan:  { t: 'Cờ · Phát Phẫn', c: '#f5b942' },
};
const TONE_META = { lanh: { label: 'KẾT LÀNH', color: '#34d399' }, du: { label: 'KẾT DỮ', color: '#fb7185' }, trung: { label: 'LÀNH DỮ KHÓ LƯỜNG', color: '#f5b942' } };
const chip = (label, color) => ({ label, color });

function resolveCast(t, uids) { return (uids || []).map((u) => t.disciples.find((d) => d.uid === u)).filter(Boolean); }

function evtCtx(t, cast, rebel) {
  const main = cast[0] || null, second = cast[1] || null;
  const khiVan = t.khiVan || 50;
  const rng = () => Math.random();
  const lucky = (base) => rng() < Math.max(0.03, Math.min(0.97, (base == null ? 0.5 : base) + (khiVan - 50) / 200));
  const hasTrait = (tr, who) => { const w = who || main; return !!(w && w.traits && w.traits.includes(tr)); };
  const anyTrait = (trs, who) => trs.some((tr) => hasTrait(tr, who));
  return { t, khiVan, dao: t.dao, cast, main, second, rebel, rng, lucky, hasTrait, anyTrait };
}

// Áp 1 OUTCOME -> trả về mảng chip "Dư Âm" để hiển thị.
function applyOutcome(state, t, ev, oc, cast, rebel, now) {
  const chips = [];
  const findD = (uid) => t.disciples.find((d) => d.uid === uid);
  for (const e of (oc.effects || [])) {
    if ('uy' in e) { t.uyBonus = (t.uyBonus || 0) + e.uy; chips.push(chip((e.uy >= 0 ? '+' : '−') + Math.abs(e.uy) + ' Uy Danh', e.uy >= 0 ? '#fbbf24' : '#fb7185')); }
    else if ('khiVan' in e) { t.khiVan = Math.max(0, Math.min(100, (t.khiVan || 50) + e.khiVan)); chips.push(chip('Khí Vận ' + (e.khiVan >= 0 ? '+' : '−') + Math.abs(e.khiVan), e.khiVan >= 0 ? '#22d3ee' : '#fb7185')); }
    else if ('congHien' in e) { t.congHien = Math.max(0, (t.congHien || 0) + e.congHien); chips.push(chip('Cống Hiến ' + (e.congHien >= 0 ? '+' : '−') + Math.abs(e.congHien), e.congHien >= 0 ? '#34d399' : '#fb7185')); }
    else if ('diem' in e) { t.diem = Math.max(0, (t.diem || 0) + e.diem); chips.push(chip('Điểm ' + (e.diem >= 0 ? '+' : '−') + Math.abs(e.diem), e.diem >= 0 ? '#f5b942' : '#fb7185')); }
    else if ('bac' in e) { const cur = state.currencies.bac || 0; const dlt = e.bac < 0 ? -Math.min(cur, -e.bac) : e.bac; state.currencies.bac = cur + dlt; chips.push(chip((dlt >= 0 ? '+' : '−') + Math.abs(dlt) + ' Bạc', dlt >= 0 ? '#34d399' : '#fb7185')); }
    else if ('flag' in e) { const d = findD(e.flag.who); if (d) { if (!d.flags) d.flags = {}; d.flags[e.flag.name] = ('value' in e.flag) ? e.flag.value : true; const lb = FLAG_LABEL[e.flag.name]; if (lb) chips.push(chip(lb.t, lb.c)); } }
    else if ('capBonus' in e) { const d = findD(e.capBonus.who); if (d) { d.capBonus = (d.capBonus || 0) + e.capBonus.n; chips.push(chip('+' + e.capBonus.n + ' bậc trần · ' + d.name, '#34d399')); } }
    else if ('realmUp' in e) { const d = findD(e.realmUp.who); if (d) { const cap = disciCap(d); d.realm = Math.min(cap, d.realm + e.realmUp.n); d.xp = 0; if (d.realm >= cap && cap >= 9) d.awaiting = true; chips.push(chip('Đột phá +' + e.realmUp.n + ' · ' + d.name, '#fbbf24')); } }
    else if ('rebel' in e) { const i = t.disciples.findIndex((d) => d.uid === e.rebel.who); if (i >= 0) { const d = t.disciples[i]; t.disciples.splice(i, 1); t.events.rebels.push({ name: d.name, han: d.han, apt: d.apt, he: d.he, realm: d.realm, fromUid: d.uid, at: now }); chips.push(chip(d.name + ' → Phản Đồ', '#a78bfa')); } }
    else if ('recapture' in e) { if (rebel) { const i = t.events.rebels.findIndex((r) => r.fromUid === rebel.fromUid); if (i >= 0) t.events.rebels.splice(i, 1); const nd = genDisciple({ name: rebel.name, han: rebel.han, apt: rebel.apt, he: rebel.he }); nd.realm = rebel.realm; nd.flags = { cuuChuoc: true }; t.disciples.push(nd); chips.push(chip(rebel.name + ' · quy hàng', '#34d399')); } }
    else if ('dismissRebel' in e) { if (rebel) { const i = t.events.rebels.findIndex((r) => r.fromUid === rebel.fromUid); if (i >= 0) t.events.rebels.splice(i, 1); chips.push(chip(rebel.name + ' · dứt nợ', '#94a3b8')); } }
    else if ('bietHieu' in e) { const d = findD(e.bietHieu.who); if (d) { d.bietHieu = e.bietHieu.name; chips.push(chip('Biệt hiệu · ' + e.bietHieu.name, '#f5b942')); } }
    else if ('queue' in e) { t.events.queue.push({ eid: e.queue.eid, notBefore: now + (e.queue.delayH || 24) * 3600 * 1000, rebelFrom: e.queue.rebelFrom || (rebel ? rebel.fromUid : null) }); }
  }
  if (oc.chronicle) chronicle(t, oc.chronicle);
  t.events.seen = (t.events.seen || 0) + 1;
  return chips;
}

// Nổ 1 sự kiện theo id. payload: { castUids?, rebelFrom? }. auto -> áp ngay; choice -> đẩy vào pending.
function fireEvent(state, t, eid, payload, now) {
  const ev = TM_EVENT_BY_ID[eid]; if (!ev) return false;
  let cast = [];
  if (payload && payload.castUids) cast = resolveCast(t, payload.castUids);
  else if (ev.pick) { try { cast = resolveCast(t, ev.pick(t) || []); } catch (e) { cast = []; } }
  const rebel = (payload && payload.rebelFrom) ? (t.events.rebels.find((r) => r.fromUid === payload.rebelFrom) || null) : null;
  const ctx = evtCtx(t, cast, rebel);
  t.events.cd[eid] = now + (ev.cdH || 24) * 3600 * 1000;
  if (ev.kind === 'auto') { let oc; try { oc = ev.auto(ctx); } catch (e) { return false; } if (oc) applyOutcome(state, t, ev, oc, cast, rebel, now); return true; }
  let story = ''; try { story = ev.story ? ev.story(ctx) : ''; } catch (e) { story = ''; }
  t.events.pending.push({
    eid, grp: ev.grp, han: ev.han, title: ev.title, story, at: now,
    castUids: cast.map((d) => d.uid), rebelFrom: (payload && payload.rebelFrom) || (rebel ? rebel.fromUid : null),
    cast: cast.map((d) => ({ name: d.name, han: d.han, apt: d.apt, aptName: APT[d.apt].name, aptColor: APT[d.apt].color, heHan: (HE[d.he] || HE.kim).han, heColor: (HE[d.he] || HE.kim).color, realmName: REALMS[d.realm].name, realmColor: REALM_COLORS[d.realm] || '#cbd5e1' })),
    rebel: rebel ? { name: rebel.name, han: rebel.han, aptName: (APT[rebel.apt] || {}).name || '', aptColor: (APT[rebel.apt] || {}).color || '#a78bfa', realmName: (REALMS[rebel.realm] || {}).name || '', realmColor: REALM_COLORS[rebel.realm] || '#a78bfa', heHan: (HE[rebel.he] || HE.kim).han } : null,
    choices: ev.choices.map((ch) => ({ label: ch.label, flavor: ch.flavor })),
  });
  if (t.events.pending.length > EVT_PENDING_CAP) t.events.pending.splice(0, t.events.pending.length - EVT_PENDING_CAP);
  return true;
}

function eventEligibleRandom(t, ev, now) {
  if (!ev || ev.chain) return false;                              // sự kiện chuỗi chỉ nổ qua queue
  if ((t.events.cd[ev.id] || 0) > now) return false;
  if (ev.kind === 'choice' && t.events.pending.some((p) => p.eid === ev.id)) return false;
  try { return !ev.cond || !!ev.cond(t); } catch (e) { return false; }
}

function fireRandomOne(state, t, now) {
  const pool = TM_EVENTS.filter((ev) => eventEligibleRandom(t, ev, now));
  if (!pool.length) return false;
  let tot = 0; pool.forEach((e) => (tot += e.weight || 10));
  let r = Math.random() * tot, ev = pool[0];
  for (const e of pool) { r -= (e.weight || 10); if (r <= 0) { ev = e; break; } }
  return fireEvent(state, t, ev.id, {}, now);
}

function processEventQueue(state, t, now) {
  for (let i = 0; i < t.events.queue.length;) {
    const q = t.events.queue[i];
    if (q.notBefore <= now && t.events.pending.length < EVT_PENDING_CAP) { t.events.queue.splice(i, 1); fireEvent(state, t, q.eid, { rebelFrom: q.rebelFrom }, now); }
    else i++;
  }
}

function rollEvents(state, t, dtSec, now) {
  if (!t.disciples.length || t.events.pending.length >= EVT_PENDING_CAP) return;
  const lambda = (EVT_LAMBDA_H / 3600) * dtSec;
  if (lambda <= 0) return;
  let k = 0, p = 1; const L = Math.exp(-lambda);          // Poisson(lambda) — Knuth
  do { k++; p *= Math.random(); } while (p > L && k < 60);
  let count = Math.min(EVT_MAXGEN, k - 1);
  while (count-- > 0 && t.events.pending.length < EVT_PENDING_CAP) fireRandomOne(state, t, now);
}

// ---- API: người chơi chọn 1 lựa chọn ở pending[pendingIdx] -> trả OUTCOME hiển thị (Hồi Kết) ----
export function resolveEvent(state, pendingIdx, choiceIdx) {
  const t = state.tongMon; if (!t || !t.events) return null;
  const p = t.events.pending[pendingIdx]; if (!p) return null;
  const ev = TM_EVENT_BY_ID[p.eid]; if (!ev) { t.events.pending.splice(pendingIdx, 1); return null; }
  const cast = resolveCast(t, p.castUids || []);
  const rebel = p.rebelFrom ? (t.events.rebels.find((r) => r.fromUid === p.rebelFrom) || null) : null;
  const ch = ev.choices[choiceIdx]; if (!ch) return null;
  const ctx = evtCtx(t, cast, rebel);
  let oc; try { oc = ch.resolve(ctx); } catch (e) { oc = { tone: 'trung', text: 'Chuyện qua đi như gió thoảng.', effects: [], chronicle: '' }; }
  const now = Date.now();
  const chips = applyOutcome(state, t, ev, oc, cast, rebel, now);
  t.events.pending.splice(pendingIdx, 1);
  const tn = TONE_META[oc.tone] || TONE_META.trung;
  return { tone: oc.tone, toneLabel: tn.label, toneColor: tn.color, text: oc.text, chips, chronicle: oc.chronicle || '', tease: oc.tease || null, title: ev.title, grp: ev.grp, han: ev.han };
}

// ---- DEV: ép nổ 1 sự kiện theo id (F9) ----
export function forceFireEvent(state, eid) { const t = state.tongMon; if (!t) return false; return fireEvent(state, t, eid, {}, Date.now()); }

// ---- Tốc độ tu luyện 1 đệ tử (fraction/giây của cảnh giới hiện tại) ----
export function disciSpeed(t, d) {
  const buff = 1 + (BUILDINGS.dienVo.buffPerLv * (t.buildings.dienVo || 0)) + 0.02 * (t.buildings.tuLinh || 0);
  const sec = REALMS[d.realm].hours * 3600;
  return (APT[d.apt].mul * buff) / sec;
}

// ---- Lazy-sim: tiến độ tu luyện + sản lượng theo elapsed ----
export function simTongMon(state, nowMs, capHours) {
  const t = state.tongMon; if (!t) return null;
  let dt = (nowMs - (t.lastSimAt || nowMs)) / 1000;
  if (dt <= 0) { t.lastSimAt = nowMs; return null; }
  if (capHours) dt = Math.min(dt, capHours * 3600);
  t.lastSimAt = nowMs;
  const breaks = [];
  let tuCount = 0;
  const buff = 1 + (BUILDINGS.dienVo.buffPerLv * (t.buildings.dienVo || 0)) + 0.02 * (t.buildings.tuLinh || 0);
  for (const d of t.disciples) {
    if (d.state !== 'tu' || d.awaiting) continue;
    tuCount++;
    if (d.breakReady) continue;                  // BÌNH CẢNH: viên mãn, chờ người chơi đột phá (KHÔNG tự lên)
    const cap = disciCap(d);
    if (d.realm >= cap) { if (cap >= 9 && !d.awaiting) d.awaiting = true; continue; }
    const spd = APT[d.apt].mul * buff;       // hệ số tốc; mỗi cảnh giới tốn (hours*3600/spd) giây thực
    let rem = dt;
    while (rem > 0 && d.realm < cap) {
      const realmSec = (REALMS[d.realm].hours * 3600) / spd;   // tổng giây thực để xong cảnh giới này
      const need = (1 - (d.xp || 0)) * realmSec;               // còn lại để đột phá
      if (rem >= need) {
        d.xp = 1; d.breakReady = true; rem = 0;                // ĐẦY -> Bình Cảnh (cần Linh Đan/Liệu/Hồn Thạch để đột phá)
        breaks.push({ name: d.name, realm: REALMS[d.realm].name, bottleneck: true });
        chronicle(t, `${d.name} tu vi viên mãn ${REALMS[d.realm].name}, lâm Bình Cảnh — chờ đột phá đại cảnh.`);
        break;
      } else {
        d.xp = (d.xp || 0) + rem / realmSec; rem = 0;
      }
    }
  }
  // Y Quán TINH LUYỆN: tốn Linh Thảo (kho) -> ra Linh Đan; hết Thảo thì ngưng (side-only)
  const yq = t.buildings.yQuan || 0;
  if (yq > 0 && (t.linhThao || 0) > 0) {
    const useThao = Math.min(t.linhThao, dt * (BUILDINGS.yQuan.refineThaoH * yq) / 3600);   // Thảo tiêu = rate × cấp × giờ, không quá kho
    t.linhThao -= useThao;
    t.linhDan = (t.linhDan || 0) + useThao * BUILDINGS.yQuan.danPerThao;                     // Thảo -> Đan theo tỉ lệ
  }
  // sản lượng idle (side-only) — scale theo GIỜ (DRAFT, TUNE)
  t.diem = (t.diem || 0) + dt * (BUILDINGS.tangThu.diemPerLvH * (t.buildings.tangThu || 0)) / 3600;
  t.congHien = (t.congHien || 0) + dt * (tuCount * 3 + 1) / 3600;        // ~3/giờ mỗi đệ tử tu luyện + 1 nền
  t.khiVan = Math.min(100, (t.khiVan || 50) + dt * (BUILDINGS.tuLinh.khiPerLv * (t.buildings.tuLinh || 0)) / 36000);
  // ---- Sự kiện giang hồ: chuỗi đã hẹn (queue) + roll ngẫu nhiên theo elapsed ----
  if (t.events) { try { processEventQueue(state, t, nowMs); rollEvents(state, t, dt, nowMs); } catch (e) {} }
  return { breaks };
}

// ---- Slot đệ tử ----
export function slotCount(t) { return BUILDINGS.tuHien.slotBase + BUILDINGS.tuHien.slotPerLv * ((t.buildings.tuHien || 1) - 1); }

// ---- Chiêu mộ ----
export function refreshRecruitPool(t, nowMs) {
  t.recruitPool = [genDisciple(), genDisciple(), genDisciple()];
  t.recruitAt = nowMs;
}
export function recruitCost(t) { return { bac: 500 + 200 * t.disciples.length }; } // tốn Bạc (sink 1 chiều)
export function doRecruit(state, idx) {
  const t = state.tongMon;
  const cand = t.recruitPool[idx]; if (!cand) return false;
  if (t.disciples.length >= slotCount(t)) return false;
  const cost = recruitCost(t).bac;
  if ((state.currencies.bac || 0) < cost) return false;
  state.currencies.bac -= cost;                  // tiền main chảy 1 chiều VÀO
  t.recruitPool.splice(idx, 1);
  cand.recruitedAt = Date.now();
  t.disciples.push(cand);
  chronicle(t, `Thu nhận ${cand.name} (${APT[cand.apt].name}) vào môn.`);
  return true;
}

// ---- Đổi lứa Chiêu Hiền: tốn Hồn Thạch (main->phụ 1 chiều), giới hạn 3 lần / 24h (reset theo ngày real) ----
export const RECRUIT_RESET_COST = 2500;   // Hồn Thạch / lần
export const RECRUIT_RESET_MAX = 3;        // tối đa mỗi 24h
const RECRUIT_DAY_MS = 86400000;
export function recruitResetInfo(t, nowMs) {
  const day = Math.floor(nowMs / RECRUIT_DAY_MS);
  const used = (t && t.recruitResetDay === day) ? (t.recruitResetCount || 0) : 0;
  return { used, max: RECRUIT_RESET_MAX, left: RECRUIT_RESET_MAX - used, cost: RECRUIT_RESET_COST, resetInMs: (day + 1) * RECRUIT_DAY_MS - nowMs };
}
export function doRecruitReset(state, nowMs) {
  const t = state.tongMon; if (!t) return { ok: false, msg: 'Chưa có tông môn.' };
  const day = Math.floor(nowMs / RECRUIT_DAY_MS);
  if (t.recruitResetDay !== day) { t.recruitResetDay = day; t.recruitResetCount = 0; }   // sang ngày mới -> reset bộ đếm
  if ((t.recruitResetCount || 0) >= RECRUIT_RESET_MAX) return { ok: false, msg: `Hết lượt đổi lứa hôm nay (${RECRUIT_RESET_MAX}/${RECRUIT_RESET_MAX}).` };
  if ((state.currencies.honThach || 0) < RECRUIT_RESET_COST) return { ok: false, msg: `Không đủ Hồn Thạch (cần ${RECRUIT_RESET_COST}).` };
  state.currencies.honThach -= RECRUIT_RESET_COST;
  t.recruitResetCount = (t.recruitResetCount || 0) + 1;
  refreshRecruitPool(t, nowMs);
  return { ok: true, msg: `Đổi lứa mới · -${RECRUIT_RESET_COST} Hồn Thạch (${t.recruitResetCount}/${RECRUIT_RESET_MAX})` };
}

// ---- ĐỘT PHÁ đại cảnh: viên mãn (breakReady) -> nạp Linh Đan + Linh Liệu (Y Quán) + Hồn Thạch (main 1 chiều) ----
export function breakReqOf(d) { return (d && d.breakReady) ? (BREAK_REQ[d.realm] || null) : null; }
export function doBreakthrough(state, uid) {
  const t = state.tongMon; if (!t) return { ok: false, msg: 'Chưa có tông môn.' };
  const d = t.disciples.find((x) => x.uid === uid);
  if (!d || !d.breakReady) return { ok: false, msg: 'Đệ tử chưa tới Bình Cảnh.' };
  const cap = disciCap(d);
  if (d.realm >= cap) { d.breakReady = false; return { ok: false, msg: 'Đã đạt trần cảnh giới.' }; }
  const req = BREAK_REQ[d.realm]; if (!req) return { ok: false, msg: 'Không rõ yêu cầu đột phá.' };
  if ((t.linhDan || 0) < req.dan) return { ok: false, msg: `Thiếu Linh Đan (cần ${req.dan}, có ${Math.floor(t.linhDan || 0)}). Y Quán cần Linh Thảo để luyện.` };
  if ((state.currencies.honThach || 0) < req.honThach) return { ok: false, msg: `Thiếu Hồn Thạch (cần ${req.honThach}).` };
  t.linhDan -= req.dan; state.currencies.honThach -= req.honThach;
  d.realm++; d.xp = 0; d.breakReady = false;
  if (d.realm >= cap && cap >= 9) { d.awaiting = true; chronicle(t, `★ ${d.name} đột phá Đắc Đạo — chờ ngươi định đoạt tiền đồ.`); }
  else chronicle(t, `${d.name} đột phá ${REALMS[d.realm].name}!`);
  return { ok: true, msg: `${d.name} đột phá ${REALMS[d.realm].name}!`, realm: REALMS[d.realm].name };
}
// ---- Mua Linh Thảo bằng Điểm Đấu Giá (nguồn Phase A; sau thêm Lịch Luyện/Dược Viên/kỳ ngộ) ----
export function buyThao(state, qty) {
  const t = state.tongMon; if (!t) return { ok: false, msg: 'Chưa có tông môn.' };
  qty = Math.max(1, Math.floor(qty || 1));
  const cost = THAO_PRICE * qty;
  if ((t.diem || 0) < cost) return { ok: false, msg: `Thiếu Điểm Đấu Giá (cần ${cost}, có ${Math.floor(t.diem || 0)}).` };
  t.diem -= cost; t.linhThao = (t.linhThao || 0) + qty;
  return { ok: true, msg: `Mua ${qty} Linh Thảo · -${cost} Điểm Đấu Giá` };
}

// ---- Gia Bảo: ban đồ từ gearBag main -> đệ tử (1 chiều). slot lấy từ equip catalog (truyền sẵn) ----
export function giftGear(state, discipleUid, gearUid, slot, itemName) {
  const t = state.tongMon;
  const d = t.disciples.find((x) => x.uid === discipleUid); if (!d) return false;
  const gi = (state.gearBag || []).findIndex((g) => g.uid === gearUid); if (gi < 0) return false;
  const inst = state.gearBag[gi];
  state.gearBag.splice(gi, 1);                   // RỜI kho main (sink)
  if (!d.gear) d.gear = {};
  const old = d.gear[slot];
  if (old) state.gearBag.push(old);              // thu hồi món cũ về kho
  d.gear[slot] = inst;
  chronicle(t, itemName ? `Ban gia bảo 「${itemName}」 cho ${d.name}.` : `Ban gia bảo cho ${d.name}.`, inst.gearId);
  return true;
}
export function reclaimGear(state, discipleUid, slot) {
  const t = state.tongMon;
  const d = t.disciples.find((x) => x.uid === discipleUid); if (!d || !d.gear || !d.gear[slot]) return false;
  state.gearBag.push(d.gear[slot]); delete d.gear[slot]; return true;
}
function gearPow(inst) { return (QRANK[inst.quality] || 1) * (inst.itemLv || 1) * (1 + 0.08 * (inst.plus || 0)); }

// ---- Thực Lực Đệ Tử (SIDE-ONLY) ----
// Realm "mượt": tiến theo tiểu cảnh (xp trong đại cảnh); đã tới trần -> coi như Viên Mãn (+1).
function realmF(d) { const r = d.realm || 0; return r + (r >= disciCap(d) ? 1 : (d.xp || 0)); }
export function disciPower(d) {
  let p = (realmF(d) + 1) * 10 * APT[d.apt].mul;
  if (d.gear) for (const k in d.gear) p += gearPow(d.gear[k]);
  return Math.round(p);
}

// ---- Bộ chỉ số tổng SIDE-ONLY (suy từ cảnh giới + tư chất + Gia Bảo; KHÔNG đụng deriveCombat của main) ----
const APT_TIER = { pham: 0, trung: 1, thuong: 2, tuyet: 3, thien: 4 };
export function disciStats(d) {
  const r = d.realm || 0, mul = APT[d.apt].mul, tier = APT_TIER[d.apt] || 0;
  const rv = realmF(d);                                      // realm mượt (leo theo tiểu cảnh)
  const gp = gearTotal(d);
  const base = (rv + 1) * mul;
  return {
    chienLuc: disciPower(d),                                 // = Thực Lực
    atk: Math.round(base * 22 + gp * 0.7),
    spd: Math.round(60 + rv * 16 + mul * 30),
    crit: Math.min(0.6, 0.05 + tier * 0.03 + r * 0.012),
    critDmg: +(1.5 + tier * 0.12 + r * 0.04).toFixed(2),
    def: Math.round(base * 26 + gp * 0.6),
    maxHP: Math.round(base * 340 + gp * 5),
    dodge: Math.min(0.4, 0.02 + r * 0.01),
    regenPct: 0.01 + Math.floor(r / 3) * 0.005,
    maxNL: Math.round(base * 30 + gp * 0.5),
    nlRegen: Math.round(4 + r * 1.2),
    heChinh: d.he, heBonus: 0.10 + tier * 0.03,
  };
}

// ---- Uy Danh Giang Hồ (điểm tổng, LIVE) ----
export function uyDanhOf(t) {
  let uy = 0;
  for (const d of t.disciples) uy += (CUM_UY[d.realm] || 0) + Math.round(gearTotal(d) * 0.4);
  for (const e of t.elders) uy += (CUM_UY[e.realm] || 0) + 300;
  uy += t.legends.length * 600;
  uy += BUILD_KEYS.reduce((a, k) => a + (t.buildings[k] || 0), 0) * 15;
  uy += (t.uyBonus || 0);                         // +Uy Danh tích từ SỰ KIỆN
  return Math.round(uy);
}
function gearTotal(d) { let s = 0; if (d.gear) for (const k in d.gear) s += gearPow(d.gear[k]); return s; }

// ---- Xuất Sư / Phong Trưởng Lão (đệ tử đã Đắc Đạo) ----
export function xuatSu(state, discipleUid) {
  const t = state.tongMon; const i = t.disciples.findIndex((x) => x.uid === discipleUid);
  if (i < 0 || !t.disciples[i].awaiting) return false;
  const d = t.disciples[i]; t.disciples.splice(i, 1);
  // gia bảo theo đệ tử đi (huyền thoại cầm binh khí sư phụ) — KHÔNG trả về kho
  t.legends.push({ name: d.name, apt: d.apt, han: d.han, at: Date.now() });
  chronicle(t, `★ ${d.name} đắc đạo Xuất Sư, vân du thiên hạ — danh chấn giang hồ, do Tông Môn ngươi đào tạo.`);
  return true;
}
export function phongTruongLao(state, discipleUid) {
  const t = state.tongMon; const i = t.disciples.findIndex((x) => x.uid === discipleUid);
  if (i < 0 || !t.disciples[i].awaiting) return false;
  const d = t.disciples[i]; t.disciples.splice(i, 1); t.elders.push(d);
  chronicle(t, `${d.name} ở lại làm Trưởng Lão, truyền dạy hậu bối.`);
  return true;
}

// ---- Nâng công trình (sink Bạc + Cống Hiến, 1 chiều) ----
export function upgradeBuilding(state, key) {
  const t = state.tongMon; const lv = t.buildings[key] || 0; const c = buildCost(lv);
  if ((state.currencies.bac || 0) < c.bac || (t.congHien || 0) < c.congHien) return false;
  state.currencies.bac -= c.bac; t.congHien -= c.congHien; t.buildings[key] = lv + 1;
  return true;
}

// ---- Đấu Giá Hội: tiêu Điểm Đấu Giá (t.diem). Phần thưởng SIDE-ONLY / cosmetic ----
function boostedApt() {                                   // lứa Chiêu Hiền Lệnh: thiên về tư chất cao
  const w = { pham: 6, trung: 16, thuong: 34, tuyet: 30, thien: 14 };
  let tot = 0; APT_KEYS.forEach((k) => (tot += w[k])); let r = Math.random() * tot;
  for (const k of APT_KEYS) { r -= w[k]; if (r <= 0) return k; } return 'thuong';
}
function shopRefreshPool(t) { t.recruitPool = [genDisciple({ apt: boostedApt() }), genDisciple({ apt: boostedApt() }), genDisciple({ apt: boostedApt() })]; t.recruitAt = Date.now(); }
export function tmShopBuy(state, id, opt = {}) {
  const t = state.tongMon; if (!t) return { ok: false, msg: 'Chưa có tông môn' };
  const item = TM_SHOP.find((x) => x.id === id); if (!item) return { ok: false, msg: 'Không có mục này' };
  if ((t.diem || 0) < item.cost) return { ok: false, msg: 'Thiếu Điểm Đấu Giá' };
  const nowMs = Date.now();
  if (item.cdH && ((t.shopCd && t.shopCd[id]) || 0) > nowMs) return { ok: false, msg: item.name + ' đang tĩnh dưỡng — đợi phiên sau' };
  switch (id) {
    case 'khiVan': t.khiVan = Math.min(100, (t.khiVan || 50) + 15); break;
    case 'recruit': shopRefreshPool(t); break;
    case 'advisor': { let n = 0; for (const d of t.disciples) { if (d.state === 'tu' && !d.awaiting && d.realm < disciCap(d)) { d.xp = Math.min(0.99, (d.xp || 0) + 0.25); n++; } } if (!n) return { ok: false, msg: 'Không có đệ tử đang tu' }; break; }
    case 'calm': { for (const d of t.disciples) { if (d.flags) ['oanTham', 'tamMaSeed', 'batPhuc', 'tinhTrieu'].forEach((k) => { delete d.flags[k]; }); } break; }
    case 'rename': { const nm = (opt.name || '').trim().slice(0, 16); if (!nm) return { ok: false, msg: 'Tên không hợp lệ' }; t.name = nm; break; }
    case 'dao': { if (!['chinh', 'ta', 'trung'].includes(opt.dao)) return { ok: false, msg: 'Chọn Đạo' }; t.dao = opt.dao; break; }
    default: return { ok: false, msg: 'Chưa hỗ trợ' };
  }
  if (item.cdH) { if (!t.shopCd) t.shopCd = {}; t.shopCd[id] = nowMs + item.cdH * 3600 * 1000; }
  t.diem -= item.cost;
  chronicle(t, `Đấu Giá Hội: ${item.name}.`);
  return { ok: true, msg: item.name };
}

// helpers hiển thị
export function realmInfo(d) { return REALMS[d.realm]; }
export function aptInfo(d) { return APT[d.apt]; }
export function heInfo(d) { return HE[d.he] || HE.kim; }
