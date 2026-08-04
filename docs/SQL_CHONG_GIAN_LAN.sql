-- ============================================================
-- TIEU DAO LUC — Dot B1: CHONG GIAN LAN, buoc GHI SO (chua chan)
--
-- CACH DUNG: Supabase > SQL Editor > dan tron tep nay > Run. Chay lai duoc nhieu lan.
--
-- ⚠⚠ TEP NAY DUOC SINH RA TU BANG SO CUA GAME, DUNG SUA TAY.
--    Nguon: src/data/skills.js (107 hanh dong) + src/data/combat.js (bang quai).
--    Doi bang so game thi chay lai _mockup/_covua_wip/_sinh_sql_tran.mjs.
--    Bai kiem _check_chonggianlan.mjs doi chieu tung so trong day voi game — lech la bao do.
-- ============================================================

-- ---------- 1. TRAN TOC DO: xp toi da moi giay cua tung track ----------
-- Lay hanh dong "lai" nhat trong tung nghe (xp / thoi gian), va con quai "lai" nhat cho Chien Dau.
create table if not exists public.tran_toc_do (
  khoa    text primary key,
  xp_giay numeric not null
);
insert into public.tran_toc_do (khoa, xp_giay) values
  ('chienDau', 23.4706),
  ('daLuyen', 1.4744),
  ('daTao', 5.8929),
  ('dieuNgu', 2.2000),
  ('doanhTao', 4.2667),
  ('luyenDan', 1.6471),
  ('phanhNham', 1.2857),
  ('phatMoc', 2.2667),
  ('thaiDuoc', 2.2368),
  ('thaiKhoang', 2.2436),
  ('toaQuan', 0.5000)
on conflict (khoa) do update set xp_giay = excluded.xp_giay;

-- ---------- 2. SO NGHI VAN ----------
create table if not exists public.nghi_van (
  id        bigserial primary key,
  user_id   uuid not null references auth.users(id) on delete cascade,
  luc       timestamptz not null default now(),
  giay      numeric not null,          -- bao lau ke tu lan ghi truoc
  chi_tiet  jsonb   not null,          -- [{ khoa, tang, tran, gap }]
  la_tac_gia boolean not null default false
);
create index if not exists nghi_van_user_idx on public.nghi_van (user_id, luc desc);

alter table public.nghi_van enable row level security;
-- ⚠ KHONG mo cua doc cho nguoi thuong: ke gian khong duoc biet minh da bi ghi so.
--   Dot C se them luat cho rieng uid tac gia doc. Trigger ghi bang quyen dinh nghia (security definer)
--   nen khong can luat INSERT.
drop policy if exists "nghi_van_khong_ai_doc" on public.nghi_van;
create policy "nghi_van_khong_ai_doc" on public.nghi_van for select using (false);

-- ---------- 3. HE SO ----------
-- ⚠ RONG RAI CO Y. Bi Canh / Yeu Vuong / nhiem vu deu tra thuong theo CUC chu khong theo nhip,
--   nen tran chat la chan nham nguoi choi that. Buoc nay chi de bat gian lan THO
--   (nhay thang len cap 100, tu cong mot ti Bac) — sai so mot bac do lon van lot luoi.
create table if not exists public.tran_he_so (
  khoa  text primary key,
  gia_tri numeric not null
);
insert into public.tran_he_so (khoa, gia_tri) values
  ('he_so_an_toan', 10),        -- nhan them vao tran theo NHIP
  ('bu_nhan_roi_giay', 50400),  -- 14 gio: tran treo toi da cua Dong Phu
  ('bac_san_toi_thieu', 5000000), -- duoi muc nay thi khong buon ghi so Bac
  -- ⚠ CHAN TUYET DOI: mot lan ghi khong duoc tang qua ngan nay xp o BAT KY track nao.
  --   = 0.5 x ca duong len cap 100 (1.386.509 xp).
  --   Day moi la cai bat duoc gian lan tho. Tran theo nhip mot minh KHONG du: nhip cua
  --   Chien Dau suy tu "enemy.time" la nhip MOI DON nen cao gap ~35 lan that.
  ('tran_moi_lan_ghi', 693255)
on conflict (khoa) do update set gia_tri = excluded.gia_tri;

