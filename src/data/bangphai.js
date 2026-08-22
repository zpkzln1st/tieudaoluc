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

// ---------- CHIÊU MỘ: BA ĐƯỜNG, KHÔNG CÒN CHỢ ----------
// Trước đây tab Chiêu Mộ bày thẳng 40 tán tu mạnh nhất — thành cái chợ, mua là xong, và
// vì chỉ lấy phần đỉnh của 200 người nên dải cấp rất hẹp, ai cũng na ná ai.
// Nay ba đường, mỗi đường một tính:
//   1. ĐƠN XIN NHẬP MINH  — người tự tìm đến, mỗi 6 giờ (sinhDonXin), duyệt là vào, KHÔNG tốn Bạc.
//   2. BẢNG CHIÊU HIỀN    — vài tán tu bất kỳ, đổi theo giờ, GIÁ ĐẦY ĐỦ. Không cần quen biết.
//   3. NGƯỜI QUEN Ở TỬU LÂU — ai đã cùng ngươi uống rượu / hỏi chuyện. Phải đủ bậc Giao Tình
//      họ mới chịu nghe lời mời, bù lại giá rẻ dần theo bậc.
export const CHIEU_HIEN_N = 5;                    // số người trên Bảng Chiêu Hiền mỗi lượt
export const CHIEU_HIEN_MS = 4 * 60 * 60 * 1000;  // đổi bảng mỗi 4 giờ

