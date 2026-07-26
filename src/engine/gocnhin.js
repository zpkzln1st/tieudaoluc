// ============================================================
// GÓC NHÌN BÀN CỜ — người chơi tự chỉnh rồi KHOÁ. MỖI BÀN NHỚ RIÊNG.
// NGUỒN SỰ THẬT DUY NHẤT: state.gocNhin = { coVua, coTuong, nguTu }
//   mỗi ô = { theta, phi, zoom } hoặc null (null = bàn đó tự canh như cũ).
//
// ⚠ LƯU TỈ LỆ, KHÔNG LƯU KHOẢNG CÁCH TUYỆT ĐỐI:
//   bàn Cờ Vua 8×8, Cờ Tướng 9×10, Ngũ Tử Kỳ 15×15 — mỗi bàn có khoảng cách "vừa khung" riêng
//   (đo được 15,0 / 15,4 / 12,4) và còn đổi theo cỡ màn. Ghi thẳng r = 15 thì đổi màn là hỏng.
//   Nên chỉ ghi: góc xoay ngang (theta), góc ngẩng (phi), mức phóng zoom = r / r_vừa_khung.
// ============================================================

const BANS = ['coVua', 'coTuong', 'nguTu'];
const PHI_MIN = 0.16, PHI_MAX = 1.20;    // ngẩng quá thấp thì bàn thành sợi chỉ, quá cao thì mất khối
const ZOOM_MIN = 0.62, ZOOM_MAX = 1.55;  // chặn hai đầu để góc lưu ở máy này không vỡ khung ở máy khác

function norm(t) {                        // gỡ số vòng đã xoay: giữ theta trong [-PI, PI]
  let x = t % (Math.PI * 2);
  if (x > Math.PI) x -= Math.PI * 2; else if (x < -Math.PI) x += Math.PI * 2;
  return x;
}
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function tidy(g) {
  if (!g || typeof g.theta !== 'number' || typeof g.phi !== 'number') return null;
  if (!isFinite(g.theta) || !isFinite(g.phi)) return null;
  const zoom = (typeof g.zoom === 'number' && isFinite(g.zoom)) ? g.zoom : 1;
  return { theta: norm(g.theta), phi: clamp(g.phi, PHI_MIN, PHI_MAX), zoom: clamp(zoom, ZOOM_MIN, ZOOM_MAX) };
}

export function ensureGocNhin(state) {
  const cur = state.gocNhin;
  // Bản đầu từng lưu MỘT góc dùng chung ({theta,phi,zoom} phẳng) — nhận ra bằng việc có khoá 'theta'.
  // Chuyển thành góc riêng của cả ba bàn để người đã khoá không mất góc đang dùng.
  if (cur && typeof cur.theta === 'number') {
    const g = tidy(cur);
    state.gocNhin = { coVua: g, coTuong: g && { ...g }, nguTu: g && { ...g } };
    return state.gocNhin;
  }
  if (!cur || typeof cur !== 'object') state.gocNhin = { coVua: null, coTuong: null, nguTu: null };
  else for (const b of BANS) if (cur[b] === undefined) cur[b] = null;
  return state.gocNhin;
}

/** Góc đã khoá CỦA RIÊNG bàn `ban`, hoặc null nếu bàn đó chưa khoá. ban ∈ 'coVua'|'coTuong'|'nguTu' */
export function getGocNhin(state, ban) {
  const all = state && state.gocNhin;
  if (!all || typeof all !== 'object') return null;
  if (typeof all.theta === 'number') return tidy(all);   // save cũ chưa kịp chạy ensure
  return tidy(all[ban]);
}

/** Khoá góc hiện tại CHO RIÊNG bàn `ban`. g = { theta, phi, zoom } — zoom là TỈ LỆ, không phải khoảng cách. */
export function saveGocNhin(state, ban, g) {
  const t = tidy(g);
  if (!t || BANS.indexOf(ban) < 0) return null;
  ensureGocNhin(state);
  state.gocNhin[ban] = t;
  return t;
}

/** Bỏ khoá RIÊNG bàn `ban` -> bàn đó trở lại góc tự canh ban đầu. */
export function clearGocNhin(state, ban) {
  ensureGocNhin(state);
  if (BANS.indexOf(ban) >= 0) state.gocNhin[ban] = null;
}
