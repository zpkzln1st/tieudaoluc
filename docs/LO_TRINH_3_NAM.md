# Lộ trình ba năm — Tiêu Dao Lục

> Viết 2026-08-17. Nguyên tắc chung: **dựng xong thì đẩy lên live ngay, nhưng ở trạng thái NGỦ.**
> Người chơi không thấy gì cho tới lúc tác giả bật bằng Lệnh Bài.

---

## 1. Năm luật nền

1. **Mỗi tính năng mới ra live phải có một cờ, cờ mặc định TẮT.** Không có ngoại lệ.
2. **Fail closed.** Lỡ tay tạo dòng cấu hình mà quên điền thì tính năng vẫn TẮT, không phải BẬT.
   Đây là luật đã có sẵn ở `su_kien.chi_tac_gia` (mặc định `true` = chỉ tác giả thấy).
3. **Tắt là VÔ HÌNH, không phải hỏng.** Cờ tắt thì cửa vào không mọc ra, nút không hiện, ô không
   trống. Bài kiểm 27 cấm công tắc chết; cờ tắt mà để lại một màn trống là vi phạm chính luật đó.
4. **Danh sách CHO PHÉP, không phải danh sách cấm.** Máy chủ chốt cứng tên cờ hợp lệ, y như
   `mo_khoa_khoa_hop_le` đang làm. Gõ sai tên cờ thì máy chủ từ chối, không âm thầm tạo cờ lạ.
5. **Client đọc một lần rồi đệm vào bản lưu.** Mất mạng vẫn suy ra được, y như `taiSuKien()`.
   Máy chủ mới là hàng rào thật (RLS), cờ ở client chỉ để vẽ.

---

## 2. Bốn loại khoá

| loại | bảng | đã có | dùng cho |
|---|---|---|---|
| Mốc giờ | `su_kien` | ✔ | nội dung theo mùa, có mở có đóng |
| Số mở dần | `mo_khoa` | ✔ | trần cấp, số vòng Trùng Sinh, số ô, số bậc |
| Hệ số | `he_so_may_chu` | ✔ | nhân kinh nghiệm · rơi đồ · giá bán (trần 5) |
| **Cờ bật/tắt** | `tinh_nang` | ✔ | mọi hệ thống mới |

Bảng `tinh_nang` có đúng năm cột: `ma` · `bat` · `chi_tac_gia` · `cau_hinh` jsonb · `cap_nhat`.
Tab **Tính Năng** nằm trong `LB_NHOM` nhóm "Máy chủ", cạnh Mở Khoá.

⚠ `LB_NHOM` và `LB_TIEU_DE` là NGUỒN DUY NHẤT của danh sách tab — thêm mục phải sửa cả hai.

### Chỗ nằm của bộ khoá này

| việc | tệp |
|---|---|
| Danh sách 13 cờ + cờ `daDung` | `src/data/tinhnang.js` |
| Phép suy thuần | `src/engine/tinhnang.js` |
| Cửa duy nhất màn mới phải hỏi | `moChua(ma)` trong `src/main.js` |
| Bảng + luật RLS + nhật ký | `docs/SQL_LENH_BAI_9.sql` |
| Bài kiểm 43 | `_mockup/_covua_wip/_check_tinhnang.mjs` |

Dựng một tính năng mới thì làm đúng ba việc:
1. Bọc mọi cửa vào của nó bằng `moChua('<mã>')`.
2. Đổi `daDung: false` thành `true` trong `src/data/tinhnang.js`.
3. Chạy bài kiểm 43. Nó soi hai chiều: khai `daDung: true` mà không có chỗ đọc là báo đỏ,
   có chỗ đọc mà khai `false` cũng báo đỏ. Đây là thứ chặn công tắc chết.

Không phải sửa SQL. Mười ba mã đã nằm sẵn trong danh sách cho phép của máy chủ.

---

## 3. Đợt 0 — nền (0–3 tháng)

Chưa thêm nội dung nào. Trả nợ và dựng bộ khoá, vì mọi thứ sau đều tựa lên đây.

| việc | vì sao trước |
|---|---|
| ~~Bảng `tinh_nang` + tab Lệnh Bài + hàm `moChua(ma)`~~ **XONG** | không có nó thì mọi đợt sau không ngủ được |
| ~~Đan Điền: 15 công thức Dược Lư + bảng rơi phẩm 6–9~~ **XONG** | 162 ô đang không có đường lấy đan |
| ~~Tông Môn hiện `NaN%`~~ **XONG** | lỗi sản phẩm đang nằm trên live |
| ~~795 chuỗi chưa dịch~~ **XONG** | mỗi đợt mới lại đẻ thêm chuỗi; dọn sớm thì rẻ |
| ~~Chống gian lận: soi chỉ số Đan Điền~~ **XONG** | chỉ số mới chưa có trần, đây là lỗ |
| ~~`san_gia_vp` bổ sung 27 viên đan~~ **XONG** | đan đang bị loại khỏi Sàn vì máy chủ chưa có giá |

