# TIÊU DAO LỤC — Thiết kế Hệ Trang Bị ("Thập Toàn Giáp")

> **Nguồn chân lý cho hệ trang bị.** Chốt hướng 2026-06-11. Tận dụng bộ art `eq_*` (VLTK, ~129 món .webp, nhóm sẵn theo BỘ). Bám đúng code hiện có: slot `src/data/ui.js`, equip `src/engine/equip.js`, stat `src/engine/stats.js` (gearStats), combat `src/data/votong.js` (deriveCombat), phẩm chất `QUALITY` `src/data/items.js`, thỏi luyện kim `src/data/skills.js` (daLuyen).

---

## ✅ CHỐT & TIẾN ĐỘ (2026-06-11) — đọc trước, ĐÈ các mục dưới khi mâu thuẫn

**Slot (đơn giản hơn §1):** 9 chính + 3 công cụ.
`mu · giap (gộp vai trò quần) · dai🆕 · gang · giay · vuKhi · nhan (1 ô) · trangSuc🆕 (Dây Chuyền HOẶC Ngọc Bội) · toaKy🆕`. Công cụ: `canCau · cuoc · riu`.
→ **BỎ** so với §1: Quần, Phụ Khí, Phi Phong, Hộ Phù, ô Nhẫn thứ 2, Bội Sức.

**Catalog:** USER chọn món + đặt tên + tự bỏ art; CLAUDE lo phẩm chất/chỉ số/scale + chỉ folder. Art `eq_*.webp` đang ở Desktop user, **CHƯA bỏ vào project** — đợi user. Quy ước: id gear bắt đầu `eq_`, art → `images/equip/<id>.png` (ICON_FOLDERS đã map). `.webp` → khi nào dùng thì nới loader (browser render được).

**Cường hóa (ĐÈ §6):** KHÔNG tốn Thỏi trực tiếp. Thỏi → **ép thành Đá Cường Hóa** (3 cấp Sơ/Trung/Cao) → dùng Đá +0→+15. Mỗi cấp cường hóa cần số Đá khác nhau. **Có tỉ lệ thất bại, KHÔNG tụt cấp** (fail = mất liệu). **+10 trở lên** cần thêm **tinh thể Boss (Yêu Vương / World Boss)**. Công thức ép phải khiến MỌI tier Thỏi đều có giá trị.

