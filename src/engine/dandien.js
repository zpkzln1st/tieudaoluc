// ============================================================
// ENGINE — ĐAN ĐIỀN (Tinh · Khí · Thần)
// ============================================================
// Đọc `state.danDien` rồi trả về tổng cộng thêm. HÀM THUẦN: cùng một save luôn cho cùng một số.
// Không đụng đồng hồ, không bốc số — deriveCombat gọi nó mỗi nhịp vẽ.
import { DD_NHANH, DD_O, DD_NGAN_SACH, DD_TRONG_SO, DD_HON_THUONG, ddMoiVien } from '../data/dandien.js';

/** Bảng ô đã lấp: { tinh:[9 số], khi:[...], than:[...] }. Vá save cũ ngay tại đây. */
export function ddBang(state) {
  const s = (state && state.danDien) || {};
  const ra = {};
  for (const nh of DD_NHANH) {
    const cu = Array.isArray(s[nh]) ? s[nh] : [];
    // ⚠ KẸP theo DD_O: save cũ (hoặc save sửa tay) có thể mang số lớn hơn số ô thật.
    ra[nh] = DD_O.map((max, i) => Math.max(0, Math.min(max, Math.floor(cu[i] || 0))));
  }
  return ra;
}

/** Số ô đã lấp / tổng ô của một nhánh. */
export function ddDemNhanh(state, nhanh) {
  const b = ddBang(state)[nhanh] || [];
  return { da: b.reduce((s, n) => s + n, 0), tong: DD_O.reduce((s, n) => s + n, 0) };
}

/** Số ô đã lấp / tổng ô CẢ LƯỚI. */
export function ddDemTong(state) {
  let da = 0, tong = 0;
  for (const nh of DD_NHANH) { const d = ddDemNhanh(state, nh); da += d.da; tong += d.tong; }
  return { da, tong };
}

/** Những phẩm đã mở Đan Hồn: đủ ô ở CẢ BA nhánh. Trả mảng phẩm (1..9). */
export function ddHonDaMo(state) {
  const b = ddBang(state);
  const ra = [];
  for (let p = 1; p <= 9; p++) {
    if (DD_NHANH.every((nh) => (b[nh][p - 1] || 0) >= DD_O[p - 1])) ra.push(p);
  }
  return ra;
}

/**
 * Tổng cộng thêm từ Đan Điền.
 * ⚠ Đan Hồn nhân LÊN TRÊN tổng của chính ba nhánh, không phải cộng phẳng vào ngân sách —
 *   nếu cộng phẳng thì người mới mở một mốc Đan Hồn đã nhận bằng người lấp nửa lưới.
 */
export function danDienBonus(state) {
  const b = ddBang(state);
  const ra = { atkPct: 0, defPct: 0, hpPct: 0, nlMax: 0, nlRegenPct: 0, menhTrung: 0, ccGiamPct: 0, khangPct: 0 };
  for (const nh of DD_NHANH) {
    for (let p = 1; p <= 9; p++) {
      const n = b[nh][p - 1] || 0; if (!n) continue;
      const v = ddMoiVien(nh, p);
      for (const k in v) ra[k] += v[k] * n;
    }
  }
  const hon = ddHonDaMo(state).reduce((s, p) => s + (DD_HON_THUONG[p - 1] || 0), 0);
  if (hon) for (const k in ra) ra[k] *= (1 + hon);
  ra.honPct = hon;
  // ĐIỂM LUYỆN — cộng PHẲNG, KHÔNG ăn Đan Hồn (Đan Hồn là thưởng của việc lấp lưới, không phải
  // thưởng của việc quay). Trần luyện đã neo vào số viên đã nạp nên nó không thành đường tắt.
  const l = (state && state.danDien && state.danDien.luyen) || {};
  ra.luyenTinh = Math.max(0, l.tinh || 0);
  ra.luyenKhi = Math.max(0, l.khi || 0);
  ra.luyenThan = Math.max(0, l.than || 0);
  return ra;
}

/** Nạp MỘT viên vào lưới. Trả true nếu lấp được (ô còn trống). KHÔNG đụng túi đồ. */
export function ddNap(state, nhanh, pham) {
  if (!DD_NHANH.includes(nhanh) || !(pham >= 1 && pham <= 9)) return false;
  if (!state.danDien) state.danDien = {};
  const b = ddBang(state);
  if ((b[nhanh][pham - 1] || 0) >= DD_O[pham - 1]) return false;   // ô đã đầy
  b[nhanh][pham - 1]++;
  state.danDien = b;
  return true;
}

/** Kiểm ngân sách: lưới đầy phải ra ĐÚNG bảng DD_NGAN_SACH (trước Đan Hồn). Dùng cho bài kiểm. */
export function ddKiemNganSach() {
  const day = {};
  for (const nh of DD_NHANH) day[nh] = DD_O.slice();
  const bs = danDienBonus({ danDien: day });
  const cho = { atkPct: 0, defPct: 0, hpPct: 0, nlMax: 0, nlRegenPct: 0, menhTrung: 0, ccGiamPct: 0, khangPct: 0 };
  for (const nh of DD_NHANH) for (const k in DD_NGAN_SACH[nh]) cho[k] += DD_NGAN_SACH[nh][k];
  const honDay = DD_HON_THUONG.reduce((s, v) => s + v, 0);
  return { thuc: bs, cho, honDay, trongSo: DD_TRONG_SO };
}
