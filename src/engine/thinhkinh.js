// ============================================================
// ENGINE — THỈNH KINH. HÀM THUẦN, không đọc mạng, không đụng giao diện.
// ============================================================
// ⚠⚠ Mọi phép bốc đi qua MIỀN RNG RIÊNG: `tkSu` (bốc bậc Hộ Kinh Sứ) và `tkCuop` (kết quả cướp).
//    Dùng chung miền với đường bốc khác là trần chống gian lận đếm nhầm — đúng lỗi đã vá ở đan
//    Đan Điền, chỉ đổi cửa.
// ⚠ Đoàn bot suy từ HẠT GIỐNG + MỐC GIỜ, không lưu vào bản lưu. Cùng cách Giang Hồ chung đang làm,
//   nên không cần bảng SQL nào và chạy được cả khi chưa đăng nhập.
import { rng } from './rng.js';
import { hash2, genRoster, botCombatLv } from './bots.js';
import { MAY_CHU_SEED, MAY_CHU_MO_LUC } from '../data/bots.js';
import {
  TK_SU_BY_ID, TK_LUOT, TK_CAP_TRAN, TK_EXP_CHUYEN, TK_CUOP_TOI_DA, TK_CUOP_MAT,
  TK_CUOP_AN, TK_CUOP_KEP, tkBocSu, tkThuong, tkExpLenCap,
} from '../data/thinhkinh.js';

const PHUT = 60 * 1000;

/** Mốc ngày (giờ máy người chơi) — dùng để reset lượt. */
export function tkNgay(now) { const d = new Date(now || 0); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }

export function tkEnsure(state, now) {
  if (!state.thinhKinh || typeof state.thinhKinh !== 'object') state.thinhKinh = {};
  const t = state.thinhKinh;
  if (!t.cap || typeof t.cap !== 'object') t.cap = {};          // suId -> { lv, xp }
  if (!t.luot || typeof t.luot !== 'object') t.luot = {};
  // ⚠ Reset theo NGÀY, không theo "24 giờ kể từ lần cuối" — kiểu sau làm giờ trôi dần mỗi ngày.
  const ngay = tkNgay(now || 0);
  if (t.luot.ngay !== ngay) t.luot = { ngay, thinh: TK_LUOT.thinh, cuop: TK_LUOT.cuop, hoVe: TK_LUOT.hoVe };
  if (typeof t.lamMoiDaDung !== 'number') t.lamMoiDaDung = 0;
  if (typeof t.biCuop !== 'number') t.biCuop = 0;
  return t;
}

/** Cấp + EXP của một Hộ Kinh Sứ. Chưa nuôi bao giờ thì cấp 1. */
export function tkCap(state, suId) {
  const c = (state.thinhKinh && state.thinhKinh.cap && state.thinhKinh.cap[suId]) || null;
  return { lv: Math.max(1, Math.min(TK_CAP_TRAN, (c && c.lv) || 1)), xp: Math.max(0, (c && c.xp) || 0) };
}

/** Có chuyến đang chạy không. */
export function tkDangDi(state) {
  const t = state.thinhKinh || {};
  return !!(t.su && t.hetLuc);
}
/** Chuyến đã về chưa. */
export function tkDaVe(state, now) {
  const t = state.thinhKinh || {};
  return tkDangDi(state) && (now || 0) >= t.hetLuc;
}
/** Còn bao nhiêu mili giây nữa thì về. */
export function tkConLai(state, now) {
  const t = state.thinhKinh || {};
  return tkDangDi(state) ? Math.max(0, t.hetLuc - (now || 0)) : 0;
}

/**
 * Bốc một Hộ Kinh Sứ vào ô chờ. Không tiêu lượt — lượt chỉ tiêu lúc KHỞI HÀNH.
 * ⚠ Trả về mã sứ; chỗ gọi tự ghi vào `t.suCho`.
 */
export function tkBoc(state) { return tkBocSu(rng(state, 'tkSu')); }

