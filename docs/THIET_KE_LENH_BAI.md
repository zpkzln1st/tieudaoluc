# LỆNH BÀI — THIẾT KẾ MỞ RỘNG

Bảng điều khiển máy chủ của tài khoản tác giả. Tệp này chốt lược đồ bảng, giao diện và thứ tự dựng.

Tệp SQL đang chạy: `SQL_LENH_BAI.sql` · `SQL_GIAM_SAT.sql` · `SQL_CHONG_GIAN_LAN.sql` · `SQL_HO_SO_CONG_KHAI.sql`.

---

## 0. ĐANG CÓ GÌ

| Phần | Chỗ nằm |
|---|---|
| 3 tab: Sự Kiện · Hộp Quà · Khoá Tài Khoản | `index.html:6333` |
| Trạng thái và hàm | `src/main.js:1534` tới `1702` |
| 9 hàm mạng | `src/cloud.js:194` tới `283` |
| Phép tính thuần | `src/engine/lenhbai.js` |
| 4 bảng | `docs/SQL_LENH_BAI.sql` |

Màn Giám Sát là màn RIÊNG, mở từ Cài Đặt: sổ nghi vấn, chi tiết từng tài khoản, danh sách miễn trừ.

---

## 1. LUẬT CỨNG — MỌI MỤC DƯỚI ĐÂY PHẢI THEO

1. **Bảng ghi MỐC THỜI GIAN, không ghi công tắc bật/tắt.** Client đệm mốc vào bản lưu. Mất mạng vẫn tự đóng đúng hạn.
2. **Hàng rào là RLS neo vào `auth.uid()`.** `isAuthorAccount` chỉ ẩn hiện giao diện.
3. **Danh sách CHO PHÉP, không dùng danh sách cấm.** Thêm khả năng mới thì phải sửa ràng buộc trước.
4. **`chi_tac_gia` và mọi cờ quyền mặc định đóng.** Lỡ tay tạo dòng thì không ai vào được.
5. **Không có đường nào SỬA bản lưu người khác.** Bù đồ đi bằng hộp quà.
6. **Mọi hàm `security definer` ghim `search_path = pg_catalog, public`.**
7. **Trigger phải rẽ nhánh `tg_op` trước khi đụng `new`.** Nhánh DELETE thì `new` chưa được gán.
8. **Ràng buộc `check` không được chứa truy vấn con.** Bỏ phép kiểm vào hàm `immutable` rồi `check` gọi hàm.
9. **Mọi lệnh ghi phải để lại dấu trong `lenh_bai_nhat_ky`.** Sổ chỉ thêm được, không ai xoá.
10. **Việc không lùi được phải qua `hoiXacNhan`.** Hộp xác nhận nói cả cái mất lẫn cái giữ.

---

## 2. LỖI ĐANG CÓ — ĐÃ SỬA Ở ĐỢT 1

**Hộp quà `diemSuKien` phát đi là mất trắng.** Ràng buộc `qua_hop_le` cho phép khoá `diemSuKien`. Hàm `nhanQuaChoSan` chỉ cộng `bac`, `honThach`, `nguyenBao`. Máy chủ đánh dấu `nhan_luc` xong mà người chơi không nhận được gì.

Đã vá: đường nhận cộng qua `congDiem`, tab Hộp Quà có ô nhập thứ tư. Bài kiểm chốt cứng cả bốn khoá ở cả hai đường.

---

## 3. NHÓM A — TÌM NGƯỜI CHƠI

Hai tab Quà và Khoá đang bắt gõ tay mã tài khoản dạng `942e0821-009d-…`.

### A1. Ô tìm theo tên nhân vật
Đọc `ho_so_cong_khai` bằng `ilike`, giới hạn 30 dòng. Bấm một tên là điền mã tài khoản vào ô đang mở.
Bảng này ai cũng đọc được. **Không cần SQL mới.**

### A2. Thẻ hồ sơ trong Lệnh Bài
Bày: tên · tổng cấp · chiến lực · danh hiệu · mốc cập nhật · đang bị khoá hay không.
Nguồn: `ho_so_cong_khai` ghép với `lbKhoa` đã tải sẵn. **Không cần SQL mới.**

### A3. Soi bản lưu, chỉ đọc
Luật `saves_tac_gia_doc` đã có từ đợt C. Đọc `data` của MỘT tài khoản rồi bày: Bạc, Hồn Thạch, Nguyên Bảo, cấp từng nghề, số món trong hành lý, trang bị đang mặc.

⚠ Một dòng save nặng khoảng 120 KB. Chỉ đọc khi bấm vào đúng một người. Danh sách người chơi phải đi qua view nhẹ ở A4.

