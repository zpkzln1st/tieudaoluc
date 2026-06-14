# TIÊU DAO LỤC — Thiết kế Combat & Kỹ Năng (HƯỚNG MỚI)

> **Đây là nguồn chân lý mới cho combat/skill/nhân vật.** Thay thế phần "predictive combat + môn phái làm class" ở `project_tieudao.md` §3/§5/§15. Chốt ngày 2026-06-07 qua bàn luận với user.

---

## 0. Triết lý cốt lõi
- Combat = **auto-battler "Tuyệt Học Phổ"** (xem chiến báo theo nhịp), KHÔNG còn predictive-table.
- **Pool skill MỞ, đủ hệ, lắp tự do** — "thích chơi gì lắp nấy".
- **Bản sắc nhân vật KHÔNG đến từ class**, mà từ: **Tâm Pháp (đổi được) + Ngũ Hành + Synergy build**.
- Nhân vật = **người giang hồ tự do**. Tạo nhân vật chỉ chọn **Nam/Nữ + tên** (BỎ chọn môn phái/class).
- Khớp DNA dự án: *Ngũ Hành* + *Vạn Vật Phổ* (sưu tầm) + *Truyền Công*.

---

## 1. Nhân vật
- Tạo nhân vật: **Nam/Nữ + tên + chọn 1 Tâm Pháp khởi tu** (1 trong 5 ngũ hành). Không class, không môn phái. *(2026-06-10)* Tâm Pháp khởi tu quyết định **hệ ngũ hành khởi đầu** → bộ NHẬP MÔN **tối giản** sở hữu+lắp sẵn theo hệ đó: **chỉ tâm pháp + 1 chiêu Sơ Cấp + 1 bị động cùng hệ** (qua `starterLoadoutFor`) — còn lại (chiêu thêm, bị động 2, bậc cao, hệ khác) phải HỌC/MUA. KHÔNG ép Hỏa nữa (`normOwned` bỏ inject DEFAULT_OWNED; chỉ union owned + đồ đang lắp). Đổi/học hệ khác sau ở Tàng Kinh Các.
- **Tứ Trụ** giữ nguyên: Lực Đạo / Hộ Thể / Thân Pháp / Linh Xảo (lên EXP qua hoạt động).
- Avatar theo **giới tính** (không theo class).
- Bản sắc = Tâm Pháp + build skill + Cảnh Giới (không phải class).

---

## 2. Loadout chiến đấu ("Bài Võ" / "Đang Trang Bị")
```
┌─ Tâm Pháp (1 ô cố định nhưng ĐỔI được)   ← nội công nền, thiên 1 hệ
├─ Chiêu Thức chủ động ×N                   ← mở DẦN theo Cảnh Giới (đầu 3–4 → tối đa 6)
├─ (Trấn Phái / Tuyệt Kĩ Ultimate ×1)       ← ô đặc biệt, ĐỂ DÀNH làm sau
Bộ Pháp (1–2)        ← riêng, ĐÃ CÓ (có đánh đổi pros/cons)
Bị Động (2, auto)    ← riêng, ĐÃ CÓ
```
- **Tâm Pháp**: bị động nền (không ra đòn), **đổi được** — mỗi cái thiên 1 hệ (Viêm Dương→Hỏa, Huyền Băng→Thủy…) hoặc trung tính. Là "ô cố định" trong UI nhưng nội dung thay theo build.
- **Số ô chiêu chủ động mở theo Cảnh Giới** → tạo cảm giác tiến bộ. Tổng đề xuất: **1 Tâm Pháp + tối đa 6 chiêu** (đúng "6–7" đã bàn). KHÔNG cho hết từ đầu.
- Thứ tự ô chiêu = ưu tiên thi triển (kéo đổi 1→N).

---

## 3. Pool Skill MỞ — đủ hệ, lắp tự do
- Mọi skill mọi hệ: **Ngũ Hành** (Kim/Mộc/Thủy/Hỏa/Thổ) + **Vật Lý** + **Trợ (buff)**. (Xem `design_ngu_hanh.md`.)
- **Không khoá theo class** — lắp gì cũng được.
- "**Lắp khôn > lắp bừa**" nhờ Tâm Pháp + ngũ hành + synergy (mục 5).
- Mọi skill sưu tầm được gắn vào **Vạn Vật Phổ**.
- Mỗi chiêu cần trường: `id, name, he (ngũ hành/vatly/buff), tier (sơ/trung/cao/tuyệt), mult, nl, cd, hiệu ứng (burn/stun/lifesteal/slow…), art id`.

