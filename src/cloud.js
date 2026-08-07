// ============================================================
// CLOUD — Supabase client + Auth (Giai doan B).
// Game van OFFLINE-FIRST: SDK nap LAZY qua CDN ESM khi can dung dau tien;
// neu mat mang / CDN loi thi caller try/catch nuot -> game KHONG vo, chi mat tinh nang cloud.
// ============================================================
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './cloud-config.js';

const SDK_URL = 'https://esm.sh/@supabase/supabase-js@2';
let _sb = null;   // client (tao 1 lan, tai su dung)

// Tao/lay client — nap SDK lazy. Throw neu nap that bai (caller xu ly).
export async function getClient() {
  if (_sb) return _sb;
  const { createClient } = await import(SDK_URL);
  _sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,        // luu phien o localStorage -> reload van dang nhap
      autoRefreshToken: true,
      storageKey: 'tieudao_auth',  // tach khoi key save game
    },
  });
  return _sb;
}

// ---- Auth (email + mat khau) ----
export async function cloudSignUp(email, password) {
  const sb = await getClient();
  return sb.auth.signUp({ email, password });            // { data, error }
}
export async function cloudSignIn(email, password) {
  const sb = await getClient();
  return sb.auth.signInWithPassword({ email, password }); // { data, error }
}
export async function cloudSignOut() {
  const sb = await getClient();
  return sb.auth.signOut();
}
// Lay user cua phien hien tai (null neu chua dang nhap). Dung luc khoi dong.
export async function cloudGetUser() {
  const sb = await getClient();
  const { data } = await sb.auth.getSession();
  return data?.session?.user || null;
}
// Lang nghe doi trang thai (dang nhap / dang xuat / refresh token).
export async function cloudOnAuth(cb) {
  const sb = await getClient();
  return sb.auth.onAuthStateChange((_event, session) => cb(session?.user || null));
}

