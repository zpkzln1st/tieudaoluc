# Thiết Kế — THỈNH KINH

> Cờ tính năng: `thinhKinh`. Nhà: **Tàng Kinh Các** (cửa đã có sẵn ở cột dọc).
> Art prompt: [ART_THINH_KINH.md](ART_THINH_KINH.md).

Người chơi phái một **Hộ Kinh Sứ** cưỡi mây áp tải kinh thư về Tàng Kinh Các. Chuyến đi chạy nền
theo giờ máy chủ. Trên đường mây có đoàn khác đi ngang — cướp được, và cũng bị cướp lại.

---

## 1. Ba điều LỆCH với game tham khảo, và cách thay

Ảnh tham khảo lấy từ một web game khác. Ba chỗ không bê thẳng sang được:

| Bên kia | Tiêu Dao Lục | Thay bằng |
|---|---|---|
| Sứ giả là Đường Tăng · Bạch Long Mã · Trư Bát Giới | không có nhân vật Tây Du nào; lore là võ hiệp huyền huyễn | **năm thần thú hộ kinh**, giữ nguyên bố cục năm ô |
| "Mời hảo hữu" bảo vệ | **không có hệ Hảo Hữu** | cử **một đệ tử Tông Môn** đi hộ vệ |
| Thưởng "DV" | game chỉ có Bạc · Hồn Thạch · Nguyên Bảo | Bạc + **Hồn Thạch** |
| Cướp đoàn của người chơi thật | PvP xếp sang Năm thứ hai | cướp **đoàn bot giang hồ** (200 bot sẵn có ở `bots.js`) |

⚠ Tên đã grep sạch trước khi đặt: `Thỉnh Kinh` · `Cướp Kinh` · `Hộ Kinh Sứ` · `Kinh Thư` và năm
tên thần thú đều **chưa dùng ở đâu**. ⛔ `Tiêu Cục` KHÔNG dùng được — nó đã là một đuôi tên Bang
Phái trong `src/engine/bangphai.js`. ⛔ `Vân Lộ` cũng vướng — `vanLoChi` là một linh thảo.
⛔ `Bạch Lộc` · `Huyền Quy` · `Cửu Thiên` đều đã có chủ.

---

## 2. Năm Hộ Kinh Sứ

Bậc càng cao, chuyến càng ngắn mà thưởng càng lớn. Mỗi bậc có cấp riêng, nuôi bằng EXP chuyến đi.

| bậc | tên | mã | thưởng nền / chuyến | thời gian | tỉ lệ bốc trúng |
|---|---|---|---|---|---|
| 1 | **Thanh Ngưu** | `hksThanhNguu` | Bạc 2.000 · Hồn Thạch 4 | 30 phút | 44% |
| 2 | **Thạch Lân** | `hksThachLan` | Bạc 5.000 · Hồn Thạch 9 | 26 phút | 28% |
| 3 | **Tuyết Viên** | `hksTuyetVien` | Bạc 12.000 · Hồn Thạch 18 | 22 phút | 17% |
| 4 | **Đằng Xà** | `hksDangXa` | Bạc 25.000 · Hồn Thạch 34 | 18 phút | 8% |
| 5 | **Bạch Trạch** | `hksBachTrach` | Bạc 52.000 · Hồn Thạch 70 | 15 phút | 3% |

**Số neo vào đâu — kèm một con số tôi viết sai rồi phải sửa.**

⚠⚠ **Bạc/giờ là thước SAI cho màn này.** Bản đầu của tài liệu neo vào Bạc/giờ rồi kết luận "hơn
gấp đôi mức cày". Đo lại thì Bạch Trạch ra **600.000 Bạc/giờ**, gấp 110 lần mức cuối game. Chuyến
chỉ 15–30 phút và mỗi ngày đúng ba lượt, nên thứ có thật là **TỔNG MỘT NGÀY**.

| mốc | số | quy ra giờ cày (5.468 Bạc/giờ) |
|---|---|---|
| kỳ vọng một lượt | 7.880 Bạc | |
| ba lượt một ngày, cấp 1 | 23.640 Bạc | **4,3 giờ** |
| ba lượt một ngày, cấp 10 | 40.661 Bạc | 7,4 giờ |
| ca xấu nhất: ba lượt Bạch Trạch cấp 10 | 268.320 Bạc | 49 giờ |
| một tháng đều đặn | 709.200 Bạc | 0,71 món Cực Hiếm cấp 100 |

Một tháng chơi đều chưa mua nổi một món Cực Hiếm cấp 100 — đúng mức cho một màn ngày.

