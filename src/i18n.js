// ============================================================
// NGÔN NGỮ — LỚP PHỦ DỊCH DOM (English · 中文 phồn thể).
//
// Game VẼ TIẾNG VIỆT y như cũ. Khi settings.ngonNgu != 'vi', bộ quan sát dịch từng
// text node bằng từ điển. Chọn kiến trúc này thay vì sửa template vì:
//   · index.html 17k dòng đang LIVE — gói chuỗi vào hàm dịch là đập cả nền tiếng Việt.
//   · Người chơi tiếng Việt không đổi MỘT BYTE nào: từ điển chỉ nạp (dynamic import)
//     khi đã chọn EN/ZH, quan sát viên không chạy khi 'vi'.
//
// Từ điển hai tầng (src/i18n/dict_en.js · dict_zh.js, MÁY SINH — đừng sửa tay từng dòng):
//   · khoá KHÔNG có '#': tra đúng nguyên văn (tên vật phẩm, nhãn nút).
//   · khoá CÓ '#': mẫu — số trong chuỗi thay bằng '#' rồi tra, dịch xong trả số về
//     đúng thứ tự ("Còn 12 ngày 3 giờ" -> "Còn # ngày # giờ" -> "# days # hours left").
//
// ⚠ KHÔNG dịch: INPUT/TEXTAREA (chữ người chơi gõ), CANVAS (mini-game 3D vẽ tay),
//   SCRIPT/STYLE. Chữ trong canvas là việc của đợt sau, đừng cố ở tầng DOM.
// ⚠ Vòng lặp tự kích: mình ghi nodeValue -> characterData bắn lại -> tra bản dịch
//   TRƯỢT từ điển -> dừng. Không cần cờ chống lặp.
// ============================================================

let TU_DIEN = null;   // Map: nguyên văn -> bản dịch
let MAU = null;       // Map: mẫu có '#' -> bản dịch có '#'
let dangChay = false;

const RE_SO = /\d[\d.,]*/g;

