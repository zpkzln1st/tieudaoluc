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


  // ===== TIEU PHU LAO TUONG · Don Cui (tieu phu) =====
  phatMoc: {
    chapters: [
      {
        id: 'c1', req: 1, title: "Nhập Lâm",
        start: 's',
        nodes: {
          s: { say: ["Con vác rìu vào rừng của lão hủ, mắt nhìn thẳng cây cao nhất. Lão biết ngay con muốn gì.", "Hạ cây to nhất, cho thiên hạ thấy sức con. Phải không?"], choices: [ { t: "Đúng. Chỉ cây to mới bõ công.", to: 'a' }, { t: "Con muốn học nghề, xin lão chỉ dạy.", to: 'b' } ] },
          a: { say: ["Bõ công… Hừ. Con còn trẻ, nhịp búa còn nóng.", "Cây kia ngàn cân, con bổ được đấy. Nhưng con nghe cây nói gì chưa?"], choices: [ { t: "Cây thì nói được gì?", to: 'c' } ] },
          b: { say: ["Học nghề? Tốt. Nhưng con ơi, đốn củi không phải chuyện cánh tay.", "Trước khi bàn tới sức, lão hỏi con — con nghe cây nói gì chưa?"], choices: [ { t: "Con… chưa từng nghe.", to: 'c' } ] },
          c: { say: ["Chưa nghe thì cứ chặt thử. Lão không cản.", "Sức con đủ rồi. Chỉ có cái nhịp là chưa tới."], choices: [ { t: "Nhịp gì mới được?", to: 'e' } ] },
          e: { say: ["Vung lên, hạ xuống — ai chẳng làm được. Nhưng cây ngã đúng lúc, thớ gỗ chịu tay, đó mới là nhịp.", "Về đi con. Bổ đủ ngàn nhát rồi hẵng quay lại. Chừng ấy tai con mới mở."] },
        },
      },
      {
        id: 'c2', req: 20, title: "Thính Mộc",
        start: 's',
        nodes: {
          s: { say: ["Con trở lại. Tay chai lên rồi, mắt cũng bớt nóng.", "Hôm nay lão dạy con một điều: trước khi vung rìu, áp tai vào thân cây đã."], choices: [ { t: "Áp tai vào cây? Để nghe được gì?", to: 'a' }, { t: "Con xin nghe theo lời lão.", to: 'b' } ] },
          a: { say: ["Cây rỗng ruột thì tiếng đục. Cây còn xanh thì tiếng ngân.", "Cây đã tới tuổi, thớ gỗ tự chùng — nghe như một tiếng thở dài. Cây ấy mới chịu ngã."], choices: [ { t: "Vậy cây chưa tới tuổi thì sao?", to: 'd' } ] },
          b: { say: ["Giỏi. Kẻ biết nghe thắng kẻ biết chặt.", "Sức không nằm ở cánh tay đâu con. Nó nằm ở đúng nhịp, đúng thớ."], choices: [ { t: "Con vẫn chưa hiểu 'đúng thớ'.", to: 'd' } ] },
          d: { say: ["Mỗi thân cây có một thớ chịu ngã, một thớ không. Bổ thuận thớ, một nhát cây đổ. Bổ nghịch, trăm nhát chỉ tổ mòn lưỡi.", "Người cũng thế. Ép nghịch thớ thì gãy. Thuận cái mệnh thì xuôi."], choices: [ { t: "Nghe cây… hóa ra là nghe chính mình.", to: 'e' } ] },
          e: { say: ["Con bắt đầu thấm rồi đó.", "Về nghe thêm ngàn cây nữa. Khi nào tai con phân được cây nào chịu ngã, cây nào không, hãy quay lại."] },
        },
      },
      {
        id: 'c3', req: 50, title: "Thần Mộc",
        start: 's',
        nodes: {
          s: { say: ["Con ngồi xuống. Hôm nay lão kể con nghe chuyện lão chôn trong lòng mấy chục năm.", "Thuở trẻ, lão hung hăng như con bây giờ. Trong rừng có một cây cổ thụ ngàn năm, dân làng thờ làm thần mộc."], choices: [ { t: "Lão đã đốn nó?", to: 'a' }, { t: "Sao lão dám động vào cây thiêng?", to: 'b' } ] },
          a: { say: ["Lão bổ. Vì lão muốn chứng cho thiên hạ thấy chẳng có gì lão không hạ được.", "Nhát cuối, một tiếng răng rắc kéo dài… rồi cả rừng câm bặt. Chim thôi hót, gió thôi lay — như cả rừng nín thở."], choices: [ { t: "Rồi sao nữa, lão?", to: 'd' } ] },
          b: { say: ["Lão trẻ, lão ngông. Lão nghĩ thần mộc thì cũng chỉ là gỗ.", "Đến khi nó đổ, tiếng răng rắc ấy theo lão suốt đời. Đêm nào nhắm mắt lão cũng còn nghe."], choices: [ { t: "Lão hối hận?", to: 'd' } ] },
          d: { say: ["Từ đêm ấy, lão thề chỉ đốn cây nào chịu ngã. Cây chưa tới mệnh, dù đói dù rét lão cũng chừa.", "Kìa — trước mặt con là một cây thiêng như thế. Nhấc rìu lên, hay đặt xuống, tự con chọn lấy."], choices: [ { t: "Con buông rìu, không chặt.", to: 'e' }, { t: "Cây chịu ngã, con mới bổ.", to: 'f' } ] },
          e: { say: ["Buông được rìu, khó hơn vung rìu ngàn lần.", "Biết chừa, biết đủ — điều lão mất cả tuổi trẻ mới hiểu, con hôm nay đã nắm được."] },
          f: { say: ["Phải. Cây chịu ngã mới bổ. Cây chưa tới mệnh thì để nó thở tiếp.", "Con hiểu chữ 'đủ' rồi. Cái tay biết dừng quý hơn cái tay biết chặt."] },
        },
      },
      {
        id: 'c4', req: 100, title: "Truyền Phủ",
        start: 's',
        nodes: {
          s: { say: ["Rìu của con đã biết dừng rồi. Lão nghe ra — từ tiếng con bổ ngoài kia.", "Hôm nay lão hủ không dạy nữa. Lão trao."], choices: [ { t: "Lão trao con thứ gì?", to: 'a' }, { t: "Con e mình chưa đủ tâm.", to: 'b' } ] },
          a: { say: ["Cây rìu này. Lưỡi đã mòn, cán đã nhẵn theo tay lão mấy chục năm.", "Nó không dạy con chặt khỏe hơn đâu con ạ. Nó dạy con dừng đúng lúc."], choices: [ { t: "Con xin nhận.", to: 'e' } ] },
          b: { say: ["Đủ hay chưa, không phải con nói. Rừng nói.", "Rừng còn đó, cây còn mọc. Thứ lão truyền không phải sức, mà là cái tâm biết nhẫn."], choices: [ { t: "…Con nhận.", to: 'e' } ] },
          e: { say: ["Từ nay rìu này là của con. Lão hủ ngồi đây, nghe rừng thở, cũng đủ ấm rồi.", "Nhớ lấy: một búa khai mộc, mười năm luyện lực. Tâm bất định, phủ tất loạn.", "Đi đi con. Rừng già còn dài — cứ nghe cây mà bổ."] },
        },
      },
    ],
  },

  // ===== KHOANG PHU LAO HAC · Dao Khoang (khoang phu) =====
  thaiKhoang: {
    chapters: [
      {
        id: 'c1', req: 1, title: "Hạ Tỉnh",
        start: 's',
        nodes: {
          s: { say: ["Nhóc con. Tụt xuống hầm mà hai mắt sáng như đèn thế kia… lão phu thấy nhiều rồi.", "Dưới này tối. Ánh vàng lại càng chói. Coi chừng nó."], choices: [ { t: "Ta xuống để đào cho bằng được vàng.", to: 'a' }, { t: "Lão trượng, chỉ ta cách đào đi.", to: 'b' } ] },
          a: { say: ["Được vàng. Ai chui xuống đây chẳng vì hai chữ đó.", "Nhưng đất không cho không, nhóc con. Ngươi moi của nó bao nhiêu, nó đòi lại bấy nhiêu — bằng thứ khác."], choices: [ { t: "Đòi lại bằng gì?", to: 'e' } ] },
          b: { say: ["Chỉ? Nghề này chẳng gói được vào một câu mà chỉ.", "Cầm lấy. Cây đèn của lão phu. Xuống đi. Đá tự nó dạy ngươi hết."], choices: [ { t: "Ta nhận đèn.", to: 'e' } ] },
          e: { say: ["Đây, đèn. Dầu đủ một buổi. Cạn dầu thì ngoi lên — đừng cố.", "Đào đi, nhóc con. Rồi khắc biết đất nó đòi lại bao nhiêu."] },
        },
      },
      {
        id: 'c2', req: 20, title: "Địa Tức",
        start: 's',
        nodes: {
          s: { say: ["Trở lại rồi. Tay ngươi đã bám mùi bùn.", "Ngồi xuống. Im. Lão phu hỏi — dưới hầm, ngươi nghe thấy gì chưa?"], choices: [ { t: "Chỉ nghe tiếng cuốc của mình.", to: 'a' }, { t: "Ta nghe… đá kêu răng rắc.", to: 'b' } ] },
          a: { say: ["Chỉ nghe mình. Ừ. Đứa chết trẻ dưới hầm, đứa nào cũng chỉ nghe mỗi mình nó.", "Đá biết thở, nhóc con. Nước rỉ là nó toát mồ hôi. Xà chống rên là nó gắng gượng. Học mà nghe."], choices: [ { t: "Nghe được rồi thì sao?", to: 'c' } ] },
          b: { say: ["Nghe thấy à. Khá. Cái tiếng răng rắc đó — là đá đang nói.", "Nó bảo: chỗ này chống đã mỏi. Kẻ điếc thì bổ cuốc tiếp. Kẻ còn tỉnh thì lùi."], choices: [ { t: "Làm sao biết lúc nào phải lùi?", to: 'c' } ] },
          c: { say: ["Lòng tham, nhóc con, đo bằng số bước ngươi còn dám đi sâu — khi lẽ ra đã phải quay đầu.", "Mỗi bước cố thêm, ngươi đặt cược thêm một phần mạng. Tự cân lấy. Lão phu cân hộ không được."] },
        },
      },
      {
        id: 'c3', req: 50, title: "Băng Tỉnh",
        start: 's',
        nodes: {
          s: { say: ["Xích gần đèn vào. Chuyện này lão phu kể một lần. Chỉ một lần.", "Năm đó có một mạch vàng. Chảy sâu, sâu mãi, không dứt. Lão phu… dứt không ra."], choices: [ { t: "Rồi sao nữa?", to: 'a' }, { t: "Lão đã đào quá sâu?", to: 'b' } ] },
          a: { say: ["Lão phu thúc anh em đào tới. Xà chống rên, lão phu giả điếc. Nước rỉ, lão phu giả mù.", "Vòm hầm sập. Trong tiếng đá gào, mấy huynh đệ nằm lại dưới đó. Tới giờ tên chúng nó vẫn nằm trong ngực lão phu."], choices: [ { t: "Còn lão?", to: 'c' } ] },
          b: { say: ["Quá sâu. Sâu tới chỗ đáng ra phải quay đầu từ ba mươi bước trước.", "Đất đòi lại. Nó chôn sống năm người. Lão phu — bò ra được. Chỉ mình lão phu."], choices: [ { t: "Vì sao chỉ mình lão sống?", to: 'c' } ] },
          c: { say: ["Vì sao à. Câu đó lão phu hỏi mỗi đêm. Đá chẳng đáp.", "Giờ ngươi vừa chạm phải mạch quặng dẫn vào chỗ chống đã mục kia. Lão phu nhìn mắt ngươi là biết."], choices: [ { t: "Ta sẽ đào tiếp mạch đó.", to: 'd' }, { t: "Ta lùi. Mạng đáng hơn vàng.", to: 'f' } ] },
          d: { say: ["Đào tiếp. Ừ. Lão phu năm đó cũng buông đúng câu ấy.", "Vàng dưới đó chờ được ngàn năm, nhóc con. Còn ngươi — sập một lần là hết. Ngoi lên. Nghĩ cho kỹ rồi hẵng cầm lại cuốc."] },
          f: { say: ["Lùi. Nghe được ba chữ đó, lão phu mừng hơn trúng cả mạch vàng.", "Giờ ngươi thấu rồi đấy — vì sao lão phu sợ chính lòng đất. Không phải sợ đá. Sợ cái tham trong ngực mình."] },
        },
      },
      {
        id: 'c4', req: 100, title: "Sinh Lộ",
        start: 's',
        nodes: {
          s: { say: ["Nhóc con. Cây đèn ngươi cầm bấy lâu — trả lão phu.", "Rồi cầm lấy cái này. Đèn cũ của lão phu. Cái đèn duy nhất theo lão phu bò ra khỏi hầm sập năm đó."], choices: [ { t: "Vật quý thế, ta không dám nhận.", to: 'a' }, { t: "Lão trao đèn… là trao điều gì?", to: 'b' } ] },
          a: { say: ["Quý? Nó chỉ là cái đèn ám khói. Nhưng nó soi cho lão phu một đường ra khỏi chỗ chết.", "Lão phu già rồi. Đường về của lão phu ngắn lắm. Ngươi cầm mà soi đường của ngươi."], choices: [ { t: "Ta nhận.", to: 'e' } ] },
          b: { say: ["Trao ngươi một câu. Câu này lão phu đổi bằng máu của năm huynh đệ.", "Đào vừa đủ. Chừa một đường mà về. Nhớ chưa, nhóc con?"], choices: [ { t: "Ta nhớ.", to: 'e' } ] },
          e: { say: ["Quặng dưới đất chẳng mất đi đâu. Ngàn năm nữa nó vẫn nằm đó chờ.", "Chỉ có người là không đào lại được. Sập rồi thì thôi.", "Đi đi. Cầm đèn. Đào cho no bụng — rồi ngoi lên nhìn mặt trời. Đó mới là nghề, nhóc con."] },
        },
      },
    ],
  },

  // ===== NGU ONG PHUC BA · Cau Ca (ngu ong) =====
  dieuNgu: {
    chapters: [
      {
        id: 'c1', req: 1, title: "Thùy Điếu",
        start: 's',
        nodes: {
          s: { say: ["Khà khà — tiểu hữu quăng cần cả buổi, giật lên giật xuống, dọa hết cá của lão hán rồi.", "Nước có bao giờ vội đâu, mà tiểu hữu vội thế?"], choices: [ { t: "Ta muốn câu ngay một con thật to.", to: 'a' }, { t: "Ngồi câu thế này biết bao giờ mới được?", to: 'b' } ] },
          a: { say: ["Con to? Khà khà. Con to nó nằm dưới đáy sâu, nó cũng chờ — chờ y như tiểu hữu chờ nó vậy.", "Kẻ đói bụng thì thấy con nào cũng bé. Ngồi xuống đã, cái đói trong lòng ăn mất con cá to đấy."], choices: [ { t: "Vậy ta phải làm sao?", to: 'e' } ] },
          b: { say: ["Bao giờ à? Khà — nước chẳng hẹn giờ với một ai bao giờ.", "Tiểu hữu tới đây câu cá, hay tới câu cái nóng ruột của chính mình?"], choices: [ { t: "...Ta tới để câu cá.", to: 'e' } ] },
          e: { say: ["Vậy thì buông câu đi. Buông rồi chờ.", "Chờ mãi, chờ đến khi tiểu hữu quên mất mình đang chờ — khắc gặp cái mình chưa hiểu.", "Đi đi. Hồ còn đây, lão hán còn ngồi. Nước chưa cạn thì người chưa vội được đâu."] },
        },
      },
      {
        id: 'c2', req: 20, title: "Quán Thủy",
        start: 's',
        nodes: {
          s: { say: ["Tiểu hữu trở lại rồi. Tay đã bớt run, mắt đã bớt láo liên.", "Ngồi xuống cạnh ông già này. Hôm nay không dạy câu — dạy nhìn."], choices: [ { t: "Nhìn gì? Mặt nước chỉ là mặt nước.", to: 'a' }, { t: "Ta phải nhìn ra sao mới đúng?", to: 'b' } ] },
          a: { say: ["Chỉ là mặt nước? Khà khà. Chỗ kia xoáy nhẹ — có con đang lượn. Chỗ bóng cây lặng kia — cá nấp tránh nắng.", "Mặt nước nói đủ điều. Chỉ kẻ ồn trong lòng mới không nghe ra tĩnh lặng."], choices: [ { t: "Ta chưa thấy được như lão.", to: 'c' } ] },
          b: { say: ["Đừng nhìn bằng con mắt muốn bắt. Nhìn bằng con mắt muốn hiểu.", "Gió đổi chiều, sóng đổi nếp, cá đổi đường bơi. Ai tĩnh đủ lâu, mặt hồ tự vẽ đường cho mà thấy."], choices: [ { t: "Vậy cốt ở một chữ tĩnh?", to: 'c' } ] },
          c: { say: ["Cốt ở tĩnh, ở chờ. Câu được cá, nào phải nhờ giật cho mạnh — mà nhờ ngồi cho yên.", "Tay càng gồng, dây càng đứt. Lòng càng lặng, cá càng gần.", "Nhớ lấy, tiểu hữu: kẻ đọc được mặt nước, mới mong đọc nổi lòng mình."] },
        },
      },
      {
        id: 'c3', req: 50, title: "Ngư Vương",
        start: 's',
        nodes: {
          s: { say: ["Suỵt — tiểu hữu thấy sợi dây căng kia chứ? Nặng lắm... Là nó.", "Con ngư vương ông già này chờ cả một đời. Năm xưa cắn câu một lần rồi vùng thoát, biệt tăm. Nay lại về."], choices: [ { t: "Kéo lên đi! Cả đời lão chờ nó mà!", to: 'a' }, { t: "Sao tay lão lại run? Lão sợ điều gì?", to: 'b' } ] },
          a: { say: ["Khà... Kéo lên. Ừ. Chỉ một cái giật, nó liền thành của lão hán.", "Nhưng tiểu hữu à — lão từng giật một cái như thế, với một người, năm ấy.", "Rồi lão lại buông tay khỏi nàng, như buông một sợi dây câu. Sợ giữ chặt quá thì đứt cả đôi đường."], choices: [ { t: "Người đó... là ai?", to: 'c' } ] },
          b: { say: ["Sợ à? Khà khà. Lão ngồi hồ này mấy chục năm, đâu còn sợ một con cá.", "Lão sợ chính cái tay mình. Sợ nó lại nắm chặt điều đáng ra phải thả.", "Năm xưa có một người, lão thương như thương hồ nước này. Rồi lão buông. Đến giờ vẫn chẳng rõ buông là đúng hay sai."], choices: [ { t: "Vậy giờ lão muốn kéo, hay muốn thả?", to: 'c' } ] },
          c: { say: ["Sợi dây nằm trong tay tiểu hữu rồi đấy. Lão hán không kéo nữa.", "Kéo lên — được con cá cả đời hằng mơ. Thả xuống — được cái lòng nhẹ tênh như mặt hồ lặng gió.", "Tự chọn đi. Có thứ ở đời, chỉ giữ được bằng cách buông ra."] },
        },
      },
      {
        id: 'c4', req: 100, title: "Xả Thủ",
        start: 's',
        nodes: {
          s: { say: ["Tiểu hữu tới rồi. Mặt đã tĩnh như hồ nước buổi sớm — ông già này mừng.", "Ngồi xuống. Lần này lão chẳng dạy câu, cũng chẳng dạy nhìn. Lão trao."], choices: [ { t: "Lão trao ta thứ gì?", to: 'a' }, { t: "Ta học thả cá còn chưa xong.", to: 'b' } ] },
          a: { say: ["Trao cái cần này. Trúc cũ, dây sờn, theo lão hán mấy chục mùa nước.", "Nhưng thứ thật sự trao — là cái thả tay. Được cá là chuyện nhỏ. Biết thả mới là chuyện lớn."], choices: [ { t: "Ta nhận.", to: 'e' } ] },
          b: { say: ["Khà khà — thả cá thì dễ, thả lòng mới khó, tiểu hữu ạ.", "Cả đời ông già này ngồi đây, cũng chỉ học đúng một chữ: buông. Học đến giờ vẫn chưa xong.", "Nhưng tiểu hữu đã đủ tĩnh để bắt đầu học. Thế là được rồi."], choices: [ { t: "Vậy ta xin nhận cần câu.", to: 'e' } ] },
          e: { say: ["Từ nay hồ này, cần này là của tiểu hữu. Lão hán đi thong dong một chuyến.", "Nhớ lấy: nước vẫn chảy, cá vẫn bơi, chỉ lòng người bám víu mới khổ. Buông ra là an.", "Khà khà — đi đây. Con ngư vương ấy, để nó bơi tiếp. Lão hán rốt cuộc cũng thả được rồi."] },
        },
      },
    ],
  },

  // ===== TRU SU LU CONG · Nau An (tru su/dau bep) =====
  phanhNham: {
    chapters: [
      {
        id: 'c1', req: 1, title: "Khai Táo",
        start: 's',
        nodes: {
          s: { say: ["Khách tới rồi! Ngồi xuống — lửa còn ấm, nồi còn nóng.", "Gánh bếp của lão Lữ đi mòn nửa giang hồ. Khách muốn học nấu ăn thật à?"], choices: [ { t: "Ta muốn nấu thật ngon, thật khéo — để lấy tiếng.", to: 'a' }, { t: "Ta chỉ muốn học nhóm một bếp lửa.", to: 'b' } ] },
          a: { say: ["Ha ha! Khách nói y hệt lão thuở trẻ.", "Nấu cho ngon dễ thôi khách à — nấu cho đúng cái bụng người ăn mới khó."], choices: [ { t: "Vậy dạy ta cái khó ấy.", to: 'e' } ] },
          b: { say: ["Nhóm một bếp lửa... nghe nhẹ mà chẳng nhẹ đâu.", "Lửa lớn thì khét, lửa nhỏ thì sống. Canh cho vừa — cũng như canh cái lòng người."], choices: [ { t: "Ta xin học từ ngọn lửa.", to: 'e' } ] },
          e: { say: ["Cầm lấy con dao này. Đi thái, đi nêm, đi cho cháy tay vài bận.", "Khi nào khách nếm được cái đói của kẻ khác trên đầu lưỡi mình — hãy quay lại.", "Gánh bếp này lúc nào cũng chừa cho khách một chỗ. Cứ đi."] },
        },
      },
      {
        id: 'c2', req: 20, title: "Điều Vị",
        start: 's',
        nodes: {
          s: { say: ["Khách trở lại. Tay đã ám mùi hành mùi khói — thơm.", "Ngồi xuống. Hôm nay lão bàn với khách một chữ: NÊM."], choices: [ { t: "Nêm cho thật đậm đà là được chứ gì.", to: 'a' }, { t: "Nêm sao cho vừa miệng người ăn?", to: 'b' } ] },
          a: { say: ["Đậm? Ai mới học cũng tưởng vậy. Sai rồi khách à.", "Nêm chẳng phải làm món nặng thêm — mà làm nó điều hòa.", "Một chút đắng, để bật cái ngọt. Một hạt muối, để dậy cái tươi."], choices: [ { t: "Điều hòa... nghe như dưỡng thân.", to: 'c' } ] },
          b: { say: ["Vừa miệng mọi người? Chẳng món nào vừa được cả thiên hạ đâu.", "Nêm là nêm cho đúng kẻ ngồi trước mặt — người đang lạnh thì thêm cay, người đang mệt thì thêm ngọt."], choices: [ { t: "Vậy nêm món cũng là đọc người.", to: 'c' } ] },
          c: { say: ["Ngũ vị vốn là ngũ tình, khách à. Đắng cay mặn chua ngọt — hệt hỉ nộ ai lạc.", "Điều được cái vị trong nồi, là điều được cái tâm chông chênh của kẻ ngồi ăn."] },
        },
      },
      {
        id: 'c3', req: 50, title: "Tống Yến",
        start: 's',
        nodes: {
          s: { say: ["Khách nấu khá lắm rồi. Nhưng có một bữa... lão chưa dạy ai.", "Bữa cuối cùng — nấu cho một người sắp lìa đời."], choices: [ { t: "Lão từng nấu bữa ấy sao?", to: 'a' }, { t: "Người sắp đi thì còn thiết gì ăn.", to: 'b' } ] },
          a: { say: ["Một lần. Sáng hôm sau, người ấy không còn trên đời nữa.", "Lão nói chẳng nên lời từ biệt — nên lão nói bằng nồi canh, nêm hết những gì còn nợ vào trong đó.", "Từ bận ấy, mỗi lần nhóm lửa, lão đều nêm thêm một chút ngậm ngùi."], choices: [ { t: "...Ta nghe đây.", to: 'c' } ] },
          b: { say: ["Chính lúc sắp buông tay, miếng ăn mới nặng nhất đấy khách.", "Nó không lấp cái bụng — nó lấp cái trống trong lòng, một khắc thôi cũng đủ."], choices: [ { t: "Vậy ta phải nấu bữa ấy thế nào?", to: 'c' } ] },
          c: { say: ["Đi tìm một kẻ đang tuyệt vọng nào đó, dọn cho họ một mâm.", "Rồi khách sẽ tự vỡ ra: bếp lửa lắm khi chẳng để no bụng — mà để an ủi, để chữa, để thay một lời chưa kịp nói."] },
        },
      },
      {
        id: 'c4', req: 100, title: "Tâm Vị",
        start: 's',
        nodes: {
          s: { say: ["Khách về rồi. Mắt khác trước — có gì đã lắng xuống trong đó.", "Lại gần đây. Lão trao khách vật này."], choices: [ { t: "Con dao bếp mẻ này...?", to: 'a' }, { t: "Ta e mình chưa đủ tư cách nhận.", to: 'b' } ] },
          a: { say: ["Con dao mẻ của lão. Theo lão trọn nửa đời, thái qua vạn bữa buồn vui.", "Cầm lấy đi. Cùng với nó, lão gửi khách một câu cuối."], choices: [ { t: "Ta xin nghe.", to: 'e' } ] },
          b: { say: ["Tư cách? Cái đó lão không phong, khách cũng chẳng tự nhận được.", "Kẻ nào từng nêm nồi canh bằng cả tấm lòng — kẻ ấy đã đủ rồi."], choices: [ { t: "...Ta nhận.", to: 'e' } ] },
          e: { say: ["Nêm bằng lưỡi thì ra món. Nêm bằng lòng mới ra vị.", "Đãi khách là một cái đạo, khách à. Có đắng cay đi qua lưỡi, cái ngọt đọng lại sau cùng mới thật.", "Đi đi. Gánh lấy bếp lửa này, mà đi nuôi lấy giang hồ."] },
        },
      },
    ],
  },

  // ===== LY DUOC VUONG · Luyen Dan (duoc vuong) =====
  luyenDan: {
    chapters: [
      {
        id: 'c1', req: 1, title: "Thức Dược",
        start: 's',
        nodes: {
          s: { say: ["Ngươi tới xin luyện thần đan cải tử hoàn sinh?", "Lão phu đặt trước mặt ngươi hai cây cỏ. Nhìn cho kỹ — một cứu người, một lấy mạng."], choices: [ { t: "Hai cây này… giống hệt nhau.", to: 'a' }, { t: "Cho ta nếm thử một ngụm là biết.", to: 'b' } ] },
          a: { say: ["Giống hệt. Ngay lão phu cũng phải soi ba lần mới dám gọi tên.", "Cứu với hại, lắm khi chỉ cách nhau một sợi gân lá.", "Ngươi phân chưa nổi, mà đã đòi luyện đan?"], choices: [ { t: "Vậy xin lão dạy ta phân.", to: 'e' } ] },
          b: { say: ["Nếm thử?", "Cây bên tả, một ngụm ấm người. Cây bên hữu, một ngụm tắt thở.", "Kẻ vội nếm, chết trước khi kịp biết mình cầm nhầm cây nào."], choices: [ { t: "…Ta thu lại lời.", to: 'e' } ] },
          e: { say: ["Về đi. Khi nào mắt ngươi phân được sống với chết, hãy quay lại.", "Lò của lão phu chưa nguội. Ngươi chưa vội được đâu."] },
        },
      },
      {
        id: 'c2', req: 20, title: "Nhất Niệm",
        start: 's',
        nodes: {
          s: { say: ["Ngươi trở lại. Tay đã vững, mắt đã biết ngần ngại.", "Ngồi xuống. Lão phu chỉ cho ngươi chỗ hiểm nhất của nghề này."], choices: [ { t: "Chỗ hiểm nằm ở vị thuốc nào?", to: 'a' }, { t: "Ta đã phân được thuốc với độc rồi.", to: 'b' } ] },
          a: { say: ["Không nằm ở vị thuốc. Nằm ở LỬA.", "Cùng một vị, non lửa một phần là linh dược, quá lửa một phần là kịch độc.", "Cứu hay hại — lắm khi chỉ cách nhau một niệm nóng vội của ngươi."], choices: [ { t: "Vậy phải luyện cái gì trước?", to: 'c' } ] },
          b: { say: ["Phân được thuốc với độc, chưa đủ.", "Cùng một cây, tay ngươi non một hơi thì cứu, già một hơi thì giết.", "Cây chẳng đổi. Đổi là cái niệm trong ngươi."], choices: [ { t: "Vậy phải luyện cái gì trước?", to: 'c' } ] },
          c: { say: ["Luyện đan, trước hết luyện cái NIỆM.", "Niệm vững thì lửa vững. Lửa vững thì thuốc mới ra thuốc.", "Niệm ngươi chao một cái, cả nồi linh dược hóa nồi thuốc chết."] },
        },
      },
      {
        id: 'c3', req: 50, title: "Táng Đan",
        start: 's',
        nodes: {
          s: { say: ["Ngươi ngửi thấy mùi đắng trong gió chứ? Là mẻ đan lão phu chôn dưới gốc mai kia.", "Chôn đan như chôn người. Lão phu chôn ở đó một viên — và một kẻ lão thương nhất."], choices: [ { t: "Viên đan ấy… hại người của lão?", to: 'a' }, { t: "Vì sao chôn cả một mẻ đan?", to: 'b' } ] },
          a: { say: ["Năm ấy nàng lâm trọng bệnh. Lão phu có một phương chưa chắc thành, vội quá, cứ luyện.", "Một niệm muốn cứu cho nhanh, lão thúc già đi một hơi lửa. Viên đan xuống cổ nàng… là độc.", "Lão phu cầm sinh mệnh nàng trong tay, rồi bóp vỡ bằng chính cái vội của mình."], choices: [ { t: "Nay ta cũng có một mạng đang nguy trong tay.", to: 'c' } ] },
          b: { say: ["Chôn để mà nhớ. Mỗi viên đan rời lò, lão phu nào biết nó vào miệng ai, cứu ai, giết ai.", "Có viên cứu được vạn người. Có viên… lão phu đổi bằng người thương nhất đời mình."], choices: [ { t: "Nay ta cũng có một mạng đang nguy trong tay.", to: 'c' } ] },
          c: { say: ["Mẻ đan trước mặt ngươi có thể cứu kẻ đang hấp hối — mà cũng có thể chưa thành.", "Cứu hay không, tự tay ngươi gánh. Không ai gánh thay được.", "Giờ ngươi hiểu rồi — vì sao tay kẻ luyện đan, đời đời vẫn run."] },
        },
      },
      {
        id: 'c4', req: 100, title: "Truyền Lô",
        start: 's',
        nodes: {
          s: { say: ["Tay ngươi hôm nay cầm thìa đan đã không run nữa — mà cũng chẳng dám khinh suất. Vừa đủ.", "Ngồi xuống. Lần này lão phu không dạy. Lão phu TRAO."], choices: [ { t: "Lão trao ta cái gì?", to: 'a' }, { t: "Ta sợ mình cầm không nổi sinh–tử của người.", to: 'b' } ] },
          a: { say: ["Trao cái lò con này. Trao luôn một câu lão phu đổi bằng cả đời.", "Thuốc hay độc, không nằm ở cây cỏ — nằm ở một niệm của ngươi."], choices: [ { t: "Ta xin khắc lấy.", to: 'e' } ] },
          b: { say: ["Sợ là phải. Kẻ cầm sinh–tử người khác mà không sợ, lão phu không dám trao.", "Chính cái sợ ấy giữ cho niệm ngươi khỏi vội. Đừng vứt nó đi."], choices: [ { t: "Ta xin khắc lấy.", to: 'e' } ] },
          e: { say: ["Từ nay lò này là của ngươi. Linh dược cứu người, độc thảo sát mệnh — giữa hai thứ ấy, chỉ cách một niệm.", "Giữ cho niệm ấy vững, ngươi mới xứng cầm sinh–tử của kẻ khác trong tay.", "Đi đi. Thiên hạ nhiều bệnh, mà thiếu người dám gánh."] },
        },
      },
    ],
  },

  // ===== THIET TUONG LAO CUONG · Ren Duc (tho ren binh khi/dung cu) =====
  daTao: {
    chapters: [
      {
        id: 'c1', req: 1, title: "Đả Thiết",
        start: 's',
        nodes: {
          s: { say: ["Lò của tao chỉ ra cuốc với dao rựa. Mày tới nhầm chỗ rồi thằng nhóc.", "Nói mau, muốn gì? Tao còn đống bản lề chưa gò xong."], choices: [ { t: "Xin lão dạy con rèn một thanh bảo đao.", to: 'a' }, { t: "Con muốn học cái nghề nuôi được thân.", to: 'b' }, { t: "Nghe nói lão là tay búa giỏi nhất vùng.", to: 'c' } ] },
          a: { say: ["Bảo đao? Khịt. Lại một thằng nữa.", "Đao với kiếm để mấy lão rỗi hơi ngoài kia lo. Ở đây tao gõ cuốc.", "Cầm lấy. Cái cuốc gãy đó. Rèn cho nó ra cuốc đã, rồi hẵng mơ chém ai."], choices: [ { t: "Một cái cuốc thì học được gì?", to: 'd' }, { t: "Được. Con rèn cái cuốc.", to: 'e' } ] },
          b: { say: ["Nuôi thân? Ừ. Câu đó nghe được hơn cái đám đòi thần binh.", "Nhưng đừng tưởng dễ. Cái nghề này ăn của mày cả tấm lưng.", "Cầm cái cuốc gãy kia đi. Bắt đầu từ chỗ thấp nhất."], choices: [ { t: "Con bắt đầu.", to: 'e' } ] },
          c: { say: ["Giỏi nhất vùng? Ha. Vùng này có mỗi mình tao gõ búa.", "Nịnh tao chả được cái đinh nào đâu thằng nhóc.", "Muốn học thì cầm cuốc lên. Không thì đi chỗ khác cho tao yên cái lưng."], choices: [ { t: "Con cầm cuốc đây.", to: 'e' }, { t: "Cuốc thì tầm thường quá.", to: 'd' } ] },
          d: { say: ["Tầm thường? Cái cuốc tầm thường nuôi cả cái làng này no bụng đó.", "Thần binh treo trên tường cho người ta trầm trồ. Cuốc thì xuống ruộng mỗi ngày.", "Cái nào thật hơn, tự mày nghĩ."], choices: [ { t: "Con hiểu rồi. Đưa con cái cuốc.", to: 'e' } ] },
          e: { say: ["Đấy. Nhóm lò lên đi.", "Khi nào mày gò được cái cuốc thẳng lưỡi, tao mới nói chuyện tiếp.", "Lửa còn cháy. Đừng để tao đợi lâu, cái lưng tao không đợi được."] },
        },
      },
      {
        id: 'c2', req: 20, title: "Bách Luyện",
        start: 's',
        nodes: {
          s: { say: ["Miếng sắt đó. Gõ lại. Gõ nữa.", "Đừng có nhìn tao bằng cái mặt đó. Tao biết mày chán rồi thằng nhóc."], choices: [ { t: "Gõ mãi một miếng, có ích gì đâu?", to: 'a' }, { t: "Sao lão không dạy con chiêu khó hơn?", to: 'b' }, { t: "Con gõ tiếp đây, không dám than.", to: 'c' } ] },
          a: { say: ["Vô ích? Mày sờ thử miếng sắt lúc đầu xem. Giòn, bẻ cái gãy rụp.", "Trăm búa sau, nó dai. Bẻ không gãy nữa.", "Sắt chịu đủ búa mới bỏ được cái giòn. Phép tắt nào ở đây đâu."], choices: [ { t: "Vậy còn người thì sao?", to: 'e' } ] },
          b: { say: ["Chiêu khó? Ha. Lại nôn nóng.", "Mày tưởng có bí kíp giấu trong lò à? Không có đâu.", "Nghề này chỉ có một chữ: gõ. Gõ tới khi tay biết, mà đầu khỏi cần nghĩ."], choices: [ { t: "Chỉ có gõ thôi sao?", to: 'e' } ] },
          c: { say: ["Ừ. Được. Mày không than là tao mừng.", "Nhưng gõ mà đầu để đâu đâu thì cũng bằng thừa.", "Nghe tiếng búa đi. Sắt chín hay chưa, nó nói cho mày."], choices: [ { t: "Sắt biết nói ư?", to: 'd' }, { t: "Con nghe đây.", to: 'e' } ] },
          d: { say: ["Nói chứ. Tiếng đanh là còn cứng, tiếng đục là đã mềm.", "Tai tao nghe ba chục năm rồi, giờ khỏi nhìn cũng biết.", "Mày gõ đủ lâu, rồi mày cũng nghe ra."], choices: [ { t: "Vậy còn người thì sao, hả lão?", to: 'e' } ] },
          e: { say: ["Người hả? Cũng thế cả thôi.", "Sắt chịu trăm búa mới hết giòn. Người chịu khổ mới bỏ được cái nông.", "Gõ đi. Đừng hỏi nữa. Lưng tao đau, mà tay tao vẫn gõ đây này."] },
        },
      },
      {
        id: 'c3', req: 50, title: "Chiết Yêu",
        start: 's',
        nodes: {
          s: { say: ["Đêm nay lão không ngủ được. Cái lưng nó hành.", "Mày còn thức à? Ngồi xuống. Tao nói vài câu, nghe hay không tùy."], choices: [ { t: "Lão đau nhiều lắm sao?", to: 'a' }, { t: "Con ngồi nghe lão.", to: 'b' }, { t: "Nghỉ tay đi lão, sắt để mai.", to: 'c' } ] },
          a: { say: ["Đau? Ba chục năm gò lưng trên cái đe này. Sống lưng còng luôn rồi, thẳng sao được nữa.", "Có đêm tao nằm, tự hỏi cả đời gõ búa của tao rốt cuộc để lại được cái gì.", "Ngoài đống cuốc mòn... với cái lưng gãy này."], choices: [ { t: "Lão để lại nhiều hơn thế chứ.", to: 'd' }, { t: "Vậy lão thấy có đáng không?", to: 'e' } ] },
          b: { say: ["Cái làng này, tao gõ cho nó từ hồi tóc còn đen.", "Rồi người ta cũng quên mất tao là ai. Chỉ biết ra lò ông thợ rèn mà lấy đồ.", "Mày nói tao nghe... thứ tao gõ ra, có đáng không?"], choices: [ { t: "Để con nhìn quanh đã.", to: 'd' }, { t: "Đáng hay không, sao lão lại hỏi con?", to: 'e' } ] },
          c: { say: ["Nghỉ? Nghỉ rồi ai gõ. Cả làng có mỗi cái lò này.", "Tao gò lưng ở đây, để cái làng khỏi phải gò lưng chỗ khác.", "Ngồi xuống. Đừng giục. Đêm nay tao muốn nói."], choices: [ { t: "Con nghe đây.", to: 'b' } ] },
          d: { say: ["Nhìn quanh đi thằng nhóc. Cái cuốc dựng góc sân. Con dao trên thớt. Cái bản lề cửa mày vừa đẩy vào.", "Nhà nào trong làng cũng có một món qua tay tao.", "Tao không có tên trên bia đá. Nhưng cơm mỗi nhà, có phần cái búa của tao."], choices: [ { t: "Vậy là đáng, lão ạ. Rất đáng.", to: 'e' } ] },
          e: { say: ["...Ừ. Chắc là đáng.", "Cái nghề tầm thường này, nó âm thầm nuôi cả làng. Không ai thấy, nhưng nó đỡ được cái bụng người ta.", "Thôi. Nói nhiều mỏi lưng. Mai gõ tiếp."] },
        },
      },
      {
        id: 'c4', req: 100, title: "Truyền Chùy",
        start: 's',
        nodes: {
          s: { say: ["Lại đây thằng nhóc. Cầm lấy cái này.", "Cây búa của tao. Mẻ một góc rồi, gò ba chục năm nó mòn theo tay tao.", "Từ nay nó là của mày."], choices: [ { t: "Con... nhận sao được cây búa của lão?", to: 'a' }, { t: "Con sẽ rèn nên danh với cây búa này.", to: 'b' }, { t: "Lão định thôi gõ rồi ư?", to: 'c' } ] },
          a: { say: ["Nhận không được thì tao vứt à. Cầm lấy.", "Búa mẻ, nhưng nó thật. Tay tao quen nó, giờ tới lượt tay mày.", "Đừng làm cái mặt đó. Lão ghét nhất mấy đứa ướt át... mà mắt lão thì cay khói."], choices: [ { t: "Con hứa sẽ giữ nghề.", to: 'e' } ] },
          b: { say: ["Danh? Khịt. Lại cái tật cũ.", "Nghe cho kỹ đây: danh tiếng là chuyện của kẻ khác, không phải chuyện của cái lò.", "Rèn cái thật thà cho người thật thà dùng. Đừng ham rèn cái để khoe."], choices: [ { t: "Vậy cái gì mới là cái đáng để lại?", to: 'd' } ] },
          c: { say: ["Thôi hả? Cái lưng này thôi thay tao rồi.", "Tao gõ đủ rồi thằng nhóc. Giờ tới phiên lửa của mày.", "Cầm búa đi. Đừng để lò tắt."], choices: [ { t: "Lò sẽ không tắt đâu lão.", to: 'e' }, { t: "Con phải rèn cái gì để không phụ lão?", to: 'd' } ] },
          d: { say: ["Cái đáng? Không phải thanh đao treo tường cho người ta trầm trồ.", "Là cái cày mùa sau vẫn chạy tốt. Là con dao mẻ mà chặt còn ngọt.", "Tao chết đi, tên tao người ta quên. Nhưng cái cày chạy tốt, đó mới là cái tao để lại đời."], choices: [ { t: "Con khắc cốt lời lão.", to: 'e' } ] },
          e: { say: ["Đi đi. Nhóm cái lò của mày lên.", "Rèn cái thật thà. Gõ cho tới. Đừng ham hư danh, đừng phí cái lưng như tao.", "...Lửa mày mà cháy được, thì cái lão để lại, coi như không mất."] },
        },
      },
    ],
  },

  // ===== HU VO LAO NHAN · Thien Dinh (an si/thien gia) =====
  toaQuan: {
    chapters: [
      {
        id: 'c1', req: 1, title: "Tầm Đạo",
        start: 's',
        nodes: {
          s: { say: ["Ngươi tới. Bước chân gấp gáp thế — chừng như sợ đạo bỏ chạy mất.", "Ngồi đâu mà chẳng được, cớ gì lặn lội tới tận chỗ cái lão ngồi đây?"], choices: [ { t: "Xin lão dạy, ngồi thiền bao lâu thì đắc đạo?", to: 'a' }, { t: "Nghe nói lão đã đắc đạo. Ta tới học.", to: 'b' } ] },
          a: { say: ["Bao lâu ư? Hà hà. Ngươi đi tìm đạo, hay đạo đang phải chạy trốn ngươi?", "Kẻ đếm ngày chờ đắc đạo — khác gì kẻ ôm hạt giống mà quát nó nảy mầm."], choices: [ { t: "Vậy ta phải làm sao mới đúng?", to: 'e' } ] },
          b: { say: ["Đắc đạo? Ai bảo ngươi cái lão ngồi đây đắc được gì.", "Ta chỉ ngồi. Ngồi lâu tới mức quên mất mình ngồi để làm chi."], choices: [ { t: "Ngồi mà chẳng cầu gì, ngồi làm chi?", to: 'c' }, { t: "Vậy ta cũng ngồi thử.", to: 'e' } ] },
          c: { say: ["Hỏi hay đấy. Nhưng ngươi cầu quá nhiều, nên chẳng bao giờ ngồi yên nổi.", "Buông cái cầu xuống trước đã. Rồi hẵng hỏi ngồi làm chi."], choices: [ { t: "…Được. Ta ngồi.", to: 'e' } ] },
          e: { say: ["Ngồi xuống đi. Tìm thử xem — rốt cuộc ngươi tìm được cái gì.", "Khi nào mỏi chân đứng dậy mà đạo vẫn chẳng thấy đâu, hãy quay lại. Cái lão vẫn ngồi đây."] },
        },
      },
      {
        id: 'c2', req: 20, title: "Công Án",
        start: 's',
        nodes: {
          s: { say: ["Ngươi trở lại. Ngồi mấy bận rồi mà đạo vẫn trốn kỹ, phải không?", "Ngồi xuống. Lão hỏi ngươi một câu — chớ vội đáp bằng cái đầu."], choices: [ { t: "Lão cứ hỏi.", to: 'a' }, { t: "Câu hỏi nào ta cũng không ngại.", to: 'b' } ] },
          a: { say: ["Hai bàn tay chập vào nhau thì kêu. Vậy MỘT bàn tay vỗ — kêu thành tiếng gì?"], choices: [ { t: "Một tay thì vỗ sao thành tiếng được.", to: 'c' }, { t: "…Ta chịu. Chẳng có tiếng nào cả.", to: 'd' } ] },
          b: { say: ["Không ngại à? Tốt. Chỗ ngồi trống rỗng dưới thân ngươi kia — chứa được bao nhiêu?"], choices: [ { t: "Trống thì chứa được vô cùng.", to: 'c' }, { t: "Trống là trống, chứa gì mà chứa.", to: 'd' } ] },
          c: { say: ["Ngươi lại lôi cái đầu ra tính rồi. Càng tính, càng xa.", "Đừng trả lời lão. Cứ ôm lấy câu hỏi mà ngồi — ngồi tới khi nó tự tan."], choices: [ { t: "Ôm một câu hỏi không lời đáp?", to: 'e' } ] },
          d: { say: ["Hà — chịu rồi đấy. Cái đầu quen suy tính của ngươi vừa va phải bức tường.", "Ngay chỗ nó lặng đi, có một khe hở. Đừng lấp vội bằng lời."], choices: [ { t: "Khe hở đó là gì?", to: 'e' } ] },
          e: { say: ["Là chỗ ngươi thôi tìm câu trả lời — mà bắt đầu NGHE.", "Về ngồi tiếp đi. Khi bức tường trong đầu ngươi nứt thêm chút nữa, hãy tới."] },
        },
      },
      {
        id: 'c3', req: 50, title: "Toạ Vong",
        start: 's',
        nodes: {
          s: { say: ["Hôm nay lão kể ngươi nghe chuyện cái lão ngồi đây, hồi hai chân chưa mỏi.", "Ta từng đi. Trăm núi ngàn sông, mòn bảy đôi giày cỏ, chỉ để tìm một chữ ĐẠO."], choices: [ { t: "Rồi lão tìm thấy ở đâu?", to: 'a' }, { t: "Đi xa vậy, hẳn thấy được nhiều.", to: 'b' } ] },
          a: { say: ["Chẳng thấy ở đâu cả. Đỉnh núi cao nhất — trống. Đáy sông sâu nhất — trống.", "Ta quỳ giữa tuyết mà than: đạo hỡi, ngươi trốn ở chốn nào?"], choices: [ { t: "Vậy là cả đời uổng công?", to: 'c' } ] },
          b: { say: ["Thấy nhiều lắm. Thấy mình càng đi càng xa cái mình đi tìm.", "Mỗi bận cất bước rời một chốn, ta bỏ lại sau lưng một thứ — mà nào có hay."], choices: [ { t: "Lão bỏ lại thứ gì?", to: 'c' } ] },
          c: { say: ["Một đêm kiệt sức, ta ngồi phịch xuống, thôi không đi nữa. Thôi cả cái ý phải đắc đạo.", "Ngay khoảnh khắc BUÔNG cái cầu ấy — bức tường trăm năm tự tan. Đạo ở ngay dưới chỗ ta ngồi."], choices: [ { t: "Sao chỉ buông là thấy?", to: 'd' }, { t: "Vậy bấy lâu ta cầu là sai?", to: 'd' } ] },
          d: { say: ["Hễ còn cầu, là còn kẻ tìm và vật bị tìm. Còn hai, thì còn cách.", "Buông cái cầu xuống, chẳng còn ai đi tìm ai nữa. Bức tường ấy — ngươi tự dựng, ngươi tự tan.", "Về ngồi đi. Ngồi cho tới khi quên luôn cả chữ đạo."] },
        },
      },
      {
        id: 'c4', req: 100, title: "Vô Tầm",
        start: 's',
        nodes: {
          s: { say: ["Ngươi tới. Nhưng lần này bước chân không còn gấp. Hay lắm.", "Ngồi xuống. Lão chẳng có gì để dạy nữa — cũng chẳng có gì để trao."], choices: [ { t: "Chẳng trao gì, sao lão còn gọi ta tới?", to: 'a' }, { t: "Ta tới không phải để nhận. Chỉ để ngồi.", to: 'b' } ] },
          a: { say: ["Gọi ngươi tới, để ngươi tự thấy mình chẳng cần lão nữa.", "Cái đạo ngươi lặn lội đi tìm bấy lâu — thử ngó xuống chỗ ngươi đang ngồi xem."], choices: [ { t: "Ta ngó rồi. Chỗ đó trống không, chẳng có gì.", to: 'c' } ] },
          b: { say: ["Hà hà. Câu đó, ba mươi năm trước lão nói không nổi.", "Ngươi đã thôi tìm. Mà lạ chưa — thôi tìm, thì nó mới hiện ra."], choices: [ { t: "Nó… vẫn luôn ở đây sao?", to: 'c' } ] },
          c: { say: ["Đúng thế. Chẳng có gì cả — mà cũng đủ đầy tất cả.", "Thứ ngươi mòn chân đi tìm, nãy giờ vẫn ngồi yên ngay đây. Chính là cái ngươi bỏ lại mỗi bận cất bước ra đi."], choices: [ { t: "Vậy lão để lại gì cho ta?", to: 'e' } ] },
          e: { say: ["Để lại ư? Lão để lại cái chỗ ngồi trống này — mà chẳng để lại gì cả.", "Hết tìm, thì thấy. Từ nay ngươi ngồi đâu, đạo ngồi đó. Cái lão đi hay ở, nào có khác gì.", "Đi đi. À không — cứ ngồi. Ngồi cũng là đi mà."] },
        },
      },
    ],
  },

  // ===== LO BAN TRUYEN NHAN · Xay Dung (tho moc/kien truc) =====
  doanhTao: {
    chapters: [
      {
        id: 'c1', req: 1, title: "Cao Đài",
        start: 's',
        nodes: {
          s: { say: ["Tiểu hữu dừng chân đây làm chi? Ngắm cái đài kẻ hậu học này đang dựng dở à.", "Nói ta nghe — tiểu hữu muốn dựng thứ gì cho đời?"], choices: [ { t: "Ta muốn dựng một tòa đài thật cao, để thiên hạ ngước nhìn.", to: 'a' }, { t: "Ta chỉ muốn học cầm thước cầm cưa.", to: 'b' } ] },
          a: { say: ["Cao... ai cũng muốn cao. Đài cao thì tên nổi, người trầm trồ.", "Nhưng ta hỏi nhỏ tiểu hữu một câu — định xây cho người ta ngắm, hay xây cho nó đứng vững trăm năm?"], choices: [ { t: "Xây cho người ta ngắm thì đã sao?", to: 'c' }, { t: "...Ta chưa từng nghĩ tới điều đó.", to: 'e' } ] },
          b: { say: ["Cầm thước cầm cưa? Tốt. Kẻ biết mình chưa biết gì, mới đáng dạy.", "Nhưng nhớ cho — thước không đo gỗ trước, nó đo lòng người cầm nó."], choices: [ { t: "Lòng người thì đo bằng gì?", to: 'e' } ] },
          c: { say: ["Đã sao ư. Đài dựng cho mắt người thì chỉ cần đẹp cái mặt ngoài.", "Kẻ hậu học này từng thấy nhiều đài như thế. Đẹp lắm. Rồi một trận mưa, chúng nằm xuống, đè theo cả người đứng dưới.", "Cái đẹp không gánh nổi mái nhà, tiểu hữu."], choices: [ { t: "Vậy phải xây thế nào mới đứng vững?", to: 'e' } ] },
          e: { say: ["Về đi. Đặt tay xuống một viên đá, hỏi nó chịu được bao nhiêu.", "Khi nào tiểu hữu thôi ngước nhìn cái cao, mà cúi xuống nhìn cái nền — hãy quay lại."] },
        },
      },
      {
        id: 'c2', req: 20, title: "Quy Củ",
        start: 's',
        nodes: {
          s: { say: ["Tiểu hữu quay lại rồi. Tay đã bớt run chưa?", "Hôm nay kẻ hậu học này dạy tiểu hữu hai vật. Cầm lấy — thước tròn, thước vuông."], choices: [ { t: "Hai thứ này có gì đặc biệt?", to: 'a' }, { t: "Ta muốn học ngay cách dựng nhà.", to: 'b' } ] },
          a: { say: ["Thước tròn vẽ nên vòng, thước vuông định nên góc. Không có chúng, tay người chỉ vẽ ra cái méo.", "Người xưa gọi đó là quy củ. Mộc thạch có pháp của mộc thạch, tiểu hữu à — không phải muốn là được."], choices: [ { t: "Còn sợi dây kia dùng làm gì?", to: 'c' } ] },
          b: { say: ["Vội chi. Chưa búng được một đường mực thẳng, dựng nhà thì nhà nghiêng.", "Ngồi xuống. Cầm sợi dây mực này trước đã."], choices: [ { t: "Sợi dây mực này dùng thế nào?", to: 'c' } ] },
          c: { say: ["Căng nó ra, búng một cái — một đường đen in trên gỗ, thẳng tắp, không tranh cãi.", "Gỗ cong đến mấy, đường mực vẫn thẳng. Người thợ theo mực mà cưa, chứ không theo cái mắt hay nghiêng của mình."], choices: [ { t: "Vậy cái xảo diệu của nghề nằm ở đâu?", to: 'd' }, { t: "Chỉ cần thẳng thôi sao? Ta tưởng nghề mộc phải cầu kỳ.", to: 'd' } ] },
          d: { say: ["Tiểu hữu nhìn cái mộng này. Hai thanh gỗ cắn vào nhau, khít đến không lọt một sợi tóc.", "Cả tòa nhà đứng vững nhờ nó, mà chẳng cần lấy một cái đinh.", "Xảo diệu thật nằm ở chỗ khuất người ta không thấy — chứ chẳng nằm ở cái to phô ra ngoài."], choices: [ { t: "Cái người ta không thấy... lại là cái giữ cả tòa nhà.", to: 'e' }, { t: "Vậy làm tốt cái khuất kia, ai biết mà khen?", to: 'f' } ] },
          e: { say: ["Đúng vậy. Nền chôn dưới đất, mộng giấu trong gỗ — không ai vỗ tay cho chúng.", "Nhưng thiếu chúng, mọi lời khen đều đổ theo mái nhà. Về ngẫm đi, tiểu hữu."] },
          f: { say: ["Không ai biết. Kẻ hậu học này làm cái mộng khít nhất đời mình, cũng chẳng ai từng nhìn thấy nó.", "Nhưng ta ngủ yên. Người thợ tốt không dựng cho tiếng vỗ tay — dựng cho cái đêm mưa gió mình không có mặt ở đó."] },
        },
      },
      {
        id: 'c3', req: 50, title: "Đoạn Kiều",
        start: 's',
        nodes: {
          s: { say: ["Mưa lớn. Tiểu hữu vào trú đi... đừng ra cầu lúc này.", "Kẻ hậu học này không ưa mưa. Mưa gợi lại thứ ta chôn đã lâu."], choices: [ { t: "Tiền bối có tâm sự gì sao?", to: 'a' }, { t: "Một cây cầu thì sợ gì mưa?", to: 'b' } ] },
          a: { say: ["Tâm sự à... Ngồi xuống. Đêm mưa thế này, kể ra cũng phải.", "Năm ấy ta dựng một cây cầu. Cầu lớn nhất đời ta, bắc qua con sông chia đôi hai làng."], choices: [ { t: "Rồi cây cầu ấy thế nào?", to: 'c' } ] },
          b: { say: ["Sợ gì mưa ư. Ngồi xuống, ta kể tiểu hữu nghe về một cây cầu.", "Nó đứng vững qua ba mùa. Rồi một đêm mưa như đêm nay, nó gãy làm đôi."], choices: [ { t: "Gãy? Cầu của một truyền nhân Lỗ Ban mà cũng gãy sao?", to: 'c' } ] },
          c: { say: ["Gãy. Giữa dòng nước xiết, nó gãy — cuốn theo mấy người đang qua sông.", "Có kẻ nói người ta ép ta làm gấp, thiếu gỗ thiếu ngày. Có kẻ nói tại tay nghề ta non.", "Kẻ hậu học này... đến giờ vẫn không dám chắc là tại ai."], choices: [ { t: "Đó đâu phải lỗi của tiền bối.", to: 'd' }, { t: "Nếu là tay nghề, sao tiền bối còn cầm thước?", to: 'e' } ] },
          d: { say: ["Không phải lỗi ta ư. Tiểu hữu tử tế. Nhưng cái nền là ta đặt, cái mộng là tay ta ghép.", "Mấy sinh mạng nằm dưới dòng nước ấy không hỏi lỗi tại ai. Họ chỉ... không về nữa.", "Cái danh truyền nhân Lỗ Ban, từ đêm đó, nặng như một cây xà đè lên vai ta."], choices: [ { t: "Vậy sao tiền bối chưa từng buông cây thước?", to: 'f' } ] },
          e: { say: ["Vì sao ta còn cầm thước ư? Có đêm ta cũng hỏi mình y hệt.", "Nếu buông, mấy người dưới sông kia chết thành vô nghĩa. Ta cầm tiếp, để cây cầu sau không gãy nữa.", "Đó là cách duy nhất một kẻ vụng như ta xin lỗi người đã khuất."], choices: [ { t: "Vậy giờ mỗi cây cầu tiền bối dựng...", to: 'f' } ] },
          f: { say: ["Ừ. Giờ mỗi cái nền ta đặt, ta đặt bằng hai tay — một tay là lòng thành, một tay là nỗi sợ.", "Sợ cũng tốt, tiểu hữu à. Kẻ thợ hết sợ là kẻ bắt đầu làm ẩu.", "Mưa tạnh rồi. Ra xem cây cầu ngoài kia — lần này ta ghép nó chặt hơn cả tính mạng chính mình."] },
        },
      },
      {
        id: 'c4', req: 100, title: "Truyền Xích",
        start: 's',
        nodes: {
          s: { say: ["Tiểu hữu tới rồi. Tay tiểu hữu bây giờ, ta nhìn là biết — đã chai đúng chỗ.", "Kẻ hậu học này có một vật, giữ đã lâu. Hôm nay muốn trao lại."], choices: [ { t: "Vật gì mà tiền bối trịnh trọng vậy?", to: 'a' }, { t: "Ta chưa đủ tư cách nhận đâu.", to: 'b' } ] },
          a: { say: ["Cây thước này. Mòn nhẵn cả hai đầu — thước của tổ nghề, truyền tới tay ta là đời thứ mấy, ta cũng thôi đếm.", "Nó đo qua không biết bao nhiêu tòa nhà. Cả cây cầu năm ấy... nó cũng đo."], choices: [ { t: "Cây cầu đã gãy — tiền bối vẫn giữ cây thước đó?", to: 'c' } ] },
          b: { say: ["Chưa đủ tư cách à. Kẻ hậu học này cả đời cũng tự thấy mình chưa xứng cái danh tổ nghề.", "Nhưng thước không chờ kẻ xứng đáng, tiểu hữu. Nó chờ kẻ biết sợ mà vẫn dám đặt tay xuống."], choices: [ { t: "Vậy tiền bối tin ta sẽ đặt nó đúng chỗ?", to: 'c' } ] },
          c: { say: ["Ta giữ, vì nó dạy ta điều đắt nhất đời: một thước đặt đúng thì định được cả càn khôn, đặt sai thì đổ cả một đời người.", "Mộc thạch hữu pháp, hào ly bất sai. Nhất xích định càn khôn, nhất tuyến khai cơ xảo.", "Cầm lấy. Từ nay tay tiểu hữu cầm nó, thì cái sợ ấy cũng sang tay tiểu hữu."], choices: [ { t: "Ta sẽ dựng gì với cây thước này đây?", to: 'd' }, { t: "Ta nhận. Ta sẽ không để nó đặt sai.", to: 'e' } ] },
          d: { say: ["Dựng gì ư. Đừng dựng cái đài cao cho người đời nay trầm trồ.", "Hãy dựng những thứ tiểu hữu không kịp thấy hoàn thành — cho những người tiểu hữu không kịp gặp mặt.", "Trồng cây cho đời sau ngồi mát. Đó mới là việc đáng nhất cây thước này làm."], choices: [ { t: "Ta nhớ rồi, tiền bối.", to: 'e' } ] },
          e: { say: ["Đi đi, tiểu hữu. Búng cho thẳng sợi mực đầu tiên của đời mình.", "Kẻ hậu học này ở lại đây, dựng nốt cái đài dở dang. Có lẽ ta cũng chẳng kịp thấy nó xong.", "Nhưng không sao. Rồi sẽ có người ngồi dưới bóng nó — dù ta chưa từng gặp mặt họ."] },
        },
      },
    ],
  },
};

