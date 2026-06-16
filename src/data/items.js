// ============================================================
// DATA — Vật phẩm + phẩm chất. Naming tự nhiên (Gỗ Thông, Quặng Sắt,
// Cá Hồi, Kiếm Sắt...), giữ Hán-Việt cho thứ huyền ảo (Linh Thạch, Đan).
// ============================================================
// text/border/grad dùng cho khung độ hiếm (popup loot, tooltip...). bg/ring giữ cho lưới kho cũ.
import { GEAR } from './gear.js';

export const QUALITY = {
  phamPham:  { id: 'phamPham',  name: 'Phàm Phẩm',  bg: 'bg-slate-700/40',   ring: 'ring-slate-500',   text: 'text-slate-300',   border: 'border-slate-500/50',   grad: 'from-slate-700/30 to-ink3/20' },
  luongPham: { id: 'luongPham', name: 'Lương Phẩm', bg: 'bg-blue-900/40',    ring: 'ring-blue-500',    text: 'text-blue-300',    border: 'border-blue-500/50',    grad: 'from-blue-900/25 to-ink3/20' },
  tinhPham:  { id: 'tinhPham',  name: 'Tinh Phẩm',  bg: 'bg-emerald-900/40', ring: 'ring-emerald-500', text: 'text-emerald-300', border: 'border-emerald-500/50', grad: 'from-emerald-900/25 to-ink3/20' },
  tuyetPham: { id: 'tuyetPham', name: 'Tuyệt Phẩm', bg: 'bg-rose-900/40',    ring: 'ring-rose-500',    text: 'text-rose-300',    border: 'border-rose-500/50',    grad: 'from-rose-900/25 to-ink3/20' },
  truyenThe: { id: 'truyenThe', name: 'Truyền Thế', bg: 'bg-amber-900/40',   ring: 'ring-amber-500',   text: 'text-amber-300',   border: 'border-amber-500/50',   grad: 'from-amber-900/25 to-ink3/20' },
  thanPham:  { id: 'thanPham',  name: 'Thần Phẩm',  bg: 'bg-orange-900/40',  ring: 'ring-orange-500',  text: 'text-orange-300',  border: 'border-orange-500/50',  grad: 'from-orange-900/25 to-ink3/20' },
  coBan:     { id: 'coBan',     name: 'Cô Bản',     bg: 'bg-purple-900/40',  ring: 'ring-purple-500',  text: 'text-purple-300',  border: 'border-purple-500/50',  grad: 'from-purple-900/25 to-ink3/20' },
};

export const ITEM_TYPES = {
  go:      'Gỗ',
  khoang:  'Khoáng Sản',
  dinh:    'Thỏi Kim Loại',
  ca:      'Cá',
  monan:   'Món Ăn',
  vatlieu: 'Vật Liệu',
  dan:     'Đan Dược',
  trangbi: 'Trang Bị',
  khac:    'Chiến Lợi Phẩm',
  trung:   'Trứng Linh Thú',
  doPho:   'Đồ Phổ',
  moi:     'Mồi Câu',
};

