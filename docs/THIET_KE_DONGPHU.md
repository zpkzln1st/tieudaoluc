# THIẾT KẾ ĐỘNG PHỦ — Nhà riêng + trần treo máy + hub mini-game

> **TRẠNG THÁI: DRAFT CHỜ USER CHỐT — CHƯA CODE.** Soạn 2026-07-09 qua workflow 3 track thiết kế + 1 critic phản biện, đã hòa giải mâu thuẫn giữa các track. Mọi con số là DRAFT chờ tune.

## 0. Quyết định khóa (user đã chốt)

1. Động Phủ = **nhà riêng của người chơi**, payoff cho nghề **Doanh Tạo** (sản phẩm nghề hiện KHÔNG có chỗ tiêu — hệ này sửa đúng chỗ đó).
2. Nhà chính **6 bậc**, trần treo máy `idleCapHours` **8h nền → +1h/bậc → tối đa 14h** (9/10/11/12/13/14).
3. Xây/nâng = **nguyên liệu + Bạc + thời gian thi công CHẠY NỀN** (song song hoạt động thường, KHÔNG chiếm widget hoạt động, không xây-xong-ngay).
4. **Không decay / không bảo trì.**
5. 3 công trình đặc biệt gắn mini-game: **Mộng Đài** (Đăng Tiên Mộng — đã live, KHÔNG re-gate, chỉ thêm chiều sâu) · **Trảm Yêu Đài** (Kỳ Trận Trảm Yêu — mockup xong, chưa tích hợp) · **Diễn Võ Trường** (autochess — tạm gác, card khóa).
6. **0-power tuyệt đối**: tiền/vật liệu chảy MỘT CHIỀU VÀO công trình; mini-game không bao giờ trả sức mạnh về game chính.
7. Tách bạch **Tông Môn** (nhánh xã hội/đệ tử): không dùng chung state/tiền tệ/công trình.

---

## 1. Nhà chính — 6 bậc

Tên bậc: **Thảo Lư → Mộc Xá → Trạch Viện → Sơn Trang → Phủ Đệ → Động Phủ**.
Bậc 0 = **bãi đất trống** (trạng thái first-touch, có art + CTA "Khởi Công Thảo Lư").

| Bậc | Tên | Trần treo | Gate Doanh Tạo | Nguyên liệu (đậm = item ĐÃ có) | Bạc | Thi công nền |
|---|---|---|---|---|---|---|
| 1 | Thảo Lư | 9h | Lv 1 | **vanYeu**×40 · **datSet**×30 · **cat**×20 | 500 | 30 phút |
| 2 | Mộc Xá | 10h | Lv 10 | **vanYeu**×100 · **gach**×80 · **thietKhau**×20 | 2.000 | 2 giờ |
| 3 | Trạch Viện | 11h | Lv 18 | Thanh Ngõa×120 · Lương Mộc×50 · **gach**×60 · **thietKhau**×30 | 8.000 | 6 giờ |
| 4 | Sơn Trang | 12h | Lv 24 | Thạch Chuyên×150 · Thanh Ngõa×80 · Lương Mộc×50 · **gach**×80 · **thietKhau**×40 | 30.000 | 12 giờ |
| 5 | Phủ Đệ | 13h | Lv 30 | Hàn Ngọc Chuyên×160 · Tinh Thạch Song×60 · Thạch Chuyên×100 · Thanh Ngõa×80 · Lương Mộc×50 | 100.000 | 24 giờ |
| 6 | Động Phủ | 14h | Lv 38 | Kim Tất Trụ×150 · Hàn Ngọc Chuyên×250 · Thạch Chuyên×250 · Tinh Thạch Song×100 · Thanh Ngõa×200 · **thietKhau**×100 | 300.000 | 48 giờ |

