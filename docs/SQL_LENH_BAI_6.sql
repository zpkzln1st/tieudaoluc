-- ============================================================
-- TIEU DAO LUC — LENH BAI DOT 6: MOC BAO TRI
--
-- CACH DUNG: Supabase > SQL Editor > dan tron tep nay > Run. Chay lai duoc nhieu lan.
-- Phai chay SAU khi da chay SQL_LENH_BAI.sql va SQL_LENH_BAI_3.sql (can bang `cao_thi`).
--
-- KHONG de ra bang moi. Bao tri la mot dong `cao_thi` muc 'bao_tri' gui CA GIANG HO —
-- cung mot cho dat lich, cung mot cho go, cung mot cho nguoi choi doc.
--
-- ⚠⚠ HE SO TOAN MAY CHU KHONG NAM O DAY. Bang `he_so_may_chu` nam trong
--    docs/SQL_CHONG_GIAN_LAN.sql — chot doc no o moi lan ghi save, ma ham plpgsql truy van mot
--    bang chua ton tai thi no LUC CHAY, tuc la ca lang khong luu duoc save. De chung mot tep
--    voi chot thi chay tep do la co ca hai, khong bao gio lech.
--    ⇒ Bat he so lan dau PHAI chay lai docs/SQL_CHONG_GIAN_LAN.sql truoc.
-- ============================================================

-- ---------- CHOT BAO TRI ----------
-- ⚠ Game von OFFLINE-FIRST: khong chan duoc nguoi choi choi tiep. Chot nay chi tu choi GHI DE
--   ban luu trong khoang bao tri. Ban luu don lai trong may ho va day len mot lan khi het han.
-- ⚠ Don lau van an toan voi chot toc do: tran theo nhip gian ra theo thoi gian troi, con tran
--   treo may toi da la 14 gio.
create or replace function public.chan_khi_bao_tri() returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  ai uuid;
begin
  -- ⚠⚠ RE NHANH THEO tg_op TRUOC KHI DUNG new/old. Trigger DELETE thi `new` chua duoc gan.
  if tg_op = 'DELETE' then ai := old.user_id; else ai := new.user_id; end if;

  -- ⚠⚠ TAC GIA KHONG BAO GIO BI CHAN. Bao tri ma chinh minh cung khong ghi duoc thi vao sua cai gi.
  if ai = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  -- Chi cao thi CHUNG (muc_tieu rong) moi la lenh bao tri. Thu rieng thi khong.
  if exists (
    select 1 from public.cao_thi
     where muc = 'bao_tri'
       and muc_tieu is null
       and (mo_luc  is null or mo_luc  <= now())
       and (dong_luc is null or dong_luc >  now())
  ) then
    return null;                                   -- tu choi IM LANG, giong chot khoa
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- ⚠ Ten bat dau bang `a_` de ban TRUOC `kiem_toc_do_tren_saves` (Postgres ban trigger theo TEN).
--   Dat sau chot toc do thi mot lan ghi trong luc bao tri van kip ghi so nghi van.
drop trigger if exists a_bao_tri_tren_saves on public.saves;
create trigger a_bao_tri_tren_saves
  before insert or update on public.saves
  for each row execute function public.chan_khi_bao_tri();

-- ============================================================
-- ⚠ NHUNG GI TEP NAY KHONG LAM
-- · Khong chan nguoi choi CHOI TIEP. Ho van cay binh thuong, chi la ban luu khong len may chu.
-- · Khong bao cho ho biet vi sao khong dong bo duoc — nhung cao thi muc 'bao_tri' thi ho da doc
--   roi, vi cung mot dong do vua bat chot vua hien len man hinh.
-- · Khong tu go. Cao thi ghi MOC nen het gio la tu het; quen go cung khong treo mai mai.
-- ============================================================

-- ============================================================
-- CAU SOI SAU KHI CHAY — dan RIENG cau nay de xem ket qua
-- ⚠ Supabase SQL Editor chi hien ket qua cua lenh CUOI CUNG.
--
--   select 'trigger' as muc, tgname as ten,
--          concat_ws('+',
--            case when (tgtype &  4) > 0 then 'insert' end,
--            case when (tgtype &  8) > 0 then 'delete' end,
--            case when (tgtype & 16) > 0 then 'update' end) as ket_qua
--     from pg_trigger where tgrelid = 'public.saves'::regclass and not tgisinternal
--   union all
--   select 'ham', 'chan_khi_bao_tri',
--          case when p.prosecdef then 'security definer' else 'HONG' end
--     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--    where n.nspname = 'public' and p.proname = 'chan_khi_bao_tri'
--   union all
--   select 'bang he so', 'he_so_may_chu',
--          case when to_regclass('public.he_so_may_chu') is null
--               then 'HONG — chua chay lai SQL_CHONG_GIAN_LAN.sql' else 'OK' end
--   union all
--   select 'chot doc he so', 'kiem_toc_do',
--          case when pg_get_functiondef('public.kiem_toc_do'::regproc) like '%he_so_may_chu%'
--               then 'OK' else 'HONG — van dung ban cu' end
--   order by 1, 2;
-- ============================================================
