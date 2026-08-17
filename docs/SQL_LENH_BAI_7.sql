-- ============================================================
-- TIEU DAO LUC — LENH BAI DOT 7: HOP QUA MANG VAT PHAM
--
-- ⚠⚠ TEP NAY DUOC SINH RA — dung sua tay.
--    Nguon: src/data/items.js. Them vat pham moi thi chay lai:
--    cd _mockup/_covua_wip && ELECTRON_RUN_AS_NODE=1 Code.exe _sinh_sql_vatpham.mjs
--
-- CACH DUNG: Supabase > SQL Editor > dan tron tep nay > Run. Chay lai duoc nhieu lan.
-- Phai chay SAU khi da chay SQL_LENH_BAI.sql va SQL_LENH_BAI_5.sql.
--
-- 405 vat pham xep chong. Da bo 72 muc (trang bi + ma khong dung khuon).
-- Gia tri cao nhat: maToTam = 12.000.
-- ============================================================

-- ---------- 1. DANH SACH VAT PHAM HOP LE ----------
-- ⚠ Postgres khong doc duoc src/data/items.js. Danh sach phai nam trong mot BANG thi rang buoc
--   moi soi duoc — nhung rang buoc `check` KHONG duoc chua truy van con, nen viec soi bang
--   phai lam trong TRIGGER (muc 3), khong lam trong check.
create table if not exists public.vat_pham_hop_le (
  ma      text    primary key,
  gia_tri numeric not null default 0
);
alter table public.vat_pham_hop_le enable row level security;
-- Ai cung doc duoc: giao dien Lenh Bai can liet ke de chon.
drop policy if exists "vat_pham_ai_cung_doc" on public.vat_pham_hop_le;
create policy "vat_pham_ai_cung_doc" on public.vat_pham_hop_le for select using (true);

