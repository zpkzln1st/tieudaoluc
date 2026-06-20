// ============================================================
// DATA — TRANG BỊ: sinh chỉ số (mkEquipStats) + helper tạo món (mkGear) + CATALOG thật.
//   + Rèn Đúc (mkGearRecipe): tự sinh công thức rèn từ Thỏi theo tier itemLv.
// Schema item.equip = { slot, itemLv, stats{5 key gearStats}, he, eleDmg, set }.
// Chỉ dùng 5 key gearStats cộng được: congKich/hoThe/neTranh/menhTrung/sinhLuc.
// Art: images/equip/<id>.webp (id bắt đầu 'eq_'). he (ngũ hành) tạm null — chờ pass thiết kế build.
// ============================================================

// Hệ số cấp item: Lv1 → ×1, Lv100 → ×6.94 (doc §3, bám đường cong địch).
export const LV_MUL = (itemLv) => 1 + (Math.max(1, itemLv) - 1) * 0.06;
// Hệ số phẩm chất (theo 7 bậc QUALITY).
export const QUALITY_MUL = {
  phamPham: 1.0, luongPham: 1.25, tinhPham: 1.55, tuyetPham: 1.9,
  truyenThe: 2.3, thanPham: 2.8, coBan: 3.4,
};
// Base @ itemLv1, phamPham — phân bổ vai trò theo slot (doc §3).
export const BASE_BY_SLOT = {
  vuKhi:    { congKich: 11 },                 // nguồn Công chính
  giap:     { hoThe: 6, sinhLuc: 18 },        // Thủ + Sinh Lực (gộp cả vai trò "quần")
  mu:       { hoThe: 4, menhTrung: 3 },
  dai:      { sinhLuc: 12, hoThe: 3 },
  gang:     { congKich: 6, menhTrung: 2 },
  giay:     { neTranh: 5, sinhLuc: 6 },
  nhan:     { congKich: 4, menhTrung: 2 },
  trangSuc: { sinhLuc: 10, menhTrung: 2 },     // Dây Chuyền / Ngọc Bội
  toaKy:    { sinhLuc: 8, neTranh: 2 },
};

// Sinh chỉ số nền của 1 món: base[slot] × LV_MUL × QUALITY_MUL, làm tròn (tối thiểu 1).
export function mkEquipStats(slot, itemLv = 1, quality = 'phamPham') {
  const base = BASE_BY_SLOT[slot] || {};
  const k = LV_MUL(itemLv) * (QUALITY_MUL[quality] || 1);
  const out = {};
  for (const s in base) out[s] = Math.max(1, Math.round(base[s] * k));
  return out;
}

// Tạo 1 item trang bị hoàn chỉnh. he/eleDmg = Ngũ Hành (cộng hưởng chiêu cùng hệ).
export function mkGear(id, opt) {
  const { name, slot, itemLv = 1, quality = 'phamPham', he = null, eleDmg = 0, set = null, icon = '🔹', desc = '', weaponType = null, reqLevel = 1 } = opt || {};
  return {
    id, name, icon, type: 'trangbi', quality,
    value: Math.round(itemLv * itemLv * 0.5 + 20),
    equip: { slot, itemLv, reqLevel, stats: mkEquipStats(slot, itemLv, quality), he, eleDmg: he ? eleDmg : 0, set, weaponType },
    desc,
  };
}

