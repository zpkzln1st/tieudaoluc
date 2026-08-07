# ART — HỆ SỰ KIỆN (sáu sự kiện)

Đi kèm `docs/THIET_KE_SU_KIEN.md`.
Cách dùng: mỗi loại tệp có một **khối STYLE** dán trước, rồi nối phần riêng của từng tệp vào sau dấu gạch ngang.

---

## BẢNG ĐẾM

| loại | mỗi sự kiện | sáu sự kiện | thư mục đích |
|---|---|---|---|
| Nền bản đồ | 1 | 6 | `images/locations/` |
| Icon kĩ năng | 1 | 6 | `images/skills/` |
| Icon vật phẩm | 6 | 36 | `images/items/` |
| Chân dung quái | 4 | 24 | `images/enemies/` |
| Chân dung Yêu Vương | 2 | 12 | `images/enemies/` |
| Bìa Bí Cảnh | 2 | 12 | `images/dungeons/` |
| Icon phụ kiện | 4 | 24 | `images/equip/` |
| Linh Thú | 1 | 6 | `images/pets/` |
| Trứng Linh Thú | 1 | 6 | `images/items/` |
| Ảnh đại diện | 2 | 12 | `images/avatars/` |
| Ảnh bìa hồ sơ | 1 | 6 | `images/avatars/` |
| Icon món ăn riêng | 1 | 6 | `images/items/` |
| **Cộng theo sự kiện** | **26** | **156** | |

| dùng chung, không nhân sáu | số tệp |
|---|---|
| Icon Điểm Sự Kiện | 1 |
| Khung hai ô Phụ Kiện Sự Kiện | 1 |
| Dấu "sự kiện đang mở" trên bản đồ thế giới | 1 |
| **Cộng** | **3** |

# TỔNG: 159 tệp

Làm từng sự kiện một thì mỗi đợt chỉ cần **26 tệp**. Ba tệp dùng chung làm một lần cho cả sáu.
Định dạng `.webp` cho mọi tệp, đúng như art đang có trong kho.

---

## KHỐI STYLE — dán TRƯỚC phần riêng

**S1 · Nền bản đồ** *(khổ ngang rộng, ~1600×900)*
`Wuxia xianxia landscape key art, wide cinematic panorama, semi-realistic painterly digital art, rich atmospheric depth, dramatic natural lighting, no characters in foreground, no text, no border, no watermark —`

**S2 · Icon kĩ năng** *(vuông, ~256×256, nền tối trung tính)*
`Game skill icon, single emblematic object centered in frame, semi-realistic painterly digital art, soft rim light, dark neutral background, clean silhouette readable at small size, no text, no border —`

**S3 · Icon vật phẩm** *(vuông, ~256×256)*
`Game inventory item icon, one single object centered, three-quarter view, semi-realistic painterly digital art, subtle rim light and soft drop shadow, plain dark neutral background, clean readable silhouette at 64px, no text, no border —`

**S4 · Chân dung quái thường** *(dọc 3:4)*
`Wuxia xianxia creature portrait, upper-body framing, semi-realistic painterly digital art, cinematic rim lighting, dark atmospheric background, facing viewer, subject in upper-center of frame, no text, no border —`

**S5 · Chân dung Yêu Vương** *(dọc 3:4, hoành tráng hơn S4)*
`Wuxia xianxia world-boss portrait, imposing upper-body framing, dramatic semi-realistic painterly digital art, powerful aura and swirling energy, low camera angle conveying scale, cinematic rim lighting, dark stormy atmospheric background, facing viewer, no text, no border —`

**S6 · Bìa Bí Cảnh** *(ngang 16:9, ~1200×675)*
`Wuxia xianxia dungeon cover art, wide cinematic interior or terrain shot, semi-realistic painterly digital art, strong depth and mood, ominous inviting atmosphere, no characters, no text, no border —`

**S7 · Icon phụ kiện** *(vuông, ~256×256)*
`Ornate wuxia accessory item icon, single jewelry or talisman object centered, three-quarter view, semi-realistic painterly digital art, precious materials with fine engraved detail, gentle inner glow, plain dark neutral background, no text, no border —`

**S8 · Linh Thú** *(dọc 3:4)*
`Wuxia xianxia spirit-beast companion, full-body creature, semi-realistic painterly digital art, appealing collectible creature design, soft magical aura matching its element, cinematic rim lighting, dark atmospheric background, no text, no border —`

**S9 · Trứng Linh Thú** *(vuông, ~256×256)*
`Fantasy spirit-beast egg icon, single ornate egg centered, semi-realistic painterly digital art, patterned shell with faint inner glow, resting on nothing, plain dark neutral background, no text, no border —`

**S10 · Ảnh đại diện** *(vuông 1:1, ~512×512, crop vào mặt)*
`Wuxia xianxia character portrait avatar, head and shoulders, semi-realistic painterly digital art, face clearly readable at small size, festive seasonal costume, cinematic soft lighting, no text, no border —`

**S11 · Ảnh bìa hồ sơ** *(ngang rất rộng ~1600×500, chừa khoảng trống bên trái cho chữ)*
`Wuxia xianxia profile banner art, ultra-wide cinematic scene, semi-realistic painterly digital art, visual interest weighted to the right half with calm empty space on the left, no characters in the left third, no text, no border —`

