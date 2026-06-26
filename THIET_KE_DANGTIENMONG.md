# THIẾT KẾ A-Z — Đăng Tiên Mộng
*(Hệ game thẻ bài deck-battler roguelike trong Tiêu Dao Lục · soạn qua workflow 8-agent 2026-06-26)*

> **CHỐT v2 (user, 2026-06-26):** Tên hệ = **Đăng Tiên Mộng** (登仙夢) — đã thay `Kỳ Mộng Lục` trong toàn doc. · **Assist chậm = BẬT, giới hạn theo TUẦN** (đổi Mộng Ngân ↔ chút Nguyên Bảo, cap tuần). · Build: **mockup trước** rồi mới code. (id code đề xuất: `dangTienMong` / `dtm*` / `state.dangTien`.)


## TÓM TẮT ĐIỀU HÀNH

Hệ con thẻ bài (deck-battler roguelike võ hiệp) trong Tiêu Dao Lục được chốt như sau, trả lời dứt khoát 3 câu hỏi cốt lõi:

**(1) TÊN HỆ → 「Đăng Tiên Mộng」 (奇夢錄)**, phụ đề *"Mộng Cảnh Luyện Chiêu"*.
- *Dự phòng 1:* **Luận Bài Lục** (giữ tên prototype, "Lục" đồng bộ họ tên — Tiêu Dao Lục/Danh Sĩ Lục).
- *Dự phòng 2:* **Tàng Kiếm Cục** (nhấn "đấu trí/ván cờ").
- **Lý do chọn Đăng Tiên Mộng:** lore "nhập mộng" (gối Hoàng Lương Trầm ở Tàng Kinh Các → rơi vào mộng cảnh đấu tàn niệm tiền nhân) giải thích GỌN cả ba điều khó nhất cùng lúc: (a) vì sao combat-theo-lượt rời rạc với auto-battler chính, (b) vì sao thắng/thua KHÔNG đụng thân thể thật → **cách ly là tự nhiên trong lore**, (c) vì sao mỗi lần vào lại random map khác. Tên "Luận Bài" bị loại làm tên CHÍNH vì "Luận" đã gắn với **Luận Võ** (hệ tỉ thí side-only đã có) → dễ nhầm; nhưng giữ làm dự phòng vì user đã quen.
- *Ghi chú kỹ thuật:* view id = `dangTienMong`, tiền tố code = `km*`, state = `state.dangTien`. (Nếu user chốt tên "Luận Bài" thì đổi nhãn + đổi id thành `luanbai`/`state.luanBai`/`lb*` — layout & logic không đổi.)

**(2) ĐẶT Ở ĐÂU → View riêng `dangTienMong` trong nhóm nav "Chiến Đấu", ngay dưới Yêu Vương.**
- Bản chất là chế độ chơi đối kháng/thử thách → cùng họ Bí Cảnh + Yêu Vương. Người chơi tìm "chỗ đánh đấm" vào đúng nhóm.
- **KHÔNG** nhét vào Giang Hồ (đó là chỗ Phong Vân Bảng/khoe/xã hội) hay Tông Môn (nhánh chill quản đệ tử).
- Thêm **entry phụ deep-link** từ view `tangkinhcac` (nút "Nhập Hoàng Lương Mộng") để củng cố lore — nhà chính vẫn là nav item riêng để dễ tìm.
- *Lưu ý mâu thuẫn đã giải:* mảng "Tiến trình" và vài mảng đề xuất nhóm "Giang Hồ"; tôi quyết **nhóm Chiến Đấu** vì lý do "tìm chỗ đánh" thắng lý do "đồng bộ BXH" (BXH chỉ là 1 tab, vẫn lồng được vào Phong Vân Bảng dù view nằm ở Chiến Đấu).
- **Mở khóa:** cảnh giới Luyện Khí tầng 7 (fallback nhân vật Lv ≥ 12). Trước mốc: nav item mờ + khóa, tooltip *"Cần đạt Luyện Khí tầng 7 để chạm vào Hoàng Lương Trầm."*

**(3) ITEM/THƯỞNG CÓ ẢNH HƯỞNG GAME CHÍNH KHÔNG → KHÔNG (về power). Chốt MODEL B — "Bridge chậm, một chiều, 0 power".**
- **Lý do ngắn:** loot-hunt = linh hồn game ("item phải tự cày ở main"). Nếu thẻ/bí kíp ra power → giết loot-hunt (Model C, bác bỏ). Nếu cách ly tuyệt đối 0 điểm chạm → người chơi main hardcore không có lý do ghé, hệ thành ốc đảo chết động lực sau vài ngày (Model A, lỗi Tông Môn từng suýt mắc). Model B sao chép đúng hợp đồng cách ly Tông Môn đã được verify-ưng: currency riêng + tiền main chảy 1 chiều VÀO + chỉ cosmetic/BXH chảy RA.
- **KHÔNG BAO GIỜ về main:** gear, chỉ số chiến đấu, nguyên liệu top, currency lớn, pet/công cụ, chiêu thật.
- **Được phép (1 chiều OUT, 0 power, có trần):** cosmetic (khung avatar, glow tĩnh, danh hiệu) + Danh Hiệu qua hệ `titles.js` + khoe BXH (Mộng Cảnh Bảng) + tick Vạn Vật Phổ. Ngoại lệ duy nhất "assist chậm" (đổi Mộng Ngân lấy chút Nguyên Bảo nhỏ giọt cap tuần) — **mặc định TẮT**, bật khi user chốt.

### Bảng chốt nhanh các quyết định lớn

| # | Quyết định | Chốt | Ghi chú |
|---|---|---|---|
| 1 | Tên hệ | **Đăng Tiên Mộng** (奇夢錄) | dự phòng: Luận Bài Lục / Tàng Kiếm Cục |
| 2 | View id / tiền tố code / state | `dangTienMong` / `km*` / `state.dangTien` | mẫu `ensureKyMong` như `ensureTongMon` |
| 3 | Vị trí nav | Nhóm **Chiến Đấu**, dưới Yêu Vương | + deep-link phụ từ `tangkinhcac` |
| 4 | Mở khóa | Luyện Khí tầng 7 / Lv ≥ 12 | nav khóa + tooltip trước mốc |
| 5 | Item ảnh hưởng main? | **KHÔNG (power)** — Model B | cosmetic + danh hiệu + BXH + Phổ Lực |
| 6 | Currency riêng | **Mộng Ngân** (soft) | + Kỳ Phổ (hard) tùy chọn tách bậc |
| 7 | Engine | **RIÊNG** `engine/kymong.js`, thuần | chỉ import `nguHanhMod/NGU_HANH` từ votong.js |
| 8 | Khắc hệ | Dùng `nguHanhMod` (+30%/−20%) | KHÔNG hardcode `*1.3` như prototype |
| 9 | Format run | Bản đồ nhánh StS-lite, 3 Trùng × ~4 node | ~11-14 trận, 12-18 phút/ván |
| 10 | Hero | **CÓ** — chọn 1 đầu run | quyết HP/Khí/Tâm Pháp/passive/signature |
| 11 | RNG | **Deterministic** mulberry32 + seed | khôi phục run dở + daily seed BXH |
| 12 | Trần scope | ≤60 thẻ · ≤9 ải · ≤20 relic · ~8-15 trạng thái | chống phình |
| 13 | Run sim offline | **KHÔNG** — mộng đứng yên khi rời máy | offline-safe, không tua giờ |
| 14 | Thưởng cảnh báo | KHÔNG slide động, glow TĨNH, icon SVG/Hán | bỏ emoji prototype |

---

> **Lưu ý dùng tên trong doc:** từ đây dùng **Đăng Tiên Mộng** làm tên chính thức, **Mộng Ngân** làm currency chính. Các tên thay thế từ các mảng (Bài Hồn/Kỳ Phổ/Đấu Hồn/Đấu Ý/Ngộ Tâm…) được hợp nhất vào sơ đồ currency thống nhất tại Mục 2. Mọi cơ chế (hero, relic, map, status) giữ nguyên — chỉ thống nhất nhãn.

---

# MỤC 1 — BẢN SẮC & VỊ TRÍ

## 1.1 Lore cốt lõi: "Nhập mộng đối chiêu — Hoàng Lương Trầm"

Trong **Tàng Kinh Các** (view `tangkinhcac` đã có) lưu truyền bí vật **「Hoàng Lương Trầm」** (黃粱枕 — gối Hoàng Lương, điển "giấc mộng kê vàng"). Gối đầu mà ngủ → thần thức rơi vào một **tầng mộng cảnh** kết tụ từ tàn niệm võ học tiền nhân:

- **Thân thể thật không hề hấn** → lý do cốt lõi để cách ly tuyệt đối với main: thắng/thua chỉ là mộng, không rơi gear, không mất HP/Thể Lực thật.
- **Không mang trang bị/nội công thật vào mộng** → mộng phát cho một "bộ chiêu thức" (bộ bài) rút từ võ học tiền nhân → bộ bài là hệ TÁCH RIÊNG, không phải skill thật.
- **Mỗi lần nhập mộng, mộng tự tái cấu trúc** (random tầng/đường/địch) → roguelike "mỗi lần một khác".
- Càng sâu càng gặp **tàn niệm cao thủ** (reuse 57 chân dung: cường đạo → sát thủ → 15 chưởng môn phái → 9 huyền thoại làm boss đỉnh).
- Rời mộng = **"lĩnh ngộ"** = Mộng Ngân + cosmetic + thành tựu khoe, KHÔNG vật phẩm thật.

