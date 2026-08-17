// ============================================================
// ENGINE — TÍNH NĂNG: cờ bật/tắt của máy chủ. THUẦN, không đọc mạng.
//
// ⚠⚠ FAIL CLOSED ở cả bốn cửa. Cờ chỉ mở khi ĐỦ CẢ BỐN:
//    1. mã nằm trong danh sách cho phép (src/data/tinhnang.js),
//    2. có dòng đệm trong bản lưu,
//    3. `bat` bằng true,
//    4. `chiTacGia` false, hoặc người đang chơi đúng là tác giả.
//    Thiếu vế nào cũng ra TẮT. Mất mạng, chưa chạy tệp SQL, gõ nhầm mã — tất cả đều ra TẮT.
//
// ⚠ Khác `su_kien`: sự kiện ghi MỐC GIỜ nên mất mạng vẫn tự đóng đúng hạn. Tính năng ghi CÔNG TẮC,
//   nên mất mạng thì giữ nguyên trạng thái đã đệm. Cố ý: một hệ thống không có ngày hết hạn, và
//   coi là tắt giữa chừng thì người chơi đang đứng trong màn đó bị hất ra.
//
// ⚠ Tệp này KHÔNG import cloud.js. Đọc mạng là việc của tầng trên; ở đây chỉ có phép suy.
// ============================================================
import { TINH_NANG_BY_MA } from '../data/tinhnang.js';

export function ensureTinhNang(state) {
  if (!state.tinhNang || typeof state.tinhNang !== 'object') state.tinhNang = {};
  const s = state.tinhNang;
  if (!s.dem || typeof s.dem !== 'object') s.dem = {};   // ma -> { bat, chiTacGia, cauHinh }
  if (typeof s.docLuc !== 'number') s.docLuc = 0;        // lần đọc bảng gần nhất
  return s;
}

/**
 * Nhận các dòng đọc từ bảng `tinh_nang` rồi đệm vào bản lưu. Gọi được nhiều lần.
 * `rows` = [{ ma, bat, chi_tac_gia, cau_hinh }].
 * ⚠ Mã lạ bị BỎ ngay tại đây — máy chủ có thể mọc thêm dòng mà bản game này chưa biết đọc.
 * ⚠ Dòng không còn trong `rows` thì GỠ khỏi đệm. Tác giả xoá cờ thì client phải theo, mà theo về
 *   phía TẮT chứ không phải giữ lại bản cũ đang bật.
 */
export function demTinhNang(state, rows, now) {
  const s = ensureTinhNang(state);
  const moi = {};
  for (const r of rows || []) {
    if (!r || !r.ma || !TINH_NANG_BY_MA[r.ma]) continue;
    moi[r.ma] = {
      bat: !!r.bat,
      // ⚠ Thiếu cột (bản lưu cũ, máy chủ trả thiếu) thì coi là CHỈ TÁC GIẢ, khớp mặc định của bảng.
      chiTacGia: r.chi_tac_gia === undefined ? true : !!r.chi_tac_gia,
      // ⚠ `typeof [] === 'object'` — thiếu vế `!Array.isArray` là một MẢNG lọt thẳng vào cấu hình.
      //   Máy chủ đã chặn bằng `jsonb_typeof(cau_hinh) = 'object'`, nhưng bản lưu là thứ máy người
      //   chơi gửi lên nên client vẫn phải tự soi.
      cauHinh: (r.cau_hinh && typeof r.cau_hinh === 'object' && !Array.isArray(r.cau_hinh)) ? r.cau_hinh : {},
    };
  }
  s.dem = moi;
  s.docLuc = now || 0;
  return s.dem;
}

/**
 * Tính năng `ma` có mở với NGƯỜI NÀY không. Đây là hàm mọi màn mới phải hỏi trước khi vẽ.
 * `laTacGia` để cờ `chi_tac_gia` chạy thử trên live trước khi mở cho cả làng.
 */
export function tinhNangMo(state, ma, laTacGia) {
  if (!ma || !TINH_NANG_BY_MA[ma]) return false;
  const d = ensureTinhNang(state).dem[ma];
  if (!d || !d.bat) return false;
  if (d.chiTacGia && !laTacGia) return false;
  return true;
}

/** Cờ đổi luật của một tính năng ĐANG MỞ. Chưa mở thì trả {} — đọc cấu hình của cờ tắt là vô nghĩa. */
export function tinhNangCauHinh(state, ma, laTacGia) {
  if (!tinhNangMo(state, ma, laTacGia)) return {};
  return ensureTinhNang(state).dem[ma].cauHinh || {};
}

/**
 * Trạng thái để VẼ ở tab Tính Năng. Bốn giá trị:
 *   `chuaDoc` — chưa đọc được dòng nào (chưa chạy tệp SQL, hoặc mất mạng ngay từ đầu)
 *   `tat`     — có dòng, `bat` false
 *   `thu`     — bật, nhưng chỉ tác giả thấy
 *   `mo`      — bật cho cả giang hồ
 * ⚠ Hàm này CHỈ để vẽ. Quyết định cho vẽ hay không thì hỏi `tinhNangMo`.
 */
export function tinhNangTrangThai(state, ma) {
  const d = ensureTinhNang(state).dem[ma];
  if (!d) return 'chuaDoc';
  if (!d.bat) return 'tat';
  return d.chiTacGia ? 'thu' : 'mo';
}

/** Số tính năng đang bật (kể cả loại chỉ tác giả thấy). Dùng cho con số nhỏ ở cột dọc Lệnh Bài. */
export function tinhNangDangBat(state) {
  const dem = ensureTinhNang(state).dem;
  return Object.keys(dem).filter((ma) => dem[ma] && dem[ma].bat).length;
}