**Đã build (verify game thật OK):**
- `src/data/gear.js`: `mkEquipStats(slot,itemLv,quality)` (LV_MUL 0.06, QUALITY_MUL 1.0→3.4), `mkGear()`, `BASE_BY_SLOT`, 7 món `SAMPLE_GEAR` (dev, emoji — F9 → "Tặng đồ mẫu").
- `ui.js`: EQUIP_SLOTS(9)+TOOL_SLOTS(3)+RETIRED_SLOTS. `stats.js`: `gearEle()`. `votong.js deriveCombat`: cộng gear vào `eleBonus` (chảy vào ST chiêu cùng hệ qua line ~466). `main.js`: migrate slot bỏ→túi, ICON_FOLDERS eq_→'equip', `gearHe/gearCompare/gearStatLabel`, `devGiveSampleGear`.
- `index.html`: paper-doll 3×3, equip modal (badge ngũ hành + stat nhãn Việt + eleDmg + so sánh ±).
- **Rèn Đúc (bước 5):** `gear.js` `mkGearRecipe()`+`thoiForLevel()`+`forgeableGear()`; `skills.js` tự đẩy recipe vào `SKILLS.daTao.actions` cho MỌI gear rèn được (itemLv+slot, trừ `equip.dropOnly`/boss). Thỏi theo tier itemLv (1 tier Thỏi=1 tier gear) + liệu phụ theo slot, số lượng × phẩm chất. → user thêm gear là CÓ recipe tự động.
- **CATALOG THẬT (2026-06-11, cập nhật):** `gear.js` `GEAR` = **84 món**: Áo7·Đai7·Găng7·Mũ7·Nhẫn7·Trang Sức7·Tọa Kỵ7·Giày7 + **Vũ Khí 28** = 4 loại ×7 bậc (Kiếm/Đao/Cung/ÁmKhí, `equip.weaponType` = kiem/dao/cung/amkhi, id `eq_<type>_<bac>`, tên thematic tự sinh — user rename được). Đá Cường Hóa art (`so/trung/cao.png`→`daCuongHoa*.png`). **Art folder equip LẪN .webp (59 gốc) + .png (28 vũ khí + 3 giày mới)** → `ico()` thử .webp→.png→emoji. (6 vũ khí tạm cũ đã bỏ khỏi catalog; art .webp của chúng orphan, vô hại.) `bac1→7 = 7 bậc phẩm chất` (BAC_QUALITY) + itemLv suy từ bac (BAC_LEVEL 8/22/36/50/66/82/100, TUNE sau). `mkBac()` tạo món. SAMPLE_GEAR dev ĐÃ BỎ.
- **ART webp:** ~59 file `images/equip/<id>.webp` (id=tên Hán-Việt snake_case). `ico()` đọc `.webp` cho folder 'equip'. Verify: art load OK (naturalWidth 1254), paper-doll 9 slot hiện art thật, viền màu phẩm chất.
- Verify tổng: 59 món load 0 lỗi, scale chuẩn (Minh Vương Khải Giáp Lv100 coBan: Thủ142/SL425), daTao 62 action, equip→Chiến Lực phản ánh.
- **Trang "Trang Bị" RIÊNG (C1, 2026-06-11):** mục nav mới `trangbi` (nhóm Nhân Vật, icon = art `images/nav/trangbi.png` qua ico() — đã có art 2026-06-11) — paper-doll: **avatar nhân vật ở giữa** + 4 ô trái (Mũ/Giáp/Đai/Găng) + 4 ô phải (Vũ Khí/Trang Sức/Nhẫn/Giày) + thanh dưới (Tọa Kỵ + 3 công cụ), ô ~96px có viền màu phẩm chất + tên slot; bên phải = bảng Chỉ Số Tổng + ô Bộ Trang (sắp). Paper-doll cũ trong Hồ Sơ → đổi thành card link. (Fix `isPlaceholderView` thiếu trangbi/tangkinhcac.) User chốt C1 (mockup A/B/C).
- **Modal đổi trang bị = MÔ PHỎNG IdleMMO (chốt 2026-06-11, user gửi ảnh mẫu yêu cầu "chính xác tuyệt đối"):** 3 mục **ĐANG MẶC / ĐỀ CỬ CHO BẠN / KHÁC**. Mỗi dòng = art + **★ sao = qualityRank** + tên trắng + **badge CHỮ phẩm chất** + **stat kèm icon line** (`gearStatIcon`: Né→steps, Sinh Lực→heart, Công→sword, Thủ→shield, Chính Xác→scope) + giá trị/Δ. ĐANG MẶC: giá trị tuyệt đối. ĐỀ CỬ: thẻ **viền vàng + ribbon "Đề cử" + nút "Trang Bị Nhanh" xanh** = món NÂNG CẤP tốt nhất (`recommendedForSlot` = max tổng Δ stat, null nếu không có). KHÁC: Δ màu (xanh ▲ / đỏ ▼ / "—" nếu =0), nút Trang Bị. Chân: legend phẩm chất + **checkbox "Chỉ hiển thị tốt hơn"** (`equipFilterBetter` lọc `othersForSlot`). Helper main.js: `gearStatIcon/gearGainTotal/recommendedForSlot/othersForSlot/equipFilterBetter` + `QUALITY_KEYS/qualityRank/qualityName`. **TIẾN TRÌNH UI modal: pip→bỏ→Kiểu3 thẻ art→cuối cùng user đưa ảnh IdleMMO yêu cầu clone chính xác. Bài học: user CỰC kỹ UI, khi có ảnh mẫu thì BÁM SÁT.**

