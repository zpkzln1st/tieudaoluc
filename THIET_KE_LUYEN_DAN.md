# Thiết Kế — Hoàn Thiện Luyện Đan · Linh Thạch · Nghề Hái Thuốc

> Trạng thái: **BẢN THIẾT KẾ, CHƯA CODE.** Mọi số là DRAFT, tune sau khi chơi thật.
> Quy trình bắt buộc: **chốt tên → ráp data → gen ảnh.** Đảo thứ tự sẽ phải đổi tên hàng chục file
> (GitHub Pages phân biệt hoa/thường, đổi sai = ảnh vỡ im lặng trên bản live).

## Nhật ký quyết định (chủ dự án đã chốt)

| # | Vấn đề | Chốt |
|---|---|---|
| 1 | Linh Thạch tiêu hao | **1 viên / 20 phút hoạt động**, tự rút viên kế tiếp cùng loại; hết thì buff tắt, hoạt động chạy tiếp. Ví dụ 10 viên = 200 phút. → §2 |
| 2 | Bội Sản Thạch | **Giữ**, nhưng cấm áp lên Rèn Đúc và mọi hành động không tốn nguyên liệu. Viết thành **luật theo hành động**, không phải danh sách nghề. → §2, E2/E3 |
| 3 | Tứ Trụ của Hái Thuốc | **Chỉ Hộ Thể**, bỏ trụ phụ — nếu không sẽ đè chết nghề Câu Cá. → §1, E4 |
| 4 | Cổng nguyên liệu | **Hạ Linh Thạch xuống linh thảo bậc 5–6** (đồ dùng hằng ngày, phải với tới sớm). Giữ **đỉnh dài hạn ở nhánh đan** (bậc 9–10). → §2, §4 |
| 5 | Đất diễn cho linh thảo bậc cao | **Phục Dụng** — cho linh thú ăn thẳng, hồi % Thể Lực + EXP pet. Không sửa công thức Thể Lực. → §4b |
| 6 | Ô lắp đan | **3 ô, mỗi ô một việc**: Hồi Sinh Lực (gồm cả Món Ăn) · Hồi Nội Lực · Dược Lư. → §6b |
| 7 | Bộ tên | Duyệt cả 5 lần đổi: **Tán/Hoàn/Đan** · **Dược Nông** · **Hoạt Huyết Đan** · **Quán Khí Đan** · tín vật **Lão Lam**. → §4, §1 |

**Đã bác một đề xuất của vòng phản biện:** nó khuyên cho đan ăn 4 chiến lợi phẩm boss vì tưởng chúng vô dụng —
thực tế đó là `TUYET_MATS`, nguyên liệu chế Tuyệt Kĩ (`votong.js:333`). Xem §4.

---

## 0. Vì sao phải làm

Luyện Đan hiện có **đúng 3 công thức** (1 đan + 2 linh thạch) và mắc một lỗi gốc:
**nó là nghề duy nhất không có nhánh nguyên liệu của mình** — Hồi Khí Đan đang nấu từ
Tùng Mộc (gỗ) + Tuyết Ngư (cá). Mọi sự khiên cưỡng khác đều mọc ra từ đây.

Ba quyết định đã chốt với chủ dự án:

1. Thêm **nghề thứ 10 "Hái Thuốc"** — nguồn linh thảo riêng, 10 bậc gắn 10 vùng.
2. Đan = nhánh **hồi** theo bậc + nhánh **buff có hạn giờ** (cần cơ chế mới).
3. Trần art: **≤ 60 ảnh**. Bản này dùng **45**, chừa 15 slot có chủ ý.

---

## 1. Nghề thứ 10 — Hái Thuốc

| | |
|---|---|
| `id` | `thaiDuoc` · name **Hái Thuốc** · gloss `Thái Dược` · icon 🌿 |
| Nhóm | GATHER (nghề gather thứ 4) |
| Tứ Trụ | `stat: 'hoThe'` — **KHÔNG có `stat2`** (xem §6, lỗi E4) |
| inputs | KHÔNG (chỉ Câu Cá có inputs ở nhánh gather) |
| Nghề bái sư | `duocNong` — **Dược Nông** (药农: người hái/trồng thuốc trên núi) |
| NPC Đàm Đạo | **Dược Nông Lão Thanh** |
| Tín vật | **Lão Lam** (giỏ trúc cũ) — glyph 簍 |
| Công cụ | **Dược Liêm** 7 bậc: +5/10/15/22/30/40/50% hiệu suất |

