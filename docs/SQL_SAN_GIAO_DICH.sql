-- ============================================================
-- SAN GIAO DICH — chi NGUOI CHOI ban, KHONG co bot
-- ============================================================
-- Chay MOT lan tren Supabase SQL Editor. Chay lai duoc (idempotent).
--
-- ⚠⚠ VI SAO MOI THU PHAI NAM O DAY CHU KHONG O CLIENT:
--    Ban luu do MAY NGUOI CHOI giu (`saves.data` la ca state, client day len). Neu client tu go
--    mon khoi tui roi bao may chu "toi treo mon nay", thi chi can nap lai ban luu cu la mon quay
--    ve tui trong khi tin rao van treo — NHAN DOI DO. Nen:
--      · Ham o day tu doc `saves.data` cua NGUOI GOI, tu bo mon khoi `gearBag`, tu ghi lai.
--      · Client chi goi ham roi TAI LAI save. No khong bao gio tu tay dung vao tui.
--
-- ⚠⚠ HAI CHOT CHAN QUAY NGUOC (o cuoi tep):
--      1. Save day len ma trong `gearBag` co `uid` DANG TREO BAN  -> tu choi.
--      2. Save day len mang `sanSeq` CU HON so may chu dang giu  -> tu choi.
--    Chot 2 bit luon duong lay lai Bac da tieu.
--
-- ⚠ Tu choi bang `return null`, KHONG `raise exception` — y het chot chong gian lan: exception
--   cuon nguoc ca giao dich lam mat so sach, con tra null thi Postgres bo qua lenh ghi im lang.

-- ============================================================
-- 1. BANG TIN RAO
-- ============================================================
create table if not exists public.san_rao (
  id         bigserial   primary key,
  nguoi_ban  uuid        not null references auth.users(id) on delete cascade,
  ten_ban    text        not null default '',      -- ban CHUP ten luc treo, khoi join sang save
  mon        jsonb       not null,                 -- nguyen instance trang bi
  mon_uid    text        not null,                 -- `mon->>'uid'`, de chot chan quay nguoc bam vao
  gia        bigint      not null check (gia > 0 and gia <= 1000000000),
  trang_thai text        not null default 'treo' check (trang_thai in ('treo','ban','go')),
  nguoi_mua  uuid        references auth.users(id) on delete set null,
  tao_luc    timestamptz not null default now(),
  xong_luc   timestamptz
);

-- ⚠ MOT `uid` chi duoc treo MOT tin dang song. Day la cai neo cua ca he: thieu no thi treo mot
--   mon hai lan la ra hai tin, ban ca hai.
create unique index if not exists san_rao_uid_dang_treo
  on public.san_rao (mon_uid) where trang_thai = 'treo';
create index if not exists san_rao_dang_treo on public.san_rao (tao_luc desc) where trang_thai = 'treo';
create index if not exists san_rao_cua_toi on public.san_rao (nguoi_ban, trang_thai);

alter table public.san_rao enable row level security;

-- Ai cung XEM duoc tin dang treo (do la muc dich cua cai san). KHONG cap INSERT/UPDATE/DELETE cho
-- ai ca — moi thao tac di qua ba ham ben duoi.
drop policy if exists "san_ai_cung_xem" on public.san_rao;
create policy "san_ai_cung_xem" on public.san_rao
  for select using (trang_thai = 'treo' or nguoi_ban = auth.uid() or nguoi_mua = auth.uid());

-- ============================================================
-- 2. SO GIAO DICH — chi them duoc, khong ai sua
-- ============================================================
create table if not exists public.san_so (
  id        bigserial   primary key,
  rao_id    bigint      not null,
  nguoi_ban uuid        not null,
  nguoi_mua uuid        not null,
  gia       bigint      not null,
  thue      bigint      not null,
  luc       timestamptz not null default now()
);
alter table public.san_so enable row level security;
drop policy if exists "san_so_ben_lien_quan_xem" on public.san_so;
create policy "san_so_ben_lien_quan_xem" on public.san_so
  for select using (nguoi_ban = auth.uid() or nguoi_mua = auth.uid());

