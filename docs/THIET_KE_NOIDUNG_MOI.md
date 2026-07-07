# THIẾT KẾ NỘI DUNG MỞ RỘNG — Đăng Tiên Mộng

> **BẢN DRAFT chờ user duyệt/chỉnh.** Chưa build. Mọi số = DRAFT (tune bằng harness sau).
> Nguồn: 2 workflow (soạn 15 phái → mở rộng ~7 thẻ/phái + neutral, đều có audit đối kháng).
> Mảng đã xong ở doc này: **15 PHÁI + POOL THẺ (117) + 5 BẬC PHẨM CHẤT**. Còn: boss MOVES đầy đủ · 9 huyền thoại (Thần Thoại) · Sát Cảnh 6→15 · prompt art.

---

## 0. TÓM TẮT

- **Pool: 17 → 117 thẻ** (100 thẻ mới) = 15 phái × 7 + 12 neutral. + 9 **Thần Thoại** (huyền thoại, mảng sau) → tổng ~126.
- **5 bậc phẩm chất**: Sơ Cấp · Thường · Hiếm · Tuyệt · Thần Thoại.
- **Phân bổ** (117): Sơ 15 · Thường 36 · Hiếm 47 · Tuyệt 19. Mỗi phái đúng 7 thẻ, ≤2 Tuyệt/phái, đều có ≥3 thẻ ≤1 Khi (Hợp Bích khả thi).
- **Cơ chế**: 11 cũ + 6 mới (Bỏng/Choáng/Phá Giáp/Tụ Khí/Giữ Hộ Thể/Đoạn) + 3 stretch (blkToDmg/detonate/selfDmg) + hệ đếm Hợp Bích.
- **Art**: 100 thẻ mới → Hán fallback trước, gen dần (100 prompt gộp mảng art sau).

---

## 1. BỘ CƠ CHẾ & WIRING

**11 khóa cũ:** `dmg · hits · aoe · drain · blk · heal · poison · weaken · str · dodge · draw` + khắc ngũ hành ×1.3.

**6 cơ chế mới** (wire trong `playCard`/`endTurn`, schema phẳng):

| Khóa | Ý nghĩa | Wiring |
|---|---|---|
| `burn:n, burnT:k` | Bỏng: −n HP/lượt CỐ ĐỊNH k lượt, xuyên block, không giảm dần | enemy `burn`,`burnT`; endTurn tick trừ thẳng HP, `burnT--` |
| `stun:1` | Choáng: địch bỏ n lượt | enemy `stun`; đầu vòng ra đòn: nếu `stun>0` bỏ hành động, `stun--`. Boss cap 1 + kháng |
| `pen:true` | Phá Giáp: bỏ qua Hộ Thể địch | nhánh `dmg`: nếu `pen` trừ thẳng HP (bỏ trừ `e.block`) |
| `energy:n` | Tụ Khí: +n Khí ngay | `this.khi += c.energy` |
| `keepBlock:true` | Giữ Hộ Thể: không reset đầu lượt sau (1 lần) | cờ `player.keepBlock`; endTurn không reset block, rồi clear cờ |
| `exhaust:true` | Đoạn: thẻ rời trận sau khi đánh | `_discardCast`: nếu `exhaust` không push vào chồng Bỏ |

**3 stretch:** `blkToDmg:k` (Thiếu Lâm+Võ Đang: ST += floor(block×k)) · `detonate:k` (Ngũ Độc: ST = Độc×k rồi xóa Độc) · `selfDmg:n` (Ma Giáo+Nhật Nguyệt: tự mất n HP, không tự giết).

**Hợp Bích** (mọi phái): đếm số thẻ cùng `sect` chơi trong lượt (reset ở `endTurn`); từ thẻ thứ 2 kích hiệu ứng phái. Viền thẻ glow tĩnh màu hệ + log "〈Hợp Bích: …〉".

---

## 2. 5 BẬC PHẨM CHẤT

| Bậc (`rar`) | Màu | Vai trò |
|---|---|---|
| **Sơ Cấp** `so` | xám tối `#6b7280` | chiêu cơ bản/nhập môn, filler (chủ yếu neutral); tiện UX xóa thẻ rác |
| **Thường** `thuong` | xám `#94a3b8` | nền phái, rẻ |
| **Hiếm** `hiem` | lam `#38bdf8` | tinh túy phái ("thịt" của bộ) |
| **Tuyệt** `tuyet` | hổ phách `#f5b942` | tuyệt học phái, thường Đoạn, đổi cục diện |
| **Thần Thoại** `than` | tím glow `#c084fc` | bí kíp 9 huyền thoại (mảng sau); cực hiếm, glow tĩnh riêng |

> **UI mới cần**: gem/nhãn/màu cho 2 bậc mới (Sơ + Thần Thoại) + glow tĩnh Thần Thoại → **mockup trước khi ráp** (luật visual mới). Reward-roll cần trọng số theo bậc (càng hiếm càng ít xuất hiện).
> **Lưu ý build**: 5 thẻ live sẽ **đổi bậc** dưới hệ mới: coBanKiem/coBanQuyen Thường→**Sơ** · langBa Hiếm→**Thường** · hoaSon Hiếm→**Thường** · laHan/datMa Thường→**Hiếm** (nâng thành chiêu-phái). Chỉ đổi field `rar`.

Ký hiệu: **[C]** = thẻ live sẵn (reuse art) · các thẻ khác = **[MỚI]** (Hán fallback + cần art).

---

## 3. MƯỜI LĂM PHÁI (7 thẻ/phái)

### ☰ KIM (vàng · khắc Mộc)

**Thiên Vương Bang** 天 `thienVuong` — *Trọng giáp + Phá Giáp phản đòn.*
Hợp Bích **Kim Cang Bất Hoại**: ≥2 lá/lượt → từ lá 2 +4 Hộ Thể & đòn kế Phá Giáp.
| id | tên | Khí | loại | bậc | eff |
|---|---|---|---|---|---|
| `thienVuong` [C] | Thiên Vương Phá 霸 | 3 | Công | Tuyệt | 18 ST · Phá Giáp · Đoạn |
| `kimCangGiap` | Kim Cang Hộ Giáp 鎧 | 1 | Thủ | Thường | +9 Hộ Thể |
| `phanChanChuong` | Phản Chấn Chưởng 震 | 2 | Công | Hiếm | 8 ST · +8 Hộ Thể |
| `tieuThietChuong` | Tiêu Thiết Chưởng 鐵 | 1 | Thủ | Thường | +8 Hộ Thể |
| `phaThietChuy` | Phá Thiết Chùy 錐 | 1 | Công | Hiếm | 7 ST · Phá Giáp |
| `thietTuongBich` | Thiết Tường Bích 壁 | 2 | Thủ | Hiếm | +13 Hộ Thể · Giữ Hộ Thể |
| `phaGiapTamChuy` | Phá Giáp Tam Chùy 貫 | 2 | Công | Tuyệt | 12 ST · +10 Hộ Thể · Phá Giáp · Đoạn |
Boss **Thiên Vương Đế Quân** · `port_master_thien_vuong` · HP~85 · giáp cao → pen nặng; gimmick block cao → đòn pen + dmg theo giáp.

