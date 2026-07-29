// ============================================================
// DATA — CẨM NANG (wiki trong game). Giải thích MỌI tính năng.
//
// ⚠ MỌI CON SỐ ĐỀU RÚT TỪ BẢNG SỐ THẬT, không chép tay. Sửa bảng số ->
//   Cẩm Nang tự đổi theo. Chép tay là kiểu gì cũng lệch sau vài lần tune.
//
// Khối nội dung (mảng `khoi`), mỗi phần tử là một mảng:
//   ['h',  'Tiêu đề nhỏ']
//   ['p',  'Đoạn văn — nhận <b> <i>']
//   ['ds', ['gạch đầu dòng', ...]]
//   ['bang', ['Cột 1','Cột 2'], [['ô','ô'], ...]]
//   ['luu', 'Khung lưu ý màu hổ phách — chỉ dùng cho cái dễ mất tiền/mất đồ']
// ============================================================
import { SKILLS, STATS } from './skills.js';
import { LOCATIONS, REALM_TIERS } from './locations.js';
import { QUALITY, ITEM_TYPES, ITEMS, DOPHO_IDS, EGG_IDS } from './items.js';
import { EQUIP_SLOTS, TOOL_SLOTS, SECONDARY_STATS } from './ui.js';
import { AFFIX_KEYS, TRANG_SET_KEYS, BACH_KIM_SETS, GEAR_IDS, THOI_TIERS, MONSTER_DROP_CHANCE, MANH_DROP_CHANCE, MANH_DROP_MIN_LV } from './gear.js';
import {
  NGU_HANH_LIST, HE_FX, KHANG_CAP, KHANG_TU_HE, NGAT_AMP, TANG_MAX, TANG_HARD_MAX,
  TANG_GEAR_MAX, TANG_OVER_STEP, COMBAT_CYCLE_MS, TANG_BANDS, TAM_PHAP_POOL, BO_PHAP,
  CHIEU, BI_DONG, TUYET_IDS, TUYET_BAC, MON_PHAI, nguHanhMod,
} from './votong.js';
import { STANCES, YEU_VUONG, BAC_DROP_CHANCE, BAC_PER_EXP, ENEMIES } from './combat.js';
import { DUNGEONS } from './dungeon.js';
import { PET_SPECIES, PET_QUALITY, AWK_PASSIVE_IDS, PET_OPT_POOL, PET_SKILLS } from './pets.js';
import { CODEX_CATS } from './codex.js';
import { TITLES, TITLE_LOAI } from './titles.js';
import { BADGES, BADGE_LV } from './badges.js';
import { REALMS, BUILD_KEYS, PILL_KEYS, BI_KIP, BI_KIP_LOAI, APT, DIPLO_TIERS, TAMMA_MAX, SUB_STAGES } from './tongmon.js';
import { CONG_TRINH, KY_NANG_BANG, CUA_HANG_BANG, NV_BANG, TV_TRAN, CAP_BANG_MAX, BAC_MOI_MINH_CONG, CP_BUFF_HANG, MUA_THUONG_BANG, BOSS_BANG_LUOT } from './bangphai.js';
import { DAILY_QUESTS, WEEKLY_QUESTS, MONTHLY_QUESTS, TUTORIAL_QUESTS } from './quests.js';
import { LOGIN_REWARDS } from './daily.js';
import { DANH_SI } from './danhsi.js';
import { DAMDAO } from './damdao.js';
import { LINH_THACH } from './linhthach.js';

