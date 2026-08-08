# ART — HỆ SỰ KIỆN (sáu sự kiện)

Đi kèm `docs/THIET_KE_SU_KIEN.md`.

**Mỗi khối dưới đây là MỘT ảnh hoàn chỉnh.** Chép nguyên dòng trong ô mã, dán vào máy vẽ,
lưu ra đúng đường dẫn ghi ở tiêu đề. Không phải ghép khối STYLE nào nữa.

⚠ **Tên tệp và thư mục là BẮT BUỘC.** Game phân giải icon theo `ICON_FOLDERS[id]`; đặt sai chỗ
là art có trong kho mà ô vẫn trống. Hai chỗ dễ nhầm nhất:
- **Chân dung Yêu Vương nằm ở `images/items/`**, KHÔNG phải `images/enemies/` — Yêu Vương không
  nằm trong bảng `ENEMIES` nên rơi về thư mục mặc định `items`.
- **Linh Thú cần 4 tệp**: `pet_<base>_base` · `pet_<base>_awk` · `skill_<base>_p` · `skill_<base>_a`.

Định dạng `.webp` cho mọi tệp. Nền: **trong suốt** với icon/chân dung/Linh Thú, có cảnh với
nền bản đồ · bìa Bí Cảnh · ảnh bìa hồ sơ.

| | số tệp |
|---|---|
| Mỗi sự kiện | **29** |
| Sáu sự kiện | 174 |
| Dùng chung (không nhân sáu) | 3 |
| **TỔNG** | **177** |

Tiến độ: Tết 29/29 · Mùa Xuân 0/29 · Đoan Ngọ 0/29 · Vu Lan 0/29 · Trung Thu 0/29 · Giáng Sinh 0/29

---

# 0 · BA TỆP DÙNG CHUNG

#### `images/nav/suKien.webp`
**Icon mục Sự Kiện ở thanh điều hướng** · *vuông ~256×256*  
Đứng cạnh 26 icon nav khác — cùng cỡ, cùng độ đậm.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a red festival lantern and a gold ceremonial banner crossed behind it, compact emblem silhouette, readable at 28 pixels
```

#### `images/currency/diemSuKien.webp`
**Điểm Sự Kiện** · *vuông ~256×256*  
Tiền chung của cả sáu sự kiện.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a round festival token coin of warm gold, an auspicious knot pattern stamped on its face, a red silk tassel threaded through the square center hole, faint warm glow
```

#### `images/ui/dauSuKien.webp`
**Dấu "sự kiện đang mở"** · *vuông ~256×256*  
Treo góc trên phải hòn đảo sự kiện trên bản đồ thế giới.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a small red festival lantern hanging from a curved gold hook, gently glowing from within, a tiny banner ribbon beneath it
```

---

# 1 · SỰ KIỆN TẾT — Trường Xuân Miếu Hội

> Đêm giao thừa, sân miếu mở hội — pháo nổ, mai vàng, và một con Niên đang xuống núi.
>
> Tông màu chủ đạo `#f87171` — sáu bộ phải khác tông rõ rệt để nhìn là biết đang ở sự kiện nào.

#### `images/locations/truongXuanMieuHoi.webp`
**Trường Xuân Miếu Hội** · *ngang rộng ~1600×900*  
Nền bản đồ của vùng sự kiện.  
```
Wuxia xianxia landscape key art, wide cinematic panorama, semi-realistic painterly digital art, rich atmospheric depth, dramatic natural lighting, no characters in foreground, no text, no border, no watermark — a Lunar New Year temple fair courtyard at midnight, rows of red paper lanterns strung overhead, a tall bamboo new-year pole with streamers, spent red firecracker paper carpeting the flagstones, yellow apricot and pink peach blossom branches against an old brick wall, incense smoke drifting, warm red-and-gold glow against deep blue night
```

#### `images/skills/thaiPhuc.webp`
**Thái Phúc** · *vuông ~256×256*  
Hái phúc lộc đầu năm  
```
Game skill icon, single emblematic object centered in frame, semi-realistic painterly digital art, soft rim light, dark neutral background, clean silhouette readable at small size, no text, no border — a pair of hands gathering red paper fortune slips and a sprig of yellow apricot blossom, warm gold light between the fingers
```

#### `images/items/xacPhaoDo.webp`
**Xác Pháo Đỏ** · *vuông ~256×256*  
Vật phẩm bậc 1 — Giấy pháo vừa nổ còn ấm. Nhặt về gói lộc đầu năm.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a small heap of spent red firecracker paper shreds, scorched edges, faint wisp of smoke
```

#### `images/items/cauDoiDo.webp`
**Câu Đối Đỏ** · *vuông ~256×256*  
Vật phẩm bậc 2 — Chữ ông đồ viết trên giấy hồng điều. Mực chưa khô hẳn.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a rolled red couplet scroll tied with gold cord, black calligraphy strokes barely visible on the exposed edge
```

#### `images/items/maiVangCanhKep.webp`
**Mai Vàng Cánh Kép** · *vuông ~256×256*  
Vật phẩm bậc 3 — Cành mai cánh kép nở đúng giao thừa. Hoa nở kép, phúc cũng kép.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a sprig of double-petal golden apricot blossom, five or six open flowers on a dark twig
```

#### `images/items/phongBaoDo.webp`
**Phong Bao Đỏ** · *vuông ~256×256*  
Vật phẩm bậc 4 — Phong bao lụa đỏ dập chữ vàng. Bên trong không phải tiền — là vận may.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a red silk lucky envelope embossed with a gold auspicious pattern, corner slightly lifted
```

#### `images/items/tramHuongNguyenDan.webp`
**Trầm Hương Nguyên Đán** · *vuông ~256×256*  
Vật phẩm bậc 5 — Bó trầm thỉnh giữa đêm trừ tịch. Khói bay tới đâu, tà lui tới đó.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a bundle of dark incense sticks bound with red thread, tips glowing faint orange, thin smoke curling
```

#### `images/items/locCayNeu.webp`
**Lộc Cây Nêu** · *vuông ~256×256*  
Vật phẩm bậc 6 — Nhánh lộc trảy từ ngọn nêu. Cả năm chỉ trảy được một mùa.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a small budding branch cut from a new-year bamboo pole, a red ribbon and a tiny brass bell tied to it, faint green-gold aura
```

#### `images/enemies/lanCon.webp`
**Lân Con** · *dọc 3:4*  
Quái Lv1 — Đầu lân múa hội bỏ quên sau miếu, đêm về tự cựa mình dậy nhảy.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a small lion-dance lion head come to life, red and gold papier-mache with fur trim, round mirror eyes blinking, one paw raised playfully, temple courtyard behind
```

#### `images/enemies/phaoYeu.webp`
**Pháo Yêu** · *dọc 3:4*  
Quái Lv25 — Xác pháo chất đống trăm năm tụ thành yêu, chạy tới đâu nổ lách tách tới đó.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a lithe demon formed entirely of coiled red firecracker strings and scorched paper, sparks popping along its limbs, smoke trailing, mischievous burning eyes
```

#### `images/enemies/kimNguuMieu.webp`
**Kim Ngưu Miếu** · *dọc 3:4*  
Quái Lv55 — Trâu đá canh cổng miếu, nghe đủ vạn lời khấn thì lớp đá nứt ra mà bước xuống.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a massive stone temple ox stirring awake, cracked grey granite hide with gold leaf flaking off, glowing amber eyes, moss in the carved grooves, heavy and immovable
```

#### `images/enemies/thuTueQuy.webp`
**Thủ Tuế Quỷ** · *dọc 3:4*  
Quái Lv85 — Quỷ canh khắc giao thừa, cả năm chỉ tỉnh đúng một đêm, tỉnh dậy là đòi nợ cũ.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a gaunt year-guarding demon in tattered ceremonial robes, holding an hourglass of red sand, face half hidden by a cracked opera mask, cold blue-red aura
```

#### `images/items/yvLanVuong.webp`
**Lân Vương Khai Hội** · *dọc 3:4*  
Yêu Vương Lv10 — Con lân đầu đàn mở hội, bờm đỏ như lửa, mỗi bước nhảy là một tiếng trống rền.  
```
Wuxia xianxia world-boss portrait, imposing upper-body framing, dramatic semi-realistic painterly digital art, powerful aura and swirling energy, low camera angle conveying scale, cinematic rim lighting, dark stormy atmospheric background, facing viewer, no text, no border — the king of lion-dance lions, enormous crimson mane blazing like fire, gilded horn and mirrored eyes, mid-leap above a drum, shockwaves of sound rippling outward, festival lanterns scattering
```

#### `images/items/yvNienThu.webp`
**Niên Thú Vương** · *dọc 3:4*  
Yêu Vương Lv60 — Con Niên trong truyền thuyết, sừng đồng vảy sắt, mỗi năm xuống núi một lần nuốt trọn cả thôn.  
```
Wuxia xianxia world-boss portrait, imposing upper-body framing, dramatic semi-realistic painterly digital art, powerful aura and swirling energy, low camera angle conveying scale, cinematic rim lighting, dark stormy atmospheric background, facing viewer, no text, no border — the legendary Nian beast, bronze horns and iron scales, lion-dragon body the size of a house, jaws wide open swallowing lantern light, red banners shredding in the wind around it
```

#### `images/dungeons/mieuDuongCo.webp`
**Miếu Đường Cổ** · *ngang 16:9 ~1200×675*  
Bí Cảnh Lv25 — Sân miếu khuya, khói hương chưa tan, tượng thần trong bóng tối như đang nhìn theo.  
```
Wuxia xianxia dungeon cover art, wide cinematic interior or terrain shot, semi-realistic painterly digital art, strong depth and mood, ominous inviting atmosphere, no characters, no text, no border — an ancient temple courtyard deep at night, unburnt incense smoke still hanging in the air, rows of shadowed deity statues watching from the colonnade, a single red lantern lit at the far end
```

#### `images/dungeons/truongXuanDien.webp`
**Trường Xuân Điện** · *ngang 16:9 ~1200×675*  
Bí Cảnh Lv70 — Chính điện sâu trong miếu, cột sơn son thếp vàng, ngàn ngọn nến cháy suốt đêm không tắt.  
```
Wuxia xianxia dungeon cover art, wide cinematic interior or terrain shot, semi-realistic painterly digital art, strong depth and mood, ominous inviting atmosphere, no characters, no text, no border — the inner hall of a grand new-year temple, vermilion lacquer columns with gold leaf, a thousand candles burning in tiered racks, gold ceiling coffers vanishing into darkness above
```

#### `images/equip/eq_sk_xuan_huy_boi_so.webp`
**Xuân Huy Bội · Sơ** · *vuông ~256×256*  
Rơi 0,5% từ Yêu Vương · bản Sơ, mộc mạc  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a modest round jade pendant carved with an apricot blossom, plain red silk cord
```

#### `images/equip/eq_sk_xuan_huy_boi_thuong.webp`
**Xuân Huy Bội · Thượng** · *vuông ~256×256*  
Rơi 0,5% từ Yêu Vương · bản Thượng, lộng lẫy hơn hẳn bản Sơ  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — an opulent gold-rimmed jade pendant carved with apricot blossom and a coiled dragon, layered red silk tassels, warm inner radiance
```

