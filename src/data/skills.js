// ============================================================
// DATA — 9 kỹ năng. Naming HYBRID: việc đời thường = tiếng Việt tự nhiên,
// thứ huyền ảo/võ học = Hán-Việt (Luyện Đan, Linh Thạch, Hồi Khí Đan...).
// ============================================================
import { ITEMS } from './items.js';
import { mkGearRecipe, forgeableGear } from './gear.js';

export const SKILLS = {
  // ---------------- GATHER ----------------
  phatMoc: {
    id: 'phatMoc', name: 'Đốn Củi', gloss: 'Chặt Cây', icon: '🪓', stat: 'lucDao',
    npc: { name: 'Lão Tiều Phu Trương', quote: 'Muốn thành tay đốn củi cừ khôi thì phải dám vung rìu cho mạnh.' },
    actions: [
      { id: 'tungMoc',      name: 'Tùng Mộc',     gloss: 'Oak Log',           itemId: 'tungMoc',      zone: 'lamLinhCoc',    reqLevel: 1,   xp: 4,   time: 11.4, statXp: 1 },
      { id: 'trucMoc',      name: 'Trúc Mộc',      gloss: 'Yew Log',           itemId: 'trucMoc',      zone: 'uLam',          reqLevel: 8,   xp: 7,   time: 14.3, statXp: 2 },
      { id: 'bachDuongMoc', name: 'Bạch Dương Mộc',gloss: 'Birch Log',         itemId: 'bachDuongMoc', zone: 'huyenDo',       reqLevel: 18,  xp: 12,  time: 18.0, statXp: 3 },
      { id: 'phongMoc',     name: 'Phong Mộc',     gloss: 'Maple Log',         itemId: 'phongMoc',     zone: 'thuyTinhDong',  reqLevel: 32,  xp: 20,  time: 24.0, statXp: 4 },
      { id: 'hanTung',      name: 'Hàn Tùng',     gloss: 'Frost Pine',        itemId: 'hanTung',      zone: 'langTieuPhong', reqLevel: 48,  xp: 32,  time: 30.0, statXp: 5 },
      { id: 'hongMoc',      name: 'Hồng Mộc',        gloss: 'Mahogany Log',      itemId: 'hongMoc',      zone: 'meAoLucChau',   reqLevel: 60,  xp: 45,  time: 38.0, statXp: 6 },
      { id: 'phuVanMoc',    name: 'Phù Vân Mộc',  gloss: 'Cloud Wood',        itemId: 'phuVanMoc',    zone: 'phuKhongVien',  reqLevel: 70,  xp: 62,  time: 46.0, statXp: 7 },
      { id: 'tinhHoaMoc',   name: 'Tinh Hoa Mộc', gloss: 'Starblossom Wood',  itemId: 'tinhHoaMoc',   zone: 'quanTinhDai',   reqLevel: 78,  xp: 85,  time: 54.0, statXp: 8 },
      { id: 'tramHaiMoc',   name: 'Trầm Hải Mộc', gloss: 'Sea Agarwood',      itemId: 'tramHaiMoc',   zone: 'tichNguDao',    reqLevel: 92,  xp: 125, time: 64.0, statXp: 9 },
      { id: 'thanDanMoc',   name: 'Thần Đàn Mộc', gloss: 'Divine Sandalwood', itemId: 'thanDanMoc',   zone: 'thienThanh',    reqLevel: 100, xp: 170, time: 75.0, statXp: 10 },
    ],
  },
  thaiKhoang: {
    id: 'thaiKhoang', name: 'Đào Khoáng', gloss: 'Khai Khoáng', icon: '⛏️', stat: 'lucDao', stat2: 'hoThe',
    npc: { name: 'Lão Thợ Mỏ Hắc', quote: 'Bảo vật thật nằm sâu trong lòng đất. Đá với quặng, bạn hiền ạ.' },
    actions: [
      { id: 'hacThan',    name: 'Hắc Thán',      gloss: 'Coal Ore',   itemId: 'hacThan',    zone: 'lamLinhCoc',    reqLevel: 1,   xp: 4,   time: 10.9, statXp: 1 },
      { id: 'tichKhoang', name: 'Tích Khoáng',  gloss: 'Tin Ore',    itemId: 'tichKhoang', zone: 'lamLinhCoc',    reqLevel: 1,   xp: 4,   time: 10.9, statXp: 1 },
      { id: 'dongKhoang', name: 'Đồng Khoáng',   gloss: 'Copper Ore', itemId: 'dongKhoang', zone: 'uLam',          reqLevel: 8,   xp: 7,   time: 13.0, statXp: 2 },
      { id: 'thietKhoang',name: 'Thiết Khoáng',    gloss: 'Iron Ore',   itemId: 'thietKhoang',zone: 'huyenDo',       reqLevel: 18,  xp: 12,  time: 20.0, statXp: 3 },
      { id: 'thachKhoi',  name: 'Thạch Khôi',       gloss: 'Limestone',  itemId: 'thachKhoi',  zone: 'huyenDo',       reqLevel: 18,  xp: 14,  time: 22.0, statXp: 3 },
      { id: 'tinhThachKhoang', name: 'Tinh Thạch Khoáng', gloss: 'Crystal Ore',     itemId: 'tinhThachKhoang', zone: 'thuyTinhDong',  reqLevel: 32,  xp: 22,  time: 26.0, statXp: 4 },
      { id: 'hanThietKhoang',  name: 'Hàn Thiết Khoáng',  gloss: 'Frost Iron Ore',  itemId: 'hanThietKhoang',  zone: 'langTieuPhong', reqLevel: 48,  xp: 34,  time: 32.0, statXp: 5 },
      { id: 'hoangKimSa',      name: 'Hoàng Kim Sa',      gloss: 'Gold Sand',       itemId: 'hoangKimSa',      zone: 'meAoLucChau',   reqLevel: 60,  xp: 48,  time: 40.0, statXp: 6 },
      { id: 'vanMauThach',     name: 'Vân Mẫu Thạch',     gloss: 'Cloud Mica',      itemId: 'vanMauThach',     zone: 'phuKhongVien',  reqLevel: 70,  xp: 66,  time: 48.0, statXp: 7 },
      { id: 'vanThiet',        name: 'Vẫn Thiết',         gloss: 'Meteoric Iron',   itemId: 'vanThiet',        zone: 'quanTinhDai',   reqLevel: 78,  xp: 90,  time: 56.0, statXp: 8 },
      { id: 'sanHoKhoang',     name: 'San Hô Khoáng',     gloss: 'Coral Ore',       itemId: 'sanHoKhoang',     zone: 'tichNguDao',    reqLevel: 92,  xp: 130, time: 66.0, statXp: 9 },
      { id: 'thanTinhKhoang',  name: 'Thần Tinh Khoáng',  gloss: 'Divine Ore',      itemId: 'thanTinhKhoang',  zone: 'thienThanh',    reqLevel: 100, xp: 175, time: 78.0, statXp: 10 },
    ],
  },
  dieuNgu: {
    id: 'dieuNgu', name: 'Câu Cá', gloss: 'Câu Cá', icon: '🎣', stat: 'linhXao',
    npc: { name: 'Ông Chài Phúc', quote: 'Nhẫn nại, cậu nhỏ. Bí quyết câu cá là nhẫn nại và chọn đúng chỗ.' },
    actions: [
      { id: 'caTuyet', name: 'Tuyết Ngư', gloss: 'Cod',    itemId: 'caTuyet', zone: 'lamLinhCoc', reqLevel: 1,  xp: 3, time: 10.0, statXp: 1,  inputs: [{ itemId: 'moiHongTrung', qty: 1 }] },
      { id: 'caHoi',   name: 'Hồi Ngư',   gloss: 'Salmon', itemId: 'caHoi',   zone: 'uLam',       reqLevel: 8,  xp: 5, time: 13.0, statXp: 1,  inputs: [{ itemId: 'moiHongTrung', qty: 1 }] },
      { id: 'caTon',   name: 'Hương Ngư', gloss: 'Trout',  itemId: 'caTon',   zone: 'huyenDo',    reqLevel: 18, xp: 8, time: 16.0, statXp: 2,  inputs: [{ itemId: 'moiTepDong', qty: 1 }] },
      { id: 'luNgu',   name: 'Lư Ngư',    gloss: 'Perch',  itemId: 'luNgu',   zone: 'huyenDo',    reqLevel: 18, xp: 9, time: 18.0, statXp: 2,  inputs: [{ itemId: 'moiTepDong', qty: 1 }] },
      { id: 'tinhLanNgu', name: 'Tinh Lân Ngư', gloss: 'Crystalscale Fish', itemId: 'tinhLanNgu', zone: 'thuyTinhDong',  reqLevel: 32,  xp: 18,  time: 24.0, statXp: 4,  inputs: [{ itemId: 'moiTuuKhuc', qty: 1 }] },
      { id: 'bangLanNgu', name: 'Băng Lân Ngư', gloss: 'Frostscale Fish',   itemId: 'bangLanNgu', zone: 'langTieuPhong', reqLevel: 48,  xp: 30,  time: 30.0, statXp: 5,  inputs: [{ itemId: 'moiHanTuy', qty: 1 }] },
      { id: 'ocTuyenNgu', name: 'Ốc Tuyền Ngư', gloss: 'Oasis Fish',        itemId: 'ocTuyenNgu', zone: 'meAoLucChau',   reqLevel: 60,  xp: 44,  time: 38.0, statXp: 6,  inputs: [{ itemId: 'moiHanTuy', qty: 1 }] },
      { id: 'vanLyNgu',   name: 'Vân Lý Ngư',   gloss: 'Cloud Carp',        itemId: 'vanLyNgu',   zone: 'phuKhongVien',  reqLevel: 70,  xp: 60,  time: 46.0, statXp: 7,  inputs: [{ itemId: 'moiVanMong', qty: 1 }] },
      { id: 'tinhDieuNgu',name: 'Tinh Diệu Ngư',gloss: 'Starlight Fish',    itemId: 'tinhDieuNgu',zone: 'quanTinhDai',   reqLevel: 78,  xp: 82,  time: 54.0, statXp: 8,  inputs: [{ itemId: 'moiVanMong', qty: 1 }] },
      { id: 'haiGiaoNgu', name: 'Hải Giao Ngư', gloss: 'Sea Dragon Fish',   itemId: 'haiGiaoNgu', zone: 'tichNguDao',    reqLevel: 92,  xp: 120, time: 64.0, statXp: 9,  inputs: [{ itemId: 'moiGiaoLongDan', qty: 1 }] },
      { id: 'thienTriNgu',name: 'Thiên Trì Ngư',gloss: 'Heavenly Koi',      itemId: 'thienTriNgu',zone: 'thienThanh',    reqLevel: 100, xp: 165, time: 75.0, statXp: 10, inputs: [{ itemId: 'moiThienCau', qty: 1 }] },
    ],

  },

  // ---------------- REFINE / CRAFT ----------------
  daLuyen: {
    id: 'daLuyen', name: 'Luyện Kim', gloss: 'Luyện Quặng', icon: '🔥', stat: 'thanPhap',
    npc: { name: 'Âu Dã Tử', quote: 'Cảm nhận hơi nóng chứ? Lò rèn đang hát đấy.' },
    actions: [
      { id: 'tichDinh',  name: 'Tích Đĩnh', gloss: 'Tin Bar',    itemId: 'tichDinh',  reqLevel: 1,  xp: 2,  time: 10.9, statXp: 1, inputs: [{ itemId: 'tichKhoang', qty: 1 }, { itemId: 'hacThan', qty: 1 }] },
      { id: 'dongDinh',  name: 'Đồng Đĩnh',  gloss: 'Copper Bar', itemId: 'dongDinh',  reqLevel: 8,  xp: 3,  time: 13.6, statXp: 1, inputs: [{ itemId: 'dongKhoang', qty: 1 }, { itemId: 'hacThan', qty: 1 }] },
      { id: 'thietDinh', name: 'Thiết Đĩnh',   gloss: 'Iron Bar',   itemId: 'thietDinh', reqLevel: 18, xp: 7,  time: 20.9, statXp: 2, inputs: [{ itemId: 'thietKhoang', qty: 1 }, { itemId: 'hacThan', qty: 1 }] },
      { id: 'tinhThachDinh', name: 'Tinh Thạch Đĩnh', gloss: 'Crystal Ingot',     itemId: 'tinhThachDinh', reqLevel: 32,  xp: 14,  time: 26.0, statXp: 4,  inputs: [{ itemId: 'tinhThachKhoang', qty: 2 }, { itemId: 'hacThan', qty: 2 }] },
      { id: 'hanThietDinh',  name: 'Hàn Thiết Đĩnh',  gloss: 'Frost Iron Ingot',  itemId: 'hanThietDinh',  reqLevel: 48,  xp: 22,  time: 32.0, statXp: 5,  inputs: [{ itemId: 'hanThietKhoang', qty: 2 }, { itemId: 'hacThan', qty: 2 }] },
      { id: 'hoangKimDinh',  name: 'Hoàng Kim Đĩnh',  gloss: 'Gold Ingot',        itemId: 'hoangKimDinh',  reqLevel: 60,  xp: 32,  time: 40.0, statXp: 6,  inputs: [{ itemId: 'hoangKimSa', qty: 2 }, { itemId: 'hacThan', qty: 3 }] },
      { id: 'vanMauDinh',    name: 'Vân Mẫu Đĩnh',    gloss: 'Cloud Mica Ingot',  itemId: 'vanMauDinh',    reqLevel: 70,  xp: 44,  time: 48.0, statXp: 7,  inputs: [{ itemId: 'vanMauThach', qty: 2 }, { itemId: 'hacThan', qty: 3 }] },
      { id: 'vanThietDinh',  name: 'Vẫn Thiết Đĩnh',  gloss: 'Meteoric Ingot',    itemId: 'vanThietDinh',  reqLevel: 78,  xp: 60,  time: 56.0, statXp: 8,  inputs: [{ itemId: 'vanThiet', qty: 2 }, { itemId: 'hacThan', qty: 3 }] },
      { id: 'sanHoDinh',     name: 'San Hô Đĩnh',     gloss: 'Coral Ingot',       itemId: 'sanHoDinh',     reqLevel: 92,  xp: 85,  time: 66.0, statXp: 9,  inputs: [{ itemId: 'sanHoKhoang', qty: 2 }, { itemId: 'hacThan', qty: 4 }] },
      { id: 'thanTinhDinh',  name: 'Thần Tinh Đĩnh',  gloss: 'Divine Ingot',      itemId: 'thanTinhDinh',  reqLevel: 100, xp: 115, time: 78.0, statXp: 10, inputs: [{ itemId: 'thanTinhKhoang', qty: 2 }, { itemId: 'hacThan', qty: 4 }] },
      // --- Ép Đá Cường Hóa (từ Thỏi) ---
      { id: 'daCuongHoaSo',    name: 'Đá Cường Hóa Sơ',    gloss: 'Forge Stone I',   itemId: 'daCuongHoaSo',    reqLevel: 8,  xp: 6,  time: 16.0, statXp: 1, inputs: [{ itemId: 'dongDinh', qty: 1 }, { itemId: 'hacThan', qty: 1 }] },
      { id: 'daCuongHoaTrung', name: 'Đá Cường Hóa Trung', gloss: 'Forge Stone II',  itemId: 'daCuongHoaTrung', reqLevel: 48, xp: 20, time: 26.0, statXp: 4, inputs: [{ itemId: 'hanThietDinh', qty: 1 }, { itemId: 'hacThan', qty: 2 }] },
      { id: 'daCuongHoaCao',   name: 'Đá Cường Hóa Cao',   gloss: 'Forge Stone III', itemId: 'daCuongHoaCao',   reqLevel: 78, xp: 48, time: 40.0, statXp: 7, inputs: [{ itemId: 'vanThietDinh', qty: 1 }, { itemId: 'hacThan', qty: 3 }] },
    ],
  },
  phanhNham: {
    id: 'phanhNham', name: 'Nấu Ăn', gloss: 'Nấu Ăn', icon: '🍳', stat: 'linhXao',
    npc: { name: 'Đầu Bếp Lữ', quote: 'Mời vào gian bếp của ta. Ở đây ta nấu nướng rất nghiêm túc đấy.' },
    actions: [
      { id: 'khaoCaTuyet', name: 'Tuyết Ngư Nướng', gloss: 'Cooked Cod',    itemId: 'khaoCaTuyet', reqLevel: 1,  xp: 1, time: 7.3,  statXp: 1, inputs: [{ itemId: 'caTuyet', qty: 1 }, { itemId: 'hacThan', qty: 1 }] },
      { id: 'khaoCaHoi',   name: 'Hồi Ngư Nướng',   gloss: 'Cooked Salmon', itemId: 'khaoCaHoi',   reqLevel: 8,  xp: 3, time: 10.9, statXp: 1, inputs: [{ itemId: 'caHoi',   qty: 1 }, { itemId: 'hacThan', qty: 1 }] },
      { id: 'khaoCaTon',   name: 'Hương Ngư Nướng', gloss: 'Cooked Trout',  itemId: 'khaoCaTon',   reqLevel: 18, xp: 5, time: 15.5, statXp: 2, inputs: [{ itemId: 'caTon',   qty: 1 }, { itemId: 'hacThan', qty: 1 }] },
      { id: 'tinhLanHap',    name: 'Tinh Lân Ngư Hấp',   gloss: 'Steamed Crystalfish', itemId: 'tinhLanHap',    reqLevel: 32,  xp: 10, time: 20.0, statXp: 4,  inputs: [{ itemId: 'tinhLanNgu', qty: 1 }, { itemId: 'hacThan', qty: 1 }] },
      { id: 'bangLanNuong',  name: 'Băng Lân Ngư Nướng', gloss: 'Grilled Frostfish',   itemId: 'bangLanNuong',  reqLevel: 48,  xp: 16, time: 26.0, statXp: 5,  inputs: [{ itemId: 'bangLanNgu', qty: 1 }, { itemId: 'hacThan', qty: 1 }] },
      { id: 'ocTuyenHap',    name: 'Canh Ốc Tuyền Ngư',  gloss: 'Oasis Fish Soup',     itemId: 'ocTuyenHap',    reqLevel: 60,  xp: 24, time: 32.0, statXp: 6,  inputs: [{ itemId: 'ocTuyenNgu', qty: 1 }, { itemId: 'hacThan', qty: 1 }] },
      { id: 'vanLyTan',      name: 'Vân Lý Ngư Tần',     gloss: 'Braised Cloud Carp',  itemId: 'vanLyTan',      reqLevel: 70,  xp: 34, time: 40.0, statXp: 7,  inputs: [{ itemId: 'vanLyNgu', qty: 1 }, { itemId: 'hacThan', qty: 2 }] },
      { id: 'tinhDieuNuong', name: 'Tinh Diệu Ngư Nướng',gloss: 'Grilled Starfish',    itemId: 'tinhDieuNuong', reqLevel: 78,  xp: 46, time: 48.0, statXp: 8,  inputs: [{ itemId: 'tinhDieuNgu', qty: 1 }, { itemId: 'hacThan', qty: 2 }] },
      { id: 'haiGiaoHam',    name: 'Hải Giao Ngư Hầm',   gloss: 'Stewed Sea Dragon',   itemId: 'haiGiaoHam',    reqLevel: 92,  xp: 65, time: 58.0, statXp: 9,  inputs: [{ itemId: 'haiGiaoNgu', qty: 1 }, { itemId: 'hacThan', qty: 2 }] },
      { id: 'thienTriTan',   name: 'Thiên Trì Ngư Tần',  gloss: 'Heavenly Koi Stew',   itemId: 'thienTriTan',   reqLevel: 100, xp: 90, time: 70.0, statXp: 10, inputs: [{ itemId: 'thienTriNgu', qty: 1 }, { itemId: 'hacThan', qty: 2 }] },
    ],
  },
  luyenDan: {
    id: 'luyenDan', name: 'Luyện Đan', gloss: 'Luyện Dược', icon: '⚗️', stat: 'thanPhap',
    npc: { name: 'Lý Dược Vương', quote: 'Coi chừng khói độc — và đừng chạm vào thứ gì phát sáng.' },
    actions: [
      { id: 'hoiKhiDan',        name: 'Hồi Khí Đan',         gloss: 'Battle Potion',   itemId: 'hoiKhiDan',        reqLevel: 1, xp: 10, time: 30.0, statXp: 1, inputs: [{ itemId: 'tungMoc', qty: 2 }, { itemId: 'caTuyet', qty: 1 }] },
      { id: 'tieuPhuLinhThach',   name: 'Linh Thạch Tiều Phu',  gloss: 'Essence Crystal', itemId: 'tieuPhuLinhThach',   reqLevel: 2, xp: 20, time: 40.0, statXp: 2, inputs: [{ itemId: 'tungMoc', qty: 3 }, { itemId: 'thachKhoi', qty: 2 }] },
      { id: 'khoangPhuLinhThach', name: 'Linh Thạch Khoáng Phu', gloss: 'Essence Crystal', itemId: 'khoangPhuLinhThach', reqLevel: 3, xp: 22, time: 42.0, statXp: 2, inputs: [{ itemId: 'hacThan', qty: 3 }, { itemId: 'tichKhoang', qty: 2 }] },
    ],
  },
  daTao: {
    id: 'daTao', name: 'Rèn Đúc', gloss: 'Rèn Binh Khí', icon: '🔨', stat: 'lucDao',
    npc: { name: 'Thợ Rèn Lão Cương', quote: 'Đến học rèn à? Tốt. Giang hồ luôn thiếu thợ rèn giỏi.' },
    actions: [
      { id: 'tichSao',   name: 'Cuốc Thiếc', gloss: 'Tin Pickaxe', itemId: 'tichSao',   reqLevel: 1,  xp: 15, time: 30.0, statXp: 2, inputs: [{ itemId: 'tichDinh', qty: 3 }] },
      { id: 'tichGiap',  name: 'Giáp Thiếc', gloss: 'Tin Armor',  itemId: 'tichGiap',  reqLevel: 5,  xp: 25, time: 40.0, statXp: 3, inputs: [{ itemId: 'tichDinh', qty: 5 }] },
      { id: 'thietKiem', name: 'Kiếm Sắt',   gloss: 'Iron Sword', itemId: 'thietKiem', reqLevel: 10, xp: 40, time: 50.0, statXp: 4, inputs: [{ itemId: 'thietDinh', qty: 5 }] },
    ],
  },
  toaQuan: {
    id: 'toaQuan', name: 'Thiền Định', gloss: 'Tĩnh Tọa', icon: '🧘', stat: null,
    npc: { name: 'Hư Vô Lão Nhân', quote: 'Tu chẳng vì mình. Tĩnh tâm lĩnh ngộ, rồi độ cho hậu nhân.' },
    actions: [
      { id: 'thienDinh', name: 'Ngồi Thiền', gloss: 'Meditate', itemId: null, reqLevel: 1, xp: 5, time: 10.0, statXp: 0 },
    ],
  },
  doanhTao: {
    id: 'doanhTao', name: 'Xây Dựng', gloss: 'Doanh Tạo', icon: '🏗️', stat: 'lucDao',
    npc: { name: 'Lỗ Ban', quote: 'Một viên gạch, một thanh xà — động phủ vững từ nền móng mà ra.' },
    actions: [
      { id: 'datSet',    name: 'Đất Sét',  gloss: 'Clay',        itemId: 'datSet',    reqLevel: 1,  xp: 12, time: 38.2, statXp: 1 },
      { id: 'cat',       name: 'Cát',      gloss: 'Sand',        itemId: 'cat',       reqLevel: 1,  xp: 12, time: 38.2, statXp: 1 },
      { id: 'vanYeu',    name: 'Ván Gỗ',   gloss: 'Weak Plank',  itemId: 'vanYeu',    reqLevel: 1,  xp: 17, time: 45.8, statXp: 1, inputs: [{ itemId: 'tungMoc', qty: 3 }] },
      { id: 'gach',      name: 'Gạch',     gloss: 'Brick',       itemId: 'gach',      reqLevel: 10, xp: 58, time: 87.8, statXp: 2, inputs: [{ itemId: 'datSet', qty: 3 }] },
      { id: 'thietKhau', name: 'Khớp Sắt', gloss: 'Iron Fitting',itemId: 'thietKhau', reqLevel: 10, xp: 58, time: 87.8, statXp: 2, inputs: [{ itemId: 'thietDinh', qty: 3 }] },
    ],
  },
};

// RÈN ĐÚC (bước 5): tự sinh công thức rèn cho mọi gear rèn được trong catalog (sample giờ; eq_* thật về sau).
//   Nối thẳng chuỗi Luyện Kim — Thỏi chọn theo tier itemLv (gear.js). Drop-only/boss bị loại.
SKILLS.daTao.actions.push(...forgeableGear(ITEMS).map(mkGearRecipe));

// Tứ Trụ (giữ Hán-Việt — là chỉ số võ học, hợp chất)
export const STATS = {
  lucDao:   { id: 'lucDao',   name: 'Lực Đạo',   gloss: 'Sức Mạnh',  icon: '🔥' },
  hoThe:    { id: 'hoThe',    name: 'Hộ Thể',    gloss: 'Phòng Ngự', icon: '🛡️' },
  thanPhap: { id: 'thanPhap', name: 'Thân Pháp', gloss: 'Tốc Độ',    icon: '⚡' },
  linhXao:  { id: 'linhXao',  name: 'Linh Xảo',  gloss: 'Khéo Léo',  icon: '🎯' },
};
