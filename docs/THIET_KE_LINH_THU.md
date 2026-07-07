# THIẾT KẾ HỆ LINH THÚ — Tiêu Dao Lục

> Bản chốt, code-ready. Đã đối chiếu code thật (`derivedStats`, 30 trứng `petBase`, `xpForLevel`, World Boss currency) + qua 1 vòng soi cân bằng (gộp mọi nguồn buff pet về **1 trần ≤15% sức chủ** — pet = "1 món gear xịn", KHÔNG bá đạo).
>
> **File mới:** `src/data/pets.js` (hằng số: SPECIES, PET_QUALITY, OPT_POOL, SKILL pool, bảng roll) · `src/engine/pets.js` (hatch/level/exp/stamina/fuse/release/evolve + `petBonus()`).
> **Sửa:** `engine/stats.js` (cộng `petBonus()` vào `g` + CAP) · `engine/activity.js` (exp + Thể Lực — P4) · `data/votong.js` `stepFight` (chiêu pet — P5) · `nav.js`+`main.js` (view) · `items.js` (thêm `linhPhach`).
> **Tái dùng:** `QUALITY` (màu khung) · `honThach` (skip ấp + thức tỉnh) · KHÔNG sửa data 30 trứng.

## 0. Triết lý cân bằng — TRẦN CỨNG ≤15%
Pet là **phụ trợ**, không thay người chơi. **Tổng đóng góp pet (stat + opt + chiêu, đo bằng DPS/endurance) ≤ 15% sức mạnh chủ** ở mọi điểm game. Đảm bảo bằng:
1. **CAP cứng** (E.0): mỗi stat pet ≤ **12%** stat chủ; tổng ≤ **15%**.
2. **Cấp pet ≤ cấp chủ** (không bao giờ vượt).
3. **Thể Lực time-gate** — pet kiệt sau ~20 cycle, **KHÔNG mua skip** → DPS trung bình thực ~10%.
4. Chiêu/opt %/lifesteal **gộp chung trần**, không tách lớp.

Hạng pet → đóng góp: Phàm/Lương **+4→8%** · Tinh/Tuyệt **+8→11%** · Thần/Cô Bản (thức tỉnh) **+11→15% (trần)**. Pet Cô Bản full ≈ gấp ~3× con Phàm cùng cấp → săn pet xịn cực đáng, mà vẫn chỉ bằng 1 món gear cao cấp.

---

## A. STAT — ẤP NỞ + LÊN CẤP (cốt lõi: phẩm chất chi phối)
Hai hệ số tách biệt: `gMul` (growth/level) **dốc hơn** `qMul` (stat nở) → phẩm cao càng lên cấp càng bỏ xa phẩm thấp.

### A.1 — `PET_QUALITY` (7 bậc)
| id | Tên | qMul (×base nở) | gMul (×growth/lv) | optSlots | Trần Lv pet |
|---|---|---|---|---|---|
| phamPham | Phàm | 0.85 | 0.80 | 1 | Lv chủ −10 |
| luongPham | Lương | 1.00 | 1.00 | 1–2 | Lv chủ −6 |
| tinhPham | Tinh | 1.15 | 1.25 | 2 | Lv chủ −3 |
| tuyetPham | Tuyệt | 1.35 | 1.55 | 3 | = Lv chủ |
| truyenThe | Truyền Thế | 1.55 | 1.85 | 3–4 | = Lv chủ |
| thanPham | Thần | 1.80 | 2.15 | 4 | = Lv chủ |
| coBan | Cô Bản | 2.10 | 2.55 | 4–5 | = Lv chủ |

### A.2 — Roll phẩm pet từ nhãn trứng (giữ data trứng, chỉ thêm bảng roll)
| Trứng | → phẩm pet |
|---|---|
| `egg_*_pham` | Phàm 70% / Lương 30% |
| `egg_*_linh` | Tinh 55% / Tuyệt 35% / Truyền Thế 10% |
| `egg_*_than` | Tuyệt 30% / Truyền Thế 40% / Thần 25% / Cô Bản 5% |

→ Cô Bản chỉ từ trứng Thần (drop 0.02% World Boss) → ~1 con/100k kill. Cực phẩm.

