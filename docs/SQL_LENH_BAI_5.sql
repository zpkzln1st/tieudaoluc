-- ============================================================
-- TIEU DAO LUC — LENH BAI DOT 5: MA DOI QUA
--
-- CACH DUNG: Supabase > SQL Editor > dan tron tep nay > Run. Chay lai duoc nhieu lan.
-- Phai chay SAU khi da chay SQL_LENH_BAI.sql (can ham `qua_hop_le` va bang nhat ky).
--
-- Mot bang lam CA HAI viec:
--   · tu_dong = false -> ma nguoi choi GO TAY (giftcode)
--   · tu_dong = true  -> qua tu roi vao tui ai dang nhap trong khoang moc, khong phai go gi
-- Xem docs/THIET_KE_LENH_BAI.md muc C2 va C3.
-- ============================================================

-- ---------- 1. BANG MA ----------
create table if not exists public.ma_qua (
  ma            text        primary key,            -- CHU HOA, khong dau
  noi_dung      jsonb       not null,
  luot_toi_da   int         not null default 1,     -- 0 = khong gioi han so nguoi doi
  luot_da_dung  int         not null default 0,
  tu_dong       boolean     not null default false, -- true = client tu doi khi dang nhap
  mo_luc        timestamptz,
  dong_luc      timestamptz,
  ghi_chu       text        not null default '',
  tao_luc       timestamptz not null default now()
);

-- ⚠⚠ DUNG LAI `qua_hop_le` cua SQL_LENH_BAI.sql — CUNG danh sach cho phep, CUNG tran.
--    Viet rieng mot phep kiem thu hai la mai sau noi long mot ben ma quen ben kia.
alter table public.ma_qua drop constraint if exists ma_qua_noi_dung_hop_le;
alter table public.ma_qua add constraint ma_qua_noi_dung_hop_le check (public.qua_hop_le(noi_dung));

-- ⚠ Ma phai la chu HOA khong dau. Client `upper(trim(...))` truoc khi goi, rang buoc nay chan not
--   truong hop tao ma bang SQL tay roi khong ai go trung duoc.
alter table public.ma_qua drop constraint if exists ma_qua_dang_ma;
alter table public.ma_qua add constraint ma_qua_dang_ma check (ma ~ '^[A-Z0-9_]{3,32}$');

alter table public.ma_qua drop constraint if exists ma_qua_luot;
alter table public.ma_qua add constraint ma_qua_luot check (luot_toi_da >= 0 and luot_da_dung >= 0);

alter table public.ma_qua enable row level security;

-- ---------- 2. BANG DA DOI ----------
-- ⚠⚠ KHOA CHINH KEP (ma, user_id) LA CAI CHAN DOI HAI LAN.
--    Kiem bang `select` roi moi `insert` la lot: hai luot go cung luc deu thay "chua doi" roi
--    cung ghi. Khoa chinh de Postgres tu chan, khong dua vao thu tu chay cua ung dung.
create table if not exists public.ma_qua_da_doi (
  ma       text        not null,
  user_id  uuid        not null references auth.users(id) on delete cascade,
  luc      timestamptz not null default now(),
  primary key (ma, user_id)
);
alter table public.ma_qua_da_doi enable row level security;

-- ---------- 3. LUAT ----------
-- ⚠⚠ MA GO TAY KHONG DUOC DOC. Cho doc la ai cung mo bang dieu khien trinh duyet ra xem het ma.
--    Chi ma TU DONG va DANG TRONG HAN moi lo ra — client bat buoc phai biet de tu doi.
drop policy if exists "ma_qua_tu_dong_doc" on public.ma_qua;
create policy "ma_qua_tu_dong_doc" on public.ma_qua
  for select using (
    tu_dong
    and (mo_luc is null or mo_luc <= now())
    and (dong_luc is null or dong_luc > now())
  );
drop policy if exists "ma_qua_tac_gia_doc" on public.ma_qua;
create policy "ma_qua_tac_gia_doc" on public.ma_qua
  for select using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);
drop policy if exists "ma_qua_tac_gia_them" on public.ma_qua;
create policy "ma_qua_tac_gia_them" on public.ma_qua
  for insert with check (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);
drop policy if exists "ma_qua_tac_gia_sua" on public.ma_qua;
create policy "ma_qua_tac_gia_sua" on public.ma_qua
  for update using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid)
          with check (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);
drop policy if exists "ma_qua_tac_gia_xoa" on public.ma_qua;
create policy "ma_qua_tac_gia_xoa" on public.ma_qua
  for delete using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);

