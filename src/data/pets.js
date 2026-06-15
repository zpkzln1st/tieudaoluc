// ============================================================
// DATA — Linh Thú (pet). Hằng số gom 1 chỗ để tune. Xem THIET_KE_LINH_THU.md.
// Stat key TRÙNG engine derivedStats: congKich/hoThe/neTranh/menhTrung/sinhLuc.
// ============================================================

// 10 dòng (theo 10 Yêu Vương). Base @ Lv1 chuẩn phẩm Lương (qMul 1.0). emoji = placeholder tới khi có art.
export const PET_SPECIES = {
  bachHo:     { base: 'bachHo',     name: 'Bạch Hổ',     he: 'kim',  emoji: '🐯', role: 'Sát Thủ',   stats: { congKich: 9,  hoThe: 2, sinhLuc: 14, neTranh: 4, menhTrung: 4 } },
  huyenQuy:   { base: 'huyenQuy',   name: 'Huyền Quy',   he: 'thuy', emoji: '🐢', role: 'Trụ Thủ',   stats: { congKich: 3,  hoThe: 8, sinhLuc: 30, neTranh: 2, menhTrung: 2 } },
  huyetLang:  { base: 'huyetLang',  name: 'Huyết Lang',  he: 'kim',  emoji: '🐺', role: 'Hút Máu',   stats: { congKich: 8,  hoThe: 3, sinhLuc: 16, neTranh: 5, menhTrung: 3 } },
  cuHung:     { base: 'cuHung',     name: 'Cự Hùng',     he: 'tho',  emoji: '🐻', role: 'Tank',      stats: { congKich: 4,  hoThe: 7, sinhLuc: 34, neTranh: 1, menhTrung: 2 } },
  docGiao:    { base: 'docGiao',    name: 'Độc Giao',    he: 'moc',  emoji: '🐍', role: 'Độc',       stats: { congKich: 6,  hoThe: 4, sinhLuc: 20, neTranh: 3, menhTrung: 5 } },
  loiBang:    { base: 'loiBang',    name: 'Lôi Bằng',    he: 'hoa',  emoji: '🦅', role: 'Tốc',       stats: { congKich: 8,  hoThe: 2, sinhLuc: 14, neTranh: 6, menhTrung: 5 } },
  hoaLan:     { base: 'hoaLan',     name: 'Hỏa Lân',     he: 'hoa',  emoji: '🦁', role: 'Burst',     stats: { congKich: 10, hoThe: 2, sinhLuc: 15, neTranh: 3, menhTrung: 4 } },
  hoYeu:      { base: 'hoYeu',      name: 'Hồ Yêu',      he: 'moc',  emoji: '🦊', role: 'Bạo Kích',  stats: { congKich: 5,  hoThe: 3, sinhLuc: 18, neTranh: 5, menhTrung: 7 } },
  bangPhuong: { base: 'bangPhuong', name: 'Băng Phượng', he: 'thuy', emoji: '🦚', role: 'Khống Chế', stats: { congKich: 6,  hoThe: 4, sinhLuc: 20, neTranh: 4, menhTrung: 6 } },
  thienMa:    { base: 'thienMa',    name: 'Thiên Ma',    he: 'tho',  emoji: '👹', role: 'Toàn Năng', stats: { congKich: 8,  hoThe: 5, sinhLuc: 22, neTranh: 4, menhTrung: 5 } },
};

// Phẩm chất pet (tái dùng id của QUALITY items.js cho màu khung). qMul=stat nở, gMul=growth/lv (DỐC HƠN).
export const PET_QUALITY = {
  phamPham:  { id: 'phamPham',  qMul: 0.85, gMul: 0.80, optSlots: 1, bias: 0.20 },
  luongPham: { id: 'luongPham', qMul: 1.00, gMul: 1.00, optSlots: 2, bias: 0.35 },
  tinhPham:  { id: 'tinhPham',  qMul: 1.15, gMul: 1.25, optSlots: 2, bias: 0.50 },
  tuyetPham: { id: 'tuyetPham', qMul: 1.35, gMul: 1.55, optSlots: 3, bias: 0.62 },
  truyenThe: { id: 'truyenThe', qMul: 1.55, gMul: 1.85, optSlots: 3, bias: 0.72 },
  thanPham:  { id: 'thanPham',  qMul: 1.80, gMul: 2.15, optSlots: 4, bias: 0.80 },
  coBan:     { id: 'coBan',     qMul: 2.10, gMul: 2.55, optSlots: 5, bias: 0.85 },
};

