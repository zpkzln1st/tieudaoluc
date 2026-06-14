// ============================================================
// ENGINE — Trang bị (THUẦN): equip / unequip giữa túi đồ và slot.
// ============================================================
import { ITEMS } from '../data/items.js';

export function equipItem(state, itemId) {
  const item = ITEMS[itemId];
  if (!item || !item.equip) return false;
  if ((state.inventory[itemId] || 0) <= 0) return false;
  if (!state.equipment) state.equipment = {};
  const slot = item.equip.slot;

  // tháo món đang mặc (nếu có) -> trả về túi
  const cur = state.equipment[slot];
  if (cur) state.inventory[cur] = (state.inventory[cur] || 0) + 1;

  // lấy 1 món từ túi -> gắn vào slot
  state.inventory[itemId] -= 1;
  if (state.inventory[itemId] <= 0) delete state.inventory[itemId];
  state.equipment[slot] = itemId;
  return true;
}

export function unequipItem(state, slot) {
  if (!state.equipment) state.equipment = {};
  const cur = state.equipment[slot];
  if (!cur) return false;
  state.inventory[cur] = (state.inventory[cur] || 0) + 1;
  state.equipment[slot] = null;
  return true;
}
