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
  TK_SU, TK_SU_BY_ID, TK_LUOT, TK_CAP_TRAN, TK_EXP_CHUYEN, TK_CUOP_TOI_DA, TK_CUOP_MAT,
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
export const TK_SO_DOAN = 6;
// ⚠⚠ NỬA BỀ RỘNG VÀ NỬA CHIỀU CAO PHẢI TÍNH RIÊNG. Khung bản đồ là 750×270, nên một dấu đoàn
//    (art 40px + nhãn chữ) rộng ~6,7% bề ngang mà cao tới ~10% chiều cao — cùng một số pixel
//    nhưng hai con phần trăm khác hẳn nhau.
//    ⛔ Bản trước dùng CHUNG một số 5 cho cả hai trục: phép đo hụt trục dọc gấp ba, báo "không
//      cặp nào đè" trong khi ảnh chụp cho thấy đoàn của người chơi nằm đè lên một đoàn bot.
export const TK_DAU_NUA_X = 6.7;
export const TK_DAU_NUA_Y = 10;

// ============================================================
// ĐOÀN TRÔI TRÊN ĐƯỜNG MÂY
// ============================================================
// ⚠⚠ LÀN THEO PHẨM, TỐC ĐỘ THEO PHẨM. Đây là mấu chốt của cả khối này.
//    Mỗi đoàn đi NHANH CHẬM KHÁC NHAU, đúng theo bậc Hộ Kinh Sứ của nó: Bạch Trạch vượt bề ngang
//    trong 15 phút, Thanh Ngưu mất 30 phút — chính là con số thời gian chuyến đi. Nhìn đoàn nào
//    lướt nhanh là biết nó chở bậc cao, khỏi cần bấm vào.
//    ⇒ Vì làn cũng chia theo phẩm nên CÙNG LÀN LÀ CÙNG TỐC ĐỘ. Hai đoàn cùng làn lệch pha đều
//      thì không bao giờ đuổi kịp nhau; hai đoàn khác làn thì khác `y`. Không cần phép chữa nào.
//    ⛔ Bản trước cho cả tám đoàn chung một tốc độ rồi lệch pha — hết đè nhưng tám con bơi đều
//      như một, không nói lên điều gì.
// ⚠ Vị trí suy TỪ GIỜ, không lưu vào bản lưu. Cùng một `now` luôn ra cùng chỗ.
// ⚠ Quãng đường CHỪA LỀ hai bên. Dấu đoàn canh giữa theo `translateX(-50%)`, nên nhãn chữ dưới nó
//   thò ra mỗi bên nửa bề rộng. Để x chạy tới sát 0% là nhãn bị CẮT MẤT chữ đầu — ảnh chụp bắt
//   được đúng cảnh đó ở đoàn của người chơi.
const TROI_X0 = 9, TROI_RONG = 82;              // quãng đường ngang, phần trăm khung
/**
 * Làn riêng của đoàn người chơi — DƯỚI CÙNG, tách hẳn khỏi vùng rải của bot.
 * ⚠⚠ 92 là QUÁ THẤP: dấu đoàn cao 72px canh giữa theo `y`, nên nhãn chữ nằm dưới cùng thò khỏi
 *    đáy khung và bị cắt. Ảnh chụp lộ ra, còn phép đo thì không — nó chỉ soi mép TRÁI/PHẢI.
 */
export const TK_LAN_TA = 84;

