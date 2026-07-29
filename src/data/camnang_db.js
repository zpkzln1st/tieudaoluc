// ============================================================
// CẨM NANG — CƠ SỞ DỮ LIỆU TRA CỨU.
//
// Đây là phần LÕI của wiki: mọi thực thể trong trò chơi đều tra được, kèm chỉ số
// thật và NGUỒN KIẾM. Không có chữ nào chép tay — toàn bộ suy từ bảng số.
//
// Mỗi bảng: { id, ten, nhom, dv, cot[], hang(), chiTiet(h) }
//   cot:  [{ k, ten, so? , rong? }]   so=true -> căn phải, sắp xếp kiểu số
//   hang: () => [{...}]               một hàng = một thực thể
//   chiTiet: (h) => [ ['h'|'p'|'bang'|'ds'|'ct', ...] ]  khối cho khung chi tiết
// ============================================================
import { ITEMS, ITEM_TYPES, QUALITY } from './items.js';
import { GEAR, GEAR_IDS, AFFIX, SET_BONUS, TRANG_SETS, BACH_KIM_SETS, SLOT_AFFIX_W, QUALITY_LINES, THOI_TIERS } from './gear.js';
import { ENEMIES, YEU_VUONG, STANCES } from './combat.js';
import { DUNGEONS } from './dungeon.js';
import { LOCATIONS } from './locations.js';
import { SKILLS } from './skills.js';
import { EQUIP_SLOTS, TOOL_SLOTS } from './ui.js';
import { CHIEU, TAM_PHAP_POOL, BO_PHAP, BI_DONG, NGU_HANH, TIER_LABEL, TUYET_IDS, TUYET_RECIPE, HE_FX } from './votong.js';
import { PET_SPECIES, PET_SKILLS, AWK_PASSIVES, PET_OPT_POOL, PET_QUALITY } from './pets.js';
import { TITLES, TITLE_LOAI, titleBonusText } from './titles.js';
import { BADGES, BADGE_LV } from './badges.js';
import { BI_KIP, BI_KIP_LOAI, BI_KIP_TIER, PILLS, BUILDINGS } from './tongmon.js';
import { KY_NANG_BANG, CONG_TRINH, CUA_HANG_BANG } from './bangphai.js';
import { LINH_THACH } from './linhthach.js';
import { CODEX_CATS } from './codex.js';

// ---------- tiện ----------
const so = (x) => (x == null ? '—' : Number(x).toLocaleString('vi-VN'));
const pct = (x, chuSo = 2) => (x == null ? '—' : (x * 100).toFixed(chuSo).replace(/\.?0+$/, '').replace('.', ',') + '%');
const tenPham = (q) => (QUALITY[q] || {}).name || q;
const tenHe = (h) => (NGU_HANH[h] || {}).name || (h ? h : 'Vô Hệ');

// ---------- MÀU ----------
// Phẩm chất và ngũ hành đều đã có mã màu trong bảng số. Dùng lại đúng mã đó để
// Cẩm Nang không lệch màu với phần còn lại của trò chơi.
export const MAU_PHAM = Object.fromEntries(Object.entries(QUALITY).map(([k, v]) => [k, v.hex]));
// NGU_HANH giữ màu ở `glowRgb` dạng "r,g,b" (dùng cho box-shadow), không có hex sẵn.
export const MAU_HE = Object.fromEntries(
  Object.entries(NGU_HANH).map(([k, v]) => [k, v.glowRgb ? 'rgb(' + v.glowRgb + ')' : '#94a3b8']),
);
const mauPham = (q) => MAU_PHAM[q] || '#cbd5e1';
const mauHe = (h) => MAU_HE[h] || MAU_HE.vohe || '#94a3b8';
/** Nhuộm một giá trị trong khối chi tiết (khối nhận HTML). */
const oPham = (q) => '<b style="color:' + mauPham(q) + '">' + tenPham(q) + '</b>';
const oHe = (h) => '<b style="color:' + mauHe(h) + '">' + tenHe(h) + '</b>';
const tenItem = (id) => (ITEMS[id] || {}).name || id;
const tenO = (s) => (EQUIP_SLOTS.find((x) => x.id === s) || TOOL_SLOTS.find((x) => x.id === s) || {}).name || s;
// ⚠ ITEM_TYPES là { khoá: 'Tên' } — CHUỖI, không phải object. Viết `.name` là ra undefined.
const tenLoai = (t) => (typeof ITEM_TYPES[t] === 'string' ? ITEM_TYPES[t] : (ITEM_TYPES[t] || {}).name) || t;
const O_CONG_CU = TOOL_SLOTS.map((t) => t.id);
const laCongCu = (g) => O_CONG_CU.includes(((g || {}).equip || {}).slot);
const tenNghe = (id) => (SKILLS[id] || {}).name || (id === 'chienDau' ? 'Chiến Đấu' : id);

// ---------- NHÃN KHOÁ ----------
// ⚠ Bảng số dùng khoá tiếng Anh (atk, maxHP, critDmg…) để tính toán. Bày thẳng ra
// màn hình là sai luật nhãn Hán-Việt đầy đủ. Mọi chỗ hiển thị phải đi qua đây.
// Nguồn ưu tiên: AFFIX[k].name (đã có sẵn tên tiếng Việt cho phần lớn khoá).
const NHAN_THEM = {
  atk: 'Công Kích', def: 'Phòng Ngự', maxHP: 'Sinh Lực', spd: 'Khinh Công',
  crit: 'Bạo Kích', critDmg: 'Sát Thương Bạo Kích', dodge: 'Né Tránh',
  atkPct: 'Công Kích', defPct: 'Phòng Ngự', hpPct: 'Sinh Lực', allPct: 'Mọi chỉ số',
  expPct: 'Kinh nghiệm Chiến Đấu', dropPct: 'Tỉ lệ rơi', bacPct: 'Bạc nhặt được',
  nghePct: 'Tốc độ Nghề Khai Thác', ngheExpPct: 'Kinh nghiệm nghề',
  honThachPct: 'Hồn Thạch Bí Cảnh', bcDoPhoPct: 'Đồ phổ Bí Cảnh', petExpPct: 'Kinh nghiệm Linh Thú',
  khangAll: 'Kháng mọi hệ', baoKich: 'Bạo Kích', congHuong: 'Cộng Hưởng',
  giamChoang: 'Giảm Choáng', giamNhan: 'Giảm sát thương phải chịu',
  sinhLuc: 'Sinh Lực', hoThe: 'Hộ Thể', congKich: 'Công Kích',
  dmg: 'Sát Thương', hp: 'Sinh Lực', eleDmg: 'Sát Thương Hệ', gatherEff: 'Hiệu suất nghề',
  lucDao: 'Lực Đạo', thanPhap: 'Thân Pháp', linhXao: 'Linh Xảo',
  neTranh: 'Né Tránh', menhTrung: 'Chính Xác',
};
// Vạn Vật Phổ đếm theo đơn vị khác nhau; `unit` trong bảng số là ĐỘNG TỪ dùng giữa câu.
const NHAN_DEM = {
  yeuthu: 'Số lần hạ mỗi loài', binhkhi: 'Số món đã sở hữu', vatpham: 'Số vật phẩm đã nhận',
  linhthu: 'Số Linh Thú đã nở', bicanh: 'Số lượt đã thông quan', danhsi: 'Số Danh Sĩ đã gặp',
  bachtrang: 'Số món đã ghép',
};
const nhanKhoa = (k) => (AFFIX[k] || {}).name || NHAN_THEM[k] || k;
/** "atk +18% · crit +5%" -> "Công Kích +18% · Bạo Kích +5%" */
const moTaBonus = (o) => Object.entries(o || {})
  .map(([k, v]) => nhanKhoa(k) + ' +' + (v > 0 && v < 1 ? pct(v, 1) : so(v)))
  .join(' · ') || '—';

