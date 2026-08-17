# Prompt Art — ĐAN ĐIỀN (Tinh · Khí · Thần)

> Đi kèm [THIET_KE_DAN_DIEN.md](THIET_KE_DAN_DIEN.md). **27 prompt** cho 27 viên đan.
> Hiện game đang **MƯỢN** 9 ảnh đan sẵn có (`DD_ART_MUON` trong `src/data/dandien.js`).
> Thả đủ 27 tệp thật vào `images/items/` rồi xoá bảng mượn đó là xong, không phải sửa code.

## Đọc trước khi gen

- **Chốt tên → ráp data → GEN ẢNH.** Tên tệp phải khớp chính xác `id` camelCase. GitHub Pages
  **phân biệt hoa/thường** — gen trước rồi đổi tên sau là ảnh vỡ im lặng trên bản live.
- Tên tệp lấy từ `ddItemId()`: `ddTinh1` … `ddTinh9` · `ddKhi1` … `ddKhi9` · `ddThan1` … `ddThan9`.
  Tất cả vào `images/items/`.
- **Nền trong suốt**, vuông 244×244, giống mọi ảnh khác trong `images/items/`.
- ⚠⚠ **PHÂN BIỆT BẰNG HÌNH DẠNG, KHÔNG CHỈ ĐỔI MÀU.** Ô 244px đọc được hình, không đọc được sắc
  độ. Chín phẩm = chín kiểu dáng khác hẳn nhau; ba nhánh phân biệt bằng **loại khí bốc lên** và
  màu lõi. Người chơi phải nhìn ô 34px trong lưới mà vẫn đoán ra phẩm.
- Ba nhánh, ba chất khí — giữ đúng để không lẫn:
  - **Tinh** (thân thể) — đỏ chu sa, viền vàng ấm, khí đặc và nặng như hơi máu ấm.
  - **Khí** (nội công) — lam thanh, viền bạc lạnh, khí xoáy thành lốc mảnh.
  - **Thần** (thần thức) — tím thạch anh, viền trắng ngà, khí là bụi sao trôi chậm.
- Chín bậc dáng, dùng chung cho cả ba nhánh (đây là thứ nói lên PHẨM):
  1 viên trơn · 2 có vành khắc · 3 ba núm nổi · 4 nằm trên đài sen · 5 vỏ tinh thể có mặt cắt ·
  6 lồng kim loại chạm thủng · 7 có vành mảnh vỡ bay quanh · 8 nứt đôi lộ lõi sáng ·
  9 như tiểu nhật, hào quang tròn và dải lụa khí.

---

STYLE CHUNG: Wuxia xianxia game art, semi-realistic painterly digital illustration blended with Chinese ink-wash sensibility, ultra detailed high-quality rendering, soft diffuse studio light from the upper left, restrained saturation with no neon, clean readable silhouette that stays legible at small icon size, square 1:1 composition (244x244), no text, no watermark, no signature, no logo, no border, no frame, no UI element. Negative prompt: text, watermark, signature, logo, modern objects, blurry, lowres, extra limbs, deformed hands, cartoonish, oversaturated neon colors, cluttered messy background —

---

## NHÁNH TINH — thân thể (đỏ chu sa, khí đặc và ấm)

[ddTinh1] Tinh Đan · Nhất Phẩm -> images/items/ddTinh1.webp
a single small alchemical pill floating on a FULLY TRANSPARENT background (alpha channel, absolutely no backdrop, no vignette, no ground plane), the pill centred and filling about 70% of the frame: a plain smooth cinnabar-red sphere with a soft waxy sheen and one gentle highlight on its upper left, the surface faintly mottled like polished red jade, a very thin warm-gold rim-light tracing its silhouette, and a single slow curl of dense warm red vapour rising from its crown; humble and unadorned, the first rung of the ladder; only a very faint soft contact shadow beneath it

