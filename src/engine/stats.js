// ============================================================
// ENGINE — Tính chỉ số chiến đấu dẫn xuất (THUẦN)
// derived = Tứ Trụ (level) + cộng dồn từ trang bị đang mặc.
// ============================================================
import { ITEMS } from '../data/items.js';
// Dòng ẩn Bộ Trang ở file riêng (setbonus.js) để pets.js cũng import được mà không tạo vòng.
// Re-export để mọi nơi vẫn quen đường cũ `từ stats.js`.
import { bangKyNangBonus, bangExpBonus } from './bangbuff.js';   // Bang Phái: kĩ năng bang (+% nhỏ) + Tụ Linh Trì
import { setBonus } from './setbonus.js';
export { SET_TIERS, SET_PCT_KEYS, SET_ELE_KEY, SET_MISC_KEYS, equippedSetCount, setBonus, consumableEffMult } from './setbonus.js';
import { levelFromXp } from './leveling.js';
import { enhanceMul } from './enhance.js';
import { petBonus } from './pets.js';
import { codexBonus } from './codex.js';
import { titleBonus } from './titles.js';
import { danDienBonus } from './dandien.js';   // Đan Điền: Tinh · Khí · Thần

// ---- TRẦN KHÁNG NGŨ HÀNH ----
// Đặt ở đây (tầng DƯỚI) chứ không ở votong.js: votong.js đã import derivedStats từ file này, để
// ngược lại sẽ thành vòng import. Trần = tỉ lệ chặn tối đa của MỘT hệ (doc §1: 0,50–0,75).
export const KHANG_CAP = 0.50;
export function khangClamp(v) { return Math.max(0, Math.min(KHANG_CAP, v || 0)); }

// ---- HAI CHI SO CHET, DOT 3 BAT LEN ----
// Ca hai dung duong cong BAO HOA x/(x+K): tang nhanh luc thap, cham dan luc cao, KHONG BAO GIO cham 1.
// Bat buoc dung dang nay chu khong tuyen tinh — neTranh/menhTrung deu leo toi ~1000 diem o do bac 7
// (do that: neTranh 125 khong do -> 1125 do bac 7), tuyen tinh se pha tran ngay.
export const NE_TRANH_K = 6000;   // neTranh 330 -> 5,2% ; 1125 -> 15,8% ; 3000 -> 33%
export const NE_TRANH_CAP = 0.25; // tran RIENG cua phan ne den tu chi so (tran tong dodge van 0,50)
export function dodgeFromNeTranh(ne) {
  const v = Math.max(0, ne || 0);
  return Math.min(NE_TRANH_CAP, v / (v + NE_TRANH_K));
}
// ---- DOT 4: GIAM THOI GIAN KHONG CHE ----
// 5 dong tren giap tru, moi dong cat THOI GIAN cua mot hieu ung he. Tran 0,60 (khong bao gio mien han).
// CUC KY QUAN TRONG: cac dong nay cat `ticksLeft`, TUYET DOI khong dung vao sat thuong moi hiep cua
// Doc/Bong — DoT tru THANG mau, khong qua Phong Ngu, nen dung vao dmg la doi hoan toan y nghia dong nay.
export const CC_CAP = 0.60;
export function ccClamp(v) { return Math.max(0, Math.min(CC_CAP, v || 0)); }
export const CC_KEYS = ['giamNgat', 'giamCham', 'giamDoc', 'giamBong', 'giamChoang'];

// ---- TRẦN GIẢM SÁT THƯƠNG PHẢI CHỊU ----
// Thay chỗ của cơ chế hồi máu mỗi hiệp (đã bỏ hẳn — xem chú thích ở AFFIX trong gear.js).
// Đây là trục "trụ lâu" MỚI: nó cắt một tỉ lệ cố định của đòn đánh vào, nên KHÔNG mạnh lên theo
// độ dài trận như hồi máu. Trần 0,40 để không bao giờ thành miễn thương.
export const GIAM_NHAN_CAP = 0.40;
export function giamNhanClamp(v) { return Math.max(0, Math.min(GIAM_NHAN_CAP, v || 0)); }