-- ⚠⚠ `ma_qua_da_doi` CHI CO LUAT SELECT. Khong cap insert cho ai ca — ghi chi qua ham
--    `doi_ma_qua` (security definer). Cap insert cho chu dong la ho tu ghi "da doi" gia,
--    hoac nguoc lai xoa di de doi lai vo han lan.
drop policy if exists "ma_qua_da_doi_chu_doc" on public.ma_qua_da_doi;
create policy "ma_qua_da_doi_chu_doc" on public.ma_qua_da_doi
  for select using (auth.uid() = user_id
                    or auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);

-- ---------- 4. HAM DOI MA ----------
-- Tra noi dung qua, hoac null neu khong doi duoc. KHONG noi ro vi sao khong doi duoc —
-- phan biet "ma sai" voi "ma dung nhung het luot" la mo duong cho nguoi ta do ma.
create or replace function public.doi_ma_qua(p_ma text) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  ai uuid := auth.uid();
  m  text := upper(btrim(coalesce(p_ma, '')));
  r  public.ma_qua%rowtype;
begin
  if ai is null or m = '' then return null; end if;
  -- ⚠ `for update` khoa dong lai: hai nguoi go cung luc thi nguoi sau doi sau, khong cung doc
  --   `luot_da_dung` cu roi cung tang mot.
  select * into r from public.ma_qua where ma = m for update;
  if not found then return null; end if;
  if r.mo_luc  is not null and now() <  r.mo_luc  then return null; end if;
  if r.dong_luc is not null and now() >= r.dong_luc then return null; end if;
  if r.luot_toi_da > 0 and r.luot_da_dung >= r.luot_toi_da then return null; end if;
  begin
    insert into public.ma_qua_da_doi (ma, user_id) values (r.ma, ai);
  exception when unique_violation then
    return null;                          -- da doi roi
  end;
  update public.ma_qua set luot_da_dung = luot_da_dung + 1 where ma = r.ma;
  return r.noi_dung;
end;
$$;

revoke all on function public.doi_ma_qua(text) from public;
grant execute on function public.doi_ma_qua(text) to authenticated;

-- ---------- 5. NHAT KY ----------
-- Dung lai ham `ghi_nhat_ky_lenh_bai`. Ma la khoa chinh dang chu nen lay thang lam muc tieu.
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
  elsif tg_table_name = 'cao_thi' then mt := coalesce(d->>'muc_tieu', d->>'tieu_de');
  else mt := d->>'user_id'; end if;
  insert into public.lenh_bai_nhat_ky (ai, viec, thao_tac, muc_tieu, chi_tiet)
  values (auth.uid(), tg_table_name, tg_op, mt, d);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- ⚠⚠ CHI ghi so INSERT va DELETE, KHONG ghi UPDATE.
--    Moi luot nguoi choi doi ma deu update `luot_da_dung` — ghi so thi mot ma phat cho ca lang
--    de ra hang nghin dong nhat ky, chon mat nhung dong lenh that su dang xem.
drop trigger if exists nhat_ky_ma_qua on public.ma_qua;
create trigger nhat_ky_ma_qua after insert or delete on public.ma_qua
  for each row execute function public.ghi_nhat_ky_lenh_bai();

-- ============================================================
-- ⚠ NHUNG GI TEP NAY KHONG LAM
-- · Khong noi cho nguoi choi biet vi sao ma khong dung duoc. Sai ma, het luot, het han, da doi
--   roi — deu tra ve rong nhu nhau.
-- · Khong sinh ma ngau nhien o may chu. Tac gia tu dat ten ma.
-- · Khong cho ma mang vat pham hay trang bi. Van la bon khoa cua `qua_hop_le`.
-- ============================================================

-- ============================================================
-- CAU SOI SAU KHI CHAY — dan RIENG cau nay de xem ket qua
-- ⚠ Supabase SQL Editor chi hien ket qua cua lenh CUOI CUNG.
--
--   select 'bang' as muc, tablename as ten,
--          case when rowsecurity then 'RLS bat' else 'HONG — RLS TAT' end as ket_qua
--     from pg_tables where schemaname='public' and tablename in ('ma_qua','ma_qua_da_doi')
--   union all
--   select 'luat', tablename || ' · ' || policyname, cmd
--     from pg_policies where schemaname='public' and tablename in ('ma_qua','ma_qua_da_doi')
--   union all
--   select 'ham', 'doi_ma_qua',
--          case when p.prosecdef then 'security definer' else 'HONG — khong definer' end
--     from pg_proc p join pg_namespace n on n.oid=p.pronamespace
--    where n.nspname='public' and p.proname='doi_ma_qua'
--   union all
--   select 'khoa chinh kep', conname, pg_get_constraintdef(oid)
--     from pg_constraint where conrelid='public.ma_qua_da_doi'::regclass and contype='p'
--   order by 1,2;
-- ============================================================