### A4. View danh sách người chơi
```sql
create or replace view public.nguoi_choi_gom as
  select s.user_id, s.updated_at, s.last_save,
         h.ten, h.tong_cap, h.chien_luc, h.cap_nhat as ho_so_luc
    from public.saves s
    left join public.ho_so_cong_khai h on h.user_id = s.user_id;
```
`security invoker` nên view vẫn chịu RLS: người thường chỉ thấy dòng của chính mình.
⚠ **Tuyệt đối không chọn cột `data` trong view này.** Chọn vào là mỗi lần mở màn kéo về cả trăm MB.

---

## 4. NHÓM B — NHẬT KÝ

Bảng `lenh_bai_nhat_ky` đã có, có luật đọc, chưa có cửa nào để xem.

### B1. Tab Nhật Ký
Đọc 100 dòng gần nhất. Lọc theo `viec` (sự kiện · quà tặng · khoá tài khoản) và theo ngày.
Mỗi dòng bày: mốc · việc · thao tác · mục tiêu · nút mở chi tiết `jsonb`.
Hàm mới trong `cloud.js`: `cloudNhatKyDs(gioiHan, viec)`. **Không cần SQL mới.**

### B2. Đèn báo lệnh lạ
Đếm số dòng có `ai` khác uid tác giả. Khác không thì hiện vạch đỏ trên nút Lệnh Bài.
Đây là cách duy nhất phát hiện tài khoản tác giả bị chiếm.

---

## 5. NHÓM C — HỘP QUÀ

### C1. Phát hàng loạt
Ba nguồn danh sách: chọn tay nhiều người · lấy 50 hạng đầu Phong Vân Bảng · lấy mọi tài khoản có `updated_at` trong 7 ngày.
Client dựng mảng rồi `insert` một lần. Luật `qua_tang_tac_gia_phat` đã cho phép insert nhiều dòng. **Không cần SQL mới.**
⚠ Hộp xác nhận phải ghi rõ SỐ NGƯỜI nhận. Phát nhầm 200 hộp thì phải xoá tay 200 dòng.

### C2. Mã Đổi Quà
```sql
create table if not exists public.ma_qua (
  ma            text primary key,          -- chữ HOA, không dấu
  noi_dung      jsonb       not null,
  luot_toi_da   int         not null default 1,   -- 0 = không giới hạn
  luot_da_dung  int         not null default 0,
  mo_luc        timestamptz,
  dong_luc      timestamptz,
  ghi_chu       text        not null default '',
  tao_luc       timestamptz not null default now()
);
create table if not exists public.ma_qua_da_doi (
  ma       text not null,
  user_id  uuid not null references auth.users(id) on delete cascade,
  luc      timestamptz not null default now(),
  primary key (ma, user_id)
);
```
Nội dung dùng lại ràng buộc `qua_hop_le` — cùng danh sách cho phép, cùng trần.
Hàm `doi_ma_qua(p_ma text)` `security definer` làm bốn việc trong một giao dịch: kiểm mốc, kiểm lượt, ghi `ma_qua_da_doi`, tăng `luot_da_dung`. Trả nội dung hoặc `null`.

⚠ **Khoá chính kép `(ma, user_id)` là cái chặn đổi hai lần.** Đừng kiểm bằng `select` rồi `insert` — hai người gõ cùng lúc là lọt.
⚠ Client nhận xong phải `Storage.save()` NGAY. Cùng lý do với hộp quà: máy chủ đã đánh dấu, đóng tab là mất.

### C3. Quà đăng nhập theo mốc
Bảng `qua_moc`: nội dung + `mo_luc` + `dong_luc`. Ai đăng nhập trong khoảng đó nhận đúng một lần.
Dùng lại `ma_qua_da_doi` với `ma` là khoá của mốc. Không cần bảng thứ hai.

### C4. Quà mang vật phẩm và trang bị
Phải nới `qua_hop_le` thêm khoá `items` (bản đồ mã vật phẩm sang số lượng).
⚠ **Danh sách mã vật phẩm hợp lệ nằm trong `src/data/`, Postgres không đọc được.** Hai lối:
- Sinh danh sách mã vào một bảng `vat_pham_hop_le` bằng `_sinh_sql_tran.mjs`, ràng buộc soi bảng đó.
- Hoặc chỉ cho phép mã khớp `^[a-zA-Z0-9_]{2,40}$` và chặn số lượng ở 999. Mã sai thì client bỏ qua, không vỡ.

