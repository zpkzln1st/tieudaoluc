// ============================================================
// ĐĂNG TIÊN MỘNG (登仙夢) — hệ con game THẺ BÀI (deck-battler roguelike).
// CÁCH LY TUYỆT ĐỐI: component này CHỈ đụng state.dangTien (persist Tầng Mộng sâu nhất).
//   KHÔNG import/đụng deriveCombat / gearBag / combat. Mộng cảnh = thắng/thua không phạt thân.
//   (Pha 1: assist đổi Mộng Ngân ↔ Nguyên Bảo cap tuần — CHƯA wire.)
// Logic = bản mockup _mockup/dangtienmong.html đã verify; thêm bridge persist Tầng sâu nhất.
// ============================================================
import { Storage } from './engine/save.js';
import { castFxFor, runFx, runCue, dealsDamage, DTM_VANISH_MS, DTM_VANISH_LEAD } from './dtm_fx.js';

export function ensureDangTien(state) {
  if (!state.dangTien) state.dangTien = {};
  const d = state.dangTien;
  if (d.deepest == null) d.deepest = 0;     // Tầng Mộng sâu nhất từng đạt (meta, persist)
  if (d.runs == null) d.runs = 0;           // số ván đã chơi
  if (d.wins == null) d.wins = 0;           // số ván Đăng Tiên
  // --- Meta-progression "Lĩnh Ngộ Đường" (TẤT CẢ trong state.dangTien -> 0 power về main) ---
  if (d.mongNgan == null) d.mongNgan = 0;   // ví Mộng Ngân PERSISTENT (meta tiêu); tách khỏi ví trong-ván
  if (!d.up) d.up = {};                     // nâng cấp đã mua (CHỈ hiệu lực trong-mộng)
  const u = d.up;
  if (u.hp == null) u.hp = 0;               // Cố Bản: +4 HP nền / bậc (0..5)
  if (u.khi == null) u.khi = 0;             // Tụ Khí: +1 Khí nền (0..1)
  if (u.startRelic === undefined) u.startRelic = null; // Khải Mộng: relic khởi đầu (id) hoặc null
  if (u.reroll == null) u.reroll = 0;       // Tẩy Tâm: số lượt đổi thẻ thưởng / trận (0..2)
  if (u.peek == null) u.peek = false;       // Lưỡng Nghi Kính: xem đòn kế
  if (u.restBonus == null) u.restBonus = false; // Tịnh Thất Phù: Tĩnh Thất hồi 35%
  if (!d.unlockedCards) d.unlockedCards = [];                          // (Đợt 2) mở thẻ Tuyệt theo cột mốc
  if (!d.scMaxByHero) d.scMaxByHero = { kiem: 0, thien: 0, doc: 0 };   // (Đợt 2) Sát Cảnh per-hero
  if (d._firstWin == null) d._firstWin = false; // thưởng-mốc Đăng Tiên lần đầu
  if (d._tierBanked == null) d._tierBanked = 0; // thưởng-mốc tầng sâu nhất
  if (d.activeRun === undefined) d.activeRun = null;                  // (run-resume) snapshot run đang dở
  if (!d.bridgeWeek) d.bridgeWeek = { weekId: null, nbClaimed: 0 };   // (assist) cap TUẦN đổi Mộng Ngân -> Nguyên Bảo (kênh 1 chiều duy nhất ra main)
  return d;
}