**Dòng lore lobby:**
> *"Gối đầu lên Hoàng Lương Trầm, một giấc mộng dài tựa trăm năm. Trong mộng, võ học tiền nhân hóa thành chiêu trong tay ngươi; tàn niệm cao thủ chắn lối phía trước. Tỉnh giấc, thân vẫn ở Tàng Kinh Các — chỉ có lĩnh ngộ là theo ngươi ra khỏi mộng."*

### Vì sao lore này "đắt" (đáp ứng 3 ràng buộc cùng lúc)

| Ràng buộc | Lore "mộng cảnh" giải quyết |
|---|---|
| Cách ly với main | Mộng → không đụng `deriveCombat`/`gearBag`/HP-Thể Lực thật. Thua không phạt thân. Loot-hunt nguyên vẹn vì mộng KHÔNG sinh gear thật. |
| Tách combat khỏi auto-battler chính | Dùng "chiêu thức tiền nhân" (bài) chứ không phải võ công thật → đánh-theo-lượt rời rạc là hợp lý. |
| Reuse 15 phái + 9 huyền thoại | "Tàn niệm tiền nhân" = lý do hoàn hảo để chưởng môn/huyền thoại làm boss mộng mà không phá lore. |

## 1.2 Vị trí nav (chốt khớp với main)

Thêm vào `nav.js` nhóm **Chiến Đấu**, item cuối:
```js
{ view: 'dangTienMong', name: 'Đăng Tiên Mộng', gloss: 'Card Roguelike', icon: '夢' },
// VIEW_NAMES.dangTienMong = 'Đăng Tiên Mộng';
```
- `icon` ở data chỉ là fallback; UI cuối render **Hán-tự '夢'** hoặc SVG line (gối/quân bài) — **KHÔNG emoji**.
- Deep-link phụ: nút "Nhập Hoàng Lương Mộng" trong view `tangkinhcac` → set `view='dangTienMong'`.

## 1.3 Sảnh/Lobby (view `dangTienMong`) — 3 phần, KHÔNG nhảy thẳng vào trận

Tone dark + jade/cyan/gold, ảnh nền "Hoàng Lương Trầm" (reuse art cinematic/dungeon). Mobile 375px dồn 1 cột.

1. **Hero "Hoàng Lương Trầm" (full-width):** tên hệ lớn (Lora serif, gold, glow TĨNH) + phụ đề + 1 dòng lore + nút lớn **"Nhập Mộng"** (gradient jade→cyan). Góc phải: **Mộng Ngân** + **tầng sâu nhất** ("Mộng Sâu: Tầng 7").
2. **Bảng trạng thái run (nếu đang dở):** card "Đang Trong Mộng — Tầng 4/?, HP mộng 23/40" + **"Tiếp Tục"** / **"Bỏ Mộng"** (tỉnh giấc, mất tiến trình run, KHÔNG phạt thân thật). Run lưu `state.dangTien.run`, **không sim offline** (mộng đứng yên khi rời máy — đúng tinh thần Tông Môn).
3. **3 thẻ chức năng (art-tile):**
   - **"Khởi Mộng"** — chọn độ khó (Sơ Mộng / Thâm Mộng / Ác Mộng), chọn Hero + Tâm Pháp, xem trước thưởng.
   - **"Mộng Phổ"** — codex tàn niệm (boss) đã gặp + thẻ đã mở (đồng bộ Vạn Vật Phổ).
   - **"Đổi Lĩnh Ngộ"** — shop tiêu Mộng Ngân (cosmetic, danh hiệu, mở thẻ pool, assist chậm).

Header lobby có **chip điều hướng nhanh** (mẫu `goToActivity`): "Mộng Ngân", "Tầng cao nhất", "Số tàn niệm thu phục".

---

# MỤC 2 — KINH TẾ & CÁCH LY (câu hỏi #3)

## 2.1 Sơ đồ currency thống nhất (hợp nhất các đề xuất)

| Tên Hán-Việt | Vai trò | Lưu ở | Về main? |
|---|---|---|---|
| **Mộng Ngân** (夢銀) | soft currency — kiếm mỗi run (kể cả thua), tiêu cho meta-unlock + shop | `state.dangTien.mongNgan` | KHÔNG |
| **Kỳ Phổ** (奇譜) *(tùy chọn tách bậc)* | hard currency hiếm — chỉ rơi boss-ải/mốc, đổi cosmetic xịn + thẻ huyền thoại | `state.dangTien.kyPho` | KHÔNG |
| **Mộng Cảnh Điểm** | điểm khoe BXH (Mộng Cảnh Bảng), tính từ `deepest`/ascension/số phái clear | dẫn xuất, không lưu rời | KHÔNG (chỉ khoe) |

> **Đơn giản hóa khuyến nghị cho MVP:** chỉ dùng **Mộng Ngân** (1 currency). Tách Kỳ Phổ chỉ khi cần "tiền hiếm" cho cosmetic top — quyết ở pha sau. KHÔNG nhồi 4 currency (Bài Hồn/Đấu Hồn/Đấu Ý/Ngộ Tâm/Uy Danh từ các mảng) → gộp hết vào Mộng Ngân + một điểm BXH dẫn xuất.

Các currency hệ thẻ **KHÔNG** nằm trong `state.currencies` (chỉ chứa bac/honThach/nguyenBao của main) — đây là rào cách ly cấp-data.

## 2.2 Ba model + chốt

| Model | Mô tả | Phán quyết |
|---|---|---|
| **A** Thuần side, cách ly tuyệt đối | mọi thứ vòng trong hệ, 0 điểm chạm main | ❌ chết động lực (main hardcore không ghé) |
| **B** Bridge chậm, 1 chiều, 0 power | trả ra cosmetic/danh hiệu/BXH/Nguyên Bảo nhỏ giọt cap-tuần | ✅ **CHỐT** — sao chép hợp đồng Tông Môn đã verify |
| **C** Mở van power | thẻ/bí kíp cộng stat thật hoặc rơi gear | ❌ giết loot-hunt (linh hồn game) |

## 2.3 Hợp đồng cách ly (chốt từng dòng)

**KHÔNG BAO GIỜ về main (đỏ tuyệt đối):**
1. Không gear (thẻ không bao giờ vào `gearBag`).
2. Không chỉ số chiến đấu (`deriveCombat` không đọc `state.dangTien`).
3. Không nguyên liệu top / Đồ Phổ / Hồn Thạch khối lớn.
4. Không currency lớn (Bạc/Hồn Thạch đủ để "cày thẻ thay cày main").
5. Không pet/linh thú/công cụ gather.

**Được phép (xanh — 1 chiều OUT, 0 power, có trần):**

| Thứ trả ra | Cơ chế | Trần | Vì sao an toàn |
|---|---|---|---|
| **Cosmetic** | đổi bằng Mộng Ngân ở "Đổi Lĩnh Ngộ" | không giới hạn | thuần trang trí: khung avatar, glow tĩnh, skin lưng bài |
| **Danh Hiệu** | mốc thành tựu (vd "Hoàng Lương Mộng Khách", "Mộng Cảnh Vô Địch") | 1/mốc | qua hệ `titles.js` chung — cộng chỉ số NHẸ như mọi danh hiệu, KHÔNG bonus riêng |
| **Khoe BXH** (Mộng Cảnh Bảng) | tầng sâu nhất + ascension | — | chỉ số khoe, lồng vào Phong Vân Bảng `pvbTab='kyMong'` |
| **Phổ Lực** (Vạn Vật Phổ) | sưu tập đủ thẻ/tàn niệm → tick 1 mục Phổ | theo tiến trình Phổ (cực chậm) | điểm chạm power DUY NHẤT, vốn đã tồn tại, không farm nhanh được |

**Chiều NGƯỢC (main → thẻ, 1 chiều VÀO, được phép):** Nguyên Bảo main → mua "Vé Khởi Mộng cao cấp" / reset Vô Tận / mở rương thẻ khởi đầu xịn hơn (premium sink, không hoàn). KHÔNG mang gear/thẻ từ main vào.

**Ngoại lệ duy nhất "assist chậm" (mặc định TẮT):** đổi Mộng Ngân lấy **Nguyên Bảo nhỏ giọt cap ≤60/tuần** hoặc **≤5 nguyên liệu tier-1/tuần**. Qua "ví trung gian có cap tuần" `state.dangTien.bridgeWeek = { weekId, nbClaimed, matClaimed }`, reset theo `weekId = Math.floor(now/WEEK_MS)` (wall-clock, offline-safe, không tua giờ). Đạt cap → thắng tiếp chỉ trả Mộng Ngân nội bộ. **Van chỉ siết, không nới** (nếu thấy người chơi cày thẻ để rút Nguyên Bảo thay cày main → hạ cap, không bao giờ nâng).

## 2.4 Vòng lặp kinh tế (mọi "mạnh thêm" nằm TRONG hệ)

```
Chơi run  →  Mộng Ngân (kể cả thua) + tick codex
   ↓
Mộng Ngân → meta-upgrade (mở phái, mở thẻ pool, slot relic khởi đầu, +HP nền) → mạnh hơn TRONG hệ
          → cosmetic + danh hiệu → KHOE ở main + BXH
   ↓
Mở Sát Cảnh (ascension) cao hơn → thưởng nhiều hơn → vòng xoáy lên
   ↓ (van bridge, cap tuần, mặc định tắt)
Nguyên Bảo nhỏ giọt
```