---

# 0. BA TỆP DÙNG CHUNG

**`images/currency/diemSuKien.webp`** — Icon Điểm Sự Kiện. Dùng S3.
`a round festival token coin of warm gold, an auspicious knot pattern stamped on its face, a red silk tassel threaded through the square center hole, faint warm glow`

**`images/ui/oPhuKienSuKien.webp`** — Khung hai ô Phụ Kiện Sự Kiện. Dùng S3.
`two empty ornate equipment sockets side by side carved from dark jade, thin gold filigree rim around each, one socket faintly warm-toned and the other faintly cool-toned, seen flat from the front`

**`images/ui/dauSuKien.webp`** — Dấu "sự kiện đang mở" trên bản đồ thế giới. Dùng S3.
`a small red festival lantern hanging from a curved gold hook, gently glowing from within, a tiny banner ribbon beneath it`

---

# 1. SỰ KIỆN TẾT — Trường Xuân Miếu Hội

## Nền bản đồ · S1
**`images/locations/truongXuanMieuHoi.webp`**
`a Lunar New Year temple fair courtyard at midnight, rows of red paper lanterns strung overhead, a tall bamboo new-year pole with streamers, spent red firecracker paper carpeting the flagstones, yellow apricot and pink peach blossom branches against an old brick wall, incense smoke drifting, warm red-and-gold glow against deep blue night`

## Icon kĩ năng · S2
**`images/skills/thaiPhuc.webp`**
`a pair of hands gathering red paper fortune slips and a sprig of yellow apricot blossom, warm gold light between the fingers`

## Icon vật phẩm · S3
| tệp | phần riêng |
|---|---|
| `xacPhaoDo.webp` | `a small heap of spent red firecracker paper shreds, scorched edges, faint wisp of smoke` |
| `cauDoiDo.webp` | `a rolled red couplet scroll tied with gold cord, black calligraphy strokes barely visible on the exposed edge` |
| `maiVangCanhKep.webp` | `a sprig of double-petal golden apricot blossom, five or six open flowers on a dark twig` |
| `phongBaoDo.webp` | `a red silk lucky envelope embossed with a gold auspicious pattern, corner slightly lifted` |
| `tramHuongNguyenDan.webp` | `a bundle of dark incense sticks bound with red thread, tips glowing faint orange, thin smoke curling` |
| `locCayNeu.webp` | `a small budding branch cut from a new-year bamboo pole, a red ribbon and a tiny brass bell tied to it, faint green-gold aura` |

## Chân dung quái · S4
| tệp | phần riêng |
|---|---|
| `lanCon.webp` | `a small lion-dance lion head come to life, red and gold papier-mache with fur trim, round mirror eyes blinking, one paw raised playfully, temple courtyard behind` |
| `phaoYeu.webp` | `a lithe demon formed entirely of coiled red firecracker strings and scorched paper, sparks popping along its limbs, smoke trailing, mischievous burning eyes` |
| `kimNguuMieu.webp` | `a massive stone temple ox stirring awake, cracked grey granite hide with gold leaf flaking off, glowing amber eyes, moss in the carved grooves, heavy and immovable` |
| `thuTueQuy.webp` | `a gaunt year-guarding demon in tattered ceremonial robes, holding an hourglass of red sand, face half hidden by a cracked opera mask, cold blue-red aura` |

## Chân dung Yêu Vương · S5
| tệp | phần riêng |
|---|---|
| `yvLanVuong.webp` | `the king of lion-dance lions, enormous crimson mane blazing like fire, gilded horn and mirrored eyes, mid-leap above a drum, shockwaves of sound rippling outward, festival lanterns scattering` |
| `yvNienThu.webp` | `the legendary Nian beast, bronze horns and iron scales, lion-dragon body the size of a house, jaws wide open swallowing lantern light, red banners shredding in the wind around it` |

## Bìa Bí Cảnh · S6
| tệp | phần riêng |
|---|---|
| `mieuDuongCo.webp` | `an ancient temple courtyard deep at night, unburnt incense smoke still hanging in the air, rows of shadowed deity statues watching from the colonnade, a single red lantern lit at the far end` |
| `truongXuanDien.webp` | `the inner hall of a grand new-year temple, vermilion lacquer columns with gold leaf, a thousand candles burning in tiered racks, gold ceiling coffers vanishing into darkness above` |

## Icon phụ kiện · S7
| tệp | phần riêng |
|---|---|
| `eq_sk_xuan_huy_boi_so.webp` | `a modest round jade pendant carved with an apricot blossom, plain red silk cord` |
| `eq_sk_xuan_huy_boi_thuong.webp` | `an opulent gold-rimmed jade pendant carved with apricot blossom and a coiled dragon, layered red silk tassels, warm inner radiance` |
| `eq_sk_nguyen_dan_an_so.webp` | `a small square red-stone seal, a simple spring character carved into its base, worn edges` |
| `eq_sk_nguyen_dan_an_thuong.webp` | `an imperial square seal of blood-red jade topped with a gold lion finial, dense archaic script on the base, faint gold light leaking from the carved strokes` |