-- ---------- 4. CHOT: chay moi lan save duoc ghi de ----------
-- ⚠ Lay THOI GIAN CUA MAY CHU (now() so voi OLD.updated_at), khong tin moc gio cua client.
--   Tua dong ho tren may nguoi choi khong an thua.
create or replace function public.kiem_toc_do() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  giay numeric; cho_phep numeric; hs numeric; bu numeric; bac_san numeric; tran_lan numeric;
  r record; cu numeric; moi numeric; tang numeric; tran_cho numeric;
  vuot jsonb := '[]'::jsonb;
  la_tg boolean;
begin
  -- Dong dau tien: khong co moc nao de so.
  if TG_OP <> 'UPDATE' then return NEW; end if;

  select gia_tri into hs      from tran_he_so where khoa = 'he_so_an_toan';
  select gia_tri into bu      from tran_he_so where khoa = 'bu_nhan_roi_giay';
  select gia_tri into bac_san from tran_he_so where khoa = 'bac_san_toi_thieu';
  select gia_tri into tran_lan from tran_he_so where khoa = 'tran_moi_lan_ghi';
  hs := coalesce(hs, 10); bu := coalesce(bu, 50400); bac_san := coalesce(bac_san, 5000000);
  tran_lan := coalesce(tran_lan, 346627);

  giay := greatest(0, extract(epoch from (now() - OLD.updated_at)));
  cho_phep := (giay + bu) * hs;

  -- xp tung track: lay CAI CHAT HON trong hai tran.
  --   · tran theo NHIP  — dung cho nghe, "time" cua hanh dong la thoi gian that.
  --   · tran MOI LAN GHI — chan tuyet doi theo duong cong cap; day moi la cai cuu duoc
  --     Chien Dau, vi nhip suy tu "enemy.time" (nhip moi don) cao gap ~35 lan that.
  for r in select khoa, xp_giay from tran_toc_do loop
    cu  := coalesce((OLD.data->'skills'->r.khoa->>'xp')::numeric, 0);
    moi := coalesce((NEW.data->'skills'->r.khoa->>'xp')::numeric, 0);
    tang := moi - cu;
    if tang <= 0 then continue; end if;
    tran_cho := least(r.xp_giay * cho_phep, tran_lan);
    if tang > tran_cho then
      vuot := vuot || jsonb_build_object('khoa', r.khoa, 'tang', tang,
                'tran', round(tran_cho), 'gap', round((tang / nullif(tran_cho,0))::numeric, 1));
    end if;
  end loop;

  -- Bac: chi ghi khi vua vuot tran vua qua muc san (ban ca tui do cung ra mot dong Bac that)
  cu  := coalesce((OLD.data->'currencies'->>'bac')::numeric, 0);
  moi := coalesce((NEW.data->'currencies'->>'bac')::numeric, 0);
  tang := moi - cu;
  if tang > bac_san then
    tran_cho := (select xp_giay from tran_toc_do where khoa = 'chienDau') * cho_phep;
    if tang > tran_cho then
      vuot := vuot || jsonb_build_object('khoa', 'bac', 'tang', tang,
                'tran', round(tran_cho), 'gap', round((tang / nullif(tran_cho,0))::numeric, 1));
    end if;
  end if;

  if jsonb_array_length(vuot) > 0 then
    -- Tai khoan tac gia dung bang dev (F9) nen se tu bao dong. Danh dau de con loc ra.
    select exists(select 1 from auth.users u where u.id = NEW.user_id
                  and u.id = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid) into la_tg;
    insert into public.nghi_van (user_id, giay, chi_tiet, la_tac_gia)
      values (NEW.user_id, giay, vuot, coalesce(la_tg, false));

    -- ⚠⚠ BUOC B1 CHI GHI SO, KHONG CHAN. Muon chan thi bo dau chu thich dong duoi.
    --    ĐUNG bat chan khi chua xem so nghi van mot thoi gian: chan nham nguoi choi that
    --    con te hon bo lot mot ke gian.
    -- raise exception 'toc do vuot tran' using errcode = 'check_violation';
  end if;

  return NEW;
end;
$$;

drop trigger if exists kiem_toc_do_tren_saves on public.saves;
create trigger kiem_toc_do_tren_saves
  before update on public.saves
  for each row execute function public.kiem_toc_do();

-- ============================================================
-- ⚠ TRAN NAY BAT DUOC GI
-- Bat: sua Bac, sua cap, nhan do, tua dong ho may minh.
-- KHONG bat: cay nhanh hon that mot chut, va moi thu khac trong sai so mot bac do lon.
-- Muon bat den do do thi phai lam Dot D (may chu tinh lai tien do) — xem docs/THIET_KE_ONLINE.md.
-- ============================================================
