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
let THUONG = null;    // Map: nguyên văn viết thường -> bản dịch (bắt lệch HOA/thường)
let MAU_DAI = [];     // mẫu DÀI, '#' khớp cả cụm chữ (tên đệ tử) chứ không riêng số
let dangChay = false;

const RE_SO = /\d[\d.,]*/g;
// Cặp dấu nháy bao NGOÀI câu lore. Game vẽ “<lore>” còn từ điển chỉ có <lore> trần.
const NHAY = { '“': '”', '"': '"', '‘': '’', "'": "'", '«': '»', '「': '」', '『': '』', '〔': '〕', '【': '】', '《': '》' };
// Phần phụ SỐ / KÝ HIỆU bám hai đầu ("Bạo Kích +8%", "11 hiệp", "+18% Sát Thương hệ").
// Kèm mấy dấu trang trí hay bám đuôi ("… ★"): bóc rồi trả lại đúng chỗ.
// ⚠⚠ ĐỪNG liệt kê từng dấu. Đã ba vòng phải chạy lại vì thiếu đúng một ký tự: '●' ở thẻ Yêu
//   Vương, '/' '(' ')' ở kho vật liệu Tông Môn, '◇' ở Đăng Tiên Mộng, '〔〕' ở Nhiệm Vụ.
//   Lấy CẢ MẢNG: mọi thứ KHÔNG PHẢI CHỮ CÁI ở hai đầu đều là trang trí — bóc ra, dịch phần lõi,
//   rồi trả lại đúng chỗ. Chỉ trả kết quả khi phần lõi tra được nên không hỏng chuyện gì.
const RE_PHU_TRAI = /^[^\p{L}]+/u;
const RE_PHU_PHAI = /[^\p{L}]+$/u;
const RE_CHU = /[A-Za-zÀ-ỹ]/;

/**
 * Dịch một chuỗi. Trả null nếu không có trong từ điển (giữ nguyên tiếng Việt).
 * Bọc ngoài: gỡ khoảng trắng hai đầu + dấu '·' mở đầu, phần lõi giao cho traLoi().
 */
export function _traDeKiem(s, sau) {
  if (!TU_DIEN || typeof s !== 'string') return null;
  if (sau > 5) return null;                         // chặn đệ quy chạy vòng
  const v0 = TU_DIEN.get(s);
  if (v0 !== undefined) return v0;
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s);
  const truoc = m[1], duoi = m[3];
  let loi = m[2];
  if (!loi) return null;
  // ⚠ Dấu ĐẦU DÒNG là dấu phân cách của khối bên ngoài ("· 18 phút trước"), không phải chữ.
  //   ⚠⚠ Bộ sinh từ điển gom nguyên văn nên có khoá GIỮ dấu ("· mở thêm ở"). Phải thử khoá CÓ
  //   dấu TRƯỚC, không thì mọi khoá kiểu đó chết vĩnh viễn. Dấu ở GIỮA đi luật nối bên dưới.
  //   ⚠ KHÔNG chỉ mỗi '·': thẻ trạng thái Yêu Vương vẽ `'● '+(...)` nên "● Đang sống" đứng
  //   nguyên tiếng Việt suốt, dù "Đang sống" nằm sẵn trong từ điển.
  let cham = '';
  const c = /^([·•●○◆◇▪▸‣]\s*)([\s\S]+)$/.exec(loi);
  if (c) {
    const v1 = TU_DIEN.get(loi);
    if (v1 !== undefined) return truoc + v1 + duoi;
    cham = c[1]; loi = c[2];
  }
  const v = traLoi(loi, (sau || 0) + 1);
  return v === null ? null : truoc + cham + v + duoi;
}