/** Dịch một chuỗi. Trả null nếu không có trong từ điển (giữ nguyên tiếng Việt). */
export function _traDeKiem(s) {
  if (!TU_DIEN || typeof s !== 'string') return null;
  let v = TU_DIEN.get(s);
  if (v !== undefined) return v;
  // ⚠ Dấu '·' MỞ ĐẦU là dấu phân cách của khối bên ngoài ("· 18 phút trước"), không phải chữ.
  //   Coi như khoảng trắng: giữ nguyên, chỉ tra phần lõi. '·' ở GIỮA thì đi luật nối bên dưới.
  const m = /^(\s*(?:·\s*)?)([\s\S]*?)(\s*)$/.exec(s);
  const dau = m[1], giua = m[2], duoi = m[3];
  if (!giua || (dau === '' && duoi === '')) { /* đã tra nguyên văn ở trên */ } else {
    v = TU_DIEN.get(giua);
    if (v !== undefined) return dau + v + duoi;
  }
  if (/\d/.test(giua)) {
    const khoa = giua.replace(RE_SO, '#');
    const mv = MAU.get(khoa);
    if (mv !== undefined) {
      const so = giua.match(RE_SO) || [];
      let i = 0;
      return dau + mv.replace(/#/g, () => (i < so.length ? so[i++] : '#')) + duoi;
    }
  }
  // ⚠⚠ DANH SÁCH NỐI LÚC CHẠY: `sv.quai.map(q => q.name).join(' · ')` ra MỘT text node
  //   "Lân Con · Pháo Yêu · Kim Ngưu Miếu" — cả cụm không có trong từ điển, mà từng tên thì CÓ.
  //   Dịch từng khúc. Đòi MỌI khúc phải tra được, kẻo ra câu nửa Việt nửa Anh.
  if (giua.indexOf(' · ') > 0) {
    const khuc = giua.split(' · ');
    const ra = khuc.map((x) => {
      const t = TU_DIEN.get(x);
      return t !== undefined ? t : null;
    });
    if (ra.every((x) => x !== null)) return dau + ra.join(' · ') + duoi;
  }
  // ⚠⚠ CHỨC DANH + TÊN: "Chưởng Môn Mộ Dung Cô Hồng". Nhồi cả tích chức-danh × tên vào từ điển
  //   là 5.000 dòng cho một chữ tiền tố. Cắt làm hai: tiền tố tra được VÀ phần còn lại tra được
  //   thì ghép. Chỉ thử ở RANH GIỚI KHOẢNG TRẮNG, tối đa 4 chỗ — không quét cả chuỗi.
  if (giua.indexOf(' ') > 0 && giua.length <= 80) {
    let vt = -1;
    for (let lan = 0; lan < 4; lan++) {
      vt = giua.indexOf(' ', vt + 1);
      if (vt <= 0) break;
      const a = TU_DIEN.get(giua.slice(0, vt));
      if (a === undefined) continue;
      const b = TU_DIEN.get(giua.slice(vt + 1));
      // ⚠ Chữ Hán KHÔNG chen dấu cách giữa hai vế — "正在 釣魚" đọc như bị lỗi.
      if (b !== undefined) return dau + a + CACH + b + duoi;
    }
  }
  // ⚠⚠ CÂU GHÉP CÓ GIỚI TỪ: bots.js dựng "<việc> ở <nơi>" · "đang <việc> ở <nơi>" ngay lúc chạy.
  //   Hai vế đều nằm trong từ điển, chỉ cái nối là không. Tách ở CHÍNH giới từ rồi ghép lại.
  //   Bảng này CỐ Ý NGẮN — mỗi dòng là một khuôn có thật trong mã, đừng đoán thêm.
  for (const [vi, en] of NOI) {
    const vt = giua.indexOf(vi);
    if (vt <= 0) continue;
    const a = _traDeKiem(giua.slice(0, vt));
    if (a === null) continue;
    const b = _traDeKiem(giua.slice(vt + vi.length));
    if (b !== null) return dau + a + en + b + duoi;
  }
  return null;
}
/** Giới từ nối hai vế đều tra được. Vế phải là bản dịch của chính cái nối. */
let NOI = [];
let CACH = ' ';   // dấu nối hai vế khi cắt tiền tố — chữ Hán không dùng dấu cách
const NOI_EN = [[' ở ', ' at '], [' nơi ', ' at '], [' tại ', ' at ']];
const NOI_ZH = [[' ở ', '於'], [' nơi ', '於'], [' tại ', '於']];

/** Nạp từ điển cho bài kiểm (không đụng DOM). */
export function _napDeKiem(dict, lang) {
  TU_DIEN = new Map(); MAU = new Map();
  NOI = lang === 'zh' ? NOI_ZH : NOI_EN;
  CACH = lang === 'zh' ? '' : ' ';
  for (const k of Object.keys(dict)) (k.indexOf('#') >= 0 ? MAU : TU_DIEN).set(k, dict[k]);
}

const BO_QUA = { SCRIPT: 1, STYLE: 1, CANVAS: 1, INPUT: 1, TEXTAREA: 1 };

function apNode(n) {
  const v = _traDeKiem(n.nodeValue);
  if (v != null && v !== n.nodeValue) n.nodeValue = v;
}
function apThuocTinh(el) {
  if (!el.getAttribute) return;
  for (const a of ['title', 'placeholder']) {
    const v = el.getAttribute(a);
    if (v) { const d = _traDeKiem(v); if (d != null && d !== v) el.setAttribute(a, d); }
  }
}
function quet(root) {
  if (root.nodeType === 3) { apNode(root); return; }
  if (root.nodeType !== 1 || BO_QUA[root.tagName]) return;
  apThuocTinh(root);
  for (let c = root.firstChild; c; c = c.nextSibling) quet(c);
}

/**
 * Bật lớp phủ. Gọi MỘT lần lúc khởi động khi ngôn ngữ != 'vi'.
 * Từ điển nạp lười — người chơi tiếng Việt không tải thêm byte nào.
 */
export async function batNgonNgu(lang) {
  if (dangChay || !lang || lang === 'vi') return;
  let mod;
  try {
    mod = lang === 'zh' ? await import('./i18n/dict_zh.js') : await import('./i18n/dict_en.js');
  } catch (e) { return; }                       // thiếu tệp từ điển thì game chạy tiếng Việt như thường
  _napDeKiem(mod.DICT, lang);
  dangChay = true;
  try { document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en'; } catch (e) {}
  quet(document.body);
  new MutationObserver((ms) => {
    for (const m of ms) {
      if (m.type === 'characterData') apNode(m.target);
      else if (m.type === 'attributes') apThuocTinh(m.target);
      else for (const n of m.addedNodes) quet(n);
    }
  }).observe(document.body, {
    subtree: true, childList: true, characterData: true,
    attributes: true, attributeFilter: ['title', 'placeholder'],
  });
}