**Con số mẫu bridge (DRAFT, tham số mở `KYMONG_NB_WEEK_CAP`/`KYMONG_MAT_WEEK_CAP`):** Nguyên Bảo cap 60/tuần (so với vài chục–vài trăm/đột phá → "gia vị"), nguyên liệu tier-1 cap 5/tuần. Cosmetic + danh hiệu không cap (vô hại cân bằng).

## 2.5 Guard-rail kỹ thuật cách ly

- `deriveCombat`/`gearBag`/`stats.js` **TUYỆT ĐỐI không import `state.dangTien`** — comment chốt đầu file engine như `tongmon.js`.
- **Verify grep:** `grep -nE 'deriveCombat|gearBag|state\.combat|state\.equipment|state\.stats|addSkillXp|addStatXp' src/engine/kymong.js src/data/kymong.js` → **phải 0 kết quả** (trừ comment).
- **Test xóa state:** xóa `state.dangTien` → game chạy bình thường (combat/loot không đổi).
- **Test 1 chiều:** thắng 100 run → `gearBag`/`deriveCombat()` output KHÔNG đổi.
- Danh hiệu cộng chỉ số phải đi qua `titles.js` (1 nguồn power đã kiểm soát), KHÔNG bonus riêng trong `state.dangTien`.

---

# MỤC 3 — HỆ THẺ & LUẬT ĐẤU

## 3.1 Khuyến nghị engine — DÙNG ENGINE RIÊNG

Viết `engine/kymong.js` thuần (như `luanvo.js`/`tongmon.js`), **KHÔNG** dùng `stepFight` của `votong.js`:
1. Trục thời gian khác hẳn (auto-battler real-time `gauge += spd` vs theo-lượt người-chơi-chủ-động, tài nguyên Khí/lượt).
2. Khái niệm không khớp (block reset/lượt, intent, draw/discard/hand, cost Khí — votong không có).
3. Cách ly là yêu cầu cứng (dùng `deriveCombat` để lấy atk → rò gear main vào hệ phụ).

**Tái dùng (đồng bộ thế giới quan, không phải cơ chế):** `NGU_HANH`/`heInfo`/`heName` (màu/Hán/badge), **`nguHanhMod(atkHe, defHe)` giữ NGUYÊN +30%/−20%** (KHÔNG tự định nghĩa `KHAC` như prototype), `MON_PHAI` + `port_master_*`, mẫu `TAM_PHAP_POOL`, `TIER_STYLE`/`TIER_ORDER` (màu bậc thẻ), mẫu `ensureX` của `tongmon.js`.

**File:** `src/data/kymong.js` (CARD_POOL, HEROES, ENEMIES, RELICS, ACTS, FACTIONS — data thuần) + `src/engine/kymong.js` (engine trận, `startRun/startBattle/playCard/endTurn/pickReward/nextFloor` — deterministic).

## 3.2 Cấu trúc 1 THẺ (data schema)

```js
{
  id:'laHan', name:'La Hán Quyền', han:'羅', art:'book_la_han_quyen',
  he:'kim', phai:'thieuLam', loai:'cong',   // cong|thu|ky|tamphap|tuyethoc|dot
  cost:2, bac:'so',                         // so|trung|cao|tuyet (màu viền TIER_STYLE)
  upg:0,
  eff: {                                    // gói trong eff{} để nâng cấp "+" dễ, log gọn
    dmg:11, hits:1, blk:0, heal:0, healPct:0,
    poison:0, weaken:0, str:0, dodge:0, stun:0,
    drainPct:0, draw:0, energy:0, pen:0,    // pen = xuyên Hộ Thể địch
    chain:null,                             // nối chiêu
  },
  effUpg:{ dmg:15 },                        // override khi upg=1 ("+")
  keywords:['Phá Giáp'], exhaust:false,
  desc:'Thiếu Lâm · Gây {dmg} ST. Phá 30% Hộ Thể địch.',  // {token} điền từ eff
  flavor:'La Hán phục ma, một quyền trấn sơn môn.',
}
// instance trong tay: mk(id) => ({ uid:++_uid, id, ...cardById(id) })  ← uid cho :key Alpine
```

So prototype (hiệu ứng phẳng rải trên thẻ): gom `eff{}` để (a) "+" chỉ override `effUpg`; (b) số trong `desc` qua token `{dmg}` tự cập nhật theo upg; (c) engine duyệt 1 vòng `eff`.

## 3.3 Hai loại thẻ

**(a) Thẻ CHIÊU** (võ công, từ `book_*`) — 6 `loai`: `cong` (gây ST), `thu` (+Hộ Thể), `ky` (hồi/rút/buff/khống chế), `tamphap` (KHÔNG vào tay — nội công nền chọn đầu ván), `tuyethoc` (bậc cao/tuyet, thường exhaust, uy lực lớn), `dot` (thẻ-rác địch nhét vào: chiếm chỗ, cost cao vô dụng).

**(b) Thẻ HERO / NHÂN VẬT — CÓ, điểm nâng cấp rõ nhất vs prototype.** Đầu mỗi run chọn 1 Hero (chân dung `port_master_*` / huyền thoại). Hero KHÔNG vào tay — là **khung run**: quyết HP nền, Khí nền, Tâm Pháp khởi đầu, **passive**, **1 thẻ signature** thêm vào bộ.

```js
{ id:'thieuLam', name:'Phương Trượng Thiếu Lâm', he:'kim', port:'port_master_thieu_lam',
  phai:'thieuLam', maxHp:62, baseKhi:3, tamPhap:'cuongKim', signature:'laHan',
  passive:{ id:'kimCang', name:'Kim Cang Bất Hoại', desc:'Hộ Thể dư cuối lượt giữ lại 30%.' },
  unlock:{ mongNgan:0 } }
// hero mở sau (huyền thoại):
{ id:'dongTa', name:'Đông Tà Hoàng Dược Sư', he:'moc', port:'legend_dong_ta',
  maxHp:54, baseKhi:4, tamPhap:'thanhMoc', signature:'amKhi',
  passive:{ id:'bichHai', name:'Bích Hải Triều Sinh', desc:'Lượt đầu mỗi trận rút thêm 2 lá. Độc gây ra +25%.' },
  unlock:{ mongNgan:5000 } }
```

Hero biến mỗi run từ "cùng 1 Đạo Hữu" thành **chọn nguyên mẫu** (lì/combo/độc/bạo) → tăng replay mà vẫn cách ly (chỉ ảnh hưởng TRONG run). *("Đồng hành" Linh Thú — reuse art pet, mỗi N lượt tự đánh/đỡ — là tùy chọn nâng cao đợt sau, không bắt buộc MVP.)*

## 3.4 Khung lượt (nâng từ prototype)

**Lượt người chơi:**
1. **Đầu lượt:** Hộ Thể về 0 (trừ passive giữ lại), nạp Khí về max, rút tới đủ tay (mặc định 5 lá), giảm cooldown nối-chiêu, tick regen Tâm Pháp.
2. **Thi triển:** chơi thẻ chừng nào còn Khí; mỗi thẻ trừ `cost`, áp `eff`.
3. **Kết Lượt:** bỏ tay (trừ `retain`) → Độc tick lên địch → địch hành động theo intent → tính choáng/chết → lượt mới.

- **Khí:** nền 3 (hero điều chỉnh; Đông Tà 4). Tăng tạm qua `eff.energy`/relic; tăng vĩnh viễn trong run qua relic "Đan Điền Khoách Trương" (+1 Khí nền). **Khí dư KHÔNG cộng dồn** (trừ relic "Tụ Khí Quyết" giữ tối đa 2).
- **Hộ Thể:** reset 0 mỗi đầu lượt (passive giữ lại). Chặn ST trước, tràn mới vào HP. **Xuyên Hộ (`pen`):** bỏ qua % block.
- **Rút/bỏ/xáo:** tay tối đa 10 lá (rút quá → cháy vào discard). Cạn chồng rút → xáo discard thành chồng rút. Bỏ hết tay khi Kết Lượt (trừ `retain:true`). **Exhaust:** dùng xong rời trận hẳn.
- **Ngũ hành khắc:** `nguHanhMod(card.he, enemy.he)` +30%/−20%, **áp PER-HIT** cho multi-hit. `he:'vatly'`/`he:'buff'` miễn khắc/kháng (thẻ gỡ thế bị kháng).

**Thứ tự tính sát thương 1 đòn (cố định để cân bằng):**
```
ST = round( (dmg_base + str)              // Lực CỘNG PHẲNG mỗi đòn (chống multi-hit phình)
            × (1 + heMod)                 // khắc +0.30 / kháng −0.20 / 0
            × (1 + tamPhapHeBonus)        // Tâm Pháp cùng hệ +20%
            × (bạo ? critDmg : 1) )       // Bạo Kích
          − block_địch (sau pen)
```

**Bảng scaling chuẩn (soạn thẻ mới nhất quán):**

| Bậc | ST 1-Khí | ST 2-Khí | Hộ Thể 1-Khí | Ghi chú |
|---|---|---|---|---|
| Sơ | 5–6 | 9–11 | 8–9 | đòn nền |
| Trung | 7–9 | 11–14 | 11–14 | kèm 1 trạng thái |
| Cao | — | 14–18 | 16–20 | kèm 2 hiệu ứng / exhaust |
| Tuyệt | — | 18–24+ | — | thường exhaust, đổi cục diện |

