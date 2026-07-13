// ============================================================
// DATA — Kỳ Trận · Cửu Cung Trấn Yêu (mini-game match-3, side-content 0-power).
//   Bản đồ Bát Quái 9 Cung: mỗi Cung = 5 trận lâu la + 1 Cung Chủ.
//   Chiếm 8 Cung ngoài → mở Trung Cung Ma Đế.
//   art = tên file images/enemies/<art>.webp · scene = images/dungeons/<scene>.webp.
//   Số HP/ATK là DRAFT theo công thức (mob: 55+28*tier+12*i · boss: 190+80*tier) — tune sau.
// ============================================================

export const KT_CONST = {
  WEEK_CAP: 12,                 // lượt đánh/tuần cơ bản (Trảm Yêu Đài Động Phủ sẽ cộng thêm sau)
  UP_BASE: 100, UP_PER_LV: 45,  // giá nâng 1 Hành = UP_BASE + lv*UP_PER_LV (Trận Hồn)
  CUNG_HON: 300,                // Trận Hồn thưởng khi chiếm trọn 1 Cung
  HERO_HP: 150, HERO_KHI: 100,
  TRUNG_MULT: [1, 2.4, 5],      // hệ số HP/ATK địch theo Trùng 1/2/3 (NG+)
};

// Vòng Tương Sinh: Mộc → Hỏa → Thổ → Kim → Thủy → Mộc
export const KT_HANH_ORDER = ['moc', 'hoa', 'tho', 'kim', 'thuy'];
// Tương Khắc: [a khắc b]
export const KT_KHAC = [['thuy', 'hoa'], ['hoa', 'kim'], ['kim', 'moc'], ['moc', 'tho'], ['tho', 'thuy']];

// ============================================================
// NGŨ HÀNH TRẬN NHÃN — 5 Hành đầu tư Trận Hồn (quote + mốc đã duyệt).
//   perLv: hiệu ứng mỗi cấp · m: [cấp, mô tả, 1=mốc tối thượng]
// ============================================================
export const KT_HANH = {
  moc: {
    nm: 'Mộc', han: '木', c: '#45a877', role: 'Ô Tâm — hồi phục & tái sinh',
    quote: 'Cỏ cháy lại xanh, thân tàn lại nở.',
    perLv: 'Hồi máu ô Tâm +6%/cấp',
    m: [[4, 'Hồi dư máu → tích thành Hộ Thuẫn'], [7, 'Đầu lượt hồi 3% Sinh Lực'], [10, 'Gục lần đầu → hồi 40% Sinh Lực', 1]],
  },
  hoa: {
    nm: 'Hỏa', han: '火', c: '#d05a54', role: 'Ô Hỏa/Kiếm — bạo phát & thiêu đốt',
    quote: 'Một đốm lửa nhỏ, thiêu vạn dặm khô.',
    perLv: 'Tỉ lệ bạo kích +2%/cấp (bạo ×1.6)',
    m: [[4, 'Xếp ≥4 ô Kiếm → thiêu địch 3 lượt'], [7, 'Địch đang cháy nhận +30% sát thương'], [10, 'Bạo kích ×2.4 và thiêu địch thêm', 1]],
  },
  tho: {
    nm: 'Thổ', han: '土', c: '#c39a4c', role: 'Ô Thuẫn — giáp & phản đòn',
    quote: 'Núi không dời, giáp không vỡ.',
    perLv: 'Phòng ngự ô Thuẫn +6%/cấp',
    m: [[4, 'Có Hộ Thuẫn → phản 25% sát thương bị chặn'], [7, 'Đầu lượt tích thêm Hộ Thuẫn'], [10, 'Miễn đòn nặng đầu tiên mỗi trận', 1]],
  },
  kim: {
    nm: 'Kim', han: '金', c: '#a9b6c4', role: 'Ô Kiếm — xuyên giáp & bạo kích',
    quote: 'Kiếm ra khỏi vỏ, tất thấy phân thắng bại.',
    perLv: 'Sát thương ô Kiếm +6%/cấp',
    m: [[4, 'Xếp ≥4 ô Kiếm → đòn ấy +50% sát thương'], [7, 'Đang có Hộ Thuẫn → bạo kích +25%'], [10, 'Đòn Kiếm kết liễu địch dưới 15% Sinh Lực', 1]],
  },
  thuy: {
    nm: 'Thủy', han: '水', c: '#3f9fb8', role: 'Ô Khí — sạc chiêu & kiểm soát',
    quote: 'Nước không tranh, mà thắng vạn vật.',
    perLv: 'Tụ Khí từ ô Khí +5%/cấp',
    m: [[4, 'Xếp ≥4 ô Khí → địch hoãn đòn 1 lượt'], [7, 'Dùng chiêu → sinh 2 ô Khí'], [10, 'Mỗi trận 1 lần nối lượt vượt giới hạn', 1]],
  },
};

