# THIẾT KẾ ĐỘNG PHỦ — Nhà riêng + trần treo máy + hub mini-game

> **TRẠNG THÁI: ĐÃ CODE + LIVE** (commit `f5ecf50`, 2026-07-10). Nguồn chân lý CODE = `src/engine/dongphu.js` (thuần) + `src/dongphu.js` (component) + view `.dp-root` trong `index.html`. Doc này đã đồng bộ với code LIVE: **rebalance liệu/giá/thời gian** + **hệ Độ Bền** (đảo §0.4 "không decay" cũ) + đổi tên nhãn + lore Hán-Việt cổ thư. Con số cân bằng vẫn DRAFT chờ user chơi tune; pacing §3 (tính cho liệu bản nháp cũ) đã lỗi thời, xem cảnh báo tại §3.

## 0. Quyết định khóa (user đã chốt)

1. Động Phủ = **nhà riêng của người chơi**, payoff cho nghề **Doanh Tạo** (sản phẩm nghề trước đây KHÔNG có chỗ tiêu — hệ này sửa đúng chỗ đó).
2. Nhà chính **6 bậc**, trần treo máy `idleCapMs` **8h nền → +1h/bậc → tối đa 14h** (bậc 1-6 = 9/10/11/12/13/14).
3. Xây/nâng = **nguyên liệu + Bạc + thời gian thi công CHẠY NỀN** (song song hoạt động thường, KHÔNG chiếm widget hoạt động, không xây-xong-ngay).
4. **Có Độ Bền + Bảo Trì** (ĐẢO quyết định "không decay" của bản nháp cũ — user chốt lại 2026-07-10): mọi công trình hao mòn 100%→0% trong 40 ngày; <80% mới sửa được; 0% = tắt chức năng + khóa truy cập. Chi tiết §4.
5. 3 công trình đặc biệt gắn mini-game: **Mộng Đài** (Đăng Tiên Mộng — đã live, KHÔNG re-gate, chỉ thêm chiều sâu) · **Trảm Yêu Đài** (Kỳ Trận Trảm Yêu — mockup xong, CHƯA tích hợp → "Sắp Khai Mở") · **Diễn Võ Trường** (autochess — tạm gác, "Chưa Khai Phá").
6. **0-power tuyệt đối**: tiền/vật liệu chảy MỘT CHIỀU VÀO công trình; mini-game không bao giờ trả sức mạnh về game chính.
7. Tách bạch **Tông Môn** (nhánh xã hội/đệ tử): không dùng chung state/tiền tệ/công trình.

---

## 1. Nhà chính — 6 bậc (số liệu = code LIVE)

Tên bậc: **Thảo Lư → Mộc Xá → Trạch Viện → Sơn Trang → Phủ Đệ → Động Phủ**.
Bậc 0 = **Bãi Đất Trống** (trạng thái first-touch, có art + CTA khởi công Thảo Lư).

| Bậc | Tên | Trần treo | Gate Doanh Tạo | Nguyên liệu (đậm = item dùng sẵn) | Bạc | Thi công nền |
|---|---|---|---|---|---|---|
| 1 | Thảo Lư | 9h | Lv 1 | **vanYeu**×400 · **datSet**×300 · **cat**×200 | 300.000 | 12 giờ |
| 2 | Mộc Xá | 10h | Lv 10 | **vanYeu**×1000 · **gach**×800 · **thietKhau**×200 | 600.000 | 24 giờ |
| 3 | Trạch Viện | 11h | Lv 18 | Thanh Ngõa×1200 · Lương Mộc×500 · **gach**×600 · **thietKhau**×300 | 1.100.000 | 36 giờ |
| 4 | Sơn Trang | 12h | Lv 24 | Thạch Chuyên×1500 · Thanh Ngõa×800 · Lương Mộc×500 · **gach**×800 · **thietKhau**×400 | 2.000.000 | 54 giờ |
| 5 | Phủ Đệ | 13h | Lv 30 | Hàn Ngọc Chuyên×1600 · Tinh Thạch Song×600 · Thạch Chuyên×1000 · Thanh Ngõa×800 · Lương Mộc×500 | 3.300.000 | 72 giờ |
| 6 | Động Phủ | 14h | Lv 38 | Kim Tất Trụ×1500 · Hàn Ngọc Chuyên×2500 · Thạch Chuyên×2500 · Tinh Thạch Song×1000 · Thanh Ngõa×2000 · **thietKhau**×1000 | 5.000.000 | 96 giờ |

