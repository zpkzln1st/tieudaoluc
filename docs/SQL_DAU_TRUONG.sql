-- ============================================================
-- TIÊU DAO LỤC — 5.1 ĐẤU TRƯỜNG (cờ `dauTruong`)
--
-- CÁCH DÙNG: mở Supabase > SQL Editor > dán trọn tệp này > Run. Chạy một lần là xong.
-- Chạy lại lần nữa cũng không sao (mọi câu đều `if not exists` / `drop ... if exists`).
--
-- Tệp này CHỈ nới bảng `ho_so_cong_khai` đã có, KHÔNG dựng bảng mới. Đấu Trường là PvP
-- không đồng bộ: đánh với BẢN CHỤP của người khác, nên không cần chỗ nào ghi trận đấu chung.
-- ⚠ Phải chạy docs/SQL_HO_SO_CONG_KHAI.sql TRƯỚC — tệp này nới bảng đó ra.
-- ============================================================

-- Bản chụp BỘ CHIẾN ĐẤU. Hồ sơ công khai cũ chỉ có tên/cấp/Chiến Lực/giá Trưng Bày, không có
-- một con số nào để dựng lại đối thủ. Không có cột này thì Đấu Trường phải BỊA ra đối thủ.
alter table public.ho_so_cong_khai add column if not exists chien_bo jsonb;

-- Đấu Điểm — thang xếp hạng Đấu Trường. Nền 1000, thắng thua cộng trừ theo kỳ vọng.
alter table public.ho_so_cong_khai add column if not exists dau_diem int not null default 1000;

-- Bản chụp phải GỌN. Đo thật: bộ chiến đấu đầy đủ ~360 byte; trần 1.200 để còn chỗ thở mà
-- vẫn chặn được đường nhét cả bản lưu lên một bảng ai cũng đọc được.
alter table public.ho_so_cong_khai drop constraint if exists chien_bo_gon;
alter table public.ho_so_cong_khai add  constraint chien_bo_gon
  check (chien_bo is null or length(chien_bo::text) <= 1200);

-- Đấu Điểm không được là số vô lý. Đây KHÔNG phải hàng rào chống gian lận (xem ghi chú cuối
-- tệp) — nó chỉ chặn số rác làm hỏng bảng xếp hạng của mọi người.
alter table public.ho_so_cong_khai drop constraint if exists dau_diem_hop_le;
alter table public.ho_so_cong_khai add  constraint dau_diem_hop_le
  check (dau_diem >= 0 and dau_diem <= 100000);

-- Bảng xếp hạng Đấu Trường đọc theo `dau_diem`. Không có chỉ mục thì mỗi lần mở màn là một lần
-- quét trọn bảng.
create index if not exists ho_so_dau_diem_idx on public.ho_so_cong_khai (dau_diem desc);

-- LUẬT TRUY CẬP: giữ nguyên. Hai cột mới nằm trong đúng bảng cũ nên ăn theo RLS đã có —
-- ai cũng ĐỌC được, chỉ chủ mới GHI được dòng của mình.

-- ============================================================
-- ⚠ NÓI THẲNG VỀ GIAN LẬN — đọc trước khi định treo phần thưởng vào đây
-- Số trên bảng này do MÁY NGƯỜI CHƠI khai, y như `chien_luc` đã khai từ đợt A2. RLS chỉ chặn
-- việc sửa hồ sơ CỦA NGƯỜI KHÁC. Ai sửa mã client cũng tự khai Đấu Điểm 99.999 được.
-- ⇒ Đấu Trường CHỈ trả Bạc và Đấu Điểm. KHÔNG trả vật phẩm, KHÔNG trả chỉ số, KHÔNG mở khoá gì.
--   Treo phần thưởng sức mạnh vào một con số client khai là mở toang cửa cho người khai láo.
-- ⇒ Bản chụp `chien_bo` của người khác cũng do họ khai. Khai bé đi thì chính họ thành mục tiêu
--   dễ ăn cho cả làng — tự hại mình, nên không cần chặn. Khai to lên thì không ai đánh họ.
-- Muốn xếp hạng ăn tiền thật thì phải làm mục 5.2 Mùa Giải với trần tốc độ phía máy chủ.
-- ============================================================
