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
// DOT 3 — PHAN VAI LAI O: Cong CHI con tren Vu Khi / Nhan / Trang Suc.
// Giap tru (mu/giap/dai/gang/giay) = Thu + Sinh Luc + Ne + Chinh Xac + KHANG (Dot 2). Khong Cong.
// Toa Ky = than phap + suc ben (Toc Do/Ne Tranh/Sinh Luc/Hoi Mau). Khong Cong, khong Khang.
// Gang MAT primary congKich (no la 1 trong 3 primary Cong duy nhat) -> doi sang menhTrung.
export const BASE_BY_SLOT = {
  vuKhi:    { congKich: 11 },                 // nguồn Công chính
  giap:     { hoThe: 6, sinhLuc: 18 },        // Thủ + Sinh Lực (gộp cả vai trò "quần")
  mu:       { hoThe: 4, menhTrung: 3 },
  dai:      { sinhLuc: 12, hoThe: 3 },
  gang:     { menhTrung: 6, hoThe: 2 },       // DOT 3: bo congKich -> o "Chinh Xac"
  giay:     { neTranh: 5, sinhLuc: 6 },
  nhan:     { congKich: 4, menhTrung: 2 },
  trangSuc: { congKich: 5, sinhLuc: 10 },     // Dây Chuyền / Ngọc Bội — DOT 3: thanh o Cong thu ba
  toaKy:    { sinhLuc: 8, neTranh: 2 },
};
// He so BU CONG cho 3 o giu lai Cong (Vu Khi / Nhan / Trang Suc).
// Do tu harness: bo Cong khoi giap tru + ngua lam mat 33,3% (bac1) -> 41,2% (bac7) TONG Cong gear.
// He so phai TANG theo PHAM CHAT chu khong theo cap: pham chat cao = nhieu dong affix hon = mat nhieu hon.
const BU_CONG = { phamPham: 1.50, luongPham: 1.56, tinhPham: 1.64, tuyetPham: 1.69, truyenThe: 1.80, thanPham: 1.92, coBan: 2.04 };
const CONG_SLOTS = ['vuKhi', 'nhan', 'trangSuc'];
export function buCong(slot, key, quality) {
  return (key === 'congKich' && CONG_SLOTS.indexOf(slot) >= 0) ? (BU_CONG[quality] || 1) : 1;
}