// ---------- CHỈ MỤC NGUỒN: món này kiếm ở đâu ----------
// Quét ngược mọi bảng số một lần lúc nạp. Đây là thứ khiến tra cứu có ích:
// nhìn một món là biết đi đâu lấy, không phải đoán.
const NGUON = {};
const themNguon = (itemId, mo) => { (NGUON[itemId] = NGUON[itemId] || []).push(mo); };

for (const e of Object.values(ENEMIES)) {
  for (const l of e.loot || []) themNguon(l.itemId, { loai: 'quai', ten: e.name, ti: l.chance, ghi: l.noBoost ? 'không nhân hệ số' : '' });
}
for (const y of YEU_VUONG) {
  for (const t of ((y.wb || {}).eggs) || []) themNguon(t.itemId, { loai: 'boss', ten: y.name, ti: t.chance });
}
for (const d of DUNGEONS) {
  const L = d.loot || {};
  for (const id of L.lieu || []) themNguon(id, { loai: 'bicanh', ten: d.name, ti: null, ghi: 'nguyên liệu mỗi lượt' });
  for (const id of L.da || []) themNguon(id, { loai: 'bicanh', ten: d.name, ti: null, ghi: 'đá cường hoá' });
  for (const r of L.rare || []) themNguon(r.itemId, { loai: 'bicanh', ten: d.name, ti: r.chance, ghi: 'vật phẩm hiếm' });
}
for (const id of GEAR_IDS) {
  const g = GEAR[id];
  if (g && g.equip && g.equip.set) themNguon(id, { loai: 'bo', ten: 'Bộ ' + g.equip.set, ti: null });
}
const nguonCua = (id) => NGUON[id] || [];
const nguonGon = (id) => {
  const ds = nguonCua(id);
  if (!ds.length) return '—';
  const q = ds.filter((x) => x.loai === 'quai').length;
  const b = ds.filter((x) => x.loai === 'bicanh').length;
  const w = ds.filter((x) => x.loai === 'boss').length;
  const ra = [];
  if (q) ra.push(q === 1 ? ds.find((x) => x.loai === 'quai').ten : q + ' loại quái');
  if (b) ra.push(b === 1 ? ds.find((x) => x.loai === 'bicanh').ten : b + ' Bí Cảnh');
  if (w) ra.push(w === 1 ? ds.find((x) => x.loai === 'boss').ten : w + ' Yêu Vương');
  return ra.join(' · ');
};
const khoiNguon = (id) => {
  const ds = nguonCua(id);
  if (!ds.length) return [['p', 'Chưa có nguồn rơi nào ghi nhận trong bảng số — món này đến từ chế tạo, cửa hàng hoặc thưởng.']];
  return [['bang', ['Nguồn', 'Ở đâu', 'Tỉ lệ', 'Ghi chú'],
    ds.map((x) => [
      { quai: 'Quái', boss: 'Yêu Vương', bicanh: 'Bí Cảnh', bo: 'Bộ trang' }[x.loai] || x.loai,
      x.ten, x.ti == null ? '—' : pct(x.ti, 3), x.ghi || '—',
    ])]];
};

// ---------- vùng của quái ----------
const VUNG_CUA_QUAI = {};
for (const l of LOCATIONS) for (const id of l.enemies || l.mobs || []) (VUNG_CUA_QUAI[id] = VUNG_CUA_QUAI[id] || []).push(l.name);
const vungQuai = (id) => (VUNG_CUA_QUAI[id] || []).join(', ') || '—';

// ---------- ô nào bốc được dòng phụ nào ----------
const O_CUA_AFFIX = {};
for (const [slot, w] of Object.entries(SLOT_AFFIX_W || {})) {
  for (const k of Object.keys(w || {})) if (w[k] > 0) (O_CUA_AFFIX[k] = O_CUA_AFFIX[k] || []).push(tenO(slot));
}