**Thiếu Lâm Tự** 少 `thieuLam` — *Hộ Thể hóa sát thương (blkToDmg).*
Hợp Bích **Kim Cang Phục Ma**: ≥2 lá/lượt → giữ giáp (keepBlock) & đòn Công +½ Hộ Thể hiện có.
| id | tên | Khí | loại | bậc | eff |
|---|---|---|---|---|---|
| `laHan` [C] | La Hán Quyền 羅 | 2 | Công | Hiếm | 11 ST |
| `datMa` [C] | Đạt Ma Trượng 達 | 2 | Công | Hiếm | 7 ST · +5 Hộ Thể |
| `dichCan` [C] | Dịch Cân Kinh 易 | 1 | Kỹ | Hiếm | +3 Lực cả trận |
| `kimCuongPhachToai` | Kim Cang Phách Toái 碎 | 2 | Công | Tuyệt | 6 ST +toàn bộ Hộ Thể (blkToDmg1) · Đoạn |
| `thietBoSam` | Thiết Bố Sam 衫 | 1 | Thủ | Thường | +8 Hộ Thể |
| `viDaChuong` | Vi Đà Chưởng 韋 | 1 | Công | Thường | 5 ST · +4 Hộ Thể |
| `baNhaThung` | Bá Nhã Thung Chung 鐘 | 2 | Công | Hiếm | 8 ST +½ Hộ Thể (blkToDmg0.5) |
Boss **Thiếu Lâm Phương Trượng** · `port_master_thieu_lam` · HP~80 · dựng blk → quy giáp thành đòn; gimmick dmg += floor(block×0.6).

**Bồng Lai Tiên Phái** 蓬 `bongLai` — *Rút bài + né + Tụ Khí, chuỗi lá rẻ.*
Hợp Bích **Vân Du Tiên Tích**: ≥2 lá/lượt → từ lá 2 rút +1; lần đầu hoàn +1 Khí.
| id | tên | Khí | loại | bậc | eff |
|---|---|---|---|---|---|
| `vanVuThan` | Vân Vũ Thân Pháp 雲 | 0 | Kỹ | Thường | Né đòn kế · rút 1 |
| `ngocLoTuKhi` | Ngọc Lộ Tụ Khí 露 | 0 | Kỹ | Hiếm | +2 Khí · rút 1 · Đoạn |
| `phiKiemTruyThan` | Phi Kiếm Truy Thần 飛 | 1 | Công | Hiếm | 4 ST ×2 · rút 1 |
| `thanhVanBo` | Thanh Vân Bộ 步 | 0 | Kỹ | Sơ | rút 1 |
| `tienNhanChiLo` | Tiên Nhân Chỉ Lộ 指 | 1 | Công | Thường | 5 ST · rút 1 |
| `luuVanPhi` | Lưu Vân Phi Kiếm 劍 | 1 | Công | Hiếm | 3 ST ×3 · rút 1 |
| `tieuDaoDonKiem` | Tiêu Dao Độn Kiếm 逍 | 2 | Công | Tuyệt | 6 ST ×3 · rút 2 · Né · Đoạn |
Boss **Bồng Lai Tiên Tử** · `port_master_bong_lai` · HP~70 · multi-hit nhẹ + dodge; gimmick chu kỳ né trọn đòn người chơi → lượt sau chuỗi mạnh hơn.

### ☴ MỘC (lục · khắc Thổ)

**Đường Môn** 唐 `duongMon` — *Ám khí nhiều mũi + Độc mỏng bào mòn.*
Hợp Bích **Mãn Thiên Hoa Vũ**: lá ám khí thứ 2/lượt → ám khí lượt này +2 ST/mũi & +2 Độc.
| id | tên | Khí | loại | bậc | eff |
|---|---|---|---|---|---|
| `amKhi` [C] | Đường Môn Ám Khí 暗 | 1 | Công | Thường | 3 ST · Độc 4 |
| `manThienPhi` | Mãn Thiên Phi Hoàng 蝗 | 2 | Công | Hiếm | 3 ST ×4 · Độc 2 |
| `thoiTamChau` | Thôi Tâm Châu 催 | 1 | Kỹ | Hiếm | Độc 3 · rút 2 |
| `phiTienThuat` | Phi Tiễn Thuật 矢 | 0 | Công | Sơ | 4 ST |
| `tuTinhCham` | Tử Tinh Châm 針 | 1 | Công | Thường | 5 ST · Độc 2 |
| `khongMinhVu` | Khổng Minh Nỗ Vũ 弩 | 2 | Công | Hiếm | 2 ST ×3 · Độc 3 |
| `vanTienTruQuang` | Vạn Tiễn Truy Quang 萬 | 3 | Công | Tuyệt | 4 ST ×5 · Độc 2/mũi · Đoạn |
Boss **Đường Môn Chưởng Môn** · `port_master_duong_mon` · HP~74 · ám khí hits cao + weaken; gimmick mỗi lượt Độc người chơi tự +1.

**Ngũ Độc** 毒 `nguDoc` — *Chồng Độc dày rồi kích nổ (detonate).*
Hợp Bích **Bách Độc Câu Phát**: lá 2/lượt → đòn kích nổ ×+0.5 & chừa nửa Độc.
| id | tên | Khí | loại | bậc | eff |
|---|---|---|---|---|---|
| `ngungDocTan` | Ngưng Độc Tán 凝 | 1 | Kỹ | Thường | Độc 6 |
| `vanDocQuiTong` | Vạn Độc Quy Tông 歸 | 2 | Công | Tuyệt | ST = Độc×2 rồi xóa Độc · Đoạn |
| `docLongToa` | Độc Long Toả 鎖 | 1 | Công | Hiếm | 4 ST · Độc 3 · Suy Yếu 1 |
| `tanDocThu` | Tán Độc Thủ 散 | 0 | Kỹ | Sơ | Độc 3 |
| `nguDocXaTien` | Ngũ Độc Xà Tiễn 蛇 | 1 | Công | Thường | 4 ST · Độc 4 |
| `cotDocChuong` | Cốt Độc Chưởng 骨 | 2 | Công | Hiếm | 8 ST · Độc 3 |
| `bachDocPhat` | Bách Độc Phát Tác 發 | 2 | Công | Hiếm | Độc 4 · rồi ST = Độc rồi xóa (detonate1) |
Boss **Ngũ Độc Giáo Chủ** · `port_master_ngu_doc` · HP~80 · xây Độc → detonate; gimmick mỗi lượt heal = Độc người chơi rồi Độc +1.