- **CƯỜNG HÓA bằng Đá (bước 6) — XONG, verify game thật (2026-06-11):** `src/engine/enhance.js` (TABLE +1→+15, `tryEnhance/canEnhance/enhanceStep/gearPlus/enhanceMul`). Mỗi +1 = **+8% stat nền** (`gearStats` ×`enhanceMul`); +15≈×2.2. **Đá Cường Hóa Sơ/Trung/Cao** (items.js) ÉP TỪ THỎI ở Luyện Kim (`daCuongHoaSo`←dongDinh, Trung←hanThietDinh, Cao←vanThietDinh). Tốn Đá(theo bậc)+**Hồn Thạch**(sink chính); **+10↑ cần `tinhTheYeuVuong`** (Boss crystal, chờ World Boss; dev-grant để test). **Fail = mất liệu, KHÔNG tụt cấp**; rate giảm dần (+1-3:100%...+15:16%). State: `state.enhance[itemId]=plus` (theo itemId — lưu ý: nhiều copy cùng id share +N, chấp nhận vì gear thực tế unique). UI: **modal "Lò Cường Hóa"** (item+N, preview stat cur→next, liệu have/need, rate, nút khóa khi thiếu) mở từ nút "Cường Hóa" ở banner equip-modal; **badge +N** trên paper-doll + equip modal. Dev: "Tặng đá cường hóa". Verify: +0→+3 stat +24%, gating crystal +11, maxed +15 OK.
  - **UI modal REDESIGN (2026-06-12) — "Tiêu Điểm" (Kiểu 2), verify game thật:** bố cục art TO căn GIỮA làm tâm điểm + ★ qualityRank + tên (màu phẩm chất) + badge phẩm chất·Lv, rồi `+N → +N+1`; dưới chia **2 cột Chỉ số | Nguyên liệu** (stat cur→next + Δ xanh; liệu = art thật qua `ico()` + have/need xanh/đỏ, ẩn Tinh Thể khi crystalQty=0), thanh **tỉ lệ** mảnh (xanh≥80/vàng≥50/đỏ), nút. Icon = **SVG line `svg()`** (KHÔNG emoji). w-[380px], bám sát ngôn ngữ modal Trang Bị. **Hiệu ứng mốc +5/+10/+15 = GLOW TĨNH** (radial mờ sau khung + box-shadow + viền vàng + tag "Mốc Hoàng Kim"), `milestone = [5,10,15].includes(itemPlus)`. **⛔ User BÁC bản "vòng hào quang VÀNG XOAY quanh trang bị" (to, quay) — đè ghi chú 'đã duyệt bản vàng' cũ: trong modal CHỈ glow tĩnh, KHÔNG vòng xoay.** Logic/data enhance.js + store giữ NGUYÊN (chỉ restyle markup index.html). Backup: `_backup/index.html.before_locuonghoa`.
  - **UI modal V2 — "Giấy Cổ Thủy Mặc" (Kiểu 4) — CHỐT & verify game thật (2026-06-12):** user gửi 5 ảnh mẫu cao cấp → chọn Kiểu 4 (giấy sờn + tranh mực rồng/núi + cọ + triện + nút art). Phong cách CẦN art asset → user TỰ gen 7 PNG trong suốt bỏ `images/ui/enhance/`: `bg-paper, brush-title, brush-underline, btn-enhance, btn-enhance-off, seal-red, cloud-corner`. **Kỹ thuật:** bg-paper làm NỀN (`object-fit:fill`) + mây 2 góc + overlay UI SỐNG; text/số/khung ô/thanh tỉ lệ/mốc = **CSS màu mực-trên-giấy** (KHÔNG bake chữ vào ảnh vì AI gen sai tiếng Việt). Nút = ảnh art, đổi `btn-enhance`↔`btn-enhance-off` theo `enhanceCan`. Modal `w-[600px]` cao ~724 (fit 768). Màu phẩm chất phải DARKEN cho đọc trên giấy (map `qcol` inline). Mốc glow vẫn giữ (viền item vàng+glow ở +5/+10/+15). **Visual MỚI chưa nối logic (chỉ vỏ):** checkbox *Dùng Bảo Hộ* / *Cường hóa liên tục* (x-model local), đường *MỐC CƯỜNG HÓA* (+5/+10/+15 sáng theo itemPlus, +20/+25 khoá). Logic enhance giữ NGUYÊN. Backup `_backup/index.html.before_kieu4`. **Bài học: style 'art vẽ sẵn' (kim loại/giấy thủy mặc) chỉ giống ~100% khi user CẤP PNG; CSS/SVG thuần chỉ ~60%. Quy trình asset: spec tên/định dạng/kích thước + prompt gen, NỀN để giữa trống, KHÔNG chữ trong ảnh.**
  - **⛔ REVERT (2026-06-12, cuối phiên):** sau nhiều vòng lặp (Kiểu2 → Kiểu4 + sửa font), **user mệt → yêu cầu KHÔI PHỤC MODAL VỀ BẢN GỐC ban đầu** (modal sơ sài `w-80` amber). `index.html` đã `cp` từ `_backup/index.html.before_locuonghoa`. **MODAL ĐANG LIVE = BẢN GỐC, KHÔNG phải Kiểu 4.** Giữ lại: bản Kiểu4 đầy đủ ở `_backup/index.html.kieu4_final_2026-06-12`, 7 asset PNG ở `images/ui/enhance/` (unused), backup `before_kieu4`(=Kiểu2)/`before_locuonghoa`(=gốc). Muốn dựng lại Kiểu 4 thì lấy từ snapshot. **Bài học lớn: user dễ mệt khi lặp UI nhiều vòng — cân nhắc chốt sớm, đừng kéo dài.**

