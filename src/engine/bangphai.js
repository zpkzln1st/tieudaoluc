// ============================================================
// BANG PHÁI — engine THUẦN (không DOM, không Alpine). Kiểm bằng node.
//
// VAI: người chơi LẬP BANG và làm BANG CHỦ. Vì thế mới có quyền kích / thăng / hạ chức,
// đặt quyền, duyệt đơn, xây công trình. 12 bang AI suy từ seed là ĐỐI THỦ trên bảng
// Chinh Phạt — không phải chỗ để xin vào.
//
// ⚠ PHÂN VAI VỚI TÔNG MÔN: Tông Môn là NUÔI (đệ tử của mình, trục dọc, dài hạn).
//    Bang Phái là ĐÁNH (tranh hạng với bang khác theo mùa, trục ngang).
//
// LAZY-SIM: bang chúng không có vòng lặp nền. Sản của họ tính bằng HIỆU THỜI GIAN kể từ
// `mocThu` — nên chạy y hệt dù người chơi đang mở game hay đã tắt cả ngày.
//
// ⚠ BUFF CHỈ SỐ nằm ở engine/bangbuff.js (file nhẹ, không import vòng). Đừng nhét vào đây.
// ============================================================
import { LOCATIONS } from '../data/locations.js';
import { YEU_VUONG, YEU_VUONG_BY_ID, ENEMIES } from '../data/combat.js';
import { genRoster, botCombatLv, botTotalLv, botTitle, botAvatar, botArchName, botActivity, botDominant, botTracks } from './bots.js';
import { CAT_HEX, BOT_HO, BOT_TEN, BOT_AVATAR_IDS, ARCHETYPES, ARCHETYPE_IDS } from '../data/bots.js';
import { ITEMS } from '../data/items.js';   // nguồn chân lý tên + lời văn vật phẩm
import { nguHanhMod, heName, NGU_HANH_LIST, tamPhapById } from '../data/votong.js';
import { rng } from './rng.js';           // boc so CO HAT GIONG — may chu tinh lai duoc
import { pushNotif } from './notif.js';     // thuần state, không DOM — dùng chung với chuông + Phi Cáp Đài

/**
 * Báo lên Phi Cáp Đài. CHỈ dùng cho việc XẢY RA KHI NGƯỜI CHƠI KHÔNG NGỒI ĐÓ, hoặc việc lớn
 * cần quay lại xử lí (đơn xin, thưởng chưa lĩnh). Việc do chính tay người chơi vừa bấm thì
 * KHÔNG báo — bấm xong lại nhận thư báo mình vừa bấm là rác.
 */
function baoMinh(state, tieuDe, than, now) {
  pushNotif(state, 'tienMinh', tieuDe, than, now || Date.now());
}
import {
  CHUC, CHUC_BY_ID, LV_LAP_BANG, PHI_LAP_BANG, TV_NEN, TV_MOI_CAP, TV_TRAN,
  CAP_BANG_MAX, bangCongCanCho, KY_NANG_BANG, KY_NANG_BY_ID, giaKyNang,
  CUA_HANG_BANG, CONG_TRINH, CONG_TRINH_BY_ID, giaCongTrinh, gioCongTrinh,
  NV_BANG, NV_BANG_MOI_KY, NV_BANG_KY_MS, TRUY_NA_MOI_NGAY, TRUY_NA_BAC,
  MUA_MS, CP_MOI_KILL, CP_MOI_BOSS, CP_BUFF_HANG, CP_THONG_TRI_HE_SO, MUA_THUONG_BANG,
  BOSS_BANG_KY_MS, BOSS_BANG_LUOT, BOSS_BANG_CD_MS, BOSS_BANG_MAU_HE_SO,
  BC_KY_MS, BC_SO_CAP, BC_CAN_THANG, BC_SU_CAP, BC_TI_LE_SAN, BC_TI_LE_TRAN, BC_NGUONG,
  BC_VET_BAC_NEN, BC_VET_BAC_CAP, BC_VET_MANH, BC_CT_THANG, BC_CT_THUA, BC_VET_KHI_THUA, BC_DAI_VUNG,
  QUYEN_MAC_DINH, BAC_MOI_MINH_CONG,
  CHIEU_HIEN_N, CHIEU_HIEN_MS, GIAO_TINH_TRAN, GIAO_TINH_GIAM_BAC, giaoTinhCan, KN_TRAN_THEO_CT,
} from '../data/bangphai.js';
// Giao Tình nuôi ở Tửu Lâu, tiêu ở đây. engine/tuulau.js chỉ nạp data + bots nên KHÔNG vòng.
import { danhSachQuen, bacGiaoTinh } from './tuulau.js';

export {
  CHUC, CHUC_BY_ID, LV_LAP_BANG, PHI_LAP_BANG, TV_TRAN, CAP_BANG_MAX,
  KY_NANG_BANG, KY_NANG_BY_ID, giaKyNang, CUA_HANG_BANG, CONG_TRINH, CONG_TRINH_BY_ID,
  giaCongTrinh, gioCongTrinh, NV_BANG, TRUY_NA_BAC, MUA_MS, CP_BUFF_HANG, MUA_THUONG_BANG,
  BOSS_BANG_LUOT, bangCongCanCho, QUYEN_MAC_DINH, BAC_MOI_MINH_CONG,
  CHIEU_HIEN_N, CHIEU_HIEN_MS, GIAO_TINH_TRAN, giaoTinhCan,
};

const GIO = 3600000, NGAY_MS = 86400000;
const NHAT_KY_MAX = 80;
const THU_TRAN_MS = 24 * GIO;      // sản của bang chúng dồn tối đa 24 giờ rồi thôi

