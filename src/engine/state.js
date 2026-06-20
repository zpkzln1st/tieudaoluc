// ============================================================
// ENGINE — Trạng thái game (data model, serialize được -> DB sau này)
// ============================================================
import { SKILLS } from '../data/skills.js';

export const SAVE_VERSION = 1;

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
    combat: {               // Tuyệt Học Phổ: trạng thái chiến đấu
      sinhLuc: null,        // Sinh Lực hiện tại (null = đầy); cạn -> Trọng Thương
      noiThuong: false,     // suy yếu (bị hạ) -> chặn chiến đấu tới khi tự hồi đầy HP
      suyYeuUntil: 0,       // mốc Date.now() hồi phục xong (≈ +60s); 0 = không suy yếu
      luongThuc: null,      // Ô Món Ăn: itemId món ăn đang lắp (tự dùng khi Sinh Lực < 25%)
      dan: null,            // Ô Đan: itemId đan đang lắp (tự dùng khi tài nguyên tương ứng < 25%)
      noiLuc: null,         // Nội Lực hiện tại (null = đầy); trôi qua nhiều trận để đan Hồi Khí có tác dụng
      loadout: { tamPhap: 'viemDuong', boPhap: ['tanToc'], biDong: ['viemDuongHoThe', 'sinhSinhBatTuc'], chieu: ['lhd', 'htd', 'ptd'] }, // bài võ: Tâm Pháp + 1-2 Bộ Pháp + 2 Bị Động + chiêu
      owned: { chieu: ['lhd', 'htd', 'ptd'], tamPhap: ['viemDuong'], biDong: ['viemDuongHoThe', 'sinhSinhBatTuc'] }, // võ học đã sở hữu (học/mua mới mở); xem DEFAULT_OWNED ở votong.js
    },
    activity: null,         // hoạt động đang chạy — gồm cả Khinh Công (type:'travel') — xem activity.js
    settings: { idleCapHours: 8 },
    login: { lastDay: null, streak: 0 },     // điểm danh
    titles: { owned: ['soNhap'], equipped: 'soNhap' },   // Danh Hiệu: sở hữu + đang đeo (ensureTitles backfill khi load)
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
