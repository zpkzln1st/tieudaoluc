// ============================================================
// DATA — HỆ SỰ KIỆN (6 lễ/năm). Thuần data + tự ghi danh vào các bảng gốc.
// Thiết kế: docs/THIET_KE_SU_KIEN.md · bật/tắt bằng Lệnh Bài (bảng su_kien, engine/lenhbai.js).
//
// Nguyên tắc:
//   · Mỗi sự kiện: 1 bản đồ + 1 kĩ năng riêng 6 bậc + 6 vật phẩm + 4 quái + 2 Yêu Vương
//     + 2 Bí Cảnh + quầy đổi thưởng. Khuôn số DÙNG CHUNG, chỉ tên/lore đổi theo lễ.
//   · Kĩ năng sự kiện KHÔNG cộng Tứ Trụ (stat: null, statXp: 0) — bỏ một đợt không tụt hậu.
//   · Vật phẩm sự kiện value 0 (không bán ra Bạc) và BỐC HƠI khi sự kiện đóng (donSuKien).
//     Trứng + món ăn mua ở quầy thì GIỮ LẠI — đồ đã mua là của người ta.
//   · Quái sinh bằng mkQuai() của combat.js — KHÔNG chép công thức. Riêng con cấp 1 phải
//     VIẾT TAY theo khuôn Sói Hoang: mkQuai(1,'thuong') cho ra máu 1 / EXP 0, vô dụng.
//   · Mọi thực thể mang cờ `suKien: <ma>` — Cẩm Nang / Tìm Kiếm / UI lọc theo cờ này.
// ⚠⚠ Thêm/đổi số ở đây thì PHẢI chạy lại _mockup/_covua_wip/_sinh_sql_tran.mjs và USER dán
//    lại docs/SQL_CHONG_GIAN_LAN.sql — sáu kĩ năng là sáu track chống gian lận mới.
// ============================================================
import { SKILLS } from './skills.js';
import { ITEMS, ITEM_TYPES } from './items.js';
import { ENEMIES, YEU_VUONG, YEU_VUONG_BY_ID, mkQuai } from './combat.js';
import { DUNGEONS, DUNGEON_BY_ID, DUNGEON_IDS } from './dungeon.js';
import { LOCATIONS } from './locations.js';
import { PET_SPECIES, PET_SKILLS } from './pets.js';
import { TITLES, TITLE_LOAI } from './titles.js';
import { AVATARS, COVERS } from './avatars.js';

const MIN = 60 * 1000;

// ---- Khuôn 6 bậc kĩ năng (docs/THIET_KE_SU_KIEN.md I5) — diem10 = Điểm Sự Kiện cho 10 vật ----
export const SK_BAC = [
  { bac: 1, gate: 1,  xp: 45,   time: 12, diem10: 3 },
  { bac: 2, gate: 10, xp: 110,  time: 20, diem10: 6 },
  { bac: 3, gate: 22, xp: 240,  time: 30, diem10: 10 },
  { bac: 4, gate: 36, xp: 480,  time: 42, diem10: 18 },
  { bac: 5, gate: 52, xp: 900,  time: 58, diem10: 30 },
  { bac: 6, gate: 70, xp: 1600, time: 76, diem10: 50 },
];
// Tỉ lệ quái rơi vật phẩm bậc 1-4 (4 con quái ứng 4 bậc đầu)
const QUAI_ROI = [0.30, 0.26, 0.22, 0.18];
// Phụ kiện: Bội (+hiệu suất, từ Yêu Vương) · Ấn (+EXP, từ Bí Cảnh) — CHỈ trong bản đồ sự kiện
export const PHU_KIEN_EFF = { boiSo: 0.15, boiThuong: 0.30 };
export const PHU_KIEN_EXP = { anSo: 0.20, anThuong: 0.40 };

// ============================================================
// SÁU SỰ KIỆN — phần chữ. q6 = phẩm chất 6 bậc vật phẩm (cố định).
// ============================================================
const Q6 = ['phamPham', 'luongPham', 'tinhPham', 'tuyetPham', 'truyenThe', 'thanPham'];

