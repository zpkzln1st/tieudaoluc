// ============================================================
// BANG PHÁI — view (side-content, 0-POWER).
// Cách ly: CHỈ đọc/ghi state.bangPhai (+ trừ Bạc khi cống hiến).
// Luật nằm ở engine THUẦN src/engine/bangphai.js (không DOM, kiểm bằng node).
//
// ⚠ Khác Tông Môn: ở đây ngươi là NGƯỜI GIA NHẬP, không phải chưởng môn.
// ============================================================
import { Storage } from './engine/save.js';
import {
  ensureBangPhai, danhSachBang, bangTheoId, diaBan, soDiaBan,
  duSucVao, bacCua, congHien, vaoBang, roiBang, nhiemKyConLai, CAP_THANH_VIEN,
} from './engine/bangphai.js';

export { ensureBangPhai };

const MUC_GOP = [1000, 10000, 100000];

export function bangPhai() {
  return {
    _t: 0,
    _iv: 0,
    xemBang: null,     // id bang đang mở bảng chi tiết (lúc duyệt)

    get g() { return this.$store.game; },
    get bp() { return this.g.state.bangPhai; },
    get bac() { return (this.g.state.currencies || {}).bac || 0; },
    get tongLv() { return this.g.totalLevel || 0; },

    get world() { return this.g.state.world; },
    get dsBang() { void this._t; try { return danhSachBang(this.world, Date.now()); } catch (e) { return []; } },
    get bangCuaTa() { void this._t; try { return bangTheoId(this.world, Date.now(), this.bp && this.bp.bangId); } catch (e) { return null; } },
    get vung() { void this._t; try { return diaBan(this.world, Date.now()); } catch (e) { return []; } },

    get bac2() { return bacCua(this.bp ? this.bp.congTich : 0); },
    get soVung() { try { return soDiaBan(this.world, Date.now(), this.bp && this.bp.bangId); } catch (e) { return 0; } },
    get conLai() {
      void this._t;
      const ms = nhiemKyConLai(Date.now()), ng = Math.floor(ms / 86400000);
      if (ng >= 1) return ng + ' ngày';
      const gi = Math.floor(ms / 3600000);
      return gi >= 1 ? gi + ' giờ' : Math.max(1, Math.round(ms / 60000)) + ' phút';
    },
    get mucGop() { return MUC_GOP; },
    get tranTv() { return CAP_THANH_VIEN; },

    duSuc(b) { return duSucVao(b, this.tongLv); },
    chiTiet(b) { this.xemBang = (this.xemBang === b.id) ? null : b.id; },
    giuVung(bangId) { return this.vung.filter((v) => v.chuBangId === bangId); },

    bpInit() {
      ensureBangPhai(this.g.state);
      this._t = Date.now();
      this._iv = setInterval(() => { this._t = Date.now(); }, 60000);
      this.$watch('$store.game.view', (v) => { if (v !== 'guild' && this._iv) { clearInterval(this._iv); this._iv = 0; } });
    },

    xinVao(b) {
      const g = this.g;
      if (this.bp.bangId) { g.showToast('Đang ở ' + (this.bangCuaTa ? this.bangCuaTa.ten : 'một bang') + ' — phải rời trước đã.'); return; }
      if (!this.duSuc(b)) { g.showToast(b.ten + ' chỉ nhận người Tổng Lv ' + b.canTong + ' trở lên.'); return; }
      vaoBang(g.state, b.id, Date.now());
      this.xemBang = null;
      try { Storage.save(g.state); } catch (e) {}
      g.showToast('Đã gia nhập ' + b.ten + '.');
    },

    // Rời bang MẤT SẠCH Công Tích -> phải hỏi lại, đừng để bấm nhầm mất công tích cày lâu.
    xinRoi() {
      const g = this.g, b = this.bangCuaTa;
      if (!b) return;
      if (!confirm('Rời ' + b.ten + '?\n\nCông Tích ' + g.fmt(this.bp.congTich) + ' sẽ MẤT SẠCH và không lấy lại được.')) return;
      roiBang(g.state);
      try { Storage.save(g.state); } catch (e) {}
      g.showToast('Đã rời bang. Công Tích về 0.');
    },

    gop(n) {
      const g = this.g, so = Math.floor(n || 0);
      if (!this.bp.bangId) { g.showToast('Chưa gia nhập bang nào.'); return; }
      if (this.bac < so) { g.showToast('Không đủ Bạc — cần ' + g.fmt(so) + '.'); return; }
      g.state.currencies.bac -= so;
      const them = congHien(g.state, so);
      try { Storage.save(g.state); } catch (e) {}
      g.showToast('Cống hiến ' + g.fmt(them) + ' — Công Tích ' + g.fmt(this.bp.congTich) + '.');
    },
  };
}
