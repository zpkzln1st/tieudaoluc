// ============================================================
// DATA — Combat: yêu thú + boss + bộ pháp (thuần data)
// reqLevel = Chiến Đấu Lv đề xuất. exp = Chiến Đấu EXP/con. statXp = Tứ Trụ EXP/con.
// loot = [{ itemId, chance }] roll mỗi con. NGŨ HÀNH yêu thú KHÔNG cố định:
//   mỗi TRẬN roll ngẫu nhiên 1 trong Kim/Mộc/Thủy/Hỏa/Thổ (votong.js rollHe). affinity = loại yêu thú.
//   (Boss có thể đặt `he:'<hệ>'` để cố định — hiện để ngẫu nhiên cho đồng nhất.)
// ============================================================

// ---- Bộ sinh chỉ số theo CẤP + DÁNG (cân bằng tập trung 1 chỗ — dễ chỉnh) ----
// arch: 'thuong' cân bằng · 'trau' nhiều máu/thủ chậm · 'nhanh' đau/nhanh máu mỏng · 'boss' trùm.
const ARCH = {
  thuong: { hp: 1,   atk: 1,    def: 1,   spd: 1,    exp: 1 },
  trau:   { hp: 1.6, atk: 0.9,  def: 1.45,spd: 0.85, exp: 1.3 },
  nhanh:  { hp: 0.7, atk: 1.25, def: 0.85,spd: 1.32, exp: 1.1 },
  boss:   { hp: 6,   atk: 1.45, def: 1.3, spd: 0.95, exp: 9 },
};
function mk(level, arch, extra) {
  const a = ARCH[arch] || ARCH.thuong;
  const hp  = Math.round(0.95 * Math.pow(level, 2.25) * a.hp);
  const atk = Math.round(1.4  * Math.pow(level, 1.30) * a.atk);
  const def = Math.round(0.6  * Math.pow(level, 1.30) * a.def);
  const spd = Math.round(70 * a.spd);
  const exp = Math.round(0.5  * Math.pow(level, 1.45) * a.exp);
  const power  = Math.round(hp * 0.22 + atk * 4);
  const statXp = Math.max(1, Math.round(level / 8));
  const time   = Math.max(6, Math.round(level * 0.12) + 5);
  return Object.assign({ reqLevel: level, hp, atk, def, spd, exp, statXp, power, time }, extra);
}

