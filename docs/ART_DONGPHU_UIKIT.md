# ART — ĐỘNG PHỦ · UI KIT (khung / nút / icon để vượt ngưỡng AAA)

> Bổ trợ cho `ART_DONGPHU.md` (art cảnh nha_*/công trình). Đây là **bộ khung giao diện** — thứ đưa "độ hoàn thiện" từ ~75% (CSS thuần) lên ~90%. Nền mockup = `_mockup/dongphu_mockup.html` (bản B). Mình đã dựng sẵn class để "slot": thả ảnh đúng tên vào thư mục là mình wire (`border-image` / `background` / `<img>`) + tinh chỉnh với ảnh thật trước mắt.
>
> **Quy ước:** `.webp` (PNG alpha → webp). Tên file **thường, không dấu**. Nền **TRONG SUỐT** trừ khi ghi "đục". Không chữ trong ảnh. Palette game: tối teal-đen, **vàng cổ #c9a24b / #e8c877 / #f5d089**, nhấn ngọc #2dd4bf.
> **Style chung (dán vào mọi prompt):** `ornate Chinese xianxia game UI asset, antique gold filigree, dark teal-black, painterly, crisp, isolated on transparent background, no text, no watermark, game interface art`.
> **Thư mục:** khung/nút/ornament → `images/dongphu/ui/` · icon nhỏ → `images/dongphu/icons/`.

---

## ƯU TIÊN 1 — đổi diện mạo nhiều nhất  ✅ ĐÃ WIRE HẾT (frame/panel_bg/btn/badge)

### 1. Khung viền vàng 9-slice — `ui/frame_gold.webp`
- **Slot:** mọi panel + khung art (`.frame`, `.a-info`, `.a-bottom`, `.b-detail`). Mình cắt 9-slice (`border-image`) → giãn cho panel bất kỳ.
- **Size/nền:** ~**480×480**, viền dày ~48px, **giữa TRONG SUỐT**. 4 góc ornate GIỐNG NHAU, 4 cạnh là đường vàng đơn giản (để tile/giãn không lộ).
- **Prompt:** `an ornate rectangular Chinese game UI border frame, thick symmetric corner ornaments (cloud and dragon filigree) in antique gold, thin plain gold edges between corners, hollow transparent center, [style chung]`.
- *Phương án phụ (nhẹ hơn):* `a slim elegant gold rectangular frame, small corner flourishes, thin double-line gold edges, transparent center, [style chung]`.

### 2. Nền panel — `ui/panel_bg.webp`  ✅ ĐÃ WIRE
- **Slot:** `background` của `.a-info / .a-bottom / .b-detail` (cover + lớp phủ tối .44 giữ chữ rõ).
- **Size/nền:** ~**1024–1536**, **ĐỤC TỐI** (teal-đen), KHÔNG viền/khung/vùng sáng; góc rồng mờ + vân nhẹ thì OK.
- **Prompt:** `a seamless dark background texture, uniform very dark teal-black #0d1420, subtle faint gold filigree threads and fine grain, edge-to-edge dark, NO border NO frame NO light areas, flat low-contrast fill, dark game UI panel background, no text`.

### 3. Nút "Nâng Cấp" vàng — `ui/btn_gold.webp` (+ tùy chọn `ui/btn_gold_press.webp`)
- **Slot:** `.btn-gold` (nền nút). Mình dùng 3-slice ngang để 2 đầu filigree giữ nét khi nút dài/ngắn.
- **Size/nền:** ~**520×132**, **trong suốt**, thân dài ở giữa **để trống cho chữ**.
- **Prompt:** `a horizontal ornate gold Chinese game button plaque, filigree notched ends, small jade gem accents at the tips, polished metallic antique gold, empty flat center for a label, glossy highlight, [style chung]`.
- *`_press`:* như trên nhưng tối hơn / lõm nhẹ / glow yếu (trạng thái nhấn).

### 4. Badge cấp lục giác — `ui/badge_hex.webp`  ✅ ĐÃ WIRE
- **Slot:** `.hexbadge` — lục giác nhỏ cạnh "Cấp hiện tại 1/3", số cấp hiện ĐÈ LÊN GIỮA.
- **Size/nền:** ~**256–500**, **trong suốt**, MỘT lục giác (KHÔNG cánh/banner), giữa để trống (tối + glow ngọc) cho số.
- **Prompt:** `a single compact ornate gold hexagon level badge, thick gold filigree beveled rim, dark inset center with a faint jade-green inner glow, ONLY one hexagon shape, NO side wings, NO banner, NO ribbon, centered, isolated on transparent background, no text, xianxia game UI`.

---

## ƯU TIÊN 2 — ornament & khung phụ  ✅ ĐÃ WIRE HẾT (tassel/tab_active/divider)