**Ma Giáo** 魔 `maGiao` — *Hút máu + đổi máu (selfDmg).*
Hợp Bích **Huyết Ma Đồng Nguyên**: lá 2/lượt → đòn hút máu +3 hồi & selfDmg lượt này −2.
| id | tên | Khí | loại | bậc | eff |
|---|---|---|---|---|---|
| `hapTinh` [C] | Hấp Tinh Đại Pháp 吸 | 2 | Công | Tuyệt | 7 ST · hút máu = ST |
| `huyetMaCong` | Huyết Ma Cuồng Công 狂 | 2 | Công | Tuyệt | 18 ST · tự −5 HP · Đoạn |
| `nhiepHonThuat` | Nhiếp Hồn Thuật 攝 | 1 | Công | Hiếm | 5 ST · hút máu · Suy Yếu 1 |
| `huyetTraoThu` | Huyết Trảo Thủ 爪 | 1 | Công | Thường | 5 ST · hút máu |
| `thichHuyetChu` | Thích Huyết Chú 刺 | 0 | Công | Thường | 6 ST · tự −3 HP |
| `huyetTeChuong` | Huyết Tế Chưởng 祭 | 1 | Công | Hiếm | 9 ST · tự −3 HP |
| `phanHuyetHoiNguyen` | Phần Huyết Hồi Nguyên 焚 | 2 | Công | Hiếm | 10 ST · hút máu · tự −4 HP |
Boss **Ma Giáo Giáo Chủ** · `port_master_ma_giao` · HP~82 · drain + tự cắt máu đòn nặng; gimmick hút càng mạnh khi HP càng thấp.

### ☵ THỦY (lam · khắc Hỏa)

**Nga Mi** 峨 `ngaMi` — *Hồi + trụ bền.*
Hợp Bích **Cửu Dương Tương Sinh**: ≥2 lá/lượt → heal & blk của chúng ×1.5.
| id | tên | Khí | loại | bậc | eff |
|---|---|---|---|---|---|
| `ngaMi` [C] | Nga Mi Cửu Dương Công 陽 | 1 | Kỹ | Thường | hồi 8 |
| `phatQuangKinh` | Phật Quang Hộ Thể Kinh 光 | 1 | Thủ | Hiếm | +8 Hộ Thể · hồi 4 |
| `phoDoTe` | Phổ Độ Chúng Sinh Tế 渡 | 2 | Kỹ | Tuyệt | hồi 14 · +10 Hộ Thể · Giữ Hộ Thể |
| `thanhTamChu` | Thanh Tâm Chú 清 | 0 | Kỹ | Sơ | hồi 4 |
| `phoHienChuong` | Phổ Hiền Hộ Pháp Chưởng 普 | 1 | Công | Thường | 5 ST · hồi 3 |
| `chuDuongTamChu` | Chú Dưỡng Hộ Tâm Chú 護 | 1 | Thủ | Hiếm | +6 Hộ Thể · hồi 4 · +1 Lực |
| `tuBiPhoDo` | Từ Bi Phổ Độ Chưởng 慈 | 2 | Kỹ | Hiếm | hồi 10 · rút 1 |
Boss **Diệt Tuyệt Sư Thái** · `port_master_nga_mi` · HP~80 · hồi + blk kéo trận; gimmick mỗi 3 lượt tự hồi khối lớn.

**Hoa Sơn** 華 `hoaSon` — *Kiếm rẻ combo tempo.*
Hợp Bích **Ngũ Nhạc Kiếm Ý**: ≥2 lá/lượt → lá 2+ rút +1 & +2 ST.
| id | tên | Khí | loại | bậc | eff |
|---|---|---|---|---|---|
| `hoaSon` [C] | Hoa Sơn Kiếm Pháp 華 | 2 | Công | Thường | 9 ST |
| `matKiem` | Mai Hoa Mật Kiếm 密 | 0 | Công | Thường | 4 ST · rút 1 |
| `phaKiemThuc` | Phá Kiếm Thức 破 | 1 | Công | Hiếm | 3 ST ×2 · +1 Khi |
| `cuongPhongKiem` | Cuồng Phong Vô Định Kiếm 狂 | 2 | Công | Tuyệt | 4 ST ×5 · rút 2 · Đoạn |
| `lacThacKiem` | Lạc Thác Kiếm 落 | 0 | Công | Sơ | 4 ST |
| `ngocNuKiem` | Ngọc Nữ Kiếm Pháp 玉 | 1 | Công | Thường | 6 ST · rút 1 |
| `tuTuKiem` | Liễu Nhứ Mãn Thiên Kiếm 絮 | 1 | Công | Hiếm | 7 ST · Suy Yếu 2 |
Boss **Nhạc Bất Quần** · `port_master_hoa_son` · HP~72 · chuỗi trảm + Tụ Khí; gimmick mỗi lượt +1 đòn vào chuỗi kiếm.

**Thúy Yên** 冰 `thuyYen` — *Băng khống chế (Suy Yếu + Choáng).*
Hợp Bích **Hàn Băng Phong Tỏa**: ≥2 lá/lượt → Suy Yếu +2 & +4 Hộ Thể.
| id | tên | Khí | loại | bậc | eff |
|---|---|---|---|---|---|
| `hanBangChuong` | Hàn Băng Miên Chưởng 寒 | 1 | Công | Thường | 6 ST · Suy Yếu 2 |
| `bangPhongToa` | Huyền Băng Phong Tỏa 封 | 2 | Kỹ | Hiếm | Choáng 1 · Suy Yếu 3 · +6 Hộ Thể |
| `vanLyBangPhong` | Vạn Lý Băng Phong Kiếm 萬 | 2 | Công | Tuyệt | 8 ST toàn địch · Suy Yếu 3 · Choáng 1 · Đoạn |
| `bangChamThich` | Băng Châm Thích 針 | 0 | Công | Sơ | 4 ST · Suy Yếu 1 |
| `lanhSuongThu` | Lãnh Sương Hộ Thân Thủ 霜 | 1 | Thủ | Thường | +8 Hộ Thể · Suy Yếu 1 |
| `bangPhongChuong` | Băng Phong Chưởng 掌 | 2 | Công | Hiếm | 8 ST · Choáng 1 *([tune] từ 1Khi/5ST)* |
| `tuyetPhongChuong` | Tuyết Phong Chưởng 雪 | 2 | Công | Hiếm | 11 ST · Suy Yếu 3 |
Boss **Băng Hà Tôn Chủ** · `port_master_thuy_yen` · HP~76 · băng + Suy Yếu + Băng Giáp; gimmick kháng Choáng (dính 1 lượt rồi miễn 2 lượt).