export const ENEMIES = {
  // ===== Lam Linh Cốc (Lv1) + U Lâm (Lv8) — Nhân Gian (giữ nguyên, đã cân) =====
  daLang:  { id: 'daLang',  name: 'Sói Hoang',  gloss: 'Wild Wolf',  icon: '🐺', reqLevel: 1,  power: 15,  exp: 5,  statXp: 1, time: 6,  loot: [{ itemId: 'langBi', chance: 0.30 }],
    hp:60,  atk:9,  def:3,  spd:72, affinity:'Mãnh Thú', lore:'Sói hoang đầu rừng, nhanh nhẹn, lao tới cắn xé — khí tức nó biến hoá thất thường khôn lường.',  atkFl:'lao tới đớp',     skill:{ name:'Liệt Trảo',     mult:1.6, cd:4, fl:'gầm gừ vung móng vuốt' } },
  sonTru:  { id: 'sonTru',  name: 'Heo Rừng',   gloss: 'Wild Boar',  icon: '🐗', reqLevel: 3,  power: 35,  exp: 8,  statXp: 1, time: 8,  loot: [{ itemId: 'truNha', chance: 0.25 }],
    hp:120, atk:14, def:7,  spd:66, affinity:'Mãnh Thú', lore:'Mãnh thú da dày, chỉ biết cúi đầu lao húc, mỗi lần lâm trận lại nhuốm một loại khí tức khác.', atkFl:'thúc một cú',     skill:{ name:'Cuồng Húc',     mult:1.7, cd:4, fl:'cúi đầu cuồng nộ lao húc' } },
  hacHung: { id: 'hacHung', name: 'Gấu Đen',    gloss: 'Black Bear', icon: '🐻', reqLevel: 8,  power: 90,  exp: 15, statXp: 2, time: 12, loot: [{ itemId: 'hungChuong', chance: 0.20 }],
    hp:300, atk:24, def:16, spd:58, affinity:'Hậu Bì', lore:'Gấu đen núi sâu, da dày lông rậm, thân thủ trầm trọng — ngũ hành biến ảo theo từng cơn cuồng nộ.', atkFl:'tát một chưởng',  skill:{ name:'Bàn Sơn Chưởng',mult:1.6, cd:5, fl:'vung chưởng to như cối đá' } },
  yeuHo:   { id: 'yeuHo',   name: 'Hồ Ly Tinh', gloss: 'Fox Spirit', icon: '🦊', reqLevel: 15, power: 220, exp: 25, statXp: 3, time: 15, loot: [{ itemId: 'hoVi', chance: 0.15 }],
    hp:420, atk:40, def:22, spd:90, affinity:'Yêu Tinh', lore:'Hồ ly tu thành tinh, nguyên thần biến hoá, mỗi trận lại mượn một hành khí khác nhau để hộ thân.',  atkFl:'cào một phát',    skill:{ name:'Mê Hồn Trảo',   mult:1.5, cd:4, fl:'vờn quanh tung trảo mê hoặc' } },

  // ===== Huyền Đô (Lv18) — Nhân Gian — lục lâm / hắc đạo =====
  daoTac:  mk(18, 'thuong', { id:'daoTac', name:'Đạo Tặc', gloss:'Highwayman', icon:'🗡️', affinity:'Lục Lâm', loot:[{itemId:'tangNgan',chance:0.28}],
    lore:'Cường đạo mai phục bên quan đạo, thấy khách thương là rút đao đoạt mệnh.', atkFl:'vung đoản đao chém tới', skill:{name:'Đoạt Mệnh Đao',mult:1.7,cd:4,fl:'lăm lăm đoản đao bổ tới yết hầu'} }),
  hacYVe:  mk(18, 'trau', { id:'hacYVe', name:'Hắc Y Vệ', gloss:'Shadow Guard', icon:'🥷', affinity:'Hắc Đạo', loot:[{itemId:'hacThietPhien',chance:0.30}],
    lore:'Sát thủ áo đen của hắc bang, mình kín như bưng, ám khí giấu khắp người.', atkFl:'phóng một loạt ám khí', skill:{name:'Mãn Thiên Hoa Vũ',mult:1.6,cd:5,fl:'tung mưa ám khí phủ kín trời'} }),
  luuManh: mk(18, 'nhanh', { id:'luuManh', name:'Lưu Manh', gloss:'Street Thug', icon:'👊', affinity:'Lục Lâm', loot:[{itemId:'tangNgan',chance:0.20}],
    lore:'Du côn phố chợ, ra tay nhanh và bẩn, đánh lén sau lưng là sở trường.', atkFl:'thụi một quyền hèn hạ', skill:{name:'Tạp Đả Cước',mult:1.5,cd:3,fl:'tung loạn quyền cước bất kể chiêu thức'} }),
  sonTacVuong: mk(28, 'boss', { id:'sonTacVuong', name:'Sơn Tặc Vương', gloss:'Bandit King', icon:'👑', isBoss:true, affinity:'Trùm Lục Lâm', loot:[{itemId:'hoPhuDauLinh',chance:0.04},{itemId:'hacThietPhien',chance:0.5}],
    lore:'Đầu lĩnh lục lâm hùng cứ một phương, một tiếng hô là trăm tên lâu la dạ ran.', atkFl:'vung đại đao chém ngang', skill:{name:'Bá Vương Trảm',mult:2.4,cd:5,fl:'một đao bá đạo chém rạp cả hàng quân'} }),

  // ===== Thủy Tinh Động (Lv32) — Bí Cảnh — pha lê / hang động =====
  tinhThachQuai: mk(32, 'trau', { id:'tinhThachQuai', name:'Tinh Thạch Quái', gloss:'Crystal Golem', icon:'💠', affinity:'Thạch Linh', loot:[{itemId:'thuyTinhSa',chance:0.30}],
    lore:'Khối pha lê thành tinh trong khoáng mạch, da cứng như thạch anh nguyên khối.', atkFl:'nện một quả đấm pha lê', skill:{name:'Thạch Anh Toái',mult:1.6,cd:5,fl:'đấm vỡ nền hang, mảnh pha lê văng tứ phía'} }),
  dongUMinh: mk(32, 'nhanh', { id:'dongUMinh', name:'Động U Linh', gloss:'Cave Wraith', icon:'👻', affinity:'Oan Hồn', loot:[{itemId:'uMinhThach',chance:0.18}],
    lore:'Oan hồn vất vưởng nơi hang sâu, lúc ẩn lúc hiện trong bóng tối lạnh lẽo.', atkFl:'lướt tới cào âm khí', skill:{name:'U Minh Trảo',mult:1.7,cd:4,fl:'vươn móng âm hồn xé qua hồn phách'} }),
  huyetPhucChau: mk(32, 'thuong', { id:'huyetPhucChau', name:'Huyết Phúc Châu', gloss:'Blood Bat', icon:'🦇', affinity:'Huyết Tộc', loot:[{itemId:'thuyTinhSa',chance:0.22}],
    lore:'Bầy dơi hút máu trú trong hang tối, đông như mây đen che kín lối đi.', atkFl:'lao xuống cắn', skill:{name:'Hấp Huyết Trận',mult:1.5,cd:4,fl:'cả đàn dơi vây kín hút máu'} }),

  // ===== Lăng Tiêu Phong (Lv48) — Bí Cảnh — núi tuyết / băng =====
  tuyetLang: mk(48, 'nhanh', { id:'tuyetLang', name:'Tuyết Lang', gloss:'Snow Wolf', icon:'🐺', affinity:'Tuyết Thú', loot:[{itemId:'tuyetLangBi',chance:0.30}],
    lore:'Sói tuyết đỉnh non cao, lông trắng lẫn vào bão tuyết, ra đòn nhanh như gió rít.', atkFl:'lao tới ngoạm', skill:{name:'Tuyết Bạo Trảo',mult:1.7,cd:4,fl:'cuốn theo bão tuyết vồ tới'} }),
  bangPhachDieu: mk(48, 'thuong', { id:'bangPhachDieu', name:'Băng Phách Điêu', gloss:'Frost Eagle', icon:'🦅', affinity:'Tuyết Thú', loot:[{itemId:'hanThietTinh',chance:0.18}],
    lore:'Đại bàng băng phủ móng vuốt sương giá, bổ nhào từ trời cao xé toạc gió rét.', atkFl:'bổ nhào quặp xuống', skill:{name:'Hàn Vũ Kích',mult:1.8,cd:5,fl:'sà xuống như mũi băng tiễn từ mây'} }),
  hanGiao: mk(48, 'trau', { id:'hanGiao', name:'Hàn Giao', gloss:'Frost Serpent', icon:'🐍', affinity:'Băng Mãng', loot:[{itemId:'hanThietTinh',chance:0.22}],
    lore:'Mãng xà hàn băng cuộn mình trong động tuyết, mỗi cú quấn lạnh thấu xương tuỷ.', atkFl:'quấn siết một vòng', skill:{name:'Băng Triền',mult:1.6,cd:5,fl:'cuộn chặt phun hàn khí đóng băng'} }),
  hanGiaoVuong: mk(58, 'boss', { id:'hanGiaoVuong', name:'Hàn Giao Vương', gloss:'Frost Serpent King', icon:'🐉', isBoss:true, affinity:'Trùm Băng Mãng', loot:[{itemId:'hachCoLinh',chance:0.03},{itemId:'hanThietTinh',chance:0.5}],
    lore:'Mãng vương ngàn năm ngụ đỉnh tuyết, hơi thở một cái là cả sườn núi đóng băng.', atkFl:'phun bão băng', skill:{name:'Vạn Lý Băng Phong',mult:2.6,cd:6,slow:true,fl:'phun cuồng phong băng giá phủ trắng chiến trường'} }),

  // ===== Mê Ảo Lục Châu (Lv60) — Tiên Cảnh — sa mạc / ảo cảnh =====
  saMang: mk(60, 'trau', { id:'saMang', name:'Sa Mãng', gloss:'Sand Python', icon:'🐍', affinity:'Sa Thú', loot:[{itemId:'saMangDam',chance:0.16}],
    lore:'Trăn cát khổng lồ ẩn dưới lòng sa mạc, đợi con mồi sa chân là trồi lên nuốt trọn.', atkFl:'trồi lên đớp', skill:{name:'Lưu Sa Thôn',mult:1.8,cd:5,fl:'cuốn cát thành xoáy nuốt chửng địch'} }),
  huyenHo: mk(60, 'nhanh', { id:'huyenHo', name:'Huyễn Hồ', gloss:'Mirage Fox', icon:'🦊', affinity:'Ảo Yêu', loot:[{itemId:'huyenSa',chance:0.28}],
    lore:'Hồ ly ảo ảnh nơi ốc đảo, phân thân thành trăm bóng khiến địch hoa cả mắt.', atkFl:'phân thân vờn tới', skill:{name:'Thiên Ảo Mê Tung',mult:1.6,cd:4,fl:'tạo vô số ảo ảnh tung trảo từ mọi phía'} }),
  luuSaQuy: mk(60, 'thuong', { id:'luuSaQuy', name:'Lưu Sa Quỷ', gloss:'Quicksand Ghoul', icon:'🟤', affinity:'Sa Quỷ', loot:[{itemId:'huyenSa',chance:0.22}],
    lore:'Quỷ cát thành hình từ lưu sa, vươn tay cát lôi lữ khách xuống lòng đất.', atkFl:'vươn tay cát chộp', skill:{name:'Sa Phọc',mult:1.7,cd:4,fl:'cát mềm hoá xích trói chặt'} }),

  // ===== Phù Không Hoa Viên (Lv70) — Tiên Cảnh — vườn lơ lửng / tầng mây =====
  hoaYeu: mk(70, 'thuong', { id:'hoaYeu', name:'Hoa Yêu', gloss:'Flower Spirit', icon:'🌸', affinity:'Hoa Yêu', loot:[{itemId:'phuQuangPhan',chance:0.26}],
    lore:'Hoa yêu nghìn năm hấp thụ linh khí tầng mây, hương thơm mê hồn ẩn độc phấn chết người.', atkFl:'phẩy cánh hoa độc', skill:{name:'Mê Hương Phấn',mult:1.6,cd:4,fl:'tung phấn hoa mê man tâm trí'} }),
  vanDieu: mk(70, 'nhanh', { id:'vanDieu', name:'Vân Điểu', gloss:'Cloud Bird', icon:'🕊️', affinity:'Vân Cầm', loot:[{itemId:'vanVuLong',chance:0.24}],
    lore:'Chim mây trú giữa tầng không, sải cánh xé gió nhanh như tia chớp xẹt ngang trời.', atkFl:'sà cánh chém gió', skill:{name:'Phong Nhận Kích',mult:1.8,cd:4,fl:'cánh sắc như đao rạch ngang trời'} }),
  phuQuangDiep: mk(70, 'trau', { id:'phuQuangDiep', name:'Phù Quang Điệp', gloss:'Glow Moth', icon:'🦋', affinity:'Quang Điệp', loot:[{itemId:'phuQuangPhan',chance:0.20}],
    lore:'Bướm phát quang khổng lồ, vảy cánh lấp lánh che mờ thị giác của kẻ đi săn.', atkFl:'đập cánh choáng mắt', skill:{name:'Quang Lân Vũ',mult:1.6,cd:5,fl:'rắc vảy quang gây loá mắt choáng váng'} }),

  // ===== Quan Tinh Đài (Lv78) — Tiên Cảnh — tinh tú / linh khí =====
  tinhLinh: mk(78, 'thuong', { id:'tinhLinh', name:'Tinh Linh', gloss:'Star Elemental', icon:'🌟', affinity:'Tinh Linh', loot:[{itemId:'tinhTuy',chance:0.22}],
    lore:'Nguyên linh kết tụ từ ánh sao rơi, toàn thân là tinh quang rực rỡ chói loà.', atkFl:'phóng tia tinh quang', skill:{name:'Lạc Tinh Kích',mult:1.8,cd:5,fl:'gọi sao băng giáng thẳng xuống'} }),
  thienCuongVe: mk(78, 'trau', { id:'thienCuongVe', name:'Thiên Cương Vệ', gloss:'Astral Guardian', icon:'🛡️', affinity:'Thần Tướng', loot:[{itemId:'tinhTuy',chance:0.18},{itemId:'huKhongTinh',chance:0.08}],
    lore:'Thần tướng giữ đài quan tinh, giáp trụ đúc từ thiên thạch cứng vô song.', atkFl:'giáng thiên thạch chuỳ', skill:{name:'Cương Kim Trấn',mult:1.7,cd:5,fl:'nện chuỳ thiên thạch chấn động cả đài'} }),
  huKhongThu: mk(78, 'nhanh', { id:'huKhongThu', name:'Hư Không Thú', gloss:'Void Beast', icon:'🌀', affinity:'Hư Thú', loot:[{itemId:'huKhongTinh',chance:0.12}],
    lore:'Dã thú sinh từ khe hư không, thân hình méo mó nuốt cả ánh sáng xung quanh.', atkFl:'nhe nanh hư không cắn', skill:{name:'Hư Không Thôn Phệ',mult:1.9,cd:5,fl:'há miệng hư vô nuốt chửng'} }),
  cuuViHoTien: mk(88, 'boss', { id:'cuuViHoTien', name:'Cửu Vĩ Hồ Tiên', gloss:'Nine-Tail Fox', icon:'🦊', isBoss:true, affinity:'Trùm Hồ Tiên', loot:[{itemId:'cuuViTinh',chance:0.025},{itemId:'tinhTuy',chance:0.5}],
    lore:'Hồ tiên chín đuôi tu luyện vạn năm, một cái phẩy đuôi là mê hoặc cả vạn quân.', atkFl:'quét chín đuôi', skill:{name:'Cửu Vĩ Phần Thiên',mult:2.7,cd:6,fl:'chín đuôi hoá lửa quét sạch tám phương'} }),

  // ===== Tịch Ngữ Đảo (Lv92) — Thần Vực — hải đảo / sương mù =====
  haiYeu: mk(92, 'trau', { id:'haiYeu', name:'Hải Yêu', gloss:'Sea Demon', icon:'🐙', affinity:'Hải Yêu', loot:[{itemId:'giaoChau',chance:0.14}],
    lore:'Yêu vật biển sâu trồi lên đảo mù, xúc tu khổng lồ siết nát cả thuyền bè.', atkFl:'quật xúc tu', skill:{name:'Hải Lao Triền',mult:1.9,cd:5,fl:'xúc tu cuốn siết nhấn chìm xuống đáy'} }),
  meVuYeu: mk(92, 'nhanh', { id:'meVuYeu', name:'Mê Vụ Hồn', gloss:'Mist Wraith', icon:'🌫️', affinity:'Mê Hồn', loot:[{itemId:'meVuHon',chance:0.16}],
    lore:'Hồn ma tan trong sương mù tịch mịch, hiện hình chớp nhoáng rồi lại tan biến.', atkFl:'lướt qua rút hồn', skill:{name:'Đoạt Phách Vụ',mult:2.0,cd:5,fl:'sương mù hoá tay quỷ bóp nghẹt hồn phách'} }),
  giaoNhan: mk(92, 'thuong', { id:'giaoNhan', name:'Giao Nhân', gloss:'Merfolk', icon:'🧜', affinity:'Giao Tộc', loot:[{itemId:'giaoChau',chance:0.18}],
    lore:'Người cá cổ xưa giữ kho báu đáy biển, giọng hát mê hoặc, tay phóng thuỷ tiễn.', atkFl:'phóng thuỷ tiễn', skill:{name:'Cuồng Đào Kích',mult:1.9,cd:5,fl:'gọi sóng dữ chồm lên cuốn phăng tất cả'} }),

  // ===== Thiên Thành (Lv100) — Thần Vực — toà thành tối thượng =====
  thuVeThanTuong: mk(100, 'trau', { id:'thuVeThanTuong', name:'Thủ Vệ Thần Tướng', gloss:'Divine Guardian', icon:'⚔️', affinity:'Thần Tướng', loot:[{itemId:'thanThietTinh',chance:0.16}],
    lore:'Thần tướng trấn giữ thiên thành, giáp vàng chói lọi, một thương đâm thủng vạn quân.', atkFl:'đâm một thương', skill:{name:'Thiên Quân Nhất Kích',mult:2.2,cd:5,fl:'dồn thần lực vào một thương xuyên thấu'} }),
  coMa: mk(100, 'nhanh', { id:'coMa', name:'Cổ Ma', gloss:'Ancient Demon', icon:'👹', affinity:'Ma Vật', loot:[{itemId:'coMaHaiCot',chance:0.12}],
    lore:'Ma vật thượng cổ bị phong ấn dưới thành, nay tỉnh giấc khát máu sinh linh.', atkFl:'vung ma trảo', skill:{name:'Huyết Ma Trảo',mult:2.3,cd:5,fl:'ma trảo nhuốm huyết xé toạc phòng tuyến'} }),
  thienBinh: mk(100, 'thuong', { id:'thienBinh', name:'Thiên Binh', gloss:'Heavenly Soldier', icon:'🪖', affinity:'Thiên Quân', loot:[{itemId:'thanThietTinh',chance:0.12}],
    lore:'Binh tốt nhà trời canh gác cổng thành, kỷ luật nghiêm minh, đánh theo trận pháp.', atkFl:'chém một đao', skill:{name:'Trận Pháp Hợp Kích',mult:2.0,cd:4,fl:'đồng loạt xuất thủ theo thiên trận'} }),
  coMaTo: mk(100, 'boss', { id:'coMaTo', name:'Cổ Ma Tổ', gloss:'Demon Ancestor', icon:'😈', isBoss:true, affinity:'Trùm Ma Đạo', loot:[{itemId:'maToTam',chance:0.02},{itemId:'coMaHaiCot',chance:0.5}],
    lore:'Thuỷ tổ của ma đạo, sức mạnh nghiêng trời lệch đất — đích đến tối hậu của mọi cao thủ giang hồ.', atkFl:'giáng ma uy', skill:{name:'Diệt Thế Ma Viêm',mult:3.0,cd:6,fl:'ma viêm huỷ diệt thiêu rụi tất thảy'} }),
};

