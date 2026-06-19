// ============================================================
// DATA — Vạn Vật Phổ (bộ sưu tập). Gom 5 "phổ" từ catalog game.
// Mỗi entry cần đạt NGƯỠNG tích lũy mới "thu lục" -> +Phổ Lực vĩnh viễn.
// Đếm: yeuthu = counters.kills · binhkhi/vatpham = codex.obtained · linhthu = codex.petSeen · bicanh = codex.dungeonRuns.
// Mỗi entry có .group để chia nhóm trong phổ cho đỡ loạn (gear theo ô · vật phẩm theo loại · quái theo affinity · pet theo hệ · bí cảnh theo cảnh giới).
// ============================================================
import { ENEMIES } from './combat.js';
import { ITEMS, ITEM_TYPES } from './items.js';
import { GEAR_IDS } from './gear.js';
import { PET_SPECIES } from './pets.js';
import { DUNGEONS } from './dungeon.js';

// Loại vật phẩm thuộc Vật Phẩm Phổ (loại trừ trang bị / trứng / đồ phổ).
const VATPHAM_TYPES = ['go', 'khoang', 'dinh', 'ca', 'monan', 'vatlieu', 'dan', 'khac', 'moi'];
const SLOT_NAME = { mu: 'Mũ', giap: 'Áo', dai: 'Đai', gang: 'Găng', giay: 'Giày', vuKhi: 'Vũ Khí', nhan: 'Nhẫn', trangSuc: 'Trang Sức', toaKy: 'Tọa Kỵ', riu: 'Rìu', cuoc: 'Cuốc', canCau: 'Cần Câu' };
const HE_NAME = { kim: 'Hệ Kim', moc: 'Hệ Mộc', thuy: 'Hệ Thủy', hoa: 'Hệ Hỏa', tho: 'Hệ Thổ' };
// Gom Yêu Thú theo tầng cấp (affinity quá vụn — mỗi loài 1 nhóm).
function enemyTier(lv) { lv = lv || 1; if (lv <= 20) return 'Sơ Cấp · Lv 1–20'; if (lv <= 50) return 'Trung Cấp · Lv 21–50'; if (lv <= 80) return 'Cao Cấp · Lv 51–80'; return 'Đỉnh Cấp · Lv 81+'; }

// 5 phổ. per = bonus mỗi entry đạt ngưỡng; set = bonus khi trọn bộ. field ∈ {atkPct,defPct,hpPct,allPct}.
export const CODEX_CATS = [
  {
    key: 'yeuthu', name: 'Yêu Thú Phổ', kind: 'enemy', unit: 'giết', threshold: 10000,
    per: { field: 'atkPct', val: 0.003, label: '+0.3% Công' },
    set: { field: 'allPct', val: 0.05, label: '+5% mọi chỉ số' },
    setLabel: 'Trọn Yêu Thú Phổ → +5% mọi chỉ số',
    list() { return Object.values(ENEMIES).map((e) => ({ id: e.id, name: e.name, icon: e.icon, sub: e.affinity || 'Yêu Thú', group: enemyTier(e.reqLevel), where: 'Săn ở sơn dã các vùng' })); },
  },
  {
    key: 'binhkhi', name: 'Binh Khí Phổ', kind: 'gear', unit: 'sở hữu', threshold: 1,
    per: { field: 'defPct', val: 0.001, label: '+0.1% Thủ' },
    set: { field: 'allPct', val: 0.05, label: '+5% mọi chỉ số' },
    setLabel: 'Trọn Binh Khí Phổ → +5% mọi chỉ số',
    list() { return GEAR_IDS.map((id) => ITEMS[id]).filter(Boolean).map((g) => ({ id: g.id, name: g.name, icon: g.icon, quality: g.quality, sub: SLOT_NAME[(g.equip && g.equip.slot)] || '', group: SLOT_NAME[(g.equip && g.equip.slot)] || 'Khác', where: 'Rơi / Rèn Đúc / Thương Điếm' })); },
  },
  {
    key: 'vatpham', name: 'Vật Phẩm Phổ', kind: 'item', unit: 'nhận', threshold: 10000,
    per: { field: 'hpPct', val: 0.001, label: '+0.1% Sinh Lực' },
    set: { field: 'allPct', val: 0.05, label: '+5% mọi chỉ số' },
    setLabel: 'Trọn Vật Phẩm Phổ → +5% mọi chỉ số',
    list() { return Object.values(ITEMS).filter((it) => VATPHAM_TYPES.includes(it.type)).map((it) => ({ id: it.id, name: it.name, icon: it.icon, quality: it.quality, sub: ITEM_TYPES[it.type] || '', group: ITEM_TYPES[it.type] || 'Khác', where: 'Thu thập / Rơi từ săn' })); },
  },
  {
    key: 'linhthu', name: 'Linh Thú Phổ', kind: 'pet', unit: 'nở', threshold: 1,
    per: { field: 'allPct', val: 0.005, label: '+0.5% mọi chỉ số' },
    set: { field: 'allPct', val: 0.06, label: '+6% mọi chỉ số' },
    setLabel: 'Trọn Linh Thú Phổ → +6% mọi chỉ số',
    list() { return Object.values(PET_SPECIES).map((p) => ({ id: p.base, name: p.name, icon: p.emoji, he: p.he, sub: p.role || '', group: HE_NAME[p.he] || 'Khác', where: 'Nở từ Noãn / Yêu Vương rơi' })); },
  },
  {
    key: 'bicanh', name: 'Bí Cảnh Lục', kind: 'dungeon', unit: 'lượt', threshold: 100,
    per: { field: 'allPct', val: 0.004, label: '+0.4% mọi chỉ số' },
    set: { field: 'allPct', val: 0.08, label: '+8% mọi chỉ số' },
    setLabel: 'Trọn Bí Cảnh Lục → +8% mọi chỉ số',
    list() { return DUNGEONS.map((d) => ({ id: d.id, name: d.name, icon: d.seal, color: d.color, sub: d.realm || '', group: d.realm || 'Bí Cảnh', where: 'Phi Cáp Đài / bản đồ Bí Cảnh' })); },
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
