// ============================================================
// ENGINE — SỰ KIỆN: Điểm, phụ kiện, quầy đổi thưởng, dọn dẹp khi đóng. THUẦN.
// Mốc mở/đóng đọc từ state.suKien.dem (engine/lenhbai.js đệm từ bảng su_kien trên Supabase).
//
// ⚠ Cờ tác giả: engine không biết ai đang đăng nhập. Store PHẢI gọi datCoTacGia() khi xác thực
//   xong — cờ nằm trong save nhưng chỉ là tấm gương của phiên, nạp lại là store đặt lại.
//   Nó CHỈ quyết định việc THẤY sự kiện đang chạy thử (chi_tac_gia); hàng rào thật vẫn là RLS.
// ============================================================
import { SU_KIEN_BY_MA, SK_BAC, PHU_KIEN_EFF, PHU_KIEN_EXP, QUAY_GIA, QUAY_TIEU_HAO } from '../data/sukien.js';
import { SKILLS } from '../data/skills.js';
import { ITEMS } from '../data/items.js';
import { LOCATIONS } from '../data/locations.js';
import { addItem, removeItem } from './inventory.js';
import { ensureLenhBai, suKienDangMo, suKienHienHanh } from './lenhbai.js';

export function ensureSuKien(state) {
  const s = ensureLenhBai(state);
  if (typeof s.diem !== 'number' || !isFinite(s.diem)) s.diem = 0;
  if (!s.phuKien || typeof s.phuKien !== 'object') s.phuKien = {};   // ma -> {boiSo,boiThuong,anSo,anThuong}
  if (!s.daMua || typeof s.daMua !== 'object') s.daMua = {};         // khoá giới hạn mua
  return s;
}
export function datCoTacGia(state, la) { ensureSuKien(state)._tg = !!la; }
export function laTacGiaSK(state) { return !!(state.suKien && state.suKien._tg); }

// ---- Trạng thái mở/đóng (đường dùng chung cho engine — store có isAuthorAccount riêng) ----
export function skMo(state, ma, now) { return suKienDangMo(state, ma, now, laTacGiaSK(state)); }
export function skHienHanh(state, now) { return suKienHienHanh(state, now, laTacGiaSK(state)); }
/** Mốc ĐÓNG của sự kiện (0 nếu chưa đặt lịch) — advance() dùng để chặn cày quá giờ. */
export function skMocDong(state, ma) {
  const d = state.suKien && state.suKien.dem && state.suKien.dem[ma];
  return (d && d.dong) || 0;
}

// ---- Phụ kiện: Bội (+hiệu suất) · Ấn (+EXP). Mở là GIỮ trong đợt; chỉ tác dụng trong sự kiện đó. ----
export function phuKienCua(state, ma) { return ensureSuKien(state).phuKien[ma] || {}; }
/** Mở phụ kiện (thắng Yêu Vương / thông quan Bí Cảnh lần đầu). Trả tên khoá vừa mở, null nếu đã có. */
export function moPhuKien(state, ma, loai, bac) {
  const s = ensureSuKien(state);
  const khoa = loai + (bac === 'so' ? 'So' : 'Thuong');   // boiSo · boiThuong · anSo · anThuong
  if (!s.phuKien[ma]) s.phuKien[ma] = {};
  if (s.phuKien[ma][khoa]) return null;
  s.phuKien[ma][khoa] = true;
  return khoa;
}
/** +hiệu suất kĩ năng sự kiện (0 · 0.15 · 0.30) — bản Thượng ĐÈ bản Sơ, không cộng dồn. */
export function skEffBonus(state, skillId) {
  const sk = SKILLS[skillId];
  if (!sk || !sk.suKien) return 0;
  const pk = phuKienCua(state, sk.suKien);
  return pk.boiThuong ? PHU_KIEN_EFF.boiThuong : (pk.boiSo ? PHU_KIEN_EFF.boiSo : 0);
}
/** +EXP kĩ năng sự kiện (0 · 0.20 · 0.40) — bản Thượng ĐÈ bản Sơ. */
export function skExpBonus(state, skillId) {
  const sk = SKILLS[skillId];
  if (!sk || !sk.suKien) return 0;
  const pk = phuKienCua(state, sk.suKien);
  return pk.anThuong ? PHU_KIEN_EXP.anThuong : (pk.anSo ? PHU_KIEN_EXP.anSo : 0);
}

// ---- Điểm Sự Kiện ----
export function congDiem(state, n) {
  const s = ensureSuKien(state);
  s.diem += Math.max(0, Math.floor(n) || 0);
  return s.diem;
}
/**
 * Đổi vật phẩm sự kiện lấy Điểm — theo BÓ 10, phần lẻ dưới 10 giữ lại trong túi.
 * Chỉ đổi được khi sự kiện của vật phẩm ĐANG MỞ (đóng rồi thì vật phẩm sắp bốc hơi, điểm thì không).
 */
export function doiVatPham(state, itemId, now) {
  const it = ITEMS[itemId];
  if (!it || !it.suKien || !it.skBac) return { ok: false, msg: 'Không phải vật phẩm sự kiện.' };
  if (!skMo(state, it.suKien, now)) return { ok: false, msg: 'Sự kiện đã đóng.' };
  const co = state.inventory[itemId] || 0;
  const bo = Math.floor(co / 10);
  if (bo < 1) return { ok: false, msg: 'Cần đủ 10 cái mới đổi được một bó.' };
  removeItem(state, itemId, bo * 10);
  const diem = bo * SK_BAC[it.skBac - 1].diem10;
  congDiem(state, diem);
  return { ok: true, diem, soVat: bo * 10 };
}

