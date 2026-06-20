// ============================================================
// VÕ HỌC — "Tuyệt Học Phổ" (combat auto-battler). Nền NGŨ HÀNH đầy đủ.
// Gồm: Ngũ Hành (khắc/kháng) · Tâm Pháp (5 hệ, ĐỔI được) · Bộ Pháp · Chiêu Thức (đa hệ) · Bị Động
//      + engine mô phỏng + dự báo + log.
// THUẦN (không Alpine). deriveCombat dùng derivedStats (Tứ Trụ + trang bị).
// ============================================================
import { derivedStats, gearEle } from '../engine/stats.js';
import { levelFromXp } from '../engine/leveling.js';
import { titleBonus } from '../engine/titles.js';

// ---- NGŨ HÀNH ----
// 5 hệ + Vật Lý + Trợ. Vòng tương khắc: Kim→Mộc→Thổ→Thủy→Hỏa→Kim.
// Đánh đối tượng mình khắc: +30% · bị khắc: −20% · còn lại 100%. (chỉ ảnh hưởng sát thương)
export const NGU_HANH = {
  kim:   { id:'kim',   name:'Kim', han:'金', text:'text-yellow-200',  badge:'bg-yellow-900/50 text-yellow-200',   dot:'bg-yellow-300', ig:'kim',   grad:'from-yellow-800/60 to-yellow-950/30',   ring:'border-yellow-500/40', glowRgb:'234,179,8' },
  moc:   { id:'moc',   name:'Mộc', han:'木', text:'text-emerald-300', badge:'bg-emerald-900/50 text-emerald-300', dot:'bg-emerald-400',ig:'moc',   grad:'from-emerald-800/60 to-emerald-950/30', ring:'border-emerald-500/40', glowRgb:'16,185,129' },
  thuy:  { id:'thuy',  name:'Thủy',han:'水', text:'text-sky-300',     badge:'bg-sky-900/50 text-sky-300',         dot:'bg-sky-400',    ig:'thuy',  grad:'from-sky-800/60 to-sky-950/30',         ring:'border-sky-500/40', glowRgb:'14,165,233' },
  hoa:   { id:'hoa',   name:'Hỏa', han:'火', text:'text-orange-300',  badge:'bg-orange-900/50 text-orange-300',   dot:'bg-orange-400', ig:'flame', grad:'from-orange-800/60 to-orange-950/30',   ring:'border-orange-500/40', glowRgb:'249,115,22' },
  tho:   { id:'tho',   name:'Thổ', han:'土', text:'text-amber-500',   badge:'bg-amber-900/40 text-amber-400',     dot:'bg-amber-600',  ig:'tho',   grad:'from-amber-800/60 to-amber-950/30',     ring:'border-amber-500/40', glowRgb:'217,119,6' },
  vatly: { id:'vatly', name:'Vật Lý',han:'',  text:'text-slate-200',  badge:'bg-slate-700 text-slate-200',        dot:'bg-slate-400',  ig:'sword', grad:'from-slate-600/60 to-slate-900/30',     ring:'border-slate-400/40', glowRgb:'148,163,184' },
  buff:  { id:'buff',  name:'Trợ',  han:'',  text:'text-violet-300',  badge:'bg-violet-900/50 text-violet-300',   dot:'bg-violet-400', ig:'zap',   grad:'from-violet-800/60 to-violet-950/30',   ring:'border-violet-500/40', glowRgb:'139,92,246' },
};
const KHAC = { kim:'moc', moc:'tho', tho:'thuy', thuy:'hoa', hoa:'kim' }; // A khắc KHAC[A]
// Hệ số khắc/kháng của đòn hệ `atkHe` đánh vào địch hệ `defHe`.
export function nguHanhMod(atkHe, defHe){
  if(!atkHe || !defHe || atkHe==='vatly' || atkHe==='buff') return 0;
  if(KHAC[atkHe]===defHe) return 0.30;   // mình khắc địch
  if(KHAC[defHe]===atkHe) return -0.20;  // địch khắc mình
  return 0;
}
export function heInfo(he){ return NGU_HANH[he] || NGU_HANH.vatly; }
export function heName(he){ return (NGU_HANH[he]||{}).name || he; }
// 5 hệ ngũ hành thật (yêu thú roll ngẫu nhiên trong này mỗi trận).
export const NGU_HANH_LIST = ['kim','moc','thuy','hoa','tho'];
// Hệ của yêu thú TRONG 1 TRẬN: nếu enemy.he đặt sẵn (boss) -> cố định; không -> ngẫu nhiên.
export function rollHe(enemy){
  if(enemy && enemy.he && NGU_HANH_LIST.includes(enemy.he)) return enemy.he;
  return NGU_HANH_LIST[Math.floor(Math.random()*NGU_HANH_LIST.length)];
}

// ---- Môn Phái = HỌC QUÁN MỞ (mỗi hệ 1 phái dạy võ học hệ đó). Dùng gom mục ở Tàng Kinh Các.
//   he -> phái dạy chiêu/Tâm Pháp/Bị Động cùng hệ. (vatly/buff = võ quán/phù lục, không thuộc ngũ hành.)
export const MON_PHAI = {
  hoa:   { id:'hoa',   name:'Viêm Dương Tông',  han:'火', icon:'flame', desc:'Lấy hỏa luyện thân, công pháp bạo liệt — càng đánh càng hăng.' },
  thuy:  { id:'thuy',  name:'Hàn Băng Cung',    han:'水', icon:'thuy',  desc:'Lấy nhu khắc cương, hàn khí trầm ổn — thiên khống chế & bền bỉ.' },
  moc:   { id:'moc',   name:'Thanh Mộc Môn',    han:'木', icon:'moc',   desc:'Mô phỏng lẽ sinh trưởng vạn vật — độc khí âm ỉ, tự sinh tự dưỡng.' },
  kim:   { id:'kim',   name:'Cương Kim Đường',  han:'金', icon:'kim',   desc:'Chân khí ngưng như kim loại, mũi nhọn vô song — phá giáp, nhất kích tất sát.' },
  tho:   { id:'tho',   name:'Hậu Thổ Trang',    han:'土', icon:'tho',   desc:'Lấy đất dày trấn vạn vật, vững như non cao — thiên thủ & trấn áp.' },
  vatly: { id:'vatly', name:'Bách Chiến Đường', han:'',  icon:'sword', desc:'Võ quán luyện thể thuần lực, đòn thế không dính khắc/kháng ngũ hành.' },
  buff:  { id:'buff',  name:'Phù Lục Các',      han:'',  icon:'zap',   desc:'Luyện linh phù trợ chiến, tăng công lực trong khoảnh khắc quyết định.' },
};
export function monPhaiOf(he){ return MON_PHAI[he] || MON_PHAI.vatly; }

// ---- Tâm Pháp (nội công nền, 5 hệ — ĐỔI được). Mỗi cái 1 archetype + thiên 1 hệ.
//   he/heBonus = +% sát thương cho chiêu CÙNG hệ. noiLuc = +Nội Lực nền. nlRegen = hồi NL/đánh thường.
//   mod = hệ số chỉ số (như Bộ Pháp, cộng dồn): dmg/def/hp/spd/crit/critDmg/nl/nlRegen/regen.
export const TAM_PHAP_POOL = [
  { id:'viemDuong', name:'Viêm Dương Quyết', he:'hoa', heBonus:0.20, noiLuc:30, nlRegen:12,
    mod:{ dmg:0.08 },
    desc:'+20% ST Hỏa · +30 Nội Lực · đánh thường hồi 12 NL · +8% Công',
    short:'Bạo liệt, càng đánh càng hăng — thiên công.',
    lore:'Nội công chân khí hoá lửa, lấy công làm thủ, khí thế áp đảo càng đánh càng mạnh.' },
  { id:'huyenBang', name:'Huyền Băng Chân Kinh', he:'thuy', heBonus:0.20, noiLuc:55, nlRegen:14,
    mod:{ def:0.14, hp:0.12, dmg:-0.06 },
    desc:'+20% ST Thủy · +55 Nội Lực · +14% Thủ · +12% Sinh Lực',
    short:'Trầm tĩnh như nước sâu, nội lực dồi dào — thiên khống chế & bền.',
    lore:'Lấy nhu khắc cương, chân khí hàn lương trầm ổn, nội tức bất tận đủ tung khống chế liên hồi.' },
  { id:'thanhMoc', name:'Thanh Mộc Trường Sinh Công', he:'moc', heBonus:0.20, noiLuc:30, nlRegen:11,
    mod:{ regen:0.02, hp:0.08 },
    desc:'+20% ST Mộc · hồi 2% Sinh Lực/hiệp · +8% Sinh Lực',
    short:'Sinh cơ bất tuyệt — độc & hồi máu song hành, trụ rất bền.',
    lore:'Mô phỏng lẽ sinh trưởng của thảo mộc, tự sinh tự dưỡng, độc khí ngấm ngầm hao mòn địch nhân.' },
  { id:'cuongKim', name:'Cương Kim Quyết', he:'kim', heBonus:0.20, noiLuc:20, nlRegen:10,
    mod:{ crit:0.10, critDmg:0.30, dmg:0.05, def:-0.05 },
    desc:'+20% ST Kim · +10% Bạo kích · +30% ST bạo kích · +5% Công',
    short:'Kim đao sắc bén, nhất kích phá giáp — thiên bạo kích & xuyên giáp.',
    lore:'Chân khí ngưng như kim loại, mũi nhọn vô song, một đòn điểm trúng tựa thần binh khai phong.' },
  { id:'hauTho', name:'Hậu Thổ Trấn Nhạc Công', he:'tho', heBonus:0.20, noiLuc:25, nlRegen:12,
    mod:{ def:0.22, hp:0.18, spd:-0.10, dmg:-0.05 },
    desc:'+20% ST Thổ · +22% Thủ · +18% Sinh Lực · −10% Tốc',
    short:'Vững như non cao, trấn áp quần địch — thiên thủ & choáng.',
    lore:'Lấy đất dày trấn vạn vật, thân pháp tuy chậm mà ổn như bàn thạch, trầm trọng nhất kích áp đảo.' },
];
export function tamPhapById(id){ return TAM_PHAP_POOL.find(t=>t.id===id) || TAM_PHAP_POOL[0]; }
export const TAM_PHAP = TAM_PHAP_POOL[0]; // tương thích bản cũ

