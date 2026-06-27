// ============================================================
// ĐĂNG TIÊN MỘNG (登仙夢) — hệ con game THẺ BÀI (deck-battler roguelike).
// CÁCH LY TUYỆT ĐỐI: component này CHỈ đụng state.dangTien (persist Tầng Mộng sâu nhất).
//   KHÔNG import/đụng deriveCombat / gearBag / combat. Mộng cảnh = thắng/thua không phạt thân.
//   (Pha 1: assist đổi Mộng Ngân ↔ Nguyên Bảo cap tuần — CHƯA wire.)
// Logic = bản mockup _mockup/dangtienmong.html đã verify; thêm bridge persist Tầng sâu nhất.
// ============================================================
import { Storage } from './engine/save.js';

export function ensureDangTien(state) {
  if (!state.dangTien) state.dangTien = {};
  const d = state.dangTien;
  if (d.deepest == null) d.deepest = 0;     // Tầng Mộng sâu nhất từng đạt (meta, persist)
  if (d.runs == null) d.runs = 0;           // số ván đã chơi
  if (d.wins == null) d.wins = 0;           // số ván Đăng Tiên
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
  let _uid = 0;
  const mk = (id) => ({ uid: ++_uid, id, ...POOL[id] });
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];

  return {
    phase: 'lobby', mongNgan: 0, run: null, openDeck: false, deepest: 0,
    map: [], mapTier: 0, mapView: [], battleKind: null,
    enemies: [], targetIdx: 0, player: { block: 0, str: 0, dodge: false }, maxKhi: 3, khi: 3,
    drawPile: [], hand: [], discard: [], log: '', playerHit: false, playerFloats: [], _f: 0, _firstAtkUsed: false,
    rewardCards: [], rewardGold: 0, event: {}, shopItems: [],
    HEROES,
    lobbyBlurbs: [
      { t: 'Đấu Bài Theo Lượt', c: '#22d3ee', d: 'Khí mỗi lượt · Hộ Thể · ngũ hành khắc +30% · địch báo ý đồ trước.' },
      { t: 'Roguelike Mỗi Lần Một Khác', c: '#a78bfa', d: 'Bản đồ nhánh, chọn lối đi; rút bí kíp, nhặt di vật; thắng/thua một mạch.' },
      { t: 'Cách Ly Tuyệt Đối', c: '#34d399', d: 'Mộng cảnh — thắng thua KHÔNG đụng thân thật; chỉ Tầng Mộng sâu nhất theo ra để khoe.' },
    ],
    // ----- BRIDGE persist (chỉ Tầng Mộng sâu nhất, cách ly) -----
    dtInit() { try { const g = this.$store.game; ensureDangTien(g.state); this.deepest = g.state.dangTien.deepest || 0; } catch (e) {} },
    persist() { try { const g = this.$store.game; const s = g.state.dangTien; s.deepest = Math.max(s.deepest || 0, this.deepest || 0); Storage.save(g.state); } catch (e) {} },

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
    atkFxImg(n) { return 'images/dtm/vfx/' + n + '.webp'; },
    atkFxFor(c) { if ((c.hits || 1) > 1) return 'multi_slash'; return /Quyền|Chưởng|Trượng|Chỉ|Phá(?!p)/.test(c.name || '') ? 'fist_impact' : 'slash_arc'; },
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

    startRun(h) { this.mongNgan = 0; this.run = { hero: h, deck: h.start.map(mk), hp: h.hp, maxHp: h.hp, relics: [], reviveUsed: false }; try { const s = this.$store.game.state.dangTien; s.runs = (s.runs || 0) + 1; } catch (e) {} this.genMap(); this.mapTier = 0; this.buildMapView(); this.phase = 'map'; },
    quitRun() { this.run = null; this.phase = 'lobby'; },
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
      if (this.mapTier >= this.map.length) { try { const s = this.$store.game.state.dangTien; s.wins = (s.wins || 0) + 1; } catch (e) {} this.persist(); this.phase = 'win'; return; }
      this.persist(); this.buildMapView(); this.phase = 'map';
    },

    hasRelic(id) { return this.run.relics.some((r) => r.id === id); },
    aliveCount() { return this.enemies.filter((e) => e.hp > 0).length; },
    tgtIdx() { if (this.enemies[this.targetIdx] && this.enemies[this.targetIdx].hp > 0) return this.targetIdx; const i = this.enemies.findIndex((e) => e.hp > 0); return i < 0 ? 0 : i; },
    startBattle(kind) {
      const enc = rnd(ENC[kind] || ENC.battle); const sc = 1 + this.mapTier * 0.1;
      this.enemies = enc.map((id) => { const t = ENEMIES[id]; return { name: t.name, han: t.han, he: t.he, _art: EART[id] || id, elite: !!t.elite, boss: !!t.boss, maxHp: Math.round(t.hp * sc), hp: Math.round(t.hp * sc), block: 0, poison: 0, weak: 0, str: 0, intents: t.intents, ii: 0, floats: [], hit: false, burst: null, atkfx: null }; });
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
    draw(n) { for (let k = 0; k < n; k++) { if (!this.drawPile.length) { if (!this.discard.length) return; this.drawPile = shuffle(this.discard); this.discard = []; } this.hand.push(this.drawPile.pop()); } },
    floatE(e, v) { const id = ++this._f; e.floats.push({ id, v: '-' + v }); e.hit = true; setTimeout(() => { e.hit = false; }, 240); setTimeout(() => { e.floats = e.floats.filter((f) => f.id !== id); }, 950); },
    floatPlayer(v) { const id = ++this._f; this.playerFloats.push({ id, v: '-' + v }); this.playerHit = true; setTimeout(() => { this.playerHit = false; }, 260); setTimeout(() => { this.playerFloats = this.playerFloats.filter((f) => f.id !== id); }, 950); },
    hitEnemy(e, amt) { let d = amt; if (e.block > 0) { const a = Math.min(e.block, d); e.block -= a; d -= a; } e.hp = Math.max(0, e.hp - d); return d; },
    absorbPlayer(amt) { let d = amt; if (this.player.block > 0) { const a = Math.min(this.player.block, d); this.player.block -= a; d -= a; } this.run.hp = Math.max(0, this.run.hp - d); return d; },

    playCard(i) {
      const c = this.hand[i]; if (!c || this.khi < c.cost) return;
      this.khi -= c.cost;
      if (c.dmg) {
        let base = c.dmg + (this.player.str || 0);
        if (this.run.hero.id === 'kiem' && c.type === 'atk' && !this._firstAtkUsed) { base += 3; this._firstAtkUsed = true; }
        const hits = c.hits || 1;
        const tgts = c.aoe ? this.enemies.filter((e) => e.hp > 0) : (this.enemies[this.tgtIdx()] ? [this.enemies[this.tgtIdx()]] : []);
        let total = 0;
        tgts.forEach((e) => { const ef = e; e.atkfx = this.atkFxFor(c); setTimeout(() => { ef.atkfx = null; }, 480); let per = base; if (KHAC[c.he] === e.he) { per = Math.floor(per * 1.3); e.burst = c.he; const eb = e; setTimeout(() => { eb.burst = null; }, 620); } let d = 0; for (let h = 0; h < hits; h++) d += this.hitEnemy(e, per); if (d > 0) this.floatE(e, d); total += d; });
        if (c.drain) this.run.hp = Math.min(this.run.maxHp, this.run.hp + total);
        this.log = c.name + (c.aoe ? ' (toàn thể)' : '') + ' → ' + total + ' ST';
      }
      if (c.blk) this.player.block += c.blk;
      if (c.heal) this.run.hp = Math.min(this.run.maxHp, this.run.hp + c.heal);
      if (c.poison) { const e = this.enemies[this.tgtIdx()]; if (e) { e.poison += c.poison + (this.run.hero.id === 'doc' ? 2 : 0); } }
      if (c.weaken) { const e = this.enemies[this.tgtIdx()]; if (e) e.weak += c.weaken; }
      if (c.str) this.player.str += c.str;
      if (c.dodge) this.player.dodge = true;
      this.hand.splice(i, 1); this.discard.push(c);
      if (c.draw) this.draw(c.draw);
      if (this.aliveCount() === 0) this.winBattle();
    },
    endTurn() {
      this.discard.push(...this.hand); this.hand = [];
      for (const e of this.enemies) { if (e.hp > 0 && e.poison > 0) { this.hitEnemy(e, e.poison); this.floatE(e, e.poison); e.poison = Math.max(0, e.poison - 1); } }
      if (this.aliveCount() === 0) { this.winBattle(); return; }
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
      this.persist(); this.phase = 'lose';
    },
    winBattle() {
      if (this.hasRelic('huyetNgoc')) this.run.hp = Math.min(this.run.maxHp, this.run.hp + 5);
      this.rewardGold = this.battleKind === 'boss' ? 60 : (this.battleKind === 'elite' ? 35 : 18); this.mongNgan += this.rewardGold;
      if (this.battleKind === 'boss') { this.afterNode(); return; }
      if (this.battleKind === 'elite' && this.run.relics.length < RELICS.length) { const have = this.run.relics.map((r) => r.id); const r = rnd(RELICS.filter((x) => !have.includes(x.id))); if (r) { this.run.relics.push(r); this.log = 'Nhặt di vật: ' + r.name; } }
      this.rewardCards = shuffle(Object.keys(POOL).filter((k) => !['coBanKiem', 'coBanQuyen'].includes(k))).slice(0, 3).map(mk);
      this.phase = 'reward';
    },
    pickReward(c) { this.run.deck.push(mk(c.id)); this.afterNode(); },

    openEvent() { this.event = rnd([
      { title: 'Lão Nhân Bên Suối', text: 'Một lão nhân áo vải câu bên suối mộng, ngẩng lên cười: "Tiểu hữu, ngươi muốn một quyển bí kíp, hay chút lộ phí?"',
        opts: [{ label: 'Xin một chiêu thức (rút 1/3 thẻ)', fn: () => { this.rewardGold = 0; this.rewardCards = shuffle(Object.keys(POOL)).slice(0, 3).map(mk); this.phase = 'reward'; } },
                { label: 'Xin lộ phí (+45 Mộng Ngân)', fn: () => { this.mongNgan += 45; this.afterNode(); } }] },
      { title: 'Thạch Bia Cổ', text: 'Tấm bia khắc võ học cổ, sát khí âm u. Lĩnh hội thì lợi hại, nhưng phản phệ chút tâm thần.',
        opts: [{ label: 'Lĩnh hội (mất 6 HP, +1 thẻ Tuyệt)', fn: () => { this.run.hp = Math.max(1, this.run.hp - 6); const t = rnd(Object.keys(POOL).filter((k) => POOL[k].rar === 'tuyet')); this.run.deck.push(mk(t)); this.afterNode(); } },
                { label: 'Bỏ qua', fn: () => this.afterNode() }] },
      { title: 'Suối Linh Tuyền', text: 'Dòng suối trong mộng tỏa linh khí mát lành.',
        opts: [{ label: 'Tẩm mình (hồi 40% HP)', fn: () => { this.run.hp = Math.min(this.run.maxHp, this.run.hp + Math.round(this.run.maxHp * 0.4)); this.afterNode(); } },
                { label: 'Múc mang theo (+30 Mộng Ngân)', fn: () => { this.mongNgan += 30; this.afterNode(); } }] },
    ]); this.phase = 'event'; },
    resolveEvent(o) { o.fn(); },

    openShop() { const keys = shuffle(Object.keys(POOL).filter((k) => !['coBanKiem', 'coBanQuyen'].includes(k))).slice(0, 3);
      this.shopItems = keys.map((k) => { const card = mk(k); const price = card.rar === 'tuyet' ? 75 : (card.rar === 'hiem' ? 50 : 30); return { card, price, sold: false }; }); this.phase = 'shop'; },
    buyShop(i) { const s = this.shopItems[i]; if (s.sold || this.mongNgan < s.price) return; this.mongNgan -= s.price; this.run.deck.push(mk(s.card.id)); s.sold = true; },
    buyHeal() { if (this.mongNgan < 40 || this.run.hp >= this.run.maxHp) return; this.mongNgan -= 40; this.run.hp = Math.min(this.run.maxHp, this.run.hp + 18); },
    restHeal() { this.run.hp = Math.min(this.run.maxHp, this.run.hp + Math.round(this.run.maxHp * 0.3)); this.afterNode(); },
    restLearn() { const t = rnd(Object.keys(POOL).filter((k) => !['coBanKiem', 'coBanQuyen'].includes(k))); this.run.deck.push(mk(t)); this.afterNode(); },
  };
}
