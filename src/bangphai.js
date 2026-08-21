// ============================================================
// BANG PHÁI — view (Alpine). Luật nằm ở engine THUẦN src/engine/bangphai.js.
// Ở đây chỉ: đọc getter, gọi engine, trừ/cộng tiền-vật phẩm của người chơi, báo toast.
//
// ⚠ Người chơi là BANG CHỦ bang mình lập. 12 bang AI là đối thủ trên bảng Chinh Phạt.
// ============================================================
import { Storage } from './engine/save.js';
import { addItem } from './engine/inventory.js';
import { ITEMS } from './data/items.js';
import { dameMotTranBoss } from './engine/worldboss.js';
import {
  ensureBangPhai, nhipBang,
  lapBang, giaiTan, loiTenBang, tranThanhVien,
  thanhVien, danhSachTanTu, chieuMo, kichNguoi, doiChuc, hoSoMinhChung,
  congHien,
  gopKho, rutKho, datQuyen, oKhoToiDa,
  capKyNang, tranKyNang, hocKyNang,
  danhSachHang, muaHang,
  capCongTrinh, xayCongTrinh,
  danhSachNv, nhanNv, nvKyConLai,
  danhSachTruyNa, nhanTruyNa, nopTruyNa,
  chinhPhat, bangXepHangMua, bangXepHangVung, nhanThuongMua, muaConLai, soMua,
  bossBang, xuatTranBoss, chotBossBang, moBossBang,
  bangChienTran, bangChienVuong, moBangChien, bcDoiCho, bcTuXep, khaiChien, bcKiVongThang,
  bangChieuHien, nguoiQuen, chieuHienConLai,
  CHUC, CHUC_BY_ID, LV_LAP_BANG, PHI_LAP_BANG, KY_NANG_BANG, giaKyNang,
  CONG_TRINH, CONG_TRINH_BY_ID, giaCongTrinh, gioCongTrinh, bangCongCanCho,
  QUYEN_MAC_DINH, BAC_MOI_MINH_CONG, MUA_MS,
} from './engine/bangphai.js';
import { QUYEN_LABEL, CUA_HANG_BANG, CH_NHOM_MAU, TILE_KHAC, ART_CT_KHUNG, KY_NANG_HAN, KN_TRAN_THEO_CT, BC_BUFF_GIU } from './data/bangphai.js';
import { NGU_HANH } from './data/votong.js';   // chip ngũ hành dùng chung với combat

export { ensureBangPhai };

// Ba mức nhanh — CỐ Ý là bội của BAC_MOI_MINH_CONG để bấm phát nào cũng ra số Minh Cống
// tròn trịa. Để mức 2.000 như trước thì bấm xong được 0 Minh Cống, nhìn như hỏng.
const MUC_GOP = [5000, 50000, 500000];
const TON_CHI_SAN = [
  'Lấy nghĩa làm đầu, lấy đao làm lý.',
  'Vào bang là huynh đệ, ra bang là người dưng.',
  'Không hỏi xuất thân, chỉ hỏi bản lĩnh.',
  'Bang quy ba điều, phạm một điều là ra khỏi cửa.',
];

