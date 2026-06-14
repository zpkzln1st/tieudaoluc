// ============================================================
// ENGINE — Hành trình bản đồ (THUẦN). 2 cách di chuyển:
//   • Truyền Tống (Teleport): tức thì, TỐN BẠC = Tổng Level × khoảng cách.
//   • Khinh Công (Travel):   miễn phí, TỐN THỜI GIAN thực = theo khoảng cách.
// Khoảng cách = Euclid theo toạ độ mapX/mapY (đơn vị %). Xa hơn = đắt/lâu hơn.
// ============================================================
import { LOCATIONS } from '../data/locations.js';

// Hằng số cân bằng (chỉnh thoải mái)
const TELE_K = 0.6;     // hệ số phí: Bạc ≈ totalLevel × dist × K
const TELE_MIN = 50;    // phí tối thiểu mỗi lần Truyền Tống
const WALK_MS_PER_UNIT = 3000; // Khinh Công: mỗi đơn vị khoảng cách = 3s

export function locById(id) { return LOCATIONS.find((l) => l.id === id) || null; }

export function mapDistance(fromId, toId) {
  const a = locById(fromId), b = locById(toId);
  if (!a || !b) return 0;
  return Math.hypot(a.mapX - b.mapX, a.mapY - b.mapY);
}

// Phí Truyền Tống (Bạc): theo Tổng Level và khoảng cách.
export function teleportCost(totalLevel, fromId, toId) {
  const d = mapDistance(fromId, toId);
  if (d <= 0) return 0;
  return Math.max(TELE_MIN, Math.round((totalLevel || 1) * d * TELE_K));
}

// Thời gian Khinh Công (ms): theo khoảng cách. (startTravel trong activity.js dùng hàm này.)
export function travelTimeMs(fromId, toId) {
  const d = mapDistance(fromId, toId);
  return Math.max(1000, Math.round(d * WALK_MS_PER_UNIT));
}
