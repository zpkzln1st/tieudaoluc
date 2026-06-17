# Quy ước thư mục ảnh — Tiêu Dao Lục

Mỗi ảnh đặt tên đúng **`<id>.png`** và bỏ vào **đúng folder** theo bảng dưới.
Hàm `ico()` trong `src/main.js` **tự tìm folder theo id** (bảng `ICON_FOLDERS`) — thiếu ảnh thì tự hiện emoji tạm, không vỡ.

| Folder | Chứa gì | id lấy từ | Số icon |
|---|---|---|---|
| `items/` | Nguyên liệu & đồ thật: gỗ, quặng, cá, thỏi, món ăn, vật liệu xây, đan, trang bị rèn, chiến lợi phẩm | `data/items.js` (ITEMS) | 34 |
| `skills/` | Icon 9 nghề (Đốn Củi…Xây Dựng) | `data/skills.js` (SKILLS) | 9 |
| `enemies/` | Icon yêu thú (Sói/Heo/Gấu/Hồ Ly) | `data/combat.js` (ENEMIES) | 4 |
| `classes/` | Huy hiệu 12 thân phận | `data/classes.js` (CLASSES) | 12 |
| `stats/` | 4 Tứ Trụ: lucDao, hoThe, thanPhap, linhXao | `data/skills.js` (STATS) | 4 |
| `locations/` | Thumbnail 10 vùng bản đồ | `data/locations.js` (LOCATIONS) | 10 |
| `tiers/` | 4 emblem Tầng Cảnh Giới (tierNhanGian…) | `data/locations.js` (REALM_TIERS) | 4 |
| `nav/` | Icon menu trái (profile, inventory, map, combat…) | `data/nav.js` (NAV → view) | 12 |
| `currency/` | bac, honThach, nguyenBao | (cố định) | 3 |
| `npc/` | Chân dung NPC (trieuLaoBan) | `data/merchant.js` (MERCHANT.id) | 1 |
| `avatars/` | Ảnh đại diện theo `<class>.png` hoặc `<avatarId>.png` | classes + `data/avatars.js` | — |
| `ui/` | Ảnh giao diện: `worldmap.png`, `profile-banner.png`, `card-bg.png`, `logo-emblem.png`… (đường dẫn gắn cứng trong index.html) | — | — |

## Thêm icon mới
1. Tạo file PNG nền trong suốt, đặt tên `<id>.png` (id trùng với id trong file data tương ứng).
2. Bỏ vào folder đúng nhóm ở bảng trên.
3. Xong — game tự nạp, không cần sửa code.

> Nếu thêm 1 **nhóm id mới** (không thuộc nhóm nào ở trên), nhớ khai báo thêm trong `ICON_FOLDERS` (src/main.js), nếu không nó mặc định tìm trong `items/`.
