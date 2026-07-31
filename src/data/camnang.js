// ============================================================
// DATA — CẨM NANG, phần CƠ CHẾ (luật + công thức).
// Phần cơ sở dữ liệu tra cứu nằm ở `camnang_db.js`.
//
// ⚠ VĂN PHONG: đây là tài liệu TRA CỨU. Viết như sách tra: câu trần thuật,
//   gọi "người chơi", nêu số và điều kiện. KHÔNG xưng hô kiểu kể chuyện,
//   KHÔNG bình luận, KHÔNG đùa. Lời văn có chất võ hiệp để ở lore trong game,
//   không để ở đây.
// ⚠ MỌI CON SỐ RÚT TỪ BẢNG SỐ THẬT, không chép tay.
//
// Khối nội dung:
//   ['h', 'Tiêu đề nhỏ'] · ['p', 'Đoạn'] · ['ds', [...]] ·
//   ['bang', [cột], [[ô]]] · ['ct', 'Công thức'] · ['luu', 'Điểm cần lưu ý']
// ============================================================
import { SKILLS, STATS } from './skills.js';
import { LOCATIONS, REALM_TIERS } from './locations.js';
import { QUALITY, ITEM_TYPES, ITEMS, DOPHO_IDS, EGG_IDS } from './items.js';
import { EQUIP_SLOTS, TOOL_SLOTS, SECONDARY_STATS } from './ui.js';
import {
  AFFIX_KEYS, TRANG_SETS, GEAR_IDS, THOI_TIERS, QUALITY_LINES,
  MONSTER_DROP_CHANCE, MANH_DROP_CHANCE, MANH_DROP_MIN_LV, MONSTER_QUALITY_W,
} from './gear.js';
import {
  NGU_HANH_LIST, HE_FX, KHANG_CAP, KHANG_TU_HE, NGAT_AMP, TANG_MAX, TANG_HARD_MAX,
  TANG_GEAR_MAX, TANG_OVER_STEP, COMBAT_CYCLE_MS, TANG_BANDS, TAM_PHAP_POOL, BO_PHAP,
  CHIEU, BI_DONG, TUYET_IDS, TUYET_BAC, MON_PHAI, nguHanhMod,
} from './votong.js';
import { STANCES, YEU_VUONG, BAC_DROP_CHANCE, BAC_PER_EXP, ENEMIES, LOOT_DROP_MULT } from './combat.js';
import { DUNGEONS } from './dungeon.js';
import { PET_SPECIES, PET_QUALITY, AWK_PASSIVE_IDS, PET_OPT_POOL, PET_SKILLS } from './pets.js';
import { CODEX_CATS } from './codex.js';
import { TITLES, TITLE_LOAI } from './titles.js';
import { BADGES, BADGE_LV } from './badges.js';
import { REALMS, BUILD_KEYS, PILL_KEYS, BI_KIP, BI_KIP_LOAI, APT, DIPLO_TIERS, TAMMA_MAX, SUB_STAGES } from './tongmon.js';
import {
  CONG_TRINH, KY_NANG_BANG, CUA_HANG_BANG, NV_BANG, TV_TRAN, CAP_BANG_MAX,
  BAC_MOI_MINH_CONG, CP_BUFF_HANG, MUA_THUONG_BANG, BOSS_BANG_LUOT, LV_LAP_BANG, PHI_LAP_BANG,
  TRUY_NA_MOI_NGAY, MUA_MS, CP_MOI_KILL,
} from './bangphai.js';
import { DAILY_QUESTS, WEEKLY_QUESTS, MONTHLY_QUESTS, TUTORIAL_QUESTS } from './quests.js';
import { LOGIN_REWARDS } from './daily.js';
import { DANH_SI } from './danhsi.js';
import { DAMDAO } from './damdao.js';
import { LINH_THACH } from './linhthach.js';

// ---------- số rút từ bảng thật ----------
const n = (x) => (Array.isArray(x) ? x.length : Object.keys(x).length);
const pc = (x, d = 0) => (x * 100).toFixed(d).replace(/\.?0+$/, '') + '%';
const sn = (x) => Number(x).toLocaleString('vi-VN');
const KHAC_LOI = pc(nguHanhMod('kim', 'moc'));
const KHAC_THIET = pc(Math.abs(nguHanhMod('moc', 'kim')));
const NHIP_GIAY = COMBAT_CYCLE_MS / 1000;
const HE5 = NGU_HANH_LIST.map((h) => h.name).join(' · ');
const MUA_NGAY = Math.round(MUA_MS / 86400000);
// ⚠ Bảng số dùng khoá tiếng Anh để tính. Hiển thị phải đi qua đây, không bày khoá thô.
const NHAN_KHOA = {
  atk: 'Công Kích', def: 'Phòng Ngự', maxHP: 'Sinh Lực', spd: 'Khinh Công',
  crit: 'Bạo Kích', critDmg: 'Sát Thương Bạo Kích', dodge: 'Né Tránh',
  atkPct: 'Công Kích', defPct: 'Phòng Ngự', hpPct: 'Sinh Lực', allPct: 'Mọi chỉ số',
  expPct: 'Kinh nghiệm Chiến Đấu', dropPct: 'Tỉ lệ rơi', bacPct: 'Bạc nhặt được',
  nghePct: 'Tốc độ Nghề Khai Thác', ngheExpPct: 'Kinh nghiệm nghề',
  honThachPct: 'Hồn Thạch Bí Cảnh', bcDoPhoPct: 'Đồ phổ Bí Cảnh', petExpPct: 'Kinh nghiệm Linh Thú',
};
const nhanKhoa = (k) => NHAN_KHOA[k] || k;

export const CN_NHOM = [
  { id: 'nhapmon',  ten: 'Nhập Môn',        han: '始' },
  { id: 'nhanvat',  ten: 'Nhân Vật',        han: '身' },
  { id: 'nghe',     ten: 'Nghề Nghiệp',     han: '工' },
  { id: 'chiendau', ten: 'Chiến Đấu',       han: '戰' },
  { id: 'linhthu',  ten: 'Linh Thú',        han: '獸' },
  { id: 'tongmon',  ten: 'Tông Môn',        han: '宗' },
  { id: 'tienminh', ten: 'Tiên Minh',       han: '盟' },
  { id: 'giangho',  ten: 'Giang Hồ',        han: '江' },
  { id: 'suutap',   ten: 'Sưu Tập & Khác',  han: '集' },
];

