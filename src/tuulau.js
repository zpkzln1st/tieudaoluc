// ============================================================
// TỬU LÂU — view (side-content, 0-POWER).
// Cách ly tuyệt đối: CHỈ đọc/ghi state.tuuLau (+ trừ Bạc khi mời rượu).
// Luật/lời thoại nằm ở engine THUẦN src/engine/tuulau.js (không DOM, kiểm bằng node).
//
// Khách trong quán KHÔNG lưu vào save — suy từ (seed thế giới + mốc 30 phút),
// nên F5 vẫn ra đúng người đó, và mọi máy cùng seed thấy cùng một quán.
// ============================================================
import { Storage } from './engine/save.js';
import {
  ensureTuuLau, khachTrongQuan, loiMoiRuou, loiHoiChuyen, tinDon,
  hoiDuoc, themDong, phienConLai, KHACH_N,
} from './engine/tuulau.js';

export { ensureTuuLau };

// Lời người chơi góp chuyện — chọn sẵn cho đỡ phải gõ.
const LOI_SAN = [
  'Chủ quán, cho thêm một vò!',
  'Chuyện đó ta cũng nghe rồi, mà nghe khác cơ.',
  'Ai biết đường lên Lăng Tiêu Phong không?',
  'Ngồi đây lâu chưa, huynh đài?',
  'Giang hồ dạo này có gì đáng nói không?',
  'Ta mới xuống núi, mong chư vị chỉ giáo.',
  'Nghe nói gần đây có yêu thú quấy phá?',
  'Rượu này ngon, nhưng chuyện các vị còn ngon hơn.',
  'Ai đó vừa nhắc tên ta phải không?',
  'Thiên hạ rộng thế, biết đi đâu bây giờ.',
];

export function tuuLau() {
  return {
    loi: '',
    _t: 0,
    _iv: 0,
    chips: [],        // ⚠ chọn MỘT LẦN ở tlInit. Để dạng getter thì Alpine render lại là xáo chip liên tục.

    get g() { return this.$store.game; },
    get tl() { return this.g.state.tuuLau; },
    get bac() { return (this.g.state.currencies || {}).bac || 0; },

    // Khách: tính lại mỗi khi _t đổi (đồng hồ 20s) -> tự sang lượt khách mới khi hết phiên.
    get khach() {
      void this._t;
      try { return khachTrongQuan(this.g.state.world, Date.now()); } catch (e) { return []; }
    },
    get conLai() {
      void this._t;
      const ms = phienConLai(Date.now()), p = Math.floor(ms / 60000);
      return p >= 1 ? p + ' phút' : Math.max(1, Math.round(ms / 1000)) + ' giây';
    },
    get banTin() { return (this.tl && this.tl.banTin) || []; },
    get soGhe() { return KHACH_N; },

    hoiDuocKhach(k) { try { return hoiDuoc(this.g.state, k.id, Date.now()); } catch (e) { return false; } },
    duTien(k) { return this.bac >= k.gia; },

    // Câu GẦN NHẤT của chính khách này trên bảng — truyền xuống engine để nó bốc câu khác,
    // không thì bấm liên tục ra y một câu (đúng chỗ bản đầu bị chê sơ sài).
    cauCuoi(k) {
      const ds = this.banTin || [];
      for (let i = 0; i < ds.length; i++) if (ds[i].who === k.ten) return ds[i].txt;
      return '';
    },

    tlInit() {
      ensureTuuLau(this.g.state);
      this.doiChip();
      this._t = Date.now();
      this._iv = setInterval(() => { this._t = Date.now(); }, 20000);
      this.$watch('$store.game.view', (v) => { if (v !== 'tavern' && this._iv) { clearInterval(this._iv); this._iv = 0; } });
    },

    // ---- mời rượu: TỐN BẠC, đổi lấy lời thoại + có thể ra tin đồn. KHÔNG cho chỉ số/vật phẩm. ----
    moiRuou(k) {
      const g = this.g, now = Date.now();
      if (this.bac < k.gia) { g.showToast('Không đủ Bạc — chén này cần ' + g.fmt(k.gia) + '.'); return; }
      g.state.currencies.bac -= k.gia;
      const t = ensureTuuLau(g.state); t.chen++;
      themDong(g.state, 'dap', k.ten, k.mau, loiMoiRuou(k, now, this.cauCuoi(k)), now);
      const tin = tinDon(k, now);
      if (tin) { t.nghe++; themDong(g.state, 'tin', k.ten, k.mau, tin, now + 1); }
      else themDong(g.state, 'dap', k.ten, k.mau, 'Chuyện thì có, nhưng chưa tới lúc nói.', now + 1);
      try { Storage.save(g.state); } catch (e) {}
      g.showToast(tin ? k.ten + ' kể cho ngươi một chuyện.' : k.ten + ' nhận chén rượu.');
    },

    // ---- hỏi chuyện: miễn phí, mỗi khách 1 lần / 6 giờ ----
    hoiChuyen(k) {
      const g = this.g, now = Date.now();
      if (!hoiDuoc(g.state, k.id, now)) { g.showToast(k.ten + ' vừa kể xong, để lát nữa hẵng hỏi.'); return; }
      const t = ensureTuuLau(g.state);
      t.hoiLan[k.id] = now;
      themDong(g.state, 'dap', k.ten, k.mau, loiHoiChuyen(k, now, this.cauCuoi(k)), now);
      try { Storage.save(g.state); } catch (e) {}
    },

    // ---- người chơi góp chuyện ----
    gopChuyen(txt) {
      const g = this.g, s = String(txt == null ? this.loi : txt).trim();
      if (!s) return;
      const now = Date.now(), ten = (g.state.player || {}).name || 'Ngươi';
      themDong(g.state, 'loi', ten, '#f3d9a8', s, now);
      this.loi = '';
      this.doiChip();
      // một khách bất kỳ đáp lại
      const ds = this.khach;
      if (ds.length) {
        const k = ds[(Math.random() * ds.length) | 0];
        setTimeout(() => {
          try { themDong(g.state, 'dap', k.ten, k.mau, loiHoiChuyen(k, Date.now(), this.cauCuoi(k)), Date.now()); Storage.save(g.state); } catch (e) {}
        }, 700);
      }
      try { Storage.save(g.state); } catch (e) {}
    },

    doiChip() {
      const p = LOI_SAN.slice(), out = [];
      for (let i = 0; i < 4 && p.length; i++) out.push(p.splice((Math.random() * p.length) | 0, 1)[0]);
      this.chips = out;
    },
  };
}