// ---------- số rút từ bảng thật ----------
const n = (x) => (Array.isArray(x) ? x.length : Object.keys(x).length);
const pc = (x) => Math.round(x * 100) + '%';
const KHAC_LOI = pc(nguHanhMod('kim', 'moc'));            // đánh vào hệ mình khắc
const KHAC_THIET = pc(Math.abs(nguHanhMod('moc', 'kim'))); // đánh vào hệ khắc mình
const NHIP = (COMBAT_CYCLE_MS / 1000) + ' giây';
const HE5 = NGU_HANH_LIST.map((h) => h.name).join(' · ');
const VUNG_DAU = LOCATIONS[0].name;
const VUNG_CUOI = LOCATIONS[LOCATIONS.length - 1].name;

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
    id: 'tongquan', nhom: 'nhapmon', ten: 'Trò Chơi Này Là Gì',
    tom: 'Nhàn tu — đặt việc rồi đi, quay lại lấy thành quả.',
    khoi: [
      ['p', 'Tiêu Dao Lục là trò <b>nhàn tu</b> (idle): ngươi chọn một việc — đốn củi, luyện đan, đi săn — rồi để đó. Việc vẫn chạy khi ngươi đóng trình duyệt, lúc quay lại thu về đủ.'],
      ['p', 'Không có lớp nhân vật cố định. Mọi hướng đều mở: cày nghề, đánh quái, nuôi đệ tử, dựng bang, chơi cờ. Ngươi mạnh theo hướng nào là do ngươi dồn thời gian vào đâu.'],
      ['h', 'Ba trục lớn'],
      ['bang', ['Trục', 'Làm gì', 'Được gì'], [
        ['Nghề', 'Thu hoạch · chế tạo', 'Nguyên liệu · Bạc · cấp nghề'],
        ['Võ', 'Đánh quái · Bí Cảnh · Yêu Vương', 'Cấp chiến đấu · trang bị · Hồn Thạch'],
        ['Thế lực', 'Tông Môn · Tiên Minh', 'Đệ tử, bang chúng làm hộ · buff cả nhà'],
      ]],
      ['p', 'Ba trục nuôi nhau: nghề rèn ra trang bị cho võ, võ mở vùng mới cho nghề, thế lực cộng phần trăm cho cả hai.'],
    ],
  },
  {
    id: 'treomay', nhom: 'nhapmon', ten: 'Treo Máy & Ngoại Tuyến',
    tom: 'Việc chạy tiếp khi tắt game. Chỉ một việc một lúc.',
    khoi: [
      ['p', 'Mỗi lúc ngươi chỉ làm <b>một việc</b>. Đổi việc là bỏ việc cũ. Việc đang làm hiện ở thanh trên cùng.'],
      ['ds', [
        'Đóng trình duyệt vẫn tính — lúc mở lại, trò chơi cộng bù phần thời gian vắng.',
        'Ngồi xem hay tắt máy đều ra <b>cùng một số</b>. Không có kiểu ngồi canh thì được nhiều hơn.',
        'Chiến đấu chạy theo nhịp <b>' + NHIP + '</b> một vòng; mỗi vòng kết một trận.',
      ]],
      ['luu', 'Túi đầy thì thu hoạch <b>dừng</b>, không tự bán. Đi xa nhớ dọn Hành Lý trước.'],
    ],
  },
  {
    id: 'tiente', nhom: 'nhapmon', ten: 'Ba Loại Tiền',
    tom: 'Bạc tiêu vặt · Hồn Thạch quý · Nguyên Bảo hiếm nhất.',
    khoi: [
      ['bang', ['Loại', 'Kiếm ở đâu', 'Tiêu vào đâu'], [
        ['Bạc', 'Bán đồ · đánh quái (' + pc(BAC_DROP_CHANCE) + ' số trận) · nhiệm vụ', 'Mua bán · cường hoá · lộ phí · xây dựng'],
        ['Hồn Thạch', 'Yêu Vương · Bí Cảnh · nhiệm vụ tuần/tháng · mùa Chinh Phạt', 'Đổi vật phẩm quý · mở khoá'],
        ['Nguyên Bảo', 'Nhiệm vụ tháng · mốc lớn', 'Thứ hiếm nhất, đừng tiêu bừa'],
      ]],
      ['p', 'Đánh quái còn ra Bạc theo kinh nghiệm: <b>' + BAC_PER_EXP + ' Bạc</b> mỗi điểm kinh nghiệm.'],
      ['luu', 'Trò chơi <b>không bán vật phẩm bằng tiền thật</b>. Mọi thứ đều kiếm được trong game.'],
    ],
  },
  {
    id: 'capdo', nhom: 'nhapmon', ten: 'Cấp Độ & Cảnh Giới',
    tom: 'Mỗi nghề một cấp riêng. Tổng Lv là tổng tất cả.',
    khoi: [
      ['p', 'Không có một cấp chung. <b>Mỗi nghề một cấp riêng</b> (tối đa 100), cộng thêm cấp Chiến Đấu. Cộng hết lại thành <b>Tổng Lv</b> — con số hiện dưới tên ngươi.'],
      ['p', 'Tổng Lv là thước đo chung: mở vùng, mở nghề mới (mỗi 80 Tổng Lv mở thêm một nghề), tính lộ phí Truyền Tống, và là điều kiện lập Tiên Minh.'],
      ['h', 'Bốn cảnh giới theo cấp'],
      ['bang', ['Cảnh giới', 'Khoảng cấp'], REALM_TIERS.map((r) => [r.name, r.range])],
      ['p', 'Cảnh giới đổi màu khung, đổi nền hồ sơ, và là mốc cho một số danh hiệu.'],
    ],
  },
  {
    id: 'luutru', nhom: 'nhapmon', ten: 'Lưu Trữ & Tài Khoản',
    tom: 'Tự lưu trong máy; đăng nhập thì có thêm bản trên mây.',
    khoi: [
      ['ds', [
        'Trò chơi <b>tự lưu</b> vào trình duyệt sau mỗi thay đổi lớn.',
        'Đăng nhập tài khoản thì có thêm <b>bản lưu trên mây</b> — đổi máy vẫn chơi tiếp.',
        'Xoá dữ liệu trình duyệt là mất bản trong máy. Đăng nhập trước cho chắc.',
      ]],
      ['p', 'Cài đặt (bánh răng cạnh thẻ nhân vật) có chỗ tải bản lưu xuống và nạp lại.'],
    ],
  },

  // ================= NHÂN VẬT =================
  {
    id: 'tutru', nhom: 'nhanvat', ten: 'Tứ Trụ & Chỉ Số',
    tom: 'Bốn trụ gốc sinh ra mọi chỉ số chiến đấu.',
    khoi: [
      ['bang', ['Trụ', 'Nghĩa'], Object.values(STATS).map((s) => [s.name, s.gloss])],
      ['p', 'Bốn trụ này lên theo cấp và theo trang bị, rồi sinh ra các chỉ số chiến đấu:'],
      ['bang', ['Chỉ số', 'Nghĩa'], SECONDARY_STATS.map((s) => [s.name, s.desc])],
      ['p', '<b>Chiến Lực</b> gộp tất cả thành một số để so nhanh — dùng để ước lượng, không phải công thức sát thương.'],
    ],
  },
  {
    id: 'trangbi', nhom: 'nhanvat', ten: 'Trang Bị',
    tom: n(EQUIP_SLOTS) + ' ô chính, mỗi ô một vai riêng.',
    khoi: [
      ['p', 'Có <b>' + n(EQUIP_SLOTS) + ' ô trang bị chính</b>: ' + EQUIP_SLOTS.map((s) => s.name).join(' · ') + '.'],
      ['h', 'Phân vai ô — đừng mong ô nào cũng cộng công'],
      ['ds', [
        '<b>Vũ Khí · Nhẫn · Trang Sức</b> — ba ô mang Công Kích.',
        '<b>Mũ · Giáp · Đai Lưng</b> — thiên phòng ngự và Sinh Lực.',
        '<b>Găng · Giày · Tọa Kỵ</b> — thiên Né Tránh, Chính Xác, tốc độ.',
      ]],
      ['p', 'Mỗi món có <b>phẩm chất</b> quyết định số dòng phụ. Bảy bậc, từ thấp lên cao:'],
      ['bang', ['Phẩm chất'], Object.values(QUALITY).map((q) => [q.name])],
      ['p', 'Kho trang bị hiện có <b>' + n(GEAR_IDS) + ' món</b> mẫu; món rơi ra là <i>bản riêng</i> — cùng tên nhưng chỉ số mỗi cái một khác.'],
    ],
  },
  {
    id: 'dongan', nhom: 'nhanvat', ten: 'Dòng Phụ & Cường Hoá',
    tom: n(AFFIX_KEYS) + ' loại dòng phụ; cường hoá bằng Bạc và thỏi.',
    khoi: [
      ['p', 'Món càng cao phẩm càng nhiều <b>dòng phụ</b> — bốc ngẫu nhiên từ <b>' + n(AFFIX_KEYS) + ' loại</b> (bạo kích, hút máu, kháng ngũ hành, tốc độ nghề…). Cùng một cái áo, hai người nhặt được hai bộ dòng khác nhau.'],
      ['p', 'Ô nào bốc dòng nào là có luật riêng: vũ khí mới ra hút máu, giày mới ra Né Tránh. Xem chi tiết ngay trong khung thông tin của món.'],
      ['h', 'Cường hoá'],
      ['ds', [
        'Tốn <b>Bạc</b> và <b>thỏi kim loại</b> đúng bậc — có <b>' + n(THOI_TIERS) + ' bậc thỏi</b>, chọn theo cấp món.',
        'Cường hoá càng cao càng dễ hụt. Hụt thì <b>không mất món</b>, chỉ mất phí.',
      ]],
      ['h', 'Món rơi từ quái'],
      ['ds', [
        'Quái thường rơi trang bị nguyên món với xác suất <b>' + (MONSTER_DROP_CHANCE * 100).toFixed(2) + '%</b>.',
        'Từ cấp <b>' + MANH_DROP_MIN_LV + '</b> trở lên mới rơi mảnh ghép hàng đỉnh, xác suất <b>' + (MANH_DROP_CHANCE * 100).toFixed(2) + '%</b>.',
      ]],
    ],
  },
  {
    id: 'botrang', nhom: 'nhanvat', ten: 'Bộ Trang',
    tom: 'Mặc đủ 3 / 5 / 7 món cùng bộ thì mở dòng ẩn.',
    khoi: [
      ['p', 'Có <b>' + n(TRANG_SET_KEYS) + ' bộ trang</b> thường và <b>' + n(BACH_KIM_SETS) + ' bộ Bạch Kim</b> hàng đỉnh. Mặc đủ số món cùng một bộ thì mở <b>dòng ẩn</b> — mốc 3, 5 và 7 món.'],
      ['ds', [
        'Dòng ẩn cộng thẳng vào chỉ số, không cần kích hoạt.',
        'Mốc sau bao gồm mốc trước: đủ 7 món thì ăn cả ba mốc.',
        'Tab <b>Bách Trang Các</b> trong Vạn Vật Phổ ghi đủ món của từng bộ và chỗ kiếm.',
      ]],
    ],
  },
  {
    id: 'congcu', nhom: 'nhanvat', ten: 'Công Cụ Làm Nghề',
    tom: n(TOOL_SLOTS) + ' ô công cụ — quyết định tốc độ thu hoạch.',
    khoi: [
      ['p', 'Ngoài trang bị chiến đấu còn <b>' + n(TOOL_SLOTS) + ' ô công cụ</b>: ' + TOOL_SLOTS.map((s) => s.name).join(' · ') + '.'],
      ['p', 'Công cụ <b>không đánh nhau</b> — chúng rút ngắn thời gian mỗi lần thu hoạch. Công cụ bậc càng cao càng nhanh.'],
      ['p', 'Công cụ kiếm được bằng nghề Rèn Đúc, mua ở Thương Điếm, hoặc rơi trong Bí Cảnh.'],
    ],
  },
  {
    id: 'hanhly', nhom: 'nhanvat', ten: 'Hành Lý',
    tom: n(ITEM_TYPES) + ' loại vật phẩm, lọc theo nhóm.',
    khoi: [
      ['p', 'Hành Lý chia <b>' + n(ITEM_TYPES) + ' loại</b>: ' + Object.values(ITEM_TYPES).map((t) => t.name || t).join(' · ') + '.'],
      ['p', 'Trò chơi có <b>' + n(ITEMS) + ' vật phẩm</b>, trong đó <b>' + n(DOPHO_IDS) + ' đồ phổ</b> (công thức chế tạo) và <b>' + n(EGG_IDS) + ' trứng linh thú</b>.'],
      ['ds', [
        'Bấm một món để xem chi tiết, dùng, hoặc bán.',
        'Món xếp chồng theo id — cùng tên thì gộp một ô, trừ trang bị (mỗi món một bản riêng).',
      ]],
      ['luu', 'Túi đầy thì mọi việc thu hoạch <b>dừng lại</b>.'],
    ],
  },
  {
    id: 'dongphu', nhom: 'nhanvat', ten: 'Động Phủ',
    tom: 'Nhà riêng — nới trần treo máy và mở tiện ích.',
    khoi: [
      ['p', 'Động Phủ là nhà riêng của ngươi. Hai việc chính:'],
      ['ds', [
        '<b>Nới trần treo máy</b> — nhà càng cao cấp thì lần vắng mặt càng được tính bù nhiều giờ hơn.',
        '<b>Mở công trình tiện ích</b> — mỗi công trình một tác dụng riêng, xây bằng Bạc và nguyên liệu, mất thời gian thực.',
      ]],
      ['p', 'Công trình có <b>độ bền</b>: để lâu không sửa thì hỏng dần và ngừng tác dụng. Sửa tốn ít hơn xây mới nhiều.'],
      ['p', 'Động Phủ cũng là cửa vào mấy trò nhỏ trong Thiên Cơ Các.'],
    ],
  },

  // ================= NGHỀ =================
  {
    id: 'muoinghe', nhom: 'nghe', ten: 'Mười Nghề',
    tom: n(SKILLS) + ' nghề — nửa thu hoạch, nửa chế tạo.',
    khoi: [
      ['bang', ['Nghề', 'Việc'], Object.values(SKILLS).map((s) => [s.name, s.gloss || ''])],
      ['p', 'Mỗi nghề có cấp riêng (tối đa 100) và kinh nghiệm riêng. Cấp nghề cao thì mở nguyên liệu tốt hơn, làm nhanh hơn, và cộng vào Tổng Lv.'],
      ['p', 'Mở nghề mới cần <b>Tổng Lv</b> đủ và một khoản Bạc — mỗi 80 Tổng Lv mở thêm một nghề, giá tăng dần.'],
    ],
  },
  {
    id: 'thuhoach', nhom: 'nghe', ten: 'Thu Hoạch & Chế Tạo',
    tom: 'Nghề thu ra nguyên liệu, nghề chế biến chúng thành đồ.',
    khoi: [
      ['h', 'Nghề thu hoạch'],
      ['p', 'Chọn một nguyên liệu trong vùng đang đứng rồi để đó. Mỗi lần xong được nguyên liệu và kinh nghiệm nghề. Cần công cụ đúng loại mới nhanh.'],
      ['h', 'Nghề chế tạo'],
      ['p', 'Cần <b>đồ phổ</b> (công thức) và đủ nguyên liệu. Có <b>' + n(DOPHO_IDS) + ' đồ phổ</b> trong trò chơi — mua, rơi từ quái, hoặc thưởng nhiệm vụ.'],
      ['luu', 'Nguyên liệu cấp cao chỉ có ở vùng cấp cao. Muốn đồ xịn thì phải đủ sức đứng ở vùng đó.'],
    ],
  },
  {
    id: 'linhthach', nhom: 'nghe', ten: 'Linh Thạch',
    tom: n(LINH_THACH) + ' loại đá phụ trợ, cắm vào để làm nghề nhanh hơn.',
    khoi: [
      ['p', 'Linh Thạch là đá phụ trợ dùng khi làm nghề — có <b>' + n(LINH_THACH) + ' loại</b>, chia ba nhánh (tụ khí, thời vận, bội sản) và ba bậc Sơ · Trung · Thượng.'],
      ['ds', [
        'Kích hoạt xong thì có tác dụng trong một khoảng thời gian rồi hết.',
        'Mỗi nhánh hợp một kiểu nghề khác nhau — xem mô tả từng viên.',
      ]],
    ],
  },
  {
    id: 'damdao', nhom: 'nghe', ten: 'Đàm Đạo',
    tom: 'Mỗi nghề có một bậc thầy để trò chuyện.',
    khoi: [
      ['p', '<b>' + n(DAMDAO) + ' nghề</b> đều có một bậc thầy riêng. Trò chuyện với họ mở dần mạch truyện của nghề đó.'],
      ['p', 'Cửa vào nằm ngay trang của nghề. Chuyện mở theo cấp nghề — cấp càng cao càng nghe được nhiều.'],
    ],
  },

  // ================= CHIẾN ĐẤU =================
  {
    id: 'vongdau', nhom: 'chiendau', ten: 'Vòng Đấu Diễn Ra Sao',
    tom: 'Mỗi ' + NHIP + ' một trận, tự đánh.',
    khoi: [
      ['p', 'Chọn một con quái trong vùng rồi để đó. Cứ <b>' + NHIP + '</b> là xong một trận. Thắng thì được kinh nghiệm, Bạc, và có thể rơi đồ.'],
      ['p', 'Trận đấu tự diễn: nhân vật ra chiêu theo bộ chiêu ngươi đã xếp, tốn Nội Lực, chờ hồi chiêu. Ngươi không bấm gì trong trận — mọi quyết định nằm ở lúc chuẩn bị.'],
      ['h', 'Thế đứng'],
      ['bang', ['Thế', 'Thiên về'], STANCES.map((s) => [s.name, s.gloss])],
      ['p', 'Trò chơi có <b>' + n(ENEMIES) + ' loại quái</b> rải khắp <b>' + n(LOCATIONS) + ' vùng</b>, từ ' + VUNG_DAU + ' tới ' + VUNG_CUOI + '.'],
    ],
  },
  {
    id: 'nguhanh', nhom: 'chiendau', ten: 'Ngũ Hành Khắc Chế',
    tom: 'Đánh trúng hệ mình khắc: +' + KHAC_LOI + '. Bị khắc: −' + KHAC_THIET + '.',
    khoi: [
      ['p', 'Năm hệ: <b>' + HE5 + '</b>. Ngoài ra còn <b>Vô Hệ</b> — đòn không thuộc hệ nào, không được lợi cũng không bị thiệt.'],
      ['bang', ['Tình huống', 'Sát thương'], [
        ['Đánh vào hệ mình khắc', '+' + KHAC_LOI],
        ['Đánh vào hệ khắc mình', '−' + KHAC_THIET],
        ['Cùng hệ hoặc Vô Hệ', 'không đổi'],
      ]],
      ['p', 'Vòng khắc: Kim khắc Mộc · Mộc khắc Thổ · Thổ khắc Thủy · Thủy khắc Hỏa · Hỏa khắc Kim.'],
      ['luu', 'Đừng dồn hết bộ chiêu vào một hệ. Gặp đúng con khắc mình là mất <b>' + KHAC_THIET + '</b> sát thương suốt trận.'],
    ],
  },
  {
    id: 'khang', nhom: 'chiendau', ten: 'Kháng Ngũ Hành',
    tom: 'Trần kháng ' + pc(KHANG_CAP) + '. Tâm Pháp cho sẵn ' + pc(KHANG_TU_HE) + ' kháng hệ mình.',
    khoi: [
      ['p', 'Mỗi hệ có một chỉ số kháng riêng. Kháng <b>giảm thẳng</b> sát thương của hệ đó đánh vào ngươi.'],
      ['ds', [
        'Trần kháng <b>' + pc(KHANG_CAP) + '</b> — cộng thêm nữa cũng không ăn.',
        'Tâm Pháp cho sẵn <b>' + pc(KHANG_TU_HE) + '</b> kháng đúng hệ của nó.',
        'Kháng còn đến từ dòng phụ trang bị, bộ trang, đan dược.',
      ]],
      ['p', 'Quái cũng có kháng. Con nào kháng cao hệ nào thì đánh hệ đó vào rất phí.'],
    ],
  },
  {
    id: 'hieuung', nhom: 'chiendau', ten: 'Hiệu Ứng Theo Hệ',
    tom: 'Mỗi hệ gây một hiệu ứng khác nhau khi trúng đòn.',
    khoi: [
      ['bang', ['Hệ', 'Hiệu ứng', 'Tỉ lệ', 'Kéo dài'],
        Object.entries(HE_FX).map(([he, f]) => {
          const ten = (NGU_HANH_LIST.find((x) => x.id === he) || {}).name || he;
          return [ten, f.ten, pc(f.pct), f.ticks + ' nhịp'];
        })],
      ['p', '<b>Độc</b> và <b>Bỏng</b> còn gặm máu mỗi nhịp. <b>Chậm</b> kéo lùi lượt ra đòn. <b>Choáng</b> và <b>Ngất</b> bỏ hẳn lượt.'],
      ['p', 'Đòn đánh vào mục tiêu <b>đang Ngất</b> mạnh thêm <b>' + pc(NGAT_AMP) + '</b> — đây là chỗ để dồn sát chiêu.'],
    ],
  },
  {
    id: 'vohoc', nhom: 'chiendau', ten: 'Võ Học: Bốn Thứ Phải Xếp',
    tom: 'Tâm Pháp · Chiêu Thức · Bộ Pháp · Bị Động.',
    khoi: [
      ['p', 'Tất cả nằm ở <b>Tàng Kinh Các</b> — nơi học, xếp ô, và luyện tầng.'],
      ['h', 'Tâm Pháp — ' + n(TAM_PHAP_POOL) + ' bộ, đổi được'],
      ['p', 'Tâm Pháp định hệ chính, Nội Lực, và cộng một nhóm chỉ số. Đây là quyết định lớn nhất — đổi Tâm Pháp là đổi cả lối đánh.'],
      ['bang', ['Tâm Pháp', 'Lối'], TAM_PHAP_POOL.map((t) => [t.name, t.short])],
      ['h', 'Chiêu Thức — ' + n(CHIEU) + ' chiêu'],
      ['p', 'Xếp vào các ô chiêu; số ô mở thêm theo cấp. Mỗi chiêu tốn Nội Lực, có hồi chiêu riêng, thuộc một hệ. Bốn bậc: Sơ · Trung · Cao · Tuyệt.'],
      ['h', 'Bộ Pháp — ' + n(BO_PHAP) + ' bộ'],
      ['p', 'Bộ Pháp là bộ chỉnh chỉ số: được mặt này thì mất mặt kia. Ví dụ Quân Hành Bộ cộng đều công-thủ-tốc nhưng gần như không bạo kích.'],
      ['h', 'Bị Động — ' + n(BI_DONG) + ' món'],
      ['p', 'Bị Động chạy nền suốt trận, không cần ra tay. Hộ thể, hồi máu, tăng sát thương theo hệ.'],
      ['h', 'Tuyệt Học — ' + n(TUYET_IDS) + ' môn'],
      ['p', 'Bậc cao nhất. Cần đồ phổ riêng, nguyên liệu hiếm, và <b>' + TUYET_BAC.toLocaleString('vi-VN') + ' Bạc</b> để luyện.'],
      ['p', 'Có <b>' + n(MON_PHAI) + ' môn phái</b> đặt tên cho các nhánh võ học — chọn Tâm Pháp nào là theo mạch môn phái đó, nhưng không khoá: ngươi vẫn học được chiêu của nhánh khác.'],
    ],
  },
  {
    id: 'tang', nhom: 'chiendau', ten: 'Tầng Võ Học',
    tom: 'Luyện một chiêu lên tầng cao để mạnh hơn và mở cảnh giới.',
    khoi: [
      ['p', 'Mỗi chiêu luyện lên được tới <b>tầng ' + TANG_MAX + '</b>. Trang bị cộng thêm tối đa <b>' + TANG_GEAR_MAX + ' tầng</b>, nên trần thật là <b>' + TANG_HARD_MAX + '</b>.'],
      ['p', 'Mỗi tầng cộng khoảng <b>' + pc(TANG_OVER_STEP) + '</b> uy lực. Ngoài ra có bốn mốc mở cảnh giới:'],
      ['bang', ['Mốc', 'Cảnh giới', 'Được gì'], TANG_BANDS.map((b) => ['Tầng ' + b.at, b.name, b.eff])],
      ['luu', 'Dồn một chiêu lên tầng cao <b>đáng hơn</b> rải đều nhiều chiêu — mốc tầng ' + TANG_BANDS[TANG_BANDS.length - 1].at + ' nhân đôi uy lực.'],
    ],
  },
  {
    id: 'bicanh', nhom: 'chiendau', ten: 'Bí Cảnh',
    tom: n(DUNGEONS) + ' phó bản nhàn tu — vào rồi chờ, xong lấy thưởng.',
    khoi: [
      ['p', 'Bí Cảnh là phó bản chạy theo thời gian thực: chọn một cái, đủ điều kiện thì vào, hết giờ quay lại lĩnh thưởng.'],
      ['bang', ['Bí Cảnh', 'Cấp'], DUNGEONS.map((d) => [d.name, 'Lv ' + (d.reqLevel || d.lv)])],
      ['ds', [
        'Thưởng gồm Hồn Thạch, trang bị, công cụ bậc cao, và cơ hội ra Bí Kíp cho Tông Môn.',
        'Vào Bí Cảnh <b>không chặn</b> việc khác — vẫn treo nghề song song.',
      ]],
    ],
  },
  {
    id: 'yeuvuong', nhom: 'chiendau', ten: 'Yêu Vương',
    tom: n(YEU_VUONG) + ' trùm thế giới, mỗi con một chu kỳ hồi.',
    khoi: [
      ['p', 'Yêu Vương là trùm riêng, đánh theo lượt chứ không treo máy. Thắng được Hồn Thạch, Tinh Thể, Bạc, và <b>trứng linh thú</b>.'],
      ['bang', ['Yêu Vương', 'Cấp cần'], YEU_VUONG.map((y) => [y.name, 'Lv ' + y.reqLevel])],
      ['ds', [
        'Mỗi con có thời gian hồi riêng — hạ xong phải chờ mới đánh lại.',
        'Thua thì phải dưỡng thương một lúc.',
        'Trứng linh thú chỉ rơi ở đây, xác suất rất thấp — trứng càng quý càng hiếm.',
      ]],
    ],
  },

  // ================= LINH THÚ =================
  {
    id: 'linhthu_co', nhom: 'linhthu', ten: 'Linh Thú Là Gì',
    tom: n(PET_SPECIES) + ' loài, ' + n(PET_QUALITY) + ' bậc phẩm chất.',
    khoi: [
      ['p', 'Linh Thú nở từ trứng rơi ở Yêu Vương. Có <b>' + n(PET_SPECIES) + ' loài</b>: ' + Object.values(PET_SPECIES).map((s) => s.name || s.ten).join(' · ') + '.'],
      ['p', 'Phẩm chất trứng quyết định phẩm chất thú — <b>' + n(PET_QUALITY) + ' bậc</b>, cùng thang với trang bị.'],
      ['ds', [
        'Ấp trứng mất thời gian thực; phẩm càng cao ấp càng lâu.',
        'Thú có chỉ số riêng, lên cấp riêng, ăn riêng.',
      ]],
    ],
  },
  {
    id: 'linhthu_ky', nhom: 'linhthu', ten: 'Kỹ Năng & Thức Tỉnh',
    tom: n(PET_SKILLS) + ' kỹ năng · ' + n(AWK_PASSIVE_IDS) + ' bị động thức tỉnh.',
    khoi: [
      ['p', 'Mỗi thú mang kỹ năng riêng (<b>' + n(PET_SKILLS) + ' loại</b>) và có <b>' + n(PET_OPT_POOL) + ' tiềm năng</b> bốc ngẫu nhiên lúc nở.'],
      ['p', '<b>Thức tỉnh</b> mở thêm bị động — có <b>' + n(AWK_PASSIVE_IDS) + ' bị động</b> trong bể. Thức tỉnh cần vật phẩm chuyên dụng và có thể thất bại.'],
    ],
  },
  {
    id: 'linhthu_dung', nhom: 'linhthu', ten: 'Ngự Thú & Săn Mồi',
    tom: 'Mang theo đánh nhau, hoặc thả đi săn kiếm đồ.',
    khoi: [
      ['h', 'Ngự Thú'],
      ['p', 'Mang một con theo người: nó cộng chỉ số và tham chiến cùng ngươi.'],
      ['h', 'Săn Mồi'],
      ['p', 'Thả thú đi săn theo kiểu nhàn tu — chạy nền, hết giờ mang đồ về. Không cần ngươi trông.'],
      ['luu', 'Thú đói thì tụt hiệu quả. Cho ăn bằng món ăn từ nghề Trù Sư.'],
    ],
  },

  // ================= TÔNG MÔN =================
  {
    id: 'tongmon_co', nhom: 'tongmon', ten: 'Tông Môn Là Gì',
    tom: 'Ngươi làm chưởng môn, nuôi đệ tử làm hộ.',
    khoi: [
      ['p', 'Tông Môn là <b>gia nghiệp</b> của ngươi — ngươi là chưởng môn. Đệ tử tự tu luyện, tự làm việc, mang thành quả về cho tông.'],
      ['p', 'Khác Tiên Minh ở chỗ: <b>Tông Môn là nuôi</b> (chiều sâu, dài hạn), <b>Tiên Minh là đánh</b> (tranh hạng theo mùa).'],
      ['h', 'Đệ tử'],
      ['ds', [
        'Mỗi đệ tử có <b>tư chất</b> (' + Object.values(APT).map((a) => a.name).join(' · ') + '), hệ ngũ hành, và tính cách riêng.',
        'Tư chất quyết định tốc tu luyện và trần cấp — Thiên Tư gấp <b>' + APT.thien.mul + ' lần</b> Trung Tư.',
        'Số đệ tử nuôi được tăng theo công trình.',
      ]],
    ],
  },
  {
    id: 'tongmon_tu', nhom: 'tongmon', ten: 'Tu Luyện & Cảnh Giới',
    tom: n(REALMS) + ' cảnh giới, mỗi cảnh chia ' + n(SUB_STAGES) + ' tầng nhỏ.',
    khoi: [
      ['p', 'Đệ tử tu từ thấp lên cao qua <b>' + n(REALMS) + ' cảnh giới</b>: ' + REALMS.map((r) => r.ten || r.name).join(' · ') + '.'],
      ['p', 'Mỗi cảnh giới chia <b>' + n(SUB_STAGES) + ' tầng nhỏ</b>. Lên cảnh giới mới cần <b>đan phá cảnh</b> đúng bậc — có <b>' + n(PILL_KEYS) + ' loại đan</b>, luyện ở Y Quán.'],
      ['h', 'Tâm Ma & Thiên Kiếp'],
      ['ds', [
        '<b>Tâm Ma</b> — đệ tử tu lâu sinh tâm ma, tối đa <b>' + TAMMA_MAX + ' tầng</b>. Tâm ma nặng thì tu chậm và dễ hỏng việc.',
        '<b>Thiên Kiếp</b> — vượt cảnh giới lớn phải độ kiếp. Hỏng thì tụt cảnh giới, nặng thì mất đệ tử.',
      ]],
      ['luu', 'Đừng ép đệ tử tư chất thấp lên cảnh giới cao — tỉ lệ qua kiếp thấp, mất người là mất trắng.'],
    ],
  },
  {
    id: 'tongmon_ct', nhom: 'tongmon', ten: 'Công Trình Tông Môn',
    tom: n(BUILD_KEYS) + ' công trình, mỗi cái một chức năng.',
    khoi: [
      ['p', 'Có <b>' + n(BUILD_KEYS) + ' công trình</b>. Xây và nâng bằng nguyên liệu tông môn, mất thời gian thực.'],
      ['ds', [
        '<b>Tụ Hiền Đường</b> — chiêu nạp đệ tử, nới trần số người.',
        '<b>Diễn Võ Trường</b> — đệ tử luyện võ.',
        '<b>Tàng Thư Lâu</b> — chứa và học Bí Kíp.',
        '<b>Y Quán</b> — luyện đan, số lò tăng theo cấp.',
        '<b>Dược Viên</b> — trồng linh dược, số luống tăng theo cấp.',
        '<b>Giới Luật Đường</b> — trị đệ tử hư, giảm tâm ma.',
        '<b>Tụ Linh Trận</b> — tăng tốc tu luyện toàn tông.',
      ]],
    ],
  },
  {
    id: 'tongmon_bk', nhom: 'tongmon', ten: 'Bí Kíp',
    tom: n(BI_KIP) + ' bí kíp chia ' + n(BI_KIP_LOAI) + ' nhánh võ học.',
    khoi: [
      ['p', 'Bí Kíp là võ học truyền cho đệ tử. <b>' + n(BI_KIP) + ' bộ</b>, chia <b>' + n(BI_KIP_LOAI) + ' nhánh</b>:'],
      ['bang', ['Nhánh', 'Thiên về'], Object.values(BI_KIP_LOAI).map((l) => [
        l.name,
        Object.entries(l.prof).map(([k, v]) => k + ' +' + Math.round(v * 100) + '%').join(' · '),
      ])],
      ['ds', [
        'Bí Kíp có bốn bậc; bậc càng cao càng cần Tàng Thư Lâu cấp cao mới học được.',
        'Kiếm ở đấu giá Tàng Thư Lâu, hoặc rơi trong Bí Cảnh.',
        'Bí Kíp trùng thì ghép lên bậc cao hơn.',
      ]],
    ],
  },
  {
    id: 'tongmon_ng', nhom: 'tongmon', ten: 'Ngoại Giao',
    tom: 'Kết giao với các thế lực khác để mở lợi ích.',
    khoi: [
      ['p', 'Bang giao đo bằng điểm thân thiết, chia <b>' + n(DIPLO_TIERS) + ' bậc</b>: ' + DIPLO_TIERS.map((d) => d.name).join(' → ') + '.'],
      ['p', 'Tặng lễ, mời làm khách, luận võ đều cộng điểm. Lên bậc <b>' + DIPLO_TIERS[DIPLO_TIERS.length - 1].name + '</b> thì mở quyền lợi riêng.'],
    ],
  },

  // ================= TIÊN MINH =================
  {
    id: 'tienminh_co', nhom: 'tienminh', ten: 'Lập Tiên Minh',
    tom: 'Ngươi làm Minh Chủ, tự chiêu mộ minh chúng.',
    khoi: [
      ['p', 'Tiên Minh là bang hội. Ngươi <b>tự lập và làm Minh Chủ</b> — không xin vào bang người khác. Các Tiên Minh khác là <b>đối thủ</b> trên bảng Chinh Phạt.'],
      ['ds', [
        'Cần đủ Tổng Lv và một khoản Bạc để dựng cờ.',
        'Cấp minh tối đa <b>' + CAP_BANG_MAX + '</b>, sức chứa tới <b>' + TV_TRAN + ' người</b>.',
        'Chiêu mộ ba đường: Đơn Xin · Bảng Chiêu Hiền · người quen ở Tửu Lâu.',
      ]],
      ['p', 'Minh Chủ có quyền thăng, hạ, kích người, đặt quyền cho từng chức, duyệt đơn, và giải tán.'],
    ],
  },
  {
    id: 'tienminh_cong', nhom: 'tienminh', ten: 'Minh Cống & Công Tích',
    tom: 'Góp Bạc lấy Công Tích cho mình, Minh Cống cho minh.',
    khoi: [
      ['p', 'Góp Bạc vào <b>Ngân Khố</b> thì được hai thứ:'],
      ['bang', ['Được gì', 'Tỉ giá'], [
        ['Công Tích — của riêng ngươi, dùng mua đồ và học kĩ năng', '1 Bạc = 1 Công Tích'],
        ['Minh Cống — điểm lên cấp minh', BAC_MOI_MINH_CONG.toLocaleString('vi-VN') + ' Bạc = 1 Minh Cống'],
      ]],
      ['p', 'Hai kho khác nhau: <b>Ngân Khố</b> giữ Bạc, <b>Minh Khố</b> giữ vật phẩm.'],
    ],
  },
  {
    id: 'tienminh_ct', nhom: 'tienminh', ten: 'Công Trình & Kĩ Năng Minh',
    tom: n(CONG_TRINH) + ' công trình · ' + n(KY_NANG_BANG) + ' kĩ năng.',
    khoi: [
      ['p', '<b>' + n(CONG_TRINH) + ' công trình</b> xây bằng Bạc trong Ngân Khố, mất thời gian thực, không vượt được cấp minh. Mỗi lúc chỉ xây một cái.'],
      ['p', '<b>' + n(KY_NANG_BANG) + ' kĩ năng</b> học bằng Công Tích, cộng chỉ số thật cho cả minh — công, thủ, máu, kinh nghiệm, Bạc, tốc độ nghề. Mỗi nhóm kĩ năng bị một công trình chặn trần cấp.'],
      ['p', 'Minh Hội Các bán <b>' + n(CUA_HANG_BANG) + ' món</b> đổi bằng Công Tích, hạn lượt theo ngày, mở khoá dần theo cấp minh.'],
    ],
  },
  {
    id: 'tienminh_vu', nhom: 'tienminh', ten: 'Minh Vụ & Truy Nã',
    tom: 'Việc chung cả minh góp, và lệnh săn cá nhân.',
    khoi: [
      ['h', 'Minh Vụ'],
      ['p', '<b>' + n(NV_BANG) + ' loại việc</b> ra theo kỳ, cả minh cùng góp. Chỉ tiêu co giãn theo số người — minh đông thì chỉ tiêu cao hơn.'],
      ['h', 'Truy Nã'],
      ['p', 'Mỗi ngày bốn lệnh, đủ bốn bậc. Mục tiêu chọn theo cấp của ngươi. Nhận lệnh xong đi trảm đủ số rồi về nộp.'],
      ['luu', 'Nhận lệnh mới chụp mốc — số quái giết <b>trước khi nhận</b> không tính.'],
    ],
  },
  {
    id: 'tienminh_cp', nhom: 'tienminh', ten: 'Chinh Phạt & Mùa',
    tom: 'Đánh quái ở vùng nào thì ghi điểm cho minh ở vùng đó.',
    khoi: [
      ['p', 'Trảm quái trong một vùng sinh <b>điểm Chinh Phạt</b> cho Tiên Minh ở đúng vùng ấy. Cả ' + n(LOCATIONS) + ' vùng đều tranh được.'],
      ['bang', ['Hạng trong vùng', 'Cả minh được'], CP_BUFF_HANG.map((v, i) => ['Hạng ' + (i + 1), '+' + Math.round(v * 100) + '% tốc độ Nghề Khai Thác ở vùng đó'])],
      ['h', 'Mùa'],
      ['p', 'Mùa kết thì chốt hạng tổng và phát thưởng Hồn Thạch:'],
      ['bang', ['Hạng mùa', 'Hồn Thạch'], MUA_THUONG_BANG.map((v, i) => ['Hạng ' + (i + 1), v.toLocaleString('vi-VN')])],
    ],
  },
  {
    id: 'tienminh_boss', nhom: 'tienminh', ten: 'Trảm Yêu Đài',
    tom: 'Boss riêng của minh, cả minh xúm vào đánh.',
    khoi: [
      ['p', 'Xây xong Trảm Yêu Đài thì mỗi kỳ minh triệu về một con Yêu Vương riêng. Cả minh cùng bào máu.'],
      ['ds', [
        'Mỗi người <b>' + BOSS_BANG_LUOT + ' lượt</b> mỗi kỳ, giữa hai lượt phải nghỉ.',
        'Đài càng cao cấp thì con càng dữ và thưởng càng dày.',
        'Thưởng chia theo phần công của từng người.',
      ]],
      ['luu', 'Đây là boss <b>riêng của minh</b> — không đụng gì tới Yêu Vương ngoài thế giới, không dùng chung lượt.'],
    ],
  },

  // ================= GIANG HỒ =================
  {
    id: 'bando', nhom: 'giangho', ten: 'Bản Đồ & Di Chuyển',
    tom: n(LOCATIONS) + ' vùng, mỗi vùng một bộ tài nguyên và quái riêng.',
    khoi: [
      ['bang', ['Vùng', 'Cấp cần'], LOCATIONS.map((l) => [l.name, 'Lv ' + l.reqLevel])],
      ['ds', [
        'Đi bộ mất thời gian thực theo khoảng cách.',
        '<b>Truyền Tống</b> đi ngay, phí tính bằng <b>Tổng Lv × khoảng cách</b> Bạc.',
        'Vùng khoá thì phải đủ cấp mới vào.',
      ]],
    ],
  },
  {
    id: 'nhiemvu', nhom: 'giangho', ten: 'Nhiệm Vụ',
    tom: 'Tân thủ · ngày · tuần · tháng.',
    khoi: [
      ['bang', ['Loại', 'Số việc', 'Làm mới'], [
        ['Tân Thủ', n(TUTORIAL_QUESTS), 'một lần'],
        ['Hằng ngày', n(DAILY_QUESTS), 'mỗi ngày'],
        ['Hằng tuần', n(WEEKLY_QUESTS), 'mỗi tuần'],
        ['Hằng tháng', n(MONTHLY_QUESTS), 'mỗi tháng'],
      ]],
      ['p', 'Việc lấy theo cấp của ngươi — cấp càng cao thì chỉ tiêu và thưởng càng lớn. Thưởng gồm Bạc, Hồn Thạch, và Nguyên Bảo ở việc tháng.'],
    ],
  },
  {
    id: 'phicap', nhom: 'giangho', ten: 'Phi Cáp Đài',
    tom: 'Nơi gom mọi tin: thưởng, sự kiện, tin giang hồ.',
    khoi: [
      ['p', 'Mọi thứ xảy ra lúc ngươi vắng mặt đều báo về đây: việc xong, đồ rơi hiếm, đệ tử phá cảnh, tin Tiên Minh, chuyện giang hồ.'],
      ['p', 'Tin có thưởng thì lĩnh ngay tại chỗ. Chấm xanh trên chuông là còn tin chưa đọc.'],
    ],
  },
  {
    id: 'phongvan', nhom: 'giangho', ten: 'Phong Vân Bảng',
    tom: 'Bảng xếp hạng toàn giang hồ.',
    khoi: [
      ['p', 'So ngươi với các cao thủ khác trong giang hồ — theo Tổng Lv, theo từng nghề, theo Chiến Lực.'],
      ['p', 'Giang hồ có sẵn một lứa cao thủ tự sống: họ lên cấp, đổi việc, đổi vùng theo thời gian thật. Không phải bảng chết.'],
    ],
  },
  {
    id: 'danhsi', nhom: 'giangho', ten: 'Danh Sĩ',
    tom: n(DANH_SI) + ' nhân vật có tiểu sử, quan hệ, và tâm trạng.',
    khoi: [
      ['p', '<b>' + n(DANH_SI) + ' Danh Sĩ</b> là lớp nhân vật sâu nhất trong giang hồ: mỗi người một xuất thân, một môn phái, một mạch đời riêng, và quan hệ với nhau.'],
      ['ds', [
        'Xem Hồ Sơ để biết họ đang ở đâu, làm gì, tâm trạng thế nào.',
        'Mời tỷ thí cờ, mời rượu ở Tửu Lâu, kết giao dần.',
        'Thân đủ thì mời vào Tiên Minh của ngươi.',
      ]],
    ],
  },
  {
    id: 'tuulau', nhom: 'giangho', ten: 'Tửu Lâu',
    tom: 'Quán rượu — nghe tin đồn, kết giao.',
    khoi: [
      ['p', 'Mỗi phiên quán có khách khác nhau: vài Danh Sĩ, vài cao thủ giang hồ. Sang phiên thì đổi người.'],
      ['ds', [
        '<b>Mời Rượu</b> — tốn Bạc, đổi lấy lời thoại và tin đồn.',
        '<b>Hỏi Chuyện</b> — miễn phí nhưng mỗi khách chỉ hỏi được cách quãng.',
        '<b>Góp Chuyện</b> — ngươi tự thêm một câu vào bảng tin.',
      ]],
      ['luu', 'Tửu Lâu <b>không cho chỉ số, không cho vật phẩm</b>. Đây là chỗ kết giao, không phải chỗ cày.'],
    ],
  },
  {
    id: 'thuongdiem', nhom: 'giangho', ten: 'Thương Điếm',
    tom: 'Mua nguyên liệu, mồi câu, ảnh đại diện.',
    khoi: [
      ['p', 'Thương Điếm bán nguyên liệu cơ bản, mồi câu, món ăn, và các thứ trang trí như ảnh đại diện, ảnh nền hồ sơ.'],
      ['p', 'Bán đồ thừa cũng ở đây. Giá bán theo phẩm chất và cấp món.'],
      ['p', '<b>Sàn Giao Dịch</b> giữa người chơi đang phát triển.'],
    ],
  },

  // ================= SƯU TẬP & KHÁC =================
  {
    id: 'vanvat', nhom: 'suutap', ten: 'Vạn Vật Phổ',
    tom: n(CODEX_CATS) + ' phổ sưu tập, đủ bộ thì cộng chỉ số.',
    khoi: [
      ['p', 'Gặp thứ gì lần đầu là tự ghi vào phổ. Càng ghi nhiều càng cộng chỉ số.'],
      ['bang', ['Phổ', 'Ghi gì', 'Đủ bộ được'], CODEX_CATS.map((c) => [c.name, c.unit || '—', (c.set && c.set.label) || '—'])],
      ['p', 'Mỗi mục còn cộng lẻ theo số lượng — ví dụ Yêu Thú Phổ cộng dần theo số quái đã trảm.'],
    ],
  },
  {
    id: 'danhhieu', nhom: 'suutap', ten: 'Danh Hiệu',
    tom: n(TITLES) + ' danh hiệu chia ' + n(TITLE_LOAI) + ' loại.',
    khoi: [
      ['p', 'Danh hiệu mở khi đạt mốc. Đeo một cái thì hiện cạnh tên <b>và cộng chỉ số thật</b>.'],
      ['bang', ['Loại danh hiệu'], Object.values(TITLE_LOAI).map((v) => [v])],
      ['p', 'Xem đủ danh sách và điều kiện ở trang Hồ Sơ.'],
    ],
  },
  {
    id: 'huyhieu', nhom: 'suutap', ten: 'Huy Hiệu',
    tom: n(BADGES) + ' huy hiệu — mốc cấp ' + BADGE_LV + ' của từng nghề.',
    khoi: [
      ['p', 'Mỗi nghề đưa lên <b>cấp ' + BADGE_LV + '</b> thì được một huy hiệu. Đủ bộ <b>' + n(BADGES) + ' cái</b> là đã cày trọn mọi nghề.'],
      ['bang', ['Huy hiệu'], BADGES.map((b) => [b.name || b.ten])],
    ],
  },
  {
    id: 'diemdanh', nhom: 'suutap', ten: 'Điểm Danh',
    tom: n(LOGIN_REWARDS) + ' mốc thưởng theo chuỗi ngày vào chơi.',
    khoi: [
      ['p', 'Vào chơi mỗi ngày là điểm danh. Chuỗi càng dài thưởng càng lớn — có <b>' + n(LOGIN_REWARDS) + ' mốc</b>.'],
      ['p', 'Một số mốc cho buff cộng kinh nghiệm mọi nguồn trong một khoảng thời gian.'],
      ['luu', 'Đứt chuỗi là quay lại từ đầu.'],
    ],
  },
  {
    id: 'thiencoc', nhom: 'suutap', ten: 'Thiên Cơ Các',
    tom: 'Năm trò nhỏ, tách hẳn khỏi kinh tế chính.',
    khoi: [
      ['bang', ['Trò', 'Kiểu'], [
        ['Đăng Tiên Mộng', 'Thẻ bài leo tầng — 20 tầng, 5 trùm, di vật'],
        ['Kỳ Trận Trảm Yêu', 'Xếp ba ô để đánh quái, có meta Cửu Cung'],
        ['Ngũ Tử Kỳ', 'Cờ caro bàn 3D, đấu Danh Sĩ, có khẩu chiến'],
        ['Cờ Tướng', 'Cờ tướng bàn 3D, máy đánh thật'],
        ['Cờ Vua', 'Cờ vua bàn 3D, máy đánh thật'],
      ]],
      ['p', 'Cờ Tướng và Ngũ Tử Kỳ dùng chung <b>Kỳ Hồn</b> và danh hiệu Kỳ Nghệ.'],
      ['luu', 'Mấy trò này <b>cách ly</b> khỏi kinh tế chính — chơi cho vui và lấy danh hiệu, không phá cân bằng cày cuốc.'],
    ],
  },
];

/** Gộp toàn bộ chữ của một mục thành một chuỗi — để tìm kiếm. */
export function cnText(m) {
  const ra = [m.ten, m.tom];
  for (const k of m.khoi) {
    if (k[0] === 'p' || k[0] === 'h' || k[0] === 'luu') ra.push(k[1]);
    else if (k[0] === 'ds') ra.push(k[1].join(' '));
    else if (k[0] === 'bang') { ra.push(k[1].join(' ')); k[2].forEach((r) => ra.push(r.join(' '))); }
  }
  return ra.join(' ').replace(/<[^>]+>/g, '').toLowerCase();
}

export const CN_MUC_BY_ID = Object.fromEntries(CN_MUC.map((m) => [m.id, m]));
