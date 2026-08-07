# TIÊU DAO LỤC — HỆ SỰ KIỆN

Sáu sự kiện một năm, mỗi sự kiện mười bốn ngày.
Mọi con số trong tài liệu này do máy tính ra từ bảng số thật của game, không con số nào gõ tay.
Bản đo: `_mockup/_covua_wip/_do_sukien.mjs`.

---

# PHẦN I — KHUNG CHUNG

## I1. Lịch sáu sự kiện

| # | Tháng | Sự kiện | Bản đồ | Kĩ năng |
|---|---|---|---|---|
| 1 | 2 | Sự Kiện Tết | Trường Xuân Miếu Hội | **Thái Phúc** |
| 2 | 4 | Sự Kiện Mùa Xuân | Bích Thảo Nguyên | **Thái Thanh** |
| 3 | 6 | Sự Kiện Đoan Ngọ | Đoan Dương Giang | **Thái Liên** |
| 4 | 8 | Sự Kiện Vu Lan | Vong Xuyên Ngạn | **Thái Đăng** |
| 5 | 9 | Sự Kiện Trung Thu | Quảng Hàn Nguyệt Cảnh | **Thái Nguyệt** |
| 6 | 12 | Sự Kiện Giáng Sinh | Hàn Tùng Tuyết Nguyên | **Thái Tuyết** |

Bốn mùa trong năm gộp vào bốn lễ đúng mùa đó. Tháng tám không có lễ nào nên lấy Vu Lan, vốn rất hợp chất huyền huyễn của game.
Mười bốn ngày nhân sáu lần là tám mươi bốn ngày có sự kiện trong một năm, bằng hai mươi ba phần trăm thời gian.

## I2. Vì sao sáu kĩ năng cùng mang chữ Thái

Chữ **Thái** (采) là chữ game đã dùng sẵn cho việc thu hái. Đào Khoáng có tên chữ là Thái Khoáng, Hái Thuốc có tên chữ là Thái Dược.
Sáu kĩ năng sự kiện lấy chung chữ đó. Chữ đứng sau là thứ mình hái ở lễ ấy.

| kĩ năng | hái thứ gì |
|---|---|
| Thái Phúc | hái phúc lộc đầu năm |
| Thái Thanh | hái lộc biếc mùa xuân |
| Thái Liên | hái sen giữa mùa hạ |
| Thái Đăng | vớt hoa đăng trôi sông |
| Thái Nguyệt | hái ánh trăng |
| Thái Tuyết | hái tuyết tinh |

Người chơi nhìn tên là biết ngay đây là kĩ năng sự kiện. Mỗi cái vẫn đúng chủ đề riêng của lễ đó.

## I3. Bảy khối — mỗi sự kiện lắp lại y nguyên khuôn này

| # | Khối | Số lượng |
|---|---|---|
| 1 | Bản đồ sự kiện | 1 vùng, chỉ hiện khi sự kiện đang chạy |
| 2 | Kĩ năng riêng | 1 kĩ năng, 6 bậc hành động |
| 3 | Vật phẩm sự kiện | 6 món, khớp 6 bậc |
| 4 | Quái sự kiện | 4 con: cấp 1, cấp 25, cấp 55, cấp 85 |
| 5 | Yêu Vương sự kiện | 2 con: cấp 10, cấp 60 |
| 6 | Bí Cảnh sự kiện | 2 phó bản: cấp 25, cấp 70 |
| 7 | Quầy Đổi Thưởng | 5 gian hàng, tiêu bằng Điểm Sự Kiện |

Bản đồ sự kiện chặn nội dung bằng đường đã có sẵn trong game. Hành động nghề mang trường `zone` trỏ về bản đồ sự kiện. Quái nằm trong danh sách `enemies` của vùng đó.
Đứng ngoài bản đồ thì không thấy gì cả. Không phải dựng cơ chế mới nào.

## I4. Bốn luật cứng

**Luật một — kĩ năng sự kiện không cộng Tứ Trụ.**
Khai báo `stat: null` và `statXp: 0`, giống hệt Thiền Định.
Bỏ một sự kiện thì không tụt hậu vĩnh viễn. Sự kiện là thứ thêm màu cho game, không phải nghĩa vụ.

**Luật hai — mỗi kĩ năng giữ cấp riêng của nó, qua từng năm.**
Thái Nguyệt lên cấp sáu mươi tư năm nay thì Trung Thu năm sau vào vẫn là cấp sáu mươi tư.
Nhưng nó không cho Thái Tuyết một điểm kinh nghiệm nào. Mỗi sự kiện là một thang leo độc lập.

**Luật ba — phụ kiện sự kiện chỉ có tác dụng trong bản đồ sự kiện của nó.**
Ra khỏi bản đồ là số không. Nguyệt Hoa Bội của Trung Thu cũng không dùng được ở Sự Kiện Tết.
Nhờ vậy sự kiện không đẩy sức mạnh vào game chính, và không phải cân lại trang bị.

**Luật bốn — sự kiện đóng thì vật phẩm bốc hơi, còn Điểm Sự Kiện giữ lại.**
Điểm Sự Kiện là tiền chung của cả sáu sự kiện.
Ai tích điểm từ lần trước thì lần sau mua được món to ngay. Game báo trước ba ngày khi sắp đóng.

## I5. Bảng bậc kĩ năng — sáu bậc, dùng chung cho cả sáu sự kiện

| bậc | mở ở cấp | kinh nghiệm mỗi lượt | thời gian mỗi lượt | kinh nghiệm mỗi giây | điểm mỗi vật | vật mỗi giờ | điểm mỗi giờ |
|---|---|---|---|---|---|---|---|
| 1 | 1 | 45 | 12,0 giây | 3,75 | 0,3 | 300,0 | 90,0 |
| 2 | 10 | 110 | 20,0 giây | 5,50 | 0,6 | 180,0 | 108,0 |
| 3 | 22 | 240 | 30,0 giây | 8,00 | 1,0 | 120,0 | 120,0 |
| 4 | 36 | 480 | 42,0 giây | 11,43 | 1,8 | 85,7 | 154,3 |
| 5 | 52 | 900 | 58,0 giây | 15,52 | 3,0 | 62,1 | 186,2 |
| 6 | 70 | 1.600 | 76,0 giây | 21,05 | 5,0 | 47,4 | 236,8 |

## I6. Giờ cày để mở từng bậc

Cày liên tục, chưa cộng phụ kiện.

| mốc | tổng kinh nghiệm cần | giờ của đoạn này | giờ cộng dồn |
|---|---|---|---|
| Cấp 10 — mở bậc 2 | 15.675 | 1,2 | 1,2 |
| Cấp 22 — mở bậc 3 | 182.105 | 8,4 | 9,6 |
| Cấp 36 — mở bậc 4 | 820.050 | 22,2 | 31,7 |
| Cấp 52 — mở bậc 5 | 2.503.930 | 40,9 | **72,6** |
| Cấp 70 — mở bậc 6 | 6.154.225 | 65,3 | **138,0** |

