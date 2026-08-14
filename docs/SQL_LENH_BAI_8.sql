-- ============================================================
-- TIEU DAO LUC — LENH BAI DOT 7: MO KHOA NOI DUNG DAN
--
-- CACH DUNG: Supabase > SQL Editor > dan tron tep nay > Run. Chay lai duoc nhieu lan.
-- Phai chay SAU khi da chay SQL_LENH_BAI.sql.
--
-- Mot bang khoa-gia tri cho nhung thu tac gia MO DAN theo thoi gian, khong can deploy lai.
-- Khoa dau tien: `tran_chuyen` — so lan Trung Sinh dang mo (0 toi 10).
--   0  = ca lang dung o cap 100. Day la gia tri NGAY MO MAY CHU.
--   1  = mo Nhat Chuyen, tran cap len 110.
--   10 = mo het, tran cap 200.
--
-- ⚠⚠ BANG NAY KHONG DINH TOI CHOT CHONG GIAN LAN nen de o tep rieng duoc.
--    Tran chong gian lan tinh theo TOC DO cay (xp moi giay x thoi gian troi); nang tran cap khong
--    lam ai cay nhanh hon, no chi keo dai quang duong. Khac han bang `he_so_may_chu` — bang do
--    NHAN thang vao tran nen bat buoc phai nam trong SQL_CHONG_GIAN_LAN.sql.
-- ============================================================

-- ---------- 1. BANG ----------
create table if not exists public.mo_khoa (
  khoa     text        primary key,
  gia_tri  numeric     not null default 0,
  ghi_chu  text        not null default '',
  cap_nhat timestamptz not null default now()
);

-- ⚠ Danh sach CHO PHEP, khong phai danh sach cam. Them noi dung mo dan moi thi sua o day.
alter table public.mo_khoa drop constraint if exists mo_khoa_khoa_hop_le;
alter table public.mo_khoa add constraint mo_khoa_khoa_hop_le
  check (khoa in ('tran_chuyen'));

-- ⚠⚠ TRAN 10 chot cung o may chu. Go nham mot so 0 nua la mo thang toi cap 200.
alter table public.mo_khoa drop constraint if exists mo_khoa_gia_tri_hop_le;
alter table public.mo_khoa add constraint mo_khoa_gia_tri_hop_le
  check (gia_tri >= 0 and gia_tri <= 10 and gia_tri = floor(gia_tri));

alter table public.mo_khoa enable row level security;

-- ⚠ Gieo 0 chu KHONG phai 10. Chay lai tep nay KHONG duoc dap len so tac gia da mo:
--   `do nothing` chu khong `do update`.
insert into public.mo_khoa (khoa, gia_tri, ghi_chu)
values ('tran_chuyen', 0, 'So lan Trung Sinh dang mo. 0 = ca lang dung o cap 100.')
on conflict (khoa) do nothing;

-- ---------- 2. LUAT ----------
-- Ai cung doc duoc, ke ca khach chua dang nhap: client phai biet tran de ve dung giao dien.
drop policy if exists "mo_khoa_ai_cung_doc" on public.mo_khoa;
create policy "mo_khoa_ai_cung_doc" on public.mo_khoa for select using (true);

drop policy if exists "mo_khoa_tac_gia_sua" on public.mo_khoa;
create policy "mo_khoa_tac_gia_sua" on public.mo_khoa
  for update using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid)
          with check (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);
drop policy if exists "mo_khoa_tac_gia_them" on public.mo_khoa;
create policy "mo_khoa_tac_gia_them" on public.mo_khoa
  for insert with check (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);

-- ⚠ KHONG cap quyen delete. Xoa dong `tran_chuyen` la client doc ra rong roi ve 0 —
--   ca lang dang o cap 150 bong dung khong Trung Sinh tiep duoc ma khong ai hieu vi sao.

-- ---------- 3. NHAT KY ----------
create or replace function public.ghi_nhat_ky_lenh_bai() returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  d jsonb;
  mt text;
begin
  if tg_op = 'DELETE' then d := to_jsonb(old); else d := to_jsonb(new); end if;
  if tg_table_name = 'su_kien' then mt := d->>'ma';
  elsif tg_table_name = 'ma_qua' then mt := d->>'ma';
  elsif tg_table_name = 'mo_khoa' then mt := d->>'khoa';
  elsif tg_table_name = 'cao_thi' then mt := coalesce(d->>'muc_tieu', d->>'tieu_de');
  else mt := d->>'user_id'; end if;
  insert into public.lenh_bai_nhat_ky (ai, viec, thao_tac, muc_tieu, chi_tiet)
  values (auth.uid(), tg_table_name, tg_op, mt, d);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists nhat_ky_mo_khoa on public.mo_khoa;
create trigger nhat_ky_mo_khoa after insert or update or delete on public.mo_khoa
  for each row execute function public.ghi_nhat_ky_lenh_bai();

-- ============================================================
-- ⚠ NHUNG GI TEP NAY KHONG LAM
-- · Ha `tran_chuyen` KHONG lam tut cap ai. No chi chan lan Trung Sinh TIEP THEO. Nguoi da chuyen
--   ba lan van giu tran 130 — ha tran cua ho la cap tut xuong, thanh kinh nghiem nhay lui, va
--   moi viec dang lam bi khoa lai.
-- · Khong tu mo theo lich. Tac gia bam tay o man Lenh Bai.
-- ============================================================

-- ============================================================
-- CAU SOI SAU KHI CHAY — dan RIENG cau nay de xem ket qua
-- ⚠ Supabase SQL Editor chi hien ket qua cua lenh CUOI CUNG.
--
--   select khoa, gia_tri::text as dang_mo,
--          (100 + gia_tri * 10)::text as tran_cap_tuong_ung, ghi_chu
--     from public.mo_khoa;
-- ============================================================
