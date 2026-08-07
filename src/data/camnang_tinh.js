// ============================================================
// CẨM NANG — MÁY TÍNH MỐC EXP & THỜI GIAN LÊN CẤP.
//
// THUẦN: không đụng state, không đụng DOM. Mọi số suy từ bảng số thật:
//   · đường cong cấp  -> engine/leveling.js  (xpForLevel)
//   · nguyên liệu nghề -> data/skills.js     (actions[].xp / .time / .reqLevel)
//   · quái            -> data/combat.js      (exp / time)
//
// ⚠ Công thức chu kỳ khớp đúng với phần còn lại của trò chơi:
//     chu kỳ thực = thời gian cơ sở ÷ tổng hệ số hiệu suất
//   `eff` ở đây là TỔNG hệ số (1 = không có gì cộng thêm, 1.25 = +25%).
// ============================================================
import { xpForLevel, MAX_LEVEL } from '../engine/leveling.js';
import { SKILLS } from './skills.js';
import { ENEMIES } from './combat.js';
import { LOCATIONS } from './locations.js';

export { MAX_LEVEL };

const tenVung = (id) => (LOCATIONS.find((l) => l.id === id) || {}).name || '—';

/** Bảng mốc: mỗi cấp cần bao nhiêu EXP, và tích luỹ từ cấp 1. */
export function bangMocCap() {
  const ra = [];
  let dồn = 0;
  for (let lv = 1; lv < MAX_LEVEL; lv++) {
    const can = xpForLevel(lv);
    dồn += can;
    ra.push({ lv, len: lv + 1, can, tong: dồn });
  }
  return ra;
}

/** Tổng EXP để đi từ cấp `a` lên cấp `b`. */
export function expGiuaCap(a, b) {
  let s = 0;
  for (let lv = Math.max(1, a); lv < Math.min(MAX_LEVEL, b); lv++) s += xpForLevel(lv);
  return s;
}

/** Tổng EXP tích luỹ để ĐẠT cấp `lv` (từ cấp 1). */
export function expDenCap(lv) { return expGiuaCap(1, lv); }

/**
 * Mọi "việc làm ra EXP" của một nghề, chuẩn hoá về cùng một khuôn.
 * Chiến Đấu không có `actions` nên lấy thẳng từ bảng quái.
 */
export function viecCua(ngheId) {
  if (ngheId === 'chienDau') {
    // SU KIEN: quai su kien khong vao may tinh (chi co mat 14 ngay/nam)
    return Object.values(ENEMIES).filter((e) => !e.suKien).map((e) => ({
      id: e.id, ten: e.name, exp: e.exp, giay: e.time, reqLevel: e.reqLevel,
      vung: (LOCATIONS.filter((l) => (l.enemies || []).includes(e.id))[0] || {}).name || '—',
    }));
  }
  const s = SKILLS[ngheId];
  if (!s || !s.actions) return [];
  return s.actions.map((a) => ({
    id: a.id, ten: a.name, exp: a.xp, giay: a.time, reqLevel: a.reqLevel, vung: tenVung(a.zone),
  }));
}

/** Danh sách nghề dùng được cho máy tính (10 nghề + Chiến Đấu). */
export function dsNghe() {
  // SU KIEN: ki nang su kien khong vao may tinh EXP — chi mo 14 ngay/nam, bang so rieng.
  const ra = Object.values(SKILLS).filter((s) => !s.suKien).map((s) => ({ id: s.id, ten: s.name }));
  ra.unshift({ id: 'chienDau', ten: 'Chiến Đấu' });
  return ra;
}

/** Tốc độ của một việc ở hệ số hiệu suất `eff`. */
export function tocDo(v, eff) {
  const e = Math.max(0.01, eff || 1);
  const giay = v.giay / e;
  return { giay, expGio: (v.exp / giay) * 3600, luotGio: 3600 / giay };
}

/**
 * Cắm mặt vào ĐÚNG MỘT việc thì bao lâu đi từ cấp `tu` lên cấp `den`.
 * Trả null nếu việc chưa mở ở cấp bắt đầu (không tự bịa ra đường tắt).
 */
export function gioMotViec(v, tu, den, eff) {
  if (den <= tu) return { gio: 0, luot: 0, exp: 0, khoa: false };
  const exp = expGiuaCap(tu, den);
  const t = tocDo(v, eff);
  return {
    exp, luot: Math.ceil(exp / v.exp), gio: (exp / v.exp) * t.giay / 3600,
    khoa: v.reqLevel > tu,
  };
}

/**
 * ĐƯỜNG NHANH NHẤT: mỗi cấp chọn việc cho nhiều EXP mỗi giờ nhất trong số
 * việc đã mở khoá ở cấp đó. Đây là con số đáng tin để trả lời "bao lâu lên 100",
 * vì người chơi thật vẫn đổi nguyên liệu khi lên cấp.
 */
export function duongNhanhNhat(ngheId, tu, den, eff) {
  const ds = viecCua(ngheId);
  if (!ds.length) return { gio: 0, chang: [] };
  let gio = 0;
  const chang = [];
  for (let lv = Math.max(1, tu); lv < Math.min(MAX_LEVEL, den); lv++) {
    const mo = ds.filter((v) => v.reqLevel <= lv);
    if (!mo.length) continue;
    let tot = mo[0], totGio = Infinity;
    for (const v of mo) {
      const g = xpForLevel(lv) / v.exp * tocDo(v, eff).giay;
      if (g < totGio) { totGio = g; tot = v; }
    }
    gio += totGio / 3600;
    const cuoi = chang[chang.length - 1];
    if (cuoi && cuoi.viecId === tot.id) { cuoi.denLv = lv + 1; cuoi.gio += totGio / 3600; }
    else chang.push({ viecId: tot.id, ten: tot.ten, tuLv: lv, denLv: lv + 1, gio: totGio / 3600 });
  }
  return { gio, chang };
}

/** Bảng so sánh: cùng một nghề, mỗi nguyên liệu mất bao lâu lên tới `den`. */
export function soSanhViec(ngheId, den, eff) {
  const ds = viecCua(ngheId);
  return ds.map((v) => {
    const t = tocDo(v, eff);
    const r = gioMotViec(v, v.reqLevel, den, eff);
    return {
      ...v, giayThuc: t.giay, expGio: t.expGio, luotGio: t.luotGio,
      gioTuMoKhoa: r.gio, luot: r.luot, expCan: r.exp,
    };
  });
}
