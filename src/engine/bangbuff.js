// ============================================================
// ENGINE — BUFF TỪ BANG PHÁI. THUẦN, CHỈ ĐỌC state.
//
// ⚠ Vì sao tách riêng khỏi engine/bangphai.js: hai chỗ tiêu thụ buff là
//   · engine/stats.js  (derivedStats — cộng % chỉ số, cùng tầng với Danh Hiệu / Vạn Vật Phổ / Bộ Trang)
//   · engine/activity.js (effDenom — tốc độ làm nghề)
// mà engine/bangphai.js lại nạp data/combat.js, engine/bots.js, engine/danhsi.js... Nếu bắt hai file
// trên nạp cả cục đó thì thành vòng import. File này KHÔNG import gì ngoài bảng số.
//
// ⚠ 0 GIÁ TRỊ NÀO ĐƯỢC LẤY TỪ CHỖ KHÁC: chỉ đọc state.bangPhai. Không có bang -> trả 0 sạch.
// ============================================================
import { KY_NANG_BY_ID, CP_BUFF_HANG } from '../data/bangphai.js';

const Z = { atkPct: 0, defPct: 0, hpPct: 0, allPct: 0, expPct: 0, dropPct: 0, bacPct: 0, nghePct: 0, ngheExpPct: 0 };

/** Người chơi có đang ở trong bang không (chỉ có bang do mình lập). */
export function coBang(state) {
  const b = state && state.bangPhai;
  return !!(b && b.bang);
}

/**
 * Tổng % từ CÂY KĨ NĂNG BANG đã học. Trả đủ mọi khoá, luôn là số.
 * Cố ý gộp cả khoá không phải chỉ số (nghePct/ngheExpPct) vào một chỗ cho dễ soát trần.
 */
export function bangKyNangBonus(state) {
  const out = Object.assign({}, Z);
  const b = state && state.bangPhai;
  if (!b || !b.bang) return out;
  const kn = b.bang.kyNang || {};
  for (const id in kn) {
    const def = KY_NANG_BY_ID[id]; if (!def) continue;
    const lv = Math.max(0, Math.min(def.maxLv, kn[id] | 0));
    if (lv > 0 && out[def.key] != null) out[def.key] += def.moiCap * lv;
  }
  return out;
}

/** Tụ Linh Trì: +2% EXP Chiến Đấu mỗi cấp, cho cả bang. Trả dạng tỉ lệ (0.02 = 2%). */
export function bangTuLinhTri(state) {
  const b = state && state.bangPhai;
  if (!b || !b.bang) return 0;
  return Math.max(0, Math.min(10, (b.bang.congTrinh && b.bang.congTrinh.tuLinhTri) | 0)) * 0.02;
}

/** Gộp mọi nguồn EXP Chiến Đấu từ bang (kĩ năng + Tụ Linh Trì). */
export function bangExpBonus(state) { return bangKyNangBonus(state).expPct + bangTuLinhTri(state); }

/**
 * Buff nghề tại MỘT VÙNG: kĩ năng Thổ Mộc Chân Quyết (mọi nơi) + thứ hạng Chinh Phạt của bang
 * ở đúng vùng đó (chỉ nơi bang có thứ hạng). Trả tỉ lệ cộng thẳng vào mẫu tốc độ.
 */
export function bangNgheBonus(state, locId) {
  const b = state && state.bangPhai;
  if (!b || !b.bang) return 0;
  let v = bangKyNangBonus(state).nghePct;
  const h = (b.bang.hangVung && b.bang.hangVung[locId]) | 0;   // 1..3, 0 = không có hạng
  if (h >= 1 && h <= CP_BUFF_HANG.length) v += CP_BUFF_HANG[h - 1];
  return v;
}

/** Buff EXP nghề (Toạ Quan Quyết) — dùng chung cho mọi nghề. */
export function bangNgheExpBonus(state) { return bangKyNangBonus(state).ngheExpPct; }
