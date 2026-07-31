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
const MUC = [3, 2.5, 2, 1.75, 1.5, 1.25, 1];

/** Nấc DÙNG ĐỂ ĐO nhịp màn hình lúc mới vào — thấp cho chắc chắn không phải mình làm nghẽn. */
const MUC_DO = 1.25;

/**
 * Bộ tự chỉnh tỉ lệ điểm ảnh.
 *
 * ⚠ Bản cũ chặn cứng trần 1,75 trên máy cảm ứng vì sợ tốn điểm ảnh. Đo lại trên máy DPR 3
 * (`_mockup/_tl_net.html`): đệm canvas chỉ 1830×824 trong khi màn cần 2745×1236 ⇒ CẢNH BỊ VẼ
 * THIẾU 1,5–1,7 LẦN, mặt bài nhìn mờ (user báo "lá bài xoay ngang chưa sắc nét"). Ảnh mặt bài
 * thì thừa nét: ô atlas 220×308 mà lá trên màn chỉ 91×64 điểm ảnh — tức là đang THU NHỎ 0,4 lần.
 * ⇒ Bỏ trần cứng, mặc định vẽ ĐÚNG độ phân giải màn (chặn 3), để bộ tự chỉnh lo phần tốc độ.
 *
 * ⚠ Và ngưỡng "chậm" phải theo NHỊP MÀN HÌNH THẬT, đừng chặn cứng 20ms: máy 120Hz thì 20ms đã là
 * rớt nửa số khung, còn trình duyệt khoá 60Hz thì 16,7ms là bình thường mà điều kiện nâng lại
 * (`< 9ms`) KHÔNG BAO GIỜ đạt ⇒ hạ một lần là kẹt ở nấc thấp tới hết phiên.
 * Nên: 40 khung đầu chạy ở nấc thấp CHỈ ĐỂ ĐO nhịp màn (đo ở nấc cao thì đo trúng chính độ chậm
 * của mình), xong mới nhảy lên nấc nét nhất rồi so với nhịp đó.
 *
 * @param {Object} renderer  WebGLRenderer
 * @param {Function} datLaiCo  gọi khi đổi tỉ lệ — truyền hàm onResize của bàn (nó setSize lại)
 * @returns {Function} nhip(t) — gọi mỗi khung trong animate, truyền mốc thời gian của rAF
 */
export function taoTuChinh(renderer, datLaiCo) {
  const dpr = window.devicePixelRatio || 1;
  let i = 0;
  while (i < MUC.length - 1 && MUC[i] > dpr) i++;      // nấc nét nhất = đúng DPR của màn (trần 3)
  const dinh = i;
  const dat = () => renderer.setPixelRatio(Math.min(dpr, MUC[i]));

  let nhipMan = 0, mau = [], daDo = 0;
  renderer.setPixelRatio(Math.min(dpr, MUC_DO));       // giai đoạn ĐO
  let truoc = 0, cong = 0, dem = 0;
  // Nấc CAO NHẤT đã tự chứng minh là chạy không nổi. Không bao giờ quay lại nấc đó nữa —
  // thiếu chốt này thì hạ/nâng cứ đập qua đập lại, mỗi lần đổi là một nhịp canh khung, thấy giật.
  let capCam = -1;

  return function nhip(t) {
    if (!t) return;
    if (!truoc) { truoc = t; return; }
    const dt = t - truoc; truoc = t;
    if (dt > 200) return;                  // vừa quay lại tab / vừa mở khoá máy — bỏ mẫu này
    if (!nhipMan) {
      // Trung vị 40 khung — trung bình thì một khung rớt là lệch hết.
      mau.push(dt);
      if (++daDo < 40) return;
      mau.sort((a, b) => a - b);
      nhipMan = Math.max(6, mau[20]);      // sàn 6ms: đừng tin một con số vô lý rồi tự hạ mãi
      mau = [];
      i = dinh; dat(); datLaiCo();         // đo xong thì lên nấc nét nhất
      return;
    }
    cong += dt; dem++;
    if (dem < 45) return;                  // ~0,4–0,75 giây một lần cân nhắc
    const tb = cong / dem; cong = 0; dem = 0;
    if (tb > nhipMan * 1.35 && i < MUC.length - 1) { capCam = i; i++; dat(); datLaiCo(); }
    else if (tb < nhipMan * 1.08 && i - 1 > capCam && i > 0) { i--; dat(); datLaiCo(); }
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