---

## 4. Bậc thang độ hiếm & NGUỒN skill (vòng lặp idle cốt lõi)
| Bậc | Nguồn | Cách lấy |
|---|---|---|
| **Sơ – Trung** | Học quán/NPC môn phái + rơi từ quái thường | Dễ; **Trung mua được bằng Bạc** |
| **Cao** | Rơi tỉ lệ **rất nhỏ** + Tiệm | Mua bằng **Kim Nguyên Bảo** (đắt) |
| **Tuyệt Kĩ / Ultimate** | KHÔNG mua/rơi thẳng → **CHẾ TẠO** | Săn **boss** (tỉ lệ siêu thấp) ra **đồ phổ/công thức** → gom **nguyên liệu** → chế **bí kíp** → học |

→ Tuyệt kĩ là **endgame chase** (săn boss + farm liệu + craft). Cao gate bằng độ hiếm + Nguyên Bảo. Sơ-trung dễ tiếp cận.

---

## 5. Bản sắc & Synergy (lý do để build CÓ CHỦ ĐÍCH)
Tự do mà không ràng buộc → ai cũng lắp 6 nuke mạnh nhất, build giống nhau. Cần động lực build thông minh:
1. **Tâm Pháp tăng mạnh 1 hệ** → đi thuần hệ lợi, đi tạp mất buff.
2. **Ngũ hành khắc/kháng = xương sống chiến thuật**: quái vùng kháng Hỏa → đổi Thủy/Lôi. **Đổi loadout theo vùng** = quyết định idle thú vị nhất. (+30% khắc / −20% bị kháng, xem `design_ngu_hanh.md`.)
3. **Set / combo synergy**: nhiều chiêu cùng hệ kích hiệu ứng cộng hưởng (vd 3 chiêu Hỏa → Bỏng mạnh hơn).

---

## 6. Môn Phái = HỌC QUÁN MỞ (không phải class)
- Môn phái tồn tại như **địa điểm / NPC trong giang hồ**.
- Ai cũng vào **học chiêu sơ–trung** của phái đó (Hỏa môn dạy chiêu Hỏa, Thủy môn dạy Thủy…), **không bị khoá vào 1 phái**.
- Nhân vật là **lãng khách**, học ở đâu cũng được.

---

## 7. Hệ NGHỀ (Profession) — thay "class" cũ, lo mảng KĨ NĂNG SỐNG
Bỏ class chiến đấu. Tái dụng 12 "class" cũ theo 3 nhóm:

| Nhóm cũ | Gồm | Xử lý |
|---|---|---|
| **Kỹ Năng (6)** | Tiều Phu · Thợ Mỏ · Ngư Ông · Đầu Bếp · Thợ Luyện Kim · Ngự Thú Sư | → **đổi nhãn thành "NGHỀ"**, giữ nguyên bonus +1 kĩ năng sống. Thêm nghề cho skill còn thiếu (Dược Sư→Luyện Đan, Thiết Tượng→Rèn Đúc, Thiền Sư→Tọa Quan, Doanh Tạo Sư→Xây Dựng…) |
| **Chiến Đấu (3)** | Chiến Sĩ · Ám Vệ · Du Hiệp | → **BỎ** (combat giờ tự do) |
| **Khổ Tu (3)** | Phế Nhân · Lưu Đày · Ma Chủng | → giữ làm **"Chế độ Thử Thách"** tùy chọn (toggle hardcore), KHÔNG phải nghề |

**Vận hành Nghề (đã chốt):**
- **HỌC nghề từ NPC** (gặp sư phụ nghề trong giang hồ).
- **GIỮ NHIỀU nghề cùng lúc** (không chọn 1 lúc tạo nhân vật).
- Nghề cho bonus EXP/Hiệu suất kĩ năng sống tương ứng.

---

