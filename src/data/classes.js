// ============================================================
// DATA — Thân phận (Class). Phase 1: bộ IdleMMO reskin Hán-Việt.
// (Phase 2: thay bằng Môn Phái + ngũ hành + cây võ công riêng)
// skill: '<skillId>' -> lớp kỹ năng, +10% EXP skill đó.
// allExpMult -> nhân EXP toàn bộ (hardcore -50%).
// ============================================================
export const CLASSES = {
  // --- Chiến đấu ---
  chienSi: { id: 'chienSi', name: 'Chiến Sĩ', gloss: 'Warrior', group: 'combat', icon: '⚔️',
    desc: 'Thiết cốt cương thân, chính khí ngút trời. Đao thương qua tay hóa sấm sét, lấy cương mãnh phá vạn pháp — chính diện giao phong chẳng chút nao núng.', bonuses: ['+10% Lực Đạo EXP', '+5% Chiến Đấu EXP'] },
  amVe: { id: 'amVe', name: 'Ám Vệ', gloss: 'Shadowblade', group: 'combat', icon: '🗡️',
    desc: 'Ẩn thân trong bóng tối, đến đi tựa gió thoảng. Một nhát đoạt mệnh giữa chớp mắt, thân pháp quỷ dị khiến địch chưa kịp thấy bóng đã thân thủ dị xứ.', bonuses: ['+5% Thân Pháp EXP', '+10% Hiệu suất săn'] },
  duHiep: { id: 'duHiep', name: 'Du Hiệp', gloss: 'Ranger', group: 'combat', icon: '🏹',
    desc: 'Rong ruổi chân trời, cung tiễn bất ly thân. Mũi tên rời dây xuyên mây vọng nguyệt — lấy khoảng cách làm khiên, lấy giang hồ làm nhà.', bonuses: ['+7% Linh Xảo EXP', '+8% Hiệu suất săn'] },

  // --- Kỹ năng ---
  tieuPhu: { id: 'tieuPhu', name: 'Tiều Phu', gloss: 'Lumberjack', group: 'skill', skill: 'phatMoc', icon: '🪓',
    desc: 'Rìu nặng trên vai, sống đời sơn lâm. Mỗi nhát bổ xuống vang động núi rừng, gỗ quý chất đầy — bậc thầy đốn mộc chốn thâm sơn.', bonuses: ['+10% Đốn Củi EXP & Hiệu suất'] },
  khoangDo: { id: 'khoangDo', name: 'Thợ Mỏ', gloss: 'Miner', group: 'skill', skill: 'thaiKhoang', icon: '⛏️',
    desc: 'Lăn lộn nơi hầm sâu lòng đất, mắt tinh nhìn thấu mạch khoáng. Búa chim nện đá toé lửa, moi tận long mạch lấy kim ngọc châu báu.', bonuses: ['+10% Đào Khoáng EXP & Hiệu suất'] },
  nguOng: { id: 'nguOng', name: 'Ngư Ông', gloss: 'Angler', group: 'skill', skill: 'dieuNgu', icon: '🎣',
    desc: 'Một cần buông xuống, tĩnh tọa bên sông. Tâm như nước lặng chờ thời — kiên nhẫn đợi một khắc, cá lớn ắt cắn câu.', bonuses: ['+10% Câu Cá EXP & Hiệu suất'] },
  truSu: { id: 'truSu', name: 'Đầu Bếp', gloss: 'Chef', group: 'skill', skill: 'phanhNham', icon: '🍳',
    desc: 'Tay dao thớt biến sơn hào hải vị thành cao lương. Lửa đượm hương bay, một bàn tiệc đãi anh hùng thiên hạ, no lòng ấm dạ lữ khách phong trần.', bonuses: ['+10% Nấu Ăn EXP & Hiệu suất'] },
  daSu: { id: 'daSu', name: 'Thợ Luyện Kim', gloss: 'Smelter', group: 'skill', skill: 'daLuyen', icon: '🔥',
    desc: 'Đứng giữa lò lửa ngút trời, quặng thô qua tay hóa tinh kim. Nghe hơi nóng mà đoán độ già non, luyện ra thỏi sáng loáng cho bậc thợ rèn.', bonuses: ['+10% Luyện Kim EXP & Hiệu suất'] },
  nguThuSu: { id: 'nguThuSu', name: 'Ngự Thú Sư', gloss: 'Beastmaster', group: 'skill', pet: true, icon: '🐾',
    desc: 'Lòng thông vạn vật, ý thấu muông thú. Thuần phục linh thú sơn lâm làm bạn đồng hành — một tiếng sáo ngân, cả bầy nghe lệnh.', bonuses: ['+10% Ngự Thú EXP'] },

  // --- Khổ tu (khóa — không đổi lại) ---
  pheNhan: { id: 'pheNhan', name: 'Phế Nhân', gloss: 'Forsaken', group: 'hardcore', locked: true, danger: true, allExpMult: 0.5, icon: '💀',
    desc: 'Kẻ tu hành gập ghềnh nhất thiên hạ: căn cơ hao tổn, mỗi bước tiến đẫm mồ hôi xương máu. Chỉ dành cho kẻ ngạo nghễ dám thách thức chính số mệnh.', bonuses: ['-50% MỌI EXP'] },
  luuDay: { id: 'luuDay', name: 'Lưu Đày', gloss: 'Banished', group: 'hardcore', locked: true, danger: true, icon: '⛓️',
    desc: 'Bị giang hồ ruồng bỏ, một thân một bóng bôn tẩu. Không bằng hữu, không giao dịch — chỉ có chính mình và con đường cô độc trải dài phía trước.', bonuses: ['Cấm Giao Dịch', '-50% phí Truyền Tống'] },
  maChung: { id: 'maChung', name: 'Ma Chủng', gloss: 'Cursed', group: 'hardcore', locked: true, danger: true, allExpMult: 0.5, icon: '👹',
    desc: 'Thân mang tà chú thượng cổ, nghịch thiên mà tu. Con đường gian nan bậc nhất thế gian — kẻ nhụt chí chớ dại bước vào, vinh quang chỉ thuộc về kẻ cuồng nhất.', bonuses: ['Lưu Đày + Phế Nhân'] },
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
];
export function ngheBySkill(skillId) { return NGHE.find((n) => n.skill === skillId) || null; }

// Hệ số EXP theo Nghề đã học (state.player.professions). +exp% nếu có nghề khớp kĩ năng.
export function skillExpMultiplier(state, skillId) {
  const profs = (state && state.player && state.player.professions) || [];
  const n = ngheBySkill(skillId);
  return (n && profs.includes(n.id)) ? 1 + n.exp / 100 : 1;
}
// Hệ số Hiệu Suất theo Nghề (giảm thời gian mỗi vòng).
export function professionEffMult(state, skillId) {
  const profs = (state && state.player && state.player.professions) || [];
  const n = ngheBySkill(skillId);
  return (n && profs.includes(n.id)) ? 1 + n.eff / 100 : 1;
}
