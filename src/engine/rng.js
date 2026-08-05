// ============================================================
// ENGINE — BỘ SINH SỐ CÓ HẠT GIỐNG. THUẦN. Chạy y nguyên được trên máy chủ.
//
// Vì sao cần: muốn máy chủ TÍNH LẠI tiến độ để bắt gian lận tinh vi (Đợt D của
// docs/THIET_KE_ONLINE.md) thì mọi lần bốc số phải LẶP LẠI ĐƯỢC. `Math.random()` thì không.
//
// Cách làm: hạt giống nằm trong save (`state.rngHat`), mỗi MIỀN một bộ đếm riêng
// (`state.rngDem[mien]`). Kết quả = hàm băm của (hạt giống, miền, số đếm).
//
// ⚠ VÌ SAO CHIA THEO MIỀN chứ không dùng một dòng chung: một dòng chung thì thêm/bớt MỘT lần
//   bốc ở bất kỳ đâu là mọi kết quả phía sau lệch hết — máy chủ tính lại sẽ ra khác client,
//   mà lỗi kiểu đó im lặng. Chia miền thì thêm một lần bốc ở Linh Thú không đụng tới Bí Cảnh.
//
// ⭐ Được thêm một thứ ngoài dự tính: KHÔNG CÒN "TẢI LẠI ĐỂ BỐC LẠI". Trước đây rơi đồ xấu thì
//   thoát ra vào lại là có kết quả khác. Nay cùng một save cho đúng một kết quả.
// ============================================================

/** Băm một chuỗi tên miền -> số nguyên (nhớ lại, mỗi tên chỉ băm một lần). */
const _bamTen = {};
function bamTen(mien) {
  const s = String(mien || '');
  if (_bamTen[s] !== undefined) return _bamTen[s];
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  _bamTen[s] = h >>> 0;
  return _bamTen[s];
}

/** Khởi tạo hạt giống + bộ đếm nếu save chưa có. Gọi on-load, như ensureQuests. */
export function ensureRng(state) {
  if (!state) return state;
  // ⚠ ĐÂY là chỗ DUY NHẤT trong luồng tiến độ còn dùng Math.random: gieo hạt một lần cho
  //   một nhân vật. Sau đó mọi lần bốc đều suy ra được.
  if (typeof state.rngHat !== 'number' || !isFinite(state.rngHat) || state.rngHat === 0) {
    state.rngHat = (Math.floor(Math.random() * 2147483646) + 1) | 0;
  }
  if (!state.rngDem || typeof state.rngDem !== 'object') state.rngDem = {};
  return state;
}

/** Số thực trong [0,1) — thay cho Math.random(). `mien` là tên hệ: 'chienDau', 'biCanh'... */
export function rng(state, mien) {
  ensureRng(state);
  const k = String(mien || 'chung');
  const n = (state.rngDem[k] = (state.rngDem[k] | 0) + 1);
  let h = (state.rngHat ^ bamTen(k)) | 0;
  h = Math.imul(h ^ n, 0x9E3779B1);
  h ^= h >>> 15; h = Math.imul(h, 0x85EBCA6B);
  h ^= h >>> 13; h = Math.imul(h, 0xC2B2AE35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Số nguyên trong [lo, hi] (bao cả hai đầu). */
export function rngInt(state, mien, lo, hi) {
  const a = Math.ceil(lo), b = Math.floor(hi);
  if (b <= a) return a;
  return a + Math.floor(rng(state, mien) * (b - a + 1));
}

/** Bốc một phần tử trong mảng. Mảng rỗng -> undefined. */
export function rngPick(state, mien, arr) {
  if (!arr || !arr.length) return undefined;
  return arr[Math.floor(rng(state, mien) * arr.length)];
}

/** Hàm sinh số dạng `() => [0,1)` để truyền vào chỗ đang nhận `rnd`. */
export function rngHam(state, mien) { return () => rng(state, mien); }

/**
 * Mã ĐẾM ĐƯỢC cho dòng nhật ký — thay `Math.round(Math.random()*1e6)`.
 * Mã ngẫu nhiên làm hai lần chạy ra hai save khác nhau dù mọi thứ khác y hệt.
 */
export function rngMa(state, mien) {
  ensureRng(state);
  const k = 'ma:' + String(mien || 'chung');
  const n = (state.rngDem[k] = (state.rngDem[k] | 0) + 1);
  return n.toString(36);
}