// Hệ số EXP từ TRANG BỊ, CHỈ dùng cho cấp CHIẾN ĐẤU (Tứ Trụ và 9 nghề KHÔNG ăn dòng này).
// Gom vào một hàm để 4 chỗ CỘNG exp và 2 chỗ HIỆN ước tính dùng chung — lệch nhau là số trên
// màn hình nói một đằng, EXP vào túi một nẻo.
// EXP Chiến Đấu: dòng Tăng EXP trên trang bị + Ngộ Đạo Tâm Kinh + Tụ Linh Trì của bang.
// ⚠ Truyền SẴN bộ chỉ số đã dẫn xuất vào (`d`) nếu chỗ gọi đã có. Không truyền thì hàm này chạy
//   THÊM một lần `derivedStats` đầy đủ (đo được 125 µs, 2.452 lượt đọc qua proxy) chỉ để lấy đúng
//   một con số `tangExp` — mà chỗ gọi trong vòng đánh thì vừa dẫn xuất xong.
export function combatExpMult(state, d) { return 1 + ((d || derivedStats(state)).tangExp || 0) + bangExpBonus(state); }

export const MENH_TRUNG_K = 2000; // menhTrung 140 -> 6,5% ; 283 -> 12,4% ; 1014 -> 33,6%
// Ti le VO HIEU HOA ne cua dich: 0 = khong chong duoc gi, 1 = dich khong the ne.
export function hitFromMenhTrung(mt) {
  const v = Math.max(0, mt || 0);
  return v / (v + MENH_TRUNG_K);
}

export function gearStats(state) {
  // 8 stat: 5 lõi + baoKich/baoSat/tocDo (chỉ gear cấp; vào crit/critDmg/spd ở deriveCombat)
  // + khung kháng ngũ hành khangKim..khangTho + khangAll ("Kháng Tất Cả", cộng vào cả 5 hệ).
  // MỌI key ở đây là SỐ NGUYÊN ĐIỂM phần trăm (mẫu baoKich/baoSat) — xem chú thích Math.round bên dưới.
  const g = { congKich: 0, hoThe: 0, neTranh: 0, menhTrung: 0, sinhLuc: 0, baoKich: 0, baoSat: 0, tocDo: 0,
              khangKim: 0, khangMoc: 0, khangThuy: 0, khangHoa: 0, khangTho: 0, khangAll: 0,
              giamNgat: 0, giamCham: 0, giamDoc: 0, giamBong: 0, giamChoang: 0, tangCong: 0, tangExp: 0 };
  const eq = state.equipment || {};
  for (const slot of Object.keys(eq)) {
    const inst = eq[slot];
    if (!inst || !inst.stats) continue;
    const mul = enhanceMul(inst.plus || 0);          // +8%/cấp cường hóa (theo instance)
    for (const k of Object.keys(inst.stats)) {
      // KHÁNG KHÔNG ĂN CƯỜNG HÓA. Nó là % có TRẦN CỨNG nên nhân lên chỉ để đâm vào trần rồi mất trắng:
      // đo thật, bộ giáp bậc 7 cường hóa +15 chạm trần 100% số lần, tức mọi điểm cường hóa đổ vào dòng
      // kháng đều vô nghĩa. Để cường hóa lo chỉ số thô, để phẩm chất lo kháng — hai trục tách bạch.
      const m = k.indexOf('khang') === 0 ? 1 : mul;
      g[k] = (g[k] || 0) + inst.stats[k] * m;
    }
  }
  // DÒNG ẨN kênh A — điểm nguyên, cộng SAU vòng lặp nên KHÔNG ăn cường hóa (nó không thuộc món nào).
  // Cộng vào `g` chứ không vào phần trả về, để mọi trần ở derivedStats (kháng 0,50 · khống chế 0,60 ·
  // tangCong 3) tự động áp mà không phải chép lại chỗ nào.
  const sbFlat = setBonus(state).flat;
  for (const k of Object.keys(sbFlat)) g[k] = (g[k] || 0) + sbFlat[k];
  for (const k in g) g[k] = Math.round(g[k]);
  return g;
}

