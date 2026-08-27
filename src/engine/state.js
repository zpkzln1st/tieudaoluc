// ============================================================
// ENGINE — Trạng thái game (data model, serialize được -> DB sau này)
// ============================================================
import { SKILLS } from '../data/skills.js';

export const SAVE_VERSION = 1;

// ============================================================
// CÀI ĐẶT NGƯỜI CHƠI — một bảng DUY NHẤT, dùng cho cả người mới lẫn vá save cũ.
// ⚠ Thêm khoá mới thì CHỈ thêm ở đây. `capNhatCaiDat()` bên main.js đổ mặc định vào save cũ
//   nên người đang chơi có ngay khoá mới mà không cần bump SAVE_VERSION.
// ============================================================
export const CAI_DAT_MAC_DINH = {
  idleCapHours: 8,        // trần treo máy NỀN (Động Phủ cộng thêm — xem idleCapMs)
  giamHieuUng: false,     // tắt hiệu ứng chuyển động trang trí
  netHinh: 'tuDong',      // 'muot' (trần tỉ lệ điểm ảnh 1,5) | 'tuDong' (vẽ đúng độ phân giải màn)
  nguongBaoRoiDo: 2,      // phẩm tối thiểu để nổi toast lúc rơi trang bị (mốc trong QUALITY_KEYS)
  hoiKhiBan: true,        // hỏi lại trước khi bán hàng loạt
  ngonNgu: 'vi',          // 'vi' | 'en' | 'zh' — lớp phủ dịch (src/i18n.js); đổi là tải lại trang
  huyHieuChuyen: 'anSon', // huy hiệu Chuyển dán góc biểu tượng nghề: 'anSon' (ấn đỏ) | 'kimVong' (vòng vàng)
  nhacBat: true,          // bật nhạc nền
  // ⚠ Nấc 55 ra khoảng 0,30 âm lượng thật (bình phương — xem `amLuongThat` ở engine/nhac.js).
  //   Nhạc gen bằng máy nén rất to; để nấc cao hơn là vào game bị dội thẳng vào tai giây đầu tiên.
  nhacAmLuong: 55,        // nấc thanh trượt 0–100
};

export function createInitialState() {
  const skills = {};
  Object.keys(SKILLS).forEach((id) => { skills[id] = { xp: 0 }; });

  return {
    version: SAVE_VERSION,
    player: { name: '', gender: null, class: null, professions: [], created: false, sect: null, avatar: null,
      bio: '',                          // tiểu sử (tối đa 250 ký tự)
      cover: { x: 50, y: 50, z: 1 },   // khung ảnh bìa (background-position %; tâm = 50,50)
      face:  { x: 50, y: 50, z: 1 },   // khung ảnh đại diện
      fxVer: 3,
      location: 'lamLinhCoc' },
    currencies: { bac: 100, honThach: 0, nguyenBao: 5 },
    stats: {
      lucDao:   { xp: 0 },
      hoThe:    { xp: 0 },
      thanPhap: { xp: 0 },
      linhXao:  { xp: 0 },
    },
    skills,
    inventory: {},          // { itemId: qty } — CHỈ vật phẩm xếp chồng (vật liệu/thực phẩm/đan/đồ phổ/trứng). Gear KHÔNG ở đây.
    gearBag: [],            // [instance] — trang bị (loot-hunt): mỗi món 1 instance riêng { uid, gearId, itemLv, quality, reqLevel, stats, he, eleDmg, plus }
    equipment: {},          // { slotId: instance|null } — instance đang mặc (KHÔNG còn id-string)
    enhance: {},            // (LEGACY) { itemId: plus } — đã dời vào instance.plus; giữ để migrate save cũ
    linhThach: {},          // { skillId: itemId } — Linh Thạch đã lắp cho mỗi kỹ năng
    // ĐAN ĐIỀN — số ô đã lấp của từng phẩm, ba nhánh Tinh/Khí/Thần (xem data/dandien.js).
    // ⚠ Save cũ thiếu khoá này: `ddBang()` tự vá về mảng 0, không cần bump SAVE_VERSION.
    danDien: { tinh: [0, 0, 0, 0, 0, 0, 0, 0, 0], khi: [0, 0, 0, 0, 0, 0, 0, 0, 0], than: [0, 0, 0, 0, 0, 0, 0, 0, 0] },
    combat: {               // Tuyệt Học Phổ: trạng thái chiến đấu
      sinhLuc: null,        // Sinh Lực hiện tại (null = đầy); cạn -> Trọng Thương
      noiThuong: false,     // suy yếu (bị hạ) -> chặn chiến đấu tới khi tự hồi đầy HP
      suyYeuUntil: 0,       // mốc Date.now() hồi phục xong (≈ +60s); 0 = không suy yếu
      luongThuc: null,      // Ô Món Ăn: itemId món ăn đang lắp (tự dùng khi Sinh Lực < 25%)
      dan: null,            // Ô Đan: itemId đan đang lắp (tự dùng khi tài nguyên tương ứng < 25%)
      noiLuc: null,         // Nội Lực hiện tại (null = đầy); trôi qua nhiều trận để đan Hồi Khí có tác dụng
      loadout: { tamPhap: 'viemDuong', boPhap: ['tanToc'], biDong: ['viemDuongHoThe', 'sinhSinhBatTuc'], chieu: ['lhd', 'htd', 'ptd'] }, // bài võ: Tâm Pháp + 1-2 Bộ Pháp + 2 Bị Động + chiêu
      owned: { chieu: ['lhd', 'htd', 'ptd'], tamPhap: ['viemDuong'], biDong: ['viemDuongHoThe', 'sinhSinhBatTuc'] }, // võ học đã sở hữu (học/mua mới mở); xem DEFAULT_OWNED ở votong.js
      tang: {},             // Tầng từng chiêu { chieuId: 1..20 } — tiêu Ngộ Tính; thiếu key = Tầng 1
      ngoTinhThuong: 0,     // Ngộ Tính thưởng thêm ngoài EXP (để trống, chừa cho Yêu Vương/Bí Cảnh đợt sau)
    },
    activity: null,         // hoạt động đang chạy — gồm cả Khinh Công (type:'travel') — xem activity.js
    // ⚠ Mặc định NẰM Ở `CAI_DAT_MAC_DINH` ngay dưới, đừng gõ tay hai nơi: save cũ được vá bằng
    //   chính bảng đó lúc nạp (main.js), lệch một khoá là người cũ và người mới chơi hai game khác nhau.
    settings: { ...CAI_DAT_MAC_DINH },
    login: { lastDay: null, streak: 0, ngayCaoNhat: '' },   // điểm danh — `ngayCaoNhat` CHỈ TIẾN KHÔNG LÙI, chặn vặn đồng hồ máy
    titles: { owned: [], equipped: null },   // Danh Hiệu: sở hữu + đang đeo. KHÔNG cho sẵn cái nào —
                                             // 'Sơ Nhập Giang Hồ' nay là thưởng của chuỗi Nhiệm Vụ Tân Thủ.
    counters: { produced: {}, kills: {} },   // đếm chính xác cho nhiệm vụ
    quests: {
      tutorial: { index: 0, base: 0 },
      daily:   { period: null, list: [] },
      weekly:  { period: null, list: [] },
      monthly: { period: null, list: [] },
    },
    lastSave: Date.now(),
  };
}