// ---- Bộ Pháp (6 lối đánh; chọn 1-2 để phối build). mod = hệ số CỘNG DỒN.
// Pct (dmg/def/spd/hp/nl/nlRegen) = nhân thêm %, add (crit/critDmg/regen/dodge) = cộng thẳng.
// MỖI bộ đều có đánh đổi: pros = lợi (jade), cons = thiệt (đỏ).
export const BO_PHAP = [
  { id:'quanHanh',  name:'Quân Hành Bộ', gloss:'Cân Bằng', stat:'lucDao', icon:'⚖️', ig:'scales',
    mod:{ dmg:0.10, def:0.10, spd:0.10, crit:-0.15 },
    pros:['+10% Công','+10% Thủ','+10% Tốc'], cons:['−15% Bạo kích'],
    desc:'Tứ bình bát ổn, công thủ toàn diện. Mạnh đều mọi mặt nhưng thiếu sát chiêu hiểm — gần như không bạo kích.' },
  { id:'cuongCong', name:'Cuồng Công Bộ', gloss:'Bạo Công', stat:'lucDao', icon:'🔥', ig:'flame',
    mod:{ dmg:0.28, crit:0.08, def:-0.20 },
    pros:['+28% Công','+8% Bạo kích'], cons:['−20% Phòng thủ'],
    desc:'Lao thẳng tấn sát, bất chấp phòng bị. Hạ quái cực nhanh song thân mong manh — nên phối hút máu hoặc né để bù.' },
  { id:'kienThu',   name:'Kiên Thủ Bộ', gloss:'Phòng Thủ', stat:'hoThe', icon:'🛡️', ig:'shield',
    mod:{ def:0.35, hp:0.18, regen:0.015, dmg:-0.15, spd:-0.10 },
    pros:['+35% Thủ','+18% Sinh Lực','hồi 1.5%/hiệp'], cons:['−15% Công','−10% Tốc'],
    desc:'Vững như bàn thạch, ôm đòn trường kỳ không gục. Hiếm khi Trọng Thương nhưng hạ quái rất chậm — hợp cày qua đêm an toàn.' },
  { id:'tanToc',    name:'Tấn Tốc Bộ', gloss:'Tốc Độ & Né', stat:'thanPhap', icon:'💨', ig:'wind',
    mod:{ spd:0.28, dodge:0.14, dmg:-0.10, def:-0.10 },
    pros:['+28% Tốc','14% Né đòn'], cons:['−10% Công','−10% Thủ'],
    desc:'Thân ảnh như chớp, lấy né tránh thay giáp trụ. Ra đòn dồn dập nhưng phòng bị mỏng — dính đòn là thấm.' },
  { id:'linhXaoBP', name:'Linh Xảo Bộ', gloss:'Bạo Kích', stat:'linhXao', icon:'🎯', ig:'target',
    mod:{ crit:0.15, critDmg:0.45, dmg:-0.15 },
    pros:['+15% Bạo kích','+45% ST bạo kích'], cons:['−15% Công thường'],
    desc:'Dồn cả vào nhất kích trí mạng. Khi bạo kích thì kinh người, đòn thường lại nhẹ — sát thương phập phù may rủi.' },
  { id:'thonKhi',   name:'Thôn Khí Bộ', gloss:'Nội Lực', stat:'linhXao', icon:'☯️', ig:'zap',
    mod:{ nl:0.45, nlRegen:0.70, dmg:0.05, hp:-0.12, def:-0.08 },
    pros:['+45% Nội Lực','+70% hồi Nội Lực','+5% Công'], cons:['−12% Sinh Lực','−8% Thủ'],
    desc:'Dồn chân khí vào đan điền, tung tuyệt kỹ liên hồi không cạn. Đổi lại lơ là luyện thể — máu mỏng, thủ yếu.' },
  { id:'baDao',     name:'Bá Đao Bộ', gloss:'Cực Công', stat:'lucDao', icon:'⚔️', ig:'sword',
    mod:{ dmg:0.38, crit:-0.12, def:-0.28 },
    pros:['+38% Công'], cons:['−12% Bạo kích','−28% Phòng thủ'],
    desc:'Lấy công át tất, một đao định sinh tử. Sát thương kinh người song thân tựa giấy — phải kết liễu thật nhanh hoặc phối hút máu/né để gánh.' },
  { id:'quyAnh',    name:'Quỷ Ảnh Bộ', gloss:'Né Tuyệt Đối', stat:'thanPhap', icon:'👻', ig:'wind',
    mod:{ dodge:0.22, spd:0.15, hp:-0.15, dmg:-0.06 },
    pros:['+22% Né đòn','+15% Tốc'], cons:['−15% Sinh Lực','−6% Công'],
    desc:'Thân ảnh quỷ mị, đến đi vô tung. Né cực cao gần như miễn đòn, nhưng dính một kích là thấm — đặt cược cả vào tốc & né.' },
];
export function boPhapById(id){ return BO_PHAP.find(b=>b.id===id) || BO_PHAP[0]; }
// Chuẩn hoá loadout.boPhap -> mảng 1-2 id hợp lệ (tương thích bản cũ lưu chuỗi).
export function normBoPhap(loadout){
  let v = loadout && loadout.boPhap;
  if (typeof v === 'string') v = [v];
  if (!Array.isArray(v) || !v.length) v = ['quanHanh'];
  const ids = v.filter(id=>BO_PHAP.some(b=>b.id===id)).slice(0,2);
  return ids.length ? ids : ['quanHanh'];
}
export function boPhapStats(loadout){ return [...new Set(normBoPhap(loadout).map(id=>boPhapById(id).stat))]; }

// ---- Số ô KĨ NĂNG mở theo Chiến Đấu Lv: 4 ô (gồm Tâm Pháp) từ đầu, +1 mỗi 30 cấp.
//   => số ô chiêu chủ động = tổng ô − 1 (Tâm Pháp).
export function maxComboSlots(combatLevel){ return 4 + Math.floor((combatLevel||0)/30); }
export function maxChieuSlots(combatLevel){ return maxComboSlots(combatLevel) - 1; }
export function nextSlotLevel(combatLevel){ return (Math.floor((combatLevel||0)/30)+1)*30; }

// 1 VÒNG giao chiến = 8s → cadence trao thưởng THẬT (1 con / vòng). Foreground + background + widget + dự tính đều bám mốc này.
export const COMBAT_CYCLE_MS = 8000;

