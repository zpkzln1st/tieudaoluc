// ============================================================
// TỬU LÂU — quán rượu giang hồ. THUẦN: không DOM, không Alpine.
//
// Đường A (không cần máy chủ): khách trong quán là 20 DANH SĨ + 200 BOT đã có sẵn.
// Ai ngồi bàn nào, nói câu gì — đều SUY TỪ (seed thế giới + mốc phiên), nên:
//   · không lưu gì cho danh sách khách (F5 vẫn ra đúng người đó)
//   · mọi máy cùng seed thấy cùng một quán -> "giang hồ" nhất quán
// state.tuuLau CHỈ giữ thứ do người chơi tạo ra: tin đồn đã nghe, lời đã góp, số chén đã mời.
//
// ⚠ 0-POWER: mời rượu KHÔNG cho chỉ số, KHÔNG cho vật phẩm. Chỉ tốn Bạc (sink một chiều)
//    và đổi lấy lời thoại + tin đồn. Cố ý — kinh tế chính đã cân, không đụng vào.
// ============================================================
import { LOCATIONS } from '../data/locations.js';
import { danhSiList } from './danhsi.js';
import { genRoster, botAvatar, botTitle, botCombatLv } from './bots.js';

export const PHIEN_MS = 30 * 60 * 1000;   // đổi lượt khách mỗi 30 phút
export const KHACH_N = 4;                 // 4 ghế
const BAN_TIN_MAX = 40;                   // giữ tối đa 40 dòng trên bảng
const HOI_NGUOI_MS = 6 * 60 * 60 * 1000;  // mỗi khách cho hỏi chuyện miễn phí 1 lần / 6 giờ