### A.3 — `PET_SPECIES` (10 dòng) @ Lv1, chuẩn phẩm Lương
| base | Dòng | he | Vai | congKich | hoThe | sinhLuc | neTranh | menhTrung |
|---|---|---|---|---|---|---|---|---|
| bachHo | Bạch Hổ | kim | sát thủ | 9 | 2 | 14 | 4 | 4 |
| huyenQuy | Huyền Quy | thuy | trụ thủ | 3 | 8 | 30 | 2 | 2 |
| huyetLang | Huyết Lang | kim | hút máu | 8 | 3 | 16 | 5 | 3 |
| cuHung | Cự Hùng | tho | tank | 4 | 7 | 34 | 1 | 2 |
| docGiao | Độc Giao | moc | DoT | 6 | 4 | 20 | 3 | 5 |
| loiBang | Lôi Bằng | hoa | tốc/né | 8 | 2 | 14 | 6 | 5 |
| hoaLan | Hỏa Lân | hoa | burst | 10 | 2 | 15 | 3 | 4 |
| hoYeu | Hồ Yêu | moc | crit/hỗ trợ | 5 | 3 | 18 | 5 | 7 |
| bangPhuong | Băng Phượng | thuy | khống chế | 6 | 4 | 20 | 4 | 6 |
| thienMa | Thiên Ma | tho | toàn năng | 8 | 5 | 22 | 4 | 5 |

(Ngũ hành: lore Lôi→`hoa`, Băng→`thuy`; còn lại map thẳng.)

### A.4 — Công thức (chốt cứng vào pet lúc nở)
```
GROWTH_BASE[k] = round(SPECIES[base][k] × (k==='sinhLuc'?0.09:0.11), 2)
baseStats[k]   = max(1, round(SPECIES[base][k] × qMul))     // chỉ nếu base>0
growth[k]      = round(GROWTH_BASE[k] × gMul, 2)
stat[k] @Lv    = round(baseStats[k] + growth[k]×(Lv−1))
+ thức tỉnh: toàn bộ ×1.25 (snapshot 1 lần) · + opt (B) khi pet đang MANG
```
Pet đang mang → `petBonus()` cộng vào `g` của `derivedStats` (1 chỗ) → chảy tự nhiên qua combat.

### A.5 — CAP (E.0 — van an toàn, PHẢI code)
```
petBonus.congKich = min(petBonus.congKich, 0.12 × chu.congKich)
petBonus.sinhLuc  = min(petBonus.sinhLuc,  0.12 × chu.sinhLuc)
petBonus.hoThe    = min(petBonus.hoThe,    0.12 × chu.hoThe)   // dmg-reduction pet cap 8%, maxHP cap 12%
// lifesteal pet ≤6% (chỉ trên đòn pet) · crit/dodge % gộp cap chung với chủ
```

---

## B. BẢNG OPT NGẪU NHIÊN (mục 7 — "không con nào như con nào")
Roll lúc nở, **chốt vĩnh viễn**. Tối đa **2 opt ảnh-hưởng-combat / pet** (còn lại utility, KHÔNG đụng trần — để opt slot 4–5 vẫn có giá trị).

### B.1 — Số opt + bias theo phẩm
Phàm 1 (đáy) · Lương 1–2 · Tinh 2 · Tuyệt 3 · Truyền Thế 3–4 · Thần 4 (cận trần) · Cô Bản 4–5 (cận trần + 1 dòng quý đảm bảo). Giá trị = `round(uniform(lo,hi) × oMul(=qMul) × bias)`; bias Phàm 0.2 → Cô Bản 0.85.

### B.2 — `OPT_POOL`
| id | Hiệu ứng | Range (Lương) | Nhóm | Cap pet | w |
|---|---|---|---|---|---|
| atkFlat | Công + | 4→12 | combat | — | 20 |
| hpFlat | Sinh Lực + | 25→80 | combat | — | 20 |
| defFlat | Hộ Thể + | 3→10 | combat | — | 16 |
| dodgeFlat | Né + | 3→10 | combat | — | 14 |
| menhFlat | Mệnh Trúng + | 3→10 | combat | — | 14 |
| atkPct | Công % | 2→6% | combat | 12% | 10 |
| hpPct | Sinh Lực % | 2→6% | combat | 12% | 10 |
| critRate | Bạo Kích % | 1→3% | combat | 8% | 7 |
| critDmg | Bạo Kích Thương % | 4→12% | combat | 30% | 6 |
| dodgePct | Né % | 1→3% | combat | 10% | 6 |
| lifesteal | Hút máu % | 1→4% | combat | 6%(tổng) | 4 |
| eleDmg | +ST hệ pet % | 3→8% | combat | 20% | 5 |
| petExp | EXP săn mồi % | 5→20% | **utility** | — | 6 |
| moneyFind | +Bạc rơi % | 3→10% | **utility** | — | 3 |