### ☲ HỎA (đỏ-cam · khắc Kim)

**Thiên Nhẫn Giáo** 忍 `thienNhan` — *Gieo Bỏng lan + AoE.*
Hợp Bích **Liên Hoàn Phần Thiên**: ≥2 lá/lượt → mọi Bỏng đang cháy +2 lượt.
| id | tên | Khí | loại | bậc | eff |
|---|---|---|---|---|---|
| `phanThienChuong` | Phần Thiên Chưởng 焚 | 1 | Công | Thường | 5 ST · Bỏng 2×3 |
| `hoaVanCuongPhong` | Hỏa Vân Cuồng Phong 炎 | 2 | Công | Hiếm | 6 ST toàn địch · Bỏng 2×3 |
| `liaoNguyenChiHoa` | Liệu Nguyên Chi Hỏa 燎 | 2 | Kỹ | Tuyệt | Bỏng 4×3 toàn địch · Đoạn |
| `tinhHoaMoi` | Tinh Hỏa Mồi 星 | 0 | Công | Sơ | 2 ST · Bỏng 1×3 |
| `lieuHoaChuong` | Liệu Hỏa Chưởng 燋 | 1 | Công | Thường | 3 ST · Bỏng 2×3 *([tune] Bỏng 3→2)* |
| `phanThienDoiHoa` | Phần Thiên Đối Hỏa 燄 | 1 | Công | Hiếm | 5 ST · Bỏng 2×3 *([tune] ST 7→5)* |
| `phucDiaHoaVan` | Phủ Địa Hỏa Vân 燔 | 2 | Công | Hiếm | 5 ST toàn địch · Bỏng 2×3 *([tune] Bỏng 3→2)* |
Boss **Xích Diễm Tôn Giả** · `port_master_thien_nhan` · HP~72 · Bỏng diện rộng; gimmick mỗi lượt Bỏng người chơi +1 lượt.

**Cái Bang** 丐 `caiBang` — *Tích Lực rồi bùng nổ.*
Hợp Bích **Túy Quyền Liên Hoàn**: ≥2 lá/lượt → +2 Lực cả trận.
| id | tên | Khí | loại | bậc | eff |
|---|---|---|---|---|---|
| `tuyQuyen` | Túy Quyền 醉 | 1 | Công | Thường | 4 ST · +2 Lực |
| `khangLongTamChuong` | Kháng Long Tam Chưởng 龍 | 1 | Công | Hiếm | 3 ST ×3 |
| `khangLongThapBatChuong` | Kháng Long Thập Bát Chưởng 降 | 3 | Công | Tuyệt | 8 ST ×2 · Đoạn |
| `khaiTuuThuc` | Khai Tửu Thức 酒 | 0 | Kỹ | Sơ | +1 Lực · rút 1 |
| `dangLongCuoc` | Đăng Long Cước 腿 | 1 | Công | Thường | 5 ST · +1 Lực |
| `tiemThienChuong` | Tiềm Thiên Chưởng 潛 | 1 | Công | Hiếm | 4 ST ×2 · +1 Lực |
| `phiLongTaiThien` | Phi Long Tại Thiên 飛 | 2 | Công | Hiếm | 11 ST · +2 Lực |
Boss **Túy Cái Bang Chủ** · `port_master_cai_bang` · HP~80 · cộng Lực → đấm dồn; gimmick mỗi lượt tự +1 Lực.

**Nhật Nguyệt Thần Giáo** 日 `nhatNguyet` — *Đổi máu lấy burst (selfDmg).*
Hợp Bích **Huyết Nhật Đồng Huy**: ≥2 lá/lượt → hồi 4 HP đã hao.
| id | tên | Khí | loại | bậc | eff |
|---|---|---|---|---|---|
| `tichTa` [C] | Tịch Tà Kiếm 辟 | 2 | Công | Tuyệt | 3 ST ×3 |
| `nhatNguyetTamPhap` | Nhật Nguyệt Tâm Pháp 燃 | 1 | Công | Hiếm | 11 ST · tự −5 HP |
| `quangMinhTanPhap` | Quang Minh Tán Pháp 焰 | 2 | Công | Tuyệt | 22 ST · tự −8 HP · Đoạn |
| `huyetTeThuc` | Huyết Tế Thức 血 | 0 | Kỹ | Sơ | tự −3 HP · +1 Khi |
| `phanHuyetChuong` | Phần Huyết Chưởng 殷 | 1 | Công | Thường | 8 ST · tự −3 HP |
| `nhiepHuyetThuc` | Nhiếp Huyết Thức 攝 | 1 | Công | Thường | 6 ST · hút máu |
| `huyetHaiThichCot` | Huyết Hải Thích Cốt 刺 | 2 | Công | Hiếm | 14 ST · Phá Giáp · tự −4 HP |
Boss **Nhật Nguyệt Giáo Chủ** · `port_master_nhat_nguyet` · HP~78 · đòn đơn ST cao + tự tổn máu; gimmick HP càng thấp đòn càng mạnh.

### ☷ THỔ (bạch kim · khắc Thủy)

