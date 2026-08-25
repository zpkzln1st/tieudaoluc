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
-- ⚠⚠ 'tran_lan' la TRAN TUYET DOI MOI LAN GHI, RIENG cho tung track.
--    Ban truoc dung MOT so phang cho ca 17 track, do theo ki nang su kien: Chien Dau vot nhanh
--    gap 2,4 lan nen nguoi cay SACH bi TU CHOI GHI SAVE ngay lan dong bo dau tien sau mot dem
--    treo may (do that 3,91 lan tran). Nay moi track mot tran, suy tu chinh toc do cua no
--    nhan tran nhan roi cua no.
create table if not exists public.tran_toc_do (
  khoa    text primary key,
  xp_giay numeric not null,
  tran_lan numeric
);
alter table public.tran_toc_do add column if not exists tran_lan numeric;
insert into public.tran_toc_do (khoa, xp_giay, tran_lan) values
  ('chienDau', 49.8750, 17484512),
  ('daLuyen', 1.4744, 695335),
  ('daTao', 5.8929, 2779178),
  ('dieuNgu', 2.2000, 1037560),
  ('doanhTao', 4.2667, 2012237),
  ('luyenDan', 1.6471, 776783),
  ('phanhNham', 1.2857, 606367),
  ('phatMoc', 2.2667, 1069001),
  ('thaiDang', 21.0526, 9928801),
  ('thaiDuoc', 2.2368, 1054935),
  ('thaiKhoang', 2.2436, 1058118),
  ('thaiLien', 21.0526, 9928801),
  ('thaiNguyet', 21.0526, 9928801),
  ('thaiPhuc', 21.0526, 9928801),
  ('thaiThanh', 21.0526, 9928801),
  ('thaiTuyet', 21.0526, 9928801),
  ('toaQuan', 0.5000, 235810)
on conflict (khoa) do update set xp_giay = excluded.xp_giay, tran_lan = excluded.tran_lan;

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
  ('bu_nhan_roi_giay', 72000),  -- 20 gio: tran treo toi da (8h nen + 6h Dong Phu)
  ('bac_san_toi_thieu', 5000000), -- duoi muc nay thi khong buon ghi so Bac
  -- ⚠ CHAN TUYET DOI: mot lan ghi khong duoc tang qua ngan nay xp o BAT KY track nao.
  --   = 0.11 x ca duong len cap 100 (20.166.012 xp).
  ('tran_moi_lan_ghi', 2218261),
  -- ---- tang 2 ----
  ('nhip_danh_ms', 8000),       -- COMBAT_CYCLE_MS: mot con mot vong
  ('he_so_gio', 1.5),                -- quy gio lam duoc phep vuot dong ho bao nhieu lan
  -- Phu cap "thuong theo cuc" cho Chien Dau: Bi Canh mot lich day (20h) + tron luot Yeu Vuong,
  -- da nhan he so nhan EXP toi da (3.38x). Hai nguon nay KHONG ghi timeMs nao.
  ('phu_cap_chien_dau', 245950),
  ('sai_so_boc_so', 2),        -- khoa boc so: cho lech ngan nay lan boc
  -- ⚠⚠ CHAN: chi TU CHOI ghi de khi vuot tran tu ngan nay lan tro len. Duoi muc do chi ghi so.
  --   Do that: nguoi choi that manh nhat cach tran 2.0 lan (Chien Dau) / 2.0 lan (nghe),
  --   nen moc 3 lan la ngoai tam voi cua loi choi that.
  ('gap_de_chan', 3),
  -- ---- tang 2E: Dan Dien ----
  ('sai_so_dan_dien', 20),      -- cho lech ngan nay o (qua tac gia phat khong qua bo dem boc so)
  ('giay_nau_dan_re_nhat', 45)      -- cong thuc Duoc Phuong nhanh nhat: mot vien ton ngan nay giay
on conflict (khoa) do update set gia_tri = excluded.gia_tri;

-- Cung ly do voi bang tren: khong bat RLS thi ke gian tu sua he so.
alter table public.tran_he_so enable row level security;

-- ---------- 4b. HE SO TOAN MAY CHU (Lenh Bai dot 5) ----------
-- ⚠⚠ BANG NAY PHAI NAM TRONG CHINH TEP CHOT, khong duoc de o tep Lenh Bai rieng.
--    Chot doc no o moi lan ghi save. Ham plpgsql truy van mot bang CHUA TON TAI khong no luc
--    tao ham — no no LUC CHAY, va luc do la CA LANG khong luu duoc save nua.
--    De chung mot tep thi chay tep nay la co ca hai, khong bao gio lech.
--
-- NHIEU DONG mot khoa la CO Y: moi dong la mot dot. Chot phai biet he so da bat trong KHOANG
-- GIUA hai lan ghi, khong phai he so "dang bat luc nay" — nguoi cay luc x2 roi dong bo sau khi
-- dot do tat se bi ghi so oan.
create table if not exists public.he_so_may_chu (
  id       bigserial   primary key,
  khoa     text        not null,          -- exp | rot_do | gia_ban
  gia_tri  numeric     not null,
  mo_luc   timestamptz,
  dong_luc timestamptz,
  ghi_chu  text        not null default '',
  tao_luc  timestamptz not null default now()
);
alter table public.he_so_may_chu drop constraint if exists he_so_khoa_hop_le;
alter table public.he_so_may_chu add constraint he_so_khoa_hop_le
  check (khoa in ('exp', 'rot_do', 'gia_ban'));