## 3.5 Ý đồ địch (Intent) — 10 kiểu, báo trước (icon SVG + màu)

| `t` | Nhãn báo trước | Hành vi khi Kết Lượt |
|---|---|---|
| `atk` | "Đánh {v}" / "{v}×{hits}" | gây ST (trừ Né/Block) |
| `def` | "Vận Hộ Thể {v}" | địch +block |
| `buff` | "Tăng Lực +{v}" | địch +str |
| `charge` | "Vận Công… (đòn mạnh)" | bỏ lượt, intent kế là đòn lớn |
| `heal` | "Điều Tức +{v}" | địch hồi HP |
| `debuff` | "Gieo Nội Thương" | nhét 1 thẻ-rác `dot` vào discard ta |
| `poison` | "Phun Độc {v}" | gieo Độc lên người chơi |
| `drain` | "Hấp Khí {v}" | đánh {v} + hồi HP địch = ST gây |
| `multiBuff` | "Tụ Lực + Hộ" | địch +str và +block (mini-boss) |
| `unknown` | "Ý đồ khó lường" | boss giấu intent 1 lượt (chỉ boss cuối) |

Mỗi địch có mảng `intents[]` lặp vòng (`intentIdx`); boss dùng intent có điều kiện (HP<50% → pha 2).

## 3.6 Bộ trạng thái đầy đủ (15 status — icon SVG/Hán, KHÔNG emoji)

| Trạng thái | Lên ai | Cơ chế | Giảm | Màu |
|---|---|---|---|---|
| **Độc** (Mộc) | địch/ta | đầu Kết Lượt mất `n` HP (xuyên block), rồi `n−1` | −1/lượt | emerald |
| **Bỏng** (Hỏa) | địch | mất `n` HP/lượt cố định, `ticks` lượt | hết ticks | orange |
| **Suy Yếu** | địch | địch gây ST ×(1−25%) | −1/lượt | violet |
| **Lực** (str) | ta/địch | mỗi đòn +`n` ST phẳng, bền cả trận | — | amber |
| **Né** | ta | né hoàn toàn đòn kế (1 hit) | dùng là hết | cyan |
| **Bạo Kích** | ta | xác suất đòn ×critDmg (nền 0%, nâng qua Tâm Pháp Kim) | — | gold |
| **Choáng** | địch | bỏ nguyên lượt hành động | 1 lượt | yellow |
| **Phong Ấn** | địch | không dùng tuyệt kĩ/skill `n` lượt | −1/lượt | sky |
| **Hồi** | ta | +`n` HP đầu mỗi lượt, `ticks` lượt | hết ticks | jade |
| **Giáp Bền** | ta | Hộ Thể không reset lượt sau (1 lần) | dùng là hết | sky |
| **Tụ Khí** | ta | +1 Khí lượt sau | dùng là hết | cyan |
| **Yếu Giáp** (vuln) | địch | nhận ST +30% `n` lượt | −1/lượt | rose |
| **Nội Thương** | ta | thẻ-rác `dot` trong tay: cost cao, vô dụng | cần thẻ tẩy | slate |

*(MVP đóng băng ở 8 trạng thái prototype có sẵn: Độc/Suy Yếu/Lực/Né/Hút máu/Multi-hit/Rút bài/Hộ Thể; mở rộng các status còn lại theo pha relic/boss — quy tắc "thêm 1 bỏ 1" để giữ trần.)*

## 3.7 Tâm Pháp (nội công nền — chọn đầu ván)

Reuse 5 Tâm Pháp `TAM_PHAP_POOL` (đồng bộ tuyệt đối main), dịch sang ngôn ngữ thẻ:

| Tâm Pháp | Hệ | Hiệu ứng trong thẻ |
|---|---|---|
| Viêm Dương Quyết | Hỏa | thẻ Hỏa +20% ST; thẻ đầu mỗi lượt +1 ST |
| Huyền Băng Chân Kinh | Thủy | thẻ Thủy +20% ST; +8 HP nền; +2 Hộ Thể mỗi thẻ Thủ |
| Thanh Mộc Trường Sinh | Mộc | thẻ Mộc +20% ST; đầu lượt hồi 2 HP; Độc +1 tick |
| Cương Kim Quyết | Kim | thẻ Kim +20% ST; +10% Bạo Kích nền, bạo ×1.9 |
| Hậu Thổ Trấn Nhạc | Thổ | thẻ Thổ +20% ST; Hộ Thể cuối lượt giữ 50%; Choáng dễ hơn |

Hero quyết Tâm Pháp khởi đầu; người chơi **đổi được** ở màn chuẩn bị (đồng triết lý "Tâm Pháp đổi được" của main).

## 3.8 Chiều sâu

**Combo cùng môn phái (Hợp Bích):** chơi ≥2 thẻ cùng `phai` trong 1 lượt → kích hiệu ứng phái (Thiếu Lâm: thẻ thứ 2+ +4 Hộ Thể; Đường Môn: Độc gieo trong lượt +2 tick; Hoa Sơn: thẻ Công thứ 2+ +3 ST & +5% bạo; Võ Đang: giữ toàn bộ Hộ Thể sang lượt; Hỏa phái: hút máu +15%). Khuyến khích bộ "theo phái" nhưng không ép. Viền thẻ glow tĩnh màu phái + log "〈Hợp Bích〉".

**Nối chiêu (Chain):** `eff.chain={ after:'hanBang', bonus:{...} }` — chơi thẻ ngay sau thẻ chỉ định trong cùng lượt → cộng hiệu ứng (vd Hàn Băng làm chậm → Liệt Hỏa ngay sau +50% ST). Engine giữ `lastCardId`.

**Độ hiếm & nâng cấp:** bậc dùng `TIER_STYLE` (Sơ xám / Trung lam / Cao hổ phách-glow / Tuyệt tím-glow). Giữa ải có thể "Rèn 1 thẻ" → bản "+" (`effUpg`, mỗi thẻ +1 lần). "Xóa 1 thẻ" (deck-thinning, gỡ thẻ yếu/thẻ Nội Thương).

**Giới hạn bộ:** khởi đầu 10 thẻ; không trần cứng nhưng soft-cap (bộ >25 thẻ → cảnh báo loãng); tối đa 2 thẻ bậc `tuyet`/bộ.

## 3.9 8–10 thẻ mẫu (số thật, map `book_*`)

```js
export const CARD_POOL = {
  coBanKiem:{ id:'coBanKiem', name:'Cơ Bản Kiếm', han:'劍', art:'book_co_ban_kiem',
    he:'vatly', phai:null, loai:'cong', cost:1, bac:'so', eff:{dmg:6,hits:1}, effUpg:{dmg:9},
    desc:'Gây {dmg} ST (miễn khắc/kháng ngũ hành).' },
  coBanQuyen:{ id:'coBanQuyen', name:'Cơ Bản Quyền', han:'拳', art:'book_co_ban_quyen',
    he:'vatly', phai:null, loai:'cong', cost:1, bac:'so', eff:{dmg:5,blk:3}, effUpg:{dmg:5,blk:5},
    desc:'Gây {dmg} ST · +{blk} Hộ Thể.' },
  tichTa:{ id:'tichTa', name:'Tịch Tà Kiếm', han:'辟', art:'book_tich_ta_kiem',
    he:'kim', phai:'nhatNguyet', loai:'cong', cost:2, bac:'trung', eff:{dmg:3,hits:3}, effUpg:{dmg:4,hits:3},
    keywords:['Đa Đòn'], desc:'Đánh 3 đòn × {dmg} ST (mỗi đòn tính khắc/Hộ Thể riêng).' },
  thaiCuc:{ id:'thaiCuc', name:'Thái Cực Quyền', han:'極', art:'book_thai_cuc_quyen',
    he:'tho', phai:'voDang', loai:'thu', cost:1, bac:'trung', eff:{blk:9}, effUpg:{blk:13},
    desc:'+{blk} Hộ Thể. (Hợp Bích Võ Đang: giữ Hộ Thể sang lượt sau.)' },
  amKhi:{ id:'amKhi', name:'Đường Môn Ám Khí', han:'暗', art:'book_duong_mon_am_khi',
    he:'moc', phai:'duongMon', loai:'cong', cost:1, bac:'trung', eff:{dmg:3,poison:4}, effUpg:{dmg:3,poison:6},
    keywords:['Độc'], desc:'Gây {dmg} ST · gieo Độc {poison} (xuyên Hộ Thể, giảm dần).' },
  hanBang:{ id:'hanBang', name:'Hàn Băng Chưởng', han:'寒', art:'book_hoa_son_kiem',
    he:'thuy', phai:'hoaSon', loai:'ky', cost:1, bac:'trung', eff:{dmg:4,weaken:2}, effUpg:{dmg:4,weaken:3},
    keywords:['Suy Yếu'], desc:'Gây {dmg} ST · địch Suy Yếu {weaken}.' },
  hapTinh:{ id:'hapTinh', name:'Hấp Tinh Đại Pháp', han:'吸', art:'book_hap_tinh_dai_phap',
    he:'moc', phai:'maGiao', loai:'tuyethoc', cost:2, bac:'cao', eff:{dmg:7,drainPct:1.0}, effUpg:{dmg:9,drainPct:1.0},
    keywords:['Hút Máu'], desc:'Gây {dmg} ST · hồi HP = TOÀN BỘ ST gây ra.' },
  cuuDuong:{ id:'cuuDuong', name:'Cửu Dương Thần Công', han:'陽', art:'book_cuu_duong',
    he:'hoa', phai:null, loai:'ky', cost:2, bac:'cao', eff:{heal:7,blk:4,str:1}, effUpg:{heal:10,blk:6,str:1},
    keywords:['Hồi'], desc:'Hồi {heal} HP · +{blk} Hộ Thể · +{str} Lực.' },
  thanhPhong:{ id:'thanhPhong', name:'Thanh Phong Bộ', han:'風', art:'book_thanh_phong_bo',
    he:'moc', phai:null, loai:'ky', cost:0, bac:'so', eff:{draw:2,energy:0}, effUpg:{draw:2,energy:1},
    keywords:['Rút'], desc:'Rút {draw} lá. (Bản +: thêm +1 Khí.)' },
  datMa:{ id:'datMa', name:'Đạt Ma Phục Hổ Trượng', han:'達', art:'book_dat_ma_truong',
    he:'tho', phai:'thieuLam', loai:'tuyethoc', cost:2, bac:'tuyet', eff:{dmg:14,blk:5,stun:0.8}, effUpg:{dmg:18,blk:6,stun:1.0},
    keywords:['Choáng','Phá Giáp'], exhaust:true,
    desc:'Gây {dmg} ST · +{blk} Hộ Thể · 80% CHOÁNG. Dùng 1 lần/trận.' },
};
// Bộ khởi đầu (hero Thiếu Lâm, 10 thẻ): coBanKiem×3, coBanQuyen×2, thaiCuc×2, laHan×1, cuuDuong×1, thanhPhong×1
```