/** Khởi hành. Trả `{ ok, vi }`. Hàm này ĐỔI state. */
export function tkKhoiHanh(state, now, soHoVe) {
  const t = tkEnsure(state, now);
  if (tkDangDi(state)) return { ok: false, vi: 'dang-di' };
  if (!t.suCho || !TK_SU_BY_ID[t.suCho]) return { ok: false, vi: 'chua-boc-su' };
  if ((t.luot.thinh || 0) <= 0) return { ok: false, vi: 'het-luot' };
  const s = TK_SU_BY_ID[t.suCho];
  t.su = t.suCho; t.suCho = '';
  t.batDau = now; t.hetLuc = now + s.phut * PHUT;
  t.hoVe = Math.max(0, Math.min(TK_LUOT.hoVe, Math.floor(soHoVe || 0)));
  t.biCuop = 0;
  t.luot.thinh -= 1;
  t.lamMoiDaDung = 0;
  return { ok: true };
}

/**
 * Số lần chuyến này CÒN bị cướp được. Mỗi hộ vệ chặn đúng một lần.
 * ⚠ Kẹp ở 0: cử ba hộ vệ không làm số âm rồi thành cộng ngược vào thưởng.
 */
export function tkConBiCuop(state) {
  const t = state.thinhKinh || {};
  return Math.max(0, TK_CUOP_TOI_DA - (t.hoVe || 0) - (t.biCuop || 0));
}

/** Thưởng thực nhận của chuyến đang chạy, đã trừ phần bị cướp. */
export function tkThuongThuc(state) {
  const t = state.thinhKinh || {};
  if (!t.su) return { bac: 0, honThach: 0, exp: 0 };
  const g = tkThuong(t.su, tkCap(state, t.su).lv);
  // ⚠ Hồn Thạch và EXP KHÔNG bị cướp. Cướp mà lấy được cả tu vi thì người bị cướp mất động lực đi.
  const mat = Math.min(1, (t.biCuop || 0) * TK_CUOP_MAT);
  return { bac: Math.max(0, Math.round(g.bac * (1 - mat))), honThach: g.honThach, exp: TK_EXP_CHUYEN };
}

/**
 * Nhận thưởng. Trả `{ ok, bac, honThach, exp, lenCap }`. ĐỔI state.
 * ⚠ Chỗ gọi phải tự cộng Bạc / Hồn Thạch vào ví — hàm này không đụng `currencies` để còn dùng lại
 *   được ở chỗ khác và để bài kiểm đo được phép tính riêng.
 */
export function tkNhan(state, now) {
  const t = tkEnsure(state, now);
  if (!tkDaVe(state, now)) return { ok: false, vi: 'chua-ve' };
  const q = tkThuongThuc(state);
  const suId = t.su;
  const c = tkCap(state, suId);
  let lv = c.lv, xp = c.xp + q.exp, lenCap = 0;
  while (lv < TK_CAP_TRAN && xp >= tkExpLenCap(lv)) { xp -= tkExpLenCap(lv); lv++; lenCap++; }
  if (lv >= TK_CAP_TRAN) xp = 0;
  t.cap[suId] = { lv, xp };
  t.su = ''; t.hetLuc = 0; t.batDau = 0; t.biCuop = 0; t.hoVe = 0;
  return { ok: true, bac: q.bac, honThach: q.honThach, exp: q.exp, lenCap, su: suId };
}

// ============================================================
// ĐOÀN BOT TRÊN ĐƯỜNG MÂY
// ============================================================
/** Bao nhiêu đoàn hiện cùng lúc. */
export const TK_SO_DOAN = 8;
// Lưới rải đoàn: 4 cột × 2 hàng. Nhiễu chạy TRONG ô nên hai đoàn không bao giờ đè nhau.
export const O_COT = 4;
const O_LE_X = 10, O_LE_Y = 26, O_RONG = 22, O_CAO = 34, O_NHIEU_X = 10, O_NHIEU_Y = 14;
/** Nửa bề rộng một dấu đoàn, tính theo phần trăm khung — dùng cho phép đo chồng lấn. */
export const TK_DAU_NUA = 5;
/** Đoàn đổi lứa mỗi ngần này — cùng nhịp với thời gian một chuyến. */
const NHIP_DOAN = 20 * PHUT;