**Võ Đang** 武 `voDang` — *Cố thủ + phản (keepBlock/blkToDmg).*
Hợp Bích **Thái Cực Sinh Nghi**: ≥2 lá/lượt → giữ giáp (keepBlock) & né đòn kế.
| id | tên | Khí | loại | bậc | eff |
|---|---|---|---|---|---|
| `thaiCuc` [C] | Thái Cực Quyền 極 | 1 | Thủ | Hiếm | +9 Hộ Thể |
| `lienHoanThoiTuy` | Liên Hoàn Thôi Thủ 推 | 1 | Thủ | Hiếm | +7 Hộ Thể · Giữ Hộ Thể |
| `tuLuongBatThienCan` | Tứ Lượng Bạt Thiên Cân 撥 | 2 | Công | Tuyệt | 4 ST +toàn bộ Hộ Thể (blkToDmg1) · Né |
| `luongNghiThuc` | Lưỡng Nghi Thức 兩 | 0 | Thủ | Thường | +6 Hộ Thể |
| `nhuVanChuong` | Nhu Vân Chưởng 雲 | 1 | Thủ | Thường | +8 Hộ Thể · rút 1 |
| `thaiCucNhuKinh` | Thái Cực Nhu Kình 柔 | 1 | Thủ | Hiếm | +6 Hộ Thể · 2 ST +toàn bộ Hộ Thể (blkToDmg1) |
| `luongNghiSinhTu` | Lưỡng Nghi Sinh Tứ Tượng 儀 | 3 | Thủ | Tuyệt | +16 Hộ Thể giữ · rút 2 · Đoạn |
Boss **Trương Tam Phong** · `port_master_vo_dang` · HP~80 · blk + keepBlock → blkToDmg; gimmick 3 tầng đỡ trọn đòn → phản 1 đòn quy đổi giáp.

**Côn Lôn** 崑 `conLon` — *Choáng khóa nhịp.*
Hợp Bích **Càn Khôn Đảo Chuyển**: ≥2 lá/lượt → đòn Choáng kế +1 lượt & rút +1.
| id | tên | Khí | loại | bậc | eff |
|---|---|---|---|---|---|
| `conLonChuong` | Côn Lôn Chưởng 崑 | 1 | Công | Thường | 6 ST · Suy Yếu 1 |
| `toaThienCuong` | Tỏa Thiên Cương Trận 鎖 | 2 | Thủ | Hiếm | +9 Hộ Thể · Choáng 1 |
| `honNguyenNhatKhi` | Hỗn Nguyên Nhất Khí 混 | 2 | Công | Tuyệt | 16 ST · Choáng 1 · Đoạn |
| `khaiThienXucDia` | Khai Thiên Xúc Địa 開 | 1 | Công | Thường | 5 ST · Phá Giáp |
| `canKhonNhatChi` | Càn Khôn Nhất Chỉ 乾 | 0 | Công | Thường | 4 ST · Suy Yếu 1 |
| `daoChuyenAmDuong` | Đảo Chuyển Âm Dương 轉 | 2 | Công | Hiếm | 7 ST · Choáng 1 *([tune] 1Khi→2Khi)* |
| `conLonTamThucKiem` | Côn Lôn Tam Thức Kiếm 劍 | 2 | Công | Hiếm | 4 ST ×3 · Suy Yếu 1 |
Boss **Thiết Cầm Tiên Sinh** · `port_master_con_lon` · HP~75 · blk + Choáng cắt combo; gimmick người chơi bị Choáng → boss +blk & đòn nặng. (Choáng lên boss cap 1 + kháng.)

**Thiên Sơn** 天 `thienSon` — *Băng-thổ bền, Suy Yếu + hồi.*
Hợp Bích **Lục Dương Hồi Xuân**: ≥2 lá/lượt → hồi HP & đòn Suy Yếu kế mạnh hơn.
| id | tên | Khí | loại | bậc | eff |
|---|---|---|---|---|---|
| `thienSonHanBang` | Thiên Sơn Hàn Băng Chưởng 寒 | 1 | Công | Hiếm | 7 ST · Suy Yếu 2 |
| `bangPhachHoThan` | Băng Phách Hộ Thân 魄 | 1 | Thủ | Thường | +8 Hộ Thể · hồi 3 |
| `lucDuongThanCong` | Lục Dương Thần Công 陽 | 2 | Kỹ | Tuyệt | hồi 10 · +11 Hộ Thể · Suy Yếu 2 · Đoạn |
| `thienSonChiHan` | Thiên Sơn Chỉ Hàn 指 | 0 | Công | Sơ | 3 ST · Suy Yếu 1 |
| `hoiXuanThuat` | Hồi Xuân Thuật 春 | 1 | Kỹ | Thường | hồi 6 · Suy Yếu 1 |
| `hanBangChanKhi` | Hàn Băng Chân Khí 氣 | 1 | Công | Hiếm | 6 ST · hồi 4 · Suy Yếu 1 |
| `thienSonBangPhong` | Thiên Sơn Băng Phong 封 | 2 | Công | Hiếm | 9 ST · Suy Yếu 2 · Choáng 1 |
Boss **Ưng Trảo Vương** · `port_master_thien_son` · HP~85 · blk + heal + weaken; gimmick lượt chưa bị đánh xuyên giáp → hồi HP & weaken tích lên người chơi.

---

## 4. POOL NEUTRAL (12 thẻ, vô phái)

| id | tên | Khí | loại | bậc | eff |
|---|---|---|---|---|---|
| `coBanKiem` [C] | Cơ Bản Kiếm 劍 | 1 | Công | Sơ | 6 ST |
| `coBanQuyen` [C] | Cơ Bản Quyền 拳 | 1 | Công | Sơ | 5 ST · +3 Hộ Thể |
| `coBanChuong` | Cơ Bản Chưởng 掌 | 1 | Công | Sơ | 4 ST · Suy Yếu 1 |
| `hoThanBo` | Hộ Thân Bộ 護 | 1 | Thủ | Sơ | +6 Hộ Thể |
| `vinhXuanChuy` | Vịnh Xuân Chùy 詠 | 1 | Công | Sơ | 2 ST ×2 |
| `langBa` [C] | Lăng Ba Vi Bộ 波 | 1 | Kỹ | Thường | +5 Hộ Thể · Né |
| `thanhPhong` [C] | Thanh Phong Bộ 風 | 0 | Kỹ | Thường | rút 2 |
| `vanKhiQuyet` | Vận Khí Quyết 運 | 0 | Kỹ | Thường | +1 Khi · rút 1 |
| `toanPhongCuoc` | Toàn Phong Cước 旋 | 1 | Công | Thường | 6 ST · +3 Hộ Thể |
| `cuuDuong` [C] | Cửu Dương Thần Công 陽 | 2 | Kỹ | Hiếm | hồi 7 · +4 Hộ Thể |
| `cuuAm` [C] | Cửu Âm Chân Kinh 陰 | 2 | Công | Hiếm | 5 ST · Suy Yếu 2 |
| `taoDang` [C] | Tảo Đãng Thiên Quân 掃 | 2 | Công | Hiếm | 5 ST toàn địch |

---

## 5. PHÂN BỔ & TỔNG KẾT

