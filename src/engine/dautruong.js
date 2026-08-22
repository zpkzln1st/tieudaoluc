// ============================================================
// ENGINE — ĐẤU TRƯỜNG (mục 5.1, cờ `dauTruong`). Luật THUẦN, kiểm được bằng node.
//
// PvP KHÔNG ĐỒNG BỘ: đối thủ là BẢN CHỤP bộ chiến đấu người ta tự đẩy lên `ho_so_cong_khai`.
// ⚠⚠ MƯỢN NGUYÊN BỘ MÔ PHỎNG của combat (`deriveCombat` + `makeFight` + `stepFight`) — KHÔNG
//    chép công thức sang. Chép là đẻ bản thứ hai rồi hai bản lệch nhau, đúng lối `dameMotTranBoss`.
// ⚠ Engine KHÔNG đụng túi người chơi: trả bản ghi trận, lớp view mới phát Bạc.
// ============================================================
import { deriveCombat, makeFight, stepFight, chieuById, heInfo, heName, NGU_HANH_LIST } from '../data/votong.js';
import { levelFromXp } from './leveling.js';   // cấp Chiến Đấu — nguồn chân lý, không tự tính lại
import { rngHam } from './rng.js';
import {
  DT_LUOT_NGAY, DT_DIEM_NEN, DT_K, DT_DIEM_SAN, DT_SU_CAP,
  DT_BAC_NEN, DT_BAC_MOI_CAP, DT_BAC_KHI_THUA, DT_TRAN_VONG,
  DT_DAI_GHEP, DT_SO_DOI_THU, DT_BAC,
} from '../data/dautruong.js';

export {
  DT_LUOT_NGAY, DT_DIEM_NEN, DT_K, DT_DIEM_SAN, DT_DAI_GHEP, DT_SO_DOI_THU, DT_BAC,
};

const NGAY_MS = 86400000;
const ngayCua = (now) => Math.floor((now || Date.now()) / NGAY_MS);
// ⚠⚠ HAI KHÚC CHỮ NÀY PHẢI ĐỨNG RIÊNG, không dán vào chuỗi có thẻ HTML. Bộ đếm chuỗi dịch
//    (`_dump_ghep.mjs`) coi mọi chuỗi chứa `<` `>` là MÃ và bỏ qua — dán vào là chữ đó không
//    bao giờ vào từ điển, bản EN/ZH đứng nguyên tiếng Việt mà không ai báo gì.
const MO_MAN_A = ' ôm quyền thi lễ, vận khởi ';
const MO_MAN_B = ' khí — trận đấu bắt đầu.';
const so = (v, mac) => (typeof v === 'number' && isFinite(v) ? v : mac);

export function ensureDauTruong(state) {
  if (!state.dauTruong || typeof state.dauTruong !== 'object') state.dauTruong = {};
  const d = state.dauTruong;
  if (typeof d.diem !== 'number' || !isFinite(d.diem)) d.diem = DT_DIEM_NEN;
  if (typeof d.ngay !== 'number') d.ngay = -1;
  if (typeof d.danh !== 'number') d.danh = 0;
  if (typeof d.thang !== 'number') d.thang = 0;
  if (typeof d.thua !== 'number') d.thua = 0;
  if (!Array.isArray(d.su)) d.su = [];
  return d;
}

/** Sang ngày mới thì trả lại lượt. */
function soatNgay(state, now) {
  const d = ensureDauTruong(state), ng = ngayCua(now);
  if (d.ngay !== ng) { d.ngay = ng; d.danh = 0; }
  return d;
}
export function dtLuotConLai(state, now) {
  return Math.max(0, DT_LUOT_NGAY - (soatNgay(state, now).danh | 0));
}
/** Bậc Đấu Trường của một số điểm. */
export function dtBacCua(diem) {
  return DT_BAC.find((x) => (diem | 0) >= x.tu) || DT_BAC[DT_BAC.length - 1];
}

/**
 * Bản chụp BỘ CHIẾN ĐẤU của chính mình, để đẩy lên `ho_so_cong_khai.chien_bo`.
 * Chỉ giữ đúng thứ dựng lại được một đối thủ: chỉ số, ngũ hành, kháng, và bộ chiêu.
 * ⚠ Số làm tròn hết — bản chụp phải GỌN, cột có chốt 1.200 ký tự ở tệp SQL.
 */
