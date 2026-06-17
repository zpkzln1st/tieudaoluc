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
      state.lastSave = Date.now();
      localStorage.setItem(KEY, JSON.stringify(state));
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