// ============================================================
// 9 CUNG — thứ tự lưới 3×3 y mockup kytran_map.html (index 4 = Trung Cung).
//   hanh: hệ ngũ hành của Cung (Tương Khắc counter Cung Chủ) — theo bát quái;
//   Trung Cung = null (hỗn độn, không counter).
//   tier: độ khó 1→6. reward: hon + đúng 1 tâm pháp (tp) hoặc kỹ năng (sk).
//   Khởi đầu người chơi có sẵn: tp 'tuSa' + sk ['kiemKhi','hoanTinh','huyetSat'].
// ============================================================
export const KT_CUNG = [
  {
    id: 'thienCuong', tri: '☰', nm: 'Thiên Cương', he: 'Càn · Thiên', c: '#cbd5e1',
    scene: 'coMoKiemTong', hanh: 'kim', tier: 1,
    lore: 'Thiên môn thất thủ, thần tướng hóa yêu.',
    story: 'Cổ trận án ngữ trời cao, thiên cơ vận chuyển bất tận, phàm phu ngước nhìn cũng phải rợn tóc gáy. Thủ Vệ Thần Tướng vốn là thần binh giữ cửa Càn, tâm khiếu nhiễm ma mà hóa yêu, trấn thủ vạn năm — chỉ kẻ ngộ được lẽ Càn Khôn Nghịch Chuyển mới đủ tư cách bước qua.',
    boss: { art: 'thuVeThanTuong', nm: 'Thủ Vệ Thần Tướng', sub: 'Trùm Thiên Cương', epithet: 'thần binh giữ cửa Càn, nay đã nhiễm ma', hp: 270, atk: 15, heavyEvery: 4, heavyMul: 1.6 },
    mobs: [
      { art: 'thienBinh', nm: 'Thiên Binh Tàn Giáp', hp: 83, atk: 11 },
      { art: 'tinhLinh', nm: 'Tinh Linh Vẫn Quang', hp: 95, atk: 11 },
      { art: 'phuQuangDiep', nm: 'Phù Quang Điệp', hp: 107, atk: 12 },
      { art: 'thienCuongVe', nm: 'Thiên Cương Vệ', hp: 119, atk: 13 },
      { art: 'thienCuongVe', nm: 'Thiên Cương Vệ Trưởng', hp: 131, atk: 13 },
    ],
    reward: { hon: 300, tp: 'canKhon' },  // Càn Khôn Nghịch Chuyển — hợp cung Càn
  },
  {
    id: 'bangUyen', tri: '☵', nm: 'Băng Uyên', he: 'Khảm · Băng', c: '#22d3ee',
    scene: 'bangTamHanDam', hanh: 'thuy', tier: 2,
    lore: 'Vạn trượng hàn uyên, nhất niệm thành băng.',
    story: 'Nơi hàn khí ngưng tụ từ cõi hư vô, vạn trượng băng nguyên ẩn chứa thứ lực lượng có thể đóng băng cả thời gian lẫn linh hồn. Hàn Giao Vương, kẻ tu luyện Băng Mãng cổ pháp, trấn thủ nơi này hàng vạn năm, chờ kẻ đủ mạnh đến phá trận, đoạt lấy bí quyết Ngưng Sương Quyết.',
    boss: { art: 'hanGiaoVuong', nm: 'Hàn Giao Vương', sub: 'Trùm Băng Mãng', epithet: 'tu luyện Băng Mãng cổ pháp, trấn thủ vạn năm', hp: 350, atk: 18, heavyEvery: 4, heavyMul: 1.8 },
    mobs: [
      { art: 'tuyetLang', nm: 'Tuyết Lang Băng Nha', hp: 111, atk: 13 },
      { art: 'bangPhachDieu', nm: 'Băng Phách Điêu', hp: 123, atk: 14 },
      { art: 'giaoNhan', nm: 'Giao Nhân Hàn Uyên', hp: 135, atk: 14 },
      { art: 'hanGiao', nm: 'Hàn Giao Tiểu Mãng', hp: 147, atk: 15 },
      { art: 'tuyetLang', nm: 'Tuyết Lang Đầu Đàn', hp: 159, atk: 16 },
    ],
    reward: { hon: 300, sk: 'ngungSuong' },  // Ngưng Sương Quyết — băng đóng sương
  },
  {
    id: 'thachMa', tri: '☶', nm: 'Thạch Ma', he: 'Cấn · Thạch', c: '#d6a760',
    scene: 'luuVanDong', hanh: 'tho', tier: 3,
    lore: 'Thạch khai ma tỉnh, sơn băng địa liệt.',
    story: 'Lòng núi nứt toác, ma khí từ mạch đất trào lên nhuộm đen từng phiến nham thạch ngàn năm. Thạch Hùng Vương thân đúc bằng kim thạch bất hoại, mỗi bước đi đủ khiến sơn cốc rung chuyển — ai muốn đoạt Kim Cang Hộ Thể, trước hết phải phá được thân giáp đá của hắn.',
    boss: { art: 'hacHung', nm: 'Thạch Hùng Vương', sub: 'Trùm Hậu Thổ', epithet: 'thân đúc kim thạch, một bước rung sơn cốc', hp: 430, atk: 21, heavyEvery: 3, heavyMul: 1.7 },
    mobs: [
      { art: 'sonTru', nm: 'Sơn Trư Húc Thạch', hp: 139, atk: 16 },
      { art: 'daoTac', nm: 'Đạo Tặc Thạch Lũng', hp: 151, atk: 16 },
      { art: 'tinhThachQuai', nm: 'Thạch Quái Toái Nham', hp: 163, atk: 17 },
      { art: 'sonTacVuong', nm: 'Sơn Tặc Đầu Lĩnh', hp: 175, atk: 18 },
      { art: 'tinhThachQuai', nm: 'Tinh Thạch Cự Linh', hp: 187, atk: 18, heavyEvery: 4, heavyMul: 1.6 },
    ],
    reward: { hon: 300, tp: 'kimCang' },  // Kim Cang Hộ Thể — thân như kim thạch
  },
  {
    id: 'thuyQuai', tri: '☱', nm: 'Thủy Quái', he: 'Đoài · Thủy', c: '#60a5fa',
    scene: 'thanhVanCoc', hanh: 'thuy', tier: 2,
    lore: 'Ba đào nuốt nguyệt, hải tộc loạn cương.',
    story: 'Thủy vực mênh mông không thấy đáy, sóng dữ nuốt cả bóng trăng, hải tộc ẩn mình rình kẻ lữ khách lạc đường. Hải Yêu Chúa thống lĩnh vạn loài giao long, buông chướng khí khắp trận đồ, giữ chặt tuyệt học Ô Long Giao Tranh dưới lòng biển sâu.',
    boss: { art: 'haiYeu', nm: 'Hải Yêu Chúa', sub: 'Trùm Hải Tộc', epithet: 'thống lĩnh vạn giao long, ẩn dưới đáy sâu', hp: 350, atk: 18, heavyEvery: 4, heavyMul: 1.7 },
    mobs: [
      { art: 'giaoNhan', nm: 'Giao Nhân Trảo Ba', hp: 111, atk: 13 },
      { art: 'meVuYeu', nm: 'Vụ Yêu Hải Sương', hp: 123, atk: 14 },
      { art: 'saMang', nm: 'Hải Mãng Quyển Lãng', hp: 135, atk: 14 },
      { art: 'hanGiao', nm: 'Thủy Giao Phiên Ba', hp: 147, atk: 15 },
      { art: 'giaoNhan', nm: 'Giao Nhân Tế Ti', hp: 159, atk: 16 },
    ],
    reward: { hon: 300, sk: 'oLong' },  // Ô Long Giao Tranh — giao long thủy vực
  },
  {
    id: 'maDe', tri: '◉', nm: 'Ma Đế Điện', he: 'Trung Cung', c: '#c084fc',
    scene: 'thaiHuBiCanh', hanh: null, tier: 6,
    lore: 'Bát môn dĩ phá, ma đế lâm trần.',
    story: 'Bát môn đã phá, cửu cung quy nhất, điện các u minh mở ra giữa tâm trận đồ — nơi tận cùng của Kỳ Trận. Thiên Ma Yêu Đế tọa trấn ngai xương, thống ngự cả tám cõi yêu ma; chỉ kẻ đã trảm tận tám Cung Chủ mới đủ tư cách nghênh chiến, tranh đoạt Thái Cực Vô Cực.',
    boss: {
      art: 'coMaTo', nm: 'Thiên Ma Yêu Đế', sub: 'Trùm Cuối', epithet: 'tọa trấn ngai xương, thống ngự tám cõi yêu ma', hp: 720, atk: 32,
      heavyEvery: 3, heavyMul: 2.0, poisonEvery: 2, poisonK: 5, poisonDmg: 13,
    },
    mobs: [
      { art: 'hacYVe', nm: 'Hắc Y Ma Vệ', hp: 223, atk: 23 },
      { art: 'coMa', nm: 'Cổ Ma Tiên Phong', hp: 235, atk: 24 },
      { art: 'huyetPhucChau', nm: 'Huyết Phúc Độc Chu', hp: 247, atk: 24 },
      { art: 'dongUMinh', nm: 'U Minh Quỷ Ảnh', hp: 259, atk: 25, heavyEvery: 4, heavyMul: 1.6 },
      { art: 'huKhongThu', nm: 'Hư Không Ma Thú', hp: 271, atk: 26, heavyEvery: 3, heavyMul: 1.6 },
    ],
    reward: { hon: 300, tp: 'thaiCuc' },  // Thái Cực Vô Cực — phần thưởng tối thượng
  },
  {
    id: 'loiDinh', tri: '☳', nm: 'Lôi Đình', he: 'Chấn · Lôi', c: '#a78bfa',
    scene: 'thienCoDiTich', hanh: 'moc', tier: 4,
    lore: 'Lôi minh cửu tiêu, vạn vật phủ phục.',
    story: 'Cửu tiêu sấm dậy, thiên lôi giáng liên hồi, vạn vật trong trận phải cúi đầu phủ phục trước uy thế phá thiên. Cửu Tiêu Lôi Bằng vỗ cánh là sét đánh ngang trời, trấn giữ Ngũ Lôi Chính Pháp — chính khí trảm tà bậc nhất cửu cung.',
    boss: { art: 'vanDieu', nm: 'Cửu Tiêu Lôi Bằng', sub: 'Trùm Lôi Cầm', epithet: 'vỗ cánh gọi thiên lôi, uy chấn cửu tiêu', hp: 510, atk: 24, heavyEvery: 3, heavyMul: 1.8 },
    mobs: [
      { art: 'phuQuangDiep', nm: 'Điện Quang Điệp', hp: 167, atk: 18 },
      { art: 'tinhLinh', nm: 'Lôi Linh Toái Điện', hp: 179, atk: 19 },
      { art: 'bangPhachDieu', nm: 'Lôi Vũ Điêu', hp: 191, atk: 19 },
      { art: 'thienBinh', nm: 'Lôi Bộ Thiên Binh', hp: 203, atk: 20, heavyEvery: 4, heavyMul: 1.6 },
      { art: 'huKhongThu', nm: 'Lôi Ngục Cự Thú', hp: 215, atk: 21, heavyEvery: 3, heavyMul: 1.6 },
    ],
    reward: { hon: 300, sk: 'nguLoi' },  // Ngũ Lôi Chính Pháp — chính hệ Lôi
  },
  {
    id: 'coDia', tri: '☷', nm: 'Cổ Địa', he: 'Khôn · Địa', c: '#a3a3a3',
    scene: 'hacPhongLam', hanh: 'tho', tier: 3,
    lore: 'Hoàng sa táng cốt, cổ độc phệ tâm.',
    story: 'Cát vàng vùi lấp ngàn hài cốt, cổ độc luyện từ vạn xác chết gặm nhấm cả tâm trí kẻ lạc bước. Cổ Địa Ma Quân nuôi độc trùng trong huyết mạch, tẩm độc cả trận đồ — kẻ muốn học Hoá Độc Đại Pháp phải sống sót qua vạn độc phệ tâm.',
    boss: { art: 'luuSaQuy', nm: 'Cổ Địa Ma Quân', sub: 'Trùm Sa Quỷ', epithet: 'nuôi cổ độc trong huyết mạch, tẩm độc cả trận', hp: 430, atk: 21, poisonEvery: 2, poisonK: 4, poisonDmg: 11 },
    mobs: [
      { art: 'daLang', nm: 'Sa Lang Hoang Nguyên', hp: 139, atk: 16 },
      { art: 'saMang', nm: 'Sa Mãng Độc Nha', hp: 151, atk: 16 },
      { art: 'huyetPhucChau', nm: 'Độc Chu Kết Võng', hp: 163, atk: 17 },
      { art: 'coMa', nm: 'Cổ Trùng Ma Nô', hp: 175, atk: 18 },
      { art: 'saMang', nm: 'Cổ Mãng Vạn Độc', hp: 187, atk: 18, heavyEvery: 4, heavyMul: 1.6 },
    ],
    reward: { hon: 300, tp: 'hoaDoc' },  // Hoá Độc Đại Pháp — từ cung độc mà ra
  },
  {
    id: 'hoaDiem', tri: '☲', nm: 'Hỏa Diễm', he: 'Ly · Hỏa', c: '#fb7185',
    scene: 'xichDiemDiaCung', hanh: 'hoa', tier: 4,
    lore: 'Xích diễm liệt địa, vạn vật thành tro.',
    story: 'Lửa đỏ liếm đất, dung nham cuộn trào, vạn vật lọt vào đều hóa thành tro bụi trong chớp mắt. Hỏa Lân Vương thân phủ vảy hỏa lân, mỗi đòn nặng tựa núi lửa phun trào, giấu trong ngọn lửa nghìn năm tuyệt kỹ Hoàng Kim Nhất Kích.',
    boss: { art: 'hoaYeu', nm: 'Hỏa Lân Vương', sub: 'Trùm Hỏa Yêu', epithet: 'thân phủ hỏa lân, một đòn tựa núi lửa', hp: 510, atk: 24, heavyEvery: 3, heavyMul: 1.9 },
    mobs: [
      { art: 'daLang', nm: 'Viêm Lang Xích Diễm', hp: 167, atk: 18 },
      { art: 'phuQuangDiep', nm: 'Diễm Điệp Phần Vũ', hp: 179, atk: 19 },
      { art: 'tinhLinh', nm: 'Hỏa Linh Dung Nham', hp: 191, atk: 19 },
      { art: 'saMang', nm: 'Viêm Mãng Phún Diễm', hp: 203, atk: 20, heavyEvery: 4, heavyMul: 1.6 },
      { art: 'sonTru', nm: 'Hỏa Trư Cuồng Bôn', hp: 215, atk: 21, heavyEvery: 3, heavyMul: 1.6 },
    ],
    reward: { hon: 300, sk: 'hoangKim' },  // Hoàng Kim Nhất Kích — vàng ròng luyện trong lửa
  },
  {
    id: 'phongYeu', tri: '☴', nm: 'Phong Yêu', he: 'Tốn · Phong', c: '#34d399',
    scene: 'vanYeuSon', hanh: 'moc', tier: 5,
    lore: 'Phong khởi yêu sơn, mị ảnh mê tâm.',
    story: 'Gió cuốn khắp yêu sơn, ảo ảnh mê hoặc lòng người, khiến kẻ mạnh nhất cũng lạc trong mộng cảnh. Mị Ảnh Hồ Yêu tu thành chín đuôi, một ánh mắt đủ đảo lộn ngũ hành — kẻ đoạt được Ngũ Hành Đại Chuyển phải giữ vững tâm thần trước muôn trùng ảo thuật.',
    boss: { art: 'cuuViHoTien', nm: 'Mị Ảnh Hồ Yêu', sub: 'Trùm Hồ Tiên', epithet: 'hồ yêu chín đuôi, một liếc đảo ngũ hành', hp: 590, atk: 27, poisonEvery: 2, poisonK: 5, poisonDmg: 12 },
    mobs: [
      { art: 'yeuHo', nm: 'Yêu Hồ Tam Vĩ', hp: 195, atk: 21 },
      { art: 'meVuYeu', nm: 'Mê Vụ Yêu Cơ', hp: 207, atk: 21 },
      { art: 'huyenHo', nm: 'Huyền Hồ Ảo Ảnh', hp: 219, atk: 22 },
      { art: 'yeuHo', nm: 'Yêu Hồ Lục Vĩ', hp: 231, atk: 23, heavyEvery: 4, heavyMul: 1.6 },
      { art: 'huyenHo', nm: 'Huyền Hồ Bát Vĩ', hp: 243, atk: 23, heavyEvery: 3, heavyMul: 1.6 },
    ],
    reward: { hon: 300, sk: 'nguHanh' },  // Ngũ Hành Đại Chuyển — hồ tiên ảo hóa vạn vật
  },
];

