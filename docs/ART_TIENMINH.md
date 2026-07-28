# ART — TIÊN MINH (danh sách tài sản cần vẽ)

> Quy ước chung của game: ảnh **.webp**, **commit thẳng** (`images/` KHÔNG ignore).
> Phong cách: tối (ink `#070b14`), nhấn **jade `#14b8a6` / cyan `#22d3ee` / amber-gold `#f5b942`**,
> painterly võ hiệp/huyền huyễn, **glow TĨNH**, ánh trăng + sương núi. **KHÔNG chữ trong ảnh.**
> Tên file = **đúng id công trình trong code** (camelCase, không dấu).

**Thư mục `images/tienminh/` CHƯA tồn tại — tạo mới.**
Code đã cắm sẵn `onerror` cho cả 6 ảnh: thiếu ảnh nào thì ô đó tự rơi về khung sơn mài + chữ Hán,
**thả file vào là chạy, không cần sửa code.**

---

## BẢNG TÀI SẢN

| # | Mục đích | Tên file | Nơi để | Kích thước · nền |
|---|---|---|---|---|
| 1 | **Nền sơn thuỷ** cả màn Công Trình (công trình cắm/kéo thả lên trên) | `nen.webp` | `images/tienminh/` | **2048×1152 (16:9)** · liền, KHÔNG chữ |
| 2 | Tile **Tổng Đàn** | `tongDan.webp` | `images/tienminh/` | **512×384 (4:3)** · nền trong suốt |
| 3 | Tile **Binh Khí Khố** | `binhKhiKho.webp` | `images/tienminh/` | 512×384 · trong suốt |
| 4 | Tile **Tụ Linh Trì** | `tuLinhTri.webp` | `images/tienminh/` | 512×384 · trong suốt |
| 5 | Tile **Minh Khố** | `bangKho.webp` ⚠ | `images/tienminh/` | 512×384 · trong suốt |
| 6 | Tile **Trảm Yêu Đài** | `tramYeuDai.webp` | `images/tienminh/` | 512×384 · trong suốt |

> ⚠ **Minh Khố phải đặt tên file là `bangKho.webp`** — id trong code từ bản cũ là `bangKho`,
> đổi id thì save của ông hỏng. Tên hiển thị đã là "Minh Khố", chỉ tên file giữ nguyên.

---

## 0. TỪ KHOÁ CHUNG — dán vào MỌI prompt

**Bắt buộc có:**
```
painterly xianxia wuxia concept art, dark moody atmosphere, ink black base tones,
jade green and amber gold accents, moonlight and mountain mist, static soft glow,
ultra detailed, masterpiece quality, no text, no watermark, no signature
```

**Negative (tránh):**
```
text, letters, chinese characters, watermark, signature, ui elements, frame border,
modern buildings, western fantasy castle, anime cartoon style, oversaturated,
harsh neon, lens flare, people in foreground, low quality, blurry
```

---

## 1. NỀN SƠN THUỶ — `images/tienminh/nen.webp`

**Kích thước:** 2048×1152 (16:9) · **Nền:** liền, không trong suốt.

⚠ **Bố cục quan trọng — công trình sẽ được cắm/kéo lên ảnh này:**
- **Chừa TRỐNG phần giữa và dưới** (khoảng 60% diện tích) — đó là chỗ đặt công trình.
- Chi tiết nặng dồn về **mép trên và hai bên** (núi, mây, thác).
- Tổng thể **TỐI và trầm**, đừng sáng rực — công trình phải nổi lên trên nó.

> **Mô tả tiếng Việt:** Thung lũng sơn môn về đêm nhìn từ trên cao. Vách núi dựng hai bên, mây
> mù trôi dưới chân, một dòng thác xa bên phải. Nền thung lũng là đất bằng trải sương, lác đác
> nền đá lát cũ và vài gốc tùng — **để trống, chưa có công trình nào**. Trăng lạnh trên cao,
> khí ngọc phất phơ. Không một chữ nào.

