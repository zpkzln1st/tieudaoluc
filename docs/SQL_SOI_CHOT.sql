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
     (select count(*)::text from tran_toc_do), '11'),
    (3,  'nhip danh (ms moi con)',
     (select gia_tri::text from tran_he_so where khoa = 'nhip_danh_ms'), '8000'),
    (4,  'he so gio (tang 2A)',
     (select gia_tri::text from tran_he_so where khoa = 'he_so_gio'), '1.5'),
    (5,  'phu cap Chien Dau (tang 2B)',
     (select gia_tri::text from tran_he_so where khoa = 'phu_cap_chien_dau'), '75023'),
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
       where schemaname = 'public' and tablename = 'mien_tru'), '3')
)
select tt, muc,
       coalesce(thay, '(khong co)') as thay,
       phai_la,
       case when thay is not distinct from phai_la then 'OK' else '>>> LECH <<<' end as ket_luan
  from soi

union all
-- ---------- So nghi van + mien tru: cung mot bang cho de doc ----------
select 20, '--- so nghi van ---', '', '', ''
union all
select 21, 'tong dong da ghi',      (select count(*)::text from nghi_van), '', ''
union all
select 22, 'so lan DA CHAN',        (select count(*) filter (where da_chan)::text from nghi_van), '', ''
union all
select 23, 'dong cua tac gia (F9)', (select count(*) filter (where la_tac_gia)::text from nghi_van), '', ''
union all
select 24, 'so tai khoan bi ghi',   (select count(distinct user_id)::text from nghi_van), '', ''
union all
select 25, 'lan ghi gan nhat',      (select coalesce(max(luc)::text, '(chua co)') from nghi_van), '', ''
union all
select 26, 'so nguoi dang mien tru',(select count(*)::text from mien_tru), '', ''
order by tt;