## 3.10 Pseudocode engine (thuần, cách ly)

```js
// engine/kymong.js — THUẦN, KHÔNG import deriveCombat/gearBag
import { nguHanhMod, heInfo } from '../data/votong.js';   // CHỈ luật ngũ hành + màu
export function playCard(f, i){
  const c = f.hand[i]; if(!c || f.khi < c.cost) return;
  f.khi -= c.cost; const E = effOf(c);                    // gộp eff+effUpg theo c.upg
  for(let h=0; h<(E.hits||(E.dmg?1:0)); h++){
    let dmg = E.dmg + f.str;                              // Lực cộng phẳng
    if(c.he!=='vatly'&&c.he!=='buff'){
      dmg *= (1 + nguHanhMod(c.he, f.enemy.he));          // khắc/kháng đồng bộ main
      if(c.he===f.tamPhap.he) dmg *= 1.20;               // Tâm Pháp cùng hệ
    }
    if(Math.random()<f.crit) dmg *= f.critDmg;           // (bản chính: dùng RNG mulberry32 từ f.seed)
    dmg = dealToEnemy(f, Math.round(dmg), E.pen||0);
    if(E.drainPct) heal(f, dmg*E.drainPct);
  }
  if(E.blk) f.player.block += E.blk;
  if(E.poison) addStatus(f.enemy,'poison',E.poison);
  // ... weaken/str/dodge/stun/heal/draw/energy ...
  applySynergy(f, c); applyChain(f, c); f.lastCardId = c.id;
  f.discard.push(...f.hand.splice(i,1));
  if(f.enemy.hp<=0) return winBattle(f);
}
```

---

# MỤC 4 — TIẾN TRÌNH, ROGUELIKE & 15 PHÁI

## 4.1 Format 1 ván = leo 1 "Tầng Lâu" (bản đồ nhánh StS-lite)

```
Một CỤC = leo 1 Tầng Lâu (theme = 1 ngũ hành, xoay vòng theo seed/ngày).
  ┌─ Trùng I  (Ngoại Vi)  : ~4 node-đấu, dễ → boss tiểu (1 chưởng môn)
  ├─ Trùng II (Trung Khu) : ~4 node-đấu, vừa → boss trung (1 huyền thoại làm elite/boss)
  └─ Trùng III(Đỉnh Lâu)  : ~4 node-đấu, khó → ĐẠI BOSS (chưởng môn đỉnh / huyền thoại đỉnh)
```

- Mỗi Trùng = mini-map nhánh, mỗi bước chọn 1 trong 1-3 node kế (cạnh nối sẵn). Cuối Trùng = node Boss bắt buộc.
- **Tổng ~11-14 trận/ván, 12-18 phút.** HP mộng mang theo giữa các trận trong 1 run (điểm roguelike).
- Mỗi Trùng nhuốm 1 ngũ hành chủ đạo (xoay theo seed) → ép xây bộ khắc hệ. Người chơi đọc "dự báo hệ" ở Khởi Mộng để chuẩn bị.

```js
// state.dangTien.run.map = 3 Trùng; node:
{ id:'n_1_2', kind:'dau', x:2, row:1, links:['n_2_1','n_2_2'], enemyId:'daoTac', cleared:false }
// kind: 'dau'(thường) 'tinhAnh'(elite) 'suKien' 'shop' 'nghi' 'kyNgo' 'boss'
```

## 4.2 7 loại node + thưởng

| Node | kind | Nội dung | Thưởng |
|---|---|---|---|
| **Tao Ngộ** (đấu thường) | `dau` | 1 quái thường (gen NPC/yêu thú) | rút 1/3 thẻ + ít Mộng Ngân |
| **Cường Địch** (tinh anh) | `tinhAnh` | quái buff (HP×1.4, +1 cơ chế) | rút 1/3 thẻ bậc cao + 1 Di Vật + Mộng Ngân ×2 |
| **Kỳ Sự** (sự kiện) | `suKien` | popup chọn-mù 2-3 lựa chọn (không đấu) | tùy chọn: thẻ/di vật/HP/Mộng Ngân — có rủi ro |
| **Bí Phổ Lâu** (shop) | `shop` | mua thẻ/di vật/xóa thẻ rác/nâng cấp | trả bằng vàng-trong-run |
| **Tịnh Tâm** (nghỉ) | `nghi` | hồi 30% HP **HOẶC** "Tôi Luyện" 1 thẻ ("+") | — |
| **Kỳ Ngộ** (gặp gỡ) | `kyNgo` | gặp 1 huyền thoại/danh sĩ → tặng thẻ signature/dạy chiêu | thẻ độc nhất / di vật hiếm |
| **Luận Đài** (boss) | `boss` | chưởng môn/huyền thoại | mở khóa meta + Mộng Ngân lớn + Di Vật boss |

Phân bố 1 Trùng: 3-4 `dau`, 1 `tinhAnh`, 1 `suKien`, 1 `shop`/`nghi`, ±1 `kyNgo`, 1 `boss`. Sau mỗi `dau`/`tinhAnh` thắng → màn "Lĩnh Bài" 3-rút-1 (roll theo hệ Trùng + bậc trận) + nút "Bỏ qua + nhận Mộng Ngân".

## 4.3 Di Vật (Relic) — buff cả ván, trần cứng 20

Thay "bí kíp giữa ải" của prototype bằng relic data-driven (event-driven hook):

```js
export const RELICS = {
  huyetNgocPhu:{ id:'huyetNgocPhu', name:'Huyết Ngọc Phù', rarity:'thuong', han:'血',
    desc:'Đầu mỗi trận +5 Hộ Thể.', on:{ battleStart:(f)=>{ f.player.block+=5; } } },
  vienDuongAn:{ id:'vienDuongAn', name:'Viêm Dương Ấn', rarity:'hiem', he:'hoa',
    desc:'Thẻ hệ Hỏa +2 ST.', on:{ cardDmg:(f,ctx)=>{ if(ctx.he==='hoa') ctx.dmg+=2; } } },
  thapDocChau:{ id:'thapDocChau', name:'Thập Độc Châu', rarity:'hiem', he:'moc',
    desc:'Mỗi lần gieo Độc +2 lớp.', on:{ poison:(f,ctx)=>{ ctx.val+=2; } } },
  phaQuanLenh:{ id:'phaQuanLenh', name:'Phá Quân Lệnh', rarity:'suThi',
    desc:'Khí tối đa +1 (4 Khí/lượt).', on:{ static:true } },
};
// Dispatcher: fireRelics(f, evt, ctx) lặp f.relics, gọi RELICS[id].on[evt]?.(f,ctx)
// Điểm bắn: battleStart, turnStart, cardPlayed, dealDmg, dealKhacDmg, enemyKilled, battleWon, hpLost
```

Phẩm chất dùng `TIER_STYLE` (slate/sky/amber/fuchsia). Mỗi ván cầm ~3-6 Di Vật. Boss rơi 1 Di Vật theo hệ phái boss. **Quy tắc chống phình:** relic mới phải tái dùng 1 trong các trạng thái/cơ chế có sẵn; cấm mở cơ chế hoàn toàn mới trừ khi là điểm nhấn 1 boss và đổi lấy bỏ 1 relic khác.

## 4.4 15 môn phái thành nội dung (3 vai)

15 phái = 5 ngũ hành × 3 phái (đúng list đã chốt): **Kim:** Thiên Vương/Thiếu Lâm/Bồng Lai · **Mộc:** Đường Môn/Ngũ Độc/Ma Giáo · **Thủy:** Nga Mi/Hoa Sơn/Thúy Yên · **Hỏa:** Thiên Nhẫn/Cái Bang/Nhật Nguyệt · **Thổ:** Võ Đang/Côn Lôn/Thiên Sơn.