- Thời gian thi công (Track 2 sở hữu): 0,5h · 2h · 6h · 12h · 24h · 48h — bậc đầu xong trong 1 phiên chơi, bậc cuối "treo qua 2 đêm".
- Gate Lv bậc 5/6 đã HẠ từ 34/42 → **30/38** (kết quả tính lại pacing trọn chuỗi — xem §3).
- **Số lượng liệu theo nguyên tắc "LIỆU NUÔI CẤP" (user yêu cầu tăng, 2026-07-09):** số lượng được cỡ sao cho chính việc craft liệu xây nhà tự sinh ~66-90% XP tới gate bậc kế — không còn pha "luyện chay" craft đồ thừa ~170h như bản nháp đầu. Tổng thời gian bậc 6 GIỮ ~3-4 tuần, nhưng toàn bộ giờ đổ vào căn nhà.
- **Gate chéo nghề khác (chủ đích — nhà = mục tiêu toàn tài khoản, kiểu IMMO house):** input các sản phẩm cao cấp gate bằng nghề gather/refine: Tinh Thạch Song cần Dã Luyện 32 + Phạt Mộc 32 · Hàn Ngọc Chuyên cần Dã Luyện 48 · Kim Tất Trụ cần **Phạt Mộc 60 + Dã Luyện 60**. Nhà bậc 6 thực chất yêu cầu Doanh Tạo 38 + Phạt Mộc 60 + Dã Luyện 60. Pacing §3 giả định nghề gather đồng hành; nếu user thấy nặng thì hạ input (đòn bẩy: thay hongMoc→phongMoc, hoangKimDinh→tinhThachDinh).
- Ghi chú: datSet/cat có bán ở Phường Thị (SHOP_MAT) → bậc 1-2 có shortcut nhẹ bằng Bạc, hợp lý.
- Ghi chú Bạc: thang 500→300K là "thuế giấy" — thu nhập combat idle (~17K Bạc/giờ mid-game) phủ nhẹ 300K trong 1-2 ngày; **gate thật là XP nghề**. Nếu muốn Bạc có sức nặng thì neo chi phí bậc 5-6 theo "X ngày thu nhập combat idle" đo bằng harness (đòn bẩy tune, không chặn ship).

## 2. Mở rộng nghề Doanh Tạo (đợt ship đầu: Lv12→38)

Hiện trạng: 5 action, kịch trần Lv10. **Đợt 1 thêm 6 action** (đủ nuôi nhà bậc 3-6):

| Lv | ID | Tên (gloss) | Inputs | xp | time (s) | statXp | Phẩm | Giá bán |
|---|---|---|---|---|---|---|---|---|
| 12 | thanhNgoa | Thanh Ngõa (Ngói Lưu Ly Xanh) | datSet×4 + cat×2 | 240 | 100 | 3 | Tốt | 15 |
| 18 | luongMoc | Lương Mộc (Xà Gỗ) | bachDuongMoc×3 + thietKhau×1 | 300 | 110 | 3 | Tốt | 40 |
| 24 | thachChuyen | Thạch Chuyên (Đá Tảng Đẽo) | thachKhoi×4 + cat×2 | 370 | 120 | 4 | Hiếm | 32 |
| 26 | tinhThachSong | Tinh Thạch Song (Song Cửa Tinh Thạch) | tinhThachDinh×2 + phongMoc×2 | 450 | 130 | 5 | Hiếm | 120 |
| 30 | hanNgocChuyen | Hàn Ngọc Chuyên (Gạch Hàn Ngọc) | hanThietDinh×1 + thachKhoi×3 | 530 | 140 | 5 | Cực Hiếm | 140 |
| 38 | kimTatTru | Kim Tất Trụ (Cột Sơn Kim) | hongMoc×3 + hoangKimDinh×1 | 640 | 150 | 6 | Cực Hiếm | 260 |

- **XP action mới đã nhân ~×2** so với bản nháp đầu (fix pacing của critic — xem §3). Triết lý: action craft tiêu nguyên liệu đã tốn công farm → xp/s cao hơn gather cùng cấp (cùng logic Dã Luyện).
- **4 sản phẩm Lv55-100 (Vân Văn Bình Phong / Tinh Quang Đăng / Long Văn Lương / Thiên Công Đống Lương) DỜI SANG ĐỢT SAU** — critic chứng minh chúng bán LỖ so với giá trị input và không có sink nào ở nhà bậc 1-6 (dead content). Sẽ ship cùng sink thật của chúng (bậc 7 "Tiên Phủ" / trang trí Động Phủ / Thâm Mộng). Nghề vẫn lên Lv100 bằng spam action cao nhất (như các nghề gather hiện tại). Lore 4 món này đã soạn xong, giữ trong phụ lục §9.
- Lore 6 món đợt 1 (tone Hán-Việt sắc gọn):
  - **Thanh Ngõa**: "Ngói nung men xanh biếc, mưa gió trăm năm chẳng phai. Mái nhà lợp nó, xa trông như một dải sóng ngọc."
  - **Lương Mộc**: "Xà bạch dương bào nhẵn, nẹp khớp sắt hai đầu. Đặt lên tường, cả gian nhà lập tức có xương sống."
  - **Thạch Chuyên**: "Đá vôi đẽo vuông thành sắc cạnh, nặng trịch một khối. Tường xây từ nó, phá thành mới mong lay nổi."
  - **Tinh Thạch Song**: "Song cửa ghép tinh thạch trong vắt, khung gỗ phong đỏ. Đêm xuống tự ánh lên, trong nhà chẳng cần thắp đèn."
  - **Hàn Ngọc Chuyên**: "Gạch ép từ hàn thiết và thạch khôi, mát lạnh quanh năm. Hè oi ngồi trong phòng, ngỡ như tựa lưng vào băng."
  - **Kim Tất Trụ**: "Cột hồng mộc sơn kim quang, đầu trụ bọc hoàng kim. Dựng giữa chính đường, khí phái áp cả một vùng."

