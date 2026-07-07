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
`rate` seed theo dải + `bornAt` rải (vài ngày→vài tháng trước) → dân số trải đều cấp, người chơi leo dần qua. Calibrate để khớp pace thật (verify phân bố in-game).

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