// Roll phẩm pet từ nhãn trứng (egg.quality đang ship: phamPham/tinhPham/thanPham).
export const EGG_TO_PET_Q = {
  phamPham: [['phamPham', 0.70], ['luongPham', 0.30]],
  tinhPham: [['tinhPham', 0.55], ['tuyetPham', 0.35], ['truyenThe', 0.10]],
  thanPham: [['tuyetPham', 0.30], ['truyenThe', 0.40], ['thanPham', 0.25], ['coBan', 0.05]],
};

// Pool opt ngẫu nhiên. fmt:'flat' -> cộng thẳng stat (P2 áp dụng); 'pct'/utility -> lưu + hiện, áp dụng combat ở P5.
export const PET_OPT_POOL = [
  { id: 'atkFlat',   name: 'Công Kích',       lo: 4,  hi: 12, group: 'combat',  w: 20, fmt: 'flat', stat: 'congKich' },
  { id: 'hpFlat',    name: 'Sinh Lực',        lo: 25, hi: 80, group: 'combat',  w: 20, fmt: 'flat', stat: 'sinhLuc' },
  { id: 'defFlat',   name: 'Hộ Thể',          lo: 3,  hi: 10, group: 'combat',  w: 16, fmt: 'flat', stat: 'hoThe' },
  { id: 'dodgeFlat', name: 'Né Tránh',        lo: 3,  hi: 10, group: 'combat',  w: 14, fmt: 'flat', stat: 'neTranh' },
  { id: 'menhFlat',  name: 'Mệnh Trúng',      lo: 3,  hi: 10, group: 'combat',  w: 14, fmt: 'flat', stat: 'menhTrung' },
  { id: 'atkPct',    name: 'Công Kích %',     lo: 2,  hi: 6,  group: 'combat',  w: 10, fmt: 'pct', cap: 12 },
  { id: 'hpPct',     name: 'Sinh Lực %',      lo: 2,  hi: 6,  group: 'combat',  w: 10, fmt: 'pct', cap: 12 },
  { id: 'critRate',  name: 'Bạo Kích Suất',   lo: 1,  hi: 3,  group: 'combat',  w: 7,  fmt: 'pct', cap: 8 },
  { id: 'critDmg',   name: 'Bạo Kích Thương', lo: 4,  hi: 12, group: 'combat',  w: 6,  fmt: 'pct', cap: 30 },
  { id: 'dodgePct',  name: 'Né %',            lo: 1,  hi: 3,  group: 'combat',  w: 6,  fmt: 'pct', cap: 10 },
  { id: 'lifesteal', name: 'Hút Sinh Lực',    lo: 1,  hi: 4,  group: 'combat',  w: 4,  fmt: 'pct', cap: 6 },
  { id: 'eleDmg',    name: 'Tăng ST Hệ',      lo: 3,  hi: 8,  group: 'combat',  w: 5,  fmt: 'pct', cap: 20 },
  { id: 'petExp',    name: 'EXP Săn Mồi',     lo: 5,  hi: 20, group: 'utility', w: 6,  fmt: 'pct' },
  { id: 'moneyFind', name: 'Bạc Rơi',         lo: 3,  hi: 10, group: 'utility', w: 3,  fmt: 'pct' },
];
export const PET_OPT_BY_ID = {};
PET_OPT_POOL.forEach((o) => { PET_OPT_BY_ID[o.id] = o; });

