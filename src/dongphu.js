// ============================================================
// ĐỘNG PHỦ (洞府) — component view (Alpine x-data). CÁCH LY 0-POWER.
//   Chỉ đọc-ghi state.dongPhu qua engine thuần (engine/dongphu.js) + tiêu Bạc/liệu 1 chiều VÀO.
//   KHÔNG đụng deriveCombat / gearBag / Tứ Trụ. Đọc state.currencies/inventory CHỈ để hiển thị + trừ khi xây.
//   Glue tới game store qua this.$store.game (showToast / navTo / fmt / ico / Storage).
// ============================================================
import { Storage } from './engine/save.js';
import { ITEMS } from './data/items.js';
import { levelFromXp } from './engine/leveling.js';
import {
  HOUSE_TIERS, BUILDINGS, BUILDING_KEYS, DONGPHU_MAX_HOUSE,
  planBuild, startBuild, cancelBuild, resolveDongPhu,
  houseCapH, buildingsUnlocked, unlocksAtHouse,
} from './engine/dongphu.js';

export function dongPhu() {
  return {
    dpTab: 'nhaChinh',        // 'nhaChinh' | 'congTrinh' | 'so'
    selTier: 0,               // bậc nhà đang xem ở timeline
    selBuild: 'mongDai',      // công trình phụ đang chọn
    HOUSE_TIERS, BUILDINGS, BUILDING_KEYS, MAX_HOUSE: DONGPHU_MAX_HOUSE,

    dpInit() {
      try { this.selTier = (this.dp && this.dp.house) || 0; } catch (e) { this.selTier = 0; }
    },

    // ----- truy cập -----
    get g() { return this.$store.game; },
    get st() { return this.$store.game.state; },
    get dp() { return this.$store.game.state.dongPhu; },
    fmt(n) { return this.g.fmt(n); },
    ico(id, emoji) { return this.g.ico(id, emoji || (ITEMS[id] && ITEMS[id].icon) || '📦'); },
    itemName(id) { return (ITEMS[id] && ITEMS[id].name) || id; },
    _save() { try { Storage.save(this.st); } catch (e) {} },

    // ----- Nhà Chính -----
    get curHouse() { return (this.dp && this.dp.house) || 0; },
    get curHouseName() { return HOUSE_TIERS[this.curHouse].name; },
    // 7 bậc + trạng thái để render timeline
    get tiers() {
      const cur = this.curHouse, sel = this.selTier;
      return HOUSE_TIERS.map((t) => ({
        lv: t.lv, name: t.name, img: t.img,
        state: t.lv === sel ? 'selected' : (t.lv <= cur ? 'owned' : 'locked'),
      }));
    },
    // thông tin bậc đang xem (panel info)
    get tierInfo() {
      const t = HOUSE_TIERS[this.selTier] || HOUSE_TIERS[0];
      return {
        lv: t.lv, name: t.name, img: t.img, lore: t.lore,
        title: 'Cấp ' + t.lv + ': ' + t.name,
        capH: houseCapH(t.lv),
        open: unlocksAtHouse(t.lv),
        slots: buildingsUnlocked(t.lv),
      };
    },
    // helper hiển thị theo bậc nhà bất kỳ
    capAt(lv) { return houseCapH(lv); },
    slotsAt(lv) { return buildingsUnlocked(lv); },
    opensAt(lv) { return unlocksAtHouse(lv); },
    // kế hoạch nâng nhà (bậc kế) — dùng cho khối chi phí + CTA
    get housePlan() { try { return planBuild(this.st, 'house'); } catch (e) { return null; } },
    get doanhTaoLv() { try { return levelFromXp((this.st.skills && this.st.skills.doanhTao && this.st.skills.doanhTao.xp) || 0); } catch (e) { return 0; } },
    get nextHouseTier() { const p = this.housePlan; return p ? HOUSE_TIERS[p.toLevel] : null; },
    // bảng nguyên liệu cho 1 kế hoạch (house/building)
    matRows(plan) {
      if (!plan || !plan.mats) return [];
      const inv = this.st.inventory || {};
      return Object.keys(plan.mats).map((id) => {
        const need = plan.mats[id], have = inv[id] || 0;
        return { id, name: this.itemName(id), need, have, ok: have >= need };
      });
    },
    get houseMatRows() { return this.matRows(this.housePlan); },
    // lý do KHÔNG xây được nhà (chuỗi rỗng = xây được)
    houseBlockReason() {
      const p = this.housePlan;
      if (!p) return 'Đã đạt bậc tối đa';
      if (this.dp && this.dp.build) return 'Đang có công trình thi công';
      if (this.doanhTaoLv < p.reqLevel) return 'Cần Doanh Tạo cấp ' + p.reqLevel;
      if ((this.st.currencies.bac || 0) < p.bac) return 'Thiếu Bạc';
      if (!this.matRows(p).every((r) => r.ok)) return 'Thiếu nguyên liệu';
      return '';
    },
    get canBuildHouse() { return this.houseBlockReason() === ''; },

    // ----- Công trình phụ -----
    // thông tin công trình đang chọn (enrich cho panel)
    binfo(key) {
      const B = BUILDINGS[key]; if (!B) return null;
      const lvl = (this.dp && this.dp.buildings && this.dp.buildings[key]) || 0;
      const plan = B.buildable ? planBuild(this.st, key) : null;
      return {
        key, name: B.name, img: B.img, type: B.type, func: B.func, lore: B.lore,
        tags: B.tags || [], badge: B.badge || '', note: B.note || '', grey: !!B.grey,
        tease: B.tease || '', buildable: !!B.buildable, reqHouse: B.reqHouse, maxLv: B.maxLv || 0,
        nav: B.nav || '', lvl, atMax: B.maxLv ? lvl >= B.maxLv : true,
        prog: B.maxLv ? lvl / B.maxLv : 0,
        eff: (B.eff || []).map((txt, i) => ({ txt, dim: i >= lvl })),
        plan,
      };
    },
    get selBinfo() { return this.binfo(this.selBuild); },
    get selBuildMatRows() { const b = this.selBinfo; return b && b.plan ? this.matRows(b.plan) : []; },
    // lý do KHÔNG xây được công trình đang chọn
    buildBlockReason(key) {
      const B = BUILDINGS[key]; if (!B) return 'Không có';
      if (!B.buildable) return B.badge || 'Chưa khai mở';
      const plan = planBuild(this.st, key);
      if (!plan) return 'Đã đạt cấp tối đa';
      if (this.dp && this.dp.build) return 'Đang có công trình thi công';
      if ((this.dp.house || 0) < plan.reqHouse) return 'Cần Nhà Chính bậc ' + plan.reqHouse;
      if ((this.st.currencies.bac || 0) < plan.bac) return 'Thiếu Bạc';
      if (!this.matRows(plan).every((r) => r.ok)) return 'Thiếu nguyên liệu';
      return '';
    },
    canBuildSel() { return this.buildBlockReason(this.selBuild) === ''; },

    // ----- Job thi công (đồng hồ đếm ngược qua _tick) -----
    get hasJob() { return !!(this.dp && this.dp.build); },
    get job() { return (this.dp && this.dp.build) || null; },
    get jobName() {
      const b = this.job; if (!b) return '';
      if (b.target === 'house') return (HOUSE_TIERS[b.toLevel] || {}).name + ' (Cấp ' + b.toLevel + ')';
      return (BUILDINGS[b.target] || {}).name + ' · Cấp ' + b.toLevel;
    },
    get jobRemainMs() { void this.g._tick; const b = this.job; if (!b) return 0; return Math.max(0, b.endsAt - (Date.now())); },
    get jobPct() { const b = this.job; if (!b) return 0; const tot = Math.max(1, b.endsAt - b.startedAt); return Math.min(100, Math.max(0, ((Date.now() - b.startedAt) / tot) * 100)); },
    get jobRemainText() {
      const ms = this.jobRemainMs; if (ms <= 0) return 'Sắp xong…';
      const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
      if (h > 0) return h + 'g ' + m + 'p';
      if (m > 0) return m + 'p ' + ss + 's';
      return ss + 's';
    },
    fmtDur(ms) {
      const s = Math.round((ms || 0) / 1000), h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
      if (h > 0) return h + ' giờ' + (m > 0 ? (' ' + m + ' phút') : '');
      return (Math.round((ms || 0) / 60000)) + ' phút';
    },

    // ----- Sổ Công Trình (bản log đơn giản) -----
    get logRows() {
      const rows = [];
      const cur = this.curHouse;
      rows.push({ icon: '🏠', title: 'Nhà Chính · ' + HOUSE_TIERS[cur].name + ' (Cấp ' + cur + ')',
        sub: 'Giới hạn treo máy ' + houseCapH(cur) + ' giờ · ' + buildingsUnlocked(cur) + ' công trình đã mở',
        stat: 'Đã xây', cls: 'done' });
      // công trình phụ
      for (const k of BUILDING_KEYS) {
        const B = BUILDINGS[k], lvl = (this.dp.buildings && this.dp.buildings[k]) || 0;
        if (k === 'dienVoTruong') { rows.push({ icon: '⚔️', title: B.name, sub: 'Đất trống ngàn thước · chưa khai phá', stat: 'Chưa mở', cls: 'lock' }); continue; }
        if (!B.buildable) { rows.push({ icon: '🀄', title: B.name + ' · Cấp ' + lvl, sub: B.type + ' · chờ tích hợp', stat: 'Sắp khai mở', cls: 'wip' }); continue; }
        rows.push({ icon: '🌙', title: B.name + ' · Cấp ' + lvl, sub: B.type + (lvl > 0 ? (' · ' + (B.eff[Math.min(lvl, B.eff.length) - 1] || '')) : ' · chưa dựng'),
          stat: lvl > 0 ? 'Hoạt động' : 'Chưa dựng', cls: lvl > 0 ? 'done' : 'lock' });
      }
      // job đang chạy
      if (this.hasJob) rows.push({ icon: '🔨', title: this.jobName, sub: 'Đang thi công · còn ' + this.jobRemainText, stat: 'Thi công', cls: 'wip' });
      return rows;
    },

    // ----- Hành động -----
    selectTier(n) { this.selTier = n; },
    selectBuild(k) { this.selBuild = k; },
    doBuildHouse() {
      const r = startBuild(this.st, 'house', Date.now());
      if (r.ok) { this._save(); this.g.showToast('Động Phủ · Khởi công ' + this.jobName + '.'); }
      else this.g.showToast(r.msg || 'Không thể khởi công.');
    },
    doBuildSel() {
      const key = this.selBuild;
      const r = startBuild(this.st, key, Date.now());
      if (r.ok) { this._save(); this.g.showToast('Động Phủ · Khởi công ' + this.jobName + '.'); }
      else this.g.showToast(r.msg || 'Không thể khởi công.');
    },
    doCancel() {
      const r = cancelBuild(this.st);
      if (r.ok) { this._save(); this.g.showToast('Đã hủy xây · hoàn nguyên liệu, mất ' + this.fmt(r.lostBac) + ' Bạc.'); }
      else this.g.showToast(r.msg || 'Không có công trình.');
    },
    // nút "vào" mini-game của công trình (nav)
    gotoBuilding(key) { const B = BUILDINGS[key]; if (B && B.nav) this.g.navTo(B.nav); },
  };
}