Bậc năm mở sau 72,6 giờ, tức 5,2 giờ mỗi ngày trong mười bốn ngày. Người chơi chăm chỉ lấy được trong năm đầu.
Bậc sáu mở sau 138 giờ, tức 9,9 giờ mỗi ngày. **Cố ý vượt quá một đợt** — đây là phần thưởng dành cho người quay lại năm sau.

## I7. Sáu kiểu chơi — số máy chạy ra

Cày liên tục, leo thang từ cấp một, trừ hai dòng cuối là vào lại ở cấp cũ.

| kiểu chơi | giờ | cấp cuối đợt | điểm thu được |
|---|---|---|---|
| Năm một, chơi ít — 2 giờ mỗi ngày | 28 | 34 | 3.224 |
| Năm một, chơi vừa — 4 giờ mỗi ngày | 56 | 46 | 7.416 |
| Năm một, chơi chăm — 8 giờ mỗi ngày | 112 | 64 | 17.310 |
| Năm một, chơi chăm và có đủ bốn phụ kiện | 112 | 85 | 26.959 |
| Năm hai, vào lại ở cấp 64, có đủ phụ kiện | 112 | 99 | 33.537 |
| Năm ba, vào lại ở cấp 83, có đủ phụ kiện | 112 | 100 | 34.480 |

**Đường cong này là chủ ý.** Người chơi vừa phải vẫn mua được món quan trọng nhất là quả trứng Thần Phẩm.
Người chơi chăm chỉ vét sạch gian hàng giới hạn. Người quay lại năm thứ hai không còn gì để mua một lần nữa nên toàn bộ điểm chảy sang gian tiêu hao.

## I8. Hai ô Phụ Kiện Sự Kiện

Hai ô này chỉ hiện trên hình nhân vật khi sự kiện đang chạy.

| ô | lấy ở đâu | bản Sơ | bản Thượng |
|---|---|---|---|
| **Bội** | Yêu Vương sự kiện | cấp 10 — cộng 15% hiệu suất | cấp 60 — cộng 30% hiệu suất |
| **Ấn** | Bí Cảnh sự kiện | cấp 25 — cộng 20% kinh nghiệm | cấp 70 — cộng 40% kinh nghiệm |

Đeo được cả hai cùng lúc. Hiệu suất cộng vào mẫu số vòng lặp đúng cách hàm `effDenom` trong `activity.js` đang làm.
Với bản Thượng, vòng bậc sáu rút từ 76,0 giây xuống còn 58,5 giây.

Cả bốn món đều rơi **chắc chắn ở lần thông quan đầu tiên**, sau đó không rơi nữa.
Sự kiện chỉ có mười bốn ngày. Xui một chuỗi bốc số là mất trắng cả đợt, mà món này chỉ dùng trong sự kiện nên không có gì để săn tiếp.

Tên **Tín Vật** đã bị hệ Đàm Đạo dùng mất, nên không lấy lại được.

## I9. Bảng số quái, Yêu Vương và Bí Cảnh — dùng chung cả sáu sự kiện

### Bốn con quái

| vai | cấp | dáng | máu | công | thủ | nhanh | kinh nghiệm | Tứ Trụ | lực chiến | kháng | né |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Quái mở màn | 1 | viết tay | 60 | 9 | 3 | 72 | 5 | 1 | 15 | 0% | 0% |
| Quái nhanh | 25 | nhanh | 929 | 115 | 33 | 92 | 38 | 3 | 664 | 0% | 12% |
| Quái trâu | 55 | trâu | 12.522 | 231 | 159 | 60 | 81 | 7 | 3.679 | 15% | 2% |
| Quái cao cấp | 85 | thường | 20.841 | 451 | 193 | 70 | 76 | 11 | 6.389 | 5% | 5% |

⚠ **Con cấp một phải viết tay, không được dùng máy sinh `mk()`.**
Phép đo bắt được lỗi này: `mk(1, 'thường')` cho ra máu bằng 1 và kinh nghiệm bằng 0, tức là vô dụng.
Đó chính là lý do hai con cấp một có sẵn trong game — Sói Hoang và Heo Rừng — đều được viết tay.
Số ở bảng trên chép theo Sói Hoang.

### Hai Yêu Vương

| vai | cấp | máu | công | thủ | kinh nghiệm | lực chiến | hồi chiêu | điểm mỗi trận |
|---|---|---|---|---|---|---|---|---|
| Yêu Vương nhỏ | 10 | 1.014 | 41 | 16 | 31 | 387 | 2 giờ | 20 |
| Yêu Vương lớn | 60 | 57.110 | 416 | 160 | 164 | 14.228 | 7 giờ | 90 |

Thưởng Bạc, Hồn Thạch và kinh nghiệm chép theo Yêu Vương cùng cấp đang có trong game.
⛔ **Yêu Vương sự kiện không rơi Tinh Thể Yêu Vương.** Đó là nút chặn cường hoá từ cộng mười lên cộng mười lăm, cả game chỉ ra khoảng 6,4 viên một ngày. Thêm nguồn là phá đúng nút chặn ấy.
⛔ Cũng không rơi trứng Linh Thú thường. Trứng sự kiện mua ở quầy.

### Hai Bí Cảnh

| vai | cấp | thời lượng mỗi lượt | phí vào | Bạc | kinh nghiệm | Hồn Thạch | điểm mỗi lượt |
|---|---|---|---|---|---|---|---|
| Bí Cảnh nhỏ | 25 | 100 phút | 400 Bạc | 200–360 | 150 | 4–8 | 25 |
| Bí Cảnh lớn | 70 | 135 phút | 3.500 Bạc + 20 Hồn Thạch | 900–1.500 | 1.050 | 18–30 | 70 |

Khuôn chép theo Hắc Phong Lâm (cấp 25) và Xích Diệm Địa Cung (cấp 70).
⛔ **Bí Cảnh sự kiện không rơi Mảnh Trang Bị Hoàng Kim và không rơi Đồ Phổ Bộ.**
Kinh tế Mảnh đang là 175 ngày một bộ. Thêm nguồn sự kiện là phá thang đó.

## I10. Đánh đổi thật của người chơi

Game chỉ chạy một hoạt động tại một thời điểm. Trong sự kiện, người chơi phải chọn một trong ba việc.

- **Cày kĩ năng sự kiện** cho nhiều điểm nhất, đổi được nhiều quà nhất.
- **Chạy Bí Cảnh sự kiện** để lấy phụ kiện, và để năm sau vào là chạy ngay bậc cao.
- **Đánh quái sự kiện** cho vật phẩm sự kiện kèm kinh nghiệm Chiến Đấu bình thường.

Yêu Vương nằm ngoài đánh đổi này vì nó chạy ở hàng đợi nền, không chiếm ô hoạt động.

---

# PHẦN II — SÁU SỰ KIỆN

Sáu vật phẩm của mỗi sự kiện đổi được lần lượt 3 · 6 · 10 · 18 · 30 · 50 điểm cho mười cái.

## II1. SỰ KIỆN TẾT — tháng 2