// ---------- GIAO TÌNH (nuôi ở Tửu Lâu, tiêu ở Chiêu Mộ) ----------
// Bậc chứ không phải điểm — nhìn phát biết còn phải gặp mấy lần nữa.
// Mỗi phiên Tửu Lâu (30 phút) một người chỉ lên được MỘT bậc, nên không thể đổ Bạc mua đứt.
export const GIAO_TINH_TRAN = 5;
export const GIAO_TINH_GIAM_BAC = 10;             // mỗi bậc bớt 10% giá mời (bậc 5 = bớt 50%)
// Bao nhiêu bậc thì họ chịu nghe lời mời — CAO THỦ KÉN HƠN. Xét từ trên xuống.
const GIAO_TINH_CAN = [
  { tuTong: 400, can: 3 },
  { tuTong: 200, can: 2 },
  { tuTong: 0,   can: 1 },
];
/** Số bậc Giao Tình cần để mời được một người Tổng Lv `tong`. */
export const giaoTinhCan = (tong) => (GIAO_TINH_CAN.find((m) => (tong || 0) >= m.tuTong) || { can: 1 }).can;

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
  { id: 'cuongTheQuyet', ten: 'Cương Thể Quyết',   key: 'hpPct',     moiCap: 0.004, maxLv: 5, capBang: 1,  giaNen: 900,  han: 'Sinh Lực' },
  { id: 'lucBatSon',     ten: 'Lực Bạt Sơn',       key: 'atkPct',    moiCap: 0.004, maxLv: 5, capBang: 1,  giaNen: 900,  han: 'Công Kích' },
  { id: 'hoThanCuongKhi',ten: 'Hộ Thân Cương Khí', key: 'defPct',    moiCap: 0.004, maxLv: 5, capBang: 3,  giaNen: 1100, han: 'Phòng Ngự' },
  { id: 'ngoDaoTamKinh', ten: 'Ngộ Đạo Tâm Kinh',  key: 'expPct',    moiCap: 0.006, maxLv: 5, capBang: 5,  giaNen: 1400, han: 'EXP Chiến Đấu' },
  { id: 'lungSucQuyet',  ten: 'Lùng Sục Quyết',    key: 'dropPct',   moiCap: 0.006, maxLv: 5, capBang: 8,  giaNen: 1600, han: 'Tỉ Lệ Rơi' },
  { id: 'thamTaiQuyet',  ten: 'Tham Tài Quyết',    key: 'bacPct',    moiCap: 0.008, maxLv: 5, capBang: 8,  giaNen: 1600, han: 'Bạc Nhặt' },
  { id: 'thoMocChanQuyet',ten:'Thổ Mộc Chân Quyết',key: 'nghePct',   moiCap: 0.008, maxLv: 5, capBang: 5,  giaNen: 1500, han: 'Nghề Khai Thác' },
  { id: 'toaQuanQuyet',  ten: 'Toạ Quan Quyết',    key: 'ngheExpPct',moiCap: 0.006, maxLv: 5, capBang: 12, giaNen: 1800, han: 'EXP Nghề' },
  // ---- 4 cây thêm sau. Mỗi `key` dưới đây ĐỀU CÓ CHỖ TIÊU THỤ THẬT, đã cắm tay:
  //   allPct       -> engine/stats.js  (nhân vào Công/Thủ/Sinh Lực/Né/Mệnh, cùng tầng codex+danh hiệu)
  //   honThachPct  -> engine/dungeon.js (thưởng Hồn Thạch mỗi lượt thông quan)
  //   bcDoPhoPct   -> engine/dungeon.js (tỉ lệ đoạt Đồ Phổ trang bị + công cụ)
  //   petExpPct    -> engine/pets.js    (EXP Linh Thú đang mang)
  // ⚠ Thêm key mới mà quên cắm là ra đúng vụ Tham Tài/Lùng Sục: ô hiện "+x%" mà không ăn gì.
  { id: 'hopLucQuyet',   ten: 'Hợp Lực Quyết',     key: 'allPct',      moiCap: 0.003, maxLv: 5, capBang: 15, giaNen: 2400, han: 'Toàn Chỉ Số' },
  { id: 'tuHonQuyet',    ten: 'Tụ Hồn Quyết',      key: 'honThachPct', moiCap: 0.008, maxLv: 5, capBang: 6,  giaNen: 1500, han: 'Hồn Thạch Bí Cảnh' },
  { id: 'tamBaoQuyet',   ten: 'Tầm Bảo Quyết',     key: 'bcDoPhoPct',  moiCap: 0.008, maxLv: 5, capBang: 10, giaNen: 1700, han: 'Đồ Phổ Bí Cảnh' },
  { id: 'mucThuQuyet',   ten: 'Mục Thú Quyết',     key: 'petExpPct',   moiCap: 0.008, maxLv: 5, capBang: 4,  giaNen: 1300, han: 'EXP Linh Thú' },
];
export const KY_NANG_BY_ID = Object.fromEntries(KY_NANG_BANG.map((k) => [k.id, k]));
// Chữ đỡ khi CHƯA CÓ ART (images/tienminh/kn/<id>.webp — xem docs/ART_KYNANG_TIENMINH.md).
// Cả 8 chữ đã nằm sẵn trong subset Noto Serif SC nên không phải đụng vào <head>.
export const KY_NANG_HAN = {
  cuongTheQuyet: '剛', lucBatSon: '力', hoThanCuongKhi: '護', ngoDaoTamKinh: '悟',
  lungSucQuyet: '窺', thamTaiQuyet: '財', thoMocChanQuyet: '土', toaQuanQuyet: '禪',
  // Bốn chữ này CHỌN THEO CHỮ ĐÃ CÓ trong subset, không theo mặt chữ của tên: 搜/牧 chưa có,
  // thêm glyph chỉ vì hai ô đỡ thì không đáng. Triện không buộc phải trùng chữ trong tên
  // (Tụ Linh Trì đóng 靈, Trảm Yêu Đài đóng 斬 — cùng lối).
  hopLucQuyet: '合', tuHonQuyet: '魂', tamBaoQuyet: '秘', mucThuQuyet: '獸',
};
/** Công Tích để nâng kĩ năng lên cấp `lv` (1..maxLv). Cấp sau đắt hơn cấp trước. */
export const giaKyNang = (kn, lv) => Math.round(kn.giaNen * Math.pow(1.85, Math.max(0, lv - 1)));