-- Xoa ma khong con trong game roi nap lai. Chay lai tep nay la bang khop data hien tai.
delete from public.vat_pham_hop_le;
insert into public.vat_pham_hop_le (ma, gia_tri) values
  ('tungMoc', 2),
  ('trucMoc', 5),
  ('bachDuongMoc', 9),
  ('phongMoc', 16),
  ('hongMoc', 30),
  ('hanTung', 22),
  ('phuVanMoc', 50),
  ('tinhHoaMoc', 80),
  ('tramHaiMoc', 130),
  ('thanDanMoc', 200),
  ('thanhNgaiThao', 2),
  ('tuDangHoa', 4),
  ('duongQuyCan', 6),
  ('thachHocLan', 11),
  ('tuyetLienHoa', 15),
  ('ngocTuyenSam', 21),
  ('vanLoChi', 35),
  ('thatTinhThao', 56),
  ('tramVuLan', 90),
  ('cuuDiepLinhChi', 140),
  ('hacThan', 3),
  ('tichKhoang', 3),
  ('dongKhoang', 6),
  ('thietKhoang', 10),
  ('thachKhoi', 8),
  ('tinhThachKhoang', 24),
  ('hanThietKhoang', 42),
  ('hoangKimSa', 65),
  ('vanMauThach', 95),
  ('vanThiet', 130),
  ('sanHoKhoang', 190),
  ('thanTinhKhoang', 270),
  ('caTuyet', 2),
  ('caHoi', 4),
  ('caTon', 7),
  ('luNgu', 11),
  ('tinhLanNgu', 22),
  ('bangLanNgu', 40),
  ('ocTuyenNgu', 60),
  ('vanLyNgu', 88),
  ('tinhDieuNgu', 120),
  ('haiGiaoNgu', 175),
  ('thienTriNgu', 250),
  ('tichDinh', 8),
  ('dongDinh', 16),
  ('thietDinh', 28),
  ('tinhThachDinh', 55),
  ('hanThietDinh', 95),
  ('hoangKimDinh', 145),
  ('vanMauDinh', 210),
  ('vanThietDinh', 290),
  ('sanHoDinh', 420),
  ('thanTinhDinh', 600),
  ('khaoCaTuyet', 5),
  ('khaoCaHoi', 9),
  ('khaoCaTon', 15),
  ('tinhLanHap', 35),
  ('bangLanNuong', 60),
  ('ocTuyenHap', 92),
  ('vanLyTan', 135),
  ('tinhDieuNuong', 185),
  ('haiGiaoHam', 270),
  ('thienTriTan', 380),
  ('datSet', 2),
  ('cat', 2),
  ('vanYeu', 10),
  ('gach', 18),
  ('thietKhau', 40),
  ('tieuPhuLinhThach', 9),
  ('tuKhiThachTrung', 40),
  ('tuKhiThachThuong', 92),
  ('thoiVanThachSo', 12),
  ('thoiVanThachTrung', 50),
  ('thoiVanThachThuong', 128),
  ('boiSanThachSo', 10),
  ('boiSanThachTrung', 45),
  ('boiSanThachThuong', 110),
  ('khoangPhuLinhThach', 50),
  ('thanhNgoa', 15),
  ('luongMoc', 40),
  ('thachChuyen', 32),
  ('tinhThachSong', 120),
  ('hanNgocChuyen', 140),
  ('kimTatTru', 260),
  ('daCuongHoaSo', 30),
  ('daCuongHoaTrung', 95),
  ('daCuongHoaCao', 260),
  ('tinhTheYeuVuong', 800),
  ('linhPhach', 70),
  ('manhTrangBi', 0),
  ('dpset_kimQuang', 0),
  ('dpset_anBang', 0),
  ('dpset_nhuTinh', 0),
  ('dpset_bachHong', 0),
  ('dpset_thuongLan', 0),
  ('dpset_dinhQuoc', 0),
  ('dpset_thanhHu', 0),
  ('dpset_hongAnh', 0),
  ('dpset_tuDien', 0),
  ('dpset_thatSat', 0),
  ('dpset_minhVuong', 0),
  ('dpchieu_vdpt', 900),
  ('dpchieu_bmdh', 900),
  ('dpchieu_vmqn', 900),
  ('dpchieu_tatn', 900),
  ('dpchieu_bctn', 900),
  ('dpchieu_vtsk', 900),
  ('dpchieu_tnhn', 900),
  ('hoiKhiDan', 25),
  ('quanKhiDan', 16),
  ('hoatHuyetDan', 8),
  ('tucMenhDan', 20),
  ('hoanHonDan', 70),
  ('cuongNguyenTan', 9),
  ('cuongNguyenHoan', 39),
  ('cuongNguyenDan', 148),
  ('bachBaoTan', 11),
  ('bachBaoHoan', 46),
  ('bachBaoDan', 156),
  ('ngoDaoTan', 11),
  ('ngoDaoHoan', 48),
  ('ngoDaoDan', 168),
  ('duongThuTan', 10),
  ('duongThuHoan', 44),
  ('duongThuDan', 152),
  ('tichSao', 40),
  ('thietKiem', 120),
  ('tichGiap', 60),
  ('langBi', 6),
  ('truNha', 10),
  ('hungChuong', 20),
  ('hoVi', 35),
  ('hacThietPhien', 30),
  ('tangNgan', 45),
  ('thuyTinhSa', 60),
  ('uMinhThach', 90),
  ('tuyetLangBi', 95),
  ('hanThietTinh', 130),
  ('huyenSa', 165),
  ('saMangDam', 200),
  ('phuQuangPhan', 240),
  ('vanVuLong', 290),
  ('tinhTuy', 340),
  ('huKhongTinh', 430),
  ('giaoChau', 540),
  ('meVuHon', 620),
  ('thanThietTinh', 780),
  ('coMaHaiCot', 950),
  ('hoPhuDauLinh', 350),
  ('hachCoLinh', 1600),
  ('cuuViTinh', 5000),
  ('maToTam', 12000),
  ('moiHongTrung', 1),
  ('moiTepDong', 3),
  ('moiTuuKhuc', 8),
  ('moiHanTuy', 15),
  ('moiVanMong', 32),
  ('moiGiaoLongDan', 65),
  ('moiThienCau', 95),
  ('eq_ao_vai_tho', 52),
  ('eq_te_lan_giap', 262),
  ('eq_toan_nghe_giap', 668),
  ('eq_van_luu_quy_tong_y', 1270),
  ('eq_toa_tu_giap', 2198),
  ('eq_tuyen_long_bao', 3382),
  ('eq_minh_vuong_khai_giap', 5020),
  ('eq_xich_dong_thuc_dai', 52),
  ('eq_thanh_xa_linh_dai', 262),
  ('eq_bach_ngoc_bao_dai', 668),
  ('eq_thanh_truc_cam_dai', 1270),
  ('eq_huyen_thiet_chien_dai', 2198),
  ('eq_luu_van_phi_dai', 3382),
  ('eq_kim_long_bao_dai', 5020),
  ('eq_tho_bi_thu_sao', 52),
  ('eq_thiet_cot_ho_thu', 262),
  ('eq_xich_dong_ti_giap', 668),
  ('eq_hac_long_lan_thu', 1270),
  ('eq_bang_tam_linh_thu', 2198),
  ('eq_hoa_diem_chien_thu', 3382),
  ('eq_loi_dinh_thu_sao', 5020),
  ('eq_vai_giay', 52),
  ('eq_lang_ba_ly', 262),
  ('eq_tien_van_ly', 668),
  ('eq_phi_van_ly', 1270),
  ('eq_phong_anh_hai', 2198),
  ('eq_loi_quang_chien_ngoa', 3382),
  ('eq_thien_hanh_than_ly', 5020),
  ('eq_bo_can', 52),
  ('eq_thanh_truc_dau_lap', 262),
  ('eq_ho_bi_chien_mao', 668),
  ('eq_la_han_bao_quan', 1270),
  ('eq_cuu_long_kim_quan', 2198),
  ('eq_bich_ngoc_hoang_quan', 3382),
  ('eq_lien_hoa_dao_quan', 5020),
  ('eq_thanh_tong_ma', 52),
  ('eq_dai_uyen_luong_cau', 262),
  ('eq_dich_lu', 668),
  ('eq_o_van_dap_tuyet', 1270),
  ('eq_han_huyet_bao_cau', 2198),
  ('eq_phi_van', 3382),
  ('eq_chieu_da_ngoc_su_tu', 5020),
  ('eq_luc_truc_ban_chi', 52),
  ('eq_bach_ngoc_gioi_chi', 262),
  ('eq_tu_kim_linh_gioi', 668),
  ('eq_hoang_long_ban_chi', 1270),
  ('eq_hoa_long_chau_gioi', 2198),
  ('eq_tu_vi_tinh_hoan', 3382),
  ('eq_can_khon_huyen_gioi', 5020),
  ('eq_bich_ngoc_boi', 52),
  ('eq_duong_chi_ngoc_boi', 262),
  ('eq_lien_tam_boi', 668),
  ('eq_chien_van_linh_phu', 1270),
  ('eq_bich_hai_trieu_sinh_boi', 2198),
  ('eq_long_phuong_song_boi', 3382),
  ('eq_kim_quang_tien_phu', 5020),
  ('eq_kiem_1', 52),
  ('eq_kiem_2', 262),
  ('eq_kiem_3', 668),
  ('eq_kiem_4', 1270),
  ('eq_kiem_5', 2198),
  ('eq_kiem_6', 3382),
  ('eq_kiem_7', 5020),
  ('eq_dao_1', 52),
  ('eq_dao_2', 262),
  ('eq_dao_3', 668),
  ('eq_dao_4', 1270),
  ('eq_dao_5', 2198),
  ('eq_dao_6', 3382),
  ('eq_dao_7', 5020),
  ('eq_cung_1', 52),
  ('eq_cung_2', 262),
  ('eq_cung_3', 668),
  ('eq_cung_4', 1270),
  ('eq_cung_5', 2198),
  ('eq_cung_6', 3382),
  ('eq_cung_7', 5020),
  ('eq_amkhi_1', 52),
  ('eq_amkhi_2', 262),
  ('eq_amkhi_3', 668),
  ('eq_amkhi_4', 1270),
  ('eq_amkhi_5', 2198),
  ('eq_amkhi_6', 3382),
  ('eq_amkhi_7', 5020),
  ('eq_riu_1', 51),
  ('eq_riu_2', 219),
  ('eq_riu_3', 543),
  ('eq_riu_4', 1025),
  ('eq_riu_5', 1767),
  ('eq_riu_6', 2715),
  ('eq_riu_7', 4025),
  ('eq_cuoc_1', 51),
  ('eq_cuoc_2', 219),
  ('eq_cuoc_3', 543),
  ('eq_cuoc_4', 1025),
  ('eq_cuoc_5', 1767),
  ('eq_cuoc_6', 2715),
  ('eq_cuoc_7', 4025),
  ('eq_canCau_1', 51),
  ('eq_canCau_2', 219),
  ('eq_canCau_3', 543),
  ('eq_canCau_4', 1025),
  ('eq_canCau_5', 1767),
  ('eq_canCau_6', 2715),
  ('eq_canCau_7', 4025),
  ('eq_duocLiem_1', 51),
  ('eq_duocLiem_2', 219),
  ('eq_duocLiem_3', 543),
  ('eq_duocLiem_4', 1025),
  ('eq_duocLiem_5', 1767),
  ('eq_duocLiem_6', 2715),
  ('eq_duocLiem_7', 4025),
  ('eq_kim_quang_trich_tinh_hoan', 5020),
  ('eq_kim_quang_duong_nghe_giap', 5020),
  ('eq_kim_quang_bach_kim_yeu_dai', 5020),
  ('eq_kim_quang_thien_tam_ho_uyen', 5020),
  ('eq_kim_quang_thien_tam_ngoa', 5020),
  ('eq_kim_quang_nha_dien_chi_hon', 5020),
  ('eq_kim_quang_ngu_sac_ngoc_boi', 5020),
  ('eq_an_bang_tran_nhac_quan', 5020),
  ('eq_an_bang_ho_quoc_giap', 5020),
  ('eq_an_bang_dinh_son_dai', 5020),
  ('eq_an_bang_ban_thach_uyen', 5020),
  ('eq_an_bang_tran_dia_ngoa', 5020),
  ('eq_an_bang_tran_tam_gioi', 5020),
  ('eq_an_bang_ho_linh_boi', 5020),
  ('eq_nhu_tinh_luu_hoa_quan', 5020),
  ('eq_nhu_tinh_ngoc_vu_giap', 5020),
  ('eq_nhu_tinh_toa_huong_dai', 5020),
  ('eq_nhu_tinh_lien_tam_uyen', 5020),
  ('eq_nhu_tinh_lang_ba_ngoa', 5020),
  ('eq_nhu_tinh_ngung_mong_gioi', 5020),
  ('eq_nhu_tinh_tam_nguyet_boi', 5020),
  ('eq_bach_hong_xung_tieu_quan', 5020),
  ('eq_bach_hong_luu_quang_giap', 5020),
  ('eq_bach_hong_toa_van_dai', 5020),
  ('eq_bach_hong_pha_anh_uyen', 5020),
  ('eq_bach_hong_truy_phong_ngoa', 5020),
  ('eq_bach_hong_ngung_nguyet_gioi', 5020),
  ('eq_bach_hong_huyen_quang_boi', 5020),
  ('eq_thuong_lan_kinh_dao_quan', 5020),
  ('eq_thuong_lan_han_nguyet_giap', 5020),
  ('eq_thuong_lan_hoanh_giang_dai', 5020),
  ('eq_thuong_lan_pha_lang_uyen', 5020),
  ('eq_thuong_lan_dap_lang_ngoa', 5020),
  ('eq_thuong_lan_ngung_suong_gioi', 5020),
  ('eq_thuong_lan_hai_tam_boi', 5020),
  ('eq_dinh_quoc_thien_uy_quan', 5020),
  ('eq_dinh_quoc_huyen_giap', 5020),
  ('eq_dinh_quoc_tran_quan_dai', 5020),
  ('eq_dinh_quoc_thiet_ho_uyen', 5020),
  ('eq_dinh_quoc_dap_tran_ngoa', 5020),
  ('eq_dinh_quoc_ho_menh_gioi', 5020),
  ('eq_dinh_quoc_long_van_boi', 5020),
  ('eq_thanh_hu_lang_van_quan', 5020),
  ('eq_thanh_hu_ngu_phong_giap', 5020),
  ('eq_thanh_hu_toa_linh_dai', 5020),
  ('eq_thanh_hu_van_tu_uyen', 5020),
  ('eq_thanh_hu_truc_van_ngoa', 5020),
  ('eq_thanh_hu_ngung_than_gioi', 5020),
  ('eq_thanh_hu_huyen_ngoc_boi', 5020),
  ('eq_hong_anh_vo_tung_quan', 5020),
  ('eq_hong_anh_am_hanh_giap', 5020),
  ('eq_hong_anh_toa_hon_dai', 5020),
  ('eq_hong_anh_liet_ngan_uyen', 5020),
  ('eq_hong_anh_me_tung_ngoa', 5020),
  ('eq_hong_anh_nhiep_phach_gioi', 5020),
  ('eq_hong_anh_tan_nguyet_boi', 5020),
  ('eq_tu_dien_chan_dinh_quan', 5020),
  ('eq_tu_dien_kinh_loi_giap', 5020),
  ('eq_tu_dien_bon_loi_dai', 5020),
  ('eq_tu_dien_liet_dien_uyen', 5020),
  ('eq_tu_dien_dien_bo_ngoa', 5020),
  ('eq_tu_dien_ngung_quang_gioi', 5020),
  ('eq_tu_dien_huyen_loi_boi', 5020),
  ('eq_that_sat_tham_lang_quan', 5020),
  ('eq_that_sat_huyen_minh_giap', 5020),
  ('eq_that_sat_doat_menh_dai', 5020),
  ('eq_that_sat_doan_mach_uyen', 5020),
  ('eq_that_sat_truy_anh_ngoa', 5020),
  ('eq_that_sat_ngung_huyet_gioi', 5020),
  ('eq_that_sat_pha_quan_boi', 5020),
  ('eq_minh_vuong_tran_thien_quan', 5020),
  ('eq_minh_vuong_ho_tam_giap', 5020),
  ('eq_minh_vuong_toa_son_dai', 5020),
  ('eq_minh_vuong_kim_cang_uyen', 5020),
  ('eq_minh_vuong_dap_van_ngoa', 5020),
  ('eq_minh_vuong_tran_hon_gioi', 5020),
  ('eq_minh_vuong_tran_bat_dong_boi', 5020),
  ('ddTinh1', 40),
  ('ddTinh2', 160),
  ('ddTinh3', 360),
  ('ddTinh4', 640),
  ('ddTinh5', 1000),
  ('ddTinh6', 1440),
  ('ddTinh7', 1960),
  ('ddTinh8', 2560),
  ('ddTinh9', 3240),
  ('ddKhi1', 40),
  ('ddKhi2', 160),
  ('ddKhi3', 360),
  ('ddKhi4', 640),
  ('ddKhi5', 1000),
  ('ddKhi6', 1440),
  ('ddKhi7', 1960),
  ('ddKhi8', 2560),
  ('ddKhi9', 3240),
  ('ddThan1', 40),
  ('ddThan2', 160),
  ('ddThan3', 360),
  ('ddThan4', 640),
  ('ddThan5', 1000),
  ('ddThan6', 1440),
  ('ddThan7', 1960),
  ('ddThan8', 2560),
  ('ddThan9', 3240),
  ('egg_bachHo_pham', 120),
  ('egg_bachHo_linh', 450),
  ('egg_bachHo_than', 1400),
  ('egg_huyenQuy_pham', 120),
  ('egg_huyenQuy_linh', 450),
  ('egg_huyenQuy_than', 1400),
  ('egg_huyetLang_pham', 120),
  ('egg_huyetLang_linh', 450),
  ('egg_huyetLang_than', 1400),
  ('egg_cuHung_pham', 120),
  ('egg_cuHung_linh', 450),
  ('egg_cuHung_than', 1400),
  ('egg_docGiao_pham', 120),
  ('egg_docGiao_linh', 450),
  ('egg_docGiao_than', 1400),
  ('egg_loiBang_pham', 120),
  ('egg_loiBang_linh', 450),
  ('egg_loiBang_than', 1400),
  ('egg_hoaLan_pham', 120),
  ('egg_hoaLan_linh', 450),
  ('egg_hoaLan_than', 1400),
  ('egg_hoYeu_pham', 120),
  ('egg_hoYeu_linh', 450),
  ('egg_hoYeu_than', 1400),
  ('egg_bangPhuong_pham', 120),
  ('egg_bangPhuong_linh', 450),
  ('egg_bangPhuong_than', 1400),
  ('egg_thienMa_pham', 120),
  ('egg_thienMa_linh', 450),
  ('egg_thienMa_than', 1400)
