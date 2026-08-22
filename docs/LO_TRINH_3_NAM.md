# Lộ trình ba năm — Tiêu Dao Lục

> Viết 2026-08-17. Nguyên tắc chung: **dựng xong thì đẩy lên live ngay, nhưng ở trạng thái NGỦ.**
> Người chơi không thấy gì cho tới lúc tác giả bật bằng Lệnh Bài.

---

## 1. Năm luật nền

1. **Mỗi tính năng mới ra live phải có một cờ, cờ mặc định TẮT.** Không có ngoại lệ.
2. **Fail closed.** Lỡ tay tạo dòng cấu hình mà quên điền thì tính năng vẫn TẮT, không phải BẬT.
   Đây là luật đã có sẵn ở `su_kien.chi_tac_gia` (mặc định `true` = chỉ tác giả thấy).
3. **Tắt là VÔ HÌNH, không phải hỏng.** Cờ tắt thì cửa vào không mọc ra, nút không hiện, ô không
   trống. Bài kiểm 27 cấm công tắc chết; cờ tắt mà để lại một màn trống là vi phạm chính luật đó.
4. **Danh sách CHO PHÉP, không phải danh sách cấm.** Máy chủ chốt cứng tên cờ hợp lệ, y như
   `mo_khoa_khoa_hop_le` đang làm. Gõ sai tên cờ thì máy chủ từ chối, không âm thầm tạo cờ lạ.
5. **Client đọc một lần rồi đệm vào bản lưu.** Mất mạng vẫn suy ra được, y như `taiSuKien()`.
   Máy chủ mới là hàng rào thật (RLS), cờ ở client chỉ để vẽ.

---

## 2. Bốn loại khoá

| loại | bảng | đã có | dùng cho |
|---|---|---|---|
| Mốc giờ | `su_kien` | ✔ | nội dung theo mùa, có mở có đóng |
| Số mở dần | `mo_khoa` | ✔ | trần cấp, số vòng Trùng Sinh, số ô, số bậc |
| Hệ số | `he_so_may_chu` | ✔ | nhân kinh nghiệm · rơi đồ · giá bán (trần 5) |
| **Cờ bật/tắt** | `tinh_nang` | ✔ | mọi hệ thống mới |

Bảng `tinh_nang` có đúng năm cột: `ma` · `bat` · `chi_tac_gia` · `cau_hinh` jsonb · `cap_nhat`.
Tab **Tính Năng** nằm trong `LB_NHOM` nhóm "Máy chủ", cạnh Mở Khoá.

⚠ `LB_NHOM` và `LB_TIEU_DE` là NGUỒN DUY NHẤT của danh sách tab — thêm mục phải sửa cả hai.

### Chỗ nằm của bộ khoá này

| việc | tệp |
|---|---|
| Danh sách 13 cờ + cờ `daDung` | `src/data/tinhnang.js` |
| Phép suy thuần | `src/engine/tinhnang.js` |
| Cửa duy nhất màn mới phải hỏi | `moChua(ma)` trong `src/main.js` |
| Bảng + luật RLS + nhật ký | `docs/SQL_LENH_BAI_9.sql` |
| Bài kiểm 43 | `_mockup/_covua_wip/_check_tinhnang.mjs` |

Dựng một tính năng mới thì làm đúng ba việc:
1. Bọc mọi cửa vào của nó bằng `moChua('<mã>')`.
2. Đổi `daDung: false` thành `true` trong `src/data/tinhnang.js`.
3. Chạy bài kiểm 43. Nó soi hai chiều: khai `daDung: true` mà không có chỗ đọc là báo đỏ,
   có chỗ đọc mà khai `false` cũng báo đỏ. Đây là thứ chặn công tắc chết.

Không phải sửa SQL. Mười ba mã đã nằm sẵn trong danh sách cho phép của máy chủ.

---

## 3. Đợt 0 — nền (0–3 tháng)

Chưa thêm nội dung nào. Trả nợ và dựng bộ khoá, vì mọi thứ sau đều tựa lên đây.

| việc | vì sao trước |
|---|---|
| ~~Bảng `tinh_nang` + tab Lệnh Bài + hàm `moChua(ma)`~~ **XONG** | không có nó thì mọi đợt sau không ngủ được |
| ~~Đan Điền: 15 công thức Dược Lư + bảng rơi phẩm 6–9~~ **XONG** | 162 ô đang không có đường lấy đan |
| ~~Tông Môn hiện `NaN%`~~ **XONG** | lỗi sản phẩm đang nằm trên live |
| ~~795 chuỗi chưa dịch~~ **XONG** | mỗi đợt mới lại đẻ thêm chuỗi; dọn sớm thì rẻ |
| ~~Chống gian lận: soi chỉ số Đan Điền~~ **XONG** | chỉ số mới chưa có trần, đây là lỗ |
| ~~`san_gia_vp` bổ sung 27 viên đan~~ **XONG** | đan đang bị loại khỏi Sàn vì máy chủ chưa có giá |

**Đợt 0 đã xong.** Bảng `san_gia_vp` nay có 323 dòng: thêm 27 viên đan và 12 vật phẩm sáu lễ
(6 trứng linh thú + 6 món ăn) — nhóm sau cũng đang bị Sàn loại vì bộ sinh chỉ đọc `items.js`
trong khi `sukien.js` tự ghi danh lúc nạp.

Đan chia **hai băng giá**, cắt đúng chỗ nấu/rơi:

| băng | giá sàn | vì sao |
|---|---|---|
| phẩm 1–5 (nấu ở Dược Lư) | `giá NPC + 3` | 0,06–0,25 giờ máy chạy một viên |
| phẩm 6–9 (chỉ rơi) | `giá NPC × 80 + 3` | 37,5–50 giờ máy chạy một viên |