// ---- Chiêu Thức — POOL ĐA HỆ (lắp tự do). type = hệ (ngũ hành/vatly/buff).
//   tier sơ/trung (Bước 6 sẽ gắn nguồn). Hiệu ứng: burn(DoT) · lifesteal · stun · slow(làm chậm địch) · heal(hồi%) · pen(xuyên giáp%) · critBonus · buff.
export const CHIEU = [
  // ===== HỎA — bạo phát & Bỏng =====
  { id:'lhd', name:'Liệt Hỏa Đao', type:'hoa', tier:'sơ', mult:1.6, nl:18, cd:0, short:'Hỏa chủ lực',
    lore:'Đao chưa tới mà nhiệt khí đã táp rát mặt người. Một đao bổ xuống, đao quang cuộn lửa xé toạc hư không — chiêu nhập môn của Viêm Dương nhất mạch, mộc mạc mà hung hiểm.',
    flavor:['đao quang rực lửa quét ngang','hỏa diễm cuộn theo lưỡi đao','một đạo lửa xé gió lao tới','đao thế hung mãnh như hổ vồ'],
    synergy:'Rẻ, không hồi chiêu — đòn nền để dưỡng Nội Lực, chờ thời tung sát chiêu.' },
  { id:'hlt', name:'Hỏa Long Thức', type:'hoa', tier:'trung', mult:3.2, nl:45, cd:6, short:'Hỏa bùng nổ',
    lore:'Vận chân hỏa quán đỉnh, chân khí ngưng thành một con cự long. Hỏa long gầm vang vọng động sơn cốc, lao xuống cuốn địch nhân vào biển lửa không lối thoát thân.',
    flavor:['hỏa long gầm thét lao tới','lửa cuộn thành rồng nuốt chửng địch'],
    synergy:'Sát chiêu kết liễu. Dán Liệt Diễm Phù trước rồi tung — uy lực bùng lên gấp bội.' },
  { id:'ptd', name:'Phần Thiên Diễm', type:'hoa', tier:'sơ', mult:0.8, nl:25, cd:4, burn:{dmg:18,ticks:5}, short:'Hỏa + Bỏng 5 hiệp',
    lore:'Phất tay một cái, ngàn đốm tàn diễm tản thành biển lửa trùm xuống. Da thịt địch cháy sém, độc nhiệt ngấm tới tận xương tuỷ — càng giãy giụa càng thêm rát buốt.',
    flavor:['biển lửa lan khắp thân địch','tàn diễm bám riết lấy kẻ thù'],
    synergy:'Gieo Bỏng âm ỉ — khắc tinh của loài da dày lắm máu, bào mòn từng chút tới gục.' },
  { id:'htd', name:'Hấp Tinh Diễm', type:'hoa', tier:'trung', mult:1.3, nl:22, cd:3, lifesteal:0.6, short:'Hỏa + hút 60% máu',
    lore:'Ngọn lửa này không chỉ thiêu, mà còn biết nuốt. Tinh huyết địch bị hỏa khí rút cạn, hoá thành sinh lực tiếp dưỡng cho chính mình — lấy địch dưỡng ta, càng đánh càng sung.',
    flavor:['ngọn lửa nuốt lấy tinh huyết địch','sinh khí địch tan vào biển lửa'],
    synergy:'Cột sống của lối đánh trụ máu — ôm cường địch trường kỳ mà chẳng gục.' },

  // ===== THỦY — khống chế (làm chậm) & hồi =====
  { id:'hbc', name:'Hàn Băng Chưởng', type:'thuy', tier:'sơ', mult:1.5, nl:18, cd:2, slow:3, short:'Thủy + Làm chậm',
    lore:'Chưởng phong chưa chạm tới đã thấu vào xương. Hàn khí Huyền Băng toả ra đóng băng cước bộ, ghì địch nhân chậm lại nửa nhịp giữa lằn ranh sinh tử.',
    flavor:['hàn khí toả ra ghì chặt địch','băng sương phủ lên mình kẻ thù'],
    synergy:'Gông chân địch, cắt nhịp ra đòn — chiêu nền khống chế của thuỷ mạch.' },
  { id:'bpt', name:'Băng Phách Hàn Tiễn', type:'thuy', tier:'trung', mult:2.8, nl:42, cd:6, slow:3, short:'Thủy bùng nổ + chậm',
    lore:'Ngưng thuỷ thành băng, kết băng thành tiễn. Một mũi hàn quang xé gió xuyên thấu thân địch, để lại vết thương buốt giá đóng băng cả khí huyết bên trong.',
    flavor:['băng tiễn xé gió cắm phập vào địch','một mũi hàn quang xuyên thấu thân địch'],
    synergy:'Sát chiêu Thuỷ vừa đau vừa gông — đánh mạnh mà vẫn khoá được bước địch.' },
  { id:'tll', name:'Thủy Liêm Quyết', type:'thuy', tier:'trung', mult:0.5, nl:24, cd:5, heal:0.12, short:'Thủy + hồi 12% máu',
    lore:'Vận thuỷ khí điều tức, một màn nước trong veo gột rửa thương tổn. Nhu hoà như suối nguồn nơi thâm sơn, âm thầm bồi đắp nguyên khí giữa vòng vây trùng điệp.',
    flavor:['màn nước mát chảy khắp châu thân','thủy khí nhu hoà xoa dịu vết thương'],
    synergy:'Chủ động hồi Sinh Lực — hơi thở dài cho lối đánh Thuỷ bền bỉ.' },

  // ===== MỘC — Độc (DoT) & hút sinh =====
  { id:'tmt', name:'Thanh Mộc Thứ', type:'moc', tier:'sơ', mult:1.4, nl:16, cd:0, short:'Mộc chủ lực',
    lore:'Chân khí ngưng thành gai mộc xanh biếc, đâm ra tua tủa như cả rừng kiếm mọc ngược lên trời. Chiêu nhập môn của Mộc mạch, lấy sinh cơ vạn vật làm sát cơ giết người.',
    flavor:['gai mộc xanh đâm tua tủa','kình mộc quật thẳng vào địch'],
    synergy:'Rẻ, không hồi chiêu — giữ áp lực liên miên không dứt cho lối đánh Mộc.' },
  { id:'vdp', name:'Vạn Độc Phún', type:'moc', tier:'sơ', mult:0.6, nl:24, cd:4, burn:{dmg:22,ticks:6}, short:'Mộc + Độc 6 hiệp',
    lore:'Há miệng phun ra độc vụ xanh lè, ngàn loại độc tố quyện thành sương mù tử khí. Trúng phải thì ngũ tạng rữa dần, càng về sau càng thấm — độc còn đáng sợ hơn cả đao.',
    flavor:['độc vụ xanh lè trùm lấy địch','độc tố ngấm vào phủ tạng kẻ thù'],
    synergy:'Độc bào âm ỉ mạnh và dai hơn Bỏng — rút cạn quái trâu máu tới kiệt.' },
  { id:'hhd', name:'Hấp Huyết Đằng', type:'moc', tier:'trung', mult:1.1, nl:22, cd:3, lifesteal:0.75, short:'Mộc + hút 75% máu',
    lore:'Triệu rễ độc đằng trồi lên từ lòng đất, dây leo hút huyết quấn riết lấy địch nhân. Tinh huyết theo rễ chảy ngược về, nuôi kẻ trồng độc mỗi lúc một cường tráng.',
    flavor:['dây leo hút huyết siết chặt địch','tinh huyết địch bị rút theo rễ độc'],
    synergy:'Hút máu cao nhất trong pool — trục cột trụ máu cho lối đánh Mộc.' },

  // ===== KIM — bạo kích & xuyên giáp =====
  { id:'ckt', name:'Cương Kim Chỉ', type:'kim', tier:'sơ', mult:1.7, nl:18, cd:1, short:'Kim chủ lực, sắc',
    lore:'Chân khí dồn cả về đầu ngón tay, ngưng tụ sắc bén tựa mũi thần binh khai phong. Một chỉ điểm ra, kim quang xé gió rít lên, cứng tới mức có thể đoạn sắt chém đồng.',
    flavor:['chỉ kình sắc lẹm điểm thẳng tới','một đạo kim quang xuyên gió'],
    synergy:'Đòn nền hệ Kim, sát thương trội hơn các nền khác — bù lại hao khí hơn chút.' },
  { id:'pgt', name:'Phá Giáp Trảm', type:'kim', tier:'trung', mult:2.0, nl:34, cd:5, pen:0.5, short:'Kim + xuyên 50% Thủ',
    lore:'Trảm này không chém vào giáp, mà chém đúng khe hở của giáp. Kim quang bổ thẳng qua lớp phòng bị dày nhất, khiến mọi trọng giáp đồng thau đều hoá vô dụng.',
    flavor:['nhát chém xé toạc giáp trụ','kim quang bổ thẳng qua lớp da dày'],
    synergy:'Xuyên giáp — khắc tinh của loài thủ cao mà chiêu thường khó lòng thấu da.' },
  { id:'klt', name:'Kim Quang Liệt Trảm', type:'kim', tier:'trung', mult:3.0, nl:44, cd:7, critBonus:0.15, short:'Kim bùng nổ + dễ bạo',
    lore:'Tụ toàn thân kình lực vào một trảm, kim quang loé lên chói loà cả chiến trường. Nhãn thần địch còn chưa kịp khép, lưỡi sáng đã rạch tới yết hầu tự bao giờ.',
    flavor:['kim quang chói loà bổ xuống','một trảm rạch trời quét tới'],
    synergy:'Sát chiêu thiên bạo kích — phối Cương Kim Quyết / Linh Xảo Bộ thành sát thủ nhất kích.' },

  // ===== THỔ — trấn áp (choáng) & nặng nề =====
  { id:'ltc', name:'Liệt Thổ Chùy', type:'tho', tier:'sơ', mult:1.7, nl:20, cd:3, stun:0.4, short:'Thổ + 40% Choáng',
    lore:'Giáng một chuỳ trầm trọng như cả ngọn núi đổ xuống, đất đá nứt toác, dư chấn lan tới tận chân địch. Sơn kình đè nghiến khiến kẻ thù choáng váng, đứng còn không vững.',
    flavor:['chùy kình giáng xuống rung chuyển mặt đất','một kích trầm trọng đè bẹp địch'],
    synergy:'Choáng cắt lượt địch — chiêu nền khống chế vững chãi của Thổ mạch.' },
  { id:'dsd', name:'Địa Sát Đảo', type:'tho', tier:'trung', mult:2.5, nl:40, cd:6, stun:0.6, short:'Thổ bùng nổ + 60% Choáng',
    lore:'Đảo lộn càn khôn, đất trời nghiêng ngả. Sơn kình từ lòng đất chồm lên đè sập, địch nhân như bị nguyên một ngọn núi trấn xuống đầu, khó lòng gượng dậy.',
    flavor:['sơn kình đè sập như núi lở','mặt đất chồm lên nuốt chửng địch'],
    synergy:'Sát chiêu kèm choáng nặng — vừa đau vừa khoá địch, xương sống lối đánh Thổ trấn áp.' },

  // ===== VẬT LÝ — không dính khắc/kháng ngũ hành =====
  { id:'tpc', name:'Truy Phong Cước', type:'vatly', tier:'sơ', mult:1.5, nl:15, cd:5, stun:0.5, short:'Vật lý + 50% Choáng',
    lore:'Cước ảnh trùng điệp như gió cuốn lá bay, nhanh tới mức mắt thường khó lòng dõi theo. Một cước điểm đúng đại huyệt, địch nhân lập tức tê dại, choáng váng buông tay.',
    flavor:['cước ảnh trùng điệp như gió cuốn','gót chân xé gió điểm thẳng tới'],
    synergy:'Sát thương thuần lực — chẳng sợ khắc kháng ngũ hành. Chèn một ô để gỡ thế bị kháng.' },

  // ===== TRỢ (buff) =====
  { id:'ldp', name:'Liệt Diễm Phù', type:'buff', tier:'sơ', mult:0, nl:20, cd:10, buff:{dmg:0.30,ticks:5}, short:'+30% ST trong 5s',
    lore:'Dán đạo linh phù lên thân, chân khí trong người bùng cháy như dầu gặp lửa. Trong khoảnh khắc công lực tăng vọt, mỗi chiêu tung ra đều nặng thêm mấy phần sát ý.',
    flavor:['linh phù cháy rực, chân khí bùng dâng','khí huyết trong người sôi trào'],
    synergy:'Mở thế liên hoàn: bật trước rồi tung sát chiêu — Hỏa Long, Băng Phách, Địa Sát đều nhân uy.' },

  // ===== CAO — tuyệt học trấn phái (mua bằng Kim Nguyên Bảo) =====
  { id:'ptcd', name:'Phần Thiên Cửu Diễm', type:'hoa', tier:'cao', mult:3.6, nl:58, cd:8, burn:{dmg:42,ticks:6}, cost:{nguyenBao:70}, short:'Hỏa đại bạo + Bỏng cực mạnh',
    lore:'Vận tới chín tầng chân hỏa, ngọn lửa hoá cửu sắc liếm tới tận trời xanh. Một chiêu phóng ra, cả phương viên mấy trượng đều chìm trong biển diễm, da thịt địch nhân cháy rụi tới tận cốt tuỷ, dư hoả còn âm ỉ thiêu mãi không tắt.',
    flavor:['cửu sắc thần diễm ngút trời trùm xuống','biển lửa chín tầng nuốt trọn địch nhân'],
    synergy:'Tuyệt học Viêm Dương — sát chiêu nặng đô kèm Bỏng dài. Bật Liệt Diễm Phù rồi tung, một chiêu định sinh tử.' },
  { id:'hbpt', name:'Huyền Băng Phong Thiên', type:'thuy', tier:'cao', mult:3.4, nl:56, cd:8, slow:4, stun:0.35, cost:{nguyenBao:70}, short:'Thủy đại bạo + đóng băng',
    lore:'Hàn khí Huyền Băng đạt tới cực hạn, trong nháy mắt phong toả cả đất trời thành băng vực. Địch nhân bị giá khí đóng cứng kinh mạch, thân pháp đình trệ, có khi trúng ngay yếu huyệt mà cứng đờ tại chỗ không nhúc nhích nổi.',
    flavor:['hàn vực phong thiên đóng băng vạn vật','băng phong quét tới, địch cứng đờ tại chỗ'],
    synergy:'Tuyệt học Huyền Băng — vừa bạo vừa gông nặng, có cơ đóng băng đứng hình. Khắc tinh của loài tốc độ cao.' },
  { id:'tdmd', name:'Thiên Độc Mãng Đằng', type:'moc', tier:'cao', mult:2.4, nl:50, cd:7, burn:{dmg:48,ticks:7}, lifesteal:0.5, cost:{nguyenBao:70}, short:'Mộc + Độc kịch độc + hút máu',
    lore:'Triệu vạn rễ độc mãng đằng trồi lên từ u minh, dây leo tẩm kịch độc quấn riết siết chặt địch nhân. Độc tố ngàn năm thấm vào tạng phủ rữa nát từ trong, tinh huyết theo rễ độc chảy ngược về nuôi dưỡng kẻ thi triển mỗi lúc một cường tráng.',
    flavor:['độc mãng đằng quấn siết, kịch độc thấm xương','rễ độc hút cạn tinh huyết địch nhân'],
    synergy:'Tuyệt học Thanh Mộc — Độc bào kinh người + hút máu, rút cạn cả quái trâu máu nhất mà vẫn trụ vững.' },
  { id:'kcpt', name:'Kim Cương Phá Thiên', type:'kim', tier:'cao', mult:3.8, nl:60, cd:9, pen:0.6, critBonus:0.2, cost:{nguyenBao:85}, short:'Kim cực bạo + xuyên giáp + dễ bạo',
    lore:'Dồn toàn thân kình lực vào một trảm phá thiên, kim quang ngưng tụ sắc bén tới mức xé toạc cả hư không. Trảm này bỏ qua mọi giáp trụ dày nặng, nhắm thẳng yếu huyệt mà bổ xuống — đã trúng là trí mạng, thần binh trọng giáp cũng hoá vô dụng.',
    flavor:['kim quang phá thiên xé toạc hư không','một trảm xuyên giáp bổ thẳng yết hầu'],
    synergy:'Tuyệt học Cương Kim — xuyên giáp sâu + bạo kích cực cao. Phối Cương Kim Quyết / Linh Xảo Bộ thành nhất kích tất sát.' },
  { id:'dltb', name:'Địa Liệt Thiên Băng', type:'tho', tier:'cao', mult:3.2, nl:58, cd:8, stun:0.8, cost:{nguyenBao:70}, short:'Thổ đại bạo + Choáng gần chắc',
    lore:'Giáng một kích trấn nhạc, đất trời nứt toác, cả ngọn núi như sụp đổ trùm xuống đầu địch. Sơn kình hậu trọng tới mức kẻ thù bị chấn cho hồn phách điên đảo, choáng váng ngã quỵ, đứng còn không vững nói chi phản kích.',
    flavor:['địa liệt thiên băng, núi non sụp đổ trùm xuống','một kích trấn nhạc, địch choáng váng ngã quỵ'],
    synergy:'Tuyệt học Hậu Thổ — sát thương nặng kèm Choáng gần như chắc chắn. Khoá địch liên hồi, xương sống lối trấn áp.' },
];
export function chieuById(id){ return CHIEU.find(c=>c.id===id) || null; }

