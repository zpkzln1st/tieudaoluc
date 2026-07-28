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
import { YEU_VUONG } from '../data/combat.js';
import { GIAO_TINH_TRAN, giaoTinhCan } from '../data/bangphai.js';   // bảng số thuần, không kéo theo engine nào
import { danhSiList } from './danhsi.js';
import { genRoster, botAvatar, botTitle, botCombatLv, botTotalLv, botActivity } from './bots.js';

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
  if (!t.giaoTinh) t.giaoTinh = {};               // { botId: bậc 1..GIAO_TINH_TRAN }
  if (!t.gtPhien) t.gtPhien = {};                 // { botId: phiên gần nhất đã lên bậc }
  return t;
}

// ---------- GIAO TÌNH ----------
// Nuôi ở đây, tiêu ở tab Chiêu Mộ của Tiên Minh (đủ bậc mới mời được, và rẻ dần theo bậc).
// CHỈ bot mới có Giao Tình — Danh Sĩ là NPC cốt truyện, không nhập minh được.
// ⚠ Chặn theo PHIÊN chứ không theo lần bấm: Mời Rượu không có nguội, để trống thì cứ đổ Bạc
// là mua đứt quan hệ trong một phút. Mỗi phiên 30 phút một người chỉ lên MỘT bậc.

/** Bậc Giao Tình hiện có với một người (0 = chưa quen). */
export function bacGiaoTinh(state, botId) {
  if (!botId) return 0;
  const t = ensureTuuLau(state);
  return t.giaoTinh[botId] | 0;
}
/** Phiên này người đó còn lên bậc được không. */
export function lenBacDuoc(state, botId, now) {
  if (!botId) return false;
  const t = ensureTuuLau(state);
  if ((t.giaoTinh[botId] | 0) >= GIAO_TINH_TRAN) return false;
  return t.gtPhien[botId] !== phienCua(now);
}
/**
 * Cộng một bậc Giao Tình. Trả BẬC MỚI nếu lên được, 0 nếu không (đã trần / đã lên phiên này).
 * Gọi từ cả Mời Rượu lẫn Hỏi Chuyện — hai đường đều là "gặp mặt", không phân biệt.
 */