**Khẩu quyết NPC:** *"Thảo mộc hữu linh, thu thái hữu thời. Sai một khắc — linh dược hoá cỏ dại."*

**Mô tả nghề bái sư:** *"Một giỏ trúc lội khắp sơn dã, cỏ nào là thuốc cỏ nào là độc — nhìn là biết."*

### 10 linh thảo

| Bậc | Vùng | Lv | Tên | id | gloss | Phẩm | xp | time | statXp | value |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Lâm Linh Cốc | 1 | Thanh Ngải Thảo | `thanhNgaiThao` | Green Mugwort | phamPham | 4 | 11.4 | 1 | 2 |
| 2 | U Lâm | 8 | Tử Đằng Hoa | `tuDangHoa` | Purple Wisteria | luongPham | 6 | 13.5 | 2 | 4 |
| 3 | Huyền Đô | 18 | Đương Quy Căn | `duongQuyCan` | Angelica Root | luongPham | 11 | 18 | 3 | 6 |
| 4 | Thủy Tinh Động | 32 | Thạch Hộc Lan | `thachHocLan` | Stone Orchid | tinhPham | 20 | 25 | 4 | 11 |
| 5 | Lăng Tiêu Phong | 48 | Tuyết Liên Hoa | `tuyetLienHoa` | Snow Lotus | tuyetPham | 32 | 31 | 5 | 15 |
| 6 | Mê Ảo Lục Châu | 60 | Ngọc Tuyền Sâm | `ngocTuyenSam` | Jade Spring Ginseng | tuyetPham | 46 | 39 | 6 | 21 |
| 7 | Phù Không Viên | 70 | Vân Lộ Chi | `vanLoChi` | Cloud Dew Fungus | truyenThe | 63 | 47 | 7 | 35 |
| 8 | Quan Tinh Đài | 78 | Thất Tinh Thảo | `thatTinhThao` | Seven Star Herb | truyenThe | 86 | 55 | 8 | 56 |
| 9 | Tịch Ngữ Đảo | 92 | Trầm Vụ Lan | `tramVuLan` | Mistdeep Orchid | thanPham | 125 | 65 | 9 | 90 |
| 10 | Thiên Thành | 100 | Cửu Diệp Linh Chi | `cuuDiepLinhChi` | Nine-Leaf Lingzhi | coBan | 170 | 76 | 10 | 140 |

**Đã kiểm:** xp/giờ Hái Thuốc **≤ Đốn Củi ở cả 10 bậc** (bậc 1 bằng nhau, các bậc sau thấp hơn 0,4–9%).
`value` ≈ 70% thang Đốn Củi — **cố ý là nghề gather sinh Bạc thấp nhất**; linh thảo **KHÔNG** bán ở Thương Điếm.

**Nếp đặt tên:** bậc 1–6 là dược liệu CÓ THẬT Hán-Việt hoá (ngải cứu, tử đằng, đương quy, thạch hộc,
tuyết liên, sâm), bậc 7–10 mới sang khí tiên — đúng điểm xoay của ba nghề gather cũ.
Tránh "Hàn/Băng" ở bậc 5 (đã bão hoà) và "Tinh" trần ở bậc 8 (đã dùng 3 lần).

**`type` mới:** thêm `thaoDuoc: 'Linh Thảo'` vào ITEM_TYPES — đừng nhét vào `vatlieu`, kẻo 10 món
lẫn vào đống chiến lợi phẩm trong Hành Trang.

---

## 2. Linh Thạch — 3 dòng × 3 bậc = 9 viên, DÙNG CHUNG mọi nghề

Hiện tại linh thạch gắn cứng vào 1 nghề (`skillId`). Giữ kiểu đó thì 10 nghề × 9 viên = **90 vật phẩm** —
bất khả thi cả art lẫn UI. **Bỏ `skillId`**, một viên dùng cho mọi nghề.

| Dòng | Tác dụng | Sơ Phẩm (Lv1) | Trung Phẩm (Lv35) | Thượng Phẩm (Lv75) |
|---|---|---|---|---|
| **Tụ Khí Thạch** | `expPct` — +% EXP nghề | +10 | +18 | +25 |
| **Thôi Vận Thạch** | `effPct` — +% hiệu suất | +2 | +5 | +8 |
| **Bội Sản Thạch** | `yieldPct` — % nhân đôi sản vật | +5 | +9 | +14 |