Trang bị thì KHÔNG phát qua hộp quà. Trang bị là thực thể có dòng roll ngẫu nhiên. Muốn tặng thì phát Bạc để người chơi tự mua ở Bách Trang Các.

---

## 6. NHÓM D — KỶ LUẬT

### D1. Khoá có hạn
Thêm cột: `alter table public.khoa_tai_khoan add column if not exists het_luc timestamptz;`
`null` = khoá không hạn. Hàm `chan_tai_khoan_bi_khoa` sửa điều kiện:
```sql
if exists (select 1 from public.khoa_tai_khoan k
            where k.user_id = ai and (k.het_luc is null or now() < k.het_luc)) then
  return null;
end if;
```
Đúng luật ghi MỐC: tới giờ là tự hết, không cần ai bấm gỡ.
⚠ Dòng cũ vẫn nằm lại trong bảng sau khi hết hạn. Đó là CÓ Ý — giữ lịch sử vi phạm. Giao diện lọc riêng hai mục "đang khoá" và "đã hết hạn".

### D2. Nút Khoá trong màn Giám Sát
Hiện phải chép mã tài khoản từ Giám Sát sang Lệnh Bài. Thêm nút gọi thẳng `_lbKhoaGui`. **Không cần SQL mới.**

### D3. Gỡ hồ sơ khỏi Phong Vân Bảng
Dùng cho tên nhân vật tục tĩu. `ho_so_cong_khai` hiện KHÔNG có luật delete cho ai cả.
```sql
create policy "ho_so_tac_gia_xoa" on public.ho_so_cong_khai
  for delete using (auth.uid() = '<uid tác giả>'::uuid);
```
⚠ Xoá xong người chơi bấm Khoe là hồ sơ hiện lại. Muốn chặn hẳn phải kèm khoá tài khoản, hoặc thêm bảng `cam_khoe`.

---

## 7. NHÓM E — CÁO THỊ

```sql
create table if not exists public.cao_thi (
  id        bigserial   primary key,
  tieu_de   text        not null default '',
  noi_dung  text        not null default '',
  muc       text        not null default 'thuong',   -- thuong | quan_trong | bao_tri
  muc_tieu  uuid,                                    -- null = cả giang hồ
  mo_luc    timestamptz,
  dong_luc  timestamptz,
  tao_luc   timestamptz not null default now()
);
```
Luật đọc: `muc_tieu is null or auth.uid() = muc_tieu`. Chỉ tác giả ghi.
`muc_tieu` khác null là **thư riêng** — không cần bảng thứ hai.

Client đọc cùng nhịp `setInterval taiSuKien` 10 phút đã có. Cáo thị đã đọc thì ghi id vào bản lưu, không hiện lại.
Mức `quan_trong` hiện popup một lần. Mức `thuong` hiện chấm đỏ trên biểu tượng thư.

⚠ Cáo thị là chữ do tác giả gõ. Bày bằng `x-text`, tuyệt đối không `x-html`.

---

## 8. NHÓM F — HỆ SỐ TOÀN MÁY CHỦ

```sql
create table if not exists public.he_so_may_chu (
  khoa      text primary key,     -- exp | rot_do | gia_ban
  gia_tri   numeric not null default 1,
  mo_luc    timestamptz,
  dong_luc  timestamptz
);
```
Ai cũng đọc. Chỉ tác giả ghi. Client đệm vào bản lưu như đệm mốc sự kiện.

### ⚠⚠ BẪY: HỆ SỐ KINH NGHIỆM ĐỤNG TRẦN CHỐNG GIAN LẬN

Chốt tầng 2 đo `Δxp ≤ (Δthời gian) × xp_mỗi_giây × he_so_an_toan`. `he_so_an_toan` đang là **10**.
Hệ số nhân kinh nghiệm cao nhất người chơi thật đạt được là **×3,38**. Tỉ lệ chạm trần: 3,38 / 10 = **0,34**.

| Nhân kinh nghiệm toàn máy chủ | Tỉ lệ chạm trần | Hậu quả |
|---|---|---|
| ×2 | 0,68 | an toàn |
| ×3 | 1,01 | **cả làng bị ghi sổ nghi vấn** |
| ×10 | 3,38 | **cả làng bị chặn đồng bộ** |

⇒ **Nhân kinh nghiệm tối đa ×2 nếu không sửa gì thêm.** Muốn cao hơn thì phải nâng `he_so_an_toan` trong bảng `tran_he_so` TRƯỚC, cùng một tệp SQL, cùng một lần chạy.

