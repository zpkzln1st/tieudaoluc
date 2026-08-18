-- ============================================================
-- TIEU DAO LUC — SAN THU MUA (buy-order). Nua con thieu cua cho P2P.
-- ============================================================
-- CACH DUNG: Supabase > SQL Editor > dan tron tep nay > Run. Chay lai duoc nhieu lan.
-- ⚠ PHAI chay SAU `docs/SQL_SAN_GIAO_DICH.sql` va `docs/SQL_SAN_GIA_VP.sql`:
--   tep nay dung lai `san_thue`, `san_ghi_save`, bang `san_rao`, `san_so`, `san_gia_vp`.
-- ⚠ KHONG can chay lai `docs/SQL_CHONG_GIAN_LAN.sql` — tep nay khong dong vao no. Xem muc 5.
--
-- KHAC voi Treo Ban: ben do treo MON roi cho nguoi mua; ben nay treo BAC roi cho nguoi ban.
--
-- ⚠⚠ BA DIEU LAM NEN CA TEP NAY:
--   1. BAC KY QUY TRU NGAY LUC DAT DON. Khong ky quy thi nguoi ban giao hang xong moi biet ben kia
--      het Bac. Don dung nhieu ngay, may chu don khong can bat, nen loi hua tra sau khong kiem duoc.
--   2. MOI LAN KHOP GHI MOT DONG DA XONG VAO `san_rao`. Day KHONG phai de cho dep so sach — ham
--      `dan_mua_san` cua tang 2E chong gian lan dem vien dan Dan Dien MUA RONG bang cach doc dung
--      bang do. Bo dong ghi ay thi nguoi gom dan qua don thu mua bi ghi so tu o thu 21 va bi
--      CHAN THAT o o thu 60 — dung cai bay da vá hom qua, chi doi cua.
--   3. TU CHOI BANG `return`, KHONG `raise exception`. Exception cuon nguoc ca so.
-- ============================================================

-- ---------- 1. BANG DON THU MUA ----------
create table if not exists public.san_thu_mua (
  id         bigserial   primary key,
  nguoi_dat  uuid        not null references auth.users(id) on delete cascade,
  ten_dat    text        not null default '',      -- chup ten luc dat, khoi join sang save
  item_id    text        not null,
  -- ⛔ KHONG dat khoa ngoai sang `san_gia_vp`: tep sinh bang do `truncate` moi lan chay lai,
  --    khoa ngoai se chan chinh lenh truncate ay. Kiem ma hop le bang truy van trong ham.
  gia        bigint      not null check (gia > 0 and gia <= 5000000),   -- gia MOI CAI
  so_dat     int         not null check (so_dat > 0 and so_dat <= 9999),
  so_con     int         not null check (so_con >= 0),
  ky_quy     bigint      not null check (ky_quy >= 0),
  trang_thai text        not null default 'treo' check (trang_thai in ('treo','xong','huy')),
  tao_luc    timestamptz not null default now(),
  xong_luc   timestamptz,
  check (so_con <= so_dat),
  -- ⚠⚠ BAT BIEN CUA CA HE. Ky quy con lai LUON dung bang gia mot cai nhan so con thieu.
  --    Sai mot dong Bac la lenh ghi no ngay, khong am tham lech. Day la thu chan duong in Bac:
  --    khop lam giam ca hai ve khoa buoc nhau, huy dua ca hai ve 0.
  check (ky_quy = gia::bigint * so_con)
);

create index if not exists san_tm_dang_treo on public.san_thu_mua (item_id, gia desc) where trang_thai = 'treo';
create index if not exists san_tm_cua_toi   on public.san_thu_mua (nguoi_dat, trang_thai);

alter table public.san_thu_mua enable row level security;
-- Don dang treo thi ai cung xem duoc (nguoi ban can thay de giao hang). Don da xong/huy chi chu don xem.
drop policy if exists "san_tm_ai_cung_xem" on public.san_thu_mua;
create policy "san_tm_ai_cung_xem" on public.san_thu_mua
  for select using (trang_thai = 'treo' or nguoi_dat = auth.uid());
-- ⚠⚠ KHONG cap insert / update / delete cho BAT KY AI. Ba ham duoi la duong duy nhat.
--    Day la hang rao that; giao dien chi la cai vo.