**Đợt 0 đã xong.** Bảng `san_gia_vp` nay có 323 dòng: thêm 27 viên đan và 12 vật phẩm sáu lễ
(6 trứng linh thú + 6 món ăn) — nhóm sau cũng đang bị Sàn loại vì bộ sinh chỉ đọc `items.js`
trong khi `sukien.js` tự ghi danh lúc nạp.

Đan chia **hai băng giá**, cắt đúng chỗ nấu/rơi:

| băng | giá sàn | vì sao |
|---|---|---|
| phẩm 1–5 (nấu ở Dược Lư) | `giá NPC + 3` | 0,06–0,25 giờ máy chạy một viên |
| phẩm 6–9 (chỉ rơi) | `giá NPC × 80 + 3` | 37,5–50 giờ máy chạy một viên |

Hệ số 80 là `HS_PHAM.tinhPham` sẵn có — một viên đan rơi ngang một trang bị Hiếm cùng giá NPC.
Đổi mức này chỉ cần sửa `HS_DAN_ROI` trong `src/data/giasan.js` rồi chạy lại `_sinh_bang_gia.mjs`.

⚠ Kèm theo: tầng 2E của chống gian lận phải cộng **số viên đan mua ròng trên Sàn**
(`dan_mua_san`). Thiếu vế đó thì người mua đan bị ghi sổ từ ô thứ 21 và bị **chặn thật** ở ô thứ 60.

---

## 4. Năm thứ nhất — làm dày cái đang có

Không mở hệ mới. Lấp cho đủ những hệ đã dựng khung.

**4.1 Nội dung chiến đấu** — cờ `noiDungBac2`
- Yêu Vương + Bí Cảnh: tune lại theo số đo thật, thêm bậc khó thứ hai.
- Đan Điền phẩm 6–9 đã rơi thật (6% mỗi lượt, `DD_TI_LE_ROI`); bậc khó thứ hai chỉnh lại tỉ lệ đó.
- Trần cấp mở dần qua `mo_khoa.tran_chuyen` (đã có, trần cứng 10 vòng).

**4.1a Vá năm lỗi Bí Cảnh — đợt 2026-08-19.** Đo thật bằng `runDungeon`, ≥2.000 lượt mỗi ô.
Cả năm đều là lỗi IM LẶNG: không ném lỗi, không cảnh báo, bảng số vẫn xanh.

| Lỗi | Hậu quả đo được | Sau khi vá |
|---|---|---|
| `hazard: 'sinhLuc'` — **không phải Tứ Trụ** (nó là máu ở `state.player`) | Vạn Yêu Sơn Lv85 thông quan **0%** cả ba build | 100% (né giữa/cao) |
| Bộ dựng `def` ở `sukien.js` quên chép `hazard`+`hazardName` | 12/21 phó bản hụt tầng; sáu cái Lv70 **0%**; màn in chữ **"undefined"** | 100%, 0 chữ undefined |
| Cửa `bay` đòi `req+2`, `coDuyen` đòi `req+4`, trần Tứ Trụ là 100 | Thái Hư **bất khả vĩnh viễn** ở hai tầng, ăn không 26,9% máu/lượt | HP còn 3,5 → **40** |
| Khoá `sinhLuc` trong `HAZARD_NAME_BY_STAT` **che** lỗi trên | Khai sai tên vẫn in ra tên đẹp nên nhìn màn không biết | gỡ; sai tên là lộ ngay |
| Bộ sinh trần chống gian lận lấy `loot.exp` **thô** | Engine trả `× RUN.expMul × pace` ⇒ trần hụt **1,5 lần**, người chơi sạch bị ghi sổ | `78.978 → 114.130` |

⚠ Tứ Trụ nằm ở `state.stats` nên **Trùng Sinh KHÔNG với tới** — trần của chúng luôn là `MAX_LEVEL`.
Cửa nào đòi cao hơn là cửa chết. Nay kẹp bằng `tranTuTru()`.
⛔ Ba dòng log Bí Cảnh dùng chữ **"ngươi"** — đã bỏ. Lời chiêu thức của boss thì giữ (lời NPC).
Bài kiểm 15 mở rộng 49 → **69 mục**, kiểm chuẩn **13/13**. **Chạy lại `docs/SQL_CHONG_GIAN_LAN.sql`.**

