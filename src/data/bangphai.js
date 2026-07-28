// ============================================================
// DATA — BANG PHÁI. Bảng số thuần, không logic, không DOM.
//
// Người chơi LẬP BANG và làm bang chủ (nên mới có quyền kích/thăng/hạ chức).
// 12 bang AI suy từ seed là ĐỐI THỦ trên bảng Chinh Phạt, không phải chỗ để xin vào.
// ============================================================

// ---------- CHỨC VỤ ----------
// bac  = thứ bậc (cao hơn thì quyền nhiều hơn). tran = tối đa bao nhiêu người giữ chức này.
export const CHUC = [
  { id: 'bangChu',   ten: 'Minh Chủ',       bac: 6, tran: 1,        mau: '#f5b942' },
  { id: 'phoBang',   ten: 'Phó Minh Chủ',   bac: 5, tran: 2,        mau: '#fbbf24' },
  { id: 'duongChu',  ten: 'Đường Chủ',      bac: 4, tran: 4,        mau: '#e879f9' },
  { id: 'hoPhap',    ten: 'Hộ Pháp',        bac: 3, tran: 6,        mau: '#a78bfa' },
  { id: 'tinhAnh',   ten: 'Tinh Anh',       bac: 2, tran: Infinity, mau: '#60a5fa' },
  { id: 'bangChung', ten: 'Minh Chúng',     bac: 1, tran: Infinity, mau: '#5dcaa5' },
  { id: 'tanNhap',   ten: 'Tân Nhập',       bac: 0, tran: Infinity, mau: '#94a3b8' },
];
export const CHUC_BY_ID = Object.fromEntries(CHUC.map((c) => [c.id, c]));

// ---------- LẬP BANG ----------
export const LV_LAP_BANG = 60;         // Tổng Lv tối thiểu — đủ thấp để không thành cửa chặn
export const PHI_LAP_BANG = 20000;     // Bạc
export const TV_NEN = 12;              // trần thành viên ở cấp bang 1
export const TV_MOI_CAP = 1;           // mỗi 5 cấp bang thêm 1 suất
export const TV_TRAN = 25;             // trần tuyệt đối (khớp docs I4)

// ---------- CỐNG HIẾN ----------
// Bao nhiêu Bạc đổi được 1 Minh Cống. Để 20 thì góp một lần 200.000 Bạc là nhảy mấy cấp minh
// ngay — cấp minh mất hết ý nghĩa. Nay 5.000: Bạc chỉ là đường phụ, đường chính là minh chúng
// cày ra Minh Cống theo giờ.
export const BAC_MOI_MINH_CONG = 5000;

// ---------- CẤP BANG ----------
// Bang Cống dồn lại để lên cấp. Cấp bang mở khoá hàng trong cửa hàng, bậc kĩ năng, suất thành viên.
export const CAP_BANG_MAX = 100;
/** Bang Cống cần để từ cấp n lên n+1. Cong nhẹ, không dốc — bang là việc dài hạn. */
export const bangCongCanCho = (cap) => Math.round(400 * Math.pow(Math.max(1, cap), 1.45));

