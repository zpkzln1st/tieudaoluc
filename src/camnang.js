// ============================================================
// CẨM NANG — thành phần Alpine cho modal wiki trong game.
// Chỉ ĐỌC dữ liệu tĩnh ở data/camnang.js, không đụng state, không lưu gì.
// Cờ mở nằm ở store (`camNangOpen`) để vuốt-back tự đóng như mọi modal khác.
// ============================================================
import { CN_NHOM, CN_MUC, CN_MUC_BY_ID, cnText } from './data/camnang.js';

// Bỏ dấu để gõ "ngu hanh" vẫn ra "ngũ hành".
const DAU = new RegExp('[̀-ͯ]', 'g');
const boDau = (s) => s.normalize('NFD').replace(DAU, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');

// Dựng sẵn một lần: mỗi mục kèm chuỗi tìm kiếm đã bỏ dấu.
const TRA = CN_MUC.map((m) => ({ id: m.id, chu: boDau(cnText(m)) }));
const TRA_BY_ID = Object.fromEntries(TRA.map((t) => [t.id, t.chu]));

export function camNang() {
  return {
    q: '',
    mucId: CN_MUC[0].id,
    /** Mobile: đang xem mục lục hay đang đọc. Desktop bày cả hai nên cờ này vô hại. */
    dangDoc: false,

    get g() { return this.$store.game; },
    get nhom() { return CN_NHOM; },
    get muc() { return CN_MUC_BY_ID[this.mucId] || CN_MUC[0]; },
    get tuKhoa() { return boDau(this.q.trim().toLowerCase()); },

    /** Mục lục sau khi lọc, gom theo nhóm. Nhóm không còn mục nào thì bỏ hẳn. */
    get mucLuc() {
      const k = this.tuKhoa;
      const hop = (m) => !k || (TRA_BY_ID[m.id] || '').includes(k);
      return CN_NHOM
        .map((g) => ({ ...g, muc: CN_MUC.filter((m) => m.nhom === g.id && hop(m)) }))
        .filter((g) => g.muc.length);
    },
    get soHop() { return this.mucLuc.reduce((s, g) => s + g.muc.length, 0); },
    get tongMuc() { return CN_MUC.length; },

    chon(id) {
      this.mucId = id;
      this.dangDoc = true;
      this.$nextTick(() => { const el = this.$refs.than; if (el) el.scrollTop = 0; });
    },
    xoaTim() { this.q = ''; this.$nextTick(() => { const el = this.$refs.oTim; if (el) el.focus(); }); },
    dong() { this.g.closeCamNang(); },

    /** Nhãn nhóm của mục đang đọc — hiện trên đầu khung nội dung. */
    get tenNhom() {
      const g = CN_NHOM.find((x) => x.id === this.muc.nhom);
      return g ? g.ten : '';
    },
    get hanNhom() {
      const g = CN_NHOM.find((x) => x.id === this.muc.nhom);
      return g ? g.han : '';
    },

    /** Mục kế tiếp / trước đó theo đúng thứ tự mục lục đầy đủ (không theo bộ lọc). */
    nhay(buoc) {
      const i = CN_MUC.findIndex((m) => m.id === this.mucId);
      const j = Math.min(CN_MUC.length - 1, Math.max(0, i + buoc));
      if (j !== i) this.chon(CN_MUC[j].id);
    },
    get coTruoc() { return CN_MUC.findIndex((m) => m.id === this.mucId) > 0; },
    get coSau() { return CN_MUC.findIndex((m) => m.id === this.mucId) < CN_MUC.length - 1; },
  };
}
