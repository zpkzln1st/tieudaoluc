# Đại phẫu Ngũ Hành Kháng — kế hoạch thi công

> # ✅ TOÀN BỘ 5 ĐỢT ĐÃ LIVE (2026-07-21)
> `0c07582` Đợt 1 · `f21faae`+`4683033` Đợt 2 · `68f2643` Đợt 3 · `dae65bb` Đợt 4 · `ec535d1` Đợt 5
>
> **Tổng kết cân bằng qua cả 5 đợt** (harness seed-RNG, 2 seed độc lập, bộ giáp roll ngẫu nhiên):
> Đợt 1 trùng khớp tuyệt đối · Đợt 2 sức bền +11% (bậc 4) / +12,5% (bậc 7) · Đợt 3 −2,5% (bậc 2), trung
> tính (bậc 3), tổng Công giữ nguyên · Đợt 4 −5,3% (bậc 2) / −6,5% (bậc 3) · Đợt 5 không đụng cân bằng nền.
> Cộng dồn: người chơi đồ tốt khoẻ lên rõ, người chơi đồ yếu gần như đứng yên.
>
> **CÒN NGỎ, chờ user chỉ chỗ cần sửa.** Số cụ thể (tỉ lệ hiệu ứng, trần kháng 0,50, trọng số affix,
> hệ số bù Công) đều là DRAFT tune được — chỗ chỉnh nằm trong bảng hằng ở đầu mỗi file.
>
> Trạng thái Đợt 1: **ĐÃ CODE + VERIFY (2026-07-21)** — loại đòn `vohe` (tpc/vtsk chuyển sang, `vatly`
> giữ làm alias), đòn quái mang hệ `e.he` chảy qua `P.khang`, chiêu người chơi chảy qua `e.khang`,
> khung 5 kháng ở gearStats→derivedStats→deriveCombat (toàn 0). Bài kiểm: harness seed-RNG 600 mẫu
> combatProfile trước/sau TRÙNG KHỚP tuyệt đối (hash 112201473); smoke kháng 50% → sát thương còn ~51%,
> Vô Hệ miễn. Ghi chú thi công: khung kháng nằm ở tầng DẪN XUẤT (affix `khangKim..khangTho` trên gear
> instance — gearStats gom generic), KHÔNG thêm field vào createInitialState vì không có gì cần persist.
> Các đợt 2-5 bên dưới CHƯA làm. Số liệu đo từ code thật ngày 2026-07-20.

---

## 0. Luật user đã chốt — không bàn lại

1. **5 kháng ngũ hành**, chỉ trên giáp trụ (vũ khí, ngựa không có):
   Kim = phòng thủ vật lý · Mộc = kháng Độc · Thủy = kháng Băng · Hỏa · Thổ = kháng Lôi.
2. **5 hiệu ứng hệ + 5 dòng giảm thời gian:**

   | Hệ | Tên đòn | Hiệu ứng | Dòng chống | Ô |
   |---|---|---|---|---|
   | Kim | Thọ Thương | **ngất**: tỉ lệ mất lượt + chịu sát thương nặng hơn | Thời gian phục hồi | **chỉ Áo** |
   | Thủy | Băng Sát | làm chậm | giảm thời gian làm chậm | giáp trụ |
   | Mộc | Độc Sát | độc theo thời gian | giảm thời gian trúng độc | giáp trụ |
   | Hỏa | Hỏa Sát | bỏng theo thời gian | giảm thời gian bỏng | giáp trụ |
   | Thổ | Lôi Sát | tỉ lệ choáng | giảm thời gian choáng | giáp trụ |

3. **Vô Hệ** = loại đòn thứ 6, không ăn khắc, không bị kháng chặn. `tpc`, `vtsk` chuyển sang.
4. **Cộng sát thương chỉ trên Vũ Khí + Nhẫn + Trang Sức.** Trang Sức gộp ngọc bội/dây chuyền làm
   MỘT ô (không thêm ô mới). Trang Sức có dòng **Kháng Tất Cả**. Nhẫn · Trang Sức · Vũ Khí roll
   được **kỹ năng vốn có +1→+3 Tầng**.
5. **Khắc ngũ hành giữ nguyên** (+30% / −20%). Kháng chồng lên trên. **Quái cũng có kháng.**
   Hệ của người chơi do **Tâm Pháp** quyết định.