export const ITEMS = {
  // --- Gỗ ---
  tungMoc:      { id: 'tungMoc',      name: 'Tùng Mộc',       icon: '🪵', type: 'go', quality: 'phamPham',  value: 2,  desc: 'Gỗ thông thường gặp, thớ thẳng dễ đẽo — vật liệu chế tác cơ bản.' },
  trucMoc:      { id: 'trucMoc',      name: 'Trúc Mộc',       icon: '🎋', type: 'go', quality: 'luongPham', value: 5,  desc: 'Thân trúc rỗng mà dẻo dai, dùng làm cán binh khí hay khung nhẹ.' },
  bachDuongMoc: { id: 'bachDuongMoc', name: 'Bạch Dương Mộc', icon: '🌳', type: 'go', quality: 'luongPham', value: 9,  desc: 'Gỗ bạch dương trắng mịn, vân đẹp, hợp đóng đồ tinh xảo.' },
  phongMoc:     { id: 'phongMoc',     name: 'Phong Mộc',      icon: '🍁', type: 'go', quality: 'tinhPham',  value: 16, desc: 'Gỗ phong đỏ chắc nặng, bền lâu — vật liệu thượng phẩm.' },
  hongMoc:      { id: 'hongMoc',      name: 'Hồng Mộc',       icon: '🌲', type: 'go', quality: 'tuyetPham', value: 30, desc: 'Gỗ gụ quý hiếm, cứng như sắt, thớ óng — cốt liệu cao cấp.' },
  hanTung:    { id: 'hanTung',    name: 'Hàn Tùng',       icon: '🌲', type: 'go', quality: 'tuyetPham', value: 22,  desc: 'Tùng già mọc trên đỉnh Lăng Tiêu quanh năm tuyết phủ, thớ gỗ ngậm hàn khí ngàn năm. Chẻ ra còn nghe băng rạn lách tách, lạnh thấu lòng bàn tay.' },
  phuVanMoc:  { id: 'phuVanMoc',  name: 'Phù Vân Mộc',    icon: '☁️', type: 'go', quality: 'truyenThe', value: 50,  desc: 'Cây sinh giữa tầng mây Phù Không, rễ bám hư không mà thân nhẹ tựa khói. Cầm trên tay phiêu phiêu hốt hốt, ngỡ mây cũng theo gỗ mà cuốn về.' },
  tinhHoaMoc: { id: 'tinhHoaMoc', name: 'Tinh Hoa Mộc',   icon: '✨', type: 'go', quality: 'truyenThe', value: 80,  desc: 'Linh mộc dưới Quan Tinh Đài, đêm đêm hấp tinh hoa nhật nguyệt, vỏ cây lấm tấm sáng như sao sa. Bậc khéo tay mới dám động rìu vào báu vật này.' },
  tramHaiMoc: { id: 'tramHaiMoc', name: 'Trầm Hải Mộc',   icon: '🪵', type: 'go', quality: 'thanPham',  value: 130, desc: 'Trầm hương chìm nổi ngàn năm dưới đáy Tịch Ngữ, nhiễm mặn sóng biển mà kết thành tinh. Đốt một mảnh, khói lam toả khắp, hồn người cũng theo đó tịnh lại.' },
  thanDanMoc: { id: 'thanDanMoc', name: 'Thần Đàn Mộc',   icon: '🟫', type: 'go', quality: 'coBan',    value: 200, desc: 'Đàn mộc thiêng trong Thiên Thành, tương truyền do thần mộc hoá thân, ngàn năm chẳng mục. Vân gỗ óng ánh kim quang, hương bay xa trăm dặm — chí bảo của bậc đại tượng.' },

  // --- Khoáng sản ---
  hacThan:    { id: 'hacThan',    name: 'Hắc Thán',    icon: '🪨', type: 'khoang', quality: 'phamPham',  value: 3,  desc: 'Than đá đen giòn, nhiên liệu chính nhóm lò luyện kim.' },
  tichKhoang: { id: 'tichKhoang', name: 'Tích Khoáng', icon: '⛰️', type: 'khoang', quality: 'phamPham',  value: 3,  desc: 'Quặng thiếc thô, luyện ra thỏi thiếc mềm dễ đúc.' },
  dongKhoang: { id: 'dongKhoang', name: 'Đồng Khoáng', icon: '🟤', type: 'khoang', quality: 'luongPham', value: 6,  desc: 'Quặng đồng ánh đỏ, luyện thành đồng dẻo bền.' },
  thietKhoang:{ id: 'thietKhoang',name: 'Thiết Khoáng',icon: '⚙️', type: 'khoang', quality: 'luongPham', value: 10, desc: 'Quặng sắt nặng tay, cốt liệu rèn binh khí trọng yếu.' },
  thachKhoi:  { id: 'thachKhoi',  name: 'Thạch Khôi',  icon: '🗿', type: 'khoang', quality: 'luongPham', value: 8,  desc: 'Tảng đá vôi trắng, dùng trong xây dựng và luyện chế.' },
  tinhThachKhoang:{ id: 'tinhThachKhoang', name: 'Tinh Thạch Khoáng', icon: '💎', type: 'khoang', quality: 'tinhPham',  value: 24,  desc: 'Quặng tinh thể kết trong khoáng mạch Thủy Tinh Động, lóng lánh như muôn vạn mảnh gương vỡ. Đào được một khối, soi vào còn thấy bóng mình lung linh bảy sắc.' },
  hanThietKhoang: { id: 'hanThietKhoang',  name: 'Hàn Thiết Khoáng',  icon: '🧊', type: 'khoang', quality: 'tuyetPham', value: 42,  desc: 'Sắt lạnh ngủ vùi dưới lớp băng vĩnh cửu Lăng Tiêu, hàn khí ngấm tận lõi. Tay trần chạm vào buốt tới xương — đúc binh khí từ nó, lưỡi chém ra cũng toả giá.' },
  hoangKimSa:     { id: 'hoangKimSa',      name: 'Hoàng Kim Sa',      icon: '🟡', type: 'khoang', quality: 'tuyetPham', value: 65,  desc: 'Cát vàng lẫn kim mạt giữa Mê Ảo Lục Châu, theo gió sa mạc cuốn thành đụn. Đãi ngàn cân cát mới được một vốc tinh kim, công phu chẳng kém luyện đan.' },
  vanMauThach:    { id: 'vanMauThach',     name: 'Vân Mẫu Thạch',     icon: '🪨', type: 'khoang', quality: 'truyenThe', value: 95,  desc: 'Đá vân mẫu kết tầng tầng nơi Phù Không Hoa Viên, mỏng như cánh ve, ánh lên ngũ sắc xà cừ. Đưa lên trước nắng, cả khối như có mây trôi bên trong.' },
  vanThiet:       { id: 'vanThiet',        name: 'Vẫn Thiết',         icon: '☄️', type: 'khoang', quality: 'truyenThe', value: 130, desc: 'Sắt thiên thạch rơi từ chín tầng trời, cắm sâu vào nền Quan Tinh Đài, vỏ cháy sém mà lõi cứng vô song. Tinh kim trời ban, phàm binh chẳng thể sánh.' },
  sanHoKhoang:    { id: 'sanHoKhoang',     name: 'San Hô Khoáng',     icon: '🪸', type: 'khoang', quality: 'thanPham',  value: 190, desc: 'Khoáng kết từ san hô hoá thạch quanh Tịch Ngữ Đảo, cành nhánh đan như lưới ngọc, hồng lục xen nhau. Mặn mòi hơi biển, đẹp mà cứng tựa thiết thạch.' },
  thanTinhKhoang: { id: 'thanTinhKhoang',  name: 'Thần Tinh Khoáng',  icon: '💠', type: 'khoang', quality: 'coBan',    value: 270, desc: 'Quặng thần tinh nơi Thiên Thành tối thượng, toả kim quang thánh khiết, nắm trong tay ấm như có sinh mệnh. Tương truyền chỉ thần binh mới xứng được rèn từ nó.' },

  // --- Cá ---
  caTuyet: { id: 'caTuyet', name: 'Tuyết Ngư', icon: '🐟', type: 'ca', quality: 'phamPham',  value: 2,  desc: 'Cá tuyết thịt trắng, câu được khắp sông hồ — thực liệu thường ngày.' },
  caHoi:   { id: 'caHoi',   name: 'Hồi Ngư',   icon: '🐠', type: 'ca', quality: 'phamPham',  value: 4,  desc: 'Cá hồi thịt hồng béo ngậy, nướng lên thơm nức.' },
  caTon:   { id: 'caTon',   name: 'Hương Ngư', icon: '🐡', type: 'ca', quality: 'luongPham', value: 7,  desc: 'Cá hương nhỏ mà thịt ngọt, hiếm hơn cá tầm thường.' },
  luNgu:   { id: 'luNgu',   name: 'Lư Ngư',    icon: '🦈', type: 'ca', quality: 'luongPham', value: 11, desc: 'Cá rô khoẻ, vây sắc, giãy đành đạch khi mắc câu.' },
  tinhLanNgu:  { id: 'tinhLanNgu',  name: 'Tinh Lân Ngư', icon: '🐟', type: 'ca', quality: 'tinhPham',  value: 22,  desc: 'Cá vảy pha lê bơi trong hồ ngầm Thủy Tinh Động, thân trong suốt nhìn thấu cả xương. Mỗi lần quẫy mình, vảy bắt ánh khoáng quang loé lên muôn tia.' },
  bangLanNgu:  { id: 'bangLanNgu',  name: 'Băng Lân Ngư', icon: '🐟', type: 'ca', quality: 'tuyetPham', value: 40,  desc: 'Cá hàn băng sống dưới mặt hồ đóng băng Lăng Tiêu, vảy phủ một lớp sương giá không tan. Câu lên khỏi nước, vây cá còn kết những hạt băng li ti.' },
  ocTuyenNgu:  { id: 'ocTuyenNgu',  name: 'Ốc Tuyền Ngư', icon: '🐠', type: 'ca', quality: 'tuyetPham', value: 60,  desc: 'Cá suối ngọc nơi ốc đảo Mê Ảo, thân ánh bảy màu như châu báu lẫn vào dòng nước trong. Giữa biển cát mênh mông, bắt được nó tựa vớ được phúc lành.' },
  vanLyNgu:    { id: 'vanLyNgu',    name: 'Vân Lý Ngư',   icon: '🐡', type: 'ca', quality: 'truyenThe', value: 88,  desc: 'Lý ngư bơi trong ao mây Phù Không, vây dài phất phơ kéo theo từng dải sương trắng. Người đời nói nó nuốt mây mà lớn, thịt thơm thoảng hương trời.' },
  tinhDieuNgu: { id: 'tinhDieuNgu', name: 'Tinh Diệu Ngư',icon: '🐟', type: 'ca', quality: 'truyenThe', value: 120, desc: 'Cá lốm đốm tinh quang nơi tinh trì Quan Tinh Đài, đêm xuống cả đàn sáng như dải Ngân Hà rơi xuống nước. Câu một con, ngỡ giam được mảnh sao trời trong giỏ.' },
  haiGiaoNgu:  { id: 'haiGiaoNgu',  name: 'Hải Giao Ngư', icon: '🦈', type: 'ca', quality: 'thanPham',  value: 175, desc: 'Giao ngư thân tựa tiểu long, vảy ánh thanh kim, ẩn trong sương mù Tịch Ngữ Đảo. Sức nó mạnh, kéo cần đứt trúc — phải tay lão ngư mới trị nổi.' },
  thienTriNgu: { id: 'thienTriNgu', name: 'Thiên Trì Ngư',icon: '🐠', type: 'ca', quality: 'coBan',    value: 250, desc: 'Cẩm lý ở thiên trì Thiên Thành, vảy vàng ròng toả thánh quang, bơi lượn ung dung như chẳng vướng bụi trần. Tương truyền ăn một miếng, thọ thêm một giáp.' },

  // --- Thỏi kim loại ---
  tichDinh:  { id: 'tichDinh',  name: 'Tích Đĩnh', icon: '⬜', type: 'dinh', quality: 'phamPham',  value: 8,  desc: 'Thỏi thiếc đã luyện, mềm dễ đúc đồ cấp thấp.' },
  dongDinh:  { id: 'dongDinh',  name: 'Đồng Đĩnh', icon: '🟧', type: 'dinh', quality: 'luongPham', value: 16, desc: 'Thỏi đồng ánh đỏ, dẻo bền — cốt liệu rèn đúc.' },
  thietDinh: { id: 'thietDinh', name: 'Thiết Đĩnh',icon: '⬛', type: 'dinh', quality: 'tinhPham',  value: 28, desc: 'Thỏi sắt rắn chắc, nền tảng rèn binh khí lợi hại.' },
  tinhThachDinh: { id: 'tinhThachDinh', name: 'Tinh Thạch Đĩnh', icon: '🔷', type: 'dinh', quality: 'tinhPham',  value: 55,  desc: 'Tinh thạch khoáng nung chảy rồi ngưng kết, trong suốt như băng mà cứng tựa thép. Khí giới khảm nó vào, đêm tối tự phát quang lấp lánh.' },
  hanThietDinh:  { id: 'hanThietDinh',  name: 'Hàn Thiết Đĩnh',  icon: '🧊', type: 'dinh', quality: 'tuyetPham', value: 95,  desc: 'Hàn thiết luyện qua chín lần lửa, hàn khí chẳng tan mà còn đậm thêm. Thỏi cầm tê tay — binh khí rèn ra chém đâu toả giá tới đó.' },
  hoangKimDinh:  { id: 'hoangKimDinh',  name: 'Hoàng Kim Đĩnh',  icon: '🟨', type: 'dinh', quality: 'tuyetPham', value: 145, desc: 'Hoàng kim sa đãi lọc tinh luyện thành đĩnh vàng ròng, nặng trĩu mà mềm dẻo. Vừa là của quý cất trữ, vừa là liệu khảm thần binh bảo giáp.' },
  vanMauDinh:    { id: 'vanMauDinh',    name: 'Vân Mẫu Đĩnh',    icon: '🪨', type: 'dinh', quality: 'truyenThe', value: 210, desc: 'Vân mẫu thạch ép tầng nung kết, óng ánh ngũ sắc như mây ngưng lại. Nhẹ mà bền, đúc giáp từ nó nhẹ tựa lông hồng mà chắc tựa thành đồng.' },
  vanThietDinh:  { id: 'vanThietDinh',  name: 'Vẫn Thiết Đĩnh',  icon: '⬛', type: 'dinh', quality: 'truyenThe', value: 290, desc: 'Vẫn thiết tôi luyện ngàn lần, lõi tinh kim của trời ngưng thành đĩnh đen tuyền. Phàm binh chạm vào liền mẻ — chỉ thần binh mới đáng đúc từ đây.' },
  sanHoDinh:     { id: 'sanHoDinh',     name: 'San Hô Đĩnh',     icon: '🟥', type: 'dinh', quality: 'thanPham',  value: 420, desc: 'San hô khoáng nấu chảy kết tinh, đỏ hồng trong vắt như ngọc biển. Vừa cứng vừa đẹp, chí bảo cho cả thợ rèn lẫn thợ khảm châu.' },
  thanTinhDinh:  { id: 'thanTinhDinh',  name: 'Thần Tinh Đĩnh',  icon: '💠', type: 'dinh', quality: 'coBan',    value: 600, desc: 'Thần tinh khoáng luyện đến cực hạn, kim quang thánh khiết chẳng bao giờ tắt. Đĩnh trong tay ấm như sinh mệnh — vật rèn nên thần binh trấn thế.' },

  // --- Món ăn ---
  khaoCaTuyet: { id: 'khaoCaTuyet', name: 'Tuyết Ngư Nướng', icon: '🍤', type: 'monan', quality: 'phamPham',  value: 5,  heal: 50,   desc: 'Cá tuyết nướng vàng ruộm, ăn vào ấm bụng hồi sức.' },
  khaoCaHoi:   { id: 'khaoCaHoi',   name: 'Hồi Ngư Nướng',   icon: '🍣', type: 'monan', quality: 'luongPham', value: 9,  heal: 90,   desc: 'Cá hồi nướng béo thơm, bồi bổ nguyên khí.' },
  khaoCaTon:   { id: 'khaoCaTon',   name: 'Hương Ngư Nướng', icon: '🍱', type: 'monan', quality: 'tinhPham',  value: 15, heal: 140,  desc: 'Cá hương nướng thơm ngọt, món tẩm bổ thượng hạng.' },
  tinhLanHap:    { id: 'tinhLanHap',    name: 'Tinh Lân Ngư Hấp',  icon: '🍥', type: 'monan', quality: 'tinhPham',  value: 35,  heal: 220,  desc: 'Tinh lân ngư hấp nguyên con, thịt trong veo ngọt thanh, ăn vào mát ruột tỉnh người — bữa ngon hiếm giữa sơn động lạnh lẽo.' },
  bangLanNuong:  { id: 'bangLanNuong',  name: 'Băng Lân Ngư Nướng', icon: '🍢', type: 'monan', quality: 'tuyetPham', value: 60,  heal: 320,  desc: 'Băng lân ngư nướng than hồng, da giòn thịt chắc còn phảng phất hơi sương giá. Một miếng vào miệng, nóng lạnh giao hoà sảng khoái.' },
  ocTuyenHap:    { id: 'ocTuyenHap',    name: 'Canh Ốc Tuyền Ngư',  icon: '🍲', type: 'monan', quality: 'tuyetPham', value: 92,  heal: 440,  desc: 'Canh ốc tuyền ngư ninh với rau ngọc, nước trong ngọt lịm, hương thơm lan cả ốc đảo. Húp một bát giữa sa mạc, mệt nhọc tan biến.' },
  vanLyTan:      { id: 'vanLyTan',      name: 'Vân Lý Ngư Tần',     icon: '🥘', type: 'monan', quality: 'truyenThe', value: 135, heal: 580,  desc: 'Vân lý ngư tần thuốc bắc, thịt mềm tan, hương trời thoang thoảng. Tương truyền ăn vào nhẹ mình như muốn bước lên mây.' },
  tinhDieuNuong: { id: 'tinhDieuNuong', name: 'Tinh Diệu Ngư Nướng', icon: '🍡', type: 'monan', quality: 'truyenThe', value: 185, heal: 720,  desc: 'Tinh diệu ngư nướng còn lấm tấm tinh quang, vừa ăn vừa ngắm như nuốt cả sao trời — mỹ vị hiếm có chốn nhân gian.' },
  haiGiaoHam:    { id: 'haiGiaoHam',    name: 'Hải Giao Ngư Hầm',   icon: '🍛', type: 'monan', quality: 'thanPham',  value: 270, heal: 880,  desc: 'Hải giao ngư hầm lửa liu riu nửa ngày, thịt giao long bổ dưỡng vô song, nước hầm đặc sánh thơm lừng — một nồi đãi cả đoàn hảo hán.' },
  thienTriTan:   { id: 'thienTriTan',   name: 'Thiên Trì Ngư Tần',  icon: '🥣', type: 'monan', quality: 'coBan',    value: 380, heal: 1100, desc: 'Thiên trì ngư tần trong chén ngọc, thịt cẩm lý vàng óng toả thánh hương. Tương truyền dùng một bữa, tinh thần sảng khoái, bách bệnh tiêu tan.' },

  // --- Vật liệu ---
  datSet:    { id: 'datSet',    name: 'Đất Sét',  icon: '🟫', type: 'vatlieu', quality: 'phamPham',  value: 2,  desc: 'Đất sét dẻo mịn, nặn gạch nung đồ — vật liệu xây dựng.' },
  cat:       { id: 'cat',       name: 'Cát',      icon: '🟨', type: 'vatlieu', quality: 'phamPham',  value: 2,  desc: 'Cát mịn vàng óng, nguyên liệu nung thuỷ tinh và xây cất.' },
  vanYeu:    { id: 'vanYeu',    name: 'Ván Gỗ',   icon: '🟧', type: 'vatlieu', quality: 'luongPham', value: 10, desc: 'Tấm ván cưa phẳng, dùng dựng nhà đóng đồ.' },
  gach:      { id: 'gach',      name: 'Gạch',     icon: '🧱', type: 'vatlieu', quality: 'luongPham', value: 18, desc: 'Viên gạch nung đỏ au, vật liệu xây thành dựng vách.' },
  thietKhau: { id: 'thietKhau', name: 'Khớp Sắt', icon: '🔩', type: 'vatlieu', quality: 'tinhPham',  value: 40, desc: 'Khớp nối bằng sắt, gia cố kết cấu thêm vững chắc.' },
  tieuPhuLinhThach:   { id: 'tieuPhuLinhThach',   name: 'Linh Thạch Tiều Phu',  icon: '💎', type: 'vatlieu', quality: 'tinhPham', value: 50, desc: 'Linh thạch ngưng từ mộc khí — lắp cho kỹ năng Đốn Củi để tăng hiệu suất.' },
  khoangPhuLinhThach: { id: 'khoangPhuLinhThach', name: 'Linh Thạch Khoáng Phu', icon: '💠', type: 'vatlieu', quality: 'tinhPham', value: 50, desc: 'Linh thạch ngưng từ địa khí — lắp cho kỹ năng Đào Khoáng để tăng hiệu suất.' },

  // --- Đá Cường Hóa (ép từ Thỏi ở Luyện Kim; dùng cường hóa trang bị) ---
  daCuongHoaSo:    { id: 'daCuongHoaSo',    name: 'Đá Cường Hóa Sơ',    icon: '🔹', type: 'vatlieu', quality: 'luongPham', value: 30,  desc: 'Đá ngưng từ thỏi luyện sơ cấp, ánh lam mờ. Dùng tôi luyện trang bị bậc thấp — cường hóa +1 đến +5.' },
  daCuongHoaTrung: { id: 'daCuongHoaTrung', name: 'Đá Cường Hóa Trung', icon: '🔷', type: 'vatlieu', quality: 'tinhPham',  value: 95,  desc: 'Đá cường hóa tinh luyện, lõi sáng trong. Dùng cho bậc cường hóa +6 đến +10.' },
  daCuongHoaCao:   { id: 'daCuongHoaCao',   name: 'Đá Cường Hóa Cao',   icon: '💠', type: 'vatlieu', quality: 'tuyetPham', value: 260, desc: 'Đá cường hóa thượng phẩm, kết tinh từ thỏi quý. Dùng cho bậc cao nhất — +11 đến +15.' },
  tinhTheYeuVuong: { id: 'tinhTheYeuVuong', name: 'Tinh Thể Yêu Vương', icon: '🔮', type: 'khac', quality: 'thanPham', value: 800, boss: true, desc: 'Tinh thể ngưng từ tử khí Yêu Vương (World Boss), mạch đỏ đập như tim sống. Chất xúc tác bắt buộc để cường hóa trang bị từ +10 trở lên.' },
  linhPhach: { id: 'linhPhach', name: 'Linh Phách', icon: '🌀', type: 'khac', quality: 'tinhPham', value: 70, desc: 'Mảnh hồn phách tản ra khi phóng sanh linh thú phẩm cao — chất dẫn để Thức Tỉnh linh thú phẩm thấp.' },

  // --- Đan dược ---
  hoiKhiDan: { id: 'hoiKhiDan', name: 'Hồi Khí Đan', icon: '🧪', type: 'dan', quality: 'luongPham', value: 25, healNL: 60, desc: 'Đan dược hồi phục nội khí, ngậm vào chân nguyên sung mãn trở lại.' },

  // --- Trang bị ---
  tichSao:   { id: 'tichSao',   name: 'Cuốc Thiếc', icon: '⛏️', type: 'trangbi', quality: 'phamPham',  value: 40,  equip: { slot: 'cuoc',  stats: {}, gatherEff: 0.05 }, desc: 'Cây cuốc thiếc thô kệch, công cụ đào khoáng cơ bản — +5% hiệu suất.' },
  thietKiem: { id: 'thietKiem', name: 'Kiếm Sắt',   icon: '🗡️', type: 'trangbi', quality: 'tinhPham',  value: 120, equip: { slot: 'vuKhi', stats: { congKich: 25 } }, desc: 'Thanh kiếm sắt rèn thô mà sắc bén — binh khí nhập môn, tăng Công Kích.' },
  tichGiap:  { id: 'tichGiap',  name: 'Giáp Thiếc', icon: '🥋', type: 'trangbi', quality: 'luongPham', value: 60,  equip: { slot: 'giap',  stats: { hoThe: 15, sinhLuc: 30 } }, desc: 'Bộ giáp thiếc nhẹ nhàng, che chắn cơ bản — tăng Hộ Thể & Sinh Lực.' },

  // --- Chiến lợi phẩm (vùng đầu) ---
  langBi:     { id: 'langBi',     name: 'Da Sói',         icon: '🟫', type: 'khac', quality: 'phamPham',  value: 6,  desc: 'Mảnh da sói thô ráp, thường dùng chế tạo trang bị da cấp thấp.' },
  truNha:     { id: 'truNha',     name: 'Nanh Heo Rừng',  icon: '🦷', type: 'khac', quality: 'luongPham', value: 10, desc: 'Chiếc nanh heo rừng cứng nhọn, làm nguyên liệu rèn vũ khí.' },
  hungChuong: { id: 'hungChuong', name: 'Chân Gấu',       icon: '🐾', type: 'khac', quality: 'tinhPham',  value: 20, desc: 'Chân gấu đen vạm vỡ, dược liệu bồi bổ gân cốt quý giá.' },
  hoVi:       { id: 'hoVi',       name: 'Đuôi Cáo',       icon: '🦝', type: 'khac', quality: 'tuyetPham', value: 35, desc: 'Đuôi cáo mượt mà nhuốm yêu khí, vật luyện khí hiếm gặp.' },

  // --- Chiến lợi phẩm vùng cao (theo tầng cảnh giới) ---
  hacThietPhien: { id: 'hacThietPhien', name: 'Hắc Thiết Phiến', icon: '🔻', type: 'khac', quality: 'tinhPham',  value: 30,  desc: 'Mảnh hắc thiết nặng trịch, cốt liệu rèn trọng giáp.' },
  tangNgan:      { id: 'tangNgan',      name: 'Túi Bạc Đoạt',    icon: '💰', type: 'khac', quality: 'luongPham', value: 45,  desc: 'Túi bạc đoạt từ tay đạo tặc, bán lại được giá kha khá.' },
  thuyTinhSa:    { id: 'thuyTinhSa',    name: 'Sa Thủy Tinh',    icon: '🔷', type: 'khac', quality: 'tinhPham',  value: 60,  desc: 'Cát thủy tinh lấp lánh, nguyên liệu khảm chế trang sức.' },
  uMinhThach:    { id: 'uMinhThach',    name: 'U Minh Thạch',    icon: '🟣', type: 'khac', quality: 'tuyetPham', value: 90,  desc: 'Khối đá nhuốm âm khí u minh, dùng bày trận pháp.' },
  tuyetLangBi:   { id: 'tuyetLangBi',   name: 'Da Tuyết Lang',   icon: '❄️', type: 'khac', quality: 'tinhPham',  value: 95,  desc: 'Da tuyết lang dày dặn chịu hàn, quý cho áo choàng băng địa.' },
  hanThietTinh:  { id: 'hanThietTinh',  name: 'Hàn Thiết Tinh',  icon: '🧊', type: 'khac', quality: 'tuyetPham', value: 130, desc: 'Tinh thể hàn thiết lạnh buốt, cốt liệu rèn binh khí băng.' },
  huyenSa:       { id: 'huyenSa',       name: 'Huyễn Sa',        icon: '🟡', type: 'khac', quality: 'tuyetPham', value: 165, desc: 'Cát ảo biến hoá khôn lường, vật liệu luyện ảo thuật.' },
  saMangDam:     { id: 'saMangDam',     name: 'Mật Sa Mãng',     icon: '🟢', type: 'khac', quality: 'truyenThe', value: 200, desc: 'Mật sa mãng kịch độc, dược dẫn luyện độc đan thượng phẩm.' },
  phuQuangPhan:  { id: 'phuQuangPhan',  name: 'Phấn Phù Quang',  icon: '✨', type: 'khac', quality: 'truyenThe', value: 240, desc: 'Phấn phát quang lung linh, nguyên liệu phù chú quý hiếm.' },
  vanVuLong:     { id: 'vanVuLong',     name: 'Lông Vũ Vân Điểu',icon: '🪶', type: 'khac', quality: 'truyenThe', value: 290, desc: 'Lông vũ vân điểu nhẹ tựa mây, chế khinh giáp thượng phẩm.' },
  tinhTuy:       { id: 'tinhTuy',       name: 'Tinh Tủy',        icon: '⭐', type: 'khac', quality: 'truyenThe', value: 340, desc: 'Tinh tủy ngưng linh khí tinh tú, đại bổ cho tu luyện.' },
  huKhongTinh:   { id: 'huKhongTinh',   name: 'Tinh Hư Không',   icon: '🌀', type: 'khac', quality: 'thanPham',  value: 430, desc: 'Tinh thể hư không huyền bí, cốt liệu luyện không gian pháp khí.' },
  giaoChau:      { id: 'giaoChau',      name: 'Giao Châu',       icon: '🫧', type: 'khac', quality: 'thanPham',  value: 540, desc: 'Viên châu của giao nhân, ẩn chứa hải linh chi khí.' },
  meVuHon:       { id: 'meVuHon',       name: 'Hồn Mê Vụ',       icon: '🌫️', type: 'khac', quality: 'thanPham',  value: 620, desc: 'Hồn phách ngưng trong sương mê, vật trận pháp hiếm có.' },
  thanThietTinh: { id: 'thanThietTinh', name: 'Tinh Thần Thiết', icon: '🔱', type: 'khac', quality: 'thanPham',  value: 780, desc: 'Tinh thể thần thiết vô song, cốt liệu rèn thần binh.' },
  coMaHaiCot:    { id: 'coMaHaiCot',    name: 'Hài Cốt Cổ Ma',   icon: '☠️', type: 'khac', quality: 'coBan',    value: 950, desc: 'Hài cốt cổ ma ngàn năm, ẩn tà khí mạnh mẽ khôn lường.' },

  // --- Boss rớt hiếm (mầm cho craft tuyệt kĩ về sau) ---
  hoPhuDauLinh:  { id: 'hoPhuDauLinh',  name: 'Hổ Phù Đầu Lĩnh', icon: '🐯', type: 'khac', quality: 'truyenThe', value: 350,   boss: true, desc: 'Hổ phù thống lĩnh sơn tặc — mầm chế tạo tuyệt kĩ trấn phái.' },
  hachCoLinh:    { id: 'hachCoLinh',    name: 'Hạch Cổ Linh',    icon: '🔮', type: 'khac', quality: 'thanPham',  value: 1600,  boss: true, desc: 'Hạch linh cổ xà ngưng tụ ngàn năm — mầm chế tuyệt kĩ.' },
  cuuViTinh:     { id: 'cuuViTinh',     name: 'Tinh Cửu Vĩ',     icon: '🦊', type: 'khac', quality: 'coBan',    value: 5000,  boss: true, desc: 'Tinh hồn cửu vĩ hồ tiên — bảo vật chế tạo tuyệt học.' },
  maToTam:       { id: 'maToTam',       name: 'Tâm Ma Tổ',       icon: '💠', type: 'khac', quality: 'coBan',    value: 12000, boss: true, desc: 'Tâm ma tổ chủng cực phẩm — cốt lõi luyện tuyệt kĩ tối thượng.' },

  // --- Mồi Câu (7 bậc, dụ cá theo vùng — bán ở Thương Điếm) ---
  moiHongTrung:   { id: 'moiHongTrung',   name: 'Hồng Trùng',    icon: '🪱', type: 'moi', quality: 'phamPham',  value: 1,   desc: 'Giun đỏ đào từ bùn lầy ven sông, ngọ nguậy béo mầm. Mồi vỡ lòng rẻ tiền của mọi ngư phủ, dụ đám cá tạp nông cạn cắn câu lia lịa.' },
  moiTepDong:     { id: 'moiTepDong',     name: 'Tép Đồng',      icon: '🦐', type: 'moi', quality: 'luongPham', value: 3,   desc: 'Tép nhỏ vỏ ánh đồng bắt nơi bãi đá ngầm, búng tanh tách trong vợt. Tươi giòn hấp dẫn, cá quen miệng khó lòng bỏ qua.' },
  moiTuuKhuc:     { id: 'moiTuuKhuc',     name: 'Tửu Khúc',      icon: '🍡', type: 'moi', quality: 'tinhPham',  value: 8,   desc: 'Viên bột ủ men rượu nếp, lên hương nồng nàn theo dòng nước lan xa cả trượng. Cá tinh khôn nước sâu nghe mùi cũng phải ngoi lên đớp.' },
  moiHanTuy:      { id: 'moiHanTuy',      name: 'Hàn Tủy Nhị',   icon: '🧊', type: 'moi', quality: 'tuyetPham', value: 15,  desc: 'Tủy của thú hàn vực nghiền trộn băng tiêu, lạnh ngắt mà tỏa tinh khí. Thả xuống nước băng, dụ được giống cá ngủ vùi dưới lớp băng vĩnh cửu Lăng Tiêu.' },
  moiVanMong:     { id: 'moiVanMong',     name: 'Vân Mộng Nhị',  icon: '☁️', type: 'moi', quality: 'truyenThe', value: 32,  desc: 'Sương mây tầng Phù Không ngưng kết với phấn hoa linh thảo, nhẹ bẫng phiêu phiêu trên mặt nước. Lý ngư nuốt mây ngỡ là mây trời, đớp lấy chẳng chút nghi ngờ.' },
  moiGiaoLongDan: { id: 'moiGiaoLongDan', name: 'Giao Long Đản', icon: '🥚', type: 'moi', quality: 'thanPham',  value: 65,  desc: 'Trứng giao long chưa nở vớt từ sương mù Tịch Ngữ, vỏ ánh thanh kim đập khẽ như còn sống. Hương huyết khí khiến hải giao ngư hung tợn cũng nổi cơn thèm khát lao tới.' },
  moiThienCau:    { id: 'moiThienCau',    name: 'Thiên Câu Nhị', icon: '✨', type: 'moi', quality: 'coBan',     value: 95,  desc: 'Mảnh linh nhị tương truyền do ngư tiên Thiên Thành đánh rơi xuống nhân gian, tỏa thánh quang ôn nhuận. Thiên trì ngư vốn ung dung bất nhiễm trần, chỉ trước mồi này mới chịu cắn câu.' },
};

