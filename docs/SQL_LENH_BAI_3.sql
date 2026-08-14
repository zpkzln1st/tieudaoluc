-- ============================================================
-- TIEU DAO LUC — LENH BAI DOT 3: BANG CAO THI (thong bao + thu rieng)
--
-- CACH DUNG: Supabase > SQL Editor > dan tron tep nay > Run. Chay lai duoc nhieu lan.
-- Phai chay SAU khi da chay SQL_LENH_BAI.sql.
--
-- Mot bang lam CA HAI viec:
--   · muc_tieu = null  -> cao thi cho CA GIANG HO
--   · muc_tieu = uid   -> thu RIENG gui mot nguoi
-- Khong de ra bang thu hai cho thu rieng: cung mot vong doi, cung mot luat, cung mot cho doc.
--
-- ⚠⚠ VAN GHI MOC, KHONG GHI CONG TAC. Giong het bang su_kien: client dem hai moc vao ban luu nen
--    mat mang van tu tat dung han. Ghi cong tac thi cao thi bao tri co the treo mai mai.
-- Xem docs/THIET_KE_LENH_BAI.md muc E.
-- ============================================================

-- ---------- 1. BANG ----------
create table if not exists public.cao_thi (
  id        bigserial   primary key,
  tieu_de   text        not null default '',
  noi_dung  text        not null default '',
  muc       text        not null default 'thuong',    -- thuong | quan_trong | bao_tri
  muc_tieu  uuid        references auth.users(id) on delete cascade,
  mo_luc    timestamptz,
  dong_luc  timestamptz,
  tao_luc   timestamptz not null default now()
);

-- ⚠ Ba muc CO DINH. Muc la duong dan re nhanh cua client (bao tri thi ngung day ban luu),
--   nen mot chuoi la lot vao la client roi vao nhanh khong ai viet.
alter table public.cao_thi drop constraint if exists cao_thi_muc_hop_le;
alter table public.cao_thi add constraint cao_thi_muc_hop_le
  check (muc in ('thuong', 'quan_trong', 'bao_tri'));

-- ⚠⚠ CHAN DO DAI. Neu tai khoan tac gia bi chiem, ke chiem duoc se dan ca quyen sach vao day va
--    moi nguoi choi phai tai ve. Chan o may chu chu dung chan o o nhap.
alter table public.cao_thi drop constraint if exists cao_thi_do_dai;
alter table public.cao_thi add constraint cao_thi_do_dai
  check (char_length(tieu_de) <= 80 and char_length(noi_dung) <= 600);

alter table public.cao_thi enable row level security;

-- ---------- 2. LUAT DOC ----------
-- ⚠⚠ LOC MOC NGAY TRONG LUAT, khong de client tu loc. Client loc thi ai mo bang dieu khien trinh
--    duyet cung doc truoc duoc cao thi chua toi gio dang.
-- ⚠ `auth.uid()` la null voi khach chua dang nhap -> ve `muc_tieu is null` van dung, khach van
--   doc duoc cao thi chung. Do la co y: thong bao bao tri phai toi duoc CA nguoi chua dang nhap.
drop policy if exists "cao_thi_ai_cung_doc" on public.cao_thi;
create policy "cao_thi_ai_cung_doc" on public.cao_thi
  for select using (
    (muc_tieu is null or auth.uid() = muc_tieu)
    and (mo_luc is null or mo_luc <= now())
    and (dong_luc is null or dong_luc > now())
  );

-- Tac gia doc TAT CA, ke ca cai chua toi gio va thu rieng gui nguoi khac — khong thi khong quan ly duoc.
drop policy if exists "cao_thi_tac_gia_doc" on public.cao_thi;
create policy "cao_thi_tac_gia_doc" on public.cao_thi
  for select using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);

-- ---------- 3. LUAT GHI — CHI TAC GIA ----------
drop policy if exists "cao_thi_tac_gia_them" on public.cao_thi;
create policy "cao_thi_tac_gia_them" on public.cao_thi
  for insert with check (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);
drop policy if exists "cao_thi_tac_gia_sua" on public.cao_thi;
create policy "cao_thi_tac_gia_sua" on public.cao_thi
  for update using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid)
          with check (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);
drop policy if exists "cao_thi_tac_gia_xoa" on public.cao_thi;
create policy "cao_thi_tac_gia_xoa" on public.cao_thi
  for delete using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);

-- ---------- 4. NHAT KY ----------
-- Thay lai ham cu de no biet them bang `cao_thi`. Ham nay cung dung cho su_kien / qua_tang /
-- khoa_tai_khoan — ba trigger kia khong phai tao lai, chung goi ham theo ten.
-- ⚠⚠ RE NHANH THEO tg_op TRUOC. Trigger DELETE thi `new` chua duoc gan; dung `new.x` la loi luc chay.
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
  elsif tg_table_name = 'cao_thi' then mt := coalesce(d->>'muc_tieu', d->>'tieu_de');
  else mt := d->>'user_id'; end if;
  insert into public.lenh_bai_nhat_ky (ai, viec, thao_tac, muc_tieu, chi_tiet)
  values (auth.uid(), tg_table_name, tg_op, mt, d);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- AFTER chu khong BEFORE: chi ghi so khi lenh da that su vao duoc.
drop trigger if exists nhat_ky_cao_thi on public.cao_thi;
create trigger nhat_ky_cao_thi after insert or update or delete on public.cao_thi
  for each row execute function public.ghi_nhat_ky_lenh_bai();

-- ============================================================
-- ⚠ NHUNG GI TEP NAY KHONG LAM
-- · Khong chan duoc nguoi choi choi tiep trong luc bao tri. Game von OFFLINE-FIRST: muc 'bao_tri'
--   chi bao client TAM NGUNG DAY ban luu va bay cao thi. Ban luu don lai trong may ho, day len
--   mot lan khi het han.
-- · Khong gui thong bao day (push). Nguoi choi thay cao thi o nhip doc 10 phut, hoac luc vao game.
-- · Khong danh dau "da doc" tren may chu. Danh dau nam trong ban luu cua tung nguoi.
-- ============================================================

-- ============================================================
-- CAU SOI SAU KHI CHAY — dan RIENG cau nay de xem ket qua
-- ⚠ Supabase SQL Editor chi hien ket qua cua lenh CUOI CUNG.
--
--   select 'rls' as muc, case when relrowsecurity then 'OK' else 'HONG' end as ket_qua
--     from pg_class where oid = 'public.cao_thi'::regclass
--   union all
--   select 'so luat', count(*)::text from pg_policies where schemaname='public' and tablename='cao_thi'
--   union all
--   select 'rang buoc', string_agg(conname, ' | ') from pg_constraint
--    where conrelid='public.cao_thi'::regclass and contype='c'
--   union all
--   select 'trigger nhat ky', count(*)::text from pg_trigger
--    where tgrelid='public.cao_thi'::regclass and not tgisinternal;
-- ============================================================
