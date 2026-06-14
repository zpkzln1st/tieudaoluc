// ============================================================
// DATA — Nhiệm vụ (thuần data).
// type 'produce' -> đếm theo counters.produced[target] (gather/craft).
// type 'kill'    -> đếm theo counters.kills[target] (giết quái).
// reward: { bac, honThach, nguyenBao } (chỉ tiền tệ ở Phase 1).
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

// Bể nhiệm vụ ngày — mỗi ngày bốc ngẫu nhiên 3 cái (lặp lại).
export const DAILY_QUESTS = [
  { id: 'dq_tungMoc',  name: 'Đốn 40 Tùng Mộc',    type: 'produce', target: 'tungMoc',  count: 40, reward: { bac: 600 } },
  { id: 'dq_hacThan',  name: 'Đào 40 Hắc Thán',     type: 'produce', target: 'hacThan',  count: 40, reward: { bac: 600 } },
  { id: 'dq_tichKhoang', name: 'Đào 40 Tích Khoáng', type: 'produce', target: 'tichKhoang', count: 40, reward: { bac: 600 } },
  { id: 'dq_caTuyet',  name: 'Câu 30 Tuyết Ngư',    type: 'produce', target: 'caTuyet',  count: 30, reward: { bac: 600 } },
  { id: 'dq_datSet',   name: 'Đào 30 Đất Sét',     type: 'produce', target: 'datSet',   count: 30, reward: { bac: 600 } },
  { id: 'dq_tichDinh', name: 'Luyện 20 Tích Đĩnh', type: 'produce', target: 'tichDinh', count: 20, reward: { bac: 800, honThach: 20 } },
  { id: 'dq_daLang',   name: 'Hạ 20 Sói Hoang',    type: 'kill',    target: 'daLang',   count: 20, reward: { bac: 800 } },
  { id: 'dq_sonTru',   name: 'Hạ 15 Heo Rừng',     type: 'kill',    target: 'sonTru',   count: 15, reward: { bac: 800, honThach: 20 } },
  { id: 'dq_hacHung',  name: 'Hạ 10 Gấu Đen',      type: 'kill',    target: 'hacHung',  count: 10, reward: { bac: 1000, honThach: 30 } },
  { id: 'dq_caHoi',    name: 'Câu 30 Hồi Ngư',      type: 'produce', target: 'caHoi',    count: 30, reward: { bac: 700 } },
  { id: 'dq_khaoCaTuyet', name: 'Nướng 20 Tuyết Ngư', type: 'produce', target: 'khaoCaTuyet', count: 20, reward: { bac: 700 } },
];

// Bể nhiệm vụ TUẦN — neo theo Thứ 2; hiện 7 cái cố định. Mục tiêu + thưởng ~6-7× ngày.
export const WEEKLY_QUESTS = [
  { id: 'wq_tungMoc',  name: 'Đốn 250 Tùng Mộc',     type: 'produce', target: 'tungMoc',  count: 250, reward: { bac: 4000, honThach: 30 } },
  { id: 'wq_hacThan',  name: 'Đào 250 Hắc Thán',      type: 'produce', target: 'hacThan',  count: 250, reward: { bac: 4000, honThach: 30 } },
  { id: 'wq_caTuyet',  name: 'Câu 200 Tuyết Ngư',     type: 'produce', target: 'caTuyet',  count: 200, reward: { bac: 4000, honThach: 30 } },
  { id: 'wq_datSet',   name: 'Đào 200 Đất Sét',      type: 'produce', target: 'datSet',   count: 200, reward: { bac: 4000, honThach: 30 } },
  { id: 'wq_tichDinh', name: 'Luyện 120 Tích Đĩnh', type: 'produce', target: 'tichDinh', count: 120, reward: { bac: 5000, honThach: 40 } },
  { id: 'wq_daLang',   name: 'Hạ 150 Sói Hoang',     type: 'kill',    target: 'daLang',   count: 150, reward: { bac: 5000, honThach: 40 } },
  { id: 'wq_sonTru',   name: 'Hạ 100 Heo Rừng',      type: 'kill',    target: 'sonTru',   count: 100, reward: { bac: 6000, honThach: 60 } },
];

// Bể nhiệm vụ THÁNG — neo theo YYYY-MM; hiện 7 cái cố định. Mục tiêu + thưởng lớn nhất, có Nguyên Bảo.
export const MONTHLY_QUESTS = [
  { id: 'mq_tungMoc',  name: 'Đốn 1000 Tùng Mộc',    type: 'produce', target: 'tungMoc',  count: 1000, reward: { bac: 15000, honThach: 100 } },
  { id: 'mq_hacThan',  name: 'Đào 1000 Hắc Thán',     type: 'produce', target: 'hacThan',  count: 1000, reward: { bac: 15000, honThach: 100 } },
  { id: 'mq_caTuyet',  name: 'Câu 800 Tuyết Ngư',     type: 'produce', target: 'caTuyet',  count: 800,  reward: { bac: 15000, honThach: 100 } },
  { id: 'mq_datSet',   name: 'Đào 800 Đất Sét',      type: 'produce', target: 'datSet',   count: 800,  reward: { bac: 15000, honThach: 100 } },
  { id: 'mq_tichDinh', name: 'Luyện 500 Tích Đĩnh', type: 'produce', target: 'tichDinh', count: 500,  reward: { bac: 20000, honThach: 150, nguyenBao: 5 } },
  { id: 'mq_daLang',   name: 'Hạ 600 Sói Hoang',     type: 'kill',    target: 'daLang',   count: 600,  reward: { bac: 20000, honThach: 150 } },
  { id: 'mq_sonTru',   name: 'Hạ 400 Heo Rừng',      type: 'kill',    target: 'sonTru',   count: 400,  reward: { bac: 25000, honThach: 200, nguyenBao: 10 } },
];