**(a) Mỗi phái = 1 "Faction Deck" (starter deck riêng + 2-3 thẻ signature)** — chọn phái đầu run = chọn thiên hướng. Archetype: Thiên Vương (trọng giáp phản đòn) · Thiếu Lâm (Hộ-Thể-thành-sát-thương) · Bồng Lai (rút bài + né) · Đường Môn (ám khí + Độc DoT) · Ngũ Độc (chồng Độc + kích nổ) · Ma Giáo (Hấp Tinh hút máu) · Nga Mi (hồi + trụ bền) · Hoa Sơn (kiếm combo thẻ rẻ) · Thúy Yên (băng khống chế) · Thiên Nhẫn (Bỏng đốt lan) · Cái Bang (Lực tích lũy) · Nhật Nguyệt (đổi máu lấy bùng nổ) · Võ Đang (Thái Cực phản đòn, Hộ Thể vô hạn) · Côn Lôn (Choáng khóa intent) · Thiên Sơn (băng-thổ bền).

**(b) Mỗi phái = 1 BOSS Chưởng Môn** (Luận Đài) — 15 boss, HP cao + intent đặc trưng phái + 1-2 chiêu signature + gimmick. `enemy.he` cố định → người chơi biết trước hệ để dựng bài khắc.
```js
duongMon_master:{ name:'Đường Môn Chưởng Môn', han:'毒', he:'moc', maxHp:120,
  intents:[{t:'atk',v:8,poison:6},{t:'atk',v:5,hits:3},{t:'buff',v:4},{t:'atk',v:16}],
  gimmick:'Mỗi lượt người chơi bị +2 Độc nếu trên tay >5 thẻ.' }
```

**(c) 9 huyền thoại = elite/boss đỉnh** (Đông Tà/Tây Độc/Lệnh Hồ/Tiểu Long Nữ/Kiếm Vô Danh/Lão Quái/Nữ Sát Thủ/Ma Giáo Chủ/Tô Tinh) — mỗi người 1 gimmick độc đáo (Đông Tà: cứ 3 lượt đổi toàn bộ intent không báo; Tây Độc: mỗi đòn người chơi nhận +3 lớp Độc vĩnh viễn trong trận).

**(d) NPC gen** (m/f × young/mid/old + enemies/) = quái thường node `dau` (roll hệ ngẫu nhiên, intent đơn giản). **(e) 9 dungeon backgrounds** = biome cho 3 Trùng (gán theo hệ Trùng).

## 4.5 Meta-progression (cách ly, 0 power main)

```js
state.dangTien = {
  unlocked:false, mongNgan:0, deepest:0, totalRuns:0, totalWins:0,
  seen:{},                               // codex: tàn niệm + thẻ đã mở (đồng bộ Vạn Vật Phổ)
  ownedCards:[], unlockedPhai:['thienVuong','duongMon','voDang'],  // 3 phái free → mở dần 15
  unlockedRelics:[], startCards:3,
  ascension:0,                           // Sát Cảnh 0..15 (độ khó tăng dần)
  best:{ highestTrung:0, fastestMs:0, winsByPhai:{} },
  cosmetics:{ frames:[], titles:[] },
  assistCd:{}, bridgeWeek:{ weekId:0, nbClaimed:0, matClaimed:0 },
  run:null, ver:1,
};
```

- **Mở phái:** 3 free → 12 còn lại bằng Mộng Ngân (giá tăng 200→2000) hoặc lần đầu hạ chưởng môn phái đó.
- **Mở rộng pool thẻ thưởng / Di Vật khởi đầu / lối Tâm Pháp.**
- **Sát Cảnh (Ascension) 15 bậc** — mỗi lần thắng mở 1 bậc khó: SC1 quái +10% HP · SC3 elite mạnh hơn, ít HP hồi · SC5 bắt đầu với 1 thẻ "thương" · SC7 boss +1 intent · SC10 Khí lượt 1 chỉ còn 2 · SC15 boss đỉnh "phẫn nộ". → content longevity không cần thêm art.
- **Khoe = Mộng Cảnh Bảng** (`pvbTab='kyMong'` trong Phong Vân Bảng) — xếp theo `deepest` + Sát Cảnh + số phái clear, so với bot deterministic (reuse `genRoster`/`bots.js`).

## 4.6 Content volume bản 1 (art gần như đủ sẵn)

| Hạng mục | Số lượng | Nguồn art |
|---|---|---|
| Thẻ Bài | ~45-55 (MVP 18, cap 60) | `book_*` (15) + Hán-tự |
| Môn phái (deck) | 15 | 10 logo `avatars/` + 6 `monphai/` (hệ) |
| Boss chưởng môn | 15 | `avatars/` + `danhsi/` (cần ~5 chân dung mới) |
| Huyền thoại (boss đỉnh) | 9 | `danhsi/` (20 dư dùng) |
| Quái thường/elite | ~25-30 | `enemies/` (32) + npc gen (38) |
| Di Vật | ~20-30 | reuse `items/` + Hán-tự |
| Node sự kiện | ~15 popup | text, 0 art |
| Biome | 9 | `dungeons/` |
| Sát Cảnh | 15 bậc | 0 art |

**Art bắt buộc duy nhất cả lộ trình:** ~5 chân dung chưởng môn còn thiếu (10/15 đã có). Mọi ảnh dùng `<img onerror>` fallback Hán-tự → thiếu vẫn chơi.

---

# MỤC 5 — UI/UX & ART

## 5.1 State-machine 7 màn (1 view, không reload route)

```
[1] SẢNH ─┬─→ [2] SỬA BỘ BÀI
          ├─→ [6] MỘNG PHỔ (codex)
          ├─→ [7] ĐỔI LĨNH NGỘ (shop, currency riêng)
          └─→ [3] BẢN ĐỒ MỘNG (run map) → chọn node
                   ├─ Đấu → [4] MÀN ĐẤU → [5] THƯỞNG → về [3]
                   ├─ Kỳ Ngộ/Nghỉ → modal nhỏ → về [3]
                   └─ Boss → [4] ĐẤU → [5'] TỔNG KẾT RUN → về [1]
```
Transition chéo mềm (fade 180ms + translateY 8px), KHÔNG slide ngang ồn. Container `max-w-[1040px]` desktop, full-width mobile.

## 5.2 Màn Đấu (trái tim) — bố cục desktop ≥768px

```
┌─────────────────────────────────────────────┐
│ [chip tiến trình node] [HP run]   [bỏ chạy?] │
├─────────────────────────────────────────────┤
│ ĐỊCH  [chân dung 88×112]  Tên + Hệ-badge      │
│       ▓▓▓▓▓▓▓░░ HP 38/58  [Hộ 6] ⟪Ý ĐỒ: Đánh 11⟫│ ← Ý ĐỒ nổi nhất
├─────────────────────────────────────────────┤
│ NGƯỜI CHƠI ·Lực+3  ▓▓▓▓▓▓░ HP 42/50 [Hộ 5]   │
│              ●●●○○ Khí 3/5      [Kết Lượt]     │
├─────────────────────────────────────────────┤
│              TAY BÀI (fan/hàng)               │
│   [thẻ][thẻ][thẻ][thẻ][thẻ]   [log 3 dòng]   │
└─────────────────────────────────────────────┘
```

- **Chân dung địch:** `images/enemies/<id>.webp` / `danhsi/*` (object-cover, viền `ring` hệ + glow tĩnh `glowRgb`). Fallback: gradient `grad` hệ + **Hán-tự lớn** (fserif 48px) — pipeline đồng nhất toàn game.
- **Ý đồ (intent)** — đọc-trước cốt lõi, NỔI nhất: "thẻ ý đồ" bo góc, icon SVG (kiếm/khiên/mũi tên/xoáy/chữ thập) + con số to, màu theo loại. "11×2" cho multi. Charge → ring gold pulse tĩnh báo nguy + tooltip "Sẽ gây 22 ST — hãy dựng Hộ Thể".
- **HP bar:** transition .35s + vệt đỏ "ghost" phần vừa mất (250ms). Địch chết → grayscale + scale .96 + Hán "敗".
- **Khí pip:** dãy tròn 15px, pip on gradient cyan glow tĩnh; tiêu Khí → pip tắt dần (opacity, KHÔNG nổ particle).

**Feedback đánh 1 thẻ (~450ms):** (1) nhấc −20px + glow viền hệ; (2) thẻ lao về địch (translate+scale+fade 180ms) vào discard; (3) số ST bay (fserif 28px màu hệ, translateY−28 + scale + fade 600ms); **nếu KHẮC**: số 36px gold + "KHẮC!" + shake nhẹ địch; multi-hit nhiều số lệch 80ms. Thẻ thiếu Khí: `grayscale .6 brightness .62`, click rung-từ-chối + toast "Không đủ Khí".

**Log:** panel mini 3 dòng cuộn, màu theo sự kiện (ta=cyan, địch=rose, hồi=jade, khắc=gold-bold) — đồng bộ "chiến báo màu" combat chính.

## 5.3 Bản đồ Mộng (run map) — SVG node phân nhánh, cuộn dọc