export const CN_DB = [
  // ============ QUÁI ============
  {
    id: 'quai', ten: 'Quái', nhom: 'Chiến Đấu', dv: 'loại quái',
    cot: [
      { k: 'ten', ten: 'Tên' }, { k: 'vung', ten: 'Vùng' },
      { k: 'lv', ten: 'Lv', so: true }, { k: 'hp', ten: 'Sinh Lực', so: true },
      { k: 'atk', ten: 'Công', so: true }, { k: 'def', ten: 'Thủ', so: true },
      { k: 'exp', ten: 'EXP', so: true }, { k: 'power', ten: 'Chiến Lực', so: true },
      { k: 'roi', ten: 'Rơi' },
    ],
    hang: () => Object.values(ENEMIES).map((e) => ({
      id: e.id, ten: e.name, _icon: e.icon, vung: vungQuai(e.id), lv: e.reqLevel,
      hp: e.hp, atk: e.atk, def: e.def, spd: e.spd, exp: e.exp, power: e.power,
      roi: (e.loot || []).map((l) => tenItem(l.itemId) + ' ' + pct(l.chance, 1)).join(' · ') || '—',
      _e: e,
    })),
    chiTiet: (h) => {
      const e = h._e;
      return [
        ['p', e.lore || ''],
        ['bang', ['Chỉ số', 'Giá trị'], [
          ['Cấp yêu cầu', 'Lv ' + e.reqLevel], ['Sinh Lực', so(e.hp)], ['Công Kích', so(e.atk)],
          ['Phòng Ngự', so(e.def)], ['Tốc Độ', so(e.spd)], ['Kinh nghiệm', so(e.exp)],
          ['Kinh nghiệm Tứ Trụ', so(e.statXp)], ['Chiến Lực', so(e.power)],
          ['Thời gian một trận', e.time + ' giây'], ['Né Tránh', e.dodge ? pct(e.dodge, 1) : '—'],
          ['Phân loại', e.affinity || '—'],
        ]],
        ...(e.khang ? [['h', 'Kháng ngũ hành'],
          ['bang', ['Hệ', 'Kháng'], Object.entries(e.khang).map(([k, v]) => [oHe(k), pct(v, 1)])]] : []),
        ['h', 'Chiêu thức'],
        ['bang', ['Chiêu', 'Hệ số', 'Hồi chiêu'], [[(e.skill || {}).name || '—', (e.skill || {}).mult ? '×' + e.skill.mult : '—', (e.skill || {}).cd ? e.skill.cd + ' nhịp' : '—']]],
        ['h', 'Vật phẩm rơi'],
        ...((e.loot || []).length
          ? [['bang', ['Vật phẩm', 'Tỉ lệ ghi trong bảng số', 'Ghi chú'],
            e.loot.map((l) => [tenItem(l.itemId), pct(l.chance, 2), l.noBoost ? 'không chịu hệ số toàn cục' : 'chịu hệ số toàn cục 0,5'])]]
          : [['p', 'Không rơi vật phẩm.']]),
      ];
    },
  },

  // ============ YÊU VƯƠNG ============
  {
    id: 'yeuvuong', ten: 'Yêu Vương', nhom: 'Chiến Đấu', dv: 'trùm',
    cot: [
      { k: 'ten', ten: 'Tên' }, { k: 'lv', ten: 'Lv', so: true },
      { k: 'hp', ten: 'Sinh Lực', so: true }, { k: 'atk', ten: 'Công', so: true },
      { k: 'def', ten: 'Thủ', so: true }, { k: 'hoi', ten: 'Hồi', so: true },
      { k: 'tinhThe', ten: 'Tinh Thể', so: true }, { k: 'honThach', ten: 'Hồn Thạch', so: true },
      { k: 'bac', ten: 'Bạc', so: true },
    ],
    hang: () => YEU_VUONG.map((y) => ({
      id: y.id, ten: y.name, _icon: y.icon, lv: y.reqLevel, hp: y.hp, atk: y.atk, def: y.def,
      hoi: (y.wb || {}).cdHours ? y.wb.cdHours + ' giờ' : '—',
      _hoiSo: (y.wb || {}).cdHours || 0,
      tinhThe: (y.wb || {}).tinhThe || 0, honThach: (y.wb || {}).honThach || 0, bac: (y.wb || {}).bac || 0,
      _y: y,
    })),
    chiTiet: (h) => {
      const y = h._y, w = y.wb || {};
      return [
        ['p', y.lore || ''],
        ['bang', ['Chỉ số', 'Giá trị'], [
          ['Cấp yêu cầu', 'Lv ' + y.reqLevel], ['Sinh Lực', so(y.hp)], ['Công Kích', so(y.atk)],
          ['Phòng Ngự', so(y.def)], ['Tốc Độ', so(y.spd)], ['Chiến Lực', so(y.power)],
          ['Né Tránh', y.dodge ? pct(y.dodge, 1) : '—'], ['Hồi chiêu', w.cdHours ? w.cdHours + ' giờ' : '—'],
        ]],
        ...(y.khang ? [['h', 'Kháng ngũ hành'],
          ['bang', ['Hệ', 'Kháng'], Object.entries(y.khang).map(([k, v]) => [oHe(k), pct(v, 1)])]] : []),
        ['h', 'Chiêu thức'],
        ['bang', ['Chiêu', 'Hệ số', 'Hồi chiêu'], [[(y.skill || {}).name || '—', (y.skill || {}).mult ? '×' + y.skill.mult : '—', (y.skill || {}).cd ? y.skill.cd + ' nhịp' : '—']]],
        ['h', 'Phần thưởng mỗi lần hạ'],
        ['bang', ['Khoản', 'Số lượng'], [
          ['Tinh Thể Yêu Vương', so(w.tinhThe)], ['Hồn Thạch', so(w.honThach)],
          ['Bạc', so(w.bac)], ['Kinh nghiệm', so(y.exp)],
        ]],
        ['h', 'Trứng Linh Thú'],
        ...((w.eggs || []).length
          ? [['bang', ['Trứng', 'Tỉ lệ'], w.eggs.map((t) => [tenItem(t.itemId), pct(t.chance, 3)])]]
          : [['p', 'Không rơi trứng.']]),
      ];
    },
  },

  // ============ BÍ CẢNH ============
  {
    id: 'bicanh', ten: 'Bí Cảnh', nhom: 'Chiến Đấu', dv: 'phó bản',
    cot: [
      { k: 'ten', ten: 'Tên' }, { k: 'lv', ten: 'Lv', so: true },
      { k: 'gio', ten: 'Thời lượng' }, { k: 'phi', ten: 'Phí vào' },
      { k: 'bac', ten: 'Bạc' }, { k: 'ht', ten: 'Hồn Thạch' },
      { k: 'manh', ten: 'Mảnh', so: true }, { k: 'hiem', ten: 'Vật phẩm hiếm' },
    ],
    hang: () => DUNGEONS.map((d) => {
      const L = d.loot || {}, c = d.cost || {};
      return {
        id: d.id, ten: d.name, lv: d.reqLevel, _phut: Math.round(d.durMs / 60000),
        gio: Math.round(d.durMs / 60000) + ' phút',
        phi: [c.bac ? so(c.bac) + ' Bạc' : null, c.honThach ? so(c.honThach) + ' Hồn Thạch' : null].filter(Boolean).join(' + ') || '—',
        bac: (L.bac || []).length ? so(L.bac[0]) + '–' + so(L.bac[1]) : '—',
        ht: (L.honThach || []).length ? so(L.honThach[0]) + '–' + so(L.honThach[1]) : '—',
        manh: L.manh || 0,
        hiem: (L.rare || []).map((r) => tenItem(r.itemId)).join(' · ') || '—',
        _d: d,
      };
    }),
    chiTiet: (h) => {
      const d = h._d, L = d.loot || {}, c = d.cost || {};
      return [
        ['p', d.lore || ''],
        ['bang', ['Mục', 'Giá trị'], [
          ['Cấp yêu cầu', 'Lv ' + d.reqLevel], ['Cảnh giới', d.realm || '—'],
          ['Nằm ở', (LOCATIONS.find((l) => l.id === d.loc) || {}).name || '—'],
          ['Thời lượng một lượt', Math.round(d.durMs / 60000) + ' phút'],
          ['Phí vào', [c.bac ? so(c.bac) + ' Bạc' : null, c.honThach ? so(c.honThach) + ' Hồn Thạch' : null].filter(Boolean).join(' + ') || '—'],
          ['Hệ số nhịp (pace)', d.pace != null ? d.pace : '—'],
          ['Cản trở', d.hazardName ? d.hazardName + ' (' + d.hazard + ')' : '—'],
          ['Tầng đi qua', (d.tangs || []).join(' → ') || '—'],
          ['Quái thường', (d.mobs || []).join(', ') || '—'],
          ['Thủ lĩnh', d.boss || '—'],
        ]],
        ['h', 'Thu hoạch mỗi lượt thông quan'],
        ['bang', ['Khoản', 'Số lượng'], [
          ['Bạc', (L.bac || []).length ? so(L.bac[0]) + ' – ' + so(L.bac[1]) : '—'],
          ['Kinh nghiệm', so(L.exp)],
          ['Hồn Thạch', (L.honThach || []).length ? so(L.honThach[0]) + ' – ' + so(L.honThach[1]) : '—'],
          ['Mảnh Trang Bị', L.manh ? so(L.manh) + ' (chắc chắn)' : '—'],
          ['Nguyên liệu', (L.lieu || []).map(tenItem).join(', ') || '—'],
          ['Đá cường hoá', (L.da || []).map(tenItem).join(', ') || '—'],
        ]],
        ['h', 'Tỉ lệ đồ phổ'],
        ['bang', ['Loại', 'Bậc', 'Tỉ lệ ghi trong bảng số'], [
          ['Đồ phổ trang bị', (L.doPho || {}).bac ? (Array.isArray(L.doPho.bac) ? L.doPho.bac.join('–') : L.doPho.bac) : '—', L.doPhoChance != null ? pct(L.doPhoChance, 2) : '—'],
          ['Đồ phổ công cụ', (L.toolDoPho || {}).bac != null ? L.toolDoPho.bac : '—', (L.toolDoPho || {}).chance != null ? pct(L.toolDoPho.chance, 2) : '—'],
          ...(L.tuyetDoPho ? [['Đồ phổ Tuyệt Học', '—', pct(L.tuyetDoPho.chance || 0, 3)]] : []),
        ]],
        ...((L.rare || []).length ? [['h', 'Vật phẩm hiếm'],
          ['bang', ['Vật phẩm', 'Tỉ lệ'], L.rare.map((r) => [tenItem(r.itemId), pct(r.chance, 2)])]] : []),
        ['luu', 'Tỉ lệ trên là số ghi trong bảng số. Số thực nhận còn nhân với hệ số nhịp, Cơ Duyên và kĩ năng Tiên Minh.'],
      ];
    },
  },

  // ============ TRANG BỊ ============
  {
    id: 'trangbi', ten: 'Trang Bị', nhom: 'Vật Phẩm', dv: 'món',
    cot: [
      { k: 'ten', ten: 'Tên' }, { k: 'o', ten: 'Ô' }, { k: 'pham', ten: 'Phẩm chất', mau: 'pham' },
      { k: 'itemLv', ten: 'Cấp món', so: true }, { k: 'reqLv', ten: 'Cấp cần', so: true },
      { k: 'he', ten: 'Hệ', mau: 'he' }, { k: 'chiSo', ten: 'Chỉ số gốc' }, { k: 'bo', ten: 'Bộ' },
      { k: 'gia', ten: 'Giá bán', so: true },
    ],
    hang: () => GEAR_IDS.filter((id) => !laCongCu(GEAR[id])).map((id) => {
      const g = GEAR[id], q = g.equip || {};
      return {
        id, ten: g.name, _icon: g.icon, _pham: g.quality, pham: tenPham(g.quality),
        o: tenO(q.slot), itemLv: q.itemLv, reqLv: q.reqLevel, he: tenHe(q.he), _he: q.he || 'vohe',
        chiSo: Object.entries(q.stats || {}).map(([k, v]) => ((AFFIX[k] || {}).name || k) + ' ' + so(v)).join(' · ') || '—',
        bo: (TRANG_SETS[q.set] || {}).name || '—', gia: g.value, _g: g,
      };
    }),
    chiTiet: (h) => {
      const g = h._g, q = g.equip || {};
      const boKey = q.set, bo = boKey ? (TRANG_SETS[boKey] || {}).bonus : null;
      const stats = Object.entries(q.stats || {});
      return [
        ...(g.desc ? [['p', g.desc]] : []),
        ['bang', ['Mục', 'Giá trị'], [
          ['Ô trang bị', tenO(q.slot)], ['Phẩm chất', oPham(g.quality)],
          ['Cấp món', so(q.itemLv)], ['Cấp yêu cầu', 'Lv ' + so(q.reqLevel)],
          ['Hệ', oHe(q.he)], ['Sát thương hệ', q.eleDmg ? so(q.eleDmg) : '—'],
          ['Loại vũ khí', q.weaponType || '—'], ['Giá bán', so(g.value) + ' Bạc'],
          ['Số dòng phụ tối đa', so(QUALITY_LINES[g.quality])],
        ]],
        ...(stats.length ? [['h', 'Chỉ số gốc'],
          ['bang', ['Chỉ số', 'Giá trị'], stats.map(([k, v]) => [(AFFIX[k] || {}).name || k, so(v)])]] : []),
        ...(bo ? [['h', 'Dòng ẩn — ' + ((TRANG_SETS[boKey] || {}).name || boKey)],
          ['bang', ['Mốc', 'Cộng thêm'],
            Object.entries(bo).map(([moc, th]) => [moc + ' món',
              Object.entries(th).map(([k, v]) => nhanKhoa(k) + ' +' + (v > 0 && v < 1 ? pct(v, 0) : so(v))).join(' · ')])]] : []),
        ['h', 'Nguồn kiếm'],
        ...khoiNguon(h.id),
      ];
    },
  },

  // ============ CÔNG CỤ ============
  {
    id: 'congcu', ten: 'Công Cụ', nhom: 'Vật Phẩm', dv: 'công cụ',
    cot: [
      { k: 'ten', ten: 'Tên' }, { k: 'o', ten: 'Ô' }, { k: 'nghe', ten: 'Nghề' },
      { k: 'pham', ten: 'Phẩm chất', mau: 'pham' }, { k: 'reqLv', ten: 'Cấp cần', so: true },
      { k: 'eff', ten: 'Hiệu suất' }, { k: 'gia', ten: 'Giá bán', so: true },
    ],
    hang: () => GEAR_IDS.filter((id) => laCongCu(GEAR[id])).map((id) => {
      const g = GEAR[id], q = g.equip || {};
      return {
        id, ten: g.name, _icon: g.icon, _pham: g.quality, pham: tenPham(g.quality),
        o: tenO(q.slot), nghe: tenNghe(q.gatherSkill), reqLv: q.reqLevel,
        eff: '+' + pct(q.gatherEff || 0, 0), _eff: q.gatherEff || 0, gia: g.value, _g: g,
      };
    }),
    chiTiet: (h) => {
      const g = h._g, q = g.equip || {};
      return [
        ...(g.desc ? [['p', g.desc]] : []),
        ['bang', ['Mục', 'Giá trị'], [
          ['Ô công cụ', tenO(q.slot)], ['Dùng cho nghề', tenNghe(q.gatherSkill)],
          ['Phẩm chất', oPham(g.quality)], ['Cấp món', so(q.itemLv)],
          ['Cấp yêu cầu', 'Lv ' + so(q.reqLevel)],
          ['Cộng hiệu suất', '+' + pct(q.gatherEff || 0, 0)], ['Giá bán', so(g.value) + ' Bạc'],
        ]],
        ['ct', 'Chu kỳ thực = thời gian cơ sở ÷ tổng hệ số hiệu suất'],
        ['p', 'Hiệu suất công cụ cộng vào mẫu số cùng với cấp nghề, Tín Vật, kĩ năng Tiên Minh và Linh Thạch.'],
        ['h', 'Nguồn kiếm'],
        ...khoiNguon(h.id),
      ];
    },
  },

  // ============ VẬT PHẨM ============
  {
    id: 'vatpham', ten: 'Vật Phẩm', nhom: 'Vật Phẩm', dv: 'vật phẩm',
    cot: [
      { k: 'ten', ten: 'Tên' }, { k: 'loai', ten: 'Loại' }, { k: 'pham', ten: 'Phẩm chất', mau: 'pham' },
      { k: 'gia', ten: 'Giá bán', so: true }, { k: 'dung', ten: 'Công dụng' }, { k: 'nguon', ten: 'Nguồn' },
    ],
    hang: () => Object.values(ITEMS).filter((i) => i.type !== 'trangbi').map((i) => ({
      id: i.id, ten: i.name, _icon: i.icon, _pham: i.quality, pham: tenPham(i.quality),
      loai: tenLoai(i.type), gia: i.value,
      dung: [
        i.heal ? 'Hồi ' + so(i.heal) + ' Sinh Lực' : null,
        i.healPct ? 'Hồi ' + pct(i.healPct, 0) + ' Sinh Lực' : null,
        i.healNL ? 'Hồi ' + so(i.healNL) + ' Nội Lực' : null,
        i.buff ? 'Buff' : null,
        i.gearId ? 'Chế ' + tenItem(i.gearId) : null,
        i.petBase ? 'Nở Linh Thú' : null,
      ].filter(Boolean).join(' · ') || '—',
      nguon: nguonGon(i.id), _i: i,
    })),
    chiTiet: (h) => {
      const i = h._i;
      return [
        ...(i.desc ? [['p', i.desc]] : []),
        ['bang', ['Mục', 'Giá trị'], [
          ['Loại', tenLoai(i.type)], ['Phẩm chất', oPham(i.quality)], ['Giá bán', so(i.value) + ' Bạc'],
          ...(i.heal ? [['Hồi Sinh Lực', so(i.heal)]] : []),
          ...(i.healPct ? [['Hồi Sinh Lực', pct(i.healPct, 0)]] : []),
          ...(i.healNL ? [['Hồi Nội Lực', so(i.healNL)]] : []),
          ...(i.gearId ? [['Chế ra', tenItem(i.gearId)]] : []),
          ...(i.petBase ? [['Nở ra loài', (PET_SPECIES[i.petBase] || {}).name || i.petBase]] : []),
          ...(i.boss ? [['Dùng cho', 'Yêu Vương']] : []),
        ]],
        ...(i.buff ? [['h', 'Hiệu lực'],
          ['bang', ['Khoá', 'Giá trị'], Object.entries(i.buff).map(([k, v]) => [k, String(v)])]] : []),
        ['h', 'Nguồn kiếm'],
        ...khoiNguon(i.id),
      ];
    },
  },

  // ============ CHIÊU THỨC ============
  {
    id: 'chieu', ten: 'Chiêu Thức', nhom: 'Võ Học', dv: 'chiêu',
    cot: [
      { k: 'ten', ten: 'Tên' }, { k: 'he', ten: 'Hệ', mau: 'he' }, { k: 'bac', ten: 'Bậc' },
      { k: 'mult', ten: 'Hệ số', so: true }, { k: 'nl', ten: 'Nội Lực', so: true },
      { k: 'cd', ten: 'Hồi chiêu', so: true }, { k: 'vai', ten: 'Vai trò' },
    ],
    hang: () => CHIEU.map((c) => ({
      id: c.id, ten: c.name, he: tenHe(c.type), _he: c.type,
      bac: TIER_LABEL[c.tier] || c.tier, mult: c.mult, nl: c.nl, cd: c.cd,
      vai: c.short || '—', _c: c,
    })),
    chiTiet: (h) => {
      const c = h._c;
      const fx = HE_FX[c.type];
      return [
        ['p', c.lore || ''],
        ['bang', ['Mục', 'Giá trị'], [
          ['Hệ', oHe(c.type)], ['Bậc', TIER_LABEL[c.tier] || c.tier],
          ['Hệ số sát thương', '×' + c.mult], ['Tiêu Nội Lực', so(c.nl)],
          ['Hồi chiêu', c.cd ? c.cd + ' nhịp' : 'không hồi chiêu'],
          ...(fx ? [['Hiệu ứng kèm', fx.ten + ' — ' + pct(fx.pct, 0) + ', ' + fx.ticks + ' nhịp']] : []),
        ]],
        ...(c.synergy ? [['h', 'Cách dùng'], ['p', c.synergy]] : []),
      ];
    },
  },

  // ============ TÂM PHÁP ============
  {
    id: 'tamphap', ten: 'Tâm Pháp', nhom: 'Võ Học', dv: 'bộ',
    cot: [
      { k: 'ten', ten: 'Tên' }, { k: 'he', ten: 'Hệ', mau: 'he' }, { k: 'heBonus', ten: 'Cộng hệ' },
      { k: 'noiLuc', ten: 'Nội Lực', so: true }, { k: 'regen', ten: 'Hồi mỗi đòn', so: true },
      { k: 'mod', ten: 'Chỉnh chỉ số' },
    ],
    hang: () => TAM_PHAP_POOL.map((t) => ({
      id: t.id, ten: t.name, he: tenHe(t.he), _he: t.he, heBonus: pct(t.heBonus, 0),
      noiLuc: t.noiLuc, regen: t.nlRegen,
      mod: Object.entries(t.mod || {}).map(([k, v]) => nhanKhoa(k) + ' ' + (v > 0 ? '+' : '') + pct(v, 0)).join(' · '),
      _t: t,
    })),
    chiTiet: (h) => [
      ['p', h._t.lore || ''],
      ['bang', ['Mục', 'Giá trị'], [
        ['Hệ chính', oHe(h._t.he)], ['Cộng sát thương hệ', pct(h._t.heBonus, 0)],
        ['Nội Lực tối đa', '+' + so(h._t.noiLuc)], ['Hồi Nội Lực mỗi đòn thường', so(h._t.nlRegen)],
      ]],
      ['h', 'Chỉnh chỉ số'],
      ['bang', ['Chỉ số', 'Thay đổi'], Object.entries(h._t.mod || {}).map(([k, v]) => [nhanKhoa(k), (v > 0 ? '+' : '') + pct(v, 0)])],
      ['p', h._t.desc || ''],
    ],
  },

  // ============ BỘ PHÁP ============
  {
    id: 'bophap', ten: 'Bộ Pháp', nhom: 'Võ Học', dv: 'bộ',
    cot: [
      { k: 'ten', ten: 'Tên' }, { k: 'thien', ten: 'Thiên về' },
      { k: 'loi', ten: 'Được' }, { k: 'hai', ten: 'Mất' },
    ],
    hang: () => BO_PHAP.map((b) => ({
      id: b.id, ten: b.name, thien: b.gloss || '—',
      loi: (b.pros || []).join(' · ') || '—', hai: (b.cons || []).join(' · ') || '—', _b: b,
    })),
    chiTiet: (h) => [
      ['p', h._b.desc || ''],
      ['bang', ['Chỉ số', 'Thay đổi'], Object.entries(h._b.mod || {}).map(([k, v]) => [nhanKhoa(k), (v > 0 ? '+' : '') + pct(v, 0)])],
    ],
  },

  // ============ BỊ ĐỘNG ============
  {
    id: 'bidong', ten: 'Bị Động', nhom: 'Võ Học', dv: 'món',
    cot: [{ k: 'ten', ten: 'Tên' }, { k: 'he', ten: 'Hệ', mau: 'he' }, { k: 'tac', ten: 'Tác dụng' }],
    hang: () => BI_DONG.map((b) => ({
      id: b.id, ten: b.name, he: tenHe(b.type || b.he), _he: b.type || b.he,
      tac: b.desc || b.short || '—', _b: b,
    })),
    chiTiet: (h) => [
      ...(h._b.lore ? [['p', h._b.lore]] : []),
      ['bang', ['Mục', 'Giá trị'], [['Hệ', h.he], ['Tác dụng', h.tac]]],
    ],
  },

  // ============ DÒNG PHỤ ============
  {
    id: 'affix', ten: 'Dòng Phụ', nhom: 'Vật Phẩm', dv: 'dòng',
    cot: [
      { k: 'ten', ten: 'Dòng' }, { k: 'khoang', ten: 'Khoảng bốc' },
      { k: 'kieu', ten: 'Kiểu' }, { k: 'o', ten: 'Bốc được ở ô' },
    ],
    hang: () => Object.values(AFFIX).map((a) => ({
      id: a.key, ten: a.name, khoang: a.lo + ' – ' + a.hi + (a.fmt === 'pct' ? '%' : ''),
      kieu: a.fmt === 'pct' ? 'phần trăm' : 'số cộng thẳng',
      o: (O_CUA_AFFIX[a.key] || []).join(', ') || 'mọi ô',
    })),
    chiTiet: (h) => [
      ['bang', ['Mục', 'Giá trị'], [
        ['Khoảng giá trị bốc', h.khoang], ['Kiểu', h.kieu], ['Ô có thể bốc ra', h.o],
      ]],
      ['p', 'Số dòng phụ một món mang được quyết định bởi phẩm chất, không phải bởi cấp món.'],
    ],
  },

  // ============ BỘ TRANG ============
  {
    id: 'botrang', ten: 'Bộ Trang', nhom: 'Vật Phẩm', dv: 'bộ',
    cot: [
      { k: 'ten', ten: 'Bộ' }, { k: 'hang', ten: 'Hạng' }, { k: 'soMon', ten: 'Số món', so: true },
      { k: 'm3', ten: 'Mốc 3' }, { k: 'm5', ten: 'Mốc 5' }, { k: 'm7', ten: 'Mốc 7' },
    ],
    hang: () => Object.keys(TRANG_SETS).map((key) => {
      const s = TRANG_SETS[key] || {}, b = s.bonus || SET_BONUS[key] || {};
      const mo = (n) => Object.entries(b[n] || {}).map(([k, v]) => nhanKhoa(k) + ' +' + (v > 0 && v < 1 ? pct(v, 0) : so(v))).join(' · ') || '—';
      const mon = GEAR_IDS.filter((g) => (GEAR[g].equip || {}).set === key);
      return {
        id: key, ten: s.name || key, hang: s.display || 'Thường', he: tenHe(s.he),
        soMon: mon.length || (s.pieces || []).length, m3: mo(3), m5: mo(5), m7: mo(7),
        _mon: mon, _s: s,
      };
    }),
    chiTiet: (h) => [
      ['bang', ['Mục', 'Giá trị'], [
        ['Hạng', h.hang], ['Hệ', oHe(h._s.he)], ['Số món', so(h.soMon)],
        ...(h._s.manhCost ? [['Mảnh Trang Bị mỗi món', so(h._s.manhCost)]] : []),
        ...(h._s.blueprintSource ? [['Đồ phổ bộ rơi ở', h._s.blueprintSource]] : []),
        ...(h._s.source ? [['Nguồn mảnh', h._s.source]] : []),
      ]],
      ['h', 'Dòng ẩn theo mốc'],
      ['bang', ['Mốc', 'Cộng thêm'], [['3 món', h.m3], ['5 món', h.m5], ['7 món', h.m7]]],
      ['p', 'Mốc sau bao gồm mốc trước: đủ 7 món hưởng cả ba mốc.'],
      ['h', 'Món trong bộ'],
      ...(h._mon.length
        ? [['bang', ['Món', 'Ô', 'Cấp cần'], h._mon.map((g) => [GEAR[g].name, tenO((GEAR[g].equip || {}).slot), 'Lv ' + so((GEAR[g].equip || {}).reqLevel)])]]
        : [['p', 'Bộ này ghép từ Mảnh Trang Bị theo đồ phổ, không có món rơi sẵn trong bảng trang bị.']]),
    ],
  },

  // ============ VÙNG ============
  {
    id: 'vung', ten: 'Vùng', nhom: 'Thế Giới', dv: 'vùng',
    cot: [
      { k: 'ten', ten: 'Vùng' }, { k: 'lv', ten: 'Lv', so: true }, { k: 'canh', ten: 'Cảnh giới' },
      { k: 'soQuai', ten: 'Số quái', so: true }, { k: 'quai', ten: 'Quái' },
    ],
    hang: () => LOCATIONS.map((l) => {
      const ds = Object.values(ENEMIES).filter((e) => (VUNG_CUA_QUAI[e.id] || []).includes(l.name));
      const canh = ['Nhân Gian', 'Bí Cảnh', 'Tiên Cảnh', 'Thần Vực'];
      const t = l.reqLevel >= 90 ? 3 : l.reqLevel >= 60 ? 2 : l.reqLevel >= 30 ? 1 : 0;
      return {
        id: l.id, ten: l.name, lv: l.reqLevel, canh: canh[t], soQuai: ds.length,
        quai: ds.map((e) => e.name).join(', ') || '—', _l: l, _ds: ds,
      };
    }),
    chiTiet: (h) => [
      ...(h._l.desc ? [['p', h._l.desc]] : []),
      ['bang', ['Mục', 'Giá trị'], [
        ['Cấp yêu cầu', 'Lv ' + so(h.lv)], ['Cảnh giới', h.canh], ['Số loại quái', so(h.soQuai)],
      ]],
      ...(h._ds.length ? [['h', 'Quái trong vùng'],
        ['bang', ['Quái', 'Lv', 'Sinh Lực', 'EXP', 'Rơi'],
          h._ds.map((e) => [e.name, 'Lv ' + e.reqLevel, so(e.hp), so(e.exp),
            (e.loot || []).map((l) => tenItem(l.itemId) + ' ' + pct(l.chance, 1)).join(' · ') || '—'])]] : []),
      ...(DUNGEONS.some((d) => d.loc === h.id) ? [['h', 'Bí Cảnh trong vùng'],
        ['bang', ['Bí Cảnh', 'Lv', 'Thời lượng'],
          DUNGEONS.filter((d) => d.loc === h.id).map((d) => [d.name, 'Lv ' + d.reqLevel, Math.round(d.durMs / 60000) + ' phút'])]] : []),
    ],
  },

  // ============ NGHỀ ============
  {
    id: 'nghe', ten: 'Nghề', nhom: 'Thế Giới', dv: 'nghề',
    cot: [{ k: 'ten', ten: 'Nghề' }, { k: 'viec', ten: 'Việc' }, { k: 'congCu', ten: 'Công cụ' }],
    hang: () => Object.values(SKILLS).map((s) => ({
      id: s.id, ten: s.name, viec: s.gloss || '—',
      congCu: (TOOL_SLOTS.find((t) => (s.tool || '') === t.id) || {}).name || '—', _s: s,
    })),
    chiTiet: (h) => [
      ...(h._s.desc ? [['p', h._s.desc]] : []),
      ['bang', ['Mục', 'Giá trị'], [
        ['Việc', h.viec], ['Công cụ dùng', h.congCu], ['Cấp tối đa', '100'],
      ]],
      ['ct', 'Chu kỳ thực = thời gian cơ sở ÷ tổng hệ số hiệu suất'],
      ['p', 'Các nguồn hiệu suất cùng cộng vào mẫu số: cấp nghề, công cụ, Tín Vật Đàm Đạo, kĩ năng Tiên Minh, Linh Thạch, và buff Chinh Phạt của vùng đang đứng.'],
    ],
  },

  // ============ LINH THÚ ============
  {
    id: 'linhthu', ten: 'Linh Thú', nhom: 'Linh Thú', dv: 'loài',
    cot: [
      { k: 'ten', ten: 'Loài' }, { k: 'he', ten: 'Hệ', mau: 'he' }, { k: 'vai', ten: 'Vai trò' },
      { k: 'truTru', ten: 'Trụ chính' }, { k: 'cong', ten: 'Công Kích', so: true },
      { k: 'thu', ten: 'Hộ Thể', so: true }, { k: 'mau', ten: 'Sinh Lực', so: true },
      { k: 'ne', ten: 'Né Tránh', so: true }, { k: 'trung', ten: 'Chính Xác', so: true },
    ],
    hang: () => Object.entries(PET_SPECIES).map(([key, s]) => {
      const st = s.stats || {};
      return {
        id: s.base || key, ten: s.name, _icon: s.emoji, he: tenHe(s.he), _he: s.he,
        vai: s.role || '—', truTru: nhanKhoa(s.tuTru),
        cong: st.congKich || 0, thu: st.hoThe || 0, mau: st.sinhLuc || 0,
        ne: st.neTranh || 0, trung: st.menhTrung || 0, _s: s,
      };
    }),
    chiTiet: (h) => {
      const s = h._s, st = s.stats || {};
      return [
        ...(s.lore ? [['p', s.lore]] : []),
        ['bang', ['Mục', 'Giá trị'], [
          ['Hệ', oHe(s.he)], ['Vai trò', s.role || '—'], ['Trụ chính', nhanKhoa(s.tuTru)],
        ]],
        ['h', 'Chỉ số nền mỗi cấp'],
        ['bang', ['Chỉ số', 'Giá trị'], Object.entries(st).map(([k2, v]) => [nhanKhoa(k2), so(v)])],
        ['h', 'Bảy bậc phẩm chất'],
        ['bang', ['Phẩm chất'], Object.keys(PET_QUALITY).map((q) => [oPham(q)])],
        ['p', 'Phẩm chất trứng quyết định phẩm chất thú. Tiềm năng bốc ngẫu nhiên lúc nở từ ' + PET_OPT_POOL.length + ' loại; Thức Tỉnh mở thêm bị động từ ' + Object.keys(AWK_PASSIVES).length + ' loại.'],
      ];
    },
  },

  // ============ DANH HIỆU ============
  {
    id: 'danhhieu', ten: 'Danh Hiệu', nhom: 'Sưu Tập', dv: 'danh hiệu',
    cot: [
      { k: 'ten', ten: 'Danh hiệu' }, { k: 'loai', ten: 'Loại' },
      { k: 'pham', ten: 'Phẩm chất', mau: 'pham' }, { k: 'dk', ten: 'Điều kiện' }, { k: 'thuong', ten: 'Cộng' },
    ],
    hang: () => TITLES.map((t) => ({
      id: t.id, ten: t.name, _pham: t.q, pham: tenPham(t.q),
      loai: TITLE_LOAI[t.loai] || t.loai || '—',
      dk: t.src || '—',
      thuong: (() => { try { return titleBonusText(t) || '—'; } catch (e) { return '—'; } })(),
      _t: t,
    })),
    chiTiet: (h) => [
      ['bang', ['Mục', 'Giá trị'], [
        ['Loại', h.loai], ['Phẩm chất', oPham(h._t.q)], ['Điều kiện mở', h.dk], ['Cộng chỉ số', h.thuong],
      ]],
      ...(h._t.cond ? [['h', 'Điều kiện tính bằng'],
        ['bang', ['Khoá', 'Giá trị'], Object.entries(h._t.cond).map(([k, v]) => [k, String(v)])]] : []),
    ],
  },

  // ============ HUY HIỆU ============
  {
    id: 'huyhieu', ten: 'Huy Hiệu', nhom: 'Sưu Tập', dv: 'huy hiệu',
    cot: [{ k: 'ten', ten: 'Huy hiệu' }, { k: 'nghe', ten: 'Nghề' }, { k: 'dk', ten: 'Điều kiện' }],
    hang: () => BADGES.map((b) => ({
      id: b.skillId, ten: b.name, nghe: tenNghe(b.skillId),
      dk: 'Đưa ' + tenNghe(b.skillId) + ' lên cấp ' + BADGE_LV, _b: b,
    })),
    chiTiet: (h) => [
      ...(h._b.desc ? [['p', h._b.desc]] : []),
      ['bang', ['Mục', 'Giá trị'], [['Nghề', h.nghe], ['Điều kiện', h.dk]]],
    ],
  },

  // ============ BÍ KÍP TÔNG MÔN ============
  {
    id: 'bikip', ten: 'Bí Kíp', nhom: 'Tông Môn', dv: 'bí kíp',
    cot: [
      { k: 'ten', ten: 'Bí kíp' }, { k: 'nhanh', ten: 'Nhánh' },
      { k: 'bac', ten: 'Bậc' }, { k: 'cong', ten: 'Cộng cho đệ tử' },
    ],
    hang: () => BI_KIP.map((b) => ({
      id: b.id, ten: b.ten || b.name, nhanh: (BI_KIP_LOAI[b.loai] || {}).name || b.loai,
      bac: (BI_KIP_TIER[b.tier] || {}).name || b.tier,
      cong: moTaBonus((BI_KIP_LOAI[b.loai] || {}).prof),
      _b: b,
    })),
    chiTiet: (h) => [
      ...(h._b.lore ? [['p', h._b.lore]] : []),
      ['bang', ['Mục', 'Giá trị'], [['Nhánh', h.nhanh], ['Bậc', h.bac], ['Cộng cho đệ tử', h.cong]]],
      ['p', 'Nguồn: đấu giá Tàng Thư Lâu và Bí Cảnh. Bí kíp trùng ghép lên bậc cao hơn. Bậc học được bị Tàng Thư Lâu chặn trần.'],
    ],
  },

  // ============ ĐAN PHÁ CẢNH ============
  {
    id: 'dan', ten: 'Đan Phá Cảnh', nhom: 'Tông Môn', dv: 'loại đan',
    cot: [{ k: 'ten', ten: 'Đan' }, { k: 'canh', ten: 'Dùng lên cảnh giới' }],
    hang: () => Object.entries(PILLS).map(([k, p]) => ({
      id: k, ten: p.ten || p.name, canh: p.realm || p.canh || '—', _p: p,
    })),
    chiTiet: (h) => [
      ...(h._p.desc ? [['p', h._p.desc]] : []),
      ['bang', ['Mục', 'Giá trị'], [['Dùng lên cảnh giới', h.canh]]],
      ['p', 'Luyện ở Y Quán. Số lò và tốc luyện tăng theo cấp Y Quán. Phẩm đan bốc ngẫu nhiên, phẩm cao thì tỉ lệ phá cảnh cao hơn.'],
    ],
  },

  // ============ KĨ NĂNG TIÊN MINH ============
  {
    id: 'knbang', ten: 'Kĩ Năng Tiên Minh', nhom: 'Tiên Minh', dv: 'kĩ năng',
    cot: [
      { k: 'ten', ten: 'Kĩ năng' }, { k: 'tac', ten: 'Cộng' },
      { k: 'moiCap', ten: 'Mỗi cấp' }, { k: 'maxLv', ten: 'Trần', so: true },
      { k: 'capBang', ten: 'Cấp minh cần', so: true }, { k: 'gia', ten: 'Công Tích nền', so: true },
    ],
    hang: () => KY_NANG_BANG.map((k) => ({
      id: k.id, ten: k.ten, tac: k.han || nhanKhoa(k.key), moiCap: pct(k.moiCap, 1),
      maxLv: k.maxLv, capBang: k.capBang, gia: k.giaNen, _k: k,
    })),
    chiTiet: (h) => [
      ['bang', ['Mục', 'Giá trị'], [
        ['Cộng vào', h.tac], ['Mỗi cấp', h.moiCap],
        ['Trần cấp', so(h.maxLv)], ['Tổng khi học hết', pct(h._k.moiCap * h._k.maxLv, 1)],
        ['Cấp minh yêu cầu', so(h.capBang)], ['Công Tích nền', so(h.gia)],
      ]],
      ['p', 'Học bằng Công Tích. Cộng chỉ số thật cho mọi thành viên. Nhánh nào cũng bị một công trình chặn trần cấp.'],
    ],
  },

  // ============ CÔNG TRÌNH TIÊN MINH ============
  {
    id: 'ctbang', ten: 'Công Trình Tiên Minh', nhom: 'Tiên Minh', dv: 'công trình',
    cot: [
      { k: 'ten', ten: 'Công trình' }, { k: 'maxLv', ten: 'Trần', so: true },
      { k: 'gio', ten: 'Giờ xây', so: true }, { k: 'bacNen', ten: 'Bạc nền', so: true },
      { k: 'tac', ten: 'Tác dụng' },
    ],
    hang: () => CONG_TRINH.map((c) => ({
      id: c.id, ten: c.ten, maxLv: c.maxLv, gio: c.gioXay, bacNen: c.bacNen,
      tac: c.desc || '—', _c: c,
    })),
    chiTiet: (h) => {
      const c = h._c;
      const mau = typeof c.moTaCap === 'function' ? c.moTaCap(1) : [];
      const cao = typeof c.moTaCap === 'function' ? c.moTaCap(c.maxLv) : [];
      return [
        ['p', c.desc || ''],
        ['bang', ['Mục', 'Giá trị'], [
          ['Trần cấp', so(c.maxLv)], ['Giờ xây cấp 1', c.gioXay + ' giờ'], ['Bạc nền', so(c.bacNen)],
        ]],
        ...(mau.length ? [['h', 'Tác dụng theo cấp'],
          ['bang', ['Mục', 'Cấp 1', 'Cấp ' + c.maxLv],
            mau.map((m, i) => [m[0], m[1], (cao[i] || [])[1] || '—'])]] : []),
      ];
    },
  },

  // ============ MINH HỘI CÁC ============
  {
    id: 'chbang', ten: 'Minh Hội Các', nhom: 'Tiên Minh', dv: 'món',
    cot: [
      { k: 'ten', ten: 'Món' }, { k: 'gia', ten: 'Công Tích', so: true },
      { k: 'han', ten: 'Hạn / ngày', so: true }, { k: 'capBang', ten: 'Cấp minh cần', so: true },
    ],
    hang: () => CUA_HANG_BANG.map((h) => ({
      id: h.id, ten: h.ten || tenItem(h.itemId), gia: h.gia, han: h.hanNgay || h.han,
      capBang: h.capBang || 1, _h: h,
    })),
    chiTiet: (h) => [
      ['bang', ['Mục', 'Giá trị'], [
        ['Giá', so(h.gia) + ' Công Tích'], ['Hạn mua mỗi ngày', so(h.han)],
        ['Cấp minh yêu cầu', so(h.capBang)],
      ]],
    ],
  },

  // ============ LINH THẠCH ============
  {
    id: 'linhthach', ten: 'Linh Thạch', nhom: 'Thế Giới', dv: 'loại đá',
    cot: [
      { k: 'ten', ten: 'Linh Thạch' }, { k: 'exp', ten: 'Kinh nghiệm nghề' },
      { k: 'eff', ten: 'Hiệu suất' }, { k: 'yield', ten: 'Sản lượng' },
    ],
    hang: () => Object.entries(LINH_THACH).map(([k, v]) => ({
      id: k, ten: tenItem(v.itemId || k),
      exp: v.expPct ? '+' + v.expPct + '%' : '—',
      eff: v.effPct ? '+' + v.effPct + '%' : '—',
      yield: v.yieldPct ? '+' + v.yieldPct + '%' : '—',
      _v: v,
    })),
    chiTiet: (h) => [
      ...(((ITEMS[h._v.itemId] || {}).desc) ? [['p', ITEMS[h._v.itemId].desc]] : []),
      ['bang', ['Cộng vào', 'Mức'], [
        ['Kinh nghiệm nghề', h.exp], ['Hiệu suất (rút ngắn chu kỳ)', h.eff], ['Sản lượng mỗi lượt', h.yield],
      ]],
      ['p', 'Linh Thạch có thời lượng hoạt động; hết viên này thì tự đốt viên cùng loại kế tiếp. Hết sạch thì việc vẫn chạy, chỉ mất phần cộng thêm.'],
      ['h', 'Nguồn kiếm'],
      ...khoiNguon(h._v.itemId || h.id),
    ],
  },

  // ============ VẠN VẬT PHỔ ============
  {
    id: 'vanvat', ten: 'Vạn Vật Phổ', nhom: 'Sưu Tập', dv: 'phổ',
    cot: [
      { k: 'ten', ten: 'Phổ' }, { k: 'dv', ten: 'Tính theo' },
      { k: 'muc', ten: 'Số mục', so: true }, { k: 'le', ten: 'Cộng lẻ' }, { k: 'bo', ten: 'Đủ bộ' },
    ],
    hang: () => CODEX_CATS.map((c) => ({
      id: c.key, ten: c.name, dv: NHAN_DEM[c.key] || ('Số lần ' + (c.unit || 'ghi nhận')),
      muc: c.total || (c.entries || []).length,
      le: (c.per || {}).label || '—', bo: (c.set || {}).label || '—', _c: c,
    })),
    chiTiet: (h) => [
      ['bang', ['Mục', 'Giá trị'], [
        ['Đếm theo', h.dv], ['Số mục', so(h.muc)],
        ['Cộng mỗi mục', h.le], ['Đủ bộ', h.bo],
        ...(h._c.threshold ? [['Ngưỡng đầy một mục', so(h._c.threshold)]] : []),
      ]],
      ...((h._c.groups || []).length ? [['h', 'Nhóm'],
        ['bang', ['Nhóm', 'Số mục'], h._c.groups.map((g) => [g.label, so((g.entries || []).length)])]] : []),
    ],
  },
];

export const CN_DB_BY_ID = Object.fromEntries(CN_DB.map((b) => [b.id, b]));

/** Nhóm các bảng để bày ở rìa trái. */
export const CN_DB_NHOM = (() => {
  const ra = [];
  for (const b of CN_DB) {
    let g = ra.find((x) => x.ten === b.nhom);
    if (!g) ra.push((g = { ten: b.nhom, bang: [] }));
    g.bang.push(b);
  }
  return ra;
})();