// ============================================================
// CATALOG THẬT — 7 món/slot theo bac1→7 = 7 bậc phẩm chất (Phàm→Cô Bản). User curate.
// ============================================================
// bac (1..7) -> phẩm chất + cấp item. itemLv TẠM (tune sau): trải đều 1→100, mỗi bac 1 tier Thỏi khác nhau.
export const BAC_QUALITY = { 1: 'phamPham', 2: 'luongPham', 3: 'tinhPham', 4: 'tuyetPham', 5: 'truyenThe', 6: 'thanPham', 7: 'coBan' };
export const BAC_LEVEL   = { 1: 8, 2: 22, 3: 36, 4: 50, 5: 66, 6: 82, 7: 100 };
// CẤP YÊU CẦU để MANG (đeo) — bậc 7 = Lv81 (tạm cao nhất, chừa chỗ mở rộng); giãn đều theo nhịp chơi + khớp mốc vùng (b3≈Hắc Phong25, b4≈Lưu Vân40, b5≈Băng Tâm55).
export const BAC_REQ     = { 1: 1, 2: 12, 3: 25, 4: 40, 5: 55, 6: 68, 7: 81 };
const SLOT_EMOJI = { mu: '⛑️', giap: '🥋', dai: '🎗️', gang: '🧤', giay: '🥾', vuKhi: '🗡️', nhan: '💍', trangSuc: '📿', toaKy: '🐎' };
// Tạo món theo bac (phẩm chất + cấp suy từ bac). he tạm null (gán sau ở pass build).
function mkBac(id, name, slot, bac, he = null) {
  return mkGear(id, { name, slot, itemLv: BAC_LEVEL[bac], quality: BAC_QUALITY[bac], reqLevel: BAC_REQ[bac], he, eleDmg: he ? 0.10 : 0, icon: SLOT_EMOJI[slot] });
}
export const GEAR = {};
[
  // ---- ÁO (giap) ----
  mkBac('eq_ao_vai_tho',          'Áo Vải Thô',          'giap', 1),
  mkBac('eq_te_lan_giap',         'Tế Lân Giáp',         'giap', 2),
  mkBac('eq_toan_nghe_giap',      'Toan Nghệ Giáp',      'giap', 3),
  mkBac('eq_van_luu_quy_tong_y',  'Vạn Lưu Quy Tông Y',  'giap', 4),
  mkBac('eq_toa_tu_giap',         'Tỏa Tử Giáp',         'giap', 5),
  mkBac('eq_tuyen_long_bao',      'Tuyền Long Bào',      'giap', 6),
  mkBac('eq_minh_vuong_khai_giap','Minh Vương Khải Giáp','giap', 7),
  // ---- ĐAI (dai) ----
  mkBac('eq_xich_dong_thuc_dai',    'Xích Đồng Thúc Đái',  'dai', 1),
  mkBac('eq_thanh_xa_linh_dai',     'Thanh Xà Linh Đái',   'dai', 2),
  mkBac('eq_bach_ngoc_bao_dai',     'Bạch Ngọc Bảo Đái',   'dai', 3),
  mkBac('eq_thanh_truc_cam_dai',    'Thanh Trúc Cẩm Đái',  'dai', 4),
  mkBac('eq_huyen_thiet_chien_dai', 'Huyền Thiết Chiến Đai','dai', 5),
  mkBac('eq_luu_van_phi_dai',       'Lưu Vân Phi Đái',     'dai', 6),
  mkBac('eq_kim_long_bao_dai',      'Kim Long Bảo Đái',    'dai', 7),
  // ---- GĂNG (gang) ----
  mkBac('eq_tho_bi_thu_sao',     'Thô Bì Thủ Sáo',    'gang', 1),
  mkBac('eq_thiet_cot_ho_thu',   'Thiết Cốt Hộ Thủ',  'gang', 2),
  mkBac('eq_xich_dong_ti_giap',  'Xích Đồng Tí Giáp', 'gang', 3),
  mkBac('eq_hac_long_lan_thu',   'Hắc Long Lân Thủ',  'gang', 4),
  mkBac('eq_bang_tam_linh_thu',  'Băng Tâm Linh Thủ', 'gang', 5),
  mkBac('eq_hoa_diem_chien_thu', 'Hỏa Diệm Chiến Thủ','gang', 6),
  mkBac('eq_loi_dinh_thu_sao',   'Lôi Đình Thủ Sáo',  'gang', 7),
  // ---- GIÀY (giay) ----
  mkBac('eq_vai_giay',   'Vải Giày',   'giay', 1),
  mkBac('eq_lang_ba_ly', 'Lang Ba Lý', 'giay', 2),
  mkBac('eq_tien_van_ly','Tiên Vân Lý','giay', 3),
  mkBac('eq_phi_van_ly', 'Phi Vân Lý', 'giay', 4),
  mkBac('eq_phong_anh_hai',        'Phong Ảnh Hài',       'giay', 5),
  mkBac('eq_loi_quang_chien_ngoa', 'Lôi Quang Chiến Ngoa','giay', 6),
  mkBac('eq_thien_hanh_than_ly',   'Thiên Hành Thần Lý',  'giay', 7),
  // ---- MŨ (mu) — CHƯA có art (đang hiện emoji); copy art eq_<id>.webp vào images/equip/ ----
  mkBac('eq_bo_can',              'Bố Cân',             'mu', 1),
  mkBac('eq_thanh_truc_dau_lap',  'Thanh Trúc Đấu Lạp', 'mu', 2),
  mkBac('eq_ho_bi_chien_mao',     'Hổ Bì Chiến Mạo',    'mu', 3),
  mkBac('eq_la_han_bao_quan',     'La Hán Bảo Quan',    'mu', 4),
  mkBac('eq_cuu_long_kim_quan',   'Cửu Long Kim Quan',  'mu', 5),
  mkBac('eq_bich_ngoc_hoang_quan','Bích Ngọc Hoàng Quan','mu', 6),
  mkBac('eq_lien_hoa_dao_quan',   'Liên Hoa Đạo Quan',  'mu', 7),
  // ---- TỌA KỴ / NGỰA (toaKy) ----
  mkBac('eq_thanh_tong_ma',       'Thanh Tông Mã',       'toaKy', 1),
  mkBac('eq_dai_uyen_luong_cau',  'Đại Uyển Lương Câu',  'toaKy', 2),
  mkBac('eq_dich_lu',             'Dịch Lư',             'toaKy', 3),
  mkBac('eq_o_van_dap_tuyet',     'Ô Vân Đạp Tuyết',     'toaKy', 4),
  mkBac('eq_han_huyet_bao_cau',   'Hãn Huyết Bảo Câu',   'toaKy', 5),
  mkBac('eq_phi_van',             'Phi Vân',             'toaKy', 6),
  mkBac('eq_chieu_da_ngoc_su_tu', 'Chiếu Dạ Ngọc Sư Tử', 'toaKy', 7),
  // ---- NHẪN (nhan) ----
  mkBac('eq_luc_truc_ban_chi',    'Lục Trúc Ban Chỉ',  'nhan', 1),
  mkBac('eq_bach_ngoc_gioi_chi',  'Bạch Ngọc Giới Chỉ','nhan', 2),
  mkBac('eq_tu_kim_linh_gioi',    'Tử Kim Linh Giới',  'nhan', 3),
  mkBac('eq_hoang_long_ban_chi',  'Hoàng Long Ban Chỉ','nhan', 4),
  mkBac('eq_hoa_long_chau_gioi',  'Hỏa Long Châu Giới','nhan', 5),
  mkBac('eq_tu_vi_tinh_hoan',     'Tử Vi Tinh Hoàn',   'nhan', 6),
  mkBac('eq_can_khon_huyen_gioi', 'Càn Khôn Huyền Giới','nhan', 7),
  // ---- TRANG SỨC (trangSuc) — Dây Chuyền / Ngọc Bội ----
  mkBac('eq_bich_ngoc_boi',          'Bích Ngọc Bội',          'trangSuc', 1),
  mkBac('eq_duong_chi_ngoc_boi',     'Dương Chi Ngọc Bội',     'trangSuc', 2),
  mkBac('eq_lien_tam_boi',           'Liên Tâm Bội',           'trangSuc', 3),
  mkBac('eq_chien_van_linh_phu',     'Chiến Văn Linh Phù',     'trangSuc', 4),
  mkBac('eq_bich_hai_trieu_sinh_boi','Bích Hải Triều Sinh Bội','trangSuc', 5),
  mkBac('eq_long_phuong_song_boi',   'Long Phượng Song Bội',   'trangSuc', 6),
  mkBac('eq_kim_quang_tien_phu',     'Kim Quang Tiên Phù',     'trangSuc', 7),
].forEach((it) => { GEAR[it.id] = it; });