export function dangTienMong() {
  const HE_COLOR = { kim: '#facc15', moc: '#34d399', thuy: '#38bdf8', hoa: '#fb7185', tho: '#d8dee9', vatly: '#94a3b8' };
  const HE_NAME = { kim: 'Kim', moc: 'Mộc', thuy: 'Thủy', hoa: 'Hỏa', tho: 'Thổ', vatly: 'Vô' };
  const KHAC = { kim: 'moc', moc: 'tho', tho: 'thuy', thuy: 'hoa', hoa: 'kim' };
  const RAR_C = { thuong: '#94a3b8', hiem: '#38bdf8', tuyet: '#f5b942' };
  const RAR_N = { thuong: 'Thường', hiem: 'Hiếm', tuyet: 'Tuyệt' };
  const POOL = {
    coBanKiem: { name: 'Cơ Bản Kiếm', han: '劍', he: 'vatly', cost: 1, type: 'atk', rar: 'thuong', dmg: 6, desc: 'Gây 6 ST.' },
    coBanQuyen: { name: 'Cơ Bản Quyền', han: '拳', he: 'vatly', cost: 1, type: 'atk', rar: 'thuong', dmg: 5, blk: 3, desc: 'Gây 5 ST · +3 Hộ.' },
    laHan: { name: 'La Hán Quyền', han: '羅', he: 'kim', sect: 'Thiếu Lâm', cost: 2, type: 'atk', rar: 'thuong', dmg: 11, desc: 'Gây 11 ST.' },
    thaiCuc: { name: 'Thái Cực Quyền', han: '極', he: 'tho', sect: 'Võ Đang', cost: 1, type: 'def', rar: 'hiem', blk: 9, desc: '+9 Hộ Thể.' },
    cuuDuong: { name: 'Cửu Dương Thần Công', han: '陽', he: 'hoa', cost: 2, type: 'ky', rar: 'hiem', heal: 7, blk: 4, desc: 'Hồi 7 HP · +4 Hộ.' },
    cuuAm: { name: 'Cửu Âm Chân Kinh', han: '陰', he: 'thuy', cost: 2, type: 'atk', rar: 'hiem', dmg: 5, weaken: 2, desc: '5 ST · Suy Yếu 2.' },
    datMa: { name: 'Đạt Ma Trượng', han: '達', he: 'kim', sect: 'Thiếu Lâm', cost: 2, type: 'atk', rar: 'thuong', dmg: 7, blk: 5, desc: '7 ST · +5 Hộ.' },
    dichCan: { name: 'Dịch Cân Kinh', han: '易', he: 'kim', sect: 'Thiếu Lâm', cost: 1, type: 'ky', rar: 'hiem', str: 3, desc: '+3 Lực cả trận.' },
    amKhi: { name: 'Đường Môn Ám Khí', han: '暗', he: 'moc', sect: 'Đường Môn', cost: 1, type: 'atk', rar: 'thuong', dmg: 3, poison: 4, desc: '3 ST · Độc 4.' },
    hapTinh: { name: 'Hấp Tinh Đại Pháp', han: '吸', he: 'moc', sect: 'Ma Giáo', cost: 2, type: 'atk', rar: 'tuyet', dmg: 7, drain: true, desc: '7 ST · hút máu = ST.' },
    hoaSon: { name: 'Hoa Sơn Kiếm', han: '華', he: 'thuy', sect: 'Hoa Sơn', cost: 2, type: 'atk', rar: 'hiem', dmg: 9, desc: 'Gây 9 ST.' },
    langBa: { name: 'Lăng Ba Vi Bộ', han: '波', he: 'thuy', cost: 1, type: 'ky', rar: 'hiem', blk: 5, dodge: true, desc: '+5 Hộ · NÉ đòn kế.' },
    ngaMi: { name: 'Nga Mi Cửu Dương', han: '峨', he: 'thuy', sect: 'Nga Mi', cost: 1, type: 'ky', rar: 'thuong', heal: 8, desc: 'Hồi 8 HP.' },
    thanhPhong: { name: 'Thanh Phong Bộ', han: '風', he: 'moc', cost: 0, type: 'ky', rar: 'thuong', draw: 2, desc: 'Rút 2 lá.' },
    tichTa: { name: 'Tịch Tà Kiếm', han: '辟', he: 'hoa', sect: 'Nhật Nguyệt', cost: 2, type: 'atk', rar: 'tuyet', dmg: 3, hits: 3, desc: 'Đánh 3 × 3 ST.' },
    thienVuong: { name: 'Thiên Vương Phá', han: '霸', he: 'kim', sect: 'Thiên Vương', cost: 3, type: 'atk', rar: 'tuyet', dmg: 18, desc: 'Gây 18 ST.' },
    taoDang: { name: 'Tảo Đãng Thiên Quân', han: '掃', he: 'vatly', cost: 2, type: 'atk', rar: 'hiem', dmg: 5, aoe: true, desc: 'Gây 5 ST lên TẤT CẢ địch.' },
  };
  const HEROES = [
    { id: 'kiem', name: 'Lãng Kiếm Khách', han: '劍', he: 'kim', hp: 50, khi: 3, passive: 'Lợi Nhận', passiveDesc: 'Thẻ Công đầu mỗi lượt +3 ST.', desc: 'Kiếm khách lãng du, không môn không phái. Lấy nhanh-sắc-chuẩn làm đạo, đánh phủ đầu kết liễu trước khi địch kịp ra chiêu. Hợp lối tấn công dồn dập, kết trận nhanh.', start: ['coBanKiem', 'coBanKiem', 'coBanKiem', 'coBanQuyen', 'tichTa', 'hoaSon', 'langBa', 'dichCan', 'ngaMi', 'thaiCuc'] },
    { id: 'thien', name: 'Khô Thiền Sư', han: '禪', he: 'kim', hp: 64, khi: 3, passive: 'Kim Cương Bất Hoại', passiveDesc: 'Đầu mỗi lượt +3 Hộ Thể.', desc: 'Khổ tăng Thiếu Lâm, hình gầy mà khí vững. Kim thân bất hoại, lấy nhu chí cương — càng đỡ càng bền, lấy thủ làm công. Hợp lối trâu bò, chống đòn đường dài.', start: ['coBanQuyen', 'coBanQuyen', 'laHan', 'laHan', 'datMa', 'thaiCuc', 'thaiCuc', 'dichCan', 'cuuDuong', 'ngaMi'] },
    { id: 'doc', name: 'Cẩm Hương Độc Khách', han: '毒', he: 'moc', hp: 46, khi: 3, passive: 'Dụng Độc', passiveDesc: 'Thẻ gây Độc +2 Độc.', desc: 'Truyền nhân Đường Môn lưu lạc, kiều diễm mà âm độc. Không vội phân thắng bại — gieo độc để thời gian bào mòn đối thủ. Hợp lối độc-DoT, thắng kẻ trâu bò.', start: ['coBanKiem', 'coBanQuyen', 'amKhi', 'amKhi', 'amKhi', 'hapTinh', 'thanhPhong', 'langBa', 'cuuAm', 'ngaMi'] },
  ];
  const RELICS = [
    { id: 'thietGiap', name: 'Huyền Thiết Giáp', han: '鐵', rar: 'thuong', desc: 'Đầu mỗi trận +6 Hộ Thể.' },
    { id: 'ngocBoi', name: 'Tụ Khí Ngọc Bội', han: '氣', rar: 'hiem', desc: 'Lượt đầu mỗi trận +2 Khí.' },
    { id: 'huyetNgoc', name: 'Hồi Huyết Châu', han: '血', rar: 'thuong', desc: 'Thắng trận hồi 5 HP.' },
    { id: 'linhPhu', name: 'Quảng Lãm Phù', han: '符', rar: 'hiem', desc: 'Mỗi lượt rút thêm 1 lá.' },
    { id: 'menhHon', name: 'Hộ Mệnh Hồn Phách', han: '魂', rar: 'tuyet', desc: 'Gục lần đầu → hồi sinh 30% HP.' },
    { id: 'trongGiap', name: 'Trọng Thiết Giáp', han: '甲', rar: 'thuong', desc: 'Đầu mỗi trận +10 Hộ Thể.' },
    { id: 'tuKhiDan', name: 'Tụ Khí Đan', han: '丹', rar: 'thuong', desc: 'Đầu mỗi lượt +3 Hộ Thể.' },
    { id: 'tuBao', name: 'Tụ Bảo Bồn', han: '財', rar: 'thuong', desc: 'Thắng trận thêm 10 Mộng Ngân.' },
    { id: 'bangBoi', name: 'Huyền Băng Bội', han: '冰', rar: 'hiem', desc: 'Đầu mỗi trận rút thêm 2 lá.' },
    { id: 'voTuong', name: 'Vô Tướng Phù', han: '幻', rar: 'hiem', desc: 'Lượt đầu mỗi trận: Né đòn kế.' },
    { id: 'satKhi', name: 'Sát Khí Lệnh', han: '殺', rar: 'hiem', desc: 'Đầu mỗi lượt +1 Lực.' },
    { id: 'docLong', name: 'Độc Long Giới', han: '毒', rar: 'hiem', desc: 'Thẻ gây Độc thêm +2 Độc.' },
    { id: 'lietNhan', name: 'Liệt Nhận Phù', han: '刃', rar: 'hiem', desc: 'Thẻ Công đầu mỗi lượt +3 ST.' },
    { id: 'hoiNguyen', name: 'Hồi Nguyên Châu', han: '元', rar: 'tuyet', desc: 'Thắng trận hồi 12% HP tối đa.' },
    { id: 'kimChung', name: 'Kim Chung Tráo', han: '鐘', rar: 'tuyet', desc: 'Hộ Thể dư cuối lượt giữ lại một nửa.' },
  ];
  const ENEMIES = {
    // --- Lâu la (fodder) ---
    cuongDao: { name: 'Lục Lâm Cường Đạo', han: '盜', he: 'moc', hp: 26, intents: [{ t: 'atk', v: 8 }, { t: 'def', v: 6 }, { t: 'atk', v: 10 }] },
    satThu: { name: 'Hắc Phong Sát Thủ', han: '殺', he: 'kim', hp: 30, intents: [{ t: 'atk', v: 5, hits: 2 }, { t: 'buff', v: 3 }, { t: 'atk', v: 9 }] },
    langYeu: { name: 'Mộng Lang Yêu', han: '狼', he: 'thuy', hp: 28, intents: [{ t: 'atk', v: 7 }, { t: 'atk', v: 7 }, { t: 'def', v: 8 }] },
    taoKhau: { name: 'Thảo Khấu', han: '草', he: 'moc', hp: 22, intents: [{ t: 'atk', v: 6 }, { t: 'def', v: 5 }, { t: 'atk', v: 9 }] },
    daLang: { name: 'Dã Lang', han: '豺', he: 'thuy', hp: 24, intents: [{ t: 'atk', v: 7 }, { t: 'def', v: 4 }, { t: 'atk', v: 6, hits: 2 }] },
    cungThu: { name: 'Lục Lâm Cung Thủ', han: '弓', he: 'kim', hp: 20, intents: [{ t: 'atk', v: 4, hits: 2 }, { t: 'atk', v: 8 }, { t: 'buff', v: 2 }] },
    tanKiem: { name: 'Tán Tu Kiếm Đồ', han: '劍', he: 'tho', hp: 28, intents: [{ t: 'atk', v: 8 }, { t: 'def', v: 6 }, { t: 'atk', v: 11 }] },
    doCo: { name: 'Ngũ Độc Giáo Đồ', han: '蠱', he: 'moc', hp: 26, intents: [{ t: 'atk', v: 5 }, { t: 'atk', v: 4, hits: 2 }, { t: 'def', v: 5 }] },
    luyenKhi: { name: 'Luyện Khí Tán Nhân', han: '焰', he: 'hoa', hp: 30, intents: [{ t: 'atk', v: 9 }, { t: 'buff', v: 3 }, { t: 'atk', v: 7 }] },
    // --- Tinh Anh (elite) ---
    hoaSonKiem: { name: 'Hoa Sơn Kiếm Sĩ', han: '華', he: 'thuy', hp: 46, elite: true, intents: [{ t: 'atk', v: 9 }, { t: 'buff', v: 2 }, { t: 'atk', v: 6, hits: 2 }, { t: 'def', v: 10 }] },
    duongMon: { name: 'Đường Môn Ám Sứ', han: '暗', he: 'moc', hp: 42, elite: true, intents: [{ t: 'atk', v: 6 }, { t: 'atk', v: 4, hits: 2 }, { t: 'heal', v: 8 }, { t: 'atk', v: 11 }] },
    caiBang: { name: 'Cái Bang Trưởng Lão', han: '丐', he: 'hoa', hp: 48, elite: true, intents: [{ t: 'atk', v: 10 }, { t: 'def', v: 8 }, { t: 'atk', v: 7, hits: 2 }, { t: 'buff', v: 3 }] },
    ngaMiSu: { name: 'Nga Mi Sư Thái', han: '峨', he: 'thuy', hp: 46, elite: true, intents: [{ t: 'atk', v: 9 }, { t: 'heal', v: 10 }, { t: 'atk', v: 8 }, { t: 'def', v: 7 }] },
    thieuLam: { name: 'Thiếu Lâm Võ Tăng', han: '禪', he: 'kim', hp: 54, elite: true, intents: [{ t: 'atk', v: 8 }, { t: 'def', v: 12 }, { t: 'atk', v: 12 }, { t: 'buff', v: 2 }] },
    // --- Ác Thủ (mini-boss) ---
    voDang: { name: 'Võ Đang Chân Nhân', han: '太', he: 'tho', hp: 66, elite: true, intents: [{ t: 'atk', v: 11 }, { t: 'def', v: 10 }, { t: 'charge' }, { t: 'atk', v: 20, big: true }, { t: 'heal', v: 8 }] },
    thienSon: { name: 'Thiên Sơn Lão Quái', han: '雪', he: 'tho', hp: 72, elite: true, intents: [{ t: 'atk', v: 12 }, { t: 'charge' }, { t: 'atk', v: 22, big: true }, { t: 'def', v: 10 }, { t: 'atk', v: 8, hits: 2 }] },
    nhatNguyet: { name: 'Nhật Nguyệt Giáo Chủ', han: '日', he: 'hoa', hp: 70, elite: true, intents: [{ t: 'atk', v: 13 }, { t: 'buff', v: 4 }, { t: 'atk', v: 9, hits: 2 }, { t: 'charge' }, { t: 'atk', v: 24, big: true }] },
    bongLai: { name: 'Bồng Lai Tán Tiên', han: '蓬', he: 'kim', hp: 68, elite: true, intents: [{ t: 'atk', v: 11 }, { t: 'heal', v: 12 }, { t: 'def', v: 14 }, { t: 'atk', v: 15 }, { t: 'buff', v: 3 }] },
    // --- Mộng Chủ (boss) ---
    maGiao: { name: 'Ma Giáo Hộ Pháp · tàn niệm', han: '魔', he: 'moc', hp: 84, boss: true, intents: [{ t: 'atk', v: 12 }, { t: 'charge' }, { t: 'atk', v: 24, big: true }, { t: 'def', v: 14 }, { t: 'heal', v: 12 }] },
  };
  // ENC: mỗi ENCOUNTER = mảng ĐỢT (wave); mỗi đợt = mảng id quái. Diệt sạch đợt -> đợt kế tràn vào. (Full 20 tầng ở TIER/ENC mở rộng.)
  const ENC = {
    battle: [
      [['cuongDao']], [['langYeu']], [['satThu']], [['taoKhau']], [['daLang']], [['cungThu']],
      [['cuongDao', 'langYeu']], [['taoKhau', 'taoKhau']], [['satThu', 'cungThu']], [['daLang', 'langYeu']],
      [['tanKiem']], [['doCo']], [['luyenKhi']], [['tanKiem', 'cungThu']], [['luyenKhi', 'doCo']], [['cuongDao', 'cuongDao']],
    ],
    swarm: [   // Vây Khốn: 2-3 ĐỢT, đợt cuối thường có Tinh Anh
      [['cuongDao', 'cuongDao'], ['satThu', 'langYeu']],
      [['taoKhau', 'taoKhau', 'taoKhau'], ['cungThu', 'cungThu'], ['hoaSonKiem']],
      [['langYeu', 'langYeu'], ['daLang', 'satThu'], ['duongMon']],
      [['doCo', 'doCo'], ['tanKiem', 'luyenKhi'], ['caiBang']],
      [['cungThu', 'cungThu', 'cungThu'], ['satThu', 'satThu'], ['thieuLam']],
      [['taoKhau', 'daLang'], ['cuongDao', 'cuongDao']],
    ],
    elite: [
      [['hoaSonKiem']], [['duongMon']], [['caiBang']], [['ngaMiSu']], [['thieuLam']],
      [['satThu', 'satThu'], ['hoaSonKiem']], [['taoKhau', 'taoKhau'], ['duongMon']], [['cungThu', 'cungThu'], ['caiBang']],
    ],
    miniboss: [   // Ác Thủ: mini-boss (một số có đợt lâu la mở màn / kết boss)
      [['voDang']], [['thienSon']], [['nhatNguyet']], [['bongLai']],
      [['taoKhau', 'taoKhau'], ['voDang']], [['satThu', 'langYeu'], ['thienSon']],
      [['doCo', 'doCo'], ['caiBang'], ['nhatNguyet']],
    ],
    boss: [   // Mộng Chủ: chung kết đa đợt
      [['thieuLam', 'ngaMiSu'], ['maGiao']],
      [['cungThu', 'cungThu'], ['nhatNguyet'], ['maGiao']],
    ],
  };
  const EART = { hoaSonKiem: 'port_master_hoa_son', duongMon: 'port_master_duong_mon', maGiao: 'port_master_ma_giao', caiBang: 'port_master_cai_bang', ngaMiSu: 'port_master_nga_mi', thieuLam: 'port_master_thieu_lam', voDang: 'port_master_vo_dang', thienSon: 'port_master_thien_son', nhatNguyet: 'port_master_nhat_nguyet', bongLai: 'port_master_bong_lai', taoKhau: 'cuongDao', daLang: 'langYeu', cungThu: 'satThu' };   // elite/mini-boss mượn chân dung chưởng môn; lâu la mới mượn 3 art cơ bản; tanKiem/doCo/luyenKhi -> Hán (art sau)
  // BỘ BÀI QUÁI (repertoire): mỗi quái có chuỗi chiêu RIÊNG (song song intents), telegraph = chip lá kế. {nm,han,art} — art mượn book_* (chỉ chip mini), hiệu lực vẫn theo intent.
  const MOVES = {
    cuongDao: [ { nm: 'Loạn Đao Trảm', han: '刀', art: 'book_dat_ma_truong' }, { nm: 'Thiết Bài Hộ', han: '盾', art: 'book_thai_cuc_quyen' }, { nm: 'Đoạt Mệnh Kích', han: '奪', art: 'book_la_han_quyen' } ],
    satThu: [ { nm: 'Tỏa Hầu Đoản Nhận', han: '刺', art: 'book_tich_ta_kiem' }, { nm: 'Ngưng Sát Khí', han: '殺', art: 'book_dich_can_kinh' }, { nm: 'Đoạt Phách Kích', han: '魄', art: 'book_hoa_son_kiem' } ],
    langYeu: [ { nm: 'Lang Liệt Trảo', han: '爪', art: 'book_hoa_son_kiem' }, { nm: 'Giảo Sát', han: '噬', art: 'book_la_han_quyen' }, { nm: 'Súc Thân Hộ', han: '護', art: 'book_thai_cuc_quyen' } ],
    hoaSonKiem: [ { nm: 'Hoa Sơn Nhất Kiếm', han: '華', art: 'book_hoa_son_kiem' }, { nm: 'Ngưng Kiếm Ý', han: '意', art: 'book_dich_can_kinh' }, { nm: 'Mai Hoa Song Kiếm', han: '梅', art: 'book_tich_ta_kiem' }, { nm: 'Kiếm Phong Hộ Thân', han: '守', art: 'book_thai_cuc_quyen' } ],
    duongMon: [ { nm: 'Mãn Thiên Ám Khí', han: '暗', art: 'book_duong_mon_am_khi' }, { nm: 'Liên Châu Đoản Tiễn', han: '箭', art: 'book_duong_mon_am_khi' }, { nm: 'Liệu Thương Đan', han: '藥', art: 'book_nga_mi_cuu_duong' }, { nm: 'Thấu Cốt Châm', han: '釘', art: 'book_tich_ta_kiem' } ],
    maGiao: [ { nm: 'Huyết Ma Trảo', han: '魔', art: 'book_hap_tinh_dai_phap' }, { nm: 'Tụ Ma Khí', han: '蓄', art: 'book_cuu_am' }, { nm: 'Thiên Ma Hủy Diệt', han: '殛', art: 'book_hap_tinh_dai_phap' }, { nm: 'Ma Khí Hộ Thể', han: '罡', art: 'book_thai_cuc_quyen' }, { nm: 'Hấp Tinh Hoàn Nguyên', han: '吸', art: 'book_hap_tinh_dai_phap' } ],
    taoKhau: [ { nm: 'Cường Đao', han: '刀', art: 'book_dat_ma_truong' }, { nm: 'Thô Bài Đáng', han: '盾', art: 'book_thai_cuc_quyen' }, { nm: 'Bổ Sát', han: '劈', art: 'book_la_han_quyen' } ],
    daLang: [ { nm: 'Dã Trảo', han: '爪', art: 'book_hoa_son_kiem' }, { nm: 'Cúp Mình', han: '伏', art: 'book_thai_cuc_quyen' }, { nm: 'Liên Giảo', han: '噬', art: 'book_la_han_quyen' } ],
    cungThu: [ { nm: 'Liên Tiễn', han: '箭', art: 'book_duong_mon_am_khi' }, { nm: 'Xuyên Vân Tiễn', han: '弓', art: 'book_duong_mon_am_khi' }, { nm: 'Ngưng Thần', han: '神', art: 'book_dich_can_kinh' } ],
    tanKiem: [ { nm: 'Tán Kiếm Trảm', han: '劍', art: 'book_hoa_son_kiem' }, { nm: 'Thủ Thế', han: '守', art: 'book_thai_cuc_quyen' }, { nm: 'Đoạt Mệnh Kiếm', han: '奪', art: 'book_tich_ta_kiem' } ],
    doCo: [ { nm: 'Cổ Độc Thích', han: '蠱', art: 'book_duong_mon_am_khi' }, { nm: 'Song Độc Châm', han: '針', art: 'book_duong_mon_am_khi' }, { nm: 'Độc Vụ Chướng', han: '障', art: 'book_thai_cuc_quyen' } ],
    luyenKhi: [ { nm: 'Hỏa Chưởng', han: '焰', art: 'book_cuu_duong' }, { nm: 'Vận Hỏa Khí', han: '蓄', art: 'book_dich_can_kinh' }, { nm: 'Liệt Diễm Chưởng', han: '烈', art: 'book_cuu_duong' } ],
    caiBang: [ { nm: 'Đả Cẩu Bổng', han: '棒', art: 'book_dat_ma_truong' }, { nm: 'Túy Bộ Hộ', han: '醉', art: 'book_thai_cuc_quyen' }, { nm: 'Liên Hoàn Bổng', han: '連', art: 'book_la_han_quyen' }, { nm: 'Vận Kình', han: '蓄', art: 'book_dich_can_kinh' } ],
    ngaMiSu: [ { nm: 'Nga Mi Thích', han: '峨', art: 'book_hoa_son_kiem' }, { nm: 'Liệu Thương Chú', han: '藥', art: 'book_nga_mi_cuu_duong' }, { nm: 'Phật Quang Kiếm', han: '光', art: 'book_tich_ta_kiem' }, { nm: 'Kim Đỉnh Hộ', han: '頂', art: 'book_thai_cuc_quyen' } ],
    thieuLam: [ { nm: 'La Hán Quyền', han: '羅', art: 'book_la_han_quyen' }, { nm: 'Kim Cương Thân', han: '剛', art: 'book_thai_cuc_quyen' }, { nm: 'Vi Đà Chử', han: '杵', art: 'book_dat_ma_truong' }, { nm: 'Vận Thiền', han: '禪', art: 'book_dich_can_kinh' } ],
    voDang: [ { nm: 'Thái Cực Kiếm', han: '太', art: 'book_thai_cuc_quyen' }, { nm: 'Miên Chưởng Hộ', han: '綿', art: 'book_thai_cuc_quyen' }, { nm: 'Vận Lưỡng Nghi', han: '蓄', art: 'book_cuu_am' }, { nm: 'Tứ Lạng Bạt Cân', han: '撥', art: 'book_dat_ma_truong' }, { nm: 'Đạo Môn Liệu Thương', han: '丹', art: 'book_nga_mi_cuu_duong' } ],
    thienSon: [ { nm: 'Thiên Sơn Chưởng', han: '雪', art: 'book_cuu_am' }, { nm: 'Ngưng Băng Khí', han: '蓄', art: 'book_cuu_am' }, { nm: 'Băng Phách Hàn Quang', han: '殛', art: 'book_tich_ta_kiem' }, { nm: 'Hàn Băng Hộ Thể', han: '盾', art: 'book_thai_cuc_quyen' }, { nm: 'Song Sát Chưởng', han: '掌', art: 'book_la_han_quyen' } ],
    nhatNguyet: [ { nm: 'Nhật Nguyệt Kiếm', han: '日', art: 'book_tich_ta_kiem' }, { nm: 'Ngưng Ma Khí', han: '罡', art: 'book_hap_tinh_dai_phap' }, { nm: 'Song Nguyệt Trảm', han: '月', art: 'book_tich_ta_kiem' }, { nm: 'Tụ Ma Vận Công', han: '蓄', art: 'book_hap_tinh_dai_phap' }, { nm: 'Nhật Nguyệt Hủy Diệt', han: '殛', art: 'book_hap_tinh_dai_phap' } ],
    bongLai: [ { nm: 'Bồng Lai Kiếm', han: '蓬', art: 'book_hoa_son_kiem' }, { nm: 'Ngọc Lộ Hồi Xuân', han: '露', art: 'book_nga_mi_cuu_duong' }, { nm: 'Tiên Thiên Hộ Thể', han: '仙', art: 'book_thai_cuc_quyen' }, { nm: 'Ngự Kiếm Thuật', han: '御', art: 'book_tich_ta_kiem' }, { nm: 'Vận Tiên Khí', han: '蓄', art: 'book_dich_can_kinh' } ],
  };
  // 20 TẦNG — khó dần: Đấu -> Tinh Anh -> Ác Thủ (7/14/17) -> Vây Khốn (từ 9) -> Mộng Chủ (20). Xen Kỳ Ngộ/Mộng Thị/Tĩnh Thất để nghỉ.
  const TIER = [
    { types: ['battle'] },
    { types: ['battle', 'event'] },
    { types: ['battle', 'shop'] },
    { types: ['battle', 'event', 'rest'] },
    { types: ['elite', 'battle'] },
    { types: ['battle', 'shop', 'event'] },
    { types: ['miniboss'] },
    { types: ['battle', 'rest'] },
    { types: ['swarm', 'battle'] },
    { types: ['elite', 'event', 'shop'] },
    { types: ['swarm', 'battle', 'rest'] },
    { types: ['battle', 'elite'] },
    { types: ['swarm', 'event'] },
    { types: ['miniboss'] },
    { types: ['elite', 'shop', 'rest'] },
    { types: ['swarm', 'battle'] },
    { types: ['miniboss', 'elite'] },
    { types: ['swarm', 'event', 'rest'] },
    { types: ['elite', 'swarm', 'shop'] },
    { types: ['boss'] },
  ];
  // 3 TRÙNG (cảnh giới mộng) — gom 20 tầng thành 3 dải, mỗi Trùng 1 nền cảnh (dùng lại dream_*) + tông màu. Thứ tự HIỂN THỊ trên->dưới = Trùng 3->1.
  const TRUNG = [
    { idx: 2, bg: 'dream_boss', han: '淵', name: 'Đệ Tam Trùng · Mộng Chủ Ma Uyên', tint: '#2a0a1e', hanC: '#fb7185' },
    { idx: 1, bg: 'dream_deep', han: '幽', name: 'Đệ Nhị Trùng · Thâm Mộng U Cảnh', tint: '#0a2233', hanC: '#38bdf8' },
    { idx: 0, bg: 'dream_shallow', han: '夢', name: 'Đệ Nhất Trùng · Sơ Nhập Mộng Cảnh', tint: '#0c2119', hanC: '#34d399' },
  ];
  // Lĩnh Ngộ Đường — nâng cấp vĩnh viễn mua bằng Mộng Ngân persistent, CHỈ hiệu lực TRONG mộng (0 power về main).
  const META_UP = [
    { id: 'coBan', key: 'hp', kind: 'level', name: 'Cố Bản', han: '固', desc: '+4 HP tối đa mỗi ván.', costs: [120, 240, 420, 660, 980], gate: null, gateText: '' },
    { id: 'tuKhi', key: 'khi', kind: 'level', name: 'Tụ Khí', han: '氣', desc: '+1 Khí tối đa mỗi lượt.', costs: [800], gate: 'win1', gateText: 'Cần Đăng Tiên 1 lần' },
    { id: 'khaiMong', key: 'startRelic', kind: 'relic', name: 'Khải Mộng Di Vật', han: '啟', desc: 'Vào ván kèm sẵn 1 Di Vật chọn trước.', costs: [600], gate: 'deep4', gateText: 'Cần đạt Tầng 4' },
    { id: 'tayTam', key: 'reroll', kind: 'level', name: 'Tẩy Tâm', han: '洗', desc: '+1 lượt đổi bộ thẻ thưởng mỗi trận.', costs: [300, 700], gate: null, gateText: '' },
    { id: 'luongNghi', key: 'peek', kind: 'flag', name: 'Lưỡng Nghi Kính', han: '鏡', desc: 'Xem trước đòn KẾ của địch.', costs: [500], gate: null, gateText: '' },
    { id: 'tinhThat', key: 'restBonus', kind: 'flag', name: 'Tịnh Thất Phù', han: '淨', desc: 'Tĩnh Thất hồi 35% (thay 30%).', costs: [1000], gate: null, gateText: '' },
  ];
  const DTM_SC_MAX = 6;   // Sát Cảnh bậc tối đa (MVP); mở rộng sau
  const DTM_BRIDGE_RATE = 20;      // (assist) đổi bao nhiêu Mộng Ngân lấy 1 Nguyên Bảo — DRAFT
  const DTM_BRIDGE_WEEKCAP = 60;   // (assist) trần Nguyên Bảo đổi được mỗi tuần — DRAFT
  let _uid = 0;
  const mk = (id) => ({ uid: ++_uid, _cast: null, id, ...POOL[id] });
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];

  return {
    phase: 'lobby', runNgan: 0, run: null, openDeck: false, deepest: 0, metaTab: false, bridgeTab: false, rerollLeft: 0, _bankGain: 0, scSel: { kiem: 0, thien: 0, doc: 0 }, _newUnlocks: [], _newScUnlocked: 0,
    map: [], mapTier: 0, mapView: [], battleKind: null, waves: [], waveIdx: 0, _waveFlash: 0,
    enemies: [], targetIdx: 0, player: { block: 0, str: 0, dodge: false }, maxKhi: 3, khi: 3,
    drawPile: [], hand: [], discard: [], log: '', playerHit: false, playerFloats: [], _f: 0, _firstAtkUsed: false, _shake: false, _hitstop: false, _winning: false, selUid: null,
    rewardCards: [], rewardGold: 0, event: {}, shopItems: [], _gotRelic: null,
    HEROES, RELICS, metaUp: META_UP,
    lobbyFoes: [
      { art: 'cuongDao', nm: 'Cường Đạo' }, { art: 'satThu', nm: 'Sát Thủ' },
      { art: 'port_master_hoa_son', nm: 'Hoa Sơn' }, { art: 'port_master_duong_mon', nm: 'Đường Môn' },
      { art: 'port_master_ma_giao', nm: 'Mộng Chủ' }, { locked: true }, { locked: true },
    ],
    lobbyCards: [
      { id: 'thienVuong', nm: 'Thiên Vương' }, { id: 'cuuDuong', nm: 'Cửu Dương' },
      { id: 'tichTa', nm: 'Tịch Tà' }, { id: 'hoaSon', nm: 'Hoa Sơn' }, { locked: true }, { locked: true },
    ],
    // ----- BRIDGE persist (chỉ Tầng Mộng sâu nhất, cách ly) -----
    dtInit() { try { this._rootEl = this.$el; const g = this.$store.game; ensureDangTien(g.state); this.deepest = g.state.dangTien.deepest || 0; this.scSel = Object.assign({ kiem: 0, thien: 0, doc: 0 }, g.state.dangTien.scMaxByHero || {}); } catch (e) {} },
    persist() { try { const g = this.$store.game; const s = g.state.dangTien; s.deepest = Math.max(s.deepest || 0, this.deepest || 0); Storage.save(g.state); } catch (e) {} },
    // Bank phần Mộng Ngân chưa tiêu của ván vào VÍ PERSISTENT khi kết ván (thắng/thua/tỉnh giấc). CHỈ ghi state.dangTien.mongNgan.
    bankRun(won) {
      try {
        const s = this.$store.game.state.dangTien; const sc = (this.run && this.run.sc) || 0;
        const rate = Math.min((won ? 0.50 : 0.35) + 0.08 * sc, 0.90);
        let gain = Math.round((this.runNgan || 0) * rate);
        if (won && !s._firstWin) { gain += 100; s._firstWin = true; }                 // Đăng Tiên lần đầu
        if (won && sc > 0) { const hid = this.run.hero.id; const cm = s.scMaxByHero[hid] || 0; if (sc >= cm && cm < DTM_SC_MAX) gain += 50; } // mở bậc Sát Cảnh mới
        if ((this.deepest || 0) > (s._tierBanked || 0)) { gain += 30 * (this.deepest - (s._tierBanked || 0)); s._tierBanked = this.deepest; } // tầng mới
        s.mongNgan = (s.mongNgan || 0) + gain; this._bankGain = gain;
        Storage.save(this.$store.game.state);
      } catch (e) {}
    },
    // ----- Lĩnh Ngộ Đường (đọc/ghi state.dangTien.up + .mongNgan; KHÔNG đụng main) -----
    _up() { try { return this.$store.game.state.dangTien.up || {}; } catch (e) { return {}; } },
    metaNgan() { try { return this.$store.game.state.dangTien.mongNgan || 0; } catch (e) { return 0; } },
    // ----- Assist bridge: đổi Mộng Ngân (persistent) -> chút Nguyên Bảo (main), CAP theo TUẦN. KÊNH 1 CHIỀU DUY NHẤT chạm state.currencies (cố ý, cách ly còn lại giữ). -----
    _weekId() { try { const d = new Date(); const dow = (d.getDay() + 6) % 7; const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow); const p = (x) => String(x).padStart(2, '0'); return mon.getFullYear() + '-' + p(mon.getMonth() + 1) + '-' + p(mon.getDate()); } catch (e) { return '0'; } },
    _bridge() { const s = this.$store.game.state.dangTien; if (!s.bridgeWeek) s.bridgeWeek = { weekId: null, nbClaimed: 0 }; const wk = this._weekId(); if (s.bridgeWeek.weekId !== wk) { s.bridgeWeek.weekId = wk; s.bridgeWeek.nbClaimed = 0; } return s.bridgeWeek; },
    bridgeRate() { return DTM_BRIDGE_RATE; }, bridgeCap() { return DTM_BRIDGE_WEEKCAP; },
    bridgeClaimed() { return this._bridge().nbClaimed; },
    bridgeRemaining() { return Math.max(0, DTM_BRIDGE_WEEKCAP - this._bridge().nbClaimed); },
    bridgeMaxNow() { return Math.min(this.bridgeRemaining(), Math.floor(this.metaNgan() / DTM_BRIDGE_RATE)); },
    exchangeNgan(n) {
      try {
        const g = this.$store.game; const s = g.state.dangTien; const b = this._bridge();
        const take = Math.min(Math.floor(n) || 0, this.bridgeRemaining(), Math.floor((s.mongNgan || 0) / DTM_BRIDGE_RATE));
        if (take <= 0) return;
        s.mongNgan -= take * DTM_BRIDGE_RATE;
        g.state.currencies.nguyenBao = (g.state.currencies.nguyenBao || 0) + take;   // *** cầu nối duy nhất ra main (cap tuần) ***
        b.nbClaimed += take;
        Storage.save(g.state);
      } catch (e) {}
    },
    upLevel(u) { const up = this._up(); return u.kind === 'level' ? (up[u.key] || 0) : (up[u.key] ? 1 : 0); },
    upMax(u) { return u.kind === 'level' ? u.costs.length : 1; },
    upMaxed(u) { return this.upLevel(u) >= this.upMax(u); },
    upNextCost(u) { const L = this.upLevel(u); return L < this.upMax(u) ? u.costs[L] : null; },
    upGateOk(u) { try { const s = this.$store.game.state.dangTien; if (!u.gate) return true; if (u.gate === 'win1') return (s.wins || 0) >= 1; if (u.gate === 'deep4') return (s.deepest || 0) >= 4; } catch (e) {} return true; },
    upCanBuy(u) { const c = this.upNextCost(u); return c != null && this.upGateOk(u) && this.metaNgan() >= c; },
    upPips(u) { const L = this.upLevel(u), M = this.upMax(u); let s = ''; for (let i = 0; i < M; i++) s += (i < L ? '●' : '○'); return s; },
    buyUp(id) { const u = META_UP.find((x) => x.id === id); if (!u || !this.upCanBuy(u)) return; const s = this.$store.game.state.dangTien; s.mongNgan -= this.upNextCost(u); const up = s.up; if (u.kind === 'level') up[u.key] = (up[u.key] || 0) + 1; else if (u.kind === 'flag') up[u.key] = true; else if (u.kind === 'relic') up[u.key] = up[u.key] || 'thietGiap'; try { Storage.save(this.$store.game.state); } catch (e) {} },
    setStartRelic(id) { try { const s = this.$store.game.state.dangTien; if (s.up.startRelic == null) return; s.up.startRelic = id; Storage.save(this.$store.game.state); } catch (e) {} },
    _setReroll() { this.rerollLeft = (this._up().reroll) || 0; },
    reroll() {
      if (this.rerollLeft <= 0) return; this.rerollLeft--;
      if (this.phase === 'reward') { this.rewardCards = shuffle(Object.keys(POOL).filter((k) => !['coBanKiem', 'coBanQuyen'].includes(k) && this._cardUnlocked(k))).slice(0, 3).map(mk); }
      else if (this.phase === 'shop') { const keys = shuffle(Object.keys(POOL).filter((k) => !['coBanKiem', 'coBanQuyen'].includes(k) && this._cardUnlocked(k))).slice(0, 3); this.shopItems = keys.map((k) => { const card = mk(k); const price = card.rar === 'tuyet' ? 75 : (card.rar === 'hiem' ? 50 : 30); return { card, price, sold: false }; }); }
      this._saveRun();
    },
    // ----- Sát Cảnh (Ascension per-hero) -----
    scMax() { return DTM_SC_MAX; },
    scMaxOf(id) { try { return (this.$store.game.state.dangTien.scMaxByHero || {})[id] || 0; } catch (e) { return 0; } },
    setSc(id, n) { this.scSel[id] = Math.max(0, Math.min(n, this.scMaxOf(id))); },
    scModsList(n) { const a = []; if (!n || n <= 0) return a; a.push('Tàn niệm +' + (8 * n) + '% HP'); if (n >= 2) a.push('Mộng Ngân trong ván ×0.9'); if (n >= 3) a.push('Vào ván −3 HP'); if (n >= 4) a.push('HP khởi đầu ×0.9'); if (n >= 5) a.push('Mộng Thị +15% giá · Tĩnh Thất −5%'); return a; },
    scBankPct(n) { return Math.round(8 * (n || 0)); },   // +8%/bậc bank
    // ----- Mở thẻ Tuyệt theo cột mốc (CHỈ lọc roll thưởng/shop; bộ khởi đầu hero giữ nguyên) -----
    _cardUnlocked(id) { const c = POOL[id]; if (!c || c.rar !== 'tuyet') return true; try { return (this.$store.game.state.dangTien.unlockedCards || []).includes(id); } catch (e) { return false; } },
    _checkUnlocks() {
      try {
        const s = this.$store.game.state.dangTien; const u = s.unlockedCards; const dp = this.deepest || 0;
        const add = (id) => { if (!u.includes(id)) { u.push(id); (this._newUnlocks = this._newUnlocks || []).push(id); } };
        if ((s.wins || 0) >= 1) add('thienVuong');   // hạ Mộng Chủ -> đoạt Thiên Vương Phá
        if (dp >= 3) add('hapTinh');                  // Tầng 3 -> Hấp Tinh
        if (dp >= 4) add('tichTa');                   // Tầng 4 -> Tịch Tà
      } catch (e) {}
    },
    cardName(id) { return (POOL[id] || {}).name || id; },
    unlockCondText(id) { return { thienVuong: 'Hạ Mộng Chủ (Đăng Tiên)', hapTinh: 'Đạt Tầng 3', tichTa: 'Đạt Tầng 4' }[id] || ''; },
    lobbyCardLocked(c) { return !!(c && c.id && (POOL[c.id] || {}).rar === 'tuyet' && !this._cardUnlocked(c.id)); },

    heColor(h) { return HE_COLOR[h] || '#cbd5e1'; }, heName(h) { return HE_NAME[h] || ''; },
    typeLabel(c) { return { atk: 'Công', def: 'Thủ', ky: 'Kỹ' }[c.type] || ''; },
    rarColor(r) { return RAR_C[r] || '#94a3b8'; }, rarName(r) { return RAR_N[r] || ''; },
    // ----- ART (onerror tự ẩn -> lộ Hán) -----
    cardImg(id) { const m = { coBanKiem: 'book_co_ban_kiem', coBanQuyen: 'book_co_ban_quyen', cuuAm: 'book_cuu_am', cuuDuong: 'book_cuu_duong', datMa: 'book_dat_ma_truong', dichCan: 'book_dich_can_kinh', amKhi: 'book_duong_mon_am_khi', hapTinh: 'book_hap_tinh_dai_phap', hoaSon: 'book_hoa_son_kiem', laHan: 'book_la_han_quyen', langBa: 'book_lang_ba_vi_bo', ngaMi: 'book_nga_mi_cuu_duong', thaiCuc: 'book_thai_cuc_quyen', thanhPhong: 'book_thanh_phong_bo', tichTa: 'book_tich_ta_kiem' }; return 'images/cards/' + (m[id] || id) + '.webp'; },
    heroImg(id) { return 'images/dtm/heroes/' + id + '.webp'; },
    enemyImg(e) { return 'images/dtm/enemies/' + (e._art || 'cuongDao') + '.webp'; },
    relicImg(id) { return 'images/dtm/relics/' + id + '.webp'; },
    statusIcon(k) { return 'images/dtm/vfx/st_' + k + '.webp'; },
    sigilImg(he) { return (he && he !== 'vatly') ? 'images/dtm/vfx/sigil_' + he + '.webp' : ''; },
    vfxImg(he) { return 'images/dtm/vfx/vfx_' + he + '.webp'; },
    bgImg() { if (this.phase === 'lobby' || this.phase === 'hero') return 'images/dtm/bg/lobby.webp'; const t = this.mapTier; return 'images/dtm/bg/' + (this.battleKind === 'boss' || t >= 4 ? 'dream_boss' : (t >= 2 ? 'dream_deep' : 'dream_shallow')) + '.webp'; },
    nodeHan(t) { return { battle: '敵', swarm: '圍', elite: '雄', miniboss: '尊', event: '緣', shop: '市', rest: '憩', boss: '魔' }[t] || '敵'; },
    nodeLabel(t) { return { battle: 'Đấu', swarm: 'Vây Khốn', elite: 'Tinh Anh', miniboss: 'Ác Thủ', event: 'Kỳ Ngộ', shop: 'Mộng Thị', rest: 'Tĩnh Thất', boss: 'Mộng Chủ' }[t] || 'Đấu'; },
    nodeStyle(nd, state) { const c = { battle: '#fb7185', swarm: '#f43f5e', elite: '#f5b942', miniboss: '#fb923c', event: '#a78bfa', shop: '#facc15', rest: '#34d399', boss: '#fb7185' }[nd.type] || '#94a3b8';
      if (state === 'pick') return 'color:' + c + ';border-color:' + c + ';box-shadow:0 0 14px -3px ' + c + ';background:' + c + '18';
      if (state === 'done') return 'color:#64748b;border-color:#334155'; return 'color:#475569;border-color:#1e293b'; },
    nodeColor(t) { return { battle: '#fb7185', swarm: '#f43f5e', elite: '#f5b942', miniboss: '#fb923c', event: '#a78bfa', shop: '#facc15', rest: '#34d399', boss: '#fb7185' }[t] || '#94a3b8'; },
    nodeGlyphStyle(nd, state) { const c = this.nodeColor(nd.type);
      if (state === 'pick') return 'color:' + c + ';border-color:' + c + ';background:' + c + '18';
      if (state === 'done') return 'color:#64748b;border-color:#33415599'; return 'color:#475569;border-color:#1e293b'; },
    bossBannerImg() { return 'images/dtm/enemies/port_master_ma_giao.webp'; },

    startRun(h) {
      this.runNgan = 0; this._bankGain = 0; this._newUnlocks = []; this._newScUnlocked = 0;
      const up = this._up();
      const sc = Math.min((this.scSel && this.scSel[h.id]) || 0, this.scMaxOf(h.id));   // Sát Cảnh đã chọn
      let mhp = h.hp + 4 * (up.hp || 0);             // Cố Bản
      if (sc >= 3) mhp -= 3;                          // SC3: vào ván −3 HP
      if (sc >= 4) mhp = Math.round(mhp * 0.9);       // SC4: HP khởi đầu ×0.9
      mhp = Math.max(10, mhp);
      this.maxKhi = 3 + (up.khi || 0);               // Tụ Khí
      this.run = { hero: h, deck: h.start.map(mk), hp: mhp, maxHp: mhp, relics: [], reviveUsed: false, sc: sc };
      if (up.startRelic) { const r = RELICS.find((x) => x.id === up.startRelic); if (r) this.run.relics.push({ ...r }); }  // Khải Mộng Di Vật
      try { const s = this.$store.game.state.dangTien; s.runs = (s.runs || 0) + 1; } catch (e) {}
      this.genMap(); this.mapTier = 0; this.buildMapView(); this.phase = 'map'; this._saveRun(); this._scrollMapCur();
    },
    quitRun() { this.bankRun(false); this._clearRun(); this.run = null; this.phase = 'lobby'; },
    // ----- Run-resume: chup run dang do vao state.dangTien.activeRun (rời view -> component huy -> khong mat run). CHI dung state.dangTien. -----
    // JSON deep-copy (tu drop proxy + fn). event.opts co closure fn -> KHONG serialize duoc -> khoi phuc thi REGEN event moi.
    _saveRun() {
      try {
        if (!this.run || this._winning) return;
        if (this.phase === 'win' || this.phase === 'lose' || this.phase === 'lobby') return;
        // Thẻ đang diễn hoạt cảnh (_cast) = ĐÃ tiêu (trừ Khí + áp hiệu ứng) chỉ CHƯA rời tay (splice qua setTimeout).
        // Snapshot phải phản ánh trạng thái ĐÃ CHỐT: coi thẻ _cast như đã vào chồng Bỏ -> tránh resume hồi sinh thẻ đã đánh = nhân đôi thẻ.
        const handSnap = this.hand.filter((c) => !c._cast);
        const discardSnap = this.discard.concat(this.hand.filter((c) => c._cast));
        const snap = {
          phase: this.phase, run: this.run, map: this.map, mapTier: this.mapTier, battleKind: this.battleKind,
          waves: this.waves, waveIdx: this.waveIdx,
          enemies: this.enemies, targetIdx: this.targetIdx, player: this.player, maxKhi: this.maxKhi, khi: this.khi,
          drawPile: this.drawPile, hand: handSnap, discard: discardSnap, log: this.log,
          runNgan: this.runNgan, rewardCards: this.rewardCards, rewardGold: this.rewardGold, shopItems: this.shopItems,
          rerollLeft: this.rerollLeft, scSel: this.scSel, deepest: this.deepest,
          _firstAtkUsed: this._firstAtkUsed, _bankGain: this._bankGain, _newUnlocks: this._newUnlocks, _newScUnlocked: this._newScUnlocked, v: 1,
        };
        const g = this.$store.game;
        g.state.dangTien.activeRun = JSON.parse(JSON.stringify(snap));
        Storage.save(g.state);
      } catch (e) {}
    },
    _clearRun() { try { const g = this.$store.game; if (g.state.dangTien.activeRun) { g.state.dangTien.activeRun = null; Storage.save(g.state); } } catch (e) {} },
    hasActiveRun() { try { const a = this.$store.game.state.dangTien.activeRun; return !!(a && a.run); } catch (e) { return false; } },
    activeRunLabel() { try { const a = this.$store.game.state.dangTien.activeRun; if (!a || !a.run) return ''; const h = a.run.hero ? a.run.hero.name : 'Mộng khách'; return h + ' · Tầng ' + ((a.mapTier || 0) + 1); } catch (e) { return ''; } },
    resumeRun() { try { const a = this.$store.game.state.dangTien.activeRun; if (a && a.run) this._restoreRun(a); } catch (e) {} },
    _restoreRun(a) {
      this.run = a.run; this.map = a.map || []; this.mapTier = a.mapTier || 0; this.battleKind = a.battleKind || null;
      this.enemies = (a.enemies || []).map((e) => Object.assign({}, e, { floats: [], hit: false, burst: null, atkfx: null }));
      this.waves = a.waves || (this.enemies.length ? [this.enemies.map((e) => e.id)] : []); this.waveIdx = a.waveIdx || 0; this._waveFlash = 0;
      this.targetIdx = a.targetIdx || 0; this.player = a.player || { block: 0, str: 0, dodge: false };
      this.maxKhi = a.maxKhi || 3; this.khi = a.khi != null ? a.khi : this.maxKhi;
      const clr = (arr) => (arr || []).map((c) => Object.assign({}, c, { _cast: null }));
      this.drawPile = clr(a.drawPile); this.hand = clr(a.hand); this.discard = clr(a.discard); this.log = a.log || '';
      this.runNgan = a.runNgan || 0; this.rewardCards = clr(a.rewardCards); this.rewardGold = a.rewardGold || 0; this.shopItems = a.shopItems || [];
      this.rerollLeft = a.rerollLeft || 0; this.scSel = Object.assign({ kiem: 0, thien: 0, doc: 0 }, a.scSel || {});
      this.deepest = Math.max(this.deepest || 0, a.deepest || 0);
      this._firstAtkUsed = !!a._firstAtkUsed; this._bankGain = a._bankGain || 0; this._newUnlocks = a._newUnlocks || []; this._newScUnlocked = a._newScUnlocked || 0;
      this.selUid = null; this._winning = false; this._shake = false; this._hitstop = false; this.playerFloats = []; this.playerHit = false; this.openDeck = false; this.metaTab = false;
      this.buildMapView();
      if (a.phase === 'event') this.openEvent();   // event fn khong serialize -> regen event moi (hiem)
      else { this.phase = a.phase || 'map'; if (this.phase === 'map') this._scrollMapCur(); }
    },
    genMap() { this.map = TIER.map((ti) => ti.types ? ti.types.map((t) => ({ type: t })) : [{ type: 'battle' }, { type: 'battle' }]); },
    buildMapView() { this.mapView = this.map.map((row, r) => ({ nodes: row, state: r < this.mapTier ? 'done' : (r === this.mapTier ? 'pick' : 'locked') })).slice().reverse(); },
    // Gom mapView (đã đảo, cao->thấp) thành 3 Trùng để render dải cảnh. Mỗi row kèm tier thật.
    trungBands() {
      const L = this.map.length || 1; const per = Math.max(1, Math.ceil(L / 3));
      const bands = TRUNG.map((t) => ({ meta: t, rows: [] }));
      (this.mapView || []).forEach((row, ri) => {
        const tier = L - ri;   // mapView[0] = tầng cao nhất
        const ti = Math.min(2, Math.floor((tier - 1) / per));
        const b = bands.find((x) => x.meta.idx === ti); if (b) b.rows.push({ row, ri, tier });
      });
      return bands.filter((b) => b.rows.length);
    },
    trungBgUrl(bg) { return 'images/dtm/bg/' + bg + '.webp'; },
    // Tự cuộn map tới TẦNG ĐANG ĐỨNG (khỏi kéo tay): lúc mới nhập mộng = tầng 1 (đáy), leo lên thì trôi theo.
    _scrollMapCur() { try { this.$nextTick(() => { const el = document.querySelector('.dtm-root .dtm-trow.cur') || document.querySelector('.dtm-root .dtm-bossban.pick'); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center' }); }); } catch (e) {} },
    pickNode(nd) {
      if (['battle', 'swarm', 'elite', 'miniboss', 'boss'].includes(nd.type)) this.startBattle(nd.type);
      else if (nd.type === 'event') this.openEvent();
      else if (nd.type === 'shop') this.openShop();
      else if (nd.type === 'rest') { this.phase = 'rest'; this._saveRun(); }
    },
    afterNode() {
      this.mapTier++; this.deepest = Math.max(this.deepest, this.mapTier);
      if (this.mapTier >= this.map.length) {
        try { const s = this.$store.game.state.dangTien; s.wins = (s.wins || 0) + 1; } catch (e) {}
        this.bankRun(true);
        try { const s = this.$store.game.state.dangTien; const hid = this.run.hero.id; const cm = s.scMaxByHero[hid] || 0; if ((this.run.sc || 0) >= cm && cm < DTM_SC_MAX) { s.scMaxByHero[hid] = cm + 1; this.scSel[hid] = cm + 1; this._newScUnlocked = cm + 1; } } catch (e) {}
        this._checkUnlocks();
        this._clearRun(); this.persist(); this.phase = 'win'; return;
      }
      this._checkUnlocks(); this.persist(); this.buildMapView(); this.phase = 'map'; this._saveRun(); this._scrollMapCur();
    },

    hasRelic(id) { return this.run.relics.some((r) => r.id === id); },
    // Rơi di vật CÓ TRỌNG SỐ theo phẩm chất + loại màn: Ác Thủ/Mộng Chủ -> di vật xịn (hiếm/tuyệt) nhiều hơn. DRAFT.
    _dropRelic() {
      const have = this.run.relics.map((r) => r.id);
      const pool = RELICS.filter((x) => !have.includes(x.id)); if (!pool.length) return null;
      const hi = (this.battleKind === 'miniboss' || this.battleKind === 'boss');
      const w = pool.map((r) => ({ thuong: hi ? 1 : 3, hiem: 2.4, tuyet: hi ? 2 : 0.5 }[r.rar] || 1));
      let s = 0; for (const x of w) s += x; let t = Math.random() * s;
      for (let i = 0; i < pool.length; i++) { t -= w[i]; if (t <= 0) return pool[i]; }
      return pool[pool.length - 1];
    },
    aliveCount() { return this.enemies.filter((e) => e.hp > 0).length; },
    tgtIdx() { if (this.enemies[this.targetIdx] && this.enemies[this.targetIdx].hp > 0) return this.targetIdx; const i = this.enemies.findIndex((e) => e.hp > 0); return i < 0 ? 0 : i; },
    startBattle(kind) {
      const enc = rnd(ENC[kind] || ENC.battle);   // enc = mảng ĐỢT (mỗi đợt = mảng id quái)
      this.waves = enc; this.waveIdx = 0; this._waveFlash = 0; this.battleKind = kind;
      this._spawnEnemies(enc[0]);
      this.drawPile = shuffle(this.run.deck.map((c) => ({ ...c }))); this.discard = []; this.hand = [];
      this.player = { block: 0, str: 0, dodge: false }; this.log = ''; this.playerFloats = []; this._gotRelic = null;
      if (this.hasRelic('thietGiap')) this.player.block += 6;
      if (this.hasRelic('trongGiap')) this.player.block += 10;   // di vật: Trọng Thiết Giáp
      if (this.hasRelic('voTuong')) this.player.dodge = true;    // di vật: Vô Tướng Phù (né đòn đầu)
      this.khi = this.maxKhi + (this.hasRelic('ngocBoi') ? 2 : 0);
      this.phase = 'battle'; this.startTurnPassive();
      this.draw(this.handSize());
      if (this.hasRelic('bangBoi')) this.draw(2);   // di vật: Huyền Băng Bội (rút thêm 2 lá đầu trận)
      this._saveRun();
    },
    // Sinh 1 đợt quái từ mảng id (HP scale theo tầng + Sát Cảnh, +AI plan/planNext). Dùng cho mở trận & đợt kế.
    _spawnEnemies(ids) {
      const hpScl = 1 + this.mapTier * 0.08 + (this.run.sc || 0) * 0.08;   // HP quái theo tầng + Sát Cảnh (DRAFT)
      const dmgScl = 1 + this.mapTier * 0.04;                              // sát thương ĐÒN theo tầng (chỉ intent atk) — DRAFT
      this.enemies = (ids || []).map((id) => { const t = ENEMIES[id];
        const ints = t.intents.map((it) => (it.t === 'atk' && it.v != null) ? { ...it, v: Math.round(it.v * dmgScl) } : it);   // copy có scale (KHÔNG mutate ENEMIES gốc; def/heal/buff giữ nguyên)
        return { id, name: t.name, han: t.han, he: t.he, _art: EART[id] || id, elite: !!t.elite, boss: !!t.boss, maxHp: Math.round(t.hp * hpScl), hp: Math.round(t.hp * hpScl), block: 0, poison: 0, weak: 0, str: 0, intents: ints, plan: 0, planNext: 0, floats: [], hit: false, burst: null, atkfx: null }; });
      this.targetIdx = 0;
      this.enemies.forEach((e) => { e.plan = this._planPick(e, -1); e.planNext = this._planFollow(e, e.plan); });
    },
    waveCount() { return (this.waves && this.waves.length) || 1; },
    // Diệt sạch đợt hiện tại: còn đợt -> tràn đợt kế (liền mạch); hết đợt -> thắng trận.
    _battleCleared() { if (this.waves && this.waveIdx < this.waves.length - 1) this._advanceWave(); else this._finishBattle(); },
    // Đợt kế TRÀN VÀO: giữ HP/Hộ Thể/Lực/trạng thái + tay bài + Khí (không hồi giữa đợt). Quái mới telegraph, ra đòn ở lượt SAU.
    _advanceWave() {
      this.waveIdx++;
      this._spawnEnemies(this.waves[this.waveIdx]);
      this.log = 'Đợt ' + (this.waveIdx + 1) + '/' + this.waves.length + ' tràn tới!';
      try { if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches)) { this._waveFlash = this.waveIdx + 1; clearTimeout(this._waveFlashT); this._waveFlashT = setTimeout(() => { this._waveFlash = 0; }, 1300); } } catch (e) {}
      this._saveRun();
    },
    handSize() { return 5 + (this.hasRelic('linhPhu') ? 1 : 0); },
    startTurnPassive() { if (this.run.hero.id === 'thien') this.player.block += 3; if (this.hasRelic('tuKhiDan')) this.player.block += 3; if (this.hasRelic('satKhi')) this.player.str += 1; this._firstAtkUsed = false; },
    curIntent(e) { return e.intents[e.plan] || e.intents[0]; },
    // ----- AI bộ bài quái: chọn chiêu KẾ theo tình huống, KHÔNG còn chuỗi cố định. Giữ telegraph: chiêu đang hiện = chiêu SẼ ra cuối lượt (planNext = chiêu lượt sau, cho Lưỡng Nghi Kính). Mọi trọng số = DRAFT. -----
    _wpick(w) { let s = 0; for (const x of w) s += x; if (s <= 0) return 0; let r = Math.random() * s; for (let i = 0; i < w.length; i++) { r -= w[i]; if (r <= 0) return i; } return w.length - 1; },
    _planPick(e, avoidIdx) {
      const ints = e.intents; if (!ints || !ints.length) return 0;
      const hpR = e.maxHp ? e.hp / e.maxHp : 1; const pblk = (this.player && this.player.block) || 0;
      const w = ints.map((m, i) => { let x;
        if (m.t === 'atk') { x = 1.0; if ((m.hits || 1) > 1 && pblk >= 4) x *= 1.6; if (m.big) x *= 1.15; }          // đối thủ thủ dày -> ưu tiên đa hiệp / đòn nặng
        else if (m.t === 'def') { x = 0.55; if (hpR < 0.5) x *= 1.5; }
        else if (m.t === 'buff') { x = 0.5; if ((e.str || 0) >= 4) x *= 0.4; if (hpR > 0.6) x *= 1.2; }              // đã đủ Lực thì thôi tăng
        else if (m.t === 'heal') { x = 0.35; if (hpR < 0.4) x *= 4; else if (hpR > 0.8) x *= 0.1; }                 // máu thấp -> ưu tiên hồi
        else if (m.t === 'charge') { x = 0.7; if (hpR < 0.35) x *= 0.4; }                                          // sắp gục thì bớt vận công đòn lớn
        else x = 0.5;
        if (i === avoidIdx) x *= 0.15;   // hạn chế lặp lại chiêu vừa ra
        return Math.max(0.02, x); });
      return this._wpick(w);
    },
    _planFollow(e, curIdx) {
      const m = e.intents[curIdx];
      if (m && m.t === 'charge') { const bi = e.intents.findIndex((x) => x.t === 'atk' && x.big); if (bi >= 0) return bi; }   // Vận Công -> BẮT BUỘC đòn mạnh kế (telegraph trung thực)
      return this._planPick(e, curIdx);
    },
    intentText(e) { const it = this.curIntent(e); if (!it) return ''; const s = e.str || 0;
      if (it.t === 'atk') { const per = Math.max(0, it.v + s - (e.weak || 0)); return it.hits ? ('Đánh ' + per + '×' + it.hits) : ('Đánh ' + per); }
      if (it.t === 'def') return 'Vận Hộ Thể ' + it.v; if (it.t === 'buff') return 'Tăng Lực +' + it.v;
      if (it.t === 'charge') return 'Vận Công… (đòn mạnh)'; if (it.t === 'heal') return 'Liệu Thương +' + it.v; return ''; },
    intentStyle(e) { const it = e.hp > 0 && this.curIntent(e); const c = !it ? '#64748b' : (it.t === 'atk' ? '#fb7185' : (it.t === 'charge' ? '#f5b942' : (it.t === 'heal' ? '#34d399' : (it.t === 'def' ? '#38bdf8' : '#facc15'))));
      return 'color:' + c + ';border:1px solid ' + c + '55;background:' + c + '14'; },
    // ----- Telegraph CHIP: ý đồ quái = lá bài kế trong bộ bài riêng (chip mini art + tên chiêu + tác dụng) -----
    intentMove(e) { try { const arr = MOVES[e.id]; return (arr && arr.length) ? (arr[e.plan] || arr[0]) : null; } catch (_) { return null; } },
    intentCardArt(e) { const m = this.intentMove(e); return (m && m.art) ? 'images/cards/' + m.art + '.webp' : ''; },
    intentCardName(e) { const m = this.intentMove(e); return m ? m.nm : (this.intentText(e) || 'Ý đồ'); },
    intentCardHan(e) { const m = this.intentMove(e); return m ? m.han : (e.han || '?'); },
    intentColor(e) { const it = this.curIntent(e); if (!it) return '#64748b'; return it.t === 'atk' ? '#fb7185' : (it.t === 'charge' ? '#f5b942' : (it.t === 'heal' ? '#34d399' : (it.t === 'def' ? '#38bdf8' : '#facc15'))); },
    peekOn() { return !!this._up().peek; },   // Lưỡng Nghi Kính
    peekText(e) { const it = e.intents[e.planNext] || e.intents[0]; if (!it) return ''; const s = e.str || 0;
      if (it.t === 'atk') { const per = Math.max(0, it.v + s - (e.weak || 0)); return it.hits ? ('Đánh ' + per + '×' + it.hits) : ('Đánh ' + per); }
      if (it.t === 'def') return 'Hộ ' + it.v; if (it.t === 'buff') return 'Lực +' + it.v; if (it.t === 'charge') return 'Vận Công…'; if (it.t === 'heal') return 'Liệu +' + it.v; return ''; },
    restPct() { return 0.30 + (this._up().restBonus ? 0.05 : 0) - ((this.run && (this.run.sc || 0) >= 5) ? 0.05 : 0); },   // Tịnh Thất Phù; SC5 −5%
    draw(n) { for (let k = 0; k < n; k++) { if (!this.drawPile.length) { if (!this.discard.length) return; this.drawPile = shuffle(this.discard); this.discard = []; } const dc = this.drawPile.pop(); if (dc) { dc._cast = null; this.hand.push(dc); } } },
    floatE(e, v) { const id = ++this._f; e.floats.push({ id, v: '-' + v }); e.hit = true; setTimeout(() => { e.hit = false; }, 240); setTimeout(() => { e.floats = e.floats.filter((f) => f.id !== id); }, 950); },
    floatPlayer(v) { const id = ++this._f; this.playerFloats.push({ id, v: '-' + v }); this.playerHit = true; setTimeout(() => { this.playerHit = false; }, 260); setTimeout(() => { this.playerFloats = this.playerFloats.filter((f) => f.id !== id); }, 950); },
    hitEnemy(e, amt) { let d = amt; if (e.block > 0) { const a = Math.min(e.block, d); e.block -= a; d -= a; } e.hp = Math.max(0, e.hp - d); return d; },
    absorbPlayer(amt) { let d = amt; if (this.player.block > 0) { const a = Math.min(this.player.block, d); this.player.block -= a; d -= a; } this.run.hp = Math.max(0, this.run.hp - d); return d; },

    // Bấm thẻ: lần 1 = CHỌN (thẻ nhô lên + to ra); lần 2 (CÙNG thẻ) = XÁC NHẬN -> đánh (bay vào địch). Bấm thẻ khác = đổi chọn.
    tapCard(i, ev) {
      if (this._winning) return;
      const c = this.hand[i]; if (!c || c._cast) return;
      if (this.selUid !== c.uid) { this.selUid = c.uid; return; }   // tap 1 / đổi -> chọn (nhô lên)
      if (this.khi < c.cost) return;                                // tap 2 nhưng không đủ Khí -> giữ chọn, chưa đánh
      this.selUid = null; this.playCard(i, ev);                     // tap 2 -> ĐÁNH
    },
    // (Đã BỎ hiệu ứng "thẻ bay vào địch" — clone cross-screen định vị sai trên browser thật của user dù đúng ở preview; thay bằng juice in-place/on-target khả thi hơn.)
    // Juice: rung màn trận khi tung đòn. Dùng FLAG PHẢN ỨNG + :class (Alpine quản lý → KHÔNG bị flush sau @click xoá, như e.hit; class imperative/WAAPI trên root bị Alpine strip).
    castShake() {
      try {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
        const set = () => { this._shake = true; clearTimeout(this._shakeT); this._shakeT = setTimeout(() => { this._shake = false; }, 300); };
        if (this._shake) { this._shake = false; (window.requestAnimationFrame || setTimeout)(set); } else set();
      } catch (e) {}
    },
    // Hit-stop: đóng băng cảnh ngắn lúc trúng đòn (flag phản ứng -> .dtm-hitstop pause animation).
    hitStop(ms) {
      try { if (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return; } catch (e) {}
      this._hitstop = true; clearTimeout(this._hitstopT); this._hitstopT = setTimeout(() => { this._hitstop = false; }, ms || 70);
    },
    // Đánh thẻ: chạy hiệu ứng (theo LOẠI thẻ) trên con quái đang nhắm + thẻ thật, rồi thẻ BIẾN MẤT khỏi tay.
    // CÁCH LY: chỉ đụng DOM (the + panel quái) + run state; KHÔNG state combat/gear. Hiệu ứng port từ mockup (dtm_fx.js).
    castCard(c, ev) {
      c._cast = 'casting';   // đánh dấu đã tung (chặn re-tap) NGAY — chưa có CSS 'dtm-cast-casting' nên chưa hiện gì
      let reduce = false;
      try { reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches; } catch (e) {}
      if (reduce) { this._discardCast(c); return; }
      try {
        let cardEl = ev && ev.currentTarget;
        if (cardEl && cardEl.classList && !cardEl.classList.contains('card') && cardEl.closest) cardEl = cardEl.closest('.card');
        const panels = Array.from(document.querySelectorAll('.dtm-enemy'));
        const hosts = panels.map((p) => p.querySelector('.dtm-efx')).filter(Boolean);
        const host = hosts[this.tgtIdx()] || hosts[0] || null;
        const stageEl = panels[0] ? panels[0].parentElement : null;   // hàng quái (cho đòn AoE quét ngang)
        const shake = () => this.castShake(); const hitStop = (ms) => this.hitStop(ms);
        // (1) Đòn TẤN CÔNG lên quái — CHỈ khi thẻ gây sát thương.
        if (dealsDamage(c)) runFx(castFxFor(c), cardEl, host, { hosts, stage: stageEl, shake, hitStop });
        // (2) Cue SELF trên chân dung hero (.dtm-pfx): Hộ Thuẫn(blk) · Hồi(heal) · Lực(str) · Né(dodge) · Rút(draw).
        const pfx = document.querySelector('.dtm-pfx');
        const pPort = pfx && pfx.parentElement ? pfx.parentElement.querySelector('.dtm-portwrap') : null;
        if (pfx) {
          if (c.blk) runFx('hoThuan', pfx, null, { shake, hitStop });   // Hộ Thuẫn = 1 trong 9 FX (đã duyệt), bọc quanh chân dung hero
          if (c.heal || c.drain) runCue('heal', pfx, pPort);   // drain (Hấp Tinh) cũng hồi máu -> hiện Hồi (user chốt)
          if (c.str) runCue('luc', pfx, pPort);
          if (c.dodge) runCue('pstep', pfx, pPort);
          if (c.draw) runCue('dxrut', pfx, pPort);
        }
        // (3) Suy Yếu (Phong Ấn) trên con quái đang nhắm. Desaturate áp lên ẢNH quái (.dtm-port), KHÔNG phải .dtm-portwrap —
        //     vì .dtm-portwrap đã nhận knock/squash (transform); 2 rule cùng set `animation` trên 1 element thì cascade chỉ chọn 1
        //     (knock specificity cao hơn) → sap bị đè. Ảnh là element riêng nên filter (sap) + transform (knock) cùng chạy.
        if (c.weaken && host) { const eImg = host.parentElement ? host.parentElement.querySelector('.dtm-port') : null; runCue('phongAn', host, eImg); }
      } catch (e) {}
      setTimeout(() => { if (c._cast === 'casting') c._cast = 'vanish'; }, DTM_VANISH_LEAD);   // thẻ bắt đầu tan khỏi tay
      setTimeout(() => { this._discardCast(c); }, DTM_VANISH_LEAD + DTM_VANISH_MS + 60);
    },
    _discardCast(c) {
      const i = this.hand.indexOf(c);
      if (i >= 0) { this.hand.splice(i, 1); this.discard.push(c); }
      c._cast = null;
    },
    playCard(i, ev) {
      if (this._winning) return;
      const c = this.hand[i]; if (!c || c._cast || this.khi < c.cost) return;
      this.selUid = null;
      try { if (navigator.vibrate) navigator.vibrate(c.dmg ? [14] : [7]); } catch (_) {}   // rung máy: phản hồi CHẮC CHẮN (không phụ thuộc cài đặt animation của máy)
      this.khi -= c.cost;
      if (c.dmg) {
        let base = c.dmg + (this.player.str || 0);
        if (c.type === 'atk' && !this._firstAtkUsed) { let fb = 0; if (this.run.hero.id === 'kiem') fb += 3; if (this.hasRelic('lietNhan')) fb += 3; base += fb; this._firstAtkUsed = true; }   // Lợi Nhận (kiem) + di vật Liệt Nhận Phù: đòn Công đầu lượt +ST
        const hits = c.hits || 1;
        const tgts = c.aoe ? this.enemies.filter((e) => e.hp > 0) : (this.enemies[this.tgtIdx()] ? [this.enemies[this.tgtIdx()]] : []);
        let total = 0;
        tgts.forEach((e) => { let per = base; if (KHAC[c.he] === e.he) { per = Math.floor(per * 1.3); e.burst = c.he; const eb = e; setTimeout(() => { eb.burst = null; }, 620); } let d = 0; for (let h = 0; h < hits; h++) d += this.hitEnemy(e, per); if (d > 0) this.floatE(e, d); total += d; });
        if (c.drain) this.run.hp = Math.min(this.run.maxHp, this.run.hp + total);
        this.log = c.name + (c.aoe ? ' (toàn thể)' : '') + ' → ' + total + ' ST';
      }
      if (c.blk) this.player.block += c.blk;
      if (c.heal) this.run.hp = Math.min(this.run.maxHp, this.run.hp + c.heal);
      if (c.poison) { const e = this.enemies[this.tgtIdx()]; if (e) { e.poison += c.poison + (this.run.hero.id === 'doc' ? 2 : 0) + (this.hasRelic('docLong') ? 2 : 0); } }
      if (c.weaken) { const e = this.enemies[this.tgtIdx()]; if (e) e.weak += c.weaken; }
      if (c.str) this.player.str += c.str;
      if (c.dodge) this.player.dodge = true;
      this.castCard(c, ev);
      if (c.draw) this.draw(c.draw);
      if (this.aliveCount() === 0) this._battleCleared();
      this._saveRun();
    },
    endTurn() {
      if (this._winning) return;
      this.selUid = null;
      for (const hc of this.hand) hc._cast = null;
      this.discard.push(...this.hand); this.hand = [];
      for (const e of this.enemies) { if (e.hp > 0 && e.poison > 0) { this.hitEnemy(e, e.poison); this.floatE(e, e.poison); e.poison = Math.max(0, e.poison - 1); } }
      if (this.aliveCount() === 0) {
        if (this.waves && this.waveIdx < this.waves.length - 1) { this._advanceWave(); }   // Độc dứt điểm đợt này -> đợt kế tràn tới (ra đòn lượt SAU)
        else { this._finishBattle(); return; }
      } else {
        let toPlayer = 0, _ai = 0;
        for (const e of this.enemies) { if (e.hp <= 0) continue; const it = this.curIntent(e); if (it) {
          this._enemyActFx(e, it, _ai++);   // hiệu ứng quái ra đòn (cosmetic, lệch nhịp)
          if (it.t === 'atk') { let per = Math.max(0, it.v + (e.str || 0) - (e.weak || 0)); const hits = it.hits || 1; for (let h = 0; h < hits; h++) { if (this.player.dodge) { this.player.dodge = false; continue; } toPlayer += this.absorbPlayer(per); } }
          else if (it.t === 'def') e.block += it.v; else if (it.t === 'buff') e.str = (e.str || 0) + it.v; else if (it.t === 'heal') e.hp = Math.min(e.maxHp, e.hp + it.v);
        } e.plan = (e.planNext != null) ? e.planNext : this._planPick(e, e.plan); e.planNext = this._planFollow(e, e.plan); e.weak = Math.max(0, (e.weak || 0) - 1); }
        if (toPlayer > 0) this.floatPlayer(toPlayer);
        if (this.run.hp <= 0) { this.onDeath(); return; }
      }
      this.player.block = this.hasRelic('kimChung') ? Math.floor(this.player.block / 2) : 0; this.khi = this.maxKhi; this.startTurnPassive(); this.draw(this.handSize());   // Kim Chung Tráo: giữ nửa Hộ Thể dư
      this._saveRun();
    },
    onDeath() {
      if (this.hasRelic('menhHon') && !this.run.reviveUsed) { this.run.reviveUsed = true; this.run.hp = Math.round(this.run.maxHp * 0.3); this.log = 'Hộ Mệnh Hồn Phách — hồi sinh!'; this.player.block = 0; this.khi = this.maxKhi; this.draw(this.handSize()); this._saveRun(); return; }   // LƯU state sau hồi sinh (reviveUsed + hp + tay bài mới) — nếu không, resume rewind + tái vũ trang relic 1 lần
      this.bankRun(false); this._clearRun(); this.persist(); this.phase = 'lose';
    },
    // Hiệu ứng khi QUÁI ra đòn (DÙNG LẠI hiệu ứng nhân vật): atk -> đòn tấn công TRÊN CHÂN DUNG HERO · def -> Hộ Thuẫn · buff/charge -> Lực · heal -> Hồi (trên quái). Lệch nhịp theo thứ tự quái. CÁCH LY: chỉ đụng DOM.
    _enemyActFx(e, it, idx) {
      try { if (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return; } catch (_) {}
      const shake = () => this.castShake(); const hitStop = (ms) => this.hitStop(ms);
      setTimeout(() => {
        try {
          const panels = Array.from(document.querySelectorAll('.dtm-enemy'));
          const mi = this.enemies.indexOf(e);
          const ehost = (mi >= 0 && panels[mi]) ? panels[mi].querySelector('.dtm-efx') : null;
          const eport = (ehost && ehost.parentElement) ? ehost.parentElement.querySelector('.dtm-portwrap') : null;
          if (it.t === 'atk') {
            const pfx = document.querySelector('.dtm-pfx');
            if (pfx) { const key = ((it.hits || 1) > 1) ? 'vu' : (it.big ? 'bao' : 'tram'); runFx(key, null, pfx, { hosts: [pfx], shake, hitStop }); }
          } else if (it.t === 'def') {
            if (ehost) { ehost.style.setProperty('--c', this.heColor(e.he)); runFx('hoThuan', ehost, null, { shake, hitStop }); }
          } else if (it.t === 'buff' || it.t === 'charge') {
            if (ehost) runCue('luc', ehost, eport);
          } else if (it.t === 'heal') {
            if (ehost) runCue('heal', ehost, eport);
          }
        } catch (_) {}
      }, idx * 240);
    },
    // Thắng trận: DỪNG 1 nhịp cho đòn kết liễu kịp diễn + hiện "Thắng ải" rồi mới sang thưởng/màn sau (tránh chuyển PHỤT, hụt hẫng khi quái sắp chết). reduced-motion -> chuyển ngay.
    _finishBattle() {
      if (this._winning) return;
      this._winning = true; this.selUid = null;
      let reduce = false; try { reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches; } catch (e) {}
      if (reduce) { this._winning = false; this.winBattle(); return; }
      setTimeout(() => { this._winning = false; this.winBattle(); }, 950);
    },
    winBattle() {
      if (this.hasRelic('huyetNgoc')) this.run.hp = Math.min(this.run.maxHp, this.run.hp + 5);
      if (this.hasRelic('hoiNguyen')) this.run.hp = Math.min(this.run.maxHp, this.run.hp + Math.round(this.run.maxHp * 0.12));   // di vật: Hồi Nguyên Châu
      const _base = { boss: 60, miniboss: 45, elite: 35, swarm: 26, battle: 18 }[this.battleKind] || 18;   // DRAFT
      this.rewardGold = _base + ((this.waves && this.waves.length > 1) ? (this.waves.length - 1) * 12 : 0) + (this.hasRelic('tuBao') ? 10 : 0);   // +12/đợt phụ + Tụ Bảo Bồn (DRAFT)
      if ((this.run.sc || 0) >= 2) this.rewardGold = Math.round(this.rewardGold * 0.9); this.runNgan += this.rewardGold;
      if (this.battleKind === 'boss') { this.afterNode(); return; }
      this._gotRelic = null;
      if ((this.battleKind === 'elite' || this.battleKind === 'miniboss') && this.run.relics.length < RELICS.length) { const r = this._dropRelic(); if (r) { this.run.relics.push(r); this._gotRelic = r; this.log = 'Nhặt di vật: ' + r.name; } }
      this.rewardCards = shuffle(Object.keys(POOL).filter((k) => !['coBanKiem', 'coBanQuyen'].includes(k) && this._cardUnlocked(k))).slice(0, 3).map(mk);
      this._setReroll(); this.phase = 'reward'; this._saveRun();
    },
    pickReward(c) { this.run.deck.push(mk(c.id)); this.afterNode(); },

    openEvent() { this.event = rnd([
      { title: 'Lão Nhân Bên Suối', text: 'Một lão nhân áo vải câu bên suối mộng, ngẩng lên cười: "Tiểu hữu, ngươi muốn một quyển bí kíp, hay chút lộ phí?"',
        opts: [{ label: 'Xin một chiêu thức (rút 1/3 thẻ)', fn: () => { this.rewardGold = 0; this.rewardCards = shuffle(Object.keys(POOL).filter((k) => this._cardUnlocked(k))).slice(0, 3).map(mk); this._setReroll(); this.phase = 'reward'; } },
                { label: 'Xin lộ phí (+45 Mộng Ngân)', fn: () => { this.runNgan += 45; this.afterNode(); } }] },
      { title: 'Thạch Bia Cổ', text: 'Tấm bia khắc võ học cổ, sát khí âm u. Lĩnh hội thì lợi hại, nhưng phản phệ chút tâm thần.',
        opts: [{ label: 'Lĩnh hội (mất 6 HP, +1 thẻ Tuyệt)', fn: () => { this.run.hp = Math.max(1, this.run.hp - 6); const tk = Object.keys(POOL).filter((k) => POOL[k].rar === 'tuyet' && this._cardUnlocked(k)); const t = tk.length ? rnd(tk) : rnd(Object.keys(POOL).filter((k) => POOL[k].rar === 'hiem')); this.run.deck.push(mk(t)); this.afterNode(); } },
                { label: 'Bỏ qua', fn: () => this.afterNode() }] },
      { title: 'Suối Linh Tuyền', text: 'Dòng suối trong mộng tỏa linh khí mát lành.',
        opts: [{ label: 'Tẩm mình (hồi 40% HP)', fn: () => { this.run.hp = Math.min(this.run.maxHp, this.run.hp + Math.round(this.run.maxHp * 0.4)); this.afterNode(); } },
                { label: 'Múc mang theo (+30 Mộng Ngân)', fn: () => { this.runNgan += 30; this.afterNode(); } }] },
    ]); this.phase = 'event'; this._saveRun(); },
    resolveEvent(o) { o.fn(); this._saveRun(); },

    openShop() { const keys = shuffle(Object.keys(POOL).filter((k) => !['coBanKiem', 'coBanQuyen'].includes(k) && this._cardUnlocked(k))).slice(0, 3);
      this.shopItems = keys.map((k) => { const card = mk(k); let price = card.rar === 'tuyet' ? 75 : (card.rar === 'hiem' ? 50 : 30); if ((this.run.sc || 0) >= 5) price = Math.round(price * 1.15); return { card, price, sold: false }; }); this._setReroll(); this.phase = 'shop'; this._saveRun(); },
    buyShop(i) { const s = this.shopItems[i]; if (s.sold || this.runNgan < s.price) return; this.runNgan -= s.price; this.run.deck.push(mk(s.card.id)); s.sold = true; this._saveRun(); },
    buyHeal() { if (this.runNgan < 40 || this.run.hp >= this.run.maxHp) return; this.runNgan -= 40; this.run.hp = Math.min(this.run.maxHp, this.run.hp + 18); this._saveRun(); },
    restHeal() { this.run.hp = Math.min(this.run.maxHp, this.run.hp + Math.round(this.run.maxHp * this.restPct())); this.afterNode(); },
    restLearn() { const t = rnd(Object.keys(POOL).filter((k) => !['coBanKiem', 'coBanQuyen'].includes(k) && this._cardUnlocked(k))); this.run.deck.push(mk(t)); this.afterNode(); },
  };
}