**Cổng nguyên liệu — ✅ ĐÃ CHỐT (hạ so với bản nháp):**

| Bậc đá | Ăn linh thảo bậc | Hái Thuốc cần | Giờ cày |
|---|---|---|---|
| Sơ Phẩm | 1–2 | Lv1–8 | ngay |
| Trung Phẩm | 3–4 | Lv18–32 | ~150–250h |
| Thượng Phẩm | **5–6** | Lv48–60 | ~390–600h |

Bản nháp bắt Thượng Phẩm ăn bậc 7 (Hái Thuốc Lv70 ≈ **880 giờ**). Linh Thạch là đồ dùng **hằng ngày**
phục vụ 9 nghề kia nên phải với tới sớm — 880 giờ cho một nghề mà ai cũng bắt đầu từ số 0 là quá xa.
Đỉnh dài hạn dời sang nhánh đan (§4).

**Bội Sản Thạch — ✅ ĐÃ CHỐT giữ lại, có rào chắn.** Xem lỗi E2/E3 ở §6. Rào viết thành **luật theo hành động**,
không phải danh sách nghề: chỉ nhân đôi khi hành động **có nguyên liệu đầu vào** VÀ **sản phẩm không phải trang bị**.
Nhờ vậy mọi công thức thêm sau này tự động an toàn, không phải nhớ sửa engine.

- ids: `tuKhiThachSo/Trung/Thuong` · `thoiVanThachSo/Trung/Thuong` · `boiSanThachSo/Trung/Thuong`
- **Viên Sơ Phẩm dòng Tụ Khí GIỮ NGUYÊN id `tieuPhuLinhThach`**, chỉ đổi name/desc/hiệu ứng.
  Lý do: save cũ tự khớp, tồn kho tự nâng vai, tái dùng luôn art — **không cần migration**.
- `khoangPhuLinhThach`: **xoá khỏi `LINH_THACH`**, giữ trong ITEMS làm vật phẩm di sản bán thường.
  (Không xoá thì sau khi bỏ `skillId` nó thành viên dùng-chung-mọi-nghề miễn phí.)
- Công thức chỉ ăn **linh thảo**, không đụng nguyên liệu bán ở Thương Điếm → chặn máy in Bạc ở nguồn.

### Tiêu hao: 1 viên / **20 phút** hoạt động — ✅ ĐÃ CHỐT

Không phải 1 viên/phiên như hiện tại.

**Luật đầy đủ:** viên đầu trừ khi bấm Bắt Đầu (giữ nếp hiện tại) → sau đó cứ 20 phút hoạt động trừ tiếp
1 viên **cùng loại đang lắp** → hết loại đó thì buff tắt, **hoạt động chạy tiếp bình thường**.
Không tự đổi sang loại khác trong kho.

Ví dụ: có 10 viên → 200 phút đầu có buff, sau đó về tốc độ thường.

**Cách hiện thực (đã đối chiếu code):** `advance()` hiện tính "thời gian đã trôi → số vòng" trong một lần.
Phải cắt khoảng đó thành **từng đoạn 20 phút**: đoạn nào còn đá thì trừ 1 viên và chạy `cycleMs` có buff,
hết đá thì các đoạn còn lại chạy `cycleMs` thường. Vòng lặp có trần (~42 đoạn cho 14 giờ), không treo.
Offline tự đúng vì mọi thứ suy ra từ thời gian đã trôi.

> ⚠️ **Đây là nerf công khai và rất lớn.** Hiện 1 viên phủ trọn phiên tới 14 giờ.
> Thông báo trong game: *"Linh Thạch nay cháy theo giờ hoạt động thay vì theo phiên."*

> ⚠️ **Đây là vòng phát thưởng lõi và nó chạy lúc người chơi không nhìn.** Sai ở đây không hiện lỗi,
> chỉ ra sai số vật phẩm/EXP. **Bắt buộc dựng harness mô phỏng** (treo 8 giờ với 10 viên phải ra đúng
> bao nhiêu vòng có buff / bao nhiêu vòng thường) trước khi đẩy lên live.

Vì sao 20 phút: ở mốc 60 phút, +25% EXP nghề chỉ tốn **3,25%** quỹ thời gian — hệ số đổi chác 7,7:1,
tức không người chơi lý trí nào bỏ qua. Nó thành **thuế**, không phải lựa chọn. Ở 20 phút, hệ số còn
2,56:1 — đủ để cân nhắc thật, và linh thảo mới thành sink thật.

