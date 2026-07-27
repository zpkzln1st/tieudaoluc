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
  choConLai, dangCho, CHO_VAO_LAI_MS,
  congThanh, xuatTran, chotCongThanh, ensureCongThanh, uyTamCua, uyTamConMs, CT_UY_TAM_PCT, uyTamThuong,
} from './engine/bangphai.js';
import { dameMotTran } from './engine/worldboss.js';   // mượn bộ mô phỏng trận, KHÔNG đụng state.boss

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
    get lapDuoc() { return this.tongLv >= LV_LAP_BANG && this.bac >= PHI_LAP_BANG && !this.bp.bangId && !this.dangCho; },
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

    // --- cửa đóng 24 giờ sau khi rời/giải tán bang ---
    get choMs() { void this._t; try { return choConLai(this.g.state, Date.now()); } catch (e) { return 0; } },
    get dangCho() { return this.choMs > 0; },
    get choConTxt() { return this.choTxt(this.choMs); },
    /** ms -> "X giờ Y phút" (dưới 1 phút thì làm tròn lên 1 phút, đừng để hiện 0). */
    choTxt(ms) {
      const p = Math.ceil(Math.max(0, ms) / 60000), gi = Math.floor(p / 60), ph = p % 60;
      if (gi >= 1) return gi + ' giờ' + (ph ? ' ' + ph + ' phút' : '');
      return Math.max(1, ph) + ' phút';
    },

    duSuc(b) { return duSucVao(b, this.tongLv); },
    chiTiet(b) { this.xemBang = (this.xemBang === b.id) ? null : b.id; },
    giuVung(bangId) { return this.vung.filter((v) => v.chuBangId === bangId); },

    // ---------- CÔNG THÀNH ----------
    get combatLv() { return this.g.combatLevel || 1; },
    get ct() {
      void this._t;
      try { return congThanh(this.g.state, this.bangCuaTa, this.world, Date.now(), this.combatLv); } catch (e) { return null; }
    },
    get uyTam() { void this._t; try { return uyTamCua(this.g.state, Date.now()); } catch (e) { return 0; } },
    get uyTamCon() { void this._t; try { return this.choTxt(uyTamConMs(this.g.state, Date.now())); } catch (e) { return ''; } },
    /** Hạ được thành thì bang sẽ thêm bao nhiêu uy tạm — cho người chơi biết trước công sức đổi lấy gì. */
    get uyTamSe() {
      const b = this.bangCuaTa; if (!b) return 0;
      return uyTamThuong((b.uy || 0) - this.uyTam);
    },
    get uyTamPct() { return Math.round(CT_UY_TAM_PCT * 100); },
    /** Công lao của một bang chúng trong trận này (để ghép vào bảng Bang Chúng). */
    congCua(id) { const c = this.ct; if (!c) return 0; const x = c.cong.find((y) => y.id === id); return x ? x.dame : 0; },

    /** Chốt thưởng nếu thành đã vỡ — gọi lúc mở view + mỗi nhịp, vì bang chúng bào cả lúc offline. */
    _soatCT() {
      const g = this.g;
      if (!this.bp || !this.bp.bangId) return;
      try {
        ensureCongThanh(g.state, this.world, Date.now(), this.combatLv);
        const w = chotCongThanh(g.state, this.bangCuaTa, this.world, Date.now(), this.combatLv);
        if (w) {
          try { Storage.save(g.state); } catch (e) {}
          g.showToast('Hạ ' + w.boss + ' — bang được ' + g.fmt(w.thuong) + ' Công Tích, uy tạm +' + w.uyTam + '.');
        }
      } catch (e) {}
    },

    xuat() {
      const g = this.g;
      // Chốt lại chu kỳ TRƯỚC: nếu vừa lật chu kỳ đúng lúc bấm thì mục tiêu đã khác,
      // xuatTran sẽ trả 0 mà toast vẫn báo thành công — đánh vào khoảng không.
      try { ensureCongThanh(g.state, this.world, Date.now(), this.combatLv); } catch (e) {}
      this._t = Date.now();
      const c = this.ct;
      if (!c) return;
      if (c.daNhan) { g.showToast('Thành đã hạ rồi — chờ trận sau.'); return; }
      if (c.luot >= c.tranLuot) { g.showToast('Hết ' + c.tranLuot + ' lượt xuất trận của chu kỳ này.'); return; }
      if (c.cdConMs > 0) { g.showToast('Còn phải lấy sức ' + this.choTxt(c.cdConMs) + ' nữa.'); return; }
      const d = dameMotTran(g.state, c.boss.id, c.he);
      if (!d) { g.showToast('Chưa bày bài võ thì xuất trận sao được.'); return; }
      if (!xuatTran(g.state, d, Date.now())) { g.showToast('Chưa xuất trận được lúc này.'); return; }
      this._t = Date.now();                       // ép mọi getter tính lại ngay
      const w = chotCongThanh(g.state, this.bangCuaTa, this.world, Date.now(), this.combatLv);
      try { Storage.save(g.state); } catch (e) {}
      if (w) g.showToast('Hạ ' + w.boss + '! Được ' + g.fmt(w.thuong) + ' Công Tích, uy tạm +' + w.uyTam + ' trong 24 giờ.');
      else g.showToast('Xuất trận — bào ' + g.fmt(d) + ' sát thương của ' + c.boss.name + '.');
    },

    // ---------- THẾ LỰC ĐỒ ----------
    // Bản đồ dùng lại đúng nền images/ui/worldmap.webp + toạ độ mapX/mapY của LOCATIONS,
    // nên vị trí 10 vùng khớp y hệt bản đồ hành trình — nhìn là biết ngay đang nói tới đâu.
    vungChon: null,
    get vungXem() {
      const ds = this.vung;
      if (this.vungChon) { const v = ds.find((x) => x.id === this.vungChon); if (v) return v; }
      return ds.find((x) => x.chuBangId === (this.bp && this.bp.bangId)) || null;
    },
    chonVung(v) { this.vungChon = (this.vungChon === v.id) ? null : v.id; },
    laDatTa(v) { return !!(this.bp && this.bp.bangId) && v.chuBangId === this.bp.bangId; },
    /** Sít sao -> chữ: 0-4% giằng co, 5-14% hơn mong manh, 15%+ vững ghế. */
    theTran(v) {
      if (v.sit <= 4) return { txt: 'giằng co', mau: '#fb7185' };
      if (v.sit <= 14) return { txt: 'hơn mong manh', mau: '#fbbf24' };
      return { txt: 'vững ghế', mau: '#34d399' };
    },
    /** Các thế lực đang chia nhau giang hồ (xếp theo số vùng), cho dải chú giải dưới bản đồ. */
    get theLuc() {
      const m = {};
      for (const v of this.vung) {
        if (!v.chuBangId) continue;
        if (!m[v.chuBangId]) m[v.chuBangId] = { id: v.chuBangId, ten: v.chuBang, mau: v.chuMau, so: 0 };
        m[v.chuBangId].so++;
      }
      return Object.values(m).sort((a, b) => b.so - a.so);
    },

    // --- form lập bang ---
    moForm: false,
    tenMoi: '',
    tonChiMoi: TON_CHI_SAN[0],
    get loiTen() { return this.tenMoi.trim() ? loiTenBang(this.tenMoi, this.world, Date.now()) : ''; },

    lap() {
      const g = this.g;
      if (this.bp.bangId) { g.showToast('Phải rời bang hiện tại trước đã.'); return; }
      if (this.dangCho) { g.showToast('Vừa rời bang — còn ' + this.choConTxt + ' nữa mới dựng cờ được.'); return; }
      if (this.tongLv < LV_LAP_BANG) { g.showToast('Cần Tổng Lv ' + LV_LAP_BANG + ' mới đủ danh vọng lập bang.'); return; }
      if (this.bac < PHI_LAP_BANG) { g.showToast('Cần ' + g.fmt(PHI_LAP_BANG) + ' Bạc để dựng cờ.'); return; }
      const loi = loiTenBang(this.tenMoi, this.world, Date.now());
      if (loi) { g.showToast(loi); return; }
      // Trừ Bạc SAU khi engine gật đầu — engine cũng tự chặn (đang ở bang / cửa còn đóng),
      // đừng để mất 50.000 Bạc mà bang không dựng lên.
      if (!lapBang(g.state, { ten: this.tenMoi.trim(), tonChi: this.tonChiMoi }, Date.now())) { g.showToast('Chưa dựng cờ được lúc này.'); return; }
      g.state.currencies.bac -= PHI_LAP_BANG;
      this.moForm = false; this.tenMoi = '';
      try { Storage.save(g.state); } catch (e) {}
      g.showToast('Đã dựng cờ — bang của ngươi đã có tên trên giang hồ.');
    },
    xinGiaiTan() {
      const g = this.g, b = this.bp.tuLap; if (!b) return;
      g.hoiXacNhan({
        tieuDe: 'Hạ Cờ Giải Tán?',
        loi: 'Giải tán <b class="text-amber-200">' + b.ten + '</b> — cờ hạ, người tan, tên bang xoá khỏi giang hồ.',
        canhBao: 'Toàn bộ <b>' + b.thanhVien.length + ' người</b> trong bang tan hết · Công Tích <b>' + g.fmt(this.bp.congTich)
          + '</b> về 0 · quỹ bang <b>' + g.fmt(b.quy || 0) + ' Bạc</b> mất trắng, không hoàn.<br>Phải chờ <b>'
          + this.choTxt(CHO_VAO_LAI_MS) + '</b> mới được vào hoặc lập bang khác.',
        nut: 'Giải Tán', huy: 'Giữ Bang', nguy: true,
        xong: () => {
          giaiTan(g.state, Date.now());
          try { Storage.save(g.state); } catch (e) {}
          g.showToast('Bang đã giải tán.');
        },
      });
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
      this._soatCT();
      this._iv = setInterval(() => { this._t = Date.now(); this._soatCT(); }, 60000);
      this.$watch('$store.game.view', (v) => { if (v !== 'guild' && this._iv) { clearInterval(this._iv); this._iv = 0; } });
    },

    xinVao(b) {
      const g = this.g;
      if (this.bp.bangId) { g.showToast('Đang ở ' + (this.bangCuaTa ? this.bangCuaTa.ten : 'một bang') + ' — phải rời trước đã.'); return; }
      if (this.dangCho) { g.showToast('Vừa rời bang — còn ' + this.choConTxt + ' nữa mới xin vào được.'); return; }
      if (!this.duSuc(b)) { g.showToast(b.ten + ' chỉ nhận người Tổng Lv ' + b.canTong + ' trở lên.'); return; }
      if (!vaoBang(g.state, b.id, Date.now())) { g.showToast('Chưa vào bang được lúc này.'); return; }
      this.xemBang = null;
      try { Storage.save(g.state); } catch (e) {}
      g.showToast('Đã gia nhập ' + b.ten + '.');
    },

    // Rời bang MẤT SẠCH Công Tích -> phải hỏi lại, đừng để bấm nhầm mất công tích cày lâu.
    xinRoi() {
      const g = this.g, b = this.bangCuaTa;
      if (!b) return;
      g.hoiXacNhan({
        tieuDe: 'Rời Bang?',
        loi: 'Rời <b class="text-amber-200">' + b.ten + '</b> — từ nay là người dưng.',
        canhBao: 'Công Tích <b>' + g.fmt(this.bp.congTich) + '</b> MẤT SẠCH, không lấy lại được.<br>Giang hồ có quy củ: rời rồi phải chờ <b>'
          + this.choTxt(CHO_VAO_LAI_MS) + '</b> mới được vào hoặc lập bang khác.',
        nut: 'Rời Bang', huy: 'Ở Lại', nguy: true,
        xong: () => {
          roiBang(g.state, Date.now());
          try { Storage.save(g.state); } catch (e) {}
          g.showToast('Đã rời bang. Công Tích về 0.');
        },
      });
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