## 3. Pacing (tính lại bằng công thức TRỌN CHUỖI)

> **Phương pháp (ghi lại để lần tune sau không lặp lỗi):** xp/s của một action craft phải tính **trọn chuỗi** = (xp craft + xp doanhTao của input) ÷ (time craft + time gather TOÀN BỘ input, đệ quy). Input thuộc nghề khác (thachKhoi=Thải Khoáng, thỏi=Dã Luyện…) cho 0 xp Doanh Tạo nhưng VẪN tốn giờ. Bản nháp đầu chia craft-only nên lạc quan ~2-2,5×.

Với xp ×2 + gate 30/38, xp/s trọn chuỗi ≈ Thanh Ngõa 0,95 · Lương Mộc 0,88 · Thạch Chuyên 1,39 · Tinh Thạch Song 1,19 · Hàn Ngọc Chuyên 1,64 · Kim Tất Trụ 1,53. Số lượng liệu §1 đã theo "liệu nuôi cấp" (craft liệu nhà tự sinh phần lớn XP):

| Bậc | Giờ farm liệu | XP từ farm (tích lũy) | XP gate (55·L²) | Luyện thêm | Tổng bậc | Nhịp (idle 9-13h/ngày) | Mục tiêu |
|---|---|---|---|---|---|---|---|
| 1 | ~1,4h | ~1,3K | Lv1 (0) | 0 | ~1,4h | trong ngày | ✓ |
| 2 | ~8h | ~12K | Lv10 (~15,7K) | ~2h | ~10h | 1-2 ngày | ✓ |
| 3 | ~22h | ~74K | Lv18 (~98K) | ~7h | ~29h | 3-4 ngày | ✓ |
| 4 | ~32h | ~186K | Lv24 (~238K) | ~10h | ~42h | tích lũy 7-9 ngày | ✓ |
| 5 | ~42h | ~380K | Lv30 (~471K) | ~15h | ~57h | tích lũy 13-14 ngày | ✓ |
| 6 | ~95h | ~820K | Lv38 (~967K) | ~25h | ~120h | tích lũy 23-27 ngày | 3-4 tuần ✓ |

Bộ đệm rút ngắn: Linh Thạch exp/eff · trần treo tự nới mỗi bậc · liệu thừa từ "luyện thêm" bank sẵn cho bậc sau. **Đòn bẩy tune:** gate Lv + xp action mới (nhịp) và số lượng liệu (tỉ lệ "liệu nuôi cấp" — muốn nhà "đắt" hơn nữa thì tăng số lượng, gate cấp tự khắc theo).

---

## 4. Cơ chế xây nền & state (Track 2 sở hữu)

### Schema `state.dongPhu`

```js
dongPhu: {
  house: 0,                      // bậc Nhà Chính 0..6 (0 = bãi đất trống)
  buildings: {
    mongDai: 0,                  // 0..3
    tramYeuDai: 0,               // 0..3
    dienVoTruong: 0,             // autochess GÁC — luôn 0, giữ chỗ sẵn khỏi migration sau
  },
  build: null,                   // job DUY NHẤT đang chạy hoặc null:
                                 // { target:'house'|'mongDai'|'tramYeuDai', toLevel, startedAt, endsAt,
                                 //   paid:{ bac, mats:{...} } }   // biên lai — nguồn chân lý khi Hủy Xây
  log: [],                       // [{t,target,toLevel}] hoàn công, cap 20 ("Sổ Công Trình")
}
```