## Linh Thú và trứng
**`images/pets/kimDongNgu.webp`** · S8
`a golden carp spirit-fish swimming through mid-air, scales of layered polished gold, long flowing crimson fins like silk banners, whiskers trailing sparks, faint gold Kim-element aura, poised as if about to leap a dragon gate`

**`images/items/egg_kimDongNgu.webp`** · S9
`an egg patterned with overlapping golden carp scales, warm gold light pulsing between the scales, tiny red fin-like ridge along the top`

## Ảnh đại diện · S10
| tệp | phần riêng |
|---|---|
| `sk_tet_nam.webp` | `a young man in a crimson new-year robe with gold trim, a sprig of apricot blossom tucked at his collar, warm confident half-smile, red lantern bokeh behind` |
| `sk_tet_nu.webp` | `a young woman in a crimson and gold new-year gown, hair pinned with a peach-blossom ornament, calm bright expression, red lantern bokeh behind` |

## Ảnh bìa hồ sơ · S11
**`images/avatars/cover_sk_tet.webp`**
`an ultra-wide new-year temple fair at night, empty misty flagstones and drifting incense on the left, dense red lanterns, blossom branches and the new-year pole massed on the right, deep blue night sky above`

## Icon món ăn · S3
**`images/items/banhChung.webp`**
`a square Vietnamese sticky-rice cake wrapped in deep green dong leaves and bound with split-bamboo lattice, one corner cut open revealing pale rice and dark mung-bean filling`

---

# 2. SỰ KIỆN MÙA XUÂN — Bích Thảo Nguyên

## Nền bản đồ · S1
**`images/locations/bichThaoNguyen.webp`**
`a vast spring grassland just after rain, tender new grass glistening, a thawing stream cutting through, drifts of wildflowers, clouds of butterflies rising, brightly dyed eggs half hidden in the grass tufts, soft dawn light and a rainbow at the horizon`

## Icon kĩ năng · S2
**`images/skills/thaiThanh.webp`**
`a woven grass basket holding one dyed spring egg and a bundle of fresh green shoots, a single butterfly settling on the rim`

## Icon vật phẩm · S3
| tệp | phần riêng |
|---|---|
| `trungNguSac.webp` | `a single hand-dyed egg banded in five colors with painted floral patterns, faint dew on the shell` |
| `coBichThao.webp` | `a small tuft of tender emerald spring grass pulled up with a clod of dark earth and pale roots` |
| `phanCanhBuom.webp` | `a tiny glass vial of iridescent butterfly-wing powder, cap of carved wood, shimmering rainbow motes inside` |
| `giotXuanLo.webp` | `a single large perfect droplet of spring rain resting on a curled green leaf, sky reflected inside it` |
| `hoaSoXuan.webp` | `one freshly opened pale-pink first-bloom flower on a short green stem, petals still slightly furled` |
| `lieuBiecChi.webp` | `a slender cut willow branch with narrow bright-green leaves, tip curling, faint jade-green aura` |

## Chân dung quái · S4
| tệp | phần riêng |
|---|---|
| `deNonDongCo.webp` | `a small stray kid goat on the plain, soft cream coat with grass stains, nub horns lowered to butt, comically stubborn expression, open grassland behind` |
| `buomDocPhan.webp` | `a large poison butterfly, wings of searing iridescent color, toxic pollen sifting from the wing edges, withered blackened grass below it, faceted compound eyes` |
| `cuQuyReu.webp` | `an ancient giant tortoise mistaken for a hillock, shell buried under thick moss and small shrubs, slow heavy-lidded eyes opening, earth sliding off its back` |
| `thaoMocTinh.webp` | `a humanoid figure woven from the grass of an entire meadow, body of braided stalks and flowering vines, hollow glowing green eyes, fresh grass sprouting where it stands` |

## Chân dung Yêu Vương · S5
| tệp | phần riêng |
|---|---|
| `yvHoaLinh.webp` | `the first flower spirit of spring, a graceful being whose gown is layered blossom petals, crown of budding blooms, hovering above the grass while every flower in view turns toward her, pollen light swirling` |
| `yvThanhDeMocLinh.webp` | `the wood-spirit regent of the Azure Emperor of spring, a colossal humanoid of living green heartwood, antler-like branching crown, roots spreading beneath the whole plain, emerald light in the bark seams` |

## Bìa Bí Cảnh · S6
| tệp | phần riêng |
|---|---|
| `noanThachCoc.webp` | `a narrow valley filled with egg-shaped boulders of pale stone, each faintly lit from within, spring mist pooling between them, thin waterfall at the far end` |
| `thanhDeThanDien.webp` | `an overgrown temple to the spring god, cracked stone columns with flowers pushing through the fissures, vine-draped roof, green light filtering through a broken ceiling` |