- Trần treo = `houseCapH(lv) = 8 + min(6, lv)` → bậc 0 (bãi đất) vẫn hưởng 8h nền; bậc 1-6 = 9→14h.
- Thời gian thi công nền: 12/24/36/54/72/96h (min 12h, max 96h) — bậc đầu "treo qua đêm", bậc cuối "treo qua 4 đêm".
- Gate Lv bậc 5/6 = **30/38** (đã hạ từ 34/42 thời tính lại pacing).
- **REBALANCE (2026-07-10):** so với bản nháp thiết kế đầu, số lượng liệu Nhà Chính đã ×10, Bạc nâng thang 300k→5M, thời gian giãn 12→96h. Chủ đích: Động Phủ = **mục tiêu dài hơi toàn tài khoản kiểu IMMO house** (không phải sink vài ngày). Bottleneck thực = **cày đủ khối lượng liệu cao cấp** (xem cảnh báo pacing §3).
- **Gate chéo nghề khác (chủ đích):** input các sản phẩm cao cấp gate ngầm bằng nghề gather/refine (tên hiển thị code: **Luyện Kim** = daLuyen/refine, **Đốn Củi** = phatMoc/woodcutting): Tinh Thạch Song cần Luyện Kim 32 + Đốn Củi 32 · Hàn Ngọc Chuyên cần Luyện Kim 48 · Kim Tất Trụ cần **Đốn Củi 60 + Luyện Kim 60**. Nhà bậc 6 thực chất yêu cầu Doanh Tạo 38 + Đốn Củi 60 + Luyện Kim 60. Đòn bẩy hạ độ khó nếu thấy nặng: thay hongMoc→phongMoc, hoangKimDinh→tinhThachDinh, hoặc giảm số lượng liệu.
- Ghi chú: datSet/cat có bán ở Phường Thị → bậc 1-2 có shortcut nhẹ bằng Bạc, hợp lý. Bạc thang 300k→5M vẫn nhẹ so với thu nhập combat idle (~17K Bạc/giờ mid-game) — **gate thật là khối lượng liệu + XP nghề**, không phải Bạc.

## 2. Mở rộng nghề Doanh Tạo (đợt ship đầu: Lv12→38) — ĐÃ LIVE

6 action mới trong `src/data/skills.js` (nghề `doanhTao`, stat cộng = `lucDao`). Số liệu = code LIVE (khớp bảng dưới):

| Lv | ID | Tên (gloss) | Inputs | xp | time (s) | statXp | Phẩm | Giá bán |
|---|---|---|---|---|---|---|---|---|
| 12 | thanhNgoa | Thanh Ngõa (Glazed Tile) | datSet×4 + cat×2 | 240 | 100 | 3 | Tốt (luongPham) | 15 |
| 18 | luongMoc | Lương Mộc (Beam) | bachDuongMoc×3 + thietKhau×1 | 300 | 110 | 3 | Tốt (luongPham) | 40 |
| 24 | thachChuyen | Thạch Chuyên (Hewn Stone) | thachKhoi×4 + cat×2 | 370 | 120 | 4 | Hiếm (tinhPham) | 32 |
| 26 | tinhThachSong | Tinh Thạch Song (Crystal Lattice) | tinhThachDinh×2 + phongMoc×2 | 450 | 130 | 5 | Hiếm (tinhPham) | 120 |
| 30 | hanNgocChuyen | Hàn Ngọc Chuyên (Jade Brick) | hanThietDinh×1 + thachKhoi×3 | 530 | 140 | 5 | Cực Hiếm (tuyetPham) | 140 |
| 38 | kimTatTru | Kim Tất Trụ (Gilt Pillar) | hongMoc×3 + hoangKimDinh×1 | 640 | 150 | 6 | Cực Hiếm (tuyetPham) | 260 |

- Triết lý: action craft tiêu nguyên liệu đã tốn công farm → xp/s cao hơn gather cùng cấp (cùng logic nghề Luyện Kim).
- **4 sản phẩm Lv55-100 (Vân Văn Bình Phong / Tinh Quang Đăng / Long Văn Lương / Thiên Công Đống Lương) DỜI SANG ĐỢT SAU** — bán lỗ so với value input và chưa có sink ở nhà bậc 1-6 (dead content). Sẽ ship cùng sink thật (bậc 7 "Tiên Phủ" / trang trí Động Phủ / Thâm Mộng). Nghề vẫn lên Lv100 bằng spam action cao nhất. Lore 4 món giữ ở phụ lục §9.
- Lore 6 món đợt 1 (đã cắm trong `items.js`, tone Hán-Việt sắc gọn):
  - **Thanh Ngõa**: "Ngói nung men xanh biếc, mưa gió trăm năm chẳng phai. Mái nhà lợp nó, xa trông như một dải sóng ngọc."
  - **Lương Mộc**: "Xà bạch dương bào nhẵn, nẹp khớp sắt hai đầu. Đặt lên tường, cả gian nhà lập tức có xương sống."
  - **Thạch Chuyên**: "Đá vôi đẽo vuông thành sắc cạnh, nặng trịch một khối. Tường xây từ nó, phá thành mới mong lay nổi."
  - **Tinh Thạch Song**: "Song cửa ghép tinh thạch trong vắt, khung gỗ phong đỏ. Đêm xuống tự ánh lên, trong nhà chẳng cần thắp đèn."
  - **Hàn Ngọc Chuyên**: "Gạch ép từ hàn thiết và thạch khôi, mát lạnh quanh năm. Hè oi ngồi trong phòng, ngỡ như tựa lưng vào băng."
  - **Kim Tất Trụ**: "Cột hồng mộc sơn kim quang, đầu trụ bọc hoàng kim. Dựng giữa chính đường, khí phái áp cả một vùng."

