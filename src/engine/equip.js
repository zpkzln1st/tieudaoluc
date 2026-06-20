// ============================================================
// ENGINE — Trang bị (THUẦN): equip / unequip + túi gear instance (loot-hunt).
//   gearBag = [instance]; equipment[slot] = instance|null. KHÔNG còn id-string.
// ============================================================
import { ITEMS } from '../data/items.js';

// Thêm 1 instance gear vào túi (+ ghi Vạn Vật Phổ Binh Khí theo gearId).
export function addGearInstance(state, inst) {
  if (!inst) return null;
  if (!Array.isArray(state.gearBag)) state.gearBag = [];
  state.gearBag.push(inst);
  if (state.codex && state.codex.obtained) state.codex.obtained[inst.gearId] = Math.max(state.codex.obtained[inst.gearId] || 0, 1);
  return inst;
}
// Gỡ 1 instance khỏi túi theo uid -> trả instance (hoặc null).
export function removeGearByUid(state, uid) {
  if (!Array.isArray(state.gearBag)) return null;
  const i = state.gearBag.findIndex((g) => g && g.uid === uid);
  if (i < 0) return null;
  return state.gearBag.splice(i, 1)[0];
}
// Tìm instance theo uid (trong túi hoặc đang mặc).
export function findGear(state, uid) {
  if (Array.isArray(state.gearBag)) { const g = state.gearBag.find((x) => x && x.uid === uid); if (g) return g; }
  const eq = state.equipment || {};
  for (const s in eq) { if (eq[s] && eq[s].uid === uid) return eq[s]; }
  return null;
}

// Mặc 1 instance (theo uid trong túi) vào slot tương ứng. Tháo món cũ -> về túi.
export function equipItem(state, uid) {
  if (!Array.isArray(state.gearBag)) state.gearBag = [];
  if (!state.equipment) state.equipment = {};
  const inst = state.gearBag.find((g) => g && g.uid === uid);
  if (!inst) return false;
  const base = ITEMS[inst.gearId];
  if (!base || !base.equip) return false;
  const slot = base.equip.slot;
  const cur = state.equipment[slot];
  removeGearByUid(state, uid);          // lấy instance khỏi túi
  if (cur) state.gearBag.push(cur);     // trả món đang mặc về túi
  state.equipment[slot] = inst;
  return true;
}

export function unequipItem(state, slot) {
  if (!state.equipment) state.equipment = {};
  const cur = state.equipment[slot];
  if (!cur) return false;
  if (!Array.isArray(state.gearBag)) state.gearBag = [];
  state.gearBag.push(cur);
  state.equipment[slot] = null;
  return true;
}