// ---------- băm ----------
function h32(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function mix(a, b) { let h = (a ^ Math.imul(b >>> 0, 2654435761)) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13; return h >>> 0; }
const pick = (h, arr) => arr[(h >>> 0) % arr.length];

export function ensureTuuLau(state) {
  if (!state.tuuLau) state.tuuLau = {};
  const t = state.tuuLau;
  if (!Array.isArray(t.banTin)) t.banTin = [];    // [{id, kind, who, whoHex, txt, ts}]
  if (!t.hoiLan) t.hoiLan = {};                   // { khachId: ts lần hỏi chuyện gần nhất }
  if (typeof t.chen !== 'number') t.chen = 0;     // số chén đã mời (đếm cho vui)
  if (typeof t.nghe !== 'number') t.nghe = 0;     // số tin đồn đã nghe
  return t;
}

export const phienCua = (now) => Math.floor((now || Date.now()) / PHIEN_MS);
export const phienConLai = (now) => PHIEN_MS - ((now || Date.now()) % PHIEN_MS);

// ============================================================
// LỜI THOẠI — tông Hán-Việt, câu NGẮN, có khí.
// ============================================================
const CAU_NGOI = [
  'Rượu này nhạt, nhưng chuyện giang hồ thì đậm.',
  'Ngồi đây nửa canh giờ, nghe được ba chuyện đáng tiền.',
  'Đao để dưới bàn, tay vẫn không rời chuôi.',
  'Quán đông thế này, tất có kẻ đến không phải để uống.',
  'Mưa lớn ngoài kia, đường xuống núi chắc lầy rồi.',
  'Ta chờ một người, người ấy trễ đã ba ngày.',
  'Chủ quán, thêm một vò — hôm nay không tính đường về.',
  'Giang hồ dạo này lắm kẻ mới, ít kẻ giỏi.',
  'Cầm chén lên thì là bằng hữu, đặt chén xuống thì tính sau.',
  'Ta không hỏi tên ngươi, ngươi cũng đừng hỏi ta.',
  'Kiếm gãy rồi, nhưng tay chưa gãy.',
  'Nghe nói có kẻ phá quan tháng trước. Chẳng biết thật hay đồn.',
  'Ngồi lâu quá, chân tê mà lòng chưa yên.',
  'Đêm nay trăng mỏng, hợp để đi đường xa.',
  'Ai trả tiền rượu thì người đó nói, quy củ ở đây là vậy.',
  'Ta từng thua một trận, nhớ tới giờ.',
];
const CAU_MOI = [
  'Chén này ta nhận. Có gì muốn hỏi, hỏi đi.',
  'Rượu ngon. Kẻ mời rượu thường không mời suông.',
  'Được, ngươi có lòng. Ta nói ngươi nghe một chuyện.',
  'Đã lâu không ai mời ta. Ngồi xuống.',
  'Uống thì uống, nhưng đừng hỏi chuyện năm xưa.',
  'Chén đầy thì lời cũng đầy theo.',
  'Ngươi mời khéo lắm. Ta không quen thiếu nợ.',
  'Cạn. Giờ thì nghe cho kỹ.',
];
const CAU_HOI = [
  'Chuyện của ta dài, kể ra thì hết vò rượu.',
  'Ta đi khắp chốn, chỉ tìm một người chưa gặp.',
  'Năm xưa ta cũng như ngươi, đứng ngoài cửa quán nhìn vào.',
  'Đừng học ta. Đường ta đi hỏng nhiều hơn nên.',
  'Muốn mạnh thì đừng vội. Vội là chết.',
  'Ta có một chiêu chưa từng dùng. Mong đời không phải dùng tới.',
  'Kẻ mạnh không phải kẻ thắng nhiều, là kẻ còn ngồi được ở đây.',
  'Hỏi ít thôi. Biết nhiều quá cũng là họa.',
];
// Tin đồn — ghép từ ĐỊA DANH THẬT trong game để nghe cho ăn nhập.
const MAU_TIN = [
  (v) => `Nghe nói ở <b>${v}</b> gần đây yêu khí nổi lên, người đi săn về đều trắng tay.`,
  (v) => `Có đoàn tiêu đi ngang <b>${v}</b> mất tăm ba hôm rồi, chưa ai dám vào tìm.`,
  (v) => `Đồn rằng dưới <b>${v}</b> có một động phủ cổ, cửa mở vào đêm không trăng.`,
  (v) => `Một lão nhân bán thuốc ở <b>${v}</b> bán rẻ như cho, kẻ mua về đều không thấy quay lại.`,
  (v) => `Người ta bảo ở <b>${v}</b> có kẻ luyện thành tuyệt học, chưa ai thấy mặt.`,
  (v) => `Cửa ải <b>${v}</b> tháng này thu thuế gấp đôi, thương nhân kêu than khắp nơi.`,
  (v) => `Nghe phong thanh <b>${v}</b> sắp có đại hội, cao thủ bốn phương đang kéo về.`,
  (v) => `Có kẻ thấy huyết tích kéo dài suốt lối vào <b>${v}</b>, không dám bén mảng nữa.`,
];

// ============================================================
// KHÁCH TRONG QUÁN — 2 Danh Sĩ + 2 bot, suy từ seed + phiên.
// ============================================================
export function khachTrongQuan(world, now) {
  const t = now || Date.now(), ph = phienCua(t);
  const seed = (world && world.seed) || 1, createdAt = (world && world.createdAt) || 0;
  const base = mix(seed >>> 0, ph);
  const out = [];

  const ds = danhSiList(t);
  if (ds.length) {
    const i0 = base % ds.length;
    const i1 = (i0 + 1 + (mix(base, 17) % Math.max(1, ds.length - 1))) % ds.length;
    [i0, i1].forEach((i, k) => {
      const c = ds[i];
      out.push({
        id: 'ds:' + c.id, loai: 'danhsi', ten: c.ten, phu: c.bietHieu || c.daoName,
        anh: c.face, mau: c.daoColor || '#e2e8f0', cap: 'Danh Sĩ · hạng ' + c.rank,
        cau: pick(mix(base, 101 + k), CAU_NGOI), gia: giaRuou(c.rankPower || 500),
      });
    });
  }

  const roster = genRoster(seed, createdAt);
  if (roster && roster.length) {
    const j0 = mix(base, 211) % roster.length;
    const j1 = (j0 + 1 + (mix(base, 307) % Math.max(1, roster.length - 1))) % roster.length;
    [j0, j1].forEach((j, k) => {
      const b = roster[j], av = botAvatar(b), lv = botCombatLv(b, t);
      out.push({
        id: 'bot:' + j, loai: 'bot', ten: b.name, phu: botTitle(b, t),
        av, mau: '#cbd5e1', cap: 'Chiến Đấu Lv ' + lv,
        cau: pick(mix(base, 401 + k), CAU_NGOI), gia: giaRuou(80 + lv * 6),
      });
    });
  }
  return out.slice(0, KHACH_N);
}

// Giá rượu theo danh vọng — sink Bạc nhỏ, KHÔNG đổi lại chỉ số gì.
export function giaRuou(rankPower) {
  const rp = Math.max(0, rankPower || 0);
  return Math.round(120 + rp * 0.9);
}

// ---------- các lời đáp ----------
export function loiMoiRuou(khach, now) {
  const h = mix(h32(khach.id), Math.floor((now || Date.now()) / 1000));
  return pick(h, CAU_MOI);
}
export function loiHoiChuyen(khach, now) {
  const h = mix(h32(khach.id + ':hoi'), Math.floor((now || Date.now()) / 1000));
  return pick(h, CAU_HOI);
}
// Tin đồn dùng ĐỊA DANH THẬT; trả null nếu lần này khách không chịu nói.
export function tinDon(khach, now) {
  const h = mix(h32(khach.id + ':tin'), Math.floor((now || Date.now()) / 1000));
  if ((h % 100) >= 62) return null;                       // ~62% có tin
  const v = pick(mix(h, 5), LOCATIONS).name;
  return pick(mix(h, 9), MAU_TIN)(v);
}

export function hoiDuoc(state, khachId, now) {
  const t = ensureTuuLau(state), last = t.hoiLan[khachId] || 0;
  return (now || Date.now()) - last >= HOI_NGUOI_MS;
}

// ---------- bảng tin ----------
// kind: 'tin' tin đồn · 'loi' người chơi góp chuyện · 'dap' khách đáp lại
export function themDong(state, kind, who, whoHex, txt, now) {
  const t = ensureTuuLau(state), ts = now || Date.now();
  t.banTin.unshift({ id: 'tl' + ts + '_' + Math.round(Math.random() * 1e6), kind, who, whoHex, txt, ts });
  if (t.banTin.length > BAN_TIN_MAX) t.banTin.length = BAN_TIN_MAX;
  return t.banTin[0];
}
