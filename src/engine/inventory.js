// ============================================================
// ENGINE — Túi đồ (THUẦN)
// inventory = map { itemId: số_lượng }
// ============================================================
export function addItem(state, itemId, qty) {
  state.inventory[itemId] = (state.inventory[itemId] || 0) + qty;
  // Vạn Vật Phổ: tích lũy "đã từng nhận" (Vật Phẩm Phổ đếm số · Binh Khí Phổ = đã nhận ≥1).
  if (state.codex && state.codex.obtained) state.codex.obtained[itemId] = (state.codex.obtained[itemId] || 0) + qty;
}
export function removeItem(state, itemId, qty) {
  const cur = state.inventory[itemId] || 0;
  state.inventory[itemId] = Math.max(0, cur - qty);
  if (state.inventory[itemId] === 0) delete state.inventory[itemId];
}
export function countItem(state, itemId) {
  return state.inventory[itemId] || 0;
}
