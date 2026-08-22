# Bảng Giá — bán cho Thương Nhân vs treo Sàn

> MÁY SINH bởi `_mockup/_covua_wip/_sinh_bang_gia.mjs`. Đừng sửa tay — sửa luật giá ở tệp đó rồi sinh lại.

**Luật giá sàn**

| nhóm | giá sàn |
|---|---|
| Trang bị | `giá NPC × hệ số phẩm + chi phí ép + 3` |
| Công cụ · Đồ phổ · Trứng pet | `giá NPC × 5 + 3` |
| Đan Đan Điền phẩm 6–9 (chỉ rơi) | `giá NPC × 80 + 3` |
| Liệu khai thác và mọi thứ còn lại | `giá NPC + 3` |

Chênh lệch 3 Bạc là để giá sàn không bao giờ bằng giá NPC — bằng nhau thì không ai lên sàn.
Tiền làm tròn LÊN.

Đan phẩm 1–5 nấu được ở Dược Lư (0,06–0,25 giờ máy chạy một viên) nên đi theo dòng cuối. Phẩm 6–9 không có công thức, chỉ rơi 6% mỗi lượt Yêu Vương · Bí Cảnh: 37,5–50 giờ máy chạy cho một viên. Hệ số 80 chính là hệ số phẩm Hiếm — một viên đan rơi ngang một trang bị Hiếm cùng giá NPC.

Hệ số phẩm: Thường ×13 · Tốt ×33 · Hiếm ×80 · Cực Hiếm ×199 · Sử Thi ×358 · Truyền Thuyết ×645 · Độc Nhất ×1160

Bốn bậc đầu suy từ tỉ lệ rơi thật (`MONSTER_QUALITY_W` 60/25/10/5). Ba bậc trên không rơi từ quái thường nên là ngoại suy. Mốc neo là **Cực Hiếm cấp 100 = 998.983 Bạc ≈ 183 giờ cày**; Độc Nhất cấp 100 rơi vào 5.823.203 Bạc ≈ 1065 giờ.

---

## A. Trang bị — tra theo cấp món

Giá sàn của trang bị chỉ phụ thuộc **cấp món + phẩm chất + mức ép**, không phụ thuộc tên món.
Bảng dưới là mức **+0**. Ép rồi thì cộng thêm: +10 thêm 2.308 · +13 thêm 20.328 · +15 thêm 62.067.

| cấp món | bán NPC | Thường | Tốt | Hiếm | Cực Hiếm | Sử Thi | Truyền Thuyết | Độc Nhất |
|---|---|---|---|---|---|---|---|---|
| 8 | 52 | 679 | 1.719 | 4.163 | 10.351 | 18.619 | 33.543 | 60.323 |
| 22 | 262 | 3.409 | 8.649 | 20.963 | 52.141 | 93.799 | 168.993 | 303.923 |
| 36 | 668 | 8.687 | 22.047 | 53.443 | 132.935 | 239.147 | 430.863 | 774.883 |
| 50 | 1.270 | 16.513 | 41.913 | 101.603 | 252.733 | 454.663 | 819.153 | 1.473.203 |
| 66 | 2.198 | 28.577 | 72.537 | 175.843 | 437.405 | 786.887 | 1.417.713 | 2.549.683 |
| 82 | 3.382 | 43.969 | 111.609 | 270.563 | 673.021 | 1.210.759 | 2.181.393 | 3.923.123 |
| 100 | 5.020 | 65.263 | 165.663 | 401.603 | 998.983 | 1.797.163 | 3.237.903 | 5.823.203 |

---

## B. Danh sách trang bị (154 món) — tra cấp rồi xem bảng A

