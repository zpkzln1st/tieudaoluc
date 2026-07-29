// ============================================================
// SÀN GIAO DỊCH — luật THUẦN: không DOM, không Alpine, không đọc giờ ngoài tham số.
//
// Cùng khuôn với Tửu Lâu (đã chạy thật): thứ do BOT tạo ra thì SUY TỪ
// (seed thế giới + mốc phiên) nên không lưu byte nào; state chỉ giữ thứ do
// NGƯỜI CHƠI tạo ra (lệnh đã đăng, số đã bán trong phiên, nhật ký).
//
// ⚠ VAN CÂN BẰNG (docs/THIET_KE_BOT_WORLD.md §7) — cả bốn phải chạy thật:
//   1. Mọi món neo `fairValue` quanh `value` của items.js, không tự đặt giá.
//   2. `priceIndex` mean-revert theo phiên, biên hẹp hơn chênh lệch mua/bán
//      -> canh sóng không thắng nổi phí, hết đầu cơ.
//   3. Ngân sách mua của bot có hạn theo phiên -> không xả vô hạn.
//   4. Co giãn giá: đổ nhiều một món trong phiên thì giá món đó tụt.
// ============================================================
import { ITEMS } from '../data/items.js';
import {
  PHIEN_MS, THUE_BAN, CHENH_MUA, CHENH_BAN, BIEN_GIA, NGAN_SACH_PHIEN,
  CO_GIAN_MOC, CO_GIAN_BUOC, CO_GIAN_DAY, RAO_N, MUA_N, LENH_TA_TRAN,
  NHAT_KY_MAX, HAN_LENH_MS, HE_SO_PHAM, NHOM_SAN,
} from '../data/san.js';

export { PHIEN_MS, THUE_BAN, NHOM_SAN, LENH_TA_TRAN };

