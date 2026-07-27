// ============================================================
// CHỮ HÁN — NGUỒN CHÂN LÝ DUY NHẤT + máy tự kiểm.
//
// Game dùng ĐÚNG HAI font Hán, và KHÔNG GỘP ĐƯỢC LÀM MỘT:
//   · Ma Shan Zheng — thư pháp mềm, dùng cho TIÊU ĐỀ. ⚠ CHỈ CÓ GIẢN THỂ.
//   · Noto Serif TC — Tống thể, dùng cho CHỮ TRÊN QUÂN CỜ TƯỚNG. Bắt buộc PHỒN THỂ
//     (車 馬 將 帥 là mặt chữ chuẩn của cờ tướng; viết 车马将帅 là sai).
//   Ma Shan Zheng không có 車馬將帥漢樓… nên không thể gánh phần cờ tướng.
//
// Vì subset `&text=` trong index.html phải khai bằng tay, rất dễ quên khi thêm chữ mới
// (đã dính 2 lần: 車馬將帥 hôm 25-07, 樓 hôm 27-07 — cả hai đều lặng lẽ rơi về serif,
// không báo lỗi gì). Nên ở đây:
//   1. Gom TẤT CẢ chữ Hán của game vào 2 hằng số dưới đây.
//   2. `kiemHanFont()` VẼ RA CANVAS rồi so pixel với serif -> glyph nào rơi thì kêu trong Console.
//      ⚠ Đừng dùng document.fonts.check(): nó trả true cho cả glyph font KHÔNG có.
//
// THÊM CHỮ HÁN MỚI: thêm vào đúng hằng số dưới đây, RỒI thêm vào chuỗi `&text=` tương ứng
// trong <head> index.html. Quên bước 2 thì mở game là Console kêu ngay.
// ============================================================

// Ma Shan Zheng (tiêu đề) — mọi chữ ở đây PHẢI là giản thể hoặc chữ chung hai lối viết.
export const HAN_TIEU_DE = '五子棋象西洋酒楼';
// Noto Serif TC (quân + chữ trên bàn Cờ Tướng) — phồn thể.
export const HAN_CO_TUONG = '帥仕相傌俥炮兵將士象馬車砲卒楚河漢界';

const FONT_TIEU_DE = '"Ma Shan Zheng"';
const FONT_CO_TUONG = '"Noto Serif TC"';

// Vẽ 1 glyph ra canvas rồi trả mảng pixel — cách DUY NHẤT đáng tin để biết font có thật sự áp dụng.
function veGlyph(ch, font, px) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = px;
  const x = cv.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, px, px);
  x.fillStyle = '#000';
  x.font = Math.round(px * 0.72) + 'px ' + font;
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(ch, px / 2, px / 2);
  return x.getImageData(0, 0, px, px).data;
}
function soPixel(a, b) { let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) > 30) n++; return n; }

/** Glyph này có THẬT SỰ vẽ bằng `font` không (khác hẳn serif)? */
export function glyphCoTrongFont(ch, font) {
  try { return soPixel(veGlyph(ch, font, 100), veGlyph(ch, 'serif', 100)) > 150; }
  catch (e) { return true; }   // không đo được thì thôi, đừng báo động giả
}

/**
 * Soát toàn bộ chữ Hán của game. Trả danh sách chữ bị rơi font; đồng thời kêu trong Console.
 * TỰ NẠP cả hai font trước khi đo — Noto Serif TC vốn chỉ được nạp khi vào ván Cờ Tướng,
 * đo sớm hơn thì cả 18 chữ đều báo rơi (báo nhầm, đã dính lúc viết hàm này).
 */
export async function kiemHanFont() {
  const hong = [];
  try {
    await Promise.all([
      document.fonts.load('400 26px ' + FONT_TIEU_DE, HAN_TIEU_DE),
      document.fonts.load('700 100px ' + FONT_CO_TUONG, HAN_CO_TUONG),
    ]);
    await document.fonts.ready;
  } catch (e) { return []; }
  const soat = (chuoi, font, nhan) => {
    for (const ch of chuoi) if (!glyphCoTrongFont(ch, font)) hong.push({ ch, font: nhan });
  };
  try {
    soat(HAN_TIEU_DE, FONT_TIEU_DE, 'Ma Shan Zheng');
    soat(HAN_CO_TUONG, FONT_CO_TUONG, 'Noto Serif TC');
  } catch (e) { return []; }
  if (hong.length) {
    console.warn(
      '[Chữ Hán] ' + hong.length + ' chữ ĐANG RƠI VỀ FONT HỆ THỐNG: ' +
      hong.map((h) => h.ch + ' (' + h.font + ')').join(' · ') +
      '\n→ Thêm chữ đó vào chuỗi &text= tương ứng trong <head> index.html.' +
      '\n→ Nếu là chữ PHỒN THỂ mà đòi Ma Shan Zheng thì vô ích: font đó chỉ có giản thể.'
    );
  }
  return hong;
}