-- ---------- 2. TIEN ICH: DOC BAN LUU CO KHOA DONG ----------
-- ⚠⚠ `san_doc_save` san co KHONG khoa dong. Voi Treo Ban thi khong sao vi mot lenh chi cham mot
--    ban luu. Thu Mua cham HAI ban luu mot luc, nen phai khoa: thieu khoa thi hai lan khop cung
--    luc cung doc mot ban cu roi ghi de nhau — mot lo hang bien mat ma so sach van khop.
create or replace function public.san_doc_save_khoa(p_uid uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare d jsonb;
begin
  select data into d from public.saves where user_id = p_uid for update;
  return d;
end $$;

-- Bao dam mot khoa object co that truoc khi `jsonb_set` ghi vao trong no.
-- ⚠⚠ `jsonb_set(s, '{inventory,X}', v, true)` chi tao duoc khoa CUOI. Neu `inventory` chua ton tai
--    thi no tra ve `s` NGUYEN VAN, khong bao loi — mon giao vao don bay hoi im lang.
create or replace function public.san_bao_dam_o(s jsonb, khoa text)
returns jsonb
language sql immutable
as $$
  select case when jsonb_typeof(s -> khoa) = 'object' then s
              else jsonb_set(s, array[khoa], '{}'::jsonb, true) end;
$$;

-- ---------- 3. DAT DON ----------
-- ⚠ Tran: 10 don dang treo cung luc, ky quy GOP toi da 5.000.000 Bac (docs/NOI_DUNG_GAME.md H4
--   ghi 10 don cho tai khoan thuong; game nay khong co Hoi Vien nen dung mot muc).
create or replace function public.san_thu_mua_dat(p_item text, p_so int, p_gia bigint)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare me uuid := auth.uid(); s jsonb; bac bigint; san bigint; ky bigint; n int; gop bigint; ten text;
begin
  if me is null then return jsonb_build_object('ok', false, 'vi', 'chua-dang-nhap'); end if;
  if p_so is null or p_so <= 0 or p_so > 9999 then return jsonb_build_object('ok', false, 'vi', 'so-luong-sai'); end if;
  if p_gia is null or p_gia <= 0 or p_gia > 5000000 then return jsonb_build_object('ok', false, 'vi', 'gia-sai'); end if;

  -- ⚠⚠ DON THU MUA CUNG PHAI THEO GIA SAN. Thieu chot nay thi ai muon chuyen mon gia re cho ban
  --    minh chi viec dat don 1 Bac roi bao ban ay ban vao — cua sau di vong qua ca bang gia san.
  select gia_san into san from public.san_gia_vp where item_id = p_item;
  if san is null then return jsonb_build_object('ok', false, 'vi', 'mon-nay-khong-ban-duoc'); end if;
  if p_gia < san then return jsonb_build_object('ok', false, 'vi', 'duoi-gia-san', 'san', san); end if;

  ky := p_gia::bigint * p_so;
  if ky > 5000000 then return jsonb_build_object('ok', false, 'vi', 'ky-quy-qua-tran'); end if;

  -- ⚠ KHOA ban luu TRUOC khi dem don. Dong `saves` bi khoa chinh la o khoa mot-nguoi-mot-luc,
  --   nho no ma phep dem duoi day khong bi hai tab dat don cung luc lach qua.
  s := public.san_doc_save_khoa(me);
  if s is null then return jsonb_build_object('ok', false, 'vi', 'chua-co-ban-luu'); end if;

  select count(*), coalesce(sum(ky_quy), 0) into n, gop
    from public.san_thu_mua where nguoi_dat = me and trang_thai = 'treo';
  if n >= 10 then return jsonb_build_object('ok', false, 'vi', 'qua-nhieu-don'); end if;
  if gop + ky > 5000000 then return jsonb_build_object('ok', false, 'vi', 'ky-quy-qua-tran'); end if;

  bac := coalesce((s->'currencies'->>'bac')::bigint, 0);
  if bac < ky then return jsonb_build_object('ok', false, 'vi', 'khong-du-bac'); end if;

  ten := coalesce(s->'player'->>'name', '');
  s := public.san_bao_dam_o(s, 'currencies');
  s := jsonb_set(s, '{currencies,bac}', to_jsonb(bac - ky), true);
  perform public.san_ghi_save(me, s);

  insert into public.san_thu_mua (nguoi_dat, ten_dat, item_id, gia, so_dat, so_con, ky_quy)
  values (me, ten, p_item, p_gia, p_so, p_so, ky);

  return jsonb_build_object('ok', true, 'kyQuy', ky);
end $$;

-- ---------- 4. GO DON, HOAN BAC KY QUY ----------
-- ⚠ Hoan dung `ky_quy` CON LAI cua dong dang khoa, khong doc so nao tu client, khong tinh lai.
--   Doi trang thai va hoan Bac nam trong CUNG mot giao dich, nen huy lan hai gap `trang_thai <>
--   'treo'` roi tu choi — khong co duong hoan hai lan.
create or replace function public.san_thu_mua_huy(p_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare me uuid := auth.uid(); d public.san_thu_mua%rowtype; s jsonb; bac bigint;
begin
  if me is null then return jsonb_build_object('ok', false, 'vi', 'chua-dang-nhap'); end if;

  -- ⚠⚠ KHOA DON TRUOC, ban luu SAU. Dao thu tu la co luc mot lan khop dang chay chen vao giua,
  --    va lenh ghi cua huy de len lo hang vua nhan.
  select * into d from public.san_thu_mua where id = p_id for update;
  if not found then return jsonb_build_object('ok', false, 'vi', 'khong-co-tin'); end if;
  if d.nguoi_dat <> me then return jsonb_build_object('ok', false, 'vi', 'khong-phai-tin-cua-minh'); end if;
  if d.trang_thai <> 'treo' then return jsonb_build_object('ok', false, 'vi', 'tin-da-xong'); end if;

  s := public.san_doc_save_khoa(me);
  if s is null then return jsonb_build_object('ok', false, 'vi', 'chua-co-ban-luu'); end if;

  update public.san_thu_mua
     set trang_thai = 'huy', so_con = 0, ky_quy = 0, xong_luc = now()
   where id = p_id;

  bac := coalesce((s->'currencies'->>'bac')::bigint, 0);
  s := public.san_bao_dam_o(s, 'currencies');
  s := jsonb_set(s, '{currencies,bac}', to_jsonb(bac + d.ky_quy), true);
  perform public.san_ghi_save(me, s);

  return jsonb_build_object('ok', true, 'hoan', d.ky_quy);
end $$;

-- ---------- 5. BAN VAO DON ----------
-- ⚠⚠ DONG `insert into public.san_rao` O CUOI HAM NAY LA RANG BUOC SONG CON, khong phai so sach.
--    `dan_mua_san` (docs/SQL_CHONG_GIAN_LAN.sql) dem vien dan Dan Dien mua rong bang cach doc
--    `san_rao` voi trang_thai='ban' and loai='item'. Moi lan khop ghi mot dong day du sau o thi
--    tran tang 2E tu noi dung, KHONG phai sua tep chong gian lan mot chu nao.
--    Bo dong ay di la nguoi choi sach gom dan qua don thu mua bi CHAN THAT o o thu 60.
create or replace function public.san_thu_mua_ban(p_id bigint, p_so int)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare me uuid := auth.uid(); d public.san_thu_mua%rowtype;
        sB jsonb; sM jsonb; co int; k int; tien bigint; thue bigint; bacB bigint; ten text; rid bigint;
begin
  if me is null then return jsonb_build_object('ok', false, 'vi', 'chua-dang-nhap'); end if;
  if p_so is null or p_so <= 0 or p_so > 9999 then return jsonb_build_object('ok', false, 'vi', 'so-luong-sai'); end if;

  select * into d from public.san_thu_mua where id = p_id for update;
  if not found then return jsonb_build_object('ok', false, 'vi', 'khong-co-tin'); end if;
  if d.trang_thai <> 'treo' then return jsonb_build_object('ok', false, 'vi', 'tin-da-xong'); end if;
  -- ⚠ Tu ban vao don cua minh la duong bom bo dem `dan_mua_san` mien phi (chi mat thue), va la
  --   duong thoi gia gia tao. Chan thang.
  if d.nguoi_dat = me then return jsonb_build_object('ok', false, 'vi', 'khong-tu-mua-cua-minh'); end if;

  -- ⚠⚠ KHOA HAI BAN LUU THEO uid TANG DAN. Hai lan khop cheo nhau ma khoa nguoc thu tu la KET CUNG.
  if me < d.nguoi_dat then
    sB := public.san_doc_save_khoa(me);
    sM := public.san_doc_save_khoa(d.nguoi_dat);
  else
    sM := public.san_doc_save_khoa(d.nguoi_dat);
    sB := public.san_doc_save_khoa(me);
  end if;
  if sB is null or sM is null then return jsonb_build_object('ok', false, 'vi', 'thieu-ban-luu'); end if;

  co := coalesce((sB->'inventory'->>d.item_id)::int, 0);
  -- Khop MOT PHAN: giao duoc bao nhieu thi khop bay nhieu. Tat-ca-hoac-khong thi don 500 cai phai
  -- doi dung mot nguoi co du 500 — san khong co bot nen gan nhu khong bao gio khop.
  k := least(p_so, d.so_con, co);
  if k <= 0 then return jsonb_build_object('ok', false, 'vi', 'khong-du-so-luong', 'co', co); end if;

  tien := d.gia::bigint * k;
  thue := public.san_thue(tien);

  -- Don: hai ve giam KHOA BUOC nhau, bat bien `ky_quy = gia * so_con` giu nguyen.
  update public.san_thu_mua
     set so_con     = so_con - k,
         ky_quy     = ky_quy - tien,
         trang_thai = case when so_con - k = 0 then 'xong' else 'treo' end,
         xong_luc   = case when so_con - k = 0 then now() else xong_luc end
   where id = p_id;

  -- Ben giao mon: bot mon, nhan Bac da tru thue.
  -- ⚠ Tru het thi XOA HAN khoa, dung de lai so 0 — tui do rac dan len theo thoi gian.
  if co - k <= 0 then sB := sB #- array['inventory', d.item_id];
  else sB := jsonb_set(sB, array['inventory', d.item_id], to_jsonb(co - k), true); end if;
  bacB := coalesce((sB->'currencies'->>'bac')::bigint, 0);
  sB := public.san_bao_dam_o(sB, 'currencies');
  sB := jsonb_set(sB, '{currencies,bac}', to_jsonb(bacB + (tien - thue)), true);
  ten := coalesce(sB->'player'->>'name', '');
  perform public.san_ghi_save(me, sB);

  -- Chu don: nhan mon. Bac da tru tu luc dat don nen khong dong vao vi tien nua.
  sM := public.san_bao_dam_o(sM, 'inventory');
  sM := jsonb_set(sM, array['inventory', d.item_id],
                  to_jsonb(coalesce((sM->'inventory'->>d.item_id)::int, 0) + k), true);
  perform public.san_ghi_save(d.nguoi_dat, sM);

  -- ⚠⚠ DONG SONG CON (xem chu thich dau muc 5). Tien to `tm:` cua `mon_uid` khong bao gio dung
  --    `uid` trang bi nen chot chan quay nguoc khong vuong; dong nay mang trang_thai 'ban' nen
  --    nam ngoai chi muc `san_rao_uid_dang_treo` va ngoai luoi Cho.
  insert into public.san_rao (nguoi_ban, ten_ban, mon, mon_uid, gia, trang_thai, nguoi_mua, xong_luc, loai, item_id, so_luong)
  values (me, ten, jsonb_build_object('itemId', d.item_id, 'so', k),
          'tm:' || d.id::text || ':' || extract(epoch from clock_timestamp())::text,
          tien, 'ban', d.nguoi_dat, now(), 'item', d.item_id, k)
  returning id into rid;

  insert into public.san_so (rao_id, nguoi_ban, nguoi_mua, gia, thue)
  values (rid, me, d.nguoi_dat, tien, thue);

  return jsonb_build_object('ok', true, 'so', k, 'gia', tien, 'thue', thue);
end $$;

-- ============================================================
-- ⚠ NHUNG GI TEP NAY KHONG LAM
-- · KHONG nhan trang bi. `san_gia_toi_thieu` chi doc itemLv/quality/plus, khong doc dong roll —
--   hai mon Cuc Hiem cap 100 +0 cung gia san 998.983 ma khac nhau ba tang. Dat don mua trang bi
--   la boc tham mot chieu. Chi hang xep chong, dung bang gia `san_gia_vp`.
-- · KHONG co han 48 gio cho don. Het han phai hoan Bac, ma hoan Bac phai ghi ban luu cua chu don
--   — viec do chi lam duoc luc ho dang online. Bu lai: don go xuong duoc bat cu luc nao.
-- · KHONG khop tran nhieu don trong mot lan bam. Mot lan bam mot don.
-- · KHONG dong duoc lo nap lai ban luu cu: chot `sanSeq` chi so `moi < cu`, chep lai dung so hien
--   tai van lot. Lo nay co san tu truoc; tran ky quy 5.000.000 nam gon trong tran im lang cua
--   chong gian lan nen Thu Mua khong noi no ra.
-- ============================================================

-- ============================================================
-- CAU SOI SAU KHI CHAY — dan RIENG cau nay de xem ket qua
-- ⚠ Supabase SQL Editor chi hien ket qua cua lenh CUOI CUNG.
--
--   select 'bang san_thu_mua' as muc, count(*)::text as ket_qua from public.san_thu_mua
--   union all
--   select 'ba ham', count(*)::text from pg_proc
--    where proname in ('san_thu_mua_dat','san_thu_mua_huy','san_thu_mua_ban')
--   union all
--   select 'hai tien ich', count(*)::text from pg_proc
--    where proname in ('san_doc_save_khoa','san_bao_dam_o')
--   union all
--   select 'RLS bat', case when relrowsecurity then 'OK' else 'HONG' end
--     from pg_class where relname = 'san_thu_mua'
--   union all
--   select 'policy ghi (phai la 0)', count(*)::text from pg_policies
--    where tablename = 'san_thu_mua' and cmd <> 'SELECT';
-- ============================================================
