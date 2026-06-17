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