## 8. UI Chiêu Thức (theo mockup user gửi)
- **Khu "Đang Trang Bị"**: tile **ART** cho Tâm Pháp + các chiêu (số 1–N + nhãn hệ + kéo đổi thứ tự).
- **Thư viện chiêu**: thumbnail **art** + **lọc theo hệ** (Tất cả/Hỏa/Thủy/…/Vật Lý/Trợ) + **Khuyến nghị**.
- **Tự sắp tối ưu** (auto-pick 4–6 chiêu mạnh nhất vs quái đang chọn) — làm sau.
- **Art**: dùng `ico()` load `images/skills/<id>.png`, **placeholder** = tile gradient + line-icon theo hệ khi chưa có art. Thả file art vào là tự hiện, không sửa code. Art vuông 256/512px.

---

## 9. Đã có / Cần đổi / Để dành (trạng thái build)
**ĐÃ CÓ (giữ):**
- votong.js: deriveCombat, makeFight/stepFight, cycle 8s, chiến báo màu, dodge.
- Bộ Pháp 6 (pros/cons, chọn 1–2), Bị Động 2.
- Popup Suy Tính (combatModal) + harvestEstimate (dự tính/giờ).
- Layout 3 cột Chiến Đấu (Chiêu trái / Chiến Báo giữa / Bộ Pháp+Túi+Tiến+Trạng Thái phải).
- Icon line-SVG (`svg()` helper).

**CẦN ĐỔI (khi build hướng mới):**
- Tạo nhân vật: bỏ chọn class → **Nam/Nữ + tên**.
- `skillExpMultiplier` (bonus class) → chuyển sang **hệ Nghề** (học nhiều nghề).
- Avatar theo **giới tính**.
- votong.js: **Tâm Pháp đổi được + nhiều hệ**; pool chiêu **mở rộng đủ hệ** + trường `he`; **synergy**.
- Ngũ hành: từ **Hỏa-only → đủ hệ** (enemy.fireMod → bảng khắc/kháng đa hệ).
- Số ô chiêu **mở theo Cảnh Giới**.
- Nguồn skill: học quán/NPC, rơi, Tiệm (Bạc/Nguyên Bảo), craft tuyệt kĩ.

**ĐỂ DÀNH (sau):**
- Trấn Phái / Tuyệt Kĩ Ultimate (ô đặc biệt + craft từ boss).
- Tự sắp tối ưu. Art thật cho từng chiêu. Set/combo synergy chi tiết.

---