[ddTinh2] Tinh Đan · Nhị Phẩm -> images/items/ddTinh2.webp
a single alchemical pill floating on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 70% of the frame: a cinnabar-red sphere encircled at its equator by a single carved band of antique bronze incised with a plain repeating wave motif, the red body glossy above and below the band, warm gold rim-light along the silhouette, two thin ribbons of dense warm red vapour twisting upward from opposite sides of the band; slightly more crafted than a plain pill but still modest

[ddTinh3] Tinh Đan · Tam Phẩm -> images/items/ddTinh3.webp
a single alchemical pill floating on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 72% of the frame: a deep cinnabar-red sphere with three raised rounded nodules spaced evenly around its upper hemisphere like a trefoil, each nodule capped with a bead of darker garnet, the body surface showing fine swirling grain like blood-red agate, warm gold rim-light, three separate threads of heavy red vapour rising one from each nodule and braiding together above

[ddTinh4] Tinh Đan · Tứ Phẩm -> images/items/ddTinh4.webp
a single alchemical pill resting in an open blossom on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 78% of the frame: a glossy cinnabar-red sphere cradled in a small open lotus base of pale bronze petals, each petal edge thin enough to catch a warm highlight, the pill sitting slightly above the petal cup as if buoyed by its own heat, warm gold rim-light on both pill and petals, a broad low plume of dense warm red vapour pooling in the petal cup and spilling over its lip

[ddTinh5] Tinh Đan · Ngũ Phẩm -> images/items/ddTinh5.webp
a single alchemical pill floating on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 74% of the frame: a faceted crystalline pill of deep cinnabar red, its surface cut into broad irregular gem facets that each catch the light at a different angle, a molten brighter core visible dimly through the translucent shell, warm gold rim-light picking out every facet edge, thin sharp streamers of hot red vapour venting from the seams between facets

[ddTinh6] Tinh Đan · Lục Phẩm -> images/items/ddTinh6.webp
a single alchemical pill suspended inside a cage on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 80% of the frame: a glowing cinnabar-red sphere floating at the centre of an openwork orb of dark bronze, the cage formed of pierced interlacing bands cut with cloud-scroll fretwork, the pill visibly not touching the metal, warm gold rim-light along every band, dense red vapour seeping out through the fretwork openings in slow heavy ribbons

[ddTinh7] Tinh Đan · Thất Phẩm -> images/items/ddTinh7.webp
a single alchemical pill with an orbiting ring on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 82% of the frame: a brilliant cinnabar-red sphere with a flat ring of small broken crystal shards orbiting its equator, the shards graded from large to fine and lit from within, faint motion arcs implying slow rotation without any blur, warm gold rim-light, heavy red vapour drawn outward into the ring plane and trailing behind the shards

[ddTinh8] Tinh Đan · Bát Phẩm -> images/items/ddTinh8.webp
a single alchemical pill cracked open on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 82% of the frame: a cinnabar-red sphere split cleanly into two halves held slightly apart in mid-air, a fiercely glowing molten core of white-hot crimson suspended in the gap between them, the inner faces of both halves lit orange by that core, hairline fractures spidering across the outer shell, warm gold rim-light, a violent upward jet of red vapour escaping from the split

[ddTinh9] Tinh Đan · Cửu Phẩm -> images/items/ddTinh9.webp
a supreme alchemical relic on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 88% of the frame: a small sun of cinnabar red, its core a dense incandescent bead ringed by a perfect flat halo disc of hammered gold incised with seal-script cloud patterns, four long ribbons of glowing red qi streaming outward and curling like silk in still air, the whole object radiating a soft warm bloom without any lens flare, gold rim-light doubled by a second cooler highlight from below; unmistakably the summit of the ladder

---

## NHÁNH KHÍ — nội công (lam thanh, khí xoáy thành lốc)

[ddKhi1] Khí Đan · Nhất Phẩm -> images/items/ddKhi1.webp
a single small alchemical pill floating on a FULLY TRANSPARENT background (alpha channel, absolutely no backdrop, no vignette, no ground plane), centred and filling about 70% of the frame: a plain smooth azure-blue sphere with a cool glassy sheen and one crisp highlight on its upper left, the surface faintly clouded like frosted lapis, a very thin cold-silver rim-light tracing its silhouette, and a single thin wisp of pale blue vapour spiralling up from its crown; humble and unadorned, the first rung of the ladder; only a very faint soft contact shadow beneath it

