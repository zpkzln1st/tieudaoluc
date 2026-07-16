// ============================================================
// ĐÀM ĐẠO — cốt truyện hội thoại với NPC Bách Nghệ Phường.
//   Kiểu 1+2 đan xen: mỗi NPC một câu chuyện chia NHIỀU CHƯƠNG mở dần theo
//   CẤP NGHỀ (req = skillLevel cần); trong mỗi chương là hội thoại có NHÁNH RẼ
//   (player chọn đáp -> NPC phản hồi khác nhau -> hội tụ về đoạn kết chương).
//   Thuần cốt truyện (0 thưởng, cách ly 0-power).
//
//   Cấu trúc: DAMDAO[<skillId>] = { chapters: [ { id, req, title, start, nodes } ] }
//     node = { say: [<lời NPC>...], choices: [ { t:<lời player>, to:<nodeId> } ] }
//     node KHÔNG có choices (hoặc rỗng) = KẾT chương.
//   >>> THÊM NPC: thêm 1 key skillId với chapters tương tự. skillId nghề:
//       phatMoc(Đốn Củi) thaiKhoang(Đào Khoáng) dieuNgu(Câu Cá) daLuyen(Luyện Kim)
//       phanhNham(Nấu Ăn) luyenDan(Luyện Đan) daTao(Rèn Đúc) toaQuan(Thiền Định) doanhTao(Xây Dựng)
// ============================================================

