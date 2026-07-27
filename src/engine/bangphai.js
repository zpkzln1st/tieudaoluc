// ============================================================
// BANG PHÁI — thế lực giang hồ. THUẦN: không DOM, không Alpine.
//
// ⚠ PHÂN VAI VỚI TÔNG MÔN (đừng để hai hệ giẫm chân nhau):
//   · Tông Môn = GIA NGHIỆP. Ngươi là chưởng môn, đệ tử là NPC ngươi nuôi. Trục DỌC.
//   · Bang Phái = THẾ LỰC. Ngươi XIN GIA NHẬP, thành viên là cao thủ ngang hàng,
//     các bang tranh nhau ĐỊA BÀN. Trục NGANG.
//
// Đường A (không cần máy chủ): 12 bang suy từ (seed thế giới), bang chủ là Danh Sĩ,
// thành viên bốc từ 200 bot đã có. KHÔNG lưu danh sách bang vào save — suy lại mỗi lần,
// nên mọi máy cùng seed thấy cùng một giang hồ. state.bangPhai chỉ giữ phần CỦA NGƯỜI CHƠI.
//
// ⚠ 0-POWER: cống hiến KHÔNG cho chỉ số. Tốn Bạc (sink một chiều) đổi lấy Công Tích + thứ hạng.
//    Kinh tế chính đã cân, không đụng.
// ============================================================
import { LOCATIONS } from '../data/locations.js';
import { danhSiList } from './danhsi.js';
import { genRoster, botCombatLv, botTotalLv, botTitle, botAvatar } from './bots.js';

export const SO_BANG = 12;
export const CAP_THANH_VIEN = 25;      // trần thành viên mỗi bang
const NHIEM_KY_MS = 7 * 24 * 3600 * 1000;   // địa bàn xét lại mỗi 7 ngày ("mùa" rút gọn)

const HO_BANG = ['Thanh', 'Huyền', 'Xích', 'Bạch', 'Kim', 'Vân', 'Lôi', 'Hải', 'Cửu', 'Thiết', 'Ngọc', 'Phi'];
const DUOI_BANG = ['Long Bang', 'Kiếm Minh', 'Đao Hội', 'Phong Đường', 'Sa Môn', 'Vũ Các', 'Tiêu Cục', 'Sơn Trại', 'Thủy Trại', 'Thương Hội', 'Ẩn Cốc', 'Minh Giáo'];
const TON_CHI = [
  'Lấy nghĩa làm đầu, lấy đao làm lý.',
  'Không hỏi xuất thân, chỉ hỏi bản lĩnh.',
  'Vào bang là huynh đệ, ra bang là người dưng.',
  'Thu thuế đường, giữ đường yên.',
  'Kẻ mạnh ngồi trên, đó là quy củ.',
  'Giang hồ loạn, ta giữ một góc cho yên.',
  'Của cải chia đều, họa phúc chia đôi.',
  'Ai động tới người của ta, ta động tới cả nhà nó.',
  'Ẩn thân nơi thị tứ, xuất thủ định càn khôn.',
  'Chỉ nhận người đã từng thua một trận.',
  'Bang quy ba điều, phạm một điều là ra khỏi cửa.',
  'Tiền trao cháo múc, ân oán phân minh.',
];