**Còn lại:** **Ngũ Hành cho gear** (hiện he=null toàn bộ — cần pass thiết kế build, gán hệ thematic) · Giày bac5-7 (Phong Ảnh Hài/Lôi Quang Chiến Ngoa/Thiên Hành Thần Lý — chờ art) · Vũ khí đủ bộ + khoá theo loại · Lore/desc văn vẻ từng món · Cường Hóa bằng Đá (bước 6) · Set bonus (§5) · Tọa Kỵ travel (§8) · Drop (§9) · popup gear ĐẦY ĐỦ · UI Rèn Đúc nhóm/lọc.

---

## 0. Triết lý
- Trang bị là **cornerstone nối mọi mảnh**: `cày liệu → Thỏi → Rèn trang bị → Cường hóa (Hồn Thạch) → mạnh hơn → đánh boss → drop gear/mầm thần khí → sưu tầm bộ`.
- **Khác VLTK thường ở 1 điểm cốt lõi**: trang bị mang **Ngũ Hành** → là một phần của **build** (cộng hưởng Tâm Pháp + Bị Động), không chỉ "cộng stat".
- Vá đúng 2 lỗ hổng đang có: **endgame loop** (sau Lv30 thiếu mục tiêu) + **sink Hồn Thạch** (gần như chưa dùng).

---

## 1. Slot (paper-doll)
Mở rộng từ 7 slot chiến hiện tại. Đề xuất **8 trang bị chính + 5 trang sức/phụ + 3 công cụ (giữ nguyên)**.

### Trang Bị Chính (8)
| Slot id | Tên | Art `eq_*` | Ghi chú |
|---|---|---|---|
| `vuKhi` | Vũ Khí | `_kiem/_dao/_thuong/_cung/_chuy/_kich/_phu/_tien` | nguồn Công chính; dòng **hút máu/khí** chỉ ở đây |
| `phuKhi` | Phụ Khí | `_bi_giap` (khiên), ám khí... | off-hand; mở/khoá theo loại vũ khí (sau) |
| `mu` | Mũ | `_quan/_khoi/_mao/_mien/_can` | |
| `giap` | Áo / Giáp | `_giap/_bao/_y/_phuc` | nguồn Thủ + Sinh Lực chính |
| `dai` | Đai 🆕 | `_doi` (~15 món) | |
| `gang` | Hộ Thủ / Găng | `_thu` (~15 món) | |
| `giay` | Hài / Giày | `_lay/_giay` | nguồn Né/Tốc |
| `phiPhong` | Phi Phong 🆕 | `_bao/_phuc/_mao` (áo choàng) | |

> Bỏ slot `quan` (Quần) cũ — võ hiệp áo bào liền, art không có quần riêng. (Có thể gộp stat quần vào Giáp.)

### Trang Sức / Pháp Bảo (5)
| Slot id | Tên | Art | Ghi chú |
|---|---|---|---|
| `dayChuyen` | Dây Chuyền | `_boi` (vòng cổ) | |
| `ngocBoi` | Ngọc Bội | `_boi/_chau/_linh_phu` | dòng **hồi Nội Lực** ưu tiên ở đây |
| `nhan1` | Nhẫn (1) | `_nhan` (~15 món) | dòng **hồi Nội Lực** |
| `nhan2` | Nhẫn (2) | `_nhan` | |
| `hoPhu` | Hộ Phù / Ấn | `_phu/_an/_bai/_lenh/_phat_chau` | bùa hộ mệnh |

### Tọa Kỵ (1) — sub-system riêng
| `toaKy` | Tọa Kỵ / Ngựa | `_ma/_cau/_tho/_lu/_su_tu` (~15) | +**Khinh Công** (travel nhanh) + stat phụ |

### Công Cụ (giữ nguyên — gathering)
`canCau` Cần Câu · `cuoc` Cuốc · `riu` Rìu. (Bỏ `boiSuc` cũ — thay bằng các slot trang sức ở trên.)