export const DAMDAO = {

  // ===== ÂU DÃ TỬ · Luyện Kim (thần tượng rèn kiếm) — arc mẫu =====
  daLuyen: {
    chapters: [
      {
        id: 'c1', req: 1, title: 'Sơ Ngộ',
        start: 's',
        nodes: {
          s: { say: ['Lò rèn của lão đã cháy ba trăm năm. Ngươi bước tới, mang theo mùi gì đây?', 'Mùi mồ hôi… hay mùi máu?'],
               choices: [ { t: 'Ta chỉ muốn học rèn.', to: 'a' }, { t: 'Ta muốn một thanh thần binh.', to: 'b' } ] },
          a: { say: ['Học rèn? Tốt. Nhưng nhớ — kẻ học rèn, trước phải học ĐỐT.', 'Đốt cái nóng nảy trong lòng, đốt cái tham nơi khóe mắt. Lửa lò chẳng tha một ai.'],
               choices: [ { t: 'Ta hiểu.', to: 'e' } ] },
          b: { say: ['Thần binh?' , 'Kẻ nào tới đây cũng đòi thần binh. Nhưng thần binh không nằm trong lò của lão — nó nằm trong tay kẻ cầm nó.', 'Tay ngươi chưa đủ nặng đâu, tiểu tử.'],
               choices: [ { t: 'Vậy ta sẽ luyện cho đủ nặng.', to: 'e' } ] },
          e: { say: ['Đi đi. Khi nào búa của ngươi biết HÁT, hãy quay lại.', 'Lão còn ở đây — lửa chưa tắt, người chưa đi.'] },
        },
      },
      {
        id: 'c2', req: 20, title: 'Lò Hồn',
        start: 's',
        nodes: {
          s: { say: ['Ngươi trở lại. Tay đã chai, mắt đã tĩnh hơn nhiều.', 'Ngồi xuống. Lão kể ngươi nghe — vì sao một thanh kiếm lại có HỒN.'],
               choices: [ { t: 'Sắt vô tri, làm sao có hồn?', to: 'a' }, { t: 'Hồn kiếm là của ai?', to: 'b' } ] },
          a: { say: ['Sắt vốn vô tri. Nhưng khi ngươi gò nó ngàn lần, mỗi nhát búa in một nhịp tim ngươi vào trong đó.', 'Đến khi thành hình, thanh kiếm thở bằng hơi của ngươi. Đó chính là hồn.'],
               choices: [ { t: 'Vậy rèn kiếm là rèn chính mình.', to: 'c' } ] },
          b: { say: ['Hồn kiếm… một nửa của thợ, một nửa của chủ. Thợ cho nó cái CỐT, chủ cho nó cái MỆNH.', 'Kiếm gặp đúng chủ thì reo. Gặp sai chủ thì gãy.'],
               choices: [ { t: 'Vậy chọn chủ cũng như chọn kiếm.', to: 'c' } ] },
          c: { say: ['Tiểu tử, ngươi bắt đầu hiểu rồi đấy.', 'Rèn khí trước, rèn tâm sau. Tâm loạn thì kiếm cong — dù sắt có tốt đến mấy cũng vô dụng.'] },
        },
      },
      {
        id: 'c3', req: 50, title: 'Cố Kiếm',
        start: 's',
        nodes: {
          s: { say: ['Ngươi thấy thanh kiếm gãy treo trên vách kia chứ? Lão không nỡ vứt.', 'Nó tên Vấn Tâm. Thanh kiếm hay nhất đời lão — và cũng là thanh đã giết người lão thương nhất.'],
               choices: [ { t: 'Kiếm của lão… giết người lão thương?', to: 'a' }, { t: 'Vì sao còn giữ một thanh kiếm gãy?', to: 'b' } ] },
          a: { say: ['Lão rèn nó tặng một người bạn. Hắn mang lên núi, hạ cường địch, thành danh chấn động giang hồ.', 'Rồi một đêm mưa, hắn dùng chính Vấn Tâm… kết liễu đời mình. Kiếm càng sắc, lòng người càng dễ tự thương.'],
               choices: [ { t: 'Vậy là lỗi của thanh kiếm?', to: 'c' } ] },
          b: { say: ['Giữ để mà nhớ. Mỗi thanh kiếm lão rèn rời lò ra giang hồ, lão nào biết nó sẽ làm ai đổ máu.', 'Vấn Tâm quay về với lão — gãy. Như một câu hỏi lão chưa trả lời nổi suốt trăm năm.'],
               choices: [ { t: 'Câu hỏi gì?', to: 'c' } ] },
          c: { say: ['“Rèn ra lợi khí — là cứu người, hay hại người?”', 'Lão vẫn rèn. Vì lão tin: kiếm không thiện, không ác. Thiện ác nằm ở tay người. Ngươi… hãy nhớ lấy.'] },
        },
      },
      {
        id: 'c4', req: 100, title: 'Truyền Thừa',
        start: 's',
        nodes: {
          s: { say: ['Búa của ngươi đã biết hát rồi, tiểu tử ạ. Lão nghe thấy — từ tận nơi đây.', 'Ngồi xuống. Lần này lão không dạy nữa. Lão GIAO.'],
               choices: [ { t: 'Giao gì cho ta?', to: 'a' }, { t: 'Ta e mình chưa xứng.', to: 'b' } ] },
          a: { say: ['Giao lò. Giao lửa. Giao ba trăm năm lão đứng trước cái nóng này.', 'Không phải giao cho đôi tay ngươi — mà giao cho cái TÂM ngươi đã luyện đủ nặng.'],
               choices: [ { t: 'Ta nhận.', to: 'e' } ] },
          b: { say: ['Xứng hay không, chẳng phải ngươi nói. LỬA nói.', 'Lửa đã chọn ngươi từ nhát búa đầu tiên biết hát. Đừng chối bỏ cái mệnh của mình.'],
               choices: [ { t: '…Ta nhận.', to: 'e' } ] },
          e: { say: ['Từ hôm nay, lò này là của ngươi. Lão đi được rồi.', 'Nhớ: rèn khí, rèn tâm, rèn cả cái đời mình. Mỗi thanh kiếm ngươi làm ra — hãy để nó REO, đừng để nó khóc.', 'Đi đi. Giang hồ đang chờ tiếng búa của ngươi.'] },
        },
      },
    ],
  },

};