## 3. Pacing

> ⚠️ **BẢNG SỐ DƯỚI ĐÂY ĐÃ LỖI THỜI — tính cho liệu bản nháp CŨ (trước rebalance ×10).** Sau khi liệu Nhà Chính ×10, bottleneck đã DỜI: nghề Doanh Tạo sẽ đạt gate Lv (1/10/18/24/30/38) **sớm hơn nhiều** so với lúc gom đủ khối lượng liệu cho bậc nhà tương ứng → giờ chơi bị chi phối bởi **cày thô khối lượng liệu cao cấp** chứ không phải "luyện chờ gate". Tổng thời gian bậc 6 hiện dài hơn hẳn ~3-4 tuần cũ (chủ đích "mục tiêu toàn tài khoản"). **Số pacing chính xác phải ĐO LẠI bằng harness với liệu LIVE** — chưa làm, mọi số dưới chỉ giữ để tham khảo PHƯƠNG PHÁP, KHÔNG phản ánh cân bằng hiện tại.

**Phương pháp (giữ để lần tune sau không lặp lỗi):** xp/s của một action craft phải tính **trọn chuỗi** = (xp craft + xp doanhTao của input) ÷ (time craft + time gather TOÀN BỘ input, đệ quy). Input thuộc nghề khác (thachKhoi=Đào Khoáng, thỏi=Luyện Kim…) cho 0 xp Doanh Tạo nhưng VẪN tốn giờ. Bản nháp đầu chia craft-only nên lạc quan ~2-2,5×.

<sub>Bảng cũ (liệu bản nháp, KHÔNG còn đúng sau ×10):</sub>

| Bậc | Giờ farm liệu | XP từ farm (tích lũy) | XP gate (55·L²) | Luyện thêm | Tổng bậc | Mục tiêu (cũ) |
|---|---|---|---|---|---|---|
| 1 | ~1,4h | ~1,3K | Lv1 (0) | 0 | ~1,4h | trong ngày |
| 2 | ~8h | ~12K | Lv10 (~15,7K) | ~2h | ~10h | 1-2 ngày |
| 3 | ~22h | ~74K | Lv18 (~98K) | ~7h | ~29h | 3-4 ngày |
| 4 | ~32h | ~186K | Lv24 (~238K) | ~10h | ~42h | 7-9 ngày |
| 5 | ~42h | ~380K | Lv30 (~471K) | ~15h | ~57h | 13-14 ngày |
| 6 | ~95h | ~820K | Lv38 (~967K) | ~25h | ~120h | 3-4 tuần |

**Đòn bẩy tune (khi đo lại):** gate Lv + xp action mới (nhịp) + số lượng liệu §1 (tỉ lệ "liệu nuôi cấp"). Muốn nhà "đắt" hơn → tăng số lượng liệu; muốn nhẹ hơn → hạ số lượng hoặc đổi input cao cấp sang thấp hơn.

---

## 4. Cơ chế xây nền, độ bền & state (nguồn chân lý: `engine/dongphu.js`)

### Schema `state.dongPhu` (LIVE)

```js
dongPhu: {
  house: 0,                      // bậc Nhà Chính 0..6 (0 = Bãi Đất Trống)
  buildings: {
    mongDai: 0,                  // 0..3
    tramYeuDai: 0,               // 0..3 (buildable=false tới khi ráp match-3)
    dienVoTruong: 0,             // autochess GÁC — luôn 0 (maxLv 0), giữ chỗ khỏi migration
  },
  build: null,                   // job DUY NHẤT đang chạy hoặc null:
                                 // { target:'house'|'mongDai'|'tramYeuDai', toLevel, startedAt, endsAt,
                                 //   paid:{ bac, mats:{...} } }   // biên lai — nguồn chân lý khi Hủy Xây
  dur: {},                       // ĐỘ BỀN: dur[key] = mốc thời gian ĐẦY 100% gần nhất (xây/nâng/sửa)
  log: [],                       // [{t,target,toLevel}] hoàn công, cap 20 (Nhật Ký "Sổ Công Trình")
  doneUnseen: false,             // có công trình vừa xong chưa xem (red-dot nav; clear khi mở view)
}
```

