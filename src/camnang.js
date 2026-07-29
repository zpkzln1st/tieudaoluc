// ============================================================
// CẨM NANG — thành phần Alpine cho wiki trong game.
// Hai chế độ:
//   · TRA CỨU — bảng cơ sở dữ liệu (data/camnang_db.js): lọc, sắp xếp, bấm ra chi tiết.
//   · CƠ CHẾ  — trang giải thích luật + công thức (data/camnang.js).
// Chỉ ĐỌC dữ liệu tĩnh, không đụng state, không lưu gì.
// ============================================================
import { CN_NHOM, CN_MUC, CN_MUC_BY_ID, cnText } from './data/camnang.js';
import { CN_DB, CN_DB_BY_ID, CN_DB_NHOM, MAU_PHAM, MAU_HE } from './data/camnang_db.js';

// Bỏ dấu để gõ "ngu hanh" vẫn ra "ngũ hành".
const DAU = new RegExp('[̀-ͯ]', 'g');
const boDau = (s) => String(s == null ? '' : s).normalize('NFD').replace(DAU, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

// Chuỗi tìm kiếm của các trang Cơ Chế — dựng sẵn một lần.
const TRA_MUC = Object.fromEntries(CN_MUC.map((m) => [m.id, boDau(cnText(m))]));

// Hàng của từng bảng tra cứu tính MỘT LẦN rồi giữ lại: 746 thực thể, dựng lại
// mỗi lần gõ phím thì lưới giật thấy rõ.
const CACHE = {};
const hangCua = (id) => {
  if (!CACHE[id]) {
    const b = CN_DB_BY_ID[id];
    const hs = b.hang();
    hs.forEach((h) => { h._tim = boDau(b.cot.map((c) => h[c.k]).join(' ')); });
    CACHE[id] = hs;
  }
  return CACHE[id];
};

const BUOC = 60;   // mỗi lần hiện thêm bấy nhiêu hàng

export function camNang() {
  return {
    che: 'db',              // 'db' = Tra Cứu · 'co' = Cơ Chế
    q: '',
    bangId: CN_DB[0].id,
    mucId: CN_MUC[0].id,
    chonId: null,           // hàng đang mở chi tiết
    sapCot: null,           // khoá cột đang sắp xếp
    sapNguoc: false,
    hien: BUOC,
    dangDoc: false,         // màn hẹp: đang xem danh sách hay đang đọc

    get g() { return this.$store.game; },
    get tuKhoa() { return boDau(this.q.trim()); },

    // ---------- chung ----------
    doiChe(c) {
      this.che = c; this.q = ''; this.chonId = null; this.hien = BUOC;
      this.dangDoc = false; this.sapCot = null;
    },
    dong() { this.g.closeCamNang(); },
    xoaTim() { this.q = ''; this.hien = BUOC; this.$nextTick(() => { const el = this.$refs.oTim; if (el) el.focus(); }); },
    get tongThucThe() { return CN_DB.reduce((s, b) => s + hangCua(b.id).length, 0); },

    // ---------- TRA CỨU ----------
    get dbNhom() { return CN_DB_NHOM; },
    get bang() { return CN_DB_BY_ID[this.bangId] || CN_DB[0]; },
    chonBang(id) {
      this.bangId = id; this.chonId = null; this.q = '';
      this.hien = BUOC; this.sapCot = null; this.dangDoc = false;
      this.$nextTick(() => { const el = this.$refs.luoi; if (el) el.scrollTop = 0; });
    },
    soHangCua(id) { return hangCua(id).length; },

    /** Hàng sau khi lọc + sắp xếp. */
    get hangLoc() {
      const k = this.tuKhoa;
      let ra = hangCua(this.bangId);
      if (k) ra = ra.filter((h) => h._tim.includes(k));
      if (this.sapCot) {
        const c = this.bang.cot.find((x) => x.k === this.sapCot) || {};
        const d = this.sapNguoc ? -1 : 1;
        ra = ra.slice().sort((a, b) => {
          const va = a[this.sapCot], vb = b[this.sapCot];
          if (c.so) return d * ((Number(va) || 0) - (Number(vb) || 0));
          return d * String(va).localeCompare(String(vb), 'vi');
        });
      }
      return ra;
    },
    get hangHien() { return this.hangLoc.slice(0, this.hien); },
    get conNua() { return Math.max(0, this.hangLoc.length - this.hien); },
    themHang() { this.hien += BUOC; },

    /** Ô hiển thị: cột số giữ giá trị THÔ để sắp xếp cho đúng, nên phải ngăn nhóm nghìn lúc vẽ. */
    oHien(h, c) {
      const v = h[c.k];
      if (c.so && typeof v === 'number') return v.toLocaleString('vi-VN');
      return v;
    },
    /**
     * Màu chữ của ô — CHỈ hai cột Phẩm Chất và Hệ, lấy đúng mã màu bảng số đang dùng
     * ở phần còn lại của trò chơi. Tô thêm cột nào nữa là bảng thành loang lổ, mất
     * tác dụng của chính hai cột này.
     */
    mauO(h, c) {
      if (c.mau === 'pham' && h._pham) return MAU_PHAM[h._pham] || '';
      if (c.mau === 'he') return MAU_HE[h._he || 'vohe'] || '';
      return '';
    },

    sapXep(k) {
      if (this.sapCot === k) this.sapNguoc = !this.sapNguoc;
      else { this.sapCot = k; this.sapNguoc = false; }
      this.hien = BUOC;
    },
    dauSap(k) { return this.sapCot !== k ? '' : (this.sapNguoc ? '▾' : '▴'); },

    moHang(h) {
      this.chonId = this.chonId === h.id ? null : h.id;
      this.dangDoc = true;
      this.$nextTick(() => { const el = this.$refs.than; if (el) el.scrollTop = 0; });
    },
    get hangChon() { return this.chonId ? hangCua(this.bangId).find((h) => h.id === this.chonId) : null; },
    get khoiChiTiet() {
      const h = this.hangChon;
      if (!h) return null;
      try { return this.bang.chiTiet(h); } catch (e) { return [['p', 'Không dựng được chi tiết cho mục này.']]; }
    },

    // ---------- CƠ CHẾ ----------
    get nhom() { return CN_NHOM; },
    get muc() { return CN_MUC_BY_ID[this.mucId] || CN_MUC[0]; },
    get mucLuc() {
      const k = this.tuKhoa;
      const hop = (m) => !k || (TRA_MUC[m.id] || '').includes(k);
      return CN_NHOM
        .map((g) => ({ ...g, muc: CN_MUC.filter((m) => m.nhom === g.id && hop(m)) }))
        .filter((g) => g.muc.length);
    },
    get soMucHop() { return this.mucLuc.reduce((s, g) => s + g.muc.length, 0); },
    get tongMuc() { return CN_MUC.length; },
    chonMuc(id) {
      this.mucId = id; this.dangDoc = true;
      this.$nextTick(() => { const el = this.$refs.than; if (el) el.scrollTop = 0; });
    },
    get tenNhom() { return (CN_NHOM.find((x) => x.id === this.muc.nhom) || {}).ten || ''; },
    get hanNhom() { return (CN_NHOM.find((x) => x.id === this.muc.nhom) || {}).han || ''; },
    nhay(buoc) {
      const i = CN_MUC.findIndex((m) => m.id === this.mucId);
      const j = Math.min(CN_MUC.length - 1, Math.max(0, i + buoc));
      if (j !== i) this.chonMuc(CN_MUC[j].id);
    },
    get coTruoc() { return CN_MUC.findIndex((m) => m.id === this.mucId) > 0; },
    get coSau() { return CN_MUC.findIndex((m) => m.id === this.mucId) < CN_MUC.length - 1; },
  };
}
