// ============================================================
// SÀN GIAO DỊCH — thành phần Alpine. Lớp này CHỈ nối engine với màn hình:
// mọi luật giá / thuế / van cân bằng nằm trong engine/san.js.
//
// Phân vai rõ: engine tính tiền và ghi sổ, còn cộng Bạc / trừ túi đồ thì làm ở
// đây (engine thuần, không được đụng inventory).
// ============================================================
import { ITEMS } from './data/items.js';
import { addItem, removeItem, countItem } from './engine/inventory.js';
import { Storage } from './engine/save.js';
import {
  ensureSan, nhipSan, phienCua, phienConLai, PHIEN_MS,
  raoCuaBot, muaCuaBot, fairValue, giaThiTruong, giaMuaHien, giaBanHien,
  tienPhaiTra, tienVeTui, banChoSan, muaTuSan, dangLenh, huyLenh,
  nganSachConLai, duongGia, heSoCoGian, THUE_BAN, NHOM_SAN, LENH_TA_TRAN,
} from './engine/san.js';

export { ensureSan };

const tenItem = (id) => (ITEMS[id] || {}).name || id;

export function san() {
  return {
    tab: 'rao',          // 'rao' = Rao Bán · 'mua' = Thu Mua · 'ta' = Lệnh Của Ta · 'so' = Sổ Giao Dịch
    nhom: 'all',
    tim: '',
    _t: 0,               // nhịp để getter tính lại theo thời gian

    chon: null,          // món đang mở khung giao dịch
    slMua: 1,
    slBan: 1,

    get g() { return this.$store.game; },
    get s() { return ensureSan(this.g.state); },
    get seed() { return ((this.g.state.world && this.g.state.world.seed) || 1) >>> 0; },
    now() { return Date.now(); },
    get phien() { void this._t; return phienCua(this.now()); },

    sanInit() {
      ensureSan(this.g.state);
      nhipSan(this.g.state, this.now());
      // nhịp 10 giây: đủ để đồng hồ phiên chạy, không đủ để tốn máy
      this._iv = setInterval(() => { this._t++; nhipSan(this.g.state, this.now()); }, 10000);
    },
    sanHuy() { if (this._iv) clearInterval(this._iv); },

    // ---------- đồng hồ phiên ----------
    get conLaiTxt() {
      void this._t;
      const ms = phienConLai(this.now());
      const ph = Math.floor(ms / 60000), gy = Math.floor((ms % 60000) / 1000);
      return ph + ' phút ' + String(gy).padStart(2, '0') + ' giây';
    },
    get nganSach() { void this._t; return nganSachConLai(this.g.state, this.now()); },
    get nganSachPct() { void this._t; return Math.round(this.nganSach / 240000 * 100); },

    // ---------- lọc ----------
    get nhomList() { return NHOM_SAN; },
    hopNhom(itemId) {
      const n = NHOM_SAN.find((x) => x.id === this.nhom);
      if (!n || !n.types) return true;
      return n.types.includes((ITEMS[itemId] || {}).type);
    },
    hopTim(itemId) {
      const k = this.tim.trim().toLowerCase();
      return !k || tenItem(itemId).toLowerCase().includes(k);
    },

    // ---------- sổ lệnh của bot ----------
    get raoList() {
      void this._t;
      return raoCuaBot(this.seed, this.phien)
        .filter((l) => this.hopNhom(l.itemId) && this.hopTim(l.itemId))
        .map((l) => ({ ...l, ten: tenItem(l.itemId), it: ITEMS[l.itemId] || {} }));
    },
    get muaList() {
      void this._t;
      return muaCuaBot(this.g.state, this.seed, this.phien)
        .filter((l) => this.hopNhom(l.itemId) && this.hopTim(l.itemId))
        .map((l) => ({ ...l, ten: tenItem(l.itemId), it: ITEMS[l.itemId] || {}, co: countItem(this.g.state, l.itemId) }));
    },
    get lenhTa() {
      void this._t;
      return this.s.lenh.map((l) => ({ ...l, ten: tenItem(l.itemId), it: ITEMS[l.itemId] || {} }));
    },
    get soList() {
      void this._t;
      return this.s.nhatKy.map((m) => ({ ...m, ten: tenItem(m.itemId) }));
    },
    get tranLenh() { return LENH_TA_TRAN; },

    // ---------- khung giao dịch một món ----------
    moMon(itemId) {
      this.chon = itemId;
      this.slMua = 1;
      this.slBan = Math.min(10, countItem(this.g.state, itemId)) || 1;
    },
    dongMon() { this.chon = null; },
    get monIt() { return this.chon ? (ITEMS[this.chon] || {}) : null; },
    get coTrongTui() { return this.chon ? countItem(this.g.state, this.chon) : 0; },
    get donMua() { void this._t; return this.chon ? giaMuaHien(this.seed, this.chon, this.phien) : 0; },
    get donBan() { void this._t; return this.chon ? giaBanHien(this.g.state, this.seed, this.chon, this.phien) : 0; },
    get traTong() { void this._t; return this.chon ? tienPhaiTra(this.seed, this.chon, this.phien, this.slMua) : 0; },
    get veTui() {
      void this._t;
      return this.chon ? tienVeTui(this.g.state, this.seed, this.chon, this.phien, this.slBan) : { tho: 0, thue: 0, thuc: 0 };
    },
    get giaGoc() { return this.chon ? fairValue(this.chon) : 0; },
    /** Giá đang trên hay dưới mức tham chiếu — để người chơi biết lúc nào đáng mua. */
    get lechGia() {
      void this._t;
      if (!this.chon) return 0;
      const g = giaThiTruong(this.seed, this.chon, this.phien), f = fairValue(this.chon);
      return f ? Math.round((g / f - 1) * 100) : 0;
    },
    get coGian() { return this.chon ? Math.round(heSoCoGian(this.g.state, this.chon) * 100) : 100; },
    get duong() { void this._t; return this.chon ? duongGia(this.seed, this.chon, this.now(), 12) : []; },
    /** Đường giá vẽ bằng polyline — chuẩn hoá về khung 100×28. */
    get duongD() {
      const d = this.duong;
      if (d.length < 2) return '';
      const lo = Math.min(...d), hi = Math.max(...d), bien = (hi - lo) || 1;
      return d.map((v, i) => (i / (d.length - 1) * 100).toFixed(1) + ',' + (26 - (v - lo) / bien * 24).toFixed(1)).join(' ');
    },

    // ---------- hành động ----------
    mua() {
      const id = this.chon; if (!id) return;
      const n = Math.max(1, this.slMua | 0);
      const tra = tienPhaiTra(this.seed, id, this.phien, n);
      if ((this.g.state.currencies.bac || 0) < tra) { this.g.showToast('Không đủ Bạc.'); return; }
      const r = muaTuSan(this.g.state, this.seed, this.now(), id, n);
      if (!r.ok) { this.g.showToast(r.loi); return; }
      this.g.state.currencies.bac -= r.tra;
      addItem(this.g.state, id, n);
      Storage.save(this.g.state);
      this.g._tick++;
      this.g.showToast('Mua ' + n + ' 〈' + tenItem(id) + '〉 — trả ' + this.g.fmt(r.tra) + ' Bạc.');
    },

    ban() {
      const id = this.chon; if (!id) return;
      const co = countItem(this.g.state, id);
      const n = Math.min(Math.max(1, this.slBan | 0), co);
      if (n <= 0) { this.g.showToast('Trong hành lý không có món này.'); return; }
      const r = banChoSan(this.g.state, this.seed, this.now(), id, n);
      if (!r.ok) { this.g.showToast(r.loi); return; }
      removeItem(this.g.state, id, n);
      this.g.state.currencies.bac = (this.g.state.currencies.bac || 0) + r.thuc;
      Storage.save(this.g.state);
      this.g._tick++;
      this.slBan = Math.min(this.slBan, countItem(this.g.state, id)) || 1;
      this.g.showToast('Bán ' + n + ' 〈' + tenItem(id) + '〉 — về túi ' + this.g.fmt(r.thuc)
        + ' Bạc (thuế ' + this.g.fmt(r.thue) + ').');
    },

    /** Bán thẳng vào một lệnh thu mua của bot. */
    banVaoLenh(l) {
      const co = countItem(this.g.state, l.itemId);
      const n = Math.min(l.sl, co);
      if (n <= 0) { this.g.showToast('Trong hành lý không có 〈' + l.ten + '〉.'); return; }
      const r = banChoSan(this.g.state, this.seed, this.now(), l.itemId, n);
      if (!r.ok) { this.g.showToast(r.loi); return; }
      removeItem(this.g.state, l.itemId, n);
      this.g.state.currencies.bac = (this.g.state.currencies.bac || 0) + r.thuc;
      Storage.save(this.g.state);
      this.g._tick++;
      this.g.showToast('Bán ' + n + ' 〈' + l.ten + '〉 — về túi ' + this.g.fmt(r.thuc) + ' Bạc.');
    },

    /** Mua trọn một lệnh rao của bot. */
    muaTronLenh(l) {
      if ((this.g.state.currencies.bac || 0) < l.tong) { this.g.showToast('Không đủ Bạc.'); return; }
      const r = muaTuSan(this.g.state, this.seed, this.now(), l.itemId, l.sl);
      if (!r.ok) { this.g.showToast(r.loi); return; }
      this.g.state.currencies.bac -= r.tra;
      addItem(this.g.state, l.itemId, l.sl);
      Storage.save(this.g.state);
      this.g._tick++;
      this.g.showToast('Mua trọn ' + l.sl + ' 〈' + l.ten + '〉 — trả ' + this.g.fmt(r.tra) + ' Bạc.');
    },

    // ---------- lệnh của người chơi ----------
    lenhKieu: 'rao',
    lenhSl: 10,
    lenhGia: 0,
    dangLenhTa() {
      const id = this.chon; if (!id) return;
      const g = Math.max(1, this.lenhGia | 0), n = Math.max(1, this.lenhSl | 0);
      if (this.lenhKieu === 'rao' && countItem(this.g.state, id) < n) {
        this.g.showToast('Trong hành lý không đủ ' + n + ' món.'); return;
      }
      const r = dangLenh(this.g.state, this.now(), this.lenhKieu, id, n, g);
      if (!r.ok) { this.g.showToast(r.loi); return; }
      // Rao bán thì giữ hàng lại luôn, khỏi bán trùng chỗ khác.
      if (this.lenhKieu === 'rao') removeItem(this.g.state, id, n);
      Storage.save(this.g.state);
      this.g._tick++;
      this.g.showToast('Đã treo lệnh ' + (this.lenhKieu === 'rao' ? 'rao bán' : 'thu mua') + '.');
    },
    huy(l) {
      const r = huyLenh(this.g.state, l.id);
      if (!r.ok) { this.g.showToast(r.loi); return; }
      if (r.lenh.kieu === 'rao') addItem(this.g.state, r.lenh.itemId, r.lenh.sl);   // trả hàng về túi
      Storage.save(this.g.state);
      this.g._tick++;
      this.g.showToast('Đã hạ lệnh, hàng về hành lý.');
    },

    // ---------- định dạng ----------
    fmt(x) { return this.g.fmt(x); },
    gioTxt(ms) {
      const h = Math.floor(ms / 3600000);
      if (h >= 1) return h + ' giờ trước';
      const p = Math.floor(ms / 60000);
      return p >= 1 ? p + ' phút trước' : 'vừa xong';
    },
    get thuePct() { return Math.round(THUE_BAN * 100); },
  };
}
