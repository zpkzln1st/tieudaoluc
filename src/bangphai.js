// ============================================================
// BANG PHÁI — view (side-content, 0-POWER).
// Cách ly: CHỈ đọc/ghi state.bangPhai (+ trừ Bạc khi cống hiến).
// Luật nằm ở engine THUẦN src/engine/bangphai.js (không DOM, kiểm bằng node).
//
// ⚠ Khác Tông Môn: ở đây ngươi là NGƯỜI GIA NHẬP, không phải chưởng môn.
// ============================================================
import { Storage } from './engine/save.js';
import {
  ensureBangPhai, toanCanh, bangTheoId, diaBan, soDiaBan,
  duSucVao, bacCua, congHien, vaoBang, roiBang, nhiemKyConLai, CAP_THANH_VIEN,
  danhSachTanTu, loiTenBang, lapBang, giaiTan, chieuMo, duoiNguoi, gopQuy,
  danhSachVu, nhanThuongVu, ensureVu, ID_TU_LAP, LV_LAP_BANG, PHI_LAP_BANG, NOI_MO,
} from './engine/bangphai.js';

export { ensureBangPhai };

const MUC_GOP = [1000, 10000, 100000];
const TON_CHI_SAN = [
  'Lấy nghĩa làm đầu, lấy đao làm lý.',
  'Vào bang là huynh đệ, ra bang là người dưng.',
  'Của cải chia đều, họa phúc chia đôi.',
  'Ai động tới người của ta, ta động tới cả nhà nó.',
];

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
    get tenTa() { return (this.g.state.player || {}).name || 'Ngươi'; },
    get dsBang() { void this._t; try { return toanCanh(this.g.state, this.world, Date.now(), this.tenTa); } catch (e) { return []; } },
    get bangCuaTa() { void this._t; try { return bangTheoId(this.world, Date.now(), this.bp && this.bp.bangId, this.g.state, this.tenTa); } catch (e) { return null; } },
    get vung() { void this._t; try { return diaBan(this.world, Date.now(), this.g.state, this.tenTa); } catch (e) { return []; } },

    // --- bang tự lập ---
    get laBangChu() { return !!(this.bp && this.bp.bangId === ID_TU_LAP && this.bp.tuLap); },
    get lvCanLap() { return LV_LAP_BANG; },
    get phiLap() { return PHI_LAP_BANG; },
    get bienMo() { return NOI_MO; },
    get lapDuoc() { return this.tongLv >= LV_LAP_BANG && this.bac >= PHI_LAP_BANG && !this.bp.bangId; },
    get tanTu() { void this._t; try { return danhSachTanTu(this.world, Date.now(), this.tongLv); } catch (e) { return []; } },
    get daMo() { return (this.bp && this.bp.tuLap) ? (this.bp.tuLap.thanhVien || []) : []; },
    daCoNguoi(id) { return this.daMo.indexOf(id) >= 0; },
    get nhatKy() { return (this.bp && this.bp.nhatKy) || []; },
    get tonChiSan() { return TON_CHI_SAN; },
    get vu() { void this._t; try { return danhSachVu(this.g.state, Date.now()); } catch (e) { return []; } },

    get bac2() { return bacCua(this.bp ? this.bp.congTich : 0); },
    get soVung() { try { return soDiaBan(this.world, Date.now(), this.bp && this.bp.bangId, this.g.state, this.tenTa); } catch (e) { return 0; } },
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

    // --- form lập bang ---
    moForm: false,
    tenMoi: '',
    tonChiMoi: TON_CHI_SAN[0],
    get loiTen() { return this.tenMoi.trim() ? loiTenBang(this.tenMoi, this.world, Date.now()) : ''; },

    lap() {
      const g = this.g;
      if (this.bp.bangId) { g.showToast('Phải rời bang hiện tại trước đã.'); return; }
      if (this.tongLv < LV_LAP_BANG) { g.showToast('Cần Tổng Lv ' + LV_LAP_BANG + ' mới đủ danh vọng lập bang.'); return; }
      if (this.bac < PHI_LAP_BANG) { g.showToast('Cần ' + g.fmt(PHI_LAP_BANG) + ' Bạc để dựng cờ.'); return; }
      const loi = loiTenBang(this.tenMoi, this.world, Date.now());
      if (loi) { g.showToast(loi); return; }
      g.state.currencies.bac -= PHI_LAP_BANG;
      lapBang(g.state, { ten: this.tenMoi.trim(), tonChi: this.tonChiMoi }, Date.now());
      this.moForm = false; this.tenMoi = '';
      try { Storage.save(g.state); } catch (e) {}
      g.showToast('Đã dựng cờ — bang của ngươi đã có tên trên giang hồ.');
    },
    xinGiaiTan() {
      const g = this.g, b = this.bp.tuLap; if (!b) return;
      if (!confirm('Giải tán ' + b.ten + '?\n\nToàn bộ người trong bang tan hết, Công Tích về 0, quỹ bang mất trắng. Không hoàn Bạc.')) return;
      giaiTan(g.state, Date.now());
      try { Storage.save(g.state); } catch (e) {}
      g.showToast('Bang đã giải tán.');
    },
    mo(tt) {
      const g = this.g;
      if (!this.laBangChu) return;
      if (this.daMo.length >= CAP_THANH_VIEN) { g.showToast('Bang đã đủ ' + CAP_THANH_VIEN + ' người.'); return; }
      if (!tt.theoDuoc) { g.showToast(tt.ten + ' mạnh hơn ngươi quá xa, không chịu theo.'); return; }
      if (this.bac < tt.gia) { g.showToast('Cần ' + g.fmt(tt.gia) + ' Bạc để mời ' + tt.ten + '.'); return; }
      if (!chieuMo(g.state, tt, Date.now(), this.tongLv)) { g.showToast('Không mời được người này.'); return; }
      g.state.currencies.bac -= tt.gia;
      try { Storage.save(g.state); } catch (e) {}
      g.showToast(tt.ten + ' đã nhập bang.');
    },
    duoi(m) {
      const g = this.g;
      if (!this.laBangChu) return;
      duoiNguoi(g.state, m, Date.now());
      try { Storage.save(g.state); } catch (e) {}
    },
    nhanVu(v) {
      const g = this.g;
      const them = nhanThuongVu(g.state, v.id, Date.now());
      if (!them) { g.showToast('Việc này chưa xong.'); return; }
      try { Storage.save(g.state); } catch (e) {}
      g.showToast('Hoàn thành bang vụ — được ' + them + ' Công Tích.');
    },

    bpInit() {
      ensureBangPhai(this.g.state);
      ensureVu(this.g.state, Date.now());
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
      // Bang mình lập: tiền vào QUỸ, quỹ tính vào uy -> có tác dụng thật lên tranh địa bàn.
      const them = this.laBangChu ? gopQuy(g.state, so, Date.now()) : congHien(g.state, so);
      try { Storage.save(g.state); } catch (e) {}
      g.showToast('Cống hiến ' + g.fmt(them) + ' — Công Tích ' + g.fmt(this.bp.congTich) + '.');
    },
  };
}
