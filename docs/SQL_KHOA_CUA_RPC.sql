-- ============================================================
-- TIEU DAO LUC — KHOA CUA RPC. Thu hoi EXECUTE cua BON ham nhan uid LAM THAM SO.
-- ============================================================
-- CACH DUNG: Supabase > SQL Editor > dan tron tep nay > Run. Chay lai duoc nhieu lan.
-- ⚠ CHAY SAU cac tep SQL khac. Ly do o muc 4.
--
-- ---------- 1. VI SAO CAN TEP NAY ----------
-- PostgreSQL MAC DINH cap EXECUTE cho `PUBLIC` tren moi ham vua tao, va Supabase cap them cho hai
-- vai `anon` + `authenticated`. Mac dinh la MO, khong phai DONG. Ca kho nay tu truoc toi nay chi co
-- DUNG HAI dong revoke (SQL_LENH_BAI.sql:171 va SQL_LENH_BAI_5.sql:116).
--
-- `anon` la vai cua KHOA CONG KHAI. Khoa do nam trong src/cloud-config.js va duoc gui thang toi
-- trinh duyet — ai mo F12 cung doc duoc. Ham nao khong revoke thi NGUOI LA GOI DUOC bang mot lenh
-- POST toi /rest/v1/rpc/<ten_ham>, khong can dang nhap.
--
-- ⚠⚠ CHO HONG THAT: ham `security definer` chay duoi quyen CHU SO HUU va BO QUA RLS. Do la co y.
-- No chi con an toan khi than ham TU HOI "toi dang chay cho AI" bang `auth.uid()`. Bon ham o muc 3
-- KHONG hoi cau do — chung NHAN uid LAM THAM SO roi tin. Nguoi goi tu khai minh la ai.
--
-- ---------- 2. TEP NAY KHONG DUNG VAO 10 HAM CLIENT THAT SU GOI ----------
-- Da grep ca kho (`rpc(` trong src/): chi src/cloud.js goi RPC, dung 10 ten:
--   nhan_qua_tang(bigint)                   san_thu_mua_dat(text, integer, bigint)
--   doi_ma_qua(text)                        san_thu_mua_huy(bigint)
--   san_treo(text, bigint)                  san_thu_mua_ban(bigint, integer)
--   san_go(bigint)                          san_thu_mua_thu_hoi()
--   san_mua(bigint)                         san_treo_vp(text, integer, bigint)
-- ⛔ Revoke bat ky ten nao trong so do la hong San Giao Dich / hong duong nhan qua cua ca lang.
-- Ca muoi deu doc `auth.uid()` chu KHONG nhan uid lam tham so, nen `anon` co goi duoc cung khong
-- lam gi: `auth.uid()` ra null va ham tu choi ngay dong dau.
--
-- ⚠ CO CHU Y KHONG DONG THEM: mot so ham THUAN TINH (san_thue, san_tm_han, san_gia_toi_thieu,
--   san_hs_pham, san_cp_ep...) cung dang mo, nhung dong chung khong duoc gi — cong thuc cua chung
--   VON DA nam trong src/data/giasan.js va duoc gui toi moi trinh duyet. Dong them chi to them rui
--   ro gay mot loi goi hop le nao do. `qua_hop_le(jsonb)` cung de nguyen: no nam trong CHECK
--   constraint cua bang `qua_tang` va `ma_qua`, revoke co the chan nham chinh lenh ghi qua.
--
-- ⚠ CAC HAM TRIGGER (kiem_toc_do, san_chan_quay_nguoc, chan_tai_khoan_bi_khoa, chan_khi_bao_tri,
--   ghi_nhat_ky_lenh_bai, kiem_vat_pham_qua) deu `returns trigger` nen PostgREST khong phoi ra.
--   Khong co gi de revoke, va du co revoke thi trigger van no binh thuong — Postgres khong kiem
--   EXECUTE luc trigger chay.
-- ============================================================


