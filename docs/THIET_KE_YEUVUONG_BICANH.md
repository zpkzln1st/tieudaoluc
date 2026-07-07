# TIÊU DAO LỤC — Thiết kế YÊU VƯƠNG + BÍ CẢNH (bản GROUNDED)

> Chốt 2026-06-12. Game **offline single-player** (localStorage). Bản này **đối chiếu vision với hệ thống THẬT** (qua thám sát code) → giữ ý tưởng hay, bỏ/đổi cái không khớp. Tham khảo, KHÔNG copy.
> Code nền: combat `src/data/votong.js` (deriveCombat/stepFight) + `src/engine/activity.js` (state.activity, advance, loot roll `enemy.loot`); enemy `src/data/combat.js` (mk(), archetype 'boss'); items `src/data/items.js`; nav `src/data/nav.js` (đã có `worldboss`/`dungeon` soon:true); view gate `isPlaceholderView` main.js ~390.

---

## A. ✅ CHỐT
- **YÊU VƯƠNG TRƯỚC** (nguồn `tinhTheYeuVuong` mở cường +10↑). Bí Cảnh sau.
- **Yêu Vương: hồi chiêu THEO BOSS** (mỗi con cooldown riêng, bắt đầu khi THẮNG; thua được retry).
- Trận = **1 trận quyết (one-off)** dùng combat engine sẵn (loop stepFight tới chết → win/lose + log).

---

## B. ĐỐI CHIẾU HỆ THỐNG THẬT (nền để thiết kế)

**Chỉ số (Tứ Trụ = src/data/skills.js:143-148):** `lucDao` (Lực Đạo→ATK, từ Đốn Củi/Rèn) · `hoThe` (Hộ Thể→Thủ+HP, từ Đào Khoáng) · `thanPhap` (Thân Pháp→Tốc/Né, từ Luyện Kim) · `linhXao` (Linh Xảo→Chính Xác/Bạo, từ Câu Cá). + 5 gear stat (Công/Thủ/Né/Chính Xác/Sinh Lực) + combat derived (atk/def/spd/crit/critDmg/dodge/HP). Ngũ hành Kim/Mộc/Thủy/Hỏa/Thổ khắc +30%/−20%.

**MAP khái niệm vision → stat thật:** Thân Pháp=`thanPhap` ✅ · Sức Mạnh=`lucDao` ✅ · Sinh Khí=`sinhLuc` ✅ · Thể Chất=`hoThe` ✅ · **Ngộ Tính → `linhXao`** (Linh Xảo = khôn khéo) · **Cơ Duyên (Magic Find) = CHƯA CÓ** (tạm RNG, thêm stat sau).