## 10. Lộ trình build gợi ý (làm dần, verify từng bước)
1. ✅ **Nhân vật tự do**: tạo nhân vật Nam/Nữ + tên; bỏ UI chọn class; avatar theo giới tính; di dời `skillExpMultiplier`.
2. ✅ **Hệ Nghề**: đổi 6 class Kỹ Năng → Nghề; NPC dạy nghề; giữ nhiều nghề; bỏ 3 class Chiến Đấu; Khổ Tu → toggle thử thách.
3. ✅ **Pool skill đủ hệ** (làm gộp với #4): NGU_HANH + nguHanhMod (khắc +30/kháng −20, vòng Kim→Mộc→Thổ→Thủy→Hỏa→Kim); CHIEU mở rộng **17 chiêu đa hệ** (Hỏa4/Thủy3/Mộc3/Kim3/Thổ2/Vật lý1/Trợ1) + trường `he`+`tier`+ hiệu ứng slow/heal/pen/critBonus; bỏ `fireMod`. **Ngũ hành yêu thú NGẪU NHIÊN mỗi trận** (rollHe — không cố định; boss có thể đặt `enemy.he` để cố định) → ép build đa hệ + 1 chiêu Vật Lý; Suy Tính dự báo TRUNG BÌNH 5 hệ (verdict "Hên Xui" nếu thua vài hệ); chiến báo + dòng mở đầu báo hệ từng vòng.
4. ✅ **Tâm Pháp đổi được** + số ô chiêu mở theo Cảnh Giới: **5 Tâm Pháp ngũ hành** (Viêm Dương/Huyền Băng/Thanh Mộc/Cương Kim/Hậu Thổ — mỗi cái 1 archetype + thiên 1 hệ, đổi tự do qua popup); bị động **Ngũ Hành Hộ Thể** (+15% chiêu cùng hệ TP) → heBonus tổng 0.35 cho hệ thuần; ô kĩ năng = `4 + ⌊Chiến Đấu Lv/30⌋` (gồm 1 Tâm Pháp), clamp loadout cũ; UI: tile Tâm Pháp + lọc chiêu theo hệ + badge/khắc-kháng + Suy Tính ngũ hành động.
5. ✅ **UI Chiêu Thức art-tile**: popup **Thiết Lập Bài Võ** (gộp Tâm Pháp + Chiêu) — tab Chiến Đấu chỉ còn card "Bài Võ Đang Lắp" gọn (tile art + nút Thiết Lập). Popup 2 cột: Đang Trang Bị (tile Tâm Pháp 心 + chiêu đánh số) · tab Chiêu/Tâm Pháp + lọc hệ + thư viện lưới art | bảng chi tiết (art lớn, chỉ số, hiệu ứng, lore, synergy, nút Trang bị/Gỡ/Dùng). Art = nền gradient theo hệ + line-icon, đè `images/chieu|tamphap/<id>.png` (onerror tự ẩn → thả art vào là đẹp). CÒN: Khuyến nghị/Tự sắp tối ưu, kéo đổi thứ tự ô.
6. **Nguồn skill** (đang làm dần):
   - ✅ **Sở hữu + HỌC + MUA** (2026-06-10): hệ sở hữu `state.combat.owned={chieu,tamPhap,biDong}` — KHOÁ cả Chiêu+Tâm Pháp+Bị Động, chỉ lắp được khi đã sở hữu (gate ở toggleChieu/switchTamPhap/toggleBiDong). Nhân vật mới chỉ có bộ nhập môn (3 chiêu Hỏa + Viêm Dương + 2 bị động); migrate cấp sở hữu cho mọi thứ đang lắp. Giá theo bậc (đã cân theo thu nhập — điểm danh/quest cho hàng nghìn Bạc): **Sơ 300 / Trung 3.000 Bạc** (HỌC ở Môn Phái), **Cao 70–85 Nguyên Bảo** (MUA bí phổ); **Tâm Pháp 5.000 Bạc, Bị Động 2.000 Bạc**. Giá dùng **icon tiền thật** (ico bac/nguyenBao) trên nút Học/Mua. Thẻ đã học chỉ 1 dấu "✓ Đã sở hữu" (bỏ icon dư). Phẩm chất phân biệt bằng màu viền/badge: Sơ Cấp xám · Trung Cấp xanh · Cao Cấp vàng+glow; header môn phái = chữ Hán + crest art (images/monphai/&lt;he&gt;.png). Thêm **5 chiêu Cao** (Phần Thiên Cửu Diễm/Huyền Băng Phong Thiên/Thiên Độc Mãng Đằng/Kim Cương Phá Thiên/Địa Liệt Thiên Băng) → tổng 22 chiêu. **Môn Phái** (7, theo hệ) gom mục ở Tàng Kinh Các. UI: (a) gate trong popup Bài Võ — tile khoá grayscale + ổ khoá + giá, nút hành động đổi Học/Mua; (b) **trang Tàng Kinh Các** (nav nhóm Chiến Đấu) — gom theo môn phái, thẻ art-tile + Học/Mua + tiến độ "Đã thông X/37". Helpers votong: MON_PHAI, chieuCost/tamPhapCost/biDongCost, skillSource, normOwned, DEFAULT_OWNED, TIER_LABEL/ORDER. ĐÃ VERIFY game thật (server :5599).
   - ⬜ **RƠI** từ quái/bí cảnh · **CRAFT tuyệt kĩ** từ đồ boss (maToTam/cuuViTinh/hachCoLinh/hoPhuDauLinh + liệu).
   - Popup Bài Võ ĐÃ đồng bộ badge bậc màu (Sơ Cấp xám/Trung Cấp xanh/Cao Cấp vàng, dùng tierStyle) + icon tiền thật ở mọi chỗ hiện giá (header/nút/tile, qua costIcon).
   - Art còn thiếu cho 5 chiêu Cao (images/chieu/<id>.png: ptcd/hbpt/tdmd/kcpt/dltb).
7. (Sau) Synergy/set · Trấn Phái Ultimate · Tự sắp tối ưu · Art thật.