---

## 3. Đan Hồi — 5 viên, hai dòng lệch bậc

**Dòng Sinh Lực** (field MỚI `healPct` — % Sinh Lực tối đa, không phải số phẳng):

| Tên | id | Lv | Hiệu ứng | Liệu |
|---|---|---|---|---|
| Hoạt Huyết Đan | `hoatHuyetDan` | 20 | healPct 30 | Đương Quy Căn ×3 + Hắc Thán ×1 |
| Tục Mệnh Đan | `tucMenhDan` | 55 | healPct 45 | Tuyết Liên Hoa ×3 + Hắc Thán ×2 |
| Hoàn Hồn Đan | `hoanHonDan` | 85 | healPct 60 | Thất Tinh Thảo ×3 + Hắc Thán ×3 |

Thang leo: **máu → mệnh → hồn**, mỗi bậc nâng một tầng cược.

**Dòng Nội Lực** — chỉ 2 bậc, vì `maxNL` phẳng 120–155 ở mọi cấp, bậc 3 sẽ vô nghĩa:

| Tên | id | Lv | Hiệu ứng | Liệu |
|---|---|---|---|---|
| Hồi Khí Đan | `hoiKhiDan` | 1 | healNL 60 (giữ nguyên) | Thanh Ngải Thảo ×2 *(đổi liệu)* |
| Quán Khí Đan | `quanKhiDan` | 40 | healNL 150 (đầy thanh) | Thạch Hộc Lan ×3 + Hắc Thán ×2 |

Hồi = gọi khí về, Quán = rót đầy. Không đụng dòng "Tụ Khí Thạch".

---

## 4. Đan Buff — 4 họ × 3 dạng = 12 viên

### Trục TÁN / HOÀN / ĐAN

Không phải ba nấc mạnh dần, mà **ba hình dạng thời lượng**. Theo thứ tự cổ điển "hoàn tán cao đan",
ai đọc kiếm hiệp cũng biết Đan là tinh luyện nhất — đọc ra thứ bậc mà không phải giải thích chữ nào.

| Dạng | Thời lượng | Vai | reqLevel |
|---|---|---|---|
| **…Tán** (bột thô, tan chậm) | 120 phút | phủ giấc ngủ, treo máy dài | 20 |
| **…Hoàn** (viên hoàn, dạng chuẩn) | 40 phút | một phiên chơi | 55 |
| **…Đan** (đan luyện, bùng rồi tắt) | 12 phút | Yêu Vương, boss, Bí Cảnh sâu | 85 |

**Tên họ bỏ hẳn chữ Đan, còn 2 chữ:** họ **Cường Nguyên** · họ **Bách Bảo** · họ **Ngộ Đạo** · họ **Dưỡng Thú**.
Nhờ vậy câu "họ Bách Bảo không áp cho gear drop" là câu không thể hiểu nhầm.

### Bảng số (Tán / Hoàn / Đan)

| Họ | key | Tác dụng | Số |
|---|---|---|---|
| **Cường Nguyên** | `cuongNguyen` | +% Công Kích · Hộ Thể · Sinh Lực | +6 / +14 / +30 |
| **Bách Bảo** | `bachBao` | +% rơi nguyên liệu thường · +% Bạc từ quái | +6 / +15 / +30 |
| **Ngộ Đạo** | `ngoDao` | +% **EXP Chiến Đấu** (không nghề nào) | +5 / +12 / +25 |
| **Dưỡng Thú** | `duongThu` | +% EXP Linh Thú · −% tiêu hao Thể Lực pet | +20/+40/+80 · −10/−20/−35 |

Tích buff (% × phút) **giảm** khi lên dạng: 720 → 560 → 360. Dạng mạnh thì ngắn, đúng ý đồ.

### Nguyên liệu — ✅ ĐÃ CHỐT: KHÔNG đụng liệu của hệ khác

Bản nháp cho phẩm cao ăn `linhPhach` và `tinhTheYeuVuong`. **Đã gỡ bỏ hoàn toàn.**
Đó không phải "đồ thừa nằm chết trong kho": `linhPhach` là vật liệu **bắt buộc** để Thức Tỉnh linh thú
(nâng cấp vĩnh viễn), `tinhTheYeuVuong` là xúc tác **bắt buộc** cường hoá gear từ +10.
Bắt người chơi đốt một bậc tiến trình vĩnh viễn để đổi 12 phút buff là bẫy kinh điển.

