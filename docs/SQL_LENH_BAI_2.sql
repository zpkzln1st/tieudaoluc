-- ============================================================
-- TIEU DAO LUC — LENH BAI DOT 2: DANH SACH NGUOI CHOI
--
-- CACH DUNG: Supabase > SQL Editor > dan tron tep nay > Run. Chay lai duoc nhieu lan.
-- Phai chay SAU khi da chay SQL_LENH_BAI.sql va SQL_GIAM_SAT.sql.
--
-- Tep nay KHONG tao bang moi, KHONG doi luat nao. No chi them mot VIEW de man Lenh Bai
-- liet ke duoc nguoi choi ma khong phai keo ca bang saves ve may.
-- Xem docs/THIET_KE_LENH_BAI.md muc A4.
-- ============================================================

-- ---------- 1. VIEW DANH SACH NGUOI CHOI ----------
-- ⚠⚠ TUYET DOI KHONG DUA COT `data` VAO VIEW NAY.
--    Mot dong save nang khoang 120 KB. Man Lenh Bai doc danh sach nay MOI LAN MO —
--    lo dua `data` vao la moi lan mo keo ve ca tram MB. Muon soi ban luu cua mot nguoi
--    thi doc rieng dong do (client goi cloudDocSaveCua), khong doc qua view.
--
-- ⚠ `security invoker` (mac dinh cua Postgres) nen view VAN chiu RLS cua hai bang goc:
--    · saves            — luat `saves_tac_gia_doc` cho tac gia doc moi dong; nguoi thuong chi thay dong minh.
--    · ho_so_cong_khai  — luat `ho_so_ai_cung_xem` cho ai cung doc.
--    Nguoi thuong goi view nay ra DUNG MOT dong cua chinh ho. Do la dung.
--
-- ⚠ `left join` chu khong `join`: nguoi choi co ban luu tren may chu ma CHUA bam Khoe thi
--   khong co dong trong ho_so_cong_khai. Dung `join` la ho bien mat khoi danh sach quan ly.
create or replace view public.nguoi_choi_gom as
  select s.user_id,
         s.updated_at,
         s.last_save,
         h.ten,
         h.tong_cap,
         h.chien_dau,
         h.chien_luc,
         h.avatar,
         h.danh_hieu,
         h.cap_nhat as ho_so_luc
    from public.saves s
    left join public.ho_so_cong_khai h on h.user_id = s.user_id;

-- ---------- 2. CHI MUC CHO PHEP SAP THEO LAN DONG BO ----------
-- Man Lenh Bai sap danh sach theo `updated_at` giam dan (ai vao gan nhat len dau),
-- va man Thong Ke dem so nguoi vao trong 24 gio / 7 ngay.
create index if not exists saves_updated_at_desc on public.saves (updated_at desc);

-- ============================================================
-- ⚠ NHUNG GI TEP NAY KHONG LAM
-- · Khong cap them quyen nao. Tac gia doc duoc saves la nho luat `saves_tac_gia_doc`
--   da tao tu SQL_GIAM_SAT.sql — tep nay chi gom san du lieu cho de doc.
-- · Khong cho SUA hay XOA ban luu cua nguoi khac. Van chi doc.
-- ============================================================

-- ============================================================
-- CAU SOI SAU KHI CHAY — dan RIENG cau nay de xem ket qua
-- ⚠ Supabase SQL Editor chi hien ket qua cua lenh CUOI CUNG.
--
--   select 'view' as loai, table_name as ten,
--          case when exists (select 1 from information_schema.columns
--                             where table_schema='public' and table_name='nguoi_choi_gom'
--                               and column_name='data')
--               then 'HONG — view co cot data' else 'OK — khong co cot data' end as ghi_chu
--     from information_schema.views
--    where table_schema='public' and table_name='nguoi_choi_gom'
--   union all
--   select 'chi muc', indexname, 'OK' from pg_indexes
--    where schemaname='public' and indexname='saves_updated_at_desc'
--   union all
--   select 'so dong doc duoc', count(*)::text, 'phai bang so tai khoan' from public.nguoi_choi_gom
--   order by 1,2;
-- ============================================================