// Sinh chỉ số nền của 1 món: base[slot] × LV_MUL × QUALITY_MUL, làm tròn (tối thiểu 1).
export function mkEquipStats(slot, itemLv = 1, quality = 'phamPham') {
  const base = BASE_BY_SLOT[slot] || {};
  const k = LV_MUL(itemLv) * (QUALITY_MUL[quality] || 1);
  const out = {};
  // buCong: duong instanceFromCatalog (migrate save cu + Bo Kim Quang) cung phai duoc bu Cong,
  // khong thi do di duong nay yeu han han do roll cung bac.
  for (const s in base) out[s] = Math.max(1, Math.round(base[s] * k * buCong(slot, s, quality)));
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
  mkBac('eq_vai_giay',   'Giày Vải',   'giay', 1),   // ⚠ chỉ đổi TÊN HIỆN, giữ nguyên id vì id nằm trong save
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
// CÔNG CỤ (tools) — Rìu/Cuốc/Cần Câu/Dược Liêm × 7 bậc. Tăng HIỆU SUẤT khai thác (gatherEff 5%→50% theo bậc).
// Bậc 4-7 = Đồ Phổ (tự sinh dp_ ở items.js vì quality tuyetPham+). Equip vào TOOL_SLOTS (riu/cuoc/canCau/duocLiem).
// ============================================================
export const TOOL_EFF_BY_BAC = { 1: 0.05, 2: 0.10, 3: 0.20, 4: 0.25, 5: 0.35, 6: 0.40, 7: 0.50 };
const TOOL_SLOT_SKILL = { riu: 'phatMoc', cuoc: 'thaiKhoang', canCau: 'dieuNgu', duocLiem: 'thaiDuoc' };
const TOOL_ICON = { riu: '🪓', cuoc: '⛏️', canCau: '🎣', duocLiem: '🌾' };
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

  // ---- DƯỢC LIÊM (duocLiem → Hái Thuốc) ----
  mkTool('eq_duocLiem_1', 'Thiết Liêm',        'duocLiem', 1, 'Liềm sắt thô nặng, lưỡi cong bám sát mặt đất, cắt cỏ thuốc gọn một nhát.'),
  mkTool('eq_duocLiem_2', 'Lợi Nhận Liêm',     'duocLiem', 2, 'Lưỡi mài mỏng như lá lúa, cắt ngọt thân thảo mà chẳng dập nhựa.'),
  mkTool('eq_duocLiem_3', 'Bách Thảo Liêm',    'duocLiem', 3, 'Liềm quen tay kẻ hái trăm loài cỏ, sống liềm khắc vạch đo đốt thân dược.'),
  mkTool('eq_duocLiem_4', 'Huyền Thiết Liêm',  'duocLiem', 4, 'Rèn từ huyền thiết hàn khí, lưỡi lạnh giữ dược tính không tan theo nắng.'),
  mkTool('eq_duocLiem_5', 'Lộ Ngưng Liêm',     'duocLiem', 5, 'Sương đọng trên lưỡi chẳng chịu rơi — cắt đúng khắc, dược lực còn nguyên.'),
  mkTool('eq_duocLiem_6', 'Thần Nông Liêm',    'duocLiem', 6, 'Phỏng theo liềm Thần Nông nếm trăm cỏ, chạm vào là biết độc hay lành.'),
  mkTool('eq_duocLiem_7', 'Thái Ất Kim Liêm',  'duocLiem', 7, 'Kim liềm Thái Ất, lưỡi cong ôm trọn linh khí — thần thảo vạn năm cũng ngoan ngoãn lìa gốc.'),
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

// ============================================================
// MƯỜI BỘ TRANG BẠCH KIM (đợt 2) — 70 món, mỗi bộ 7 ô (Mũ/Áo/Đai/Găng/Giày/Nhẫn/Trang Sức).
// TẤT CẢ đều bậc 7 (Cô Bản, itemLv 100): mười một bộ NGANG SỨC, khác nhau ở CHẤT chứ không ở
// mạnh yếu — người chơi chọn bộ theo lối đánh. Riêng CẤP YÊU CẦU rải 55→81 để mở khoá dần theo
// tiến độ, không đổ ập một lúc. (Kim Quang giữ nguyên Lv81 — không đụng người đang chơi.)
//
// `he` CHỈ để hiển thị + làm căn cứ cho dòng ẩn Cộng Hưởng. eleDmg = 0 CÓ CHỦ Ý: cộng hưởng nằm ở
// dòng ẩn BẬC 7, không rải đều từng món — 7 món × 0,10 là +70% sát thương một hệ, vỡ trận ngay.
// Năm hệ × hai bộ + Kim Quang (Vô Hệ) = 11. Hai bộ cùng hệ luôn khác vai: một công, một thủ.
//
// ⚠ CHƯA CÓ ĐƯỜNG LẤY TRONG GAME. Nguồn rơi Đồ Phổ chưa chốt nên KHÔNG gắn drop ở đâu cả — khai
// đủ dữ liệu cho hệ thống chạy, nhưng người chơi chưa nhặt được. Chốt nguồn xong mới nối vào.
// ============================================================
const BK_SLOT = { quan: 'mu', giap: 'giap', dai: 'dai', uyen: 'gang', ngoa: 'giay', gioi: 'nhan', boi: 'trangSuc' };
const BK_ICON = { mu: '⛑️', giap: '🥋', dai: '🎗️', gang: '🧤', giay: '🥾', nhan: '💍', trangSuc: '📿' };
// id món = 'eq_' + slug + '_' + hậu tố; ô suy ra từ ĐOẠN CUỐI của hậu tố (quan/giap/dai/uyen/ngoa/gioi/boi).
// Tên hiển thị = tên bộ (bỏ chữ "Bộ") + tên món, giống lối đặt của Kim Quang.
export const BACH_KIM_SETS = [
  { key: 'anBang', slug: 'an_bang', name: 'Bộ An Bang', he: 'tho', req: 55, pieces: {
      tran_nhac_quan: 'Trấn Nhạc Quan', ho_quoc_giap: 'Hộ Quốc Giáp', dinh_son_dai: 'Định Sơn Đái',
      ban_thach_uyen: 'Bàn Thạch Uyển', tran_dia_ngoa: 'Trấn Địa Ngoa', tran_tam_gioi: 'Trấn Tâm Giới',
      ho_linh_boi: 'Hộ Linh Bội' } },
  { key: 'nhuTinh', slug: 'nhu_tinh', name: 'Bộ Nhu Tình', he: 'moc', req: 55, pieces: {
      luu_hoa_quan: 'Lưu Hoa Quan', ngoc_vu_giap: 'Ngọc Vũ Giáp', toa_huong_dai: 'Tỏa Hương Đái',
      lien_tam_uyen: 'Liên Tâm Uyển', lang_ba_ngoa: 'Lăng Ba Ngoa', ngung_mong_gioi: 'Ngưng Mộng Giới',
      tam_nguyet_boi: 'Tâm Nguyệt Bội' } },
  { key: 'bachHong', slug: 'bach_hong', name: 'Bộ Bạch Hồng', he: 'kim', req: 60, pieces: {
      xung_tieu_quan: 'Xung Tiêu Quan', luu_quang_giap: 'Lưu Quang Giáp', toa_van_dai: 'Tỏa Vân Đái',
      pha_anh_uyen: 'Phá Ảnh Uyển', truy_phong_ngoa: 'Truy Phong Ngoa', ngung_nguyet_gioi: 'Ngưng Nguyệt Giới',
      huyen_quang_boi: 'Huyền Quang Bội' } },
  { key: 'thuongLan', slug: 'thuong_lan', name: 'Bộ Thương Lan', he: 'thuy', req: 60, pieces: {
      kinh_dao_quan: 'Kình Đào Quan', han_nguyet_giap: 'Hàn Nguyệt Giáp', hoanh_giang_dai: 'Hoành Giang Đái',
      pha_lang_uyen: 'Phá Lãng Uyển', dap_lang_ngoa: 'Đạp Lãng Ngoa', ngung_suong_gioi: 'Ngưng Sương Giới',
      hai_tam_boi: 'Hải Tâm Bội' } },
  { key: 'dinhQuoc', slug: 'dinh_quoc', name: 'Bộ Định Quốc', he: 'kim', req: 65, pieces: {
      thien_uy_quan: 'Thiên Uy Quan', huyen_giap: 'Huyền Giáp', tran_quan_dai: 'Trấn Quân Đái',
      thiet_ho_uyen: 'Thiết Hộ Uyển', dap_tran_ngoa: 'Đạp Trận Ngoa', ho_menh_gioi: 'Hộ Mệnh Giới',
      long_van_boi: 'Long Vân Bội' } },
  { key: 'thanhHu', slug: 'thanh_hu', name: 'Bộ Thanh Hư', he: 'thuy', req: 65, pieces: {
      lang_van_quan: 'Lăng Vân Quan', ngu_phong_giap: 'Ngự Phong Giáp', toa_linh_dai: 'Tỏa Linh Đái',
      van_tu_uyen: 'Vân Tụ Uyển', truc_van_ngoa: 'Trục Vân Ngoa', ngung_than_gioi: 'Ngưng Thần Giới',
      huyen_ngoc_boi: 'Huyền Ngọc Bội' } },
  { key: 'hongAnh', slug: 'hong_anh', name: 'Bộ Hồng Ảnh', he: 'hoa', req: 70, pieces: {
      vo_tung_quan: 'Vô Tung Quan', am_hanh_giap: 'Ám Hành Giáp', toa_hon_dai: 'Tỏa Hồn Đái',
      liet_ngan_uyen: 'Liệt Ngân Uyển', me_tung_ngoa: 'Mê Tung Ngoa', nhiep_phach_gioi: 'Nhiếp Phách Giới',
      tan_nguyet_boi: 'Tàn Nguyệt Bội' } },
  { key: 'tuDien', slug: 'tu_dien', name: 'Bộ Tử Điện', he: 'moc', req: 70, pieces: {
      chan_dinh_quan: 'Chấn Đình Quan', kinh_loi_giap: 'Kinh Lôi Giáp', bon_loi_dai: 'Bôn Lôi Đái',
      liet_dien_uyen: 'Liệt Điện Uyển', dien_bo_ngoa: 'Điện Bộ Ngoa', ngung_quang_gioi: 'Ngưng Quang Giới',
      huyen_loi_boi: 'Huyền Lôi Bội' } },
  { key: 'thatSat', slug: 'that_sat', name: 'Bộ Thất Sát', he: 'hoa', req: 75, pieces: {
      tham_lang_quan: 'Tham Lang Quan', huyen_minh_giap: 'Huyền Minh Giáp', doat_menh_dai: 'Đoạt Mệnh Đái',
      doan_mach_uyen: 'Đoạn Mạch Uyển', truy_anh_ngoa: 'Truy Ảnh Ngoa', ngung_huyet_gioi: 'Ngưng Huyết Giới',
      pha_quan_boi: 'Phá Quân Bội' } },
  { key: 'minhVuong', slug: 'minh_vuong', name: 'Bộ Minh Vương', he: 'tho', req: 81, pieces: {
      tran_thien_quan: 'Trấn Thiên Quan', ho_tam_giap: 'Hộ Tâm Giáp', toa_son_dai: 'Tỏa Sơn Đái',
      kim_cang_uyen: 'Kim Cang Uyển', dap_van_ngoa: 'Đạp Vân Ngoa', tran_hon_gioi: 'Trấn Hồn Giới',
      tran_bat_dong_boi: 'Trấn Bất Động Bội' } },
];
BACH_KIM_SETS.forEach((s) => {
  const tenBo = s.name.replace(/^Bộ /, '');
  for (const pk in s.pieces) {
    const slot = BK_SLOT[pk.slice(pk.lastIndexOf('_') + 1)];
    if (!slot) throw new Error('Bo Bach Kim ' + s.key + ': hau to o khong hop le -> ' + pk);
    const id = 'eq_' + s.slug + '_' + pk;
    GEAR[id] = mkGear(id, {
      name: tenBo + ' ' + s.pieces[pk], slot,
      itemLv: BAC_LEVEL[7], quality: BAC_QUALITY[7], reqLevel: s.req,
      he: s.he, eleDmg: 0, set: s.key, icon: BK_ICON[slot],
    });
  }
});

export const GEAR_IDS = Object.keys(GEAR);

// ============================================================
// DÒNG ẨN CỦA BỘ TRANG — mặc đủ 3 / 5 / 7 món mới kích. CỘNG DỒN (đủ 7 thì ăn cả ba bậc).
//
// ĐẾM THEO MÓN ĐANG MẶC, không phải món sở hữu. setOwnedCount() ở main.js đếm SỞ HỮU (túi + đang
// mặc) để chạy thanh tiến độ Bách Trang Các — TUYỆT ĐỐI không dùng nó làm đầu vào cho dòng ẩn.
//
// VÌ SAO GIÁ TRỊ ĐẶT THẤP HƠN ĐỒ RỜI: đồ bộ ghép ra bằng instanceFromCatalog nên KHÔNG có dòng affix
// roll nào. Đo ở Lv100 trên cùng 7 ô: bộ Bạch Kim 3.519 Chiến Lực, đồ bậc 7 thường roll trung bình
// 5.497 (−36%), lại trống hẳn Bạo Kích / Sát Thương Bạo Kích / Tốc Độ. Đó là ĐÁNH ĐỔI CÓ CHỦ Ý:
// dòng ẩn KHÔNG bù lại phần chỉ số thô đã mất, nó trả bằng thứ không dòng roll nào đẻ ra được.
// Vì vậy mọi dòng phụ trợ (bậc 3/5) đều cố ý để bộ VẪN THẤP HƠN đồ rời trên chính trục đó.
//
// BỐN KÊNH — engine tự phân loại theo TÊN KHOÁ (xem SET_PCT_KEYS/SET_ELE_KEY/SET_MISC_KEYS ở
// engine/stats.js). Ghi sai kênh thì giá trị rơi vào hư không, KHÔNG BÁO LỖI:
//   A. Khoá trùng tên 21 chỉ số gearStats  -> ĐIỂM NGUYÊN, cộng thẳng vào bộ tích luỹ, trần tự áp.
//   B. atkPct / defPct / hpPct / allPct    -> TỈ LỆ (0,12 = 12%), nhân ở derivedStats. KHÔNG dòng
//      roll nào cho % nhân — cả bảng AFFIX chỉ có điểm phẳng.
//   C. congHuong                            -> TỈ LỆ, cộng vào Cộng Hưởng ĐÚNG HỆ CỦA BỘ (`he`).
//   D. hieuLucDan                           -> TỈ LỆ, nhân hiệu lực đan dược + thức ăn.
//
// SỐ ĐO PHẢI NHỚ KHI TUNE:
// • Giảm thời gian khống chế cắt TICK NGUYÊN: Math.round(ticks × (1−giảm)). Ngất/Choáng chỉ 1 tick
//   -> ≤50 điểm KHÔNG LÀM GÌ CẢ, ≥51 là miễn tuyệt đối. Bỏng/Chậm 3 tick: <17→3 hiệp, 17-50→2,
//   51-60→1. Độc 4 tick: <13→4, 13-37→3, 38-62→2. Đặt số không chạm ngưỡng = ném đi.
// • Kháng đơn hệ chỉ ăn 1/5 số trận (quái roll hệ ngẫu nhiên mỗi trận). Trần 50 -> dừng ở 35,
//   chừa chỗ cho dòng roll còn có nghĩa.
// • baoSat (Sát Thương Bạo Kích) KHÔNG có trần — trục an toàn để đổ số.
// • tangCong trần cộng dồn 3 -> cho bộ ăn 2, chừa 1 cho dòng roll hiếm nhất game.
// • Chính Xác gần như vô dụng toàn game (né của quái chỉ 2-12%) — không lấy làm chữ ký bộ nào.
//
// MỌI SỐ Ở ĐÂY LÀ DRAFT.
// ============================================================
export const SET_BONUS = {
  // --- VÔ HỆ: chống mọi thứ, không thiên lệch ---
  kimQuang: {
    3: { khangAll: 6 },                 // +6% kháng CẢ NĂM hệ — dòng roll chỉ cho 1-3 và chỉ ở Trang Sức
    5: { khangAll: 6 },                 // cộng dồn -> 12
    7: { allPct: 0.12 },                // Công/Thủ/Sinh Lực/Né/Chính Xác cùng ×1,12
  },
  // --- KIM ---
  bachHong: {                            // CÔNG — bạo kích
    3: { baoKich: 8 },
    5: { baoKich: 8 },                  // tổng 16 điểm
    7: { congHuong: 0.30 },             // Cộng Hưởng Kim +30%
  },
  dinhQuoc: {                            // THỦ — cứng đòn Kim
    3: { khangKim: 15 },
    5: { khangKim: 20 },                // tổng 35, chừa 15 cho dòng roll. Tăng dần cho khỏi đọc như tụt.
    7: { defPct: 0.25 },
  },
  // --- MỘC ---
  tuDien: {                              // CÔNG — tốc độ
    3: { tocDo: 120 },
    5: { tocDo: 120 },                  // tổng 240; đồ rời bậc 7 roll trung bình 459 -> vẫn thua
    7: { congHuong: 0.30 },
  },
  nhuTinh: {                             // THỦ — giải độc, dưỡng thân
    3: { khangMoc: 20 },
    5: { giamDoc: 38 },                 // Độc 4 tick -> còn 2 hiệp (ngưỡng 38)
    7: { hieuLucDan: 0.40 },            // đan dược + thức ăn mạnh thêm 40%
  },
  // --- THỦY ---
  thuongLan: {                           // CÔNG — dập lửa
    3: { giamBong: 17 },                // Bỏng 3 tick -> 2 hiệp
    5: { giamBong: 34 },                // tổng 51 -> còn 1 hiệp
    7: { congHuong: 0.30 },
  },
  thanhHu: {                             // THỦ — thông huyền, mở tầng chiêu
    3: { khangThuy: 15 },
    5: { khangThuy: 20 },
    7: { tangCong: 2 },                 // +2 Tầng mọi chiêu đang lắp (trần 3)
  },
  // --- HỎA ---
  thatSat: {                             // CÔNG — sát thủ, đòn chí mạng
    3: { baoSat: 40 },                  // không trần
    5: { atkPct: 0.12 },
    7: { congHuong: 0.30 },
  },
  hongAnh: {                             // THỦ — BỘ TU LUYỆN, tổng +40% EXP
    3: { tangExp: 10 },
    5: { tangExp: 12 },
    7: { tangExp: 18 },                 // cộng dồn = 40
  },
  // --- THỔ ---
  anBang: {                              // CÔNG — trấn giữ, bền
    3: { hpPct: 0.15 },
    5: { giamChoang: 51 },              // Choáng 1 tick -> miễn tuyệt đối
    7: { congHuong: 0.30 },
  },
  minhVuong: {                           // THỦ — bất động, miễn ngất
    3: { khangTho: 15 },
    5: { khangTho: 20 },
    7: { giamNgat: 51 },                // Ngất 1 tick -> miễn tuyệt đối
  },
};

// BỘ TRANG (set gear) — curate, KHÔNG rơi random. Nguồn = ghép từ "Mảnh Trang Bị Hoàng Kim" (currency CHUNG mọi bộ),
// mở khoá từng bộ bằng "Đồ Phổ Bộ …" (blueprint riêng, rơi ở nội dung của bộ đó → kho mảnh cũ không mua sạch bộ mới).
// Thêm bộ mới về sau = khai báo 1 entry vào TRANG_SETS (+ item Đồ Phổ + gán drop blueprint ở nội dung của bộ).
export const KIM_QUANG_IDS = GEAR_IDS.filter((id) => ((GEAR[id].equip) || {}).set === 'kimQuang');
// GIÁ 1 MÓN — cần 7×60 = 420 Mảnh cho trọn bộ. Neo vào thu nhập Mảnh/ngày ở trần treo máy 8 giờ:
// lối cày quái 8,3/ngày -> ~50 ngày · lối Bí Cảnh 10/ngày -> ~42 ngày. Mốc dòng ẩn 3 món = 180 Mảnh
// (~3 tuần) là lần nếm vị đầu tiên. MỘT số này chỉnh dài/ngắn cả chuỗi — đừng sửa tỉ lệ rơi.
const MANH_COST = 60;
// Nguồn Mảnh — CHUNG cho cả 11 bộ. Màn Bách Trang Các đọc chuỗi này; sửa nguồn rơi ở
// engine/activity.js · engine/dungeon.js · engine/worldboss.js thì phải sửa luôn câu này.
const MANH_SOURCE = 'quái Lv 90+ · thông quan Bí Cảnh · Yêu Vương Lv 90+';
// Bí Cảnh "nhà" của từng bộ — Đồ Phổ Bộ rơi ở đây (data/dungeon.js loot.rare). Ghép theo HỆ:
// mỗi phó bản hệ nào giữ đúng 2 bộ hệ đó. Bảng rơi THẬT nằm ở dungeon.js — bảng này chỉ dựng chữ
// cho màn Bách Trang Các. SỬA MỘT BÊN PHẢI SỬA BÊN KIA, lệch nhau là chỉ người chơi chạy sai chỗ.
const BK_HOME = {
  kimQuang: 'Thái Hư Bí Cảnh',
  thuongLan: 'Băng Tâm Hàn Đàm', thanhHu: 'Băng Tâm Hàn Đàm',
  hongAnh: 'Xích Diệm Địa Cung', thatSat: 'Xích Diệm Địa Cung',
  bachHong: 'Cổ Mộ Kiếm Tông', dinhQuoc: 'Cổ Mộ Kiếm Tông',
  nhuTinh: 'Vạn Yêu Sơn', tuDien: 'Vạn Yêu Sơn',
  anBang: 'Thiên Cơ Di Tích', minhVuong: 'Thiên Cơ Di Tích',
};
export const TRANG_SETS = {
  kimQuang: {
    key: 'kimQuang', name: 'Bộ Kim Quang', display: 'Bạch Kim', color: '#d6e3f2',
    pieces: KIM_QUANG_IDS,           // 7 món (mu/giap/dai/gang/giay/nhan/trangSuc)
    manhCost: MANH_COST,             // Mảnh / 1 món
    blueprintId: 'dpset_kimQuang',   // Đồ Phổ mở khoá bộ này
    blueprintSource: BK_HOME.kimQuang,   // Bí Cảnh rơi Đồ Phổ — màn Bách Trang Các đọc để chỉ chỗ
    source: MANH_SOURCE,
    he: null,                        // Vô Hệ: không ăn khắc, không bị kháng chặn
    bonus: SET_BONUS.kimQuang,       // dòng ẩn 3/5/7 món
  },
};
// 10 bộ Bạch Kim đợt 2 — cùng khuôn với Kim Quang. HAI TRỤC tách bạch: Đồ Phổ quyết ĐUỔI BỘ NÀO
// (rơi ở Bí Cảnh nhà nó, mở cửa trong vài ngày — là CỬA, không phải TƯỜNG); Mảnh quyết BAO LÂU
// (rơi ở quái Lv90+ · Bí Cảnh · Yêu Vương, nên cày hay chạy phó bản đều tiến — ô activity độc quyền
// nên trói Mảnh vào một hoạt động là ép người chơi bỏ cái kia).
BACH_KIM_SETS.forEach((s) => {
  TRANG_SETS[s.key] = {
    key: s.key, name: s.name, display: 'Bạch Kim', color: '#d6e3f2', he: s.he,
    pieces: GEAR_IDS.filter((id) => ((GEAR[id].equip) || {}).set === s.key),
    manhCost: MANH_COST,
    blueprintId: 'dpset_' + s.key,
    blueprintSource: BK_HOME[s.key] || null,
    source: MANH_SOURCE,
    bonus: SET_BONUS[s.key] || null,    // dòng ẩn 3/5/7 món
  };
});
export const TRANG_SET_KEYS = Object.keys(TRANG_SETS);

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
const THOI_QTY_BY_SLOT = { vuKhi: 6, giap: 6, mu: 4, dai: 4, gang: 4, giay: 4, nhan: 3, trangSuc: 3, toaKy: 5, riu: 3, cuoc: 3, canCau: 2, duocLiem: 2 };
const LIEU_BY_SLOT = { giap: 'langBi', dai: 'langBi', giay: 'langBi', mu: 'langBi', gang: 'langBi', toaKy: 'langBi', vuKhi: 'tungMoc', nhan: 'tungMoc', trangSuc: 'tungMoc', riu: 'tungMoc', cuoc: 'tungMoc', canCau: 'tungMoc', duocLiem: 'tungMoc' };
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
  // `!it.equip.set`: đồ Bộ Trang KHÔNG nằm trong Rèn Đúc (nguồn của nó là ghép Mảnh + Đồ Phổ Bộ).
  // Không loại thì catalog rèn phình thêm 77 công thức mà Đồ Phổ của chúng không tồn tại -> chết cứng.
  return Object.values(items).filter((it) => it && it.equip && it.equip.itemLv && it.equip.slot && !it.equip.dropOnly && !it.equip.set && !it.boss);
}

