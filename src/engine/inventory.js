// ============================================================
// ENGINE — Túi đồ (THUẦN)
// inventory = map { itemId: số_lượng }
// ============================================================
export function addItem(state, itemId, qty) {
  state.inventory[itemId] = (state.inventory[itemId] || 0) + qty;
}
export function removeItem(state, itemId, qty) {
  const cur = state.inventory[itemId] || 0;
  state.inventory[itemId] = Math.max(0, cur - qty);
  if (state.inventory[itemId] === 0) delete state.inventory[itemId];
}
export function countItem(state, itemId) {
  return state.inventory[itemId] || 0;
}