- **1 job tại 1 thời điểm** (nhà HOẶC công trình) — khớp triết lý "1 ô hoạt động", tạo lựa chọn có sức nặng, state phẳng. Không song song, không queue ở v1.
- Mốc thời gian **tuyệt đối** (`startedAt/endsAt = Date.now()`) — cùng họ `suyYeuUntil`, serialize được, offline-safe.
- **`paid` là biên lai**: trừ tài nguyên NGAY lúc khởi công; Hủy Xây hoàn theo biên lai chứ không tra bảng giá → đổi giá sau này không tạo exploit.

### Vòng đời job

- **`ensureDongPhu(state, now)`** — idempotent + vá save cũ: clamp house 0..6, buildings 0..maxLv, khởi tạo `dur/log/doneUnseen`. **Khởi tạo Độ Bền không phạt hồi tố:** công trình đã tồn tại mà thiếu mốc `dur[key]` → gán = `now` (coi như vừa đầy). Job mồ côi/hỏng (target lạ, toLevel ngoài khoảng, thiếu timestamp) → hoàn liệu theo `paid` rồi xóa job (fail-safe về phía người chơi).
- **`startBuild(state, target, now)`** — guard: `build == null` (chống double-spend) · nâng từng bậc +1 · house ≤ 6. Gate: nhà cần Doanh Tạo ≥ reqLevel; công trình phụ cần nhà ≥ reqHouse (Mộng Đài b1, Trảm Yêu Đài b2). Đủ Bạc + liệu → trừ atomic, ghi `paid`, set `endsAt = now + buildMs`.
- **`resolveDongPhu(state, now)`** — thuần idempotent, hoàn công khi `now ≥ endsAt`: nâng bậc bằng `Math.max` (gọi lặp/xung đột cloud không tụt bậc), **set `dur[target] = endsAt`** (độ bền 100% tính từ lúc hoàn công), đẩy Nhật Ký (cap 20), bật `doneUnseen`, xóa job. Trả `{done, target, toLevel}` để caller bắn toast/notif. Xây **KHÔNG chiếm `state.activity`**, **KHÔNG bị trần treo chặn** (timer theo giờ thực — treo 96h thì bậc 6 vẫn xong).
- **`cancelBuild(state)`** — Hủy Xây: hoàn **100% VẬT LIỆU** theo biên lai, **MẤT trắng Bạc** ("công thợ đã trả"; giữ sink + chống spam khởi công-hủy). Không hoàn theo tiến độ.

### Độ Bền & Bảo Trì (LIVE — đảo "không decay" cũ)

Hằng số (`engine/dongphu.js`): `DUR_DECAY_DAYS = 40` · `DUR_REPAIR_BELOW = 80` · `IDLE_BASE_H = 8`.

- **Hao mòn tuyến tính:** `durabilityPct = 100 − ((now − dur[key]) / 40 ngày) × 100`, clamp 0..100 → mất **2,5%/ngày**, 40 ngày về 0%. Theo giờ thực, offline-safe (chỉ đọc, không cần tick).
- **Sửa Chữa** mở khi độ bền **< 80%** (đạt sau ~8 ngày kể từ lúc đầy). `repairCost` = `ceil(liệu-xây-cấp-hiện-tại × (100−p)/100)` — **chỉ tốn VẬT LIỆU, TỨC THÌ, KHÔNG tốn Bạc**; `repairBuild` set `dur[key] = now` (về 100%). Bù theo % thiếu nên sửa sớm rẻ hơn sửa muộn.
- **0% = TẮT chức năng + KHÓA truy cập** (`isFunctional` = độ bền > 0):
  - **Nhà Chính 0%** → `dongPhuCapBonusH` trả 0 → trần treo về **8h nền** (mất toàn bộ bonus bậc nhà).
  - **Mộng Đài 0%** → `dtmBridgeWeekCap` trả **0** (KHÓA quy đổi assist — khác lv0=60) + mất +10% Mộng Ngân + đóng Thâm Mộng; `buildingUsable` false → **gate nav chặn vào Đăng Tiên Mộng**.
- Các hàm thuần: `durabilityPct` / `isFunctional` / `constructionExists` / `buildingUsable` / `repairCost` / `repairBuild` — mọi knob gate bằng `Date.now()`.

### Ca biên

