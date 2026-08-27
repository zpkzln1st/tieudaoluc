// ============================================================
// ENGINE — Lưu/Tải. Bọc sau interface để sau swap sang server.
// Hiện tại: localStorage. Sau (online): đổi save/load gọi API.
// ============================================================
const KEY = 'tieudao_save_v1';

let _locked = false;   // khi áp dụng bản cloud + chờ reload: chặn autosave RAM cũ ghi đè

// ============================================================
// KHOÁ LIÊN CỬA SỔ — chỉ MỘT cửa sổ được quyền ghi bản lưu.
//
// ⛔⛔ Mở game ở hai cửa sổ là mất tiến trình, im lặng. Hai bên cùng nạp một bản lưu vào RAM rồi
//    mỗi bên tự cày; cứ mỗi nhịp lưu, bên nào ghi sau thì đè sạch việc bên kia vừa làm. Trước
//    bản này cả kho không có một khoá liên cửa sổ nào — không `storage`, không `BroadcastChannel`.
//
// Cách chặn: một dấu CÒN SỐNG trong localStorage. Cửa sổ giữ quyền đóng dấu mỗi 4 giây. Cửa sổ
// nào thấy dấu của người khác còn tươi (dưới 12 giây) thì mình là KHÁCH — không ghi gì cả.
// Quá 12 giây không ai đóng dấu nghĩa là cửa sổ đó đã đóng, dấu hết hiệu lực.
// ⚠ HẠN 12 giây phải lớn hơn NHIỀU LẦN nhịp 4 giây: trình duyệt hoãn hẹn giờ ở tab chạy nền, để
//   sát quá thì cửa sổ đang chơi tự đánh mất quyền ghi của chính nó.
// ============================================================
const KEY_TAB = 'tieudao_cua_so_v1';
const TAB_NHIP = 4000;
const TAB_HAN = 12000;
const TAB_ID = Math.random().toString(36).slice(2) + '-' + Date.now().toString(36);

function _docTab() { try { return JSON.parse(localStorage.getItem(KEY_TAB) || 'null'); } catch (e) { return null; } }

// ⚠⚠ MỘT CỜ DUY NHẤT quyết định cửa sổ này có ghi hay không. Không có nó thì hai phép đo tách
//    nhau: lớp phủ đọc "dấu còn tươi" còn hàm lưu đọc "dấu hết hạn", nên có cảnh giao diện báo
//    KHÔNG GHI mà bên dưới vẫn ghi. Cảnh đó có thật: cửa sổ giữ quyền bị tắt đột ngột.
let _laKhach = false;

export const KhoaCuaSo = {
  id: TAB_ID,
  nhip: TAB_NHIP,
  han: TAB_HAN,
  /** Đóng dấu còn sống — cũng chính là cách GIÀNH quyền ghi về cửa sổ này. */
  giuQuyen() { _laKhach = false; try { localStorage.setItem(KEY_TAB, JSON.stringify({ id: TAB_ID, luc: Date.now() })); } catch (e) {} },
  /** Nhận mình là khách: từ đây mọi đường lưu đều tắt. */
  datKhach(v) { _laKhach = !!v; },
  laKhach() { return _laKhach; },
  /**
   * Cửa sổ này có quyền ghi không?
   * ⚠ Dấu HẾT HẠN cũng tính là có quyền — cửa sổ giữ dấu đã tắt rồi. Thiếu vế này thì bản lưu
   *   khoá vĩnh viễn sau một lần trình duyệt sập.
   */
  coQuyen() {
    if (_laKhach) return false;
    const t = _docTab();
    return !t || t.id === TAB_ID || Date.now() - (t.luc || 0) >= TAB_HAN;
  },
  /** Cửa sổ KHÁC đang giữ quyền và dấu vẫn còn tươi? */
  cuaSoKhacDangGiu() { const t = _docTab(); return !!(t && t.id !== TAB_ID && Date.now() - (t.luc || 0) < TAB_HAN); },
  /**
   * Trả dấu lúc rời trang.
   * ⚠⚠ KHÔNG CÓ VẾ NÀY THÌ TẢI LẠI TRANG LÀ BÁO OAN: cửa sổ cũ vừa đóng, dấu của nó còn tươi
   *    thêm 12 giây, nên chính cửa sổ vừa tải lại nhìn thấy "có cửa sổ khác đang mở".
   */
  traDau() { try { const t = _docTab(); if (t && t.id === TAB_ID) localStorage.removeItem(KEY_TAB); } catch (e) {} },
};

export const Storage = {
  // Khoá ghi: dùng trước khi ghi thẳng bản cloud vào localStorage rồi reload,
  // để vòng game (autosave) không lưu đè state cũ trong RAM trong lúc chờ reload.
  lock() { _locked = true; },
  save(state) {
    if (_locked) return false;   // đang áp dụng cloud save / chờ reload
    // ⛔ Cửa sổ khác đang giữ quyền ghi. Chặn Ở ĐÂY chứ không chỉ ở giao diện: mọi đường lưu
    //    trong game đều chạy qua hàm này, chặn một chỗ là chặn hết.
    if (!KhoaCuaSo.coQuyen()) return false;
    try {
      state.lastSave = Date.now();     // ghi QUA proxy để mọi chỗ bám lastSave còn cập nhật
      // ⚠ Bóc lớp proxy của Alpine TRƯỚC khi chuyển thành chuỗi: JSON.stringify đọc hàng nghìn
      //   thuộc tính, mỗi lượt đọc qua proxy đắt gấp ~5 lần. Đo được với save 112KB:
      //   qua proxy 3,05ms · trên vật thô 0,60ms (bản thân localStorage chỉ 0,025ms).
      //   Cứ 5 giây chặn luồng chính 3ms là chắc chắn rớt một khung.
      const tho = (window.Alpine && window.Alpine.raw) ? window.Alpine.raw(state) : state;
      localStorage.setItem(KEY, JSON.stringify(tho));
      return true;
    } catch (e) {
      console.warn('Lưu thất bại:', e);
      return false;
    }
  },
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Tải thất bại:', e);
      return null;
    }
  },
  wipe() {
    localStorage.removeItem(KEY);
  },
};