#### `images/equip/eq_sk_nguyen_dan_an_so.webp`
**Nguyên Đán Ấn · Sơ** · *vuông ~256×256*  
Rơi 0,5% từ Bí Cảnh · bản Sơ, mộc mạc  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a small square red-stone seal, a simple spring character carved into its base, worn edges
```

#### `images/equip/eq_sk_nguyen_dan_an_thuong.webp`
**Nguyên Đán Ấn · Thượng** · *vuông ~256×256*  
Rơi 0,5% từ Bí Cảnh · bản Thượng, lộng lẫy hơn hẳn bản Sơ  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — an imperial square seal of blood-red jade topped with a gold lion finial, dense archaic script on the base, faint gold light leaking from the carved strokes
```

#### `images/pets/pet_kimDongNgu_base.webp`
**Kim Đồng Ngư** · *dọc 3:4*  
Linh Thú — dạng thường · hệ kim  
```
Wuxia xianxia spirit-beast companion, full-body creature, semi-realistic painterly digital art, appealing collectible creature design, soft magical aura matching its element, cinematic rim lighting, dark atmospheric background, no text, no border — a golden carp spirit-fish swimming through mid-air, scales of layered polished gold, long flowing crimson fins like silk banners, whiskers trailing sparks, faint gold Kim-element aura, poised as if about to leap a dragon gate
```

#### `images/pets/pet_kimDongNgu_awk.webp`
**Kim Đồng Ngư · Thức Tỉnh** · *dọc 3:4*  
Linh Thú — dạng thức tỉnh  
```
Wuxia xianxia spirit-beast in an awakened stronger form, full-body creature, semi-realistic painterly digital art, glowing sigils and intense elemental aura, same colour identity as its base form, cinematic rim lighting, dark atmospheric background, no text, no border — the same creature as its base form, now awakened: larger and fiercer, glowing sigils on its body, its element aura burning far brighter and streaming off it, same colour identity so it reads as the same creature grown into its power
```

#### `images/pets/skill_kimDongNgu_p.webp`
**Ngư Dược Long Môn** · *vuông ~256×256*  
Tuyệt kĩ bị động — Cá chép vượt vũ môn — sát thương tuyệt kĩ Linh Thú tăng 25%.  
```
Wuxia martial technique icon, dynamic depiction of the move itself with the beast implied rather than centered, semi-realistic painterly digital art, strong motion and elemental energy, dark neutral background, readable at small size, no text, no border — a golden carp mid-leap through a stone dragon gate wreathed in gold light, water trailing from its fins, the gate arch glowing as it passes
```

#### `images/pets/skill_kimDongNgu_a.webp`
**Kim Lân Kích** · *vuông ~256×256*  
Tuyệt kĩ chủ động — Vảy vàng loé lên, một cú quẫy đuôi như đao chém.  
```
Wuxia martial technique icon, dynamic depiction of the move itself with the beast implied rather than centered, semi-realistic painterly digital art, strong motion and elemental energy, dark neutral background, readable at small size, no text, no border — a golden carp whipping its tail like a drawn blade, a crescent of gold scale-light cutting through the air, spray flying
```

#### `images/items/egg_kimDongNgu_linh.webp`
**Kim Đồng Ngư Noãn · Hiếm** · *vuông ~512×512*  
Trứng vảy vàng của Kim Đồng Ngư. Ấp nở ra linh ngư chiêu tài đón lộc.  
```
a single upright egg centered in frame, semi-realistic painterly digital art, ornate gold filigree flame-vines painted across the shell surface in a symmetrical pattern rising from the base, one faceted gem set at the front centre, plain egg silhouette with no cage or stand, plain pure white background, soft even lighting, no shadow, no text, no border — carp-scale shell, gold filigree rising like leaping fins and water spray, a red gem at the front centre
```

#### `images/items/banhChung.webp`
**Bánh Chưng** · *vuông ~256×256*  
Món ăn riêng — Bánh chưng xanh gói lá dong. Ăn một góc, ấm cả bụng đường xa.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a square Vietnamese sticky-rice cake wrapped in deep green dong leaves and bound with split-bamboo lattice, one corner cut open revealing pale rice and dark mung-bean filling
```

#### `images/avatars/sk_tet_nam.webp`
**Sự Kiện Tết · Nam** · *vuông 1:1 ~512×512*  
Ảnh đại diện mua ở quầy.  
```
Wuxia xianxia character portrait avatar, head and shoulders, semi-realistic painterly digital art, face clearly readable at small size, festive seasonal costume, cinematic soft lighting, no text, no border — a young man in a crimson new-year robe with gold trim, a sprig of apricot blossom tucked at his collar, warm confident half-smile, red lantern bokeh behind
```

#### `images/avatars/sk_tet_nu.webp`
**Sự Kiện Tết · Nữ** · *vuông 1:1 ~512×512*  
Ảnh đại diện mua ở quầy.  
```
Wuxia xianxia character portrait avatar, head and shoulders, semi-realistic painterly digital art, face clearly readable at small size, festive seasonal costume, cinematic soft lighting, no text, no border — a young woman in a crimson and gold new-year gown, hair pinned with a peach-blossom ornament, calm bright expression, red lantern bokeh behind
```

#### `images/avatars/cover_sk_tet.webp`
**Ảnh bìa Trường Xuân Miếu Hội** · *ngang rất rộng ~1600×500*  
Ảnh bìa hồ sơ — CŨNG là banner màn Sự Kiện.  
```
Wuxia xianxia profile banner art, ultra-wide cinematic scene, semi-realistic painterly digital art, visual interest weighted to the right half with calm empty space on the left, no characters in the left third, no text, no border — an ultra-wide new-year temple fair at night, empty misty flagstones and drifting incense on the left, dense red lanterns, blossom branches and the new-year pole massed on the right, deep blue night sky above
```

---

# 2 · SỰ KIỆN MÙA XUÂN — Bích Thảo Nguyên

> Thảo nguyên vừa qua mưa, trứng ngũ sắc giấu trong cỏ — và cỏ cây cả cánh đồng đang đứng dậy.
>
> Tông màu chủ đạo `#4ade80` — sáu bộ phải khác tông rõ rệt để nhìn là biết đang ở sự kiện nào.

#### `images/locations/bichThaoNguyen.webp`
**Bích Thảo Nguyên** · *ngang rộng ~1600×900*  
Nền bản đồ của vùng sự kiện.  
```
Wuxia xianxia landscape key art, wide cinematic panorama, semi-realistic painterly digital art, rich atmospheric depth, dramatic natural lighting, no characters in foreground, no text, no border, no watermark — a vast spring grassland just after rain, tender new grass glistening, a thawing stream cutting through, drifts of wildflowers, clouds of butterflies rising, brightly dyed eggs half hidden in the grass tufts, soft dawn light and a rainbow at the horizon
```

#### `images/skills/thaiThanh.webp`
**Thái Thanh** · *vuông ~256×256*  
Hái lộc biếc mùa xuân  
```
Game skill icon, single emblematic object centered in frame, semi-realistic painterly digital art, soft rim light, dark neutral background, clean silhouette readable at small size, no text, no border — a woven grass basket holding one dyed spring egg and a bundle of fresh green shoots, a single butterfly settling on the rim
```

#### `images/items/trungNguSac.webp`
**Trứng Ngũ Sắc** · *vuông ~256×256*  
Vật phẩm bậc 1 — Trứng nhuộm năm màu giấu trong cỏ. Ai giấu thì không ai biết.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a single hand-dyed egg banded in five colors with painted floral patterns, faint dew on the shell
```

#### `images/items/coBichThao.webp`
**Cỏ Bích Thảo** · *vuông ~256×256*  
Vật phẩm bậc 2 — Nhúm cỏ non nhổ cả rễ còn dính đất. Xanh tới mức phát sáng.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a small tuft of tender emerald spring grass pulled up with a clod of dark earth and pale roots
```

#### `images/items/phanCanhBuom.webp`
**Phấn Cánh Bướm** · *vuông ~256×256*  
Vật phẩm bậc 3 — Lọ phấn óng ánh gom từ cánh bướm đầu mùa. Lắc nhẹ là đổi màu.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a tiny glass vial of iridescent butterfly-wing powder, cap of carved wood, shimmering rainbow motes inside
```

#### `images/items/giotXuanLo.webp`
**Giọt Xuân Lộ** · *vuông ~256×256*  
Vật phẩm bậc 4 — Một giọt mưa xuân hứng trên lá. Trong giọt nước có cả bầu trời.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a single large perfect droplet of spring rain resting on a curled green leaf, sky reflected inside it
```

#### `images/items/hoaSoXuan.webp`
**Hoa Sơ Xuân** · *vuông ~256×256*  
Vật phẩm bậc 5 — Đoá hoa đầu tiên nở trong năm. Cánh còn chưa dám xoè hết.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — one freshly opened pale-pink first-bloom flower on a short green stem, petals still slightly furled
```

#### `images/items/lieuBiecChi.webp`
**Liễu Biếc Chi** · *vuông ~256×256*  
Vật phẩm bậc 6 — Cành liễu chiết lúc nhựa xuân đang dâng. Cắm đâu sống đó.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a slender cut willow branch with narrow bright-green leaves, tip curling, faint jade-green aura
```

#### `images/enemies/deNonDongCo.webp`
**Dê Non Đồng Cỏ** · *dọc 3:4*  
Quái Lv1 — Dê con lạc bầy giữa đồng, húc bừa vào chân khách qua đường.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a small stray kid goat on the plain, soft cream coat with grass stains, nub horns lowered to butt, comically stubborn expression, open grassland behind
```

#### `images/enemies/buomDocPhan.webp`
**Bướm Độc Phấn** · *dọc 3:4*  
Quái Lv25 — Bướm cánh rực rỡ đến chói mắt, phấn nó rắc xuống làm cỏ dưới chân héo rũ.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a large poison butterfly, wings of searing iridescent color, toxic pollen sifting from the wing edges, withered blackened grass below it, faceted compound eyes
```

#### `images/enemies/cuQuyReu.webp`
**Cự Quy Rêu** · *dọc 3:4*  
Quái Lv55 — Rùa già ngủ quên dưới lớp rêu dày, mai nó xanh như một gò đất nhỏ.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — an ancient giant tortoise mistaken for a hillock, shell buried under thick moss and small shrubs, slow heavy-lidded eyes opening, earth sliding off its back
```

#### `images/enemies/thaoMocTinh.webp`
**Thảo Mộc Tinh** · *dọc 3:4*  
Quái Lv85 — Cỏ cây cả cánh đồng dồn khí lại một chỗ mà thành hình người, đi tới đâu cỏ mọc theo tới đó.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a humanoid figure woven from the grass of an entire meadow, body of braided stalks and flowering vines, hollow glowing green eyes, fresh grass sprouting where it stands
```

#### `images/items/yvHoaLinh.webp`
**Hoa Linh Vương** · *dọc 3:4*  
Yêu Vương Lv10 — Đóa hoa đầu tiên nở mỗi mùa xuân, hút hết linh khí cả cánh đồng mà thành tinh.  
```
Wuxia xianxia world-boss portrait, imposing upper-body framing, dramatic semi-realistic painterly digital art, powerful aura and swirling energy, low camera angle conveying scale, cinematic rim lighting, dark stormy atmospheric background, facing viewer, no text, no border — the first flower spirit of spring, a graceful being whose gown is layered blossom petals, crown of budding blooms, hovering above the grass while every flower in view turns toward her, pollen light swirling
```