| Ca | Xử lý |
|---|---|
| Chỉnh đồng hồ | Cùng mức lộ như MỌI hệ offline (tin `Date.now()`); tua lùi chỉ trì hoãn, không hỏng state. KHÔNG anti-cheat riêng (cloud save không chống cheat). |
| Xong khi offline | `endsAt` tuyệt đối → boot resolve TRƯỚC UI & TRƯỚC advance offline. |
| Lên bậc GIỮA khoảng offline | Không nội suy — resolve build trước → advance dùng trần MỚI cho cả khoảng (sai số ≤1h nghiêng về người chơi). |
| Save cũ | `dur[key]` thiếu → gán = now (không phạt hồi tố). `settings.idleCapHours` GIỮ nghĩa trần NỀN 8h; tổng tính LÚC ĐỌC → 0 migration, không double-count. |
| Đa thiết bị | Job + dur nằm trong state, đi theo bản save thắng xung đột (`_loadedLastSave` nguyên trạng). |

---

## 5. Tích hợp kỹ thuật (điểm móc LIVE)

1. **`idleCapMs(state)`** — `src/engine/activity.js:29`, điểm móc DUY NHẤT của trần treo:
```js
// engine/dongphu.js
export function dongPhuCapBonusH(state) {
  const h = (state.dongPhu && state.dongPhu.house) || 0;
  if (h < 1) return 0;
  if (!isFunctional(state, 'house', Date.now())) return 0;   // nhà 0% -> mất bonus, về nền
  return Math.min(6, h);
}
// activity.js
export function idleCapMs(state) {
  return ((state.settings?.idleCapHours || 8) + dongPhuCapBonusH(state)) * 3600 * 1000;
}
```
2. **Thứ tự boot (ĐÃ SỬA, main.js:144-146):** `ensureTongMon → ensureDangTien → ensureDongPhu(state) → resolveDongPhu(state, now) → simTongMon(state, now, idleCapMs(state)/3600000)`. Động Phủ hoàn công TRƯỚC advance offline & Tông Môn → cả khoảng vắng hưởng trần treo mới. Pets Săn Mồi cũng đọc qua `idleCapMs` → tự hưởng.
3. **Mộng Đài → knob assist DTM (chiều phụ thuộc DTM → dongphu):** `dangtienmong.js` import `dtmBridgeWeekCap` / `dtmMongNganMult` từ `engine/dongphu.js`:
   - `bridgeCap()` (dangtienmong.js:549) = `dtmBridgeWeekCap(state)` → nền 60; Mộng Đài b1/b2/b3 = 70/75/80; **0 nếu Mộng Đài hỏng (0%)**.
   - `dtmMongNganMult(state)` (dùng ở bankRun ~:525) = 1.10 khi Mộng Đài ≥ b2 và còn hiệu lực, else 1.0.
   - `dongPhuThamMongOpen(state)` = true khi Mộng Đài ≥ b3 và còn hiệu lực (flag hook Thâm Mộng).
   - **Hợp đồng cách ly DTM:** DTM chỉ GHI `state.dangTien`, được ĐỌC knob thuần từ dongphu; dongphu KHÔNG import gì từ DTM.
4. **View `dongPhu`:** trong `_ROUTE_VIEWS` + `isPlaceholderView`. `_applyView('dongPhu')` (main.js:361) gọi `resolveDongPhu` + clear `doneUnseen`. Vòng tick chính (main.js:~3466) gọi `resolveDongPhu` mỗi 5s → toast/notif type `'dongPhu'` khi hoàn công.
5. **Trảm Yêu Đài → cổng nav Kỳ Trận (khi ship match-3):** thêm view `'kyTran'` vào `_ROUTE_VIEWS` + `isPlaceholderView`; item nav nhóm Chiến Đấu gate theo `buildingUsable(state,'tramYeuDai')`; bật `buildable:true` cho `BUILDINGS.tramYeuDai`. Hiện `buildable:false` → card "Sắp Khai Mở", không nút xây.

### Hợp đồng cách ly (mirror Tông Môn/DTM)

1. Tiền + vật liệu chảy **một chiều vào**; Hủy Xây hoàn biên lai là hoàn tác, không phải nguồn thu.
2. Mini-game **không trả power ra ngoài**; kênh duy nhất ra main vẫn là cầu assist NB sẵn có của DTM — công trình chỉ đổi TRẦN, không thêm kênh mới.
3. Nhà chính ảnh hưởng ĐÚNG HAI THỨ: (i) trần treo qua `idleCapMs`; (ii) điều kiện `reqHouse`/`buildingUsable` dựng & vào công trình. KHÔNG chỉ số, KHÔNG buff combat, KHÔNG chạm `deriveCombat`/`gearBag`/Tứ Trụ.
4. `engine/dongphu.js` không import combat/stats/votong (chỉ `leveling.js`); mini-game chỉ import hàm thuần đọc-knob.
5. Không reset, không tua giờ bằng tiền. Độ Bền chỉ tiêu thêm VẬT LIỆU (0 power ra ngoài, chỉ là gold/liệu sink).
6. Động Phủ tách bạch Tông Môn: không chung state/shop/tiền tệ/công trình.