export function themGiaoTinh(state, botId, now) {
  if (!lenBacDuoc(state, botId, now)) return 0;
  const t = ensureTuuLau(state);
  t.giaoTinh[botId] = (t.giaoTinh[botId] | 0) + 1;
  t.gtPhien[botId] = phienCua(now);
  return t.giaoTinh[botId];
}
/** Mọi người đã quen: [{ botId, bac }] — Chiêu Mộ tra lại cấp và giá từ đây. */
export function danhSachQuen(state) {
  const t = ensureTuuLau(state);
  return Object.keys(t.giaoTinh)
    .filter((id) => (t.giaoTinh[id] | 0) > 0)
    .map((id) => ({ botId: id, bac: t.giaoTinh[id] | 0 }));
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
// Khung dẫn cho chuyện đời THẬT của Danh Sĩ (lifeEvents do tác giả viết, 135 mẩu trong data/danhsi.js).
const DAN_SU = [
  (s) => `Chuyện cũ à… ${s}`,
  (s) => `Ngươi đã hỏi thì ta nói. ${s}`,
  (s) => `Có một lần, ${s.charAt(0).toLowerCase() + s.slice(1)}`,
  (s) => `Rượu vào rồi thì kể được. ${s}`,
  (s) => `Ít ai còn nhớ. ${s}`,
];
const DAN_MON = [
  (m) => `Ta xuất thân <b>${m}</b>. Nói tới đó thôi.`,
  (m) => `Người ta gọi ta theo môn cũ — <b>${m}</b>. Cái tên ấy nặng lắm.`,
  (m) => `<b>${m}</b>. Ngươi nghe qua chưa?`,
];
const DAN_TAM = [
  (t) => `Dạo này trong lòng ta chỉ có một câu: “${t}”`,
  (t) => `Ngươi muốn biết ta nghĩ gì à? “${t}”`,
  (t) => `“${t}” — ta tự nhủ vậy mỗi sáng.`,
];
const DAN_VIEC = [
  (v, l) => `Dạo này ta ${v}. Chiến Đấu mới tới Lv ${l}, còn xa lắm.`,
  (v, l) => `Ta đang ${v}. Được Lv ${l} rồi, chưa dám khoe.`,
  (v, l) => `Ngày nào cũng ${v}. Lv ${l}, cứ thế mà đi.`,
];
// Tin đồn — ghép từ DỮ LIỆU THẬT: địa danh, Yêu Vương, tên Danh Sĩ khác.
const TIN_VUNG = [
  (v) => `Nghe nói ở <b>${v}</b> gần đây yêu khí nổi lên, người đi săn về đều trắng tay.`,
  (v) => `Có đoàn tiêu đi ngang <b>${v}</b> mất tăm ba hôm rồi, chưa ai dám vào tìm.`,
  (v) => `Đồn rằng dưới <b>${v}</b> có một động phủ cổ, cửa mở vào đêm không trăng.`,
  (v) => `Một lão nhân bán thuốc ở <b>${v}</b> bán rẻ như cho, kẻ mua về đều không thấy quay lại.`,
  (v) => `Người ta bảo ở <b>${v}</b> có kẻ luyện thành tuyệt học, chưa ai thấy mặt.`,
  (v) => `Cửa ải <b>${v}</b> tháng này thu thuế gấp đôi, thương nhân kêu than khắp nơi.`,
  (v) => `Nghe phong thanh <b>${v}</b> sắp có đại hội, cao thủ bốn phương đang kéo về.`,
  (v) => `Có kẻ thấy huyết tích kéo dài suốt lối vào <b>${v}</b>, không dám bén mảng nữa.`,
  (v) => `Giếng cổ ở <b>${v}</b> cạn khô một đêm, đáy giếng lộ ra bậc đá đi xuống.`,
  (v) => `Đêm rằm ở <b>${v}</b> có tiếng tiêu, ai nghe trọn khúc thì sáng ra quên mất tên mình.`,
];
const TIN_BOSS = [
  (b, v) => `<b>${b}</b> vừa hiện thân ở <b>${v}</b>, cả trấn đóng cửa suốt đêm.`,
  (b, v) => `Có kẻ đụng phải <b>${b}</b> gần <b>${v}</b>, chạy thoát mà tóc bạc trắng.`,
  (b) => `Người ta treo thưởng lấy đầu <b>${b}</b>, tới nay chưa ai lĩnh được.`,
  (b, v) => `Dấu chân <b>${b}</b> in đầy lối vào <b>${v}</b>, sâu tới nửa thước.`,
];
const TIN_NGUOI = [
  (n) => `<b>${n}</b> mới qua đây tối qua, uống một chén rồi đi, không nói câu nào.`,
  (n, v) => `Nghe đâu <b>${n}</b> đang tìm người ở <b>${v}</b>. Tìm để làm gì thì không ai rõ.`,
  (n) => `Có kẻ vỗ ngực nói đã thắng <b>${n}</b> một chiêu. Cả quán cười ầm.`,
  (n, v) => `<b>${n}</b> bị chặn đường ở <b>${v}</b>, kẻ chặn tới nay chưa thấy về.`,
];

// ============================================================
// KHÁCH TRONG QUÁN — 2 Danh Sĩ + 2 bot, suy từ seed + phiên.
//
// ⚠ MỘT NGOẠI LỆ với luật "khách suy hoàn toàn từ seed": nếu truyền `state` vào thì GHẾ BOT
// THỨ HAI ưu tiên người ngươi đã quen mà chưa đủ bậc mời. Không có ngoại lệ này thì Giao Tình
// bất khả thi — 200 bot, mỗi phiên rút 2, gặp lại đúng một người là 1/100 mỗi lượt, nuôi lên
// bậc 3 phải chờ hàng trăm giờ. Vẫn tất định (chọn theo seed+phiên), F5 ra đúng người đó.
// Không truyền `state` thì chạy y như cũ — chỗ nào chỉ cần xem quán vẫn gọi được.
// ============================================================
export function khachTrongQuan(world, now, state) {
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
      // Mang theo LORE THẬT của nhân vật: tâm cảnh (đổi theo ngày), sự kiện đời do tác giả viết,
      // môn phái xuất thân. Nhờ đó "Hỏi Chuyện" nói được chuyện của CHÍNH họ, không phải câu chung.
      const tam = (c.tamCanh && c.tamCanh.length) ? c.tamCanh : null;
      const su = (c.lifeEvents || []).map((e) => e.text).filter(Boolean);
      const h = mix(base, 101 + k);
      out.push({
        id: 'ds:' + c.id, loai: 'danhsi', ten: c.ten, phu: c.bietHieu || c.daoName,
        anh: c.face, mau: c.daoColor || '#e2e8f0', cap: 'Danh Sĩ · hạng ' + c.rank,
        tam, su, mon: c.monPhaiXuatThan || '',
        // 45% là nói ĐÚNG tâm cảnh hôm nay của họ -> nghe ra chất riêng ngay từ lúc ngồi
        cau: (tam && (h % 100) < 45) ? pick(mix(h, 3), tam) : pick(h, CAU_NGOI),
        gia: giaRuou(c.rankPower || 500),
      });
    });
  }

  const roster = genRoster(seed, createdAt);
  if (roster && roster.length) {
    const j0 = mix(base, 211) % roster.length;
    let j1 = (j0 + 1 + (mix(base, 307) % Math.max(1, roster.length - 1))) % roster.length;
    // GHẾ THỨ HAI: 55% lượt dành cho người quen ĐANG DỞ DANG — để Giao Tình nuôi được.
    // "Dở dang" = chưa đủ bậc để mời VÀ chưa ở trong minh. Không lọc hai vế này thì cái ghế
    // phí vào người đã mời được rồi (hoặc đã là minh chúng), mà mặt thì cứ lặp lại.
    if (state && (mix(base, 907) % 100) < 55) {
      const bang = state.bangPhai && state.bangPhai.bang;
      const trongMinh = new Set(bang ? (bang.tv || []).map((m) => m.id) : []);
      const doDang = [];
      for (const q of danhSachQuen(state)) {
        if (trongMinh.has(q.botId)) continue;
        const i = roster.findIndex((b) => b.id === q.botId);
        if (i < 0 || i === j0) continue;
        if (q.bac >= giaoTinhCan(botTotalLv(roster[i], t))) continue;   // mời được rồi thì thôi
        doDang.push(i);
      }
      if (doDang.length) j1 = doDang[mix(base, 1103) % doDang.length];
    }
    [j0, j1].forEach((j, k) => {
      const b = roster[j], av = botAvatar(b), lv = botCombatLv(b, t);
      const viec = botActivity(b, t);                   // việc bot ĐANG làm thật (dùng chung với Đồng Đạo Lân Cận)
      const h = mix(base, 401 + k);
      out.push({
        // `id` là khoá của bảng tin / nguội hỏi chuyện (giữ nguyên dạng cũ để save cũ không lệch).
        // `botId` là khoá THẬT của con bot — Giao Tình và Chiêu Mộ đều tra bằng nó.
        id: 'bot:' + j, botId: b.id, loai: 'bot', ten: b.name, phu: botTitle(b, t),
        av, mau: '#cbd5e1', cap: 'Chiến Đấu Lv ' + lv, viec, lv, tong: botTotalLv(b, t),
        cau: (h % 100) < 40 ? `Dạo này ta ${viec}, mệt đứt hơi.` : pick(h, CAU_NGOI),
        gia: giaRuou(80 + lv * 6),
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
// `tranh` = câu vừa nói của chính khách đó -> bốc lại nếu trùng. Không có nó thì bấm liên tục
// ra y một câu, nhìn rất giả (đây là chỗ bản đầu bị chê "sơ sài").
function bocKhacTruoc(h, arr, tranh, lam) {
  for (let i = 0; i < 6; i++) {
    const s = lam(pick(mix(h, i * 97 + 11), arr));
    if (s && s !== tranh) return s;
  }
  return lam(pick(h, arr));
}
function hatGiong(khach, hau, now) {
  return mix(h32(khach.id + ':' + hau), Math.floor((now || Date.now()) / 700) >>> 0);
}

export function loiMoiRuou(khach, now, tranh) {
  return bocKhacTruoc(hatGiong(khach, 'moi', now), CAU_MOI, tranh, (s) => s);
}

// Hỏi chuyện: ưu tiên kể LORE THẬT của chính người đó, hết mới rơi về câu chung.
export function loiHoiChuyen(khach, now, tranh) {
  const h = hatGiong(khach, 'hoi', now), r = h % 100;
  if (khach.loai === 'bot' && khach.viec) {
    return bocKhacTruoc(h, DAN_VIEC, tranh, (f) => f(khach.viec, khach.lv || 1));
  }
  if (khach.su && khach.su.length && r < 55) return bocKhacTruoc(h, DAN_SU, tranh, (f) => f(pick(mix(h, 31), khach.su)));
  if (khach.tam && khach.tam.length && r < 75) return bocKhacTruoc(h, DAN_TAM, tranh, (f) => f(pick(mix(h, 37), khach.tam)));
  if (khach.mon && r < 88) return bocKhacTruoc(h, DAN_MON, tranh, (f) => f(khach.mon));
  return bocKhacTruoc(h, CAU_HOI, tranh, (s) => s);
}

// Tin đồn dùng DỮ LIỆU THẬT (vùng · Yêu Vương · tên Danh Sĩ); null nếu lần này khách không nói.
export function tinDon(khach, now) {
  const h = hatGiong(khach, 'tin', now);
  if ((h % 100) >= 62) return null;                       // ~62% có tin
  const v = pick(mix(h, 5), LOCATIONS).name;
  const loai = mix(h, 23) % 100;
  if (loai < 22 && YEU_VUONG.length) {
    const b = pick(mix(h, 41), YEU_VUONG).name;
    return pick(mix(h, 43), TIN_BOSS)(b, v);
  }
  if (loai < 40) {
    const ds = danhSiList(now || Date.now());
    if (ds.length) {
      const n = pick(mix(h, 47), ds).ten;
      if (n !== khach.ten) return pick(mix(h, 53), TIN_NGUOI)(n, v);
    }
  }
  return pick(mix(h, 9), TIN_VUNG)(v);
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