// ============================================================
// LOOT-HUNT (instance gear) — pool 8 affix, primary/slot, trong so phu, roll instance.
//   Moi mon ROI/REN sinh 1 INSTANCE rieng: { uid, gearId, itemLv, quality, reqLevel, stats{roll}, he, eleDmg, plus }.
//   gearId tro ve catalog GEAR (ten/art/slot/weaponType/value/gatherEff). quality ROLL -> so dong (QUALITY_LINES).
// ============================================================

// 8 affix: range gia tri @ itemLv1 phamPham cho 1 dong PHU. Dong primary nhan PRIMARY_MUL.
// + 6 dong KHANG NGU HANH (dai phau Dot 2) — xem chu thich `noLv` ngay duoi.
export const AFFIX = {
  congKich:  { key: 'congKich',  name: 'Công Kích', lo: 4,  hi: 8,  fmt: 'flat' },
  hoThe:     { key: 'hoThe',     name: 'Hộ Thể',    lo: 3,  hi: 6,  fmt: 'flat' },
  sinhLuc:   { key: 'sinhLuc',   name: 'Sinh Lực',  lo: 10, hi: 20, fmt: 'flat' },
  neTranh:   { key: 'neTranh',   name: 'Né Tránh',  lo: 3,  hi: 6,  fmt: 'flat' },
  menhTrung: { key: 'menhTrung', name: 'Chính Xác', lo: 3,  hi: 6,  fmt: 'flat' },
  // baoKich/baoSat la % nen KHONG duoc nhan cap (noLv) — y het khang. Do truoc khi sua: he so bac 7
  // la x23,60 nen MOT dong baoKich ra 24..71 DIEM = 24-71% bao kich, ca bo ra 303 diem -> crit cham
  // tran 0,75 o 100% so lan (bac 5 da 87%). baoSat con te hon: 682 diem = critDmg x8,42 va KHONG co tran.
  // Nay chi nhan pham chat (x1,0 -> x3,4): crit len theo do hiem chu khong tu dong kich tran.
  baoKich:   { key: 'baoKich',   name: 'Bạo Kích',  lo: 1,  hi: 3,  fmt: 'pct', noLv: true },   // % bao kich suat (vao crit)
  baoSat:    { key: 'baoSat',    name: 'Sát Thương Bạo Kích', lo: 4, hi: 10, fmt: 'pct', noLv: true },   // % bao kich thuong (vao critDmg)
  tocDo:     { key: 'tocDo',     name: 'Tốc Độ',    lo: 2,  hi: 6,  fmt: 'flat' },  // phang (vao spd)
  // ---- KHANG NGU HANH: SO NGUYEN DIEM phan tram, chia /100 + kep tran o derivedStats ----
  // noLv:true = KHONG nhan LV_MUL (chi nhan QUALITY_MUL). Bat buoc: k = LV_MUL x QUALITY_MUL tai bac 7
  // (Lv100 coBan) = 23,60 -> mot dong lo/hi 3..6 se thanh 71..142 DIEM = 71-142% khang tu MOT dong.
  // Chi cho pham chat quyet dinh do lon -> khang van len theo do hiem, ma khong no theo cap.
  // TÊN HIỂN THỊ đổi sang lối tên sát thương quen thuộc (user chốt). KHOÁ giữ nguyên khangKim/khangMoc/...
  // nên cơ chế, trần 50%, đường tính đều KHÔNG đổi một dòng nào — chỉ đổi chữ hiện ra.
  // Ràng buộc hệ vẫn y nguyên: Kim gây Ngất · Mộc gây Độc · Thủy gây Chậm · Hỏa gây Bỏng · Thổ gây Choáng.
  khangKim:  { key: 'khangKim',  name: 'Phòng Thủ Vật Lý', lo: 3, hi: 6, fmt: 'pct', noLv: true },
  khangMoc:  { key: 'khangMoc',  name: 'Kháng Độc',  lo: 3, hi: 6, fmt: 'pct', noLv: true },
  khangThuy: { key: 'khangThuy', name: 'Kháng Băng', lo: 3, hi: 6, fmt: 'pct', noLv: true },
  khangHoa:  { key: 'khangHoa',  name: 'Kháng Hỏa',  lo: 3, hi: 6, fmt: 'pct', noLv: true },
  khangTho:  { key: 'khangTho',  name: 'Kháng Lôi',  lo: 3, hi: 6, fmt: 'pct', noLv: true },
  // Khang Tat Ca (chi Trang Suc): cong vao CA 5 he nen dat gia tri thap hon han mot dong don he.
  khangAll:  { key: 'khangAll',  name: 'Kháng Tất Cả', lo: 1, hi: 3, fmt: 'pct', noLv: true },
  // DA BO HAN dong `hoiMau`. Do harness: hoi mau la % mau toi da MOI TICK, ma tran o Lv100 dai
  // 18-73 giay, nen tran cang dai hoi cang thang - khong co diem dung. Chi 2%/hiep da xoa 96% sat
  // thuong cua mot tran dai, va BA nguon bi dong (Tam Phap 2% + Bo Phap 1,5% + Bi Dong 2,5%) cong
  // lai thanh 6% ma KHONG can mot mon do nao: do that ra 2-3 mau mat moi con, tuc bat tu tuyet doi.
  // Nay trong tran CHI hoi mau bang DAN DUOC (healPct) va THUC AN (heal), cong chieu Thuy Liem
  // Quyet (ton mot luot + noi luc, nen co danh doi that). Save cu con stats.hoiMau thi vo hai:
  // gearStats khong con khung cho no, engine bo qua.
  // Tang EXP — CHI cho cap CHIEN DAU (khong dinh Tu Tru, khong dinh 9 nghe). noLv nhu moi chi so %.
  // CO Y KHONG NAM TRONG SLOT_AFFIX_W BAT KY O NAO -> do roi ngau nhien KHONG BAO GIO ra dong nay.
  // User da chot: day se la DONG AN CUA BO TRANG BI (set bonus), lam sau. Toan bo duong tinh toan
  // (combatExpMult + 4 cho cong EXP + 2 cho hien uoc tinh) da san, luc do chi can do gia tri vao.
  tangExp:   { key: 'tangExp',   name: 'Tăng EXP', lo: 2, hi: 5, fmt: 'pct', noLv: true },
  // ---- DOT 4: 5 dong GIAM THOI GIAN khong che (giap tru). noLv nhu khang, tran 0,60 o derivedStats.
  // giamNgat CHI tren Ao (giap) — Ngat la hieu ung nang nhat nen dong chong no phai hiem nhat.
  giamNgat:   { key: 'giamNgat',   name: 'Giảm Thời Gian Ngất',   lo: 4, hi: 8, fmt: 'pct', noLv: true },
  giamCham:   { key: 'giamCham',   name: 'Giảm Thời Gian Chậm',   lo: 4, hi: 8, fmt: 'pct', noLv: true },
  giamDoc:    { key: 'giamDoc',    name: 'Giảm Thời Gian Độc',    lo: 4, hi: 8, fmt: 'pct', noLv: true },
  giamBong:   { key: 'giamBong',   name: 'Giảm Thời Gian Bỏng',   lo: 4, hi: 8, fmt: 'pct', noLv: true },
  giamChoang: { key: 'giamChoang', name: 'Giảm Thời Gian Choáng', lo: 4, hi: 8, fmt: 'pct', noLv: true },
  // ---- DOT 5: +Tang cho MOI chieu dang lap (chi Vu Khi / Nhan / Trang Suc) ----
  // `flat` = 1..3 y nguyen, khong nhan cap cung khong nhan pham chat: day la so TANG chu khong phai
  // diem chi so, nhan len se pha thang he Tang. Tran cong don 3 dat o derivedStats.
  // DONG HIEM NHAT GAME. `minQ: 6` = chi do bac 6 tro len moi co co roll trung, kem trong so cuc thap
  // (xem TANG_W) -> ti le ra tuong duong mot mon do pho xin, khong phai thu gap o moi mon.
  tangCong:   { key: 'tangCong',   name: 'Kĩ Năng Vốn Có', lo: 1, hi: 3, fmt: 'flat', noLv: true, flat: true, minQ: 6 },
};
// Thu hang pham chat (de doi chieu voi AFFIX[k].minQ). Pham 1 -> Co Ban 7.
const QUALITY_RANK = { phamPham: 1, luongPham: 2, tinhPham: 3, tuyetPham: 4, truyenThe: 5, thanPham: 6, coBan: 7 };
export const AFFIX_KEYS = Object.keys(AFFIX);
const PRIMARY_MUL = 2.0;   // dong primary to hon dong phu
// He so do lon cua 1 dong affix. Tach ra ham rieng vi rollGearStats VA lineRollPct deu phai dung
// CUNG mot cong thuc — lech nhau la mau bac roll sai am tham (luon xam 'Pham' hoac luon cam 'Tuyet').
function affixMul(slot, key, itemLv, quality) {
  const a = AFFIX[key];
  if (a && a.flat) return 1;                       // khong cap, khong pham chat
  const q = QUALITY_MUL[quality] || 1;
  const base = (a && a.noLv) ? q : LV_MUL(itemLv) * q;
  return base * buCong(slot, key, quality);
}

