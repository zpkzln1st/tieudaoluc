// ============================================================
// DATA — Khung UI tĩnh: slot trang bị (paper-doll) + chỉ số phụ.
// SECONDARY_STATS.key -> lấy giá trị thật từ derivedStats; không key -> '—'.
// ============================================================

// Trang bị chính (9 slot) — chốt 2026-06-11. art bỏ vào images/equip/<id>.png.
export const EQUIP_SLOTS = [
  { id: 'mu',       name: 'Mũ',       icon: '⛑️' },
  { id: 'giap',     name: 'Giáp',     icon: '🥋' },
  { id: 'dai',      name: 'Đai Lưng', icon: '🎗️' },
  { id: 'gang',     name: 'Găng',     icon: '🧤' },
  { id: 'giay',     name: 'Giày',     icon: '🥾' },
  { id: 'vuKhi',    name: 'Vũ Khí',   icon: '🗡️' },
  { id: 'nhan',     name: 'Nhẫn',     icon: '💍' },
  { id: 'trangSuc', name: 'Trang Sức',icon: '📿' },   // Dây Chuyền / Ngọc Bội
  { id: 'toaKy',    name: 'Tọa Kỵ',   icon: '🐎' },   // Ngựa
];

// Công cụ thu thập (4 slot)
export const TOOL_SLOTS = [
  { id: 'canCau',   name: 'Cần Câu',   icon: '🎣' },
  { id: 'cuoc',     name: 'Cuốc',      icon: '⛏️' },
  { id: 'riu',      name: 'Rìu',       icon: '🪓' },
  { id: 'duocLiem', name: 'Dược Liêm', icon: '🌾' },
];

// Phụ kiện SỰ KIỆN (2 slot) — ĐỨNG NGOÀI EQUIP_SLOTS.
// ⚠ Đừng nhét vào EQUIP_SLOTS: bảng đó dựng paper-doll hai cột và được Cẩm Nang đếm là
//   "9 ô trang bị chiến đấu". Thêm vào là lệch cả hai chỗ. Hai ô này nằm đè chân dung, và
//   chỉ hiện khi có sự kiện đang chạy.
// Món lắp vào đây KHÔNG cộng chỉ số nào — chúng cộng % hiệu suất/EXP cho kĩ năng sự kiện,
// và CHỈ trong bản đồ sự kiện của chính nó (xem engine/sukien.js).
export const SK_PHU_KIEN_SLOTS = [
  { id: 'skBoi', name: 'Bội', icon: '📿', han: '珮' },
  { id: 'skAn',  name: 'Ấn',  icon: '🔮', han: '印' },
];

// Slot trang bị cũ đã bỏ — dùng để migrate save (trả món đang mặc về túi).
export const RETIRED_SLOTS = ['quan', 'phuKhi', 'boiSuc'];

// Chỉ số phụ — key trỏ tới derivedStats; không key => '—' (chờ hệ sau)
export const SECONDARY_STATS = [
  { name: 'Công Kích Lực',   key: 'congKich',  desc: 'Tổng công từ Tứ Trụ + trang bị.' },
  { name: 'Phòng Ngự',       key: 'hoThe',     desc: 'Tổng phòng ngự.' },
  { name: 'Né Tránh',        key: 'neTranh',   desc: 'Giảm tỉ lệ địch đánh trúng.' },
  { name: 'Chính Xác',       key: 'menhTrung', desc: 'Tỉ lệ đánh trúng mục tiêu.' },
  { name: 'Sinh Lực Tối Đa', key: 'sinhLuc',   desc: 'Máu tối đa.' },
  { name: 'Chiến Lực',       key: 'chienLuc',  desc: 'Sức chiến đấu tổng hợp.' },
  { name: 'Bạo Kích Suất',   ckey: 'crit',    kind: 'pct', desc: 'Tỉ lệ chí mạng.' },
  { name: 'Sát Thương Bạo Kích', ckey: 'critDmg', kind: 'mul', desc: 'Sát thương khi chí mạng.' },
  { name: 'Khinh Công',      ckey: 'spd',     kind: 'num', desc: 'Tốc độ ra đòn.' },
];
