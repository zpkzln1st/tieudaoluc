// ============================================================
// DATA — Phần thưởng Điểm Danh (28 ngày = 4 tuần, lặp lại).
// streak tăng nếu điểm danh liên tục; gãy ngày -> reset về 1.
// Ngày thứ N (1..28) trao LOGIN_REWARDS[N-1].
// milestone:true -> mốc lớn (ngày 7/14/21/28), UI tô viền vàng.
// ============================================================
export const LOGIN_REWARDS = [
  { day: 1,  bac: 200 },
  { day: 2,  bac: 300 },
  { day: 3,  honThach: 30 },
  { day: 4,  bac: 500 },
  { day: 5,  honThach: 50 },
  { day: 6,  bac: 800 },
  { day: 7,  honThach: 100, nguyenBao: 20, milestone: true },
  { day: 8,  bac: 1000 },
  { day: 9,  honThach: 60 },
  { day: 10, bac: 1500 },
  { day: 11, honThach: 80 },
  { day: 12, bac: 2000 },
  { day: 13, honThach: 100 },
  { day: 14, honThach: 150, nguyenBao: 30, milestone: true },
  { day: 15, bac: 2500 },
  { day: 16, honThach: 120 },
  { day: 17, bac: 3000 },
  { day: 18, honThach: 140 },
  { day: 19, bac: 3500 },
  { day: 20, honThach: 160 },
  { day: 21, honThach: 200, nguyenBao: 40, milestone: true },
  { day: 22, bac: 4000 },
  { day: 23, honThach: 180 },
  { day: 24, bac: 4500 },
  { day: 25, honThach: 200 },
  { day: 26, bac: 5000 },
  { day: 27, honThach: 250 },
  { day: 28, honThach: 300, nguyenBao: 100, milestone: true },
];