#### `images/items/yvThanhDeMocLinh.webp`
**Thanh Đế Mộc Linh** · *dọc 3:4*  
Yêu Vương Lv60 — Mộc linh thay mặt Thanh Đế cai quản mùa xuân phương Đông, rễ nó ăn sâu suốt cả thảo nguyên.  
```
Wuxia xianxia world-boss portrait, imposing upper-body framing, dramatic semi-realistic painterly digital art, powerful aura and swirling energy, low camera angle conveying scale, cinematic rim lighting, dark stormy atmospheric background, facing viewer, no text, no border — the wood-spirit regent of the Azure Emperor of spring, a colossal humanoid of living green heartwood, antler-like branching crown, roots spreading beneath the whole plain, emerald light in the bark seams
```

#### `images/dungeons/noanThachCoc.webp`
**Noãn Thạch Cốc** · *ngang 16:9 ~1200×675*  
Bí Cảnh Lv25 — Thung lũng đá hình quả trứng, mỗi hòn ấp một sinh linh chưa nở.  
```
Wuxia xianxia dungeon cover art, wide cinematic interior or terrain shot, semi-realistic painterly digital art, strong depth and mood, ominous inviting atmosphere, no characters, no text, no border — a narrow valley filled with egg-shaped boulders of pale stone, each faintly lit from within, spring mist pooling between them, thin waterfall at the far end
```

#### `images/dungeons/thanhDeThanDien.webp`
**Thanh Đế Thần Điện** · *ngang 16:9 ~1200×675*  
Bí Cảnh Lv70 — Đền thờ thần mùa xuân, mái phủ dây leo, cột đá nứt ra mà hoa vẫn mọc.  
```
Wuxia xianxia dungeon cover art, wide cinematic interior or terrain shot, semi-realistic painterly digital art, strong depth and mood, ominous inviting atmosphere, no characters, no text, no border — an overgrown temple to the spring god, cracked stone columns with flowers pushing through the fissures, vine-draped roof, green light filtering through a broken ceiling
```

#### `images/equip/eq_sk_bich_thao_boi_so.webp`
**Bích Thảo Bội · Sơ** · *vuông ~256×256*  
Rơi 0,5% từ Yêu Vương · bản Sơ, mộc mạc  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a simple pale-jade pendant shaped like a curled grass leaf, plain green cord
```

#### `images/equip/eq_sk_bich_thao_boi_thuong.webp`
**Bích Thảo Bội · Thượng** · *vuông ~256×256*  
Rơi 0,5% từ Yêu Vương · bản Thượng, lộng lẫy hơn hẳn bản Sơ  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a lavish emerald pendant carved as a wreath of spring blossoms and butterfly wings, gold filigree edge, layered green silk tassels, soft green radiance
```

#### `images/equip/eq_sk_thanh_de_an_so.webp`
**Thanh Đế Ấn · Sơ** · *vuông ~256×256*  
Rơi 0,5% từ Bí Cảnh · bản Sơ, mộc mạc  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a small square seal of rough green stone, a sprout carved into its base
```

#### `images/equip/eq_sk_thanh_de_an_thuong.webp`
**Thanh Đế Ấn · Thượng** · *vuông ~256×256*  
Rơi 0,5% từ Bí Cảnh · bản Thượng, lộng lẫy hơn hẳn bản Sơ  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a square seal of deep emerald jade topped with a budding-branch finial, dense archaic script on the base, green light leaking from the carved strokes
```

#### `images/pets/pet_thaiVuDiep_base.webp`
**Thải Vũ Điệp** · *dọc 3:4*  
Linh Thú — dạng thường · hệ moc  
```
Wuxia xianxia spirit-beast companion, full-body creature, semi-realistic painterly digital art, appealing collectible creature design, soft magical aura matching its element, cinematic rim lighting, dark atmospheric background, no text, no border — a large spirit butterfly with five-colored iridescent wings that shift like oil on water, delicate feathered antennae, trailing motes of pollen light, faint green Moc-element aura, wings caught mid-beat
```

#### `images/pets/pet_thaiVuDiep_awk.webp`
**Thải Vũ Điệp · Thức Tỉnh** · *dọc 3:4*  
Linh Thú — dạng thức tỉnh  
```
Wuxia xianxia spirit-beast in an awakened stronger form, full-body creature, semi-realistic painterly digital art, glowing sigils and intense elemental aura, same colour identity as its base form, cinematic rim lighting, dark atmospheric background, no text, no border — the same creature as its base form, now awakened: larger and fiercer, glowing sigils on its body, its element aura burning far brighter and streaming off it, same colour identity so it reads as the same creature grown into its power
```

#### `images/pets/skill_thaiVuDiep_p.webp`
**Điệp Ảnh** · *vuông ~256×256*  
Tuyệt kĩ bị động — Bóng cánh loang loáng — tuyệt kĩ Linh Thú giảm 1 hiệp hồi.  
```
Wuxia martial technique icon, dynamic depiction of the move itself with the beast implied rather than centered, semi-realistic painterly digital art, strong motion and elemental energy, dark neutral background, readable at small size, no text, no border — a butterfly leaving three translucent afterimages behind it as it darts, each fainter than the last, motion blur of five-colour wings
```

#### `images/pets/skill_thaiVuDiep_a.webp`
**Ngũ Sắc Phấn Vũ** · *vuông ~256×256*  
Tuyệt kĩ chủ động — Rũ cánh tung năm màu phấn phủ kín mắt địch.  
```
Wuxia martial technique icon, dynamic depiction of the move itself with the beast implied rather than centered, semi-realistic painterly digital art, strong motion and elemental energy, dark neutral background, readable at small size, no text, no border — a butterfly beating its wings hard, releasing a swirling storm of five-colour pollen that fills the frame
```

#### `images/items/egg_thaiVuDiep_linh.webp`
**Thải Vũ Điệp Noãn · Hiếm** · *vuông ~512×512*  
Trứng lụa ánh ngũ sắc của Thải Vũ Điệp. Ấp nở ra linh điệp cánh năm màu.  
```
a single upright egg centered in frame, semi-realistic painterly digital art, ornate gold filigree flame-vines painted across the shell surface in a symmetrical pattern rising from the base, one faceted gem set at the front centre, plain egg silhouette with no cage or stand, plain pure white background, soft even lighting, no shadow, no text, no border — pastel chrysalis shell, gold filigree spreading like butterfly wing veins, a green gem at the front centre
```

#### `images/items/banhTroiNguSac.webp`
**Bánh Trôi Ngũ Sắc** · *vuông ~256×256*  
Món ăn riêng — Chén bánh trôi năm màu nổi trong nước gừng. Ngọt từ trong ra ngoài.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a small bowl of round glutinous rice dumplings in five pastel colors floating in clear ginger syrup, a few sesame seeds scattered on top
```

#### `images/avatars/sk_xuan_nam.webp`
**Sự Kiện Mùa Xuân · Nam** · *vuông 1:1 ~512×512*  
Ảnh đại diện mua ở quầy.  
```
Wuxia xianxia character portrait avatar, head and shoulders, semi-realistic painterly digital art, face clearly readable at small size, festive seasonal costume, cinematic soft lighting, no text, no border — a young man in a light spring-green travelling robe, straw hat pushed back, a butterfly resting on his shoulder, bright open expression, sunlit grassland bokeh behind
```

#### `images/avatars/sk_xuan_nu.webp`
**Sự Kiện Mùa Xuân · Nữ** · *vuông 1:1 ~512×512*  
Ảnh đại diện mua ở quầy.  
```
Wuxia xianxia character portrait avatar, head and shoulders, semi-realistic painterly digital art, face clearly readable at small size, festive seasonal costume, cinematic soft lighting, no text, no border — a young woman in a pale-green and white spring gown, flower crown of small wildflowers, gentle smiling expression, sunlit grassland bokeh behind
```

#### `images/avatars/cover_sk_xuan.webp`
**Ảnh bìa Bích Thảo Nguyên** · *ngang rất rộng ~1600×500*  
Ảnh bìa hồ sơ — CŨNG là banner màn Sự Kiện.  
```
Wuxia xianxia profile banner art, ultra-wide cinematic scene, semi-realistic painterly digital art, visual interest weighted to the right half with calm empty space on the left, no characters in the left third, no text, no border — an ultra-wide spring grassland after rain, calm empty misty meadow on the left, a burst of wildflowers, rising butterflies and a thawing stream massed on the right, soft rainbow in a pale morning sky
```

---

# 3 · SỰ KIỆN ĐOAN NGỌ — Đoan Dương Giang

> Giữa trưa hè nắng nhất năm, thuyền rồng rẽ nước — và năm loài độc đang tụ về một chỗ.
>
> Tông màu chủ đạo `#facc15` — sáu bộ phải khác tông rõ rệt để nhìn là biết đang ở sự kiện nào.

#### `images/locations/doanDuongGiang.webp`
**Đoan Dương Giang** · *ngang rộng ~1600×900*  
Nền bản đồ của vùng sự kiện.  
```
Wuxia xianxia landscape key art, wide cinematic panorama, semi-realistic painterly digital art, rich atmospheric depth, dramatic natural lighting, no characters in foreground, no text, no border, no watermark — a wide river at the fiercest noon of summer, long dragon boats racing and throwing spray, a lotus marsh filling one bank with pink blooms, yellow realgar smoke drifting low over the water, five-colored threads and bundled calamus hanging from a wooden pier, harsh white sunlight and deep blue water
```

#### `images/skills/thaiLien.webp`
**Thái Liên** · *vuông ~256×256*  
Hái sen giữa mùa hạ  
```
Game skill icon, single emblematic object centered in frame, semi-realistic painterly digital art, soft rim light, dark neutral background, clean silhouette readable at small size, no text, no border — a hand holding a fresh lotus leaf and a golden lotus pod, five-colored thread wound around the wrist, bright water droplets falling
```

#### `images/items/laSenNon.webp`
**Lá Sen Non** · *vuông ~256×256*  
Vật phẩm bậc 1 — Lá sen còn cuộn mép, đọng nước lóng lánh. Gói gì cũng thơm.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a single young lotus leaf, still rolled at one edge, beads of water sitting on the waxy green surface
```

#### `images/items/dayNguSac.webp`
**Dây Ngũ Sắc** · *vuông ~256×256*  
Vật phẩm bậc 2 — Vòng chỉ năm màu bện tay. Đeo vào cổ tay, tà khí đi vòng.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a braided bracelet of five colored silk threads, ends bound with a small brass ring
```

#### `images/items/botHungHoang.webp`
**Bột Hùng Hoàng** · *vuông ~256×256*  
Vật phẩm bậc 3 — Đĩa bột vàng hăng nồng. Rắn rết ngửi thấy là quay đầu.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a small ceramic dish of coarse bright-yellow realgar powder, a wooden scoop resting beside it, faint acrid haze above
```

#### `images/items/guongSenVang.webp`
**Gương Sen Vàng** · *vuông ~256×256*  
Vật phẩm bậc 4 — Gương sen già hạt căng mẩy. Bẻ một hạt, thơm cả buổi.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a mature golden lotus seed pod on a cut stem, plump seeds set in the honeycomb face
```