// ---- Cloud save (bang 'saves', RLS: moi user chi dong cua minh) ----
async function _uid() {
  const sb = await getClient();
  const { data } = await sb.auth.getSession();   // local, khong goi mang
  return (data && data.session && data.session.user && data.session.user.id) || null;
}
// Doc save cua chinh minh. Tra { ok, row } ; row=null neu chua co; ok=false neu loi/chua dang nhap.
export async function cloudLoadSave() {
  const sb = await getClient();
  const uid = await _uid();
  if (!uid) return { ok: false, reason: 'no-auth' };
  const { data, error } = await sb.from('saves').select('data,last_save,updated_at').eq('user_id', uid).maybeSingle();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, row: data };   // data = null neu chua co dong
}
// Day (upsert) save len cloud. Tra { ok, reason }.
// ⚠⚠ XIN TRA VE DONG (`.select`) LA CO Y, dung bo di. Chot chong gian lan (docs/SQL_CHONG_GIAN_LAN.sql)
//   tu choi mot ban luu bang cach tra `null` trong trigger BEFORE UPDATE. Postgres bo qua lenh ghi de
//   ma KHONG bao loi — khong xin dong tra ve thi day la mot ca "thanh cong" gia, save ngung dong bo
//   vinh vien ma nguoi choi khong bao gio biet.
//   (Chot khong dung `raise exception` vi loi se cuon nguoc ca dong so nghi van vua ghi.)
export async function cloudPushSave(state) {
  const sb = await getClient();
  const uid = await _uid();
  if (!uid) return { ok: false, reason: 'no-auth' };
  const moc = state.lastSave || 0;
  const { data, error } = await sb.from('saves').upsert(
    { user_id: uid, data: state, last_save: moc, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  ).select('last_save');
  if (error) return { ok: false, reason: error.message };
  if (data && data.length) return { ok: true };
  // ⚠⚠ KHONG bao "bi tu choi" ngay. Bao oan o day la CA LANG mat dong bo: rong co the do
  //   PostgREST/RLS khong tra dong ve chu chua chac chot da chan. Doc lai mot lan cho chac —
  //   chi ton them mot luot goi trong dung truong hop hiem nay.
  try {
    const lai = await cloudLoadSave();
    if (lai.ok && lai.row && (lai.row.last_save || 0) >= moc) return { ok: true };
  } catch (e) { return { ok: false, reason: 'khong doc lai duoc' }; }
  return { ok: false, reason: 'tu-choi' };
}

// ============================================================
// HO SO CONG KHAI (dot A2) — bang `ho_so_cong_khai`, KHONG phai bang `saves`.
// Bang nay AI CUNG DOC DUOC (do la ca muc dich cua viec khoe); chi chu moi ghi duoc dong minh.
// Luat that nam o RLS phia Supabase — xem docs/SQL_HO_SO_CONG_KHAI.sql.
// ⚠ Chua chay tep SQL do thi moi ham duoi day tra loi "khong tim thay bang"; game van chay
//   binh thuong vi caller nuot loi. Thieu bang KHONG duoc lam vo duong luu save.
// ============================================================

/** Day ho so cua CHINH MINH len. `hoSo` la ban CHUP (khong phai tham chieu vao save). */
export async function cloudPushHoSo(hoSo) {
  const sb = await getClient();
  const uid = await _uid();
  if (!uid) return { ok: false, reason: 'no-auth' };
  const { error } = await sb.from('ho_so_cong_khai').upsert(
    { user_id: uid, ...hoSo, cap_nhat: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

/** Doc ho so cong khai cua MOT NGUOI theo ma tai khoan. Khong can dang nhap. */
export async function cloudLoadHoSo(uid) {
  if (!uid) return { ok: false, reason: 'no-uid' };
  const sb = await getClient();
  const { data, error } = await sb.from('ho_so_cong_khai')
    .select('user_id,ten,tong_cap,chien_dau,chien_luc,avatar,danh_hieu,trung_bay,cap_nhat')
    .eq('user_id', uid).maybeSingle();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, row: data };            // row = null neu nguoi do chua khoe gi
}

/**
 * Danh sach NGUOI CHOI THAT de ghep vao Phong Van Bang.
 * KHONG lay cot `trung_bay` (nang nhat, ma bang xep hang khong ve toi) — bam vao mot nguoi thi
 * `cloudLoadHoSo` moi doc trong ho so. Khong can dang nhap.
 */
export async function cloudLoadBangNguoiThat(gioiHan) {
  const sb = await getClient();
  const { data, error } = await sb.from('ho_so_cong_khai')
    .select('user_id,ten,tong_cap,chien_dau,chien_luc,avatar,danh_hieu,cap_nhat')
    .order('tong_cap', { ascending: false })
    .limit(Math.max(1, Math.min(500, gioiHan || 200)));
  if (error) return { ok: false, reason: error.message };
  return { ok: true, rows: data || [] };
}

/** Ma tai khoan cua chinh minh — de dung duong dan khoe. */
export async function cloudMyUid() { return _uid(); }

// ============================================================
// GIAM SAT (dot C) — chi tai khoan TAC GIA doc duoc.
// ⚠ Hang rao la RLS phia Supabase (xem docs/SQL_GIAM_SAT.sql), KHONG phai `isAuthorAccount`
//   trong game. Getter do chi de an/hien giao dien; ai sua ma client cung bat duoc panel,
//   nhung khong co token dung uid thi may ham duoi day tra ve RONG.
// ============================================================

/** Gom so nghi van theo tai khoan — mot dong moi nguoi, khong keo ca so ve may. */
export async function cloudNghiVanGom(gioiHan) {
  const sb = await getClient();
  const { data, error } = await sb.from('nghi_van_gom')
    .select('user_id,so_dong,gan_nhat,gap_nhat,la_tac_gia,so_lan_chan')
    .order('gan_nhat', { ascending: false })
    .limit(Math.max(1, Math.min(200, gioiHan || 50)));
  if (error) return { ok: false, reason: error.message };
  return { ok: true, rows: data || [] };
}

/** Cac dong nghi van cua MOT tai khoan. */
export async function cloudNghiVanCua(uid, gioiHan) {
  if (!uid) return { ok: false, reason: 'no-uid' };
  const sb = await getClient();
  const { data, error } = await sb.from('nghi_van')
    .select('id,luc,giay,chi_tiet,da_chan')
    .eq('user_id', uid).order('luc', { ascending: false })
    .limit(Math.max(1, Math.min(100, gioiHan || 20)));
  if (error) return { ok: false, reason: error.message };
  return { ok: true, rows: data || [] };
}

// ---- MIEN TRU: cua thoat hiem cho nguoi bi chan oan (chi tac gia sua duoc — RLS) ----
export async function cloudMienTruDs() {
  const sb = await getClient();
  const { data, error } = await sb.from('mien_tru').select('user_id,ly_do,luc');
  if (error) return { ok: false, reason: error.message };
  return { ok: true, rows: data || [] };
}
export async function cloudMienTruThem(uid, lyDo) {
  if (!uid) return { ok: false, reason: 'no-uid' };
  const sb = await getClient();
  const { error } = await sb.from('mien_tru').upsert({ user_id: uid, ly_do: lyDo || '' }, { onConflict: 'user_id' });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
export async function cloudMienTruBo(uid) {
  if (!uid) return { ok: false, reason: 'no-uid' };
  const sb = await getClient();
  const { error } = await sb.from('mien_tru').delete().eq('user_id', uid);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

// ============================================================
// LENH BAI — bang `su_kien`, `qua_tang`, `khoa_tai_khoan` (xem docs/SQL_LENH_BAI.sql).
// ⚠ Chua chay tep SQL do thi moi ham duoi day tra loi "khong tim thay bang". Caller PHAI nuot loi:
//   thieu bang chi duoc lam mat tinh nang su kien, KHONG duoc lam vo duong luu save.
// ⚠ Hang rao la RLS phia Supabase, KHONG phai man Lenh Bai trong game.
// ============================================================

/** Doc lich sau su kien. KHONG can dang nhap — ai cung phai biet su kien nao dang mo. */
export async function cloudSuKienDs() {
  const sb = await getClient();
  const { data, error } = await sb.from('su_kien')
    .select('ma,ten,mo_luc,dong_luc,chi_tac_gia,cau_hinh');
  if (error) return { ok: false, reason: error.message };
  return { ok: true, rows: data || [] };
}

/** Dat lich mot su kien. Chi tac gia ghi duoc (RLS chan, khong phai giao dien chan). */
export async function cloudSuKienDat(ma, moLuc, dongLuc, chiTacGia, cauHinh) {
  if (!ma) return { ok: false, reason: 'no-ma' };
  const sb = await getClient();
  const { error } = await sb.from('su_kien').update({
    mo_luc: moLuc ? new Date(moLuc).toISOString() : null,
    dong_luc: dongLuc ? new Date(dongLuc).toISOString() : null,
    chi_tac_gia: !!chiTacGia,
    cau_hinh: cauHinh || {},
    cap_nhat: new Date().toISOString(),
  }).eq('ma', ma);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

// ---- HOP QUA ----
/** Qua CHUA NHAN cua chinh minh. */
export async function cloudQuaChoNhan() {
  const sb = await getClient();
  const uid = await _uid();
  if (!uid) return { ok: false, reason: 'no-auth' };
  const { data, error } = await sb.from('qua_tang')
    .select('id,noi_dung,loi_nhan,tao_luc')
    .eq('user_id', uid).is('nhan_luc', null)
    .order('tao_luc', { ascending: true }).limit(50);
  if (error) return { ok: false, reason: error.message };
  return { ok: true, rows: data || [] };
}

/**
 * Nhan mot mon qua. Goi HAM tren may chu chu KHONG update thang.
 * ⚠⚠ Bang `qua_tang` co y KHONG cap quyen update cho ai: cho chu dong tu update thi ho set nguoc
 *   `nhan_luc` ve null duoc, tuc nhan mot mon qua vo han lan. Ham `nhan_qua_tang` danh dau va tra
 *   noi dung trong DUNG MOT lenh, goi lan hai tra null.
 * Tra { ok, noiDung } — noiDung null nghia la khong con gi de nhan.
 */
export async function cloudNhanQua(id) {
  const sb = await getClient();
  const { data, error } = await sb.rpc('nhan_qua_tang', { p_id: id });
  if (error) return { ok: false, reason: error.message };
  return { ok: true, noiDung: data || null };
}

/** Tac gia phat qua cho mot tai khoan. */
export async function cloudPhatQua(uid, noiDung, loiNhan) {
  if (!uid) return { ok: false, reason: 'no-uid' };
  const sb = await getClient();
  const { error } = await sb.from('qua_tang')
    .insert({ user_id: uid, noi_dung: noiDung || {}, loi_nhan: loiNhan || '' });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

// ---- KHOA TAI KHOAN ----
export async function cloudKhoaDs() {
  const sb = await getClient();
  const { data, error } = await sb.from('khoa_tai_khoan').select('user_id,ly_do,luc');
  if (error) return { ok: false, reason: error.message };
  return { ok: true, rows: data || [] };
}
export async function cloudKhoaThem(uid, lyDo) {
  if (!uid) return { ok: false, reason: 'no-uid' };
  const sb = await getClient();
  const { error } = await sb.from('khoa_tai_khoan').upsert({ user_id: uid, ly_do: lyDo || '' }, { onConflict: 'user_id' });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
export async function cloudKhoaBo(uid) {
  if (!uid) return { ok: false, reason: 'no-uid' };
  const sb = await getClient();
  const { error } = await sb.from('khoa_tai_khoan').delete().eq('user_id', uid);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