- **1 job tại 1 thời điểm** (nhà HOẶC công trình) — khớp triết lý "1 ô hoạt động", tạo lựa chọn có sức nặng, state phẳng, giãn nhịp sink. Không song song, không queue ở v1 (thêm `queue:[]` sau vẫn thuận).
- Mốc thời gian **tuyệt đối** (`startedAt/endsAt` = `Date.now()`) — cùng họ `suyYeuUntil`, serialize được, offline-safe.
- **`paid` là biên lai**: trừ tài nguyên NGAY lúc khởi công; Hủy Xây hoàn theo biên lai chứ không tra bảng giá → đổi giá sau này không tạo exploit.

### Resolve — hàm thuần idempotent

```js
// engine/dongphu.js — thuần (state, now), không import UI/combat
export function resolveDongPhu(state, now) {
  const dp = state.dongPhu; if (!dp || !dp.build) return null;
  const b = dp.build;
  if (now < b.endsAt) return null;              // đồng hồ lùi → vô hại
  if (b.target === 'house') dp.house = Math.max(dp.house, b.toLevel);
  else dp.buildings[b.target] = Math.max(dp.buildings[b.target] || 0, b.toLevel);
  dp.log.unshift({ t: b.endsAt, target: b.target, toLevel: b.toLevel });
  if (dp.log.length > 20) dp.log.length = 20;
  dp.build = null;
  return { done: true, target: b.target, toLevel: b.toLevel };  // caller bắn toast
}
```

- Xây **KHÔNG chiếm `state.activity`**, **KHÔNG bị trần treo chặn** (timer-1-phát theo giờ thực — treo 48h thì nhà bậc 6 vẫn xong).
- Idempotent + `Math.max` → gọi lặp/xung đột cloud không tụt bậc.

### Guard khởi công (`startBuild`)

- `build == null` (chống double-spend) · nâng từng bậc +1 · `house ≤ 6`.
- Công trình đặc biệt: yêu cầu **nhà bậc tối thiểu** — Mộng Đài cần nhà **bậc 1**, Trảm Yêu Đài cần nhà **bậc 2** (scheme Track 2 — giữ match-3 "vừa túi Lv15-20").
- Đủ Bạc + liệu → trừ atomic, ghi `paid`.

### Hủy Xây — hoàn 100% VẬT LIỆU, MẤT Bạc

- Vật liệu là thành quả cày nghề → hoàn đủ theo biên lai. Bạc = "công thợ đã trả" → mất trắng (giữ sink + chống spam khởi công-hủy). Không hoàn theo tiến độ, hủy là hủy sạch.

### Ca biên

| Ca | Xử lý |
|---|---|
| Chỉnh đồng hồ | Cùng mức lộ như MỌI hệ offline hiện có (tin `Date.now()`); tua lùi chỉ trì hoãn, không hỏng state. KHÔNG thêm anti-cheat riêng (stance đã chốt: cloud save không chống cheat). |
| Xong khi offline | `endsAt` tuyệt đối → boot resolve TRƯỚC UI + TRƯỚC advance offline. |
| Lên bậc GIỮA khoảng offline | Không nội suy — resolve build trước → advance dùng trần MỚI cho cả khoảng (sai số ≤1h nghiêng về người chơi, chấp nhận). |
| Save cũ | `settings.idleCapHours` GIỮ nghĩa = trần NỀN 8h; tổng = nền + bonus tính LÚC ĐỌC → save cũ 0 migration, không double-count. |
| Đa thiết bị | Job nằm trong state, đi theo bản save thắng xung đột (`_loadedLastSave` nguyên trạng, không nhánh riêng). |
| Job mồ côi (save hỏng) | `ensureDongPhu` validate target/toLevel; vô lệ → hoàn liệu theo `paid`, xóa job (fail-safe về phía người chơi). |

---

## 5. Tích hợp kỹ thuật (điểm móc chính xác)

