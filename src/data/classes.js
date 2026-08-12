// ============================================================
// DATA — Thân phận (Class). Phase 1: bộ IdleMMO reskin Hán-Việt.
// (Phase 2: thay bằng Môn Phái + ngũ hành + cây võ công riêng)
// skill: '<skillId>' -> lớp kỹ năng, +10% EXP skill đó.
// allExpMult -> nhân EXP toàn bộ (hardcore -50%).
// ============================================================
export const CLASSES = {
  // --- Chiến đấu ---
  chienSi: { id: 'chienSi', name: 'Chiến Sĩ', gloss: 'Warrior', group: 'combat', icon: '⚔️',
    desc: 'Thân thể rắn như thép, chính khí ngút trời. Đao thương qua tay hóa thành thế sấm sét, lấy cương mãnh phá vạn pháp; đối đầu trực diện chưa từng nao núng.', bonuses: ['+10% Lực Đạo EXP', '+5% Chiến Đấu EXP'] },
  amVe: { id: 'amVe', name: 'Ám Vệ', gloss: 'Shadowblade', group: 'combat', icon: '🗡️',
    desc: 'Ẩn mình trong bóng tối, đến đi như gió thoảng. Một nhát đoạt mạng trong chớp mắt, thân pháp quỷ dị khiến đối thủ chưa kịp nhìn rõ đã mất mạng.', bonuses: ['+5% Thân Pháp EXP', '+10% Hiệu suất săn'] },
  duHiep: { id: 'duHiep', name: 'Du Hiệp', gloss: 'Ranger', group: 'combat', icon: '🏹',
    desc: 'Rong ruổi khắp chân trời, cung tiễn không rời tay. Mũi tên rời dây xuyên mây đón trăng; lấy khoảng cách làm khiên, lấy giang hồ làm nhà.', bonuses: ['+7% Linh Xảo EXP', '+8% Hiệu suất săn'] },

  // --- Kỹ năng ---
  tieuPhu: { id: 'tieuPhu', name: 'Tiều Phu', gloss: 'Lumberjack', group: 'skill', skill: 'phatMoc', icon: '🪓',
    desc: 'Vác rìu nặng trên vai, sống giữa núi rừng. Mỗi nhát bổ vang động thâm sơn, gỗ quý chất đầy; là bậc thầy đốn mộc nơi rừng sâu.', bonuses: ['+10% Đốn Củi EXP & Hiệu suất'] },
  khoangDo: { id: 'khoangDo', name: 'Thợ Mỏ', gloss: 'Miner', group: 'skill', skill: 'thaiKhoang', icon: '⛏️',
    desc: 'Lăn lộn dưới hầm sâu, đôi mắt tinh tường nhìn ra từng mạch khoáng. Cuốc chim nện đá tóe lửa, lần theo long mạch để tìm kim ngọc và châu báu.', bonuses: ['+10% Đào Khoáng EXP & Hiệu suất'] },
  nguOng: { id: 'nguOng', name: 'Ngư Ông', gloss: 'Angler', group: 'skill', skill: 'dieuNgu', icon: '🎣',
    desc: 'Buông một cần câu, tĩnh tọa bên sông. Tâm lặng như mặt nước, kiên nhẫn chờ đúng thời điểm; chỉ cần đủ tĩnh, cá lớn rồi cũng cắn câu.', bonuses: ['+10% Câu Cá EXP & Hiệu suất'] },
  truSu: { id: 'truSu', name: 'Đầu Bếp', gloss: 'Chef', group: 'skill', skill: 'phanhNham', icon: '🍳',
    desc: 'Dao thớt trong tay biến sơn hào hải vị thành món ngon. Lửa bếp dậy hương, một bàn tiệc đủ đãi anh hùng bốn phương và sưởi ấm lữ khách phong trần.', bonuses: ['+10% Nấu Ăn EXP & Hiệu suất'] },
  daSu: { id: 'daSu', name: 'Thợ Luyện Kim', gloss: 'Smelter', group: 'skill', skill: 'daLuyen', icon: '🔥',
    desc: 'Đứng giữa lò lửa rực trời, biến quặng thô thành tinh kim. Chỉ nghe tiếng lửa và nhìn màu kim loại đã biết độ già non, luyện ra vật liệu tốt cho thợ rèn.', bonuses: ['+10% Luyện Kim EXP & Hiệu suất'] },
  nguThuSu: { id: 'nguThuSu', name: 'Ngự Thú Sư', gloss: 'Beastmaster', group: 'skill', pet: true, icon: '🐾',
    desc: 'Hiểu tính muôn loài, cảm được ý của Linh Thú. Có thể thuần phục thú rừng làm bạn đồng hành; một tiếng sáo vang lên, cả bầy đều nghe lệnh.', bonuses: ['+10% Ngự Thú EXP'] },

  // --- Khổ tu (khóa — không đổi lại) ---
  pheNhan: { id: 'pheNhan', name: 'Phế Nhân', gloss: 'Forsaken', group: 'hardcore', locked: true, danger: true, allExpMult: 0.5, icon: '💀',
    desc: 'Con đường tu hành gian nan bậc nhất: căn cơ hao tổn, mỗi bước tiến đều phải trả bằng mồ hôi và máu. Chỉ hợp với người muốn tự mình thách thức số mệnh.', bonuses: ['-50% MỌI EXP'] },
  luuDay: { id: 'luuDay', name: 'Lưu Đày', gloss: 'Banished', group: 'hardcore', locked: true, danger: true, icon: '⛓️',
    desc: 'Bị giang hồ ruồng bỏ, một thân một bóng phiêu bạt. Không bằng hữu, không giao dịch; chỉ còn chính mình và con đường cô độc phía trước.', bonuses: ['Cấm Giao Dịch', '-50% phí Truyền Tống'] },
  maChung: { id: 'maChung', name: 'Ma Chủng', gloss: 'Cursed', group: 'hardcore', locked: true, danger: true, allExpMult: 0.5, icon: '👹',
    desc: 'Mang tà chú thượng cổ trong người, nghịch thiên mà tu. Đây là một trong những con đường khắc nghiệt nhất; kẻ dễ nản chớ bước vào, phần thưởng chỉ dành cho người đủ gan đi đến cùng.', bonuses: ['Lưu Đày + Phế Nhân'] },
};