// ---------- CỬA HÀNG (Minh Hội Các) ----------
// Tiêu Công Tích. `han` = trần mua mỗi ngày (chống dồn Công Tích đổi ồ ạt phá kinh tế).
// `ico` = khoá cho hàm ico() của store (item id hoặc id tiền tệ) · `emoji` = dự phòng khi chưa có art.
// `nhom` chỉ để tô màu thẻ, không ảnh hưởng luật.
//
// ⚠ MÓN CÓ `itemId` THÌ KHÔNG GHI `ten`/`desc` Ở ĐÂY. Lore của vật phẩm đã do tác giả viết
// sẵn trong data/items.js; chép tay sang đây là đẻ ra bản thứ hai rồi lệch nhau — đã dính:
// cửa hàng ghi "Ghép đủ bộ Hoàng Kim..." trong khi ITEMS ghi "Kim loại quý ngưng từ tà khí
// Yêu Vương và tầng sâu Thái Hư...", tên thì cụt mất chữ "Hoàng Kim".
// danhSachHang() tự lấy `name`/`desc` từ ITEMS. Chỉ TIỀN TỆ mới ghi tay (không có ITEMS entry).
export const CUA_HANG_BANG = [
  { id: 'ch_bac', tienTe: 'bac', itemId: null, so: 6000, gia: 500, han: 5, capBang: 1,
    // Ba dòng tiền tệ dưới đây bám đúng bảng A. TIỀN TỆ trong docs/NOI_DUNG_GAME.md
    // (nói TIÊU VÀO ĐÂU), không bịa thêm lore — tiền tệ vốn không có mục trong ITEMS.
    ten: 'Bạc', ico: 'bac', emoji: '🟡', nhom: 'tien',
    desc: 'Tiêu vào nguyên liệu, đan dược, công cụ và phí Bí Cảnh.' },
  // ⚠ Chỗ này từng bán `danHoiSinhLuc` — một id KHÔNG HỀ CÓ trong ITEMS. Mua vào là addItem()
  // ghi thẳng id ma vào túi VÀ vào codex.obtained (Vạn Vật Phổ đếm luôn món không tồn tại),
  // mà ico() không tìm ra ảnh nên rơi về emoji, đứng cạnh mấy món có art nhìn lạc hẳn.
  // Nay dùng Hoạt Huyết Đan: có thật, có sẵn art, healPct 30 nên nằm ô Hồi Sinh Lực chạy đúng
  // như lời mô tả (autoEatTick đọc healPct). Luyện Đan Lv 20 mới tự làm được -> mua vẫn đáng.
  { id: 'ch_danHoiSinh', itemId: 'hoatHuyetDan', so: 20, gia: 400, han: 4, capBang: 1,
    ico: 'hoatHuyetDan', emoji: '💊', nhom: 'dan' },
  { id: 'ch_honThach', tienTe: 'honThach', itemId: null, so: 200, gia: 700, han: 3, capBang: 1,
    ten: 'Hồn Thạch', ico: 'honThach', emoji: '🔴', nhom: 'tien',
    desc: 'Tiêu vào linh thạch, đan dược và Linh Thú bậc cao.' },
  { id: 'ch_manh', itemId: 'manhTrangBi', so: 2, gia: 1500, han: 2, capBang: 4,
    ico: 'manhTrangBi', emoji: '🧩', nhom: 'hiem' },
  { id: 'ch_tinhThe', itemId: 'tinhTheYeuVuong', so: 1, gia: 2600, han: 1, capBang: 10,
    ico: 'tinhTheYeuVuong', emoji: '💠', nhom: 'hiem' },
  { id: 'ch_nguyenBao', tienTe: 'nguyenBao', itemId: null, so: 30, gia: 4000, han: 1, capBang: 16,
    ten: 'Nguyên Bảo', ico: 'nguyenBao', emoji: '🔷', nhom: 'quy',
    desc: 'Tiêu vào dung mạo, ô chứa và đổi tên — không mua được sức mạnh.' },
];
// ---------- DẤU TRIỆN CÔNG TRÌNH ----------
// Năm tấm art cùng một tông (đêm xanh + vàng kim) nên nhìn lướt dễ lẫn. Mỗi công trình
// giữ thêm MỘT SẮC RIÊNG (viền thẻ, vạch đỉnh, tên) và MỘT CHỮ HÁN đóng triện ở góc art.
// Chữ đều nằm trong subset Noto Serif SC (xem HAN_THAN_BAI ở engine/hanfont.js — có máy
// tự soát, thêm chữ mới mà quên khai là Console kêu ngay).
export const TILE_KHAC = {
  tongDan:    { han: '總', mau: '#f5b942', phu: 'Trụ sở' },
  binhKhiKho: { han: '兵', mau: '#fb923c', phu: 'Binh khí' },
  tuLinhTri:  { han: '靈', mau: '#22d3ee', phu: 'Linh khí' },
  bangKho:    { han: '庫', mau: '#c08457', phu: 'Kho tàng' },
  tramYeuDai: { han: '斬', mau: '#fb7185', phu: 'Trảm yêu' },
  // 5 công trình thêm sau — chữ chọn theo chữ ĐÃ CÓ trong subset (煉/藏/演/驛/試 chưa có).
  luyendanphong: { han: '丹', mau: '#34d399', phu: 'Luyện đan' },
  tangkinhcac:   { han: '閣', mau: '#a78bfa', phu: 'Tàng kinh' },
  dienvotruong:  { han: '武', mau: '#f87171', phu: 'Diễn võ' },
  phicaptram:    { han: '飛', mau: '#60a5fa', phu: 'Phi cáp' },
  thikiemdai:    { han: '劍', mau: '#e879f9', phu: 'Thí kiếm' },
};

