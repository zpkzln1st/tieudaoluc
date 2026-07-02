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
  const HE_HAN = { kim: '金', moc: '木', thuy: '水', hoa: '火', tho: '土', vatly: '無' };
  const KHAC = { kim: 'moc', moc: 'tho', tho: 'thuy', thuy: 'hoa', hoa: 'kim' };   // A khắc KHAC[A]
  const RAR_C = { so: '#6b7280', thuong: '#94a3b8', hiem: '#38bdf8', tuyet: '#f5b942', than: '#c084fc' };   // 5 bậc (Sơ/Thường/Hiếm/Tuyệt/Thần Thoại) — pool hiện chỉ dùng 3 bậc giữa, chừa Sơ+Thần cho nội dung mở rộng
  const RAR_N = { so: 'Sơ Cấp', thuong: 'Thường', hiem: 'Hiếm', tuyet: 'Tuyệt', than: 'Thần Thoại' };
  // ===== POOL 117 thẻ (15 phái ×7 + 12 neutral) · 5 bậc so/thuong/hiem/tuyet (than để dành 9 huyền thoại) =====
  // [C] = thẻ live cũ (reuse art book_*, giữ flavor); các thẻ khác MỚI (Hán fallback, cần art, chưa có flavor — soạn lore ở mục 7).
  // Số DRAFT (tune qua harness/cảm giác). eff schema phẳng: dmg/hits/aoe/blk/heal/poison/weaken/str/dodge/draw/drain + burn/burnT/stun/pen/energy/keepBlock/exhaust/blkToDmg/detonate/selfDmg.
  const POOL = {
    // ---------- NEUTRAL (12, vô phái) ----------
    coBanKiem: { name: 'Cơ Bản Kiếm', han: '劍', he: 'vatly', cost: 1, type: 'atk', rar: 'so', dmg: 6, desc: 'Gây 6 ST.', flavor: 'Chiêu kiếm nhập môn, thẳng tới thẳng lui. Cao thủ nào cũng khởi từ một đường kiếm mộc mạc như thế — vạn pháp quy căn.' },
    coBanQuyen: { name: 'Cơ Bản Quyền', han: '拳', he: 'vatly', cost: 1, type: 'atk', rar: 'so', dmg: 5, blk: 3, desc: '5 ST · +3 Hộ Thể.', flavor: 'Quyền lộ khởi thủ, công thủ tương sinh. Chưa vội cầu chiêu lạ, trước hãy đứng cho vững tấn.' },
    coBanChuong: { name: 'Cơ Bản Chưởng', han: '掌', he: 'vatly', cost: 1, type: 'atk', rar: 'so', dmg: 4, weaken: 1, desc: '4 ST · Suy Yếu 1.' },
    hoThanBo: { name: 'Hộ Thân Bộ', han: '護', he: 'vatly', cost: 1, type: 'def', rar: 'so', blk: 6, desc: '+6 Hộ Thể.' },
    vinhXuanChuy: { name: 'Vịnh Xuân Chùy', han: '詠', he: 'vatly', cost: 1, type: 'atk', rar: 'so', dmg: 2, hits: 2, desc: '2 ST ×2.' },
    langBa: { name: 'Lăng Ba Vi Bộ', han: '波', he: 'thuy', cost: 1, type: 'ky', rar: 'thuong', blk: 5, dodge: true, desc: '+5 Hộ Thể · Né đòn kế.', flavor: 'Thân pháp tuyệt thế, bước theo phương vị Dịch lý. Người đi như lướt trên sóng biếc, phiêu hốt vô định, đòn hiểm nào cũng lách qua.' },
    thanhPhong: { name: 'Thanh Phong Bộ', han: '風', he: 'moc', cost: 0, type: 'ky', rar: 'thuong', draw: 2, desc: 'Rút 2 lá.', flavor: 'Bộ pháp nhẹ tựa thanh phong, tiến thoái theo tâm. Chân bước thảnh thơi mà chiêu thức nối liền chẳng dứt.' },
    vanKhiQuyet: { name: 'Vận Khí Quyết', han: '運', he: 'vatly', cost: 0, type: 'ky', rar: 'thuong', energy: 1, draw: 1, desc: '+1 Khí · rút 1.' },
    toanPhongCuoc: { name: 'Toàn Phong Cước', han: '旋', he: 'vatly', cost: 1, type: 'atk', rar: 'thuong', dmg: 6, blk: 3, desc: '6 ST · +3 Hộ Thể.' },
    cuuDuong: { name: 'Cửu Dương Thần Công', han: '陽', he: 'hoa', cost: 2, type: 'ky', rar: 'hiem', heal: 7, blk: 4, desc: 'Hồi 7 · +4 Hộ Thể.', flavor: 'Nội công chí dương chí cương, chân khí sinh sinh bất tức. Luyện thành thì bách độc bất xâm, càng chiến càng hăng, khí lực vô cùng.' },
    cuuAm: { name: 'Cửu Âm Chân Kinh', han: '陰', he: 'thuy', cost: 2, type: 'atk', rar: 'hiem', dmg: 5, weaken: 2, desc: '5 ST · Suy Yếu 2.', flavor: 'Kỳ thư đoạt tạo hóa, khiến quần hùng tranh nhau đổ máu. Nội công âm nhu tinh diệu, chiêu ra lặng lẽ mà đoạt hồn nhiếp phách.' },
    taoDang: { name: 'Tảo Đãng Thiên Quân', han: '掃', he: 'vatly', cost: 2, type: 'atk', rar: 'hiem', dmg: 5, aoe: true, desc: '5 ST toàn địch.', flavor: 'Một chiêu quét ngang cả trận, đãng địch như đãng lá. Khí thế ngời ngời tựa thiên binh vạn mã tràn tới.' },
    // ---------- KIM ☰ (khắc Mộc) ----------
    // Thiên Vương Bang — trọng giáp + Phá Giáp
    thienVuong: { name: 'Thiên Vương Phá', han: '霸', he: 'kim', sect: 'Thiên Vương', cost: 3, type: 'atk', rar: 'tuyet', dmg: 18, pen: true, exhaust: true, desc: '18 ST · Phá Giáp · Đoạn.', flavor: 'Bá đạo trấn thế của Thiên Vương Bang. Một chưởng giáng xuống nghiền non lấp bể, uy áp muôn quân, thiên hạ khiếp phục.' },
    kimCangGiap: { name: 'Kim Cang Hộ Giáp', han: '鎧', he: 'kim', sect: 'Thiên Vương', cost: 1, type: 'def', rar: 'thuong', blk: 9, desc: '+9 Hộ Thể.' },
    phanChanChuong: { name: 'Phản Chấn Chưởng', han: '震', he: 'kim', sect: 'Thiên Vương', cost: 2, type: 'atk', rar: 'hiem', dmg: 8, blk: 8, desc: '8 ST · +8 Hộ Thể.' },
    tieuThietChuong: { name: 'Tiêu Thiết Chưởng', han: '鐵', he: 'kim', sect: 'Thiên Vương', cost: 1, type: 'def', rar: 'thuong', blk: 8, desc: '+8 Hộ Thể.' },
    phaThietChuy: { name: 'Phá Thiết Chùy', han: '錐', he: 'kim', sect: 'Thiên Vương', cost: 1, type: 'atk', rar: 'hiem', dmg: 7, pen: true, desc: '7 ST · Phá Giáp.' },
    thietTuongBich: { name: 'Thiết Tường Bích', han: '壁', he: 'kim', sect: 'Thiên Vương', cost: 2, type: 'def', rar: 'hiem', blk: 13, keepBlock: true, desc: '+13 Hộ Thể · Giữ Hộ Thể.' },
    phaGiapTamChuy: { name: 'Phá Giáp Tam Chùy', han: '貫', he: 'kim', sect: 'Thiên Vương', cost: 2, type: 'atk', rar: 'tuyet', dmg: 12, blk: 10, pen: true, exhaust: true, desc: '12 ST · +10 Hộ Thể · Phá Giáp · Đoạn.' },
    // Thiếu Lâm — Hộ Thể hóa sát thương
    laHan: { name: 'La Hán Quyền', han: '羅', he: 'kim', sect: 'Thiếu Lâm', cost: 2, type: 'atk', rar: 'hiem', dmg: 11, desc: 'Gây 11 ST.', flavor: 'Trấn sơn tuyệt kỹ Thiếu Lâm, mười tám vị La Hán hộ trì. Quyền cương mãnh hùng hồn, một đấm ra như sấm động, đủ hàng ma vệ đạo.' },
    datMa: { name: 'Đạt Ma Trượng', han: '達', he: 'kim', sect: 'Thiếu Lâm', cost: 2, type: 'atk', rar: 'hiem', dmg: 7, blk: 5, desc: '7 ST · +5 Hộ Thể.', flavor: 'Trượng pháp do Đạt Ma tổ sư truyền lại, cương trung hữu nhu. Một trượng quét ngang vừa khắc địch vừa lập thế thủ.' },
    dichCan: { name: 'Dịch Cân Kinh', han: '易', he: 'kim', sect: 'Thiếu Lâm', cost: 1, type: 'ky', rar: 'hiem', str: 3, desc: '+3 Lực cả trận.', flavor: 'Bí điển tẩy tủy dịch cân của Thiền môn. Luyện thấu thì gân cốt đổi mới, phàm thai thoát cốt, khí lực tăng tiến chẳng cùng.' },
    kimCuongPhachToai: { name: 'Kim Cang Phách Toái', han: '碎', he: 'kim', sect: 'Thiếu Lâm', cost: 2, type: 'atk', rar: 'tuyet', dmg: 6, blkToDmg: 1, exhaust: true, desc: '6 ST + toàn bộ Hộ Thể · Đoạn.' },
    thietBoSam: { name: 'Thiết Bố Sam', han: '衫', he: 'kim', sect: 'Thiếu Lâm', cost: 1, type: 'def', rar: 'thuong', blk: 8, desc: '+8 Hộ Thể.' },
    viDaChuong: { name: 'Vi Đà Chưởng', han: '韋', he: 'kim', sect: 'Thiếu Lâm', cost: 1, type: 'atk', rar: 'thuong', dmg: 5, blk: 4, desc: '5 ST · +4 Hộ Thể.' },
    baNhaThung: { name: 'Bá Nhã Thung Chung', han: '鐘', he: 'kim', sect: 'Thiếu Lâm', cost: 2, type: 'atk', rar: 'hiem', dmg: 8, blkToDmg: 0.5, desc: '8 ST + ½ Hộ Thể.' },
    // Bồng Lai — rút bài + né + Tụ Khí
    vanVuThan: { name: 'Vân Vũ Thân Pháp', han: '雲', he: 'kim', sect: 'Bồng Lai', cost: 0, type: 'ky', rar: 'thuong', dodge: true, draw: 1, desc: 'Né đòn kế · rút 1.' },
    ngocLoTuKhi: { name: 'Ngọc Lộ Tụ Khí', han: '露', he: 'kim', sect: 'Bồng Lai', cost: 0, type: 'ky', rar: 'hiem', energy: 2, draw: 1, exhaust: true, desc: '+2 Khí · rút 1 · Đoạn.' },
    phiKiemTruyThan: { name: 'Phi Kiếm Truy Thần', han: '飛', he: 'kim', sect: 'Bồng Lai', cost: 1, type: 'atk', rar: 'hiem', dmg: 4, hits: 2, draw: 1, desc: '4 ST ×2 · rút 1.' },
    thanhVanBo: { name: 'Thanh Vân Bộ', han: '步', he: 'kim', sect: 'Bồng Lai', cost: 0, type: 'ky', rar: 'so', draw: 1, desc: 'Rút 1.' },
    tienNhanChiLo: { name: 'Tiên Nhân Chỉ Lộ', han: '指', he: 'kim', sect: 'Bồng Lai', cost: 1, type: 'atk', rar: 'thuong', dmg: 5, draw: 1, desc: '5 ST · rút 1.' },
    luuVanPhi: { name: 'Lưu Vân Phi Kiếm', han: '劍', he: 'kim', sect: 'Bồng Lai', cost: 1, type: 'atk', rar: 'hiem', dmg: 3, hits: 3, draw: 1, desc: '3 ST ×3 · rút 1.' },
    tieuDaoDonKiem: { name: 'Tiêu Dao Độn Kiếm', han: '逍', he: 'kim', sect: 'Bồng Lai', cost: 2, type: 'atk', rar: 'tuyet', dmg: 6, hits: 3, draw: 2, dodge: true, exhaust: true, desc: '6 ST ×3 · rút 2 · Né · Đoạn.' },
    // ---------- MỘC ☴ (khắc Thổ) ----------
    // Đường Môn — ám khí nhiều mũi + Độc
    amKhi: { name: 'Đường Môn Ám Khí', han: '暗', he: 'moc', sect: 'Đường Môn', cost: 1, type: 'atk', rar: 'thuong', dmg: 3, poison: 4, desc: '3 ST · Độc 4.', flavor: 'Đường Môn đất Thục danh chấn thiên hạ vì ám khí. Mũi tiêu tẩm độc bắn ra vô thanh vô tức, thấy máu là phong hầu.' },
    manThienPhi: { name: 'Mãn Thiên Phi Hoàng', han: '蝗', he: 'moc', sect: 'Đường Môn', cost: 2, type: 'atk', rar: 'hiem', dmg: 3, hits: 4, poison: 2, desc: '3 ST ×4 · Độc 2.' },
    thoiTamChau: { name: 'Thôi Tâm Châu', han: '催', he: 'moc', sect: 'Đường Môn', cost: 1, type: 'ky', rar: 'hiem', poison: 3, draw: 2, desc: 'Độc 3 · rút 2.' },
    phiTienThuat: { name: 'Phi Tiễn Thuật', han: '矢', he: 'moc', sect: 'Đường Môn', cost: 0, type: 'atk', rar: 'so', dmg: 4, desc: '4 ST.' },
    tuTinhCham: { name: 'Tử Tinh Châm', han: '針', he: 'moc', sect: 'Đường Môn', cost: 1, type: 'atk', rar: 'thuong', dmg: 5, poison: 2, desc: '5 ST · Độc 2.' },
    khongMinhVu: { name: 'Khổng Minh Nỗ Vũ', han: '弩', he: 'moc', sect: 'Đường Môn', cost: 2, type: 'atk', rar: 'hiem', dmg: 2, hits: 3, poison: 3, desc: '2 ST ×3 · Độc 3.' },
    vanTienTruQuang: { name: 'Vạn Tiễn Truy Quang', han: '萬', he: 'moc', sect: 'Đường Môn', cost: 3, type: 'atk', rar: 'tuyet', dmg: 4, hits: 5, poison: 10, exhaust: true, desc: '4 ST ×5 · Độc 2/mũi · Đoạn.' },
    // Ngũ Độc — chồng Độc rồi kích nổ
    ngungDocTan: { name: 'Ngưng Độc Tán', han: '凝', he: 'moc', sect: 'Ngũ Độc', cost: 1, type: 'ky', rar: 'thuong', poison: 6, desc: 'Độc 6.' },
    vanDocQuiTong: { name: 'Vạn Độc Quy Tông', han: '歸', he: 'moc', sect: 'Ngũ Độc', cost: 2, type: 'atk', rar: 'tuyet', detonate: 2, exhaust: true, desc: 'ST = Độc ×2 · xóa Độc · Đoạn.' },
    docLongToa: { name: 'Độc Long Toả', han: '鎖', he: 'moc', sect: 'Ngũ Độc', cost: 1, type: 'atk', rar: 'hiem', dmg: 4, poison: 3, weaken: 1, desc: '4 ST · Độc 3 · Suy Yếu 1.' },
    tanDocThu: { name: 'Tán Độc Thủ', han: '散', he: 'moc', sect: 'Ngũ Độc', cost: 0, type: 'ky', rar: 'so', poison: 3, desc: 'Độc 3.' },
    nguDocXaTien: { name: 'Ngũ Độc Xà Tiễn', han: '蛇', he: 'moc', sect: 'Ngũ Độc', cost: 1, type: 'atk', rar: 'thuong', dmg: 4, poison: 4, desc: '4 ST · Độc 4.' },
    cotDocChuong: { name: 'Cốt Độc Chưởng', han: '骨', he: 'moc', sect: 'Ngũ Độc', cost: 2, type: 'atk', rar: 'hiem', dmg: 8, poison: 3, desc: '8 ST · Độc 3.' },
    bachDocPhat: { name: 'Bách Độc Phát Tác', han: '發', he: 'moc', sect: 'Ngũ Độc', cost: 2, type: 'atk', rar: 'hiem', poison: 4, detonate: 1, desc: 'Độc 4 · rồi ST = Độc · xóa.' },
    // Ma Giáo — hút máu + đổi máu
    hapTinh: { name: 'Hấp Tinh Đại Pháp', han: '吸', he: 'moc', sect: 'Ma Giáo', cost: 2, type: 'atk', rar: 'tuyet', dmg: 7, drain: true, desc: '7 ST · hút máu = ST.', flavor: 'Tà công nghịch thiên của Ma Giáo, hút cạn nội lực người khác nạp vào mình. Uy lực kinh người, song dị chủng chân khí xung đột, sớm muộn phản phệ.' },
    huyetMaCong: { name: 'Huyết Ma Cuồng Công', han: '狂', he: 'moc', sect: 'Ma Giáo', cost: 2, type: 'atk', rar: 'tuyet', dmg: 18, selfDmg: 5, exhaust: true, desc: '18 ST · tự −5 HP · Đoạn.' },
    nhiepHonThuat: { name: 'Nhiếp Hồn Thuật', han: '攝', he: 'moc', sect: 'Ma Giáo', cost: 1, type: 'atk', rar: 'hiem', dmg: 5, drain: true, weaken: 1, desc: '5 ST · hút máu · Suy Yếu 1.' },
    huyetTraoThu: { name: 'Huyết Trảo Thủ', han: '爪', he: 'moc', sect: 'Ma Giáo', cost: 1, type: 'atk', rar: 'thuong', dmg: 5, drain: true, desc: '5 ST · hút máu.' },
    thichHuyetChu: { name: 'Thích Huyết Chú', han: '刺', he: 'moc', sect: 'Ma Giáo', cost: 0, type: 'atk', rar: 'thuong', dmg: 6, selfDmg: 3, desc: '6 ST · tự −3 HP.' },
    huyetTeChuong: { name: 'Huyết Tế Chưởng', han: '祭', he: 'moc', sect: 'Ma Giáo', cost: 1, type: 'atk', rar: 'hiem', dmg: 9, selfDmg: 3, desc: '9 ST · tự −3 HP.' },
    phanHuyetHoiNguyen: { name: 'Phần Huyết Hồi Nguyên', han: '焚', he: 'moc', sect: 'Ma Giáo', cost: 2, type: 'atk', rar: 'hiem', dmg: 10, drain: true, selfDmg: 4, desc: '10 ST · hút máu · tự −4 HP.' },
    // ---------- THỦY ☵ (khắc Hỏa) ----------
    // Nga Mi — hồi + trụ
    ngaMi: { name: 'Nga Mi Cửu Dương Công', han: '陽', he: 'thuy', sect: 'Nga Mi', cost: 1, type: 'ky', rar: 'thuong', heal: 8, desc: 'Hồi 8 HP.', flavor: 'Chân truyền Cửu Dương của phái Nga Mi. Vận công điều tức thì nội thương tự khỏi, ôn dưỡng sinh cơ, trụ được đường dài.' },
    phatQuangKinh: { name: 'Phật Quang Hộ Thể Kinh', han: '光', he: 'thuy', sect: 'Nga Mi', cost: 1, type: 'def', rar: 'hiem', blk: 8, heal: 4, desc: '+8 Hộ Thể · hồi 4.' },
    phoDoTe: { name: 'Phổ Độ Chúng Sinh Tế', han: '渡', he: 'thuy', sect: 'Nga Mi', cost: 2, type: 'ky', rar: 'tuyet', heal: 14, blk: 10, keepBlock: true, desc: 'Hồi 14 · +10 Hộ Thể · Giữ Hộ Thể.' },
    thanhTamChu: { name: 'Thanh Tâm Chú', han: '清', he: 'thuy', sect: 'Nga Mi', cost: 0, type: 'ky', rar: 'so', heal: 4, desc: 'Hồi 4.' },
    phoHienChuong: { name: 'Phổ Hiền Hộ Pháp Chưởng', han: '普', he: 'thuy', sect: 'Nga Mi', cost: 1, type: 'atk', rar: 'thuong', dmg: 5, heal: 3, desc: '5 ST · hồi 3.' },
    chuDuongTamChu: { name: 'Chú Dưỡng Hộ Tâm Chú', han: '護', he: 'thuy', sect: 'Nga Mi', cost: 1, type: 'def', rar: 'hiem', blk: 6, heal: 4, str: 1, desc: '+6 Hộ Thể · hồi 4 · +1 Lực.' },
    tuBiPhoDo: { name: 'Từ Bi Phổ Độ Chưởng', han: '慈', he: 'thuy', sect: 'Nga Mi', cost: 2, type: 'ky', rar: 'hiem', heal: 10, draw: 1, desc: 'Hồi 10 · rút 1.' },
    // Hoa Sơn — kiếm rẻ combo tempo
    hoaSon: { name: 'Hoa Sơn Kiếm Pháp', han: '華', he: 'thuy', sect: 'Hoa Sơn', cost: 2, type: 'atk', rar: 'thuong', dmg: 9, desc: 'Gây 9 ST.', flavor: 'Kiếm tông Hoa Sơn lấy khí ngự kiếm, chiêu thức tiêu sái. Một đường lăng lệ như gió núi, chính khí lẫm nhiên soi tỏ giang hồ.' },
    matKiem: { name: 'Mai Hoa Mật Kiếm', han: '密', he: 'thuy', sect: 'Hoa Sơn', cost: 0, type: 'atk', rar: 'thuong', dmg: 4, draw: 1, desc: '4 ST · rút 1.' },
    phaKiemThuc: { name: 'Phá Kiếm Thức', han: '破', he: 'thuy', sect: 'Hoa Sơn', cost: 1, type: 'atk', rar: 'hiem', dmg: 3, hits: 2, energy: 1, desc: '3 ST ×2 · +1 Khí.' },
    cuongPhongKiem: { name: 'Cuồng Phong Vô Định Kiếm', han: '狂', he: 'thuy', sect: 'Hoa Sơn', cost: 2, type: 'atk', rar: 'tuyet', dmg: 4, hits: 5, draw: 2, exhaust: true, desc: '4 ST ×5 · rút 2 · Đoạn.' },
    lacThacKiem: { name: 'Lạc Thác Kiếm', han: '落', he: 'thuy', sect: 'Hoa Sơn', cost: 0, type: 'atk', rar: 'so', dmg: 4, desc: '4 ST.' },
    ngocNuKiem: { name: 'Ngọc Nữ Kiếm Pháp', han: '玉', he: 'thuy', sect: 'Hoa Sơn', cost: 1, type: 'atk', rar: 'thuong', dmg: 6, draw: 1, desc: '6 ST · rút 1.' },
    tuTuKiem: { name: 'Liễu Nhứ Mãn Thiên Kiếm', han: '絮', he: 'thuy', sect: 'Hoa Sơn', cost: 1, type: 'atk', rar: 'hiem', dmg: 7, weaken: 2, desc: '7 ST · Suy Yếu 2.' },
    // Thúy Yên — băng khống chế (Suy Yếu + Choáng)
    hanBangChuong: { name: 'Hàn Băng Miên Chưởng', han: '寒', he: 'thuy', sect: 'Thúy Yên', cost: 1, type: 'atk', rar: 'thuong', dmg: 6, weaken: 2, desc: '6 ST · Suy Yếu 2.' },
    bangPhongToa: { name: 'Huyền Băng Phong Tỏa', han: '封', he: 'thuy', sect: 'Thúy Yên', cost: 2, type: 'ky', rar: 'hiem', stun: 1, weaken: 3, blk: 6, desc: 'Choáng 1 · Suy Yếu 3 · +6 Hộ Thể.' },
    vanLyBangPhong: { name: 'Vạn Lý Băng Phong Kiếm', han: '萬', he: 'thuy', sect: 'Thúy Yên', cost: 2, type: 'atk', rar: 'tuyet', dmg: 8, aoe: true, weaken: 3, stun: 1, exhaust: true, desc: '8 ST toàn địch · Suy Yếu 3 · Choáng 1 · Đoạn.' },
    bangChamThich: { name: 'Băng Châm Thích', han: '針', he: 'thuy', sect: 'Thúy Yên', cost: 0, type: 'atk', rar: 'so', dmg: 4, weaken: 1, desc: '4 ST · Suy Yếu 1.' },
    lanhSuongThu: { name: 'Lãnh Sương Hộ Thân Thủ', han: '霜', he: 'thuy', sect: 'Thúy Yên', cost: 1, type: 'def', rar: 'thuong', blk: 8, weaken: 1, desc: '+8 Hộ Thể · Suy Yếu 1.' },
    bangPhongChuong: { name: 'Băng Phong Chưởng', han: '掌', he: 'thuy', sect: 'Thúy Yên', cost: 2, type: 'atk', rar: 'hiem', dmg: 8, stun: 1, desc: '8 ST · Choáng 1.' },
    tuyetPhongChuong: { name: 'Tuyết Phong Chưởng', han: '雪', he: 'thuy', sect: 'Thúy Yên', cost: 2, type: 'atk', rar: 'hiem', dmg: 11, weaken: 3, desc: '11 ST · Suy Yếu 3.' },
    // ---------- HỎA ☲ (khắc Kim) ----------
    // Thiên Nhẫn — gieo Bỏng lan + AoE
    phanThienChuong: { name: 'Phần Thiên Chưởng', han: '焚', he: 'hoa', sect: 'Thiên Nhẫn', cost: 1, type: 'atk', rar: 'thuong', dmg: 5, burn: 2, burnT: 3, desc: '5 ST · Bỏng 2×3.' },
    hoaVanCuongPhong: { name: 'Hỏa Vân Cuồng Phong', han: '炎', he: 'hoa', sect: 'Thiên Nhẫn', cost: 2, type: 'atk', rar: 'hiem', dmg: 6, aoe: true, burn: 2, burnT: 3, desc: '6 ST toàn địch · Bỏng 2×3.' },
    liaoNguyenChiHoa: { name: 'Liệu Nguyên Chi Hỏa', han: '燎', he: 'hoa', sect: 'Thiên Nhẫn', cost: 2, type: 'ky', rar: 'tuyet', aoe: true, burn: 4, burnT: 3, exhaust: true, desc: 'Bỏng 4×3 toàn địch · Đoạn.' },
    tinhHoaMoi: { name: 'Tinh Hỏa Mồi', han: '星', he: 'hoa', sect: 'Thiên Nhẫn', cost: 0, type: 'atk', rar: 'so', dmg: 2, burn: 1, burnT: 3, desc: '2 ST · Bỏng 1×3.' },
    lieuHoaChuong: { name: 'Liệu Hỏa Chưởng', han: '燋', he: 'hoa', sect: 'Thiên Nhẫn', cost: 1, type: 'atk', rar: 'thuong', dmg: 3, burn: 2, burnT: 3, desc: '3 ST · Bỏng 2×3.' },
    phanThienDoiHoa: { name: 'Phần Thiên Đối Hỏa', han: '燄', he: 'hoa', sect: 'Thiên Nhẫn', cost: 1, type: 'atk', rar: 'hiem', dmg: 5, burn: 2, burnT: 3, desc: '5 ST · Bỏng 2×3.' },
    phucDiaHoaVan: { name: 'Phủ Địa Hỏa Vân', han: '燔', he: 'hoa', sect: 'Thiên Nhẫn', cost: 2, type: 'atk', rar: 'hiem', dmg: 5, aoe: true, burn: 2, burnT: 3, desc: '5 ST toàn địch · Bỏng 2×3.' },
    // Cái Bang — tích Lực rồi bùng nổ
    tuyQuyen: { name: 'Túy Quyền', han: '醉', he: 'hoa', sect: 'Cái Bang', cost: 1, type: 'atk', rar: 'thuong', dmg: 4, str: 2, desc: '4 ST · +2 Lực.' },
    khangLongTamChuong: { name: 'Kháng Long Tam Chưởng', han: '龍', he: 'hoa', sect: 'Cái Bang', cost: 1, type: 'atk', rar: 'hiem', dmg: 3, hits: 3, desc: '3 ST ×3.' },
    khangLongThapBatChuong: { name: 'Kháng Long Thập Bát Chưởng', han: '降', he: 'hoa', sect: 'Cái Bang', cost: 3, type: 'atk', rar: 'tuyet', dmg: 8, hits: 2, exhaust: true, desc: '8 ST ×2 · Đoạn.' },
    khaiTuuThuc: { name: 'Khai Tửu Thức', han: '酒', he: 'hoa', sect: 'Cái Bang', cost: 0, type: 'ky', rar: 'so', str: 1, draw: 1, desc: '+1 Lực · rút 1.' },
    dangLongCuoc: { name: 'Đăng Long Cước', han: '腿', he: 'hoa', sect: 'Cái Bang', cost: 1, type: 'atk', rar: 'thuong', dmg: 5, str: 1, desc: '5 ST · +1 Lực.' },
    tiemThienChuong: { name: 'Tiềm Thiên Chưởng', han: '潛', he: 'hoa', sect: 'Cái Bang', cost: 1, type: 'atk', rar: 'hiem', dmg: 4, hits: 2, str: 1, desc: '4 ST ×2 · +1 Lực.' },
    phiLongTaiThien: { name: 'Phi Long Tại Thiên', han: '飛', he: 'hoa', sect: 'Cái Bang', cost: 2, type: 'atk', rar: 'hiem', dmg: 11, str: 2, desc: '11 ST · +2 Lực.' },
    // Nhật Nguyệt — đổi máu lấy burst
    tichTa: { name: 'Tịch Tà Kiếm', han: '辟', he: 'hoa', sect: 'Nhật Nguyệt', cost: 2, type: 'atk', rar: 'tuyet', dmg: 3, hits: 3, desc: 'Đánh 3 × 3 ST.', flavor: 'Kiếm phổ tà môn nhanh đến quỷ khốc thần sầu. Ba nhát liền như một, ai thấy cũng lạnh gáy — nhưng luyện thì phải trả giá đắt.' },
    nhatNguyetTamPhap: { name: 'Nhật Nguyệt Tâm Pháp', han: '燃', he: 'hoa', sect: 'Nhật Nguyệt', cost: 1, type: 'atk', rar: 'hiem', dmg: 11, selfDmg: 5, desc: '11 ST · tự −5 HP.' },
    quangMinhTanPhap: { name: 'Quang Minh Tán Pháp', han: '焰', he: 'hoa', sect: 'Nhật Nguyệt', cost: 2, type: 'atk', rar: 'tuyet', dmg: 22, selfDmg: 8, exhaust: true, desc: '22 ST · tự −8 HP · Đoạn.' },
    huyetTeThuc: { name: 'Huyết Tế Thức', han: '血', he: 'hoa', sect: 'Nhật Nguyệt', cost: 0, type: 'ky', rar: 'so', selfDmg: 3, energy: 1, desc: 'tự −3 HP · +1 Khí.' },
    phanHuyetChuong: { name: 'Phần Huyết Chưởng', han: '殷', he: 'hoa', sect: 'Nhật Nguyệt', cost: 1, type: 'atk', rar: 'thuong', dmg: 8, selfDmg: 3, desc: '8 ST · tự −3 HP.' },
    nhiepHuyetThuc: { name: 'Nhiếp Huyết Thức', han: '攝', he: 'hoa', sect: 'Nhật Nguyệt', cost: 1, type: 'atk', rar: 'thuong', dmg: 6, drain: true, desc: '6 ST · hút máu.' },
    huyetHaiThichCot: { name: 'Huyết Hải Thích Cốt', han: '刺', he: 'hoa', sect: 'Nhật Nguyệt', cost: 2, type: 'atk', rar: 'hiem', dmg: 14, pen: true, selfDmg: 4, desc: '14 ST · Phá Giáp · tự −4 HP.' },
    // ---------- THỔ ☷ (khắc Thủy) ----------
    // Võ Đang — cố thủ + phản (keepBlock/blkToDmg)
    thaiCuc: { name: 'Thái Cực Quyền', han: '極', he: 'tho', sect: 'Võ Đang', cost: 1, type: 'def', rar: 'hiem', blk: 9, desc: '+9 Hộ Thể.', flavor: 'Trương chân nhân ngộ đạo bên suối, thấy nước chảy đá mòn mà thành quyền. Một vòng thái cực bao la, dĩ tĩnh chế động, tứ lạng bạt thiên cân.' },
    lienHoanThoiTuy: { name: 'Liên Hoàn Thôi Thủ', han: '推', he: 'tho', sect: 'Võ Đang', cost: 1, type: 'def', rar: 'hiem', blk: 7, keepBlock: true, desc: '+7 Hộ Thể · Giữ Hộ Thể.' },
    tuLuongBatThienCan: { name: 'Tứ Lượng Bạt Thiên Cân', han: '撥', he: 'tho', sect: 'Võ Đang', cost: 2, type: 'atk', rar: 'tuyet', dmg: 4, blkToDmg: 1, dodge: true, desc: '4 ST + toàn bộ Hộ Thể · Né.' },
    luongNghiThuc: { name: 'Lưỡng Nghi Thức', han: '兩', he: 'tho', sect: 'Võ Đang', cost: 0, type: 'def', rar: 'thuong', blk: 6, desc: '+6 Hộ Thể.' },
    nhuVanChuong: { name: 'Nhu Vân Chưởng', han: '雲', he: 'tho', sect: 'Võ Đang', cost: 1, type: 'def', rar: 'thuong', blk: 8, draw: 1, desc: '+8 Hộ Thể · rút 1.' },
    thaiCucNhuKinh: { name: 'Thái Cực Nhu Kình', han: '柔', he: 'tho', sect: 'Võ Đang', cost: 1, type: 'def', rar: 'hiem', blk: 6, dmg: 2, blkToDmg: 1, desc: '+6 Hộ Thể · 2 ST + toàn bộ Hộ Thể.' },
    luongNghiSinhTu: { name: 'Lưỡng Nghi Sinh Tứ Tượng', han: '儀', he: 'tho', sect: 'Võ Đang', cost: 3, type: 'def', rar: 'tuyet', blk: 16, keepBlock: true, draw: 2, exhaust: true, desc: '+16 Hộ Thể giữ · rút 2 · Đoạn.' },
    // Côn Lôn — Choáng khóa nhịp
    conLonChuong: { name: 'Côn Lôn Chưởng', han: '崑', he: 'tho', sect: 'Côn Lôn', cost: 1, type: 'atk', rar: 'thuong', dmg: 6, weaken: 1, desc: '6 ST · Suy Yếu 1.' },
    toaThienCuong: { name: 'Tỏa Thiên Cương Trận', han: '鎖', he: 'tho', sect: 'Côn Lôn', cost: 2, type: 'def', rar: 'hiem', blk: 9, stun: 1, desc: '+9 Hộ Thể · Choáng 1.' },
    honNguyenNhatKhi: { name: 'Hỗn Nguyên Nhất Khí', han: '混', he: 'tho', sect: 'Côn Lôn', cost: 2, type: 'atk', rar: 'tuyet', dmg: 16, stun: 1, exhaust: true, desc: '16 ST · Choáng 1 · Đoạn.' },
    khaiThienXucDia: { name: 'Khai Thiên Xúc Địa', han: '開', he: 'tho', sect: 'Côn Lôn', cost: 1, type: 'atk', rar: 'thuong', dmg: 5, pen: true, desc: '5 ST · Phá Giáp.' },
    canKhonNhatChi: { name: 'Càn Khôn Nhất Chỉ', han: '乾', he: 'tho', sect: 'Côn Lôn', cost: 0, type: 'atk', rar: 'thuong', dmg: 4, weaken: 1, desc: '4 ST · Suy Yếu 1.' },
    daoChuyenAmDuong: { name: 'Đảo Chuyển Âm Dương', han: '轉', he: 'tho', sect: 'Côn Lôn', cost: 2, type: 'atk', rar: 'hiem', dmg: 7, stun: 1, desc: '7 ST · Choáng 1.' },
    conLonTamThucKiem: { name: 'Côn Lôn Tam Thức Kiếm', han: '劍', he: 'tho', sect: 'Côn Lôn', cost: 2, type: 'atk', rar: 'hiem', dmg: 4, hits: 3, weaken: 1, desc: '4 ST ×3 · Suy Yếu 1.' },
    // Thiên Sơn — băng-thổ bền, Suy Yếu + hồi
    thienSonHanBang: { name: 'Thiên Sơn Hàn Băng Chưởng', han: '寒', he: 'tho', sect: 'Thiên Sơn', cost: 1, type: 'atk', rar: 'hiem', dmg: 7, weaken: 2, desc: '7 ST · Suy Yếu 2.' },
    bangPhachHoThan: { name: 'Băng Phách Hộ Thân', han: '魄', he: 'tho', sect: 'Thiên Sơn', cost: 1, type: 'def', rar: 'thuong', blk: 8, heal: 3, desc: '+8 Hộ Thể · hồi 3.' },
    lucDuongThanCong: { name: 'Lục Dương Thần Công', han: '陽', he: 'tho', sect: 'Thiên Sơn', cost: 2, type: 'ky', rar: 'tuyet', heal: 10, blk: 11, weaken: 2, exhaust: true, desc: 'Hồi 10 · +11 Hộ Thể · Suy Yếu 2 · Đoạn.' },
    thienSonChiHan: { name: 'Thiên Sơn Chỉ Hàn', han: '指', he: 'tho', sect: 'Thiên Sơn', cost: 0, type: 'atk', rar: 'so', dmg: 3, weaken: 1, desc: '3 ST · Suy Yếu 1.' },
    hoiXuanThuat: { name: 'Hồi Xuân Thuật', han: '春', he: 'tho', sect: 'Thiên Sơn', cost: 1, type: 'ky', rar: 'thuong', heal: 6, weaken: 1, desc: 'Hồi 6 · Suy Yếu 1.' },
    hanBangChanKhi: { name: 'Hàn Băng Chân Khí', han: '氣', he: 'tho', sect: 'Thiên Sơn', cost: 1, type: 'atk', rar: 'hiem', dmg: 6, heal: 4, weaken: 1, desc: '6 ST · hồi 4 · Suy Yếu 1.' },
    thienSonBangPhong: { name: 'Thiên Sơn Băng Phong', han: '封', he: 'tho', sect: 'Thiên Sơn', cost: 2, type: 'atk', rar: 'hiem', dmg: 9, weaken: 2, stun: 1, desc: '9 ST · Suy Yếu 2 · Choáng 1.' },
  };
  // Hợp Bích — hiệu ứng CỘNG THÊM khi chơi thẻ THỨ 2+ cùng phái trong 1 lượt (design §3). Áp inline trong playCard. Số DRAFT.
  const HOP_BICH = {
    'Thiên Vương': { blkBonus: 4, forcePen: true },          // Kim Cang Bất Hoại: +4 Hộ Thể & đòn Phá Giáp
    'Thiếu Lâm': { keepBlock: true, blkToDmgBonus: 0.5 },     // Kim Cang Phục Ma: giữ giáp & Công +½ Hộ Thể
    'Bồng Lai': { drawBonus: 1, energyOnce: 1 },              // Vân Du Tiên Tích: rút +1; lần đầu +1 Khí
    'Đường Môn': { dmgPerHit: 2, poisonBonus: 2 },            // Mãn Thiên Hoa Vũ: ám khí +2 ST/mũi & +2 Độc
    'Ngũ Độc': { detonateBonus: 0.5, keepHalfPoison: true },  // Bách Độc Câu Phát: kích nổ ×+0.5 & chừa nửa Độc
    'Ma Giáo': { drainHealBonus: 3, selfDmgReduce: 2 },       // Huyết Ma Đồng Nguyên: hút +3 hồi & selfDmg −2
    'Nga Mi': { healMul: 1.5, blkMul: 1.5 },                  // Cửu Dương Tương Sinh: heal & Hộ Thể ×1.5
    'Hoa Sơn': { dmgBonus: 2, drawBonus: 1 },                 // Ngũ Nhạc Kiếm Ý: +2 ST & rút +1
    'Thúy Yên': { weakenBonus: 2, blkBonus: 4 },              // Hàn Băng Phong Tỏa: Suy Yếu +2 & +4 Hộ Thể
    'Thiên Nhẫn': { extendBurn: 2 },                          // Liên Hoàn Phần Thiên: mọi Bỏng +2 lượt
    'Cái Bang': { strBonus: 2 },                              // Túy Quyền Liên Hoàn: +2 Lực
    'Nhật Nguyệt': { healFlat: 4 },                           // Huyết Nhật Đồng Huy: hồi 4 HP
    'Võ Đang': { keepBlock: true, dodge: true },              // Thái Cực Sinh Nghi: giữ giáp & né đòn kế
    'Côn Lôn': { stunBonus: 1, drawBonus: 1 },               // Càn Khôn Đảo Chuyển: đòn Choáng +1 lượt & rút +1
    'Thiên Sơn': { healFlat: 4, weakenBonus: 1 },            // Lục Dương Hồi Xuân: hồi 4 & Suy Yếu +1
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
    // --- Ác Thủ / Chưởng Môn (mini-boss) — chuongMon:true -> có màn "xuất trận" + banner ---
    voDang: { name: 'Võ Đang Chưởng Môn', han: '太', he: 'tho', hp: 66, elite: true, chuongMon: true, intents: [{ t: 'atk', v: 11 }, { t: 'def', v: 10 }, { t: 'charge' }, { t: 'atk', v: 20, big: true }, { t: 'heal', v: 8 }] },
    thienSon: { name: 'Thiên Sơn Lão Tổ', han: '雪', he: 'tho', hp: 72, elite: true, chuongMon: true, intents: [{ t: 'atk', v: 12 }, { t: 'charge' }, { t: 'atk', v: 22, big: true }, { t: 'def', v: 10 }, { t: 'atk', v: 8, hits: 2 }] },
    nhatNguyet: { name: 'Nhật Nguyệt Giáo Chủ', han: '日', he: 'hoa', hp: 70, elite: true, chuongMon: true, intents: [{ t: 'atk', v: 13 }, { t: 'buff', v: 4 }, { t: 'atk', v: 9, hits: 2 }, { t: 'charge' }, { t: 'atk', v: 24, big: true }] },
    bongLai: { name: 'Bồng Lai Tán Tiên', han: '蓬', he: 'kim', hp: 68, elite: true, chuongMon: true, intents: [{ t: 'atk', v: 11 }, { t: 'heal', v: 12 }, { t: 'def', v: 14 }, { t: 'atk', v: 15 }, { t: 'buff', v: 3 }] },
    // --- Mộng Chủ (boss) ---
    maGiao: { name: 'Ma Giáo Hộ Pháp · tàn niệm', han: '魔', he: 'moc', hp: 84, boss: true, intents: [{ t: 'atk', v: 12 }, { t: 'charge' }, { t: 'atk', v: 24, big: true }, { t: 'def', v: 14 }, { t: 'heal', v: 12 }] },
  };
  // Tiểu sử tàn niệm (bio) — hiển thị trong modal Chi Tiết Quái. Giọng võ lâm; nội dung là tàn niệm cao thủ trong mộng cảnh.
  const ENEMY_BIO = {
    cuongDao: 'Phường cường đạo chốn lục lâm, chiếm núi xưng vương. Đao pháp thô lậu mà sát khí đằng đằng, ra tay tàn nhẫn chỉ vì manh áo miếng cơm.',
    satThu: 'Sát thủ Hắc Phong ẩn mình trong bóng tối, một đời chỉ biết lấy mạng đoạt hồn. Sát khí ngưng nơi đầu ngón, ra tay tất lấy yết hầu — giết người trong chớp mắt mà chẳng để lộ hình tung.',
    langYeu: 'Yêu lang sinh trưởng nơi mộng cảnh, thú tính hung hãn mà chưa khai linh trí. Vuốt sắc hổ gầm cắn xé con mồi, gặp nguy thì thu mình thủ thế — chỉ biết cuồng bạo chứ chẳng rõ chiêu số.',
    taoKhau: 'Thảo khấu tụ tập chốn sơn dã, chiếm đường cướp của mà qua ngày. Đao pháp thô lậu chỉ biết chém giết vặt vãnh, hữu dũng vô mưu, gặp ai cũng liều mạng chỉ vì manh áo miếng cơm.',
    daLang: 'Dã lang hoang dại lang thang chốn rừng sâu, săn mồi theo bầy chẳng bao giờ đơn độc. Bổ nhào vờn mồi rồi cắn xé liên hoàn, hợp quần vây khốn — một khi động thủ thì lấy số áp người.',
    cungThu: 'Cung thủ chốn lục lâm rình sào huyệt, nấp trong tán cây mà bắn lén từ xa. Ngưng thần ngắm bắn đoạt mạng chẳng ngơi tay, thủ đoạn ám muội — chỉ cậy mũi tên chứ không dám giáp mặt.',
    tanKiem: 'Kiếm đồ lang bạt giang hồ, không môn không phái, kiếm pháp học lỏm tạp nham. Tán kiếm loạn chiêu mà liều lĩnh đoạt mạng, hữu chiêu vô lý — chỉ mong một kiếm đổi lấy miếng cơm.',
    doCo: 'Giáo đồ Ngũ Độc Giáo chốn Nam Cương, nuôi cổ thả độc chỉ để mưu hại người. Âm thầm điểm huyệt hạ độc, độc vụ mê hồn tỏa sương — âm hiểm khôn lường, gieo độc thủ chẳng chút ghê tay.',
    luyenKhi: 'Tán nhân luyện khí nơi hoang cốc, chấp niệm cầu công quá gấp mà tẩu hỏa nhập ma. Hỏa chưởng liệt diễm bốc cháy cả thân, chân khí phản phệ tâm mạch — cuồng loạn thiêu đốt, giết người mà cũng tự thiêu chính mình.',
    hoaSonKiem: 'Kiếm sĩ phái Hoa Sơn, một đời tôi luyện khí tông, lấy khí ngự kiếm mà thành danh. Kiếm ý ngưng như băng tuyết, xuất thủ nhẹ nhàng mà sắc bén thấu xương — một chiêu mai hoa đủ điểm huyệt đoạt mệnh.',
    duongMon: 'Sứ giả Đường Môn ẩn trong bóng tối, mười ngón tay giấu mười phần chết chóc. Ám khí tẩm độc vừa rời tay đã lấy mạng người, phòng chẳng kịp phòng.',
    caiBang: 'Trưởng lão Cái Bang, áo vải rách vai mà cốt cách hào sảng, xem thường vinh nhục thế gian. Trúc bổng vốn múa như rồng say, tưởng lảo đảo mà chiêu chiêu hiểm hóc — chân nhân bất lộ tướng, khiến địch khinh thường rồi chuốc bại.',
    ngaMiSu: 'Sư thái phái Nga Mi, một thân từ bi mà võ công chính trực nghiêm minh. Kiếm pháp công thủ vẹn toàn, tiến có Nga Mi thứ đoạt mệnh, lui có Kim Đỉnh hộ thân — nhu trung ngụ cương, chẳng cho địch hở một tấc.',
    thieuLam: 'Võ tăng Thiếu Lâm, kim thân bất hoại, một đời khổ luyện ngoại công cương mãnh. La Hán quyền phong hùng hồn như sấm dậy, cương mãnh phá vạn pháp — một quyền dốc toàn lực, để người chẳng dám khinh nhờn.',
    voDang: 'Chưởng môn Võ Đang, đạo cốt tiên phong, một đời tu Thái Cực. Đạo pháp thuận theo tự nhiên, dĩ tĩnh chế động, tứ lạng bạt thiên cân — chỉ tiếc chấp niệm còn vương nơi mộng cảnh.',
    thienSon: 'Lão tổ phái Thiên Sơn ẩn cư nơi băng phong tuyết lĩnh, một đời luyện Ngưng Băng Hàn Khí, chưởng phong lạnh thấu như hầm băng. Ra chiêu thì hàn quang phong bế kinh mạch, lạnh lùng tàn khốc — chấp niệm băng phong khóa chặt tâm ma nơi mộng cảnh.',
    nhatNguyet: 'Giáo chủ Nhật Nguyệt Thần Giáo, oai chấn một cõi giang hồ, ma khí ngùn ngụt bức người khó thở. Kiếm pháp âm độc hòa cùng Tụ Ma Vận Công, một chiêu ra thì thiên sầu địa ám — chỉ tiếc bá nghiệp dở dang, oán khí còn vương nơi mộng.',
    bongLai: 'Tán tiên phái Bồng Lai, tiên phong đạo cốt, ngự kiếm đạp mây lướt gió giữa chốn trần ai. Ngũ kiếm hợp thuật thu vạn khí quy nhất, ngọc lộ hồi xuân dưỡng thân bất lão — thân mang tiên duyên mà chấp niệm chưa dứt, vẫn vương một giấc mộng chưa thành.',
    maGiao: 'Tàn niệm của một vị hộ pháp Ma Giáo, chết rồi mà oán khí chẳng tan. Ma công thâm hiểm còn hằn trong mộng, gặp ai cũng chỉ biết sát phạt.',
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
    miniboss: [   // Ác Thủ / Chưởng Môn: LUÔN đa đợt (lâu la mở màn -> chưởng môn xuất trận). Random pool.
      [['taoKhau', 'taoKhau'], ['voDang']],
      [['satThu', 'langYeu'], ['thienSon']],
      [['cungThu', 'cungThu'], ['nhatNguyet']],
      [['doCo', 'daLang'], ['bongLai']],
      [['taoKhau', 'daLang', 'cungThu'], ['satThu', 'satThu'], ['voDang']],
      [['langYeu', 'langYeu'], ['tanKiem', 'luyenKhi'], ['thienSon']],
      [['doCo', 'doCo'], ['caiBang'], ['nhatNguyet']],
      [['cungThu', 'cungThu', 'cungThu'], ['hoaSonKiem'], ['bongLai']],
    ],
    boss: [   // Mộng Chủ: chung kết đa đợt (guards -> Mộng Chủ)
      [['thieuLam', 'ngaMiSu'], ['maGiao']],
      [['cungThu', 'cungThu'], ['nhatNguyet'], ['maGiao']],
      [['satThu', 'satThu'], ['caiBang', 'thieuLam'], ['maGiao']],
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
    map: [], mapTier: 0, mapView: [], battleKind: null, waves: [], waveIdx: 0, _waveFlash: 0, _bossReveal: null,
    enemies: [], targetIdx: 0, player: { block: 0, str: 0, dodge: false }, maxKhi: 3, khi: 3,
    drawPile: [], hand: [], discard: [], log: '', playerHit: false, playerFloats: [], _f: 0, _firstAtkUsed: false, _sectPlayed: {}, _shake: false, _hitstop: false, _winning: false, selUid: null,
    rewardCards: [], rewardGold: 0, event: {}, shopItems: [], _gotRelic: null,
    // ----- Bách Khoa Thẻ + Chi Tiết Quái (2 chức năng tra cứu, chỉ đọc POOL/ENEMIES/MOVES + DOM) -----
    dtlEnemy: null, wikiOpen: false, wikiSearch: '', fHe: 'all', fLoai: 'all', fBac: 'all', fPhai: 'all', phaiExpanded: false, cardDetail: null, lightbox: null,
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
      if (this.phase === 'reward') { this.rewardCards = this._rollKeys(3).map(mk); }
      else if (this.phase === 'shop') { const keys = this._rollKeys(3); this.shopItems = keys.map((k) => { const card = mk(k); const price = card.rar === 'tuyet' ? 75 : (card.rar === 'hiem' ? 50 : 30); return { card, price, sold: false }; }); }
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
    // Roll thẻ thưởng CÓ TRỌNG SỐ theo bậc (loại 'so'/'than' filler + Tuyệt chưa mở); không lặp. DRAFT.
    _rollKeys(n) {
      const W = { thuong: 3, hiem: 1.5, tuyet: 0.45 };
      const avail = Object.keys(POOL).filter((k) => { const c = POOL[k]; return c.rar !== 'so' && c.rar !== 'than' && this._cardUnlocked(k); });
      const out = [];
      for (let i = 0; i < n && avail.length; i++) {
        let s = 0; const w = avail.map((k) => { const x = W[POOL[k].rar] || 1; s += x; return x; });
        let r = Math.random() * s, idx = 0;
        for (let j = 0; j < avail.length; j++) { r -= w[j]; if (r <= 0) { idx = j; break; } }
        out.push(avail.splice(idx, 1)[0]);
      }
      return out;
    },

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

    // ============================================================
    // BÁCH KHOA THẺ + CHI TIẾT QUÁI (2 chức năng tra cứu)
    // CÁCH LY: chỉ đọc POOL / ENEMIES / MOVES / ENEMY_BIO (const component) + this.enemies (run) + DOM.
    // KHÔNG đụng state.combat / gearBag / currencies. (_cardUnlocked đọc state.dangTien — trong phạm vi cách ly.)
    // ============================================================
    heHan(h) { return HE_HAN[h] || ''; },
    khacName(h) { return HE_NAME[KHAC[h]] || '—'; },                                           // h khắc ...
    khacColor(h) { return HE_COLOR[KHAC[h]] || '#94a3b8'; },
    biKhacName(h) { const k = Object.keys(KHAC).find((x) => KHAC[x] === h); return k ? HE_NAME[k] : '—'; },   // ... khắc h
    biKhacColor(h) { const k = Object.keys(KHAC).find((x) => KHAC[x] === h); return k ? HE_COLOR[k] : '#94a3b8'; },
    // ----- Chi Tiết Quái (từ nút "Chi Tiết" trên panel quái — KHÔNG đụng chọn mục tiêu) -----
    openEnemyDetail(e) { this.dtlEnemy = e; },
    closeEnemyDetail() { this.dtlEnemy = null; },
    enemyLoai(e) { return !e ? '' : (e.boss ? 'Mộng Chủ' : (e.chuongMon ? 'Ác Thủ · Chưởng Môn' : (e.elite ? 'Tinh Anh' : 'Lâu La'))); },
    enemyBio(e) { return (e && ENEMY_BIO[e.id]) || ''; },
    enemyMoves(e) { return (e && MOVES[e.id]) || []; },
    enemyStatusList(e) { const a = []; if (!e) return a; if (e.block > 0) a.push({ k: 'hothe', label: 'Hộ Thể', v: e.block, c: '#38bdf8' }); if (e.poison > 0) a.push({ k: 'doc', label: 'Độc', v: e.poison, c: '#34d399' }); if (e.burn > 0 && e.burnT > 0) a.push({ k: 'burn', label: 'Bỏng', v: e.burn + '×' + e.burnT, c: '#fb923c' }); if (e.weak > 0) a.push({ k: 'suyyeu', label: 'Suy Yếu', v: e.weak, c: '#a78bfa' }); if (e.stun > 0) a.push({ k: 'stun', label: 'Choáng', v: e.stun, c: '#c084fc' }); if (e.str > 0) a.push({ k: 'luc', label: 'Lực', v: e.str, c: '#facc15' }); return a; },
    moveIntentText(e, i) { const it = e.intents[i]; if (!it) return ''; const s = e.str || 0;
      if (it.t === 'atk') { const per = Math.max(0, it.v + s - (e.weak || 0)); return it.hits ? ('Đánh ' + per + '×' + it.hits) : ('Đánh ' + per); }
      if (it.t === 'def') return 'Vận Hộ Thể ' + it.v; if (it.t === 'buff') return 'Tăng Lực +' + it.v;
      if (it.t === 'charge') return 'Vận Công… (đòn mạnh)'; if (it.t === 'heal') return 'Liệu Thương +' + it.v; return ''; },
    moveIntentColor(e, i) { const it = e.intents[i]; if (!it) return '#94a3b8'; return it.t === 'atk' ? '#fb7185' : (it.t === 'charge' ? '#f5b942' : (it.t === 'heal' ? '#34d399' : (it.t === 'def' ? '#38bdf8' : '#facc15'))); },
    moveArt(m) { return (m && m.art) ? 'images/cards/' + m.art + '.webp' : ''; },
    // ----- Bách Khoa Thẻ (wiki) — Sảnh + trong trận -----
    openWiki() { this.wikiOpen = true; },
    closeWiki() { this.wikiOpen = false; },
    wikiPhaiList() { return [...new Set(Object.keys(POOL).map((k) => POOL[k].sect).filter(Boolean))].sort(); },
    wikiPhaiShown() { const all = this.wikiPhaiList(); return this.phaiExpanded ? all : all.slice(0, 3); },
    wikiHasMorePhai() { return this.wikiPhaiList().length > 3; },
    wikiBacHas(r) { return r === 'all' || Object.values(POOL).some((c) => c.rar === r); },
    wikiTotal() { return Object.keys(POOL).length; },
    wikiCards() {
      const q = (this.wikiSearch || '').toLowerCase().trim();
      return Object.keys(POOL).filter((id) => { const c = POOL[id];
        if (this.fHe !== 'all' && c.he !== this.fHe) return false;
        if (this.fLoai !== 'all' && c.type !== this.fLoai) return false;
        if (this.fBac !== 'all' && c.rar !== this.fBac) return false;
        if (this.fPhai !== 'all') { if (this.fPhai === '__none') { if (c.sect) return false; } else if (c.sect !== this.fPhai) return false; }
        if (q && !((c.name + ' ' + (c.desc || '') + ' ' + (c.flavor || '') + ' ' + (c.sect || '')).toLowerCase().includes(q))) return false;
        return true;
      }).map((id) => ({ id, ...POOL[id] }));
    },
    wikiActive() { const a = []; if (this.fHe !== 'all') a.push({ g: 'he', label: 'Hệ ' + HE_NAME[this.fHe] }); if (this.fLoai !== 'all') a.push({ g: 'loai', label: this.typeLabel({ type: this.fLoai }) }); if (this.fBac !== 'all') a.push({ g: 'bac', label: RAR_N[this.fBac] }); if (this.fPhai !== 'all') a.push({ g: 'phai', label: this.fPhai === '__none' ? 'Vô phái' : this.fPhai }); return a; },
    setFilter(g, v) { if (g === 'he') this.fHe = v; else if (g === 'loai') this.fLoai = v; else if (g === 'bac') this.fBac = v; else if (g === 'phai') this.fPhai = v; },
    clearFilter(g) { this.setFilter(g, 'all'); },
    clearAllFilters() { this.fHe = this.fLoai = this.fBac = this.fPhai = 'all'; this.wikiSearch = ''; },
    togglePhaiExpand() { this.phaiExpanded = !this.phaiExpanded; },
    // ----- Chi Tiết Thẻ (từ wiki) -----
    openCardDetail(id) { this.cardDetail = id; },
    closeCardDetail() { this.cardDetail = null; },
    cd() { return this.cardDetail ? { id: this.cardDetail, ...POOL[this.cardDetail] } : {}; },
    cardLocked(id) { return !this._cardUnlocked(id); },   // dùng lại hệ mở khóa Tuyệt theo cột mốc (chỉ Tuyệt bị khóa)
    // ----- Lightbox (phóng to chân dung / thẻ) -----
    zoomImg(src) { if (src) this.lightbox = src; },
    closeZoom() { this.lightbox = null; },

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
      this.targetIdx = a.targetIdx || 0; this.player = a.player || { block: 0, str: 0, dodge: false, keepBlock: false };
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
      this.player = { block: 0, str: 0, dodge: false, keepBlock: false }; this.log = ''; this.playerFloats = []; this._gotRelic = null;
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
        return { id, name: t.name, han: t.han, he: t.he, _art: EART[id] || id, elite: !!t.elite, boss: !!t.boss, chuongMon: !!t.chuongMon, maxHp: Math.round(t.hp * hpScl), hp: Math.round(t.hp * hpScl), block: 0, poison: 0, weak: 0, str: 0, burn: 0, burnT: 0, stun: 0, stunImmune: 0, intents: ints, plan: 0, planNext: 0, floats: [], hit: false, burst: null, atkfx: null }; });
      this.targetIdx = 0;
      this.enemies.forEach((e) => { e.plan = this._planPick(e, -1); e.planNext = this._planFollow(e, e.plan); });
      this._triggerBossReveal();   // đợt có chưởng môn/Mộng Chủ -> màn "xuất trận"
    },
    // Màn "boss xuất trận" (art + tên) khi đợt có chưởng môn/Mộng Chủ tràn vào. reduced-motion -> bỏ.
    _triggerBossReveal() {
      try { if (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return; } catch (e) {}
      const b = this.enemies.find((e) => e.chuongMon || e.boss); if (!b) return;
      this._bossReveal = { name: b.name, _art: b._art, title: b.boss ? 'Mộng Chủ Giáng Lâm' : 'Chưởng Môn Xuất Trận', he: b.he };
      clearTimeout(this._bossRevealT); this._bossRevealT = setTimeout(() => { this._bossReveal = null; }, 1900);
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
    startTurnPassive() { this._sectPlayed = {}; if (this.run.hero.id === 'thien') this.player.block += 3; if (this.hasRelic('tuKhiDan')) this.player.block += 3; if (this.hasRelic('satKhi')) this.player.str += 1; this._firstAtkUsed = false; },
    // Màu glow viền chạy (Kim Quang) cho thẻ: Thần Thoại = tím Tử Quang (luôn); Hợp Bích = màu hệ (khi đã chơi ≥1 thẻ cùng phái/lượt, trong trận). '' = không glow.
    cardGlow(c) { if (!c) return ''; if (c.rar === 'than') return '#c084fc'; if (this.phase === 'battle' && c.sect && this._sectPlayed && (this._sectPlayed[c.sect] || 0) >= 1) return HE_COLOR[c.he] || '#94a3b8'; return ''; },
    hopBichName(sect) { return { 'Thiên Vương': 'Kim Cang Bất Hoại', 'Thiếu Lâm': 'Kim Cang Phục Ma', 'Bồng Lai': 'Vân Du Tiên Tích', 'Đường Môn': 'Mãn Thiên Hoa Vũ', 'Ngũ Độc': 'Bách Độc Câu Phát', 'Ma Giáo': 'Huyết Ma Đồng Nguyên', 'Nga Mi': 'Cửu Dương Tương Sinh', 'Hoa Sơn': 'Ngũ Nhạc Kiếm Ý', 'Thúy Yên': 'Hàn Băng Phong Tỏa', 'Thiên Nhẫn': 'Liên Hoàn Phần Thiên', 'Cái Bang': 'Túy Quyền Liên Hoàn', 'Nhật Nguyệt': 'Huyết Nhật Đồng Huy', 'Võ Đang': 'Thái Cực Sinh Nghi', 'Côn Lôn': 'Càn Khôn Đảo Chuyển', 'Thiên Sơn': 'Lục Dương Hồi Xuân' }[sect] || ''; },
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
    _hitPen(e, amt) { const before = e.hp; e.hp = Math.max(0, e.hp - amt); return before - e.hp; },   // Phá Giáp: bỏ qua Hộ Thể (trừ thẳng HP)
    _applyStun(e, n) {   // Choáng: quái thường cộng dồn; boss/chưởng môn cap 1 + kháng (miễn 3 lượt sau)
      if (e.boss || e.chuongMon) { if ((e.stunImmune || 0) > 0) return; e.stun = Math.max(e.stun || 0, 1); e.stunImmune = 3; }
      else { e.stun = (e.stun || 0) + n; }
    },
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
      if (i >= 0) { this.hand.splice(i, 1); if (!c.exhaust) this.discard.push(c); }   // Đoạn: thẻ rời khỏi trận (không vào chồng Bỏ)
      c._cast = null;
    },
    playCard(i, ev) {
      if (this._winning) return;
      const c = this.hand[i]; if (!c || c._cast || this.khi < c.cost) return;
      this.selUid = null;
      try { if (navigator.vibrate) navigator.vibrate((c.dmg || c.blkToDmg || c.detonate) ? [14] : [7]); } catch (_) {}   // rung máy: phản hồi CHẮC CHẮN
      this.khi -= c.cost;
      // ===== Hợp Bích: đếm thẻ CÙNG phái/lượt; thẻ thứ 2+ kích hiệu ứng phái (cộng thêm) =====
      const _sp = this._sectPlayed || (this._sectPlayed = {});
      const prior = c.sect ? (_sp[c.sect] || 0) : 0;
      if (c.sect) _sp[c.sect] = prior + 1;
      const hbOn = !!(c.sect && prior >= 1);
      const hb = hbOn ? (HOP_BICH[c.sect] || {}) : {};
      const tgt = () => this.enemies[this.tgtIdx()];
      if (c.energy) this.khi += c.energy;   // Tụ Khí: +Khí ngay
      if (hb.energyOnce && prior === 1) this.khi += hb.energyOnce;   // Bồng Lai: lần đầu combo/lượt +1 Khí
      if (c.poison) { const e = tgt(); if (e) e.poison += c.poison + (hb.poisonBonus || 0) + (this.run.hero.id === 'doc' ? 2 : 0) + (this.hasRelic('docLong') ? 2 : 0); }   // Độc gieo TRƯỚC đòn -> detonate tính cả Độc vừa gieo
      const usePen = c.pen || hb.forcePen;   // Phá Giáp (thẻ hoặc Hợp Bích Thiên Vương)
      // Nhánh SÁT THƯƠNG: gộp dmg thường + blkToDmg (Hộ Thể hóa ST) + detonate (kích nổ Độc)
      if (c.dmg || c.blkToDmg || c.detonate) {
        let base = (c.dmg || 0) + (this.player.str || 0) + (hb.dmgBonus || 0) + (hb.dmgPerHit || 0);
        const btd = (c.blkToDmg || 0) + (hb.blkToDmgBonus || 0);
        if (btd) base += Math.floor((this.player.block || 0) * btd);
        if (c.type === 'atk' && !this._firstAtkUsed) { let fb = 0; if (this.run.hero.id === 'kiem') fb += 3; if (this.hasRelic('lietNhan')) fb += 3; base += fb; this._firstAtkUsed = true; }   // Lợi Nhận (kiem) + Liệt Nhận Phù
        const hits = c.hits || 1;
        const tgts = c.aoe ? this.enemies.filter((e) => e.hp > 0) : (tgt() ? [tgt()] : []);
        let total = 0;
        tgts.forEach((e) => {
          let per = base;
          if (c.detonate) { const mul = c.detonate + (hb.detonateBonus || 0); per += Math.floor((e.poison || 0) * mul); e.poison = hb.keepHalfPoison ? Math.floor((e.poison || 0) / 2) : 0; }   // ST += Độc×k; Hợp Bích Ngũ Độc chừa nửa Độc
          if (KHAC[c.he] === e.he) { per = Math.floor(per * 1.3); e.burst = c.he; const eb = e; setTimeout(() => { eb.burst = null; }, 620); }
          let d = 0; for (let h = 0; h < hits; h++) d += (usePen ? this._hitPen(e, per) : this.hitEnemy(e, per));   // Phá Giáp -> bỏ qua Hộ Thể
          if (d > 0) this.floatE(e, d); total += d;
        });
        if (c.drain) this.run.hp = Math.min(this.run.maxHp, this.run.hp + total + (hb.drainHealBonus || 0));   // Hợp Bích Ma Giáo: hút +3 hồi
        this.log = c.name + (c.aoe ? ' (toàn thể)' : '') + ' → ' + total + ' ST';
      }
      const blkGain = Math.round((c.blk || 0) * (hb.blkMul || 1)) + (hb.blkBonus || 0);   // Nga Mi ×1.5 · Thiên Vương/Thúy Yên +4
      if (blkGain) this.player.block += blkGain;
      if (c.keepBlock || hb.keepBlock) this.player.keepBlock = true;   // Giữ Hộ Thể (thẻ / Thiếu Lâm / Võ Đang)
      const healGain = Math.round((c.heal || 0) * (hb.healMul || 1)) + (hb.healFlat || 0);   // Nga Mi ×1.5 · Nhật Nguyệt/Thiên Sơn +4
      if (healGain) this.run.hp = Math.min(this.run.maxHp, this.run.hp + healGain);
      // trạng thái áp lên mục tiêu (hoặc TOÀN địch nếu aoe)
      const affected = c.aoe ? this.enemies.filter((e) => e.hp > 0) : (tgt() ? [tgt()] : []);
      const weakenAmt = (c.weaken || 0) + (hb.weakenBonus || 0);   // Thúy Yên +2 · Thiên Sơn +1
      if (weakenAmt) affected.forEach((e) => { e.weak += weakenAmt; });
      if (c.burn) affected.forEach((e) => { e.burn = (e.burn || 0) + c.burn; e.burnT = Math.max(e.burnT || 0, c.burnT || 0); });   // Bỏng: cường độ cộng dồn, thời hạn lấy max
      if (hb.extendBurn) this.enemies.forEach((e) => { if (e.hp > 0 && e.burn > 0 && e.burnT > 0) e.burnT += hb.extendBurn; });   // Hợp Bích Thiên Nhẫn: mọi Bỏng +2 lượt
      const stunAmt = c.stun ? (c.stun + (hb.stunBonus || 0)) : 0;   // Côn Lôn: đòn Choáng +1 lượt
      if (stunAmt) affected.forEach((e) => this._applyStun(e, stunAmt));
      if (c.str || hb.strBonus) this.player.str += (c.str || 0) + (hb.strBonus || 0);   // Cái Bang +2 Lực
      if (c.dodge || hb.dodge) this.player.dodge = true;   // Né (thẻ / Võ Đang)
      if (c.selfDmg) { const sd = Math.max(0, c.selfDmg - (hb.selfDmgReduce || 0)); if (sd) { this.run.hp = Math.max(1, this.run.hp - sd); this.floatPlayer(sd); } }   // đổi máu; Hợp Bích Ma Giáo −2
      if (hbOn) this.log = '〈Hợp Bích ' + c.sect + '〉 ' + (this.log || c.name);
      this.castCard(c, ev);
      const drawN = (c.draw || 0) + (hb.drawBonus || 0);   // Bồng Lai/Hoa Sơn/Côn Lôn +1
      if (drawN) this.draw(drawN);
      if (this.aliveCount() === 0) this._battleCleared();
      this._saveRun();
    },
    endTurn() {
      if (this._winning) return;
      this.selUid = null;
      for (const hc of this.hand) hc._cast = null;
      this.discard.push(...this.hand); this.hand = [];
      // DoT cuối lượt người chơi: Độc (giảm dần) + Bỏng (cố định, xuyên Hộ Thể, hết burnT thì tắt)
      for (const e of this.enemies) { if (e.hp <= 0) continue;
        if (e.poison > 0) { this.hitEnemy(e, e.poison); this.floatE(e, e.poison); e.poison = Math.max(0, e.poison - 1); }
        if (e.burn > 0 && e.burnT > 0) { const b = e.burn; e.hp = Math.max(0, e.hp - b); this.floatE(e, b); e.burnT--; if (e.burnT <= 0) e.burn = 0; }
      }
      if (this.aliveCount() === 0) {
        if (this.waves && this.waveIdx < this.waves.length - 1) { this._advanceWave(); }   // Độc/Bỏng dứt điểm đợt này -> đợt kế tràn tới (ra đòn lượt SAU)
        else { this._finishBattle(); return; }
      } else {
        let toPlayer = 0, _ai = 0;
        for (const e of this.enemies) { if (e.hp <= 0) continue;
          if ((e.stun || 0) > 0) { e.stun--; e.weak = Math.max(0, (e.weak || 0) - 1); if ((e.stunImmune || 0) > 0) e.stunImmune--; continue; }   // Choáng: bỏ lượt, giữ nguyên telegraph (ra đòn lượt sau)
          const it = this.curIntent(e); if (it) {
            this._enemyActFx(e, it, _ai++);   // hiệu ứng quái ra đòn (cosmetic, lệch nhịp)
            if (it.t === 'atk') { let per = Math.max(0, it.v + (e.str || 0) - (e.weak || 0)); const hits = it.hits || 1; for (let h = 0; h < hits; h++) { if (this.player.dodge) { this.player.dodge = false; continue; } toPlayer += this.absorbPlayer(per); } }
            else if (it.t === 'def') e.block += it.v; else if (it.t === 'buff') e.str = (e.str || 0) + it.v; else if (it.t === 'heal') e.hp = Math.min(e.maxHp, e.hp + it.v);
          }
          e.plan = (e.planNext != null) ? e.planNext : this._planPick(e, e.plan); e.planNext = this._planFollow(e, e.plan); e.weak = Math.max(0, (e.weak || 0) - 1); if ((e.stunImmune || 0) > 0) e.stunImmune--;
        }
        if (toPlayer > 0) this.floatPlayer(toPlayer);
        if (this.run.hp <= 0) { this.onDeath(); return; }
      }
      if (this.player.keepBlock) { this.player.keepBlock = false; }   // Giữ Hộ Thể: KHÔNG reset block lượt này (dùng 1 lần)
      else this.player.block = this.hasRelic('kimChung') ? Math.floor(this.player.block / 2) : 0;   // Kim Chung Tráo: giữ nửa Hộ Thể dư
      this.khi = this.maxKhi; this.startTurnPassive(); this.draw(this.handSize());
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
      this.rewardCards = this._rollKeys(3).map(mk);
      this._setReroll(); this.phase = 'reward'; this._saveRun();
    },
    pickReward(c) { this.run.deck.push(mk(c.id)); this.afterNode(); },

    openEvent() { this.event = rnd([
      { title: 'Lão Nhân Bên Suối', text: 'Một lão nhân áo vải câu bên suối mộng, ngẩng lên cười: "Tiểu hữu, ngươi muốn một quyển bí kíp, hay chút lộ phí?"',
        opts: [{ label: 'Xin một chiêu thức (rút 1/3 thẻ)', fn: () => { this.rewardGold = 0; this.rewardCards = this._rollKeys(3).map(mk); this._setReroll(); this.phase = 'reward'; } },
                { label: 'Xin lộ phí (+45 Mộng Ngân)', fn: () => { this.runNgan += 45; this.afterNode(); } }] },
      { title: 'Thạch Bia Cổ', text: 'Tấm bia khắc võ học cổ, sát khí âm u. Lĩnh hội thì lợi hại, nhưng phản phệ chút tâm thần.',
        opts: [{ label: 'Lĩnh hội (mất 6 HP, +1 thẻ Tuyệt)', fn: () => { this.run.hp = Math.max(1, this.run.hp - 6); const tk = Object.keys(POOL).filter((k) => POOL[k].rar === 'tuyet' && this._cardUnlocked(k)); const t = tk.length ? rnd(tk) : rnd(Object.keys(POOL).filter((k) => POOL[k].rar === 'hiem')); this.run.deck.push(mk(t)); this.afterNode(); } },
                { label: 'Bỏ qua', fn: () => this.afterNode() }] },
      { title: 'Suối Linh Tuyền', text: 'Dòng suối trong mộng tỏa linh khí mát lành.',
        opts: [{ label: 'Tẩm mình (hồi 40% HP)', fn: () => { this.run.hp = Math.min(this.run.maxHp, this.run.hp + Math.round(this.run.maxHp * 0.4)); this.afterNode(); } },
                { label: 'Múc mang theo (+30 Mộng Ngân)', fn: () => { this.runNgan += 30; this.afterNode(); } }] },
    ]); this.phase = 'event'; this._saveRun(); },
    resolveEvent(o) { o.fn(); this._saveRun(); },

    openShop() { const keys = this._rollKeys(3);
      this.shopItems = keys.map((k) => { const card = mk(k); let price = card.rar === 'tuyet' ? 75 : (card.rar === 'hiem' ? 50 : 30); if ((this.run.sc || 0) >= 5) price = Math.round(price * 1.15); return { card, price, sold: false }; }); this._setReroll(); this.phase = 'shop'; this._saveRun(); },
    buyShop(i) { const s = this.shopItems[i]; if (s.sold || this.runNgan < s.price) return; this.runNgan -= s.price; this.run.deck.push(mk(s.card.id)); s.sold = true; this._saveRun(); },
    buyHeal() { if (this.runNgan < 40 || this.run.hp >= this.run.maxHp) return; this.runNgan -= 40; this.run.hp = Math.min(this.run.maxHp, this.run.hp + 18); this._saveRun(); },
    restHeal() { this.run.hp = Math.min(this.run.maxHp, this.run.hp + Math.round(this.run.maxHp * this.restPct())); this.afterNode(); },
    restLearn() { const t = this._rollKeys(1)[0] || 'coBanKiem'; this.run.deck.push(mk(t)); this.afterNode(); },
  };
}