// ---------- KĨ NĂNG BANG ----------
// ⚠ CỘNG CHỈ SỐ THẬT nhưng ÍT — cả cây học tối đa chỉ tới mức dưới đây, cố ý đặt thấp.
// key trùng đúng tên khoá mà derivedStats/awardKill/effDenom đang đọc, khỏi phải dịch tên.
export const KY_NANG_BANG = [
  { id: 'cuongTheQuyet', ten: 'Cương Thể Quyết',   key: 'hpPct',     moiCap: 0.004, maxLv: 5, capBang: 1,  giaNen: 900,  han: 'Sinh Lực', desc: 'Toàn minh luyện thể, gân cốt dày thêm một tầng.' },
  { id: 'lucBatSon',     ten: 'Lực Bạt Sơn',       key: 'atkPct',    moiCap: 0.004, maxLv: 5, capBang: 1,  giaNen: 900,  han: 'Công Kích', desc: 'Đao pháp Tiên Minh truyền lại, một chiêu nặng hơn một chiêu.' },
  { id: 'hoThanCuongKhi',ten: 'Hộ Thân Cương Khí', key: 'defPct',    moiCap: 0.004, maxLv: 5, capBang: 3,  giaNen: 1100, han: 'Phòng Ngự', desc: 'Cương khí hộ thân, đòn tới người còn chừa một lớp.' },
  { id: 'ngoDaoTamKinh', ten: 'Ngộ Đạo Tâm Kinh',  key: 'expPct',    moiCap: 0.006, maxLv: 5, capBang: 5,  giaNen: 1400, han: 'EXP Chiến Đấu', desc: 'Minh chúng giảng võ cho nhau, ngộ ra nhanh hơn.' },
  { id: 'lungSucQuyet',  ten: 'Lùng Sục Quyết',    key: 'dropPct',   moiCap: 0.006, maxLv: 5, capBang: 8,  giaNen: 1600, han: 'Tỉ Lệ Rơi', desc: 'Tiên Minh có bản đồ riêng — biết chỗ nào yêu thú giấu của.' },
  { id: 'thamTaiQuyet',  ten: 'Tham Tài Quyết',    key: 'bacPct',    moiCap: 0.008, maxLv: 5, capBang: 8,  giaNen: 1600, han: 'Bạc Nhặt', desc: 'Tiên Minh lo đường tiêu thụ, cùng một món bán được giá hơn.' },
  { id: 'thoMocChanQuyet',ten:'Thổ Mộc Chân Quyết',key: 'nghePct',   moiCap: 0.008, maxLv: 5, capBang: 5,  giaNen: 1500, han: 'Nghề Khai Thác', desc: 'Bí truyền khai khoáng đốn mộc — tay nghề nhanh hơn người ngoài.' },
  { id: 'toaQuanQuyet',  ten: 'Toạ Quan Quyết',    key: 'ngheExpPct',moiCap: 0.006, maxLv: 5, capBang: 12, giaNen: 1800, han: 'EXP Nghề', desc: 'Học nghề trong minh có người chỉ, tiến bộ nhanh hơn tự mò.' },
];
export const KY_NANG_BY_ID = Object.fromEntries(KY_NANG_BANG.map((k) => [k.id, k]));
/** Công Tích để nâng kĩ năng lên cấp `lv` (1..maxLv). Cấp sau đắt hơn cấp trước. */
export const giaKyNang = (kn, lv) => Math.round(kn.giaNen * Math.pow(1.85, Math.max(0, lv - 1)));

// ---------- CỬA HÀNG (Minh Hội Các) ----------
// Tiêu Công Tích. `han` = trần mua mỗi ngày (chống dồn Công Tích đổi ồ ạt phá kinh tế).
// `ico` = khoá cho hàm ico() của store (item id hoặc id tiền tệ) · `emoji` = dự phòng khi chưa có art.
// `nhom` chỉ để tô màu thẻ, không ảnh hưởng luật.
export const CUA_HANG_BANG = [
  { id: 'ch_bac', tienTe: 'bac', itemId: null, so: 6000, gia: 500, han: 5, capBang: 1,
    ten: 'Bạc', ico: 'bac', emoji: '🟡', nhom: 'tien',
    desc: 'Ngân khố Tiên Minh đổi ra bạc vụn — tiêu gì cũng được.' },
  { id: 'ch_danHoiSinh', itemId: 'danHoiSinhLuc', so: 10, gia: 400, han: 4, capBang: 1,
    ten: 'Đan Hồi Sinh Lực', ico: 'danHoiSinhLuc', emoji: '🧪', nhom: 'dan',
    desc: 'Đan phòng thân — nhét đầy ô lương thực rồi cứ thế treo máy.' },
  { id: 'ch_honThach', tienTe: 'honThach', itemId: null, so: 200, gia: 700, han: 3, capBang: 1,
    ten: 'Hồn Thạch', ico: 'honThach', emoji: '🔴', nhom: 'tien',
    desc: 'Hồn thạch luyện khí — dùng cho cường hoá và Linh Thú.' },
  { id: 'ch_manh', itemId: 'manhTrangBi', so: 2, gia: 1500, han: 2, capBang: 4,
    ten: 'Mảnh Trang Bị', ico: 'manhTrangBi', emoji: '🧩', nhom: 'hiem',
    desc: 'Ghép đủ bộ Hoàng Kim. Đường lấy Mảnh nhanh nhất ngoài Bí Cảnh.' },
  { id: 'ch_tinhThe', itemId: 'tinhTheYeuVuong', so: 1, gia: 2600, han: 1, capBang: 10,
    ten: 'Tinh Thể Yêu Vương', ico: 'tinhTheYeuVuong', emoji: '💠', nhom: 'hiem',
    desc: 'Kết tinh yêu khí. Chém Yêu Vương cả buổi chưa chắc rơi một viên.' },
  { id: 'ch_nguyenBao', tienTe: 'nguyenBao', itemId: null, so: 30, gia: 4000, han: 1, capBang: 16,
    ten: 'Nguyên Bảo', ico: 'nguyenBao', emoji: '🔷', nhom: 'quy',
    desc: 'Của hiếm trong Minh Khố — chỉ Tiên Minh lớn mới đổi nổi.' },
];
export const CH_NHOM_MAU = { tien: '#fbbf24', dan: '#5dcaa5', hiem: '#a78bfa', quy: '#22d3ee' };