**Bản đồ: Trường Xuân Miếu Hội.** Sân miếu đêm giao thừa. Phố đèn lồng đỏ rực, cây nêu dựng cao, xác pháo giấy rải kín mặt sân, mai vàng và đào thắm nở dọc tường gạch cũ.

**Kĩ năng: Thái Phúc.**

| bậc | hành động | mở ở cấp | vật phẩm |
|---|---|---|---|
| 1 | Nhặt Xác Pháo | 1 | Xác Pháo Đỏ |
| 2 | Xin Chữ Ông Đồ | 10 | Câu Đối Đỏ |
| 3 | Hái Mai Vàng | 22 | Mai Vàng Cánh Kép |
| 4 | Gỡ Phong Bao Treo Cành | 36 | Phong Bao Đỏ |
| 5 | Thỉnh Hương Đầu Năm | 52 | Trầm Hương Nguyên Đán |
| 6 | Trảy Lộc Cây Nêu | 70 | Lộc Cây Nêu |

**Bốn con quái.**

| con | cấp | dáng | lore một câu | rơi |
|---|---|---|---|---|
| **Lân Con** | 1 | viết tay | Đầu lân múa hội bỏ quên sau miếu, đêm về tự cựa mình dậy nhảy. | Xác Pháo Đỏ 30% |
| **Pháo Yêu** | 25 | nhanh | Xác pháo chất đống trăm năm tụ thành yêu, chạy tới đâu nổ lách tách tới đó. | Câu Đối Đỏ 26% |
| **Kim Ngưu Miếu** | 55 | trâu | Trâu đá canh cổng miếu, nghe đủ vạn lời khấn thì lớp đá nứt ra mà bước xuống. | Mai Vàng Cánh Kép 22% |
| **Thủ Tuế Quỷ** | 85 | thường | Quỷ canh khắc giao thừa, cả năm chỉ tỉnh đúng một đêm, tỉnh dậy là đòi nợ cũ. | Phong Bao Đỏ 18% |

**Hai Yêu Vương.**
- **Lân Vương Khai Hội** — cấp 10. Con lân đầu đàn mở hội, bờm đỏ như lửa, mỗi bước nhảy là một tiếng trống rền. Tuyệt kĩ **Bách Bộ Xuyên Vân**.
- **Niên Thú Vương** — cấp 60. Con Niên trong truyền thuyết, sừng đồng vảy sắt, mỗi năm xuống núi một lần nuốt trọn cả thôn. Tuyệt kĩ **Thôn Tuế Nhất Khẩu**.

**Hai Bí Cảnh.**
- **Miếu Đường Cổ** 廟 — cấp 25. Sân miếu khuya, khói hương chưa tan, tượng thần trong bóng tối như đang nhìn theo.
- **Trường Xuân Điện** 春 — cấp 70. Chính điện sâu trong miếu, cột sơn son thếp vàng, ngàn ngọn nến cháy suốt đêm không tắt.

**Bốn phụ kiện.** Xuân Huy Bội bản Sơ và Thượng · Nguyên Đán Ấn bản Sơ và Thượng.

**Linh Thú giới hạn: Kim Đồng Ngư** 🐟 — hệ Kim, vai Chiêu Tài, trụ Linh Xảo.
Chỉ số gốc: Công Kích 6 · Hộ Thể 3 · Sinh Lực 20 · Né Tránh 7 · Mệnh Trúng 6. Tổng 42.
Bị động **Ngư Dược Long Môn**: cá chép vượt vũ môn, sát thương tuyệt kĩ Linh Thú cộng 25%.
Chủ động **Kim Lân Kích**: hồi 3 hiệp, đòn nhân 1,5.

**Món ăn riêng: Bánh Chưng** — hồi 25% Sinh Lực, 12 điểm.
**Danh hiệu: Nghênh Xuân Khách** — 3.000 điểm.
**Quầy: Chợ Hoa Đầu Xuân.** Chủ quầy **Ông Đồ Già**.

---

## II2. SỰ KIỆN MÙA XUÂN — tháng 4

**Bản đồ: Bích Thảo Nguyên.** Thảo nguyên xanh non sau cơn mưa xuân. Suối vừa tan băng, hoa dại nở từng vạt, bướm bay rợp, và những quả trứng ngũ sắc ai đó giấu trong đám cỏ.

**Kĩ năng: Thái Thanh.**

| bậc | hành động | mở ở cấp | vật phẩm |
|---|---|---|---|
| 1 | Nhặt Trứng Giấu Trong Cỏ | 1 | Trứng Ngũ Sắc |
| 2 | Hái Cỏ Non | 10 | Cỏ Bích Thảo |
| 3 | Bắt Bướm Đầu Mùa | 22 | Phấn Cánh Bướm |
| 4 | Hứng Mưa Xuân | 36 | Giọt Xuân Lộ |
| 5 | Hái Hoa Sơ Nở | 52 | Hoa Sơ Xuân |
| 6 | Chiết Cành Liễu Biếc | 70 | Liễu Biếc Chi |

**Bốn con quái.**

| con | cấp | dáng | lore một câu | rơi |
|---|---|---|---|---|
| **Dê Non Đồng Cỏ** | 1 | viết tay | Dê con lạc bầy giữa đồng, húc bừa vào chân khách qua đường. | Trứng Ngũ Sắc 30% |
| **Bướm Độc Phấn** | 25 | nhanh | Bướm cánh rực rỡ đến chói mắt, phấn nó rắc xuống làm cỏ dưới chân héo rũ. | Cỏ Bích Thảo 26% |
| **Cự Quy Rêu** | 55 | trâu | Rùa già ngủ quên dưới lớp rêu dày, mai nó xanh như một gò đất nhỏ. | Phấn Cánh Bướm 22% |
| **Thảo Mộc Tinh** | 85 | thường | Cỏ cây cả cánh đồng dồn khí lại một chỗ mà thành hình người, đi tới đâu cỏ mọc theo tới đó. | Giọt Xuân Lộ 18% |

**Hai Yêu Vương.**
- **Hoa Linh Vương** — cấp 10. Đóa hoa đầu tiên nở mỗi mùa xuân, hút hết linh khí cả cánh đồng mà thành tinh. Tuyệt kĩ **Bách Hoa Tề Phóng**.
- **Thanh Đế Mộc Linh** — cấp 60. Mộc linh thay mặt Thanh Đế cai quản mùa xuân phương Đông, rễ nó ăn sâu suốt cả thảo nguyên. Tuyệt kĩ **Vạn Mộc Triều Sinh**.

**Hai Bí Cảnh.**
- **Noãn Thạch Cốc** 卵 — cấp 25. Thung lũng đá hình quả trứng, mỗi hòn ấp một sinh linh chưa nở.
- **Thanh Đế Thần Điện** 青 — cấp 70. Đền thờ thần mùa xuân, mái phủ dây leo, cột đá nứt ra mà hoa vẫn mọc.

**Bốn phụ kiện.** Bích Thảo Bội bản Sơ và Thượng · Thanh Đế Ấn bản Sơ và Thượng.