- **117 thẻ**: Sơ 15 · Thường 36 · Hiếm 47 · Tuyệt 19. Xét theo tầng: thấp (Sơ+Thường 51) > vừa (Hiếm 47) > cao (Tuyệt 19) — đường cong lành mạnh.
- **Mỗi phái 7 thẻ**, ≤2 Tuyệt/phái, đều có ≥3 thẻ ≤1 Khi.
- **Thẻ mới cần art**: 100 (Hán fallback → gen dần). Thẻ live [C] reuse art `book_*`.
- **Còn trống cho Thần Thoại**: 9 (huyền thoại, mảng 4) → tổng ~126.

## 6. NHẬT KÝ CÂN BẰNG (tune từ audit — DRAFT)

| Thẻ | Trước | Sau | Lý do |
|---|---|---|---|
| `lieuHoaChuong` (Thiên Nhẫn) | dmg3 · Bỏng 3×3 (12 đảm bảo) | Bỏng 2×3 (9) | Bỏng cố định tính như ST đảm bảo; thẻ nền quá nặng |
| `phanThienDoiHoa` (Thiên Nhẫn) | dmg7 · Bỏng 2×3 (13, không downside) | dmg5 (11) | đòn đơn 1-Khí cao nhất game, vượt band hiếm |
| `phucDiaHoaVan` (Thiên Nhẫn) | dmg5 aoe · Bỏng 3×3 (14/mục tiêu) | Bỏng 2×3 (11) | AoE phải thấp hơn đòn đơn |
| `daoChuyenAmDuong` (Côn Lôn) | 1 Khí · dmg7+Choáng | 2 Khí | Choáng trên atk 1-Khi lặp = stun-lock quái thường |
| `bangPhongChuong` (Thúy Yên) | 1 Khí · dmg5+Choáng | 2 Khí · dmg8+Choáng | dời Choáng khỏi atk 1-Khi; gộp thành đòn-choáng 2-Khi |

**Nguyên tắc Bỏng chốt (áp đều khi tune):** ST đảm bảo (dmg + burn×burnT) ≤ 9 cho Thường, ≤ 11 cho Hiếm/đòn đơn; AoE thấp hơn. Choáng chỉ trên thẻ cost ≥2.

## 7. LỘ TRÌNH KẾ TIẾP

1. **Boss chưởng môn** (mảng 3): 15 bộ MOVES/intent đầy đủ dẫn từ signature + gimmick (5 phái thiếu làm enemy mới).
2. **9 Thần Thoại** (mảng 4): danh tính + hệ + 9 bí kíp bậc Thần Thoại + intents, tái dùng `images/danhsi/`.
3. **Sát Cảnh 6→15** (mảng 5).
4. **Prompt art** (mảng art): 100 thẻ mới + 5 chưởng môn (đã có) + UI 2 bậc mới → `ART_MO_RONG.md`.
5. **Build** (sau duyệt): mở rộng POOL data (117 thẻ + rar 5 bậc + wire 6 cơ chế) → verify DOM → commit, giữ cách ly. Harness auto-sim chốt số.

---

## 8. SÁT CẢNH 6 → 15 (mảng 5)

`DTM_SC_MAX`: 6 → **15**. Per-hero (`scMaxByHero`). Cộng dồn — mỗi bậc thêm 1 luật khó hơn, giữ mọi luật bậc dưới. **Bậc 1-5 = đang có** (giữ nguyên); **6-15 = mới**.

| Bậc | Luật thêm (cộng dồn) | Wire |
|---|---|---|
| SC1 | Tàn niệm HP +8%/bậc | `hpScl += 0.08×sc` *(đã có)* |
| SC2 | Mộng Ngân trong ván ×0.9 | `rewardGold ×0.9` *(đã có)* |
| SC3 | Vào ván −3 HP khởi đầu | `mhp −3` *(đã có)* |
| SC4 | HP khởi đầu ×0.9 | `mhp ×0.9` *(đã có)* |
| SC5 | Mộng Thị +15% giá · Tĩnh Thất −5% | `price ×1.15`, `restPct −0.05` *(đã có)* |
| **SC6** | Quái ra đòn mạnh hơn (+5%/bậc từ SC6) | `dmgScl += 0.05×max(0,sc−5)` |
| **SC7** | Ác Thủ & Mộng Chủ **+1 intent** (chuỗi dài, khó đoán) | thêm 1 intent khi spawn boss/miniboss |
| **SC8** | Mỗi trận khởi đầu +1 thẻ **Nội Thương** (thẻ rác 1 Khi vô dụng, chiếm tay) | chèn 1 `curse` card vào `drawPile` ở `startBattle` |
| **SC9** | Tinh Anh/Chưởng Môn **+1 đòn player-side** (Suy Yếu/Độc lên người chơi) | thêm intent `weaken`/`poison` |
| **SC10** | Khí lượt 1 chỉ còn 2 | `khi` lượt đầu = `maxKhi − 1` |
| **SC11** | Quái Vận Hộ Thể / Liệu Thương +25% | `def`/`heal` intent ×1.25 |
| **SC12** | Đòn "Vận Công → đòn mạnh" của boss +25% ST | `big` atk ×1.25 |
| **SC13** | Di vật rơi hiếm hơn · Kỳ Ngộ rủi ro cao hơn | giảm trọng số `_dropRelic` |
| **SC14** | Bỏng/Độc trên người chơi kéo dài thêm 1 lượt (khó gỡ) | player `burnT`/`poison` +1 khi nhận |
| **SC15** | **Phẫn Nộ**: Mộng Chủ & Ác Thủ vào **pha 2** khi HP<50% (+1 intent & đòn +20%) | cờ `phase2` khi `hp < maxHp/2` |

**Thưởng SC**: `bankRun` rate đã cap 0.90 từ ~SC5 → **SC6-15 KHÔNG tăng bank qua rate**. Động lực bậc cao = one-time +50 Mộng Ngân/bậc mới (đã có) + **điểm Mộng Cảnh Bảng** (`ΣscMax×50`) + **danh hiệu Sát Cảnh** (titles.js, pha sau). SC8/9/14 phụ thuộc player-side status + thẻ Nội Thương (chung buildCost với boss).

---

## 9. BOSS CHƯỞNG MÔN (mảng 3) — 15 bộ chiêu

**Ký hiệu intent** (bao trước, giải cuối lượt người chơi): `def N`=Vận Hộ Thể · `atk N`=đánh N · `atk N×H`=N×H đòn · `charge`=Vận Công (bắt buộc đòn mạnh kế) · `ATK N big`=đòn mạnh · `pen`=xuyên Hộ Thể người chơi · `buff N`=+N Lực · `heal N`=hồi · `poison/burn N`=gieo Độc/Bỏng lên người chơi · `weaken N`=Suy Yếu người chơi · `stun`=Choáng người chơi · `curse`=nhét thẻ Nội Thương. Mỗi intent có 1 chip telegraph (tên chiêu + Hán) — đầy đủ trong workflow output.