→ Tổng ~17 slot. Paper-doll: nhân vật giữa, chính bao quanh, trang sức 1 hàng dưới, tọa kỵ + công cụ tách riêng.

---

## 2. Mô hình dữ liệu item trang bị
Mở rộng `item.equip` (hiện chỉ `{slot, stats}`):
```js
equip: {
  slot: 'giap',                 // slot id (mục 1)
  itemLv: 48,                   // cấp item -> scale stat (mục 3)
  stats: { hoThe: 80, sinhLuc: 200 },  // chỉ số nền (key = gearStats: congKich/hoThe/neTranh/menhTrung/sinhLuc)
  he: 'hoa',                    // Ngũ Hành (kim/moc/thuy/hoa/tho) hoặc null (vô hệ) — mục 4
  eleDmg: 0.10,                 // +10% ST chiêu CÙNG hệ `he` (mục 4)
  set: 'huyenThietChien',       // id bộ (mục 5) hoặc null
  special: { nlRegen: 0.02 },   // dòng đặc biệt theo slot (mục 8)
}
```
`item.quality` (đã có) = phẩm chất. `slot` quyết định nơi mặc + dòng đặc biệt được phép.

---

## 3. Chỉ số & công thức scale
Chỉ số nền = **base theo slot × hệ số cấp × hệ số phẩm chất**.
- **Hệ số cấp**: `lvMul = 1 + (itemLv-1) × 0.06` (Lv1→×1, Lv100→×6.9). Bám sát đường cong địch (HP ~L^2.25) — phối hợp rebalance combat sau.
- **Hệ số phẩm chất** (`QUALITY`): Phàm 1.0 · Lương 1.25 · Tinh 1.55 · Tuyệt 1.9 · Truyền Thế 2.3 · Thần 2.8 · Cô Bản 3.4.
- **Base theo slot** (phân bổ vai trò):
  - Vũ Khí → Công Kích (cao) + ít Bạo
  - Giáp/Áo → Hộ Thể + Sinh Lực (cao)
  - Mũ → Hộ Thể + Mệnh Trúng
  - Đai → Sinh Lực + Hộ Thể
  - Găng → Công Kích + Bạo
  - Giày → Né + Thân Pháp
  - Phi Phong → Né + Sinh Lực
  - Dây Chuyền/Bội → Công/Sinh Lực + Nội Lực
  - Nhẫn → linh hoạt (Công hoặc Bạo) + Nội Lực
  - Hộ Phù → kháng/đặc tính

→ Bảng base cụ thể: lập 1 hàm `mkEquipStats(slot, itemLv, quality)` ở data (giống `mk()` của quái) để cân tập trung 1 chỗ.

---

## 4. ⭐ Ngũ Hành trên trang bị (bản sắc)
- Mỗi món có thể mang 1 **hệ** (`he`) + `eleDmg` (+% ST chiêu cùng hệ). Mặc nhiều món cùng hệ → cộng dồn.
- **Tích hợp `deriveCombat`** (votong.js): hiện `eleBonus{kim,moc,...}` chỉ lấy từ Bị Động (`p.eleDmg` theo `p.he`). Thêm 1 vòng quét trang bị đang mặc → `eleBonus[gear.he] += gear.eleDmg`. KHÔNG đổi công thức combat, chỉ thêm nguồn cộng.
- → Build thuần hệ (Tâm Pháp Hỏa + Bị Động Hỏa + giáp/vũ khí Hỏa) cộng hưởng lớn. "Lắp khôn > lắp bừa" mở rộng sang cả gear.
- *(Để dành)* **Kháng ngũ hành**: hiện combat chưa có kháng phía người chơi (địch hệ ngẫu nhiên). Khi thêm, gear `he` cho thêm `-X% ST nhận từ hệ đó`.

---

## 5. Bộ Trang (Set Bonus)
- Art **đã nhóm sẵn bộ** (vd `huyen_thiet_chien_giap/_doi/_quan`, `han_giao_lan_*`, `cuu_long_*`). Tận dụng luôn.
- `item.equip.set = '<setId>'`. Data `EQUIP_SETS`:
```js
huyenThietChien: { name:'Huyền Thiết Chiến', he:'kim',
  pieces:['eq_huyen_thiet_chien_giap','eq_huyen_thiet_chien_doi','eq_huyen_thiet_chien_quan'],
  bonus: { 2:{ hoThe:0.10 }, 3:{ eleDmg_kim:0.15, sinhLuc:0.12 } } }  // mặc đủ 2/3 món -> mốc bonus
```
- Mặc đủ N món bộ → mốc bonus (stat % hoặc +ngũ hành). Vừa là **mục tiêu sưu tầm** (Vạn Vật Phổ), vừa **định hình build**.