⚠ Còn tồn, chờ chốt: đường cong độ khó **không đơn điệu** — Thiên Cơ Lv92 (2,7% ở né thấp) khó hơn
hẳn Thái Hư Lv100 (100%). Và **Chiến Lực không ảnh hưởng gì tới Bí Cảnh**: Chiến Lực 2.300 với
202.298 cho 5.000/5.000 lượt trùng khít. Chỉ Cấp · Né · Tứ Trụ có việc.

**4.2 Tông Môn P2 · P3** — cờ `tongMonDrama`
- Nhánh drama đệ tử, Bí Kíp BK1–BK5 đã thiết kế xong, chỉ chờ dựng.

**4.3 Bang Phái có ăn thua** — cờ `bangChien`
- Bang Phái đã dựng lại lần bốn. Nay thêm tranh chấp giữa bang: mỗi tuần một mốc.
- ⚠ Tông Môn = NUÔI · Bang Phái = ĐÁNH. Đừng lẫn hai vai.

**4.4 Kinh tế** — cờ `sanThuMua`
- ~~Sàn thêm Thu Mua (buy-order)~~ **ĐÃ DỰNG, ĐANG NGỦ.** Bảng `san_thu_mua` + bốn hàm
  `san_thu_mua_dat` · `_huy` · `_ban` · `_thu_hoi` ở `docs/SQL_SAN_THU_MUA.sql`. Bật bằng Lệnh Bài,
  tab Tính Năng.
  - Bạc ký quỹ trừ ngay lúc đặt đơn; gỡ đơn hoàn phần chưa khớp. Bất biến `ky_quy = gia × so_con`.
  - Khớp MỘT PHẦN, giá là giá **mỗi cái** (Treo Bán là giá cả lô). Trần 10 đơn, ký quỹ gộp 5.000.000 Bạc.
  - Đơn thu mua cũng phải theo giá sàn `san_gia_vp` — thiếu chốt này là cửa sau đi vòng qua bảng giá.
  - Chỉ nhận hàng xếp chồng. Trang bị có dòng roll mà giá sàn không đọc dòng roll, nên đặt đơn
    mua trang bị là bốc thăm một chiều.
  - ⚠⚠ Mỗi lần khớp **ghi một dòng đã xong vào `san_rao`**. Nhờ đó `dan_mua_san` của tầng 2E đếm
    đúng và **không phải sửa `SQL_CHONG_GIAN_LAN.sql`**. Bỏ dòng ấy là người gom đan qua đơn thu
    mua bị chặn thật ở ô thứ 60. Bài kiểm 46 giữ ràng buộc này.
  - Hạn đơn **48 giờ**, tách làm hai nửa. Đơn quá hạn thôi khớp đúng giờ — chốt nằm trong
    `san_thu_mua_ban`. Bạc ký quỹ về túi ở lần chủ đơn mở Sàn kế tiếp — `san_thu_mua_thu_hoi`.
    Ghi bản lưu của ai thì phải đợi người ấy online, nên nửa sau không thể đúng giờ được.
  - Số 48 chỉ gõ cứng **một chỗ**: hàm `san_tm_han()`. Bên JS là `SAN_TM_HAN_MS`, bài kiểm 46 so
    hai con số với nhau.
  - **Sổ khớp cho chủ đơn**: bảng "Đã Nhận" hiện từng lô hàng, nguồn là `san_rao` lọc tiền tố `tm:`.
  - Chưa làm: chủ đơn không được báo lúc có hàng về (chưa nối vào hệ thông báo).

**4.4a An toàn Sàn — đợt 2026-08-19.** Hai lỗ vá cùng lúc, cả hai đều có sẵn từ trước.
- **Quyền RPC**: `docs/SQL_KHOA_CUA_RPC.sql` thu hồi `EXECUTE` của bốn hàm `security definer`
  **nhận uid làm tham số** (`san_ghi_save` · `san_doc_save` · `san_doc_save_khoa` · `dan_mua_san`).
  PostgreSQL mặc định cấp `EXECUTE` cho `PUBLIC` ⇒ **mặc định là MỞ**. Từ nay viết hàm nhận uid
  làm tham số thì đặt `revoke` ngay dưới lệnh `create`.
- **Giao dịch nửa sống nửa chết**: bảng `saves` có nhiều chốt BEFORE; hai chốt chạy đầu
  (`a_bao_tri`, `a_khoa_tai_khoan`) trả `null` = **bỏ lệnh ghi im lặng** và **không** đọc cờ miễn
  trừ `app.san`. Mà `san_rao` · `san_so` · `san_thu_mua` không có chốt nào nên sổ vẫn commit.
  ⇒ Treo bán lúc bảo trì thì tin lên Sàn mà **món vẫn nằm trong túi**.
  Vá **hai lớp**: `san_ghi_save` đếm `row_count`, 0 dòng thì `raise` để **cuốn ngược cả giao dịch**
  (lớp này bắt được cả chốt chưa ai nghĩ ra); và `san_ghi_duoc(uid)` cho 11 chỗ ghi từ chối sớm
  bằng `san-tam-dong`, hai chỗ khớp hai bên còn soi cả bên kia.