export const SU_KIEN_DS = [
  // ================= 1. TẾT =================
  {
    ma: 'tet', ten: 'Sự Kiện Tết', thang: 2, icon: '🧧', color: '#f87171',
    charHan: '春', avColor: 'from-red-600 to-amber-700',
    moTa: 'Đêm giao thừa, sân miếu mở hội — pháo nổ, mai vàng, và một con Niên đang xuống núi.',
    loc: { id: 'truongXuanMieuHoi', name: 'Trường Xuân Miếu Hội', gloss: 'Evergreen Temple Fair', icon: '🏮',
      desc: 'Sân miếu đêm giao thừa: đèn lồng đỏ rực, cây nêu dựng cao, xác pháo rải kín mặt sân.' },
    skill: { id: 'thaiPhuc', name: 'Thái Phúc', gloss: 'Hái phúc lộc đầu năm', icon: '🧧' },
    hanhDong: ['Nhặt Xác Pháo', 'Xin Chữ Ông Đồ', 'Hái Mai Vàng', 'Gỡ Phong Bao Treo Cành', 'Thỉnh Hương Đầu Năm', 'Trảy Lộc Cây Nêu'],
    vatPham: [
      { id: 'xacPhaoDo',         name: 'Xác Pháo Đỏ',          icon: '🧨', desc: 'Giấy pháo vừa nổ còn ấm. Nhặt về gói lộc đầu năm.' },
      { id: 'cauDoiDo',          name: 'Câu Đối Đỏ',           icon: '📜', desc: 'Chữ ông đồ viết trên giấy hồng điều. Mực chưa khô hẳn.' },
      { id: 'maiVangCanhKep',    name: 'Mai Vàng Cánh Kép',    icon: '🌼', desc: 'Cành mai cánh kép nở đúng giao thừa. Hoa nở kép, phúc cũng kép.' },
      { id: 'phongBaoDo',        name: 'Phong Bao Đỏ',         icon: '🧧', desc: 'Phong bao lụa đỏ dập chữ vàng. Bên trong không phải tiền — là vận may.' },
      { id: 'tramHuongNguyenDan',name: 'Trầm Hương Nguyên Đán',icon: '🕯️', desc: 'Bó trầm thỉnh giữa đêm trừ tịch. Khói bay tới đâu, tà lui tới đó.' },
      { id: 'locCayNeu',         name: 'Lộc Cây Nêu',          icon: '🎋', desc: 'Nhánh lộc trảy từ ngọn nêu. Cả năm chỉ trảy được một mùa.' },
    ],
    quai: [
      { id: 'lanCon', name: 'Lân Con', icon: '🦁', affinity: 'Miếu Hội', lore: 'Đầu lân múa hội bỏ quên sau miếu, đêm về tự cựa mình dậy nhảy.',
        atkFl: 'nhảy chồm tới húc', skill: { name: 'Lân Vũ Bộ', mult: 1.6, cd: 4, fl: 'nhún theo nhịp trống tung mình đạp tới' } },
      { id: 'phaoYeu', name: 'Pháo Yêu', icon: '🧨', affinity: 'Hoả Khí', lore: 'Xác pháo chất đống trăm năm tụ thành yêu, chạy tới đâu nổ lách tách tới đó.',
        atkFl: 'ném một chùm pháo', skill: { name: 'Liên Hoàn Pháo', mult: 1.7, cd: 4, fl: 'quấn cả thân pháo quanh người mà kích nổ' } },
      { id: 'kimNguuMieu', name: 'Kim Ngưu Miếu', icon: '🐂', affinity: 'Thạch Linh', lore: 'Trâu đá canh cổng miếu, nghe đủ vạn lời khấn thì lớp đá nứt ra mà bước xuống.',
        atkFl: 'húc một sừng đá', skill: { name: 'Trấn Miếu Chàng', mult: 1.6, cd: 5, fl: 'cúi đầu lấy đà húc rung cả nền miếu' } },
      { id: 'thuTueQuy', name: 'Thủ Tuế Quỷ', icon: '👺', affinity: 'Quỷ Tuế', lore: 'Quỷ canh khắc giao thừa, cả năm chỉ tỉnh đúng một đêm, tỉnh dậy là đòi nợ cũ.',
        atkFl: 'quẹt một trảo âm khí', skill: { name: 'Tuế Mạt Truy Trái', mult: 1.8, cd: 5, fl: 'lật sổ nợ cũ, mỗi dòng nợ hoá một đạo âm phong' } },
    ],
    boss: [
      { id: 'yvLanVuong', name: 'Lân Vương Khai Hội', icon: '🦁', affinity: 'Yêu Vương · Lân', lv: 10,
        lore: 'Con lân đầu đàn mở hội, bờm đỏ như lửa, mỗi bước nhảy là một tiếng trống rền.',
        atkFl: 'đạp trống lao tới', skill: { name: 'Bách Bộ Xuyên Vân', mult: 2.2, cd: 5, fl: 'mượn trăm nhịp trống tung mình xuyên mây giáng xuống' } },
      { id: 'yvNienThu', name: 'Niên Thú Vương', icon: '👹', affinity: 'Yêu Vương · Niên', lv: 60,
        lore: 'Con Niên trong truyền thuyết, sừng đồng vảy sắt, mỗi năm xuống núi một lần nuốt trọn cả thôn.',
        atkFl: 'táp một ngoạm', skill: { name: 'Thôn Tuế Nhất Khẩu', mult: 2.8, cd: 6, fl: 'há miệng nuốt cả năm cũ, kéo theo vạn vật vào bụng' } },
    ],
    biCanh: [
      { id: 'mieuDuongCo', name: 'Miếu Đường Cổ', seal: '廟', lv: 25, hazard: 'linhXao', hazardName: 'Hương Khói Mê Đồ',
        theme: 'Miếu khuya khói hương', color: '#f87171', boss: 'Hộ Miếu Thạch Sư',
        lore: 'Sân miếu khuya, khói hương chưa tan, tượng thần trong bóng tối như đang nhìn theo.' },
      { id: 'truongXuanDien', name: 'Trường Xuân Điện', seal: '春', lv: 70, hazard: 'hoThe', hazardName: 'Vạn Chúc Đăng Hỏa',
        theme: 'Chính điện ngàn nến', color: '#fb923c', boss: 'Trường Xuân Điện Chủ',
        lore: 'Chính điện sâu trong miếu, cột sơn son thếp vàng, ngàn ngọn nến cháy suốt đêm không tắt.' },
    ],
    phuKien: { boi: 'Xuân Huy Bội', an: 'Nguyên Đán Ấn' },
    pet: { base: 'kimDongNgu', name: 'Kim Đồng Ngư', he: 'kim', emoji: '🐟', role: 'Chiêu Tài', tuTru: 'linhXao',
      stats: { congKich: 6, hoThe: 3, sinhLuc: 20, neTranh: 7, menhTrung: 6 },
      passive: { name: 'Ngư Dược Long Môn', desc: 'Cá chép vượt vũ môn — sát thương tuyệt kĩ Linh Thú tăng 25%.', dmgBonus: 0.25 },
      active: { name: 'Kim Lân Kích', cd: 3, mult: 1.5, desc: 'Vảy vàng loé lên, một cú quẫy đuôi như đao chém.' },
      loreTrung: 'Trứng vảy vàng của Kim Đồng Ngư. Ấp nở ra linh ngư chiêu tài đón lộc.' },
    monAn: { id: 'banhChung', name: 'Bánh Chưng', icon: '🍙', desc: 'Bánh chưng xanh gói lá dong. Ăn một góc, ấm cả bụng đường xa.' },
    danhHieu: { id: 'nghenhXuanKhach', name: 'Nghênh Xuân Khách' },
    avatar: ['sk_tet_nam', 'sk_tet_nu'], cover: 'cover_sk_tet',
    quay: { ten: 'Chợ Hoa Đầu Xuân', chu: 'Ông Đồ Già' },
  },

  // ================= 2. MÙA XUÂN =================
  {
    ma: 'xuan', ten: 'Sự Kiện Mùa Xuân', thang: 4, icon: '🦋', color: '#4ade80',
    charHan: '青', avColor: 'from-emerald-500 to-green-700',
    moTa: 'Thảo nguyên vừa qua mưa, trứng ngũ sắc giấu trong cỏ — và cỏ cây cả cánh đồng đang đứng dậy.',
    loc: { id: 'bichThaoNguyen', name: 'Bích Thảo Nguyên', gloss: 'Emerald Meadow', icon: '🌿',
      desc: 'Thảo nguyên xanh non sau mưa xuân: suối vừa tan băng, bướm bay rợp, trứng ngũ sắc giấu trong cỏ.' },
    skill: { id: 'thaiThanh', name: 'Thái Thanh', gloss: 'Hái lộc biếc mùa xuân', icon: '🌱' },
    hanhDong: ['Nhặt Trứng Giấu Trong Cỏ', 'Hái Cỏ Non', 'Bắt Bướm Đầu Mùa', 'Hứng Mưa Xuân', 'Hái Hoa Sơ Nở', 'Chiết Cành Liễu Biếc'],
    vatPham: [
      { id: 'trungNguSac',  name: 'Trứng Ngũ Sắc',   icon: '🥚', desc: 'Trứng nhuộm năm màu giấu trong cỏ. Ai giấu thì không ai biết.' },
      { id: 'coBichThao',   name: 'Cỏ Bích Thảo',    icon: '🌿', desc: 'Nhúm cỏ non nhổ cả rễ còn dính đất. Xanh tới mức phát sáng.' },
      { id: 'phanCanhBuom', name: 'Phấn Cánh Bướm',  icon: '🦋', desc: 'Lọ phấn óng ánh gom từ cánh bướm đầu mùa. Lắc nhẹ là đổi màu.' },
      { id: 'giotXuanLo',   name: 'Giọt Xuân Lộ',    icon: '💧', desc: 'Một giọt mưa xuân hứng trên lá. Trong giọt nước có cả bầu trời.' },
      { id: 'hoaSoXuan',    name: 'Hoa Sơ Xuân',     icon: '🌸', desc: 'Đoá hoa đầu tiên nở trong năm. Cánh còn chưa dám xoè hết.' },
      { id: 'lieuBiecChi',  name: 'Liễu Biếc Chi',   icon: '🍃', desc: 'Cành liễu chiết lúc nhựa xuân đang dâng. Cắm đâu sống đó.' },
    ],
    quai: [
      { id: 'deNonDongCo', name: 'Dê Non Đồng Cỏ', icon: '🐐', affinity: 'Dã Thú', lore: 'Dê con lạc bầy giữa đồng, húc bừa vào chân khách qua đường.',
        atkFl: 'cúi đầu húc', skill: { name: 'Sừng Non Chàng', mult: 1.6, cd: 4, fl: 'giậm bốn vó lấy đà húc thẳng' } },
      { id: 'buomDocPhan', name: 'Bướm Độc Phấn', icon: '🦋', affinity: 'Độc Điệp', lore: 'Bướm cánh rực rỡ đến chói mắt, phấn nó rắc xuống làm cỏ dưới chân héo rũ.',
        atkFl: 'rắc một làn phấn', skill: { name: 'Độc Phấn Vũ', mult: 1.7, cd: 4, fl: 'đập cánh phủ một trận mưa phấn độc' } },
      { id: 'cuQuyReu', name: 'Cự Quy Rêu', icon: '🐢', affinity: 'Thạch Quy', lore: 'Rùa già ngủ quên dưới lớp rêu dày, mai nó xanh như một gò đất nhỏ.',
        atkFl: 'nghiến một cú mai', skill: { name: 'Cổ Mai Trấn', mult: 1.6, cd: 5, fl: 'nhấc cả gò rêu trên lưng đè xuống' } },
      { id: 'thaoMocTinh', name: 'Thảo Mộc Tinh', icon: '🌾', affinity: 'Mộc Linh', lore: 'Cỏ cây cả cánh đồng dồn khí lại một chỗ mà thành hình người, đi tới đâu cỏ mọc theo tới đó.',
        atkFl: 'quất một roi cỏ', skill: { name: 'Vạn Thảo Triền', mult: 1.8, cd: 5, fl: 'cỏ quanh chân dựng hết dậy quấn xiết' } },
    ],
    boss: [
      { id: 'yvHoaLinh', name: 'Hoa Linh Vương', icon: '🌺', affinity: 'Yêu Vương · Hoa Linh', lv: 10,
        lore: 'Đóa hoa đầu tiên nở mỗi mùa xuân, hút hết linh khí cả cánh đồng mà thành tinh.',
        atkFl: 'phất một cánh hoa', skill: { name: 'Bách Hoa Tề Phóng', mult: 2.2, cd: 5, fl: 'ra lệnh cho trăm đoá quanh mình nở bung cùng lúc' } },
      { id: 'yvThanhDeMocLinh', name: 'Thanh Đế Mộc Linh', icon: '🌳', affinity: 'Yêu Vương · Mộc Linh', lv: 60,
        lore: 'Mộc linh thay mặt Thanh Đế cai quản mùa xuân phương Đông, rễ nó ăn sâu suốt cả thảo nguyên.',
        atkFl: 'vươn một nhánh rễ', skill: { name: 'Vạn Mộc Triều Sinh', mult: 2.8, cd: 6, fl: 'gọi vạn rễ dưới đất trồi lên chầu về một hướng' } },
    ],
    biCanh: [
      { id: 'noanThachCoc', name: 'Noãn Thạch Cốc', seal: '卵', lv: 25, hazard: 'thanPhap', hazardName: 'Noãn Thạch Chuyển Mình',
        theme: 'Thung lũng đá trứng', color: '#4ade80', boss: 'Noãn Mẫu Thạch Linh',
        lore: 'Thung lũng đá hình quả trứng, mỗi hòn ấp một sinh linh chưa nở.' },
      { id: 'thanhDeThanDien', name: 'Thanh Đế Thần Điện', seal: '青', lv: 70, hazard: 'linhXao', hazardName: 'Mê Cung Dây Leo',
        theme: 'Đền xuân phủ dây leo', color: '#34d399', boss: 'Thanh Đế Hộ Pháp',
        lore: 'Đền thờ thần mùa xuân, mái phủ dây leo, cột đá nứt ra mà hoa vẫn mọc.' },
    ],
    phuKien: { boi: 'Bích Thảo Bội', an: 'Thanh Đế Ấn' },
    pet: { base: 'thaiVuDiep', name: 'Thải Vũ Điệp', he: 'moc', emoji: '🦋', role: 'Nhanh Nhẹn', tuTru: 'thanPhap',
      stats: { congKich: 6, hoThe: 2, sinhLuc: 16, neTranh: 10, menhTrung: 6 },
      passive: { name: 'Điệp Ảnh', desc: 'Bóng cánh loang loáng — tuyệt kĩ Linh Thú giảm 1 hiệp hồi.', cdCut: 1 },
      active: { name: 'Ngũ Sắc Phấn Vũ', cd: 3, mult: 1.3, desc: 'Rũ cánh tung năm màu phấn phủ kín mắt địch.' },
      loreTrung: 'Trứng lụa ánh ngũ sắc của Thải Vũ Điệp. Ấp nở ra linh điệp cánh năm màu.' },
    monAn: { id: 'banhTroiNguSac', name: 'Bánh Trôi Ngũ Sắc', icon: '🍡', desc: 'Chén bánh trôi năm màu nổi trong nước gừng. Ngọt từ trong ra ngoài.' },
    danhHieu: { id: 'dapThanhKhach', name: 'Đạp Thanh Khách' },
    avatar: ['sk_xuan_nam', 'sk_xuan_nu'], cover: 'cover_sk_xuan',
    quay: { ten: 'Sạp Cỏ Đầu Nguồn', chu: 'Mục Đồng Áo Xanh' },
  },

  // ================= 3. ĐOAN NGỌ =================
  {
    ma: 'doanNgo', ten: 'Sự Kiện Đoan Ngọ', thang: 6, icon: '🐉', color: '#facc15',
    charHan: '蓮', avColor: 'from-yellow-500 to-teal-700',
    moTa: 'Giữa trưa hè nắng nhất năm, thuyền rồng rẽ nước — và năm loài độc đang tụ về một chỗ.',
    loc: { id: 'doanDuongGiang', name: 'Đoan Dương Giang', gloss: 'Duanyang River', icon: '🛶',
      desc: 'Khúc sông trưa hè: thuyền rồng đua rẽ nước, đầm sen kín một bờ, khói hùng hoàng bay là là.' },
    skill: { id: 'thaiLien', name: 'Thái Liên', gloss: 'Hái sen giữa mùa hạ', icon: '🪷' },
    hanhDong: ['Hái Lá Sen', 'Bện Dây Ngũ Sắc', 'Đãi Bột Hùng Hoàng', 'Hái Gương Sen', 'Vớt Mảnh Thuyền Rồng', 'Trích Xương Bồ Ngàn Năm'],
    vatPham: [
      { id: 'laSenNon',      name: 'Lá Sen Non',       icon: '🍃', desc: 'Lá sen còn cuộn mép, đọng nước lóng lánh. Gói gì cũng thơm.' },
      { id: 'dayNguSac',     name: 'Dây Ngũ Sắc',      icon: '🪢', desc: 'Vòng chỉ năm màu bện tay. Đeo vào cổ tay, tà khí đi vòng.' },
      { id: 'botHungHoang',  name: 'Bột Hùng Hoàng',   icon: '🟡', desc: 'Đĩa bột vàng hăng nồng. Rắn rết ngửi thấy là quay đầu.' },
      { id: 'guongSenVang',  name: 'Gương Sen Vàng',   icon: '🌻', desc: 'Gương sen già hạt căng mẩy. Bẻ một hạt, thơm cả buổi.' },
      { id: 'vayThuyenRong', name: 'Vảy Thuyền Rồng',  icon: '🛶', desc: 'Mảnh sơn đỏ tróc từ mạn thuyền đua. Còn ngấm tiếng trống hội.' },
      { id: 'xuongBoChi',    name: 'Xương Bồ Chi',     icon: '🌿', desc: 'Gốc xương bồ ngàn năm lá sắc như kiếm. Treo trước cửa, quỷ không dám vào.' },
    ],
    quai: [
      { id: 'cuaCangDo', name: 'Cua Càng Đỏ', icon: '🦀', affinity: 'Thủy Tộc', lore: 'Cua bò lên bến kiếm ăn, càng đỏ au, gặp người là giương lên doạ.',
        atkFl: 'kẹp một càng', skill: { name: 'Song Kiềm Toả', mult: 1.6, cd: 4, fl: 'giương đôi càng đỏ kẹp chặt không nhả' } },
      { id: 'thuyXaHungHoang', name: 'Thủy Xà Hùng Hoàng', icon: '🐍', affinity: 'Độc Xà', lore: 'Rắn nước uống nhầm rượu hùng hoàng, vảy vàng khè, nọc độc hơn gấp bội.',
        atkFl: 'mổ một nhát', skill: { name: 'Tuý Xà Giảo', mult: 1.7, cd: 4, fl: 'lảo đảo hơi men rồi mổ nhanh gấp ba' } },
      { id: 'trauNuocDamSen', name: 'Trâu Nước Đầm Sen', icon: '🐃', affinity: 'Thủy Ngưu', lore: 'Trâu đầm mình dưới sen cả trăm năm, sừng nó quấn đầy ngó sen mọc thành rễ.',
        atkFl: 'hất một sừng', skill: { name: 'Đầm Sen Quật', mult: 1.6, cd: 5, fl: 'trồi lên khỏi đầm kéo theo cả mảng sen quật xuống' } },
      { id: 'nguDocYeu', name: 'Ngũ Độc Yêu', icon: '🦂', affinity: 'Ngũ Độc', lore: 'Rắn, rết, bọ cạp, thạch sùng và cóc hợp lại làm một thân — thứ mà cả ngày Đoan Ngọ sinh ra để trừ.',
        atkFl: 'phóng một tia độc', skill: { name: 'Ngũ Độc Phún', mult: 1.8, cd: 5, fl: 'năm cái miệng cùng phun năm dòng độc chụm một điểm' } },
    ],
    boss: [
      { id: 'yvXichLongChu', name: 'Xích Long Chu', icon: '🛶', affinity: 'Yêu Vương · Long Chu', lv: 10,
        lore: 'Chiếc thuyền rồng đỏ đua thắng trăm mùa, gỗ nó ngậm đủ tiếng trống và tiếng hò mà hoá long.',
        atkFl: 'rẽ nước đâm tới', skill: { name: 'Phá Lãng Xung Phong', mult: 2.2, cd: 5, fl: 'dựng mũi thuyền thành đầu rồng xé sóng lao thẳng' } },
      { id: 'yvNguDocVuong', name: 'Ngũ Độc Chi Vương', icon: '🦂', affinity: 'Yêu Vương · Ngũ Độc', lv: 60,
        lore: 'Chúa tể của năm loài độc, ngồi giữa đầm nước đục, hơi thở đi tới đâu sen héo tới đó.',
        atkFl: 'vung đuôi độc quét', skill: { name: 'Ngũ Độc Câu Phát', mult: 2.8, cd: 6, fl: 'rắn rết bọ cạp dưới trướng đồng loạt xông lên' } },
    ],
    biCanh: [
      { id: 'lienHoaDang', name: 'Liên Hoa Đãng', seal: '蓮', lv: 25, hazard: 'sinhLuc', hazardName: 'Chướng Khí Đầm Sen',
        theme: 'Đầm sen mênh mông', color: '#facc15', boss: 'Cửu Khúc Liên Yêu',
        lore: 'Đầm sen mênh mông, lá to bằng chiếc thuyền, dưới nước có gì đó đang bơi theo.' },
      { id: 'longChuThuyCung', name: 'Long Chu Thủy Cung', seal: '龍', lv: 70, hazard: 'thanPhap', hazardName: 'Xoáy Nước Đáy Sông',
        theme: 'Thủy cung thuyền chìm', color: '#22d3ee', boss: 'Thủy Cung Long Nô',
        lore: 'Cung điện dưới đáy sông, cột chống là mái chèo của những chiếc thuyền đã chìm.' },
    ],
    phuKien: { boi: 'Đoan Dương Bội', an: 'Ngũ Độc Ấn' },
    pet: { base: 'xichDiemLongCau', name: 'Xích Diễm Long Câu', he: 'hoa', emoji: '🐉', role: 'Bạo Phát', tuTru: 'lucDao',
      stats: { congKich: 10, hoThe: 3, sinhLuc: 18, neTranh: 4, menhTrung: 5 },
      passive: { name: 'Dương Cực', desc: 'Giữa trưa hè dương khí thịnh nhất — sát thương tuyệt kĩ Linh Thú tăng 35%.', dmgBonus: 0.35 },
      active: { name: 'Liệt Dương Trảm', cd: 4, mult: 1.9, desc: 'Gom nắng trưa vào một vó, giáng xuống như chém.' },
      loreTrung: 'Trứng đỏ sậm nứt vân lửa của Xích Diễm Long Câu. Ấp nở ra long câu bờm lửa.' },
    monAn: { id: 'banhUTro', name: 'Bánh Ú Tro', icon: '🍙', desc: 'Bánh ú gói lá tre, ruột hổ phách trong veo. Mát ruột giữa trưa nắng.' },
    danhHieu: { id: 'doanDuongKhach', name: 'Đoan Dương Khách' },
    avatar: ['sk_doanngo_nam', 'sk_doanngo_nu'], cover: 'cover_sk_doanngo',
    quay: { ten: 'Bến Thuyền Rồng', chu: 'Lão Chèo Đò' },
  },

  // ================= 4. VU LAN =================
  {
    ma: 'vuLan', ten: 'Sự Kiện Vu Lan', thang: 8, icon: '🏮', color: '#818cf8',
    charHan: '燈', avColor: 'from-indigo-600 to-rose-800',
    moTa: 'Rằm tháng Bảy, hoa đăng trôi thành dòng lửa trên Vong Xuyên — bên kia bờ có người đứng đợi.',
    loc: { id: 'vongXuyenNgan', name: 'Vong Xuyên Ngạn', gloss: 'Bank of the Forgetting River', icon: '🕯️',
      desc: 'Bờ Vong Xuyên đêm rằm tháng Bảy: hoa đăng trôi thành dòng lửa, bỉ ngạn đỏ kín bờ, sương lạnh sát mặt nước.' },
    skill: { id: 'thaiDang', name: 'Thái Đăng', gloss: 'Vớt hoa đăng trôi sông', icon: '🏮' },
    hanhDong: ['Vớt Đăng Trôi', 'Gom Tro Vàng Mã', 'Hái Bỉ Ngạn', 'Thu Hồn Hoả', 'Gạn Nước Vong Xuyên', 'Trích Mảnh Tam Sinh Thạch'],
    vatPham: [
      { id: 'hoaDangGiay',      name: 'Hoa Đăng Giấy',       icon: '🏮', desc: 'Đăng giấy hình sen còn cháy dở. Ai thả nó đã sang bờ bên kia.' },
      { id: 'troVangMa',        name: 'Tro Vàng Mã',         icon: '🪙', desc: 'Nhúm tro còn sót góc giấy vàng. Của gửi đi chưa chắc tới nơi.' },
      { id: 'biNganHoa',        name: 'Bỉ Ngạn Hoa',         icon: '🌺', desc: 'Đoá bỉ ngạn không lá. Hoa nở không thấy lá, lá mọc không thấy hoa.' },
      { id: 'honHoaLam',        name: 'Hồn Hoả Lam',         icon: '🔵', desc: 'Ngọn lửa lam cháy không cần củi. Lại gần thì lạnh chứ không ấm.' },
      { id: 'vongXuyenThuy',    name: 'Vong Xuyên Thủy',     icon: '🫗', desc: 'Bình nước đen gạn từ Vong Xuyên. Mặt nước phản chiếu người khác, không phải mình.' },
      { id: 'manhTamSinhThach', name: 'Mảnh Tam Sinh Thạch', icon: '🪨', desc: 'Mảnh đá khắc tên đã mòn. Ba đời trước đọc được, đời này thì không.' },
    ],
    quai: [
      { id: 'doiGiay', name: 'Dơi Giấy', icon: '🦇', affinity: 'Chỉ Yêu', lore: 'Vàng mã đốt dở bay lên, gặp gió thì thành đàn dơi giấy chao qua chao lại.',
        atkFl: 'sà xuống cào', skill: { name: 'Chỉ Dực Loạn Vũ', mult: 1.6, cd: 4, fl: 'cả đàn giấy cháy dở ập xuống cùng lúc' } },
      { id: 'coHonLangThang', name: 'Cô Hồn Lang Thang', icon: '👻', affinity: 'Cô Hồn', lore: 'Hồn không ai cúng, cả năm đói khát, rằm tháng Bảy mới được ra ngoài một bận.',
        atkFl: 'vươn tay lạnh chộp', skill: { name: 'Ngạ Quỷ Đoạt Thực', mult: 1.7, cd: 4, fl: 'đói quá hoá liều, lao thẳng vào giành giật' } },
      { id: 'nguuDauTuong', name: 'Ngưu Đầu Tướng', icon: '🐂', affinity: 'Âm Sai', lore: 'Quỷ sứ đầu trâu canh bờ sông, tay cầm chĩa ba, chưa từng để sót một hồn nào.',
        atkFl: 'đâm một chĩa', skill: { name: 'Tam Xoa Trấn Hồn', mult: 1.6, cd: 5, fl: 'cắm chĩa ba xuống đất, âm khí dựng thành tường' } },
      { id: 'maDienTuong', name: 'Mã Diện Tướng', icon: '🐴', affinity: 'Âm Sai', lore: 'Quỷ sứ mặt ngựa đi cùng Ngưu Đầu, nó không bắt hồn — nó đọc tên hồn.',
        atkFl: 'phất một quyển sổ', skill: { name: 'Điểm Danh Lục', mult: 1.8, cd: 5, fl: 'mở sổ đọc đúng tên ngươi, chưa đọc hết đã thấy nặng vai' } },
    ],
    boss: [
      { id: 'yvDeDangQuySu', name: 'Đề Đăng Quỷ Sứ', icon: '🏮', affinity: 'Yêu Vương · Quỷ Sứ', lv: 10,
        lore: 'Quỷ xách đèn soi đường cho hồn mới, ai nhìn thẳng vào đèn thì quên mất mình là ai.',
        atkFl: 'giơ đèn soi thẳng', skill: { name: 'Dẫn Hồn Đăng', mult: 2.2, cd: 5, fl: 'nâng đèn lên quá đầu, ánh sáng trắng nuốt hết bóng người' } },
      { id: 'yvManhBa', name: 'Mạnh Bà', icon: '🍵', affinity: 'Yêu Vương · Vong Tình', lv: 60,
        lore: 'Bà lão nấu canh quên bên cầu Nại Hà, nồi canh sôi suốt ngàn năm chưa từng cạn.',
        atkFl: 'hắt một muôi canh', skill: { name: 'Nhất Oản Vong Tình', mult: 2.8, cd: 6, fl: 'múc một chén đầy, mùi canh bay tới đâu ký ức rơi tới đó' } },
    ],
    biCanh: [
      { id: 'biNganHoaHai', name: 'Bỉ Ngạn Hoa Hải', seal: '彼', lv: 25, hazard: 'sinhLuc', hazardName: 'Hoa Hương Đoạt Phách',
        theme: 'Biển hoa đỏ không lá', color: '#818cf8', boss: 'Bỉ Ngạn Hoa Linh',
        lore: 'Biển hoa đỏ không một chiếc lá, đi giữa đó thì không nghe được tiếng chân mình.' },
      { id: 'naiHaKieu', name: 'Nại Hà Kiều', seal: '奈', lv: 70, hazard: 'linhXao', hazardName: 'Sương Quên Nại Hà',
        theme: 'Cầu đá sang cõi khác', color: '#a5b4fc', boss: 'Thủ Kiều Âm Tướng',
        lore: 'Cây cầu đá bắc qua Vong Xuyên, một đầu là dương gian, đầu kia không ai kể lại được.' },
    ],
    phuKien: { boi: 'Vong Xuyên Bội', an: 'Tam Sinh Ấn' },
    pet: { base: 'uMinhMieu', name: 'U Minh Miêu', he: 'tho', emoji: '🐈‍⬛', role: 'Ẩn Nặc', tuTru: 'linhXao',
      stats: { congKich: 7, hoThe: 4, sinhLuc: 19, neTranh: 8, menhTrung: 7 },
      passive: { name: 'Âm Hành', desc: 'Bước đi không tiếng — Né Tránh Linh Thú tăng 20%, cộng thẳng cho chủ.', statMul: { neTranh: 0.20 } },
      active: { name: 'Câu Hồn Trảo', cd: 3, mult: 1.4, healMul: 0.5, desc: 'Vuốt đen lướt qua, mang theo một phần sinh khí về cho chủ.' },
      loreTrung: 'Trứng đen tuyền của U Minh Miêu. Ấp nở ra linh miêu đi không để lại tiếng chân.' },
    monAn: { id: 'chaoThiThuc', name: 'Cháo Thí Thực', icon: '🥣', desc: 'Chén cháo trắng cúng thí thực. Người ăn ấm bụng, cô hồn no lòng.' },
    danhHieu: { id: 'doVongKhach', name: 'Độ Vong Khách' },
    avatar: ['sk_vulan_nam', 'sk_vulan_nu'], cover: 'cover_sk_vulan',
    quay: { ten: 'Sạp Vàng Mã Bên Sông', chu: 'Thầy Cúng Áo Xám' },
  },

  // ================= 5. TRUNG THU =================
  {
    ma: 'trungThu', ten: 'Sự Kiện Trung Thu', thang: 9, icon: '🌕', color: '#93c5fd',
    charHan: '月', avColor: 'from-sky-400 to-indigo-700',
    moTa: 'Đêm rằm tháng Tám, cầu Ngân Hà bắc xuống trần gian — lên Quảng Hàn Cung trước khi trăng lặn.',
    loc: { id: 'quangHanNguyetCanh', name: 'Quảng Hàn Nguyệt Cảnh', gloss: 'Moon Palace Realm', icon: '🌕',
      desc: 'Cung trăng lam bạc: quế thụ ngàn tuổi, đèn lồng trôi lơ lửng, bóng thỏ ngọc giã thuốc in trên vách đá.' },
    skill: { id: 'thaiNguyet', name: 'Thái Nguyệt', gloss: 'Hái ánh trăng', icon: '🌕' },
    hanhDong: ['Nhặt Đèn Trôi', 'Hái Quế Hoa', 'Đãi Nguyệt Ảnh', 'Lần Dấu Ngọc Thố', 'Giã Thuốc Cùng Ngọc Thố', 'Trích Quảng Hàn Chi'],
    vatPham: [
      { id: 'denLongRoi',      name: 'Đèn Lồng Rơi',      icon: '🏮', desc: 'Đèn giấy rơi nghiêng, nến còn leo lét. Rơi từ tay ai thì không rõ.' },
      { id: 'queHoa',          name: 'Quế Hoa',           icon: '🌼', desc: 'Chùm hoa quế vàng li ti. Thơm một góc cung trăng.' },
      { id: 'nguyetAnhSa',     name: 'Nguyệt Ảnh Sa',     icon: '✨', desc: 'Cát bạc lấp lánh như ánh trăng bị nghiền vụn. Nắm trong tay thì mát rượi.' },
      { id: 'ngocThoMao',      name: 'Ngọc Thố Mao',      icon: '🐇', desc: 'Nhúm lông thỏ ngọc trắng phát sáng. Thỏ thay lông, người nhặt lộc.' },
      { id: 'nguyetTinhDanSa', name: 'Nguyệt Tinh Đan Sa',icon: '🥣', desc: 'Bột thuốc giã cùng Ngọc Thố trong cối ngọc. Giã ngàn năm chưa xong một mẻ.' },
      { id: 'quangHanChi',     name: 'Quảng Hàn Chi',     icon: '🌿', desc: 'Nhánh quế chiết từ cây ngàn tuổi trên cung trăng. Vỏ phủ sương bạc không tan.' },
    ],
    quai: [
      { id: 'thoYeu', name: 'Thố Yêu', icon: '🐇', affinity: 'Nguyệt Thú', lore: 'Thỏ hoang lạc lên cung trăng, ăn nhầm thuốc rơi, lông mọc dài ra trắng lốp.',
        atkFl: 'đạp hai chân sau', skill: { name: 'Nguyệt Thố Đạp', mult: 1.6, cd: 4, fl: 'tung mình đạp liên hoàn như giã cối' } },
      { id: 'queHuongYeu', name: 'Quế Hương Yêu', icon: '🌼', affinity: 'Hương Linh', lore: 'Hương quế đọng lại ngàn năm thành hình người, thoảng qua là mê, hít sâu là ngã.',
        atkFl: 'phẩy một làn hương', skill: { name: 'Mê Hương Toả', mult: 1.7, cd: 4, fl: 'xoay người một vòng, hương quế đặc như sương phủ xuống' } },
      { id: 'ngocThiem', name: 'Ngọc Thiềm', icon: '🐸', affinity: 'Thiềm Thú', lore: 'Cóc ngọc ba chân ngồi giữa vũng trăng, da nó cứng hơn đá, nuốt vàng nhả bạc.',
        atkFl: 'phóng lưỡi cuốn', skill: { name: 'Thôn Kim Thổ Ngân', mult: 1.6, cd: 5, fl: 'nuốt một ngụm ánh trăng rồi phun ra thành mưa bạc sắc cạnh' } },
      { id: 'nguyetMaAnh', name: 'Nguyệt Ma Ảnh', icon: '🌑', affinity: 'Ảnh Ma', lore: 'Bóng tối bị ánh trăng bỏ sót, càng soi càng đậm, cuối cùng đứng dậy đi được.',
        atkFl: 'lướt qua cắt một đường', skill: { name: 'Ảnh Trảm', mult: 1.8, cd: 5, fl: 'tan vào bóng ngươi rồi chém ngược ra từ đó' } },
    ],
    boss: [
      { id: 'yvNgocThoNguyetSu', name: 'Ngọc Thố Nguyệt Sứ', icon: '🐇', affinity: 'Yêu Vương · Ngọc Thố', lv: 10,
        lore: 'Thỏ ngọc giã thuốc cho Hằng Nga, chày trong tay nó nặng bằng cả một quả núi.',
        atkFl: 'vung chày ngọc nện', skill: { name: 'Ngọc Chử Đảo Thiên', mult: 2.2, cd: 5, fl: 'nâng chày ngọc quá đầu giã xuống, bụi trăng bắn toé' } },
      { id: 'yvThaiAmThiemVuong', name: 'Thái Âm Thiềm Vương', icon: '🐸', affinity: 'Yêu Vương · Thiềm Vương', lv: 60,
        lore: 'Cóc chúa nuốt trăng, mỗi lần nó há miệng là mặt đất tối đi một khắc.',
        atkFl: 'táp một ngoạm bóng tối', skill: { name: 'Thôn Nguyệt', mult: 2.8, cd: 6, fl: 'há miệng nuốt luôn ánh trăng, cả chiến trường chìm vào đêm' } },
    ],
    biCanh: [
      { id: 'queAnhLam', name: 'Quế Ảnh Lâm', seal: '桂', lv: 25, hazard: 'linhXao', hazardName: 'Quế Ảnh Mê Trận',
        theme: 'Rừng quế bóng lồng bóng', color: '#93c5fd', boss: 'Quế Ảnh Chi Chủ',
        lore: 'Rừng quế bóng lồng bóng, đi mãi vẫn thấy cùng một gốc cây.' },
      { id: 'quangHanCungKhuyet', name: 'Quảng Hàn Cung Khuyết', seal: '廣', lv: 70, hazard: 'hoThe', hazardName: 'Hàn Khí Cung Khuyết',
        theme: 'Cung điện lạnh trên trăng', color: '#a5b4fc', boss: 'Quảng Hàn Cung Vệ',
        lore: 'Cung điện lạnh trên trăng, hành lang dài hun hút, không một hơi ấm nào.' },
    ],
    phuKien: { boi: 'Nguyệt Hoa Bội', an: 'Quảng Hàn Ấn' },
    pet: { base: 'ngocTho', name: 'Ngọc Thố', he: 'thuy', emoji: '🐇', role: 'Cát Tường', tuTru: 'linhXao',
      stats: { congKich: 5, hoThe: 4, sinhLuc: 22, neTranh: 8, menhTrung: 5 },
      passive: { name: 'Thiềm Cung Hộ', desc: 'Linh khí cung trăng hộ thân — gánh thay chủ thêm 10% sát thương mỗi trận.', absorb: 0.10 },
      active: { name: 'Ngọc Chử Đảo', cd: 3, mult: 1.3, healMul: 0.4, desc: 'Giã một chày ngọc, thuốc bắn ra hồi sức cho chủ.' },
      loreTrung: 'Trứng trắng ngà ánh ngọc của Ngọc Thố. Ấp nở ra linh thố cung trăng.' },
    monAn: { id: 'banhTrungThu', name: 'Bánh Trung Thu', icon: '🥮', desc: 'Bánh nướng nhân sen trứng muối. Cắt một góc, tròn một mùa trăng.' },
    danhHieu: { id: 'nguyetHaKhach', name: 'Nguyệt Hạ Khách' },
    avatar: ['sk_trungthu_nam', 'sk_trungthu_nu'], cover: 'cover_sk_trungthu',
    quay: { ten: 'Nguyệt Hạ Nhai', chu: 'Nguyệt Hạ Lão Nhân' },
  },

  // ================= 6. GIÁNG SINH =================
  {
    ma: 'giangSinh', ten: 'Sự Kiện Giáng Sinh', thang: 12, icon: '🔔', color: '#7dd3fc',
    charHan: '雪', avColor: 'from-cyan-400 to-slate-700',
    moTa: 'Rừng thông tuyết phủ, chuông đồng khẽ vang — cuối rừng có căn nhà gỗ còn khói bếp.',
    loc: { id: 'hanTungTuyetNguyen', name: 'Hàn Tùng Tuyết Nguyên', gloss: 'Frostpine Snowfield', icon: '🌲',
      desc: 'Rừng thông tuyết phủ lúc chạng vạng: đèn ấm treo trên cành, tuần lộc trắng đi thành hàng, chuông đồng khẽ vang.' },
    skill: { id: 'thaiTuyet', name: 'Thái Tuyết', gloss: 'Hái tuyết tinh', icon: '❄️' },
    hanhDong: ['Nhặt Quả Thông', 'Gỡ Mảnh Chuông Đồng', 'Vun Tuyết Tinh', 'Chặt Thông Xanh', 'Hứng Sương Băng', 'Trích Hàn Tùng Tủy'],
    vatPham: [
      { id: 'quaThongKho',    name: 'Quả Thông Khô',    icon: '🌰', desc: 'Quả thông khô vảy nở bung. Còn dính một dúm tuyết chưa tan.' },
      { id: 'manhChuongDong', name: 'Mảnh Chuông Đồng', icon: '🔔', desc: 'Mảnh chuông vỡ còn ngân được nửa tiếng. Nửa tiếng kia ai đó giữ.' },
      { id: 'tuyetTinh',      name: 'Tuyết Tinh',       icon: '❄️', desc: 'Bông tuyết sáu cánh không chịu tan. Soi lên có ánh xanh lam.' },
      { id: 'thongChiXanh',   name: 'Thông Chi Xanh',   icon: '🌲', desc: 'Cành thông tươi rỉ nhựa thơm. Treo lên cửa là thấy ấm nhà.' },
      { id: 'bangLoChau',     name: 'Băng Lộ Châu',     icon: '💠', desc: 'Giọt sương đóng băng trong vắt, giữa lõi khoá một ngôi sao giá.' },
      { id: 'hanTungTuy',     name: 'Hàn Tùng Tủy',     icon: '🪵', desc: 'Lõi tùng già ngàn vòng tuổi, sương giá mọc ra từ thớ gỗ. Lạnh mà không mục.' },
    ],
    quai: [
      { id: 'socTuyet', name: 'Sóc Tuyết', icon: '🐿️', affinity: 'Tuyết Thú', lore: 'Sóc lông trắng tha quả thông về tổ, ai lại gần là nó ném xuống đầu.',
        atkFl: 'ném một quả thông', skill: { name: 'Tùng Quả Liên Trịch', mult: 1.6, cd: 4, fl: 'dốc cả kho quả thông ném xối xả' } },
      { id: 'tuyetDongTu', name: 'Tuyết Đồng Tử', icon: '⛄', affinity: 'Tuyết Linh', lore: 'Người tuyết trẻ con nặn dở, đêm xuống thì tự gắn thêm tay mà chạy.',
        atkFl: 'lăn tới đâm sầm', skill: { name: 'Tuyết Cầu Trận', mult: 1.7, cd: 4, fl: 'lăn mình thành quả cầu tuyết mỗi lúc một to' } },
      { id: 'bangHung', name: 'Băng Hùng', icon: '🐻‍❄️', affinity: 'Băng Thú', lore: 'Gấu trắng ngủ đông bị đánh thức, bộ lông đóng băng thành một lớp giáp.',
        atkFl: 'tát một chưởng băng', skill: { name: 'Băng Giáp Chưởng', mult: 1.6, cd: 5, fl: 'đứng thẳng dậy giáng song chưởng phủ băng' } },
      { id: 'hanSuongYeu', name: 'Hàn Sương Yêu', icon: '🧊', affinity: 'Sương Linh', lore: 'Sương giá đọng trên cành thông đủ trăm mùa thì kết thành hình người, chạm vào là buốt tới xương.',
        atkFl: 'quét một tay sương', skill: { name: 'Bạch Sương Toả', mult: 1.8, cd: 5, fl: 'thổi một hơi, sương trắng đóng cứng từ chân lên' } },
    ],
    boss: [
      { id: 'yvBachGiacLocVuong', name: 'Bạch Giác Lộc Vương', icon: '🦌', affinity: 'Yêu Vương · Lộc Vương', lv: 10,
        lore: 'Tuần lộc gạc trắng dẫn đầu đàn, vó nó đạp lên tuyết mà không để lại vết.',
        atkFl: 'lao tới hất gạc', skill: { name: 'Tuyết Nguyên Đạp Phong', mult: 2.2, cd: 5, fl: 'phóng qua đầu ngươi, vó cuốn theo cả cơn lốc tuyết' } },
      { id: 'yvTuyetSonLaoNhan', name: 'Tuyết Sơn Lão Nhân', icon: '🎅', affinity: 'Yêu Vương · Tuyết Sơn', lv: 60,
        lore: 'Ông lão sống trong nhà gỗ cuối rừng, mỗi năm đúng một đêm gõ cửa từng nhà, và không ai nhớ mặt ông.',
        atkFl: 'quật một bao tải', skill: { name: 'Nhất Dạ Phong Tuyết', mult: 2.8, cd: 6, fl: 'mở miệng bao tải, cả một đêm bão tuyết trút ra từ đó' } },
    ],
    biCanh: [
      { id: 'tungTuyetKinh', name: 'Tùng Tuyết Kính', seal: '松', lv: 25, hazard: 'hoThe', hazardName: 'Giá Rét Cắt Da',
        theme: 'Lối mòn tuyết ngập gối', color: '#7dd3fc', boss: 'Tuyết Kính Mê Linh',
        lore: 'Lối mòn giữa rừng thông, tuyết dày tới gối, đi được nửa đường thì mất dấu chân mình.' },
      { id: 'hanChungDien', name: 'Hàn Chung Điện', seal: '鐘', lv: 70, hazard: 'linhXao', hazardName: 'Chuông Đoạt Ký Ức',
        theme: 'Điện ngàn chuông băng', color: '#38bdf8', boss: 'Hàn Chung Chi Linh',
        lore: 'Điện thờ treo ngàn chiếc chuông băng, chuông nào vang lên thì một người quên mất một chuyện.' },
    ],
    phuKien: { boi: 'Tuyết Linh Bội', an: 'Hàn Chung Ấn' },
    pet: { base: 'bachLoc', name: 'Bạch Lộc', he: 'thuy', emoji: '🦌', role: 'Trợ Thủ', tuTru: 'hoThe',
      stats: { congKich: 4, hoThe: 7, sinhLuc: 28, neTranh: 5, menhTrung: 3 },
      passive: { name: 'Đạp Tuyết Vô Ngân', desc: 'Bước không dấu — Sinh Lực Linh Thú tăng 20%.', petHp: 0.20 },
      active: { name: 'Hàn Chung Nhất Kích', cd: 4, mult: 0.5, healMul: 1.7, desc: 'Lắc chuông trên gạc, tiếng ngân hồi sức cho chủ.' },
      loreTrung: 'Trứng trắng tuyết vân băng của Bạch Lộc. Ấp nở ra linh lộc gạc treo chuông.' },
    monAn: { id: 'banhGungMat', name: 'Bánh Gừng Mật', icon: '🍪', desc: 'Bánh gừng hình cây thông rưới mật. Cay ấm từ cổ xuống bụng.' },
    danhHieu: { id: 'tuyetDaKhach', name: 'Tuyết Dạ Khách' },
    avatar: ['sk_giangsinh_nam', 'sk_giangsinh_nu'], cover: 'cover_sk_giangsinh',
    quay: { ten: 'Quán Đèn Ấm', chu: 'Ông Lão Nhà Gỗ' },
  },
];
export const SU_KIEN_BY_MA = Object.fromEntries(SU_KIEN_DS.map((s) => [s.ma, s]));

