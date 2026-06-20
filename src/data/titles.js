// ============================================================
// DATA — Danh Hiệu (Title). Đeo 1, cộng NHẸ chỉ số theo Loại×Phẩm, mở khoá theo cột mốc.
//   bonus (decimal %): atkPct/defPct/hpPct/allPct · critPct/spdPct/dodgePct · dropPct/bacPct.
//   cond: điều kiện mở khoá (engine titleUnlocked). src: text nguồn cho UI.
//   q dùng id QUALITY (items.js) cho màu/glow. loai = nhóm.
// ============================================================

export const TITLE_LOAI = {
  chien:    'Chiến',
  thu:      'Thủ',
  toc:      'Tốc',
  toan:     'Toàn Năng',
  suu:      'Sưu Tầm',
  phu:      'Phú Quý',
  thuCung:  'Ngự Thú',
  biCanh:   'Bí Cảnh',
  boss:     'Yêu Vương',
  nghe:     'Nghề',
  canhGioi: 'Cảnh Giới',
};

const t = (id, name, q, loai, bonus, cond, src) => ({ id, name, q, loai, bonus, cond, src });

export const TITLES = [
  // ===== KHỞI ĐẦU =====
  t('soNhap', 'Sơ Nhập Giang Hồ', 'phamPham', 'chien', { atkPct: 0.01 }, { kind: 'create' }, 'Bước chân vào giang hồ'),

  // ===== CHIẾN (Công / Bạo Kích) — theo Chiến Đấu Lv + tổng sát =====
  t('tieuHuu',    'Tiểu Hữu Danh Khí', 'luongPham', 'chien', { atkPct: 0.015 }, { kind: 'combatLv', v: 15 }, 'Đạt Chiến Đấu Lv15'),
  t('thanhDanh',  'Thành Danh Cao Thủ', 'tinhPham', 'chien', { atkPct: 0.02 }, { kind: 'combatLv', v: 35 }, 'Đạt Chiến Đấu Lv35'),
  t('nhatPhuong', 'Nhất Phương Bá Chủ', 'tuyetPham', 'chien', { atkPct: 0.03, critPct: 0.01 }, { kind: 'combatLv', v: 55 }, 'Đạt Chiến Đấu Lv55'),
  t('satThan',    'Sát Thần', 'truyenThe', 'chien', { atkPct: 0.03, critPct: 0.02 }, { kind: 'totalKills', v: 10000 }, 'Hạ 10.000 yêu thú'),
  t('docCo',      'Độc Cô Cầu Bại', 'thanPham', 'chien', { atkPct: 0.04, critPct: 0.02 }, { kind: 'combatLv', v: 81 }, 'Đạt Chiến Đấu Lv81'),
  t('docBa',      'Độc Bá Thiên Hạ', 'coBan', 'chien', { atkPct: 0.05, critPct: 0.03 }, { kind: 'combatLv', v: 100 }, 'Đạt Chiến Đấu Lv100'),

  // ===== THỦ (Hộ Thể / Sinh Lực) — theo Hộ Thể Tứ Trụ =====
  t('thietBo',   'Thiết Bố Sam', 'tinhPham', 'thu', { defPct: 0.025 }, { kind: 'stat', id: 'hoThe', v: 30 }, 'Đạt Hộ Thể Lv30'),
  t('kimChung',  'Kim Chung Tráo', 'tuyetPham', 'thu', { defPct: 0.03, hpPct: 0.02 }, { kind: 'stat', id: 'hoThe', v: 50 }, 'Đạt Hộ Thể Lv50'),
  t('batHoai',   'Bất Hoại Kim Thân', 'thanPham', 'thu', { defPct: 0.04, hpPct: 0.03 }, { kind: 'stat', id: 'hoThe', v: 80 }, 'Đạt Hộ Thể Lv80'),
  t('vanPhu',    'Vạn Phu Bất Đương', 'coBan', 'thu', { defPct: 0.05, hpPct: 0.03 }, { kind: 'stat', id: 'hoThe', v: 100 }, 'Đạt Hộ Thể Lv100'),

  // ===== TỐC (Né / Tốc) — theo Thân Pháp Tứ Trụ =====
  t('tatPhong',  'Tật Phong Khoái Thủ', 'tinhPham', 'toc', { spdPct: 0.02, dodgePct: 0.015 }, { kind: 'stat', id: 'thanPhap', v: 30 }, 'Đạt Thân Pháp Lv30'),
  t('langBa',    'Lăng Ba Vi Bộ', 'tuyetPham', 'toc', { spdPct: 0.025, dodgePct: 0.02 }, { kind: 'stat', id: 'thanPhap', v: 50 }, 'Đạt Thân Pháp Lv50'),
  t('quyAnh',    'Quỷ Ảnh Tung Hoành', 'truyenThe', 'toc', { spdPct: 0.03, dodgePct: 0.025 }, { kind: 'stat', id: 'thanPhap', v: 70 }, 'Đạt Thân Pháp Lv70'),
  t('thanHanh',  'Thần Hành Bách Biến', 'thanPham', 'toc', { spdPct: 0.04, dodgePct: 0.03 }, { kind: 'stat', id: 'thanPhap', v: 100 }, 'Đạt Thân Pháp Lv100'),

  // ===== TOÀN NĂNG (mọi chỉ số, ít) — theo Tổng Lv / cột mốc lớn =====
  t('nhatDai',   'Nhất Đại Tông Sư', 'truyenThe', 'toan', { allPct: 0.015 }, { kind: 'totalLv', v: 300 }, 'Tổng Lv 300'),
  t('voLam',     'Võ Lâm Minh Chủ', 'thanPham', 'toan', { allPct: 0.02 }, { kind: 'bossDistinct', v: 10 }, 'Hạ đủ 10 Yêu Vương'),
  t('thienHa',   'Thiên Hạ Đệ Nhất', 'coBan', 'toan', { allPct: 0.025 }, { kind: 'totalLv', v: 600 }, 'Tổng Lv 600'),

  // ===== SƯU TẦM (rơi đồ / Phổ Lực) — theo Vạn Vật Phổ =====
  t('tangBao',   'Tàng Bảo Cao Thủ', 'tinhPham', 'suu', { dropPct: 0.03 }, { kind: 'codexCatAny', v: 1 }, 'Hoàn tất 1 phổ Vạn Vật'),
  t('vanVat',    'Vạn Vật Thông', 'truyenThe', 'suu', { dropPct: 0.04, allPct: 0.01 }, { kind: 'codexCatAny', v: 3 }, 'Hoàn tất 3 phổ Vạn Vật'),
  t('bacLam',    'Bác Lãm Quần Thư', 'coBan', 'suu', { dropPct: 0.05, allPct: 0.015 }, { kind: 'codexCatAny', v: 5 }, 'Hoàn tất CẢ 5 phổ Vạn Vật'),

  // ===== PHÚ QUÝ (Bạc) — theo Bạc đang giữ =====
  t('tieuPhu',   'Tiểu Phú Ông', 'luongPham', 'phu', { bacPct: 0.03 }, { kind: 'bac', v: 1000000 }, 'Giữ ≥ 100 Vạn Bạc'),
  t('haiLoc',    'Hái Lộc Đại Sư', 'tinhPham', 'phu', { bacPct: 0.05 }, { kind: 'bac', v: 10000000 }, 'Giữ ≥ 1.000 Vạn Bạc'),
  t('phuKha',    'Phú Khả Địch Quốc', 'truyenThe', 'phu', { bacPct: 0.08, hpPct: 0.01 }, { kind: 'bac', v: 100000000 }, 'Giữ ≥ 1 Ức Bạc'),

  // ===== NGỰ THÚ (Linh Thú) =====
  t('nguThuSu',  'Ngự Thú Sư', 'tinhPham', 'thuCung', { hpPct: 0.02 }, { kind: 'petCount', v: 3 }, 'Sở hữu 3 Linh Thú'),
  t('phucThuSu', 'Phục Thú Đại Sư', 'tuyetPham', 'thuCung', { hpPct: 0.025, allPct: 0.005 }, { kind: 'petCount', v: 8 }, 'Sở hữu 8 Linh Thú'),
  t('vanThu',    'Vạn Thú Chi Vương', 'thanPham', 'thuCung', { hpPct: 0.03, allPct: 0.015 }, { kind: 'petAwk', v: 5 }, 'Thức tỉnh 5 Linh Thú'),

  // ===== BÍ CẢNH =====
  t('thamHiem',  'Bí Cảnh Thám Hiểm Gia', 'tinhPham', 'biCanh', { dropPct: 0.03 }, { kind: 'dungeonClears', v: 30 }, 'Thông quan Bí Cảnh 30 lần'),
  t('xichDiem',  'Lửa Thử Vàng', 'tuyetPham', 'biCanh', { dropPct: 0.035, atkPct: 0.01 }, { kind: 'dungeonClears', v: 100 }, 'Thông quan Bí Cảnh 100 lần'),
  t('biCanhVuong', 'Bí Cảnh Chi Vương', 'truyenThe', 'biCanh', { dropPct: 0.05 }, { kind: 'dungeonDistinct', v: 9 }, 'Thông đủ 9 Bí Cảnh'),

  // ===== YÊU VƯƠNG =====
  t('truyDiet',  'Truy Yêu Lệnh', 'tinhPham', 'boss', { atkPct: 0.02 }, { kind: 'bossDistinct', v: 3 }, 'Hạ 3 Yêu Vương khác nhau'),
  t('yeuKhac',   'Yêu Vương Khắc Tinh', 'truyenThe', 'boss', { atkPct: 0.03, critPct: 0.01 }, { kind: 'bossDistinct', v: 6 }, 'Hạ 6 Yêu Vương khác nhau'),
  t('tranYeu',   'Trấn Yêu Thần Tướng', 'coBan', 'boss', { atkPct: 0.04, allPct: 0.01 }, { kind: 'bossTotal', v: 100 }, 'Hạ Yêu Vương 100 lần'),

  // ===== NGHỀ (thu thập / chế tạo) =====
  t('tieuPhuNghe', 'Tiều Phu Lão Luyện', 'luongPham', 'nghe', { bacPct: 0.02 }, { kind: 'skillLv', id: 'phatMoc', v: 50 }, 'Đốn Củi Lv50'),
  t('khoangVuong', 'Khoáng Vương', 'tinhPham', 'nghe', { bacPct: 0.025 }, { kind: 'skillLv', id: 'thaiKhoang', v: 60 }, 'Đào Khoáng Lv60'),
  t('thoRen',    'Thần Thủ Thợ Rèn', 'tuyetPham', 'nghe', { atkPct: 0.015, dropPct: 0.01 }, { kind: 'skillLv', id: 'daTao', v: 60 }, 'Rèn Đúc Lv60'),
  t('luyenDanSu', 'Luyện Đan Thánh Thủ', 'tuyetPham', 'nghe', { hpPct: 0.02 }, { kind: 'skillLv', id: 'luyenDan', v: 60 }, 'Luyện Đan Lv60'),
  t('baNghe',    'Bách Nghệ Tinh Thông', 'thanPham', 'nghe', { allPct: 0.015, bacPct: 0.03 }, { kind: 'totalLv', v: 450 }, 'Tổng Lv 450 (tinh thông bách nghệ)'),

  // ===== CẢNH GIỚI (gear loot-hunt) =====
  t('hoChienBao', 'Hộ Chiến Bảo', 'tinhPham', 'canhGioi', { defPct: 0.015, hpPct: 0.015 }, { kind: 'gearQ', v: 'truyenThe' }, 'Sở hữu 1 trang bị Sử Thi'),
  t('thanBinh',  'Thần Binh Tại Thủ', 'truyenThe', 'canhGioi', { atkPct: 0.02, critPct: 0.01 }, { kind: 'gearQ', v: 'thanPham' }, 'Sở hữu 1 trang bị Truyền Thuyết'),
  t('chiBaoVuong', 'Chí Bảo Chi Vương', 'coBan', 'canhGioi', { allPct: 0.02 }, { kind: 'gearQ', v: 'coBan' }, 'Sở hữu 1 trang bị Độc Nhất'),
];

export const TITLE_BY_ID = {};
TITLES.forEach((x) => { TITLE_BY_ID[x.id] = x; });
export const TITLE_IDS = TITLES.map((x) => x.id);

// Nhãn bonus -> hiển thị "+X% <tên>".
const BONUS_LABEL = {
  atkPct: 'Công Kích', defPct: 'Hộ Thể', hpPct: 'Sinh Lực', allPct: 'Mọi chỉ số',
  critPct: 'Bạo Kích', spdPct: 'Tốc Độ', dodgePct: 'Né Tránh', dropPct: 'Tỉ lệ rơi đồ', bacPct: 'Bạc nhặt',
};
export function titleBonusText(title) {
  if (!title || !title.bonus) return '';
  return Object.keys(title.bonus).map((k) => '+' + Math.round(title.bonus[k] * 1000) / 10 + '% ' + (BONUS_LABEL[k] || k)).join(' · ');
}