Hệ số 80 là `HS_PHAM.tinhPham` sẵn có — một viên đan rơi ngang một trang bị Hiếm cùng giá NPC.
Đổi mức này chỉ cần sửa `HS_DAN_ROI` trong `src/data/giasan.js` rồi chạy lại `_sinh_bang_gia.mjs`.

⚠ Kèm theo: tầng 2E của chống gian lận phải cộng **số viên đan mua ròng trên Sàn**
(`dan_mua_san`). Thiếu vế đó thì người mua đan bị ghi sổ từ ô thứ 21 và bị **chặn thật** ở ô thứ 60.

---

## 4. Năm thứ nhất — làm dày cái đang có

Không mở hệ mới. Lấp cho đủ những hệ đã dựng khung.

**4.1 Nội dung chiến đấu** — cờ `noiDungBac2`
- Yêu Vương + Bí Cảnh: tune lại theo số đo thật, thêm bậc khó thứ hai.
- Đan Điền phẩm 6–9 đã rơi thật (6% mỗi lượt, `DD_TI_LE_ROI`); bậc khó thứ hai chỉnh lại tỉ lệ đó.
- Trần cấp mở dần qua `mo_khoa.tran_chuyen` (đã có, trần cứng 10 vòng).

**4.1a Vá năm lỗi Bí Cảnh — đợt 2026-08-19.** Đo thật bằng `runDungeon`, ≥2.000 lượt mỗi ô.
Cả năm đều là lỗi IM LẶNG: không ném lỗi, không cảnh báo, bảng số vẫn xanh.

| Lỗi | Hậu quả đo được | Sau khi vá |
|---|---|---|
| `hazard: 'sinhLuc'` — **không phải Tứ Trụ** (nó là máu ở `state.player`) | Vạn Yêu Sơn Lv85 thông quan **0%** cả ba build | 100% (né giữa/cao) |
| Bộ dựng `def` ở `sukien.js` quên chép `hazard`+`hazardName` | 12/21 phó bản hụt tầng; sáu cái Lv70 **0%**; màn in chữ **"undefined"** | 100%, 0 chữ undefined |
| Cửa `bay` đòi `req+2`, `coDuyen` đòi `req+4`, trần Tứ Trụ là 100 | Thái Hư **bất khả vĩnh viễn** ở hai tầng, ăn không 26,9% máu/lượt | HP còn 3,5 → **40** |
| Khoá `sinhLuc` trong `HAZARD_NAME_BY_STAT` **che** lỗi trên | Khai sai tên vẫn in ra tên đẹp nên nhìn màn không biết | gỡ; sai tên là lộ ngay |
| Bộ sinh trần chống gian lận lấy `loot.exp` **thô** | Engine trả `× RUN.expMul × pace` ⇒ trần hụt **1,5 lần**, người chơi sạch bị ghi sổ | `78.978 → 114.130` |

⚠ Tứ Trụ nằm ở `state.stats` nên **Trùng Sinh KHÔNG với tới** — trần của chúng luôn là `MAX_LEVEL`.
Cửa nào đòi cao hơn là cửa chết. Nay kẹp bằng `tranTuTru()`.
⛔ Ba dòng log Bí Cảnh dùng chữ **"ngươi"** — đã bỏ. Lời chiêu thức của boss thì giữ (lời NPC).
Bài kiểm 15 mở rộng 49 → **69 mục**, kiểm chuẩn **13/13**. **Chạy lại `docs/SQL_CHONG_GIAN_LAN.sql`.**

⚠ **Chiến Lực không ảnh hưởng gì tới Bí Cảnh**: Chiến Lực 2.300 với 202.298 cho 5.000/5.000 lượt
trùng khít. Chỉ Cấp · Né (trần 0,35) · Tứ Trụ có việc. `power` chỉ để hiện lên màn.

**4.1b Tune theo số đo — đợt 2026-08-20.** Chủ dự án chốt ba hướng.

**Yêu Vương khai hệ CỐ ĐỊNH.** Trước đây không con nào khai `he` nên engine bốc ngẫu nhiên mỗi
trận, dù bốn con đã mang sẵn ngũ hành trong tên. Đo: cùng bài Hỏa, boss Kim thắng 98–100% còn boss
Hỏa thắng 0–22%. Nay hai con mỗi hệ, không hai con liền nhau trùng hệ:

| Lv | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 |
|---|---|---|---|---|---|---|---|---|---|---|
| hệ | kim | thủy | kim | mộc | thổ | mộc | hỏa | thổ | thủy | hỏa |

⚠⚠ **Đổi data thôi là KHÔNG ăn.** `bossHe()` có đường bốc riêng và **nhớ kết quả vào bản lưu**
(`state.boss.he[bossId]`), nên bản lưu cũ giữ hệ ngẫu nhiên cũ vĩnh viễn. Nay đọc data trước và dọn
luôn ô nhớ cũ. Vẫn giữ lối lùi bốc ngẫu nhiên cho **12 Yêu Vương sự kiện** chưa khai hệ.

**Thiên Cơ Di Tích Lv92 hạ xuống.** Nó có **ba tầng cửa** (`bay`·`coDuyen`·`bay`) mà không tầng nhẹ
nào ⇒ ở đúng cấp cả ba đều hụt, mất không ~41% máu trước khi gặp boss. Nay còn hai tầng cửa, thêm
`thuong` mở đầu và `kyNgo` — cùng hình dạng với Thái Hư.

| build | trước | sau |
|---|---|---|
| né thấp | 2,5% | **21,4%** |
| né giữa | 8,9% | **69,3%** |
| né cao | 84,6% | **100%** (HP còn 11) |