// ============================================================
// RẢI ĐOÀN — NGẪU NHIÊN, KHÔNG XẾP HÀNG
// ============================================================
// ⚠⚠ Bản trước xếp đoàn thành HÀNG theo phẩm. Không đè nhau thật, nhưng nhìn ra bốn hàng thẳng
//    tắp như bảng biểu — chủ dự án bác đúng: đường mây phải lộn xộn như đường mây.
// ⚠⚠ Nhưng RẢI TỰ DO + MỖI CON MỘT TỐC ĐỘ = chắc chắn có lúc đè nhau, vì con nhanh đuổi kịp con
//    chậm. Lối thoát: mỗi đoàn có một CHỖ NEO rải ngẫu nhiên, rồi DẬP DỀNH QUANH CHỖ NEO của
//    mình chứ không bơi hết bản đồ. Bậc cao dập dềnh nhanh hơn — vẫn đọc ra bậc qua nhịp chuyển
//    động, mà hai đoàn không bao giờ chạm nhau.
// Ô neo lấy từ một lưới THƯA rồi bốc ngẫu nhiên 8 trong 12 ô, và nhiễu ngay trong ô. Nhìn ra
// lộn xộn, mà khoảng cách tối thiểu vẫn đủ cho nhãn chữ.
// ⚠⚠ NGÂN SÁCH KHOẢNG CÁCH — chỗ này không được nới bừa.
//    Cột cách nhau 24, nhãn chữ rộng tới 12 ⇒ (nhiễu + dập dềnh) mỗi chiều phải ≤ 6.
//    Hàng cách nhau 31, dấu + nhãn cao 14 ⇒ (nhiễu + dập dềnh) mỗi chiều phải ≤ 8,5.
//    Nới quá là hai đoàn chạm nhau ở một lứa nào đó — bài kiểm 47 đo trên 400 lứa để bắt.
// ⚠ HAI HÀNG cho bot, hàng thứ ba để dành cho đoàn người chơi. Khung chỉ cao 270px nên không đủ
//   chỗ cho ba hàng bot cộng một hàng của mình — ép vào là đè nhau.
// ⚠ Tám ô lưới mà chỉ rải SÁU đoàn: hai ô luôn trống nên nhìn ra lộn xộn, không ra bảng biểu.
const NEO_COT = [16, 40, 64, 88];               // tâm cột, phần trăm bề ngang
const NEO_HANG = [18, 50];                      // tâm hàng, phần trăm chiều cao
const NEO_NHIEU_X = 2.5, NEO_NHIEU_Y = 3;       // nhiễu trong ô
const DAP_X = 2.5, DAP_Y = 2;                   // biên độ dập dềnh
/** Dập dềnh nhanh gấp ngần này so với thời gian chuyến — để mắt thấy được chuyển động. */
const DAP_NHANH = 4;
/** Kẹp cuối cùng: nhãn phải lọt khung, và không đoàn nào lấn xuống làn của người chơi. */
const KEP_X = [11, 89], KEP_Y = [12, 56];

/**
 * Chỗ neo của đoàn thứ `i` trong lứa `moc`: bốc 8 ô trong 12 ô lưới, không trùng ô.
 * HÀM THUẦN. Trả `{ x, y }` phần trăm khung.
 */
export function tkNeo(moc, i) {
  const o = [];
  for (let c = 0; c < NEO_COT.length * NEO_HANG.length; c++) o.push(c);
  // Xáo theo hạt giống của lứa — cùng lứa luôn ra cùng cách rải.
  for (let k = o.length - 1; k > 0; k--) {
    const j = Math.abs(hash2(moc, k * 131)) % (k + 1);
    const t = o[k]; o[k] = o[j]; o[j] = t;
  }
  const ky = o[i % o.length];
  const h = hash2(moc, ky * 977 + 7);
  return {
    x: NEO_COT[ky % NEO_COT.length] + ((Math.abs(h) % 200) / 100 - 1) * NEO_NHIEU_X,
    y: NEO_HANG[Math.floor(ky / NEO_COT.length)] + ((Math.abs(hash2(h, 53)) % 200) / 100 - 1) * NEO_NHIEU_Y,
  };
}

/** Một vòng hết bề ngang của bậc `bac`, tính bằng mili giây. Đúng bằng thời gian chuyến đi. */
export function tkChuKyBac(bac) {
  const s = TK_SU.find((x) => x.bac === bac) || TK_SU[0];
  return s.phut * 60 * 1000;
}

/**
 * Pha dập dềnh, trong `[0, 1)`. HÀM THUẦN. Chu kỳ lấy theo BẬC nên mỗi bậc một nhịp.
 * `lech` là pha riêng của từng đoàn, để hai đoàn cùng bậc không lắc y hệt nhau.
 */