**Linh Thú giới hạn: Thải Vũ Điệp** 🦋 — hệ Mộc, vai Nhanh Nhẹn, trụ Thân Pháp.
Chỉ số gốc: Công Kích 6 · Hộ Thể 2 · Sinh Lực 16 · Né Tránh 10 · Mệnh Trúng 6. Tổng 40.
Bị động **Điệp Ảnh**: bóng cánh loang loáng, tuyệt kĩ Linh Thú giảm 1 hiệp hồi.
Chủ động **Ngũ Sắc Phấn Vũ**: hồi 3 hiệp, đòn nhân 1,3.

**Món ăn riêng: Bánh Trôi Ngũ Sắc** — hồi 25% Sinh Lực, 12 điểm.
**Danh hiệu: Đạp Thanh Khách** — 3.000 điểm.
**Quầy: Sạp Cỏ Đầu Nguồn.** Chủ quầy **Mục Đồng Áo Xanh**.

---

## II3. SỰ KIỆN ĐOAN NGỌ — tháng 6

**Bản đồ: Đoan Dương Giang.** Khúc sông giữa trưa hè nắng gắt nhất năm. Thuyền rồng đua nhau rẽ nước, đầm sen nở kín một bờ, khói hùng hoàng bay là là, dây ngũ sắc buộc đầy cổ tay lũ trẻ trên bến.

**Kĩ năng: Thái Liên.**

| bậc | hành động | mở ở cấp | vật phẩm |
|---|---|---|---|
| 1 | Hái Lá Sen | 1 | Lá Sen Non |
| 2 | Bện Dây Ngũ Sắc | 10 | Dây Ngũ Sắc |
| 3 | Đãi Bột Hùng Hoàng | 22 | Bột Hùng Hoàng |
| 4 | Hái Gương Sen | 36 | Gương Sen Vàng |
| 5 | Vớt Mảnh Thuyền Rồng | 52 | Vảy Thuyền Rồng |
| 6 | Trích Xương Bồ Ngàn Năm | 70 | Xương Bồ Chi |

**Bốn con quái.**

| con | cấp | dáng | lore một câu | rơi |
|---|---|---|---|---|
| **Cua Càng Đỏ** | 1 | viết tay | Cua bò lên bến kiếm ăn, càng đỏ au, gặp người là giương lên doạ. | Lá Sen Non 30% |
| **Thủy Xà Hùng Hoàng** | 25 | nhanh | Rắn nước uống nhầm rượu hùng hoàng, vảy vàng khè, nọc độc hơn gấp bội. | Dây Ngũ Sắc 26% |
| **Trâu Nước Đầm Sen** | 55 | trâu | Trâu đầm mình dưới sen cả trăm năm, sừng nó quấn đầy ngó sen mọc thành rễ. | Bột Hùng Hoàng 22% |
| **Ngũ Độc Yêu** | 85 | thường | Rắn, rết, bọ cạp, thạch sùng và cóc hợp lại làm một thân — thứ mà cả ngày Đoan Ngọ sinh ra để trừ. | Gương Sen Vàng 18% |

**Hai Yêu Vương.**
- **Xích Long Chu** — cấp 10. Chiếc thuyền rồng đỏ đua thắng trăm mùa, gỗ nó ngậm đủ tiếng trống và tiếng hò mà hoá long. Tuyệt kĩ **Phá Lãng Xung Phong**.
- **Ngũ Độc Chi Vương** — cấp 60. Chúa tể của năm loài độc, ngồi giữa đầm nước đục, hơi thở đi tới đâu sen héo tới đó. Tuyệt kĩ **Ngũ Độc Câu Phát**.

**Hai Bí Cảnh.**
- **Liên Hoa Đãng** 蓮 — cấp 25. Đầm sen mênh mông, lá to bằng chiếc thuyền, dưới nước có gì đó đang bơi theo.
- **Long Chu Thủy Cung** 龍 — cấp 70. Cung điện dưới đáy sông, cột chống là mái chèo của những chiếc thuyền đã chìm.

**Bốn phụ kiện.** Đoan Dương Bội bản Sơ và Thượng · Ngũ Độc Ấn bản Sơ và Thượng.

**Linh Thú giới hạn: Xích Diễm Long Câu** 🐉 — hệ Hỏa, vai Bạo Phát, trụ Lực Đạo.
Chỉ số gốc: Công Kích 10 · Hộ Thể 3 · Sinh Lực 18 · Né Tránh 4 · Mệnh Trúng 5. Tổng 40.
Bị động **Dương Cực**: giữa trưa hè dương khí thịnh nhất, sát thương tuyệt kĩ Linh Thú cộng 35%.
Chủ động **Liệt Dương Trảm**: hồi 4 hiệp, đòn nhân 1,9.

**Món ăn riêng: Bánh Ú Tro** — hồi 25% Sinh Lực, 12 điểm.
**Danh hiệu: Đoan Dương Khách** — 3.000 điểm.
**Quầy: Bến Thuyền Rồng.** Chủ quầy **Lão Chèo Đò**.

---

## II4. SỰ KIỆN VU LAN — tháng 8

**Bản đồ: Vong Xuyên Ngạn.** Bờ sông Vong Xuyên đêm rằm tháng Bảy. Hoa đăng thả xuống trôi thành một dòng lửa dài, hoa bỉ ngạn đỏ mọc kín bờ, sương lạnh sát mặt nước, và bên kia bờ có những cái bóng đứng nhìn sang.

**Kĩ năng: Thái Đăng.**

| bậc | hành động | mở ở cấp | vật phẩm |
|---|---|---|---|
| 1 | Vớt Đăng Trôi | 1 | Hoa Đăng Giấy |
| 2 | Gom Tro Vàng Mã | 10 | Tro Vàng Mã |
| 3 | Hái Bỉ Ngạn | 22 | Bỉ Ngạn Hoa |
| 4 | Thu Hồn Hoả | 36 | Hồn Hoả Lam |
| 5 | Gạn Nước Vong Xuyên | 52 | Vong Xuyên Thủy |
| 6 | Trích Mảnh Tam Sinh Thạch | 70 | Mảnh Tam Sinh Thạch |

**Bốn con quái.**

| con | cấp | dáng | lore một câu | rơi |
|---|---|---|---|---|
| **Dơi Giấy** | 1 | viết tay | Vàng mã đốt dở bay lên, gặp gió thì thành đàn dơi giấy chao qua chao lại. | Hoa Đăng Giấy 30% |
| **Cô Hồn Lang Thang** | 25 | nhanh | Hồn không ai cúng, cả năm đói khát, rằm tháng Bảy mới được ra ngoài một bận. | Tro Vàng Mã 26% |
| **Ngưu Đầu Tướng** | 55 | trâu | Quỷ sứ đầu trâu canh bờ sông, tay cầm chĩa ba, chưa từng để sót một hồn nào. | Bỉ Ngạn Hoa 22% |
| **Mã Diện Tướng** | 85 | thường | Quỷ sứ mặt ngựa đi cùng Ngưu Đầu, nó không bắt hồn — nó đọc tên hồn. | Hồn Hoả Lam 18% |