---

## 6. Cường Hóa (+0 → +15) — SINK Hồn Thạch
- Mỗi món có `state` riêng: `{ itemId, slot, plus: 0..15 }` (lưu theo từng món đang mặc, hoặc theo instance).
- **+1 cấp**: tốn **Thỏi cùng tier** (vừa làm ở Luyện Kim!) + **Hồn Thạch** (tăng dần) + (tùy) tỉ lệ thành công (cao tier có thể rớt cấp/giữ nguyên — chống lạm phát).
- Mỗi +1 → **+8% chỉ số nền** của món (cộng dồn). +15 ≈ ×2.2.
- → **Vá đúng sink Hồn Thạch** đang thiếu + cho **Thỏi** mục đích tiêu thụ rõ ràng.
- *(Để dành)* **Khảm Ngọc**: socket Linh Thạch/ngọc cho stat phụ (game đã có hệ Linh Thạch).

---

## 7. Nguồn trang bị (khép vòng kinh tế)
| Nguồn | Mô tả |
|---|---|
| **Rèn Đúc** (`daTao`) | Công thức = **Thỏi tier tương ứng** + liệu phụ (da/gỗ/lông...) → trang bị. **1 tier Thỏi = 1 tier gear** (Thỏi Sắt→gear Lv18 ... Thần Tinh Đĩnh→gear Lv100). Nối thẳng chuỗi Luyện Kim. |
| **Drop** | Quái/Boss/Bí Cảnh rơi trang bị theo vùng (thêm vào loot table). Boss-rare (`maToTam/cuuViTinh/hachCoLinh/hoPhuDauLinh`) = **mầm craft thần khí** (Cô Bản). |
| **Chợ / Tiệm** | Merchant bán gear cơ bản; Market P2P sau. |

→ Mỗi vùng = 1 tier liệu + 1 tier gear + drop riêng → bản đồ có ý nghĩa xuyên suốt.

---

## 8. Phẩm chất & dòng đặc biệt
- **7 bậc** (`QUALITY`, đã có): Phàm → Lương → Tinh → Tuyệt → Truyền Thế → Thần → Cô Bản. Art map theo bậc (vải thô = Phàm, thần khí rực sáng = Cô Bản). Bậc cao = nhiều stat + dễ có hệ + dễ vào bộ.
- **Quy tắc dòng đặc biệt** (kế thừa thiết kế cũ, hợp combat hiện tại):
  - **Hồi Sinh Lực/giây** (`regenPct`): gear thường, tỉ lệ thấp.
  - **Hồi Nội Lực/giây** (`nlRegen`): chỉ **Nhẫn / Ngọc Bội / Dây Chuyền**.
  - **Hút Sinh Lực / Hút Nội Lực** (hiếm): chỉ **Vũ Khí**.
  - **Bạo Kích / ST Bạo**: ưu tiên Vũ Khí / Găng / Nhẫn.

---

## 9. UI
- **Paper-doll** (đã có khung): nhân vật giữa, 8 chính bao quanh, 5 trang sức 1 hàng, Tọa Kỵ + Công Cụ tách. Slot trống = icon mờ; có đồ = ảnh art + viền màu phẩm chất.
- **Popup chi tiết** (mở rộng `itemModal` đã có): art lớn + tên (màu phẩm) + slot + **chỉ số** (đã có `statLabel`) + **hệ ngũ hành** (badge) + **+N cường hóa** + **bộ (x/y món)** + nút Trang Bị/Tháo/Cường Hóa.
- **So sánh** (hover/chọn): chênh lệch stat vs món đang mặc (±, xanh/đỏ).

---