## Icon phụ kiện · S7
| tệp | phần riêng |
|---|---|
| `eq_sk_bich_thao_boi_so.webp` | `a simple pale-jade pendant shaped like a curled grass leaf, plain green cord` |
| `eq_sk_bich_thao_boi_thuong.webp` | `a lavish emerald pendant carved as a wreath of spring blossoms and butterfly wings, gold filigree edge, layered green silk tassels, soft green radiance` |
| `eq_sk_thanh_de_an_so.webp` | `a small square seal of rough green stone, a sprout carved into its base` |
| `eq_sk_thanh_de_an_thuong.webp` | `a square seal of deep emerald jade topped with a budding-branch finial, dense archaic script on the base, green light leaking from the carved strokes` |

## Linh Thú và trứng
**`images/pets/thaiVuDiep.webp`** · S8
`a large spirit butterfly with five-colored iridescent wings that shift like oil on water, delicate feathered antennae, trailing motes of pollen light, faint green Moc-element aura, wings caught mid-beat`

**`images/items/egg_thaiVuDiep.webp`** · S9
`an egg with a chrysalis-like silken sheen banded in five soft colors, faint rainbow shimmer moving across the surface, tiny green vine curling around its base`

## Ảnh đại diện · S10
| tệp | phần riêng |
|---|---|
| `sk_xuan_nam.webp` | `a young man in a light spring-green travelling robe, straw hat pushed back, a butterfly resting on his shoulder, bright open expression, sunlit grassland bokeh behind` |
| `sk_xuan_nu.webp` | `a young woman in a pale-green and white spring gown, flower crown of small wildflowers, gentle smiling expression, sunlit grassland bokeh behind` |

## Ảnh bìa hồ sơ · S11
**`images/avatars/cover_sk_xuan.webp`**
`an ultra-wide spring grassland after rain, calm empty misty meadow on the left, a burst of wildflowers, rising butterflies and a thawing stream massed on the right, soft rainbow in a pale morning sky`

## Icon món ăn · S3
**`images/items/banhTroiNguSac.webp`**
`a small bowl of round glutinous rice dumplings in five pastel colors floating in clear ginger syrup, a few sesame seeds scattered on top`

---

# 3. SỰ KIỆN ĐOAN NGỌ — Đoan Dương Giang

## Nền bản đồ · S1
**`images/locations/doanDuongGiang.webp`**
`a wide river at the fiercest noon of summer, long dragon boats racing and throwing spray, a lotus marsh filling one bank with pink blooms, yellow realgar smoke drifting low over the water, five-colored threads and bundled calamus hanging from a wooden pier, harsh white sunlight and deep blue water`

## Icon kĩ năng · S2
**`images/skills/thaiLien.webp`**
`a hand holding a fresh lotus leaf and a golden lotus pod, five-colored thread wound around the wrist, bright water droplets falling`

## Icon vật phẩm · S3
| tệp | phần riêng |
|---|---|
| `laSenNon.webp` | `a single young lotus leaf, still rolled at one edge, beads of water sitting on the waxy green surface` |
| `dayNguSac.webp` | `a braided bracelet of five colored silk threads, ends bound with a small brass ring` |
| `botHungHoang.webp` | `a small ceramic dish of coarse bright-yellow realgar powder, a wooden scoop resting beside it, faint acrid haze above` |
| `guongSenVang.webp` | `a mature golden lotus seed pod on a cut stem, plump seeds set in the honeycomb face` |
| `vayThuyenRong.webp` | `a curved lacquered wooden scale plate broken from a dragon boat hull, crimson paint with gold edging, splintered at one end` |
| `xuongBoChi.webp` | `a length of ancient calamus rhizome with sword-shaped leaves, knotted and pale, faint blue-green aura along the blade edges` |

## Chân dung quái · S4
| tệp | phần riêng |
|---|---|
| `cuaCangDo.webp` | `a bright red river crab up on the pier planks, both claws raised in threat, wet shell gleaming, tiny stalked eyes swivelling` |
| `thuyXaHungHoang.webp` | `a slender water snake with sickly yellow-tinged scales from drinking realgar wine, jaws parted showing dripping fangs, coiled on a lotus leaf` |
| `trauNuocDamSen.webp` | `an enormous water buffalo half submerged in a lotus marsh, lotus roots grown around and through its horns like a tangled crown, mud-caked hide, slow furious eyes` |
| `nguDocYeu.webp` | `a horrifying composite demon of the five poisons fused into one body — snake coils, centipede segments, scorpion tail, gecko limbs and a toad maw — sickly green-purple miasma boiling around it` |

## Chân dung Yêu Vương · S5
| tệp | phần riêng |
|---|---|
| `yvXichLongChu.webp` | `a crimson dragon boat transformed into a true dragon, prow becoming a roaring dragon head, oars becoming clawed limbs, drum-beat shockwaves splitting the river, spray exploding upward` |
| `yvNguDocVuong.webp` | `the sovereign of the five poisons enthroned in a stagnant pool, a vast crowned demon with five different venomous heads on its shoulders, lotus withering black in a ring around it, purple-green fumes` |

## Bìa Bí Cảnh · S6
| tệp | phần riêng |
|---|---|
| `lienHoaDang.webp` | `an endless lotus marsh with leaves the size of small boats, still green water between them, something large moving beneath the surface leaving a wake, hazy hot sunlight` |
| `longChuThuyCung.webp` | `an underwater palace on the riverbed, its columns made from the oars and masts of sunken dragon boats, silt drifting in shafts of green light, carved dragon heads emerging from the gloom` |