#### `images/items/vayThuyenRong.webp`
**Vảy Thuyền Rồng** · *vuông ~256×256*  
Vật phẩm bậc 5 — Mảnh sơn đỏ tróc từ mạn thuyền đua. Còn ngấm tiếng trống hội.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a curved lacquered wooden scale plate broken from a dragon boat hull, crimson paint with gold edging, splintered at one end
```

#### `images/items/xuongBoChi.webp`
**Xương Bồ Chi** · *vuông ~256×256*  
Vật phẩm bậc 6 — Gốc xương bồ ngàn năm lá sắc như kiếm. Treo trước cửa, quỷ không dám vào.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a length of ancient calamus rhizome with sword-shaped leaves, knotted and pale, faint blue-green aura along the blade edges
```

#### `images/enemies/cuaCangDo.webp`
**Cua Càng Đỏ** · *dọc 3:4*  
Quái Lv1 — Cua bò lên bến kiếm ăn, càng đỏ au, gặp người là giương lên doạ.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a bright red river crab up on the pier planks, both claws raised in threat, wet shell gleaming, tiny stalked eyes swivelling
```

#### `images/enemies/thuyXaHungHoang.webp`
**Thủy Xà Hùng Hoàng** · *dọc 3:4*  
Quái Lv25 — Rắn nước uống nhầm rượu hùng hoàng, vảy vàng khè, nọc độc hơn gấp bội.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a slender water snake with sickly yellow-tinged scales from drinking realgar wine, jaws parted showing dripping fangs, coiled on a lotus leaf
```

#### `images/enemies/trauNuocDamSen.webp`
**Trâu Nước Đầm Sen** · *dọc 3:4*  
Quái Lv55 — Trâu đầm mình dưới sen cả trăm năm, sừng nó quấn đầy ngó sen mọc thành rễ.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — an enormous water buffalo half submerged in a lotus marsh, lotus roots grown around and through its horns like a tangled crown, mud-caked hide, slow furious eyes
```

#### `images/enemies/nguDocYeu.webp`
**Ngũ Độc Yêu** · *dọc 3:4*  
Quái Lv85 — Rắn, rết, bọ cạp, thạch sùng và cóc hợp lại làm một thân — thứ mà cả ngày Đoan Ngọ sinh ra để trừ.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a horrifying composite demon of the five poisons fused into one body — snake coils, centipede segments, scorpion tail, gecko limbs and a toad maw — sickly green-purple miasma boiling around it
```

#### `images/items/yvXichLongChu.webp`
**Xích Long Chu** · *dọc 3:4*  
Yêu Vương Lv10 — Chiếc thuyền rồng đỏ đua thắng trăm mùa, gỗ nó ngậm đủ tiếng trống và tiếng hò mà hoá long.  
```
Wuxia xianxia world-boss portrait, imposing upper-body framing, dramatic semi-realistic painterly digital art, powerful aura and swirling energy, low camera angle conveying scale, cinematic rim lighting, dark stormy atmospheric background, facing viewer, no text, no border — a crimson dragon boat transformed into a true dragon, prow becoming a roaring dragon head, oars becoming clawed limbs, drum-beat shockwaves splitting the river, spray exploding upward
```

#### `images/items/yvNguDocVuong.webp`
**Ngũ Độc Chi Vương** · *dọc 3:4*  
Yêu Vương Lv60 — Chúa tể của năm loài độc, ngồi giữa đầm nước đục, hơi thở đi tới đâu sen héo tới đó.  
```
Wuxia xianxia world-boss portrait, imposing upper-body framing, dramatic semi-realistic painterly digital art, powerful aura and swirling energy, low camera angle conveying scale, cinematic rim lighting, dark stormy atmospheric background, facing viewer, no text, no border — the sovereign of the five poisons enthroned in a stagnant pool, a vast crowned demon with five different venomous heads on its shoulders, lotus withering black in a ring around it, purple-green fumes
```

#### `images/dungeons/lienHoaDang.webp`
**Liên Hoa Đãng** · *ngang 16:9 ~1200×675*  
Bí Cảnh Lv25 — Đầm sen mênh mông, lá to bằng chiếc thuyền, dưới nước có gì đó đang bơi theo.  
```
Wuxia xianxia dungeon cover art, wide cinematic interior or terrain shot, semi-realistic painterly digital art, strong depth and mood, ominous inviting atmosphere, no characters, no text, no border — an endless lotus marsh with leaves the size of small boats, still green water between them, something large moving beneath the surface leaving a wake, hazy hot sunlight
```

#### `images/dungeons/longChuThuyCung.webp`
**Long Chu Thủy Cung** · *ngang 16:9 ~1200×675*  
Bí Cảnh Lv70 — Cung điện dưới đáy sông, cột chống là mái chèo của những chiếc thuyền đã chìm.  
```
Wuxia xianxia dungeon cover art, wide cinematic interior or terrain shot, semi-realistic painterly digital art, strong depth and mood, ominous inviting atmosphere, no characters, no text, no border — an underwater palace on the riverbed, its columns made from the oars and masts of sunken dragon boats, silt drifting in shafts of green light, carved dragon heads emerging from the gloom
```

#### `images/equip/eq_sk_doan_duong_boi_so.webp`
**Đoan Dương Bội · Sơ** · *vuông ~256×256*  
Rơi 0,5% từ Yêu Vương · bản Sơ, mộc mạc  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a simple pendant of pale jade carved as a lotus leaf, braided five-color thread cord
```

#### `images/equip/eq_sk_doan_duong_boi_thuong.webp`
**Đoan Dương Bội · Thượng** · *vuông ~256×256*  
Rơi 0,5% từ Yêu Vương · bản Thượng, lộng lẫy hơn hẳn bản Sơ  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — an ornate pendant of red-gold carved as a dragon boat prow over an open lotus, five-colored silk tassels, warm crimson inner glow
```

#### `images/equip/eq_sk_ngu_doc_an_so.webp`
**Ngũ Độc Ấn · Sơ** · *vuông ~256×256*  
Rơi 0,5% từ Bí Cảnh · bản Sơ, mộc mạc  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a small square seal of dark stone, a coiled snake carved into its base, verdigris in the grooves
```

#### `images/equip/eq_sk_ngu_doc_an_thuong.webp`
**Ngũ Độc Ấn · Thượng** · *vuông ~256×256*  
Rơi 0,5% từ Bí Cảnh · bản Thượng, lộng lẫy hơn hẳn bản Sơ  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a square seal of black jade topped with a five-headed venomous beast finial, archaic script on the base, sickly green light seeping from the strokes
```

#### `images/pets/pet_xichDiemLongCau_base.webp`
**Xích Diễm Long Câu** · *dọc 3:4*  
Linh Thú — dạng thường · hệ hoa  
```
Wuxia xianxia spirit-beast companion, full-body creature, semi-realistic painterly digital art, appealing collectible creature design, soft magical aura matching its element, cinematic rim lighting, dark atmospheric background, no text, no border — a crimson dragon-horse foal, scaled hide the color of hot coals, mane and tail of living flame, small horn buds and fin-like ears, hooves leaving scorch marks in the air, faint red Hoa-element aura
```

#### `images/pets/pet_xichDiemLongCau_awk.webp`
**Xích Diễm Long Câu · Thức Tỉnh** · *dọc 3:4*  
Linh Thú — dạng thức tỉnh  
```
Wuxia xianxia spirit-beast in an awakened stronger form, full-body creature, semi-realistic painterly digital art, glowing sigils and intense elemental aura, same colour identity as its base form, cinematic rim lighting, dark atmospheric background, no text, no border — the same creature as its base form, now awakened: larger and fiercer, glowing sigils on its body, its element aura burning far brighter and streaming off it, same colour identity so it reads as the same creature grown into its power
```

#### `images/pets/skill_xichDiemLongCau_p.webp`
**Dương Cực** · *vuông ~256×256*  
Tuyệt kĩ bị động — Giữa trưa hè dương khí thịnh nhất — sát thương tuyệt kĩ Linh Thú tăng 35%.  
```
Wuxia martial technique icon, dynamic depiction of the move itself with the beast implied rather than centered, semi-realistic painterly digital art, strong motion and elemental energy, dark neutral background, readable at small size, no text, no border — a blazing noon sun directly overhead, its light concentrating into a burning point over a crimson dragon-horse silhouette below
```

#### `images/pets/skill_xichDiemLongCau_a.webp`
**Liệt Dương Trảm** · *vuông ~256×256*  
Tuyệt kĩ chủ động — Gom nắng trưa vào một vó, giáng xuống như chém.  
```
Wuxia martial technique icon, dynamic depiction of the move itself with the beast implied rather than centered, semi-realistic painterly digital art, strong motion and elemental energy, dark neutral background, readable at small size, no text, no border — a crimson dragon-horse rearing and bringing a hoof down wrapped in sun-fire, a vertical slash of molten light splitting the ground
```

#### `images/items/egg_xichDiemLongCau_linh.webp`
**Xích Diễm Long Câu Noãn · Hiếm** · *vuông ~512×512*  
Trứng đỏ sậm nứt vân lửa của Xích Diễm Long Câu. Ấp nở ra long câu bờm lửa.  
```
a single upright egg centered in frame, semi-realistic painterly digital art, ornate gold filigree flame-vines painted across the shell surface in a symmetrical pattern rising from the base, one faceted gem set at the front centre, plain egg silhouette with no cage or stand, plain pure white background, soft even lighting, no shadow, no text, no border — molten-cracked scarlet shell, gold filigree curling like rising flame tongues, an amber gem at the front centre
```

#### `images/items/banhUTro.webp`
**Bánh Ú Tro** · *vuông ~256×256*  
Món ăn riêng — Bánh ú gói lá tre, ruột hổ phách trong veo. Mát ruột giữa trưa nắng.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a small pyramid-shaped rice cake wrapped in bamboo leaves and tied with reed string, one unwrapped beside it showing translucent amber lye-water rice
```

#### `images/avatars/sk_doanngo_nam.webp`
**Sự Kiện Đoan Ngọ · Nam** · *vuông 1:1 ~512×512*  
Ảnh đại diện mua ở quầy.  
```
Wuxia xianxia character portrait avatar, head and shoulders, semi-realistic painterly digital art, face clearly readable at small size, festive seasonal costume, cinematic soft lighting, no text, no border — a young man stripped to a sleeveless summer tunic, five-colored threads on both wrists, wet hair from river spray, grinning fiercely, dragon-boat river bokeh behind
```

#### `images/avatars/sk_doanngo_nu.webp`
**Sự Kiện Đoan Ngọ · Nữ** · *vuông 1:1 ~512×512*  
Ảnh đại diện mua ở quầy.  
```
Wuxia xianxia character portrait avatar, head and shoulders, semi-realistic painterly digital art, face clearly readable at small size, festive seasonal costume, cinematic soft lighting, no text, no border — a young woman in a light summer robe of white and lotus pink, a lotus flower tucked behind her ear, five-colored thread bracelet, bright determined expression, river bokeh behind
```

#### `images/avatars/cover_sk_doanngo.webp`
**Ảnh bìa Đoan Dương Giang** · *ngang rất rộng ~1600×500*  
Ảnh bìa hồ sơ — CŨNG là banner màn Sự Kiện.  
```
Wuxia xianxia profile banner art, ultra-wide cinematic scene, semi-realistic painterly digital art, visual interest weighted to the right half with calm empty space on the left, no characters in the left third, no text, no border — an ultra-wide summer river at noon, calm open water and empty sky on the left, dragon boats mid-race, lotus marsh and a crowded pier massed on the right, harsh bright sunlight
```

---

# 4 · SỰ KIỆN VU LAN — Vong Xuyên Ngạn

> Rằm tháng Bảy, hoa đăng trôi thành dòng lửa trên Vong Xuyên — bên kia bờ có người đứng đợi.
>
> Tông màu chủ đạo `#818cf8` — sáu bộ phải khác tông rõ rệt để nhìn là biết đang ở sự kiện nào.

