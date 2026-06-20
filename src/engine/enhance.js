// ============================================================
// ENGINE — Cường Hóa trang bị (+0 → +15) bằng Đá Cường Hóa (THUẦN).
//   Mỗi +1 = +8% chỉ số nền (cộng dồn; +15 ≈ ×2.2).
//   Tốn Đá (Sơ/Trung/Cao theo bậc) + Hồn Thạch; +10↑ thêm Tinh Thể Yêu Vương.
//   Có tỉ lệ thất bại — FAIL = mất liệu, KHÔNG tụt cấp (theo chốt thiết kế).
//   Lưu theo itemId: state.enhance[itemId] = plus (0..15).
// ============================================================
import { removeItem } from './inventory.js';

export const MAX_PLUS = 15;
const STONE = { so: 'daCuongHoaSo', trung: 'daCuongHoaTrung', cao: 'daCuongHoaCao' };
export const BOSS_CRYSTAL = 'tinhTheYeuVuong';

// Bảng cường hóa: index = plus HIỆN TẠI (đi từ +plus -> +(plus+1)).
const TABLE = [
  { stone: 'so',    qty: 1, hon: 20,   crys: 0, rate: 1.00 }, // -> +1
  { stone: 'so',    qty: 1, hon: 45,   crys: 0, rate: 1.00 }, // -> +2
  { stone: 'so',    qty: 2, hon: 80,   crys: 0, rate: 1.00 }, // -> +3
  { stone: 'so',    qty: 2, hon: 130,  crys: 0, rate: 0.95 }, // -> +4
  { stone: 'so',    qty: 3, hon: 200,  crys: 0, rate: 0.90 }, // -> +5
  { stone: 'trung', qty: 2, hon: 290,  crys: 0, rate: 0.85 }, // -> +6
  { stone: 'trung', qty: 2, hon: 400,  crys: 0, rate: 0.78 }, // -> +7
  { stone: 'trung', qty: 3, hon: 540,  crys: 0, rate: 0.70 }, // -> +8
  { stone: 'trung', qty: 3, hon: 720,  crys: 0, rate: 0.62 }, // -> +9
  { stone: 'trung', qty: 4, hon: 950,  crys: 0, rate: 0.55 }, // -> +10
  { stone: 'cao',   qty: 3, hon: 1250, crys: 1, rate: 0.45 }, // -> +11
  { stone: 'cao',   qty: 4, hon: 1650, crys: 1, rate: 0.38 }, // -> +12
  { stone: 'cao',   qty: 5, hon: 2150, crys: 2, rate: 0.30 }, // -> +13
  { stone: 'cao',   qty: 6, hon: 2800, crys: 2, rate: 0.23 }, // -> +14
  { stone: 'cao',   qty: 8, hon: 3600, crys: 3, rate: 0.16 }, // -> +15
];

export function gearPlus(inst) { return (inst && inst.plus) || 0; }    // cấp cường hóa của 1 instance
export function enhanceMul(plus) { return 1 + (plus || 0) * 0.08; }    // +8% / cấp

// Yêu cầu cho lần cường hóa kế tiếp (null nếu đã +15).
export function enhanceStep(plus) {
  if (plus >= MAX_PLUS) return null;
  const r = TABLE[plus];
  return { next: plus + 1, stoneId: STONE[r.stone], stoneTier: r.stone, stoneQty: r.qty, honThach: r.hon, crystalId: BOSS_CRYSTAL, crystalQty: r.crys, rate: r.rate };
}

// Có đủ liệu để cường hóa instance này không?
export function canEnhance(state, inst) {
  const step = enhanceStep(gearPlus(inst));
  if (!step) return false;
  if ((state.inventory[step.stoneId] || 0) < step.stoneQty) return false;
  if ((state.currencies.honThach || 0) < step.honThach) return false;
  if (step.crystalQty > 0 && (state.inventory[step.crystalId] || 0) < step.crystalQty) return false;
  return true;
}

// Thực hiện 1 lần cường hóa instance. roll (0..1) tùy chọn để test. -> {ok, success, plus}.
export function tryEnhance(state, inst, roll) {
  const plus = gearPlus(inst);
  const step = enhanceStep(plus);
  if (!step || !inst || !canEnhance(state, inst)) return { ok: false };
  // Tiêu liệu — THÀNH hay BẠI đều mất.
  removeItem(state, step.stoneId, step.stoneQty);
  state.currencies.honThach = Math.max(0, (state.currencies.honThach || 0) - step.honThach);
  if (step.crystalQty > 0) removeItem(state, step.crystalId, step.crystalQty);
  const r = (roll == null ? Math.random() : roll);
  const success = r < step.rate;
  if (success) inst.plus = plus + 1;
  return { ok: true, success, plus: gearPlus(inst) };
}