## Icon phụ kiện · S7
| tệp | phần riêng |
|---|---|
| `eq_sk_doan_duong_boi_so.webp` | `a simple pendant of pale jade carved as a lotus leaf, braided five-color thread cord` |
| `eq_sk_doan_duong_boi_thuong.webp` | `an ornate pendant of red-gold carved as a dragon boat prow over an open lotus, five-colored silk tassels, warm crimson inner glow` |
| `eq_sk_ngu_doc_an_so.webp` | `a small square seal of dark stone, a coiled snake carved into its base, verdigris in the grooves` |
| `eq_sk_ngu_doc_an_thuong.webp` | `a square seal of black jade topped with a five-headed venomous beast finial, archaic script on the base, sickly green light seeping from the strokes` |

## Linh Thú và trứng
**`images/pets/xichDiemLongCau.webp`** · S8
`a crimson dragon-horse foal, scaled hide the color of hot coals, mane and tail of living flame, small horn buds and fin-like ears, hooves leaving scorch marks in the air, faint red Hoa-element aura`

**`images/items/egg_xichDiemLongCau.webp`** · S9
`an egg of dark scarlet shell with glowing molten cracks running across it, faint heat shimmer, small flame-shaped ridge at the top`

## Ảnh đại diện · S10
| tệp | phần riêng |
|---|---|
| `sk_doanngo_nam.webp` | `a young man stripped to a sleeveless summer tunic, five-colored threads on both wrists, wet hair from river spray, grinning fiercely, dragon-boat river bokeh behind` |
| `sk_doanngo_nu.webp` | `a young woman in a light summer robe of white and lotus pink, a lotus flower tucked behind her ear, five-colored thread bracelet, bright determined expression, river bokeh behind` |

## Ảnh bìa hồ sơ · S11
**`images/avatars/cover_sk_doanngo.webp`**
`an ultra-wide summer river at noon, calm open water and empty sky on the left, dragon boats mid-race, lotus marsh and a crowded pier massed on the right, harsh bright sunlight`

## Icon món ăn · S3
**`images/items/banhUTro.webp`**
`a small pyramid-shaped rice cake wrapped in bamboo leaves and tied with reed string, one unwrapped beside it showing translucent amber lye-water rice`

---

# 4. SỰ KIỆN VU LAN — Vong Xuyên Ngạn

## Nền bản đồ · S1
**`images/locations/vongXuyenNgan.webp`**
`the bank of the Vong Xuyen river on the seventh-month full moon night, thousands of floating paper lanterns drifting downstream in a long river of light, red spider lilies covering the near bank, cold mist just above the black water, indistinct standing silhouettes on the far shore, deep indigo and ember-orange`

## Icon kĩ năng · S2
**`images/skills/thaiDang.webp`**
`a hand lifting a small lit paper lantern from dark water, a red spider lily floating beside it, reflected light rippling`

## Icon vật phẩm · S3
| tệp | phần riêng |
|---|---|
| `hoaDangGiay.webp` | `a small lotus-shaped paper river lantern with a lit candle inside, damp at the base, warm orange glow through the paper petals` |
| `troVangMa.webp` | `a small mound of grey joss-paper ash with a few unburnt gold-foil corners still showing, faint ember glow underneath` |
| `biNganHoa.webp` | `a single red spider lily on a bare leafless stem, long curled crimson filaments splayed like fingers` |
| `honHoaLam.webp` | `a cold pale-blue soul flame hovering free with no fuel, wisping upward, faint face-like shapes suggested in the smoke` |
| `vongXuyenThuy.webp` | `a small stoppered ceramic flask of black river water, the liquid unnaturally still, faint pale reflection on its surface that does not match the room` |
| `manhTamSinhThach.webp` | `a broken shard of dark grey stone with worn carved names crossing its face, faint red light in the incised strokes` |

## Chân dung quái · S4
| tệp | phần riêng |
|---|---|
| `doiGiay.webp` | `a bat folded out of half-burnt joss paper, gold foil flaking from its wings, ember-lit edges, flitting erratically in the dark` |
| `coHonLangThang.webp` | `a wandering hungry ghost, gaunt translucent figure in rotted funeral cloth, sunken hollow eyes, distended belly, reaching with thin desperate hands` |
| `nguuDauTuong.webp` | `the Ox-Head hell warden, a towering bull-headed guardian in black lacquered armor, three-pronged trident planted in the ground, brass nose ring, cold implacable red eyes` |
| `maDienTuong.webp` | `the Horse-Face hell warden, a tall gaunt horse-headed guardian in grey official robes, holding an open name ledger and a brush, reading aloud, hollow black eye sockets` |

## Chân dung Yêu Vương · S5
| tệp | phần riêng |
|---|---|
| `yvDeDangQuySu.webp` | `a lantern-bearing psychopomp demon, tall and thin in trailing dark robes, raising a bone-framed lantern whose light bleaches everything it touches, faint blank-faced spirits following behind it` |
| `yvManhBa.webp` | `Meng Po the old woman of the forgetting broth, hunched over an enormous iron cauldron that has boiled for a thousand years, ladle raised, steam full of drifting faces, cold blue-green light from below` |