---

## 6. Ba công trình đặc biệt (số liệu = code LIVE)

`BUILDINGS[key].levels[i]` = chi phí TỚI bậc (i+1). Thi công công trình phụ: **12h / 24h / 48h**.

| Công trình | reqHouse | Bậc 1 | Bậc 2 | Bậc 3 |
|---|---|---|---|---|
| Mộng Đài | nhà b1 | gach×500 · vanYeu×500 · thietKhau×150 · 20.000 Bạc · 12h | gach×1000 · Thanh Ngõa×600 · Lương Mộc×400 · 100.000 · 24h | Thạch Chuyên×800 · Tinh Thạch Song×400 · Hàn Ngọc Chuyên×500 · 440.000 · 48h |
| Trảm Yêu Đài | nhà b2 | gach×550 · vanYeu×550 · thietKhau×160 · 22.000 · 12h | gach×1100 · Thanh Ngõa×660 · Lương Mộc×440 · 110.000 · 24h | Thạch Chuyên×880 · Tinh Thạch Song×440 · Hàn Ngọc Chuyên×550 · 440.000 · 48h |

*(Trảm Yêu Đài đã có `levels` cụ thể trong code nhưng `buildable:false` → chi phí trên chỉ kích hoạt khi ráp match-3.)*

### Mộng Đài (Đăng Tiên Mộng — ĐÃ LIVE, mở Lv12, KHÔNG re-gate; bậc 0 = nguyên trạng)

| Bậc | Hiệu ứng (cộng dồn) — số & câu khớp `eff[]` code; phần trong ngoặc là chú giải thiết kế (không có trong chuỗi hiển thị) |
|---|---|
| 1 | **Giới Hạn Quy Đổi Tuần: 60 → 70 Nguyên Bảo** |
| 2 | **+10% Mộng Ngân mỗi ván** (nội bộ hệ cách ly) · giới hạn → **75** |
| 3 | **Mở Thâm Mộng** (flag hook cho Trùng 4/tầng 21+/Ascension DTM — nội dung thiết kế sau) · giới hạn → **80** |

> Cap assist là kênh power DUY NHẤT ra main → chốt phương án bảo thủ 70/75/80. Nếu muốn hào phóng hơn: 80/100/120 (đổi mảng `[60,70,75,80]` trong `dtmBridgeWeekCap`).

### Trảm Yêu Đài (Kỳ Trận Trảm Yêu — `buildable:false`, "Sắp Khai Mở")

**Quy tắc release:** card ở trạng thái **"Sắp Khai Mở"** — KHÔNG có nút xây — cho tới khi match-3 tích hợp vào game. Tuyệt đối không để "xây được nhưng chưa dùng được". `note: 'Cần tích hợp Kỳ Trận Trảm Yêu'`.

| Bậc | Hiệu ứng (dự kiến — chuỗi `eff[]` trong code) |
|---|---|
| 1 | **Mở Kỳ Trận Trảm Yêu** (công tắc mở nav — match-3 chưa từng live nên gate mới hợp lệ, khác Mộng Đài) |
| 2 | **Mở chương gauntlet mới** (knob độ sâu — chốt khi ship match-3) |
| 3 | **Chế độ Nhật Trảm** (daily — chốt khi ship) |

**Du Tiền (tiền tệ Kỳ Trận):** giai đoạn đầu **CHỈ tiêu TRONG mini-game**. Nếu sau bắc ra ngoài: giới hạn CỨNG ở cosmetic — danh hiệu nguồn mini-game = **0 chỉ số TUYỆT ĐỐI** (chỉ glow), skin bàn cờ, tiểu cảnh sân Động Phủ. KHÔNG BAO GIỜ đổi Du Tiền → Bạc/Nguyên Bảo/vật liệu.

### Diễn Võ Trường (autochess "Quần Hùng Kỳ Trận" — TẠM GÁC)

Code: `reqHouse:99, maxLv:0, buildable:false, grey:true, badge:'Chưa Khai Phá'`. Card silhouette xám (`grayscale + opacity`), không glow/pip/giá/nút. Tease: *"Đất trống ngàn thước, chờ ngày quần hùng khai chiến."* Giữ chỗ trong schema (`buildings.dienVoTruong` luôn 0).

---

## 7. Giao diện view Động Phủ (LIVE = rail dọc ornate, UI-kit Dạ Ngọc)