// ---- Bị Động (POOL 10, mỗi ngũ hành 2: 1 "+18% ST hệ đó" + 1 đặc tính hệ đó). Chọn TỐI ĐA 2 (lắp tự do).
//   eleDmg = +% sát thương cho chiêu CÙNG hệ với bị động (p.he). mod = hệ số chỉ số (như Bộ Pháp). regen = hồi % Sinh Lực/giây.
export const BI_DONG = [
  // KIM — sắc bén, bạo kích
  { id:'cuongKimHoThe', name:'Cương Kim Hộ Thể', he:'kim', eleDmg:0.18, desc:'+18% sát thương chiêu Kim', lore:'Vận Cương Kim chân khí hộ thể, da thịt rắn lại tựa kim loại tôi qua lửa. Hệ Kim trong tay người càng thêm sắc, mỗi chiêu vung ra như thần binh vừa khai phong.' },
  { id:'loiNhanQuyet',  name:'Lợi Nhận Quyết',  he:'kim', mod:{ crit:0.10, critDmg:0.20 }, desc:'+10% Bạo kích · +20% ST bạo kích', lore:'Tâm pháp luyện cho ý niệm sắc bén như mũi nhọn, một lòng tìm tới yếu huyệt. Nhất kích tất sát — đã ra tay là nhắm chỗ hiểm, trúng thì kinh thiên động địa.' },
  // MỘC — sinh trưởng, hồi phục
  { id:'thanhMocHoThe', name:'Thanh Mộc Hộ Thể', he:'moc', eleDmg:0.18, desc:'+18% sát thương chiêu Mộc', lore:'Mượn sinh khí thảo mộc dưỡng chân nguyên, lục khí tuần hoàn trong người không dứt. Mỗi chiêu Mộc tung ra đều mang sức sống bừng bừng của vạn vật lúc xuân về.' },
  { id:'sinhSinhBatTuc',name:'Sinh Sinh Bất Tức', he:'moc', regen:0.025, desc:'hồi 2.5% Sinh Lực mỗi giây', lore:'Mô phỏng lẽ sinh trưởng của cỏ cây, thương tích vừa thành đã tự khép miệng liền da. Sinh cơ bất tuyệt, dẫu trọng thương vẫn âm thầm hồi lại nguyên khí.' },
  // THỦY — nhu nhược, nội lực
  { id:'huyenBangHoThe',name:'Huyền Băng Hộ Thể', he:'thuy', eleDmg:0.18, desc:'+18% sát thương chiêu Thủy', lore:'Hàn khí Huyền Băng bao bọc châu thân, lạnh thấu mà trầm ổn vô cùng. Chiêu Thuỷ trong tay người thêm phần âm nhu mà hàn liệt, chạm vào là buốt tới tận xương.' },
  { id:'daiChuThien',   name:'Đại Chu Thiên',   he:'thuy', mod:{ nl:0.25, nlRegen:0.40 }, desc:'+25% Nội Lực · +40% hồi Nội Lực', lore:'Khai thông đại chu thiên, chân khí lưu chuyển khắp kinh mạch như trăm sông cùng đổ về biển. Nội tức bất tận, tuyệt kỹ tung liên hồi mà khí hải chẳng hề vơi cạn.' },
  // HỎA — bạo liệt, công kích
  { id:'viemDuongHoThe',name:'Viêm Dương Hộ Thể', he:'hoa', eleDmg:0.18, desc:'+18% sát thương chiêu Hỏa', lore:'Tẩm Viêm Dương hỏa khí vào da thịt, toàn thân nóng rực như lò bát quái luyện đan. Mỗi chiêu Hỏa đều thêm phần uy mãnh, thiêu rụi tất thảy chắn ngang đường.' },
  { id:'phanThienQuyet',name:'Phần Thiên Quyết', he:'hoa', mod:{ dmg:0.18, def:-0.08 }, desc:'+18% Công · −8% Thủ', lore:'Quyết này dạy lấy công làm thủ, khí thế ngùn ngụt áp đảo cả quần địch. Lao thẳng tấn sát bất chấp phòng bị — kẻ gan nhỏ chớ dại mà học theo.' },
  // THỔ — hậu trọng, phòng ngự
  { id:'hauThoHoThe',   name:'Hậu Thổ Hộ Thể', he:'tho', eleDmg:0.18, desc:'+18% sát thương chiêu Thổ', lore:'Dẫn Hậu Thổ trọng kình trầm xuống đan điền, thân vững như non cao bám rễ vào lòng đất. Chiêu Thổ tung ra nặng tựa thiên quân, một kích trấn áp tất cả.' },
  { id:'kimCuongBatHoai',name:'Kim Cương Bất Hoại', he:'tho', mod:{ def:0.22, hp:0.14 }, desc:'+22% Thủ · +14% Sinh Lực', lore:'Khổ luyện nhục thân tới cảnh giới kim cương bất hoại, da gân rắn chắc như đá tảng. Vạn kích giáng xuống cũng khó để lại vết, đứng giữa loạn quân như một toà bàn thạch.' },
];
export function biDongById(id){ return BI_DONG.find(b=>b.id===id) || null; }
// Chuẩn hoá loadout.biDong -> mảng tối đa 2 id hợp lệ (mặc định Hỏa: +ST Hỏa + hồi máu).
export function normBiDong(loadout){
  const v = (loadout && Array.isArray(loadout.biDong)) ? loadout.biDong : null;
  if(!v) return ['viemDuongHoThe','sinhSinhBatTuc'];
  return v.filter(id=>BI_DONG.some(b=>b.id===id)).slice(0,2);
}

