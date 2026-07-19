// ============================================================
// ENGINE — ĐAN BỔ TRỢ (buff có hạn giờ). THUẦN, không đụng UI.
//
// state.buffs = { <key>: { id, untilMs, durMs } }   key = cuongNguyen | bachBao | ngoDao | duongThu
//
// Nguyên tắc:
//   - Lưu TIMESTAMP TUYỆT ĐỐI (untilMs), KHÔNG lưu "thời gian còn lại" -> offline tự đúng,
//     tắt máy 8 tiếng mở lại buff đã hết hạn đúng như ngoài đời.
//   - Mỗi HỌ chỉ một buff. Uống viên cùng họ = THAY THẾ (không cộng dồn thời gian, không chồng %).
//   - Tối đa BUFF_MAX_FAMILIES họ chạy đồng thời.
//   - Trần thời lượng BUFF_MAX_MS cho mọi viên.
// ============================================================
import { ITEMS } from '../data/items.js';
import { removeItem } from './inventory.js';

export const BUFF_MAX_MS = 7200000;        // 2 giờ — trần cứng mọi buff
export const BUFF_MAX_FAMILIES = 2;        // tối đa 2 họ chạy cùng lúc
export const DUOC_LU_MIN_DUR = 2400000;    // Dược Lư CHỈ tự rút Tán (120') và Hoàn (40'); dạng Đan phải uống tay

export function ensureBuffs(state) {
  if (!state.buffs || typeof state.buffs !== 'object') state.buffs = {};
  return state.buffs;
}

// Định nghĩa buff của 1 vật phẩm (null nếu không phải đan bổ trợ).
export function buffDefOf(itemId) {
  const it = ITEMS[itemId];
  return (it && it.buff && it.buff.key) ? it.buff : null;
}

// Dọn buff hết hạn. Trả mảng key vừa rụng (để caller báo người chơi).
export function pruneBuffs(state, now) {
  const b = ensureBuffs(state);
  const gone = [];
  for (const k in b) { if (!b[k] || b[k].untilMs <= now) { gone.push(k); delete b[k]; } }
  return gone;
}

export function buffActive(state, key, now) {
  const b = ensureBuffs(state)[key];
  return (b && b.untilMs > now) ? b : null;
}

export function activeBuffList(state, now) {
  const b = ensureBuffs(state);
  const out = [];
  for (const k in b) {
    if (!b[k] || b[k].untilMs <= now) continue;
    const def = buffDefOf(b[k].id);
    if (def) out.push({ key: k, itemId: b[k].id, untilMs: b[k].untilMs, durMs: b[k].durMs, def });
  }
  return out.sort((x, y) => x.untilMs - y.untilMs);
}

export function buffFamilyCount(state, now) { return activeBuffList(state, now).length; }

// Tổng giá trị 1 trường (vd 'atkPct') từ MỌI buff đang chạy. Mỗi họ tối đa 1 buff nên không chồng trong họ.
export function buffVal(state, field, now) {
  let s = 0;
  for (const a of activeBuffList(state, now)) s += (a.def[field] || 0);
  return s;
}

// Uống 1 viên đan bổ trợ. Trả { ok, msg }.
export function useBuffDan(state, itemId, now) {
  const def = buffDefOf(itemId);
  if (!def) return { ok: false, msg: 'Vật phẩm này không phải Đan Bổ Trợ.' };
  if ((state.inventory[itemId] || 0) < 1) return { ok: false, msg: 'Không còn viên nào trong hành trang.' };
  const b = ensureBuffs(state);
  pruneBuffs(state, now);
  // Trần số HỌ: chỉ chặn khi đây là họ MỚI (thay viên cùng họ thì luôn cho).
  if (!b[def.key] && buffFamilyCount(state, now) >= BUFF_MAX_FAMILIES) {
    return { ok: false, msg: 'Chỉ giữ được ' + BUFF_MAX_FAMILIES + ' loại đan bổ trợ cùng lúc.' };
  }
  removeItem(state, itemId, 1);
  const dur = Math.min(def.durMs || 0, BUFF_MAX_MS);
  b[def.key] = { id: itemId, untilMs: now + dur, durMs: dur };   // cùng họ -> THAY THẾ
  return { ok: true, msg: (ITEMS[itemId] || {}).name + ' phát tác.' };
}

// ---- DƯỢC LƯ: ô cắm sẵn 1 loại đan; buff hết hạn thì tự rút viên kế trong kho. ----
// CHỈ tự rút Tán/Hoàn. Dạng Đan (12') phải uống tay — nếu cho tự rút thì nó xoá đúng cái ma sát
// khiến dạng mạnh nhất tự giới hạn, người chơi cắm một chồng là có buff mạnh THƯỜNG TRỰC.
export function duocLuTick(state, now) {
  const cb = state.combat; if (!cb || !cb.duocLu) return null;
  const itemId = cb.duocLu;
  const def = buffDefOf(itemId); if (!def) return null;
  if ((def.durMs || 0) < DUOC_LU_MIN_DUR) return null;            // dạng Đan: không tự rút
  if (buffActive(state, def.key, now)) return null;               // họ này còn hiệu lực -> chưa cần
  if ((state.inventory[itemId] || 0) < 1) return null;
  const r = useBuffDan(state, itemId, now);
  return r.ok ? itemId : null;
}