// ---- Quầy đổi thưởng ----
/** Khoá giới hạn theo ĐỢT: cùng sự kiện mở lại năm sau (mốc mở khác) là mua lại được. */
function khoaDot(state, ma, loai) {
  const d = state.suKien.dem[ma];
  return ma + ':' + ((d && d.mo) || 0) + ':' + loai;
}
export function daMuaTrongDot(state, ma, loai) { return !!ensureSuKien(state).daMua[khoaDot(state, ma, loai)]; }

/**
 * Mua ở gian Trân Phẩm. loai: 'trung' (1 lần mỗi đợt) · 'danhHieu'/'avatar:<id>'/'cover:<id>' (vĩnh viễn).
 * Trả { ok, msg }. Store tự lo phần chạm vào titles/ownedAvatars (không thuộc engine thuần).
 */
export function muaTranPham(state, ma, loai, now) {
  const s = ensureSuKien(state);
  const sk = SU_KIEN_BY_MA[ma];
  if (!sk || !skMo(state, ma, now)) return { ok: false, msg: 'Sự kiện đã đóng.' };
  const goc = loai.split(':')[0];
  const gia = QUAY_GIA[goc];
  if (!gia) return { ok: false, msg: 'Không có món này.' };
  if (daMuaTrongDot(state, ma, loai)) return { ok: false, msg: 'Đợt này đã mua rồi.' };
  if (s.diem < gia) return { ok: false, msg: 'Không đủ Điểm Sự Kiện.' };
  s.diem -= gia;
  s.daMua[khoaDot(state, ma, loai)] = true;
  if (goc === 'trung') addItem(state, 'egg_' + sk.pet.base + '_linh', 1);
  return { ok: true, gia };
}

/** Mua ở bốn gian tiêu hao (không giới hạn). idx = [gian, món]. */
export function muaTieuHao(state, ma, gianIdx, monIdx, now) {
  const s = ensureSuKien(state);
  const sk = SU_KIEN_BY_MA[ma];
  if (!sk || !skMo(state, ma, now)) return { ok: false, msg: 'Sự kiện đã đóng.' };
  const gian = QUAY_TIEU_HAO[gianIdx];
  const mon = gian && gian.ds[monIdx];
  if (!mon) return { ok: false, msg: 'Không có món này.' };
  if (s.diem < mon.diem) return { ok: false, msg: 'Không đủ Điểm Sự Kiện.' };
  s.diem -= mon.diem;
  if (mon.tienTe) state.currencies[mon.tienTe] = (state.currencies[mon.tienTe] || 0) + mon.qty;
  else addItem(state, mon.monAnSuKien ? sk.monAn.id : mon.itemId, mon.qty);
  return { ok: true, ten: mon.tienTe ? mon.tienTe : (mon.monAnSuKien ? sk.monAn.name : (ITEMS[mon.itemId] || {}).name), qty: mon.qty };
}

// ============================================================
// DỌN DẸP khi sự kiện đóng — gọi lúc nạp game và mỗi lần đệm lại lịch.
//   · Vật phẩm sự kiện (cờ suKien) BỐC HƠI. Trứng + món ăn + Điểm thì GIỮ.
//   · Hoạt động đang cày kĩ năng sự kiện -> dừng.
//   · Người đứng trong bản đồ sự kiện -> đưa về vùng đầu tiên.
//   · Yêu Vương sự kiện đang trong hàng đợi -> gỡ khỏi hàng đợi.
// Trả danh sách việc đã làm để store báo MỘT lần, không im lặng nuốt đồ của người ta.
// ============================================================
export function donSuKien(state, now) {
  ensureSuKien(state);
  const daLam = [];
  const dongMa = Object.keys(SU_KIEN_BY_MA).filter((ma) => !skMo(state, ma, now));
  if (!dongMa.length) return daLam;
  const dongSet = new Set(dongMa);

  // Vật phẩm bốc hơi
  for (const id of Object.keys(state.inventory || {})) {
    const it = ITEMS[id];
    if (it && it.suKien && dongSet.has(it.suKien) && state.inventory[id] > 0) {
      daLam.push({ viec: 'vatPham', ten: it.name, so: state.inventory[id] });
      delete state.inventory[id];
    }
  }
  // Dừng hoạt động kĩ năng sự kiện
  const act = state.activity;
  if (act && act.type === 'skill') {
    const sk = SKILLS[act.skillId];
    if (sk && sk.suKien && dongSet.has(sk.suKien)) { state.activity = null; daLam.push({ viec: 'hoatDong', ten: sk.name }); }
  }
  // Đưa người chơi ra khỏi bản đồ đã đóng
  const loc = LOCATIONS.find((l) => l.id === (state.player && state.player.location));
  if (loc && loc.suKien && dongSet.has(loc.suKien)) {
    state.player.location = LOCATIONS[0].id;
    daLam.push({ viec: 'veLang', ten: loc.name });
  }
  // Gỡ Yêu Vương sự kiện khỏi hàng đợi
  const queue = state.boss && state.boss.queue;
  if (queue) {
    for (const ma of dongMa) {
      for (const b of (SU_KIEN_BY_MA[ma].boss || [])) {
        if (queue[b.id]) { queue[b.id] = false; daLam.push({ viec: 'hangDoi', ten: b.name }); }
      }
    }
  }
  return daLam;
}