- **Nav:** nhóm **"Nhân Vật"**, mục "Động Phủ" (icon `images/nav/dongphu.webp`). Red-dot khi `doneUnseen` (công trình vừa xong chưa xem).
- **Bố cục (chốt: rail DỌC, KHÔNG tab ngang):** grid ~92px + **rail dọc ornate sticky** (3 mục, plaque art `rail_nha/rail_ct/rail_so` + `tab_active` bọc mục đang chọn + tassel ghim đáy). `.dp-root` scoped, art UI-kit trong `images/dongphu/ui/*.webp`.
  - **① Nhà Chính** (`dpTab='nhaChinh'`): timeline 7 bậc (Bãi Đất Trống + 6 bậc, tự-co-vừa-khung) + panel info bậc đang xem — tiêu đề **"Cấp N: Tên"**, dòng **"Giới Hạn Treo Máy: Xh"**, lore cổ thư, khối chi phí (liệu tô MÀU theo phẩm chất, thứ thiếu tô đỏ) + CTA "Nâng Cấp" (disabled kèm lý do: thiếu Bạc/liệu/Doanh Tạo cấp N/đang thi công).
  - **② Công Trình Phụ** (`dpTab='congTrinh'`): selector 3 công trình + panel detail (art + type + tags + lore + các dòng `eff` đạt/chưa-đạt + chi phí + CTA hoặc badge "Sắp Khai Mở"/"Chưa Khai Phá" hoặc "Cần Nhà Chính bậc X").
  - **③ Sổ Công Trình = màn QUẢN LÝ** (`dpTab='so'`): 4 khu —
    1. **Đang Thi Công** (chỉ khi có job: tên + đếm ngược + bar + nút Hủy Xây).
    2. **Tổng Quan** — khung "F" vẽ bằng CSS (nền tối + viền vàng + kẻ đôi inset + 4 hoa văn góc SVG; **BỎ border-image vì cắt art méo góc — bài học: frame ornate phức tạp thì VẼ CSS an toàn hơn**) + 4 medallion art `ov_med_nha/gio/ct/sua` phát sáng (scale riêng 0.90/0.92/0.98/1.0 vì art fill lệch → đường kính hiện đều ~41.5px).
    3. **Độ Bền & Bảo Trì** — cards data-driven (`soDurList`): % + thanh màu (good/warn/bad/dead = jade/vàng/hồng/xám) + countdown tới 0% + liệu sửa tô màu phẩm chất + nút Sửa Chữa (chỉ khi <80%).
    4. **Nhật Ký Công Trình** — `dp.log` (12 mục gần nhất, ấn triện Hán 府/夢/劍/武 + "N phút/giờ/ngày trước").
- **Chip tiến độ toàn app:** gắn DƯỚI widget hoạt động ở sidebar (icon búa + tên job + đếm ngược + bar, click → navTo). KHÔNG chiếm ô activity. Mobile: lặp trong drawer, KHÔNG nhét header (gotcha tràn ngang).
- **Thông báo hoàn công:** toast + red-dot nav; vào view thì card vừa xong glow tĩnh (KHÔNG banner full-screen — user bác hiệu ứng to/động).
- **Style:** dark + jade/cyan, font Lora serif (NẠP THÊM weight 400;500 + italic vào `<head>` rồi mới `font-family:Lora` — né serif ra sans xấu là SAI), Hán-Việt ĐẦY ĐỦ, 1 dòng/hiệu ứng, icon SVG/art.

## 8. Lore (bản Hán-Việt cổ thư — port nguyên văn từ code, user tự viết & duyệt ở mockup)

**7 bậc Nhà Chính** (`HOUSE_TIERS[i].lore`):

| Bậc | Tên | Lore |
|---|---|---|
| 0 | Bãi Đất Trống | Hoang địa sơ khai, linh mạch vị tỉnh. Nhất thạch định cơ, tông môn tự thử khai thiên. |
| 1 | Thảo Lư | Thảo lư lâm phong, cô đăng chiếu dạ. Tuy vô hoa vũ, diệc khả tĩnh tâm dưỡng khí. |
| 2 | Mộc Xá | Mộc xá sơ thành, trà yên vị tán. Môn nhân an cư ư thử, trú tập võ, dạ luyện khí. |
| 3 | Trạch Viện | Thanh ngõa cao tường, viện môn thâm bế. Tông môn căn cơ tiệm ổn, khả thu đồ lập quy. |
| 4 | Sơn Trang | Sơn trang y lĩnh, lâu viện tương liên. Nhất phương khí vận tiệm tụ, thanh danh thủy động giang hồ. |
| 5 | Phủ Đệ | Phủ đệ nguy nhiên, trường đăng bất diệt. Tân khách quy phụ, môn hạ đệ tử nhật thịnh. |
| 6 | Động Phủ | Động thiên khai cảnh, linh khí thành vân. Chân tu ẩn ư kỳ nội, đạo thống trường tồn bất diệt. |