[ddKhi2] Khí Đan · Nhị Phẩm -> images/items/ddKhi2.webp
a single alchemical pill floating on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 70% of the frame: an azure-blue sphere encircled at its equator by a single carved band of pale silver incised with a plain repeating wave motif, the blue body glassy above and below the band, cold silver rim-light along the silhouette, two thin spirals of pale blue vapour winding upward from opposite sides of the band in opposite directions

[ddKhi3] Khí Đan · Tam Phẩm -> images/items/ddKhi3.webp
a single alchemical pill floating on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 72% of the frame: a deep azure sphere with three raised rounded nodules spaced evenly around its upper hemisphere like a trefoil, each nodule capped with a bead of clear ice-white crystal, the body showing fine swirling grain like water caught in glass, cold silver rim-light, three thin vortices of blue vapour rising one from each nodule and twisting into a single braided column above

[ddKhi4] Khí Đan · Tứ Phẩm -> images/items/ddKhi4.webp
a single alchemical pill resting in an open blossom on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 78% of the frame: a glassy azure sphere cradled in a small open lotus base of pale silver petals with frost-blue edges, the pill hovering a fingerwidth above the petal cup, cold silver rim-light on both pill and petals, a slow flat whirlpool of pale blue vapour rotating inside the petal cup and spilling over its lip in a thin curling sheet

[ddKhi5] Khí Đan · Ngũ Phẩm -> images/items/ddKhi5.webp
a single alchemical pill floating on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 74% of the frame: a faceted crystalline pill of deep azure, its surface cut into broad irregular gem facets that refract the light into pale cyan, a swirling luminous core visible through the translucent shell like weather trapped in glass, cold silver rim-light picking out every facet edge, fine jets of blue vapour whistling out from the seams between facets

[ddKhi6] Khí Đan · Lục Phẩm -> images/items/ddKhi6.webp
a single alchemical pill suspended inside a cage on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 80% of the frame: a glowing azure sphere floating at the centre of an openwork orb of tarnished silver, the cage formed of pierced interlacing bands cut with running-water fretwork, the pill clearly not touching the metal, cold silver rim-light along every band, pale blue vapour drawn out through the fretwork in thin spiralling threads that orbit the cage

[ddKhi7] Khí Đan · Thất Phẩm -> images/items/ddKhi7.webp
a single alchemical pill with an orbiting ring on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 82% of the frame: a brilliant azure sphere with a flat ring of small broken ice-crystal shards orbiting its equator, the shards graded from large to fine and lit from within by cold cyan light, faint motion arcs implying slow rotation without any blur, cold silver rim-light, blue vapour dragged outward into the ring plane and trailing in long thin streamers

[ddKhi8] Khí Đan · Bát Phẩm -> images/items/ddKhi8.webp
a single alchemical pill cracked open on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 82% of the frame: an azure sphere split cleanly into two halves held slightly apart in mid-air, a fiercely bright core of white-blue light suspended in the gap, the inner faces of both halves lit pale cyan by that core, hairline fractures spidering across the outer shell, cold silver rim-light, a sharp upward cyclone of blue vapour tearing out of the split

[ddKhi9] Khí Đan · Cửu Phẩm -> images/items/ddKhi9.webp
a supreme alchemical relic on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 88% of the frame: a small storm-heart of azure, its core a dense incandescent blue bead ringed by a perfect flat halo disc of polished silver incised with seal-script wave patterns, four long ribbons of glowing cyan qi streaming outward and curling like silk in still air, the whole object radiating a soft cold bloom without any lens flare, silver rim-light doubled by a second warmer highlight from below; unmistakably the summit of the ladder

---

## NHÁNH THẦN — thần thức (tím thạch anh, khí là bụi sao)

