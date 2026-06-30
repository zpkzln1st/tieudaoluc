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
    { id: 'thietGiap', name: 'Huyền Thiết Giáp', han: '鐵', desc: 'Đầu mỗi trận +6 Hộ Thể.' },
    { id: 'ngocBoi', name: 'Tụ Khí Ngọc Bội', han: '氣', desc: 'Lượt đầu mỗi trận +2 Khí.' },
    { id: 'huyetNgoc', name: 'Hồi Huyết Châu', han: '血', desc: 'Thắng trận hồi 5 HP.' },
    { id: 'linhPhu', name: 'Quảng Lãm Phù', han: '符', desc: 'Mỗi lượt rút thêm 1 lá.' },
    { id: 'menhHon', name: 'Hộ Mệnh Hồn Phách', han: '魂', desc: 'Gục lần đầu → hồi sinh 30% HP.' },
  ];
  const ENEMIES = {
    cuongDao: { name: 'Lục Lâm Cường Đạo', han: '盜', he: 'moc', hp: 26, intents: [{ t: 'atk', v: 8 }, { t: 'def', v: 6 }, { t: 'atk', v: 10 }] },
    satThu: { name: 'Hắc Phong Sát Thủ', han: '殺', he: 'kim', hp: 30, intents: [{ t: 'atk', v: 5, hits: 2 }, { t: 'buff', v: 3 }, { t: 'atk', v: 9 }] },
    langYeu: { name: 'Mộng Lang Yêu', han: '狼', he: 'thuy', hp: 28, intents: [{ t: 'atk', v: 7 }, { t: 'atk', v: 7 }, { t: 'def', v: 8 }] },
    hoaSonKiem: { name: 'Hoa Sơn Kiếm Sĩ', han: '華', he: 'thuy', hp: 46, elite: true, intents: [{ t: 'atk', v: 9 }, { t: 'buff', v: 2 }, { t: 'atk', v: 6, hits: 2 }, { t: 'def', v: 10 }] },
    duongMon: { name: 'Đường Môn Ám Sứ', han: '暗', he: 'moc', hp: 42, elite: true, intents: [{ t: 'atk', v: 6 }, { t: 'atk', v: 4, hits: 2 }, { t: 'heal', v: 8 }, { t: 'atk', v: 11 }] },
    maGiao: { name: 'Ma Giáo Hộ Pháp · tàn niệm', han: '魔', he: 'moc', hp: 72, boss: true, intents: [{ t: 'atk', v: 11 }, { t: 'charge' }, { t: 'atk', v: 22, big: true }, { t: 'def', v: 12 }, { t: 'heal', v: 10 }] },
  };
  const ENC = {
    battle: [['cuongDao'], ['langYeu'], ['satThu'], ['cuongDao', 'langYeu'], ['cuongDao', 'cuongDao'], ['satThu', 'langYeu']],
    elite: [['hoaSonKiem'], ['duongMon'], ['satThu', 'satThu']],
    boss: [['maGiao']],
  };
  const EART = { hoaSonKiem: 'port_master_hoa_son', duongMon: 'port_master_duong_mon', maGiao: 'port_master_ma_giao' };   // elite/boss mượn chân dung chưởng môn
  const TIER = [
    { label: 'Tầng 1' },
    { label: 'Tầng 2', types: ['battle', 'event', 'shop'] },
    { label: 'Tầng 3', types: ['elite', 'battle', 'rest'] },
    { label: 'Tầng 4', types: ['event', 'elite'] },
    { label: 'Mộng Chủ', types: ['boss'] },
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
  let _uid = 0;
  const mk = (id) => ({ uid: ++_uid, _cast: null, id, ...POOL[id] });
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];

  return {
    phase: 'lobby', runNgan: 0, run: null, openDeck: false, deepest: 0, metaTab: false, rerollLeft: 0, _bankGain: 0, scSel: { kiem: 0, thien: 0, doc: 0 }, _newUnlocks: [], _newScUnlocked: 0,
    map: [], mapTier: 0, mapView: [], battleKind: null,
    enemies: [], targetIdx: 0, player: { block: 0, str: 0, dodge: false }, maxKhi: 3, khi: 3,
    drawPile: [], hand: [], discard: [], log: '', playerHit: false, playerFloats: [], _f: 0, _firstAtkUsed: false, _shake: false, _hitstop: false, _winning: false, selUid: null,
    rewardCards: [], rewardGold: 0, event: {}, shopItems: [],
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
    nodeHan(t) { return { battle: '敵', elite: '雄', event: '緣', shop: '市', rest: '憩', boss: '魔' }[t] || '敵'; },
    nodeLabel(t) { return { battle: 'Đấu', elite: 'Tinh Anh', event: 'Kỳ Ngộ', shop: 'Mộng Thị', rest: 'Tĩnh Thất', boss: 'Mộng Chủ' }[t] || 'Đấu'; },
    nodeStyle(nd, state) { const c = { battle: '#fb7185', elite: '#f5b942', event: '#a78bfa', shop: '#facc15', rest: '#34d399', boss: '#fb7185' }[nd.type] || '#94a3b8';
      if (state === 'pick') return 'color:' + c + ';border-color:' + c + ';box-shadow:0 0 14px -3px ' + c + ';background:' + c + '18';
      if (state === 'done') return 'color:#64748b;border-color:#334155'; return 'color:#475569;border-color:#1e293b'; },
    nodeColor(t) { return { battle: '#fb7185', elite: '#f5b942', event: '#a78bfa', shop: '#facc15', rest: '#34d399', boss: '#fb7185' }[t] || '#94a3b8'; },
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
      this.genMap(); this.mapTier = 0; this.buildMapView(); this.phase = 'map';
    },
    quitRun() { this.bankRun(false); this.run = null; this.phase = 'lobby'; },
    genMap() { this.map = TIER.map((ti) => ti.types ? ti.types.map((t) => ({ type: t })) : [{ type: 'battle' }, { type: 'battle' }]); },
    buildMapView() { this.mapView = this.map.map((row, r) => ({ nodes: row, state: r < this.mapTier ? 'done' : (r === this.mapTier ? 'pick' : 'locked') })).slice().reverse(); },
    pickNode(nd) {
      if (nd.type === 'battle' || nd.type === 'elite' || nd.type === 'boss') this.startBattle(nd.type);
      else if (nd.type === 'event') this.openEvent();
      else if (nd.type === 'shop') this.openShop();
      else if (nd.type === 'rest') this.phase = 'rest';
    },
    afterNode() {
      this.mapTier++; this.deepest = Math.max(this.deepest, this.mapTier);
      if (this.mapTier >= this.map.length) {
        try { const s = this.$store.game.state.dangTien; s.wins = (s.wins || 0) + 1; } catch (e) {}
        this.bankRun(true);
        try { const s = this.$store.game.state.dangTien; const hid = this.run.hero.id; const cm = s.scMaxByHero[hid] || 0; if ((this.run.sc || 0) >= cm && cm < DTM_SC_MAX) { s.scMaxByHero[hid] = cm + 1; this.scSel[hid] = cm + 1; this._newScUnlocked = cm + 1; } } catch (e) {}
        this._checkUnlocks();
        this.persist(); this.phase = 'win'; return;
      }
      this._checkUnlocks(); this.persist(); this.buildMapView(); this.phase = 'map';
    },

    hasRelic(id) { return this.run.relics.some((r) => r.id === id); },
    aliveCount() { return this.enemies.filter((e) => e.hp > 0).length; },
    tgtIdx() { if (this.enemies[this.targetIdx] && this.enemies[this.targetIdx].hp > 0) return this.targetIdx; const i = this.enemies.findIndex((e) => e.hp > 0); return i < 0 ? 0 : i; },
    startBattle(kind) {
      const enc = rnd(ENC[kind] || ENC.battle); const scl = 1 + this.mapTier * 0.1 + (this.run.sc || 0) * 0.08;   // +8% HP quái mỗi bậc Sát Cảnh
      this.enemies = enc.map((id) => { const t = ENEMIES[id]; return { name: t.name, han: t.han, he: t.he, _art: EART[id] || id, elite: !!t.elite, boss: !!t.boss, maxHp: Math.round(t.hp * scl), hp: Math.round(t.hp * scl), block: 0, poison: 0, weak: 0, str: 0, intents: t.intents, ii: 0, floats: [], hit: false, burst: null, atkfx: null }; });
      this.targetIdx = 0; this.battleKind = kind;
      this.drawPile = shuffle(this.run.deck.map((c) => ({ ...c }))); this.discard = []; this.hand = [];
      this.player = { block: 0, str: 0, dodge: false }; this.log = ''; this.playerFloats = [];
      if (this.hasRelic('thietGiap')) this.player.block += 6;
      this.khi = this.maxKhi + (this.hasRelic('ngocBoi') ? 2 : 0);
      this.phase = 'battle'; this.startTurnPassive();
      this.draw(this.handSize());
    },
    handSize() { return 5 + (this.hasRelic('linhPhu') ? 1 : 0); },
    startTurnPassive() { if (this.run.hero.id === 'thien') this.player.block += 3; this._firstAtkUsed = false; },
    curIntent(e) { return e.intents[e.ii % e.intents.length]; },
    intentText(e) { const it = this.curIntent(e); if (!it) return ''; const s = e.str || 0;
      if (it.t === 'atk') { const per = Math.max(0, it.v + s - (e.weak || 0)); return it.hits ? ('Đánh ' + per + '×' + it.hits) : ('Đánh ' + per); }
      if (it.t === 'def') return 'Vận Hộ Thể ' + it.v; if (it.t === 'buff') return 'Tăng Lực +' + it.v;
      if (it.t === 'charge') return 'Vận Công… (đòn mạnh)'; if (it.t === 'heal') return 'Liệu Thương +' + it.v; return ''; },
    intentStyle(e) { const it = e.hp > 0 && this.curIntent(e); const c = !it ? '#64748b' : (it.t === 'atk' ? '#fb7185' : (it.t === 'charge' ? '#f5b942' : (it.t === 'heal' ? '#34d399' : (it.t === 'def' ? '#38bdf8' : '#facc15'))));
      return 'color:' + c + ';border:1px solid ' + c + '55;background:' + c + '14'; },
    peekOn() { return !!this._up().peek; },   // Lưỡng Nghi Kính
    peekText(e) { const it = e.intents[(e.ii + 1) % e.intents.length]; if (!it) return ''; const s = e.str || 0;
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
        if (this.run.hero.id === 'kiem' && c.type === 'atk' && !this._firstAtkUsed) { base += 3; this._firstAtkUsed = true; }
        const hits = c.hits || 1;
        const tgts = c.aoe ? this.enemies.filter((e) => e.hp > 0) : (this.enemies[this.tgtIdx()] ? [this.enemies[this.tgtIdx()]] : []);
        let total = 0;
        tgts.forEach((e) => { let per = base; if (KHAC[c.he] === e.he) { per = Math.floor(per * 1.3); e.burst = c.he; const eb = e; setTimeout(() => { eb.burst = null; }, 620); } let d = 0; for (let h = 0; h < hits; h++) d += this.hitEnemy(e, per); if (d > 0) this.floatE(e, d); total += d; });
        if (c.drain) this.run.hp = Math.min(this.run.maxHp, this.run.hp + total);
        this.log = c.name + (c.aoe ? ' (toàn thể)' : '') + ' → ' + total + ' ST';
      }
      if (c.blk) this.player.block += c.blk;
      if (c.heal) this.run.hp = Math.min(this.run.maxHp, this.run.hp + c.heal);
      if (c.poison) { const e = this.enemies[this.tgtIdx()]; if (e) { e.poison += c.poison + (this.run.hero.id === 'doc' ? 2 : 0); } }
      if (c.weaken) { const e = this.enemies[this.tgtIdx()]; if (e) e.weak += c.weaken; }
      if (c.str) this.player.str += c.str;
      if (c.dodge) this.player.dodge = true;
      this.castCard(c, ev);
      if (c.draw) this.draw(c.draw);
      if (this.aliveCount() === 0) this._finishBattle();
    },
    endTurn() {
      if (this._winning) return;
      this.selUid = null;
      for (const hc of this.hand) hc._cast = null;
      this.discard.push(...this.hand); this.hand = [];
      for (const e of this.enemies) { if (e.hp > 0 && e.poison > 0) { this.hitEnemy(e, e.poison); this.floatE(e, e.poison); e.poison = Math.max(0, e.poison - 1); } }
      if (this.aliveCount() === 0) { this._finishBattle(); return; }
      let toPlayer = 0;
      for (const e of this.enemies) { if (e.hp <= 0) continue; const it = this.curIntent(e); if (it) {
        if (it.t === 'atk') { let per = Math.max(0, it.v + (e.str || 0) - (e.weak || 0)); const hits = it.hits || 1; for (let h = 0; h < hits; h++) { if (this.player.dodge) { this.player.dodge = false; continue; } toPlayer += this.absorbPlayer(per); } }
        else if (it.t === 'def') e.block += it.v; else if (it.t === 'buff') e.str = (e.str || 0) + it.v; else if (it.t === 'heal') e.hp = Math.min(e.maxHp, e.hp + it.v);
      } e.ii++; e.weak = Math.max(0, (e.weak || 0) - 1); }
      if (toPlayer > 0) this.floatPlayer(toPlayer);
      if (this.run.hp <= 0) { this.onDeath(); return; }
      this.player.block = 0; this.khi = this.maxKhi; this.startTurnPassive(); this.draw(this.handSize());
    },
    onDeath() {
      if (this.hasRelic('menhHon') && !this.run.reviveUsed) { this.run.reviveUsed = true; this.run.hp = Math.round(this.run.maxHp * 0.3); this.log = 'Hộ Mệnh Hồn Phách — hồi sinh!'; this.player.block = 0; this.khi = this.maxKhi; this.draw(this.handSize()); return; }
      this.bankRun(false); this.persist(); this.phase = 'lose';
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
      this.rewardGold = this.battleKind === 'boss' ? 60 : (this.battleKind === 'elite' ? 35 : 18); if ((this.run.sc || 0) >= 2) this.rewardGold = Math.round(this.rewardGold * 0.9); this.runNgan += this.rewardGold;
      if (this.battleKind === 'boss') { this.afterNode(); return; }
      if (this.battleKind === 'elite' && this.run.relics.length < RELICS.length) { const have = this.run.relics.map((r) => r.id); const r = rnd(RELICS.filter((x) => !have.includes(x.id))); if (r) { this.run.relics.push(r); this.log = 'Nhặt di vật: ' + r.name; } }
      this.rewardCards = shuffle(Object.keys(POOL).filter((k) => !['coBanKiem', 'coBanQuyen'].includes(k) && this._cardUnlocked(k))).slice(0, 3).map(mk);
      this._setReroll(); this.phase = 'reward';
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
    ]); this.phase = 'event'; },
    resolveEvent(o) { o.fn(); },

    openShop() { const keys = shuffle(Object.keys(POOL).filter((k) => !['coBanKiem', 'coBanQuyen'].includes(k) && this._cardUnlocked(k))).slice(0, 3);
      this.shopItems = keys.map((k) => { const card = mk(k); let price = card.rar === 'tuyet' ? 75 : (card.rar === 'hiem' ? 50 : 30); if ((this.run.sc || 0) >= 5) price = Math.round(price * 1.15); return { card, price, sold: false }; }); this._setReroll(); this.phase = 'shop'; },
    buyShop(i) { const s = this.shopItems[i]; if (s.sold || this.runNgan < s.price) return; this.runNgan -= s.price; this.run.deck.push(mk(s.card.id)); s.sold = true; },
    buyHeal() { if (this.runNgan < 40 || this.run.hp >= this.run.maxHp) return; this.runNgan -= 40; this.run.hp = Math.min(this.run.maxHp, this.run.hp + 18); },
    restHeal() { this.run.hp = Math.min(this.run.maxHp, this.run.hp + Math.round(this.run.maxHp * this.restPct())); this.afterNode(); },
    restLearn() { const t = rnd(Object.keys(POOL).filter((k) => !['coBanKiem', 'coBanQuyen'].includes(k) && this._cardUnlocked(k))); this.run.deck.push(mk(t)); this.afterNode(); },
  };
}
