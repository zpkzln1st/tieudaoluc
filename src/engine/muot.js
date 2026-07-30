// ============================================================
// GIỮ CHO BÀN 3D CHẠY MƯỢT — dùng CHUNG cho cả sáu bàn của Thiên Cơ Các.
//
// Máy chơi game bây giờ 90–144Hz (user: Xiaomi 15 · Red Magic đều 120Hz), nên ngân sách một
// khung chỉ còn ~8ms. Thứ ăn hết ngân sách trên điện thoại KHÔNG phải số lệnh vẽ mà là SỐ ĐIỂM
// ẢNH: máy DPR 3 mà đặt tỉ lệ 2 thì một khung 915×412 phải tô 1,5 triệu điểm, nhân thêm khử răng
// cưa và một lượt vẽ bóng nữa.
//
// Nên ở đây làm hai việc:
//   1. `taoTuChinh` — TỰ HẠ tỉ lệ điểm ảnh khi khung bắt đầu chậm, tự nâng lại khi máy khoẻ.
//      Không đoán theo tên máy, cứ đo thời gian khung thật rồi chỉnh.
//   2. `nhipDam` — bộ đếm nhịp cho mấy việc KHÔNG cần chạy mỗi khung (bụi bay, nhãn bám...).
//      Ở màn 120Hz, chạy bụi mỗi khung là mỗi giây nạp lại vùng đệm 120 lần cho một thứ mắt
//      thường không phân biệt nổi với 30 lần.
// ============================================================

/** Các nấc tỉ lệ điểm ảnh, từ nét nhất xuống. */
const MUC = [2, 1.75, 1.5, 1.25, 1];

function camUng() {
  try { return window.matchMedia && matchMedia('(pointer:coarse)').matches; } catch (e) { return false; }
}

/**
 * Bộ tự chỉnh tỉ lệ điểm ảnh.
 * @param {Object} renderer  WebGLRenderer
 * @param {Function} datLaiCo  gọi khi đổi tỉ lệ — truyền hàm onResize của bàn (nó setSize lại)
 * @returns {Function} nhip(t) — gọi mỗi khung trong animate, truyền mốc thời gian của rAF
 */
export function taoTuChinh(renderer, datLaiCo) {
  const dpr = window.devicePixelRatio || 1;
  // Máy cảm ứng chặn trần 1,75: màn điện thoại nhỏ mà mật độ điểm ảnh cao, tô tới 2 lần là phí —
  // mắt không thấy nét hơn mà khung thì rớt.
  const tran = camUng() ? 1.75 : 2;
  let i = 0;
  while (i < MUC.length - 1 && MUC[i] > tran) i++;
  const dat = () => renderer.setPixelRatio(Math.min(dpr, MUC[i]));
  dat();

  let truoc = 0, cong = 0, dem = 0, daHa = 0;
  return function nhip(t) {
    if (!t) return;
    if (!truoc) { truoc = t; return; }
    const dt = t - truoc; truoc = t;
    if (dt > 200) return;                  // vừa quay lại tab / vừa mở khoá máy — bỏ mẫu này
    cong += dt; dem++;
    if (dem < 45) return;                  // ~0,4–0,75 giây một lần cân nhắc
    const tb = cong / dem; cong = 0; dem = 0;
    if (tb > 20 && i < MUC.length - 1) { i++; daHa++; dat(); datLaiCo(); }        // dưới ~50 khung/giây thì hạ
    else if (tb < 9 && daHa > 0 && i > 0) { i--; daHa--; dat(); datLaiCo(); }     // trên ~110 khung/giây thì trả lại
  };
}

/**
 * Bộ đếm nhịp: trả về hàm `xong(t)` chỉ trả `true` khi đã qua `ms` kể từ lần trả `true` trước.
 * Dùng cho việc mắt không phân biệt được ở nhịp cao (bụi bay, cập nhật nhãn).
 */
export function nhipDam(ms) {
  let moc = 0;
  // ⚠ Viết theo lối "chưa đủ thì thôi" chứ đừng `t - moc < ms`: khung đầu tiên `animate()` được
  //   gọi tay nên `t` là undefined, phép trừ ra NaN — so kiểu kia thì NaN < ms là false ⇒ nó nhận
  //   luôn và ghi `moc = undefined`, từ đó về sau mọi phép so đều NaN và bộ đếm CHẾT HẲN.
  return function (t) {
    if (!(t - moc >= ms)) return false;
    moc = t;
    return true;
  };
}