[ddThan1] Thần Đan · Nhất Phẩm -> images/items/ddThan1.webp
a single small alchemical pill floating on a FULLY TRANSPARENT background (alpha channel, absolutely no backdrop, no vignette, no ground plane), centred and filling about 70% of the frame: a plain smooth amethyst-violet sphere with a soft pearlescent sheen and one diffuse highlight on its upper left, the surface faintly nebulous as if holding a thin mist inside, a very thin pale ivory rim-light tracing its silhouette, and a few slow motes of pale violet light drifting upward from its crown like dust in a sunbeam; humble and unadorned, the first rung of the ladder; only a very faint soft contact shadow beneath it

[ddThan2] Thần Đan · Nhị Phẩm -> images/items/ddThan2.webp
a single alchemical pill floating on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 70% of the frame: an amethyst-violet sphere encircled at its equator by a single carved band of pale ivory bone incised with a plain repeating wave motif, the violet body pearlescent above and below the band, ivory rim-light along the silhouette, two slow trails of pale violet motes lifting from opposite sides of the band and fanning apart

[ddThan3] Thần Đan · Tam Phẩm -> images/items/ddThan3.webp
a single alchemical pill floating on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 72% of the frame: a deep amethyst sphere with three raised rounded nodules spaced evenly around its upper hemisphere like a trefoil, each nodule capped with a bead of milky moonstone, the body showing fine drifting grain like a nebula sealed in quartz, ivory rim-light, three slow columns of violet motes rising one from each nodule and converging into a faint spiral above

[ddThan4] Thần Đan · Tứ Phẩm -> images/items/ddThan4.webp
a single alchemical pill resting in an open blossom on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 78% of the frame: a pearlescent amethyst sphere cradled in a small open lotus base of ivory petals with faint violet veining, the pill hovering a fingerwidth above the petal cup, ivory rim-light on both pill and petals, a slow drift of violet motes welling up inside the petal cup and spilling over its lip like fine luminous sand

[ddThan5] Thần Đan · Ngũ Phẩm -> images/items/ddThan5.webp
a single alchemical pill floating on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 74% of the frame: a faceted crystalline pill of deep amethyst, its surface cut into broad irregular gem facets that scatter the light into lilac and pale gold, a slowly turning luminous core visible through the translucent shell like a distant star, ivory rim-light picking out every facet edge, thin veils of violet motes escaping from the seams between facets

[ddThan6] Thần Đan · Lục Phẩm -> images/items/ddThan6.webp
a single alchemical pill suspended inside a cage on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 80% of the frame: a glowing amethyst sphere floating at the centre of an openwork orb of pale bone-white metal, the cage formed of pierced interlacing bands cut with constellation fretwork, the pill clearly not touching the metal, ivory rim-light along every band, violet motes sifting out through the fretwork openings and hanging suspended around the cage

[ddThan7] Thần Đan · Thất Phẩm -> images/items/ddThan7.webp
a single alchemical pill with an orbiting ring on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 82% of the frame: a brilliant amethyst sphere with a flat ring of small broken moonstone shards orbiting its equator, the shards graded from large to fine and each glowing faintly from within, faint motion arcs implying slow rotation without any blur, ivory rim-light, violet motes drawn outward into the ring plane and trailing behind the shards like a comet veil

[ddThan8] Thần Đan · Bát Phẩm -> images/items/ddThan8.webp
a single alchemical pill cracked open on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 82% of the frame: an amethyst sphere split cleanly into two halves held slightly apart in mid-air, a serene brilliant core of white-violet starlight suspended in the gap, the inner faces of both halves lit lilac by that core, hairline fractures spidering across the outer shell, ivory rim-light, a slow silent bloom of violet motes pouring upward out of the split

[ddThan9] Thần Đan · Cửu Phẩm -> images/items/ddThan9.webp
a supreme alchemical relic on a FULLY TRANSPARENT background (alpha channel, no backdrop, no vignette, no ground plane), centred and filling about 88% of the frame: a small captured star of amethyst violet, its core a dense luminous bead ringed by a perfect flat halo disc of pale bone-white incised with seal-script constellation patterns, four long ribbons of glowing violet qi streaming outward and curling like silk in still air, a faint field of suspended motes held in orbit around the whole object, radiating a soft cool bloom without any lens flare, ivory rim-light doubled by a second faint gold highlight from below; unmistakably the summit of the ladder