⚠ Vạn Yêu Sơn Lv85 vẫn 0% ở né thấp — nó không có tầng cửa nào, khó vì **2 tầng tinh anh + boss**.
Đúng chủ đề "nhiều quái", và Né chính là thứ hoá giải. Để nguyên.
⚠ Thái Hư Lv100 nay là phó bản **dễ nhất** trong bốn cái cuối (100% mọi build, HP còn 40) — hệ quả
của việc kẹp trần Tứ Trụ ở 4.1a. Ở `req = 100` không còn dư địa cho tầng cửa làm khó. Chưa xử lý.

Bài kiểm mới **48** `_check_yeuvuong.mjs` (13 mục, kiểm chuẩn **9/9**).

**4.1c 「Nghịch Thiên」 — bậc khó thứ hai, cờ `noiDungBac2`.** CHỈ Bí Cảnh, **MỘT** bậc.
Yêu Vương không thêm bậc: đo được 1,65 trận là hạ một con, 0% ca không hạ nổi — nút chặn của nó
là hồi chiêu chứ không phải tường độ khó.

**HAI NÚM, chỉ hai.** Không đổi `durMs` · `pace` · `cost` ⇒ loot/giờ đúng bằng hệ số nhân.

| núm | làm gì |
|---|---|
| Mốc Tứ Trụ | ba cửa đòi `min(req + 25, 100)` thay vì `req` |
| Đe doạ | tầng đánh và tầng boss cộng thêm 12 bậc |

| loot | hệ số |
|---|---|
| Bạc · EXP · Hồn Thạch · bảng quý | ×1,5 |
| Đồ Phổ (cả ba loại) | ×3 |
| Đan Đan Điền phẩm 6–9 | 6% → **10%** mỗi lượt |
| **Mảnh Trang Bị** | **×1 — không đổi** |

Cửa vào: cấp ≥ `reqLevel` · **đã thông quan bậc thường ít nhất một lần** (`codex.dungeonClears`,
đếm riêng vì `dungeonRuns` tính cả lượt rút lui) · cờ `noiDungBac2`.

⚠⚠ Chế độ **CHỐT LÚC ĐẶT LỊCH** (`state.activity.nghichThien`), không đọc live — một lịch chạy
nhiều giờ, bật/tắt giữa chừng mà đọc live là các lượt đã xong bị tính lại theo mức khác.
⚠⚠ Đan chỉ đổi **TỈ LỆ**, giữ nguyên miền `bcDan` và mỗi lần đúng một viên. Trần 2E neo vào **số
lần bốc** chứ không vào tỉ lệ, nên đổi tỉ lệ là an toàn; đẻ miền mới hoặc thả nhiều viên là chặn
nhầm người chơi sạch.
⚠ Trần chống gian lận `phu_cap_chien_dau`: **114.130 → 166.858**. **Chạy lại `SQL_CHONG_GIAN_LAN.sql`.**

Đo ở người cuối game (cấp 100, Tứ Trụ 100, né tối đa) — cả 9 phó bản đều qua, HP còn lại giảm dần:

| Lv | 10 | 25 | 40 | 55 | 70 | 80 | 85 | 92 | 100 |
|---|---|---|---|---|---|---|---|---|---|
| HP còn (NT) | 88 | 85 | 83 | 85 | 72 | 58 | 22 | 30 | **16** |

⇒ Thái Hư từ phó bản **dễ nhất** (HP 40) thành **chặt nhất** (HP 16). Chỗ tồn ở 4.1b đã hết.
Bài kiểm 15 lên **95 mục**, kiểm chuẩn **28/28**. Không cần art mới: Nghịch Thiên dùng lại trọn
bộ art phó bản sẵn có, công tắc và dải báo đều là khuôn `.dd-dai` / `.dd-tip` đã có.

**4.2 Tông Môn P2 · P3** — cờ `tongMonDrama`
- ~~Nhánh drama đệ tử~~ **ĐÃ DỰNG, ĐANG NGỦ.** Năm hệ của "Đợt 1" trong `docs/THIET_KE_TONGMON.md`:
  - **Đạo Tâm** riêng từng đệ tử (trục Chính ↔ Trung Dung ↔ Tà). 39/53 nút sự kiện gắn `daoTam`.
    Ngả về Tà thì tích Tâm Ma nhanh gấp 1,4 lần; ngả về Chính thì chậm còn 0,6.
  - **Tâm Tình + Nhật Ký**: tâm tình dịch theo kết cục sự kiện rồi nguôi một nửa mỗi 24 giờ,
    đổi tốc tu luyện ±8%. Nhật ký tự sinh ngôi thứ nhất, giữ 8 dòng gần nhất.
  - **Danh Khí**: Gia Bảo uống đủ 40 "linh" thì thức tỉnh, có tên riêng + khung riêng + tiểu sử
    ở Tổ Sư Điện. Sổ linh nằm ở tông, KHÔNG ghi lên món đồ — thu hồi về kho chính là đồ sạch trơn.
  - **Phản Đồ quay lại**: hồ sơ chụp đủ bí kíp + Gia Bảo lúc phản, mỗi ngày lẩn trốn mạnh thêm 5%
    (không quá gấp đôi). Lựa chọn "cử một đệ tử ra đơn đả độc đấu" ở D3 đánh THẬT ở Đài Tỉ Võ.
  - **Tin Từ Giang Hồ** (nhóm X, 4 tin): hạ Yêu Vương · thông quan Bí Cảnh · mở khoá Danh Hiệu ·
    Trùng Sinh. MỘT CHIỀU và thuần flavor — chỉ Uy Danh / Khí Vận / tâm tình, không gì về main.