**Hai Yêu Vương.**
- **Đề Đăng Quỷ Sứ** — cấp 10. Quỷ xách đèn soi đường cho hồn mới, ai nhìn thẳng vào đèn thì quên mất mình là ai. Tuyệt kĩ **Dẫn Hồn Đăng**.
- **Mạnh Bà** — cấp 60. Bà lão nấu canh quên bên cầu Nại Hà, nồi canh sôi suốt ngàn năm chưa từng cạn. Tuyệt kĩ **Nhất Oản Vong Tình**.

**Hai Bí Cảnh.**
- **Bỉ Ngạn Hoa Hải** 彼 — cấp 25. Biển hoa đỏ không một chiếc lá, đi giữa đó thì không nghe được tiếng chân mình.
- **Nại Hà Kiều** 奈 — cấp 70. Cây cầu đá bắc qua Vong Xuyên, một đầu là dương gian, đầu kia không ai kể lại được.

**Bốn phụ kiện.** Vong Xuyên Bội bản Sơ và Thượng · Tam Sinh Ấn bản Sơ và Thượng.

**Linh Thú giới hạn: U Minh Miêu** 🐈‍⬛ — hệ Thổ, vai Ẩn Nặc, trụ Linh Xảo.
Chỉ số gốc: Công Kích 7 · Hộ Thể 4 · Sinh Lực 19 · Né Tránh 8 · Mệnh Trúng 7. Tổng 45.
Bị động **Âm Hành**: bước đi không tiếng, Né Tránh của Linh Thú cộng 20% và cộng thẳng cho chủ.
Chủ động **Câu Hồn Trảo**: hồi 3 hiệp, đòn nhân 1,4, hút máu hồi chủ nhân 0,5.

**Món ăn riêng: Cháo Thí Thực** — hồi 25% Sinh Lực, 12 điểm.
**Danh hiệu: Độ Vong Khách** — 3.000 điểm.
**Quầy: Sạp Vàng Mã Bên Sông.** Chủ quầy **Thầy Cúng Áo Xám**.

---

## II5. SỰ KIỆN TRUNG THU — tháng 9

**Bản đồ: Quảng Hàn Nguyệt Cảnh.** Cung trăng của Hằng Nga. Nền đá lam bạc, cây quế ngàn tuổi toả bóng, đèn lồng trôi lơ lửng không dây, và bóng thỏ ngọc giã thuốc in lên vách đá suốt đêm không nghỉ.

**Kĩ năng: Thái Nguyệt.**

| bậc | hành động | mở ở cấp | vật phẩm |
|---|---|---|---|
| 1 | Nhặt Đèn Trôi | 1 | Đèn Lồng Rơi |
| 2 | Hái Quế Hoa | 10 | Quế Hoa |
| 3 | Đãi Nguyệt Ảnh | 22 | Nguyệt Ảnh Sa |
| 4 | Lần Dấu Ngọc Thố | 36 | Ngọc Thố Mao |
| 5 | Giã Thuốc Cùng Ngọc Thố | 52 | Nguyệt Tinh Đan Sa |
| 6 | Trích Quảng Hàn Chi | 70 | Quảng Hàn Chi |

**Bốn con quái.**

| con | cấp | dáng | lore một câu | rơi |
|---|---|---|---|---|
| **Thố Yêu** | 1 | viết tay | Thỏ hoang lạc lên cung trăng, ăn nhầm thuốc rơi, lông mọc dài ra trắng lốp. | Đèn Lồng Rơi 30% |
| **Quế Hương Yêu** | 25 | nhanh | Hương quế đọng lại ngàn năm thành hình người, thoảng qua là mê, hít sâu là ngã. | Quế Hoa 26% |
| **Ngọc Thiềm** | 55 | trâu | Cóc ngọc ba chân ngồi giữa vũng trăng, da nó cứng hơn đá, nuốt vàng nhả bạc. | Nguyệt Ảnh Sa 22% |
| **Nguyệt Ma Ảnh** | 85 | thường | Bóng tối bị ánh trăng bỏ sót, càng soi càng đậm, cuối cùng đứng dậy đi được. | Ngọc Thố Mao 18% |

**Hai Yêu Vương.**
- **Ngọc Thố Nguyệt Sứ** — cấp 10. Thỏ ngọc giã thuốc cho Hằng Nga, chày trong tay nó nặng bằng cả một quả núi. Tuyệt kĩ **Ngọc Chử Đảo Thiên**.
- **Thái Âm Thiềm Vương** — cấp 60. Cóc chúa nuốt trăng, mỗi lần nó há miệng là mặt đất tối đi một khắc. Tuyệt kĩ **Thôn Nguyệt**.

**Hai Bí Cảnh.**
- **Quế Ảnh Lâm** 桂 — cấp 25. Rừng quế bóng lồng bóng, đi mãi vẫn thấy cùng một gốc cây.
- **Quảng Hàn Cung Khuyết** 廣 — cấp 70. Cung điện lạnh trên trăng, hành lang dài hun hút, không một hơi ấm nào.

**Bốn phụ kiện.** Nguyệt Hoa Bội bản Sơ và Thượng · Quảng Hàn Ấn bản Sơ và Thượng.

**Linh Thú giới hạn: Ngọc Thố** 🐇 — hệ Thủy, vai Cát Tường, trụ Linh Xảo.
Chỉ số gốc: Công Kích 5 · Hộ Thể 4 · Sinh Lực 22 · Né Tránh 8 · Mệnh Trúng 5. Tổng 44.
Bị động **Thiềm Cung Hộ**: gánh thay chủ nhân thêm 10% sát thương mỗi trận.
Chủ động **Ngọc Chử Đảo**: hồi 3 hiệp, đòn nhân 1,3, hồi máu chủ nhân 0,4.

**Món ăn riêng: Bánh Trung Thu** — hồi 25% Sinh Lực, 12 điểm.
**Danh hiệu: Nguyệt Hạ Khách** — 3.000 điểm.
**Quầy: Nguyệt Hạ Nhai.** Chủ quầy **Nguyệt Hạ Lão Nhân**.

---

## II6. SỰ KIỆN GIÁNG SINH — tháng 12

**Bản đồ: Hàn Tùng Tuyết Nguyên.** Rừng thông tuyết phủ trắng xoá. Đèn ấm treo lủng lẳng trên cành, chuông đồng khẽ vang mỗi lần gió lùa, tuần lộc trắng đi thành hàng, và cuối rừng có một căn nhà gỗ còn khói bếp.

**Kĩ năng: Thái Tuyết.**

| bậc | hành động | mở ở cấp | vật phẩm |
|---|---|---|---|
| 1 | Nhặt Quả Thông | 1 | Quả Thông Khô |
| 2 | Gỡ Mảnh Chuông Đồng | 10 | Mảnh Chuông Đồng |
| 3 | Vun Tuyết Tinh | 22 | Tuyết Tinh |
| 4 | Chặt Thông Xanh | 36 | Thông Chi Xanh |
| 5 | Hứng Sương Băng | 52 | Băng Lộ Châu |
| 6 | Trích Hàn Tùng Tủy | 70 | Hàn Tùng Tủy |

