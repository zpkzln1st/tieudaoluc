# ĐƯA TIÊU DAO LỤC LÊN ONLINE

Kế hoạch bốn đợt. User duyệt đợt A ngày 2026-08-04.

Nơi đặt game không đổi: GitHub Pages. Supabase làm phần máy chủ.

---

## 0. ĐANG Ở ĐÂU

| | Trạng thái |
|---|---|
| Đợt A1 — một giang hồ chung | ✅ LIVE `cfd7b51` |
| Đợt A2 — hồ sơ công khai | ✅ LIVE `a90962a` |
| Đợt B — máy chủ đặt trần tốc độ | chưa làm |
| Đợt C — quyền tác giả | chưa làm |
| Đợt D — dọn đường cho tầng 2 | chưa làm |

Bảng trên Supabase hiện có: `saves` (mỗi tài khoản một dòng, chỉ chủ đọc được) và
`ho_so_cong_khai` (ai cũng đọc, chỉ chủ ghi — xem `SQL_HO_SO_CONG_KHAI.sql`).

---

## 1. RÀO CHẮN THẬT SỰ: CLIENT TỰ TÍNH TIẾN ĐỘ

Toàn bộ game chạy trên máy người chơi. Save là một cục JSON do chính máy đó ghi rồi đẩy lên.
Ai mở Console cũng sửa được cấp, Bạc, đồ.

Khi chơi một mình thì vô hại. Khi các tài khoản thấy nhau thì đó là ăn gian thật.

Kho mã lại công khai trên GitHub. Nên **mọi biện pháp phải đứng vững kể cả khi kẻ gian đọc hết mã**.
Giấu giếm không phải là biện pháp.

### Ba tầng chống gian lận, đắt dần

**Tầng 1 — máy chủ đặt TRẦN TỐC ĐỘ.**
Mỗi lần đẩy save, một hàm chạy phía máy chủ so với mốc lần trước: trôi qua T giây thì mức tăng
tối đa về mặt vật lý là bao nhiêu. Vượt trần thì từ chối ghi và ghi vào sổ nghi vấn.

Bắt được: sửa Bạc, sửa cấp, nhân đồ, tua đồng hồ.
Không bắt được: gian lận chậm và đều.
Không phải viết lại engine dòng nào.

**Tầng 2 — máy chủ TÍNH LẠI tiến độ nhàn rỗi.** Bắt gần hết. Xem §4.

**Tầng 3 — máy chủ giữ toàn bộ state.** Viết lại game. Không nên.

### Chia tính năng theo mức chịu đựng

| Chịu được máy khách gian dối — làm được ngay | Bắt buộc máy chủ giữ luật |
|---|---|
| Hồ sơ công khai, xem giá Trưng Bày | Sàn giao dịch, cho tặng đồ |
| Bằng Hữu | Bảng xếp hạng có thưởng |
| Phi Cáp nhắn tin, kênh chung | PvP ăn thua |
| Bang hội thật (nhiều người một bang) | Yêu Vương chung tính công |

Vế trái hỏng nhất là có người khoe đồ giả — không ai mất gì.
Vế phải mỗi thứ là một đường **sinh ra giá trị**; để client tự khai nghĩa là cho in tiền.

---

## 2. BA THỨ ĐÃ CÓ SẴN (đo rồi, đừng đo lại)

**Engine đã THUẦN.** `activity.js` dòng 4 ghi sẵn *"Chạy được client/server"*. Bài kiểm `.mjs`
đang import thẳng engine chạy trong Node. Mọi chỗ nhắc `Alpine` trong engine đều chỉ là chú thích.
⇒ Tầng 2 là việc **dọn dẹp**, không phải viết mới.

**Trần nhàn rỗi đã có.** `idleCapMs()` chặn cứng 8 giờ, tối đa 14 giờ với Động Phủ. Cộng với 107
hành động đều có `time`/`xp` cố định trong `data/skills.js` ⇒ **bảng trần tốc độ cho máy chủ rút
thẳng từ bảng số của game, không chép tay**. Cùng lối đã làm ở Cẩm Nang.

