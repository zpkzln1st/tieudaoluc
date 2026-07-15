// ============================================================
// KỲ TRẬN · CỬU CUNG TRẤN YÊU — mini-game match-3 (side-content, 0-power)
// Khuôn Đăng Tiên Mộng: cách ly tuyệt đối, CHỈ đọc/ghi state.kyTran.
// Meta-map Bát Quái 9 Cung (mỗi Cung 5 trận + Cung Chủ) + Ngũ Hành Vòng Trận
// (cây nâng cấp La Bàn Bát Quái) + Trảm Yêu Lục + Trận Đồ Bảng.
// Tiền tệ riêng: Trận Hồn (chỉ kiếm/tiêu trong Kỳ Trận). Lượt đánh cap tuần.
// ============================================================
import { KT_CONST, KT_HANH, KT_HANH_ORDER, KT_KHAC, KT_CUNG, KT_TAM_PHAP, KT_SKILLS, KT_BOSS_SKILLS } from './data/kytran.js';
import { mountKtBattle } from './kytran_combat.js';
import { Storage } from './engine/save.js';
import { dongPhuTramYeuBonus } from './engine/dongphu.js';

// ---------- ensure/migrate: khởi tạo state.kyTran (gọi mỗi lần load) ----------
export function ensureKyTran(state) {
  if (!state.kyTran) state.kyTran = {};
  const k = state.kyTran;
  if (k.tranHon == null) k.tranHon = 0;                 // Trận Hồn đang có
  if (k.trung == null) k.trung = 1;                     // Trùng (NG+) 1..3
  if (!k.prog) k.prog = {};                             // { cungId: trận đã thắng 0..6 (6 = đã chiếm) }
  if (!k.week) k.week = { weekId: null, used: 0 };      // lượt đánh trong tuần
  if (!k.nguHanh) k.nguHanh = { moc: 0, hoa: 0, tho: 0, kim: 0, thuy: 0 };
  if (!k.tp) k.tp = ['tuSa'];                           // tâm pháp đã mở
  if (!k.sk) k.sk = ['kiemKhi', 'hoanTinh', 'huyetSat'];// kỹ năng đã mở
  if (!k.loadout) k.loadout = { tamPhap: 'tuSa', skills: ['kiemKhi', 'hoanTinh', 'huyetSat'] };
  if (!k.codex) k.codex = {};                           // Trảm Yêu Lục: { art: số lần hạ }
  if (k.wins == null) k.wins = 0;                       // tổng trận thắng (điểm bảng)
  if (k.maDeKills == null) k.maDeKills = 0;             // số lần diệt Ma Đế (mọi Trùng)
}

// tuần neo thứ Hai (idiom giống Đăng Tiên Mộng)
function ktWeekId() {
  const d = new Date();
  const dow = (d.getDay() + 6) % 7;
  const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow);
  return mon.getFullYear() + '-' + String(mon.getMonth() + 1).padStart(2, '0') + '-' + String(mon.getDate()).padStart(2, '0');
}

// lưới 3×3: các Cung kề trực giao (Trung Cung index 4 KHÔNG làm cầu nối)
function ktNeighbors(i) {
  const r = Math.floor(i / 3), c = i % 3, out = [];
  if (r > 0) out.push(i - 3);
  if (r < 2) out.push(i + 3);
  if (c > 0) out.push(i - 1);
  if (c < 2) out.push(i + 1);
  return out.filter((n) => n !== 4);
}