6. **Tầng vượt trần 20 được** qua trang bị; mỗi tầng vượt mốc cộng **dốc hơn** tầng thường.
7. Phải **bù lại lượng Công** mất đi khi giáp trụ hết cộng sát thương.

---

## 1. Công thức — ĐÃ CHỐT: kháng là LỚP NHÂN RIÊNG

```
dmg = P.atk × c.mult
if (c.type khác 'vohe')  dmg ×= (1 + eleB) × (1 + khac)        // khắc ngũ hành: GIỮ NGUYÊN
if (p.buff > 0)          dmg ×= (1 + p.buffDmg)
crit                     dmg ×= P.critDmg
dmg ×= 100 / (100 + def × (1 − pen))                            // GIỮ NGUYÊN đường cong cũ
if (c.type khác 'vohe')  dmg ×= (1 − khang[c.type])             // ⬅ LỚP MỚI, trần 0.50–0.75
```

**KHÔNG chia `def` thành 5 phần.** Đã đo: chia đều làm người chơi nhận **×3,95 sát thương @Lv100**
(bài thủ **×4,23** — phạt bài thủ nặng hơn bài né, đảo ngược ý đồ), tức cày được ít hơn 4 lần.
Lớp nhân riêng còn tránh lan sang `dungeon.js` (power 9 phó bản đã tune) và `worldboss.js`.

---

## 2. Số đo then chốt (từ code thật)

**Bỏ Công khỏi giáp trụ mất bao nhiêu:**

| | Lv20 | Lv50 | Lv80 | Lv100 |
|---|---|---|---|---|
| % tổng Công mất | 19,0% | 25,2% | 36,0% | **41,4%** |
| Hệ số bù cần trên 3 ô giữ lại | ×1,57 | ×1,75 | ×2,03 | **×2,21** |

**Tỉ lệ mất tăng theo PHẨM CHẤT, không theo cấp** (do số dòng affix) — hệ số bù phải tính theo phẩm chất:

| Phàm | Lương | Tinh | Tuyệt | Truyền Thế | Thần | Cô Bản |
|---|---|---|---|---|---|---|
| ×1,00 | ×1,08 | ×1,18 | ×1,31 | ×1,47 | ×1,65 | **×1,83** |

**Ba cái bẫy đã phát hiện:**

- **Găng Tay là ô giáp trụ nhưng đang mang primary `congKich`** (`gear.js:297`) — 1 trong 3 primary
  Công duy nhất (Vũ Khí · Nhẫn · Găng), riêng nó **18,2% gear-Công @Lv100**. Bỏ Công khỏi giáp trụ =
  mất trọn 1/3 số primary Công. Phải cấp primary mới cho Găng (đề xuất `menhTrung`, đã có trọng số 10).
- **Đòn của quái hiện KHÔNG có hệ** — `dmg = e.atk × mult × 100/(100+P.def)` (`votong.js:655`).
  Phải gán hệ cho đòn quái (dùng `e.he` đã roll ở `makeFight`) thì kháng mới có nghĩa. **Bắt buộc.**
- **DoT trừ thẳng máu, không qua def** (`votong.js:671`) → các dòng "giảm thời gian độc/bỏng" phải
  cắt `ticksLeft`, **KHÔNG** được đụng `st.dmg`.

---

## 3. Lộ trình — mỗi đợt ship độc lập được

### Đợt 1 — Nền (không đổi cân bằng, an toàn nhất)
- Thêm loại đòn `vohe`; chuyển `tpc`, `vtsk` sang. Giữ `vatly` làm alias để save cũ không gãy.
- **Gán hệ cho đòn quái** trong `_eTurn` (dùng `e.he`).
- Thêm khung kháng vào state + `derivedStats` với **giá trị mặc định 0** → hành vi game KHÔNG đổi.
- Verify: harness đo `hpLostPerKill` trước/sau phải **trùng khớp** (đây là bài kiểm chính của đợt 1).

### Đợt 2 — Kháng có tác dụng ✅ **XONG (`f21faae` + `4683033`, 2026-07-21)**
- **Trần `KHANG_CAP = 0,50`** đặt ở `engine/stats.js` (tầng dưới, tránh vòng import vì `votong.js` đã
  import `stats.js`); `votong.js` bán lại cho UI. Kẹp ở CẢ HAI lớp nhân.
- **Đơn vị = ĐIỂM NGUYÊN**, quy đổi `/100` + kẹp trần tại `derivedStats`. Bắt buộc: `gearStats` chạy
  `Math.round` trên TỔNG cả 5 món, nên ghi tỉ lệ thì tổng 0,25→0 (mất trắng) còn 0,6→1 (miễn thương
  tuyệt đối). Cả hai đều im lặng.
