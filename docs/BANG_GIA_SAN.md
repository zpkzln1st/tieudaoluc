# Bảng Giá — bán cho Thương Nhân vs treo Sàn

> MÁY SINH bởi `_mockup/_covua_wip/_sinh_bang_gia.mjs`. Đừng sửa tay — sửa luật giá ở tệp đó rồi sinh lại.

**Luật giá sàn**

| nhóm | giá sàn |
|---|---|
| Trang bị | `giá NPC × hệ số phẩm + chi phí ép + 3` |
| Công cụ · Đồ phổ · Trứng pet | `giá NPC × 5 + 3` |
| Liệu khai thác và mọi thứ còn lại | `giá NPC + 3` |

Chênh lệch 3 Bạc là để giá sàn không bao giờ bằng giá NPC — bằng nhau thì không ai lên sàn.
Tiền làm tròn LÊN.

Hệ số phẩm: Thường ×13 · Tốt ×33 · Hiếm ×80 · Cực Hiếm ×199 · Sử Thi ×358 · Truyền Thuyết ×645 · Độc Nhất ×1160

Bốn bậc đầu suy từ tỉ lệ rơi thật (`MONSTER_QUALITY_W` 60/25/10/5). Ba bậc trên không rơi từ quái thường nên là ngoại suy, neo vào mốc ~300 giờ cày cho món Độc Nhất cấp 100.

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

## C. Vật phẩm khác (284 món)