/** Phần lõi: đã sạch khoảng trắng hai đầu. */
function traLoi(t, sau) {
  if (sau > 5) return null;
  let v = TU_DIEN.get(t);
  if (v !== undefined) return v;
  // --- 1. MẪU CÓ SỐ: "Còn 12 ngày 3 giờ" -> "Còn # ngày # giờ" -> trả số về đúng thứ tự.
  if (/\d/.test(t)) {
    const khoa = t.replace(RE_SO, '#');
    const mv = MAU.get(khoa);
    if (mv !== undefined) {
      const so = t.match(RE_SO) || [];
      let i = 0;
      return mv.replace(/#/g, () => (i < so.length ? so[i++] : '#'));
    }
  }
  // --- 2. DẤU NHÁY BAO NGOÀI: mọi câu lore vẽ ra là “<lore>”, từ điển chỉ có <lore> trần.
  const dong = NHAY[t[0]];
  if (dong && t.length > 2 && t[t.length - 1] === dong) {
    const b = _traDeKiem(t.slice(1, -1), sau + 1);
    if (b !== null) return t[0] + b + dong;
  }
  // --- 3. SỐ / KÝ HIỆU BÁM HAI ĐẦU. "Bạo Kích +8%" ghép lúc chạy nên cả cụm không có trong từ
  //   điển, mà lõi chữ thì CÓ. Giữ nguyên phần phụ TẠI CHỖ (số đứng trước hay sau là do bố cục).
  {
    const a = (RE_PHU_TRAI.exec(t) || [''])[0];
    const b = (RE_PHU_PHAI.exec(t) || [''])[0];
    if ((a || b) && a.length + b.length < t.length) {
      const giua = t.slice(a.length, t.length - b.length);
      if (RE_CHU.test(giua)) {
        const g = traLoi(giua, sau + 1);
        if (g !== null) return a + g + b;
      }
    }
  }
  // --- 4. DANH SÁCH NỐI LÚC CHẠY: `sv.quai.map(q => q.name).join(' · ')` ra MỘT text node
  //   "Lân Con · Pháo Yêu · Kim Ngưu Miếu" — cả cụm không có trong từ điển, mà từng tên thì CÓ.
  //   ⚠ Dịch từng khúc bằng ĐỆ QUY (khúc cũng có thể là "mỗi 5 lượt", "6 bậc"), không tra thô.
  //   Đòi MỌI khúc phải tra được, kẻo ra câu nửa Việt nửa Anh.
  if (t.indexOf(' · ') > 0) {
    const ra = t.split(' · ').map((x) => _traDeKiem(x, sau + 1));
    if (ra.every((x) => x !== null)) return ra.join(' · ');
  }
  // --- 4b. NHAN : GIÁ TRỊ — "Bậc 0: Bãi Đất Trống". Hai vế đều nằm trong từ điển, cả cụm thì
  //   không. Cắt ở dấu hai chấm ĐẦU TIÊN, đòi CẢ HAI vế tra được.
  // --- 4c. Y HỆT VỚI DẤU PHẨY — "— phẩm Cực Hiếm, chấn động một phương". Nhồi cả tích
  //   phẩm-chất × câu vào từ điển là mấy chục dòng cho một câu.
  //   ⚠ Cả hai luật đòi CẢ HAI vế tra được, nên không bao giờ ra câu nửa Việt nửa Anh.
  for (const cat of [' — ', ': ', ', ']) {
    const vt = t.indexOf(cat);
    if (vt <= 0) continue;
    const a = _traDeKiem(t.slice(0, vt), sau + 1);
    if (a === null) continue;
    const b = _traDeKiem(t.slice(vt + cat.length), sau + 1);
    if (b !== null) return a + cat + b;
  }
  // --- 5. CHỨC DANH + TÊN: "Chưởng Môn Mộ Dung Cô Hồng". Nhồi cả tích chức-danh × tên vào từ điển
  //   là 5.000 dòng cho một chữ tiền tố. Cắt làm hai: tiền tố tra được VÀ phần còn lại tra được
  //   thì ghép. Chỉ thử ở RANH GIỚI KHOẢNG TRẮNG, tối đa 4 chỗ — không quét cả chuỗi.
  if (t.indexOf(' ') > 0 && t.length <= 80) {
    let vt = -1;
    for (let lan = 0; lan < 4; lan++) {
      vt = t.indexOf(' ', vt + 1);
      if (vt <= 0) break;
      const a = TU_DIEN.get(t.slice(0, vt));
      if (a === undefined) continue;
      const b = TU_DIEN.get(t.slice(vt + 1));
      // ⚠ Chữ Hán KHÔNG chen dấu cách giữa hai vế — "正在 釣魚" đọc như bị lỗi.
      if (b !== undefined) return a + CACH + b;
    }
  }
  // --- 6. CÂU GHÉP CÓ GIỚI TỪ: bots.js dựng "<việc> ở <nơi>" · "đang <việc> ở <nơi>" lúc chạy.
  //   Hai vế đều nằm trong từ điển, chỉ cái nối là không. Tách ở CHÍNH giới từ rồi ghép lại.
  //   Bảng này CỐ Ý NGẮN — mỗi dòng là một khuôn có thật trong mã, đừng đoán thêm.
  for (const [vi, en] of NOI) {
    const vt = t.indexOf(vi);
    if (vt <= 0) continue;
    const a = _traDeKiem(t.slice(0, vt), sau + 1);
    if (a === null) continue;
    const b = _traDeKiem(t.slice(vt + vi.length), sau + 1);
    if (b !== null) return a + en + b;
  }
  // --- 7. LỆCH HOA/THƯỜNG. Cùng một chữ, chỗ viết "Bạo Kích" chỗ viết "Bạo kích" — từ điển chỉ
  //   gom được bản đã gặp. Tra bản viết thường rồi TRẢ LẠI dáng hoa/thường của bản gốc.
  let th = THUONG.get(t.toLowerCase());
  if (th === undefined) th = THUONG.get(t.replace(/\s+/g, ' '));       // nén dải trắng giữa câu
  if (th === undefined) th = THUONG.get(t.replace(/\s+/g, ' ').toLowerCase());
  if (th !== undefined) return t[0] === t[0].toLowerCase() ? th.charAt(0).toLowerCase() + th.slice(1) : th;
  // --- 8. MẪU DÀI, CHỖ CẮM LÀ CHỮ chứ không phải số. Cả mảng văn tự sự (Tông Môn, Đàm Đạo,
  //   Danh Sĩ, Tửu Lâu) dựng câu bằng `${đệ tử.name} bước lên đài...`. Luật số ở trên vô dụng vì
  //   chỗ cắm là TÊN NGƯỜI. Khớp cả câu, giữ nguyên tên (tên riêng không dịch), dịch phần khung.
  //   Để CUỐI CÙNG và chỉ chạy với câu DÀI — nhãn ngắn không bao giờ đi tới đây.
  return traMauDai(t, sau);
}

/** Mẫu dài: '#' khớp mọi cụm chữ. Lọc thô bằng indexOf dấu vân tay trước khi thử regex. */
function traMauDai(t, sau) {
  if (t.length < 12) return null;
  for (const m of MAU_DAI) {
    if (t.indexOf(m.van) < 0) continue;
    const k = m.re.exec(t);
    if (!k) continue;
    let i = 1;
    return m.ra.replace(/#/g, () => {
      const g = k[i++];
      if (g === undefined) return '#';
      const d = _traDeKiem(g, sau + 1);
      return d === null ? g : d;      // tên riêng không có trong từ điển thì GIỮ NGUYÊN
    });
  }
  return null;
}
const thoat = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Giới từ nối hai vế đều tra được. Vế phải là bản dịch của chính cái nối. */
let NOI = [];
let CACH = ' ';   // dấu nối hai vế khi cắt tiền tố — chữ Hán không dùng dấu cách
const NOI_EN = [[' ở ', ' at '], [' nơi ', ' at '], [' tại ', ' at ']];
const NOI_ZH = [[' ở ', '於'], [' nơi ', '於'], [' tại ', '於']];

