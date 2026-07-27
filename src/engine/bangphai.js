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

export function ensureBangPhai(state) {
  if (!state.bangPhai) state.bangPhai = {};
  const b = state.bangPhai;
  if (b.bangId === undefined) b.bangId = null;    // id bang đang ở, null = chưa vào bang nào
  if (typeof b.congTich !== 'number') b.congTich = 0;
  if (typeof b.gopBac !== 'number') b.gopBac = 0;
  if (typeof b.vaoLuc !== 'number') b.vaoLuc = 0;
  return b;
}

export const nhiemKyCua = (now) => Math.floor((now || Date.now()) / NHIEM_KY_MS);
export const nhiemKyConLai = (now) => NHIEM_KY_MS - ((now || Date.now()) % NHIEM_KY_MS);

// ============================================================
// DANH SÁCH BANG — suy từ seed. Bang chủ = Danh Sĩ, thành viên = bot.
// ============================================================
export function danhSachBang(world, now) {
  const t = now || Date.now();
  const seed = (world && world.seed) || 1, createdAt = (world && world.createdAt) || 0;
  const roster = genRoster(seed, createdAt) || [];
  const ds = danhSiList(t) || [];
  const out = [];

  // Chia 200 bot thành 12 nhóm rời nhau — mỗi bot chỉ thuộc ĐÚNG một bang, không trùng.
  const nhom = []; for (let i = 0; i < SO_BANG; i++) nhom.push([]);
  for (let i = 0; i < roster.length; i++) {
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

export function bangTheoId(world, now, id) {
  if (!id) return null;
  return danhSachBang(world, now).find((b) => b.id === id) || null;
}

// ============================================================
// ĐỊA BÀN — 10 vùng, mỗi nhiệm kỳ (7 ngày) xét lại ai trấn giữ.
// Bang uy càng cao càng dễ chiếm vùng cấp cao. Deterministic theo (seed, nhiệm kỳ).
// ============================================================
export function diaBan(world, now) {
  const t = now || Date.now(), nk = nhiemKyCua(t);
  const bangs = danhSachBang(world, t);
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
export function soDiaBan(world, now, bangId) {
  if (!bangId) return 0;
  return diaBan(world, now).filter((v) => v.chuBangId === bangId).length;
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
