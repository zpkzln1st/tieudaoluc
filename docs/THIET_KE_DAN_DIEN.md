# Thiết Kế — ĐAN ĐIỀN (Tinh · Khí · Thần)

> Trạng thái: **BẢN THẢO, chưa code dòng nào.** Mọi con số là DRAFT, chờ chủ dự án chốt.
> Chốt đã có: tên hệ **Đan Điền**; ba chỉ số **Tinh · Khí · Thần** (bỏ Võ/Kỹ/Phép của game tham khảo);
> đan phẩm 1–5 nấu từ Luyện Đan, phẩm 6–9 chỉ rơi từ Yêu Vương và Bí Cảnh.
> Mục tiêu chủ dự án đặt ra: **lấp đầy lưới phải là thành tựu đáng tự hào, cần thời gian và tích luỹ.**

---

## 0. Vì sao KHÔNG dùng Võ · Kỹ · Phép

Game tham khảo chia sát thương làm ba loại (võ/kỹ/phép) rồi cho mỗi loại một công một thủ.
Tiêu Dao Lục **đã có trục loại sát thương rồi**: Ngũ Hành. Đo được:

| | số đo |
|---|---|
| Chỉ số công/thủ hiện có | đúng 1 Công, 1 Thủ |
| 29 chiêu | 25 ngũ hành · 2 vô hệ · 2 trợ · **0 chiêu "vật lý"** |
| Trục phòng thủ | 5 dòng kháng trên giáp trụ (Phòng Thủ Vật Lý · Kháng Độc · Kháng Băng · Kháng Hỏa · Kháng Lôi), trần 50% |
| 33 quái + 10 Yêu Vương | chiêu quái **không có trường phân loại** |

Thêm trục thứ hai là bắt người chơi đọc hai bảng cùng lúc mỗi lần đổi bài võ.

Đã thử một đường khác — gắn ba chỉ số vào ba kiểu sát thương engine đã tách sẵn (đòn thường /
chiêu / hiệu ứng hệ). **Đo 192 trận thật qua `makeFight`+`stepFight` thì đường này hỏng:**

| đường sát thương | Tứ Trụ thấp | Tứ Trụ cao |
|---|---|---|
| chiêu thức | 94,7% | 89,1% |
| đòn thường | 1,0% | 5,2% |
| hiệu ứng hệ | 4,3% | 5,7% |

Chiêu ăn gần trọn miếng bánh ⇒ một chỉ số thành tất cả, hai chỉ số kia thành đồ trang trí.

⇒ **Tinh · Khí · Thần không phải loại sát thương, mà là ba loại đòn bẩy.** Cả ba đều có việc
bất kể sát thương chia thế nào.

---

## 1. Ba chỉ số

| | vai | cộng gì (DRAFT) |
|---|---|---|
| **Tinh** — thân thể | trụ | Sinh Lực · Phòng Ngự |
| **Khí** — nội công | đánh | Công · trần Nội Lực · hồi Nội Lực |
| **Thần** — thần thức | khắc chế | 5 kháng ngũ hành · Chính Xác · giảm thời gian khống chế |

⛔ **Thần KHÔNG cộng Bạo Kích.** Bạo Kích trần 75% và đã có bốn nguồn tranh nhau. Linh Xảo từng
bị hạ hệ số vì một mình nó ăn 55/75 điểm trần, khiến dòng Bạo Kích trên đồ bậc cao rơi vào trần
rồi mất trắng, âm thầm. Thêm nguồn thứ năm là lặp lại đúng lỗi đó.

⛔ Tương tự, **Thần cộng kháng phải nhớ trần kháng 50%** — cộng vượt trần là mất trắng.

---

## 2. Lưới Đan Điền

Ba nhánh × chín phẩm. Lưới là **BẬC THANG** — phẩm p có **p + 1** ô (đọc từ ảnh chủ dự án gửi):

| phẩm | Nhất | Nhị | Tam | Tứ | Ngũ | Lục | Thất | Bát | Cửu |
|---|---|---|---|---|---|---|---|---|---|
| ô mỗi nhánh | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |

Một nhánh 54 ô. **Cả lưới 162 viên.**

Cắt nguồn ở giữa **Ngũ Phẩm và Lục Phẩm**: phẩm 1–5 nấu được (**60 viên**), phẩm 6–9 chỉ rơi
(**102 viên**).

### Đan Hồn — mốc chéo nhánh
Lấp đủ một phẩm ở **cả ba nhánh** thì mở **Đan Hồn** phẩm đó: một khoản cộng thêm ăn trên tổng.
Chín mốc. Đây là chỗ chống lối chơi dồn hết vào một nhánh.

---

## 3. Nguồn — khớp 1:1 với thứ game đã có, không dựng nguồn mới

| phẩm | lấy ở đâu | cổng |
|---|---|---|
| 1–5 | **Dược Lư** (hệ Luyện Đan đang chạy) | cấp nghề Luyện Đan + linh thảo nghề Hái Thuốc |
| 6–9 | **10 Yêu Vương** (hồi sinh 2–?giờ mỗi con) + **9 Bí Cảnh** (một lượt 90 phút trở lên) | cấp + tỉ lệ rơi thấp |

### Bài toán thời gian — chỗ quyết định "đáng tự hào"
Người chơi đều đặn: ước 6 lượt Yêu Vương + 4 lượt Bí Cảnh mỗi ngày = **10 lượt/ngày**.

| tỉ lệ rơi | viên/ngày | lấp xong 102 viên |
|---|---|---|
| 6% | 0,60 | **170 ngày** |
| 8% | 0,80 | 128 ngày |
| 10% | 1,00 | 102 ngày |

Đề xuất chốt **6%** — năm tháng cày đều cho tấm lưới đầy. Đây là con số cần chủ dự án duyệt,
vì nó chính là định nghĩa của "không phải ai cũng làm được".

---

## 4. Bảng Luyện (đợt sau)

Quay lại cả ba số trong trần của cấp hiện tại. **Tụt được** — ảnh tham khảo có Võ −3 màu đỏ.
Xem kết quả xong mới bấm Lưu hoặc Huỷ. Giá theo bậc, neo vào cấp: càng cao càng mắc.
Không đụng gì tới combat, làm sau khi lưới chạy ổn.

---

## 5. Hai chỗ phải cẩn thận

**5a. Đường cong cấp.** Thời gian lên cấp 100 hiện ~577 giờ và đó là con số CỐ Ý. Một kho chỉ số
vĩnh viễn mới sẽ rút ngắn nó. Đề xuất trần cho lưới đầy (DRAFT):

| | lưới đầy cộng |
|---|---|
| Tinh | +20% Sinh Lực · +20% Phòng Ngự |
| Khí | +20% Công · +30 trần Nội Lực · +hồi Nội Lực |
| Thần | +12% mỗi kháng · +Chính Xác · −20% thời gian khống chế |

Phải đo lại time-to-100 sau khi ráp số, không được đoán.

**5b. Chống gian lận.** Chốt hiện soi EXP kỹ năng và số quái hạ. Chỉ số Đan Điền nằm NGOÀI mọi
phép soi — sửa tay bản lưu là lên thẳng. Phải thêm một phép soi cho nó, và
**chủ dự án phải chạy lại `docs/SQL_CHONG_GIAN_LAN.sql`**.

---

## 6. Chờ chốt

1. Hình dạng lưới: 4/6/8 ô, tổng **162 viên** — nhiều hay ít?
2. Tỉ lệ rơi phẩm 6–9: **6%** ⇒ 150 ngày. Duyệt hay đổi?
3. Mức cộng khi lưới đầy (bảng §5a).