export function bangPhai() {
  return {
    _t: 0, _iv: 0,
    tab: 'nha',             // nha · thanhVien · nhiemVu · cuaHang · kyNang · congTrinh · chinhPhat · boss · thietLap
    moForm: false, tenMoi: '', tonChiMoi: TON_CHI_SAN[0],
    loNguoi: null,          // id minh chúng đang mở bảng thao tác
    vungChon: null,
    bcKheChon: null,        // khe đang chọn ở Bày Trận (bấm khe thứ hai là đổi chỗ)
    bacGop: '',             // ô tự điền số Bạc cống hiến
    xemHetNhatKy: false,

    get g() { return this.$store.game; },
    get bp() { return this.g.state.bangPhai; },
    get bang() { return this.bp && this.bp.bang; },
    get world() { return this.g.state.world; },
    get bac() { return (this.g.state.currencies || {}).bac || 0; },
    get tongLv() { return this.g.totalLevel || 0; },
    get combatLv() { return this.g.combatLevel || 1; },
    get fmt() { return this.g.fmt; },
    /** Tên người chơi — Minh Chủ là CHÍNH NGƯƠI, hiện đúng tên chứ không phải chữ "ngươi". */
    get tenTa() { return (this.g.state.player || {}).name || 'Vô Danh'; },

    // ---------- điều kiện lập bang ----------
    get lvCanLap() { return LV_LAP_BANG; },
    get phiLap() { return PHI_LAP_BANG; },
    get lapDuoc() { return !this.bang && this.tongLv >= LV_LAP_BANG && this.bac >= PHI_LAP_BANG; },
    get tonChiSan() { return TON_CHI_SAN; },
    get loiTen() { return this.tenMoi.trim() ? loiTenBang(this.tenMoi) : ''; },

    // ---------- tổng quan ----------
    get congTich() { return this.bp ? this.bp.congTich : 0; },
    get capBang() { return this.bang ? this.bang.cap : 0; },
    get bangCongCan() { return this.bang ? bangCongCanCho(this.bang.cap) : 1; },
    get bangCongPct() { return this.bang ? Math.min(100, Math.round(this.bang.bangCong / Math.max(1, this.bangCongCan) * 100)) : 0; },
    get tranTv() { return this.bang ? tranThanhVien(this.bang) : 0; },
    get tv() { void this._t; try { return thanhVien(this.g.state, this.world, Date.now()); } catch (e) { return []; } },
    // Mốc để vẽ vạch đóng góp: người GÓP NHIỀU NHẤT trong minh, không phải một số cố định.
    // Minh mới lập ai cũng 0 thì vạch trống trơn — đúng, chưa ai góp gì thật.
    get gopBacMax() { return this.tv.reduce((s, m) => Math.max(s, m.gopBac || 0), 0); },
    /** Bề rộng vạch. Góp 0 thì để TRỐNG HẲN — kẻ ăn không phải nhìn ra ngay. */
    gopPct(v, max) { return (!v || !max) ? 0 : Math.max(3, Math.round((v / max) * 100)); },
    get donXin() {
      void this._t;
      if (!this.bang) return [];
      const ids = new Set(this.bang.donXin || []);
      try { return danhSachTanTu(this.g.state, this.world, Date.now()).filter((x) => ids.has(x.id)); } catch (e) { return []; }
    },
    // ---------- chiêu mộ: ba đường, không còn chợ 40 người ----------
    /** Bảng Chiêu Hiền — vài người bất kỳ, đổi theo giờ, giá đầy đủ. */
    get bangHien() {
      void this._t;
      if (!this.bang) return [];
      try { return bangChieuHien(this.g.state, this.world, Date.now()); } catch (e) { return []; }
    },
    /** Người quen ở Tửu Lâu — đủ bậc Giao Tình mới mời được, giá rẻ dần theo bậc. */
    get quen() {
      void this._t;
      if (!this.bang) return [];
      try { return nguoiQuen(this.g.state, this.world, Date.now()); } catch (e) { return []; }
    },
    get bangDoiSau() { void this._t; return this.gioTxt(chieuHienConLai(Date.now())); },
    get nhatKy() { return (this.bp && this.bp.nhatKy) || []; },
    get mucGop() { return MUC_GOP; },
    get bacMoiMinhCong() { return BAC_MOI_MINH_CONG; },
    /** Số Bạc trong ô tự điền, đã lọc rác. 0 nghĩa là chưa nhập gì dùng được. */
    get bacGopSo() { const n = Math.floor(Number(String(this.bacGop).replace(/[^0-9]/g, '')) || 0); return n > 0 ? n : 0; },
    get bacGopDuoc() { return this.bacGopSo > 0 && this.bacGopSo <= this.bac; },
    /** Góp chừng này thì được bao nhiêu Minh Cống — cho người chơi thấy trước, khỏi phải tự chia. */
    get bacGopRaMinhCong() { return Math.floor(this.bacGopSo / BAC_MOI_MINH_CONG); },
    /** Phần lẻ không đủ đổi Minh Cống (vẫn thành Công Tích 1:1 nên không mất gì). */
    get bacGopDu() { return this.bacGopSo % BAC_MOI_MINH_CONG; },
    /** Cắt phần lẻ, để lại đúng bội của tỉ giá. */
    lamTron() { const n = this.bacGopSo - this.bacGopDu; this.bacGop = n > 0 ? String(n) : ''; },
    /** Nhật ký hiện ra: mặc định 12 mục gần nhất, không dùng con lăn riêng. */
    get nhatKyHien() { return this.xemHetNhatKy ? this.nhatKy : this.nhatKy.slice(0, 12); },
    /** Hồ sơ đầy đủ của một minh chúng (mở bằng nút Xem Thông Tin). */
    /** Mở popup hồ sơ. Cờ nằm ở store nên bộ chặn _MODALS lo luôn việc vuốt-back. */
    xemHoSo(m) {
      try {
        const h = hoSoMinhChung(this.g.state, this.world, m.id, Date.now());
        if (!h) { this.g.showToast('Không tìm thấy người này.'); return; }
        this.g.bpHoSo = h;
      } catch (e) { this.g.showToast('Không mở được hồ sơ.'); }
    },
    /** Ngày vào minh -> chữ. */
    vaoLucTxt(ts) {
      if (!ts) return 'không rõ';
      const d = Math.floor((Date.now() - ts) / 86400000);
      if (d >= 1) return d + ' ngày trước';
      return this.gioTxt(Date.now() - ts) + ' trước';
    },
    get chucList() { return CHUC.filter((c) => c.id !== 'bangChu'); },

    // ---------- kho ----------
    khoLoc: 'all',      // chip lọc đang chọn ở Minh Khố
    gopLoc: 'all',      // chip lọc ở khối Góp Từ Hành Lý
    /** Gộp `type` của ITEMS thành mấy NHÓM đọc được — 12 loại nguyên bản thì thanh lọc dài hơn cả kho. */
    nhomCua(id) {
      const t = (ITEMS[id] || {}).type || 'khac';
      if (t === 'dan' || t === 'monan' || t === 'moi') return 'dung';
      if (t === 'khoang' || t === 'go' || t === 'ca' || t === 'thaoDuoc') return 'tho';
      if (t === 'dinh' || t === 'vatlieu') return 'che';
      return 'khac';
    },
    get nhomList() {
      return [
        { id: 'all',  ten: 'Tất Cả' },
        { id: 'tho',  ten: 'Nguyên Liệu Thô' },
        { id: 'che',  ten: 'Vật Liệu Chế Tác' },   // đổi cùng Hành Lý: "Liệu Đã Luyện" user đọc không hiểu
        { id: 'dung', ten: 'Đan Dược & Món Ăn' },
        { id: 'khac', ten: 'Khác' },
      ];
    },
    /** Một dòng vật phẩm trong kho/hành lý — gom sẵn mọi thứ tooltip cần, khỏi tra lại trong view. */
    _oVatPham(id, so) {
      const it = ITEMS[id] || {};
      const q = (this.g.QUALITY || {})[it.quality] || {};
      const ten = it.name || id;
      return {
        id, so, ten, icon: it.icon || '📦', nhom: this.nhomCua(id),
        mau: q.hex || '#cbd5e1',
        pham: q.name || '', desc: it.desc || '',
      };
    },

    // ---------- tooltip Minh Khố ----------
    // ⚠ KHÔNG dùng thuộc tính `title` gốc: nó ra hộp xám của hệ điều hành, chậm, không màu,
    // lạc hẳn khỏi cả game. Game đã có khuôn tooltip riêng (.gtip cho trang bị) — dựng theo đó.
    // Phải là FIXED chứ không absolute: ô nằm trong khối `overflow-y-auto`, tooltip absolute
    // sẽ bị khối đó cắt cụt.
    khoTip: null,
    moTip(ev, it) {
      const r = ev.currentTarget.getBoundingClientRect();
      const W = 236, KHE = 12;
      // Mở sang phải; sát mép phải quá thì lật sang trái. Trên/dưới thì kẹp trong khung nhìn.
      let x = r.right + KHE;
      if (x + W > innerWidth - 8) x = Math.max(8, r.left - KHE - W);
      const y = Math.max(8, Math.min(r.top, innerHeight - 190));
      this.khoTip = { ...it, x, y };
    },
    dongTip() { this.khoTip = null; },
    get khoList() {
      if (!this.bang) return [];
      return Object.keys(this.bang.kho).map((id) => this._oVatPham(id, this.bang.kho[id]))
        .sort((a, b) => b.so - a.so);
    },
    get khoHien() { return this.khoLoc === 'all' ? this.khoList : this.khoList.filter((x) => x.nhom === this.khoLoc); },
    get gopHien() { return this.gopLoc === 'all' ? this.gopDuoc : this.gopDuoc.filter((x) => x.nhom === this.gopLoc); },
    get oKho() { return this.bang ? oKhoToiDa(this.bang) : 0; },
    /** Vật phẩm trong túi người chơi có thể góp vào kho bang. */
    get gopDuoc() {
      const inv = this.g.state.inventory || {};
      // Bỏ trần 24 món: đã có thanh lọc theo nhóm + khối tự cuộn nên không sợ dài, mà cắt cứng
      // thì món xếp thứ 25 trở đi vĩnh viễn không góp được — người chơi không hiểu vì sao.
      return Object.keys(inv).filter((id) => inv[id] > 0 && !(ITEMS[id] || {}).equip)
        .map((id) => this._oVatPham(id, inv[id]))
        .sort((a, b) => b.so - a.so);
    },
    get quyenList() {
      if (!this.bang) return [];
      return Object.keys(QUYEN_MAC_DINH).map((k) => ({ k, ten: QUYEN_LABEL[k] || k, bac: this.bang.quyen[k] | 0 }));
    },

    // ---------- kĩ năng ----------
    get kyNang() {
      void this._t;
      if (!this.bang) return [];
      return KY_NANG_BANG.map((kn) => {
        const lv = capKyNang(this.g.state, kn.id), tran = tranKyNang(this.g.state, kn);
        return {
          ...kn, lv, tran,
          gia: lv < kn.maxLv ? giaKyNang(kn, lv + 1) : 0,
          hienTai: (kn.moiCap * lv * 100).toFixed(1),
          keTiep: (kn.moiCap * (lv + 1) * 100).toFixed(1),
          moKhoa: this.capBang >= kn.capBang,
          nangDuoc: this.capBang >= kn.capBang && lv < tran && this.congTich >= giaKyNang(kn, lv + 1),
          // Câu ĐẦY ĐỦ ngay trong dữ liệu, đừng để lớp view ghép thêm chữ — thẻ mới quên ghép
          // là ra đúng hai chữ trơ trọi, đọc không hiểu đòi gì.
          // ⚠ Tên công trình phải TRA RA, không ghi cứng: mỗi nhóm kĩ năng do một công trình
          // khác nhau gác trần (KN_TRAN_THEO_CT), ghi cứng là chỉ sai cho 8/12 cây.
          chanBoi: lv >= tran && lv < kn.maxLv
            ? ('Cần nâng ' + ((CONG_TRINH_BY_ID[KN_TRAN_THEO_CT[kn.key]] || {}).ten || 'công trình')) : '',
        };
      });
    },

    // ---------- cửa hàng ----------
    get hang() {
      void this._t;
      try {
        return danhSachHang(this.g.state, Date.now()).map((h) => {
          // ⚠ KHÔNG ghi đè `ten`/`desc` — danhSachHang() đã lấy đúng từ ITEMS rồi; lấy lại từ
          // CUA_HANG_BANG là xoá trắng lời văn của mọi món có itemId (data không còn giữ nữa).
          const d = CUA_HANG_BANG.find((x) => x.id === h.id) || {};
          return { ...h, ico: d.ico, emoji: d.emoji, nhom: d.nhom, mau: CH_NHOM_MAU[d.nhom] || '#94a3b8' };
        });
      } catch (e) { return []; }
    },

    /** Bản khắc của một công trình: chữ Hán + sắc riêng. */
    khac(id) { return TILE_KHAC[id] || { han: '殿', mau: '#94a3b8', phu: '' }; },
    /** Công trình đang mở popup — tra lại từ danh sách nên số liệu luôn tươi sau khi nâng cấp. */
    get moCT() { return this.g.bpCongTrinh; },
    /**
     * MỘT câu nói vì sao chưa nâng được, '' nếu nâng được.
     * Chỉ nói cái ĐANG CHẶN — không nhắc luật khi luật chưa chặn ai.
     */
    get canTro() {
      const ct = this.ctDangMo; if (!ct) return '';
      if (ct.lv >= ct.maxLv) return 'Đã tới cấp cao nhất.';
      if (this.dangXay) return 'Đang xây ' + this.dangXay.ten + ' cấp ' + this.dangXay.lv + ', còn ' + this.gioTxt(this.dangXay.conMs) + '.';
      if (ct.lv + 1 > this.capBang) return 'Tiên Minh phải lên cấp ' + (ct.lv + 1) + ' đã (đang cấp ' + this.capBang + ').';
      if (this.bang.quy < ct.gia) return 'Ngân Khố thiếu ' + this.fmt(ct.gia - this.bang.quy) + ' Bạc.';
      return '';
    },
    get ctDangMo() { const id = this.g.bpCongTrinh; return id ? (this.congTrinh.find((x) => x.id === id) || null) : null; },

    // ---------- công trình ----------
    get congTrinh() {
      void this._t;
      if (!this.bang) return [];
      return CONG_TRINH.map((ct) => {
        const lv = capCongTrinh(this.g.state, ct.id), sau = lv + 1;
        const dangXay = this.bang.xayDung && this.bang.xayDung.id === ct.id;
        return {
          ...ct, lv, moTa: ct.moTaCap(lv),
          moTaSau: sau <= ct.maxLv ? ct.moTaCap(sau) : [],
          gia: sau <= ct.maxLv ? giaCongTrinh(ct, sau) : 0,
          gio: sau <= ct.maxLv ? gioCongTrinh(ct, sau) : 0,
          dangXay, conLai: dangXay ? this.g.notifAgo ? Math.max(0, this.bang.xayDung.xong - Date.now()) : 0 : 0,
          xayDuoc: !this.bang.xayDung && sau <= ct.maxLv && sau <= this.capBang && this.bang.quy >= giaCongTrinh(ct, sau),
        };
      });
    },
    get dangXay() {
      void this._t;
      if (!this.bang || !this.bang.xayDung) return null;
      const x = this.bang.xayDung, ct = CONG_TRINH_BY_ID[x.id] || {};
      return { ten: ct.ten || x.id, lv: x.lv, conMs: Math.max(0, x.xong - Date.now()) };
    },

    // ---------- nhiệm vụ ----------
    get nv() { void this._t; try { return danhSachNv(this.g.state, this.world, Date.now()); } catch (e) { return []; } },
    get nvConLai() { void this._t; return this.gioTxt(nvKyConLai(Date.now())); },
    get truyNa() { void this._t; try { return danhSachTruyNa(this.g.state, this.world, Date.now(), this.combatLv); } catch (e) { return []; } },

    // ---------- chinh phạt ----------
    get cp() { void this._t; try { return chinhPhat(this.g.state, this.world, Date.now()); } catch (e) { return []; } },
    get bxhMua() { void this._t; try { return bangXepHangMua(this.g.state, this.world, Date.now()); } catch (e) { return []; } },
    get muaConLaiTxt() { void this._t; return this.gioTxt(muaConLai(Date.now())); },
    get soMua() { void this._t; try { return soMua(this.world, Date.now()); } catch (e) { return 1; } },
    /** Đã đi được bao nhiêu phần trăm mùa — cho vòng tiến độ trên phù hiệu mùa. */
    get muaPct() { void this._t; return Math.round((1 - muaConLai(Date.now()) / MUA_MS) * 100); },
    /** Huy chương ba hạng đầu; từ hạng 4 trở đi để số trơn. */
    hangMau(h) { return ({ 1: '#f5b942', 2: '#cbd5e1', 3: '#c08457' })[h] || '#475569'; },
    get vungXem() {
      const ds = this.cp;
      if (this.vungChon) { const v = ds.find((x) => x.id === this.vungChon); if (v) return v; }
      return ds.find((x) => x.hangTa > 0 && x.diemTa > 0) || ds[0] || null;
    },
    get bxhVung() {
      void this._t;
      const v = this.vungXem; if (!v) return [];
      try { return bangXepHangVung(this.g.state, this.world, v.id, Date.now()).ds.slice(0, 8); } catch (e) { return []; }
    },
    get coThuongMua() { return !!(this.bp && this.bp.muaThuong && !this.bp.muaThuong.daNhan && (this.bp.muaThuong.hang | 0) >= 1); },
    get hangMuaTruoc() { return this.bp && this.bp.muaThuong ? (this.bp.muaThuong.hang | 0) : 0; },

    // ---------- boss bang ----------
    get moBoss() { return moBossBang(this.g.state); },
    get boss() { void this._t; try { return bossBang(this.g.state, this.world, Date.now()); } catch (e) { return null; } },

    // ---------- tiện ----------
    /** ms -> "X ngày Y giờ" / "X giờ Y phút" / "X phút". */
    gioTxt(ms) {
      const p = Math.ceil(Math.max(0, ms) / 60000);
      const ng = Math.floor(p / 1440), gi = Math.floor((p % 1440) / 60), ph = p % 60;
      if (ng >= 1) return ng + ' ngày' + (gi ? ' ' + gi + ' giờ' : '');
      if (gi >= 1) return gi + ' giờ' + (ph ? ' ' + ph + ' phút' : '');
      return Math.max(1, ph) + ' phút';
    },
    chucTen(id) { return (CHUC_BY_ID[id] || {}).ten || id; },
    pct(a, b) { return Math.min(100, Math.round((a || 0) / Math.max(1, b || 1) * 100)); },

    // ============================================================
    // BANG CHIẾN — nằm sau cờ `bangChien`. Cờ tắt thì tab không hiện, engine cũng không chạy.
    // ============================================================
    get bcCo() { return this.g.moChua('bangChien'); },
    /**
     * Danh sách tab. Bang Chiến chỉ mọc ra khi cờ BẬT.
     * ⚠ Bản lưu cũ có thể còn đang đứng ở tab đó lúc cờ bị tắt lại — trả về tab đầu cho chắc,
     *   không thì người chơi rơi vào một khung trắng không có đường ra.
     */
    get bpTabs() {
      const ds = [
        { id: 'nha', ten: 'Tổng Đàn' }, { id: 'thanhVien', ten: 'Minh Chúng' }, { id: 'chieuMo', ten: 'Chiêu Mộ' },
        { id: 'nhiemVu', ten: 'Minh Vụ' }, { id: 'cuaHang', ten: 'Minh Hội Các' }, { id: 'kyNang', ten: 'Kĩ Năng' },
        { id: 'congTrinh', ten: 'Công Trình' }, { id: 'chinhPhat', ten: 'Chinh Phạt' }, { id: 'boss', ten: 'Trảm Yêu' },
      ];
      if (this.bcCo) ds.push({ id: 'bangChien', ten: 'Bang Chiến' });
      ds.push({ id: 'thietLap', ten: 'Thiết Lập' });
      if (!ds.some((t) => t.id === this.tab)) this.tab = 'nha';
      return ds;
    },
    get bcMo() { return this.bcCo && !!this.bang && moBangChien(this.g.state); },
    get bcVuong() { return this.bcCo ? bangChienVuong(this.g.state, this.world, Date.now()) : 'tat-co'; },
    /** Màn trống PHẢI nói rõ đang thiếu gì và chỉ đúng chỗ đi tiếp. */
    get bcVuongChu() {
      const v = this.bcVuong;
      if (v === 'chua-lap-minh') return 'Phải lập Tiên Minh trước đã.';
      if (v === 'chua-dien-vo-truong') return 'Phải xây Diễn Võ Trường. Vào tab Công Trình để dựng.';
      if (v === 'thieu-minh-chung') return 'Cần đủ 4 minh chúng để bày trận. Vào tab Chiêu Mộ để mời thêm.';
      return '';
    },
    get bcTran() { void this._t; return this.bcMo ? bangChienTran(this.g.state, this.world, Date.now()) : null; },
    /** Cửa thắng CẢ TRẬN theo thế trận đang bày, đọc thành phần trăm. */
    bcKiVong(r) { return Math.round(bcKiVongThang((r.cap || []).map((c) => c.tiLe)) * 100); },
    bcMauCua(ma) {
      return ma === 'an' ? 'text-teal-300 border-teal-500/40 bg-teal-500/8'
        : ma === 'hen' ? 'text-amber-300 border-amber-500/40 bg-amber-500/7'
          : ma === 'hiem' ? 'text-orange-300 border-orange-500/40 bg-orange-500/7'
            : 'text-rose-300 border-rose-500/40 bg-rose-500/7';
    },
    bcConLai(ms) { return this.gioTxt(ms); },
    get bcBuffGiu() { return BC_BUFF_GIU; },
    /** Chip ngũ hành — dùng LẠI bảng NGU_HANH của combat, không đẻ bảng màu thứ hai. */
    bcHeChip(he) { const h = NGU_HANH[he] || NGU_HANH.vohe; return { han: h.han, ten: h.name, badge: h.badge }; },
    /**
     * Mã chân dung của một suất quân.
     * ⚠ Nhân vật chưa mua ảnh đại diện thì `state.player.avatar` là chuỗi rỗng — engine không biết
     *   ảnh mặc định là cái nào, nên ô người chơi hiện ra TRỐNG TRƠN. Ảnh chụp game thật mới lộ.
     *   Ở đây hỏi đúng `g.avatarId`, cùng cái mọi màn khác đang dùng.
     */
    bcAva(f) {
      if (!f) return '';
      if (f.laTa) return this.g.avatarId || '';
      return (f.av && f.av.id) ? f.av.id : (f.av || '');
    },

    /**
     * Đổi cặp bằng HAI LẦN BẤM (chọn một khe rồi bấm khe kia).
     * ⛔ Không dùng kéo–thả: kéo–thả không chạm được trên điện thoại, và máy soi cũng không
     *    dựng lại được thao tác đó nên mọi phép đo sau này thành đo mù.
     */
    bcBam(i) {
      if (!this.bcTran || this.bcTran.xong) return;
      if (this.bcKheChon === null) { this.bcKheChon = i; return; }
      if (this.bcKheChon === i) { this.bcKheChon = null; return; }
      bcDoiCho(this.g.state, this.world, this.bcKheChon, i, Date.now());
      this.bcKheChon = null; this._luu();
    },
    bcTuXepGiup() {
      if (!bcTuXep(this.g.state, this.world, Date.now())) { this.g.showToast('Chưa xếp lại được.'); return; }
      this.bcKheChon = null; this._luu();
      this.g.showToast('Đã xếp lại theo cửa thắng cao nhất.');
    },
    bcKhaiChien() {
      const r = this.bcTran; if (!r || r.xong) return;
      this.g.hoiXacNhan({
        tieuDe: 'Khai Chiến?',
        loi: 'Khai chiến rồi thì không đổi cặp được nữa. Cửa thắng cả trận đang là ' + this.bcKiVong(r) + '%.',
        canhBao: 'Thua thì Ngân Khố bị vét ' + this.fmt(Math.round(r.vetBac * 0.6)) + ' Bạc.',
        nut: 'Khai Chiến', nguy: true,
        xong: () => {
          const ghi = khaiChien(this.g.state, this.world, Date.now());
          if (!ghi) { this.g.showToast('Chưa khai chiến được.'); return; }
          this._bcLinh(ghi, false);
        },
      });
    },
    /** Lĩnh phần thưởng của MỘT bản ghi trận. Engine không đụng túi — chỗ phát là đây. */
    _bcLinh(ghi, tuDong) {
      if (ghi.manh) addItem(this.g.state, 'manhTrangBi', ghi.manh);
      this._luu();
      const dau = tuDong ? 'Tuần trước quân tự ra trận — ' : '';
      this.g.showToast(dau + (ghi.thang
        ? ('thắng ' + ghi.doiTen + ' ' + ghi.diem.join('-') + ', chiếm ' + ghi.locTen + ' — vét '
          + this.fmt(ghi.bac) + ' Bạc, ' + ghi.manh + ' Mảnh, ' + this.fmt(ghi.ct) + ' Công Tích.')
        : ('thua ' + ghi.doiTen + ' ' + ghi.diem.join('-') + ' ở ' + ghi.locTen + ' — mất '
          + this.fmt(-ghi.bac) + ' Bạc trong Ngân Khố.')));
    },

    // ============================================================
    // THAO TÁC
    // ============================================================
    _luu() { try { Storage.save(this.g.state); } catch (e) {} this._t = Date.now(); },
    _nhip() {
      try {
        const r = nhipBang(this.g.state, this.world, Date.now(), this.combatLv, this.bcCo);
        if (r && r.xong) this.g.showToast(r.xong.ten + ' xây xong — đạt cấp ' + r.xong.lv + '.');
        // Trận Bang Chiến tuần trước tự ra trận vì không kịp ra lệnh — lĩnh Mảnh ở đây, y lối boss.
        if (r && r.bc) this._bcLinh(r.bc, true);
        if (r && r.boss) {
          this.g.state.currencies.honThach = (this.g.state.currencies.honThach || 0) + r.boss.honThach;
          if (r.boss.manh) addItem(this.g.state, 'manhTrangBi', r.boss.manh);
          this.g.showToast('Cả bang hạ ' + r.boss.boss + ' — ' + this.fmt(r.boss.ct) + ' Công Tích, '
            + this.fmt(r.boss.honThach) + ' Hồn Thạch, ' + r.boss.manh + ' Mảnh.');
        }
        if (r) this._luu();
      } catch (e) {}
    },

    lap() {
      const g = this.g;
      if (this.bang) { g.showToast('Ngươi đã có bang rồi.'); return; }
      if (this.tongLv < LV_LAP_BANG) { g.showToast('Cần Tổng Lv ' + LV_LAP_BANG + ' mới đủ danh vọng lập bang.'); return; }
      if (this.bac < PHI_LAP_BANG) { g.showToast('Cần ' + this.fmt(PHI_LAP_BANG) + ' Bạc để dựng cờ.'); return; }
      const loi = loiTenBang(this.tenMoi);
      if (loi) { g.showToast(loi); return; }
      if (!lapBang(g.state, { ten: this.tenMoi.trim(), tonChi: this.tonChiMoi }, Date.now())) { g.showToast('Chưa dựng cờ được.'); return; }
      g.state.currencies.bac -= PHI_LAP_BANG;
      this.moForm = false; this.tenMoi = ''; this.tab = 'nha';
      this._nhip(); this._luu();
      g.showToast('Đã dựng cờ — Bang Chủ là ngươi.');
    },
    xinGiaiTan() {
      const g = this.g, b = this.bang; if (!b) return;
      g.hoiXacNhan({
        tieuDe: 'Hạ Cờ Giải Tán?',
        loi: 'Giải tán <b class="text-amber-200">' + b.ten + '</b> — cờ hạ, người tan, tên bang xoá khỏi giang hồ.',
        canhBao: 'Mất sạch: <b>' + b.tv.length + ' thành viên</b> · cấp bang <b>' + b.cap + '</b> · Ngân Khố <b>'
          + this.fmt(b.quy) + ' Bạc</b> · toàn bộ kĩ năng, công trình, đồ trong Minh Khố và <b>' + this.fmt(this.congTich)
          + ' Công Tích</b>. Không hoàn lại gì.',
        nut: 'Giải Tán', huy: 'Giữ Bang', nguy: true,
        xong: () => { giaiTan(g.state, Date.now()); this._luu(); g.showToast('Bang đã giải tán.'); },
      });
    },

    // ---------- thành viên ----------
    mo(t) {
      const g = this.g;
      if (!this.bang) return;
      if (this.tv.length >= this.tranTv) { g.showToast('Bang đã đủ ' + this.tranTv + ' người — nâng Tổng Đàn để thêm suất.'); return; }
      // Cửa Giao Tình: nói đúng còn thiếu mấy bận rượu, đừng bắt người ta đoán.
      if (t.du === false) {
        g.showToast(t.ten + ' chưa đủ thân — còn ' + (t.can - t.bac) + ' bận nữa ở Tửu Lâu.');
        return;
      }
      if (this.bac < t.gia) { g.showToast('Cần ' + this.fmt(t.gia) + ' Bạc để mời ' + t.ten + '.'); return; }
      if (!chieuMo(g.state, t.id, this.world, Date.now())) { g.showToast('Không mời được người này.'); return; }
      g.state.currencies.bac -= t.gia;
      this._luu(); g.showToast(t.ten + ' đã nhập bang.');
    },
    duyet(t, nhan) {
      const g = this.g; if (!this.bang) return;
      if (nhan) {
        if (this.tv.length >= this.tranTv) { g.showToast('Bang đã đủ người.'); return; }
        chieuMo(g.state, t.id, this.world, Date.now());     // duyệt đơn thì KHÔNG tốn Bạc
        g.showToast(t.ten + ' được nhận vào bang.');
      } else {
        this.bang.donXin = (this.bang.donXin || []).filter((x) => x !== t.id);
        g.showToast('Đã từ chối ' + t.ten + '.');
      }
      this._luu();
    },
    kich(m) {
      const g = this.g;
      g.hoiXacNhan({
        tieuDe: 'Đuổi Khỏi Bang?',
        loi: 'Đuổi <b class="text-amber-200">' + m.ten + '</b> (' + m.chucTen + ') khỏi bang.',
        canhBao: 'Công lao người này đã đóng góp sẽ mất theo. Nếu muốn nhận lại, bạn phải chiêu mộ từ đầu và tốn Bạc.',
        nut: 'Đuổi', huy: 'Thôi', nguy: true,
        xong: () => { kichNguoi(g.state, m.id, this.world, Date.now()); this.loNguoi = null; this._luu(); g.showToast('Đã đuổi ' + m.ten + '.'); },
      });
    },
    thang(m, len) {
      const g = this.g;
      const loi = doiChuc(g.state, m.id, len, Date.now(), this.world);
      if (loi) { g.showToast(loi); return; }
      this._luu();
      g.showToast(m.ten + (len ? ' được thăng chức.' : ' bị giáng chức.'));
    },
    datQ(k, bac) { datQuyen(this.g.state, k, bac); this._luu(); },
    /** Thăng/hạ/đuổi ngay trong popup hồ sơ — xong thì dựng lại hồ sơ cho số liệu tươi. */
    hsThang(len) {
      const h = this.g.bpHoSo; if (!h) return;
      this.thang(h, len);
      const moi = hoSoMinhChung(this.g.state, this.world, h.id, Date.now());
      this.g.bpHoSo = moi || null;
    },
    hsKich() {
      const h = this.g.bpHoSo; if (!h) return;
      this.g.closeBpHoSo();
      this.kich(h);
    },

    // ---------- cống hiến ----------
    gop(n) {
      const g = this.g, so = Math.floor(n || 0);
      if (!this.bang) { g.showToast('Chưa lập Tiên Minh.'); return; }
      if (so <= 0) { g.showToast('Nhập số Bạc muốn góp đã.'); return; }
      if (this.bac < so) { g.showToast('Không đủ Bạc — cần ' + this.fmt(so) + '.'); return; }
      g.state.currencies.bac -= so;
      const capTruoc = this.bang.cap, mcTruoc = this.bang.bangCong;
      const them = congHien(g.state, so, Date.now());
      const mc = this.bang.bangCong - mcTruoc;
      this._luu();
      g.showToast('Cống hiến ' + this.fmt(them) + ' Bạc — được ' + this.fmt(them) + ' Công Tích'
        + (mc > 0 ? ' và ' + this.fmt(mc) + ' Minh Cống' : '')
        + (this.bang.cap > capTruoc ? ' · Tiên Minh lên cấp ' + this.bang.cap : '') + '.');
    },
    /** Góp đúng số trong ô tự điền. */
    gopTuy() {
      if (!this.bacGopDuoc) { this.g.showToast(this.bacGopSo > 0 ? 'Không đủ Bạc.' : 'Nhập số Bạc muốn góp đã.'); return; }
      this.gop(this.bacGopSo);
      this.bacGop = '';
    },
    gopHet() { this.bacGop = String(this.bac); },

    // ---------- kho ----------
    gopVaoKho(it, so) {
      const g = this.g, n = Math.min(it.so, so);
      if (!n) return;
      if (!gopKho(g.state, it.id, n)) { g.showToast('Kho bang đã đầy ô.'); return; }
      g.state.inventory[it.id] -= n;
      if (g.state.inventory[it.id] <= 0) delete g.state.inventory[it.id];
      this._luu(); g.showToast('Góp ' + n + ' ' + it.ten + ' vào kho bang.');
    },
    rutTuKho(it, so) {
      const g = this.g;
      const lay = rutKho(g.state, it.id, Math.min(it.so, so));
      if (!lay) { g.showToast('Không rút được.'); return; }
      addItem(g.state, it.id, lay);
      this._luu(); g.showToast('Rút ' + lay + ' ' + it.ten + '.');
    },

    // ---------- kĩ năng ----------
    hoc(kn) {
      const g = this.g;
      const loi = hocKyNang(g.state, kn.id, Date.now());
      if (loi) { g.showToast(loi); return; }
      this._luu(); g.showToast('Luyện thành ' + kn.ten + ' cấp ' + capKyNang(g.state, kn.id) + '.');
    },

    // ---------- cửa hàng ----------
    muaMon(h) {
      const g = this.g;
      const don = muaHang(g.state, h.id, Date.now());
      if (!don) { g.showToast('Không mua được — xem lại cấp bang, Công Tích hoặc hạn ngày.'); return; }
      if (don.tienTe) g.state.currencies[don.tienTe] = (g.state.currencies[don.tienTe] || 0) + don.so;
      else if (don.itemId) addItem(g.state, don.itemId, don.so);
      this._luu(); g.showToast('Đổi được ' + don.ten + '.');
    },

    // ---------- công trình ----------
    // Không kéo thả: bỏ nền sơn thuỷ rồi thì kéo thả chẳng để sắp vào đâu. Thẻ xếp thành
    // hàng, mọi chi tiết dồn vào popup khi bấm.
    /** Chữ đỡ cho thẻ kĩ năng khi chưa có art. */
    knHan(id) { return KY_NANG_HAN[id] || '訣'; },
    /** Triện nhóm nghề trên thẻ minh chúng. Bốn chữ đều có sẵn trong subset Noto Serif SC. */
    nhomHan(n) { return ({ combat: '武', gather: '採', craft: '鍛', support: '丹' })[n] || '侠'; },
    /** Bản khắc của một công trình: chữ Hán + sắc riêng (TILE_KHAC ở data/bangphai.js). */
    khac(id) { return TILE_KHAC[id] || { han: '殿', mau: '#94a3b8', phu: '' }; },
    /**
     * Nền art của một công trình (khung phóng/neo chung — ART_CT_KHUNG ở data/bangphai.js).
     * Chưa dựng thì xám và tối hẳn, để nhìn phát biết ô nào còn trống.
     */
    artCT(id, daDung) {
      return 'background:url(images/tienminh/' + id + '.webp) ' + ART_CT_KHUNG
             + (daDung ? '' : ';filter:grayscale(1) brightness(.42)');
    },
    /** Công trình đang mở popup — tra lại từ danh sách nên số liệu luôn tươi sau khi nâng cấp. */
    get moCT() { return this.g.bpCongTrinh; },
    /**
     * MỘT câu nói vì sao chưa nâng được, '' nếu nâng được.
     * Chỉ nói cái ĐANG CHẶN — không nhắc luật khi luật chưa chặn ai.
     */
    get canTro() {
      const ct = this.ctDangMo; if (!ct) return '';
      if (ct.lv >= ct.maxLv) return 'Đã tới cấp cao nhất.';
      if (this.dangXay) return 'Đang xây ' + this.dangXay.ten + ' cấp ' + this.dangXay.lv + ', còn ' + this.gioTxt(this.dangXay.conMs) + '.';
      if (ct.lv + 1 > this.capBang) return 'Tiên Minh phải lên cấp ' + (ct.lv + 1) + ' đã (đang cấp ' + this.capBang + ').';
      if (this.bang.quy < ct.gia) return 'Ngân Khố thiếu ' + this.fmt(ct.gia - this.bang.quy) + ' Bạc.';
      return '';
    },
    get ctDangMo() { const id = this.g.bpCongTrinh; return id ? (this.congTrinh.find((x) => x.id === id) || null) : null; },

    xay(ct) {
      const g = this.g;
      const loi = xayCongTrinh(g.state, ct.id, Date.now());
      if (loi) { g.showToast(loi); return; }
      this._luu(); g.showToast('Khởi công ' + ct.ten + ' cấp ' + (ct.lv + 1) + '.');
    },

    // ---------- nhiệm vụ ----------
    linhNv(q) {
      const g = this.g;
      const n = nhanNv(g.state, this.world, q.id, Date.now());
      if (!n) { g.showToast('Việc này chưa xong.'); return; }
      this._luu(); g.showToast('Hoàn thành ' + q.ten + ' — được ' + n + ' Công Tích.');
    },
    nhanTn(q) {
      const g = this.g;
      if (!nhanTruyNa(g.state, this.world, q.id, Date.now(), this.combatLv)) { g.showToast('Không nhận được lệnh này.'); return; }
      this._luu(); g.showToast('Đã nhận ' + q.bacTen + ' — trảm ' + q.so + ' ' + q.ten + '.');
    },
    nopTn(q) {
      const g = this.g;
      const r = nopTruyNa(g.state, this.world, q.id, Date.now(), this.combatLv);
      if (!r) { g.showToast('Chưa đủ số, chưa nộp được.'); return; }
      g.state.currencies.bac = (g.state.currencies.bac || 0) + r.bac;
      if (r.manh) addItem(g.state, 'manhTrangBi', r.manh);
      this._luu();
      g.showToast('Nộp lệnh — ' + r.ct + ' Công Tích, ' + this.fmt(r.bac) + ' Bạc'
        + (r.manh ? ', ' + r.manh + ' Mảnh Trang Bị' : '') + '.');
    },

    // ---------- mùa ----------
    linhMua() {
      const g = this.g;
      const n = nhanThuongMua(g.state, this.world, Date.now());
      if (!n) { g.showToast('Chưa có phần thưởng mùa để nhận.'); return; }
      g.state.currencies.honThach = (g.state.currencies.honThach || 0) + n;
      this._luu(); g.showToast('Lĩnh thưởng mùa — ' + this.fmt(n) + ' Hồn Thạch.');
    },
    chonVung(v) { this.vungChon = v.id; },

    // ---------- boss bang ----------
    xuatTran() {
      const g = this.g, c = this.boss;
      if (!c) return;
      if (c.daNhan) { g.showToast('Boss tuần này đã hạ — chờ tuần sau.'); return; }
      if (c.luot >= c.tranLuot) { g.showToast('Hết ' + c.tranLuot + ' lượt tuần này.'); return; }
      if (c.cdConMs > 0) { g.showToast('Còn phải lấy sức ' + this.gioTxt(c.cdConMs) + '.'); return; }
      const d = dameMotTranBoss(g.state, c.boss.id);
      if (!d) { g.showToast('Chưa bày bài võ thì xuất trận sao được.'); return; }
      if (!xuatTranBoss(g.state, d, Date.now())) { g.showToast('Chưa xuất trận được lúc này.'); return; }
      this._t = Date.now();
      const w = chotBossBang(g.state, this.world, Date.now());
      if (w) {
        g.state.currencies.honThach = (g.state.currencies.honThach || 0) + w.honThach;
        if (w.manh) addItem(g.state, 'manhTrangBi', w.manh);
        g.showToast('Hạ ' + w.boss + '! ' + this.fmt(w.ct) + ' Công Tích, ' + this.fmt(w.honThach) + ' Hồn Thạch, ' + w.manh + ' Mảnh.');
      } else {
        g.showToast('Xuất trận — bào ' + this.fmt(d) + ' sát thương.');
      }
      this._luu();
    },

    bpInit() {
      ensureBangPhai(this.g.state);
      // Tìm Kiếm bấm vào một Tiên Minh -> nhảy thẳng sang bảng Chinh Phạt, chỗ duy nhất
      // bày các minh khác. Cờ dùng một lần rồi xoá, kẻo lần sau vào lại vẫn nhảy.
      if (this.g.bpTabDich) { this.tab = this.g.bpTabDich; this.g.bpTabDich = null; }
      this._t = Date.now();
      this._nhip();
      this._iv = setInterval(() => { this._t = Date.now(); this._nhip(); }, 60000);
      this.$watch('$store.game.view', (v) => { if (v !== 'guild' && this._iv) { clearInterval(this._iv); this._iv = 0; } });
    },
  };
}
