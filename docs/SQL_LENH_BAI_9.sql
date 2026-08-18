-- ============================================================
-- TIEU DAO LUC — LENH BAI DOT 8: CO BAT/TAT TINH NANG (bang `tinh_nang`)
--
-- CACH DUNG: Supabase > SQL Editor > dan tron tep nay > Run. Chay lai duoc nhieu lan.
-- Phai chay SAU khi da chay SQL_LENH_BAI.sql.
-- ⚠ NEN CHAY TEP NAY CUOI CUNG trong bo Lenh Bai: no dat lai ham nhat ky dung chung, ban o day
--   la ban day du nhat (biet doc muc tieu cua ca `tinh_nang`). Chay nguoc lai thi so nhat ky
--   van ghi du dong, chi mat cot `muc_tieu` cua rieng bang nay.
--
-- ⚠⚠ DAY LA NEN CUA CA LO TRINH BA NAM (docs/LO_TRINH_3_NAM.md). Moi tinh nang moi day len live
--    o trang thai NGU: co mac dinh TAT, tac gia bat bang Lenh Bai. Khong deploy lai de bat.
--
-- BON CUA FAIL CLOSED — thieu cua nao cung ra TAT:
--   1. `ma` khong nam trong danh sach cho phep -> may chu tu choi ngay luc ghi.
--   2. Khong co dong -> client doc ra rong -> tat.
--   3. `bat` mac dinh FALSE.
--   4. `chi_tac_gia` mac dinh TRUE — lo tay bat ma quen ha co nay thi chi minh tac gia thay.
--
-- ⚠⚠ BANG NAY KHONG DINH TOI CHOT CHONG GIAN LAN nen de o tep rieng duoc. No khong NHAN vao tran
--    nao ca, chi bat/tat duong ve. Khac han `he_so_may_chu` — bang do bat buoc phai nam trong
--    SQL_CHONG_GIAN_LAN.sql.
-- ============================================================

-- ---------- 1. BANG ----------
create table if not exists public.tinh_nang (
  ma          text        primary key,
  bat         boolean     not null default false,
  chi_tac_gia boolean     not null default true,
  cau_hinh    jsonb       not null default '{}'::jsonb,
  cap_nhat    timestamptz not null default now()
);

-- ⚠⚠ DANH SACH CHO PHEP, khong phai danh sach cam. Danh sach cam thi mot ma go nham la LOT vao
--    bang roi nam do mai mai, khong ai doc, khong ai xoa.
--    ⚠ Phai khop TUNG MA voi `TINH_NANG` trong src/data/tinhnang.js. Bai kiem 43 soi hai dau.
alter table public.tinh_nang drop constraint if exists tinh_nang_ma_hop_le;
alter table public.tinh_nang add constraint tinh_nang_ma_hop_le
  check (ma in (
    'noiDungBac2', 'tongMonDrama', 'bangChien', 'sanThuMua', 'phoLuc',
    'dauTruong', 'muaGiai', 'bangChienPvp', 'coOnline', 'dongPhuHub',
    'banDoBac3', 'cheTacBac3', 'cotTruyen2',
    -- Ma NGOAI lo trinh ba nam, them 2026-08-18 (man Thinh Kinh).
    'thinhKinh'
  ));

-- ⚠ `cau_hinh` phai la mot doi tuong. Nhet mot con so hay mot mang vao day thi client doc ra
--   thu no khong biet lam gi, ma khong bao loi o dau ca.
alter table public.tinh_nang drop constraint if exists tinh_nang_cau_hinh_hop_le;
alter table public.tinh_nang add constraint tinh_nang_cau_hinh_hop_le
  check (jsonb_typeof(cau_hinh) = 'object');

alter table public.tinh_nang enable row level security;

-- ⚠⚠ GIEO TAT HET. `do nothing` chu khong `do update`: chay lai tep nay KHONG duoc dap len
--    nhung co tac gia da bat. Da dinh dung bay do o bang `mo_khoa`.
insert into public.tinh_nang (ma) values
  ('noiDungBac2'), ('tongMonDrama'), ('bangChien'), ('sanThuMua'), ('phoLuc'),
  ('dauTruong'), ('muaGiai'), ('bangChienPvp'), ('coOnline'), ('dongPhuHub'),
  ('banDoBac3'), ('cheTacBac3'), ('cotTruyen2'),
  ('thinhKinh')
on conflict (ma) do nothing;

-- ---------- 2. LUAT ----------
-- Ai cung doc duoc, ke ca khach chua dang nhap: client phai biet co nao dang bat de ve dung
-- giao dien. Khong lo gi — bang chi co ten co, khong co so lieu nguoi choi.
drop policy if exists "tinh_nang_ai_cung_doc" on public.tinh_nang;
create policy "tinh_nang_ai_cung_doc" on public.tinh_nang for select using (true);

drop policy if exists "tinh_nang_tac_gia_sua" on public.tinh_nang;
create policy "tinh_nang_tac_gia_sua" on public.tinh_nang
  for update using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid)
          with check (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);
drop policy if exists "tinh_nang_tac_gia_them" on public.tinh_nang;
create policy "tinh_nang_tac_gia_them" on public.tinh_nang
  for insert with check (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);

-- ⚠ KHONG cap quyen delete. Xoa mot dong thi client doc ra rong roi coi la TAT — dung phia an
--   toan, nhung ca tab Tinh Nang mat dong do va tac gia khong con duong nao bat lai ngoai viec
--   chay lai tep nay. Sua `bat` ve false la du.

-- ---------- 3. NHAT KY ----------
-- ⚠ Ban day du nhat cua ham dung chung: nhanh mac dinh doc CA `ma` lan `khoa` lan `user_id` nen
--   them bang moi khong phai sua ham nua.
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
  if tg_table_name = 'cao_thi' then mt := coalesce(d->>'muc_tieu', d->>'tieu_de');
  else mt := coalesce(d->>'ma', d->>'khoa', d->>'user_id'); end if;
  insert into public.lenh_bai_nhat_ky (ai, viec, thao_tac, muc_tieu, chi_tiet)
  values (auth.uid(), tg_table_name, tg_op, mt, d);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists nhat_ky_tinh_nang on public.tinh_nang;
create trigger nhat_ky_tinh_nang after insert or update or delete on public.tinh_nang
  for each row execute function public.ghi_nhat_ky_lenh_bai();

-- ============================================================
-- ⚠ NHUNG GI TEP NAY KHONG LAM
-- · KHONG tu bat theo lich. Tac gia bam tay o man Lenh Bai. Muon mo dong theo gio thi do la viec
--   cua bang `su_kien` — bang do ghi MOC, khong ghi cong tac.
-- · KHONG chan duoc nguoi sua ma client. Co o client chi de VE. Tinh nang nao dung toi so lieu
--   may chu thi phai co luat RLS rieng cua no, y het moi bang khac.
-- · KHONG xoa du lieu cua tinh nang bi tat lai. Tat roi bat lai la thay nguyen trang thai cu.
-- ============================================================

-- ============================================================
-- CAU SOI SAU KHI CHAY — dan RIENG cau nay de xem ket qua
-- ⚠ Supabase SQL Editor chi hien ket qua cua lenh CUOI CUNG.
--
--   select ma,
--          case when not bat then 'TAT'
--               when chi_tac_gia then 'CHI TAC GIA'
--               else 'CA GIANG HO' end as trang_thai,
--          cau_hinh, cap_nhat
--     from public.tinh_nang order by ma;
-- ============================================================