**3 công trình phụ** (`BUILDINGS[key].lore`):

- **Mộng Đài:** "U mộng nhập đài, hương yên dẫn duyên. Môn nhân ngưng thần nhập cảnh, tham huyền ngộ đạo, linh cơ tự hiện."
- **Trảm Yêu Đài:** "Cửu cung bố trận, pháp kiếm trấn đàn. Phù hỏa nhất khởi, yêu vụ tận tán, tà khí bất xâm sơn môn."
- **Diễn Võ Trường:** "Diễn võ trường khai, quần hùng tề tụ. Đài cao kỳ liệt, thắng phụ nhất chưởng chi gian." *(tease card: "Đất trống ngàn thước, chờ ngày quần hùng khai chiến.")*

### Art (`images/dongphu/`) — đã đủ (user gen)

Art cảnh: `nha_0.webp`..`nha_6.webp` (7 bậc) + `mongdai.webp` + `tramyeu.webp` + `dienvo.webp` + `images/nav/dongphu.webp`.
UI-kit (`images/dongphu/ui/`): `ov_frame` · 4 medallion `ov_med_nha/gio/ct/sua` · 3 rail plaque `rail_nha/rail_ct/rail_so` + `tab_active` · `tassel` · liệu cao cấp. *(Lưu ý: `ov_frame` cuối cùng vẽ khung bằng CSS thay border-image — xem §7 khu Tổng Quan.)*

## 9. Phụ lục — 4 sản phẩm danh vọng Lv55-100 (DỜI đợt sau, lore giữ sẵn)

| Lv | Tên | Inputs (dự kiến) | Lore |
|---|---|---|---|
| 55 | Vân Văn Bình Phong | vanMauDinh×1 + phuVanMoc×2 | "Bình phong khảm vân mẫu, vân mây trôi thật trong lớp đá. Ngồi sau nó luận sự, lòng tự nhiên tĩnh lại." |
| 70 | Tinh Quang Đăng | vanThietDinh×1 + tinhHoaMoc×2 | "Đèn lồng lõi vẫn thiết, chao gỗ tinh hoa. Không dầu không lửa, đêm đêm tự tỏa ánh sao." |
| 85 | Long Văn Lương | tramHaiMoc×3 + sanHoDinh×1 | "Xà trầm hải chạm rồng cuộn, mắt rồng khảm san hô. Gác lên nóc phủ, tương truyền trấn được tà khí." |
| 100 | Thiên Công Đống Lương | thanDanMoc×2 + thanTinhDinh×1 | "Rường cột đẽo từ thần đàn mộc, gắn lõi thần tinh. Nhà dựng bằng nó, ngàn năm chẳng nghiêng — xứng danh thiên công." |

Điều kiện ship lại: có sink thật (bậc 7 "Tiên Phủ" / trang trí Động Phủ / Thâm Mộng) + sửa giá bán ≥1,25× tổng value input.

## 10. Trạng thái & việc còn lại

**ĐÃ CODE + LIVE** (commit `f5ecf50`, push origin/main = repo Pages):
1. `engine/dongphu.js` (schema + ensure + resolve + startBuild/cancel + độ bền/sửa chữa + knob thuần) ✅
2. `idleCapMs` + boot order (ensureDongPhu → resolveDongPhu → simTongMon) ✅
3. View rail dọc ornate + Sổ Công Trình = màn Quản Lý ✅
4. Mộng Đài knob (3 read-site DTM → hàm thuần) ✅
5. 6 items + 6 action Doanh Tạo Lv12-38 ✅
6. Hệ Độ Bền + Sửa Chữa + rebalance liệu/giá/thời gian ✅
7. Art 10 cảnh + UI-kit + medallion + rail plaque ✅
8. **Cách ly 0-power KEPT** (verify DOM: idle 8↔14h, DTM cap 60/70/75/80↔0 khi hỏng, không chạm combat/gear/Tứ Trụ) ✅

**Còn lại:**
- **Trảm Yêu Đài kích hoạt** = ráp Kỳ Trận Trảm Yêu (match-3) vào game thật rồi bật `buildable:true` + cổng nav `buildingUsable`. Mockup đã review sạch (xem `THIET_KE_*` / memory `design_match3_tieudao`).
- **Tune cân bằng** liệu/giá/thời gian/tốc hao độ bền + **đo lại pacing §3 bằng harness** (bảng cũ đã lỗi thời sau rebalance ×10).
- `ov_frame` slice có thể cần tune nếu user soi kỹ (đã chuyển sang vẽ CSS nên rủi ro thấp).
