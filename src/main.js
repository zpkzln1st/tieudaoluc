// ============================================================
// MAIN — Bootstrap: nối ENGINE (logic thuần) với UI (Alpine).
// ============================================================
import Alpine from 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/module.esm.js';
import { SKILLS, STATS } from './data/skills.js';
import { DAMDAO, TIN_VAT, TIN_VAT_EFF_PCT } from './data/damdao.js';
import { ITEMS, QUALITY, ITEM_TYPES, itemNameHtml } from './data/items.js';
import { LOCATIONS, REALM_TIERS } from './data/locations.js';
import { AVATARS, COVERS } from './data/avatars.js';
import { LOGIN_REWARDS } from './data/daily.js';
import { TUTORIAL_QUESTS, DAILY_QUESTS, WEEKLY_QUESTS, MONTHLY_QUESTS } from './data/quests.js';
import { LINH_THACH, LT_COVER_MS, linhThachForSkill } from './data/linhthach.js';
import { NAV, VIEW_NAMES } from './data/nav.js';
import { EQUIP_SLOTS, TOOL_SLOTS, SECONDARY_STATS, RETIRED_SLOTS, SK_PHU_KIEN_SLOTS } from './data/ui.js';
import { GEAR_IDS, instanceFromCatalog, rollSetPieceInstance, rollGearInstance, rollMonsterDrop, MONSTER_DROP_CHANCE, MANH_DROP_CHANCE, MANH_DROP_MIN_LV, AFFIX, TRANG_SETS, TRANG_SET_KEYS } from './data/gear.js';
import { CLASSES, CLASS_GROUPS, NGHE, skillExpMultiplier } from './data/classes.js';
import { createInitialState, CAI_DAT_MAC_DINH } from './engine/state.js';
// ⚠ Cong thuc gia san co BAN SONG SINH bang SQL (san_gia_toi_thieu). Sua day phai sua ca do.
import { giaSanTrangBi, giaSanVatPham } from './data/giasan.js';
import { DD_NHANH, DD_NHANH_INFO, DD_PHAM_TEN, DD_O, DD_PHAM_NAU_TOI, DD_TONG_O, DD_NGAN_SACH, DD_HON_THUONG, ddArtCua, ddMoiVien, ddItemId, ddNauDuoc, ddNenPhuong } from './data/dandien.js';
import { ddBang, ddDemTong, ddDemNhanh, ddHonDaMo, ddNap } from './engine/dandien.js';
import { dangTienMong, ensureDangTien } from './dangtienmong.js';   // Đăng Tiên Mộng (game thẻ bài, cách ly)
import { nguTuKy, ensureNguTu } from './ngutuky.js';                 // Ngũ Tử Kỳ (cờ caro 3D, cách ly)
import { coTuong, ensureCoTuong } from './cotuong.js';               // Cờ Tướng (象棋 3D, cách ly)
import { coVua, ensureCoVua } from './covua.js';                     // Cờ Vua (西洋棋 3D, cách ly)
import { tienLen, ensureTienLen } from './tienlen.js';               // Tiến Lên Miền Nam (bàn bài 3D, cược Bạc)
import { binh, ensureBinh } from './binh.js';                        // Binh Xập Xám (bàn bài 3D, cược Trù Mã)
import { paoDeKuai, ensurePaoDeKuai } from './paodekuai.js';         // Phao Đắc Khoái (bàn bài 3D BA người)
import { tuuLau, ensureTuuLau } from './tuulau.js';
import { bangPhai, ensureBangPhai } from './bangphai.js';            // Bang Phái (lập bang, chinh phạt, boss bang)
import { camNang } from './camnang.js';
import { timKiemUI } from './timkiem.js';                            // Tim Kiem chung (go ra moi thu, bam la toi trang co san)                              // Cẩm Nang (wiki trong game)
import { ghiKillChinhPhat, hoSoMinhChung } from './engine/bangphai.js';             // điểm Chinh Phạt khi hạ quái                  // Tửu Lâu (quán rượu giang hồ, cách ly)
import { bangKyNangBonus } from './engine/bangbuff.js';              // kĩ năng bang: +Bạc/+rơi đồ ở awardKill
import * as BP from './engine/bangphai.js';                          // bảng Dev: gọi đúng hàm engine, không ghi tay state
import * as TL from './engine/tuulau.js';                            // bảng Dev: nuôi Giao Tình để thử cửa chiêu mộ
import { kiemHanFont } from './engine/hanfont.js';      // chữ Hán: nguồn chân lý + máy tự soát font
import { ensureKyHon } from './engine/kyhon.js';                     // Kỳ Hồn dùng chung cho mọi bàn cờ
import { ensureGocNhin } from './engine/gocnhin.js';                 // Góc nhìn bàn cờ người chơi tự khoá (dùng chung 3 bàn)
import { kyTran, ensureKyTran } from './kytran.js';                  // Kỳ Trận (match-3 Cửu Cung, cách ly)
import { dongPhu } from './dongphu.js';                              // Động Phủ (nhà riêng — component view)
import { ensureDongPhu, resolveDongPhu } from './engine/dongphu.js'; // Động Phủ (engine thuần)
import { HOUSE_TIERS as DP_HOUSE_TIERS, BUILDINGS as DP_BUILDINGS } from './engine/dongphu.js';
import { Storage } from './engine/save.js';
import {
  startActivity, startCombat, startTravel, stopActivity, advance, getAction, idleCapMs, SUY_YEU_MS, ghiNhatKyNgay, khoaNgay,
  canStartAction, inputStatus, startDungeon, maxDungeonRuns, autoEatTick, autoDanNL,
  tinVatDone as _tinVatDone,
  migrateDanSlots, reqLvThat,
} from './engine/activity.js';
// ĐỐN NGỘ CẢNH — Trùng Sinh nghề
import { NGO_CANH_NUT, NGO_CANH_BY_ID, NHANH as NC_NHANH, TRUNG_SINH_MAX, DIEM_MOI_LAN, DIEM_MUA_HET, nutEffText } from './data/ngocanh.js';
import { ensureNgoCanh, soTrungSinh, bacNut, diemConLai, coTheTrungSinh, trungSinh, muaNut, tayBang, ncBoKhoaVung, capKyNang, tienDoKyNang, tranCap, chuyenDangMo } from './engine/ngocanh.js';
import { ensureBuffs, pruneBuffs, activeBuffList, buffVal, useBuffDan, duocLuTick } from './engine/buff.js';
import { deriveCombat, combatProfile, makeFight, stepFight, CHIEU, BO_PHAP, BI_DONG, TAM_PHAP, TAM_PHAP_POOL, tamPhapById, chieuById, biDongById, normBiDong, NGU_HANH, NGU_HANH_LIST, HE_FX, nguHanhMod, isVoHe, heName, heInfo, maxComboSlots, maxChieuSlots, nextSlotLevel, COMBAT_CYCLE_MS, boPhapById, boPhapStats, normBoPhap, MON_PHAI, monPhaiOf, chieuCost, tamPhapCost, biDongCost, skillSource, normOwned, starterLoadoutFor, TIER_LABEL, TIER_ORDER, tierStyle, TUYET_IDS, tuyetRecipe,
  TANG_MAX, TANG_BANDS, tangClamp, tangMul, tangCanh, banMenhAn, chieuAtTang, chieuOf,
  KHANG_CAP, KHANG_TU_HE, enemyKhangFor } from './data/votong.js';
import { ENEMIES, STANCES, YEU_VUONG, YEU_VUONG_BY_ID, BAC_DROP_CHANCE, BAC_PER_EXP, LOOT_DROP_MULT } from './data/combat.js';
import { DUNGEONS, DUNGEON_BY_ID, DUNGEON_IDS } from './data/dungeon.js';
import { MERCHANT, SHOP_MAT, SHOP_FOOD, SHOP_BAIT, AVATAR_PRICE, COVER_PRICE } from './data/merchant.js';
import { addItem, removeItem, countItem } from './engine/inventory.js';
import { derivedStats, combatExpMult } from './engine/stats.js';
import { equippedSetCount, isSetPieceInst, SET_QUALITY, SET_TIERS, SET_PCT_KEYS, SET_ELE_KEY, SET_MISC_KEYS } from './engine/setbonus.js';
import { CODEX_CATS, CODEX_BY_KEY } from './data/codex.js';
import { ensureCodex, codexCount, codexCatDone, codexBonus } from './engine/codex.js';
import { enhanceMul, enhanceStep, canEnhance, tryEnhance, MAX_PLUS } from './engine/enhance.js';
import { equipItem, unequipItem, addGearInstance, removeGearByUid, findGear } from './engine/equip.js';
import { TITLES, TITLE_BY_ID, TITLE_LOAI, titleBonusText } from './data/titles.js';
import { ensureTitles, syncTitles, titleBonus } from './engine/titles.js';
import { BADGES, BADGE_LV } from './data/badges.js';
import { xpProgress, levelFromXp, xpForLevel, addSkillXp, addStatXp } from './engine/leveling.js';
import { ensureRng, rng, rngHam } from './engine/rng.js';   // Đợt D: bốc số có hạt giống -> máy chủ tính lại được
import { pushNotif } from './engine/notif.js';
import { startIncubation, finishHatch, incubRemainMs, incubReady, incubSkipCost, hatchDurMs, petStatAt, activePet, gainPetXp, petXpToNext, petCombatCycle, petStamView, petStamMax, petHpMax, petPassive, petActiveEff, petAwkPassive, fusePreview, fuseMany, releaseReward, releasePet, devSpawnPet, awakenCost, canAwaken, awakenAfford, awakenPet, activeAwkVal, startHunt, stopHunt, resolvePetHunts, nguThuLv, huntSlots, huntSlotsUsed, petBusy, HUNT_TICK_MS, petTuTru, phucDungGain, feedPetHerb } from './engine/pets.js';
import { PET_SPECIES, PET_QUALITY, PET_OPT_BY_ID, AWK_PASSIVES } from './data/pets.js';
import { genRoster, botCombatLv, botTotalLv, botDominant, botTitleFor, botCatFor, botAvatar, botActivity, nearbyBotsBy, ensureWorld, donNguoiAnCu, conBaoLauCoNguoiMoi, genJiangHuFeed } from './engine/bots.js';
import { ensureTongMon, simTongMon, slotCount, recruitCost, doRecruit, refreshRecruitPool, recruitResetInfo, doRecruitReset, breakReqOf, doBreakthrough, startBrew, collectBrew, collectAllBrews, startLichLuyen, sowPlot, harvestPlot, harvestAllPlots, enhanceGear, enrollGiang, canEnrollGiang, giangSeatInfo, disciplineDisciple, disciNeedsDiscipline, runLuanVo, luanVoRecord, diplomacyHost, diplomacyGift, startLinhNgo, linhNgoSeatInfo, biKipBagAdd, bkAuctionRefresh, buyBkLot, mergeBiKip, mergeBiKipPick, disciLoaiCat, disciPower, disciStats, uyDanhOf, xuatSu, phongTruongLao, upgradeBuilding, giftGear, reclaimGear, resolveEvent, forceFireEvent, tmShopBuy } from './engine/tongmon.js';
import { danhSiList, danhSiProfile, offerOf } from './engine/danhsi.js';
import { CAT_NAME, LOAI_CAT, h32 as lvHash, luanVo, luanVoCycle, luanVoMarginLabel } from './engine/luanvo.js';   // tên nhóm tương khắc + core tỉ thí (Luận Võ Hội)
import { BICANH_BK_CHANCE, biCanhBkMaxTier } from './data/tongmon.js';   // Bí Kíp rơi từ Bí Cảnh -> bày được trong lưới Bảo Vật
import { REALMS, APT, HE, BUILDINGS, BUILD_KEYS, TM_SHOP, buildCost, disciCap, aptHardCap, originLabelOf, originBioOf, SUB_STAGES, subStageName, subStageIndex, MATS, MAT_KEYS, PILLS, PILL_KEYS, PILL_BY_REALM, PILL_PHAM_KEYS, pillPham, thienKiepOf, kiepOdds, diploTier, diploNextMin, DIPLO_HOST_CD_H, DIPLO_GIFT_DIEM, BI_KIP, BI_KIP_KEYS, BI_KIP_BY_ID, BI_KIP_LOAI, BI_KIP_TIER, BI_KIP_TIER_ORDER, BI_KIP_ADD_STATS, biKipMods, biKipSlotMax, BK_AUCTION_REFRESH_H, BK_MERGE_N, LICH_LUYEN_H, DUOC_GROW_H, DUOC_YIELD, duocPlotCount, duocMaxTier, pillBrewH, yQuanFurnaces, lkcMaxPlus, lkcStep, GIANG_H, GIANG_MAX_BONUS, giangSeats, TAMMA_MAX, tamMaTier, genDisciple } from './data/tongmon.js';
import { TM_GRP, TM_EVENTS } from './data/tongmon_events.js';
import { BOT_COUNT, CAT_HEX } from './data/bots.js';
import { teleportCost, travelTimeMs, mapDistance } from './engine/travel.js';
import { bossHe, bossReady, bossCdEnd, bossQueued, setBossQueue, runBossFight, applyBossWin, applyBossLose, applyBossRetreat, resolveBossQueue as resolveBossQueueEngine, genBossFeed, bossCurHp, bossMaxHp, bossHealing, bossHealLeftMs, ensureBoss, bossResetHp } from './engine/worldboss.js';
import { grantDungeon, finalizeDungeonBatch } from './engine/dungeon.js';   // dev + chốt Lịch Luyện khi dừng sớm
import { cloudSignUp, cloudSignIn, cloudSignOut, cloudGetUser, cloudOnAuth, cloudLoadSave, cloudPushSave, cloudPushHoSo, cloudLoadHoSo, cloudMyUid, cloudLoadBangNguoiThat, cloudNghiVanGom, cloudNghiVanCua, cloudMienTruDs, cloudMienTruThem, cloudMienTruBo, cloudSuKienDs, cloudSuKienDat, cloudQuaChoNhan, cloudNhanQua, cloudPhatQua, cloudKhoaDs, cloudKhoaThem, cloudKhoaBo, cloudNguoiChoiDs, cloudTimNguoiChoi, cloudDocSaveCua, cloudNhatKyDs, cloudPhatQuaNhieu, cloudCaoThiDs, cloudCaoThiDang, cloudCaoThiXoa, cloudHoSoXoa, cloudThongKe, cloudDoiMaQua, cloudMaTuDongDs, cloudMaQuaDs, cloudMaQuaTao, cloudMaQuaXoa, cloudHeSoDs, cloudHeSoDat, cloudHeSoXoa, cloudMoKhoaDs, cloudMoKhoaDat, cloudTinhNangDs, cloudTinhNangDat, cloudSanDs, cloudSanCuaToi, cloudSanTreo, cloudSanTreoVp, cloudSanGo, cloudSanMua } from './cloud.js';
import { SU_KIEN_MA, ensureLenhBai, demSuKien, suKienDangMo, suKienHienHanh, suKienConLai, suKienSapMo, quaDaNhan, ghiQuaDaNhan, caoThiDaXem, ghiCaoThiDaXem } from './engine/lenhbai.js';
import { SU_KIEN_DS, SU_KIEN_BY_MA, SK_BAC, QUAY_GIA, QUAY_TIEU_HAO, CO_ART_DUNG_MAO, SU_KIEN_ART_PHU_KIEN, tenPhuKien, artPhuKien } from './data/sukien.js';
import { ensureSuKien, datCoTacGia, doiVatPham, muaTranPham, muaTieuHao, daMuaTrongDot, pkBacDeo, coPhuKien, thaPhuKien, donSuKien, congDiem } from './engine/sukien.js';
import { TINH_NANG, TINH_NANG_DOT, TINH_NANG_BY_MA } from './data/tinhnang.js';
import { demTinhNang, tinhNangMo, tinhNangTrangThai, tinhNangDangBat } from './engine/tinhnang.js';
import { verifyAuthorCert } from './engine/author.js';
import { tuBatFPS } from './engine/fps.js';   // ?fps=1 -> hiện đồng hồ khung hình
import { batNgonNgu } from './i18n.js';       // lớp phủ dịch EN/ZH — từ điển chỉ nạp khi khác 'vi'
import { vuaKhung } from './engine/toanman.js';   // thu tấm modal cho vừa màn, khỏi phải cuộn
import { datTranNet } from './engine/muot.js';   // Cài Đặt → Chất Lượng Hình: trần tỉ lệ điểm ảnh cho bàn 3D

// Thứ hạng phẩm chất — dựng MỘT LẦN. `qualityRank` nằm trên đường sắp xếp của mọi danh sách
// đồ đạc (Hành Lý, danh sách trang bị, loot, Linh Thú); tính lại `Object.keys` trong đó là
// cấp phát một mảng cho từng phép so.
const QKEYS = Object.keys(QUALITY);
const QRANK = QKEYS.reduce((o, k, i) => { o[k] = i + 1; return o; }, {});

let _devNowOffset = 0;                        // Dev: tua đồng hồ (session-only; reload reset). 0 = thực.
// Dev: CHẠY NHANH thời gian (khác "tua" ở trên — tua là nhảy một phát, cái này chạy liên tục).
//   `_devTichLuy` chốt phần đã tăng tốc tới `_devMocThuc`, nên đổi hệ số KHÔNG làm giờ nhảy giật.
let _devHeSo = 1;                             // 1 = tốc độ thực
let _devMocThuc = Date.now();
let _devTichLuy = 0;
const _devThem = () => _devTichLuy + (Date.now() - _devMocThuc) * (_devHeSo - 1);
const now = () => Date.now() + _devNowOffset + _devThem();
// Helper toàn cục cho link 「gia bảo」 trong biên niên (x-html không gắn được @click Alpine) -> mở chi tiết món
if (typeof window !== 'undefined') window.tmShowItem = (id) => { try { const s = window.Alpine && window.Alpine.store('game'); if (s) s.openItemModal(id); } catch (e) {} };
let _lbBots = null, _lbBotKey = '';   // cache hàng bot BXH (module-level, non-reactive) — memo theo (seed:createdAt:phút)
let _nbData = null, _nbKey = '';      // cache Đồng Đạo Lân Cận theo (skill:phút)
let _tmbBots = null, _tmbKey = '';    // cache hàng bot TÔNG MÔN BẢNG theo (seed:createdAt:phút)
let _lvhBotsCache = null, _lvhBotsKey = '';   // cache đại biểu bot Luận Võ Hội (seed:createdAt:kỳ)
const LVH_PERIOD = 24 * 3600 * 1000;          // kỳ Luận Võ Hội = 24h (vòng tròn nội bộ re-roll mỗi kỳ)
const LVH_BOT_N = 60;                          // số đại biểu bot lên bảng
// Danh hiệu top-3 đệ tử (theo điểm vòng tròn nội bộ mỗi kỳ) — GIỮ khi còn top, +Uy nhẹ.
const LVH_TITLES = [{ name: 'Võ Khôi', color: '#f5b942', uy: 50 }, { name: 'Á Khôi', color: '#cbd5e1', uy: 30 }, { name: 'Thám Hoa', color: '#d97706', uy: 15 }];
// Pool tên tông môn bot (prefix × suffix -> hàng trăm tổ hợp, deterministic theo seed bot)
const TMB_PREFIX = ['Thanh Vân', 'Huyết Đao', 'Thiên Kiếm', 'Côn Lôn', 'Tiêu Dao', 'Vô Cực', 'Lạc Hà', 'Bạch Vân', 'Huyền Thiên', 'Cửu U', 'Tử Hà', 'Linh Tê', 'Phá Quân', 'Vạn Kiếm', 'Hàn Băng', 'Lưu Vân', 'Diệt Tuyệt', 'Thái Hư', 'Ngạo Thiên', 'Cô Nguyệt'];
const TMB_SUFFIX = ['Cốc', 'Môn', 'Phái', 'Tông', 'Sơn Trang', 'Các', 'Đường', 'Lĩnh', 'Cung', 'Đảo'];
const CYCLE_MS = COMBAT_CYCLE_MS; // 1 vòng giao chiến = 8s (nguồn chung votong.js); hết vòng mới hiện trọn chiến báo + kết quả
const BOSS_TURN_MS = 3000;        // Yêu Vương: lộ 1 lượt (frame) mỗi 3 giây khi xem live
// Chi phí Bạc học nghề theo BẬC (index = số nghề đã học). Leo thang mạnh (làm tròn).
const PROF_COST = [50000, 120000, 280000, 650000, 1500000, 3500000, 8000000, 20000000, 50000000, 120000000];
const PROF_LV_STEP = 80; // mỗi 80 Tổng Lv mở thêm 1 nghề
// Cổng Bảng Dev (F9): so HASH (FNV-1a) của mật khẩu — KHÔNG để plaintext trong source (repo deploy public).
// Đổi mật khẩu: chạy devHash('matkhaumoi') rồi thay DEV_PASS_HASH. (Gate client-side chặn người chơi thường; F12 vẫn lách được — đã rõ, chống cheat thật cần server.)
function devHash(s) { let h = 2166136261 >>> 0; const str = String(s); for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const DEV_PASS_HASH = 1011525020;   // hash mật khẩu Dev (KHÔNG ghi plaintext ở đây — repo deploy public)
// Dịch lỗi Auth Supabase (tiếng Anh) sang tiếng Việt cho các lỗi hay gặp.
function authErrVi(msg) {
  const m = (msg || '').toLowerCase();
  if (m.includes('invalid login')) return 'Sai email hoặc mật khẩu.';
  if (m.includes('already registered') || m.includes('already been registered') || m.includes('user already')) return 'Email này đã được đăng ký.';
  if (m.includes('email not confirmed')) return 'Email chưa xác nhận — mở hộp thư bấm xác nhận trước.';
  if (m.includes('password should be at least') || m.includes('at least 6')) return 'Mật khẩu quá ngắn (tối thiểu 6 ký tự).';
  if ((m.includes('email') && m.includes('invalid')) || m.includes('unable to validate email') || m.includes('invalid format')) return 'Email không hợp lệ (thử email thật, đừng dùng @example.com).';
  if (m.includes('rate limit') || m.includes('too many') || m.includes('for security purposes')) return 'Thao tác quá nhiều lần — đợi chút rồi thử lại.';
  return msg || 'Có lỗi xảy ra.';
}
// Dịch lỗi Cloud save (DB/RLS) sang tiếng Việt.
function cloudErrVi(msg) {
  const m = (msg || '').toLowerCase();
  // Chốt chống gian lận từ chối bản lưu (docs/SQL_CHONG_GIAN_LAN.sql). Nói thẳng cho người chơi
  // biết, đừng để họ tưởng đã đồng bộ xong — xem chú thích ở cloudPushSave.
  if (m === 'tu-choi') return 'Máy chủ từ chối bản lưu này vì tiến trình tăng quá nhanh. Nếu bạn chơi bình thường, hãy nhắn cho tác giả để được kiểm tra.';
  if (m.includes('does not exist') || m.includes('relation') || m.includes('schema cache')) return 'Chưa tạo bảng lưu trên cloud (chạy SQL khởi tạo).';
  if (m.includes('row-level security') || m.includes('rls') || m.includes('policy')) return 'Quyền cloud chưa đúng (kiểm tra RLS bảng saves).';
  if (m.includes('jwt') || m.includes('expired') || m.includes('not authenticated')) return 'Phiên hết hạn — đăng nhập lại.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Không kết nối được cloud (mạng?).';
  return 'Đồng bộ cloud lỗi: ' + (msg || 'không rõ');
}
// Ngày địa phương dạng YYYY-MM-DD (cho điểm danh)
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayStr = () => ymd(new Date());
const yestStr = () => ymd(new Date(Date.now() - 86400000));
// Neo TUẦN theo Thứ 2 (id = ymd của Thứ 2 trong tuần); THÁNG theo YYYY-MM.
function weekStr() {
  const d = new Date();
  const dow = (d.getDay() + 6) % 7; // 0=Thứ2 ... 6=Chủ Nhật
  const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow);
  return ymd(mon);
}
function monthStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }

// ---- Khởi tạo state + offline gains ----
let state = Storage.load() || createInitialState();
// lastSave NGAY LÚC NẠP từ đĩa (trước khi vòng game autosave bump) — mốc so sánh cloud đáng tin (xem cloudSyncOnLogin)
const _loadedLastSave = (state && state.lastSave) || 0;
if (!state.equipment) state.equipment = {};
if (!state.enhance) state.enhance = {};   // (legacy) cường hóa theo id — dời vào instance.plus ở migration dưới
if (!Array.isArray(state.gearBag)) state.gearBag = [];
// Migrate: PHỤ KIỆN SỰ KIỆN đổi từ CỜ trong save sang VẬT PHẨM trong túi (2026-08-08).
//   Bản cũ ghi state.suKien.phuKien[ma].boiSo = true. Bỏ trắng là ai đã mở được trong đợt chạy
//   thử mất sạch — đổi thẳng thành món trong gearBag rồi xoá cờ. Chạy đúng MỘT lần vì sau đó
//   không còn cờ nào.
if (state.suKien && state.suKien.phuKien && typeof state.suKien.phuKien === 'object') {
  for (const ma of Object.keys(state.suKien.phuKien)) {
    const c = state.suKien.phuKien[ma] || {};
    for (const khoa of ['boiSo', 'boiThuong', 'anSo', 'anThuong']) {
      if (!c[khoa]) continue;
      const loai = khoa.indexOf('boi') === 0 ? 'boi' : 'an';
      const bac = khoa.slice(-2) === 'So' ? 'so' : 'thuong';
      try { thaPhuKien(state, ma, loai, bac); } catch (e) {}
    }
  }
  state.suKien.phuKien = {};
}
// Migrate: slot trang bị đã bỏ (Quần/Phụ Khí/Bội Sức) -> trả món đang mặc về túi.
RETIRED_SLOTS.forEach((slot) => {
  const id = state.equipment[slot];
  if (id) { if (typeof id === 'string') state.inventory[id] = (state.inventory[id] || 0) + 1; else if (id.gearId) state.gearBag.push(id); }
  delete state.equipment[slot];
});
// MIGRATION LOOT-HUNT (idempotent): gear cũ (equipment id-string + inventory eq_*) -> instance.
//   Giữ NGUYÊN stat/phẩm catalog (instanceFromCatalog) để người đang chơi không đổi sức mạnh. plus lấy từ state.enhance cũ.
for (const slot in state.equipment) {
  const v = state.equipment[slot];
  if (typeof v === 'string') {
    state.equipment[slot] = instanceFromCatalog(v, (state.enhance && state.enhance[v]) || 0) || null;
  }
}
for (const id of Object.keys(state.inventory)) {
  if (ITEMS[id] && ITEMS[id].equip) {   // mọi món equippable (eq_* + legacy tichSao/thietKiem/tichGiap) -> instance
    const qty = state.inventory[id] || 0;
    for (let i = 0; i < qty; i++) { const inst = instanceFromCatalog(id, 0); if (inst) state.gearBag.push(inst); }
    delete state.inventory[id];
  }
}
// MIGRATION MÓN BỘ (idempotent): món bộ ghép TRƯỚC 2026-08-03 chỉ có 2 dòng cốt, không dòng roll
// -> kẹt yếu hơn đồ rời 46% vĩnh viễn. Bù cho chúng đúng phần roll mà bản mới có.
// ⚠ Nhận diện bằng "CÓ equip.set mà THIẾU rolls" — chạy một lần là có `rolls`, lần sau không lọt
// vào nữa. KHÔNG dùng cờ riêng trong save: cờ dễ mất khi nhập save cũ, còn dấu hiệu này tự mang.
// ⚠ Giữ nguyên `plus` và `uid` — người chơi đã cường hoá thì không được mất.
{
  const buSet = (inst) => {
    if (!inst || !inst.gearId) return inst;
    const e = ((ITEMS[inst.gearId] || {}).equip) || {};
    if (!e.set) return inst;                                  // chỉ món BỘ mới đụng tới
    if (!inst.rolls) {                                        // bản CŨ NHẤT: chưa có dòng roll -> bù hẳn
      const moi = rollSetPieceInstance(inst.gearId);
      if (!moi) return inst;
      moi.uid = inst.uid; moi.plus = inst.plus || 0;
      return moi;
    }
    // ⚠ Món ghép trong khoảng GIỮA hai lần sửa: ĐÃ có dòng roll (nên nhánh trên bỏ qua) nhưng
    // thứ tự vẫn của bản cũ — dòng cốt nằm lẫn giữa đám dòng roll. Xếp lại, KHÔNG roll lại
    // (roll lại là đổi chỉ số món người chơi đang mặc).
    const cot = Object.keys(e.stats || {});
    inst.setCore = cot;                                       // bản giữa có thể thiếu hẳn setCore
    const gop = {};
    for (const k of cot) if (inst.stats && k in inst.stats) gop[k] = inst.stats[k];
    for (const k in (inst.stats || {})) if (!(k in gop)) gop[k] = inst.stats[k];
    inst.stats = gop;
    return inst;
  };
  for (const slot in state.equipment) state.equipment[slot] = buSet(state.equipment[slot]);
  if (Array.isArray(state.gearBag)) state.gearBag = state.gearBag.map(buSet);
}
if (!state.login) state.login = { lastDay: null, streak: 0 };
if (!state.counters) state.counters = { produced: {}, kills: {} };
// Save cũ nạp thẳng JSON (không deep-merge) -> thiếu key nghề mới thêm. Vá để totalLevel (quét SKILLS)
// và engine/titles (quét state.skills) không đếm lệch nhau.
Object.keys(SKILLS).forEach((id) => { if (!state.skills[id]) state.skills[id] = { xp: 0 }; });
ensureBuffs(state);        // Đan Bổ Trợ: khởi tạo state.buffs
migrateDanSlots(state);    // save cũ chỉ có 1 ô cb.dan -> tách thành Hồi Sinh Lực / Hồi Nội Lực / Dược Lư
// ĐAN ĐIỀN: vá save CŨ. `createInitialState()` chỉ chạy cho nhân vật MỚI, nên mọi save có từ trước
// đợt này đều thiếu khoá `danDien` — bấm Giữ ở bảng Luyện là `state.danDien.luyen = {}` ném lỗi,
// im lặng, nút nhìn như chết. Vá ở đây, không cần bump SAVE_VERSION.
if (!state.danDien || typeof state.danDien !== 'object') state.danDien = {};
for (const nh of ['tinh', 'khi', 'than']) {
  if (!Array.isArray(state.danDien[nh])) state.danDien[nh] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
}
if (!state.danDien.luyen || typeof state.danDien.luyen !== 'object') state.danDien.luyen = { tinh: 0, khi: 0, than: 0 };
// Cài Đặt: đổ mặc định vào save cũ (giữ nguyên khoá người chơi đã đổi). Không cần bump SAVE_VERSION.
if (!state.settings || typeof state.settings !== 'object') state.settings = {};
for (const k of Object.keys(CAI_DAT_MAC_DINH)) if (state.settings[k] === undefined) state.settings[k] = CAI_DAT_MAC_DINH[k];
// Nền thẻ Linh Thú đã GỠ (2026-08-11) — dọn khoá cũ khỏi save cho sạch. Giữ dòng này vài tháng
// rồi bỏ; save của người chơi cũ vẫn còn `nenPet`/`_nenPetV3` nếu không dọn.
if (state.settings.nenPet !== undefined || state.settings._nenPetV3 !== undefined) {
  delete state.settings.nenPet; delete state.settings._nenPetV2; delete state.settings._nenPetV3;
}
// Bộ sinh số CÓ HẠT GIỐNG (Đợt D) — phải gieo TRƯỚC `advance()` offline ở dưới, không thì lượt
// tính bù đầu tiên sau khi cập nhật vẫn rơi vào đường Math.random cũ.
ensureRng(state);
ensureCodex(state); // Vạn Vật Phổ: khởi tạo + backfill tiến độ đã chơi (kills/obtained/pets/dungeon)
ensureTitles(state); syncTitles(state); // Danh Hiệu: khởi tạo + mở khoá theo tiến độ đã chơi (IM LẶNG khi load)
ensureTongMon(state, Date.now()); ensureDangTien(state); ensureKyTran(state); ensureNguTu(state); ensureCoTuong(state); ensureCoVua(state); ensureTienLen(state); ensureBinh(state); ensurePaoDeKuai(state); ensureTuuLau(state); ensureBangPhai(state);
// MÁY CHỦ CHUNG — phải chạy TRƯỚC mọi thứ đọc danh sách người giang hồ.
// Save cũ mang seed riêng thì đây là lúc nhập máy chủ chung; người của giang hồ riêng cũ (và
// người đã ẩn cư) bị gỡ khỏi Tiên Minh / đơn xin / giao tình, rồi báo NGƯỜI CHƠI một lần.
try {
  const _w = ensureWorld(state, Date.now());
  const _k = donNguoiAnCu(state, _w, Date.now());
  if (_k.roiMinh || _k.boDon || _k.quenCu) {
    pushNotif(state, 'tienMinh', 'Giang hồ đổi thay',
      'Từ nay mọi người chơi đứng chung một giang hồ.'
      + (_k.roiMinh ? ' <b>' + _k.roiMinh + '</b> minh chúng đã ẩn cư, rời khỏi Tiên Minh.' : '')
      + (_k.boDon ? ' <b>' + _k.boDon + '</b> đơn xin nhập minh không còn hiệu lực.' : '')
      + (_k.quenCu ? ' Giao tình với <b>' + _k.quenCu + '</b> người cũ đã phai.' : '')
      + ' Người mới sẽ lần lượt nhập giang hồ.', Date.now());
  }
} catch (e) {}
ensureLenhBai(state);      // Sự kiện: dựng ô đệm hai mốc thời gian. Save cũ chưa có ô này.
ensureSuKien(state);       // Sự kiện: Điểm + phụ kiện + sổ đã-mua
ensureNgoCanh(state);      // Đốn Ngộ Cảnh: sổ Trùng Sinh + bậc từng nút, theo từng nghề
try { donSuKien(state, Date.now()); } catch (e) {}   // sự kiện đã đóng -> vật phẩm bốc hơi, người về làng (mốc đệm trong save, chạy được cả offline)
ensureKyHon(state);        // Kỳ Hồn CHUNG (mọi bàn cờ) — PHẢI sau các ensure trên để gộp được số của save cũ
ensureGocNhin(state);      // Góc nhìn bàn cờ đã khoá (null = mỗi bàn tự canh)
ensureDongPhu(state); resolveDongPhu(state, Date.now());   // Động Phủ: khởi tạo + hoàn công job xong TRƯỚC advance offline & simTongMon (trần treo nhà áp cho cả khoảng vắng)
try { simTongMon(state, Date.now(), idleCapMs(state) / 3600000); } catch (e) {} // Tông Môn (nhánh phụ): khởi tạo + tu luyện/sản lượng OFFLINE (cap = trần treo gồm bonus nhà)
if (!state.quests) state.quests = { tutorial: { index: 0, base: 0 }, daily: { period: null, list: [] }, weekly: { period: null, list: [] }, monthly: { period: null, list: [] } };
if (!state.quests.tutorial) state.quests.tutorial = { index: 0, base: 0 };
if (!state.quests.daily) state.quests.daily = { period: null, list: [] };
if (!state.quests.weekly) state.quests.weekly = { period: null, list: [] };
if (!state.quests.monthly) state.quests.monthly = { period: null, list: [] };
if (!state.linhThach) state.linhThach = {};
if (!state.combat) state.combat = { sinhLuc: null, noiThuong: false, suyYeuUntil: 0, loadout: { tamPhap: 'viemDuong', boPhap: ['tanToc'], chieu: ['lhd', 'htd', 'ptd'] } };
if (state.combat.petHp === undefined) { state.combat.petHp = null; state.combat.petFainted = false; } // Linh Thú P4: HP pet + ngất (per phiên)
if (!state.combat.loadout) state.combat.loadout = { tamPhap: 'viemDuong', boPhap: ['tanToc'], chieu: ['lhd', 'htd', 'ptd'] };
if (typeof state.combat.loadout.boPhap === 'string') state.combat.loadout.boPhap = [state.combat.loadout.boPhap]; // cũ: 1 chuỗi -> mảng
if (!Array.isArray(state.combat.loadout.boPhap) || !state.combat.loadout.boPhap.length) state.combat.loadout.boPhap = ['tanToc'];
// Tâm Pháp (Bước 4): trường mới — đổi được, mặc định Viêm Dương (Hỏa)
if (!state.combat.loadout.tamPhap || !TAM_PHAP_POOL.some((t) => t.id === state.combat.loadout.tamPhap)) state.combat.loadout.tamPhap = 'viemDuong';
// Bị Động: pool chọn tối đa 2 — trường mới, mặc định +ST Hỏa + hồi máu
if (!Array.isArray(state.combat.loadout.biDong)) state.combat.loadout.biDong = ['viemDuongHoThe', 'sinhSinhBatTuc'];
state.combat.loadout.biDong = normBiDong(state.combat.loadout);
// Số ô chiêu mở theo Chiến Đấu Lv (4 ô gồm Tâm Pháp, +1 mỗi 30 cấp) — clamp loadout cũ (có thể 4 chiêu) xuống số ô hiện có
if (!Array.isArray(state.combat.loadout.chieu)) state.combat.loadout.chieu = ['lhd', 'htd', 'ptd']; // guard save hỏng/thiếu -> tránh crash combat (chosen.map)
if (Array.isArray(state.combat.loadout.chieu)) {
  const _cl = levelFromXp(state.skills?.chienDau?.xp || 0);
  state.combat.loadout.chieu = state.combat.loadout.chieu.slice(0, maxChieuSlots(_cl));
}
// Sở hữu võ học (Bước 6): trường mới — vá save cũ bằng cách cấp sở hữu cho mọi thứ ĐANG lắp + bộ nhập môn.
state.combat.owned = normOwned(state.combat);
if (state.combat.suyYeuUntil == null) state.combat.suyYeuUntil = 0;
// Tầng chiêu (Ngộ Tính) — trường mới, vá save cũ. KHÔNG bump SAVE_VERSION: thiếu key = Tầng 1, vô hại.
if (!state.combat.tang || typeof state.combat.tang !== 'object') state.combat.tang = {};
if (state.combat.ngoTinhThuong == null) state.combat.ngoTinhThuong = 0;
// Ô Món Ăn + Ô Đan (tự dùng khi < 25%) — trường mới, vá save cũ
if (state.combat.luongThuc === undefined) state.combat.luongThuc = null;
if (state.combat.dan === undefined) state.combat.dan = null;
if (state.combat.noiLuc === undefined) state.combat.noiLuc = null;
// Combat đang chạy dở từ save cũ: ép cadence về vòng 8s (trước đây = timePerKill nhảy theo giây)
if (state.activity && state.activity.type === 'combat') state.activity.cycleMs = COMBAT_CYCLE_MS;
if (!state.player || typeof state.player !== 'object') state.player = { name: '', gender: null, class: null, professions: [], doPho: {}, cover: { x: 50, y: 50, z: 1 }, face: { x: 50, y: 50, z: 1 }, created: false, location: 'lamLinhCoc' }; // guard save hỏng/thiếu player -> tránh crash đọc player.*
if (!state.player.location) state.player.location = 'lamLinhCoc';
if (typeof state.player.bio !== 'string') state.player.bio = ''; // tiểu sử (≤250 ký tự)
if (state.player.gender === undefined) state.player.gender = null; // giang hồ tự do: chỉ Nam/Nữ
state.player.class = null; // bỏ class — giang hồ tự do
if (!Array.isArray(state.player.professions)) state.player.professions = []; // Nghề đã học (bái sư)
if (Array.isArray(state.player.doPho)) { const _m = {}; state.player.doPho.forEach((gid) => { _m[gid] = 99; }); state.player.doPho = _m; } // save cũ (mảng = unlock VĨNH VIỄN) -> cấp 99 lượt rèn, không thiệt người chơi cũ
if (!state.player.doPho || typeof state.player.doPho !== 'object') state.player.doPho = {}; // Đồ Phổ: { gearId: số lượt rèn còn lại } (mỗi lượt rèn 1 món)
if (!state.player.cover) state.player.cover = { x: 50, y: 50, z: 1 };
if (!state.player.face) state.player.face = { x: 50, y: 50, z: 1 };
if (state.player.fxVer !== 3) { state.player.cover = { x: 50, y: 50, z: 1 }; state.player.face = { x: 50, y: 50, z: 1 }; state.player.fxVer = 3; } // đổi hệ khung -> background-position
if (!Array.isArray(state.player.ownedAvatars)) state.player.ownedAvatars = []; // Ảnh Đại Diện đã mua (Thương Điếm); free = ảnh theo giới tính
if (!Array.isArray(state.player.ownedCovers)) state.player.ownedCovers = [];   // Ảnh Bìa đã mua
if (state.player.avatar && !state.player.ownedAvatars.includes(state.player.avatar)) state.player.ownedAvatars.push(state.player.avatar); // giữ ảnh đang dùng của save cũ
if (state.player.coverImg && !state.player.ownedCovers.includes(state.player.coverImg)) state.player.ownedCovers.push(state.player.coverImg);
if (!Array.isArray(state.player.badges)) state.player.badges = [];   // Huy Hiệu đeo (tối đa 3) — hiển thị góc banner Hồ Sơ
if (typeof state.player.badgeSize !== 'number') state.player.badgeSize = 48;   // cỡ huy hiệu góc banner (px) — chỉnh ở Dung Mạo
if (!state.player.badgeFx || typeof state.player.badgeFx !== 'object') state.player.badgeFx = {};   // hiệu ứng riêng từng huy hiệu (skillId -> fx)
if (state.travel) state.travel = null; // bỏ field cũ (Khinh Công giờ là activity 'travel')
if (!state.dungeon) state.dungeon = { lastResult: null, history: [] }; // Bí Cảnh: kết quả lần chạy gần nhất + lịch sử
if (!Array.isArray(state.notifications)) state.notifications = []; // Thông Báo (feed chung: chuông + Phi Cáp Đài)
if (!Array.isArray(state.pets)) state.pets = []; // Linh Thú (pet) — nở từ trứng
// Giá Trưng Bày ở Hồ Sơ: BẢY ô cố định, ô trống là `null`. Mỗi ô giữ THAM CHIẾU {k,ref}
// chứ không giữ bản sao — bán hay thả mất thì ô tự trống, giá không khoe món đã không còn.
if (!Array.isArray(state.trungBay)) state.trungBay = [];
state.trungBay.length = 7;
for (let i = 0; i < 7; i++) if (!state.trungBay[i] || !state.trungBay[i].k) state.trungBay[i] = null;
if (state.hatchery === undefined) state.hatchery = null; // Lò Ấp Noãn (P3, đơn): {pet,base,eggId,eggQuality,startedAt,readyAt,durMs,notified} | null
if (state.damDao === undefined) state.damDao = {}; // Đàm Đạo: { <skillId>: [<chapterId đã đọc xong>] } — chỉ để đánh dấu đã đọc + badge chương mới
// Tháo trang bị VƯỢT CẤP (combatLevel tụt do dev/sửa save) -> trả về túi, không cho hưởng chỉ số lậu
(() => {
  const _cl = levelFromXp(state.skills?.chienDau?.xp || 0);
  for (const slot in (state.equipment || {})) {
    const inst = state.equipment[slot]; if (!inst) continue;
    const e = (ITEMS[inst.gearId] || {}).equip;
    const lvl = (e && e.gatherSkill) ? capKyNang(state, e.gatherSkill) : _cl;   // công cụ: cấp NGHỀ, theo trần của nghề đó
    const req = inst.reqLevel || (e && e.reqLevel) || 0;
    if (req > 1 && lvl < req) { state.gearBag.push(inst); state.equipment[slot] = null; }   // trả instance về túi
  }
})();
// Giữ kết quả HỢP LỆ: 1 lượt (có log) HOẶC Lịch Luyện gộp (có runs). Chỉ bỏ format cực cũ thiếu cả hai.
if (state.dungeon.lastResult && !state.dungeon.lastResult.log && !state.dungeon.lastResult.runs) state.dungeon.lastResult = null;
if (Array.isArray(state.dungeon.history)) state.dungeon.history = state.dungeon.history.filter((h) => h && (h.log || h.runs));
// Save CŨ đang treo phó bản (mode/cycleMs, chưa có durMs/runs) -> chuyển thành Lịch Luyện 1 lượt để không kẹt hoạt động.
if (state.activity && state.activity.type === 'dungeon' && state.activity.durMs == null) {
  state.activity.durMs = state.activity.cycleMs || (DUNGEON_BY_ID[state.activity.dungeonId] || {}).durMs || 60000;
  state.activity.runs = 1;
}
let offlineReport = null;
if (state.activity) {
  const _awayMs = Math.max(0, now() - (state.activity.lastResolved || now()));
  const r = advance(state, now());
  if (r && r.cycles > 0) offlineReport = { ...r, awayMs: _awayMs };
  if (r && r.cycles > 0 && r.itemId) { pushNotif(state, 'thuThap', 'Thu thập hoàn tất', '+' + r.cycles + ' ' + itemNameHtml(r.itemId) + ' · +' + r.xp + ' EXP (trong lúc vắng mặt)', now()); }
  if (r && r.ranOut) { const _it = ITEMS[r.itemId]; pushNotif(state, 'thuThap', 'Hết nguyên liệu', 'Đã dừng ' + (_it ? _it.name : 'chế tác') + ' — thu thập/mua thêm nguyên liệu rồi luyện tiếp.', now()); }
  if (r && r.type === 'combat' && r.died && r.sess) { const _e = ENEMIES[r.enemyId]; const _s = r.sess; const _lt = dropListText(Object.keys(_s.loot || {}).map((id) => ({ id, n: _s.loot[id] })), _s.gearN || 0); pushNotif(state, 'chienDau', 'Trọng thương khi vắng mặt', 'Gục trước ' + (_e ? _e.name : 'yêu thú') + ' — cả phiên hạ ' + (_s.win || 0) + ' · +' + (_s.xp || 0).toLocaleString('vi-VN') + ' EXP · +' + (_s.bac || 0).toLocaleString('vi-VN') + ' Bạc' + (_lt ? ' · Nhận: ' + _lt : '') + '.', now()); }
}
// Lò Ấp Noãn: trứng nở xong trong lúc vắng mặt -> báo 1 lần (chờ khai noãn).
if (state.hatchery && now() >= state.hatchery.readyAt && !state.hatchery.notified) {
  state.hatchery.notified = true;
  const _sp = PET_SPECIES[state.hatchery.base];
  pushNotif(state, 'linhThu', 'Noãn đã nở', (_sp ? _sp.name : 'Linh thú') + ' phá vỏ — vào Linh Thú khai noãn.', now());
}

// ---- Helper định dạng ----
function fmt(n) {
  n = Math.floor(n || 0);
  const neg = n < 0;
  // Số đầy đủ, tách hàng nghìn bằng dấu chấm (kiểu Việt Nam): 1250000 -> "1.250.000"
  const s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return neg ? '-' + s : s;
}
// Rút gọn cho chỗ chật (header tiền tệ) — HỆ ĐẾM HÁN: <1 Vạn giữ nguyên; rồi Vạn(10^4)/Ức(10^8)/Triệu(10^12).
// Vd: 9999->"9.999" · 50000->"5Vạn" · 1150000->"115Vạn" · 2.5e8->"2,5Ức" · 5e12->"5Triệu".
function fmtC(n) {
  n = Math.floor(n || 0);
  const neg = n < 0, a = Math.abs(n);
  const trim = x => (x < 100 ? (Math.round(x * 10) / 10).toString().replace('.', ',') : Math.round(x).toString());
  let out;
  if (a < 1e4) out = fmt(a);
  else if (a < 1e8) out = trim(a / 1e4) + 'Vạn';
  else if (a < 1e12) out = trim(a / 1e8) + 'Ức';
  else out = trim(a / 1e12) + 'Triệu';
  return neg ? '-' + out : out;
}
function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}
// Thời lượng kiểu "giờ phút" (KHÔNG giây), làm tròn tới phút — đồng bộ hiển thị Bí Cảnh (mode + đếm ngược).
function fmtDurHM(sec) {
  const totalMin = Math.max(0, Math.round(sec / 60));
  const h = Math.floor(totalMin / 60), m = totalMin % 60;
  if (h > 0) return m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`;
  if (m > 0) return `${m} phút`;
  return 'dưới 1 phút';
}
// Đếm ngược CÓ GIÂY (đồng hồ sống động) — dùng cho "còn X" Bí Cảnh, đồng bộ mọi chỗ đếm ngược.
function fmtDurHMS(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h > 0) return `${h} giờ ${m} phút ${s} giây`;
  if (m > 0) return `${m} phút ${s} giây`;
  return `${s} giây`;
}
// Liệt kê cụ thể đồ nhận trong 1 phiên (cho thông báo / Phi Cáp Đài). loot: [{id,n}] · gearN: số trang bị.
function dropListText(loot, gearN) {
  const parts = (loot || []).map((l) => itemNameHtml(l.id) + ' ×' + l.n);
  if (gearN > 0) parts.push(gearN + ' trang bị');
  if (!parts.length) return '';
  if (parts.length > 8) return parts.slice(0, 8).join(', ') + ' … +' + (parts.length - 8) + ' loại';
  return parts.join(', ');
}
function fmtClock(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const p = (x) => String(x).padStart(2, '0');
  return `${p(h)}:${p(m)}:${p(s)}`;
}

// ---- groupsOpen mặc định: mở hết, TRỪ nhóm khai báo `thuGon` trong data/nav.js ----
// Không lưu vào save: mở ra rồi tải lại trang thì nhóm `thuGon` gấp lại như cũ,
// đúng ý "luôn ở trạng thái thu gọn, chỉ mở khi người chơi bấm".
const groupsOpen = {};
NAV.forEach((g) => { groupsOpen[g.title] = !g.thuGon; });

// ---- Các view CHƯA dựng: đúng những mục gắn `soon: true` trong data/nav.js ----
// Chỉ những view này mới thay bằng trang giữ chỗ "Đang hoàn thiện".
const SOON_VIEWS = new Set();
NAV.forEach((g) => (g.items || []).forEach((it) => { if (it.soon) SOON_VIEWS.add(it.view); }));

// ---- View có #link riêng: mọi mục trong data/nav.js, cộng trang kỹ năng ----
// Suy thẳng từ NAV nên thêm tab mới là có link ngay, không phải nhớ sửa thêm chỗ này.
const ROUTE_VIEWS = ['skill', ...NAV.flatMap((g) => (g.items || []).map((it) => it.view))];

// ---- Bản đồ icon: id -> thư mục ảnh (ico() tự tìm đúng folder, không cần sửa chỗ gọi) ----
const ICON_FOLDERS = {};
Object.keys(ITEMS).forEach((id) => { ICON_FOLDERS[id] = 'items'; });
Object.keys(SKILLS).forEach((id) => { ICON_FOLDERS[id] = 'skills'; });
Object.keys(ENEMIES).forEach((id) => { ICON_FOLDERS[id] = 'enemies'; });
Object.keys(CLASSES).forEach((id) => { ICON_FOLDERS[id] = 'classes'; });
NGHE.forEach((n) => { ICON_FOLDERS[n.id] = 'nghe'; }); // nghề: images/nghe/<id>.png (ghi đè id trùng class)
Object.keys(STATS).forEach((id) => { ICON_FOLDERS[id] = 'stats'; });
LOCATIONS.forEach((l) => { ICON_FOLDERS[l.id] = 'locations'; });
REALM_TIERS.forEach((t) => { ICON_FOLDERS[t.id] = 'tiers'; });
NAV.forEach((g) => (g.items || []).forEach((it) => { ICON_FOLDERS[it.view] = 'nav'; }));
ICON_FOLDERS['phongVanBang'] = 'ui';   // GHI ĐÈ SAU NAV: icon BXH ở images/ui/phongVanBang.webp (cùng chỗ banner)
['bac', 'honThach', 'nguyenBao'].forEach((id) => { ICON_FOLDERS[id] = 'currency'; });
if (MERCHANT && MERCHANT.id) ICON_FOLDERS[MERCHANT.id] = 'npc';
// Trang bị thật (id bắt đầu 'eq_') -> art ở images/equip/<id>.png (tách khỏi vật phẩm thường).
Object.keys(ITEMS).forEach((id) => { if (id.startsWith('eq_')) ICON_FOLDERS[id] = 'equip'; });
DUNGEONS.forEach((d) => { ICON_FOLDERS[d.id] = 'dungeons'; }); // art phó bản Bí Cảnh: images/dungeons/<id>.png
// Art sự kiện KHÔNG nằm trong bảng nào ở trên -> phải ghi danh tay, không thì ico() rơi về 'items'.
SU_KIEN_ART_PHU_KIEN.forEach((id) => { ICON_FOLDERS[id] = 'equip'; });   // 24 phụ kiện Bội/Ấn
ICON_FOLDERS['diemSuKien'] = 'currency';                                 // tiền chung của mọi sự kiện
ICON_FOLDERS['dauSuKien'] = 'ui';                                        // dấu trên bản đồ thế giới
SU_KIEN_DS.forEach((s) => { s.avatar.forEach((id) => { ICON_FOLDERS[id] = 'avatars'; }); ICON_FOLDERS[s.cover] = 'avatars'; });

// ============================================================
// ẢNH BÌA CẢNH — bìa lấy từ kho ảnh Bí Cảnh thay vì kho ảnh đại diện
// ============================================================
// ⚠ Nhân vật mới TRƯỚC ĐÂY có bìa trùng y hệt ảnh đại diện (`coverImg` bỏ trống = "Giống Avatar"),
//   nhìn ra một tấm ảnh dán hai lần trên cùng một trang.
// ⚠ Art MƯỢN: chưa vẽ ảnh bìa riêng. Mượn cảnh Thanh Vân Cốc — cảnh bình minh, KHÔNG có nhân vật
//   nên không đá nhau với ô mặt. Vẽ được ảnh thật thì đổi đúng một dòng dưới đây.
const BIA_CANH_TIEN_TO = 'canh:';
const BIA_MAC_DINH = BIA_CANH_TIEN_TO + 'thanhVanCoc';
const laBiaCanh = (id) => typeof id === 'string' && id.startsWith(BIA_CANH_TIEN_TO);
const idBiaCanh = (id) => id.slice(BIA_CANH_TIEN_TO.length);

let resetting = false; // chặn beforeunload lưu lại khi đang reset

// ---- Icon đường nét (SVG, đồng bộ chủ đề; thay emoji "rác" của hệ thống) ----
const SVG_PATHS = {
  pin:    '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  heart:  '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.49 4.04 3 5.5l7 7z"/>',
  zap:    '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  map:    '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14"/><path d="M15 6v14"/>',
  bag:    '<path d="M6 2 3 6.5V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.5L18 2z"/><path d="M3 6.5h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  collect:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
  sword:  '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/>',
  scope:  '<circle cx="12" cy="12" r="9"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/><circle cx="12" cy="12" r="2"/>',
  clock:  '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  crack:  '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.49 4.04 3 5.5l7 7z"/><path d="M12 5 9.5 9.5l3 2.5-2 4"/>',
  scroll: '<path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8 12.5h8"/><path d="M8 16.5h6"/>',
  steps:  '<path d="M4 16v-2.4C4 11.5 3 10.5 3 8c0-2.7 1.5-6 4.5-6C9.4 2 10 3.8 10 5.5c0 3.1-2 5.7-2 8.7V16a2 2 0 1 1-4 0z"/><path d="M20 20v-2.4c0-2.1 1-3.1 1-5.6 0-2.7-1.5-6-4.5-6C14.6 6 14 7.8 14 9.5c0 3.1 2 5.7 2 8.7V20a2 2 0 1 0 4 0z"/>',
  home:   '<path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
  // Biểu trưng từng Bộ Pháp
  shield: '<path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5z"/>',
  flame:  '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  wind:   '<path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/><path d="M17.7 7.7A2.5 2.5 0 1 1 19.5 12H2"/>',
  scales: '<path d="M12 3v18"/><path d="M5 7h14"/><path d="M5 7l-3 6a3 3 0 0 0 6 0z"/><path d="M19 7l-3 6a3 3 0 0 0 6 0z"/><path d="M8 21h8"/>',
  inbox:  '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  gate:   '<path d="M3 21V9l9-5 9 5v12"/><path d="M3 9h18"/><path d="M8 21v-6a4 4 0 0 1 8 0v6"/>',
  bulb:   '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.5.5 1 1.5 1 2.5h6c0-1 .5-2 1-2.5A6 6 0 0 0 12 3z"/>',
  star:   '<path d="M12 2.5l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.2 5.8 20.8l1.6-6.8L2.2 9.4l6.9-.6z"/>',
  coin:   '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/>',
  trend:  '<path d="M3 17l6-6 4 4 7-7"/><path d="M14 7h7v7"/>',
  chevR:  '<path d="M9 6l6 6-6 6"/>',
  // Ngũ hành (line-icon tối giản)
  kim:    '<path d="M12 2l9 7-9 13L3 9z"/><path d="M3 9h18"/>',
  moc:    '<path d="M12 21V9"/><path d="M12 9C12 5 9 3 5 3c0 4 3 6 7 6z"/><path d="M12 12c0-3 3-5 7-5 0 4-3 5-7 5z"/>',
  thuy:   '<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>',
  tho:    '<path d="M3 20h18"/><path d="M5 20l5-9 3 5 2-3 4 7z"/>',
  lock:   '<rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  book:   '<path d="M4 4.5A2 2 0 0 1 6 3h13v16H6a2 2 0 0 0-2 2z"/><path d="M19 19H6a2 2 0 0 0-2 2"/>',
  gem:    '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20"/><path d="M9 3 6 9l6 12 6-12-3-6"/>',
  info:   '<circle cx="12" cy="12" r="9"/><path d="M12 11.5v5"/><path d="M12 8h.01"/>',
  // Lịch: Ngày (1 chấm) · Tuần (1 hàng) · Tháng (lưới chấm) — line-icon đồng bộ với nav
  calDay:   '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M12 14.5h.01"/>',
  calWeek:  '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M7 14.5h10"/>',
  calMonth: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M7.5 13h.01M12 13h.01M16.5 13h.01M7.5 16.5h.01M12 16.5h.01M16.5 16.5h.01"/>',
  // ---- bổ sung: thay cho emoji chrome ----
  warn:   '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  gear:   '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  cloud:  '<path d="M6.5 19A4.5 4.5 0 0 1 6 10.1 6 6 0 0 1 17.7 9 4.5 4.5 0 0 1 17.5 19z"/>',
  trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H5a2 2 0 0 1-2-2h4"/><path d="M17 6h2a2 2 0 0 0 2-2h-4"/><path d="M12 14v4"/><path d="M8.5 21h7"/>',
  gift:   '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M4.5 12v7.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V12"/><path d="M12 8H8a2.5 2.5 0 0 1 0-5c3 0 4 5 4 5z"/><path d="M12 8h4a2.5 2.5 0 0 0 0-5c-3 0-4 5-4 5z"/>',
  clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M8 11h8M8 15h5"/>',
  hammer: '<path d="M15 12l-8.373 8.373a1 1 0 1 1-3-3L12 9"/><path d="M18 15l4-4"/><path d="M21.5 11.5 19.586 9.586A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8a2 2 0 0 1-1.5 1.5"/>',
  xcircle: '<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>',
  check:  '<path d="M5 12.5 10 17.5 19 6.5"/>',
  nguoi:  '<path d="M19 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-5A4.5 4.5 0 0 0 5 19.5V21"/><circle cx="12" cy="7.5" r="4"/>',
};

// ---- Store game ----
const gameStore = {
  state,
  SKILLS, STATS, ITEMS, QUALITY, ITEM_TYPES, LOCATIONS, REALM_TIERS, AVATARS, COVERS, LOGIN_REWARDS, TUTORIAL_QUESTS, DAILY_QUESTS, NAV,
  EQUIP_SLOTS, TOOL_SLOTS, SECONDARY_STATS, CLASSES, CLASS_GROUPS, NGHE, ENEMIES, STANCES, MERCHANT, SHOP_MAT, SHOP_FOOD, SHOP_BAIT, AVATAR_PRICE, COVER_PRICE, LINH_THACH,
  CHIEU, BO_PHAP, BI_DONG, TAM_PHAP, TAM_PHAP_POOL, NGU_HANH, NGU_HANH_LIST, MON_PHAI, DUNGEONS, DUNGEON_BY_ID,
  KHANG_CAP, KHANG_TU_HE,
  view: 'profile',
  profileTab: 'profile',
  codexTab: 'yeuthu', codexDetail: null,   // Vạn Vật Phổ
  bachTrangOpen: false,                    // modal Bách Trang Các (ghép Bộ Trang)
  confirmReset: false,
  lightbox: null,
  toast: '',
  _toastId: 0,
  lootFloats: [],   // vật phẩm vừa thu được (online) — bay lên rồi tan
  _lootId: 0,
  settingsModal: false,
  navOpen: false,           // ngăn kéo sidebar (drawer) trên mobile/màn hẹp
  dailyModal: false,
  devPanel: false,
  devAuthed: false, devLoginOpen: false, devPass: '', devLoginErr: '', devTab: 'char',   // cổng đăng nhập F9 (theo phiên — reload phải đăng nhập lại)
  // Tài khoản / Cloud (Supabase Auth — Giai đoạn B). Offline-first: KHÔNG đăng nhập vẫn chơi.
  authUser: null, authOpen: false, authMode: 'login', authEmail: '', authPass: '', authErr: '', authMsg: '', authBusy: false,
  // Cloud save (Giai đoạn C) — đồng bộ save ↔ Supabase. cloudConflict = { cloud, local, _cloudData } khi 2 bản lệch.
  cloudSyncing: false, cloudLastSync: 0, cloudErr: '', cloudConflict: null, _cloudLastPushed: -1,
  devLvInput: 50,
  devItemSel: null,
  selectedSkill: 'phatMoc',
  draftName: '',
  draftGender: null,
  draftTamPhap: null,        // Tâm Pháp khởi tu (chọn lúc tạo nhân vật) — quyết định hệ ngũ hành khởi đầu
  groupsOpen,
  offlineReport,
  fmt, fmtC, fmtTime, fmtDurHM, fmtDurHMS, fmtClock,

  // ---------- Điều hướng ----------
  _teleReturnView: null,   // Đổi vùng từ 1 tab -> nhớ tab đó để tự quay lại sau khi Truyền Tống/Khinh Công tới nơi
  openZoneChange() { this._teleReturnView = this.view; this.navTo('map'); },   // combat bấm "Đổi vùng"
  navTo(view) { if (view !== 'map') this._teleReturnView = null; this._applyView(view); this._pushHash('#' + view); },
  _ntkOpp: null,
  openNguTu(id) { this._ntkOpp = id || null; this.navTo('nguTuKy'); },   // deep-link Ngũ Tử Kỳ từ Hồ Sơ Danh Sĩ
  _ctOpp: null,
  openCoTuong(id) { this._ctOpp = id || null; this.navTo('coTuong'); },  // deep-link Cờ Tướng từ Hồ Sơ Danh Sĩ
  _cvOpp: null,
  openCoVua(id) { this._cvOpp = id || null; this.navTo('coVua'); },      // deep-link Cờ Vua từ Hồ Sơ Danh Sĩ
  _applyView(view) { this.view = view; this.navOpen = false; this._closeAllModalsForNav(); if (view !== 'inventory') { this.hlChon = false; this.hlSel = {}; } if (view === 'nhiemVu') this.ensureQuests(); if (view === 'combat' || view === 'worldboss') this.ensureCombat(); if (view === 'dungeon') this.ensureDungeon(); if (view === 'phongVanBang') this.taiNguoiThat(); if (view === 'tongmon') this.tmTick(); if (view === 'dongPhu') { try { resolveDongPhu(this.state, now()); if (this.state.dongPhu) this.state.dongPhu.doneUnseen = false; } catch (e) {} } document.getElementById('mainPane')?.scrollTo({ top: 0 }); },
  // ---------- Hash routing: mỗi tab 1 #link (chia sẻ/bookmark/F5 giữ tab); vuốt-back về tab trước thay vì thoát web ----------
  _ROUTE_VIEWS: ROUTE_VIEWS,
  _pushHash(h) { try { if (location.hash !== h) history.pushState({ h }, '', h); } catch (e) {} },
  applyHashRoute() {   // đọc URL hash -> đổi view (KHÔNG push lại, tránh lặp). Gọi khi popstate (back/forward).
    const h = location.hash || '';
    if (h.indexOf('#skill=') === 0) { const id = decodeURIComponent(h.slice(7)); if (this.SKILLS && this.SKILLS[id]) { this._applySkill(id); return; } }
    let v = h.replace(/^#/, '');
    if (!this._ROUTE_VIEWS.includes(v)) v = 'profile';
    this._applyView(v);
  },
  initRoute() {   // lúc tải: mở đúng tab theo #link sẵn có, hoặc lập baseline #<view hiện tại>
    if (location.hash) this.applyHashRoute();
    else { try { history.replaceState({ h: '#' + this.view }, '', '#' + this.view); } catch (e) {} }
  },

  // ---------- MODAL + HISTORY (TẬP TRUNG, reactive) — vuốt-back ĐÓNG modal đang mở, KHÔNG lùi tab -----
  // App dùng hash-routing (mỗi tab 1 #view; popstate -> applyHashRoute). Một Alpine effect (initModalHistory)
  // theo dõi MỌI cờ trong _MODALS:
  //   • Modal MỞ (cờ ->true) -> tự đẩy 1 entry history (cùng hash).
  //   • Vuốt-back (popstate) -> _modalBack() đóng modal TOP + return (KHÔNG route tab).
  //   • Đóng bằng X/nền/Esc (cờ ->false qua handler SẴN CÓ) -> effect thấy -> tự history.back() nuốt entry
  //     thừa (guard _mGuard chống lặp). => KHÔNG cần đụng markup của từng modal.
  //   • Rời tab (_applyView) đóng modal đang mở + XOÁ _mstack cùng lúc -> reconcile thành no-op (không undo nav).
  // THÊM MODAL MỚI: nhét tên cờ (boolean, đóng=set false) hoặc ['cờ','closeMethod'] (ref) vào _MODALS. HẾT.
  // CỜ đọc `this[cờ]` truthy = đang mở (dùng được cả boolean lẫn getter/ref như dsProfile/petDetailObj).
  _MODALS: [
    'statOpen', 'bachTrangOpen', 'settingsModal', 'camNangOpen', 'timOpen', 'truMaOpen', 'hieuUngOpen', 'thongKeOpen', 'huntTrackOpen', 'bioModal', 'tamPhapModal',
    'boPhapModal', 'baiVoModal', 'shopOpen', 'soSachOpen', 'gioiLuatOpen', 'luanVoOpen', 'daiKhachOpen',
    'tangThuOpen', 'bkMergeOpen', 'giftOpen', 'dailyModal', 'foodPicker', 'danPicker', 'duocLuPicker',
    'phucDungPicker', 'toSuOpen', 'tmEvtOpen', 'tmRecruitOpen', 'tmBagOpen', 'tmCraftOpen', 'tmDuocOpen', 'tmRealmGuideOpen',
    ['muaModal', 'closeMua'],
    ['itemModal', 'closeItemModal'], ['equipModal', 'closeEquip'], ['enhanceModal', 'closeEnhance'],
    ['locationModal', 'closeLocation'], ['combatModal', 'closeCombatModal'], ['dsProfile', 'closeDanhSi'],
    ['petDetailObj', 'closePetDetail'], ['tkDetail', 'closeTkDetail'], ['tkCraft', 'closeTkCraft'],
    ['codexDetail', 'closeCodex'], ['dungeonPoolId', 'closeDungeonPool'], ['bkPoolId', 'closeBkPool'], ['tpDetail', 'closeTpDetail'],
    ['lightbox', 'closeLightbox'], ['tmFaceFull', 'closeFaceFull'], ['xacNhan', 'dongXacNhan'],
    ['bpHoSo', 'closeBpHoSo'], ['bpCongTrinh', 'closeBpCongTrinh'],
    // ⚠ Bảng chọn Trưng Bày phải đăng ký bằng `tbChonMo` chứ KHÔNG phải `tbChon`:
    //   ô thứ nhất có số hiệu 0, mà 0 là giá trị giả — đăng ký thẳng thì vuốt-back
    //   ở đúng ô đầu tiên lại lùi cả tab thay vì đóng bảng.
    ['tbChonMo', 'tbDong'],
    ['hoSoKhachMo', 'dongHoSoKhach'], ['gsMo', 'dongGiamSat'], ['lbMo', 'dongLenhBai'], ['mqMo', 'dongMaQua'],
  ],
  _mstack: [], _mGuard: 0,
  _mKey(m) { return typeof m === 'string' ? m : m[0]; },
  _mClose(m) { if (typeof m === 'string') { this[m] = false; } else if (typeof this[m[1]] === 'function') { this[m[1]](); } else { this[m[0]] = false; } },
  initModalHistory() {
    const A = window.Alpine; if (!A || !A.effect) return;
    A.effect(() => {
      const openKeys = this._MODALS.filter((m) => !!this[this._mKey(m)]).map((m) => this._mKey(m));   // đọc mọi cờ -> lập dep reactive
      if (this._mGuard > 0) return;
      for (const m of this._MODALS) { const k = this._mKey(m); if (openKeys.includes(k) && !this._mstack.some((e) => e.k === k)) { this._mstack.push({ k, m }); try { history.pushState({ mm: k }, '', location.hash); } catch (e) {} } }   // MỞ -> đẩy history
      for (let i = this._mstack.length - 1; i >= 0; i--) { if (!openKeys.includes(this._mstack[i].k)) { this._mstack.splice(i, 1); this._mGuard++; try { history.back(); } catch (e) { this._mGuard--; } } }   // ĐÓNG NGOÀI -> nuốt 1 entry
    });
  },
  _modalBack() { const e = this._mstack.pop(); if (e) this._mClose(e.m); },   // vuốt-back: đóng modal TOP
  _closeAllModalsForNav() { while (this._mstack.length) { const e = this._mstack.pop(); this._mClose(e.m); } },   // rời tab: đóng + xoá stack CÙNG LÚC -> reconcile no-op

  // Popup Bảng Chỉ Số (mobile) — chỉ set cờ, bộ chặn lo history
  statOpen: false, statScale: 1, fitNat: 0,
  openStat() { this.statOpen = true; },
  closeStat() { this.statOpen = false; },
  openBachTrang() { this.bachTrangOpen = true; },
  closeBachTrang() { this.bachTrangOpen = false; },
  fitStat() {
    this.statScale = 1;
    const doit = () => {
      const w = document.querySelector('.tb-stats.open .tb-stats-scale'); if (!w) return;
      const nat = w.scrollHeight; this.fitNat = nat;
      const hd = document.querySelector('.tb-stats.open .tb-stats-hd');
      const avail = window.innerHeight - 40 - (hd ? hd.offsetHeight + 14 : 48);
      this.statScale = nat > avail ? Math.max(0.6, avail / nat) : 1;
    };
    (window.Alpine && window.Alpine.nextTick) ? window.Alpine.nextTick(doit) : setTimeout(doit, 0);
  },

  // ---------- TÔNG MÔN (nhánh phụ — cách ly tuyệt đối, mọi thực lực SIDE-ONLY) ----------
  tmSelUid: null, tmRecruitOpen: false, giftOpen: false, disciTab: 'info',
  giftList: [], giftShown: [], giftFilter: 'all', giftSlotChips: [], giftSlot: null,
  tmEvtOpen: false, tmEvtIdx: -1, tmEvtCur: null, tmEvtResult: null,
  DISC_FACES: { nam: 8, nu: 8 },   // số ảnh chân dung pool mỗi giới (images/tongmon/disciples/<sex>_<n>.webp)
  tmFaceFull: null,                 // src ảnh chân dung đang xem full (lightbox)
  tmRealmColors: ['#cbd5e1', '#34d399', '#60a5fa', '#22d3ee', '#a78bfa', '#c4b5fd', '#e879f9', '#fb923c', '#f5b942', '#fbbf24'],
  get tm() { return this.state.tongMon; },
  get tmSelDisciple() { return this.tm ? this.tm.disciples.find((d) => d.uid === this.tmSelUid) : null; },
  tmTick() { try { simTongMon(this.state, now()); } catch (e) {} this._tick++; },
  tmSave() { Storage.save(this.state); },
  tmSlot() { return slotCount(this.tm); },
  tmUyDanh() { return uyDanhOf(this.tm); },
  tmCapName(d) { return REALMS[disciCap(d)].name; },                                  // tên cảnh giới ở TRẦN của đệ tử
  tmSpeedMul(d) { return APT[d.apt].mul * (1 + BUILDINGS.dienVo.buffPerLv * (this.tm.buildings.dienVo || 0) + 0.02 * (this.tm.buildings.tuLinh || 0)); },
  tmFlagChips(d) { const M = { daoLu: ['Đạo Lữ', '#34d399'], oanTham: ['Oán Thầm', '#fb7185'], tamMaSeed: ['Mầm Tâm Ma', '#a78bfa'], tinhTrieu: ['Tình Triều', '#f472b6'], cuuChuoc: ['Cải Tà', '#34d399'], triAn: ['Tri Ân', '#34d399'], batPhuc: ['Bất Phục', '#fb7185'], phatPhan: ['Phát Phẫn', '#f5b942'] }; const out = []; if (d.bietHieu) out.push([d.bietHieu, '#f5b942']); for (const k in (d.flags || {})) { if (M[k]) out.push(M[k]); } return out; },
  // Diễn Biến Tông Môn: gán seal Hán + màu theo loại sự kiện (suy từ text Sử Sách)
  tmDienBienSeal(text) { const T = text || ''; const M = [['Xuất Sư', '仙', '#f5b942'], ['★', '仙', '#f5b942'], ['đắc đạo', '仙', '#f5b942'], ['Trưởng Lão', '師', '#fbbf24'], ['đột phá', '破', '#22d3ee'], ['Phản Đồ', '叛', '#a78bfa'], ['đào tẩu', '叛', '#a78bfa'], ['phản xuất', '叛', '#a78bfa'], ['đạo lữ', '緣', '#34d399'], ['gia bảo', '寶', '#fbbf24'], ['Thu nhận', '入', '#94a3b8'], ['tâm ma', '魔', '#fb7185'], ['chiến thắng', '戰', '#fb7185'], ['Khí Vận', '運', '#22d3ee'], ['linh khí', '運', '#22d3ee']]; for (const [k, s, c] of M) { if (T.includes(k)) return { seal: s, color: c }; } return { seal: '事', color: '#64748b' }; },
  get tmDienBien() { void this._tick; return ((this.tm && this.tm.soSach) || []).slice(0, 18).map((s) => { const m = this.tmDienBienSeal(s.text); return { text: s.text, html: this._chronHtml(s.text, s.gid), t: s.t, seal: m.seal, color: m.color, icon: this.tmChronIcon(s) }; }); },
  // tô màu tên đệ tử (theo phẩm chất / tư chất) + cảnh giới (theo màu cảnh giới) trong dòng Diễn Biến
  _chronHtml(text, gid) {
    const t = this.tm; if (!t) return text;
    let s = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (gid) s = s.replace(/「([^」]+)」/, (m, nm) => '<a onclick="tmShowItem(\'' + gid + '\')" class="cursor-pointer underline decoration-dotted decoration-amber-400/50 hover:text-amber-100">「' + nm + '」</a>');
    const names = [];
    (t.disciples || []).forEach((d) => names.push([d.name, APT[d.apt].color]));
    (t.elders || []).forEach((d) => names.push([d.name, APT[d.apt].color]));
    (t.legends || []).forEach((l) => names.push([l.name, (APT[l.apt] || {}).color || '#cbd5e1']));
    ((t.events && t.events.rebels) || []).forEach((r) => names.push([r.name, (APT[r.apt] || {}).color || '#a78bfa']));
    const seen = new Set();
    names.sort((a, b) => b[0].length - a[0].length).forEach(([nm, c]) => { if (!nm || seen.has(nm)) return; seen.add(nm); if (s.includes(nm)) s = s.split(nm).join('<b style="color:' + c + '">' + nm + '</b>'); });
    REALMS.forEach((r, i) => { if (s.includes(r.name)) s = s.split(r.name).join('<b style="color:' + (this.tmRealmColors[i] || '#cbd5e1') + '">' + r.name + '</b>'); });
    // tên NGUYÊN LIỆU tô màu theo bậc (T1 lục / T2 lam / T3 vàng) — dài trước để khỏi nuốt tên ngắn
    MAT_KEYS.map((m) => [MATS[m].name, this.tmMatTierColor(MATS[m].tier)]).sort((a, b) => b[0].length - a[0].length).forEach(([nm, c]) => { if (s.includes(nm)) s = s.split(nm).join('<b style="color:' + c + '">' + nm + '</b>'); });
    return s;
  },
  openFaceFull(src) { if (src) this.tmFaceFull = src; },
  closeFaceFull() { this.tmFaceFull = null; },
  // Popup chỉ số 1 món Gia Bảo đệ tử đang đeo (click ô đã lắp)
  tmGearView: null,
  openTmGear(inst) { const v = this.gearView(inst); if (v) this.tmGearView = v; },
  closeTmGear() { this.tmGearView = null; },
  // Luyện Khí Các: thông tin cường hóa gia bảo đang xem (side-only tmPlus). Đệ tử = tmSelUid, slot = tmGearView.slot.
  get tmGearEnhance() {
    void this._tick;
    const v = this.tmGearView; if (!v || !v._inst) return null;
    const lv = this.tmBuildLv('luyenKhiCac'), cur = v._inst.tmPlus || 0, max = lkcMaxPlus(lv);
    if (lv < 1) return { lkcBuilt: false, cur: 0, max: 0 };
    if (cur >= max) return { lkcBuilt: true, atMax: true, cur, max };
    const step = lkcStep(cur), m = MATS[step.mat] || {}, matHave = this.tmMatCount(step.mat), honHave = Math.floor(this.state.currencies.honThach || 0);
    return { lkcBuilt: true, atMax: false, cur, max, next: cur + 1, matName: m.name, matEmoji: m.emoji, matQty: step.matQty, matHave, matOk: matHave >= step.matQty, honThach: step.honThach, honHave, honOk: honHave >= step.honThach, canEnhance: matHave >= step.matQty && honHave >= step.honThach };
  },
  tmEnhanceGear() { const r = enhanceGear(this.state, this.tmSelUid, this.tmGearView && this.tmGearView.slot); if (r.ok) { this.tmSave(); this._tick++; this.showToast('Luyện Khí Các · ' + r.msg); } else this.showToast(r.msg); },
  // Đấu Giá Hội (shop tiêu Điểm Đấu Giá — side-only/cosmetic)
  shopOpen: false, shopRename: '',
  get tmShopItems() { return TM_SHOP; },
  openShop() { this.shopRename = (this.tm && this.tm.name) || ''; bkAuctionRefresh(this.state, now()); this.shopOpen = true; },
  closeShop() { this.shopOpen = false; },
  // Đấu Giá Bí Kíp: phiên rao bán lô bí kíp (làm mới theo giờ) — tiêu Điểm, vào biKipBag (side-only)
  get tmBkAuction() {
    void this._tick; const t = this.tm; if (!t || !t.bkAuction) return { lots: [], nextMs: 0 };
    const lots = (t.bkAuction.lots || []).map((l) => { const v = this.biKipView(l.id); return v ? Object.assign(v, { price: l.price, afford: (t.diem || 0) >= l.price }) : null; }).filter(Boolean);
    const nextMs = Math.max(0, (t.bkAuction.at || 0) + BK_AUCTION_REFRESH_H * 3600000 - now());
    return { lots, nextMs };
  },
  tmBuyBkLot(id) { const r = buyBkLot(this.state, id, now()); if (r.ok) { this.tmSave(); this._tick++; this.showToast('Đấu Giá Hội · ' + r.msg); } else this.showToast(r.msg); },
  tmShopReadyIn(item) { void this._tick; if (!item.cdH || !this.tm || !this.tm.shopCd) return 0; return Math.max(0, (this.tm.shopCd[item.id] || 0) - now()); },
  tmShopCdText(item) { const ms = this.tmShopReadyIn(item); if (ms <= 0) return ''; const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000); return h > 0 ? ('Còn ' + h + 'h' + (m > 0 ? (' ' + m + 'm') : '')) : ('Còn ' + m + 'm'); },
  tmShopCanBuy(item) { return !!(this.tm && (this.tm.diem || 0) >= item.cost && this.tmShopReadyIn(item) <= 0); },
  tmBuy(id, opt) { const r = tmShopBuy(this.state, id, opt || {}); if (r.ok) { this.tmSave(); this.showToast('Đấu Giá Hội · ' + r.msg); } else this.showToast(r.msg); return r.ok; },
  // Sử Sách đầy đủ (biên niên toàn bộ t.soSach + tìm theo tên/loại)
  soSachOpen: false, soSachQuery: '', soSachCat: 'all',
  // Phân loại biên niên cho bộ lọc Sử Sách (khớp từ khóa; không khớp -> 'sukien')
  CHRON_CATS: [
    { key: 'canhgioi', label: 'Cảnh Giới', kw: ['đột phá', 'Bình Cảnh', 'viên mãn', 'Đắc Đạo', 'đắc đạo', 'Xuất Sư', 'Trưởng Lão', '★'] },
    { key: 'lichluyen', label: 'Lịch Luyện', kw: ['lịch luyện'] },
    { key: 'luyendan', label: 'Luyện Đan', kw: ['Y Quán', 'luyện thành', 'xuất lò'] },
    { key: 'giangdao', label: 'Giảng Đạo', kw: ['thính giảng', 'tư chất tối đa'] },
    { key: 'giabao', label: 'Gia Bảo', kw: ['gia bảo', 'Luyện Khí Các', 'tôi luyện'] },
  ],
  tmChronCat(text) { const T = text || ''; for (const c of this.CHRON_CATS) { if (c.kw.some((k) => T.includes(k))) return c.key; } return 'sukien'; },
  // Icon dòng biên niên: ưu tiên AVATAR đệ tử (tên đệ tử hiện có trong text) -> ẤN tông môn (việc cả môn) -> seal Hán.
  tmChronIcon(s) {
    void this._tick;
    const text = (s && (s.text || s.raw)) || '';
    const discs = (this.tm && this.tm.disciples) || [];
    const named = discs.slice().sort((a, b) => (b.name || '').length - (a.name || '').length).find((d) => d.name && text.includes(d.name));
    if (named) { const f = this.tmFace(named); if (f) return { kind: 'disc', src: f, color: (APT[named.apt] || {}).color || '#cbd5e1' }; }
    const m = this.tmDienBienSeal(text); return { kind: 'sect', seal: m.seal, color: m.color };   // KHÔNG thuộc đệ tử cụ thể -> ấn tông môn (giữ seal/color làm dự phòng)
  },
  openSoSach() { this.soSachQuery = ''; this.soSachCat = 'all'; this.soSachOpen = true; },
  closeSoSach() { this.soSachOpen = false; },
  get tmSoSachCatList() {
    void this._tick;
    const arr = (this.tm && this.tm.soSach) || [], counts = {};
    arr.forEach((s) => { const c = this.tmChronCat(s.text); counts[c] = (counts[c] || 0) + 1; });
    const out = [{ key: 'all', label: 'Tất cả', n: arr.length }];
    this.CHRON_CATS.forEach((c) => out.push({ key: c.key, label: c.label, n: counts[c.key] || 0 }));
    out.push({ key: 'sukien', label: 'Sự Kiện', n: counts['sukien'] || 0 });
    return out;
  },
  get tmSoSachFull() {
    void this._tick;
    const q = (this.soSachQuery || '').trim().toLowerCase(), cat = this.soSachCat || 'all';
    let arr = (this.tm && this.tm.soSach) || [];
    if (q) arr = arr.filter((s) => (s.text || '').toLowerCase().includes(q));
    if (cat !== 'all') arr = arr.filter((s) => this.tmChronCat(s.text) === cat);
    return arr.map((s) => { const m = this.tmDienBienSeal(s.text); return { raw: s.text, html: this._chronHtml(s.text, s.gid), t: s.t, seal: m.seal, color: m.color, icon: this.tmChronIcon(s) }; });
  },
  // Chân dung đệ tử: pool ngẫu nhiên gán cố định theo uid (images/tongmon/disciples/<sex>_<n>.webp). DISC_FACES = số ảnh mỗi giới (0 = chưa có art → dùng seal Hán).
  tmFace(d) { const n = (d.sex === 'nu') ? this.DISC_FACES.nu : this.DISC_FACES.nam; if (!n) return ''; let h = 0; const u = d.uid || ''; for (let i = 0; i < u.length; i++) h = (h * 31 + u.charCodeAt(i)) >>> 0; return 'images/tongmon/disciples/' + (d.sex === 'nu' ? 'nu' : 'nam') + '_' + ((h % n) + 1) + '.webp'; },
  tmStats(d) { return disciStats(d); },                                   // bộ chỉ số tổng side-only
  // Tâm Ma Kiếp: bậc + tiến trong bậc + tier (tên/màu) cho thanh mức độ ở modal chi tiết
  tmTamMaView(d) { void this._tick; const lv = (d && d.tamMaLv) || 0; return { lv, max: TAMMA_MAX, xpPct: Math.round(Math.max(0, Math.min(1, (d && d.tamMaXp) || 0)) * 100), tier: tamMaTier(lv), lore: (d && d.tamMa) || '' }; },
  // cờ/biệt hiệu + mô tả + tác dụng (cho tooltip tùy biến). Hầu hết là DẤU ẤN ảnh hưởng DIỄN BIẾN SỰ KIỆN, chưa phải buff chỉ số.
  tmFlagInfo(d) {
    const M = {
      daoLu: ['Đạo Lữ', '#34d399', 'Kết làm đạo lữ với một đồng môn, đạo tâm tương thông.', 'Ảnh hưởng diễn biến sự kiện (đạo lữ) về sau'],
      oanTham: ['Oán Thầm', '#fb7185', 'Ôm oán trong lòng sau một biến cố.', 'Tăng nguy cơ sa "tâm ma · hắc hóa" trong sự kiện'],
      tamMaSeed: ['Mầm Tâm Ma', '#a78bfa', 'Tâm ma đã gieo mầm, đạo tâm chớm nứt.', 'Dễ trở thành Phản Đồ khi gặp biến'],
      tinhTrieu: ['Tình Triều', '#f472b6', 'Vương vấn chuyện tình duyên chốn sơn môn.', 'Có thể nảy sinh sự kiện tình cảm'],
      cuuChuoc: ['Cải Tà', '#34d399', 'Từng lầm đường nay đã hối cải.', 'Trung thành & cần mẫn hơn trong sự kiện'],
      triAn: ['Tri Ân', '#34d399', 'Mang ơn Chưởng Môn hoặc đồng môn.', 'Gắn bó, ít sinh biến'],
      batPhuc: ['Bất Phục', '#fb7185', 'Trong lòng chưa phục, ngấm ngầm so bì.', 'Có thể bùng thành drama'],
      phatPhan: ['Phát Phẫn', '#f5b942', 'Nuốt nhục mà khổ luyện, quyết vươn lên.', 'Dấu ấn ý chí — ảnh hưởng sự kiện về sau'],
    };
    const out = [];
    if (d.bietHieu) out.push({ t: d.bietHieu, c: '#f5b942', desc: 'Biệt hiệu giang hồ — vinh dự do chiến tích / kỳ ngộ.', eff: 'Dấu ấn vinh dự (cosmetic)' });
    for (const k in (d.flags || {})) { const m = M[k]; if (m) out.push({ t: m[0], c: m[1], desc: m[2], eff: m[3] }); }
    return out;
  },
  tmRealmMajor(d) { return REALMS[d.realm].name; },                          // tên ĐẠI cảnh (gom màu/Trần)
  tmRealmFull(d) { const major = REALMS[d.realm].name, sub = subStageName(d.realm, d.xp, this.tmAtCap(d)); return sub.includes(major) ? sub : (major + ' · ' + sub); },  // ĐẠI · tiểu (dedupe nếu tiểu đã chứa đại)
  tmSubShort(d) { const major = REALMS[d.realm].name, sub = subStageName(d.realm, d.xp, this.tmAtCap(d)); const s = sub.replace(major, '').replace(/\s+/g, ' ').trim(); return s || sub; },  // chỉ phần TIỂU (bỏ tên đại) cho card 2 dòng
  // ===== TÚI ĐỒ (nguyên liệu/đan) + LUYỆN ĐAN + LỊCH LUYỆN + ĐỘT PHÁ =====
  tmMatCount(m) { return Math.floor(((this.tm && this.tm.mats) || {})[m] || 0); },
  tmPillCount(p) { return Math.floor(((this.tm && this.tm.pills) || {})[p] || 0); },
  // --- TÚI ĐỒ chia mục (scale khi thêm loại vật phẩm) ---
  tmBagOpen: false,
  tmItemView: null,                                   // item đang xem art to (lightbox)
  openItemView(it) { if (it) this.tmItemView = it; },
  closeItemView() { this.tmItemView = null; },
  get tmBagCategories() {
    void this._tick;
    return [
      { key: 'mat', label: 'Nguyên Liệu', color: '#34d399', items: MAT_KEYS.map((m) => ({ id: m, name: MATS[m].name, emoji: MATS[m].emoji, count: this.tmMatCount(m), color: this.tmMatTierColor(MATS[m].tier), sub: 'Bậc ' + MATS[m].tier + ' · luyện đan', img: 'images/tongmon/mats/' + m + '.webp' })) },
      { key: 'pill', label: 'Đan Dược', color: '#f5b942', items: PILL_KEYS.map((p) => ({ id: p, name: PILLS[p].name, emoji: PILLS[p].emoji, count: this.tmPillCount(p), color: '#f5b942', sub: 'Đột phá → ' + REALMS[PILLS[p].realm + 1].name, img: 'images/tongmon/pills/' + p + '.webp', phamBreak: this.tmPillPhamBreak(p) })) },
    ];
  },
  get tmBagTotal() { void this._tick; let n = 0; MAT_KEYS.forEach((m) => { n += this.tmMatCount(m); }); PILL_KEYS.forEach((p) => { n += this.tmPillCount(p); }); return n; },
  get tmBagPreview() { void this._tick; const out = []; MAT_KEYS.forEach((m) => { const c = this.tmMatCount(m); if (c > 0) out.push({ id: m, emoji: MATS[m].emoji, count: c, img: 'images/tongmon/mats/' + m + '.webp' }); }); PILL_KEYS.forEach((p) => { const c = this.tmPillCount(p); if (c > 0) out.push({ id: p, emoji: PILLS[p].emoji, count: c, img: 'images/tongmon/pills/' + p + '.webp' }); }); return out.slice(0, 7); },
  get tmFurnaces() { void this._tick; const used = ((this.tm && this.tm.brewing) || []).length, total = yQuanFurnaces(this.tmBuildLv('yQuan')); return { used, total, free: Math.max(0, total - used) }; },
  get tmRecipes() {
    void this._tick;
    const free = this.tmFurnaces.free;
    return PILL_KEYS.map((p) => {
      const pl = PILLS[p];
      const mats = Object.keys(pl.recipe).map((m) => ({ id: m, name: MATS[m].name, emoji: MATS[m].emoji, color: this.tmMatTierColor(MATS[m].tier), need: pl.recipe[m], have: this.tmMatCount(m), ok: this.tmMatCount(m) >= pl.recipe[m] }));
      const lvOk = (this.tm.buildings.yQuan || 0) >= pl.lvReq, matsOk = mats.every((x) => x.ok);
      return { id: p, name: pl.name, emoji: pl.emoji, realmName: REALMS[pl.realm + 1].name, lvReq: pl.lvReq, lvOk, brewH: pillBrewH(p), mats, have: this.tmPillCount(p), matsOk, canCraft: lvOk && matsOk && free > 0 };
    });
  },
  // mẻ đan đang luyện trong lò (countdown, thu tay — offline-safe)
  get tmBrewing() { void this._tick; const arr = (this.tm && this.tm.brewing) || []; return arr.map((b, i) => { const pl = PILLS[b.pill] || {}, span = Math.max(1, b.until - b.at), left = Math.max(0, b.until - now()); return { idx: i, pill: b.pill, name: pl.name, emoji: pl.emoji, color: this.tmMatTierColor(0), pham: b.pham ? pillPham(b.pham) : null, ready: left <= 0, left, pct: Math.min(100, Math.round((1 - left / span) * 100)) }; }); },
  // Phẩm chất đan đang có (breakdown theo phẩm, từ THẤP->CAO) — cho Túi Đồ + lightbox.
  tmPillPhamBreak(pillId) { void this._tick; const q = ((this.tm && this.tm.pillQual) || {})[pillId] || {}; return PILL_PHAM_KEYS.map((k) => ({ key: k, n: q[k] || 0, name: pillPham(k).name, short: pillPham(k).short, color: pillPham(k).color })).filter((x) => x.n > 0); },
  tmBrewHasReady() { void this._tick; return this.tmBrewing.some((b) => b.ready); },
  tmBrew(pillId) { const r = startBrew(this.state, pillId, now()); if (r.ok) { this.tmSave(); this.showToast('Y Quán · ' + r.msg); } else this.showToast(r.msg); },
  tmCollectBrew(idx) { const r = collectBrew(this.state, idx, now()); if (r.ok) { this.tmSave(); this.showToast('Y Quán · ' + r.msg); } else this.showToast(r.msg); },
  tmCollectAllBrews() { const r = collectAllBrews(this.state, now()); if (r.ok) { this.tmSave(); const s = Object.keys(r.tot).map((p) => (PILLS[p] || {}).name + '×' + r.tot[p]).join(', '); this.showToast('Y Quán · xuất ' + s); } else this.showToast('Chưa mẻ nào thành.'); },
  tmLichLuyenInfo(d) { void this._tick; if (!d || !d.lichLuyenUntil) return null; const ms = d.lichLuyenUntil - now(); return { active: ms > 0, leftMs: Math.max(0, ms) }; },
  tmLichLuyenCdText(d) { const i = this.tmLichLuyenInfo(d); if (!i) return ''; const ms = i.leftMs, h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000); return h > 0 ? (h + 'h' + (m > 0 ? (' ' + m + 'm') : '')) : (m + 'm'); },
  tmCanLichLuyen(d) { return !!(d && !d.awaiting && !d.breakReady && !d.lichLuyenUntil && !d.giangUntil); },
  tmStartLichLuyen(uid) { const r = startLichLuyen(this.state, uid, now()); if (r.ok) { this.tmSave(); this.showToast('Lịch Luyện · ' + r.msg); } else this.showToast(r.msg); },
  get tmLichLuyenH() { return LICH_LUYEN_H; },
  // --- GIẢNG ĐẠO ĐƯỜNG (thính giảng -> nâng trần tư chất) ---
  get tmGiangSeats() { void this._tick; return giangSeatInfo(this.tm); },
  get tmGiangH() { return GIANG_H; },
  tmGiangMax() { return GIANG_MAX_BONUS; },
  tmGiangBonus(d) { return (d && d.giangBonus) || 0; },
  tmGiangInfo(d) { void this._tick; if (!d || !d.giangUntil) return null; const ms = d.giangUntil - now(); return { active: ms > 0, leftMs: Math.max(0, ms) }; },
  tmGiangCdText(d) { const i = this.tmGiangInfo(d); if (!i) return ''; const ms = i.leftMs, h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000); return h > 0 ? (h + 'h' + (m > 0 ? (' ' + m + 'm') : '')) : (m + 'm'); },
  tmCanGiang(d) { void this._tick; return (this.tmBuildLv('giangDao') >= 1) && canEnrollGiang(this.tm, d) && this.tmGiangSeats.free >= 1; },
  tmGiangReason(d) {   // lý do KHÔNG ghi danh được (hiển thị khi nút disabled)
    void this._tick; if (!d) return '';
    if (this.tmBuildLv('giangDao') < 1) return 'Chưa xây Giảng Đạo Đường';
    if (d.giangUntil) return '';
    if (d.awaiting) return 'Đã Đắc Đạo';
    if (d.breakReady) return 'Đang Bình Cảnh';
    if (d.lichLuyenUntil) return 'Đang lịch luyện';
    if ((d.giangBonus || 0) >= GIANG_MAX_BONUS) return 'Đã tận Giảng Đạo (+' + GIANG_MAX_BONUS + ' tối đa)';
    if (disciCap(d) >= aptHardCap(d)) return (d.apt === 'thien') ? 'Thiên Tư đã thông Đắc Đạo' : 'Tư chất đã chạm mức tối đa';
    if (this.tmGiangSeats.free < 1) return 'Hết ghế thính giảng';
    return '';
  },
  tmStartGiang(uid) { const r = enrollGiang(this.state, uid, now()); if (r.ok) { this.tmSave(); this.showToast('Giảng Đạo · ' + r.msg); } else this.showToast(r.msg); },
  tmNextRealm(d) { return REALMS[Math.min(9, (d.realm || 0) + 1)].name; },
  tmBreakRows(d) {
    const r = breakReqOf(d); if (!r) return [];
    return [
      { kind: 'pill', pill: r.pill, emoji: (PILLS[r.pill] || {}).emoji, label: r.pillName, need: 1, have: this.tmPillCount(r.pill) },
      { kind: 'honthach', label: 'Hồn Thạch', need: r.honThach, have: Math.floor((this.state.currencies.honThach) || 0) },
    ].map((x) => Object.assign(x, { ok: x.have >= x.need }));
  },
  tmCanBreak(d) { void this._tick; if (d && d.kiepCdUntil && d.kiepCdUntil > now()) return false; const rows = this.tmBreakRows(d); return rows.length > 0 && rows.every((x) => x.ok); },
  // THIÊN KIẾP: thông tin độ kiếp cho cảnh hiện tại (nếu realm 7/8) — tên, tử vong?, tỉ lệ (theo đan phẩm CAO nhất đang có + tâm ma + Khí Vận).
  tmKiepInfo(d) {
    void this._tick; if (!d) return null;
    const k = thienKiepOf(d.realm); if (!k) return null;
    const pillId = PILL_BY_REALM[d.realm], qual = ((this.tm && this.tm.pillQual) || {})[pillId] || {};
    let bonus = 0, bestPham = '';
    for (const key of PILL_PHAM_KEYS.slice().reverse()) { if ((qual[key] || 0) > 0) { bonus = pillPham(key).breakBonus; bestPham = pillPham(key).name; break; } }
    const odds = kiepOdds(d, bonus, this.tm.khiVan);
    return { name: k.name, deadly: k.deadly, oddsPct: Math.round(odds * 100), bestPham };
  },
  tmKiepCdText(d) { void this._tick; if (!d || !d.kiepCdUntil) return ''; const ms = d.kiepCdUntil - now(); if (ms <= 0) return ''; const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000); return h > 0 ? (h + 'h' + (m > 0 ? (' ' + m + 'm') : '')) : (m + 'm'); },
  tmKiepResult: null,
  closeKiepResult() { this.tmKiepResult = null; },
  get tmKiepTone() { const r = this.tmKiepResult; if (!r) return '#94a3b8'; return r.outcome === 'survive' ? '#fbbf24' : (r.outcome === 'death' ? '#fb7185' : '#f5b942'); },
  // ----- CINEMATIC ĐỘT PHÁ CẢNH GIỚI -----
  tmBreakCine: null,
  closeBreakCine() { this.tmBreakCine = null; },
  // ảnh cinematic theo cảnh giới ĐÍCH: cine_pha_canh_t<realm+1> (t2 Trúc Cơ ... t10 Đắc Đạo). onerror tự ẩn -> lộ nền gradient.
  tmBreakCineImg(idx) { return 'images/tongmon/cinematic/cine_pha_canh_t' + ((idx || 0) + 1) + '.webp'; },
  tmDoBreakthrough(uid) {
    const r = doBreakthrough(this.state, uid);
    if (r && r.kiep) { this.tmSave(); this._tick++; if (r.kiep.outcome === 'death') this.closeDisciple(); else if (r.kiep.outcome === 'survive') { const d = this.tm.disciples.find((x) => x.uid === uid); if (d) r.kiep.cineIdx = d.realm; } this.tmKiepResult = r.kiep; return true; }
    if (r.ok) { this.tmSave(); const d = this.tm.disciples.find((x) => x.uid === uid); if (d) this.tmBreakCine = { who: d.name, toName: r.realm, idx: d.realm, color: this.tmRealmColor(d) }; else this.showToast('★ ' + r.msg); } else this.showToast(r.msg);
    return r.ok;
  },
  // Cảnh Giới Phổ — bảng tra toàn hệ thống cảnh giới (10 đại × tiểu + trần theo tư chất).
  tmRealmGuideOpen: false,
  get tmRealmGuide() { return REALMS.map((r, i) => ({ name: r.name, color: this.tmRealmColors[i] || '#cbd5e1', subs: SUB_STAGES[i] || [], capApts: Object.keys(APT).filter((k) => APT[k].cap === i).map((k) => APT[k].name) })); },
  tmRealmColor(d) { return ['#cbd5e1', '#34d399', '#60a5fa', '#22d3ee', '#a78bfa', '#c4b5fd', '#e879f9', '#fb923c', '#f5b942', '#fbbf24'][d.realm] || '#cbd5e1'; },
  // ===== TỔ SƯ ĐIỆN: chiêm bái tiền nhân — Huyền Thoại Xuất Sư (t.legends) · Trưởng Lão (t.elders) · Cố Nhân Đã Khuất (t.fallen). Bề mặt codex/tưởng niệm trên data sẵn. =====
  toSuOpen: false,
  openToSu() { this.toSuOpen = true; },
  closeToSu() { this.toSuOpen = false; },
  get tmToSuData() {
    void this._tick;
    const t = this.tm; if (!t) return { legends: [], elders: [], fallen: [], total: 0 };
    const aptOf = (k) => ({ name: (APT[k] || {}).name || '', color: (APT[k] || {}).color || '#cbd5e1' });
    const legends = (t.legends || []).map((l) => { const a = aptOf(l.apt); return { name: l.name, han: l.han, aptName: a.name, color: a.color }; });
    const elders = (t.elders || []).map((e) => { const a = aptOf(e.apt); return { name: e.name, han: e.han, aptName: a.name, color: a.color, realmName: (REALMS[e.realm] || {}).name || '', face: this.tmFace(e), heColor: (HE[e.he] || HE.kim).color }; });
    const CAUSE = { thienKiep: 'Vẫn lạc dưới Thiên Kiếp' };
    const fallen = (t.fallen || []).map((f) => { const a = aptOf(f.apt); return { name: f.name, han: f.han, aptName: a.name, color: a.color, realmName: (REALMS[f.realm] || {}).name || '', cause: CAUSE[f.cause] || 'Đã khuất', tamMa: f.tamMa, heColor: (HE[f.he] || HE.kim).color }; });
    return { legends, elders, fallen, total: legends.length + elders.length + fallen.length };
  },
  // ===== GIỚI LUẬT ĐƯỜNG: răn dạy đệ tử sinh tâm ma / cờ xấu (gột cờ + giảm tâm ma). =====
  gioiLuatOpen: false,
  openGioiLuat() { this.gioiLuatOpen = true; },
  closeGioiLuat() { this.gioiLuatOpen = false; },
  get tmGioiLuatData() {
    void this._tick;
    const t = this.tm; if (!t) return { needy: [], rebels: [], clean: true };
    const needy = (t.disciples || []).filter((d) => disciNeedsDiscipline(d)).map((d) => {
      const tv = this.tmTamMaView(d), cdMs = (d.gioiLuatCdUntil || 0) - now();
      const h = Math.floor(cdMs / 3600000), m = Math.floor((cdMs % 3600000) / 60000);
      return { uid: d.uid, name: d.name, han: d.han, color: (APT[d.apt] || {}).color || '#cbd5e1', face: this.tmFace(d), tier: tv.tier, tamMaLv: tv.lv, flags: this.tmFlagChips(d), onCd: cdMs > 0, cdText: cdMs > 0 ? (h > 0 ? (h + 'h' + (m > 0 ? (' ' + m + 'm') : '')) : (m + 'm')) : '' };
    });
    const rebels = ((t.events && t.events.rebels) || []).map((r) => ({ name: r.name, han: r.han, color: (APT[r.apt] || {}).color || '#a78bfa', realmName: (REALMS[r.realm] || {}).name || '', face: this.tmFace({ sex: r.sex, uid: r.fromUid }) }));
    return { needy, rebels, clean: needy.length === 0 && rebels.length === 0 };
  },
  tmDiscipline(uid) { const r = disciplineDisciple(this.state, uid, now()); if (r.ok) { this.tmSave(); this._tick++; this.showToast('Giới Luật · ' + r.msg); } else this.showToast(r.msg); },
  // ===== LUẬN VÕ ĐƯỜNG: tỉ thí đệ tử (chọn đấu sĩ -> chọn đối thủ -> tỉ thí). Kết quả side-only. =====
  luanVoOpen: false, luanVoChampion: null, luanVoFight: null, luanVoRound: 0, luanVoTimer: null,
  openLuanVo() { this.luanVoChampion = null; this.lvhPick = null; this.lvhHistKey = null; this._lvStop(); this.luanVoFight = null; this.luanVoRound = 0; this.luanVoOpen = true; },
  closeLuanVo() { this._lvStop(); this.luanVoFight = null; this.luanVoOpen = false; this.lvhPick = null; this.lvhHistKey = null; },
  _lvStop() { if (this.luanVoTimer) { clearTimeout(this.luanVoTimer); this.luanVoTimer = null; } },
  _lvPlay() {   // phát từng hiệp (~1.1s/hiệp) đến hết, rồi hiện người thắng
    this._lvStop();
    const step = () => {
      if (!this.luanVoFight) { this.luanVoTimer = null; return; }
      if (this.luanVoRound < this.luanVoFight.rounds.length) { this.luanVoRound++; this._tick++; this.luanVoTimer = setTimeout(step, 1100); }
      else { this.luanVoTimer = null; this._tick++; }
    };
    this.luanVoTimer = setTimeout(step, 500);
  },
  luanVoSkip() { this._lvStop(); if (this.luanVoFight) this.luanVoRound = this.luanVoFight.rounds.length; this._tick++; },
  get luanVoFightDone() { void this._tick; return !!this.luanVoFight && this.luanVoRound >= this.luanVoFight.rounds.length; },
  get luanVoHp() { void this._tick; const f = this.luanVoFight; if (!f || this.luanVoRound <= 0) return { a: 100, b: 100 }; const rd = f.rounds[Math.min(this.luanVoRound, f.rounds.length) - 1]; return { a: rd.aHp, b: rd.bHp }; },
  get luanVoLog() { void this._tick; const f = this.luanVoFight; return f ? f.rounds.slice(0, this.luanVoRound).map((r) => r.line) : []; },
  // hiệp hiện tại: bí kíp đang thi triển mỗi bên (để SÁNG đúng ô skill)
  get luanVoActiveSkill() { void this._tick; const f = this.luanVoFight; if (!f || this.luanVoRound <= 0) return { a: '', b: '' }; const rd = f.rounds[Math.min(this.luanVoRound, f.rounds.length) - 1]; if (!rd) return { a: '', b: '' }; return rd.atkIsA ? { a: rd.atkSkillId, b: rd.defSkillId } : { a: rd.defSkillId, b: rd.atkSkillId }; },
  // sát thương HP (% điểm) mỗi bên nhận TRONG hiệp hiện tại
  get luanVoHpDelta() { void this._tick; const f = this.luanVoFight, r = this.luanVoRound; if (!f || r <= 0) return { a: 0, b: 0 }; const i = Math.min(r, f.rounds.length) - 1, cur = f.rounds[i], prev = i >= 1 ? f.rounds[i - 1] : { aHp: 100, bHp: 100 }; return { a: Math.max(0, Math.round(prev.aHp - cur.aHp)), b: Math.max(0, Math.round(prev.bHp - cur.bHp)) }; },
  // tô màu 1 dòng chiến báo: tên theo màu đấu sĩ · 〈bí kíp〉 theo bậc · khắc cyan/tím · gục đỏ · "Hiệp N" mờ
  luanVoLineHtml(line) {
    const f = this.luanVoFight; if (!f || !line) return line || '';
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let h = esc(line);
    const skMap = {}; [...(f.a.skills || []), ...(f.b.skills || [])].forEach((s) => { skMap[s.ten] = s.tierColor; });
    h = h.replace(/〈([^〉]+)〉/g, (m, p1) => '<span style="color:' + (skMap[p1] || '#fbbf24') + ';font-weight:600">〈' + p1 + '〉</span>');
    const wrap = (name, color) => { if (name) { const e = esc(name); if (e) h = h.split(e).join('<span style="color:' + color + '">' + e + '</span>'); } };
    wrap(f.a.name, f.a.color); wrap(f.b.name, f.b.color);
    h = h.replace(/ngũ hành tương khắc[^—]*/, (m) => '<span style="color:#22d3ee">' + m + '</span>');
    h = h.replace(/võ học khắc chế[^—]*/, (m) => '<span style="color:#e879f9">' + m + '</span>');
    h = h.replace(/gục xuống nhận thua/g, '<span style="color:#fb7185">gục xuống nhận thua</span>');
    h = h.replace(/^(Hiệp \d+:)/, '<span style="color:#64748b">$1</span>');
    return h;
  },
  closeLuanVoResult() { this._lvStop(); this.luanVoFight = null; this.luanVoRound = 0; },

  // ===== LUẬN VÕ HỘI: BXH chung (đệ tử tông ta + đại biểu bot các tông) xếp theo Chiến Lực. Vòng tròn nội bộ -> W-L mỗi kỳ. Tỉ Thí Ngay = đấu thử bất kỳ cặp. Side-only, tất định. =====
  // đại biểu bot (= chưởng môn mỗi tông): Chiến Lực từ botCombatLv, ngũ hành/loại/skill tất định từ seed
  _lvhBots(w, tnow, season) {
    const key = w.seed + ':' + w.createdAt + ':' + season;
    if (_lvhBotsKey === key && _lvhBotsCache) return _lvhBotsCache;
    const roster = genRoster(w.seed, w.createdAt, now()).slice(0, LVH_BOT_N);
    _lvhBotsCache = roster.map((b, i) => {
      const seed = lvHash(b.name + '|lvh'), clv = botCombatLv(b, tnow);
      const chienLuc = Math.round(60 + clv * clv * 0.16 * (0.9 + (seed % 21) / 100));   // scale bám disciPower: cấp 100 ra ~1.660 Chiến Lực
      const tier = clv >= 82 ? 'tuyệt' : clv >= 56 ? 'cao' : clv >= 30 ? 'trung' : 'sơ';
      const ti = BI_KIP_TIER_ORDER.indexOf(tier), pool = BI_KIP.filter((bk) => bk.tier === tier), bk1 = pool[seed % pool.length];
      const lower = BI_KIP_TIER_ORDER[Math.max(0, ti - 1)], pool2 = BI_KIP.filter((bk) => bk.tier === lower), bk2 = pool2[(seed >>> 7) % pool2.length];
      const skillIds = ti > 0 ? [bk1.id, bk2.id] : [bk1.id];
      const he = bk1.he, lc = LOAI_CAT[bk1.loai] || '', hi = HE[he] || HE.kim;
      const sectName = TMB_PREFIX[b.titleSeed % TMB_PREFIX.length] + ' ' + TMB_SUFFIX[b.actSeed % TMB_SUFFIX.length];
      const av = botAvatar(b);
      return { key: 'champ' + i, isBot: true, isMine: false, uid: null, name: b.name, han: av.char || (b.name || '?').slice(0, 1), face: 'images/avatars/' + av.id + '.webp', color: '#94a3b8', he, heName: hi.name, heHan: hi.han, heColor: hi.color, loaiCat: lc, loaiCatName: lc ? CAT_NAME[lc] : '', sub: sectName, chienLuc, skillIds, w: 0, l: 0, pts: 0 };
    });
    _lvhBotsKey = key; return _lvhBotsCache;
  },
  // vòng tròn nội bộ đệ tử tông ta (tất định theo kỳ) -> {uid:{w,l,pts}}
  _lvhStandings(discs, statMap, season) {
    const out = {}; discs.forEach((d) => { out[d.uid] = { w: 0, l: 0, pts: 0 }; });
    for (let i = 0; i < discs.length; i++) for (let j = i + 1; j < discs.length; j++) {
      const a = discs[i], b = discs[j], sa = statMap[a.uid], sb = statMap[b.uid];
      const res = luanVo({ name: a.name, chienLuc: sa.chienLuc, he: a.he, loaiCat: disciLoaiCat(a) }, { name: b.name, chienLuc: sb.chienLuc, he: b.he, loaiCat: disciLoaiCat(b) }, 'lvh:' + season + ':' + a.uid + '~' + b.uid);
      if (res.winnerName === a.name) { out[a.uid].w++; out[b.uid].l++; } else { out[b.uid].w++; out[a.uid].l++; }
    }
    Object.values(out).forEach((s) => { s.pts = s.w * 3; });
    return out;
  },
  get lvhBoard() {
    void this._tick; const tm = this.tm, w = this.state.world; if (!tm || !w) return { entries: [], season: 0, nextMs: 0, mine: [] };
    const tnow = now(), season = Math.floor(tnow / LVH_PERIOD);
    const discs = (tm.disciples || []).filter((d) => !d.awaiting);
    const sm = {}; discs.forEach((d) => { sm[d.uid] = disciStats(d); });
    const stand = this._lvhStandings(discs, sm, season);
    const mine = discs.map((d) => {
      const st = sm[d.uid], lc = disciLoaiCat(d), hi = HE[d.he] || HE.kim, rec = stand[d.uid] || { w: 0, l: 0, pts: 0 };
      return { key: 'd' + d.uid, isBot: false, isMine: true, uid: d.uid, name: d.name, han: d.han, face: this.tmFace(d), color: (APT[d.apt] || {}).color || '#cbd5e1', he: d.he, heName: hi.name, heHan: hi.han, heColor: hi.color, loaiCat: lc, loaiCatName: lc ? CAT_NAME[lc] : '', sub: (REALMS[d.realm] || {}).name || '', chienLuc: st.chienLuc, skillIds: (d.skills || []).slice(), w: rec.w, l: rec.l, pts: rec.pts };
    });
    const all = [...mine, ...this._lvhBots(w, tnow, season)].sort((a, b) => b.chienLuc - a.chienLuc);
    // ⚠ Hàng bot lấy từ mảng đã nhớ ở tầng module — Alpine không theo dõi. Ghi `rank` đè lên
    //   chính nó thì màn không vẽ lại khi thứ hạng đổi. Trả về hàng MỚI. (Xem `leaderboard`.)
    const xepHang = all.map((e, i) => ({ ...e, rank: i + 1 }));
    return { entries: xepHang, season, nextMs: Math.max(0, (season + 1) * LVH_PERIOD - tnow), mine, total: xepHang.length };
  },
  get lvhNextText() { void this._tick; const ms = this.lvhBoard.nextMs, h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000); return h > 0 ? (h + 'h' + (m > 0 ? (' ' + m + 'm') : '')) : (m + 'm'); },
  get lvhMyRank() { void this._tick; const mine = this.lvhBoard.entries.filter((e) => e.isMine); return mine.length ? Math.min(...mine.map((e) => e.rank)) : 0; },
  // hiển thị: top 40 + đệ tử tông ta nằm ngoài top (kèm vạch ngăn)
  get lvhDisplay() { void this._tick; const b = this.lvhBoard, top = b.entries.slice(0, 40), out = b.entries.filter((e) => e.isMine && e.rank > 40); return out.length ? [...top, { separator: true, key: 'lvhsep' }, ...out] : top; },
  lvhPick: null,
  // build combatant + fd cho 1 mục bảng (đệ tử = disciStats thật; bot = suy từ Chiến Lực)
  _lvhFighter(e) {
    const chieuPool = (e.skillIds || []).map((id) => { const bk = BI_KIP_BY_ID[id]; return bk ? { id: bk.id, ten: bk.ten, lines: bk.chieu || [] } : null; }).filter(Boolean);
    const skills = (e.skillIds || []).map((id) => this.biKipView(id)).filter(Boolean);
    let st = null;
    if (e.isMine && this.tm) { const d = (this.tm.disciples || []).find((x) => x.uid === e.uid); st = d ? disciStats(d) : null; }
    if (!st) { const c = e.chienLuc; st = { atk: Math.round(c * 2.4), def: Math.round(c * 2.1), maxHP: Math.round(c * 32), spd: Math.round(80 + c * 0.18), crit: Math.min(0.6, 0.05 + c * 0.0006), dodge: Math.min(0.3, 0.04 + c * 0.0003) }; }
    return {
      combatant: { name: e.name, chienLuc: e.chienLuc, he: e.he, loaiCat: e.loaiCat, chieuPool },
      fd: { uid: e.uid, name: e.name, color: e.color, face: e.face, han: e.han, heColor: e.heColor, heName: e.heName, heHan: e.heHan, loaiCatName: e.loaiCatName, realmName: e.sub, chienLuc: e.chienLuc, atk: st.atk, def: st.def, maxHP: st.maxHP, spd: st.spd, crit: st.crit, dodge: st.dodge, w: e.w, l: e.l, skills },
    };
  },
  // Danh hiệu top-3 đệ tử tông ta theo điểm vòng tròn (held; đổi mỗi kỳ) -> {uid: {name,color,uy}}
  get lvhTitles() { void this._tick; const mine = this.lvhBoard.mine; if (mine.length < 2) return {}; const ranked = [...mine].sort((a, b) => b.pts - a.pts || b.chienLuc - a.chienLuc); const out = {}; LVH_TITLES.forEach((tt, i) => { if (ranked[i]) out[ranked[i].uid] = tt; }); return out; },
  get lvhTitleUyBonus() { void this._tick; return Object.values(this.lvhTitles).reduce((s, t) => s + (t.uy || 0), 0); },
  lvhTitleOf(uid) { return this.lvhTitles[uid] || null; },
  lvhTiThi(bKey) {
    if (!this.lvhPick) { this.showToast('Chọn đấu sĩ trước.'); return; }
    const board = this.lvhBoard.entries;
    const a = board.find((e) => e.key === this.lvhPick), b = board.find((e) => e.key === bKey);
    if (!a || !b || a.key === b.key) { this.showToast('Chọn hai đấu sĩ khác nhau.'); return; }
    const fa = this._lvhFighter(a), fb = this._lvhFighter(b);
    const seed = a.key + '~' + b.key + '~' + Math.floor(now() / 600000);
    const res = luanVoCycle(fa.combatant, fb.combatant, seed);
    this.luanVoFight = { a: fa.fd, b: fb.fd, rounds: res.rounds, aWon: res.winner === 'a', winnerName: res.winnerName, marginLabel: res.marginLabel, heFactor: res.heFactor, loaiFactor: res.loaiFactor };
    this.luanVoRound = 0; this._lvPlay();
  },
  // ===== ĐẤU LỤC: lịch sử đấu của 1 đấu sĩ (đệ tử/bot) — bấm hàng BXH -> mở. Trận vs đối thủ lân cận hạng, tất định theo kỳ; bấm 1 trận -> xem playback. =====
  lvhHistKey: null,
  lvhOpenHist(key) { this.lvhHistKey = key; },
  lvhCloseHist() { this.lvhHistKey = null; },
  _lvhOpponents(e, board) {
    const arr = board.entries, idx = arr.findIndex((x) => x.key === e.key); if (idx < 0) return [];
    const out = [];
    for (let d = 1; out.length < 6 && d < arr.length; d++) { if (arr[idx - d] && arr[idx - d].key !== e.key) out.push(arr[idx - d].key); if (out.length < 6 && arr[idx + d] && arr[idx + d].key !== e.key) out.push(arr[idx + d].key); }
    return out;
  },
  _lvhMatchSeed(season, aKey, bKey) { return 'lvhm:' + season + ':' + aKey + '~' + bKey; },
  get lvhHist() {
    void this._tick; if (!this.lvhHistKey) return null;
    const board = this.lvhBoard, e = board.entries.find((x) => x.key === this.lvhHistKey); if (!e) return null;
    const matches = this._lvhOpponents(e, board).map((ok) => {
      const opp = board.entries.find((x) => x.key === ok); if (!opp) return null;
      const fa = this._lvhFighter(e), fb = this._lvhFighter(opp);
      const res = luanVo(fa.combatant, fb.combatant, this._lvhMatchSeed(board.season, e.key, ok));
      return { oppKey: ok, oppName: opp.name, oppSub: opp.sub, oppFace: opp.face, oppHan: opp.han, oppColor: opp.color, oppHeColor: opp.heColor, oppHeHan: opp.heHan, oppCL: opp.chienLuc, oppRank: opp.rank, won: res.winnerName === e.name, marginLabel: luanVoMarginLabel(res.margin) };
    }).filter(Boolean);
    const wn = matches.filter((m) => m.won).length;
    return { entry: e, matches, w: wn, l: matches.length - wn };
  },
  lvhReplayMatch(oppKey) {
    const board = this.lvhBoard, e = board.entries.find((x) => x.key === this.lvhHistKey), opp = board.entries.find((x) => x.key === oppKey);
    if (!e || !opp) return;
    const fa = this._lvhFighter(e), fb = this._lvhFighter(opp);
    const res = luanVoCycle(fa.combatant, fb.combatant, this._lvhMatchSeed(board.season, e.key, oppKey));
    this.luanVoFight = { a: fa.fd, b: fb.fd, rounds: res.rounds, aWon: res.winner === 'a', winnerName: res.winnerName, marginLabel: res.marginLabel, heFactor: res.heFactor, loaiFactor: res.loaiFactor };
    this.luanVoRound = 0; this._lvPlay();
  },
  lvhPickFromHist() { if (this.lvhHistKey) { this.lvhPick = this.lvhHistKey; this.lvhCloseHist(); this.showToast('Đã chọn đấu sĩ · bấm Tỉ Thí ở đối thủ trên bảng.'); } },
  // ===== ĐÃI KHÁCH CÁC: bang giao bot-sect (Tiếp Đãi / Tặng Lễ -> giao tình -> Kết Minh). Selection ở store (genRoster), thưởng side-only. =====
  daiKhachOpen: false,
  openDaiKhach() { this.daiKhachOpen = true; },
  closeDaiKhach() { this.daiKhachOpen = false; },
  get tmDiploData() {
    void this._tick;
    const w = this.state.world, t = this.tm; if (!w || !t) return { envoys: [], allyCount: 0, lv: 0, giftDiem: DIPLO_GIFT_DIEM };
    const lv = this.tmBuildLv('daiKhachCac'), tnow = now(), count = Math.min(16, 4 + 2 * lv);
    const roster = genRoster(w.seed, w.createdAt, now()), ties = (t.diplomacy && t.diplomacy.ties) || {};
    const envoys = roster.slice(0, count).map((b, i) => {
      const sectId = 'sect' + i, daoKey = ['chinh', 'ta', 'trung'][b.titleSeed % 3], di = this.daoInfo(daoKey), tl = botTotalLv(b, tnow);
      const tie = ties[sectId] || { rep: 0, lastVisit: 0 }, tier = diploTier(tie.rep), nextMin = diploNextMin(tie.rep);
      const cdMs = (tie.lastVisit || 0) + DIPLO_HOST_CD_H * 3600000 - tnow, h = Math.floor(cdMs / 3600000), m = Math.floor((cdMs % 3600000) / 60000);
      return { id: sectId, name: TMB_PREFIX[b.titleSeed % TMB_PREFIX.length] + ' ' + TMB_SUFFIX[b.actSeed % TMB_SUFFIX.length], master: b.name, daoLabel: di[0], daoColor: di[1], uy: Math.round(85 * Math.pow(tl / 100, 3.8) * (0.90 + (b.actSeed % 21) * 0.01)), avatar: botAvatar(b), rep: tie.rep || 0, tierName: tier.name, tierColor: tier.color, tierKey: tier.key, nextMin, onCd: cdMs > 0, cdText: cdMs > 0 ? (h > 0 ? (h + 'h' + (m > 0 ? (' ' + m + 'm') : '')) : (m + 'm')) : '' };
    });
    return { envoys, allyCount: envoys.filter((e) => e.tierKey === 'ketMinh').length, lv, giftDiem: DIPLO_GIFT_DIEM };
  },
  tmDiploHost(sectId, sectName) { const r = diplomacyHost(this.state, sectId, sectName, now()); if (r.ok) { this.tmSave(); this._tick++; this.showToast('Bang Giao · ' + r.msg + (r.ally ? ' — KẾT MINH!' : '')); } else this.showToast(r.msg); },
  tmDiploGift(sectId, sectName) { const r = diplomacyGift(this.state, sectId, sectName, now()); if (r.ok) { this.tmSave(); this._tick++; this.showToast('Bang Giao · ' + r.msg + (r.ally ? ' — KẾT MINH!' : '')); } else this.showToast(r.msg); },
  // ===== TÀNG THƯ LÂU · LĨNH NGỘ BÍ KÍP =====
  tangThuOpen: false, biKipPick: null,
  openTangThu() { this.biKipPick = null; this.tangThuOpen = true; },
  closeTangThu() { this.tangThuOpen = false; },
  // Hợp Nhất Bí Kíp: người chơi TỰ CHỌN cuốn ghép (cùng bậc, đủ số) -> 1 bí kíp ngẫu nhiên bậc kế (side-only)
  bkMergeOpen: false, bkMergeTier: 'sơ', bkMergeSel: [], bkMergeResult: null,
  openBkMerge() { const bag = (this.tm && this.tm.biKipBag) || {}; const cnt = (tr) => Object.keys(bag).reduce((s, id) => s + ((bag[id] > 0 && (BI_KIP_BY_ID[id] || {}).tier === tr) ? bag[id] : 0), 0); const tiers = ['sơ', 'trung', 'cao']; this.bkMergeTier = tiers.find((tr) => cnt(tr) >= (BK_MERGE_N[tr] || 3)) || tiers.find((tr) => cnt(tr) > 0) || 'sơ'; this.bkMergeSel = []; this.bkMergeResult = null; this.bkMergeOpen = true; },
  closeBkMerge() { this.bkMergeOpen = false; this.bkMergeSel = []; this.bkMergeResult = null; },
  get bkMergeTiers() { return ['sơ', 'trung', 'cao'].map((tier) => { const ti = BI_KIP_TIER_ORDER.indexOf(tier), next = BI_KIP_TIER_ORDER[ti + 1]; return { tier, tierName: (BI_KIP_TIER[tier] || {}).name, tierColor: (BI_KIP_TIER[tier] || {}).color, next, nextName: (BI_KIP_TIER[next] || {}).name, nextColor: (BI_KIP_TIER[next] || {}).color, need: BK_MERGE_N[tier] || 3 }; }); },
  get bkMergeCur() { return this.bkMergeTiers.find((r) => r.tier === this.bkMergeTier) || this.bkMergeTiers[0]; },
  get bkMergeNeed() { return this.bkMergeCur.need; },
  setBkMergeTier(tier) { this.bkMergeTier = tier; this.bkMergeSel = []; this.bkMergeResult = null; this._tick++; },
  get bkMergePool() {
    void this._tick; const t = this.tm; if (!t) return [];
    const bag = t.biKipBag || {}; const selCount = {}; this.bkMergeSel.forEach((id) => { selCount[id] = (selCount[id] || 0) + 1; });
    return Object.keys(bag).filter((id) => bag[id] > 0 && (BI_KIP_BY_ID[id] || {}).tier === this.bkMergeTier)
      .map((id) => { const v = this.biKipView(id); return v ? Object.assign(v, { have: bag[id], remain: bag[id] - (selCount[id] || 0) }) : null; })
      .filter(Boolean).sort((a, b) => a.ten.localeCompare(b.ten, 'vi'));
  },
  get bkMergeTray() { void this._tick; return this.bkMergeSel.map((id) => this.biKipView(id)).filter(Boolean); },
  get bkMergeFull() { void this._tick; return this.bkMergeSel.length >= this.bkMergeNeed; },
  bkMergePickAdd(id) { if (this.bkMergeSel.length >= this.bkMergeNeed) return; const bag = (this.tm && this.tm.biKipBag) || {}; const sel = this.bkMergeSel.filter((x) => x === id).length; if ((bag[id] || 0) - sel < 1) return; this.bkMergeSel.push(id); this.bkMergeResult = null; this._tick++; },
  bkMergePickRemove(idx) { this.bkMergeSel.splice(idx, 1); this.bkMergeResult = null; this._tick++; },
  tmMergeBiKipPick() { if (this.bkMergeSel.length !== this.bkMergeNeed) { this.showToast('Chọn đủ ' + this.bkMergeNeed + ' bí kíp.'); return; } const r = mergeBiKipPick(this.state, this.bkMergeSel.slice()); if (r.ok) { this.bkMergeSel = []; this.bkMergeResult = this.biKipView(r.got.id); this.tmSave(); this._tick++; this.showToast('Hợp Nhất · ' + r.msg); } else { const bag = (this.tm && this.tm.biKipBag) || {}; const cnt = {}; this.bkMergeSel = this.bkMergeSel.filter((id) => { cnt[id] = (cnt[id] || 0) + 1; return (bag[id] || 0) >= cnt[id]; }); this.bkMergeResult = null; this._tick++; this.showToast(r.msg); } },
  _STATN: { atk: 'Công Kích', def: 'Phòng Ngự', spd: 'Tốc Độ', maxHP: 'Sinh Lực', crit: 'Bạo Kích', dodge: 'Né Tránh', critDmg: 'Sát Thương Bạo Kích' },
  biKipView(id) {
    const bk = BI_KIP_BY_ID[id]; if (!bk) return null;
    const loai = BI_KIP_LOAI[bk.loai] || {}, tier = BI_KIP_TIER[bk.tier] || {}, mods = biKipMods(bk), he = HE[bk.he] || HE.kim;
    const modLines = Object.keys(mods).map((k) => ({ stat: this._STATN[k] || k, pct: Math.round(mods[k] * 100), add: BI_KIP_ADD_STATS.includes(k) }));
    return { id, ten: bk.ten, loai: bk.loai, loaiName: loai.name, tier: bk.tier, tierName: tier.name, tierColor: tier.color, he: bk.he, heName: he.name, heColor: he.color, heHan: he.han, lore: bk.lore, modLines, power: bk ? Math.round(55 * (tier.mul || 1)) : 0 };
  },
  get tmBiKipBag() {
    void this._tick; const bag = (this.tm && this.tm.biKipBag) || {};
    return Object.keys(bag).filter((id) => bag[id] > 0).map((id) => { const v = this.biKipView(id); return v ? Object.assign(v, { count: bag[id] }) : null; }).filter(Boolean).sort((a, b) => BI_KIP_TIER_ORDER.indexOf(b.tier) - BI_KIP_TIER_ORDER.indexOf(a.tier));
  },
  get tmLinhNgoData() {
    void this._tick; const t = this.tm; if (!t) return { seats: { total: 0, used: 0, free: 0 }, disciples: [] };
    const seats = linhNgoSeatInfo(t);
    const disciples = (t.disciples || []).filter((d) => !d.awaiting).map((d) => {
      const ln = d.linhNgoUntil ? { bk: this.biKipView(d.linhNgoTarget), leftMs: Math.max(0, d.linhNgoUntil - now()) } : null;
      const busy = (d.lichLuyenUntil && d.lichLuyenUntil > now()) ? 'đang lịch luyện' : ((d.giangUntil && d.giangUntil > now()) ? 'đang thính giảng' : '');
      return { uid: d.uid, name: d.name, han: d.han, color: (APT[d.apt] || {}).color || '#cbd5e1', face: this.tmFace(d), realmName: REALMS[d.realm].name, slotUsed: (d.skills || []).length, slotMax: biKipSlotMax(d.realm), learning: ln, busy };
    });
    return { seats, disciples };
  },
  linhNgoLeftText(ms) { const m = Math.max(0, ms || 0), h = Math.floor(m / 3600000), mn = Math.floor((m % 3600000) / 60000); return h > 0 ? (h + 'h' + (mn > 0 ? (' ' + mn + 'm') : '')) : (mn + 'm'); },
  tmStartLinhNgo(uid) { if (!this.biKipPick) { this.showToast('Chọn bí kíp trước.'); return; } const r = startLinhNgo(this.state, this.biKipPick, uid, now()); if (r.ok) { this.tmSave(); this._tick++; this.showToast('Lĩnh Ngộ · ' + r.msg); if (!((this.tm.biKipBag || {})[this.biKipPick] > 0)) this.biKipPick = null; } else this.showToast(r.msg); },
  // Hồ sơ đệ tử: bí kíp đã lĩnh ngộ + đang lĩnh ngộ
  tmDisciSkills(d) { void this._tick; return ((d && d.skills) || []).map((id) => this.biKipView(id)).filter(Boolean); },
  tmDisciLinhNgo(d) { void this._tick; if (!d || !d.linhNgoUntil) return null; return { bk: this.biKipView(d.linhNgoTarget), leftMs: Math.max(0, d.linhNgoUntil - now()) }; },
  tmDisciSlot(d) { return { used: (d && d.skills ? d.skills.length : 0), max: biKipSlotMax(d ? d.realm : 0) }; },
  get tmLuanVoData() {
    void this._tick;
    const t = this.tm; if (!t) return [];
    return (t.disciples || []).filter((d) => !d.awaiting).map((d) => {
      const rec = luanVoRecord(t, d.uid), cdMs = (d.luanVoCdUntil || 0) - now();
      const h = Math.floor(cdMs / 3600000), m = Math.floor((cdMs % 3600000) / 60000);
      const loaiCat = disciLoaiCat(d);
      return { uid: d.uid, name: d.name, han: d.han, color: (APT[d.apt] || {}).color || '#cbd5e1', heColor: (HE[d.he] || HE.kim).color, heHan: (HE[d.he] || HE.kim).han, face: this.tmFace(d), chienLuc: disciStats(d).chienLuc, loaiCat, loaiCatName: loaiCat ? CAT_NAME[loaiCat] : '', w: rec.w, l: rec.l, isChampion: this.luanVoChampion === d.uid, onCd: cdMs > 0, cdText: cdMs > 0 ? (h > 0 ? (h + 'h' + (m > 0 ? (' ' + m + 'm') : '')) : (m + 'm')) : '' };
    });
  },
  // Glow TĨNH chân dung theo TIỂU CẢNH: hào quang màu đại cảnh, SÁNG dần khi đệ tử tiến tới Viên Mãn (idx tiểu cảnh). Inset (không tràn card). Thiên Tư vẫn có halo2 vàng riêng.
  tmSubGlow(d) {
    if (!d) return '';
    const col = this.tmRealmColor(d);
    const atCap = this.tmAtCap(d) || d.breakReady || d.awaiting;
    const n = (SUB_STAGES[d.realm] || []).length || 1;
    const idx = subStageIndex(d.realm, d.xp, atCap);
    const frac = n > 1 ? idx / (n - 1) : 1;                     // 0 ở tiểu cảnh đầu -> 1 ở Viên Mãn
    const hx = (x) => ('0' + Math.max(0, Math.min(255, Math.round(x * 255))).toString(16)).slice(-2);
    const ring = hx(0.14 + frac * 0.30);                       // vòng sáng quanh viền
    const rise = hx(0.18 + frac * 0.44);                       // hào quang dâng từ đáy
    return 'inset 0 0 13px -3px ' + col + ring + ', inset 0 -22px 28px -12px ' + col + rise;
  },
  tmApt(d) { return APT[d.apt]; },
  tmHe(d) { return HE[d.he] || HE.kim; },
  // Nhãn/bio xuất thân theo GIỚI TÍNH (vá cả đệ tử/ứng viên đã sinh: chỉ cần origin + sex).
  tmOriginLabel(d) { return originLabelOf(d.origin, d.sex) || d.originLabel || ''; },
  tmOriginBio(d) { return originBioOf(d.origin, d.sex) || d.bio || ''; },
  tmAtCap(d) { return d.realm >= disciCap(d); },
  tmProgPct(d) { if (d.awaiting || this.tmAtCap(d)) return 100; const n = (SUB_STAGES[d.realm] || []).length || 1; return Math.round((((d.xp || 0) * n) % 1) * 100); },   // tiến trong TIỂU cảnh hiện tại
  tuViNeed(realm) { return (REALMS[realm] ? REALMS[realm].hours : 1) * 3600; },   // tu vi điểm cần để đầy 1 đại cảnh
  // Dòng GIÁ TRỊ tu vi dạng SỐ: hiện tại / tối đa của đại cảnh (trực quan hơn thanh %). Cập nhật sống theo _tick.
  tmTuViVal(d) {
    void this._tick; if (!d) return null;
    if (d.awaiting) return { text: 'Đắc Đạo — chờ định đoạt', color: '#fbbf24' };
    const need = this.tuViNeed(d.realm);
    const full = this.tmAtCap(d) || d.breakReady;
    const cur = full ? need : Math.floor((d.xp || 0) * need);
    let suffix = '';
    if (d.breakReady) suffix = 'Bình Cảnh';
    else if (this.tmAtCap(d)) suffix = 'Viên mãn';
    else if (d.lichLuyenUntil && d.lichLuyenUntil > now()) suffix = 'lịch luyện';
    else if (d.giangUntil && d.giangUntil > now()) suffix = 'thính giảng';
    return { cur, max: need, suffix, color: this.tmRealmColor(d) };
  },
  tmStateLabel(d) { return d.awaiting ? 'Đắc Đạo!' : (this.tmAtCap(d) ? 'Viên mãn' : (d.state === 'rest' ? 'Nghỉ' : 'Đang tu')); },
  tmDaoLabel() { return ({ chinh: 'Chính Đạo', ta: 'Tà Đạo', trung: 'Trung Dung' })[this.tm.dao] || 'Trung Dung'; },
  tmDaoColor() { return ({ chinh: '#14b8a6', ta: '#e879f9', trung: '#94a3b8' })[this.tm.dao] || '#94a3b8'; },
  get tmBuildKeys() { return BUILD_KEYS; },   // thứ tự lưới công trình (1 nguồn — thêm building chỉ sửa BUILD_KEYS)
  tmSectTier() { const b = this.tm.buildings || {}; const s = BUILD_KEYS.reduce((a, k) => a + (b[k] || 0), 0); return Math.max(1, s - 2); },  // Cấp Tông Môn = tổng bậc công trình (khởi đầu 3 -> Đệ 1 Tầng; mỗi lần nâng +1)
  tmBuild(key) { return BUILDINGS[key]; },
  tmBuildLv(key) { return this.tm.buildings[key] || 0; },
  tmBuildCost(key) { return buildCost(this.tm.buildings[key] || 0); },
  tmCanUpgrade(key) { const c = buildCost(this.tm.buildings[key] || 0); return (this.state.currencies.bac || 0) >= c.bac && (this.tm.congHien || 0) >= c.congHien; },
  tmUpgrade(key) { if (upgradeBuilding(this.state, key)) { this.tmSave(); this.showToast('Nâng cấp ' + BUILDINGS[key].name); } else this.showToast('Thiếu Bạc / Cống Hiến'); },
  // Popup chi tiết công trình: hiệu lực bậc HIỆN TẠI -> bậc SAU (cụ thể từng loại).
  tmBuildSel: null,
  tmCraftOpen: false,
  tmBuildDetail(key) {
    const b = BUILDINGS[key]; const lv = this.tmBuildLv(key), nlv = lv + 1; const fx = [];
    const SOCIAL_BLD = { daiKhachCac: 'Bang giao · sứ giả bốn phương', gioiLuatDuong: 'Trị tâm ma · xử phản đồ', luanVoDuong: 'Tỉ thí · luận võ giao lưu', toSuDien: 'Chiêm bái · cung phụng tiền nhân' };
    if (key === 'tuHien') {
      fx.push({ label: 'Sức chứa đệ tử', cur: (b.slotBase + b.slotPerLv * (Math.max(1, lv) - 1)) + '', next: (b.slotBase + b.slotPerLv * (nlv - 1)) + '' });
    } else if (key === 'dienVo') {
      fx.push({ label: 'Tốc tu toàn môn', cur: '+' + Math.round(b.buffPerLv * lv * 100) + '%', next: '+' + Math.round(b.buffPerLv * nlv * 100) + '%' });
    } else if (key === 'tangThu') {
      fx.push({ label: 'Điểm Đấu Giá', cur: this.fmt(b.diemPerLvH * lv) + '/giờ', next: this.fmt(b.diemPerLvH * nlv) + '/giờ' });
    } else if (key === 'yQuan') {
      const top = (L) => { let best = null; for (const k in PILLS) { const p = PILLS[k]; if (p.lvReq <= L && (!best || p.realm > best.realm)) best = p; } return best; };
      const c = top(lv), n = top(nlv);
      fx.push({ label: 'Luyện đan cao nhất', cur: c ? c.name : '—', next: n ? n.name : '—' });
    } else if (key === 'tuLinh') {
      fx.push({ label: 'Khí Vận hồi (≤100)', cur: '+' + (b.khiPerLv * lv / 10).toFixed(1) + '/giờ', next: '+' + (b.khiPerLv * nlv / 10).toFixed(1) + '/giờ' });
      fx.push({ label: 'Tốc tu toàn môn', cur: '+' + (2 * lv) + '%', next: '+' + (2 * nlv) + '%' });
    } else if (key === 'duocVien') {
      const cnt = (L) => duocPlotCount({ buildings: { duocVien: L } });
      const mt = (L) => (L < 1 ? '—' : 'Bậc ' + duocMaxTier({ buildings: { duocVien: L } }));
      fx.push({ label: 'Số luống trồng', cur: cnt(lv) + '', next: cnt(nlv) + '' });
      fx.push({ label: 'Trồng nguyên liệu tối đa', cur: mt(lv), next: mt(nlv) });
    } else if (key === 'luyenKhiCac') {
      const mp = (L) => (L < 1 ? '—' : '+' + lkcMaxPlus(L));
      fx.push({ label: 'Cường Hóa Gia Bảo Tối Đa', cur: mp(lv), next: mp(nlv) });
    } else if (key === 'giangDao') {
      fx.push({ label: 'Ghế thính giảng', cur: giangSeats(lv) + '', next: giangSeats(nlv) + '' });
    } else if (SOCIAL_BLD[key]) {   // 4 công trình xã hội — nội thất build ở chunk riêng
      fx.push({ label: SOCIAL_BLD[key], cur: lv < 1 ? 'Chưa khai mở' : ('Bậc ' + lv), next: 'Bậc ' + nlv });
    }
    return { name: b.name, han: b.han, desc: b.desc, level: lv, cost: this.tmBuildCost(key), effects: fx };
  },
  get tmRecruitCost() { return recruitCost(this.tm).bac; },
  tmCanRecruit() { return this.tm.disciples.length < this.tmSlot(); },
  openRecruit() { if (!this.tmCanRecruit()) { this.showToast('Hết slot — nâng Tụ Hiền Đường'); return; } if (!this.tm.recruitPool || !this.tm.recruitPool.length) refreshRecruitPool(this.state, this.tm, now()); this.tmRecruitOpen = true; },
  tmRecruit(idx) { if (doRecruit(this.state, idx)) { this.tmSave(); this.showToast('Thu nhận đệ tử mới!'); if (!this.tm.recruitPool.length) refreshRecruitPool(this.state, this.tm, now()); } else this.showToast('Thiếu Bạc hoặc hết slot'); },
  // Đổi lứa Chiêu Hiền: tốn Hồn Thạch, giới hạn 3 lần/24h (engine doRecruitReset).
  get tmResetInfo() { void this._tick; return recruitResetInfo(this.tm, now()); },
  tmCanReset() { const i = this.tmResetInfo; return i.left > 0 && (this.state.currencies.honThach || 0) >= i.cost; },
  tmResetCdText() { const ms = this.tmResetInfo.resetInMs; const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000); return h > 0 ? (h + 'h' + (m > 0 ? (' ' + m + 'm') : '')) : (m + 'm'); },
  tmRefreshPool() { const r = doRecruitReset(this.state, now()); if (r.ok) { this.tmSave(); this.showToast('Chiêu Hiền · ' + r.msg); } else this.showToast(r.msg); },
  openDisciple(uid) { this.tmSelUid = uid; this.disciTab = 'info'; },
  closeDisciple() { this.tmSelUid = null; this.giftOpen = false; },
  tmXuatSu(uid) { if (xuatSu(this.state, uid)) { this.tmSave(); this.closeDisciple(); this.showToast('Đệ tử Xuất Sư — danh chấn giang hồ!'); } },
  tmTruongLao(uid) { if (phongTruongLao(this.state, uid)) { this.tmSave(); this.closeDisciple(); this.showToast('Phong Trưởng Lão.'); } },
  tmGiftList() { return (this.state.gearBag || []).map((g) => this.gearView(g)).filter(Boolean); },
  openGiftPicker(slot) { this.giftSlot = slot || null; this.giftList = this.tmGiftList(); this.giftSlotChips = [...new Set(this.giftList.map((it) => it.slot).filter(Boolean))]; this.giftFilter = (slot && this.giftSlotChips.includes(slot)) ? slot : 'all'; this._recomputeGift(); this.giftOpen = true; },
  setGiftFilter(f) { this.giftFilter = f; this._recomputeGift(); },
  _recomputeGift() { this.giftShown = this.giftFilter === 'all' ? this.giftList.slice() : this.giftList.filter((it) => it.slot === this.giftFilter); },
  tmGift(gearUid) { const inst = (this.state.gearBag || []).find((g) => g.uid === gearUid); if (!inst) return; const it = this.ITEMS[inst.gearId] || {}; const eq = it.equip; if (!eq || !eq.slot) { this.showToast('Món này không trang bị được'); return; } if (giftGear(this.state, this.tmSelUid, gearUid, eq.slot, it.name)) { this.tmSave(); this.giftOpen = false; this.showToast('Đã ban 「' + (it.name || 'gia bảo') + '」'); } },
  tmReclaim(uid, slot) { if (reclaimGear(this.state, uid, slot)) this.tmSave(); },
  // --- DƯỢC VIÊN (trồng nguyên liệu idle) ---
  tmDuocOpen: false, tmDuocSowIdx: -1,
  get tmDuocLv() { return this.tmBuildLv('duocVien'); },
  get tmDuocPlotCount() { return duocPlotCount(this.tm); },
  get tmDuocMaxTier() { return duocMaxTier(this.tm); },
  get tmDuocPlots() {
    void this._tick;
    const t = this.tm, cnt = this.tmDuocPlotCount, plots = (t && t.duocVien && t.duocVien.plots) || [], out = [];
    for (let i = 0; i < cnt; i++) {
      const p = plots[i];
      if (!p) { out.push({ idx: i, empty: true }); continue; }
      const m = MATS[p.mat] || {}, span = Math.max(1, p.until - p.at), left = Math.max(0, p.until - now());
      out.push({ idx: i, empty: false, mat: p.mat, name: m.name, emoji: m.emoji, tier: m.tier, qty: p.qty, ripe: left <= 0, left, pct: Math.min(100, Math.round((1 - left / span) * 100)) });
    }
    return out;
  },
  tmMatTierColor(tier) { return ({ 1: '#34d399', 2: '#60a5fa', 3: '#f5b942' })[tier] || '#94a3b8'; },
  tmDuocSowable() { void this._tick; const mt = this.tmDuocMaxTier; return MAT_KEYS.filter((m) => MATS[m].tier <= mt).map((m) => ({ id: m, name: MATS[m].name, emoji: MATS[m].emoji, tier: MATS[m].tier, color: this.tmMatTierColor(MATS[m].tier), growH: DUOC_GROW_H[MATS[m].tier] || 4, qty: DUOC_YIELD[MATS[m].tier] || 3, have: this.tmMatCount(m) })); },
  tmDuocLeftText(ms) { const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000); return h > 0 ? (h + 'h' + (m > 0 ? (' ' + m + 'm') : '')) : (Math.max(0, m) + 'm'); },
  tmDuocHasRipe() { void this._tick; return this.tmDuocPlots.some((p) => !p.empty && p.ripe); },
  get tmDuocStatus() { void this._tick; let gr = 0, ri = 0, em = 0; this.tmDuocPlots.forEach((p) => { if (p.empty) em++; else if (p.ripe) ri++; else gr++; }); return { growing: gr, ripe: ri, empty: em }; },
  // Ô hiển thị = luống thật + ô KHOÁ lấp cho đầy lưới (≥6) → vừa đẹp vừa gợi nâng cấp.
  get tmDuocSlots() { void this._tick; const cnt = this.tmDuocPlotCount, plots = this.tmDuocPlots, show = Math.max(cnt, 6), out = plots.slice(); for (let i = cnt; i < show; i++) out.push({ idx: i, locked: true }); return out; },
  openDuocVien() { this.tmDuocSowIdx = -1; this.tmDuocOpen = true; },
  closeDuocVien() { this.tmDuocOpen = false; this.tmDuocSowIdx = -1; },
  tmSow(plotIdx, matId) { const r = sowPlot(this.state, plotIdx, matId, now()); if (r.ok) { this.tmSave(); this.tmDuocSowIdx = -1; this.showToast('Dược Viên · ' + r.msg); } else this.showToast(r.msg); },
  tmHarvest(plotIdx) { const r = harvestPlot(this.state, plotIdx, now()); if (r.ok) { this.tmSave(); this.showToast('Dược Viên · ' + r.msg); } else this.showToast(r.msg); },
  tmHarvestAll() { const r = harvestAllPlots(this.state, now()); if (r.ok) { this.tmSave(); const s = Object.keys(r.tot).map((m) => (MATS[m] || {}).name + '×' + r.tot[m]).join(', '); this.showToast('Dược Viên · thu ' + s); } else this.showToast('Chưa luống nào chín.'); },
  // --- SỰ KIỆN GIANG HỒ (chọn-mù) ---
  get tmEvtPending() { void this._tick; return (this.tm && this.tm.events && this.tm.events.pending) || []; },
  tmGrpColor(g) { return (TM_GRP[g] || TM_GRP.A).color; },
  tmGrpLabel(g) { return (TM_GRP[g] || TM_GRP.A).label; },
  // Mặt đệ tử trong sự kiện: tra theo castUids (sống deterministic qua tmFace). '' nếu đệ tử đã rời (rơi về placeholder Hán).
  tmEvtFace(ci) { const cur = this.tmEvtCur; if (!cur || !cur.castUids || !this.tm) return ''; const uid = cur.castUids[ci]; const d = (this.tm.disciples || []).find((x) => x.uid === uid); return d ? this.tmFace(d) : ''; },
  openTmEvt(idx) { const p = this.tmEvtPending[idx]; if (!p) return; this.tmEvtIdx = idx; this.tmEvtCur = p; this.tmEvtResult = null; this.tmEvtOpen = true; },
  tmEvtChoose(ci) { if (this.tmEvtIdx < 0) return; const r = resolveEvent(this.state, this.tmEvtIdx, ci); if (r) { this.tmEvtResult = r; this.tmSave(); } },
  closeTmEvt() { this.tmEvtOpen = false; this.tmEvtCur = null; this.tmEvtResult = null; this.tmEvtIdx = -1; },
  devFireEvent(eid) { forceFireEvent(this.state, eid); this.tmSave(); this.showToast('DEV: nổ sự kiện ' + eid); },
  navToSkill(id) { this._applySkill(id); this._pushHash('#skill=' + id); },
  _applySkill(id) { this.view = 'skill'; this.navOpen = false; this.selectedSkill = id; const _s = this.skillSubTabsFor(id); if (_s) this.skillTab = _s[0].k; document.getElementById('mainPane')?.scrollTo({ top: 0 }); },
  // Bấm chip hoạt động ở header -> nhảy vào đúng màn của hoạt động đang chạy
  goToActivity() {
    const a = this.state.activity; if (!a) return;
    if (a.type === 'combat') this.navTo('combat');
    else if (a.type === 'dungeon') this.navTo('dungeon');
    else if (a.type === 'travel') this.navTo('map');
    else if (a.skillId) this.navToSkill(a.skillId);
  },
  toggleGroup(title) { this.groupsOpen[title] = !this.groupsOpen[title]; },
  setProfileTab(t) { this.profileTab = t; },
  openLightbox(id, emoji, name, src) { this.lightbox = { id, emoji, name, src: src || '' }; },   // src: ảnh trực tiếp (vd chân dung NPC) -> hiện thay icon
  closeLightbox() { this.lightbox = null; },
  // Hồ sơ minh chúng (Tiên Minh) — cờ để ở store cho bộ chặn _MODALS lo vuốt-back.
  // Dữ liệu do view Tiên Minh dựng sẵn rồi gán vào, modal chỉ việc vẽ.
  bpHoSo: null,
  closeBpHoSo() { this.bpHoSo = null; },
  // Công trình Tiên Minh đang mở bảng — giữ id, view tự tra ra dữ liệu tươi mỗi lần vẽ.
  bpCongTrinh: null,
  closeBpCongTrinh() { this.bpCongTrinh = null; },

  // ---------- HỎI XÁC NHẬN (modal TRONG GAME — thay confirm() gốc của trình duyệt) ----------
  // confirm() gốc hiện hộp thoại hệ điều hành, lạc hẳn khỏi giao diện game (và trên di động
  // còn khoá cả trang). Dùng chung một modal cho MỌI việc cần hỏi lại.
  //   $store.game.hoiXacNhan({ tieuDe, loi, canhBao, nut, huy, nguy, xong() {...} })
  //   · loi/canhBao nhận HTML (x-html) — được phép in đậm số liệu.
  //   · nguy:true -> nút chốt màu đỏ (việc mất mát không lấy lại được).
  //   · xong() chỉ chạy khi người chơi bấm nút chốt; đóng bằng ✕/nền/Esc/vuốt-back = huỷ.
  // Cờ 'xacNhan' đã nằm trong _MODALS nên vuốt-back tự đóng, không cần đụng gì thêm.
  xacNhan: null,
  hoiXacNhan(o) {
    this.xacNhan = Object.assign({ tieuDe: 'Xác Nhận', loi: '', canhBao: '', nut: 'Đồng Ý', huy: 'Thôi', nguy: false, xong: null }, o || {});
  },
  dongXacNhan() { this.xacNhan = null; },
  chotXacNhan() { const o = this.xacNhan; this.xacNhan = null; if (o && typeof o.xong === 'function') o.xong(); },

  // Toast nổi (tự ẩn sau 2.5s) — tái dùng cho mọi thông báo nhanh
  // ============================================================
  // KHAY THÔNG BÁO — MỘT khay duy nhất cho MỌI loại.
  // Trước đây hai đường tách hẳn: toast là hộp chữ trơn ở giữa-dưới, loot float là thẻ có
  // icon ở góc phải. Cùng một hành động (mua món trong cửa hàng) có khi nhả cả hai, hai
  // phách khác nhau ở hai góc màn — nhìn rời rạc.
  // Nay chung `notis`, chung khuôn thẻ, chung chỗ, chung hoạt ảnh. Ô icon chỉ mọc khi CÓ icon.
  // ⚠ `showToast` giữ nguyên chữ ký (280 chỗ gọi chỉ truyền một chuỗi) — đối số thứ hai là tuỳ chọn.
  // ============================================================
  _noti(o) {
    const id = ++this._lootId;
    this.lootFloats.push({ id, icon: o.icon || '', txt: o.txt, n: o.n, color: o.color || '#2dd4bf' });
    if (this.lootFloats.length > 5) this.lootFloats.shift();
    setTimeout(() => { const i = this.lootFloats.findIndex((f) => f.id === id); if (i >= 0) this.lootFloats.splice(i, 1); }, o.ms || 3000);
  },
  /**
   * @param {string} msg
   * @param {{icon?:string, color?:string}} [o] icon = HTML từ ico()/svg(); color = sắc viền.
   */
  showToast(msg, o) {
    if (!msg) return;
    // Cùng một câu đang hiện thì DỘI LẠI thay vì chồng thêm — vài chỗ gọi trong vòng lặp,
    // không chặn là năm thẻ y hệt nhau xếp chồng.
    const cu = this.lootFloats.find((f) => !f.n && f.txt === msg);
    if (cu) { cu.id = ++this._lootId; return; }
    this._noti({ txt: msg, icon: (o && o.icon) || '', color: (o && o.color) || '#2dd4bf', ms: 2600 });
  },
  qualHex(q) { return ({ phamPham: '#cbd5e1', luongPham: '#34d399', tinhPham: '#60a5fa', tuyetPham: '#a78bfa', truyenThe: '#e879f9', thanPham: '#fb923c', coBan: '#fbbf24' })[q] || '#2dd4bf'; },
  _lootFloat(icon, n, name, color) { this._noti({ icon, txt: name, n, color, ms: 3000 }); },
  showLootPop(itemId, n) { const it = this.ITEMS[itemId] || {}; this._lootFloat(this.ico(itemId, it.icon || '📦'), n, it.name || itemId, this.qualHex(it.quality)); },
  // Popup phần thưởng nhiệm vụ — ĐỒNG BỘ loot float, tô theo loại: Bạc(vàng)/Hồn Thạch(hồng)/Nguyên Bảo(lam). Egg giữ toast riêng.
  showRewardPop(r) {
    if (!r) return;
    const M = { bac: { nm: 'Bạc', c: '#fbbf24' }, honThach: { nm: 'Hồn Thạch', c: '#fb7185' }, nguyenBao: { nm: 'Nguyên Bảo', c: '#22d3ee' } };
    for (const c of this.rewardChips(r)) { const m = M[c.id]; if (m) this._lootFloat(this.ico(c.id, c.emoji), c.amt, m.nm, m.c); }
  },
  // Hết nguyên liệu -> hoạt động tự dừng (engine advance trả ranOut): toast + chuông cho rõ lý do.
  /** Làm đủ số lượt đã đặt -> báo XONG VIỆC, không phải báo lỗi như hết nguyên liệu. */
  notifyDoneLimit(rep) {
    const nm = ((this.ITEMS[rep.itemId] || {}).name) || ((this.SKILLS[rep.skillId] || {}).name) || 'chế tác';
    this.showToast('Xong ' + this.fmt(rep.limit) + ' lượt — ' + nm + '.');
    pushNotif(this.state, 'thuThap', 'Xong số lượt đã đặt', 'Đã làm đủ ' + this.fmt(rep.limit) + ' lượt ' + nm + '.', now());
    Storage.save(this.state);
  },
  notifyRanOut(rep) {
    const nm = ((this.ITEMS[rep.itemId] || {}).name) || ((this.SKILLS[rep.skillId] || {}).name) || 'chế tác';
    this.showToast('Hết nguyên liệu — đã dừng: ' + nm + '.');
    pushNotif(this.state, 'thuThap', 'Hết nguyên liệu', 'Đã dừng ' + nm + ' — thu thập/mua thêm nguyên liệu rồi luyện tiếp.', now());
    Storage.save(this.state);
  },
  openSettings() { this.settingsModal = true; },
  closeSettings() { this.settingsModal = false; },

  // ============================================================
  // CÀI ĐẶT NGƯỜI CHƠI
  // Mặc định nằm ở `CAI_DAT_MAC_DINH` (engine/state.js) — save cũ đã được vá lúc nạp.
  // ⚠ Mọi thay đổi đi qua `datCaiDat()`: nó lưu VÀ áp dụng ngay. Sửa thẳng `state.settings`
  //   thì ô giao diện đổi mà hiệu ứng/độ nét không đổi cho tới lần tải trang sau.
  // ============================================================
  get caiDat() { return this.state.settings || (this.state.settings = { ...CAI_DAT_MAC_DINH }); },
  /** Đổi ngôn ngữ = lưu rồi TẢI LẠI TRANG. Lớp phủ dịch chỉ gắn lúc khởi động (src/i18n.js) —
   *  đổi nóng thì phải gỡ bản dịch cũ khỏi từng node, phức tạp vô ích so với một lần tải lại. */
  chonNgonNgu(v) {
    if ((this.caiDat.ngonNgu || 'vi') === v) return;
    this.caiDat.ngonNgu = v;
    Storage.save(this.state);
    location.reload();
  },
  datCaiDat(khoa, giaTri) {
    this.caiDat[khoa] = giaTri;
    this.apDungCaiDat();
    Storage.save(this.state);
    this._tick++;
  },
  /** Đổ cài đặt xuống những chỗ THẬT SỰ dùng nó. Gọi lúc khởi động và sau mỗi lần đổi. */
  apDungCaiDat() {
    try {
      // Hiệu ứng: một lớp trên thẻ gốc, CSS lo phần còn lại (xem `.giam-hieu-ung` trong index.html).
      document.documentElement.classList.toggle('giam-hieu-ung', !!this.caiDat.giamHieuUng);
      // Độ nét bàn 3D: trần tỉ lệ điểm ảnh. 'muot' = 1,5 · 'tuDong' = vẽ đúng độ phân giải màn.
      datTranNet(this.caiDat.netHinh === 'muot' ? 1.5 : 3);
    } catch (e) {}
  },
  /** Trần treo máy THẬT = nền + bậc Động Phủ. ⚠ Ô cũ chỉ đọc `idleCapHours` nên nhà bậc 6 vẫn ghi "8 giờ". */
  get idleCapText() {
    const h = idleCapMs(this.state) / 3600000;
    const nen = this.caiDat.idleCapHours || 8;
    const them = Math.round((h - nen) * 10) / 10;
    return them > 0 ? (h + ' giờ (' + nen + ' + ' + them + ' Động Phủ)') : (h + ' giờ');
  },

  // ---- Toàn Màn Hình: công tắc CHUNG cho cả game (bàn cờ vẫn có nút riêng của nó) ----
  // ⚠ KHÔNG lưu vào save và KHÔNG tự bật. Tự phủ màn lúc vào chiếu đã bị bác một lần rồi.
  // ⚠⚠ CỐ Ý KHÔNG dùng `batToanMan` của engine/toanman.js: hàm đó gọi `khoaNgang()` — khoá màn
  //   sang NẰM NGANG vì nó sinh ra cho bàn cờ. Game chơi dọc, khoá ngang là xoay ngang cả game.
  //   Nó còn có đường lui "toàn màn hình giả" bằng CSS, áp lên thẻ gốc thì vô nghĩa.
  toanManTick: 0,
  get dangToanManHinh() {
    this.toanManTick;   // chạm để Alpine tính lại sau mỗi lần đổi
    try { return !!(document.fullscreenElement || document.webkitFullscreenElement); } catch (e) { return false; }
  },
  chuyenToanManHinh() {
    try {
      if (this.dangToanManHinh) {
        const ex = document.exitFullscreen || document.webkitExitFullscreen;
        if (ex) { const p = ex.call(document); if (p && p.catch) p.catch(() => {}); }
      } else {
        const el = document.documentElement;
        const req = el.requestFullscreen || el.webkitRequestFullscreen;
        if (!req) { this.showToast('Trình duyệt này không phủ toàn màn hình được.'); return; }
        const p = req.call(el, { navigationUI: 'hide' });
        if (p && p.catch) p.catch(() => this.showToast('Trình duyệt từ chối phủ toàn màn hình.'));
      }
    } catch (e) { this.showToast('Không phủ toàn màn hình được.'); }
  },

  /**
   * Ba mức báo rơi trang bị. Tên phẩm LẤY TỪ bảng QUALITY, không gõ tay —
   * đổi tên phẩm trong data mà nhãn ở đây đứng im thì người chơi chọn một đằng hiểu một nẻo.
   */
  get mucBaoRoiDo() {
    const ten = (i) => ((this.QUALITY[this.QUALITY_KEYS[i]] || {}).name || '?');
    // ⚠ Nhãn CHỈ ghi TÊN PHẨM. Bản cũ ghép 'Từ ' + tên phẩm ⇒ "Từ Hiếm", mà "từ hiếm" là một
    //   danh từ có sẵn (chữ hiếm gặp) nên mắt bắt nhầm cụm đó trước.
    // ⚠ Ghép chữ lúc chạy còn TRƯỢT TỪ ĐIỂN: "Từ Hiếm" không có khoá nào, bản EN/ZH đứng nguyên
    //   tiếng Việt. Tên phẩm trơ thì đã có sẵn khoá (Hiếm/Sử Thi).
    return [{ v: 0, ten: 'Mọi Phẩm' }, { v: 2, ten: ten(2) }, { v: 4, ten: ten(4) }];
  },

  // ---- Về Trò Chơi ----
  // ⛔ ĐÃ GỠ `phienBanText` và `anKyText`. Chúng bày `SAVE_VERSION` và ngày ký chứng chỉ ra mặt
  //   người chơi dưới dạng "Phiên Bản: Bản lưu v1" / "Ấn Ký: 16/07/2026" — trường nội bộ, người
  //   chơi đọc không ra nghĩa gì. Màn "Về Trò Chơi · Tác Giả" (`authorOpen`) mới là chỗ kể chuyện đó.
  get tacGiaText() { return (this.author && this.author.name) || 'ArchisuS'; },
  // ---------- Cẩm Nang (wiki trong game) ----------
  // Chỉ một cờ. Mọi trạng thái khác (mục đang đọc, ô tìm) nằm trong x-data của modal —
  // đóng rồi mở lại là về mục đầu, đúng ý: mở Cẩm Nang thường là để tra thứ khác.
  camNangOpen: false,
  // Cua doi Tru Ma (popup) — co o store de vuot-back tu dong.
  truMaOpen: false,
  openTruMa() { this.truMaOpen = true; },
  closeTruMa() { this.truMaOpen = false; },
  // Đích mở sẵn khi Tìm Kiếm bấm vào một mục: { bang, hang }. camNang() đọc rồi xoá.
  camNangDich: null,
  openCamNang() { this.camNangOpen = true; },
  closeCamNang() { this.camNangOpen = false; },
  /** Mở Cẩm Nang ngay tại trang chi tiết của một thực thể. */
  openCamNangTai(bang, hang) { this.camNangDich = { bang, hang }; this.camNangOpen = true; },

  /**
   * Ảnh cho một dòng kết quả Tìm Kiếm.
   * ⚠ PHẢI là hàm trên STORE, gọi bằng `$store.game.icoTim(m)`. Bản đầu để hàm này
   * trong thành phần Alpine và gọi `this.g.ico(...)`; trong phạm vi x-for thì `this`
   * là scope con nên biểu thức trả undefined -> ô ảnh RỖNG mà Console không báo gì.
   */
  icoTim(m) {
    const a = (m && m.anh) || {};
    const duPhong = this.svg(a.bieu || 'info', 'w-[17px] h-[17px] text-jade/55');
    // Đồ Phổ không có một file ảnh riêng — nó là ảnh GHÉP (cuộn theo bậc + art món
    // lồng giữa) do ico() dựng. Giao lại cho ico(), đừng tự đi tìm file.
    if (m && typeof m.id === 'string' && /^(dp_|dpset_|dpchieu_)/.test(m.id)) {
      return '<span class="block w-full h-full">' + this.ico(m.id, '📜') + '</span>';
    }
    if (!a.thu || !a.ten) return duPhong;
    // ⚠ ĐỪNG nhét SVG vào trong `onerror`: dấu nháy kép bị HTML giải mã TRƯỚC khi JS chạy
    //   nên chuỗi đứt giữa chừng, ảnh hỏng thì đứng nguyên đó thay vì rơi về dự phòng.
    //   Nay xếp CHỒNG: dự phòng nằm dưới, ảnh phủ lên; ảnh hỏng thì tự gỡ, lộ dự phòng.
    return '<span class="relative block w-full h-full">'
      + '<span class="absolute inset-0 grid place-items-center">' + duPhong + '</span>'
      + `<img src="images/${a.thu}/${a.ten}.webp" class="absolute inset-0 w-full h-full object-contain p-0.5" alt=""`
      + ` onerror='if(this.src.endsWith("webp")){this.src="images/${a.thu}/${a.ten}.png";}else{this.remove();}'>`
      + '</span>';
  },

  // ---------- Tìm Kiếm chung ----------
  // Máy tìm chỉ TÌM; mỗi kết quả kèm đường đi tới trang ĐÃ CÓ SẴN. Không đẻ trang mới.
  timOpen: false,
  openTim() { this.timOpen = true; },
  closeTim() { this.timOpen = false; },
  /** Đưa người chơi tới đúng trang của một kết quả tìm kiếm. */
  diToiKetQua(m) {
    const d = m && m.di; if (!d) return;
    this.timOpen = false;
    if (d.loai === 'tra') { this.openCamNangTai(d.bang, d.hang); return; }
    if (d.loai === 'danhsi') { this.openDanhSi(d.id); return; }
    if (d.loai === 'bot') {
      // hoSoMinhChung() chỉ dựng được hồ sơ cho người ĐANG Ở TRONG minh của mình.
      // Người giang hồ ngoài minh thì trang thật của họ là Phong Vân Bảng.
      const h = hoSoMinhChung(this.state, this.state.world, d.id, now());
      if (h) { this.bpHoSo = h; return; }
      this.navTo('phongVanBang');
      this.showToast('〈' + m.ten + '〉 — tìm trên Phong Vân Bảng.');
      return;
    }
    if (d.loai === 'bang') { this.bpTabDich = 'chinhPhat'; this.navTo('guild'); }
  },
  bpTabDich: null,
  // ---------- Ấn Ký Tác Giả (chứng chỉ ký số — nhận diện người thiết kế, không giả mạo được) ----------
  author: null,          // { name, uid } sau khi verify chứng chỉ (null = chưa verify / không hợp lệ)
  authorOpen: false,     // modal "Về Trò Chơi / Tác Giả"
  // Verify 1 lần lúc khởi động; lưu vào window để splash (script thường) đọc được.
  async initAuthorSeal() {
    try {
      const a = await verifyAuthorCert();
      this.author = a;
      try { window.TDL_AUTHOR = a; } catch (e) {}
    } catch (e) { this.author = null; }
  },
  get authorName() { return (this.author && this.author.name) || ''; },
  get hasAuthorSeal() { return !!(this.author && this.author.name); },
  // Tài khoản đang đăng nhập CÓ ĐÚNG là tác giả không (uid khớp chứng chỉ đã ký) -> huy hiệu "✓ Tác Giả".
  get isAuthorAccount() { return !!(this.author && this.author.uid && this.authUser && this.authUser.id === this.author.uid); },

  // ---------- LỆNH BÀI — bảng điều khiển của tác giả (docs/SQL_LENH_BAI.sql) ----------
  // ⚠⚠ Cùng một luật với Giám Sát: `isAuthorAccount` CHỈ ẩn/hiện màn này, KHÔNG phải hàng rào.
  //   Ai sửa mã client cũng bật được panel, nhưng không có token đúng uid tác giả thì mọi lệnh
  //   ghi ở đây đều bị RLS phía Supabase từ chối.
  lbMo: false, lbTab: 'suKien', lbTai: false, lbLoi: '',
  lbRows: [], lbKhoa: [], lbQuaUid: '', lbQuaBac: 0, lbQuaHonThach: 0, lbQuaNguyenBao: 0, lbQuaDiem: 0, lbQuaLoiNhan: '', lbKhoaUid: '', lbKhoaLyDo: '',
  // Tab Người Chơi: danh sách từ view `nguoi_choi_gom` (nhẹ), bản lưu đọc riêng khi bấm vào một người.
  lbNguoi: [], lbNguoiTai: false, lbNguoiLoi: '', lbTimTu: '', lbNguoiChon: null, lbSave: null, lbSaveTai: false,
  // Phát quà hàng loạt: `mot` = một mã tài khoản · `hd7` = vào trong 7 ngày · `tatCa` = mọi tài khoản đọc được.
  lbQuaNguon: 'mot', lbQuaDs: [], lbQuaDsTai: false,
  // Tab Cáo Thị: bảng `cao_thi` — muc_tieu rỗng là cáo thị chung, có mã tài khoản là thư riêng.
  lbCTDs: [], lbCTTai: false,
  lbCT: { tieuDe: '', noiDung: '', muc: 'thuong', mucTieu: '', moLuc: '', dongLuc: '' },
  // Khoá có hạn: số ngày. 0 = không hạn.
  lbKhoaHan: 0,
  // Tab Thống Kê: view `thong_ke_may_chu`.
  lbTK: null, lbTKTai: false, lbTKLoi: '',
  // Tab Mã Quà: bảng `ma_qua`. tuDong = quà tự rơi vào túi, không phải gõ.
  lbMQDs: [], lbMQTai: false,
  lbMQ: { ma: '', bac: 0, honThach: 0, nguyenBao: 0, diem: 0, luotToiDa: 1, tuDong: false, moLuc: '', dongLuc: '', ghiChu: '' },
  // Tab Nhật Ký: sổ chỉ thêm được của Lệnh Bài.
  lbNhatKy: [], lbNhatKyTai: false, lbNhatKyLoc: '', lbNhatKyChon: null,
  // Tab Tính Năng: bảng `tinh_nang` — cờ bật/tắt của cả lộ trình (docs/LO_TRINH_3_NAM.md).
  lbTNTai: false, lbTNLoi: '',
  // ⚠ PHẢI đóng Cài Đặt trước: modal Cài Đặt là z-[70], Lệnh Bài z-[59] — không đóng thì Lệnh Bài
  //   mở BÊN DƯỚI, nhìn như bấm không ăn. Giám Sát cũng vậy (xem openGiamSat).
  openLenhBai() { this.settingsModal = false; this.lbMo = true; this.taiLenhBai(); },
  /** Tên tiếng Việt lấy từ DATA, không lấy từ cột `ten` của bảng SQL (cột đó gieo bằng ASCII). */
  lbTen(r) { return ((SU_KIEN_BY_MA[r.ma] || {}).ten) || r.ten || r.ma; },
  /** Điền nhanh: mở từ đầu giờ tới rồi chạy đúng 14 ngày. Bỏ hẳn cái bẫy quên nhập giờ. */
  lbDatNhanh(r) {
    const mo = new Date(now() + 3600000); mo.setMinutes(0, 0, 0);
    r.mo_luc = this.lbChoOInput(mo.getTime());
    r.dong_luc = this.lbChoOInput(mo.getTime() + 14 * 86400000);
  },
  dongLenhBai() { this.lbMo = false; this.lbNguoiChon = null; this.lbSave = null; this.lbNhatKyChon = null; },
  async taiLenhBai() {
    this.lbTai = true; this.lbLoi = '';
    try {
      const r = await cloudSuKienDs();
      if (!r.ok) this.lbLoi = 'Không đọc được lịch — kiểm tra đã chạy SQL_LENH_BAI.sql chưa.';
      // ⚠⚠ `_mo0`/`_dong0` = BẢN CHỤP mốc trên máy chủ. Hai ô datetime-local ghi thẳng vào
      //   `r.mo_luc`/`r.dong_luc`, nên gõ dở là hai trường đó đã khác máy chủ rồi. Nút Thu Lệnh
      //   PHẢI đọc bản chụp — không thì "Đóng Ngay" ghi đè bằng mốc chưa hề được ban.
      else this.lbRows = SU_KIEN_MA.map((ma) => {
        const x = r.rows.find((y) => y.ma === ma) || { ma, ten: ma, mo_luc: null, dong_luc: null, chi_tac_gia: true };
        return Object.assign({}, x, { _mo0: x.mo_luc || null, _dong0: x.dong_luc || null });
      });
      // Danh sách khoá đọc RỜI: bảng khác, luật khác. Lỗi ở đây không được xoá lịch vừa đọc.
      try { const k = await cloudKhoaDs(); if (k.ok) this.lbKhoa = k.rows; } catch (e) {}
      // Nhật ký đọc NGAY lúc mở, không đợi bấm sang tab: đèn báo lệnh lạ phải sáng từ đầu.
      try { const nk = await cloudNhatKyDs(100, this.lbNhatKyLoc || null); if (nk.ok) this.lbNhatKy = nk.rows; } catch (e) {}
    } catch (e) { this.lbLoi = 'Không kết nối được.'; }
    finally { this.lbTai = false; }
  },
  /** Ô nhập ngày giờ của trình duyệt cần chuỗi 'YYYY-MM-DDTHH:mm' theo giờ MÁY, không phải chuỗi ISO UTC. */
  lbChoOInput(v) {
    if (!v) return '';
    const d = new Date(v); if (isNaN(d)) return '';
    const p = (x) => String(x).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes());
  },
  lbTrangThai(r) {
    if (!r.mo_luc || !r.dong_luc) return { chu: 'Chưa đặt lịch', mau: 'text-slate-500' };
    const t = now(), mo = Date.parse(r.mo_luc), dong = Date.parse(r.dong_luc);
    if (t >= dong) return { chu: 'Đã đóng', mau: 'text-slate-500' };
    if (t < mo) return { chu: 'Sắp mở', mau: 'text-sky-300' };
    return r.chi_tac_gia ? { chu: 'Đang chạy thử', mau: 'text-amber-300' } : { chu: 'Đang mở', mau: 'text-jade' };
  },
  async _lbGuiLich(r) {
    const rr = await cloudSuKienDat(r.ma, r.mo_luc || null, r.dong_luc || null, r.chi_tac_gia, r.cau_hinh || {});
    if (!rr.ok) { this.showToast('Không ban lệnh được — ' + rr.reason); return; }
    r._mo0 = r.mo_luc ? new Date(r.mo_luc).toISOString() : null;   // ban lệnh xong thì bản chụp = mốc vừa ghi
    r._dong0 = r.dong_luc ? new Date(r.dong_luc).toISOString() : null;
    this.showToast('Đã ban lệnh · ' + this.lbTen(r));
    this.taiSuKien();                              // đọc lại ngay cho chính mình thấy hiệu lực
    this._tick++;
  },
  lbDatLich(r) {
    if (!r || !r.ma) return;
    // ⚠⚠ Ô `datetime-local` THIẾU PHẦN GIỜ thì `.value` trả về CHUỖI RỖNG, không phải ngày đã gõ.
    //   Trước đây chỗ này gửi thẳng null rồi vẫn báo "Đã ban lệnh" — người ban lệnh tưởng xong,
    //   mà sự kiện vẫn "Chưa đặt lịch". Chặn ở đây và nói rõ thiếu gì.
    if (!r.mo_luc || !r.dong_luc) {
      this.showToast('Thiếu ngày hoặc giờ — cần điền đủ CẢ ngày và giờ ở cả hai ô. Bấm “14 Ngày” để điền nhanh.');
      return;
    }
    if (Date.parse(r.dong_luc) <= Date.parse(r.mo_luc)) {
      this.showToast('Mốc đóng phải sau mốc mở.'); return;
    }
    // ⚠ Mở cho CẢ GIANG HỒ là việc không lùi được: người chơi thấy sự kiện rồi thì rút lại là mất
    //   uy tín. Hạ cờ chạy thử mới hỏi; bật cờ thì cứ cho qua vì nó chỉ ảnh hưởng chính mình.
    if (!r.chi_tac_gia && r.mo_luc && r.dong_luc) {
      this.hoiXacNhan({
        tieuDe: 'Mở Cho Cả Giang Hồ',
        loi: this.lbTen(r) + ' sẽ hiện với mọi người chơi từ ' + this.lbChoOInput(r.mo_luc).replace('T', ' ') + ' tới ' + this.lbChoOInput(r.dong_luc).replace('T', ' ') + '.',
        canhBao: 'Người chơi đã thấy rồi thì rút lại rất khó coi.',
        nut: 'Ban Lệnh', nguy: true,
        xong: () => { this._lbGuiLich(r); },
      });
      return;
    }
    this._lbGuiLich(r);
  },
  // ---- THU LỆNH: gỡ sự kiện lỡ ban nhầm ----
  // ⚠⚠ VẪN GHI MỐC, KHÔNG ghi công tắc. Đóng ngay = hạ `dong_luc` về lúc này; huỷ lịch = xoá cả
  //   hai mốc. Giữ đúng luật cũ: client đệm hai mốc nên mất mạng vẫn tự đóng đúng hạn.
  // ⚠ Hai trường hợp KHÁC HẲN nhau, đừng gộp một nút: chưa tới giờ mở thì không ai mất gì, còn
  //   đang chạy thì vật phẩm sự kiện trong hành lý MỌI NGƯỜI bốc hơi (donSuKien).
  lbCoTheThu(r) {
    void this._tick;                                 // "Sắp mở" tự thành "Đang mở" khi tới giờ
    if (!r || !r._mo0 || !r._dong0) return false;
    return now() < Date.parse(r._dong0);             // đã đóng rồi thì không còn gì để thu
  },
  lbNutThu(r) { void this._tick; return (r && r._mo0 && now() < Date.parse(r._mo0)) ? 'Huỷ Lịch' : 'Đóng Ngay'; },
  lbThuLenh(r) {
    if (!this.lbCoTheThu(r)) { this.showToast('Sự kiện này không có lịch nào đang chờ hoặc đang chạy.'); return; }
    const ten = this.lbTen(r);
    if (now() < Date.parse(r._mo0)) {
      this.hoiXacNhan({
        tieuDe: 'Huỷ Lịch',
        loi: ten + ' chưa tới giờ mở — huỷ là gỡ sạch hai mốc, không ai mất gì.',
        nut: 'Huỷ Lịch',
        xong: () => { this._lbGuiThu(r, null, null); },
      });
      return;
    }
    this.hoiXacNhan({
      tieuDe: 'Đóng Ngay',
      loi: ten + ' đang ' + (r.chi_tac_gia ? 'chạy thử' : 'mở cho cả giang hồ') + '. Mốc kết thúc sẽ được đưa về thời điểm này.',
      canhBao: (r.chi_tac_gia ? 'Vật phẩm sự kiện trong hành lý bạn' : 'Vật phẩm sự kiện trong hành lý MỌI NGƯỜI CHƠI')
        + ' sẽ biến mất. Điểm Sự Kiện, trứng và món ăn vẫn được giữ lại.',
      nut: 'Đóng Ngay', nguy: true,
      xong: () => { this._lbGuiThu(r, Date.parse(r._mo0), now()); },
    });
  },
  async _lbGuiThu(r, mo, dong) {
    const rr = await cloudSuKienDat(r.ma, mo, dong, r.chi_tac_gia, r.cau_hinh || {});
    if (!rr.ok) { this.showToast('Không thu lệnh được — ' + rr.reason); return; }
    r.mo_luc = mo ? this.lbChoOInput(mo) : '';
    r.dong_luc = dong ? this.lbChoOInput(dong) : '';
    r._mo0 = mo ? new Date(mo).toISOString() : null;      // bản chụp phải đi theo, kẻo nút thu lệnh còn nhớ mốc cũ
    r._dong0 = dong ? new Date(dong).toISOString() : null;
    this.showToast(dong ? ('Đã đóng · ' + this.lbTen(r)) : ('Đã huỷ lịch · ' + this.lbTen(r)));
    this.taiSuKien();
    this._tick++;
  },
  // ---------- LỆNH BÀI · CHỌN VẬT PHẨM CHO HỘP QUÀ (đợt 6) ----------
  // ⚠ Trần khớp đúng ràng buộc phía máy chủ (docs/SQL_LENH_BAI_7.sql): 10 loại · 999 cái mỗi loại
  //   · tổng giá trị 2.000.000. Lệch một con số là gõ xong mới bị từ chối.
  VP_MA_TOI_DA: 10, VP_SL_TOI_DA: 999, VP_TRAN_GIA_TRI: 2000000,
  lbVPTim: '', lbVPSl: 1, lbQuaItems: {},
  /** Vật phẩm xếp chồng khớp từ khoá. Trang bị không tặng được nên loại luôn. */
  get lbVPTimThay() {
    const t = (this.lbVPTim || '').trim().toLowerCase();
    if (!t) return [];
    const ra = [];
    for (const id of Object.keys(this.ITEMS)) {
      const v = this.ITEMS[id];
      if (v.gearId) continue;
      if (!(v.name || '').toLowerCase().includes(t) && !id.toLowerCase().includes(t)) continue;
      ra.push({ id, name: v.name, icon: v.icon, value: v.value || 0 });
      if (ra.length >= 12) break;
    }
    return ra;
  },
  get lbQuaItemDs() {
    return Object.keys(this.lbQuaItems).map((id) => ({
      id, sl: this.lbQuaItems[id],
      name: (this.ITEMS[id] || {}).name || id,
      gt: ((this.ITEMS[id] || {}).value || 0) * this.lbQuaItems[id],
    }));
  },
  get lbQuaTongGT() { return this.lbQuaItemDs.reduce((t, x) => t + x.gt, 0); },
  lbVPThem(id) {
    const sl = Math.max(1, Math.min(this.VP_SL_TOI_DA, Math.floor(+this.lbVPSl || 1)));
    if (!this.lbQuaItems[id] && Object.keys(this.lbQuaItems).length >= this.VP_MA_TOI_DA) {
      this.showToast('Một hộp quà chỉ mang được ' + this.VP_MA_TOI_DA + ' loại vật phẩm.'); return;
    }
    const thu = Object.assign({}, this.lbQuaItems, { [id]: sl });
    const tong = Object.keys(thu).reduce((t, k) => t + ((this.ITEMS[k] || {}).value || 0) * thu[k], 0);
    if (tong > this.VP_TRAN_GIA_TRI) {
      this.showToast('Tổng giá trị vượt ' + this.fmt(this.VP_TRAN_GIA_TRI) + ' — người nhận sẽ bị đẩy vào sổ nghi vấn.'); return;
    }
    this.lbQuaItems = thu;
    this.lbVPTim = '';
  },
  lbVPBo(id) { const t = Object.assign({}, this.lbQuaItems); delete t[id]; this.lbQuaItems = t; },

  /** Bốn ô nhập gộp thành nội dung hộp quà. Rỗng thì trả null. */
  _lbQuaNoiDung() {
    // ⚠ Trần ở đây CHỈ để báo sớm cho dễ chịu. Ràng buộc THẬT nằm ở check constraint của bảng
    //   `qua_tang` — quà vượt trần sẽ đẩy chính người được tặng vào sổ nghi vấn.
    const n = {};
    if (+this.lbQuaBac > 0) n.bac = Math.min(2000000, +this.lbQuaBac);
    if (+this.lbQuaHonThach > 0) n.honThach = Math.min(100000, +this.lbQuaHonThach);
    if (+this.lbQuaNguyenBao > 0) n.nguyenBao = Math.min(10000, +this.lbQuaNguyenBao);
    if (+this.lbQuaDiem > 0) n.diemSuKien = Math.min(100000, +this.lbQuaDiem);
    if (Object.keys(this.lbQuaItems).length) n.items = Object.assign({}, this.lbQuaItems);
    return Object.keys(n).length ? n : null;
  },
  _lbQuaDonO() {
    this.lbQuaUid = ''; this.lbQuaBac = 0; this.lbQuaHonThach = 0; this.lbQuaNguyenBao = 0; this.lbQuaDiem = 0; this.lbQuaLoiNhan = '';
    this.lbQuaItems = {}; this.lbVPTim = ''; this.lbVPSl = 1;
  },
  /**
   * Nạp danh sách người nhận cho hai nguồn hàng loạt.
   * ⚠⚠ CHỈ 200 TÀI KHOẢN GẦN NHẤT. Máy chủ đông hơn thì số dư bị bỏ im lặng — nên giao diện phải
   *   ghi rõ con số, đừng để người ban lệnh tưởng đã phát cho cả làng.
   */
  async lbTaiDsNhan() {
    this.lbQuaDsTai = true;
    try { const r = await cloudNguoiChoiDs(200); this.lbQuaDs = r.ok ? r.rows : []; }
    catch (e) { this.lbQuaDs = []; }
    finally { this.lbQuaDsTai = false; }
  },
  lbDoiNguonQua(v) {
    this.lbQuaNguon = v;
    if (v !== 'mot' && !this.lbQuaDs.length) this.lbTaiDsNhan();
  },
  /** Mã tài khoản sẽ nhận, theo nguồn đang chọn. */
  get lbQuaNhanDs() {
    if (this.lbQuaNguon === 'mot') { const u = (this.lbQuaUid || '').trim(); return u ? [u] : []; }
    const moc = now() - 7 * 86400000;
    return (this.lbQuaDs || [])
      .filter((x) => this.lbQuaNguon === 'tatCa' || (x.updated_at && Date.parse(x.updated_at) >= moc))
      .map((x) => x.user_id);
  },
  lbNguonChu(v) { return ({ mot: 'Một Người', hd7: 'Vào Trong 7 Ngày', tatCa: 'Toàn Bộ' })[v] || v; },
  lbPhatQua() {
    const ds = this.lbQuaNhanDs;
    if (!ds.length) { this.showToast(this.lbQuaNguon === 'mot' ? 'Thiếu mã tài khoản.' : 'Không có ai trong danh sách.'); return; }
    const noiDung = this._lbQuaNoiDung();
    if (!noiDung) { this.showToast('Hộp quà trống.'); return; }
    if (ds.length === 1) { this._lbGuiQua(ds, noiDung); return; }
    // ⚠ Phát hàng loạt là việc không lùi được: gỡ lại phải xoá tay từng dòng. Nói rõ SỐ NGƯỜI.
    const ke = [];
    if (noiDung.bac) ke.push(this.fmt(noiDung.bac) + ' Bạc');
    if (noiDung.honThach) ke.push(this.fmt(noiDung.honThach) + ' Hồn Thạch');
    if (noiDung.nguyenBao) ke.push(this.fmt(noiDung.nguyenBao) + ' Nguyên Bảo');
    if (noiDung.diemSuKien) ke.push(this.fmt(noiDung.diemSuKien) + ' Điểm Sự Kiện');
    this.hoiXacNhan({
      tieuDe: 'Phát Quà Hàng Loạt',
      loi: ds.length + ' tài khoản sẽ nhận ' + ke.join(' · ') + '.',
      canhBao: 'Phát nhầm thì phải vào Supabase xoá tay từng dòng.',
      nut: 'Phát Cho ' + ds.length + ' Người', nguy: true,
      xong: () => { this._lbGuiQua(ds, noiDung); },
    });
  },
  async _lbGuiQua(ds, noiDung) {
    const r = ds.length === 1
      ? await cloudPhatQua(ds[0], noiDung, this.lbQuaLoiNhan || '')
      : await cloudPhatQuaNhieu(ds, noiDung, this.lbQuaLoiNhan || '');
    if (!r.ok) { this.showToast('Không phát được — ' + r.reason); return; }
    this.showToast(ds.length === 1 ? 'Đã gửi hộp quà.' : ('Đã gửi ' + ds.length + ' hộp quà.'));
    this._lbQuaDonO();
  },

  // ---------- LỆNH BÀI · tab CÁO THỊ ----------
  async lbTaiCaoThi() {
    this.lbCTTai = true;
    try { const r = await cloudCaoThiDs(); if (r.ok) this.lbCTDs = r.rows; }
    catch (e) {} finally { this.lbCTTai = false; }
  },
  /** Điền nhanh: đăng từ đầu giờ tới rồi treo đúng 7 ngày. Bỏ cái bẫy quên nhập giờ. */
  lbCTNhanh() {
    const mo = new Date(now() + 3600000); mo.setMinutes(0, 0, 0);
    this.lbCT.moLuc = this.lbChoOInput(mo.getTime());
    this.lbCT.dongLuc = this.lbChoOInput(mo.getTime() + 7 * 86400000);
  },
  lbCTMucChu(m) { return ({ thuong: 'Thường', quan_trong: 'Quan Trọng', bao_tri: 'Bảo Trì' })[m] || m; },
  lbCTMucMau(m) { return m === 'bao_tri' ? 'text-rose-300' : (m === 'quan_trong' ? 'text-amber-300' : 'text-slate-400'); },
  lbCTAiNhan(c) { return c && c.muc_tieu ? ('Thư riêng · ' + String(c.muc_tieu).slice(0, 8) + '…') : 'Cả giang hồ'; },
  lbCTDang() {
    const c = this.lbCT;
    if (!c.tieuDe.trim()) { this.showToast('Thiếu tiêu đề.'); return; }
    if (!c.noiDung.trim()) { this.showToast('Thiếu nội dung.'); return; }
    // ⚠ Trần độ dài phía máy chủ là 80 và 600. Chặn sớm ở đây cho khỏi mất công gõ rồi bị từ chối.
    if (c.tieuDe.length > 80) { this.showToast('Tiêu đề quá 80 chữ.'); return; }
    if (c.noiDung.length > 600) { this.showToast('Nội dung quá 600 chữ.'); return; }
    if (!c.moLuc || !c.dongLuc) { this.showToast('Thiếu mốc đăng hoặc mốc gỡ — bấm “7 Ngày” để điền nhanh.'); return; }
    if (Date.parse(c.dongLuc) <= Date.parse(c.moLuc)) { this.showToast('Mốc gỡ phải sau mốc đăng.'); return; }
    if (c.mucTieu.trim()) { this._lbCTGui(); return; }             // thư riêng: chỉ một người đọc
    this.hoiXacNhan({
      tieuDe: 'Đăng Cho Cả Giang Hồ',
      loi: '“' + c.tieuDe.trim() + '” sẽ hiện với mọi người chơi từ ' + c.moLuc.replace('T', ' ') + ' tới ' + c.dongLuc.replace('T', ' ') + '.',
      canhBao: 'Việc này ghi vào nhật ký, không xoá được.',
      nut: 'Đăng', nguy: true,
      xong: () => { this._lbCTGui(); },
    });
  },
  async _lbCTGui() {
    const c = this.lbCT;
    const r = await cloudCaoThiDang({
      tieuDe: c.tieuDe.trim(), noiDung: c.noiDung.trim(), muc: c.muc,
      mucTieu: c.mucTieu.trim() || null, moLuc: c.moLuc, dongLuc: c.dongLuc,
    });
    if (!r.ok) { this.showToast('Không đăng được — ' + r.reason); return; }
    this.showToast('Đã đăng cáo thị.');
    this.lbCT = { tieuDe: '', noiDung: '', muc: 'thuong', mucTieu: '', moLuc: '', dongLuc: '' };
    this.lbTaiCaoThi();
    this.taiCaoThi();                                // đọc lại ngay cho chính mình thấy hiệu lực
  },
  lbCTXoa(c) {
    if (!c || !c.id) return;
    this.hoiXacNhan({
      tieuDe: 'Gỡ Cáo Thị',
      loi: '“' + (c.tieu_de || '') + '” sẽ biến mất khỏi màn hình mọi người chơi.',
      canhBao: 'Ai đã đọc rồi thì vẫn còn dòng trong chuông của họ.',
      nut: 'Gỡ', nguy: true,
      xong: async () => {
        const r = await cloudCaoThiXoa(c.id);
        if (!r.ok) { this.showToast('Không gỡ được — ' + r.reason); return; }
        this.lbCTDs = this.lbCTDs.filter((x) => x.id !== c.id);
        this.showToast('Đã gỡ cáo thị.');
      },
    });
  },
  /** Mốc hết hạn theo số ngày đang chọn. 0 ngày = khoá không hạn (trả null). */
  _lbKhoaHetLuc() { return this.lbKhoaHan > 0 ? (now() + this.lbKhoaHan * 86400000) : null; },
  lbHanChu(n) { return n === 0 ? 'Không Hạn' : (n + ' Ngày'); },
  /**
   * ⚠⚠ Dòng khoá đã hết hạn VẪN NẰM LẠI trong bảng — giữ làm lịch sử vi phạm.
   *   Mọi phép hỏi "có đang bị khoá không" phải kèm điều kiện mốc, đừng chỉ tìm thấy dòng là kết luận.
   */
  lbKhoaHetHan(k) { return !!(k && k.het_luc && now() >= Date.parse(k.het_luc)); },
  lbKhoaConChu(k) {
    if (!k || !k.het_luc) return 'Không hạn';
    const con = Date.parse(k.het_luc) - now();
    if (con <= 0) return 'Đã hết hạn';
    const ng = Math.floor(con / 86400000), gio = Math.floor((con % 86400000) / 3600000);
    return ng > 0 ? ('Còn ' + ng + ' ngày ' + gio + ' giờ') : ('Còn ' + gio + ' giờ');
  },
  lbKhoaThem() {
    const uid = (this.lbKhoaUid || '').trim();
    if (!uid) { this.showToast('Thiếu mã tài khoản.'); return; }
    // ⚠ Chặn tự khoá chính mình: khoá xong thì chính tài khoản tác giả không đẩy save lên được nữa,
    //   mà cũng chẳng còn đường nào trong game để tự gỡ ra.
    if (this.author && uid === this.author.uid) { this.showToast('Không khoá chính tài khoản tác giả.'); return; }
    const han = this.lbKhoaHan > 0 ? (' trong ' + this.lbKhoaHan + ' ngày') : ' cho tới khi bạn gỡ';
    this.hoiXacNhan({
      tieuDe: 'Khoá Tài Khoản',
      loi: 'Tài khoản ' + uid.slice(0, 8) + '… sẽ không thể tải bản lưu lên máy chủ' + han + '. Người chơi vẫn có thể chơi ngoại tuyến bình thường và sẽ không nhận thông báo rằng tài khoản đã bị khóa.',
      canhBao: 'Việc này ghi vào nhật ký, không xoá được.',
      nut: 'Khoá', nguy: true,
      xong: () => { this._lbKhoaGui(uid); },
    });
  },
  async _lbKhoaGui(uid) {
    const hetLuc = this._lbKhoaHetLuc();
    const r = await cloudKhoaThem(uid, this.lbKhoaLyDo || '', hetLuc);
    if (!r.ok) { this.showToast('Không khoá được — ' + r.reason); return; }
    this.lbKhoa = this.lbKhoa.filter((x) => x.user_id !== uid).concat([{
      user_id: uid, ly_do: this.lbKhoaLyDo || '', luc: new Date().toISOString(),
      het_luc: hetLuc ? new Date(hetLuc).toISOString() : null,
    }]);
    this.lbKhoaUid = ''; this.lbKhoaLyDo = '';
    this.showToast('Đã khoá — tài khoản này không đẩy save lên được nữa.');
  },
  async lbKhoaBo(uid) {
    const r = await cloudKhoaBo(uid);
    if (!r.ok) { this.showToast('Không gỡ được.'); return; }
    this.lbKhoa = this.lbKhoa.filter((x) => x.user_id !== uid);
    this.showToast('Đã gỡ khoá.');
  },

  // ---------- LỆNH BÀI · tab NGƯỜI CHƠI (đợt 2 — view `nguoi_choi_gom`) ----------
  // ⚠ Danh sách đi qua VIEW KHÔNG có cột `data`. Một dòng save nặng ~120 KB, kéo cả bảng là treo máy.
  //   Bản lưu chỉ đọc khi bấm đúng một người (lbSoiSave).
  /**
   * Cột dọc của Lệnh Bài — mười hai mục chia bốn nhóm.
   * ⚠ Thêm mục mới thì thêm vào ĐÂY và vào `LB_TIEU_DE` bên dưới. Hai bảng này là nguồn duy nhất;
   *   viết tay danh sách ở giao diện là lần sau thêm mục lại quên một chỗ.
   */
  LB_NHOM: [
    { ten: 'Người chơi', muc: [['nguoi', 'Người Chơi'], ['khoa', 'Khoá Tài Khoản'], ['giamSat', 'Giám Sát']] },
    { ten: 'Ban thưởng', muc: [['qua', 'Hộp Quà'], ['maQua', 'Mã Quà']] },
    { ten: 'Máy chủ', muc: [['suKien', 'Sự Kiện'], ['caoThi', 'Cáo Thị'], ['heSo', 'Hệ Số'], ['moKhoa', 'Mở Khoá'], ['tinhNang', 'Tính Năng']] },
    { ten: 'Sổ sách', muc: [['thongKe', 'Thống Kê'], ['nhatKy', 'Nhật Ký']] },
  ],
  LB_TIEU_DE: {
    nguoi:   { ten: 'Người Chơi', phu: 'Tìm theo tên nhân vật hoặc mã tài khoản', chan: 'Bấm một người để mở việc.' },
    khoa:    { ten: 'Khoá Tài Khoản', phu: 'Chặn đẩy bản lưu lên máy chủ, có hạn hoặc không hạn', chan: 'Dòng hết hạn vẫn nằm lại làm lịch sử vi phạm.' },
    giamSat: { ten: 'Giám Sát', phu: 'Sổ nghi vấn — tài khoản vượt tốc độ tối đa', chan: 'Màn chỉ đọc.' },
    qua:     { ten: 'Hộp Quà', phu: 'Phát cho một người hoặc cả giang hồ', chan: 'Quà tới người chơi ở nhịp đọc mười phút.' },
    maQua:   { ten: 'Mã Quà', phu: 'Mã gõ tay, hoặc quà tự rơi vào túi theo mốc', chan: 'Mỗi mã một lần cho mỗi tài khoản.' },
    suKien:  { ten: 'Sự Kiện', phu: 'Ban lệnh mở và thu lệnh sáu lễ trong năm', chan: 'Bảng ghi mốc, không ghi công tắc.' },
    caoThi:  { ten: 'Cáo Thị', phu: 'Thông báo cho cả giang hồ, hoặc thư riêng một người', chan: 'Cáo thị vào chuông của người chơi.' },
    heSo:    { ten: 'Hệ Số', phu: 'Nhân kinh nghiệm · tỉ lệ rơi đồ · giá bán, tối đa năm lần', chan: 'Chốt chống gian lận nới mức tối đa theo hệ số này.' },
    moKhoa:  { ten: 'Mở Khoá', phu: 'Số lần Trùng Sinh đang mở cho cả giang hồ', chan: 'Hạ số này không làm tụt cấp ai.' },
    tinhNang: { ten: 'Tính Năng', phu: 'Cờ bật tắt từng hệ thống của lộ trình ba năm', chan: 'Cờ tắt thì cửa vào không mọc ra.' },
    thongKe: { ten: 'Thống Kê', phu: 'Số liệu máy chủ, đếm theo bản lưu', chan: 'Người chưa đăng nhập lần nào không có mặt.' },
    nhatKy:  { ten: 'Nhật Ký', phu: 'Sổ chỉ thêm được, không ai xoá nổi', chan: 'Dòng do tài khoản khác ban có viền đỏ.' },
  },
  get lbTieuDe() { return this.LB_TIEU_DE[this.lbTab] || { ten: '', phu: '', chan: '' }; },
  /** Số nhỏ bên phải một mục ở cột dọc. Rỗng thì không hiện gì. */
  lbDemMuc(t) {
    void this._tick;
    if (t === 'khoa') { const n = (this.lbKhoa || []).filter((k) => !this.lbKhoaHetHan(k)).length; return n || ''; }
    if (t === 'maQua') return (this.lbMQDs || []).length || '';
    if (t === 'caoThi') return (this.lbCTDs || []).length || '';
    if (t === 'heSo') return (this.lbHSDs || []).length || '';
    if (t === 'moKhoa') return this.lbMKChuyen || '';
    if (t === 'tinhNang') { void this._tick; return tinhNangDangBat(this.state) || ''; }
    return '';
  },
  lbDoiTab(t) {
    this.lbTab = t;
    // Tải lười: chưa mở tab thì chưa gọi mạng.
    if (t === 'nguoi' && !this.lbNguoi.length) this.lbTaiNguoi();
    if (t === 'caoThi' && !this.lbCTDs.length) this.lbTaiCaoThi();
    if (t === 'thongKe' && !this.lbTK) this.lbTaiThongKe();
    if (t === 'maQua' && !this.lbMQDs.length) this.lbTaiMaQua();
    if (t === 'heSo' && !this.lbHSDs.length) this.lbTaiHeSo();
    if (t === 'moKhoa') this.lbTaiMoKhoa();
    if (t === 'tinhNang') this.lbTaiTinhNang();
  },
  /**
   * ⚠⚠ BA LÝ DO danh sách rỗng, và trước đây cả ba ra CÙNG MỘT màn hình trắng:
   *   1. Chưa chạy docs/SQL_LENH_BAI_2.sql — view chưa tồn tại.
   *   2. Tài khoản đó chưa đẩy bản lưu lên máy chủ lần nào.
   *   3. Gõ tên mà người đó chưa bấm Khoe nên chưa có tên.
   *   Phải nói thẳng lý do, đừng để người dùng ngồi tìm một cái bảng chưa có.
   */
  _lbNhanLoi(r) {
    if (r && r.thieuBang) return 'Chưa chạy docs/SQL_LENH_BAI_2.sql trên Supabase.';
    return 'Không đọc được danh sách — ' + ((r && r.reason) || 'mất kết nối') + '.';
  },
  async lbTaiNguoi() {
    this.lbNguoiTai = true; this.lbNguoiLoi = '';
    try {
      const r = await cloudNguoiChoiDs(50);
      if (r.ok) this.lbNguoi = r.rows;
      else { this.lbNguoi = []; this.lbNguoiLoi = this._lbNhanLoi(r); }
    } catch (e) { this.lbNguoi = []; this.lbNguoiLoi = 'Không kết nối được.'; }
    finally { this.lbNguoiTai = false; }
  },
  async lbTimNguoi() {
    const t = (this.lbTimTu || '').trim();
    if (!t) { this.lbTaiNguoi(); return; }              // xoá ô tìm là quay về danh sách gần đây
    this.lbNguoiTai = true; this.lbNguoiLoi = '';
    try {
      const r = await cloudTimNguoiChoi(t, 30);
      if (r.ok) this.lbNguoi = r.rows;
      else { this.lbNguoi = []; this.lbNguoiLoi = this._lbNhanLoi(r); }
    } catch (e) { this.lbNguoi = []; this.lbNguoiLoi = 'Không kết nối được.'; }
    finally { this.lbNguoiTai = false; }
  },
  lbTenNguoi(r) { return (r && r.ten) || 'Chưa đặt tên'; },
  // ⚠ Phải kèm điều kiện mốc: dòng khoá đã hết hạn vẫn nằm lại trong bảng làm lịch sử.
  lbDangKhoa(uid) { return (this.lbKhoa || []).some((k) => k.user_id === uid && !this.lbKhoaHetHan(k)); },
  /** Người chơi quá 7 ngày không đồng bộ. Dùng để gửi cáo thị mời quay lại kèm hộp quà. */
  async lbTaiMatTich() {
    this.lbNguoiTai = true; this.lbNguoiLoi = ''; this.lbTimTu = '';
    try {
      const r = await cloudNguoiChoiDs(200);
      if (!r.ok) { this.lbNguoi = []; this.lbNguoiLoi = this._lbNhanLoi(r); return; }
      const moc = now() - 7 * 86400000;
      this.lbNguoi = r.rows.filter((x) => !x.updated_at || Date.parse(x.updated_at) <= moc);
    } catch (e) { this.lbNguoi = []; this.lbNguoiLoi = 'Không kết nối được.'; }
    finally { this.lbNguoiTai = false; }
  },
  /** Gỡ một hồ sơ khỏi Phong Vân Bảng. Dùng cho tên nhân vật tục tĩu. */
  lbGoHoSo(n) {
    if (!n || !n.user_id) return;
    this.hoiXacNhan({
      tieuDe: 'Gỡ Khỏi Phong Vân Bảng',
      loi: 'Hồ sơ của ' + this.lbTenNguoi(n) + ' sẽ biến mất khỏi bảng xếp hạng và khỏi đường khoe.',
      canhBao: 'Người chơi bấm Khoe lần nữa là hồ sơ hiện lại. Muốn chặn hẳn thì khoá tài khoản.',
      nut: 'Gỡ', nguy: true,
      xong: async () => {
        const r = await cloudHoSoXoa(n.user_id);
        if (!r.ok) { this.showToast('Không gỡ được — ' + r.reason); return; }
        n.ten = null; n.tong_cap = 0; n.chien_luc = 0;   // dòng vẫn ở đó, chỉ mất phần hồ sơ
        this.showToast('Đã gỡ khỏi Phong Vân Bảng.');
      },
    });
  },

  // ---------- LỆNH BÀI · tab MÃ QUÀ ----------
  async lbTaiMaQua() {
    this.lbMQTai = true;
    try { const r = await cloudMaQuaDs(); if (r.ok) this.lbMQDs = r.rows; else if (r.thieuBang) this.showToast('Chưa chạy docs/SQL_LENH_BAI_5.sql trên Supabase.'); }
    catch (e) {} finally { this.lbMQTai = false; }
  },
  /**
   * Điền nhanh: MỞ NGAY, hết hạn sau 7 ngày.
   * ⚠⚠ KHÔNG bê nút "14 Ngày" của Sự Kiện sang đây. Nút đó đặt mốc mở là ĐẦU GIỜ TỚI — hợp với
   *   sự kiện (cần báo trước), nhưng với mã quà thì tác giả tạo xong đưa mã cho người chơi ngay,
   *   và họ gõ vào chỉ nhận được đúng một câu "Mã không dùng được" suốt tối đa một giờ.
   */
  lbMQNhanh() {
    this.lbMQ.moLuc = this.lbChoOInput(now());
    this.lbMQ.dongLuc = this.lbChoOInput(now() + 7 * 86400000);
  },
  lbMQKeChu(r) { return this.quaKeChu((r && r.noi_dung) || {}); },
  lbMQLuotChu(r) {
    if (!r) return '';
    return (r.luot_toi_da > 0) ? (this.fmt(r.luot_da_dung || 0) + '/' + this.fmt(r.luot_toi_da) + ' lượt')
                               : (this.fmt(r.luot_da_dung || 0) + ' lượt · không giới hạn');
  },
  /**
   * Trạng thái mã, nói THẲNG lý do không đổi được.
   * ⚠ Người chơi chỉ nhận đúng một câu "Mã không dùng được" (cố ý, để không ai dò mã). Người BAN
   *   LỆNH thì phải thấy rõ vì sao — không thì ngồi đoán như tôi vừa bắt ngươi làm.
   */
  lbMQTrangThai(r) {
    void this._tick;
    if (!r) return { chu: '', mau: 'text-slate-500' };
    const t = now();
    if (r.mo_luc && t < Date.parse(r.mo_luc)) return { chu: 'Chưa tới giờ mở', mau: 'text-sky-300' };
    if (r.dong_luc && t >= Date.parse(r.dong_luc)) return { chu: 'Đã hết hạn', mau: 'text-slate-500' };
    if (r.luot_toi_da > 0 && (r.luot_da_dung || 0) >= r.luot_toi_da) return { chu: 'Hết lượt', mau: 'text-rose-300' };
    return { chu: 'Đang dùng được', mau: 'text-jade' };
  },
  lbMQTao() {
    const q = this.lbMQ;
    const ma = (q.ma || '').trim().toUpperCase();
    // ⚠ Khuôn mã chốt cứng ở máy chủ là ^[A-Z0-9_]{3,32}$. Chặn sớm ở đây cho khỏi gõ xong bị từ chối.
    if (!/^[A-Z0-9_]{3,32}$/.test(ma)) { this.showToast('Mã chỉ gồm chữ hoa, số và gạch dưới, từ 3 tới 32 ký tự.'); return; }
    const noiDung = {};
    if (+q.bac > 0) noiDung.bac = Math.min(2000000, +q.bac);
    if (+q.honThach > 0) noiDung.honThach = Math.min(100000, +q.honThach);
    if (+q.nguyenBao > 0) noiDung.nguyenBao = Math.min(10000, +q.nguyenBao);
    if (+q.diem > 0) noiDung.diemSuKien = Math.min(100000, +q.diem);
    if (!Object.keys(noiDung).length) { this.showToast('Mã chưa có phần thưởng nào.'); return; }
    // ⚠⚠ Mã TỰ ĐỘNG là quà phát cho cả làng — người chơi không phải làm gì. Hỏi trước.
    if (q.tuDong) {
      this.hoiXacNhan({
        tieuDe: 'Quà Tự Động',
        loi: 'Mọi người đăng nhập trong khoảng mốc sẽ tự nhận ' + this.quaKeChu(noiDung) + '.',
        canhBao: 'Người chơi không phải gõ gì. Gỡ mã đi thì ai đã nhận vẫn giữ quà.',
        nut: 'Tạo Mã', nguy: true,
        xong: () => { this._lbMQGui(ma, noiDung); },
      });
      return;
    }
    this._lbMQGui(ma, noiDung);
  },
  async _lbMQGui(ma, noiDung) {
    const q = this.lbMQ;
    const r = await cloudMaQuaTao({
      ma, noiDung, luotToiDa: +q.luotToiDa || 0, tuDong: !!q.tuDong,
      moLuc: q.moLuc || null, dongLuc: q.dongLuc || null, ghiChu: q.ghiChu || '',
    });
    if (!r.ok) { this.showToast('Không tạo được — ' + r.reason); return; }
    this.showToast('Đã tạo mã ' + ma + '.');
    this.lbMQ = { ma: '', bac: 0, honThach: 0, nguyenBao: 0, diem: 0, luotToiDa: 1, tuDong: false, moLuc: '', dongLuc: '', ghiChu: '' };
    this.lbTaiMaQua();
  },
  lbMQXoa(r) {
    if (!r || !r.ma) return;
    this.hoiXacNhan({
      tieuDe: 'Gỡ Mã',
      loi: 'Mã ' + r.ma + ' sẽ không đổi được nữa.',
      canhBao: 'Ai đã đổi rồi thì vẫn giữ quà.',
      nut: 'Gỡ', nguy: true,
      xong: async () => {
        const rr = await cloudMaQuaXoa(r.ma);
        if (!rr.ok) { this.showToast('Không gỡ được — ' + rr.reason); return; }
        this.lbMQDs = this.lbMQDs.filter((x) => x.ma !== r.ma);
        this.showToast('Đã gỡ mã.');
      },
    });
  },

  // ---------- LỆNH BÀI · tab MỞ KHOÁ ----------
  lbMKTai: false, lbMKLoi: '', lbMKChuyen: 0,
  async lbTaiMoKhoa() {
    this.lbMKTai = true; this.lbMKLoi = '';
    try {
      const r = await cloudMoKhoaDs();
      if (!r.ok) { this.lbMKLoi = r.thieuBang ? 'Chưa chạy docs/SQL_LENH_BAI_8.sql trên Supabase.' : ('Không đọc được — ' + r.reason + '.'); return; }
      const d = (r.rows || []).find((x) => x.khoa === 'tran_chuyen');
      this.lbMKChuyen = d ? Math.max(0, Math.floor(Number(d.gia_tri) || 0)) : 0;
    } catch (e) { this.lbMKLoi = 'Không kết nối được.'; }
    finally { this.lbMKTai = false; }
  },
  lbMKDat(n) {
    const v = Math.max(0, Math.min(TRUNG_SINH_MAX, Math.floor(n)));
    if (v === this.lbMKChuyen) return;
    // ⚠⚠ Mở thêm là việc không lùi được về mặt trải nghiệm: người chơi thấy Đốn Ngộ Cảnh sáng lên
    //   rồi hạ xuống là mất uy tín. Hạ thì không ai tụt cấp, chỉ không đi tiếp được.
    this.hoiXacNhan({
      tieuDe: v > this.lbMKChuyen ? 'Mở Thêm Trùng Sinh' : 'Hạ Số Chuyển Đang Mở',
      loi: v === 0 ? 'Đóng hẳn Đốn Ngộ Cảnh — cả giang hồ dừng ở cấp 100.'
                   : ('Mở ' + v + ' chuyển. Cấp tối đa thành ' + (100 + v * 10) + '.'),
      canhBao: v > this.lbMKChuyen
        ? 'Người chơi thấy Đốn Ngộ Cảnh sáng lên rồi hạ xuống là mất uy tín.'
        : 'Người đã chuyển giữ nguyên mức tối đa của họ, chỉ không đi tiếp được.',
      nut: v > this.lbMKChuyen ? 'Mở' : 'Hạ', nguy: true,
      xong: async () => {
        const r = await cloudMoKhoaDat('tran_chuyen', v);
        if (!r.ok) { this.showToast('Không đặt được — ' + r.reason); return; }
        this.lbMKChuyen = v;
        this.showToast(v === 0 ? 'Đã đóng Đốn Ngộ Cảnh.' : ('Đã mở ' + v + ' chuyển.'));
        this.taiMoKhoa();
      },
    });
  },

  // ---------- LỆNH BÀI · tab TÍNH NĂNG ----------
  // Bảng `tinh_nang`: mỗi hệ thống của lộ trình một cờ, mặc định tắt. Xem docs/LO_TRINH_3_NAM.md.
  async lbTaiTinhNang() {
    this.lbTNTai = true; this.lbTNLoi = '';
    try {
      const r = await cloudTinhNangDs();
      if (!r.ok) { this.lbTNLoi = r.thieuBang ? 'Chưa chạy docs/SQL_LENH_BAI_9.sql trên Supabase.' : ('Không đọc được — ' + r.reason + '.'); return; }
      demTinhNang(this.state, r.rows, now());
      this._tick++;
    } catch (e) { this.lbTNLoi = 'Không kết nối được.'; }
    finally { this.lbTNTai = false; }
  },
  /** Ba quãng lộ trình, mỗi quãng một khối. Danh sách lấy từ data, không viết tay ở giao diện. */
  get lbTNNhom() {
    return TINH_NANG_DOT.map((d) => ({ ten: d, muc: TINH_NANG.filter((t) => t.dot === d) }));
  },
  lbTNTrangThai(ma) { void this._tick; return tinhNangTrangThai(this.state, ma); },
  /**
   * Chữ bên phải mỗi thẻ: AI ĐANG THẤY tính năng đó.
   * ⚠ KHÔNG lặp lại tên mức đang chọn — nút đã tô sáng rồi. Bản đầu ghi đúng ba chữ "Cả Giang Hồ"
   *   hai lần trên cùng một thẻ; nhìn ảnh chụp mới thấy.
   * ⚠ Mức Tắt không hiện gì: tắt là mặc định, không đáng một dòng chữ.
   */
  lbTNChu(ma) {
    const t = this.lbTNTrangThai(ma);
    if (t === 'mo') return { chu: 'Người chơi đang thấy', mau: 'text-jade' };
    if (t === 'thu') return { chu: 'Chỉ bạn thấy', mau: 'text-amber-300' };
    if (t === 'tat') return { chu: '', mau: 'text-slate-500' };
    return { chu: 'Chưa Đọc Được', mau: 'text-rose-300' };
  },
  /**
   * Đặt một cờ. `v` là một trong ba: `tat` · `thu` · `mo`.
   * ⚠⚠ Hỏi xác nhận ở đúng hai lối: MỞ cho cả giang hồ, và RỜI khỏi trạng thái đang mở cho cả
   *   giang hồ. Hai lối đó người chơi nhìn thấy ngay. Lối `tat` sang `thu` thì không ai thấy gì
   *   nên hỏi là hỏi thừa.
   */
  lbTNDat(ma, v) {
    const t = TINH_NANG_BY_MA[ma]; if (!t) return;
    const cu = this.lbTNTrangThai(ma);
    if (cu === v) return;
    const chuaDung = 'Chưa có màn nào đọc cờ này. Bật lên không đổi gì trong game.';
    if (v === 'mo') {
      this.hoiXacNhan({
        tieuDe: 'Mở Cho Cả Giang Hồ',
        loi: t.ten + ' hiện ra với mọi người chơi.',
        canhBao: t.daDung ? 'Việc này ghi vào nhật ký, không xoá được.' : chuaDung,
        nut: 'Mở', nguy: true,
        xong: () => { this._lbTNGui(ma, v); },
      });
      return;
    }
    if (cu === 'mo') {
      this.hoiXacNhan({
        tieuDe: v === 'tat' ? 'Tắt Tính Năng' : 'Thu Về Chạy Thử',
        loi: t.ten + ' biến mất khỏi game của mọi người chơi.',
        canhBao: 'Thứ người chơi đã làm trong tính năng này vẫn giữ nguyên.',
        nut: v === 'tat' ? 'Tắt' : 'Thu Về', nguy: true,
        xong: () => { this._lbTNGui(ma, v); },
      });
      return;
    }
    this._lbTNGui(ma, v);
  },
  async _lbTNGui(ma, v) {
    // ⚠ Tắt thì hạ luôn `chi_tac_gia` về true. Lần sau lỡ tay bật lại là rơi vào chạy thử, không
    //   phải rơi thẳng ra cả giang hồ.
    const bat = v !== 'tat';
    const chiTacGia = v !== 'mo';
    const r = await cloudTinhNangDat(ma, bat, chiTacGia);
    if (!r.ok) { this.showToast('Không đặt được — ' + r.reason); return; }
    await this.lbTaiTinhNang();
    this.showToast(v === 'tat' ? 'Đã tắt.' : (v === 'thu' ? 'Đang chạy thử — chỉ bạn thấy.' : 'Đã mở cho cả giang hồ.'));
  },

  // ---------- LỆNH BÀI · tab HỆ SỐ ----------
  lbHSDs: [], lbHSTai: false, lbHSLoi: '',
  lbHS: { khoa: 'exp', giaTri: 2, moLuc: '', dongLuc: '', ghiChu: '' },
  HS_TOI_DA: 5,                       // khớp ràng buộc `he_so_gia_tri_hop_le` phía máy chủ
  async lbTaiHeSo() {
    this.lbHSTai = true; this.lbHSLoi = '';
    try {
      const r = await cloudHeSoDs();
      if (r.ok) this.lbHSDs = r.rows;
      else { this.lbHSDs = []; this.lbHSLoi = r.thieuBang ? 'Chưa chạy lại docs/SQL_CHONG_GIAN_LAN.sql trên Supabase.' : ('Không đọc được — ' + r.reason + '.'); }
    } catch (e) { this.lbHSLoi = 'Không kết nối được.'; }
    finally { this.lbHSTai = false; }
  },
  lbHSKhoaChu(k) { return ({ exp: 'Kinh Nghiệm', rot_do: 'Tỉ Lệ Rơi Đồ', gia_ban: 'Giá Bán' })[k] || k; },
  lbHSNhanh() {
    const mo = new Date(now() + 3600000); mo.setMinutes(0, 0, 0);
    this.lbHS.moLuc = this.lbChoOInput(mo.getTime());
    this.lbHS.dongLuc = this.lbChoOInput(mo.getTime() + 2 * 86400000);
  },
  lbHSDat() {
    const h = this.lbHS;
    const v = Number(h.giaTri);
    if (!isFinite(v) || v <= 1) { this.showToast('Hệ số phải lớn hơn 1.'); return; }
    if (v > this.HS_TOI_DA) { this.showToast('Hệ số tối đa là ' + this.HS_TOI_DA + '.'); return; }
    if (!h.moLuc || !h.dongLuc) { this.showToast('Thiếu mốc mở hoặc mốc đóng — bấm “2 Ngày” để điền nhanh.'); return; }
    if (Date.parse(h.dongLuc) <= Date.parse(h.moLuc)) { this.showToast('Mốc đóng phải sau mốc mở.'); return; }
    this.hoiXacNhan({
      tieuDe: 'Bật Hệ Số Toàn Máy Chủ',
      loi: this.lbHSKhoaChu(h.khoa) + ' nhân ' + v + ' lần cho mọi người chơi, từ ' + h.moLuc.replace('T', ' ') + ' tới ' + h.dongLuc.replace('T', ' ') + '.',
      canhBao: h.khoa === 'exp'
        ? 'Chốt chống gian lận đọc cùng bảng này nên mức tối đa tự nới theo. Chưa chạy lại SQL_CHONG_GIAN_LAN.sql thì cả làng bị ghi sổ oan.'
        : 'Việc này ghi vào nhật ký, không xoá được.',
      nut: 'Bật', nguy: true,
      xong: () => { this._lbHSGui(v); },
    });
  },
  async _lbHSGui(v) {
    const h = this.lbHS;
    const r = await cloudHeSoDat({ khoa: h.khoa, giaTri: v, moLuc: h.moLuc, dongLuc: h.dongLuc, ghiChu: h.ghiChu });
    if (!r.ok) { this.showToast('Không bật được — ' + r.reason); return; }
    this.showToast('Đã bật hệ số.');
    this.lbHS = { khoa: 'exp', giaTri: 2, moLuc: '', dongLuc: '', ghiChu: '' };
    this.lbTaiHeSo();
    this.taiHeSo();
  },
  lbHSXoa(r) {
    if (!r || !r.id) return;
    this.hoiXacNhan({
      tieuDe: 'Gỡ Hệ Số',
      loi: this.lbHSKhoaChu(r.khoa) + ' ×' + r.gia_tri + ' sẽ ngừng ngay.',
      canhBao: 'Kinh nghiệm người chơi đã nhận thì vẫn giữ.',
      nut: 'Gỡ', nguy: true,
      xong: async () => {
        const rr = await cloudHeSoXoa(r.id);
        if (!rr.ok) { this.showToast('Không gỡ được — ' + rr.reason); return; }
        this.lbHSDs = this.lbHSDs.filter((x) => x.id !== r.id);
        this.showToast('Đã gỡ hệ số.');
        this.taiHeSo();
      },
    });
  },

  // ---------- LỆNH BÀI · tab THỐNG KÊ ----------
  async lbTaiThongKe() {
    this.lbTKTai = true; this.lbTKLoi = '';
    try {
      const r = await cloudThongKe();
      if (r.ok) this.lbTK = r.row;
      else { this.lbTK = null; this.lbTKLoi = r.thieuBang ? 'Chưa chạy docs/SQL_LENH_BAI_4.sql trên Supabase.' : ('Không đọc được — ' + r.reason + '.'); }
    } catch (e) { this.lbTK = null; this.lbTKLoi = 'Không kết nối được.'; }
    finally { this.lbTKTai = false; }
  },
  lbXemNguoi(uid) {
    if (this.lbNguoiChon === uid) { this.lbNguoiChon = null; this.lbSave = null; return; }
    this.lbNguoiChon = uid; this.lbSave = null;         // đổi người thì bỏ bản tóm tắt cũ, kẻo đọc nhầm số
  },
  /** Đọc bản lưu MỘT người rồi rút tóm tắt. ⚠ Nặng ~120 KB — chỉ gọi khi bấm nút, đừng gọi trong vòng lặp. */
  async lbSoiSave(uid) {
    this.lbSaveTai = true; this.lbSave = null;
    try {
      const r = await cloudDocSaveCua(uid);
      if (!r.ok || !r.row) { this.showToast('Không đọc được bản lưu.'); return; }
      this.lbSave = this.lbTomTatSave(r.row);
    } catch (e) { this.showToast('Không đọc được bản lưu.'); }
    finally { this.lbSaveTai = false; }
  },
  /**
   * Rút số từ bản lưu của người khác.
   * ⚠⚠ Save là jsonb do MÁY NGƯỜI CHƠI gửi lên. Ô nào cũng có thể thiếu hoặc sai kiểu.
   *   Đọc phải phòng thủ từng vế — soi một bản lưu hỏng mà ném lỗi là vỡ cả màn Lệnh Bài.
   */
  lbTomTatSave(row) {
    const d = (row && row.data) || {};
    const so = (v) => (typeof v === 'number' && isFinite(v)) ? v : 0;
    const sk = (d.skills && typeof d.skills === 'object') ? d.skills : {};
    const ids = Object.keys(sk);
    const inv = (d.inventory && typeof d.inventory === 'object') ? d.inventory : {};
    return {
      ten: (d.player && d.player.name) || 'Chưa đặt tên',
      capChienDau: levelFromXp(so(sk.chienDau && sk.chienDau.xp)),
      capNghe: ids.reduce((t, id) => t + (id === 'chienDau' ? 0 : levelFromXp(so(sk[id] && sk[id].xp))), 0),
      gioLam: Math.round(ids.reduce((t, id) => t + so(sk[id] && sk[id].timeMs), 0) / 3600000),
      bac: so(d.currencies && d.currencies.bac),
      honThach: so(d.currencies && d.currencies.honThach),
      nguyenBao: so(d.currencies && d.currencies.nguyenBao),
      diemSuKien: so(d.suKien && d.suKien.diem),
      soVatPham: Object.keys(inv).length,
      soTrangBi: Array.isArray(d.gearBag) ? d.gearBag.length : 0,
      soDanhHieu: (d.titles && Array.isArray(d.titles.owned)) ? d.titles.owned.length : 0,
      luuLuc: (row && row.updated_at) || null,
    };
  },
  /** Cầm mã tài khoản sang tab khác. Bỏ hẳn việc chép tay chuỗi 36 ký tự. */
  lbSangQua(uid) { this.lbQuaUid = uid; this.lbTab = 'qua'; },
  lbSangKhoa(uid) { this.lbKhoaUid = uid; this.lbTab = 'khoa'; },

  // ---------- LỆNH BÀI · tab NHẬT KÝ (sổ chỉ thêm được) ----------
  async lbTaiNhatKy() {
    this.lbNhatKyTai = true;
    try { const r = await cloudNhatKyDs(100, this.lbNhatKyLoc || null); if (r.ok) this.lbNhatKy = r.rows; }
    catch (e) {} finally { this.lbNhatKyTai = false; }
  },
  lbDoiLocNhatKy(v) { this.lbNhatKyLoc = v; this.lbNhatKyChon = null; this.lbTaiNhatKy(); },
  lbViecChu(v) { return ({ su_kien: 'Sự Kiện', qua_tang: 'Hộp Quà', khoa_tai_khoan: 'Khoá Tài Khoản' })[v] || v; },
  lbThaoTacChu(v) { return ({ INSERT: 'Thêm', UPDATE: 'Sửa', DELETE: 'Xoá' })[v] || v; },
  lbChiTietChu(d) { try { return JSON.stringify((d && d.chi_tiet) || {}, null, 1); } catch (e) { return '—'; } },
  /**
   * ⚠⚠ ĐÈN BÁO LỆNH LẠ. Toàn bộ quyền của Lệnh Bài treo trên đúng một điều kiện: `auth.uid()` bằng
   *   uid tác giả. Lộ mật khẩu là mất tất — SQL không vá được chuyện đó. Sổ nhật ký là thứ duy nhất
   *   còn lại để biết, nên dòng nào do tài khoản khác ra lệnh phải đập vào mắt ngay.
   */
  get lbLenhLa() {
    const uid = (this.author && this.author.uid) || '';
    return (this.lbNhatKy || []).filter((d) => d.ai && d.ai !== uid).length;
  },
  lbLaLenhLa(d) {
    const uid = (this.author && this.author.uid) || '';
    return !!(d && d.ai && d.ai !== uid);
  },

  // ---------- SỰ KIỆN — đường ĐỌC, chạy cho MỌI người chơi ----------
  /**
   * Đọc lịch sự kiện rồi đệm hai cái mốc vào save.
   * ⚠ Từ lúc đệm được rồi, mất mạng vẫn suy ra sự kiện còn hay hết — vì mốc là thời gian tuyệt đối.
   * ⚠ Nuốt lỗi: chưa chạy tệp SQL thì hàm này lỗi, mà lỗi ở đây KHÔNG được làm vỡ đường lưu save.
   */
  async taiSuKien() {
    try {
      const r = await cloudSuKienDs();
      if (!r.ok) return;
      demSuKien(this.state, r.rows, now());
      // Lịch vừa đệm xong: sự kiện nào đã đóng thì dọn ngay, và BÁO một lần — đừng im lặng nuốt đồ.
      const daLam = donSuKien(this.state, now());
      const mat = daLam.filter((x) => x.viec === 'vatPham');
      if (mat.length) this.showToast('Sự kiện đã đóng — ' + mat.length + ' loại vật phẩm sự kiện đã tan biến.');
      if (daLam.some((x) => x.viec === 'veLang')) this.showToast('Sự kiện đã đóng — bạn được đưa về ' + this.LOCATIONS[0].name + '.');
      this._tick++;
    } catch (e) {}
  },
  get suKienDangChay() { void this._tick; return suKienHienHanh(this.state, now(), this.isAuthorAccount); },
  get suKienConLaiText() {
    void this._tick;
    const ma = this.suKienDangChay; if (!ma) return '';
    const ms = suKienConLai(this.state, ma, now(), this.isAuthorAccount);
    const ng = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000);
    return ng > 0 ? ('Còn ' + ng + ' ngày ' + h + ' giờ') : ('Còn ' + h + ' giờ');
  },
  /**
   * Cộng nội dung một hộp quà vào bản lưu.
   * ⚠⚠ BỐN KHOÁ, khớp đúng danh sách cho phép của ràng buộc `qua_hop_le` phía máy chủ. Thiếu một
   *   vế là quà khoá đó phát đi mất trắng — máy chủ đã đánh dấu đã trả mà người chơi không được gì.
   * ⚠ Dùng CHUNG cho hộp quà và mã đổi quà. Hai đường nhận mà cộng khác nhau là chỗ sinh lệch.
   */
  _congQua(n) {
    if (!n) return;
    if (n.bac) this.state.currencies.bac = (this.state.currencies.bac || 0) + n.bac;
    if (n.honThach) this.state.currencies.honThach = (this.state.currencies.honThach || 0) + n.honThach;
    if (n.nguyenBao) this.state.currencies.nguyenBao = (this.state.currencies.nguyenBao || 0) + n.nguyenBao;
    if (n.diemSuKien) congDiem(this.state, n.diemSuKien);
    // ⚠ Bỏ qua mã không còn trong game. Quà cũ phát từ lâu có thể mang mã đã xoá khỏi `items.js`
    //   — cộng bừa vào hành lý là đẻ ra một ô không có tên, không có art, không bán được.
    const it = n.items;
    if (it && typeof it === 'object') {
      for (const id of Object.keys(it)) {
        const sl = Math.floor(Number(it[id]) || 0);
        if (sl <= 0 || !this.ITEMS[id]) continue;
        this.state.inventory[id] = (this.state.inventory[id] || 0) + sl;
      }
    }
  },
  /** Liệt kê nội dung quà thành một dòng chữ. */
  quaKeChu(n) {
    const ke = [];
    if (!n) return '';
    if (n.bac) ke.push('+' + this.fmt(n.bac) + ' Bạc');
    if (n.honThach) ke.push('+' + this.fmt(n.honThach) + ' Hồn Thạch');
    if (n.nguyenBao) ke.push('+' + this.fmt(n.nguyenBao) + ' Nguyên Bảo');
    if (n.diemSuKien) ke.push('+' + this.fmt(n.diemSuKien) + ' Điểm Sự Kiện');
    const it = n.items;
    if (it && typeof it === 'object') {
      for (const id of Object.keys(it)) {
        const t = this.ITEMS[id];
        ke.push('+' + this.fmt(it[id]) + ' ' + (t ? t.name : id));
      }
    }
    return ke.join(' · ');
  },
  /** Nhận hết quà đang chờ. Gọi khi vào game và khi bấm tay. */
  async nhanQuaChoSan() {
    try {
      const r = await cloudQuaChoNhan();
      if (!r.ok || !r.rows.length) return 0;
      let dem = 0;
      for (const q of r.rows) {
        if (quaDaNhan(this.state, q.id)) continue;
        const rr = await cloudNhanQua(q.id);
        if (!rr.ok || !rr.noiDung) continue;       // rỗng = người khác/lần trước đã nhận rồi
        const n = rr.noiDung;
        this._congQua(n);
        ghiQuaDaNhan(this.state, q.id);
        // ⚠⚠ LƯU NGAY SAU TỪNG MÓN, đừng đợi tới cuối vòng lặp và càng đừng đợi autosave.
        //   Máy chủ đã đánh dấu `nhan_luc` rồi — đó là việc KHÔNG LÙI ĐƯỢC. Nếu người chơi đóng
        //   tab ngay lúc này thì tiền chỉ nằm trong RAM, mà máy chủ thì coi như đã trả xong.
        //   Món quà bốc hơi vĩnh viễn và không có đường nào đòi lại.
        // ⚠⚠ DÒNG NÀY PHẢI ĐỨNG SÁT `ghiQuaDaNhan`. Chen bất cứ việc gì vào giữa là mở đường cho
        //   một lỗi ở đoạn chen làm mất luôn lượt lưu — đúng cái bẫy mất quà nói trên.
        try { Storage.save(this.state); } catch (e) {}
        dem++;
        // Toast bay qua vài giây rồi mất. Ghi vào chuông để còn xem lại món quà gồm những gì.
        // Đây cũng là chỗ DUY NHẤT `loi_nhan` hiện ra — tác giả gõ lời nhắn mà không ai đọc thì gõ làm gì.
        this.pushNotif('khac', 'Nhận hộp quà', this.quaKeChu(n) + (q.loi_nhan ? ' — ' + q.loi_nhan : ''));
      }
      if (dem) this.showToast('Nhận được ' + dem + ' hộp quà.');
      return dem;
    } catch (e) { return 0; }
  },

  // ---------- HỆ SỐ TOÀN MÁY CHỦ — đường ĐỌC, chạy cho MỌI người chơi ----------
  /**
   * Đọc các đợt hệ số đang chạy rồi đệm vào bản lưu.
   * ⚠⚠ Chốt chống gian lận phía máy chủ NHÂN ĐÚNG hệ số này vào trần. Đổi một bên mà quên bên kia
   *   là cả làng bị ghi sổ oan. Cả hai cùng đọc một bảng `he_so_may_chu`.
   * ⚠ Nuốt lỗi: chưa chạy lại SQL_CHONG_GIAN_LAN.sql thì hàm này lỗi, và lỗi ở đây KHÔNG được
   *   làm vỡ đường lưu save. Mất mạng thì giữ nguyên hệ số cũ đã đệm.
   * ⚠ Nhiều đợt chồng nhau thì lấy đợt CAO NHẤT — y hệt cách chốt máy chủ lấy `max(gia_tri)`.
   */
  async taiHeSo() {
    try {
      const r = await cloudHeSoDs();
      if (!r.ok) return;
      const moi = { exp: 1, rotDo: 1, giaBan: 1 };
      const K = { exp: 'exp', rot_do: 'rotDo', gia_ban: 'giaBan' };
      for (const d of r.rows) {
        const k = K[d.khoa]; if (!k) continue;
        const v = Number(d.gia_tri);
        if (isFinite(v) && v > moi[k]) moi[k] = v;
      }
      const cu = this.state.heSo || { exp: 1, rotDo: 1, giaBan: 1 };
      this.state.heSo = moi;
      // Báo MỘT lần khi đợt mới bật, đừng nhắc lại mỗi nhịp đọc.
      if (moi.exp !== (cu.exp || 1) && moi.exp > 1) this.pushNotif('caoThi', 'Kinh nghiệm toàn máy chủ', 'Đang nhân ' + moi.exp + ' lần.');
      if (moi.rotDo !== (cu.rotDo || 1) && moi.rotDo > 1) this.pushNotif('caoThi', 'Tỉ lệ rơi đồ toàn máy chủ', 'Đang nhân ' + moi.rotDo + ' lần.');
      this._tick++;
    } catch (e) {}
  },
  get heSoDangChay() {
    void this._tick;
    const h = this.state.heSo || {};
    const ds = [];
    if ((h.exp || 1) > 1) ds.push('Kinh Nghiệm ×' + h.exp);
    if ((h.rotDo || 1) > 1) ds.push('Rơi Đồ ×' + h.rotDo);
    if ((h.giaBan || 1) > 1) ds.push('Giá Bán ×' + h.giaBan);
    return ds;
  },

  // ---------- MỞ KHOÁ NỘI DUNG — đường ĐỌC, chạy cho MỌI người chơi ----------
  /**
   * Đọc số lần Trùng Sinh máy chủ đang mở rồi đệm vào bản lưu.
   * ⚠ Nuốt lỗi: chưa chạy SQL_LENH_BAI_8.sql thì hàm này lỗi, và lỗi ở đây KHÔNG được làm vỡ
   *   đường lưu save. Chưa đệm được thì `chuyenDangMo` trả 0, tức khoá — phía an toàn.
   */
  async taiMoKhoa() {
    try {
      const r = await cloudMoKhoaDs();
      if (!r.ok || !r.rows.length) return;
      if (!this.state.moKhoa || typeof this.state.moKhoa !== 'object') this.state.moKhoa = {};
      const cu = this.state.moKhoa.tranChuyen || 0;
      for (const d of r.rows) {
        if (d.khoa === 'tran_chuyen') this.state.moKhoa.tranChuyen = Math.max(0, Math.floor(Number(d.gia_tri) || 0));
      }
      const moi = this.state.moKhoa.tranChuyen || 0;
      // Báo MỘT lần khi mở thêm, đừng nhắc lại mỗi nhịp đọc.
      if (moi > cu) this.pushNotif('caoThi', 'Mở thêm Trùng Sinh', 'Đốn Ngộ Cảnh nay đi được ' + moi + ' chuyển, cấp tối đa ' + (100 + moi * 10) + '.');
      this._tick++;
    } catch (e) {}
  },
  get chuyenDaMo() { void this._tick; return chuyenDangMo(this.state); },

  // ---------- TÍNH NĂNG — đường ĐỌC, chạy cho MỌI người chơi ----------
  /**
   * Đọc bảng cờ bật/tắt rồi đệm vào bản lưu.
   * ⚠⚠ Đọc hỏng thì GIỮ NGUYÊN bản đã đệm, không xoá về rỗng. Rớt mạng một nhịp mà tắt sạch
   *   tính năng là người chơi đang đứng trong màn đó bị hất ra giữa chừng.
   * ⚠ Nuốt lỗi: chưa chạy SQL_LENH_BAI_9.sql thì hàm này lỗi, và lỗi ở đây KHÔNG được làm vỡ
   *   đường lưu save.
   */
  async taiTinhNang() {
    try {
      const r = await cloudTinhNangDs();
      if (!r.ok) return;
      demTinhNang(this.state, r.rows, now());
      this._tick++;
    } catch (e) {}
  },
  /**
   * CỬA DUY NHẤT mọi tính năng mới phải đi qua trước khi vẽ ra màn hình.
   * ⚠ Cờ tắt thì cửa vào KHÔNG MỌC RA. Đừng để lại một màn trống hay một nút bấm không ăn.
   * ⚠ Đây chỉ là cửa VẼ. Tính năng nào đụng tới số liệu máy chủ thì phải có luật RLS riêng.
   */
  moChua(ma) { void this._tick; return tinhNangMo(this.state, ma, this.isAuthorAccount); },

  // ---------- MÃ ĐỔI QUÀ — màn của NGƯỜI CHƠI ----------
  mqMo: false, mqO: '', mqDangDoi: false, mqKetQua: '',
  openMaQua() { this.mqMo = true; this.mqO = ''; this.mqKetQua = ''; },
  dongMaQua() { this.mqMo = false; },
  /**
   * Đổi mã người chơi gõ tay.
   * ⚠⚠ Máy chủ đã đánh dấu "đã đổi" TRƯỚC khi trả nội dung về. Phải `Storage.save` ngay, y hệt
   *   đường hộp quà — đóng tab lúc này là quà bốc hơi mà máy chủ vẫn coi như đã trả.
   * ⚠ Máy chủ không nói vì sao hỏng. Đừng đoán hộ nó: một câu duy nhất cho mọi trường hợp.
   */
  async doiMaQua() {
    const m = (this.mqO || '').trim().toUpperCase();
    if (!m) { this.mqKetQua = 'Chưa nhập mã.'; return; }
    if (!this.authUser) { this.mqKetQua = 'Phải đăng nhập mới đổi được mã.'; return; }
    this.mqDangDoi = true; this.mqKetQua = '';
    try {
      const r = await cloudDoiMaQua(m);
      if (!r.ok) { this.mqKetQua = r.thieuBang ? 'Máy chủ chưa mở tính năng này.' : 'Không kết nối được máy chủ.'; return; }
      if (!r.noiDung) { this.mqKetQua = 'Mã không dùng được.'; return; }
      this._congQua(r.noiDung);
      try { Storage.save(this.state); } catch (e) {}
      const ke = this.quaKeChu(r.noiDung);
      this.mqKetQua = 'Nhận được ' + ke + '.';
      this.mqO = '';
      this.pushNotif('khac', 'Đổi mã quà', ke);
      this._tick++;
    } catch (e) { this.mqKetQua = 'Không kết nối được máy chủ.'; }
    finally { this.mqDangDoi = false; }
  },
  /**
   * Mã TỰ ĐỘNG: quà tự rơi vào túi người đang đăng nhập trong khoảng mốc.
   * ⚠ Luật RLS chỉ lộ ra mã tự động đang trong hạn, nên danh sách này vốn đã lọc sẵn.
   * ⚠ Đổi trùng không sao: khoá chính kép phía máy chủ trả rỗng, vòng lặp bỏ qua.
   */
  async taiMaTuDong() {
    if (!this.authUser) return 0;
    try {
      const r = await cloudMaTuDongDs();
      if (!r.ok || !r.rows.length) return 0;
      let dem = 0;
      for (const m of r.rows) {
        const rr = await cloudDoiMaQua(m.ma);
        if (!rr.ok || !rr.noiDung) continue;         // rỗng = đã đổi rồi, hoặc hết lượt
        this._congQua(rr.noiDung);
        try { Storage.save(this.state); } catch (e) {}
        dem++;
        this.pushNotif('khac', 'Nhận quà', this.quaKeChu(rr.noiDung));
      }
      if (dem) { this.showToast('Nhận được ' + dem + ' phần quà.'); this._tick++; }
      return dem;
    } catch (e) { return 0; }
  },

  // ---------- CÁO THỊ — đường ĐỌC, chạy cho MỌI người chơi ----------
  /**
   * Đọc cáo thị đang trong hạn rồi bày vào chuông.
   * ⚠ Luật RLS đã lọc mốc mở và mốc đóng ở máy chủ. Cái chưa tới giờ đăng không đọc được, kể cả
   *   khi mở bảng điều khiển trình duyệt.
   * ⚠ Nuốt lỗi: chưa chạy SQL_LENH_BAI_3.sql thì hàm này lỗi, mà lỗi ở đây KHÔNG được làm vỡ
   *   đường lưu save.
   * ⚠⚠ `caoThiDaXem` chặn bày lại. Không có nó thì cứ 10 phút chuông lại kêu với CÙNG một cáo thị.
   */
  async taiCaoThi() {
    try {
      const r = await cloudCaoThiDs();
      if (!r.ok || !r.rows.length) return 0;
      let dem = 0;
      for (const c of r.rows) {
        if (caoThiDaXem(this.state, c.id)) continue;
        ghiCaoThiDaXem(this.state, c.id);
        this.pushNotif('caoThi', c.tieu_de || 'Cáo thị', c.noi_dung || '');
        // Mức thường chỉ nằm im trong chuông. Hai mức kia đập vào mắt ngay.
        if (c.muc === 'quan_trong' || c.muc === 'bao_tri') this.showToast(c.tieu_de || 'Cáo thị');
        dem++;
      }
      if (dem) this._tick++;
      return dem;
    } catch (e) { return 0; }
  },

  // ---------- SỰ KIỆN — màn chơi (view 'suKien') ----------
  // Trạng thái mở/đóng đọc qua suKienDangChay (đã có ở trên, tôn trọng cờ chi_tac_gia).
  get svDef() { const ma = this.suKienDangChay; return ma ? SU_KIEN_BY_MA[ma] : null; },
  /** Danh sách nghề cho sidebar: kĩ năng sự kiện chỉ hiện khi sự kiện của nó đang mở. */
  // THANH DỌC: kĩ năng sự kiện chỉ hiện khi sự kiện đang mở — bấm vào lúc đóng cũng không cày được.
  get skillIdsHienThi() {
    void this._tick;
    return Object.keys(this.SKILLS).filter((id) => { const s = this.SKILLS[id]; return !s.suKien || this.svMoCua(s.suKien); });
  },
  // HỒ SƠ: hiện CỐ ĐỊNH cả sáu kĩ năng sự kiện, mở hay đóng cũng vậy (user chốt 2026-08-08).
  //   Cấp kĩ năng sự kiện giữ riêng qua từng năm — giấu đi thì cày cả đợt xong không còn chỗ nào xem.
  get skillIdsHoSo() { void this._tick; return Object.keys(this.SKILLS); },
  get svDiem() { void this._tick; return (this.state.suKien && this.state.suKien.diem) || 0; },
  svMoCua(ma) { void this._tick; return suKienDangMo(this.state, ma, now(), this.isAuthorAccount); },
  /** Nav chỉ hiện mục Sự Kiện khi có sự kiện đang mở hoặc sắp mở trong 7 ngày. */
  get svNavHien() {
    void this._tick;
    if (this.suKienDangChay) return true;
    const sm = suKienSapMo(this.state, now(), this.isAuthorAccount);
    return !!(sm && sm.con < 7 * 86400000);
  },
  get svSapMoText() {
    void this._tick;
    const sm = suKienSapMo(this.state, now(), this.isAuthorAccount);
    if (!sm) return '';
    const ng = Math.floor(sm.con / 86400000), h = Math.floor((sm.con % 86400000) / 3600000);
    return (SU_KIEN_BY_MA[sm.ma] || {}).ten + ' mở sau ' + (ng > 0 ? ng + ' ngày ' + h + ' giờ' : h + ' giờ');
  },
  /** 6 vật phẩm sự kiện đang mở + số đang có + điểm đổi được. */
  get svVatPham() {
    void this._tick;
    const d = this.svDef; if (!d) return [];
    return d.vatPham.map((v, i) => {
      const co = this.state.inventory[v.id] || 0;
      return { id: v.id, name: v.name, icon: v.icon, bac: i + 1, co, diem10: SK_BAC[i].diem10,
        doiDuoc: Math.floor(co / 10) * SK_BAC[i].diem10 };
    });
  },
  get svPhuKien() {
    void this._tick;
    const d = this.svDef; if (!d) return [];
    // `co` = bậc ĐANG ĐEO ở ô, KHÔNG phải "đã từng nhận". Có trong túi mà chưa lắp thì ô vẫn trống.
    // `coTui` = đã có món đó trong túi/đang đeo -> UI nói "có rồi, lắp vào" thay vì "đi săn tiếp".
    // `art`: chưa đeo thì vẫn bày art bậc Sơ (mờ đi) — người chơi thấy trước cái mình đang săn.
    return [
      { loai: 'boi', ten: d.phuKien.boi, nguon: 'Yêu Vương', slot: 'skBoi', co: pkBacDeo(this.state, d.ma, 'boi'), eff: '+15% / +30% hiệu suất' },
      { loai: 'an', ten: d.phuKien.an, nguon: 'Bí Cảnh', slot: 'skAn', co: pkBacDeo(this.state, d.ma, 'an'), eff: '+20% / +40% kinh nghiệm' },
    ].map((p) => Object.assign(p, {
      art: artPhuKien(d.ma, p.loai, p.co || 'so'),
      coTui: ['so', 'thuong'].some((b) => coPhuKien(this.state, artPhuKien(d.ma, p.loai, b))),
    }));
  },
  /** Art phụ kiện cho bảng Bảo Vật của Yêu Vương / Bí Cảnh sự kiện (chỗ đó chỉ có `ma` + `wb.phuKien`). */
  svArtPhuKien(ma, loai, bac) { return artPhuKien(ma, loai, bac); },
  svTenPhuKien(ma, loai, bac) { return tenPhuKien(ma, loai + (bac === 'thuong' ? 'Thuong' : 'So')); },
  get svTranPham() {
    void this._tick;
    const d = this.svDef; if (!d) return [];
    // `art`: id để ico() lấy ảnh thật. Trứng có art riêng; danh hiệu/ảnh chưa có art nên để trống,
    // ico() sẽ rơi về emoji ở cột icon.
    const rows = [
      { loai: 'trung', art: 'egg_' + d.pet.base + '_linh', ten: d.pet.name + ' Noãn · Hiếm', icon: '🥚', gia: QUAY_GIA.trung, han: 'mỗi đợt' },
      // `hex`: danh hiệu có màu theo phẩm chất — bày đúng màu đó ra để người chơi thấy trước thứ
      // mình sắp đổi, khỏi phải mua rồi mới biết. Danh hiệu sự kiện ghi danh ở data/sukien.js.
      { loai: 'danhHieu', art: '', ten: 'Danh hiệu ' + d.danhHieu.name, icon: '🏷️', gia: QUAY_GIA.danhHieu, han: 'vĩnh viễn',
        hex: (this.QUALITY[(TITLE_BY_ID[d.danhHieu.id] || {}).q] || {}).hex || '' },
    ];
    // ⚠ Ảnh đại diện / ảnh bìa CHỈ bày khi sự kiện ĐÓ đã có art. Ô ảnh ở Dung Mạo chỉ hiện lúc tệp
    //   ảnh nạp được, nên bày sớm là bán 3.400 Điểm lấy hư không. Vẽ xong thì thêm mã vào tập hợp.
    if (CO_ART_DUNG_MAO.has(d.ma)) rows.push(
      { loai: 'avatar:' + d.avatar[0], art: d.avatar[0], ten: 'Ảnh đại diện · Nam', icon: '🖼️', gia: QUAY_GIA.avatar, han: 'vĩnh viễn' },
      { loai: 'avatar:' + d.avatar[1], art: d.avatar[1], ten: 'Ảnh đại diện · Nữ', icon: '🖼️', gia: QUAY_GIA.avatar, han: 'vĩnh viễn' },
      { loai: 'cover:' + d.cover, art: d.cover, ten: 'Ảnh bìa sự kiện', icon: '🏞️', gia: QUAY_GIA.cover, han: 'vĩnh viễn' },
    );
    return rows.map((r) => Object.assign(r, { daMua: this.svDaMua(r.loai), du: this.svDiem >= r.gia }));
  },
  svDaMua(loai) {
    const d = this.svDef; if (!d) return false;
    const goc = loai.split(':');
    if (goc[0] === 'danhHieu') return ((this.state.titles || {}).owned || []).includes(d.danhHieu.id);
    if (goc[0] === 'avatar') return ((this.state.player || {}).ownedAvatars || []).includes(goc[1]);
    if (goc[0] === 'cover') return ((this.state.player || {}).ownedCovers || []).includes(goc[1]);
    return daMuaTrongDot(this.state, d.ma, loai);
  },
  get svTieuHao() { return QUAY_TIEU_HAO; },
  /** Id để ico() lấy art một dòng hàng ở quầy: tiền tệ · món ăn của sự kiện đang mở · vật phẩm thường. */
  svMonArt(mon) { return mon.tienTe || (mon.monAnSuKien ? ((this.svDef || {}).monAn || {}).id : mon.itemId) || ''; },
  /** Màu PHẨM CHẤT THẬT của dòng hàng — hốc art tô theo nó, không tự đặt màu.
   *  Tiền tệ (Hồn Thạch / Nguyên Bảo) không có phẩm chất trong ITEMS nên lấy vàng. */
  svMonHex(mon) {
    if (mon.tienTe) return '#fcd34d';
    const q = (this.ITEMS[this.svMonArt(mon)] || {}).quality;
    return (this.QUALITY[q] || {}).hex || '#94a3b8';
  },
  /** Ảnh nền banner sự kiện (ảnh bìa hồ sơ dùng lại). Thiếu tệp thì thẻ img tự ẩn. */
  svCoverSrc() { const d = this.svDef; return d ? ('images/avatars/' + d.cover + '.webp') : ''; },
  svTenMon(mon) { return mon.tienTe ? ({ honThach: 'Hồn Thạch', nguyenBao: 'Nguyên Bảo' })[mon.tienTe] : (mon.monAnSuKien ? ((this.svDef || {}).monAn || {}).name : ((this.ITEMS[mon.itemId] || {}).name || mon.itemId)); },
  svDoi(itemId) {
    const r = doiVatPham(this.state, itemId, now());
    if (!r.ok) { this.showToast(r.msg); return; }
    this._tick++;
    this.showToast('Đổi ' + r.soVat + ' vật phẩm lấy ' + r.diem + ' Điểm Sự Kiện.');
  },
  svMuaTranPham(loai) {
    const d = this.svDef; if (!d) return;
    if (this.svDaMua(loai)) { this.showToast('Đã có rồi.'); return; }
    const r = muaTranPham(this.state, d.ma, loai, now());
    if (!r.ok) { this.showToast(r.msg); return; }
    // Phần đụng titles/avatar nằm ngoài engine thuần — làm ở đây.
    const goc = loai.split(':');
    if (goc[0] === 'danhHieu') { ensureTitles(this.state); const t = this.state.titles; if (!t.owned.includes(d.danhHieu.id)) { t.owned.push(d.danhHieu.id); t.moAt[d.danhHieu.id] = now(); } }
    if (goc[0] === 'avatar') { const p = this.state.player; if (!p.ownedAvatars.includes(goc[1])) p.ownedAvatars.push(goc[1]); }
    if (goc[0] === 'cover') { const p = this.state.player; if (!p.ownedCovers.includes(goc[1])) p.ownedCovers.push(goc[1]); }
    Storage.save(this.state); this._tick++;
    this.showToast('Đã đổi ' + r.gia + ' Điểm.');
  },
  svMuaTieuHao(g, i) {
    const d = this.svDef; if (!d) return;
    const r = muaTieuHao(this.state, d.ma, g, i, now());
    if (!r.ok) { this.showToast(r.msg); return; }
    this._tick++;
    this.showToast('Nhận ' + r.qty + ' ' + (r.ten === 'honThach' ? 'Hồn Thạch' : r.ten === 'nguyenBao' ? 'Nguyên Bảo' : r.ten) + '.');
  },
  svToiBanDo() {
    const d = this.svDef; if (!d) return;
    if (this.currentLocation === d.loc.id) { this._applyView('combat'); return; }
    this.startKhinhCong(d.loc.id);
  },
  // Sự kiện ĐÓNG CỬA mà người chơi còn đang cày trong đó -> dừng việc, đưa về vùng thường.
  // ⚠ KHÔNG so với "sự kiện vừa chạy lúc nãy". So THẲNG việc đang làm với mọi sự kiện KHÔNG mở.
  //   Nhờ vậy nó đúng cả khi người chơi tắt game giữa chừng rồi mở lại lúc sự kiện đã đóng —
  //   nhớ mốc "vừa chạy" trong biến thì tải lại trang là mất, người chơi cày tiếp vùng đã đóng.
  svDungKhiHetHan() {
    const dangChay = this.suKienDangChay;
    const dong = SU_KIEN_DS.filter((d) => d.ma !== dangChay);
    if (!dong.length) return false;
    const p = this.state.player, a = this.state.activity;
    const laViecCua = (d) => {
      if (!a) return false;
      if (a.type === 'dungeon') return d.biCanh.some((b) => b.id === a.dungeonId);   // lịch luyện Bí Cảnh sự kiện
      if (a.type === 'travel') return a.toId === d.loc.id;                            // đang trên đường tới vùng sự kiện
      if (a.type === 'combat') return p.location === d.loc.id;
      return a.skillId === d.skill.id || p.location === d.loc.id;                     // kĩ năng riêng của sự kiện, hoặc thu thập trong vùng
    };
    const dViec = dong.find(laViecCua);
    const dVung = dong.find((d) => p.location === d.loc.id);
    if (!dViec && !dVung) return false;
    const d = dViec || dVung;
    const tenViec = dViec ? this.actName : '';
    if (dViec) this.stop();            // stop() tự chốt thu hoạch phiên + tổng kết lịch Bí Cảnh
    if (dVung) p.location = 'lamLinhCoc';
    const loi = d.ten + ' đã kết thúc.'
      + (dViec ? ' Đã dừng: ' + tenViec + '.' : '')
      + (dVung ? ' Bạn rời ' + d.loc.name + ', về Lam Linh Cốc.' : '');
    this.showToast(loi);
    pushNotif(this.state, 'suKien', 'Sự kiện kết thúc', loi, now());
    this._tick++;
    Storage.save(this.state);
    return true;
  },

  // ---------- GIÁM SÁT (đợt C) — chỉ tài khoản tác giả ----------
  // ⚠⚠ `isAuthorAccount` chỉ để ẨN/HIỆN màn này. Nó KHÔNG phải hàng rào — ai sửa mã client
  //   cũng bật được panel. Hàng rào thật là luật RLS ở Supabase (docs/SQL_GIAM_SAT.sql):
  //   bật được panel mà không có token đúng uid thì mọi truy vấn trả về RỖNG.
  gsMo: false, gsTai: false, gsLoi: '', gsRows: [], gsChon: null, gsChiTiet: [], gsLocTacGia: true, gsMienTru: [],
  // Cửa DUY NHẤT vào Giám Sát — mở từ tab Giám Sát của Lệnh Bài. Đóng cả Cài Đặt (z-70) lẫn
  // Lệnh Bài kẻo màn này (z-59) nằm dưới.
  openGiamSat() { this.settingsModal = false; this.dongLenhBai(); this.gsMo = true; this.taiGiamSat(); },
  dongGiamSat() { this.gsMo = false; this.gsChon = null; this.gsChiTiet = []; },
  async taiGiamSat() {
    this.gsTai = true; this.gsLoi = '';
    try {
      const r = await cloudNghiVanGom(100);
      if (!r.ok) this.gsLoi = 'Không đọc được sổ — kiểm tra đã chạy SQL_GIAM_SAT.sql chưa.';
      else this.gsRows = r.rows;
      // Danh sách miễn trừ đọc RỜI: bảng khác, luật khác. Lỗi ở đây không được xoá sổ nghi vấn.
      try { const m = await cloudMienTruDs(); if (m.ok) this.gsMienTru = m.rows.map((x) => x.user_id); } catch (e) {}
      // Danh sách khoá: nút Khoá ngay trong màn này phải biết ai đang bị khoá rồi.
      try { const k = await cloudKhoaDs(); if (k.ok) this.lbKhoa = k.rows; } catch (e) {}
    } catch (e) { this.gsLoi = 'Không kết nối được.'; }
    finally { this.gsTai = false; }
  },
  /**
   * Khoá thẳng từ màn Giám Sát — trước đây phải chép mã tài khoản sang Lệnh Bài.
   * ⚠ Dùng lại `lbKhoaThem` nguyên vẹn: chỗ đó đã chặn tự khoá tài khoản tác giả và đã có hộp xác nhận.
   */
  gsKhoaNhanh(uid) {
    if (!uid) return;
    this.lbKhoaUid = uid;
    this.lbKhoaLyDo = 'khoá từ màn Giám Sát';
    this.lbKhoaThem();
  },
  gsDuocMien(uid) { return (this.gsMienTru || []).includes(uid); },
  /** Bật/tắt miễn trừ cho một tài khoản — cửa thoát hiểm khi chốt chặn oan. */
  async gsDoiMienTru(uid) {
    if (!uid) return;
    const dangMien = this.gsDuocMien(uid);
    const r = dangMien ? await cloudMienTruBo(uid) : await cloudMienTruThem(uid, 'gỡ tay ở màn Giám Sát');
    if (!r.ok) { this.showToast('Không đổi được miễn trừ.'); return; }
    this.gsMienTru = dangMien ? this.gsMienTru.filter((x) => x !== uid) : this.gsMienTru.concat([uid]);
    this.showToast(dangMien ? 'Đã bỏ miễn trừ.' : 'Đã miễn trừ — tài khoản này ghi save lại được.');
  },
  /** Bỏ dòng của chính tác giả — bảng dev (F9) tự báo động nên nó luôn đứng đầu sổ. */
  get gsHien() {
    const ds = this.gsRows || [];
    return this.gsLocTacGia ? ds.filter((r) => !r.la_tac_gia) : ds;
  },
  get gsSoTacGia() { return (this.gsRows || []).filter((r) => r.la_tac_gia).length; },
  async gsXem(uid) {
    if (this.gsChon === uid) { this.gsChon = null; this.gsChiTiet = []; return; }
    this.gsChon = uid; this.gsChiTiet = [];
    try { const r = await cloudNghiVanCua(uid, 20); if (r.ok) this.gsChiTiet = r.rows; } catch (e) {}
  },
  /** Tên bốn phép kiểm — mã khoá của máy chủ đổi sang lời người đọc được. */
  GS_PHEP: {
    nhip: 'vượt tốc độ tối đa',
    quy_gio: 'giờ làm nhiều hơn đồng hồ',
    xp_khong_gio: 'kinh nghiệm không có giờ làm',
    khoa_boc_so: 'số con hạ không khớp lần bốc số',
  },
  /** Một dòng nghi vấn -> câu chữ đọc được: "Chiến Đấu +20.166.012 · kinh nghiệm không có giờ làm · gấp 268 lần trần". */
  gsDongChu(d) {
    const ten = (k) => (k === 'bac' ? 'Bạc' : k === 'tong' ? 'Tổng giờ làm' : k === 'kills' ? 'Số con đã hạ'
      : k === 'chienDau' ? 'Chiến Đấu' : ((this.SKILLS[k] || {}).name || k));
    return (d.chi_tiet || []).map((x) => {
      const p = this.GS_PHEP[x.phep];
      return ten(x.khoa) + ' +' + this.fmt(x.tang) + (p ? ' · ' + p : '') + ' · gấp ' + x.gap + ' lần trần';
    }).join('  |  ');
  },

  // ---------- Tài khoản / Cloud (Supabase Auth) ----------
  get isLoggedIn() { return !!this.authUser; },
  get authUserEmail() { return (this.authUser && this.authUser.email) || ''; },
  // Khởi động: khôi phục phiên đã lưu + lắng nghe đổi trạng thái. Bọc try/catch để offline/CDN lỗi KHÔNG vỡ game.
  async initCloud() {
    try {
      this.authUser = await cloudGetUser();
      await cloudOnAuth((user) => {
        this.authUser = user;
        try { datCoTacGia(this.state, this.isAuthorAccount); } catch (e) {}
        // Đang đứng ở màn Sàn mà phiên vừa khôi phục xong -> tải lại Sàn ngay, đừng bắt bấm tay.
        if (user && this.view === 'market') { this.sanLoi = ''; try { this.taiSan(); } catch (e) {} }
      });
      try { datCoTacGia(this.state, this.isAuthorAccount); } catch (e) {}   // cờ CHỈ để thấy sự kiện chạy thử (chi_tac_gia); hàng rào thật là RLS
      if (this.authUser) this.cloudSyncOnLogin();   // đã đăng nhập sẵn (reload) -> kéo/so cloud
      // Lịch sự kiện đọc được KHÔNG CẦN đăng nhập — ai cũng phải biết sự kiện nào đang mở.
      // ⚠ Hoãn 2 giây như đường Phong Vân Bảng: đừng tranh băng thông với lượt kéo save lúc mở game.
      setTimeout(() => { this.taiSuKien(); }, 2000);
      // Cáo thị đọc được KHÔNG CẦN đăng nhập — thông báo bảo trì phải tới được cả khách.
      setTimeout(() => { this.taiCaoThi(); }, 3000);
      setInterval(() => { this.taiCaoThi(); }, 10 * 60 * 1000);
      // Hệ số toàn máy chủ: đệm vào bản lưu, mất mạng vẫn giữ số cũ.
      setTimeout(() => { this.taiHeSo(); }, 3500);
      setTimeout(() => { this.taiMoKhoa(); }, 3800);
      setInterval(() => { this.taiMoKhoa(); }, 10 * 60 * 1000);
      // Cờ bật/tắt tính năng: cùng nhịp 10 phút. Tác giả bật xong thì người đang mở tab thấy
      // trong vòng mười phút, không phải đợi lần mở game sau.
      setTimeout(() => { this.taiTinhNang(); }, 4200);
      setInterval(() => { this.taiTinhNang(); }, 10 * 60 * 1000);
      setInterval(() => { this.taiHeSo(); }, 10 * 60 * 1000);
      // ⚠ Đọc LẠI mỗi 10 phút. Không có nhịp này thì lệnh THU của tác giả (đóng ngay vì lỡ ban
      //   nhầm) chỉ tới được người chơi ở lần mở game sau — họ cày tiếp một sự kiện đã bị gỡ.
      //   Cùng nhịp đó cũng làm sự kiện tới giờ mở tự hiện, khỏi bắt người chơi tải lại trang.
      //   Rẻ: bảng 6 dòng, không cần đăng nhập, hỏng thì taiSuKien tự nuốt lỗi.
      setInterval(() => { this.taiSuKien(); }, 10 * 60 * 1000);
      if (this.authUser) setTimeout(() => { this.nhanQuaChoSan(); }, 4000);
      // ⚠ Trước đây quà CHỈ nhận được lúc vào game. Người đang mở tab phải tải lại trang mới thấy —
      //   tác giả gửi quà xong ngồi đợi mà tưởng hỏng. Đi chung nhịp 10 phút của lịch sự kiện.
      if (this.authUser) setInterval(() => { this.nhanQuaChoSan(); }, 10 * 60 * 1000);
      // Mã tự động: quà rơi vào túi người đang đăng nhập trong khoảng mốc, không phải gõ gì.
      if (this.authUser) setTimeout(() => { this.taiMaTuDong(); }, 5000);
      if (this.authUser) setInterval(() => { this.taiMaTuDong(); }, 10 * 60 * 1000);
      // ⚠⚠ Đọc sổ nhật ký một lần lúc vào game, CHỈ với tài khoản tác giả. Đèn báo lệnh lạ mà chỉ
      //   sáng sau khi tự nhớ mở Lệnh Bài thì phát hiện muộn — mật khẩu lộ là mất cả máy chủ.
      //   Rẻ: một truy vấn, một tài khoản duy nhất trong cả làng.
      if (this.isAuthorAccount) setTimeout(() => { this.lbTaiNhatKy(); }, 6000);
    } catch (e) {
      // Không nạp được SDK (mất mạng / CDN bị chặn). Game vẫn chạy offline; riêng người CHƯA có
      // nhân vật thì màn đăng nhập phải nói rõ lý do, đừng bắt họ nhìn form rồi bấm vào hư không.
      this.cloudHong = true;
    } finally {
      this.authKiemTra = false;
    }
  },
  openAuth() { this.authErr = ''; this.authMsg = ''; this.authPass = ''; this.authOpen = true; },
  closeAuth() { this.authOpen = false; this.authErr = ''; this.authMsg = ''; this.authPass = ''; },
  setAuthMode(m) { this.authMode = m; this.authErr = ''; this.authMsg = ''; },
  async doAuth() {
    const email = (this.authEmail || '').trim();
    const pass = this.authPass || '';
    this.authErr = ''; this.authMsg = '';
    if (!email || !pass) { this.authErr = 'Nhập email và mật khẩu.'; return; }
    if (this.authMode === 'register' && pass.length < 6) { this.authErr = 'Mật khẩu tối thiểu 6 ký tự.'; return; }
    this.authBusy = true;
    try {
      if (this.authMode === 'register') {
        const { data, error } = await cloudSignUp(email, pass);
        if (error) { this.authErr = authErrVi(error.message); return; }
        if (data && data.session) { this.authUser = data.user; this.closeAuth(); this.showToast('Đã tạo tài khoản & đăng nhập.'); this.cloudSyncOnLogin(); }
        else { this.authMsg = 'Đã gửi email xác nhận. Hãy mở hộp thư, bấm liên kết xác nhận rồi đăng nhập.'; this.authMode = 'login'; this.authPass = ''; }
      } else {
        const { data, error } = await cloudSignIn(email, pass);
        if (error) { this.authErr = authErrVi(error.message); return; }
        this.authUser = data.user; this.closeAuth(); this.showToast('Đăng nhập thành công.'); this.cloudSyncOnLogin();
      }
    } catch (e) {
      this.authErr = 'Không kết nối được máy chủ (kiểm tra mạng) — thử lại.';
    } finally {
      this.authBusy = false; this.authPass = '';
    }
  },
  async doSignOut() {
    if (this.isLoggedIn) { try { await this._cloudPushNow(); } catch (e) { /* best-effort lưu bản chót */ } }
    try { await cloudSignOut(); } catch (e) { /* vẫn xoá phiên ở client */ }
    this.authUser = null; this.cloudConflict = null; this.cloudErr = ''; this.cloudLastSync = 0; this._cloudLastPushed = -1;
    this.showToast('Đã đăng xuất.');
  },
  // ---------- Cloud save (đồng bộ save ↔ Supabase) ----------
  // Tóm tắt 1 save (để so sánh khi xung đột). combatLv tự tính từ xp -> không phụ thuộc state đang chạy.
  saveSummary(st) {
    return {
      name: (st && st.player && st.player.name) || '',
      created: !!(st && st.player && st.player.created),
      combatLv: levelFromXp((st && st.skills && st.skills.chienDau && st.skills.chienDau.xp) || 0),
      lastSave: (st && st.lastSave) || 0,
    };
  },
  saveTimeText(ts) { return ts ? new Date(ts).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'chưa lưu'; },
  get cloudLastSyncText() {
    if (this.cloudSyncing) return 'đang đồng bộ…';
    if (!this.cloudLastSync) return 'chưa đồng bộ';
    return 'đồng bộ lúc ' + new Date(this.cloudLastSync).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  },
  // Đẩy state hiện tại lên cloud (đảm bảo đã lưu localStorage trước để lastSave mới nhất).
  async _cloudPushNow() {
    if (!this.isLoggedIn) return false;
    this.cloudSyncing = true;
    try {
      const r = await cloudPushSave(this.state);
      if (r.ok) {
        this._cloudLastPushed = this.state.lastSave || 0; this.cloudLastSync = now(); this.cloudErr = '';
        this._dayHoSo();                       // hồ sơ khoe đi kèm save — 142 byte, không chờ kết quả
        return true;
      }
      this.cloudErr = cloudErrVi(r.reason); return false;
    } catch (e) { this.cloudErr = 'Không kết nối cloud.'; return false; }
    finally { this.cloudSyncing = false; }
  },
  // Ghi đè localStorage bằng bản cloud rồi tải lại trang (nạp sạch state mới).
  _applyCloudSave(cloudData) {
    this.napCloud = true;   // giữ màn Khai Tịch ở trạng thái CHỜ, đừng để form tạo nhân vật chớp lên
    Storage.lock();   // chặn autosave RAM cũ ghi đè trong lúc chờ reload
    try { localStorage.setItem('tieudao_save_v1', JSON.stringify(cloudData)); } catch (e) {}
    this._cloudLastPushed = (cloudData && cloudData.lastSave) || 0;
    this.showToast('Đã tải tiến trình từ cloud.');
    setTimeout(() => location.reload(), 700);
  },
  // Lúc đăng nhập / khôi phục phiên: so cloud với local rồi quyết định.
  async cloudSyncOnLogin() {
    if (!this.isLoggedIn) return;
    this.cloudErr = '';
    let res;
    try { res = await cloudLoadSave(); } catch (e) { this.cloudErr = 'Không tải được dữ liệu cloud.'; return; }
    if (!res.ok) { if (res.reason !== 'no-auth') this.cloudErr = cloudErrVi(res.reason); return; }
    const row = res.row;
    if (!row) { await this._cloudPushNow(); return; }            // cloud trống -> đẩy local lên
    const tCloud = row.last_save || 0;
    const tLocal = _loadedLastSave;                              // mốc trên ĐĨA lúc nạp (không bị autosave bump)
    if (tCloud <= tLocal) { await this._cloudPushNow(); return; } // đĩa local mới hơn/bằng cloud -> đẩy local (cùng máy)
    // cloud MỚI HƠN bản trên đĩa máy này:
    if (!this.state.player || !this.state.player.created) { this._applyCloudSave(row.data); return; } // máy này mới tinh -> lấy cloud
    const localSum = this.saveSummary(this.state); localSum.lastSave = tLocal || localSum.lastSave;   // mốc hiển thị = lúc nạp
    this.cloudConflict = { cloud: this.saveSummary(row.data), local: localSum, _cloudData: row.data }; // lệch -> hỏi người chơi
  },
  useCloudSave() { const c = this.cloudConflict; if (!c) return; this.cloudConflict = null; this._applyCloudSave(c._cloudData); },
  useLocalSave() { this.cloudConflict = null; this._cloudPushNow().then((ok) => this.showToast(ok ? 'Đã giữ bản máy này.' : (this.cloudErr || 'Đồng bộ lỗi.'))); },
  async cloudSyncNow() { if (!this.isLoggedIn) return; const ok = await this._cloudPushNow(); this.showToast(ok ? 'Đã đồng bộ lên cloud.' : (this.cloudErr || 'Đồng bộ lỗi.')); },
  // Gọi định kỳ (mỗi 15s) + lúc rời trang: đẩy nếu save đã đổi so với lần đẩy trước.
  cloudAutoPushTick() {
    if (!this.isLoggedIn || this.cloudSyncing || this.cloudConflict) return;
    const ls = this.state.lastSave || 0;
    if (ls > this._cloudLastPushed) this._cloudPushNow();
  },
  // ---------- Tiểu Sử (≤250 ký tự) ----------
  bioModal: false,
  bioDraft: '',
  get playerBio() { return this.state.player.bio || ''; },
  openBioEdit() { this.bioDraft = this.state.player.bio || ''; this.bioModal = true; },
  closeBioEdit() { this.bioModal = false; },
  saveBio() { this.state.player.bio = (this.bioDraft || '').slice(0, 250); this.bioModal = false; Storage.save(this.state); this.showToast('Đã lưu tiểu sử.'); },
  // ---------- Điểm Danh ----------
  openDaily() { this.dailyModal = true; },
  /**
   * Thu một tấm modal cho VỪA MÀN HÌNH thay vì bắt cuộn (user chốt: "đừng có con lăn, tự co giãn
   * theo màn hình lớn nhỏ"). Dùng chung hàm `vuaKhung` đang chạy cho bảng tổng kết ván bài,
   * chỉ khác là khung ở đây là cả màn hình.
   */
  vuaManHinh(el) { try { vuaKhung(el, document.documentElement); } catch (e) { } },
  // ===== HIỆU ỨNG: tổng hợp mọi hiệu ứng/bonus đang tác động lên nhân vật (Linh Thạch hoạt động + passive: Linh Thú/Danh Hiệu/Vạn Vật Phổ/Nghề). =====
  hieuUngOpen: false,
  openHieuUng() { this.hieuUngOpen = true; },
  closeHieuUng() { this.hieuUngOpen = false; },
  get hieuUngEffects() {
    void this._tick;
    const active = [], passive = [];
    // --- Sổ Tổng Lực: gộp % chiến đấu (Danh Hiệu + Vạn Vật Phổ) theo FIELD + flat (Linh Thú). KHÔNG gộp EXP/Hiệu Suất (per-skill) ---
    const SUM_LABEL = { allPct: 'Toàn Chỉ Số', atkPct: 'Công Kích', defPct: 'Phòng Ngự', hpPct: 'Sinh Lực', critPct: 'Bạo Kích', spdPct: 'Tốc Độ', dodgePct: 'Né Tránh', dropPct: 'Tỉ Lệ Rơi', bacPct: 'Bạc Nhặt' };
    const SUM_ORDER = ['allPct', 'atkPct', 'defPct', 'hpPct', 'critPct', 'spdPct', 'dodgePct', 'f_congKich', 'f_hoThe', 'f_sinhLuc', 'f_neTranh', 'f_menhTrung', 'dropPct', 'bacPct'];
    const agg = {};
    const addPct = (field, frac, seal, color) => { if (!frac) return; const e = agg[field] || (agg[field] = { key: field, label: SUM_LABEL[field] || field, val: 0, pct: true, sources: [] }); e.val += frac; if (!e.sources.some((s) => s.seal === seal)) e.sources.push({ seal, color }); };
    const addFlat = (field, label, n, seal, color) => { if (!n) return; const k = 'f_' + field; const e = agg[k] || (agg[k] = { key: k, label, val: 0, pct: false, sources: [] }); e.val += n; if (!e.sources.some((s) => s.seal === seal)) e.sources.push({ seal, color }); };
    // Linh Thạch (buff hoạt động gather/craft hiện tại)
    if (this.actBuff) {
      const sk = this.currentSkill, lines = [];
      if (this.actBuff.expPct) lines.push('+' + this.actBuff.expPct + '% EXP kỹ năng');
      if (this.actBuff.effPct) lines.push('+' + this.actBuff.effPct + '% Hiệu Suất');
      active.push({ seal: '晶', color: '#60a5fa', name: 'Linh Thạch · ' + (sk ? sk.name : 'Tu luyện'), lines });
    }
    // Linh Thú kề bên (stat flat → tổng lực + thẻ)
    const pet = this.activePetObj;
    if (pet) { const b = this.activePetBonusApplied() || {}, pc = this.petElColor(pet), lines = Object.keys(b).map((k) => '+' + this.fmt(b[k]) + ' ' + this.statLabelShort(k)); Object.keys(b).forEach((k) => addFlat(k, this.statLabelShort(k), b[k], '獸', pc)); passive.push({ seal: '獸', color: pc, name: 'Linh Thú · ' + this.petName(pet), lines: lines.length ? lines : ['Đồng hành cùng bạn'] }); }
    // Danh Hiệu (% → tổng lực + thẻ)
    const tt = this.equippedTitleObj;
    if (tt) { const txt = titleBonusText(tt); if (tt.bonus) Object.keys(tt.bonus).forEach((k) => addPct(k, tt.bonus[k], '號', '#f5b942')); passive.push({ seal: '號', color: '#f5b942', name: 'Danh Hiệu · ' + tt.name, lines: txt ? txt.split(' · ') : ['Vinh danh giang hồ'] }); }
    // Vạn Vật Phổ (codex Phổ Lực, % → tổng lực + thẻ)
    const cb = codexBonus(this.state), cbLines = [];
    if (cb.allPct) cbLines.push('+' + Math.round(cb.allPct * 100) + '% Toàn chỉ số');
    if (cb.atkPct) cbLines.push('+' + Math.round(cb.atkPct * 100) + '% Công Kích');
    if (cb.defPct) cbLines.push('+' + Math.round(cb.defPct * 100) + '% Phòng Ngự');
    if (cb.hpPct) cbLines.push('+' + Math.round(cb.hpPct * 100) + '% Sinh Lực');
    ['allPct', 'atkPct', 'defPct', 'hpPct'].forEach((k) => addPct(k, cb[k], '譜', '#a78bfa'));
    if (cbLines.length) passive.push({ seal: '譜', color: '#a78bfa', name: 'Vạn Vật Phổ', lines: cbLines });
    // Nghề đã học — GỘP thành 1 thẻ (mỗi nghề +EXP/+Hiệu Suất cho kỹ năng tương ứng, KHÔNG gộp vào tổng lực)
    const profs = (this.professions || []).map((id) => NGHE.find((x) => x.id === id)).filter(Boolean);
    if (profs.length) {
      const allSame = profs.every((n) => n.exp === profs[0].exp && n.eff === profs[0].eff);
      const bonusChip = allSame ? ('+' + profs[0].exp + '% EXP · +' + profs[0].eff + '% Hiệu Suất / nghề') : 'Tăng EXP & Hiệu Suất / nghề';
      passive.push({ seal: '業', color: '#34d399', name: 'Nghề · ' + profs.length + ' nghề', lines: [bonusChip, ...profs.map((n) => n.name)] });
    }
    // Tín Vật (thưởng Đàm Đạo) — mỗi cái +% hiệu suất nghề tương ứng, KHÔNG gộp tổng lực
    const tvs = this.tinVatList;
    if (tvs.length) {
      passive.push({ seal: '信', color: '#eab308', name: 'Tín Vật · ' + tvs.length, lines: tvs.map((t) => t.name + ' — +' + this.tinVatPct + '% ' + t.skillName) });
    }
    // tổng hợp -> summary sắp theo SUM_ORDER
    const summary = Object.values(agg)
      .sort((a, b) => (SUM_ORDER.indexOf(a.key) + 1 || 99) - (SUM_ORDER.indexOf(b.key) + 1 || 99))
      .map((e) => ({ label: e.label, text: e.pct ? ('+' + (Math.round(e.val * 1000) / 10) + '%') : ('+' + this.fmt(Math.round(e.val))), sources: e.sources }));
    return { active, passive, summary };
  },
  get canClaimDaily() { return this.state.login.lastDay !== todayStr(); },
  get loginStreak() { return this.state.login.streak || 0; },
  get dailyExpBonus() { return Math.min(20, Math.floor((this.state.login.streak || 0) / 10)); },   // +1% EXP mỗi 10 ngày chuỗi, tối đa 20%
  get loginNextIndex() {
    const prev = this.state.login.streak || 0;
    const cyc = this.LOGIN_REWARDS.length;
    if (!this.canClaimDaily) return (Math.max(1, prev) - 1) % cyc;
    const consecutive = this.state.login.lastDay === yestStr();
    const newStreak = consecutive ? prev + 1 : 1;
    return (newStreak - 1) % cyc;
  },
  claimDaily() {
    if (!this.canClaimDaily) return;
    const consecutive = this.state.login.lastDay === yestStr();
    const newStreak = consecutive ? (this.state.login.streak || 0) + 1 : 1;
    const r = this.LOGIN_REWARDS[(newStreak - 1) % this.LOGIN_REWARDS.length] || {};
    if (r.bac) this.state.currencies.bac = (this.state.currencies.bac || 0) + r.bac;
    if (r.honThach) this.state.currencies.honThach = (this.state.currencies.honThach || 0) + r.honThach;
    if (r.nguyenBao) this.state.currencies.nguyenBao = (this.state.currencies.nguyenBao || 0) + r.nguyenBao;
    this.state.login.lastDay = todayStr();
    this.state.login.streak = newStreak;
    Storage.save(this.state);
  },

  // ---------- Nhiệm Vụ ----------
  counterValue(q) {
    if (!q) return 0;
    return q.type === 'kill' ? (this.state.counters.kills[q.target] || 0) : (this.state.counters.produced[q.target] || 0);
  },
  grantReward(r) {
    if (!r) return;
    if (r.bac) this.state.currencies.bac = (this.state.currencies.bac || 0) + r.bac;
    if (r.honThach) this.state.currencies.honThach = (this.state.currencies.honThach || 0) + r.honThach;
    if (r.nguyenBao) this.state.currencies.nguyenBao = (this.state.currencies.nguyenBao || 0) + r.nguyenBao;
    if (r.eggPham) {   // Trứng Linh Thú phẩm Thường — NGẪU NHIÊN loài (vốn khởi đầu cho người chơi mới)
      const eggs = Object.keys(this.ITEMS).filter((id) => id.startsWith('egg_') && id.endsWith('_pham'));
      if (eggs.length) {
        const id = eggs[Math.floor(rng(this.state, 'trungThuong') * eggs.length)];
        addItem(this.state, id, r.eggPham);
        this.showToast('🥚 Nhận ' + ((this.ITEMS[id] || {}).name || 'Trứng Linh Thú') + ' — ấp nở ở Lò Ấp Noãn (tab Linh Thú).');
      }
    }
    this.showRewardPop(r);   // thông báo phần thưởng (đồng bộ loot float)
  },
  questEmoji(q) {
    if (!q) return '📜';
    if (q.type === 'kill') return (this.ENEMIES[q.target] && this.ENEMIES[q.target].icon) || '⚔️';
    return (this.ITEMS[q.target] && this.ITEMS[q.target].icon) || '📦';
  },
  rewardChips(r) {
    if (!r) return [];
    const c = [];
    if (r.bac) c.push({ id: 'bac', amt: r.bac, cls: 'text-gold', emoji: '🟡' });
    if (r.honThach) c.push({ id: 'honThach', amt: r.honThach, cls: 'text-rose-300', emoji: '🔴' });
    if (r.nguyenBao) c.push({ id: 'nguyenBao', amt: r.nguyenBao, cls: 'text-cyan', emoji: '🔷' });
    if (r.eggPham) c.push({ id: 'egg', amt: r.eggPham, cls: 'text-emerald-300', emoji: '🥚' });
    return c;
  },
  // ---------- Khối "Khác" ở thẻ Hồ Sơ ----------
  // ⚠ Mỗi mục TỰ KHAI đường mở. Bản cũ viết tay danh sách chữ rồi so tên bằng `===` ở ba chỗ,
  // nên Vạn Vật Phổ đã LIVE mà vẫn kẹt nhãn "sắp ›" — thêm màn mới nhưng quên sửa cả ba chỗ.
  // Nay chỉ mục KHÔNG có `di` mới là "sắp ›".
  // ⛔ ĐÃ BỎ 2026-08-04 (user chốt): 'Giao Dịch' — Sàn Giao Dịch đã gỡ hẳn ở `31ac9c9`, để lại là
  // hứa với người chơi thứ mình đã quyết không làm. 'Tương Tác' — trùng vai với Danh Sĩ · Tửu Lâu
  // · Phong Vân Bảng. 'Mã Giới Thiệu' GIỮ: chờ có người chơi thật thì mới có nghĩa.
  get khacRows() {
    return [
      { ten: 'Điểm Danh', mo: true, cham: true, lam: 'daily' },
      { ten: 'Thống Kê', mo: true, lam: 'thongKe' },
      { ten: 'Vạn Vật Phổ', mo: true, di: 'collection' },
      { ten: 'Hiệu Ứng', mo: true, lam: 'hieuUng' },
      { ten: 'Mã Đổi Quà', mo: true, lam: 'maQua' },
      { ten: 'Mã Giới Thiệu' },
    ];
  },
  khacMo(m) {
    if (!m || !m.mo) return;
    if (m.di) { this.navTo(m.di); return; }
    if (m.lam === 'daily') { this.openDaily(); return; }
    if (m.lam === 'hieuUng') { this.openHieuUng(); return; }
    if (m.lam === 'maQua') { this.openMaQua(); return; }
    if (m.lam === 'thongKe') { this.openThongKe(); return; }
  },

  // ---------- HAI BIỂU ĐỒ Ở MÀN HỒ SƠ ----------
  /** Hoạt Động 7 ngày: mỗi cột = số lượt thu hoạch + số quái hạ trong ngày đó.
   *  Ngày chưa có số thì cột rỗng — KHÔNG giấu cột, không thì trục ngày co giãn theo dữ liệu. */
  get bdHoatDong() {
    void this._tick;
    const nk = this.state.nhatKyNgay || {};
    const out = [];
    const t = now();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(t - i * 86400000);
      const k = khoaNgay(d.getTime());
      const o = nk[k] || {};
      out.push({ k, nhan: String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'),
        v: (o.luot || 0) + (o.kill || 0), luot: o.luot || 0, kill: o.kill || 0, homNay: i === 0 });
    }
    const max = out.reduce((m, x) => Math.max(m, x.v), 0);
    // Sàn 3% để ngày ít việc vẫn thấy được cột — nhưng CHỈ khi ngày đó CÓ số.
    // Áp sàn cho cả ngày rỗng thì bảy ngày không chơi vẫn hiện bảy cột lùn, đọc ra "có hoạt động".
    out.forEach((x) => { x.pct = (max && x.v) ? Math.max(3, Math.round(x.v / max * 100)) : 0; });
    return { cot: out, max, tong: out.reduce((s, x) => s + x.v, 0) };
  },
  /** Kinh Nghiệm: TỔNG EXP nhận mỗi ngày, 7 ngày — vẽ đường cong (user chốt 2026-08-04).
   *  ⛔ Bản cũ vẽ tỉ trọng tu vi theo nghề rồi gộp phần dư thành "Khác": user bác vì "Khác" 60%
   *  còn bốn hàng bày ra đều 10% — tức thứ gộp lại LỚN HƠN mọi thứ hiện ra, biểu đồ nói được
   *  đúng một điều là "phần lớn nằm ở chỗ không cho xem".
   *  Toạ độ tính SẴN Ở ĐÂY (không tính trong view) để bài kiểm soát được đường vẽ. */
  get bdKinhNghiem() {
    void this._tick;
    const nk = this.state.nhatKyNgay || {};
    const t = now();
    const diem = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(t - i * 86400000);
      const k = khoaNgay(d.getTime());
      diem.push({ k, nhan: String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'),
        v: (nk[k] || {}).exp || 0, homNay: i === 0 });
    }
    const tong = diem.reduce((s, x) => s + x.v, 0);
    if (!tong) return { diem: [], tong: 0, duong: '', nen: '' };
    const max = diem.reduce((m, x) => Math.max(m, x.v), 0);
    const W = 100, H = 34, TREN = 4, DAY = 31;      // chừa mép trên/dưới cho chấm tròn khỏi bị cắt
    diem.forEach((p, i) => {
      p.x = +(i * (W / (diem.length - 1))).toFixed(2);
      p.y = +(DAY - (p.v / max) * (DAY - TREN)).toFixed(2);
    });
    // Catmull-Rom -> cubic Bézier: đường mượt mà vẫn ĐI QUA đúng mọi điểm (spline thường thì không).
    let duong = 'M' + diem[0].x + ' ' + diem[0].y;
    for (let i = 0; i < diem.length - 1; i++) {
      const p0 = diem[i - 1] || diem[i], p1 = diem[i], p2 = diem[i + 1], p3 = diem[i + 2] || p2;
      const c1x = +(p1.x + (p2.x - p0.x) / 6).toFixed(2), c1y = +(p1.y + (p2.y - p0.y) / 6).toFixed(2);
      const c2x = +(p2.x - (p3.x - p1.x) / 6).toFixed(2), c2y = +(p2.y - (p3.y - p1.y) / 6).toFixed(2);
      duong += ' C' + c1x + ' ' + c1y + ',' + c2x + ' ' + c2y + ',' + p2.x + ' ' + p2.y;
    }
    return { diem, tong, max, duong, nen: duong + ' L' + W + ' ' + H + ' L0 ' + H + ' Z' };
  },

  // ---------- THỐNG KÊ (popup) ----------
  // Mọi số ĐỌC TỪ SAVE, không đếm lại và không đoán. Nhóm nào không có số thật thì không bịa dòng.
  thongKeOpen: false,
  openThongKe() { this.thongKeOpen = true; },
  closeThongKe() { this.thongKeOpen = false; },
  get thongKe() {
    void this._tick;
    const s = this.state;
    const kills = s.counters?.kills || {};
    const sk = s.skills || {};
    let tongHa = 0; for (const k in kills) tongHa += kills[k] || 0;
    let tongLuot = 0, tongMs = 0;
    for (const id in sk) { if (id === 'chienDau') continue; tongLuot += sk[id].gathered || 0; tongMs += sk[id].timeMs || 0; }
    // Nghề chăm nhất: theo THỜI GIAN đã bỏ ra, không theo số lượt (nghề vòng ngắn sẽ luôn thắng).
    let chamNhat = null;
    for (const id in sk) { if (id === 'chienDau' || !this.SKILLS[id]) continue; if (!chamNhat || (sk[id].timeMs || 0) > (sk[chamNhat].timeMs || 0)) chamNhat = id; }
    const ls = this.dungeonHistory || [];
    const thongQuan = ls.reduce((a, h) => a + (h.clears != null ? h.clears : (h.cleared ? 1 : 0)), 0);
    const gearCo = (s.gearBag || []).length + Object.values(s.equipment || {}).filter(Boolean).length;
    return [
      { nhom: 'Chiến Đấu', dong: [
        ['Yêu thú đã hạ', this.fmt(tongHa)],
        ['Loại yêu thú từng gặp', this.fmt(Object.keys(kills).length)],
        ['Bí Cảnh đã thông quan', this.fmt(thongQuan)],
        ['Cấp Chiến Đấu', this.fmt(this.combatLevel)],
      ] },
      { nhom: 'Nghề Nghiệp', dong: [
        ['Tổng lượt thu hoạch', this.fmt(tongLuot)],
        ['Thời gian đã bỏ ra', this.fmtTime(tongMs / 1000)],
        ['Nghề chăm nhất', chamNhat ? (this.SKILLS[chamNhat].name + ' · ' + this.fmtTime((sk[chamNhat].timeMs || 0) / 1000)) : '—'],
        ['Tổng Cấp', this.fmt(this.totalLevel)],
      ] },
      { nhom: 'Gia Sản', dong: [
        ['Bạc', this.fmt(s.currencies?.bac || 0)],
        ['Hồn Thạch', this.fmt(s.currencies?.honThach || 0)],
        ['Nguyên Bảo', this.fmt(s.currencies?.nguyenBao || 0)],
        ['Trang bị đang giữ', this.fmt(gearCo)],
      ] },
      { nhom: 'Sưu Tập', dong: [
        ['Vạn Vật Phổ', this.fmt(this.codexTotalDone) + '/' + this.fmt(this.codexTotalAll)],
        ['Danh Hiệu đã mở', this.fmt(this.titleOwnedCount) + '/' + this.fmt(this.titleTotalCount)],
      ] },
    ];
  },

  // ---------- Danh Hiệu ----------
  checkTitles() {
    const newly = syncTitles(this.state, now());   // ⚠ dùng đồng hồ GAME (có tua/chạy nhanh của Bảng Dev)
    for (const id of newly) { const tt = TITLE_BY_ID[id]; if (tt) this.showToast('🏅 Mở khoá Danh Hiệu 〘' + tt.name + '〙!'); }
  },
  get equippedTitleObj() { const eq = this.state.titles && this.state.titles.equipped; return eq ? (TITLE_BY_ID[eq] || null) : null; },
  get titlesFlat() {
    const ti = this.state.titles || { owned: [], equipped: null };
    const owned = ti.owned || [], eq = ti.equipped;
    // `loaiKey` = khoá gốc (để thanh tab gom nhóm); `loai` = tên hiện trên thẻ.
    // `moLuc` = mốc mở khoá đã định dạng; rỗng với danh hiệu mở TRƯỚC khi có sổ ghi (không bịa ngày).
    const moAt = ti.moAt || {};
    return TITLES.map((tt) => ({ id: tt.id, name: tt.name, q: tt.q, loaiKey: tt.loai, loai: TITLE_LOAI[tt.loai] || tt.loai, src: tt.src, owned: owned.includes(tt.id), on: eq === tt.id, bonusText: titleBonusText(tt), moLuc: this.titleMoLuc(moAt[tt.id]) }));
  },
  /** Mốc mở khoá -> "10:54 04/08/2026". Không có mốc thì trả rỗng, view tự giấu.
   *  ⚠ KHÔNG chèn dấu `·` giữa giờ và ngày: dòng nguồn vốn dài, có dấu phân cách là trình duyệt
   *  coi đó là hai cụm rồi ngắt ngay giữa mốc thời gian — đo thấy "· 04/08/2026" rơi xuống dòng riêng. */
  titleMoLuc(ts) {
    if (!ts) return '';
    const d = new Date(ts); if (isNaN(d.getTime())) return '';
    const h = (x) => String(x).padStart(2, '0');
    return h(d.getHours()) + ':' + h(d.getMinutes()) + ' ' + h(d.getDate()) + '/' + h(d.getMonth() + 1) + '/' + d.getFullYear();
  },
  // ---------- Tàng Hiệu Các: thanh tab + đã mở nhảy lên trên ----------
  // Cùng khuôn với Hành Lý: một tab Tất Cả, còn lại gom 13 `loai` thành 5 nhóm đọc được.
  // ⚠ Danh sách tab CỐ ĐỊNH, không mọc/rụng theo số danh hiệu đang có.
  thTab: 'all',
  get thTabs() {
    return [
      { id: 'all', ten: 'Tất Cả' }, { id: 'chienDau', ten: 'Chiến Đấu' },
      { id: 'thamHiem', ten: 'Thám Hiểm' }, { id: 'sinhHoat', ten: 'Sinh Hoạt' },
      { id: 'canhGioi', ten: 'Cảnh Giới' }, { id: 'kyNghe', ten: 'Kỳ Nghệ' },
    ];
  },
  thNhomCua(loai) {
    if (loai === 'chien' || loai === 'thu' || loai === 'toc' || loai === 'toan') return 'chienDau';
    if (loai === 'biCanh' || loai === 'boss' || loai === 'mongCanh') return 'thamHiem';
    if (loai === 'nghe' || loai === 'suu' || loai === 'phu' || loai === 'thuCung') return 'sinhHoat';
    if (loai === 'canhGioi') return 'canhGioi';
    if (loai === 'kyNghe') return 'kyNghe';
    return 'sinhHoat';   // lưới hứng: loại mới thêm sau rơi vào đây chứ không biến mất
  },
  thDatTab(id) { this.thTab = id; },
  /** Danh hiệu đang hiện: lọc theo tab, rồi ĐANG DÙNG → ĐÃ MỞ → CHƯA MỞ (giữ thứ tự gốc trong mỗi bậc). */
  get thHien() {
    const ds = this.thTab === 'all' ? this.titlesFlat : this.titlesFlat.filter((x) => this.thNhomCua(x.loaiKey) === this.thTab);
    const bac = (x) => (x.on ? 0 : (x.owned ? 1 : 2));
    return ds.map((x, i) => ({ x, i })).sort((a, b) => bac(a.x) - bac(b.x) || a.i - b.i).map((o) => o.x);
  },
  get titleOwnedCount() { return ((this.state.titles || {}).owned || []).length; },
  get titleTotalCount() { return TITLES.length; },
  titleEquip(id) { const ti = this.state.titles; if (!ti || !(ti.owned || []).includes(id)) return; ti.equipped = id; Storage.save(this.state); },
  titleQClass(q) { return ({ phamPham: 'dh-q-pham', luongPham: 'dh-q-luong', tinhPham: 'dh-q-tinh', tuyetPham: 'dh-q-tuyet', truyenThe: 'dh-q-truyen', thanPham: 'dh-q-than', coBan: 'dh-q-coban' })[q] || 'dh-q-pham'; },
  titleHigh(q) { return q === 'truyenThe' || q === 'thanPham' || q === 'coBan'; },   // phẩm cao -> hiệu ứng động + aura
  /**
   * DẠNG BẢNG theo LOẠI danh hiệu (CSS `.k-*` ở index.html). Mỗi loại một khung/hình cắt riêng.
   * ⚠ `toan` (Toàn Năng) KHÔNG có lớp — nó giữ nguyên Long Văn, đó là dạng mặc định.
   * ⚠ Loại mới thêm sau mà quên khai ở đây thì rơi về Long Văn, KHÔNG vỡ giao diện.
   */
  titleKieuClass(loai) {
    return ({
      chien: 'k-daobai', thu: 'k-thuan', toc: 'k-bang', suu: 'k-trucgian', phu: 'k-kimbai',
      thuCung: 'k-thubi', biCanh: 'k-huyenkham', boss: 'k-toayeu', nghe: 'k-thietde',
      canhGioi: 'k-ngockhuong', mongCanh: 'k-mongvu', kyNghe: 'k-kycach', suKien: 'k-dangbai',
    })[loai] || '';
  },
  // ---------- Huy Hiệu (kĩ năng Lv100) ----------
  get badgesView() {
    return BADGES.map((b) => { const lv = this.skillLevel(b.skillId); const sk = this.SKILLS[b.skillId]; const nm = (sk && sk.name) || (b.skillId === 'chienDau' ? 'Chiến Đấu' : b.skillId); return { ...b, skillName: nm, level: lv, unlocked: lv >= BADGE_LV, equipped: (this.state.player.badges || []).includes(b.skillId) }; });
  },
  get badgeUnlockedCount() { return this.badgesView.filter((b) => b.unlocked).length; },
  get badgeEquippedCount() { return (this.state.player.badges || []).length; },
  // Huy Hiệu đeo (chỉ cái đã Đại Thành, đúng thứ tự đeo) — render góc banner.
  get equippedBadgeList() { return (this.state.player.badges || []).filter((id) => this.skillLevel(id) >= BADGE_LV).map((id) => ({ skillId: id })); },
  // 3 ô "Đang Đeo" (điền huy hiệu hoặc null) — kèm tên, cho sub-tab Huy Hiệu trong Dung Mạo.
  get equippedBadgeSlots() { const view = this.badgesView; const worn = this.equippedBadgeList.map((hb) => { const b = view.find((x) => x.skillId === hb.skillId); return { skillId: hb.skillId, name: (b && b.name) || hb.skillId }; }); return [0, 1, 2].map((i) => worn[i] || null); },
  toggleBadge(skillId) {
    if (this.skillLevel(skillId) < BADGE_LV) { this.showToast('Chưa Đại Thành (cần kĩ năng Lv 100) — không đeo được.'); return; }
    if (!Array.isArray(this.state.player.badges)) this.state.player.badges = [];
    const arr = this.state.player.badges, i = arr.indexOf(skillId);
    if (i >= 0) arr.splice(i, 1);
    else { if (arr.length >= 3) { this.showToast('Tối đa 3 Huy Hiệu — gỡ bớt 1 trước.'); return; } arr.push(skillId); }
    Storage.save(this.state);
  },
  setBadgeSize(v) { this.state.player.badgeSize = Math.max(32, Math.min(72, parseInt(v) || 48)); Storage.save(this.state); },
  // Kho hiệu ứng huy hiệu — người chơi tự chọn cho TỪNG huy hiệu (đồng điệu hoặc phá cách).
  get BADGE_FX() { return [{ id: 'none', name: 'Tĩnh' }, { id: 'sweep', name: 'Ánh Kim Quét' }, { id: 'glow', name: 'Glow Thở' }, { id: 'twinkle', name: 'Lấp Lánh' }]; },
  badgeFxOf(skillId) { return (this.state.player.badgeFx || {})[skillId] || 'sweep'; },
  setBadgeFx(skillId, fx) { if (!this.state.player.badgeFx) this.state.player.badgeFx = {}; this.state.player.badgeFx[skillId] = fx; Storage.save(this.state); },
  // -- Tân thủ --
  get tutAllDone() { return this.state.quests.tutorial.index >= this.TUTORIAL_QUESTS.length; },
  // Danh hiệu thưởng cho việc xong TRỌN chuỗi Tân Thủ. Lấy theo ĐIỀU KIỆN chứ không ghim id —
  // đổi danh hiệu thưởng trong data/titles.js thì bảng nhiệm vụ tự hiện theo.
  get tutTitle() { return TITLES.find((t) => t.cond && t.cond.kind === 'tutorial') || null; },
  get tutQuest() { return this.TUTORIAL_QUESTS[this.state.quests.tutorial.index] || null; },
  get tutProgress() {
    const q = this.tutQuest; if (!q) return 0;
    return Math.min(q.count, Math.max(0, this.counterValue(q) - this.state.quests.tutorial.base));
  },
  get tutDone() { const q = this.tutQuest; return !!q && this.tutProgress >= q.count; },
  claimTutorial() {
    if (!this.tutDone) return;
    this.grantReward(this.tutQuest.reward);
    this.state.quests.tutorial.index += 1;
    const next = this.TUTORIAL_QUESTS[this.state.quests.tutorial.index];
    this.state.quests.tutorial.base = next ? this.counterValue(next) : 0;
    Storage.save(this.state);
  },
  // -- Nhiệm vụ theo KỲ (Ngày / Tuần / Tháng) — dùng chung 1 cơ chế --
  periodConfig: {
    daily:   { pool: DAILY_QUESTS,   count: 7, period: () => todayStr() },
    weekly:  { pool: WEEKLY_QUESTS,  count: 7, period: () => weekStr() },
    monthly: { pool: MONTHLY_QUESTS, count: 7, period: () => monthStr() },
  },
  // Đảm bảo danh sách nhiệm vụ của 1 kỳ đúng với kỳ hiện tại; sang kỳ mới thì bốc lại + reset.
  questUnlocked(q) {   // chỉ bốc nhiệm vụ người chơi đủ sức (mục tiêu đã mở theo cấp) -> khó dần + đa dạng theo tiến trình
    const req = q.req || 1;
    return q.type === 'kill' ? this.combatLevel >= req : this.skillLevel(q.skill) >= req;
  },
  ensurePeriodQuests(kind) {
    const cfg = this.periodConfig[kind];
    if (!cfg) return;
    const cur = cfg.period();
    if (!this.state.quests[kind]) this.state.quests[kind] = { period: null, list: [] };
    const st = this.state.quests[kind];
    const want = Math.min(cfg.count, cfg.pool.length);
    // Còn hạn + đủ số + mọi id còn trong pool (đổi data cũ -> bốc lại) thì giữ.
    if (st.period === cur && st.list && st.list.length === want && st.list.every((e) => cfg.pool.some((q) => q.id === e.id))) return;
    // Lọc mục tiêu đủ cấp; thiếu thì lùi về cả pool (người mới vẫn đủ 7 cái).
    const elig = cfg.pool.filter((q) => this.questUnlocked(q));
    const usable = elig.length >= want ? elig : cfg.pool;
    // Bốc ngẫu nhiên `want` cái rồi xếp lại theo thứ tự gốc cho ổn định.
    const idx = usable.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rng(this.state, 'nhiemVu') * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const chosen = idx.slice(0, want).sort((a, b) => a - b);
    st.period = cur;
    st.list = chosen.map((i) => ({ id: usable[i].id, base: this.counterValue(usable[i]), claimed: false }));
    Storage.save(this.state);
  },
  ensureQuests() { this.ensurePeriodQuests('daily'); this.ensurePeriodQuests('weekly'); this.ensurePeriodQuests('monthly'); },
  periodDef(kind, id) { const cfg = this.periodConfig[kind]; return cfg ? (cfg.pool.find((q) => q.id === id) || null) : null; },
  periodList(kind) { return (this.state.quests[kind] && this.state.quests[kind].list) || []; },
  periodProgress(kind, entry) {
    const q = this.periodDef(kind, entry.id); if (!q) return 0;
    return Math.min(q.count, Math.max(0, this.counterValue(q) - entry.base));
  },
  periodDone(kind, entry) {
    const q = this.periodDef(kind, entry.id);
    return !!q && this.periodProgress(kind, entry) >= q.count;
  },
  claimPeriodQuest(kind, i) {
    const entry = this.state.quests[kind] && this.state.quests[kind].list[i];
    if (!entry || entry.claimed || !this.periodDone(kind, entry)) return;
    this.grantReward(this.periodDef(kind, entry.id).reward);
    entry.claimed = true;
    Storage.save(this.state);
  },
  periodClaimable(kind) { return this.periodList(kind).filter((e) => this.periodDone(kind, e) && !e.claimed).length; },

  // -- Tab Nhiệm vụ (UI): Ngày / Tuần / Tháng --
  QUEST_TABS: [
    { kind: 'daily',   icon: 'calDay',   label: 'Ngày',  active: 'text-amber-300',  bar: 'bg-amber-400',  fill: 'bg-amber-400',  info: 'Làm mới 00:00 mỗi ngày' },
    { kind: 'weekly',  icon: 'calWeek',  label: 'Tuần',  active: 'text-sky-300',    bar: 'bg-sky-400',    fill: 'bg-sky-400',    info: 'Làm mới 00:00 Thứ Hai hằng tuần' },
    { kind: 'monthly', icon: 'calMonth', label: 'Tháng', active: 'text-violet-300', bar: 'bg-violet-400', fill: 'bg-violet-400', info: 'Làm mới 00:00 ngày 1 mỗi tháng' },
  ],
  questTab: 'daily',
  setQuestTab(t) { this.questTab = t; },
  // Mốc reset kế tiếp (giờ địa phương): ngày = nửa đêm mai · tuần = 00:00 Thứ Hai tới · tháng = 00:00 ngày 1 tháng sau.
  nextResetMs(kind) {
    const d = new Date();
    if (kind === 'weekly') { const dow = (d.getDay() + 6) % 7; return new Date(d.getFullYear(), d.getMonth(), d.getDate() + (7 - dow)).getTime(); }
    if (kind === 'monthly') { return new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime(); }
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
  },
  resetCountdown(kind) {
    void this._tick;
    let s = Math.max(0, Math.floor((this.nextResetMs(kind) - now()) / 1000));
    const dd = Math.floor(s / 86400); s -= dd * 86400;
    const hh = Math.floor(s / 3600); s -= hh * 3600;
    const mm = Math.floor(s / 60);
    if (dd > 0) return dd + ' ngày ' + hh + ' giờ';
    if (hh > 0) return hh + ' giờ ' + mm + ' phút';
    return mm + ' phút';
  },
  get questTabMeta() { return this.QUEST_TABS.find((t) => t.kind === this.questTab) || this.QUEST_TABS[0]; },
  // Tiện cho UI (tự quy về tab đang chọn)
  get qList() { return this.periodList(this.questTab); },
  qDef(entry) { return this.periodDef(this.questTab, entry.id); },
  qProgress(entry) { return this.periodProgress(this.questTab, entry); },
  qDone(entry) { return this.periodDone(this.questTab, entry); },
  qClaim(i) { this.claimPeriodQuest(this.questTab, i); },

  get hasClaimableQuest() {
    if (this.tutDone) return true;
    return this.periodClaimable('daily') + this.periodClaimable('weekly') + this.periodClaimable('monthly') > 0;
  },
  get freeAvatarId() { return this.state.player.gender === 'nu' ? 'nu' : 'nam'; }, // ảnh theo giới tính: free
  ownsAvatar(id) { return id === this.freeAvatarId || (this.state.player.ownedAvatars || []).includes(id); },
  // ⚠ Ảnh bìa CẢNH (tiền tố `canh:`) luôn free — nó là bìa mặc định của mọi nhân vật mới, không
  //   phải hàng bán ở Thương Điếm. Thiếu vế này thì người chơi bấm lại ô mặc định là bị chặn.
  ownsCover(id) { return laBiaCanh(id) || (this.state.player.ownedCovers || []).includes(id); }, // 'Giống Avatar' (null) luôn free
  // ⚠ Đổi ảnh đại diện thì ẢNH BÌA PHẢI ĐỨNG YÊN. `coverImg=null` nghĩa là "Giống Avatar", nên
  //   trước đây đổi avatar là banner nhảy theo — người chơi không hề đụng vào ảnh bìa.
  //   Cách chữa: lúc đổi avatar mà ảnh bìa đang ở chế độ "Giống Avatar" thì GHIM nó lại vào tấm
  //   đang hiện. Ai thật sự muốn bìa bám avatar thì bấm lại ô "Giống Avatar" — chọn tay, không tự.
  selectAvatar(id) {
    if (id && !this.ownsAvatar(id)) { this.showToast('Chưa sở hữu Ảnh Đại Diện này — mua ở Thương Điếm.'); return; }
    const p = this.state.player;
    if (!p.coverImg) {
      const dangHien = this.avatarId;                                  // tấm bìa người chơi ĐANG nhìn
      if (!Array.isArray(p.ownedCovers)) p.ownedCovers = [];
      if (!p.ownedCovers.includes(dangHien)) p.ownedCovers.push(dangHien);   // đang bày free rồi, ghim không phải là bán
      p.coverImg = dangHien;
    }
    p.avatar = id;
  },
  get avatarId() { return this.state.player.avatar || this.freeAvatarId; },
  get avatarSrc() { return `images/avatars/${this.avatarId}.webp`; },
  // Ảnh BÌA (banner) tách riêng khỏi avatar — coverImg=null => giống avatar.
  BIA_MAC_DINH,      // bìa nhân vật mới nhận; giao diện cần đọc để tô sáng ô đang chọn
  selectCover(id) { if (id && !this.ownsCover(id)) { this.showToast('Chưa sở hữu Ảnh Bìa này — mua ở Thương Điếm.'); return; } this.state.player.coverImg = id; },
  get coverImgId() { return this.state.player.coverImg || this.avatarId; },
  // ⚠ Ảnh bìa lấy từ HAI kho: ảnh đại diện (`images/avatars/`) và cảnh Bí Cảnh (`images/dungeons/`).
  //   Phân biệt bằng tiền tố `canh:` — đừng đoán theo tên tệp.
  get coverSrc() { const id = this.coverImgId; return laBiaCanh(id) ? `images/dungeons/${idBiaCanh(id)}.webp` : `images/avatars/${id}.webp`; },
  // --- Thu phóng + kéo thả: background-size (zoom) + background-position (pan, tự giới hạn, KHÔNG hở) ---
  // cover (banner rộng) → cover theo CHIỀU NGANG; face (ô vuông) → cover theo CHIỀU DỌC.
  get coverStyle() { const c = this.state.player.cover || { x: 50, y: 50, z: 1 }; const size = c.z > 1 ? `${c.z * 100}% auto` : 'cover'; return `background-image:url('${this.coverSrc}'); background-repeat:no-repeat; background-size:${size}; background-position:${c.x}% ${c.y}%;`; },
  get faceStyle() { const f = this.state.player.face || { x: 50, y: 50, z: 1 }; return `background-image:url('${this.avatarSrc}'); background-repeat:no-repeat; background-size:auto ${f.z * 100}%; background-position:${f.x}% ${f.y}%;`; },
  adjStart(kind, ev) {
    if (ev.button != null && ev.button !== 0) return;
    ev.preventDefault();
    const a = this.state.player[kind]; if (!a) return;
    const r = ev.currentTarget.getBoundingClientRect();
    const st = { sx: ev.clientX, sy: ev.clientY, ox: a.x, oy: a.y, w: r.width, h: r.height };
    const cl = (v) => Math.max(0, Math.min(100, v));
    const move = (e) => {
      a.x = cl(st.ox - (e.clientX - st.sx) / st.w * 100);   // kéo phải -> lộ trái
      a.y = cl(st.oy - (e.clientY - st.sy) / st.h * 100);
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); Storage.save(this.state); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  },
  setAdjZoom(kind, z) { if (this.state.player[kind]) { this.state.player[kind].z = Math.max(1, Math.min(3, +z || 1)); Storage.save(this.state); } },
  adjWheel(kind, ev) { const a = this.state.player[kind]; if (!a) return; a.z = Math.max(1, Math.min(3, (a.z || 1) - ev.deltaY * 0.0015)); Storage.save(this.state); },
  resetAdj(kind) { this.state.player[kind] = { x: 50, y: 50, z: 1 }; Storage.save(this.state); },
  get curAvatar() { return this.AVATARS.find(a => a.id === this.avatarId) || null; },
  dismissOffline() { this.offlineReport = null; },
  get offlineAwayText() { const r = this.offlineReport; if (!r) return ''; let s = Math.floor((r.awayMs || 0) / 1000); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); if (h > 0) return h + ' giờ' + (m > 0 ? (' ' + m + ' phút') : ''); if (m > 0) return m + ' phút'; return Math.max(1, s) + ' giây'; },
  get offlineActText() { const r = this.offlineReport; if (!r) return ''; if (r.type === 'combat') { const e = this.ENEMIES[r.enemyId]; return 'Chiến Đấu · ' + (e ? e.name : 'Yêu thú'); } const sk = this.SKILLS[r.skillId]; const it = r.itemId && this.ITEMS[r.itemId]; return (sk ? sk.name : 'Tu luyện') + (it ? (' · ' + it.name) : ''); },
  get offlineGains() {
    const r = this.offlineReport; if (!r) return [];
    const out = [];
    if (r.type === 'combat') {
      const e = this.ENEMIES[r.enemyId];
      out.push({ label: 'Hạ ' + (e ? e.name : 'yêu thú'), amount: '×' + r.cycles, cls: 'text-jade' });
      out.push({ label: 'Tu Vi · Chiến Đấu', amount: '+' + this.fmt(r.xp) + ' EXP', cls: 'text-cyan' });
      if (r.bac) out.push({ label: 'Bạc', amount: '+' + this.fmt(r.bac), cls: 'text-amber-300' });
    } else {
      const it = r.itemId && this.ITEMS[r.itemId];
      const sk = this.SKILLS[r.skillId];
      out.push({ label: it ? it.name : 'Thành quả', hex: it ? (this.QUALITY[it.quality] || {}).hex : null, amount: '×' + r.cycles, cls: 'text-jade' });
      out.push({ label: 'Tu Vi · ' + (sk ? sk.name : 'Tu luyện'), amount: '+' + this.fmt(r.xp) + ' EXP', cls: 'text-cyan' });
    }
    return out;
  },
  // ===== THÔNG BÁO (feed chung: chuông + Phi Cáp Đài) =====
  bellOpen: false,
  notifFilter: 'all',
  NOTIF_TYPES: [
    { id: 'all',      label: 'Tất cả',        col: '#94a3b8', svg: 'inbox',                seal: '總' },
    { id: 'chienDau', label: 'Chiến Đấu',     col: '#f87171', art: 'combat',     ic: '⚔️', seal: '戰' }, // nav Chiến Đấu (images/nav/combat.webp)
    { id: 'thuThap',  label: 'Thu Thập',      col: '#34d399', art: 'thaiKhoang', ic: '⛏️', seal: '采' }, // mượn art Đào Khoáng
    { id: 'yeuVuong', label: 'Yêu Vương',     col: '#fb7185', art: 'yvBachHo',   ic: '🐲', seal: '妖' }, // boss Bạch Hổ
    { id: 'biCanh',   label: 'Bí Cảnh',       col: '#a78bfa', art: 'dungeon',    ic: '🏛️', seal: '秘' }, // nav Bí Cảnh
    { id: 'linhThu',  label: 'Linh Thú',      col: '#14b8a6', art: 'pets',       ic: '🐾', seal: '獸' }, // nav Linh Thú
    { id: 'dongPhu',  label: 'Động Phủ',      col: '#c9a24b', art: 'dongPhu',    ic: '🏠', seal: '府' }, // nav Động Phủ
    { id: 'tienMinh', label: 'Tiên Minh',     col: '#f5b942', art: 'guild',      ic: '🏯', seal: '盟' }, // nav Tiên Minh (images/nav/guild.webp)
    { id: 'caoThi',   label: 'Cáo Thị',       col: '#f5b942', svg: 'scroll',               seal: '告' }, // thông báo của tác giả (bảng cao_thi)
    { id: 'khac',     label: 'Khác',          col: '#fbbf24', svg: 'star',                 seal: '他' },
    { id: 'sanGD',    label: 'Sàn Giao Dịch', col: '#22d3ee', art: 'market',     ic: '⚖️', seal: '易' }, // nav Sàn Giao Dịch
  ],
  notifTypeMeta(type) { return this.NOTIF_TYPES.find((t) => t.id === type) || this.NOTIF_TYPES.find((t) => t.id === 'khac'); },
  // Icon nhóm: art game có sẵn (ico) cho nhóm map tính năng; Tất cả/Khác = SVG nền + art ui phủ lên (images/ui/notif_<id>) khi có.
  notifIcon(t, size) {
    if (t && t.art) return this.ico(t.art, t.ic || '✦');
    const id = t ? t.id : '';
    const sv = this.svg((t && t.svg) || 'star', size || 'w-[18px] h-[18px]');
    return `<span class="relative w-full h-full inline-flex items-center justify-center">${sv}<img src="images/ui/notif_${id}.webp" class="absolute inset-0 w-full h-full object-contain p-0.5" alt="" onerror="if(this.src.endsWith('.webp')){this.src='images/ui/notif_${id}.png'}else{this.remove()}"></span>`;
  },
  pushNotif(type, title, body) { pushNotif(this.state, type, title, body, now()); Storage.save(this.state); },
  get notifications() { return this.state.notifications || []; },
  notifFor(type) { const a = this.notifications; return (!type || type === 'all') ? a : a.filter((n) => n.type === type); },
  notifUnread(type) { void this._tick; return this.notifFor(type).filter((n) => !n.read).length; },
  get notifBadge() { void this._tick; const n = this.notifications.filter((x) => !x.read).length; return n > 99 ? '99+' : (n ? String(n) : ''); },
  notifRecent(k) { return this.notifications.slice(0, k || 5); },
  toggleBell() { this.bellOpen = !this.bellOpen; },
  closeBell() { this.bellOpen = false; },
  openPhiCapDai() { this.bellOpen = false; this.navTo('phiCapDai'); },
  setNotifFilter(t) { this.notifFilter = t; },
  notifMarkRead(type) { this.notifFor(type).forEach((n) => { n.read = true; }); Storage.save(this.state); },
  notifClearType(type) { if (!type || type === 'all') this.state.notifications = []; else this.state.notifications = this.notifications.filter((n) => n.type !== type); Storage.save(this.state); },
  notifAgo(ts) { void this._tick; if (!ts) return ''; const s = Math.max(0, Math.floor((now() - ts) / 1000)); if (s < 60) return 'vừa xong'; const m = Math.floor(s / 60); if (m < 60) return m + ' phút trước'; const h = Math.floor(m / 60); if (h < 24) return h + ' giờ trước'; return Math.floor(h / 24) + ' ngày trước'; },
  _bossRewardText(rw) {
    if (!rw) return 'Đã hạ gục.';
    const p = [];
    for (const id in (rw.items || {})) { const it = this.ITEMS[id]; p.push((it ? it.name : id) + ' ×' + rw.items[id]); }
    if (rw.honThach) p.push(this.fmt(rw.honThach) + ' Hồn Thạch');
    if (rw.bac) p.push(this.fmt(rw.bac) + ' Bạc');
    if (rw.exp) p.push(this.fmt(rw.exp) + ' EXP');
    if (rw.diem) p.push(rw.diem + ' Điểm Sự Kiện');
    if (rw.phuKienRoi) p.push((this.ITEMS[rw.phuKienRoi] || {}).name || rw.phuKienRoi);
    return p.length ? 'Đoạt: ' + p.join(' · ') : 'Đã hạ gục.';
  },
  // ===== LINH THÚ (pet) =====
  PET_SPECIES, PET_QUALITY, AWK_PASSIVES,
  get petList() { return this.state.pets || []; },
  get activePetObj() { return activePet(this.state); },
  petName(pet) { return (PET_SPECIES[pet.base] || {}).name || pet.base; },
  petEmoji(pet) { return (PET_SPECIES[pet.base] || {}).emoji || '🐾'; },
  // Art tile pet: images/pets/pet_<base>_<base|awk>.webp -> png -> tự gỡ (lộ emoji nền dưới). Overlay phủ lên lớp emoji.
  petArtTag(pet) {
    const f = 'pet_' + pet.base + '_' + (pet.evolved ? 'awk' : 'base');
    return `<img src="images/pets/${f}.webp" class="w-full h-full object-contain" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/pets/${f}.png&quot;;}else{this.remove();}'>`;
  },
  hatchArtTag() {
    const h = this.state.hatchery; if (!h) return '';
    const f = 'pet_' + h.base + '_base';
    return `<img src="images/pets/${f}.webp" class="w-full h-full object-contain" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/pets/${f}.png&quot;;}else{this.remove();}'>`;
  },
  petRole(pet) { return (PET_SPECIES[pet.base] || {}).role || ''; },
  petHeName(pet) { const h = (PET_SPECIES[pet.base] || {}).he; return ({ kim: 'Kim', moc: 'Mộc', thuy: 'Thủy', hoa: 'Hỏa', tho: 'Thổ' })[h] || ''; },
  petQ(pet) { return this.QUALITY[pet.quality] || this.QUALITY.phamPham; },
  petStat(pet) { return petStatAt(pet); },
  // Danh sách buff hiển thị: Tứ Trụ chữ ký (sig, amber) đứng đầu + 5 buff thường (ngọc). 6 ô chia đều.
  petGainList(pet) {
    const out = [];
    const tt = petTuTru(pet);
    if (tt) out.push({ key: tt.stat, label: this.statLabel(tt.stat), val: tt.val, sig: true });
    const s = petStatAt(pet) || {};
    for (const k of ['congKich', 'hoThe', 'neTranh', 'menhTrung', 'sinhLuc']) if (s[k]) out.push({ key: k, label: this.statLabel(k), val: s[k], sig: false });
    return out;
  },
  petElColor(pet) { return (HE[(PET_SPECIES[pet.base] || {}).he] || {}).color || '#94a3b8'; },   // ĐỒNG BỘ bảng chuẩn HE (votong NGU_HANH): Kim vàng #facc15…
  petQHex(pet) { return ({ phamPham: '#cbd5e1', luongPham: '#34d399', tinhPham: '#60a5fa', tuyetPham: '#a78bfa', truyenThe: '#e879f9', thanPham: '#fb923c', coBan: '#fbbf24' })[pet.quality] || '#cbd5e1'; },
  statLabelFull(k) { return ({ congKich: 'Công Kích', hoThe: 'Hộ Thể', neTranh: 'Né Tránh', menhTrung: 'Chính Xác', sinhLuc: 'Sinh Lực' })[k] || k; },
  statIco(k) { const P = { congKich: '<path d="M5 19l3.5-3.5M8.5 15.5l8-8 2 2-8 8zM15 5l4 4"/>', hoThe: '<path d="M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6l7-3z"/>', neTranh: '<path d="M3 9h9a2.5 2.5 0 10-2.5-2.6M3 14h13a2.5 2.5 0 11-2.5 2.6"/>', menhTrung: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.5"/>', sinhLuc: '<path d="M12 20s-7-4.7-7-10a4 4 0 017-2.2A4 4 0 0119 10c0 5.3-7 10-7 10z"/>' }; P.lucDao = P.congKich; P.thanPhap = P.neTranh; P.linhXao = P.menhTrung; return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">' + (P[k] || '') + '</svg>'; },
  petXpNext(pet) { return petXpToNext(pet.level); },
  petXpPct(pet) { const n = petXpToNext(pet.level); return n ? Math.max(0, Math.min(100, (pet.xp || 0) / n * 100)) : 0; },
  // P4 — thanh Sinh Lực + Thể Lực pet (Sinh Lực theo phiên combat; Thể Lực bền, hồi thời gian thực).
  get petInCombat() { return !!(this.state.activity && this.state.activity.type === 'combat'); },
  get petFainted() { return this.petInCombat && !!(this.state.combat && this.state.combat.petFainted); },
  get petStamCur() { void this._tick; const p = this.activePetObj; return p ? petStamView(p, now()) : 100; },
  get petStamMaxV() { const p = this.activePetObj; return p ? petStamMax(p) : 100; },   // trần Thể Lực pet đang dắt (theo phẩm/cấp/awk)
  get petHpMaxV() { const p = this.activePetObj; return p ? petHpMax(p) : 0; },
  get petHpCur() { const p = this.activePetObj; if (!p) return 0; const h = this.state.combat && this.state.combat.petHp; return (h == null) ? this.petHpMaxV : Math.max(0, h); },
  get petHpPct() { const m = this.petHpMaxV; return m ? Math.max(0, Math.min(100, Math.round(this.petHpCur / m * 100))) : 0; },
  petPassiveOf(pet) { return petPassive(pet); },   // Tuyệt Kĩ bị động (signature loài)
  petActiveOf(pet) { return petActiveEff(pet) || {}; },   // chủ động (đã nhân hệ thức tỉnh khi evolved)
  petAwkPassiveOf(pet) { return petAwkPassive(pet); },    // P7 — bị động Thức Tỉnh (null nếu chưa)
  petSkillArt(pet, kind) {   // art tuyệt kĩ: images/pets/skill_<base>_<p|a>.webp -> png -> tự gỡ (lộ SVG nền)
    const f = 'skill_' + pet.base + '_' + (kind === 'active' ? 'a' : 'p');
    return `<img src="images/pets/${f}.webp" class="w-full h-full object-cover" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/pets/${f}.png&quot;;}else{this.remove();}'>`;
  },
  awkArtTag(awkId) {   // art bị động Thức Tỉnh: images/pets/awk_<id>.webp -> png -> tự gỡ (lộ SVG sao nền)
    const f = 'awk_' + awkId;
    return `<img src="images/pets/${f}.webp" class="w-full h-full object-cover" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/pets/${f}.png&quot;;}else{this.remove();}'>`;
  },
  // HP / Thể Lực / Ngất THEO TỪNG pet (popup mở pet bất kỳ; chỉ con đang mang + đang combat mới có HP phiên thật)
  petHpMaxOf(pet) { return petHpMax(pet); },
  petHpCurOf(pet) { return (this.petInCombat && this.activePetObj && this.activePetObj.id === pet.id) ? this.petHpCur : petHpMax(pet); },
  petHpPctOf(pet) { const m = petHpMax(pet); return m ? Math.max(0, Math.min(100, Math.round(this.petHpCurOf(pet) / m * 100))) : 0; },
  petStamOf(pet) { void this._tick; return petStamView(pet, now()); },
  petStamMaxOf(pet) { return petStamMax(pet); },   // trần Thể Lực 1 pet bất kỳ (roster/popup)
  petFaintedOf(pet) { return this.petFainted && this.activePetObj && this.activePetObj.id === pet.id; },
  // Popup chi tiết pet (mở từ roster) — mirror tpDetail
  petDetail: null,
  petDetailMode: 'view',   // view | fuse | fuseConfirm | release | awaken | huntPick
  fuseSel: [],
  openPetDetail(id) { this.petDetail = id; this.petDetailMode = 'view'; this.fuseSel = []; },
  closePetDetail() { this.petDetail = null; this.petDetailMode = 'view'; this.fuseSel = []; },
  get petDetailObj() { return this.petDetail ? (this.state.pets || []).find((x) => x.id === this.petDetail) : null; },
  petActiveDmg(pet) { const a = petActiveEff(pet); return a ? Math.round(((petStatAt(pet) || {}).congKich || 0) * (a.mult || 0)) : 0; },   // sát thương chủ động ≈ mult × Công Kích (đã gồm thức tỉnh)
  // --- P6: Dung Hợp (đa vật tế) ---
  get fuseDonors() {   // pet đủ điều kiện làm vật tế; SẮP cùng dòng+phẩm lên đầu rồi phẩm/cấp giảm dần
    const t = this.petDetailObj; if (!t) return [];
    const kin = (d) => (t.base === d.base && t.quality === d.quality) ? 0 : (t.base === d.base ? 1 : (t.quality === d.quality ? 2 : 3));
    return (this.state.pets || []).filter((p) => p.id !== t.id && !petBusy(p))
      .map((d) => ({ pet: d, pv: fusePreview(this.state, t.id, d.id) }))
      .sort((a, b) => kin(a.pet) - kin(b.pet) || this.qualityRank(b.pet.quality) - this.qualityRank(a.pet.quality) || b.pet.level - a.pet.level);
  },
  toggleFuseSel(id) { this.fuseSel = this.fuseSel.includes(id) ? this.fuseSel.filter((x) => x !== id) : [...this.fuseSel, id]; },
  get fuseSelSummary() {
    const t = this.petDetailObj; if (!t || !this.fuseSel.length) return null;
    let xp = 0, pSurv = 1; const absorbed = {};
    for (const id of this.fuseSel) {
      const pv = fusePreview(this.state, t.id, id); if (!pv) continue;
      xp += pv.xp;
      const d = (this.state.pets || []).find((p) => p.id === id); const ds = d ? (petStatAt(d) || {}) : {};
      for (const k of ['congKich', 'hoThe', 'neTranh', 'menhTrung', 'sinhLuc']) { if (ds[k]) { const a = Math.round(ds[k] * pv.pct); if (a > 0) absorbed[k] = (absorbed[k] || 0) + a; } }
      if (pv.same) pSurv *= (1 - pv.upChance);
    }
    return { count: this.fuseSel.length, xp, absorbed, upChance: 1 - pSurv };
  },
  doFuseMany() {
    const t = this.petDetailObj; if (!t || !this.fuseSel.length) return;
    const r = fuseMany(this.state, t.id, this.fuseSel.slice());
    this.fuseSel = []; this.petDetailMode = 'view';
    if (!r) { this.showToast('Không dung hợp được.'); return; }
    Storage.save(this.state);
    let m = this.petName(t) + ' nuốt ' + r.count + ' linh thú · +' + this.fmt(r.xp) + ' tu vi' + (r.leveled ? ' (lên ' + r.leveled + ' cấp)' : '');
    if (r.upgraded) { m += ' — ĐỘT PHÁ ' + (this.QUALITY[t.quality] || {}).name + '!'; this.pushNotif('linhThu', 'Dung Hợp đột phá', this.petName(t) + ' thăng phẩm ' + (this.QUALITY[t.quality] || {}).name + '.'); }
    this.showToast(m);
  },
  // --- P6: Phóng Sanh ---
  get releaseRewardObj() { const p = this.petDetailObj; return p ? releaseReward(p) : null; },
  doRelease() {
    const p = this.petDetailObj; if (!p) return;
    const r = releasePet(this.state, p.id); if (!r) { this.showToast('Đang dắt — thu về trước đã.'); return; }
    Storage.save(this.state); this.closePetDetail();
    const parts = [this.fmt(r.bac) + ' Bạc']; if (r.honThach) parts.push(r.honThach + ' Hồn Thạch'); if (r.linhPhach) parts.push(r.linhPhach + ' Linh Phách');
    this.showToast('Phóng sanh · nhận ' + parts.join(' · ') + '.');
  },
  // --- P7: Thức Tỉnh ---
  get awakenCostObj() { const p = this.petDetailObj; return p ? awakenCost(p) : null; },
  get canAwakenSel() { const p = this.petDetailObj; return p ? canAwaken(this.state, p) : false; },
  get awakenAffordSel() { const p = this.petDetailObj; return p ? awakenAfford(this.state, p) : false; },
  awakenMatName() { const c = this.awakenCostObj; return c ? ((this.ITEMS[c.matId] || {}).name || c.matId) : ''; },
  awakenMatHave() { const c = this.awakenCostObj; return c ? (this.state.inventory[c.matId] || 0) : 0; },
  awakenMatIco() { const c = this.awakenCostObj; return c ? this.ico(c.matId, (this.ITEMS[c.matId] || {}).icon || '🌀') : ''; },
  get awakenBlockReason() {
    const p = this.petDetailObj; if (!p) return '';
    if (p.evolved) return 'Đã Thức Tỉnh.';
    if (!this.canAwakenSel) return 'Phải đạt cảnh giới tối đa (Lv ' + this.petLevelCap(p) + ') mới Thức Tỉnh được.';
    if (!this.awakenAffordSel) return 'Thiếu nguyên liệu Thức Tỉnh hoặc Hồn Thạch.';
    return '';
  },
  doAwaken() {
    const p = this.petDetailObj; if (!p) return;
    const before = (this.QUALITY[p.quality] || {}).name;
    const r = awakenPet(this.state, p.id);
    if (!r) { this.showToast(this.awakenBlockReason || 'Chưa thể Thức Tỉnh.'); return; }
    Storage.save(this.state);
    this.petDetailMode = 'view';
    const aw = this.AWK_PASSIVES[r.awkPassive] || {};
    let m = this.petName(p) + ' Thức Tỉnh — lĩnh ngộ 〈' + aw.name + '〉';
    if (r.newOpt) m += ', khai mở ' + this.petOptLabel(r.newOpt);
    if (r.mutated) m += ' · BIẾN DỊ thăng ' + (this.QUALITY[p.quality] || {}).name;
    this.showToast(m + '.');
    this.pushNotif('linhThu', 'Linh Thú Thức Tỉnh', this.petName(p) + ' phá vỏ phàm thai, hiện hình thái thứ hai · lĩnh ngộ 〈' + aw.name + '〉' + (r.mutated ? ' · biến dị thăng phẩm ' + before + ' → ' + (this.QUALITY[p.quality] || {}).name : '') + '.');
  },
  // ===== P7: SĂN MỒI + NGỰ THÚ =====
  get nguThuLvV() { return nguThuLv(this.state); },
  get nguThuProg() { return this.skillProg('nguThu'); },                  // {level,into,need,frac}
  get huntSlotsV() { return huntSlots(this.state); },
  get huntSlotsUsedV() { return huntSlotsUsed(this.state); },
  get huntSlotFree() { return this.huntSlotsUsedV < this.huntSlotsV; },
  get nextSlotLv() { return (Math.floor(this.nguThuLvV / 5) + 1) * 5; },  // cấp Ngự Thú mở slot kế
  get huntingPets() { return (this.state.pets || []).filter((p) => p.state === 'hunt' || p.state === 'rest'); },
  petStateKey(pet) { return pet.equipped ? 'battle' : (pet.state || 'idle'); },
  petStateName(pet) { return ({ battle: 'Xuất Trận', hunt: 'Săn Mồi', rest: 'Dưỡng Sức', idle: 'Chờ Lệnh' })[this.petStateKey(pet)]; },
  petBusyV(pet) { return petBusy(pet); },
  petHuntLocName(pet) { const l = (this.LOCATIONS || []).find((x) => x.id === pet.huntLoc); return l ? l.name : ''; },
  // Vùng pet có thể săn: player đã mở (combatLv ≥ reqLevel); ok = pet đủ cấp vùng.
  huntLocOptions(pet) {
    return (this.LOCATIONS || []).filter((l) => this.combatLevel >= l.reqLevel)
      .map((l) => ({ loc: l, ok: pet.level >= l.reqLevel, lootNames: (l.enemies || []).map((eid) => (this.ENEMIES[eid] || {}).name).filter(Boolean) }));
  },
  phaiSan(petId, locId) {
    const p = (this.state.pets || []).find((x) => x.id === petId);
    if (p && (p.state === 'hunt' || p.state === 'rest')) stopHunt(this.state, petId, now());   // đổi vùng: thu về trước rồi phái lại
    const r = startHunt(this.state, petId, locId, now());
    if (!r) { this.showToast('Không phái được — hết slot hoặc pet chưa đủ cấp vùng.'); return; }
    Storage.save(this.state); this.petDetailMode = 'view';
    this.showToast(this.petName(r) + ' lên đường Săn Mồi · ' + this.petHuntLocName(r) + '.');
  },
  recallHunt(petId) {
    const r = stopHunt(this.state, petId, now());
    if (!r) return;
    Storage.save(this.state);
    this.showToast(this.petName(r) + ' đã thu về, nghỉ trong chuồng.');
  },
  // --- Popup "Lịch Luyện": theo dõi tiến độ săn mồi mọi pet ---
  huntTrackOpen: false,
  openHuntTrack() { this.huntTrackOpen = true; },
  closeHuntTrack() { this.huntTrackOpen = false; },
  changeHuntZone(petId) { this.huntTrackOpen = false; this.openPetDetail(petId); this.petDetailMode = 'huntPick'; },   // Đổi Vùng -> mở bảng chọn vùng của pet
  get huntTrackList() {
    void this._tick;                                                    // đếm giây -> countdown cập nhật
    const t = now();
    return this.huntingPets.map((p) => {
      const stam = petStamView(p, t);
      const max = petStamMax(p);
      const isRest = p.state === 'rest';
      const nextTickMs = isRest ? 0 : Math.max(0, (p.huntAt + HUNT_TICK_MS) - t);
      const restFullSec = isRest ? Math.ceil((max - stam) / 10) * 60 : 0;   // giây tới đầy (xấp xỉ, hồi 10/phút)
      const hs = p.huntStats || { exp: 0, ticks: 0, loot: {} };
      const lootCount = Object.values(hs.loot || {}).reduce((a, b) => a + b, 0);
      return {
        pet: p, stam, stamMax: max, isRest, nextTickMs, restFullSec,
        ticksToSleep: Math.max(0, Math.floor(stam / 10)),
        tickPct: isRest ? 0 : Math.max(0, Math.min(100, (1 - nextTickMs / HUNT_TICK_MS) * 100)),
        restPct: isRest ? Math.max(0, Math.min(100, stam / max * 100)) : 0,
        sessionExp: hs.exp || 0, sessionTicks: hs.ticks || 0, sessionLoot: lootCount,
        locName: this.petHuntLocName(p),
      };
    });
  },
  // Giải quyết săn mồi (gọi mỗi 5s + on-load). Trả mảng tóm tắt | null.
  tickHunts() {
    if (!(this.state.pets || []).some((p) => p.state === 'hunt' || p.state === 'rest')) return null;
    const res = resolvePetHunts(this.state, now(), idleCapMs(this.state));
    if (res.length) Storage.save(this.state);
    return res;
  },
  huntsOnLoad() {
    const res = this.tickHunts();
    if (!res || !res.length) return;
    const totExp = res.reduce((s, r) => s + r.exp, 0);
    const agg = {};
    res.forEach((r) => { for (const id in (r.loot || {})) agg[id] = (agg[id] || 0) + r.loot[id]; });
    const list = Object.keys(agg).map((id) => itemNameHtml(id) + ' ×' + agg[id]);   // tên tô màu phẩm chất
    const lootTxt = list.length ? (list.length > 6 ? list.slice(0, 6).join(', ') + ' … +' + (list.length - 6) + ' loại' : list.join(', ')) : '';
    if (totExp > 0 || list.length) this.pushNotif('linhThu', 'Linh Thú săn mồi', 'Khi vắng mặt, bầy Linh Thú săn được ' + this.fmt(totExp) + ' tu vi' + (lootTxt ? ' · Nhận: ' + lootTxt : '') + '.');
  },
  petOptLabel(o) { const d = PET_OPT_BY_ID[o.id] || {}; return (d.name || o.id) + ' +' + this.fmt(o.val) + (d.fmt === 'pct' ? '%' : ''); },
  petLevelCap(pet) { const off = { phamPham: 10, luongPham: 6, tinhPham: 3 }[pet.quality] || 0; return Math.max(1, this.combatLevel - off); },
  get eggsInInventory() {
    return Object.keys(this.state.inventory || {})
      .filter((id) => this.ITEMS[id] && this.ITEMS[id].type === 'trung' && (this.state.inventory[id] || 0) > 0)
      .map((id) => {
        const item = this.ITEMS[id], q = this.QUALITY[item.quality] || {};
        // Tên trứng data = "<Loài> Noãn · <Bậc>" → tách bậc ra CHIP (khuôn giống panel lò ở trên) để tên không bị cắt.
        return { id, qty: this.state.inventory[id], item,
          eggName: String(item.name).split(' · ')[0],
          tierName: q.name || '', tierColor: q.text || 'text-slate-300' };
      });
  },
  // --- P3: Lò Ấp Noãn (đơn). Roll pet ở engine lúc Đặt Ấp; ở đây điều phối + tính giờ/giá. ---
  get hatchery() { return this.state.hatchery; },
  get hatchReady() { void this._tick; return incubReady(this.state, now()); },
  get hatchRemainMs() { void this._tick; return incubRemainMs(this.state, now()); },
  get hatchTimeLeft() { return fmtClock(this.hatchRemainMs / 1000); },
  get hatchPct() { const h = this.state.hatchery; if (!h) return 0; void this._tick; return Math.max(0, Math.min(100, (now() - h.startedAt) / h.durMs * 100)); },
  get hatchSkipCost() { void this._tick; return incubSkipCost(this.state, now()); },
  get canAffordHatchSkip() { return (this.state.currencies.honThach || 0) >= this.hatchSkipCost; },
  hatchSpeciesName() { const h = this.state.hatchery; return h ? ((PET_SPECIES[h.base] || {}).name || h.base) : ''; },
  hatchEmoji() { const h = this.state.hatchery; return h ? ((PET_SPECIES[h.base] || {}).emoji || '🥚') : '🥚'; },
  hatchEggTierName() { const h = this.state.hatchery; return h ? ((this.QUALITY[h.eggQuality] || {}).name || '') : ''; },
  hatchEggTierColor() { const h = this.state.hatchery; return h ? ((this.QUALITY[h.eggQuality] || {}).text || 'text-slate-300') : 'text-slate-300'; },
  hatchDurLabel(eggQ) { return Math.round(hatchDurMs(eggQ) / 3600000) + ' giờ'; },
  startIncubate(eggId) {
    if (this.state.hatchery) { this.showToast('Lò ấp đang bận — khai noãn xong đã.'); return; }
    const rec = startIncubation(this.state, eggId, now());
    if (!rec) { this.showToast('Không ấp được trứng này.'); return; }
    Storage.save(this.state);
    this.showToast('Đặt ' + ((PET_SPECIES[rec.base] || {}).name || rec.base) + ' Noãn vào lò ấp.');
  },
  collectHatch() {
    const pet = finishHatch(this.state, now());
    if (!pet) return;
    Storage.save(this.state);
    const nm = this.petName(pet), qn = (this.QUALITY[pet.quality] || {}).name;
    this.showToast('Khai noãn! 〈' + nm + ' · ' + qn + '〉 phá vỏ chào đời.');
    this.pushNotif('linhThu', 'Khai noãn Linh Thú', nm + ' (' + qn + ') phá vỏ gia nhập đội.');
  },
  skipIncubate() {
    const h = this.state.hatchery; if (!h) return;
    const t = now();
    if (t >= h.readyAt) { this.collectHatch(); return; }       // đã đủ giờ -> khai luôn, miễn phí
    const cost = incubSkipCost(this.state, t);
    if ((this.state.currencies.honThach || 0) < cost) { this.showToast('Không đủ Hồn Thạch (cần ' + this.fmt(cost) + ').'); return; }
    this.state.currencies.honThach -= cost;
    h.readyAt = t;
    this.collectHatch();                                        // tự Storage.save + thông báo
  },
  equipPet(petId) { const p = (this.state.pets || []).find((x) => x.id === petId); if (p && (p.state === 'hunt' || p.state === 'rest')) stopHunt(this.state, petId, now()); (this.state.pets || []).forEach((x) => { x.equipped = (x.id === petId); }); Storage.save(this.state); if (p) this.showToast(this.petName(p) + ' đã xuất trận, kề vai cùng bạn.'); },
  unequipActivePet() { (this.state.pets || []).forEach((p) => { p.equipped = false; }); Storage.save(this.state); },
  // Bonus pet ĐÃ CAP (số thực cộng vào nhân vật) = stats(có pet) − stats(không pet).
  activePetBonusApplied() {
    if (!this.activePetObj) return null;
    const withP = derivedStats(this.state), noP = derivedStats(this.state, { noPet: true });
    const out = {};
    for (const k of ['congKich', 'hoThe', 'neTranh', 'menhTrung', 'sinhLuc']) { const d = withP[k] - noP[k]; if (d > 0) out[k] = d; }
    return out;
  },
  statLabelShort(k) { return ({ congKich: 'Công', hoThe: 'Thủ', neTranh: 'Né', menhTrung: 'Chính Xác', sinhLuc: 'Sinh Lực' })[k] || k; },
  get viewName() { return VIEW_NAMES[this.view] || ''; },
  // Trang giữ chỗ chỉ dành cho view gắn `soon` trong data/nav.js. Trước đây đây là danh sách
  // trắng viết tay: dựng view mới mà quên thêm tên vào là màn đó bị dán thêm khối
  // "Đang hoàn thiện — sắp ra mắt" ngay dưới nội dung thật (đã xảy ra với Sự Kiện).
  get isPlaceholderView() { return SOON_VIEWS.has(this.view); },
  get currentSkill() { return this.SKILLS[this.selectedSkill]; },

  // ---------- ĐÀM ĐẠO (cốt truyện NPC nghề — chương mở theo cấp nghề + hội thoại nhánh) ----------
  dd: { open: false, skillId: null, chapter: null, node: null, log: [], busy: false, typing: false },  // trạng thái phát hội thoại
  _ddTimer: null,  // hẹn giờ bung dòng (ngoài dd để không bị reset khi mở lại)
  hasDamDao(id) { const a = DAMDAO[id]; return !!(a && a.chapters && a.chapters.length); },
  // chương của 1 nghề kèm trạng thái mở/đã-đọc (unlocked theo skillLevel; seen từ state.damDao)
  damDaoChapters(id) {
    const a = DAMDAO[id]; if (!a) return [];
    const lv = this.skillLevel(id), seen = this.state.damDao[id] || [];
    return a.chapters.map((c, i) => ({ id: c.id, title: c.title, req: c.req, num: i + 1, unlocked: lv >= c.req, seen: seen.includes(c.id) }));
  },
  // số chương ĐÃ MỞ mà CHƯA đọc (badge mời gọi trên nút Đàm Đạo)
  damDaoNewCount(id) { return this.damDaoChapters(id).filter((c) => c.unlocked && !c.seen).length; },
  get ddNpcName() { const s = this.SKILLS[this.dd.skillId]; return (s && s.npc && s.npc.name) || ''; },
  get ddChapters() { return this.damDaoChapters(this.dd.skillId); },
  get ddCurChoices() { const ch = this.dd.chapter; if (!ch || !this.dd.node) return []; const n = ch.nodes[this.dd.node]; return (n && n.choices) || []; },
  get ddAtEnd() { const ch = this.dd.chapter; if (!ch || !this.dd.node) return false; const n = ch.nodes[this.dd.node]; return !n || !(n.choices && n.choices.length); },  // node thiếu (to sai) -> coi như kết chương, tránh soft-lock
  damDaoOpen() { if (!this.hasDamDao(this.selectedSkill)) return; this._ddStop(); this.dd = { open: true, skillId: this.selectedSkill, chapter: null, node: null, log: [], busy: false, typing: false }; },
  ddClose() { this._ddStop(); this.dd.open = false; this.dd.chapter = null; },
  ddBackToList() { this._ddStop(); this.dd.chapter = null; this.dd.node = null; this.dd.log = []; },
  ddPickChapter(chId) {
    const arc = DAMDAO[this.dd.skillId]; if (!arc) return;
    const ch = arc.chapters.find((c) => c.id === chId); if (!ch) return;
    const lv = this.skillLevel(this.dd.skillId);
    if (lv < ch.req) { this.showToast('Chưa tới lúc — cần nghề Lv ' + ch.req + '.'); return; }
    this.dd.chapter = ch; this.dd.node = ch.start; this.dd.log = [];
    this._ddReveal(((ch.nodes[ch.start] || {}).say) || []);
  },
  ddChoose(i) {
    if (this.dd.busy) return;   // đang bung dòng -> khoá click (footer cũng ẩn sẵn)
    const ch = this.dd.chapter; if (!ch) return;
    const node = ch.nodes[this.dd.node]; const c = node && node.choices && node.choices[i]; if (!c) return;
    this.dd.log.push({ who: 'me', text: c.t });
    this.dd.node = c.to;
    this._ddReveal(((ch.nodes[c.to] || {}).say) || []);
  },
  // Bung lần lượt từng dòng NPC: hiện chấm "đang gõ" (delay theo độ dài) rồi mới đẩy dòng vào log
  _ddReveal(lines) {
    this._ddStop();
    const queue = (lines || []).slice();
    this.dd.busy = true; this.dd.typing = false;
    const step = () => {
      if (!this.dd.open || !this.dd.chapter) { this.dd.busy = false; this.dd.typing = false; return; }
      if (!queue.length) { this.dd.typing = false; this.dd.busy = false; this._ddCheckEnd(); return; }
      const text = queue.shift();
      this.dd.typing = true;
      const wait = Math.max(360, Math.min(1400, 300 + text.length * 15));
      this._ddTimer = setTimeout(() => {
        this.dd.typing = false;
        this.dd.log.push({ who: 'npc', text });
        this._ddTimer = setTimeout(step, queue.length ? 240 : 60);
      }, wait);
    };
    step();
  },
  _ddStop() { if (this._ddTimer) { clearTimeout(this._ddTimer); this._ddTimer = null; } if (this.dd) { this.dd.busy = false; this.dd.typing = false; } },
  _ddCheckEnd() {
    if (!this.ddAtEnd) return;   // còn nhánh -> chưa xong
    const id = this.dd.skillId, chId = this.dd.chapter.id;
    if (!this.state.damDao[id]) this.state.damDao[id] = [];
    if (!this.state.damDao[id].includes(chId)) {
      const wasDone = _tinVatDone(this.state, id);
      this.state.damDao[id].push(chId);
      try { Storage.save(this.state); } catch (e) {}
      // vừa đọc HẾT trọn arc -> trao Tín Vật (+% hiệu suất nghề)
      if (!wasDone && _tinVatDone(this.state, id)) {
        const tv = TIN_VAT[id];
        if (tv) this.showToast('Nhận Tín Vật: ' + tv.name + ' — +' + TIN_VAT_EFF_PCT + '% ' + ((this.SKILLS[id] || {}).name || 'nghề'));
      }
    }
  },
  // ---- Tín Vật (thưởng Đàm Đạo): helper cho UI ----
  tinVatPct: TIN_VAT_EFF_PCT,
  tinVatOf(id) { return TIN_VAT[id] || null; },
  tinVatDone(id) { return _tinVatDone(this.state, id); },
  get tinVatList() { return Object.keys(TIN_VAT).filter((id) => this.hasDamDao(id) && _tinVatDone(this.state, id)).map((id) => ({ id, ...TIN_VAT[id], skillName: (this.SKILLS[id] || {}).name || '' })); },

  // Nghề THU THẬP (có zone trên action) → danh sách chỉ hiện tài nguyên của VÙNG đang đứng. Nghề chế tạo (không zone) hiện hết.
  get currentSkillIsGather() { return ((this.currentSkill && this.currentSkill.actions) || []).some((a) => a.zone); },
  // --- Rèn Đúc: lọc theo LOẠI trang bị (slot thường + tiểu loại vũ khí) ---
  forgeSlot: 'all',
  get forgeCats() {
    return [
      { k: 'all', n: 'Tất cả' },
      { k: 'vuKhi', n: 'Vũ Khí', head: true },
      { k: 'kiem', n: '— Kiếm' }, { k: 'dao', n: '— Đao' }, { k: 'cung', n: '— Cung' }, { k: 'amkhi', n: '— Ám Khí' },
      { k: 'mu', n: 'Mũ' }, { k: 'giap', n: 'Áo' }, { k: 'dai', n: 'Đai' }, { k: 'gang', n: 'Găng Tay' }, { k: 'giay', n: 'Giày' },
      { k: 'nhan', n: 'Nhẫn' }, { k: 'trangSuc', n: 'Trang Sức' }, { k: 'toaKy', n: 'Tọa Kỵ' }, { k: 'cuoc', n: 'Công Cụ' },
    ];
  },
  forgeMatch(a) {
    if (this.forgeSlot === 'all') return true;
    const e = (this.ITEMS[a.itemId] || {}).equip || {};
    if (this.forgeSlot === 'vuKhi') return e.slot === 'vuKhi';                                  // toàn bộ vũ khí
    if (['kiem', 'dao', 'cung', 'amkhi'].includes(this.forgeSlot)) return e.slot === 'vuKhi' && e.weaponType === this.forgeSlot; // tiểu loại
    // "Công Cụ" gom CẢ 4 ô công cụ — trước đây chỉ khớp 'cuoc' nên Rìu/Cần Câu/Dược Liêm bị lọc mất.
    if (this.forgeSlot === 'cuoc') return TOOL_SLOTS.some((t) => t.id === e.slot);
    return e.slot === this.forgeSlot;
  },
  /**
   * Biểu tượng một dòng công thức. Đan Đan Điền thì lồng viên đan vào tờ Dược Phương;
   * mọi công thức khác vẫn vẽ y như cũ.
   * ⚠ Dùng lại đúng bộ ghép ảnh của Đồ Phổ trong `ico()`, đừng dựng bộ thứ hai.
   */
  icoCongThuc(a) {
    if (!a) return '';
    const id = a.itemId;
    if (id && ddNauDuoc(id)) return this.ico('phuong_' + id, (this.ITEMS[id] || {}).icon);
    return this.ico(id || this.currentSkill.id, id ? this.ITEMS[id].icon : this.currentSkill.icon);
  },
  get currentSkillActions() {
    void this._tick;
    const acts = (this.currentSkill && this.currentSkill.actions) || [];
    // Đốn Ngộ Cảnh · Vô Câu Địa Giới: bỏ khoá vùng cho đúng nghề đã mua nút đó.
    const boVung = ncBoKhoaVung(this.state, this.selectedSkill);
    let out = acts.filter((a) => boVung || !a.zone || a.zone === this.currentLocation);
    if (this.selectedSkill === 'daTao' && this.forgeSlot !== 'all') out = out.filter((a) => this.forgeMatch(a));
    if (this.selectedSkill === 'daTao') out = out.filter((a) => this.forgeUnlocked(a.itemId)); // bậc 4-7 cần Đồ Phổ đã lĩnh ngộ
    if (this.skillSubTabsFor(this.selectedSkill)) { const t = this.effectiveSkillTab; out = out.filter((a) => this.skillActionCat(this.selectedSkill, a) === t); } // Luyện Kim/Luyện Đan: lọc theo tab
    // Luyện Đan gom nhiều dòng (đan hồi + 4 họ đan bổ trợ) nên thứ tự khai báo làm cấp nhảy lộn xộn
    // (1 -> 20 -> 40 -> 55 -> 85 rồi tụt về 20). Ép sắp theo CẤP tăng dần cho dễ đọc.
    if (this.selectedSkill === 'luyenDan') out = [...out].sort((a, b) => (a.reqLevel || 0) - (b.reqLevel || 0));
    return out;
  },
  // Chia 2 tab: Luyện Kim (Đúc Thỏi / Đá Cường Hóa) · Luyện Đan (Linh Thạch / Đan Dược)
  skillTab: 'thoi',
  skillSubTabsFor(skillId) {
    if (skillId === 'daLuyen') return [{ k: 'thoi', n: 'Đúc Thỏi' }, { k: 'da', n: 'Chế Tạo Đá Cường Hóa' }];
    if (skillId === 'luyenDan') return [{ k: 'linhThach', n: 'Linh Thạch' }, { k: 'dan', n: 'Đan Dược' }, { k: 'duocPhuong', n: 'Dược Phương' }];
    return null;
  },
  get skillSubTabs() { return this.skillSubTabsFor(this.selectedSkill); },
  get effectiveSkillTab() { const subs = this.skillSubTabs; if (!subs) return null; return subs.some((s) => s.k === this.skillTab) ? this.skillTab : subs[0].k; },
  skillActionCat(skillId, action) {
    if (skillId === 'daLuyen') return (action.itemId || '').startsWith('daCuongHoa') ? 'da' : 'thoi';
    if (skillId === 'luyenDan') {
      // ⚠ Ba tab, KHÔNG phải hai. Đan Điền mang `type: 'danDien'` — thiếu nhánh này thì 15 công
      //   thức Dược Phương rơi hết vào tab Linh Thạch.
      const t = (this.ITEMS[action.itemId] || {}).type;
      if (t === 'danDien') return 'duocPhuong';
      return t === 'dan' ? 'dan' : 'linhThach';
    }
    return null;
  },
  // --- "Có gì ở đây" (modal địa điểm): tách quái thường / boss, + tài nguyên cày được theo vùng ---
  zoneMobs(loc) { return this.locationEnemies(loc).filter((eid) => this.ENEMIES[eid] && !this.ENEMIES[eid].isBoss); },
  zoneBosses(loc) { return this.locationEnemies(loc).filter((eid) => this.ENEMIES[eid] && this.ENEMIES[eid].isBoss); },
  zoneResources(zoneId) {
    const out = [];
    // Quét ĐỘNG mọi nghề có action gắn zone — thêm nghề gather mới tự hiện ở tab Tài Nguyên của modal Địa Điểm.
    Object.keys(this.SKILLS).filter((id) => (this.SKILLS[id].actions || []).some((a) => a.zone)).forEach((sk) => {
      const skill = this.SKILLS[sk]; if (!skill) return;
      (skill.actions || []).forEach((a) => { if (a.zone === zoneId) out.push({ id: a.id, name: a.name, itemId: a.itemId, reqLevel: a.reqLevel, skillName: skill.name }); });
    });
    return out;
  },
  // Bí Cảnh theo VÙNG: mỗi Bí Cảnh gắn 1 location (d.loc); phải Ở đúng vùng mới treo được
  zoneDungeons(loc) { const id = loc && loc.id; return id ? this.DUNGEONS.filter((d) => d.loc === id) : []; },
  dungeonAtLoc(d) { return !d || !d.loc || this.currentLocation === d.loc; },   // player đang đứng đúng vùng của Bí Cảnh?
  dungeonLocName(d) { const l = d && d.loc && this.locationObj(d.loc); return l ? l.name : ''; },
  goToDungeon(id) { this.selectDungeon(id); this.closeLocation(); this.navTo('dungeon'); },   // từ modal Địa Điểm nhảy vào màn Bí Cảnh
  navItemActive(it) { return this.view === it.view; },
  // Icon: tự chọn folder theo id (ICON_FOLDERS), mặc định 'items'; lỗi -> rơi về emoji
  // Bù lề cho art vẽ TRÀN SÁT MÉP canvas. Trang bị render bằng object-fit:fill (kéo giãn lấp ô), nên
  // vật thể chiếm bao nhiêu phần canvas thì đeo vào trông to bấy nhiêu. Đo thực tế:
  //   rìu/cuốc/cần câu bậc 4-7 = 72-89% × 82-97% khung · Dược Liêm bậc 1 = 91% · Dược Liêm bậc 4-7 = 99×99%.
  // 99% là chạm sát mép, đứng cạnh bộ cũ thành chật chội. Inset ở tầng render kéo về đúng dải trên,
  // khỏi phải gen lại ảnh. Thêm art tràn mép về sau thì thêm 1 dòng vào đây.
  ART_INSET: { eq_duocLiem_4: 9, eq_duocLiem_5: 9, eq_duocLiem_6: 9, eq_duocLiem_7: 9 },
  ico(id, emoji) {
    const safe = String(emoji || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    // id rỗng = CHƯA CÓ ART, nói thẳng ra emoji. Không có dòng này thì nó vẫn ra emoji, nhưng phải
    // đi qua một lượt xin `images/items/.webp` rồi `.png` — hai lần 404 cho mỗi ô, mỗi nhịp vẽ.
    if (!id) return `<span>${safe}</span>`;
    // ĐAN ĐIỀN: nhánh nào chưa vẽ art riêng thì MƯỢN art đan sẵn có theo phẩm (`ddArtCua`).
    // ⚠ Thiếu dòng này thì Khí Đan và Thần Đan xin `images/items/ddKhi1.webp` — không có tệp nên
    //   rơi về emoji ⚱️ trơn, 18/27 ô trong Hành Lý thành hàng lỗi.
    const ddIt = this.ITEMS && this.ITEMS[id];
    if (ddIt && ddIt.type === 'danDien') id = ddArtCua(ddIt.nhanh, ddIt.pham);
    const folder = ICON_FOLDERS[id] || 'items';
    const drop = `this.replaceWith(Object.assign(document.createElement(&quot;span&quot;),{textContent:&quot;${safe}&quot;}))`;
    // DƯỢC PHƯƠNG: tờ phương làm nền, viên đan lồng giữa. CÙNG khuôn với Đồ Phổ ngay bên dưới
    // — 44% ở giữa là đúng khoảng trống mà ba tấm art chừa sẵn (xem docs/ART_DAN_DIEN.md).
    // ⚠ `phuong_<itemId>` chỉ sống trong lời gọi, KHÔNG phải một vật phẩm.
    if (id && id.startsWith('phuong_')) {
      const danId = id.slice(7);
      const it = (this.ITEMS && this.ITEMS[danId]) || {};
      const bgFile = ddNenPhuong(it.pham), art = ddArtCua(it.nhanh, it.pham);
      if (bgFile && art) {
        const qm = (this.QUALITY && this.QUALITY[it.quality]) || null;
        const bd = qm ? qm.border : 'border-slate-500/50';
        const inner = `<img src="images/items/${art}.webp" class="w-full h-full object-contain" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/items/${art}.png&quot;;}else{${drop};}'>`;
        return `<span class="relative block w-full h-full">`
          + `<img src="images/items/${bgFile}.webp" class="absolute inset-0 w-full h-full object-contain" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/items/${bgFile}.png&quot;;}else{${drop};}'>`
          + `<span class="absolute overflow-hidden border ${bd}" style="left:50%;top:49%;transform:translate(-50%,-50%);width:44%;height:44%;border-radius:14%">`
          + inner
          + `</span></span>`;
      }
      id = danId;   // thiếu nền thì vẽ viên đan trơn, đừng rơi về emoji
    }
    if (id && id.startsWith('dp_')) {   // ĐỒ PHỔ: cuộn nền THEO BẬC + art gear/tool lồng giữa. Tất cả WEBP-FIRST -> png -> emoji.
      const qq = ((this.ITEMS && this.ITEMS[id]) || {}).quality;
      const qmeta = (this.QUALITY && this.QUALITY[qq]) || null;
      const bd = qmeta ? qmeta.border : 'border-slate-500/50';
      const gearId = id.slice(3);
      // Nền cuộn theo bậc: 2-3 Lương/Tinh -> dopho_23 · 4-5 Tuyệt/Truyền Thế -> dopho_45 · 6 Thần -> dopho_6 · 7 Cô Bản -> dopho_7.
      const bgFile = { luongPham: 'dopho_23', tinhPham: 'dopho_23', tuyetPham: 'dopho_45', truyenThe: 'dopho_45', thanPham: 'dopho_6', coBan: 'dopho_7' }[qq] || 'dopho_45';
      const inner = `<img src="images/equip/${gearId}.webp" class="w-full h-full object-contain" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/equip/${gearId}.png&quot;;}else{${drop};}'>`;
      return `<span class="relative block w-full h-full">`
        + `<img src="images/items/${bgFile}.webp" class="absolute inset-0 w-full h-full object-contain" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/items/${bgFile}.png&quot;;}else{${drop};}'>`
        + `<span class="absolute overflow-hidden border ${bd}" style="left:50%;top:49%;transform:translate(-50%,-50%);width:44%;height:44%;border-radius:14%;background:#070908">`
        + inner
        + `</span></span>`;
    }
    // ĐỒ PHỔ BỘ TRANG (dpset_) và ĐỒ PHỔ TUYỆT KĨ (dpchieu_): cũng là đồ phổ, phải mang cùng
    // hình cuộn — trước đó rơi về emoji 📜 nên đứng lẫn trong lưới Bảo Vật nhìn như hàng lỗi.
    // dpset_ lồng emblem BỘ TRANG ở giữa (nếu có art bộ); dpchieu_ có cuộn riêng dopho_chieu.
    if (id && (id.startsWith('dpset_') || id.startsWith('dpchieu_'))) {
      const laChieu = id.startsWith('dpchieu_');
      const bgFile = laChieu ? 'dopho_chieu' : 'dopho_7';
      const nen = `<img src="images/items/${bgFile}.webp" class="absolute inset-0 w-full h-full object-contain" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/items/${bgFile}.png&quot;;}else{${drop};}'>`;
      // ĐỒ PHỔ TUYỆT KĨ: LỒNG ART CHIÊU vào giữa cuộn, y như đồ phổ trang bị lồng art món đồ
      // (user hỏi 2026-07-30: "đồ phổ kĩ năng sao k lồng hình ảnh vào như trang bị vậy").
      // Mã chiêu nằm ngay sau `dpchieu_` và trùng đúng tên tệp trong images/chieu/ (vmqn, tatn…).
      if (laChieu) {
        const cid = id.slice(8);
        const qq2 = ((this.ITEMS && this.ITEMS[id]) || {}).quality;
        const bd2 = ((this.QUALITY && this.QUALITY[qq2]) || {}).border || 'border-amber-500/50';
        return `<span class="relative block w-full h-full">` + nen
          + `<span class="absolute overflow-hidden border ${bd2}" style="left:50%;top:49%;transform:translate(-50%,-50%);width:46%;height:46%;border-radius:14%;background:#070908">`
          + `<img src="images/chieu/${cid}.webp" class="w-full h-full object-cover" alt="" onerror='this.parentElement.remove()'>`
          + `</span></span>`;
      }
      // ĐỒ PHỔ BỘ TRANG: cuộn TRƠN — chưa có art riêng cho từng Bộ Trang, lồng ô rỗng vào giữa
      // còn xấu hơn. Tên bên dưới đủ phân biệt; muốn đẹp hẳn thì phải vẽ 11 tấm.
      return `<span class="relative block w-full h-full">` + nen + `</span>`;
    }
    if (folder === 'equip') {   // art trang bị (KÉO GIÃN lấp khung): WEBP-FIRST -> png -> emoji.
      const pad = (this.ART_INSET && this.ART_INSET[id]) ? `;padding:${this.ART_INSET[id]}%` : '';
      return `<img src="images/equip/${id}.webp" class="w-full h-full" style="object-fit:fill${pad}" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/equip/${id}.png&quot;;}else{${drop};}'>`;
    }
    return `<img src="images/${folder}/${id}.webp" class="w-full h-full object-contain p-0.5" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/${folder}/${id}.png&quot;;}else{${drop};}'>`;
  },
  // Ảnh cuộn Đồ Phổ theo bậc (preview pool ở lưới Bảo Vật). bac = mảng bậc; lấy bậc cao nhất.
  // 2-3 -> dopho_23 · 4-5 -> dopho_45 · 6 -> dopho_6 · 7 -> dopho_7 (khớp nền cuộn ở ico() 'dp_').
  doPhoScroll(bac) {
    const b = Array.isArray(bac) ? Math.max.apply(null, bac) : (bac || 4);
    const f = b <= 3 ? 'dopho_23' : (b <= 5 ? 'dopho_45' : (b === 6 ? 'dopho_6' : 'dopho_7'));
    return 'images/items/' + f + '.webp';
  },
  // Ảnh chân dung YÊU THÚ — object-cover (lấp đầy khung), fallback emoji. Dùng ở danh sách + popup Suy Tính.
  enemyArt(id, emoji) {
    const safe = String(emoji || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `<img src="images/enemies/${id}.webp" class="w-full h-full object-cover" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=&quot;images/enemies/${id}.png&quot;;}else{this.replaceWith(Object.assign(document.createElement(&quot;span&quot;),{textContent:&quot;${safe}&quot;}));}'>`;
  },
  // Icon đường nét nội tuyến (thay emoji hệ thống). cls điều khiển kích thước/màu.
  svg(name, cls) {
    const p = SVG_PATHS[name]; if (!p) return '';
    return `<svg class="${cls || 'w-4 h-4'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  },

  // ---------- Tạo nhân vật (giang hồ tự do: chỉ Nam/Nữ) ----------
  // ============================================================
  // CỔNG VÀO — phải có tài khoản mới tạo được nhân vật (user chốt 2026-08-05).
  //
  // ⚠⚠ CỔNG ĐẶT TRƯỚC MÀN TẠO NHÂN VẬT, KHÔNG đặt trước cả game. Khác biệt nằm ở người ĐÃ CÓ
  //   nhân vật trên máy này:
  //   · Chặn cả họ thì mất mạng một cái là không ai mở được game đã chơi bao lâu nay — mà game
  //     này vốn OFFLINE-FIRST, cloud chỉ là chỗ cất save.
  //   · Chặn ở đây thì MỌI người chơi mới đều phải có tài khoản (muốn chơi là phải tạo nhân vật),
  //     còn người cũ không bị khoá ngoài cửa vì mạng.
  //   Muốn chặn cứng cả người cũ thì bỏ vế `&& !this.state.player.created` — một dòng.
  //
  // ⚠ Ba trạng thái chứ không phải hai: lúc mới mở game còn ĐANG khôi phục phiên Supabase
  //   (`authKiemTra`). Coi "chưa biết" là "chưa đăng nhập" thì người đã đăng nhập vẫn bị chớp
  //   màn đăng nhập mỗi lần tải trang.
  authKiemTra: true,     // đang khôi phục phiên
  cloudHong: false,      // không nạp được SDK / mất mạng
  get needsAuth() { return !this.isLoggedIn && !this.state.player.created; },
  /** Đang khôi phục phiên: chưa biết có tài khoản hay chưa -> đừng vẽ form vội. */
  get authDangDoi() { return this.authKiemTra && this.needsAuth; },
  napCloud: false,       // vừa đăng nhập, đang kéo nhân vật từ cloud về (sắp tải lại trang)
  /**
   * Màn Khai Tịch đang PHẢI CHỜ.
   * ⚠ Không có cờ này thì người đăng nhập bằng tài khoản ĐÃ CÓ nhân vật sẽ thấy màn tạo nhân vật
   *   chớp lên 0,7 giây rồi trang tải lại — trông như game quên mất mình là ai.
   */
  get khaiTichChoDoi() { return this.authDangDoi || this.napCloud; },
  get needsCreation() { return !this.state.player.created && !this.needsAuth; },
  pickGender(g) { this.draftGender = g; },
  pickTamPhap(id) { this.draftTamPhap = id; },
  draftTamPhapOn(id) { return this.draftTamPhap === id; },
  get canCreate() { return (this.draftName || '').trim().length >= 2 && !!this.draftGender && !!this.draftTamPhap; },
  createCharacter() {
    if (!this.canCreate) return;
    this.state.player.name = this.draftName.trim();
    this.state.player.gender = this.draftGender;
    this.state.player.class = null;
    this.state.player.created = true;
    // ẢNH BÌA MẶC ĐỊNH — KHÔNG để trùng ảnh đại diện. `coverImg` bỏ trống nghĩa là "Giống Avatar",
    // nên nhân vật mới nào cũng có banner y hệt ô mặt, nhìn ra một tấm ảnh dán hai lần.
    // ⚠ Art MƯỢN: chưa vẽ ảnh bìa riêng nên mượn cảnh Bí Cảnh Thanh Vân Cốc (cảnh bình minh,
    //   không có nhân vật, hợp chất nhập môn). Vẽ xong ảnh thật thì đổi BIA_MAC_DINH.
    this.state.player.coverImg = BIA_MAC_DINH;
    this.state.player.cover = { x: 50, y: 48, z: 1 };
    // Tâm Pháp khởi tu → set bài võ + sở hữu NHẬP MÔN theo hệ đã chọn (không còn ép Hỏa)
    const kit = starterLoadoutFor(this.draftTamPhap);
    const lo = this.state.combat.loadout;
    lo.tamPhap = kit.tamPhap;
    lo.biDong = kit.biDong.slice();
    lo.chieu = kit.chieu.slice(0, this.maxChieuSlots);
    this.state.combat.owned = { chieu: kit.chieu.slice(), tamPhap: [kit.tamPhap], biDong: kit.biDong.slice() };
    Storage.save(this.state);
    // Gắn nhân vật vào tài khoản NGAY, đừng đợi nhịp đẩy 15 giây. Người chơi vừa lập tài khoản
    // xong mà đóng tab luôn thì cloud trống, mở máy khác ra lại bắt tạo nhân vật lần nữa.
    // ⚠ KHÔNG `await`: lỗi mạng ở đây không được làm hỏng việc vào game.
    try { this._cloudPushNow(); } catch (e) {}
  },
  get className() { return 'Giang Hồ Tự Do'; },
  get genderLabel() { return this.state.player.gender === 'nu' ? 'Nữ' : (this.state.player.gender === 'nam' ? 'Nam' : '—'); },
  // ---------- Nghề (bái sư, giữ nhiều) ----------
  get professions() { return this.state.player.professions || []; },
  hasProfession(id) { return this.professions.includes(id); },
  get professionCount() { return this.professions.length; },
  get professionNextCost() { const c = PROF_COST[this.professionCount]; return c != null ? c : PROF_COST[PROF_COST.length - 1] * 2; }, // theo BẬC nghề đã học
  get professionLvReq() { return this.professionCount * PROF_LV_STEP; },           // mỗi 80 Tổng Lv mở thêm 1 nghề
  professionLvLocked(id) { return !this.hasProfession(id) && this.totalLevel < this.professionLvReq; },
  learnProfession(id) {
    const n = this.NGHE.find((x) => x.id === id); if (!n || this.hasProfession(id)) return;
    if (this.totalLevel < this.professionLvReq) { this.showToast('Cần Tổng Lv ' + this.professionLvReq + ' để học nghề thứ ' + (this.professionCount + 1) + '.'); return; }
    const cost = this.professionNextCost;
    if ((this.state.currencies.bac || 0) < cost) { this.showToast('Không đủ Bạc (' + this.fmt(cost) + ') để bái sư.'); return; }
    this.state.currencies.bac -= cost;
    this.state.player.professions.push(id);
    Storage.save(this.state);
    this.showToast('Bái sư thành! Đã học nghề ' + n.name + '.');
    this.pushNotif('khac', 'Bái sư thành công', 'Đã học nghề ' + n.name + '.');
  },

  // ---------- Kỹ năng / Tứ Trụ ----------
  // ⚠⚠ HAI HÀM NÀY LÀ CỬA DUY NHẤT giao diện đọc cấp kỹ năng. Phải đi qua `tranCap` vì Trùng Sinh
  //   nâng trần thêm 10 cấp mỗi lần. Gọi thẳng `levelFromXp` là người đã Trùng Sinh kẹt ở cấp 100:
  //   cày mãi mà thanh kinh nghiệm đầy ắp không nhúc nhích.
  skillProg(id) { return tienDoKyNang(this.state, id); },
  skillLevel(id) { return capKyNang(this.state, id); },
  /** Trần cấp hiện tại của một kỹ năng — giao diện cần để ghi "Lv 100 / 160". */
  skillTran(id) { return tranCap(this.state, id); },
  statProg(id) { return xpProgress(this.state.stats[id]?.xp || 0); },
  statLevel(id) { return levelFromXp(this.state.stats[id]?.xp || 0); },
  get totalLevel() { return this.combatLevel + Object.keys(this.SKILLS).reduce((s, id) => s + this.skillLevel(id), 0); },
  // ===== GIANG HỒ — Phong Vân Bảng (BXH bot) =====
  initWorld() { ensureWorld(this.state, now()); Storage.save(this.state); },
  get playerActivityText() { return this.state.activity ? (this.actName || 'đang hành tẩu') : 'nhàn rỗi chốn giang hồ'; },
  // Memo 200 hàng BOT ở module-level (đắt: 200×10 levelFromXp) theo (seed:createdAt:phút); hàng PLAYER tính TƯƠI mỗi render (rank/level không trễ).
  get leaderboard() {
    const w = this.state.world; if (!w) return [];
    const t = now(), key = w.seed + ':' + w.createdAt + ':' + Math.floor(t / 60000);
    if (_lbBotKey !== key || !_lbBots) {
      _lbBots = genRoster(w.seed, w.createdAt, now()).map((b) => {
        const d = botDominant(b, t);                                 // 1 lần -> danh hiệu + màu theo nghề thật
        return {
          id: b.id, name: b.name, title: botTitleFor(d.track, d.level), catHex: CAT_HEX[botCatFor(d.track)] || '#94a3b8',
          avatar: botAvatar(b), combatLv: botCombatLv(b, t), totalLv: botTotalLv(b, t), activity: botActivity(b, t), isPlayer: false,
        };
      });
      _lbBotKey = key;
    }
    const extra = [{
      id: 'me', name: (this.state.player.name || 'Vô Danh'), title: 'Bổn Nhân', catHex: '#14b8a6',
      avatar: (this.curAvatar || { id: this.avatarId, char: '道', color: 'from-slate-600 to-slate-700' }),
      combatLv: this.combatLevel, totalLv: this.totalLevel, activity: this.playerActivityText, isPlayer: true,
    }];
    // "Trò giỏi hơn thầy": Cao Đồ đã Xuất Sư (legends) vân du thiên hạ — xếp TRÊN nhân vật chính trên bảng
    const tmn = this.state.tongMon;
    if (tmn && Array.isArray(tmn.legends)) tmn.legends.forEach((lg, i) => {
      let jit = 0; const s = lg.name || ''; for (let c = 0; c < s.length; c++) jit = (jit * 31 + s.charCodeAt(c)) >>> 0;
      extra.push({
        id: 'leg' + i, name: lg.name, title: 'Cao Đồ · ' + (tmn.name || 'Tông Môn'), catHex: '#f5b942',
        avatar: { id: '__none__', char: lg.han || '徒', color: 'from-amber-700 to-amber-900' },
        combatLv: this.combatLevel, totalLv: this.totalLevel + 8 + i * 5 + (jit % 12), activity: 'vân du thiên hạ — rạng danh sư môn', isPlayer: false, isLegend: true,
      });
    });
    const rows = _lbBots.concat(this.nguoiThatRows, extra);
    rows.sort((a, b) => b.totalLv - a.totalLv || b.combatLv - a.combatLv || (a.id < b.id ? -1 : 1));
    // ⚠⚠ TRẢ VỀ HÀNG MỚI, đừng ghi `rank` đè lên chính đối tượng bot.
    //   `_lbBots` là mảng nhớ ở tầng module — nằm NGOÀI store nên Alpine không theo dõi. Sửa
    //   `r.rank` sau lần vẽ đầu thì màn KHÔNG vẽ lại: người thật đọc từ cloud về tới SAU, bot
    //   giữ nguyên số hạng cũ ⇒ hai người cùng đứng hạng 1. Dữ liệu đúng mà DOM sai.
    //   Hàng người thật không dính vì `nguoiThatRows` dựng đối tượng mới mỗi lần gọi.
    return rows.map((r, i) => ({ ...r, rank: i + 1 }));
  },
  get lbTotal() { return BOT_COUNT + this.nguoiThatRows.length + 1; },
  /** Bấm một hàng NGƯỜI THẬT trên bảng -> mở hồ sơ công khai của họ. Bot thì không có gì để mở. */
  lbBam(r) { if (r && r.laNguoiThat && r.uid) this.xemHoSoKhach(r.uid); },
  /** "Người mới nhập giang hồ sau ~2 giờ" — cho thấy giang hồ có vào có ra, không phải ảnh chụp đứng yên. */
  get lbNguoiMoiSau() {
    const w = this.state.world; if (!w) return '';
    return this.fmtTime(Math.max(0, Math.round(conBaoLauCoNguoiMoi(w.createdAt, now()) / 1000)));
  },
  get playerRow() { return this.leaderboard.find((r) => r.isPlayer) || null; },
  get lbTop() { return this.leaderboard.slice(0, 50); },
  get lbNeighbors() {                                                // người chơi ngoài top 50 -> lân cận hạng mình, KHÔNG chồng top 50
    const p = this.playerRow; if (!p || p.rank <= 50) return [];
    const lb = this.leaderboard, i = p.rank - 1;
    return lb.slice(Math.max(50, i - 3), Math.min(lb.length, i + 4));
  },
  get lbDisplay() { const top = this.lbTop, nb = this.lbNeighbors; return nb.length ? [...top, { separator: true, id: 'sep' }, ...nb] : top; },
  // ===== MỘNG CẢNH BẢNG (BXH Đăng Tiên Mộng) — điểm người chơi = deepest*10 + Σ Sát Cảnh*50; bot điểm DERIVED deterministic (không có run thật). 0 power. =====
  get mongCanhBang() {
    const w = this.state.world; if (!w) return [];
    const h = (s) => { let x = 2166136261 >>> 0; s = '' + s; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x >>> 0; };
    const bots = genRoster(w.seed, w.createdAt, now()).map((b) => {
      const depth = 1 + Math.floor(Math.pow((h(b.id + ':dtmdeep') % 1000) / 1000, 1.7) * 7);   // 1..8, lệch về thấp
      const scm = Math.floor(Math.pow((h(b.id + ':dtmsc') % 1000) / 1000, 2.1) * 16);           // 0..15, lệch về thấp
      return { id: b.id, name: b.name, avatar: botAvatar(b), deepest: depth, score: depth * 10 + scm * 50, sub: 'Mộng sâu Tầng ' + depth, isPlayer: false };
    });
    const d = this.state.dangTien || {};
    const scSum = Object.values(d.scMaxByHero || {}).reduce((s, v) => s + (v || 0), 0);
    const me = { id: 'me', name: (this.state.player.name || 'Vô Danh'), avatar: (this.curAvatar || { id: this.avatarId, char: '道', color: 'from-slate-600 to-slate-700' }), deepest: (d.deepest || 0), score: (d.deepest || 0) * 10 + scSum * 50, sub: (d.deepest ? ('Mộng sâu Tầng ' + d.deepest) : 'Chưa nhập mộng'), isPlayer: true };
    const rows = bots.concat([me]);
    rows.sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1));
    rows.forEach((r, i) => { r.rank = i + 1; });
    return rows;
  },
  get mcbDisplay() {
    const all = this.mongCanhBang, top = all.slice(0, 50), p = all.find((r) => r.isPlayer);
    if (!p || p.rank <= 50) return top;
    return [...top, { separator: true, id: 'sep' }, ...all.slice(Math.max(50, p.rank - 4), p.rank + 3)];
  },
  // Trận Đồ Bảng (Kỳ Trận): bot deterministic từ roster chung, giống khuôn Mộng Cảnh Bảng — 0 power, đua danh dự
  get kyTranBang() {
    const w = this.state.world; if (!w) return [];
    const h = (s) => { let x = 2166136261 >>> 0; s = '' + s; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x >>> 0; };
    const bots = genRoster(w.seed, w.createdAt, now()).map((b) => {
      const wins = Math.floor(Math.pow((h(b.id + ':ktwin') % 1000) / 1000, 1.8) * 55);   // 0..54 trận đã phá, lệch về thấp
      const cap = Math.floor(Math.pow((h(b.id + ':ktcap') % 1000) / 1000, 2.0) * 29);    // Trận Cấp 0..28, lệch về thấp
      const ma = wins >= 50 && (h(b.id + ':ktma') % 100) < 30 ? 1 : 0;
      return { id: b.id, name: b.name, avatar: botAvatar(b), score: wins * 10 + cap * 15 + ma * 200, sub: ma ? 'Đã diệt Ma Đế' : ('Phá ' + wins + ' trận'), isPlayer: false };
    });
    const k = this.state.kyTran || {};
    const capMe = Object.values(k.nguHanh || {}).reduce((s, v) => s + (v || 0), 0);
    const me = { id: 'me', name: (this.state.player.name || 'Vô Danh'), avatar: (this.curAvatar || { id: this.avatarId, char: '道', color: 'from-slate-600 to-slate-700' }), score: (k.wins || 0) * 10 + capMe * 15 + (k.maDeKills || 0) * 200, sub: (k.maDeKills ? 'Đã diệt Ma Đế' : (k.wins ? ('Phá ' + k.wins + ' trận') : 'Chưa bày trận')), isPlayer: true };
    const rows = bots.concat([me]);
    rows.sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1));
    rows.forEach((r, i) => { r.rank = i + 1; });
    return rows;
  },
  get ktBangDisplay() {
    const all = this.kyTranBang, top = all.slice(0, 50), p = all.find((r) => r.isPlayer);
    if (!p || p.rank <= 50) return top;
    return [...top, { separator: true, id: 'sep' }, ...all.slice(Math.max(50, p.rank - 4), p.rank + 3)];
  },
  // Đồng Đạo Lân Cận: bot chuyên nghề `skillId` (track đỉnh == skillId). Memo theo (skill:phút).
  nearbyBotsList(skillId) {
    const w = this.state.world; if (!w || !skillId) return { bots: [], count: 0 };
    const t = now(), key = skillId + ':' + Math.floor(t / 60000);
    if (_nbKey === key && _nbData) return _nbData;
    const matched = nearbyBotsBy(genRoster(w.seed, w.createdAt, now()), skillId, t);
    _nbData = { bots: matched.slice(0, 5).map((b) => botAvatar(b)), count: matched.length };
    _nbKey = key;
    return _nbData;
  },
  // ===== GIANG HỒ — Feed tin bot (DERIVED thuần, KHÔNG lưu; memo theo slot trong engine). void _tick -> mốc giờ + tin mới tự cập nhật. =====
  get jiangHuFeed() { void this._tick; const w = this.state.world; if (!w) return []; return genJiangHuFeed(w.seed, w.createdAt, now()); },
  get jiangHuTicker() { return this.jiangHuFeed.slice(0, 12); },
  // ===== TÔNG MÔN BẢNG (xếp Uy Danh tông mình vs tông bot deterministic) =====
  pvbTab: 'caothu',
  // ===== DANH SĨ GIANG HỒ (20 deep AI, lazy-sim) =====
  dsSel: null,
  get danhSiBang() { void this._tick; return danhSiList(now()); },
  openDanhSi(id) { this.dsSel = id; const s = this._ensureDanhSiState(); if (id && !s.seen.includes(id)) { s.seen.push(id); this.tmSave(); } },   // đánh dấu đã khám phá (Danh Sĩ Lục)
  closeDanhSi() { this.dsSel = null; },
  // DANH SĨ LỤC: codex sưu tập 20 danh sĩ (đã khám phá / chưa), trạng thái truyền nhân.
  // KỲ NGỘ / BÁI SƯ / TRUY NÃ: lời mời player-facing của danh sĩ đang xem (nhận 1 lần, persist state.danhSi.accepted).
  _ensureDanhSiState() { if (!this.state.danhSi || typeof this.state.danhSi !== 'object') this.state.danhSi = { accepted: [], seen: [] }; if (!Array.isArray(this.state.danhSi.accepted)) this.state.danhSi.accepted = []; if (!Array.isArray(this.state.danhSi.seen)) this.state.danhSi.seen = []; return this.state.danhSi; },
  get dsOffer() {
    void this._tick;
    if (!this.dsSel || !this.tm) return null;
    const o = offerOf(this.dsSel, now(), uyDanhOf(this.tm)); if (!o) return null;
    o.accepted = ((this.state.danhSi && this.state.danhSi.accepted) || []).includes(o.offerId);
    return o;
  },
  dsAcceptOffer() {
    const o = this.dsOffer; if (!o) return;
    if (o.accepted) { this.showToast('Đã nhận lời mời này rồi.'); return; }
    if (!o.met) { this.showToast('Chưa đủ ' + o.need.label + '.'); return; }
    const t = this.tm, r = o.reward;
    const _grantBiKip = () => { if (r.biKip) { if (!t.biKipBag) t.biKipBag = {}; t.biKipBag[r.biKip] = (t.biKipBag[r.biKip] || 0) + 1; } };   // truyền dạy -> Tàng Thư Lâu (side-only)
    if (r.type === 'disciple') {
      if (t.disciples.length >= slotCount(t)) { this.showToast('Hết slot đệ tử — nâng Tụ Hiền Đường.'); return; }
      const apt = o.rankPower >= 820 ? 'tuyet' : (o.rankPower >= 700 ? 'thuong' : 'trung');
      const d = genDisciple({ name: o.danhSiTen, he: o.he, apt, sex: o.sex }); d.recruitedAt = now(); t.disciples.push(d);
      _grantBiKip();
      t.soSach.unshift({ t: now(), text: `★ Danh sĩ ${o.danhSiTen} ngưỡng mộ tông phong, đầu nhập tông môn làm đệ tử${o.bkInfo ? `, truyền lại 「${o.bkInfo.ten}」` : ''}!` });
      this.showToast('★ ' + o.danhSiTen + ' đầu nhập tông môn!' + (o.bkInfo ? ' (+bí kíp)' : ''));
    } else if (r.type === 'uy') {
      t.uyBonus = (t.uyBonus || 0) + (r.uy || 0); t.diem = (t.diem || 0) + (r.diem || 0);
      t.soSach.unshift({ t: now(), text: `Tông môn nhận Truy Nã Lệnh, trừ gian ${o.danhSiTen} — uy danh chấn động.` });
      this.showToast('Truy Nã · +' + r.uy + ' Uy Danh, +' + r.diem + ' Điểm');
    } else {
      t.diem = (t.diem || 0) + (r.diem || 0); t.congHien = (t.congHien || 0) + (r.congHien || 0);
      if (r.mat) { if (!t.mats) t.mats = {}; t.mats[r.mat.id] = (t.mats[r.mat.id] || 0) + r.mat.n; }
      _grantBiKip();
      t.soSach.unshift({ t: now(), text: `Kỳ ngộ với danh sĩ ${o.danhSiTen} — tông môn nhận tâm đắc võ học${o.bkInfo ? ` 「${o.bkInfo.ten}」` : ''} cùng lễ vật giang hồ.` });
      this.showToast('Kỳ Ngộ · nhận tâm đắc' + (o.bkInfo ? ' 「' + o.bkInfo.ten + '」' : '') + ' + lễ vật');
    }
    if (t.soSach.length > 80) t.soSach.length = 80;
    this._ensureDanhSiState().accepted.push(o.offerId);
    this.tmSave(); this._tick++;
  },
  get dsProfile() { void this._tick; return this.dsSel ? danhSiProfile(this.dsSel, now()) : null; },
  daoInfo(dao) { return ({ chinh: ['Chính Đạo', '#14b8a6'], ta: ['Tà Đạo', '#e879f9'], trung: ['Trung Dung', '#94a3b8'] })[dao] || ['Trung Dung', '#94a3b8']; },
  get tongMonBang() {
    const w = this.state.world; if (!w || !this.tm) return [];
    const t = now(), key = w.seed + ':' + w.createdAt + ':' + Math.floor(t / 60000);
    if (_tmbKey !== key || !_tmbBots) {
      _tmbBots = genRoster(w.seed, w.createdAt, now()).slice(0, 90).map((b, i) => {
        const tl = botTotalLv(b, t);
        return { id: 'sect' + i, name: TMB_PREFIX[b.titleSeed % TMB_PREFIX.length] + ' ' + TMB_SUFFIX[b.actSeed % TMB_SUFFIX.length], dao: ['chinh', 'ta', 'trung'][b.titleSeed % 3], master: b.name, avatar: botAvatar(b), uy: Math.round(85 * Math.pow(tl / 100, 3.8) * (0.90 + (b.actSeed % 21) * 0.01)), isPlayer: false };
      });
      _tmbKey = key;
    }
    const tm = this.tm;
    const rows = _tmbBots.concat([{ id: 'mysect', name: (tm.name || 'Tông Môn'), dao: tm.dao, master: (this.state.player.name || 'Vô Danh'), avatar: (this.curAvatar || { id: this.avatarId, char: '道', color: 'from-slate-600 to-slate-700' }), uy: uyDanhOf(tm) + this.lvhTitleUyBonus, isPlayer: true }]);
    rows.sort((a, b) => b.uy - a.uy || (a.id < b.id ? -1 : 1));
    // ⚠ `_tmbBots` là mảng nhớ ở tầng module — cùng bẫy với `leaderboard`: ghi `rank` đè lên
    //   chính nó thì màn giữ số hạng cũ khi người chơi lên cấp. Trả về hàng MỚI.
    return rows.map((r, i) => ({ ...r, rank: i + 1 }));
  },
  get tongMonRow() { return this.tongMonBang.find((r) => r.isPlayer) || null; },
  get tmbDisplay() { const lb = this.tongMonBang, p = this.tongMonRow; const top = lb.slice(0, 50); if (!p || p.rank <= 50) return top; const i = p.rank - 1; return [...top, { separator: true, id: 'tsep' }, ...lb.slice(Math.max(50, i - 3), Math.min(lb.length, i + 4))]; },

  actionInputs(action) { return inputStatus(this.state, action); },
  canStart(skillId, action) { return canStartAction(this.state, skillId, action); },
  // ================= ĐỐN NGỘ CẢNH =================
  // Popup mở từ ô "Tiến Độ Tu Luyện" của trang nghề, chỉ hiện khi nghề đã chạm Lv100
  // hoặc đã Trùng Sinh ít nhất một lần.
  ncMo: false,
  ncSkill: '',
  ncLoi: '',
  openNgoCanh(skillId) { this.ncSkill = skillId || this.selectedSkill; this.ncLoi = ''; this.ncMo = true; },
  closeNgoCanh() { this.ncMo = false; this.ncLoi = ''; },
  get ncTenNghe() { return (this.SKILLS[this.ncSkill] || {}).name || this.ncSkill; },
  get ncTs() { void this._tick; return soTrungSinh(this.state, this.ncSkill); },
  get ncTsMax() { return TRUNG_SINH_MAX; },
  get ncDiem() { void this._tick; return diemConLai(this.state, this.ncSkill); },
  get ncDiemTong() { return TRUNG_SINH_MAX * DIEM_MOI_LAN; },
  get ncMuaHet() { return DIEM_MUA_HET; },
  get ncCoTheTS() { void this._tick; return coTheTrungSinh(this.state, this.ncSkill); },
  get ncHetLuot() { return this.ncTs >= TRUNG_SINH_MAX; },
  /** Ô "Đốn Ngộ Cảnh" chỉ hiện khi có việc để làm — chưa tới Lv100 mà chưa từng Trùng Sinh thì ẩn. */
  ncHienO(skillId) { void this._tick; return this.skillLevel(skillId) >= 100 || soTrungSinh(this.state, skillId) > 0; },
  /** Còn thiếu bao nhiêu cấp nữa mới Trùng Sinh tiếp được. 0 nghĩa là đã chạm trần. */
  ncConThieu(skillId) { void this._tick; return Math.max(0, tranCap(this.state, skillId) - this.skillLevel(skillId)); },
  /** Số lần Trùng Sinh của MỘT nghề bất kỳ (nút ngoài trang nghề đọc cái này, không phải `ncTs`). */
  ncTsCua(skillId) { void this._tick; return soTrungSinh(this.state, skillId); },
  /**
   * Bậc Chuyển: 1..6 -> 一二三四五六 và "Nhất Chuyển".."Lục Chuyển".
   * ⚠ 六 phải có trong chuỗi `&text=` của Noto Serif SC ở <head>. Năm chữ kia đã sẵn.
   */
  ncHan(skillId) { return ['', '一', '二', '三', '四', '五', '六'][this.ncTsCua(skillId)] || ''; },
  ncTenChuyen(skillId) {
    return ['', 'Nhất Chuyển', 'Nhị Chuyển', 'Tam Chuyển', 'Tứ Chuyển', 'Ngũ Chuyển', 'Lục Chuyển'][this.ncTsCua(skillId)] || '';
  },
  /** Kiểu huy hiệu người chơi chọn ở Cài Đặt. */
  get ncHuyHieuClass() { return this.caiDat.huyHieuChuyen === 'kimVong' ? 'kim-vong' : 'an-son'; },
  /** Ba nhánh, mỗi nhánh các nút kèm bậc hiện tại và lý do khoá. */
  get ncNhanhs() {
    void this._tick;
    const sk = this.ncSkill, diem = this.ncDiem;
    return Object.keys(NC_NHANH).map((k) => ({
      key: k, ...NC_NHANH[k],
      nut: NGO_CANH_NUT.filter((n) => n.nhanh === k).map((n) => {
        const bac = bacNut(this.state, sk, n.id);
        const can = n.canNut ? NGO_CANH_BY_ID[n.canNut] : null;
        const khoa = can && bacNut(this.state, sk, n.canNut) < can.max ? ('Cần ' + can.ten + ' đủ ' + can.max + ' bậc') : '';
        return { id: n.id, ten: n.ten, gia: n.gia, max: n.max, bac, khoa, art: n.art,
          eff: nutEffText(n, bac || 1),
          muaDuoc: !khoa && bac < n.max && diem >= n.gia };
      }),
    }));
  },
  ncMua(nutId) {
    const loi = muaNut(this.state, this.ncSkill, nutId);
    if (loi) { this.ncLoi = loi; return; }
    this.ncLoi = ''; this._tick++; Storage.save(this.state);
  },
  ncTrungSinh() {
    this.hoiXacNhan({
      tieuDe: 'Trùng Sinh ' + this.ncTenNghe,
      loi: this.ncTenNghe + ' về cấp 1. Bạn nhận ' + DIEM_MOI_LAN + ' Điểm Trùng Sinh.',
      nut: 'Trùng Sinh',
      xong: () => {
        if (!trungSinh(this.state, this.ncSkill)) return;
        this._tick++; Storage.save(this.state);
        this.showToast(this.ncTenNghe + ' đã Trùng Sinh lần ' + soTrungSinh(this.state, this.ncSkill) + '.');
      },
    });
  },
  ncTay() {
    this.hoiXacNhan({
      tieuDe: 'Tẩy bảng ' + this.ncTenNghe,
      loi: 'Trả lại toàn bộ điểm đã bỏ vào bảng. Số lần Trùng Sinh giữ nguyên.',
      nut: 'Tẩy bảng',
      xong: () => { tayBang(this.state, this.ncSkill); this.ncLoi = ''; this._tick++; Storage.save(this.state); },
    });
  },

  startLabel(skillId, action) {
    const req = reqLvThat(this.state, skillId, action);   // đã trừ Cựu Nghiệp
    if (this.skillLevel(skillId) < req) return 'Cần Lv ' + req;
    if (this.actionInputs(action).some((i) => !i.ok)) return 'Thiếu nguyên liệu';
    return 'Bắt Đầu';
  },

  // ---------- Metrics / NEARBY / Modal ----------
  skillTotalXp(id) { return this.state.skills[id]?.xp || 0; },
  skillGathered(id) { return this.state.skills[id]?.gathered || 0; },
  skillTimeLabel(id) { return this.fmtTime((this.state.skills[id]?.timeMs || 0) / 1000); },

  actionModal: null,
  openAction(skillId, actionId) { this.actionModal = { skillId, actionId }; this.mLuot = 0; },
  closeAction() { this.actionModal = null; },

  // ---------- SỐ LƯỢT: làm đúng ngần ấy lượt rồi tự dừng ----------
  // Ô để TRỐNG (0) = chạy tới khi hết nguyên liệu / chạm trần nhàn rỗi, đúng nếp cũ. Gõ số vào
  // thì làm đủ ngần ấy rồi dừng. Cùng khuôn ô số lượng với Thương Điếm và popup bán: cho gõ tự
  // do, XOÁ TRẮNG được, chỉ chặn trần — kẹp về 1 mỗi lần gõ thì không nhập nổi số nhiều chữ số.
  mLuot: 0,
  /** Làm được nhiều nhất bao nhiêu lượt: theo nguyên liệu đang có (và lượt Đồ Phổ). 0 = không có trần. */
  get mLuotMax() {
    const a = this.modalAction; if (!a) return 0;
    let max = Infinity;
    for (const inp of this.actionInputs(a)) max = Math.min(max, Math.floor(inp.have / inp.need));
    if (a.needsDoPho) max = Math.min(max, ((this.state.player && this.state.player.doPho) || {})[a.itemId] || 0);
    return max === Infinity ? 0 : Math.max(0, max);
  },
  mLuotNhap(v) {
    const s = String(v == null ? '' : v).replace(/[^\d]/g, '');
    if (!s) { this.mLuot = 0; return; }
    const tran = this.mLuotMax || 99999;
    this.mLuot = Math.min(parseInt(s, 10), tran);
  },
  mLuotDat(n) { const tran = this.mLuotMax || 99999; this.mLuot = Math.max(0, Math.min(Math.floor(n) || 0, tran)); },
  mLuotThem(d) { this.mLuotDat(this.mLuot + d); },
  /** Chữ trên nút: có đặt số thì in luôn số lượt, khỏi phải liếc ngược lên ô nhập. */
  get mBatDauLabel() {
    const m = this.actionModal; if (!m) return 'Bắt Đầu';
    const goc = this.startLabel(m.skillId, this.modalAction);
    if (goc !== 'Bắt Đầu' || !(this.mLuot > 0)) return goc;
    return 'Bắt Đầu ' + this.fmt(this.mLuot) + ' lượt';
  },
  get modalSkill() { return this.actionModal ? this.SKILLS[this.actionModal.skillId] : null; },
  get modalAction() { return this.actionModal ? getAction(this.actionModal.skillId, this.actionModal.actionId) : null; },
  // EXP chỉ số phụ (Tứ Trụ) nhận MỖI LẦN làm hành động — vd Đào Khoáng = Lực Đạo (Sức Mạnh) + Hộ Thể.
  get modalStatGains() {
    const sk = this.modalSkill, a = this.modalAction;
    if (!sk || !a || !a.statXp) return [];
    const out = [];
    if (sk.stat && STATS[sk.stat]) out.push({ name: STATS[sk.stat].name, gloss: STATS[sk.stat].gloss, xp: a.statXp });
    if (sk.stat2 && STATS[sk.stat2]) out.push({ name: STATS[sk.stat2].name, gloss: STATS[sk.stat2].gloss, xp: a.statXp });
    return out;
  },
  startFromModal() {
    if (!this.actionModal) return;
    this.start(this.actionModal.skillId, this.actionModal.actionId, this.mLuot);
    this.closeAction();
  },

  // ---------- Linh Thạch (buff per-skill) ----------
  linhThachOwned(itemId) { return this.state.inventory[itemId] || 0; },
  // Linh Thạch nay DÙNG CHUNG mọi nghề (không còn skillId) -> ô Linh Thạch hiện ở mọi nghề gather/craft.
  // ⛔ Kĩ năng SỰ KIỆN không lắp Linh Thạch — ô Bội/Ấn đã làm đúng việc đó, chồng tầng ba là nhân dồn hệ số.
  hasLinhThachFamily(skillId) { const s = this.SKILLS[skillId]; if (s && s.suKien) return false; return linhThachForSkill(skillId).length > 0; },
  // Các Linh Thạch hợp với skill (cho picker), kèm số viên đang có; có hàng lên đầu.
  skillLinhThachOptions(skillId) {
    const s = this.SKILLS[skillId]; if (s && s.suKien) return [];
    return linhThachForSkill(skillId)
      .map((d) => ({ ...d, owned: this.state.inventory[d.itemId] || 0 }))
      .sort((a, b) => b.owned - a.owned);
  },
  // Linh Thạch đang lắp cho skill: { itemId, skillId, expPct, effPct } hoặc null.
  currentLinhThach(skillId) {
    const itemId = this.state.linhThach && this.state.linhThach[skillId];
    if (!itemId) return null;
    const def = this.LINH_THACH[itemId];
    return def ? { itemId, ...def } : null;
  },
  // ⚠ THIẾU `yieldPct` là cả ba viên Bội Sản Thạch ra chuỗi RỖNG — người chơi mở ra chỉ thấy
  // tên, không biết viên đó làm gì. Mỗi khi thêm dòng mới vào LINH_THACH phải thêm ở đây.
  linhThachEffectText(def) {
    if (!def) return '';
    const p = [];
    if (def.expPct) p.push('+' + def.expPct + '% EXP Nghề');
    if (def.effPct) p.push('+' + def.effPct + '% Hiệu Suất');
    if (def.yieldPct) p.push(def.yieldPct + '% Nhân Đôi Sản Vật');
    return p.join(' · ');
  },
  // ---------- Theo dõi Linh Thạch: viên đang đốt còn bao lâu · cả kho đủ dùng bao lâu ----------
  // Một viên phủ LT_COVER_MS thời gian HOẠT ĐỘNG (không phải thời gian thực): tắt máy thì đá đứng yên.
  LT_COVER_MS,
  get ltCoverText() { return fmtDurHM(LT_COVER_MS / 1000); },
  ltTheoDoi(skillId) {
    void this._tick;                                     // đếm ngược theo từng giây
    const cur = this.currentLinhThach(skillId); if (!cur) return null;
    const kho = this.state.inventory[cur.itemId] || 0;
    const a = this.state.activity;
    const dangDot = !!(a && a.type === 'skill' && a.skillId === skillId && a.buff && a.buff.itemId === cur.itemId);
    const conMs = dangDot ? Math.max(0, a.buffMsLeft || 0) : 0;
    return { itemId: cur.itemId, kho, dangDot, conMs, tongMs: conMs + kho * LT_COVER_MS };
  },
  get mLtTheoDoi() { return this.mSkillId ? this.ltTheoDoi(this.mSkillId) : null; },
  /** HAI dòng theo dõi, mỗi dòng một vai trò cố định — nhồi chung một dòng thì lúc số dài
   *  lúc số ngắn, khung co giãn theo từng giây. Dòng dưới rỗng lúc chưa chạy nhưng vẫn giữ chỗ. */
  ltKhoText(t) {
    if (!t) return '';
    if (!t.kho) return t.dangDot ? 'Viên cuối cùng — hết là tắt' : 'Đã hết — sẽ không kích hoạt';
    return 'Còn ' + this.fmt(t.kho) + ' viên · đủ dùng ' + fmtDurHM(t.tongMs / 1000);
  },
  ltVienText(t) { return (t && t.dangDot) ? ('Viên đang dùng còn ' + fmtDurHMS(t.conMs / 1000)) : ''; },
  assignLinhThach(skillId, itemId) {
    if (!this.state.linhThach) this.state.linhThach = {};
    this.state.linhThach[skillId] = itemId;
    Storage.save(this.state);
  },
  clearLinhThach(skillId) {
    if (this.state.linhThach) delete this.state.linhThach[skillId];
    Storage.save(this.state);
  },
  // Tiện cho modal (luôn quy về skill của modal đang mở)
  get mSkillId() { return this.actionModal ? this.actionModal.skillId : null; },
  get mHasLTFamily() { return this.mSkillId ? this.hasLinhThachFamily(this.mSkillId) : false; },
  get mLinhThach() { return this.mSkillId ? this.currentLinhThach(this.mSkillId) : null; },
  // CHỈ hiện viên ĐANG CÓ. Liệt kê cả viên chưa có thì bảng chọn dài ra vô ích, mà càng về
  // cuối game càng nhiều loại ⇒ tràn khỏi khung. Chưa có viên nào thì bảng tự báo dòng rỗng.
  get mLTOptions() { return this.mSkillId ? this.skillLinhThachOptions(this.mSkillId).filter((o) => o.owned > 0) : []; },
  // Buff của hoạt động đang chạy (badge ở thẻ hoạt động)
  get actBuff() { return (this.act && this.act.buff) ? this.act.buff : null; },
  get actBuffText() { return this.actBuff ? this.linhThachEffectText(this.actBuff) : ''; },
  // ⚠ Đếm ngược dùng `fmtClock` (00:19:41) chứ KHÔNG phải `fmtTime` ("19m41s"): khổ chữ cố định
  // nên con số không co giãn từng giây, chỗ đặt đứng yên.
  /** Đếm ngược viên đá đang đốt, hiện ở thẻ hoạt động (cột Hồ Sơ). */
  get actBuffLeftText() { void this._tick; const a = this.act; return (a && a.buff) ? fmtClock(Math.max(0, a.buffMsLeft || 0) / 1000) : ''; },
  /** Chip ở thẻ "Đang Luyện" của màn kỹ năng: tên viên đang dùng + đếm ngược, hoặc báo đã hết.
   *  Không lắp đá thì trả null — không bày chip rỗng. */
  get actLtChip() {
    void this._tick;
    const a = this.act;
    if (!a || a.type !== 'skill') return null;
    const id = (a.buff && a.buff.itemId) || a.ltId;
    if (!id) return null;
    return {
      itemId: id,
      ten: (this.ITEMS[id] || {}).name || 'Linh Thạch',
      con: a.buff ? fmtClock(Math.max(0, a.buffMsLeft || 0) / 1000) : '',
      het: !a.buff,
    };
  },

  // ---------- Hoạt động (skill + combat) ----------
  get hasActivity() { return !!this.state.activity; },
  get act() { return this.state.activity; },
  get actIsCombat() { return !!(this.act && this.act.type === 'combat'); },
  get actIsTravel() { return !!(this.act && this.act.type === 'travel'); },
  get actIsDungeon() { return !!(this.act && this.act.type === 'dungeon'); },
  get actDungeon() { return this.actIsDungeon ? this.DUNGEON_BY_ID[this.act.dungeonId] : null; },
  get actEnemy() { return this.actIsCombat ? this.ENEMIES[this.act.enemyId] : null; },
  get actSkill() { return (this.act && !this.actIsCombat) ? this.SKILLS[this.act.skillId] : null; },
  get actAction() { return (this.act && !this.actIsCombat) ? getAction(this.act.skillId, this.act.actionId) : null; },
  get actItem() { return (this.actAction && this.actAction.itemId) ? this.ITEMS[this.actAction.itemId] : null; },
  get actName() { return this.actIsDungeon ? (this.actDungeon ? this.actDungeon.name : 'Bí Cảnh') : (this.actIsTravel ? 'Khinh Công' : (this.actIsCombat ? (this.actEnemy ? this.actEnemy.name : '') : (this.actAction ? this.actAction.name : ''))); },
  get actSub() { return this.actIsDungeon ? ('Bí Cảnh · Lịch Luyện' + (this.dungeonRunsTotal > 1 ? ' ' + this.dungeonRunsDone + '/' + this.dungeonRunsTotal : '')) : (this.actIsTravel ? ('→ ' + (this.travelToObj ? this.travelToObj.name : '')) : (this.actIsCombat ? 'Chiến Đấu' : (this.actSkill ? this.actSkill.name : ''))); },
  get actIcon() { return this.actIsDungeon ? (this.actDungeon ? this.actDungeon.seal : '🏛️') : (this.actIsTravel ? '🏃' : (this.actIsCombat ? (this.actEnemy ? this.actEnemy.icon : '⚔️') : (this.actItem ? this.actItem.icon : (this.actSkill ? this.actSkill.icon : '⏳')))); },
  get actIconId() { return this.actIsDungeon ? (this.act ? this.act.dungeonId : '') : (this.actIsTravel ? '' : (this.actIsCombat ? (this.act ? this.act.enemyId : '') : (this.actItem ? this.actItem.id : (this.actSkill ? this.actSkill.id : '')))); },
  // Icon widget hoạt động: Khinh Công (travel) dùng icon gió SVG (bỏ emoji 🏃 rác); còn lại giữ ico() ảnh/emoji.
  get actIconHtml() { return this.actIsTravel ? this.svg('wind', 'w-full h-full text-jade p-0.5') : this.ico(this.actIconId, this.actIcon); },
  get actCycleSec() {
    if (this.act && this.act.cycleMs) return this.act.cycleMs / 1000; // dùng cycle thực tế (đã tính buff Hiệu Suất)
    return this.actIsCombat ? (this.actEnemy ? this.actEnemy.time : 1) : (this.actAction ? this.actAction.time : 1);
  },
  get actProgressPct() { return this.act ? this.act.progress * 100 : 0; },
  get actNextInSec() { if (!this.act) return 0; return Math.ceil((1 - this.act.progress) * this.actCycleSec); },
  get actExpPerSec() {
    // Dùng cycleMs THỰC của hoạt động (combat = timePerKill, skill = đã trừ buff Nghề/Hiệu Suất)
    // → đồng bộ với rate thật mà advance() trao thưởng + harvest estimate ở tab Chiến Đấu.
    const cycleSec = (this.act && this.act.cycleMs) ? this.act.cycleMs / 1000 : 0;
    if (this.actIsCombat) {
      if (!this.actEnemy) return '0';
      const mult = skillExpMultiplier(this.state, 'chienDau') * combatExpMult(this.state);
      const expPerKill = Math.max(1, Math.round(this.actEnemy.exp * mult));
      return (cycleSec > 0 ? expPerKill / cycleSec : this.actEnemy.exp / this.actEnemy.time).toFixed(2);
    }
    if (!this.actAction) return '0';
    return (cycleSec > 0 ? this.actAction.xp / cycleSec : this.actAction.xp / this.actAction.time).toFixed(2);
  },
  get actIdleCap() { return idleCapMs(this.state) / 1000; },
  get actRemaining() { void this._tick; return this.act ? Math.max(0, this.actIdleCap - (now() - this.act.startedAt) / 1000) : 0; },
  get actCapped() { return this.act ? this.act.capped : false; },
  get actStalled() { return this.act ? this.act.stalled : false; },
  get statusText() {
    if (!this.hasActivity) return 'Nhàn rỗi';
    if (this.actIsCombat) return 'Đang chiến đấu' + (this.actEnemy ? ' · ' + this.actEnemy.name : '');
    if (this.actIsTravel) return 'Đang khinh công' + (this.travelToObj ? ' → ' + this.travelToObj.name : '');
    if (this.actIsDungeon) return 'Đang khám phá' + (this.actDungeon ? ' · ' + this.actDungeon.name : '');
    // Hành nghề (thu thập/chế tác): dùng tên Nghề (động từ, vd "Đào Khoáng") + tên cụ thể ("Hắc Thán")
    const nghe = this.actSkill ? this.actSkill.name : '';
    const act = this.actAction ? this.actAction.name : '';
    if (nghe && act && nghe !== act) return 'Đang ' + nghe + ' · ' + act;
    return 'Đang ' + (nghe || act || 'hành tẩu');
  },

  start(skillId, actionId, soLuot) {
    const prev = this.buildCombatSummary('manual');   // đang đánh dở -> chốt phiên combat cũ vào chuông (không mất dấu)
    if (startActivity(this.state, skillId, actionId, now(), soLuot)) { if (prev) this.pushCombatSummaryNotif(prev); Storage.save(this.state); }
  },
  stop() {
    const a = this.state.activity;
    if (a && a.type === 'dungeon') {                       // LỊCH LUYỆN: dừng sớm -> chốt tổng kết các lượt ĐÃ XONG (loot đã dồn kho)
      advance(this.state, now());                          // grant nốt lượt vừa hoàn tất tính tới giờ
      const a2 = this.state.activity;
      if (a2 && a2.type === 'dungeon') {                    // vẫn còn lịch (chưa xong hết) -> chốt phần dở
        if (a2.acc && a2.acc.runs > 0) finalizeDungeonBatch(this.state, a2.dungeonId, a2.acc, now());
        stopActivity(this.state);
      }
      this.bagPeek = false; this._tick++; Storage.save(this.state);
      return;
    }
    const sum = this.buildCombatSummary('manual');   // combat: chốt thu hoạch phiên trước khi dừng (null nếu hoạt động khác)
    stopActivity(this.state);
    this.bagPeek = false;   // đóng Túi Tạm (phiên đã kết thúc)
    if (sum) { this.pushCombatSummaryNotif(sum); if (sum.kills > 0 || sum.lose > 0) this.combatSummary = sum; }
    Storage.save(this.state);
  },
  refreshActivity() {
    if (!this.act) return;
    const a = this.act;
    const carrySess = a.type === 'combat' ? a.sess : null, carryCount = a.sessionCount || 0;   // refresh chỉ reset đồng hồ treo — GIỮ thu hoạch phiên
    stopActivity(this.state);
    if (a.type === 'combat') { startCombat(this.state, a.enemyId, now()); const na = this.state.activity; if (na && carrySess) { na.sess = carrySess; na.sessionCount = carryCount; } }
    else startActivity(this.state, a.skillId, a.actionId, now());
    Storage.save(this.state);
  },

  // ---------- Combat ----------
  get combatLevel() { return levelFromXp(this.state.skills['chienDau']?.xp || 0); },
  get combatProg() { return xpProgress(this.state.skills['chienDau']?.xp || 0); },
  get combatGathered() { return this.state.skills['chienDau']?.gathered || 0; },
  get combatTimeLabel() { return this.fmtTime((this.state.skills['chienDau']?.timeMs || 0) / 1000); },
  get stats() { return derivedStats(this.state); },
  get chienLuc() { return this.stats.chienLuc; },
  // Giá trị 1 dòng Chỉ Số Phụ: key -> điểm tổng (derivedStats); ckey -> giá trị combat thật (deriveCombat) theo đơn vị.
  secondaryStatVal(st) {
    if (st.key) return this.fmt(this.stats[st.key] || 0);
    if (st.ckey) { const v = (this.combatStats || {})[st.ckey] || 0; if (st.kind === 'pct') return (+(v * 100).toFixed(1)) + '%'; if (st.kind === 'mul') return Math.round(v * 100) + '%'; return this.fmt(Math.round(v)); }
    return '—';
  },

  // ---------- Yêu Vương (World Boss) — VÂY SÁT THEO LƯỢT ----------
  bossSel: null,                                      // boss đang chọn ở rail (master-detail)
  _tick: 0,                                           // nhịp 1s (reactive) → đồng hồ đếm ngược tự cập nhật
  bossFight: null,                                    // trận LIVE: { id, he, frames, total, idx, pMax,bMax,pHp,bHp, log:[], turn, done, win, reward }
  _bossFrameAt: 0,                                    // mốc lộ frame gần nhất
  _bossAwayChecked: false,                            // đã resolve hàng đợi lúc load chưa
  // Boss SỰ KIỆN chỉ hiện khi sự kiện của nó đang mở — đóng cửa là rail sạch như cũ.
  // ⚠ Yêu Vương sự kiện được `data/sukien.js` PUSH VÀO CUỐI bảng gốc, nên không sắp lại thì
  //   con Lv10 và Lv60 của sự kiện dính đuôi SAU con Lv100 — rail đang xếp theo cấp bỗng gãy.
  //   Sắp ở TẦNG HIỂN THỊ thôi: bảng gốc giữ nguyên thứ tự (bộ sinh số + hạt giống neo vào nó).
  //   `sort` của JS ổn định ⇒ trùng cấp thì con GỐC vẫn đứng trước con sự kiện.
  get yeuVuongList() {
    void this._tick;
    return YEU_VUONG.filter((b) => !b.suKien || this.svMoCua(b.suKien)).sort((a, b) => a.reqLevel - b.reqLevel);
  },
  get bossSelObj() { return YEU_VUONG_BY_ID[this.bossSel] || YEU_VUONG[0]; }, // THUẦN (không ghi state khi render); bossSel set ở ensureCombat
  selectBoss(id) { if (YEU_VUONG_BY_ID[id]) this.bossSel = id; },
  bossHe(id) { return bossHe(this.state, id); },
  bossLocked(id) { const b = YEU_VUONG_BY_ID[id]; return !b || this.combatLevel < b.reqLevel; },
  bossReady(id) { return !this.bossLocked(id) && bossReady(this.state, id, now()); },     // 'alive' (đã giáng thế)
  bossCdMs(id) { return Math.max(0, bossCdEnd(this.state, id) - now()); },
  bossCdText(id) { const ms = this.bossCdMs(id); return ms <= 0 ? '' : this.fmtClock(ms / 1000); },
  bossCdLive(id) { void this._tick; return this.bossCdText(id); },   // bản tick-mỗi-giây cho UI
  // Trạng thái: 'locked' | 'fighting' | 'alive' | 'reviving'
  bossStateOf(id) {
    void this._tick;   // phụ thuộc nhịp 1s → panel chi tiết tự lật 'reviving'→'alive' khi cd về 0
    if (this.bossLocked(id)) return 'locked';
    if (this.bossFight && this.bossFight.id === id && !this.bossFight.done) return 'fighting';
    return this.bossReady(id) ? 'alive' : 'reviving';
  },
  bossQueued(id) { return bossQueued(this.state, id); },
  toggleBossQueue(id) {
    if (this.bossLocked(id)) return;
    setBossQueue(this.state, id, !bossQueued(this.state, id));
    Storage.save(this.state);
  },
  // (dự báo bossPredict + "đề nghị chiến lực" đã gỡ khỏi UI — bỏ luôn cache/getter để tránh 7-sim lãng phí + side-effect roll hệ)

  // --- Máu boss carry-over + dưỡng thương ---
  bossHpPct(id) { void this._tick; const max = bossMaxHp(id) || 1; return Math.max(0, Math.min(100, bossCurHp(this.state, id) / max * 100)); },
  bossHurt(id) { return this.bossHpPct(id) < 99.9; },               // boss đã bị thương (máu < đầy)
  isBossHealing() { void this._tick; return bossHealing(this.state, now()); },
  bossHealText() { void this._tick; const s = Math.ceil(bossHealLeftMs(this.state, now()) / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); },

  // --- Trận LIVE (xem từng lượt 3s) ---
  startBossFight(id) {
    if (this.bossLocked(id) || !this.bossReady(id)) return;
    if (bossHealing(this.state, now())) { this.showToast('Đang dưỡng thương — chờ hồi phục hoặc dùng vật phẩm hồi phục.'); return; }
    if (this.bossFight && !this.bossFight.done) return;   // đang đánh trận khác
    setBossQueue(this.state, id, false);                  // tự xử lý → rời hàng đợi (tránh resolve nền trao thưởng 2 lần)
    const he = bossHe(this.state, id);
    const res = runBossFight(this.state, id, he);
    if (!res) return;
    const f0 = res.frames[0];
    this.bossFight = {
      id, he, frames: res.frames, total: res.frames.length, idx: 0,
      pMax: res.pMax, bMax: res.bMax, pHp: f0.pHp, bHp: f0.bHp,
      log: f0.lines.slice().reverse(), turn: 0, done: false, win: res.win, timeout: res.timeout, reward: null,
    };
    this.bossSel = id;
    this._bossFrameAt = now();
  },
  // Lộ frame kế (rafLoop gọi mỗi BOSS_TURN_MS). Gộp frame nếu trận dài → tối đa ~14 lượt.
  revealBossFrame() {
    const F = this.bossFight; if (!F || F.done) return;
    const step = Math.max(1, Math.ceil(F.total / 14));
    const target = Math.min(F.total - 1, F.idx + step);
    for (let i = F.idx + 1; i <= target; i++) {
      const fr = F.frames[i]; F.pHp = fr.pHp; F.bHp = fr.bHp;
      for (const ln of fr.lines) F.log.unshift(ln);
    }
    if (F.log.length > 30) F.log.length = 30;
    F.idx = target; F.turn++;
    if (F.idx >= F.total - 1) this._finishBossFight();
  },
  finishBossFightNow() {   // rời màn → kết thúc tức thì (chạy nền)
    const F = this.bossFight; if (!F || F.done) return;
    for (let i = F.idx + 1; i < F.total; i++) { const fr = F.frames[i]; F.pHp = fr.pHp; F.bHp = fr.bHp; for (const ln of fr.lines) F.log.unshift(ln); }
    if (F.log.length > 30) F.log.length = 30;
    F.idx = F.total - 1;
    this._finishBossFight();
  },
  _finishBossFight() {
    const F = this.bossFight; if (!F || F.done) return;
    F.done = true;
    if (F.win) { F.reward = applyBossWin(this.state, F.id, now()); const _b = YEU_VUONG_BY_ID[F.id]; this.pushNotif('yeuVuong', 'Hạ ' + (_b ? _b.name : 'Yêu Vương'), this._bossRewardText(F.reward)); }
    else if (F.timeout) applyBossRetreat(this.state, F.id, now(), F.bHp);   // giằng co (600 nhịp, không gục) → boss giữ máu, KHÔNG dưỡng thương, thử lại ngay
    else applyBossLose(this.state, F.id, now(), F.bHp);   // gục → boss giữ máu + người chơi dưỡng thương 3p
    Storage.save(this.state);
  },
  closeBossFight() { this.bossFight = null; },
  get bossFightBHpPct() { const F = this.bossFight; return F ? Math.max(0, Math.min(100, F.bHp / Math.max(1, F.bMax) * 100)) : 0; },
  get bossFightPHpPct() { const F = this.bossFight; return F ? Math.max(0, Math.min(100, F.pHp / Math.max(1, F.pMax) * 100)) : 0; },

  // --- Hàng đợi nền + lịch sử + feed giang hồ ---
  resolveBossQueue() {
    if (this.bossFight && !this.bossFight.done) return []; // đang đánh LIVE -> KHÔNG resolve nền (tránh trao thưởng/đụng state trùng)
    const res = resolveBossQueueEngine(this.state, now(), (b) => this.combatLevel >= b.reqLevel);
    if (res.length) {
      const wins = res.filter((r) => r.win).length;
      if (wins > 0) { this.showToast('⚔ Trong lúc vắng mặt, bạn đã hạ ' + wins + ' Yêu Vương đang chờ! Xem Lịch Sử để biết kết quả trận chiến.'); this.pushNotif('yeuVuong', 'Hạ ' + wins + ' Yêu Vương (vắng mặt)', 'Hàng đợi vây sát đã hoàn tất — xem Lịch Sử để biết kết quả.'); }
      else this.showToast('Khiêu chiến hàng đợi thất bại — Yêu Vương vẫn còn sống, hãy thử lại.');
      Storage.save(this.state);
    }
    return res;
  },
  checkBossAwayOnce() { if (this._bossAwayChecked) return; this._bossAwayChecked = true; this.resolveBossQueue(); },
  bossHistoryOf(id) { return ((this.state.boss && this.state.boss.history) || []).filter((h) => h.id === id); },
  bossFeed(id) { void this._tick; const b = YEU_VUONG_BY_ID[id], w = this.state.world; return (b && w) ? genBossFeed(b, w.seed, w.createdAt, now()) : []; },
  // Trộn lịch sử BẢN THÂN + chiến tích đạo hữu (roster bot thật) cho bảng Giang Hồ
  bossLog(id) {
    const nm = (YEU_VUONG_BY_ID[id] || {}).name || 'Yêu Vương';
    const W = ['trảm', 'hạ gục', 'kết liễu', 'đoạt mạng'];   // động từ luân phiên -> không một khuôn, khớp giọng bot
    const mine = this.bossHistoryOf(id).slice(0, 6).map((h, i) => ({
      uid: 'me_' + i + '_' + h.t, me: true, win: h.win, rare: !!h.rare, ago: this.agoText(h.t),
      txt: h.win
        ? (W[i % W.length] + ' ' + nm + ' · ' + this.rewardSummary(h.reward) + (h.rare ? ' ★' : ''))
        : ('khiêu chiến ' + nm + ' bất thành — trọng thương lui về'),
    }));
    const feed = this.bossFeed(id).map((f, i) => ({ ...f, uid: 'feed_' + i, ago: this.agoText(f.ts) }));
    return mine.concat(feed);
  },
  rewardSummary(rw) {
    if (!rw) return 'chiến lợi phẩm';
    const parts = [];
    if (rw.items && rw.items.tinhTheYeuVuong) parts.push(rw.items.tinhTheYeuVuong + '× Tinh Thể');
    if (rw.items) for (const k in rw.items) if (k.startsWith('egg_')) { const tier = k.endsWith('_than') ? 'Thần' : k.endsWith('_linh') ? 'Linh' : 'Phàm'; parts.push('Trứng ' + tier); }
    if (rw.honThach) parts.push(this.fmt(rw.honThach) + ' Hồn Thạch');
    if (rw.diem) parts.push(rw.diem + ' Điểm Sự Kiện');
    return parts.join(' · ') || 'chiến lợi phẩm';
  },
  agoText(t) {
    const s = Math.max(0, Math.floor((now() - t) / 1000));
    if (s < 60) return 'vừa xong';
    if (s < 3600) return Math.floor(s / 60) + ' phút trước';
    if (s < 86400) return Math.floor(s / 3600) + ' giờ trước';
    return Math.floor(s / 86400) + ' ngày trước';
  },

  // ---------- Bản đồ hành trình ----------
  locUnlocked(loc) { return this.combatLevel >= loc.reqLevel; },
  // Tầng cảnh giới của 1 mốc cấp
  tierOf(level) { return this.REALM_TIERS.find(t => level >= t.min && level < t.max) || this.REALM_TIERS[this.REALM_TIERS.length - 1]; },
  locTier(loc) { return this.tierOf(loc.reqLevel); },
  // Vùng HIỆN trên bản đồ: 10 vùng gốc + bản đồ sự kiện KHI sự kiện đang mở. Đóng là biến khỏi map.
  // ⚠ CHỈ hiện bản đồ của sự kiện ĐANG HIỆN HÀNH, không phải mọi sự kiện đang mở. Sáu bản đồ dùng
  //   chung một toạ độ (xem ghi chú ở data/sukien.js) nên hai cái cùng hiện là chồng khít lên nhau.
  get locHienThi() { void this._tick; const ma = this.suKienDangChay; return this.LOCATIONS.filter((l) => !l.suKien || l.suKien === ma); },
  locsInTier(t) { return this.locHienThi.filter((l) => l.reqLevel >= t.min && l.reqLevel < t.max); },   // nhóm vùng theo tầng cảnh giới (cho list mobile); vùng sự kiện reqLevel 1 -> nằm tầng Nhân Gian khi mở
  isCurrentTier(t) { const lv = this.combatLevel; return lv >= t.min && lv < t.max; },
  // Đường linh khí cong (quadratic) giữa các vùng kế tiếp; bow nhẹ lên cho mềm
  get mapSegments() {
    // ⚠ Chỉ nối 10 vùng gốc — nối vào vùng sự kiện là vẽ đường tới một chấm lúc có lúc không.
    const L = this.LOCATIONS.filter((l) => !l.suKien), segs = [];
    for (let i = 0; i < L.length - 1; i++) {
      const a = L[i], b = L[i + 1];
      const mx = (a.mapX + b.mapX) / 2, my = (a.mapY + b.mapY) / 2 - 9;
      segs.push({ d: `M ${a.mapX} ${a.mapY} Q ${mx} ${my} ${b.mapX} ${b.mapY}`, reached: this.locUnlocked(b) });
    }
    return segs;
  },

  // ---------- Vị trí & Hành trình ----------
  locationObj(id) { return this.LOCATIONS.find((l) => l.id === id) || null; },
  get currentLocation() { return this.state.player.location || 'lamLinhCoc'; },
  get currentLocationObj() { return this.locationObj(this.currentLocation) || this.LOCATIONS[0]; },
  isCurrentLocation(loc) { return !!loc && loc.id === this.currentLocation; },
  locationEnemies(loc) { return (loc && loc.enemies ? loc.enemies : []).filter((id) => this.ENEMIES[id]); },
  get currentLocationEnemies() { return this.locationEnemies(this.currentLocationObj); },
  // Modal chi tiết vùng
  locationModal: null,
  openLocation(id) { this.locationModal = { id }; },
  closeLocation() { this.locationModal = null; },
  get modalLocation() { return this.locationModal ? this.locationObj(this.locationModal.id) : null; },
  // Phí / thời gian / khoảng cách tới 1 vùng (từ vị trí hiện tại)
  teleCost(loc) { return loc ? teleportCost(this.totalLevel, this.currentLocation, loc.id) : 0; },
  canAffordTele(loc) { return this.state.currencies.bac >= this.teleCost(loc); },
  walkSec(loc) { return loc ? Math.ceil(travelTimeMs(this.currentLocation, loc.id) / 1000) : 0; },
  walkLabel(loc) { return this.fmtTime(this.walkSec(loc)); },
  distLabel(loc) { return loc ? Math.round(mapDistance(this.currentLocation, loc.id) * 12) : 0; }, // ×12 -> "dặm" cho hợp giang hồ
  // Truyền Tống: tốn Bạc, tức thì. Đổi vùng -> huỷ hoạt động GẮN-VÙNG (đi bộ / thu thập / chiến đấu); chế tác (không zone) giữ nguyên.
  teleportTo(id) {
    const loc = this.locationObj(id);
    if (!loc || id === this.currentLocation || !this.locUnlocked(loc)) return;
    if (loc.suKien && !this.svMoCua(loc.suKien)) { this.showToast('Sự kiện chưa mở.'); return; }
    const cost = this.teleCost(loc);
    if (this.state.currencies.bac < cost) return;
    this.state.currencies.bac -= cost;
    if (this.act && (this.actIsTravel || this.actIsCombat || (this.actAction && this.actAction.zone))) {   // hoạt động gắn-vùng -> huỷ khi đổi vùng
      const wasName = this.actName;
      const sum = this.buildCombatSummary('manual');   // combat bị cắt vì đổi vùng: vẫn chốt thu hoạch vào chuông
      stopActivity(this.state);
      if (sum) this.pushCombatSummaryNotif(sum);
      this.showToast('Đổi vùng — đã dừng: ' + wasName);
    }
    this.state.player.location = id;
    Storage.save(this.state);
    this.closeLocation();
    if (this._teleReturnView) { const v = this._teleReturnView; this._teleReturnView = null; this.navTo(v); }   // quay lại tab đã bấm "Đổi vùng"
  },
  // Khinh Công là 1 HOẠT ĐỘNG -> THAY hoạt động đang chạy (chặt/đào/đánh) bằng đếm ngược đi đường.
  startKhinhCong(id) {
    const loc = this.locationObj(id);
    if (!loc || id === this.currentLocation || !this.locUnlocked(loc)) return;
    if (loc.suKien && !this.svMoCua(loc.suKien)) { this.showToast('Sự kiện chưa mở.'); return; }
    const prev = this.buildCombatSummary('manual');   // đang đánh dở -> chốt phiên combat cũ vào chuông
    if (startTravel(this.state, id, now())) { if (prev) this.pushCombatSummaryNotif(prev); Storage.save(this.state); }
    this.closeLocation();
  },
  cancelTravel() { if (this.actIsTravel) { stopActivity(this.state); Storage.save(this.state); } },
  // Trạng thái đang đi (đọc từ activity type 'travel')
  get isTraveling() { return this.actIsTravel; },
  get travelToObj() { return this.actIsTravel ? this.locationObj(this.act.toId) : null; },
  get travelToId() { return this.actIsTravel ? this.act.toId : null; },
  get travelProgressPct() { return this.actIsTravel ? (this.act.progress || 0) * 100 : 0; },
  get travelRemainSec() {
    if (!this.actIsTravel) return 0;
    return Math.max(0, Math.ceil(this.act.cycleMs * (1 - (this.act.progress || 0)) / 1000));
  },

  // ---------- Combat: Tuyệt Học Phổ ----------
  fmtDur(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h) return h + 'h ' + m + 'm';
    if (m) return m + 'm' + (s ? ' ' + s + 's' : '');
    return s + 's';
  },
  // Thời lượng 1 VÒNG giao chiến (giây) — cadence thật: hạ 1 con mỗi vòng 8s
  get combatRoundSec() { return CYCLE_MS / 1000; },
  // Dự Tính Thu Hoạch theo giờ — bám theo VÒNG 8s (1 con/vòng), khớp với rate widget + advance() thật
  get harvestEstimate() {
    const id = this.combatSel; const e = id && this.ENEMIES[id]; const fc = id && this.combatFc[id];
    if (!e || !fc) return null;
    const roundSec = this.combatRoundSec;                 // 8s/con — không dùng thời lượng trận (sim) cho tốc độ nữa
    const kph = 3600 / roundSec;
    const mult = skillExpMultiplier(this.state, 'chienDau') * combatExpMult(this.state);
    const expPer = Math.max(1, Math.round(e.exp * mult));
    const bacPer = Math.max(1, Math.round(e.exp * BAC_PER_EXP * BAC_DROP_CHANCE));   // Bạc KỲ VỌNG/kill (rơi ~15% × exp×0.5) — cho dự tính/giờ đúng
    let survival, endureSec;
    if (fc.lvl === '❌' && fc.endure === 'thua') { survival = 0; endureSec = 0; }
    else if (fc.fights === Infinity || fc.hpLostPerKill <= 0) { survival = 99; endureSec = Infinity; }
    else { survival = Math.min(99, Math.round(100 * fc.fights / (fc.fights + 1))); endureSec = fc.fights * roundSec; }
    return {
      expPer, bacPer,
      expH: Math.round(kph * expPer), bacH: Math.round(kph * bacPer), killH: Math.round(kph),
      survival, endure: endureSec === Infinity ? 'Vô hạn' : (endureSec <= 0 ? '—' : this.fmtDur(endureSec)),
      lvl: fc.lvl, verdict: fc.verdict,
    };
  },
  canFight(e) { return this.chienLuc >= (e.power || 0); },
  combatSel: null,
  combatFc: {},
  get loadout() { return this.state.combat.loadout; },
  get combatStats() { return deriveCombat(this.state, this.loadout); },
  get combatMaxHp() { return this.combatStats.maxHP; },
  // Cộng Hưởng hệ PHỤ: khi mặc Bộ Trang lệch hệ Tâm Pháp (vd bộ Hỏa + Tâm Pháp Thủy), dòng ẩn 7 món
  // +30% Sát Thương hệ đó CÓ tác dụng thật trong trận (chiêu cùng hệ ăn eleBonus[he]) nhưng KHÔNG
  // hiện ở ô Cộng Hưởng — ô đó chỉ đọc heChinh. Hàm này trả các hệ KHÁC heChinh còn dư cộng hưởng để
  // gắn thêm chip, khỏi để người chơi tưởng dòng ẩn đắt nhất của bộ là đồ trang trí.
  congHuongPhu() {
    const cs = this.combatStats; const el = cs.eleBonus || {};
    const out = [];
    for (const he of NGU_HANH_LIST) { if (he === cs.heChinh) continue; if ((el[he] || 0) > 0.0001) out.push({ he, name: heName(he), hex: this.heHex(he), pct: Math.round(el[he] * 100) }); }
    return out;
  },
  // ===== NGUỒN SKILL (Bước 6): sở hữu / học (Bạc) / mua (Nguyên Bảo) =====
  get owned() { return this.state.combat.owned || (this.state.combat.owned = normOwned(this.state.combat)); },
  ownsChieu(id) { return this.owned.chieu.includes(id); },
  ownsTamPhap(id) { return this.owned.tamPhap.includes(id); },
  ownsBiDong(id) { return this.owned.biDong.includes(id); },
  chieuCost(c) { return chieuCost(c); },
  tamPhapCost(t) { return tamPhapCost(t); },
  biDongCost(p) { return biDongCost(p); },
  skillSource(cost) { return skillSource(cost); },              // 'hoc' | 'mua'
  monPhaiOf(he) { return monPhaiOf(he); },
  // tiền tệ của 1 món chi phí + kiểm tra đủ + chữ hiển thị
  costCur(cost) { return (cost && cost.nguyenBao) ? 'nguyenBao' : (cost && cost.honThach ? 'honThach' : 'bac'); },
  canAffordCost(cost) { if (!cost) return true; const cur = this.costCur(cost); return (this.state.currencies[cur] || 0) >= cost[cur]; },
  costText(cost) { if (!cost) return ''; const cur = this.costCur(cost); const nm = { bac: 'Bạc', nguyenBao: 'Nguyên Bảo', honThach: 'Hồn Thạch' }[cur]; return this.fmt(cost[cur]) + ' ' + nm; },
  costAmt(cost) { if (!cost) return ''; return this.fmt(cost[this.costCur(cost)]); },
  costEmoji(cost) { return { bac: '🟡', nguyenBao: '🔷', honThach: '🔴' }[this.costCur(cost)]; },
  costIcon(cost) { const cur = this.costCur(cost); return this.ico(cur, this.costEmoji(cost)); },  // ảnh currency thật (images/currency/<cur>.png) + fallback emoji
  // --- Item helpers (popup loot) ---
  // x = string id (vật phẩm xếp chồng) HOẶC view/instance gear (có .quality) — phẩm chất ĐA HÌNH.
  _qKey(x) { return (x && typeof x === 'object') ? x.quality : (this.ITEMS[x] || {}).quality; },
  itemQuality(x) {
    const base = this.QUALITY[this._qKey(x)] || this.QUALITY.phamPham;
    // Bộ Trang (set) → hiển thị "Bạch Kim" + chữ shimmer + viền bạch kim ở MỌI nơi gọi itemQuality (giữ stat theo phẩm gốc).
    if (this._itemSetId(x)) return Object.assign({}, base, { name: 'Bạch Kim', text: 'q-set', border: 'border-slate-300/70', bg: 'bg-slate-300/10', ring: 'ring-slate-300/60', grad: 'from-slate-300/25 to-ink3/15' });
    return base;
  },
  // ⚠ Bảng thứ hạng dựng MỘT LẦN ở mức module (QKEYS/QRANK ngay dưới phần import), KHÔNG
  // `Object.keys(this.QUALITY)` mỗi lần gọi. Đo thật: sắp 400 trang bị theo phẩm chất tốn
  // 16,6ms vì mỗi phép so gọi qualityRank hai lần, mỗi lần lại cấp phát một mảng khoá qua
  // proxy Alpine. Đổi sang tra bảng còn ~1ms — hàm này nằm trên đường sắp xếp của Hành Lý,
  // danh sách trang bị, loot và Linh Thú.
  get QUALITY_KEYS() { return QKEYS; },                                   // thứ tự thấp -> cao
  qualityRank(x) { return QRANK[this._qKey(x)] || 1; },                   // 1..7
  qualityName(x) { return this.itemQuality(x).name; },
  itemDescOf(x) { const id = (x && typeof x === 'object') ? x.id : x; const it = this.ITEMS[id] || {}; return it.desc || ('Chiến lợi phẩm ' + this.itemQuality(x).name + ', thu được khi hạ yêu thú.'); },
  // Chỉ trả lời VĂN THẬT do người viết, KHÔNG trả câu độn "Chiến lợi phẩm ..., thu được khi hạ yêu thú".
  // Mọi món trang bị đều khai desc rỗng nên câu độn đó lặp y hệt trên từng món, lại nhắc lại đúng cái
  // phẩm chất đã có huy hiệu ngay cạnh tên — popup chi tiết dùng hàm này để khỏi in dòng thừa.
  itemDescReal(x) { const id = (x && typeof x === 'object') ? x.id : x; return ((this.ITEMS[id] || {}).desc) || ''; },
  QHEX: { phamPham: '#cbd5e1', luongPham: '#34d399', tinhPham: '#60a5fa', tuyetPham: '#a78bfa', truyenThe: '#e879f9', thanPham: '#fb923c', coBan: '#fbbf24' },
  // Hào quang chạy viền — ĐI THEO MÓN TRANG BỊ ở MỌI nơi hiện (ô paper-doll, Hành Lý, popup chọn trang bị...). Chỉ TRANG BỊ (gear) phẩm Sử Thi (truyenThe rank 5) TRỞ LÊN, HOẶC thuộc Bộ Trang (set — sắp ra mắt; hook setId/set). x = instance / gearView / string id. Trả hex màu phẩm hoặc null.
  SET_COLORS: { kimQuang: '#d6e3f2' },   // màu hào quang/hiển thị riêng cho từng Bộ Trang (Bạch Kim)
  // id Bộ Trang của 1 item (instance/gearView/string id) — tra catalog. null nếu không thuộc set.
  // CHỐT PHẨM CHẤT nằm ở ĐÂY chứ không ở từng hàm hiển thị: itemQuality · itemHaloHex · haloStyle ·
  // gtipSetName · setBonusPanel đều đi qua hàm này, nên vá một chỗ là năm mặt cùng nhất quán với
  // equippedSetCount/setPieceOwned. Rải chốt ra từng hàm là kiểu gì cũng sót một mặt rồi cùng một
  // món hiện "Bạch Kim, 3/7" ở tooltip mà "chưa sở hữu" ở Bách Trang Các.
  // _qKey ĐA HÌNH: object lấy x.quality, string id lấy phẩm catalog (= Cổ Bản) -> ô xem trước ở
  // Bách Trang Các truyền pid dạng chuỗi vẫn chạy đúng.
  _itemSetId(x) {
    if (!x) return null;
    const def = (typeof x === 'object') ? (this.ITEMS[x.gearId] || x) : (this.ITEMS[x] || {});
    const key = (def.equip && def.equip.set) || (x.equip && x.equip.set) || x.set || null;
    return (key && this._qKey(x) === SET_QUALITY) ? key : null;
  },
  itemHaloHex(x) {
    if (!x) return null;
    const def = (typeof x === 'object') ? (this.ITEMS[x.gearId] || x) : (this.ITEMS[x] || {});
    const isGear = (typeof x === 'object') ? !!(x.gearId || x.uid || x.equip || x.slot) : !!def.equip;
    if (!isGear) return null;
    const setId = this._itemSetId(x);
    if (!(this.qualityRank(x) >= 5 || setId)) return null;
    return setId ? (this.SET_COLORS[setId] || '#d6e3f2') : (this.QHEX[this._qKey(x)] || '#cbd5e1');  // set → màu set; còn lại → màu phẩm
  },
  // style cho <i class="halo2">: --c màu; set thì viền DÀY hơn (--hpad) + glow mạnh hơn (--hglow).
  haloStyle(x) {
    const hex = this.itemHaloHex(x);
    if (!hex) return '';
    return this._itemSetId(x) ? ('--c:' + hex + ';--hpad:2.4px;--hglow:7px') : ('--c:' + hex);
  },
  equipHaloStyle(slotId) { return this.haloStyle(this.state.equipment && this.state.equipment[slotId]); },
  equipHaloHex(slotId) { return this.itemHaloHex(this.state.equipment && this.state.equipment[slotId]); },
  // ---- Bách Trang Các: ghép Bộ Trang từ "Mảnh Trang Bị Hoàng Kim" (currency CHUNG) + Đồ Phổ Bộ mở khoá ----
  TRANG_SETS, TRANG_SET_KEYS,
  get manhTrangBi() { return countItem(this.state, 'manhTrangBi'); },   // ví mảnh chung
  setUnlocked(key) { const s = this.TRANG_SETS[key]; return !!s && countItem(this.state, s.blueprintId) > 0; },   // đã có Đồ Phổ Bộ?
  // Đã có món này (trong túi hoặc đang mặc)? CHỈ tính bản Cổ Bản — xem chú thích SET_QUALITY ở
  // engine/setbonus.js. Không lọc phẩm thì một món bộ phẩm rác còn sót trong save cũ sẽ CẤM VĨNH
  // VIỄN quyền ghép bản thật (setCanGhep đọc thẳng hàm này).
  setPieceOwned(id) {
    if ((this.state.gearBag || []).some((g) => g && g.gearId === id && isSetPieceInst(g))) return true;
    const eq = this.state.equipment || {};
    return Object.values(eq).some((g) => g && g.gearId === id && isSetPieceInst(g));
  },
  setOwnedCount(key) { const s = this.TRANG_SETS[key]; return s ? s.pieces.filter((id) => this.setPieceOwned(id)).length : 0; },
  // ---- Bách Trang Các: điều hướng HAI TẦNG (cột Ngũ Hành → thanh chọn Bộ) ----
  // 11 bộ xếp chồng là gần 6000px cuộn dọc. Chia hệ rồi chọn bộ thì mỗi lần chỉ dựng MỘT bộ.
  BTC_HE_ORDER: ['kim', 'moc', 'thuy', 'hoa', 'tho', 'vohe'],
  btcHe: 'kim',      // hệ đang chọn ở cột trái
  btcBoIdx: 0,       // vị trí bộ trong hệ đó (thanh ngang)
  // Kim Quang khai `he: null` (Vô Hệ) — quy về 'vohe' để cùng một khoá với bảng NGU_HANH.
  btcHeOf(key) { return (this.TRANG_SETS[key] || {}).he || 'vohe'; },
  get btcSetsCuaHe() { return this.TRANG_SET_KEYS.filter((k) => this.btcHeOf(k) === this.btcHe); },
  // Kẹp chỉ số: đổi hệ mà quên reset thì btcBoIdx có thể trỏ ra ngoài mảng -> undefined -> vỡ view.
  get btcSetKey() { const a = this.btcSetsCuaHe; return a[Math.min(this.btcBoIdx, Math.max(0, a.length - 1))] || null; },
  btcChonHe(he) { this.btcHe = he; this.btcBoIdx = 0; },
  // Số bộ ĐÃ TRỌN — thẻ 裝 trên bảng chỉ số chỉ hiện tóm tắt, danh sách từng bộ nằm ở Bách Trang Các.
  get setTronCount() { return this.TRANG_SET_KEYS.filter((k) => this.setUnlocked(k) && this.setOwnedCount(k) >= this.TRANG_SETS[k].pieces.length).length; },
  // ---------- DÒNG ẨN (3/5/7 món ĐANG MẶC) ----------
  // setOwnedCount ở trên đếm SỞ HỮU (túi hoặc đang mặc) cho thanh tiến độ. Dòng ẩn thì phải đếm
  // ĐANG MẶC — hai khái niệm khác nhau, dùng lẫn là để đồ trong túi cũng ăn hiệu ứng.
  // Nhãn ô "Giảm Thời Gian" ở thẻ 抗. Buộc theo HE_FX của engine (Kim gây Ngất · Mộc gây Độc ·
  // Thủy gây Chậm · Hỏa gây Bỏng · Thổ gây Choáng) nên cột nào cũng đúng hệ của nó; sửa HE_FX thì
  // ô tự đi theo, không lệch.
  // Ngất là DUY NHẤT không mang chữ "Giảm" — nó đọc là thời gian nằm bất tỉnh, user chốt vậy.
  CC_LABEL: { ngat: 'Thời Gian Phục Hồi', doc: 'Giảm Thời Gian Trúng Độc', cham: 'Giảm Thời Gian Làm Chậm',
    bong: 'Giảm Thời Gian Bị Bỏng', choang: 'Giảm Thời Gian Choáng' },
  ccOfHe(he) { const fx = HE_FX[he]; return fx ? { key: fx.id, name: this.CC_LABEL[fx.id] || fx.ten } : { key: '', name: '' }; },
  // Tên hiển thị 5 kháng — đổi sang lối tên sát thương. Khoá engine (khangKim/...) KHÔNG đổi.
  KHANG_LABEL: { kim: 'Phòng Thủ Vật Lý', moc: 'Kháng Độc', thuy: 'Kháng Băng', hoa: 'Kháng Hỏa', tho: 'Kháng Lôi' },
  khangLabel(he) { return this.KHANG_LABEL[he] || ('Kháng ' + heName(he)); },
  SET_BAC: SET_TIERS,
  setEquippedCount(key) { return equippedSetCount(this.state)[key] || 0; },
  // Nhãn cho khoá KHÔNG thuộc bảng 21 chỉ số gearStats (kênh B/C/D). Hán-Việt ĐẦY ĐỦ, không viết tắt.
  setBonusLabel(k, s) {
    if (k === SET_ELE_KEY) return 'Cộng Hưởng ' + heName(s.he);
    return ({ atkPct: 'Công Kích', defPct: 'Hộ Thể', hpPct: 'Sinh Lực', allPct: 'Toàn Bộ Chỉ Số',
      hieuLucDan: 'Hiệu Lực Đan Dược & Thức Ăn' })[k] || this.statLabel(k);
  },
  // Kênh B/C/D lưu TỈ LỆ (0,12) -> ×100. Kênh A lưu ĐIỂM NGUYÊN -> in thẳng, hậu tố % tra bảng AFFIX.
  setBonusVal(k, v) {
    if (SET_PCT_KEYS.includes(k) || k === SET_ELE_KEY || SET_MISC_KEYS.includes(k)) return '+' + Math.round(v * 100) + '%';
    return '+' + v + ((AFFIX[k] || {}).fmt === 'pct' ? '%' : '');
  },
  // Trả ĐỦ BA DÒNG mọi lúc — chưa đủ món thì `on:false` để UI làm xám, người chơi thấy trước đích đến.
  setBonusRows(key) {
    const s = this.TRANG_SETS[key];
    if (!s || !s.bonus) return [];
    const mac = this.setEquippedCount(key);
    return this.SET_BAC.map((bac) => {
      const tier = s.bonus[bac] || {};
      const txt = Object.keys(tier).map((k) => this.setBonusLabel(k, s) + ' ' + this.setBonusVal(k, tier[k])).join(' · ');
      return { bac, txt: txt || 'Chưa chốt', on: mac >= bac };
    });
  },
  // Khối dòng ẩn gắn TRÊN CHÍNH MÓN ĐỒ (popup chi tiết + tooltip paper-doll): dưới các dòng hiện là
  // ba dòng ẩn, xám sẵn, mặc đủ số món thì sáng lên. x = instance / gearView / string id.
  setBonusPanel(x) {
    const key = this._itemSetId(x);
    const s = key && this.TRANG_SETS[key];
    if (!s || !s.bonus) return null;
    return { key, name: s.name, worn: this.setEquippedCount(key), total: s.pieces.length, rows: this.setBonusRows(key) };
  },
  setCanGhep(key, id) { const s = this.TRANG_SETS[key]; return !!s && s.pieces.includes(id) && this.setUnlocked(key) && !this.setPieceOwned(id) && this.manhTrangBi >= s.manhCost; },
  ghepSetPiece(key, id) {
    const s = this.TRANG_SETS[key];
    if (!this.setCanGhep(key, id)) return;
    removeItem(this.state, 'manhTrangBi', s.manhCost);
    addGearInstance(this.state, rollSetPieceInstance(id));   // dòng cốt CỘNG THÊM vào dòng roll (xem gear.js)
    Storage.save(this.state); this._tick++;
    this.showToast('Ghép thành 「' + ((this.ITEMS[id] || {}).name || 'trang bị') + '」!');
  },
  _spendCost(cost) { if (!cost) return true; const cur = this.costCur(cost); if ((this.state.currencies[cur] || 0) < cost[cur]) return false; this.state.currencies[cur] -= cost[cur]; return true; },
  // HỌC/MUA: trừ tiền + thêm vào sở hữu. Trả true nếu thành công.
  learnChieu(id) {
    const c = chieuById(id); if (!c || this.ownsChieu(id)) return false;
    if (c.tier === 'tuyệt') { this.showToast('〈' + c.name + '〉 là Tuyệt Kĩ — phải CHẾ, không mua/học được.'); return false; }
    const cost = this.chieuCost(c), mua = this.skillSource(cost) === 'mua';
    if (!this.canAffordCost(cost)) { this.showToast('Không đủ ' + this.costText(cost) + ' để ' + (mua ? 'mua' : 'học') + ' 〈' + c.name + '〉.'); return false; }
    this._spendCost(cost); this.owned.chieu.push(id); Storage.save(this.state);
    this.showToast((mua ? '🪙 Đã mua bí phổ ' : '📖 Đã học ') + '〈' + c.name + '〉.'); return true;
  },
  // ---- CHẾ TUYỆT KĨ: cần Đồ Phổ (đã cầm) + đủ liệu boss + Bạc. Chế xong -> vào owned.chieu, tiêu hết đồ phổ + liệu. ----
  TUYET_IDS, tuyetRecipe,
  isTuyet(it) { return !!it && it.kind === 'chieu' && !!it.obj && it.obj.tier === 'tuyệt'; },   // item Tàng Kinh Các có phải Tuyệt Kĩ?
  tuyetHasDoPho(id) { const r = tuyetRecipe(id); return !!r && countItem(this.state, r.dp) > 0; },
  tuyetMatsView(id) {   // [{id,name,need,have,ok}] để UI liệt kê liệu còn thiếu
    const r = tuyetRecipe(id); if (!r) return [];
    return Object.keys(r.mats).map((m) => {
      const need = r.mats[m], have = countItem(this.state, m);
      return { id: m, name: (this.ITEMS[m] || {}).name || m, need, have, ok: have >= need };
    });
  },
  tuyetBacNeed(id) { const r = tuyetRecipe(id); return r ? r.bac : 0; },
  tuyetCanCraft(id) {
    const r = tuyetRecipe(id); if (!r || this.ownsChieu(id) || !this.tuyetHasDoPho(id)) return false;
    if ((this.state.currencies.bac || 0) < r.bac) return false;
    return this.tuyetMatsView(id).every((m) => m.ok);
  },
  craftTuyetKi(id) {
    const c = chieuById(id), r = tuyetRecipe(id);
    if (!c || !r || !this.tuyetCanCraft(id)) return false;
    removeItem(this.state, r.dp, 1);
    Object.keys(r.mats).forEach((m) => removeItem(this.state, m, r.mats[m]));
    this.state.currencies.bac -= r.bac;
    this.owned.chieu.push(id);
    Storage.save(this.state); this._tick++;
    this.showToast('⚡ Đã chế thành Tuyệt Kĩ 《' + c.name + '》!');
    return true;
  },
  learnTamPhap(id) {
    const t = tamPhapById(id); if (!t || this.ownsTamPhap(id)) return false;
    const cost = this.tamPhapCost(t), mua = this.skillSource(cost) === 'mua';
    if (!this.canAffordCost(cost)) { this.showToast('Không đủ ' + this.costText(cost) + ' để ' + (mua ? 'mua' : 'học') + ' 《' + t.name + '》.'); return false; }
    this._spendCost(cost); this.owned.tamPhap.push(id); Storage.save(this.state);
    this.showToast('📖 Đã lĩnh hội nội công 《' + t.name + '》.'); return true;
  },
  learnBiDong(id) {
    const p = biDongById(id); if (!p || this.ownsBiDong(id)) return false;
    const cost = this.biDongCost(p), mua = this.skillSource(cost) === 'mua';
    if (!this.canAffordCost(cost)) { this.showToast('Không đủ ' + this.costText(cost) + ' để ' + (mua ? 'mua' : 'học') + ' 〈' + p.name + '〉.'); return false; }
    this._spendCost(cost); this.owned.biDong.push(id); Storage.save(this.state);
    this.showToast('📖 Đã lĩnh hội tâm pháp bị động 〈' + p.name + '〉.'); return true;
  },
  // --- Tàng Kinh Các: gom toàn bộ võ học theo Môn Phái (hệ) ---
  get tangKinhSections() {
    const order = NGU_HANH_LIST.concat(['vohe', 'buff']);
    return order.map(he => {
      const chieu = CHIEU.filter(c => c.type === he).sort((a, b) => (TIER_ORDER[a.tier] || 0) - (TIER_ORDER[b.tier] || 0)).map(c => ({ kind: 'chieu', id: c.id, obj: c }));
      const tamphap = TAM_PHAP_POOL.filter(t => t.he === he).map(t => ({ kind: 'tamphap', id: t.id, obj: t }));
      const bidong = BI_DONG.filter(p => p.he === he).map(p => ({ kind: 'bidong', id: p.id, obj: p }));
      // Phân loại trong từng Môn Phái: Tâm Pháp (nội công nền) · Bị Động (auto) · Chiêu Thức (chủ động).
      // Thứ tự bám sơ đồ Bài Võ (Tâm Pháp -> Bị Động -> Chiêu Thức) và để cụm ĐÔNG nhất ở cuối
      // -> khi màn hẹp, chỉ mình nó xuống dòng, hai cụm nhỏ vẫn nằm chung một hàng.
      const groups = [
        { key: 'tamphap', label: 'Tâm Pháp', items: tamphap },
        { key: 'bidong', label: 'Bị Động', items: bidong },
        { key: 'chieu', label: 'Chiêu Thức', items: chieu },
      ].filter(g => g.items.length);
      const items = [...tamphap, ...bidong, ...chieu];
      return { he, monPhai: MON_PHAI[he], items, groups };
    });
  },
  itemOwned(it) { return it.kind === 'chieu' ? this.ownsChieu(it.id) : it.kind === 'tamphap' ? this.ownsTamPhap(it.id) : this.ownsBiDong(it.id); },
  itemCost(it) { return it.kind === 'chieu' ? chieuCost(it.obj) : it.kind === 'tamphap' ? tamPhapCost(it.obj) : biDongCost(it.obj); },
  itemImg(it) { return 'images/' + (it.kind === 'tamphap' ? 'tamphap' : it.kind === 'bidong' ? 'bidong' : 'chieu') + '/' + it.id + '.webp'; },
  learnItem(it) { return it.kind === 'chieu' ? this.learnChieu(it.id) : it.kind === 'tamphap' ? this.learnTamPhap(it.id) : this.learnBiDong(it.id); },

  // ---------- Vạn Vật Phổ ----------
  get codexCats() { return CODEX_CATS; },
  get codexCat() { return CODEX_BY_KEY[this.codexTab] || CODEX_CATS[0]; },
  codexCnt(catKey, id) { return codexCount(this.state, catKey, id); },
  codexEntryState(cat, e) { const c = codexCount(this.state, cat.key, e.id); return c >= cat.threshold ? 'done' : (c > 0 ? 'prog' : 'locked'); },
  codexEntryPct(cat, e) { return Math.min(100, Math.round(codexCount(this.state, cat.key, e.id) / cat.threshold * 100)); },
  codexCatDoneN(cat) { return codexCatDone(this.state, cat); },
  codexGroupDone(cat, grp) { let n = 0; for (const e of grp.entries) if (codexCount(this.state, cat.key, e.id) >= cat.threshold) n++; return n; },
  get codexTotalDone() { return CODEX_CATS.reduce((a, c) => a + codexCatDone(this.state, c), 0); },
  get codexTotalAll() { return CODEX_CATS.reduce((a, c) => a + c.entries.length, 0); },
  codexOpen(e) { this.codexDetail = e; },
  closeCodex() { this.codexDetail = null; },
  // Art tile theo loại phổ: quái/pet dùng ảnh thật (fallback emoji nền), gear/vật phẩm dùng ico(), bí cảnh dùng triện.
  codexArtTag(cat, e) {
    const safe = String(e.icon || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const drop = `this.replaceWith(Object.assign(document.createElement(&quot;span&quot;),{className:&quot;text-4xl opacity-90&quot;,textContent:&quot;${safe}&quot;}))`;
    if (cat.kind === 'enemy') return `<img src="images/enemies/${e.id}.webp" class="w-full h-full object-cover" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=this.src.replace(&quot;.webp&quot;,&quot;.png&quot;)}else{${drop}}'>`;
    if (cat.kind === 'pet') return `<img src="images/pets/pet_${e.id}_base.webp" class="w-full h-full object-contain" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=this.src.replace(&quot;.webp&quot;,&quot;.png&quot;)}else{${drop}}'>`;
    if (cat.kind === 'gear' || cat.kind === 'item') return this.ico(e.id, e.icon);
    if (cat.kind === 'dungeon') return `<img src="images/dungeons/${e.id}.webp" class="w-full h-full object-cover" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=this.src.replace(&quot;.webp&quot;,&quot;.png&quot;)}else{${drop}}'>`;
    if (cat.kind === 'danhsi') return `<img src="images/danhsi/${e.id}.webp" class="w-full h-full object-cover" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src=this.src.replace(&quot;.webp&quot;,&quot;.png&quot;)}else{${drop}}'>`;
    return `<span class="text-4xl fserif opacity-90">${e.icon || ''}</span>`;
  },
  // Phổ Lực tóm tắt (chuỗi) để hiển thị header
  codexPhoLucText() {
    const b = codexBonus(this.state);
    const parts = [];
    if (b.atkPct || b.allPct) parts.push('+' + (((b.atkPct + b.allPct) * 100).toFixed(1)) + '% Công');
    if (b.defPct || b.allPct) parts.push('+' + (((b.defPct + b.allPct) * 100).toFixed(1)) + '% Thủ');
    if (b.hpPct || b.allPct) parts.push('+' + (((b.hpPct + b.allPct) * 100).toFixed(1)) + '% Sinh Lực');
    return parts.length ? parts.join(' · ') : 'Chưa có';
  },
  tierStyle(t) { return tierStyle(t); },
  // Gom style hiển thị 1 thẻ võ học: phẩm chất (bậc) cho Chiêu · loại cho Tâm Pháp/Bị Động.
  itemMeta(it) {
    const he = it.kind === 'chieu' ? it.obj.type : it.obj.he;
    const han = (NGU_HANH[he] || {}).han || '';
    if (it.kind === 'chieu') {
      const ts = tierStyle(it.obj.tier);
      return { he, han, badgeText: ts.label, badgeCls: ts.badge, borderCls: ts.border, ringCls: ts.ring, glowCls: ts.glow, metaLine: 'Chiêu Thức · ' + ts.label, metaText: ts.text };
    }
    if (it.kind === 'tamphap') return { he, han, badgeText: 'Tâm Pháp', badgeCls: 'bg-amber-500/85 text-ink font-bold', borderCls: 'border-amber-500/55', ringCls: 'ring-1 ring-amber-400/25', glowCls: '', metaLine: 'Tâm Pháp · Nội công nền', metaText: 'text-amber-300/80' };
    return { he, han, badgeText: 'Bị Động', badgeCls: 'bg-violet-600/85 text-violet-50 font-bold', borderCls: 'border-violet-500/55', ringCls: 'ring-1 ring-violet-400/25', glowCls: '', metaLine: 'Bị Động · Tự động', metaText: 'text-violet-300/80' };
  },
  // ---- Popup chi tiết võ học (Tàng Kinh Các): bấm tile -> hiện chỉ số đầy đủ ----
  tkDetail: null,
  // tkTab để ở STORE chứ không phải x-data cục bộ của template: template nằm trong x-if, mỗi lần
  // Alpine dựng lại là state cục bộ mất trắng và tab tự nhảy về mặc định — trông hệt như "bấm không được".
  tkTab: 'kq',
  openTkDetail(it) { this.tkDetail = it; this.tkTab = 'kq'; },
  closeTkDetail() { this.tkDetail = null; },
  // Popup LUYỆN CHẾ Tuyệt Kĩ (tách riêng khỏi thẻ để thẻ không bị dài -> không phải cuộn)
  tkCraft: null,
  openTkCraft(id) { this.tkCraft = id; },
  closeTkCraft() { this.tkCraft = null; },
  get tkCraftObj() { return this.tkCraft ? chieuById(this.tkCraft) : null; },
  tkKindLabel(it) {
    if (!it) return '';
    if (it.kind === 'tamphap') return 'Nội công nền';
    if (it.kind === 'bidong') return 'Bị động';
    return (it.obj && it.obj.tier === 'tuyệt') ? 'Tuyệt kĩ' : 'Chiêu thức';
  },
  // Chip hiệu ứng cho thẻ võ học — suy thẳng từ field của món (burn/slow/stun/lifesteal/pen/crit/buff/eleDmg).
  // Võ học trong popup Tàng Kinh Các, ĐÃ áp Tầng nếu là Chiêu Thức. MỌI chỗ hiển thị phải đi qua đây:
  // đọc thẳng it.obj sẽ ra số GỐC trong khi trận thật chạy số đã nâng Tầng -> hai con số chọi nhau.
  tkObj(it) {
    if (!it || !it.obj) return null;
    return it.kind === 'chieu' ? chieuOf(this.state, it.id) : it.obj;
  },
  tkFxChips(it) {
    const o = this.tkObj(it); if (!o) return [];
    const a = [];
    if (o.burn) a.push({ t: 'Bỏng ' + o.burn.dmg + ' × ' + o.burn.ticks + ' hiệp', c: '#fb923c' });
    if (o.lifesteal) a.push({ t: 'Hút máu ' + Math.round(o.lifesteal * 100) + '%', c: '#f472b6' });
    if (o.heal) a.push({ t: 'Hồi ' + Math.round(o.heal * 100) + '% máu', c: '#4ade80' });
    if (o.stun) a.push({ t: 'Choáng ' + Math.round(o.stun * 100) + '%', c: '#fcd34d' });
    if (o.slow) a.push({ t: 'Làm chậm ' + o.slow, c: '#7dd3fc' });
    if (o.pen) a.push({ t: 'Xuyên giáp ' + Math.round(o.pen * 100) + '%', c: '#5eead4' });
    if (o.critBonus) a.push({ t: 'Bạo kích +' + Math.round(o.critBonus * 100) + '%', c: '#fcd34d' });
    if (o.buff && o.buff.dmg) a.push({ t: '+' + Math.round(o.buff.dmg * 100) + '% Sát Thương · ' + o.buff.ticks + ' hiệp', c: '#c084fc' });
    if (o.eleDmg) a.push({ t: '+' + Math.round(o.eleDmg * 100) + '% Sát Thương hệ', c: '#fb7185' });
    if (o.tier === 'tuyệt') a.push({ t: 'Không mua được', c: '#f0abfc' });
    return a;
  },
  // Ước tính sát thương chiêu từ Công thật của nhân vật (chưa trừ thủ địch — bản nền).
  tkChieuDmg(c) {
    const P = this.combatStats; if (!P || !c) return 0;
    let d = P.atk * (c.mult || 0);
    if (c.type && !isVoHe(c.type)) { const eleB = (c.type === P.heChinh ? (P.tamPhapHeBonus || 0) : 0) + ((P.eleBonus && P.eleBonus[c.type]) || 0); d *= (1 + eleB); }
    return Math.max(1, Math.round(d));
  },
  // Các dòng chỉ số trong popup, theo loại võ học (chiêu / tâm pháp / bị động).
  tkRows(it) {
    if (!it) return [];
    const o = this.tkObj(it), rows = [];
    if (it.kind === 'chieu') {
      rows.push({ k: 'Sát Thương', v: '×' + (+o.mult.toFixed(2)) + ' · ≈' + this.fmt(this.tkChieuDmg(o)), hl: true, full: true });
      rows.push({ k: 'Hệ', v: heName(o.type) });
      rows.push({ k: 'Nội Lực tiêu', v: o.nl || 0 });
      rows.push({ k: 'Hồi chiêu', v: o.cd ? (o.cd + ' hiệp') : 'Tức thì' });
      if (o.burn) rows.push({ k: 'Bỏng', v: o.burn.dmg + '/hiệp × ' + o.burn.ticks + ' hiệp' });
      if (o.lifesteal) rows.push({ k: 'Hút máu', v: Math.round(o.lifesteal * 100) + '%' });
      if (o.slow) rows.push({ k: 'Làm chậm', v: o.slow + ' hiệp' });
      if (o.pen) rows.push({ k: 'Xuyên giáp', v: Math.round(o.pen * 100) + '%' });
    } else if (it.kind === 'tamphap') {
      rows.push({ k: 'Đổi hệ', v: heName(o.he) });
      rows.push({ k: 'Tăng Sát Thương hệ', v: '+' + Math.round((o.heBonus || 0) * 100) + '%', hl: true });
      if (o.noiLuc != null) rows.push({ k: 'Nội Lực', v: o.noiLuc });
      if (o.nlRegen != null) rows.push({ k: 'Hồi Nội Lực', v: '+' + o.nlRegen + '/đánh thường' });
    } else {
      // Gộp mọi vế của desc vào MỘT dòng "Hiệu ứng" — trước tách theo '·' nên các vế sau bị NHÃN RỖNG.
      const parts = (o.desc || '').split('·').map((p) => p.trim()).filter(Boolean);
      if (parts.length) rows.push({ k: 'Hiệu ứng', v: parts.join(' · '), hl: true, full: true });
      rows.push({ k: 'Loại', v: 'Bị động · luôn bật', full: true });
    }
    return rows;
  },
  get tkFlavor() { const it = this.tkDetail; if (!it) return ''; const o = it.obj; return o.lore || o.short || ''; },
  get tangKinhOwnedCount() { return this.owned.chieu.length + this.owned.tamPhap.length + this.owned.biDong.length; },
  get tangKinhTotalCount() { return CHIEU.length + TAM_PHAP_POOL.length + BI_DONG.length; },
  // --- Tâm Pháp (nội công nền, ĐỔI được — 5 hệ ngũ hành) ---
  get tamPhapObj() { return tamPhapById(this.loadout.tamPhap); },
  tamPhapModal: false,
  tamPhapOn(id) { return this.loadout.tamPhap === id; },
  switchTamPhap(id) {
    if (!TAM_PHAP_POOL.some(t => t.id === id)) return;
    if (!this.ownsTamPhap(id)) { this.showToast('Chưa lĩnh hội Tâm Pháp này — học ở Tàng Kinh Các trước.'); return; }
    this.state.combat.loadout.tamPhap = id;
    this.afterLoadoutChange();
    this.showToast('Đổi Tâm Pháp: ' + tamPhapById(id).name);
  },
  // --- Popup CHI TIẾT Tâm Pháp khởi tu (màn tạo NV): xem võ học hệ đó trước khi chọn ---
  tpDetail: null,
  closeTpDetail() { this.tpDetail = null; },
  get tpDetailObj() { return this.tpDetail ? tamPhapById(this.tpDetail) : null; },
  heChieu(he) { return CHIEU.filter((c) => c.type === he).sort((a, b) => (TIER_ORDER[a.tier] || 0) - (TIER_ORDER[b.tier] || 0)); },
  heBiDong(he) { return BI_DONG.filter((p) => p.he === he); },
  pickTpFromDetail() { if (this.tpDetail) { this.pickTamPhap(this.tpDetail); this.closeTpDetail(); } },
  // --- Popup Thiết Lập Bài Võ (art-tile): Tâm Pháp + Chiêu Thức ---
  baiVoModal: false,
  baiVoPanel: 'chieu',                 // panel khởi tạo khi mở ('chieu' | 'tamphap')
  openBaiVo(panel) { this.baiVoPanel = ['tamphap', 'bidong'].includes(panel) ? panel : 'chieu'; this.baiVoModal = true; },
  closeBaiVo() { this.baiVoModal = false; this.chieuDragEnd(false); },   // đóng giữa cú kéo -> huỷ sạch, đừng để kẹt
  chieuObj(id) { return chieuOf(this.state, id); },   // LUÔN trả chiêu ĐÃ áp Tầng -> mọi chỗ hiển thị khớp số thật trong trận

  // ============ NGỘ TÍNH / TẦNG CHIÊU THỨC ============
  // Điểm là hàm THUẦN của EXP đã cày: 1 điểm mỗi cấp Chiến Đấu (Lv100 = 99 điểm), cộng addend
  // ngoTinhThuong (chưa dùng). Không lưu "điểm còn lại" -> không lệch, không sửa save ăn gian được.
  TANG_MAX,
  TANG_BANDS,
  get ngoTinhTotal() { return Math.max(0, this.combatLevel - 1) + (this.state.combat.ngoTinhThuong || 0); },
  get ngoTinhUsed() { const t = this.state.combat.tang || {}; let s = 0; for (const k in t) s += Math.max(0, tangClamp(t[k]) - 1); return s; },
  // Dev tool / save nạp ngược có thể khiến đã dùng > tổng: hiện 0 và CHẶN nút, TUYỆT ĐỐI không tự hạ Tầng.
  get ngoTinhLeft() { return Math.max(0, this.ngoTinhTotal - this.ngoTinhUsed); },
  tangOf(id) { return tangClamp((this.state.combat.tang || {})[id] || 1); },
  tangCanhOf(id) { return tangCanh(this.tangOf(id)); },
  tangMulOf(id) { return tangMul(this.tangOf(id)); },
  tangBandDone(id, at) { return this.tangOf(id) >= at; },
  banMenhAnOf(id) { return banMenhAn(chieuById(id)); },
  canThamNgo(id) { return this.ngoTinhLeft > 0 && this.tangOf(id) < TANG_MAX && this.ownsChieu(id); },
  thamNgo(id) {
    if (!this.ownsChieu(id)) { this.showToast('Chưa lĩnh ngộ chiêu này — học hoặc mua trước.'); return; }
    if (this.tangOf(id) >= TANG_MAX) { this.showToast('Chiêu này đã Đại Viên Mãn.'); return; }
    if (this.ngoTinhLeft <= 0) { this.showToast('Đã hết Ngộ Tính — tăng cấp Chiến Đấu để nhận thêm.'); return; }
    this.state.combat.tang[id] = this.tangOf(id) + 1;
    this.afterLoadoutChange();
    const c = chieuById(id), b = tangCanh(this.tangOf(id));
    const moc = TANG_BANDS.find(x => x.at === this.tangOf(id));
    this.showToast(moc ? (c.name + ' — ' + b.name + '! ' + moc.eff) : (c.name + ' lên Tầng ' + this.tangOf(id)));
  },
  tanCong(id) {                                  // hoàn Tầng của MỘT chiêu, miễn phí
    if (this.tangOf(id) <= 1) return;
    this.state.combat.tang[id] = this.tangOf(id) - 1;
    this.afterLoadoutChange();
  },
  tayTuy() {                                     // hoàn TẤT — miễn phí, không giới hạn
    this.state.combat.tang = {};
    this.afterLoadoutChange();
    this.showToast('Tẩy Tủy Phạt Mao — hoàn lại toàn bộ Ngộ Tính.');
  },
  // Trong lúc KÉO, hàng ô render theo THỨ TỰ XEM TRƯỚC: ô đang kéo đã nằm sẵn ở chỗ sắp thả, nên các
  // ô khác TỰ DẠT RA nhường chỗ và người chơi nhìn thấy trước kết quả thay vì phải đoán.
  // Mảng THẬT chỉ đổi lúc thả tay (moveChieu) — buông giữa chừng là mọi thứ về nguyên trạng.
  get equippedChieuObjs() {
    const arr = this.loadout.chieu.map(id => chieuById(id)).filter(Boolean);
    const d = this.chieuDrag;
    if (d.active && d.i != null && d.over != null && d.over !== d.i && d.i < arr.length && d.over < arr.length) {
      const [m] = arr.splice(d.i, 1); arr.splice(d.over, 0, m);
    }
    return arr;
  },
  // Chiêu đang được nhấc — dùng vẽ ảnh bay theo con trỏ. Đọc theo chỉ số THẬT (d.i) nên không
  // phụ thuộc thứ tự xem trước ở trên.
  get chieuDragObj() {
    const d = this.chieuDrag;
    if (!d.active || d.i == null) return null;
    return chieuById(this.loadout.chieu[d.i]) || null;
  },
  chieuEquipped(id) { return this.loadout.chieu.includes(id); },
  // --- Bị Động (pool chọn tối đa 2) ---
  biDongObj(id) { return biDongById(id); },
  get biDongSel() { return normBiDong(this.loadout); },
  get equippedBiDongObjs() { return this.biDongSel.map(id => biDongById(id)).filter(Boolean); },
  biDongOn(id) { return this.biDongSel.includes(id); },
  get maxBiDongSlots() { return 2; },
  toggleBiDong(id) {
    const arr = this.biDongSel.slice(), i = arr.indexOf(id);
    if (i >= 0) arr.splice(i, 1);
    else { if (!this.ownsBiDong(id)) { this.showToast('Chưa lĩnh hội Bị Động này — học ở Tàng Kinh Các trước.'); return; } if (arr.length >= this.maxBiDongSlots) { this.showToast('Tối đa ' + this.maxBiDongSlots + ' Bị Động — bỏ bớt 1 trước.'); return; } arr.push(id); }
    this.state.combat.loadout.biDong = arr;
    this.afterLoadoutChange();
  },
  biDongTags(p) {
    if (!p) return [];
    const t = [];
    if (p.eleDmg) t.push('+' + Math.round(p.eleDmg * 100) + '% Sát Thương chiêu ' + heName(p.he));
    if (p.regen) t.push('Hồi ' + (p.regen * 100) + '% Sinh Lực/giây');
    if (p.mod) { const m = p.mod, lbl = { dmg: 'Công', def: 'Thủ', hp: 'Sinh Lực', spd: 'Tốc', crit: 'Bạo Kích', critDmg: 'Sát Thương Bạo Kích', nl: 'Nội Lực', nlRegen: 'hồi NL', dodge: 'Né' };
      for (const k in m) t.push((m[k] > 0 ? '+' : '') + Math.round(m[k] * 100) + '% ' + (lbl[k] || k)); }
    return t;
  },
  // Mô tả hiệu ứng của 1 chiêu (dùng ở bảng chi tiết)
  chieuTags(c) {
    if (!c) return [];
    const t = [];
    if (c.burn) t.push((c.type === 'moc' ? 'Độc' : 'Bỏng') + ' ' + c.burn.dmg + '/hiệp × ' + c.burn.ticks + ' hiệp');
    if (c.lifesteal) t.push('Hút máu ' + Math.round(c.lifesteal * 100) + '% Sát Thương');
    if (c.heal) t.push('Hồi ' + Math.round(c.heal * 100) + '% Sinh Lực');
    if (c.slow) t.push('Làm chậm địch ' + c.slow + ' hiệp');
    if (c.stun) t.push('Choáng ' + Math.round(c.stun * 100) + '%');
    if (c.pen) t.push('Xuyên ' + Math.round(c.pen * 100) + '% Thủ');
    if (c.critBonus) t.push('+' + Math.round(c.critBonus * 100) + '% Bạo kích');
    if (c.buff) t.push('+' + Math.round(c.buff.dmg * 100) + '% Sát Thương (' + c.buff.ticks + 's)');
    return t;
  },
  // --- Ngũ hành helpers ---
  heName(he) { return heName(he); },
  heInfo(he) { return heInfo(he); },
  // Mã màu HEX theo hệ. NGU_HANH chỉ có class Tailwind (.text) và glowRgb — mà class thì không
  // nhét vào `:style` được, còn `:class` thì không nhận biến CSS. Bảng này là cho đường `:style`.
  _HE_HEX: { kim: '#fde68a', moc: '#6ee7b7', thuy: '#7dd3fc', hoa: '#fdba74', tho: '#fbbf24',
             vohe: '#cbd5e1', vatly: '#cbd5e1', buff: '#c4b5fd' },
  heHex(he) { return this._HE_HEX[he] || '#cbd5e1'; },
  // Kháng NỀN của yêu thú đang chọn (tĩnh, theo dáng quái — 5 hệ bằng nhau nên đọc 1 hệ là đủ).
  // Hệ nó roll mỗi trận còn được cộng thêm KHANG_TU_HE, phần đó không hiện ở đây vì chưa biết trước.
  get combatSelKhangNen() { const e = this.combatSelObj; const k = e && e.khang; return k ? (k.kim || 0) : 0; },
  // Yêu thú đổi hệ NGẪU NHIÊN mỗi trận → cho biết hệ Tâm Pháp của ngươi KHẮC những hệ nào / BỊ hệ nào khắc.
  get myHeMatchup() {
    const my = this.combatStats.heChinh, khac = [], bi = [];
    NGU_HANH_LIST.forEach(h => { const m = nguHanhMod(my, h); if (m > 0) khac.push(h); else if (m < 0) bi.push(h); });
    return { my, khac, bi, khacNames: khac.map(heName).join(' / '), biNames: bi.map(heName).join(' / ') };
  },
  // Câu này ghép SẴN cả con số rồi mới đưa ra ô chữ. Cắt thành "…mất thêm" + <b>20%</b> + "…"
  // thì lớp phủ dịch phải tra ba mảnh rời, mà mảnh rời thì câu nào cũng thành mẫu riêng.
  get loiTuHe() { return `Chiêu cùng ngũ hành với nó bị trừ thêm ${Math.round(KHANG_TU_HE * 100)}% sát thương.`; },

  // --- Số ô kĩ năng mở theo Chiến Đấu Lv (4 ô gồm Tâm Pháp, +1 mỗi 30 cấp) ---
  get maxComboSlots() { return maxComboSlots(this.combatLevel); },
  get maxChieuSlots() { return maxChieuSlots(this.combatLevel); },
  get nextSlotLevel() { return nextSlotLevel(this.combatLevel); },
  get combatSinhLuc() {
    const c = this.state.combat;
    if (c.noiThuong && c.suyYeuUntil) {                   // suy yếu: HP hồi tuyến tính 0 -> đầy trong 60s
      // ⚠⚠ CHỖ NÀY TỪNG NGỐN 14% CPU. `void this._cycleNow` trước đây nằm ở ĐẦU getter, mà rafLoop
      //   bơm `_cycleNow` MỖI KHUNG khi đang đánh ⇒ getter này hỏng mỗi khung ⇒ kéo theo
      //   combatMaxHp -> combatStats -> deriveCombat() -> codexBonus() (duyệt 417 mục Vạn Vật Phổ).
      //   Đo được: 2,39 ms mỗi khung = 143 ms mỗi giây, trong khi cái nhúc nhích ấy CHỈ cần cho
      //   thanh HP lúc Suy Yếu. Nên nó phải nằm TRONG nhánh này, đừng đưa ra ngoài lần nữa.
      void this._cycleNow;
      const frac = Math.max(0, Math.min(1, 1 - (c.suyYeuUntil - now()) / SUY_YEU_MS));
      return Math.round(this.combatMaxHp * frac);
    }
    const s = c.sinhLuc;
    return s == null ? this.combatMaxHp : Math.max(0, Math.min(s, this.combatMaxHp));
  },
  // ⚠ Đọc `combatStats` MỘT lần. Bản cũ `this.combatMaxHp ? this.combatSinhLuc / this.combatMaxHp`
  //   gọi ba lần dẫn xuất chỉ số cho MỘT thanh máu (combatSinhLuc bên trong lại đọc combatMaxHp
  //   lần nữa). Thanh này bám hai chỗ (:class và :style) nên thành SÁU lần — đo được 1,39ms trên
  //   máy bàn, cỡ 7–11ms trên điện thoại, dồn vào đúng khung kết vòng.
  get combatHpPct() {
    const m = this.combatStats.maxHP;
    if (!m) return 0;
    const c = this.state.combat;
    if (c.noiThuong && c.suyYeuUntil) return Math.max(0, Math.min(1, 1 - (c.suyYeuUntil - now()) / SUY_YEU_MS)) * 100;
    const s = c.sinhLuc;
    return (s == null ? m : Math.max(0, Math.min(s, m))) / m * 100;
  },
  get combatNoiThuong() { return this.state.combat.noiThuong; },
  get combatSelObj() { return this.combatSel ? this.ENEMIES[this.combatSel] : null; },
  get boPhapSel() { return normBoPhap(this.loadout); },          // mảng 1-2 id đang chọn
  boPhapOn(id) { return this.boPhapSel.includes(id); },
  get boPhapSelObjs() { return this.boPhapSel.map(id => boPhapById(id)); },
  boPhapModal: false,
  openBoPhap() { this.boPhapModal = true; },
  closeBoPhap() { this.boPhapModal = false; },
  ensureCombat() {
    const list = this.currentLocationEnemies;
    if (!this.combatSel || !list.includes(this.combatSel)) this.combatSel = list[0] || null;
    // Mặc định lấy từ DANH SÁCH ĐANG HIỆN (yeuVuongList đã lọc boss sự kiện đóng) — kẻo chọn trúng boss tàng hình.
    const yvHien = this.yeuVuongList;
    const selDangAn = this.bossSel && YEU_VUONG_BY_ID[this.bossSel] && !yvHien.some((b) => b.id === this.bossSel);
    if (!this.bossSel || !YEU_VUONG_BY_ID[this.bossSel] || selDangAn) { const fb = yvHien.find((b) => this.combatLevel >= b.reqLevel) || yvHien[0] || YEU_VUONG[0]; this.bossSel = fb.id; } // set Yêu Vương mặc định ở đây (bossSelObj giờ THUẦN)
    this.recomputeCombatFc();
  },
  // Popup Suy Tính: bấm vào quái -> chọn + mở bảng chi tiết
  combatModal: false,
  openCombatModal(id) { this.combatSel = id; this.recomputeCombatFc(); this.combatModal = true; },
  closeCombatModal() { this.combatModal = false; },
  // Chọn 1-2 Bộ Pháp: bấm để bật/tắt; tối thiểu 1, tối đa 2.
  toggleBoPhap(id) {
    const arr = this.boPhapSel.slice(), i = arr.indexOf(id);
    if (i >= 0) { if (arr.length <= 1) { this.showToast('Phải giữ ít nhất 1 Bộ Pháp'); return; } arr.splice(i, 1); }
    else { if (arr.length >= 2) { this.showToast('Tối đa 2 Bộ Pháp'); return; } arr.push(id); }
    this.state.combat.loadout.boPhap = arr;
    this.afterLoadoutChange();
  },
  toggleChieu(id) {
    const arr = this.state.combat.loadout.chieu, i = arr.indexOf(id), cap = this.maxChieuSlots;
    if (i >= 0) arr.splice(i, 1);
    else { if (!this.ownsChieu(id)) { this.showToast('Chưa sở hữu chiêu này — học hoặc mua trước.'); return; } if (arr.length >= cap) { this.showToast('Hết ô chiêu (' + cap + '). Mở thêm ô ở Chiến Đấu Lv ' + this.nextSlotLevel + '.'); return; } arr.push(id); }
    this.afterLoadoutChange();
  },
  // Kéo ô chiêu đổi thứ tự ƯU TIÊN (thứ tự mảng = thứ tự engine xét ở _pTurn).
  moveChieu(from, to) {
    const arr = this.state.combat.loadout.chieu;
    if (!Array.isArray(arr)) return;
    from = from | 0; to = to | 0;
    if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return;
    const [m] = arr.splice(from, 1); arr.splice(to, 0, m);
    this.afterLoadoutChange();
  },
  // Kéo ô bằng POINTER EVENTS chứ không phải drag-and-drop HTML5: HTML5 không phát sự kiện trên
  // màn cảm ứng, dùng nó thì tính năng chết câm trên điện thoại. touch-action:none ở tile chặn
  // cuộn trang tranh chấp với cú kéo.
  // pid: BẮT BUỘC bám theo đúng ngón đã bắt đầu cú kéo. Không có nó thì ngón thứ hai chạm nhầm ô
  // khác sẽ ghi đè trạng thái, và cú kéo của ngón thứ nhất đi sắp lại ô của ngón thứ hai.
  // gx/gy = toạ độ con trỏ hiện tại, để vẽ ảnh ô bay theo tay.
  chieuDrag: { i: null, over: null, active: false, x: 0, y: 0, gx: 0, gy: 0, pid: null, t: 0 },
  _cdNet: null,
  chieuDragStart(i, ev) {
    if (ev.button != null && ev.button > 0) return;               // chỉ nút chuột trái / chạm
    // Đã có cú kéo đang chạy -> bỏ qua ngón mới. Nhưng nếu cú kéo đó quá cũ thì nó là RÁC kẹt lại
    // (mất pointerup vì lý do nào đó) — phải cho ngón mới giành quyền, không thì kéo thả chết hẳn.
    // 1,2s thay vì 10s: ngưỡng này CHỈ chặn ngón thứ hai (một ngón không thể pointerdown hai lần),
    // mà ngón thứ hai đã bị `pid` lọc rồi. Để 10s nghĩa là hễ một cú kéo kẹt là người chơi bấm gì
    // cũng trơ suốt 10 giây — đúng triệu chứng "kéo không được" mà không hiểu vì sao.
    if (this.chieuDrag.i != null && Date.now() - (this.chieuDrag.t || 0) < 1200) return;
    this.chieuDrag = { i, over: i, active: false, x: ev.clientX, y: ev.clientY, gx: ev.clientX, gy: ev.clientY, pid: ev.pointerId, t: Date.now() };
    try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) { /* trình duyệt cũ: bỏ qua */ }
    this._chieuDragNet(true);
  },
  // LƯỚI AN TOÀN. pointerup/pointercancel có thể KHÔNG BAO GIỜ tới đúng ô: Alpine gỡ node khi sắp lại,
  // modal đóng giữa cú kéo, ngón nhả ngoài khung. Thiếu nó thì chieuDrag kẹt và kéo thả chết tới khi
  // tải lại trang. Nghe ở pha NỔI BỌT để handler của ô luôn chạy trước (nó mới là chỗ mở popup).
  _chieuDragNet(on) {
    if (on) {
      if (this._cdNet) return;
      this._cdNet = { up: (e) => this.chieuDragEnd(true, e), cancel: (e) => this.chieuDragEnd(false, e) };
      window.addEventListener('pointerup', this._cdNet.up);
      window.addEventListener('pointercancel', this._cdNet.cancel);
    } else if (this._cdNet) {
      window.removeEventListener('pointerup', this._cdNet.up);
      window.removeEventListener('pointercancel', this._cdNet.cancel);
      this._cdNet = null;
    }
  },
  chieuDragMove(ev) {
    const d = this.chieuDrag;
    if (d.i == null || (d.pid != null && ev.pointerId !== d.pid)) return;
    // Chưa vượt ngưỡng rung tay -> vẫn tính là cú BẤM (mở popup), không phải cú kéo.
    d.gx = ev.clientX; d.gy = ev.clientY;                   // ảnh bay theo tay
    if (!d.active && Math.abs(ev.clientX - d.x) + Math.abs(ev.clientY - d.y) < 6) return;
    d.active = true;
    // Ô đích = ô GẦN CON TRỎ NHẤT, KHÔNG phải ô nằm đúng dưới con trỏ.
    // Cách cũ (elementFromPoint + closest) hỏng ở hai chỗ người chơi gặp liên tục:
    //   · con trỏ đi qua KHE HỞ giữa hai ô -> không trúng ô nào -> code cũ tụt `over` về chính ô nguồn,
    //     nên thả tay ngay trên khe là KHÔNG ĐỔI GÌ (đúng cảm giác "kéo không được").
    //   · con trỏ ra ngoài hàng một chút (kéo hơi cao/thấp) -> cũng mất đích y hệt.
    // Đo khoảng cách tới TÂM từng ô thì luôn có đúng một ô thắng, kéo tha hồ lệch vẫn bắt đúng.
    let best = d.over, bestD = Infinity;
    document.querySelectorAll('[data-ci]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width) return;                                   // ô đang ẩn -> bỏ qua
      const dx = ev.clientX - (r.left + r.width / 2), dy = ev.clientY - (r.top + r.height / 2);
      const dist = dx * dx + dy * dy;
      if (dist < bestD) { bestD = dist; best = el.dataset.ci | 0; }
    });
    d.over = best;
  },
  // commit=false (pointercancel: hệ điều hành cướp cử chỉ) -> HUỶ, tuyệt đối không sắp lại:
  //   người chơi không hề thả tay xác nhận, mà đảo ô là đổi thật thứ tự tung chiêu.
  // Trả true = đã kéo (nơi gọi ĐỪNG mở popup) · false = chỉ là cú bấm.
  chieuDragEnd(commit, ev) {
    const d = this.chieuDrag;
    if (d.i == null) return false;                                    // không có cú kéo -> nơi gọi cứ mở popup
    if (ev && d.pid != null && ev.pointerId !== d.pid) return true;    // ngón khác nhả -> nuốt, đừng mở popup
    const wasDrag = d.active, from = d.i, to = d.over;
    this.chieuDrag = { i: null, over: null, active: false, x: 0, y: 0, gx: 0, gy: 0, pid: null, t: 0 };
    this._chieuDragNet(false);
    if (!wasDrag) return false;
    if (commit !== false && from != null && to != null && to !== from) this.moveChieu(from, to);
    return true;
  },
  recomputeCombatFc() {
    const o = {};
    for (const id of this.currentLocationEnemies) o[id] = combatProfile(this.state, this.loadout, this.ENEMIES[id]);
    this.combatFc = o;
  },
  // LỐI VÀO DUY NHẤT sau khi ĐỔI BÀI VÕ. Tách khỏi recomputeCombatFc vì hàm đó còn được gọi từ
  // ensureCombat (mỗi lần mở tab Chiến Đấu) và openCombatModal (mỗi lần bấm xem một con quái) —
  // hai chỗ KHÔNG đổi gì cả. combatProfile là hàm NGẪU NHIÊN (simFight roll bạo kích/né), nên nếu
  // nhét refreshActivityProfile vào đó thì chỉ bấm qua lại màn hình cũng roll lại máu mất mỗi con
  // của phiên đang cày: người chơi mở/đóng Suy Tính tới khi ra số đẹp là ăn gian được, mà lỡ ăn
  // phải roll xấu thì gục giữa phiên dù không đụng vào gì.
  afterLoadoutChange() {
    this.recomputeCombatFc();
    this.refreshActivityProfile();
    Storage.save(this.state);
  },
  // Bài võ đổi GIỮA phiên cày: activity.hpLostPerKill chỉ được chụp MỘT LẦN lúc startCombat
  // (activity.js:169) còn vòng cày đọc act.hpLostPerKill, nên không cập nhật ở đây thì đổi bài võ xong
  // máu mất mỗi con vẫn y nguyên tới khi người chơi tự dừng rồi cày lại — trông như tính năng vô dụng.
  // Chiều ngược lại nguy hơn: đổi sang bài yếu vẫn sống bằng số cũ, tới lúc cày lại mới lăn ra gục.
  refreshActivityProfile() {
    const a = this.state.activity;
    if (!a || a.type !== 'combat') return;
    const e = this.ENEMIES[a.enemyId]; if (!e) return;
    const pf = combatProfile(this.state, this.loadout, e);
    a.hpLostPerKill = pf.hpLostPerKill;
    a.maxHP = pf.maxHP;
  },
  // Thu nhỏ panel Bài Võ (khi không chỉnh loadout) -> thanh Yêu Thú nhảy lên. Persist ở settings.
  get baiVoCollapsed() { return !!(this.state.settings && this.state.settings.baiVoCollapsed); },
  toggleBaiVo() { if (!this.state.settings) this.state.settings = {}; this.state.settings.baiVoCollapsed = !this.state.settings.baiVoCollapsed; Storage.save(this.state); },
  combatChieuDmg(c) {
    const e = this.combatSelObj; if (!e || c.type === 'buff') return 0;
    const P = this.combatStats; let d = P.atk * c.mult;
    // Hệ địch ngẫu nhiên mỗi trận → preview là ST NỀN (chưa tính khắc/kháng, sẽ ±30/20% tuỳ trận).
    if (!isVoHe(c.type)) { const eleB = (c.type === P.heChinh ? P.tamPhapHeBonus : 0) + ((P.eleBonus && P.eleBonus[c.type]) || 0); d *= (1 + eleB); }
    const defEff = Math.max(0, e.def * (1 - (c.pen || 0)));
    d *= 100 / (100 + defEff);
    return Math.max(1, Math.round(d));
  },
  fight(id) {
    if (this.combatNoiThuong) { this.showToast('Đang suy yếu — chờ hồi phục đầy Sinh Lực.'); return; }
    const prev = this.buildCombatSummary('manual');   // đang đánh dở con khác -> chốt phiên cũ vào chuông (không mất dấu)
    if (startCombat(this.state, id, now())) { if (prev) this.pushCombatSummaryNotif(prev); this.chienBao = []; this._cycleStart = 0; this._cycleNow = now(); this._nlNow = null; this._roundNo = 0; Storage.save(this.state); }
    else { const e = this.ENEMIES[id]; if (e && this.combatLevel < (e.reqLevel || 0)) this.showToast('Cần Chiến Đấu Lv ' + e.reqLevel + ' để khiêu chiến. ' + e.name + ' — luyện yêu thú cấp thấp hơn trước.'); else this.showToast('Chưa thể khiêu chiến lúc này.'); }
  },
  // Suy yếu: số giây hồi phục còn lại (banner đếm ngược). HP% lấy từ combatHpPct.
  get suyYeuRemainSec() { void this._cycleNow; const u = this.state.combat.suyYeuUntil; return u ? Math.max(0, Math.ceil((u - now()) / 1000)) : 0; },
  recoverFromSuyYeu() { this.state.combat.noiThuong = false; this.state.combat.sinhLuc = null; this.state.combat.noiLuc = null; this.state.combat.suyYeuUntil = 0; Storage.save(this.state); this.showToast('Vết thương đã lành — Sinh Lực hồi đầy, có thể chiến đấu tiếp.'); },
  // --- Chiến báo theo CHU KỲ (mỗi vòng 8s = 1 trận; hết vòng mới hiện trọn chiến báo + kết quả) ---
  chienBao: [],             // mảng các BLOCK trận: { no, html, won, he } — html đã gộp sẵn, xem resolveCycle
  _cycleStart: 0,           // mốc bắt đầu vòng hiện tại (0 = chưa chạy; vòng đầu chỉ ra sau khi đếm đủ 8s)
  _cycleNow: 0,             // nhịp thời gian (rafLoop cập nhật) -> thanh tiến độ vòng phản ứng
  _nlNow: null,             // Nội Lực sau trận gần nhất (đồng bộ với log)
  _roundNo: 0,              // số thứ tự vòng giao chiến (đánh số vào chiến báo)
  get combatMaxNL() { return Math.round(this.combatStats.maxNL); },
  get combatNoiLucNow() { const v = this.state.combat.noiLuc; return v == null ? this.combatMaxNL : Math.max(0, Math.min(Math.round(v), this.combatMaxNL)); },
  // ⚠ Cùng bẫy như combatHpPct: đọc bộ chỉ số MỘT lần thay vì ba.
  get combatNoiLucPct() {
    const m = Math.round(this.combatStats.maxNL);
    if (!m) return 0;
    const v = this.state.combat.noiLuc;
    return (v == null ? m : Math.max(0, Math.min(Math.round(v), m))) / m * 100;
  },
  get cycleProgressPct() { if (!this.actIsCombat || !this._cycleStart) return 0; return Math.max(0, Math.min(100, (this._cycleNow - this._cycleStart) / CYCLE_MS * 100)); },
  get cycleRemainSec() { if (!this.actIsCombat || !this._cycleStart) return Math.ceil(CYCLE_MS / 1000); return Math.max(0, Math.ceil((CYCLE_MS - (this._cycleNow - this._cycleStart)) / 1000)); },
  // Giải quyết TRỌN 1 trận trong tích tắc, dồn chiến báo + kết quả thành 1 block hiện cùng lúc
  resolveCycle() {
    if (!this.actIsCombat || this.combatNoiThuong) return;
    const enemy = this.ENEMIES[this.act.enemyId]; if (!enemy) return;
    // ⚠ Lấy bộ chỉ số RA MỘT LẦN rồi dùng lại. `combatStats` là getter KHÔNG có bộ nhớ đệm, mỗi
    //   lượt đọc là một lần `deriveCombat` đầy đủ (đo được 202 µs qua proxy). Bản cũ đọc qua
    //   `combatMaxHp` · `combatMaxNL` · `combatSinhLuc` · `combatStats` là bốn lần dẫn xuất
    //   trong cùng một khung — mà khung này vốn đã là khung nặng nhất của cả trận.
    const cs = this.combatStats;
    const maxHP = cs.maxHP;
    autoEatTick(this.state, maxHP);                       // tự dùng Món Ăn / Đan hồi máu khi Sinh Lực < 25%
    const maxNL = Math.round(cs.maxNL);                   // Nội Lực trôi qua các trận + tự dùng đan hồi Nội Lực < 25%
    let nl = this.state.combat.noiLuc == null ? maxNL : this.state.combat.noiLuc;
    const rNL = autoDanNL(this.state, maxNL, nl); if (rNL) nl = Math.min(maxNL, nl + rNL);
    const sl0 = this.state.combat.sinhLuc;
    const hp0 = sl0 == null ? maxHP : Math.max(0, Math.min(sl0, maxHP));   // máu trước trận (cho Linh Thú chia lửa)
    const f = makeFight(cs, this.loadout.chieu, enemy, hp0, null, nl, rngHam(this.state, 'tranTaiCho'));
    let g = 0; while (!f.over && g < 400) { stepFight(f); g++; }
    this.state.combat.noiLuc = Math.round(f.p.nl);        // lưu Nội Lực còn lại (trôi sang trận sau)
    this._nlNow = this.state.combat.noiLuc;               // đồng bộ thanh Nội Lực với log
    this._roundNo = (this._roundNo || 0) + 1;             // đánh số vòng
    const dong = f.log.slice();
    if (f.result === 'win') {
      this.awardKill(f, cs);                                // đã lưu state.combat.sinhLuc = HP còn lại
      const dmg = Math.max(0, hp0 - this.state.combat.sinhLuc);
      const pc = petCombatCycle(this.state, dmg, now());    // Linh Thú: chia lửa + bị động + chủ động
      const add = (pc.absorb || 0) + (pc.heal || 0);
      if (add > 0) this.state.combat.sinhLuc = Math.min(maxHP, this.state.combat.sinhLuc + add);
      if (pc.skill) {                                       // tuyệt kĩ phát -> dòng riêng trong chiến báo
        const pn = this.petName(this.activePetObj);
        let h = '<span class="text-jade">✦</span> ' + pn + ' thi triển 〈' + pc.skill.name + '〉, giáng <b class="dmg">' + this.fmt(pc.skill.dmg) + '</b> sát thương phụ trợ';
        if (pc.skill.heal > 0) h += ', hồi <span class="text-jade">' + this.fmt(pc.skill.heal) + '</span> sinh lực cho chủ';
        dong.push({ h: h + '.', c: 'text-jade' });
      }
    } else this.combatDeath();
    // ⚠ Gộp cả khối thành MỘT chuỗi HTML rồi mới đưa vào mảng. Bản cũ để template chạy
    //   `x-for` từng dòng với `x-html` ⇒ mỗi vòng đánh là ~20 lần phân tích HTML + ~40 hiệu ứng
    //   Alpine mới, dồn hết vào đúng cái khung kết vòng (đo trên máy user: khung 49,4ms).
    //   Mấy dòng này BẤT BIẾN sau khi tạo nên gộp sẵn là an toàn.
    let html = '';
    for (let i = 0; i < dong.length; i++) html += '<div class="mb-0.5 ' + (dong[i].c || '') + '">' + dong[i].h + '</div>';
    // ⚠ CẮT TẠI CHỖ bằng splice, đừng gán mảng mới: gán mảng mới bắt Alpine dựng lại cả 12 khối.
    this.chienBao.unshift({ no: this._roundNo, html: html, won: f.result === 'win', he: f.eHe });
    if (this.chienBao.length > 12) this.chienBao.splice(12);
    // ⚠ Đặt scrollTop là ÉP trình duyệt tính lại bố cục NGAY, mà lúc này Alpine còn đang thay
    //   nội dung hộp ⇒ tính bố cục hai lần trong một khung. Dời sang khung sau.
    requestAnimationFrame(function () { const box = document.getElementById('chienBaoBox'); if (box) box.scrollTop = 0; });
  },
  awardKill(f, cs) {
    const e = this.ENEMIES[this.act.enemyId]; if (!e) return;
    const sess = this.act.sess || (this.act.sess = { xp: 0, bac: 0, win: 0, lose: 0, loot: {}, gear: [], gearN: 0 });   // thu hoạch phiên (save cũ giữa trận -> tự vá)
    // Nhân thưởng PHẢI khớp từng vế với nhánh treo máy (engine/activity.js) — nếu không, uống đan
    // bổ trợ rồi NGỒI XEM tab Chiến Đấu thì đan trơ, mà alt-tab đi thì đan ăn. Ba vế đan (Ngộ Đạo
    // cbExpPct · Bách Bảo bacPct · Bách Bảo lootPct) trước đây thiếu ở đây nên chỉ chạy khi offline.
    const _now = Date.now();
    // ⚠ Truyền sẵn bộ chỉ số (deriveCombat có phơi `tangExp` ở votong.js:568) — không truyền thì
    //   `combatExpMult` chạy THÊM một lần `derivedStats` đầy đủ chỉ để lấy đúng con số ấy,
    //   ngay trong cái khung nặng nhất của trận.
    const mult = skillExpMultiplier(this.state, 'chienDau') * (1 + buffVal(this.state, 'cbExpPct', _now) / 100) * combatExpMult(this.state, cs);
    const xpGain = Math.max(1, Math.round(e.exp * mult));
    addSkillXp(this.state, 'chienDau', xpGain);
    sess.xp += xpGain; sess.win += 1;
    const rp = gainPetXp(this.state, Math.round(xpGain * 0.5));   // Linh Thú đang mang ăn 50% EXP/trận (+ Hiếu Học)
    if (rp && rp.leveled) this.showToast(this.petName(rp.pet) + ' lên Cảnh Lv ' + rp.pet.level + '.');
    for (const st of boPhapStats(this.loadout)) addStatXp(this.state, st, e.statXp);
    const _tb = titleBonus(this.state);                                       // Danh Hiệu: +Bạc/+rơi đồ nhẹ
    // ⚠ Khớp TỪNG VẾ với nhánh treo máy ở engine/activity.js — lệch một vế là cùng con quái mà
    // hai đường cho ra hai số khác nhau, hoặc kĩ năng bang trơ ở một bên.
    const _bg = bangKyNangBonus(this.state);                                  // Kĩ năng bang: Tham Tài / Lùng Sục
    const moneyMul = 1 + activeAwkVal(this.state, 'moneyBonus') + _tb.bacPct + _bg.bacPct + buffVal(this.state, 'bacPct', _now) / 100;  // P7 — Tham Tài (+ họ Bách Bảo)
    const lootMul = 1 + activeAwkVal(this.state, 'lootBonus') + _tb.dropPct + _bg.dropPct;   // P7 — Lùng Sục
    // Bách Bảo lootPct CHỈ nhân loot nguyên liệu thường (matMul), TUYỆT ĐỐI không đụng
    // MONSTER_DROP_CHANCE (gear 0,3%) — y hệt luật ở activity.js.
    const matMul = lootMul * (1 + buffVal(this.state, 'lootPct', _now) / 100);
    if (e.loot) for (const l of e.loot) { const m = l.noBoost ? lootMul : matMul; if (rng(this.state, 'ropVat') < l.chance * m * LOOT_DROP_MULT) { addItem(this.state, l.itemId, 1); sess.loot[l.itemId] = (sess.loot[l.itemId] || 0) + 1; } }
    // Loot-hunt: rơi gear instance (tỉ lệ rất nhỏ × lootMul; phẩm cao siêu hiếm, cap Cực Hiếm ở quái thường).
    if (rng(this.state, 'ropDo') < MONSTER_DROP_CHANCE * lootMul) { const gi = rollMonsterDrop(e.reqLevel || 1, rngHam(this.state, 'ropDo')); if (gi) { addGearInstance(this.state, gi); this.notifyGearDrop(gi); sess.gearN = (sess.gearN || 0) + 1; if ((sess.gear || (sess.gear = [])).length < 12) sess.gear.push({ gearId: gi.gearId, quality: gi.quality, uid: gi.uid }); } }
    // ⛔ Mảnh Trang Bị Hoàng Kim KHÔNG còn rơi từ quái (user chốt 2026-08-03) — gỡ Ở CẢ HAI ĐƯỜNG
    // (đây là đường đánh tại chỗ, đường treo máy ở engine/activity.js). Sót một vế là hai lối cày
    // ra hai tốc độ khác nhau cho cùng một con quái.
    if (rng(this.state, 'ropBac') < BAC_DROP_CHANCE) { const bacGain = Math.round(Math.max(1, Math.round(e.exp * BAC_PER_EXP)) * moneyMul); this.state.currencies.bac = (this.state.currencies.bac || 0) + bacGain; sess.bac += bacGain; }   // Bạc rơi ~15%/kill (không phải mỗi con)
    this.state.counters.kills[this.act.enemyId] = (this.state.counters.kills[this.act.enemyId] || 0) + 1;
    // ⚠ Dùng `now()` (đồng hồ GAME) chứ không phải `_now` (Date.now) — bên engine ghi bằng đồng hồ
    // game, lấy hai đồng hồ khác nhau là tua giờ ở Bảng Dev sẽ ghi vào hai NGÀY khác nhau.
    ghiNhatKyNgay(this.state, now(), { kill: 1, exp: xpGain });   // đường ĐÁNH TẠI CHỖ — vế kia ở engine/activity.js
    // BANG PHÁI — Chinh Phạt: hạ quái ở vùng nào thì sinh điểm cho bang ở ĐÚNG vùng đó.
    // ⚠ PHẢI khớp từng vế với nhánh treo máy trong engine/activity.js, nếu không thì ngồi xem
    // tab Chiến Đấu và alt-tab đi lại ra hai tốc độ tranh hạng khác nhau cho cùng một con quái.
    try { ghiKillChinhPhat(this.state, this.state.player.location, false, _now); } catch (e) {}
    this.state.combat.sinhLuc = Math.max(0, Math.round(f.p.hp));
    const sk = this.state.skills['chienDau']; if (sk) { sk.gathered = (sk.gathered || 0) + 1; sk.timeMs = (sk.timeMs || 0) + (this.act.cycleMs || 1000); }
    this.act.sessionCount = (this.act.sessionCount || 0) + 1;
  },
  combatDeath() {
    if (this.act) { const _s = this.act.sess || (this.act.sess = { xp: 0, bac: 0, win: 0, lose: 0, loot: {}, gear: [], gearN: 0 }); _s.lose += 1; }   // vòng bại cuối vào thu hoạch phiên (save cũ -> tự vá)
    const sum = this.buildCombatSummary('death');             // chốt tổng kết TRƯỚC khi dừng hoạt động
    this.state.combat.noiThuong = true;
    this.state.combat.sinhLuc = 0;
    this.state.combat.suyYeuUntil = now() + SUY_YEU_MS;   // suy yếu: HP tự hồi đầy trong 60s rồi mới đánh tiếp
    stopActivity(this.state);
    this.bagPeek = false;   // đóng Túi Tạm (phiên đã kết thúc)
    if (sum) { this.pushCombatSummaryNotif(sum); if (sum.kills > 0) this.combatSummary = sum; }
    this.showToast('Trọng Thương! Nhân vật đang Suy Yếu và tự hồi Sinh Lực.');
    Storage.save(this.state);
  },
  // ---------- Tổng Kết Chiến Trận (thu hoạch phiên đánh — modal + chuông) ----------
  buildCombatSummary(reason) {
    const a = this.act;
    if (!a || a.type !== 'combat') return null;
    const s = a.sess || {};
    const e = this.ENEMIES[a.enemyId] || {};
    return {
      reason, enemyId: a.enemyId, enemyName: e.name || 'Yêu thú', zone: (this.currentLocationObj || {}).name || '',
      kills: a.sessionCount || 0, xp: s.xp || 0, bac: s.bac || 0,
      win: s.win || 0, lose: s.lose || 0,
      loot: Object.keys(s.loot || {}).map((id) => ({ id, n: s.loot[id] })),
      gear: (s.gear || []).slice(),
      gearN: s.gearN != null ? s.gearN : (s.gear || []).length,   // đếm ĐỦ trang bị rơi (gear chỉ giữ 12 snapshot đầu)
      durMs: Math.max(0, now() - (a.startedAt || now())),
    };
  },
  closeCombatSummary() { this.combatSummary = null; },
  combatAgain() { const s = this.combatSummary; this.combatSummary = null; if (s && s.enemyId) this.fight(s.enemyId); },
  get combatSummaryItemCount() { const s = this.combatSummary; if (!s) return 0; return s.loot.reduce((a, l) => a + l.n, 0) + (s.gearN != null ? s.gearN : s.gear.length); },
  // ⚠ Tách RIÊNG nguyên liệu và trang bị. Gộp thành một số "N vật phẩm" thì đọc không khớp với
  //   dòng "+N trang bị" ngay bên dưới (một bên đếm cả kho, một bên chỉ đếm trang bị).
  get combatSummaryLootN() { const s = this.combatSummary; return s ? s.loot.reduce((a, l) => a + l.n, 0) : 0; },
  get combatSummaryGearN() { const s = this.combatSummary; if (!s) return 0; return s.gearN != null ? s.gearN : (s.gear || []).length; },
  // Ghi tổng kết vào chuông/Phi Cáp Đài — MỌI đường kết thúc phiên có đánh đấm (dừng tay/gục/đổi vùng).
  pushCombatSummaryNotif(sum) {
    if (!sum || (sum.kills <= 0 && sum.lose <= 0)) return;
    const gn = sum.gearN != null ? sum.gearN : (sum.gear || []).length;
    const items = dropListText(sum.loot, gn);   // liệt kê cụ thể món nhận
    const title = (sum.reason === 'death' ? '💀 Trọng thương — ' : '⚔ Thu quân — ') + sum.enemyName + (sum.zone ? ' @ ' + sum.zone : '');
    const p = ['Hạ ' + this.fmt(sum.kills) + ' con'];
    if (sum.win || sum.lose) p.push('Thắng ' + this.fmt(sum.win) + ' · Bại ' + this.fmt(sum.lose) + ' vòng');
    p.push('+' + this.fmt(sum.xp) + ' EXP · +' + this.fmt(sum.bac) + ' Bạc');
    p.push(items ? 'Nhận: ' + items : 'không rơi vật phẩm');
    if (sum.durMs > 0) p.push('giao chiến ' + this.fmtTime(Math.round(sum.durMs / 1000)));
    pushNotif(this.state, 'chienDau', title, p.join(' · ') + '.', now());
  },
  // Gục khi combat chạy NỀN (đang ở trang khác / tab ẩn): advance trả died+sess -> toast + chuông.
  notifyCombatBgDeath(rep) {
    this.showToast('Trọng Thương! Nhân vật đang Suy Yếu và tự hồi Sinh Lực.');
    this.bagPeek = false;   // đóng Túi Tạm nếu đang mở (phiên nền đã kết thúc)
    if (!rep || !rep.sess) return;
    const s = rep.sess, e = this.ENEMIES[rep.enemyId] || {};
    this.pushCombatSummaryNotif({ reason: 'death', enemyName: e.name || 'Yêu thú', zone: (this.currentLocationObj || {}).name || '', kills: s.win || 0, xp: s.xp || 0, bac: s.bac || 0, win: s.win || 0, lose: s.lose || 0, loot: Object.keys(s.loot || {}).map((id) => ({ id, n: s.loot[id] })), gear: (s.gear || []).slice(), gearN: s.gearN || 0, durMs: 0 });
  },
  // Khay Thu Hoạch (strip trên Chiến Báo) — view chuẩn hoá của act.sess.
  get combatSessView() {
    const a = this.act; if (!a || a.type !== 'combat') return null;
    const s = a.sess || {};
    return {
      kills: a.sessionCount || 0, xp: s.xp || 0, bac: s.bac || 0,
      loot: Object.keys(s.loot || {}).map((id) => ({ id, n: s.loot[id], it: this.ITEMS[id] || {} })),
      gear: (s.gear || []).map((g) => ({ ...g, it: this.ITEMS[g.gearId] || {} })),
      nGear: s.gearN != null ? s.gearN : (s.gear || []).length,
    };
  },

  combatSummary: null,   // modal Tổng Kết Chiến Trận (mở khi dừng tay/gục có thành quả)
  // ---------- Ô Món Ăn + Ô Đan (hệ tự dùng khi tài nguyên < 25%) ----------
  foodPicker: false,
  danPicker: false,
  openFoodPicker() { this.foodPicker = true; },
  closeFoodPicker() { this.foodPicker = false; },
  openDanPicker() { this.danPicker = true; },
  closeDanPicker() { this.danPicker = false; },
  get luongThucItem() { const id = this.state.combat.luongThuc; return id && this.ITEMS[id] ? this.ITEMS[id] : null; },
  get luongThucCount() { const id = this.state.combat.luongThuc; return id ? (this.state.inventory[id] || 0) : 0; },
  get danItem() { const id = this.state.combat.danNL; return id && this.ITEMS[id] ? this.ITEMS[id] : null; },
  get danCount() { const id = this.state.combat.danNL; return id ? (this.state.inventory[id] || 0) : 0; },
  get duocLuItem() { const id = this.state.combat.duocLu; return id && this.ITEMS[id] ? this.ITEMS[id] : null; },
  get duocLuCount() { const id = this.state.combat.duocLu; return id ? (this.state.inventory[id] || 0) : 0; },
  danEffText(it) {
    if (!it) return '';
    if (it.healPct) return 'Hồi ' + it.healPct + '% Sinh Lực';
    if (it.heal) return 'Hồi +' + it.heal + ' Sinh Lực';
    if (it.healNL) return 'Hồi +' + it.healNL + ' Nội Lực';
    if (it.buff) return this.buffEffText(it.buff);
    return '';
  },
  // Ô "Hồi Sinh Lực": nhận CẢ Món Ăn lẫn đan hồi máu (đan hồi máu = món ăn cao cấp).
  get combatFoodList() {
    return Object.keys(this.state.inventory)
      .filter((id) => { const it = this.ITEMS[id]; return it && (it.type === 'monan' || it.type === 'dan') && (it.heal || it.healPct) && this.state.inventory[id] > 0; })
      .map((id) => ({ ...this.ITEMS[id], id, count: this.state.inventory[id] }))
      .sort((a, b) => (a.heal || 0) - (b.heal || 0) || (a.healPct || 0) - (b.healPct || 0));
  },
  get combatDanList() {      // ô "Hồi Nội Lực": chỉ đan healNL
    return Object.keys(this.state.inventory)
      .filter((id) => this.ITEMS[id] && this.ITEMS[id].type === 'dan' && this.ITEMS[id].healNL && this.state.inventory[id] > 0)
      .map((id) => ({ ...this.ITEMS[id], id, count: this.state.inventory[id] }))
      .sort((a, b) => (a.healNL || 0) - (b.healNL || 0));
  },
  get duocLuList() {         // ô "Dược Lư": đan bổ trợ (có .buff)
    return Object.keys(this.state.inventory)
      .filter((id) => this.ITEMS[id] && this.ITEMS[id].buff && this.state.inventory[id] > 0)
      .map((id) => ({ ...this.ITEMS[id], id, count: this.state.inventory[id] }))
      .sort((a, b) => (b.buff.durMs || 0) - (a.buff.durMs || 0));
  },
  equipFood(id) {
    const it = id && this.ITEMS[id];
    if (id && !(it && (it.heal || it.healPct))) { this.showToast('Vật phẩm này không dùng để hồi Sinh Lực.'); return; }
    this.state.combat.luongThuc = id || null;
    this.foodPicker = false;
    Storage.save(this.state);
    if (id) this.showToast('Đã lắp ' + it.name + ' vào ô Hồi Sinh Lực.');
  },
  equipDan(id) {
    if (id && (!this.ITEMS[id] || !this.ITEMS[id].healNL)) { this.showToast('Vật phẩm này không hồi Nội Lực.'); return; }
    this.state.combat.danNL = id || null;
    this.danPicker = false;
    Storage.save(this.state);
    if (id) this.showToast('Đã lắp ' + this.ITEMS[id].name + ' vào ô Hồi Nội Lực.');
  },

  // ---------- ĐAN BỔ TRỢ (buff có hạn giờ) + Dược Lư ----------
  duocLuPicker: false,
  openDuocLuPicker() { this.duocLuPicker = true; },
  closeDuocLuPicker() { this.duocLuPicker = false; },
  equipDuocLu(id) {
    if (id && (!this.ITEMS[id] || !this.ITEMS[id].buff)) { this.showToast('Vật phẩm này không phải Đan Bổ Trợ.'); return; }
    this.state.combat.duocLu = id || null;
    this.duocLuPicker = false;
    Storage.save(this.state);
    if (id) this.showToast('Đã cắm ' + this.ITEMS[id].name + ' vào Dược Lư.');
  },
  buffMinutes(b) { return Math.round((b && b.durMs || 0) / 60000); },
  buffEffText(b) {
    if (!b) return '';
    const p = [];
    if (b.atkPct) p.push('+' + b.atkPct + '% Công Kích · Hộ Thể · Sinh Lực');
    if (b.lootPct) p.push('+' + b.lootPct + '% rơi nguyên liệu · +' + (b.bacPct || 0) + '% Bạc');
    if (b.cbExpPct) p.push('+' + b.cbExpPct + '% Kinh Nghiệm Chiến Đấu');
    if (b.petExpPct) p.push('+' + b.petExpPct + '% Kinh Nghiệm Linh Thú · −' + (b.petStamCutPct || 0) + '% hao Thể Lực');
    return p.join(' · ');   // thời lượng đã có chip riêng — đừng lặp lại trong ngoặc
  },
  get activeBuffs() { void this._tick; return activeBuffList(this.state, now()).map((a) => ({ ...a, item: this.ITEMS[a.itemId], leftMs: Math.max(0, a.untilMs - now()) })); },
  buffLeftText(ms) { const s = Math.max(0, Math.floor(ms / 1000)); const m = Math.floor(s / 60); return m >= 60 ? (Math.floor(m / 60) + 'g' + (m % 60) + 'p') : (m > 0 ? (m + 'p' + (s % 60) + 's') : (s + 's')); },
  uongDan(id) {
    const r = useBuffDan(this.state, id, now());
    this.showToast(r.msg);
    if (r.ok) { this._tick++; Storage.save(this.state); }
  },

  // ---------- PHỤC DỤNG: cho linh thú ăn thẳng linh thảo ----------
  // Đổi hướng chứ KHÔNG tăng tổng: một cây ≈ đúng lượng pet kiếm được trong thời gian đi hái nó.
  phucDungPicker: false,
  openPhucDung() { this.phucDungPicker = true; },
  closePhucDung() { this.phucDungPicker = false; },
  get phucDungList() {
    return Object.keys(this.state.inventory)
      .filter((id) => this.ITEMS[id] && this.ITEMS[id].type === 'thaoDuoc' && this.state.inventory[id] > 0)
      .map((id) => ({ ...this.ITEMS[id], id, count: this.state.inventory[id], ...phucDungGain(id) }))
      .sort((a, b) => (a.stamPct || 0) - (b.stamPct || 0));
  },
  phucDung(id) {
    const r = feedPetHerb(this.state, id, now());
    this.showToast(r.msg);
    if (r.ok) { this._tick++; Storage.save(this.state); }
  },

  // ---------- Phường Thị ----------
  merchantTab: 'avatar',
  setMerchantTab(t) { this.merchantTab = t; },
  buyAvatar(id) {
    if (this.ownsAvatar(id)) return;
    if ((this.state.currencies.honThach || 0) < AVATAR_PRICE) { this.showToast('Không đủ Hồn Thạch (cần ' + this.fmt(AVATAR_PRICE) + ').'); return; }
    this.state.currencies.honThach -= AVATAR_PRICE;
    this.state.player.ownedAvatars.push(id);
    Storage.save(this.state);
    this.showToast('Đã mua Ảnh Đại Diện 〈' + ((this.AVATARS.find((a) => a.id === id) || {}).name || '') + '〉.');
  },
  buyCover(id) {
    if (this.ownsCover(id)) return;
    if ((this.state.currencies.honThach || 0) < COVER_PRICE) { this.showToast('Không đủ Hồn Thạch (cần ' + this.fmt(COVER_PRICE) + ').'); return; }
    this.state.currencies.honThach -= COVER_PRICE;
    this.state.player.ownedCovers.push(id);
    Storage.save(this.state);
    this.showToast('Đã mua Ảnh Bìa 〈' + ((this.COVERS.find((c) => c.id === id) || {}).name || '') + '〉.');
  },
  vatPhamPrice(id) { return Math.ceil((this.ITEMS[id] ? this.ITEMS[id].value : 0) * 1.2); },
  buyVatPham(id, qty) {
    const n = Math.max(1, Math.floor(qty || 1));
    const price = this.vatPhamPrice(id) * n;
    if ((this.state.currencies.bac || 0) < price) { this.showToast('Không đủ Bạc (cần ' + this.fmt(price) + ').'); return; }
    this.state.currencies.bac -= price;
    addItem(this.state, id, n);
    Storage.save(this.state);
    this.showToast('Đã mua ' + (n > 1 ? this.fmt(n) + ' ' : '') + '〈' + ((this.ITEMS[id] || {}).name || '') + '〉.');
  },

  // ---------- Thương Điếm: mua theo SỐ LƯỢNG ----------
  MUA_TRAN: 9999,                 // trần một lần mua — có nhiều Bạc mấy cũng không nhập số vô hạn
  muaModal: null,                 // { id } — món đang chọn mua
  muaQty: 1,
  openMua(id) { if (!this.ITEMS[id]) return; this.muaModal = { id }; this.muaQty = 1; },
  closeMua() { this.muaModal = null; },
  get muaItem() { return this.muaModal ? (this.ITEMS[this.muaModal.id] || null) : null; },
  get muaDonGia() { return this.muaModal ? this.vatPhamPrice(this.muaModal.id) : 0; },
  /** Mua được nhiều nhất bao nhiêu với số Bạc đang có (đã chặn trần). */
  get muaToiDa() {
    const g = this.muaDonGia;
    if (g <= 0) return this.MUA_TRAN;
    return Math.max(0, Math.min(this.MUA_TRAN, Math.floor((this.state.currencies.bac || 0) / g)));
  },
  get muaTong() { return this.muaDonGia * this.muaQty; },
  get muaDuBac() { return this.muaQty > 0 && (this.state.currencies.bac || 0) >= this.muaTong; },
  muaDatQty(n) {
    const tran = Math.max(1, this.muaToiDa);      // hết Bạc thì vẫn cho về 1 để nút tự mờ đi
    this.muaQty = Math.max(1, Math.min(Math.floor(n) || 1, tran));
  },
  /**
   * GÕ THẲNG vào ô số. Khác `muaDatQty` ở chỗ CHO PHÉP RỖNG (qty = 0) — kẹp về 1 ngay
   * mỗi lần gõ thì xoá trắng để nhập số mới là ô nhảy lại '1', không gõ nổi.
   * Chỉ chặn TRẦN, không đôn lên; số 0 thì nút Mua tự mờ (muaDuBac đòi qty > 0).
   */
  muaNhap(v) {
    const s = String(v == null ? '' : v).replace(/[^\d]/g, '');
    if (!s) { this.muaQty = 0; return; }
    this.muaQty = Math.min(parseInt(s, 10), Math.max(1, this.muaToiDa));
  },
  /** Rời ô / bấm Mua: đưa về số hợp lệ để không kẹt ở rỗng. */
  muaChot() { if (!(this.muaQty > 0)) this.muaDatQty(1); },
  muaThemQty(d) { this.muaDatQty(this.muaQty + d); },
  xacNhanMua() {
    if (!this.muaModal || !this.muaDuBac) return;
    this.buyVatPham(this.muaModal.id, this.muaQty);
    this.closeMua();
  },
  /** Trả { n, bac } đã bán được — chỗ gọi cần con số THẬT để báo, đừng tự nhân lại. */
  sellItem(itemId, qty) {
    const have = this.state.inventory[itemId] || 0;
    qty = Math.min(qty, have);
    if (qty <= 0) return { n: 0, bac: 0 };
    const bac = (this.ITEMS[itemId]?.value || 0) * qty;
    this.state.currencies.bac += bac;
    removeItem(this.state, itemId, qty);
    Storage.save(this.state);
    return { n: qty, bac };
  },
  // ---------- Gộp trang bị TRƠN thành một ô có số lượng ----------
  /** Món "trơn" = không có DÒNG CHỈ SỐ nào và chưa cường hoá ⇒ mọi cái giống hệt nhau. */
  gearTron(g) { return !!g && (!g.stats || Object.keys(g.stats).length === 0) && !(g.plus > 0); },
  _khoaTron(g) { return g.gearId + '|' + g.quality + '|' + (g.he || ''); },
  /**
   * Công cụ làm nghề không roll chỉ số nên cả trăm cái Cuốc Thiếc y hệt nhau — để rời ra thì
   * Hành Lý dài cả màn hình và phải bán từng cái một.
   * ⚠ Món CÓ chỉ số thì mỗi cái mỗi khác (dòng phụ roll riêng), KHÔNG được gộp.
   */
  gomGearTron(views) {
    const out = [], map = {};
    for (const v of views) {
      if (!this.gearTron(v)) { out.push(v); continue; }
      const k = this._khoaTron(v);
      if (map[k]) { map[k].qty++; continue; }
      map[k] = { ...v, qty: 1 };
      out.push(map[k]);
    }
    return out;
  },
  /** Mọi uid nằm cùng một chồng trơn với `uid`. Tính lại từ túi, không tin mảng đã dựng. */
  gearStackUids(uid) {
    const bag = this.state.gearBag || [];
    const me = bag.find((g) => g && g.uid === uid);
    if (!me) return [];
    if (!this.gearTron(me)) return [uid];
    const k = this._khoaTron(me);
    return bag.filter((g) => this.gearTron(g) && this._khoaTron(g) === k).map((g) => g.uid);
  },
  /** Số món trong chồng của item đang mở ở popup (1 = không phải chồng). */
  get itemModalStackN() { const r = this.itemModal; return typeof r === 'string' ? this.gearStackUids(r).length : 0; },
  /** Bán `n` món trong chồng trơn. Trả { n, bac } đã bán được. */
  sellGearStack(uid, n) {
    const uids = this.gearStackUids(uid);
    const so = Math.max(1, Math.min(Math.floor(n) || 1, uids.length));
    let bac = 0;
    for (let i = 0; i < so; i++) bac += this.sellGear(uids[i]);
    return { n: so, bac };
  },
  sellGear(uid) {                                  // bán 1 instance gear (theo uid trong túi) -> Bạc thu được
    const inst = removeGearByUid(this.state, uid);
    if (!inst) return 0;
    const bac = (this.ITEMS[inst.gearId] || {}).value || 0;
    this.state.currencies.bac = (this.state.currencies.bac || 0) + bac;
    Storage.save(this.state);
    return bac;
  },
  // Khoe gear rơi — chỉ Hiếm trở lên (tránh spam Thường/Tốt).
  notifyGearDrop(inst) {
    if (!inst) return;
    const rank = this.QUALITY_KEYS.indexOf(inst.quality);
    // Ngưỡng do người chơi đặt (Cài Đặt → Thông Báo). Mặc định 2 = giữ nguyên nếp cũ.
    if (rank < (this.caiDat.nguongBaoRoiDo != null ? this.caiDat.nguongBaoRoiDo : 2)) return;
    const q = this.QUALITY[inst.quality] || {}; const nm = (this.ITEMS[inst.gearId] || {}).name || 'trang bị';
    this.showToast('✦ Rơi ' + (q.name || '') + ' 〈' + nm + '〉 · ' + Object.keys(inst.stats).length + ' dòng!');
  },

  // ---------- Trang Bị ----------
  equipModal: null,
  // View hợp nhất: instance gear + dữ liệu catalog (tên/art/slot...). Dùng cho mọi UI gear. .id = gearId (art/req), .uid = handle.
  gearView(inst) {
    if (!inst) return null;
    const b = this.ITEMS[inst.gearId] || {}; const e = b.equip || {};
    return {
      id: inst.gearId, uid: inst.uid, gearId: inst.gearId, name: b.name, icon: b.icon,
      type: b.type || 'trangbi', value: b.value || 0, quality: inst.quality, stats: inst.stats || {},
      itemLv: inst.itemLv || e.itemLv || 1, reqLevel: inst.reqLevel || e.reqLevel || 1, plus: inst.plus || 0,
      he: inst.he || null, eleDmg: inst.eleDmg || 0, slot: e.slot, weaponType: e.weaponType || null,
      gatherEff: e.gatherEff || 0, gatherSkill: e.gatherSkill || null, rolls: inst.rolls || null,
      setCore: inst.setCore || null,          // dòng cốt Bộ Trang -> tô màu Bạch Kim (xem gearLineColor)
      equip: e, _inst: inst,
    };
  },
  equippedItem(slotId) { return this.gearView(this.state.equipment && this.state.equipment[slotId]); },
  // ---------- Tooltip trang bị (rê chuột trên paper-doll) ----------
  // BẤM ô giờ mở bảng Đổi Trang Bị, nên không còn chỗ nào xem chi tiết món ĐANG MẶC. Tooltip lấp chỗ đó.
  GTIP_HAN: { mu: '冠', giap: '甲', dai: '帶', gang: '手', giay: '履', vuKhi: '兵', nhan: '戒',
              trangSuc: '珮', toaKy: '騎', riu: '斧', cuoc: '鋤', canCau: '釣', duocLiem: '鐮' },
  // THỨ TỰ CỨNG, không theo Object.keys: món nào cũng xếp giống nhau thì mắt quen vị trí, liếc là thấy.
  GTIP_ORDER: ['congKich', 'hoThe', 'sinhLuc', 'tocDo', 'neTranh', 'menhTrung', 'baoKich', 'baoSat',
    'khangKim', 'khangMoc', 'khangThuy', 'khangHoa', 'khangTho', 'khangAll',
    'giamNgat', 'giamCham', 'giamDoc', 'giamBong', 'giamChoang', 'tangCong', 'tangExp'],
  gtipSetName(v) { const k = this._itemSetId(v); return k ? (this.TRANG_SETS[k] || {}).name : null; },   // qua _itemSetId để ăn chốt phẩm chất
  // Màu chủ đạo của tooltip. Đồ Bộ Trang phải ra BẠCH KIM cho khớp nhãn "Bạch Kim" mà itemQuality
  // đã override — dùng thẳng QHEX thì đồ bộ (phẩm Cô Bản) ra VÀNG, chữ nói một đằng viền một nẻo.
  // itemHaloHex trả null với đồ dưới bậc 5 nên bắt buộc có đường lui, không thì tooltip mất viền.
  gtipHex(x) { return this.itemHaloHex(x) || this.QHEX[this._qKey(x)] || '#cbd5e1'; },
  // Vị trí tooltip HÀNG DƯỚI. Hàng này là flex-wrap nên không neo theo từng ô được (xuống 2 hàng là
  // mọi luật theo chỉ số sai hết) — nhưng neo cứng vào mép hàng thì món nào cũng hiện một chỗ.
  // Nên: một tooltip dùng chung, mỗi lần rê thì TÍNH lại toạ độ theo đúng ô đang rê.
  //   x = giữa ô − nửa bề rộng tooltip, rồi KẸP trong lòng hàng để không lòi ra ngoài khung.
  //   y đo từ ĐÁY hàng lên, nhờ vậy hàng có wrap xuống dòng thì tooltip vẫn nằm ngay trên đúng ô đó.
  //   mui = tâm ô so với mép trái tooltip, để mũi nhọn luôn chỉ vào ô chứ không lệch đi.
  // CÔNG CỤ (Rìu/Cuốc/Cần Câu/Dược Liêm) khai `stats: {}` RỖNG — sức mạnh của nó nằm ở `gatherEff`.
  // Không bắt riêng thì tooltip công cụ trống trơn, chỉ có mỗi tên với tên ô.
  gtipToolLine(v) {
    if (!v || !v.gatherEff) return null;
    const sk = v.gatherSkill && this.SKILLS[v.gatherSkill];
    return { label: 'Hiệu Suất' + (sk ? ' ' + sk.name : ''), val: '+' + Math.round(v.gatherEff * 100) + '%' };
  },
  GTIP_W: 220,
  gtipRowPos(el) {
    const o = el.parentElement, r = o.parentElement;          // o = .gslot, r = hàng (position:relative)
    const giua = o.offsetLeft + o.offsetWidth / 2;
    const x = Math.max(0, Math.min(giua - this.GTIP_W / 2, r.offsetWidth - this.GTIP_W));
    return { x, y: r.offsetHeight - o.offsetTop + 15, mui: Math.max(10, Math.min(giua - x, this.GTIP_W - 10)) };
  },
  // Tên món BỎ tiền tố tên bộ: "Minh Vương Hộ Tâm Giáp" -> "Hộ Tâm Giáp". Tên bộ đi xuống thẻ riêng,
  // nhờ vậy tên gọn đúng MỘT dòng trong khổ 220px mà vẫn không giấu mất thông tin nào.
  gtipName(v) {
    const bo = this.gtipSetName(v); if (!bo) return v.name;
    const t = bo.replace(/^Bộ /, '');
    return v.name.indexOf(t + ' ') === 0 ? v.name.slice(t.length + 1) : v.name;
  },
  // Các dòng chỉ số đã sắp thứ tự + kèm sẵn nhãn/giá trị/màu bậc roll.
  // statLabel (KHÔNG phải gearStatLabel) vì bảng kia viết tắt 'Công'/'Thủ'/'Né' — phạm luật nhãn đầy đủ.
  gtipLines(v) {
    if (!v || !v.stats) return [];
    const ks = Object.keys(v.stats);
    const seen = {}; const out = [];
    for (const k of this.GTIP_ORDER) if (v.stats[k] != null) { seen[k] = 1; out.push(k); }
    for (const k of ks) if (!seen[k]) out.push(k);            // key lạ rơi xuống cuối, không nuốt mất
    return out.map((k) => ({ key: k, label: this.statLabel(k), val: this.gearVal(k, v.stats[k]), color: this.gearLineColor(v, k) }));
  },
  SK_PHU_KIEN_SLOTS,
  slotName(slotId) {
    const s = [...this.EQUIP_SLOTS, ...this.TOOL_SLOTS, ...SK_PHU_KIEN_SLOTS].find((x) => x.id === slotId);
    return s ? s.name : slotId;
  },
  openEquip(slot) { this.equipModal = { slot }; },
  closeEquip() { this.equipModal = null; },
  equippableForSlot(slot) {
    return (this.state.gearBag || []).map((inst) => this.gearView(inst))
      .filter((v) => v && v.slot === slot)
      .sort((a, b) => this.qualityRank(b) - this.qualityRank(a) || (b.itemLv || 0) - (a.itemLv || 0)); // phẩm cao -> thấp
  },
  // req: nhận view/instance gear (reqLevel+gatherSkill từ chính nó) HOẶC string id (catalog).
  _equipE(x) { if (x && typeof x === 'object') return { reqLevel: x.reqLevel, gatherSkill: x.gatherSkill }; const it = this.ITEMS[x]; return (it && it.equip) || {}; },
  equipReqOf(x) { return this._equipE(x).reqLevel || 0; },                                       // cấp yêu cầu MANG (số)
  // Công cụ (gatherSkill) -> yêu cầu theo cấp NGHỀ tương ứng; còn lại theo Chiến Đấu.
  equipReqCtx(x) {
    const e = this._equipE(x); const req = e.reqLevel || 0;
    if (e.gatherSkill) { const sk = this.SKILLS[e.gatherSkill]; return { req, level: this.skillLevel(e.gatherSkill), label: (sk ? sk.name : 'Nghề') }; }
    return { req, level: this.combatLevel, label: 'Chiến Đấu' };
  },
  canEquip(x) { const c = this.equipReqCtx(x); return c.req <= 1 || c.level >= c.req; },
  equipReqText(x) { const c = this.equipReqCtx(x); return c.label + ' Lv ' + c.req; },           // "Đốn Củi Lv 5" | "Chiến Đấu Lv 10"
  equipCurLevel(x) { return this.equipReqCtx(x).level; },                                         // cấp hiện tại của người chơi theo đúng loại
  // Bản NGẮN cho chỗ chật (đầu popup vật phẩm): trang bị chiến đấu bỏ luôn chữ "Chiến Đấu" vì
  // mọi món đều thế, nhưng CÔNG CỤ thì PHẢI giữ tên nghề — bỏ đi là không biết cần nghề nào.
  equipReqShort(x) { const c = this.equipReqCtx(x); return c.label === 'Chiến Đấu' ? ('Cần Lv ' + c.req) : ('Cần ' + c.label + ' Lv ' + c.req); },
  doEquip(uid) {
    const v = this.gearView(findGear(this.state, uid)); if (!v) return;
    const c = this.equipReqCtx(v);
    if (c.req > 1 && c.level < c.req) { this.showToast('Cần ' + c.label + ' Lv ' + c.req + ' để mang theo. ' + (v.name || 'món này') + '.'); return; }
    if (equipItem(this.state, uid)) Storage.save(this.state);
  },
  doUnequip(slot) { if (unequipItem(this.state, slot)) Storage.save(this.state); },
  // --- Hiển thị chi tiết trang bị (badge ngũ hành + so sánh) ---
  // Nhãn RÚT GỌN (modal Trang Bị + Cường Hóa). Ba bảng nhãn (đây, statLabel, gearStatIcon) đều fallback
  // `|| k` nên thiếu key nào là chỗ đó lòi chữ tiếng Anh 'khangKim' ra UI — phải thêm đủ cả ba.
  gearStatLabel(k) { return ({ congKich: 'Công', hoThe: 'Thủ', neTranh: 'Né', menhTrung: 'Chính Xác', sinhLuc: 'Sinh Lực', baoKich: 'Bạo Kích', baoSat: 'Sát Thương Bạo Kích', tocDo: 'Tốc Độ', khangKim: 'Phòng Thủ Vật Lý', khangMoc: 'Kháng Độc', khangThuy: 'Kháng Băng', khangHoa: 'Kháng Hỏa', khangTho: 'Kháng Lôi', khangAll: 'Kháng Tất Cả',
    giamNgat: 'Thời Gian Phục Hồi', giamCham: 'Giảm Thời Gian Làm Chậm', giamDoc: 'Giảm Thời Gian Trúng Độc', giamBong: 'Giảm Thời Gian Bị Bỏng', giamChoang: 'Giảm Thời Gian Choáng', tangCong: 'Kĩ Năng Vốn Có', tangExp: 'Tăng EXP' })[k] || k; },
  // Dòng chỉ số gear ở popup: tên đầy đủ + giá trị + đơn vị (% cho Bạo Kích / Sát Thương Bạo Kích).
  gearLineText(k, v) { const a = AFFIX[k]; return this.statLabel(k) + ' +' + v + (a && a.fmt === 'pct' ? '%' : ''); },
  gearVal(k, v) { const a = AFFIX[k]; return '+' + v + (a && a.fmt === 'pct' ? '%' : ''); },        // chỉ giá trị (tách khỏi tên cho list dọc)
  // Màu dòng theo BẬC ROLL (% trong [min,max]): Phàm trắng → Lương lam → Thượng chàm → Cực tím → Tuyệt cam.
  // KHÔNG dùng lục/đỏ (để dành cho mũi tên so sánh ▲/▼). Món cũ/migrate (không rolls) = xám trung tính.
  /** Dòng này có phải dòng CỐT của Bộ Trang không (để tô bạch kim + in đậm). */
  gearLineCore(view, k) { return !!(view && view.setCore && view.setCore.indexOf(k) >= 0); },
  gearLineColor(view, k) {
    // Dòng CỐT của Bộ Trang: tô BẠCH KIM, cùng màu với `SET_COLORS` dùng cho hào quang và tên món.
    // ⚠ Không dùng lớp shimmer `.q-set`: nó tô bằng `background-clip:text` nên đuôi chữ `g`
    // ("Kháng", "Công") bị cắt mất — xem gotcha chữ vàng cắt đuôi chữ.
    if (this.gearLineCore(view, k)) return this.SET_COLORS.kimQuang;
    const pct = view && view.rolls && view.rolls[k];
    if (pct == null) return '#94a3b8';   // neutral xám
    if (pct < 0.25) return '#cbd5e1';     // Phàm  - trắng
    if (pct < 0.50) return '#38bdf8';     // Lương - lam
    if (pct < 0.75) return '#818cf8';     // Thượng- chàm/indigo
    if (pct < 0.92) return '#c084fc';     // Cực   - tím
    return '#fb923c';                      // Tuyệt - cam (cam thật, không vàng)
  },
  // Công cụ: dòng "+X% Hiệu Suất <kĩ năng>". Nhận view/instance gear hoặc string id.
  toolEffText(x) {
    const e = (x && typeof x === 'object') ? x.gatherEff : (((this.ITEMS[x] || {}).equip) || {}).gatherEff;
    if (!e) return null;
    const skId = (x && typeof x === 'object') ? x.gatherSkill : (((this.ITEMS[x] || {}).equip) || {}).gatherSkill;
    const sk = skId && this.SKILLS[skId];
    return '+' + Math.round(e * 100) + '% Hiệu Suất' + (sk ? ' ' + sk.name : '');
  },
  gearHe(x) {
    const he = (x && typeof x === 'object') ? x.he : ((((this.ITEMS[x] || {}).equip) || {}).he);
    if (!he) return null;
    const eleDmg = (x && typeof x === 'object') ? (x.eleDmg || 0) : ((((this.ITEMS[x] || {}).equip) || {}).eleDmg || 0);
    return { he, name: heName(he), info: heInfo(he), eleDmg };
  },
  // So sánh chỉ số view/instance gear `x` với món ĐANG mặc cùng slot -> [{key,label,next,cur,delta}]
  gearCompare(x) {
    if (!x || typeof x !== 'object') return [];
    const slot = x.slot || (((this.ITEMS[x.gearId] || {}).equip) || {}).slot;
    const next = x.stats || {};
    const worn = this.state.equipment && this.state.equipment[slot];
    const cur = (worn && worn.stats) || {};
    const keys = [...new Set([...Object.keys(next), ...Object.keys(cur)])];
    return keys.map((k) => ({ key: k, label: this.gearStatLabel(k), next: next[k] || 0, cur: cur[k] || 0, delta: (next[k] || 0) - (cur[k] || 0) }));
  },
  // Icon 5 kháng dùng LẠI icon hệ trong NGU_HANH[he].ig — riêng Hỏa tên icon là 'flame' chứ không phải
  // 'hoa' (SVG_PATHS không có key 'hoa'; svg() trả chuỗi RỖNG khi thiếu key nên sẽ mất icon âm thầm).
  gearStatIcon(k) { return ({ congKich: 'sword', hoThe: 'shield', neTranh: 'steps', menhTrung: 'scope', sinhLuc: 'heart', baoKich: 'star', baoSat: 'flame', tocDo: 'wind', khangKim: 'kim', khangMoc: 'moc', khangThuy: 'thuy', khangHoa: 'flame', khangTho: 'tho', khangAll: 'shield',
    giamNgat: 'crack', giamCham: 'thuy', giamDoc: 'moc', giamBong: 'flame', giamChoang: 'tho', tangCong: 'trend', tangExp: 'book' })[k] || 'zap'; },
  // Tổng chênh stat vs món đang mặc (dùng để xếp hạng "Đề Cử Cho Bạn").
  // CÓ TRỌNG SỐ: cộng thô sẽ so 1 điểm Sinh Lực (bậc 7 roll 236..472) ngang 1 điểm Kháng (roll 10..20),
  // nên món mang kháng gần như KHÔNG BAO GIỜ được đề cử dù kháng đắt hơn nhiều mỗi điểm.
  // Số dưới là quy đổi thô về "điểm Công tương đương", chưa tune kỹ — chỉ để xếp hạng, không vào công thức trận.
  GEAR_W: { sinhLuc: 0.25, khangKim: 6, khangMoc: 6, khangThuy: 6, khangHoa: 6, khangTho: 6, khangAll: 24, tangExp: 12, baoKich: 4, baoSat: 1.5 },
  gearGainTotal(x) { return this.gearCompare(x).reduce((s, c) => s + c.delta * (this.GEAR_W[c.key] || 1), 0); },
  equipFilterBetter: false,                                                                       // checkbox "chỉ hiển thị tốt hơn"
  recommendedForSlot(slot) {                                                                      // món NÂNG CẤP tốt nhất (null nếu không có)
    let best = null, bestScore = 0;
    for (const v of this.equippableForSlot(slot)) { if (!this.canEquip(v)) continue; const s = this.gearGainTotal(v); if (s > bestScore) { bestScore = s; best = v; } } // chỉ đề cử món ĐỦ CẤP mang
    return best;
  },
  othersForSlot(slot) {
    const rec = this.recommendedForSlot(slot);
    let list = this.equippableForSlot(slot).filter((v) => !rec || v.uid !== rec.uid);
    if (this.equipFilterBetter) list = list.filter((v) => this.gearGainTotal(v) > 0);
    return list;
  },

  // ---------- Cường Hóa ----------
  enhanceModal: null,            // { slot }
  enhanceMsg: null,              // kết quả lần cường gần nhất {ok:true,plus} | {ok:false}
  MAX_PLUS,
  itemPlus(x) { return (x && typeof x === 'object') ? (x.plus || 0) : 0; },     // +N (view/instance gear); string -> 0
  openEnhance(slot) { this.equipModal = null; this.enhanceMsg = null; this.enhanceModal = { slot }; },
  closeEnhance() { this.enhanceModal = null; this.enhanceMsg = null; },
  enhanceInst() { return this.enhanceModal && this.state.equipment[this.enhanceModal.slot]; },   // INSTANCE đang cường (để ghi)
  enhanceId() { return this.gearView(this.enhanceInst()); },                                      // VIEW để hiển thị
  enhanceMaxed(x) { return this.itemPlus(x) >= MAX_PLUS; },
  enhanceCan(x) { return canEnhance(this.state, (x && x._inst) ? x._inst : x); },
  // Thông tin yêu cầu lần cường kế tiếp (null nếu đã +15)
  enhanceInfo(x) {
    const step = enhanceStep(this.itemPlus(x));
    if (!step) return null;
    return { ...step, ratePct: Math.round(step.rate * 100),
      stoneName: (this.ITEMS[step.stoneId] || {}).name, stoneHave: this.state.inventory[step.stoneId] || 0,
      honHave: this.state.currencies.honThach || 0,
      crystalName: (this.ITEMS[step.crystalId] || {}).name, crystalHave: this.state.inventory[step.crystalId] || 0,
      stoneOk: (this.state.inventory[step.stoneId] || 0) >= step.stoneQty,
      honOk: (this.state.currencies.honThach || 0) >= step.honThach,
      crystalOk: step.crystalQty <= 0 || (this.state.inventory[step.crystalId] || 0) >= step.crystalQty };
  },
  // Xem trước chỉ số (view gear): cấp hiện tại -> cấp kế (làm tròn)
  enhancePreview(x) {
    if (!x || !x.stats) return [];
    const plus = this.itemPlus(x), curMul = enhanceMul(plus), nxtMul = enhanceMul(plus + 1);
    return Object.keys(x.stats).map((k) => ({ key: k, label: this.gearStatLabel(k), icon: this.gearStatIcon(k),
      cur: Math.round(x.stats[k] * curMul), next: Math.round(x.stats[k] * nxtMul) }));
  },
  doEnhance() {
    const inst = this.enhanceInst(); if (!inst) return;
    const r = tryEnhance(this.state, inst, rng(this.state, 'cuongHoa'));
    if (r.ok) { this.enhanceMsg = r.success ? { ok: true, plus: r.plus } : { ok: false }; Storage.save(this.state); }
  },

  // ---------- Túi đồ ----------
  get inventoryByType() {
    const groups = {};
    for (const id of Object.keys(this.state.inventory)) {
      const qty = this.state.inventory[id];
      const item = this.ITEMS[id];
      if (!qty || !item) continue;
      const t = item.type || 'khac';
      (groups[t] = groups[t] || []).push({ ...item, qty });
    }
    // Gear loot-hunt: instance trong túi -> nhóm "Trang Bị" (phẩm cao -> thấp), món TRƠN gộp lại.
    const gear = this.gomGearTron((this.state.gearBag || []).map((inst) => this.gearView(inst)).filter(Boolean)
      .sort((a, b) => this.qualityRank(b) - this.qualityRank(a) || (b.itemLv || 0) - (a.itemLv || 0)));
    if (gear.length) groups['trangbi'] = (groups['trangbi'] || []).concat(gear);
    return Object.keys(groups).map((t) => ({
      type: t,
      label: this.ITEM_TYPES[t] || 'Khác',
      items: t === 'trangbi' ? groups[t] : groups[t].sort((a, b) => b.qty - a.qty),
    }));
  },

  // ---------- Hành Lý: thanh tab · tab phụ Trang Bị · chọn nhiều món để bán ----------
  // Tab CẤP 1 gom 12 `type` của ITEMS thành 6 nhóm đọc được — cùng cách chia với Minh Khố
  // bên Bang Phái, chỉ tách thêm Trang Bị ra riêng vì nó là nhóm đông nhất.
  // ⚠ Danh sách tab CỐ ĐỊNH, không mọc/rụng theo túi đang có gì: chỗ bấm phải đứng yên
  // giữa hai lần vào, không phụ thuộc dữ liệu.
  hlTab: 'all',
  hlTabTB: 'all',
  hlChon: false,          // đang ở chế độ chọn nhiều món?
  hlSel: {},              // { ref: true } — ref = uid (trang bị) hoặc id (vật phẩm xếp chồng)
  // ⚠ Tab `che` từng tên là "Liệu Đã Luyện" — user đọc không hiểu. Trong đó là Thỏi Kim Loại +
  // gạch/ngói/ván + Đá Cường Hóa + Linh Thạch: đều CHẾ ra và đều dùng để CHẾ tiếp.
  // (Minh Khố bên `src/bangphai.js` dùng chung tên này — đổi thì đổi cả hai.)
  get hlTabs() {
    return [
      { id: 'all', ten: 'Tất Cả' }, { id: 'trangbi', ten: 'Trang Bị' },
      { id: 'tho', ten: 'Nguyên Liệu Thô' }, { id: 'che', ten: 'Vật Liệu Chế Tác' },
      { id: 'dan', ten: 'Đan Dược' }, { id: 'monan', ten: 'Món Ăn' },
      { id: 'doPho', ten: 'Đồ Phổ' }, { id: 'khac', ten: 'Khác' },
    ];
  },
  get hlTabsTB() {
    return [{ id: 'all', ten: 'Tất Cả' }]
      .concat(this.EQUIP_SLOTS.map((s) => ({ id: s.id, ten: s.name })), [{ id: 'congcu', ten: 'Công Cụ' }]);
  },
  // ⚠ Mồi Câu (`moi`) về Khác chứ không đi cùng Đan Dược / Món Ăn: nó không phải thứ để dùng
  // lên người. Trước gộp chung khi hai loại kia còn chung một tab.
  hlNhomCua(t) {
    if (t === 'trangbi') return 'trangbi';
    // Đan Đan Điền đi cùng tab Đan Dược: người chơi tìm một viên đan thì mở tab đan. Để nó rơi về
    // "Khác" là chôn 27 viên lẫn với chiến lợi phẩm. Dòng tiêu đề trong lưới vẫn ghi "Đan Điền".
    if (t === 'dan' || t === 'danDien') return 'dan';
    if (t === 'monan') return 'monan';
    if (t === 'doPho') return 'doPho';
    if (t === 'go' || t === 'khoang' || t === 'ca' || t === 'thaoDuoc') return 'tho';
    if (t === 'dinh' || t === 'vatlieu') return 'che';
    return 'khac';
  },
  // Đổi tab thì XOÁ chỗ đã chọn: bán được gì phải là đúng thứ đang nhìn thấy.
  hlDatTab(id) { if (this.hlTab === id) return; this.hlTab = id; this.hlSel = {}; },
  hlDatTabTB(id) { if (this.hlTabTB === id) return; this.hlTabTB = id; this.hlSel = {}; },
  /** Nhóm đang hiện theo tab. Tab Trang Bị chia theo Ô (Vũ Khí, Mũ, ... , 4 ô công cụ). */
  get hlNhom() {
    const src = this.inventoryByType;
    if (this.hlTab !== 'trangbi') {
      return this.hlTab === 'all' ? src : src.filter((g) => this.hlNhomCua(g.type) === this.hlTab);
    }
    const gear = (src.find((g) => g.type === 'trangbi') || { items: [] }).items;
    const oList = [...this.EQUIP_SLOTS, ...this.TOOL_SLOTS];
    const sub = this.hlTabTB;
    const laCongCu = {}; for (const t of this.TOOL_SLOTS) laCongCu[t.id] = 1;
    // MỘT lượt gom theo ô — lọc 13 lần trên túi 400 món tốn 2ms, chia thùng chỉ còn một vòng.
    const thung = {};
    for (const g of gear) {
      if (sub !== 'all' && (sub === 'congcu' ? !laCongCu[g.slot] : g.slot !== sub)) continue;
      (thung[g.slot] = thung[g.slot] || []).push(g);
    }
    const out = [], daXep = {};
    for (const o of oList) {
      daXep[o.id] = 1;
      const items = thung[o.id];
      if (items && items.length) out.push({ type: 'o_' + o.id, label: o.name, items });
    }
    const le = [];
    for (const k in thung) if (!daXep[k]) le.push(...thung[k]);
    if (le.length) out.push({ type: 'o_khac', label: 'Khác', items: le });
    return out;
  },
  /** Mọi món ĐANG NHÌN THẤY (phẳng) — mọi thao tác chọn/bán chỉ đụng tới đây. */
  get hlHien() { const o = []; for (const g of this.hlNhom) for (const it of g.items) o.push(it); return o; },
  hlRef(it) { return it.uid || it.id; },
  hlBanDuoc(it) { return (it.value || 0) > 0; },     // value 0 = Mảnh / Đồ Phổ Bộ: không bán được
  hlDaChon(it) { return !!this.hlSel[this.hlRef(it)]; },
  hlBatChon() { this.hlChon = !this.hlChon; this.hlSel = {}; },
  hlBam(it) { if (this.hlChon) this.hlDao(it); else this.openItemModal(this.hlRef(it)); },
  hlDao(it) {
    if (!this.hlBanDuoc(it)) return;
    const k = this.hlRef(it);
    if (this.hlSel[k]) delete this.hlSel[k]; else this.hlSel[k] = true;
  },
  hlChonTatCa() { for (const it of this.hlHien) if (this.hlBanDuoc(it)) this.hlSel[this.hlRef(it)] = true; },
  hlBoChon() { this.hlSel = {}; },
  hlSoPham(q) { let n = 0; for (const it of this.hlHien) if (this.hlBanDuoc(it) && this._qKey(it) === q) n++; return n; },
  /** Hàng nút phẩm chất — đếm CẢ BẢY trong MỘT lượt. Bảy nút gọi `hlSoPham` riêng là bảy
   *  lần dựng lại danh sách; x-for trên hàm này chỉ dựng một lần. */
  get hlPhamHang() {
    const dem = {};
    for (const it of this.hlHien) { if (!this.hlBanDuoc(it)) continue; const k = this._qKey(it); dem[k] = (dem[k] || 0) + 1; }
    return this.QUALITY_KEYS.map((q) => ({ q, ten: this.QUALITY[q].name, hex: this.QUALITY[q].hex, co: dem[q] || 0 }));
  },
  /** Bấm một phẩm chất: chưa chọn hết thì chọn hết, đã chọn hết thì bỏ — một nút hai chiều. */
  hlChonPham(q) {
    const ds = this.hlHien.filter((it) => this.hlBanDuoc(it) && this._qKey(it) === q);
    if (!ds.length) return;
    const du = ds.every((it) => this.hlSel[this.hlRef(it)]);
    for (const it of ds) { const k = this.hlRef(it); if (du) delete this.hlSel[k]; else this.hlSel[k] = true; }
  },
  /** o = số ô đã chọn · n = tổng số món (chồng tính đủ) · bac = tiền thu về · quy = món Hiếm trở lên. */
  get hlChonInfo() {
    let o = 0, n = 0, bac = 0, quy = 0;
    for (const it of this.hlHien) {
      if (!this.hlSel[this.hlRef(it)] || !this.hlBanDuoc(it)) continue;
      const q = it.qty || 1;
      o++; n += q; bac += (it.value || 0) * q;
      if (this.qualityRank(it) >= 3) quy += q;
    }
    return { o, n, bac, quy };
  },
  hlBanChon() {
    const ds = this.hlHien.filter((it) => this.hlSel[this.hlRef(it)] && this.hlBanDuoc(it));
    if (!ds.length) return;
    const c = this.hlChonInfo;
    // Món đang treo ở Trưng Bày thì báo trước: bán xong ô trên giá sẽ trống.
    const treo = ds.filter((it) => this.tbDaTreo(it.uid ? 'gear' : 'item', this.hlRef(it))).length;
    const canhBao = [
      c.quy ? ('Trong đó có <b>' + this.fmt(c.quy) + '</b> món phẩm Hiếm trở lên.') : '',
      treo ? ('<b>' + this.fmt(treo) + '</b> món đang treo ở Trưng Bày — bán xong ô trên giá sẽ trống.') : '',
    ].filter(Boolean).join(' ');
    const banThat = () => {
      let n = 0, bac = 0;
      for (const it of ds) {
        const r = it.uid ? this.sellGearStack(it.uid, this.gearStackUids(it.uid).length)
          : this.sellItem(it.id, this.state.inventory[it.id] || 0);
        n += r.n; bac += r.bac;
      }
      this.hlSel = {};
      this.showToast('Đã bán ' + this.fmt(n) + ' món · +' + this.fmt(bac) + ' Bạc');
    };
    // Cài Đặt → Hỏi Xác Nhận. Tắt thì bán thẳng lô TOÀN PHẨM THƯỜNG.
    // ⚠ Lô có món phẩm Hiếm trở lên, hoặc có món đang treo ở Trưng Bày, thì VẪN HỎI — đó là hai
    //   thứ mất đi không lấy lại được. Cài đặt này để bớt phiền, không phải để bỏ phanh.
    if (!this.caiDat.hoiKhiBan && !canhBao) { banThat(); return; }
    this.hoiXacNhan({
      tieuDe: 'Bán Hàng Loạt', nut: 'Bán', nguy: true,
      loi: 'Bán <b class="text-slate-100">' + this.fmt(c.n) + '</b> món · thu về <b class="text-gold">' + this.fmt(c.bac) + '</b> Bạc.',
      canhBao,
      xong: banThat,
    });
  },

  // ---------- Trưng Bày (giá khoe đồ ở Hồ Sơ) ----------
  // BẢY ô cố định. Mỗi ô giữ THAM CHIẾU tới thứ đang có thật, KHÔNG giữ bản sao.
  // Bán món hay thả linh thú thì ô tự trống — giá chỉ khoe thứ còn nằm trong tay.
  // ⚠ Ô là VỊ TRÍ, không phải hàng đợi: gỡ ô số 3 thì ô 4-5-6 đứng yên, không dồn lên.
  TB_O: 7,
  tbSua: false,        // đang ở chế độ Sắp Xếp (bấm ô có món = hạ xuống)
  tbChon: null,        // ô đang mở bảng chọn (null = bảng đóng)
  tbTab: 'gear',       // gear | item | pet
  /** Bảy ô đã giải nghĩa. Ô trỏ tới thứ không còn -> trả về ô TRỐNG (getter không tự ghi state). */
  get trungBayView() {
    const gia = this.state.trungBay || [], out = [];
    for (let i = 0; i < this.TB_O; i++) {
      const o = gia[i]; let e = { i, co: false, k: '', ref: null, obj: null };
      if (o && o.k === 'gear') {
        const g = findGear(this.state, o.ref);
        if (g) e = { i, co: true, k: 'gear', ref: o.ref, obj: this.gearView(g) };
      } else if (o && o.k === 'item') {
        const it = this.ITEMS[o.ref], n = (this.state.inventory || {})[o.ref] || 0;
        if (it && n > 0) e = { i, co: true, k: 'item', ref: o.ref, obj: { ...it, id: o.ref, qty: n } };
      } else if (o && o.k === 'pet') {
        const p = (this.state.pets || []).find((x) => x.id === o.ref);
        if (p) e = { i, co: true, k: 'pet', ref: o.ref, obj: p };
      }
      out.push(e);
    }
    return out;
  },
  get tbSoTreo() { let n = 0; for (const e of this.trungBayView) if (e.co) n++; return n; },
  tbTen(e) { return (!e || !e.co) ? '' : (e.k === 'pet' ? this.petName(e.obj) : (e.obj.name || '')); },
  tbBatSua() { this.tbSua = !this.tbSua; },
  /** Bấm một ô: trống -> mở bảng chọn; có món -> xem chi tiết, hoặc hạ xuống khi đang Sắp Xếp. */
  tbBam(e) {
    if (!e.co) { this.tbMo(e.i); return; }
    if (this.tbSua) { this.tbHa(e.i); return; }
    if (e.k === 'pet') { this.openPetDetail(e.ref); return; }
    this.openItemModal(e.ref);
  },
  tbHa(i) {
    const gia = this.state.trungBay || [];
    const ten = this.tbTen(this.trungBayView[i]);      // ⚠ lấy tên TRƯỚC khi xoá, xoá rồi là mất tên
    gia[i] = null; Storage.save(this.state);
    if (ten) this.showToast('Đã hạ 〈' + ten + '〉 khỏi giá Trưng Bày.');
  },
  tbMo(i) { this.tbChon = i; this.tbTab = 'gear'; },
  tbDong() { this.tbChon = null; },
  get tbChonMo() { return this.tbChon !== null; },      // cờ cho _MODALS (xem chú thích ở đó)
  tbDaTreo(k, ref) { return (this.state.trungBay || []).some((o) => o && o.k === k && o.ref === ref); },
  tbDat(k, ref) {
    const i = this.tbChon; if (i == null) return;
    const gia = this.state.trungBay || [];
    for (let j = 0; j < this.TB_O; j++) if (gia[j] && gia[j].k === k && gia[j].ref === ref) gia[j] = null;   // một thứ chỉ treo một ô
    gia[i] = { k, ref };
    this.tbChon = null; this.tbSua = false; Storage.save(this.state);
    this.showToast('Đã treo 〈' + this.tbTen(this.trungBayView[i]) + '〉 lên giá Trưng Bày.');
  },
  // ---------- Hồ Sơ Công Khai (đợt A2 — khoe giá cho người khác xem) ----------
  // ⚠ Giá trong máy giữ THAM CHIẾU tới đồ của mình; người ngoài không tra ra được. Muốn khoe
  //   thì phải CHỤP LẠI thành dữ liệu tự đứng một mình. Bản chụp có mốc giờ nên người xem biết
  //   nó cũ tới đâu — giá thật đổi mà chưa đồng bộ thì bản khoe vẫn là bản cũ.
  get trungBayChup() {
    return this.trungBayView.filter((o) => o.co).map((o) => {
      if (o.k === 'pet') {
        const p = o.obj;
        return { k: 'pet', ten: this.petName(p), base: p.base, thuc: !!p.evolved, pham: p.quality, cap: p.level || 1 };
      }
      const v = o.obj;
      const c = { k: o.k, id: v.id, ten: v.name, icon: v.icon || '', pham: v.quality };
      if (o.k === 'item') { c.sl = v.qty || 1; return c; }
      c.o = v.slot; c.plus = v.plus || 0; c.capMon = v.itemLv || 1;
      c.chiSo = Object.keys(v.stats || {}).map((k) => ({ ten: this.statLabel(k), v: v.stats[k] }));
      if (v.he) c.he = v.he;
      return c;
    });
  },
  get hoSoCongKhaiData() {
    const t = this.equippedTitleObj;
    return {
      ten: this.state.player.name || 'Vô Danh',
      tong_cap: this.totalLevel | 0,
      chien_dau: this.combatLevel | 0,
      chien_luc: Math.round(this.chienLuc || 0),
      // ⚠ Đẩy `avatarId` (mã ĐÃ GIẢI) chứ KHÔNG phải `state.player.avatar`: trường đó RỖNG khi
      //   người chơi còn dùng ảnh mặc định theo giới tính. Đẩy rỗng thì bên kia không có ảnh mà vẽ.
      avatar: this.avatarId || null,
      danh_hieu: t ? t.name : null,
      trung_bay: this.trungBayChup,
    };
  },
  // Bảng `ho_so_cong_khai` có thể CHƯA được dựng (cần chạy docs/SQL_HO_SO_CONG_KHAI.sql).
  // Thiếu bảng thì nuốt lỗi — đường lưu save KHÔNG được vỡ theo.
  async _dayHoSo() {
    try {
      const r = await cloudPushHoSo(this.hoSoCongKhaiData);
      if (r && r.ok) this.taiNguoiThat(true);      // vừa ghi xong thì đọc lại bảng cho tươi
    } catch (e) { /* chưa dựng bảng — bỏ qua */ }
  },
  khoeLink: '',
  khoeDang: false,
  async layLinkKhoe() {
    if (!this.isLoggedIn) { this.showToast('Phải đăng nhập mới khoe được — giá cất trên cloud.'); return; }
    this.khoeDang = true;
    try {
      await this._dayHoSo();
      const uid = await cloudMyUid();
      if (!uid) { this.showToast('Chưa lấy được mã tài khoản.'); return; }
      const url = location.origin + location.pathname + '?hoso=' + uid;
      this.khoeLink = url;
      try { await navigator.clipboard.writeText(url); this.showToast('Đã chép đường dẫn — gửi cho ai cũng xem được giá của bạn.'); }
      catch (e) { this.showToast('Không thể tự sao chép. Đường dẫn đã hiện ngay bên dưới giá, bạn hãy sao chép thủ công.'); }
    } catch (e) { this.showToast('Chưa khoe được — kiểm tra kết nối.'); }
    finally { this.khoeDang = false; }
  },
  // ---- Xem hồ sơ NGƯỜI KHÁC (mở từ đường dẫn ?hoso=...) ----
  hoSoKhach: null, hoSoKhachTai: false, hoSoKhachLoi: '',
  async xemHoSoKhach(uid) {
    this.hoSoKhach = null; this.hoSoKhachLoi = ''; this.hoSoKhachTai = true;
    try {
      const r = await cloudLoadHoSo(uid);
      if (!r.ok) this.hoSoKhachLoi = 'Không đọc được hồ sơ.';
      else if (!r.row) this.hoSoKhachLoi = 'Người này chưa khoe gì cả.';
      else this.hoSoKhach = r.row;
    } catch (e) { this.hoSoKhachLoi = 'Không kết nối được.'; }
    finally { this.hoSoKhachTai = false; }
  },
  dongHoSoKhach() {
    this.hoSoKhach = null; this.hoSoKhachLoi = ''; this.hoSoKhachTai = false;
    // Gỡ ?hoso= khỏi thanh địa chỉ, không thì F5 lại mở đúng hồ sơ đó mãi.
    try { const u = new URL(location.href); u.searchParams.delete('hoso'); history.replaceState(null, '', u.pathname + u.search + u.hash); } catch (e) {}
  },
  get hoSoKhachMo() { return !!(this.hoSoKhach || this.hoSoKhachTai || this.hoSoKhachLoi); },
  /** Có ?hoso= trên URL thì mở luôn hồ sơ người đó — gọi một lần lúc khởi động. */
  initHoSoKhach() {
    try {
      const uid = new URL(location.href).searchParams.get('hoso');
      if (uid) this.xemHoSoKhach(uid);
    } catch (e) {}
  },
  hsAnhThu(c) { const f = 'pet_' + c.base + '_' + (c.thuc ? 'awk' : 'base'); return `<img src="images/pets/${f}.webp" class="w-full h-full object-contain" alt="" onerror='if(this.src.endsWith(&quot;.webp&quot;)){this.src="images/pets/${f}.png";}else{this.remove();}'>`; },

  // ---- NGƯỜI CHƠI THẬT trên Phong Vân Bảng ----
  // ⚠ Trước đây bảng ghép 200 bot với DUY NHẤT bản thân mình. Hai tài khoản thấy chung một
  //   giang hồ nhưng KHÔNG thấy nhau. Nay đọc thêm bảng `ho_so_cong_khai`.
  // ⚠ Không đọc mỗi nhịp vẽ — đó là gọi mạng. Đọc theo hẹn giờ, còn bảng thì đọc bản đã nhớ.
  nguoiThat: [], _ntLucTai: 0, _ntDangTai: false,
  NT_NGUOI_MOI_MS: 60000,
  async taiNguoiThat(ep) {
    if (this._ntDangTai) return;
    if (!ep && now() - this._ntLucTai < this.NT_NGUOI_MOI_MS) return;
    this._ntDangTai = true;
    try {
      const r = await cloudLoadBangNguoiThat(200);
      if (r.ok) { this.nguoiThat = r.rows; this._ntLucTai = now(); }
    } catch (e) { /* chưa dựng bảng / mất mạng — bảng vẫn chạy với bot */ }
    finally { this._ntDangTai = false; }
  },
  /** Hàng người thật đã dựng thành khuôn của bảng xếp hạng. Bỏ CHÍNH MÌNH — hàng của mình
   *  lấy từ state trong máy, tươi hơn bản chụp trên cloud. */
  get nguoiThatRows() {
    const me = (this.authUser && this.authUser.id) || null;
    return (this.nguoiThat || []).filter((r) => r && r.user_id && r.user_id !== me).map((r) => ({
      id: 'nt:' + r.user_id, uid: r.user_id, name: r.ten || 'Vô Danh',
      // Không có danh hiệu thì để TRỐNG chứ đừng ghi "Người Chơi": huy hiệu cyan bên cạnh
      // đã nói câu đó rồi, in thêm là hai chip y hệt nhau nằm cạnh nhau.
      title: r.danh_hieu || '', catHex: '#22d3ee',
      // ⚠ Gradient dự phòng phải dùng màu CÓ THẬT. `cyan` trong dự án là màu phẳng nên
      //   `from-cyan-800` không tồn tại — hỏng ảnh là ô trống trơn thay vì nền có màu.
      avatar: { id: r.avatar || '__none__', char: '侠', color: 'from-teal-700 to-slate-800' },
      combatLv: r.chien_dau | 0, totalLv: r.tong_cap | 0,
      activity: 'hành tẩu giang hồ' + ((t) => (t ? ' · ghi nhận ' + this.notifAgo(t) : ''))(r.cap_nhat ? new Date(r.cap_nhat).getTime() : 0),
      isPlayer: false, laNguoiThat: true,
    }));
  },

  get tbTabs() { return [{ id: 'gear', ten: 'Trang Bị' }, { id: 'item', ten: 'Vật Phẩm' }, { id: 'pet', ten: 'Linh Thú' }]; },
  tbDatTab(id) { this.tbTab = id; },
  /** Nguồn treo được theo tab. Trang Bị lấy CẢ món đang mặc lẫn món trong túi. */
  get tbNguon() {
    if (this.tbTab === 'pet') {
      return (this.state.pets || []).slice()
        .sort((a, b) => this.qualityRank(b) - this.qualityRank(a) || (b.level || 0) - (a.level || 0))
        .map((p) => ({ k: 'pet', ref: p.id, ten: this.petName(p), obj: p }));
    }
    if (this.tbTab === 'item') {
      const out = [];
      for (const id in (this.state.inventory || {})) {
        const n = this.state.inventory[id], it = this.ITEMS[id];
        if (!n || !it) continue;
        out.push({ k: 'item', ref: id, ten: it.name, obj: { ...it, id, qty: n } });
      }
      return out.sort((a, b) => this.qualityRank(b.obj) - this.qualityRank(a.obj) || a.ten.localeCompare(b.ten, 'vi'));
    }
    const mac = [];
    for (const s in (this.state.equipment || {})) if (this.state.equipment[s]) mac.push(this.state.equipment[s]);
    const ds = mac.concat(this.state.gearBag || []).map((g) => this.gearView(g)).filter(Boolean)
      .sort((a, b) => this.qualityRank(b) - this.qualityRank(a) || (b.itemLv || 0) - (a.itemLv || 0));
    return this.gomGearTron(ds).map((v) => ({ k: 'gear', ref: v.uid, ten: v.name, obj: v }));
  },

  // ---------- Túi Tạm (CHỈ đồ rơi phiên đánh hiện tại, KHÔNG phải cả kho; chỉ ĐỌC, nguồn = combatSessView) ----------
  bagPeek: false,
  openBagPeek() { this.bagPeek = true; },
  closeBagPeek() { this.bagPeek = false; },
  get bagPeekCount() { const sv = this.combatSessView; return sv ? (sv.loot.length + (sv.nGear || 0)) : 0; },
  get bagPeekList() {
    const sv = this.combatSessView; if (!sv) return [];
    const stack = sv.loot.map((l) => ({ ...(this.ITEMS[l.id] || {}), id: l.id, qty: l.n }));
    const gear = sv.gear.map((g) => ({ ...(this.ITEMS[g.gearId] || {}), id: g.gearId, uid: g.uid, quality: g.quality, isGear: true }));   // snapshot phiên: id=gearId cho icon, quality=roll, uid mở đúng instance
    return gear.concat(stack).sort((a, b) => this.qualityRank(b) - this.qualityRank(a) || (b.qty || 0) - (a.qty || 0));
  },
  // ---------- Popup chi tiết vật phẩm (bấm item ở Hành Lý) ----------
  itemModal: null,                               // ref đang xem: string id (xếp chồng) HOẶC uid gear instance
  openItemModal(ref) { if (findGear(this.state, ref) || this.ITEMS[ref]) { this.itemModal = ref; this.banQty = 1; } },
  closeItemModal() { this.itemModal = null; },

  // ---------- Bán theo SỐ LƯỢNG TỰ CHỌN (popup chi tiết vật phẩm) ----------
  banQty: 1,
  /** Bán được nhiều nhất bao nhiêu: chồng trang bị trơn -> số món; vật phẩm -> số đang có. */
  get itemModalMax() {
    const r = this.itemModal;
    if (!r) return 0;
    if (findGear(this.state, r)) return this.gearStackUids(r).length;
    return this.state.inventory[r] || 0;
  },
  // Cùng khuôn với ô số lượng ở Thương Điếm: cho gõ tự do, RỖNG được, chỉ chặn trần;
  // kẹp về 1 ngay mỗi lần gõ thì xoá trắng để nhập số mới là ô nhảy lại.
  banNhap(v) {
    const s = String(v == null ? '' : v).replace(/[^\d]/g, '');
    if (!s) { this.banQty = 0; return; }
    this.banQty = Math.min(parseInt(s, 10), Math.max(1, this.itemModalMax));
  },
  banDatQty(n) { this.banQty = Math.max(1, Math.min(Math.floor(n) || 1, Math.max(1, this.itemModalMax))); },
  banThemQty(d) { this.banDatQty(this.banQty + d); },
  banChot() { if (!(this.banQty > 0)) this.banDatQty(1); },

  // ======================= BÍ CẢNH (Dungeon idle) =======================
  dungeonSel: null,
  ensureDungeon() {
    if (!this.state.dungeon) this.state.dungeon = { lastResult: null, history: [] };
    const ds = this.dungeonList;   // đã lọc Bí Cảnh sự kiện đóng — kẻo mặc định trúng phó bản tàng hình
    const selAn = this.dungeonSel && this.DUNGEON_BY_ID[this.dungeonSel] && !ds.some((d) => d.id === this.dungeonSel);
    if (!this.dungeonSel || !this.DUNGEON_BY_ID[this.dungeonSel] || selAn) {
      const first = ds.find((d) => this.combatLevel >= d.reqLevel) || ds[0];
      this.dungeonSel = first ? first.id : null;
    }
  },
  // Bí Cảnh SỰ KIỆN chỉ hiện khi sự kiện của nó đang mở.
  // Cùng lý do với yeuVuongList: Bí Cảnh sự kiện push vào cuối, không sắp thì Lv25/Lv70 nằm sau Lv100.
  get dungeonList() {
    void this._tick;
    return this.DUNGEONS.filter((d) => !d.suKien || this.svMoCua(d.suKien)).sort((a, b) => a.reqLevel - b.reqLevel);
  },
  get dungeonSelObj() { return this.dungeonSel ? this.DUNGEON_BY_ID[this.dungeonSel] : null; },
  selectDungeon(id) { if (this.DUNGEON_BY_ID[id]) this.dungeonSel = id; },
  dungeonLocked(id) { void this._tick; const d = this.DUNGEON_BY_ID[id]; return !d || this.combatLevel < d.reqLevel; },
  // Hoạt động Bí Cảnh đang chạy?
  get dungeonRunning() { return !!(this.state.activity && this.state.activity.type === 'dungeon'); },
  get dungeonRunId() { return this.dungeonRunning ? this.state.activity.dungeonId : null; },
  dungeonRunningHere(id) { return this.dungeonRunning && this.state.activity.dungeonId === id; },
  get dungeonRunsDone() { void this._tick; return this.dungeonRunning && this.state.activity.acc ? (this.state.activity.acc.runs || 0) : 0; },
  get dungeonRunsTotal() { return this.dungeonRunning ? (this.state.activity.runs || 1) : 0; },
  // Đếm ngược còn lại (giây) cả lịch — đọc _tick để reactive theo từng giây.
  dungeonTimeLeft() {
    void this._tick;
    if (!this.dungeonRunning) return 0;
    const a = this.state.activity;
    return Math.max(0, Math.ceil((a.startedAt + a.cycleMs - now()) / 1000));
  },
  get dungeonRunPct() {
    void this._tick;
    if (!this.dungeonRunning) return 0;
    const a = this.state.activity;
    return Math.min(100, ((now() - a.startedAt) / (a.cycleMs || 1)) * 100);
  },
  dungeonDurSec(id) { const d = this.DUNGEON_BY_ID[id]; return d ? d.durMs / 1000 : 0; },
  // Tỉ lệ đoạt Đồ Phổ THỰC mỗi lượt thông quan = base × doPhoMul(1.6) × pace (khớp engine runDungeon).
  dungeonDoPhoChance(id) { const d = this.DUNGEON_BY_ID[id]; if (!d || !d.loot || !d.loot.doPho) return 0; return (d.loot.doPhoChance || 0) * 1.6 * (d.pace || 1); },
  // Ba thứ dưới đây CÓ RƠI THẬT nhưng trước đây không có ô nào trong lưới Bảo Vật, nên người chơi
  // nhặt được mà tra không ra nguồn. Ba hệ số phải khớp ĐÚNG engine (src/engine/dungeon.js):
  // doPhoMul = 1.6, nhân `pace`; riêng Mảnh là số CHẮC CHẮN, KHÔNG nhân gì.
  dungeonToolDoPhoChance(id) { const d = this.DUNGEON_BY_ID[id]; const t = d && d.loot && d.loot.toolDoPho; return t ? (t.chance || 0) * 1.6 * (d.pace || 1) : 0; },
  dungeonBiKipChance(id) { const d = this.DUNGEON_BY_ID[id]; if (!d) return 0; return BICANH_BK_CHANCE * 1.6 * (d.pace || 1); },
  /** Danh sách bí kíp phó bản này CÓ THỂ thả — cùng luật lọc với `rollBiCanhBiKip` (theo reqLevel).
   *  ⚠ dùng biến module `BI_KIP`, `this.BI_KIP` không có trên store. */
  dungeonBiKipList(id) {
    const d = this.DUNGEON_BY_ID[id]; if (!d) return [];
    const maxIdx = BI_KIP_TIER_ORDER.indexOf(biCanhBkMaxTier(d.reqLevel));
    return BI_KIP.filter((b) => BI_KIP_TIER_ORDER.indexOf(b.tier) <= maxIdx)
      .map((b) => ({ id: b.id, ten: b.ten, loai: b.loai, he: b.he, lore: b.lore,
        tierName: (BI_KIP_TIER[b.tier] || {}).name || b.tier, tierColor: (BI_KIP_TIER[b.tier] || {}).color || '#67e8f9' }));
  },
  /** Mặt ô Bảo Vật + dòng chữ dưới nó: mượn art bản bậc cao nhất, ghi rõ ĐẾN BẬC NÀO. */
  dungeonBiKipMau(id) {
    const ds = this.dungeonBiKipList(id);
    if (!ds.length) return null;
    const cao = ds[ds.length - 1];
    return { id: cao.id, so: ds.length, tierName: cao.tierName, tierColor: cao.tierColor };
  },
  // ---- Danh Mục Bí Kíp (bấm ô Bí Kíp ở lưới Bảo Vật) ----
  bkPoolId: null,
  openBkPool(id) { this.bkPoolId = id; },
  closeBkPool() { this.bkPoolId = null; },
  get bkPoolObj() { return this.bkPoolId ? this.DUNGEON_BY_ID[this.bkPoolId] : null; },
  get bkPoolList() { return this.bkPoolId ? this.dungeonBiKipList(this.bkPoolId) : []; },
  dungeonManh(id) { const d = this.DUNGEON_BY_ID[id]; return (d && d.loot && d.loot.manh) || 0; },
  /** Tỉ lệ ra Mảnh mỗi lượt thông quan. `manhChance` là tỉ lệ CUỐI, không nhân pace/rareMul. */
  dungeonManhChance(id) { const d = this.DUNGEON_BY_ID[id]; const l = d && d.loot; if (!l || !l.manh) return 0; return l.manhChance == null ? 1 : l.manhChance; },
  // ⚠ Tuyệt Kĩ KHÁC hai loại trên: engine chỉ nhân `pace`, KHÔNG nhân doPhoMul (xem `cchance`
  // trong src/engine/dungeon.js). Chép nhầm hệ số là bày sai tỉ lệ cho người chơi.
  dungeonChieuDoPhoChance(id) { const d = this.DUNGEON_BY_ID[id]; const c = d && d.loot && d.loot.chieuDoPho; return c ? (c.chance || 0) * (d.pace || 1) : 0; },
  // ---- LỊCH LUYỆN: chọn số lượt (picker) ----
  dungeonRunsPick: {},
  dungeonMaxRuns(id) { void this._tick; const d = this.DUNGEON_BY_ID[id]; return d ? maxDungeonRuns(this.state, d) : 1; },
  dungeonRunsSel(id) { return Math.max(1, Math.min(this.dungeonRunsPick[id] || 1, this.dungeonMaxRuns(id))); },
  dungeonRunsInc(id) { this.dungeonRunsPick[id] = Math.min(this.dungeonMaxRuns(id), this.dungeonRunsSel(id) + 1); },
  dungeonRunsDec(id) { this.dungeonRunsPick[id] = Math.max(1, this.dungeonRunsSel(id) - 1); },
  dungeonRunsSet(id, n) { this.dungeonRunsPick[id] = Math.max(1, Math.min(Math.round(+n) || 1, this.dungeonMaxRuns(id))); },
  dungeonBatchSec(id) { return this.dungeonDurSec(id) * this.dungeonRunsSel(id); },
  // Phí: 1 lượt / cả lịch N lượt (N × phí vào).
  dungeonBatchCost(id) {
    const d = this.DUNGEON_BY_ID[id]; const c = (d && d.cost) || {}; const n = this.dungeonRunsSel(id);
    return { bac: (c.bac || 0) * n, honThach: (c.honThach || 0) * n };
  },
  canAffordDungeonBatch(id) {
    const cost = this.dungeonBatchCost(id);
    return (this.state.currencies.bac || 0) >= cost.bac && (this.state.currencies.honThach || 0) >= cost.honThach;
  },
  startDungeonRun(id) {
    const d = this.DUNGEON_BY_ID[id]; if (!d) return;
    if (this.dungeonLocked(id)) { this.showToast('Cần Chiến Đấu Lv ' + d.reqLevel + ' để vào. ' + d.name + '.'); return; }
    if (!this.dungeonAtLoc(d)) { this.showToast('Cần bay tới ' + this.dungeonLocName(d) + ' mới treo ' + d.name + ' được.'); return; }
    if (this.dungeonRunning) { this.showToast('Đang có một lịch Bí Cảnh — chờ hoàn tất đã.'); return; }
    const n = this.dungeonRunsSel(id);
    const cost = this.dungeonBatchCost(id);
    if (!this.canAffordDungeonBatch(id)) { this.showToast('Không đủ phí cho ' + n + ' lượt ' + d.name + '.'); return; }
    this.state.currencies.bac -= cost.bac;
    if (cost.honThach) this.state.currencies.honThach -= cost.honThach;
    const prev = this.buildCombatSummary('manual');            // đang đánh dở -> chốt phiên combat cũ vào chuông
    if (!startDungeon(this.state, id, n, now())) {             // lỗi -> hoàn phí
      this.state.currencies.bac += cost.bac;
      if (cost.honThach) this.state.currencies.honThach += cost.honThach;
      this.showToast('Không thể vào Bí Cảnh.'); return;
    }
    if (prev) this.pushCombatSummaryNotif(prev);
    Storage.save(this.state);
    this.showToast('🏛️ Lịch Luyện ' + d.name + ' · ' + n + ' lượt.');
  },
  // Kết quả: TỰ hiện khi chạy xong (lastResult chưa xem) HOẶC khi bấm 1 dòng Lịch Sử (_dungeonView).
  _dungeonView: null,
  get dungeonResult() {
    if (this._dungeonView) return this._dungeonView;
    const r = this.state.dungeon && this.state.dungeon.lastResult;
    return (r && !r.seen) ? r : null;
  },
  get dungeonShowResult() { return !!this.dungeonResult; },
  openDungeonHistory(h) { if (h) this._dungeonView = h; },
  closeDungeonResult() {
    if (this._dungeonView) { this._dungeonView = null; return; }       // đang xem lịch sử -> chỉ đóng
    const r = this.state.dungeon && this.state.dungeon.lastResult;
    if (r && !r.seen) { r.seen = true; Storage.save(this.state); }     // kết quả mới -> đánh dấu đã xem
  },
  get dungeonHistory() { return (this.state.dungeon && this.state.dungeon.history) || []; },
  dungeonResultItems() { const r = this.dungeonResult; if (!r || !r.loot) return []; return Object.keys(r.loot.items || {}).filter((id) => id.slice(0, 3) !== 'dp_').map((id) => ({ id, qty: r.loot.items[id] })); },
  logToneClass(tone) { return ({ win: 'text-emerald-300', hurt: 'text-rose-300', fortune: 'text-amber-300', boss: 'text-purple-300', fail: 'text-rose-400' })[tone] || 'text-slate-300'; },
  tangLabel(t) { return ({ thuong: 'Quái thường', tinhAnh: 'Tinh anh', boss: 'Boss cuối', hazard: 'Hiểm cảnh', bay: 'Cạm bẫy', coDuyen: 'Cơ duyên', kyNgo: 'Kỳ ngộ' })[t] || t; }, // nhãn loại tầng (preview)
  pctText(c) { const p = (c || 0) * 100; const s = (p > 0 && p < 10) ? p.toFixed(1).replace(/\.0$/, '') : Math.round(p).toString(); return s + '%'; }, // <10% hiện 1 thập phân (0.1%/1.2%/2.5% không bị làm tròn ẩn)
  // Danh mục Đồ Phổ 1 phó bản có thể rớt (gear khớp bậc + slot -> id 'dp_<gearId>'); + modal xem.
  dungeonDoPhoList(dungeonId) {
    const d = this.DUNGEON_BY_ID[dungeonId]; if (!d || !d.loot.doPho) return [];
    const dp = d.loot.doPho;
    const BQ = { 1: 'phamPham', 2: 'luongPham', 3: 'tinhPham', 4: 'tuyetPham', 5: 'truyenThe', 6: 'thanPham', 7: 'coBan' };
    const quals = dp.bac.map((b) => BQ[b]);
    // ⚠ Đồ Phổ CÔNG CỤ bốc RIÊNG (`loot.toolDoPho`, pool TOOL_SLOTS, bậc khác hẳn) nên KHÔNG lọt
    // qua bộ lọc dưới. Thiếu đoạn này thì người chơi nhặt được cuộn Rìu/Cuốc từ phó bản vũ khí mà
    // tra danh mục không thấy — đúng chỗ user hỏi "đồ phổ không liên quan sao vẫn rơi".
    const td = d.loot.toolDoPho;
    const oCongCu = td ? (this.TOOL_SLOTS || []).map((t) => t.id) : [];
    const qualTool = td ? (Array.isArray(td.bac) ? td.bac : [td.bac]).map((b) => BQ[b]) : [];
    const dsCongCu = td ? Object.values(this.ITEMS)
      .filter((it) => it.equip && it.equip.itemLv && !it.equip.set && qualTool.includes(it.quality) && oCongCu.includes(it.equip.slot))
      .map((it) => 'dp_' + it.id) : [];
    return Object.values(this.ITEMS)
      // `!it.equip.set` BẮT BUỘC phải khớp với rollDoPhoId (engine/dungeon.js) — bên đó đã loại đồ
      // Bộ Trang khỏi pool từ đầu. Thiếu điều kiện này thì bảng xem trước KHOE ra hàng chục Đồ Phổ
      // vĩnh viễn không rơi, người chơi cày mòn mỏi một thứ không tồn tại.
      .filter((it) => it.equip && it.equip.itemLv && !it.equip.set && quals.includes(it.quality) && (dp.slots === 'all' || dp.slots.includes(it.equip.slot)))
      .map((it) => 'dp_' + it.id)
      .concat(dsCongCu)
      // Đồ Phổ Bộ Trang + Đồ Phổ Tuyệt Kĩ cũng LÀ đồ phổ của phó bản này — trước đó chúng chỉ
      // nằm lẻ trong lưới Bảo Vật, không có mặt trong Danh Mục Đồ Phổ nên tra không ra.
      .concat((d.loot.rare || []).filter((r) => String(r.itemId || '').startsWith('dpset_')).map((r) => r.itemId));
  },
  dungeonPoolId: null,
  openDungeonPool(id) { this.dungeonPoolId = id; },
  closeDungeonPool() { this.dungeonPoolId = null; },
  get dungeonPoolObj() { return this.dungeonPoolId ? this.DUNGEON_BY_ID[this.dungeonPoolId] : null; },
  get dungeonPoolList() { return this.dungeonPoolId ? this.dungeonDoPhoList(this.dungeonPoolId) : []; },
  /**
   * Danh Mục Đồ Phổ CHIA NHÓM. ⚠⚠ Dồn hết vào một rổ là NÓI SAI: đồ phổ trang bị, đồ phổ công cụ
   * và đồ phổ Bộ là BA lượt bốc RIÊNG, khác bậc khác tỉ lệ. Bản trước in một dòng "Bậc 4 · 12%"
   * rồi liệt kê cả 4 cuộn công cụ ở dưới — 4 cuộn đó thật ra là bậc 4 · 9%, lượt bốc khác hẳn.
   */
  dungeonDoPhoNhom(id) {
    const d = this.DUNGEON_BY_ID[id]; if (!d || !d.loot) return [];
    const BQ = { 1: 'phamPham', 2: 'luongPham', 3: 'tinhPham', 4: 'tuyetPham', 5: 'truyenThe', 6: 'thanPham', 7: 'coBan' };
    const oCC = (this.TOOL_SLOTS || []).map((t) => t.id);
    // ⚠⚠ Chia theo NGUỒN BỐC, KHÔNG theo ô của món. Phó bản thấp (Thanh Vân Cốc) khai
    // `doPho.slots` CHÍNH LÀ bốn ô công cụ — chia theo ô thì cả nhóm đó bị đẩy sang nhánh
    // `toolDoPho` rồi ăn tỉ lệ 0% vì phó bản đó không có `toolDoPho`. Đo được: hiện "0%".
    const locTheo = (bacs, slots) => {
      const quals = bacs.map((b) => BQ[b]);
      return Object.values(this.ITEMS)
        .filter((it) => it.equip && it.equip.itemLv && !it.equip.set && quals.includes(it.quality)
          && (slots === 'all' || slots.includes(it.equip.slot)))
        .map((it) => 'dp_' + it.id);
    };
    const out = [];
    const dp = d.loot.doPho;
    if (dp) {
      const ids = locTheo(dp.bac || [], dp.slots);
      // Nhãn theo NỘI DUNG thật: pool toàn ô công cụ thì gọi đúng tên nó.
      const toanCC = dp.slots !== 'all' && (dp.slots || []).every((s) => oCC.includes(s));
      if (ids.length) out.push({ key: 'gear', ten: toanCC ? 'Đồ Phổ Công Cụ' : 'Đồ Phổ Trang Bị',
        bac: (dp.bac || []).join(' / '), pct: this.pctText(this.dungeonDoPhoChance(id)), ids });
    }
    const td = d.loot.toolDoPho;
    if (td) {
      const ids = locTheo(Array.isArray(td.bac) ? td.bac : [td.bac], oCC);
      if (ids.length) out.push({ key: 'tool', ten: 'Đồ Phổ Công Cụ', bac: String(td.bac),
        pct: this.pctText(this.dungeonToolDoPhoChance(id)), ids });
    }
    const bo = (d.loot.rare || []).filter((r) => String(r.itemId || '').startsWith('dpset_')).map((r) => r.itemId);
    if (bo.length) out.push({ key: 'set', ten: 'Đồ Phổ Bộ Trang', bac: '', pct: '', rieng: true, ids: bo });
    return out;
  },
  get dungeonPoolNhom() { return this.dungeonPoolId ? this.dungeonDoPhoNhom(this.dungeonPoolId) : []; },
  /**
   * Đã có bản Đồ Phổ Bộ này chưa. Khớp ĐÚNG điều kiện engine dùng để BỎ QUA khi rơi
   * (engine/dungeon.js: `continue` nếu inventory[dpset_*] > 0) — mở khoá bộ chỉ cần count>0
   * và KHÔNG tiêu đồ phổ, nên bản trùng vô dụng, engine không cho rơi nữa.
   */
  coDoPhoBo(dpId) { return ((this.state.inventory || {})[dpId] || 0) > 0; },
  /** Tỉ lệ đoạt một Đồ Phổ Bộ cụ thể ở phó bản này (lượt bốc RIÊNG, không chung rổ đồ phổ trang bị). */
  dungeonSetChance(dungeonId, setId) {
    const d = this.DUNGEON_BY_ID[dungeonId]; if (!d) return 0;
    const r = (d.loot.rare || []).find((x) => x.itemId === setId);
    return r ? r.chance : 0;
  },

  // ======================= ĐỒ PHỔ (Lĩnh Ngộ -> mở Rèn Đúc) =======================
  doPhoCharges(gearId) { return (((this.state.player && this.state.player.doPho) || {})[gearId]) || 0; }, // số LƯỢT rèn còn của 1 gear
  doPhoChargeOf(dpId) { const it = this.ITEMS[dpId]; return (it && it.gearId) ? this.doPhoCharges(it.gearId) : 0; }, // theo id đồ phổ (dp_)
  learnDoPho(dpId) {
    const it = this.ITEMS[dpId]; if (!it || it.type !== 'doPho' || !it.gearId) return;
    if ((this.state.inventory[dpId] || 0) < 1) { this.showToast('Không có Đồ Phổ này trong túi.'); return; }
    removeItem(this.state, dpId, 1);
    if (!this.state.player.doPho || typeof this.state.player.doPho !== 'object') this.state.player.doPho = {};
    this.state.player.doPho[it.gearId] = (this.state.player.doPho[it.gearId] || 0) + 1;
    Storage.save(this.state);
    this.showToast('📜 Lĩnh ngộ Đồ Phổ — +1 lượt rèn 〈' + (this.ITEMS[it.gearId] ? this.ITEMS[it.gearId].name : '') + '〉 (mỗi lượt rèn được 1 món).');
  },
  // Gate Rèn Đúc: bậc 1-3 luôn rèn; bậc 4-7 chỉ rèn khi đã lĩnh ngộ Đồ Phổ tương ứng (itemId = gearId).
  forgeUnlocked(itemId) {
    const it = this.ITEMS[itemId]; if (!it) return true;
    const forceDoPho = !!(it.equip && it.equip.forceDoPho); // tool bậc 2-3: ép Đồ Phổ dù phẩm chất thấp
    if (!forceDoPho && ['phamPham', 'luongPham', 'tinhPham'].includes(it.quality)) return true;
    return this.doPhoCharges(itemId) > 0; // bậc 4-7 + tool bậc 2-3: còn lượt Đồ Phổ mới hiện ở Rèn Đúc
  },
  /** Món này có đang mặc trên người không (chứ không nằm trong túi)? */
  gearDangMac(uid) { const eq = this.state.equipment || {}; for (const s in eq) if (eq[s] && eq[s].uid === uid) return true; return false; },
  get itemModalObj() {
    const ref = this.itemModal; if (!ref) return null;
    const g = findGear(this.state, ref);
    // ⚠ Từ giá Trưng Bày mở được thẻ của món ĐANG MẶC — đường này Hành Lý không có.
    //    Món đang mặc không nằm trong túi nên không bán tại chỗ được; đánh dấu để thẻ nói rõ.
    if (g) return { ...this.gearView(g), qty: 1, isGear: true, dangMac: this.gearDangMac(ref) };     // gear instance
    const it = this.ITEMS[ref];
    return it ? { ...it, qty: this.state.inventory[ref] || 0, isGear: false } : null;
  },
  itemTypeLabel(t) { return this.ITEM_TYPES[t] || 'Khác'; },
  equipSlotLabel(slot) { const s = (this.EQUIP_SLOTS || []).find((x) => x.id === slot) || (this.TOOL_SLOTS || []).find((x) => x.id === slot); return s ? s.name : slot; },
  statLabel(k) { return ({ congKich: 'Công Kích', hoThe: 'Hộ Thể', neTranh: 'Né Tránh', menhTrung: 'Chính Xác', sinhLuc: 'Sinh Lực', baoKich: 'Bạo Kích', baoSat: 'Sát Thương Bạo Kích', tocDo: 'Tốc Độ', thanPhap: 'Thân Pháp', linhXao: 'Linh Xảo', lucDao: 'Lực Đạo', noiLuc: 'Nội Lực', khangKim: 'Phòng Thủ Vật Lý', khangMoc: 'Kháng Độc', khangThuy: 'Kháng Băng', khangHoa: 'Kháng Hỏa', khangTho: 'Kháng Lôi', khangAll: 'Kháng Tất Cả',
    giamNgat: 'Thời Gian Phục Hồi', giamCham: 'Giảm Thời Gian Làm Chậm', giamDoc: 'Giảm Thời Gian Trúng Độc', giamBong: 'Giảm Thời Gian Bị Bỏng', giamChoang: 'Giảm Thời Gian Choáng', tangCong: 'Kĩ Năng Vốn Có', tangExp: 'Tăng EXP Chiến Đấu' })[k] || k; },
  /** Báo đã bán — số lượng + Bạc THẬT thu được. Bán mà không báo thì không biết được bao nhiêu. */
  baoDaBan(ten, n, bac) {
    if (!n) return;
    this.showToast('Đã bán ' + (n > 1 ? this.fmt(n) + ' ' : '') + '〈' + ten + '〉 · +' + this.fmt(bac) + ' Bạc');
  },
  // Bán nhanh từ popup chi tiết
  sellFromModal(qty) {
    const ref = this.itemModal; if (!ref) return;
    // ⚠ Lấy TÊN trước khi bán — bán xong instance đã bị gỡ khỏi túi, tra lại là mất tên.
    if (findGear(this.state, ref)) {
      const g = findGear(this.state, ref);
      const ten = (this.ITEMS[g.gearId] || {}).name || 'trang bị';
      const r = this.sellGearStack(ref, qty);      // món trơn xếp chồng -> bán cả chồng một nhát
      this.baoDaBan(ten, r.n, r.bac);
      this.closeItemModal(); return;
    }
    const ten = (this.ITEMS[ref] || {}).name || 'vật phẩm';
    const r = this.sellItem(ref, qty);
    this.baoDaBan(ten, r.n, r.bac);
    if (!(this.state.inventory[ref] > 0)) this.closeItemModal();
  },

  // ---------- Dev / Admin (offline) — cổng mật khẩu F9 ----------
  // F9: đã đăng nhập -> bật/tắt panel; chưa -> mở/đóng màn đăng nhập. Panel CHỈ hiện + dùng được khi devAuthed.
  toggleDev() {
    if (this.devAuthed) { this.devPanel = !this.devPanel; return; }
    this.devLoginOpen = !this.devLoginOpen;
    if (this.devLoginOpen) { this.devPass = ''; this.devLoginErr = ''; }
  },
  devLogin() {
    if (devHash(this.devPass) === DEV_PASS_HASH) { this.devAuthed = true; this.devLoginOpen = false; this.devPanel = true; this.devPass = ''; this.devLoginErr = ''; }
    else { this.devLoginErr = 'Sai mật khẩu.'; this.devPass = ''; }
  },
  closeDevLogin() { this.devLoginOpen = false; this.devPass = ''; this.devLoginErr = ''; },
  devLogout() { this.devAuthed = false; this.devPanel = false; this.devLoginOpen = false; this.devPass = ''; this.devLoginErr = ''; },
  setDevTab(t) { this.devTab = t; },
  devSave() { Storage.save(this.state); },
  devAddCurrency(key, amt) { this.state.currencies[key] = (this.state.currencies[key] || 0) + amt; this.devSave(); },
  devAddSkillXp(id, amt) { addSkillXp(this.state, id, amt); this.devSave(); },
  devAddStatXp(id, amt) { addStatXp(this.state, id, amt); this.devSave(); },
  devSetAllLevel(lv) {
    lv = Math.max(1, Math.min(100, Math.floor(lv || 1)));
    let xp = 0; for (let i = 1; i < lv; i++) xp += xpForLevel(i);
    Object.keys(this.SKILLS).forEach((id) => { this.state.skills[id] = { ...(this.state.skills[id] || {}), xp }; });
    this.state.skills['chienDau'] = { ...(this.state.skills['chienDau'] || {}), xp };
    Object.keys(this.STATS).forEach((id) => { this.state.stats[id] = { ...(this.state.stats[id] || {}), xp }; });
    this.devSave();
  },
  devAddItem(id, qty) { if (!id || !this.ITEMS[id]) return; addItem(this.state, id, qty); this.devSave(); },
  devGiveSampleGear() { GEAR_IDS.forEach((id) => addGearInstance(this.state, rollGearInstance(id))); this.devSave(); },
  devGiveKimQuang() { GEAR_IDS.filter((id) => (((this.ITEMS[id] || {}).equip) || {}).set === 'kimQuang').forEach((id) => addGearInstance(this.state, instanceFromCatalog(id, 0))); this.devSave(); this.showToast('Nhan Bo Kim Quang (7 mon)'); },
  devGiveTrangMats() { addItem(this.state, 'manhTrangBi', 100); TRANG_SET_KEYS.forEach((k) => addItem(this.state, this.TRANG_SETS[k].blueprintId, 1)); this.devSave(); this._tick++; this.showToast('Nhan 100 Manh Trang Bi Hoang Kim + Do Pho moi Bo (test ghep).'); },
  // Dev: roll N drop ngẫu nhiên ở cấp `lv` (test loot-hunt: phẩm + số dòng đa dạng).
  devRollDrops(lv, n) { lv = lv || this.combatLevel || 20; n = n || 20; for (let i = 0; i < n; i++) { const gi = rollMonsterDrop(lv); if (gi) addGearInstance(this.state, gi); } this.devSave(); this.showToast('Roll ' + n + ' drop @Lv' + lv); },
  devGiveStones() { ['daCuongHoaSo', 'daCuongHoaTrung', 'daCuongHoaCao', 'tinhTheYeuVuong'].forEach((id) => addItem(this.state, id, 99)); this.state.currencies.honThach = (this.state.currencies.honThach || 0) + 100000; this.devSave(); },
  devGiveAllEggs() {   // toàn bộ Trứng Linh Thú (30) + Tinh Thể + mầm Boss — để xem art
    let n = 0;
    Object.keys(this.ITEMS).forEach((id) => { if (this.ITEMS[id].type === 'trung') { addItem(this.state, id, 1); n++; } });
    ['tinhTheYeuVuong', 'hoPhuDauLinh', 'hachCoLinh', 'cuuViTinh', 'maToTam'].forEach((id) => { if (this.ITEMS[id]) addItem(this.state, id, 5); });
    this.devSave(); this.showToast('Đã nhận ' + n + ' Trứng Linh Thú + Tinh Thể + mầm Boss (test).');
  },
  // ---- Dev: Luyện Đan / Linh Thạch / Đan Bổ Trợ ----
  devGiveDanMats() {
    let n = 0;
    Object.keys(this.ITEMS).forEach((id) => {
      const it = this.ITEMS[id];
      if (it.type === 'thaoDuoc' || it.type === 'dan' || this.LINH_THACH[id]) { addItem(this.state, id, 99); n++; }
    });
    this.devSave(); this._tick++; this.showToast('Dev: +99 mỗi món · ' + n + ' loại (linh thảo / linh thạch / đan).');
  },
  devBuffOn() {        // bật 2 họ (đúng trần) bằng dạng Đan 12' — dạng ngắn nhất để test hết hạn
    ['cuongNguyenDan', 'ngoDaoDan'].forEach((id) => {
      if ((this.state.inventory[id] || 0) < 1) addItem(this.state, id, 1);
      useBuffDan(this.state, id, now());
    });
    this.devSave(); this._tick++; this.showToast('Dev: bật ' + activeBuffList(this.state, now()).length + ' họ Đan Bổ Trợ.');
  },
  devBuffShort() {     // kéo mọi buff còn 10 giây -> xem lúc hết hạn mà không phải đợi 2 tiếng
    const b = ensureBuffs(this.state); let n = 0;
    for (const k in b) if (b[k]) { b[k].untilMs = now() + 10000; n++; }
    this.devSave(); this._tick++; this.showToast('Dev: ' + n + ' buff còn 10 giây.');
  },
  devBuffClear() { this.state.buffs = {}; this.devSave(); this._tick++; this.showToast('Dev: đã xoá hết buff.'); },

  // ĐAN ĐIỀN — phát đủ đan để lấp TRỌN lưới 162 ô, không phải phát bừa một nắm.
  // Ô nhiều nhất là Cửu Phẩm 10 ô ⇒ 10 viên mỗi loại là đủ cho mọi phẩm, dư ra để thử nạp khi đầy.
  devGiveDanDien() {
    let n = 0;
    for (const nh of DD_NHANH) for (let p = 1; p <= 9; p++) { addItem(this.state, 'dd' + nh[0].toUpperCase() + nh.slice(1) + p, 10); n++; }
    this.devSave(); this._tick++;
    this.showToast('Dev: nhận 10 viên × ' + n + ' loại đan (đủ lấp trọn 162 ô).');
  },
  // LUYỆN — mỗi lượt quay tốn `luyenGia` Bạc. Phát Bạc rồi mở thẳng bảng, khỏi đi vòng qua màn Trang Bị.
  devMoLuyen() {
    this.state.currencies.bac = (this.state.currencies.bac || 0) + 1000000;
    this.devSave(); this._tick++;
    this.moLuyenDan();
  },

  devGiveAll() {       // TOÀN BỘ vật phẩm đã đăng ký + tiền tệ
    Object.keys(this.ITEMS).forEach((id) => { if (this.ITEMS[id].equip) addGearInstance(this.state, rollGearInstance(id)); else addItem(this.state, id, 20); });
    ['bac', 'honThach', 'nguyenBao'].forEach((k) => { this.state.currencies[k] = (this.state.currencies[k] || 0) + 1000000; });
    this.devSave(); this.showToast('Đã nhận TOÀN BỘ vật phẩm + tiền tệ (test).');
  },
  // ---- Dev: võ học / nghề / danh hiệu / codex / suy yếu / boss (nhân vật chính) ----
  devUnlockAllVoHoc() { this.state.combat.owned = { chieu: CHIEU.map((c) => c.id), tamPhap: TAM_PHAP_POOL.map((t) => t.id), biDong: BI_DONG.map((p) => p.id) }; this.devSave(); this._tick++; this.showToast('Dev: mở khoá TOÀN BỘ võ học (chiêu/tâm pháp/bị động).'); },
  devLearnAllNghe() { this.state.player.professions = NGHE.map((n) => n.id); this.devSave(); this._tick++; this.showToast('Dev: học TẤT CẢ ' + NGHE.length + ' nghề.'); },
  devUnlockAllTitles() { ensureTitles(this.state); if (!this.state.titles) this.state.titles = { owned: [], equipped: null }; this.state.titles.owned = TITLES.map((t) => t.id); const _t = now(); TITLES.forEach((t) => { if (!this.state.titles.moAt[t.id]) this.state.titles.moAt[t.id] = _t; }); this.devSave(); this._tick++; this.showToast('Dev: mở khoá TOÀN BỘ ' + TITLES.length + ' Danh Hiệu.'); },
  devCompleteCodex() {
    ensureCodex(this.state); const cx = this.state.codex;
    if (!this.state.counters) this.state.counters = {};
    if (!this.state.counters.kills) this.state.counters.kills = {};
    if (!this.state.danhSi) this.state.danhSi = {}; if (!Array.isArray(this.state.danhSi.seen)) this.state.danhSi.seen = [];
    CODEX_CATS.forEach((cat) => { (cat.entries || []).forEach((e) => { const need = cat.threshold || 1; switch (cat.key) { case 'yeuthu': this.state.counters.kills[e.id] = Math.max(this.state.counters.kills[e.id] || 0, need); break; case 'binhkhi': case 'bachtrang': cx.obtained[e.id] = Math.max(cx.obtained[e.id] || 0, 1); break; case 'vatpham': cx.obtained[e.id] = Math.max(cx.obtained[e.id] || 0, need); break; case 'linhthu': cx.petSeen[e.id] = 1; break; case 'bicanh': cx.dungeonRuns[e.id] = Math.max(cx.dungeonRuns[e.id] || 0, need); break; case 'danhsi': if (!this.state.danhSi.seen.includes(e.id)) this.state.danhSi.seen.push(e.id); break; } }); });
    this.devSave(); this._tick++; this.showToast('Dev: hoàn tất Vạn Vật Phổ (' + CODEX_CATS.length + ' phổ).');
  },
  devClearSuyYeu() { this.recoverFromSuyYeu(); },
  devBossReadyAll() { const bs = ensureBoss(this.state); YEU_VUONG.forEach((b) => { bs.cd[b.id] = 0; bossResetHp(this.state, b.id); }); bs.healUntil = 0; this.devSave(); this._tick++; this.showToast('Dev: mọi Yêu Vương sẵn sàng (reset CD + HP đầy).'); },
  // ---- Dev: Bí Cảnh (thông quan tức thì) + Đồ Phổ ----
  devDungeonSel: '',
  devGrantDungeon(n) { const id = this.devDungeonSel || DUNGEON_IDS[0]; n = n || 5; const r = grantDungeon(this.state, id, n, now()); const drops = r && r.biKipDrops ? r.biKipDrops.length : 0; this.devSave(); this._tick++; const nm = (this.DUNGEON_BY_ID[id] || {}).name || id; this.showToast('Dev: chạy ' + n + ' lượt ' + nm + (drops ? ' — rơi ' + drops + ' bí kíp' : '') + '. (chưa thông quan? đặt Lv 100)'); },
  devGiveDoPho(n) { n = n || 5; if (!this.state.player.doPho || typeof this.state.player.doPho !== 'object') this.state.player.doPho = {}; let c = 0; Object.values(this.ITEMS).forEach((it) => { if (it && it.type === 'doPho' && it.gearId) { this.state.player.doPho[it.gearId] = (this.state.player.doPho[it.gearId] || 0) + n; c++; } }); this.devSave(); this._tick++; this.showToast('Dev: +' + n + ' lượt rèn Đồ Phổ cho ' + c + ' món (gear bậc 4-7 + công cụ).'); },
  // ---- Dev: Linh Thú ----
  devPetBase: 'bachHo', devPetQuality: 'tuyetPham', devPetLv: 10,
  devCreatePet() { const p = devSpawnPet(this.state, this.devPetBase, this.devPetQuality, this.devPetLv); if (!p) { this.showToast('Chọn loài + phẩm.'); return; } this.devSave(); this.showToast('Tạo ' + this.petName(p) + ' · ' + (this.QUALITY[p.quality] || {}).name + ' · Lv' + p.level); },
  devGiveEachSpecies() { Object.keys(this.PET_SPECIES).forEach((b) => devSpawnPet(this.state, b, this.devPetQuality, this.devPetLv)); this.devSave(); this.showToast('Tạo 1 con mỗi loài · ' + (this.QUALITY[this.devPetQuality] || {}).name + ' · Lv' + this.devPetLv); },
  devSetPetLevel(lv) { lv = Math.max(1, Math.min(99, Math.floor(lv || 1))); (this.state.pets || []).forEach((p) => { p.level = lv; p.xp = 0; }); this.devSave(); this.showToast('Đặt mọi Linh Thú về Lv' + lv); },
  devAwakenActive() { const p = this.activePetObj; if (!p) { this.showToast('Chưa dắt Linh Thú nào.'); return; } p.evolved = !p.evolved; this.devSave(); this.showToast(this.petName(p) + (p.evolved ? ' — Thức Tỉnh (hiện art _awk).' : ' — về hình thái gốc.')); },
  devClearPets() { this.state.pets = []; this.state.hatchery = null; this.devSave(); this.showToast('Đã xoá hết Linh Thú + lò ấp.'); },
  devGivePetMats() { addItem(this.state, 'linhPhach', 99); addItem(this.state, 'tinhTheYeuVuong', 99); this.state.currencies.honThach = (this.state.currencies.honThach || 0) + 50000; this.devSave(); this.showToast('Nhận 99 Linh Phách + 99 Tinh Thể Yêu Vương + 50k Hồn Thạch (test Thức Tỉnh).'); },
  devSetClass(id) { if (this.CLASSES[id]) { this.state.player.class = id; this.devSave(); } },
  // ---- Dev: Tông Môn ----
  devTmBuildLv: 5, devTmRealm: 4, devTmEventSel: '',
  get devTmEvents() { return TM_EVENTS.map((e) => ({ id: e.id, title: e.title, grp: e.grp, kind: e.kind })); },
  devTmGiveMats(q) { const t = this.tm; if (!t) return; q = q || 99; MAT_KEYS.forEach((m) => { t.mats[m] = (t.mats[m] || 0) + q; }); this.devSave(); this.showToast('Dev: +' + q + ' mỗi nguyên liệu'); },
  devTmGivePills(q) { const t = this.tm; if (!t) return; q = q || 20; PILL_KEYS.forEach((p) => { t.pills[p] = (t.pills[p] || 0) + q; }); this.devSave(); this.showToast('Dev: +' + q + ' mỗi loại đan'); },
  devTmGiveResources() { const t = this.tm; if (!t) return; t.congHien = (t.congHien || 0) + 100000; t.diem = (t.diem || 0) + 100000; t.khiVan = 100; this.state.currencies.bac = (this.state.currencies.bac || 0) + 1000000; this.state.currencies.honThach = (this.state.currencies.honThach || 0) + 1000000; this.devSave(); this.showToast('Dev: +Cống Hiến/Điểm/Bạc/Hồn Thạch + Khí Vận 100'); },
  devTmSetBuildings(lv) { const t = this.tm; if (!t) return; lv = Math.max(0, Math.floor(lv || 0)); Object.keys(BUILDINGS).forEach((k) => { t.buildings[k] = Math.max(t.buildings[k] || 0, lv); }); this.devSave(); this.showToast('Dev: mọi công trình ≥ Bậc ' + lv); },
  devTmAddDisciples(n) { const t = this.tm; if (!t) return; n = n || 3; for (let i = 0; i < n; i++) t.disciples.push(genDisciple()); this.devSave(); this.showToast('Dev: +' + n + ' đệ tử ngẫu nhiên'); },
  devTmRealmAll(realm) { const t = this.tm; if (!t) return; realm = Math.max(0, Math.min(9, Math.floor(realm || 0))); t.disciples.forEach((d) => { d.realm = Math.min(realm, disciCap(d)); d.xp = 0; d.breakReady = false; d.awaiting = false; }); this.devSave(); this.showToast('Dev: mọi đệ tử về ' + REALMS[realm].name); },
  devTmBreakReadyAll() { const t = this.tm; if (!t) return; let n = 0; t.disciples.forEach((d) => { if (!d.awaiting && !d.lichLuyenUntil && d.realm < disciCap(d)) { d.xp = 1; d.breakReady = true; n++; } }); this.devSave(); this.showToast('Dev: ' + n + ' đệ tử → Bình Cảnh (test đột phá)'); },
  devTmFinishTimers() { const n = now(), t = this.tm; if (!t) return; t.disciples.forEach((d) => { if (d.lichLuyenUntil) d.lichLuyenUntil = n - 1; if (d.linhNgoUntil) d.linhNgoUntil = n - 1; if (d.giangUntil) d.giangUntil = n - 1; }); (t.brewing || []).forEach((b) => { b.until = n - 1; }); ((t.duocVien || {}).plots || []).forEach((p) => { if (p) p.until = n - 1; }); this.devSave(); this.showToast('Dev: hoàn tất Lịch Luyện / Lĩnh Ngộ / Thính Giảng / Lò đan / Dược Viên'); },
  // ---- Dev: TIÊN MINH ----
  // Mọi nút ở đây đi qua ĐÚNG hàm engine mà người chơi dùng (lapBang/chieuMo/themGiaoTinh/
  // sinhDonXin/ghiKillChinhPhat...), chỉ nới điều kiện đầu vào. Ghi thẳng vào state là test
  // một đằng người chơi chạy một nẻo — thứ cần thử chính là mấy cái cửa chặn đó.
  devBpCapMinh: 20, devBpCtLv: 5, devBpKnLv: 5, devBpMoi: 10,
  get devBp() { return (this.state.bangPhai && this.state.bangPhai.bang) || null; },
  devBpLap() {
    ensureBangPhai(this.state);
    if (this.devBp) { this.showToast('Dev: đã có Tiên Minh rồi.'); return; }
    if (!BP.lapBang(this.state, { ten: 'Thiên Cơ Minh', tonChi: 'Lấy nghĩa làm đầu.' }, now())) { this.showToast('Dev: không lập được.'); return; }
    this.devSave(); this._tick++; this.showToast('Dev: đã lập Thiên Cơ Minh (bỏ qua phí + Tổng Lv).');
  },
  devBpTaiNguyen() {
    const b = this.devBp; if (!b) { this.showToast('Dev: chưa có Tiên Minh.'); return; }
    b.quy = (b.quy || 0) + 5000000;
    this.state.bangPhai.congTich = (this.state.bangPhai.congTich || 0) + 200000;
    this.state.bangPhai.congTichTong = (this.state.bangPhai.congTichTong || 0) + 200000;
    b.bangCong = (b.bangCong || 0) + 100000;
    this.devSave(); this._tick++; this.showToast('Dev: +5.000.000 Bạc Ngân Khố · +200.000 Công Tích · +100.000 Minh Cống');
  },
  devBpCap(lv) {
    const b = this.devBp; if (!b) return;
    b.cap = Math.max(1, Math.min(BP.CAP_BANG_MAX, Math.floor(lv || 1)));
    this.devSave(); this._tick++; this.showToast('Dev: Tiên Minh Cấp ' + b.cap);
  },
  devBpCongTrinh(lv) {
    const b = this.devBp; if (!b) return;
    lv = Math.max(0, Math.min(10, Math.floor(lv || 0)));
    BP.CONG_TRINH.forEach((c) => { b.congTrinh[c.id] = lv; });
    b.xayDung = null;
    this.devSave(); this._tick++; this.showToast('Dev: mọi công trình → cấp ' + lv);
  },
  devBpKyNang(lv) {
    const b = this.devBp; if (!b) return;
    lv = Math.max(0, Math.min(5, Math.floor(lv || 0)));
    BP.KY_NANG_BANG.forEach((k) => { b.kyNang[k.id] = lv; });
    this.devSave(); this._tick++; this.showToast('Dev: mọi kĩ năng → cấp ' + lv + ' (Binh Khí Khố phải đủ cấp mới ăn)');
  },
  /** Mời người qua ĐÚNG cửa chieuMo(): nuôi đủ Giao Tình trước rồi mới mời, y như người chơi. */
  devBpMoiNguoi(n) {
    const b = this.devBp; if (!b) { this.showToast('Dev: chưa có Tiên Minh.'); return; }
    const t = now(), PHIEN = 30 * 60000;
    const ds = BP.danhSachTanTu(this.state, this.state.world, t);
    let vao = 0;
    for (const x of ds) {
      if (vao >= (n || 10)) break;
      const can = BP.giaoTinhCan(x.tong);
      for (let i = 0; i < can; i++) TL.themGiaoTinh(this.state, x.id, t + i * PHIEN);
      if (BP.chieuMo(this.state, x.id, this.state.world, t)) vao++;
    }
    this.devSave(); this._tick++;
    this.showToast('Dev: mời được ' + vao + ' người (đã nuôi đủ Giao Tình trước).');
  },
  /** Làm quen 6 người mà CHƯA mời — để xem lưới "Người Quen Ở Tửu Lâu". */
  devBpLamQuen() {
    const t = now(), PHIEN = 30 * 60000;
    const ds = BP.danhSachTanTu(this.state, this.state.world, t).slice(0, 6);
    ds.forEach((x, k) => {
      const can = BP.giaoTinhCan(x.tong);
      const bac = (k % 2 === 0) ? can : Math.max(1, can - 1);   // xen kẽ: đủ bậc / còn thiếu một bận
      for (let i = 0; i < bac; i++) TL.themGiaoTinh(this.state, x.id, t + i * PHIEN);
    });
    this.devSave(); this._tick++; this.showToast('Dev: quen ' + ds.length + ' người ở Tửu Lâu (một nửa còn thiếu bận rượu).');
  },
  devBpDonXin() {
    const b = this.devBp; if (!b) return;
    b._donSlot = -1;                       // gỡ chốt 6 giờ rồi cho sinh ngay
    BP.sinhDonXin(this.state, this.state.world, now());
    this.devSave(); this._tick++; this.showToast('Dev: sinh đơn xin nhập minh (đang có ' + (b.donXin || []).length + ' đơn).');
  },
  devBpDoiBangHien() {
    // Bảng Chiêu Hiền suy từ mốc 4 giờ. Không sửa được đồng hồ -> đẩy người trên bảng vào
    // danh sách đơn xin, họ rớt khỏi bảng và lượt sau tự lấp người mới.
    const b = this.devBp; if (!b) return;
    const cu = BP.bangChieuHien(this.state, this.state.world, now()).map((x) => x.id);
    b.donXin = [...new Set([...(b.donXin || []), ...cu])].slice(-12);
    this.devSave(); this._tick++; this.showToast('Dev: đẩy ' + cu.length + ' người trên bảng sang Đơn Xin — bảng tự lấp lượt mới.');
  },
  devBpXongNhiemVu() {
    const b = this.devBp; if (!b) return;
    const w = this.state.world, t = now();
    const ds = BP.danhSachNv(this.state, w, t);
    // `nv.moc` là MỐC ĐẦU KỲ ({kills, produced, bac, boss}) — phần "của ngươi" = số hiện tại
    // trừ mốc. Hạ mốc xuống bằng đúng chỉ tiêu là việc thành xong, không phải đẻ khoá theo id.
    const nv = this.state.bangPhai.nv; if (!nv || !nv.moc) return;
    const khoa = { kill: 'kills', gather: 'produced', bac: 'bac', boss: 'boss' };
    ds.forEach((q) => { const k = khoa[q.loai]; if (k) nv.moc[k] = (nv.moc[k] || 0) - q.can; });
    this.devSave(); this._tick++; this.showToast('Dev: ' + ds.length + ' Minh Vụ đủ chỉ tiêu — bấm Lĩnh Thưởng.');
  },
  devBpChinhPhat() {
    const b = this.devBp; if (!b) return;
    // themCpVung(state, locId, diem, now) — cộng thẳng số điểm. ghiKillChinhPhat() chỉ cộng
    // được 1 con quái mỗi lần (tham số thứ ba là CỜ BOSS, không phải số điểm).
    LOCATIONS.forEach((l, i) => { BP.themCpVung(this.state, l.id, 4000 - i * 300, now()); });
    this.devSave(); this._tick++; this.showToast('Dev: bơm điểm Chinh Phạt cho cả ' + LOCATIONS.length + ' vùng.');
  },
  devBpBoss() {
    const b = this.devBp; if (!b) return;
    b.congTrinh.tramYeuDai = Math.max(1, b.congTrinh.tramYeuDai || 0);
    const bb = this.state.bangPhai.bossB; if (bb) bb.cdDen = 0;
    this.devSave(); this._tick++; this.showToast('Dev: mở Trảm Yêu Đài + hồi lượt xuất trận.');
  },

  // ---- Dev: Bí Kíp (BK1-5) ----
  devBkTier: 'all',
  devTmGiveBiKip(tier, n) { const t = this.tm; if (!t) return; n = n || 5; tier = tier || this.devBkTier || 'all'; let c = 0; BI_KIP.forEach((b) => { if (tier === 'all' || b.tier === tier) { biKipBagAdd(this.state, b.id, n); c++; } }); this.devSave(); this._tick++; this.showToast('Dev: +' + n + ' mỗi bí kíp' + (tier === 'all' ? '' : ' bậc ' + (BI_KIP_TIER[tier] || {}).name) + ' (' + c + ' loại)'); },
  devTmTeachBiKip(mode) { const t = this.tm; if (!t) return; const keys = BI_KIP_KEYS; let total = 0; t.disciples.forEach((d) => { if (d.awaiting) return; if (!Array.isArray(d.skills)) d.skills = []; const cap = biKipSlotMax(d.realm); const want = mode === 'full' ? cap : Math.min(cap, 1 + Math.floor(Math.random() * 2)); let guard = 0; while (d.skills.length < want && guard++ < 80) { const id = keys[Math.floor(Math.random() * keys.length)]; if (!d.skills.includes(id)) { d.skills.push(id); total++; } } }); this.devSave(); this._tick++; this.showToast('Dev: gán ' + total + ' bí kíp cho đệ tử (' + (mode === 'full' ? 'đầy ô' : 'ngẫu nhiên') + ') — test Luận Võ + khắc loại'); },
  devTmRollBkAuction() { const t = this.tm; if (!t) return; if (!t.bkAuction) t.bkAuction = { lots: [], at: 0 }; t.bkAuction.at = 0; bkAuctionRefresh(this.state, now()); this.devSave(); this._tick++; this.showToast('Dev: làm mới phiên Đấu Giá Bí Kíp'); },
  devTmMergeBk(tier) { const r = mergeBiKip(this.state, tier); if (r.ok) { this.devSave(); this._tick++; this.showToast('Dev Hợp Nhất · ' + r.msg); } else this.showToast(r.msg); },
  // ---- Dev: Tông Môn drama / xã hội ----
  devTmSetTamMa(lv) { const t = this.tm; if (!t) return; lv = Math.max(0, Math.min(TAMMA_MAX, Math.floor(lv))); t.disciples.forEach((d) => { d.tamMaLv = lv; d.tamMaXp = 0; }); this.devSave(); this._tick++; this.showToast('Dev: mọi đệ tử Tâm Ma bậc ' + lv); },
  devTmStageThienKiep(realm) { const t = this.tm; if (!t) return; realm = Math.max(7, Math.min(8, Math.floor(realm || 8))); let d = t.disciples.find((x) => x.apt === 'thien' && !x.awaiting); if (!d) { d = genDisciple({ apt: 'thien' }); d.name = 'Thí Nghiệm Thiên Kiếp'; t.disciples.push(d); } d.realm = realm; d.xp = 1; d.breakReady = true; d.kiepCdUntil = 0; d.awaiting = false; if (!t.pills) t.pills = {}; PILL_KEYS.forEach((p) => { t.pills[p] = (t.pills[p] || 0) + 20; }); this.state.currencies.honThach = (this.state.currencies.honThach || 0) + 1000000; this.devSave(); this._tick++; this.showToast('Dev: dựng cảnh Thiên Kiếp (' + REALMS[realm].name + ') — mở hồ sơ ' + d.name + ' → Bình Cảnh → Độ Thiên Kiếp.'); },
  devResetDanhSiOffers() { this._ensureDanhSiState(); this.state.danhSi.accepted = []; this.devSave(); this._tick++; this.showToast('Dev: reset lời mời Danh Sĩ đã nhận (re-test Bái Sư/Kỳ Ngộ + bí kíp truyền dạy).'); },
  devTmClearDrama() { const t = this.tm; if (!t) return; t.disciples.forEach((d) => { d.flags = {}; d.tamMaLv = 0; d.tamMaXp = 0; }); if (t.events) { t.events.rebels = []; t.events.pending = []; t.events.queue = []; } t.fallen = []; this.devSave(); this._tick++; this.showToast('Dev: gột sạch cờ xấu / tâm ma / phản đồ / cố nhân.'); },
  devTmClearCooldowns() { const t = this.tm; if (!t) return; t.disciples.forEach((d) => { d.luanVoCdUntil = 0; d.gioiLuatCdUntil = 0; }); if (t.diplomacy && t.diplomacy.ties) Object.keys(t.diplomacy.ties).forEach((k) => { t.diplomacy.ties[k].lastVisit = 0; }); t.shopCd = {}; if (t.bkAuction) t.bkAuction.at = 0; this.devSave(); this._tick++; this.showToast('Dev: reset CD Luận Võ / Giới Luật / Đãi Khách / Đấu Giá.'); },
  devTmSeedDiplomacy(rep, n) { const t = this.tm; if (!t) return; rep = (rep == null) ? 119 : rep; n = n || 4; if (!t.diplomacy) t.diplomacy = { ties: {} }; if (!t.diplomacy.ties) t.diplomacy.ties = {}; for (let i = 0; i < n; i++) t.diplomacy.ties['sect' + i] = { rep, lastVisit: 0 }; this.devSave(); this._tick++; this.showToast('Dev: gieo bang giao ' + n + ' phái (rep ' + rep + '). Vào Đãi Khách Các → Tiếp Đãi để tăng quan hệ vượt ngưỡng Kết Minh.'); },
  // ---- Dev: tua đồng hồ game (session-only; reload về thực). Chủ yếu xem Danh Sĩ tử vong/truyền nhân + bot + timer Tông Môn. ----
  get devNowOffsetDays() { void this._tick; return Math.round((_devNowOffset + _devThem()) / 8640000) / 10; },
  // ---- Dev: CHẠY NHANH thời gian (x100 / x1000 / x5000) ----
  get devHeSo() { void this._tick; return _devHeSo; },
  devDatHeSo(k) {
    k = k || 1;
    _devTichLuy = _devThem();                 // chốt phần đã tăng tốc TRƯỚC khi đổi hệ số, không thì giờ nhảy giật
    _devMocThuc = Date.now();
    _devHeSo = k;
    this._tick++;
    try { this.tmTick(); } catch (e) {}
    this.showToast(k > 1
      ? ('Dev: thời gian chạy nhanh x' + k + ' (1 giây thực = ' + this.devQuyDoi + ').')
      : 'Dev: thời gian về tốc độ thực.');
  },
  /** Một giây thực bằng bao nhiêu thời gian trong game — cho nhãn dễ đọc. */
  get devQuyDoi() {
    void this._tick;
    const s = _devHeSo;
    if (s <= 1) return '1 giây';
    if (s < 60) return s + ' giây';
    if (s < 3600) return Math.round(s / 60 * 10) / 10 + ' phút';
    if (s < 86400) return Math.round(s / 3600 * 10) / 10 + ' giờ';
    return Math.round(s / 86400 * 10) / 10 + ' ngày';
  },
  devNowOffsetAdd(days) { _devNowOffset += (days || 0) * 86400000; this._tick++; try { this.tmTick(); } catch (e) {} this.showToast('Dev: tua đồng hồ ' + (days >= 0 ? '+' : '') + days + ' ngày (tổng ' + this.devNowOffsetDays + 'd). Quan sát Danh Sĩ/bot; reload về thực.'); },
  devNowOffsetClear() {
    const t0 = Date.now();   // gỡ kẹt mọi timer wall-clock tương lai (do tua đồng hồ) về thực trước khi zero offset
    const c = this.state.combat; if (c && c.suyYeuUntil > t0) c.suyYeuUntil = t0;
    try { const b = ensureBoss(this.state); if (b) { if (b.healUntil > t0) b.healUntil = t0; if (b.cd) Object.keys(b.cd).forEach((k) => { if (b.cd[k] > t0) b.cd[k] = t0; }); } } catch (e) {}
    const t = this.tm;
    if (t) {
      (t.disciples || []).forEach((d) => { ['linhNgoUntil', 'giangUntil', 'lichLuyenUntil'].forEach((k) => { if (d[k] > t0) d[k] = t0 - 1; }); });
      (t.brewing || []).forEach((b) => { if (b && b.until > t0) b.until = t0 - 1; });
      (((t.duocVien || {}).plots) || []).forEach((p) => { if (p && p.until > t0) p.until = t0 - 1; });
      if (t.bkAuction && t.bkAuction.at > t0) t.bkAuction.at = 0;
      if (t.recruitAt > t0) t.recruitAt = t0;
    }
    _devNowOffset = 0;
    _devHeSo = 1; _devTichLuy = 0; _devMocThuc = Date.now();   // tắt luôn CHẠY NHANH, không thì đồng hồ lại vọt đi ngay
    this._tick++; this.devSave(); this.showToast('Dev: về đồng hồ thực (gỡ kẹt timer tương lai).');
  },
  devTmFireEvent() { if (this.devTmEventSel) this.devFireEvent(this.devTmEventSel); else this.showToast('Chọn sự kiện trước.'); },
  devExport() {
    const blob = new Blob([JSON.stringify(this.state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tieudao_save.json';
    a.click();
    URL.revokeObjectURL(a.href);
  },
  // ⛔ Nút "Nhập bản lưu" ở màn CÀI ĐẶT đã gỡ (user chốt 2026-08-05). Hàm này VẪN CÒN vì bảng
  //   Dev F9 (tab Hệ Thống) gọi nó — xoá hàm là hỏng bảng Dev. ĐỪNG trả nút về màn Cài Đặt.
  //   ⚠ Gỡ nút KHÔNG phải là chống gian lận: sửa `localStorage` bằng Console vẫn được như thường.
  //   Cái chặn thật là chốt phía máy chủ (docs/SQL_CHONG_GIAN_LAN.sql) — nó soi bản lưu lúc đẩy
  //   lên, sửa bằng đường nào cũng bắt. Bỏ nút chỉ để bớt một lối mời gọi.
  devImport(ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(r.result);
        Storage.save(parsed);
        resetting = true; // chặn beforeunload ghi đè save vừa nhập
        location.reload();
      } catch (e) { alert('File save không hợp lệ.'); }
    };
    r.readAsText(file);
  },

  // ---------- SÀN GIAO DỊCH — chỉ NGƯỜI CHƠI bán, KHÔNG có bot ----------
  // ⚠⚠ CLIENT KHÔNG ĐỘNG VÀO TÚI. Ba hàm treo/gỡ/mua nằm trên máy chủ, tự đọc túi trong
  //   `saves.data`, tự bỏ món, tự ghi lại (docs/SQL_SAN_GIAO_DICH.sql). Client tự gỡ món là mở
  //   đường nhân đôi: nạp lại bản lưu cũ thì món về túi mà tin rao vẫn treo.
  // ⚠⚠ GỌI XONG PHẢI TẢI LẠI SAVE. Bản trên máy này lập tức thành bản CŨ (thiếu món, thiếu Bạc,
  //   `sanSeq` lùi). Chốt chặn quay ngược sẽ TỪ CHỐI mọi lần đẩy sau đó — người chơi mất đồng bộ
  //   vĩnh viễn mà không hiểu vì sao.
  sanTab: 'mua',            // 'mua' = đang xem chợ · 'ban' = tin của mình
  sanDs: [], sanCuaToi: [], sanTai: false, sanLoi: '',
  sanTreoUid: null, sanTreoGia: '',
  get sanMo() { return this.view === 'market'; },
  _sanChoAuth: 0,
  async taiSan() {
    // ⚠⚠ ĐỪNG kết luận "chưa đăng nhập" NGAY khi màn vừa dựng. Tải lại trang lúc đang đứng ở màn
    //   Sàn thì `x-init` chạy TRƯỚC khi phiên khôi phục xong (`authKiemTra` còn true) — người đã
    //   đăng nhập vẫn thấy dòng "phải đăng nhập", và không có gì chạy lại nên nó nằm đó vĩnh viễn.
    //   Chờ tới khi phiên ngã ngũ rồi mới kết luận.
    if (!this.isLoggedIn && this.authKiemTra && this._sanChoAuth < 20) {
      this._sanChoAuth++; setTimeout(() => this.taiSan(), 400); return;
    }
    this._sanChoAuth = 0;
    if (!this.isLoggedIn) { this.sanLoi = 'Phải đăng nhập mới vào Sàn được.'; return; }
    this.sanTai = true; this.sanLoi = '';
    try {
      const [a, b] = await Promise.all([cloudSanDs(80), cloudSanCuaToi(50)]);
      if (!a.ok) { this.sanLoi = 'Chưa đọc được Sàn — kiểm tra đã chạy SQL_SAN_GIAO_DICH.sql chưa.'; return; }
      this.sanDs = a.ds; this.sanCuaToi = (b.ok ? b.ds : []);
    } catch (e) { this.sanLoi = 'Không kết nối được máy chủ.'; }
    finally { this.sanTai = false; }
  },
  // Trang bị treo được: trong TÚI, không phải món đang mặc.
  get sanDoTreoDuoc() { return (this.state.gearBag || []).filter((g) => g && g.uid); },
  // ⚠ Dùng lại `gearView` — chính hàm dựng tooltip trang bị. Đừng tự ghép tên: tên món còn phụ
  //   thuộc bộ trang, cường hóa, phẩm chất; ghép tay là lệch với chỗ khác trong game.
  sanXem(m) { try { return this.gearView(m); } catch (e) { return null; } },
  sanTenMon(m) { const v = this.sanXem(m); return (v && v.name) || (m && m.gearId) || '?'; },
  // Sau MỌI thao tác sàn: kéo bản mới từ cloud về rồi tải lại trang.
  async _sanNapLai() {
    const r = await cloudLoadSave();
    if (r.ok && r.row) this._applyCloudSave(r.row.data);
    else location.reload();
  },
  _sanVi(v) {
    return ({ 'chua-dang-nhap': 'Chưa đăng nhập.', 'gia-sai': 'Giá không hợp lệ.',
      'chua-co-ban-luu': 'Chưa có bản lưu trên máy chủ — bấm Đồng Bộ Ngay rồi thử lại.',
      'khong-co-mon-nay': 'Món này không có trong túi trên máy chủ — đồng bộ rồi thử lại.',
      'dang-treo-roi': 'Món này đang treo bán rồi.', 'khong-co-tin': 'Tin rao không còn.',
      'khong-phai-tin-cua-minh': 'Tin này không phải của bạn.', 'tin-da-xong': 'Tin này đã xong.',
      'khong-tu-mua-cua-minh': 'Không mua được tin của chính mình.',
      'khong-du-bac': 'Không đủ Bạc.', 'duoi-gia-san': 'Giá thấp hơn giá sàn.', 'so-luong-sai': 'Số lượng không hợp lệ.', 'khong-du-so-luong': 'Không đủ số lượng trong túi.', 'mon-nay-khong-ban-duoc': 'Món này không treo bán được.', 'thieu-ban-luu': 'Một bên chưa có bản lưu trên máy chủ.' })[v] || v;
  },
  async sanTreo(uid, gia) {
    const g = Math.round(Number(gia) || 0);
    if (!uid || g <= 0) { this.showToast('Nhập giá đã.'); return; }
    this.sanTai = true;
    const r = await cloudSanTreo(uid, g);
    this.sanTai = false;
    if (!r.ok) { this.showToast(this._sanVi(r.vi || r.reason)); return; }
    this.showToast('Đã treo bán.'); await this._sanNapLai();
  },
  async sanGo(id) {
    this.sanTai = true;
    const r = await cloudSanGo(id);
    this.sanTai = false;
    if (!r.ok) { this.showToast(this._sanVi(r.vi || r.reason)); return; }
    this.showToast('Đã gỡ xuống, món về túi.'); await this._sanNapLai();
  },
  async sanMua(id) {
    this.sanTai = true;
    const r = await cloudSanMua(id);
    this.sanTai = false;
    if (!r.ok) { this.showToast(this._sanVi(r.vi || r.reason)); return; }
    this.showToast('Đã mua.'); await this._sanNapLai();
  },
  // Gia san toi thieu cua mon dang chon o o Treo Ban.
  sanGiaSan(m) { return m && m.itemLv ? giaSanTrangBi(m.itemLv, m.quality, m.plus) : 0; },
  get sanMonDangChon() { return (this.state.gearBag || []).find((g) => g && g.uid === this.sanTreoUid) || null; },
  get sanSanHienTai() { return this.sanGiaSan(this.sanMonDangChon); },
  get sanDuGia() { const s = this.sanSanHienTai; return !s || Math.round(Number(this.sanTreoGia) || 0) >= s; },
  // ---- Treo ban VAT PHAM XEP CHONG ----
  // ⚠ Giá sàn tính CẢ LÔ: sàn một cái × số lượng. Máy chủ chặn lại bằng bảng `san_gia_vp`
  //   (docs/SQL_SAN_GIA_VP.sql, máy sinh từ items.js) — máy chủ không biết `value` của vật phẩm.
  sanVpUid: '', sanVpSo: 1, sanVpGia: '',
  // ⚠ BỎ đan Đan Điền: bảng `san_gia_vp` trên máy chủ (docs/SQL_SAN_GIA_VP.sql) sinh trước khi 27
  //   viên đan được đăng ký, nên máy chủ tra ra `null` rồi từ chối bằng "Món này không treo bán
  //   được". Bày món ra lưới rồi để máy chủ từ chối là bắt người chơi thử mò. Muốn mở thì chạy lại
  //   `_mockup/_covua_wip/_sinh_bang_gia.mjs` và chủ dự án chạy lại tệp SQL đó.
  get sanVpTreoDuoc() {
    const inv = this.state.inventory || {};
    return Object.keys(inv).filter((k) => inv[k] > 0 && this.ITEMS[k] && this.ITEMS[k].value > 0
        && this.ITEMS[k].type !== 'danDien')
      .map((k) => ({ id: k, ten: this.ITEMS[k].name, co: inv[k], san: giaSanVatPham(this.ITEMS[k]) }))
      .sort((a, b) => b.san - a.san);
  },
  get sanVpDangChon() { return this.sanVpTreoDuoc.find((x) => x.id === this.sanVpUid) || null; },
  get sanVpSanLo() { const m = this.sanVpDangChon; return m ? m.san * Math.max(1, Math.round(Number(this.sanVpSo) || 1)) : 0; },
  get sanVpDuGia() { const s = this.sanVpSanLo; return !s || Math.round(Number(this.sanVpGia) || 0) >= s; },
  async sanTreoVp() {
    const m = this.sanVpDangChon; if (!m) return;
    const so = Math.max(1, Math.min(m.co, Math.round(Number(this.sanVpSo) || 1)));
    this.sanTai = true;
    const r = await cloudSanTreoVp(m.id, so, Math.round(Number(this.sanVpGia) || 0));
    this.sanTai = false;
    if (!r.ok) { this.showToast(this._sanVi(r.vi || r.reason)); return; }
    this.showToast('Đã treo bán.'); this.sanVpUid = ''; this.sanVpGia = ''; await this._sanNapLai();
  },
  get sanThueTxt() { return '15%'; },
  sanThue(gia) { return Math.ceil((Number(gia) || 0) * 0.15); },

  // ---- Treo Bán: LƯỚI CÓ ART, cùng khuôn ô với Trưng Bày ----
  // ⚠ Bản trước là hai ô <select> chữ trơn: người bán không nhìn thấy món mình sắp bán. Ô art là
  //   khuôn game đã dùng ở Trưng Bày và Hành Lý — dùng lại, đừng đẻ khuôn thứ ba.
  // ⚠ HAI TAB CỐ ĐỊNH, không mọc/rụng theo thứ đang có: chỗ bấm phải đứng yên giữa hai lần mở.
  sanBanTab: 'do',
  get sanBanTabs() { return [{ id: 'do', ten: 'Trang Bị' }, { id: 'vp', ten: 'Vật Phẩm' }]; },
  sanDatBanTab(t) {
    this.sanBanTab = t;
    this.sanTreoUid = null; this.sanVpUid = '';
    this.sanTreoGia = ''; this.sanVpGia = ''; this.sanVpSo = 1;
  },
  /** Ô của lưới Treo Bán, một dạng cho cả hai tab: { k, ref, ten, san, obj }. */
  get sanBanNguon() {
    if (this.sanBanTab === 'vp') {
      return this.sanVpTreoDuoc.map((m) => ({
        k: 'vp', ref: m.id, ten: m.ten, san: m.san,
        obj: { ...(this.ITEMS[m.id] || {}), id: m.id, qty: m.co },
      }));
    }
    return this.sanDoTreoDuoc.map((g) => this.gearView(g)).filter(Boolean)
      .sort((a, b) => this.qualityRank(b) - this.qualityRank(a) || (b.itemLv || 0) - (a.itemLv || 0))
      .map((v) => ({ k: 'do', ref: v.uid, ten: v.name, san: this.sanGiaSan(v), obj: v }));
  },
  sanChonO(n) {
    if (n.k === 'vp') { this.sanVpUid = (this.sanVpUid === n.ref ? '' : n.ref); this.sanVpSo = 1; this.sanVpGia = ''; }
    else { this.sanTreoUid = (this.sanTreoUid === n.ref ? null : n.ref); this.sanTreoGia = ''; }
  },
  sanDangChonO(n) { return n.k === 'vp' ? this.sanVpUid === n.ref : this.sanTreoUid === n.ref; },
  get sanBanChon() {
    const ref = this.sanBanTab === 'vp' ? this.sanVpUid : this.sanTreoUid;
    return ref ? (this.sanBanNguon.find((n) => n.ref === ref) || null) : null;
  },
  get sanBanSan() { return this.sanBanTab === 'vp' ? this.sanVpSanLo : this.sanSanHienTai; },
  get sanBanDuGia() { return this.sanBanTab === 'vp' ? this.sanVpDuGia : this.sanDuGia; },
  // Một ô giá cho cả hai tab. Getter + setter để `x-model` ghi thẳng về đúng biến của tab đang mở.
  get sanBanGia() { return this.sanBanTab === 'vp' ? this.sanVpGia : this.sanTreoGia; },
  set sanBanGia(v) { if (this.sanBanTab === 'vp') this.sanVpGia = v; else this.sanTreoGia = v; },
  sanBanTreo() {
    if (this.sanBanTab === 'vp') return this.sanTreoVp();
    return this.sanTreo(this.sanTreoUid, this.sanTreoGia);
  },

  // ---------- ĐAN ĐIỀN (Tinh · Khí · Thần) ----------
  // Cửa vào: ô 丹 đè góc trên trái chân dung ở màn Trang Bị. Xem docs/THIET_KE_DAN_DIEN.md.
  ddMo: false,
  ddNhanh: 'tinh',
  moDanDien() { this.ddMo = true; },
  dongDanDien() { this.ddMo = false; },
  chonDdNhanh(nh) { if (DD_NHANH.includes(nh)) this.ddNhanh = nh; },
  DD_NHANH, DD_NHANH_INFO, DD_PHAM_TEN, DD_O, DD_PHAM_NAU_TOI, DD_HON_THUONG,
  get ddBang() { return ddBang(this.state); },
  get ddTongO() { return DD_TONG_O; },
  get ddDaNap() { return ddDemTong(this.state).da; },
  get ddHanSo() { return ['一', '二', '三', '四', '五', '六', '七', '八', '九']; },
  get ddHonDaMo() { return ddHonDaMo(this.state); },
  ddArt(nhanh, pham) { return ddArtCua(nhanh, pham); },
  ddDemNhanh(nh) { return ddDemNhanh(this.state, nh).da; },
  ddONhanh(nh) { return DD_O.reduce((s, n) => s + n, 0); },
  // Cộng thêm của MỘT nhánh — dùng cho khối tổng bên phải trong modal.
  ddCongNhanh(nh) {
    const chi = {}; for (const k of Object.keys(DD_NGAN_SACH[nh] || {})) chi[k] = 0;
    const b = ddBang(this.state);
    for (let p = 1; p <= 9; p++) {
      const n = b[nh][p - 1] || 0; if (!n) continue;
      const v = ddMoiVien(nh, p); for (const k in v) chi[k] += v[k] * n;
    }
    const hon = ddHonDaMo(this.state).reduce((s, p) => s + (DD_HON_THUONG[p - 1] || 0), 0);
    if (hon) for (const k in chi) chi[k] *= (1 + hon);
    return chi;
  },
  get ddHonPct() { return ddHonDaMo(this.state).reduce((s, p) => s + (DD_HON_THUONG[p - 1] || 0), 0); },
  // Bậc thang thưởng của chín Đan Hồn, và tổng khi mở hết — người chơi hỏi "cái này cộng bao nhiêu".
  get ddHonThuongTxt() { return DD_HON_THUONG.map((v) => Math.round(v * 100) + '%').join(' · '); },
  get ddHonTongPct() { return DD_HON_THUONG.reduce((s, v) => s + v, 0); },
  // ⚠ Nhãn lấy ĐÚNG tên game đã đặt (gear.js): "Kháng Tất Cả", "Giảm Thời Gian Khống Chế".
  //   Đừng bịa nhãn mới — người chơi chưa từng gặp ở đâu khác.
  ddNhanChiSo(k) {
    return ({ hpPct: 'Sinh Lực', defPct: 'Phòng Ngự', atkPct: 'Công Kích', nlMax: 'Nội Lực Tối Đa',
      nlRegenPct: 'Hồi Nội Lực', khangPct: 'Kháng Tất Cả', menhTrung: 'Chính Xác',
      ccGiamPct: 'Giảm Thời Gian Khống Chế' })[k] || k;
  },
  ddSoChiSo(k, v) { return ({ nlMax: 1, menhTrung: 1 })[k] ? '+' + Math.round(v) : '+' + (v * 100).toFixed(1) + '%'; },
  // ⚠ MỘT viên cần thước đo mảnh hơn khối tổng: cả lưới mới +20%, nên một viên chỉ 0,06%–0,55%.
  //   Làm tròn một chữ số như khối tổng thì Nhất Phẩm và Nhị Phẩm cùng ra "+0.1%", còn Nội Lực
  //   Tối Đa của Nhất Phẩm ra thẳng "+0". Hai viên khác nhau mà hiện cùng một số là số nói dối.
  ddSoMotVien(k, v) {
    const g = (n) => String(+n.toFixed(2));
    return ({ nlMax: 1, menhTrung: 1 })[k] ? '+' + g(v) : '+' + g(v * 100) + '%';
  },
  /** Chỉ số MỘT viên cộng, dạng [{ten, so}] — dùng cho hộp xác nhận và popup vật phẩm. */
  ddCongMotVien(nhanh, pham) {
    const v = ddMoiVien(nhanh, pham);
    return Object.keys(v).map((k) => ({ ten: this.ddNhanChiSo(k), so: this.ddSoMotVien(k, v[k]) }));
  },
  ddCongMotVienTxt(nhanh, pham) { return this.ddCongMotVien(nhanh, pham).map((r) => r.ten + ' ' + r.so).join(' · '); },
  /**
   * Cùng dữ liệu, dạng HTML MỖI CHỈ SỐ MỘT DÒNG — tên trái, số phải.
   * ⚠ Nhánh Khí có ba chỉ số, gộp một dòng thì nó tự ngắt giữa tên chỉ số ("Hồi Nội / Lực") và
   *   dấu · rơi xuống đầu dòng sau. Chia dòng là để chỗ ngắt do mình quyết, không do bề ngang.
   */
  ddCongMotVienHtml(nhanh, pham) {
    return '<div style="margin:5px 0;color:#6ee7b7">'
      + this.ddCongMotVien(nhanh, pham).map((r) =>
        '<div style="display:flex;justify-content:space-between;gap:14px;line-height:1.55">'
        + '<span>' + r.ten + '</span><b>' + r.so + '</b></div>').join('')
      + '</div>';
  },

  // ---------- LUYỆN ĐAN ĐIỀN — quay lại điểm Tinh · Khí · Thần ----------
  // CHỐT (đo 2026-08-17): trần = cấp Chiến Đấu × 5, giá = 5.000 + cấp × 800.
  //   Cấp 100: trần 500 điểm/nhánh, 85.000 Bạc/lượt, kỳ vọng một lượt ra 250 điểm.
  //   1 điểm Tinh = +1 Phòng Ngự +2 Sinh Lực · 1 điểm Khí = +1 Công Kích.
  // ⚠⚠ Giữ là GHI ĐÈ chứ không cộng dồn — quay ra số thấp hơn là TỤT. Đó là chỗ ăn thua,
  //   và cũng là chỗ tiêu Bạc dài hạn: kéo con số lên dần bằng nhiều lượt.
  // ⚠⚠ LUYỆN KHÔNG DÍNH GÌ TỚI VIÊN ĐAN. Trần neo vào CẤP CHIẾN ĐẤU, y như bản gốc (nhân vật
  //   cấp 159 có trần 706, cấp 108 có trần 452). Bản trước tôi neo vào số viên đã nạp — sai:
  //   người chưa nạp viên nào thì trần bằng 0, cả bảng Luyện đứng chết.
  // ⚠ Một trần DÙNG CHUNG cho cả ba nhánh, không phải mỗi nhánh một trần.
  luyenMo: false,
  luyenThu: null,          // kết quả VỪA QUAY, chưa Giữ — Bỏ là mất
  moLuyenDan() { this.luyenThu = null; this.luyenMo = true; },
  dongLuyenDan() { this.luyenMo = false; this.luyenThu = null; },
  get luyenDiem() { const l = (this.state.danDien && this.state.danDien.luyen) || {}; const r = {}; for (const nh of DD_NHANH) r[nh] = l[nh] || 0; return r; },
  get luyenTran() { return capKyNang(this.state, 'chienDau') * 5; },
  get luyenGia() { return 5000 + capKyNang(this.state, 'chienDau') * 800; },
  get luyenDuTien() { return (this.state.currencies.bac || 0) >= this.luyenGia; },
  quayLuyen() {
    if (!this.luyenDuTien) { this.showToast('Không đủ Bạc (cần ' + this.fmt(this.luyenGia) + ').'); return; }
    this.state.currencies.bac -= this.luyenGia;
    const tran = this.luyenTran, r = {};
    // ⚠⚠ BỘ SINH SỐ CÓ HẠT GIỐNG, không `Math.random()`. Máy chủ phải TÍNH LẠI được mọi đường
    //   thưởng để bắt gian lận (docs/THIET_KE_ONLINE.md đợt D). Bản trước dùng `Math.random()`
    //   nên bài kiểm "tính lại được" báo đỏ, và tải lại trang là bốc lại được kết quả khác.
    //   Miền riêng `luyenDan`: thêm bớt một lần bốc ở đây không xê dịch mọi hệ khác.
    for (const nh of DD_NHANH) r[nh] = Math.floor(rng(this.state, 'luyenDan') * (tran + 1));
    this.luyenThu = r;
    Storage.save(this.state);
  },
  luuLuyen() {
    if (!this.luyenThu) return;
    // ⚠ Vẫn phải tự vệ ở đây dù đã vá lúc nạp: bản lưu nhập tay qua bảng Dev không đi qua đường vá.
    if (!this.state.danDien || typeof this.state.danDien !== 'object') this.state.danDien = {};
    if (!this.state.danDien.luyen) this.state.danDien.luyen = {};
    for (const nh of DD_NHANH) this.state.danDien.luyen[nh] = this.luyenThu[nh];
    this.luyenThu = null; Storage.save(this.state); this.showToast('Đã giữ kết quả luyện.');
  },
  huyLuyen() { this.luyenThu = null; },

  // ---------- NẠP ĐAN vào Đan Điền ----------
  // ⚠ Viên đan là vật phẩm `type: 'danDien'` mang sẵn `nhanh` + `pham`. Ô đích suy TỪ VIÊN, không
  //   cho người chơi chọn — nhánh và phẩm là thuộc tính của viên, chọn được thì thành đổi phẩm.
  // ⚠ Thứ tự BẮT BUỘC: `ddNap` trước, xoá khỏi túi sau. Xoá trước mà ô đã đầy là MẤT VIÊN.
  ddONhanhPham(nhanh, pham) { return DD_O[pham - 1] || 0; },
  /** Ô thứ mấy của hàng `pham` sẽ được lấp ở lượt nạp tới. Ô đó là ô DUY NHẤT bấm được. */
  ddOKeTiep(pham) { return (this.ddBang[this.ddNhanh][pham - 1] || 0) + 1; },
  /**
   * Bấm ô trống ở lưới Đan Điền → hỏi xác nhận → nạp một viên.
   * ⚠ Chỉ ô KẾ TIẾP của hàng nhận bấm. Viên đan luôn rơi vào ô trống đầu tiên, nên cho bấm ô trống
   *   thứ năm rồi lấp ô thứ nhất là đánh đố người chơi.
   */
  bamODanDien(pham) {
    const nh = this.ddNhanh, id = ddItemId(nh, pham), it = this.ITEMS[id];
    if (!it) return;
    if (this.ddConTrong(nh, pham) <= 0) return;
    const co = countItem(this.state, id);
    if (co <= 0) {
      this.showToast('Chưa có ' + it.name + ' trong túi. '
        + (pham <= DD_PHAM_NAU_TOI ? 'Nấu ở nghề Luyện Đan, mục Dược Phương.' : 'Rơi từ Yêu Vương và Bí Cảnh.'));
      return;
    }
    this.hoiXacNhan({
      tieuDe: 'Sử Dụng Đan',
      // ⚠ Đừng ghi thêm "vào ô Nhất Phẩm nhánh Tinh": tên viên ĐÃ mang cả nhánh lẫn phẩm, viết
      //   lại là lặp đúng hai chữ vừa đọc.
      // ⚠ Số viên trong túi đứng trên ẢNH dạng "×18", không viết thành câu "Trong túi có 18 viên."
      //   Mọi ô vật phẩm trong game đều ghi số lượng kiểu đó; viết ra chữ là đẻ khuôn thứ hai.
      loi: 'Sử dụng một <b>' + it.name + '</b>.' + this.ddCongMotVienHtml(nh, pham),
      anh: this.ico(id, it.icon),
      anhSo: '×' + this.fmt(co),
      anhVien: (this.QUALITY[it.quality] || {}).border || '',
      canhBao: 'Dùng rồi không lấy lại được.',
      nut: 'Sử Dụng',
      xong: () => this.napDanDien(id, 1),
    });
  },
  ddConTrong(nhanh, pham) { return this.ddONhanhPham(nhanh, pham) - (this.ddBang[nhanh][pham - 1] || 0); },
  napDanDien(id, so) {
    const it = this.ITEMS[id];
    if (!it || it.type !== 'danDien') return;
    const co = countItem(this.state, id);
    const trong = this.ddConTrong(it.nhanh, it.pham);
    if (trong <= 0) { this.showToast('Ô ' + DD_NHANH_INFO[it.nhanh].ten + ' ' + DD_PHAM_TEN[it.pham - 1] + ' đã đầy.'); return; }
    const n = Math.max(1, Math.min(Number(so) || 1, co, trong));
    let xong = 0;
    for (let i = 0; i < n; i++) { if (!ddNap(this.state, it.nhanh, it.pham)) break; xong++; }
    if (!xong) return;
    removeItem(this.state, id, xong);
    Storage.save(this.state); this._tick++;
    this.showToast('Đã dùng ' + xong + ' viên.');
  },

  // ---------- Tiện ích ----------
  // XOÁ TIẾN TRÌNH — hai lớp chặn: gõ lại đúng TÊN NHÂN VẬT, rồi nhập MẬT KHẨU tài khoản.
  // ⚠ Ô mật khẩu CHỈ hỏi khi đang đăng nhập. Chơi khách thì không có mật khẩu nào để đối chiếu,
  //   bày ô ra là bày một cửa không mở được.
  resetTen: '', resetMk: '', resetDangKiem: false, resetLoi: '',
  resetGame() { this.resetTen = ''; this.resetMk = ''; this.resetLoi = ''; this.resetDangKiem = false; this.confirmReset = true; },
  dongReset() { this.confirmReset = false; this.resetTen = ''; this.resetMk = ''; this.resetLoi = ''; },
  // Nhân vật chưa đặt tên (vào thẳng từ màn tạo) thì không có gì để gõ lại — bỏ qua lớp này.
  get resetCanTen() { return !!((this.state.player.name || '').trim()); },
  get resetTenDung() { return !this.resetCanTen || (this.resetTen || '').trim() === (this.state.player.name || '').trim(); },
  get resetSanSang() { return this.resetTenDung && (!this.isLoggedIn || (this.resetMk || '').length > 0) && !this.resetDangKiem; },
  async doReset() {
    if (!this.resetSanSang) return;
    // ⚠ Đối chiếu mật khẩu bằng cách ĐĂNG NHẬP LẠI chính tài khoản đó. Sai mật khẩu thì Supabase
    //   trả lỗi mà KHÔNG đụng tới phiên đang chạy — người gõ nhầm không bị đá ra ngoài.
    if (this.isLoggedIn) {
      this.resetDangKiem = true; this.resetLoi = '';
      try {
        // ⚠ Tách hai lỗi ra: 400 là SAI MẬT KHẨU, còn lại là không tới được máy chủ. Gộp làm một
        //   thì lúc rớt mạng người chơi bị mắng gõ sai mật khẩu, loay hoay gõ lại mãi.
        const { error } = await cloudSignIn(this.authUserEmail, this.resetMk);
        if (error) { this.resetLoi = error.status === 400 ? 'Mật khẩu không đúng.' : 'Không kết nối được máy chủ.'; return; }
        // ⚠⚠ XOÁ BẢN CLOUD TRƯỚC, KHÔNG THÌ XOÁ HỤT. Chỉ xoá localStorage rồi tải lại thì
        //   `cloudSyncOnLogin` thấy máy này trống mà cloud có dòng, nó kéo bản cloud về —
        //   tiến trình quay lại nguyên vẹn, người chơi tưởng đã xoá.
        // ⚠ Ghi ĐÈ bằng bản trắng chứ KHÔNG xoá dòng: cửa xoá dòng cũng chính là cửa người bị
        //   khoá tài khoản dùng để thoát (xem docs/SQL_LENH_BAI.sql). Ghi đè thì không cần
        //   thêm quyền nào ở Supabase. Chốt chống gian lận chỉ soi phần TĂNG nên bản trắng lọt.
        const day = await cloudPushSave(createInitialState());
        if (!day.ok) { this.resetLoi = 'Máy chủ không nhận lệnh xoá. Thử lại.'; return; }
      } catch (e) { this.resetLoi = 'Không kết nối được máy chủ.'; return; }
      finally { this.resetDangKiem = false; }
    }
    resetting = true; this.confirmReset = false; Storage.wipe(); location.reload();
  },
};

// ---- Khởi động Alpine ----
window.Alpine = Alpine;
window.dangTienMong = dangTienMong;   // expose component factory cho x-data trong view Đăng Tiên Mộng
window.dongPhu = dongPhu;             // expose component factory cho x-data trong view Động Phủ
window.kyTran = kyTran;               // expose component factory cho x-data trong view Kỳ Trận
window.nguTuKy = nguTuKy;             // expose component factory cho x-data trong view Ngũ Tử Kỳ
window.coTuong = coTuong;             // expose component factory cho x-data trong view Cờ Tướng
window.coVua = coVua;                 // expose component factory cho x-data trong view Cờ Vua
window.tienLen = tienLen;             // expose component factory cho x-data trong view Tiến Lên
window.binh = binh;                   // expose component factory cho x-data trong view Binh Xập Xám
window.paoDeKuai = paoDeKuai;         // expose component factory cho x-data trong view Phao Đắc Khoái
window.tuuLau = tuuLau;           // expose component factory cho x-data trong view Tửu Lâu
window.bangPhai = bangPhai;           // expose factory cho x-data view Bang Phái
window.camNang = camNang;
window.timKiemUI = timKiemUI;   // expose factory cho x-data modal Tim Kiem             // expose factory cho x-data modal Cẩm Nang
Alpine.store('game', gameStore);
Alpine.start();
// LỚP PHỦ DỊCH (src/i18n.js) — gắn NGAY SAU Alpine.start: quan sát viên bắt mọi node Alpine chèn
// về sau, còn khung đã vẽ thì quét một lượt. Splash Khai Tịch đang che nên người chơi không thấy
// khung hình tiếng Việt lọt qua. `?lang=` chỉ để trang soi ép ngôn ngữ, không lưu.
batNgonNgu(new URLSearchParams(location.search).get('lang') || (state.settings && state.settings.ngonNgu) || 'vi');
Alpine.store('game').initRoute();           // Hash routing: mở đúng tab theo #link + lập history baseline (vuốt-back về tab trước)
Alpine.store('game').initModalHistory();    // Bộ chặn modal: vuốt-back đóng modal đang mở (reactive theo _MODALS)
window.addEventListener('popstate', () => { const s = window.Alpine?.store('game'); if (!s) return; if (s._mGuard > 0) { s._mGuard--; return; } if (s._mstack && s._mstack.length) { s._modalBack(); return; } s.applyHashRoute(); });   // modal đang mở -> vuốt-back chỉ ĐÓNG modal top, KHÔNG route tab
Alpine.store('game').ensureQuests();
Alpine.store('game').apDungCaiDat();        // Cài Đặt: đổ "giảm hiệu ứng" + trần độ nét xuống ngay khi mở game
// Nhãn Toàn Màn Hình phải theo trạng thái THẬT: người chơi bấm ESC hay F11 thì trình duyệt tự
// thoát, không đi qua nút của mình. Không nghe sự kiện này là nhãn kẹt ở "Thoát Toàn Màn Hình".
['fullscreenchange', 'webkitfullscreenchange'].forEach((e) =>
  document.addEventListener(e, () => { const s = Alpine.store('game'); if (s) s.toanManTick++; }));
Alpine.store('game').checkBossAwayOnce();   // resolve hàng đợi Yêu Vương đã giáng thế lúc vắng mặt
Alpine.store('game').huntsOnLoad();         // Săn Mồi: gộp tiến trình lúc vắng mặt + thông báo
Alpine.store('game').initWorld();           // Giang Hồ AI: khởi tạo world seed (roster bot)
Alpine.store('game').initHoSoKhach();       // Có ?hoso=<mã> trên đường dẫn -> mở hồ sơ người đó
// Đọc người chơi thật cho Phong Vân Bảng. Hoãn 2 giây: lúc mở game còn bận nạp, mà bảng này
// không phải thứ nhìn thấy ngay. Vào tab Phong Vân Bảng thì đọc lại (có hẹn giờ chặn dồn).
setTimeout(() => { try { Alpine.store('game').taiNguoiThat(); } catch (e) {} }, 2000);
// Soát chữ Hán: quên thêm chữ mới vào chuỗi &text= thì Console kêu ngay, khỏi phải tự mắt bắt.
// kiemHanFont() tự nạp cả hai font rồi mới đo nên gọi lúc nào cũng được.
setTimeout(() => { try { kiemHanFont(); } catch (e) {} }, 1500);
Alpine.store('game').initCloud();           // Tài khoản/Cloud: khôi phục phiên Supabase (lazy, offline-safe)
Alpine.store('game').initAuthorSeal();      // Ấn Ký Tác Giả: verify chứng chỉ ký số (offline-safe)

// Cloud save: tự đẩy định kỳ (15s) nếu save đã đổi + đẩy ngay khi ẩn/rời trang (best-effort).
setInterval(() => { const s = window.Alpine?.store('game'); if (s) s.cloudAutoPushTick(); }, 15000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { const s = window.Alpine?.store('game'); if (s) s.cloudAutoPushTick(); } });

// Phím F9: bật/tắt Bảng Dev/Admin (offline)
window.addEventListener('keydown', (e) => {
  if (e.key === 'F9') { e.preventDefault(); const s = window.Alpine?.store('game'); if (s) s.toggleDev(); }
});

// ---- Vòng render mượt (~60fps) ----
function rafLoop() {
  const s = window.Alpine?.store('game');
  if (s) {
    const liveOn = s.view === 'combat' && s.state.activity && s.state.activity.type === 'combat' && !s.state.combat.noiThuong;
    // RỜI màn combat -> ZERO vòng đếm foreground. Nếu không, `_cycleStart` giữ mốc cũ; lúc quay lại
    // `t - _cycleStart >= CYCLE_MS` đúng NGAY -> phát thêm 1 vòng (awardKill) cho khoảng vắng mặt mà
    // advance() ĐÃ tính qua lastResolved -> thưởng đúp, farm được ~2× bằng cách alt-tab mỗi ~8s.
    if (!liveOn && s._cycleStart) s._cycleStart = 0;
    if (liveOn) {
      const t = now();
      s.state.activity.lastResolved = t;   // tạm dừng batch khi đang xem chiến báo theo chu kỳ
      s._cycleNow = t;                      // cho thanh tiến độ vòng cập nhật mượt
      if (!s._cycleStart) { s._cycleStart = t; }                            // vào/QUAY LẠI trận: đếm lại từ 0 (chưa đánh), KHÔNG phát vòng cho phần vắng
      else if (t - s._cycleStart >= CYCLE_MS) { s._cycleStart = t; s.resolveCycle(); } // đếm đủ 8s -> ra vòng
    } else if (s.state.activity) {
      const rep = advance(s.state, now());
      // online: bắn loot float mỗi khi thu vật phẩm. Dùng `soVatPham` (đã gồm phần nhân đôi)
      // chứ không phải `cycles`, và bắn thêm một ô riêng cho món vượt bậc của Đốn Ngộ Cảnh.
      if (rep && rep.type === 'skill' && rep.cycles > 0 && rep.itemId) s.showLootPop(rep.itemId, rep.soVatPham || rep.cycles);
      if (rep && rep.ncVuot > 0 && rep.ncVuotItem) s.showLootPop(rep.ncVuotItem, rep.ncVuot);
      if (rep && rep.arrived && s._teleReturnView) { const v = s._teleReturnView; s._teleReturnView = null; s.navTo(v); }   // Khinh Công tới nơi -> quay lại tab đã bấm "Đổi vùng"
      if (rep && rep.ranOut) s.notifyRanOut(rep);   // hết nguyên liệu -> hoạt động tự dừng, báo rõ lý do
      if (rep && rep.doneLimit) s.notifyDoneLimit(rep);   // làm đủ số lượt đã đặt -> báo xong việc
      if (rep && rep.type === 'combat' && rep.died) s.notifyCombatBgDeath(rep);   // gục khi combat chạy nền -> toast + tổng kết vào chuông
    }
    // Suy yếu: bơm _cycleNow để thanh HP hồi mượt; đủ 60s -> tự khỏi (chạy cả khi không ở màn combat)
    if (s.state.combat && s.state.combat.noiThuong) {
      s._cycleNow = now();
      if (s.state.combat.suyYeuUntil && now() >= s.state.combat.suyYeuUntil) s.recoverFromSuyYeu();
    }
    // Yêu Vương — trận LIVE: lộ 1 lượt mỗi 3s khi đang xem; rời màn thì kết thúc tức thì (chạy nền)
    if (s.bossFight && !s.bossFight.done) {
      if (s.view !== 'worldboss') { s.finishBossFightNow(); }
      else {
        const tb = now();
        if (!s._bossFrameAt) s._bossFrameAt = tb;
        else if (tb - s._bossFrameAt >= BOSS_TURN_MS) { s._bossFrameAt = tb; s.revealBossFrame(); }
      }
    }
  }
  requestAnimationFrame(rafLoop);
}
requestAnimationFrame(rafLoop);
tuBatFPS();                       // vào bằng `?fps=1` là có đồng hồ khung hình ngay trên máy thật

// ---- Tự lưu + tiến độ nền mỗi 5s ----
setInterval(() => {
  const s = window.Alpine?.store('game');
  if (!s) return;
  if (s.state.activity) { const rep = advance(s.state, now()); if (rep && rep.ranOut) s.notifyRanOut(rep); if (rep && rep.doneLimit) s.notifyDoneLimit(rep); if (rep && rep.type === 'combat' && rep.died) s.notifyCombatBgDeath(rep); }   // hết nguyên liệu / xong số lượt / gục nền -> tự dừng + báo (cả khi tab ẩn)
  try { s.svDungKhiHetHan(); } catch (e) {}   // sự kiện đóng cửa -> dừng việc trong vùng sự kiện + đưa về vùng thường. ĐẶT SAU advance() để phần đã cày vẫn được tính.
  if (s.state.combat && s.state.combat.noiThuong && s.state.combat.suyYeuUntil && now() >= s.state.combat.suyYeuUntil) s.recoverFromSuyYeu();   // suy yếu xong khi tab ẩn
  s.tickHunts();          // Săn Mồi: giải quyết lượt săn của Linh Thú (độc lập activity)
  // Đan Bổ Trợ: dọn buff hết hạn (deriveCombat đọc thẳng state.buffs nên phải prune bằng đồng hồ GAME),
  // rồi để Dược Lư tự rút viên kế — CHỈ dạng Tán/Hoàn, dạng Đan phải uống tay.
  try {
    const gone = pruneBuffs(s.state, now());
    if (gone.length) s._tick++;
    const pulled = duocLuTick(s.state, now());
    if (pulled) { s._tick++; s.showToast('Dược Lư · ' + ((s.ITEMS[pulled] || {}).name || 'Đan') + ' phát tác.'); }
  } catch (e) {}
  s.checkTitles();        // Danh Hiệu: mở khoá mới khi đủ cột mốc -> báo toast
  if (document.hidden && s.bossFight && !s.bossFight.done) s.finishBossFightNow(); // tab nền: rafLoop bị throttle → chốt trận LIVE trong 5s, không treo
  s.resolveBossQueue();   // hàng đợi: boss giáng thế khi đang online → tự vây sát ở nền
  try { s.tmTick(); } catch (e) {}    // Tông Môn (nhánh phụ): tu luyện + sản lượng idle (nền & foreground)
  try {                               // Động Phủ: job xây chạy nền -> hoàn công theo giờ thực + báo toast/notif
    const dpDone = resolveDongPhu(s.state, now());
    if (dpDone) {
      const nm = dpDone.target === 'house' ? ((DP_HOUSE_TIERS[dpDone.toLevel] || {}).name || 'Nhà Chính') : ((DP_BUILDINGS[dpDone.target] || {}).name || 'Công trình');
      const label = dpDone.target === 'house' ? (nm + ' (Cấp ' + dpDone.toLevel + ')') : (nm + ' · Cấp ' + dpDone.toLevel);
      s.showToast('Động Phủ · ' + label + ' đã hoàn công!');
      pushNotif(s.state, 'dongPhu', 'Động Phủ hoàn công', label + ' đã dựng xong.', now());
    }
  } catch (e) {}
  Storage.save(s.state);
}, 5000);

// Rời tab khi đang đánh LIVE Yêu Vương → chốt trận ngay (rAF dừng lúc tab ẩn)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  const s = window.Alpine?.store('game');
  if (s && s.bossFight && !s.bossFight.done) s.finishBossFightNow();
});

// ---- Nhịp 1s cho đồng hồ đếm ngược (reactive _tick) ----
setInterval(() => { const s = window.Alpine?.store('game'); if (s) s._tick++; }, 1000);

window.addEventListener('beforeunload', () => {
  if (resetting) return; // đang reset -> KHÔNG lưu đè lên save vừa xoá
  const s = window.Alpine?.store('game');
  if (s) Storage.save(s.state);
});
