-- ============================================================
-- TIÊU DAO LỤC — Đợt A2: HỒ SƠ CÔNG KHAI
--
-- CÁCH DÙNG: mở Supabase > SQL Editor > dán trọn tệp này > Run. Chạy một lần là xong.
-- Chạy lại lần nữa cũng không sao (mọi câu đều `if not exists` / `drop policy if exists`).
--
-- Bảng này KHÔNG chứa save. Nó chỉ giữ đúng phần người khác được xem: tên, cấp, chiến lực,
-- và bản chụp giá Trưng Bày. Đo thật: một dòng nặng ~142 byte, nhẹ hơn cả cục save 869 lần.
-- ============================================================

create table if not exists public.ho_so_cong_khai (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  ten        text        not null default '',
  tong_cap   int         not null default 0,
  chien_dau  int         not null default 0,
  chien_luc  bigint      not null default 0,
  avatar     text,
  danh_hieu  text,
  trung_bay  jsonb       not null default '[]'::jsonb,   -- bản CHỤP 7 ô, không phải tham chiếu
  cap_nhat   timestamptz not null default now()
);

-- Giá chỉ có bảy ô. Chặn ở đây để không ai nhét cả kho đồ lên bảng công khai.
alter table public.ho_so_cong_khai drop constraint if exists trung_bay_toi_da_7;
alter table public.ho_so_cong_khai add  constraint trung_bay_toi_da_7
  check (jsonb_array_length(trung_bay) <= 7);

-- ============================================================
-- LUẬT TRUY CẬP (RLS) — đây MỚI là hàng rào thật.
-- Giao diện trong game chỉ ẩn/hiện nút; ai sửa mã client cũng bật được. Nhưng không có
-- phiên đăng nhập đúng chủ thì mấy luật dưới đây trả về rỗng / từ chối ghi.
-- ============================================================
alter table public.ho_so_cong_khai enable row level security;

-- ĐỌC: ai cũng đọc được, kể cả người chưa đăng nhập. Đó là cả mục đích của việc "khoe".
drop policy if exists "ho_so_ai_cung_xem" on public.ho_so_cong_khai;
create policy "ho_so_ai_cung_xem" on public.ho_so_cong_khai
  for select using (true);

-- GHI: chỉ chủ mới thêm/sửa được dòng của chính mình.
drop policy if exists "ho_so_chi_chu_them" on public.ho_so_cong_khai;
create policy "ho_so_chi_chu_them" on public.ho_so_cong_khai
  for insert with check (auth.uid() = user_id);

drop policy if exists "ho_so_chi_chu_sua" on public.ho_so_cong_khai;
create policy "ho_so_chi_chu_sua" on public.ho_so_cong_khai
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- KHÔNG có luật DELETE: hồ sơ tự mất khi tài khoản bị xoá (on delete cascade).

-- ============================================================
-- ⚠ NÓI THẲNG VỀ GIAN LẬN
-- Số trên bảng này do MÁY NGƯỜI CHƠI khai. Ai sửa mã client cũng khai được cấp 100.
-- RLS chỉ chặn việc sửa hồ sơ CỦA NGƯỜI KHÁC, không chặn việc khai láo hồ sơ của chính mình.
-- Muốn chặn khai láo thì phải làm Đợt B (máy chủ đặt trần tốc độ) — xem docs/THIET_KE_ONLINE.md.
-- Giai đoạn này hồ sơ công khai là thuần trang trí, không được dùng để trao thưởng.
-- ============================================================