Trần tuyệt đối `tran_moi_lan_ghi` = 2.218.261 xp mỗi lần ghi. Cày thật 14 giờ nghề nhanh nhất được 297.000 xp. Nhân đôi thành 594.000, vẫn dưới trần 3,7 lần. Không phải sửa.

Hệ số rơi đồ và hệ số giá bán KHÔNG đụng trần nào — hai thứ đó không sinh kinh nghiệm.

---

## 9. NHÓM G — SỐ LIỆU MÁY CHỦ

### G1. Tab Thống Kê
```sql
create or replace view public.thong_ke_may_chu as
  select count(*)                                                          as tong_tai_khoan,
         count(*) filter (where updated_at > now() - interval '24 hours')  as vao_24_gio,
         count(*) filter (where updated_at > now() - interval '7 days')    as vao_7_ngay,
         count(*) filter (where updated_at < now() - interval '7 days')    as mat_tich
    from public.saves;
```
`security invoker` nên người thường gọi ra số 1 (chỉ thấy dòng của mình). Tác giả thấy số thật.

Phân bố cấp lấy từ `ho_so_cong_khai.tong_cap` gom theo mốc 10 cấp.
⚠ Số cấp trên hồ sơ do máy người chơi khai. Dùng để nhìn hình dạng, đừng dùng để trao thưởng.

### G2. Người chơi mất tích
Danh sách từ view `nguoi_choi_gom` (A4), lọc `updated_at` quá 7 ngày, sắp theo tổng cấp giảm dần.
Dùng để gửi cáo thị mời quay lại kèm hộp quà.

---

## 10. NHÓM H — BẢO TRÌ

Một dòng trong `he_so_may_chu` khoá `bao_tri`, hoặc một dòng `cao_thi` mức `bao_tri`. Dùng lại bảng có sẵn, không đẻ bảng mới.

Trong khoảng mốc bảo trì:
- Client hiện cáo thị và tạm ngừng đẩy bản lưu.
- Trigger trên `saves` từ chối im lặng (`return null`), y hệt cách chốt khoá đang làm.

⚠ **Game là ngoại tuyến trước.** Bảo trì KHÔNG chặn được người chơi chơi tiếp. Bản lưu dồn lại trong máy họ rồi đẩy một lần khi hết bảo trì.
⚠ Dồn lâu vẫn an toàn với chốt: trần theo nhịp giãn ra theo thời gian trôi, còn trần treo máy tối đa là 14 giờ.
⚠ Tài khoản tác giả phải được miễn — không thì đang bảo trì chính mình cũng không ghi được.

---

## 11. THỨ TỰ DỰNG

| Đợt | Gồm | Chạy lại SQL |
|---|---|---|
| 1 ✅ | A1 A2 A3 A4 · B1 B2 · D2 · vá lỗi `diemSuKien` | `docs/SQL_LENH_BAI_2.sql` |
| 2 | C1 · E (cáo thị + thư riêng) | có |
| 3 | D1 D3 · G1 G2 | có |
| 4 | C2 C3 (mã đổi quà) | có |
| 5 | F (hệ số máy chủ) · H (bảo trì) | có, kèm sửa `tran_he_so` |
| 6 | C4 (quà mang vật phẩm) | có |

Đợt 4 và 5 để sau cùng vì cả hai đụng thẳng vào chốt chống gian lận.

---

## 12. VIỆC PHẢI LÀM MỖI ĐỢT

- Bài kiểm `_check_lenhbai.mjs` hiện có **108 mục**. Mỗi bảng mới thêm ít nhất: bật RLS · số luật ghi khớp số dự tính · không có `coalesce(new.` · không có `select` trong `check`.
- Trang soi trong game thật, kiểu `_lenhbai_probe.html`. Bảng số xanh hết mà ảnh chụp mới lộ lỗi — đã dính một lần ở Giang Hồ Chung.
- Chụp ảnh mọi tab mới. Chụp game thật phải gieo bản lưu trước, không thì rơi vào màn Khai Tịch.
- Bổ sung mục Cẩm Nang nếu người chơi nhìn thấy (cáo thị, mã đổi quà, hệ số máy chủ).

---

## 13. ĐIỂM YẾU KHÔNG VÁ ĐƯỢC BẰNG SQL

Toàn bộ quyền treo trên một điều kiện: `auth.uid()` bằng uid tác giả. Lộ mật khẩu là mất tất.
Giảm nhẹ đang có: quà có trần · nhật ký không xoá được · không có đường sửa bản lưu người khác.
Giảm nhẹ thêm ở đợt 1: đèn báo lệnh lạ (B2).
Việc còn lại là bật xác thực hai lớp cho tài khoản tác giả ở Supabase.
