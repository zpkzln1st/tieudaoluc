// ============================================================
// ENGINE — Danh Sĩ Giang Hồ (deep AI). LAZY-SIM thuần (id, now): 0 server, 0 vòng lặp.
// Sống qua reload + tiến theo thời gian thực (cảnh giới/Biên Niên mọc dần, hoạt động/tâm cảnh đổi theo giờ).
// ============================================================
import { DANH_SI, DANHSI_REL } from '../data/danhsi.js';

const DAY = 86400000;
const EPOCH = 1735689600000;   // 2025-01-01 — mốc tuyệt đối để tu vi/Biên Niên tiến đều theo thời gian

function h32(s) { let h = 2166136261 >>> 0; s = '' + s; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
const pick = (arr, k) => arr[h32(k) % arr.length];

const REALMS = ['Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa', 'Độ Kiếp', 'Đắc Đạo'];
// Màu ngũ hành ĐỒNG BỘ với bảng chuẩn game (votong.js NGU_HANH): Kim vàng · Mộc lục · Thủy lam · Hỏa cam · Thổ hổ phách.
const HE_COLOR = { kim: '#facc15', moc: '#34d399', thuy: '#38bdf8', hoa: '#fb923c', tho: '#f59e0b' };
const HE_NAME = { kim: 'Kim', moc: 'Mộc', thuy: 'Thủy', hoa: 'Hỏa', tho: 'Thổ' };
const DAO = { chinh: ['Chính Đạo', '#14b8a6'], ta: ['Tà Đạo', '#e879f9'], trung: ['Trung Lập', '#94a3b8'] };
const REL_NAME = { tucDich: 'Túc Địch', suDo: 'Sư Đồ', daoLu: 'Đạo Lữ', huyetCuu: 'Huyết Cừu', dongMon: 'Đồng Môn', triKy: 'Tri Kỷ', cuuThu: 'Cứu Thù' };
const REL_COLOR = { tucDich: '#fb7185', suDo: '#f5b942', daoLu: '#f472b6', huyetCuu: '#ef4444', dongMon: '#34d399', triKy: '#22d3ee', cuuThu: '#a78bfa' };
const LOAI_COLOR = { khoiDau: '#94a3b8', dotPha: '#f5b942', tramBoss: '#fb7185', kyNgo: '#a78bfa', anOan: '#22d3ee', giangHo: '#34d399' };
const QUAL = [
  { n: 'Phàm Phẩm', c: '#cbd5e1' }, { n: 'Lương Phẩm', c: '#34d399' }, { n: 'Tinh Phẩm', c: '#60a5fa' },
  { n: 'Cực Hiếm', c: '#a78bfa' }, { n: 'Truyền Thế', c: '#e879f9' }, { n: 'Thần Phẩm', c: '#fb923c' },
];
const PLACES = ['Lăng Tiêu Phong', 'Hắc Phong Lĩnh', 'U Lâm', 'Huyền Đô', 'Thủy Tinh Động', 'Vân Mộng Trạch', 'Bắc Cương', 'Tàng Kiếm Sơn', 'Lạc Dương cổ thành', 'Mai Cốc'];

// ---- Cảnh giới + tu vi (tiến NHẸ, monotonic theo thời gian) ----
function realmOf(c, now) {
  const base = Math.max(2, Math.min(9, Math.floor((c.rankPower || 500) / 108)));   // ~430->3 ... ~950->8/9
  const ageM = Math.max(0, (now - EPOCH) / (DAY * 30));
  const f = Math.min(9.99, base + Math.min(1.2, ageM * 0.03));                      // +~0.36 bậc/năm, cap +1.2
  const idx = Math.min(9, Math.floor(f));
  return { idx, name: REALMS[idx], pct: Math.round((f - idx) * 100) };
}

// ---- Hoạt động (đổi mỗi 4 giờ) + tâm cảnh (đổi mỗi ngày) ----
const ACTS = [
  () => 'đang bế quan khổ luyện', (p) => 'đang vân du ' + p, () => 'đang luận võ cùng cao thủ',
  () => 'đang truy lùng cừu nhân', () => 'đang dưỡng thương nơi u cốc', (p) => 'đang tầm bảo tại ' + p,
  () => 'đang ẩn cư tị thế', (p) => 'đang ngao du ' + p,
];
function activityOf(c, now) {
  const slot = Math.floor(now / (DAY / 6));
  const place = PLACES[h32(c.id + ':pl:' + slot) % PLACES.length];
  return ACTS[h32(c.id + ':act:' + slot) % ACTS.length](place);
}
function tamCanhOf(c, now) {
  const pool = (c.tamCanh && c.tamCanh.length) ? c.tamCanh : [''];
  return pool[h32(c.id + ':tc:' + Math.floor(now / DAY)) % pool.length];
}

// ---- Biên Niên: sự kiện gần đây MỌC DẦN theo thời gian + lifeEvents tác giả (lịch sử) ----
const AUTO_PERIOD = DAY * 11;
const AUTO_POOL = [
  { loai: 'dotPha', t: (c) => `Bế quan ${2 + (h32(c.id) % 6)} ngày, công lực lại tiến thêm một tầng.` },
  { loai: 'tramBoss', t: (c) => `Ác chiến nơi ${pick(PLACES, c.id + 'b')}, trảm một yêu thú khét tiếng.` },
  { loai: 'kyNgo', t: (c) => `Tình cờ đắc một mảnh tàn quyển nơi ${pick(PLACES, c.id + 'k')}.` },
  { loai: 'giangHo', t: () => 'Danh tiếng lại vang thêm một dải giang hồ.' },
];
function bienNien(c, now) {
  const out = [];
  const cur = Math.floor(now / AUTO_PERIOD);
  for (let k = 0; k < 4; k++) {
    const slot = cur - k, seed = h32(c.id + ':ev:' + slot);
    if (seed % 100 < 62) { const ev = AUTO_POOL[seed % AUTO_POOL.length]; out.push({ daysAgo: Math.max(0, Math.round((now - slot * AUTO_PERIOD) / DAY)), loai: ev.loai, text: ev.t(c) }); }
  }
  (c.lifeEvents || []).forEach((e, i) => { out.push({ daysAgo: 60 + i * (40 + (h32(c.id + ':d' + i) % 30)), loai: e.loai, text: e.text }); });
  out.sort((a, b) => a.daysAgo - b.daysAgo);
  return out.slice(0, 10);
}

// ---- Trang bị deterministic (9 slot; phẩm theo rankPower; vũ khí = binhKhi tác giả) ----
const SLOTS = [['vuKhi', 'Vũ Khí'], ['mu', 'Mũ'], ['giap', 'Giáp'], ['dai', 'Đai'], ['gang', 'Găng'], ['giay', 'Giày'], ['trangSuc', 'Trang Sức'], ['nhan', 'Nhẫn'], ['toaKy', 'Tọa Kỵ']];
const THEME_ADJ = {
  thuy: ['Hàn Băng', 'Tuyết', 'Lãnh Sương', 'Băng Tâm'], kim: ['Cương Thiết', 'Bạch Kim', 'Tinh Cương', 'Lưu Ngân'],
  moc: ['Thanh Mộc', 'Bích La', 'Lục Vân', 'Tử Đằng'], hoa: ['Viêm Dương', 'Hỏa Linh', 'Xích Diễm', 'Hồng Liên'],
  tho: ['Hậu Thổ', 'Hoàng Cương', 'Trấn Nhạc', 'Kim Sa'],
};
const SLOT_NOUN = { mu: ['Quan', 'Mạo'], giap: ['Bào', 'Giáp'], dai: ['Đái', 'Thúc Đái'], gang: ['Hộ Thủ', 'Thủ Sáo'], giay: ['Ngoa', 'Lý'], trangSuc: ['Bội', 'Anh Lạc'], nhan: ['Giới', 'Hoàn'], toaKy: ['Câu', 'Tê'] };
// ---- Art trang bị THẬT: gearId -> images/equip/<id>.webp. ----
// 8 slot phòng/phụ: mirror catalog mkBac (data/gear.js), index 0..6 = bậc 1..7 (Phàm..Cô Bản); chọn theo phẩm qd.
const GEAR_ART = {
  mu:       ['eq_bo_can', 'eq_thanh_truc_dau_lap', 'eq_ho_bi_chien_mao', 'eq_la_han_bao_quan', 'eq_cuu_long_kim_quan', 'eq_bich_ngoc_hoang_quan', 'eq_lien_hoa_dao_quan'],
  giap:     ['eq_ao_vai_tho', 'eq_te_lan_giap', 'eq_toan_nghe_giap', 'eq_van_luu_quy_tong_y', 'eq_toa_tu_giap', 'eq_tuyen_long_bao', 'eq_minh_vuong_khai_giap'],
  dai:      ['eq_xich_dong_thuc_dai', 'eq_thanh_xa_linh_dai', 'eq_bach_ngoc_bao_dai', 'eq_thanh_truc_cam_dai', 'eq_huyen_thiet_chien_dai', 'eq_luu_van_phi_dai', 'eq_kim_long_bao_dai'],
  gang:     ['eq_tho_bi_thu_sao', 'eq_thiet_cot_ho_thu', 'eq_xich_dong_ti_giap', 'eq_hac_long_lan_thu', 'eq_bang_tam_linh_thu', 'eq_hoa_diem_chien_thu', 'eq_loi_dinh_thu_sao'],
  giay:     ['eq_vai_giay', 'eq_lang_ba_ly', 'eq_tien_van_ly', 'eq_phi_van_ly', 'eq_phong_anh_hai', 'eq_loi_quang_chien_ngoa', 'eq_thien_hanh_than_ly'],
  trangSuc: ['eq_bich_ngoc_boi', 'eq_duong_chi_ngoc_boi', 'eq_lien_tam_boi', 'eq_chien_van_linh_phu', 'eq_bich_hai_trieu_sinh_boi', 'eq_long_phuong_song_boi', 'eq_kim_quang_tien_phu'],
  nhan:     ['eq_luc_truc_ban_chi', 'eq_bach_ngoc_gioi_chi', 'eq_tu_kim_linh_gioi', 'eq_hoang_long_ban_chi', 'eq_hoa_long_chau_gioi', 'eq_tu_vi_tinh_hoan', 'eq_can_khon_huyen_gioi'],
  toaKy:    ['eq_thanh_tong_ma', 'eq_dai_uyen_luong_cau', 'eq_dich_lu', 'eq_o_van_dap_tuyet', 'eq_han_huyet_bao_cau', 'eq_phi_van', 'eq_chieu_da_ngoc_su_tu'],
};
// Vũ khí thường: 4 loại × 7 bậc -> eq_<loai>_<bac>. Loại suy từ tên binh khí.
function weaponType(ten) {
  const s = (ten || '').toLowerCase();
  if (s.includes('kiếm')) return 'kiem';
  if (s.includes('đao')) return 'dao';
  if (s.includes('cung')) return 'cung';
  return 'amkhi';   // ám khí / nỏ liên châu / châm hạp…
}
// Binh khí ĐẶC BIỆT (sáo/quạt/phất trần/hồ lô/cầm/trượng/tì bà): art ký danh riêng images/equip/eq_dsw_*.webp.
const DSW_WEAPON = {
  diepTuSuong: 'eq_dsw_tieu', lacVoTran: 'eq_dsw_phien', vanVongNuong: 'eq_dsw_phattran',
  doCoTuyHan: 'eq_dsw_holo', langToCam: 'eq_dsw_cam', khongTichThuyenSu: 'eq_dsw_truong', huyetTiBaCo: 'eq_dsw_tiba',
};
function gearOf(c) {
  const baseQ = Math.min(5, Math.max(1, Math.floor((c.rankPower || 500) / 180)));
  const adj = THEME_ADJ[c.nguHanh] || THEME_ADJ.kim;
  return SLOTS.map(([sid, sname], i) => {
    if (sid === 'vuKhi') {
      const wq = Math.min(5, baseQ + 1), q = QUAL[wq];
      const gearId = DSW_WEAPON[c.id] || ('eq_' + weaponType(c.binhKhi && c.binhKhi.ten) + '_' + (wq + 1));
      return { slot: sname, gearId, name: (c.binhKhi && c.binhKhi.ten) || 'Vô Danh', pham: (c.binhKhi && c.binhKhi.pham) || q.n, color: '#f5b942', sig: true };
    }
    const qd = Math.max(0, Math.min(5, baseQ + ((h32(c.id + ':g' + i) % 3) - 1)));
    const q = QUAL[qd];
    const a = adj[h32(c.id + ':a' + i) % adj.length];
    const nounArr = SLOT_NOUN[sid] || ['Khí']; const noun = nounArr[h32(c.id + ':n' + i) % nounArr.length];
    return { slot: sname, gearId: (GEAR_ART[sid] || [])[qd] || null, name: `${a} ${noun}`, pham: q.n, color: q.c, sig: false };
  });
}

// ---- Chỉ số chiến đấu danh sĩ (suy từ rank + cảnh giới + biến thiên cá thể) ----
function statsOf(c, realmIdx) {
  const rp = c.rankPower || 500;
  const v = (k) => 0.92 + (h32(c.id + ':st:' + k) % 17) / 100;
  const ck = Math.round((rp * 1.6 + realmIdx * 340) * v('ck'));
  const ht = Math.round((rp * 1.2 + realmIdx * 300) * v('ht'));
  const sl = Math.round((rp * 34 + realmIdx * 2600) * v('sl'));
  const nt = Math.round((rp * 0.7 + realmIdx * 150) * v('nt'));
  const mt = Math.round((rp * 0.8 + realmIdx * 170) * v('mt'));
  const bk = Math.min(65, Math.round(8 + realmIdx * 3 + (rp - 500) / 28));
  const kc = Math.round(120 + realmIdx * 22 + rp * 0.22);
  const cl = ck + ht + nt + mt + realmIdx * 200 + Math.round(rp);
  return [
    { name: 'Công Kích', val: ck }, { name: 'Phòng Ngự', val: ht },
    { name: 'Né Tránh', val: nt }, { name: 'Chính Xác', val: mt },
    { name: 'Sinh Lực', val: sl }, { name: 'Bạo Kích', val: bk, suffix: '%' },
    { name: 'Khinh Công', val: kc }, { name: 'Chiến Lực', val: cl, hl: true },
  ];
}
const DANH_HIEU = (rank) => rank <= 1 ? { ten: 'Thiên Hạ Đệ Nhất', c: '#fbbf24' } : rank <= 3 ? { ten: 'Tuyệt Thế Cao Thủ', c: '#fb923c' } : rank <= 8 ? { ten: 'Nhất Đại Tông Sư', c: '#e879f9' } : rank <= 14 ? { ten: 'Danh Chấn Giang Hồ', c: '#a78bfa' } : { ten: 'Thành Danh Cao Thủ', c: '#60a5fa' };

function decorate(c, now) {
  const rl = realmOf(c, now), d = DAO[c.dao] || DAO.trung;
  return Object.assign({}, c, {
    daoName: d[0], daoColor: d[1], heName: HE_NAME[c.nguHanh], heColor: HE_COLOR[c.nguHanh],
    realmName: rl.name, realmPct: rl.pct, realmIdx: rl.idx, activityNow: activityOf(c, now),
    face: 'images/danhsi/' + c.id + '.webp',
  });
}

// ---- API ----
export function danhSiList(now) {
  return DANH_SI.map((c) => decorate(c, now)).sort((a, b) => b.rankPower - a.rankPower).map((c, i) => (c.rank = i + 1, c));
}
export function danhSiById(id) { return DANH_SI.find((c) => c.id === id) || null; }
export function danhSiProfile(id, now) {
  const c = danhSiById(id); if (!c) return null;
  const base = decorate(c, now);
  const rels = DANHSI_REL.filter((r) => r.a === id || r.b === id).map((r) => {
    const oid = r.a === id ? r.b : r.a, o = danhSiById(oid);
    return { loai: r.loai, loaiName: REL_NAME[r.loai] || r.loai, loaiColor: REL_COLOR[r.loai] || '#94a3b8', otherId: oid, otherTen: o ? o.ten : oid, otherBh: o ? o.bietHieu : '', text: r.text };
  });
  const rank = danhSiList(now).find((x) => x.id === id);
  const rnk = rank ? rank.rank : 0;
  return Object.assign(base, {
    tamCanh: tamCanhOf(c, now), bienNien: bienNien(c, now), gear: gearOf(c), rels,
    rank: rnk, total: DANH_SI.length, loaiColor: LOAI_COLOR,
    stats: statsOf(c, base.realmIdx), danhHieu: DANH_HIEU(rnk),
  });
}