### 5. Tua rua treo — `ui/tassel.webp`
- **Slot:** `.tassel` (đáy rail trái). Thay SVG hiện tại.
- **Size/nền:** ~**96×300**, **trong suốt**, dọc.
- **Prompt:** `an ornate hanging Chinese silk tassel, gold cap and a jade bead, long red-and-gold threads, vertical, isolated, [style chung]`.

### 6. Khung tab đang chọn (rail) — `ui/tab_active.webp`
- **Slot:** viền quanh icon tab active (`.nav-item.active .nav-ic`).
- **Size/nền:** ~**128×128**, **trong suốt**, khung vuông bo góc, giữa trống, 4 góc phát sáng.
- **Prompt:** `a glowing ornate gold square frame for an active menu icon, luminous corner ornaments, transparent hollow center, soft amber glow, [style chung]`.

### 7. Divider hoa văn — `ui/divider.webp`
- **Slot:** `.divider` (gạch ngăn dưới tiêu đề).
- **Size/nền:** ~**640×28**, **trong suốt**, ngang, medallion giữa thu nhỏ dần ra 2 bên.
- **Prompt:** `an ornate horizontal gold divider ornament, a small central medallion tapering into thin symmetric filigree lines, isolated, [style chung]`.

### 8. Ornament góc rời — `ui/corner.webp` *(tùy chọn)*
- **Slot:** đắp thêm góc cho panel lớn.
- **Size/nền:** ~**96×96**, **trong suốt**, 1 góc (mình lật 4 phía).
- **Prompt:** `a single ornate gold corner flourish, cloud-and-dragon filigree, L-shaped, isolated, [style chung]`.

---

## ƯU TIÊN 3 — bộ icon  ✅ currency (tái dùng `images/currency/`) + material (5 cũ `images/items/` + 2 mới `thanhNgoa`/`luongMoc`) ĐÃ WIRE · rune hiệu ứng để SVG

> Mỗi icon ~**64×64**, **trong suốt**, 1 vật căn giữa, painterly. Prompt = `a single [X] game item icon, painterly, isolated, [style chung]`.

### 9. Icon vật liệu — `icons/mat_<id>.webp`
| File | Vật | Gợi ý hình |
|---|---|---|
| `mat_thanhngoa` | Thanh Ngõa | chồng ngói men xanh biếc |
| `mat_luongmoc` | Lương Mộc | thanh xà gỗ bào nhẵn nẹp sắt |
| `mat_gach` | Gạch | vài viên gạch xám |
| `mat_khopsat` | Khớp Sắt | khớp/bản lề sắt rèn |
| `mat_vango` | Ván Gỗ | tấm ván gỗ |
| `mat_datset` | Đất Sét | cục đất sét nâu |
| `mat_cat` | Cát | đống cát / bao cát |
| *(sau)* `mat_thachchuyen · mat_tinhthachsong · mat_hanngocchuyen · mat_kimtattru` | (bậc cao) | theo lore ART_DONGPHU §9 |

### 10. Icon tiền tệ — `icons/cur_bac · cur_honthach · cur_nguyenbao` (~48×48)
> **Ưu tiên tái dùng icon tiền tệ SẴN CÓ trong game** nếu đã có (Bạc/Hồn Thạch/Nguyên Bảo) — chỉ gen mới nếu chưa có.

### 11. Icon rune hiệu ứng — `icons/rune_<id>.webp` *(tùy chọn — SVG hiện tại tạm ổn)*
- `rune_idle` (Trần Nhàn Rỗi = đồng hồ cát/trăng) · `rune_unlock` (mở khóa = ổ khóa mở) · `rune_slot` (chỗ công trình = đài/nền) · `rune_assist` (hỗ trợ tuần = bàn tay/thẻ) · `rune_dream` (Mộng Ngân = trăng+xu).

### 12. Icon 3 tab rail — `icons/tab_nhachinh · tab_congtrinh · tab_socongtrinh` (~64×64) *(tùy chọn — SVG tạm ổn)*
- nhà chính = mái nhà · công trình phụ = cụm đài/pavilion · sổ công trình = cuộn thư/sổ.

---

## Vòng lặp làm việc
1. Gen **Ưu Tiên 1** trước (frame + panel_bg + btn_gold + badge_hex) → thả vào `images/dongphu/ui/`.
2. Mình **wire vào bản B** (`border-image`/`background`/`<img>`, có fallback) + **siết form/đồng bộ 3 tab với ảnh thật trước mắt** → verify.
3. Lặp cho Ưu Tiên 2 → 3. Mỗi đợt bạn xem, mình tinh chỉnh (slice, padding, glow) theo asset thật.
> Lý do làm theo đợt: page ornate nặng nên screenshot headless hay timeout → mình chỉnh "mù" chiều thẩm mỹ sẽ dễ hỏng; có ảnh thật + bạn liếc mắt là chuẩn nhất.
