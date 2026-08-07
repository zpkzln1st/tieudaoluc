-- ============================================================
-- TIEU DAO LUC — LENH BAI TAC GIA
--
-- CACH DUNG: Supabase > SQL Editor > dan tron tep nay > Run. Chay lai duoc nhieu lan.
-- Phai chay SAU khi da chay SQL_CHONG_GIAN_LAN.sql va SQL_GIAM_SAT.sql.
--
-- Tep nay dung BA bang:
--   1. su_kien        — bat/tat su kien khong can deploy lai game
--   2. qua_tang       — hop qua, thay cho viec sua thang save nguoi khac
--   3. khoa_tai_khoan — khoa tai khoan, dung lai duong "tu choi im lang"
--
-- ⚠⚠ HANG RAO THAT NAM O DAY, khong nam o man Lenh Bai trong game.
--    Man Lenh Bai chi an/hien giao dien. Ai sua ma client cung bat duoc no, nhung khong dang
--    nhap dung uid tac gia thi moi lenh ghi duoi day deu bi tu choi.
-- ============================================================

-- Uid tac gia — LAY TU CHUNG CHI DA KY ECDSA trong src/engine/author.js (AUTHOR_CERT.uid).
-- ⚠ Doi tai khoan tac gia = phai ky lai chung chi VA sua uid o moi cho trong tep nay.

-- ============================================================
-- 1. SU KIEN
-- ============================================================
-- ⚠⚠ BANG NAY GHI MOC THOI GIAN, TUYET DOI KHONG GHI CONG TAC BAT/TAT.
--    Neu chi ghi mot o "dang mo dung/sai" thi nguoi choi mat mang khong biet su kien con hay het:
--      · coi la dong  -> nguoi dang cay mat sach giua chung vi rot mang
--      · coi la mo    -> su kien khong bao gio dong duoc voi nguoi ngoai tuyen
--    Ghi moc thoi gian thi client doc mot lan roi DEM vao save, mat mang van tu suy ra duoc.
create table if not exists public.su_kien (
  ma           text primary key,                 -- tet · xuan · doanNgo · vuLan · trungThu · giangSinh
  ten          text        not null default '',
  mo_luc       timestamptz,
  dong_luc     timestamptz,
  chi_tac_gia  boolean     not null default true, -- ⚠ MAC DINH TRUE: dong moi tao ra chi tac gia thay
  cau_hinh     jsonb       not null default '{}'::jsonb,
  cap_nhat     timestamptz not null default now()
);
alter table public.su_kien enable row level security;

-- ⚠ MAC DINH `chi_tac_gia = true` la CO Y (fail closed). Lo tay tao mot dong thi khong ai vao duoc
--   ngoai tac gia. Neu mac dinh false thi mot lan go nham la ca lang vao mot su kien chua xong.

-- Ai cung doc duoc: client phai biet su kien nao dang mo, ke ca khi chua dang nhap.
drop policy if exists "su_kien_ai_cung_doc" on public.su_kien;
create policy "su_kien_ai_cung_doc" on public.su_kien
  for select using (true);

-- Chi tac gia ghi duoc.
drop policy if exists "su_kien_tac_gia_them" on public.su_kien;
create policy "su_kien_tac_gia_them" on public.su_kien
  for insert with check (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);
drop policy if exists "su_kien_tac_gia_sua" on public.su_kien;
create policy "su_kien_tac_gia_sua" on public.su_kien
  for update using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);
drop policy if exists "su_kien_tac_gia_xoa" on public.su_kien;
create policy "su_kien_tac_gia_xoa" on public.su_kien
  for delete using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);

-- Sau dong san cho sau su kien. Moc de trong = chua dat lich = chua mo.
insert into public.su_kien (ma, ten) values
  ('tet',        'Su Kien Tet'),
  ('xuan',       'Su Kien Mua Xuan'),
  ('doanNgo',    'Su Kien Doan Ngo'),
  ('vuLan',      'Su Kien Vu Lan'),
  ('trungThu',   'Su Kien Trung Thu'),
  ('giangSinh',  'Su Kien Giang Sinh')
on conflict (ma) do nothing;   -- ⚠ do nothing chu khong do update: chay lai tep KHONG duoc xoa lich dang chay