/** Tên hiển thị của phụ kiện: 'boiSo' của Trung Thu -> 'Nguyệt Hoa Bội · Sơ'. */
export function tenPhuKien(ma, khoa) {
  const s = SU_KIEN_BY_MA[ma];
  if (!s || !khoa) return khoa || '';
  const ten = khoa.indexOf('boi') === 0 ? s.phuKien.boi : s.phuKien.an;
  return ten + (khoa.slice(-2) === 'So' ? ' · Sơ' : ' · Thượng');
}

// ---- Art phụ kiện: id ảnh suy TỪ TÊN, không gõ tay 24 chuỗi ----
// 'Xuân Huy Bội' + 'so' -> 'eq_sk_xuan_huy_boi_so' (art ở images/equip/).
// ⚠⚠ KHỐI NÀY PHẢI ĐỨNG TRƯỚC vòng `for (const sk of SU_KIEN_DS)` bên dưới: vòng đó gọi
//   artPhuKien để đặt id vật phẩm, mà `boDauSK` khai bằng `const` — để dưới là TDZ, cả tệp
//   data không nạp được và game trắng màn.
// ⚠ Phép suy này phải khớp TỪNG TỆP với docs/ART_SU_KIEN.md — _check_art_sukien đối chiếu cả 24.
const boDauSK = (s) => String(s == null ? '' : s)
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
export function artPhuKien(ma, loai, bac) {
  const s = SU_KIEN_BY_MA[ma];
  if (!s || !loai || !bac) return '';
  return 'eq_sk_' + boDauSK(loai === 'boi' ? s.phuKien.boi : s.phuKien.an).trim().replace(/\s+/g, '_') + '_' + bac;
}

