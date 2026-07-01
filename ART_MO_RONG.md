# ART MỞ RỘNG — Đăng Tiên Mộng

Tổng quan (đối chiếu design doc + art đã có):
- **Chưởng môn 15 phái:** 10 đã có (`port_master_*`) → **cần 5**.
- **9 huyền thoại:** design tái dùng chân dung `images/danhsi/` sẵn có → **KHÔNG cần vẽ mới** (trừ khi muốn art riêng).
- **Thẻ bài:** 17 lá hiện có art đủ; **42 lá mới chờ thiết kế thẻ** (sẽ đưa prompt sau).
- **Di vật:** đủ 15.
- **Nền biome:** 3 `dream_*` đang dùng cho 3 Trùng (đủ chạy); dedicated riêng = tùy chọn.

Đích: `images/dtm/enemies/<file>.webp`. Kích thước: **chân dung nhân vật ~3:4 hoặc dọc** (khớp `port_master_*` cũ), nhân vật ở nửa trên khung để crop đẹp cả **ô quái** (dọc) lẫn **banner boss** (ngang). File webp.

---

## STYLE CHUNG — dán TRƯỚC mỗi prompt

`Wuxia xianxia martial-arts sect grandmaster character portrait, upper-body bust, dramatic semi-realistic painterly digital art, ornate traditional Chinese martial robes, cinematic rim lighting, atmospheric dark moody background, powerful commanding presence, facing viewer, subject in upper-center of frame, no text, no border —` rồi nối phần riêng.

Màu quầng năng lượng theo ngũ hành: **Kim=vàng · Mộc=lục · Thủy=lam · Hỏa=đỏ-cam · Thổ=xám bạch kim.**

---

## NHÓM A — 5 CHƯỞNG MÔN CÒN THIẾU (cần, để đủ 15 phái)

**1. `port_master_thien_vuong.webp` — Thiên Vương Chưởng Môn · Kim (vàng) · trọng giáp phản đòn**
`a towering armored patriarch of the "Heavenly King" (Thien Vuong) sect, clad in ornate heavy golden-bronze plate armor with dragon reliefs, broad imposing shoulders, stern iron-willed face, standing in an unbreakable defensive stance with a massive war-mace, radiant gold energy, war-god aura, dark stormy fortress hall background`

**2. `port_master_ngu_doc.webp` — Ngũ Độc Giáo Chủ · Mộc (lục) · chồng độc & kích nổ**
`a sinister southern-borderlands (Miao) sorcerer, master of the "Five Poisons" (Ngu Doc) cult, dark emerald-green robes with venomous serpent embroidery, coiling snakes and gu insects about the shoulders, holding a bone staff, toxic green mist and poison fumes, pale cunning face with a cold smile, eerie green glow, misty swamp shrine background`

**3. `port_master_thuy_yen.webp` — Thúy Yên Chưởng Môn · Thủy (lam) · băng khống chế**
`an elegant cold-beauty mistress leading the "Emerald Mist" (Thuy Yen) ice sect, flowing pale blue and white silk robes, frost crystals adorning her hair, wielding an ice-jade fan and slender frost sword, swirling snow and freezing mist around her, serene icy expression, glowing cyan-blue aura, frozen palace of ice background`

**4. `port_master_thien_nhan.webp` — Thiên Nhẫn Giáo Chủ · Hỏa (đỏ-cam) · bỏng đốt lan**
`a fierce cruel leader of the demonic "Heavenly Blade" (Thien Nhan) cult, blood-red and black robes patterned with flames, burning ember eyes, wreathed in spreading crimson-orange fire, holding a curved fire-blade, aggressive menacing pose, intense red-orange glow, burning ruined hall background`

**5. `port_master_con_lon.webp` — Côn Lôn Chưởng Môn · Thổ (xám bạch kim) · choáng khóa**
`a stoic immovable daoist grandmaster of the Kunlun (Con Lon) mountain sect, weathered grey-white robes and long flowing beard, gripping a heavy earthen staff, stone-calm face, standing firm as a mountain, drifting dust and rock energy, muted silver-grey aura, snowy Kunlun mountain-peak background`

---

## NHÓM B — 3 QUÁI LÂU LA MỚI (tùy chọn — giờ đang hiện chữ Hán)

**6. `tanKiem.webp` — Tán Tu Kiếm Đồ · Thổ (xám) · kiếm khách lang thang**
`a masterless wandering rogue swordsman, worn grey travel robes, carrying a plain jian sword, tired rugged road-worn face, faint grey aura, misty wilderness road background` *(dùng style chung nhưng hạ tông "lâu la" — bớt uy nghi, đời thường hơn)*

**7. `doCo.webp` — Ngũ Độc Giáo Đồ · Mộc (lục) · đệ tử độc môn**
`a low-rank poison-cult acolyte, sickly gaunt figure in tattered dark-green robes, clutching a poison pouch and dagger, greenish pallid skin, furtive nervous expression, faint toxic green haze, dim swampy background`

**8. `luyenKhi.webp` — Luyện Khí Tán Nhân · Hỏa (đỏ) · tán tu luyện khí**
`a dishevelled wild-haired rogue qi-refining cultivator, scorched red-brown robes, palms glowing with fiery inner energy, intense determined face, wisps of flame and heat haze, faint red glow, rocky cave background`

---

## TÙY CHỌN (nâng cấp thẩm mỹ, không bắt buộc)

- **Nền biome riêng 3 Trùng** (thay `dream_*` dùng chung): 3 ảnh phong cảnh NGANG (banner-friendly) — Trùng 1 rừng trúc/suối mộng sáng · Trùng 2 vực núi sâu u minh · Trùng 3 ma uyên đỏ tím. Đích: `images/dtm/bg/trung1.webp` / `trung2.webp` / `trung3.webp` (mình sẽ trỏ CSS vào).
- **Banner landscape riêng từng boss** (như bản `port_master_ma_giao` bạn vừa làm): mỗi chưởng môn 1 cảnh ngang thay vì crop chân dung dọc. Nhiều việc → để sau cũng được.

---

## CHỜ THIẾT KẾ (chưa prompt được)
- **42 thẻ bài mới** (18 → 60): cần thiết kế thẻ (tên/hệ/hiệu ứng) trước → mình đưa prompt art từng lá sau.
- **9 huyền thoại**: design tái dùng `images/danhsi/`; nếu muốn art RIÊNG cho DTM thì cần chốt danh tính 8 con còn lại (doc mới chi tiết mỗi Đông Tà).

*Ghi chú: art là để CHUẨN BỊ — thả file vào là dùng được ngay khi tới bước build nội dung (5 chưởng môn cần được thêm vào roster game trước mới xuất hiện; mình sẽ làm khi build content).*