// ============================================================
// P5 — TUYỆT KĨ: mỗi loài 1 BỊ ĐỘNG (signature) + 1 CHỦ ĐỘNG (CD theo cycle, phát trong combat).
// Bị động (mỗi cycle): dmgBonus(+% đòn tuyệt kĩ) · absorb(+% gánh thay chủ) · lifesteal(hồi=Công×val/cycle) · petHp(+% Sinh Lực pet) · cdCut(−nhịp hồi).
// Chủ động (đủ nhịp + còn Thể Lực): mult(burst=Công×mult) · healMul(hồi=burst×healMul) · block(đỡ TRỌN đòn cycle). Tốn thêm 6 Thể Lực/lần.
// ============================================================
export const PET_SKILLS = {
  bachHo:     { passive: { name: 'Hổ Uy',     desc: 'Uy mãnh trời sinh — sát thương tuyệt kĩ Linh Thú +30%.',                  dmgBonus: 0.30 }, active: { name: 'Bạo Trảo',       cd: 3, mult: 1.6, desc: 'Vồ rách phòng ngự, giáng một vuốt sấm sét.' } },
  huyenQuy:   { passive: { name: 'Quy Giáp',  desc: 'Mai rùa huyền thiết — gánh thay chủ thêm 12% sát thương mỗi trận.',      absorb: 0.12 }, active: { name: 'Tị Thủy Quyết',  cd: 4, mult: 0.5, healMul: 1.6, desc: 'Dựng màn nước hộ thân chủ, hồi nhiều sinh lực.' } },
  huyetLang:  { passive: { name: 'Huyết Khát', desc: 'Khát máu bẩm sinh — đòn Linh Thú hút máu hồi sinh lực cho chủ mỗi trận.', lifesteal: 0.6 }, active: { name: 'Cuồng Huyết',    cd: 3, mult: 1.4, healMul: 0.6, desc: 'Cắn xé điên cuồng, ngoạm máu địch hồi cho chủ.' } },
  cuHung:     { passive: { name: 'Hùng Thể',  desc: 'Thân gấu sừng sững — Sinh Lực Linh Thú +35%, đỡ đòn bền hơn.',           petHp: 0.35 }, active: { name: 'Trấn Sơn Hống',  cd: 4, mult: 0.4, block: true, desc: 'Gầm vang chấn địch, đỡ trọn cơn sát thương kế.' } },
  docGiao:    { passive: { name: 'Độc Tố',    desc: 'Nọc độc ngấm xương — sát thương tuyệt kĩ +20%, kèm độc ăn mòn.',         dmgBonus: 0.20 }, active: { name: 'Phún Độc',       cd: 3, mult: 1.3, desc: 'Phun độc vụ ăn mòn tạng phủ địch.' } },
  loiBang:    { passive: { name: 'Lôi Tấn',   desc: 'Cánh sấm như chớp — tuyệt kĩ Linh Thú giảm 1 nhịp hồi.',                 cdCut: 1 }, active: { name: 'Lôi Dực Kích',   cd: 3, mult: 1.2, desc: 'Bổ nhào sấm sét, đòn nhanh như điện xẹt.' } },
  hoaLan:     { passive: { name: 'Diễm Hoá',  desc: 'Lân hoả rực trời — sát thương tuyệt kĩ Hỏa +40%.',                       dmgBonus: 0.40 }, active: { name: 'Phần Diễm',      cd: 4, mult: 2.0, desc: 'Bùng cháy thiêu rụi, một đòn bạo phát kinh người.' } },
  hoYeu:      { passive: { name: 'Hồ Mị',     desc: 'Yêu hồ mê hoặc — đòn Linh Thú hút sinh lực hồi cho chủ mỗi trận.',       lifesteal: 0.35 }, active: { name: 'Mị Hoặc',       cd: 4, mult: 1.0, healMul: 0.5, desc: 'Mê hoặc tâm thần địch, thừa cơ hồi sức cho chủ.' } },
  bangPhuong: { passive: { name: 'Hàn Sương', desc: 'Sương băng ghì địch — chủ chịu ít đòn hơn (gánh thêm 8%).',             absorb: 0.08 }, active: { name: 'Hàn Băng Phong', cd: 4, mult: 1.4, desc: 'Phong ấn băng giá, đông cứng trọng thương địch.' } },
  thienMa:    { passive: { name: 'Ma Khí',    desc: 'Ma khí trợ uy — tuyệt kĩ +20% và Sinh Lực Linh Thú +12%.',              dmgBonus: 0.20, petHp: 0.12 }, active: { name: 'Thiên Ma Trảm', cd: 4, mult: 1.8, desc: 'Một đao ma khí chém ngang trời, uy lực bạt sơn.' } },
};