## Bìa Bí Cảnh · S6
| tệp | phần riêng |
|---|---|
| `biNganHoaHai.webp` | `an endless sea of red spider lilies with not a single leaf anywhere, low cold mist between the stems, an unnaturally silent path worn through the middle, dark sky above` |
| `naiHaKieu.webp` | `an ancient stone arch bridge over black water, warm lantern light and faint buildings at the near end, the far end dissolving into featureless white fog, worn carved railings` |

## Icon phụ kiện · S7
| tệp | phần riêng |
|---|---|
| `eq_sk_vong_xuyen_boi_so.webp` | `a plain dark-jade pendant carved as a single spider lily, frayed grey cord` |
| `eq_sk_vong_xuyen_boi_thuong.webp` | `an elaborate pendant of black jade and silver carved as a spider lily wreathing a small lantern, trailing grey silk tassels, cold blue inner glow` |
| `eq_sk_tam_sinh_an_so.webp` | `a small square seal of rough grey stone, three worn strokes carved into its base` |
| `eq_sk_tam_sinh_an_thuong.webp` | `a square seal of black stone veined with red, topped with a coiled-flame finial, dense name-like script on the base, red light bleeding from the strokes` |

## Linh Thú và trứng
**`images/pets/uMinhMieu.webp`** · S8
`a sleek black underworld cat, fur that swallows light, two faint pale-gold ring markings on its brow, eyes like cold lanterns, tail tip dissolving into dark mist, faint ochre Tho-element aura, walking without sound`

**`images/items/egg_uMinhMieu.webp`** · S9
`a matte black egg with faint pale-gold ring markings, thin cold mist pooling around its base, a single dim ember of light visible deep inside`

## Ảnh đại diện · S10
| tệp | phần riêng |
|---|---|
| `sk_vulan_nam.webp` | `a young man in mourning-grey robes holding a small paper lantern near his chest, solemn quiet face lit from below, dark river bokeh behind` |
| `sk_vulan_nu.webp` | `a young woman in pale grey and white mourning robes, a white flower pinned at her breast, calm sorrowful expression, dark river bokeh behind` |

## Ảnh bìa hồ sơ · S11
**`images/avatars/cover_sk_vulan.webp`**
`an ultra-wide night river scene, empty black water and cold mist on the left, a dense drift of glowing paper lanterns and a bank of red spider lilies massed on the right, huge pale full moon low in an indigo sky`

## Icon món ăn · S3
**`images/items/chaoThiThuc.webp`**
`a plain earthenware bowl of thin white rice porridge on a rough wooden offering tray, a few grains of coarse salt beside it, one stick of incense laid across the rim`

---

# 5. SỰ KIỆN TRUNG THU — Quảng Hàn Nguyệt Cảnh

## Nền bản đồ · S1
**`images/locations/quangHanNguyetCanh.webp`**
`the moon palace realm, a floor of silver-blue stone, an immense thousand-year cassia tree in full golden bloom, paper lanterns floating in mid-air with no strings, the silhouette of a jade rabbit pounding medicine cast huge across a distant cliff face, the Earth hanging as a blue crescent in a starfield`

## Icon kĩ năng · S2
**`images/skills/thaiNguyet.webp`**
`a cupped hand catching a pool of liquid moonlight, a sprig of golden cassia blossom resting in it, silver motes rising`

## Icon vật phẩm · S3
| tệp | phần riêng |
|---|---|
| `denLongRoi.webp` | `a fallen paper lantern lying on its side, its candle guttering, one panel torn, painted rabbit motif visible on the intact side` |
| `queHoa.webp` | `a small cluster of tiny golden cassia flowers on a dark twig, four-petalled blossoms, faint gold shimmer` |
| `nguyetAnhSa.webp` | `a shallow pan of fine silver-blue sand that glitters like captured moonlight, a few coarser grains catching the light` |
| `ngocThoMao.webp` | `a tuft of luminous white rabbit fur bound with a thin silver thread, faintly translucent at the tips` |
| `nguyetTinhDanSa.webp` | `a small jade mortar holding pale luminous cinnabar powder, a miniature jade pestle resting against it, cold white glow` |
| `quangHanChi.webp` | `a cut branch from the moon cassia, bark of frosted silver with gold blossoms still attached, cold pale aura` |

## Chân dung quái · S4
| tệp | phần riêng |
|---|---|
| `thoYeu.webp` | `a wild rabbit that strayed onto the moon, fur grown long and unnaturally white, eyes faintly luminous red, nose twitching, moon dust on its paws` |
| `queHuongYeu.webp` | `a demon condensed from a thousand years of cassia perfume, a slender figure whose body is drifting golden blossom and scented haze, alluring blurred face, petals spiralling around it` |
| `ngocThiem.webp` | `a colossal three-legged jade toad squatting in a pool of moonlight, skin of veined green jade harder than stone, gold coins spilling from its wide mouth, heavy-lidded ancient eyes` |
| `nguyetMaAnh.webp` | `a shadow the moonlight failed to erase, a pitch-black humanoid silhouette with no features, edges sharpening the brighter the light gets, standing upright on silver stone` |