// ============================================================
// QUẦY ĐỔI THƯỞNG (docs/THIET_KE_SU_KIEN.md Phần III)
//   Gian Trân Phẩm: theo TỪNG sự kiện (suy từ SU_KIEN_DS ở giao diện).
//   Bốn gian tiêu hao: DÙNG CHUNG mọi sự kiện — thứ game ĐÃ CÓ, sự kiện chỉ mở ĐƯỜNG VÀO.
// Giá trứng 3.000 là số tính: người chơi ít nhất (2 giờ/ngày = 3.224 điểm) vừa đủ mua con thú.
// ============================================================
export const QUAY_GIA = { trung: 3000, danhHieu: 3000, avatar: 1200, cover: 2000 };

// ⚠⚠ CÔNG TẮC ART ẢNH ĐẠI DIỆN / ẢNH BÌA — THEO TỪNG SỰ KIỆN, không phải một cờ chung.
// Ô ảnh ở Dung Mạo chỉ hiện khi TỆP ẢNH NẠP ĐƯỢC (`x-show="ok"` ở index.html, bật bởi @load của
// thẻ img). Thiếu art thì mua xong KHÔNG hiện ở đâu cả — người chơi mất 3.400 Điểm lấy hư không.
// ⇒ Vẽ xong ĐỦ BA TỆP của sự kiện nào (2 ảnh đại diện + 1 ảnh bìa) thì thêm mã sự kiện đó vào đây.
//   Một cờ chung thì bật cho Tết là bật luôn cho 5 sự kiện chưa có art — bán hư không.
// ⚠ Mục danh mục thì ĐÃ ghi danh sẵn bên dưới — thiếu mục thì art có thả vào cũng không bao giờ hiện.
export const CO_ART_DUNG_MAO = new Set(['tet']);
export const QUAY_TIEU_HAO = [
  { gian: 'Đan Dược',   ds: [
    { itemId: 'cuongNguyenDan', qty: 1, diem: 120 }, { itemId: 'bachBaoDan', qty: 1, diem: 130 },
    { itemId: 'ngoDaoDan', qty: 1, diem: 140 }, { itemId: 'duongThuDan', qty: 1, diem: 125 },
    { itemId: 'hoanHonDan', qty: 1, diem: 60 } ] },
  { gian: 'Trù Phòng',  ds: [
    { itemId: 'thienTriTan', qty: 1, diem: 90 }, { itemId: 'haiGiaoHam', qty: 1, diem: 65 },
    { monAnSuKien: true, qty: 1, diem: 12 } ] },   // món ăn riêng của sự kiện đang mở
  { gian: 'Linh Thạch', ds: [
    { itemId: 'tuKhiThachThuong', qty: 1, diem: 45 }, { itemId: 'boiSanThachThuong', qty: 1, diem: 52 },
    { itemId: 'thoiVanThachThuong', qty: 1, diem: 60 } ] },
  { gian: 'Tạp Hoá',    ds: [
    { itemId: 'daCuongHoaCao', qty: 5, diem: 400 },
    { tienTe: 'honThach', qty: 500, diem: 700 }, { tienTe: 'nguyenBao', qty: 100, diem: 2500 } ] },
];