/**
 * Danh sách đoàn đang đi. THUẦN: cùng `now` luôn ra cùng kết quả, không đụng bản lưu.
 * ⚠ `mocDoan` chia theo NHỊP nên cả làng thấy cùng một lứa đoàn, y như Giang Hồ chung.
 */
export function tkDoanDangDi(now) {
  const moc = Math.floor((now || 0) / NHIP_DOAN);
  const ds = genRoster(MAY_CHU_SEED, MAY_CHU_MO_LUC, now || 0);
  if (!ds || !ds.length) return [];
  const ra = [];
  for (let i = 0; i < TK_SO_DOAN; i++) {
    const h = hash2(moc, i * 7919);
    const bot = ds[Math.abs(h) % ds.length];
    const h2 = hash2(h, 31);
    const su = tkBocSu((Math.abs(h2) % 10000) / 10000);
    const cap = Math.max(1, Math.min(TK_CAP_TRAN, 1 + (Math.abs(hash2(h, 57)) % TK_CAP_TRAN)));
    ra.push({
      key: 'tk' + moc + '-' + i,
      ten: bot.name, capNv: botCombatLv(bot, now || 0),
      su, cap,
      daBiCuop: Math.abs(hash2(h, 91)) % (TK_CUOP_TOI_DA + 1),
      conLai: NHIP_DOAN - ((now || 0) % NHIP_DOAN),
      // ⚠⚠ TOẠ ĐỘ CHIA Ô LƯỚI, KHÔNG BỐC TỰ DO. Bản đầu bốc x/y tự do trong cả khung: bảng số vẫn
      //    xanh (đoàn nào cũng nằm trong khung) nhưng ẢNH CHỤP lộ ra hai đoàn đè lên nhau, tám
      //    đoàn chỉ đọc được sáu nhãn. Lưới 4×2 bảo đảm mỗi đoàn một ô, nhiễu chỉ chạy TRONG ô.
      //    Đây đúng bài học cũ: đo bản đồ phải đo DIỆN TÍCH ĐÈ, không đo khoảng cách hai chấm.
      x: Math.round(O_LE_X + (i % O_COT) * O_RONG + (Math.abs(hash2(h, 13)) % 100) / 100 * O_NHIEU_X),
      y: Math.round(O_LE_Y + Math.floor(i / O_COT) * O_CAO + (Math.abs(hash2(h, 29)) % 100) / 100 * O_NHIEU_Y),
    });
  }
  return ra;
}

/**
 * Cướp được bao nhiêu Bạc từ một đoàn. Hàm THUẦN, chỗ gọi tự cộng vào ví.
 * ⚠ Cấp mục tiêu càng thấp, cướp được càng ít — kẹp trong `TK_CUOP_KEP`.
 * ⚠⚠ Cướp bot KHÔNG trừ của ai cả; bot không có bản lưu. Số `daBiCuop` chỉ để đoàn nào cũng có
 *    giới hạn giống nhau, không phải một cuốn sổ thật.
 */
export function tkCuopDuoc(state, doan, capMinh) {
  if (!doan) return 0;
  if ((doan.daBiCuop || 0) >= TK_CUOP_TOI_DA) return 0;
  const g = tkThuong(doan.su, doan.cap);
  const tyLe = Math.max(TK_CUOP_KEP[0], Math.min(TK_CUOP_KEP[1], (doan.capNv || 1) / Math.max(1, capMinh || 1)));
  // Một nhúm ngẫu nhiên cho hai lần cướp cùng đoàn không ra y hệt nhau.
  const nhun = 0.85 + rng(state, 'tkCuop') * 0.3;
  return Math.max(1, Math.round(g.bac * TK_CUOP_AN * tyLe * nhun));
}