25% cơ hội ép 1 opt = `eleDmg` cùng hệ pet (thưởng build đúng hệ).

### B.3 — Dòng quý (chỉ Truyền Thế+; Cô Bản đảm bảo, khác 35%)
Đồng Tâm (chắn 1 đòn khi chủ <25% HP) · Phản Phệ (phản 10% ST) · Linh Mẫn (−1 CD chiêu) · Cộng Hưởng (+8% ST chiêu cùng hệ chủ) · Tham Lam (+4% Cơ Duyên).

---

## C. POOL KĨ NĂNG (mục 1)
**Cách có:** 1 **bị động CỐ ĐỊNH theo loài** (signature) + 1 **chủ động roll lúc nở** (2 ứng viên/loài, phẩm cao mở ứng viên mạnh, Cô Bản roll 2 chọn 1) + thức tỉnh mở thêm 1 ô bị động phụ. Skill chỉ phát khi pet **đang mang**; chiêu pet tốn 0 Nội Lực (gate bằng CD + Thể Lực). `petDmg = pet.congKich × mult × 100/(100+def)` — **cap 20% đòn chủ/cycle, gộp vào trần ≤15%**.

### C.1 — BỊ ĐỘNG (12) — signature theo loài
Hổ Uy (bachHo: +Bạo Kích Thương) · Quy Giáp (huyenQuy: giảm ST nhận, cap 8%) · Huyết Khát (huyetLang: +hút máu, gộp cap 6%) · Hùng Thể (cuHung: +maxHP cap 12%) · Độc Tố (docGiao: đòn chủ kèm độc) · Lôi Tấn (loiBang: +Tốc) · Diễm Hoá (hoaLan: +ST Hỏa) · Hồ Mị (hoYeu: né + Cơ Duyên) · Hàn Sương (bangPhuong: −Tốc địch) · Ma Khí (thienMa: +mọi ST nhẹ + Thủ) · Đồng Cam (thức tỉnh: hồi Thể Lực khi thắng) · Kiên Nhẫn (thức tỉnh: +EXP săn mồi).

### C.2 — CHỦ ĐỘNG (13) — mỗi loài 2 ứng viên, CD = số cycle
Bạo Trảo / Phá Giáp (bachHo) · Tị Thủy Quyết / Nghịch Lưu (huyenQuy) · Cuồng Huyết (huyetLang) · Trấn Sơn (cuHung) · Phún Độc (docGiao) · Lôi Dực Kích (loiBang) · Phần Diễm (hoaLan) · Mị Hoặc / Hồi Xuân (hoYeu) · Hàn Băng Phong (bangPhuong) · Thiên Ma Trảm (thienMa). (Mult 0.15→0.60 + hiệu ứng; chi tiết số trong code pets.js.)

---

## D. HP + THỂ LỰC (mục 4)
```
hpMax = round(pet.sinhLuc × 1.5)   // pet chịu đòn riêng
stamMax = 100
```
**Tiêu hao/cycle (pet mang + chiến):** chia lửa 20% đòn quái → −HP (boss ×1.5); Thể Lực **−4/cycle**, **−6/chiêu**. → đầy 100 đánh ~**18–22 cycle** rồi kiệt.
- **Hết Thể Lực** → pet rút: ngừng chia lửa + chiêu, chỉ stat tĩnh còn cộng.
- **HP pet = 0** → ngất: mất TOÀN BỘ bonus tới khi hồi. **KHÔNG phạt nội thương chủ**.
**Hồi:** HP = item (tự dùng Món Ăn/Đan khi pet <25% — mở rộng `autoEatTick`); Thể Lực = **bắt buộc nghỉ** (state `sleep`), **+10/phút ĐỒNG ĐỀU mọi phẩm** (KHÔNG skip, KHÔNG cho phẩm cao hồi nhanh → giữ van time-gate). Bỏ opt `stamCost` (hoặc cap −10%).

---

## E. EXP · ẤP · DUNG HỢP / PHÓNG SANH · TIẾN HOÁ
**E.1 EXP (mục 3):** pet **đang mang** = 50% combat-exp/trận (≤ cấp chủ). Pet **không mang** (state `hunt` idle) = săn mồi: mỗi 10 phút `huntExp = round(petLv×4×(1+petExp)) × 0.4`, tốn −10 Thể Lực, hết → sleep; pet săn KHÔNG cộng stat. Đường cong: `petXpToNext(L)=round(40×L^1.5)`. Cấm fuse pet đang săn.

