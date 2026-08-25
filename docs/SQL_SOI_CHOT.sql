-- ============================================================
-- TIEU DAO LUC — SOI CHOT CHONG GIAN LAN (CHI DOC, khong sua gi)
--
-- CACH DUNG: Supabase > SQL Editor > dan tron tep nay > Run.
-- Chay luc nao cung duoc. Khong tao, khong xoa, khong sua mot dong nao.
--
-- ⚠ MOT CAU DUY NHAT co y: SQL Editor chi hien ket qua cua CAU CUOI, nen tach nhieu cau
--   thi bang kiem quan trong nhat bi che mat.
--
-- Doc cot `ket_luan`: het thay "OK" la chot dung nhu thiet ke.
-- ============================================================

with soi(tt, muc, thay, phai_la) as (
  values
    (1,  'tran Chien Dau (xp/giay)',
     (select xp_giay::text from tran_toc_do where khoa = 'chienDau'), '49.8750'),
    (2,  'so track co tran',
     (select count(*)::text from tran_toc_do), '17'),
    (3,  'nhip danh (ms moi con)',
     (select gia_tri::text from tran_he_so where khoa = 'nhip_danh_ms'), '8000'),
    (4,  'he so gio (tang 2A)',
     (select gia_tri::text from tran_he_so where khoa = 'he_so_gio'), '1.5'),
    (5,  'phu cap Chien Dau (tang 2B)',
     (select gia_tri::text from tran_he_so where khoa = 'phu_cap_chien_dau'), '245950'),
    (6,  'sai so boc so (tang 2C)',
     (select gia_tri::text from tran_he_so where khoa = 'sai_so_boc_so'), '2'),
    (7,  'moc CHAN (gap may lan tran)',
     (select gia_tri::text from tran_he_so where khoa = 'gap_de_chan'), '3'),
    (8,  'chot dang gan tren bang saves',
     (select count(*)::text from pg_trigger
       where tgname = 'kiem_toc_do_tren_saves' and not tgisinternal), '1'),
    (9,  'ba ham phu co that (so_jsonb, tong_gio_lam, tong_ha_quai)',
     (select count(*)::text from pg_proc
       where proname in ('so_jsonb','tong_gio_lam','tong_ha_quai')), '3'),
    (10, 'bang mien_tru co that',
     (select count(*)::text from information_schema.tables
       where table_schema = 'public' and table_name = 'mien_tru'), '1'),
    (11, 'cot da_chan co that',
     (select count(*)::text from information_schema.columns
       where table_schema = 'public' and table_name = 'nghi_van' and column_name = 'da_chan'), '1'),
    (12, 'view gom co cot so_lan_chan',
     (select count(*)::text from information_schema.columns
       where table_schema = 'public' and table_name = 'nghi_van_gom' and column_name = 'so_lan_chan'), '1'),
    (13, 'so bang da bat RLS (phai du 5)',
     (select count(*)::text from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relrowsecurity
         and c.relname in ('saves','nghi_van','mien_tru','tran_toc_do','tran_he_so')), '5'),
    (14, 'luat cho bang mien_tru (doc/them/go)',
     (select count(*)::text from pg_policies
       where schemaname = 'public' and tablename = 'mien_tru'), '3'),
    -- ---------- BAN VA 2026-08-25: chot dang bat oan nguoi choi sach ----------
    -- ⚠⚠ NAM MUC DUOI DAY PHAN BIET BAN CU VOI BAN MOI. Lech mot muc nghia la tep SQL vua chay
    --    KHONG PHAI ban moi — chay lai `docs/SQL_CHONG_GIAN_LAN.sql` sau khi `git pull`.
    (15, 'cot tran_lan (tran RIENG tung nghe) co that',
     (select count(*)::text from information_schema.columns
       where table_schema = 'public' and table_name = 'tran_toc_do' and column_name = 'tran_lan'), '1'),
    (16, 'du 17 nghe deu co tran rieng (khong nghe nao bo trong)',
     (select count(*)::text from tran_toc_do where tran_lan is not null and tran_lan > 0), '17'),
    (17, 'tran rieng cua Chien Dau',
     (select tran_lan::text from tran_toc_do where khoa = 'chienDau'), '17484512'),
    (18, 'bu nhan roi = 20 gio (8 nen + 6 Dong Phu + 6 Nhat Tam Nhi Dung)',
     (select gia_tri::text from tran_he_so where khoa = 'bu_nhan_roi_giay'), '72000'),
    -- ⚠⚠ MUC NAY QUAN TRONG NHAT: doc THAN HAM tren may chu.
    --    `tran_toc_do.tran_lan` GHI RO TEN BANG — thieu ten bang thi PL/pgSQL nem
    --    "column reference tran_lan is ambiguous" o MOI lan ghi save (ca lang mat luu).
    --    Ban 8ea180a thieu ten bang; ban 231c3f9 co. Muc nay phan biet dung hai ban do.
    (19, 'than chot ghi ro ten bang truoc cot tran_lan',
     (select case when pg_get_functiondef(p.oid) like '%tran_toc_do.tran_lan as tran_track%'
                  then '1' else '0' end
        from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'kiem_toc_do'), '1'),
    (20, 'than chot co phan NO theo thoi gian cho (so_cua_so)',
     (select case when pg_get_functiondef(p.oid) like '%so_cua_so := greatest(1, ceil((giay + bu) / bu))%'
                  then '1' else '0' end
        from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'kiem_toc_do'), '1'),
    (21, 'tang 2D khong con gan cung moc chan (het ket ban luu vinh vien)',
     (select case when pg_get_functiondef(p.oid) like '%gap_nay := gap_chan;%'
                  then '0' else '1' end
        from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'kiem_toc_do'), '1'),
    (22, 'chot dong dau gio dung TRUOC chot kiem toc do (thu tu ten)',
     (select case when min(tgname) = 'a_dong_dau_gio_tren_saves' then '1' else '0' end
        from pg_trigger where tgrelid = 'public.saves'::regclass and not tgisinternal), '1')
)
select tt, muc,
       coalesce(thay, '(khong co)') as thay,
       phai_la,
       case when thay is not distinct from phai_la then 'OK' else '>>> LECH <<<' end as ket_luan
  from soi

union all
-- ---------- So nghi van + mien tru: cung mot bang cho de doc ----------
select 30, '--- so nghi van ---', '', '', ''
union all
select 31, 'tong dong da ghi',      (select count(*)::text from nghi_van), '', ''
union all
select 32, 'so lan DA CHAN',        (select count(*) filter (where da_chan)::text from nghi_van), '', ''
union all
select 33, 'dong cua tac gia (F9)', (select count(*) filter (where la_tac_gia)::text from nghi_van), '', ''
union all
select 34, 'so tai khoan bi ghi',   (select count(distinct user_id)::text from nghi_van), '', ''
union all
select 35, 'lan ghi gan nhat',      (select coalesce(max(luc)::text, '(chua co)') from nghi_van), '', ''
union all
select 36, 'so nguoi dang mien tru',(select count(*)::text from mien_tru), '', ''
order by tt;
