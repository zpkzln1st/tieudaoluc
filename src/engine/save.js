// ============================================================
// ENGINE — Lưu/Tải. Bọc sau interface để sau swap sang server.
// Hiện tại: localStorage. Sau (online): đổi save/load gọi API.
// ============================================================
const KEY = 'tieudao_save_v1';

let _locked = false;   // khi áp dụng bản cloud + chờ reload: chặn autosave RAM cũ ghi đè

export const Storage = {
  // Khoá ghi: dùng trước khi ghi thẳng bản cloud vào localStorage rồi reload,
  // để vòng game (autosave) không lưu đè state cũ trong RAM trong lúc chờ reload.
  lock() { _locked = true; },
  save(state) {
    if (_locked) return false;   // đang áp dụng cloud save / chờ reload
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