-- ⚠⚠ TRAN 5 LA CON SO DO DUOC, khong phai so tron cho dep.
--    He so an toan cua chot la 10. Nguoi choi that manh nhat dang cham
--    3.38/10 = 0.34 tran.
--    Chot da nhan he so nay vao tran nen ban than no khong lam ai bi ghi so oan; tran 5
--    la de mot lan lo tay khong bien thanh cua mo toang.
alter table public.he_so_may_chu drop constraint if exists he_so_gia_tri_hop_le;
alter table public.he_so_may_chu add constraint he_so_gia_tri_hop_le
  check (gia_tri > 0 and gia_tri <= 5);
alter table public.he_so_may_chu enable row level security;

-- Ai cung doc duoc dot DANG chay (client can biet de nhan EXP/rot do). Dot chua toi gio thi khong.
drop policy if exists "he_so_ai_cung_doc" on public.he_so_may_chu;
create policy "he_so_ai_cung_doc" on public.he_so_may_chu
  for select using (
    (mo_luc is null or mo_luc <= now()) and (dong_luc is null or dong_luc > now())
  );
drop policy if exists "he_so_tac_gia_doc" on public.he_so_may_chu;
create policy "he_so_tac_gia_doc" on public.he_so_may_chu
  for select using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);
drop policy if exists "he_so_tac_gia_them" on public.he_so_may_chu;
create policy "he_so_tac_gia_them" on public.he_so_may_chu
  for insert with check (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);
drop policy if exists "he_so_tac_gia_xoa" on public.he_so_may_chu;
create policy "he_so_tac_gia_xoa" on public.he_so_may_chu
  for delete using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);
-- ⚠⚠ LUAT SUA — BAT BUOC PHAI CO. Nut "Go" o Lenh Bai nay DAT 'dong_luc' ve bay gio chu khong xoa
--    dong nua (xem chu thich cua 'cloudHeSoDong', src/cloud.js): dong bi xoa thi khong con moc nao
--    de chot dem mieng 10 phut bu cho bo dem o client, va nguoi ban hang loat trong khe do bi ghi
--    so oan. Thieu luat nay thi lenh sua bi RLS chan IM LANG — nut trong nhu chay ma khong lam gi.
drop policy if exists "he_so_tac_gia_sua" on public.he_so_may_chu;
create policy "he_so_tac_gia_sua" on public.he_so_may_chu
  for update using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid)
          with check (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);

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