**Danh tính tác giả đã ký số.** `AUTHOR_CERT.uid` trong `src/engine/author.js` chính là user id
Supabase của tác giả, ký bằng ECDSA P-256. Không giả được.

---

## 3. HAI THỨ PHẢI DỌN TRƯỚC KHI LÀM ĐƯỢC TẦNG 2

**13 file engine đang dùng `Math.random()`**: `activity` · `bangphai` · `bots` · `cotuong` ·
`covua` · `dungeon` · `enhance` · `paodekuai` · `pets` · `tienlen` · `tongmon` · `tuulau` ·
`worldboss`. Máy chủ tính lại mà gặp số ngẫu nhiên thì ra kết quả khác client. Phải đổi hết sang
bộ sinh số có hạt giống, hạt giống lưu trong save.

**Logic thưởng đang chẻ đôi.** Một nửa nằm ở `engine/activity.js` (thuần), một nửa nằm ở store
`src/main.js` — 5.470 dòng, 40 chỗ đụng thẳng vào tiền/đồ/exp. Phải gộp về một chỗ thuần trước.
Xem thêm bẫy hai-đường-thưởng ở `gotcha-tieudao-reward-foreground-offline`.

---

## 4. BỐN ĐỢT

### Đợt A — nền móng (XONG)

**A1 · một giang hồ chung** — `MAY_CHU_SEED` + `MAY_CHU_MO_LUC` là hằng số; người nhập giang hồ
rải đều theo thời gian nên sàn cấp không dâng. Chi tiết ở §2b của `THIET_KE_BOT_WORLD.md`.

**A2 · hồ sơ công khai** — bảng `ho_so_cong_khai`, nút Khoe, đường dẫn `?hoso=<mã>`.
⚠ Bản khoe là **bản CHỤP** chứ không phải tham chiếu: giá trong máy trỏ tới đồ của chủ, người
ngoài tra không ra. Đo: 904 byte một dòng với 5 món.
⚠ Đẩy hồ sơ **không được `await`** trong đường lưu save — thiếu bảng mà treo luôn việc lưu là đổi
một lấy mười.

### Đợt B — chống gian lận tầng 1

Cần thêm:
- Bảng `moc_tien_do`: mốc gần nhất của mỗi tài khoản (exp từng track, Bạc, mốc giờ).
- Một Edge Function đứng giữa: nhận save, so với mốc, quá trần thì từ chối + ghi `nghi_van`.
- Bảng trần **sinh từ `data/skills.js` + `idleCapMs()`**, không gõ tay.

Việc phải làm ở client: đẩy save đi qua Edge Function thay vì upsert thẳng.

### Đợt C — quyền tác giả

- Luật RLS cho đúng `AUTHOR_CERT.uid`: đọc mọi dòng `saves` + `nghi_van`.
- Màn "Giám Sát" trong game, chỉ hiện khi `isAuthorAccount`.

⚠ **`isAuthorAccount` chỉ để ẩn/hiện giao diện, KHÔNG phải hàng rào.** Ai sửa client cũng bật được
panel đó. Hàng rào thật là RLS: bật được panel mà không có phiên đăng nhập đúng uid thì truy vấn
trả về rỗng. Phải làm cả hai và đừng nhầm cái nào giữ cửa.

### Đợt D — dọn đường cho tầng 2

Gộp logic thưởng về một chỗ thuần + thay `Math.random()` bằng RNG có hạt giống (§3).
Việc dài, làm dần, **không chặn A–C**.

---

## 5. NHỮNG THỨ ĐANG CHỜ NGƯỜI THẬT

- **Bằng Hữu · Phi Cáp nhắn tin** — dùng Supabase Realtime, chưa đụng dòng nào.
- **Bang hội thật** — thay bang bot hiện tại. Xem `THIET_KE_BOT_WORLD.md`.
- **Sàn Giao Dịch** — đã dựng xong rồi gỡ bỏ (`31ac9c9`). Bài học: bot không sinh ra cung cầu.
  Chỉ mở lại khi có người thật đủ đông **và** đã xong tầng 2.