export const DEFAULT_LOADOUT = { tamPhap:'viemDuong', boPhap:['tanToc'], biDong:['viemDuongHoThe','sinhSinhBatTuc'], chieu:['lhd','htd','ptd'] };

// ============================================================
// NGUỒN SKILL (Bước 6) — sở hữu/giá/bậc. Mỗi võ học phải HỌC (Bạc) hoặc MUA (Nguyên Bảo) mới lắp được.
//   Sơ/Trung -> HỌC ở Môn Phái (Bạc). Cao -> MUA ở Tiệm Bí Phổ (Nguyên Bảo). (Tuyệt -> craft, để dành.)
// ============================================================
export const TIER_LABEL = { 'sơ':'Sơ', 'trung':'Trung', 'cao':'Cao', 'tuyệt':'Tuyệt' };
export const TIER_ORDER = { 'sơ':0, 'trung':1, 'cao':2, 'tuyệt':3 };
// Phẩm chất (độ hiếm) theo bậc — màu viền/chữ/badge/glow để phân biệt nhanh như độ hiếm trang bị.
export const TIER_STYLE = {
  'sơ':    { label:'Sơ Cấp',  text:'text-slate-300',   border:'border-slate-600/70',   badge:'bg-slate-700/90 text-slate-100',      ring:'',                                       glow:'' },
  'trung': { label:'Trung Cấp',text:'text-sky-300',    border:'border-sky-500/60',     badge:'bg-sky-800/90 text-sky-100',          ring:'ring-1 ring-sky-500/20',                 glow:'' },
  'cao':   { label:'Cao Cấp', text:'text-amber-300',   border:'border-amber-500/70',   badge:'bg-amber-400 text-ink font-bold',     ring:'ring-1 ring-amber-400/30',               glow:'shadow-[0_0_14px_rgba(245,158,11,0.30)]' },
  'tuyệt': { label:'Tuyệt',   text:'text-fuchsia-300', border:'border-fuchsia-500/70', badge:'bg-fuchsia-500 text-ink font-bold',   ring:'ring-1 ring-fuchsia-400/30',             glow:'shadow-[0_0_16px_rgba(217,70,239,0.34)]' },
};
export function tierStyle(t){ return TIER_STYLE[t] || TIER_STYLE['sơ']; }
// Giá mặc định theo bậc (có thể override bằng trường .cost trên từng món).
const CHIEU_TIER_COST = { 'sơ':{ bac:50000 }, 'trung':{ bac:200000 }, 'cao':{ nguyenBao:60 }, 'tuyệt':{ nguyenBao:200 } };
export function chieuCost(c){ return (c && c.cost) || (c && CHIEU_TIER_COST[c.tier]) || { bac:50000 }; }
export function tamPhapCost(t){ return (t && t.cost) || { bac:120000 }; }  // Tâm Pháp = nội công nền, học ở môn phái (Bạc)
export function biDongCost(p){ return (p && p.cost) || { bac:80000 }; }   // Bị Động (auto) học ở môn phái (Bạc)
// 'hoc' (Bạc, môn phái) vs 'mua' (Nguyên Bảo, Tiệm Bí Phổ) — suy từ loại tiền.
export function skillSource(cost){ return (cost && cost.nguyenBao) ? 'mua' : 'hoc'; }