## 10. Tích hợp hệ thống hiện có
- `gearStats` (stats.js): đã cộng `congKich/hoThe/neTranh/menhTrung/sinhLuc` từ `equipment` → **không đổi**, chỉ cần item có `equip.stats`.
- `deriveCombat` (votong.js): **thêm** vòng quét gear cho `eleBonus` (mục 4) + (nếu có) regen/nlRegen/lifesteal từ gear.
- `equipItem/unequipItem` (equip.js): giữ; cần thêm slot mới vào `EQUIP_SLOTS`.
- `itemModal` + `equipSlotLabel/statLabel` (main.js): đã có nền, mở rộng cho gear.
- **Vạn Vật Phổ**: bộ trang bị = một trục sưu tầm.
- **Cân bằng**: lvMul (mục 3) phối với rebalance `mk()` (xem `design_combat_balance.md`) — gear là cách người chơi bắt kịp đường cong địch.

---

## 11. Lộ trình build (làm dần, verify từng bước)
1. **Slot + data nền**: mở rộng `EQUIP_SLOTS` (8 chính + 5 trang sức + toaKy); `mkEquipStats(slot,lv,quality)`; tạo ~2-3 BỘ mẫu (dùng art có sẵn) đủ slot.
2. **Paper-doll + equip/unequip + stat vào combat** (gearStats đã chạy) → thấy gear đổi Chiến Lực.
3. **Ngũ Hành affinity** + hiển thị + cộng `eleBonus` trong deriveCombat.
4. **Popup chi tiết gear + so sánh**.
5. **Rèn Đúc từ Thỏi** (nguồn chính) — nối chuỗi Luyện Kim.
6. **Cường Hóa** (+0→+15, sink Hồn Thạch + Thỏi).
7. **Bộ Trang (set bonus)**.
8. **Tọa Kỵ** (Khinh Công + stat).
9. **Drop gear** từ boss/Bí Cảnh.

→ MVP = bước 1-4 (mặc được, đổi stat, có ngũ hành). Phần còn lại là depth.

---

## 12. Map art `eq_*` → slot (sơ bộ — rà chi tiết khi build)
| Slot | Tiền tố / ví dụ |
|---|---|
| Vũ Khí | `_kiem` (long_tuyen, thanh_phong, tien_thien), `_dao` (thien_ma, phi_hoa), `_thuong` (thiet_dau), `_cung` (bich_hai_trieu_sinh), `_chuy` (hon_nguyen), `_kich` (phuong_thien_hoa), `_phu` (khai_son), `_tien` (cuu_tiet_nhuyen) |
| Giáp / Áo | `_giap` (kim_lan_thanh, huyen_thiet_chien, han_giao_lan, nhuyen_toa, long_van), `_bao` (dao, cam, thanh_long), `_y` (thanh_bo) |
| Mũ | `_quan` (cuu_long, han_bang, lien_hoa_dao, thuy_truc, ngoc_kim, tien_thien), `_khoi` (liet_diem, bach_quy_da_hanh), `_mao` (ho_bi_chien, phuong_hoang), `_mien` (tu_vi_diem) |
| Đai | `_doi` (thai_cuc_tien, tu_kim_mang, kim_long, bach_ngoc, huyen_thiet_chien...) |
| Găng | `_thu` (kim_cuong_bat_hoai, huyet_ma, hoa_diem, hac_long_lan, bang_tam, ho_trao...) |
| Giày | `lang_ba_lay`, `vai_giay` |
| Phi Phong | `_bao/_phuc` (tien_phu, ma_phuc, tien_y, hanfu_bach, so_bao) |
| Dây Chuyền / Bội | `_boi` (phuong_hoang_niet_ban, cuu_u_hon_linh, long_phuong_song, hong_linh, bich_ngoc, ngoc) |
| Nhẫn | `_nhan` (bang_phach, hoang_long, luc_truc, tu_kim, hoa_tinh, bach_ngoc, hoa_long_chau, tu_vi_tinh, cuu_u_ma, hac_dieu_thach) |
| Hộ Phù / Ấn | `_phu` (hac_thiet_linh, thuy_tinh_linh, ho_menh), `phat_chau`, `dong_bai`, `thien_cuong_lenh`, `an_chien`, `day_thung_ho_than` |
| Tọa Kỵ | `_ma` (long, tuong_van, hoang_tong, thanh_tong), `_cau` (han_huyet_bao, dai_uyen_luong, thuy_lieu_phong), `xich_tho`, `phi_van_truy`, `tu_dien_truy_phong`, `o_van_dap_tuyet`, `chieu_da_ngoc_su_tu`, `thao_thuong_phi`, `dich_lu`, `mao_lu` |
