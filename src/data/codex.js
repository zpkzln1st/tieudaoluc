// ============================================================
// DATA — Vạn Vật Phổ (bộ sưu tập). Gom 7 "phổ" từ catalog game.
// Mỗi entry cần đạt NGƯỠNG tích lũy mới "thu lục" -> +Phổ Lực vĩnh viễn.
// Đếm: yeuthu = counters.kills · binhkhi/vatpham = codex.obtained · linhthu = codex.petSeen · bicanh = codex.dungeonRuns.
// Mỗi entry có .group để chia nhóm trong phổ cho đỡ loạn (gear theo ô · vật phẩm theo loại · quái theo affinity · pet theo hệ · bí cảnh theo cảnh giới).
// ============================================================
import { ENEMIES } from './combat.js';
import { ITEMS, ITEM_TYPES } from './items.js';
import { GEAR_IDS, TRANG_SETS } from './gear.js';
import { PET_SPECIES } from './pets.js';
import { DUNGEONS } from './dungeon.js';
import { DANH_SI } from './danhsi.js';

// Loại vật phẩm thuộc Vật Phẩm Phổ (loại trừ trang bị / trứng / đồ phổ).
const VATPHAM_TYPES = ['go', 'khoang', 'dinh', 'ca', 'monan', 'vatlieu', 'dan', 'khac', 'moi', 'thaoDuoc'];
const SLOT_NAME = { mu: 'Mũ', giap: 'Áo', dai: 'Đai', gang: 'Găng', giay: 'Giày', vuKhi: 'Vũ Khí', nhan: 'Nhẫn', trangSuc: 'Trang Sức', toaKy: 'Tọa Kỵ', riu: 'Rìu', cuoc: 'Cuốc', canCau: 'Cần Câu', duocLiem: 'Dược Liêm' };
const HE_NAME = { kim: 'Hệ Kim', moc: 'Hệ Mộc', thuy: 'Hệ Thủy', hoa: 'Hệ Hỏa', tho: 'Hệ Thổ' };
// Gom Yêu Thú theo tầng cấp (affinity quá vụn — mỗi loài 1 nhóm).
function enemyTier(lv) { lv = lv || 1; if (lv <= 20) return 'Sơ Cấp · Lv 1–20'; if (lv <= 50) return 'Trung Cấp · Lv 21–50'; if (lv <= 80) return 'Cao Cấp · Lv 51–80'; return 'Đỉnh Cấp · Lv 81+'; }

// 7 phổ. `per` = bonus mỗi ô đạt ngưỡng. `moc` = THANG MỐC theo tiến độ 25/50/75/100% số ô.
// field ∈ {atkPct, defPct, hpPct, allPct}. `moc.thang` là giá trị CỘNG DỒN tại từng mốc — lấy
// mốc CAO NHẤT đã đạt, không cộng nhiều mốc.
// ⚠⚠ VÌ SAO BỎ "trọn bộ mới ăn": đo được 74% phần thưởng dồn vào mốc 100%, nên xong 90% mọi phổ
//    người chơi chỉ cầm 23%. Đường thưởng dựng đứng ở chặng cuối mà chặng cuối lại là chặng bất khả.
// ⚠⚠ TỔNG SAU KHI CHỐT: atkPct +4,95% · defPct +9,87% · hpPct +6,85% · allPct +16,30%.
//    Trước đó allPct là +56,6% — chiếm 58% ngân sách sức mạnh, lớn hơn BỐN nguồn kia cộng lại
//    1,37-1,43 lần. Nay ngang hàng Đan Điền trọn lưới (+27,4%).
/**
 * Ô KHÔNG BAO GIỜ LẶP LẠI ĐƯỢC ⇒ không tính vào phổ, vì mốc 100% sẽ vĩnh viễn không ai chạm tới.
 * ⚠ Đồ Phổ mang type 'khac' nên lọt vào `VATPHAM_TYPES`, mà engine cố ý KHÔNG thả bản đã có
 *   (`rollChieuDoPhoId` · `rollDoPhoId` lọc bản đã sở hữu). `khoangPhuLinhThach` thì không có
 *   một đường thả nào trong toàn bộ mã.
 */
