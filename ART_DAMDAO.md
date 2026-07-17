# ART — Đàm Đạo (9 NPC nghề) + Tín Vật (9 vật)

Prompt tạo ảnh cho hệ Đàm Đạo. Gen xong thả vào đúng thư mục/tên (xem cuối), mình wire vào game.

- **Chân dung NPC** → `images/damdao/<skillId>.webp` — vuông 1:1 (khuyên 512×512), khung ngang ngực (chest-up), làm avatar modal Đàm Đạo.
- **Tín Vật (icon vật)** → `images/tinvat/<skillId>.webp` — vuông 1:1 (khuyên 256×256), 1 vật đơn, nền tối.

Gợi ý gen theo BỘ để đồng phong cách: giữ nguyên đoạn STYLE, chỉ đổi đoạn mô tả riêng.

---

## STYLE — chân dung NPC (dán trước mỗi prompt NPC)

```
Wuxia xianxia character portrait, semi-realistic anime illustration blended with Chinese ink-wash painting, painterly and detailed, cinematic rim lighting, dark moody atmosphere, muted earthy palette with jade-green and antique-gold highlights, weathered expressive face, chest-up framing, shallow depth-of-field background, ultra detailed, high quality, 1:1 square —
```

### 1. phatMoc — Tiều Phu Lão Tường (Đốn Củi)
```
an elderly woodcutter master, around 65, kind weathered face with deep laugh lines and calm knowing eyes, long grey beard, coarse patched hemp robe, a worn wood-axe resting on his shoulder, a single leaf caught in his hair, standing in a misty ancient pine forest at dawn, gentle serene mood, soft green light filtering through the trees
```

### 2. thaiKhoang — Khoáng Phu Lão Hắc (Đào Khoáng)
```
an old mining master, around 60, soot-smudged rugged face, gruff furrowed brow, tired haunted eyes, short greying stubble, coal-black hands, a grimy sleeveless work tunic, holding a small oil lantern glowing gold, a pickaxe slung on his back, standing in a dark cramped mine tunnel with faint gold ore veins in the rock, tense somber mood, warm lantern glow against blue-black shadow
```

### 3. dieuNgu — Ngư Ông Phúc Bá (Câu Cá)
```
a jovial old fisherman, around 65, round cheerful sun-tanned face, hearty laughing eyes with crow's feet, wispy white beard, a conical straw hat, a palm-fiber rain cape, an old bamboo fishing rod over his shoulder, sitting by a vast misty lake at dawn, mist drifting over calm water, tranquil playful mood, soft pale-gold morning light
```

### 4. phanhNham — Trù Sư Lữ Công (Nấu Ăn)
```
a hearty old wandering cook master, around 58, warm round face, kind eyes with a hint of wistfulness, short salt-and-pepper beard, sleeves rolled up, a cloth apron, holding a well-used chef's cleaver, steam rising from a wok at a roadside food stall beside him, cozy yet melancholic mood, warm amber hearth firelight
```

### 5. luyenDan — Lý Dược Vương (Luyện Đan)
```
a grave elderly alchemist-physician master, around 70, thin refined ascetic face, cautious wise eyes carrying old grief, long white beard, a dark scholar's robe hung with herb pouches, holding a single medicine pill between his fingers, a small bronze pill-furnace with a thin wisp of smoke beside him, shelves of gnarled dried herbs behind, solemn careful mood, cool dim light with one warm ember
```

### 6. daTao — Thiết Tượng Lão Cường (Rèn Đúc)
```
a rough working-class village blacksmith, around 60, broad soot-streaked face, gruff scowl hiding warmth, sweat-beaded brow, stubble, muscular but with a slightly bent hunched back, a sleeveless leather apron over bare shoulders, gripping a chipped iron hammer, standing at a humble anvil with glowing coals, sparks flying, a plain rustic grounded forge (NOT a grand mythical armory), stern earthy mood, orange forge-fire glow
```