- **Affix kháng chỉ trên giáp trụ** + `khangAll` chỉ trên Trang Sức. Cờ `noLv:true` → kháng KHÔNG nhân
  `LV_MUL` (bậc 7 hệ số 23,60 sẽ cho 71–142% kháng từ một dòng). Bậc 1: 3–6 điểm · bậc 7: 10–20 điểm.
- **Luật MỘT dòng kháng mỗi món** (bốc trúng 1 key thì khoá cả 5). Không có luật này, giáp bậc 7 gần như
  luôn ăn 3 dòng kháng — đo thật 44 điểm/món, năm món thành ~44% kháng đều cả 5 hệ, chạm trần toàn tập.
- **Kháng KHÔNG ăn cường hóa**: đo được bộ bậc 7 +15 chạm trần 100% số lần → cường hóa thành giá trị chết.
- **Kháng quái**: nền theo dáng sinh trong `mk()` (thường 5% · trâu 15% · nhanh 0% · boss 10%; 4 con viết
  tay = 0), cộng **tự vệ hệ đã roll +20%** (`KHANG_TU_HE`). Đặt lên ô TRUNG TÍNH của bảng khắc nên không
  phạt kép, và đẩy người chơi đi tìm hệ KHẮC (+30%). `enemyKhangFor()` luôn trả object MỚI vì
  `worldboss.js` copy nông.
- **UI**: khối con riêng "Kháng Ngũ Hành" (5 dòng + Trần Kháng) — tách khối vì nhét vào lưới 2 cột sẵn có
  thành 9 ô lẻ hàng; badge "Kháng nền" + dòng giải thích tự vệ hệ ở thẻ quái; câu chiến báo RIÊNG cho lớp
  kháng; `gearGainTotal` có trọng số để món kháng được "Đề Cử".

**Đo cân bằng (2 seed, bộ giáp roll ngẫu nhiên, 192 mẫu/cấu hình) — sức bền = maxHP / máu mất mỗi con:**

| Bậc đồ | Trước | Sau | Đổi | Kháng hiệu quả TB |
|---|---|---|---|---|
| 2 (Lương Phẩm Lv22) | 1,79 | 1,77 | −1% | 2,6% |
| 4 (Tuyệt Phẩm Lv50) | 19,96 | 22,17 | **+11%** | 9,1% |
| 7 (Cô Bản Lv100, quái Lv92-100) | 62,6 | 70,4 | **+12,5%** | 21,6% |

**Tỉ giá đo được (dùng cho các đợt sau):** kháng NGƯỜI CHƠI mạnh hơn kháng QUÁI rất nhiều, không phải 1:1
— 30% kháng người chơi = +74% sức bền (siêu tuyến tính, vì cắt máu mất trong khi hồi/hút máu giữ nguyên),
còn 30% kháng quái chỉ = −24% sức bền (gần tuyến tính, chỉ kéo dài trận). Mọi thiết kế "hai bên cùng có
kháng" đều **tự động nghiêng về người chơi**; không có cặp số nào triệt tiêu nhau.

### Đợt 3 — Phân vai lại ô trang bị ✅ **XONG (`68f2643`)**
- Công gỡ khỏi cả 5 ô giáp trụ **và Tọa Kỵ** (đo 2400 roll: 0 rò rỉ). Găng đổi primary
  `congKich`→`menhTrung`. Trang Sức thành ô Công thứ ba.
- **`BU_CONG` theo PHẨM CHẤT** trên 3 ô giữ lại: 1,50 (Phàm) → 2,04 (Cô Bản). Áp ở **cả hai** đường —
  `rollGearStats` (đồ rơi) VÀ `mkEquipStats` (catalog: migrate save cũ + Bộ Kim Quang); chỉ sửa đường
  roll thì đồ đi đường catalog sẽ yếu hẳn.
- **Bài kiểm đạt:** tổng Công bậc 1: 228→228 · bậc 4: 514→535 · bậc 7: 1608→1637.
- `neTranh` nối vào `dodge` qua đường cong bão hoà `x/(x+6000)`, trần riêng 0,25. Bắt buộc dạng bão hoà:
  neTranh leo tới ~1125 điểm ở bậc 7, tuyến tính là phá trần ngay.