// ---------- Alpine component ----------
export function kyTran() {
  return {
    ktTab: 'map',
    selCung: null,          // index Cung đang chọn trên bản đồ
    selHanh: 'moc',         // Hành đang chọn ở tab Ngũ Hành
    inBattle: false,        // đang trong trận match-3 (mount imperative)
    confirmTrung: false,    // khóa 2-chạm cho nút Nhập Trùng (tránh xóa nhầm bản đồ)
    KT_CUNG, KT_HANH, KT_HANH_ORDER, KT_CONST, KT_TAM_PHAP, KT_SKILLS,

    // ---- icon SVG stroke (đồng bộ ngôn ngữ icon game — 0 emoji) ----
    _ICO: {
      lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
      crown: '<path d="M3 17 5 8l4.5 4L12 6.5 14.5 12 19 8l2 9Z"/><path d="M6 20.5h12"/>',
      book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    },
    svgi(n) {
      return '<svg class="ktr-svgi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (this._ICO[n] || '') + '</svg>';
    },

    // ---- state tắt ----
    get kt() { return this.$store.game.state.kyTran; },
    get tranCap() { const n = this.kt.nguHanh; return KT_HANH_ORDER.reduce((t, k) => t + (n[k] || 0), 0); },

    ktInit() {
      ensureKyTran(this.$store.game.state);
      this.weekCheck();
      // mở sẵn Cung đang đánh dở, không thì Cung mở đầu tiên
      let pick = KT_CUNG.findIndex((c, i) => this.cungSt(i) === 'active');
      if (pick < 0) pick = KT_CUNG.findIndex((c, i) => this.cungSt(i) === 'open');
      this.selCung = pick >= 0 ? pick : 0;
      this.devInit();
      // Rời tab Kỳ Trận giữa trận → tháo combat (gỡ listener resize + dừng async), tính như bỏ trận
      this.$watch('$store.game.view', (v) => {
        if (v !== 'kyTran' && this._battle) { try { this._battle.destroy(); } catch (e) {} this._battle = null; this.inBattle = false; }
      });
    },

    // ---- lượt tuần ----
    weekCheck() {
      const w = this.kt.week, id = ktWeekId();
      if (w.weekId !== id) { w.weekId = id; w.used = 0; }
    },
    get weekCap() {
      // Trảm Yêu Đài (Động Phủ) cộng lượt: +1 lượt/bậc (0-power assist chậm, gate độ bền — giống knob Mộng Đài)
      let bonus = 0;
      try { bonus = dongPhuTramYeuBonus(this.$store.game.state); } catch (e) { bonus = 0; }
      return KT_CONST.WEEK_CAP + bonus;
    },
    get weekLeft() { this.weekCheck(); return Math.max(0, this.weekCap - this.kt.week.used); },

    // ---- bản đồ Cửu Cung ----
    cungProg(i) { return this.kt.prog[KT_CUNG[i].id] || 0; },
    cungDone(i) { return this.cungProg(i) >= 6; },
    cungUnlocked(i) {
      if (this._devOpenAll) return true;                                        // Dev: mở khóa mọi Cung để test
      if (i === 4) return KT_CUNG.every((c, j) => j === 4 || this.cungDone(j)); // Trung Cung: cần 8 Cung ngoài
      if (i === 0) return true;                                                 // Thiên Cương: cửa khởi đầu
      return ktNeighbors(i).some((n) => this.cungDone(n));
    },
    cungSt(i) {
      if (this.cungDone(i)) return 'done';
      if (!this.cungUnlocked(i)) return 'locked';
      return this.cungProg(i) > 0 ? 'active' : 'open';
    },
    cungStLabel(i) {
      const st = this.cungSt(i);
      if (i === 4 && st === 'locked') return 'Cần đủ 8 Cung';
      return { done: 'Chiếm Lĩnh', active: 'đang đánh', open: 'Sẵn sàng', locked: 'Đang Phong Ấn' }[st];
    },
    cungBadge(i) {
      const st = this.cungSt(i);
      if (st === 'done') return '6/6 trận';
      if (st === 'active') return this.cungProg(i) + '/6 trận';
      if (i === 4) return 'Ma Đế';
      return '6 trận';
    },
    cungCls(i) {
      const st = this.cungSt(i);
      return st + (i === 4 ? ' center' : '') + (this.selCung === i ? ' sel' : '');
    },
    selectCung(i) { if (this.cungSt(i) !== 'locked' || i === 4) this.selCung = i; },
    get cur() { return this.selCung == null ? null : KT_CUNG[this.selCung]; },
    // chuỗi 6 nút: 5 trận + Cung Chủ
    chainCls(n) { // n = 1..5
      const i = this.selCung, p = this.cungProg(i);
      if (this.cungDone(i) || n <= p) return 'done';
      return (n === p + 1 && this.cungSt(i) !== 'locked') ? 'cur' : '';
    },
    tranBadge(i, n) { return 'badge_hex.webp'; },  // trận 1-5 dùng chung 1 form (như cũ); Cung Chủ = bossBadge
    bossBadge(i) { return 'badge_hexfinalboss.webp'; },  // MỌI Cung Chủ dùng chung badge final boss (đồng đều)
    rewardOf(c) { // chip thưởng: tâm pháp / kỹ năng mở khi chiếm Cung
      const out = [];
      if (c.reward && c.reward.tp) { const t = KT_TAM_PHAP.find((x) => x.id === c.reward.tp); if (t) out.push({ img: 'images/kytran/tp_' + t.id + '.webp', txt: 'Tâm Pháp · ' + t.name }); }
      if (c.reward && c.reward.sk) { const s = KT_SKILLS.find((x) => x.id === c.reward.sk); if (s) out.push({ img: 'images/kytran/sk_' + s.id + '.webp', txt: 'Kỹ Năng · ' + s.name }); }
      return out;
    },
    bossMech(b, cungId) { // chip cơ chế Cung Chủ — đọc skill ĐỐI TRẬN thật (KT_BOSS_SKILLS) cho khớp combat
      const t = ['Sát khí ' + b.atk];
      if (b.heavyEvery) t.push('Đòn Nặng mỗi ' + b.heavyEvery + ' lượt');
      const sk = KT_BOSS_SKILLS[cungId] || {};
      const seeds = [sk.sig].concat(sk.khiSkills || []);
      if (seeds.includes('lietDiem')) t.push('Rải Lửa mỗi ' + (sk.sigEvery || 2) + ' lượt');
      else if (seeds.includes('coDoc')) t.push('Rải Độc mỗi ' + (sk.sigEvery || 2) + ' lượt');
      return t;
    },
    counterTxt(c) { // gợi ý Tương Khắc: Hành nào khắc hệ Cung này
      if (!c.hanh) return '';
      const kh = KT_KHAC.find((p) => p[1] === c.hanh);
      if (!kh) return '';
      const need = KT_HANH[kh[0]];
      return need.nm + ' khắc ' + KT_HANH[c.hanh].nm + (this.kt.nguHanh[kh[0]] >= 4 ? ' — đã mở, xuyên giáp Cung Chủ' : ' — cần ' + need.nm + ' Cấp 4');
    },

    // ---- Trùng (NG+): phá đủ 9 Cung → Nhập Trùng, tái lập bản đồ, yêu ma mạnh gấp bội ----
    get trung() { return this.kt.trung || 1; },
    trungRoman(n) { return ['I', 'II', 'III'][(n || 1) - 1] || String(n || 1); },
    get mapDone() { return KT_CUNG.every((c, i) => this.cungDone(i)); },
    get canAdvanceTrung() { return this.mapDone && this.trung < 3; },
    get nextTrungMult() { return KT_CONST.TRUNG_MULT[this.trung] || 1; },  // hệ số HP/ATK địch của Trùng KẾ
    armTrung() {                       // nút Nhập Trùng: chạm 1 = lên đạn, chạm 2 = xác nhận (bấm ra ngoài để hủy)
      if (!this.canAdvanceTrung) { this.confirmTrung = false; return; }
      if (this.confirmTrung) { this.advanceTrung(); return; }
      this.confirmTrung = true;
    },
    advanceTrung() {
      if (!this.canAdvanceTrung) return;
      this.confirmTrung = false;
      this.kt.trung = this.trung + 1;
      this.kt.prog = {};              // tái lập bản đồ (GIỮ Ngũ Hành + Trận Hồn + kỹ năng/tâm pháp + Trảm Yêu Lục)
      this.selCung = 0;              // về Thiên Cương (cửa khởi đầu)
      try { Storage.save(this.$store.game.state); } catch (e) {}
      try { this.$store.game.showToast('Kỳ Trận · Nhập Trùng ' + this.trungRoman(this.kt.trung) + ' — trận đồ tái lập, yêu ma mạnh gấp bội.'); } catch (e) {}
    },

    // ---- vào trận (mount combat imperative — ráp ở kytran_combat) ----
    get canFight() {
      if (this.selCung == null) return false;
      const st = this.cungSt(this.selCung);
      return (st === 'open' || st === 'active') && this.weekLeft > 0;
    },
    get ctaInfo() { // trạng thái nút hành động của Cung đang chọn
      const i = this.selCung;
      if (i == null) return null;
      const st = this.cungSt(i);
      if (i === 4 && st === 'locked') return { dim: true, ic: 'lock', txt: 'Đang phong ấn — cần chiếm đủ 8 Cung ngoài' };
      if (st === 'done') return null;                    // Cung đã chiếm: không hiện nút (bỏ "Đã Trấn Áp")
      if (st === 'locked') return { dim: true, ic: 'lock', txt: 'Đang Phong Ấn' };
      if (this.weekLeft <= 0) return { dim: true, ic: 'lock', txt: 'Hết lượt tuần — chờ tuần mới' };
      return { dim: false, ic: 'sword', txt: 'Phá Trận' };
    },
    _battle: null,
    _winApplied: false,          // đã ghi thắng trận hiện tại chưa (idempotent — khỏi mất/nhân đôi thưởng)
    startBattle() {
      if (!this.canFight || this.inBattle) return;
      this.inBattle = true;
      this._mountBattle(false);
    },
    // mount 1 trận cho Cung/prog hiện tại (skipLoadout=true khi bấm "Trận Kế": bỏ Lập Trận, giữ loadout)
    _mountBattle(skipLoadout) {
      this._winApplied = false;
      const i = this.selCung, c = KT_CUNG[i], p = this.cungProg(i);
      const isBoss = p >= 5;
      const raw = isBoss ? c.boss : c.mobs[p];
      const mult = KT_CONST.TRUNG_MULT[(this.kt.trung || 1) - 1] || 1;
      const tier = c.tier || 1;
      const DMG_MUL = { 1: 0.7, 2: 0.8, 3: 0.9, 4: 1, 5: 1.15, 6: 1.3 };   // ĐỐI TRẬN PHA 1: hệ số sát thương ô Kiếm địch theo tier
      const enemy = {
        name: raw.nm, sub: isBoss ? raw.sub : (c.nm + ' · Trận ' + (p + 1)),
        art: 'images/enemies/' + raw.art + '.webp',
        hp: Math.round(raw.hp * mult * 0.75), atk: Math.round(raw.atk * mult),   // HP ×0.75 (rebalance đối trận); atk giữ để tương thích (không dùng)
        tier, dmgMul: (DMG_MUL[tier] || 1) * mult,                                // sát thương phẳng ô Kiếm địch (đã gộp Trùng)
        heavyEvery: raw.heavyEvery, heavyMul: raw.heavyMul,
        poisonEvery: raw.poisonEvery, poisonK: raw.poisonK, poisonDmg: raw.poisonDmg, boss: isBoss,
      };
      // PHA 2: gán kỹ năng Cung Chủ (chỉ boss; sig/khiSkills/bite/atkRef/heavyMul override từ KT_BOSS_SKILLS)
      if (isBoss && KT_BOSS_SKILLS[c.id]) {
        const bs = KT_BOSS_SKILLS[c.id];
        // Sát thương CHIÊU (bite/atkRef/poisonDmg) giữ PHẲNG — độ khó Trùng đến từ HP×mult + tile dmgMul×mult (tránh chiêu one-shot ở Trùng cao)
        enemy.sig = bs.sig; enemy.sigEvery = bs.sigEvery; enemy.khiSkills = [...(bs.khiSkills || [])];
        enemy.bite = bs.bite || 0; enemy.atkRef = bs.atkRef || 0;
        if (bs.heavyMul != null) enemy.heavyMul = bs.heavyMul;
        if (bs.poisonK != null) enemy.poisonK = bs.poisonK;
        if (bs.poisonDmg != null) enemy.poisonDmg = bs.poisonDmg;
      }
      // Tương Khắc mốc Cấp 4: Hành khắc hệ Cung → +15% sát thương lên Cung Chủ hệ đó
      const mods = this.ktMods();
      if (isBoss && c.hanh) { const kh = KT_KHAC.find((x) => x[1] === c.hanh); if (kh && this.hanhLv(kh[0]) >= 4) mods.dmg *= 1.15; }
      // "Trận Kế" khả dụng: còn trận trong Cung (không phải Cung Chủ) & còn lượt cho trận kế (trận này tốn 1 → cần ≥2)
      const nextBattle = !isBoss && this.weekLeft >= 2;
      const rew = this._winRewardOf(c, p);   // thưởng thắng trận này (helper dùng chung với _applyWin → màn kết khớp bộ đếm)
      this.$nextTick(() => {
        const host = this.$refs.battleHost;
        if (!host) { this.inBattle = false; return; }
        host.innerHTML = '';
        this._battle = mountKtBattle(host, {
          hero: { name: (this.$store.game.state.player || {}).name || 'Hiệp Khách', art: this.$store.game.avatarSrc, maxHp: KT_CONST.HERO_HP, maxKhi: KT_CONST.HERO_KHI },
          enemy,
          lt: { tamPhap: this.kt.loadout.tamPhap, skills: [...(this.kt.loadout.skills || [])] },
          pools: { tp: [...this.kt.tp], sk: [...this.kt.sk] },
          tpData: KT_TAM_PHAP, skData: KT_SKILLS,
          mods, skipLoadout, nextBattle,
          winReward: { bonus: rew.hon + rew.cungHon, unlocks: rew.unlocks },   // hiển thị tổng thực nhận ở màn kết
          onLoadout: (lt) => { this.kt.loadout = { tamPhap: lt.tamPhap, skills: [...lt.skills] }; },
          onBattleStart: () => { this.weekCheck(); this.kt.week.used++; try { Storage.save(this.$store.game.state); } catch (e) {} },
          onResolve: (win, stats) => { if (win) this._resolveWin(stats || {}); },   // ghi thắng NGAY khi trận phân định
          onCancel: () => this._cancelBattle(),
          onEnd: (win, stats) => this._endBattle(win, stats || {}),
          onNext: (stats) => this._nextBattle(stats || {}),
        });
      });
    },
    // Thưởng Trận Hồn của 1 trận thắng — NGUỒN CHÂN LÝ (dùng chung: ghi state _applyWin + hiển thị màn kết).
    //   prevProg = prog Cung TRƯỚC khi thắng; completes = trận này chiếm trọn Cung (đủ 6). KHÔNG đổi số ở đây (cân bằng).
    _winRewardOf(c, prevProg) {
      const completes = (prevProg + 1) >= 6, tier = c.tier || 1;
      let hon = 14 + 4 * tier; if (completes) hon *= 3;
      let cungHon = 0; const unlocks = [];
      if (completes) {
        cungHon = (c.reward && c.reward.hon) || KT_CONST.CUNG_HON;
        if (c.reward && c.reward.tp && !this.kt.tp.includes(c.reward.tp)) { const t = KT_TAM_PHAP.find((x) => x.id === c.reward.tp); if (t) unlocks.push('Tâm Pháp · ' + t.name); }
        if (c.reward && c.reward.sk && !this.kt.sk.includes(c.reward.sk)) { const s = KT_SKILLS.find((x) => x.id === c.reward.sk); if (s) unlocks.push('Kỹ Năng · ' + s.name); }
      }
      return { completes, hon, cungHon, unlocks };
    },
    // xử thắng 1 trận (prog++, thưởng, lưu) — gọi 1 lần qua _resolveWin
    _applyWin(stats) {
      const c = KT_CUNG[this.selCung], k = this.kt;
      const prev = k.prog[c.id] || 0;
      const rew = this._winRewardOf(c, prev);
      k.tranHon += (stats.soul || 0) + rew.hon + rew.cungHon;   // soul (ô Bảo) + thưởng thắng + reward Cung
      k.prog[c.id] = prev + 1;
      k.wins = (k.wins || 0) + 1;
      const ckey = c.id + ':' + (rew.completes ? 'boss' : prev);   // Trảm Yêu Lục: đếm theo Ô trong Cung
      k.codex[ckey] = (k.codex[ckey] || 0) + 1;
      if (rew.completes) {                       // chiếm trọn Cung → mở khóa tâm pháp/kỹ năng
        if (c.reward && c.reward.tp && !k.tp.includes(c.reward.tp)) k.tp.push(c.reward.tp);
        if (c.reward && c.reward.sk && !k.sk.includes(c.reward.sk)) k.sk.push(c.reward.sk);
        if (c.id === 'maDe') k.maDeKills = (k.maDeKills || 0) + 1;
      }
      try { Storage.save(this.$store.game.state); } catch (e) {}
    },
    // ghi thắng NGAY khi trận phân định (idempotent) — bảo toàn thưởng dù rời view/refresh/đóng tab trước khi bấm nút
    _resolveWin(stats) {
      if (this._winApplied) return;
      this._winApplied = true;
      this._applyWin(stats || {});
    },
    _endBattle(win, stats) {   // "Xác Nhận" (hoặc thua/rút): về bản đồ (thắng đã ghi ở _resolveWin lúc phân định)
      if (this._battle) { try { this._battle.destroy(); } catch (e) {} this._battle = null; }
      this.inBattle = false;
    },
    _nextBattle(stats) {   // "Trận Kế": đánh liền trận sau (thắng đã ghi ở _resolveWin) — giữ loadout, bỏ Lập Trận
      if (this._battle) { try { this._battle.destroy(); } catch (e) {} this._battle = null; }
      if (this.cungDone(this.selCung) || this.weekLeft <= 0) {   // hết trận trong Cung / hết lượt → về bản đồ
        this.inBattle = false;
        try { this.$store.game.showToast(this.cungDone(this.selCung) ? 'Kỳ Trận · Đã chiếm trọn Cung!' : 'Kỳ Trận · Hết lượt tuần — chờ tuần mới.'); } catch (e) {}
        return;
      }
      this._mountBattle(true);   // đánh trận kế ngay (skipLoadout)
    },
    _cancelBattle() {   // Quay Lại từ màn Lập Trận: về bản đồ, KHÔNG tính lượt (chưa trừ), không xử thắng/thua
      if (this._battle) { try { this._battle.destroy(); } catch (e) {} this._battle = null; }
      this.inBattle = false;
    },

    // ---- Ngũ Hành Vòng Trận (La Bàn Bát Quái) ----
    hanhLv(k) { return this.kt.nguHanh[k] || 0; },
    upCost(k) { return KT_CONST.UP_BASE + this.hanhLv(k) * KT_CONST.UP_PER_LV; },
    canUp(k) { return this.hanhLv(k) < 10 && this.kt.tranHon >= this.upCost(k); },
    upHanh(k) {
      if (!this.canUp(k)) return;
      this.kt.tranHon -= this.upCost(k);
      this.kt.nguHanh[k] = this.hanhLv(k) + 1;
      try { Storage.save(this.$store.game.state); } catch (e) {}
    },
    pickHanh(k) { this.selHanh = k; },
    get sH() { return KT_HANH[this.selHanh]; },
    relOf(k) { // quan hệ sinh/khắc của Hành k: [sinh →, khắc →, bị khắc ←]
      const i = KT_HANH_ORDER.indexOf(k);
      const sinh = KT_HANH_ORDER[(i + 1) % 5];
      let khac = '', by = '';
      KT_KHAC.forEach((p) => { if (p[0] === k) khac = p[1]; if (p[1] === k) by = p[0]; });
      return { sinh, khac, by };
    },
    hanhMile(k) { return (KT_HANH[k].m || []).map((mm) => ({ lv: mm[0], txt: mm[1], cap: !!mm[2], on: this.hanhLv(k) >= mm[0] })); },
    medPos(k) { // vị trí huy chương trên la bàn (đỉnh ngũ giác, bắt đầu -90°)
      const i = KT_HANH_ORDER.indexOf(k), a = (-90 + i * 72) * Math.PI / 180;
      return 'left:' + (50 + 37.5 * Math.cos(a)) + '%;top:' + (50 + 37.5 * Math.sin(a)) + '%';
    },
    hexA(h, a) { const n = parseInt(h.slice(1), 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; },
    medVars(k) {
      const c = KT_HANH[k].c;
      return '--ec:' + c + ';--ecT:' + this.hexA(c, .16) + ';--ecA2:' + this.hexA(c, .2) + ';--ecA3:' + this.hexA(c, .32) + ';--ecA5:' + this.hexA(c, .45) + ';' + this.medPos(k);
    },
    panelVars() {
      const c = this.sH.c;
      return '--ec:' + c + ';--ecT:' + this.hexA(c, .09) + ';--ecT2:' + this.hexA(c, .2) + ';--ecA2:' + this.hexA(c, .2) + ';--ecA3:' + this.hexA(c, .35) + ';';
    },
    relVars(k) { const c = KT_HANH[k].c; return '--rc:' + c + ';--rcA:' + this.hexA(c, .4) + ';--rcT:' + this.hexA(c, .08) + ';'; },
    hubVars() { const c = this.sH.c; return '--hc:' + c + ';--hA:' + this.hexA(c, .22) + ';--hA2:' + this.hexA(c, .5) + ';'; },

    _lbSvg: null,
    get lbSvg() { // đĩa la bàn SVG TĨNH (vòng khắc độ + đai bát quái + quầng màu + sao khắc + cung sinh)
      if (this._lbSvg) return this._lbSvg;
      const CX = 300, CY = 300, RV = 225;
      const A = {}; KT_HANH_ORDER.forEach((k, i) => { A[k] = -90 + i * 72; });
      const pt = (r, deg) => { const a = deg * Math.PI / 180; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; };
      let s = '<defs><radialGradient id="ktlb-bg" cx="50%" cy="46%" r="60%"><stop offset="0" stop-color="#17130e"/><stop offset="1" stop-color="#0b0a08"/></radialGradient>';
      s += '<filter id="ktlb-blur" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16"/></filter>';
      KT_HANH_ORDER.forEach((k, i) => {
        const b = KT_HANH_ORDER[(i + 1) % 5];
        const p1 = pt(283, A[k] + 17), p2 = pt(283, A[k] + 55);
        s += '<linearGradient id="ktlb-sg' + i + '" x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="' + KT_HANH[k].c + '"/><stop offset="1" stop-color="' + KT_HANH[b].c + '"/></linearGradient>';
      });
      s += '</defs>';
      s += '<circle cx="300" cy="300" r="299" fill="url(#ktlb-bg)"/><circle cx="300" cy="300" r="298" fill="none" stroke="rgba(201,162,75,.16)" stroke-width="1"/>';
      for (let d = 0; d < 360; d += 6) {
        const major = d % 30 === 0, q1 = pt(major ? 288 : 293, d), q2 = pt(297, d);
        s += '<line x1="' + q1[0] + '" y1="' + q1[1] + '" x2="' + q2[0] + '" y2="' + q2[1] + '" stroke="' + (major ? 'rgba(201,162,75,.30)' : 'rgba(155,144,121,.15)') + '" stroke-width="' + (major ? 1.4 : 1) + '"/>';
      }
      s += '<circle cx="300" cy="300" r="225" fill="none" stroke="rgba(155,144,121,.13)" stroke-width="1" stroke-dasharray="1 6"/>';
      s += '<circle cx="300" cy="300" r="162" fill="none" stroke="rgba(201,162,75,.11)" stroke-width="1"/><circle cx="300" cy="300" r="138" fill="none" stroke="rgba(201,162,75,.11)" stroke-width="1"/>';
      const TRI = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];
      TRI.forEach((t, i) => {
        const ang = -90 + i * 45, p = pt(150, ang);
        s += '<text transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + (ang + 90) + ')" text-anchor="middle" dominant-baseline="middle" font-size="15" fill="rgba(201,162,75,.22)">' + t + '</text>';
      });
      KT_HANH_ORDER.forEach((k) => { const p = pt(RV, A[k]); s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="52" fill="' + KT_HANH[k].c + '" opacity=".16" filter="url(#ktlb-blur)"/>'; });
      KT_KHAC.forEach((pr) => {
        const pa = pt(RV, A[pr[0]]), pb = pt(RV, A[pr[1]]);
        s += '<line x1="' + pa[0] + '" y1="' + pa[1] + '" x2="' + pb[0] + '" y2="' + pb[1] + '" stroke="' + KT_HANH[pr[0]].c + '" stroke-opacity=".28" stroke-width="1.3" stroke-dasharray="3 6"/>';
        const dx = pb[0] - pa[0], dy = pb[1] - pa[1], L = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / L, uy = dy / L, nx = -uy, ny = ux, mx = pa[0] + dx * 0.62, my = pa[1] + dy * 0.62;
        s += '<polygon points="' + (mx + ux * 8) + ',' + (my + uy * 8) + ' ' + (mx - ux * 3 + nx * 4.5) + ',' + (my - uy * 3 + ny * 4.5) + ' ' + (mx - ux * 3 - nx * 4.5) + ',' + (my - uy * 3 - ny * 4.5) + '" fill="' + KT_HANH[pr[0]].c + '" opacity=".5"/>';
      });
      KT_HANH_ORDER.forEach((k, i) => {
        const b = KT_HANH_ORDER[(i + 1) % 5];
        const d2 = A[k] + 55, p1 = pt(283, A[k] + 17), p2 = pt(283, d2);
        const dp = 'M ' + p1[0] + ' ' + p1[1] + ' A 283 283 0 0 1 ' + p2[0] + ' ' + p2[1];
        s += '<path d="' + dp + '" fill="none" stroke="url(#ktlb-sg' + i + ')" stroke-width="7" stroke-opacity=".13" stroke-linecap="round"/>';
        s += '<path d="' + dp + '" fill="none" stroke="url(#ktlb-sg' + i + ')" stroke-width="2.6" stroke-opacity=".9" stroke-linecap="round"/>';
        const dm = A[k] + 40, pm = pt(283, dm), rad = dm * Math.PI / 180, tx = -Math.sin(rad), ty = Math.cos(rad), nx = Math.cos(rad), ny = Math.sin(rad);
        s += '<polygon points="' + (pm[0] + tx * 11) + ',' + (pm[1] + ty * 11) + ' ' + (pm[0] - tx * 3 + nx * 5.5) + ',' + (pm[1] - ty * 3 + ny * 5.5) + ' ' + (pm[0] - tx * 3 - nx * 5.5) + ',' + (pm[1] - ty * 3 - ny * 5.5) + '" fill="' + KT_HANH[b].c + '" opacity=".95"/>';
      });
      this._lbSvg = s;
      return s;
    },

    // ---- Trảm Yêu Lục ----
    get codexRows() {
      return KT_CUNG.map((c) => {
        const list = c.mobs.map((m, idx) => ({ key: c.id + ':' + idx, art: m.art, nm: m.nm, boss: false, kills: this.kt.codex[c.id + ':' + idx] || 0 }));
        list.push({ key: c.id + ':boss', art: c.boss.art, nm: c.boss.nm, boss: true, kills: this.kt.codex[c.id + ':boss'] || 0 });
        return { cung: c, list, seen: list.filter((e) => e.kills > 0).length };
      });
    },

    // ---- bộ chỉnh combat từ Ngũ Hành (đưa vào trận match-3) ----
    ktMods() {
      const n = this.kt.nguHanh;
      return {
        dmg: 1 + 0.06 * (n.kim || 0),      // Kim: sát thương ô Kiếm
        heal: 1 + 0.06 * (n.moc || 0),     // Mộc: hồi máu ô Tâm
        block: 1 + 0.06 * (n.tho || 0),    // Thổ: phòng ngự ô Thuẫn
        khi: 1 + 0.05 * (n.thuy || 0),     // Thủy: tụ Khí
        crit: 0.02 * (n.hoa || 0),         // Hỏa: tỉ lệ bạo kích (×1.6)
        critMul: 1.6,
        lv: { ...n },                       // mốc Cấp 4/7/10 đọc trực tiếp
      };
    },

    // ===== BẢNG DEV/TEST (ẩn — gate ?dev=1 hoặc Ctrl+Shift+D trong view Kỳ Trận; CHỈ đụng state.kyTran + this.*) =====
    devEnabled: false, devPanel: false, _devOpenAll: false, devConfirmReset: false, devLog: '',
    devCungSel: 'thienCuong', devHon: '', devHanh: '',
    devInit() {
      try { const m = /[?&]dev=([01])/.exec(location.search); if (m) { if (m[1] === '1') localStorage.setItem('kt_dev', '1'); else localStorage.removeItem('kt_dev'); } this.devEnabled = localStorage.getItem('kt_dev') === '1'; } catch (e) {}
    },
    ktDevKey(e) { if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd' || e.keyCode === 68)) { e.preventDefault(); this.devToggle(); } },
    devToggle() { if (!this.devEnabled) { this.devEnabled = true; try { localStorage.setItem('kt_dev', '1'); } catch (e) {} } this.devPanel = !this.devPanel; },
    devOff() { this.devEnabled = false; this.devPanel = false; this._devOpenAll = false; try { localStorage.removeItem('kt_dev'); } catch (e) {} },
    _dlog(m) { this.devLog = m; },
    _dsave() { try { Storage.save(this.$store.game.state); } catch (e) {} },
    // Kinh tế
    devAddHon(n) { this.kt.tranHon = Math.max(0, (this.kt.tranHon || 0) + n); this._dsave(); this._dlog('Trận Hồn = ' + this.kt.tranHon); },
    devSetHon() { const v = parseInt(this.devHon, 10); if (isNaN(v)) return; this.kt.tranHon = Math.max(0, v); this.devHon = ''; this._dsave(); this._dlog('Trận Hồn = ' + this.kt.tranHon); },
    devFillWeek() { this.weekCheck(); this.kt.week.used = 0; this._dsave(); this._dlog('Đầy lượt tuần (' + this.weekCap + ')'); },
    // Ngũ Hành
    devSetHanhAll(n) { const vv = Math.max(0, Math.min(10, n)); KT_HANH_ORDER.forEach((k) => { this.kt.nguHanh[k] = vv; }); this._dsave(); this._dlog('Mọi Ngũ Hành = Cấp ' + vv); },
    devSetHanhInput() { const v = parseInt(this.devHanh, 10); if (isNaN(v)) return; this.devHanh = ''; this.devSetHanhAll(v); },
    // Mở khóa
    devUnlockTp() { this.kt.tp = KT_TAM_PHAP.map((t) => t.id); this._dsave(); this._dlog('Mở hết ' + this.kt.tp.length + ' Tâm Pháp'); },
    devUnlockSk() { this.kt.sk = KT_SKILLS.map((s) => s.id); this._dsave(); this._dlog('Mở hết ' + this.kt.sk.length + ' Kỹ Năng'); },
    // Cung / tiến độ
    devSetProg(n) { this.kt.prog[this.devCungSel] = n; this._dsave(); const c = KT_CUNG.find((x) => x.id === this.devCungSel); this._dlog((c ? c.nm : this.devCungSel) + ' → ' + n + '/6 trận'); },
    devConquerOuter() { KT_CUNG.forEach((c) => { if (c.id !== 'maDe') this.kt.prog[c.id] = 6; }); this._dsave(); this._dlog('Chiếm 8 Cung ngoài (mở Ma Đế)'); },
    devConquerAll() { KT_CUNG.forEach((c) => { this.kt.prog[c.id] = 6; }); this._dsave(); this._dlog('Chiếm trọn 9 Cung (mở Nhập Trùng)'); },
    devResetProg() { this.kt.prog = {}; this.selCung = 0; this._dsave(); this._dlog('Đã xoá tiến độ Cung'); },
    devOpenAll() { this._devOpenAll = !this._devOpenAll; this._dlog('Mở khóa mọi Cung: ' + (this._devOpenAll ? 'BẬT' : 'tắt')); },
    // Trùng / codex
    devSetTrung(n) { this.kt.trung = n; this.confirmTrung = false; this._dsave(); this._dlog('Trùng = ' + this.trungRoman(n)); },
    devFillCodex() { KT_CUNG.forEach((c) => { c.mobs.forEach((m, i) => { this.kt.codex[c.id + ':' + i] = Math.max(1, this.kt.codex[c.id + ':' + i] || 0); }); this.kt.codex[c.id + ':boss'] = Math.max(1, this.kt.codex[c.id + ':boss'] || 0); }); this._dsave(); this._dlog('Mở hết Trảm Yêu Lục'); },
    // Combo nhanh + reset
    devLoadFull() {
      this.kt.tranHon = (this.kt.tranHon || 0) + 50000;
      KT_HANH_ORDER.forEach((k) => { this.kt.nguHanh[k] = 10; });
      this.kt.tp = KT_TAM_PHAP.map((t) => t.id);
      this.kt.sk = KT_SKILLS.map((s) => s.id);
      this.weekCheck(); this.kt.week.used = 0;
      this._devOpenAll = true;
      this._dsave();
      this._dlog('Nạp full: +50k Trận Hồn · Ngũ Hành Cấp 10 · mở hết TP+KN · đầy lượt · mở khóa mọi Cung');
    },
    devResetAll() {
      if (!this.devConfirmReset) { this.devConfirmReset = true; this._dlog('Bấm lần nữa để XÓA TOÀN BỘ Kỳ Trận'); return; }
      this.devConfirmReset = false; this._devOpenAll = false;
      this.$store.game.state.kyTran = {};
      ensureKyTran(this.$store.game.state);
      this.selCung = 0; this.selHanh = 'moc';
      this._dsave();
      this._dlog('Đã reset toàn bộ Kỳ Trận');
    },
  };
}