// ---- VŨ KHÍ (vuKhi) — 4 loại × 7 bậc: Kiếm / Đao / Cung / Ám Khí. equip.weaponType để lọc/khoá sau. ----
const WP_NAMES = {
  kiem:  ['Thanh Phong Kiếm', 'Lưu Vân Kiếm', 'Thu Thủy Kiếm', 'Thanh Hồng Kiếm', 'Tử Điện Kiếm', 'Cửu Tiêu Thần Kiếm', 'Trảm Tiên Kiếm'],
  dao:   ['Liễu Diệp Đao', 'Hắc Phong Đao', 'Bá Vương Đao', 'Huyết Ẩm Đao', 'Long Tuyền Đao', 'Cuồng Lôi Thần Đao', 'Diệt Thế Ma Đao'],
  cung:  ['Mộc Cung', 'Thiết Tý Cung', 'Bôn Lôi Cung', 'Liệt Nhật Cung', 'Bích Hải Triều Sinh Cung', 'Cửu Thiên Huyền Cung', 'Tịch Diệt Thần Cung'],
  amkhi: ['Thiết Phi Tiêu', 'Liễu Diệp Phi Đao', 'Tụ Lý Càn Khôn', 'Đoạt Mệnh Phi Đao', 'U Minh Tiễn', 'Cửu Cung Phi Tinh', 'Vô Ảnh Thần Châm'],
};
const WP_ICON = { kiem: '🗡️', dao: '🔪', cung: '🏹', amkhi: '🎯' };
['kiem', 'dao', 'cung', 'amkhi'].forEach((wt) => WP_NAMES[wt].forEach((nm, i) => {
  const bac = i + 1, id = 'eq_' + wt + '_' + bac;
  GEAR[id] = mkGear(id, { name: nm, slot: 'vuKhi', itemLv: BAC_LEVEL[bac], quality: BAC_QUALITY[bac], reqLevel: BAC_REQ[bac], icon: WP_ICON[wt], weaponType: wt });
}));