1. **`idleCapMs(state)`** — `src/engine/activity.js:28`, điểm móc DUY NHẤT của trần treo:
```js
export function dongPhuCapBonusH(state) { return Math.min(6, state.dongPhu?.house || 0); }
// activity.js:
export function idleCapMs(state) {
  return ((state.settings?.idleCapHours || 8) + dongPhuCapBonusH(state)) * 3600 * 1000;
}
```
2. **Thứ tự boot (QUAN TRỌNG — critic bắt):** `ensureDongPhu(state)` → `resolveDongPhu(state, now)` → **RỒI MỚI** `simTongMon(...)` (main.js:141 hiện truyền `idleCapHours` thô → đổi sang `idleCapMs(state)/3600000` để Tông Môn cũng hưởng nhà). Pets Săn Mồi đã đọc qua `idleCapMs` → tự hưởng.
3. **Mộng Đài → cap assist DTM:** `DTM_BRIDGE_WEEKCAP=60` là const đọc ở **3 chỗ** (dangtienmong.js ~547/549/550 — bridgeCap/bridgeRemaining/bridgeMaxNow) → thay cả 3 bằng hàm thuần `dtmBridgeWeekCap(state)` export từ `engine/dongphu.js`. Chiều phụ thuộc: **DTM đọc knob từ dongphu** — dongphu không import gì từ DTM. **Cập nhật hợp đồng cách ly DTM:** "chỉ GHI `state.dangTien`, được ĐỌC knob thuần từ dongphu".
4. **Trảm Yêu Đài → cổng nav Kỳ Trận** (khi ship match-3): thêm `'kyTran'` vào `_ROUTE_VIEWS` + `isPlaceholderView`; item nav nhóm Chiến Đấu khóa kèm "Cần Trảm Yêu Đài (Động Phủ)" khi bậc <1; `navTo` guard cùng điều kiện.
5. **View `dongPhu`**: vào `_ROUTE_VIEWS` + `isPlaceholderView`; mỗi tick chính gọi `resolveDongPhu` (rẻ, return sớm).
6. Card Mộng Đài muốn hiện "Cap tuần này: X/70" → cần export helper `_weekId` của DTM thành hàm thuần dùng chung (hoặc chỉ hiện cap tĩnh, bỏ số đã dùng — đơn giản hơn).

### Hợp đồng cách ly (mirror Tông Môn/DTM)

1. Tiền + vật liệu chảy **một chiều vào**; Hủy Xây hoàn biên lai là hoàn tác, không phải nguồn thu.
2. Mini-game **không trả power ra ngoài**; kênh duy nhất ra main vẫn là cầu assist NB sẵn có của DTM — công trình chỉ đổi TRẦN, không thêm kênh mới.
3. Nhà chính ảnh hưởng ĐÚNG HAI THỨ: (i) trần treo qua `idleCapMs`; (ii) điều kiện `reqHouse` dựng công trình. KHÔNG chỉ số, KHÔNG buff combat, KHÔNG chạm deriveCombat/gearBag.
4. `engine/dongphu.js` không import combat/stats/votong; mini-game chỉ import hàm thuần đọc-knob.
5. Không decay, không reset, không tua giờ bằng tiền (nếu sau này muốn "thúc công" bằng Nguyên Bảo = quyết định riêng, ngoài hợp đồng này).
6. Động Phủ tách bạch Tông Môn: không chung state/shop/tiền tệ/công trình.

---

## 6. Ba công trình đặc biệt (hiệu ứng — Track 3 sở hữu; cap assist theo phương án BẢO THỦ của critic)

Chi phí (rẻ hơn rõ bậc nhà cùng số — đầu tư nhánh phụ; thi công 4h/12h/24h):

| Công trình | Bậc 1 | Bậc 2 | Bậc 3 |
|---|---|---|---|
| Mộng Đài (cần nhà b1) | gach×50 · vanYeu×50 · thietKhau×15 · 2.000 Bạc | gach×100 · Thanh Ngõa×60 · Lương Mộc×40 · 10.000 | Thạch Chuyên×80 · Tinh Thạch Song×40 · Hàn Ngọc Chuyên×50 · 40.000 |
| Trảm Yêu Đài (cần nhà b2) | tương tự Mộng Đài ±10% (DRAFT) | — | — |

### Mộng Đài (Đăng Tiên Mộng — ĐÃ LIVE, mở Lv12, KHÔNG re-gate; bậc 0 = nguyên trạng)

