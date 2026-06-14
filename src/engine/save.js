// ============================================================
// ENGINE — Lưu/Tải. Bọc sau interface để sau swap sang server.
// Hiện tại: localStorage. Sau (online): đổi save/load gọi API.
// ============================================================
const KEY = 'tieudao_save_v1';

export const Storage = {
  save(state) {
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
