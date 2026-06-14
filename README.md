# Tiêu Dao Lục — Bản chạy thử (Phase 1)

Idle MMO huyền huyễn võ hiệp. Hiện có: **Layout + Universal Activity Widget + 2 kỹ năng gather chạy thật (idle tick + offline gains + tự lưu)**.

## ▶ Cách chạy (không cần cài Node)

**Dùng VS Code + Live Server** (đơn giản nhất):
1. Mở VS Code → cài extension **"Live Server"** (của Ritwick Dey) nếu chưa có.
2. Mở thư mục `TIEUDAO` trong VS Code.
3. Chuột phải vào `index.html` → **"Open with Live Server"** (hoặc bấm nút **"Go Live"** góc dưới phải).
4. Trình duyệt mở `http://127.0.0.1:5500/...` → chơi.

> ⚠️ **Không mở trực tiếp file `index.html`** bằng double-click — vì game chia thành ES modules, trình duyệt chặn (CORS) khi chạy qua `file://`. Phải qua Live Server (http://).

## 🎮 Thử gì?
- Bấm **Bắt Đầu** ở một hành động (vd Hắc Thán) → xem **Activity Widget** chạy: thanh tiến độ, "+số lượng", EXP/s, đồng hồ nhàn rỗi.
- Badge nhỏ trên thanh top **đồng bộ** với widget chính.
- Vật phẩm dồn vào **Hành Lý**, EXP lên **Tứ Trụ** + cấp kỹ năng.
- **Đóng tab rồi mở lại** → nhận thưởng offline (giới hạn 8h).
- Thải Khoáng Lv 10 mở **Thạch Khôi**; Phạt Mộc Lv 5 mở **Trúc Mộc**.
- Nút **Reset** (góc top) xóa tiến trình chơi lại.

## 📁 Cấu trúc (kiến trúc tách lớp — online-ready)
```
index.html          Giao diện (Alpine binding, KHÔNG chứa luật chơi)
src/
  main.js           Bootstrap: nối engine ↔ Alpine store + tick loop
  data/             DỮ LIỆU thuần (thêm nội dung ở đây)
    skills.js         kỹ năng + hành động (số liệu)
    items.js          vật phẩm + phẩm chất
  engine/           LOGIC thuần (chạy được trên server sau này)
    state.js          data model
    activity.js       trái tim idle (advance/start/stop)
    leveling.js       công thức cấp độ
    inventory.js      túi đồ
    save.js           lưu/tải (đổi sang API khi lên online)
```
→ Logic (`engine/`) không dính UI → khi lên online bê thẳng lên server.

## ➡ Tiếp theo (lộ trình)
Map + Travel → Combat predictive → đủ 9 skill + chuỗi cung ứng → Pet/Bí Cảnh/Boss → kinh tế/social...
