// ============================================================
// TÌM KIẾM CHUNG — thành phần Alpine cho ô tìm.
// Luật tìm nằm ở engine/timkiem.js; lớp này chỉ lo gõ / chọn / mở.
// Mở kết quả thì gọi `$store.game.diToiKetQua(m)` — nó tự đưa tới trang có sẵn.
// ============================================================
import { timKiem, GOI_Y, MOI_NHOM } from './engine/timkiem.js';
import { ITEMS } from './data/items.js';
import { QUALITY } from './data/items.js';

export function timKiemUI() {
  return {
    q: '',
    cho: 0,          // vị trí đang trỏ trong danh sách phẳng
    _kq: null,
    _lan: '',

    get g() { return this.$store.game; },
    get goiY() { return GOI_Y; },

    tkInit() {
      this.q = ''; this.cho = 0;
      this.$nextTick(() => { const o = this.$refs.o; if (o) o.focus(); });
    },

    /** Kết quả — tính lại khi chữ đổi, nhớ lại lần trước để gõ nhanh không giật. */
    get kq() {
      const k = this.q.trim();
      if (this._lan !== k) {
        this._lan = k;
        this._kq = timKiem(k, {
          world: this.g.state.world,
          now: Date.now(),
          tranNhom: MOI_NHOM,
        });
        this.cho = 0;
      }
      return this._kq || { rong: true, nhom: [], tong: 0 };
    },

    /** Danh sách phẳng theo đúng thứ tự bày ra — để phím lên/xuống chạy đúng. */
    get phang() { return this.kq.nhom.flatMap((g) => g.ds); },
    thu(m) { return this.phang.findIndex((x) => x.id === m.id && x.nhom === m.nhom); },

    di(b) {
      const n = this.phang.length; if (!n) return;
      this.cho = (this.cho + b + n) % n;
    },
    mo() {
      const m = this.phang[this.cho];
      if (m) this.g.diToiKetQua(m);
    },

    /** Biểu tượng: món nào có art thật thì lấy art, không thì để chữ Hán của nhóm. */
    bieu(m) {
      if (m.di.loai === 'tra') {
        const it = ITEMS[m.id];
        if (it) return this.g.ico(m.id, it.icon || '📦');
        return this.g.ico(m.id, '📘');
      }
      const dau = { danhsi: '士', bot: '人', bang: '盟' }[m.di.loai] || '?';
      return '<span class="fserif text-jade/70" style="font-size:15px">' + dau + '</span>';
    },

    /** Tên món tô theo phẩm chất, giống mọi chỗ khác trong game. */
    mauCua(m) {
      const it = ITEMS[m.id];
      if (it && QUALITY[it.quality]) return 'color:' + QUALITY[it.quality].hex;
      return '';
    },

    /** Nhãn cho biết bấm vào sẽ đi đâu — đừng để người chơi bấm mù. */
    dich(m) {
      return {
        tra: 'Cẩm Nang', danhsi: 'Hồ Sơ', bot: 'Phong Vân Bảng', bang: 'Chinh Phạt',
      }[m.di.loai] || '';
    },
  };
}
