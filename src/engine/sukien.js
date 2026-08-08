// ============================================================
// ENGINE — SỰ KIỆN: Điểm, phụ kiện, quầy đổi thưởng, dọn dẹp khi đóng. THUẦN.
// Mốc mở/đóng đọc từ state.suKien.dem (engine/lenhbai.js đệm từ bảng su_kien trên Supabase).
//
// ⚠ Cờ tác giả: engine không biết ai đang đăng nhập. Store PHẢI gọi datCoTacGia() khi xác thực
//   xong — cờ nằm trong save nhưng chỉ là tấm gương của phiên, nạp lại là store đặt lại.
//   Nó CHỈ quyết định việc THẤY sự kiện đang chạy thử (chi_tac_gia); hàng rào thật vẫn là RLS.
// ============================================================
import { SU_KIEN_BY_MA, SK_BAC, PHU_KIEN_EFF, PHU_KIEN_EXP, QUAY_GIA, QUAY_TIEU_HAO, artPhuKien } from '../data/sukien.js';
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
// ⛔ `phuKienCua` / `moPhuKien` (cờ trong save) ĐÃ GỠ 2026-08-08 — phụ kiện nay là VẬT PHẨM
//    trong gearBag. Cờ cũ được main.js đổi sang vật phẩm một lần rồi xoá (xem migration).
/**
 * Món phụ kiện ĐANG ĐEO ở một ô, NẾU nó thuộc đúng sự kiện đang hỏi.
 * ⚠⚠ Phải soi cả `suKien` của món: người chơi giữ Bội của Trung Thu qua tới Tết, đeo nguyên đó
 *   mà không kiểm thì Bội Trung Thu cộng hiệu suất cho Thái Phúc — sai luật "chỉ hiệu lực trong
 *   bản đồ sự kiện của nó".
 */
function pkDeo(state, ma, slot) {
  const inst = state.equipment && state.equipment[slot];
  if (!inst) return null;
  const base = ITEMS[inst.gearId];
  if (!base || base.type !== 'skPhuKien' || base.suKien !== ma) return null;
  return base;
}
/** +hiệu suất kĩ năng sự kiện (0 · 0.15 · 0.30) — theo món Bội ĐANG ĐEO. */
export function skEffBonus(state, skillId) {
  const sk = SKILLS[skillId];
  if (!sk || !sk.suKien) return 0;
  const b = pkDeo(state, sk.suKien, 'skBoi');
  return b ? (PHU_KIEN_EFF['boi' + (b.pkBac === 'thuong' ? 'Thuong' : 'So')] || 0) : 0;
}
/** +EXP kĩ năng sự kiện (0 · 0.20 · 0.40) — theo món Ấn ĐANG ĐEO. */
export function skExpBonus(state, skillId) {
  const sk = SKILLS[skillId];
  if (!sk || !sk.suKien) return 0;
  const a = pkDeo(state, sk.suKien, 'skAn');
  return a ? (PHU_KIEN_EXP['an' + (a.pkBac === 'thuong' ? 'Thuong' : 'So')] || 0) : 0;
}
/** Bậc đang đeo của một ô ('so' | 'thuong' | null) — cho UI, không dùng để tính số. */
export function pkBacDeo(state, ma, loai) {
  const b = pkDeo(state, ma, loai === 'boi' ? 'skBoi' : 'skAn');
  return b ? b.pkBac : null;
}
/** Có món phụ kiện này trong túi hoặc đang đeo chưa? Dùng để KHỎI thả trùng món đã có. */
export function coPhuKien(state, id) {
  if (Array.isArray(state.gearBag) && state.gearBag.some((g) => g && g.gearId === id)) return true;
  const eq = state.equipment || {};
  for (const s in eq) if (eq[s] && eq[s].gearId === id) return true;
  return false;
}
/**
 * Thả một phụ kiện vào túi gear. Trả id nếu thả thật, null nếu đã có món đó rồi.
 * ⚠ CHẶN TRÙNG: đeo được một món mỗi ô, có hai cái y hệt chỉ tổ chật túi mà không bán được
 *   (value 0). Người chơi trúng lần hai thì coi như trượt, KHÔNG báo gì.
 * ⚠ uid bốc từ `rnd` có hạt giống — máy chủ tính lại được (đợt D). Đừng dùng Date.now().
 */
export function thaPhuKien(state, ma, loai, bac, rnd) {
  const id = artPhuKien(ma, loai, bac);
  const base = ITEMS[id];
  if (!base || coPhuKien(state, id)) return null;
  if (!Array.isArray(state.gearBag)) state.gearBag = [];
  const r = typeof rnd === 'function' ? rnd : Math.random;
  state.gearBag.push({
    uid: 'g' + Math.floor(r() * 2176782336).toString(36) + '_' + Math.floor(r() * 46656).toString(36),
    gearId: id, itemLv: 1, quality: base.quality, reqLevel: 1, stats: {}, he: null, eleDmg: 0, plus: 0,
  });
  return id;
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

  // Vật phẩm bốc hơi — TRỪ những món khai `khongBocHoi` (trứng, món ăn, phụ kiện 0,5%).
  // Phụ kiện vốn nằm trong gearBag nên vòng này không đụng tới; cờ ở đây là hàng rào thứ hai,
  // phòng khi sau này có đường nào nhét chúng vào inventory.
  for (const id of Object.keys(state.inventory || {})) {
    const it = ITEMS[id];
    if (it && it.khongBocHoi) continue;
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