- ⚠ Dòng cũ ghi "Bí Kíp BK1–BK5 chỉ chờ dựng" là **SAI**: BK1→BK5 đã LIVE từ 2026-06-25.
- Bật bằng Lệnh Bài, tab Tính Năng. Bài kiểm 49 `_check_tongmon_drama` (238 mục, kiểm chuẩn 44/44).

**4.3 Bang Phái có ăn thua** — cờ `bangChien` · **ĐÃ DỰNG, ĐANG NGỦ (2026-08-21)**
- ⚠ Tông Môn = NUÔI · Bang Phái = ĐÁNH. Đừng lẫn hai vai.
- **Dựng theo đúng mockup `_mockup/bangchien.html`** (vẽ 28-07, nằm sẵn trong kho). Không đẻ bản
  mới — đây chính là bài học đắt nhất của Bang Phái: bản thiết kế đã có, đi bịa là mất ba vòng.

**Một trận mỗi tuần.** Tiên Minh tranh MỘT vùng (Đất Tranh) với MỘT bang đối thủ, bày năm cặp
đấu tay đôi, thắng ba cặp là thắng cả trận.

| núm | số |
|---|---|
| số cặp / cần thắng | 5 / 3 |
| khắc ngũ hành | dùng lại `nguHanhMod` của combat: **+30% / −20%**, không chép công thức sang |
| kẹp cửa thắng một cặp | 0,08 – 0,92 |
| nhãn cửa | An Toàn ≥0,62 · Hên Xui ≥0,47 · Hiểm ≥0,33 · Nguy Hiểm |
| thắng | vét `8.000 + cấp địch × 900` Bạc + 2–4 Mảnh + 600 Công Tích + giữ đất **một tuần** |
| thua | bị vét lại **60%** số đó, **kẹp theo Ngân Khố đang có** + 120 Công Tích |
| giữ đất | tính như **hạng nhất** vùng đó ⇒ +10% tốc độ nghề, đúng một tuần |

Cửa vào: đã lập Tiên Minh · đã xây **Diễn Võ Trường** · đủ 4 minh chúng. Nhịp tuần dùng CHUNG
biên với Boss Bang nên hai kỳ rơi cùng lúc.

**Bốn thứ suy từ (seed, kỳ tuần) nên không phình bản lưu**: Đất Tranh · bang đối thủ · năm suất
quân địch · cấp từng suất. Chỉ ba thứ phải lưu: cách XẾP quân, đã KHAI CHIẾN chưa, và SỬ 4 trận.

**⚠⚠ Ba lỗi IM LẶNG bài kiểm báo xanh mà ẢNH CHỤP mới bắt được:**

| lỗi | hậu quả đo được |
|---|---|
| Đất Tranh bốc ĐỀU trong mọi vùng đã mở | người Lv 60 tranh vùng **Lv 1**. Nay bốc trong dải trên (`BC_DAI_VUNG = 40`) |
| cấp quân địch neo vào cấp **người chơi** | minh chúng là bot Lv 100 đấu địch Lv 61 — trận nào cũng thắng dễ. Nay neo vào cấp trung bình CẢ NĂM SUẤT |
| ô chân dung người chơi TRỐNG TRƠN | `state.player.avatar` rỗng khi chưa mua ảnh; engine không biết ảnh mặc định. Nay hỏi `g.avatarId` |

**⚠⚠ Một lỗi im lặng khác do chính bài kiểm bắt:** quân địch bốc trong sổ giang hồ ĐANG SỐNG thì
**đổi mặt giữa tuần** — sổ nở thêm người mỗi chu kỳ nên `roster[h % roster.length]` trỏ sang người
khác, và `botCombatLv` cũng bò theo giờ. Nay dựng thẳng từ bảng tên/chân dung bot rồi **chốt vào
bản lưu** (`bc.dich`).

Bài kiểm mới **50** `_check_bangchien.mjs` (**119 mục**), kiểm chuẩn `_kiemchuan_bangchien.mjs`
**30/30 phép phá bắt đúng chỗ**. Trang soi game thật `_mockup/_bangchien_probe.html`.
Không cần art mới: dùng lại `images/ui/bangphai_banner.webp` + chân dung bot + chip ngũ hành sẵn có.
Bật bằng Lệnh Bài, tab Tính Năng.

**ĐỢT 2 — Cấm Địa + Thương Tích (2026-08-22).** Hai thứ còn lại của mockup, nay đã dựng nốt.

| hệ | luật |
|---|---|
| **Cấm Địa** | Giữ được Đất Tranh thì mở Cấm Địa ở vùng đó. Quặng **của chính vùng đó** tự chảy về Minh Khố, chỉ người trong minh mới có. Mất đất là đóng ngay. |
| **Thương Tích** | Minh chúng thua cặp của mình có **35%** trọng thương, nghỉ **2 ngày**, không ra trận được. ⛔ Người chơi KHÔNG BAO GIỜ bị thương — mất suất của chính mình là mất luôn quyền chơi. |

⭐ Quặng lấy THẲNG từ `SKILLS.thaiKhoang.actions[].zone` — không đẻ bảng thứ hai. Tốc độ neo theo
**tốc độ đào của chính mạch đó** (`BC_CAM_DIA_PHAN = 4%`) nên vùng thấp vùng cao đều cân: đo được
13,21/giờ ở vùng thấp nhất và 1,85/giờ ở vùng cao nhất, gấp 7,2 lần — cùng một bậc.
Dồn tối đa 24 giờ, mốc riêng `bc.mocQ` (KHÔNG dùng chung `mocThu` của `thuSan`: cờ tắt thì hàm này
không chạy mà `thuSan` vẫn chạy, dùng chung mốc là lúc bật cờ sẽ đổ về một cục cả quãng đang tắt).