### 7. toaQuan — Hư Vô Lão Nhân (Thiền Định)
```
a serene enigmatic old hermit, around 75, calm smooth face with a faint knowing playful smile, twinkling half-closed eyes, long thin white beard and long eyebrows, a simple grey meditation robe, sitting cross-legged on a worn round cushion, on an empty misty mountaintop or in a bare stone cave, an aura of stillness and emptiness, zen tranquil mysterious mood, soft diffuse grey light, generous negative space
```

### 8. doanhTao — Lỗ Ban Truyền Nhân (Xây Dựng)
```
a meticulous humble master carpenter, around 55, focused thoughtful face with faint self-doubt, precise attentive eyes, a neat short beard, a plain artisan robe with a carpenter's ink-line reel at his waist, holding an old wooden ruler, wooden scaffolding and mortise-and-tenon beams behind him, fine sawdust in the air, disciplined earnest mood, warm wood-toned light
```

### 9. daLuyen — Âu Dã Tử (Luyện Kim)
```
a legendary ancient swordsmith master, around 70, intense chiseled face, piercing eyes that have seen centuries, long iron-grey hair and beard, a dark heat-scorched smith's robe, holding a glowing sword blade with tongs, a massive ancient forge blazing a three-hundred-year fire behind him, mythic reverent intense mood, deep red-and-gold forge glow
```

---

## STYLE — icon Tín Vật (dán trước mỗi prompt vật)

```
Wuxia game item icon, a single object centered on a dark radial-gradient background, painterly semi-realistic, aged worn patina, subtle antique-gold rim-light glow, soft studio lighting, ultra detailed, no text, no watermark, no border, 1:1 square —
```

| skillId | Tín Vật | Mô tả riêng (dán sau STYLE) |
|---|---|---|
| phatMoc | Lão Phủ | `an old worn woodcutter's axe, chipped and nicked steel head, a smooth wooden shaft polished by decades of use, faint moss on the blade` |
| thaiKhoang | Khoáng Đăng | `an old miner's oil lantern, dented brass frame, sooty glass, a small warm flame glowing gold inside, a worn carry-ring on top` |
| dieuNgu | Trúc Điếu | `an old bamboo fishing rod, weathered yellow-brown bamboo, a frayed silk line, a worn cork grip, a tiny bronze hook` |
| phanhNham | Khuyết Trù Đao | `a chipped old chef's cleaver, a notched worn blade with a nick out of the edge, dark patina, a well-worn wooden handle` |
| luyenDan | Đan Lô | `a small antique bronze pill-furnace (dan-lu), three ornate legs, tarnished surface, faint wisps of medicinal smoke rising, an ember glow inside` |
| daTao | Khuyết Chùy | `an old blacksmith's forging hammer, a heavy iron head chipped on one corner, a worn oak handle, soot and hammer-scale marks` |
| toaQuan | Bồ Đoàn Trống | `a plain empty round meditation cushion (bo-doan), woven faded straw and cloth, sitting alone, a soft beam of light falling on it, a sense of stillness and emptiness` |
| doanhTao | Tổ Xích | `an ancestral carpenter's wooden measuring ruler, dark hardwood worn smooth at both ends, faint carved measure-marks, a coiled ink-line reel resting beside it` |
| daLuyen | Cố Lô | `an ancient stone-and-iron forge, glowing coals, worn firebrick, faint three-hundred-year embers, a resting pair of iron tongs, a mythic warm glow` |

---

## Negative prompt (dùng chung, nếu generator hỗ trợ)
```
text, watermark, signature, logo, modern objects, blurry, lowres, extra limbs, deformed hands, cartoonish, oversaturated neon colors, cluttered messy background
```

## Wire vào game (sau khi có ảnh)
- Chân dung NPC: sửa avatar header modal Đàm Đạo (đang dùng emoji skill) → load `images/damdao/<skillId>.webp`, fallback về icon cũ.
- Tín Vật: banner `.dd-tinvat` + thẻ Modal Hiệu Ứng → dùng `images/tinvat/<skillId>.webp`, fallback về glyph Hán hiện tại.