---

# PHẦN HAI — BA BIỂU TƯỢNG CÒN THIẾU (2026-08-17)

27 viên đan đã có art thật, `DD_ART_THAT` đã bật cho cả ba nhánh. Còn **ba chỗ** đang lấy chữ Hán
hoặc mượn art đan làm biểu tượng:

| chỗ | đang dùng gì | tệp cần vẽ |
|---|---|---|
| Huy hiệu Đan Hồn (9 cái trong lưới, ô 34px) | chữ Hán `魂` gõ thẳng | `images/items/danHon.webp` |
| Nút mở Đan Điền (đè chân dung, ô 44px) | mượn art `hoiKhiDan` | `images/items/cuaDanDien.webp` |
| Nút mở bảng Luyện (đè chân dung, ô 44px) | mượn art `bachBaoDan` | `images/items/cuaLuyenDan.webp` |

## Đọc trước khi gen

- Vuông **500×500**, **nền trong suốt**, WebP — giống 27 viên vừa xong.
- ⚠ **Ba tấm này phải KHÁC HẲN viên đan.** Chúng đứng ngay cạnh đan trong cùng một khung; vẽ ra
  quả cầu tròn nữa là lẫn. Đan Hồn dùng dáng **ngọn lửa hồn**, hai nút cửa dùng dáng **lò** và
  **đài sen kép**.
- ⚠ `danHon` có HAI trạng thái: đã mở và chưa mở. **Chỉ vẽ MỘT tấm — bản đã mở.** Bản chưa mở tôi
  xử lý bằng CSS (xám + mờ), không cần tệp thứ hai.
- ⚠ `danHon` hiện ở ô **34px**, nhỏ nhất trong ba tấm. Bóng phải đọc được ở cỡ đó: một khối chính,
  không chi tiết vụn.
- Hai nút cửa nằm trên nền đen có viền sáng sẵn (tím cho Đan Điền, lam cho Luyện) nên **đừng vẽ
  thêm khung hay viền**.

---

STYLE CHUNG: Wuxia xianxia game art, semi-realistic painterly digital illustration blended with Chinese ink-wash sensibility, ultra detailed high-quality rendering, soft diffuse studio light from the upper left, restrained saturation with no neon, clean readable silhouette that stays legible at small icon size, square 1:1 composition (500x500), no text, no watermark, no signature, no logo, no border, no frame, no UI element. Negative prompt: text, watermark, signature, logo, modern objects, blurry, lowres, extra limbs, deformed hands, cartoonish, oversaturated neon colors, cluttered messy background —

---

[danHon] Huy hiệu Đan Hồn -> images/items/danHon.webp
a single soul-flame emblem on a FULLY TRANSPARENT background (alpha channel, absolutely no backdrop, no vignette, no ground plane), centred and filling about 80% of the frame: a teardrop-shaped flame of pale gold spirit-fire burning upright and perfectly still, its outline crisp and calligraphic like a single confident brush stroke, the flame's heart a warm white core that fades to antique gold at the tips, wrapped at its waist by a thin open ring of dark bronze incised with a plain seal-script fret, two small motes of gold light hovering just clear of the flame's tip; the whole silhouette one solid readable shape with no thin wisps and no scattered sparks, so it stays legible when shrunk to a 34 pixel badge

[cuaDanDien] Cửa vào Đan Điền -> images/items/cuaDanDien.webp
a single alchemy vessel on a FULLY TRANSPARENT background (alpha channel, absolutely no backdrop, no vignette, no ground plane), centred and filling about 84% of the frame: a small squat three-legged bronze cauldron seen slightly from above, its shoulder banded with a plain incised meander and its rim turned outward, the vessel's dark patinated bronze catching a thin warm rim-light; rising out of the open mouth a single compact bloom of violet qi that gathers into one small luminous bead hovering a fingerwidth above the rim, the qi kept short and dense so it never leaves the cauldron's outline; grounded solid and heavy, an object a person could lift with both hands