| Boss (art `port_master_*`) | HP | Hệ | Chu kỳ intent | Gimmick |
|---|---|---|---|---|
| **Thiên Vương Đế Quân** `_thien_vuong` | 85 | Kim | def16·atk12·def14·charge·**ATK26** big/pen·atk8×2 | *Trọng Giáp Phản Đòn:* block≥20 → đòn atk kế pen + ST=+30% block |
| **Thiếu Lâm Phương Trượng** `_thieu_lam` | 80 | Kim | def14·buff4·atk10·def16·atk12·buff3 | *Thiết Bố Sam:* mỗi atk +25% block (block không mất) |
| **Bồng Lai Tiên Tử** `_bong_lai` | 70 | Kim | atk5×2·def10·atk4×3·buff3·atk6×2·def12·atk5×3 | *Vân Ẩn:* sau def → né trọn đòn người chơi 1 lượt, lượt sau chuỗi +1 hit |
| **Đường Môn Chưởng Môn** `_duong_mon` | 74 | Mộc | atk3×3·weaken2·atk2×4·poison4·buff2·atk2×5 pen·def6·charge·**ATK14** big | *Độc Vô Hình:* cuối lượt Độc người chơi +1 |
| **Ngũ Độc Giáo Chủ** `_ngu_doc` | 80 | Mộc | poison5·poison5·weaken3·poison6·charge·**ATK8** big/pen·heal8·poison5·def6 | *Dĩ Độc Dưỡng Thân:* cuối lượt heal=Độc player, rồi Độc+1; đòn nổ +ST theo Độc player |
| **Ma Giáo Giáo Chủ** `_ma_giao` | 82 | Mộc | atk6·atk4×2·buff3·atk7·curse·atk5×2 pen·def5·charge·**ATK16** big | *Huyết Ma Cường:* atk hút máu 50% ST (HP<50%→100%, <25%→150% & +2 ST) |
| **Diệt Tuyệt Sư Thái** `_nga_mi` | 80 | Thủy | atk11·def10·atk8·heal12·atk9·def8 | *Trường Kỳ Chiến:* mỗi 3 lượt tự hồi 18 HP |
| **Nhạc Bất Quần** `_hoa_son` | 72 | Thủy | atk5×2·buff3·atk4×3·charge·**ATK22** big·atk5×2 | *Kiếm Trì Tăng Tốc:* mỗi lượt +1 hit vào đòn chuỗi |
| **Băng Hà Tôn Chủ** `_thuy_yen` | 76 | Thủy | atk10·weaken3·def16·atk7×2·**STUN**·atk12 | *Băng Cốt:* Choáng ăn 1 lượt rồi miễn Choáng 2 lượt |
| **Xích Diễm Tôn Giả** `_thien_nhan` | 72 | Hỏa | burn4×3·atk6·buff2·burn5×3·atk8 pen·charge·**ATK14** big·heal8 | *Nghiệp Hỏa:* cuối lượt Bỏng player +1 lượt & boss +1 Lực |
| **Túy Cái Bang Chủ** `_cai_bang` | 80 | Hỏa | buff2·atk7·def6·buff3·atk9×2·charge·**ATK16** big/pen·weaken3 | *Túy Ý:* mỗi lượt tự +1 Lực (snowball) |
| **Nhật Nguyệt Giáo Chủ** `_nhat_nguyet` | 78 | Hỏa | atk10·atk7×2·def5·charge·**ATK18** big/pen·curse·atk12·buff3 | *Huyết Tế:* HP<50%→atk +4, <25%→+8 |
| **Trương Tam Phong** `_vo_dang` | 80 | Thổ | def12·def10·atk6×2·**charge** *[tune]*·**ATK20** big/pen (block→dmg)·buff3 | *Vô Cực Thủ Thế:* keepBlock; 3 tầng def → đòn quy đổi TOÀN BỘ giáp thành ST xuyên |
| **Thiết Cầm Tiên Sinh** `_con_lon` | 75 | Thổ | def9·**STUN**·atk16 *[tune bỏ big]*·def8·weaken3·atk5×2 | *Trấn Nhạc Cương:* Choáng player → lượt kế ép đòn nặng + boss +block. Choáng lên boss cap1+kháng |
| **Ưng Trảo Vương** `_thien_son` | 85 | Thổ | def10·atk7×2·weaken2·heal12·atk15 *[tune bỏ big]*·def8 | *Băng Sơn Trường Trận:* lượt chưa bị xuyên giáp → boss hồi 8 & Suy Yếu player +2 (tích) |

## 10. CHÍN HUYỀN THOẠI (mảng 4) — boss đỉnh + thẻ Thần Thoại

Boss "tàn niệm" của **danh sĩ có sẵn** (art `images/danhsi/<id>.webp`, khớp lore Danh Sĩ Bảng). HP cao (96-118). Hạ được → rơi **thẻ Thần Thoại** (bậc `than`, uy lực đỉnh, thường Đoạn).