**Bốn con quái.**

| con | cấp | dáng | lore một câu | rơi |
|---|---|---|---|---|
| **Sóc Tuyết** | 1 | viết tay | Sóc lông trắng tha quả thông về tổ, ai lại gần là nó ném xuống đầu. | Quả Thông Khô 30% |
| **Tuyết Đồng Tử** | 25 | nhanh | Người tuyết trẻ con nặn dở, đêm xuống thì tự gắn thêm tay mà chạy. | Mảnh Chuông Đồng 26% |
| **Băng Hùng** | 55 | trâu | Gấu trắng ngủ đông bị đánh thức, bộ lông đóng băng thành một lớp giáp. | Tuyết Tinh 22% |
| **Hàn Sương Yêu** | 85 | thường | Sương giá đọng trên cành thông đủ trăm mùa thì kết thành hình người, chạm vào là buốt tới xương. | Thông Chi Xanh 18% |

**Hai Yêu Vương.**
- **Bạch Giác Lộc Vương** — cấp 10. Tuần lộc gạc trắng dẫn đầu đàn, vó nó đạp lên tuyết mà không để lại vết. Tuyệt kĩ **Tuyết Nguyên Đạp Phong**.
- **Tuyết Sơn Lão Nhân** — cấp 60. Ông lão sống trong nhà gỗ cuối rừng, mỗi năm đúng một đêm gõ cửa từng nhà, và không ai nhớ mặt ông. Tuyệt kĩ **Nhất Dạ Phong Tuyết**.

**Hai Bí Cảnh.**
- **Tùng Tuyết Kính** 松 — cấp 25. Lối mòn giữa rừng thông, tuyết dày tới gối, đi được nửa đường thì mất dấu chân mình.
- **Hàn Chung Điện** 鐘 — cấp 70. Điện thờ treo ngàn chiếc chuông băng, chuông nào vang lên thì một người quên mất một chuyện.

**Bốn phụ kiện.** Tuyết Linh Bội bản Sơ và Thượng · Hàn Chung Ấn bản Sơ và Thượng.

**Linh Thú giới hạn: Bạch Lộc** 🦌 — hệ Thủy, vai Trợ Thủ, trụ Hộ Thể.
Chỉ số gốc: Công Kích 4 · Hộ Thể 7 · Sinh Lực 28 · Né Tránh 5 · Mệnh Trúng 3. Tổng 47.
Bị động **Đạp Tuyết Vô Ngân**: bước không dấu, Sinh Lực của Linh Thú cộng 20%.
Chủ động **Hàn Chung Nhất Kích**: hồi 4 hiệp, đòn nhân 0,5, hồi máu chủ nhân 1,7.

**Món ăn riêng: Bánh Gừng Mật** — hồi 25% Sinh Lực, 12 điểm.
**Danh hiệu: Tuyết Dạ Khách** — 3.000 điểm.
**Quầy: Quán Đèn Ấm.** Chủ quầy **Ông Lão Nhà Gỗ**.

---

## II7. Ngũ hành sáu Linh Thú giới hạn

| sự kiện | Linh Thú | hệ |
|---|---|---|
| Tết | Kim Đồng Ngư | Kim |
| Mùa Xuân | Thải Vũ Điệp | Mộc |
| Đoan Ngọ | Xích Diễm Long Câu | Hỏa |
| Vu Lan | U Minh Miêu | Thổ |
| Trung Thu | Ngọc Thố | Thủy |
| Giáng Sinh | Bạch Lộc | Thủy |

Năm hệ phủ đủ ở năm sự kiện đầu. Sự kiện thứ sáu lặp lại hệ Thủy vì băng tuyết vốn thuộc Thủy — không có hệ thứ sáu để chia.
Tổng chỉ số sáu con nằm trong khoảng 40 đến 47. So với Linh Thú thường trong game, Thiên Ma là 44 và Cự Hùng là 48.
⇒ Linh Thú sự kiện là món sưu tập, không phải món bắt buộc phải có.

---

# PHẦN III — QUẦY ĐỔI THƯỞNG

Năm gian hàng. Cấu trúc giống hệt nhau ở cả sáu sự kiện, chỉ gian đầu là đổi hàng theo chủ đề.

## III1. Luật bày hàng

**Hàng giới hạn — mua một lần mỗi đợt.** Là thứ chỉ sự kiện mới có: Linh Thú, danh hiệu, ảnh đại diện, ảnh bìa.
**Hàng tiêu hao — mua bao nhiêu cũng được.** Là thứ game đã có sẵn nhưng khoá sau cấp nghề cao.

⇒ Sự kiện cho **đường vào**, không đẻ ra bậc sức mạnh mới. Người cấp 30 uống được Ngộ Đạo Đan, nhưng đó vẫn là viên đan cũ của game chứ không phải viên mạnh hơn.
⇒ Người cày dư điểm không bị thừa vô nghĩa. Toàn bộ phần dư đổ vào gian tiêu hao.

## III2. Gian Trân Phẩm — giới hạn, đổi theo từng sự kiện

| món | điểm |
|---|---|
| Trứng Linh Thú sự kiện · Thần Phẩm | 6.000 |
| Trứng Linh Thú sự kiện · Linh Phẩm | 1.800 |
| Trứng Linh Thú sự kiện · Phàm Phẩm | 400 |
| Danh hiệu của sự kiện | 3.000 |
| Ảnh đại diện sự kiện, hai mẫu | 1.200 mỗi mẫu |
| Ảnh bìa sự kiện | 2.000 |

**Cộng cả gian: 15.600 điểm.**
Danh hiệu và hai loại ảnh mua một lần là có vĩnh viễn. Năm sau gian này chỉ còn ba quả trứng, tức 8.200 điểm.

## III3. Gian Đan Dược — tiêu hao, giống nhau ở mọi sự kiện

Bốn viên đan bổ trợ đỉnh cao, công thức Luyện Đan cấp 85, hiệu lực mười hai phút.

| món | điểm | tác dụng | giá Bạc gốc |
|---|---|---|---|
| Cường Nguyên Đan | 120 | Công Kích, Hộ Thể, Sinh Lực đều cộng 30% | 148 |
| Bách Bảo Đan | 130 | Tỉ lệ rơi đồ cộng 30%, Bạc cộng 30% | 156 |
| Ngộ Đạo Đan | 140 | Kinh nghiệm Chiến Đấu cộng 25% | 168 |
| Dưỡng Thú Đan | 125 | Kinh nghiệm Linh Thú cộng 80%, bớt 35% Thể Lực | 152 |
| Hoàn Hồn Đan | 60 | Hồi 60% Sinh Lực | 70 |

## III4. Gian Trù Phòng — tiêu hao