⚠️ **Vòng phản biện SAI ở đây, đã kiểm và bác.** Nó đề xuất thay bằng 4 chiến lợi phẩm boss unique
(`hoPhuDauLinh`, `hachCoLinh`, `cuuViTinh`, `maToTam`) vì cho rằng chúng "gần như vô dụng".
Thực tế `votong.js:333` — **chính 4 thứ đó là `TUYET_MATS`, nguyên liệu chế Tuyệt Kĩ** (20/10/5/2 mỗi
tuyệt kĩ, nhân 7 tuyệt kĩ). Đây là hệ vừa dựng xong; cho đan ăn chung sẽ loãng đúng cái vừa hồi sinh.

**Chốt: đan buff KHÔNG ăn bất kỳ liệu boss nào.**

- Dạng **Tán** ← linh thảo bậc 3–4 + chiến lợi phẩm thường (Trư Nha, Lang Bì, Hùng Chưởng…)
- Dạng **Hoàn** ← linh thảo bậc 6–7
- Dạng **Đan** ← **thuần linh thảo bậc 9–10** (Trầm Vụ Lan, Cửu Diệp Linh Chi)

Đây cũng là chỗ giữ **đỉnh dài hạn** cho nghề Hái Thuốc sau khi đã hạ cổng Linh Thạch ở §2.

---

## 4b. Phục Dụng — cho linh thú ăn thẳng ✅ ĐÃ CHỐT

Linh thảo **dùng trực tiếp được**, không cần nấu: cho linh thú ăn → hồi **% Thể Lực tối đa**
(bậc càng cao càng nhiều %) **+ một phần EXP linh thú**.

**Không sửa công thức Thể Lực hiện có.** Đã kiểm `pets.js:211-216`: Thể Lực tối đa **đã** scale theo
phẩm chất (100→440) + cấp (×1,2/cấp) + Thức Tỉnh (×1,25), còn tốc độ hồi giữ phẳng 10/phút.
Nên thời gian hồi đầy **đã** chênh 7 lần sẵn:

| Linh thú | Thể Lực tối đa | Hồi đầy từ 0 |
|---|---|---|
| Phàm Phẩm Lv1 | 101 | ~10 phút |
| Truyền Thế Lv60 | 352 | ~35 phút |
| Cổ Bản Lv100 đã Thức Tỉnh | 700 | **~70 phút** |

⚠️ **Đừng làm chậm tốc độ hồi cho pet xịn** — đó là nerf đúng vào người chơi đầu tư nhiều nhất,
mà độ chênh mong muốn đã có sẵn.

**Vì sao hồi theo % chứ không phải số cố định:** để số cố định thì một cây hồi đầy pet tân thủ nhưng chỉ
được 1/7 thanh của pet đỉnh — càng đầu tư càng thấy thuốc vô dụng. Theo % thì ngược lại: **pet càng xịn
ăn một cây càng lời**, nên linh thảo bậc 9–10 tự khớp người chơi endgame, không cần khoá cấp.

**Định giá:** ăn một cây ≈ đúng lượng EXP/Thể Lực mà pet kiếm được trong thời gian đi hái cây đó —
**đổi hướng, không tăng tổng**.

⚠️ Linh thú hiện **cộng thẳng toàn bộ chỉ số** cho nhân vật (trần 12% đã bỏ, thang **chưa** re-tune).
Nên đây là đường tăng sức mạnh thật, không phải nhánh phụ vô hại.

**Bản sắc thu được:** Hái Thuốc + họ đan Dưỡng Thú + Phục Dụng → Hái Thuốc thành **nghề nuôi linh thú**,
thay vì "nghề đẻ nguyên liệu chung chung".

### Trần cứng

- Tối đa **2 họ** chạy đồng thời · `BUFF_MAX_MS` = 7.200.000 (2 giờ)
- Tổng +% EXP Chiến Đấu từ mọi nguồn đan **≤ 25%**
- Tổng +% EXP nghề từ mọi nguồn Linh Thạch **≤ 25%**
- `value` mọi viên đan = 40% tổng value liệu → **bán ra lỗ**; Thương Điếm không bán đan

---

## 5. Cơ chế buff theo thời gian

State mới `state.buffs` (đã kiểm: tên field này **chưa tồn tại** ở bất kỳ đâu trong `src/`):