#### `images/locations/vongXuyenNgan.webp`
**Vong Xuyên Ngạn** · *ngang rộng ~1600×900*  
Nền bản đồ của vùng sự kiện.  
```
Wuxia xianxia landscape key art, wide cinematic panorama, semi-realistic painterly digital art, rich atmospheric depth, dramatic natural lighting, no characters in foreground, no text, no border, no watermark — the bank of the Vong Xuyen river on the seventh-month full moon night, thousands of floating paper lanterns drifting downstream in a long river of light, red spider lilies covering the near bank, cold mist just above the black water, indistinct standing silhouettes on the far shore, deep indigo and ember-orange
```

#### `images/skills/thaiDang.webp`
**Thái Đăng** · *vuông ~256×256*  
Vớt hoa đăng trôi sông  
```
Game skill icon, single emblematic object centered in frame, semi-realistic painterly digital art, soft rim light, dark neutral background, clean silhouette readable at small size, no text, no border — a hand lifting a small lit paper lantern from dark water, a red spider lily floating beside it, reflected light rippling
```

#### `images/items/hoaDangGiay.webp`
**Hoa Đăng Giấy** · *vuông ~256×256*  
Vật phẩm bậc 1 — Đăng giấy hình sen còn cháy dở. Ai thả nó đã sang bờ bên kia.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a small lotus-shaped paper river lantern with a lit candle inside, damp at the base, warm orange glow through the paper petals
```

#### `images/items/troVangMa.webp`
**Tro Vàng Mã** · *vuông ~256×256*  
Vật phẩm bậc 2 — Nhúm tro còn sót góc giấy vàng. Của gửi đi chưa chắc tới nơi.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a small mound of grey joss-paper ash with a few unburnt gold-foil corners still showing, faint ember glow underneath
```

#### `images/items/biNganHoa.webp`
**Bỉ Ngạn Hoa** · *vuông ~256×256*  
Vật phẩm bậc 3 — Đoá bỉ ngạn không lá. Hoa nở không thấy lá, lá mọc không thấy hoa.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a single red spider lily on a bare leafless stem, long curled crimson filaments splayed like fingers
```

#### `images/items/honHoaLam.webp`
**Hồn Hoả Lam** · *vuông ~256×256*  
Vật phẩm bậc 4 — Ngọn lửa lam cháy không cần củi. Lại gần thì lạnh chứ không ấm.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a cold pale-blue soul flame hovering free with no fuel, wisping upward, faint face-like shapes suggested in the smoke
```

#### `images/items/vongXuyenThuy.webp`
**Vong Xuyên Thủy** · *vuông ~256×256*  
Vật phẩm bậc 5 — Bình nước đen gạn từ Vong Xuyên. Mặt nước phản chiếu người khác, không phải mình.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a small stoppered ceramic flask of black river water, the liquid unnaturally still, faint pale reflection on its surface that does not match the room
```

#### `images/items/manhTamSinhThach.webp`
**Mảnh Tam Sinh Thạch** · *vuông ~256×256*  
Vật phẩm bậc 6 — Mảnh đá khắc tên đã mòn. Ba đời trước đọc được, đời này thì không.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a broken shard of dark grey stone with worn carved names crossing its face, faint red light in the incised strokes
```

#### `images/enemies/doiGiay.webp`
**Dơi Giấy** · *dọc 3:4*  
Quái Lv1 — Vàng mã đốt dở bay lên, gặp gió thì thành đàn dơi giấy chao qua chao lại.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a bat folded out of half-burnt joss paper, gold foil flaking from its wings, ember-lit edges, flitting erratically in the dark
```

#### `images/enemies/coHonLangThang.webp`
**Cô Hồn Lang Thang** · *dọc 3:4*  
Quái Lv25 — Hồn không ai cúng, cả năm đói khát, rằm tháng Bảy mới được ra ngoài một bận.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a wandering hungry ghost, gaunt translucent figure in rotted funeral cloth, sunken hollow eyes, distended belly, reaching with thin desperate hands
```

#### `images/enemies/nguuDauTuong.webp`
**Ngưu Đầu Tướng** · *dọc 3:4*  
Quái Lv55 — Quỷ sứ đầu trâu canh bờ sông, tay cầm chĩa ba, chưa từng để sót một hồn nào.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — the Ox-Head hell warden, a towering bull-headed guardian in black lacquered armor, three-pronged trident planted in the ground, brass nose ring, cold implacable red eyes
```

#### `images/enemies/maDienTuong.webp`
**Mã Diện Tướng** · *dọc 3:4*  
Quái Lv85 — Quỷ sứ mặt ngựa đi cùng Ngưu Đầu, nó không bắt hồn — nó đọc tên hồn.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — the Horse-Face hell warden, a tall gaunt horse-headed guardian in grey official robes, holding an open name ledger and a brush, reading aloud, hollow black eye sockets
```

#### `images/items/yvDeDangQuySu.webp`
**Đề Đăng Quỷ Sứ** · *dọc 3:4*  
Yêu Vương Lv10 — Quỷ xách đèn soi đường cho hồn mới, ai nhìn thẳng vào đèn thì quên mất mình là ai.  
```
Wuxia xianxia world-boss portrait, imposing upper-body framing, dramatic semi-realistic painterly digital art, powerful aura and swirling energy, low camera angle conveying scale, cinematic rim lighting, dark stormy atmospheric background, facing viewer, no text, no border — a lantern-bearing psychopomp demon, tall and thin in trailing dark robes, raising a bone-framed lantern whose light bleaches everything it touches, faint blank-faced spirits following behind it
```

#### `images/items/yvManhBa.webp`
**Mạnh Bà** · *dọc 3:4*  
Yêu Vương Lv60 — Bà lão nấu canh quên bên cầu Nại Hà, nồi canh sôi suốt ngàn năm chưa từng cạn.  
```
Wuxia xianxia world-boss portrait, imposing upper-body framing, dramatic semi-realistic painterly digital art, powerful aura and swirling energy, low camera angle conveying scale, cinematic rim lighting, dark stormy atmospheric background, facing viewer, no text, no border — Meng Po the old woman of the forgetting broth, hunched over an enormous iron cauldron that has boiled for a thousand years, ladle raised, steam full of drifting faces, cold blue-green light from below
```

#### `images/dungeons/biNganHoaHai.webp`
**Bỉ Ngạn Hoa Hải** · *ngang 16:9 ~1200×675*  
Bí Cảnh Lv25 — Biển hoa đỏ không một chiếc lá, đi giữa đó thì không nghe được tiếng chân mình.  
```
Wuxia xianxia dungeon cover art, wide cinematic interior or terrain shot, semi-realistic painterly digital art, strong depth and mood, ominous inviting atmosphere, no characters, no text, no border — an endless sea of red spider lilies with not a single leaf anywhere, low cold mist between the stems, an unnaturally silent path worn through the middle, dark sky above
```

#### `images/dungeons/naiHaKieu.webp`
**Nại Hà Kiều** · *ngang 16:9 ~1200×675*  
Bí Cảnh Lv70 — Cây cầu đá bắc qua Vong Xuyên, một đầu là dương gian, đầu kia không ai kể lại được.  
```
Wuxia xianxia dungeon cover art, wide cinematic interior or terrain shot, semi-realistic painterly digital art, strong depth and mood, ominous inviting atmosphere, no characters, no text, no border — an ancient stone arch bridge over black water, warm lantern light and faint buildings at the near end, the far end dissolving into featureless white fog, worn carved railings
```

#### `images/equip/eq_sk_vong_xuyen_boi_so.webp`
**Vong Xuyên Bội · Sơ** · *vuông ~256×256*  
Rơi 0,5% từ Yêu Vương · bản Sơ, mộc mạc  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a plain dark-jade pendant carved as a single spider lily, frayed grey cord
```

#### `images/equip/eq_sk_vong_xuyen_boi_thuong.webp`
**Vong Xuyên Bội · Thượng** · *vuông ~256×256*  
Rơi 0,5% từ Yêu Vương · bản Thượng, lộng lẫy hơn hẳn bản Sơ  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — an elaborate pendant of black jade and silver carved as a spider lily wreathing a small lantern, trailing grey silk tassels, cold blue inner glow
```

#### `images/equip/eq_sk_tam_sinh_an_so.webp`
**Tam Sinh Ấn · Sơ** · *vuông ~256×256*  
Rơi 0,5% từ Bí Cảnh · bản Sơ, mộc mạc  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a small square seal of rough grey stone, three worn strokes carved into its base
```

#### `images/equip/eq_sk_tam_sinh_an_thuong.webp`
**Tam Sinh Ấn · Thượng** · *vuông ~256×256*  
Rơi 0,5% từ Bí Cảnh · bản Thượng, lộng lẫy hơn hẳn bản Sơ  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a square seal of black stone veined with red, topped with a coiled-flame finial, dense name-like script on the base, red light bleeding from the strokes
```

#### `images/pets/pet_uMinhMieu_base.webp`
**U Minh Miêu** · *dọc 3:4*  
Linh Thú — dạng thường · hệ tho  
```
Wuxia xianxia spirit-beast companion, full-body creature, semi-realistic painterly digital art, appealing collectible creature design, soft magical aura matching its element, cinematic rim lighting, dark atmospheric background, no text, no border — a sleek black underworld cat, fur that swallows light, two faint pale-gold ring markings on its brow, eyes like cold lanterns, tail tip dissolving into dark mist, faint ochre Tho-element aura, walking without sound
```

#### `images/pets/pet_uMinhMieu_awk.webp`
**U Minh Miêu · Thức Tỉnh** · *dọc 3:4*  
Linh Thú — dạng thức tỉnh  
```
Wuxia xianxia spirit-beast in an awakened stronger form, full-body creature, semi-realistic painterly digital art, glowing sigils and intense elemental aura, same colour identity as its base form, cinematic rim lighting, dark atmospheric background, no text, no border — the same creature as its base form, now awakened: larger and fiercer, glowing sigils on its body, its element aura burning far brighter and streaming off it, same colour identity so it reads as the same creature grown into its power
```

#### `images/pets/skill_uMinhMieu_p.webp`
**Âm Hành** · *vuông ~256×256*  
Tuyệt kĩ bị động — Bước đi không tiếng — Né Tránh Linh Thú tăng 20%, cộng thẳng cho chủ.  
```
Wuxia martial technique icon, dynamic depiction of the move itself with the beast implied rather than centered, semi-realistic painterly digital art, strong motion and elemental energy, dark neutral background, readable at small size, no text, no border — a black cat walking across still water leaving no ripple, its outline dissolving into cold mist at the edges
```

#### `images/pets/skill_uMinhMieu_a.webp`
**Câu Hồn Trảo** · *vuông ~256×256*  
Tuyệt kĩ chủ động — Vuốt đen lướt qua, mang theo một phần sinh khí về cho chủ.  
```
Wuxia martial technique icon, dynamic depiction of the move itself with the beast implied rather than centered, semi-realistic painterly digital art, strong motion and elemental energy, dark neutral background, readable at small size, no text, no border — a black clawed paw raking forward through the dark, four trailing streaks of pale soul-light torn out behind it
```