Node 44px vòng tròn + icon Hán/SVG: 戰 (đấu, viền hệ địch) · 銳 (elite, gold) · 緣 (kỳ ngộ, cyan) · 息 (nghỉ, jade) · 市 (shop, violet) · 魔 (boss, rose). Đường đã đi sáng jade, sắp tới gold-pulse TĨNH, khác xám. Node hiện tại glow gold tĩnh + "Bạn ở đây". Thanh trên: HP run, số thẻ, vàng-run, di vật đã nhặt (icon hover). Node Boss preview chân dung thật tạo "đích đến".

## 5.4 Spec thẻ bài (3 cỡ)

| Cỡ | Kích thước | Dùng ở |
|---|---|---|
| Full | 128×182 | tay bài, thưởng, codex |
| Mini | 96×136 | deck builder |
| Thumb | 64×90 | fan preview sảnh |

Layout Full (trên→dưới): phí Khí góc trái-trên (tròn cyan) · gem độ-hiếm góc phải-trên · vùng art 74px (`images/chieu/<id>.webp` hoặc `book_*`, fallback Hán-tự fserif 42px nền `grad` hệ) · tên (fserif) · LOẠI·HỆ · mô tả 2 dòng · thanh hệ 3px đáy thẻ.

**Badge độ hiếm (glow TĨNH):** Phàm slate (không glow) · Tinh sky (glow nhẹ) · Tuyệt gold (glow vừa + hoa văn) · Tuyệt Học violet→gold (glow đậm + Ánh Kim Quét tĩnh, mặc định OFF nếu user thấy động).

## 5.5 Các màn phụ

- **Thưởng giữa trận:** 3 thẻ úp lật mở stagger 120ms (scale-x), chọn 1; +2 lựa chọn Di Vật / Vàng; nút "Bỏ qua" (+HP nhẹ).
- **Tổng kết run:** modal lớn — banner "Đại Thắng!" gold glow tĩnh / "Trọng Thương Bại Trận" rose; bảng thưởng RIÊNG (Mộng Ngân + codex % + cosmetic, count-up số 700ms); badge "Tầng mới"; "Chơi Lại" / "Về Sảnh".
- **Mộng Phổ (codex):** reuse tinh thần Vạn Vật Phổ — lưới thẻ, đã mở rõ + nguồn / chưa mở silhouette + khóa; tiến độ "18/40"; modal chi tiết.
- **Đổi Lĩnh Ngộ (shop):** đổi Mộng Ngân lấy thẻ-mở-pool / di vật khởi đầu / cosmetic; dòng nhắc "Vật phẩm tại đây chỉ dùng trong Đăng Tiên Mộng" (minh bạch cách ly).

## 5.6 Responsive mobile 375px (bắt buộc)

`overflow-x:hidden`, mọi dải số dùng `fmtC` rút gọn, chip cuộn ngang an toàn (bài học header tràn). Sảnh/Builder/Codex/Shop → 1 cột. **Tay bài (khó nhất):** ≤375px thẻ ~92×130 (scale .72), **cuộn ngang** (`overflow-x:auto` snap, KHÔNG fan), gradient mép báo còn thẻ; **tap 1 = nhấc + preview phóng 140%, tap 2 / nút "Thi Triển" = đánh** (tránh đánh nhầm khi cuộn). Khối địch/người nén (chân dung 64×80, HP bar 16px, pip 13px). Nút Kết Lượt + Bỏ chạy gom thanh đáy (thumb-zone). Drawer sidebar (☰) đã có, auto-đóng khi navTo.

## 5.7 Pipeline art + prefs UI

| Thành phần | Nguồn | Fallback |
|---|---|---|
| Art thẻ | `images/chieu/<id>.webp` / `book_*` (reuse 1-1) hoặc mới `images/cards/<id>.webp` 256×160 | `grad` hệ + Hán-tự |
| Chân dung địch/boss | `images/enemies/` `danhsi/` | gradient hệ + Hán intent |
| Icon hệ | `NGU_HANH[he].ig` SVG line | Hán-tự `han` |
| Skin lưng thẻ (cosmetic) | `images/cards/back_*.webp` | hoa văn SVG |

**Prefs bắt buộc:** KHÔNG emoji (đổi `☠ ⛨ ✓ ⟳` prototype → SVG line / Hán-tự); glow TĨNH (`box-shadow`, không vòng xoay — 2 ngoại lệ pulse-nhẹ cho phép: badge "Né đòn kế" + ring charge nguy, vì là *cảnh báo trạng thái*); màu ngũ hành map sang `NGU_HANH[*].glowRgb/text` (KHÔNG hex rời như prototype); **mockup standalone HTML trước khi code** (nâng `cardgame.html` thành 2 màn xương sống: Màn Đấu + Bản Đồ Run, dùng ảnh `chieu/*` + `enemies/*` thật).

---

# MỤC 6 — KỸ THUẬT & TÍCH HỢP & SAVE

## 6.1 Cấu trúc file (bám pattern Tông Môn)

```
src/data/kymong.js     — CARD_POOL, HEROES, ENEMIES, ACTS, RELICS, FACTIONS, hằng cân bằng.
                          THUẦN. ĐƯỢC import { NGU_HANH, nguHanhMod } từ votong.js (chỉ đọc hằng).
src/engine/kymong.js   — Luật đấu (playCard/endTurn/intent), vòng run roguelike, RNG mulberry32,
                          ensureKyMong, save helper. THUẦN. KHÔNG import stats.js/deriveCombat/gearBag.
```

Đồng bộ ngũ hành: `let mult = 1 + nguHanhMod(card.he, enemy.he);` (gồm cả −20% khi bị khắc — prototype thiếu vế này). `NGU_HANH[he].han/text/glowRgb` render màu thẻ thay `HE_COLOR` hardcode.

## 6.2 State shape (root `state`, cloud jsonb tự nuốt)

Xem `state.dangTien` đầy đủ ở Mục 4.5. **Quyết định lưu trữ:** KHÔNG lưu mỗi lá là instance riêng. Deck của run = danh sách `cardId` + level dựng lại từ `ownedCards`/`collection` lúc `startRun`. Run lưu thứ tự pile bằng **mảng cardId** → save nhỏ gọn. `uid` runtime sinh lại khi rehydrate.

## 6.3 RNG deterministic + khôi phục run dở

```js
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
```
Run lưu `seed` + `rngN` (con trỏ số lần đã rút). Rehydrate: `mulberry32(seed)` rồi gọi `rngN` lần để khớp. Lợi: khôi phục run dở chính xác (đóng tab giữa ải → mở lại bốc đúng lá), chống cheat nhẹ, mở đường daily-seed BXH miễn phí về kiến trúc. `kmSave()` ghi sau mỗi hành động có ý nghĩa (đánh 1 lá / kết lượt / nhận thưởng), KHÔNG mỗi animation frame.

```js
run:{ seed, rngN, floor, path:[0,1,3], ascension, hp, maxHp, khi, maxKhi, gold,
      deck:[...cardId], draw:[...], discard:[...], hand:[...], exhaust:[...], relics:[...],
      player:{ block,str,dodge,statuses:{} },
      enemy:{ id,he,hp,maxHp,block,intentIdx,statuses:{},charged } | null,
      phase:'battle'|'reward'|'shop'|'event'|'map', rewardCards:[...], startedAt }
```

## 6.4 Tích hợp main.js / nav.js / index.html

```js
// main.js đầu file:
import { ensureKyMong, startRun, playCard, endTurn, pickReward, nextFloor, kmBuyUnlock, kmClaimRun } from './engine/kymong.js';
import { CARD_POOL, ACTS, RELICS, FACTIONS, HEROES } from './data/kymong.js';
// boot (cạnh ensureTongMon ~dòng 140):
ensureKyMong(state, Date.now());
```
Getters/actions Alpine (cạnh khối `tm*`, cùng pattern `_tick`/`now()`/`Storage.save`): `get km()` → `state.dangTien`; `kmSave()` = `Storage.save(state)`; `get kmHand()` (rehydrate cardId→obj đầy đủ, cache theo `run.hand` để KHÔNG sinh uid mỗi tick); `kmPlay(i)` / `kmEndTurn()` / `kmStartRun()` / `kmPickReward(c)`. `_cgFx` queue xử animation tuần tự (tránh setTimeout lồng race như prototype).

`index.html`: 1 block `<template x-if="view==='dangTienMong'">` + CSS thẻ từ mockup (`.card/.cost/.khi-pip/.card-han`) vào `<style>` chung; responsive 375px.

## 6.5 Enforce cách ly (quan trọng nhất)

| `kyMong` ĐƯỢC | TUYỆT ĐỐI KHÔNG |
|---|---|
| Đọc `NGU_HANH`, `nguHanhMod` (thuần) | Gọi `deriveCombat()` / đọc `state.combat.*` |
| Đọc `state.currencies.nguyenBao/honThach` để TRỪ (chi phí vào, 1 chiều) | Đẩy stat/power vào `gearBag`/`equipment`/`state.stats` |
| Ghi `state.dangTien.*` | `addSkillXp`/`addStatXp` cho người chơi |

Điểm chạm main↔kyMong gom vào **1 chỗ**: `kmBuyUnlock` (chi, 1 chiều VÀO) + `kmClaimRun` (thưởng — CHỈ vào `mongNgan` nội bộ + cosmetic + BXH, KHÔNG ra main). Verify: grep 6.1 = 0; test xóa `state.dangTien` game vẫn chạy; test 100 run không đổi `gearBag/deriveCombat`.

## 6.6 Save / Migration / Cloud / Performance