```
state.buffs = { <key>: { id, untilMs, durMs } }   // key = cuongNguyen | bachBao | ngoDao | duongThu
```

- Lưu **timestamp tuyệt đối** (`untilMs`), không lưu thời gian còn lại → offline tự đúng.
- Mỗi họ chỉ một buff; uống viên cùng họ = **thay thế**, không cộng dồn.
- Hiện ở modal **Hiệu Ứng** (hub bonus sẵn có) + chip đếm ngược ở thanh trên.
- Đăng ký vào `devNowOffsetClear` (main.js:3705) để bảng Dev tua giờ không làm lệch.

### Dược Lư — ô tự uống

Một slot mới (`cb.duocLu`) cắm sẵn một loại đan; buff hết hạn thì engine tự rút viên kế tiếp trong kho.
**Chỉ tự rút được dạng Tán và Hoàn** (`durMs ≥ 2.400.000`). **Dạng Đan phải uống tay.**

Nếu để Dược Lư tự rút cả dạng Đan thì nó xoá đúng cái ma sát khiến dạng Đan tự giới hạn —
người chơi cắm một chồng là có +30% thường trực, phá thẳng trần 25%.

---

## 6. Tám lỗi nặng đã phát hiện và sửa

Vòng phản biện đối kháng (kỹ thuật · kinh tế · lore) tìm ra 8 lỗi nặng trong bản nháp đầu.
**Cả 8 đều thuộc loại không ném lỗi console** — code thẳng sẽ hỏng âm thầm.

| # | Lỗi | Đã sửa thành |
|---|---|---|
| E1 | Bỏ `skillId` làm **chết toàn bộ UI Linh Thạch** — 3 hàm lọc theo nó, trong đó `hasLinhThachFamily` (main.js:2290) quyết định có vẽ ô Linh Thạch hay không. Ô biến mất, 9 viên mới không lắp được viên nào. | Sửa cả 3 hàm cùng lúc (§7). Bội Sản dùng cờ `craftOnly` thay vì `skillId`. |
| E2 | **Bội Sản áp cho Rèn Đúc = nhân đôi gear instance.** Mỗi vòng rèn là một lần roll affix độc lập; +14% = giảm 12,3% số lần rèn kỳ vọng để ra món max-roll. Phá xương sống loot-hunt — nguy hơn hẳn buff drop 0,3% từ quái. | Bội Sản **không áp khi output là gear**. |
| E3 | **Luật Bội Sản viết theo SKILL nhưng lỗ hổng nằm ở ACTION**: `doanhTao` là nghề craft nhưng chứa `datSet`/`cat` — hai action gather **không có inputs**. +14% vật liệu từ hư không, gián tiếp rút ngắn thời gian mở trần treo máy. | Guard theo action, một biểu thức: `action.inputs?.length && !ITEMS[action.itemId]?.equip`. Tự miễn nhiễm với mọi action thêm sau. |
| E4 | **Hái Thuốc giết Câu Cá.** `stat2` nhận **đủ** statXp (không chia đôi). Hái Thuốc hoThe+linhXao = 20 Tứ Trụ EXP/vòng, miễn phí mồi; Câu Cá chỉ linhXao = 10/vòng, còn tốn mồi mua bằng Bạc. Cùng thời gian vòng. | **Bỏ `stat2`.** Hái Thuốc chỉ `stat: 'hoThe'`. |
| E5 | **3 viên đan `healPct` không bao giờ lắp được** — 2 chỗ chặn, không phải 1: main.js:3222 lọc picker bằng `heal\|\|healNL`, và activity.js:119 chỉ đọc `dan.heal`. | Sửa cả 2 chỗ (§7). |
| E6 | **Chỉ có MỘT ô đan** (`cb.dan`) dùng chung cho hồi máu lẫn hồi nội lực → 5 công thức nhưng 1 viên hiệu lực. Dược Lư nếu dùng lại slot đó sẽ hất luôn đan hồi. | ✅ **ĐÃ CHỐT — 3 ô, mỗi ô một việc** (xem §6b). |
| E7 | **Công thức hiệu suất mô tả sai code.** Mẫu số nền thật là **1,75** (không phải 1,80), và activity.js:64 **nhân** chứ không **cộng**. 1,75 × 1,08 = 1,89 → vượt chính cái trần 1,88 tự đặt. Trần tính từ công thức sai thì không nghiệm thu được gì. | Đổi `applyLinhThach` sang **cộng thật** vào mẫu số → 1,75 + 0,08 = **1,83**, khớp đúng chữ đã viết, gộp mọi nguồn hiệu suất về một chỗ. |
| E8 | **`enemy.loot` chứa cả 4 boss unique hiếm nhất game** đi chung vòng lặp với Da Sói. Ai cộng `bachBao` vào biến `lootMul` — nước đi hiển nhiên nhất — là inflate luôn gear drop 0,3%. Có **bản sao thứ hai** y hệt ở main.js:3126. | Biến **riêng** `matMul`, chỉ nhân vào dòng loot thường. Gắn cờ `noBoost: true` lên 4 boss unique. **Sửa đồng thời cả hai bản.** |