**Tài nguyên (items.js):** currency = bac/honThach/nguyenBao (KHÔNG có Linh Thạch-currency/Đạo Điểm). Liệu type: go/khoang/dinh/ca/monan/vatlieu/dan/trangbi/**khac**(chiến lợi phẩm). Đá cường hóa Sơ/Trung/Cao. Gear 49 món (7 bậc × slot, đều rèn được). **Boss-mầm CÓ SẴN:** `hoPhuDauLinh`(Truyền Thế) `hachCoLinh`(Thần) `cuuViTinh`(Cô Bản) `maToTam`(Cô Bản) + `tinhTheYeuVuong`(Thần, xúc tác cường +10↑).

**Tiến trình:** lên cấp = Chiến Đấu Lv + 8 skill → totalLevel. Gate vùng = `reqLevel` (Chiến Đấu Lv). REALM_TIERS 4 tầng (Nhân Gian 1-30 / Bí Cảnh 30-60 / Tiên Cảnh 60-90 / Thần Vực 90-100) — chỉ hiển thị, KHÔNG phải cảnh giới tu luyện. Activity idle: `state.activity {type,skillId,cycleMs,startedAt,sessionCount,progress,capped}` — **TÁI DÙNG được cho "treo Bí Cảnh X giờ"**. Idle cap 8h.

**BỎ khỏi vision (không khớp game):** Pet/trứng Pet (chưa có Pet) · đệ tử/đội hình (game SOLO) · cảnh giới Luyện Khí/Trúc Cơ (chỉ có Lv) · spawn theo giờ server/vây sát nhóm (offline) · drop Đồ Phổ/mảnh kỹ năng (skill học từ Tàng Kinh Các bằng Bạc/Nguyên Bảo, KHÔNG từ drop) · "độ khó" (chưa có hệ difficulty — sẽ thêm đơn giản).

---

## C. YÊU VƯƠNG — SPEC GROUNDED (làm trước)

**Màn riêng**: bật nav `worldboss`, view template, thêm `isPlaceholderView` whitelist + VIEW_NAMES.

**Roster 5 con** (entry mới trong combat.js `mk(level,'boss',{...})`; archetype boss: HP×6/atk×1.45/def×1.3/exp×9; `he` cố định để người chơi build khắc; có `skill` tuyệt kỹ + `lore`). Tách biệt 4 boss-vùng cũ.

| # | Tên | Lv | Hệ | CD (thắng) | Drop khi THẮNG |
|---|---|---|---|---|---|
| 1 | Huyết Lang Vương | 30 | Kim | 4h | 1× Tinh Thể · ~300 Hồn Thạch · EXP lớn · ~30% gear bậc 3-4 · da/liệu |
| 2 | Độc Giao Vương | 50 | Mộc | 6h | 1× Tinh Thể · ~600 Hồn Thạch · ~25% gear bậc 4-5 |
| 3 | Hỏa Lân Yêu Vương | 70 | Hỏa | 8h | 2× Tinh Thể · ~1000 Hồn Thạch · ~20% gear bậc 5-6 · ~8% mầm `hoPhuDauLinh` |
| 4 | Băng Phách Yêu Hậu | 90 | Thủy | 10h | 2× Tinh Thể · ~1500 Hồn Thạch · ~18% gear bậc 6 · ~6% mầm `hachCoLinh` |
| 5 | Thiên Ma Yêu Đế | 100 | Thổ | 12h | 3× Tinh Thể · ~2500 Hồn Thạch · ~15% gear bậc 7 Cô Bản · ~4% mầm `cuuViTinh`/`maToTam` |

*(Tên/Lv/CD/% là đề xuất — USER chỉnh. Tinh Thể đảm bảo vì cooldown đã gate.)*

**Cơ chế:**
- **Gate**: hiện boss nếu Chiến Đấu Lv ≥ reqLevel (chưa đủ → khoá, hiện "Cần Lv X").
- **Cooldown**: `state.boss.cd[bossId] = ts_hết`. Sẵn sàng nếu now ≥ cd (hoặc chưa đánh). Thắng → set cd. Thua → KHÔNG set cd (retry được), chịu phạt combat nhẹ (mất pending + nội thương như thua thường — TUNE nhẹ hơn vì là khiêu chiến chủ động).
- **Trận**: card boss → modal **Vây Sát** (chỉ số boss · **dự báo tỉ lệ thắng + máu tốn** · bảng drop · trạng thái CD) → "Vây Sát" → `resolveBossFight()` chạy `stepFight` tới khi 1 bên chết, gom chiến báo → hiện log + kết quả → thắng: thưởng + bật CD; thua: thông báo + cho thử lại.
- **Drop**: dùng `enemy.loot` (crystal chance 1.0×N hoặc hàm thưởng riêng đảm bảo Tinh Thể; gear/mầm theo % bảng trên). Cộng Hồn Thạch + EXP + Bạc.

**Cần code:** data 5 boss · `resolveBossFight(state,bossId)` (engine) · `state.boss.cd` + helper cooldown/format · màn Yêu Vương (roster card: art, chỉ số, drop, CD countdown, nút Vây Sát) + modal kết quả · verify game thật.

---

## D. BÍ CẢNH — SPEC GROUNDED (làm sau Yêu Vương)

**Cơ chế:** **hoạt động idle theo thời gian** (tái dùng `state.activity`, type `'dungeon'`) — chọn Bí Cảnh + chế độ → trả phí → chạy nền X thời gian → xong sinh **text-log 5 tầng** + roll **bảng loot vật phẩm THẬT** → nhận.

**5 tầng/lượt:** (1) quái thường → (2) sự kiện ngẫu nhiên → (3) tinh anh → (4) cơ duyên/bẫy/rương → (5) boss cuối. Log kể chuyện từng tầng (vd "Gặp Sơn Lang, thắng… Nhặt Da Sói×2… Độc vụ −5% HP… Boss: …").

**3 chế độ:** Chạy nhanh (5-10') ít thưởng · Treo (1-8h) ổn định · *(Khiêu chiến tầng sâu để sau nếu cần.)*

**Stat-check (map THẬT — đặc sắc, "lắp khôn"):** so chỉ số người chơi vs ngưỡng tầng:
- **Độc/Hàn/Nhiệt** (theo chủ đề) → `sinhLuc`/`hoThe` thấp thì −HP, −thưởng.
- **Thân Pháp** (`thanPhap`) cao → né bẫy, +tốc, +tỉ lệ cơ duyên.
- **Sức Mạnh** (`lucDao`) → cưỡng phá trận (mất ít HP) · **Ngộ Tính** (`linhXao`) → phá trận khôn khéo (không mất HP).
- Hàn/băng phó bản: `thanPhap` cao giảm ảnh hưởng giảm-tốc.

**Phần thưởng = VẬT PHẨM THẬT** (KHÔNG Đồ Phổ/mảnh kỹ năng v1): liệu (gỗ/khoáng/cá/da/lông) · Thỏi · Đá Cường Hóa · **gear** (rơi từ catalog theo bậc vùng) · Hồn Thạch · Bạc · EXP · hiếm: boss-mầm. *(Skill-từ-drop + Đồ Phổ = để dành, cần hệ mới.)*

**Phí vào:** Bạc + Hồn Thạch (theo bậc). **Gate:** Chiến Đấu Lv (gắn REALM_TIERS).

**9 phó bản (giữ chủ đề vision, drop map sang gear-slot/liệu thật):**
1. **Thanh Vân Cốc** (Lv~10, Nhân Gian) — tân thủ: liệu cơ bản + gear bậc 1-2. Boss Thanh Mộc Lang Vương.
2. **Hắc Phong Lâm** (Lv~25) — **Độc Khí** (check sinhLuc): da/lông + liệu + gear 2-4.
3. **Lưu Vân Động** (Lv~40) — **check Thân Pháp**: giày/đai/né + gear né.
4. **Băng Tâm Hàn Đàm** (Lv~55) — **Hàn Khí** (thanPhap giảm ảnh hưởng): ngọc bội/găng + liệu băng. *(mảnh "Băng Tâm Quyết" = để dành tới khi có hệ skill-drop.)*
5. **Xích Diệm Địa Cung** (Lv~70) — **Nhiệt Lực** (hoThe): vũ khí + liệu rèn (thỏi/than) + đá cường hóa.
6. **Cổ Mộ Kiếm Tông** (Lv~80) — **Kiếm Trận** (lucDao cưỡng / linhXao khôn): kiếm + gear cao. *(bí tịch = để dành.)*
7. **Vạn Yêu Sơn** (Lv~85) — *(combat-wave để dành; v1 làm idle như các phó khác)*: EXP cao + liệu thú.
8. **Thiên Cơ Di Tích** (Lv~92) — trận pháp (check linhXao cao): gear cao + nhiều đá cường hóa.
9. **Thái Hư Bí Cảnh** (Lv~100, Thần Vực) — **sự kiện ngẫu nhiên lớn**: gear Cô Bản + boss-mầm hiếm + Tinh Thể (nguồn phụ).

**UI thẻ:** Tên · Yêu cầu Lv · Thời gian · Phí · Sản xuất chính · [Tiến Vào] → modal Thông Tin / Bảo Vật (loot %) / Bắt Đầu (chế độ, phí, dự báo).

---

## E. CẦN HỆ MỚI (cờ — quyết khi tới)
- **Cơ Duyên (Magic Find)** stat: thêm field/derive để tăng % drop hiếm (giờ chỉ RNG cố định).
- **Skill-từ-drop / Đồ Phổ item**: hệ "mảnh kỹ năng/bí tịch/công thức" để học từ drop (giờ học ở Tàng Kinh Các). → mở "Cổ Mộ farm kỹ năng", "Băng Tâm Quyết mảnh".
- **gear `dropOnly`**: subset gear chỉ rơi từ boss/Bí Cảnh (giờ mọi gear đều rèn được).
- **Difficulty**: hệ độ khó cho hoạt động (giờ chưa có).