export function dtChupBo(state) {
  const lo = state && state.combat && state.combat.loadout;
  if (!lo) return null;
  let P;
  try { P = deriveCombat(state, lo, { ignoreNoiThuong: true }); } catch (e) { return null; }
  const kh = P.khang || {};
  const khang = {};
  for (const h of NGU_HANH_LIST) khang[h] = Math.round(so(kh[h], 0) * 1000) / 1000;
  return {
    hp: Math.max(1, Math.round(P.maxHP)),
    atk: Math.max(1, Math.round(P.atk)),
    def: Math.max(0, Math.round(P.def)),
    spd: Math.max(1, Math.round(P.spd)),
    he: NGU_HANH_LIST.includes(P.heChinh) ? P.heChinh : NGU_HANH_LIST[0],
    dodge: Math.round(so(P.dodge, 0) * 1000) / 1000,
    khang,
    chieu: (lo.chieu || []).filter(Boolean).slice(0, 4),
  };
}

/**
 * Dựng ĐỐI THỦ cho bộ mô phỏng từ một dòng hồ sơ công khai.
 * ⚠ Dòng nào cũng có thể thiếu / hỏng (người ta chưa chạy tệp SQL, hoặc chụp từ bản cũ). Thiếu
 *   `chien_bo` thì trả null chứ KHÔNG bịa ra một đối thủ — bịa là đánh với người không có thật.
 */
export function dtDoiThu(row) {
  const cb = row && row.chien_bo;
  if (!cb || typeof cb !== 'object') return null;
  // ⚠⚠ Đo THÔ trước rồi mới kẹp. Kẹp `Math.max(1, ...)` TRƯỚC khi soi thì một bản chụp rỗng
  //    cũng thành 1/1 và lọt qua. Ngược lại, đòi `> 1` là loại oan người mới chơi: bản chụp
  //    của nhân vật vừa tạo có Công đúng bằng 5, nhân xuống là ra 1 — vẫn là người có thật.
  const hp = Math.round(so(cb.hp, 0));
  const atk = Math.round(so(cb.atk, 0));
  if (!(hp > 0) || !(atk > 0)) return null;
  const he = NGU_HANH_LIST.includes(cb.he) ? cb.he : NGU_HANH_LIST[0];
  const khang = {};
  for (const h of NGU_HANH_LIST) khang[h] = so((cb.khang || {})[h], 0);
  // Chiêu MẠNH NHẤT trong bộ của người ta thành tuyệt kĩ của đối thủ. Không có chiêu nào thì
  // đối thủ chỉ đánh đòn thường — đúng thực tế, không cần bịa thêm một chiêu.
  let sk = null;
  for (const id of (cb.chieu || [])) {
    const c = chieuById(id);
    if (c && c.mult && (!sk || c.mult > sk.mult)) sk = { name: c.name, mult: c.mult, cd: c.cd || 4, fl: 'thi triển ' + c.name };
  }
  return {
    name: (row.ten || 'Vô Danh'),
    hp, atk, def: Math.max(0, Math.round(so(cb.def, 0))), spd: Math.max(1, Math.round(so(cb.spd, 100))),
    he, khang, dodge: Math.max(0, Math.min(0.5, so(cb.dodge, 0))),
    skill: sk, atkFl: 'ra một chiêu',
  };
}

/** Kỳ vọng thắng theo Elo. Ngang điểm thì 0,5. */
export function dtKyVong(diemTa, diemDich) {
  return 1 / (1 + Math.pow(10, ((diemDich | 0) - (diemTa | 0)) / 400));
}

/** Vì sao chưa vào được Đấu Trường. Trả '' khi vào được — màn trống phải có đường ra. */
export function dauTruongVuong(state, dangNhap) {
  if (!dangNhap) return 'chua-dang-nhap';
  if (!dtChupBo(state)) return 'chua-co-bo-chien-dau';
  return '';
}

/**
 * Lọc + xếp danh sách đối thủ từ các dòng hồ sơ công khai đọc về.
 * ⚠ Bỏ CHÍNH MÌNH và bỏ dòng không dựng được đối thủ. Ưu tiên người gần điểm mình nhất; giang
 *   hồ còn ít người thì nới dải dần ra chứ không trả danh sách rỗng.
 */
export function dtGhepCap(rows, uidMinh, diemMinh) {
  const ds = [];
  for (const r of (rows || [])) {
    if (!r || (uidMinh && r.user_id === uidMinh)) continue;
    const dt = dtDoiThu(r);
    if (!dt) continue;
    ds.push({
      uid: r.user_id, ten: r.ten || 'Vô Danh', avatar: r.avatar || null, danhHieu: r.danh_hieu || null,
      tongCap: r.tong_cap | 0, chienDau: r.chien_dau | 0, chienLuc: Number(r.chien_luc || 0),
      diem: so(r.dau_diem, DT_DIEM_NEN) | 0, doi: dt, row: r,
    });
  }
  const d0 = so(diemMinh, DT_DIEM_NEN);
  ds.forEach((x) => { x.lech = Math.abs(x.diem - d0); });
  ds.sort((a, b) => a.lech - b.lech);
  const gan = ds.filter((x) => x.lech <= DT_DAI_GHEP);
  const ra = (gan.length >= 3 ? gan : ds).slice(0, DT_SO_DOI_THU);
  ra.forEach((x) => { x.bac = dtBacCua(x.diem); x.kyVong = dtKyVong(d0, x.diem); });
  // ⚠ CHỌN theo độ gần điểm, nhưng BÀY theo Đấu Điểm giảm dần. Bày theo độ gần thì hàng đọc ra
  //   1.010 · 950 · 1.080 · 880 — nhìn như một danh sách xáo bừa, không ra bảng xếp hạng nào cả.
  ra.sort((a, b) => b.diem - a.diem);
  return ra;
}