| Huyền thoại (biệt hiệu) | Hệ · HP | Chu kỳ intent | Gimmick | Thẻ Thần Thoại (`than`) |
|---|---|---|---|---|
| **Lạc Vô Trần** · Tiếu Diện Độc La Sát `lacVoTran` | Mộc·108 | poison5·atk9·buff4·poison7·atk6×2·charge·**ATK22** big/pen | *Cẩm Hương Hoại Cốt:* mỗi 3 tầng Độc player → boss +1 Lực | `camHuongHoaiCotTan` **Cẩm Hương Hoại Cốt Tán** 香 · 2 Khí Công · `{dmg12,poison8,detonate2,exhaust}` |
| **Đỗ Dược** · Vạn Độc Cô `doDuocMaCo` | Mộc·112 | poison4·atk8·poison6·heal10(hút Độc)·def12·atk5×3·poison9 | *Tự Dưỡng Cầu Sinh:* heal hút sạch Độc player thành HP | `tamCotDuongSinhCo` **Tàm Cốt Dưỡng Sinh Cổ** 蠱 · 2 Khí Thủ · `{poison10,drain,heal6,blk8,exhaust}` |
| **Nam Cung Liệt Hỏa** · Bán Diện Hồng Liên `namCungLietHoa` | Hỏa·116 | burn4×3·atk10·buff4·burn5×2·atk7×2·charge·**ATK24** big | *Điểm Hỏa Bùng Nổ:* đòn big +ST=tổng Bỏng player rồi thiêu sạch | `phanTamCuuDiem` **Phần Tâm Cửu Diễm** 焰 · 3 Khí Công · `{dmg9,hits2,burn6,burnT3,detonate3,exhaust}` |
| **Tịch Huyền** · Không Tịch Thiền Sư `khongTichThuyenSu` | Thổ·118 | def16·atk9·buff3·def20·charge·**ATK26** big·**STUN** | *Thiền Thân Bất Hoại:* cuối lượt block dư → phản ½ thành ST xuyên player | `phucMaBatDongThien` **Phục Ma Bất Động Thiên** 伏 · 3 Khí Thủ · `{blk24,keepBlock,blkToDmg1,exhaust}` |
| **Tề Mặc Sơn** · Mai Kiếm Lão Nhân `coNhanMaiKiem` | Thổ·104 | atk11·buff4·atk7×2·charge(+2 Lực)·**ATK30** big/pen·def12 | *Kiếm Ý Chuẩn Xác:* charge +2 Lực dồn vào nhát Lạc Mai | `lacMaiNhatKiem` **Lạc Mai Nhất Kiếm** 落 · 3 Khí Công · `{dmg32,pen,str3,exhaust}` |
| **Vân Vong Nương** · Vô Danh Hành Vân `vanVongNuong` | Thủy·96 | atk6×2·def14·weaken3·atk12·buff3·atk8×2 | *Nhu Hóa Mượn Lực:* def→né đòn player, phản ½ ST lượt sau | `hanhVanLuuThuyQuyet` **Hành Vân Lưu Thủy Quyết** 流 · 2 Khí Kỹ · `{blk8,dodge,weaken3,drain,exhaust}` |
| **Lăng Tố Cầm** · Đoạn Huyền Cầm Tiên `langToCam` | Kim·108 | atk4×3·buff3·atk3×5·def12·charge·**ATK22** big/pen·weaken3·atk5×4 | *Công Xa Đa Đòn:* block player≥10→đòn kế pen; mỗi 3 lượt +1 Lực | `doanHuyenThapTamTuyen` **Đoạn Huyền Thập Tam Tuyến** 斷 · 3 Khí Công · `{dmg3,hits13,pen,exhaust}` |
| **Tô Uyển Nghiệt** · Đoạn Hồn Nhất Nhãn `toUyenNghiet` | Kim·96 | atk6 pen·def8·buff4·charge·**ATK30** big/pen·atk7 pen·weaken4 | *Nhất Kích Chí Mạng:* player HP≤35%→đòn kế +50% & pen | `nhatNhanDoanMenhThich` **Nhất Nhãn Đoạn Mệnh Thích** 刃 · 3 Khí Công · `{dmg34,pen,exhaust}` + *đặc biệt: địch <20% HP → +20 ST đoạt mệnh* |
| **Hàn Y Sương** · Băng Phách Nữ Hiệp `bangPhachNuHiep` | Thủy·118 | atk8·weaken3·def14·atk5×2·charge·**ATK24** big·**STUN**·atk6×2·weaken4 | *Hàn Băng Tích Lạnh:* mỗi atk +1 tầng Hàn player; ≥4 tầng→đòn kế Choáng rồi reset | `hanBangCuuTuyetChuong` **Hàn Băng Cửu Tuyệt Chưởng** 掌 · 3 Khí Công · `{dmg9,aoe,weaken3,stun1,exhaust}` |

**9 thẻ Thần Thoại** = +9 vào pool → **tổng 126 thẻ**. Phân bổ cuối: Sơ 15 · Thường 36 · Hiếm 47 · Tuyệt 19 · **Thần Thoại 9**.

## 11. BUILD-COST — cơ chế MỚI boss/huyền thoại cần wire ⚠️

Boss faction + huyền thoại tạo bản sắc bằng nhiều cơ chế **enemy-side / player-side status CHƯA có** trong combat hiện tại (hiện quái chỉ atk/def/buff/charge/heal, người chơi KHÔNG có DoT của riêng mình). **Đây là quyết định scope build lớn** — về cơ bản nhân đôi hệ trạng thái. Danh sách gom (audit):

- **Player-side status** (người chơi nhận): `player.poison` · `player.burn`+`burnT` · `player.weaken` · `player.stun` (dùng ít) · thẻ rác **Nội Thương** (`curse`). → cần tick ở endTurn + pill trạng thái người chơi (UI).
- **Đòn quái**: `atk.pen` (xuyên Hộ Thể người chơi) · `enemy.dodge` (né trọn đòn 1 lượt) · `drain-atk` (hút máu = %ST).
- **Boss-self**: `boss-block-to-dmg` (giáp→ST / phản giáp dư) · `boss-keep-block` · `boss-self-heal` ngoài chu kỳ · `drain-poison-to-heal` · counter (`turnCount`/`chainBonus`/`frost`/`pierced`) · `boss-lowhp-scaling` · `buff-str ramp` · `conditional-execute` (player HP thấp) · `stunImmuneWindow` · `boss-stunResist`.
- **Thẻ Thần Thoại**: `execute` (đòn +ST khi địch <20% HP — TÁCH khỏi `detonate`) + tái dùng detonate/keepBlock/blkToDmg/drain/exhaust (đã có trong 6+3 cơ chế).

> **Gợi ý 2 mức build** (user chốt khi tới bước build): **(A) FULL** — wire hết → boss cực có chất. **(B) LITE** — chỉ wire `atk.pen` + `player.poison/burn/weaken` + vài counter; các gimmick phức tạp (dodge/block-to-dmg/frost/execute) để pha sau, boss vẫn phân biệt qua pattern intent + số. Khuyến nghị **B trước, A dần** (giữ nhịp giao hàng, cách ly).

**Tune từ audit (đã áp):** 3 boss (Võ Đang/Côn Lôn/Thiên Sơn) đòn `big` thiếu `charge` → Võ Đang chèn charge, Côn Lôn/Thiên Sơn bỏ cờ `big` (gimmick đã telegraph). 2 gimmick (Tô Uyển Nghiệt/Lăng Tố Cầm) sửa wiring dùng **cờ tạm reset mỗi lượt** (không ghi đè `intents[].v`/`.pen` object dùng chung → tránh phình ST/pen dính vĩnh viễn). Tách `detonate` (per-stack DoT) khỏi `execute` (đòn phẳng hạ gục low-HP). Chuẩn hóa: `stun`/`curse` bỏ field `v` thừa.
