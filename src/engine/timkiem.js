// ============================================================
// TÌM KIẾM CHUNG — gõ một chữ, ra mọi thứ trong trò chơi có tên đó.
//
// Nguyên tắc: máy này CHỈ TÌM, không tự vẽ trang chi tiết. Mỗi kết quả kèm một
// "đường đi" (`di`) trỏ tới trang ĐÃ CÓ SẴN:
//   · tra   -> Cẩm Nang Tra Cứu, đúng bảng + đúng hàng
//   · danhsi-> Hồ Sơ Danh Sĩ
//   · bot   -> Hồ Sơ nhân vật giang hồ
//   · bang  -> view Tiên Minh, bảng Chinh Phạt
// Thêm nguồn mới thì thêm vào NGUON_TINH (thứ không đổi) hoặc nguonSong()
// (thứ suy từ seed thế giới + thời gian).
// ============================================================
import { ITEMS } from '../data/items.js';
import { GEAR, GEAR_IDS } from '../data/gear.js';
import { ENEMIES, YEU_VUONG } from '../data/combat.js';
import { DUNGEONS } from '../data/dungeon.js';
import { LOCATIONS } from '../data/locations.js';
import { SKILLS } from '../data/skills.js';
import { CHIEU, TAM_PHAP_POOL, BO_PHAP, BI_DONG } from '../data/votong.js';
import { TITLES } from '../data/titles.js';
import { PET_SPECIES } from '../data/pets.js';
import { BI_KIP } from '../data/tongmon.js';
import { TOOL_SLOTS } from '../data/ui.js';
import { danhSiList } from './danhsi.js';
import { genRoster, botTotalLv, botActivity } from './bots.js';
import { bangAI } from './bangphai.js';