-- ============================================================
-- 3. TIEN ICH DUNG CHUNG
-- ============================================================
-- Thue ban 15% (docs/NOI_DUNG_GAME.md H2). `ceil` chu khong `round`: bai hoc tu lan dung san
-- truoc — lam tron xuong lam thue bao ve 0 voi hang gia thap, mo ke mua-ban-lai hoa von.
create or replace function public.san_thue(p_gia bigint)
returns bigint language sql immutable as $$ select ceil(p_gia * 0.15)::bigint $$;

-- Doc save cua mot tai khoan. Tra null neu chua co dong nao.
create or replace function public.san_doc_save(p_uid uuid)
returns jsonb language sql security definer set search_path = pg_catalog, public as $$
  select data from public.saves where user_id = p_uid
$$;

-- Ghi save + TANG SO DEM SAN. So dem la thu chot chan quay nguoc bam vao.
-- ⚠ Dat co `app.san` de chot chong gian lan bo qua lenh ghi nay — day la tien do san chuyen,
--   khong phai nguoi choi tu cay ra.
create or replace function public.san_ghi_save(p_uid uuid, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare moi jsonb; seq bigint; n int;
begin
  seq := coalesce((p_data->>'sanSeq')::bigint, 0) + 1;
  moi := jsonb_set(p_data, '{sanSeq}', to_jsonb(seq), true);
  moi := jsonb_set(moi, '{lastSave}', to_jsonb((extract(epoch from now()) * 1000)::bigint), true);
  perform set_config('app.san', '1', true);        -- true = chi trong giao dich nay
  update public.saves
     set data = moi,
         last_save = (extract(epoch from now()) * 1000)::bigint,
         updated_at = now()
   where user_id = p_uid;

  -- ⚠⚠ LUOI AN TOAN CUOI CUNG — DUNG GO BON DONG DUOI.
  --    Bang `saves` co NHIEU chot BEFORE. Mot chot tra `null` la Postgres BO LENH GHI ma KHONG
  --    bao loi gi. Ma cac bang so sach (`san_rao`, `san_so`, `san_thu_mua`) KHONG co chot nao
  --    nen lenh ghi vao do VAN COMMIT. Ket qua la giao dich nua song nua chet: so ghi la da giao
  --    dich, con do va Bac khong he chuyen. Vi du that: treo ban luc bao tri thi tin len San ma
  --    mon VAN NAM TRONG TUI — ban xong la NHAN DOI mon.
  --    Dem `row_count` la cach DUY NHAT biet dieu do vua xay ra.
  -- ⚠ O DAY `raise` MOI DUNG, nguoc voi le thuong cua du an. Le "tu choi bang return, dung raise"
  --   co la vi exception cuon nguoc ca so. Cuon nguoc chinh la cai ta CAN o day: cuon het thi
  --   khong con nua vo nao. Lop nay bat duoc ca nhung chot CHUA AI NGHI RA.
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'san-ghi-bi-chan: lenh ghi ban luu bi mot chot chan (uid=%, so dong=%)', p_uid, n;
  end if;
end $$;

-- ---------- CUA CHAN SOM: GHI DUOC BAN LUU KHONG ----------
-- Lop THU HAI, chi de bao loi tu te. Lop thu nhat la phep dem `row_count` ngay tren.
-- ⚠ Hai chot chay DAU tren `saves` (`a_bao_tri_tren_saves`, `a_khoa_tai_khoan_tren_saves`)
--   KHONG doc co mien tru `app.san` nhu hai chot chay sau, nen lenh ghi cua San van bi chung bo.
--   Ham nay hoi TRUOC de tra loi tu te thay vi de `raise` nem ra mot chuoi ky thuat.
-- ⚠⚠ HAI VI TU DUOI DAY PHAI KHOP TUNG CHU voi `chan_khi_bao_tri` (docs/SQL_LENH_BAI_6.sql) va
--   `chan_tai_khoan_bi_khoa` (docs/SQL_LENH_BAI.sql). Lech nhau la ham nay bao "ghi duoc" ma chot
--   van bo lenh ghi — luc do chi con lop mot do lai, va nguoi choi an mot loi kho hieu.
-- ⚠ MOT reason DUY NHAT cho ca hai truong hop. Noi thang "tai khoan bi khoa" la pha tinh IM LANG
--   cua chot khoa: nguoi gian lan biet minh bi khoa thi lap tai khoan khac.
-- ⚠⚠ plpgsql CHU KHONG PHAI sql. Than ham `language sql` BI PHAN TICH ngay luc tao ham, nen neu
--    ai chay tep nay TRUOC SQL_LENH_BAI.sql / SQL_LENH_BAI_6.sql thi hai bang duoi day chua ton tai
--    va lenh `create function` NO NGAY, hong ca tep. Than plpgsql thi khong bi phan tich.
--    Day dung la khuon `dan_mua_san` (docs/SQL_CHONG_GIAN_LAN.sql) da dung san — dung lai, dung de
--    khuon thu hai. Chua co bang thi coi nhu chua co chot do, va dung the that.
create or replace function public.san_ghi_duoc(p_uid uuid)
returns boolean
language plpgsql stable security definer
set search_path = pg_catalog, public
as $$
begin
  if p_uid is null then return false; end if;

  -- Chot khoa tai khoan: KHONG mien cho ai ca, ke ca tac gia (khop `chan_tai_khoan_bi_khoa`).
  if to_regclass('public.khoa_tai_khoan') is not null
     and exists (select 1 from public.khoa_tai_khoan k where k.user_id = p_uid) then
    return false;
  end if;

  -- Chot bao tri: tac gia KHONG bao gio bi chan (khop `chan_khi_bao_tri`).
  if p_uid = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid then return true; end if;

  if to_regclass('public.cao_thi') is not null
     and exists (select 1 from public.cao_thi
                  where muc = 'bao_tri'
                    and muc_tieu is null
                    and (mo_luc   is null or mo_luc   <= now())
                    and (dong_luc is null or dong_luc >  now())) then
    return false;
  end if;

  return true;
end $$;
-- ⚠ Ham nay NHAN uid LAM THAM SO ⇒ revoke NGAY TAI CHO, dung doi tep khac. Xem
--   docs/SQL_KHOA_CUA_RPC.sql muc 1: mac dinh cua Postgres la MO, khong phai DONG.
revoke all on function public.san_ghi_duoc(uuid) from public, anon, authenticated;

-- ============================================================
-- 4. TREO BAN
-- ============================================================
-- ⚠ CHI NHAN TRANG BI (`gearBag`). Vat pham xep chong khong co `uid` rieng nen khong co gi de
--   chot chan quay nguoc bam vao — cho len san la mo duong nhan doi.
create or replace function public.san_treo(p_uid text, p_gia bigint)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare me uuid := auth.uid(); s jsonb; tui jsonb; mon jsonb; i int; ten text; con jsonb := '[]'::jsonb;
begin
  if me is null then return jsonb_build_object('ok', false, 'vi', 'chua-dang-nhap'); end if;
  if not public.san_ghi_duoc(me) then return jsonb_build_object('ok', false, 'vi', 'san-tam-dong'); end if;
  if p_gia is null or p_gia <= 0 or p_gia > 1000000000 then return jsonb_build_object('ok', false, 'vi', 'gia-sai'); end if;

  s := public.san_doc_save(me);
  if s is null then return jsonb_build_object('ok', false, 'vi', 'chua-co-ban-luu'); end if;
  tui := coalesce(s->'gearBag', '[]'::jsonb);

  -- Tim mon TRONG TUI tren MAY CHU. Khong tin client khai.
  mon := null;
  for i in 0 .. jsonb_array_length(tui) - 1 loop
    if tui->i->>'uid' = p_uid then mon := tui->i; else con := con || jsonb_build_array(tui->i); end if;
  end loop;
  if mon is null then return jsonb_build_object('ok', false, 'vi', 'khong-co-mon-nay'); end if;

  ten := coalesce(s->'player'->>'name', '');

  -- Bo mon khoi tui roi ghi save. Neu buoc chen tin rao ben duoi hong thi CA HAI cung cuon nguoc.
  perform public.san_ghi_save(me, jsonb_set(s, '{gearBag}', con, true));

  insert into public.san_rao (nguoi_ban, ten_ban, mon, mon_uid, gia)
  values (me, ten, mon, p_uid, p_gia);

  return jsonb_build_object('ok', true);
exception when unique_violation then
  -- Trung chi so `san_rao_uid_dang_treo`: mon nay dang treo roi (hai may cung bam).
  return jsonb_build_object('ok', false, 'vi', 'dang-treo-roi');
end $$;

-- ============================================================
-- 5. GO XUONG — mon ve tui
-- ============================================================
create or replace function public.san_go(p_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare me uuid := auth.uid(); r public.san_rao%rowtype; s jsonb;
begin
  if me is null then return jsonb_build_object('ok', false, 'vi', 'chua-dang-nhap'); end if;
  if not public.san_ghi_duoc(me) then return jsonb_build_object('ok', false, 'vi', 'san-tam-dong'); end if;

  -- Khoa dong lai roi moi doc, khoi hai may cung go mot tin.
  select * into r from public.san_rao where id = p_id for update;
  if not found then return jsonb_build_object('ok', false, 'vi', 'khong-co-tin'); end if;
  if r.nguoi_ban <> me then return jsonb_build_object('ok', false, 'vi', 'khong-phai-tin-cua-minh'); end if;
  if r.trang_thai <> 'treo' then return jsonb_build_object('ok', false, 'vi', 'tin-da-xong'); end if;

  s := public.san_doc_save(me);
  if s is null then return jsonb_build_object('ok', false, 'vi', 'chua-co-ban-luu'); end if;

  update public.san_rao set trang_thai = 'go', xong_luc = now() where id = p_id;
  perform public.san_ghi_save(me, jsonb_set(s, '{gearBag}',
    coalesce(s->'gearBag', '[]'::jsonb) || jsonb_build_array(r.mon), true));

  return jsonb_build_object('ok', true);
end $$;

-- ============================================================
-- 6. MUA
-- ============================================================
create or replace function public.san_mua(p_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare me uuid := auth.uid(); r public.san_rao%rowtype;
        sM jsonb; sB jsonb; bacM bigint; bacB bigint; thue bigint;
begin
  if me is null then return jsonb_build_object('ok', false, 'vi', 'chua-dang-nhap'); end if;
  if not public.san_ghi_duoc(me) then return jsonb_build_object('ok', false, 'vi', 'san-tam-dong'); end if;

  select * into r from public.san_rao where id = p_id for update;
  if not found then return jsonb_build_object('ok', false, 'vi', 'khong-co-tin'); end if;
  if r.trang_thai <> 'treo' then return jsonb_build_object('ok', false, 'vi', 'tin-da-xong'); end if;
  if r.nguoi_ban = me then return jsonb_build_object('ok', false, 'vi', 'khong-tu-mua-cua-minh'); end if;
  -- ⚠ Lenh nay ghi HAI ban luu. Ben kia khong ghi duoc thi cung nua song nua chet.
  if not public.san_ghi_duoc(r.nguoi_ban) then return jsonb_build_object('ok', false, 'vi', 'ben-kia-tam-khoa'); end if;

  sM := public.san_doc_save(me);
  sB := public.san_doc_save(r.nguoi_ban);
  if sM is null or sB is null then return jsonb_build_object('ok', false, 'vi', 'thieu-ban-luu'); end if;

  bacM := coalesce((sM->'currencies'->>'bac')::bigint, 0);
  if bacM < r.gia then return jsonb_build_object('ok', false, 'vi', 'khong-du-bac'); end if;
  bacB := coalesce((sB->'currencies'->>'bac')::bigint, 0);
  thue := public.san_thue(r.gia);

  update public.san_rao set trang_thai = 'ban', nguoi_mua = me, xong_luc = now() where id = p_id;
  insert into public.san_so (rao_id, nguoi_ban, nguoi_mua, gia, thue)
  values (r.id, r.nguoi_ban, me, r.gia, thue);

  -- Nguoi mua: tru Bac, nhan mon.
  sM := jsonb_set(sM, '{currencies,bac}', to_jsonb(bacM - r.gia), true);
  sM := jsonb_set(sM, '{gearBag}', coalesce(sM->'gearBag', '[]'::jsonb) || jsonb_build_array(r.mon), true);
  perform public.san_ghi_save(me, sM);

  -- Nguoi ban: nhan Bac da tru thue.
  sB := jsonb_set(sB, '{currencies,bac}', to_jsonb(bacB + (r.gia - thue)), true);
  perform public.san_ghi_save(r.nguoi_ban, sB);

  return jsonb_build_object('ok', true, 'gia', r.gia, 'thue', thue);
end $$;

-- ============================================================
-- 7. ⚠⚠ HAI CHOT CHAN QUAY NGUOC — thu quan trong nhat tep nay
-- ============================================================
-- Khong co hai chot nay thi ca he tren vo: nguoi choi nap lai ban luu cu la mon ve tui trong khi
-- tin rao van treo, hoac lay lai Bac da tieu.
create or replace function public.san_chan_quay_nguoc()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare cu bigint; moi bigint; n int;
begin
  -- Lenh ghi do CHINH HAM SAN phat ra thi cho qua.
  if coalesce(current_setting('app.san', true), '') = '1' then return new; end if;

  -- Chot 1: trong tui co mon dang treo ban -> tu choi.
  select count(*) into n
    from public.san_rao r
   where r.nguoi_ban = new.user_id and r.trang_thai = 'treo'
     and exists (select 1 from jsonb_array_elements(coalesce(new.data->'gearBag', '[]'::jsonb)) g
                  where g->>'uid' = r.mon_uid);
  if n > 0 then return null; end if;

  -- Chot 2: so dem san di lui -> tu choi (day la ban luu cu).
  if tg_op = 'UPDATE' then
    cu  := coalesce((old.data->>'sanSeq')::bigint, 0);
    moi := coalesce((new.data->>'sanSeq')::bigint, 0);
    if moi < cu then return null; end if;
  end if;

  return new;
end $$;

-- ⚠ Ten bat dau bang 'a_' de chay TRUOC chot chong gian lan (`kiem_toc_do_tren_saves`), y het
--   chot khoa tai khoan. Postgres ban trigger cung loai theo THU TU TEN.
drop trigger if exists a_san_chan_quay_nguoc on public.saves;
create trigger a_san_chan_quay_nguoc
  before insert or update on public.saves
  for each row execute function public.san_chan_quay_nguoc();

-- ============================================================
-- 8. CHOT CHONG GIAN LAN PHAI BO QUA LENH GHI CUA SAN
-- ============================================================
-- Nguoi ban nhan mot cuc Bac tu san — do la tien do san chuyen, khong phai nguoi choi tu cay ra.
-- Thieu ve nay thi ban duoc mon dat tien la bi ghi so nghi van OAN, va co the bi CHAN.
--
-- ⚠⚠ VE NAY KHONG NAM O DAY. No da duoc chen thang vao `docs/SQL_CHONG_GIAN_LAN.sql` (mot dong
--    ngay dau ham `kiem_toc_do`). Chay tep NAY xong PHAI chay lai tep do.
--
-- ⛔ DUNG dinh nghia lai `kiem_toc_do` o day de "goi sang ham goc". Khong co ham goc nao ca —
--    lam the la de len ham that, moi luot luu cua ca lang dut ngay.

-- ============================================================
-- 9. GIA SAN TOI THIEU — CHOT THAT (chay lan hai, 2026-08-16)
-- ============================================================
-- ⚠⚠ BAN SONG SINH cua `src/data/giasan.js`. Client tinh de HIEN, may chu tinh de CHAN.
--    Sua mot ben ma quen ben kia la nguoi choi thay mot gia, bam vao lai bi tu choi vi gia khac.
--    Bai kiem `_check_giasan.mjs` so hai ban tren vai chuc ca.
-- ⚠ Moc chot: CUC HIEM cap 100 = 1 trieu Bac. Ba bac tren leo thoai x1,8 — de x2,6 thi Doc Nhat
--   ra 3.213 gio cay, ma ca hanh trinh len cap 100 chi co 577 gio, khong bao gio co ai mua.
-- ⚠ TIEN LAM TRON LEN (`ceil`) — he thong khong lo.

create or replace function public.san_hs_pham(p text)
returns numeric language sql immutable as $$
  select case p
    when 'phamPham' then 13 when 'luongPham' then 33 when 'tinhPham' then 80
    when 'tuyetPham' then 199 when 'truyenThe' then 358 when 'thanPham' then 645
    when 'coBan' then 1160 else 13 end
$$;

-- Chi phi ep ky vong quy ra Bac, index = so cong (+0 .. +15).
create or replace function public.san_cp_ep(p int)
returns numeric language sql immutable as $$
  select (array[0,21,51,89,145,283,425,750,1120,1617,2308,4230,10661,20328,34067,62067])
         [greatest(0, least(15, coalesce(p, 0))) + 1]
$$;

/* Gia san cua MOT mon dua tren chinh JSON cua no. Tra 0 neu khong doc duoc (khong chan oan). */
create or replace function public.san_gia_toi_thieu(p_mon jsonb)
returns bigint
language plpgsql
immutable
as $$
declare lv int; pham text; cong int; gia_npc numeric;
begin
  lv   := coalesce((p_mon->>'itemLv')::int, 0);
  pham := coalesce(p_mon->>'quality', 'phamPham');
  cong := coalesce((p_mon->>'plus')::int, 0);
  if lv <= 0 then return 0; end if;                    -- khong phai trang bi -> khong chot o day
  gia_npc := round(lv * lv * 0.5 + 20);
  return ceil(gia_npc * public.san_hs_pham(pham) + public.san_cp_ep(cong) + 3)::bigint;
end $$;

-- ⚠ Chen chot vao `san_treo`: tu choi ngay khi gia thap hon san. Tra ve CA con so de client
--   hien duoc "gia toi thieu la X" chu khong bao chung chung.
create or replace function public.san_treo(p_uid text, p_gia bigint)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare me uuid := auth.uid(); s jsonb; tui jsonb; mon jsonb; i int; ten text; con jsonb := '[]'::jsonb; san bigint;
begin
  if me is null then return jsonb_build_object('ok', false, 'vi', 'chua-dang-nhap'); end if;
  if not public.san_ghi_duoc(me) then return jsonb_build_object('ok', false, 'vi', 'san-tam-dong'); end if;
  if p_gia is null or p_gia <= 0 or p_gia > 1000000000 then return jsonb_build_object('ok', false, 'vi', 'gia-sai'); end if;

  s := public.san_doc_save(me);
  if s is null then return jsonb_build_object('ok', false, 'vi', 'chua-co-ban-luu'); end if;
  tui := coalesce(s->'gearBag', '[]'::jsonb);

  mon := null;
  for i in 0 .. jsonb_array_length(tui) - 1 loop
    if tui->i->>'uid' = p_uid then mon := tui->i; else con := con || jsonb_build_array(tui->i); end if;
  end loop;
  if mon is null then return jsonb_build_object('ok', false, 'vi', 'khong-co-mon-nay'); end if;

  san := public.san_gia_toi_thieu(mon);
  if san > 0 and p_gia < san then
    return jsonb_build_object('ok', false, 'vi', 'duoi-gia-san', 'san', san);
  end if;

  ten := coalesce(s->'player'->>'name', '');
  perform public.san_ghi_save(me, jsonb_set(s, '{gearBag}', con, true));
  insert into public.san_rao (nguoi_ban, ten_ban, mon, mon_uid, gia)
  values (me, ten, mon, p_uid, p_gia);
  return jsonb_build_object('ok', true);
exception when unique_violation then
  return jsonb_build_object('ok', false, 'vi', 'dang-treo-roi');
end $$;

-- ============================================================
-- 10. VAT PHAM XEP CHONG — lieu, do che tao, trung pet, cong cu (chay lan ba)
-- ============================================================
-- ⚠ Chay `docs/SQL_SAN_GIA_VP.sql` TRUOC tep nay: bang gia san cho vat pham nam o do.
-- ⚠⚠ VI SAO VAT PHAM XEP CHONG VAN AN TOAN du khong co `uid`: chot chan quay nguoc thu HAI
--    (`sanSeq` chi tien khong lui) khong can `uid` gi ca. Nap ban luu cu de lay lai mon thi ban
--    do mang so dem lui -> may chu tu choi -> save khong bao gio len duoc cloud -> khong ban duoc.
--    Chot `uid` chi la lop thu hai, rieng cho trang bi.

alter table public.san_rao add column if not exists loai     text   not null default 'gear';
alter table public.san_rao add column if not exists item_id  text;
alter table public.san_rao add column if not exists so_luong int    not null default 1;

/* Treo ban vat pham xep chong. `p_so` la SO LUONG, `p_gia` la gia CA LO. */
create or replace function public.san_treo_vp(p_item text, p_so int, p_gia bigint)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare me uuid := auth.uid(); s jsonb; co int; ten text; san bigint; tong bigint;
begin
  if me is null then return jsonb_build_object('ok', false, 'vi', 'chua-dang-nhap'); end if;
  if not public.san_ghi_duoc(me) then return jsonb_build_object('ok', false, 'vi', 'san-tam-dong'); end if;
  if p_so is null or p_so <= 0 or p_so > 9999 then return jsonb_build_object('ok', false, 'vi', 'so-luong-sai'); end if;
  if p_gia is null or p_gia <= 0 or p_gia > 1000000000 then return jsonb_build_object('ok', false, 'vi', 'gia-sai'); end if;

  s := public.san_doc_save(me);
  if s is null then return jsonb_build_object('ok', false, 'vi', 'chua-co-ban-luu'); end if;

  co := coalesce((s->'inventory'->>p_item)::int, 0);
  if co < p_so then return jsonb_build_object('ok', false, 'vi', 'khong-du-so-luong', 'co', co); end if;

  -- Gia san tinh CA LO: san mot cai x so luong.
  select gia_san into san from public.san_gia_vp where item_id = p_item;
  if san is null then return jsonb_build_object('ok', false, 'vi', 'mon-nay-khong-ban-duoc'); end if;
  tong := san * p_so;
  if p_gia < tong then return jsonb_build_object('ok', false, 'vi', 'duoi-gia-san', 'san', tong); end if;

  ten := coalesce(s->'player'->>'name', '');
  -- ⚠ Tru het thi XOA HAN khoa, dung de lai so 0 — tui do rac dan len theo thoi gian.
  if co - p_so <= 0 then s := s #- array['inventory', p_item];
  else s := jsonb_set(s, array['inventory', p_item], to_jsonb(co - p_so), true); end if;
  perform public.san_ghi_save(me, s);

  insert into public.san_rao (nguoi_ban, ten_ban, mon, mon_uid, gia, loai, item_id, so_luong)
  values (me, ten, jsonb_build_object('itemId', p_item, 'so', p_so), 'vp:' || p_item || ':' || extract(epoch from clock_timestamp())::text,
          p_gia, 'item', p_item, p_so);

  return jsonb_build_object('ok', true);
end $$;

/* Go xuong — nhan CA HAI loai. Thay han ham cu. */
create or replace function public.san_go(p_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare me uuid := auth.uid(); r public.san_rao%rowtype; s jsonb; co int;
begin
  if me is null then return jsonb_build_object('ok', false, 'vi', 'chua-dang-nhap'); end if;
  if not public.san_ghi_duoc(me) then return jsonb_build_object('ok', false, 'vi', 'san-tam-dong'); end if;
  select * into r from public.san_rao where id = p_id for update;
  if not found then return jsonb_build_object('ok', false, 'vi', 'khong-co-tin'); end if;
  if r.nguoi_ban <> me then return jsonb_build_object('ok', false, 'vi', 'khong-phai-tin-cua-minh'); end if;
  if r.trang_thai <> 'treo' then return jsonb_build_object('ok', false, 'vi', 'tin-da-xong'); end if;

  s := public.san_doc_save(me);
  if s is null then return jsonb_build_object('ok', false, 'vi', 'chua-co-ban-luu'); end if;

  update public.san_rao set trang_thai = 'go', xong_luc = now() where id = p_id;

  if r.loai = 'item' then
    co := coalesce((s->'inventory'->>r.item_id)::int, 0);
    s := jsonb_set(s, array['inventory', r.item_id], to_jsonb(co + r.so_luong), true);
  else
    s := jsonb_set(s, '{gearBag}', coalesce(s->'gearBag', '[]'::jsonb) || jsonb_build_array(r.mon), true);
  end if;
  perform public.san_ghi_save(me, s);
  return jsonb_build_object('ok', true);
end $$;

/* Mua — nhan CA HAI loai. Thay han ham cu. */
create or replace function public.san_mua(p_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare me uuid := auth.uid(); r public.san_rao%rowtype;
        sM jsonb; sB jsonb; bacM bigint; bacB bigint; thue bigint; co int;
begin
  if me is null then return jsonb_build_object('ok', false, 'vi', 'chua-dang-nhap'); end if;
  if not public.san_ghi_duoc(me) then return jsonb_build_object('ok', false, 'vi', 'san-tam-dong'); end if;
  select * into r from public.san_rao where id = p_id for update;
  if not found then return jsonb_build_object('ok', false, 'vi', 'khong-co-tin'); end if;
  if r.trang_thai <> 'treo' then return jsonb_build_object('ok', false, 'vi', 'tin-da-xong'); end if;
  if r.nguoi_ban = me then return jsonb_build_object('ok', false, 'vi', 'khong-tu-mua-cua-minh'); end if;
  -- ⚠ Lenh nay ghi HAI ban luu. Ben kia khong ghi duoc thi cung nua song nua chet.
  if not public.san_ghi_duoc(r.nguoi_ban) then return jsonb_build_object('ok', false, 'vi', 'ben-kia-tam-khoa'); end if;

  sM := public.san_doc_save(me);
  sB := public.san_doc_save(r.nguoi_ban);
  if sM is null or sB is null then return jsonb_build_object('ok', false, 'vi', 'thieu-ban-luu'); end if;

  bacM := coalesce((sM->'currencies'->>'bac')::bigint, 0);
  if bacM < r.gia then return jsonb_build_object('ok', false, 'vi', 'khong-du-bac'); end if;
  bacB := coalesce((sB->'currencies'->>'bac')::bigint, 0);
  thue := public.san_thue(r.gia);

  update public.san_rao set trang_thai = 'ban', nguoi_mua = me, xong_luc = now() where id = p_id;
  insert into public.san_so (rao_id, nguoi_ban, nguoi_mua, gia, thue)
  values (r.id, r.nguoi_ban, me, r.gia, thue);

  sM := jsonb_set(sM, '{currencies,bac}', to_jsonb(bacM - r.gia), true);
  if r.loai = 'item' then
    co := coalesce((sM->'inventory'->>r.item_id)::int, 0);
    sM := jsonb_set(sM, array['inventory', r.item_id], to_jsonb(co + r.so_luong), true);
  else
    sM := jsonb_set(sM, '{gearBag}', coalesce(sM->'gearBag', '[]'::jsonb) || jsonb_build_array(r.mon), true);
  end if;
  perform public.san_ghi_save(me, sM);

  sB := jsonb_set(sB, '{currencies,bac}', to_jsonb(bacB + (r.gia - thue)), true);
  perform public.san_ghi_save(r.nguoi_ban, sB);

  return jsonb_build_object('ok', true, 'gia', r.gia, 'thue', thue);
end $$;