| Bậc | Tên | Hiệu ứng (cộng dồn) |
|---|---|---|
| 1 | Mộng Đàn | Cap assist tuần 60 → **70** Nguyên Bảo |
| 2 | Mộng Các | **+10% Mộng Ngân khi kết ván** (nội bộ hệ cách ly) + cap → **75** |
| 3 | Mộng Cung | **Mở cổng "Thâm Mộng"** (flag hook cho Trùng 4/tầng 21+/Ascension DTM — nội dung thiết kế sau) + cap → **80** |

> Phương án cap thay thế (nếu user muốn hào phóng hơn): 80/100/120 (+20/bậc). Mặc định trình phương án bảo thủ 70/75/80 vì cap assist là kênh power duy nhất ra main — chỗ user hay siết nhất.

### Trảm Yêu Đài (Kỳ Trận Trảm Yêu — CHƯA tích hợp)

**Quy tắc release (bịt lỗ critic bắt): card ở trạng thái "Sắp Khai Mở" — KHÔNG có nút xây — cho tới khi match-3 tích hợp vào game.** Tuyệt đối không để trạng thái "xây được nhưng chưa dùng được".

| Bậc | Tên | Hiệu ứng |
|---|---|---|
| 1 | Trảm Yêu Đàn | **Mở nav "Kỳ Trận Trảm Yêu"** (đây là công tắc mở — match-3 chưa từng live nên gate mới là hợp lệ, khác Mộng Đài) |
| 2-3 | Trảm Yêu Các / Điện | **Knob độ sâu — CHỐT KHI SHIP match-3** (ý tưởng: chương gauntlet mới / chế độ ngày; KHÔNG thiết kế kinh tế chi tiết cho mini-game chưa tích hợp — critic gọi đây là scope bloat) |

**Du Tiền (tiền tệ Kỳ Trận):** giai đoạn đầu **CHỈ tiêu TRONG mini-game** (shop nội bộ: mở skill/tâm pháp pool P2). Nếu sau này bắc ra ngoài: giới hạn CỨNG ở cosmetic — danh hiệu nguồn mini-game = **0 chỉ số TUYỆT ĐỐI** (chỉ glow; critic bắt vế "hoặc mức lệ tối thiểu" là rò rỉ 0-power — ĐÃ XÓA), skin bàn cờ, tiểu cảnh sân Động Phủ. KHÔNG BAO GIỜ đổi Du Tiền → Bạc/Nguyên Bảo/vật liệu.

### Diễn Võ Trường (autochess — TẠM GÁC)

Card placeholder thuần: art silhouette (đài + cờ xí, jade mờ trên nền đen), `grayscale + opacity .55`, KHÔNG glow, badge "Chưa Khai Phá", không pip/giá/nút. Click → tooltip "Khu đất này còn chờ chủ nhân tương lai." Không field state (đã giữ chỗ trong schema).

---

## 7. Giao diện view Động Phủ

- **Nav:** nhóm **"Nhân Vật"**, mục "Động Phủ" (nhà riêng = "của tôi"; Tông Môn xã hội nằm chỗ khác). Icon art `images/nav/dongphu.webp`. Red-dot khi có công trình vừa xong chưa xem.
- **Bố cục:** strip tiến độ xây (chỉ hiện khi có job) → **hero card Nhà Chính** full-width (art bậc | tên bậc + dòng to nhất **"Trần Nhàn Rỗi: Xh"** + 6 pip + preview bậc kế + khối chi phí tô đỏ thứ thiếu + nút NÂNG CẤP disabled-kèm-lý-do) → grid 3 card công trình (art + 3 pip + các dòng hiệu ứng: bậc đạt chữ jade sáng, chưa đạt slate mờ + khóa; CTA hoặc "Cần Nhà Chính Bậc X").
- **Bậc 0 first-touch (critic bắt):** art bãi đất trống/nền móng + lore intro + CTA "Khởi Công Thảo Lư" — khoảnh khắc bán cả hệ thống, phải mock riêng.
- **Chip tiến độ toàn app:** gắn DƯỚI widget hoạt động ở sidebar (icon SVG búa + "Mộng Các · 3g 12p" + bar 2px, click → navTo). KHÔNG chiếm ô activity — nhấn mạnh xây chạy song song. Mobile: lặp trong drawer, KHÔNG nhét header (gotcha tràn ngang).
- **Thông báo hoàn công:** toast + red-dot nav; vào view thì card vừa xong glow tĩnh sáng dần 1 lần. ~~Banner Phi Cáp full-screen khi nâng nhà~~ — **tùy chọn chờ user duyệt riêng** (user từng bác hiệu ứng to/động; mặc định toast + glow tĩnh).
- **Style:** dark + jade/cyan, card ink3 viền slate-700 hover jade, fserif tiêu đề, pip chấm jade, Hán-Việt ĐẦY ĐỦ ("Trần Nhàn Rỗi"/"Nâng Cấp"/"Chưa Khai Phá"), 1 dòng/hiệu ứng, icon SVG/art. Mobile: hero dọc, công trình 1 cột, strip sticky top.