| món | điểm | tác dụng | giá Bạc gốc |
|---|---|---|---|
| Thiên Trì Ngư Tần | 90 | Hồi 1.100 Sinh Lực | 380 |
| Hải Giao Ngư Hầm | 65 | Hồi 880 Sinh Lực | 270 |
| Món ăn riêng của sự kiện | 12 | Hồi 25% Sinh Lực | — |

Món ăn riêng hồi theo phần trăm nên càng cấp cao càng đáng. Nó rẻ để ai cũng mua nổi, và nó là thứ người chơi nhớ về sự kiện đó.

## III5. Gian Linh Thạch — tiêu hao

Ba viên Thượng Phẩm, công thức Luyện Đan cấp 75. Một viên phủ hai mươi phút hoạt động.

| món | điểm | tác dụng | giá Bạc gốc |
|---|---|---|---|
| Tụ Khí Thạch Thượng Phẩm | 45 | Kinh nghiệm nghề cộng 25% | 92 |
| Bội Sản Thạch Thượng Phẩm | 52 | 14% cơ hội nhân đôi sản vật | 110 |
| Thôi Vận Thạch Thượng Phẩm | 60 | Hiệu suất cộng 8% | 128 |

⛔ **Linh Thạch không lắp được cho kĩ năng sự kiện.**
Ô Bội và ô Ấn đã làm đúng việc tăng hiệu suất và tăng kinh nghiệm rồi. Chồng thêm tầng thứ ba là vừa nhân dồn hệ số, vừa nới rộng thêm chỗ yếu đã ghi ở mục IV2.

## III6. Gian Tạp Hoá — tiêu hao

| món | điểm |
|---|---|
| Đá Cường Hóa Cao, năm viên | 400 |
| Hồn Thạch, năm trăm viên | 700 |
| Nguyên Bảo, một trăm viên | 2.500 |

⛔ **Không bán Tinh Thể Yêu Vương.** Lý do đã ghi ở mục I9.

## III7. Điểm dư đổ vào gian tiêu hao

| kiểu chơi | điểm thu | hàng giới hạn cần | dư |
|---|---|---|---|
| Năm một, chơi ít | 3.224 | 15.600 | thiếu 12.377 |
| Năm một, chơi vừa | 7.416 | 15.600 | thiếu 8.184 |
| Năm một, chơi chăm | 17.310 | 15.600 | dư 1.710 |
| Năm một, chăm và đủ bốn phụ kiện | 26.959 | 15.600 | dư 11.359 |
| Năm hai, vào lại ở cấp 64 | 33.537 | 8.200 | **dư 25.337** |
| Năm ba, vào lại ở cấp 83 | 34.480 | 8.200 | **dư 26.280** |

Người chơi ít và chơi vừa không mua nổi cả gian giới hạn nên phải chọn. Cả hai đều thừa sức mua quả trứng Thần Phẩm 6.000 điểm — món quan trọng nhất.
Người quay lại năm thứ hai dư hơn hai mươi lăm nghìn điểm. Số đó đổi ra khoảng **180 viên Ngộ Đạo Đan**, tức ba mươi sáu giờ buff kinh nghiệm, rải dần tới sự kiện sau.

---

# PHẦN IV — RÀNG BUỘC KỸ THUẬT

## IV1. Chống gian lận — bắt buộc sinh lại tệp SQL và user chạy lại

Chốt chống gian lận tầng hai đo theo công thức: lượng kinh nghiệm tăng thêm phải nhỏ hơn hoặc bằng thời gian đã làm nhân với tốc độ tối đa nhân với mười, cộng phụ cấp.
Nó tra bảng `tran_toc_do` **theo từng nghề một**.

Sáu kĩ năng sự kiện đều là nghề mới, chưa có dòng nào trong bảng đó. Không thêm thì **mọi người chơi sự kiện đều bị ghi vào sổ nghi vấn, rồi bị chặn đồng bộ**.

Bốn việc phải làm:
1. Thêm cả sáu khoá vào bảng nghề mà `_sinh_sql_tran.mjs` quét: `thaiPhuc`, `thaiThanh`, `thaiLien`, `thaiDang`, `thaiNguyet`, `thaiTuyet`.
2. Thêm hai hằng số phụ kiện sự kiện vào phép tính `effDenom` và `expNghe` của bộ sinh: cộng 30% hiệu suất và cộng 40% kinh nghiệm.
3. Chạy lại bộ sinh để ra `docs/SQL_CHONG_GIAN_LAN.sql`.
4. **User dán tệp đó vào Supabase SQL Editor và chạy.**

⚠ Thêm hết sáu dòng ngay từ đợt đầu, kể cả sự kiện chưa dựng.
Thêm dần từng đợt thì mỗi lần lên sự kiện mới lại phải nhờ user chạy SQL một lần nữa. Quên một lần là cả làng bị chặn.

## IV2. Cái giá của thang siết — trần từng kĩ năng rộng hơn nghề thường

Bậc sáu là 21,05 kinh nghiệm mỗi giây. Nhân phụ kiện thì lên khoảng 38. Nghề thường cao nhất là Rèn Đúc, chỉ 5,89.
Bảng `tran_toc_do` tra theo khoá riêng từng nghề, nên **trần của nghề khác không hề bị nới**. Nhưng riêng track sự kiện thì kẻ gian có chỗ rộng hơn.

Chấp nhận được vì kinh nghiệm kĩ năng sự kiện **không đổi ra sức mạnh**. Nó không cộng Tứ Trụ, không cộng Chiến Đấu, chỉ mở bậc hái.
Thứ ăn gian được là quà sưu tập, mà Linh Thú sự kiện đã cố ý để chỉ số tầm trung.

## IV3. Trần Chiến Đấu không đổi

Kinh nghiệm cao nhất của một con trong sự kiện là **164**, ở Yêu Vương cấp 60.
Kinh nghiệm cao nhất game đang có là **399**, ở Bất Diệt Kim Cang.
⇒ Không chạm trần. Không phải tính lại gì cho đường Chiến Đấu.

## IV4. Quái cấp một phải viết tay

Máy sinh `mk()` cho ra máu bằng 1 và kinh nghiệm bằng 0 ở cấp một. Hai con cấp một có sẵn trong game đều viết tay vì lý do này.
Sáu con quái mở màn của sáu sự kiện đều phải viết tay theo khuôn Sói Hoang.

## IV5. Bốc số phải tính lại được

Mọi lần bốc số trong sự kiện dùng `rngHam(state, '<miền riêng>')`, mỗi sự kiện một miền mới.
Mượn miền cũ là làm lệch bộ đếm của cả đường thưởng đang chạy, mà lỗi kiểu đó im lặng.

## IV6. Bật và tắt sự kiện bằng LỆNH BÀI

**Có, hệ sự kiện gắn thẳng vào Lệnh Bài.** Tác giả dùng Lệnh Bài ban lệnh thì sự kiện mở, không phải deploy lại game.
Lệnh Bài hiện đang chờ user chốt. Chưa có nó thì lịch phải gắn cứng trong thư mục `data/`, và mỗi lần đổi lịch là một lần deploy.

### Bảng `su_kien` trên Supabase