-- ============================================================
-- 2. HOP QUA
-- ============================================================
-- ⚠⚠ TAI SAO KHONG SUA THANG SAVE NGUOI KHAC — hai le, ca hai deu chi tu:
--    1. Client day de save len moi 15 giay. Sua tay xong la bi ghi de ngay.
--    2. Chot chong gian lan lay co mien tru tu NEW.user_id (CHU DONG, khong phai nguoi ghi),
--       nen no CHAN chinh tac gia khi tac gia ghi vao dong cua nguoi khac.
--    Hop qua di duong khac han: tac gia ghi vao bang nay, client nguoi choi tu doc va tu nhan.
create table if not exists public.qua_tang (
  id        bigserial   primary key,
  user_id   uuid        not null references auth.users(id) on delete cascade,
  noi_dung  jsonb       not null,
  loi_nhan  text        not null default '',
  tao_luc   timestamptz not null default now(),
  nhan_luc  timestamptz                          -- null = chua nhan
);
create index if not exists qua_tang_cho_nhan on public.qua_tang (user_id) where nhan_luc is null;
alter table public.qua_tang enable row level security;

-- ⚠⚠ HOP QUA KHONG BAO GIO MANG XP, VA BAC BI CHAN TRAN.
--    Chot chong gian lan dat tran theo xp va theo Bac. Mot mon qua vuot tran se day chinh nguoi
--    duoc tang vao so nghi van — tang qua xong lai di phat nguoi ta.
--    · Khong mang xp: bo han truong do, khong co duong nao lot.
--    · Bac chan o 2 trieu, duoi san ghi so 5 trieu (tran_he_so.bac_san_toi_thieu).
--    Muon tang qua to hon thi phai sua bo sinh `_sinh_sql_tran.mjs` cho no CONG QUA VAO TRAN truoc,
--    roi sinh lai SQL_CHONG_GIAN_LAN.sql. Dung noi long rang buoc duoi day khi chua lam viec do.
-- ⚠⚠ DANH SACH CHO PHEP, KHONG PHAI DANH SACH CAM.
--    Ban dau toi viet kieu cam: "khong duoc co xp, khong duoc co skills". Do la sai huong.
--    Cam thi moi khoa LA khong ai nghi toi deu LOT. Hom nay client bo qua khoa la nen khong sao;
--    ngay mai them mot nhanh doc `items` la thanh lo hong ma khong ai nho ra de vao day sua.
--    Cho phep thi nguoc lai: them kha nang moi PHAI sua rang buoc nay truoc, khong quen duoc.
-- ⚠⚠ POSTGRES KHONG CHO DUNG TRUY VAN CON TRONG `check` (loi 0A000 cannot use subquery in check
--    constraint). Ma phep kiem danh sach cho phep thi CAN duyet tung khoa. Loi ra: bo phep kiem vao
--    mot HAM THUAN roi `check` chi goi ham — trong than ham thi truy van con hop le.
-- ⚠ Ham phai `immutable`: no chi tinh tren jsonb dua vao, khong doc bang nao, khong doc gio.
--   Postgres doi dieu do voi moi ham dung trong check.
create or replace function public.qua_hop_le(j jsonb) returns boolean
language sql
immutable
as $$
  select jsonb_typeof(j) = 'object'
     and j <> '{}'::jsonb                                          -- hop rong la loi thao tac
     -- Danh sach CHO PHEP: bo bon khoa hop le ra thi phai khong con gi. Thua mot khoa la tu choi.
     and not exists (
           select 1 from jsonb_object_keys(j) k
            where k not in ('bac', 'honThach', 'nguyenBao', 'diemSuKien')
         )
     -- Moi gia tri phai la SO NGUYEN KHONG AM. Chan so am (rut nguoc tien nguoi choi), thap phan, chuoi.
     and not exists (
           select 1 from jsonb_each(j) e
            where jsonb_typeof(e.value) <> 'number'
               or (e.value)::numeric < 0
               or (e.value)::numeric <> floor((e.value)::numeric)
         )
     and coalesce((j->>'bac')::numeric, 0)        <= 2000000
     and coalesce((j->>'honThach')::numeric, 0)   <= 100000
     and coalesce((j->>'nguyenBao')::numeric, 0)  <= 10000
     and coalesce((j->>'diemSuKien')::numeric, 0) <= 100000;