**E.2 Ấp nở (mục 5):** thời gian theo nhãn trứng: Phàm **2h** · Linh **8h** · Thần **24h**. Skip: `ceil(remainMs/3600000)×100` Hồn Thạch (skip một phần được). Nở tự nhiên = free. 1 lò ấp ở v1.

**E.3 Dung Hợp (mục 6):** donor → `fuseXp = round(PET_XP_VALUE×0.7)` (sink 30% lành mạnh). Cùng dòng + cùng phẩm → +15% exp + cơ hội **nâng phẩm** pet đích (2 Phàm → 70% lên Lương — đường có 4 phẩm trung gian). Pet đang mang/đang săn không fuse.

**E.4 Phóng Sanh (mục 6):** thả → Bạc (`Lv×50 + qVal×5`) + Hồn Thạch (`floor(qRank/2)`, chỉ Tuyệt+) + `linhPhach` (phẩm≥Tinh, liệu MỚI — phải định nghĩa trong items.js).

**E.5 Tiến hoá / Thức tỉnh (mục 2):** đạt trần Lv phẩm + tốn liệu thức tỉnh + Hồn Thạch (500→3000 theo phẩm). Đổi: stat ×1.25 · skill → bản `_awk` mạnh +~30% · mở 1 ô bị động phụ + 1 opt · **đổi ART hình thái 2** · 15% biến dị +1 phẩm. KHÔNG reset level.
> ✅ **ĐÃ CHỐT (2026-06-15):** liệu thức tỉnh **TÁCH 2 nguồn** — pet phẩm **thấp** (< Thần) dùng `linhPhach` (liệu pet riêng, gom từ Phóng Sanh, định nghĩa ở items.js khi tới P6/P7); chỉ pet **Thần Phẩm trở lên** mới cần `tinhThe` (Tinh Thể Yêu Vương). Mục đích: pet thường KHÔNG tranh `tinhThe` với cường hóa gear +10↑; chỉ end-game pet xịn mới đua tài nguyên đó.

**E.6 Art (mục 2):** phong cách "linh thú đồng hành" (chibi cute-fierce) — KHÁC boss khổng lồ, KHÔNG lấy ảnh boss. 10 dòng × 2 hình thái = **20 ảnh** `images/pets/pet_<base>_base.webp` + `_awk.webp` (~512², nền trong, màu theo hệ). Placeholder v1 = emoji dòng (🐯🐢🐺🐻🐍🦅🦁🦊…) + glow tĩnh theo phẩm.

---

## F. LỘ TRÌNH BUILD (ship dần)
| Bước | Nội dung | Ship được |
|---|---|---|
| **P1 — Nở & Stat** | `data/pets.js` + `engine/pets.js` hatchEgg (roll phẩm→stat→opt); `state.pets`; nút Ấp trên trứng ở Hành Lý | Nở trứng ra pet thật, xem chỉ số |
| **P2 — Mang & Stat** | view "Linh Thú" + card pet + Mang/Tháo 1 con; `petBonus()` + CAP vào `derivedStats` | **MVP: pet ảnh hưởng combat ngay** |
| **P3 — Ấp thời gian ✅** | Lò Ấp Noãn đơn (`state.hatchery`): Đặt Ấp → roll pet NGAY nhưng **giấu phẩm**, countdown theo `readyAt` (sống reload/offline) → Khai Noãn (free) / Thúc Nở (`ceil(remain/h)×100` HT). Notif offline "đã nở". | time-gate + sink HT |
| P4 — HP/Thể Lực/EXP | 2 thanh + tiêu hao + auto-item HP + EXP mang 50% + hồi nghỉ | pet chia lửa + lên cấp |
| P5 — Kĩ năng | bị động + chủ động vào cycle (`stepFight` + `petTurn`) | pet đánh phụ, build theo dòng |
| P6 — Dung Hợp/Phóng Sanh | 2 nút + nâng phẩm | pet cùi có lối ra |
| P7 — Tiến hoá + Art + Săn Mồi idle | thức tỉnh + 20 art + idle engine pet không mang + mở nhiều slot (Ngự Thú) | hoàn chỉnh idle engine #2 |

**MVP = P1 + P2.** Đã ship: **P1 + P2 + P3**. Tiếp theo: P4 (HP/Thể Lực/EXP mang 50%).
