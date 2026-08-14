-- ============================================================
-- SOI LENH BAI — CAU HOI CHI DOC, khong sua gi.
-- Dan TRON tep nay vao Supabase SQL Editor roi Run.
-- ⚠ Chi MOT cau lenh duy nhat: Supabase SQL Editor chi hien ket qua cua lenh CUOI CUNG.
--
-- ⚠⚠ NHIN KY hai nhom nay:
--    · "5 · luat tren saves" — neu co dong `delete` cho CHU DONG thi bao lai. Chot khoa da chan
--      delete bang trigger roi, nhung biet chac van hon doan.
--    · "3 · trigger" — tren `saves` phai thay `a_khoa_tai_khoan_tren_saves` voi loai "insert+update+delete".
--      Thieu mot loai la nguoi bi khoa xoa dong roi ghi lai duoc.
-- ============================================================
select '1 · bang' as nhom, tablename as ten,
       case when rowsecurity then 'RLS bat' else '⚠ RLS TAT' end as ghi_chu
  from pg_tables
 where schemaname = 'public'
   and tablename in ('su_kien', 'qua_tang', 'khoa_tai_khoan', 'lenh_bai_nhat_ky')

union all
select '2 · luat', tablename || ' · ' || policyname, cmd
  from pg_policies
 where schemaname = 'public'
   and tablename in ('su_kien', 'qua_tang', 'khoa_tai_khoan', 'lenh_bai_nhat_ky')

union all
select '3 · trigger', tgrelid::regclass::text || ' · ' || tgname,
       concat_ws('+',
         case when (tgtype &  4) > 0 then 'insert' end,
         case when (tgtype &  8) > 0 then 'delete' end,
         case when (tgtype & 16) > 0 then 'update' end)
  from pg_trigger
 where not tgisinternal
   and tgrelid in ('public.saves'::regclass, 'public.su_kien'::regclass,
                   'public.qua_tang'::regclass, 'public.khoa_tai_khoan'::regclass,
                   'public.ho_so_cong_khai'::regclass)

union all
select '4 · ham', p.proname,
       case when p.prosecdef then 'security definer · ' else '' end ||
       case p.provolatile when 'i' then 'immutable' when 's' then 'stable' else 'volatile' end
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname in ('nhan_qua_tang', 'chan_tai_khoan_bi_khoa', 'ghi_nhat_ky_lenh_bai', 'qua_hop_le')

union all
select '5 · luat tren saves', policyname, cmd
  from pg_policies
 where schemaname = 'public' and tablename = 'saves'

union all
select '6 · rang buoc qua', conname, pg_get_constraintdef(oid)
  from pg_constraint
 where conrelid = 'public.qua_tang'::regclass and contype = 'c'

-- ---- DOT 2: view danh sach nguoi choi (SQL_LENH_BAI_2.sql) ----
-- ⚠⚠ Cot `data` LOT VAO VIEW la moi lan mo man Lenh Bai keo ve ca tram MB. Phai la "khong co cot data".
union all
select '7 · view dot 2', 'nguoi_choi_gom',
       case when not exists (select 1 from information_schema.views
                              where table_schema = 'public' and table_name = 'nguoi_choi_gom')
            then '⚠ CHUA CHAY SQL_LENH_BAI_2.sql'
            when exists (select 1 from information_schema.columns
                          where table_schema = 'public' and table_name = 'nguoi_choi_gom'
                            and column_name = 'data')
            then '⚠ HONG — view co cot data'
            else 'OK · khong co cot data' end

-- ---- DOT 3: bang cao thi (SQL_LENH_BAI_3.sql) ----
union all
select '8 · bang dot 3', tablename,
       case when rowsecurity then 'RLS bat' else '⚠ RLS TAT' end
  from pg_tables where schemaname = 'public' and tablename = 'cao_thi'

union all
select '8 · luat cao thi', policyname, cmd
  from pg_policies where schemaname = 'public' and tablename = 'cao_thi'

union all
select '8 · rang buoc cao thi', conname, pg_get_constraintdef(oid)
  from pg_constraint
 where conrelid = to_regclass('public.cao_thi') and contype = 'c'

union all
select '8 · trigger cao thi', tgname, 'co'
  from pg_trigger
 where tgrelid = to_regclass('public.cao_thi') and not tgisinternal

order by 1, 2;