- Bài kiểm 46: 116 → 146 mục, kiểm chuẩn **55/55**.

- Thêm chỗ tiêu Bạc: Động Phủ bậc cao, phí bang, đúc lại dòng roll.

**4.4b Thỉnh Kinh** — cờ `thinhKinh`
- Màn ngày: phái Hộ Kinh Sứ áp tải kinh thư, cướp đoàn bot trên đường mây.
- ⚠ Mã cờ này **ngoài lộ trình gốc** — đã thêm vào chốt `tinh_nang_ma_hop_le`, phải chạy lại
  `docs/SQL_LENH_BAI_9.sql`.
- Thiết kế + số: [THIET_KE_THINH_KINH.md](THIET_KE_THINH_KINH.md) · art: [ART_THINH_KINH.md](ART_THINH_KINH.md).

**4.5 Vạn Vật Phổ chốt số** — cờ `phoLuc`
- Số thưởng đang là placeholder. Chốt xong mới bật.

## 5. Năm thứ hai — người chơi gặp nhau

**5.1 Đấu trường** — cờ `dauTruong`
- PvP không đồng bộ trước: đánh với BẢN CHỤP của người khác, không cần hai máy cùng lúc.
- Hồ sơ công khai đã có bản chụp 904 byte — dùng lại đúng đường đó.

**5.2 Mùa giải** — cờ `muaGiai` + `mo_khoa.mua_so`
- Ba tháng một mùa, bảng xếp hạng đóng băng cuối mùa, thưởng danh hiệu riêng.
- Mùa là thứ hợp với Lệnh Bài nhất: mở và đóng bằng mốc giờ, y như sáu lễ.

**5.3 Bang chiến thật** — cờ `bangChienPvp`
- Hai bang tranh một địa điểm trên bản đồ, giữ được thì cả bang ăn hệ số.

**5.4 Mini-game lên mạng** — cờ `coOnline`
- Ngũ Tử Kỳ và ba trò bài đã có bộ óc AI tốt. Thêm đấu người thật.
- Chữ trong canvas phải dịch trước, không thì bản EN/ZH vào bàn cờ là gặp tiếng Việt.

**5.5 Động Phủ thành hub** — cờ `dongPhuHub`
- Mini-game gắn vào nhà riêng, mỗi trò một mốc phần thưởng ngày.

## 6. Năm thứ ba — chiều sâu và tuổi thọ

**6.1 Trùng Sinh sâu** — `mo_khoa.tran_chuyen` nới dần
- Mỗi vòng mở một nhánh kỹ năng mới, không chỉ nâng trần cấp.

**6.2 Bản đồ mới** — cờ `banDoBac3`
- Vùng đất mới + tuyến nhiệm vụ dài, mở từng khu bằng mốc giờ.

**6.3 Hệ chế tác bậc cao** — cờ `cheTacBac3`
- Đúc lại dòng roll, ghép Bộ Trang, tinh luyện Linh Thú.

**6.4 Chuyện dài** — cờ `cotTruyen2`
- Đàm Đạo 9/9 NPC đã xong phần một. Phần hai gắn với bản đồ mới.

**6.5 Công cụ cho chính mình** — không cần cờ
- Bảng số liệu người chơi thật trong Lệnh Bài: giữ chân, tắc ở đâu, bỏ ở cấp nào.
- Đây là thứ quyết định năm thứ tư làm gì.

---

## 7. Nhịp phát hành

- **Đẩy code liên tục**, cờ tắt. Không có nhánh dài, không có "bản lớn" tích một tháng.
- **Bật theo mốc**: mỗi tháng bật một thứ nhỏ, mỗi quý một thứ lớn.
- **Bật cho tác giả trước** (`chi_tac_gia = true`), chơi thử trên live vài ngày, rồi mới mở cả làng.
- Mỗi lần bật đều có dòng trong `lenh_bai_nhat_ky` — sổ chỉ thêm được, không sửa được.

## 8. Cái KHÔNG làm

- ⛔ Không bán chỉ số bằng tiền thật.
- ⛔ Không thêm bot vào Sàn. Sàn cũ bị gỡ đúng vì chuyện đó.
- ⛔ Không mở tính năng mới khi tính năng cũ còn số DRAFT chưa chốt.
- ⛔ Không dựng hệ thứ hai làm đúng việc hệ cũ đã làm.