// ============================================================
// CÔNG CỤ (tools) — Rìu/Cuốc/Cần Câu × 7 bậc. Tăng HIỆU SUẤT khai thác (gatherEff 5%→50% theo bậc).
// Bậc 4-7 = Đồ Phổ (tự sinh dp_ ở items.js vì quality tuyetPham+). Equip vào TOOL_SLOTS (riu/cuoc/canCau).
// ============================================================
export const TOOL_EFF_BY_BAC = { 1: 0.05, 2: 0.10, 3: 0.20, 4: 0.25, 5: 0.35, 6: 0.40, 7: 0.50 };
const TOOL_SLOT_SKILL = { riu: 'phatMoc', cuoc: 'thaiKhoang', canCau: 'dieuNgu' };
const TOOL_ICON = { riu: '🪓', cuoc: '⛏️', canCau: '🎣' };
// Nguồn lấy: bậc 1 = RÈN ĐÚC · bậc 2-3 = ĐỒ PHỔ rơi Bí Cảnh nhỏ (forceDoPho, dù phẩm chất thấp) · bậc 4-7 = Đồ Phổ (qua quality).
function mkTool(id, name, slot, bac, desc) {
  const itemLv = BAC_LEVEL[bac];
  const equip = { slot, itemLv, reqLevel: BAC_REQ[bac], stats: {}, gatherEff: TOOL_EFF_BY_BAC[bac], gatherSkill: TOOL_SLOT_SKILL[slot] };
  if (bac === 2 || bac === 3) equip.forceDoPho = true; // bậc 2-3 = Đồ Phổ (ép, vì phẩm chất Lương/Tinh không tự thành Đồ Phổ)
  return { id, name, icon: TOOL_ICON[slot], type: 'trangbi', quality: BAC_QUALITY[bac], value: Math.round(itemLv * itemLv * 0.4 + 25), equip, desc };
}
[
  // ---- RÌU (riu → Đốn Củi) ----
  mkTool('eq_riu_1', 'Thiết Phủ',           'riu', 1, 'Rìu sắt thô nặng, nhát bổ chắc tay — công cụ đốn mộc nhập môn.'),
  mkTool('eq_riu_2', 'Lợi Nhận Phủ',        'riu', 2, 'Lưỡi rìu mài bén nước, đốn cây ngọt như chặt thân chuối.'),
  mkTool('eq_riu_3', 'Khai Sơn Phủ',        'riu', 3, 'Rìu lớn khai sơn, một nhát bổ toạc thân cổ thụ ba người ôm.'),
  mkTool('eq_riu_4', 'Huyền Thiết Phủ',     'riu', 4, 'Rèn từ huyền thiết hàn khí, lưỡi sắc chẳng mẻ, đốn ngàn cây không mòn.'),
  mkTool('eq_riu_5', 'Liệt Phong Phủ',      'riu', 5, 'Vung rìu sinh gió, thân mộc đứt lìa trước cả khi nghe tiếng bổ.'),
  mkTool('eq_riu_6', 'Bàn Cổ Cự Phủ',       'riu', 6, 'Phỏng theo rìu Bàn Cổ khai thiên — bổ một nhát, rừng già rạp xuống.'),
  mkTool('eq_riu_7', 'Khai Thiên Thần Phủ', 'riu', 7, 'Thần phủ khai thiên lập địa, thần mộc vạn năm cũng ngã rạp dưới lưỡi.'),
  // ---- CUỐC (cuoc → Đào Khoáng) ----
  mkTool('eq_cuoc_1', 'Thiết Sản',          'cuoc', 1, 'Cuốc sắt thô kệch, bổ vào vách đá moi quặng nông tầng mặt.'),
  mkTool('eq_cuoc_2', 'Kiên Cương Sản',     'cuoc', 2, 'Đầu cuốc tôi cứng, xuyên đá rắn mà không quằn lưỡi.'),
  mkTool('eq_cuoc_3', 'Thấu Địa Sản',       'cuoc', 3, 'Mũi cuốc nhọn thấu lòng đất, lần theo mạch khoáng ẩn sâu.'),
  mkTool('eq_cuoc_4', 'Huyền Thiết Quật',   'cuoc', 4, 'Quật đầu huyền thiết, bổ đá hoa cương như khoét lớp đất mềm.'),
  mkTool('eq_cuoc_5', 'Long Tích Quật',     'cuoc', 5, 'Đầu cuốc khắc vảy long tích, moi tận long mạch chôn kim ngọc.'),
  mkTool('eq_cuoc_6', 'Phá Nham Thần Quật', 'cuoc', 6, 'Một nhát phá tan nham thạch ngàn năm, lộ ra mạch trân khoáng.'),
  mkTool('eq_cuoc_7', 'Quật Địa Thiên Sản', 'cuoc', 7, 'Thần khí quật địa, đào thủng địa tâm chạm tới tầng kim nguyên.'),
  // ---- CẦN CÂU (canCau → Câu Cá) ----
  mkTool('eq_canCau_1', 'Trúc Điếu Can',     'canCau', 1, 'Cần trúc giản dị, buông câu bên sông học lấy chữ kiên nhẫn.'),
  mkTool('eq_canCau_2', 'Thanh Lân Can',     'canCau', 2, 'Cần dẻo lưỡi tinh, cá lớn cắn câu cũng khó lòng vùng thoát.'),
  mkTool('eq_canCau_3', 'Bích Ba Can',       'canCau', 3, 'Cần xanh như sóng biếc, cá tụ về quanh phao như được mời gọi.'),
  mkTool('eq_canCau_4', 'Huyền Tê Điếu Can', 'canCau', 4, 'Thân cần khảm sừng huyền tê, nhạy bén bắt trọn từng cú đớp mồi.'),
  mkTool('eq_canCau_5', 'Long Tu Can',       'canCau', 5, 'Dây câu bện từ râu giao long, kéo cả thủy quái lên mà chẳng đứt.'),
  mkTool('eq_canCau_6', 'Vân Mộng Điếu Can', 'canCau', 6, 'Buông câu nơi ao mây, câu được cả lý ngư nuốt mây Phù Không.'),
  mkTool('eq_canCau_7', 'Thôn Hải Thần Can', 'canCau', 7, 'Thần can thôn hải, một lần buông câu kinh động cả thủy cung long vương.'),
].forEach((it) => { GEAR[it.id] = it; });

