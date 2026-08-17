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

/**
 * Phat CUNG MOT hop qua cho nhieu tai khoan trong MOT lenh ghi.
 * ⚠⚠ Mot lenh chu khong phai vong lap: nua chung that bai thi nua so nguoi co qua, nua khong,
 *   ma khong co duong nao biet ai da nhan. Postgres cuon nguoc ca me neu co dong nao hong.
 * ⚠ Trung lap bi bo truoc khi gui — gui hai dong cho cung mot nguoi la ho nhan hai lan.
 */
export async function cloudPhatQuaNhieu(uids, noiDung, loiNhan) {
  const ds = [...new Set((uids || []).filter(Boolean))];
  if (!ds.length) return { ok: false, reason: 'khong co ai nhan' };
  const sb = await getClient();
  const { error } = await sb.from('qua_tang')
    .insert(ds.map((u) => ({ user_id: u, noi_dung: noiDung || {}, loi_nhan: loiNhan || '' })));
  if (error) return { ok: false, reason: error.message };
  return { ok: true, so: ds.length };
}

// ============================================================
// CAO THI (dot 3) — bang `cao_thi`, xem docs/SQL_LENH_BAI_3.sql.
// Mot bang lam ca hai viec: `muc_tieu` rong la cao thi chung, co uid la thu rieng.
// ⚠ Luat RLS DA LOC MOC. Nguoi thuong doc ham nay chi ra cai dang trong han — khong can loc lai
//   o client, va cung khong the doc truoc cai chua toi gio dang.
// ============================================================

/** Cao thi dang trong han cua chinh minh. KHONG can dang nhap (bao tri phai toi duoc ca khach). */
export async function cloudCaoThiDs() {
  const sb = await getClient();
  const { data, error } = await sb.from('cao_thi')
    .select('id,tieu_de,noi_dung,muc,muc_tieu,mo_luc,dong_luc')
    .order('id', { ascending: false }).limit(30);
  if (error) return { ok: false, reason: error.message, thieuBang: _thieuBang(error) };
  return { ok: true, rows: data || [] };
}

