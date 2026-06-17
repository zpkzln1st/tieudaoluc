// ============================================================
// DATA — Nhiệm vụ (thuần data).
// type 'produce' -> đếm theo counters.produced[target] (gather/craft); cần `skill`+`req` để lọc theo cấp.
// type 'kill'    -> đếm theo counters.kills[target] (giết quái); `req` lọc theo Chiến Đấu Lv.
// req = cấp tối thiểu mở mục tiêu -> engine CHỈ bốc nhiệm vụ người chơi đủ sức (khó dần theo cấp, đa dạng theo tiến trình).
// Pool LỚN HƠN số hiện (7) -> ngày/tuần/tháng XOAY VÒNG, không lặp một khuôn.
// RESET: ngày = 00:00 mỗi ngày · tuần = 00:00 Thứ Hai · tháng = 00:00 ngày 1 (giờ địa phương).
// ============================================================

// Chuỗi tân thủ — làm tuần tự, dẫn người chơi qua từng hệ.
export const TUTORIAL_QUESTS = [
  { id: 'tut1', name: 'Đốn 10 Tùng Mộc',     desc: 'Kỹ Năng → Đốn Củi → đốn Tùng Mộc.',                     type: 'produce', target: 'tungMoc',    count: 10, reward: { bac: 300 } },
  { id: 'tut2', name: 'Đào 10 Hắc Thán',       desc: 'Kỹ Năng → Đào Khoáng → Hắc Thán.',                       type: 'produce', target: 'hacThan',    count: 10, reward: { bac: 300 } },
  { id: 'tut3', name: 'Đào 5 Tích Khoáng',    desc: 'Đào Khoáng → Tích Khoáng (để luyện thỏi).',             type: 'produce', target: 'tichKhoang', count: 5,  reward: { bac: 300 } },
  { id: 'tut4', name: 'Luyện 5 Tích Đĩnh',   desc: 'Luyện Kim → Tích Đĩnh (cần Tích Khoáng + Hắc Thán).',    type: 'produce', target: 'tichDinh',   count: 5,  reward: { bac: 500 } },
  { id: 'tut5', name: 'Rèn 1 Cuốc Thiếc',     desc: 'Rèn Đúc → Cuốc Thiếc (cần Tích Đĩnh).',                type: 'produce', target: 'tichSao',    count: 1,  reward: { bac: 600, honThach: 20 } },
  { id: 'tut6', name: 'Hạ 5 Sói Hoang',       desc: 'Chiến Đấu → Sói Hoang.',                                type: 'kill',    target: 'daLang',     count: 5,  reward: { bac: 600 } },
  { id: 'tut7', name: 'Hạ 3 Heo Rừng',        desc: 'Chiến Đấu → Heo Rừng.',                                 type: 'kill',    target: 'sonTru',     count: 3,  reward: { bac: 800, honThach: 30 } },
];

// ---- Thưởng tính theo CÔNG SỨC: tỉ lệ count × đơn giá theo bậc req; kill quý hơn ×1.8; honThach/nguyenBao theo kỳ + bậc.
function qReward(period, req, count, type) {
  const t = req >= 92 ? 6 : req >= 78 ? 5 : req >= 60 ? 4 : req >= 32 ? 3 : req >= 8 ? 2 : 1;   // 6 bậc theo cấp mục tiêu
  const unit = [0, 10, 14, 20, 30, 46, 68][t] * (type === 'kill' ? 1.8 : 1);
  const r = { bac: Math.max(50, Math.round(count * unit / 50) * 50) };
  if (period === 'daily') { if (t >= 3) r.honThach = 5 * (t - 1); }            // ngày: chỉ bậc cao mới kèm Hồn Thạch
  else if (period === 'weekly') { r.honThach = 10 * t; }                        // tuần: luôn có Hồn Thạch
  else { r.honThach = 25 * t; if (t >= 4) r.nguyenBao = (t - 2) * 2; }          // tháng: Hồn Thạch lớn + Nguyên Bảo (bậc ≥4)
  return r;
}
const pq = (id, verb, nm, target, skill, req, count, period) => ({ id, name: `${verb} ${count} ${nm}`, type: 'produce', target, skill, req, count, reward: qReward(period, req, count, 'produce') });
const kq = (id, nm, target, req, count, period) => ({ id, name: `Hạ ${count} ${nm}`, type: 'kill', target, req, count, reward: qReward(period, req, count, 'kill') });