**⚠⚠ Hai lỗi IM LẶNG bắt được ở đợt 2:**
- **`| 0` trên MỐC MILI-GIÂY** cắt xuống 32 bit: `1785172800000` thành `-1533595136`. Ba chỗ dính.
  Hậu quả: người bị thương vẫn ra trận, và thương tích tự lành ngay lập tức. (`giu` thì `| 0` vẫn
  đúng vì đó là CHỈ SỐ TUẦN, số nhỏ.)
- **Quân địch bị chốt khi minh còn trống.** `ensureBangChien` chốt `bc.dich` ngay lần chạy đầu
  trong tuần, kể cả lúc chưa đủ 5 quân — cấp nền khi đó chỉ là cấp người chơi. **Ảnh chụp máy chủ
  thật của chủ dự án lộ ra: quân ta Lv 41–85 mà quân địch Lv 2–10, cửa thắng 96%.** Nay chưa đủ
  quân thì chưa chốt.

**⚠ Văn phong đợt 1 bị chủ dự án bác.** Sáu chỗ hỏng, sửa hết: chữ **"buff"** (tiếng Anh giữa giao
diện Hán-Việt) · **"0 bỏ"** trong khi thẻ ghi "Nguy Hiểm" (một thứ hai tên) · **"Thắng thì được"**
(câu cụt, không phải tiêu đề) · **"suất"** dùng cho người · **"vét"** (chữ thô) · **"kỳ"** (game
không dùng chữ đó ở đâu khác). Nay: "Thắng Được Gì / Thua Mất Gì" · "an toàn/hên xui/hiểm/nguy
hiểm" đúng tên thẻ · "lấy" · "trận mới sau" · "bấm hai người bên mình".

Bài kiểm 50 lên **153 mục**, kiểm chuẩn **40/40**.

**ĐỢT 3 — TẬP KÍCH (2026-08-22).** Nốt cuối của mục này. Bang Chiến là MỘT trận mỗi tuần, vùng do
máy chọn. Tập Kích là việc làm HẰNG NGÀY: người chơi tự chọn vùng, tự chọn bang, đánh úp để cướp
điểm Chinh Phạt. Nằm ngay trong tab **Chinh Phạt**, ăn theo đúng vùng đang chọn ở Chiến Khu.

| núm | số |
|---|---|
| lượt mỗi ngày | 3 |
| cửa vào | đã lập Tiên Minh · đã xây **Binh Khí Khố** |
| sức bên ta | tổng cấp năm suất quân (dùng lại `bcQuanTa` của Bang Chiến) |
| sức giữ đất | `cấp bang × 18 + số người × 6`, nhân thêm `1 + 6% × số trận đang diễn ra` |
| kẹp cửa thắng | 0,08 – 0,92, đọc bằng **đúng bảng nhãn của Bang Chiến** |
| thắng | cướp `6%` điểm địch ở vùng đó, trần `4.000` một trận + 140 Công Tích |
| thua | mất `40%` số lẽ ra cướp được, **kẹp theo điểm đang có** + 30 Công Tích |

**Điểm CHUYỂN CHỦ chứ không đẻ ra.** Bang AI không có bản lưu — điểm của họ suy từ (hạt giống,
mùa, giờ) — nên phần cướp được ghi vào **sổ trừ** `tk.cuop['<bangId>|<locId>']` rồi trừ ở
`cpConLai`. Mọi cửa dựng bảng hạng phải đi qua đó; bỏ sót một cửa là cùng một bang hiện hai con
điểm khác nhau ở hai bảng. Sang mùa mới thì dọn sổ **cùng lúc** với điểm của mình.

**"Vùng đang có N trận tập kích"** không phải con số trang trí: mỗi trận làm quân giữ đất phòng bị
chặt hơn 6%. Suy từ (hạt giống, vùng, mốc nửa giờ) nên không phình bản lưu.

**⚠⚠ ẢNH CHỤP LẠI BẮT ĐƯỢC THỨ BẢNG SỐ KHÔNG BẮT.** Bản đầu để `TK_SUC_CAP = 26 / TK_SUC_TV = 9`:
cả mười hai bang đều ra thẻ "Hiểm" hoặc "Nguy Hiểm", **kể cả bang yếu nhất** — đánh đâu cũng thua
thì cả màn vô nghĩa. Bài kiểm xanh hết vì không mục nào đòi hỏi một DẢI cửa thắng. Nay 18/6, đo
lại: sức ta 418 thì bang yếu nhất 0,69 (An Toàn), bang mạnh nhất 0,43 (Hiểm). Hai lỗi nhỏ khác
cùng lộ ra từ ảnh: sử ghi **"+0 điểm"** cho trận thua không mất gì (dấu cộng trên số 0 đọc như vừa
được thưởng), và lời cảnh báo **doạ một khoản không bao giờ mất** khi chưa có điểm ở vùng đó.

**⚠ Kiểm chuẩn bắt 4 mục bài kiểm RỖNG.** Bốn mục chạy bằng một hạt giống bất kỳ, trận đó THUA nên
sổ trừ vốn đã rỗng — mục báo xanh mà không đo được gì. Nay chốt sẵn `HAT_THANG`/`HAT_THUA` và dùng
chung cho mọi mục đòi hỏi "có cướp được điểm". Cùng một lớp bẫy với `if (thắng) {...} else {...}`.

Bài kiểm 50 lên **221 mục**, kiểm chuẩn **57/57**. Trang soi `_mockup/_tapkich_nhin.html`.

