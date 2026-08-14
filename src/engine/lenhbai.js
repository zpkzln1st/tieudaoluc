// ============================================================
// ENGINE — LENH BAI: suy trang thai SU KIEN tu moc thoi gian. THUAN (chay duoc ca tren may chu).
//
// ⚠⚠ NGUYEN TAC GOC: bang `su_kien` tren Supabase ghi MOC THOI GIAN, khong ghi cong tac bat/tat.
//    Client doc bang mot lan roi DEM hai cai moc vao save. Tu do tro di, mat mang van tu suy ra
//    duoc su kien con hay het, vi moc la thoi gian tuyet doi.
//    Neu bang ghi cong tac thi: coi la dong -> nguoi dang cay mat sach giua chung khi rot mang;
//    coi la mo -> su kien khong bao gio dong duoc voi nguoi ngoai tuyen.
//
// ⚠ File nay KHONG import cloud.js. Doc mang la viec cua tang tren; o day chi co phep tinh.
// ============================================================

// Sau ma su kien. Phai khop cot `ma` cua bang su_kien va khop data su kien sau nay.
export const SU_KIEN_MA = ['tet', 'xuan', 'doanNgo', 'vuLan', 'trungThu', 'giangSinh'];

export function ensureLenhBai(state) {
  if (!state.suKien || typeof state.suKien !== 'object') state.suKien = {};
  const s = state.suKien;
  if (!s.dem || typeof s.dem !== 'object') s.dem = {};   // ma -> { mo, dong, chiTacGia, ten }
  if (typeof s.docLuc !== 'number') s.docLuc = 0;        // lan doc bang gan nhat
  if (!Array.isArray(s.quaDaNhan)) s.quaDaNhan = [];     // id qua da nhan, chan nhan lai khi doc lai
  if (!Array.isArray(s.caoThiDaXem)) s.caoThiDaXem = []; // id cao thi da bay, chan bay lai moi nhip doc
  return s;
}

const soMoc = (v) => {
  if (v == null) return 0;
  const t = typeof v === 'number' ? v : Date.parse(v);
  return Number.isFinite(t) ? t : 0;
};

/**
 * Nhan cac dong doc tu bang `su_kien` roi dem vao save.
 * `rows` = [{ ma, ten, mo_luc, dong_luc, chi_tac_gia }]. Goi duoc nhieu lan.
 * ⚠ Dong nao KHONG co trong `rows` thi GO khoi dem — tac gia xoa lich thi client phai theo.
 */
export function demSuKien(state, rows, now) {
  const s = ensureLenhBai(state);
  const moi = {};
  for (const r of rows || []) {
    if (!r || !r.ma) continue;
    moi[r.ma] = {
      ten: r.ten || '',
      mo: soMoc(r.mo_luc),
      dong: soMoc(r.dong_luc),
      chiTacGia: !!r.chi_tac_gia,
      cauHinh: (r.cau_hinh && typeof r.cau_hinh === 'object') ? r.cau_hinh : {},
    };
  }
  s.dem = moi;
  s.docLuc = now || 0;
  return s.dem;
}

/**
 * Su kien `ma` co dang mo voi NGUOI NAY khong.
 * `laTacGia` de co `chi_tac_gia` chi mo cho tac gia — dung de chay thu truoc khi mo cho ca lang.
 * ⚠ Thieu moc (mo=0 hoac dong=0) la CHUA DAT LICH -> coi nhu dong. Dong mac dinh cua bang
 *   khong co moc nao, nen khong the vo tinh mo.
 */
export function suKienDangMo(state, ma, now, laTacGia) {
  const s = ensureLenhBai(state);
  const d = s.dem[ma];
  if (!d) return false;
  if (!d.mo || !d.dong) return false;
  if (d.chiTacGia && !laTacGia) return false;
  return now >= d.mo && now < d.dong;
}

/** Ma su kien dang mo, hoac null. Mo trung nhau thi lay cai DONG SOM NHAT (sap het truoc). */
export function suKienHienHanh(state, now, laTacGia) {
  const s = ensureLenhBai(state);
  let ra = null;
  for (const ma of SU_KIEN_MA) {
    if (!suKienDangMo(state, ma, now, laTacGia)) continue;
    if (!ra || s.dem[ma].dong < s.dem[ra].dong) ra = ma;
  }
  return ra;
}

/** Con bao nhieu mili giay nua thi dong. 0 neu khong mo. */
export function suKienConLai(state, ma, now, laTacGia) {
  if (!suKienDangMo(state, ma, now, laTacGia)) return 0;
  return Math.max(0, ensureLenhBai(state).dem[ma].dong - now);
}

/**
 * Sap mo trong bao lau — de bao truoc cho nguoi choi.
 * Tra { ma, con } cua su kien sap mo GAN NHAT, hoac null.
 */
export function suKienSapMo(state, now, laTacGia) {
  const s = ensureLenhBai(state);
  let ra = null;
  for (const ma of SU_KIEN_MA) {
    const d = s.dem[ma];
    if (!d || !d.mo || !d.dong) continue;
    if (d.chiTacGia && !laTacGia) continue;
    if (now >= d.mo) continue;
    if (!ra || d.mo < s.dem[ra].mo) ra = ma;
  }
  return ra ? { ma: ra, con: s.dem[ra].mo - now } : null;
}

/** Co doi luat toan coi cua su kien dang mo (vd nhan Bac). Khong mo thi tra {}. */
export function suKienCauHinh(state, now, laTacGia) {
  const ma = suKienHienHanh(state, now, laTacGia);
  if (!ma) return {};
  const d = ensureLenhBai(state).dem[ma];
  return (d && d.cauHinh) || {};
}

// ============================================================
// HOP QUA
// ============================================================
/**
 * Da nhan mon qua nay chua. Chan nhan hai lan phia client cho do goi mang thua;
 * ⚠ HANG RAO THAT nam o ham `nhan_qua_tang` phia may chu (no doi `nhan_luc is null`).
 */
export function quaDaNhan(state, id) {
  return ensureLenhBai(state).quaDaNhan.indexOf(id) >= 0;
}
const QUA_NHO_TOI_DA = 200;   // giu 200 id gan nhat, du chan nhan lai ma save khong phinh
export function ghiQuaDaNhan(state, id) {
  const s = ensureLenhBai(state);
  if (s.quaDaNhan.indexOf(id) >= 0) return;
  s.quaDaNhan.push(id);
  if (s.quaDaNhan.length > QUA_NHO_TOI_DA) s.quaDaNhan.splice(0, s.quaDaNhan.length - QUA_NHO_TOI_DA);
}

// ---- CAO THI: da bay cho nguoi choi xem chua ----
// ⚠ Nhip doc chay 10 phut mot lan. Khong nho id da bay thi cu 10 phut mot cai chuong lai keu
//   voi CUNG mot cao thi, suot ca doi cao thi do.
export function caoThiDaXem(state, id) {
  return ensureLenhBai(state).caoThiDaXem.indexOf(id) >= 0;
}
export function ghiCaoThiDaXem(state, id) {
  const s = ensureLenhBai(state);
  if (s.caoThiDaXem.indexOf(id) >= 0) return;
  s.caoThiDaXem.push(id);
  if (s.caoThiDaXem.length > QUA_NHO_TOI_DA) s.caoThiDaXem.splice(0, s.caoThiDaXem.length - QUA_NHO_TOI_DA);
}