// Bộ sở hữu khởi đầu (nhân vật mới): chỉ võ học nhập môn — phần còn lại phải đi học/mua.
export const DEFAULT_OWNED = {
  chieu:   ['lhd','htd','ptd'],                       // bộ Hỏa nhập môn (= loadout mặc định)
  tamPhap: ['viemDuong'],                             // Tâm Pháp khởi đầu
  biDong:  ['viemDuongHoThe','sinhSinhBatTuc'],       // 2 Bị Động khởi đầu
};
// Chuẩn hoá state.combat.owned: luôn sở hữu mọi thứ ĐANG lắp (chống loadout gãy) + giữ owned cũ.
//   KHÔNG ép DEFAULT_OWNED (Hỏa) — nhân vật khởi tu hệ khác sẽ không bị tặng kèm đồ Hỏa.
//   (Bộ nhập môn theo hệ do createCharacter/starterLoadoutFor quyết định khi tạo nhân vật.)
export function normOwned(combat){
  const lo = (combat && combat.loadout) || {};
  const o = (combat && combat.owned) || {};
  const uniq = (arr)=>[...new Set(arr.filter(Boolean))];
  return {
    chieu:   uniq([...(o.chieu||[]),   ...(Array.isArray(lo.chieu)?lo.chieu:[])]).filter(id=>chieuById(id)),
    tamPhap: uniq([...(o.tamPhap||[]), lo.tamPhap]).filter(id=>TAM_PHAP_POOL.some(t=>t.id===id)),
    biDong:  uniq([...(o.biDong||[]),  ...(Array.isArray(lo.biDong)?lo.biDong:[])]).filter(id=>biDongById(id)),
  };
}

// Bộ NHẬP MÔN tối giản theo Tâm Pháp khởi tu: chỉ tâm pháp + 1 chiêu SƠ CẤP + 1 bị động cùng hệ.
//   Phần còn lại (chiêu thêm, bị động 2, hệ khác, bậc cao...) phải HỌC/MUA ở Tàng Kinh Các.
export function starterLoadoutFor(tamPhapId){
  const tp = TAM_PHAP_POOL.find(t=>t.id===tamPhapId) || TAM_PHAP_POOL[0];
  const he = tp.he;
  const firstSo = CHIEU.find(c=>c.type===he && c.tier==='sơ');
  const firstBd = BI_DONG.find(p=>p.he===he);
  const chieu = firstSo ? [firstSo.id] : [];
  const biDong = firstBd ? [firstBd.id] : [];
  return { tamPhap: tp.id, he, chieu, biDong };
}

// ---- Chỉ số combat dẫn xuất (Tứ Trụ + trang bị + bài võ: Tâm Pháp + 1-2 Bộ Pháp) ----
export function deriveCombat(state, loadout, opts){
  const d = derivedStats(state);
  const tbn = titleBonus(state);                 // Danh Hiệu: +crit/spd/dodge nhẹ
  const sl = (id)=>levelFromXp(state.stats?.[id]?.xp || 0);
  // Suy yếu KHÔNG debuff chỉ số (người chơi tự hồi đầy HP rồi mới đánh tiếp) — giữ nt=1 để không phải sửa công thức dưới.
  const nt = 1;
  const tp = tamPhapById(loadout && loadout.tamPhap);
  const heChinh = tp.he, tamPhapHeBonus = tp.heBonus || 0;
  let regenPct = 0;
  // bonus % sát thương theo TỪNG hệ (từ bị động "+18% ST hệ X")
  const eleBonus = { kim:0, moc:0, thuy:0, hoa:0, tho:0 };
  // gộp hệ số chỉ số của Tâm Pháp + 1-2 Bộ Pháp + tối đa 2 Bị Động đang chọn
  const M = { dmg:0, def:0, spd:0, hp:0, crit:0, critDmg:0, nl:0, nlRegen:0, regen:0, dodge:0 };
  const addMod = (m)=>{ if(m) for(const k in M) M[k]+=(m[k]||0); };
  addMod(tp.mod);
  normBoPhap(loadout).forEach(id=>addMod(boPhapById(id).mod));
  normBiDong(loadout).forEach(id=>{ const p=biDongById(id); if(!p) return; addMod(p.mod); if(p.regen) regenPct+=p.regen; if(p.eleDmg && eleBonus[p.he]!=null) eleBonus[p.he]+=p.eleDmg; });
  // + cộng hưởng Ngũ Hành từ TRANG BỊ đang mặc (mỗi món he + eleDmg) → chảy thẳng vào ST chiêu cùng hệ
  const gEle = gearEle(state); for(const h in eleBonus) eleBonus[h] += (gEle[h] || 0);
  regenPct += M.regen;
  // Tổng bonus cho hệ của Tâm Pháp (để hiển thị "Công hưởng")
  const heBonus = tamPhapHeBonus + (eleBonus[heChinh] || 0);
  return {
    maxHP: Math.max(1, Math.round(d.sinhLuc * (1+M.hp))),
    atk: Math.max(1, Math.round(d.congKich * (1+M.dmg) * nt)),
    def: Math.max(0, Math.round(d.hoThe * (1+M.def) * nt)),
    spd: Math.max(1, Math.round((100 + sl('thanPhap')*1.5 + (d.tocDo||0)) * (1+M.spd+tbn.spdPct) * nt)),
    crit: Math.min(0.75, Math.max(0, 0.05 + sl('linhXao')*0.005 + M.crit + (d.baoKich||0)/100 + tbn.critPct)),
    critDmg: 1.6 + M.critDmg + (d.baoSat||0)/100,
    dodge: Math.min(0.5, Math.max(0, M.dodge + tbn.dodgePct)),
    heChinh, tamPhapHeBonus, eleBonus, heBonus,
    maxNL: Math.round((100 + (tp.noiLuc||0)) * (1+M.nl)), nlRegen: Math.round((tp.nlRegen||0) * (1+M.nlRegen)), regenPct,
  };
}