// ===== Bể nhiệm vụ NGÀY (20 mục, bốc 7) — đủ hệ nghề + nhiều bậc; khó dần theo cấp =====
export const DAILY_QUESTS = [
  pq('dq_tungMoc',        'Đốn', 'Tùng Mộc',          'tungMoc',         'phatMoc',    1,  60, 'daily'),
  pq('dq_trucMoc',        'Đốn', 'Trúc Mộc',          'trucMoc',         'phatMoc',    8,  55, 'daily'),
  pq('dq_phongMoc',       'Đốn', 'Phong Mộc',         'phongMoc',        'phatMoc',    32, 40, 'daily'),
  pq('dq_hanTung',        'Đốn', 'Hàn Tùng',          'hanTung',         'phatMoc',    48, 32, 'daily'),
  pq('dq_hacThan',        'Đào', 'Hắc Thán',          'hacThan',         'thaiKhoang', 1,  60, 'daily'),
  pq('dq_thietKhoang',    'Đào', 'Thiết Khoáng',      'thietKhoang',     'thaiKhoang', 18, 48, 'daily'),
  pq('dq_tinhThachKhoang','Đào', 'Tinh Thạch Khoáng', 'tinhThachKhoang', 'thaiKhoang', 32, 40, 'daily'),
  pq('dq_hanThietKhoang', 'Đào', 'Hàn Thiết Khoáng',  'hanThietKhoang',  'thaiKhoang', 48, 32, 'daily'),
  pq('dq_caTuyet',        'Câu', 'Tuyết Ngư',         'caTuyet',         'dieuNgu',    1,  45, 'daily'),
  pq('dq_caTon',          'Câu', 'Hương Ngư',         'caTon',           'dieuNgu',    18, 38, 'daily'),
  pq('dq_tinhLanNgu',     'Câu', 'Tinh Lân Ngư',      'tinhLanNgu',      'dieuNgu',    32, 32, 'daily'),
  pq('dq_tichDinh',       'Luyện', 'Tích Đĩnh',       'tichDinh',        'daLuyen',    1,  40, 'daily'),
  pq('dq_thietDinh',      'Luyện', 'Thiết Đĩnh',      'thietDinh',       'daLuyen',    18, 30, 'daily'),
  pq('dq_datSet',         'Đào', 'Đất Sét',           'datSet',          'doanhTao',   1,  50, 'daily'),
  pq('dq_khaoCaTuyet',    'Nướng', 'Tuyết Ngư Nướng', 'khaoCaTuyet',     'phanhNham',  1,  30, 'daily'),
  kq('dq_daLang',         'Sói Hoang',       'daLang',        1,  30, 'daily'),
  kq('dq_hacHung',        'Gấu Đen',         'hacHung',       8,  24, 'daily'),
  kq('dq_daoTac',         'Đạo Tặc',         'daoTac',        18, 22, 'daily'),
  kq('dq_tinhThachQuai',  'Tinh Thạch Quái', 'tinhThachQuai', 32, 18, 'daily'),
  kq('dq_tuyetLang',      'Tuyết Lang',      'tuyetLang',     48, 16, 'daily'),
];

