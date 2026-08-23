-- ============================================================
-- TIEU DAO LUC — DONG DAU GIO LEN BANG `saves`
--
-- CACH DUNG: Supabase > SQL Editor > dan tron tep nay > Run. Chay lai duoc nhieu lan.
--
-- ⚠⚠ LO NAY LA GI
-- `docs/SQL_CHONG_GIAN_LAN.sql` do toc do bang:
--       giay := greatest(0, extract(epoch from (now() - OLD.updated_at)));
--       cho_phep := (giay + bu) * hs;
-- roi lay `cho_phep` lam co so cho MOI cai tran. Chu thich o dong 241 cua tep do khang dinh
-- "lay THOI GIAN CUA MAY CHU, khong tin moc gio cua client" — nhung ma thuc te thi NGUOC LAI:
-- `OLD.updated_at` chinh la chuoi ma lan day truoc CLIENT tu dat (src/cloud.js, trong loi goi
-- upsert), va khong mot trigger nao ep no ve gio may chu.
--
-- Ke gian lan chi can day mot ban luu voi `updated_at` lui ve nam 2000. Lan ghi ke tiep se co
-- `giay` khoang 8x10^8, va:
--   · tran Bac (SQL_CHONG_GIAN_LAN.sql dong 333) khong co `least` nao chan -> no ra vo cuc
--   · tran quy gio lam (tang 2A, dong 347) cung vay
--   · phep 2D "ngoai su kien" (dong 418) so `OLD.updated_at < dong_luc + 1 gio` -> luon lot
--   · truy van `he_so_may_chu` (dong 294) lay duoc mot dot he so x5 da tat tu lau
-- Khong mot dong nghi van nao duoc ghi.
--
-- ⚠⚠ VI SAO CHUA CHOT LAI THI KHONG DUOC PHEP BO `updated_at` KHOI CLIENT
-- Nghe co ve xuoi: client dung gui cot do nua la xong. KHONG PHAI.
-- Lenh UPDATE khong nhac toi mot cot thi cot do GIU NGUYEN gia tri cu — Postgres khong tu lam
-- moi no. Nen bo o client ma chua co trigger thi `updated_at` dung yen mai mai, `giay` phinh
-- dan theo thoi gian cho MOI NGUOI, va moi cai tran no ra theo. Hong NANG HON hien tai.
-- ⇒ Trigger nay lam cho thu tu KHONG CON QUAN TRONG: no ghi de bat ke client gui gi. Chay tep
--   nay truoc hay sau khi ma len live deu an toan, va client cu de nguyen nhu cu cung khong sao.
--
-- ⚠ TEN TRIGGER PHAI BAT DAU BANG `a_`. Postgres chay trigger BEFORE theo THU TU TEN, va chot
--   do toc do ten la `kiem_toc_do_tren_saves` (chu `k`). Dat ten sau chu `k` la dong dau xong
--   thi chot da doc mat roi. Ba chot dang co tren bang nay deu da co y dung tien to `a_`.
--
-- ⚠ Chot nay dong dau len NEW, ma phep do lai doc OLD. Nen no bat dau co hieu luc tu LAN GHI
--   THU HAI sau khi chay tep nay. Lan ghi dau tien van con dung moc cu cua client — mot lan,
--   roi thoi.
-- ============================================================

create or replace function public.dong_dau_gio() returns trigger
language plpgsql
as $$
begin
  -- Gio cua MAY CHU, khong phai gio client khai. Ghi de vo dieu kien.
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists a_dong_dau_gio_tren_saves on public.saves;
create trigger a_dong_dau_gio_tren_saves
  before insert or update on public.saves
  for each row execute function public.dong_dau_gio();

-- ============================================================
-- SOI LAI SAU KHI CHAY — dan rieng khoi nay de kiem
-- ============================================================
-- select tgname,
--        case when tgenabled = 'D' then 'TAT' else 'BAT' end as trang_thai
--   from pg_trigger
--  where tgrelid = 'public.saves'::regclass and not tgisinternal
--  order by tgname;
--
-- Phai thay `a_dong_dau_gio_tren_saves` DUNG TRUOC `kiem_toc_do_tren_saves` trong danh sach.
-- Neu khong thay dong nao thi tep chua chay.