[cuaLuyenDan] Cửa vào bảng Luyện -> images/items/cuaLuyenDan.webp
a single refining furnace on a FULLY TRANSPARENT background (alpha channel, absolutely no backdrop, no vignette, no ground plane), centred and filling about 84% of the frame: a tall narrow bronze pill-furnace with a domed pierced lid and a stepped foot, its body divided by three vertical ribs, the metal a cool dark bronze with a thin silver-blue rim-light down the left edge; through the pierced lid a bright cold blue-white forge-light glows from within, and three short tongues of that same cold light escape the vents and curl upward, each tongue tinted a different hue — one warm red, one cool blue, one pale violet; the three colours read clearly as three separate flames without touching each other

---

# PHẦN BA — NỀN DƯỢC PHƯƠNG (2026-08-17)

Dược Phương là công thức nấu đan ở Dược Lư. Nó cần **nền riêng**, y như Đồ Phổ trang bị đã có
(`dopho_23` · `dopho_45` · `dopho_6` · `dopho_7` · `dopho_chieu`, đều 500×500, 34–40 KB).

## ⚠⚠ GAME LỒNG MỘT Ô VUÔNG VÀO GIỮA TẤM

Đây là điều quan trọng nhất, vòng đầu tôi viết prompt thiếu nó nên art ra sai.

Hàm `ico()` trong `src/main.js` vẽ hai lớp: **nền phủ kín khung**, rồi **một ô vuông đè lên giữa**
chứa art viên đan. Ô đó nền gần như đen (`#070908`), bo góc, có viền theo phẩm chất, và:

| số đo | giá trị |
|---|---|
| tâm ô | 50% ngang · 49% dọc |
| bề rộng · bề cao | **44% × 44%** khung |
| bo góc | 14% |

⇒ **Nguyên vùng vuông giữa tấm, rộng gần một nửa khung, sẽ BỊ CHE HOÀN TOÀN.** Vẽ gì ở đó cũng
mất. Dây buộc vắt ngang giữa cũng mất, mà nhìn ra như dây bị cắt đứt.

## Vòng đầu sai thế nào

Prompt cũ tả "tờ giấy thuốc **gấp**, buộc dây gai ngang thân". Art ra một **gói giấy gấp kín**, nút
dây nằm đúng giữa. Không lồng viên đan vào được: chỗ đó không phải mặt phẳng, và cái gói đóng kín
thì không đọc ra "công thức".

Xem lại `dopho_45.webp` mới thấy cách nhà đã giải: **cuộn ĐÃ MỞ**, hai trục gỗ trên dưới, mặt
cuộn là một khoảng tranh nhạt, mọi hoa văn dồn ra RÌA, giữa để trơn.

## Đọc trước khi gen

- Vuông **500×500**, **nền trong suốt**, WebP, khoảng 30–45 KB.
- **Vật ở dạng MỞ, mặt phẳng hướng thẳng vào người xem.** Không gấp, không cuộn lại, không buộc kín.
- **Vùng vuông giữa tấm (44% khung) phải trơn tuyệt đối.** Không hoa văn, không dây, không chữ,
  không vệt mực. Mọi thứ vẽ thêm dồn ra bốn rìa và bốn góc.
- ⚠⚠ **PHẢI KHÁC HẲN CUỘN ĐỒ PHỔ** — hai thứ đứng cạnh nhau trong cùng lưới Hành Lý, ô chỉ 34px.
  Đồ Phổ có **hai thanh trục gỗ nằm ngang trên và dưới**; Dược Phương **KHÔNG có trục**, thay bằng
  **mép giấy rách tự nhiên** và một cái kẹp gỗ ở cạnh trên. Bóng phải khác nhau ở cỡ 34px.