// ---------- CÔNG TRÌNH BANG ----------
// Xây bằng Bạc trong bang khố + thời gian. Mỗi cái mở/khuếch đại một mảng khác nhau.
export const CONG_TRINH = [
  { id: 'tongDan',    ten: 'Tổng Đàn',      maxLv: 10, gioXay: 4,  bacNen: 12000, desc: 'Trụ sở Tiên Minh. Mỗi cấp thêm 1 suất minh chúng và +4% Minh Cống thu vào.',
    moTaCap: (lv) => '+' + lv + ' suất minh chúng · +' + (lv * 4) + '% Minh Cống' },
  { id: 'binhKhiKho', ten: 'Binh Khí Khố',  maxLv: 10, gioXay: 5,  bacNen: 15000, desc: 'Kho binh khí. Mở trần cây kĩ năng nhánh chiến đấu.',
    moTaCap: (lv) => 'trần kĩ năng chiến đấu +' + lv } ,
  { id: 'tuLinhTri',  ten: 'Tụ Linh Trì',   maxLv: 10, gioXay: 6,  bacNen: 18000, desc: 'Ao tụ linh khí. Mỗi cấp +2% EXP Chiến Đấu cho cả minh.',
    moTaCap: (lv) => '+' + (lv * 2) + '% EXP Chiến Đấu toàn minh' },
  { id: 'bangKho',    ten: 'Minh Khố',      maxLv: 10, gioXay: 4,  bacNen: 10000, desc: 'Kho chung. Mỗi cấp +20 ô chứa và +5% Bạc minh chúng nộp về.',
    moTaCap: (lv) => '+' + (lv * 20) + ' ô kho · +' + (lv * 5) + '% Bạc nộp về' },
  { id: 'tramYeuDai', ten: 'Trảm Yêu Đài',  maxLv: 10, gioXay: 8,  bacNen: 22000, desc: 'Đài triệu Yêu Vương về cho cả minh vây đánh. Mỗi cấp Yêu Vương mạnh hơn, thưởng dày hơn.',
    moTaCap: (lv) => lv ? ('Yêu Vương bậc ' + lv) : 'chưa triệu được Yêu Vương' },
];
export const CONG_TRINH_BY_ID = Object.fromEntries(CONG_TRINH.map((c) => [c.id, c]));
/** Bạc để nâng công trình lên cấp `lv`. */
export const giaCongTrinh = (ct, lv) => Math.round(ct.bacNen * Math.pow(1.7, Math.max(0, lv - 1)));
export const gioCongTrinh = (ct, lv) => Math.round(ct.gioXay * Math.pow(1.35, Math.max(0, lv - 1)));

