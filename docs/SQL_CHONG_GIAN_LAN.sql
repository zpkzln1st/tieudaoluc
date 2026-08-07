-- ============================================================
-- TIEU DAO LUC — CHONG GIAN LAN
--   Tang 1 (dot B): tran toc do theo DONG HO MAY CHU.
--   Tang 2 (dot D): soi TINH NHAT QUAN NOI TAI cua save — xp phai co GIO LAM di kem,
--                   va so con da ha phai khop so lan BOC SO. Chi lam duoc nho dot D
--                   (bo sinh so co hat giong) da bien moi duong thuong thanh tinh lai duoc.
--   CHAN: tu choi ghi de khi vuot tran >= 3 lan.
--
-- CACH DUNG: Supabase > SQL Editor > dan tron tep nay > Run. Chay lai duoc nhieu lan.
--
-- ⚠⚠ TEP NAY DUOC SINH RA TU BANG SO CUA GAME, DUNG SUA TAY.
--    Nguon: src/data/skills.js · src/data/combat.js · src/data/votong.js · src/data/dungeon.js
--           · src/data/classes.js · src/data/gear.js · src/engine/leveling.js
--    Doi bang so game thi chay lai _mockup/_covua_wip/_sinh_sql_tran.mjs.
--    Bai kiem _check_chonggianlan.mjs doi chieu tung so trong day voi game — lech la bao do.
-- ============================================================

-- ---------- 1. TRAN TOC DO: xp toi da moi giay cua tung track ----------
-- Nghe: lay hanh dong "lai" nhat (xp / thoi gian) — 'time' cua hanh dong la thoi gian THAT.
-- Chien Dau: lay con quai nhieu exp nhat CHIA CHO NHIP THAT cua engine (8 giay mot con).
--   ⚠ KHONG dung 'enemy.time': do la nhip MOI DON, ca hai con Lv100 deu ghi 17. Lay exp/time
--     ra 23,47 xp/giay — HEP hon that 2,1 lan, tang 2 se bao oan nguoi choi that.
create table if not exists public.tran_toc_do (
  khoa    text primary key,
  xp_giay numeric not null
);
insert into public.tran_toc_do (khoa, xp_giay) values
  ('chienDau', 49.8750),
  ('daLuyen', 1.4744),
  ('daTao', 5.8929),
  ('dieuNgu', 2.2000),
  ('doanhTao', 4.2667),
  ('luyenDan', 1.6471),
  ('phanhNham', 1.2857),
  ('phatMoc', 2.2667),
  ('thaiDang', 21.0526),
  ('thaiDuoc', 2.2368),
  ('thaiKhoang', 2.2436),
  ('thaiLien', 21.0526),
  ('thaiNguyet', 21.0526),
  ('thaiPhuc', 21.0526),
  ('thaiThanh', 21.0526),
  ('thaiTuyet', 21.0526),
  ('toaQuan', 0.5000)
on conflict (khoa) do update set xp_giay = excluded.xp_giay;

-- ⚠⚠ BAT RLS CHO CA BANG TRAN. Supabase cap quyen cho khoa an danh tren moi bang trong "public";
--   khong bat RLS thi ke gian TU NANG TRAN len vo cuc roi muon khai gi thi khai — chot thanh
--   do trang tri. Bat RLS ma KHONG dat luat nao = khong ai doc/ghi duoc.
--   Chot van chay binh thuong vi no la "security definer", chay bang quyen chu bang nen di vong qua RLS.
alter table public.tran_toc_do enable row level security;

-- ---------- 2. SO NGHI VAN ----------
create table if not exists public.nghi_van (
  id        bigserial primary key,
  user_id   uuid not null references auth.users(id) on delete cascade,
  luc       timestamptz not null default now(),
  giay      numeric not null,          -- bao lau ke tu lan ghi truoc
  chi_tiet  jsonb   not null,          -- [{ phep, khoa, tang, tran, gap }]
  la_tac_gia boolean not null default false
);
create index if not exists nghi_van_user_idx on public.nghi_van (user_id, luc desc);
-- Cot moi (chay lai tep tren so nghi van cu -> them cot, khong mat du lieu).
alter table public.nghi_van add column if not exists da_chan boolean not null default false;

alter table public.nghi_van enable row level security;
-- ⚠ KHONG mo cua doc cho nguoi thuong: ke gian khong duoc biet minh da bi ghi so.
--   Dot C them luat cho rieng uid tac gia doc. Trigger ghi bang quyen dinh nghia (security definer)
--   nen khong can luat INSERT.
drop policy if exists "nghi_van_khong_ai_doc" on public.nghi_van;
create policy "nghi_van_khong_ai_doc" on public.nghi_van for select using (false);