// ============================================================
// BỘ TRANG ĐẦU TIÊN — "Bộ Kim Quang" (7 món trừ Vũ Khí). Stat NGANG Độc Nhất (bac7). HIỂN THỊ "Bạch Kim" (set → itemQuality override, halo platinum). set='kimQuang' → set-bonus (dòng ẩn, mặc đủ bộ mới kích — sắp ra mắt). Art user gen: images/equip/<id>.webp. he=null.
// ============================================================
const mkKimQuang = (id, name, slot, icon) => mkGear(id, { name, slot, itemLv: BAC_LEVEL[7], quality: BAC_QUALITY[7], reqLevel: BAC_REQ[7], set: 'kimQuang', icon });
[
  mkKimQuang('eq_kim_quang_trich_tinh_hoan',  'Kim Quang Trích Tinh Hoàn',  'mu',       '⛑️'),
  mkKimQuang('eq_kim_quang_duong_nghe_giap',  'Kim Quang Dương Nghê Giáp',  'giap',     '🥋'),
  mkKimQuang('eq_kim_quang_bach_kim_yeu_dai', 'Kim Quang Bạch Kim Yêu Đái', 'dai',      '🎗️'),
  mkKimQuang('eq_kim_quang_thien_tam_ho_uyen','Kim Quang Thiền Tằm Hộ Uyển','gang',     '🧤'),
  mkKimQuang('eq_kim_quang_thien_tam_ngoa',   'Kim Quang Thiên Tâm Ngọa',   'giay',     '🥾'),
  mkKimQuang('eq_kim_quang_nha_dien_chi_hon', 'Kim Quang Nhã Diện Chi Hồn', 'nhan',     '💍'),
  mkKimQuang('eq_kim_quang_ngu_sac_ngoc_boi', 'Kim Quang Ngũ Sắc Ngọc Bội', 'trangSuc', '📿'),
].forEach((it) => { GEAR[it.id] = it; });

export const GEAR_IDS = Object.keys(GEAR);

// ============================================================
// RÈN ĐÚC (bước 5) — tự sinh công thức rèn từ Thỏi. "1 tier Thỏi = 1 tier gear" (doc §7).
// ============================================================
// Mốc tier Thỏi (khớp reqLevel của daLuyen trong skills.js).
export const THOI_TIERS = [
  { thoi: 'tichDinh',      minLv: 1   }, // Thỏi Thiếc
  { thoi: 'dongDinh',      minLv: 8   }, // Thỏi Đồng
  { thoi: 'thietDinh',     minLv: 18  }, // Thỏi Sắt
  { thoi: 'tinhThachDinh', minLv: 32  },
  { thoi: 'hanThietDinh',  minLv: 48  },
  { thoi: 'hoangKimDinh',  minLv: 60  },
  { thoi: 'vanMauDinh',    minLv: 70  },
  { thoi: 'vanThietDinh',  minLv: 78  },
  { thoi: 'sanHoDinh',     minLv: 92  },
  { thoi: 'thanTinhDinh',  minLv: 100 },
];
export function thoiForLevel(itemLv) {
  let thoi = THOI_TIERS[0].thoi;
  for (const t of THOI_TIERS) { if ((itemLv || 1) >= t.minLv) thoi = t.thoi; else break; }
  return thoi;
}
const THOI_QTY_BY_SLOT = { vuKhi: 6, giap: 6, mu: 4, dai: 4, gang: 4, giay: 4, nhan: 3, trangSuc: 3, toaKy: 5, riu: 3, cuoc: 3, canCau: 2 };
const LIEU_BY_SLOT = { giap: 'langBi', dai: 'langBi', giay: 'langBi', mu: 'langBi', gang: 'langBi', toaKy: 'langBi', vuKhi: 'tungMoc', nhan: 'tungMoc', trangSuc: 'tungMoc', riu: 'tungMoc', cuoc: 'tungMoc', canCau: 'tungMoc' };
const QUALITY_FORGE_MUL = { phamPham: 1, luongPham: 1.2, tinhPham: 1.5, tuyetPham: 2, truyenThe: 2.6, thanPham: 3.4, coBan: 4.5 };

