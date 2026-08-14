-- ============================================================
-- TIEU DAO LUC — LENH BAI DOT 4: KHOA CO HAN · GO HO SO · THONG KE MAY CHU
--
-- CACH DUNG: Supabase > SQL Editor > dan tron tep nay > Run. Chay lai duoc nhieu lan.
-- Phai chay SAU khi da chay SQL_LENH_BAI.sql, SQL_GIAM_SAT.sql va SQL_LENH_BAI_2.sql.
--
-- Ba viec:
--   1. Khoa CO HAN — them cot moc het han, toi gio tu het. Van la ghi MOC, khong ghi cong tac.
--   2. Tac gia go duoc mot ho so khoi Phong Van Bang (ten nhan vat tuc tiu).
--   3. View so lieu may chu cho tab Thong Ke.
-- Xem docs/THIET_KE_LENH_BAI.md muc D1, D3, G1.
-- ============================================================

-- ---------- 1. KHOA CO HAN ----------
-- `het_luc` rong = khoa khong han (giu nguyen hanh vi cu cua moi dong dang co).
alter table public.khoa_tai_khoan add column if not exists het_luc timestamptz;

-- ⚠⚠ DONG CU VAN NAM LAI trong bang sau khi het han. Do la CO Y: giu lich su vi pham.
--    Vi vay moi phep kiem "co dang bi khoa khong" PHAI di kem dieu kien moc, khong duoc chi
--    `exists (select 1 ... where user_id = ai)` nhu ban cu.
create or replace function public.chan_tai_khoan_bi_khoa() returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  ai uuid;
begin
  -- ⚠⚠ PHAI RE NHANH THEO tg_op TRUOC KHI DUNG new/old.
  --    Trong plpgsql, trigger DELETE thi `new` CHUA DUOC GAN — dung `coalesce(new.user_id, ...)`
  --    la loi luc chay. Cai bay nay im lang o luc chay SQL, chi no ra dung luc co nguoi xoa dong.
  if tg_op = 'DELETE' then ai := old.user_id; else ai := new.user_id; end if;
  if exists (
    select 1 from public.khoa_tai_khoan k
     where k.user_id = ai
       and (k.het_luc is null or now() < k.het_luc)   -- het han thi thoi chan
  ) then
    return null;                                  -- tu choi im lang
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- ---------- 2. GO HO SO KHOI PHONG VAN BANG ----------
-- ⚠ Dung cho ten nhan vat tuc tiu. Bang `ho_so_cong_khai` truoc gio KHONG co luat delete cho ai ca.
-- ⚠⚠ GO KHONG PHAI LA CAM. Nguoi choi bam Khoe lan nua la ho so hien lai. Muon chan han thi khoa
--    tai khoan — trigger `a_khoa_tai_khoan_tren_ho_so` se chan luon duong ghi ho so.
drop policy if exists "ho_so_tac_gia_xoa" on public.ho_so_cong_khai;
create policy "ho_so_tac_gia_xoa" on public.ho_so_cong_khai
  for delete using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);

-- ---------- 3. SO LIEU MAY CHU ----------
-- ⚠ `security invoker` (mac dinh) nen view VAN chiu RLS cua bang `saves`: nguoi thuong goi ra
--   dung mot dong cua chinh ho. Tac gia co luat `saves_tac_gia_doc` nen thay so that.
-- ⚠ Dem tren `saves` chu khong tren `ho_so_cong_khai`: nguoi chua bam Khoe van la nguoi choi.
create or replace view public.thong_ke_may_chu as
  select count(*)                                                          as tong_tai_khoan,
         count(*) filter (where updated_at > now() - interval '24 hours')   as vao_24_gio,
         count(*) filter (where updated_at > now() - interval '7 days')     as vao_7_ngay,
         count(*) filter (where updated_at > now() - interval '30 days')    as vao_30_ngay,
         count(*) filter (where updated_at <= now() - interval '7 days')    as mat_tich,
         min(updated_at)                                                    as cu_nhat,
         max(updated_at)                                                    as moi_nhat
    from public.saves;

-- ============================================================
-- ⚠ NHUNG GI TEP NAY KHONG LAM
-- · Khong tu xoa dong khoa da het han. Giu lai lam lich su vi pham; giao dien tach hai muc
--   "dang khoa" va "da het han".
-- · Khong cam nguoi choi khoe lai ho so sau khi bi go. Xem ghi chu o muc 2.
-- · Khong dem duoc nguoi choi NGOAI TUYEN chua bao gio dang nhap — ho khong co dong trong `saves`.
-- ============================================================

-- ============================================================
-- CAU SOI SAU KHI CHAY — dan RIENG cau nay de xem ket qua
-- ⚠ Supabase SQL Editor chi hien ket qua cua lenh CUOI CUNG.
--
--   select 'cot het_luc' as muc,
--          case when exists (select 1 from information_schema.columns
--                             where table_schema='public' and table_name='khoa_tai_khoan'
--                               and column_name='het_luc') then 'OK' else 'HONG' end as ket_qua
--   union all
--   select 'luat xoa ho so',
--          case when exists (select 1 from pg_policies where schemaname='public'
--                             and tablename='ho_so_cong_khai' and policyname='ho_so_tac_gia_xoa')
--               then 'OK' else 'HONG' end
--   union all
--   select 'view thong ke',
--          case when to_regclass('public.thong_ke_may_chu') is null then 'HONG' else 'OK' end
--   union all
--   select 'chot khoa doc het_luc',
--          case when pg_get_functiondef('public.chan_tai_khoan_bi_khoa'::regproc) like '%het_luc%'
--               then 'OK' else 'HONG — van dung ban cu' end;
-- ============================================================