#### `images/items/egg_uMinhMieu_linh.webp`
**U Minh Miêu Noãn · Hiếm** · *vuông ~512×512*  
Trứng đen tuyền của U Minh Miêu. Ấp nở ra linh miêu đi không để lại tiếng chân.  
```
a single upright egg centered in frame, semi-realistic painterly digital art, ornate gold filigree flame-vines painted across the shell surface in a symmetrical pattern rising from the base, one faceted gem set at the front centre, plain egg silhouette with no cage or stand, plain pure white background, soft even lighting, no shadow, no text, no border — black shell, gold filigree curling like cat whiskers and drifting smoke, a violet gem at the front centre
```

#### `images/items/chaoThiThuc.webp`
**Cháo Thí Thực** · *vuông ~256×256*  
Món ăn riêng — Chén cháo trắng cúng thí thực. Người ăn ấm bụng, cô hồn no lòng.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a plain earthenware bowl of thin white rice porridge on a rough wooden offering tray, a few grains of coarse salt beside it, one stick of incense laid across the rim
```

#### `images/avatars/sk_vulan_nam.webp`
**Sự Kiện Vu Lan · Nam** · *vuông 1:1 ~512×512*  
Ảnh đại diện mua ở quầy.  
```
Wuxia xianxia character portrait avatar, head and shoulders, semi-realistic painterly digital art, face clearly readable at small size, festive seasonal costume, cinematic soft lighting, no text, no border — a young man in mourning-grey robes holding a small paper lantern near his chest, solemn quiet face lit from below, dark river bokeh behind
```

#### `images/avatars/sk_vulan_nu.webp`
**Sự Kiện Vu Lan · Nữ** · *vuông 1:1 ~512×512*  
Ảnh đại diện mua ở quầy.  
```
Wuxia xianxia character portrait avatar, head and shoulders, semi-realistic painterly digital art, face clearly readable at small size, festive seasonal costume, cinematic soft lighting, no text, no border — a young woman in pale grey and white mourning robes, a white flower pinned at her breast, calm sorrowful expression, dark river bokeh behind
```

#### `images/avatars/cover_sk_vulan.webp`
**Ảnh bìa Vong Xuyên Ngạn** · *ngang rất rộng ~1600×500*  
Ảnh bìa hồ sơ — CŨNG là banner màn Sự Kiện.  
```
Wuxia xianxia profile banner art, ultra-wide cinematic scene, semi-realistic painterly digital art, visual interest weighted to the right half with calm empty space on the left, no characters in the left third, no text, no border — an ultra-wide night river scene, empty black water and cold mist on the left, a dense drift of glowing paper lanterns and a bank of red spider lilies massed on the right, huge pale full moon low in an indigo sky
```

---

# 5 · SỰ KIỆN TRUNG THU — Quảng Hàn Nguyệt Cảnh

> Đêm rằm tháng Tám, cầu Ngân Hà bắc xuống trần gian — lên Quảng Hàn Cung trước khi trăng lặn.
>
> Tông màu chủ đạo `#93c5fd` — sáu bộ phải khác tông rõ rệt để nhìn là biết đang ở sự kiện nào.

#### `images/locations/quangHanNguyetCanh.webp`
**Quảng Hàn Nguyệt Cảnh** · *ngang rộng ~1600×900*  
Nền bản đồ của vùng sự kiện.  
```
Wuxia xianxia landscape key art, wide cinematic panorama, semi-realistic painterly digital art, rich atmospheric depth, dramatic natural lighting, no characters in foreground, no text, no border, no watermark — the moon palace realm, a floor of silver-blue stone, an immense thousand-year cassia tree in full golden bloom, paper lanterns floating in mid-air with no strings, the silhouette of a jade rabbit pounding medicine cast huge across a distant cliff face, the Earth hanging as a blue crescent in a starfield
```

#### `images/skills/thaiNguyet.webp`
**Thái Nguyệt** · *vuông ~256×256*  
Hái ánh trăng  
```
Game skill icon, single emblematic object centered in frame, semi-realistic painterly digital art, soft rim light, dark neutral background, clean silhouette readable at small size, no text, no border — a cupped hand catching a pool of liquid moonlight, a sprig of golden cassia blossom resting in it, silver motes rising
```

#### `images/items/denLongRoi.webp`
**Đèn Lồng Rơi** · *vuông ~256×256*  
Vật phẩm bậc 1 — Đèn giấy rơi nghiêng, nến còn leo lét. Rơi từ tay ai thì không rõ.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a fallen paper lantern lying on its side, its candle guttering, one panel torn, painted rabbit motif visible on the intact side
```

#### `images/items/queHoa.webp`
**Quế Hoa** · *vuông ~256×256*  
Vật phẩm bậc 2 — Chùm hoa quế vàng li ti. Thơm một góc cung trăng.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a small cluster of tiny golden cassia flowers on a dark twig, four-petalled blossoms, faint gold shimmer
```

#### `images/items/nguyetAnhSa.webp`
**Nguyệt Ảnh Sa** · *vuông ~256×256*  
Vật phẩm bậc 3 — Cát bạc lấp lánh như ánh trăng bị nghiền vụn. Nắm trong tay thì mát rượi.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a shallow pan of fine silver-blue sand that glitters like captured moonlight, a few coarser grains catching the light
```

#### `images/items/ngocThoMao.webp`
**Ngọc Thố Mao** · *vuông ~256×256*  
Vật phẩm bậc 4 — Nhúm lông thỏ ngọc trắng phát sáng. Thỏ thay lông, người nhặt lộc.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a tuft of luminous white rabbit fur bound with a thin silver thread, faintly translucent at the tips
```

#### `images/items/nguyetTinhDanSa.webp`
**Nguyệt Tinh Đan Sa** · *vuông ~256×256*  
Vật phẩm bậc 5 — Bột thuốc giã cùng Ngọc Thố trong cối ngọc. Giã ngàn năm chưa xong một mẻ.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a small jade mortar holding pale luminous cinnabar powder, a miniature jade pestle resting against it, cold white glow
```

#### `images/items/quangHanChi.webp`
**Quảng Hàn Chi** · *vuông ~256×256*  
Vật phẩm bậc 6 — Nhánh quế chiết từ cây ngàn tuổi trên cung trăng. Vỏ phủ sương bạc không tan.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a cut branch from the moon cassia, bark of frosted silver with gold blossoms still attached, cold pale aura
```

#### `images/enemies/thoYeu.webp`
**Thố Yêu** · *dọc 3:4*  
Quái Lv1 — Thỏ hoang lạc lên cung trăng, ăn nhầm thuốc rơi, lông mọc dài ra trắng lốp.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a wild rabbit that strayed onto the moon, fur grown long and unnaturally white, eyes faintly luminous red, nose twitching, moon dust on its paws
```

#### `images/enemies/queHuongYeu.webp`
**Quế Hương Yêu** · *dọc 3:4*  
Quái Lv25 — Hương quế đọng lại ngàn năm thành hình người, thoảng qua là mê, hít sâu là ngã.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a demon condensed from a thousand years of cassia perfume, a slender figure whose body is drifting golden blossom and scented haze, alluring blurred face, petals spiralling around it
```

#### `images/enemies/ngocThiem.webp`
**Ngọc Thiềm** · *dọc 3:4*  
Quái Lv55 — Cóc ngọc ba chân ngồi giữa vũng trăng, da nó cứng hơn đá, nuốt vàng nhả bạc.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a colossal three-legged jade toad squatting in a pool of moonlight, skin of veined green jade harder than stone, gold coins spilling from its wide mouth, heavy-lidded ancient eyes
```

#### `images/enemies/nguyetMaAnh.webp`
**Nguyệt Ma Ảnh** · *dọc 3:4*  
Quái Lv85 — Bóng tối bị ánh trăng bỏ sót, càng soi càng đậm, cuối cùng đứng dậy đi được.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a shadow the moonlight failed to erase, a pitch-black humanoid silhouette with no features, edges sharpening the brighter the light gets, standing upright on silver stone
```

#### `images/items/yvNgocThoNguyetSu.webp`
**Ngọc Thố Nguyệt Sứ** · *dọc 3:4*  
Yêu Vương Lv10 — Thỏ ngọc giã thuốc cho Hằng Nga, chày trong tay nó nặng bằng cả một quả núi.  
```
Wuxia xianxia world-boss portrait, imposing upper-body framing, dramatic semi-realistic painterly digital art, powerful aura and swirling energy, low camera angle conveying scale, cinematic rim lighting, dark stormy atmospheric background, facing viewer, no text, no border — the jade rabbit envoy of the moon, a tall bipedal white rabbit in flowing silver-blue ceremonial cloth, hefting an enormous jade pestle like a warhammer, moon dust exploding from the impact point, cold silver aura
```

#### `images/items/yvThaiAmThiemVuong.webp`
**Thái Âm Thiềm Vương** · *dọc 3:4*  
Yêu Vương Lv60 — Cóc chúa nuốt trăng, mỗi lần nó há miệng là mặt đất tối đi một khắc.  
```
Wuxia xianxia world-boss portrait, imposing upper-body framing, dramatic semi-realistic painterly digital art, powerful aura and swirling energy, low camera angle conveying scale, cinematic rim lighting, dark stormy atmospheric background, facing viewer, no text, no border — the moon-devouring toad sovereign, a mountainous jade-black toad with a crown of bony ridges, mouth opened impossibly wide swallowing the moonlight itself, the landscape dimming around it, cold void-blue glow in its throat
```

#### `images/dungeons/queAnhLam.webp`
**Quế Ảnh Lâm** · *ngang 16:9 ~1200×675*  
Bí Cảnh Lv25 — Rừng quế bóng lồng bóng, đi mãi vẫn thấy cùng một gốc cây.  
```
Wuxia xianxia dungeon cover art, wide cinematic interior or terrain shot, semi-realistic painterly digital art, strong depth and mood, ominous inviting atmosphere, no characters, no text, no border — a cassia forest where the shadows overlap wrongly, golden blossoms falling endlessly, every path curving back toward the same enormous trunk, silver-blue moonlight from no visible source
```

#### `images/dungeons/quangHanCungKhuyet.webp`
**Quảng Hàn Cung Khuyết** · *ngang 16:9 ~1200×675*  
Bí Cảnh Lv70 — Cung điện lạnh trên trăng, hành lang dài hun hút, không một hơi ấm nào.  
```
Wuxia xianxia dungeon cover art, wide cinematic interior or terrain shot, semi-realistic painterly digital art, strong depth and mood, ominous inviting atmosphere, no characters, no text, no border — the cold palace of the moon, a vast empty corridor of pale blue stone and frost-rimed pillars receding into darkness, no fire and no warmth anywhere, silver light pooling on the floor
```

#### `images/equip/eq_sk_nguyet_hoa_boi_so.webp`
**Nguyệt Hoa Bội · Sơ** · *vuông ~256×256*  
Rơi 0,5% từ Yêu Vương · bản Sơ, mộc mạc  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a simple pale-jade pendant carved as a crescent moon, plain silver-blue cord
```

#### `images/equip/eq_sk_nguyet_hoa_boi_thuong.webp`
**Nguyệt Hoa Bội · Thượng** · *vuông ~256×256*  
Rơi 0,5% từ Yêu Vương · bản Thượng, lộng lẫy hơn hẳn bản Sơ  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — an ornate pendant of moonstone and silver carved as a full moon wreathed in cassia blossom, layered silver-blue tassels, cold luminous glow
```