// ============================================================
// TÂM PHÁP — chọn 1 khi Lập Trận (viết lại 1 luật bàn cờ).
//   Khởi đầu có 'tuSa'; 4 cái còn lại mở từ reward Cung.
// ============================================================
export const KT_TAM_PHAP = [
  { id: 'tuSa', name: 'Tụ Sa Thành Tháp', accent: '#f5b942', role: 'Tích Lũy', rule: 'Xóa càng nhiều ô trong một đòn, hiệu lực càng tăng vọt (một đòn 6 ô mạnh hơn hẳn hai đòn 3 ô). Tính tối đa 9 ô mỗi đòn.', lore: 'Tích cát vi sơn — nhất kích thiên quân.', counters: '' },
  { id: 'canKhon', name: 'Càn Khôn Nghịch Chuyển', accent: '#d4b45a', role: 'Sinh Hóa', rule: 'Ô mới rơi xuống thiên về loại kế trong vòng Ngũ Hành (Kiếm, Khí, Bảo, Tâm, Thuẫn), giúp chủ động gom chuỗi liên hoàn.', lore: 'Vạn vật tương sinh — diệt một, sinh một.', counters: '' },
  { id: 'hoaDoc', name: 'Hoá Độc Đại Pháp', accent: '#45a877', role: 'Dụng Độc', rule: 'Mỗi ô Độc của địch ngươi phá được nạp 1 Độc Tinh (tối đa 8). Đòn Kiếm kế cộng +4 sát thương mỗi Độc Tinh rồi xả sạch.', lore: 'Độc nhập ta tạng — hoàn lại kẻ gieo.', counters: 'poison' },
  { id: 'kimCang', name: 'Kim Cang Hộ Thể', accent: '#e8c877', role: 'Kiên Thủ', rule: 'Hộ Thuẫn không mất khi trúng đòn; mỗi lượt 25% Hộ Thuẫn dồn vào đòn Kiếm kế — càng thủ, phản đòn càng nặng.', lore: 'Thân như kim thạch — phản chấn bách địch.', counters: 'heavy' },
  { id: 'thaiCuc', name: 'Thái Cực Vô Cực', accent: '#c084fc', role: 'Vận Khí', rule: 'Tạo ô đặc biệt được +15 Khí; kích nổ hoặc Hợp Bích +8 Khí. Trần nối lượt liên tiếp tăng từ 2 lên 3.', lore: 'Nhất khí hóa tam thanh — trận trung sinh trận.', counters: '' },
];