**4.4 Kinh tế** — cờ `sanThuMua`
- ~~Sàn thêm Thu Mua (buy-order)~~ **ĐÃ DỰNG, ĐANG NGỦ.** Bảng `san_thu_mua` + bốn hàm
  `san_thu_mua_dat` · `_huy` · `_ban` · `_thu_hoi` ở `docs/SQL_SAN_THU_MUA.sql`. Bật bằng Lệnh Bài,
  tab Tính Năng.
  - Bạc ký quỹ trừ ngay lúc đặt đơn; gỡ đơn hoàn phần chưa khớp. Bất biến `ky_quy = gia × so_con`.
  - Khớp MỘT PHẦN, giá là giá **mỗi cái** (Treo Bán là giá cả lô). Trần 10 đơn, ký quỹ gộp 5.000.000 Bạc.
  - Đơn thu mua cũng phải theo giá sàn `san_gia_vp` — thiếu chốt này là cửa sau đi vòng qua bảng giá.
  - Chỉ nhận hàng xếp chồng. Trang bị có dòng roll mà giá sàn không đọc dòng roll, nên đặt đơn
    mua trang bị là bốc thăm một chiều.
  - ⚠⚠ Mỗi lần khớp **ghi một dòng đã xong vào `san_rao`**. Nhờ đó `dan_mua_san` của tầng 2E đếm
    đúng và **không phải sửa `SQL_CHONG_GIAN_LAN.sql`**. Bỏ dòng ấy là người gom đan qua đơn thu
    mua bị chặn thật ở ô thứ 60. Bài kiểm 46 giữ ràng buộc này.
  - Hạn đơn **48 giờ**, tách làm hai nửa. Đơn quá hạn thôi khớp đúng giờ — chốt nằm trong
    `san_thu_mua_ban`. Bạc ký quỹ về túi ở lần chủ đơn mở Sàn kế tiếp — `san_thu_mua_thu_hoi`.
    Ghi bản lưu của ai thì phải đợi người ấy online, nên nửa sau không thể đúng giờ được.
  - Số 48 chỉ gõ cứng **một chỗ**: hàm `san_tm_han()`. Bên JS là `SAN_TM_HAN_MS`, bài kiểm 46 so
    hai con số với nhau.
  - **Sổ khớp cho chủ đơn**: bảng "Đã Nhận" hiện từng lô hàng, nguồn là `san_rao` lọc tiền tố `tm:`.
  - Chưa làm: chủ đơn không được báo lúc có hàng về (chưa nối vào hệ thông báo).

**4.4a An toàn Sàn — đợt 2026-08-19.** Hai lỗ vá cùng lúc, cả hai đều có sẵn từ trước.
- **Quyền RPC**: `docs/SQL_KHOA_CUA_RPC.sql` thu hồi `EXECUTE` của bốn hàm `security definer`
  **nhận uid làm tham số** (`san_ghi_save` · `san_doc_save` · `san_doc_save_khoa` · `dan_mua_san`).
  PostgreSQL mặc định cấp `EXECUTE` cho `PUBLIC` ⇒ **mặc định là MỞ**. Từ nay viết hàm nhận uid
  làm tham số thì đặt `revoke` ngay dưới lệnh `create`.
- **Giao dịch nửa sống nửa chết**: bảng `saves` có nhiều chốt BEFORE; hai chốt chạy đầu
  (`a_bao_tri`, `a_khoa_tai_khoan`) trả `null` = **bỏ lệnh ghi im lặng** và **không** đọc cờ miễn
  trừ `app.san`. Mà `san_rao` · `san_so` · `san_thu_mua` không có chốt nào nên sổ vẫn commit.
  ⇒ Treo bán lúc bảo trì thì tin lên Sàn mà **món vẫn nằm trong túi**.
  Vá **hai lớp**: `san_ghi_save` đếm `row_count`, 0 dòng thì `raise` để **cuốn ngược cả giao dịch**
  (lớp này bắt được cả chốt chưa ai nghĩ ra); và `san_ghi_duoc(uid)` cho 11 chỗ ghi từ chối sớm
  bằng `san-tam-dong`, hai chỗ khớp hai bên còn soi cả bên kia.
- Bài kiểm 46: 116 → 146 mục, kiểm chuẩn **55/55**.

- Thêm chỗ tiêu Bạc: Động Phủ bậc cao, phí bang, đúc lại dòng roll.

**4.4b Thỉnh Kinh** — cờ `thinhKinh`
- Màn ngày: phái Hộ Kinh Sứ áp tải kinh thư, cướp đoàn bot trên đường mây.
- ⚠ Mã cờ này **ngoài lộ trình gốc** — đã thêm vào chốt `tinh_nang_ma_hop_le`, phải chạy lại
  `docs/SQL_LENH_BAI_9.sql`.
- Thiết kế + số: [THIET_KE_THINH_KINH.md](THIET_KE_THINH_KINH.md) · art: [ART_THINH_KINH.md](ART_THINH_KINH.md).

**4.5 Vạn Vật Phổ chốt số** — cờ `phoLuc` · **ĐÃ CHỐT 2026-08-20**
Đo thật: **7 phổ** (tài liệu cũ ghi 5), **417 ô**. Số cũ hỏng theo **hai chiều cùng lúc**.

| chỉ số | Vạn Vật Phổ chiếm ngân sách sức mạnh (trước) |
|---|---|
| Công · Thủ · Sinh Lực | **58–59%** |
| Né Tránh | **78%** |

Lớn hơn **bốn nguồn kia cộng lại** 1,37–1,43 lần. Mà phân bổ còn hỏng nặng hơn: bốn phổ ngưỡng = 1
tự chúng cho `allPct` **+35%** gần như miễn phí, còn Vật Phẩm + Yêu Thú đòi **5,55 năm** ở trần
14 giờ/ngày (neo dự án: 577 giờ cho trọn hành trình lên cấp 100).

