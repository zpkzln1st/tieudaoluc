# THIẾT KẾ — HỆ GIANG HỒ AI (bot làm world đông vui)

> Mục tiêu: chơi 1 mình mà world vẫn "có người" — bot ảo cày/đánh boss/buôn bán/đua hạng.
> **Offline thuần** (localStorage), KHÔNG server, KHÔNG LLM-live. Tất cả là MÔ PHỎNG client-side.

## 0. Nguyên lý xương sống — LAZY SIM (tính-khi-cần)
KHÔNG vòng lặp chạy nền cho từng bot. Mỗi bot = **hàm thuần của `(seed, createdAt, now)`** — giống `advance()` offline của người chơi. Settle khi mở màn liên quan.
- **Deterministic:** cùng input → cùng output (sống qua reload, không reroll).
- **Monotonic:** cấp bot KHÔNG tụt theo thời gian (tính từ thời gian TUYỆT ĐỐI, không cộng dồn random mỗi tick — bài học pet hunt).
- 200-300 bot vẫn nhẹ (chỉ tính khi hiển thị + memo theo phút).

## 1. Cấu trúc bot — 2 tầng
- **Đám đông (~200):** lưu MỎNG `{ id, name, seed, bornAt, archetype, rate, onlineFrac }`; stat SUY RA (không lưu). Thực tế cả roster sinh từ 1 `world.seed` → save chỉ cần `{seed, createdAt}`.
- **Kình địch (~10, làm sau):** lưu dày (build/gear, lịch sử PvP, grudge, vị thế sàn).
- **Archetype:** cayNghe · satThu · sanBoss · phuThuong · loMo(casual) → tỉ trọng effort khác nhau → profile + hành vi khác → KHÔNG 1 khuôn.
- **onlineFrac (0.1–0.6):** bot không on 24/7 → tiến nhanh/chậm khác nhau.

## 2. Tiến trình (canh theo SỐ THẬT của game)
```
effort(bot, now) = rate × (now − bornAt) × onlineFrac      // "xp-giây" tích lũy
combatXp  = effort × w[archetype].chienDau
skillXp[s]= effort × w[archetype][s]                       // 9 nghề
botCombatLv = levelFromXp(combatXp)                        // tái dùng hàm game, cap MAX_LEVEL
botSkillLv[s] = levelFromXp(skillXp[s])
botTotalLv = botCombatLv + Σ botSkillLv                    // = Tổng Cảnh Giới
```
`rate` seed theo dải + `bornAt` rải → dân số trải đều cấp, người chơi leo dần qua. Calibrate để khớp pace thật (verify phân bố in-game).

### 2b. MÁY CHỦ CHUNG + dòng người luân chuyển (sửa 2026-08-04)
**Bản cũ** hồi tố tuổi bot 3–365 ngày ngay lúc tạo nhân vật, và `world.seed`/`createdAt` random riêng từng save. Hai hệ quả đo được:
- Ngày đầu người chơi ở Lv1 mà bot thấp nhất đã Lv8, giữa bảng Lv33 — không ai cùng vạch xuất phát.
- Hai tài khoản mở Phong Vân Bảng ra **hai bảng 200 người khác hẳn nhau** ⇒ không thể có máy chủ chung.
- Nếu chốt `createdAt` chung mà giữ mô hình cũ thì **sàn dâng mãi**: năm thứ 5 không ai dưới Lv54, 70/200 người chạm trần Lv100.

**Bản nay:** `seed` + `createdAt` là HẰNG SỐ (`MAY_CHU_SEED`, `MAY_CHU_MO_LUC`). Người nhập giang hồ **liên tục**, cách nhau `CHU_KY = TUOI_AN_CU_NGAY / (BOT_COUNT − SO_LAO_LANG)`; ai ở đủ `TUOI_AN_CU_NGAY` thì ẩn cư rời bảng. Tuổi vì thế luôn trải đều 0 → 365 ngày nên **sàn đứng yên vĩnh viễn**. Thêm `SO_LAO_LANG` người không ẩn cư để bảng luôn có cao thủ chạm trần.

Đo (`_check_giangho.mjs`): năm 0/1/3/5 đều ra sàn Lv1 · giữa bảng ~42 · đỉnh Lv100 · 10–16 người dưới Lv20.

⚠ Tên phải là hàm **thuần của số thứ tự đến**, không được khử trùng bằng cách quét cả danh sách — làm thế thì tên một người sẽ đổi khi có người khác nhập/rời. Họ và tên đi **hai bước hoán vị riêng**, mỗi bước nguyên tố cùng nhau với pool của nó; cặp (họ, tên) lặp sau BCNN(số họ, số tên) lượt, phải lớn hơn quân số luân chuyển. Gộp hai vế vào **một** hoán vị thì tên riêng dồn cục theo thứ hạng (đã dính: sáu "Vân Thâm" liền nhau đầu bảng).

⚠ Ba chỗ trong save giữ mã người: `bangPhai.bang.tv`, `bangPhai.bang.donXin`, `tuuLau.giaoTinh/gtPhien/hoiLan`. Người ẩn cư phải được `donNguoiAnCu()` gỡ khỏi cả ba, không thì Tiên Minh treo "thành viên ma" (tra roster không ra, hồ sơ trả null).

## 3. Bảng Xếp Hạng (Phong Vân Bảng) — P1
Rank bằng **Tổng Cảnh Giới** (`totalLevel`, đã có sẵn cho người chơi). Người chơi chèn vào đúng hạng. Hiện top N + lân cận hạng mình + dòng "đang làm gì" (flavor theo archetype/vùng). Memo theo bucket-phút để khỏi tính lại 200×10 levelFromXp mỗi render.

## 4. Feed giang hồ — P1 (theo sau BXH)
Phát sự kiện từ chính sim (lên cấp / hạ Yêu Vương / trúng đồ hiếm / kình địch) → tái dùng Phi Cáp Đài. `lastFeedAt` để khỏi lặp.

## 5. ENGINE
`src/data/bots.js` (pool tên Hán-Việt, archetype + tỉ trọng, params) · `src/engine/bots.js` (genRoster(seed,createdAt) thuần · botCombatLv/botSkillLv/botTotalLv · botActivity flavor · ranking). `ensureWorld(state, now)` init `state.world={seed,createdAt}` nếu thiếu (như ensureQuests). Save chỉ +`world`.

## 6. LỘ TRÌNH
| Nấc | Nội dung | Trạng thái |
|---|---|---|
| **P1** | nền bot + Phong Vân Bảng (BXH) + Feed | **ĐANG LÀM** |
| P4 | Boss chung + đua last-hit (bot góp dame Yêu Vương) | tiếp theo |
| P5 | Sự kiện nổi (sốt/sập giá, kình địch, lập bang) | sau |
| **P2** | **Sàn Giao Dịch + kinh tế bot** (cần build sàn P2P trước) | **HOÃN** (chưa có sàn) |
| **P3** | **Luận Võ / PvP** (makeFight với loadout bot) | **HOÃN** (chưa có PvP) |

## 7. Cân bằng kinh tế (cho P2, ghi sẵn kẻo quên)
Van chống in-tiền / làm-cày-mất-nghĩa: ngân sách bot có hạn · cầu bão hoà · co giãn giá (đổ nhiều → sập) · thuế sàn (sink Bạc) · "bắt hời" rate-limited (seed). Mọi item neo `fairValue` quanh `value` (items.js) + độ hiếm; `priceIndex` mean-revert.