#### `images/equip/eq_sk_quang_han_an_so.webp`
**Quảng Hàn Ấn · Sơ** · *vuông ~256×256*  
Rơi 0,5% từ Bí Cảnh · bản Sơ, mộc mạc  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a small square seal of pale grey stone, a crescent carved into its base, frost in the grooves
```

#### `images/equip/eq_sk_quang_han_an_thuong.webp`
**Quảng Hàn Ấn · Thượng** · *vuông ~256×256*  
Rơi 0,5% từ Bí Cảnh · bản Thượng, lộng lẫy hơn hẳn bản Sơ  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a square seal of white moon-jade topped with a crouching rabbit finial, archaic script on the base, cold silver light spilling from the strokes
```

#### `images/pets/pet_ngocTho_base.webp`
**Ngọc Thố** · *dọc 3:4*  
Linh Thú — dạng thường · hệ thuy  
```
Wuxia xianxia spirit-beast companion, full-body creature, semi-realistic painterly digital art, appealing collectible creature design, soft magical aura matching its element, cinematic rim lighting, dark atmospheric background, no text, no border — a jade rabbit spirit, coat of luminous white with faint jade-green translucence at the ear tips, large calm red eyes, a tiny jade pestle held against its chest, faint blue Thuy-element aura, sitting upright
```

#### `images/pets/pet_ngocTho_awk.webp`
**Ngọc Thố · Thức Tỉnh** · *dọc 3:4*  
Linh Thú — dạng thức tỉnh  
```
Wuxia xianxia spirit-beast in an awakened stronger form, full-body creature, semi-realistic painterly digital art, glowing sigils and intense elemental aura, same colour identity as its base form, cinematic rim lighting, dark atmospheric background, no text, no border — the same creature as its base form, now awakened: larger and fiercer, glowing sigils on its body, its element aura burning far brighter and streaming off it, same colour identity so it reads as the same creature grown into its power
```

#### `images/pets/skill_ngocTho_p.webp`
**Thiềm Cung Hộ** · *vuông ~256×256*  
Tuyệt kĩ bị động — Linh khí cung trăng hộ thân — gánh thay chủ thêm 10% sát thương mỗi trận.  
```
Wuxia martial technique icon, dynamic depiction of the move itself with the beast implied rather than centered, semi-realistic painterly digital art, strong motion and elemental energy, dark neutral background, readable at small size, no text, no border — a translucent dome of pale moonlight shielding a small figure, jade cassia patterns rippling across the barrier surface
```

#### `images/pets/skill_ngocTho_a.webp`
**Ngọc Chử Đảo** · *vuông ~256×256*  
Tuyệt kĩ chủ động — Giã một chày ngọc, thuốc bắn ra hồi sức cho chủ.  
```
Wuxia martial technique icon, dynamic depiction of the move itself with the beast implied rather than centered, semi-realistic painterly digital art, strong motion and elemental energy, dark neutral background, readable at small size, no text, no border — a jade pestle slamming down into a jade mortar, luminous medicine powder and moon dust exploding outward
```

#### `images/items/egg_ngocTho_linh.webp`
**Ngọc Thố Noãn · Hiếm** · *vuông ~512×512*  
Trứng trắng ngà ánh ngọc của Ngọc Thố. Ấp nở ra linh thố cung trăng.  
```
a single upright egg centered in frame, semi-realistic painterly digital art, ornate gold filigree flame-vines painted across the shell surface in a symmetrical pattern rising from the base, one faceted gem set at the front centre, plain egg silhouette with no cage or stand, plain pure white background, soft even lighting, no shadow, no text, no border — moon-white shell, gold filigree curling like cassia sprays and crescent moons, a jade gem at the front centre
```

#### `images/items/banhTrungThu.webp`
**Bánh Trung Thu** · *vuông ~256×256*  
Món ăn riêng — Bánh nướng nhân sen trứng muối. Cắt một góc, tròn một mùa trăng.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a round golden-brown mooncake stamped with an ornate character-and-flower pattern on top, one quarter cut away revealing dark lotus paste and a whole salted egg yolk
```

#### `images/avatars/sk_trungthu_nam.webp`
**Sự Kiện Trung Thu · Nam** · *vuông 1:1 ~512×512*  
Ảnh đại diện mua ở quầy.  
```
Wuxia xianxia character portrait avatar, head and shoulders, semi-realistic painterly digital art, face clearly readable at small size, festive seasonal costume, cinematic soft lighting, no text, no border — a young man in silver-blue moonlit robes holding a small rabbit lantern, calm wondering upward gaze, cassia blossom and moonlight bokeh behind
```

#### `images/avatars/sk_trungthu_nu.webp`
**Sự Kiện Trung Thu · Nữ** · *vuông 1:1 ~512×512*  
Ảnh đại diện mua ở quầy.  
```
Wuxia xianxia character portrait avatar, head and shoulders, semi-realistic painterly digital art, face clearly readable at small size, festive seasonal costume, cinematic soft lighting, no text, no border — a young woman in flowing white and silver-blue celestial robes, long ribbons drifting, cassia blossom in her hair, serene expression, moonlight bokeh behind
```

#### `images/avatars/cover_sk_trungthu.webp`
**Ảnh bìa Quảng Hàn Nguyệt Cảnh** · *ngang rất rộng ~1600×500*  
Ảnh bìa hồ sơ — CŨNG là banner màn Sự Kiện.  
```
Wuxia xianxia profile banner art, ultra-wide cinematic scene, semi-realistic painterly digital art, visual interest weighted to the right half with calm empty space on the left, no characters in the left third, no text, no border — an ultra-wide moon palace vista, empty pale silver-blue stone floor and starfield on the left, the great blooming cassia tree, floating lanterns and the jade rabbit silhouette massed on the right
```

---

# 6 · SỰ KIỆN GIÁNG SINH — Hàn Tùng Tuyết Nguyên

> Rừng thông tuyết phủ, chuông đồng khẽ vang — cuối rừng có căn nhà gỗ còn khói bếp.
>
> Tông màu chủ đạo `#7dd3fc` — sáu bộ phải khác tông rõ rệt để nhìn là biết đang ở sự kiện nào.

#### `images/locations/hanTungTuyetNguyen.webp`
**Hàn Tùng Tuyết Nguyên** · *ngang rộng ~1600×900*  
Nền bản đồ của vùng sự kiện.  
```
Wuxia xianxia landscape key art, wide cinematic panorama, semi-realistic painterly digital art, rich atmospheric depth, dramatic natural lighting, no characters in foreground, no text, no border, no watermark — a snowbound pine forest at dusk, warm amber lanterns hanging from the laden branches, small brass bells tied to the boughs, a line of white reindeer moving between the trunks, a timber cabin at the far end with smoke rising from its chimney, deep blue snow shadows against warm window light
```

#### `images/skills/thaiTuyet.webp`
**Thái Tuyết** · *vuông ~256×256*  
Hái tuyết tinh  
```
Game skill icon, single emblematic object centered in frame, semi-realistic painterly digital art, soft rim light, dark neutral background, clean silhouette readable at small size, no text, no border — a mittened hand cupping a perfect six-armed snow crystal, a small brass bell and a sprig of pine needles beside it, cold blue glow
```

#### `images/items/quaThongKho.webp`
**Quả Thông Khô** · *vuông ~256×256*  
Vật phẩm bậc 1 — Quả thông khô vảy nở bung. Còn dính một dúm tuyết chưa tan.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a single dry brown pine cone, scales fully opened, a dusting of snow caught between them
```

#### `images/items/manhChuongDong.webp`
**Mảnh Chuông Đồng** · *vuông ~256×256*  
Vật phẩm bậc 2 — Mảnh chuông vỡ còn ngân được nửa tiếng. Nửa tiếng kia ai đó giữ.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a curved shard broken from a small brass bell, warm patina, the clapper ring still attached at one edge
```

#### `images/items/tuyetTinh.webp`
**Tuyết Tinh** · *vuông ~256×256*  
Vật phẩm bậc 3 — Bông tuyết sáu cánh không chịu tan. Soi lên có ánh xanh lam.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a single large perfect six-armed snow crystal held in mid-air, faceted like cut glass, pale blue inner light
```

#### `images/items/thongChiXanh.webp`
**Thông Chi Xanh** · *vuông ~256×256*  
Vật phẩm bậc 4 — Cành thông tươi rỉ nhựa thơm. Treo lên cửa là thấy ấm nhà.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a fresh cut pine branch with deep green needles and a little snow, resin beading at the cut end
```

#### `images/items/bangLoChau.webp`
**Băng Lộ Châu** · *vuông ~256×256*  
Vật phẩm bậc 5 — Giọt sương đóng băng trong vắt, giữa lõi khoá một ngôi sao giá.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a flawless bead of frozen dew, clear as glass with a frost star locked inside it, resting on a pine needle
```

#### `images/items/hanTungTuy.webp`
**Hàn Tùng Tủy** · *vuông ~256×256*  
Vật phẩm bậc 6 — Lõi tùng già ngàn vòng tuổi, sương giá mọc ra từ thớ gỗ. Lạnh mà không mục.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a core sample of ancient frost-pine heartwood, pale rings visible, hoarfrost growing outward from its surface, cold blue aura
```

#### `images/enemies/socTuyet.webp`
**Sóc Tuyết** · *dọc 3:4*  
Quái Lv1 — Sóc lông trắng tha quả thông về tổ, ai lại gần là nó ném xuống đầu.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a white winter squirrel on a snowy branch, cheeks stuffed, clutching a pine cone ready to throw, indignant expression, breath fogging
```

#### `images/enemies/tuyetDongTu.webp`
**Tuyết Đồng Tử** · *dọc 3:4*  
Quái Lv25 — Người tuyết trẻ con nặn dở, đêm xuống thì tự gắn thêm tay mà chạy.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a half-finished snow child come alive at night, mismatched twig arms it attached itself, a chipped charcoal grin, one button eye missing, running lopsided through the drifts
```

#### `images/enemies/bangHung.webp`
**Băng Hùng** · *dọc 3:4*  
Quái Lv55 — Gấu trắng ngủ đông bị đánh thức, bộ lông đóng băng thành một lớp giáp.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a huge white bear woken early from hibernation, its fur frozen into overlapping plates of natural ice armor, steam from its nostrils, furious small eyes
```

#### `images/enemies/hanSuongYeu.webp`
**Hàn Sương Yêu** · *dọc 3:4*  
Quái Lv85 — Sương giá đọng trên cành thông đủ trăm mùa thì kết thành hình người, chạm vào là buốt tới xương.  
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border — a frost demon condensed from a hundred winters of rime on pine branches, an elongated humanoid of clear jagged ice, breath that freezes the air visibly, hollow glacier-blue eyes
```

#### `images/items/yvBachGiacLocVuong.webp`
**Bạch Giác Lộc Vương** · *dọc 3:4*  
Yêu Vương Lv10 — Tuần lộc gạc trắng dẫn đầu đàn, vó nó đạp lên tuyết mà không để lại vết.  
```
Wuxia xianxia world-boss portrait, imposing upper-body framing, dramatic semi-realistic painterly digital art, powerful aura and swirling energy, low camera angle conveying scale, cinematic rim lighting, dark stormy atmospheric background, facing viewer, no text, no border — the white-antlered reindeer king, a majestic stag with enormous branching antlers of pale bone hung with tiny bells, hooves striking above the snow without leaving prints, aurora light behind him
```