| món | ô | cấp món | bán NPC |
|---|---|---|---|
| Áo Vải Thô | giap | 8 | 52 |
| Bích Ngọc Bội | trangSuc | 8 | 52 |
| Bố Cân | mu | 8 | 52 |
| Giày Vải | giay | 8 | 52 |
| Liễu Diệp Đao | vuKhi | 8 | 52 |
| Lục Trúc Ban Chỉ | nhan | 8 | 52 |
| Mộc Cung | vuKhi | 8 | 52 |
| Thanh Phong Kiếm | vuKhi | 8 | 52 |
| Thiết Phi Tiêu | vuKhi | 8 | 52 |
| Thô Bì Thủ Sáo | gang | 8 | 52 |
| Xích Đồng Thúc Đái | dai | 8 | 52 |
| Bạch Ngọc Giới Chỉ | nhan | 22 | 262 |
| Dương Chi Ngọc Bội | trangSuc | 22 | 262 |
| Hắc Phong Đao | vuKhi | 22 | 262 |
| Lang Ba Lý | giay | 22 | 262 |
| Liễu Diệp Phi Đao | vuKhi | 22 | 262 |
| Lưu Vân Kiếm | vuKhi | 22 | 262 |
| Tế Lân Giáp | giap | 22 | 262 |
| Thanh Trúc Đấu Lạp | mu | 22 | 262 |
| Thanh Xà Linh Đái | dai | 22 | 262 |
| Thiết Cốt Hộ Thủ | gang | 22 | 262 |
| Thiết Tý Cung | vuKhi | 22 | 262 |
| Bá Vương Đao | vuKhi | 36 | 668 |
| Bạch Ngọc Bảo Đái | dai | 36 | 668 |
| Bôn Lôi Cung | vuKhi | 36 | 668 |
| Hổ Bì Chiến Mạo | mu | 36 | 668 |
| Liên Tâm Bội | trangSuc | 36 | 668 |
| Thu Thủy Kiếm | vuKhi | 36 | 668 |
| Tiên Vân Lý | giay | 36 | 668 |
| Toan Nghệ Giáp | giap | 36 | 668 |
| Tử Kim Linh Giới | nhan | 36 | 668 |
| Tụ Lý Càn Khôn | vuKhi | 36 | 668 |
| Xích Đồng Tí Giáp | gang | 36 | 668 |
| Chiến Văn Linh Phù | trangSuc | 50 | 1.270 |
| Đoạt Mệnh Phi Đao | vuKhi | 50 | 1.270 |
| Hắc Long Lân Thủ | gang | 50 | 1.270 |
| Hoàng Long Ban Chỉ | nhan | 50 | 1.270 |
| Huyết Ẩm Đao | vuKhi | 50 | 1.270 |
| La Hán Bảo Quan | mu | 50 | 1.270 |
| Liệt Nhật Cung | vuKhi | 50 | 1.270 |
| Phi Vân Lý | giay | 50 | 1.270 |
| Thanh Hồng Kiếm | vuKhi | 50 | 1.270 |
| Thanh Trúc Cẩm Đái | dai | 50 | 1.270 |
| Vạn Lưu Quy Tông Y | giap | 50 | 1.270 |
| Băng Tâm Linh Thủ | gang | 66 | 2.198 |
| Bích Hải Triều Sinh Bội | trangSuc | 66 | 2.198 |
| Bích Hải Triều Sinh Cung | vuKhi | 66 | 2.198 |
| Cửu Long Kim Quan | mu | 66 | 2.198 |
| Hỏa Long Châu Giới | nhan | 66 | 2.198 |
| Huyền Thiết Chiến Đai | dai | 66 | 2.198 |
| Long Tuyền Đao | vuKhi | 66 | 2.198 |
| Phong Ảnh Hài | giay | 66 | 2.198 |
| Tỏa Tử Giáp | giap | 66 | 2.198 |
| Tử Điện Kiếm | vuKhi | 66 | 2.198 |
| U Minh Tiễn | vuKhi | 66 | 2.198 |
| Bích Ngọc Hoàng Quan | mu | 82 | 3.382 |
| Cuồng Lôi Thần Đao | vuKhi | 82 | 3.382 |
| Cửu Cung Phi Tinh | vuKhi | 82 | 3.382 |
| Cửu Thiên Huyền Cung | vuKhi | 82 | 3.382 |
| Cửu Tiêu Thần Kiếm | vuKhi | 82 | 3.382 |
| Hỏa Diệm Chiến Thủ | gang | 82 | 3.382 |
| Lôi Quang Chiến Ngoa | giay | 82 | 3.382 |
| Long Phượng Song Bội | trangSuc | 82 | 3.382 |
| Lưu Vân Phi Đái | dai | 82 | 3.382 |
| Tử Vi Tinh Hoàn | nhan | 82 | 3.382 |
| Tuyền Long Bào | giap | 82 | 3.382 |
| An Bang Bàn Thạch Uyển | gang | 100 | 5.020 |
| An Bang Định Sơn Đái | dai | 100 | 5.020 |
| An Bang Hộ Linh Bội | trangSuc | 100 | 5.020 |
| An Bang Hộ Quốc Giáp | giap | 100 | 5.020 |
| An Bang Trấn Địa Ngoa | giay | 100 | 5.020 |
| An Bang Trấn Nhạc Quan | mu | 100 | 5.020 |
| An Bang Trấn Tâm Giới | nhan | 100 | 5.020 |
| Bạch Hồng Huyền Quang Bội | trangSuc | 100 | 5.020 |
| Bạch Hồng Lưu Quang Giáp | giap | 100 | 5.020 |
| Bạch Hồng Ngưng Nguyệt Giới | nhan | 100 | 5.020 |
| Bạch Hồng Phá Ảnh Uyển | gang | 100 | 5.020 |
| Bạch Hồng Tỏa Vân Đái | dai | 100 | 5.020 |
| Bạch Hồng Truy Phong Ngoa | giay | 100 | 5.020 |
| Bạch Hồng Xung Tiêu Quan | mu | 100 | 5.020 |
| Càn Khôn Huyền Giới | nhan | 100 | 5.020 |
| Diệt Thế Ma Đao | vuKhi | 100 | 5.020 |
| Định Quốc Đạp Trận Ngoa | giay | 100 | 5.020 |
| Định Quốc Hộ Mệnh Giới | nhan | 100 | 5.020 |
| Định Quốc Huyền Giáp | giap | 100 | 5.020 |
| Định Quốc Long Vân Bội | trangSuc | 100 | 5.020 |
| Định Quốc Thiên Uy Quan | mu | 100 | 5.020 |
| Định Quốc Thiết Hộ Uyển | gang | 100 | 5.020 |
| Định Quốc Trấn Quân Đái | dai | 100 | 5.020 |
| Hồng Ảnh Ám Hành Giáp | giap | 100 | 5.020 |
| Hồng Ảnh Liệt Ngân Uyển | gang | 100 | 5.020 |
| Hồng Ảnh Mê Tung Ngoa | giay | 100 | 5.020 |
| Hồng Ảnh Nhiếp Phách Giới | nhan | 100 | 5.020 |
| Hồng Ảnh Tàn Nguyệt Bội | trangSuc | 100 | 5.020 |
| Hồng Ảnh Tỏa Hồn Đái | dai | 100 | 5.020 |
| Hồng Ảnh Vô Tung Quan | mu | 100 | 5.020 |
| Kim Long Bảo Đái | dai | 100 | 5.020 |
| Kim Quang Bạch Kim Yêu Đái | dai | 100 | 5.020 |
| Kim Quang Dương Nghê Giáp | giap | 100 | 5.020 |
| Kim Quang Ngũ Sắc Ngọc Bội | trangSuc | 100 | 5.020 |
| Kim Quang Nhã Diện Chi Hồn | nhan | 100 | 5.020 |
| Kim Quang Thiền Tằm Hộ Uyển | gang | 100 | 5.020 |
| Kim Quang Thiên Tâm Ngọa | giay | 100 | 5.020 |
| Kim Quang Tiên Phù | trangSuc | 100 | 5.020 |
| Kim Quang Trích Tinh Hoàn | mu | 100 | 5.020 |
| Liên Hoa Đạo Quan | mu | 100 | 5.020 |
| Lôi Đình Thủ Sáo | gang | 100 | 5.020 |
| Minh Vương Đạp Vân Ngoa | giay | 100 | 5.020 |
| Minh Vương Hộ Tâm Giáp | giap | 100 | 5.020 |
| Minh Vương Khải Giáp | giap | 100 | 5.020 |
| Minh Vương Kim Cang Uyển | gang | 100 | 5.020 |
| Minh Vương Tỏa Sơn Đái | dai | 100 | 5.020 |
| Minh Vương Trấn Bất Động Bội | trangSuc | 100 | 5.020 |
| Minh Vương Trấn Hồn Giới | nhan | 100 | 5.020 |
| Minh Vương Trấn Thiên Quan | mu | 100 | 5.020 |
| Nhu Tình Lăng Ba Ngoa | giay | 100 | 5.020 |
| Nhu Tình Liên Tâm Uyển | gang | 100 | 5.020 |
| Nhu Tình Lưu Hoa Quan | mu | 100 | 5.020 |
| Nhu Tình Ngọc Vũ Giáp | giap | 100 | 5.020 |
| Nhu Tình Ngưng Mộng Giới | nhan | 100 | 5.020 |
| Nhu Tình Tâm Nguyệt Bội | trangSuc | 100 | 5.020 |
| Nhu Tình Tỏa Hương Đái | dai | 100 | 5.020 |
| Thanh Hư Huyền Ngọc Bội | trangSuc | 100 | 5.020 |
| Thanh Hư Lăng Vân Quan | mu | 100 | 5.020 |
| Thanh Hư Ngự Phong Giáp | giap | 100 | 5.020 |
| Thanh Hư Ngưng Thần Giới | nhan | 100 | 5.020 |
| Thanh Hư Tỏa Linh Đái | dai | 100 | 5.020 |
| Thanh Hư Trục Vân Ngoa | giay | 100 | 5.020 |
| Thanh Hư Vân Tụ Uyển | gang | 100 | 5.020 |
| Thất Sát Đoạn Mạch Uyển | gang | 100 | 5.020 |
| Thất Sát Đoạt Mệnh Đái | dai | 100 | 5.020 |
| Thất Sát Huyền Minh Giáp | giap | 100 | 5.020 |
| Thất Sát Ngưng Huyết Giới | nhan | 100 | 5.020 |
| Thất Sát Phá Quân Bội | trangSuc | 100 | 5.020 |
| Thất Sát Tham Lang Quan | mu | 100 | 5.020 |
| Thất Sát Truy Ảnh Ngoa | giay | 100 | 5.020 |
| Thiên Hành Thần Lý | giay | 100 | 5.020 |
| Thương Lan Đạp Lãng Ngoa | giay | 100 | 5.020 |
| Thương Lan Hải Tâm Bội | trangSuc | 100 | 5.020 |
| Thương Lan Hàn Nguyệt Giáp | giap | 100 | 5.020 |
| Thương Lan Hoành Giang Đái | dai | 100 | 5.020 |
| Thương Lan Kình Đào Quan | mu | 100 | 5.020 |
| Thương Lan Ngưng Sương Giới | nhan | 100 | 5.020 |
| Thương Lan Phá Lãng Uyển | gang | 100 | 5.020 |
| Tịch Diệt Thần Cung | vuKhi | 100 | 5.020 |
| Trảm Tiên Kiếm | vuKhi | 100 | 5.020 |
| Tử Điện Bôn Lôi Đái | dai | 100 | 5.020 |
| Tử Điện Chấn Đình Quan | mu | 100 | 5.020 |
| Tử Điện Điện Bộ Ngoa | giay | 100 | 5.020 |
| Tử Điện Huyền Lôi Bội | trangSuc | 100 | 5.020 |
| Tử Điện Kinh Lôi Giáp | giap | 100 | 5.020 |
| Tử Điện Liệt Điện Uyển | gang | 100 | 5.020 |
| Tử Điện Ngưng Quang Giới | nhan | 100 | 5.020 |
| Vô Ảnh Thần Châm | vuKhi | 100 | 5.020 |