// Cộng hưởng Ngũ Hành từ trang bị đang mặc: mỗi instance có he + eleDmg → +% ST chiêu CÙNG hệ.
export function gearEle(state) {
  const e = { kim: 0, moc: 0, thuy: 0, hoa: 0, tho: 0 };
  const eq = state.equipment || {};
  for (const slot of Object.keys(eq)) {
    const inst = eq[slot];
    if (inst && inst.he && inst.eleDmg && e[inst.he] != null) e[inst.he] += inst.eleDmg;
  }
  // DÒNG ẨN kênh C — Cộng Hưởng của bộ, dồn vào ĐÚNG hệ khai ở TRANG_SETS[key].he.
  // Đồ bộ để eleDmg = 0 từng món chính là để dành chỗ cho dòng này (7 × 0,10 sẽ vỡ trận).
  const sbEle = setBonus(state).ele;
  for (const he of Object.keys(sbEle)) if (sbEle[he]) e[he] += sbEle[he];
  return e;
}

export function derivedStats(state, opts) {
  const sl = (id) => levelFromXp(state.stats[id]?.xp || 0);
  const g = gearStats(state);
  let congKich  = sl('lucDao') * 5 + g.congKich;
  let hoThe     = sl('hoThe') * 5 + g.hoThe;
  let neTranh   = sl('thanPhap') * 5 + g.neTranh;
  let menhTrung = sl('linhXao') * 5 + g.menhTrung;
  let sinhLuc   = 100 + sl('hoThe') * 10 + g.sinhLuc;
  // ĐIỂM LUYỆN Đan Điền — cộng PHẲNG, đứng cùng tầng với chỉ số trang bị (trước mọi phép nhân %).
  {
    const dl = danDienBonus(state);
    congKich  += dl.luyenKhi  || 0;
    hoThe     += dl.luyenTinh || 0;
    sinhLuc   += (dl.luyenTinh || 0) * 2;   // Tinh thiên về trụ: 1 điểm = 1 Phòng Ngự + 2 Sinh Lực
    menhTrung += dl.luyenThan || 0;
  }
  // Linh Thú đang mang: cộng THẲNG toàn bộ chỉ số pet (full-add, KHÔNG trần). noPet=true -> bỏ qua (cho UI so sánh).
  if (!(opts && opts.noPet)) {
    const pb = petBonus(state);
    if (pb) {
      congKich  += pb.congKich  || 0;
      hoThe     += pb.hoThe     || 0;
      neTranh   += pb.neTranh   || 0;
      menhTrung += pb.menhTrung || 0;
      sinhLuc   += pb.sinhLuc   || 0;
    }
  }
  // Vạn Vật Phổ (Phổ Lực) + Danh Hiệu đang đeo — % chỉ số cộng nhẹ.
  // DÒNG ẨN kênh B (`sp`) đứng chung tầng với Vạn Vật Phổ + Danh Hiệu: CỘNG với nhau rồi mới nhân
  // một lần, tức chúng cộng dồn chứ không nhân chồng. Không dòng roll nào cho % nhân — cả bảng
  // AFFIX chỉ có điểm phẳng — nên đây là thứ chỉ bộ trang mới có.
  // ĐAN ĐIỀN đứng CÙNG TẦNG với Vạn Vật Phổ / Danh Hiệu / Bộ Trang / kĩ năng bang: cộng hết rồi
  // mới nhân MỘT lần, không nhân chồng. Xem engine/dandien.js.
  const dd = danDienBonus(state);
  const cx = codexBonus(state), tb = titleBonus(state), sp = setBonus(state).pct, bg = bangKyNangBonus(state);
  // `bg.allPct` = Hợp Lực Quyết (kĩ năng bang) — đứng CÙNG TẦNG với codex/danh hiệu/bộ trang:
  // cộng hết rồi mới nhân một lần, không nhân chồng.
  congKich  = Math.round(congKich  * (1 + cx.atkPct + cx.allPct + tb.atkPct + tb.allPct + sp.atkPct + sp.allPct + bg.atkPct + bg.allPct + dd.atkPct));
  hoThe     = Math.round(hoThe     * (1 + cx.defPct + cx.allPct + tb.defPct + tb.allPct + sp.defPct + sp.allPct + bg.defPct + bg.allPct + dd.defPct));
  sinhLuc   = Math.round(sinhLuc   * (1 + cx.hpPct  + cx.allPct + tb.hpPct  + tb.allPct + sp.hpPct  + sp.allPct + bg.hpPct  + bg.allPct + dd.hpPct));
  neTranh   = Math.round(neTranh   * (1 + cx.allPct + tb.allPct + sp.allPct + bg.allPct));
  menhTrung = Math.round((menhTrung + (dd.menhTrung||0)) * (1 + cx.allPct + tb.allPct + sp.allPct + bg.allPct));
  const combatLv  = levelFromXp(state.skills['chienDau']?.xp || 0);
  const chienLuc  = congKich + hoThe + neTranh + menhTrung + combatLv * 3;
  // baoKich/baoSat/tocDo: chỉ từ gear (không Tứ Trụ/codex), chuyển thẳng cho deriveCombat.
  // ---- KHÁNG NGŨ HÀNH: điểm nguyên -> tỉ lệ, CỘNG khangAll, rồi KẸP TRẦN ngay tại đây ----
  // Vì sao phải là ĐIỂM NGUYÊN: gearStats chạy `Math.round` trên TỔNG của cả 5 món giáp trụ. Nếu affix
  // ghi tỉ lệ (0,05) thì tổng 0,25 làm tròn về 0 — kháng mất trắng, im lặng; còn tổng 0,6 làm tròn về 1
  // => dmg × (1−1) = MIỄN SÁT THƯƠNG TUYỆT ĐỐI. Cả hai đều không báo lỗi. Dùng mẫu baoKich/baoSat.
  // Vì sao kẹp trần Ở ĐÂY chứ không chỉ trong công thức: derivedStats cũng là nguồn cho UI (khối Phòng
  // Thủ), nên số hiện ra phải đúng bằng số người chơi THẬT SỰ nhận, không phải số thô trước trần.
  // Cường hóa KHÔNG chạm tới kháng (xem gearStats) — nên trần ở đây chỉ chặn trường hợp dồn nhiều món
  // cùng một hệ, chứ không phải chặn cường hóa.
  // ⚠ Nhánh THẦN của Đan Điền cộng vào CẢ NĂM hệ, y như dòng "Kháng Tất Cả" của trang bị — cộng
  //   TRƯỚC khi kẹp trần, để số hiện ra đúng bằng số người chơi thật sự nhận.
  const kAll = (g.khangAll || 0) + (dd.khangPct || 0) * 100;
  const kh = (v) => khangClamp(((v || 0) + kAll) / 100);
  const khang = { kim: kh(g.khangKim), moc: kh(g.khangMoc), thuy: kh(g.khangThuy), hoa: kh(g.khangHoa), tho: kh(g.khangTho) };
  // ccGiam: 5 dòng giảm THỜI GIAN khống chế (điểm nguyên -> tỉ lệ, kẹp trần 0,60).
  // Đan Điền nhánh Thần cắt thêm cả năm dòng, cộng trước khi kẹp trần.
  const ddCc = (dd.ccGiamPct || 0) * 100;
  const ccGiam = { ngat: ccClamp(((g.giamNgat || 0) + ddCc) / 100), cham: ccClamp(((g.giamCham || 0) + ddCc) / 100),
                   doc: ccClamp(((g.giamDoc || 0) + ddCc) / 100), bong: ccClamp(((g.giamBong || 0) + ddCc) / 100),
                   choang: ccClamp(((g.giamChoang || 0) + ddCc) / 100) };
  // tangCong: SỐ TẦNG cộng cho mọi chiêu đang lắp, KHÔNG phải điểm chỉ số. Trần cộng dồn 3.
  // Cắt trần ở đây (không ở gear) để ba món cùng roll Tầng vẫn không vượt được TANG_GEAR_MAX.
  return { congKich, hoThe, neTranh, menhTrung, sinhLuc, chienLuc, baoKich: g.baoKich || 0, baoSat: g.baoSat || 0, tocDo: g.tocDo || 0, khang, ccGiam, tangCong: Math.min(3, g.tangCong || 0), tangExp: (g.tangExp || 0) / 100 };
}