**Chốt: cắt sâu + đổi hình đường thưởng.** Thay mốc "trọn bộ" bằng **thang mốc 25/50/75/100%**.

| | trước | sau |
|---|---|---|
| atkPct | +9,90% | **+4,95%** |
| defPct | +26,60% | **+9,87%** |
| hpPct | +15,60% | **+6,85%** |
| allPct | +56,60% | **+16,30%** |
| xong 75% mọi phổ cầm được | 20% | **68%** |
| xong 90% | 23% | **85%** |
| ngưỡng Vật Phẩm | 10.000 | **500** |
| ngưỡng Bí Cảnh | 100 | **50** |

Ngang hàng Đan Điền trọn lưới (+27,4%). `codexBonus()` chạy thật khớp đúng bảng.

**Bốn lỗi im lặng đã vá:**
- **19 ô bất khả** trong Vật Phẩm Phổ (18 ô Đồ Phổ `dpset_`/`dpchieu_` mang type `'khac'` lọt vào
  `VATPHAM_TYPES` mà engine cố ý không thả bản đã có, cộng `khoangPhuLinhThach` không có đường thả
  nào) ⇒ mốc 100% vĩnh viễn không ai chạm. **156 → 137 ô.**
- **Danh Sĩ Phổ khoá vĩnh viễn** khi danh sĩ tạ thế: truyền nhân mang id `<gốc>:g1` mà ô phổ đòi id
  gốc. 13/20 tạ thế trong ba năm. Nay `openDanhSi` ghi **id GỐC**.
- `MANH_SOURCE` vẫn mời người chơi đi cày **quái Lv 90+** — lối đã đóng từ 03-08.
- Modal Hiệu Ứng in **"+0%"** trong khi header in "+0,4%" (`Math.round` nuốt số nhỏ).

⚠ Neo Mảnh cũ SAI: tài liệu ghi "420 Mảnh = 26 ngày" (đòi 16,15 Mảnh/ngày) mà trần đo được chỉ
**13,00 Mảnh/ngày** ⇒ trọn Bách Trang Các là **498 ngày**, không phải 286. Đã sửa theo số đo.
⚠ Cờ `phoLuc` là **công tắc chết** — không chỗ nào đọc `moChua('phoLuc')`. Nhưng chết trung thực:
`daDung: false` khớp thực tế nên bài kiểm 43 vẫn xanh. Màn Vạn Vật Phổ **mở cho mọi người**, nên
chốt số ở đây là thay đổi người chơi NHÌN THẤY.
⚠ **THIẾU ART: `images/enemies/batDietKimCang.webp`** — 416/417 ô còn lại đều có art thật.
Trang soi mới `_mockup/_vanvatpho_probe.html` (8 phép đo trong game thật).

## 5. Năm thứ hai — người chơi gặp nhau

**5.1 Đấu trường** — cờ `dauTruong` · **ĐÃ DỰNG, ĐANG NGỦ (2026-08-22)**
- PvP không đồng bộ: đánh với BẢN CHỤP bộ chiến đấu của người khác, không cần hai máy cùng lúc.

**⚠ Chỗ tài liệu này ghi thiếu:** bảng `ho_so_cong_khai` cũ **không mang bộ chiến đấu** — nó chỉ
có `ten · tong_cap · chien_dau · chien_luc · avatar · danh_hieu · trung_bay`. "Bản chụp 904 byte"
là bảy ô Trưng Bày, không dựng lại được một đối thủ nào. ⇒ `docs/SQL_DAU_TRUONG.sql` nới bảng cũ
thêm **hai cột**: `chien_bo jsonb` (bản chụp ~360 byte, chốt trần 1.200 ký tự) và
`dau_diem int` (nền 1.000, chốt 0–100.000) + một chỉ mục để bảng xếp hạng khỏi quét trọn bảng.
**KHÔNG dựng bảng mới** — PvP không đồng bộ thì không cần chỗ nào ghi trận đấu chung.

| núm | số |
|---|---|
| lượt mỗi ngày | 5 |
| Đấu Điểm nền / sàn | 1.000 / 600 |
| hệ số Elo | 24 (thắng người ngang cơ +12) |
| dải ghép cặp | lệch ≤ 250 điểm; giang hồ ít người thì nới dần, không trả danh sách rỗng |
| Bạc thưởng | `300 + cấp Chiến Đấu × 12`; thua vẫn có **25%** |
| bậc | Sơ Học · Nhập Môn · Hào Kiệt · Cao Thủ · Tuyệt Đỉnh · Thánh Thủ |

**MƯỢN NGUYÊN BỘ MÔ PHỎNG của combat** (`deriveCombat` + `makeFight` + `stepFight`), đúng lối
`dameMotTranBoss` của Yêu Vương — không chép công thức sang. Đối thủ dựng thành một `enemy` như
yêu thú, nhưng mang chỉ số/ngũ hành/kháng/chiêu THẬT của người kia.

**⚠⚠ CHỈ TRẢ BẠC VÀ ĐẤU ĐIỂM.** Đấu Điểm do máy người chơi khai, cùng lớp với `chien_luc` đã khai
từ đợt A2 — RLS chỉ chặn sửa hồ sơ CỦA NGƯỜI KHÁC. Treo phần thưởng sức mạnh vào một con số
client khai là mở toang cửa. Muốn xếp hạng ăn tiền thật thì phải làm 5.2 với trần tốc độ máy chủ.