// ============================================================
// TỰ GHI DANH vào các bảng gốc. Mọi thực thể mang `suKien: <ma>` để nơi khác lọc.
// ============================================================
for (const sk of SU_KIEN_DS) {
  const ma = sk.ma, locId = sk.loc.id;

  // ---- Vật phẩm sự kiện (6 bậc) — value 0: không bán ra Bạc, đóng sự kiện là bốc hơi ----
  sk.vatPham.forEach((v, i) => {
    ITEMS[v.id] = { id: v.id, name: v.name, icon: v.icon, type: 'suKien', quality: Q6[i], value: 0,
      suKien: ma, skBac: i + 1, desc: v.desc + ' Đổi Điểm Sự Kiện ở quầy ' + sk.quay.ten + '.' };
  });

  // ---- Kĩ năng sự kiện: 6 hành động, KHÔNG cộng Tứ Trụ (stat null / statXp 0) ----
  SKILLS[sk.skill.id] = {
    id: sk.skill.id, name: sk.skill.name, gloss: sk.skill.gloss, icon: sk.skill.icon,
    stat: null, suKien: ma,
    npc: { name: sk.quay.chu, quote: sk.moTa },
    actions: SK_BAC.map((b, i) => ({
      id: sk.vatPham[i].id, name: sk.hanhDong[i], gloss: sk.vatPham[i].name,
      itemId: sk.vatPham[i].id, zone: locId, reqLevel: b.gate, xp: b.xp, time: b.time, statXp: 0,
    })),
  };

  // ---- 4 quái: con cấp 1 VIẾT TAY khuôn Sói Hoang; 3 con sau mkQuai(25 nhanh · 55 trâu · 85 thường) ----
  const q = sk.quai;
  ENEMIES[q[0].id] = { id: q[0].id, name: q[0].name, gloss: '', icon: q[0].icon, reqLevel: 1, power: 15, exp: 5, statXp: 1, time: 6,
    hp: 60, atk: 9, def: 3, spd: 72, suKien: ma, affinity: q[0].affinity, lore: q[0].lore, atkFl: q[0].atkFl, skill: q[0].skill,
    loot: [{ itemId: sk.vatPham[0].id, chance: QUAI_ROI[0] }] };
  const mkCfg = [[25, 'nhanh'], [55, 'trau'], [85, 'thuong']];
  for (let i = 1; i < 4; i++) {
    const [lv, dang] = mkCfg[i - 1];
    ENEMIES[q[i].id] = mkQuai(lv, dang, { id: q[i].id, name: q[i].name, gloss: '', icon: q[i].icon, suKien: ma,
      affinity: q[i].affinity, lore: q[i].lore, atkFl: q[i].atkFl, skill: q[i].skill,
      loot: [{ itemId: sk.vatPham[i].id, chance: QUAI_ROI[i] }] });
  }

  // ---- 2 Yêu Vương: khuôn wb chép theo boss cùng cấp có sẵn (yvBachHo Lv10 · yvLoiBang Lv60).
  //      KHÔNG Tinh Thể, KHÔNG trứng, KHÔNG Mảnh — thưởng là Điểm + phụ kiện Bội (lần đầu). ----
  const WB_KHUON = { 10: { cdHours: 2, bac: 300, honThach: 20, diem: 20 }, 60: { cdHours: 7, bac: 4500, honThach: 170, diem: 90 } };
  sk.boss.forEach((b, i) => {
    const bossDef = mkQuai(b.lv, 'boss', { id: b.id, name: b.name, gloss: '', icon: b.icon, isBoss: true, suKien: ma,
      affinity: b.affinity, lore: b.lore, atkFl: b.atkFl, skill: b.skill });
    bossDef.wb = Object.assign({}, WB_KHUON[b.lv], { eggBase: null, eggs: [], tinhThe: 0,
      phuKien: { loai: 'boi', bac: i === 0 ? 'so' : 'thuong' } });
    YEU_VUONG.push(bossDef);
    YEU_VUONG_BY_ID[b.id] = bossDef;
  });

  // ---- 2 Bí Cảnh: khuôn số chép theo phó bản cùng cấp (hacPhongLam Lv25 · xichDiemDiaCung Lv70).
  //      KHÔNG Đồ Phổ, KHÔNG Mảnh — thưởng thêm là Điểm + phụ kiện Ấn (lần đầu thông quan). ----
  const BC_KHUON = {
    25: { durMs: 100 * MIN, pace: 0.8333, cost: { bac: 400 },
      loot: { bac: [200, 360], exp: 150, honThach: [4, 8] }, tangs: ['thuong', 'hazard', 'boss'], diem: 25 },
    70: { durMs: 135 * MIN, pace: 0.5625, cost: { bac: 3500, honThach: 20 },
      loot: { bac: [900, 1500], exp: 1050, honThach: [18, 30] }, tangs: ['thuong', 'hazard', 'tinhAnh', 'kyNgo', 'boss'], diem: 70 },
  };
  sk.biCanh.forEach((d, i) => {
    const K = BC_KHUON[d.lv];
    const lieu = i === 0 ? [sk.vatPham[0].id, sk.vatPham[1].id, sk.vatPham[2].id]
                         : [sk.vatPham[3].id, sk.vatPham[4].id, sk.vatPham[5].id];
    const def = { id: d.id, name: d.name, gloss: '', seal: d.seal, suKien: ma,
      reqLevel: d.lv, realm: sk.ten, loc: locId, theme: d.theme, color: d.color, lore: d.lore,
      mobs: [sk.quai[i === 0 ? 0 : 2].name, sk.quai[i === 0 ? 1 : 3].name], boss: d.boss,
      tangs: K.tangs, durMs: K.durMs, pace: K.pace, cost: K.cost,
      diem: K.diem, phuKien: { loai: 'an', bac: i === 0 ? 'so' : 'thuong' },
      loot: { bac: K.loot.bac, exp: K.loot.exp, honThach: K.loot.honThach, lieu, da: [], rare: [] } };
    DUNGEONS.push(def);
    DUNGEON_BY_ID[d.id] = def;
    DUNGEON_IDS.push(d.id);
  });

  // ---- Bản đồ sự kiện: vùng thứ 11, chỉ hiện khi sự kiện mở (UI lọc theo cờ) ----
  // ⚠⚠ TOẠ ĐỘ (25,49) ĐO BẰNG DIỆN TÍCH ĐÈ NHAU THẬT, không đo bằng khoảng cách giữa hai chấm.
  //   Hai lần trước sai vì đo nhầm thứ:
  //     (12,58) đè bảng Tầng Cảnh Giới · (34,35) đè nhãn U Lâm 5.810 px² + Phù Không Hoa Viên
  //     4.071 px² + Lam Linh Cốc 3.388 px².
  //   Chấm KHÔNG phải một điểm: cụm gồm đảo 7,5rem + thẻ tên + thẻ Lv, đo được 151×180 px.
  //   Đo lại bằng `_mockup/_tet_map_do.html` (quét cả khung, đối chiếu 10 vùng gốc + bảng Tầng
  //   Cảnh Giới + dải chú thích): (25,49) đè 34 px² — bản đồ GỐC vốn đã có cặp đè 208 px²
  //   (Huyền Đô / Phù Không Hoa Viên), nên 34 là dưới mức nền.
  // ⚠ Cả sáu bản đồ dùng CHUNG toạ độ này — được, vì mỗi lúc chỉ MỘT bản đồ sự kiện hiện
  //   (locHienThi lọc theo suKienDangChay, xem main.js).
  LOCATIONS.push({ id: locId, name: sk.loc.name, gloss: sk.loc.gloss, reqLevel: 1, icon: sk.loc.icon,
    mapX: 25, mapY: 49, desc: sk.loc.desc, suKien: ma, enemies: sk.quai.map((x) => x.id) });

  // ---- Linh Thú giới hạn: MỘT phẩm chất (trứng `_linh` = tinhPham). Trứng GIỮ sau sự kiện. ----
  PET_SPECIES[sk.pet.base] = { base: sk.pet.base, name: sk.pet.name, he: sk.pet.he, emoji: sk.pet.emoji,
    role: sk.pet.role, tuTru: sk.pet.tuTru, stats: sk.pet.stats, suKien: ma };
  PET_SKILLS[sk.pet.base] = { passive: sk.pet.passive, active: sk.pet.active };
  ITEMS['egg_' + sk.pet.base + '_linh'] = { id: 'egg_' + sk.pet.base + '_linh', name: sk.pet.name + ' Noãn · Hiếm',
    icon: '🥚', type: 'trung', quality: 'tinhPham', value: 450, petBase: sk.pet.base, desc: sk.pet.loreTrung };

  // ---- Món ăn riêng: hồi 25% Sinh Lực, mua ở quầy, GIỮ sau sự kiện ----
  ITEMS[sk.monAn.id] = { id: sk.monAn.id, name: sk.monAn.name, icon: sk.monAn.icon, type: 'monan',
    quality: 'luongPham', value: 30, healPct: 25, desc: sk.monAn.desc };

  // ---- PHỤ KIỆN = VẬT PHẨM THẬT, mang được, lắp/tháo được (user chốt 2026-08-08) ----
  // Trước đây là CỜ ĐÁNH DẤU trong save, hạ boss lần đầu là tự có. Nay rơi 0,5% và nằm trong
  // túi gear như mọi trang bị khác — cùng một đường equip/unequip, không đẻ đường riêng.
  // ⚠ Id PHẢI trùng tên tệp art (artPhuKien) — cả bảng ICON_FOLDERS lẫn ART_SU_KIEN.md neo vào đó.
  // ⚠ `value: 0` -> KHÔNG bán được. Rơi 0,5% mà lỡ tay bán hàng loạt thì mất trắng cả đợt.
  // ⚠ GIỮ sau khi sự kiện đóng (như trứng, món ăn). Chúng chỉ có tác dụng trong bản đồ sự kiện
  //   của chính nó, nên giữ lại không phá cân bằng — mà bốc hơi một món 0,5% thì quá tàn.
  for (const loai of ['boi', 'an']) for (const bac of ['so', 'thuong']) {
    const id = artPhuKien(ma, loai, bac);
    const ten = tenPhuKien(ma, loai + (bac === 'thuong' ? 'Thuong' : 'So'));
    const pct = loai === 'boi' ? PHU_KIEN_EFF[loai + (bac === 'thuong' ? 'Thuong' : 'So')]
                               : PHU_KIEN_EXP[loai + (bac === 'thuong' ? 'Thuong' : 'So')];
    ITEMS[id] = { id, name: ten, icon: loai === 'boi' ? '📿' : '🔮', type: 'skPhuKien',
      quality: bac === 'thuong' ? 'tuyetPham' : 'tinhPham', value: 0, suKien: ma, khongBocHoi: true,
      pkLoai: loai, pkBac: bac,
      equip: { slot: loai === 'boi' ? 'skBoi' : 'skAn', reqLevel: 1, itemLv: 1 },
      desc: (loai === 'boi' ? 'Tăng ' + Math.round(pct * 100) + '% hiệu suất' : 'Tăng ' + Math.round(pct * 100) + '% kinh nghiệm')
        + ' kĩ năng ' + sk.skill.name + '. Chỉ hiệu lực trong ' + sk.loc.name + '.' };
  }

  // ---- Ảnh đại diện + ảnh bìa: GHI DANH MỤC ngay, kể cả khi chưa có art.
  //      Thiếu mục thì sau này thả art vào cũng không bao giờ hiện, vì picker lọc theo AVATARS/COVERS.
  //      Bày ra quầy hay chưa thì do CO_ART_DUNG_MAO quyết định (xem ghi chú ở hằng số đó).
  AVATARS.push({ id: sk.avatar[0], name: sk.ten + ' · Nam', char: sk.charHan, color: sk.avColor, suKien: ma });
  AVATARS.push({ id: sk.avatar[1], name: sk.ten + ' · Nữ',  char: sk.charHan, color: sk.avColor, suKien: ma });
  COVERS.push({ id: sk.cover, name: sk.loc.name, char: sk.charHan, color: sk.avColor, suKien: ma });

  // ---- Danh hiệu: mua ở quầy, KHÔNG cộng chỉ số (thuần trang trí — sự kiện không đẻ sức mạnh) ----
  TITLES.push({ id: sk.danhHieu.id, name: sk.danhHieu.name, q: 'tinhPham', loai: 'suKien', bonus: {},
    cond: { kind: 'suKienQuay' }, src: 'Đổi 3.000 Điểm ở quầy ' + sk.quay.ten, suKien: ma });
}
ITEM_TYPES.suKien = 'Sự Kiện';
ITEM_TYPES.skPhuKien = 'Phụ Kiện Sự Kiện';
TITLE_LOAI.suKien = 'Sự Kiện';
/** Tỉ lệ rơi phụ kiện — user chốt 0,5% (2026-08-08). Yêu Vương thả Bội, Bí Cảnh thả Ấn. */
export const PHU_KIEN_ROI = 0.005;

// Tra cứu nhanh
export const SU_KIEN_SKILL_IDS = SU_KIEN_DS.map((s) => s.skill.id);
export const SU_KIEN_LOC_BY_MA = Object.fromEntries(SU_KIEN_DS.map((s) => [s.ma, s.loc.id]));
export function diemChoVat(itemId, soVat) {
  const it = ITEMS[itemId];
  if (!it || !it.suKien || !it.skBac) return 0;
  return Math.floor(soVat / 10) * SK_BAC[it.skBac - 1].diem10;   // đổi theo BÓ 10, phần lẻ giữ lại
}
export const SU_KIEN_ART_PHU_KIEN = SU_KIEN_DS.flatMap((s) =>
  ['boi', 'an'].flatMap((loai) => ['so', 'thuong'].map((bac) => artPhuKien(s.ma, loai, bac))));