// Tạo 1 công thức Rèn Đúc (action cho SKILLS.daTao) từ 1 item gear.
export function mkGearRecipe(gear) {
  const e = gear.equip || {}; const lv = e.itemLv || 1; const q = gear.quality || 'phamPham';
  const qm = QUALITY_FORGE_MUL[q] || 1;
  const thoiQty = Math.max(2, Math.round((THOI_QTY_BY_SLOT[e.slot] || 4) * qm));
  const lieuQty = Math.max(1, Math.round(2 * qm));
  return {
    id: gear.id, name: gear.name, gloss: 'Forge', itemId: gear.id,
    needsDoPho: !['phamPham', 'luongPham', 'tinhPham'].includes(q) || !!e.forceDoPho, // bậc 4-7 (+ tool bậc 2-3 ép): mỗi lần rèn tốn 1 LƯỢT Đồ Phổ đã lĩnh ngộ
    reqLevel: Math.max(1, Math.round(lv * 0.6)),
    xp: Math.round(lv * 2.2 * qm),
    time: Math.round(28 + lv * 1.4),
    statXp: Math.max(1, Math.round(lv / 12)),
    inputs: [
      { itemId: thoiForLevel(lv), qty: thoiQty },
      { itemId: LIEU_BY_SLOT[e.slot] || 'tungMoc', qty: lieuQty },
    ],
  };
}
// Phẩm chất RÈN ĐƯỢC: chỉ bậc 1-3 (Phàm/Lương/Tinh). Bậc 4-7 (Tuyệt/Truyền Thế/Thần/Cô Bản) đến từ nguồn khác (sau), KHÔNG rèn.
const FORGE_QUALITIES = ['phamPham', 'luongPham', 'tinhPham'];
// Lọc gear RÈN ĐƯỢC từ catalog: có itemLv + slot, không drop-only/boss, và phẩm chất ≤ bậc 3.
// Bậc 1-3 luôn hiện; bậc 4-7 build SẴN action nhưng UI (currentSkillActions) chỉ hiện khi đã LĨNH NGỘ Đồ Phổ.
export function forgeableGear(items) {
  return Object.values(items).filter((it) => it && it.equip && it.equip.itemLv && it.equip.slot && !it.equip.dropOnly && !it.boss);
}

// ============================================================
// LOOT-HUNT (instance gear) — pool 8 affix, primary/slot, trong so phu, roll instance.
//   Moi mon ROI/REN sinh 1 INSTANCE rieng: { uid, gearId, itemLv, quality, reqLevel, stats{roll}, he, eleDmg, plus }.
//   gearId tro ve catalog GEAR (ten/art/slot/weaponType/value/gatherEff). quality ROLL -> so dong (QUALITY_LINES).
// ============================================================

// 8 affix: range gia tri @ itemLv1 phamPham cho 1 dong PHU. Dong primary nhan PRIMARY_MUL.
export const AFFIX = {
  congKich:  { key: 'congKich',  name: 'Công Kích', lo: 4,  hi: 8,  fmt: 'flat' },
  hoThe:     { key: 'hoThe',     name: 'Hộ Thể',    lo: 3,  hi: 6,  fmt: 'flat' },
  sinhLuc:   { key: 'sinhLuc',   name: 'Sinh Lực',  lo: 10, hi: 20, fmt: 'flat' },
  neTranh:   { key: 'neTranh',   name: 'Né Tránh',  lo: 3,  hi: 6,  fmt: 'flat' },
  menhTrung: { key: 'menhTrung', name: 'Chính Xác', lo: 3,  hi: 6,  fmt: 'flat' },
  baoKich:   { key: 'baoKich',   name: 'Bạo Kích',  lo: 1,  hi: 3,  fmt: 'pct' },   // % bao kich suat (vao crit)
  baoSat:    { key: 'baoSat',    name: 'Bạo Sát',   lo: 4,  hi: 10, fmt: 'pct' },   // % bao kich thuong (vao critDmg)
  tocDo:     { key: 'tocDo',     name: 'Tốc Độ',    lo: 2,  hi: 6,  fmt: 'flat' },  // phang (vao spd)
};
export const AFFIX_KEYS = Object.keys(AFFIX);
const PRIMARY_MUL = 2.0;   // dong primary to hon dong phu

