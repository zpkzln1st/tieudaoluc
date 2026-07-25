// ============================================================
// KỲ HỒN — tiền tệ CỜ dùng CHUNG cho mọi bàn cờ (Ngũ Tử Kỳ, Cờ Tướng, cờ thêm sau).
// NGUỒN SỰ THẬT DUY NHẤT: state.kyHon (top-level).
//   ⚠ ĐỪNG để kyHon trong state.nguTu / state.coTuong nữa — hai nguồn sẽ lệch nhau.
// Danh hiệu "Kỳ Nghệ" mở theo TỔNG Kỳ Hồn (xem KY_NGHE + engine/titles.js cond 'kyHon').
// ============================================================

// Mốc danh hiệu — PHẢI khớp data/titles.js (loai 'kyNghe')
export const KY_NGHE = [
  { v: 500, name: 'Kỳ Đồ' },
  { v: 5000, name: 'Diệu Thủ' },
  { v: 50000, name: 'Quốc Thủ' },
  { v: 500000, name: 'Kỳ Bá' },
  { v: 5000000, name: 'Thiên Hạ Đệ Nhất Kỳ' },
];

// Khởi tạo + GỘP save cũ (mỗi game từng giữ kyHon riêng) -> cộng dồn, không mất của người chơi.
export function ensureKyHon(state) {
  if (typeof state.kyHon !== 'number' || !isFinite(state.kyHon)) {
    let sum = 0;
    if (state.nguTu && typeof state.nguTu.kyHon === 'number') sum += state.nguTu.kyHon;
    if (state.coTuong && typeof state.coTuong.kyHon === 'number') sum += state.coTuong.kyHon;
    state.kyHon = sum;
  }
  // dọn field cũ để chỉ còn MỘT nguồn sự thật
  if (state.nguTu && 'kyHon' in state.nguTu) delete state.nguTu.kyHon;
  if (state.coTuong && 'kyHon' in state.coTuong) delete state.coTuong.kyHon;
  return state.kyHon;
}

export function getKyHon(state) { return (state && typeof state.kyHon === 'number') ? state.kyHon : 0; }

export function addKyHon(state, n) {
  ensureKyHon(state);
  state.kyHon += (n || 0);
  return state.kyHon;
}

// Danh hiệu Kỳ Nghệ hiện tại + mốc kế theo TỔNG Kỳ Hồn
export function kyNgheOf(state) {
  const k = getKyHon(state);
  let cur = null, next = null;
  for (const m of KY_NGHE) { if (k >= m.v) cur = m; else { next = m; break; } }
  return { cur, next, k };
}
