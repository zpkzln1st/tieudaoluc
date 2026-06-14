// ============================================================
// DATA — Avatar (Dung Mạo). Ảnh thật: images/avatars/<id>.webp
// Picker ở Hồ Sơ chỉ HIỆN ô có ảnh load được; ô thiếu ảnh tự ẩn.
// state.player.avatar = id đang chọn (null = mặc định theo giới tính: nam/nu).
// ============================================================
// Tên theo môn phái thể hiện trên từng ảnh (emblem). char/color = fallback khi thiếu ảnh.

// Sinh ô dự phòng (chưa có art): thả ảnh images/avatars/<id>.webp vào là tự hiện.
// Khi gán art, sửa name ở đây cho đúng môn phái/nhân vật.
function spareSlots(prefix, from, to, char, color) {
  const out = [];
  for (let n = from; n <= to; n++) out.push({ id: prefix + n, name: 'Lãng Khách ' + n, char, color });
  return out;
}

const NAM_COLOR = 'from-sky-600 to-cyan-700';
const NU_COLOR  = 'from-rose-500 to-fuchsia-600';

export const AVATARS = [
  // Nam — đã có art + tên môn phái
  { id: 'nam',  name: 'Kiếm Tông',    char: '男', color: NAM_COLOR },
  { id: 'nam1', name: 'Võ Đang',      char: '男', color: NAM_COLOR },
  { id: 'nam2', name: 'Cái Bang',     char: '男', color: NAM_COLOR },
  { id: 'nam3', name: 'Đường Môn',    char: '男', color: NAM_COLOR },
  { id: 'nam4', name: 'Hoa Sơn',      char: '男', color: NAM_COLOR },
  { id: 'nam5', name: 'Ngũ Độc',      char: '男', color: NAM_COLOR },
  { id: 'nam6', name: 'Thiên Nhẫn',   char: '男', color: NAM_COLOR },
  { id: 'nam7', name: 'Thiên Vương',  char: '男', color: NAM_COLOR },
  { id: 'nam8', name: 'Thiếu Lâm',    char: '男', color: NAM_COLOR },
  { id: 'nam9', name: 'Lăng Vân Các', char: '男', color: NAM_COLOR },
  // Nam — ô dự phòng nam10–nam20 (ẩn đến khi thả art)
  ...spareSlots('nam', 10, 20, '男', NAM_COLOR),

  // Nữ — đã có art + tên môn phái
  { id: 'nu',  name: 'Kiếm Tông',  char: '女', color: NU_COLOR },
  { id: 'nu1', name: 'Thúy Yên',   char: '女', color: NU_COLOR },
  { id: 'nu2', name: 'Võ Đang',    char: '女', color: NU_COLOR },
  { id: 'nu3', name: 'Cái Bang',   char: '女', color: NU_COLOR },
  { id: 'nu4', name: 'Hoa Sơn',    char: '女', color: NU_COLOR },
  { id: 'nu5', name: 'Nga Mi',     char: '女', color: NU_COLOR },
  { id: 'nu6', name: 'Ngũ Độc',    char: '女', color: NU_COLOR },
  { id: 'nu7', name: 'Thiên Nhẫn', char: '女', color: NU_COLOR },
  // Nữ — ô dự phòng nu8–nu20 (ẩn đến khi thả art)
  ...spareSlots('nu', 8, 20, '女', NU_COLOR),
];

// ============================================================
// Ảnh Bìa (cover) — background môn phái. Ảnh thật: images/avatars/<id>.webp
// ============================================================
export const COVERS = [
  { id: 'thieulam',   name: 'Thiếu Lâm Tự',     char: '少', color: 'from-amber-600 to-yellow-800' },
  { id: 'vodang',     name: 'Võ Đang Phái',     char: '武', color: 'from-sky-600 to-indigo-800' },
  { id: 'ngami',      name: 'Nga Mi Phái',      char: '峨', color: 'from-rose-400 to-pink-600' },
  { id: 'hoason',     name: 'Hoa Sơn Phái',     char: '華', color: 'from-slate-400 to-cyan-700' },
  { id: 'caibang',    name: 'Cái Bang',         char: '丐', color: 'from-amber-700 to-orange-900' },
  { id: 'duongmon',   name: 'Đường Môn',        char: '唐', color: 'from-emerald-700 to-green-900' },
  { id: 'thuyyen',    name: 'Thúy Yên Cung',    char: '翠', color: 'from-cyan-500 to-blue-700' },
  { id: 'thienvuong', name: 'Thiên Vương Bang', char: '天', color: 'from-zinc-600 to-slate-900' },
  { id: 'thiennhan',  name: 'Thiên Nhẫn Giáo',  char: '忍', color: 'from-rose-700 to-red-900' },
  { id: 'ngudoc',     name: 'Ngũ Độc Giáo',     char: '毒', color: 'from-violet-700 to-emerald-800' },
];