/** Nạp từ điển cho bài kiểm (không đụng DOM). */
export function _napDeKiem(dict, lang) {
  TU_DIEN = new Map(); MAU = new Map(); THUONG = new Map(); MAU_DAI = [];
  NOI = lang === 'zh' ? NOI_ZH : NOI_EN;
  CACH = lang === 'zh' ? '' : ' ';
  for (const k of Object.keys(dict)) {
    if (k.indexOf('#') >= 0) { MAU.set(k, dict[k]); continue; }
    TU_DIEN.set(k, dict[k]);
    const l = k.toLowerCase();
    if (!THUONG.has(l)) THUONG.set(l, dict[k]);   // đụng nhau thì giữ bản GẶP TRƯỚC
    // ⚠ Chữ trong index.html xuống dòng + thụt lề giữa câu; DOM giữ nguyên đám khoảng trắng đó,
    //   còn khoá lại là bản khác. Nén mọi dải trắng về MỘT dấu cách rồi tra lần nữa.
    const n = k.replace(/\s+/g, ' ');
    if (n !== k && !TU_DIEN.has(n) && !THUONG.has(n)) THUONG.set(n, dict[k]);
  }
  // Mẫu DÀI dùng cho luật 8. Dấu vân tay = khúc chữ dài nhất giữa hai chỗ cắm; lọc thô bằng
  // indexOf nên vòng lặp không tốn gì.
  // ⚠⚠ Điều kiện nhận là ĐỘ DÀI DẤU VÂN TAY, KHÔNG phải độ dài cả mẫu. Bản trước đòi mẫu ≥ 24
  //   ký tự nên "khi trảm # ★" (12 ký tự) bị loại — dòng Phong Vân Bảng đứng nguyên tiếng Việt
  //   dù mẫu đã nằm trong từ điển. Vân tay ≥ 8 ký tự là đủ để không khớp bừa.
  for (const [k, v] of MAU) {
    const khuc = k.split('#');
    let van = '';
    for (const c of khuc) if (c.trim().length > van.length) van = c.trim();
    if (van.length < 8) continue;
    MAU_DAI.push({ van, dai: van.length, re: new RegExp('^' + khuc.map(thoat).join('([\\s\\S]+?)') + '$'), ra: v });
  }
  MAU_DAI.sort((a, b) => b.dai - a.dai);          // khúc chữ dài nhất thử trước = khớp sát nhất
}