// ---- băm nguyên, deterministic ----
function h32(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function mix(a, b) { let h = (a ^ Math.imul(b >>> 0, 2654435761)) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13; return h >>> 0; }
const pick = (h, arr) => arr[(h >>> 0) % arr.length];
const r01 = (h) => (h % 100000) / 100000;

const ngayCua = (now) => Math.floor((now || Date.now()) / NGAY_MS);
const muaCua = (now) => Math.floor((now || Date.now()) / MUA_MS);
/** Mùa thứ mấy — đếm từ lúc lập thế giới. muaCua() trả số tuyệt đối (~1980), vô nghĩa với người chơi. */
export const soMua = (world, now) =>
  Math.max(1, muaCua(now) - muaCua((world && world.createdAt) || 0) + 1);
export const muaConLai = (now) => MUA_MS - ((now || Date.now()) % MUA_MS);
const nvKyCua = (now) => Math.floor((now || Date.now()) / NV_BANG_KY_MS);
export const nvKyConLai = (now) => NV_BANG_KY_MS - ((now || Date.now()) % NV_BANG_KY_MS);
const bossKyCua = (now) => Math.floor((now || Date.now()) / BOSS_BANG_KY_MS);
const bossKyConLai = (now) => BOSS_BANG_KY_MS - ((now || Date.now()) % BOSS_BANG_KY_MS);

// ============================================================
// STATE
// ============================================================
/**
 * Dọn `danHoiSinhLuc` khỏi save cũ. Id này CHƯA TỪNG có trong ITEMS — Minh Hội Các từng bán
 * nhầm nó, addItem() ghi thẳng id ma vào túi, vào Minh Khố và vào codex.obtained (Vạn Vật Phổ
 * đếm cả món không tồn tại). Đã sửa cửa hàng nhưng save cũ vẫn ôm đống rác đó, hiện ra là
 * dòng "danHoiSinhLuc ×38" trong kho — có tên máy chứ không có tên người.
 * ⚠ Chỉ xoá ĐÚNG id này, không quét mọi id lạ: gear instance và đồ phổ nằm ở nhánh khác.
 */
const MA_CU = 'danHoiSinhLuc';
function donIdMa(state) {
  if (!state) return;
  if (state.inventory) delete state.inventory[MA_CU];
  if (state.codex && state.codex.obtained) delete state.codex.obtained[MA_CU];
  const b = state.bangPhai && state.bangPhai.bang;
  if (b && b.kho) delete b.kho[MA_CU];
}

export function ensureBangPhai(state) {
  donIdMa(state);
  if (!state.bangPhai || typeof state.bangPhai !== 'object') state.bangPhai = {};
  const b = state.bangPhai;
  if (b.bang === undefined) b.bang = null;
  if (typeof b.congTich !== 'number') b.congTich = 0;      // tiêu được
  if (typeof b.congTichTong !== 'number') b.congTichTong = 0;   // tổng đã kiếm, không giảm
  if (typeof b.gopBac !== 'number') b.gopBac = 0;
  if (!Array.isArray(b.nhatKy)) b.nhatKy = [];
  if (!b.nv || typeof b.nv !== 'object') b.nv = { ky: -1, ds: [], xong: [], moc: null };
  if (!b.truyNa || typeof b.truyNa !== 'object') b.truyNa = { ngay: -1, ds: [], nhan: {}, moc: {} };
  if (!b.bossB || typeof b.bossB !== 'object') b.bossB = { ky: -1, bossId: '', gop: 0, luot: 0, cdDen: 0, thangKy: -1 };
  if (!b.chSo || typeof b.chSo !== 'object') b.chSo = { ngay: -1, mua: {} };
  if (!b.muaThuong || typeof b.muaThuong !== 'object') b.muaThuong = { mua: -1, hang: 0, daNhan: true };
  if (!b.bc || typeof b.bc !== 'object') b.bc = { ky: -1, xep: null, xong: false, su: [], giu: {}, dich: null };
  return b;
}

function bangMoi(ten, tonChi, now) {
  return {
    ten, tonChi: tonChi || '', thongBao: '', lapLuc: now,
    cap: 1, bangCong: 0, quy: 0,
    kho: {}, kyNang: {},
    congTrinh: { tongDan: 1, binhKhiKho: 0, tuLinhTri: 0, bangKho: 0, tramYeuDai: 0 },
    xayDung: null,
    quyen: Object.assign({}, QUYEN_MAC_DINH),
    tv: [], donXin: [],
    mocThu: now,
    cpMua: muaCua(now), cpVung: {}, cpTong: 0,
    hangVung: {},
  };
}

/**
 * Ghi một dòng nhật ký. `ai` (tuỳ chọn) = hồ sơ người liên quan { ten, av, phu } để dòng nhật ký
 * hiện được CHÂN DUNG + thông tin, chứ không phải một dòng chữ trơ.
 */
/** Tên người tô đúng màu nhóm nghề của họ — nhật ký toàn chữ trắng thì nhìn không ra ai. */
const tenMau = (ho) => '<b style="color:' + (ho.mau || '#e2e8f0') + '">' + ho.ten + '</b>';

function ghiNhatKy(state, txt, now, ai) {
  const b = ensureBangPhai(state), ts = now || Date.now();
  b.nhatKy.unshift({ id: 'nk' + ts + '_' + (b.nhatKy.length + 1) + '_' + Math.round(Math.random() * 1e5), txt, ts, ai: ai || null });
  if (b.nhatKy.length > NHAT_KY_MAX) b.nhatKy.length = NHAT_KY_MAX;
  return b.nhatKy[0];
}

// ============================================================
// TÁN TU — bot chưa vào bang nào, là nguồn chiêu mộ.
// ============================================================
/**
 * Bạc để mời một tán tu — **bình phương Tổng Lv rồi nhân 2**, làm tròn tới trăm.
 * Bảng cũ `1200 + Lv×90` gần như phẳng: Lv 494 chỉ đắt hơn Lv 390 có 1,26 lần, nhìn
 * danh sách không thấy ai đáng giá hơn ai. Bình phương làm cao thủ đắt hẳn:
 *   Lv 100 → 20.000 · Lv 250 → 125.000 · Lv 450 → 405.000 · Lv 659 → 868.600
 * Đo trên 200 bot thật (danh sách xếp giảm dần, dải Tổng Lv 73-659 suốt đời thế giới):
 *   chênh lệch đắt nhất/rẻ nhất trong MỘT danh sách 6,2× → **50×** (ngày 1),
 *   2,4× → 6,1× (năm thứ nhất). Ở dải Lv 450-500 giá đúng ~10 lần bảng cũ.
 *   Gom đủ 22 người mạnh nhất: 890.000 → 8,4 triệu Bạc (xây trọn Tổng Đàn hết 3,4 triệu).
 */
export const giaChieuMo = (tongLv, bacQuen) => {
  const lv = Math.max(0, tongLv || 0);
  const goc = Math.max(2000, Math.round((lv * lv) / 50) * 100);
  const bac = Math.min(GIAO_TINH_TRAN, Math.max(0, bacQuen | 0));
  if (!bac) return goc;
  return Math.max(2000, Math.round((goc * (100 - bac * GIAO_TINH_GIAM_BAC)) / 100 / 100) * 100);
};

/**
 * BẢNG CHIÊU HIỀN — vài tán tu bất kỳ, đổi mỗi CHIEU_HIEN_MS, GIÁ ĐẦY ĐỦ.
 * Suy từ (seed + mốc bảng) nên không lưu gì: F5 vẫn đúng người đó, hết giờ là thay lượt khác.
 * Cố ý bốc từ TRỌN 200 bot chứ không chỉ phần đỉnh — dải cấp rộng thì giá mới có chênh lệch
 * thật, và cao thủ mới đáng là thứ phải săn chứ không phải món bày sẵn trên kệ.
 */
/** ID những người đang trên Bảng Chiêu Hiền. Tách riêng vì `chieuMo` cần tra mà không cần hồ sơ. */
function idsChieuHien(state, world, now) {
  const t = now || Date.now(), b = ensureBangPhai(state);
  const ra = new Set();
  if (!b.bang) return ra;
  const seed = (world && world.seed) || 1;
  const roster = genRoster(seed, (world && world.createdAt) || 0, t) || [];
  if (!roster.length) return ra;
  const daCo = new Set(b.bang.tv.map((m) => m.id));
  const don = new Set(b.bang.donXin || []);
  const moc = Math.floor(t / CHIEU_HIEN_MS);
  for (let k = 0; k < roster.length && ra.size < CHIEU_HIEN_N; k++) {
    const r = roster[mix(mix(seed ^ 0x5B3, moc), k) % roster.length];
    if (!r || ra.has(r.id) || daCo.has(r.id) || don.has(r.id)) continue;
    ra.add(r.id);
  }
  return ra;
}
export function bangChieuHien(state, world, now) {
  const t = now || Date.now();
  const ids = idsChieuHien(state, world, t);
  if (!ids.size) return [];
  const roster = genRoster((world && world.seed) || 1, (world && world.createdAt) || 0, t) || [];
  return roster.filter((r) => ids.has(r.id)).map((r) => {
    const o = moTaBot(r, t);
    // Quen rồi thì bảng cũng tính giá quen — không đời nào bắt trả đắt hơn vì gặp lại ở chỗ khác.
    o.bac = bacGiaoTinh(state, r.id);
    o.giaGoc = giaChieuMo(o.tong);
    o.gia = giaChieuMo(o.tong, o.bac);
    o.nguon = 'bang';
    return o;
  }).sort((x, y) => y.tong - x.tong);
}
/** Còn bao lâu thì Bảng Chiêu Hiền thay lượt khác. */
export const chieuHienConLai = (now) => CHIEU_HIEN_MS - ((now || Date.now()) % CHIEU_HIEN_MS);

/**
 * NGƯỜI QUEN Ở TỬU LÂU — ai đã cùng ngươi uống rượu / hỏi chuyện.
 * Ở lại đây cho tới khi mời được hoặc họ đã vào minh; KHÔNG đổi theo giờ như Bảng Chiêu Hiền.
 * `du` = đã đủ bậc để họ chịu nghe lời mời chưa (cao thủ kén hơn, xem giaoTinhCan).
 */
export function nguoiQuen(state, world, now) {
  const t = now || Date.now(), b = ensureBangPhai(state);
  if (!b.bang) return [];
  const roster = genRoster((world && world.seed) || 1, (world && world.createdAt) || 0, t) || [];
  if (!roster.length) return [];
  const daCo = new Set(b.bang.tv.map((m) => m.id));
  const don = new Set(b.bang.donXin || []);
  const byId = new Map(roster.map((r) => [r.id, r]));
  return danhSachQuen(state).map((q) => {
    const r = byId.get(q.botId);
    if (!r || daCo.has(r.id) || don.has(r.id)) return null;
    const o = moTaBot(r, t);
    o.bac = q.bac; o.can = giaoTinhCan(o.tong); o.du = q.bac >= o.can;
    o.giaGoc = giaChieuMo(o.tong);
    o.gia = giaChieuMo(o.tong, q.bac);
    o.nguon = 'quen';
    return o;
  }).filter(Boolean).sort((x, y) => (y.du - x.du) || (y.tong - x.tong));
}

/** Hồ sơ một bot: lấy nốt nghề thật / lối chơi / việc đang làm chứ không chỉ tên với cấp. */
function moTaBot(r, t) {
  const d = botDominant(r, t);
  return {
    id: r.id, ten: r.name, lv: botCombatLv(r, t), tong: botTotalLv(r, t),
    hieu: botTitle(r, t), av: botAvatar(r), loai: botArchName(r), lam: botActivity(r, t),
    nhom: d.cat, mau: CAT_HEX[d.cat] || '#94a3b8',
  };
}

/** Bot chưa ở trong bang người chơi. Sắp theo sức giảm dần. */
export function danhSachTanTu(state, world, now) {
  const t = now || Date.now(), b = ensureBangPhai(state);
  const roster = genRoster((world && world.seed) || 1, (world && world.createdAt) || 0, t) || [];
  const daCo = new Set((b.bang ? b.bang.tv : []).map((m) => m.id));
  const donXin = new Set((b.bang ? b.bang.donXin : []) || []);
  return roster.filter((r) => !daCo.has(r.id)).map((r) => {
    const o = moTaBot(r, t);
    o.gia = giaChieuMo(o.tong); o.daNop = donXin.has(r.id);
    return o;
  }).sort((x, y) => y.tong - x.tong);
}

// ============================================================
// 12 BANG AI — ĐỐI THỦ trên bảng Chinh Phạt. Không lưu save, suy từ seed.
// ============================================================
const SO_BANG_AI = 12;
const HO_BANG = ['Thanh', 'Huyền', 'Xích', 'Bạch', 'Kim', 'Vân', 'Lôi', 'Hải', 'Cửu', 'Thiết', 'Ngọc', 'Phi'];
const DUOI_BANG = ['Long Bang', 'Kiếm Minh', 'Đao Hội', 'Phong Đường', 'Sa Môn', 'Vũ Các', 'Tiêu Cục', 'Sơn Trại', 'Thủy Trại', 'Thương Hội', 'Ẩn Cốc', 'Minh Giáo'];
const MAU_BANG = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#e2e8f0', '#94a3b8'];
const MAU_BANG_TA = '#f5b942';

/**
 * Bang AI: tên, cấp, số người, và TỐC ĐỘ ĐIỂM CHINH PHẠT mỗi giờ ở từng vùng.
 * Tốc độ cố định theo (seed, mùa, bang, vùng) nên bảng xếp hạng bò lên đều trong suốt mùa —
 * người chơi thấy mình đang bị đuổi kịp chứ không phải một bảng số đứng im.
 */
export function bangAI(world, now) {
  const t = now || Date.now(), seed = (world && world.seed) || 1, mua = muaCua(t);
  const troiGio = Math.max(0, (t - mua * MUA_MS) / GIO);
  const out = [];
  for (let i = 0; i < SO_BANG_AI; i++) {
    const h = mix(mix(seed ^ 0x4B17, mua), i);
    const cap = 4 + (h % 22);                                  // cấp bang 4-25
    const soTv = 8 + (mix(h, 7) % 18);                          // 8-25 người
    const cpVung = {}; let cpTong = 0;
    LOCATIONS.forEach((loc, j) => {
      const hh = mix(mix(h, 0x9E11), j);
      // Bang nào cũng chỉ dồn sức vào vài vùng — rải đều thì vùng nào cũng đông, không ai
      // trội, người chơi chen vào chỗ nào cũng như nhau và bảng hạng thành vô nghĩa.
      const uuTien = (mix(hh, 3) % 100) < 34 ? 1 : 0.16;
      // ⚠ Do lai: de muc cu (110-630/gio) thi bang AI dan dau mot vung ~900k diem mot mua,
      // nguoi choi cay 3-4 gio/ngay khong bao gio duoi kip -> bang xep hang thanh trang tri.
      const gio = Math.round((30 + (hh % 150)) * uuTien * (0.7 + cap / 30));
      const diem = Math.round(gio * troiGio);
      cpVung[loc.id] = diem; cpTong += diem;
    });
    out.push({
      id: 'ai' + i, ten: pick(mix(h, 3), HO_BANG) + ' ' + DUOI_BANG[i % DUOI_BANG.length],
      mauCo: MAU_BANG[i % MAU_BANG.length], cap, soTv, cpVung, cpTong, laTa: false,
    });
  }
  return out;
}

// ============================================================
// BANG CỦA NGƯỜI CHƠI
// ============================================================
export function tranThanhVien(bang) {
  if (!bang) return 0;
  const td = (bang.congTrinh && bang.congTrinh.tongDan) | 0;
  return Math.min(TV_TRAN, TV_NEN + td * TV_MOI_CAP + Math.floor((bang.cap || 1) / 5));
}

export function loiTenBang(ten) {
  const s = String(ten || '').trim();
  if (s.length < 2) return 'Tên bang phải từ 2 chữ trở lên.';
  if (s.length > 16) return 'Tên bang không quá 16 chữ.';
  if (/[<>&"'/\\]/.test(s)) return 'Tên bang có ký tự không dùng được.';
  return '';
}

/** Lập bang. Trả null nếu không đủ điều kiện (đã có bang / tên sai). KHÔNG tự trừ Bạc. */
export function lapBang(state, { ten, tonChi }, now) {
  const b = ensureBangPhai(state), t = now || Date.now();
  if (b.bang) return null;
  if (loiTenBang(ten)) return null;
  b.bang = bangMoi(String(ten).trim(), String(tonChi || '').trim(), t);
  b.congTich = 0; b.congTichTong = 0; b.gopBac = 0;
  ghiNhatKy(state, 'Dựng cờ <b>' + b.bang.ten + '</b> — từ nay giang hồ có thêm một thế lực.', t);
  return b.bang;
}

/** Giải tán: xoá sạch bang. Không hoàn Bạc, không hoàn Công Tích. */
export function giaiTan(state, now) {
  const b = ensureBangPhai(state), ten = b.bang ? b.bang.ten : '';
  b.bang = null; b.congTich = 0; b.congTichTong = 0; b.gopBac = 0;
  b.nv = { ky: -1, ds: [], xong: [], moc: null };
  b.truyNa = { ngay: -1, ds: [], nhan: {}, moc: {} };
  b.bossB = { ky: -1, bossId: '', gop: 0, luot: 0, cdDen: 0, thangKy: -1 };
  if (ten) ghiNhatKy(state, 'Giải tán <b>' + ten + '</b>. Cờ hạ xuống, người cũng tan biến.', now);
  return b;
}

// ---------- THÀNH VIÊN ----------
/** Danh sách thành viên đã bù đủ thông tin bot (tên, cấp, nghề, đang làm gì). */
export function thanhVien(state, world, now) {
  const b = ensureBangPhai(state), t = now || Date.now();
  if (!b.bang) return [];
  const roster = genRoster((world && world.seed) || 1, (world && world.createdAt) || 0, t) || [];
  const theoId = {}; roster.forEach((r) => { theoId[r.id] = r; });
  return b.bang.tv.map((m) => {
    const r = theoId[m.id]; if (!r) return null;
    const o = moTaBot(r, t);
    const c = CHUC_BY_ID[m.chuc] || CHUC_BY_ID.tanNhap;
    return Object.assign(o, {
      chuc: c.id, chucTen: c.ten, chucBac: c.bac, chucMau: c.mau,
      vaoLuc: m.vaoLuc || 0, gopBac: m.gopBac || 0, ct: m.ct || 0, cp: m.cp || 0,
      vung: m.vung || LOCATIONS[0].id,
    });
  }).filter(Boolean).sort((x, y) => (y.chucBac - x.chucBac) || (y.tong - x.tong));
}

const CHUC_THAP = 'tanNhap';
/** Chiêu mộ thẳng (bang chủ mời). Trả false nếu đầy / đã có / không tìm thấy. */
export function chieuMo(state, botId, world, now) {
  const b = ensureBangPhai(state), t = now || Date.now();
  if (!b.bang || !botId) return false;
  if (b.bang.tv.length >= tranThanhVien(b.bang)) return false;
  if (b.bang.tv.some((m) => m.id === botId)) return false;
  const roster = genRoster((world && world.seed) || 1, (world && world.createdAt) || 0, t) || [];
  const r = roster.find((x) => x.id === botId); if (!r) return false;
  // CỬA GIAO TÌNH — chặn ở đây chứ không ở lớp view, để không đường nào lách được.
  // Người trên Bảng Chiêu Hiền là đường công khai, ai cũng mời được (chỉ đắt hơn).
  // Ngoài bảng ra thì phải quen đủ bậc: cao thủ kén hơn (giaoTinhCan).
  // Duyệt đơn xin vào minh đi đường riêng (duyet -> chieuMo sau khi đã gỡ khỏi donXin), nên
  // phải cho qua: người ta tự tìm tới cửa thì không có lý gì bắt đi uống rượu làm quen.
  const trongDon = (b.bang.donXin || []).includes(botId);
  if (!trongDon && !idsChieuHien(state, world, t).has(botId)) {
    if (bacGiaoTinh(state, botId) < giaoTinhCan(botTotalLv(r, t))) return false;
  }
  // Mỗi người cày một vùng riêng — điểm Chinh Phạt của họ đổ vào đúng vùng đó, nên bang
  // đông người thì phủ được nhiều vùng chứ không dồn hết một chỗ.
  const vung = LOCATIONS[mix(h32(botId), 0x1D3) % LOCATIONS.length].id;
  b.bang.tv.push({ id: botId, chuc: CHUC_THAP, vaoLuc: t, gopBac: 0, ct: 0, cp: 0, vung });
  b.bang.donXin = (b.bang.donXin || []).filter((x) => x !== botId);
  const ho = moTaBot(r, t);
  ghiNhatKy(state, tenMau(ho) + ' nhập minh.', t,
    { ten: ho.ten, av: ho.av, mau: ho.mau, phu: ho.hieu + ' · ' + ho.loai + ' · Lv ' + ho.lv + ' · Tổng Lv ' + ho.tong });
  return true;
}

/** Kích khỏi bang. Bang chủ không kích được chính mình (người chơi không nằm trong danh sách). */
export function kichNguoi(state, botId, world, now) {
  const b = ensureBangPhai(state), t = now || Date.now();
  if (!b.bang) return false;
  const i = b.bang.tv.findIndex((m) => m.id === botId); if (i < 0) return false;
  const roster = genRoster((world && world.seed) || 1, (world && world.createdAt) || 0, t) || [];
  const r = roster.find((x) => x.id === botId);
  const ho = r ? moTaBot(r, now || Date.now()) : null;
  b.bang.tv.splice(i, 1);
  ghiNhatKy(state, (ho ? tenMau(ho) : '<b>Một người</b>') + ' bị đuổi khỏi minh.', now,
    ho ? { ten: ho.ten, av: ho.av, mau: ho.mau, phu: ho.hieu + ' · ' + ho.loai + ' · Lv ' + ho.lv } : null);
  return true;
}

/** Đổi chức. `len` = true thăng, false hạ. Trả '' nếu xong, ngược lại trả lý do. */
export function doiChuc(state, botId, len, now, world) {
  const b = ensureBangPhai(state), t = now || Date.now();
  if (!b.bang) return 'Chưa có bang.';
  const m = b.bang.tv.find((x) => x.id === botId); if (!m) return 'Không có người này.';
  const cur = CHUC_BY_ID[m.chuc] || CHUC_BY_ID[CHUC_THAP];
  const bacMoi = cur.bac + (len ? 1 : -1);
  if (bacMoi < 0) return 'Đã ở chức thấp nhất.';
  if (bacMoi >= 6) return 'Chức Bang Chủ chỉ có một người — là ngươi.';
  const moi = CHUC.find((c) => c.bac === bacMoi); if (!moi) return 'Không có chức đó.';
  if (len) {
    const dang = b.bang.tv.filter((x) => x.chuc === moi.id).length;
    if (dang >= moi.tran) return moi.ten + ' chỉ có ' + moi.tran + ' suất, đã đủ người.';
  }
  m.chuc = moi.id;
  const roster = genRoster((world && world.seed) || 1, (world && world.createdAt) || 0, t) || [];
  const r = roster.find((x) => x.id === botId);
  const ho = r ? moTaBot(r, now || Date.now()) : null;
  ghiNhatKy(state, (ho ? tenMau(ho) : '<b>Một người</b>') + ' ' + (len ? 'được thăng làm ' : 'bị giáng xuống ')
    + '<b style="color:' + moi.mau + '">' + moi.ten + '</b>.', now,
    ho ? { ten: ho.ten, av: ho.av, mau: ho.mau, phu: ho.hieu + ' · ' + ho.loai + ' · Lv ' + ho.lv } : null);
  return '';
}

/** Đơn xin vào bang — tán tu tự nộp theo thời gian (bang càng to càng nhiều người xin). */
export function sinhDonXin(state, world, now) {
  const b = ensureBangPhai(state), t = now || Date.now();
  if (!b.bang) return;
  const seed = (world && world.seed) || 1;
  const slot = Math.floor(t / (6 * GIO));                    // mỗi 6 giờ xét một lượt
  if (b.bang._donSlot === slot) return;
  b.bang._donSlot = slot;
  const roster = genRoster(seed, (world && world.createdAt) || 0, t) || [];
  const daCo = new Set(b.bang.tv.map((m) => m.id));
  const don = new Set(b.bang.donXin || []);
  // Phi Cáp Trạm: mỗi cấp thêm một người tìm tới cửa mỗi lượt.
  const soXin = 1 + capCongTrinh(state, 'phicaptram') + (mix(mix(seed, 0x2C7), slot) % 2);
  for (let k = 0; k < soXin; k++) {
    const r = roster[mix(mix(seed ^ 0x77, slot), k) % roster.length];
    if (!r || daCo.has(r.id) || don.has(r.id)) continue;
    don.add(r.id);
  }
  const truoc = (b.bang.donXin || []).length;
  b.bang.donXin = [...don].slice(-12);                        // giữ tối đa 12 đơn gần nhất
  const them = b.bang.donXin.length - truoc;
  if (them > 0) baoMinh(state, 'Có người xin nhập minh', them + ' người nghe danh ' + b.bang.ten + ' mà tìm tới cửa — sang tab Chiêu Mộ duyệt đơn (nhận không tốn Bạc).', t);
}

/**
 * HỒ SƠ CHI TIẾT một minh chúng — dựng riêng cho popup Xem Thông Tin, không nhét vào
 * thanhVien() vì đắt hơn (tính cấp cả 11 track) mà danh sách thì gọi mỗi nhịp.
 * Trả null nếu người này không còn trong minh.
 */
export function hoSoMinhChung(state, world, botId, now) {
  const b = ensureBangPhai(state), t = now || Date.now();
  if (!b.bang) return null;
  const raw = b.bang.tv.find((m) => m.id === botId); if (!raw) return null;
  const roster = genRoster((world && world.seed) || 1, (world && world.createdAt) || 0, t) || [];
  const r = roster.find((x) => x.id === botId); if (!r) return null;
  const o = moTaBot(r, t);
  const c = CHUC_BY_ID[raw.chuc] || CHUC_BY_ID.tanNhap;
  const san = sanMoiGio(o, c.bac);
  // công lao trong trận Trảm Yêu đang diễn ra (nếu đã mở Trảm Yêu Đài)
  let dameBoss = 0;
  try { const bb = bossBang(state, world, t); if (bb) { const x = bb.cong.find((y) => y.id === botId); dameBoss = x ? x.dame : 0; } } catch (e) {}
  return Object.assign(o, {
    chuc: c.id, chucTen: c.ten, chucBac: c.bac, chucMau: c.mau,
    vaoLuc: raw.vaoLuc || 0, gopBac: raw.gopBac || 0, cp: raw.cp || 0,
    vung: raw.vung || LOCATIONS[0].id,
    vungTen: (LOCATIONS.find((l) => l.id === (raw.vung || '')) || LOCATIONS[0]).name,
    san,                                   // { bac, bangCong, cp } mỗi giờ
    dameBoss,
    nghe: botTracks(r, t).filter((x) => x.lv > 0).sort((x, y) => y.lv - x.lv),
  });
}

// ---------- CỐNG HIẾN ----------
/**
 * Góp Bạc: 1 Bạc = 1 Công Tích cho ngươi, Bạc vào Ngân Khố, và cứ BAC_MOI_MINH_CONG Bạc
 * đổi được 1 Minh Cống. KHÔNG tự trừ Bạc — lớp view lo việc đó.
 */
export function congHien(state, bac, now) {
  const b = ensureBangPhai(state), n = Math.max(0, Math.floor(bac || 0));
  if (!b.bang || n <= 0) return 0;
  b.congTich += n; b.congTichTong += n; b.gopBac += n;
  b.bang.quy += n;
  themBangCong(state, Math.floor(n / BAC_MOI_MINH_CONG), now);
  return n;
}

/** Cộng Bang Cống + tự lên cấp bang. Trả số cấp vừa lên. */
export function themBangCong(state, diem, now) {
  const b = ensureBangPhai(state);
  if (!b.bang || !(diem > 0)) return 0;
  const boost = 1 + ((b.bang.congTrinh.tongDan | 0) * 0.04);   // Tổng Đàn +4%/cấp
  b.bang.bangCong += Math.round(diem * boost);
  let len = 0;
  while (b.bang.cap < CAP_BANG_MAX && b.bang.bangCong >= bangCongCanCho(b.bang.cap)) {
    b.bang.bangCong -= bangCongCanCho(b.bang.cap);
    b.bang.cap += 1; len++;
  }
  if (len) {
    ghiNhatKy(state, "Tiên Minh thăng lên <b>cấp " + b.bang.cap + "</b>.", now);
    baoMinh(state, "Tiên Minh thăng cấp", b.bang.ten + " lên cấp " + b.bang.cap + " — mở thêm suất minh chúng, hàng trong Minh Hội Các và bậc kĩ năng.", now);
  }
  return len;
}

/** Cộng Công Tích cho người chơi (từ nhiệm vụ, truy nã, boss...). */
function themCongTich(state, n) {
  const b = ensureBangPhai(state), v = Math.max(0, Math.round(n || 0));
  if (!b.bang || !v) return 0;
  b.congTich += v; b.congTichTong += v;
  return v;
}

// ---------- SẢN CỦA BANG CHÚNG (lazy-sim) ----------
/**
 * Sản mỗi giờ của một thành viên. Chức cao thì làm khoẻ hơn một chút.
 * ⚠ CP để THẤP có chủ ý: Chinh Phạt phải do NGƯỜI CHƠI đi đánh quái mà ra (3 điểm/con, cày
 * một giờ ~2.000 điểm). Để bang chúng tự cày ra điểm thì bảng xếp hạng tự bò lên khi treo máy,
 * và câu "chinh phạt bằng cách đánh quái" mất nghĩa.
 */
function sanMoiGio(m, chucBac) {
  const k = 1 + chucBac * 0.06;
  return {
    bac: Math.round(m.tong * 0.25 * k),
    bangCong: Math.round(m.tong * 0.06 * k),
    cp: Math.round(m.tong * 0.02 * k),
  };
}

/**
 * Thu sản bang chúng kể từ `mocThu`. Gọi lúc mở view + mỗi nhịp; chạy đúng cả khi vừa mở lại
 * game sau một đêm. Dồn tối đa THU_TRAN_MS để tắt game một tuần không đổ về một cục vô lý.
 */
export function thuSan(state, world, now) {
  const b = ensureBangPhai(state), t = now || Date.now();
  if (!b.bang) return null;
  const troi = Math.min(THU_TRAN_MS, Math.max(0, t - (b.bang.mocThu || t)));
  if (troi < 60000) return null;                              // dưới 1 phút thì khỏi
  const gio = troi / GIO;
  const ds = thanhVien(state, world, t);
  let bac = 0, bangCong = 0;
  const khoBoost = 1 + ((b.bang.congTrinh.bangKho | 0) * 0.05);
  for (const m of ds) {
    const s = sanMoiGio(m, m.chucBac);
    const addBac = Math.round(s.bac * gio * khoBoost);
    const addCp = Math.round(s.cp * gio);
    bac += addBac; bangCong += Math.round(s.bangCong * gio);
    const raw = b.bang.tv.find((x) => x.id === m.id);
    if (raw) { raw.gopBac = (raw.gopBac || 0) + addBac; raw.cp = (raw.cp || 0) + addCp; }
    themCpVung(state, m.vung, addCp, t);
  }
  b.bang.quy += bac;
  themBangCong(state, bangCong, t);
  b.bang.mocThu = t;
  return { gio: Math.round(gio * 10) / 10, bac, bangCong };
}

// ---------- KHO BANG ----------
export function oKhoToiDa(bang) { return 40 + ((bang && bang.congTrinh.bangKho | 0) * 20); }
export function gopKho(state, itemId, so) {
  const b = ensureBangPhai(state), n = Math.max(0, Math.floor(so || 0));
  if (!b.bang || !itemId || n <= 0) return 0;
  const kho = b.bang.kho;
  if (!kho[itemId] && Object.keys(kho).length >= oKhoToiDa(b.bang)) return 0;   // hết ô
  kho[itemId] = (kho[itemId] || 0) + n;
  themBangCong(state, Math.max(1, Math.round(n / 4)));
  return n;
}
export function rutKho(state, itemId, so) {
  const b = ensureBangPhai(state), n = Math.max(0, Math.floor(so || 0));
  if (!b.bang || !itemId || n <= 0) return 0;
  const co = b.bang.kho[itemId] || 0, lay = Math.min(co, n);
  if (!lay) return 0;
  b.bang.kho[itemId] = co - lay;
  if (b.bang.kho[itemId] <= 0) delete b.bang.kho[itemId];
  return lay;
}
/** Bậc chức có đủ quyền làm việc `k` không. Bang chủ (người chơi) luôn đủ. */
export function duQuyen(state, k, chucBac) {
  const b = ensureBangPhai(state);
  if (!b.bang) return false;
  if (chucBac == null) return true;                            // người chơi = bang chủ
  return chucBac >= ((b.bang.quyen || QUYEN_MAC_DINH)[k] | 0);
}
export function datQuyen(state, k, bac) {
  const b = ensureBangPhai(state);
  if (!b.bang || QUYEN_MAC_DINH[k] === undefined) return false;
  b.bang.quyen[k] = Math.max(0, Math.min(5, bac | 0));
  return true;
}

// ---------- KĨ NĂNG BANG ----------
export function capKyNang(state, id) {
  const b = ensureBangPhai(state);
  return (b.bang && b.bang.kyNang[id]) | 0;
}
/** Trần một kĩ năng: maxLv của nó, nhưng nhánh chiến đấu còn bị Binh Khí Khố chặn. */
export function tranKyNang(state, kn) {
  const b = ensureBangPhai(state);
  if (!b.bang) return 0;
  // Mỗi nhóm kĩ năng do MỘT công trình mở trần (bảng KN_TRAN_THEO_CT ở data). Khoá không có
  // trong bảng thì không ai chặn. Cấp ĐÃ HỌC không bị lấy lại — trần chỉ chặn nâng tiếp.
  const ctId = KN_TRAN_THEO_CT[kn.key];
  if (!ctId) return kn.maxLv;
  return Math.min(kn.maxLv, (b.bang.congTrinh[ctId] | 0));
}
/** Học/nâng một kĩ năng. Trả '' nếu xong, ngược lại trả lý do. */
export function hocKyNang(state, id, now) {
  const b = ensureBangPhai(state), kn = KY_NANG_BY_ID[id];
  if (!b.bang || !kn) return 'Không có kĩ năng này.';
  const lv = capKyNang(state, id);
  if (b.bang.cap < kn.capBang) return 'Cần bang cấp ' + kn.capBang + '.';
  const tran = tranKyNang(state, kn);
  if (lv >= tran) return lv >= kn.maxLv ? 'Đã học tới mức tối đa.' : 'Cần nâng Binh Khí Khố lên cấp ' + (lv + 1) + '.';
  const gia = giaKyNang(kn, lv + 1);
  if (b.congTich < gia) return 'Thiếu Công Tích — cần ' + gia + '.';
  b.congTich -= gia;
  b.bang.kyNang[id] = lv + 1;
  ghiNhatKy(state, 'Toàn minh luyện thành <b>' + kn.ten + '</b> cấp ' + (lv + 1) + '.', now);
  return '';
}

// ---------- CỬA HÀNG BANG ----------
function ensureChSo(state, now) {
  const b = ensureBangPhai(state), ng = ngayCua(now);
  if (b.chSo.ngay !== ng) b.chSo = { ngay: ng, mua: {} };
  return b.chSo;
}
export function danhSachHang(state, now) {
  const b = ensureBangPhai(state), s = ensureChSo(state, now);
  const cap = b.bang ? b.bang.cap : 0;
  return CUA_HANG_BANG.map((h) => {
    // TÊN + LỜI VĂN LẤY THẲNG TỪ ITEMS, không chép tay sang bảng cửa hàng. Chép tay là đẻ ra
    // bản thứ hai rồi lệch: đã dính vụ cửa hàng ghi "Ghép đủ bộ Hoàng Kim..." còn ITEMS ghi
    // "Kim loại quý ngưng từ tà khí Yêu Vương...", tên thì rụng mất chữ "Hoàng Kim".
    // Tiền tệ không có mục trong ITEMS nên vẫn dùng ten/desc ghi ở data.
    const it = h.itemId ? ITEMS[h.itemId] : null;
    return {
      ...h,
      ten: (it && it.name) || h.ten || h.itemId || h.id,
      desc: (it && it.desc) || h.desc || '',
      daMua: s.mua[h.id] | 0, conLai: Math.max(0, h.han - (s.mua[h.id] | 0)),
      moKhoa: cap >= h.capBang, muaDuoc: cap >= h.capBang && (s.mua[h.id] | 0) < h.han && b.congTich >= h.gia,
    };
  });
}
/**
 * Mua một món. KHÔNG tự phát vật phẩm/tiền — trả đơn hàng để lớp view gọi addItem/cộng tiền,
 * vì engine THUẦN không được nạp inventory (kiểm bằng node sẽ kéo cả cây phụ thuộc).
 * Trả null nếu không mua được.
 */
export function muaHang(state, id, now) {
  const b = ensureBangPhai(state), s = ensureChSo(state, now);
  const h = CUA_HANG_BANG.find((x) => x.id === id); if (!h || !b.bang) return null;
  if (b.bang.cap < h.capBang) return null;
  if ((s.mua[h.id] | 0) >= h.han) return null;
  if (b.congTich < h.gia) return null;
  b.congTich -= h.gia;
  s.mua[h.id] = (s.mua[h.id] | 0) + 1;
  // ⚠ `ten` phải tra ITEMS trước: món có itemId KHÔNG còn giữ `ten` ở data nữa (lore lấy từ
  // ITEMS). Lấy thẳng h.ten là ra "Đổi được undefined."
  const it = h.itemId ? ITEMS[h.itemId] : null;
  return { itemId: h.itemId || null, tienTe: h.tienTe || null, so: h.so, ten: (it && it.name) || h.ten || h.itemId || h.id };
}

// ---------- CÔNG TRÌNH ----------
export function capCongTrinh(state, id) {
  const b = ensureBangPhai(state);
  return (b.bang && b.bang.congTrinh[id]) | 0;
}
/** Khởi công. Trả '' nếu xong, ngược lại trả lý do. Trừ Bạc từ QUỸ BANG, không phải ví người chơi. */
export function xayCongTrinh(state, id, now) {
  const b = ensureBangPhai(state), ct = CONG_TRINH_BY_ID[id], t = now || Date.now();
  if (!b.bang || !ct) return 'Không có công trình này.';
  if (b.bang.xayDung) return 'Đang xây ' + (CONG_TRINH_BY_ID[b.bang.xayDung.id] || {}).ten + ' rồi.';
  const lv = capCongTrinh(state, id) + 1;
  if (lv > ct.maxLv) return 'Đã tới cấp cao nhất.';
  if (lv > b.bang.cap) return 'Công trình không vượt được cấp bang (' + b.bang.cap + ').';
  const gia = giaCongTrinh(ct, lv);
  if (b.bang.quy < gia) return 'Ngân Khố thiếu — cần ' + gia + ' Bạc.';
  b.bang.quy -= gia;
  b.bang.xayDung = { id, lv, xong: t + gioCongTrinh(ct, lv) * GIO };
  ghiNhatKy(state, 'Khởi công <b>' + ct.ten + '</b> cấp ' + lv + '.', t);
  return '';
}
/** Hoàn công nếu tới giờ. Gọi mỗi nhịp — chạy được cả khi người chơi offline suốt lúc xây. */
export function soatXayDung(state, now) {
  const b = ensureBangPhai(state), t = now || Date.now();
  if (!b.bang || !b.bang.xayDung) return null;
  if (t < b.bang.xayDung.xong) return null;
  const { id, lv } = b.bang.xayDung;
  b.bang.congTrinh[id] = Math.max(b.bang.congTrinh[id] | 0, lv);
  b.bang.xayDung = null;
  const ct = CONG_TRINH_BY_ID[id];
  ghiNhatKy(state, "<b>" + (ct ? ct.ten : id) + "</b> xây xong, đạt cấp " + lv + ".", t);
  baoMinh(state, "Công trình hoàn công", (ct ? ct.ten : id) + " đã xây xong, đạt cấp " + lv + ".", t);
  return { id, lv, ten: ct ? ct.ten : id };
}

// ============================================================
// NHIỆM VỤ BANG — cả bang cùng góp, đổi mỗi tuần.
// Đo bằng cách chụp MỐC đầu kỳ rồi lấy hiệu, khỏi phải cắm bộ đếm riêng khắp nơi.
// ============================================================
function tongKills(state) {
  const k = (state.counters && state.counters.kills) || {};
  let s = 0; for (const id in k) if (Object.prototype.hasOwnProperty.call(k, id)) s += k[id] || 0;
  return s;
}
function tongProduced(state) {
  const p = (state.counters && state.counters.produced) || {};
  let s = 0; for (const id in p) if (Object.prototype.hasOwnProperty.call(p, id)) s += p[id] || 0;
  return s;
}
function tongBossKill(state) {
  const h = (state.boss && state.boss.history) || [];
  return h.filter((x) => x && x.win).length;
}
function mocHienTai(state) {
  const b = ensureBangPhai(state);
  return {
    kills: tongKills(state), produced: tongProduced(state),
    bac: b.gopBac || 0, boss: tongBossKill(state),
  };
}
/**
 * Chỉ tiêu của một nhiệm vụ bang — CO GIÃN THEO SỐ NGƯỜI. Bang 6 người và bang 25 người mà
 * cùng một con số thì bang to xong trong nửa ngày, bang nhỏ cả tuần không tới.
 */
export function chiTieuNv(d, soTv) { return Math.round(d.can * (1 + Math.max(0, soTv) * 0.15)); }

/**
 * Phần bang chúng góp vào nhiệm vụ — suy từ thời gian đã trôi trong kỳ, không lưu bộ đếm.
 * ⚠ Hệ số chỉnh sao cho bang chúng MỘT MÌNH chỉ tới ~55% chỉ tiêu sau trọn 7 ngày. Phần còn
 * lại là của người chơi. Để cao hơn thì tuần nào cũng tự xong, người chơi chẳng phải làm gì.
 * Tính từ lúc LẬP BANG nếu bang mới dựng giữa kỳ, không tính khống phần trước đó.
 */
function gopCuaBangChung(state, world, loai, now) {
  const b = ensureBangPhai(state);
  if (!b.bang) return 0;
  const ky = nvKyCua(now), dauKy = Math.max(ky * NV_BANG_KY_MS, b.bang.lapLuc || 0);
  const troiGio = Math.max(0, (now - dauKy) / GIO);
  const ds = thanhVien(state, world, now);
  let s = 0;
  for (const m of ds) {
    const k = 1 + m.chucBac * 0.06;
    if (loai === 'kill') s += m.lv * 0.0160 * k;
    else if (loai === 'gather') s += m.tong * 0.0022 * k;
    else if (loai === 'bac') s += m.tong * 0.230 * k;
    else if (loai === 'boss') s += m.lv * 0.00022 * k;
  }
  return Math.round(s * troiGio);
}

function ensureNv(state, world, now) {
  const b = ensureBangPhai(state), ky = nvKyCua(now);
  if (!b.bang) return b.nv;
  if (b.nv.ky !== ky || !b.nv.moc || !b.nv.ds.length) {
    const seed = (world && world.seed) || 1;
    const pool = NV_BANG.slice();
    const ds = [];
    for (let i = 0; i < Math.min(NV_BANG_MOI_KY, pool.length); i++) {
      const j = mix(mix(seed ^ 0x5A1, ky), i) % pool.length;
      ds.push(pool.splice(j, 1)[0].id);
    }
    b.nv = { ky, ds, xong: [], moc: mocHienTai(state) };
  }
  return b.nv;
}
export function danhSachNv(state, world, now) {
  const b = ensureBangPhai(state); if (!b.bang) return [];
  const v = ensureNv(state, world, now), m = v.moc || mocHienTai(state);
  const soTv = b.bang.tv.length;
  return v.ds.map((id) => {
    const d = NV_BANG.find((x) => x.id === id); if (!d) return null;
    let cuaTa = 0;
    if (d.loai === 'kill') cuaTa = Math.max(0, tongKills(state) - m.kills);
    else if (d.loai === 'gather') cuaTa = Math.max(0, tongProduced(state) - m.produced);
    else if (d.loai === 'bac') cuaTa = Math.max(0, (b.gopBac || 0) - m.bac);
    else if (d.loai === 'boss') cuaTa = Math.max(0, tongBossKill(state) - m.boss);
    const cuaBang = gopCuaBangChung(state, world, d.loai, now);
    const can = chiTieuNv(d, soTv);
    const dat = Math.min(can, cuaTa + cuaBang);
    return { ...d, can, cuaTa, cuaBang, dat, xong: v.xong.indexOf(id) >= 0, dat100: dat >= can };
  }).filter(Boolean);
}
/** Lĩnh thưởng một nhiệm vụ bang đã xong. Trả số Công Tích, 0 nếu chưa được. */
export function nhanNv(state, world, id, now) {
  const b = ensureBangPhai(state), v = ensureNv(state, world, now);
  if (v.xong.indexOf(id) >= 0) return 0;
  const q = danhSachNv(state, world, now).find((x) => x.id === id);
  if (!q || !q.dat100) return 0;
  v.xong.push(id);
  themCongTich(state, q.ct);
  themBangCong(state, q.bangCong, now);
  ghiNhatKy(state, 'Hoàn thành minh vụ <b>' + q.ten + '</b> — được ' + q.ct + ' Công Tích.', now);
  return q.ct;
}

// ============================================================
// NHIỆM VỤ TRUY NÃ — bảng lệnh đổi mỗi ngày, mục tiêu là quái/Yêu Vương có thật.
// ============================================================
const QUAI_LIST = Object.keys(ENEMIES || {}).map((id) => ({ id, ...ENEMIES[id] }))
  .filter((e) => !e.isBoss).sort((a, b2) => (a.reqLevel || 1) - (b2.reqLevel || 1));

/**
 * Bảng truy nã đổi mỗi ngày, đủ 4 bậc.
 * ⚠ Mục tiêu phải HỢP CẤP người chơi: chỉ bốc trong đám yêu thú họ đã mở khoá, rồi chia
 * thành ba khoảng cấp cho ba bậc đầu. Bốc bừa cả bảng thì lệnh "Truy Nã Thường" lại nhắm
 * con Lv 92 — nhận xong không giết nổi.
 */
function ensureTruyNa(state, world, now, combatLv) {
  const b = ensureBangPhai(state), ng = ngayCua(now);
  if (!b.bang) return b.truyNa;
  const lv = Math.max(1, combatLv || 1);
  if (b.truyNa.ngay !== ng || !b.truyNa.ds.length) {
    const seed = (world && world.seed) || 1, ds = [];
    const mo = QUAI_LIST.filter((e) => (e.reqLevel || 1) <= lv);
    const pool = mo.length ? mo : QUAI_LIST.slice(0, 3);
    for (let i = 0; i < TRUY_NA_MOI_NGAY; i++) {
      const h = mix(mix(seed ^ 0xB0A7, ng), i);
      const bac = TRUY_NA_BAC[Math.min(TRUY_NA_BAC.length - 1, i)];   // mỗi ngày đủ 4 bậc
      let muc, ten, reqLv;
      if (bac.laBoss) {
        const moBoss = YEU_VUONG.filter((x) => x.reqLevel <= lv);
        const bo = (moBoss.length ? moBoss : [YEU_VUONG[0]])[h % Math.max(1, moBoss.length || 1)];
        muc = bo.id; ten = bo.name; reqLv = bo.reqLevel;
      } else {
        // bậc 1 lấy nửa dưới, bậc 2 lấy khoảng giữa, bậc 3 lấy nửa trên của đám đã mở khoá
        const lo = Math.floor(pool.length * [0, 0.35, 0.65][bac.id - 1]);
        const hi = Math.max(lo + 1, Math.floor(pool.length * [0.45, 0.8, 1][bac.id - 1]));
        const q = pool[lo + (h % (hi - lo))];
        if (!q) continue;
        muc = q.id; ten = q.name; reqLv = q.reqLevel || 1;
      }
      const so = bac.soNhan[0] + (mix(h, 5) % Math.max(1, bac.soNhan[1] - bac.soNhan[0] + 1));
      const heSo = 1 + reqLv / 90;
      ds.push({
        id: 'tn' + ng + '_' + i, bac: bac.id, bacTen: bac.ten, bacMau: bac.mau,
        laBoss: !!bac.laBoss, muc, ten, reqLv, so,
        ct: Math.round(bac.ctNen * heSo), bac_: Math.round(bac.bacNen * heSo), manh: bac.manh,
      });
    }
    b.truyNa = { ngay: ng, ds, nhan: {}, moc: {} };
  }
  return b.truyNa;
}
function demMuc(state, muc, laBoss) {
  if (laBoss) return ((state.boss && state.boss.history) || []).filter((x) => x && x.win && x.id === muc).length;
  return ((state.counters && state.counters.kills) || {})[muc] || 0;
}
export function danhSachTruyNa(state, world, now, combatLv) {
  const b = ensureBangPhai(state); if (!b.bang) return [];
  const tn = ensureTruyNa(state, world, now, combatLv);
  return tn.ds.map((q) => {
    const daNhan = !!tn.nhan[q.id];
    const moc = tn.moc[q.id];
    const dat = daNhan && moc != null ? Math.min(q.so, Math.max(0, demMuc(state, q.muc, q.laBoss) - moc)) : 0;
    return { ...q, daNhan, xong: tn.nhan[q.id] === 'xong', dat, dat100: dat >= q.so };
  });
}
/** Nhận lệnh truy nã — chụp mốc số đã giết để về sau lấy hiệu. */
export function nhanTruyNa(state, world, id, now, combatLv) {
  const b = ensureBangPhai(state), tn = ensureTruyNa(state, world, now, combatLv);
  const q = tn.ds.find((x) => x.id === id); if (!q || tn.nhan[id]) return false;
  tn.nhan[id] = true;
  tn.moc[id] = demMuc(state, q.muc, q.laBoss);
  return true;
}
/** Nộp lệnh đã xong. Trả { ct, bac, manh } hoặc null. */
export function nopTruyNa(state, world, id, now, combatLv) {
  const b = ensureBangPhai(state), tn = ensureTruyNa(state, world, now, combatLv);
  const q = danhSachTruyNa(state, world, now, combatLv).find((x) => x.id === id);
  if (!q || !q.daNhan || q.xong || !q.dat100) return null;
  tn.nhan[id] = 'xong';
  themCongTich(state, q.ct);
  themBangCong(state, Math.round(q.ct / 6), now);
  ghiNhatKy(state, 'Nộp lệnh <b>' + q.bacTen + '</b> — trảm ' + q.so + ' ' + q.ten + '.', now);
  return { ct: q.ct, bac: q.bac_, manh: q.manh };
}

// ============================================================
// CHINH PHẠT + MÙA
// Đánh quái ở vùng nào thì sinh điểm Chinh Phạt cho bang ở ĐÚNG vùng đó.
// ============================================================
export function ensureMua(state, now) {
  const b = ensureBangPhai(state), mua = muaCua(now);
  if (!b.bang) return;
  if (b.bang.cpMua !== mua) {
    b.bang.cpMua = mua; b.bang.cpVung = {}; b.bang.cpTong = 0; b.bang.hangVung = {};
    b.muaThuong = { mua: mua - 1, hang: b.muaThuong ? b.muaThuong.hang : 0, daNhan: false };
    ghiNhatKy(state, "Mùa Chinh Phạt mới bắt đầu — điểm về 0, tranh lại từ đầu.", now);
    baoMinh(state, "Mùa Chinh Phạt mới", "Điểm của mọi khu vực trở về 0 để bắt đầu tranh lại từ đầu. Thứ hạng mùa trước đã được chốt.", now);
  }
}
/** Cộng điểm Chinh Phạt cho bang tại một vùng. Gọi từ đường thưởng khi giết quái. */
export function themCpVung(state, locId, diem, now) {
  const b = ensureBangPhai(state);
  if (!b.bang || !locId || !(diem > 0)) return 0;
  ensureMua(state, now);
  b.bang.cpVung[locId] = (b.bang.cpVung[locId] || 0) + diem;
  b.bang.cpTong = (b.bang.cpTong || 0) + diem;
  return diem;
}
/** Người chơi hạ một con quái ở vùng `locId`. `laBoss` -> điểm dày hơn nhiều. */
export function ghiKillChinhPhat(state, locId, laBoss, now) {
  // Thí Kiếm Đài: mỗi cấp thêm 1 điểm mỗi con. Cộng cho CẢ quái thường lẫn Yêu Vương — đài
  // mài nghề chứ không phân biệt đánh con gì. Đây là điểm móc DUY NHẤT nên cả hai đường thưởng
  // (awardKill ở main.js và nhánh treo máy ở activity.js) đều đi qua, không lệch nhau được.
  const them = capCongTrinh(state, 'thikiemdai');
  return themCpVung(state, locId, (laBoss ? CP_MOI_BOSS : CP_MOI_KILL) + them, now);
}

/** Bảng xếp hạng MỘT vùng: bang AI + bang ta, sắp theo điểm. Tự gắn hạng cho bang ta. */
export function bangXepHangVung(state, world, locId, now) {
  const b = ensureBangPhai(state), t = now || Date.now();
  const ds = bangAI(world, t).map((x) => ({ id: x.id, ten: x.ten, mauCo: x.mauCo, cap: x.cap, diem: x.cpVung[locId] || 0, laTa: false }));
  if (b.bang) ds.push({ id: 'ta', ten: b.bang.ten, mauCo: MAU_BANG_TA, cap: b.bang.cap, diem: (b.bang.cpVung || {})[locId] || 0, laTa: true });
  ds.sort((x, y) => y.diem - x.diem);
  ds.forEach((x, i) => { x.hang = i + 1; });
  const nhat = ds[0], nhi = ds[1];
  const thongTri = !!(nhat && nhat.diem > 0 && (!nhi || nhat.diem >= (nhi.diem || 0) * CP_THONG_TRI_HE_SO));
  return { ds, thongTri, chu: nhat && nhat.diem > 0 ? nhat : null };
}

/** Toàn cảnh 10 vùng + cập nhật `hangVung` của bang ta (buff nghề đọc từ đây). */
export function chinhPhat(state, world, now) {
  const b = ensureBangPhai(state), t = now || Date.now();
  ensureMua(state, t);
  const out = LOCATIONS.map((loc) => {
    const r = bangXepHangVung(state, world, loc.id, t);
    const ta = r.ds.find((x) => x.laTa);
    return {
      id: loc.id, ten: loc.name, reqLevel: loc.reqLevel, mapX: loc.mapX, mapY: loc.mapY,
      chu: r.chu, thongTri: r.thongTri, top: r.ds.slice(0, 5),
      hangTa: ta ? ta.hang : 0, diemTa: ta ? ta.diem : 0,
      buffTa: ta && ta.hang <= CP_BUFF_HANG.length && ta.diem > 0 ? CP_BUFF_HANG[ta.hang - 1] : 0,
    };
  });
  if (b.bang) {
    const hv = {};
    for (const v of out) if (v.buffTa > 0) hv[v.id] = v.hangTa;
    // Đất giành được ở Bang Chiến tính như HẠNG NHẤT vùng đó.
    // ⚠ `hangVung` là bảng THỨ HẠNG chứ không phải bảng điểm, nên ghi đè hạng 1 KHÔNG THỂ cộng
    //   dồn với hạng Chinh Phạt — mỗi vùng chỉ có một hạng, và 1 đã là hạng tốt nhất có thể.
    const giu = (b.bc && b.bc.giu) || {};
    for (const k of Object.keys(giu)) if ((giu[k] | 0) >= bcKyCua(t)) hv[k] = 1;
    b.bang.hangVung = hv;
  }
  return out;
}

/** Bảng xếp hạng TỔNG mùa (cộng mọi vùng). */
export function bangXepHangMua(state, world, now) {
  const b = ensureBangPhai(state), t = now || Date.now();
  const ds = bangAI(world, t).map((x) => ({ id: x.id, ten: x.ten, mauCo: x.mauCo, cap: x.cap, diem: x.cpTong, laTa: false }));
  if (b.bang) ds.push({ id: 'ta', ten: b.bang.ten, mauCo: MAU_BANG_TA, cap: b.bang.cap, diem: b.bang.cpTong || 0, laTa: true });
  ds.sort((x, y) => y.diem - x.diem);
  ds.forEach((x, i) => { x.hang = i + 1; x.thuong = MUA_THUONG_BANG[i] || 0; });
  return ds;
}
/** Lĩnh thưởng cuối mùa (Hồn Thạch). Trả số Hồn Thạch, 0 nếu chưa tới lượt. */
export function nhanThuongMua(state, world, now) {
  const b = ensureBangPhai(state);
  if (!b.bang || !b.muaThuong || b.muaThuong.daNhan) return 0;
  const hang = b.muaThuong.hang | 0;
  const thuong = hang >= 1 ? (MUA_THUONG_BANG[hang - 1] || 0) : 0;
  b.muaThuong.daNhan = true;
  if (thuong) ghiNhatKy(state, 'Kết mùa — Tiên Minh xếp hạng <b>' + hang + '</b>, lĩnh ' + thuong + ' Hồn Thạch.', now);
  return thuong;
}
/** Chốt hạng mùa vừa qua (gọi khi phát hiện sang mùa mới). */
export function chotHangMua(state, world, now) {
  const b = ensureBangPhai(state);
  if (!b.bang || !b.muaThuong || b.muaThuong.hang) return;
  const ds = bangXepHangMua(state, world, now);
  const ta = ds.find((x) => x.laTa);
  b.muaThuong.hang = ta ? ta.hang : 0;
  // Thưởng mùa phải TỰ TAY LĨNH — không báo thì người chơi không biết mà vào lấy.
  const thuong = b.muaThuong.hang >= 1 ? (MUA_THUONG_BANG[b.muaThuong.hang - 1] || 0) : 0;
  if (thuong) baoMinh(state, 'Thưởng mùa Chinh Phạt', 'Mùa vừa qua Tiên Minh xếp hạng ' + b.muaThuong.hang
    + ' — có ' + thuong + ' Hồn Thạch chờ lĩnh ở tab Chinh Phạt.', now);
}

// ============================================================
// BOSS BANG — Trảm Yêu Đài. Mỗi tuần một con, cả bang cùng đánh.
// ============================================================
export function moBossBang(state) { return capCongTrinh(state, 'tramYeuDai') > 0; }

export function bossBangCua(world, now, capDai) {
  const tran = Math.min(100, 10 + (capDai | 0) * 12);
  const mo = YEU_VUONG.filter((x) => x.reqLevel <= tran);
  const pool0 = mo.length ? mo : [YEU_VUONG[0]];
  // ⚠ CHỈ lọc theo trần rồi bốc đều là SAI: nâng Trảm Yêu Đài lên max chỉ làm rổ TO RA, mà
  // bốc đều thì vẫn hay ra con Lv 10 — người chơi đổ cả triệu Bạc vào đài mà boss y như cũ.
  // Nay bốc trong DẢI TRÊN của rổ (từ con mạnh nhất trở xuống 24 cấp): đài càng cao thì
  // Yêu Vương càng dữ, mà vẫn đổi con mỗi tuần chứ không đóng đinh một con.
  const cao = pool0.reduce((m, x) => Math.max(m, x.reqLevel), 0);
  const pool = pool0.filter((x) => x.reqLevel >= cao - 24);
  const h = mix(mix(((world && world.seed) || 1) ^ 0x7B0, 0x2A9), bossKyCua(now));
  return pool[h % pool.length];
}
export function ensureBossBang(state, world, now) {
  const b = ensureBangPhai(state), ky = bossKyCua(now);
  if (!b.bang) return b.bossB;
  const capDai = capCongTrinh(state, 'tramYeuDai');
  if (b.bossB.ky !== ky) {
    b.bossB = { ky, bossId: bossBangCua(world, now, capDai).id, gop: 0, luot: 0, cdDen: 0, thangKy: b.bossB.thangKy };
    return b.bossB;
  }
  // Nâng Trảm Yêu Đài giữa kỳ: con đã chốt từ lúc đài còn thấp vẫn nằm đó tới hết tuần, người
  // chơi đổ cả đống Bạc vào đài mà boss y như cũ. Nay CHƯA AI ĐÁNH thì bốc lại theo đài mới.
  // Đã có người bổ nhát nào rồi thì thôi — đổi con giữa trận là xoá trắng công lao cả minh.
  if (!(b.bossB.gop | 0) && !(b.bossB.luot | 0)) {
    const nen = bossBangCua(world, now, capDai);
    if (nen && nen.id !== b.bossB.bossId) b.bossB.bossId = nen.id;
  }
  return b.bossB;
}
/** Toàn cảnh trận boss bang. THUẦN — không ghi state. */
export function bossBang(state, world, now) {
  const b = ensureBangPhai(state), t = now || Date.now();
  if (!b.bang || !moBossBang(state)) return null;
  const capDai = capCongTrinh(state, 'tramYeuDai');
  const boss = YEU_VUONG_BY_ID[b.bossB.bossId] || bossBangCua(world, t, capDai);
  const ky = bossKyCua(t);
  const mau = Math.round(boss.hp * BOSS_BANG_MAU_HE_SO * (1 + capDai * 0.12));
  const troiGio = Math.max(0, (t - ky * BOSS_BANG_KY_MS) / GIO);
  const ds = thanhVien(state, world, t);
  // Bang chúng bào liên tục nhưng CỐ Ý không đủ: chỗ còn lại là phần người chơi phải đánh.
  const cong = ds.map((m) => ({
    id: m.id, ten: m.ten, av: m.av, mau: m.mau, chucTen: m.chucTen, chucMau: m.chucMau,
    // ⚠ He so nay chinh sao cho ca bang chung gop lai chi toi ~55-60% mau boss sau tron 7 ngay.
    // Cao hon thi tuan nao boss cung tu chet, nguoi choi khoi phai danh.
    dame: Math.round(boss.hp * 0.00080 * (0.7 + m.lv / 130) * (1 + m.chucBac * 0.05) * troiGio),
  })).sort((x, y) => y.dame - x.dame);
  const dameBot = cong.reduce((s, x) => s + x.dame, 0);
  const dameTa = b.bossB.ky === ky ? (b.bossB.gop || 0) : 0;
  const tong = dameBot + dameTa;
  return {
    boss, mau, dameBot, dameTa, tong,
    pct: Math.min(100, Math.round(tong / Math.max(1, mau) * 100)),
    thang: tong >= mau, daNhan: b.bossB.thangKy === ky,
    // Diễn Võ Trường: mỗi cấp thêm một lượt xuất trận trong tuần.
    cong, luot: b.bossB.ky === ky ? (b.bossB.luot | 0) : 0,
    tranLuot: BOSS_BANG_LUOT + capCongTrinh(state, 'dienvotruong'),
    cdConMs: Math.max(0, (b.bossB.cdDen || 0) - t), conLaiMs: bossKyConLai(t),
  };
}
export function xuatTranBoss(state, dame, now) {
  const b = ensureBangPhai(state), t = now || Date.now(), ky = bossKyCua(t);
  if (!b.bang || b.bossB.ky !== ky) return 0;
  // Trần lượt phải KHỚP với bossBang(): thiếu Diễn Võ Trường ở đây là UI cho bấm mà engine chặn.
  if ((b.bossB.luot | 0) >= BOSS_BANG_LUOT + capCongTrinh(state, 'dienvotruong')) return 0;
  if (t < (b.bossB.cdDen || 0)) return 0;
  const d = Math.max(0, Math.round(dame || 0));
  b.bossB.gop = (b.bossB.gop || 0) + d;
  b.bossB.luot = (b.bossB.luot | 0) + 1;
  b.bossB.cdDen = t + BOSS_BANG_CD_MS;
  return d;
}
/** Chốt thưởng nếu boss đã gục. Trả { ct, honThach, manh } hoặc null. */
export function chotBossBang(state, world, now) {
  const b = ensureBangPhai(state), t = now || Date.now(), ky = bossKyCua(t);
  const r = bossBang(state, world, t);
  if (!r || !r.thang || b.bossB.thangKy === ky) return null;
  b.bossB.thangKy = ky;
  const capDai = capCongTrinh(state, 'tramYeuDai');
  const tiLe = Math.min(1, r.dameTa / Math.max(1, r.mau));
  const ct = Math.round((400 + capDai * 120) * (0.4 + tiLe));
  const honThach = Math.round((r.boss.wb.honThach || 50) * (1 + capDai * 0.3) * (0.5 + tiLe));
  const manh = 1 + Math.floor(capDai / 3) + (tiLe >= 0.4 ? 1 : 0);
  themCongTich(state, ct);
  themBangCong(state, Math.round(ct / 4), t);
  themCpVung(state, LOCATIONS[Math.min(LOCATIONS.length - 1, Math.floor((r.boss.reqLevel || 10) / 11))].id, CP_MOI_BOSS, t);
  ghiNhatKy(state, 'Cả minh hạ <b>' + r.boss.name + '</b> — công của ngươi ' + Math.round(tiLe * 100) + '%.', t);
  baoMinh(state, 'Hạ ' + r.boss.name,
    'Cả minh vây đánh hạ được ' + r.boss.name + ' (Lv ' + (r.boss.reqLevel || '?') + '). Công của ngươi '
    + Math.round(tiLe * 100) + '% — lĩnh ' + ct + ' Công Tích, ' + honThach + ' Hồn Thạch, ' + manh + ' Mảnh Trang Bị.', t);
  return { ct, honThach, manh, boss: r.boss.name, tiLe: Math.round(tiLe * 100) };
}

// ============================================================
// BANG CHIẾN — mỗi tuần một trận tranh đất với một bang đối thủ.
//
// ⛔ Engine KHÔNG tự hỏi cờ `bangChien` được (cờ nằm ở tầng trên, cần `isAuthorAccount`).
//    Chủ gọi phải hỏi trước. `nhipBang` nhận cờ qua tham số `coBc`, mặc định TẮT — fail closed.
//
// Bốn thứ đều suy từ (seed, kỳ tuần) nên KHÔNG lưu gì thừa vào bản lưu, và mở lại game giữa
// tuần vẫn thấy đúng trận cũ: Đất Tranh · bang đối thủ · năm suất quân địch · cấp từng suất.
// Chỉ ba thứ phải lưu: cách người chơi XẾP quân, đã KHAI CHIẾN chưa, và SỬ bốn trận gần nhất.
// ============================================================
const bcKyCua = (now) => Math.floor((now || Date.now()) / BC_KY_MS);
export const bcKyConLai = (now) => BC_KY_MS - ((now || Date.now()) % BC_KY_MS);

/** Diễn Võ Trường là sân tập trận — chưa xây thì chưa cử quân đi tranh đất được. */
export function moBangChien(state) { return capCongTrinh(state, 'dienvotruong') > 0; }

/**
 * Ngũ hành của MỘT suất quân.
 * Người chơi lấy đúng hệ Tâm Pháp đang luyện — đây là thứ người chơi TỰ CHỌN nên phải ăn theo,
 * không được bốc ngẫu nhiên. Bot không mang sẵn trường hệ nên suy từ id, cố định đời đời.
 */
export function bcHeBot(id) { return NGU_HANH_LIST[h32(String(id || '')) % NGU_HANH_LIST.length]; }
export function bcHeNguoiChoi(state) {
  const tp = tamPhapById(state && state.combat && state.combat.loadout && state.combat.loadout.tamPhap);
  return (tp && tp.he) || NGU_HANH_LIST[0];
}

/** Đất Tranh của tuần: bốc trong các vùng người chơi ĐÃ VỚI TỚI, cố định suốt tuần. */
export function bcDatTranh(state, world, now) {
  const t = now || Date.now(), lv = (state && state.player && state.player.level) | 0;
  const mo = LOCATIONS.filter((l) => (l.reqLevel || 1) <= Math.max(1, lv));
  const mo0 = mo.length ? mo : [LOCATIONS[0]];
  // ⚠ Boc DEU trong moi vung da mo la SAI: nguoi cap 60 mo 7 vung thi phan lon tuan roi vao
  //   vung Lv 1-18, tranh mot manh dat khong ai them. Boc trong DAI TREN, cung loi `bossBangCua`.
  const cao = mo0.reduce((m, x) => Math.max(m, x.reqLevel || 1), 0);
  const pool = mo0.filter((x) => (x.reqLevel || 1) >= cao - BC_DAI_VUNG);
  const h = mix(mix(((world && world.seed) || 1) ^ 0x3C7, 0x51D), bcKyCua(t));
  return pool[h % pool.length];
}

/**
 * Bang đối thủ tuần này: bang AI ĐANG DẪN ĐẦU Đất Tranh.
 * Nếu chính Tiên Minh mình đang dẫn thì đối thủ là bang hạng nhì — mình thành bên THỦ.
 */
export function bcDoiThu(state, world, now) {
  const t = now || Date.now(), loc = bcDatTranh(state, world, t);
  const ds = bangAI(world, t)
    .map((x) => ({ id: x.id, ten: x.ten, mauCo: x.mauCo, cap: x.cap, soTv: x.soTv, diem: x.cpVung[loc.id] || 0 }))
    .sort((x, y) => y.diem - x.diem);
  const b = ensureBangPhai(state);
  const diemTa = (b.bang && (b.bang.cpVung || {})[loc.id]) || 0;
  const taDan = !!(b.bang && diemTa > (ds[0] ? ds[0].diem : 0));
  return { bang: taDan ? ds[1] || ds[0] : ds[0], taDan, loc };
}

/** Bao nhiêu tuần liền bang đó giữ Đất Tranh — chỉ để in một dòng chữ, không ăn vào luật. */
function bcGiuMayTuan(state, world, now) {
  const t = now || Date.now(), ky = bcKyCua(t);
  const chu = bcDoiThu(state, world, t).bang;
  if (!chu) return 0;
  let n = 1;
  for (let k = 1; k <= 12; k++) {
    const truoc = t - k * BC_KY_MS;
    if (bcKyCua(truoc) === ky) break;
    const c = bcDoiThu(state, world, truoc).bang;
    if (!c || c.id !== chu.id) break;
    n++;
  }
  return n;
}

/** Năm suất quân bên ta: người chơi đứng đầu, rồi bốn minh chúng mạnh nhất. */
export function bcQuanTa(state, world, now) {
  const b = ensureBangPhai(state), t = now || Date.now();
  if (!b.bang) return [];
  const ds = thanhVien(state, world, t).slice().sort((x, y) => y.lv - x.lv);
  const ta = [{
    id: 'ta', ten: (state.player && state.player.name) || 'Minh Chủ', laTa: true,
    lv: (state.player && state.player.level) | 0, he: bcHeNguoiChoi(state),
    av: (state.player && state.player.avatar) || '', mau: '#22d3ee',
    phu: 'Minh Chủ', chucTen: 'Minh Chủ',
  }];
  for (const m of ds) {
    if (ta.length >= BC_SO_CAP) break;
    ta.push({
      id: m.id, ten: m.ten, laTa: false, lv: m.lv, he: bcHeBot(m.id),
      av: m.av, mau: m.mau, phu: m.chucTen + ' · ' + m.loai, chucTen: m.chucTen,
    });
  }
  return ta;
}

/**
 * Năm suất quân bên địch — SINH MỘT LẦN rồi chốt vào bản lưu.
 *
 * ⚠⚠ Bốc trong sổ giang hồ đang sống là SAI và sai IM LẶNG: sổ nở thêm người mỗi chu kỳ nên
 *    `roster[h % roster.length]` trỏ sang người khác giữa tuần, và `botCombatLv` cũng bò theo
 *    giờ nên cấp quân địch tự đổi ngay trước mắt người chơi. Bài kiểm 50 mục 5 bắt đúng chỗ này.
 * ⇒ Dựng THẲNG từ bảng tên · chân dung · lối đánh của bot: không dính gì tới sổ đang sống,
 *   cũng không dính tới việc minh mình vừa chiêu thêm ai.
 * Cấp neo vào cấp người chơi rồi lệch theo CẤP BANG đối thủ — bang mạnh thì quân dày hơn.
 */
function bcSinhQuanDich(state, world, now) {
  const t = now || Date.now(), ky = bcKyCua(t);
  const dt = bcDoiThu(state, world, t);
  if (!dt.bang) return [];
  // ⚠⚠ Neo vao cap NGUOI CHOI thoi la sai: minh chung la bot that, co nguoi Lv 100 trong khi
  //   nguoi choi Lv 60 — quan ta thanh manh gap ruoi quan dich, tran nao cung thang de.
  //   Neo vao cap TRUNG BINH ca nam suat. An toan vi quan dich duoc CHOT mot lan cho ca tuan.
  const qta = bcQuanTa(state, world, t);
  const nen = qta.length ? Math.max(1, Math.round(qta.reduce((x, y) => x + y.lv, 0) / qta.length))
    : Math.max(1, (state && state.player && state.player.level) | 0);
  const lech = Math.round(((dt.bang.cap || 1) - 14) * 0.8);
  const out = [];
  for (let i = 0; i < BC_SO_CAP; i++) {
    const h = mix(mix(mix(((world && world.seed) || 1) ^ 0x6E3, ky), h32(dt.bang.id)), i);
    const arch = ARCHETYPES[ARCHETYPE_IDS[mix(h, 0x23) % ARCHETYPE_IDS.length]];
    out.push({
      id: dt.bang.id + ':' + i,
      ten: BOT_HO[h % BOT_HO.length] + ' ' + BOT_TEN[mix(h, 0x11) % BOT_TEN.length],
      av: botAvatar({ avatarId: BOT_AVATAR_IDS[mix(h, 0x37) % BOT_AVATAR_IDS.length] }),
      mau: dt.bang.mauCo,
      lv: Math.max(1, nen + lech + ((mix(h, 0x2F) % 9) - 4)),
      he: NGU_HANH_LIST[mix(h, 0x4D) % NGU_HANH_LIST.length],
      phu: arch.name,
    });
  }
  return out;
}
/** Quân địch của tuần này: đọc bản đã chốt, chưa chốt thì sinh (không ghi — chỗ ghi là ensure). */
export function bcQuanDich(state, world, now) {
  const b = ensureBangPhai(state);
  const bc = b.bc;
  if (bc && Array.isArray(bc.dich) && bc.dich.length === BC_SO_CAP && bc.ky === bcKyCua(now || Date.now())) return bc.dich;
  return bcSinhQuanDich(state, world, now);
}

/**
 * Cửa thắng của MỘT cặp. Sức = cấp × hệ số khắc ngũ hành ĐANG CHẠY (`nguHanhMod`, +30% / −20%).
 * ⚠ Dùng lại đúng hàm của combat chứ không chép công thức sang — chép là đẻ bản thứ hai rồi lệch.
 */
export function bcTiLe(ta, dich) {
  if (!ta || !dich) return 0.5;
  const sTa = Math.max(1, ta.lv) * (1 + nguHanhMod(ta.he, dich.he));
  const sDich = Math.max(1, dich.lv) * (1 + nguHanhMod(dich.he, ta.he));
  const p = sTa / Math.max(0.0001, sTa + sDich);
  return Math.min(BC_TI_LE_TRAN, Math.max(BC_TI_LE_SAN, p));
}
/** Nhãn đọc cửa thắng. Trả { ma, ten } — nhãn nằm ở data, không gõ tay trong giao diện. */
export function bcDocCua(p) { return BC_NGUONG.find((x) => p >= x.tu) || BC_NGUONG[BC_NGUONG.length - 1]; }
/** Một dòng vì-sao ngắn cho cột giữa: khắc hệ trước, chênh cấp sau. */
export function bcViSao(ta, dich) {
  if (!ta || !dich) return { he: '', cap: '' };
  const m = nguHanhMod(ta.he, dich.he), n = nguHanhMod(dich.he, ta.he);
  let he = '';
  if (m > 0) he = heName(ta.he) + ' khắc ' + heName(dich.he) + ' +30%';
  else if (n > 0) he = 'bị ' + heName(dich.he) + ' khắc −20%';
  else he = 'không khắc được nhau';
  const d = (ta.lv | 0) - (dich.lv | 0);
  const cap = d > 0 ? ('hơn ' + d + ' cấp') : (d < 0 ? ('kém ' + (-d) + ' cấp') : 'ngang cấp');
  return { he, cap };
}

export function ensureBangChien(state, world, now) {
  const b = ensureBangPhai(state), t = now || Date.now(), ky = bcKyCua(t);
  if (!b.bc || typeof b.bc !== 'object') b.bc = { ky: -1, xep: null, xong: false, su: [], giu: {}, dich: null };
  if (!Array.isArray(b.bc.su)) b.bc.su = [];
  if (!b.bc.giu || typeof b.bc.giu !== 'object') b.bc.giu = {};
  if (b.bc.ky !== ky) { b.bc.ky = ky; b.bc.xep = null; b.bc.xong = false; b.bc.dich = null; }
  // Quân địch CHỐT một lần cho cả tuần. Suy lại mỗi lần đọc là nó tự đổi mặt giữa tuần.
  if (!Array.isArray(b.bc.dich) || b.bc.dich.length !== BC_SO_CAP) b.bc.dich = bcSinhQuanDich(state, world, t);
  // Đất giữ được chỉ có giá trị đúng một tuần. Hết hạn thì tự rụng, không phải chờ ai gỡ.
  for (const k of Object.keys(b.bc.giu)) if ((b.bc.giu[k] | 0) < ky) delete b.bc.giu[k];
  return b.bc;
}

/** Thứ tự xếp quân hiện tại: mảng BC_SO_CAP chỉ số, chưa xếp thì là thứ tự mặc định. */
function bcXepHienTai(bc) {
  const mac = Array.from({ length: BC_SO_CAP }, (_, i) => i);
  const x = bc && Array.isArray(bc.xep) ? bc.xep : null;
  if (!x || x.length !== BC_SO_CAP) return mac;
  const thay = new Set(x);
  if (thay.size !== BC_SO_CAP || x.some((v) => !(v >= 0 && v < BC_SO_CAP))) return mac;
  return x.slice();
}

/**
 * Toàn cảnh trận tuần này. THUẦN — không ghi state.
 * Trả `null` khi chưa mở được, kèm lí do ở `bangChienVuong()` để giao diện nói đúng cái đang thiếu.
 */
export function bangChienTran(state, world, now) {
  const b = ensureBangPhai(state), t = now || Date.now();
  if (!b.bang || !moBangChien(state)) return null;
  const bc = ensureBangChien(state, world, t);
  const dt = bcDoiThu(state, world, t);
  if (!dt.bang) return null;
  const ta = bcQuanTa(state, world, t), dich = bcQuanDich(state, world, t);
  if (ta.length < BC_SO_CAP || dich.length < BC_SO_CAP) return null;
  const xep = bcXepHienTai(bc);
  const cap = xep.map((iTa, i) => {
    const a = ta[iTa], d = dich[i];
    const p = bcTiLe(a, d);
    return { khe: i, ta: a, dich: d, tiLe: p, cua: bcDocCua(p), viSao: bcViSao(a, d) };
  });
  const dem = { an: 0, hen: 0, hiem: 0, nguy: 0 };
  cap.forEach((c) => { dem[c.cua.ma] = (dem[c.cua.ma] || 0) + 1; });
  return {
    ky: bc.ky, loc: dt.loc, doiThu: dt.bang, taDan: dt.taDan,
    giuMayTuan: bcGiuMayTuan(state, world, t),
    quanTa: ta, quanDich: dich, xep, cap, dem,
    xong: !!bc.xong, conLaiMs: bcKyConLai(t),
    dangGiu: Object.keys(bc.giu || {}),
    vetBac: BC_VET_BAC_NEN + ((dt.bang.cap || 1) * BC_VET_BAC_CAP),
    su: (bc.su || []).slice(0, BC_SU_CAP),
  };
}

/** Vì sao chưa vào được Bang Chiến. Trả '' khi vào được — màn trống phải có đường ra. */
export function bangChienVuong(state, world, now) {
  const b = ensureBangPhai(state);
  if (!b.bang) return 'chua-lap-minh';
  if (!moBangChien(state)) return 'chua-dien-vo-truong';
  const ds = thanhVien(state, world, now || Date.now());
  if (ds.length < BC_SO_CAP - 1) return 'thieu-minh-chung';
  return '';
}

/** Đổi chỗ hai suất quân bên ta. Trả false nếu chỉ số hỏng hoặc trận đã đánh xong. */
export function bcDoiCho(state, world, i, j, now) {
  const bc = ensureBangChien(state, world, now);
  if (bc.xong) return false;
  if (!(i >= 0 && i < BC_SO_CAP && j >= 0 && j < BC_SO_CAP) || i === j) return false;
  const x = bcXepHienTai(bc);
  const tmp = x[i]; x[i] = x[j]; x[j] = tmp;
  bc.xep = x;
  return true;
}

/**
 * Tự xếp: duyệt TRỌN 120 hoán vị của năm suất, chọn cách có kì vọng thắng cả trận cao nhất.
 * ⚠ Tối đa hoá TỔNG cửa thắng là SAI — dồn cả năm cửa mỗi cửa 0,6 thua xa ba cửa 0,9 và hai
 *   cửa bỏ, vì luật là thắng BA CẶP chứ không phải thắng nhiều điểm.
 */
export function bcTuXep(state, world, now) {
  const t = now || Date.now(), bc = ensureBangChien(state, world, t);
  if (bc.xong) return false;
  const ta = bcQuanTa(state, world, t), dich = bcQuanDich(state, world, t);
  if (ta.length < BC_SO_CAP || dich.length < BC_SO_CAP) return false;
  const p = [];
  for (let i = 0; i < BC_SO_CAP; i++) { p[i] = []; for (let j = 0; j < BC_SO_CAP; j++) p[i][j] = bcTiLe(ta[i], dich[j]); }
  let tot = null, diem = -1;
  const hoanVi = (con, dang) => {
    if (!con.length) {
      const d = bcKiVongThang(dang.map((iTa, khe) => p[iTa][khe]));
      if (d > diem) { diem = d; tot = dang.slice(); }
      return;
    }
    for (let k = 0; k < con.length; k++) hoanVi(con.slice(0, k).concat(con.slice(k + 1)), dang.concat([con[k]]));
  };
  hoanVi(Array.from({ length: BC_SO_CAP }, (_, i) => i), []);
  if (!tot) return false;
  bc.xep = tot;
  return true;
}
/** Xác suất thắng ÍT NHẤT BC_CAN_THANG cặp, tính đúng bằng quy hoạch động trên số cặp thắng. */
export function bcKiVongThang(ds) {
  let pk = [1];
  for (const p of ds) {
    const moi = new Array(pk.length + 1).fill(0);
    for (let k = 0; k < pk.length; k++) { moi[k] += pk[k] * (1 - p); moi[k + 1] += pk[k] * p; }
    pk = moi;
  }
  let s = 0;
  for (let k = BC_CAN_THANG; k < pk.length; k++) s += pk[k];
  return s;
}

/**
 * Khai chiến. Bốc CÓ HẠT GIỐNG nên máy chủ tính lại được y hệt.
 * Trả bản ghi trận, hoặc null nếu chưa đánh được.
 */
export function khaiChien(state, world, now) {
  const b = ensureBangPhai(state), t = now || Date.now();
  const r = bangChienTran(state, world, t);
  if (!r || r.xong) return null;
  const bc = ensureBangChien(state, world, t);
  const dong = r.cap.map((c) => {
    const thang = rng(state, 'bangChien') < c.tiLe;
    return { ten: c.ta.ten, laTa: !!c.ta.laTa, dichTen: c.dich.ten, thang };
  });
  const soThang = dong.filter((x) => x.thang).length;
  const thangTran = soThang >= BC_CAN_THANG;
  bc.xong = true;

  const vet = r.vetBac;
  let bac = 0, manh = 0, ct = 0;
  if (thangTran) {
    bac = vet;
    manh = BC_VET_MANH[0] + Math.min(BC_VET_MANH[1] - BC_VET_MANH[0], Math.floor((r.doiThu.cap || 1) / 8));
    ct = BC_CT_THANG;
    b.bang.quy = (b.bang.quy || 0) + bac;
    // ⚠ Mảnh Trang Bị KHÔNG phát ở đây. Engine này không đụng túi người chơi — lớp view lĩnh
    //   từ bản ghi trả về, đúng lối `chotBossBang` đang chạy. Phát cả hai nơi là nhân đôi đồ.
    bc.giu[r.loc.id] = bc.ky + 1;                       // giữ đất đúng một tuần
  } else {
    // Thua thì bị vét lại — nhưng KHÔNG BAO GIỜ quá số Bạc đang có. Ngân Khố không được âm.
    bac = -Math.min(b.bang.quy | 0, Math.round(vet * BC_VET_KHI_THUA));
    ct = BC_CT_THUA;
    b.bang.quy = (b.bang.quy || 0) + bac;
    delete bc.giu[r.loc.id];
  }
  themCongTich(state, ct);
  themBangCong(state, Math.round(ct / 4), t);

  const ghi = {
    ky: bc.ky, locId: r.loc.id, locTen: r.loc.name, doiTen: r.doiThu.ten, doiMau: r.doiThu.mauCo,
    thang: thangTran, diem: [soThang, BC_SO_CAP - soThang], dong, bac, manh, ct,
  };
  bc.su = [ghi].concat(bc.su || []).slice(0, BC_SU_CAP);

  ghiNhatKy(state, thangTran
    ? ('Bang Chiến — thắng <b>' + r.doiThu.ten + '</b> ' + soThang + '-' + (BC_SO_CAP - soThang) + ', chiếm <b>' + r.loc.name + '</b>.')
    : ('Bang Chiến — thua <b>' + r.doiThu.ten + '</b> ' + soThang + '-' + (BC_SO_CAP - soThang) + ' ở <b>' + r.loc.name + '</b>.'), t);
  return ghi;
}

/**
 * Sang tuần mới mà tuần trước chưa bấm Khai Chiến thì quân đang xếp sẵn TỰ RA TRẬN.
 * ⚠ Phải chạy TRƯỚC khi `ensureBangChien` dọn kỳ, nếu không thế trận cũ đã bị xoá mất.
 */
function bcTuRaTran(state, world, now) {
  const b = ensureBangPhai(state), t = now || Date.now(), ky = bcKyCua(t);
  if (!b.bc || typeof b.bc !== 'object') return null;
  if (b.bc.ky < 0 || b.bc.ky === ky || b.bc.xong) return null;
  // Đánh nốt trận của TUẦN TRƯỚC bằng đúng mốc cuối tuần đó, rồi mới sang tuần mới.
  const mocCu = (b.bc.ky + 1) * BC_KY_MS - 1;
  const ghi = khaiChien(state, world, mocCu);
  if (ghi) baoMinh(state, 'Bang Chiến đã đánh xong',
    'Tuần trước không kịp ra lệnh nên quân xếp sẵn tự ra trận, ' + (ghi.thang ? 'THẮNG' : 'thua') + ' '
    + ghi.diem[0] + '-' + ghi.diem[1] + ' trước ' + ghi.doiTen + '.', t);
  return ghi;
}

// ============================================================
// CHẠY MỘT NHỊP — gom mọi thứ phải soát theo thời gian vào MỘT chỗ.
// Gọi lúc mở view, mỗi 60 giây, và sau mỗi thao tác đáng kể.
// ============================================================
/**
 * @param coBc cờ tính năng `bangChien`. MẶC ĐỊNH TẮT — engine không tự hỏi cờ được, chủ gọi
 *   phải truyền vào. Thiếu tham số là cửa ĐÓNG, không phải cửa mở.
 */
export function nhipBang(state, world, now, combatLv, coBc) {
  const b = ensureBangPhai(state), t = now || Date.now();
  if (!b.bang) return null;
  const out = {};
  ensureMua(state, t);
  chotHangMua(state, world, t);
  out.xong = soatXayDung(state, t);
  out.san = thuSan(state, world, t);
  sinhDonXin(state, world, t);
  ensureNv(state, world, t);
  ensureTruyNa(state, world, t, combatLv);
  ensureBossBang(state, world, t);
  ensureChSo(state, t);
  chinhPhat(state, world, t);          // cập nhật hangVung -> buff nghề ăn theo
  out.boss = chotBossBang(state, world, t);
  if (coBc) {
    out.bc = bcTuRaTran(state, world, t);   // phải chạy TRƯỚC ensureBangChien (nó dọn kỳ cũ)
    ensureBangChien(state, world, t);
  }
  return out;
}