- `menhTrung` = tỉ lệ vô hiệu hoá Né của quái `x/(x+2000)` — **kèm theo phải cho quái CÓ NÉ**
  (`ARCH_DODGE`), không thì `menhTrung` vẫn chết.
- Thêm dòng **Hồi Máu** (chỉ Tọa Kỵ), cờ `flat` = không nhân cấp lẫn phẩm chất: đo với `noLv` ra
  5,15%/hiệp ở bậc 7 = hồi 51% máu cả trận = **vùng bất tử**.
- Gear CŨ vẫn giữ `congKich` trên giáp trụ (gearStats cộng generic) — không vỡ, không NaN.

### Đợt 4 — Hiệu ứng hệ + dòng giảm thời gian ✅ **XONG (`dae65bb`)**
- `HE_FX`: Kim→**Ngất** 7% · Thủy→Chậm 16% · Mộc→Độc 16% · Hỏa→Bỏng 16% · Thổ→Choáng 10%.
  Tuyệt kỹ quái nhân rưỡi tỉ lệ. DoT tính theo **% Sinh Lực tối đa** để có nghĩa như nhau ở mọi cấp.
- **Ngất khác `stun`**: vừa mất lượt vừa chịu thêm 30% sát thương (`NGAT_AMP`).
- 5 dòng giảm thời gian, trần 0,60; `giamNgat` **chỉ trên Áo**. Cắt `ticksLeft` qua `ccTicks()`,
  **tuyệt đối không đụng** sát thương mỗi hiệp của Độc/Bỏng.
- `p` (người chơi) nay có `statuses[]` + `ngat` — trước đó người chơi không thể dính DoT từ đâu cả.

### Đợt 5 — Tầng vượt trần ✅ **XONG (`ec535d1`)**
- Tầng mua vẫn trần 20; trang bị cộng tới +3 → `TANG_HARD_MAX` 23. Bước vượt trần 0,11 vs bước thường
  0,05 (19→20 là 0,10 nên 20→21 dốc hơn **1,10 lần**, đúng khoảng đã chốt).
- **Chỉ Tầng MUA mới mở mốc** (4 mốc, Bản Mệnh Ấn, cắt Nội Lực, giảm hồi chiêu). Kiểm: mua14+gear3
  ra mult 2,88 còn mua17 ra 3,60 — khác nhau vì Bản Mệnh Ấn chỉ mở ở bản mua 17.
- `chieuOf()` cộng cả Tầng trang bị → UI khớp engine tuyệt đối (cùng ra mult 4,66 / Tầng 23).

---

## 4. Ba câu đã chốt (2026-07-21)

1. **Thưởng khắc hệ: GIỮ ~56%** — thưởng mạnh, để mang chiêu đa hệ và đổi bài võ theo quái là
   lựa chọn thật. Chấp nhận biên độ máu mất mỗi con phập phù hơn do quái roll hệ ngẫu nhiên.
2. **Ngựa (Tọa Kỵ) = Tốc Độ & Né Tránh **VÀ** Sinh Lực & Hồi Máu** (cả hai vai). Ngựa thành ô
   "thân pháp + sức bền": primary xoay quanh `tocDo`/`neTranh`/`sinhLuc`/hồi máu, không Công, không Kháng.
3. **Sửa `neTranh` và `menhTrung` LUÔN trong đợt này** (gộp vào Đợt 3 vì đằng nào cũng mổ pool affix):
   - `neTranh` → nối vào `dodge` trong `deriveCombat` (hiện `dodge` chỉ đọc `M.dodge + titleBonus`,
     **không** đọc `d.neTranh` — đó là lý do nó chết).
   - `menhTrung` → thành tỉ lệ đánh trúng, chống né của quái (hiện không xuất hiện ở đâu trong
     `deriveCombat`).
   - Cả hai phải kèm harness đo trước/sau, vì bật một chỉ số chết = buff toàn cục cho mọi nhân vật.

---

## 5. Nhắc khi đo cân bằng

`combatProfile()` là **hàm ngẫu nhiên** — một lần đo là nhiễu (cùng một ô ra −48% lần này, +133% lần
sau). Phải lấy **trung bình ≥25 lần**, chạy **≥2 lượt độc lập**, và chỉ coi là kết luận những gì
trùng nhau ở cả hai lượt. Vòng cày cố định 8s/con nên sát thương ảnh hưởng **sức bền**
(`hpLostPerKill`) chứ không làm cày nhanh hơn.
