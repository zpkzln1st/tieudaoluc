// ============================================================
// DATA — Bản đồ thế giới (10 vùng). Tên gốc IdleMMO -> Hán Việt.
// reqLevel = Combat Lv đề xuất (cũng là mốc mở khoá trên bản đồ hành trình).
// mapX / mapY = vị trí landmark trên nền map (theo % của khung), xếp thành lộ trình.
// ============================================================
// enemies = id yêu thú (từ data/combat.js) sống ở vùng. Combat chỉ hiện quái của vùng đang đứng.
// (Hiện chỉ 4 quái → gán cho 2 vùng đầu; các vùng sau để trống, thêm nội dung dần.)
export const LOCATIONS = [
  { id: 'lamLinhCoc',   name: 'Lam Linh Cốc',   gloss: 'Bluebell Hollow',     reqLevel: 1,   icon: '🏡', mapX: 23, mapY: 21, desc: 'Thôn trang yên bình, đồng cỏ xanh và nông trại nhỏ.',  enemies: ['daLang', 'sonTru'] },
  { id: 'uLam',         name: 'U Lâm',          gloss: 'Whispering Woods',    reqLevel: 8,   icon: '🌲', mapX: 40, mapY: 18, desc: 'Rừng già rậm rạp, gió thì thầm giữa tán cây.',         enemies: ['hacHung', 'yeuHo'] },
  { id: 'huyenDo',      name: 'Huyền Đô',       gloss: 'Eldoria',             reqLevel: 18,  icon: '🏘️', mapX: 57, mapY: 23, desc: 'Cổ thành phồn hoa, trung tâm giao thương.',           enemies: ['daoTac', 'hacYVe', 'luuManh', 'sonTacVuong'] },
  { id: 'thuyTinhDong', name: 'Thủy Tinh Động', gloss: 'Crystal Caverns',     reqLevel: 32,  icon: '💠', mapX: 75, mapY: 18, desc: 'Hang động pha lê lấp lánh, khoáng mạch phong phú.',    enemies: ['tinhThachQuai', 'dongUMinh', 'huyetPhucChau'] },
  { id: 'langTieuPhong',name: 'Lăng Tiêu Phong',gloss: 'Skyreach Peak',       reqLevel: 48,  icon: '🏔️', mapX: 90, mapY: 47, desc: 'Đỉnh núi chọc trời, tuyết phủ quanh năm.',            enemies: ['tuyetLang', 'bangPhachDieu', 'hanGiao', 'hanGiaoVuong'] },
  { id: 'meAoLucChau',  name: 'Mê Ảo Lục Châu', gloss: 'Enchanted Oasis',     reqLevel: 60,  icon: '🏜️', mapX: 67, mapY: 50, desc: 'Ốc đảo huyền ảo giữa sa mạc, ẩn chứa kỳ trân.',       enemies: ['saMang', 'huyenHo', 'luuSaQuy'] },
  { id: 'phuKhongVien', name: 'Phù Không Hoa Viên', gloss: 'Floating Gardens', reqLevel: 70, icon: '🌸', mapX: 45, mapY: 49, desc: 'Vườn hoa lơ lửng giữa tầng mây Aetheria.',           enemies: ['hoaYeu', 'vanDieu', 'phuQuangDiep'] },
  { id: 'quanTinhDai',  name: 'Quan Tinh Đài',  gloss: 'Celestial Observatory', reqLevel: 78, icon: '🔭', mapX: 27, mapY: 77, desc: 'Đài quan sát tinh tú, nơi linh khí hội tụ.',         enemies: ['tinhLinh', 'thienCuongVe', 'huKhongThu', 'cuuViHoTien'] },
  { id: 'tichNguDao',   name: 'Tịch Ngữ Đảo',   gloss: 'Isle of Whispers',    reqLevel: 92,  icon: '🏝️', mapX: 56, mapY: 77, desc: 'Hải đảo bí ẩn, sương mù vây phủ tịch mịch.',         enemies: ['haiYeu', 'meVuYeu', 'giaoNhan'] },
  { id: 'thienThanh',   name: 'Thiên Thành',    gloss: 'The Citadel',         reqLevel: 100, icon: '🏯', mapX: 86, mapY: 75, desc: 'Tòa thành tối thượng — đích đến của cao thủ.',        enemies: ['thuVeThanTuong', 'coMa', 'thienBinh', 'coMaTo'] },
];

// ============================================================
// Tầng Cảnh Giới — gom 10 vùng theo mốc cấp, hiện ở panel trái bản đồ.
// text/border/dot = class Tailwind tô màu theo tầng. icon -> ico() (drop ảnh sau).
// ============================================================
export const REALM_TIERS = [
  { id: 'tierNhanGian', name: 'Nhân Gian', range: 'Lv 1 - 30',   min: 1,  max: 30,  icon: '🏞️', text: 'text-emerald-300', border: 'border-emerald-400/50', dot: 'bg-emerald-400' },
  { id: 'tierBiCanh',   name: 'Bí Cảnh',   range: 'Lv 30 - 60',  min: 30, max: 60,  icon: '🔮', text: 'text-cyan-300',    border: 'border-cyan-400/50',    dot: 'bg-cyan-400' },
  { id: 'tierTienCanh', name: 'Tiên Cảnh', range: 'Lv 60 - 90',  min: 60, max: 90,  icon: '☁️', text: 'text-purple-300',  border: 'border-purple-400/50',  dot: 'bg-purple-400' },
  { id: 'tierThanVuc',  name: 'Thần Vực',  range: 'Lv 90 - 100', min: 90, max: 101, icon: '⚜️', text: 'text-amber-300',   border: 'border-amber-400/50',   dot: 'bg-amber-400' },
];