// ===== Bể nhiệm vụ TUẦN (16 mục, bốc 7) — ~6× ngày, lên tới bậc cao =====
export const WEEKLY_QUESTS = [
  pq('wq_tungMoc',        'Đốn', 'Tùng Mộc',          'tungMoc',        'phatMoc',    1,  350, 'weekly'),
  pq('wq_phongMoc',       'Đốn', 'Phong Mộc',         'phongMoc',       'phatMoc',    32, 240, 'weekly'),
  pq('wq_phuVanMoc',      'Đốn', 'Phù Vân Mộc',       'phuVanMoc',      'phatMoc',    70, 150, 'weekly'),
  pq('wq_hacThan',        'Đào', 'Hắc Thán',          'hacThan',        'thaiKhoang', 1,  350, 'weekly'),
  pq('wq_hanThietKhoang', 'Đào', 'Hàn Thiết Khoáng',  'hanThietKhoang', 'thaiKhoang', 48, 200, 'weekly'),
  pq('wq_vanThiet',       'Đào', 'Vẫn Thiết',         'vanThiet',       'thaiKhoang', 78, 130, 'weekly'),
  pq('wq_caTuyet',        'Câu', 'Tuyết Ngư',         'caTuyet',        'dieuNgu',    1,  300, 'weekly'),
  pq('wq_bangLanNgu',     'Câu', 'Băng Lân Ngư',      'bangLanNgu',     'dieuNgu',    48, 170, 'weekly'),
  pq('wq_tichDinh',       'Luyện', 'Tích Đĩnh',       'tichDinh',       'daLuyen',    1,  220, 'weekly'),
  pq('wq_hanThietDinh',   'Luyện', 'Hàn Thiết Đĩnh',  'hanThietDinh',   'daLuyen',    48, 150, 'weekly'),
  pq('wq_datSet',         'Đào', 'Đất Sét',           'datSet',         'doanhTao',   1,  300, 'weekly'),
  kq('wq_daLang',         'Sói Hoang',  'daLang',    1,  180, 'weekly'),
  kq('wq_daoTac',         'Đạo Tặc',    'daoTac',    18, 150, 'weekly'),
  kq('wq_tuyetLang',      'Tuyết Lang', 'tuyetLang', 48, 110, 'weekly'),
  kq('wq_hoaYeu',         'Hoa Yêu',    'hoaYeu',    70, 85,  'weekly'),
  kq('wq_tinhLinh',       'Tinh Linh',  'tinhLinh',  78, 70,  'weekly'),
];

// ===== Bể nhiệm vụ THÁNG (14 mục, bốc 7) — lớn nhất, kèm Nguyên Bảo ở bậc cao =====
export const MONTHLY_QUESTS = [
  pq('mq_tungMoc',        'Đốn', 'Tùng Mộc',          'tungMoc',        'phatMoc',    1,   1200, 'monthly'),
  pq('mq_hanTung',        'Đốn', 'Hàn Tùng',          'hanTung',        'phatMoc',    48,  700,  'monthly'),
  pq('mq_thanDanMoc',     'Đốn', 'Thần Đàn Mộc',      'thanDanMoc',     'phatMoc',    100, 400,  'monthly'),
  pq('mq_hacThan',        'Đào', 'Hắc Thán',          'hacThan',        'thaiKhoang', 1,   1200, 'monthly'),
  pq('mq_vanThiet',       'Đào', 'Vẫn Thiết',         'vanThiet',       'thaiKhoang', 78,  520,  'monthly'),
  pq('mq_thanTinhKhoang', 'Đào', 'Thần Tinh Khoáng',  'thanTinhKhoang', 'thaiKhoang', 100, 400,  'monthly'),
  pq('mq_caTuyet',        'Câu', 'Tuyết Ngư',         'caTuyet',        'dieuNgu',    1,   1000, 'monthly'),
  pq('mq_haiGiaoNgu',     'Câu', 'Hải Giao Ngư',      'haiGiaoNgu',     'dieuNgu',    92,  420,  'monthly'),
  pq('mq_tichDinh',       'Luyện', 'Tích Đĩnh',       'tichDinh',       'daLuyen',    1,   800,  'monthly'),
  pq('mq_vanThietDinh',   'Luyện', 'Vẫn Thiết Đĩnh',  'vanThietDinh',   'daLuyen',    78,  400,  'monthly'),
  kq('mq_daLang',         'Sói Hoang',  'daLang',    1,   600, 'monthly'),
  kq('mq_tuyetLang',      'Tuyết Lang', 'tuyetLang', 48,  400, 'monthly'),
  kq('mq_tinhLinh',       'Tinh Linh',  'tinhLinh',  78,  320, 'monthly'),
  kq('mq_coMa',           'Cổ Ma',      'coMa',      100, 250, 'monthly'),
];