```
Empty misty mountain valley floor at night seen from an elevated three-quarter view,
towering cliffs framing the left and right edges, low clouds drifting below,
a distant waterfall on the right edge, cold moonlight from above,
the CENTER AND LOWER SIXTY PERCENT LEFT EMPTY AND UNCLUTTERED - bare stone-paved ground,
scattered old flagstones, a few lone pine trees at the far edges, drifting jade-green qi mist,
NO buildings, NO structures, NO people,
painterly xianxia wuxia concept art, dark moody atmosphere, ink black base tones,
jade green and amber gold accents, static soft glow, ultra detailed, masterpiece quality,
no text, no watermark, 2048x1152 16:9
```

---

## 2. TỔNG ĐÀN — `images/tienminh/tongDan.webp`

Trụ sở, công trình lớn nhất và uy nghi nhất trong bộ. Mái cong, cột đỏ sẫm, đèn lồng vàng.

> **Mô tả tiếng Việt:** Đại điện chính của một thế lực giang hồ — hai tầng mái cong lợp ngói men
> xanh ngọc, cột gỗ đỏ sẫm, bậc đá rộng, hai đèn lồng vàng hai bên cửa, một lá cờ lụa treo trước
> hiên. Nhìn chếch 3/4 từ phía trước. Nền trong suốt.

```
A single grand wuxia sect main hall, two tiered curved roofs with jade-green glazed tiles,
dark crimson wooden pillars, wide stone steps, two warm amber lanterns flanking the entrance,
a plain silk banner hanging under the eaves, front three-quarter view,
isolated on fully transparent background, no ground shadow plate,
painterly xianxia game asset, dark moody palette with jade green and amber gold accents,
static soft glow, ultra detailed, no text, no watermark, 512x384
```

---

## 3. BINH KHÍ KHỐ — `images/tienminh/binhKhiKho.webp`

Kho binh khí + lò rèn. Chất **sắt, lửa cam**, thô ráp hơn Tổng Đàn.

> **Mô tả tiếng Việt:** Nhà kho binh khí một tầng, tường đá xám, mái ngói sẫm, cửa gỗ bọc đai
> sắt mở hé lộ giá đao kiếm bên trong, một lò rèn nhỏ bên hông còn than đỏ, đe sắt và búa.
> Nhìn chếch 3/4. Nền trong suốt.

```
A single wuxia sect armoury building, one storey, grey stone walls, dark tiled roof,
iron-banded wooden doors ajar revealing racks of swords and sabers inside,
a small forge on the side with glowing orange embers, an anvil and hammer,
front three-quarter view, isolated on fully transparent background, no ground shadow plate,
painterly xianxia game asset, dark moody palette, iron grey with ember orange and amber gold accents,
static soft glow, ultra detailed, no text, no watermark, 512x384
```

---

## 4. TỤ LINH TRÌ — `images/tienminh/tuLinhTri.webp`

Ao tụ linh khí. Đây là cái **sáng nhất** bộ — dùng jade/cyan làm chủ đạo.

> **Mô tả tiếng Việt:** Ao đá tròn chứa nước phát sáng xanh ngọc, viền đá chạm khắc vân mây,
> bốn trụ đá thấp quanh ao, hơi linh khí bốc lên xoáy nhẹ, một cầu đá nhỏ bắc qua mép ao.
> Không có mái. Nhìn chếch 3/4 từ trên xuống. Nền trong suốt.

```
A single circular stone spirit pool filled with glowing jade-green water,
carved cloud-motif stone rim, four short stone pillars around the edge,
soft luminous qi vapour rising and swirling gently above the surface,
a small stone bridge crossing one edge, no roof,
elevated front three-quarter view, isolated on fully transparent background, no ground shadow plate,
painterly xianxia game asset, jade green and cyan luminance against dark stone,
static soft glow, ultra detailed, no text, no watermark, 512x384
```

---

## 5. MINH KHỐ — `images/tienminh/bangKho.webp`

Kho chung. Chất **chắc nịch, kín, có khoá** — đối lập với Tụ Linh Trì.

> **Mô tả tiếng Việt:** Nhà kho vuông vức, tường đá dày không cửa sổ, mái ngói thấp, một cửa
> gỗ lớn đóng kín có khoá đồng và đai sắt, vài rương gỗ bọc đồng xếp bên ngoài, một cây đèn
> lồng nhỏ treo cạnh cửa. Nhìn chếch 3/4. Nền trong suốt.

