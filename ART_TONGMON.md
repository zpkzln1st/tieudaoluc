# ART — TÔNG MÔN (danh sách tài sản cần vẽ, A→Z)

> Quy ước chung của game: ảnh **.webp** (một số chỗ fallback .png), **commit thẳng** (images/ KHÔNG ignore).
> Phong cách: tối (ink #070b14), nhấn **jade #14b8a6 / cyan #22d3ee / amber-gold #f5b942**, painterly võ hiệp/huyền huyễn, glow tĩnh, ánh trăng + sương núi. Không chữ trong ảnh.
> Tên file viết **thường, không dấu**. Đặt đúng thư mục ghi ở cột "Nơi để".

---

## BẢNG TÀI SẢN (ưu tiên từ trên xuống)

| # | Mục đích | Tên file | Nơi để | Kích thước · nền | Cần sửa code? |
|---|----------|----------|--------|------------------|----------------|
| 1 | **Icon Tông Môn** ở thanh điều hướng (đang THIẾU — mọi nav khác đã có) | `tongmon.webp` | `images/nav/` | ~500×500 · **trong suốt** | ❌ thả file là chạy (đang fallback emoji ⛩️) |
| 2 | **Banner/hero** đầu trang Tông Môn | `tongmon_banner.webp` | `images/ui/` | ~2560×1024 (≈2.5:1) · tối trái cho chữ | ✅ cần hook nhỏ (hero đang dùng gradient) |
| 3 | **Ấn/huy hiệu tông môn** (ô avatar hero, đang hiện chữ "Ti") | `tongmon_emblem.webp` | `images/ui/` | ~256×256 · trong suốt | ✅ cần hook nhỏ |
| 4 | **Tranh nền 16 sự kiện** (dải header modal kể chuyện) | `<id>.webp` (a1…e5) | `images/tongmon/events/` | ~1200×420 · tối, watermark Hán phủ lên | ✅ cần hook (header đang gradient+Hán) |
| 5 | **Tile 5 công trình** (đang là chữ Hán mờ) | `<key>.webp` | `images/tongmon/buildings/` | ~312×416 (3:4) · tối | ✅ cần hook (tuỳ chọn) |

> Folder `images/tongmon/` CHƯA tồn tại — tạo mới khi làm #4/#5.
> Đã có sẵn dùng được: `images/ui/disciple_card_bg.webp` (nền thẻ đệ tử), `images/ui/logo-emblem.webp` (logo game).

---

## 1. ICON TÔNG MÔN — `images/nav/tongmon.webp`  ⭐ ưu tiên cao nhất
**Nơi để:** `images/nav/tongmon.webp` · **Kích thước:** 500×500 · **Nền:** TRONG SUỐT (PNG alpha → xuất webp) · **Bố cục:** 1 vật thể căn giữa, chừa lề ~8%, KHÔNG chữ.
Phải đồng bộ bộ icon nav khác (vd `combat.webp` = đôi kiếm bắt chéo render kim loại painterly trên nền trong suốt).

**Prompt (đề xuất: cổng sơn môn / bài phường):**
```
A single ornate Chinese wuxia sect mountain gate (paifang archway), weathered grey stone pillars
with carved dragon motifs, curved jade-green tiled roof, a hanging plaque, faint amber lantern glow,
painterly detailed game icon, centered, isolated on transparent background, no text, soft rim light,
front 3/4 view, high detail, 500x500
```
**Phương án thay thế (ấn ngọc / lệnh bài tông môn):**
```
A single jade sect medallion / command token, circular, carved cloud-and-dragon relief, gold rim,
soft jade and amber inner glow, painterly game icon, isolated on transparent background, no text, 500x500
```

---

## 2. BANNER HERO — `images/ui/tongmon_banner.webp`
**Nơi để:** `images/ui/tongmon_banner.webp` · **Kích thước:** ~2560×1024 (đồng bộ `pets_banner.webp`, `combat_banner.webp`) · **Nền:** liền, **phần TRÁI tối** để phủ tên tông + chỉ số.
```
Cinematic wide banner of a grand wuxia cultivation sect at night: clustered pavilions and a mountain
gate on a misty cliff, moonlit clouds, distant waterfall, glowing jade and amber lanterns, ethereal
qi mist, dark moody atmosphere, LEFT THIRD kept dark and empty for text overlay, painterly xianxia
concept art, ultra wide 2560x1024, no text
```
> Hook code (tôi làm khi có ảnh): phủ `<img>` nền lên hero `view==='tongmon'`, onerror gỡ → lộ lại gradient hiện tại.

---

## 3. ẤN TÔNG MÔN — `images/ui/tongmon_emblem.webp`
**Nơi để:** `images/ui/tongmon_emblem.webp` · **Kích thước:** 256×256 · **Nền:** trong suốt · thay ô chữ "Ti" ở hero.
```
A wuxia sect emblem crest, circular jade and bronze seal with a stylized mountain-and-sword motif,
subtle gold filigree, soft glow, isolated on transparent background, painterly game UI emblem, no text, 256x256
```

---

## 4. TRANH NỀN 16 SỰ KIỆN — `images/tongmon/events/<id>.webp`
**Nơi để:** `images/tongmon/events/` (tạo mới) · **Kích thước:** ~1200×420 · **Nền:** tối, để chữ Hán watermark + tiêu đề gold phủ lên (ảnh chỉ là bối cảnh khí quyển, đừng quá sáng/đông).
**Tên file = id viết thường:** `a1 a2 a3 b1 b2 b3 c1 c2 d1 d2 d3 e1 e2 e3 e4 e5`.

Định hướng theo nhóm (màu chủ đạo khớp viền modal):
- **A — Drama đệ tử (rose #fb7185):** hai bóng đệ tử dưới gốc ngân hạnh / sân luyện đêm, tình & xung đột.
  - `a1` Đạo Lữ Đồng Tâm: đôi nam nữ dưới cây ngân hạnh nở, đèn lồng, lãng mạn.
  - `a2` Đồng Môn Sinh Hiềm: hai đệ tử đối mặt căng thẳng ở Diễn Võ Trường, kiếm khí.
  - `a3` (drama nội bộ): ghen tị/nghi kỵ trong sân tông.
- **B — Khách giang hồ (cyan #22d3ee):** một lão nhân/ẩn sĩ ghé sơn môn.
  - `b1` Cao Nhân Quá Môn: lão nhân áo vải lưng đeo kiếm gỉ trước cổng tông, sương sớm.
  - `b2`,`b3`: khách lạ trao đổi bí mật / bản đồ / ngoại giao.
- **C — Khiêu chiến môn phái (gold #f5b942):** đối đầu phe khác.
  - `c1` khiêu chiến tỉ võ; `c2` Tranh Đoạt Linh Mạch: hai phe tranh long mạch phát sáng.
- **D — Chuỗi Phản Đồ (violet #a78bfa):** hắc hóa → phản bội → tái xuất.
  - `d1` Tâm Ma Khởi: đệ tử mắt vẩn đỏ luyện ma công nơi hậu sơn.
  - `d2` Phản Xuất Sư Môn: bóng người trốn khỏi tông trong đêm.
  - `d3` Cố Nhân Lai Phục: kẻ áo đen đứng trên sơn môn trong mưa, cao trào.
- **E — Giai thoại (slate #94a3b8, an hoà):** khoảnh khắc đẹp cột mốc.
  - `e1` Triêu Hà Mãn Sơn: đệ tử tọa vong mỏm đá lúc mây ráng đỏ; `e2`–`e5`: trăng tròn/cứu dân/kỳ vật/quần tụ.

**Prompt mẫu (thay phần in hoa theo từng id):**
```
Atmospheric wide wuxia scene banner: [MÔ TẢ CẢNH THEO ID], painterly xianxia concept art, moody dark
palette with [MÀU NHÓM] accent glow, misty, cinematic, muted so text and a large faint calligraphy
character can overlay on top, 1200x420, no text
```

---

## 5. TILE CÔNG TRÌNH — `images/tongmon/buildings/<key>.webp` (tuỳ chọn)
**Nơi để:** `images/tongmon/buildings/` · **Kích thước:** ~312×416 (3:4) · **Nền:** tối, hợp thẻ.
**Tên file = key:** `tuHien` (Tụ Hiền Đường), `dienVo` (Diễn Võ Trường), `tangThu` (Tàng Thư Lâu), `yQuan` (Y Quán), `tuLinh` (Tụ Linh Trận), **`duocVien` (Dược Viên — MỚI, đang fallback Hán 藥; đã wire sẵn ở card + header modal).**
```
Painterly wuxia sect building card art, [TÊN CÔNG TRÌNH ENG: hall of talents / martial training ground /
library tower / infirmary / spirit-gathering array], traditional Chinese architecture, night, jade and
amber lantern glow, vertical 3:4, dark muted background, no text
```
**`duocVien` (Dược Viên — vườn linh dược):**
```
Painterly wuxia sect building card art, a serene spirit-herb medicine garden: tiered planting beds of
glowing jade-green spirit herbs and luminous mushrooms, a wooden drying rack and stone mortar, a small
curved-roof apothecary pavilion behind, night, soft emerald and jade qi glow rising from the plants,
misty, vertical 3:4, dark muted background, painterly xianxia concept art, no text, 312x416
```

---

## 7. ĐAN DƯỢC (9 viên) — `images/tongmon/pills/<id>.webp` (MỚI, đã wire sẵn — đang fallback emoji)
**Nơi để:** `images/tongmon/pills/` (tạo mới) · **Kích thước:** ~512×512 (VUÔNG) · **Nền:** ĐEN ĐẶC (object-cover sẽ phủ kín ô) · 1 viên đan giữa khung, glow theo màu, KHÔNG chữ.
**Hiện ở:** Túi Đồ (mục Đan Dược) · modal Luyện Đan (icon công thức + lò đang luyện) · Bình Cảnh (icon yêu cầu). Thiếu file → tự lộ lại emoji.
**Tên file = id (camelCase, đúng như list dưới).**

**Prompt mẫu (thay [TÊN] + [MÀU GLOW] + [HỌA TIẾT] theo từng viên):**
```
A single ornate Chinese cultivation elixir pill (xianxia "dan/pellet"), perfectly round glossy pill with
intricate swirling [HỌA TIẾT] surface patterns, floating centered on a deep solid black background,
radiant [MÀU GLOW] inner glow and soft qi-mist halo, faint dragon-and-cloud relief, painterly
semi-realistic game item icon, high detail, centered with even margin, no text, 512x512
```

| id (tên file) | Đan | Đột phá lên | Màu glow | Họa tiết gợi ý |
|---|---|---|---|---|
| `trucCoDan`   | Trúc Cơ Đan   | Trúc Cơ   | xanh ngọc lục (jade green) | mầm cây / vân gỗ linh |
| `ketDanDan`   | Kết Đan Đan   | Kim Đan   | lam ngọc (azure blue)      | xoáy nước / vân băng |
| `ngungAnhDan` | Ngưng Anh Đan | Nguyên Anh| tím nhạt (violet)          | hình thai nhi linh / vân mây |
| `hoaThanDan`  | Hóa Thần Đan  | Hóa Thần  | tím magenta sâu            | thần văn / sao mờ |
| `quyHuDan`    | Quy Hư Đan    | Luyện Hư  | cam (orange)               | hư không xoáy / khói |
| `hopDaoDan`   | Hợp Đạo Đan   | Hợp Thể   | hổ phách cam (amber)       | âm dương / vân rồng |
| `daiThuaDan`  | Đại Thừa Đan  | Đại Thừa  | vàng kim (golden yellow)   | hoa sen / hào quang |
| `doKiepDan`   | Độ Kiếp Đan   | Độ Kiếp   | đỏ thẫm (crimson red)      | sấm sét / vân lửa kiếp |
| `phiThangDan` | Phi Thăng Đan | Đắc Đạo   | trắng-kim rực (radiant white-gold) | tiên quang / lông vũ thăng thiên |

> Càng bậc cao → đan càng tinh xảo/thần thánh (nhiều glow + hoa văn rồng/tiên). Bậc thấp giản dị hơn.

---

## 6. CHÂN DUNG ĐỆ TỬ — `images/tongmon/disciples/<sex>_<n>.webp`  (POOL theo uid)
**Nơi để:** `images/tongmon/disciples/` (tạo mới) · **Kích thước:** ~600×800 (dọc 3:4, hợp thẻ) · **Nền:** tùy (object-cover sẽ cắt vừa).
**Tên file (1-indexed, liên tục):** nam = `nam_1.webp, nam_2.webp, nam_3.webp …` · nữ = `nu_1.webp, nu_2.webp …`
**Cơ chế:** mỗi đệ tử bốc 1 ảnh CỐ ĐỊNH theo uid (`hash(uid) % số_ảnh`), nam/nữ riêng pool → mỗi đệ tử một vẻ, không đổi khi reload. Thiếu ảnh → tự lộ lại seal Hán (không vỡ). Càng nhiều ảnh càng đa dạng.
**Hiển thị ở 3 nơi (đã wire sẵn):** thẻ lưới Đệ Tử Đường · portrait lớn trong modal · ô giữa tab Gia Bảo.
**SAU KHI THẢ ẢNH:** báo tôi **số lượng nam / nữ** (vd 12 nam, 10 nữ) → tôi set 1 dòng `DISC_FACES = {nam, nu}` trong main.js là ảnh hiện ra ngay. (Hiện DISC_FACES=0 nên đang dùng seal Hán.)
```
A wuxia/xianxia cultivator portrait, [nam: young male / nữ: young female] martial artist, traditional
Chinese robes, painterly semi-realistic, dark moody background with subtle jade/amber rim light,
upper-body 3:4 vertical, cinematic, no text, 600x800
```

## Ghi chú triển khai
- Làm xong **#1** là thấy ngay (chỉ cần thả file đúng tên). #2–#5 báo tôi, tôi gắn hook (img + onerror fallback về giao diện hiện tại — không vỡ nếu thiếu ảnh).
- Tất cả ưu tiên **.webp**; nếu xuất .png cũng nhận với #4/#5 (tôi thêm fallback .png như các hệ khác).
- Giữ nền tối/muted ở #2 và #4 để chữ (gold-text, watermark Hán) đọc rõ.