- **`ensureKyMong`** pattern y hệt `ensureTongMon`: `if(!state.dangTien){...default...}` + backfill từng field (idempotent); migrate run dở qua `run.ver` (không migrate nổi → `run=null` an toàn). Gọi 1 dòng boot. Tự version qua `kyMong.ver`, không đụng `SAVE_VERSION` global.
- **Cloud:** `cloud.js` push nguyên `data: state` jsonb → `state.dangTien` tự đồng bộ, KHÔNG sửa `cloud.js`. Tránh nhồi mảng object lớn vào run (chỉ cardId string).
- **Performance:** xáo bài Fisher–Yates O(n) trên mảng string (≤40 lá, cực nhẹ). Render tay bài: `:key="c.uid"` từ cache `_kmHandCache` chỉ rebuild khi `run.hand` đổi (KHÔNG getter sinh uid mỗi tick — nếu không Alpine re-mount thừa). Hệ KHÔNG idle → `simKyMong` gần no-op (chỉ refresh daily seed/shop nếu có). Gotcha đã biết: backdrop modal `@click.self`; preview headless không chạy CSS transition → verify bằng giá trị đích.

---

# MỤC 7 — LỘ TRÌNH BUILD

## 7.1 Bốn neo chống phình scope

| Neo | Trần | MVP |
|---|---|---|
| Số thẻ (POOL) | ≤60 | 18 |
| Số ải/run | 3→6→9 (≤9) | 3 |
| Số quái | ~24 (tái dùng intent template) | 3 |
| Cơ chế trạng thái | 8→~13 (thêm 1 bỏ 1) | 8 (prototype có sẵn) |

**Ship gate (1 pha xong khi):** (1) chơi trọn run không lỗi console; (2) thắng/thua/save đúng sau F5; (3) ≥2 build khác nhau cùng thắng (test cân bằng tối thiểu); (4) mobile 375px không vỡ.

## 7.2 Các pha

| Pha | Tên | Thẻ | Ải | Art bắt buộc | Công | Verify |
|---|---|---|---|---|---|---|
| **0** | MVP port prototype | 18 | 3 | **0** (Hán-tự) | ~1 ngày | 1 run + save F5 |
| **1** | Nội dung thẻ/quái + harness | 30 | 5 | 0 | ~1.5 ngày | 2 build clear + win-rate 55-70% |
| **2** | 15 Phái + Boss CM (chia 3 lô) | 30 | 5 | **5 chân dung** | ~2-3 ngày | 3 chưởng môn + unlock |
| **3** | Relic + Map nhánh | 30 | 5-7 | 0 (relic Hán-tự) | ~2 ngày | run có nhánh + relic |
| **4** | Meta + Codex + BXH + Polish | →60 | →9 | tùy đợt | ~2-3 ngày | meta unlock + BXH + 375px + glow tĩnh |

**Pha 0 chi tiết:** chuyển ~305 dòng prototype thành module + cách ly state, không thêm cơ chế. Data `data/kymong.js` (18 thẻ + STARTER + 3 STAGES), engine `engine/kymong.js` (THUẦN, `ensureKyMong/startRun/playCard/endTurn/pickReward/mk/shuffle`), state `state.dangTien` vào `createInitialState`, nav item, view block index.html, save free (Storage tự serialize). Verify: vào view → Nhập Mộng → 3 ải → win → F5 `state.dangTien.totalWins===1`.

**Harness cân bằng (pha 1):** `simKyMongAuto(deck, seed)` chơi tự động heuristic (ưu tiên thẻ khắc hệ, đủ Khí), chạy 200 lần đo win-rate (bản thu nhỏ harness `design_combat_balance.md`), đặt devTab. Chốt HP quái / dmg thẻ.

**Thứ tự ưu tiên:** 0→1→2 = xương sống chơi được + có bản sắc (ship được như sản phẩm nhỏ sau pha 2). 3→4 = chiều sâu + giữ chân. Mỗi pha từ 2 trở đi độc lập ship được, dừng đâu cũng trọn vẹn. **Tổng ~9-12 ngày công code** (art song song, chỉ 5 chân dung bắt buộc).

## 7.3 Rủi ro & chặn

| Rủi ro | Chặn |
|---|---|
| Phình thẻ/relic | trần cứng 60/20; mỗi cái mới tái dùng cơ chế có sẵn; bỏ-1-thêm-1; chốt list trước khi gen art |
| Rò power về main | engine THUẦN không import deriveCombat/gearBag; chỉ cosmetic/danh hiệu/Phổ Lực/Mộng Ngân; grep verify = 0 |
| Art nút cổ chai | mọi ảnh `<img onerror>` fallback Hán-tự; chỉ 5 chân dung CM bắt buộc, gen theo lô |
| Cân bằng lệch (1 thẻ OP) | harness 200 run/build từ pha 1; ship-gate ≥2 build cùng thắng |
| index.html 7000+ dòng | logic ở `engine/kymong.js`, index.html chỉ template + binding getter store |

## 7.4 Files tạo/đụng

**Tạo:** `src/data/kymong.js`, `src/engine/kymong.js`.
**Đụng (thêm nhỏ):** `src/engine/state.js` (+field `kyMong` vào `createInitialState`); `src/data/nav.js` (+nav item + VIEW_NAMES); `src/main.js` (+import, +`ensureKyMong` boot ~dòng 140, +getters/actions `km*`); `index.html` (+view block + CSS thẻ + pha 4: tab `pvbTab='kyMong'` Phong Vân Bảng + dev hook devTab).
**Tái dùng (không sửa):** `nguHanhMod`/`NGU_HANH`/`MON_PHAI`/`TAM_PHAP_POOL`/`TIER_STYLE` từ `votong.js`; `genRoster` từ `bots.js` (BXH); `ensureTitles` từ `titles.js` (danh hiệu); `codex.js` (Mộng Phổ nối Vạn Vật Phổ); `Storage.save` (tự persist).

---

# MỞ / CHỜ USER CHỐT

1. **Tên hệ:** chốt **Đăng Tiên Mộng** hay giữ **Luận Bài** (prototype quen tay)? Ảnh hưởng nhãn + view id + tiền tố code (`km*` vs `lb*`). *Khuyến nghị: Đăng Tiên Mộng* (lore "mộng" giải thích cách ly + tránh trùng "Luận Võ").
2. **Currency:** dùng 1 currency (**Mộng Ngân**) cho gọn, hay tách bậc thêm Kỳ Phổ (hard)? *Khuyến nghị: MVP chỉ Mộng Ngân.*
3. **"Assist chậm" về main:** BẬT (Nguyên Bảo nhỏ giọt cap 60/tuần + 5 mat tier-1/tuần) hay TẮT hoàn toàn (cực sạch)? *Mặc định khuyến nghị TẮT, bật khi tune.*
4. **Vị trí nav:** xác nhận nhóm **Chiến Đấu** (dưới Yêu Vương) — hay user muốn nhóm Giang Hồ/Khác? *Khuyến nghị: Chiến Đấu.*
5. **Mở khóa:** Luyện Khí tầng 7 hay mốc khác? Có cần entry phụ deep-link từ Tàng Kinh Các không?
6. **Hero:** làm Hero ngay MVP hay để pha 2 (MVP dùng "Đạo Hữu" chung như prototype, thêm Hero sau)? *Khuyến nghị: Hero vào pha 2 cùng 15 phái.*
7. **Run sim offline:** xác nhận mộng "đứng yên" khi rời máy (không tua giờ) — đúng tinh thần Tông Môn? *Khuyến nghị: đúng, không sim offline.*
8. **Run dở persist:** lưu giữa-trận (khôi phục chính xác qua mulberry32) hay chỉ persist meta (bỏ run khi thoát)? *Khuyến nghị: lưu giữa-trận, đã thiết kế RNG hỗ trợ.*
9. **Mọi số liệu** (HP/dmg/cap/giá unlock/win-rate mục tiêu) = **DRAFT chờ chơi để tune**, đúng tinh thần "mọi số draft" của Tông Môn.

---

**File tham chiếu (tuyệt đối):** `C:\ClaudeProject\TIEUDAO\_mockup\cardgame.html` (prototype) · `C:\ClaudeProject\TIEUDAO\src\data\votong.js` (NGU_HANH/nguHanhMod/MON_PHAI/TAM_PHAP_POOL/TIER_STYLE) · `C:\ClaudeProject\TIEUDAO\src\engine\tongmon.js` + `src\data\tongmon.js` (mẫu cách ly + ensureX) · `C:\ClaudeProject\TIEUDAO\src\engine\luanvo.js` (mẫu engine thuần deterministic) · `C:\ClaudeProject\TIEUDAO\src\engine\bots.js` (genRoster cho BXH) · `C:\ClaudeProject\TIEUDAO\src\engine\titles.js` (danh hiệu thưởng) · `C:\ClaudeProject\TIEUDAO\src\data\nav.js` (chèn view) · `C:\ClaudeProject\TIEUDAO\src\engine\state.js` (createInitialState) · `C:\ClaudeProject\TIEUDAO\src\main.js` (boot + getters) · `C:\ClaudeProject\TIEUDAO\src\cloud.js` (jsonb tự nuốt) · art: `images\martial_arts\book_*.webp` (15 thẻ), `images\portraits\sect_masters\port_master_*.webp` (10 chưởng môn), `images\danhsi\` (20), `images\enemies\` (32), `images\dungeons\` (9 biome), `images\monphai\` (6 logo hệ).