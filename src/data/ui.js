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

// Công cụ thu thập (3 slot)
export const TOOL_SLOTS = [
  { id: 'canCau', name: 'Cần Câu', icon: '🎣' },
  { id: 'cuoc',   name: 'Cuốc',    icon: '⛏️' },
  { id: 'riu',    name: 'Rìu',     icon: '🪓' },
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
  { name: 'Bạo Kích Suất',   desc: 'Tỉ lệ chí mạng. (sắp)' },
  { name: 'Bạo Kích Thương', desc: 'Sát thương chí mạng. (sắp)' },
  { name: 'Khinh Công',      desc: 'Tốc độ di chuyển/săn. (sắp)' },
];