**⚠⚠ Nút Khoe của người CHƯA chạy tệp SQL không được chết theo.** Đẩy nguyên gói có hai cột mới
lên một bảng chưa có chúng thì Supabase **từ chối cả gói**. `cloudPushHoSo` nay thử một lần, thấy
lỗi vì cột thì **bỏ hai cột đó ra rồi đẩy lại**, và nhớ cho cả phiên.

**⚠⚠ BA LỖI ẢNH CHỤP BẮT ĐƯỢC MÀ 52 BÀI KIỂM BÁO XANH:**
- **Khổ 390px hỏng hẳn**: ba cụm `shrink-0` bên phải ép cột tên còn ~40px — tên co thành "M…",
  dòng phụ xếp dọc từng chữ một. Nay chân dung + tên là MỘT cụm `w-full sm:w-auto`.
- **Bày theo độ GẦN điểm** nên hàng đọc ra 1.010 · 950 · 1.080 · 880, nhìn như danh sách xáo bừa.
  Nay CHỌN theo độ gần, BÀY theo Đấu Điểm giảm dần.
- **Câu mở màn của `makeFight` viết cho YÊU THÚ**: "gầm lên, toàn thân bốc cháy rừng rực" — đối thủ
  ở đây là NGƯỜI. Nay thay đúng dòng đầu: "ôm quyền thi lễ, vận khởi Hỏa khí — trận đấu bắt đầu."

**⚠ Kiểm chuẩn bắt 3 mục bài kiểm RỖNG**, trong đó một mục đáng nhớ: `su.length <= DT_SU_CAP` là
phép đo **bám vào chính hằng số nó đang canh** — nâng hằng số lên 100.000 thì mục vẫn xanh mà bản
lưu phình mãi. Nay đòi hỏi một con số ĐỘC LẬP (đánh 40 trận, sử ≤ 25 bản ghi).

**⚠ Chữ dán vào chuỗi có thẻ HTML thì bộ đếm dịch KHÔNG THẤY** (`_dump_ghep.mjs` coi mọi chuỗi
chứa `<` `>` là mã). Câu mở màn ban đầu dán liền `<span class="…">` nên hai khúc chữ Việt biến mất
khỏi bản đếm — bản EN/ZH sẽ đứng nguyên tiếng Việt mà không ai báo gì. Nay tách thành hằng số
sạch, và bài kiểm 52 có một mục canh đúng chuyện đó.

Bài kiểm **52** `_check_dautruong.mjs` (**71 mục**), kiểm chuẩn `_kiemchuan_dautruong.mjs`
**17/17**. Trang soi `_mockup/_dautruong_nhin.html`. Không cần art mới.
⇒ **Chủ dự án phải chạy `docs/SQL_DAU_TRUONG.sql`** rồi bật cờ ở Lệnh Bài, tab Tính Năng.

**5.2 Mùa giải** — cờ `muaGiai` + `mo_khoa.mua_so`
- Ba tháng một mùa, bảng xếp hạng đóng băng cuối mùa, thưởng danh hiệu riêng.
- Mùa là thứ hợp với Lệnh Bài nhất: mở và đóng bằng mốc giờ, y như sáu lễ.

**5.3 Bang chiến thật** — cờ `bangChienPvp`
- Hai bang tranh một địa điểm trên bản đồ, giữ được thì cả bang ăn hệ số.

**5.4 Mini-game lên mạng** — cờ `coOnline`
- Ngũ Tử Kỳ và ba trò bài đã có bộ óc AI tốt. Thêm đấu người thật.
- Chữ trong canvas phải dịch trước, không thì bản EN/ZH vào bàn cờ là gặp tiếng Việt.

**5.5 Động Phủ thành hub** — cờ `dongPhuHub`
- Mini-game gắn vào nhà riêng, mỗi trò một mốc phần thưởng ngày.

## 6. Năm thứ ba — chiều sâu và tuổi thọ

**6.1 Trùng Sinh sâu** — `mo_khoa.tran_chuyen` nới dần
- Mỗi vòng mở một nhánh kỹ năng mới, không chỉ nâng trần cấp.

**6.2 Bản đồ mới** — cờ `banDoBac3`
- Vùng đất mới + tuyến nhiệm vụ dài, mở từng khu bằng mốc giờ.

**6.3 Hệ chế tác bậc cao** — cờ `cheTacBac3`
- Đúc lại dòng roll, ghép Bộ Trang, tinh luyện Linh Thú.

**6.4 Chuyện dài** — cờ `cotTruyen2`
- Đàm Đạo 9/9 NPC đã xong phần một. Phần hai gắn với bản đồ mới.

**6.5 Công cụ cho chính mình** — không cần cờ
- Bảng số liệu người chơi thật trong Lệnh Bài: giữ chân, tắc ở đâu, bỏ ở cấp nào.
- Đây là thứ quyết định năm thứ tư làm gì.

---

## 7. Nhịp phát hành

- **Đẩy code liên tục**, cờ tắt. Không có nhánh dài, không có "bản lớn" tích một tháng.
- **Bật theo mốc**: mỗi tháng bật một thứ nhỏ, mỗi quý một thứ lớn.
- **Bật cho tác giả trước** (`chi_tac_gia = true`), chơi thử trên live vài ngày, rồi mới mở cả làng.
- Mỗi lần bật đều có dòng trong `lenh_bai_nhat_ky` — sổ chỉ thêm được, không sửa được.

## 8. Cái KHÔNG làm

- ⛔ Không bán chỉ số bằng tiền thật.
- ⛔ Không thêm bot vào Sàn. Sàn cũ bị gỡ đúng vì chuyện đó.
- ⛔ Không mở tính năng mới khi tính năng cũ còn số DRAFT chưa chốt.
- ⛔ Không dựng hệ thứ hai làm đúng việc hệ cũ đã làm.
