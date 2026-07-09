# ART — ĐỘNG PHỦ (prompt tạo ảnh)

> Khớp mockup `_mockup/dongphu_dangoc.html` (style Dạ Ngọc = màu game). Thả file `.webp` đúng tên vào thư mục là hiện ngay (`onerror` tự gỡ placeholder). Tên file **thường, không dấu**.
> **KÍCH THƯỚC:** Nhà chính = **VUÔNG 1:1** (`object-fit:cover` sẽ cắt mép → chủ thể căn giữa, chừa lề ~12%). Công trình phụ = **16:10 ngang**. Icon nav = 500×500 nền trong suốt.

## Style chung (dán vào MỌI prompt để cả bộ đồng nhất)
```
painterly xianxia / wuxia concept art, night scene, dark teal-black atmosphere,
soft jade-green (#14b8a6) and warm amber-gold (#f5b942) lantern glow, ethereal qi mist,
moonlight, high detail, cinematic, NO text, NO people, no watermark, no border.
Consistent art style, same slightly-elevated 3/4 front camera, subject centered.
```

---

## A. NHÀ CHÍNH — 7 ô, VUÔNG 1:1 (đề nghị 1024×1024) → `images/dongphu/nha_0.webp` … `nha_6.webp`
> Cả 7 ảnh phải **CÙNG một góc máy, cùng tông đêm, cùng khoảng cách** để 6 bậc đọc như một tiến trình "nhà lớn dần". Nền tối dần ra 4 góc (hòa vào nền thẻ #0a0f1a).

**`nha_0` — Bãi Đất Trống (chưa dựng nhà)**
```
An empty plot of land in a misty forest clearing at night. A few foundation cornerstones,
a neat stack of timber logs and grey roof tiles, a surveyor's stake with a small ribbon.
No building yet — quiet, expectant, untouched. Faint jade mist low on the ground, one distant lantern.
[+ style chung]
```

**`nha_1` — Thảo Lư (nhà cỏ)**
```
A humble hermit's thatched-roof hut, mud-and-wattle walls, one warm paper window glowing,
a low bamboo fence, wildflowers and a water jar by the door. Simple, poor but cozy.
[+ style chung]
```

**`nha_2` — Mộc Xá (nhà gỗ)**
```
A modest timber-frame wooden house, plank walls, a small tiled porch roof, a warm hanging lantern
by the door, a young pine tree beside a low fence, a woodpile. Tidy and lived-in.
[+ style chung]
```

**`nha_3` — Trạch Viện (viện gạch có sân)**
```
A small brick-walled courtyard residence, grey brick walls with a modest gated entrance and a plaque,
curved grey-tiled roof, a stone-paved yard, a blossoming plum tree, two hanging lanterns. A proper home.
[+ style chung]
```

**`nha_4` — Sơn Trang (sơn trang có tường bao)**
```
A walled mountain villa (shan zhuang), several tiled roofs behind a perimeter wall, an ornate wooden
gate with a name plaque, an inner courtyard with a small koi pond and stone path, warm lantern light,
nestled against a misty cliff with pines. Established, prosperous.
[+ style chung]
```

**`nha_5` — Phủ Đệ (phủ đệ nhiều sân)**
```
A grand multi-courtyard mansion estate, layered upward-curving jade-green tiled roofs, red lacquer pillars,
a pair of stone guardian lions at the main gate, connected pavilions, a garden with a pond and a small
arched bridge, many warm lanterns, hint of jade qi in the air. Imposing wealth, a noble household.
[+ style chung]
```

**`nha_6` — Động Phủ (động phủ tiên gia — bậc đỉnh)**
```
A magnificent immortal's grotto-mansion (dong fu) built into a glowing jade mountain: grand pavilions
merging with a luminous cave entrance, thin waterfalls, floating qi mist and drifting petals, jade-and-gold
ornamentation, lotus ponds, a sense of a cultivator's paradise. The grandest and most awe-inspiring of the
whole set — clearly the peak of the progression.
[+ style chung]
```

---

## B. CÔNG TRÌNH PHỤ — 3 ô, 16:10 NGANG (đề nghị 1280×800) → `images/dongphu/`
> Nền tối hòa thẻ; chủ thể lệch giữa, chừa mép an toàn (cắt cover).

**`mongdai.webp` — Mộng Đài (nhà Đăng Tiên Mộng)** — *lệch tông TÍM/CHÀM để gợi cờ bài mộng cảnh*
```
A moonlit dream altar terrace: an ornate wooden platform beneath a huge full moon, incense smoke
curling up into dreamlike indigo-purple mist, a jade "yellow-millet" dream-pillow resting on a low table,
scattered floating petals, surreal and ethereal. Purple/indigo + jade palette (dreamier than the rest).
painterly xianxia, night, soft glow, NO text, no people, cinematic, 16:10.
```

**`tramyeu.webp` — Trảm Yêu Đài (nhà Kỳ Trận Trảm Yêu)** — *ngũ sắc trận đồ*
```
A stone demon-slaying formation terrace: a large carved nine-palace (3x3) array grid glowing on the ground
with five-colour runes (red, green, violet, cyan, gold), paper talismans fluttering, a ceremonial sword
planted upright at the center, faint dark demonic mist being repelled at the edges. Heroic, ominous, arcane.
painterly xianxia, night, jade+amber+multicolour glow, NO text, no people, 16:10.
```

**`dienvo.webp` — Diễn Võ Trường (autochess — KHÓA)** — *sẽ hiển thị xám mờ (grayscale + opacity .55), cứ vẽ bình thường*
```
A dark, abandoned martial-arts arena / drill ground at night: empty tiered stands, tattered war banners
on tall flagpoles, a bare central platform, moonlit silhouettes, desolate and waiting for a master.
Very muted and shadowy, mysterious. painterly xianxia, deep night, minimal glow, NO text, no people, 16:10.
```

---

## C. ICON NAV — `images/nav/dongphu.webp` · 500×500 · NỀN TRONG SUỐT
> Đồng bộ bộ icon nav (vd combat = đôi kiếm bắt chéo painterly kim loại trên nền trong suốt).
```
A single wuxia estate gate / small pavilion icon: a curved jade-green tiled roof over stone pillars,
a warm amber lantern glowing beneath, painterly metal-and-jade render, centered, ~8% margin,
isolated on transparent background, soft rim light, front 3/4 view, NO text, 500x500.
```

---

## Cách thả vào mockup
1. Gen xong, lưu đúng tên vào `C:\ClaudeProject\TIEUDAO\images\dongphu\` (nav icon vào `images\nav\`), định dạng **.webp** (hoặc .png rồi đổi — mockup đọc .webp).
2. Refresh `http://localhost:5599/_mockup/dongphu_dangoc.html` → art thật hiện thay placeholder (không cần sửa code).
3. Dùng nút **"Xem: Bãi Đất Trống"** để soi `nha_0`; đổi `nha_2` trong mockup nếu muốn xem bậc khác (hoặc mình thêm nút chuyển bậc để duyệt cả 7 nhà).