// ---------- KHUNG ART CÔNG TRÌNH ----------
// Bộ art (images/tienminh/<id>.webp) CÙNG MỘT KHUÔN: cả năm tấm 1254×1254, nền liền, không
// có lề trong suốt — nên KHÔNG cần hệ số riêng từng tấm như bộ cũ.
// Đo trên canvas (dải giữa 32% bề ngang, đếm biên ngang gắt > 18 mức sáng):
//   ĐỈNH kiến trúc — bangKho 7,0% · tuLinhTri 8,5% · tramYeuDai 10,5% · tongDan 12,3%
//                    · binhKhiKho 14,0%  → chỗ thấp nhất là 7,0%.
//   Quét biên độ sáng từng hàng: dải chứa 70% chi tiết là 16-84% → trên là trời, dưới là sân.
// Chọn phóng 118% neo 50%/33%: khung thấy 5,0%→89,8% ảnh gốc, tức CẮT 5% trời trên và 10%
// sân dưới. Khối kiến trúc to thêm 18% mà chóp thấp nhất (7,0%) vẫn dư 2 điểm phần trăm.
// ⚠ Đừng phóng quá 120% — 128% cắt tới 8,4% là ăn mất chóp Minh Khố.
// Vẽ lại art khác khuôn thì phải đo lại hai số này.
export const ART_CT_KHUNG = '50% 33%/118% no-repeat';

export const CH_NHOM_MAU = { tien: '#fbbf24', dan: '#5dcaa5', hiem: '#a78bfa', quy: '#22d3ee' };