const DAU = new RegExp('[̀-ͯ]', 'g');
export const boDau = (s) => String(s == null ? '' : s)
  .normalize('NFD').replace(DAU, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

const O_CONG_CU = TOOL_SLOTS.map((t) => t.id);
const laCongCu = (g) => O_CONG_CU.includes(((g || {}).equip || {}).slot);

/** Số kết quả mỗi nhóm khi chưa mở rộng. */
export const MOI_NHOM = 4;

// ---------- nguồn TĨNH: dựng chỉ mục đúng một lần ----------
function dungNguonTinh() {
  const ra = [];
  // `anh` = { thu, ten?, bieu? } — CHO BIẾT LẤY ẢNH Ở ĐÂU (mỗi loại một thư mục riêng:
  //   items · equip · enemies · dungeons · locations · chieu · bophap · bidong · pets · danhsi)
  // `bieu` là tên icon nét trong SVG_PATHS, dùng khi loại đó chưa có art.
  // ⚠ ĐỪNG dùng chữ Hán làm dự phòng: font tiêu đề nạp dạng subset qua `&text=`, chữ nào
  //   không khai báo là rơi font. Đã đo bằng glyphCoTrongFont(): cả 11 chữ định dùng đều thiếu.
  const them = (nhom, thuTu, id, ten, phu, di, anh) =>
    ra.push({ nhom, thuTu, id, ten, phu, di, anh: anh || { bieu: 'info' }, _k: boDau(ten) });

  // Vật phẩm (trừ trang bị — trang bị có bảng riêng)
  for (const i of Object.values(ITEMS)) {
    if (!i || i.type === 'trangbi') continue;
    them('Vật Phẩm', 1, i.id, i.name, i.desc || '', { loai: 'tra', bang: 'vatpham', hang: i.id },
      { thu: 'items', ten: i.id, emoji: i.icon });
  }
  // Trang bị + công cụ
  for (const id of GEAR_IDS) {
    const g = GEAR[id]; if (!g) continue;
    const cc = laCongCu(g);
    them(cc ? 'Công Cụ' : 'Trang Bị', 2, id, g.name,
      'Cấp ' + ((g.equip || {}).reqLevel || 1), { loai: 'tra', bang: cc ? 'congcu' : 'trangbi', hang: id },
      { thu: 'equip', ten: id, emoji: g.icon });
  }
  for (const e of Object.values(ENEMIES)) them('Quái', 3, e.id, e.name, 'Lv ' + e.reqLevel, { loai: 'tra', bang: 'quai', hang: e.id },
    { thu: 'enemies', ten: e.id, emoji: e.icon });
  // ⚠ Art Yêu Vương nằm ở `images/items/`, KHÔNG phải `images/enemies/` — vì view Yêu Vương
  //   gọi ico() mà ico() mặc định về thư mục items khi id không có trong ICON_FOLDERS.
  //   Trỏ sang enemies thì 10 con boss đều rơi về icon nét.
  for (const y of YEU_VUONG) them('Yêu Vương', 3, y.id, y.name, 'Lv ' + y.reqLevel, { loai: 'tra', bang: 'yeuvuong', hang: y.id },
    { thu: 'items', ten: y.id, bieu: 'crack' });
  for (const d of DUNGEONS) them('Bí Cảnh', 4, d.id, d.name, 'Lv ' + d.reqLevel, { loai: 'tra', bang: 'bicanh', hang: d.id },
    { thu: 'dungeons', ten: d.id, bieu: 'gate' });
  for (const l of LOCATIONS) them('Vùng', 4, l.id, l.name, 'Lv ' + l.reqLevel, { loai: 'tra', bang: 'vung', hang: l.id },
    { thu: 'locations', ten: l.id, emoji: l.icon });
  for (const s of Object.values(SKILLS)) them('Nghề', 5, s.id, s.name, s.gloss || '', { loai: 'tra', bang: 'nghe', hang: s.id },
    { bieu: 'hammer' });
  for (const c of CHIEU) them('Chiêu Thức', 5, c.id, c.name, c.short || '', { loai: 'tra', bang: 'chieu', hang: c.id },
    { thu: 'chieu', ten: c.id, bieu: 'sword' });
  for (const t of TAM_PHAP_POOL) them('Tâm Pháp', 5, t.id, t.name, t.short || '', { loai: 'tra', bang: 'tamphap', hang: t.id },
    { bieu: 'bulb' });
  for (const b of BO_PHAP) them('Bộ Pháp', 5, b.id, b.name, b.gloss || '', { loai: 'tra', bang: 'bophap', hang: b.id },
    { thu: 'bophap', ten: b.id, bieu: 'steps' });
  for (const b of BI_DONG) them('Bị Động', 5, b.id, b.name, '', { loai: 'tra', bang: 'bidong', hang: b.id },
    { thu: 'bidong', ten: b.id, bieu: 'shield' });
  for (const s of Object.values(PET_SPECIES)) them('Linh Thú', 6, s.base, s.name, s.role || '', { loai: 'tra', bang: 'linhthu', hang: s.base },
    { thu: 'pets', ten: 'pet_' + s.base + '_base', emoji: s.emoji });
  for (const t of TITLES) them('Danh Hiệu', 6, t.id, t.name, t.src || '', { loai: 'tra', bang: 'danhhieu', hang: t.id },
    { bieu: 'trophy' });
  for (const b of BI_KIP) them('Bí Kíp', 6, b.id, b.ten, '', { loai: 'tra', bang: 'bikip', hang: b.id }, { bieu: 'book' });
  return ra;
}
let _TINH = null;
const nguonTinh = () => (_TINH || (_TINH = dungNguonTinh()));

// ---------- nguồn SỐNG: suy từ seed thế giới, đổi theo thời gian ----------
function nguonSong(world, now) {
  const ra = [];
  const seed = (world && world.seed) || 0;
  if (!seed) return ra;

  for (const d of (danhSiList(now) || [])) {
    ra.push({
      nhom: 'Danh Sĩ', thuTu: 0, id: d.id, ten: d.ten || d.name,
      phu: [d.monPhai, d.hieu].filter(Boolean).join(' · '),
      di: { loai: 'danhsi', id: d.id }, anh: { thu: 'danhsi', ten: d.id, bieu: 'nguoi' },
      _k: boDau(d.ten || d.name),
    });
  }
  for (const b of (genRoster(seed, (world && world.createdAt) || 0) || [])) {
    ra.push({
      nhom: 'Nhân Vật', thuTu: 0, id: b.id, ten: b.ten || b.name,
      phu: 'Tổng Lv ' + botTotalLv(b, now),
      di: { loai: 'bot', id: b.id }, anh: { bieu: 'nguoi' }, _k: boDau(b.ten || b.name),
    });
  }
  for (const g of (bangAI(world, now) || [])) {
    ra.push({
      nhom: 'Tiên Minh', thuTu: 0, id: g.id, ten: g.ten,
      phu: 'Cấp ' + g.cap + ' · ' + g.soTv + ' người',
      di: { loai: 'bang', id: g.id }, anh: { bieu: 'gate' }, _k: boDau(g.ten),
    });
  }
  return ra;
}

/**
 * Tìm `q` trong mọi nguồn. Trả về các nhóm đã xếp thứ tự, mỗi nhóm kèm tổng số
 * khớp để nút "xem thêm" biết còn bao nhiêu.
 *
 * Xếp hạng: khớp đúng cả tên > khớp từ đầu > khớp giữa chừng; sau đó tên ngắn
 * lên trước (gõ "kim" thì "Kim Quang" phải đứng trên "Cương Kim Bất Hoại Thể").
 */
export function timKiem(q, { world, now, tranNhom = MOI_NHOM } = {}) {
  const k = boDau(q || '').trim();
  if (k.length < 2) return { rong: true, nhom: [], tong: 0 };

  const het = [...nguonTinh(), ...nguonSong(world, now || Date.now())];
  const khop = [];
  for (const m of het) {
    const i = m._k.indexOf(k);
    if (i < 0) continue;
    const diem = (m._k === k ? 0 : i === 0 ? 1 : 2) * 1000 + Math.min(999, m.ten.length);
    khop.push({ ...m, _diem: diem });
  }
  khop.sort((a, b) => a._diem - b._diem || a.ten.localeCompare(b.ten, 'vi'));

  const theoNhom = new Map();
  for (const m of khop) {
    if (!theoNhom.has(m.nhom)) theoNhom.set(m.nhom, { ten: m.nhom, thuTu: m.thuTu, ds: [], tong: 0 });
    const g = theoNhom.get(m.nhom);
    g.tong++;
    if (g.ds.length < tranNhom) g.ds.push(m);
  }
  const nhom = [...theoNhom.values()].sort((a, b) => {
    // Nhóm nào có kết quả khớp sát nhất thì lên trước; hoà thì theo thứ tự khai báo.
    const sa = Math.min(...a.ds.map((x) => x._diem)), sb = Math.min(...b.ds.map((x) => x._diem));
    return sa - sb || a.thuTu - b.thuTu || a.ten.localeCompare(b.ten, 'vi');
  });
  return { rong: false, nhom, tong: khop.length };
}

/** Vài gợi ý lúc ô tìm còn trống — cho người chơi biết tìm được những gì. */
export const GOI_Y = ['Hắc Thán', 'Bạch Hổ', 'Liệt Hỏa Đao', 'Thiên Thành', 'Đào Khoáng'];

/** Chỉ mục tĩnh — chỉ dùng cho bài kiểm (soi nguồn ảnh có trỏ đúng thư mục không). */
export const _chiMucDeKiem = () => nguonTinh();