export function tkTroi(now, bac, lech) {
  const ck = tkChuKyBac(bac) / DAP_NHANH;
  return ((((now || 0) % ck) / ck) + (lech || 0)) % 1;
}

const kep = (v, k) => Math.max(k[0], Math.min(k[1], v));
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
  // Vòng một: chốt bậc Hộ Kinh Sứ của từng đoàn. Phải biết TRƯỚC mới chia pha trong bậc được.
  const tho = [];
  for (let i = 0; i < TK_SO_DOAN; i++) {
    const h = hash2(moc, i * 7919);
    const su = tkBocSu((Math.abs(hash2(h, 31)) % 10000) / 10000);
    tho.push({ i, h, bot: ds[Math.abs(h) % ds.length], su, bac: TK_SU_BY_ID[su].bac });
  }
  // Vòng hai: trong MỖI BẬC, chia pha đều. Cùng bậc là cùng tốc độ nên chia pha đều một lần là
  // chúng giữ khoảng cách ấy mãi mãi — đây là chỗ bảo đảm không đoàn nào đè đoàn nào.
  const ra = [];
  for (const t of tho) {
    const cap = Math.max(1, Math.min(TK_CAP_TRAN, 1 + (Math.abs(hash2(t.h, 57)) % TK_CAP_TRAN)));
    const neo = tkNeo(moc, t.i);
    // Pha riêng mỗi đoàn, để hai đoàn cùng bậc không lắc y hệt nhau.
    const lech = (Math.abs(hash2(t.h, 199)) % 1000) / 1000;
    const p = tkTroi(now, t.bac, lech) * Math.PI * 2;
    ra.push({
      key: 'tk' + moc + '-' + t.i,
      ten: t.bot.name, capNv: botCombatLv(t.bot, now || 0),
      su: t.su, cap, bac: t.bac,
      daBiCuop: Math.abs(hash2(t.h, 91)) % (TK_CUOP_TOI_DA + 1),
      conLai: NHIP_DOAN - ((now || 0) % NHIP_DOAN),
      // ⚠ Dập dềnh QUANH CHỖ NEO, không bơi hết bản đồ. Bậc cao thì chu kỳ ngắn hơn nên lắc nhanh
      //   hơn — vẫn đọc ra bậc qua nhịp chuyển động mà hai đoàn không bao giờ chạm nhau.
      x: Math.round(kep(neo.x + Math.cos(p) * DAP_X, KEP_X) * 10) / 10,
      y: Math.round(kep(neo.y + Math.sin(p * 0.73) * DAP_Y, KEP_Y) * 10) / 10,
      cuaTa: false,
    });
  }
  return ra;
}

/**
 * Đoàn CỦA NGƯỜI CHƠI trên đường mây. Trả `null` khi không có chuyến nào đang chạy.
 * ⚠⚠ Đoàn này đi MỘT LƯỢT DUY NHẤT từ mép trái tới mép phải, và tới nơi đúng lúc đồng hồ về 0 —
 *    nó là cái đồng hồ đếm ngược vẽ ra thành hình, không phải một dấu trang trí. Đoàn bot thì
 *    vòng đi vòng lại; đoàn của ta thì KHÔNG vòng, vì chuyến chỉ có một chiều.
 * ⚠ Nằm ở LÀN GIỮA riêng (`TK_LAN_TA`) nên không bao giờ đụng làn nào của bot.
 */
export function tkDoanCuaTa(state, now) {
  if (!tkDangDi(state)) return null;
  const t = state.thinhKinh;
  const s = TK_SU_BY_ID[t.su];
  if (!s) return null;
  const tong = Math.max(1, (t.hetLuc || 0) - (t.batDau || 0));
  const daDi = Math.max(0, Math.min(1, ((now || 0) - (t.batDau || 0)) / tong));
  return {
    key: 'tk-ta', cuaTa: true,
    ten: (state.player && state.player.name) || 'Ta',
    su: t.su, bac: s.bac, cap: tkCap(state, t.su).lv,
    x: Math.round((TROI_X0 + daDi * TROI_RONG) * 10) / 10,
    y: TK_LAN_TA,
    daDi,
  };
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