// ---------- CÔNG TRÌNH BANG ----------
// Xây bằng Bạc trong bang khố + thời gian. Mỗi cái mở/khuếch đại một mảng khác nhau.
// ⚠ LỜI VĂN: desc chỉ nói CÔNG TRÌNH NÀY LÀM GÌ, một câu, KHÔNG kèm số — số đã nằm ở hai ô
// "Hiện Tại / Sau Khi Nâng" ngay dưới, nhắc lại là thừa và rối.
// moTaCap trả MẢNG [nhãn, giá trị] — mỗi vế MỘT DÒNG, đọc như đọc bảng chứ không phải câu văn.
// Ghi KẾT QUẢ THẬT ở cấp đó ("Chỗ cho 13 người"), không ghi mức cộng thêm ("+1 suất").
export const CONG_TRINH = [
  { id: 'tongDan',    ten: 'Tổng Đàn',      maxLv: 10, gioXay: 4,  bacNen: 12000,
    desc: 'Nhà chính. Nâng cấp để tăng sức chứa và giúp minh chúng nộp Minh Cống nhanh hơn.',
    moTaCap: (lv) => [['Giới hạn thành viên', (12 + lv) + ' người'], ['Minh Cống', '+' + (lv * 4) + '%']] },
  { id: 'binhKhiKho', ten: 'Binh Khí Khố',  maxLv: 10, gioXay: 5,  bacNen: 15000,
    desc: 'Kho vũ khí. Cấp công trình quyết định cấp tối đa có thể học của ba kỹ năng Công Kích, Phòng Ngự và Sinh Lực.',
    moTaCap: (lv) => [['Giới hạn kĩ năng chiến đấu', lv ? ('cấp ' + lv) : 'chưa mở']] },
  { id: 'tuLinhTri',  ten: 'Tụ Linh Trì',   maxLv: 10, gioXay: 6,  bacNen: 18000,
    desc: 'Ao linh khí. Thành viên trong minh khi đánh quái sẽ nhận thêm Kinh Nghiệm.',
    moTaCap: (lv) => [['Kinh nghiệm đánh quái', '+' + (lv * 2) + '%'], ['Áp cho', 'cả Tiên Minh']] },
  { id: 'bangKho',    ten: 'Minh Khố',      maxLv: 10, gioXay: 4,  bacNen: 10000,
    desc: 'Kho chung. Nâng cấp để chứa được nhiều loại vật phẩm hơn và tăng lượng Bạc minh chúng nộp về.',
    moTaCap: (lv) => [['Sức chứa kho', (40 + lv * 20) + ' loại đồ'], ['Bạc minh chúng nộp về', '+' + (lv * 5) + '%']] },
  { id: 'tramYeuDai', ten: 'Trảm Yêu Đài',  maxLv: 10, gioXay: 8,  bacNen: 22000,
    // Vế "cấp càng cao con càng dữ" đã bỏ: `moTaCap` ngay dưới nó in thẳng "Yêu Vương mỗi tuần: bậc N".
    desc: 'Đài triệu Yêu Vương. Mỗi tuần có thể gọi một Yêu Vương để toàn minh cùng tham chiến.',
    moTaCap: (lv) => [['Yêu Vương mỗi tuần', lv ? ('bậc ' + lv) : 'chưa gọi được']] },
  // ---- 5 công trình thêm sau ----
  // ⚠ ID = ĐÚNG TÊN FILE ART tác giả đã đặt (viết thường liền, khác lối camelCase của 5 cái cũ).
  // Giữ nguyên chứ không đổi cho "đẹp": art tra theo images/tienminh/<id>.webp, đổi id là mất ảnh.
  { id: 'luyendanphong', ten: 'Luyện Đan Phòng', maxLv: 10, gioXay: 5,  bacNen: 14000,
    desc: 'Phòng luyện đan. Cấp công trình quyết định cấp tối đa của bốn kỹ năng kiếm chác: Tham Tài, Lùng Sục, Thổ Mộc và Tọa Quan.',
    moTaCap: (lv) => [['Giới hạn quyết kiếm chác', lv ? ('cấp ' + lv) : 'chưa mở']] },
  { id: 'tangkinhcac',   ten: 'Tàng Kinh Các',   maxLv: 10, gioXay: 6,  bacNen: 17000,
    desc: 'Gác chứa kinh. Cấp công trình quyết định cấp tối đa của bốn kỹ năng tu luyện: Ngộ Đạo, Tụ Hồn, Tầm Bảo và Mục Thú.',
    moTaCap: (lv) => [['Giới hạn quyết tu luyện', lv ? ('cấp ' + lv) : 'chưa mở']] },
  { id: 'dienvotruong',  ten: 'Diễn Võ Trường',  maxLv: 10, gioXay: 7,  bacNen: 20000,
    desc: 'Sân luyện võ. Minh chúng tập trận tại đây; mỗi tuần bạn sẽ nhận thêm lượt xuất trận đánh Yêu Vương.',
    moTaCap: (lv) => [['Lượt xuất trận mỗi tuần', (BOSS_BANG_LUOT + lv) + ' lượt']] },
  { id: 'phicaptram',    ten: 'Phi Cáp Trạm',    maxLv: 10, gioXay: 4,  bacNen: 11000,
    desc: 'Trạm chim đưa thư. Danh tiếng Tiên Minh càng cao, càng có nhiều người tìm đến xin gia nhập.',
    moTaCap: (lv) => [['Đơn xin mỗi lượt', (1 + lv) + '-' + (2 + lv) + ' người']] },
  { id: 'thikiemdai',    ten: 'Thí Kiếm Đài',    maxLv: 10, gioXay: 8,  bacNen: 24000,
    desc: 'Đài tỉ kiếm. Minh chúng luyện kỹ năng trên đài, từ đó khi ra ngoài hạ quái sẽ ghi được nhiều điểm Chinh Phạt hơn.',
    moTaCap: (lv) => [['Điểm Chinh Phạt mỗi con', (CP_MOI_KILL + lv) + ' điểm']] },
];
// Nhóm kĩ năng nào bị công trình nào chặn trần. Khoá KHÔNG có trong bảng này thì không ai chặn.
// Cấp ĐÃ HỌC không bao giờ bị lấy lại — trần chỉ chặn việc nâng tiếp (xem hocKyNang).
export const KN_TRAN_THEO_CT = {
  atkPct: 'binhKhiKho', defPct: 'binhKhiKho', hpPct: 'binhKhiKho', allPct: 'binhKhiKho',
  bacPct: 'luyendanphong', dropPct: 'luyendanphong', nghePct: 'luyendanphong', ngheExpPct: 'luyendanphong',
  expPct: 'tangkinhcac', honThachPct: 'tangkinhcac', bcDoPhoPct: 'tangkinhcac', petExpPct: 'tangkinhcac',
};
export const CONG_TRINH_BY_ID = Object.fromEntries(CONG_TRINH.map((c) => [c.id, c]));
/** Bạc để nâng công trình lên cấp `lv`. */
export const giaCongTrinh = (ct, lv) => Math.round(ct.bacNen * Math.pow(1.7, Math.max(0, lv - 1)));
export const gioCongTrinh = (ct, lv) => Math.round(ct.gioXay * Math.pow(1.35, Math.max(0, lv - 1)));