⛔ Bảng cũ (6.000 / 15.000 / 34.000 / 72.000 / 150.000) cho **12,6 giờ cày mỗi ngày**, ca xấu nhất
**142 giờ một ngày**. Bảy ngày bằng cả hành trình 577 giờ lên cấp 100. Đó là máy in Bạc — đã hạ ×0,35.

Cấp Hộ Kinh Sứ nhân thẳng vào thưởng: `thưởng = nền × (1 + 0,08 × (cấp − 1))`, trần cấp 10.
EXP mỗi chuyến trọn vẹn: 100. Lên cấp cần `400 + 100 × cấp`.

---

## 3. Một lượt Thỉnh Kinh

1. Mở Tàng Kinh Các › **Thỉnh Kinh**. Ba con số ở đầu màn: `Thỉnh kinh còn 3` · `Cướp kinh còn 5`
   · `Hộ vệ còn 2`.
2. Bấm **Thỉnh Kinh** — bốc một Hộ Kinh Sứ theo bảng tỉ lệ trên.
3. **Làm Mới** để bốc lại. Lần đầu mỗi lượt **Miễn Phí**; từ lần hai tốn **20 Nguyên Bảo**.
4. **Cử Hộ Vệ** (tuỳ chọn): chọn một đệ tử Tông Môn. Mỗi đệ tử giảm **một** lần bị cướp.
   Chưa có Tông Môn thì ô này hiện đường vào Tông Môn, không để trống trơn.
5. Bấm **Khởi Hành**. Chuyến chạy nền; tắt game vẫn chạy.
6. Về tới nơi thì nhận thưởng ở chính màn đó.

**Bị cướp:** mỗi chuyến chịu tối đa **4 lần**. Mỗi lần mất **12%** thưởng Bạc của chuyến.
Hồn Thạch và EXP **không bị cướp** — cướp mà lấy được cả tu vi thì người chơi mất động lực đi.

---

## 4. Cướp Kinh

Bản đồ mây hiện các đoàn bot đang đi. Mỗi bot suy từ `bots.js` — cùng cách Giang Hồ chung đang
làm, nên **không cần bảng SQL nào** và chạy được cả khi chưa đăng nhập.

Bấm một đoàn để xem thẻ: cấp, Hộ Kinh Sứ của họ, số lần đã bị cướp, thời gian còn lại, hộ vệ.
Cướp được `Bạc = 9% thưởng chuyến của họ × hệ số chênh cấp`, kẹp trong `[0,3 ; 1,0]` theo
`cấp mình / cấp họ`. Đoàn đã đủ 4 lần thì hết cướp được — thẻ nói thẳng, đừng để bấm rồi mới báo.

⚠ Cướp bot **không trừ của ai cả** — bot không có bản lưu. Số "đã bị cướp" là con số suy ra từ hạt
giống, chỉ để đoàn nào cũng có giới hạn giống nhau.

---

## 5. Chỗ nằm trong mã

| việc | tệp |
|---|---|
| Bảng năm Hộ Kinh Sứ + tỉ lệ bốc + thưởng | `src/data/thinhkinh.js` |
| Phép suy thuần (bốc sứ, tính thưởng, đoàn bot) | `src/engine/thinhkinh.js` |
| Cửa vào + trạng thái màn | `src/main.js`, bọc `moChua('thinhKinh')` |
| Màn | `index.html`, trong view Tàng Kinh Các |
| Bài kiểm 47 | `_mockup/_covua_wip/_check_thinhkinh.mjs` |

⚠⚠ Mọi phép bốc phải đi qua `rng(state, '<miền riêng>')` — miền `tkSu` (bốc bậc sứ giả) và
`tkCuop` (kết quả cướp). Dùng chung miền với đường khác là trần chống gian lận thành vô nghĩa.

⚠ Thưởng Bạc mỗi ngày cộng thêm tối đa 450.000. Trần chống gian lận im lặng của một lần đẩy save
là 25.137.000 Bạc, nên Thỉnh Kinh nằm gọn bên trong, **không phải sửa `SQL_CHONG_GIAN_LAN.sql`**.

---

## 6. Bản này KHÔNG làm

- **Không cướp đoàn người chơi thật.** Cần bảng SQL + hàm máy chủ, và đụng đúng vùng PvP mà lộ
  trình xếp sang Năm thứ hai.
- **Không có "Cổ vũ"** của game tham khảo — nó là cửa bán Nguyên Bảo, chưa cần ở bản đầu.
- **Không nuôi Hộ Kinh Sứ bằng vật phẩm.** Chỉ lên cấp bằng EXP chuyến đi.