export const CN_MUC = [
  // ================= NHẬP MÔN =================
  {
    id: 'tongquan', nhom: 'nhapmon', ten: 'Tổng Quan',
    tom: 'Thể loại nhàn tu, ba trục phát triển song song.',
    khoi: [
      ['p', 'Tiêu Dao Lục là trò chơi <b>nhàn tu</b> (idle) chạy trên trình duyệt. Người chơi đặt một hoạt động, hoạt động tiếp tục chạy khi đóng trình duyệt, và được tính bù khi mở lại.'],
      ['p', 'Không có lớp nhân vật cố định. Ba trục phát triển chạy song song và nuôi lẫn nhau:'],
      ['bang', ['Trục', 'Hoạt động', 'Sản phẩm'], [
        ['Nghề', 'Thu hoạch, chế tạo', 'Nguyên liệu, trang bị, Bạc, cấp nghề'],
        ['Võ', 'Đánh quái, Bí Cảnh, Yêu Vương', 'Cấp Chiến Đấu, trang bị, Hồn Thạch, trứng Linh Thú'],
        ['Thế lực', 'Tông Môn, Tiên Minh', 'Hệ số cộng thêm cho hai trục trên'],
      ]],
      ['bang', ['Quy mô', 'Số lượng'], [
        ['Nghề', sn(n(SKILLS))], ['Vùng bản đồ', sn(n(LOCATIONS))],
        ['Loại quái', sn(n(ENEMIES))], ['Yêu Vương', sn(n(YEU_VUONG))],
        ['Bí Cảnh', sn(n(DUNGEONS))], ['Vật phẩm', sn(n(ITEMS))],
        ['Trang bị mẫu', sn(n(GEAR_IDS))], ['Chiêu thức', sn(n(CHIEU))],
        ['Danh hiệu', sn(n(TITLES))],
      ]],
    ],
  },
  {
    id: 'treomay', nhom: 'nhapmon', ten: 'Treo Máy & Ngoại Tuyến',
    tom: 'Một hoạt động tại một thời điểm; tiến độ tính bù khi vắng mặt.',
    khoi: [
      ['p', 'Tại mỗi thời điểm chỉ có <b>một hoạt động chính</b>: làm nghề, chiến đấu, di chuyển, hoặc Bí Cảnh. Chọn hoạt động mới sẽ dừng hoạt động cũ.'],
      ['ds', [
        'Tiến độ khi đóng trình duyệt được tính bù lúc mở lại, giới hạn bởi trần ngoại tuyến.',
        'Trần ngoại tuyến cơ sở 8 giờ, nới thêm theo bậc Động Phủ.',
        'Kết quả khi treo máy và khi ngồi xem là <b>như nhau</b>. Hai đường thưởng dùng chung hệ số.',
      ]],
      ['h', 'Điều kiện tự dừng'],
      ['bang', ['Tình huống', 'Hệ quả'], [
        ['Hành lý đầy', 'Hoạt động thu hoạch dừng'],
        ['Hết nguyên liệu đầu vào', 'Hoạt động chế tạo dừng'],
        ['Hết Linh Thạch', 'Hoạt động tiếp tục, mất phần cộng thêm'],
        ['Nhân vật gục', 'Chuyển sang trạng thái Suy Yếu, hết thời gian mới đánh tiếp'],
      ]],
    ],
  },
  {
    id: 'tiente', nhom: 'nhapmon', ten: 'Tiền Tệ',
    tom: 'Ba loại: Bạc, Hồn Thạch, Nguyên Bảo.',
    khoi: [
      ['bang', ['Loại', 'Nguồn chính', 'Dùng vào'], [
        ['Bạc', 'Bán vật phẩm, đánh quái, nhiệm vụ, Bí Cảnh', 'Mua bán, cường hoá, Truyền Tống, xây dựng, cống hiến Tiên Minh'],
        ['Hồn Thạch', 'Yêu Vương, Bí Cảnh, nhiệm vụ tuần và tháng, thưởng mùa Chinh Phạt', 'Phí vào Bí Cảnh cấp cao, vật phẩm quý'],
        ['Nguyên Bảo', 'Nhiệm vụ tháng, mốc lớn', 'Nguồn hiếm nhất'],
      ]],
      ['h', 'Bạc rơi từ quái'],
      ['ct', 'Bạc mỗi lần rơi = round(EXP quái × ' + BAC_PER_EXP + ') × hệ số thưởng Bạc'],
      ['p', 'Xác suất rơi Bạc mỗi trận: <b>' + pc(BAC_DROP_CHANCE) + '</b>.'],
      ['p', 'Trò chơi không bán vật phẩm bằng tiền thật.'],
    ],
  },
  {
    id: 'capdo', nhom: 'nhapmon', ten: 'Cấp Độ & Cảnh Giới',
    tom: 'Mỗi nghề một cấp riêng; Tổng Lv là tổng tất cả.',
    khoi: [
      ['p', 'Mỗi nghề có cấp riêng, trần 100, cộng thêm cấp Chiến Đấu. <b>Tổng Lv</b> là tổng các cấp đó.'],
      ['h', 'Tổng Lv quyết định'],
      ['ds', [
        'Mở nghề mới — mỗi 80 Tổng Lv mở thêm một nghề, chi phí tăng dần.',
        'Phí Truyền Tống — xem trang Bản Đồ.',
        'Điều kiện lập Tiên Minh — cần Tổng Lv ' + sn(LV_LAP_BANG) + '.',
      ]],
      ['h', 'Bốn cảnh giới bản đồ'],
      ['bang', ['Cảnh giới', 'Khoảng cấp'], REALM_TIERS.map((r) => [r.name, r.range])],
    ],
  },
  {
    id: 'luutru', nhom: 'nhapmon', ten: 'Lưu Trữ & Tài Khoản',
    tom: 'Lưu cục bộ; đăng nhập thêm bản đám mây.',
    khoi: [
      ['ds', [
        'Trò chơi tự lưu vào trình duyệt sau mỗi thay đổi lớn.',
        'Đăng nhập tài khoản bổ sung bản lưu đám mây, dùng để đổi thiết bị.',
        'Xoá dữ liệu trình duyệt làm mất bản cục bộ nếu chưa đồng bộ.',
      ]],
      ['p', 'Cửa sổ Cài Đặt có chức năng tải bản lưu xuống và nạp lại.'],
    ],
  },

  // ================= NHÂN VẬT =================
  {
    id: 'tutru', nhom: 'nhanvat', ten: 'Tứ Trụ & Chỉ Số',
    tom: 'Bốn trụ gốc sinh ra chỉ số chiến đấu.',
    khoi: [
      ['bang', ['Trụ', 'Tương ứng'], Object.values(STATS).map((s) => [s.name, s.gloss])],
      ['p', 'Tứ Trụ tăng theo cấp và theo trang bị, rồi quy thành các chỉ số chiến đấu:'],
      ['bang', ['Chỉ số', 'Ý nghĩa'], SECONDARY_STATS.map((s) => [s.name, s.desc])],
      ['p', 'Chiến Lực là chỉ số tổng hợp dùng để so sánh nhanh, không tham gia trực tiếp vào công thức sát thương.'],
      ['h', 'Thế đứng'],
      ['bang', ['Thế', 'Thiên về', 'Trụ gắn'], STANCES.map((s) => [s.name, s.gloss, (STATS[s.stat] || {}).name || s.stat])],
    ],
  },
  {
    id: 'trangbi', nhom: 'nhanvat', ten: 'Trang Bị',
    tom: sn(n(EQUIP_SLOTS)) + ' ô, ' + sn(n(QUALITY)) + ' bậc phẩm chất.',
    khoi: [
      ['p', 'Có <b>' + n(EQUIP_SLOTS) + ' ô trang bị chiến đấu</b>. Vai trò từng ô đã được phân định trong bảng số:'],
      ['bang', ['Nhóm ô', 'Ô', 'Thiên về'], [
        ['Tấn công', 'Vũ Khí · Nhẫn · Trang Sức', 'Công Kích, sát thương hệ'],
        ['Phòng ngự', 'Mũ · Giáp · Đai Lưng', 'Hộ Thể, Sinh Lực'],
        ['Cơ động', 'Găng · Giày · Tọa Kỵ', 'Né Tránh, Chính Xác, tốc độ'],
      ]],
      ['h', 'Phẩm chất và số dòng phụ'],
      ['bang', ['Phẩm chất', 'Số dòng phụ tối đa'],
        Object.keys(QUALITY).map((q) => [QUALITY[q].name, sn(QUALITY_LINES[q] || 0)])],
      ['p', 'Món rơi hoặc rèn ra là <b>bản riêng</b>: cùng tên nhưng dòng phụ bốc khác nhau. Xem chi tiết từng món ở bảng <b>Trang Bị</b> trong Tra Cứu.'],
    ],
  },
  {
    id: 'dongan', nhom: 'nhanvat', ten: 'Dòng Phụ & Cường Hoá',
    tom: sn(n(AFFIX_KEYS)) + ' loại dòng phụ; ' + sn(n(THOI_TIERS)) + ' bậc thỏi cường hoá.',
    khoi: [
      ['p', 'Dòng phụ bốc ngẫu nhiên từ <b>' + n(AFFIX_KEYS) + ' loại</b>. Mỗi ô có bộ trọng số riêng, nên dòng nào ra ở ô nào là cố định theo bảng số. Xem bảng <b>Dòng Phụ</b> trong Tra Cứu để biết khoảng giá trị và ô bốc được.'],
      ['h', 'Cường hoá'],
      ['ds', [
        'Tốn Bạc và thỏi kim loại đúng bậc — có <b>' + n(THOI_TIERS) + ' bậc thỏi</b>.',
        'Thất bại không mất món, chỉ mất phí.',
        'Các mốc cường hoá cao cần Tinh Thể Yêu Vương.',
      ]],
      ['h', 'Trang bị rơi từ quái'],
      ['ct', 'Xác suất rơi trang bị = ' + pc(MONSTER_DROP_CHANCE, 2) + ' × hệ số thưởng rơi đồ'],
      ['bang', ['Phẩm chất', 'Trọng số khi đã rơi', 'Xác suất tuyệt đối mỗi trận'],
        Object.entries(MONSTER_QUALITY_W || {}).map(([q, w]) => {
          const tong = Object.values(MONSTER_QUALITY_W).reduce((s, x) => s + x, 0);
          return [(QUALITY[q] || {}).name || q, pc(w / tong), pc(MONSTER_DROP_CHANCE * (w / tong), 3)];
        })],
      ['ct', 'Xác suất rơi Mảnh Trang Bị = ' + pc(MANH_DROP_CHANCE, 3) + ' × hệ số thưởng rơi đồ  (chỉ quái từ Lv ' + MANH_DROP_MIN_LV + ')'],
      ['p', 'Ở mức cơ sở, kỳ vọng khoảng <b>' + sn(Math.round(1 / MONSTER_DROP_CHANCE)) + ' trận</b> một món trang bị.'],
    ],
  },
  {
    id: 'botrang', nhom: 'nhanvat', ten: 'Bộ Trang',
    tom: sn(n(TRANG_SETS)) + ' bộ; dòng ẩn mở ở mốc 3, 5, 7 món.',
    khoi: [
      ['p', 'Có <b>' + n(TRANG_SETS) + ' bộ trang</b>. Mặc đủ số món cùng một bộ mở dòng ẩn tại mốc 3, 5 và 7. Mốc sau bao gồm mốc trước.'],
      ['p', 'Bộ hạng <b>Bạch Kim</b> ghép từ Mảnh Trang Bị theo đồ phổ bộ; đồ phổ rơi ở Bí Cảnh cấp cao.'],
      ['p', 'Bảng <b>Bộ Trang</b> trong Tra Cứu ghi đủ dòng ẩn từng mốc, số mảnh mỗi món, và nơi rơi đồ phổ.'],
    ],
  },
  {
    id: 'congcu', nhom: 'nhanvat', ten: 'Công Cụ Làm Nghề',
    tom: sn(n(TOOL_SLOTS)) + ' ô công cụ; cộng thẳng vào hiệu suất nghề.',
    khoi: [
      ['bang', ['Ô công cụ', 'Nghề dùng'], [
        ['Rìu', 'Đốn Củi'], ['Cuốc', 'Đào Khoáng'], ['Cần Câu', 'Câu Cá'], ['Dược Liêm', 'Hái Thuốc'],
      ]],
      ['p', 'Công cụ không tham gia chiến đấu. Phần cộng của công cụ vào thẳng mẫu số hiệu suất:'],
      ['ct', 'Chu kỳ thực = thời gian cơ sở ÷ tổng hệ số hiệu suất'],
      ['p', 'Nguồn: rèn bằng nghề Rèn Đúc, mua ở Thương Điếm, hoặc rơi trong Bí Cảnh. Xem bảng <b>Công Cụ</b> trong Tra Cứu.'],
    ],
  },
  {
    id: 'hanhly', nhom: 'nhanvat', ten: 'Hành Lý',
    tom: sn(n(ITEMS)) + ' vật phẩm, ' + sn(n(ITEM_TYPES)) + ' loại.',
    khoi: [
      ['bang', ['Loại', 'Số vật phẩm'],
        Object.keys(ITEM_TYPES).map((t) => [
          (typeof ITEM_TYPES[t] === 'string' ? ITEM_TYPES[t] : ITEM_TYPES[t].name),
          sn(Object.values(ITEMS).filter((i) => i.type === t).length),
        ])],
      ['ds', [
        'Vật phẩm thường xếp chồng theo mã; trang bị giữ từng bản riêng.',
        'Trong đó có <b>' + n(DOPHO_IDS) + ' đồ phổ</b> và <b>' + n(EGG_IDS) + ' trứng Linh Thú</b>.',
      ]],
      ['luu', 'Hành lý đầy làm mọi hoạt động thu hoạch dừng lại.'],
    ],
  },
  {
    id: 'dongphu', nhom: 'nhanvat', ten: 'Động Phủ',
    tom: 'Nới trần ngoại tuyến và mở công trình tiện ích.',
    khoi: [
      ['bang', ['Chức năng', 'Chi tiết'], [
        ['Nới trần ngoại tuyến', 'Bậc nhà càng cao, số giờ tính bù càng nhiều'],
        ['Công trình tiện ích', 'Xây bằng Bạc và nguyên liệu, mất thời gian thực'],
        ['Cửa vào Thiên Cơ Các', 'Các trò nhỏ đặt tại đây'],
      ]],
      ['p', 'Công trình có <b>độ bền</b> giảm dần theo thời gian. Công trình hỏng ngừng tác dụng cho tới khi sửa; phí sửa thấp hơn phí xây mới.'],
    ],
  },

  // ================= NGHỀ =================
  {
    id: 'muoinghe', nhom: 'nghe', ten: 'Danh Sách Nghề',
    tom: sn(n(SKILLS)) + ' nghề, trần cấp 100 mỗi nghề.',
    khoi: [
      ['bang', ['Nghề', 'Việc'], Object.values(SKILLS).map((s) => [s.name, s.gloss || ''])],
      ['p', 'Mỗi nghề có cấp và kinh nghiệm riêng, trần 100. Mở nghề mới cần Tổng Lv đủ và một khoản Bạc; cứ mỗi 80 Tổng Lv mở thêm một nghề, chi phí tăng dần.'],
    ],
  },
  {
    id: 'thuhoach', nhom: 'nghe', ten: 'Thu Hoạch & Chế Tạo',
    tom: 'Công thức chu kỳ và các nguồn hiệu suất.',
    khoi: [
      ['ct', 'Chu kỳ thực = thời gian cơ sở ÷ tổng hệ số hiệu suất'],
      ['h', 'Các nguồn cùng cộng vào mẫu số'],
      ['ds', [
        'Cấp nghề', 'Công cụ đang gắn', 'Tín Vật từ Đàm Đạo',
        'Kĩ năng Tiên Minh nhánh nghề', 'Linh Thạch đang đốt',
        'Buff Chinh Phạt của vùng đang đứng',
      ]],
      ['h', 'Hai kiểu nghề'],
      ['bang', ['Kiểu', 'Đầu vào', 'Đầu ra'], [
        ['Thu hoạch', 'Không cần nguyên liệu (trừ Câu Cá tốn mồi)', 'Nguyên liệu thô, kinh nghiệm nghề'],
        ['Chế tạo', 'Nguyên liệu + đồ phổ', 'Vật phẩm thành phẩm, kinh nghiệm nghề'],
      ]],
      ['p', 'Nguyên liệu bậc cao chỉ có ở vùng cấp cao. Có <b>' + n(DOPHO_IDS) + ' đồ phổ</b> trong trò chơi.'],
    ],
  },
  {
    id: 'linhthach', nhom: 'nghe', ten: 'Linh Thạch',
    tom: sn(n(LINH_THACH)) + ' loại, cộng kinh nghiệm / hiệu suất / sản lượng.',
    khoi: [
      ['p', 'Linh Thạch là vật phẩm tiêu hao dùng khi làm nghề. Ba nhánh tác dụng: kinh nghiệm nghề, hiệu suất (rút ngắn chu kỳ), sản lượng mỗi lượt.'],
      ['ds', [
        'Mỗi viên phủ một khoảng thời gian hoạt động, hết thì tự đốt viên cùng loại kế tiếp.',
        'Hết sạch thì hoạt động vẫn chạy, chỉ mất phần cộng thêm.',
      ]],
      ['p', 'Bảng <b>Linh Thạch</b> trong Tra Cứu ghi mức cộng của từng viên.'],
    ],
  },
  {
    id: 'damdao', nhom: 'nghe', ten: 'Đàm Đạo',
    tom: sn(n(DAMDAO)) + ' mạch truyện, mỗi nghề một bậc thầy.',
    khoi: [
      ['p', 'Mỗi nghề có một nhân vật bậc thầy và một mạch truyện mở dần theo cấp nghề. Cửa vào nằm tại trang của nghề.'],
      ['p', 'Hoàn tất mạch truyện của một nghề cấp <b>Tín Vật</b>, cộng hiệu suất cố định cho nghề đó.'],
    ],
  },

  // ================= CHIẾN ĐẤU =================
  {
    id: 'vongdau', nhom: 'chiendau', ten: 'Vòng Đấu',
    tom: 'Nhịp ' + NHIP_GIAY + ' giây một trận, diễn tự động.',
    khoi: [
      ['p', 'Chiến đấu diễn tự động. Hệ thống nhàn tu chuẩn hoá mỗi vòng cày là <b>' + NHIP_GIAY + ' giây</b>, tương ứng một trận.'],
      ['ds', [
        'Bộ chiêu đã xếp quyết định thứ tự ra chiêu, mức tiêu Nội Lực và hồi chiêu.',
        'Sinh Lực duy trì bằng món ăn và đan dược gắn ở ô tự dùng.',
        'Gục thì chuyển sang trạng thái Suy Yếu, hết thời gian mới đánh tiếp. Vật phẩm đã nhận không mất.',
      ]],
      ['p', 'Có <b>' + n(ENEMIES) + ' loại quái</b> phân bố trên <b>' + n(LOCATIONS) + ' vùng</b>. Chỉ số từng con xem ở bảng <b>Quái</b> trong Tra Cứu.'],
    ],
  },
  {
    id: 'nguhanh', nhom: 'chiendau', ten: 'Ngũ Hành Khắc Chế',
    tom: 'Khắc +' + KHAC_LOI + ', bị khắc −' + KHAC_THIET + '.',
    khoi: [
      ['p', 'Năm hệ: <b>' + HE5 + '</b>. Ngoài ra có <b>Vô Hệ</b> — đòn không thuộc hệ nào, không chịu và không hưởng khắc chế.'],
      ['ct', 'Vòng khắc: Kim → Mộc → Thổ → Thủy → Hỏa → Kim'],
      ['bang', ['Quan hệ', 'Hệ số sát thương'], [
        ['Đánh vào hệ mình khắc', '+' + KHAC_LOI],
        ['Đánh vào hệ khắc mình', '−' + KHAC_THIET],
        ['Cùng hệ hoặc Vô Hệ', 'không đổi'],
      ]],
      ['p', 'Có <b>' + n(MON_PHAI) + ' môn phái</b> đặt tên cho các nhánh võ học theo hệ. Chọn nhánh không khoá việc học chiêu của nhánh khác.'],
    ],
  },
  {
    id: 'khang', nhom: 'chiendau', ten: 'Kháng Ngũ Hành',
    tom: 'Trần kháng ' + pc(KHANG_CAP) + '; Tâm Pháp cho sẵn ' + pc(KHANG_TU_HE) + ' hệ mình.',
    khoi: [
      ['p', 'Mỗi hệ có một chỉ số kháng riêng, giảm trực tiếp sát thương của hệ đó.'],
      ['bang', ['Mục', 'Giá trị'], [
        ['Trần kháng mỗi hệ', pc(KHANG_CAP)],
        ['Kháng sẵn có từ Tâm Pháp cho hệ của nó', pc(KHANG_TU_HE)],
      ]],
      ['h', 'Nguồn kháng'],
      ['ds', ['Tâm Pháp', 'Dòng phụ trang bị', 'Dòng ẩn Bộ Trang', 'Đan dược']],
      ['p', 'Quái cũng có kháng riêng. Chỉ số kháng từng con ghi trong bảng <b>Quái</b> và <b>Yêu Vương</b> ở Tra Cứu.'],
    ],
  },
  {
    id: 'hieuung', nhom: 'chiendau', ten: 'Hiệu Ứng Theo Hệ',
    tom: 'Mỗi hệ một hiệu ứng, có tỉ lệ và số nhịp riêng.',
    khoi: [
      ['bang', ['Hệ', 'Hiệu ứng', 'Tỉ lệ', 'Số nhịp', 'Sát thương mỗi nhịp'],
        Object.entries(HE_FX).map(([he, f]) => [
          (NGU_HANH_LIST.find((x) => x.id === he) || {}).name || he,
          f.ten, pc(f.pct), sn(f.ticks), f.dot ? pc(f.dot, 1) + ' Sinh Lực tối đa' : '—',
        ])],
      ['bang', ['Hiệu ứng', 'Tác động'], [
        ['Độc · Bỏng', 'Gây sát thương mỗi nhịp'],
        ['Chậm', 'Kéo lùi lượt ra đòn'],
        ['Choáng · Ngất', 'Bỏ lượt'],
      ]],
      ['ct', 'Sát thương vào mục tiêu đang Ngất × ' + (1 + NGAT_AMP)],
    ],
  },
  {
    id: 'vohoc', nhom: 'chiendau', ten: 'Võ Học',
    tom: 'Tâm Pháp · Chiêu Thức · Bộ Pháp · Bị Động · Tuyệt Học.',
    khoi: [
      ['p', 'Toàn bộ võ học quản lý ở <b>Tàng Kinh Các</b>.'],
      ['bang', ['Thành phần', 'Số lượng', 'Vai trò'], [
        ['Tâm Pháp', sn(n(TAM_PHAP_POOL)), 'Định hệ chính, Nội Lực tối đa, hồi Nội Lực, một nhóm chỉ số'],
        ['Chiêu Thức', sn(n(CHIEU)), 'Đòn đánh; có hệ, bậc, hệ số, giá Nội Lực, hồi chiêu'],
        ['Bộ Pháp', sn(n(BO_PHAP)), 'Bộ chỉnh chỉ số theo đánh đổi'],
        ['Bị Động', sn(n(BI_DONG)), 'Chạy nền suốt trận'],
        ['Tuyệt Học', sn(n(TUYET_IDS)), 'Bậc cao nhất; cần đồ phổ, nguyên liệu hiếm và ' + sn(TUYET_BAC) + ' Bạc'],
      ]],
      ['p', 'Chiêu thức chia bốn bậc: Sơ · Trung · Cao · Tuyệt. Số ô chiêu mở thêm theo cấp Chiến Đấu.'],
      ['p', 'Chỉ số cụ thể của từng món xem ở các bảng <b>Chiêu Thức</b>, <b>Tâm Pháp</b>, <b>Bộ Pháp</b>, <b>Bị Động</b> trong Tra Cứu.'],
    ],
  },
  {
    id: 'tang', nhom: 'chiendau', ten: 'Tầng Võ Học',
    tom: 'Trần luyện ' + TANG_MAX + ', trần thật ' + TANG_HARD_MAX + '.',
    khoi: [
      ['bang', ['Mục', 'Giá trị'], [
        ['Trần luyện trực tiếp', sn(TANG_MAX)],
        ['Trang bị cộng thêm tối đa', '+' + sn(TANG_GEAR_MAX)],
        ['Trần thật', sn(TANG_HARD_MAX)],
        ['Uy lực mỗi tầng', '+' + pc(TANG_OVER_STEP, 0)],
      ]],
      ['h', 'Bốn mốc cảnh giới'],
      ['bang', ['Mốc', 'Cảnh giới', 'Mở thêm'], TANG_BANDS.map((b) => ['Tầng ' + b.at, b.name, b.eff])],
      ['p', 'Do mốc tầng ' + TANG_BANDS[TANG_BANDS.length - 1].at + ' nhân đôi uy lực, dồn tầng vào ít chiêu chủ lực cho tổng sát thương cao hơn rải đều.'],
    ],
  },
  {
    id: 'bicanh', nhom: 'chiendau', ten: 'Bí Cảnh',
    tom: sn(n(DUNGEONS)) + ' phó bản chạy theo lịch thời gian thực.',
    khoi: [
      ['p', 'Bí Cảnh <b>chiếm chỗ hoạt động chính</b> — đặt lịch là dừng việc đang làm. Mỗi lượt đi qua các tầng theo cấu hình của phó bản đó rồi kết ở thủ lĩnh.'],
      ['bang', ['Bí Cảnh', 'Cấp cần', 'Thời lượng', 'Phí vào'],
        DUNGEONS.map((d) => [
          d.name, 'Lv ' + d.reqLevel, Math.round(d.durMs / 60000) + ' phút',
          [(d.cost || {}).bac ? sn(d.cost.bac) + ' Bạc' : null, (d.cost || {}).honThach ? sn(d.cost.honThach) + ' Hồn Thạch' : null].filter(Boolean).join(' + ') || '—',
        ])],
      ['ds', [
        'Chỉ thông quan thủ lĩnh mới bốc đồ phổ và vật phẩm hiếm.',
        'Rút lui giữa chừng vẫn giữ một phần Bạc, kinh nghiệm và Hồn Thạch.',
        'Mảnh Trang Bị là phần thưởng chắc chắn khi thông quan, không phải bốc.',
      ]],
      ['p', 'Tỉ lệ từng khoản thưởng ghi ở bảng <b>Bí Cảnh</b> trong Tra Cứu.'],
    ],
  },
  {
    id: 'yeuvuong', nhom: 'chiendau', ten: 'Yêu Vương',
    tom: sn(n(YEU_VUONG)) + ' trùm thế giới, đánh theo lượt.',
    khoi: [
      ['p', 'Yêu Vương đánh theo lượt, không treo máy. Mỗi con có thời gian hồi riêng sau khi bị hạ.'],
      ['bang', ['Yêu Vương', 'Cấp cần', 'Hồi', 'Tinh Thể', 'Hồn Thạch', 'Bạc'],
        YEU_VUONG.map((y) => [
          y.name, 'Lv ' + y.reqLevel, ((y.wb || {}).cdHours || 0) + ' giờ',
          sn((y.wb || {}).tinhThe || 0), sn((y.wb || {}).honThach || 0), sn((y.wb || {}).bac || 0),
        ])],
      ['ds', [
        'Yêu Vương không rơi trang bị ngẫu nhiên.',
        'Trứng Linh Thú chỉ rơi ở đây. Tỉ lệ từng bậc trứng xem ở bảng <b>Yêu Vương</b> trong Tra Cứu.',
        'Thua trận phải dưỡng thương trước khi đánh lại.',
      ]],
    ],
  },

  // ================= LINH THÚ =================
  {
    id: 'linhthu_co', nhom: 'linhthu', ten: 'Linh Thú',
    tom: sn(n(PET_SPECIES)) + ' loài, ' + sn(n(PET_QUALITY)) + ' bậc phẩm chất.',
    khoi: [
      ['p', 'Linh Thú nở từ trứng rơi ở Yêu Vương. Phẩm chất trứng quyết định phẩm chất thú; thang phẩm chất giống trang bị.'],
      ['bang', ['Mục', 'Số lượng'], [
        ['Loài', sn(n(PET_SPECIES))], ['Bậc phẩm chất', sn(n(PET_QUALITY))],
        ['Kỹ năng', sn(n(PET_SKILLS))], ['Tiềm năng bốc lúc nở', sn(n(PET_OPT_POOL))],
        ['Bị động thức tỉnh', sn(n(AWK_PASSIVE_IDS))],
      ]],
      ['p', 'Ấp trứng mất thời gian thực; phẩm chất càng cao ấp càng lâu. Danh sách loài xem ở bảng <b>Linh Thú</b> trong Tra Cứu.'],
    ],
  },
  {
    id: 'linhthu_ky', nhom: 'linhthu', ten: 'Thức Tỉnh & Hợp Nhất',
    tom: 'Mở bị động mới; có thể thất bại.',
    khoi: [
      ['p', 'Thức Tỉnh mở thêm bị động từ bể <b>' + n(AWK_PASSIVE_IDS) + ' loại</b>. Cần vật phẩm chuyên dụng và có thể thất bại.'],
      ['p', 'Hợp nhất cho phép tiêu nhiều thú để cải thiện một con mục tiêu.'],
    ],
  },
  {
    id: 'linhthu_dung', nhom: 'linhthu', ten: 'Ngự Thú & Săn Mồi',
    tom: 'Mang theo chiến đấu, hoặc thả săn nền.',
    khoi: [
      ['bang', ['Chế độ', 'Tác dụng'], [
        ['Ngự Thú', 'Thú cộng chỉ số cho người chơi và tham chiến'],
        ['Săn Mồi', 'Thú đi săn nền theo thời gian thực, mang vật phẩm về'],
      ]],
      ['p', 'Thú đói làm giảm hiệu quả. Thức ăn đến từ nghề Trù Sư và vật phẩm dưỡng thú.'],
    ],
  },

  // ================= TÔNG MÔN =================
  {
    id: 'tongmon_co', nhom: 'tongmon', ten: 'Tông Môn',
    tom: 'Người chơi làm chưởng môn, nuôi đệ tử.',
    khoi: [
      ['p', 'Tông Môn là nhánh phát triển dài hạn. Người chơi làm chưởng môn; đệ tử tự tu luyện và làm việc, mang thành quả về cho tông.'],
      ['bang', ['Nhánh', 'Vai trò'], [
        ['Tông Môn', 'Nuôi dưỡng, chiều sâu, dài hạn'],
        ['Tiên Minh', 'Tranh hạng theo mùa, hoạt động bang'],
      ]],
      ['h', 'Tư chất đệ tử'],
      ['bang', ['Tư chất', 'Hệ số tu luyện', 'Trần'],
        Object.values(APT).map((a) => [a.name, '×' + a.mul, sn(a.cap)])],
      ['p', 'Mỗi đệ tử còn có hệ ngũ hành và tính cách riêng. Số đệ tử nuôi được tăng theo công trình Tụ Hiền Đường.'],
    ],
  },
  {
    id: 'tongmon_tu', nhom: 'tongmon', ten: 'Tu Luyện & Cảnh Giới',
    tom: sn(n(REALMS)) + ' cảnh giới × ' + sn(n(SUB_STAGES)) + ' tầng nhỏ.',
    khoi: [
      ['bang', ['Cảnh giới'], REALMS.map((r) => [r.ten || r.name])],
      ['p', 'Mỗi cảnh giới chia <b>' + n(SUB_STAGES) + ' tầng nhỏ</b>. Lên cảnh giới mới cần <b>đan phá cảnh</b> đúng bậc — có <b>' + n(PILL_KEYS) + ' loại</b>, luyện ở Y Quán.'],
      ['h', 'Hai rào cản'],
      ['bang', ['Rào', 'Mô tả', 'Hệ quả'], [
        ['Tâm Ma', 'Tích theo thời gian tu luyện, tối đa ' + TAMMA_MAX + ' tầng', 'Giảm tốc tu luyện, tăng rủi ro'],
        ['Thiên Kiếp', 'Xảy ra khi vượt cảnh giới lớn', 'Thất bại thì tụt cảnh giới hoặc mất đệ tử'],
      ]],
      ['luu', 'Đệ tử tư chất thấp có tỉ lệ qua Thiên Kiếp thấp. Mất đệ tử là mất toàn bộ tiến độ của đệ tử đó.'],
    ],
  },
  {
    id: 'tongmon_ct', nhom: 'tongmon', ten: 'Công Trình Tông Môn',
    tom: sn(n(BUILD_KEYS)) + ' công trình.',
    khoi: [
      ['bang', ['Công trình', 'Chức năng'], [
        ['Tụ Hiền Đường', 'Chiêu nạp đệ tử, nới trần số người'],
        ['Diễn Võ Trường', 'Đệ tử luyện võ'],
        ['Tàng Thư Lâu', 'Chứa và học Bí Kíp, chặn trần bậc học được'],
        ['Y Quán', 'Luyện đan; số lò tăng theo cấp'],
        ['Dược Viên', 'Trồng linh dược; số luống tăng theo cấp'],
        ['Giới Luật Đường', 'Xử lý đệ tử phạm giới, giảm Tâm Ma'],
        ['Tụ Linh Trận', 'Tăng tốc tu luyện toàn tông'],
      ]],
      ['p', 'Tổng cộng <b>' + n(BUILD_KEYS) + ' công trình</b>. Xây và nâng bằng nguyên liệu tông môn, mất thời gian thực.'],
    ],
  },
  {
    id: 'tongmon_bk', nhom: 'tongmon', ten: 'Bí Kíp',
    tom: sn(n(BI_KIP)) + ' bí kíp, ' + sn(n(BI_KIP_LOAI)) + ' nhánh.',
    khoi: [
      ['bang', ['Nhánh', 'Cộng cho đệ tử'],
        Object.values(BI_KIP_LOAI).map((l) => [
          l.name, Object.entries(l.prof).map(([k, v]) => nhanKhoa(k) + ' +' + pc(v)).join(' · '),
        ])],
      ['ds', [
        'Bí kíp chia bốn bậc; bậc học được bị Tàng Thư Lâu chặn trần.',
        'Nguồn: đấu giá Tàng Thư Lâu và Bí Cảnh.',
        'Bí kíp trùng ghép lên bậc cao hơn.',
      ]],
      ['p', 'Danh sách đầy đủ ở bảng <b>Bí Kíp</b> trong Tra Cứu.'],
    ],
  },
  {
    id: 'tongmon_ng', nhom: 'tongmon', ten: 'Ngoại Giao',
    tom: sn(n(DIPLO_TIERS)) + ' bậc quan hệ.',
    khoi: [
      ['bang', ['Bậc', 'Điểm tối thiểu'], DIPLO_TIERS.map((d) => [d.name, sn(d.min)])],
      ['p', 'Tặng lễ, mời làm khách và luận võ đều cộng điểm quan hệ. Bậc cao mở quyền lợi riêng.'],
    ],
  },

  // ================= TIÊN MINH =================
  {
    id: 'tienminh_co', nhom: 'tienminh', ten: 'Lập Tiên Minh',
    tom: 'Cần Tổng Lv ' + sn(LV_LAP_BANG) + ' và ' + sn(PHI_LAP_BANG) + ' Bạc.',
    khoi: [
      ['p', 'Người chơi tự lập Tiên Minh và giữ chức Minh Chủ. Các Tiên Minh khác trong giang hồ là đối thủ trên bảng Chinh Phạt, không phải nơi xin gia nhập.'],
      ['bang', ['Mục', 'Giá trị'], [
        ['Tổng Lv yêu cầu', sn(LV_LAP_BANG)], ['Phí lập', sn(PHI_LAP_BANG) + ' Bạc'],
        ['Trần cấp minh', sn(CAP_BANG_MAX)], ['Sức chứa tối đa', sn(TV_TRAN) + ' người'],
      ]],
      ['h', 'Ba đường chiêu mộ'],
      ['ds', ['Đơn Xin Nhập Minh', 'Bảng Chiêu Hiền', 'Người quen ở Tửu Lâu qua Giao Tình']],
      ['p', 'Minh Chủ có quyền thăng, hạ, kích người, đặt quyền theo chức, duyệt đơn và giải tán.'],
    ],
  },
  {
    id: 'tienminh_cong', nhom: 'tienminh', ten: 'Minh Cống & Công Tích',
    tom: 'Góp Bạc sinh hai loại điểm.',
    khoi: [
      ['bang', ['Điểm', 'Thuộc về', 'Tỉ giá', 'Dùng vào'], [
        ['Công Tích', 'Cá nhân', '1 Bạc = 1 Công Tích', 'Học kĩ năng, mua ở Minh Hội Các'],
        ['Minh Cống', 'Tiên Minh', sn(BAC_MOI_MINH_CONG) + ' Bạc = 1 Minh Cống', 'Nâng cấp minh'],
      ]],
      ['bang', ['Kho', 'Chứa'], [
        ['Ngân Khố', 'Bạc'], ['Minh Khố', 'Vật phẩm'],
      ]],
    ],
  },
  {
    id: 'tienminh_ct', nhom: 'tienminh', ten: 'Công Trình & Kĩ Năng',
    tom: sn(n(CONG_TRINH)) + ' công trình · ' + sn(n(KY_NANG_BANG)) + ' kĩ năng.',
    khoi: [
      ['p', 'Công trình xây bằng Bạc trong Ngân Khố, mất thời gian thực, không vượt được cấp minh. Mỗi lúc chỉ xây một công trình.'],
      ['p', 'Kĩ năng học bằng Công Tích, cộng chỉ số thật cho mọi thành viên. Mỗi nhánh kĩ năng bị một công trình chặn trần cấp.'],
      ['h', 'Tổng cộng khi học hết cây kĩ năng'],
      ['bang', ['Cộng vào', 'Tổng'],
        (() => {
          const gom = {};
          for (const k of KY_NANG_BANG) gom[k.han || nhanKhoa(k.key)] = (gom[k.han || nhanKhoa(k.key)] || 0) + k.moiCap * k.maxLv;
          return Object.entries(gom).map(([k, v]) => [k, '+' + pc(v, 1)]);
        })()],
      ['p', 'Minh Hội Các bán <b>' + n(CUA_HANG_BANG) + ' món</b> đổi bằng Công Tích, hạn lượt theo ngày, mở khoá dần theo cấp minh.'],
    ],
  },
  {
    id: 'tienminh_vu', nhom: 'tienminh', ten: 'Minh Vụ & Truy Nã',
    tom: sn(n(NV_BANG)) + ' loại minh vụ · ' + sn(TRUY_NA_MOI_NGAY) + ' lệnh truy nã mỗi ngày.',
    khoi: [
      ['bang', ['Hoạt động', 'Phạm vi', 'Chu kỳ'], [
        ['Minh Vụ', 'Cả minh cùng góp, chỉ tiêu co giãn theo số thành viên', 'Theo kỳ'],
        ['Truy Nã', 'Cá nhân, mục tiêu chọn theo cấp người chơi', sn(TRUY_NA_MOI_NGAY) + ' lệnh mỗi ngày, đủ bốn bậc'],
      ]],
      ['luu', 'Truy Nã chụp mốc số quái đã hạ tại thời điểm <b>nhận lệnh</b>. Quái hạ trước khi nhận không được tính.'],
    ],
  },
  {
    id: 'tienminh_cp', nhom: 'tienminh', ten: 'Chinh Phạt & Mùa',
    tom: 'Mùa ' + sn(MUA_NGAY) + ' ngày; hạng vùng cho buff nghề.',
    khoi: [
      ['ct', 'Điểm Chinh Phạt = ' + sn(CP_MOI_KILL) + ' điểm mỗi lần hạ quái, ghi cho vùng đang đứng'],
      ['bang', ['Hạng trong vùng', 'Cả minh được'],
        CP_BUFF_HANG.map((v, i) => ['Hạng ' + (i + 1), '+' + pc(v) + ' tốc độ Nghề Khai Thác tại vùng đó'])],
      ['h', 'Kết mùa'],
      ['bang', ['Hạng tổng', 'Hồn Thạch'],
        MUA_THUONG_BANG.map((v, i) => ['Hạng ' + (i + 1), sn(v)])],
      ['p', 'Một mùa dài <b>' + sn(MUA_NGAY) + ' ngày</b>. Cả ' + n(LOCATIONS) + ' vùng đều tranh được.'],
    ],
  },
  {
    id: 'tienminh_boss', nhom: 'tienminh', ten: 'Trảm Yêu Đài',
    tom: BOSS_BANG_LUOT + ' lượt mỗi người mỗi kỳ.',
    khoi: [
      ['p', 'Sau khi xây Trảm Yêu Đài, mỗi kỳ minh triệu về một trùm riêng. Cả minh cùng gây sát thương.'],
      ['bang', ['Mục', 'Giá trị'], [
        ['Lượt mỗi người mỗi kỳ', sn(BOSS_BANG_LUOT)],
        ['Cấp đài', 'Quyết định độ mạnh của trùm và mức thưởng'],
        ['Chia thưởng', 'Theo phần sát thương đã đóng góp'],
      ]],
      ['luu', 'Trùm này tách hoàn toàn khỏi Yêu Vương thế giới: không dùng chung lượt, không dùng chung thời gian hồi.'],
    ],
  },

  // ================= GIANG HỒ =================
  {
    id: 'bando', nhom: 'giangho', ten: 'Bản Đồ & Di Chuyển',
    tom: sn(n(LOCATIONS)) + ' vùng.',
    khoi: [
      ['bang', ['Vùng', 'Cấp cần', 'Số loại quái'],
        LOCATIONS.map((l) => [l.name, 'Lv ' + l.reqLevel, sn((l.enemies || []).length)])],
      ['ct', 'Phí Truyền Tống = Tổng Lv × khoảng cách  (Bạc)'],
      ['p', 'Đi bộ mất thời gian thực theo khoảng cách. Truyền Tống đến ngay nhưng tốn Bạc. Vùng khoá cần đủ cấp mới vào.'],
    ],
  },
  {
    id: 'nhiemvu', nhom: 'giangho', ten: 'Nhiệm Vụ',
    tom: 'Bốn nhóm theo chu kỳ.',
    khoi: [
      ['bang', ['Nhóm', 'Số việc', 'Làm mới', 'Thưởng'], [
        ['Tân Thủ', sn(n(TUTORIAL_QUESTS)), 'một lần', 'Bạc'],
        ['Hằng ngày', sn(n(DAILY_QUESTS)), 'mỗi ngày', 'Bạc'],
        ['Hằng tuần', sn(n(WEEKLY_QUESTS)), 'mỗi tuần', 'Bạc, Hồn Thạch'],
        ['Hằng tháng', sn(n(MONTHLY_QUESTS)), 'mỗi tháng', 'Bạc, Hồn Thạch, Nguyên Bảo'],
      ]],
      ['p', 'Việc được chọn theo cấp người chơi; chỉ tiêu và thưởng co giãn theo đó.'],
    ],
  },
  {
    id: 'phicap', nhom: 'giangho', ten: 'Phi Cáp Đài',
    tom: 'Trung tâm thông báo.',
    khoi: [
      ['p', 'Gom mọi sự kiện xảy ra khi người chơi vắng mặt: hoạt động hoàn tất, vật phẩm hiếm, đệ tử phá cảnh, tin Tiên Minh, sự kiện giang hồ.'],
      ['p', 'Thông báo có thưởng lĩnh trực tiếp tại chỗ. Chấm xanh trên chuông báo còn tin chưa đọc.'],
    ],
  },
  {
    id: 'phongvan', nhom: 'giangho', ten: 'Phong Vân Bảng',
    tom: 'Bảng xếp hạng toàn giang hồ.',
    khoi: [
      ['p', 'Xếp hạng theo Tổng Lv, theo từng nghề, và theo Chiến Lực.'],
      ['p', 'Giang hồ có sẵn một lứa cao thủ mô phỏng: họ lên cấp, đổi hoạt động và đổi vùng theo thời gian thực, nên thứ hạng thay đổi liên tục.'],
    ],
  },
  {
    id: 'danhsi', nhom: 'giangho', ten: 'Danh Sĩ',
    tom: sn(n(DANH_SI)) + ' nhân vật có tiểu sử và quan hệ.',
    khoi: [
      ['p', '<b>' + n(DANH_SI) + ' Danh Sĩ</b> là lớp nhân vật mô phỏng sâu nhất: mỗi người có xuất thân, môn phái, mạch đời, tâm trạng và quan hệ với nhau.'],
      ['bang', ['Tương tác', 'Nơi'], [
        ['Xem hồ sơ', 'Trang Danh Sĩ'],
        ['Tỷ thí cờ', 'Hồ sơ Danh Sĩ'],
        ['Mời rượu, hỏi chuyện', 'Tửu Lâu'],
        ['Mời vào Tiên Minh', 'Tab Chiêu Mộ, cần đủ Giao Tình'],
      ]],
    ],
  },
  {
    id: 'tuulau', nhom: 'giangho', ten: 'Tửu Lâu',
    tom: 'Khách đổi theo phiên; không cho chỉ số.',
    khoi: [
      ['bang', ['Hành động', 'Chi phí', 'Kết quả'], [
        ['Mời Rượu', 'Bạc', 'Lời thoại và tin đồn'],
        ['Hỏi Chuyện', 'Miễn phí', 'Lời thoại; mỗi khách có thời gian chờ'],
        ['Góp Chuyện', 'Miễn phí', 'Thêm một dòng vào bảng tin'],
      ]],
      ['p', 'Khách mỗi phiên gồm một số Danh Sĩ và một số cao thủ giang hồ, đổi khi sang phiên mới.'],
      ['luu', 'Tửu Lâu không cấp chỉ số hay vật phẩm. Đây là nơi kết giao và thu tin.'],
    ],
  },
  {
    id: 'thuongdiem', nhom: 'giangho', ten: 'Thương Điếm',
    tom: 'Mua nguyên liệu cơ bản, bán đồ thừa.',
    khoi: [
      ['p', 'Bán nguyên liệu cơ bản, mồi câu, món ăn, và vật phẩm trang trí như ảnh đại diện và ảnh nền hồ sơ.'],
      ['p', 'Giá bán lại phụ thuộc phẩm chất và cấp món. Sàn Giao Dịch giữa người chơi đang phát triển.'],
    ],
  },

  // ================= SƯU TẬP & KHÁC =================
  {
    id: 'vanvat', nhom: 'suutap', ten: 'Vạn Vật Phổ',
    tom: sn(n(CODEX_CATS)) + ' phổ sưu tập.',
    khoi: [
      ['p', 'Gặp một thực thể lần đầu sẽ tự ghi vào phổ tương ứng. Phổ cộng chỉ số theo hai mức: cộng lẻ theo số lượng, và cộng khi đủ bộ.'],
      ['bang', ['Phổ', 'Đếm theo', 'Số mục', 'Đủ bộ'],
        CODEX_CATS.map((c) => [c.name, c.unit || '—', sn(c.total || (c.entries || []).length), (c.set || {}).label || '—'])],
    ],
  },
  {
    id: 'danhhieu', nhom: 'suutap', ten: 'Danh Hiệu',
    tom: sn(n(TITLES)) + ' danh hiệu, ' + sn(n(TITLE_LOAI)) + ' loại.',
    khoi: [
      ['p', 'Danh hiệu mở khi đạt mốc điều kiện. Đeo một danh hiệu vừa hiển thị cạnh tên vừa cộng chỉ số thật.'],
      ['bang', ['Loại', 'Số danh hiệu'],
        Object.entries(TITLE_LOAI).map(([k, v]) => [v, sn(TITLES.filter((t) => t.loai === k).length)])],
      ['p', 'Điều kiện và mức cộng của từng danh hiệu ghi ở bảng <b>Danh Hiệu</b> trong Tra Cứu.'],
    ],
  },
  {
    id: 'huyhieu', nhom: 'suutap', ten: 'Huy Hiệu',
    tom: sn(n(BADGES)) + ' huy hiệu, mốc cấp ' + BADGE_LV + '.',
    khoi: [
      ['p', 'Mỗi nghề đạt <b>cấp ' + BADGE_LV + '</b> cấp một huy hiệu. Đủ bộ <b>' + n(BADGES) + ' huy hiệu</b> tương ứng cày trọn mọi nghề.'],
      ['p', 'Danh sách ở bảng <b>Huy Hiệu</b> trong Tra Cứu.'],
    ],
  },
  {
    id: 'diemdanh', nhom: 'suutap', ten: 'Điểm Danh',
    tom: sn(n(LOGIN_REWARDS)) + ' mốc theo chuỗi ngày.',
    khoi: [
      ['p', 'Điểm danh tính theo chuỗi ngày vào chơi liên tiếp, có <b>' + n(LOGIN_REWARDS) + ' mốc thưởng</b>.'],
      ['p', 'Một số mốc cấp buff cộng kinh nghiệm mọi nguồn trong một khoảng thời gian.'],
      ['luu', 'Đứt chuỗi thì chuỗi tính lại từ đầu.'],
    ],
  },
  {
    id: 'thiencoc', nhom: 'suutap', ten: 'Thiên Cơ Các',
    tom: 'Tám trò nhỏ, cách ly khỏi kinh tế chính.',
    khoi: [
      ['bang', ['Trò', 'Thể loại', 'Quy mô'], [
        ['Đăng Tiên Mộng', 'Thẻ bài leo tầng', '20 tầng, 5 thủ lĩnh, có di vật'],
        ['Kỳ Trận Trảm Yêu', 'Xếp ba ô đánh quái', 'Có meta Cửu Cung, cap theo tuần'],
        ['Ngũ Tử Kỳ', 'Cờ caro bàn 3D', 'Đấu Danh Sĩ, có khẩu chiến'],
        ['Cờ Tướng', 'Cờ tướng bàn 3D', 'Máy đánh bằng thuật toán riêng'],
        ['Cờ Vua', 'Cờ vua bàn 3D', 'Máy đánh bằng thuật toán riêng'],
        ['Tiến Lên Miền Nam', 'Đánh bài bàn 3D', 'Ba máy đối thủ, đánh theo lượt, cược Trù Mã'],
        ['Binh Xập Xám', 'Xếp bài bàn 3D', 'Bốn nhà, mỗi nhà xếp 13 lá thành ba chi, cược Trù Mã'],
        ['Tiến Lên Trung Quốc', 'Đánh bài bàn 3D', 'Ba nhà, bộ 48 lá, cược Trù Mã'],
      ]],
      ['p', 'Cờ Tướng và Ngũ Tử Kỳ dùng chung điểm Kỳ Hồn và danh hiệu Kỳ Nghệ.'],
      ['h', 'Toàn Màn Hình'],
      ['p', 'Sáu bàn 3D đều có nút <b>Toàn Màn Hình</b> ở cột nút bên bàn: bàn phủ kín màn hình, không còn thanh đầu trang hay danh mục. Trên điện thoại, máy tự xoay ngang. Bấm lại — hoặc phím Esc — để thu về.'],
      ['h', 'Trù Mã — đồng riêng của chiếu bài'],
      ['p', 'Ba trò bài — Tiến Lên, Tiến Lên Trung Quốc và Binh Xập Xám — cược bằng <b>Trù Mã</b>, không phải Bạc. Đổi Bạc lấy Trù Mã theo tỉ giá <b>1 đổi 1</b>, và chỉ đổi được một chiều.'],
      ['luu', 'Trù Mã <b>không đổi ngược lại thành Bạc</b>. Nhờ vậy thắng bài không sinh ra Bạc — các trò này cách ly khỏi kinh tế chính, không ảnh hưởng cân bằng cày cuốc.'],
    ],
  },
];

/** Gộp toàn bộ chữ của một mục thành một chuỗi — để tìm kiếm. */
export function cnText(m) {
  const ra = [m.ten, m.tom];
  for (const k of m.khoi) {
    if (k[0] === 'p' || k[0] === 'h' || k[0] === 'luu' || k[0] === 'ct') ra.push(k[1]);
    else if (k[0] === 'ds') ra.push(k[1].join(' '));
    else if (k[0] === 'bang') { ra.push(k[1].join(' ')); k[2].forEach((r) => ra.push(r.join(' '))); }
  }
  return ra.join(' ').replace(/<[^>]+>/g, '').toLowerCase();
}

export const CN_MUC_BY_ID = Object.fromEntries(CN_MUC.map((m) => [m.id, m]));