// ---------- NHIỆM VỤ BANG (cả bang cùng góp) ----------
// `loai` quyết định lấy số ở đâu: kill = tổng quái hạ · gather = tổng vật phẩm nghề làm ra
// · bac = Bạc nộp bang khố · boss = số lần hạ Yêu Vương.
export const NV_BANG = [
  { id: 'nvb_san',   loai: 'kill',   ten: 'Vây Sát Yêu Thú',    can: 900,   ct: 700, bangCong: 260 },
  { id: 'nvb_khai',  loai: 'gather', ten: 'Khai Sơn Phá Thạch', can: 700,   ct: 700, bangCong: 260 },
  { id: 'nvb_bac',   loai: 'bac',    ten: 'Sung Doanh Ngân Khố',can: 90000, ct: 650, bangCong: 300 },
  { id: 'nvb_boss',  loai: 'boss',   ten: 'Trảm Yêu Trừ Hại',   can: 8,     ct: 800, bangCong: 320 },
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

// ---------- BANG CHIẾN ----------
// Mỗi tuần Tiên Minh tranh MỘT vùng với MỘT bang đối thủ, bày năm cặp đấu tay đôi.
// ⚠ Nhịp tuần dùng CHUNG biên với Boss Bang (cùng 7 ngày kể từ mốc 0) nên hai kỳ rơi đúng cùng
//   lúc — người chơi chỉ phải nhớ một ngày trong tuần, không phải hai.
export const BC_KY_MS = 7 * 24 * 3600 * 1000;
export const BC_SO_CAP = 5;              // năm cặp đấu tay đôi
export const BC_CAN_THANG = 3;           // thắng ba cặp là thắng cả trận
export const BC_SU_CAP = 4;              // giữ lại bốn trận gần nhất
/** Kẹp cửa thắng của một cặp: cặp nào cũng còn cửa, không có cặp cầm chắc trọn vẹn. */
export const BC_TI_LE_SAN = 0.08;
export const BC_TI_LE_TRAN = 0.92;
/** Ngưỡng đọc cửa thắng của MỘT cặp — nhãn ở cột giữa. Số đo trong `_check_bangchien.mjs`. */
// ⚠ Ngưỡng "Hên Xui" phải ÔM lấy mốc 50%. Để nó bắt đầu từ 0,52 thì một cặp 49% — đúng nghĩa
//   ăn thua đủ — lại bị đọc thành "Hiểm", người chơi bỏ cặp đáng đánh. Ảnh chụp game thật lộ ra.
export const BC_NGUONG = [
  { tu: 0.62, ma: 'an',   ten: 'An Toàn' },
  { tu: 0.47, ma: 'hen',  ten: 'Hên Xui' },
  { tu: 0.33, ma: 'hiem', ten: 'Hiểm' },
  { tu: 0,    ma: 'nguy', ten: 'Nguy Hiểm' },
];
/** Đất Tranh chỉ bốc trong DẢI TRÊN của các vùng đã mở — người cấp 60 tranh vùng Lv 1 là vô nghĩa. */
export const BC_DAI_VUNG = 40;
/** Vét Ngân Khố bang bại trận. Bạc = nền + cấp bang đối thủ × bậc. */
export const BC_VET_BAC_NEN = 8000;
export const BC_VET_BAC_CAP = 900;
export const BC_VET_MANH = [2, 4];       // Mảnh Trang Bị cướp được, theo cấp đối thủ
export const BC_CT_THANG = 600;          // Công Tích cho người chơi khi thắng trận
export const BC_CT_THUA = 120;           // thua vẫn có, ít
/** Thua thì bị vét lại chừng này phần Bạc so với lúc thắng. Không bao giờ vét quá Ngân Khố đang có. */
export const BC_VET_KHI_THUA = 0.6;
/** Giữ được Đất Tranh thì cả minh ăn buff nghề bậc nhất ở vùng đó, đúng một tuần. */
export const BC_BUFF_GIU = 0.10;

// ---------- CẤM ĐỊA ----------
// Giữ được Đất Tranh thì mở luôn một Cấm Địa ở vùng đó: quặng tự chảy về Minh Khố, chỉ người
// trong minh mới có. Mất đất là cấm địa đóng ngay.
// ⚠ Quặng lấy THẲNG từ bảng nghề Đào Khoáng (`SKILLS.thaiKhoang.actions[].zone`), KHÔNG đẻ bảng
//   thứ hai — đẻ bảng thứ hai là mở đường cho hai bảng lệch nhau về sau.
/** Phần so với tốc độ một người đào liên tục. Neo theo tỉ lệ nên vùng cao vùng thấp đều cân. */
export const BC_CAM_DIA_PHAN = 0.04;
/** Dồn tối đa chừng này giờ — tắt game một tuần không đổ về một cục vô lý. Khớp THU_TRAN_MS. */
export const BC_CAM_DIA_TRAN_MS = 24 * 3600 * 1000;

// ---------- THƯƠNG TÍCH ----------
// Minh chúng thua cặp của mình thì có thể trọng thương, nghỉ hai ngày. Trận sau thiếu suất.
// ⚠ NGƯỜI CHƠI KHÔNG BAO GIỜ bị thương — mất suất của chính mình là mất luôn quyền chơi.
export const BC_THUONG_TI_LE = 0.35;
export const BC_THUONG_MS = 2 * 24 * 3600 * 1000;

// ---------- MINH KHỐ ----------
/**
 * Bao nhiêu món góp vào Minh Khố thì được 1 Minh Cống.
 * ⚠⚠ Trước đây engine thưởng `max(1, round(n/4))` MỖI LẦN GỌI, nên chia nhỏ ra bấm nhiều lần
 *    thì được nhiều hơn: đo thật, cùng 100 món thì góp một lần được **26** Minh Cống còn góp
 *    từng món một được **100** — gấp 3,8 lần. Bấm lắt nhắt thành lối chơi TỐT NHẤT, ngược hoàn
 *    toàn. Lại còn không đơn điệu: 20 lần × 5 món chỉ được 20 vì `round(5/4)` = 1.
 *    Nay dồn SỐ DƯ vào `bang.khoDu` nên chia làm mấy lần cũng ra đúng một con số.
 */
export const KHO_MON_MOI_CONG = 4;
/** Ba mức của bộ chọn "mỗi lần rút/góp bao nhiêu". `0` = trọn chồng. */
export const KHO_MUC = [
  { so: 1, ten: '1' },
  { so: 10, ten: '10' },
  { so: 0, ten: 'Hết' },
];

// ---------- TẬP KÍCH ----------
// Bang Chiến là MỘT trận mỗi tuần, vùng do máy chọn. Tập Kích là việc làm HẰNG NGÀY: người chơi
// tự chọn vùng, tự chọn bang, đánh úp để cướp điểm Chinh Phạt của họ ở đúng vùng đó.
// ⚠ Bang AI không có bản lưu — điểm của họ suy từ (hạt giống, mùa, giờ). Phần cướp được phải
//   ghi vào SỔ RIÊNG rồi TRỪ lúc dựng bảng hạng, không thể ghi ngược vào bang AI.
/** Số trận đánh được mỗi ngày. */
export const TK_LUOT_NGAY = 3;
/** Thắng thì cướp chừng này phần điểm của địch ở vùng đó. */
export const TK_PHAN = 0.06;
/** Trần điểm cướp được MỘT trận — chặn đường một trận lật cả bảng hạng. */
export const TK_TRAN_DIEM = 4000;
/** Thua thì mất chừng này phần so với số lẽ ra cướp được. Không bao giờ để điểm âm. */
export const TK_PHAT_PHAN = 0.4;
/**
 * Sức giữ đất của một bang: cấp bang nhân hệ số này, cộng số người nhân hệ số dưới.
 * ⚠⚠ Bản đầu để 26/9 và ẢNH CHỤP lộ ra là hỏng: cả mười hai bang đều ra thẻ "Hiểm" hoặc
 *    "Nguy Hiểm", kể cả bang yếu nhất — đánh đâu cũng thua thì cả màn thành vô nghĩa.
 *    Đo lại ở 18/6: sức ta 418 thì bang yếu nhất ra 0,69 (An Toàn), bang mạnh nhất 0,43 (Hiểm).
 */
export const TK_SUC_CAP = 18;
export const TK_SUC_TV = 6;
/** Mỗi trận đang diễn ra trong vùng làm quân giữ đất phòng bị chặt hơn chừng này. */
export const TK_PHONG_BI = 0.06;
/** Nhiều nhất mấy trận cùng diễn ra trong một vùng. */
export const TK_TRAN_DANG_DANH = 4;
/** Số trận đang diễn ra đổi theo mốc nửa giờ — đủ thấy vùng đang động, không nhấp nháy. */
export const TK_NHIP_MS = 30 * 60 * 1000;
/** Công Tích cho người chơi sau một trận. */
export const TK_CT_THANG = 140;
export const TK_CT_THUA = 30;
/** Sử giữ lại mấy trận gần nhất. */
export const TK_SU_CAP = 12;

// ---------- QUYỀN ----------
// Ngưỡng bậc chức được làm việc gì. Bang chủ (bậc 6) luôn làm được mọi thứ.
export const QUYEN_MAC_DINH = { rutKho: 3, nhanNv: 0, moiNguoi: 4, duyetDon: 4 };
export const QUYEN_LABEL = {
  rutKho: 'Rút đồ khỏi Minh Khố',
  nhanNv: 'Nhận nhiệm vụ truy nã',
  moiNguoi: 'Chiêu mộ người mới',
  duyetDon: 'Duyệt đơn xin vào',
};