// Dong CO DINH (primary) moi slot — luon nam dong 1.
export const SLOT_PRIMARY = {
  vuKhi: 'congKich', giap: 'hoThe', mu: 'hoThe', dai: 'sinhLuc', gang: 'congKich',
  giay: 'neTranh', nhan: 'congKich', trangSuc: 'sinhLuc', toaKy: 'neTranh',
};
// Trong so affix PHU moi slot (10=cao, 4=med, 1=thap). Primary da loai (luon co o dong 1).
export const SLOT_AFFIX_W = {
  vuKhi:    { menhTrung: 10, baoKich: 10, baoSat: 10, tocDo: 4, sinhLuc: 1, neTranh: 1, hoThe: 1 },
  giap:     { sinhLuc: 10, neTranh: 10, menhTrung: 4, congKich: 4, baoKich: 1, tocDo: 1, baoSat: 1 },
  mu:       { sinhLuc: 10, menhTrung: 10, neTranh: 4, baoKich: 4, congKich: 1, tocDo: 1, baoSat: 1 },
  dai:      { hoThe: 10, neTranh: 10, menhTrung: 4, tocDo: 4, congKich: 1, baoKich: 1, baoSat: 1 },
  gang:     { menhTrung: 10, baoKich: 10, baoSat: 4, tocDo: 4, sinhLuc: 1, neTranh: 1, hoThe: 1 },
  giay:     { tocDo: 10, sinhLuc: 10, menhTrung: 4, hoThe: 4, congKich: 1, baoKich: 1, baoSat: 1 },
  nhan:     { baoKich: 10, baoSat: 10, menhTrung: 4, tocDo: 4, sinhLuc: 1, neTranh: 1, hoThe: 1 },
  trangSuc: { hoThe: 10, menhTrung: 10, baoKich: 4, congKich: 4, neTranh: 1, tocDo: 1, baoSat: 1 },
  toaKy:    { tocDo: 10, sinhLuc: 10, hoThe: 4, congKich: 4, menhTrung: 1, baoKich: 1, baoSat: 1 },
};
// So DONG theo pham chat (primary tinh la dong 1).
export const QUALITY_LINES = { phamPham: 1, luongPham: 2, tinhPham: 3, tuyetPham: 4, truyenThe: 5, thanPham: 6, coBan: 7 };

function rollIn(lo, hi) { return lo + Math.random() * (hi - lo); }
// Boc 1 key tu {key:weight}, bo cac key trong `used` (Set). null neu het.
function wPick(wmap, used) {
  let tot = 0; const ks = [];
  for (const k in wmap) { if (used.has(k)) continue; ks.push(k); tot += wmap[k]; }
  if (!ks.length || tot <= 0) return null;
  let r = Math.random() * tot;
  for (const k of ks) { r -= wmap[k]; if (r <= 0) return k; }
  return ks[ks.length - 1];
}
let _uidSeq = 0;
function genUid() { _uidSeq = (_uidSeq + 1) % 1e9; return 'g' + Date.now().toString(36) + '_' + _uidSeq.toString(36); }

// Roll bo chi so 1 mon: primary (xPRIMARY_MUL) + (lines-1) dong phu boc theo trong so slot. -> {key:val}.
export function rollGearStats(slot, itemLv, quality) {
  const lines = QUALITY_LINES[quality] || 1;
  const k = LV_MUL(itemLv) * (QUALITY_MUL[quality] || 1);
  const prim = SLOT_PRIMARY[slot];
  const out = {}; const used = new Set();
  if (prim && AFFIX[prim]) { out[prim] = Math.max(1, Math.round(rollIn(AFFIX[prim].lo, AFFIX[prim].hi) * k * PRIMARY_MUL)); used.add(prim); }
  const wmap = SLOT_AFFIX_W[slot] || {};
  for (let i = 1; i < lines; i++) {
    const key = wPick(wmap, used);
    if (!key || !AFFIX[key]) break;
    out[key] = Math.max(1, Math.round(rollIn(AFFIX[key].lo, AFFIX[key].hi) * k));
    used.add(key);
  }
  return out;
}

// Tra cuu base cho instance: mac dinh GEAR; items.js goi setGearLookup(ITEMS) de bao gom CA 3 mon
// equippable legacy (tichSao/thietKiem/tichGiap) nam o ITEMS nhung KHONG o GEAR (id khong 'eq_'). Tranh import vong.
let GEAR_LOOKUP = GEAR;
export function setGearLookup(map) { if (map) GEAR_LOOKUP = map; }

