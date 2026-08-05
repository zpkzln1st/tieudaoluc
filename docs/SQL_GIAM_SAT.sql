-- ============================================================
-- TIEU DAO LUC — Dot C: QUYEN TAC GIA (man Giam Sat)
--
-- CACH DUNG: Supabase > SQL Editor > dan tron tep nay > Run. Chay lai duoc nhieu lan.
-- Phai chay SAU khi da chay SQL_HO_SO_CONG_KHAI.sql va SQL_CHONG_GIAN_LAN.sql.
--
-- ⚠⚠ ĐAY MOI LA HANG RAO THAT.
--    Trong game co getter `isAuthorAccount` de an/hien man Giam Sat, nhung do CHI LA GIAO DIEN —
--    ai sua ma client cung bat duoc panel. Cai chan that la may luat duoi day: bat duoc panel ma
--    khong dang nhap dung uid tac gia thi moi truy van tra ve RONG.
--    Phai lam CA HAI va dung nham cai nao giu cua.
-- ============================================================

-- Uid tac gia — LAY TU CHUNG CHI DA KY ECDSA trong src/engine/author.js (AUTHOR_CERT.uid).
-- Khong ai muon uid nay duoc: Supabase tu xac thuc uid tu token dang nhap.
-- ⚠ Doi tai khoan tac gia = phai ky lai chung chi VA sua uid o day cho khop.

-- ---------- 1. SO NGHI VAN: chi tac gia doc ----------
-- Bo luat "khong ai doc" cu; RLS van bat, va chi con DUNG MOT cua cho tac gia.
drop policy if exists "nghi_van_khong_ai_doc" on public.nghi_van;
drop policy if exists "nghi_van_tac_gia_doc" on public.nghi_van;
create policy "nghi_van_tac_gia_doc" on public.nghi_van
  for select using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);

-- ---------- 2. SAVE: tac gia doc duoc moi dong ----------
-- ⚠ Day la quyen NANG. Save chua toan bo tien do nguoi choi (~120 KB/dong). Chi doc khi can soi
--   mot tai khoan cu the — man Giam Sat KHONG keo ca bang ve.
--   Luat cu (chu doc save cua chinh minh) van giu nguyen, khong dung toi.
drop policy if exists "saves_tac_gia_doc" on public.saves;
create policy "saves_tac_gia_doc" on public.saves
  for select using (auth.uid() = '942e0821-009d-4c43-b191-a4701656d2c1'::uuid);

-- ---------- 3. GOM SO NGHI VAN THEO TAI KHOAN ----------
-- Man Giam Sat can "moi tai khoan bao nhieu dong, lan gan nhat luc nao, vuot gap may" — gom o
-- may chu thi ve mot dong moi tai khoan, thay vi keo ca so nghi van ve may.
-- ⚠ `security invoker` (mac dinh) nen view VAN chiu RLS cua nghi_van: nguoi thuong goi ra rong.
create or replace view public.nghi_van_gom as
  select user_id,
         count(*)                                        as so_dong,
         max(luc)                                        as gan_nhat,
         max((select max((x->>'gap')::numeric)
              from jsonb_array_elements(chi_tiet) x))    as gap_nhat,
         bool_or(la_tac_gia)                             as la_tac_gia
    from public.nghi_van
   group by user_id;

-- ============================================================
-- ⚠ NHUNG GI DOT NAY KHONG LAM
-- · Khong cho tac gia SUA hay XOA save cua nguoi khac. Chi doc.
-- · Khong tu khoa tai khoan. Ghi so xong van do nguoi doc quyet dinh.
-- · Chot van CHUA CHAN (xem SQL_CHONG_GIAN_LAN.sql). Xem so mot thoi gian roi hay tinh.
-- ============================================================
