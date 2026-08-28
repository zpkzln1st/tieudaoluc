// CẦM ĐÀI — bộ phát khúc mục do người chơi tự bấm.
//
// ⚠ TÁCH HẲN khỏi `nhac.js`. Nhạc nền tự đổi theo màn và lặp vô tận; Cầm Đài do người chơi chọn
//   bài, tua, lặp, xáo. Nhét chung một thẻ phát thì hai đường tranh nhau `src` và cắt tiếng nhau.
//   Nhưng ĐƯỜNG CONG ÂM LƯỢNG thì dùng chung — một thứ không mang hai công thức.
//
// Luật sống chung: Cầm Đài phát thì nhạc nền NGHỈ; Cầm Đài dừng thì nhạc nền trở lại. Bên gọi
// (`main.js`) lo việc đó, engine này chỉ báo ra qua `datBoBao`.

import { amLuongThat } from './nhac.js';
import { camDaiDuong } from '../data/camdai.js';

export { amLuongThat };

// ============================================================
// PHẦN THUẦN — không đụng DOM, bài kiểm chạy thẳng được
// ============================================================

export const LAP_KIEU = ['khong', 'tatca', 'mot'];

/**
 * Nhãn tiếng Việt của kiểu lặp. Một chỗ duy nhất, khỏi hai nơi ghi hai kiểu.
 * ⚠ Chữ phải là lời NGƯỜI CHƠI nói. Bản đầu ghi "Lặp cả khúc mục" — chủ dự án bác ngay vì nghe
 *   như máy dịch. "Khúc mục" là từ tôi tự đặt, không ai dùng.
 */
export const LAP_TEN = { khong: 'Không Lặp', tatca: 'Lặp Tất Cả', mot: 'Lặp Một Bài' };

/**
 * Khúc kế tiếp.
 * @param n     số khúc trong mục
 * @param i     chỗ đang đứng
 * @param xao   có xáo trộn không
 * @param lap   'khong' | 'tatca' | 'mot'
 * @param tuTay người chơi TỰ bấm nút kế, hay là bài vừa hết tự chạy sang
 * @param ngau  hàm sinh số 0..1
 * @returns chỗ kế tiếp, hoặc -1 nghĩa là DỪNG HẲN
 *
 * ⚠ `lap:'mot'` chỉ giữ nguyên bài khi bài TỰ HẾT. Người chơi bấm nút kế mà vẫn đứng im một chỗ
 *   thì nút trông như hỏng — bấm tay luôn phải nhảy bài.
 */
export function khucKeTiep(n, i, xao, lap, tuTay, ngau) {
  if (n <= 0) return -1;
  if (n === 1) return (lap === 'khong' && !tuTay) ? -1 : 0;
  if (lap === 'mot' && !tuTay) return i;
  if (xao) {
    const r = ngau || Math.random;
    let k = i;
    for (let d = 0; d < 24 && k === i; d++) k = Math.floor(r() * n) % n;
    return k === i ? (i + 1) % n : k;
  }
  if (i + 1 < n) return i + 1;
  return (lap === 'khong' && !tuTay) ? -1 : 0;
}

/** Khúc trước. Bấm tay nên luôn nhảy, và luôn quay vòng — không có đường cụt. */
export function khucTruoc(n, i, xao, ngau) {
  if (n <= 0) return -1;
  if (n === 1) return 0;
  if (xao) return khucKeTiep(n, i, true, 'tatca', true, ngau);
  return (i - 1 + n) % n;
}

/**
 * Giây -> "phút:giây".
 * ⚠ Số giây phải đệm 0 cho đủ hai chữ: 3:5 đọc ra ba phút năm giây thì sai, phải là 3:05.
 */
export function dinhDangThoiGian(giay) {
  const g = Math.max(0, Math.floor(Number(giay) || 0));
  const p = Math.floor(g / 60);
  const d = g % 60;
  return p + ':' + (d < 10 ? '0' : '') + d;
}

// ============================================================
// BỘ PHÁT
// ============================================================

let _the = null;          // thẻ <audio> duy nhất
let _ma = '';             // mã khúc đang nạp
let _nac = 55;            // nấc trên thanh trượt
let _bao = null;          // hàm báo ra ngoài: (viec) => void
let _daBaoLoi = {};

function bao(viec) { if (_bao) { try { _bao(viec); } catch (e) {} } }

function taoThe() {
  const a = new Audio();
  a.preload = 'metadata';
  a.volume = amLuongThat(_nac);
  a.addEventListener('timeupdate', () => bao('nhip'));
  a.addEventListener('loadedmetadata', () => bao('nhip'));
  a.addEventListener('play', () => bao('doiTrangThai'));
  a.addEventListener('pause', () => bao('doiTrangThai'));
  a.addEventListener('ended', () => bao('het'));
  return a;
}

function the() { if (!_the) _the = taoThe(); return _the; }

/** Nối hàm báo. Bên gọi dùng nó để cập nhật giao diện, KHÔNG đọc thẻ audio bằng getter Alpine. */
export function datBoBao(fn) { _bao = typeof fn === 'function' ? fn : null; }

/**
 * Nạp một khúc. `tuPhat` = nạp xong phát luôn.
 * ⚠ `play()` trả về lời hứa và có thể bị từ chối: `NotAllowedError` là trình duyệt chặn tiếng,
 *   `AbortError` là do đổi bài nhanh quá. Cả hai đều KHÔNG được làm vỡ game.
 */
export function datKhuc(ma, tuPhat) {
  if (!ma) return;
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
  try {
    const a = the();
    if (_ma !== ma) {
      a.src = camDaiDuong(ma);
      a.currentTime = 0;
      _ma = ma;
      a.onerror = () => {
        if (_daBaoLoi[ma]) return;
        _daBaoLoi[ma] = 1;
        console.warn('[camdai] khong nap duoc ' + camDaiDuong(ma));
        bao('loi');
      };
    }
    if (tuPhat) phat();
  } catch (e) { /* hong nhac KHONG duoc lam vo game */ }
}

export function phat() {
  if (!_the) return;
  try {
    const p = _the.play();
    if (p && p.catch) p.catch(() => { bao('doiTrangThai'); });
  } catch (e) {}
}

export function tamDung() { if (_the) { try { _the.pause(); } catch (e) {} } }

export function dungHan() {
  if (!_the) return;
  try { _the.pause(); _the.currentTime = 0; } catch (e) {}
  bao('doiTrangThai');
}

/** Tua tới giây `g`. */
export function datGiay(g) {
  if (!_the) return;
  try {
    const t = tongGiay();
    _the.currentTime = Math.max(0, Math.min(t || 0, Number(g) || 0));
    bao('nhip');
  } catch (e) {}
}

export function datAmLuong(nac) {
  _nac = Math.max(0, Math.min(100, Number(nac) || 0));
  if (_the) { try { _the.volume = amLuongThat(_nac); } catch (e) {} }
}

export function dangPhat() { return !!(_the && !_the.paused && !_the.ended); }
export function giay() { return _the ? (_the.currentTime || 0) : 0; }
export function tongGiay() { const t = _the ? _the.duration : 0; return (isFinite(t) && t > 0) ? t : 0; }
export function maDangNap() { return _ma; }