// ---------- băm (cùng kiểu với engine/tuulau.js, số nguyên thuần) ----------
function h32(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function mix(a, b) { let h = (a ^ Math.imul(b >>> 0, 2654435761)) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13; return h >>> 0; }
const frac = (h) => (h >>> 0) / 4294967296;

export const phienCua = (now) => Math.floor((now || 0) / PHIEN_MS);
export const phienConLai = (now) => PHIEN_MS - ((now || 0) % PHIEN_MS);

export function ensureSan(state) {
  if (!state.san) state.san = {};
  const s = state.san;
  if (!Array.isArray(s.lenh)) s.lenh = [];      // lệnh của người chơi: [{id, kieu:'rao'|'mua', itemId, sl, gia, ts}]
  if (!s.daBan) s.daBan = {};                   // { itemId: số đã bán trong phiên hiện tại }
  if (typeof s.daBanPhien !== 'number') s.daBanPhien = -1;
  if (!Array.isArray(s.nhatKy)) s.nhatKy = [];  // [{ts, kieu, itemId, sl, bac}]
  if (typeof s.tieu !== 'number') s.tieu = 0;   // tổng Bạc đã tiêu trên sàn
  if (typeof s.thu !== 'number') s.thu = 0;     // tổng Bạc đã thu về
  if (typeof s.thue !== 'number') s.thue = 0;   // tổng thuế đã nộp (sink)
  return s;
}

/** Sang phiên mới thì bộ đếm co giãn giá đặt lại. */
export function nhipSan(state, now) {
  const s = ensureSan(state);
  const p = phienCua(now);
  if (s.daBanPhien !== p) { s.daBanPhien = p; s.daBan = {}; }
  // dọn lệnh quá hạn
  const truoc = s.lenh.length;
  s.lenh = s.lenh.filter((l) => (now - l.ts) < HAN_LENH_MS);
  return { doiPhien: truoc !== s.lenh.length || s.daBanPhien !== p };
}

// ---------- GIÁ ----------

/** Giá tham chiếu của một món: neo vào `value` trong items.js, không bịa. */
export function fairValue(itemId) {
  const it = ITEMS[itemId];
  if (!it) return 0;
  const nen = Math.max(1, it.value || 1);
  return Math.round(nen * (HE_SO_PHAM[it.quality] || 1));
}

/**
 * Chỉ số giá của món trong một phiên — dao động quanh 1,0 trong biên BIEN_GIA.
 * Deterministic theo (seed, itemId, phiên) nên mọi máy cùng seed thấy cùng giá,
 * và F5 không đổi giá giữa phiên.
 */
export function chiSoGia(seed, itemId, phien) {
  const h = mix(mix(h32('gia:' + itemId), phien >>> 0), (seed >>> 0) || 1);
  // hai lớp nhiễu lệch nhịp -> đường giá gợn chứ không nhảy bậc thang
  const a = frac(h), b = frac(mix(h, 0x9e3779b9));
  const lech = (a - 0.5) * 1.3 + (b - 0.5) * 0.7;   // trung bình 0
  return 1 + lech * BIEN_GIA;
}

/** Hệ số co giãn theo số đã đổ trong phiên. Càng bán nhiều càng rẻ. */
export function heSoCoGian(state, itemId) {
  const s = ensureSan(state);
  const da = s.daBan[itemId] || 0;
  const buoc = Math.floor(da / CO_GIAN_MOC);
  return Math.max(CO_GIAN_DAY, 1 - buoc * CO_GIAN_BUOC);
}

// ⚠ GIÁ TÍNH BẰNG SỐ THỰC, CHỈ LÀM TRÒN Ở TỔNG TIỀN.
// Bản đầu làm tròn ngay từng đơn vị và hỏng hai chỗ:
//   · Món rẻ chết cứng: Tùng Mộc value 2, nhân biên ±22% rồi làm tròn vẫn ra 2
//     ở gần hết dải -> giá không bao giờ nhúc nhích, cả hệ chỉ số giá thành vô nghĩa.
//   · Hở kẽ đầu cơ: mua 1 món 2 Bạc rồi bán lại cũng được 2 Bạc (thuế làm tròn
//     xuống 0) -> vòng mua-bán-lại HOÀ VỐN. Đo được 36/2328 trường hợp.
// Nay giữ số thực suốt, làm tròn đúng một lần ở tổng. Muốn số để BÀY RA màn thì
// dùng `giaMuaHien` / `giaBanHien`.

/** Giá thị trường của món trong phiên (số thực, chưa tính chênh lệch mua/bán). */
export function giaThiTruong(seed, itemId, phien) {
  return fairValue(itemId) * chiSoGia(seed, itemId, phien);
}

/** Đơn giá người chơi MUA của bot (số thực). */
export function giaMua(seed, itemId, phien) {
  return giaThiTruong(seed, itemId, phien) * (1 + CHENH_MUA);
}

/** Đơn giá người chơi BÁN cho bot (số thực), đã tính co giãn theo lượng đã đổ. */
export function giaBan(state, seed, itemId, phien) {
  return giaThiTruong(seed, itemId, phien) * (1 - CHENH_BAN) * heSoCoGian(state, itemId);
}

/** Đơn giá làm tròn để BÀY RA màn hình. Tiền thật vẫn tính từ số thực. */
export const giaMuaHien = (seed, itemId, phien) => Math.max(1, Math.round(giaMua(seed, itemId, phien)));
export const giaBanHien = (state, seed, itemId, phien) => Math.max(1, Math.round(giaBan(state, seed, itemId, phien)));

/** Tổng phải trả khi mua `sl` món — làm tròn MỘT LẦN ở tổng. */
export function tienPhaiTra(seed, itemId, phien, sl) {
  return Math.max(1, Math.round(giaMua(seed, itemId, phien) * Math.max(0, sl | 0)));
}

/** Tiền thật về túi sau thuế khi bán `sl` món. */
export function tienVeTui(state, seed, itemId, phien, sl) {
  const n = Math.max(0, sl | 0);
  const tho = Math.round(giaBan(state, seed, itemId, phien) * n);
  const thue = Math.ceil(tho * THUE_BAN);   // làm tròn LÊN: thuế không bao giờ bị bào về 0
  return { tho, thue, thuc: Math.max(0, tho - thue) };
}

// ---------- LỆNH CỦA BOT (suy từ seed, không lưu) ----------

/** Món nào được bày bán trên sàn — bỏ thứ không nên có giá. */
function hangCoTheBan() {
  return Object.values(ITEMS).filter((i) => i && i.value > 0 && i.type !== 'trangbi');
}
/** Trang bị bày riêng: mỗi phiên chỉ vài món, giá cao. */
function hangTrangBi() {
  return Object.values(ITEMS).filter((i) => i && i.type === 'trangbi' && i.value > 0);
}

/**
 * Lệnh RAO BÁN của bot trong phiên. Bot cày ra gì thì rao nấy, nên nghiêng về
 * nguyên liệu; trang bị hiếm hơn.
 */
export function raoCuaBot(seed, phien) {
  const kho = hangCoTheBan(), eq = hangTrangBi();
  const ra = [];
  for (let i = 0; i < RAO_N; i++) {
    const h = mix(mix((seed >>> 0) || 1, phien >>> 0), h32('rao' + i));
    const dungEq = frac(mix(h, 7)) < 0.22 && eq.length;
    const ds = dungEq ? eq : kho;
    const it = ds[(h >>> 3) % ds.length];
    const sl = dungEq ? 1 : 1 + ((h >>> 11) % 60);
    ra.push({
      id: 'b' + phien + '_' + i, itemId: it.id, sl,
      gia: giaMuaHien(seed, it.id, phien),
      tong: tienPhaiTra(seed, it.id, phien, sl),
    });
  }
  return ra;
}

/**
 * Lệnh THU MUA của bot: bot cần gì thì đăng mua. Giá bot trả đã trừ chênh lệch,
 * người chơi bán vào đây còn phải chịu thuế như mọi giao dịch bán.
 */
export function muaCuaBot(state, seed, phien) {
  const kho = hangCoTheBan();
  const ra = [];
  for (let i = 0; i < MUA_N; i++) {
    const h = mix(mix((seed >>> 0) || 1, phien >>> 0), h32('mua' + i));
    const it = kho[(h >>> 3) % kho.length];
    const sl = 20 + ((h >>> 9) % 400);
    ra.push({
      id: 'm' + phien + '_' + i, itemId: it.id, sl,
      gia: giaBanHien(state, seed, it.id, phien),
      tong: tienVeTui(state, seed, it.id, phien, sl).thuc,
    });
  }
  return ra;
}

/** Ngân sách mua còn lại của bot trong phiên — hết thì không nhận bán thêm. */
export function nganSachConLai(state, now) {
  const s = ensureSan(state);
  const p = phienCua(now);
  if (s.daBanPhien !== p) return NGAN_SACH_PHIEN;
  const daTieu = Object.entries(s.daBan).reduce((t, [id, sl]) => t + fairValue(id) * sl, 0);
  return Math.max(0, NGAN_SACH_PHIEN - daTieu);
}

// ---------- HÀNH ĐỘNG ----------

const ghi = (s, muc) => { s.nhatKy.unshift(muc); if (s.nhatKy.length > NHAT_KY_MAX) s.nhatKy.length = NHAT_KY_MAX; };

/**
 * Bán `sl` món cho sàn. Trả { ok, thuc, thue, loi }.
 * KHÔNG tự trừ túi đồ / cộng Bạc — phần đó do lớp Alpine làm, engine chỉ tính và ghi sổ.
 */
export function banChoSan(state, seed, now, itemId, sl) {
  const s = ensureSan(state);
  nhipSan(state, now);
  const n = Math.max(0, sl | 0);
  if (!n) return { ok: false, loi: 'Số lượng phải lớn hơn 0.' };
  if (!ITEMS[itemId]) return { ok: false, loi: 'Không có món này.' };
  const con = nganSachConLai(state, now);
  const p = phienCua(now);
  const { tho, thue, thuc } = tienVeTui(state, seed, itemId, p, n);
  if (tho > con) return { ok: false, loi: 'Phiên này sàn đã mua đủ hàng — chờ phiên sau.' };
  s.daBan[itemId] = (s.daBan[itemId] || 0) + n;
  s.thu += thuc; s.thue += thue;
  ghi(s, { ts: now, kieu: 'ban', itemId, sl: n, bac: thuc });
  return { ok: true, tho, thue, thuc };
}

/** Mua `sl` món từ một lệnh rao của bot. Trả { ok, tra, loi }. */
export function muaTuSan(state, seed, now, itemId, sl) {
  const s = ensureSan(state);
  nhipSan(state, now);
  const n = Math.max(0, sl | 0);
  if (!n) return { ok: false, loi: 'Số lượng phải lớn hơn 0.' };
  if (!ITEMS[itemId]) return { ok: false, loi: 'Không có món này.' };
  const tra = tienPhaiTra(seed, itemId, phienCua(now), n);
  s.tieu += tra;
  ghi(s, { ts: now, kieu: 'mua', itemId, sl: n, bac: tra });
  return { ok: true, tra };
}

/** Người chơi tự đăng một lệnh (rao bán hoặc thu mua). */
export function dangLenh(state, now, kieu, itemId, sl, gia) {
  const s = ensureSan(state);
  nhipSan(state, now);
  if (s.lenh.length >= LENH_TA_TRAN) return { ok: false, loi: 'Đã treo đủ ' + LENH_TA_TRAN + ' lệnh.' };
  const n = Math.max(0, sl | 0), g = Math.max(1, gia | 0);
  if (!n) return { ok: false, loi: 'Số lượng phải lớn hơn 0.' };
  if (!ITEMS[itemId]) return { ok: false, loi: 'Không có món này.' };
  s.lenh.push({ id: 'ta' + now + '_' + s.lenh.length, kieu, itemId, sl: n, gia: g, ts: now });
  return { ok: true };
}

export function huyLenh(state, lenhId) {
  const s = ensureSan(state);
  const i = s.lenh.findIndex((l) => l.id === lenhId);
  if (i < 0) return { ok: false, loi: 'Lệnh không còn.' };
  const l = s.lenh[i];
  s.lenh.splice(i, 1);
  return { ok: true, lenh: l };
}

/** Bảng giá gần đây của một món — để vẽ đường giá 12 phiên gần nhất. */
export function duongGia(seed, itemId, now, soPhien = 12) {
  const p = phienCua(now);
  const ra = [];
  for (let i = soPhien - 1; i >= 0; i--) ra.push(giaThiTruong(seed, itemId, p - i));
  return ra;
}