| món | loại | bán NPC | sàn tối thiểu | chênh |
|---|---|---|---|---|
| Thiên Trì Ngư | Cá | 250 | 253 | ×1.0 |
| Hải Giao Ngư | Cá | 175 | 178 | ×1.0 |
| Tinh Diệu Ngư | Cá | 120 | 123 | ×1.0 |
| Vân Lý Ngư | Cá | 88 | 91 | ×1.0 |
| Ốc Tuyền Ngư | Cá | 60 | 63 | ×1.1 |
| Băng Lân Ngư | Cá | 40 | 43 | ×1.1 |
| Tinh Lân Ngư | Cá | 22 | 25 | ×1.1 |
| Lư Ngư | Cá | 11 | 14 | ×1.3 |
| Hương Ngư | Cá | 7 | 10 | ×1.4 |
| Hồi Ngư | Cá | 4 | 7 | ×1.8 |
| Tuyết Ngư | Cá | 2 | 5 | ×2.5 |
| Ngộ Đạo Đan | Đan | 168 | 171 | ×1.0 |
| Bách Bảo Đan | Đan | 156 | 159 | ×1.0 |
| Dưỡng Thú Đan | Đan | 152 | 155 | ×1.0 |
| Cường Nguyên Đan | Đan | 148 | 151 | ×1.0 |
| Hoàn Hồn Đan | Đan | 70 | 73 | ×1.0 |
| Ngộ Đạo Hoàn | Đan | 48 | 51 | ×1.1 |
| Bách Bảo Hoàn | Đan | 46 | 49 | ×1.1 |
| Dưỡng Thú Hoàn | Đan | 44 | 47 | ×1.1 |
| Cường Nguyên Hoàn | Đan | 39 | 42 | ×1.1 |
| Hồi Khí Đan | Đan | 25 | 28 | ×1.1 |
| Tục Mệnh Đan | Đan | 20 | 23 | ×1.1 |
| Quán Khí Đan | Đan | 16 | 19 | ×1.2 |
| Bách Bảo Tán | Đan | 11 | 14 | ×1.3 |
| Ngộ Đạo Tán | Đan | 11 | 14 | ×1.3 |
| Dưỡng Thú Tán | Đan | 10 | 13 | ×1.3 |
| Cường Nguyên Tán | Đan | 9 | 12 | ×1.3 |
| Hoạt Huyết Đan | Đan | 8 | 11 | ×1.4 |
| Thần Tinh Đĩnh | Đỉnh | 600 | 603 | ×1.0 |
| San Hô Đĩnh | Đỉnh | 420 | 423 | ×1.0 |
| Vẫn Thiết Đĩnh | Đỉnh | 290 | 293 | ×1.0 |
| Vân Mẫu Đĩnh | Đỉnh | 210 | 213 | ×1.0 |
| Hoàng Kim Đĩnh | Đỉnh | 145 | 148 | ×1.0 |
| Hàn Thiết Đĩnh | Đỉnh | 95 | 98 | ×1.0 |
| Tinh Thạch Đĩnh | Đỉnh | 55 | 58 | ×1.1 |
| Thiết Đĩnh | Đỉnh | 28 | 31 | ×1.1 |
| Đồng Đĩnh | Đỉnh | 16 | 19 | ×1.2 |
| Tích Đĩnh | Đỉnh | 8 | 11 | ×1.4 |
| Đồ Phổ: Minh Vương Khải Giáp | Đồ phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Kim Long Bảo Đái | Đồ phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Lôi Đình Thủ Sáo | Đồ phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Thiên Hành Thần Lý | Đồ phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Liên Hoa Đạo Quan | Đồ phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Chiếu Dạ Ngọc Sư Tử | Đồ phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Càn Khôn Huyền Giới | Đồ phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Kim Quang Tiên Phù | Đồ phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Trảm Tiên Kiếm | Đồ phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Diệt Thế Ma Đao | Đồ phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Tịch Diệt Thần Cung | Đồ phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Vô Ảnh Thần Châm | Đồ phổ | 2.008 | 10.043 | ×5.0 |
| Đồ Phổ: Khai Thiên Thần Phủ | Đồ phổ | 1.610 | 8.053 | ×5.0 |
| Đồ Phổ: Quật Địa Thiên Sản | Đồ phổ | 1.610 | 8.053 | ×5.0 |
| Đồ Phổ: Thôn Hải Thần Can | Đồ phổ | 1.610 | 8.053 | ×5.0 |
| Đồ Phổ: Thái Ất Kim Liêm | Đồ phổ | 1.610 | 8.053 | ×5.0 |
| Đồ Phổ: Tuyền Long Bào | Đồ phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Lưu Vân Phi Đái | Đồ phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Hỏa Diệm Chiến Thủ | Đồ phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Lôi Quang Chiến Ngoa | Đồ phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Bích Ngọc Hoàng Quan | Đồ phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Phi Vân | Đồ phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Tử Vi Tinh Hoàn | Đồ phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Long Phượng Song Bội | Đồ phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Cửu Tiêu Thần Kiếm | Đồ phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Cuồng Lôi Thần Đao | Đồ phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Cửu Thiên Huyền Cung | Đồ phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Cửu Cung Phi Tinh | Đồ phổ | 1.353 | 6.768 | ×5.0 |
| Đồ Phổ: Bàn Cổ Cự Phủ | Đồ phổ | 1.086 | 5.433 | ×5.0 |
| Đồ Phổ: Phá Nham Thần Quật | Đồ phổ | 1.086 | 5.433 | ×5.0 |
| Đồ Phổ: Vân Mộng Điếu Can | Đồ phổ | 1.086 | 5.433 | ×5.0 |
| Đồ Phổ: Thần Nông Liêm | Đồ phổ | 1.086 | 5.433 | ×5.0 |
| Đồ Phổ: Tỏa Tử Giáp | Đồ phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Huyền Thiết Chiến Đai | Đồ phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Băng Tâm Linh Thủ | Đồ phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Phong Ảnh Hài | Đồ phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Cửu Long Kim Quan | Đồ phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Hãn Huyết Bảo Câu | Đồ phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Hỏa Long Châu Giới | Đồ phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Bích Hải Triều Sinh Bội | Đồ phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Tử Điện Kiếm | Đồ phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Long Tuyền Đao | Đồ phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Bích Hải Triều Sinh Cung | Đồ phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: U Minh Tiễn | Đồ phổ | 879 | 4.398 | ×5.0 |
| Đồ Phổ: Liệt Phong Phủ | Đồ phổ | 707 | 3.538 | ×5.0 |
| Đồ Phổ: Long Tích Quật | Đồ phổ | 707 | 3.538 | ×5.0 |
| Đồ Phổ: Long Tu Can | Đồ phổ | 707 | 3.538 | ×5.0 |
| Đồ Phổ: Lộ Ngưng Liêm | Đồ phổ | 707 | 3.538 | ×5.0 |
| Đồ Phổ: Vạn Lưu Quy Tông Y | Đồ phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Thanh Trúc Cẩm Đái | Đồ phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Hắc Long Lân Thủ | Đồ phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Phi Vân Lý | Đồ phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: La Hán Bảo Quan | Đồ phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Ô Vân Đạp Tuyết | Đồ phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Hoàng Long Ban Chỉ | Đồ phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Chiến Văn Linh Phù | Đồ phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Thanh Hồng Kiếm | Đồ phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Huyết Ẩm Đao | Đồ phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Liệt Nhật Cung | Đồ phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Đoạt Mệnh Phi Đao | Đồ phổ | 508 | 2.543 | ×5.0 |
| Đồ Phổ: Huyền Thiết Phủ | Đồ phổ | 410 | 2.053 | ×5.0 |
| Đồ Phổ: Huyền Thiết Quật | Đồ phổ | 410 | 2.053 | ×5.0 |
| Đồ Phổ: Huyền Tê Điếu Can | Đồ phổ | 410 | 2.053 | ×5.0 |
| Đồ Phổ: Huyền Thiết Liêm | Đồ phổ | 410 | 2.053 | ×5.0 |
| Đồ Phổ: Khai Sơn Phủ | Đồ phổ | 217 | 1.088 | ×5.0 |
| Đồ Phổ: Thấu Địa Sản | Đồ phổ | 217 | 1.088 | ×5.0 |
| Đồ Phổ: Bích Ba Can | Đồ phổ | 217 | 1.088 | ×5.0 |
| Đồ Phổ: Bách Thảo Liêm | Đồ phổ | 217 | 1.088 | ×5.0 |
| Đồ Phổ: Lợi Nhận Phủ | Đồ phổ | 88 | 443 | ×5.0 |
| Đồ Phổ: Kiên Cương Sản | Đồ phổ | 88 | 443 | ×5.0 |
| Đồ Phổ: Thanh Lân Can | Đồ phổ | 88 | 443 | ×5.0 |
| Đồ Phổ: Lợi Nhận Liêm | Đồ phổ | 88 | 443 | ×5.0 |
| Thần Đàn Mộc | Gỗ | 200 | 203 | ×1.0 |
| Trầm Hải Mộc | Gỗ | 130 | 133 | ×1.0 |
| Tinh Hoa Mộc | Gỗ | 80 | 83 | ×1.0 |
| Phù Vân Mộc | Gỗ | 50 | 53 | ×1.1 |
| Hồng Mộc | Gỗ | 30 | 33 | ×1.1 |
| Hàn Tùng | Gỗ | 22 | 25 | ×1.1 |
| Phong Mộc | Gỗ | 16 | 19 | ×1.2 |
| Bạch Dương Mộc | Gỗ | 9 | 12 | ×1.3 |
| Trúc Mộc | Gỗ | 5 | 8 | ×1.6 |
| Tùng Mộc | Gỗ | 2 | 5 | ×2.5 |
| Tâm Ma Tổ | Khác | 12.000 | 12.003 | ×1.0 |
| Tinh Cửu Vĩ | Khác | 5.000 | 5.003 | ×1.0 |
| Hạch Cổ Linh | Khác | 1.600 | 1.603 | ×1.0 |
| Hài Cốt Cổ Ma | Khác | 950 | 953 | ×1.0 |
| Đồ Phổ: Viêm Đế Phần Thiên | Khác | 900 | 903 | ×1.0 |
| Đồ Phổ: Bắc Minh Đảo Hải | Khác | 900 | 903 | ×1.0 |
| Đồ Phổ: Vạn Mộc Quy Nguyên | Khác | 900 | 903 | ×1.0 |
| Đồ Phổ: Thái A Trảm Thần | Khác | 900 | 903 | ×1.0 |
| Đồ Phổ: Bàn Cổ Trấn Nhạc | Khác | 900 | 903 | ×1.0 |
| Đồ Phổ: Vô Tướng Sát Kiếp | Khác | 900 | 903 | ×1.0 |
| Đồ Phổ: Thiên Nhân Hợp Nhất | Khác | 900 | 903 | ×1.0 |
| Tinh Thể Yêu Vương | Khác | 800 | 803 | ×1.0 |
| Tinh Thần Thiết | Khác | 780 | 783 | ×1.0 |
| Hồn Mê Vụ | Khác | 620 | 623 | ×1.0 |
| Giao Châu | Khác | 540 | 543 | ×1.0 |
| Tinh Hư Không | Khác | 430 | 433 | ×1.0 |
| Hổ Phù Đầu Lĩnh | Khác | 350 | 353 | ×1.0 |
| Tinh Tủy | Khác | 340 | 343 | ×1.0 |
| Lông Vũ Vân Điểu | Khác | 290 | 293 | ×1.0 |
| Phấn Phù Quang | Khác | 240 | 243 | ×1.0 |
| Mật Sa Mãng | Khác | 200 | 203 | ×1.0 |
| Huyễn Sa | Khác | 165 | 168 | ×1.0 |
| Hàn Thiết Tinh | Khác | 130 | 133 | ×1.0 |
| Da Tuyết Lang | Khác | 95 | 98 | ×1.0 |
| U Minh Thạch | Khác | 90 | 93 | ×1.0 |
| Linh Phách | Khác | 70 | 73 | ×1.0 |
| Sa Thủy Tinh | Khác | 60 | 63 | ×1.1 |
| Túi Bạc Đoạt | Khác | 45 | 48 | ×1.1 |
| Đuôi Cáo | Khác | 35 | 38 | ×1.1 |
| Hắc Thiết Phiến | Khác | 30 | 33 | ×1.1 |
| Chân Gấu | Khác | 20 | 23 | ×1.1 |
| Nanh Heo Rừng | Khác | 10 | 13 | ×1.3 |
| Da Sói | Khác | 6 | 9 | ×1.5 |
| Thần Tinh Khoáng | Khoáng | 270 | 273 | ×1.0 |
| San Hô Khoáng | Khoáng | 190 | 193 | ×1.0 |
| Vẫn Thiết | Khoáng | 130 | 133 | ×1.0 |
| Vân Mẫu Thạch | Khoáng | 95 | 98 | ×1.0 |
| Hoàng Kim Sa | Khoáng | 65 | 68 | ×1.0 |
| Hàn Thiết Khoáng | Khoáng | 42 | 45 | ×1.1 |
| Tinh Thạch Khoáng | Khoáng | 24 | 27 | ×1.1 |
| Thiết Khoáng | Khoáng | 10 | 13 | ×1.3 |
| Thạch Khôi | Khoáng | 8 | 11 | ×1.4 |
| Đồng Khoáng | Khoáng | 6 | 9 | ×1.5 |
| Hắc Thán | Khoáng | 3 | 6 | ×2.0 |
| Tích Khoáng | Khoáng | 3 | 6 | ×2.0 |
| Thiên Câu Nhị | Mồi | 95 | 98 | ×1.0 |
| Giao Long Đản | Mồi | 65 | 68 | ×1.0 |
| Vân Mộng Nhị | Mồi | 32 | 35 | ×1.1 |
| Hàn Tủy Nhị | Mồi | 15 | 18 | ×1.2 |
| Tửu Khúc | Mồi | 8 | 11 | ×1.4 |
| Tép Đồng | Mồi | 3 | 6 | ×2.0 |
| Hồng Trùng | Mồi | 1 | 4 | ×4.0 |
| Thiên Trì Ngư Tần | Món ăn | 380 | 383 | ×1.0 |
| Hải Giao Ngư Hầm | Món ăn | 270 | 273 | ×1.0 |
| Tinh Diệu Ngư Nướng | Món ăn | 185 | 188 | ×1.0 |
| Vân Lý Ngư Tần | Món ăn | 135 | 138 | ×1.0 |
| Canh Ốc Tuyền Ngư | Món ăn | 92 | 95 | ×1.0 |
| Băng Lân Ngư Nướng | Món ăn | 60 | 63 | ×1.1 |
| Tinh Lân Ngư Hấp | Món ăn | 35 | 38 | ×1.1 |
| Hương Ngư Nướng | Món ăn | 15 | 18 | ×1.2 |
| Hồi Ngư Nướng | Món ăn | 9 | 12 | ×1.3 |
| Tuyết Ngư Nướng | Món ăn | 5 | 8 | ×1.6 |
| Cửu Diệp Linh Chi | Thảo dược | 140 | 143 | ×1.0 |
| Trầm Vụ Lan | Thảo dược | 90 | 93 | ×1.0 |
| Thất Tinh Thảo | Thảo dược | 56 | 59 | ×1.1 |
| Vân Lộ Chi | Thảo dược | 35 | 38 | ×1.1 |
| Ngọc Tuyền Sâm | Thảo dược | 21 | 24 | ×1.1 |
| Tuyết Liên Hoa | Thảo dược | 15 | 18 | ×1.2 |
| Thạch Hộc Lan | Thảo dược | 11 | 14 | ×1.3 |
| Đương Quy Căn | Thảo dược | 6 | 9 | ×1.5 |
| Tử Đằng Hoa | Thảo dược | 4 | 7 | ×1.8 |
| Thanh Ngải Thảo | Thảo dược | 2 | 5 | ×2.5 |
| Chiếu Dạ Ngọc Sư Tử | Công cụ | 5.020 | 25.103 | ×5.0 |
| Khai Thiên Thần Phủ | Công cụ | 4.025 | 20.128 | ×5.0 |
| Quật Địa Thiên Sản | Công cụ | 4.025 | 20.128 | ×5.0 |
| Thôn Hải Thần Can | Công cụ | 4.025 | 20.128 | ×5.0 |
| Thái Ất Kim Liêm | Công cụ | 4.025 | 20.128 | ×5.0 |
| Phi Vân | Công cụ | 3.382 | 16.913 | ×5.0 |
| Bàn Cổ Cự Phủ | Công cụ | 2.715 | 13.578 | ×5.0 |
| Phá Nham Thần Quật | Công cụ | 2.715 | 13.578 | ×5.0 |
| Vân Mộng Điếu Can | Công cụ | 2.715 | 13.578 | ×5.0 |
| Thần Nông Liêm | Công cụ | 2.715 | 13.578 | ×5.0 |
| Hãn Huyết Bảo Câu | Công cụ | 2.198 | 10.993 | ×5.0 |
| Liệt Phong Phủ | Công cụ | 1.767 | 8.838 | ×5.0 |
| Long Tích Quật | Công cụ | 1.767 | 8.838 | ×5.0 |
| Long Tu Can | Công cụ | 1.767 | 8.838 | ×5.0 |
| Lộ Ngưng Liêm | Công cụ | 1.767 | 8.838 | ×5.0 |
| Ô Vân Đạp Tuyết | Công cụ | 1.270 | 6.353 | ×5.0 |
| Huyền Thiết Phủ | Công cụ | 1.025 | 5.128 | ×5.0 |
| Huyền Thiết Quật | Công cụ | 1.025 | 5.128 | ×5.0 |
| Huyền Tê Điếu Can | Công cụ | 1.025 | 5.128 | ×5.0 |
| Huyền Thiết Liêm | Công cụ | 1.025 | 5.128 | ×5.0 |
| Dịch Lư | Công cụ | 668 | 3.343 | ×5.0 |
| Khai Sơn Phủ | Công cụ | 543 | 2.718 | ×5.0 |
| Thấu Địa Sản | Công cụ | 543 | 2.718 | ×5.0 |
| Bích Ba Can | Công cụ | 543 | 2.718 | ×5.0 |
| Bách Thảo Liêm | Công cụ | 543 | 2.718 | ×5.0 |
| Đại Uyển Lương Câu | Công cụ | 262 | 1.313 | ×5.0 |
| Lợi Nhận Phủ | Công cụ | 219 | 1.098 | ×5.0 |
| Kiên Cương Sản | Công cụ | 219 | 1.098 | ×5.0 |
| Thanh Lân Can | Công cụ | 219 | 1.098 | ×5.0 |
| Lợi Nhận Liêm | Công cụ | 219 | 1.098 | ×5.0 |
| Kiếm Sắt | Công cụ | 120 | 123 | ×1.0 |
| Giáp Thiếc | Công cụ | 60 | 63 | ×1.1 |
| Thanh Tông Mã | Công cụ | 52 | 263 | ×5.1 |
| Thiết Phủ | Công cụ | 51 | 258 | ×5.1 |
| Thiết Sản | Công cụ | 51 | 258 | ×5.1 |
| Trúc Điếu Can | Công cụ | 51 | 258 | ×5.1 |
| Thiết Liêm | Công cụ | 51 | 258 | ×5.1 |
| Cuốc Thiếc | Công cụ | 40 | 203 | ×5.1 |
| Bạch Hổ Noãn · Truyền Thuyết | Trứng pet | 1.400 | 7.003 | ×5.0 |
| Huyền Quy Noãn · Truyền Thuyết | Trứng pet | 1.400 | 7.003 | ×5.0 |
| Huyết Lang Noãn · Truyền Thuyết | Trứng pet | 1.400 | 7.003 | ×5.0 |
| Cự Hùng Noãn · Truyền Thuyết | Trứng pet | 1.400 | 7.003 | ×5.0 |
| Độc Giao Noãn · Truyền Thuyết | Trứng pet | 1.400 | 7.003 | ×5.0 |
| Lôi Bằng Noãn · Truyền Thuyết | Trứng pet | 1.400 | 7.003 | ×5.0 |
| Hỏa Lân Noãn · Truyền Thuyết | Trứng pet | 1.400 | 7.003 | ×5.0 |
| Hồ Yêu Noãn · Truyền Thuyết | Trứng pet | 1.400 | 7.003 | ×5.0 |
| Băng Phượng Noãn · Truyền Thuyết | Trứng pet | 1.400 | 7.003 | ×5.0 |
| Thiên Ma Noãn · Truyền Thuyết | Trứng pet | 1.400 | 7.003 | ×5.0 |
| Bạch Hổ Noãn · Hiếm | Trứng pet | 450 | 2.253 | ×5.0 |
| Huyền Quy Noãn · Hiếm | Trứng pet | 450 | 2.253 | ×5.0 |
| Huyết Lang Noãn · Hiếm | Trứng pet | 450 | 2.253 | ×5.0 |
| Cự Hùng Noãn · Hiếm | Trứng pet | 450 | 2.253 | ×5.0 |
| Độc Giao Noãn · Hiếm | Trứng pet | 450 | 2.253 | ×5.0 |
| Lôi Bằng Noãn · Hiếm | Trứng pet | 450 | 2.253 | ×5.0 |
| Hỏa Lân Noãn · Hiếm | Trứng pet | 450 | 2.253 | ×5.0 |
| Hồ Yêu Noãn · Hiếm | Trứng pet | 450 | 2.253 | ×5.0 |
| Băng Phượng Noãn · Hiếm | Trứng pet | 450 | 2.253 | ×5.0 |
| Thiên Ma Noãn · Hiếm | Trứng pet | 450 | 2.253 | ×5.0 |
| Bạch Hổ Noãn · Thường | Trứng pet | 120 | 603 | ×5.0 |
| Huyền Quy Noãn · Thường | Trứng pet | 120 | 603 | ×5.0 |
| Huyết Lang Noãn · Thường | Trứng pet | 120 | 603 | ×5.0 |
| Cự Hùng Noãn · Thường | Trứng pet | 120 | 603 | ×5.0 |
| Độc Giao Noãn · Thường | Trứng pet | 120 | 603 | ×5.0 |
| Lôi Bằng Noãn · Thường | Trứng pet | 120 | 603 | ×5.0 |
| Hỏa Lân Noãn · Thường | Trứng pet | 120 | 603 | ×5.0 |
| Hồ Yêu Noãn · Thường | Trứng pet | 120 | 603 | ×5.0 |
| Băng Phượng Noãn · Thường | Trứng pet | 120 | 603 | ×5.0 |
| Thiên Ma Noãn · Thường | Trứng pet | 120 | 603 | ×5.0 |
| Kim Tất Trụ | Vật liệu | 260 | 263 | ×1.0 |
| Đá Cường Hóa Cao | Vật liệu | 260 | 263 | ×1.0 |
| Hàn Ngọc Chuyên | Vật liệu | 140 | 143 | ×1.0 |
| Thôi Vận Thạch Thượng Phẩm | Vật liệu | 128 | 131 | ×1.0 |
| Tinh Thạch Song | Vật liệu | 120 | 123 | ×1.0 |
| Bội Sản Thạch Thượng Phẩm | Vật liệu | 110 | 113 | ×1.0 |
| Đá Cường Hóa Trung | Vật liệu | 95 | 98 | ×1.0 |
| Tụ Khí Thạch Thượng Phẩm | Vật liệu | 92 | 95 | ×1.0 |
| Thôi Vận Thạch Trung Phẩm | Vật liệu | 50 | 53 | ×1.1 |
| Linh Thạch Khoáng Phu | Vật liệu | 50 | 53 | ×1.1 |
| Bội Sản Thạch Trung Phẩm | Vật liệu | 45 | 48 | ×1.1 |
| Khớp Sắt | Vật liệu | 40 | 43 | ×1.1 |
| Tụ Khí Thạch Trung Phẩm | Vật liệu | 40 | 43 | ×1.1 |
| Lương Mộc | Vật liệu | 40 | 43 | ×1.1 |
| Thạch Chuyên | Vật liệu | 32 | 35 | ×1.1 |
| Đá Cường Hóa Sơ | Vật liệu | 30 | 33 | ×1.1 |
| Gạch | Vật liệu | 18 | 21 | ×1.2 |
| Thanh Ngõa | Vật liệu | 15 | 18 | ×1.2 |
| Thôi Vận Thạch Sơ Phẩm | Vật liệu | 12 | 15 | ×1.3 |
| Ván Gỗ | Vật liệu | 10 | 13 | ×1.3 |
| Bội Sản Thạch Sơ Phẩm | Vật liệu | 10 | 13 | ×1.3 |
| Tụ Khí Thạch Sơ Phẩm | Vật liệu | 9 | 12 | ×1.3 |
| Đất Sét | Vật liệu | 2 | 5 | ×2.5 |
| Cát | Vật liệu | 2 | 5 | ×2.5 |