-- So O DA LAP cua luoi Dan Dien trong khoang pham [tu, den]. KEP theo suc chua tung pham:
-- ban luu khai 999 o mot o cung chi tinh dung suc chua that (engine cung kep y het, ddBang()).
create or replace function public.o_dan_dien(d jsonb, tu int, den int) returns numeric
language sql immutable as $$
  select coalesce(sum(least(public.so_jsonb(d #> array['danDien', b.nh, (c.i - 1)::text]), c.suc)), 0)
  from (values ('tinh'),('khi'),('than')) as b(nh)
  cross join (values (1,2),(2,3),(3,4),(4,5),(5,6),(6,7),(7,8),(8,9),(9,10)) as c(i, suc)
  where c.i between tu and den;
$$;

-- So VIEN DAN da ROI ra cho tai khoan nay, tinh theo BO DEM BOC SO.
-- ⚠⚠ Day la rang buoc DUNG BANG, khong uoc luong: moi vien dan roi ton DUNG MOT lan boc o
--    mien rieng 'bcDanNhanh' (engine/dungeon.js) hoac 'yvDanNhanh' (engine/worldboss.js).
--    Hai mien do KHONG dung chung voi bat ky duong boc nao khac.
create or replace function public.boc_dan_dien(d jsonb) returns numeric
language sql immutable as $$
  select public.so_jsonb(d -> 'rngDem' -> 'bcDanNhanh') + public.so_jsonb(d -> 'rngDem' -> 'yvDanNhanh');
$$;

-- So vien dan Dan Dien tai khoan nay MUA RONG tren San Giao Dich, trong khoang pham [tu, den].
-- ⚠⚠ VI SAO PHAI CO: tang 2E chot 'so o da lap <= so lan boc so'. Vien dan MUA tren san khong di
--    qua rng(state,'bcDanNhanh') nen no lap o ma khong cong bo dem. Co 'app.san' chi mien cho lenh
--    ghi CUA SAN; lenh ghi luc NGUOI CHOI DUNG vien dan la save thuong, khong duoc mien.
--    Khong co ham nay thi mua 21 vien la bi ghi so, mua 60 vien la bi CHAN THAT — nguoi choi sach.
-- ⚠⚠ DOC TU BANG 'san_rao', KHONG doc tu ban luu. Ban luu do may nguoi choi giu, khai bao nhieu
--    cung duoc; 'san_rao' chi ghi duoc bang ham cua san.
-- ⚠ MUA TRU DI BAN. Chi tinh mua thi mua roi ban lai la bom tran mien phi (chi mat thue).
-- ⚠ greatest(..., 0): ban rong tra 0. Phep nay chi duoc NOI tran, khong bao gio duoc SIET —
--   siet la ghi so oan nguoi cay that.
-- ⚠ plpgsql chu khong phai sql: than plpgsql khong bi phan tich luc tao ham, nen tep nay van chay
--   duoc khi chua ai chay SQL_SAN_GIAO_DICH.sql. Chua co bang thi tra 0 = giu nguyen tran cu.
create or replace function public.dan_mua_san(u uuid, tu int, den int) returns numeric
language plpgsql stable security definer set search_path = pg_catalog, public as $$
declare n numeric;
begin
  if to_regclass('public.san_rao') is null then return 0; end if;
  select coalesce(sum(case when r.nguoi_mua = u then r.so_luong else -r.so_luong end), 0) into n
    from public.san_rao r
   where r.trang_thai = 'ban' and r.loai = 'item'
     and r.item_id ~ '^dd(Tinh|Khi|Than)[1-9]$'
     and substring(r.item_id from '[1-9]$')::int between tu and den
     and (r.nguoi_mua = u or r.nguoi_ban = u);
  -- ⚠⚠ TRA VE SO RONG, CO THE AM — KHONG kep o day. Kep rieng tung ham la mat ve TRU: nhan dan
  --    lam qua roi ban het di thi 'dan_qua_tang' van cong nguyen so vien, con so am cua duong San
  --    bi kep ve 0 nuot mat, nen han muc phinh len ma trong tay khong con vien nao.
  --    Do that: nhan 34 vien roi ban het -> cua so mien to no tu 20 o len 54 o.
  --    Nay kep MOT LAN o cho goi, tren TONG cua ca hai duong.
  return coalesce(n, 0);
end $$;
-- ⚠ Khoa cua NGAY TAI DAY. Dong nay von chi nam o docs/SQL_KHOA_CUA_RPC.sql — nghia la chay tep
--   nay tren mot CSDL moi ma chua chay tep kia thi ham ho ra cho ca anon. Lenh revoke chay lai duoc
--   nhieu lan nen de o ca hai noi khong hai gi.
revoke all on function public.dan_mua_san(uuid, integer, integer) from public, anon, authenticated;

-- ⚠⚠ DAN DIEN NHAN TU HOP QUA / MA QUA cung phai duoc tinh vao han muc, y het dan mua tren San.
--    Hai duong do cong THANG vao tui ('_congQua', src/main.js) — KHONG di qua bo dem boc so va
--    KHONG de lai dong nao trong 'san_rao'. Nen nguoi nhan lap o xong la vuot tran 2E:
--    tac gia phat 60 vien pham cao (gia tri 194.400 Bac = 9,7% tran giao dien 2.000.000, khong
--    mot cau canh bao nao) thi nguoi nhan bi CHAN THAT, ban luu thoi dong bo ma khong bao gi.
--    Rao chan giao dien dem GIA TRI chu khong dem SO VIEN nen no cho lot toi 617 vien pham 9.
-- ⚠ Chua o MAY CHU chu khong phai cam tac gia phat dan: phat dan la viec hop le, cai sai la
--   han muc khong biet den no.
create or replace function public.dan_qua_tang(u uuid, tu int, den int) returns numeric
language plpgsql stable security definer set search_path = pg_catalog, public as $$
declare n numeric := 0; m numeric := 0;
begin
  -- Hop qua: chi dem dong DA NHAN cua chinh nguoi nay.
  if to_regclass('public.qua_tang') is not null then
    select coalesce(sum(v.value::numeric), 0) into n
      from public.qua_tang q
      cross join lateral jsonb_each_text(coalesce(q.noi_dung->'items', '{}'::jsonb)) as v(key, value)
     where q.user_id = u and q.nhan_luc is not null
       and v.key ~ '^dd(Tinh|Khi|Than)[1-9]$'
       and substring(v.key from '[1-9]$')::int between tu and den;
  end if;
  -- Ma qua: bang 'ma_qua_da_doi' ghi ai da doi ma nao.
  if to_regclass('public.ma_qua_da_doi') is not null and to_regclass('public.ma_qua') is not null then
    select coalesce(sum(v.value::numeric), 0) into m
      from public.ma_qua_da_doi d
      join public.ma_qua g on g.ma = d.ma
      cross join lateral jsonb_each_text(coalesce(g.noi_dung->'items', '{}'::jsonb)) as v(key, value)
     where d.user_id = u
       and v.key ~ '^dd(Tinh|Khi|Than)[1-9]$'
       and substring(v.key from '[1-9]$')::int between tu and den;
  end if;
  -- Cung le voi 'dan_mua_san': tra so tho, viec kep de cho goi lam MOT LAN tren tong.
  return coalesce(n, 0) + coalesce(m, 0);
end $$;
-- ⚠⚠ KHOA CUA NGAY TAI DAY, dung de sang tep khac. Supabase MO moi ham trong schema 'public' ra
--    lam RPC theo mac dinh (xem docs/SQL_KHOA_CUA_RPC.sql). Ham nay nhan 'uuid' va DOC BANG cua
--    NGUOI KHAC, nen de ho thi ai cung goi duoc de biet nguoi khac nhan bao nhieu vien dan.
--    'dan_mua_san' da bi khoa tu lau o tep kia; ham MOI ma quen khoa la lai ho mot cua.
-- ⚠ Dat ngay canh lenh tao de hai thu di CUNG NHAU. Tach ra hai tep la som muon cung lech —
--   dung cai benh ma [[gotcha-tieudao-sinh-sql-lech-bo-sinh]] da ghi so.
revoke all on function public.dan_qua_tang(uuid, integer, integer) from public, anon, authenticated;

-- Cua so cho phep tra nhanh. Bang 'san_rao' da co chi muc theo nguoi_ban, chua co theo nguoi_mua.
-- ⚠ Boc trong DO de tep nay van chay duoc khi chua ai chay SQL_SAN_GIAO_DICH.sql.
do $$ begin
  if to_regclass('public.san_rao') is not null then
    create index if not exists san_rao_nguoi_mua on public.san_rao (nguoi_mua) where trang_thai = 'ban';
  end if;
end $$;

-- ---------- 6. CHOT: chay moi lan save duoc ghi de ----------
-- ⚠ Lay THOI GIAN CUA MAY CHU (now() so voi OLD.updated_at), khong tin moc gio cua client.
--   Tua dong ho tren may nguoi choi khong an thua.
-- ⚠⚠ CAU TREN CHI DUNG KHI DA CHAY `docs/SQL_DONG_DAU_GIO.sql`. `OLD.updated_at` von la chuoi
--    ma lan day truoc CLIENT tu dat trong loi goi upsert (src/cloud.js) — khong co trigger nao
--    ep no ve gio may chu. Day mot ban luu voi `updated_at` lui ve nam 2000 thi `giay` o duoi
--    ra khoang 8x10^8, va MOI cai tran trong ham nay no theo. Tep kia dat mot chot
--    `a_dong_dau_gio_tren_saves` chay TRUOC chot nay (Postgres xep trigger BEFORE theo TEN) de
--    ghi de `new.updated_at := now()`. Chua chay tep do thi ca muc 6 nay chi la trang tri.
create or replace function public.kiem_toc_do() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  giay numeric; cho_phep numeric; cho_phep_bac numeric; hs numeric; hs_goc numeric; bu numeric; bac_san numeric; tran_lan numeric;
  nhip_ms numeric; hs_gio numeric; phu_cap numeric; sai_so numeric; gap_chan numeric;
  hs_exp numeric; hs_ban numeric; so_cua_so numeric;
  r record; cu numeric; moi numeric; tang numeric; tran_cho numeric; gap_nay numeric;
  gio_cu numeric; gio_moi numeric; d_gio numeric; d_track numeric;
  ha_cu numeric; ha_moi numeric; d_ha numeric; d_boc numeric;
  sai_dd numeric; giay_nau numeric; boc_dan numeric;
  o_cu numeric; o_moi numeric; o_cao_cu numeric; o_cao_moi numeric;
  vuot jsonb := '[]'::jsonb;
  gap_lon numeric := 0;
  la_tg boolean; duoc_mien boolean; chan boolean := false;
begin
  -- ⚠⚠ LENH GHI CUA SAN GIAO DICH THI CHO QUA (docs/SQL_SAN_GIAO_DICH.sql).
  --    Nguoi ban nhan mot cuc Bac tu san — do la tien do SAN chuyen giua hai tai khoan, khong
  --    phai nguoi choi tu cay ra. Thieu dong nay thi ban duoc mon dat tien la bi ghi so nghi van
  --    OAN, va du ba lan la bi CHAN that.
  --    Co 'app.san' chi song trong giao dich cua ham san (set_config(..., true)), client khong
  --    dat duoc qua PostgREST.
  if coalesce(current_setting('app.san', true), '') = '1' then return NEW; end if;

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
  select gia_tri into sai_dd   from tran_he_so where khoa = 'sai_so_dan_dien';
  select gia_tri into giay_nau from tran_he_so where khoa = 'giay_nau_dan_re_nhat';
  hs := coalesce(hs, 10); bu := coalesce(bu, 72000);
  bac_san := coalesce(bac_san, 5000000); tran_lan := coalesce(tran_lan, 2218261);
  nhip_ms := coalesce(nhip_ms, 8000); hs_gio := coalesce(hs_gio, 1.5);
  phu_cap := coalesce(phu_cap, 245950); sai_so := coalesce(sai_so, 2);
  gap_chan := coalesce(gap_chan, 3);
  sai_dd := coalesce(sai_dd, 20); giay_nau := coalesce(giay_nau, 45);

  -- ⚠⚠ TINH 'giay' va 'so_cua_so' NGAY TU DAY, TRUOC moi phep nhan tran. Dat chung o duoi (canh
  --    'cho_phep') la dong 'phu_cap := ... least(so_cua_so, 20)' chay khi 'so_cua_so' con NULL,
  --    va 'least(NULL, 20)' ra NULL -> 'phu_cap' NULL -> 'tang > NULL' khong bao gio dung ->
  --    CA TANG 2B TAT NGOM ma khong mot dong loi nao. Toi vua tu lam ra loi do va bat duoc bang
  --    cach doc tep SQL sinh ra; phep do bang JS KHONG thay, vi no khong chay thu tu cua plpgsql.
  giay := greatest(0, extract(epoch from (now() - OLD.updated_at)));
  so_cua_so := greatest(1, ceil((giay + bu) / bu));

  -- ⚠⚠ HE SO EXP TOAN MAY CHU. Bat x2 cuoi tuan ma tran khong nhan theo la CA LANG bi ghi so
  --    roi bi chan. Lay cai LON NHAT tung bat trong KHOANG GIUA hai lan ghi, khong lay cai
  --    "dang bat luc nay": nguoi cay luc x2 roi dong bo sau khi dot do tat cung phai duoc tinh.
  --    Bang nam trong CHINH TEP NAY (muc 4b) nen truy van khong bao gio no vi thieu bang.
  select coalesce(max(gia_tri), 1) into hs_exp from public.he_so_may_chu
   where khoa = 'exp'
     and (mo_luc  is null or mo_luc  <  now())
     -- ⚠⚠ CONG DEM BANG DUNG NHIP LAM MOI CUA CLIENT (10 phut). Client giu he so trong bo dem
     --    va chi lam moi moi 10 phut, con nhip day save la 15 giay — nen ngay sau khi mot dot
     --    dong, client VAN nhan he so ma tran thi da ve x1. Khong co dem nay thi ai cay/ban trong
     --    khe do deu bi ghi so oan. Dem chi NOI tran nen khong mo cua cho gian lan.
     and (dong_luc is null or dong_luc + interval '600 seconds' > OLD.updated_at);
  hs_exp := greatest(1, coalesce(hs_exp, 1));
  -- ⚠⚠ GIU LAI HE SO AN TOAN CHUA NHAN he so EXP. Tran BAC khong duoc an theo dot EXP: dot EXP
  --    khong lam ai kiem duoc them mot dong Bac nao, no chi cho xp. Nhan vao la tran Bac tu noi
  --    ra dung bang so lan cua dot — do that: dot EXP x5 keo tran Bac tu 35.917.481 len
  --    179.587.406, va moc CHAN tu 107.752.444 len 538.762.219. Ca hai dot x5 thi tran thanh
  --    897.937.031 va moc chan thanh 2.693.811.094 — mot cai lo, khong phai mot cai tran.
  --    Tran Bac da co he so rieng cua no la 'hs_ban' (dot Gia Ban); 'hs_exp' la an theo hai lan.
  hs_goc := hs;
  hs := hs * hs_exp;
  -- ⚠⚠ TRAN TUYET DOI cung phai nhan theo. Khong nhan thi mot phien treo 14 gio o ki nang su kien
  --    bac 6 (~1,93 trieu xp) nhan 5 la vuot tran 2.218.261 — ghi so oan nguoi choi that.
  -- ⚠ Noi tran nay KHONG mo cua cho gian lan tho: devSetAllLevel(100) cong 20.166.012 xp
  --   ma KHONG dong vao 'timeMs' mot mili giay nao, nen TANG 2B (xp phai co gio lam di kem) van
  --   bat duoc no gap hang tram lan. Tang 1 chua bao gio la hang rao duy nhat.
  tran_lan := tran_lan * hs_exp;
  -- ⚠⚠ PHU CAP CUNG PHAI NO THEO, ca hai chieu:
  --   1. Nhan 'hs_exp': dot x2 EXP toan may chu lam phan thuong-theo-cuc cua Bi Canh to gap doi,
  --      ma phu cap dung yen -> nguoi chay Bi Canh SACH bi ghi so, x4 tro len la bi CHAN.
  --   2. No theo khoang cach hai lan ghi: phu cap la khoan cho MOT lan day tran nhan roi. Nguoi
  --      choi mat mang / chua dang nhap ca tuan roi moi day duoc mot cuc bay lich Bi Canh thi
  --      con so that gap 6,1 lan phu cap phang -> CHAN THAT, ma tang 1 khong bat vi van duoi tran.
  --      Chia cho 'bu' chu khong phai mot hang so roi: 'bu' chinh la mot lan day tran nhan roi.
  -- ⚠⚠ RIENG PHU CAP THI PHAI CHAN SO CUA SO LAI. Phu cap la khoan cho xp KHONG kem gio lam
  --    (Bi Canh, Yeu Vuong), tuc la ve duy nhat cua tang 2B con lai khi ke gian lan bom thang
  --    so xp. De no no vo han thi chi can NHIN THAT LAU roi day mot cuc: cho 30 ngay la phu cap
  --    thanh 9,1 trieu, du cho cu nhay cap 100 (20,17 trieu) tut xuong 2,2 lan — DUOI nguong chan.
  --    Chan o 20 cua so (~16,7 ngay): cu nhay cap 100 van 4,1 lan -> CHAN. Nguoi cay THAT khong
  --    dung toi tran nay vi ho co gio lam that, ve chinh cua 2B da du rong.
  phu_cap := phu_cap * hs_exp * least(so_cua_so, 20);

  -- ⚠⚠ HE SO GIA BAN TOAN MAY CHU. Client nhan he so nay vao Bac thu ve o 'sellItem'/'sellGear'
  --    (src/main.js, qua heSoGiaBan cua engine/leveling.js). Bat x2 gia ban ma tran Bac khong noi
  --    theo la ban ca tui do mot phat bi ghi so oan. Lay dung khuon hs_exp o tren.
  -- ⚠ He so 'rot_do' KHONG can noi tran nao: no chi doi TI LE roi, khong them mot lan boc so nao,
  --   nen tang 2C va tang 2E (deu dem theo LAN BOC) khong dong den. Client cung khong duoc nhan
  --   no vao duong roi dan o dungeon.js/worldboss.js — xem chu thich cua heSoRotDo.
  select coalesce(max(gia_tri), 1) into hs_ban from public.he_so_may_chu
   where khoa = 'gia_ban'
     and (mo_luc  is null or mo_luc  <  now())
     -- ⚠⚠ Cung mot dem voi 'exp' o tren — cung mot bo dem client, cung mot khe lech.
     --    Do that: dot x2 chi can 3,3 ngay cay gom hang la cham muc ghi so, dot x5 chi can 1,3 ngay.
     and (dong_luc is null or dong_luc + interval '600 seconds' > OLD.updated_at);
  hs_ban := greatest(1, coalesce(hs_ban, 1));

  cho_phep := (giay + bu) * hs;
  -- Duong rieng cho Bac: KHONG an theo dot EXP (xem chu thich cua 'hs_goc' o tren).
  cho_phep_bac := (giay + bu) * hs_goc;
  -- ⚠⚠ BAO NHIEU LAN DAY TRAN NHAN ROI da troi qua ke tu lan ghi truoc.
  --    Game choi duoc KHONG CAN dang nhap, va nhip day chi chay khi 'isLoggedIn'. Nguoi cay sach
  --    ca tuan o che do chua dang nhap (hoac mat mang / Supabase nghi) roi moi day mot cuc la
  --    chuyen binh thuong. Tran tuyet doi va phu cap deu phai no theo, khong thi cang cham dong
  --    bo cang de bi CHAN — dung cai bay ma nguoi choi khong the tu biet de tranh.

  gio_cu  := tong_gio_lam(OLD.data);  gio_moi := tong_gio_lam(NEW.data);
  d_gio   := gio_moi - gio_cu;
  ha_cu   := tong_ha_quai(OLD.data);  ha_moi  := tong_ha_quai(NEW.data);
  d_ha    := ha_moi - ha_cu;

  -- ===== TANG 1: tran theo DONG HO MAY CHU =====
  -- xp tung track: lay CAI CHAT HON trong hai tran (theo nhip · theo duong cong cap).
  -- ⚠⚠ PHAI GHI RO TEN BANG: 'tran_lan' vua la COT cua tran_toc_do vua la BIEN plpgsql khai o
  --    tren. PL/pgSQL mac dinh 'variable_conflict = error', nen viet tran (khong co ten bang) la
  --    Postgres nem "column reference tran_lan is ambiguous" o MOI LAN GHI SAVE — ca lang khong
  --    ai luu duoc nua, te hon han cai loi dang di va. Ghi ro ten bang thi no chac chan la COT.
  for r in select khoa, xp_giay, tran_toc_do.tran_lan as tran_track from tran_toc_do loop
    cu  := so_jsonb(OLD.data->'skills'->r.khoa->'xp');
    moi := so_jsonb(NEW.data->'skills'->r.khoa->'xp');
    tang := moi - cu;
    if tang <= 0 then continue; end if;
    -- ⚠⚠ TRAN TUYET DOI LAY THEO TUNG TRACK. Ban cu dung mot so PHANG cho ca 17 track, do theo
    --    ki nang su kien: Chien Dau vot nhanh gap 2,4 lan nen nguoi cay SACH bi TU CHOI GHI SAVE
    --    (3,91 lan tran) ngay lan dong bo dau tien sau mot dem treo may.
    -- ⚠ 'coalesce' de con chay duoc voi bang cu chua co cot 'tran_lan': thieu thi lui ve so phang.
    tran_cho := least(r.xp_giay * cho_phep, coalesce(r.tran_track, tran_lan) * hs_exp * so_cua_so);
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
    tran_cho := (select xp_giay from tran_toc_do where khoa = 'chienDau') * cho_phep_bac * hs_ban;
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
  -- ⚠⚠ VA PHAI CUNG MOT HAT GIONG. 'd_boc' la HIEU cua hai bo dem TUYET DOI, nen hieu do chi co
  --    nghia khi hai ban luu cung mot dong doi hat. Nguoi choi hai may: may B con giu ban truoc
  --    dot D, mo len la 'rng.js' gieo hat MOI va 'rngDem' ve rong, trong khi 'counters.kills'
  --    giu nguyen — day len la lech dung bang so con da ha tu truoc, va bi CHAN ngay lan dau
  --    du ho khong gian lan mot con nao. Khac hat thi BO QUA vong nay, dung bat oan.
  if d_ha > 0 and jsonb_typeof(OLD.data->'rngHat') = 'number' and jsonb_typeof(NEW.data->'rngHat') = 'number'
     and so_jsonb(OLD.data->'rngHat') = so_jsonb(NEW.data->'rngHat') then
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
      -- ⚠⚠ HAI MEP PHAI CO DEM NHU NHAU. Mep dong von co 1 gio dem, mep mo thi KHONG CO MOT GIAY
      --    NAO: dong ho may nguoi choi nhanh 15 giay la bon cua chan phia client deu mo (ca bon
      --    deu hoi dong ho MAY MINH), ho cay that, roi bi chan ngay. Do that: +15s -> 1 lan chan,
      --    +60s -> 4 lan. Nay mep mo cung duoc 1 gio dem.
      if not exists (
        select 1 from public.su_kien s
         where s.ma = r.ma and s.mo_luc is not null and s.dong_luc is not null
           and s.mo_luc - interval '1 hour' < now() and OLD.updated_at < s.dong_luc + interval '1 hour'
      ) then
        -- ⚠⚠ KHONG GAN CUNG 'gap_chan' NUA — day la cho gay ra KET BAN LUU VINH VIEN.
        --    Gan cung nghia la tu choi ghi NGAY LAN DAU. Ma lenh ghi bi tu choi thi 'updated_at'
        --    KHONG NHICH, nen lan sau 'OLD.updated_at' van nam ngoai cua so, van bi tu choi —
        --    vong lap khong loi ra. Dong ho may cham qua 60 phut, hay hai may dong bo lech thu
        --    tu, deu roi vao day: bay xp ket lai vinh vien, moi 15 giay mot dong nghi van.
        --    Nay chi GHI SO. Muon chan thi phai co mot phep do khac cung bao, nhu moi tang khac.
        --    Ke cay ngoai su kien van lo ra day day trong so nghi van de tac gia doi chieu.
        gap_nay := 1;
        gap_lon := greatest(gap_lon, gap_nay);
        vuot := vuot || jsonb_build_object('phep', 'ngoai_su_kien', 'khoa', r.khoa, 'tang', tang,
                  'tran', 0, 'gap', round(gap_nay, 1));
      end if;
    end loop;
  end if;

  -- ===== TANG 2E: DAN DIEN =====
  -- Luoi Dan Dien cong 162 o chi so VINH VIEN ma khong nam trong bat ky phep soi nao:
  -- sua thang 'state.danDien' la len het, khong dong vao xp lan gio lam mot chut nao.
  -- ⚠ CHI kiem khi CA HAI ban save deu co hat giong, y het tang 2C: ban truoc dot D khong co
  --   'rngDem' nen bo dem boc so bang 0, kiem la ghi so oan ca lang.
  -- ⚠ Chi kiem khi so o TANG. Ban luu nam yen khong bao gio bi soi.
  if jsonb_typeof(OLD.data->'rngHat') = 'number' and jsonb_typeof(NEW.data->'rngHat') = 'number' then
    boc_dan  := boc_dan_dien(NEW.data);
    -- 2E-a: pham 6-9 KHONG CO CONG THUC — chung chi den tu duong roi. Tran nay CHAT,
    --       khong phu thuoc cap nghe: bao nhieu vien roi thi bay nhieu lan boc, khong hon.
    o_cao_cu  := o_dan_dien(OLD.data, 6, 9);
    o_cao_moi := o_dan_dien(NEW.data, 6, 9);
    if o_cao_moi > o_cao_cu then
      tran_cho := boc_dan + sai_dd;
      -- ⚠⚠ CONG THEM SO VIEN MUA TREN SAN. Vien dan mua khong di qua bo dem boc so, nen thieu ve
      --    nay la nguoi mua dan bi ghi so tu o thu 21 va bi CHAN THAT o o thu 60.
      -- ⚠ Chi truy van 'san_rao' KHI tran co so da vuot. Cua nay dong voi gan het moi lenh luu,
      --   nen khong dat them mot phep doc bang vao duong nong.
      -- ⚠⚠ VA SO VIEN NHAN TU HOP QUA / MA QUA. Cung mot benh voi vien mua tren San: cong thang
      --    vao tui, khong qua bo dem boc so. Thieu ve nay thi tac gia phat dan lam qua ra mat la
      --    nguoi nhan bi CHAN THAT, ma rao chan giao dien khong he canh bao (no dem GIA TRI chu
      --    khong dem SO VIEN — 60 vien pham 9 chi bang 9,7% tran 2.000.000 Bac).
      if o_cao_moi > tran_cho then
        -- ⚠ KEP MOT LAN TREN TONG. Kep rieng tung ham la mat ve TRU cua duong San (xem chu thich
        --   trong 'dan_mua_san'): ban dan tang di ma han muc van con nguyen.
        tran_cho := tran_cho + greatest(dan_mua_san(NEW.user_id, 6, 9)
                                      + dan_qua_tang(NEW.user_id, 6, 9), 0);
      end if;
      if o_cao_moi > tran_cho then
        gap_nay := o_cao_moi / greatest(tran_cho, 1);
        gap_lon := greatest(gap_lon, gap_nay);
        vuot := vuot || jsonb_build_object('phep', 'dan_dien_roi', 'khoa', 'pham6_9',
                  'tang', o_cao_moi, 'tran', round(tran_cho), 'gap', round(gap_nay, 1));
      end if;
    end if;
    -- 2E-b: ca luoi. Pham 1-5 nau duoc nen cong them suc nau suy tu GIO LUYEN DAN.
    --       Long hon 2E-a nhieu, nhung van chan duoc ban luu sua tay: luoi day ma gio luyen dan
    --       bang 0 va chua boc lan nao thi khong duong nao giai thich noi.
    o_cu  := o_dan_dien(OLD.data, 1, 9);
    o_moi := o_dan_dien(NEW.data, 1, 9);
    if o_moi > o_cu then
      tran_cho := boc_dan + so_jsonb(NEW.data->'skills'->'luyenDan'->'timeMs') / (giay_nau * 1000) + sai_dd;
      -- ⚠ Ca luoi, nen lay ca 9 pham: mua tron 60 o nau duoc cung dung bang gap 3,0 = nguong chan.
      if o_moi > tran_cho then
        -- ⚠ Kep MOT LAN tren tong, y het 2E-a o tren.
        tran_cho := tran_cho + greatest(dan_mua_san(NEW.user_id, 1, 9)
                                      + dan_qua_tang(NEW.user_id, 1, 9), 0);
      end if;
      if o_moi > tran_cho then
        gap_nay := o_moi / greatest(tran_cho, 1);
        gap_lon := greatest(gap_lon, gap_nay);
        vuot := vuot || jsonb_build_object('phep', 'dan_dien_tong', 'khoa', 'tong',
                  'tang', o_moi, 'tran', round(tran_cho), 'gap', round(gap_nay, 1));
      end if;
    end if;
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
--                           vi khong co gio lam thi tran chi con phu cap 245.950 xp.
-- Tang 2C (khoa boc so):    sua so con da ha ma khong di qua engine.
-- Tang 2D (ngoai su kien):  cay ki nang su kien ngoai khoang mo/dong cua bang su_kien.
-- Tang 2E (Dan Dien):       lap o Dan Dien nhieu hon so vien dan tung roi ra (bo dem boc so)
--                           cong suc nau suy tu gio Luyen Dan, cong so vien MUA RONG tren San.
-- KHONG bat: cay nhanh hon that trong pham vi he so an toan 10 lan.
--
-- CHAN tu 3 lan tran tro len — TRU tai khoan tac gia va uid trong bang mien_tru.
-- Go oan cho mot nguoi: insert into public.mien_tru (user_id, ly_do) values ('<uid>', 'ly do');
-- ============================================================