// Dong CO DINH (primary) moi slot — luon nam dong 1.
export const SLOT_PRIMARY = {
  vuKhi: 'congKich', giap: 'hoThe', mu: 'hoThe', dai: 'sinhLuc', gang: 'menhTrung',   // DOT 3: gang bo congKich
  giay: 'neTranh', nhan: 'congKich', trangSuc: 'sinhLuc', toaKy: 'neTranh',
};
// Trong so affix PHU moi slot (10=cao, 4=med, 1=thap). Primary da loai (luon co o dong 1).
// KHANG NGU HANH chi co tren GIAP TRU (mu/giap/dai/gang/giay) — luat da chot: Vu Khi/Nhan/Toa Ky KHONG co
// khang. Trang Suc mang rieng 'Khang Tat Ca'. Moi he 1 key rieng, wPick chi boc MOI key mot lan nen mot
// mon toi da 1 dong khang moi he; trong so 5 (duoi muc 10 'cao') de khang khong nuot het dong cua giap tru.
const KHANG_W = { khangKim: 4, khangMoc: 4, khangThuy: 4, khangHoa: 4, khangTho: 4 };
// MOT mon chi mang MOT dong khang ngu hanh — boc trung 1 key la khoa ca 5 lai (xem rollGearStats).
export const KHANG_KEYS = ['khangKim', 'khangMoc', 'khangThuy', 'khangHoa', 'khangTho'];
// DOT 4 — 5 dong giam thoi gian khong che. Cung ap luat MOT DONG MOI MON nhu khang: pool giap tru da
// co 12 key, them 5 key nua ma khong khoa lai thi bac 7 (6 dong phu) se roll ra mot mo vun khong doc noi.
// giamNgat KHONG nam trong bang nay — no chi len o Ao, khai rieng ben duoi.
const CC_W = { giamCham: 3, giamDoc: 3, giamBong: 3, giamChoang: 3 };
export const CC_ROLL_KEYS = ['giamNgat', 'giamCham', 'giamDoc', 'giamBong', 'giamChoang'];
// `TANG_W` chi con la CO danh dau "o nay duoc phep co dong Ki Nang Von Co" (xem SLOT_AFFIX_W) —
// gia tri bao nhieu khong quan trong vi no KHONG di qua wPick nua.
// TI LE THAT nam o TANG_CHANCE: roll rieng mot lan, chi o do bac 6+ (AFFIX.tangCong.minQ).
const TANG_W = 1;
const TANG_CHANCE = 0.10;
// DOT 3: `congKich` DA BI GO khoi ca 5 o giap tru + Toa Ky. No chi con o vuKhi/nhan/trangSuc.
// Toa Ky doi vai thanh "than phap + suc ben": Toc Do/Ne Tranh/Sinh Luc/Hoi Mau, khong Cong khong Khang.
export const SLOT_AFFIX_W = {
  vuKhi:    { menhTrung: 10, baoKich: 10, baoSat: 10, tocDo: 4, sinhLuc: 1, neTranh: 1, hoThe: 1, tangCong: TANG_W },
  giap:     { sinhLuc: 10, neTranh: 10, menhTrung: 4, hoThe: 4, baoKich: 1, tocDo: 1, baoSat: 1, ...KHANG_W, ...CC_W, giamNgat: 3 },  // Ao = o DUY NHAT co giamNgat
  mu:       { sinhLuc: 10, menhTrung: 10, neTranh: 4, baoKich: 4, hoThe: 1, tocDo: 1, baoSat: 1, ...KHANG_W, ...CC_W },
  dai:      { hoThe: 10, neTranh: 10, menhTrung: 4, tocDo: 4, sinhLuc: 1, baoKich: 1, baoSat: 1, ...KHANG_W, ...CC_W },
  gang:     { baoKich: 10, hoThe: 10, baoSat: 4, tocDo: 4, sinhLuc: 1, neTranh: 1, ...KHANG_W, ...CC_W },
  giay:     { tocDo: 10, sinhLuc: 10, menhTrung: 4, hoThe: 4, neTranh: 1, baoKich: 1, baoSat: 1, ...KHANG_W, ...CC_W },
  nhan:     { baoKich: 10, baoSat: 10, menhTrung: 4, tocDo: 4, sinhLuc: 1, neTranh: 1, hoThe: 1, tangCong: TANG_W },
  trangSuc: { congKich: 10, hoThe: 10, menhTrung: 4, baoKich: 4, neTranh: 1, tocDo: 1, baoSat: 1, khangAll: 6, tangCong: TANG_W },
  toaKy:    { tocDo: 10, sinhLuc: 10, neTranh: 10, hoThe: 4, menhTrung: 1, baoKich: 1 },   // hoiMau: DA BO (xem AFFIX)
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
  const prim = SLOT_PRIMARY[slot];
  const out = {}; const used = new Set();
  // KHOA TRUOC cac dong co nguong pham chat (AFFIX[k].minQ) — do chua du bac thi coi nhu khong ton tai
  // trong pool, chu khong phai "trong so thap". Nho vay dong hiem thuc su vang mat o do bac thap.
  const qr = QUALITY_RANK[quality] || 0;
  for (const k in AFFIX) { const a = AFFIX[k]; if (a.minQ && qr < a.minQ) used.add(k); }
  if (prim && AFFIX[prim]) { out[prim] = Math.max(1, Math.round(rollIn(AFFIX[prim].lo, AFFIX[prim].hi) * affixMul(slot, prim, itemLv, quality) * PRIMARY_MUL)); used.add(prim); }
  const wmap = SLOT_AFFIX_W[slot] || {};
  // ---- DONG HIEM "Ki Nang Von Co": roll RIENG mot lan, KHONG tranh trong so voi cac dong thuong ----
  // Vi sao khong dung trong so: bac 7 rut 6 dong phu tu pool chi 8 key, tuc gan nhu key nao cung duoc
  // rut — do that, trong so 0,6 (thap nhat bang) van cho ra 38% vu khi co dong nay. Trong so khong the
  // lam mot dong hiem o do bac cao. Roll rieng thi ti le la con so CHINH XAC minh dat ra.
  // Trung thi no CHIEM MOT O dong phu (lines--), khong phai cong them -> mon khong tu dung manh hon.
  let slots = lines - 1;
  if (slots > 0 && wmap.tangCong != null && !used.has('tangCong') && Math.random() < TANG_CHANCE) {
    out.tangCong = Math.max(1, Math.round(rollIn(AFFIX.tangCong.lo, AFFIX.tangCong.hi) * affixMul(slot, 'tangCong', itemLv, quality)));
    slots--;
  }
  used.add('tangCong');                    // da xu ly xong -> loai khoi vong boc thuong duoi day
  for (let i = 0; i < slots; i++) {
    const key = wPick(wmap, used);
    if (!key || !AFFIX[key]) break;
    out[key] = Math.max(1, Math.round(rollIn(AFFIX[key].lo, AFFIX[key].hi) * affixMul(slot, key, itemLv, quality)));
    used.add(key);
    // MOT mon = TOI DA MOT dong khang ngu hanh: boc trung 1 key thi khoa ca 5 key con lai.
    // Khong co luat nay thi giap bac 7 (7 dong, pool 12 key) gan nhu luon an 3 dong khang — do thuc te
    // 44 diem/mon, nam mon thanh ~44% khang DEU ca 5 he, tuc cham tran toan tap ngay khi du do.
    // Co luat nay: moi mon giap che MOT he -> nguoi choi tu chon rai deu hay don mot he.
    if (KHANG_KEYS.indexOf(key) >= 0) for (const kk of KHANG_KEYS) used.add(kk);
    // Y HET nhu khang: MOT mon toi da MOT dong giam thoi gian khong che.
    if (CC_ROLL_KEYS.indexOf(key) >= 0) for (const kk of CC_ROLL_KEYS) used.add(kk);
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
  const k = affixMul(slot, key, itemLv, quality);  // PHAI trung cong thuc voi rollGearStats (xem affixMul)
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
// MANH TRANG BI HOANG KIM tu quai thuong — truc dem cua Bo Trang. Chu y: vong cay CO DINH 8s/con
// (COMBAT_CYCLE_MS) nen tran treo may 8 gio = 3600 con/ngay -> 0,12% ra 4,3 Manh/ngay, xap xi loi
// Bi Canh (~6/ngay). CO Y de hai loi gan bang nhau: o state.activity la DOC QUYEN, troi Manh vao
// mot hoat dong la ep nguoi choi bo hoat dong kia suot ca thang ruoi.
export const MANH_DROP_CHANCE = 0.0012;
export const MANH_DROP_MIN_LV = 90;         // quai duoi cap nay khong rot (khop nguong Yeu Vuong)
// Cuoc pham quai thuong: CAP o Cuc Hiem (Su Thi+ den tu Bi Canh/Forge).
export const MONSTER_QUALITY_W = { phamPham: 60, luongPham: 25, tinhPham: 10, tuyetPham: 5 };

// slot deo duoc -> [{id,itemLv}] asc (bo tool gatherEff + bo Bo Trang).
// `!e.set` BAT BUOC — khop voi 3 cho kia da loai Bo Trang (FORGE_POOL o duoi, DOPHO_POOL o items.js,
// dungeonResultItems o main.js). Thieu no thi o bac 7 moi slot co 11 mon bo + 1 mon thuong -> quai
// Lv>=92 rot 71% ra do bo pham rac, ma setPieceOwned() khong xet pham chat nen KHOA VINH VIEN quyen
// ghep ban Co Ban. Nguon cua Bo Trang chi co MOT: ghep Manh + Do Pho Bo o Bach Trang Cac.
export const GEAR_BY_SLOT = (() => {
  const m = {};
  for (const id of Object.keys(GEAR)) {
    const e = GEAR[id].equip; if (!e || e.gatherEff || e.set) continue;
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