/**
 * Đánh MỘT trận. Bốc CÓ HẠT GIỐNG (miền `dauTruong`) nên máy chủ tính lại được y hệt.
 * Trả bản ghi trận, hoặc `{ loi }` khi chưa đánh được. KHÔNG phát Bạc — lớp view phát.
 */
export function dauTran(state, doiThu, now) {
  const t = now || Date.now();
  const d = soatNgay(state, t);
  if (!doiThu || !doiThu.doi) return { loi: 'khong-co-doi-thu' };
  if (dtLuotConLai(state, t) <= 0) return { loi: 'het-luot' };
  const lo = state.combat && state.combat.loadout;
  if (!lo) return { loi: 'chua-co-bo-chien-dau' };

  let P;
  try { P = deriveCombat(state, lo, { ignoreNoiThuong: true }); } catch (e) { return { loi: 'chua-co-bo-chien-dau' }; }
  const e = doiThu.doi;
  // ⚠ Ép hệ của đối thủ chứ KHÔNG để `rollHe` bốc: hệ là thứ người ta TỰ CHỌN qua Tâm Pháp,
  //   bốc lại là xoá mất lựa chọn của họ và trận nào cũng ra một cửa khác.
  const f = makeFight(P, (lo.chieu || []).filter(Boolean), e, P.maxHP, e.he, P.maxNL, rngHam(state, 'dauTruong'));
  // ⚠⚠ Câu mở màn của `makeFight` viết cho YÊU THÚ: "gầm lên, toàn thân bốc cháy rừng rực".
  //    Đối thủ ở đây là NGƯỜI — để nguyên là một võ giả gầm gừ như dã thú. Ảnh chụp lộ ra chỗ này.
  //    Thay đúng DÒNG ĐẦU, phần còn lại của chiến báo vốn đã hợp cho người.
  if (f.log && f.log.length) {
    const oc = heInfo(e.he).text;
    f.log[0] = {
      h: '<span class="' + oc + '">☯</span> ' + e.name + MO_MAN_A
        + '<span class="' + oc + ' font-medium">' + heName(e.he) + '</span>' + MO_MAN_B,
      c: oc,
    };
  }
  let vong = 0;
  while (!f.over && vong++ < DT_TRAN_VONG) stepFight(f);
  // Hết vòng mà chưa ngã ngũ: ai còn nhiều phần máu hơn thì thắng. Không để trận treo lơ lửng.
  const thang = f.over ? f.result === 'win'
    : (f.p.hp / Math.max(1, f.p.maxHP)) >= (f.e.hp / Math.max(1, f.e.maxHP));

  d.danh = (d.danh | 0) + 1;
  const diemTruoc = Math.round(so(d.diem, DT_DIEM_NEN));
  const ky = dtKyVong(diemTruoc, doiThu.diem);
  const doi = Math.round(DT_K * ((thang ? 1 : 0) - ky));
  const diemSau = Math.max(DT_DIEM_SAN, diemTruoc + doi);
  d.diem = diemSau;
  if (thang) d.thang = (d.thang | 0) + 1; else d.thua = (d.thua | 0) + 1;

  const capCd = Math.max(1, levelFromXp(((state.skills || {}).chienDau || {}).xp || 0));
  const bacDay = DT_BAC_NEN + capCd * DT_BAC_MOI_CAP;
  const bac = Math.round(thang ? bacDay : bacDay * DT_BAC_KHI_THUA);

  const ghi = {
    ts: t, uid: doiThu.uid, ten: doiThu.ten, thang,
    diemTruoc, diemSau, doiDiem: diemSau - diemTruoc, kyVong: ky, bac,
    mauTa: Math.max(0, Math.round(f.p.hp / Math.max(1, f.p.maxHP) * 100)),
    mauDich: Math.max(0, Math.round(f.e.hp / Math.max(1, f.e.maxHP) * 100)),
    giay: f.t | 0,
  };
  d.su = [ghi].concat(d.su || []).slice(0, DT_SU_CAP);
  return { ...ghi, log: f.log };
}