// Gộp catalog trang bị thật (eq_*) vào ITEMS — xem src/data/gear.js.
Object.assign(ITEMS, GEAR);

// --- TRỨNG LINH THÚ (tiền đề Pet) — mỗi Yêu Vương 1 dòng trứng × 3 phẩm chất ---
// Drop từ Yêu Vương (1 con rơi 2-3 phẩm chất khác nhau). Chưa có tính năng ấp nở — cất giữ.
const EGG_THEMES = [
  { base: 'bachHo',     name: 'Bạch Hổ' },
  { base: 'huyenQuy',   name: 'Huyền Quy' },
  { base: 'huyetLang',  name: 'Huyết Lang' },
  { base: 'cuHung',     name: 'Cự Hùng' },
  { base: 'docGiao',    name: 'Độc Giao' },
  { base: 'loiBang',    name: 'Lôi Bằng' },
  { base: 'hoaLan',     name: 'Hỏa Lân' },
  { base: 'hoYeu',      name: 'Hồ Yêu' },
  { base: 'bangPhuong', name: 'Băng Phượng' },
  { base: 'thienMa',    name: 'Thiên Ma' },
];
const EGG_TIERS = [   // q (phẩm chất) khớp NHÃN tên trứng để màu khung đúng cảm nhận độ hiếm
  { suf: 'pham', q: 'phamPham', label: 'Phàm Phẩm', v: 120 },
  { suf: 'linh', q: 'tinhPham', label: 'Linh Phẩm', v: 450 },
  { suf: 'than', q: 'thanPham', label: 'Thần Phẩm', v: 1400 },
];
export const EGG_IDS = [];
EGG_THEMES.forEach((t) => EGG_TIERS.forEach((tr) => {
  const id = 'egg_' + t.base + '_' + tr.suf;
  ITEMS[id] = { id, name: t.name + ' Noãn · ' + tr.label, icon: '🥚', type: 'trung', quality: tr.q, value: tr.v, petBase: t.base,
    desc: 'Trứng linh thú ' + t.name + ' (' + tr.label + '). Ấp nở thành Linh Thú — tính năng đang phát triển, hãy cất giữ chờ ngày khai mở.' };
  EGG_IDS.push(id);
}));