export const CLASS_GROUPS = [
  { title: 'Chiến Đấu', ids: ['chienSi', 'amVe', 'duHiep'] },
  { title: 'Kỹ Năng', ids: ['tieuPhu', 'khoangDo', 'nguOng', 'truSu', 'daSu', 'nguThuSu'] },
  { title: 'Khổ Tu (Khóa — thử thách cực khó)', ids: ['pheNhan', 'luuDay', 'maChung'] },
];

// ============================================================
// NGHỀ (Profession) — giang hồ tự do: học từ NPC (bái sư), GIỮ NHIỀU.
// Mỗi nghề +EXP & +Hiệu suất cho 1 kĩ năng sống. (Thay hệ "class" cũ.)
// state.player.professions = [id, ...]
// ============================================================
export const NGHE = [
  { id: 'tieuPhu',    name: 'Tiều Phu',     skill: 'phatMoc',    icon: '🪓', exp: 10, eff: 10, cost: 100, desc: 'Rìu nặng trên vai, bậc thầy đốn mộc chốn thâm sơn.' },
  { id: 'khoangPhu',  name: 'Khoáng Phu',   skill: 'thaiKhoang', icon: '⛏️', exp: 10, eff: 10, cost: 100, desc: 'Mắt tinh nhìn thấu mạch khoáng, moi tận kim ngọc lòng đất.' },
  { id: 'nguOng',     name: 'Ngư Ông',      skill: 'dieuNgu',    icon: '🎣', exp: 10, eff: 10, cost: 100, desc: 'Tĩnh tọa bên sông, kiên nhẫn đợi một khắc cá lớn cắn câu.' },
  { id: 'truSu',      name: 'Trù Sư',       skill: 'phanhNham',  icon: '🍳', exp: 10, eff: 10, cost: 100, desc: 'Tay dao thớt biến sơn hào hải vị thành cao lương.' },
  { id: 'luyenKimSu', name: 'Luyện Kim Sư', skill: 'daLuyen',    icon: '🔥', exp: 10, eff: 10, cost: 120, desc: 'Nghe hơi nóng mà đoán độ già non, luyện quặng thành tinh kim.' },
  { id: 'duocSu',     name: 'Dược Sư',      skill: 'luyenDan',   icon: '⚗️', exp: 10, eff: 10, cost: 150, desc: 'Phối chế đan dược, luyện linh thạch trợ tu.' },
  { id: 'thietTuong', name: 'Thiết Tượng',  skill: 'daTao',      icon: '🔨', exp: 10, eff: 10, cost: 150, desc: 'Rèn binh khí, đúc giáp trụ — lửa đượm thép reo.' },
  { id: 'thienSu',    name: 'Thiền Sư',     skill: 'toaQuan',    icon: '🧘', exp: 10, eff: 10, cost: 120, desc: 'Tĩnh tâm ngộ đạo, vun bồi nội tâm tịch lặng.' },
  { id: 'doanhTaoSu', name: 'Doanh Tạo Sư', skill: 'doanhTao',   icon: '🏗️', exp: 10, eff: 10, cost: 150, desc: 'Bậc thầy kiến tạo, dựng động phủ vững bền.' },
  { id: 'duocNong',   name: 'Dược Nông',    skill: 'thaiDuoc',   icon: '🌿', exp: 10, eff: 10, cost: 100, desc: 'Một giỏ trúc lội khắp sơn dã, cỏ nào là thuốc cỏ nào là độc — nhìn là biết.' },
];
export function ngheBySkill(skillId) { return NGHE.find((n) => n.skill === skillId) || null; }

// Hệ số EXP theo Nghề đã học (state.player.professions). +exp% nếu có nghề khớp kĩ năng.
export function skillExpMultiplier(state, skillId) {
  const profs = (state && state.player && state.player.professions) || [];
  const n = ngheBySkill(skillId);
  const prof = (n && profs.includes(n.id)) ? n.exp / 100 : 0;
  const streak = (state && state.login && state.login.streak) || 0;
  const daily = Math.min(20, Math.floor(streak / 10)) / 100;   // Điểm Danh: +1% EXP mỗi 10 ngày chuỗi, tối đa 20% (áp mọi nguồn EXP)
  return 1 + prof + daily;
}
// Hệ số Hiệu Suất theo Nghề (giảm thời gian mỗi vòng).
export function professionEffMult(state, skillId) {
  const profs = (state && state.player && state.player.professions) || [];
  const n = ngheBySkill(skillId);
  return (n && profs.includes(n.id)) ? 1 + n.eff / 100 : 1;
}