```
A single squat wuxia sect treasury vault, thick windowless stone walls, low tiled roof,
one large closed wooden door with a heavy bronze lock and iron bands,
a few brass-bound wooden chests stacked outside, one small lantern beside the door,
front three-quarter view, isolated on fully transparent background, no ground shadow plate,
painterly xianxia game asset, dark stone and aged bronze with amber gold accents,
static soft glow, ultra detailed, no text, no watermark, 512x384
```

---

## 6. TRẢM YÊU ĐÀI — `images/tienminh/tramYeuDai.webp`

Đài triệu Yêu Vương. Cái **dữ nhất** bộ — dùng đỏ rose `#fb7185` làm nhấn thay vì vàng.

> **Mô tả tiếng Việt:** Đài đá tròn cao, bậc thang dẫn lên, giữa đài cắm một thanh trảm yêu đao
> khổng lồ ghim xuống nền đá, quanh chân đao là vòng phù văn khắc đang phát sáng đỏ mờ, bốn cột
> đá thấp buộc xích sắt, khói đen là đà. Nhìn chếch 3/4. Nền trong suốt.

```
A single raised circular stone execution altar, steps leading up one side,
a colossal demon-slaying blade driven point-down into the centre of the platform,
a ring of carved warding sigils around the blade glowing dim blood-red,
four short stone posts strung with heavy iron chains, low black smoke curling across the floor,
front three-quarter view, isolated on fully transparent background, no ground shadow plate,
painterly xianxia game asset, dark stone with blood-red sigil glow and cold steel,
static soft glow, ultra detailed, no text, no watermark, 512x384
```

---

## GHI CHÚ KHI TẠO

1. **Nền trong suốt cho 5 tile** — xuất PNG có alpha rồi chuyển webp. Nếu công cụ không xuất
   alpha được thì để **nền đen tuyền `#070b14`**, tôi sẽ đổi code sang chế độ hoà nền.
2. **Đừng vẽ bóng đổ xuống đất** trong tile — công trình sẽ đứng trên nền sơn thuỷ, bóng vẽ sẵn
   sẽ chỏi với hướng sáng của nền.
3. **Cùng góc nhìn cho cả 5 tile** (chếch 3/4 từ phía trước, hơi cao) — khác góc là đặt cạnh
   nhau nhìn lệch ngay.
4. **Cùng nguồn sáng**: ánh trăng từ trên xuống hơi chếch trái, đèn/lửa là nguồn phụ ấm.
5. Tỉ lệ to nhỏ giữa các công trình cứ vẽ **đầy khung 512×384** — code lo việc thu nhỏ.

---

# ⚠ BẢN NÀY ĐÃ NGƯNG DÙNG (2026-07-28)

Đã làm art theo bản này rồi **bỏ**: thu nhỏ xuống cỡ tile (76-112px) thì công trình thành mấy
vệt mờ, lại thêm ba tấm lệch khuôn (1536×1024 vs 1024×1024, vùng trong suốt chừa 0-22%) nên
đặt cạnh nhau to nhỏ không đều. Nhìn tệ hơn hẳn chữ khắc.

**Nay công trình là BẢN KHẮC CHỮ** — `TILE_KHAC` trong `src/data/bangphai.js`. Không cần art.

Nếu sau này muốn quay lại art thì đọc kỹ hai chỗ đã sai:
1. **Cùng khuôn tuyệt đối** — cùng tỉ lệ ảnh VÀ cùng lề trong suốt, nếu không phải bù hệ số
   phóng từng tấm (đã thử, đo được vùng công trình chiếm 64%-90% chiều cao khung).
2. **Vẽ cho cỡ hiển thị thật** (76-112px), đừng vẽ chi tiết 1536px rồi thu nhỏ.

Nền `images/tienminh/nen.webp` thì **vẫn dùng được** nếu muốn — code còn nhận, thiếu file thì
tự rơi về nền vẽ bằng CSS (sương núi + ánh trăng).