## Chân dung Yêu Vương · S5
| tệp | phần riêng |
|---|---|
| `yvNgocThoNguyetSu.webp` | `the jade rabbit envoy of the moon, a tall bipedal white rabbit in flowing silver-blue ceremonial cloth, hefting an enormous jade pestle like a warhammer, moon dust exploding from the impact point, cold silver aura` |
| `yvThaiAmThiemVuong.webp` | `the moon-devouring toad sovereign, a mountainous jade-black toad with a crown of bony ridges, mouth opened impossibly wide swallowing the moonlight itself, the landscape dimming around it, cold void-blue glow in its throat` |

## Bìa Bí Cảnh · S6
| tệp | phần riêng |
|---|---|
| `queAnhLam.webp` | `a cassia forest where the shadows overlap wrongly, golden blossoms falling endlessly, every path curving back toward the same enormous trunk, silver-blue moonlight from no visible source` |
| `quangHanCungKhuyet.webp` | `the cold palace of the moon, a vast empty corridor of pale blue stone and frost-rimed pillars receding into darkness, no fire and no warmth anywhere, silver light pooling on the floor` |

## Icon phụ kiện · S7
| tệp | phần riêng |
|---|---|
| `eq_sk_nguyet_hoa_boi_so.webp` | `a simple pale-jade pendant carved as a crescent moon, plain silver-blue cord` |
| `eq_sk_nguyet_hoa_boi_thuong.webp` | `an ornate pendant of moonstone and silver carved as a full moon wreathed in cassia blossom, layered silver-blue tassels, cold luminous glow` |
| `eq_sk_quang_han_an_so.webp` | `a small square seal of pale grey stone, a crescent carved into its base, frost in the grooves` |
| `eq_sk_quang_han_an_thuong.webp` | `a square seal of white moon-jade topped with a crouching rabbit finial, archaic script on the base, cold silver light spilling from the strokes` |

## Linh Thú và trứng
**`images/pets/ngocTho.webp`** · S8
`a jade rabbit spirit, coat of luminous white with faint jade-green translucence at the ear tips, large calm red eyes, a tiny jade pestle held against its chest, faint blue Thuy-element aura, sitting upright`

**`images/items/egg_ngocTho.webp`** · S9
`a pale moon-white egg with faint jade-green veining, cold silver light pulsing softly inside, a ring of tiny frost crystals around its base`

## Ảnh đại diện · S10
| tệp | phần riêng |
|---|---|
| `sk_trungthu_nam.webp` | `a young man in silver-blue moonlit robes holding a small rabbit lantern, calm wondering upward gaze, cassia blossom and moonlight bokeh behind` |
| `sk_trungthu_nu.webp` | `a young woman in flowing white and silver-blue celestial robes, long ribbons drifting, cassia blossom in her hair, serene expression, moonlight bokeh behind` |

## Ảnh bìa hồ sơ · S11
**`images/avatars/cover_sk_trungthu.webp`**
`an ultra-wide moon palace vista, empty pale silver-blue stone floor and starfield on the left, the great blooming cassia tree, floating lanterns and the jade rabbit silhouette massed on the right`

## Icon món ăn · S3
**`images/items/banhTrungThu.webp`**
`a round golden-brown mooncake stamped with an ornate character-and-flower pattern on top, one quarter cut away revealing dark lotus paste and a whole salted egg yolk`

---

# 6. SỰ KIỆN GIÁNG SINH — Hàn Tùng Tuyết Nguyên

## Nền bản đồ · S1
**`images/locations/hanTungTuyetNguyen.webp`**
`a snowbound pine forest at dusk, warm amber lanterns hanging from the laden branches, small brass bells tied to the boughs, a line of white reindeer moving between the trunks, a timber cabin at the far end with smoke rising from its chimney, deep blue snow shadows against warm window light`

## Icon kĩ năng · S2
**`images/skills/thaiTuyet.webp`**
`a mittened hand cupping a perfect six-armed snow crystal, a small brass bell and a sprig of pine needles beside it, cold blue glow`

## Icon vật phẩm · S3
| tệp | phần riêng |
|---|---|
| `quaThongKho.webp` | `a single dry brown pine cone, scales fully opened, a dusting of snow caught between them` |
| `manhChuongDong.webp` | `a curved shard broken from a small brass bell, warm patina, the clapper ring still attached at one edge` |
| `tuyetTinh.webp` | `a single large perfect six-armed snow crystal held in mid-air, faceted like cut glass, pale blue inner light` |
| `thongChiXanh.webp` | `a fresh cut pine branch with deep green needles and a little snow, resin beading at the cut end` |
| `bangLoChau.webp` | `a flawless bead of frozen dew, clear as glass with a frost star locked inside it, resting on a pine needle` |
| `hanTungTuy.webp` | `a core sample of ancient frost-pine heartwood, pale rings visible, hoarfrost growing outward from its surface, cold blue aura` |