$$;

alter table public.qua_tang drop constraint if exists qua_tang_noi_dung_an_toan;
alter table public.qua_tang add constraint qua_tang_noi_dung_an_toan
  check (public.qua_hop_le(noi_dung));

-- Chu dong doc qua cua chinh minh. Tac gia doc duoc het (de soi lai da phat cho ai).
drop policy if exists "qua_tang_chu_doc" on public.qua_tang;
create policy "qua_tang_chu_doc" on public.qua_tang
  for select using (
    auth.uid() = user_id
    or auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid
  );

-- Chi tac gia phat qua.
drop policy if exists "qua_tang_tac_gia_phat" on public.qua_tang;
create policy "qua_tang_tac_gia_phat" on public.qua_tang
  for insert with check (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);
drop policy if exists "qua_tang_tac_gia_xoa" on public.qua_tang;
create policy "qua_tang_tac_gia_xoa" on public.qua_tang
  for delete using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);

-- ⚠⚠ CO Y KHONG CAP QUYEN UPDATE CHO AI CA.
--    Neu cho chu dong tu UPDATE de danh dau da nhan thi ho cung set nguoc `nhan_luc` ve null duoc,
--    tuc la nhan mot mon qua vo han lan. Danh dau da nhan phai di qua ham duoi day.
create or replace function public.nhan_qua_tang(p_id bigint)
returns jsonb
language plpgsql
security definer                                  -- chay bang quyen chu ham, di vong qua RLS
set search_path = pg_catalog, public              -- ⚠ ham security definer PHAI ghim search_path
as $$
declare
  n jsonb;
begin
  -- Mot lenh duy nhat: doi chu + doi chua nhan + danh dau + tra noi dung.
  -- Goi lan hai thi `nhan_luc is null` khong con dung -> khong dong nao -> tra null.
  update public.qua_tang
     set nhan_luc = now()
   where id = p_id
     and user_id = auth.uid()
     and nhan_luc is null
  returning noi_dung into n;
  return n;                                       -- null = khong co gi de nhan
end;
$$;
revoke all on function public.nhan_qua_tang(bigint) from public;
grant execute on function public.nhan_qua_tang(bigint) to authenticated;

-- ============================================================
-- 3. KHOA TAI KHOAN
-- ============================================================
create table if not exists public.khoa_tai_khoan (
  user_id  uuid        primary key references auth.users(id) on delete cascade,
  ly_do    text        not null default '',
  luc      timestamptz not null default now()
);
alter table public.khoa_tai_khoan enable row level security;

-- Chi tac gia thay va sua. Nguoi bi khoa KHONG doc duoc bang nay.
drop policy if exists "khoa_tac_gia_doc" on public.khoa_tai_khoan;
create policy "khoa_tac_gia_doc" on public.khoa_tai_khoan
  for select using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);
drop policy if exists "khoa_tac_gia_them" on public.khoa_tai_khoan;
create policy "khoa_tac_gia_them" on public.khoa_tai_khoan
  for insert with check (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);
drop policy if exists "khoa_tac_gia_go" on public.khoa_tai_khoan;
create policy "khoa_tac_gia_go" on public.khoa_tai_khoan
  for delete using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);