- **Đơn sắc, nhạt.** Nền càng nhạt thì viên đan lồng vào càng nổi. Đừng dùng màu bão hoà.
- ⚠ **KHÔNG viết chữ.** Nét bút chỉ được là nguệch ngoạc vô nghĩa, không thành chữ Hán đọc được.
- Ba bậc phân biệt bằng **chất liệu**, không chỉ bằng màu: giấy dó thô → giấy mịn viền lụa →
  lụa gấm có triện sáp.

---

STYLE CHUNG: Wuxia xianxia game art, semi-realistic painterly digital illustration blended with Chinese ink-wash sensibility, ultra detailed high-quality rendering, soft diffuse studio light from the upper left, restrained saturation with no neon, clean readable silhouette that stays legible at small icon size, square 1:1 composition (500x500), no text, no watermark, no signature, no logo, no border, no frame, no UI element. Negative prompt: text, watermark, signature, logo, readable characters, calligraphy that forms real words, folded paper, rolled up, closed packet, cord across the middle, ornament in the centre, modern objects, blurry, lowres, cartoonish, oversaturated neon colors, cluttered messy background —

---

[duocphuong_12] Nền Dược Phương bậc thấp -> images/items/duocphuong_12.webp
a single OPEN apothecary recipe sheet lying flat and facing the viewer on a FULLY TRANSPARENT background (alpha channel, absolutely no backdrop, no vignette, no ground plane), the sheet centred upright and filling about 88% of the frame: a portrait sheet of coarse buff mulberry paper with visible fibre flecks and softly torn deckled edges, held at the top edge by a small plain wooden clip; the decoration sits ONLY around the outer border — a faint sepia ink sprig of dried herbs climbing the left margin, a small mortar and pestle sketched at the bottom left corner, a few scattered dried leaf fragments at the bottom right corner, three tiny ink tally marks in the top right corner; the ENTIRE CENTRE of the sheet is bare blank paper, a wide clean empty square area with absolutely nothing on it — no ink, no cord, no ornament, no shading beyond the paper grain; the whole image monochrome warm sepia and very pale, soft light from the upper left, a thin warm rim-light along the torn edges

[duocphuong_34] Nền Dược Phương bậc giữa -> images/items/duocphuong_34.webp
a single OPEN apothecary recipe sheet lying flat and facing the viewer on a FULLY TRANSPARENT background (alpha channel, absolutely no backdrop, no vignette, no ground plane), the sheet centred upright and filling about 88% of the frame: a portrait sheet of fine pale ivory paper, both long edges bound with a narrow band of muted indigo silk, the top edge held by a slim brass clip; the decoration sits ONLY around the outer border — a faint indigo ink drawing of a hanging herb bundle down the left margin, a small brass apothecary balance sketched at the bottom left corner, a coiled ginseng root at the bottom right corner, a row of small measuring marks along the inner edge of the left silk band; the ENTIRE CENTRE of the sheet is bare blank paper, a wide clean empty square area with absolutely nothing on it — no ink, no clasp, no ornament; the whole image monochrome pale indigo-green and low contrast, soft light from the upper left, cool silver rim-light along the silk bands

[duocphuong_5] Nền Dược Phương bậc cao -> images/items/duocphuong_5.webp
a single OPEN apothecary recipe panel lying flat and facing the viewer on a FULLY TRANSPARENT background (alpha channel, absolutely no backdrop, no vignette, no ground plane), the panel centred upright and filling about 90% of the frame: a portrait panel of lustrous pale gold brocade silk woven with a faint cloud-scroll damask that catches the light only at the very edges, the top edge held by a slender dark lacquered wooden clip; the decoration sits ONLY around the outer border — a faint gold ink drawing of a three-legged pill furnace at the bottom left corner, a spray of spirit-herb leaves climbing the right margin, a round crimson wax seal pressed into the bottom right CORNER well clear of the middle, a thin thread of pale golden vapour curling along the top edge; the ENTIRE CENTRE of the panel is bare blank silk, a wide clean empty square area with absolutely nothing on it — no pattern, no ink, no ornament; the whole image monochrome pale gold on ivory, soft light from the upper left, warm gold rim-light