#### `images/items/yvTuyetSonLaoNhan.webp`
**Tuyết Sơn Lão Nhân** · *dọc 3:4*  
Yêu Vương Lv60 — Ông lão sống trong nhà gỗ cuối rừng, mỗi năm đúng một đêm gõ cửa từng nhà, và không ai nhớ mặt ông.  
```
Wuxia xianxia world-boss portrait, imposing upper-body framing, dramatic semi-realistic painterly digital art, powerful aura and swirling energy, low camera angle conveying scale, cinematic rim lighting, dark stormy atmospheric background, facing viewer, no text, no border — the old man of the snow mountain, a broad figure in a heavy fur-lined red-brown coat with a hood, face always in shadow so no one remembers it, carrying an enormous bulging sack, blizzard swirling around him, warm lantern in one hand against cold blue night
```

#### `images/dungeons/tungTuyetKinh.webp`
**Tùng Tuyết Kính** · *ngang 16:9 ~1200×675*  
Bí Cảnh Lv25 — Lối mòn giữa rừng thông, tuyết dày tới gối, đi được nửa đường thì mất dấu chân mình.  
```
Wuxia xianxia dungeon cover art, wide cinematic interior or terrain shot, semi-realistic painterly digital art, strong depth and mood, ominous inviting atmosphere, no characters, no text, no border — a narrow trail through a dense pine forest, snow up to knee height, the path ahead unbroken while the footprints behind have already vanished, flat grey winter light
```

#### `images/dungeons/hanChungDien.webp`
**Hàn Chung Điện** · *ngang 16:9 ~1200×675*  
Bí Cảnh Lv70 — Điện thờ treo ngàn chiếc chuông băng, chuông nào vang lên thì một người quên mất một chuyện.  
```
Wuxia xianxia dungeon cover art, wide cinematic interior or terrain shot, semi-realistic painterly digital art, strong depth and mood, ominous inviting atmosphere, no characters, no text, no border — a hall of ice hung with a thousand translucent bells of every size, each strung on frozen cord, faint blue light refracting through them, breath-fog drifting, absolute stillness
```

#### `images/equip/eq_sk_tuyet_linh_boi_so.webp`
**Tuyết Linh Bội · Sơ** · *vuông ~256×256*  
Rơi 0,5% từ Yêu Vương · bản Sơ, mộc mạc  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a simple pendant of frosted pale glass shaped like a snow crystal, plain white cord
```

#### `images/equip/eq_sk_tuyet_linh_boi_thuong.webp`
**Tuyết Linh Bội · Thượng** · *vuông ~256×256*  
Rơi 0,5% từ Yêu Vương · bản Thượng, lộng lẫy hơn hẳn bản Sơ  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — an ornate pendant of silver and clear ice carved as a snow crystal wreathed in pine needles, tiny brass bells on the tassels, cold white radiance
```

#### `images/equip/eq_sk_han_chung_an_so.webp`
**Hàn Chung Ấn · Sơ** · *vuông ~256×256*  
Rơi 0,5% từ Bí Cảnh · bản Sơ, mộc mạc  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a small square seal of pale frosted stone, a tiny bell carved into its base
```

#### `images/equip/eq_sk_han_chung_an_thuong.webp`
**Hàn Chung Ấn · Thượng** · *vuông ~256×256*  
Rơi 0,5% từ Bí Cảnh · bản Thượng, lộng lẫy hơn hẳn bản Sơ  
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border — a square seal of clear blue glacier ice topped with a bell finial, archaic script frozen into the base, pale blue light shining through the whole block
```

#### `images/pets/pet_bachLoc_base.webp`
**Bạch Lộc** · *dọc 3:4*  
Linh Thú — dạng thường · hệ thuy  
```
Wuxia xianxia spirit-beast companion, full-body creature, semi-realistic painterly digital art, appealing collectible creature design, soft magical aura matching its element, cinematic rim lighting, dark atmospheric background, no text, no border — a young white deer spirit, coat of pure snow-white with faint frost patterning along the flank, small budding antlers hung with two tiny brass bells, warm dark eyes, faint blue Thuy-element aura, standing on untouched snow leaving no prints
```

#### `images/pets/pet_bachLoc_awk.webp`
**Bạch Lộc · Thức Tỉnh** · *dọc 3:4*  
Linh Thú — dạng thức tỉnh  
```
Wuxia xianxia spirit-beast in an awakened stronger form, full-body creature, semi-realistic painterly digital art, glowing sigils and intense elemental aura, same colour identity as its base form, cinematic rim lighting, dark atmospheric background, no text, no border — the same creature as its base form, now awakened: larger and fiercer, glowing sigils on its body, its element aura burning far brighter and streaming off it, same colour identity so it reads as the same creature grown into its power
```

#### `images/pets/skill_bachLoc_p.webp`
**Đạp Tuyết Vô Ngân** · *vuông ~256×256*  
Tuyệt kĩ bị động — Bước không dấu — Sinh Lực Linh Thú tăng 20%.  
```
Wuxia martial technique icon, dynamic depiction of the move itself with the beast implied rather than centered, semi-realistic painterly digital art, strong motion and elemental energy, dark neutral background, readable at small size, no text, no border — a white deer stepping across deep snow leaving no prints at all, frost blooming outward from where each hoof passes
```

#### `images/pets/skill_bachLoc_a.webp`
**Hàn Chung Nhất Kích** · *vuông ~256×256*  
Tuyệt kĩ chủ động — Lắc chuông trên gạc, tiếng ngân hồi sức cho chủ.  
```
Wuxia martial technique icon, dynamic depiction of the move itself with the beast implied rather than centered, semi-realistic painterly digital art, strong motion and elemental energy, dark neutral background, readable at small size, no text, no border — a bell of clear blue ice struck and ringing, concentric rings of cold light spreading out through falling snow
```

#### `images/items/egg_bachLoc_linh.webp`
**Bạch Lộc Noãn · Hiếm** · *vuông ~512×512*  
Trứng trắng tuyết vân băng của Bạch Lộc. Ấp nở ra linh lộc gạc treo chuông.  
```
a single upright egg centered in frame, semi-realistic painterly digital art, ornate gold filigree flame-vines painted across the shell surface in a symmetrical pattern rising from the base, one faceted gem set at the front centre, plain egg silhouette with no cage or stand, plain pure white background, soft even lighting, no shadow, no text, no border — frost-fern shell, gold filigree branching like antlers and pine needles, a pale-blue gem at the front centre
```

#### `images/items/banhGungMat.webp`
**Bánh Gừng Mật** · *vuông ~256×256*  
Món ăn riêng — Bánh gừng hình cây thông rưới mật. Cay ấm từ cổ xuống bụng.  
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border — a glazed gingerbread biscuit shaped like a small pine tree, white icing piped along the edges, a drizzle of dark honey pooling beside it
```

#### `images/avatars/sk_giangsinh_nam.webp`
**Sự Kiện Giáng Sinh · Nam** · *vuông 1:1 ~512×512*  
Ảnh đại diện mua ở quầy.  
```
Wuxia xianxia character portrait avatar, head and shoulders, semi-realistic painterly digital art, face clearly readable at small size, festive seasonal costume, cinematic soft lighting, no text, no border — a young man in a heavy fur-collared winter coat of deep green, snow on his shoulders, breath fogging, warm easy smile, lantern-lit snowy pine bokeh behind
```

#### `images/avatars/sk_giangsinh_nu.webp`
**Sự Kiện Giáng Sinh · Nữ** · *vuông 1:1 ~512×512*  
Ảnh đại diện mua ở quầy.  
```
Wuxia xianxia character portrait avatar, head and shoulders, semi-realistic painterly digital art, face clearly readable at small size, festive seasonal costume, cinematic soft lighting, no text, no border — a young woman in a white fur-trimmed winter robe with a red sash, snowflakes caught in her hair, bright cheerful expression, lantern-lit snowy pine bokeh behind
```

#### `images/avatars/cover_sk_giangsinh.webp`
**Ảnh bìa Hàn Tùng Tuyết Nguyên** · *ngang rất rộng ~1600×500*  
Ảnh bìa hồ sơ — CŨNG là banner màn Sự Kiện.  
```
Wuxia xianxia profile banner art, ultra-wide cinematic scene, semi-realistic painterly digital art, visual interest weighted to the right half with calm empty space on the left, no characters in the left third, no text, no border — an ultra-wide snowbound pine forest at dusk, empty untouched snowfield and pale sky on the left, lantern-hung pines, bells and a warmly lit timber cabin massed on the right, deep blue shadows and warm amber light
```

---

# PHỤ LỤC — khối STYLE gốc

Đã trộn sẵn vào từng prompt ở trên. Giữ lại ở đây để sửa đồng loạt khi cần đổi phong cách.

**S1**
```
Wuxia xianxia landscape key art, wide cinematic panorama, semi-realistic painterly digital art, rich atmospheric depth, dramatic natural lighting, no characters in foreground, no text, no border, no watermark —
```

**S2**
```
Game skill icon, single emblematic object centered in frame, semi-realistic painterly digital art, soft rim light, dark neutral background, clean silhouette readable at small size, no text, no border —
```

**S3**
```
Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border —
```

**S4**
```
Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border —
```

**S5**
```
Wuxia xianxia world-boss portrait, imposing upper-body framing, dramatic semi-realistic painterly digital art, powerful aura and swirling energy, low camera angle conveying scale, cinematic rim lighting, dark stormy atmospheric background, facing viewer, no text, no border —
```

**S6**
```
Wuxia xianxia dungeon cover art, wide cinematic interior or terrain shot, semi-realistic painterly digital art, strong depth and mood, ominous inviting atmosphere, no characters, no text, no border —
```

**S7**
```
Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border —
```

**S8**
```
Wuxia xianxia spirit-beast companion, full-body creature, semi-realistic painterly digital art, appealing collectible creature design, soft magical aura matching its element, cinematic rim lighting, dark atmospheric background, no text, no border —
```

**S8b**
```
Wuxia xianxia spirit-beast in an awakened stronger form, full-body creature, semi-realistic painterly digital art, glowing sigils and intense elemental aura, same colour identity as its base form, cinematic rim lighting, dark atmospheric background, no text, no border —
```

**S8c**
```
Wuxia martial technique icon, dynamic depiction of the move itself with the beast implied rather than centered, semi-realistic painterly digital art, strong motion and elemental energy, dark neutral background, readable at small size, no text, no border —
```

**S9**
```
a single upright egg centered in frame, semi-realistic painterly digital art, ornate gold filigree flame-vines painted across the shell surface in a symmetrical pattern rising from the base, one faceted gem set at the front centre, plain egg silhouette with no cage or stand, plain pure white background, soft even lighting, no shadow, no text, no border —
```

**S10**
```
Wuxia xianxia character portrait avatar, head and shoulders, semi-realistic painterly digital art, face clearly readable at small size, festive seasonal costume, cinematic soft lighting, no text, no border —
```

**S11**
```
Wuxia xianxia profile banner art, ultra-wide cinematic scene, semi-realistic painterly digital art, visual interest weighted to the right half with calm empty space on the left, no characters in the left third, no text, no border —
```
