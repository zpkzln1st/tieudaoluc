// ============================================================
// ENGINE — DÒNG ẨN BỘ TRANG (set bonus). THUẦN, không Alpine.
// Bảng số nằm ở SET_BONUS trong data/gear.js — ở đây chỉ ĐẾM món đang mặc rồi chia về đúng kênh.
//
// VÌ SAO LÀ FILE RIÊNG chứ không nằm trong stats.js: pets.js cũng phải đọc hệ số hiệu lực đan dược,
// mà stats.js đã `import { petBonus } from './pets.js'` — để chung là thành vòng import. File này chỉ
// phụ thuộc data/gear.js (gear.js không import gì cả) nên ai gọi cũng được, không bao giờ tạo vòng.
// ============================================================
import { GEAR, TRANG_SETS } from '../data/gear.js';

export const SET_TIERS = [3, 5, 7];          // cộng dồn: mặc đủ 7 thì ăn cả ba bậc
// PHẨM CHẤT HỢP LỆ của một món Bộ Trang. Đường sinh DUY NHẤT là ghepSetPiece() ->
// instanceFromCatalog() -> chép phẩm catalog = Cổ Bản, nên mọi món bộ thật đều Cổ Bản.
// Chốt chặn này để phòng rò bảng drop: trước đây GEAR_BY_SLOT quên loại equip.set nên quái Lv>=92
// rơi ra món bộ phẩm rác, vẫn bật đủ dòng ẩn 3/5/7 mà không tốn Mảnh nào. Đã vá nguồn rò, nhưng
// save cũ còn giữ mấy món đó — giữ chốt này thì chúng thành trang bị thường, vô hại.
export const SET_QUALITY = 'coBan';
export function isSetPieceInst(inst) { return !!inst && inst.quality === SET_QUALITY; }
export const SET_PCT_KEYS = ['atkPct', 'defPct', 'hpPct', 'allPct'];
export const SET_ELE_KEY = 'congHuong';
export const SET_MISC_KEYS = ['hieuLucDan'];

// ĐẾM MÓN ĐANG MẶC của từng bộ. KHÁC HẲN setOwnedCount() ở main.js — hàm kia đếm SỞ HỮU
// (trong túi HOẶC đang mặc) để chạy thanh tiến độ Bách Trang Các. Lấy nhầm thì để đồ trong túi
// cũng ăn dòng ẩn.
export function equippedSetCount(state) {
  const out = {};
  const eq = (state && state.equipment) || {};
  for (const slot of Object.keys(eq)) {
    const inst = eq[slot];
    if (!inst || !inst.gearId || !isSetPieceInst(inst)) continue;   // phẩm không phải Cổ Bản -> không phải món bộ thật
    // Đọc equip.set từ catalog, KHÔNG suy từ tiền tố id: có món thường trùng tiền tố tên bộ
    // (eq_minh_vuong_khai_giap, eq_kim_quang_tien_phu) mà set = null.
    const key = (((GEAR[inst.gearId] || {}).equip) || {}).set;
    if (key) out[key] = (out[key] || 0) + 1;
  }
  return out;
}

// Gom dòng ẩn của MỌI bộ đang mặc, tách sẵn theo bốn kênh. Khoá gõ sai tên rơi vào `flat` rồi bị
// derivedStats bỏ qua IM LẶNG — đó là lý do bảng SET_BONUS có chú thích phân kênh ngay trên đầu.
export function setBonus(state) {
  const flat = {};
  const pct = { atkPct: 0, defPct: 0, hpPct: 0, allPct: 0 };
  const ele = { kim: 0, moc: 0, thuy: 0, hoa: 0, tho: 0 };
  const misc = { hieuLucDan: 0 };
  const count = equippedSetCount(state);
  for (const key of Object.keys(count)) {
    const s = TRANG_SETS[key];
    if (!s || !s.bonus) continue;
    for (const bac of SET_TIERS) {
      if (count[key] < bac) break;
      const tier = s.bonus[bac];
      if (!tier) continue;
      for (const k of Object.keys(tier)) {
        const v = tier[k];
        if (k === SET_ELE_KEY) { if (s.he && ele[s.he] != null) ele[s.he] += v; }
        else if (pct[k] != null) pct[k] += v;
        else if (misc[k] != null) misc[k] += v;
        else flat[k] = (flat[k] || 0) + v;
      }
    }
  }
  return { flat, pct, ele, misc, count };
}

// Hiệu lực đan dược + thức ăn (dòng ẩn bậc 7 bộ Nhu Tình). Gom vào một hàm để đường ăn của
// người chơi, đường ăn của Linh Thú và chữ hiện trên nút cùng đọc MỘT chỗ — lệch nhau là số trên
// màn hình nói một đằng, máu hồi thật một nẻo.
export function consumableEffMult(state) { return 1 + (setBonus(state).misc.hieuLucDan || 0); }