// ===================== ENGINE MÔ PHỎNG (THUẦN) =====================
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
const LEAD_VERB=['thi triển','vận','phát động','dồn lực thi triển'];
const HOA_PHRASES=[
  (d,c,e)=>`thiêu ${e} mất <b class="${c}">${d}</b> sinh lực`,
  (d,c,e)=>`giáng <b class="${c}">${d}</b> sát thương Hỏa lên mình ${e}`,
  (d,c,e)=>`hỏa khí cuồn cuộn nuốt lấy ${e}, hao <b class="${c}">${d}</b> sinh lực`,
  (d,c,e)=>`${e} bốc cháy phừng phừng, tổn <b class="${c}">${d}</b> sinh lực`,
];
const PHYS_PHRASES=[
  (d,c,e)=>`giáng <b class="${c}">${d}</b> sát thương lên ${e}`,
  (d,c,e)=>`đả ${e} trọng thương <b class="${c}">${d}</b> điểm`,
  (d,c,e)=>`${e} lãnh trọn <b class="${c}">${d}</b> kình lực`,
];
// Mẫu chung cho mọi hệ ngũ hành (chèn tên hệ): dùng cho Kim/Mộc/Thủy/Thổ.
const ELE_PHRASES=[
  (d,c,e,h)=>`giáng <b class="${c}">${d}</b> sát thương ${h} lên ${e}`,
  (d,c,e,h)=>`${h} kình quán vào ${e}, hao <b class="${c}">${d}</b> sinh lực`,
  (d,c,e,h)=>`${e} lãnh trọn một đạo ${h} kình, tổn <b class="${c}">${d}</b> sinh lực`,
];
function dmgPhrase(he,d,cls,eName){
  if(he==='hoa')  return pick(HOA_PHRASES)(d,cls,eName);
  if(he==='vatly')return pick(PHYS_PHRASES)(d,cls,eName);
  return pick(ELE_PHRASES)(d,cls,eName,heName(he));
}
const CRIT_CLAUSE=[' <span class="text-amber-300 font-bold">Một đòn chí mạng!</span>',' <span class="text-amber-300 font-bold">Trúng ngay yếu huyệt — bạo kích!</span>'];
const KHAC_CLAUSE=[' <span class="text-rose-300">Ngũ hành tương khắc, uy lực tăng vọt!</span>',' <span class="text-rose-300">Đánh đúng chỗ địch sở đoản — kình lực bùng dữ dội!</span>'];
const KHANG_CLAUSE=[' <span class="text-sky-300">Tiếc thay địch khắc chế hệ này, kình lực lụi đi quá nửa.</span>'];
const ENEMY_PHRASES=[
  (e,d,desc)=>`${e} ${desc}, bổ vào ngươi <b class="dmgr">${d}</b> sát thương.`,
  (e,d,desc)=>`${e} ${desc} — ngươi lãnh trọn <b class="dmgr">${d}</b> trọng kích.`,
  (e,d,desc)=>`${e} ${desc}, ngươi đỡ không trọn, mất <b class="dmgr">${d}</b> sinh lực.`,
];
const DODGE_PHRASES=[
  (e,desc)=>`${e} ${desc}, nhưng ngươi thân pháp như mây trôi, nhẹ nhàng né thoát.`,
  (e,desc)=>`${e} ${desc} — ngươi lách mình tránh gọn, không hề hấn gì.`,
  (e,desc)=>`ngươi đảo bộ phiêu hốt, đòn ${desc} của ${e} đánh vào khoảng không.`,
];
const WIN_PHRASES=[
  (e,t,h,x,l)=>`✅ ${e} rống lên thê lương rồi đổ gục. Hạ sau ${t}s · Sinh Lực còn ${h}% · +${x} EXP${l?' · nhặt '+l:''}.`,
  (e,t,h,x,l)=>`✅ Một chiêu định đoạt, ${e} tắt thở đổ rạp. (${t}s · còn ${h}% · +${x} EXP${l?' · '+l:''})`,
];
const DEATH_PHRASES=[
  e=>`💀 ${e} tung đòn cuối, ngươi đỡ không nổi, thổ huyết ngã quỵ — TRỌNG THƯƠNG!`,
  e=>`💀 Một kích xuyên thấu tạng phủ, ngươi gục trước ${e} — TRỌNG THƯƠNG!`,
];
// Câu mở màn mỗi trận — yêu thú nhuốm một ngũ hành ngẫu nhiên. 3 biến thể/hệ, giàu hình ảnh, KHÔNG lặp.
const OPEN_PHRASES={
  hoa:[
    (e,c)=>`${e} gầm lên, toàn thân bốc cháy rừng rực, ngưng tụ một thân <span class="${c} font-medium">Hỏa khí</span> hừng hực.`,
    (e,c)=>`Hơi nóng làm méo cả không gian — <span class="${c} font-medium">Hỏa khí</span> rực đỏ cuộn quanh ${e}.`,
    (e,c)=>`${e} mắt đỏ như than, vận khởi <span class="${c} font-medium">Hỏa khí</span> thiêu đốt, sát khí ngùn ngụt.`,
  ],
  thuy:[
    (e,c)=>`Hàn khí buốt giá lan toả, ${e} ngưng một thân <span class="${c} font-medium">Thủy khí</span> lạnh thấu xương.`,
    (e,c)=>`${e} phủ kín sương băng, <span class="${c} font-medium">Thủy khí</span> trầm lạnh cuồn cuộn dâng lên.`,
    (e,c)=>`Một làn <span class="${c} font-medium">Thủy khí</span> âm nhu mà hàn liệt quấn riết lấy ${e}.`,
  ],
  moc:[
    (e,c)=>`${e} thân nhuốm sắc lục, <span class="${c} font-medium">Mộc khí</span> sinh sôi, độc vụ phảng phất.`,
    (e,c)=>`Cỏ cây quanh ${e} rạp xuống, một thân <span class="${c} font-medium">Mộc khí</span> âm trầm trỗi dậy.`,
    (e,c)=>`${e} toả <span class="${c} font-medium">Mộc khí</span> xanh rì, sinh cơ lẫn độc khí đan cài.`,
  ],
  kim:[
    (e,c)=>`${e} ngưng tụ <span class="${c} font-medium">Kim khí</span> sắc lạnh, lông da cứng tựa giáp sắt.`,
    (e,c)=>`Sát khí bén như đao kiếm — <span class="${c} font-medium">Kim khí</span> chói lạnh bao quanh ${e}.`,
    (e,c)=>`${e} gồng mình, <span class="${c} font-medium">Kim khí</span> rắn rỏi nổi lên, da thịt loé ánh kim.`,
  ],
  tho:[
    (e,c)=>`Đất đá rung chuyển, ${e} ngưng một thân <span class="${c} font-medium">Thổ khí</span> trầm trọng vững như non.`,
    (e,c)=>`${e} bám chặt mặt đất, <span class="${c} font-medium">Thổ khí</span> dày nặng phủ kín toàn thân.`,
    (e,c)=>`Một tầng <span class="${c} font-medium">Thổ khí</span> sừng sững bao lấy ${e}, kiên cố như thành đồng.`,
  ],
};