// Bộ pháp -> Tứ Trụ nhận EXP (Phase 1). Sau thêm ảnh hưởng sát thương.
export const STANCES = [
  { id: 'quanHanh',  name: 'Cân Bằng', gloss: 'Balanced',  stat: 'lucDao' },
  { id: 'cuongCong', name: 'Cuồng Công', gloss: 'Offensive', stat: 'lucDao' },
  { id: 'kienThu',   name: 'Kiên Thủ',  gloss: 'Defensive', stat: 'hoThe' },
  { id: 'tanToc',    name: 'Tấn Tốc',   gloss: 'Agile',     stat: 'thanPhap' },
  { id: 'linhXaoBP', name: 'Linh Xảo',  gloss: 'Dexterous', stat: 'linhXao' },
];

export function stanceStat(id) {
  const s = STANCES.find((x) => x.id === id);
  return s ? s.stat : 'lucDao';
}

// ============================================================
// YÊU VƯƠNG (World Boss) — 5 con, HỒI CHIÊU theo boss, ngũ hành NGẪU NHIÊN mỗi hồi sinh
// (KHÔNG đặt `he` → rollHe ngẫu nhiên; engine worldboss.js roll + lưu hệ mỗi lần hồi sinh).
// KHÔNG rơi trang bị. Drop: Tinh Thể Yêu Vương (mở cường +10↑) + Hồn Thạch(ít) + Trứng Pet + EXP + Bạc.
// wb = { cdHours (hồi chiêu), tinhThe (đảm bảo), honThach, bac, eggBase, eggs:[{itemId,chance}] }.
// ============================================================
function eggDrops(base) {
  return [
    { itemId: 'egg_' + base + '_pham', chance: 0.05 },    // Phàm 5%
    { itemId: 'egg_' + base + '_linh', chance: 0.01 },    // Linh 1%
    { itemId: 'egg_' + base + '_than', chance: 0.0002 },  // Thần = Linh / 50 = 0.02%
  ];
}
export const YEU_VUONG = [
  Object.assign(mk(10, 'boss', { id: 'yvBachHo', name: 'Bạch Ngạch Hổ Vương', gloss: 'White-Browed Tiger King', icon: '🐯', isBoss: true, affinity: 'Yêu Vương · Bạch Hổ',
    lore: 'Mãnh hổ trắng ngự sơn lâm, trán in chữ Vương, một tiếng gầm vang khiến trăm thú phục rạp dưới chân.', atkFl: 'vồ tới cắn xé',
    skill: { name: 'Bạch Hổ Lăng Không', mult: 2.2, cd: 5, fl: 'tung mình lăng không, móng vuốt trắng loá xé gió bổ xuống' } }),
    { wb: { cdHours: 2,  tinhThe: 1, honThach: 20,  bac: 300,   eggBase: 'bachHo',     eggs: eggDrops('bachHo') } }),
  Object.assign(mk(20, 'boss', { id: 'yvHuyenQuy', name: 'Hắc Giáp Huyền Quy', gloss: 'Black-Shell Dark Tortoise', icon: '🐢', isBoss: true, affinity: 'Yêu Vương · Huyền Quy',
    lore: 'Linh quy nghìn năm mai đen như sắt nguội, ẩn mình đáy đầm sâu; một khi trồi lên, sóng dữ ngập trời cuốn phăng thuyền bè.', atkFl: 'húc mai giáp',
    skill: { name: 'Huyền Vũ Trấn Ba', mult: 2.3, cd: 6, fl: 'thu mình trong mai đen rồi bùng nổ chấn ba, nước cuộn đá bay' } }),
    { wb: { cdHours: 3,  tinhThe: 1, honThach: 35,  bac: 600,   eggBase: 'huyenQuy',   eggs: eggDrops('huyenQuy') } }),
  Object.assign(mk(30, 'boss', { id: 'yvHuyetLang', name: 'Huyết Lang Vương', gloss: 'Blood Wolf King', icon: '🐺', isBoss: true, affinity: 'Yêu Vương · Huyết Lang',
    lore: 'Sói chúa khát máu trăm năm, lông đỏ như nhuộm máu, một tiếng tru làm muông thú quỳ rạp.', atkFl: 'lao tới cắn xé',
    skill: { name: 'Huyết Nguyệt Trảo', mult: 2.5, cd: 5, fl: 'vung trảo huyết quang xé toạc màn đêm' } }),
    { wb: { cdHours: 4,  tinhThe: 1, honThach: 60,  bac: 1200,  eggBase: 'huyetLang',  eggs: eggDrops('huyetLang') } }),
  Object.assign(mk(40, 'boss', { id: 'yvCuHung', name: 'Hồng Hoang Cự Hùng', gloss: 'Primordial Giant Bear', icon: '🐻', isBoss: true, affinity: 'Yêu Vương · Cự Hùng',
    lore: 'Gấu khổng lồ sót lại từ thuở hồng hoang, thân cao tựa núi, một chưởng tát xuống đất nứt đá tan, thú rừng nghe tiếng gầm liền cụp đuôi.', atkFl: 'vung chưởng quật',
    skill: { name: 'Hồng Hoang Liệt Phách', mult: 2.6, cd: 6, fl: 'gầm vang trời rồi giáng song chưởng cuồng bạo nghiền nát tất thảy' } }),
    { wb: { cdHours: 5,  tinhThe: 1, honThach: 90,  bac: 2000,  eggBase: 'cuHung',     eggs: eggDrops('cuHung') } }),
  Object.assign(mk(50, 'boss', { id: 'yvDocGiao', name: 'Độc Giao Vương', gloss: 'Venom Serpent King', icon: '🐍', isBoss: true, affinity: 'Yêu Vương · Độc Giao',
    lore: 'Giao long ngậm độc nghìn năm, mỗi hơi thở là một làn chướng khí làm cỏ cây héo rũ.', atkFl: 'phun độc vụ',
    skill: { name: 'Vạn Độc Triền Thân', mult: 2.7, cd: 6, fl: 'phun độc vụ xanh lè bủa vây tứ phía' } }),
    { wb: { cdHours: 6,  tinhThe: 1, honThach: 120, bac: 3000,  eggBase: 'docGiao',    eggs: eggDrops('docGiao') } }),
  Object.assign(mk(60, 'boss', { id: 'yvLoiBang', name: 'Cửu Tiêu Lôi Bằng', gloss: 'Ninth-Heaven Thunder Roc', icon: '🦅', isBoss: true, affinity: 'Yêu Vương · Lôi Bằng',
    lore: 'Đại bằng ngự chín tầng mây, đôi cánh giương ra che kín nhật nguyệt, vỗ một cái là sấm sét đầy trời, bóng lướt qua khiến vạn vật rúng động.', atkFl: 'bổ nhào tạt cánh',
    skill: { name: 'Cửu Tiêu Lôi Dực', mult: 2.8, cd: 6, fl: 'từ tầng mây bổ nhào, sải cánh kéo theo lôi đình giáng sấm rền' } }),
    { wb: { cdHours: 7,  tinhThe: 2, honThach: 170, bac: 4500,  eggBase: 'loiBang',    eggs: eggDrops('loiBang') } }),
  Object.assign(mk(70, 'boss', { id: 'yvHoaLan', name: 'Hỏa Lân Yêu Vương', gloss: 'Flame Qilin King', icon: '🦁', isBoss: true, affinity: 'Yêu Vương · Hỏa Lân',
    lore: 'Kỳ lân lửa giáng thế, vảy đỏ rực như than hồng, vó giẫm tới đâu đất nứt phun nham tới đó.', atkFl: 'phun cuồng diễm',
    skill: { name: 'Phần Thiên Lân Hỏa', mult: 2.9, cd: 6, fl: 'cuồng diễm hoá biển lửa thiêu rụi tám phương' } }),
    { wb: { cdHours: 8,  tinhThe: 2, honThach: 220, bac: 6000,  eggBase: 'hoaLan',     eggs: eggDrops('hoaLan') } }),
  Object.assign(mk(80, 'boss', { id: 'yvHoYeu', name: 'Mị Ảnh Hồ Yêu', gloss: 'Charm-Shadow Fox Demon', icon: '🦊', isBoss: true, affinity: 'Yêu Vương · Hồ Yêu',
    lore: 'Hồ ly chín đuôi tu luyện ngàn năm hoá hình mị nữ, hồ quang lập loè mê hoặc lòng người, một ánh nhìn đủ đoạt hồn kẻ phàm.', atkFl: 'phất đuôi mê hoặc',
    skill: { name: 'Cửu Vĩ Mị Hoặc', mult: 3.0, cd: 6, fl: 'chín đuôi xòe rộng toả hồ quang yêu mị, nhiếp hồn đoạt phách' } }),
    { wb: { cdHours: 9,  tinhThe: 2, honThach: 280, bac: 7500,  eggBase: 'hoYeu',      eggs: eggDrops('hoYeu') } }),
  Object.assign(mk(90, 'boss', { id: 'yvBangPhuong', name: 'Băng Phách Yêu Hậu', gloss: 'Frost Phoenix Empress', icon: '🦅', isBoss: true, affinity: 'Yêu Vương · Băng Phượng',
    lore: 'Phượng hoàng băng phách ngự đỉnh tuyết vạn năm, cánh phất một cái là cả trời đất đóng băng.', atkFl: 'quạt cánh băng',
    skill: { name: 'Cửu Thiên Hàn Vũ', mult: 3.0, cd: 6, slow: true, fl: 'rải vũ băng phủ trắng chiến trường, vạn vật ngưng đọng' } }),
    { wb: { cdHours: 10, tinhThe: 2, honThach: 360, bac: 9000,  eggBase: 'bangPhuong', eggs: eggDrops('bangPhuong') } }),
  Object.assign(mk(100, 'boss', { id: 'yvThienMa', name: 'Thiên Ma Yêu Đế', gloss: 'Heaven Demon Emperor', icon: '😈', isBoss: true, affinity: 'Yêu Vương · Thiên Ma',
    lore: 'Yêu đế thống lĩnh vạn yêu, ma khí ngút trời che lấp nhật nguyệt — kẻ thù tối hậu của giang hồ.', atkFl: 'giáng ma uy',
    skill: { name: 'Thiên Ma Diệt Thế', mult: 3.2, cd: 6, fl: 'ma viêm huỷ thiên diệt địa nuốt trọn tất thảy' } }),
    { wb: { cdHours: 12, tinhThe: 3, honThach: 600, bac: 15000, eggBase: 'thienMa',    eggs: eggDrops('thienMa') } }),
];
export const YEU_VUONG_BY_ID = Object.fromEntries(YEU_VUONG.map((b) => [b.id, b]));