Ba lỗi ngôn ngữ đã sửa: **Tán/Đan/Tinh → Tán/Hoàn/Đan** (tên họ trùng tên món, "Tinh" bão hoà,
ba dạng không đọc ra thứ bậc) · **Thảo Y → Dược Nông** (Thảo Y là thầy chữa bệnh, nghề này là đi hái) ·
**Hồi Nguyên Đan → Hoạt Huyết Đan** (chỉ khác Hồi Khí Đan một chữ mà hồi hai tài nguyên khác nhau).

---

## 6b. Ba ô lắp đan ✅ ĐÃ CHỐT

Hiện trạng (`activity.js:112-131`): ô **Món Ăn** (`cb.luongThuc`) tự ăn khi máu < 25%, rồi ô **Đan**
(`cb.dan`) **dùng chung** — lắp đan có `heal` thì hồi máu, lắp đan có `healNL` thì hồi nội lực,
**chỉ được một trong hai**.

Chốt: **3 ô, mỗi ô một mục đích.** Vẫn đúng 3 ô như cảm giác hiện tại, không công thức nào chết.

| Ô | Nhận | Ghi chú |
|---|---|---|
| **Hồi Sinh Lực** | Món Ăn **và** đan hồi máu (`heal` / `healPct`) | Ô `cb.luongThuc` cũ đổi tên — đan hồi máu bản chất là món ăn cao cấp. Giữ thứ tự ưu tiên Món Ăn trước. |
| **Hồi Nội Lực** | đan `healNL` | Tách khỏi `cb.dan` |
| **Dược Lư** | đan buff | Slot hoàn toàn mới |

**Migrate save bắt buộc:** người chơi cũ đang cắm gì ở `cb.dan` thì tự chuyển sang ô đúng loại
(có `heal` → ô Hồi Sinh Lực · có `healNL` → ô Hồi Nội Lực), không được để mất đồ đang lắp.

---

## 7. Điểm chạm code — 11 vị trí

Phải sửa đủ trước khi coi là xong. Thiếu bất kỳ chỗ nào đều hỏng im lặng.

| File:line | Việc |
|---|---|
| `data/linhthach.js:11,12` | Xoá 2 dòng cũ khỏi map; nạp 9 viên mới, bỏ field `skillId`, thêm `craftOnly` cho Bội Sản |
| `data/linhthach.js:17` | `linhThachForSkill` trả toàn bộ, lọc `craftOnly` theo `CRAFT_SKILLS` |
| `main.js:2290` | `hasLinhThachFamily` → true cho mọi nghề gather/craft |
| `main.js:2294` | `skillLinhThachOptions` → trả toàn bộ (lọc `craftOnly`) |
| `main.js:3222` | Thêm `\|\| ITEMS[id].healPct` vào bộ lọc ô đan |
| `main.js:1975` | Chia tab Luyện Đan thành 3 đoạn (§8) |
| `activity.js:64` | `applyLinhThach` đổi từ chia sang **cộng vào mẫu số** ở dòng 91 |
| `activity.js:68` | `TOOL_FOR_SKILL` thêm `thaiDuoc: 'duocLiem'` |
| `activity.js:119` | `autoEatTick` thêm nhánh `healPct` = `maxHP × healPct / 100` |
| `activity.js:263-264` + `main.js:3126-3127` | Tách `matMul` khỏi `lootMul`, **hai bản** |
| `ui.js:20` | `TOOL_SLOTS` đang là mảng cứng 3 phần tử — thêm slot Dược Liêm |
| `gear.js:148,149` | `TOOL_SLOT_SKILL` + `TOOL_ICON` + 7 dòng `mkTool('eq_duocLiem_1..7')` |

---

## 8. Ba việc UI bắt buộc