/** Dang mot cao thi moi. Chi tac gia ghi duoc (RLS chan, khong phai giao dien chan). */
export async function cloudCaoThiDang(r) {
  const sb = await getClient();
  const { error } = await sb.from('cao_thi').insert({
    tieu_de: (r && r.tieuDe) || '',
    noi_dung: (r && r.noiDung) || '',
    muc: (r && r.muc) || 'thuong',
    muc_tieu: (r && r.mucTieu) || null,
    mo_luc: (r && r.moLuc) ? new Date(r.moLuc).toISOString() : null,
    dong_luc: (r && r.dongLuc) ? new Date(r.dongLuc).toISOString() : null,
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

/** Go mot cao thi. Dong nhat ky van con — so chi them duoc. */
export async function cloudCaoThiXoa(id) {
  if (!id) return { ok: false, reason: 'no-id' };
  const sb = await getClient();
  const { error } = await sb.from('cao_thi').delete().eq('id', id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

// ---- DANH SACH NGUOI CHOI (dot 2 — view `nguoi_choi_gom`, xem docs/SQL_LENH_BAI_2.sql) ----
/**
 * Loi nay la "chua chay tep SQL", khong phai "khong co ai".
 * ⚠ Hai truong hop nay ra cung mot man hinh trong neu khong tach ra — nguoi dung ngoi tim
 *   nguoi choi trong khi that ra bang con chua ton tai.
 * PostgREST tra PGRST205 (khong thay bang trong so do), Postgres tra 42P01 (relation does not exist).
 */
function _thieuBang(e) {
  const ma = (e && e.code) || '';
  const chu = (e && e.message) || '';
  return ma === 'PGRST205' || ma === '42P01' || /does not exist|Could not find the table/i.test(chu);
}
const _UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
 * Nguoi choi sap theo lan dong bo gan nhat.
 * ⚠ View KHONG co cot `data`. Muon soi ban luu thi goi `cloudDocSaveCua` cho DUNG MOT nguoi —
 *   mot dong save nang ~120 KB, keo ca bang ve la treo may.
 */
export async function cloudNguoiChoiDs(gioiHan) {
  const sb = await getClient();
  const { data, error } = await sb.from('nguoi_choi_gom')
    .select('user_id,updated_at,last_save,ten,tong_cap,chien_dau,chien_luc,avatar,danh_hieu')
    .order('updated_at', { ascending: false })
    .limit(Math.max(1, Math.min(200, gioiHan || 50)));
  if (error) return { ok: false, reason: error.message, thieuBang: _thieuBang(error) };
  return { ok: true, rows: data || [] };
}

/**
 * Tim nguoi choi theo TEN NHAN VAT hoac theo MA TAI KHOAN.
 * ⚠⚠ CHI TIM THEO TEN LA BO SOT. Cot `ten` den tu bang `ho_so_cong_khai`, ma bang do chi co dong
 *   khi nguoi choi da bam Khoe. Nguoi moi tao nhan vat, chua khoe lan nao, thi `ten` la null —
 *   `ilike` khong bao gio khop null nen ho bien mat khoi ket qua. Go ma tai khoan phai ra.
 * ⚠ Bo `%` va `_` khoi tu khoa: hai ky tu do la ky tu dai dien cua `ilike`, go vao la khop bua.
 */
export async function cloudTimNguoiChoi(tuKhoa, gioiHan) {
  const t = String(tuKhoa || '').replace(/[%_\\]/g, '').trim();
  if (!t) return { ok: true, rows: [] };
  const sb = await getClient();
  let q = sb.from('nguoi_choi_gom')
    .select('user_id,updated_at,last_save,ten,tong_cap,chien_dau,chien_luc,avatar,danh_hieu');
  // Chuoi dung khuon uuid thi tim thang theo ma tai khoan; nguoc lai tim theo ten.
  q = _UUID.test(t) ? q.eq('user_id', t) : q.ilike('ten', '%' + t + '%');
  const { data, error } = await q
    .order('tong_cap', { ascending: false })
    .limit(Math.max(1, Math.min(100, gioiHan || 30)));
  if (error) return { ok: false, reason: error.message, thieuBang: _thieuBang(error) };
  return { ok: true, rows: data || [] };
}

/**
 * Doc ban luu cua MOT tai khoan — CHI DOC.
 * ⚠⚠ Nang ~120 KB mot dong. Chi goi khi tac gia bam vao dung mot nguoi, dung goi trong vong lap.
 * ⚠ Khong co duong nao GHI nguoc lai: bang `saves` khong cap quyen update cho tac gia (co y).
 */
export async function cloudDocSaveCua(uid) {
  if (!uid) return { ok: false, reason: 'no-uid' };
  const sb = await getClient();
  const { data, error } = await sb.from('saves').select('data,last_save,updated_at')
    .eq('user_id', uid).maybeSingle();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, row: data };
}

// ---- NHAT KY LENH BAI (so chi them duoc) ----
/**
 * Doc so nhat ky. Chi tac gia doc duoc (RLS).
 * ⚠ Bang nay KHONG co luat ghi cho bat ky ai — moi dong deu do trigger security definer ghi vao.
 */
export async function cloudNhatKyDs(gioiHan, viec) {
  const sb = await getClient();
  let q = sb.from('lenh_bai_nhat_ky').select('id,luc,ai,viec,thao_tac,muc_tieu,chi_tiet');
  if (viec) q = q.eq('viec', viec);
  const { data, error } = await q.order('luc', { ascending: false })
    .limit(Math.max(1, Math.min(300, gioiHan || 100)));
  if (error) return { ok: false, reason: error.message };
  return { ok: true, rows: data || [] };
}

// ---- KHOA TAI KHOAN ----
export async function cloudKhoaDs() {
  const sb = await getClient();
  const { data, error } = await sb.from('khoa_tai_khoan').select('user_id,ly_do,luc,het_luc');
  if (error) return { ok: false, reason: error.message };
  return { ok: true, rows: data || [] };
}
/**
 * Khoa mot tai khoan. `hetLuc` rong = khoa khong han.
 * ⚠ Van la ghi MOC chu khong ghi cong tac: toi gio la chot tu thoi chan, khong can ai bam go.
 */
export async function cloudKhoaThem(uid, lyDo, hetLuc) {
  if (!uid) return { ok: false, reason: 'no-uid' };
  const sb = await getClient();
  const { error } = await sb.from('khoa_tai_khoan').upsert(
    { user_id: uid, ly_do: lyDo || '', het_luc: hetLuc ? new Date(hetLuc).toISOString() : null },
    { onConflict: 'user_id' },
  );
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

/**
 * Go mot ho so khoi Phong Van Bang. Dung cho ten nhan vat tuc tiu.
 * ⚠ Go KHONG PHAI la cam: nguoi choi bam Khoe lan nua la ho so hien lai. Muon chan han thi khoa
 *   tai khoan — trigger tren `ho_so_cong_khai` se chan luon duong ghi.
 */
export async function cloudHoSoXoa(uid) {
  if (!uid) return { ok: false, reason: 'no-uid' };
  const sb = await getClient();
  const { error } = await sb.from('ho_so_cong_khai').delete().eq('user_id', uid);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

// ============================================================
// MA DOI QUA (dot 5) — bang `ma_qua`, xem docs/SQL_LENH_BAI_5.sql.
// tu_dong = false: nguoi choi go tay. tu_dong = true: client tu doi khi dang nhap.
// ============================================================

/**
 * Doi mot ma. Tra { ok, noiDung } — noiDung null nghia la khong doi duoc.
 * ⚠⚠ May chu KHONG noi ro vi sao khong doi duoc (sai ma / het luot / het han / da doi roi deu
 *   tra rong nhu nhau). Phan biet ra la mo duong cho nguoi ta do ma.
 * ⚠ Ghi "da doi" nam trong ham security definer phia may chu, khong phai o day.
 */
export async function cloudDoiMaQua(ma) {
  const m = String(ma || '').trim().toUpperCase();
  if (!m) return { ok: false, reason: 'no-ma' };
  const sb = await getClient();
  const { data, error } = await sb.rpc('doi_ma_qua', { p_ma: m });
  if (error) return { ok: false, reason: error.message, thieuBang: _thieuBang(error) };
  return { ok: true, noiDung: data || null };
}

/**
 * Ma TU DONG dang trong han. Luat RLS chi lo ra loai nay — ma go tay khong ai doc duoc.
 * ⚠ Khong can dang nhap de doc, nhung doi thi phai (ham doi_ma_qua doi auth.uid()).
 */
export async function cloudMaTuDongDs() {
  const sb = await getClient();
  const { data, error } = await sb.from('ma_qua').select('ma,mo_luc,dong_luc').eq('tu_dong', true).limit(20);
  if (error) return { ok: false, reason: error.message, thieuBang: _thieuBang(error) };
  return { ok: true, rows: data || [] };
}

/** Toan bo ma — chi tac gia doc duoc (RLS). */
export async function cloudMaQuaDs() {
  const sb = await getClient();
  const { data, error } = await sb.from('ma_qua')
    .select('ma,noi_dung,luot_toi_da,luot_da_dung,tu_dong,mo_luc,dong_luc,ghi_chu')
    .order('tao_luc', { ascending: false }).limit(50);
  if (error) return { ok: false, reason: error.message, thieuBang: _thieuBang(error) };
  return { ok: true, rows: data || [] };
}

export async function cloudMaQuaTao(r) {
  const sb = await getClient();
  const { error } = await sb.from('ma_qua').insert({
    ma: String((r && r.ma) || '').trim().toUpperCase(),
    noi_dung: (r && r.noiDung) || {},
    luot_toi_da: Math.max(0, Math.floor((r && r.luotToiDa) || 0)),
    tu_dong: !!(r && r.tuDong),
    mo_luc: (r && r.moLuc) ? new Date(r.moLuc).toISOString() : null,
    dong_luc: (r && r.dongLuc) ? new Date(r.dongLuc).toISOString() : null,
    ghi_chu: (r && r.ghiChu) || '',
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function cloudMaQuaXoa(ma) {
  if (!ma) return { ok: false, reason: 'no-ma' };
  const sb = await getClient();
  const { error } = await sb.from('ma_qua').delete().eq('ma', ma);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

// ============================================================
// HE SO TOAN MAY CHU (dot 5) — bang `he_so_may_chu`.
// ⚠⚠ Bang nay nam trong docs/SQL_CHONG_GIAN_LAN.sql chu KHONG phai tep Lenh Bai rieng: chot doc
//    no o moi lan ghi save, de o tep khac la co luc bang chua ton tai ma chot da goi -> ca lang
//    khong luu duoc save.
// ============================================================

/** Cac dot he so DANG chay. Luat RLS da loc moc; nguoi thuong khong thay dot chua toi gio. */
export async function cloudHeSoDs() {
  const sb = await getClient();
  const { data, error } = await sb.from('he_so_may_chu')
    .select('id,khoa,gia_tri,mo_luc,dong_luc,ghi_chu')
    .order('id', { ascending: false }).limit(30);
  if (error) return { ok: false, reason: error.message, thieuBang: _thieuBang(error) };
  return { ok: true, rows: data || [] };
}

export async function cloudHeSoDat(r) {
  const sb = await getClient();
  const { error } = await sb.from('he_so_may_chu').insert({
    khoa: (r && r.khoa) || 'exp',
    gia_tri: Number((r && r.giaTri) || 1),
    mo_luc: (r && r.moLuc) ? new Date(r.moLuc).toISOString() : null,
    dong_luc: (r && r.dongLuc) ? new Date(r.dongLuc).toISOString() : null,
    ghi_chu: (r && r.ghiChu) || '',
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function cloudHeSoXoa(id) {
  if (!id) return { ok: false, reason: 'no-id' };
  const sb = await getClient();
  const { error } = await sb.from('he_so_may_chu').delete().eq('id', id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

// ============================================================
// MO KHOA NOI DUNG DAN (bang `mo_khoa`, xem docs/SQL_LENH_BAI_8.sql).
// Khoa `tran_chuyen` = so lan Trung Sinh dang mo. Ngay mo may chu la 0.
// ============================================================

/** Doc moi khoa mo dan. KHONG can dang nhap — client phai biet de ve dung giao dien. */
export async function cloudMoKhoaDs() {
  const sb = await getClient();
  const { data, error } = await sb.from('mo_khoa').select('khoa,gia_tri,ghi_chu,cap_nhat');
  if (error) return { ok: false, reason: error.message, thieuBang: _thieuBang(error) };
  return { ok: true, rows: data || [] };
}

/** Dat mot khoa. Chi tac gia ghi duoc (RLS chan, khong phai giao dien chan). */
export async function cloudMoKhoaDat(khoa, giaTri) {
  const sb = await getClient();
  const { error } = await sb.from('mo_khoa')
    .update({ gia_tri: Math.max(0, Math.floor(Number(giaTri) || 0)), cap_nhat: new Date().toISOString() })
    .eq('khoa', khoa);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

// ============================================================
// TINH NANG — co bat/tat (bang `tinh_nang`, xem docs/SQL_LENH_BAI_9.sql).
// ⚠⚠ Bang nay la NEN cua ca lo trinh: moi tinh nang moi len live o trang thai NGU, tac gia bat
//    bang Lenh Bai. Doc duoc KHONG CAN dang nhap — khach vao xem cung phai thay dung giao dien.
// ============================================================

/** Doc moi co bat/tat. Loi thi tang tren giu nguyen ban da dem, KHONG duoc coi la tat het. */
export async function cloudTinhNangDs() {
  const sb = await getClient();
  const { data, error } = await sb.from('tinh_nang').select('ma,bat,chi_tac_gia,cau_hinh,cap_nhat');
  if (error) return { ok: false, reason: error.message, thieuBang: _thieuBang(error) };
  return { ok: true, rows: data || [] };
}

/**
 * Dat mot co. Chi tac gia ghi duoc (RLS chan, khong phai giao dien chan).
 * ⚠ Chi UPDATE, khong upsert: dong nao khong co san trong bang la ma sai — de may chu tu choi
 *   con hon de client de ra mot co la khong ai doc.
 */
export async function cloudTinhNangDat(ma, bat, chiTacGia) {
  if (!ma) return { ok: false, reason: 'no-ma' };
  const sb = await getClient();
  const { data, error } = await sb.from('tinh_nang')
    .update({ bat: !!bat, chi_tac_gia: !!chiTacGia, cap_nhat: new Date().toISOString() })
    .eq('ma', ma).select('ma');
  if (error) return { ok: false, reason: error.message };
  // ⚠⚠ RLS tu choi UPDATE thi Supabase tra ve MANG RONG chu khong bao loi. Khong soi vế nay thi
  //   giao dien bao "Da bat" trong khi may chu khong ghi gi — dung cai bay da dinh o duong khac.
  if (!data || !data.length) return { ok: false, reason: 'may chu tu choi' };
  return { ok: true };
}

/** So lieu may chu cho tab Thong Ke. Nguoi thuong goi ra so cua chinh ho (RLS). */
export async function cloudThongKe() {
  const sb = await getClient();
  const { data, error } = await sb.from('thong_ke_may_chu')
    .select('tong_tai_khoan,vao_24_gio,vao_7_ngay,vao_30_ngay,mat_tich,cu_nhat,moi_nhat').maybeSingle();
  if (error) return { ok: false, reason: error.message, thieuBang: _thieuBang(error) };
  return { ok: true, row: data };
}
export async function cloudKhoaBo(uid) {
  if (!uid) return { ok: false, reason: 'no-uid' };
  const sb = await getClient();
  const { error } = await sb.from('khoa_tai_khoan').delete().eq('user_id', uid);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

// ============================================================
// SAN GIAO DICH — chi NGUOI CHOI ban, KHONG co bot (docs/SQL_SAN_GIAO_DICH.sql)
// ============================================================
// ⚠⚠ BA HAM TREO/GO/MUA DEU GHI LAI `saves.data` O PHIA MAY CHU. Goi xong, ban luu tren may nay
//    thanh BAN CU: no thieu mon vua treo, hoac thieu Bac vua tieu, va mang `sanSeq` cu hon.
//    Chot chan quay nguoc se TU CHOI moi lan day len sau do. Nen goi xong PHAI tai lai save tu
//    cloud — main.js lo viec do (`_applyCloudSave`). Dung goi thang ba ham nay roi choi tiep.
// ⚠ Client KHONG duoc tu go mon khoi tui. Ham tren may chu tu doc tui, tu bo mon, tu ghi lai.

/** Danh sach tin dang treo. Tra { ok, ds }. */
export async function cloudSanDs(gioiHan) {
  const sb = await getClient();
  const { data, error } = await sb.from('san_rao')
    .select('id,nguoi_ban,ten_ban,mon,gia,tao_luc')
    .eq('trang_thai', 'treo')
    .order('tao_luc', { ascending: false })
    .limit(Math.min(200, gioiHan || 80));
  if (error) return { ok: false, reason: error.message };
  return { ok: true, ds: data || [] };
}

/** Tin CUA MINH (ca da ban / da go) — de xem lai. */
export async function cloudSanCuaToi(gioiHan) {
  const sb = await getClient();
  const uid = await _uid();
  if (!uid) return { ok: false, reason: 'no-auth' };
  const { data, error } = await sb.from('san_rao')
    .select('id,mon,gia,trang_thai,tao_luc,xong_luc')
    .eq('nguoi_ban', uid)
    .order('tao_luc', { ascending: false })
    .limit(Math.min(100, gioiHan || 50));
  if (error) return { ok: false, reason: error.message };
  return { ok: true, ds: data || [] };
}

/** Treo ban MOT trang bi theo `uid` cua instance. */
export async function cloudSanTreo(monUid, gia) {
  const sb = await getClient();
  const { data, error } = await sb.rpc('san_treo', { p_uid: String(monUid), p_gia: Math.round(gia) });
  if (error) return { ok: false, reason: error.message };
  return data || { ok: false, reason: 'khong-tra-loi' };
}

/** Go tin xuong, mon ve tui. */
export async function cloudSanGo(id) {
  const sb = await getClient();
  const { data, error } = await sb.rpc('san_go', { p_id: id });
  if (error) return { ok: false, reason: error.message };
  return data || { ok: false, reason: 'khong-tra-loi' };
}

/** Mua mot tin. */
export async function cloudSanMua(id) {
  const sb = await getClient();
  const { data, error } = await sb.rpc('san_mua', { p_id: id });
  if (error) return { ok: false, reason: error.message };
  return data || { ok: false, reason: 'khong-tra-loi' };
}

/** Treo ban VAT PHAM XEP CHONG (lieu, do che tao, trung pet, cong cu). `gia` la gia CA LO. */
export async function cloudSanTreoVp(itemId, soLuong, gia) {
  const sb = await getClient();
  const { data, error } = await sb.rpc('san_treo_vp', {
    p_item: String(itemId), p_so: Math.round(soLuong), p_gia: Math.round(gia),
  });
  if (error) return { ok: false, reason: error.message };
  return data || { ok: false, reason: 'khong-tra-loi' };
}