// % ROLL cua 1 dong (0..1): vi tri gia tri trong [min,max] = lo/hi × LV_MUL × QUALITY_MUL × (primary?PRIMARY_MUL:1).
// Dung de to mau bac roll (Pham/Luong/Thuong/Cuc/Tuyet). null neu khong xac dinh duoc.
export function lineRollPct(slot, quality, itemLv, key, value) {
  const a = AFFIX[key]; if (!a || value == null) return null;
  const k = LV_MUL(itemLv) * (QUALITY_MUL[quality] || 1);
  const pmul = (SLOT_PRIMARY[slot] === key) ? PRIMARY_MUL : 1;
  const min = Math.max(1, Math.round(a.lo * k * pmul));
  const max = Math.max(1, Math.round(a.hi * k * pmul));
  if (max <= min) return 1;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

// Tao 1 INSTANCE gear ROLL tu base catalog. opt: { itemLv?, quality? } (mac dinh lay tu base).
export function rollGearInstance(gearId, opt) {
  const base = GEAR_LOOKUP[gearId]; if (!base || !base.equip) return null;
  const e = base.equip;
  const itemLv = (opt && opt.itemLv) || e.itemLv || 1;
  const quality = (opt && opt.quality) || base.quality || 'phamPham';
  const he = e.he || null;
  const stats = e.gatherEff ? {} : rollGearStats(e.slot, itemLv, quality);   // tool: khong roll stat
  const rolls = {};
  for (const k in stats) rolls[k] = lineRollPct(e.slot, quality, itemLv, k, stats[k]);   // luu % roll moi dong -> to mau bac
  return {
    uid: genUid(), gearId, itemLv, quality, reqLevel: e.reqLevel || 1,
    stats, rolls, he, eleDmg: he ? (e.eleDmg || 0.10) : 0, plus: 0,
  };
}
// Instance DETERMINISTIC tu catalog (migration / gear cu) — giu NGUYEN stat & pham chat catalog (khong doi suc manh nguoi dang choi).
export function instanceFromCatalog(gearId, plus) {
  const base = GEAR_LOOKUP[gearId]; if (!base || !base.equip) return null;
  const e = base.equip;
  return {
    uid: genUid(), gearId, itemLv: e.itemLv || 1, quality: base.quality || 'phamPham', reqLevel: e.reqLevel || 1,
    stats: { ...(e.stats || {}) }, he: e.he || null, eleDmg: e.eleDmg || 0, plus: plus || 0,
  };
}

// ---- DROP tu quai thuong ----
export const MONSTER_DROP_CHANCE = 0.003;   // 0.3% / kill (truoc khi nhan lootMul)
// Cuoc pham quai thuong: CAP o Cuc Hiem (Su Thi+ den tu Bi Canh/Forge).
export const MONSTER_QUALITY_W = { phamPham: 60, luongPham: 25, tinhPham: 10, tuyetPham: 5 };

// slot deo duoc -> [{id,itemLv}] asc (bo tool gatherEff).
export const GEAR_BY_SLOT = (() => {
  const m = {};
  for (const id of Object.keys(GEAR)) {
    const e = GEAR[id].equip; if (!e || e.gatherEff) continue;
    (m[e.slot] = m[e.slot] || []).push({ id, itemLv: e.itemLv || 1 });
  }
  for (const s in m) m[s].sort((a, b) => a.itemLv - b.itemLv);
  return m;
})();
const DROP_SLOTS = Object.keys(GEAR_BY_SLOT);

export function rollQuality(wmap) {
  let tot = 0; for (const q in wmap) tot += wmap[q];
  let r = Math.random() * tot;
  for (const q in wmap) { r -= wmap[q]; if (r <= 0) return q; }
  return 'phamPham';
}
// Chon base (gearId) co tier itemLv gan `level` nhat, slot ngau nhien (vu khi gom nhieu loai cung tier -> random loai).
export function pickDropBase(level) {
  const slot = DROP_SLOTS[Math.floor(Math.random() * DROP_SLOTS.length)];
  const arr = GEAR_BY_SLOT[slot] || []; if (!arr.length) return null;
  let best = arr[0], bd = Infinity;
  for (const x of arr) { const d = Math.abs(x.itemLv - level); if (d < bd) { bd = d; best = x; } }
  const near = arr.filter((x) => x.itemLv === best.itemLv);
  return near[Math.floor(Math.random() * near.length)].id;
}
// Roll 1 drop gear tu quai cap `level` -> instance (hoac null).
export function rollMonsterDrop(level) {
  const gearId = pickDropBase(Math.max(1, level || 1));
  if (!gearId) return null;
  return rollGearInstance(gearId, { quality: rollQuality(MONSTER_QUALITY_W) });
}