## 8. Lore

- Intro view: **"Giang hồ vạn dặm, về đến đây mới gọi là nhà."**
- Nhà chính: "Nền vững một thước, mộng dài một canh."
- Mộng Đài: "Đăng đài nhập mộng, tỉnh lai đắc bảo."
- Trảm Yêu Đài: "Kỳ trận bày xong, yêu tà tự đến nộp mạng."
- Diễn Võ Trường: "Đất trống ngàn thước, chờ ngày quần hùng khai chiến."

### Art cần làm (`images/dongphu/`) — 10 art + 1 icon nav

`nha_0.webp` (bãi đất trống/nền móng — first-touch) + `nha_1..6.webp` (6 bậc, style tile kiến trúc như tongmon/ nhưng phối cảnh NHÀ RIÊNG ấm cúng, tránh lẫn quần thể môn phái) + `mongdai.webp` (đài gỗ dưới trăng, motif tím/lam ăn theo dtm/) + `tramyeudai.webp` (đài đá cửu cung trận đồ, motif ngũ sắc ăn theo kytran/) + `dienvotruong_lock.webp` (silhouette) + `images/nav/dongphu.webp`.

## 9. Phụ lục — 4 sản phẩm danh vọng Lv55-100 (DỜI đợt sau, lore giữ sẵn)

| Lv | Tên | Inputs | Lore |
|---|---|---|---|
| 55 | Vân Văn Bình Phong | vanMauDinh×1 + phuVanMoc×2 | "Bình phong khảm vân mẫu, vân mây trôi thật trong lớp đá. Ngồi sau nó luận sự, lòng tự nhiên tĩnh lại." |
| 70 | Tinh Quang Đăng | vanThietDinh×1 + tinhHoaMoc×2 | "Đèn lồng lõi vẫn thiết, chao gỗ tinh hoa. Không dầu không lửa, đêm đêm tự tỏa ánh sao." |
| 85 | Long Văn Lương | tramHaiMoc×3 + sanHoDinh×1 | "Xà trầm hải chạm rồng cuộn, mắt rồng khảm san hô. Gác lên nóc phủ, tương truyền trấn được tà khí." |
| 100 | Thiên Công Đống Lương | thanDanMoc×2 + thanTinhDinh×1 | "Rường cột đẽo từ thần đàn mộc, gắn lõi thần tinh. Nhà dựng bằng nó, ngàn năm chẳng nghiêng — xứng danh thiên công." |

Điều kiện ship lại: có sink thật (bậc 7 "Tiên Phủ" / trang trí Động Phủ / Thâm Mộng) + sửa giá bán ≥1,25× tổng value input.

## 10. Các quyết định đã CHỐT (user, 2026-07-09) — DOC ĐÓNG BĂNG, SẴN SÀNG CODE

1. **Cap assist Mộng Đài: 70/75/80** (bảo thủ). ✅
2. **Trảm Yêu Đài: "Sắp Khai Mở"** — card hiện nhưng KHÔNG nút xây cho tới khi match-3 tích hợp. Động Phủ ship trước được. ✅
3. **Nâng nhà chính: toast + glow tĩnh** (KHÔNG banner full-screen). ✅
4. **Hủy Xây: hoàn 100% vật liệu, mất trắng Bạc.** ✅

Thứ tự build khi có lệnh code: engine/dongphu.js (schema + ensure + resolve + startBuild/cancel) → idleCapMs + boot order (ensureDongPhu → resolveDongPhu → simTongMon) → view UI (**mockup `_mockup/` duyệt visual trước khi ráp**) → Mộng Đài knob (3 read-site DTM) → items/actions Doanh Tạo mới → art 10 + icon nav (user gen) → (Trảm Yêu Đài kích hoạt khi ráp match-3).