// ===== Trận đấu STEP-được (chiến báo trực tiếp + offline batch) =====
// forcedHe: ép hệ yêu thú (dùng cho dự báo trung bình); không truyền -> roll ngẫu nhiên mỗi trận.
export function makeFight(P, chosen, enemy, startHp, forcedHe, startNl){
  const he = forcedHe || rollHe(enemy);
  const f = {
    P, chosen: chosen.map(chieuById).filter(Boolean), enemy, eName: enemy.name, eHe: he,
    p:{ hp:(startHp!=null?startHp:P.maxHP), maxHP:P.maxHP, nl:(startNl!=null?startNl:P.maxNL), gauge:0, stun:0, slow:0, buff:0 },
    e:{ hp:enemy.hp, maxHP:enemy.hp, atk:enemy.atk, def:enemy.def, spd:enemy.spd, he, skill:enemy.skill, gauge:0, stun:0, slow:0, skillCd:0, statuses:[] },
    cds:{}, t:0, dealt:0, taken:0, over:false, result:null, log:[],
  };
  const oc = heInfo(he).text;
  L(f, '<span class="'+oc+'">☯</span> '+pick(OPEN_PHRASES[he]||OPEN_PHRASES.hoa)(enemy.name, oc), oc);
  return f;
}
// Mỗi dòng log = { h: html, c: class màu cả dòng }.
function L(f,h,c){ f.log.push({ h, c: c || 'text-slate-200' }); }
function _useSkill(f,c){
  const P=f.P, p=f.p, e=f.e;
  p.nl-=c.nl; f.cds[c.id]=c.cd;
  const nmCls = heInfo(c.type).text;
  const nm='<span class="'+nmCls+' font-medium">〈'+c.name+'〉</span>';
  if(c.type==='buff'){ p.buff=c.buff.ticks; L(f,'✦ Ngươi '+pick(LEAD_VERB)+' '+nm+', tiêu hao <span class="text-blue-400 font-medium">'+c.nl+' Nội Lực</span> — '+pick(c.flavor)+', <span class="text-violet-200">công lực +30% ('+c.buff.ticks+'s)</span>.','text-violet-200'); return; }
  // Chiêu hồi máu thuần (mult thấp vẫn đánh, kèm hồi)
  let dmg=P.atk*c.mult;
  const eleB = (c.type===P.heChinh ? P.tamPhapHeBonus : 0) + ((P.eleBonus && P.eleBonus[c.type]) || 0); // Tâm Pháp(cùng hệ) + bị động theo hệ
  const khac = nguHanhMod(c.type, e.he);                       // khắc/kháng vs hệ địch
  if(c.type!=='vatly') dmg*=(1+eleB)*(1+khac);
  if(p.buff>0) dmg*=1.30;
  const critChance = Math.min(0.95, P.crit + (c.critBonus||0));
  const crit=Math.random()<critChance; if(crit) dmg*=P.critDmg;
  const defEff = Math.max(0, e.def*(1-(c.pen||0)));            // xuyên giáp
  dmg*=100/(100+defEff); dmg=Math.max(1,Math.round(dmg)); e.hp-=dmg; f.dealt+=dmg;
  const cls=crit?'dmgc':'dmg';
  let s='Ngươi '+pick(LEAD_VERB)+' '+nm+', tiêu hao <span class="text-blue-400 font-medium">'+c.nl+' Nội Lực</span> — '+dmgPhrase(c.type,dmg,cls,f.eName)+'.';
  if(crit) s+=pick(CRIT_CLAUSE);
  if(c.type!=='vatly'&&khac>0) s+=pick(KHAC_CLAUSE);
  if(c.type!=='vatly'&&khac<0) s+=pick(KHANG_CLAUSE);
  if(c.lifesteal){ const h=Math.round(dmg*c.lifesteal); p.hp=Math.min(p.maxHP,p.hp+h); s+=' <span class="text-jade">Tinh huyết địch bị hút về, ngươi hồi '+h+' sinh lực.</span>'; }
  if(c.heal){ const h=Math.round(p.maxHP*c.heal); p.hp=Math.min(p.maxHP,p.hp+h); s+=' <span class="text-jade">Chân khí điều tức, hồi '+h+' sinh lực.</span>'; }
  L(f, s, 'text-slate-200');
  if(c.burn){ const dotName=(c.type==='moc'?'Độc':'Bỏng'); e.statuses.push({dmg:c.burn.dmg,ticksLeft:c.burn.ticks,name:dotName}); L(f,(c.type==='moc'?'Độc tố ngấm vào ':'Tàn diễm bám lấy ')+f.eName+', '+(c.type==='moc'?'phủ tạng rữa dần':'da thịt cháy âm ỉ')+' — '+dotName+' ('+c.burn.ticks+' hiệp).', heInfo(c.type).text); }
  if(c.slow){ e.slow=c.slow; L(f,'Hàn khí ghì chặt '+f.eName+', thân pháp địch chậm hẳn lại ('+c.slow+' hiệp).','text-sky-300'); }
  if(c.stun&&Math.random()<c.stun){ e.stun=2; L(f,'Đòn trầm trọng chấn động '+f.eName+' — địch choáng váng!','text-amber-300'); }
}
function _basic(f){
  const P=f.P, p=f.p, e=f.e;
  let dmg=P.atk; const crit=Math.random()<P.crit; if(crit)dmg*=P.critDmg;
  dmg*=100/(100+e.def); dmg=Math.max(1,Math.round(dmg)); e.hp-=dmg; f.dealt+=dmg;
  p.nl=Math.min(P.maxNL,p.nl+P.nlRegen);
  L(f,'Ngươi vận kình đánh thường, giáng <b class="'+(crit?'dmgc':'dmg')+'">'+dmg+'</b> sát thương lên '+f.eName+', hồi <span class="text-blue-400 font-medium">'+P.nlRegen+' Nội Lực</span>.', 'text-slate-300');
}
function _pTurn(f){
  const p=f.p;
  if(p.stun>0){ L(f,'Ngươi bị choáng váng, lỡ một nhịp.','text-slate-500'); return; }
  let c=null; for(const x of f.chosen){ if((f.cds[x.id]||0)<=0 && p.nl>=x.nl){ c=x; break; } }
  if(c) _useSkill(f,c); else _basic(f);
}
function _eTurn(f){
  const P=f.P, p=f.p, e=f.e, sk=e.skill;
  if(e.stun>0){ L(f,f.eName+' còn choáng váng, không kịp ra đòn.','text-slate-500'); return; }
  const useSk=sk&&e.skillCd<=0, mult=useSk?sk.mult:1.0;
  const desc=useSk?sk.fl:(f.enemy.atkFl||'tấn công');
  if(useSk) e.skillCd=sk.cd;
  if(P.dodge && Math.random()<P.dodge){ f.dodged=(f.dodged||0)+1; L(f, '<span class="text-sky-400">▸</span> '+pick(DODGE_PHRASES)(f.eName,desc), 'text-sky-300'); return; }
  let dmg=e.atk*mult*(100/(100+P.def)); dmg=Math.max(1,Math.round(dmg)); p.hp-=dmg; f.taken+=dmg;
  let s='<span class="text-rose-400">▸</span> '+pick(ENEMY_PHRASES)(f.eName,dmg,desc);
  if(useSk&&sk.slow){ p.slow=3; s+=' <span class="text-sky-300">Hàn khí thấm cốt, thân pháp ngươi chậm lại.</span>'; }
  L(f, s, 'text-rose-300');
}
function _end(f,r){
  f.over=true; f.result=r; const e=f.enemy;
  if(r==='win') L(f, pick(WIN_PHRASES)(f.eName, f.t, Math.round(f.p.hp/f.p.maxHP*100), e.exp, ''), 'text-jade font-semibold');
  else L(f, pick(DEATH_PHRASES)(f.eName), 'text-rose-400 font-bold');
}
// Tiến 1 nhịp (≈1 giây sim). Mutate f + ghi f.log. Dùng cho live & offline batch.
export function stepFight(f){
  if(f.over) return;
  f.t++;
  const P=f.P, p=f.p, e=f.e;
  if(e.statuses.length){ e.statuses.forEach(st=>{ e.hp-=st.dmg; f.dealt+=st.dmg; L(f,'☣ '+(st.name==='Độc'?'Độc tố':'Ngọn lửa')+' bào mòn '+f.eName+', hao <b class="dmg">'+st.dmg+'</b> sinh lực.', st.name==='Độc'?'text-emerald-400':'text-orange-400'); st.ticksLeft--; }); e.statuses=e.statuses.filter(s=>s.ticksLeft>0); if(e.hp<=0){ _end(f,'win'); return; } }
  const reg=Math.round(p.maxHP*P.regenPct); if(reg>0&&p.hp<p.maxHP) p.hp=Math.min(p.maxHP,p.hp+reg);
  for(const k in f.cds) if(f.cds[k]>0) f.cds[k]--;
  if(p.buff>0)p.buff--; if(p.slow>0)p.slow--; if(p.stun>0)p.stun--; if(e.stun>0)e.stun--; if(e.slow>0)e.slow--; if(e.skillCd>0)e.skillCd--;
  p.gauge+=P.spd*(p.slow>0?0.6:1); e.gauge+=e.spd*(e.slow>0?0.6:1);
  if(p.gauge>=100){ p.gauge-=100; _pTurn(f); if(e.hp<=0)return _end(f,'win'); if(p.hp<=0)return _end(f,'lose'); }
  if(e.gauge>=100){ e.gauge-=100; _eTurn(f); if(p.hp<=0)return _end(f,'lose'); if(e.hp<=0)return _end(f,'win'); }
}
// Mô phỏng tới khi xong (cho hồ sơ / offline batch).
export function simFight(P, chosen, enemy, opts={}){
  const f=makeFight(P, chosen, enemy, opts.startHp, opts.forcedHe);
  let g=0; while(!f.over && g++<400) stepFight(f);
  if(!f.over) f.result = f.e.hp<=0?'win':'lose'; // hết giờ chưa hạ được địch -> coi THUA (không ép 'win' lạc quan, tránh verdict sai)
  return { result:f.result, t:f.t, dealt:f.dealt, taken:f.taken, hpAfter:Math.max(0,f.p.hp), log:opts.log?f.log:[] };
}

// Hồ sơ combat: vì yêu thú đổi hệ NGẪU NHIÊN mỗi trận → mô phỏng trọn cả 5 hệ rồi lấy TRUNG BÌNH.
// (enemy.he cố định → chỉ tính hệ đó.) Trả thời gian/con, máu mất/con, dps + verdict bền vững.
export function combatProfile(state, loadout, enemy){
  const P = deriveCombat(state, loadout);
  const fixed = enemy.he && NGU_HANH_LIST.includes(enemy.he);
  const elems = fixed ? [enemy.he] : NGU_HANH_LIST;
  let sumT=0, sumHp=0, sumDps=0, wins=0;
  elems.forEach(he=>{
    const f = simFight(P, loadout.chieu, enemy, { startHp:P.maxHP, log:false, forcedHe:he });
    sumT += f.t; sumHp += Math.max(0, P.maxHP - f.hpAfter); sumDps += f.dealt/Math.max(1,f.t);
    if(f.result==='win') wins++;
  });
  const n = elems.length;
  const timePerKill = Math.max(1, Math.round(sumT/n));
  const hpLost = Math.round(sumHp/n);
  const dps = Math.round(sumDps/n);
  const loseCount = n - wins;
  let lvl, verdict, tip, endure, fights=Infinity;
  if(wins===0){ lvl='❌'; verdict='Nguy Hiểm'; endure='thua'; tip='Bài võ không trị nổi nó ở bất kỳ hệ nào. Tăng hút/hồi máu, đổi Bộ Pháp Kiên Thủ, hoặc luyện thêm rồi quay lại.'; }
  else {
    if(hpLost<=0){ fights=Infinity; endure='vô hạn'; } else { fights=Math.floor(P.maxHP/Math.max(1,hpLost)); endure='~'+fights+' con'; }
    if(loseCount>0){ lvl='⚠️'; verdict='Hên Xui'; tip='Yêu thú đổi hệ mỗi trận — ngươi THUA ở '+loseCount+'/'+n+' hệ. Mang chiêu ĐA HỆ + 1 chiêu Vật Lý (không dính khắc/kháng) để trận nào cũng có đòn lợi thế.'; }
    else if(fights===Infinity){ lvl='✅'; verdict='An Toàn'; tip='Hồi/hút máu gánh trọn — cày thoải mái dù địch đổi hệ liên tục.'; }
    else if(fights<=2){ lvl='❌'; verdict='Nguy Hiểm'; tip='Chỉ trụ vài con là gục. Tăng hút máu/thủ hoặc luyện thêm.'; }
    else if(fights<=12){ lvl='⚠️'; verdict='Hơi Đuối'; tip='Cày một lúc rồi phải nghỉ. Thêm chiêu hút/hồi máu hoặc Bộ Pháp Kiên Thủ để bền hơn.'; }
    else { lvl='✅'; verdict='Khá Bền'; tip='Trụ lâu dù địch đổi hệ, thi thoảng ghé hồi Sinh Lực là ổn.'; }
  }
  return { timePerKill, hpLostPerKill:hpLost, dps, lvl, verdict, tip, endure, fights, maxHP:P.maxHP, randomHe:!fixed, loseCount, totalHe:n };
}
