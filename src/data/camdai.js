// CẦM ĐÀI — khúc mục (danh sách bài hát người chơi tự nghe).
//
// KHÁC HẲN nhạc nền: nhạc nền đổi theo màn/vùng và người chơi không chọn bài; Cầm Đài là chỗ
// người chơi tự bấm nghe. Hai thứ, hai tên, hai thẻ phát riêng — xem `src/engine/camdai.js`.
//
// ⚠ Tên TỆP không dấu, tên HIỂN THỊ nằm ở đây. Tên tệp gốc có dấu tiếng Việt, chữ Hán, ngoặc
//   vuông và ký tự `&`; phục vụ qua HTTP thì phải mã hoá URL và rất dễ vỡ. Đổi tên một lần cho
//   xong (`_mockup/_covua_wip/_doi_ten_playaudio.mjs` giữ bảng đối chiếu).
//
// ⚠ Sáu khúc Hoa ngữ để tên HÁN-VIỆT chứ không để chữ Hán. Hai lẽ: đúng tông xưng hô của game,
//   và khỏi phải nới chuỗi `&text=` của Noto Serif SC ở `index.html` — chỗ ấy đã gãy một lần.

export const CAM_DAI_THU_MUC = 'audio/playaudio/';

/**
 * `ma`  — tên tệp, bỏ đuôi .mp3
 * `ten` — tên hiển thị
 * `phu` — dòng phụ: người hát, hoặc gốc tích khúc nhạc. Để rỗng thì ô phụ tự thu lại.
 */
export const CAM_DAI_KHUC = [
  { ma: 'kiemhieptinhduyen',     ten: 'Kiếm Hiệp Tình Duyên',        phu: 'Trần Phi Bình' },
  { ma: 'giacmongthoitrai',      ten: 'Giấc Mộng Thời Trai',         phu: 'Khúc trong Võ Lâm Truyền Kỳ' },
  { ma: 'daianhhung',            ten: 'Đại Anh Hùng',                phu: '' },
  { ma: 'khucdochanh',           ten: 'Khúc Độc Hành',               phu: '' },
  { ma: 'duongxauotmua',         ten: 'Đường Xa Ướt Mưa',            phu: '' },
  { ma: 'timemtronggiacmo',      ten: 'Tìm Em Trong Giấc Mơ',        phu: '' },
  { ma: 'tinhsaudam',            ten: 'Tình Sâu Đậm, Mưa Mịt Mù',    phu: '' },
  { ma: 'hoadililao',            ten: 'Hoa Địa Li Lao',              phu: '' },
  { ma: 'tamsinhduyen',          ten: 'Tam Sinh Duyên',              phu: '' },
  { ma: 'tamsinhduyen_hoa',      ten: 'Tam Sinh Duyên',              phu: 'Bản Hoa ngữ' },
  { ma: 'suthanhhoa',            ten: 'Thanh Hoa Sứ',                phu: 'Hoa ngữ' },
  { ma: 'tanuyenuonghodiepmong', ten: 'Tân Uyên Ương Hồ Điệp Mộng',  phu: 'Hoa ngữ' },
  { ma: 'longquyenphong',        ten: 'Long Quyển Phong',            phu: 'Hoa ngữ' },
  { ma: 'aigiangsoncanhaimynhan',ten: 'Ái Giang Sơn Cánh Ái Mỹ Nhân',phu: 'Hoa ngữ' },
  { ma: 'nandachuutinhnhan',     ten: 'Nan Đắc Hữu Tình Nhân',       phu: 'Hoa ngữ' },
  { ma: 'camtanhitungtungden',   ten: 'Cảm Tạ Người Từng Ghé Qua',   phu: 'Hoa ngữ' },
  { ma: 'tubatliao',             ten: 'Tử Bất Liễu',                 phu: 'Hoa ngữ' },
];

export const CAM_DAI_MA = CAM_DAI_KHUC.map((k) => k.ma);

export function camDaiDuong(ma) { return CAM_DAI_THU_MUC + ma + '.mp3'; }

export function camDaiKhuc(ma) { return CAM_DAI_KHUC.find((k) => k.ma === ma) || null; }