// ---------- NHIỆM VỤ BANG (cả bang cùng góp) ----------
// `loai` quyết định lấy số ở đâu: kill = tổng quái hạ · gather = tổng vật phẩm nghề làm ra
// · bac = Bạc nộp bang khố · boss = số lần hạ Yêu Vương.
export const NV_BANG = [
  { id: 'nvb_san',   loai: 'kill',   ten: 'Vây Sát Yêu Thú',    can: 900,   ct: 700, bangCong: 260, desc: 'Cả minh hạ đủ số yêu thú.' },
  { id: 'nvb_khai',  loai: 'gather', ten: 'Khai Sơn Phá Thạch', can: 700,   ct: 700, bangCong: 260, desc: 'Cả minh làm ra đủ số vật phẩm nghề.' },
  { id: 'nvb_bac',   loai: 'bac',    ten: 'Sung Doanh Minh Khố',can: 90000, ct: 650, bangCong: 300, desc: 'Cả minh nộp đủ Bạc vào Minh Khố.' },
  { id: 'nvb_boss',  loai: 'boss',   ten: 'Trảm Yêu Trừ Hại',   can: 8,     ct: 800, bangCong: 320, desc: 'Cả minh hạ đủ số Yêu Vương.' },
];
export const NV_BANG_MOI_KY = 2;          // mỗi kỳ bốc 2 việc
export const NV_BANG_KY_MS = 7 * 24 * 3600 * 1000;   // đổi việc mỗi tuần

// ---------- NHIỆM VỤ TRUY NÃ ----------
// Bốc mỗi ngày từ chính bảng yêu thú của game. Bậc càng cao thưởng càng dày.
export const TRUY_NA_MOI_NGAY = 4;
export const TRUY_NA_BAC = [
  { id: 1, ten: 'Truy Nã Thường',  mau: '#94a3b8', soNhan: [12, 20], ctNen: 90,  bacNen: 2200,  manh: 0 },
  { id: 2, ten: 'Truy Nã Cấp Bạc', mau: '#67e8f9', soNhan: [22, 34], ctNen: 180, bacNen: 4800,  manh: 0 },
  { id: 3, ten: 'Truy Nã Cấp Vàng',mau: '#fbbf24', soNhan: [36, 52], ctNen: 320, bacNen: 9000,  manh: 1 },
  { id: 4, ten: 'Truy Nã Huyết Lệnh', mau: '#fb7185', soNhan: [1, 2], ctNen: 500, bacNen: 15000, manh: 2, laBoss: true },
];

// ---------- CHINH PHẠT + MÙA ----------
export const MUA_MS = 30 * 24 * 3600 * 1000;         // một mùa 30 ngày
export const CP_MOI_KILL = 5;                        // điểm Chinh Phạt mỗi con quái người chơi hạ
export const CP_MOI_BOSS = 420;                      // hạ Yêu Vương
/** Buff nghề khai thác theo thứ hạng của bang trong một vùng. Chỉ số 0 = hạng 1. */
export const CP_BUFF_HANG = [0.10, 0.06, 0.03];      // +10% / +6% / +3% tốc độ nghề ở vùng đó
export const CP_THONG_TRI_HE_SO = 1.35;              // hơn hạng nhì bằng này lần thì gọi là Thống Trị
/** Thưởng cuối mùa cho bang, theo hạng tổng (Hồn Thạch — khớp docs I5). */
export const MUA_THUONG_BANG = [20000, 15000, 10000, 6000, 4000];

// ---------- BOSS BANG ----------
export const BOSS_BANG_KY_MS = 7 * 24 * 3600 * 1000; // mỗi tuần một con
export const BOSS_BANG_LUOT = 8;                     // trần lượt xuất trận của người chơi mỗi kỳ
export const BOSS_BANG_CD_MS = 20 * 60 * 1000;       // nghỉ giữa hai lượt
export const BOSS_BANG_MAU_HE_SO = 2.2;              // máu = máu Yêu Vương gốc × hệ số × cấp Trảm Yêu Đài

// ---------- QUYỀN ----------
// Ngưỡng bậc chức được làm việc gì. Bang chủ (bậc 6) luôn làm được mọi thứ.
export const QUYEN_MAC_DINH = { rutKho: 3, nhanNv: 0, moiNguoi: 4, duyetDon: 4 };
export const QUYEN_LABEL = {
  rutKho: 'Rút đồ khỏi Minh Khố',
  nhanNv: 'Nhận nhiệm vụ truy nã',
  moiNguoi: 'Chiêu mộ người mới',
  duyetDon: 'Duyệt đơn xin vào',
};