-- ---------- Chot chan ghi save cua tai khoan bi khoa ----------
-- ⚠⚠ TRA `null`, KHONG `raise exception`. Y het chot chong gian lan: exception cuon nguoc ca giao
--    dich, con tra null thi Postgres bo qua lenh ghi de mot cach im lang ma so sach van con.
-- ⚠ Ham nay `security definer` de doc duoc bang khoa_tai_khoan bat ke RLS cua nguoi dang ghi.
-- ⚠⚠⚠ PHAI CHAN CA BA LOI GHI: INSERT, UPDATE, DELETE.
--    Chan moi UPDATE la CO LO TO: nguoi bi khoa chi can XOA dong save cua minh roi ghi lai mot
--    dong moi la thoat khoa VINH VIEN (upsert cua client se di duong INSERT). Chot chong gian lan
--    cung chi bat before update, nen dong moi do vao ma khong qua mot phep kiem nao.
--    Chan DELETE con chan luon tro "xoa lich su de rua sach so nghi van".
-- ⚠ search_path dat 'pg_catalog, public' chu khong phai 'public': ham security definer ma de
--   search_path long la mo duong cho tro doi ten ham he thong.
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
  --    la loi luc chay: "record new is not assigned yet". Cai bay nay im lang o luc chay SQL
  --    (ham van tao duoc), chi no ra dung luc co nguoi xoa dong.
  if tg_op = 'DELETE' then ai := old.user_id; else ai := new.user_id; end if;
  if exists (select 1 from public.khoa_tai_khoan k where k.user_id = ai) then
    return null;                                  -- tu choi im lang
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- ⚠⚠ TEN TRIGGER BAT DAU BANG 'a_' LA CO Y.
--    Postgres ban nhieu trigger cung loai theo THU TU TEN. Chot chong gian lan ten la
--    `kiem_toc_do_tren_saves` (chu k). Dat ten chu a thi chot khoa chay TRUOC — tai khoan bi khoa
--    bi chan ngay, khong con lam ban them mot dong nghi van nao nua.
drop trigger if exists a_khoa_tai_khoan_tren_saves on public.saves;
create trigger a_khoa_tai_khoan_tren_saves
  before insert or update or delete on public.saves
  for each row execute function public.chan_tai_khoan_bi_khoa();

-- Ho so cong khai cung phai chan — khong thi nguoi bi khoa van dung ten tren Phong Van Bang.
drop trigger if exists a_khoa_tai_khoan_tren_ho_so on public.ho_so_cong_khai;
create trigger a_khoa_tai_khoan_tren_ho_so
  before insert or update on public.ho_so_cong_khai
  for each row execute function public.chan_tai_khoan_bi_khoa();

-- ============================================================
-- 4. NHAT KY LENH BAI — so ghi CHI THEM DUOC
-- ============================================================
-- ⚠⚠ TAI SAO PHAI CO: Lenh Bai la vat pham quyen luc. Ca he thong an toan cua no dua tren DUNG MOT
--    dieu kien — `auth.uid()` bang uid tac gia. Neu tai khoan tac gia bi lo mat khau thi ke chiem
--    duoc quyen khoa ca lang, phat tien vo toi va mo su kien tuy y.
--    Khong the ngan chuyen do bang SQL. Nhung CO THE lam cho no de bi phat hien: moi lenh deu de lai
--    dau vet, va dau vet do khong ai xoa duoc, ke ca chinh tac gia.
create table if not exists public.lenh_bai_nhat_ky (
  id        bigserial   primary key,
  luc       timestamptz not null default now(),
  ai        uuid,                                 -- nguoi ra lenh (auth.uid luc do)
  viec      text        not null,                 -- su_kien | qua_tang | khoa_tai_khoan
  thao_tac  text        not null,                 -- INSERT | UPDATE | DELETE
  muc_tieu  text,                                 -- ma su kien, hoac uid nguoi bi tac dong
  chi_tiet  jsonb       not null default '{}'::jsonb
);
alter table public.lenh_bai_nhat_ky enable row level security;

-- ⚠⚠ CHI CO LUAT DOC. KHONG co luat insert/update/delete cho BAT KY AI, ke ca tac gia.
--    Ghi vao bang nay chi di duoc mot duong duy nhat: trigger security definer ben duoi.
--    Nho vay so ghi la CHI THEM DUOC — khong ai sua lich su, khong ai xoa dau vet.
drop policy if exists "nhat_ky_tac_gia_doc" on public.lenh_bai_nhat_ky;
create policy "nhat_ky_tac_gia_doc" on public.lenh_bai_nhat_ky
  for select using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);

create or replace function public.ghi_nhat_ky_lenh_bai() returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  d jsonb;
  mt text;
begin
  -- ⚠⚠ RE NHANH THEO tg_op TRUOC. Trigger DELETE thi `new` chua duoc gan; dung `new.x` la loi luc chay.
  --    Doi ca dong sang jsonb MOT LAN roi doc bang khoa chuoi — khoi phai biet ten cot cua tung bang.
  if tg_op = 'DELETE' then d := to_jsonb(old); else d := to_jsonb(new); end if;
  if tg_table_name = 'su_kien' then mt := d->>'ma'; else mt := d->>'user_id'; end if;
  insert into public.lenh_bai_nhat_ky (ai, viec, thao_tac, muc_tieu, chi_tiet)
  values (auth.uid(), tg_table_name, tg_op, mt, d);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- ⚠ AFTER chu khong BEFORE: chi ghi so khi lenh da that su vao duoc.