## Chân dung quái · S4
| tệp | phần riêng |
|---|---|
| `socTuyet.webp` | `a white winter squirrel on a snowy branch, cheeks stuffed, clutching a pine cone ready to throw, indignant expression, breath fogging` |
| `tuyetDongTu.webp` | `a half-finished snow child come alive at night, mismatched twig arms it attached itself, a chipped charcoal grin, one button eye missing, running lopsided through the drifts` |
| `bangHung.webp` | `a huge white bear woken early from hibernation, its fur frozen into overlapping plates of natural ice armor, steam from its nostrils, furious small eyes` |
| `hanSuongYeu.webp` | `a frost demon condensed from a hundred winters of rime on pine branches, an elongated humanoid of clear jagged ice, breath that freezes the air visibly, hollow glacier-blue eyes` |

## Chân dung Yêu Vương · S5
| tệp | phần riêng |
|---|---|
| `yvBachGiacLocVuong.webp` | `the white-antlered reindeer king, a majestic stag with enormous branching antlers of pale bone hung with tiny bells, hooves striking above the snow without leaving prints, aurora light behind him` |
| `yvTuyetSonLaoNhan.webp` | `the old man of the snow mountain, a broad figure in a heavy fur-lined red-brown coat with a hood, face always in shadow so no one remembers it, carrying an enormous bulging sack, blizzard swirling around him, warm lantern in one hand against cold blue night` |

## Bìa Bí Cảnh · S6
| tệp | phần riêng |
|---|---|
| `tungTuyetKinh.webp` | `a narrow trail through a dense pine forest, snow up to knee height, the path ahead unbroken while the footprints behind have already vanished, flat grey winter light` |
| `hanChungDien.webp` | `a hall of ice hung with a thousand translucent bells of every size, each strung on frozen cord, faint blue light refracting through them, breath-fog drifting, absolute stillness` |

## Icon phụ kiện · S7
| tệp | phần riêng |
|---|---|
| `eq_sk_tuyet_linh_boi_so.webp` | `a simple pendant of frosted pale glass shaped like a snow crystal, plain white cord` |
| `eq_sk_tuyet_linh_boi_thuong.webp` | `an ornate pendant of silver and clear ice carved as a snow crystal wreathed in pine needles, tiny brass bells on the tassels, cold white radiance` |
| `eq_sk_han_chung_an_so.webp` | `a small square seal of pale frosted stone, a tiny bell carved into its base` |
| `eq_sk_han_chung_an_thuong.webp` | `a square seal of clear blue glacier ice topped with a bell finial, archaic script frozen into the base, pale blue light shining through the whole block` |

## Linh Thú và trứng
**`images/pets/bachLoc.webp`** · S8
`a young white deer spirit, coat of pure snow-white with faint frost patterning along the flank, small budding antlers hung with two tiny brass bells, warm dark eyes, faint blue Thuy-element aura, standing on untouched snow leaving no prints`

**`images/items/egg_bachLoc.webp`** · S9
`a snow-white egg with fine frost-fern patterns etched across the shell, a soft pale-blue glow within, a tiny brass bell tied to a cord around its middle`

## Ảnh đại diện · S10
| tệp | phần riêng |
|---|---|
| `sk_giangsinh_nam.webp` | `a young man in a heavy fur-collared winter coat of deep green, snow on his shoulders, breath fogging, warm easy smile, lantern-lit snowy pine bokeh behind` |
| `sk_giangsinh_nu.webp` | `a young woman in a white fur-trimmed winter robe with a red sash, snowflakes caught in her hair, bright cheerful expression, lantern-lit snowy pine bokeh behind` |

## Ảnh bìa hồ sơ · S11
**`images/avatars/cover_sk_giangsinh.webp`**
`an ultra-wide snowbound pine forest at dusk, empty untouched snowfield and pale sky on the left, lantern-hung pines, bells and a warmly lit timber cabin massed on the right, deep blue shadows and warm amber light`

## Icon món ăn · S3
**`images/items/banhGungMat.webp`**
`a glazed gingerbread biscuit shaped like a small pine tree, white icing piped along the edges, a drizzle of dark honey pooling beside it`

---

# GHI CHÚ CHO NGƯỜI LÀM ART

- **Sáu bộ phải khác nhau về TÔNG MÀU** để nhìn là biết đang ở sự kiện nào: Tết đỏ-vàng · Mùa Xuân xanh non-hồng phấn · Đoan Ngọ vàng nắng-xanh nước · Vu Lan chàm-đỏ đèn · Trung Thu lam bạc-vàng quế · Giáng Sinh xanh lạnh-hổ phách ấm.
- **Icon vật phẩm phải đọc được ở 64 pixel.** Một vật, một bóng đổ, nền phẳng. Đừng vẽ cảnh.
- **Ảnh bìa hồ sơ chừa trống một phần ba bên trái** vì chỗ đó bị chữ đè lên.
- **Trứng Linh Thú chỉ cần một tệp cho mỗi loài.** Ba phẩm Thần, Linh, Phàm dùng chung art, khác nhau ở màu viền khung do giao diện tô.
- **Yêu Vương phải trông nặng ký hơn quái thường rõ rệt.** Góc máy thấp, hào quang, cảnh nền động.