const KHONG_LAP_LAI = (id) => /^dpset_|^dpchieu_/.test(id) || id === 'khoangPhuLinhThach';

export const CODEX_CATS = [
  {
    key: 'yeuthu', name: 'Yêu Thú Phổ', kind: 'enemy', unit: 'giết', threshold: 10000,
    per: { field: 'atkPct', val: 0.0015, label: '+0,15% Công' },
    moc: { field: 'allPct', thang: [0.003, 0.006, 0.010, 0.015] },
    list() { return Object.values(ENEMIES).map((e) => ({ id: e.id, name: e.name, icon: e.icon, sub: e.affinity || 'Yêu Thú', group: enemyTier(e.reqLevel), where: 'Săn ở sơn dã các vùng' })); },
  },
  {
    key: 'binhkhi', name: 'Binh Khí Phổ', kind: 'gear', unit: 'sở hữu', threshold: 1,
    per: { field: 'defPct', val: 0.0004, label: '+0,04% Thủ' },
    moc: { field: 'allPct', thang: [0.002, 0.004, 0.007, 0.010] },
    // `!g.equip.set`: Bộ Trang (Bạch Kim) TÁCH sang phổ riêng "Bách Trang Các" — không kể ở đây, nếu
    // không 77 món bộ độn vào làm mốc "trọn bộ +5%" bất khả (nguồn ghép cực chậm), lại lẫn phẩm Cổ Bản
    // vào các nhóm ô Mũ/Áo/... của đồ thường.
    list() { return GEAR_IDS.map((id) => ITEMS[id]).filter((g) => g && !(g.equip && g.equip.set)).map((g) => ({ id: g.id, name: g.name, icon: g.icon, quality: g.quality, sub: SLOT_NAME[(g.equip && g.equip.slot)] || '', group: SLOT_NAME[(g.equip && g.equip.slot)] || 'Khác', where: 'Rơi / Rèn Đúc / Thương Điếm' })); },
  },
  {
    key: 'vatpham', name: 'Vật Phẩm Phổ', kind: 'item', unit: 'nhận', threshold: 500,
    per: { field: 'hpPct', val: 0.0005, label: '+0,05% Sinh Lực' },
    moc: { field: 'allPct', thang: [0.002, 0.004, 0.007, 0.010] },
    // ⚠⚠ BỎ 19 Ô BẤT KHẢ, nếu không thì mốc 100% vĩnh viễn không ai chạm tới:
    //    18 ô Đồ Phổ (`dpset_*` · `dpchieu_*`) mang type 'khac' nên lọt vào `VATPHAM_TYPES`, mà
    //    engine CỐ Ý không thả bản đã có — trần thật của chúng là 1 chứ không phải ngưỡng phổ.
    //    Cộng `khoangPhuLinhThach`: không một dòng mã nào thả nó ra. 156 → 137 ô.
    list() { return Object.values(ITEMS).filter((it) => VATPHAM_TYPES.includes(it.type) && !KHONG_LAP_LAI(it.id)).map((it) => ({ id: it.id, name: it.name, icon: it.icon, quality: it.quality, sub: ITEM_TYPES[it.type] || '', group: ITEM_TYPES[it.type] || 'Khác', where: 'Thu thập / Rơi từ săn' })); },
  },
  {
    key: 'linhthu', name: 'Linh Thú Phổ', kind: 'pet', unit: 'nở', threshold: 1,
    per: { field: 'allPct', val: 0.0025, label: '+0,25% mọi chỉ số' },
    moc: { field: 'allPct', thang: [0.002, 0.004, 0.006, 0.008] },
    list() { return Object.values(PET_SPECIES).map((p) => ({ id: p.base, name: p.name, icon: p.emoji, he: p.he, sub: p.role || '', group: HE_NAME[p.he] || 'Khác', where: 'Nở từ Noãn / Yêu Vương rơi' })); },
  },
  {
    key: 'bicanh', name: 'Bí Cảnh Lục', kind: 'dungeon', unit: 'lượt', threshold: 50,
    per: { field: 'allPct', val: 0.003, label: '+0,3% mọi chỉ số' },
    moc: { field: 'allPct', thang: [0.003, 0.006, 0.010, 0.015] },
    list() { return DUNGEONS.map((d) => ({ id: d.id, name: d.name, icon: d.seal, color: d.color, sub: d.realm || '', group: d.realm || 'Bí Cảnh', where: 'Phi Cáp Đài / bản đồ Bí Cảnh' })); },
  },
  {
    key: 'danhsi', name: 'Danh Sĩ Phổ', kind: 'danhsi', unit: 'gặp', threshold: 1,
    per: { field: 'allPct', val: 0.0015, label: '+0,15% mọi chỉ số' },
    moc: { field: 'allPct', thang: [0.002, 0.004, 0.006, 0.008] },
    list() { return DANH_SI.map((d) => ({ id: d.id, name: d.ten, icon: (d.ten || '?').charAt(0), sub: d.bietHieu, he: d.nguHanh, group: (d.dao === 'chinh' ? 'Chính Đạo' : d.dao === 'ta' ? 'Tà Đạo' : 'Trung Lập'), where: 'Gặp qua Danh Sĩ Bảng / kỳ ngộ giang hồ' })); },
  },
  {
    // BÁCH TRANG CÁC — phổ riêng cho 77 món Bộ Trang (Bạch Kim), tách khỏi Binh Khí Phổ. Đếm y như
    // binhkhi (obtained>0 -> đủ), nhóm theo TÊN BỘ nên 11 bộ đọc thành 11 mục. Thưởng thiên PHÒNG THỦ
    // hợp lore "trấn thân". CHỐT (2026-08-20): trọn cả bảy phổ cho Công Kích +4,95% · Phòng Ngự
    // +9,87% · Sinh Lực +6,85% và allPct +16,30%.
    // ⚠ Nguồn ghép: 420 Mảnh/bộ, trần đo được 13,00 Mảnh/ngày ⇒ trọn Bách Trang Các là 498 NGÀY,
    //   không phải 286 như ghi chép cũ (ghi chép cũ đòi 16,15 Mảnh/ngày, có từ hồi còn lối cày quái).
    key: 'bachtrang', name: 'Bách Trang Các', kind: 'gear', unit: 'ghép', threshold: 1,
    per: { field: 'defPct', val: 0.0007, label: '+0,07% Thủ' },
    moc: { field: 'allPct', thang: [0.003, 0.006, 0.010, 0.015] },
    list() { return GEAR_IDS.map((id) => ITEMS[id]).filter((g) => g && g.equip && g.equip.set).map((g) => ({ id: g.id, name: g.name, icon: g.icon, quality: g.quality, sub: SLOT_NAME[g.equip.slot] || '', he: g.equip.he || null, group: (TRANG_SETS[g.equip.set] || {}).name || 'Bộ Trang', where: 'Ghép Mảnh + Đồ Phổ Bộ ở Bách Trang Các' })); },
  },
];

// Gom entry thành nhóm (giữ thứ tự xuất hiện của nhóm).
function groupEntries(entries) {
  const order = [], map = {};
  for (const e of entries) { const k = e.group || 'Khác'; if (!map[k]) { map[k] = []; order.push(k); } map[k].push(e); }
  return order.map((k) => ({ label: k, entries: map[k] }));
}

// Dựng + cache danh sách + nhóm 1 lần (catalog tĩnh).
CODEX_CATS.forEach((c) => { c.entries = c.list(); c.total = c.entries.length; c.groups = groupEntries(c.entries); });
export const CODEX_BY_KEY = Object.fromEntries(CODEX_CATS.map((c) => [c.key, c]));