// ============================================================
// TÍN VẬT — phần thưởng khi đọc HẾT trọn 1 arc (4 chương) của 1 NPC nghề.
//   Vật NPC "trao" trong truyện -> +TIN_VAT_EFF_PCT% Hiệu Suất (tốc độ) cho nghề đó.
//   Cách ly: KHÔNG phải sức mạnh combat trực tiếp (cộng vào tốc độ như Công Cụ).
// ============================================================
export const TIN_VAT_EFF_PCT = 15;  // % hiệu suất (tốc độ) mỗi Tín Vật — DRAFT, tune sau
export const TIN_VAT = {
  phatMoc:    { name: 'Lão Phủ',        vat: 'Cây rìu mòn của lão tiều phu.',                    glyph: '斧' },
  thaiKhoang: { name: 'Khoáng Đăng',    vat: 'Cây đèn cũ đã soi lão phu ra khỏi hầm sập.',       glyph: '燈' },
  dieuNgu:    { name: 'Trúc Điếu',      vat: 'Cần trúc cũ theo lão hán mấy chục mùa nước.',      glyph: '釣' },
  phanhNham:  { name: 'Khuyết Trù Đao', vat: 'Con dao bếp mẻ, thái qua vạn bữa buồn vui.',       glyph: '刀' },
  luyenDan:   { name: 'Đan Lô',         vat: 'Cái lò con dược vương đổi bằng cả một đời.',       glyph: '爐' },
  daTao:      { name: 'Khuyết Chùy',    vat: 'Cây búa mẻ gò lưng ba chục năm bên đe.',           glyph: '鎚' },
  toaQuan:    { name: 'Bồ Đoàn Trống',  vat: 'Chỗ ngồi trống lão để lại — cái không cũng là trao.', glyph: '空' },
  doanhTao:   { name: 'Tổ Xích',        vat: 'Cây thước tổ nghề, mòn nhẵn cả hai đầu.',          glyph: '尺' },
  daLuyen:    { name: 'Cố Lô',          vat: 'Lò rèn ba trăm năm của Âu Dã Tử.',                 glyph: '冶' },
};