-- ---------- 3. MIEN TRU ----------
-- ⚠ CUA THOAT HIEM. Chan nham mot nguoi choi that thi save cua ho ngung dong bo VINH VIEN,
--   ma ho khong co cach nao tu go. Them uid vao day la ho duoc ghi lai ngay (van con ghi so).
create table if not exists public.mien_tru (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ly_do   text,
  luc     timestamptz not null default now()
);
alter table public.mien_tru enable row level security;

-- ---------- 4. HE SO ----------
create table if not exists public.tran_he_so (
  khoa  text primary key,
  gia_tri numeric not null
);
insert into public.tran_he_so (khoa, gia_tri) values
  ('he_so_an_toan', 10),        -- nhan them vao tran theo NHIP
  ('bu_nhan_roi_giay', 50400),  -- 14 gio: tran treo toi da (8h nen + 6h Dong Phu)
  ('bac_san_toi_thieu', 5000000), -- duoi muc nay thi khong buon ghi so Bac
  -- ⚠ CHAN TUYET DOI: mot lan ghi khong duoc tang qua ngan nay xp o BAT KY track nao.
  --   = 0.11 x ca duong len cap 100 (20.166.012 xp).
  ('tran_moi_lan_ghi', 2218261),
  -- ---- tang 2 ----
  ('nhip_danh_ms', 8000),       -- COMBAT_CYCLE_MS: mot con mot vong
  ('he_so_gio', 1.5),                -- quy gio lam duoc phep vuot dong ho bao nhieu lan
  -- Phu cap "thuong theo cuc" cho Chien Dau: Bi Canh mot lich day (14h) + tron luot Yeu Vuong,
  -- da nhan he so nhan EXP toi da (3.38x). Hai nguon nay KHONG ghi timeMs nao.
  ('phu_cap_chien_dau', 78978),
  ('sai_so_boc_so', 2),        -- khoa boc so: cho lech ngan nay lan boc
  -- ⚠⚠ CHAN: chi TU CHOI ghi de khi vuot tran tu ngan nay lan tro len. Duoi muc do chi ghi so.
  --   Do that: nguoi choi that manh nhat cach tran 3.0 lan (Chien Dau) / 3.1 lan (nghe),
  --   nen moc 3 lan la ngoai tam voi cua loi choi that.
  ('gap_de_chan', 3)
on conflict (khoa) do update set gia_tri = excluded.gia_tri;

-- Cung ly do voi bang tren: khong bat RLS thi ke gian tu sua he so.
alter table public.tran_he_so enable row level security;