-- ---------- 3. BON CUA SAU ----------
-- ⚠ REVOKE KHONG LAM GAY LOI GOI TU BEN TRONG. Ca bon deu duoc mot ham `security definer` khac goi
--   lai (da soi tan noi tung cho, ghi o tung dong duoi). Than mot ham `security definer` chay tron
--   ven duoi quyen CHU SO HUU, ma chu so huu luon co EXECUTE nho chinh quyen so huu.

-- ⚠⚠ NANG NHAT. Ghi de TRON BAN LUU cua bat ky uid nao:
--    `update saves set data = ... where user_id = p_uid`, khong mot lan goi `auth.uid()`.
--    No con dat `set_config('app.san','1')` nen hai chot chong gian lan BO QUA chinh lenh ghi do.
--    Goi tu ben trong: san_treo · san_treo_vp · san_go · san_mua (SQL_SAN_GIAO_DICH.sql) va
--    san_thu_mua_dat · _huy · _ban · _thu_hoi (SQL_SAN_THU_MUA.sql). Client KHONG goi.
revoke all on function public.san_ghi_save(uuid, jsonb) from public, anon, authenticated;

-- Doc TRON BAN LUU cua bat ky uid nao: tui do, Bac, toan bo tien trinh.
--    Goi tu ben trong: bon ham San o SQL_SAN_GIAO_DICH.sql. Client KHONG goi.
revoke all on function public.san_doc_save(uuid) from public, anon, authenticated;

-- Y het `san_doc_save`, them `for update`. Len live cung dot San Thu Mua.
--    Goi tu ben trong: bon ham o SQL_SAN_THU_MUA.sql. Client KHONG goi.
revoke all on function public.san_doc_save_khoa(uuid) from public, anon, authenticated;

-- Nhe hon ba ham tren: tra ve SO vien Dan Dien mua rong cua mot uid. Ro so lieu tai khoan khac.
--    Goi tu ben trong: DUY NHAT chot `kiem_toc_do` (SQL_CHONG_GIAN_LAN.sql:447 va :465), va chot
--    ay la `security definer` (SQL_CHONG_GIAN_LAN.sql:244). Client KHONG goi.
revoke all on function public.dan_mua_san(uuid, integer, integer) from public, anon, authenticated;


-- ---------- 4. VI SAO PHAI CHAY SAU CUNG ----------
-- `create or replace function` GIU NGUYEN ACL cu, nen chay lai mot tep san co KHONG tu no mo lai
-- cua. NHUNG `drop function` roi `create` lai thi ACL VE MAC DINH, tuc la MO lai cho anon.
-- ⇒ Chay lai bat ky tep nao trong `docs/` co dong `drop function`, hoac them ham moi, thi CHAY LAI
--   TEP NAY sau do.


-- ============================================================
-- CAU SOI SAU KHI CHAY — cau (a) chay san o cuoi tep, cau (b) dan rieng neu muon soi rong.
-- ⚠ Supabase SQL Editor chi hien ket qua cua lenh CUOI CUNG.
--
-- (b) Moi ham `security definer` ma `anon` con goi duoc. Danh sach nay KHONG can rong —
--     10 ham o muc 2 van phai nam trong do.
--
--   select p.proname as ham,
--          pg_get_function_identity_arguments(p.oid) as tham_so,
--          p.proacl
--     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--    where n.nspname = 'public' and p.prosecdef
--      and has_function_privilege('anon', p.oid, 'EXECUTE')
--    order by 1;
-- ============================================================

-- (a) Bon ham vua khoa. Ca bon phai ra `anon_goi_duoc = false` va `nguoi_dang_nhap_goi_duoc = false`.
select p.proname                                                as ham,
       pg_get_function_identity_arguments(p.oid)                as tham_so,
       has_function_privilege('anon', p.oid, 'EXECUTE')          as anon_goi_duoc,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as nguoi_dang_nhap_goi_duoc
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname in ('san_ghi_save', 'san_doc_save', 'san_doc_save_khoa', 'dan_mua_san')
 order by 1;
