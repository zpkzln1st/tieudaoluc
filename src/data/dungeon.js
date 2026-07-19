// ============================================================
// DATA — BÍ CẢNH (Dungeon idle). 9 phó bản: treo theo thời gian -> sinh 5 tầng
// text-log + roll loot (liệu/đá/ĐỒ PHỔ rèn bậc 4-7/hiếm: boss-mầm·Tinh Thể).
// Engine tiêu thụ data này: src/engine/dungeon.js (runDungeon). Schema giữ "thuần data".
//
// Cơ chế (khớp docs/THIET_KE_YEUVUONG_BICANH.md mục D):
//   - Gate = Chiến Đấu Lv >= reqLevel.
//   - LỊCH LUYỆN: mỗi phó bản 1 thời lượng CỐ ĐỊNH/lượt (durMs, 1h30->3h). Người chơi đặt N lượt
//     (N*durMs <= trần treo máy). pace = giữ loot/giờ = "Treo Luyện" cũ khi rút thời lượng (durMs<treoMs cũ).
//   - 5 tầng: (1) quái thường (2) sự kiện/hazard (3) tinh anh (4) cơ duyên/bẫy/rương (5) boss.
//   - Stat-check Tứ Trụ: hazard (tầng 2) check theo `hazard`; tầng 4 cơ duyên engine tự chọn
//     stat tốt nhất của người chơi (lucDao cưỡng / linhXao khôn / thanPhap né). Combat tầng
//     so chiến lực (deriveCombat) vs `power` baseline (suy từ reqLevel).
//   - ĐỒ PHỔ (Model B): drop về túi (item dp_<gearId>); phó bản thấp (Lv10/25) KHÔNG rơi đồ phổ.
//
// Màu (color) = tông UI glow/viền theme (KHÔNG phải màu phẩm chất). seal = ấn Hán.
// ============================================================

const MIN = 60 * 1000;
const HR = 60 * MIN;