// --- ĐỒ PHỔ (công thức rèn gear bậc 4-7) — mỗi gear bậc 4-7 một đồ phổ. Drop từ BÍ CẢNH.
// "Lĩnh Ngộ" đồ phổ -> ghi gearId vào state.player.doPho -> mở khoá rèn món đó ở Rèn Đúc
// (vẫn phải cày Thỏi cao cấp + liệu). Trùng = bán được. icon dùng chung images/items/dopho.png
// (xử lý ở main.js ico(): id bắt đầu 'dp_' -> dopho.png). Đặt SAU Object.assign(ITEMS,GEAR).
// Lời giới thiệu RIÊNG từng món (2 câu: nguồn gốc/chế tác + uy lực đặc trưng — KHÔNG khuôn mẫu, KHÔNG filler).
// Cơ chế "1 lượt = 1 món" + Thỏi cần đã hiện ở panel Lĩnh Ngộ / Rèn Đúc → lore CHỈ là lời văn.
const DP_LORE = {
  // --- Kiếm ---
  eq_kiem_4: 'Thân kiếm tôi giữa cơn mưa nắng quái, lưỡi ánh hai sắc xanh hồng như cầu vồng đọng lại. Vung lên, một đạo kiếm quang lạnh vạch ngang trời; chém qua rồi mới thấy vết cắt ngọt như rẽ nước.',
  eq_kiem_5: 'Rèn dưới chân núi quanh năm sấm chớp, lõi kiếm ngậm một tia tử điện chưa từng tắt. Mỗi nhát chém kéo theo tiếng nổ lép bép, tia tím giật loé khiến đối thủ hoa mắt ngay trước khi gục.',
  eq_kiem_6: 'Đúc từ vẫn thiết rơi xuống từ chín tầng trời, tôi suốt ba năm trong tinh hoa nhật nguyệt. Rút kiếm khỏi vỏ, kiếm khí xông thẳng mây xanh — tương truyền chấn động được cả tinh tú trên cao.',
  eq_kiem_7: 'Một trong những thanh kiếm cấm kỵ thượng cổ, sinh ra để chặt đứt nhân quả và tiên duyên. Lưỡi kiếm chẳng phản chiếu bóng người, chỉ in một vệt hư vô; chém trúng thì hồn phách cũng tan theo.',
  // --- Đao ---
  eq_dao_4: 'Thân đao khắc rãnh máu sâu, càng chém càng hút huyết khí của địch mà sắc thêm. Người cầm lâu sẽ nghe đao khe khẽ rung lên, như con thú đói đang chực chờ bữa kế.',
  eq_dao_5: 'Tôi luyện ngàn ngày trong long tuyền nơi giao long từng ẩn, thép ngấm thuỷ khí mà thân đao xanh biếc. Vung mạnh một nhát, đao ngân lên tựa tiếng rồng gầm vọng từ đáy vực.',
  eq_dao_6: 'Rèn ngay trong tâm cơn bão sấm, thân đao chằng chịt vân nứt như những tia sét đông cứng. Một đao bổ xuống, lôi đình theo lưỡi mà giáng, nổ tan cả vách đá lẫn binh khí đối phương.',
  eq_dao_7: 'Ma đao tương truyền từng nhuốm máu trọn một toà thành, sát khí nồng đến mức cỏ cây quanh nó héo rũ. Vung trọn một chiêu thì trời đất tối sầm — kẻ rút nó ra cũng khó giữ nổi tâm trí mình.',
  // --- Cung ---
  eq_cung_4: 'Cánh cung hong dưới nắng sa mạc trăm ngày, dây vừa căng đã nghe hơi nóng phả ra. Mũi tên rời dây rực sáng như một mảnh mặt trời, bay tới đâu thiêu cháy tới đó.',
  eq_cung_5: 'Thân cung uốn từ xương cá kình nơi bích hải, dây bện bằng rong biển ngàn năm. Buông tên, kình lực cuộn theo như con sóng triều dâng, đẩy mũi tên xé toang mọi lá chắn.',
  eq_cung_6: 'Tương truyền thân cung tước từ xương cánh đại bằng vượt chín tầng trời, dây bện bằng gân rồng. Kéo căng, cung tự ngân lên tiếng gió hú; tên rời dây xé toạc tầng mây, kẻ trúng chưa kịp nghe đã gục.',
  eq_cung_7: 'Thần cung mang khí tịch diệt, không cần ngắm cũng tự tìm tới sinh mệnh mà bắn. Tên vừa rời dây, vạn vật trước mũi cung như bị xoá khỏi cõi đời, chỉ còn lại một khoảng không lặng ngắt.',
  // --- Ám Khí ---
  eq_amkhi_4: 'Phi đao mỏng tựa lá liễu, ném ra không một tiếng động, chớp mắt đã cắm ngập yết hầu. Cao thủ dùng nó hiếm khi phải cần đến ngọn đao thứ hai.',
  eq_amkhi_5: 'Mũi tiễn rèn từ hàn thiết âm u, bay đi mang theo hơi lạnh của chốn u minh, êm đến mức gió cũng chẳng hay. Trúng rồi, địch chỉ kịp rùng mình một cái rồi lặng lẽ đổ xuống.',
  eq_amkhi_6: 'Chín mũi ám khí phóng đi theo đúng phương vị trận cửu cung, đan thành một tấm lưới sao vây bủa. Né được một thì trúng tám — trong trận này tuyệt không có lối thoát.',
  eq_amkhi_7: 'Thần châm nhỏ tựa sợi tóc, phóng đi không bóng không tiếng, đến làn gió cũng không hề lay động. Kẻ địch chỉ thấy đồng bọn lần lượt ngã xuống mà chẳng hiểu vì đâu.',
  // --- Áo ---
  eq_van_luu_quy_tong_y: 'Áo gấm dệt theo phép "vạn lưu quy tông", muôn đường chỉ đan dồn về một mối nơi tâm áo. Kình lực đánh tới bị dẫn tản đi khắp thân rồi hoá thành vô hại.',
  eq_toa_tu_giap: 'Hàng vạn vảy tử kim móc khoá vào nhau thành một tấm giáp vừa mềm vừa bền. Đao chém thương đâm đều trượt đi, như rót nước lên mặt đá trơn.',
  eq_tuyen_long_bao: 'Bào phục thêu chân long uốn lượn quanh tuyền thuỷ, khoác lên là long khí toả ra bức người. Phàm phu mặc vào còn thấy nặng vai — phải bậc cao thủ mới trấn nổi uy của nó.',
  eq_minh_vuong_khai_giap: 'Khải giáp tương truyền của một vị Minh Vương trấn ải, đúc liền khối từ thần thiết. Đao kiếm khó để lại nổi một vết; đứng giữa trận tiền tựa một toà thành đồng.',
  // --- Đai ---
  eq_thanh_truc_cam_dai: 'Đai gấm bện từ sợi thanh trúc non, nhẹ tênh mà dẻo dai không đứt. Thắt vào lưng, gân cốt như được nâng đỡ, tinh thần tự nhiên thư thái sảng khoái.',
  eq_huyen_thiet_chien_dai: 'Đai chiến nẹp từng phiến huyền thiết, nặng trịch trên eo như buộc cả một tảng đá. Nhưng một khi trụ bộ đã vững thì sấm sét cũng khó lòng lay chuyển.',
  eq_luu_van_phi_dai: 'Dải đai dài phất phơ sau lưng tựa một dải mây trôi giữa trời. Người mang nó di chuyển nhẹ tênh, lướt theo gió như chẳng còn vướng bận trọng lượng.',
  eq_kim_long_bao_dai: 'Bảo đái nạm đầu kim long ngậm ngọc, mỗi bước đi là vảy rồng lấp lánh. Đeo vào, khí thế bức người — chưa kịp ra tay đã khiến đối thủ phải dè chừng.',
  // --- Găng ---
  eq_hac_long_lan_thu: 'Đôi găng ghép từ vảy hắc long, cứng cáp mà vẫn ôm sát từng khớp tay. Một cái nắm bóp vụn được đá tảng, đưa tay bắt đao đỡ thương cũng chẳng hề hấn.',
  eq_bang_tam_linh_thu: 'Lõi găng ngậm một khối băng tâm ngàn năm không tan, sờ vào buốt tới tận óc. Quyền chạm trúng địch, hàn khí theo đó len vào, đông cứng cả khí huyết đối phương.',
  eq_hoa_diem_chien_thu: 'Đôi găng tôi trong lò địa hoả, luôn âm ỉ một lớp nhiệt đỏ rực. Mỗi quyền tung ra kéo theo ngọn lửa táp, đấm vào giáp sắt cũng nung cho nóng đỏ.',
  eq_loi_dinh_thu_sao: 'Bao tay khảm lôi tinh thạch, lúc nào cũng có điện lách tách chạy quanh khớp ngón. Một quyền nện xuống, sấm rền theo lực mà giáng, chấn cho tạng phủ địch nhân rung bần bật.',
  // --- Giày ---
  eq_phi_van_ly: 'Đế hài lót một lớp mây nhẹ, đặt chân xuống mà như chẳng chạm mặt đất. Người mang nó bước đi êm ru, đến dấu chân cũng không buồn để lại.',
  eq_phong_anh_hai: 'Hài nhẹ tựa cánh gió, người mang lướt qua chỉ còn lưu lại một vệt bóng mờ. Đối thủ vung đòn vào chỗ vừa thấy thì đã đánh trúng khoảng không.',
  eq_loi_quang_chien_ngoa: 'Đôi chiến ngoa khảm lôi quang, mỗi sải bước rạch một tia chớp ngay dưới gót. Thân pháp dồn cả vào đôi chân, tiến lui nhanh tựa điện xẹt.',
  eq_thien_hanh_than_ly: 'Thần lý tương truyền của bậc tiên nhân vân du bốn cõi, một bước đã vượt nghìn dặm. Đạp lên hư không cũng vững như đạp đất bằng, sơn cùng thuỷ tận chẳng cản nổi.',
  // --- Mũ ---
  eq_la_han_bao_quan: 'Bảo quan chạm khắc mười tám tướng La Hán, đội lên tâm thần tự nhiên an định. Tà âm mị thuật khó lòng lọt vào, giữa loạn quân vẫn giữ được sự tỉnh táo.',
  eq_cuu_long_kim_quan: 'Mũ vàng chạm chín con rồng quẫy lượn quanh, đội lên một vẻ vương giả áp người. Tương truyền chỉ bậc thống lĩnh quần hùng mới đủ tư cách mang nó.',
  eq_bich_ngoc_hoang_quan: 'Hoàng quan tạc nguyên khối bích ngọc, trong vắt và mát lạnh nơi vầng trán. Thần trí người đội theo đó mà sáng tỏ, nhìn thấu được những điều kẻ thường bỏ sót.',
  eq_lien_hoa_dao_quan: 'Đạo quan kết thành hình một đoá sen đang nở, đội lên lòng người lắng lại thanh tịnh. Sát khí tản đi, mỗi hơi thở như đưa người đến gần hơn với đạo.',
  // --- Tọa Kỵ ---
  eq_o_van_dap_tuyet: 'Tuấn mã lông đen như mây mực, riêng bốn vó lại trắng tựa giẫm trên tuyết. Phi nước đại, vó tung lên chẳng nghe tiếng động, chỉ thấy một vệt khói đen lướt qua.',
  eq_han_huyet_bao_cau: 'Thần câu giống quý phương tây, ruổi lâu thì mồ hôi ứa đỏ như máu nơi bả vai. Chạy ngàn dặm một ngày mà không biết mỏi — là mơ ước của mọi kẻ viễn du.',
  eq_phi_van: 'Bảo mã tương truyền giẫm được lên mây mà đi, móng chưa chạm đất đã sang ngọn núi khác. Phi lên cao, gió cuốn theo sau, người ngồi trên ngỡ như đang cưỡi cả tầng mây.',
  eq_chieu_da_ngoc_su_tu: 'Mãnh thú thân ánh ngọc, đêm tối tự toả quang soi rõ cả đường đi. Một tiếng gầm vang rúng động sơn cốc, đủ khiến muôn thú quanh vùng cụp đuôi nép mình.',
  // --- Nhẫn ---
  eq_hoang_long_ban_chi: 'Ban chỉ tạc hình đầu hoàng long, đeo nơi ngón cái của bàn tay cầm cung, nắm binh. Kình lực dồn cả về đầu ngón, mỗi đòn tung ra nặng thêm mấy phần.',
  eq_hoa_long_chau_gioi: 'Giới chỉ ngậm một viên hỏa long châu ấm nóng, hộ thể giữa trời băng giá. Vận công, hơi ấm theo kinh mạch chạy khắp người, gân cốt linh hoạt hẳn lên.',
  eq_tu_vi_tinh_hoan: 'Chiếc nhẫn khảm một mảnh tử vi tinh thạch, đêm xuống lấp lánh như đang giữ một vì sao. Đeo lâu, sao trời nhỏ từng giọt tinh hoa nuôi dưỡng chân nguyên ngày một dày.',
  eq_can_khon_huyen_gioi: 'Một chiếc nhẫn nhỏ mà bên trong ẩn cả một phương trời đất riêng. Tương truyền cất chứa được muôn vật, kẻ ngộ được huyền cơ thì thu phát tuỳ tâm.',
  // --- Trang Sức ---
  eq_chien_van_linh_phu: 'Tấm linh phù khắc đầy chiến văn cổ, tương truyền do quân sư xưa luyện để hộ thân tướng sĩ. Đeo bên mình, đao thương như chùn lại đôi phần, qua trăm trận vẫn vẹn nguyên.',
  eq_bich_hai_trieu_sinh_boi: 'Miếng bội ngọc sắc bích hải, sinh khí trong người theo nó mà cuộn lên như thuỷ triều. Dẫu trúng thương vẫn thấy nguyên khí tự đầy lại, bền sức hơn người thường nhiều.',
  eq_long_phuong_song_boi: 'Đôi bội ngọc tạc long và phượng, hợp lại thành một thể âm dương giao hoà. Đeo song bội, khí huyết điều hoà, vận thế hanh thông, phúc khí vẹn toàn.',
  eq_kim_quang_tien_phu: 'Tiên phù toả một lớp kim quang dịu, đeo vào như có thần quang mỏng phủ quanh thân. Tà ma quỷ mị trông thấy phải né tránh, khí vận theo đó mà ngày một thịnh.',
};
const DOPHO_QUALITIES = ['tuyetPham', 'truyenThe', 'thanPham', 'coBan'];
export const DOPHO_IDS = [];
Object.values(GEAR)
  .filter((g) => g && g.equip && (DOPHO_QUALITIES.includes(g.quality) || g.equip.forceDoPho))
  .forEach((g) => {
    const id = 'dp_' + g.id;
    ITEMS[id] = {
      id, name: 'Đồ Phổ: ' + g.name, icon: '📜', type: 'doPho', quality: g.quality,
      value: Math.round((g.value || 50) * 0.4), gearId: g.id,
      desc: DP_LORE[g.id] || ('Bí pháp rèn ' + g.name + '.'),
    };
    DOPHO_IDS.push(id);
  });
