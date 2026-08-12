// ============================================================
// ENGINE — ĐỐN NGỘ CẢNH (Trùng Sinh nghề). THUẦN, chạy được cả trên máy chủ.
//
// state.ngoCanh = { <skillId>: { ts: <số lần trùng sinh>, nut: { <nutId>: <bậc> } } }
// Điểm chưa tiêu = ts * DIEM_MOI_LAN - (tổng điểm đã bỏ vào các nút). Không lưu rời để khỏi lệch.
// ============================================================
import { NGO_CANH_NUT, NGO_CANH_BY_ID, TRUNG_SINH_MAX, DIEM_MOI_LAN } from '../data/ngocanh.js';
import { MAX_LEVEL, levelFromXp } from './leveling.js';

export function ensureNgoCanh(state) {
  if (!state.ngoCanh || typeof state.ngoCanh !== 'object') state.ngoCanh = {};
  return state.ngoCanh;
}
function oCua(state, skillId) {
  const s = ensureNgoCanh(state);
  if (!s[skillId] || typeof s[skillId] !== 'object') s[skillId] = { ts: 0, nut: {} };
  if (typeof s[skillId].ts !== 'number') s[skillId].ts = 0;
  if (!s[skillId].nut || typeof s[skillId].nut !== 'object') s[skillId].nut = {};
  return s[skillId];
}

export const soTrungSinh = (state, skillId) => oCua(state, skillId).ts;
export const bacNut = (state, skillId, nutId) => oCua(state, skillId).nut[nutId] || 0;

/** Điểm đã tiêu vào bảng của một nghề. */
export function diemDaTieu(state, skillId) {
  const o = oCua(state, skillId);
  let s = 0;
  for (const n of NGO_CANH_NUT) s += (o.nut[n.id] || 0) * n.gia;
  return s;
}
export function diemConLai(state, skillId) {
  return oCua(state, skillId).ts * DIEM_MOI_LAN - diemDaTieu(state, skillId);
}

/** Nghề đã chạm trần cấp chưa — điều kiện DUY NHẤT để Trùng Sinh. */
export function coTheTrungSinh(state, skillId) {
  if (soTrungSinh(state, skillId) >= TRUNG_SINH_MAX) return false;
  return levelFromXp((state.skills[skillId] || {}).xp || 0) >= MAX_LEVEL;
}

/**
 * Trùng Sinh: EXP nghề về 0, số lần +1.
 * ⚠ CHỈ động vào `xp` của nghề đó. `gathered` và `timeMs` là sổ đời người chơi (Thống Kê,
 *   huy hiệu Đại Thành, chống gian lận đọc `tong_gio_lam`) — xoá là mất lịch sử và làm
 *   lệch luôn phép đối chiếu phía máy chủ.
 * ⚠ Đang làm việc của chính nghề đó thì phải DỪNG: cấp về 1 mà việc cấp cao vẫn chạy tiếp
 *   là lỗ hổng cày lậu.
 */
export function trungSinh(state, skillId) {
  if (!coTheTrungSinh(state, skillId)) return false;
  const o = oCua(state, skillId);
  o.ts += 1;
  if (state.skills[skillId]) state.skills[skillId].xp = 0;
  if (state.activity && state.activity.type === 'skill' && state.activity.skillId === skillId) state.activity = null;
  return true;
}

/** Mua thêm một bậc của nút. Trả '' nếu xong, hoặc câu báo lý do không mua được. */
export function muaNut(state, skillId, nutId) {
  const nut = NGO_CANH_BY_ID[nutId];
  if (!nut) return 'Không có nút này.';
  const o = oCua(state, skillId);
  const bac = o.nut[nutId] || 0;
  if (bac >= nut.max) return 'Nút này đã đủ bậc.';
  if (nut.canNut) {
    const c = NGO_CANH_BY_ID[nut.canNut];
    if ((o.nut[nut.canNut] || 0) < c.max) return 'Cần ' + c.ten + ' đủ ' + c.max + ' bậc.';
  }
  if (diemConLai(state, skillId) < nut.gia) return 'Không đủ Điểm Trùng Sinh.';
  o.nut[nutId] = bac + 1;
  return '';
}

/** Trả lại toàn bộ điểm của một nghề (tẩy bảng). Không mất số lần Trùng Sinh. */
export function tayBang(state, skillId) {
  oCua(state, skillId).nut = {};
}

// ============================================================
// HIỆU LỰC — mọi nơi khác đọc qua mấy hàm dưới đây, đừng đọc thẳng state.
// ============================================================

/** % nhân đôi sản vật (0..45). */
export const ncNhanDoiPct = (state, skillId) => bacNut(state, skillId, 'luongDoan') * 15;
/** % ra tài nguyên cao hơn một bậc (0..16). */
export const ncVuotBacPct = (state, skillId) => bacNut(state, skillId, 'thanhKim') * 8;
/** % sản lượng cộng thêm khi nghề ĐANG ở Lv100 (0 hoặc 30). */
export const ncDaiThanhPct = (state, skillId) =>
  (bacNut(state, skillId, 'coThu') && levelFromXp((state.skills[skillId] || {}).xp || 0) >= MAX_LEVEL) ? 30 : 0;
/** % tốc độ khai thác (0..30). */
export const ncTocPct = (state, skillId) => bacNut(state, skillId, 'thuThuc') * 10;
/** Số cấp được giảm ở yêu cầu của mọi việc (0..30). */
export const ncGiamCap = (state, skillId) => bacNut(state, skillId, 'cuuNghiep') * 15;
/** Giờ cộng thêm vào trần treo máy khi đang làm nghề này (0..6). */
export const ncTranGio = (state, skillId) => bacNut(state, skillId, 'nhiDung') * 3;
/** Có bỏ khoá vùng cho nghề này không. */
export const ncBoKhoaVung = (state, skillId) => bacNut(state, skillId, 'voCau') > 0;

/** % EXP cộng cho CHÍNH nghề này (Thục Lộ — chỉ khi cấp còn dưới ngưỡng của bậc đã mua). */
export function ncThucLoPct(state, skillId) {
  const bac = bacNut(state, skillId, 'thucLo');
  if (!bac) return 0;
  const nguong = NGO_CANH_BY_ID.thucLo.nguong[bac - 1];
  return levelFromXp((state.skills[skillId] || {}).xp || 0) < nguong ? NGO_CANH_BY_ID.thucLo.pct : 0;
}

/**
 * % EXP cộng cho nghề `skillId` do Truyền Thừa của MỌI NGHỀ KHÁC.
 * ⚠ Không tính Truyền Thừa của chính nó — nút ghi rõ "mọi nghề khác".
 */
export function ncNgheKhacPct(state, skillId) {
  const s = ensureNgoCanh(state);
  let t = 0;
  for (const k in s) { if (k === skillId) continue; t += (s[k].nut && s[k].nut.truyenThua || 0) * 15; }
  return t;
}

/** Tổng % EXP cộng cho một nghề = Thục Lộ của nó + Truyền Thừa của các nghề khác. */
export const ncExpPct = (state, skillId) => ncThucLoPct(state, skillId) + ncNgheKhacPct(state, skillId);