// 9 phó bản, xếp theo reqLevel tăng dần (rail UI cũng theo thứ tự này).
export const DUNGEONS = [
  {
    id: 'thanhVanCoc', name: 'Thanh Vân Cốc', gloss: 'Verdant Vale', seal: '青',
    reqLevel: 10, realm: 'Nhân Gian', loc: 'uLam', theme: 'Sơn lâm thanh u', color: '#34d399',
    hazard: 'thanPhap', hazardName: 'Lối Mòn Hiểm',
    lore: 'Sơn cốc xanh mướt, suối trong róc rách — chốn nhập môn của tân khách giang hồ.',
    mobs: ['Thanh Lang', 'Cẩm Mao Hổ'], boss: 'Thanh Mộc Lang Vương',
    tangs: ['thuong', 'coDuyen', 'boss'],
    durMs: 90 * MIN, pace: 1, cost: { bac: 120 },
    loot: {
      bac: [80, 160], exp: 60, honThach: [2, 5],
      lieu: ['tungMoc', 'trucMoc', 'langBi', 'caTuyet', 'thanhNgaiThao'],
      da: ['daCuongHoaSo'],
      doPho: { bac: [2], slots: ['riu', 'cuoc', 'canCau', 'duocLiem'] }, doPhoChance: 0.12, // Đồ Phổ công cụ bậc 2
      rare: [],
    },
  },
  {
    id: 'hacPhongLam', name: 'Hắc Phong Lâm', gloss: 'Black Gale Wood', seal: '瘴',
    reqLevel: 25, realm: 'Nhân Gian', loc: 'huyenDo', theme: 'Độc lâm chướng khí', color: '#84cc16',
    hazard: 'sinhLuc', hazardName: 'Độc Chướng',
    lore: 'Rừng đen phủ chướng khí tía lục, nấm độc phát quang giữa sương lam.',
    mobs: ['Độc Vụ Yểm', 'Lục Lân Mãng'], boss: 'Hắc Phong Độc Chu',
    tangs: ['thuong', 'hazard', 'boss'],
    durMs: 100 * MIN, pace: 0.8333, cost: { bac: 400 },
    loot: {
      bac: [200, 360], exp: 150, honThach: [4, 8],
      lieu: ['bachDuongMoc', 'dongKhoang', 'langBi', 'truNha', 'hoVi', 'tuDangHoa'],
      da: ['daCuongHoaSo', 'daCuongHoaTrung'],
      doPho: { bac: [3], slots: ['riu', 'cuoc', 'canCau', 'duocLiem'] }, doPhoChance: 0.12, // Đồ Phổ công cụ bậc 3
      rare: [{ itemId: 'saMangDam', chance: 0.04 }],
    },
  },
  {
    id: 'luuVanDong', name: 'Lưu Vân Động', gloss: 'Flowing Cloud Grotto', seal: '雲',
    reqLevel: 40, realm: 'Bí Cảnh', loc: 'thuyTinhDong', theme: 'Cuồng phong huyền động', color: '#22d3ee',
    hazard: 'thanPhap', hazardName: 'Cuồng Phong',
    lore: 'Động cao vách núi, mây gió cuồn cuộn — bẫy cơ quan rình kẻ chậm chân.',
    mobs: ['Phong Dực Điêu', 'Toàn Phong Hầu'], boss: 'Lưu Vân Phong Bằng',
    tangs: ['thuong', 'bay', 'tinhAnh', 'boss'],
    durMs: 110 * MIN, pace: 0.7333, cost: { bac: 1000, honThach: 5 },
    loot: {
      bac: [400, 700], exp: 360, honThach: [8, 16],
      lieu: ['phongMoc', 'thietKhoang', 'hungChuong', 'thuyTinhSa', 'thachHocLan'],
      da: ['daCuongHoaTrung'],
      doPho: { bac: [4], slots: ['giay', 'dai', 'trangSuc'] }, doPhoChance: 0.10,
      toolDoPho: { bac: 4, chance: 0.08 }, // Đồ Phổ công cụ bậc 4 (roll riêng, không loãng gear)
      rare: [{ itemId: 'huyenSa', chance: 0.05 }],
    },
  },
  {
    id: 'bangTamHanDam', name: 'Băng Tâm Hàn Đàm', gloss: 'Frostheart Pool', seal: '冰',
    reqLevel: 55, realm: 'Bí Cảnh', loc: 'langTieuPhong', theme: 'Hàn đàm băng động', color: '#38bdf8',
    hazard: 'thanPhap', hazardName: 'Hàn Khí Trói Buộc',
    lore: 'Đầm băng sâu lạnh thấu xương, hàn khí trói chặt gân cốt.',
    mobs: ['Hàn Phách Quỷ', 'Băng Tinh Giao'], boss: 'Hàn Đàm Băng Cơ',
    tangs: ['hazard', 'thuong', 'coDuyen', 'boss'],
    durMs: 120 * MIN, pace: 0.6667, cost: { bac: 2000, honThach: 12 },
    loot: {
      bac: [600, 1000], exp: 620, honThach: [12, 22],
      lieu: ['hanTung', 'hanThietKhoang', 'tuyetLangBi', 'bangLanNgu', 'hanThietTinh', 'tuyetLienHoa'],
      da: ['daCuongHoaTrung', 'daCuongHoaCao'],
      doPho: { bac: [4, 5], slots: ['gang', 'trangSuc'] }, doPhoChance: 0.05,
      toolDoPho: { bac: 5, chance: 0.06 }, // Đồ Phổ công cụ bậc 5 (roll riêng)
      rare: [],
    },
  },
  {
    id: 'xichDiemDiaCung', name: 'Xích Diệm Địa Cung', gloss: 'Crimson Flame Palace', seal: '焰',
    reqLevel: 70, realm: 'Tiên Cảnh', loc: 'meAoLucChau', theme: 'Địa hỏa cung điện', color: '#fb923c',
    hazard: 'hoThe', hazardName: 'Nhiệt Lực Thiêu Đốt',
    lore: 'Cung điện ngầm bên dòng dung nham, hơi nóng thiêu đốt tạng phủ.',
    mobs: ['Diệm Tinh', 'Hỏa Giáp Thần Tướng'], boss: 'Xích Diệm Hỏa Mẫu',
    tangs: ['thuong', 'hazard', 'tinhAnh', 'kyNgo', 'boss'],
    durMs: 135 * MIN, pace: 0.5625, cost: { bac: 3500, honThach: 20 },
    loot: {
      bac: [900, 1500], exp: 1050, honThach: [18, 30],
      lieu: ['hoangKimSa', 'hoangKimDinh', 'hacThan', 'huyenSa'],
      da: ['daCuongHoaCao'],
      doPho: { bac: [5], slots: ['vuKhi'] }, doPhoChance: 0.025,
      toolDoPho: { bac: 6, chance: 0.05 }, // Đồ Phổ công cụ bậc 6 (roll riêng)
      rare: [{ itemId: 'phuQuangPhan', chance: 0.05 }],
    },
  },
  {
    id: 'coMoKiemTong', name: 'Cổ Mộ Kiếm Tông', gloss: 'Ancient Sword Tomb', seal: '劍',
    reqLevel: 80, realm: 'Tiên Cảnh', loc: 'phuKhongVien', theme: 'Cổ mộ kiếm trận', color: '#a5b4fc',
    hazard: 'linhXao', hazardName: 'Kiếm Trận Vô Hình',
    lore: 'Cổ mộ ngàn kiếm cắm đá, kiếm khí lượn lờ trong mê trận.',
    mobs: ['Thủ Mộ Kiếm Nô', 'Kiếm Trủng Lão Hồn'], boss: 'Cổ Mộ Kiếm Hồn',
    tangs: ['thuong', 'bay', 'tinhAnh', 'coDuyen', 'boss'],
    durMs: 150 * MIN, pace: 0.5556, cost: { bac: 5000, honThach: 30 },
    loot: {
      bac: [1200, 2000], exp: 1600, honThach: [24, 40],
      lieu: ['vanThiet', 'vanMauThach', 'vanVuLong', 'tinhTuy', 'vanLoChi'],
      da: ['daCuongHoaCao'],
      doPho: { bac: [5, 6], slots: ['vuKhi', 'mu', 'giap'] }, doPhoChance: 0.012,
      toolDoPho: { bac: 7, chance: 0.04 }, // Đồ Phổ công cụ bậc 7 (roll riêng; sớm hơn Thái Hư, khớp cấp đeo 81)
      rare: [{ itemId: 'meVuHon', chance: 0.04 }],
    },
  },
  {
    id: 'vanYeuSon', name: 'Vạn Yêu Sơn', gloss: 'Myriad Demon Peak', seal: '妖',
    reqLevel: 85, realm: 'Tiên Cảnh', loc: 'quanTinhDai', theme: 'Yêu thú hoành hành', color: '#e879f9',
    hazard: 'sinhLuc', hazardName: 'Yêu Khí Ăn Mòn',
    lore: 'Núi yêu chạng vạng máu, mắt thú lập loè, yêu khí ngút trời.',
    mobs: ['Huyết Nha Lang', 'Cửu Anh Mãng Xà'], boss: 'Vạn Yêu Chi Vương',
    tangs: ['thuong', 'tinhAnh', 'hazard', 'thuong', 'tinhAnh', 'boss'],
    durMs: 160 * MIN, pace: 0.5333, cost: { bac: 6500, honThach: 40 },
    loot: {
      bac: [1400, 2200], exp: 2600, honThach: [28, 46],
      lieu: ['tinhHoaMoc', 'vanVuLong', 'tinhTuy', 'huKhongTinh', 'thatTinhThao'],
      da: ['daCuongHoaCao'],
      doPho: { bac: [6], slots: ['giap', 'mu'] }, doPhoChance: 0.006,
      chieuDoPho: { chance: 0.05 }, // Đồ Phổ Tuyệt Kĩ (chỉ ra cái chưa có) — DRAFT
      rare: [{ itemId: 'giaoChau', chance: 0.05 }, { itemId: 'hoPhuDauLinh', chance: 0.025 }],
    },
  },
  {
    id: 'thienCoDiTich', name: 'Thiên Cơ Di Tích', gloss: 'Heaven-Mechanism Ruins', seal: '機',
    reqLevel: 92, realm: 'Thần Vực', loc: 'tichNguDao', theme: 'Cổ trận cơ quan', color: '#5eead4',
    hazard: 'linhXao', hazardName: 'Cổ Trận Cơ Quan',
    lore: 'Di tích đại trận thất truyền, bánh răng đá quay giữa phù văn lưu quang.',
    mobs: ['Cơ Quan Thạch Nhân', 'Thủ Trận Đồng Vệ'], boss: 'Thiên Cơ Cổ Linh',
    tangs: ['bay', 'coDuyen', 'hazard', 'tinhAnh', 'bay', 'boss'],
    durMs: 170 * MIN, pace: 0.5152, cost: { bac: 8500, honThach: 55 },
    loot: {
      bac: [1800, 2800], exp: 3600, honThach: [36, 56],
      lieu: ['tramHaiMoc', 'sanHoKhoang', 'sanHoDinh', 'huKhongTinh', 'meVuHon', 'tramVuLan'],
      da: ['daCuongHoaCao'],
      doPho: { bac: [6, 7], slots: ['nhan', 'trangSuc'] }, doPhoChance: 0.003,
      chieuDoPho: { chance: 0.07 }, // Đồ Phổ Tuyệt Kĩ — DRAFT
      rare: [{ itemId: 'hachCoLinh', chance: 0.03 }],
    },
  },
  {
    id: 'thaiHuBiCanh', name: 'Thái Hư Bí Cảnh', gloss: 'Grand Void Realm', seal: '虛',
    reqLevel: 100, realm: 'Thần Vực', loc: 'thienThanh', theme: 'Hư không thần vực', color: '#c084fc',
    hazard: 'linhXao', hazardName: 'Hư Không Loạn Lưu',
    lore: 'Bí cảnh ngoài chín tầng trời — đảo tiên trôi nổi, tinh vân vàng tím xoáy cuộn.',
    mobs: ['Hư Không Du Hồn', 'Tinh Vẫn Cự Thú'], boss: 'Thái Hư Đạo Quân',
    tangs: ['thuong', 'hazard', 'tinhAnh', 'coDuyen', 'bay', 'kyNgo', 'boss'],
    durMs: 180 * MIN, pace: 0.5, cost: { bac: 12000, honThach: 80 },
    loot: {
      bac: [2500, 4000], exp: 5200, honThach: [50, 80],
      lieu: ['thanDanMoc', 'thanTinhKhoang', 'thanTinhDinh', 'coMaHaiCot', 'cuuDiepLinhChi'],
      da: ['daCuongHoaCao'],
      doPho: { bac: [7], slots: 'all' }, doPhoChance: 0.001,
      chieuDoPho: { chance: 0.10 }, // Đồ Phổ Tuyệt Kĩ (cao nhất) — DRAFT
      rare: [
        { itemId: 'tinhTheYeuVuong', chance: 0.01 },
        { itemId: 'cuuViTinh', chance: 0.012 },
        { itemId: 'maToTam', chance: 0.008 },
      ],
    },
  },
];

export const DUNGEON_BY_ID = Object.fromEntries(DUNGEONS.map((d) => [d.id, d]));
export const DUNGEON_IDS = DUNGEONS.map((d) => d.id);