-- ---------- 5. HAM PHU: doc so trong jsonb ma khong bao gio no ----------
-- ⚠ Save la jsonb do CLIENT gui len: mot o dang so hom nay co the thanh chuoi/null ngay mai.
--   Ep kieu thang la trigger nem loi -> KHONG AI LUU DUOC SAVE NUA. Luon di qua ham nay.
create or replace function public.so_jsonb(j jsonb) returns numeric
language sql immutable as $$
  select case when j is null or jsonb_typeof(j) <> 'number' then 0::numeric
              else (j #>> '{}')::numeric end;
$$;

-- Tong 'timeMs' cua MOI track. Game chi chay MOT hoat dong mot luc, nen tong nay khong the
-- tang nhanh hon dong ho that (cong them tran treo may).
create or replace function public.tong_gio_lam(d jsonb) returns numeric
language sql immutable as $$
  select coalesce(sum(public.so_jsonb(value -> 'timeMs')), 0)
  from jsonb_each(case when jsonb_typeof(d -> 'skills') = 'object' then d -> 'skills' else '{}'::jsonb end);
$$;

-- Tong so con da ha (counters.kills). Chi hai cho tang no: engine/activity.js (treo may)
-- va main.js awardKill (danh tai cho) — ca hai deu boc 'ropBac' DUNG MOT LAN cho moi con.
create or replace function public.tong_ha_quai(d jsonb) returns numeric
language sql immutable as $$
  select coalesce(sum(public.so_jsonb(value)), 0)
  from jsonb_each(case when jsonb_typeof(d #> '{counters,kills}') = 'object'
                       then d #> '{counters,kills}' else '{}'::jsonb end);
$$;

-- ---------- 6. CHOT: chay moi lan save duoc ghi de ----------
-- ⚠ Lay THOI GIAN CUA MAY CHU (now() so voi OLD.updated_at), khong tin moc gio cua client.
--   Tua dong ho tren may nguoi choi khong an thua.
create or replace function public.kiem_toc_do() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  giay numeric; cho_phep numeric; hs numeric; bu numeric; bac_san numeric; tran_lan numeric;
  nhip_ms numeric; hs_gio numeric; phu_cap numeric; sai_so numeric; gap_chan numeric;
  r record; cu numeric; moi numeric; tang numeric; tran_cho numeric; gap_nay numeric;
  gio_cu numeric; gio_moi numeric; d_gio numeric; d_track numeric;
  ha_cu numeric; ha_moi numeric; d_ha numeric; d_boc numeric;
  vuot jsonb := '[]'::jsonb;
  gap_lon numeric := 0;
  la_tg boolean; duoc_mien boolean; chan boolean := false;
begin
  -- Dong dau tien: khong co moc nao de so.
  if TG_OP <> 'UPDATE' then return NEW; end if;

  select gia_tri into hs       from tran_he_so where khoa = 'he_so_an_toan';
  select gia_tri into bu       from tran_he_so where khoa = 'bu_nhan_roi_giay';
  select gia_tri into bac_san  from tran_he_so where khoa = 'bac_san_toi_thieu';
  select gia_tri into tran_lan from tran_he_so where khoa = 'tran_moi_lan_ghi';
  select gia_tri into nhip_ms  from tran_he_so where khoa = 'nhip_danh_ms';
  select gia_tri into hs_gio   from tran_he_so where khoa = 'he_so_gio';
  select gia_tri into phu_cap  from tran_he_so where khoa = 'phu_cap_chien_dau';
  select gia_tri into sai_so   from tran_he_so where khoa = 'sai_so_boc_so';
  select gia_tri into gap_chan from tran_he_so where khoa = 'gap_de_chan';
  hs := coalesce(hs, 10); bu := coalesce(bu, 50400);
  bac_san := coalesce(bac_san, 5000000); tran_lan := coalesce(tran_lan, 2218261);
  nhip_ms := coalesce(nhip_ms, 8000); hs_gio := coalesce(hs_gio, 1.5);
  phu_cap := coalesce(phu_cap, 78978); sai_so := coalesce(sai_so, 2);
  gap_chan := coalesce(gap_chan, 3);

  giay := greatest(0, extract(epoch from (now() - OLD.updated_at)));
  cho_phep := (giay + bu) * hs;

  gio_cu  := tong_gio_lam(OLD.data);  gio_moi := tong_gio_lam(NEW.data);
  d_gio   := gio_moi - gio_cu;
  ha_cu   := tong_ha_quai(OLD.data);  ha_moi  := tong_ha_quai(NEW.data);
  d_ha    := ha_moi - ha_cu;

  -- ===== TANG 1: tran theo DONG HO MAY CHU =====
  -- xp tung track: lay CAI CHAT HON trong hai tran (theo nhip · theo duong cong cap).
  for r in select khoa, xp_giay from tran_toc_do loop
    cu  := so_jsonb(OLD.data->'skills'->r.khoa->'xp');
    moi := so_jsonb(NEW.data->'skills'->r.khoa->'xp');
    tang := moi - cu;
    if tang <= 0 then continue; end if;
    tran_cho := least(r.xp_giay * cho_phep, tran_lan);
    if tang > tran_cho then
      gap_nay := tang / greatest(tran_cho, 1);
      gap_lon := greatest(gap_lon, gap_nay);
      vuot := vuot || jsonb_build_object('phep', 'nhip', 'khoa', r.khoa, 'tang', tang,
                'tran', round(tran_cho), 'gap', round(gap_nay, 1));
    end if;
  end loop;

  -- Bac: chi ghi khi vua vuot tran vua qua muc san (ban ca tui do cung ra mot dong Bac that)
  cu  := so_jsonb(OLD.data->'currencies'->'bac');
  moi := so_jsonb(NEW.data->'currencies'->'bac');
  tang := moi - cu;
  if tang > bac_san then
    tran_cho := (select xp_giay from tran_toc_do where khoa = 'chienDau') * cho_phep;
    if tang > tran_cho then
      gap_nay := tang / greatest(tran_cho, 1);
      gap_lon := greatest(gap_lon, gap_nay);
      vuot := vuot || jsonb_build_object('phep', 'nhip', 'khoa', 'bac', 'tang', tang,
                'tran', round(tran_cho), 'gap', round(gap_nay, 1));
    end if;
  end if;

  -- ===== TANG 2A: QUY GIO LAM =====
  -- Game chay MOT hoat dong mot luc va 'timeMs' chi cong bang thoi gian THAT da tieu
  -- (activity.js: 'sk.timeMs += advancedMs'). Nen tong gio lam khong the chay nhanh hon
  -- dong ho may chu, cong them mot tran treo may. Day la rang buoc DUNG BANG, khong uoc luong.
  if d_gio > 0 then
    tran_cho := (giay + bu) * 1000 * hs_gio;
    if d_gio > tran_cho then
      gap_nay := d_gio / greatest(tran_cho, 1);
      gap_lon := greatest(gap_lon, gap_nay);
      vuot := vuot || jsonb_build_object('phep', 'quy_gio', 'khoa', 'tong', 'tang', d_gio,
                'tran', round(tran_cho), 'gap', round(gap_nay, 1));
    end if;
  end if;

  -- ===== TANG 2B: XP PHAI CO GIO LAM DI KEM =====
  -- Day la phep bat duoc thu ma tang 1 khong bat: sua thang so xp trong save. Tang 1 do xp
  -- theo DONG HO (ai cung co), tang 2B do xp theo GIO LAM DA GHI (chi cay that moi co).
  -- 'devSetAllLevel(100)' cong 20,17 trieu xp ma khong dong vao 'timeMs' mot mili giay nao.
  for r in select khoa, xp_giay from tran_toc_do loop
    cu  := so_jsonb(OLD.data->'skills'->r.khoa->'xp');
    moi := so_jsonb(NEW.data->'skills'->r.khoa->'xp');
    tang := moi - cu;
    if tang <= 0 then continue; end if;
    d_track := greatest(0, so_jsonb(NEW.data->'skills'->r.khoa->'timeMs')
                         - so_jsonb(OLD.data->'skills'->r.khoa->'timeMs'));
    if r.khoa = 'chienDau' then
      -- Save doi rat cu co the thieu 'cycleMs' giua tran -> awardKill ghi 1000ms thay vi 8000.
      -- Suy gio lam tu SO CON DA HA la duong thu hai, lay duong NAO RONG HON cho chac.
      d_track := greatest(d_track, greatest(0, d_ha) * nhip_ms);
      tran_cho := (d_track / 1000) * r.xp_giay * hs + phu_cap;
    else
      tran_cho := (d_track / 1000) * r.xp_giay * hs;
    end if;
    if tang > tran_cho then
      gap_nay := tang / greatest(tran_cho, 1);
      gap_lon := greatest(gap_lon, gap_nay);
      vuot := vuot || jsonb_build_object('phep', 'xp_khong_gio', 'khoa', r.khoa, 'tang', tang,
                'tran', round(tran_cho), 'gap', round(gap_nay, 1));
    end if;
  end loop;

  -- ===== TANG 2C: KHOA BOC SO =====
  -- Dot D bat moi lan boc so di qua 'state.rngDem[mien]'. Ha mot con quai LUON boc dung
  -- MOT lan o mien 'ropBac' (activity.js:348 · main.js:4063), ngay canh dong tang
  -- counters.kills. Hai so nay di khoa buoc voi nhau. Ai sua tay so con da ha (hoac cong
  -- xp qua duong khac roi che bang kills) se lam lech khoa nay.
  -- ⚠ CHI kiem khi CA HAI ban save deu co hat giong: ban truoc dot D khong co 'rngDem'.
  if d_ha > 0 and jsonb_typeof(OLD.data->'rngHat') = 'number' and jsonb_typeof(NEW.data->'rngHat') = 'number' then
    d_boc := so_jsonb(NEW.data->'rngDem'->'ropBac') - so_jsonb(OLD.data->'rngDem'->'ropBac');
    tran_cho := greatest(0, d_boc) + sai_so;
    if d_ha > tran_cho then
      gap_nay := d_ha / greatest(tran_cho, 1);
      gap_lon := greatest(gap_lon, gap_nay);
      vuot := vuot || jsonb_build_object('phep', 'khoa_boc_so', 'khoa', 'kills', 'tang', d_ha,
                'tran', round(tran_cho), 'gap', round(gap_nay, 1));
    end if;
  end if;

  -- ===== TANG 2D: NGOAI SU KIEN =====
  -- Sau ki nang su kien chi cay duoc khi su kien MO (bang su_kien cua Lenh Bai). Ke sua client
  -- de tu thay su kien mo se cay duoc o may minh, nhung day save len la lo ngay o day.
  -- Phep so: cua so ghi [OLD.updated_at, now()] phai GIAO voi cua so mo [mo_luc, dong_luc + 1h].
  --   · Nguoi choi that cay trong su kien roi mat mang, may ngay sau moi day duoc save:
  --     OLD.updated_at (lan day truoc) van nam TRUOC dong_luc -> giao -> KHONG oan.
  --   · Ke cay sau khi dong (ca hai moc deu sau dong_luc + 1h) -> khong giao -> ghi so + chan.
  -- ⚠ to_regclass: bang su_kien thuoc SQL_LENH_BAI.sql — chua chay tep do thi bo qua phep kiem,
  --   dung de chot no lam ca lang mat luu save.
  if to_regclass('public.su_kien') is not null then
    for r in select * from (values ('thaiPhuc', 'tet'), ('thaiThanh', 'xuan'), ('thaiLien', 'doanNgo'), ('thaiDang', 'vuLan'), ('thaiNguyet', 'trungThu'), ('thaiTuyet', 'giangSinh')) as t(khoa, ma) loop
      cu  := so_jsonb(OLD.data->'skills'->r.khoa->'xp');
      moi := so_jsonb(NEW.data->'skills'->r.khoa->'xp');
      tang := moi - cu;
      if tang <= 0 then continue; end if;
      if not exists (
        select 1 from public.su_kien s
         where s.ma = r.ma and s.mo_luc is not null and s.dong_luc is not null
           and s.mo_luc < now() and OLD.updated_at < s.dong_luc + interval '1 hour'
      ) then
        gap_nay := gap_chan;   -- du nguong chan; van qua duong mien_tru/tac gia nhu moi phep khac
        gap_lon := greatest(gap_lon, gap_nay);
        vuot := vuot || jsonb_build_object('phep', 'ngoai_su_kien', 'khoa', r.khoa, 'tang', tang,
                  'tran', 0, 'gap', round(gap_nay, 1));
      end if;
    end loop;
  end if;

  -- ===== GHI SO + CHAN =====
  if jsonb_array_length(vuot) > 0 then
    -- Tai khoan tac gia dung bang dev (F9) nen se tu bao dong. Danh dau de con loc ra.
    la_tg := (NEW.user_id = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);
    select exists(select 1 from mien_tru m where m.user_id = NEW.user_id) into duoc_mien;
    -- ⚠⚠ TAC GIA KHONG BAO GIO BI CHAN. Bang dev F9 la cong cu lam viec; chan no la tu khoa
    --   tay minh. Van ghi so day du de con doi chieu.
    chan := (gap_lon >= gap_chan) and not la_tg and not coalesce(duoc_mien, false);

    insert into public.nghi_van (user_id, giay, chi_tiet, la_tac_gia, da_chan)
      values (NEW.user_id, giay, vuot, la_tg, chan);

    if chan then
      -- ⚠⚠ TU CHOI IM LANG, khong 'raise exception'.
      --   1. 'raise exception' cuon nguoc CA dong nghi van vua ghi -> mat luon bang chung.
      --   2. Tra ve null thi Postgres bo qua lenh ghi de, dong nghi van van con.
      --   3. Client biet ngay: 'cloudPushSave' xin tra ve dong sau khi ghi, khong co dong
      --      nao ve tuc la bi tu choi (src/cloud.js).
      return null;
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists kiem_toc_do_tren_saves on public.saves;
create trigger kiem_toc_do_tren_saves
  before update on public.saves
  for each row execute function public.kiem_toc_do();

-- ============================================================
-- ⚠ CHOT NAY BAT DUOC GI
-- Tang 1 (dong ho may chu): sua Bac, nhan do, tua dong ho may minh.
-- Tang 2A (quy gio lam):    thoi phong thoi gian hoat dong.
-- Tang 2B (xp phai co gio): sua thang so xp / nhay cap — ke ca nhay TUNG IT MOT nhieu lan,
--                           vi khong co gio lam thi tran chi con phu cap 78.978 xp.
-- Tang 2C (khoa boc so):    sua so con da ha ma khong di qua engine.
-- Tang 2D (ngoai su kien):  cay ki nang su kien ngoai khoang mo/dong cua bang su_kien.
-- KHONG bat: cay nhanh hon that trong pham vi he so an toan 10 lan.
--
-- CHAN tu 3 lan tran tro len — TRU tai khoan tac gia va uid trong bang mien_tru.
-- Go oan cho mot nguoi: insert into public.mien_tru (user_id, ly_do) values ('<uid>', 'ly do');
-- ============================================================