// SCRIPT/STYLE/CANVAS: bỏ hẳn, chữ trong canvas là việc của đợt sau.
const BO_QUA = { SCRIPT: 1, STYLE: 1, CANVAS: 1 };
// ⚠⚠ INPUT/TEXTAREA: KHÔNG đụng chữ người chơi gõ, nhưng `placeholder`/`title` là chữ của GAME —
//   bản trước xếp chung vào BO_QUA nên ô "Không giới hạn", "Tìm chiêu thức, hiệu ứng..." đứng
//   nguyên tiếng Việt ở mọi ngôn ngữ. Dịch thuộc tính rồi DỪNG, không đi vào trong.
const CHI_THUOC_TINH = { INPUT: 1, TEXTAREA: 1 };

function apNode(n) {
  const v = _traDeKiem(n.nodeValue, 0);
  if (v != null && v !== n.nodeValue) n.nodeValue = v;
}
function apThuocTinh(el) {
  if (!el.getAttribute) return;
  for (const a of ['title', 'placeholder']) {
    const v = el.getAttribute(a);
    if (v) { const d = _traDeKiem(v, 0); if (d != null && d !== v) el.setAttribute(a, d); }
  }
}
function quet(root) {
  if (root.nodeType === 3) { apNode(root); return; }
  if (root.nodeType !== 1 || BO_QUA[root.tagName]) return;
  apThuocTinh(root);
  if (CHI_THUOC_TINH[root.tagName]) return;
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