Luyện Đan đi từ 3 hành động lên **28** — trong khi 9 nghề còn lại chỉ có 10–12. Và 21/26 công thức mới
là biến thể tên. Không chia nhóm thì người chơi mở ra thấy một cột dọc 28 hàng đọc gần giống nhau,
và câu hỏi "nên luyện cái gì trước" **không có lời đáp**.

1. **Chia đoạn** danh sách thành 3 tiêu đề: *Linh Thạch* · *Đan Hồi Phục* · *Đan Bổ Trợ* (nhãn đầy đủ).
2. **Chip thời lượng** ngay trên mỗi hàng đan bổ trợ: "120 phút" / "40 phút" / "12 phút".
   Đây là thứ duy nhất phân biệt ba dạng mà cái tên không tải nổi — thiếu nó thì cả trục Tán/Hoàn/Đan
   sống chết nhờ người chơi tự mò.
3. Trong một họ xếp **Tán → Hoàn → Đan** (trùng luôn thứ tự reqLevel 20/55/85), đừng xếp theo sức mạnh giảm dần.

---

## 9. Ngân sách art — 45/60

| Nhóm | Số | Thư mục |
|---|---|---|
| Hạ tầng nghề | 4 | `images/skills/thaiDuoc.webp` · `images/nghe/duocNong.webp` · `images/damdao/thaiDuoc.webp` · `images/tinvat/thaiDuoc.webp` |
| Linh thảo | 10 | `images/items/` |
| Dược Liêm bậc 1–7 | 7 | `images/equip/eq_duocLiem_1..7.webp` |
| Linh Thạch | 8 | `images/items/` (viên Sơ Phẩm Tụ Khí tái dùng art `tieuPhuLinhThach.webp` sẵn có) |
| Đan hồi | 4 | `images/items/` (Hồi Khí Đan đã có art) |
| Đan buff | 12 | `images/items/` |
| **Tổng** | **45** | dư 15 slot |

**Quy cách:** `.webp` vuông 244×244, **NỀN TRONG SUỐT** theo chuẩn `items/` và `skills/`.
⚠️ Riêng `images/tinvat/thaiDuoc.webp` mới dùng nền tối. Đừng chép khối style nền tối của tín vật
sang folder `items/` — đây là lỗi hay gặp nhất.

⚠️ Mọi vật phẩm mới **bắt buộc điền field `icon` emoji** làm fallback (`ico()` rơi .webp → .png → emoji).
Nhờ vậy **ráp data trước, gen ảnh sau** vẫn không vỡ game.

Prompt gen ảnh: xem [ART_LUYEN_DAN.md](ART_LUYEN_DAN.md).

---

## 10. Còn để ngỏ — phải chốt trước khi code

1. **Mốc 577h đo cái gì?** Chưa định nghĩa nên không ai kiểm chứng được tuyên bố "không phá mốc",
   kể cả tác giả. Cần ghi rõ metric.
2. **Chi phí XP của nghề thứ 10 chưa nằm trong bản này.** Tính sơ: Hái Thuốc cần ~6,15 triệu XP tới Lv70
   (cổng Tụ Khí Thượng Phẩm) và ~20,2 triệu tới Lv100 — riêng chặng tới cổng đã cỡ 800 giờ.
   Đây chính là câu trả lời cho "ép cày thêm bao nhiêu", phải nói ra.
3. **Chưa chạy harness mô phỏng Bội Sản** — chỗ nguy nhất, phải mô phỏng TRƯỚC khi ráp.
4. **Bội Sản có nhân đôi INPUT không?** Đọc theo chữ "nhân đôi sản vật" thì không → đó là định nghĩa
   của giá trị miễn phí. Phải ghi rõ.
5. **Bội Sản tương tác thế nào với Đồ Phổ** (`action.needsDoPho`)? Nhân đôi sản vật có trừ thêm lượt không?
   Nếu không thì đó là +14% lượt Đồ Phổ miễn phí trên một nguồn khan.
6. **Linh thảo có vào Vạn Vật Phổ không?** Ba nghề gather cũ đều có. Bỏ trống 10 mục sẽ lộ ngay.
7. **Linh thảo có vào mảng `lieu` của Bí Cảnh không?** Ba nghề cũ đều có mặt.
8. **Còn thiếu 7 prompt Dược Liêm** — soạn sau khi chốt tên, theo mẫu `eq_riu_*` / `eq_cuoc_*` sẵn có.
