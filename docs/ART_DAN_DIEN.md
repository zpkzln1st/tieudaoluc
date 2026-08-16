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
