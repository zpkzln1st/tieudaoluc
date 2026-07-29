// ============================================================
// TRÙ MÃ (籌碼) — đồng riêng của các trò cờ bạc. THUẦN, không DOM.
//
// ⚠ LUẬT SỐNG CÒN — user chốt 2026-07-29:
//   "bạc của các trò bài KHÔNG cộng vô bạc của nhân vật, không thôi chơi ván bài
//    giàu mẹ luôn".
//   ⇒ Thắng bài KHÔNG BAO GIỜ sinh ra Bạc. Trù Mã là ngõ CỤT:
//        Bạc ──đổi một chiều──> Trù Mã ──chỉ tiêu trong chiếu bài──> hết
//      KHÔNG có đường đổi ngược. Ai muốn thêm cửa dùng Trù Mã thì cứ thêm,
//      nhưng đừng bao giờ viết hàm đổi Trù Mã về Bạc.
//   ⇒ Nhờ vậy mọi trò bài là SINK Bạc thuần, không đụng cân bằng kinh tế chính
//      (time-to-100 ~577 giờ).
//
// Dùng chung cho mọi trò bài/cờ có cược: Tiến Lên, và Binh Xập Xám sau này.
// ============================================================

/** Vốn mồi cho người mới: đủ ngồi chiếu thấp nhất vài ván mà không phải đổi ngay. */
export const VON_MOI = 5000;

/** Tỉ giá đổi: 1 Bạc = 1 Trù Mã. Giữ 1:1 cho số nhìn quen mắt. */
export const TI_GIA = 1;

/** Các mức đổi bày sẵn ở Sảnh Bài. */
export const MUC_DOI = [1000, 5000, 20000, 100000];

export function ensureTruMa(state) {
  if (!state.truMa) state.truMa = { so: VON_MOI, daDoi: 0, thang: 0, thua: 0 };
  const t = state.truMa;
  if (typeof t.so !== 'number') t.so = VON_MOI;
  if (typeof t.daDoi !== 'number') t.daDoi = 0;   // tổng Bạc đã đổ vào (sink)
  if (typeof t.thang !== 'number') t.thang = 0;   // tổng Trù Mã đã ăn
  if (typeof t.thua !== 'number') t.thua = 0;     // tổng Trù Mã đã chung
  return t;
}

export function soTruMa(state) { return ensureTruMa(state).so; }

/**
 * Đổi Bạc lấy Trù Mã. MỘT CHIỀU — không có hàm ngược lại, và đừng viết.
 * Trả { ok, nhan, loi }. KHÔNG tự trừ Bạc: chỗ gọi trừ, engine chỉ tính và ghi sổ.
 */
export function doiTruMa(state, bac) {
  const t = ensureTruMa(state);
  const b = Math.floor(Math.max(0, bac || 0));
  if (!b) return { ok: false, loi: 'Số Bạc phải lớn hơn 0.' };
  const co = (state.currencies || {}).bac || 0;
  if (co < b) return { ok: false, loi: 'Không đủ Bạc.' };
  const nhan = b * TI_GIA;
  t.so += nhan;
  t.daDoi += b;
  return { ok: true, nhan, tru: b };
}

/** Ăn/chung sau một ván. `n` âm là thua. Trù Mã không cho tụt xuống âm. */
export function ghiVan(state, n) {
  const t = ensureTruMa(state);
  const d = Math.round(n || 0);
  if (d > 0) t.thang += d; else t.thua += -d;
  t.so = Math.max(0, t.so + d);
  return t.so;
}

/** Đủ Trù Mã ngồi chiếu này không (cần gánh nổi ván nặng nhất). */
export function duNgoi(state, can) { return soTruMa(state) >= (can || 0); }