// ============================================================
// KỸ NĂNG — chọn 3 khi Lập Trận (động từ: Khí / lượt-trận).
//   Khởi đầu có 'kiemKhi','hoanTinh','huyetSat'; 5 cái còn lại mở từ reward Cung.
// ============================================================
export const KT_SKILLS = [
  { id: 'kiemKhi', name: 'Kiếm Khí Trảm', kind: 'khi', cost: 100, tile: 'khi', icon: 'kiem', accent: '#2dd4bf', desc: 'Chém 55 sát thương thẳng vào địch và quét sạch một hàng ô ngang trên bàn.', lore: 'Khí tụ thành phong — kiếm khai nhất tuyến.', counters: '' },
  { id: 'hoanTinh', name: 'Hoán Tinh Di Đẩu', kind: 'charge', charges: 3, tile: null, icon: 'swap', accent: '#a78bfa', desc: 'Đổi chỗ hai ô bất kỳ trên bàn, không cần nằm kề — tự tay xếp combo.', lore: 'Dời sao đổi đẩu — càn khôn tại thủ.', counters: '' },
  { id: 'huyetSat', name: 'Huyết Sát', kind: 'khi', cost: 80, tile: 'kiem', icon: 'kiem', accent: '#fb7185', desc: 'Mỗi ô Kiếm trên bàn nổ: mỗi ô gây 4 sát thương và hồi 2 máu cho ngươi, rồi vỡ.', lore: 'Kiếm khát máu tanh — một chém hồi sinh.', counters: '' },
  { id: 'hoangKim', name: 'Hoàng Kim Nhất Kích', kind: 'stock', tile: 'bao', icon: 'bao', accent: '#f5b942', desc: 'Mỗi ô Bảo phá được dồn vào kho vàng; xả kho gây sát thương bằng số điểm đã tích — càng gom càng nặng.', lore: 'Vàng ròng đúc kiếm — một vựng nghìn lượng.', counters: '' },
  { id: 'nguHanh', name: 'Ngũ Hành Đại Chuyển', kind: 'charge', charges: 2, tile: null, icon: 'convert', accent: '#22d3ee', desc: 'Biến cả vùng 3×3 giữa bàn thành một loại ô tự chọn — tạo đại combo tức thì.', lore: 'Ngũ hành đại chuyển — sắc quy nhất thể.', counters: '' },
  { id: 'oLong', name: 'Ô Long Giao Tranh', kind: 'charge', charges: 2, tile: 'doc', icon: 'doc', accent: '#45a877', desc: 'Nếu địch có ô Độc: hóa hết thành ô Kiếm và phản độc về địch. Nếu không: gieo Độc lên địch.', lore: 'Rồng đen cản ngược — độc phản về nguồn.', counters: 'poison' },
  { id: 'ngungSuong', name: 'Ngưng Sương Quyết', kind: 'khi', cost: 50, tile: 'khi', icon: 'freeze', accent: '#7dd3fc', desc: 'Đóng băng địch: bỏ qua đòn đánh kế và lượt rải Độc kế của địch.', lore: 'Sương giăng vạn vật — tĩnh chỉ sát cơ.', counters: 'heavy' },
  { id: 'nguLoi', name: 'Ngũ Lôi Chính Pháp', kind: 'charge', charges: 1, tile: null, icon: 'bolt', accent: '#c084fc', desc: 'Giáng 8 sát thương lên mỗi ô đặc biệt rồi kích nổ tất cả, nổ dây chuyền Hợp Bích toàn bàn.', lore: 'Ngũ lôi oanh đỉnh — quần tà tận diệt.', counters: '' },
];

// Vòng sinh ô bàn cờ (dùng cho Tâm Pháp Càn Khôn Nghịch Chuyển)
export const KT_SINH = { kiem: 'khi', khi: 'bao', bao: 'tim', tim: 'khien', khien: 'kiem' };