---

## C. Vật phẩm khác (323 món)

| món | loại | bán NPC | sàn tối thiểu | chênh |
|---|---|---|---|---|
| Thiên Trì Ngư | Cá | 250 | 298 | ×1.2 |
| Hải Giao Ngư | Cá | 175 | 210 | ×1.2 |
| Tinh Diệu Ngư | Cá | 120 | 145 | ×1.2 |
| Vân Lý Ngư | Cá | 88 | 108 | ×1.2 |
| Ốc Tuyền Ngư | Cá | 60 | 75 | ×1.3 |
| Băng Lân Ngư | Cá | 40 | 51 | ×1.3 |
| Tinh Lân Ngư | Cá | 22 | 30 | ×1.4 |
| Lư Ngư | Cá | 11 | 17 | ×1.5 |
| Hương Ngư | Cá | 7 | 12 | ×1.7 |
| Hồi Ngư | Cá | 4 | 9 | ×2.3 |
| Tuyết Ngư | Cá | 2 | 6 | ×3.0 |
| Ngộ Đạo Đan | Đan Dược | 168 | 202 | ×1.2 |
| Bách Bảo Đan | Đan Dược | 156 | 188 | ×1.2 |
| Dưỡng Thú Đan | Đan Dược | 152 | 183 | ×1.2 |
| Cường Nguyên Đan | Đan Dược | 148 | 178 | ×1.2 |
| Hoàn Hồn Đan | Đan Dược | 70 | 86 | ×1.2 |
| Ngộ Đạo Hoàn | Đan Dược | 48 | 60 | ×1.3 |
| Bách Bảo Hoàn | Đan Dược | 46 | 58 | ×1.3 |
| Dưỡng Thú Hoàn | Đan Dược | 44 | 56 | ×1.3 |
| Cường Nguyên Hoàn | Đan Dược | 39 | 50 | ×1.3 |
| Hồi Khí Đan | Đan Dược | 25 | 33 | ×1.3 |
| Tục Mệnh Đan | Đan Dược | 20 | 28 | ×1.4 |
| Quán Khí Đan | Đan Dược | 16 | 23 | ×1.4 |
| Bách Bảo Tán | Đan Dược | 11 | 17 | ×1.5 |
| Ngộ Đạo Tán | Đan Dược | 11 | 17 | ×1.5 |
| Dưỡng Thú Tán | Đan Dược | 10 | 16 | ×1.6 |
| Cường Nguyên Tán | Đan Dược | 9 | 15 | ×1.7 |
| Hoạt Huyết Đan | Đan Dược | 8 | 13 | ×1.6 |
| Tinh Đan · Cửu Phẩm | Đan Điền | 3.240 | 259.203 | ×80.0 |
| Khí Đan · Cửu Phẩm | Đan Điền | 3.240 | 259.203 | ×80.0 |
| Thần Đan · Cửu Phẩm | Đan Điền | 3.240 | 259.203 | ×80.0 |
| Tinh Đan · Bát Phẩm | Đan Điền | 2.560 | 204.803 | ×80.0 |
| Khí Đan · Bát Phẩm | Đan Điền | 2.560 | 204.803 | ×80.0 |
| Thần Đan · Bát Phẩm | Đan Điền | 2.560 | 204.803 | ×80.0 |
| Tinh Đan · Thất Phẩm | Đan Điền | 1.960 | 156.803 | ×80.0 |
| Khí Đan · Thất Phẩm | Đan Điền | 1.960 | 156.803 | ×80.0 |
| Thần Đan · Thất Phẩm | Đan Điền | 1.960 | 156.803 | ×80.0 |
| Tinh Đan · Lục Phẩm | Đan Điền | 1.440 | 115.203 | ×80.0 |
| Khí Đan · Lục Phẩm | Đan Điền | 1.440 | 115.203 | ×80.0 |
| Thần Đan · Lục Phẩm | Đan Điền | 1.440 | 115.203 | ×80.0 |
| Tinh Đan · Ngũ Phẩm | Đan Điền | 1.000 | 1.180 | ×1.2 |
| Khí Đan · Ngũ Phẩm | Đan Điền | 1.000 | 1.180 | ×1.2 |
| Thần Đan · Ngũ Phẩm | Đan Điền | 1.000 | 1.180 | ×1.2 |
| Tinh Đan · Tứ Phẩm | Đan Điền | 640 | 757 | ×1.2 |
| Khí Đan · Tứ Phẩm | Đan Điền | 640 | 757 | ×1.2 |
| Thần Đan · Tứ Phẩm | Đan Điền | 640 | 757 | ×1.2 |
| Tinh Đan · Tam Phẩm | Đan Điền | 360 | 428 | ×1.2 |
| Khí Đan · Tam Phẩm | Đan Điền | 360 | 428 | ×1.2 |
| Thần Đan · Tam Phẩm | Đan Điền | 360 | 428 | ×1.2 |
| Tinh Đan · Nhị Phẩm | Đan Điền | 160 | 192 | ×1.2 |
| Khí Đan · Nhị Phẩm | Đan Điền | 160 | 192 | ×1.2 |
| Thần Đan · Nhị Phẩm | Đan Điền | 160 | 192 | ×1.2 |
| Tinh Đan · Nhất Phẩm | Đan Điền | 40 | 51 | ×1.3 |
| Khí Đan · Nhất Phẩm | Đan Điền | 40 | 51 | ×1.3 |
| Thần Đan · Nhất Phẩm | Đan Điền | 40 | 51 | ×1.3 |
| Thần Tinh Đĩnh | Thỏi Kim Loại | 600 | 710 | ×1.2 |
| San Hô Đĩnh | Thỏi Kim Loại | 420 | 498 | ×1.2 |
| Vẫn Thiết Đĩnh | Thỏi Kim Loại | 290 | 345 | ×1.2 |
| Vân Mẫu Đĩnh | Thỏi Kim Loại | 210 | 251 | ×1.2 |
| Hoàng Kim Đĩnh | Thỏi Kim Loại | 145 | 175 | ×1.2 |
| Hàn Thiết Đĩnh | Thỏi Kim Loại | 95 | 116 | ×1.2 |
| Tinh Thạch Đĩnh | Thỏi Kim Loại | 55 | 69 | ×1.3 |
| Thiết Đĩnh | Thỏi Kim Loại | 28 | 37 | ×1.3 |
| Đồng Đĩnh | Thỏi Kim Loại | 16 | 23 | ×1.4 |
| Tích Đĩnh | Thỏi Kim Loại | 8 | 13 | ×1.6 |
| Đồ Phổ: Minh Vương Khải Giáp | Đồ Phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Kim Long Bảo Đái | Đồ Phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Lôi Đình Thủ Sáo | Đồ Phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Thiên Hành Thần Lý | Đồ Phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Liên Hoa Đạo Quan | Đồ Phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Chiếu Dạ Ngọc Sư Tử | Đồ Phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Càn Khôn Huyền Giới | Đồ Phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Kim Quang Tiên Phù | Đồ Phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Trảm Tiên Kiếm | Đồ Phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Diệt Thế Ma Đao | Đồ Phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Tịch Diệt Thần Cung | Đồ Phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Vô Ảnh Thần Châm | Đồ Phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Khai Thiên Thần Phủ | Đồ Phổ | 1.610 | 8.053 | ×5.0 |
| Đồ Phổ: Quật Địa Thiên Sản | Đồ Phổ | 1.610 | 8.053 | ×5.0 |
| Đồ Phổ: Thôn Hải Thần Can | Đồ Phổ | 1.610 | 8.053 | ×5.0 |
| Đồ Phổ: Thái Ất Kim Liêm | Đồ Phổ | 1.610 | 8.053 | ×5.0 |
| Đồ Phổ: Tuyền Long Bào | Đồ Phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Lưu Vân Phi Đái | Đồ Phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Hỏa Diệm Chiến Thủ | Đồ Phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Lôi Quang Chiến Ngoa | Đồ Phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Bích Ngọc Hoàng Quan | Đồ Phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Phi Vân | Đồ Phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Tử Vi Tinh Hoàn | Đồ Phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Long Phượng Song Bội | Đồ Phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Cửu Tiêu Thần Kiếm | Đồ Phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Cuồng Lôi Thần Đao | Đồ Phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Cửu Thiên Huyền Cung | Đồ Phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Cửu Cung Phi Tinh | Đồ Phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Bàn Cổ Cự Phủ | Đồ Phổ | 1.086 | 5.433 | ×5.0 |
| Đồ Phổ: Phá Nham Thần Quật | Đồ Phổ | 1.086 | 5.433 | ×5.0 |
| Đồ Phổ: Vân Mộng Điếu Can | Đồ Phổ | 1.086 | 5.433 | ×5.0 |
| Đồ Phổ: Thần Nông Liêm | Đồ Phổ | 1.086 | 5.433 | ×5.0 |
| Đồ Phổ: Tỏa Tử Giáp | Đồ Phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Huyền Thiết Chiến Đai | Đồ Phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Băng Tâm Linh Thủ | Đồ Phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Phong Ảnh Hài | Đồ Phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Cửu Long Kim Quan | Đồ Phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Hãn Huyết Bảo Câu | Đồ Phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Hỏa Long Châu Giới | Đồ Phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Bích Hải Triều Sinh Bội | Đồ Phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Tử Điện Kiếm | Đồ Phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Long Tuyền Đao | Đồ Phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Bích Hải Triều Sinh Cung | Đồ Phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: U Minh Tiễn | Đồ Phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Liệt Phong Phủ | Đồ Phổ | 707 | 3.538 | ×5.0 |
| Đồ Phổ: Long Tích Quật | Đồ Phổ | 707 | 3.538 | ×5.0 |
| Đồ Phổ: Long Tu Can | Đồ Phổ | 707 | 3.538 | ×5.0 |
| Đồ Phổ: Lộ Ngưng Liêm | Đồ Phổ | 707 | 3.538 | ×5.0 |
| Đồ Phổ: Vạn Lưu Quy Tông Y | Đồ Phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Thanh Trúc Cẩm Đái | Đồ Phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Hắc Long Lân Thủ | Đồ Phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Phi Vân Lý | Đồ Phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: La Hán Bảo Quan | Đồ Phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Ô Vân Đạp Tuyết | Đồ Phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Hoàng Long Ban Chỉ | Đồ Phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Chiến Văn Linh Phù | Đồ Phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Thanh Hồng Kiếm | Đồ Phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Huyết Ẩm Đao | Đồ Phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Liệt Nhật Cung | Đồ Phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Đoạt Mệnh Phi Đao | Đồ Phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Huyền Thiết Phủ | Đồ Phổ | 410 | 2.053 | ×5.0 |
| Đồ Phổ: Huyền Thiết Quật | Đồ Phổ | 410 | 2.053 | ×5.0 |
| Đồ Phổ: Huyền Tê Điếu Can | Đồ Phổ | 410 | 2.053 | ×5.0 |
| Đồ Phổ: Huyền Thiết Liêm | Đồ Phổ | 410 | 2.053 | ×5.0 |
| Đồ Phổ: Khai Sơn Phủ | Đồ Phổ | 217 | 1.088 | ×5.0 |
| Đồ Phổ: Thấu Địa Sản | Đồ Phổ | 217 | 1.088 | ×5.0 |
| Đồ Phổ: Bích Ba Can | Đồ Phổ | 217 | 1.088 | ×5.0 |
| Đồ Phổ: Bách Thảo Liêm | Đồ Phổ | 217 | 1.088 | ×5.0 |
| Đồ Phổ: Lợi Nhận Phủ | Đồ Phổ | 88 | 443 | ×5.0 |
| Đồ Phổ: Kiên Cương Sản | Đồ Phổ | 88 | 443 | ×5.0 |
| Đồ Phổ: Thanh Lân Can | Đồ Phổ | 88 | 443 | ×5.0 |
| Đồ Phổ: Lợi Nhận Liêm | Đồ Phổ | 88 | 443 | ×5.0 |
| Thần Đàn Mộc | Gỗ | 200 | 239 | ×1.2 |
| Trầm Hải Mộc | Gỗ | 130 | 157 | ×1.2 |
| Tinh Hoa Mộc | Gỗ | 80 | 98 | ×1.2 |
| Phù Vân Mộc | Gỗ | 50 | 63 | ×1.3 |
| Hồng Mộc | Gỗ | 30 | 39 | ×1.3 |
| Hàn Tùng | Gỗ | 22 | 30 | ×1.4 |
| Phong Mộc | Gỗ | 16 | 23 | ×1.4 |
| Bạch Dương Mộc | Gỗ | 9 | 15 | ×1.7 |
| Trúc Mộc | Gỗ | 5 | 10 | ×2.0 |
| Tùng Mộc | Gỗ | 2 | 6 | ×3.0 |
| Tâm Ma Tổ | Chiến Lợi Phẩm | 12.000 | 14.122 | ×1.2 |
| Tinh Cửu Vĩ | Chiến Lợi Phẩm | 5.000 | 5.886 | ×1.2 |
| Hạch Cổ Linh | Chiến Lợi Phẩm | 1.600 | 1.886 | ×1.2 |
| Hài Cốt Cổ Ma | Chiến Lợi Phẩm | 950 | 1.122 | ×1.2 |
| Đồ Phổ: Viêm Đế Phần Thiên | Chiến Lợi Phẩm | 900 | 1.063 | ×1.2 |
| Đồ Phổ: Bắc Minh Đảo Hải | Chiến Lợi Phẩm | 900 | 1.063 | ×1.2 |
| Đồ Phổ: Vạn Mộc Quy Nguyên | Chiến Lợi Phẩm | 900 | 1.063 | ×1.2 |
| Đồ Phổ: Thái A Trảm Thần | Chiến Lợi Phẩm | 900 | 1.063 | ×1.2 |
| Đồ Phổ: Bàn Cổ Trấn Nhạc | Chiến Lợi Phẩm | 900 | 1.063 | ×1.2 |
| Đồ Phổ: Vô Tướng Sát Kiếp | Chiến Lợi Phẩm | 900 | 1.063 | ×1.2 |
| Đồ Phổ: Thiên Nhân Hợp Nhất | Chiến Lợi Phẩm | 900 | 1.063 | ×1.2 |
| Tinh Thể Yêu Vương | Chiến Lợi Phẩm | 800 | 945 | ×1.2 |
| Tinh Thần Thiết | Chiến Lợi Phẩm | 780 | 922 | ×1.2 |
| Hồn Mê Vụ | Chiến Lợi Phẩm | 620 | 733 | ×1.2 |
| Giao Châu | Chiến Lợi Phẩm | 540 | 639 | ×1.2 |
| Tinh Hư Không | Chiến Lợi Phẩm | 430 | 510 | ×1.2 |
| Hổ Phù Đầu Lĩnh | Chiến Lợi Phẩm | 350 | 416 | ×1.2 |
| Tinh Tủy | Chiến Lợi Phẩm | 340 | 404 | ×1.2 |
| Lông Vũ Vân Điểu | Chiến Lợi Phẩm | 290 | 345 | ×1.2 |
| Phấn Phù Quang | Chiến Lợi Phẩm | 240 | 286 | ×1.2 |
| Mật Sa Mãng | Chiến Lợi Phẩm | 200 | 239 | ×1.2 |
| Huyễn Sa | Chiến Lợi Phẩm | 165 | 198 | ×1.2 |
| Hàn Thiết Tinh | Chiến Lợi Phẩm | 130 | 157 | ×1.2 |
| Da Tuyết Lang | Chiến Lợi Phẩm | 95 | 116 | ×1.2 |
| U Minh Thạch | Chiến Lợi Phẩm | 90 | 110 | ×1.2 |
| Linh Phách | Chiến Lợi Phẩm | 70 | 86 | ×1.2 |
| Sa Thủy Tinh | Chiến Lợi Phẩm | 60 | 75 | ×1.3 |
| Túi Bạc Đoạt | Chiến Lợi Phẩm | 45 | 57 | ×1.3 |
| Đuôi Cáo | Chiến Lợi Phẩm | 35 | 45 | ×1.3 |
| Hắc Thiết Phiến | Chiến Lợi Phẩm | 30 | 39 | ×1.3 |
| Chân Gấu | Chiến Lợi Phẩm | 20 | 28 | ×1.4 |
| Nanh Heo Rừng | Chiến Lợi Phẩm | 10 | 16 | ×1.6 |
| Da Sói | Chiến Lợi Phẩm | 6 | 11 | ×1.8 |
| Thần Tinh Khoáng | Khoáng Sản | 270 | 322 | ×1.2 |
| San Hô Khoáng | Khoáng Sản | 190 | 228 | ×1.2 |
| Vẫn Thiết | Khoáng Sản | 130 | 157 | ×1.2 |
| Vân Mẫu Thạch | Khoáng Sản | 95 | 116 | ×1.2 |
| Hoàng Kim Sa | Khoáng Sản | 65 | 80 | ×1.2 |
| Hàn Thiết Khoáng | Khoáng Sản | 42 | 53 | ×1.3 |
| Tinh Thạch Khoáng | Khoáng Sản | 24 | 32 | ×1.3 |
| Thiết Khoáng | Khoáng Sản | 10 | 16 | ×1.6 |
| Thạch Khôi | Khoáng Sản | 8 | 13 | ×1.6 |
| Đồng Khoáng | Khoáng Sản | 6 | 11 | ×1.8 |
| Hắc Thán | Khoáng Sản | 3 | 8 | ×2.7 |
| Tích Khoáng | Khoáng Sản | 3 | 8 | ×2.7 |
| Thiên Câu Nhị | Mồi Câu | 95 | 116 | ×1.2 |
| Giao Long Đản | Mồi Câu | 65 | 80 | ×1.2 |
| Vân Mộng Nhị | Mồi Câu | 32 | 42 | ×1.3 |
| Hàn Tủy Nhị | Mồi Câu | 15 | 22 | ×1.5 |
| Tửu Khúc | Mồi Câu | 8 | 13 | ×1.6 |
| Tép Đồng | Mồi Câu | 3 | 8 | ×2.7 |
| Hồng Trùng | Mồi Câu | 1 | 5 | ×5.0 |
| Thiên Trì Ngư Tần | Món Ăn | 380 | 451 | ×1.2 |
| Hải Giao Ngư Hầm | Món Ăn | 270 | 322 | ×1.2 |
| Tinh Diệu Ngư Nướng | Món Ăn | 185 | 222 | ×1.2 |
| Vân Lý Ngư Tần | Món Ăn | 135 | 163 | ×1.2 |
| Canh Ốc Tuyền Ngư | Món Ăn | 92 | 112 | ×1.2 |
| Băng Lân Ngư Nướng | Món Ăn | 60 | 75 | ×1.3 |
| Tinh Lân Ngư Hấp | Món Ăn | 35 | 45 | ×1.3 |
| Bánh Chưng | Món Ăn | 30 | 39 | ×1.3 |
| Bánh Trôi Ngũ Sắc | Món Ăn | 30 | 39 | ×1.3 |
| Bánh Ú Tro | Món Ăn | 30 | 39 | ×1.3 |
| Cháo Thí Thực | Món Ăn | 30 | 39 | ×1.3 |
| Bánh Trung Thu | Món Ăn | 30 | 39 | ×1.3 |
| Bánh Gừng Mật | Món Ăn | 30 | 39 | ×1.3 |
| Hương Ngư Nướng | Món Ăn | 15 | 22 | ×1.5 |
| Hồi Ngư Nướng | Món Ăn | 9 | 15 | ×1.7 |
| Tuyết Ngư Nướng | Món Ăn | 5 | 10 | ×2.0 |
| Cửu Diệp Linh Chi | Linh Thảo | 140 | 169 | ×1.2 |
| Trầm Vụ Lan | Linh Thảo | 90 | 110 | ×1.2 |
| Thất Tinh Thảo | Linh Thảo | 56 | 70 | ×1.3 |
| Vân Lộ Chi | Linh Thảo | 35 | 45 | ×1.3 |
| Ngọc Tuyền Sâm | Linh Thảo | 21 | 29 | ×1.4 |
| Tuyết Liên Hoa | Linh Thảo | 15 | 22 | ×1.5 |
| Thạch Hộc Lan | Linh Thảo | 11 | 17 | ×1.5 |
| Đương Quy Căn | Linh Thảo | 6 | 11 | ×1.8 |
| Tử Đằng Hoa | Linh Thảo | 4 | 9 | ×2.3 |
| Thanh Ngải Thảo | Linh Thảo | 2 | 6 | ×3.0 |
| Chiếu Dạ Ngọc Sư Tử | Công Cụ | 5.020 | 25.103 | ×5.0 |
| Khai Thiên Thần Phủ | Công Cụ | 4.025 | 20.128 | ×5.0 |
| Quật Địa Thiên Sản | Công Cụ | 4.025 | 20.128 | ×5.0 |
| Thôn Hải Thần Can | Công Cụ | 4.025 | 20.128 | ×5.0 |
| Thái Ất Kim Liêm | Công Cụ | 4.025 | 20.128 | ×5.0 |
| Phi Vân | Công Cụ | 3.382 | 16.913 | ×5.0 |
| Bàn Cổ Cự Phủ | Công Cụ | 2.715 | 13.578 | ×5.0 |
| Phá Nham Thần Quật | Công Cụ | 2.715 | 13.578 | ×5.0 |
| Vân Mộng Điếu Can | Công Cụ | 2.715 | 13.578 | ×5.0 |
| Thần Nông Liêm | Công Cụ | 2.715 | 13.578 | ×5.0 |
| Hãn Huyết Bảo Câu | Công Cụ | 2.198 | 10.993 | ×5.0 |
| Liệt Phong Phủ | Công Cụ | 1.767 | 8.838 | ×5.0 |
| Long Tích Quật | Công Cụ | 1.767 | 8.838 | ×5.0 |
| Long Tu Can | Công Cụ | 1.767 | 8.838 | ×5.0 |
| Lộ Ngưng Liêm | Công Cụ | 1.767 | 8.838 | ×5.0 |
| Ô Vân Đạp Tuyết | Công Cụ | 1.270 | 6.353 | ×5.0 |
| Huyền Thiết Phủ | Công Cụ | 1.025 | 5.128 | ×5.0 |
| Huyền Thiết Quật | Công Cụ | 1.025 | 5.128 | ×5.0 |
| Huyền Tê Điếu Can | Công Cụ | 1.025 | 5.128 | ×5.0 |
| Huyền Thiết Liêm | Công Cụ | 1.025 | 5.128 | ×5.0 |
| Dịch Lư | Công Cụ | 668 | 3.343 | ×5.0 |
| Khai Sơn Phủ | Công Cụ | 543 | 2.718 | ×5.0 |
| Thấu Địa Sản | Công Cụ | 543 | 2.718 | ×5.0 |
| Bích Ba Can | Công Cụ | 543 | 2.718 | ×5.0 |
| Bách Thảo Liêm | Công Cụ | 543 | 2.718 | ×5.0 |
| Đại Uyển Lương Câu | Công Cụ | 262 | 1.313 | ×5.0 |
| Lợi Nhận Phủ | Công Cụ | 219 | 1.098 | ×5.0 |
| Kiên Cương Sản | Công Cụ | 219 | 1.098 | ×5.0 |
| Thanh Lân Can | Công Cụ | 219 | 1.098 | ×5.0 |
| Lợi Nhận Liêm | Công Cụ | 219 | 1.098 | ×5.0 |
| Kiếm Sắt | Trang Bị | 120 | 145 | ×1.2 |
| Giáp Thiếc | Trang Bị | 60 | 75 | ×1.3 |
| Thanh Tông Mã | Công Cụ | 52 | 263 | ×5.1 |
| Thiết Phủ | Công Cụ | 51 | 258 | ×5.1 |
| Thiết Sản | Công Cụ | 51 | 258 | ×5.1 |
| Trúc Điếu Can | Công Cụ | 51 | 258 | ×5.1 |
| Thiết Liêm | Công Cụ | 51 | 258 | ×5.1 |
| Cuốc Thiếc | Công Cụ | 40 | 203 | ×5.1 |
| Bạch Hổ Noãn · Truyền Thuyết | Trứng Linh Thú | 1.400 | 7.003 | ×5.0 |
| Huyền Quy Noãn · Truyền Thuyết | Trứng Linh Thú | 1.400 | 7.003 | ×5.0 |
| Huyết Lang Noãn · Truyền Thuyết | Trứng Linh Thú | 1.400 | 7.003 | ×5.0 |
| Cự Hùng Noãn · Truyền Thuyết | Trứng Linh Thú | 1.400 | 7.003 | ×5.0 |
| Độc Giao Noãn · Truyền Thuyết | Trứng Linh Thú | 1.400 | 7.003 | ×5.0 |
| Lôi Bằng Noãn · Truyền Thuyết | Trứng Linh Thú | 1.400 | 7.003 | ×5.0 |
| Hỏa Lân Noãn · Truyền Thuyết | Trứng Linh Thú | 1.400 | 7.003 | ×5.0 |
| Hồ Yêu Noãn · Truyền Thuyết | Trứng Linh Thú | 1.400 | 7.003 | ×5.0 |
| Băng Phượng Noãn · Truyền Thuyết | Trứng Linh Thú | 1.400 | 7.003 | ×5.0 |
| Thiên Ma Noãn · Truyền Thuyết | Trứng Linh Thú | 1.400 | 7.003 | ×5.0 |
| Bạch Hổ Noãn · Hiếm | Trứng Linh Thú | 450 | 2.253 | ×5.0 |
| Huyền Quy Noãn · Hiếm | Trứng Linh Thú | 450 | 2.253 | ×5.0 |
| Huyết Lang Noãn · Hiếm | Trứng Linh Thú | 450 | 2.253 | ×5.0 |
| Cự Hùng Noãn · Hiếm | Trứng Linh Thú | 450 | 2.253 | ×5.0 |
| Độc Giao Noãn · Hiếm | Trứng Linh Thú | 450 | 2.253 | ×5.0 |
| Lôi Bằng Noãn · Hiếm | Trứng Linh Thú | 450 | 2.253 | ×5.0 |
| Hỏa Lân Noãn · Hiếm | Trứng Linh Thú | 450 | 2.253 | ×5.0 |
| Hồ Yêu Noãn · Hiếm | Trứng Linh Thú | 450 | 2.253 | ×5.0 |
| Băng Phượng Noãn · Hiếm | Trứng Linh Thú | 450 | 2.253 | ×5.0 |
| Thiên Ma Noãn · Hiếm | Trứng Linh Thú | 450 | 2.253 | ×5.0 |
| Kim Đồng Ngư Noãn · Hiếm | Trứng Linh Thú | 450 | 2.253 | ×5.0 |
| Thải Vũ Điệp Noãn · Hiếm | Trứng Linh Thú | 450 | 2.253 | ×5.0 |
| Xích Diễm Long Câu Noãn · Hiếm | Trứng Linh Thú | 450 | 2.253 | ×5.0 |
| U Minh Miêu Noãn · Hiếm | Trứng Linh Thú | 450 | 2.253 | ×5.0 |
| Ngọc Thố Noãn · Hiếm | Trứng Linh Thú | 450 | 2.253 | ×5.0 |
| Bạch Lộc Noãn · Hiếm | Trứng Linh Thú | 450 | 2.253 | ×5.0 |
| Bạch Hổ Noãn · Thường | Trứng Linh Thú | 120 | 603 | ×5.0 |
| Huyền Quy Noãn · Thường | Trứng Linh Thú | 120 | 603 | ×5.0 |
| Huyết Lang Noãn · Thường | Trứng Linh Thú | 120 | 603 | ×5.0 |
| Cự Hùng Noãn · Thường | Trứng Linh Thú | 120 | 603 | ×5.0 |
| Độc Giao Noãn · Thường | Trứng Linh Thú | 120 | 603 | ×5.0 |
| Lôi Bằng Noãn · Thường | Trứng Linh Thú | 120 | 603 | ×5.0 |
| Hỏa Lân Noãn · Thường | Trứng Linh Thú | 120 | 603 | ×5.0 |
| Hồ Yêu Noãn · Thường | Trứng Linh Thú | 120 | 603 | ×5.0 |
| Băng Phượng Noãn · Thường | Trứng Linh Thú | 120 | 603 | ×5.0 |
| Thiên Ma Noãn · Thường | Trứng Linh Thú | 120 | 603 | ×5.0 |
| Kim Tất Trụ | Vật Liệu | 260 | 310 | ×1.2 |
| Đá Cường Hóa Cao | Vật Liệu | 260 | 310 | ×1.2 |
| Hàn Ngọc Chuyên | Vật Liệu | 140 | 169 | ×1.2 |
| Thôi Vận Thạch Thượng Phẩm | Vật Liệu | 128 | 155 | ×1.2 |
| Tinh Thạch Song | Vật Liệu | 120 | 145 | ×1.2 |
| Bội Sản Thạch Thượng Phẩm | Vật Liệu | 110 | 133 | ×1.2 |
| Đá Cường Hóa Trung | Vật Liệu | 95 | 116 | ×1.2 |
| Tụ Khí Thạch Thượng Phẩm | Vật Liệu | 92 | 112 | ×1.2 |
| Thôi Vận Thạch Trung Phẩm | Vật Liệu | 50 | 63 | ×1.3 |
| Linh Thạch Khoáng Phu | Vật Liệu | 50 | 63 | ×1.3 |
| Bội Sản Thạch Trung Phẩm | Vật Liệu | 45 | 57 | ×1.3 |
| Khớp Sắt | Vật Liệu | 40 | 51 | ×1.3 |
| Tụ Khí Thạch Trung Phẩm | Vật Liệu | 40 | 51 | ×1.3 |
| Lương Mộc | Vật Liệu | 40 | 51 | ×1.3 |
| Thạch Chuyên | Vật Liệu | 32 | 42 | ×1.3 |
| Đá Cường Hóa Sơ | Vật Liệu | 30 | 39 | ×1.3 |
| Gạch | Vật Liệu | 18 | 25 | ×1.4 |
| Thanh Ngõa | Vật Liệu | 15 | 22 | ×1.5 |
| Thôi Vận Thạch Sơ Phẩm | Vật Liệu | 12 | 18 | ×1.5 |
| Ván Gỗ | Vật Liệu | 10 | 16 | ×1.6 |
| Bội Sản Thạch Sơ Phẩm | Vật Liệu | 10 | 16 | ×1.6 |
| Tụ Khí Thạch Sơ Phẩm | Vật Liệu | 9 | 15 | ×1.7 |
| Đất Sét | Vật Liệu | 2 | 6 | ×3.0 |
| Cát | Vật Liệu | 2 | 6 | ×3.0 |