function h32(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function mix(a, b) { let h = (a ^ Math.imul(b >>> 0, 2654435761)) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13; return h >>> 0; }
const pick = (h, arr) => arr[(h >>> 0) % arr.length];

export const ID_TU_LAP = 'bangTuLap';        // id riêng cho bang do người chơi lập
export const LV_LAP_BANG = 200;              // Tổng Lv tối thiểu để lập bang — mốc giữa game
export const NOI_MO = 200;                   // biên chiêu mộ: theo được người mạnh hơn mình tới +200 Tổng Lv
export const PHI_LAP_BANG = 50000;           // Bạc — sink một chiều
const NHAT_KY_MAX = 60;

export function ensureBangPhai(state) {
  if (!state.bangPhai) state.bangPhai = {};
  const b = state.bangPhai;
  if (b.bangId === undefined) b.bangId = null;    // id bang đang ở, null = chưa vào bang nào
  if (typeof b.congTich !== 'number') b.congTich = 0;
  if (typeof b.gopBac !== 'number') b.gopBac = 0;
  if (typeof b.vaoLuc !== 'number') b.vaoLuc = 0;
  if (b.tuLap === undefined) b.tuLap = null;      // bang DO NGƯỜI CHƠI LẬP (chỉ cái này mới lưu save)
  if (!Array.isArray(b.nhatKy)) b.nhatKy = [];
  if (!b.vu || typeof b.vu !== 'object') b.vu = { ngay: 0, xong: [], moc: null };
  return b;
}

export function ghiNhatKy(state, txt, now) {
  const b = ensureBangPhai(state), ts = now || Date.now();
  b.nhatKy.unshift({ id: 'nk' + ts + '_' + Math.round(Math.random() * 1e6), txt, ts });
  if (b.nhatKy.length > NHAT_KY_MAX) b.nhatKy.length = NHAT_KY_MAX;
  return b.nhatKy[0];
}

export const nhiemKyCua = (now) => Math.floor((now || Date.now()) / NHIEM_KY_MS);
export const nhiemKyConLai = (now) => NHIEM_KY_MS - ((now || Date.now()) % NHIEM_KY_MS);

// ============================================================
// TÁN TU — bot không thuộc bang nào. Đây là nguồn CHIÊU MỘ cho bang tự lập.
// (Nếu 200 bot đều có bang thì người chơi lập bang xong chẳng mời được ai.)
// ============================================================
const TAN_TU_PCT = 30;
const laTanTu = (seed, i) => (mix(mix(seed >>> 0, 0x5EED), i) % 100) < TAN_TU_PCT;

/** Giá chiêu mộ: cao thủ thì đắt. Sink Bạc một chiều. */
export const giaChieuMo = (tongLv) => Math.round(2000 + Math.max(0, tongLv || 0) * 240);

/**
 * ⚠ CÂN BẰNG: cao thủ KHÔNG theo kẻ yếu hơn mình.
 * Chỉ chiêu mộ được tán tu có Tổng Lv ≤ Tổng Lv của người chơi.
 * Không có luật này thì vừa lập bang đã bốc trọn 25 tán tu mạnh nhất -> chiếm ngay 8/10 vùng,
 * bang dựng sẵn thành vô nghĩa (đo được lúc chưa chặn).
 */
export function danhSachTanTu(world, now, tongLvNguoiChoi) {
  const t = now || Date.now();
  const seed = (world && world.seed) || 1, createdAt = (world && world.createdAt) || 0;
  const roster = genRoster(seed, createdAt) || [];
  // Tán tu yếu nhất đã ~Tổng Lv 388 nên phải có biên NOI_MO, không thì lập bang xong chẳng mời được ai.
  const tran = (tongLvNguoiChoi == null) ? Infinity : Math.max(0, tongLvNguoiChoi) + NOI_MO;
  const out = [];
  for (let i = 0; i < roster.length; i++) {
    if (!laTanTu(seed, i)) continue;
    const b = roster[i], tong = botTotalLv(b, t);
    out.push({
      id: b.id, ten: b.name, lv: botCombatLv(b, t), tong,
      hieu: botTitle(b, t), av: botAvatar(b), gia: giaChieuMo(tong),
      theoDuoc: tong <= tran,
    });
  }
  return out.sort((a, b) => b.tong - a.tong);
}

// ============================================================
// DANH SÁCH BANG — suy từ seed. Bang chủ = Danh Sĩ, thành viên = bot.
// ============================================================
export function danhSachBang(world, now) {
  const t = now || Date.now();
  const seed = (world && world.seed) || 1, createdAt = (world && world.createdAt) || 0;
  const roster = genRoster(seed, createdAt) || [];
  const ds = danhSiList(t) || [];
  const out = [];

  // Chia bot thành 12 nhóm rời nhau — mỗi bot chỉ thuộc ĐÚNG một bang, không trùng.
  // CHỪA ~30% làm TÁN TU (không bang) -> đó là nguồn để người chơi chiêu mộ khi tự lập bang.
  const nhom = []; for (let i = 0; i < SO_BANG; i++) nhom.push([]);
  for (let i = 0; i < roster.length; i++) {
    if (laTanTu(seed, i)) continue;
    const g = mix(mix(seed >>> 0, 0x8AD1), i) % SO_BANG;
    if (nhom[g].length < CAP_THANH_VIEN) nhom[g].push(roster[i]);
  }

  for (let i = 0; i < SO_BANG; i++) {
    const h = mix(mix(seed >>> 0, 0x51B7), i);
    const chu = ds.length ? ds[(h + i * 7) % ds.length] : null;
    const tv = nhom[i].map((b) => ({
      id: b.id, ten: b.name, lv: botCombatLv(b, t), tong: botTotalLv(b, t),
      hieu: botTitle(b, t), av: botAvatar(b),
    })).sort((a, b) => b.lv - a.lv);
    const uy = tv.reduce((s, m) => s + m.tong, 0) + (chu ? Math.round((chu.rankPower || 500) / 2) : 0);
    out.push({
      id: 'bang' + i,
      ten: pick(mix(h, 3), HO_BANG) + ' ' + DUOI_BANG[i % DUOI_BANG.length],
      chuTen: chu ? chu.ten : '—', chuId: chu ? chu.id : null,
      chuAnh: chu ? chu.face : '', chuMau: chu ? (chu.daoColor || '#e2e8f0') : '#94a3b8',
      chuDao: chu ? chu.daoName : '', tonChi: pick(mix(h, 11), TON_CHI),
      thanhVien: tv, soTv: tv.length, uy,
      cap: Math.max(1, Math.min(20, 1 + Math.floor(uy / 900))),
      // yêu cầu gia nhập: bang mạnh thì kén người hơn
      canTong: Math.max(5, Math.round(uy / 260)),
    });
  }
  out.sort((a, b) => b.uy - a.uy);
  out.forEach((b, i) => { b.hang = i + 1; });
  return out;
}

// ============================================================
// BANG DO NGƯỜI CHƠI LẬP — dựng thành ĐỐI TƯỢNG CÙNG DẠNG với 12 bang kia,
// để nó xếp hạng và tranh địa bàn ngang hàng, không phải hệ riêng cắm thêm.
// ============================================================
export function bangTuLap(state, world, now, tenNguoiChoi) {
  const b = ensureBangPhai(state), L = b.tuLap;
  if (!L) return null;
  const t = now || Date.now();
  const seed = (world && world.seed) || 1, createdAt = (world && world.createdAt) || 0;
  const roster = genRoster(seed, createdAt) || [];
  const theoId = {}; roster.forEach((r) => { theoId[r.id] = r; });
  const tv = (L.thanhVien || []).map((id) => theoId[id]).filter(Boolean).map((r) => ({
    id: r.id, ten: r.name, lv: botCombatLv(r, t), tong: botTotalLv(r, t),
    hieu: botTitle(r, t), av: botAvatar(r),
  })).sort((a, b2) => b2.lv - a.lv);
  // Uy = sức thành viên + quỹ bang (1000 Bạc = 1 uy) -> góp quỹ có tác dụng THẬT lên tranh địa bàn
  const uy = tv.reduce((s, m) => s + m.tong, 0) + Math.floor((L.quy || 0) / 1000);
  return {
    id: ID_TU_LAP, laCuaTa: true,
    ten: L.ten, chuTen: tenNguoiChoi || 'Ngươi', chuId: null,
    chuAnh: '', chuMau: '#f3d9a8', chuDao: 'Bang chủ',
    tonChi: L.tonChi || '', thanhVien: tv, soTv: tv.length, uy,
    quy: L.quy || 0, lapLuc: L.lapLuc || 0,
    cap: Math.max(1, Math.min(20, 1 + Math.floor(uy / 900))),
    canTong: 0,
  };
}

/** 12 bang + (nếu có) bang tự lập, xếp hạng chung. Đây là danh sách dùng cho MỌI chỗ. */
export function toanCanh(state, world, now, tenNguoiChoi) {
  const ds = danhSachBang(world, now);
  const mine = state ? bangTuLap(state, world, now, tenNguoiChoi) : null;
  const all = mine ? ds.concat([mine]) : ds;
  all.sort((a, b) => b.uy - a.uy);
  all.forEach((b, i) => { b.hang = i + 1; });
  return all;
}

export function bangTheoId(world, now, id, state, tenNguoiChoi) {
  if (!id) return null;
  if (id === ID_TU_LAP) return state ? bangTuLap(state, world, now, tenNguoiChoi) : null;
  return toanCanh(state, world, now, tenNguoiChoi).find((b) => b.id === id) || null;
}

// ============================================================
// ĐỊA BÀN — 10 vùng, mỗi nhiệm kỳ (7 ngày) xét lại ai trấn giữ.
// Bang uy càng cao càng dễ chiếm vùng cấp cao. Deterministic theo (seed, nhiệm kỳ).
// ============================================================
export function diaBan(world, now, state, tenNguoiChoi) {
  const t = now || Date.now(), nk = nhiemKyCua(t);
  const bangs = toanCanh(state, world, t, tenNguoiChoi);   // bang tự lập TRANH NGANG HÀNG
  const seed = (world && world.seed) || 1;
  return LOCATIONS.map((loc, i) => {
    // ứng viên: bang nào cũng tranh, nhưng trọng số = uy × nhiễu theo (vùng, nhiệm kỳ)
    let best = null, bestDiem = -1;
    bangs.forEach((b) => {
      const nhieu = 0.65 + (mix(mix(seed ^ 0x33C1, nk * 31 + i), h32(b.id)) % 1000) / 1000 * 0.7;
      const diem = b.uy * nhieu / (1 + loc.reqLevel / 60);   // vùng cấp cao khó giữ hơn
      if (diem > bestDiem) { bestDiem = diem; best = b; }
    });
    const tranh = bangs.filter((b) => b !== best)
      .map((b) => ({ b, d: b.uy * (0.65 + (mix(mix(seed ^ 0x77A2, nk * 31 + i), h32(b.id)) % 1000) / 1000 * 0.7) }))
      .sort((x, y) => y.d - x.d)[0];
    return {
      id: loc.id, ten: loc.name, reqLevel: loc.reqLevel,
      chuBangId: best ? best.id : null, chuBang: best ? best.ten : '—',
      doiThu: tranh ? tranh.b.ten : '—',
      sit: tranh ? Math.max(0, Math.round((1 - tranh.d / bestDiem) * 100)) : 100,   // % cách biệt
    };
  });
}

/** Số vùng một bang đang trấn giữ. */
export function soDiaBan(world, now, bangId, state, tenNguoiChoi) {
  if (!bangId) return 0;
  return diaBan(world, now, state, tenNguoiChoi).filter((v) => v.chuBangId === bangId).length;
}

// ============================================================
// NGƯỜI CHƠI
// ============================================================
export function duSucVao(bang, tongLv) { return !!bang && (tongLv || 0) >= bang.canTong; }

/** Bậc trong bang theo Công Tích — chỉ là danh xưng, KHÔNG cho chỉ số. */
export function bacCua(congTich) {
  const c = congTich || 0;
  if (c >= 60000) return { ten: 'Phó Bang Chủ', mau: '#f5b942' };
  if (c >= 24000) return { ten: 'Đường Chủ', mau: '#e879f9' };
  if (c >= 9000) return { ten: 'Hộ Pháp', mau: '#a78bfa' };
  if (c >= 3000) return { ten: 'Tinh Anh', mau: '#60a5fa' };
  if (c >= 600) return { ten: 'Bang Chúng', mau: '#5dcaa5' };
  return { ten: 'Tân Nhập', mau: '#94a3b8' };
}

/** Cống hiến: 1 Bạc = 1 Công Tích. Sink một chiều, KHÔNG hoàn, KHÔNG cho chỉ số. */
export function congHien(state, bac) {
  const b = ensureBangPhai(state), n = Math.max(0, Math.floor(bac || 0));
  if (!b.bangId || n <= 0) return 0;
  b.congTich += n; b.gopBac += n;
  return n;
}

export function vaoBang(state, bangId, now) {
  const b = ensureBangPhai(state);
  b.bangId = bangId; b.vaoLuc = now || Date.now();
  return b;
}
/** Rời bang: MẤT SẠCH Công Tích — cố ý, để việc chọn bang có sức nặng. */
export function roiBang(state) {
  const b = ensureBangPhai(state);
  b.bangId = null; b.congTich = 0; b.gopBac = 0; b.vaoLuc = 0;
  return b;
}

// ============================================================
// TỰ LẬP BANG
// ============================================================
/** Tên hợp lệ chưa? Trả '' nếu ok, ngược lại trả lý do. */
export function loiTenBang(ten, world, now) {
  const s = String(ten || '').trim();
  if (s.length < 2) return 'Tên bang phải từ 2 chữ trở lên.';
  if (s.length > 16) return 'Tên bang không quá 16 chữ.';
  if (/[<>&"'/\\]/.test(s)) return 'Tên bang có ký tự không dùng được.';
  const trung = danhSachBang(world, now).some((b) => b.ten.toLowerCase() === s.toLowerCase());
  if (trung) return 'Giang hồ đã có bang tên này rồi.';
  return '';
}

export function lapBang(state, { ten, tonChi }, now) {
  const b = ensureBangPhai(state), t = now || Date.now();
  b.tuLap = { ten: String(ten).trim(), tonChi: String(tonChi || '').trim(), lapLuc: t, quy: 0, thanhVien: [] };
  b.bangId = ID_TU_LAP; b.vaoLuc = t; b.congTich = 0; b.gopBac = 0;
  ghiNhatKy(state, 'Lập bang <b>' + b.tuLap.ten + '</b>, dựng cờ tại giang hồ.', t);
  return b.tuLap;
}

/** Giải tán: xoá sạch bang + Công Tích. Không hoàn Bạc. */
export function giaiTan(state, now) {
  const b = ensureBangPhai(state), ten = b.tuLap ? b.tuLap.ten : '';
  b.tuLap = null; b.bangId = null; b.congTich = 0; b.gopBac = 0; b.vaoLuc = 0;
  if (ten) ghiNhatKy(state, 'Giải tán <b>' + ten + '</b>. Cờ hạ, người tan.', now);
  return b;
}

export function chieuMo(state, tt, now, tongLvNguoiChoi) {
  const b = ensureBangPhai(state);
  if (!b.tuLap || !tt) return false;
  if (b.tuLap.thanhVien.length >= CAP_THANH_VIEN) return false;
  if (b.tuLap.thanhVien.indexOf(tt.id) >= 0) return false;
  // cao thủ không theo kẻ yếu hơn mình
  if (tongLvNguoiChoi != null && (tt.tong || 0) > tongLvNguoiChoi + NOI_MO) return false;
  b.tuLap.thanhVien.push(tt.id);
  ghiNhatKy(state, '<b>' + tt.ten + '</b> (Lv ' + tt.lv + ') nhập bang.', now);
  return true;
}
export function duoiNguoi(state, tt, now) {
  const b = ensureBangPhai(state);
  if (!b.tuLap) return false;
  const i = b.tuLap.thanhVien.indexOf(tt.id);
  if (i < 0) return false;
  b.tuLap.thanhVien.splice(i, 1);
  ghiNhatKy(state, '<b>' + tt.ten + '</b> rời bang.', now);
  return true;
}
/** Góp vào QUỸ bang tự lập — quỹ tính vào uy (1000 Bạc = 1 uy) nên có tác dụng thật lên địa bàn. */
export function gopQuy(state, bac, now) {
  const b = ensureBangPhai(state), n = Math.max(0, Math.floor(bac || 0));
  if (!b.tuLap || n <= 0) return 0;
  b.tuLap.quy = (b.tuLap.quy || 0) + n;
  b.congTich += n; b.gopBac += n;
  ghiNhatKy(state, 'Góp <b>' + n.toLocaleString('vi-VN') + '</b> Bạc vào bang khố.', now);
  return n;
}

// ============================================================
// BANG VỤ — 3 việc mỗi ngày. Thưởng CÔNG TÍCH (0-power), không cho chỉ số.
// Đo bằng cách chụp MỐC đầu ngày rồi lấy hiệu — khỏi phải thêm bộ đếm riêng.
// ============================================================
const NGAY_MS = 86400000;
export const ngayCua = (now) => Math.floor((now || Date.now()) / NGAY_MS);

function tongKills(state) {
  const k = (state.counters && state.counters.kills) || {};
  let s = 0; for (const id in k) if (Object.prototype.hasOwnProperty.call(k, id)) s += k[id] || 0;
  return s;
}
function tongChen(state) { return (state.tuuLau && state.tuuLau.chen) || 0; }

const VU = [
  { id: 'gop', ten: 'Góp bang khố 5.000 Bạc', can: 5000, thuong: 500, do: (s, m) => Math.max(0, (s.bangPhai.gopBac || 0) - m.gopBac) },
  { id: 'san', ten: 'Săn 20 yêu thú', can: 20, thuong: 400, do: (s, m) => Math.max(0, tongKills(s) - m.kills) },
  { id: 'ruou', ten: 'Mời 3 chén ở Tửu Lâu', can: 3, thuong: 300, do: (s, m) => Math.max(0, tongChen(s) - m.chen) },
];

/** Gọi mỗi khi mở view — tự sang ngày mới thì chụp lại mốc. */
export function ensureVu(state, now) {
  const b = ensureBangPhai(state), ng = ngayCua(now);
  if (b.vu.ngay !== ng || !b.vu.moc) {
    b.vu = { ngay: ng, xong: [], moc: { gopBac: b.gopBac || 0, kills: tongKills(state), chen: tongChen(state) } };
  }
  return b.vu;
}

export function danhSachVu(state, now) {
  const b = ensureBangPhai(state), v = ensureVu(state, now);
  return VU.map((x) => {
    const dat = Math.min(x.can, x.do(state, v.moc));
    return { id: x.id, ten: x.ten, can: x.can, dat, xong: v.xong.indexOf(x.id) >= 0, dat100: dat >= x.can, thuong: x.thuong };
  });
}

/** Nhận thưởng một việc đã đạt. Trả số Công Tích cộng thêm (0 nếu không nhận được). */
export function nhanThuongVu(state, id, now) {
  const b = ensureBangPhai(state), v = ensureVu(state, now);
  const x = VU.find((y) => y.id === id); if (!x) return 0;
  if (v.xong.indexOf(id) >= 0) return 0;
  if (x.do(state, v.moc) < x.can) return 0;
  v.xong.push(id);
  b.congTich += x.thuong;
  ghiNhatKy(state, 'Hoàn thành bang vụ — <b>' + x.ten + '</b>, được ' + x.thuong + ' Công Tích.', now);
  return x.thuong;
}