on conflict (ma) do update set gia_tri = excluded.gia_tri;

-- ---------- 2. NOI DANH SACH CHO PHEP CUA HOP QUA ----------
-- ⚠⚠ VAN LA DANH SACH CHO PHEP. Them dung MOT khoa `items`; moi khoa khong nghi toi van bi chan.
-- ⚠ Ham nay `immutable` va chi kiem KHUON DANG (kieu, so nguyen, khong am, tran so luong).
--   Viec ma co that hay khong, va tong gia tri bao nhieu, do TRIGGER o muc 3 lo.
create or replace function public.qua_hop_le(j jsonb) returns boolean
language sql immutable as $$
  select jsonb_typeof(j) = 'object'
     and j <> '{}'::jsonb
     and not exists (
       select 1 from jsonb_each(j) e
        where e.key not in ('bac', 'honThach', 'nguyenBao', 'diemSuKien', 'items')
     )
     -- Bon khoa tien: so nguyen khong am, khong vuot tran.
     and coalesce((select bool_and(
           jsonb_typeof(e.value) = 'number'
           and (e.value #>> '{}')::numeric >= 0
           and (e.value #>> '{}')::numeric = floor((e.value #>> '{}')::numeric)
           and (e.value #>> '{}')::numeric <= case e.key
                 when 'bac' then 2000000
                 when 'honThach' then 100000
                 when 'nguyenBao' then 10000
                 else 100000 end)
         from jsonb_each(j) e where e.key <> 'items'), true)
     -- Khoa `items`: object, moi gia tri la so nguyen tu 1 toi 999, toi da 10 loai.
     and (
       not (j ? 'items')
       or (
         jsonb_typeof(j->'items') = 'object'
         and (select count(*) from jsonb_each(j->'items')) between 1 and 10
         and (select bool_and(
                jsonb_typeof(e.value) = 'number'
                and (e.value #>> '{}')::numeric >= 1
                and (e.value #>> '{}')::numeric <= 999
                and (e.value #>> '{}')::numeric = floor((e.value #>> '{}')::numeric))
              from jsonb_each(j->'items') e)
       )
     );
$$;

-- ---------- 3. TRIGGER: MA PHAI CO THAT, TONG GIA TRI KHONG VUOT TRAN ----------
-- ⚠⚠ TRAN GIA TRI 2.000.000 khong phai so cho dep. Nguoi nhan ban het cho quy ra Bac;
--    san ghi so cua chot chong gian lan la 5.000.000. Tang mot mon qua roi day chinh nguoi duoc
--    tang vao so nghi van la lo hong cua NGUOI PHAT, khong phai loi nguoi choi.
--    Lay dung tran Bac cua hop qua (2.000.000) cho hai duong tang khong lech nhau.
create or replace function public.kiem_vat_pham_qua() returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  it   jsonb;
  e    record;
  tong numeric := 0;
  gt   numeric;
begin
  -- ⚠ Trigger nay chi gan cho INSERT nen `new` luon co. Van re nhanh cho chac neu mai co ai gan them UPDATE.
  if tg_op = 'DELETE' then return old; end if;
  it := new.noi_dung -> 'items';
  if it is null or jsonb_typeof(it) <> 'object' then return new; end if;

  for e in select key, value from jsonb_each(it) loop
    select gia_tri into gt from public.vat_pham_hop_le where ma = e.key;
    if gt is null then
      raise exception 'Ma vat pham khong co trong game: %', e.key;
    end if;
    tong := tong + gt * (e.value #>> '{}')::numeric;
  end loop;

  if tong > 2000000 then
    raise exception 'Tong gia tri vat pham % vuot tran 2000000', tong;
  end if;
  return new;
end;
$$;

-- ⚠ O DAY dung `raise exception` LA DUNG, khac voi chot chong gian lan.
--   Chot do phai tra null vi loi se cuon nguoc dong so nghi van vua ghi. Con o day khong co so nao
--   dang ghi, va nguoi ban lenh CAN biet minh vua go sai ma — im lang la ho tuong da tang xong.
drop trigger if exists kiem_vat_pham_tren_qua_tang on public.qua_tang;
create trigger kiem_vat_pham_tren_qua_tang before insert on public.qua_tang
  for each row execute function public.kiem_vat_pham_qua();
drop trigger if exists kiem_vat_pham_tren_ma_qua on public.ma_qua;
create trigger kiem_vat_pham_tren_ma_qua before insert on public.ma_qua
  for each row execute function public.kiem_vat_pham_qua();

-- ============================================================
-- ⚠ NHUNG GI TEP NAY KHONG LAM
-- · Khong cho tang TRANG BI. Trang bi la thuc the co dong roll ngau nhien, khong tang bang
--   mot ma + mot so luong duoc. Phat Bac de nguoi choi tu mua o Bach Trang Cac.
-- · Khong cong vat pham vao tran chong gian lan. Tran gia tri 2.000.000 da nam duoi san
--   ghi so 5.000.000 nen khong can.
-- · Khong tu xoa ma cu khoi hop qua da phat. Doi ma vat pham trong game thi qua cu van con ma cu;
--   client bo qua ma la, nguoi choi mat phan do.
-- ============================================================

-- ============================================================
-- CAU SOI SAU KHI CHAY — dan RIENG cau nay de xem ket qua
-- ⚠ Supabase SQL Editor chi hien ket qua cua lenh CUOI CUNG.
--
--   select 'so vat pham' as muc, count(*)::text as ket_qua from public.vat_pham_hop_le
--   union all
--   select 'gia tri cao nhat', max(gia_tri)::text from public.vat_pham_hop_le
--   union all
--   select 'trigger', count(*)::text from pg_trigger
--    where tgname in ('kiem_vat_pham_tren_qua_tang', 'kiem_vat_pham_tren_ma_qua')
--   union all
--   select 'qua_hop_le nhan items',
--          case when public.qua_hop_le('{"items":{"tungMoc":5}}'::jsonb) then 'OK' else 'HONG' end
--   union all
--   select 'qua_hop_le chan khoa la',
--          case when public.qua_hop_le('{"xp":5}'::jsonb) then 'HONG' else 'OK' end;
-- ============================================================
