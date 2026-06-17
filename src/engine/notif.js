// ============================================================
// ENGINE — Thông Báo (notification feed). Nguồn CHUNG cho chuông + Phi Cáp Đài.
// type: 'thuThap' | 'yeuVuong' | 'biCanh' | 'linhThu' | 'khac' | 'sanGD'
// Gọi từ engine (dungeon, advance...) lẫn store (boss, bái sư...).
// ============================================================
const NOTIF_CAP = 50;

export function pushNotif(state, type, title, body, ts) {
  if (!state) return;
  if (!Array.isArray(state.notifications)) state.notifications = [];
  state._notifSeq = (state._notifSeq || 0) + 1;
  state.notifications.unshift({ id: state._notifSeq, type, title: title || '', body: body || '', ts: ts || 0, read: false });
  if (state.notifications.length > NOTIF_CAP) state.notifications.length = NOTIF_CAP;
}