| cột | kiểu | dùng làm gì |
|---|---|---|
| `ma` | text, khoá chính | `tet` · `xuan` · `doanNgo` · `vuLan` · `trungThu` · `giangSinh` |
| `mo_luc` | timestamptz | mốc mở |
| `dong_luc` | timestamptz | mốc đóng |
| `chi_tac_gia` | boolean | bật thì chỉ tài khoản tác giả thấy — để chạy thử trước khi mở cho cả làng |
| `cau_hinh` | jsonb | cờ đổi luật toàn cõi, ví dụ nhân Bạc rơi |

Luật RLS: ai cũng đọc được. Chỉ `auth.uid()` khớp uid tác giả mới ghi được.

### Bốn việc Lệnh Bài làm được

1. **Mở sự kiện** — đặt `mo_luc` và `dong_luc`, bấm Ban Lệnh.
2. **Hoãn hoặc kéo dài** — sửa `dong_luc`. Người chơi mất mạng đúng mấy ngày cuối thì gia hạn cho họ được.
3. **Chạy thử riêng tác giả** — bật `chi_tac_gia`, mở bản đồ ra soi trước, thấy ổn mới hạ cờ. Đây là thứ đáng giá nhất trong bốn cái.
4. **Bật cờ đổi luật toàn cõi** — ghi vào `cau_hinh`, ví dụ Tết cộng 50% Bạc khắp nơi.

### ⚠⚠ Bảng ghi MỐC THỜI GIAN, tuyệt đối không ghi công tắc bật/tắt

Nếu bảng chỉ ghi một ô `dang_mo` đúng hoặc sai thì người chơi mất mạng sẽ không biết sự kiện còn hay hết.
- Mặc định coi là đóng thì người đang cày mất sạch giữa chừng vì rớt mạng.
- Mặc định coi là mở thì sự kiện không bao giờ đóng được với người ngoại tuyến.

Ghi mốc thời gian thì hết chuyện đó. Client đọc bảng một lần rồi **đệm hai cái mốc vào save**. Mất mạng vẫn tự suy ra sự kiện còn hay hết, vì mốc là thời gian tuyệt đối.
Client đọc bảng qua đúng đường hẹn giờ 60 giây mà Phong Vân Bảng đang dùng, không đọc lại mỗi nhịp vẽ.

### ⚠⚠ Lệnh Bài KHÔNG phải hàng rào

Đây là đúng cái bẫy đã ghi ở `isAuthorAccount`: ai sửa mã client cũng mở được màn Lệnh Bài.
Hàng rào thật là RLS neo vào `auth.uid()`. Kẻ gian bật được màn hình lên nhưng ghi vào bảng thì bị chặn.

Nhưng còn một lỗ nữa, và nó là lỗ riêng của hệ sự kiện: **kẻ gian sửa client để tự cho mình thấy sự kiện đang mở**, rồi cày vật phẩm và điểm ngoài thời gian cho phép.

⇒ Bịt bằng **phép kiểm thứ tư trong chốt chống gian lận, tên là `ngoai_su_kien`**:
lượng kinh nghiệm tăng thêm của sáu track sự kiện phải bằng không, nếu thời điểm ghi không nằm giữa `mo_luc` và `dong_luc` của sự kiện đó.
Chốt đang chạy trong Postgres nên đọc bảng `su_kien` là chuyện trong tầm tay, không phát sinh gì mới.

### Hộp quà đi kèm

Phần `qua_tang` của Lệnh Bài dùng luôn được cho sự kiện: bù Điểm Sự Kiện cho người gặp lỗi, hoặc phát quà mốc cho cả làng.
⚠ Chốt chống gian lận phải **cộng quà vào trần**. Không thì hộp quà năm triệu Bạc rơi thẳng vào sổ nghi vấn.

---

# PHẦN V — Ý TƯỞNG THÊM, CHƯA DUYỆT

Bảy ý dưới đây đều móc vào hệ thống đã có sẵn, không cái nào phải dựng nền mới.

**1. Bot cũng đi sự kiện.** Đổi kho câu của Giang Hồ Feed sang câu sự kiện trong mười bốn ngày. Chỉ thêm một kho câu, mà cả giang hồ cùng đi hội với mình.

**2. Tông Môn cử đệ tử đi sự kiện.** Gỡ đúng nút thắt ở mục I10 — game chỉ chạy một hoạt động một lúc. Đệ tử đi thay thì làm được cả hai việc. Nối thẳng vào lý do nuôi đệ tử vốn đang không cho sức mạnh nào.

**3. Vạn Vật Phổ thêm phổ thứ tám.** Vật phẩm sự kiện bốc hơi khi đóng cửa. Cày hai tuần rồi mất sạch là cảm giác tệ. Đăng ký vào phổ thì cái đã nhặt được ghi lại vĩnh viễn.

**4. Bí Cảnh sự kiện là bản khoác da của mini-game đã có.** Kỳ Trận Trảm Yêu và Đăng Tiên Mộng là hai engine hoàn chỉnh đang nằm không.

**5. Đàm Đạo thêm một chương mỗi sự kiện.** Đàm Đạo đã trọn chín trên chín arc, mục còn ngỏ duy nhất là phần thưởng.

**6. Động Phủ trang trí theo mùa.** Đèn lồng, cây thông, mai đào mua bằng điểm, ở lại vĩnh viễn sau khi sự kiện đóng.

**7. Sự kiện đổi luật toàn cõi.** Tết cộng 50% Bạc khắp nơi, đọc một cờ từ bảng `su_kien`.
Đã có số đo sẵn: nhân kinh nghiệm tới 2,9 lần thì không ai bị ghi sổ, tới 8,8 lần thì không ai bị chặn. Cờ 1,5 lần hay 2 lần nằm trong vùng an toàn.

## Hai thứ phải nói lại cho đúng

**Bảng xếp hạng sự kiện làm được.** Trước đây tôi báo là máy chủ không làm nổi — sai.
Bảng `ho_so_cong_khai` đã tồn tại và client tự đẩy mỗi lần lưu save. Thêm một cột là ra bảng đua thật, trễ nhiều nhất mười lăm giây.

**Nhưng thêm bảng xếp hạng là mở đúng chỗ yếu nhất.** Xem mục IV2. Treo bảng đua lên track sự kiện là biến nó thành thứ đáng ăn gian.
Muốn có bảng thì phải siết trần track sự kiện lại trước.

---

# PHẦN VI — ART

Cần **159 tệp** cho trọn sáu sự kiện. Danh sách đầy đủ và prompt cho từng tệp nằm ở `docs/ART_SU_KIEN.md`.

---

# PHẦN VII — CÒN NGỎ

- Nhiệm vụ sự kiện, một chuỗi bảy mục cho điểm thẳng, dành cho người bận không cày nổi.
- Yêu Vương sự kiện dùng chung cả máy chủ, mọi người cùng bào một thanh máu. Cần ghi chéo giữa các tài khoản nên đắt, chưa nên làm.
- Sự kiện có nên cho Bang Phái tranh nhau thứ gì không.