--   ⚠ Bang qua_tang KHONG ghi so o buoc nguoi choi NHAN qua (ham nhan_qua_tang update thang),
--     vi day la so cua TAC GIA, khong phai so cua nguoi choi.
drop trigger if exists nhat_ky_su_kien on public.su_kien;
create trigger nhat_ky_su_kien after insert or update or delete on public.su_kien
  for each row execute function public.ghi_nhat_ky_lenh_bai();
drop trigger if exists nhat_ky_qua_tang on public.qua_tang;
create trigger nhat_ky_qua_tang after insert or delete on public.qua_tang
  for each row execute function public.ghi_nhat_ky_lenh_bai();
drop trigger if exists nhat_ky_khoa on public.khoa_tai_khoan;
create trigger nhat_ky_khoa after insert or update or delete on public.khoa_tai_khoan
  for each row execute function public.ghi_nhat_ky_lenh_bai();

-- ============================================================
-- ⚠ NHUNG GI TEP NAY KHONG LAM — DOC KY TRUOC KHI TIN
-- · Khong cho tac gia SUA hay XOA save cua nguoi khac. Xem ly do o muc 2.
-- · Khong chan tai khoan bi khoa DANG NHAP. No van vao game duoc (game von OFFLINE-FIRST), chi la
--   save khong day len duoc va ho so cong khai khong cap nhat duoc. Muon chan han phai dung
--   Supabase Auth, khong lam bang SQL o day.
-- · Khong bao cho nguoi bi khoa biet ho da bi khoa. Ho chi thay save ngung dong bo.
-- · Chua cong qua tang vao tran chong gian lan. Vi vay hop qua dang bi chan tran o muc 2.
--
-- ⚠⚠ DIEM YEU CON LAI, KHONG VA DUOC BANG SQL:
--    Toan bo quyen luc cua Lenh Bai treo tren DUNG MOT dieu kien — `auth.uid()` bang uid tac gia.
--    Mat khau tai khoan tac gia lo la mat tat ca. Ba thu giam nhe da lam:
--      1. Hop qua bi chan tran, khong tang duoc so vo han.
--      2. Nhat ky chi them duoc (muc 4) — khong ai xoa duoc dau vet, ke ca tac gia.
--      3. Khong co duong nao SUA save nguoi khac, nen khong pha duoc tien do ai.
--    Viec con lai la cua tai khoan: dat mat khau manh, va bat xac thuc hai lop o Supabase.
-- ============================================================

-- ============================================================
-- CAU SOI SAU KHI CHAY — dan RIENG cau nay de xem ket qua
-- ⚠ Supabase SQL Editor chi hien ket qua cua lenh CUOI CUNG, nen phai chay rieng.
--
--   select 'bang' as loai, tablename as ten, rowsecurity::text as ghi_chu
--     from pg_tables where schemaname='public'
--      and tablename in ('su_kien','qua_tang','khoa_tai_khoan','lenh_bai_nhat_ky')
--   union all
--   select 'luat', tablename||' · '||policyname, cmd
--     from pg_policies where schemaname='public'
--      and tablename in ('su_kien','qua_tang','khoa_tai_khoan','lenh_bai_nhat_ky')
--   union all
--   select 'trigger', tgrelid::regclass::text||' · '||tgname,
--          case tgtype & 28 when 4 then 'insert' when 8 then 'delete' when 16 then 'update' else 'nhieu' end
--     from pg_trigger where not tgisinternal
--      and tgrelid in ('public.saves'::regclass,'public.su_kien'::regclass,
--                      'public.qua_tang'::regclass,'public.khoa_tai_khoan'::regclass,
--                      'public.ho_so_cong_khai'::regclass)
--   union all
--   select 'luat tren saves', policyname, cmd from pg_policies
--    where schemaname='public' and tablename='saves'
--   order by 1,2;
--
-- ⚠⚠ NHIN KY DONG "luat tren saves": neu thay mot luat `delete` cho chu dong thi BAO TOI BIET.
--    Chot khoa da chan delete bang trigger roi, nhung biet chac van hon doan.
-- ============================================================
