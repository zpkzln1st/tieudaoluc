// ============================================================
// DATA — SỰ KIỆN GIANG HỒ (Tông Môn, nhánh phụ). CÁCH LY: KHÔNG import combat/gear/stats.
// Sự kiện CHỌN-MÙ: nút chỉ ghi HÀNH ĐỘNG (label+flavor), TUYỆT đối không lộ hệ quả/chi phí/điều kiện.
// Hệ quả chỉ lộ ở màn Hồi Kết (outcome.text) như một mẩu chuyện.
// ------------------------------------------------------------
// SCHEMA 1 SỰ KIỆN:
//   { id, grp:'A'|'B'|'C'|'D', kind:'choice'|'auto', han, title,
//     weight?:number (mặc định 10), cdH?:number (giờ khoá lại sau khi nổ),
//     cond(t)->bool                  // điều kiện đủ tư cách nổ (t = state.tongMon)
//     pick(t)->[uid,...]             // (choice) chọn đệ tử "diễn viên"; mặc định []
//     story(ctx)->string             // đoạn kể trước lựa chọn
//     choices:[ {label, flavor, resolve(ctx)->OUTCOME} ]   // (choice) 3-4 nút action-only
//     auto(ctx)->OUTCOME             // (auto, nhóm E) nổ là áp luôn, KHÔNG modal
//   }
// OUTCOME = { tone:'lanh'|'du'|'trung', text, effects:[...], chronicle, tease? }
//
// ctx (engine cấp): { t, khiVan, dao, cast, main, second, rebel,
//                     rng(), lucky(base)->bool (đã nhún theo Khí Vận),
//                     hasTrait(tr,who?)->bool, anyTrait([tr],who?)->bool, uidOf(who) }
//   - main = cast[0], second = cast[1]; với chuỗi Phản Đồ: rebel = đối tượng phản đồ.
//
// EFFECTS — BỘ ĐỘNG TỪ ĐÓNG (engine.applyOutcome chỉ hiểu các khoá này; tác giả CHỈ dùng đây):
//   { uy:±n }                         // Uy Danh (cộng vào t.uyBonus)
//   { khiVan:±n }                     // Khí Vận (kẹp 0..100)
//   { congHien:±n } { diem:±n }       // tài nguyên tông (kẹp >=0)
//   { bac:±n }                        // Bạc main (kẹp >=0; tốn = trừ tối đa số đang có)
//   { mat:{id, n} }                   // nguyên liệu Túi Đồ (id = mat_*, side; KỲ NGỘ nhóm F rơi liệu)
//   { flag:{name, value?:true, who} } // gắn cờ lên đệ tử (who = uid)
//   { capBonus:{n, who} }             // nâng TRẦN cảnh giới (tiềm năng, side-only)
//   { realmUp:{n, who} }              // đột phá +n cảnh giới ngay (kẹp theo trần, side-only)
//   { rebel:{who} }                   // đệ tử -> Phản Đồ (rời tông, lưu t.events.rebels)
//   { recapture:{} }                  // thu phục lại rebel (ctx.rebel) thành đệ tử
//   { dismissRebel:{} }               // rebel rời đi / bị diệt (gỡ khỏi danh sách)
//   { bietHieu:{name, who} }          // gắn biệt hiệu (cosmetic) lên đệ tử
//   { queue:{eid, delayH?, rebelFrom?} } // hẹn nổ sự kiện chuỗi (D2/D3...) sau delayH giờ
//   who: truyền UID đệ tử (vd ctx.main.uid). Effect nào target không tồn tại sẽ bị bỏ qua an toàn.
// ============================================================

// Màu + nhãn nhóm (đồng bộ mockup _mockup/tongmon_event.html)
export const TM_GRP = {
  A: { label: 'Drama Đệ Tử',          color: '#fb7185' },
  B: { label: 'Khách Giang Hồ',       color: '#22d3ee' },
  C: { label: 'Khiêu Chiến Môn Phái', color: '#f5b942' },
  D: { label: 'Chuỗi Phản Đồ',        color: '#a78bfa' },
  E: { label: 'Giai Thoại',           color: '#94a3b8' },
  F: { label: 'Kỳ Ngộ',               color: '#34d399' },
};

// Pool tên NPC khách giang hồ (sự kiện nhóm B/C dùng) — Hán-Việt
export const NPC_NAMES = ['Lão Khất Kiếm', 'Mộ Vân Tẩu', 'Hàn Sơn Khách', 'Vô Danh Tăng', 'Cuồng Đao Tẩu', 'Thanh Y Nữ Hiệp', 'Bách Hiểu Sinh', 'U Minh Lão Quái'];

// ---- Helper soạn sự kiện (rút gọn cho tác giả) ----
const G = (text, effects, chronicle, tease) => ({ tone: 'lanh', text, effects: effects || [], chronicle, tease });   // kết LÀNH
const B = (text, effects, chronicle, tease) => ({ tone: 'du',   text, effects: effects || [], chronicle, tease });   // kết DỮ
const M = (text, effects, chronicle, tease) => ({ tone: 'trung',text, effects: effects || [], chronicle, tease });   // LÀNH DỮ KHÓ LƯỜNG
// chọn đệ tử theo tư chất (dùng trong pick/resolve): lowApt=kém nhất, highApt=cao nhất, rnd=ngẫu nhiên
const APT_RANK = { pham: 0, trung: 1, thuong: 2, tuyet: 3, thien: 4 };
const lowApt = (pool) => pool.slice().sort((a, b) => APT_RANK[a.apt] - APT_RANK[b.apt])[0] || null;
const highApt = (pool) => pool.slice().sort((a, b) => APT_RANK[b.apt] - APT_RANK[a.apt])[0] || null;
const rnd = (pool) => (pool.length ? pool[Math.floor(Math.random() * pool.length)] : null);

// ============================================================
// NHÓM A — DRAMA ĐỆ TỬ NỘI BỘ
// ============================================================
const A1 = {
  id: 'A1', grp: 'A', kind: 'choice', han: '緣', title: 'Đạo Lữ Đồng Tâm', weight: 10, cdH: 36,
  // cần >=2 đệ tử đang tu (chưa Đắc Đạo) để có "đôi"
  cond: (t) => t.disciples.filter((d) => !d.awaiting).length >= 2,
  pick: (t) => {
    const pool = t.disciples.filter((d) => !d.awaiting);
    // 2 đệ tử khác nhau (ưu tiên khác giới cho thuận chuyện, không bắt buộc)
    const a = pool[Math.floor(Math.random() * pool.length)];
    const rest = pool.filter((d) => d.uid !== a.uid);
    const pref = rest.filter((d) => d.sex !== a.sex);
    const b = (pref.length ? pref : rest)[Math.floor(Math.random() * (pref.length ? pref.length : rest.length))];
    return [a.uid, b.uid];
  },
  story: (c) =>
    `${c.main.name} và ${c.second.name} nhập môn chẳng cách nhau bao ngày. Cùng quét lá sân trước, cùng gác đêm Tàng Thư Lâu, lửa lòng cứ thế nhen lên. Hôm nay chúng quỳ trước điện, xin Chưởng Môn chứng cho một mối lương duyên. Song tu hành kỵ tình chấp — tác hợp hay chia lìa, một lời của ngươi định cả đời chúng.`,
  choices: [
    {
      label: 'Chứng hôn cho đôi trẻ',
      flavor: 'Đứng ra tác hợp, để chúng kết làm đạo lữ trong môn.',
      resolve: (c) => G(
        `Ngươi đứng ra chủ hôn dưới gốc ngân hạnh. ${c.main.name} và ${c.second.name} bái thiên địa, bái sư môn, rồi bái nhau. Từ đó hai người song tu — một cương một nhu quấn lấy nhau như rồng phượng, đạo tâm tương thông. Cả tông một phen rượu vui.`,
        [ { uy: 120 }, { khiVan: 5 }, { flag: { name: 'daoLu', value: c.second.uid, who: c.main.uid } }, { flag: { name: 'daoLu', value: c.main.uid, who: c.second.uid } } ],
        `${c.main.name} cùng ${c.second.name} kết làm đạo lữ dưới gốc ngân hạnh — kiếm khí tương hòa, một đôi thần tiên quyến lữ.`
      ),
    },
    {
      label: 'Cấm tuyệt, ép chuyên tâm tu',
      flavor: 'Ra lệnh cắt đứt, dồn cả hai vào khổ luyện.',
      resolve: (c) => {
        const oan = c.anyTrait(['Cao Ngạo', 'Lì Lợm', 'Cuồng Ngạo'], c.main) || c.anyTrait(['Cao Ngạo', 'Lì Lợm', 'Cuồng Ngạo'], c.second);
        return oan
          ? B(`Ngươi ra lệnh cấm tuyệt, bắt cả hai bế quan riêng. ${c.main.name} cắn răng vâng lệnh, nhưng trong mắt đã vẩn một tầng oán khí — "đạo này vô tình đến thế sao?". Khổ luyện thì có khổ luyện, mà mầm bất phục cũng đã gieo.`,
              [ { capBonus: { n: 1, who: c.main.uid } }, { capBonus: { n: 1, who: c.second.uid } }, { khiVan: -4 }, { flag: { name: 'oanTham', value: true, who: c.main.uid } } ],
              `Chưởng Môn cấm tuyệt mối duyên ${c.main.name} · ${c.second.name} — khổ luyện tăng tiến, song oán thầm cũng nhen.`)
          : M(`Ngươi ra lệnh cấm tuyệt. Hai đứa cúi đầu, nuốt mối tình vào lòng mà dồn cả vào kiếm. Vài tháng sau, đường tu của cả hai quả nhiên vững hơn — chỉ là những đêm trăng, thi thoảng vẫn có người ngồi một mình trên nóc Tàng Thư Lâu.`,
              [ { capBonus: { n: 1, who: c.main.uid } }, { capBonus: { n: 1, who: c.second.uid } } ],
              `Chưởng Môn cấm tuyệt mối duyên ${c.main.name} · ${c.second.name} — ép tình thành kiếm, căn cơ vững thêm một phần.`);
      },
    },
    {
      label: 'Giao Y Quán xét đạo tâm',
      flavor: 'Để Y Quán khám tâm mạch hai đứa rồi hẵng phán.',
      resolve: (c) => c.lucky(0.5)
        ? G(`Y Quán bắt mạch ba ngày, phán: "Tình này giúp đạo, chẳng loạn đạo." Ngươi y lời chứng hôn. Quả nhiên ${c.main.name} cùng ${c.second.name} song tu thuận buồm, tâm cảnh sáng thêm một bậc.`,
            [ { uy: 80 }, { khiVan: 6 }, { flag: { name: 'daoLu', value: c.second.uid, who: c.main.uid } }, { flag: { name: 'daoLu', value: c.main.uid, who: c.second.uid } } ],
            `Y Quán phán "tình giúp đạo" — ${c.main.name} · ${c.second.name} chứng hôn, đạo tâm cùng sáng.`)
        : B(`Y Quán khám ra ${c.second.name} vì tình mà đạo tâm rạn, sát niệm âm thầm bám rễ. Ngươi đành hoãn mối duyên. ${c.second.name} ôm uất, từ đó hay lẻn xuống hậu sơn một mình…`,
            [ { khiVan: -5 }, { flag: { name: 'tamMaSeed', value: true, who: c.second.uid } } ],
            `Y Quán phát hiện ${c.second.name} tình loạn đạo tâm — mối duyên đành hoãn, mầm tâm ma chớm.`),
    },
    {
      label: 'Hỏi thẳng ý hai đứa',
      flavor: 'Gọi riêng từng người, nghe lòng chúng muốn gì.',
      resolve: (c) => c.anyTrait(['Phóng Khoáng', 'Nhân Hậu', 'Trượng Nghĩa'], c.main) || c.anyTrait(['Phóng Khoáng', 'Nhân Hậu', 'Trượng Nghĩa'], c.second)
        ? G(`Ngươi gọi riêng từng đứa. Cả hai đều nói cùng một câu: "Đệ tử nguyện lấy đạo làm trọng, lấy nhau làm bạn đồng hành." Lòng đã thông thì duyên tự thuận — ngươi gật đầu, chúng thành một đôi mà đạo chẳng hề vương.`,
            [ { uy: 90 }, { khiVan: 4 }, { flag: { name: 'daoLu', value: c.second.uid, who: c.main.uid } }, { flag: { name: 'daoLu', value: c.main.uid, who: c.second.uid } } ],
            `Hỏi tận lòng, ${c.main.name} · ${c.second.name} lấy đạo làm trọng — thành đôi mà tâm vô quái ngại.`)
        : M(`Ngươi gọi riêng từng đứa. Hỏi ra mới biết, tình này một nóng một lạnh, lại có kẻ thứ ba ghé mắt. Ngươi gỡ tạm được mớ bòng bong, nhưng giang hồ nhi nữ, chuyện lòng đâu dứt một lần là xong.`,
            [ { uy: 20 }, { flag: { name: 'tinhTrieu', value: true, who: c.main.uid } } ],
            `Hỏi ý đôi trẻ ${c.main.name} · ${c.second.name} — tình duyên rối, tạm gỡ mà chưa dứt.`),
    },
  ],
};

// ============================================================
// NHÓM E — GIAI THOẠI AUTO (KHÔNG lựa chọn, nổ là ghi Sử Sách + chút dư vị)
// ============================================================
const E1 = {
  id: 'E1', grp: 'E', kind: 'auto', han: '霞', title: 'Triêu Hà Mãn Sơn', weight: 6, cdH: 18,
  cond: (t) => t.disciples.length >= 1,
  auto: (c) => {
    const d = c.t.disciples[Math.floor(Math.random() * c.t.disciples.length)];
    return G(
      `Một sớm mây ráng đỏ rực sơn môn. ${d.name} ngồi xếp bằng nơi mỏm đá, hô hấp cùng trời đất — linh khí tụ về như suối. Cả tông đều thấy lòng nhẹ tênh.`,
      [ { khiVan: 3 } ],
      `Triêu hà mãn sơn — ${d.name} tọa vong nơi mỏm đá, linh khí quy nhất, tông môn khí vận hanh thông.`
    );
  },
};

// ============================================================
// NHÓM A (tiếp) — A2, A3
// ============================================================
const A2 = {
  id: 'A2', grp: 'A', kind: 'choice', han: '隙', title: 'Đồng Môn Sinh Hiềm', weight: 10, cdH: 36,
  cond: (t) => t.disciples.filter((d) => !d.awaiting).length >= 2,
  pick: (t) => {
    const pool = t.disciples.filter((d) => !d.awaiting);
    const sorted = pool.slice().sort((a, b) => (b.realm || 0) - (a.realm || 0));
    const strong = sorted[0];
    const rest = pool.filter((d) => d.uid !== strong.uid);
    const weak = rest.slice().sort((a, b) => (a.realm || 0) - (b.realm || 0))[0];
    return [strong.uid, weak.uid];
  },
  story: (c) =>
    `${c.main.name} và ${c.second.name} cùng nhập môn một ngày, từng kề vai gánh nước lên Diễn Võ Trường. Nay ${c.main.name} đột phá cảnh giới vượt mặt, ${c.second.name} ôm hận "cùng một ngày bái sư, cớ sao ta mãi lùi sau". Lời ra tiếng vào mấy bận, đêm qua chúng động thủ thật — một đứa gãy xương vai, một đứa rách kinh mạch. Cả tông xôn xao, quỳ chờ Chưởng Môn phân xử.`,
  choices: [
    {
      label: 'Phạt cả hai, cấm túc chép phạt',
      flavor: 'Đè cả hai xuống, cấm túc Tàng Thư Lâu, chép phạt môn quy.',
      resolve: (c) =>
        M(`Ngươi quở cả hai trước điện, phạt cấm túc một tháng, ngày ngày chép môn quy nơi Tàng Thư Lâu. Drama dập xuống nhanh gọn — chỉ là ${c.second.name} cúi đầu nhận tội mà khóe môi vẫn mím chặt, cái "phục" kia mới chỉ phục nửa vời. Lửa than vùi tro, gặp gió lại bùng.`,
        [ { khiVan: -3 }, { flag: { name: 'batPhuc', value: true, who: c.second.uid } } ],
        `Chưởng Môn phạt cấm túc cả ${c.main.name} lẫn ${c.second.name} — hiềm khích tạm lắng, ${c.second.name} ngầm ôm cờ bất phục.`),
    },
    {
      label: 'Mở Đài Tỉ Võ phân cao thấp',
      flavor: 'Dựng đài giữa Diễn Võ Trường, cho hai đứa quang minh chính đại phân thắng bại.',
      resolve: (c) =>
        c.anyTrait(['Cô Độc', 'Cao Ngạo', 'Cuồng Ngạo'], c.second)
          ? B(`Trống trận nổi, cả tông vây quanh Diễn Võ Trường. ${c.main.name} vẫn hơn một bậc, ba chiêu đè ${c.second.name} sát mép đài. Bại trận trước trăm con mắt, ${c.second.name} chẳng tâm phục mà còn nuốt thêm một bụng hận — từ đó ánh nhìn dõi theo ${c.main.name} đã lạnh như sương đêm.`,
            [ { uy: 80 }, { flag: { name: 'datChi', value: true, who: c.main.uid } }, { flag: { name: 'oanTham', value: true, who: c.second.uid } } ],
            `Đài Tỉ Võ: ${c.main.name} thắng ${c.second.name} — kỉ luật giang hồ lập, song kẻ bại ôm oán khắc cốt.`)
          : G(`Trống trận nổi, cả tông vây quanh Diễn Võ Trường. Hai đứa đấu hơn trăm chiêu, mồ hôi hòa máu. ${c.main.name} thắng trong gang tấc, chìa tay đỡ ${c.second.name} dậy. ${c.second.name} thở dốc mà bật cười: "Sư huynh quả hơn ta thật." Hiềm khích tan theo trận đấu, hóa thành chí tiến thủ.`,
            [ { uy: 100 }, { khiVan: 4 }, { flag: { name: 'datChi', value: true, who: c.main.uid } }, { capBonus: { n: 1, who: c.second.uid } } ],
            `Đài Tỉ Võ: ${c.main.name} thắng ${c.second.name} trong gang tấc — kẻ bại tâm phục, hiềm khích hóa chí tiến thủ.`),
    },
    {
      label: 'Phái chung một nhiệm vụ sống chết',
      flavor: 'Đẩy cả hai đi chung một chuyến gian nan, buộc chúng sống chết có nhau.',
      resolve: (c) =>
        c.lucky(0.5)
          ? G(`Ngươi phái hai đứa chung một chuyến hộ tống xuyên Hắc Phong Lĩnh. Giữa đường gặp cường địch vây, ${c.main.name} liều mình đỡ một đao thế cho ${c.second.name}, ${c.second.name} cõng huynh trưởng máu me chạy suốt đêm. Sống sót trở về, hai đứa vai kề vai, hiềm xưa rửa sạch bằng sinh tử.`,
            [ { uy: 150 }, { khiVan: 6 }, { flag: { name: 'triAn', value: c.second.uid, who: c.main.uid } }, { flag: { name: 'triAn', value: c.main.uid, who: c.second.uid } } ],
            `Hoạn nạn tri giao: ${c.main.name} và ${c.second.name} vào sinh ra tử — hiềm khích rửa sạch, kết nghĩa sinh tử.`)
          : B(`Ngươi phái hai đứa chung một chuyến gian nan. Giữa hiểm cảnh, ${c.second.name} thấy ${c.main.name} lâm nguy mà chần chừ nửa nhịp — đủ để huynh trưởng ngã xuống vũng máu. ${c.main.name} sống sót về, mắt nhìn sư đệ đã hóa kẻ thù. Mối hận này, khắc tận xương.`,
            [ { khiVan: -6 }, { flag: { name: 'oanTham', value: true, who: c.main.uid } }, { flag: { name: 'tamMaSeed', value: true, who: c.second.uid } } ],
            `Chuyến đi sinh tử: ${c.second.name} bỏ mặc ${c.main.name} lâm nguy — hận khắc cốt, mầm phản đồ chớm.`),
    },
    {
      label: 'Triệu kẻ yếu thế, đích thân chỉ điểm',
      flavor: 'Gọi riêng kẻ thua, đích thân Chưởng Môn truyền dạy mấy phần tâm pháp.',
      resolve: (c) =>
        G(`Đêm ấy ngươi gọi riêng ${c.second.name} lên đỉnh các, đốt một lò trà, đem chỗ bế tắc trong đường tu của nó mà gỡ từng nút. "Cảnh giới đến sớm muộn vốn tùy duyên, nhưng đạo tâm hơn nhau ở chỗ chịu được tủi." ${c.second.name} nghe xong, cúi đầu rưng rưng — cờ bất phục năm xưa, nay hóa thành tri ân.`,
        [ { uy: 60 }, { khiVan: 3 }, { capBonus: { n: 1, who: c.second.uid } }, { flag: { name: 'triAn', value: true, who: c.second.uid } } ],
        `Chưởng Môn đích thân chỉ điểm ${c.second.name} một đêm — gỡ bế tắc, dập mầm bất phục thành tri ân.`),
    },
  ],
};

const A3 = {
  id: 'A3', grp: 'A', kind: 'choice', han: '妒', title: 'Ganh Tị Tư Chất', weight: 8, cdH: 40,
  // cần một thiên kiêu (tư chất cao) VÀ một kẻ phàm tài (tư chất thấp) cùng đang tu
  cond: (t) => {
    const pool = t.disciples.filter((d) => !d.awaiting);
    const hasGenius = pool.some((d) => d.apt === 'thien' || d.apt === 'tuyet');
    const hasPlain = pool.some((d) => d.apt === 'pham' || d.apt === 'trung');
    return hasGenius && hasPlain && pool.length >= 2;
  },
  pick: (t) => {
    const pool = t.disciples.filter((d) => !d.awaiting);
    const genius = highApt(pool);
    const rest = pool.filter((d) => d.uid !== genius.uid);
    const plain = lowApt(rest);
    return [genius.uid, plain.uid]; // main = thiên kiêu, second = kẻ ganh tị
  },
  story: (c) =>
    `${c.main.name} mới nhập môn mấy mùa, tư chất kinh người — đám sư huynh dày công khổ luyện đều bị bỏ lại sau lưng. Trong đám có ${c.second.name}, phàm tài cần mẫn bao năm, nay nhìn thiên kiêu được Tàng Thư Lâu ưu ái cấp tuyệt học, lòng chua như giấm. Đêm qua, có kẻ lén tráo Đan Dược của ${c.main.name} thành độc nhẹ, may Y Quán phát giác kịp. Chưa rõ thủ phạm — nhưng ánh mắt cả tông đều đổ về một hướng.`,
  choices: [
    {
      label: 'Truy xét đến cùng, trị kẻ hạ độc',
      flavor: 'Mở cuộc tra xét, lôi kẻ hạ độc ra ánh sáng mà trị theo môn quy.',
      resolve: (c) =>
        c.lucky(0.55)
          ? (c.anyTrait(['Cần Mẫn', 'Nhân Hậu', 'Thận Trọng'], c.second)
              ? G(`Ngươi cho tra xét ba ngày, lần ra đúng ${c.second.name}. Bị vạch trần, nó quỳ sụp, nước mắt giàn giụa: "Đệ tử ghen tài mà mờ mắt, xin chịu phạt." Ngươi trị nhẹ tay, để nó chép phạt và hầu thuốc Y Quán. Từ đó ${c.second.name} cắm cúi chuộc lỗi, chăm hơn xưa gấp bội.`,
                  [ { uy: 80 }, { khiVan: 4 }, { flag: { name: 'cuuChuoc', value: true, who: c.second.uid } } ],
                  `Truy xét ra ${c.second.name} hạ độc vì ghen tài — biết hối, ở lại chuộc lỗi, cần mẫn hơn xưa.`)
              : B(`Ngươi cho tra xét, lần ra đúng ${c.second.name}. Nhưng kẻ này chẳng hối — bị vạch mặt, nó cười gằn: "Trời sinh kẻ ngồi mát ăn bát vàng, ta khổ luyện cả đời lại chẳng bằng?" Đêm đó nó gói ghém hành lý, lặng lẽ rời sơn môn, mang theo một bụng oán.`,
                  [ { uy: 60 }, { khiVan: -3 }, { rebel: { who: c.second.uid } }, { queue: { eid: 'D2', delayH: 48, rebelFrom: c.second.uid } } ],
                  `Truy xét ra ${c.second.name} hạ độc — kẻ này không hối, ôm oán rời tông, hóa Phản Đồ.`))
          : M(`Ngươi cho tra xét gắt gao, nhưng chứng cứ mịt mờ. Cuối cùng nghi ngờ đổ lên ${c.second.name} — kẻ bị ghét nhất. Nó kêu oan đến khản giọng mà chẳng ai tin. Án này khép vội, lòng người trong tông từ đó có một vết rạn ngấm ngầm: công lý hay oan khuất, ai mà biết.`,
              [ { khiVan: -4 }, { flag: { name: 'oanTham', value: true, who: c.second.uid } } ],
              `Truy xét vội vã, nghi ${c.second.name} hạ độc nhưng chứng cứ mờ — oan hay tội khó phân, lòng người sinh rạn.`),
    },
    {
      label: 'Lờ đi, ngầm sai Y Quán hộ vệ',
      flavor: 'Không bóc phốt, lặng lẽ điều Y Quán trông chừng cho thiên kiêu.',
      resolve: (c) =>
        c.hasTrait('Nhân Hậu', c.second)
          ? G(`Ngươi nén chuyện xuống, chỉ ngầm dặn Y Quán để mắt tới ${c.main.name}. Drama chìm vào im lặng. Lạ thay, được phớt lờ đủ lâu, cơn ghen trong lòng ${c.second.name} tự nguôi — một hôm nó lặng lẽ đặt bát canh nóng trước cửa thiên kiêu, coi như lời xin lỗi không lời.`,
              [ { khiVan: 3 } ],
              `Lờ chuyện hạ độc, ngầm hộ vệ ${c.main.name} — ${c.second.name} bản tính nhân hậu tự nguôi, hiềm khích tan.`)
          : M(`Ngươi nén chuyện xuống, chỉ ngầm dặn Y Quán trông chừng ${c.main.name}. Thiên kiêu bình an, đường tu càng vùn vụt. Nhưng cơn ghen của ${c.second.name} không tan — nó nuốt vào trong, mỗi ngày một sâu, ánh mắt nhìn sư đệ dần vẩn đục. Tâm bệnh ủ kín, chẳng biết ngày nào bục.`,
              [ { capBonus: { n: 1, who: c.main.uid } }, { flag: { name: 'tamMaSeed', value: true, who: c.second.uid } } ],
              `Lờ chuyện hạ độc, ngầm hộ vệ ${c.main.name} — thiên kiêu thăng tiến, song ${c.second.name} ủ tâm bệnh đố kỵ.`),
    },
    {
      label: 'Bắt thiên kiêu san sẻ tuyệt học',
      flavor: 'Lệnh thiên kiêu khiêm nhường, đem sở học chỉ điểm lại cho đồng môn.',
      resolve: (c) =>
        c.anyTrait(['Cao Ngạo', 'Cuồng Ngạo'], c.main)
          ? B(`Ngươi lệnh ${c.main.name} đem tuyệt học san sẻ cho đồng môn. Thiên kiêu sa sầm mặt: "Sở học là của đệ tử dày công lĩnh ngộ, cớ sao phải chia cho kẻ chỉ biết ghen ghét?" Lời ra tới đó là quân thần sinh khích — ${c.main.name} từ đó nhìn Chưởng Môn bằng ánh mắt đề phòng, thấy mình bị kìm hãm.`,
              [ { khiVan: -4 }, { flag: { name: 'batPhuc', value: true, who: c.main.uid } } ],
              `Ép ${c.main.name} san sẻ tuyệt học — thiên kiêu cao ngạo phản đối, sinh hiềm khích mới với Chưởng Môn.`)
          : G(`Ngươi lệnh ${c.main.name} mở lớp giảng nhỏ, đem sở học chỉ lại cho đồng môn. Thiên kiêu cúi đầu vâng lời. Sân Diễn Võ từ đó mỗi chiều rộn tiếng luận võ, ${c.second.name} cũng ngồi hàng đầu chăm chú. Hòa khí dâng đầy sơn môn, mối ghen năm xưa tan trong tiếng cười.`,
              [ { uy: 70 }, { khiVan: 6 }, { capBonus: { n: 1, who: c.second.uid } } ],
              `${c.main.name} san sẻ tuyệt học cho đồng môn — hòa khí dâng đầy, ${c.second.name} hết ghen, cả tông cùng tiến.`),
    },
    {
      label: 'Ghép cặp sư phụ – đồ',
      flavor: 'Ép thiên kiêu nhận kẻ ganh tị làm đồ đệ, kèm cặp tận tay.',
      resolve: (c) =>
        c.lucky(0.5)
          ? G(`Ngươi ghép ${c.main.name} làm thầy, ${c.second.name} làm trò. Ban đầu hai đứa gườm nhau như nước với lửa. Nhưng dạy lâu thành thân — thiên kiêu thấy được cái cần mẫn của sư đệ, kẻ ganh tị thấy được cái thiên phú đáng nể của huynh trưởng. Một đôi bài hình thành, dạy nhau mà cùng tiến.`,
              [ { uy: 90 }, { khiVan: 5 }, { flag: { name: 'triAn', value: c.main.uid, who: c.second.uid } }, { capBonus: { n: 1, who: c.second.uid } } ],
              `Ghép ${c.main.name} dạy ${c.second.name} — gườm nhau hóa thân, thành đôi bài cùng tiến.`)
          : B(`Ngươi ghép ${c.main.name} làm thầy, ${c.second.name} làm trò. Nào ngờ hai cái tôi va nhau chan chát — thầy chê trò ngu độn, trò mắng thầy kiêu căng. Chẳng những không hòa, mối thù còn leo thang ra mặt, kéo theo đám đệ tử chia phe đứng nhìn. Sơn môn từ đó ngấm ngầm thành hai cánh.`,
              [ { khiVan: -5 }, { flag: { name: 'oanTham', value: true, who: c.second.uid } }, { flag: { name: 'phatPhan', value: true, who: c.main.uid } } ],
              `Ghép ${c.main.name} dạy ${c.second.name} — hai cái tôi va nhau, thù leo thang, tông môn chớm chia bè.`),
    },
  ],
};

// ============================================================
// NHÓM B — Khách giang hồ
// ============================================================
const B1 = {
  id: 'B1', grp: 'B', kind: 'choice', han: '訪', title: 'Cao Nhân Quá Môn', weight: 8, cdH: 48,
  cond: (t) => t.disciples.filter((d) => !d.awaiting).length >= 1,
  pick: () => [],
  story: () =>
    `Một lão nhân áo vải bạc màu, lưng đeo thanh kiếm gỉ, gõ cổng tông xin một bữa cơm chay. Đệ tử gác cổng toan đuổi đi, may có kẻ tinh mắt nhận ra — ấy là Mộ Vân Tẩu, danh túc một thời nay đã ẩn thế. Lão cười khà: "Cơm ngon, ta truyền một chiêu làm lễ tạ." Cơ duyên ngàn năm có một, chỉ tiếc cao nhân tính khí thất thường, dạy ai là tùy hứng.`,
  choices: [
    {
      label: 'Thiết yến trọng đãi, mời lão chọn người truyền dạy',
      flavor: 'Bày tiệc chay long trọng, để Mộ Vân Tẩu tự chấm một đệ tử mà truyền.',
      resolve: (c) => {
        const pool = c.t.disciples.filter((d) => !d.awaiting);
        if (c.lucky(0.55)) {
          const d = highApt(pool);
          return G(
            `Mộ Vân Tẩu nhấp ba chén trà, mắt chợt sáng khi ${d.name} bưng cơm lên. "Cốt cách này, uổng phí thì có tội." Lão kéo ${d.name} ra hậu viện, ba ngày ba đêm truyền tâm pháp. Khi ${d.name} bước ra, khí tức đã khác hẳn — một chiêu tuyệt học khắc vào cốt tủy.`,
            [ { bac: -600 }, { capBonus: { n: 1, who: d.uid } }, { uy: 200 }, { khiVan: 4 }, { bietHieu: { name: 'Mộ Vân Đệ Tử', who: d.uid } } ],
            `Mộ Vân Tẩu quá môn, chấm trúng ${d.name} mà truyền tuyệt học — tiềm năng vọt lên một bậc.`,
            'Cao nhân từng quá môn, ắt còn kẻ khác nghe danh tìm tới.'
          );
        }
        const d = lowApt(pool);
        return M(
          `Cả tông nín thở chờ lão chọn thiên kiêu, ai ngờ Mộ Vân Tẩu lại chỉ thẳng ${d.name} — kẻ tư chất tầm thường ai cũng xem nhẹ. "Đá thô mà có ngọc, các ngươi không thấy đó thôi." Lão truyền cho ${d.name} một lộ khẩu quyết kỳ dị. Cả tông ngỡ ngàng, riêng ${d.name} ôm lấy cơ duyên mà mắt rưng rưng.`,
          [ { bac: -600 }, { capBonus: { n: 2, who: d.uid } }, { uy: 120 }, { flag: { name: 'phatPhan', value: true, who: d.uid } } ],
          `Mộ Vân Tẩu bỏ qua thiên kiêu, chấm ${d.name} vô danh — "ngọc trong đá", trần tu chất mở rộng bất ngờ.`,
          'Ngọc trong đá, ngày sau ắt có chuyện để kể.'
        );
      },
    },
    {
      label: 'Nhờ lão điểm hóa cho toàn tông một buổi',
      flavor: 'Khẩn cầu Mộ Vân Tẩu mở một buổi giảng đạo cho cả lứa đệ tử.',
      resolve: (c) => {
        const pool = c.t.disciples.filter((d) => !d.awaiting);
        return c.lucky(0.5)
          ? G(
              `Mộ Vân Tẩu ngồi giữa luyện võ trường, một lời một câu vỡ ra trăm điều bế tắc. Cả lứa đệ tử nghe mà mồ hôi đầm đìa, kinh mạch như được khai thông. Trước khi đi, lão vuốt râu cười: "Tông môn này, hậu sinh khả úy." Một câu khen của danh túc, đủ vang khắp giang hồ.`,
              [ { bac: -800 }, ...pool.slice(0, 6).map((d) => ({ capBonus: { n: 1, who: d.uid } })), { uy: 260 }, { khiVan: 5 } ],
              `Mộ Vân Tẩu điểm hóa toàn tông một buổi, lại để lời khen "hậu sinh khả úy" — nền tảng cả lứa cùng vững.`
            )
          : M(
              `Mộ Vân Tẩu giảng được nửa buổi thì lắc đầu: "Căn cơ chưa đủ, nói nhiều cũng phí." Lão chỉ qua loa vài chiêu rồi cáo từ. Đệ tử vớt vát được chút ít, song buổi giảng nhạt hơn kỳ vọng — bạc đã tốn mà cơ duyên chỉ hé một góc.`,
              [ { bac: -800 }, ...pool.slice(0, 4).map((d) => ({ capBonus: { n: 1, who: d.uid } })), { uy: 60 } ],
              `Mộ Vân Tẩu điểm hóa nửa chừng, chê căn cơ chưa đủ — cả lứa nhích nhẹ, cơ duyên dang dở.`
            );
      },
    },
    {
      label: 'Hỏi xin lão một món gia bảo ẩn thế',
      flavor: 'Ngỏ lời xin Mộ Vân Tẩu để lại một món di bảo hoặc bí kíp.',
      resolve: (c) => {
        const pool = c.t.disciples.filter((d) => !d.awaiting);
        const d = highApt(pool);
        return c.lucky(0.45)
          ? G(
              `Lão nheo mắt: "Muốn bảo của ta? Trước hãy đỡ một câu đố." Lão buông một công án hiểm hóc, ${d.name} trầm ngâm rồi đối đáp trôi chảy. Mộ Vân Tẩu ha hả, rút trong tay nải một quyển trục cũ: "Tặng kẻ có duyên." Tàng Thư từ nay thêm một bộ công pháp ẩn thế.`,
              [ { uy: 220 }, { khiVan: 5 }, { capBonus: { n: 1, who: d.uid } }, { bietHieu: { name: 'Giải Công Án', who: d.uid } } ],
              `${d.name} giải trúng công án của Mộ Vân Tẩu — tông môn được tặng một bộ công pháp ẩn thế.`
            )
          : B(
              `Lão buông một câu đố, cử ${d.name} ra đối. ${d.name} bí lời, đáp sai bét nhè. Mộ Vân Tẩu phất tay áo, để lại một câu chê cay nghiệt: "Tông môn lớn mà con mắt nhỏ." Lão bỏ đi, mang theo cơ duyên. ${d.name} nuốt nhục, đêm đêm khổ luyện thề rửa cái tiếng dốt.`,
              [ { khiVan: -3 }, { flag: { name: 'phatPhan', value: true, who: d.uid } } ],
              `${d.name} đáp hụt câu đố Mộ Vân Tẩu, bị chê cay — ôm cờ phát phẫn mà khổ luyện.`
            );
      },
    },
    {
      label: 'Để đệ tử cao ngạo tỉ thí trước khi nhận dạy',
      flavor: 'Mặc một đệ tử khinh lão, đòi so chiêu phân cao thấp.',
      resolve: (c) => {
        const pool = c.t.disciples.filter((d) => !d.awaiting);
        const arrogant = pool.filter((d) => c.anyTrait(['Cao Ngạo', 'Cuồng Ngạo', 'Hiếu Chiến'], d));
        const d = arrogant.length ? rnd(arrogant) : rnd(pool);
        return c.lucky(0.5)
          ? G(
              `${d.name} chắp kiếm khinh khỉnh: "Lão hủ cũng dám xưng cao nhân?" Mộ Vân Tẩu mỉm cười, một ngón tay điểm bay thanh kiếm. ${d.name} ngã sõng soài, bừng tỉnh, dập đầu bái lạy thành tâm. Lão đỡ dậy, truyền cho mấy đường chân quyết — kẻ ngông cuồng từ đó học được chữ "khiêm".`,
              [ { capBonus: { n: 1, who: d.uid } }, { uy: 160 }, { flag: { name: 'cuuChuoc', value: true, who: d.uid } } ],
              `${d.name} cao ngạo tỉ thí thua Mộ Vân Tẩu, bừng tỉnh bái sư — ngông cuồng hóa khiêm cung.`
            )
          : M(
              `${d.name} khinh lão, đòi tỉ thí. Mộ Vân Tẩu lắc đầu phất áo: "Tâm chưa tĩnh, dạy cũng vô ích." Lão bỏ đi, cơ duyên tan theo gió. Song khắp giang hồ truyền nhau: tông ấy đệ tử có cốt khí, dám đối mặt danh túc mà không cúi đầu.`,
              [ { uy: 110 }, { flag: { name: 'batPhuc', value: true, who: d.uid } } ],
              `${d.name} ngạo khí khiến Mộ Vân Tẩu bỏ đi mất cơ duyên — đổi lấy tiếng "tông môn có cốt khí".`
            );
      },
    },
  ],
};

const B2 = {
  id: 'B2', grp: 'B', kind: 'choice', han: '圖', title: 'Hành Thương Mãi Đồ', weight: 9, cdH: 36,
  cond: (t) => t.disciples.filter((d) => !d.awaiting).length >= 1,
  pick: () => [],
  story: () =>
    `Một thương nhân mặt dày miệng dẻo, tự xưng Bách Hiểu Sinh, dắt ngựa tới cổng, mở tay nải khoe một tấm bản đồ ố vàng: "Bí tàng của một tuyệt thế cao nhân đã chết, trong có gia bảo trấn phái! Lão phu chỉ bán cho người có duyên." Hắn ra giá cắt cổ, ánh mắt láo liên. Bản đồ thật hay đồ giả lừa gà — chỉ trời mới biết.`,
  choices: [
    {
      label: 'Mua đứt, cử đệ tử đi tầm bảo',
      flavor: 'Trả đủ giá, phái một đệ tử lên đường lần theo bản đồ.',
      resolve: (c) => {
        const pool = c.t.disciples.filter((d) => !d.awaiting);
        const d = highApt(pool);
        return c.lucky(0.5)
          ? G(
              `Ngươi dốc bạc mua đứt, sai ${d.name} khăn gói lên đường. Một chu kỳ sau, ${d.name} trở về, áo bào rách bươm mà tay ôm một hộp gỗ đàn — bên trong là một món di bảo phủ bụi trăm năm. Bản đồ là thật! Cả tông reo vang, danh tiếng "tông có phúc duyên" lan khắp giang hồ.`,
              [ { bac: -700 }, { uy: 240 }, { khiVan: 6 }, { capBonus: { n: 1, who: d.uid } }, { bietHieu: { name: 'Tầm Bảo Quy Lai', who: d.uid } } ],
              `${d.name} lần theo bản đồ Bách Hiểu Sinh, ôm di bảo trăm năm trở về — tông môn thêm một giai thoại.`
            )
          : M(
              `Ngươi mua đứt, sai ${d.name} đi. Một chu kỳ lặn lội, ${d.name} về tay không — bản đồ là đồ giả, "bí tàng" chỉ là một hang dơi hôi rình. Song dọc đường ${d.name} dẹp một ổ thảo khấu, cứu được dân làng, mang về một bụng chuyện giang hồ ly kỳ. Tiền thì mất, mà lòng đệ tử lại nở ra.`,
              [ { bac: -700 }, { uy: 90 }, { flag: { name: 'triAn', value: true, who: d.uid } } ],
              `Bản đồ Bách Hiểu Sinh hóa đồ giả, song ${d.name} dẹp khấu cứu dân dọc đường — mất của được nghĩa.`
            );
      },
    },
    {
      label: 'Mặc cả ép giá, dọa lột mặt nạ kẻ lừa',
      flavor: 'Cử đệ tử khôn khéo ra mặt, vừa trả giá vừa dò thật giả.',
      resolve: (c) => {
        const pool = c.t.disciples.filter((d) => !d.awaiting);
        const shrewd = pool.filter((d) => c.anyTrait(['Mưu Trí', 'Cô Độc', 'Thận Trọng'], d));
        const d = shrewd.length ? rnd(shrewd) : rnd(pool);
        return c.lucky(0.55)
          ? G(
              `${d.name} chắp tay điềm đạm, vài câu hỏi xoáy khiến Bách Hiểu Sinh toát mồ hôi. "Mực này pha nghệ, giấy này hun khói — ông định lừa ai?" Thương nhân cứng họng, đành hạ giá còn nửa rồi cút thẳng. Cả tông được phen hả dạ, bạc tiêu chẳng đáng là bao.`,
              [ { bac: -300 }, { uy: 140 }, { khiVan: 3 }, { capBonus: { n: 1, who: d.uid } } ],
              `${d.name} đấu trí ép giá Bách Hiểu Sinh còn nửa — tông môn nức tiếng "khó lừa".`
            )
          : M(
              `${d.name} ra sức mặc cả, nhưng Bách Hiểu Sinh là con cáo già, mặt không đổi sắc. Mặc cả qua lại, hắn phật ý quảy gánh bỏ đi: "Vô duyên thì thôi." Bản đồ theo hắn đi luôn — không ai biết được nó thật hay giả. Khôn quá hóa lỡ phần.`,
              [ { uy: 30 } ],
              `${d.name} ép giá quá tay, Bách Hiểu Sinh phật ý bỏ đi — bản đồ thật giả thành ẩn số.`
            );
      },
    },
    {
      label: 'Không mua, mời thương nhân ở lại kể chuyện',
      flavor: 'Gác tấm bản đồ, rót rượu mời hắn kể tin tức giang hồ.',
      resolve: (c) =>
        c.lucky(0.5)
          ? G(
              `Ngươi cười xua tấm bản đồ, chỉ rót rượu mời. Bách Hiểu Sinh rượu vào lời ra, buột miệng lắm chuyện: nào mạch gia bảo chôn nơi cổ tự, nào một môn phái lân cận đang ngấp nghé sinh sự. Tin tức quý hơn vàng — ngươi ghi lòng tạc dạ, tiễn hắn ra cổng.`,
              [ { uy: 60 }, { khiVan: 4 } ],
              `Chưởng Môn mời Bách Hiểu Sinh kể chuyện thay vì mua đồ — moi được tin tức giang hồ quý giá.`,
              'Nghe đâu một môn phái lân cận đang ngấp nghé sinh sự.'
            )
          : M(
              `Ngươi mời rượu mong moi tin, nhưng Bách Hiểu Sinh chỉ rặt khoe khoang chuyện bán buôn, chẳng có gì đáng giá. Hắn ăn no uống say rồi đi, để lại cái cổng thoảng mùi rượu thừa. Mất một buổi mà chẳng được mấy.`,
              [ { khiVan: 1 } ],
              `Chưởng Môn đãi rượu Bách Hiểu Sinh, song hắn chỉ khoác lác — chẳng moi được tin gì.`
            ),
    },
    {
      label: 'Tịch thu bản đồ, trị kẻ buôn đồ gian',
      flavor: 'Ra lệnh khám tay nải, lục soát lai lịch tấm bản đồ.',
      resolve: (c) => {
        const pool = c.t.disciples.filter((d) => !d.awaiting);
        const d = rnd(pool);
        return c.dao === 'chinh'
          ? B(
              `Ngươi quát đệ tử khám tay nải, quả nhiên lòi ra cả xấp đồ ăn cắp. Bách Hiểu Sinh quỳ sụp van xin. Ngươi tịch thu bản đồ, sung công đồ gian, đuổi hắn đi. Đồ thì lấy được không tốn một đồng, song dân hành thương rỉ tai nhau: "Tông ấy hà khắc, chớ dây." Từ nay khách buôn ngại ghé.`,
              [ { khiVan: -6 }, { uy: -40 }, { flag: { name: 'oanTham', value: true, who: d.uid } } ],
              `Chưởng Môn tịch thu bản đồ, trị Bách Hiểu Sinh buôn đồ gian — được của mà mang tiếng hà khắc, khách buôn ngại ghé.`
            )
          : M(
              `Ngươi định ra tay tịch thu, nhưng tông môn vốn không câu nệ chính tà. Bách Hiểu Sinh thấy thế dữ, vứt cả tay nải mà chạy, để lại tấm bản đồ lăn lóc dưới đất. Ngươi nhặt lên — thật giả khôn lường, song chẳng tốn một đồng. Một phen nhặt may.`,
              [ { khiVan: -2 }, { uy: 20 } ],
              `Chưởng Môn dọa tịch thu, Bách Hiểu Sinh bỏ của chạy lấy người — tấm bản đồ về tông mà thật giả khó tường.`
            );
      },
    },
  ],
};

const B3 = {
  id: 'B3', grp: 'B', kind: 'choice', han: '使', title: 'Tha Phương Lai Sứ', weight: 8, cdH: 42,
  cond: (t) => t.disciples.filter((d) => !d.awaiting).length >= 1,
  pick: () => [],
  story: () =>
    `Một thiếu niên áo gấm cưỡi tuấn mã tới sơn môn, hai tay dâng thiệp đỏ — môn phái lân cận phái sứ sang. Có thể là cầu thân kết minh, có thể là dò xét hư thực, cũng có thể là hạ chiến thư trá hình. Sứ giả lễ phép cúi mình mà ánh mắt sắc như dao, từng lời đều cân nhắc đắn đo.`,
  choices: [
    {
      label: 'Trọng đãi, kết minh giao hảo',
      flavor: 'Bày lễ tiếp đãi long trọng, ngỏ lời kết minh hai nhà.',
      resolve: (c) =>
        c.dao === 'ta'
          ? M(
              `Ngươi mở tiệc kết minh, sứ giả vái dài nhận lễ. Hai nhà cắt máu ăn thề. Song đạo các ngươi vốn nghịch nhau — minh ước này như đồng sàng dị mộng, dưới chén rượu thề đã ngầm cài mầm nghi kỵ. Bằng mặt mà chưa hẳn bằng lòng.`,
              [ { bac: -300 }, { uy: 120 }, { khiVan: 2 } ],
              `Chưởng Môn kết minh môn phái lân cận, song đạo nghịch nhau — minh ước đồng sàng dị mộng, mầm phản gián ngầm gieo.`,
              'Minh ước gượng ép, ngày sau ắt có kẻ trở mặt.'
            )
          : G(
              `Ngươi bày tiệc trọng đãi, đôi bên cắt máu ăn thề kết làm huynh đệ môn phái. Sứ giả mừng rỡ ra mặt, hẹn ngày tương trợ. Từ nay tông môn thêm một cánh tay ngoài giang hồ — kẻ nào dòm ngó cũng phải đắn đo.`,
              [ { bac: -300 }, { uy: 200 }, { khiVan: 5 } ],
              `Chưởng Môn kết minh giao hảo với môn phái lân cận — tông môn thêm vây cánh, giảm cơ bị khiêu chiến.`
            ),
    },
    {
      label: 'Thử tài sứ giả, dò ngược ý đồ',
      flavor: 'Cử đệ tử mưu trí tiếp khách, vừa đối đáp vừa dò xét.',
      resolve: (c) => {
        const pool = c.t.disciples.filter((d) => !d.awaiting);
        const clever = pool.filter((d) => c.anyTrait(['Mưu Trí', 'Thận Trọng', 'Cô Độc'], d));
        const d = clever.length ? rnd(clever) : rnd(pool);
        return c.lucky(0.55)
          ? G(
              `${d.name} tiếp khách, trà ba tuần mà lời như cờ vây. Vài câu gài khéo, sứ giả lỡ miệng để lộ: môn phái kia gần đây nội bộ lục đục, khí thế đang suy. ${d.name} ghi nhớ, tiễn khách rồi mật báo lên điện. Biết người biết ta, trận sau ung dung.`,
              [ { uy: 130 }, { khiVan: 4 }, { capBonus: { n: 1, who: d.uid } } ],
              `${d.name} đấu trí moi được hư thực môn phái lân cận — tông môn nắm tiên cơ.`,
              'Môn phái kia đang suy, dò ra hư thực trận sau ung dung.'
            )
          : B(
              `${d.name} tiếp khách, ai ngờ sứ giả mới là tay lão luyện. Mấy câu dò hỏi vòng vo, ${d.name} sa vào bẫy, vô tình để lộ binh lực mỏng dày của bản tông. Sứ giả mỉm cười cáo từ, trong lòng đã nắm rõ tỏng. Trinh sát hai lưỡi, lần này đứt tay mình.`,
              [ { khiVan: -4 }, { flag: { name: 'phatPhan', value: true, who: d.uid } } ],
              `${d.name} bị sứ giả gài lộ hư thực bản tông — môn phái lân cận nắm ưu thế trận khiêu chiến sau.`
            );
      },
    },
    {
      label: 'Lạnh nhạt tiễn khách, giữ thế trung lập',
      flavor: 'Nhận thiệp qua loa, không kết minh không kết thù, tiễn khách về.',
      resolve: () =>
        M(
          `Ngươi nhận thiệp, ban một chén trà nhạt rồi khoát tay tiễn khách. Sứ giả cúi chào, ánh mắt thoáng lạnh. Tông môn giữ được thế trung lập, chẳng vương vào ân oán nào — song cái cách lạnh nhạt ấy, e rằng đã ghi vào lòng kẻ kiêu căng bên kia một dấu hỏi.`,
          [ { khiVan: -1 } ],
          `Chưởng Môn lạnh nhạt tiễn sứ, giữ thế trung lập — phe kia ghi "tông cao ngạo", nhích nhẹ cơ sinh khiêu chiến.`
        ),
    },
  ],
};

// ============================================================
// NHÓM C — Khiêu chiến môn phái
// ============================================================
const C1 = {
  id: 'C1', grp: 'C', kind: 'choice', han: '戰', title: 'Khiêu Chiến Thư', weight: 8, cdH: 48,
  // cần đệ tử để cử người nghênh chiến
  cond: (t) => t.disciples.filter((d) => !d.awaiting).length >= 2,
  pick: (t) => {
    const pool = t.disciples.filter((d) => !d.awaiting);
    const a = highApt(pool);                                   // đệ tử mạnh nhất ra mặt
    const rest = pool.filter((d) => d.uid !== a.uid);
    const b = lowApt(rest) || rest[Math.floor(Math.random() * rest.length)];  // quân cờ "trá bại"
    return [a.uid, b.uid];
  },
  story: (c) =>
    `Trống trận dội ngoài sơn môn. Huyết Đao Môn — mộn phái ngang cơ đất kế bên — phái sứ tới, cử cao thủ Sài Nhất Đao đứng dưới đài hạ chiến thư, lớn tiếng đòi tỉ thí công khai, lấy Uy Danh làm vật đặt cược. Cả giang hồ đổ mắt về phía tông. ${c.main.name} đã nắm chuôi kiếm, chỉ chờ một tiếng của ngươi.`,
  choices: [
    {
      label: 'Cử đệ tử mạnh nhất nghênh chiến',
      flavor: 'Để đệ tử mạnh nhất bước lên đài, đường đường chính chính tỉ võ.',
      resolve: (c) => c.lucky(0.55)
        ? G(`${c.main.name} bước lên đài, kiếm quang chẻ gió. Ba mươi chiêu, Sài Nhất Đao bị đánh bật xuống đài, ôm đao tạ trận. Tên tông môn được xướng vang Phong Vân Bảng, Huyết Đao Môn cụp cờ rút lui, từ đó kiêng dè không dám hó hé.`,
            [ { uy: 450 }, { khiVan: 6 }, { bietHieu: { name: 'Trấn Sơn', who: c.main.uid } }, { flag: { name: 'triAn', value: true, who: c.main.uid } } ],
            `${c.main.name} thắng Sài Nhất Đao của Huyết Đao Môn trên đài tỉ thí — danh chấn giang hồ, lên Phong Vân Bảng.`)
        : B(`${c.main.name} đấu đến chiêu thứ năm mươi thì kiếm gãy, ngã quỵ dưới đao Sài Nhất Đao. Huyết Đao Môn cười ngạo nghễ rút quân. Uy Danh tông sứt một mảng, mà ${c.main.name} ôm hận, đêm đêm rút kiếm chém đá hậu sơn, thề ngày tái đấu.`,
            [ { uy: -180 }, { khiVan: -4 }, { flag: { name: 'phatPhan', value: true, who: c.main.uid } } ],
            `${c.main.name} bại dưới đao Sài Nhất Đao — Uy Danh tổn, kẻ thua ôm hận khổ luyện chờ phục thù.`),
    },
    {
      label: 'Cử đệ tử yếu hơn, lấy thế khinh địch',
      flavor: 'Cố tình đưa một đệ tử yếu hơn ra quân, giương đông kích tây.',
      resolve: (c) => c.hasTrait('Mưu Trí', c.main) || c.hasTrait('Mưu Trí', c.second)
        ? (c.lucky(0.5)
            ? B(`${c.second.name} dáng vẻ non nớt bước lên, Sài Nhất Đao khinh thường vung đao bừa. Ngờ đâu đó là thế trá — ${c.second.name} thuận đao lật kèo, một chiêu điểm trúng yếu huyệt. "Dĩ nhược thắng cường" vang khắp giang hồ, ai cũng đồn tông này thâm sâu khó dò.`,
                [ { uy: 520 }, { khiVan: 7 }, { bietHieu: { name: 'Trá Bại', who: c.second.uid } } ],
                `${c.second.name} trá bại lật kèo Sài Nhất Đao — "dĩ nhược thắng cường" truyền tụng khắp võ lâm.`)
            : M(`Mẹo trá bại của ${c.second.name} suýt thành, song Sài Nhất Đao lão luyện, kịp nhận ra mà thu đao đúng lúc. ${c.second.name} thua sát nút. Huyết Đao Môn rút quân, có kẻ tấm tắc "tông ấy gan", có kẻ mỉa "ra quân không hết sức". Tiếng tăm nửa khen nửa chê.`,
                [ { uy: 40 }, { khiVan: -2 } ],
                `${c.second.name} trá bại bất thành trước Sài Nhất Đao — thua sát nút, giang hồ luận nửa khen nửa chê.`))
        : B(`Không có mưu kế gối đầu, ${c.second.name} ra quân yếu thật là yếu. Sài Nhất Đao một đao hạ gục, lại bỉu môi "tông này coi thường ta đến vậy?". Huyết Đao Môn rêu rao khắp nơi: tông ấy vừa nhát vừa kiêu. Uy Danh hao kép.`,
            [ { uy: -150 }, { khiVan: -4 } ],
            `${c.second.name} bại nhanh trước Sài Nhất Đao — kế khinh địch phản tác dụng, tông mang tiếng vừa nhát vừa kiêu.`),
    },
    {
      label: 'Từ chối tỉ thí, đóng cửa tạ khách',
      flavor: 'Hạ lệnh bế sơn môn, không tiếp chiến thư.',
      resolve: (c) =>
        B(`Cổng sơn môn khép chặt, mặc Sài Nhất Đao đứng ngoài chửi rủa nửa ngày rồi hậm hực bỏ đi. Tránh được trận thua, song Huyết Đao Môn đi đến đâu cũng rêu rao tông này nhát gan né chiến. Giang hồ ngửi thấy mùi nhược, mấy mộn phái khác đã bắt đầu liếc mắt dòm ngó.`,
          [ { uy: -90 }, { khiVan: -3 } ],
          `Tông bế quan từ chối Huyết Đao Môn — tránh trận mà mang tiếng nhát, giang hồ bắt đầu dòm ngó.`),
    },
    {
      label: 'Đề nghị đổi luật, tỉ trí thay tỉ võ',
      flavor: 'Mời đối phương đổi sang đấu cờ, đấu đan, đấu thi văn.',
      resolve: (c) => c.lucky(0.5)
        ? G(`Ngươi mỉm cười đề nghị: thay vì so đao kiếm, hãy so trí. Sài Nhất Đao một võ phu, miễn cưỡng nhận lời rồi thua liểng xiểng trước bàn cờ ${c.main.name} bày sẵn. Huyết Đao Môn ngậm bồ hòn rút lui, giang hồ phong tông là "tông của trí giả".`,
            [ { uy: 280 }, { khiVan: 4 }, { bietHieu: { name: 'Trí Giả', who: c.main.uid } } ],
            `${c.main.name} thắng Huyết Đao Môn trên bàn cờ thay vì đài võ — tông được xưng tụng "trí giả".`)
        : M(`Sài Nhất Đao gằn giọng: "Võ lâm phân cao thấp bằng nắm đấm, không bằng cây bút!" rồi phất tay bỏ đi, vừa đi vừa mỉa tông này "sợ động thủ". Tránh được trận võ bất lợi, song cũng chuốc lời ong tiếng ve. Lái cuộc chơi đâu phải lúc nào cũng xuôi.`,
            [ { uy: -30 } ],
            `Tông mời Huyết Đao Môn đấu trí, bị khước từ — tránh trận võ mà chuốc tiếng "sợ động thủ".`),
    },
  ],
};

const C2 = {
  id: 'C2', grp: 'C', kind: 'choice', han: '脈', title: 'Tranh Đoạt Linh Mạch', weight: 7, cdH: 48,
  cond: (t) => t.disciples.filter((d) => !d.awaiting).length >= 2,
  pick: (t) => {
    const pool = t.disciples.filter((d) => !d.awaiting);
    const a = highApt(pool);                                   // chủ tướng ra mặt
    const rest = pool.filter((d) => d.uid !== a.uid);
    // ưu tiên đệ tử Mưu Trí cho nhánh "ngư ông", nếu không có thì lấy ngẫu nhiên
    const muu = rest.find((d) => d.traits.includes('Mưu Trí'));
    const b = muu || rest[Math.floor(Math.random() * rest.length)];
    return [a.uid, b.uid];
  },
  story: (c) =>
    `Một mạch linh khí mới lộ giữa ranh giới hai tông — đặt Tụ Linh Trận nơi đó thì Khí Vận hanh thông dài lâu. Thanh Vân Cốc kế bên cũng nhòm ngó, dàn đệ tử ra sơn cốc đối mặt người của ta. ${c.main.name} đứng đầu hàng, gươm chưa tuốt mà sát khí đã đằng đằng. Một lời của ngươi, định mạch về tay ai.`,
  choices: [
    {
      label: 'Động thủ tranh đoạt bằng vũ lực',
      flavor: 'Dẫn đệ tử mạnh nhất cùng môn đồ xông lên, đoạt mạch bằng nắm đấm.',
      resolve: (c) => c.lucky(0.55)
        ? G(`${c.main.name} dẫn đầu lao vào, kiếm khí cuồn cuộn quét tan thế trận Thanh Vân Cốc. Hai canh giờ huyết chiến, đối phương lui binh, để lại linh mạch. Tụ Linh Trận dựng lên ngay nơi mạch chảy, khí vận tông từ đó dồi dào dài lâu — dẫu vài đệ tử phải vào Y Quán dưỡng thương.`,
            [ { uy: 200 }, { khiVan: 12 }, { flag: { name: 'triAn', value: true, who: c.main.uid } } ],
            `${c.main.name} đoạt linh mạch từ tay Thanh Vân Cốc — Khí Vận tông dồi dào dài lâu, ghi mốc Sử Sách.`)
        : B(`Trận chiến giằng co rồi nghiêng về Thanh Vân Cốc. ${c.main.name} hộc máu lui binh, mạch linh khí rơi vào tay đối phương, mấy đệ tử trọng thương khiêng về Y Quán. Uy Danh tổn, mà kẻ chủ chiến nuốt hận, ngày đêm thề có ngày đòi lại bằng được.`,
            [ { uy: -160 }, { khiVan: -6 }, { flag: { name: 'phatPhan', value: true, who: c.main.uid } } ],
            `Tông bại trận tranh mạch với Thanh Vân Cốc — mất mạch, đệ tử trọng thương, kẻ thua ôm hận chờ phục thù.`),
    },
    {
      label: 'Phân chia, thỏa thuận luân phiên dùng mạch',
      flavor: 'Cử người sang điều đình, chia đôi quyền dùng linh mạch.',
      resolve: (c) =>
        M(`Hai bên ngồi xuống, gác kiếm, ký một bản giao ước: luân phiên đặt Tụ Linh Trận, mỗi tông hưởng một nửa khí mạch. Không một giọt máu rơi, quan hệ hai tông ấm lại. Chỉ là dưới mặt nước phẳng lặng, một mầm tranh chấp âm ỉ đã gieo — ngày nào đó hẳn có kẻ phá ước.`,
          [ { khiVan: 6 }, { uy: 60 } ],
          `Tông cùng Thanh Vân Cốc chia mạch luân phiên — hòa khí sinh tài, song mầm tranh chấp đã âm ỉ gieo.`),
    },
    {
      label: 'Nhường hẳn, đổi lấy nhân tình',
      flavor: 'Lui binh, nhường trọn linh mạch cho Thanh Vân Cốc.',
      resolve: (c) => c.hasTrait('Nhân Hậu', c.main) || c.anyTrait(['Nhân Hậu', 'Trượng Nghĩa'], c.second)
        ? G(`${c.main.name} cung tay: "Mạch này nhường quý phái." Thanh Vân Cốc cả kinh trước khí độ ấy, cốc chủ thân chinh sang tạ ơn, kết làm bằng hữu. Bỏ một mạch linh khí, đổi lại một mối giao tình bền chặt — sau này hữu sự, ắt có người chìa tay.`,
            [ { uy: 120 }, { khiVan: 2 }, { flag: { name: 'triAn', value: true, who: c.main.uid } } ],
            `Tông nhường linh mạch cho Thanh Vân Cốc — lấy nhân tình thay địa lợi, kết giao tình bền chặt.`)
        : M(`Ngươi hạ lệnh lui binh, nhường mạch. Thanh Vân Cốc nhận, có ghi ơn, song trong tông không ít kẻ ấm ức "rõ ràng tới tay mà lại buông". Lùi một bước mở đường dài là thật, mà lòng quân chưa hẳn đã phục.`,
            [ { uy: 30 }, { khiVan: -1 } ],
            `Tông nhường linh mạch cho Thanh Vân Cốc — được nhân tình, song lòng quân chưa phục.`),
    },
    {
      label: 'Cài đệ tử Mưu Trí "ngư ông đắc lợi"',
      flavor: 'Sai một đệ tử mưu trí ngầm khích các phe đánh nhau, mình thủ lợi.',
      resolve: (c) => c.lucky(0.5)
        ? B(`${c.second.name} ngầm tung tin, khích Thanh Vân Cốc với một mộn phái thứ ba lao vào tranh mạch. Hai bên đánh nhau sứt đầu mẻ trán, ${c.second.name} ung dung dẫn người vào tiếp quản linh mạch không tốn một binh. Cả mạch về tay, giang hồ kháo nhau tông này "mưu cao khó lường".`,
            [ { uy: 160 }, { khiVan: 10 }, { bietHieu: { name: 'Ngư Ông', who: c.second.uid } } ],
            `${c.second.name} dùng kế ngư ông, đoạt trọn linh mạch mà không tốn quân — tông được đồn "mưu cao".`)
        : B(`Kế chưa kịp chín thì bị lật tẩy. Cả Thanh Vân Cốc lẫn mộn phái thứ ba phát hiện bị giật dây, lập tức quay sang căm ghét tông. ${c.second.name} mang tiếng tiểu nhân, hai phe rêu rao khắp giang hồ, đã có lời bàn nên hội đồng "dạy dỗ" cái tông quỷ kế này.`,
            [ { uy: -140 }, { khiVan: -7 }, { flag: { name: 'tamMaSeed', value: true, who: c.second.uid } } ],
            `Kế ngư ông của ${c.second.name} bị lật tẩy — tông mang tiếng tiểu nhân, hai phe quay sang thù ghét.`),
    },
  ],
};

// ============================================================
// NHÓM D — Chuỗi Phản Đồ (nối tiếp qua queue)
// ============================================================
const D1 = {
  id: 'D1', grp: 'D', kind: 'choice', han: '魔', title: 'Tâm Ma Khởi', weight: 5, cdH: 72,
  cond: (t) => t.disciples.filter((d) => !d.awaiting).length >= 1,
  pick: (t) => {
    const pool = t.disciples.filter((d) => !d.awaiting);
    if (!pool.length) return [];
    // ưu tiên kẻ đã gieo mầm: tamMaSeed / oanTham / batPhuc, rồi tới kẻ tâm ma "tối" nhất
    const seeded = pool.filter((d) => d.flags && (d.flags.tamMaSeed || d.flags.oanTham || d.flags.batPhuc));
    if (seeded.length) return [seeded[Math.floor(Math.random() * seeded.length)].uid];
    const dark = pool.slice().sort((a, b) => (b.tamMa || 0) - (a.tamMa || 0))[0];
    return [dark.uid];
  },
  story: (c) =>
    `Y Quán bẩm gấp giữa đêm: ${c.main.name} đã ba canh không về phòng. Ngươi lần xuống hậu sơn, bắt tận tay y đang ôm một quyển tà điển lén thó từ Tàng Thư Lâu, miệng lẩm nhẩm chú văn ma đạo. Kinh mạch y cuộn một luồng hơi lạnh tanh máu, mắt vằn tia đỏ, ngoảnh lại nhìn ngươi mà chuôi kiếm đã siết chặt trong tay. Đạo tâm nó đã nứt — trong vết nứt ấy, có thứ gì đó đang gọi y nếm máu để mạnh thêm.`,
  choices: [
    {
      label: 'Phế ma công, nhốt Y Quán chữa',
      flavor: 'Đoạt tà điển, áp chế kinh mạch, giam vào Y Quán dồn sức cứu chữa.',
      resolve: (c) => (c.lucky(0.45) && c.anyTrait(['Nhân Hậu', 'Cần Mẫn', 'Thận Trọng'], c.main))
        ? G(
            `Ngươi đích thân điểm tê huyệt đạo y, đoạt tà điển ném vào lò, rồi ngồi canh bên giường Y Quán suốt bảy ngày bảy đêm dẫn khí gột sát niệm. Đêm thứ bảy ${c.main.name} bật khóc tỉnh dậy, quỳ sụp tạ tội. Kiếp nạn ấy lại tôi y thành thép — từ đó lòng trung không gì lay chuyển, đạo tâm trong veo hơn xưa.`,
            [ { uy: 150 }, { khiVan: 6 }, { capBonus: { n: 1, who: c.main.uid } }, { flag: { name: 'cuuChuoc', value: true, who: c.main.uid } } ],
            `${c.main.name} sa tâm ma rồi được Chưởng Môn cứu chữa bảy ngày — cải tà quy chính, thành đệ tử "kiếp nạn trùng sinh".`
          )
        : B(
            `Ngươi giam y vào Y Quán, ngày đêm phế ma trục độc. Nhưng tà khí đã ăn vào cốt tủy, mỗi lần dẫn khí là một lần y gào rú. Canh ba đêm thứ ba, song sắt Y Quán bị bẻ cong — ${c.main.name} vùng chạy giữa mưa, để lại một vũng máu và một câu vọng lại: "Sư phụ cứu được thân, cứu chẳng được tâm."`,
            [ { uy: -80 }, { khiVan: -6 }, { rebel: { who: c.main.uid } }, { queue: { eid: 'D2', delayH: 24, rebelFrom: c.main.uid } } ],
            `Chưởng Môn cố cứu ${c.main.name} mà bất thành — nó phá Y Quán đào tẩu trong đêm mưa.`,
            'Phản đồ đã trốn khỏi sơn môn…'
          ),
    },
    {
      label: 'Thuận nó theo ma đạo, để tự đi',
      flavor: 'Không ngăn, để y mang tà điển rời sơn môn theo con đường đã chọn.',
      resolve: (c) => B(
        `Ngươi thở dài, lui sang một bên. "Đạo của con, con tự gánh." ${c.main.name} sững người, rồi vái ngươi ba vái thật sâu, ôm tà điển quay gót xuống núi, bóng tan vào màn đêm. Không thành thù ngay — nhưng quyển bí kíp tổ truyền đi theo y, và sĩ diện tông môn cũng sứt một mảnh. Giang hồ rồi sẽ đồn: tông này thả hổ về rừng.`,
        [ { uy: -120 }, { rebel: { who: c.main.uid } }, { queue: { eid: 'D2', delayH: 24, rebelFrom: c.main.uid } } ],
        `Chưởng Môn buông tay để ${c.main.name} mang tà điển hạ sơn — thả hổ về rừng, nợ chưa đòi.`,
        'Một ngày kia, cố nhân sẽ quay về…'
      ),
    },
    {
      label: 'Lập đàn lấy ma luyện đạo, đánh cược',
      flavor: 'Huy động Trưởng Lão dựng Tụ Linh Trận trấn ma, cùng y vượt qua tâm kiếp.',
      resolve: (c) => c.lucky(0.4)
        ? G(
            `Ngươi dốc cả Cống Hiến dựng Tụ Linh Trận, đích thân ngồi trấn đàn cùng các Trưởng Lão, ép ${c.main.name} đối diện ma trong tâm thay vì chạy trốn. Bảy ngày giằng co, đến khi sét xé trời, y rống một tiếng — nuốt trọn ma niệm làm của mình. Lấy ma luyện đạo, một bước vọt qua cảnh giới! Sát khí nay thành sát đạo thuần, danh chấn sơn môn.`,
            [ { uy: 400 }, { khiVan: 8 }, { realmUp: { n: 1, who: c.main.uid } }, { capBonus: { n: 1, who: c.main.uid } }, { bietHieu: { name: 'Phục Ma', who: c.main.uid } } ],
            `${c.main.name} lấy ma luyện đạo, vượt tâm kiếp đột phá — sát khí hóa sát đạo, đại giai thoại trấn phái.`
          )
        : B(
            `Đàn lập được nửa chừng thì linh trận rạn. Ma niệm phản phệ, ${c.main.name} hóa điên, một chưởng đánh gãy ngực sư đệ ngồi trấn cạnh rồi cười man dại phá trận đào tẩu, máu đồng môn còn vương trên tay. Canh bạc lớn nhất, ngươi thua sạch.`,
            [ { uy: -150 }, { khiVan: -10 }, { congHien: -40 }, { rebel: { who: c.main.uid } }, { queue: { eid: 'D2', delayH: 24, rebelFrom: c.main.uid } } ],
            `Đàn trấn ma vỡ giữa chừng — ${c.main.name} ma niệm phản phệ, đả thương đồng môn rồi đào tẩu, thù sâu.`,
            'Mang theo máu đồng môn, nó đã đi rồi…'
          ),
    },
    {
      label: 'Trục xuất ngay, dứt hậu họa',
      flavor: 'Tuyên trước toàn môn, phế danh tịch, đuổi thẳng xuống núi không cho biện bạch.',
      resolve: (c) => B(
        `Ngươi gõ chuông tụ tập toàn môn, đương chúng xé danh tịch ${c.main.name}, đuổi thẳng xuống núi. Y không van xin, chỉ ngoảnh lại cười lạnh một tiếng trước khi khuất sau rặng tùng. Vài đệ tử thân với y cúi gằm mặt, lén lau nước mắt — chúng thấy tông môn lần này quá vô tình. Cắt cỏ thì dứt, mà gốc oán đã gieo vào lòng kẻ bị ruồng.`,
        [ { uy: -60 }, { khiVan: -5 }, { rebel: { who: c.main.uid } }, { flag: { name: 'oanTham', value: true, who: c.main.uid } }, { queue: { eid: 'D2', delayH: 24, rebelFrom: c.main.uid } } ],
        `Chưởng Môn xé danh tịch trục xuất ${c.main.name} trước toàn môn — kẻ bị ruồng bỏ ôm hận hạ sơn.`,
        'Oán khí ấy rồi sẽ quay về gõ cửa…'
      ),
    },
  ],
};
const D2 = {
  id: 'D2', grp: 'D', kind: 'choice', han: '叛', title: 'Phản Xuất Sư Môn', weight: 10, cdH: 0, chain: true,
  cond: (t) => t.events.rebels.length > 0,
  story: (c) =>
    `${c.rebel.name} đã trốn biệt khỏi sơn môn, cuốn theo bí kíp lẫn mấy phần sĩ diện của tông. Giang hồ bắt đầu xì xào: tông môn "dạy hổ thành tinh". Trong môn cũng chia làm hai — kẻ vỗ bàn đòi phát Truy Sát Lệnh rửa nhục, kẻ vẫn lén ngóng cổng sơn, mong cố nhân hồi đầu. Mọi ánh mắt dồn về ngươi: Chưởng Môn định liệu thế nào?`,
  choices: [
    {
      label: 'Phát Truy Sát Lệnh, cử cao đồ đuổi bắt',
      flavor: 'Điều đệ tử mạnh nhất truy lùng dấu vết, quyết giải kẻ phản về sơn môn.',
      resolve: (c) => c.lucky(0.4)
        ? M(
            `Cao đồ ngươi cử đi bám theo mùi tà khí ba ngày ba đêm, dồn ${c.rebel.name} vào một hẻm núi cụt. Một trận ác đấu, lưới vây siết lại — nhưng đến phút chót y tự phế nửa thân kinh mạch, mượn phản chấn thoát thân, cao chạy xa bay. Bắt hụt. Mối thù từ đó càng sâu, mà giang hồ đã biết tông này dám ra tay.`,
            [ { uy: 100 }, { queue: { eid: 'D3', delayH: 48, rebelFrom: c.rebel.fromUid } } ],
            `Truy Sát Lệnh dồn ${c.rebel.name} vào tử lộ mà vẫn để sổng — thù chồng thêm thù.`,
            'Nó sẽ trở lại, mạnh hơn xưa…'
          )
        : B(
            `Cao đồ ngươi cử đi mãi không thấy về. Nửa tháng sau, người ta khiêng y về bằng cáng, ngực hằn một dấu chưởng đen sì. ${c.rebel.name} không những thoát mà còn để lại lời nhắn cợt nhả: "Bảo sư phụ ngươi cứ chờ." Tốn quân, mất mặt, chỉ tổ chọc cho hổ thêm dữ.`,
            [ { uy: -100 }, { khiVan: -5 }, { queue: { eid: 'D3', delayH: 48, rebelFrom: c.rebel.fromUid } } ],
            `Cao đồ truy sát ${c.rebel.name} bại trận trở về — phản đồ nhởn nhơ, thù càng chất.`,
            'Một ngày kia nó sẽ tự tìm về…'
          ),
    },
    {
      label: 'Phong tỏa tin tức, âm thầm xóa dấu',
      flavor: 'Bịt miệng giang hồ, lặng lẽ thu dọn mọi dấu vết liên quan tới kẻ phản.',
      resolve: (c) => c.anyTrait(['Mưu Trí', 'Thận Trọng']) // who mặc định = main; chuỗi D không pick nên main=null → false an toàn
        ? M(`Ngươi cho người rải bạc khắp các quán trà, dập tắt mọi lời đồn trước khi nó kịp lan. Thể diện tông môn giữ được vẹn, giang hồ chẳng mấy ai hay. Nhưng trong môn, đệ tử ngầm hiểu "phản đồ vẫn nhởn nhơ ngoài kia" — sĩ khí chùng xuống một nấc. Cái sảy đã giấu, cái ung vẫn lớn.`,
            [ { khiVan: -3 }, { queue: { eid: 'D3', delayH: 48, rebelFrom: c.rebel.fromUid } } ],
            `Chưởng Môn phong tỏa tin ${c.rebel.name} phản xuất — giữ được thể diện, sĩ khí âm thầm hao.`,
            'Tới lúc nó về, sẽ chẳng ai kịp trở tay…')
        : M(`Ngươi cố bịt miệng giang hồ, nhưng tin một đệ tử mang tà điển đào tẩu vốn là món khoái khẩu của các quán trà. Tiền rải ra như nước mà lời đồn vẫn rỉ khắp nơi. Giấu nửa vời, vừa tốn của vừa mang tiếng vụng — ${c.rebel.name} mặc sức lớn mạnh ngoài kia.`,
            [ { bac: -200 }, { khiVan: -4 }, { queue: { eid: 'D3', delayH: 48, rebelFrom: c.rebel.fromUid } } ],
            `Chưởng Môn vụng đường bịt tin ${c.rebel.name} — tiền hao mà tiếng đồn vẫn rỉ.`,
            'Nó tự do lớn mạnh, một ngày sẽ gõ cửa…'),
    },
    {
      label: 'Ra cáo thị, tuyên thanh lý môn hộ',
      flavor: 'Công khai bố cáo giang hồ, đoạn tuyệt kẻ phản, mời các môn phái cùng đề phòng.',
      resolve: (c) => G(
        `Ngươi cho khắc cáo thị dán khắp các thành lớn: ${c.rebel.name} phản xuất, ai gặp cứ trị. Lời lẽ đường hoàng, nghĩa khí ngút trời. Các môn-bot đồng cảnh ngộ vỗ tay tán thưởng "tông quy nghiêm cẩn". Chỉ là — bị cả giang hồ truy đuổi, ${c.rebel.name} bị dồn vào đường cùng, ắt phải kết bè với tà phái khác để sống. Đường đường chính chính, mà cũng đẩy thù lên cao.`,
        [ { uy: 200 }, { khiVan: 4 }, { queue: { eid: 'D3', delayH: 48, rebelFrom: c.rebel.fromUid } } ],
        `Chưởng Môn cáo thị thanh lý môn hộ với ${c.rebel.name} — tông danh chấn, song dồn kẻ phản vào tà đảng.`,
        'Lần sau nó về, sẽ không về một mình…'
      ),
    },
    {
      label: 'Gửi cố nhân thân nó đi khuyên về',
      flavor: 'Cử người đồng môn thân thiết nhất một mình xuống núi, lựa lời gọi cố nhân hồi đầu.',
      resolve: (c) => c.lucky(0.45)
        ? G(
            `Ngươi cử người đồng môn thân nhất năm xưa lặng lẽ xuống núi, chẳng mang theo binh khí, chỉ mang một vò rượu cũ hai đứa từng chia. Ba ngày sau, hai bóng người cùng về dưới trăng. ${c.rebel.name} quỳ trước điện, nước mắt nước mũi đầm đìa xin chịu tội. Lãng tử hồi đầu — một mẩu chuyện giang hồ truyền tụng nhiều năm.`,
            [ { uy: 250 }, { khiVan: 8 }, { recapture: {} }, { bietHieu: { name: 'Hồi Đầu', who: c.rebel.fromUid } } ],
            `Cố nhân một vò rượu cũ gọi ${c.rebel.name} hồi đầu — lãng tử quy môn, đại giai thoại của chuỗi.`
          )
        : B(
            `Ngươi cử người đồng môn thân nhất xuống núi khuyên nhủ. Nhưng tâm ma ${c.rebel.name} đã ăn tới xương — nghe vài câu cố nhân, y bỗng nổi điên, một kiếm xuyên qua kẻ từng gọi mình là huynh đệ. Người ấy gục xuống, môi còn mấp máy gọi tên y. Bi kịch kép. Mối thù từ nay khắc vào tận tủy đôi bên.`,
            [ { uy: -120 }, { khiVan: -8 }, { queue: { eid: 'D3', delayH: 48, rebelFrom: c.rebel.fromUid } } ],
            `Cố nhân đi khuyên ${c.rebel.name} mà bỏ mạng dưới kiếm nó — bi kịch kép, thù khắc cốt.`,
            'Nợ máu này, chỉ máu mới rửa…'
          ),
    },
  ],
};
const D3 = {
  id: 'D3', grp: 'D', kind: 'choice', han: '復', title: 'Cố Nhân Lai Phục', weight: 10, cdH: 0, chain: true,
  cond: (t) => t.events.rebels.length > 0,
  story: (c) =>
    `Vài chu kỳ trôi qua. Một đêm mưa xối xả, chuông sơn môn tự ngân ba tiếng. ${c.rebel.name} đứng giữa Diễn Võ Trường, áo đen ướt sũng, sát khí ngợp trời, sau lưng lố nhố bóng lâu la tà phái. Năm xưa là một đệ tử cúi đầu quét lá, nay đã thành danh ác đạo. Y ngẩng mặt nhìn ngươi qua màn mưa, giọng khàn đặc: "Đệ tử về đòi món nợ cũ." Đây là trận định mệnh — Chưởng Môn sẽ tiếp nó thế nào?`,
  choices: [
    {
      label: 'Toàn tông nghênh chiến, quyết sống mái',
      flavor: 'Gióng trống tụ binh, dốc toàn lực môn hạ vây đánh kẻ phản giữa sơn môn.',
      resolve: (c) => c.lucky(0.5)
        ? G(
            `Trống trận rền vang, đệ tử toàn tông kết trận vây kín Diễn Võ Trường. Mưa lẫn máu, lâu la tà phái tan tác. ${c.rebel.name} tả xung hữu đột tới hơi tàn lực kiệt, cuối cùng gục xuống dưới mười mấy thanh kiếm đồng môn. Có hai đứa trẻ trọng thương phải khiêng vào Y Quán — nhưng môn hộ đã thanh, một mối họa lớn trừ xong. Sử Sách khắc đậm bốn chữ "Thanh Lý Môn Hộ".`,
            [ { uy: 500 }, { khiVan: 6 }, { dismissRebel: {} } ],
            `Toàn tông nghênh chiến trảm ${c.rebel.name} giữa mưa — mốc trọng đại "Thanh Lý Môn Hộ", dẫu có thương vong.`
          )
        : B(
            `Đệ tử toàn tông vây đánh, nhưng sát đạo ${c.rebel.name} đã luyện tới mức kinh người. Trận thế vỡ từng mảng, mấy cao đồ ngã gục. Y giật phăng trấn phái chi bảo nơi điện thờ, ngửa mặt cười dài rồi lẫn vào mưa cùng đám lâu la. Tông môn một phen tổn thất nặng nề, từ nay gánh thêm một mối quốc hận gia thù.`,
            [ { uy: -300 }, { khiVan: -10 }, { bac: -500 }, { dismissRebel: {} } ],
            `Toàn tông nghênh chiến bại trận — ${c.rebel.name} đoạt trấn phái chi bảo, trọng thương cao đồ, để lại quốc hận gia thù.`
          ),
    },
    {
      label: 'Cử kẻ có duyên nợ ra đơn đả độc đấu',
      flavor: 'Để người mang ân oán sâu nhất với kẻ phản một mình bước ra, đối mặt tay đôi.',
      resolve: (c) => c.lucky(0.5)
        ? G(
            `Một bóng người lặng lẽ bước ra giữa mưa — kẻ duyên nợ sâu nhất với ${c.rebel.name}. Không trống không trận, chỉ hai thanh kiếm và một trời ân oán. Họ đánh tới rạng đông, từng chiêu như kể lại cả một đời. Chiêu cuối cùng, kiếm xuyên qua tim cố nhân — kẻ ở lại quỳ xuống ôm xác, khóc mà cũng cười. Ân oán một đời, một kiếm dứt. Người thắng đêm ấy vượt tâm kiếp, thăng hoa cảnh giới.`,
            [ { uy: 450 }, { khiVan: 5 }, { dismissRebel: {} } ],
            `Một kiếm dứt ân oán một đời với ${c.rebel.name} — kẻ thắng vượt tâm kiếp thăng hoa, giai thoại bi tráng.`
          )
        : M(
            `Kẻ duyên nợ bước ra solo, nhưng sát đạo ${c.rebel.name} quá mạnh. Một chiêu, người ấy đã nằm dưới kiếm y, máu loang mặt sân. ${c.rebel.name} kề mũi kiếm vào cổ cố nhân… rồi khựng lại. Mưa rửa trôi sát khí trên mặt y. Y thu kiếm, ngoảnh đi: "Mạng này ta tha. Nợ, để lần sau." Bóng đen tan vào màn mưa — chừa lại một sợi duyên chưa dứt.`,
            [ { uy: -80 }, { queue: { eid: 'D3', delayH: 48, rebelFrom: c.rebel.fromUid } } ],
            `Solo bại trận, ${c.rebel.name} động lòng tha mạng cố nhân rồi rút lui — duyên nợ còn dở dang.`,
            'Sợi duyên chưa dứt, nó sẽ còn về…'
          ),
    },
    {
      label: 'Dang tay chiêu hàng, lấy ân báo oán',
      flavor: 'Không rút kiếm, một mình bước tới trước mặt kẻ phản, mở lời tha thứ đón nó về.',
      resolve: (c) => (c.lucky(0.45) && (c.dao === 'chinh' || c.anyTrait(['Nhân Hậu', 'Trượng Nghĩa'])))
        ? G(
            `Ngươi gạt mọi thanh kiếm sau lưng, một mình bước ra giữa mưa, tay không. "Về đi. Cửa sơn môn chưa bao giờ khóa với con." ${c.rebel.name} run rẩy, thanh kiếm trong tay rơi xuống bùn. Y quỳ sụp, ma chướng bao năm theo nước mắt tan ra. Phế nhân thành thánh — nay y là cao thủ tà-chính-hợp-nhất, lòng trung tử sĩ, phần thưởng tối hậu của cả mối nghiệt duyên này.`,
            [ { uy: 600 }, { khiVan: 10 }, { recapture: {} }, { bietHieu: { name: 'Hồi Đầu Thị Ngạn', who: c.rebel.fromUid } } ],
            `Chưởng Môn tay không chiêu hàng ${c.rebel.name} giữa mưa — phế nhân thành thánh, đại giai thoại tối hậu của chuỗi.`
          )
        : B(
            `Ngươi buông kiếm bước ra mở lời tha thứ. ${c.rebel.name} nhìn ngươi một thoáng… rồi bật cười the thé: "Đến giờ còn diễn từ bi? Đáng đời ngươi mất tông!" Nhân lúc ngươi sơ hở, y vung kiếm hạ sát thủ. Lòng từ bi đặt nhầm chỗ, trận thế lập tức rơi vào thế bất lợi, đệ tử nhào lên đỡ cho ngươi mà ngã xuống mấy người.`,
            [ { uy: -200 }, { khiVan: -8 }, { dismissRebel: {} } ],
            `Chưởng Môn chiêu hàng bị ${c.rebel.name} trở mặt hạ độc thủ — đại từ bi hóa đại ngu xuẩn, tổn thất nặng.`
          ),
    },
    {
      label: 'Hợp lực môn-bot vây diệt',
      flavor: 'Gọi các môn phái từng kết minh đem viện binh, liên quân vây kín kẻ phản.',
      resolve: (c) => M(
        `Ngươi cho thả tín hiệu cầu viện. Chẳng mấy chốc, cờ xí các môn phái từng kết minh kéo tới rợp sườn núi. Liên quân vây kín, ${c.rebel.name} dù mạnh cũng khó địch muôn người — y bị dồn tới chân vách, gãy kiếm gục xuống. Thắng chắc tay, nhưng chiến lợi phải chia, nhân tình phải trả, và ngươi mất luôn cơ hội tự tay gỡ mối nghiệt duyên này. Sử Sách ghi một chữ "thắng" — lạnh tanh, chẳng có cái đẹp bi tráng của một trận solo.`,
        [ { uy: 300 }, { khiVan: 3 }, { bac: -300 }, { dismissRebel: {} } ],
        `Liên quân môn-bot vây diệt ${c.rebel.name} — thắng chắc mà nguội, dùng ân tình đổi lấy thái bình.`
      ),
    },
  ],
};

// ============================================================
// NHÓM E (tiếp) — giai thoại auto
// ============================================================
const E2 = {
  id: 'E2', grp: 'E', kind: 'auto', han: '霜', title: 'Đạp Sương Luyện Kiếm', weight: 6, cdH: 20,
  cond: (t) => t.disciples.length >= 1,
  auto: (c) => {
    const d = rnd(c.t.disciples);
    return G(
      `Đêm sương giăng kín Diễn Võ Trường, trăng treo như một lưỡi cong bạc. ${d.name} một mình múa kiếm dưới ánh hàn quang, mỗi chiêu khuấy sương thành lụa trắng cuộn quanh thân. Phu sương đọng trên mi mà người chẳng hay, chỉ thấy kiếm với trăng đã hợp làm một.`,
      [ { khiVan: 3 } ],
      `Đạp sương luyện kiếm — ${d.name} một đêm trăng múa hết một bộ kiếm, sương theo chiêu mà cuộn, sơn môn truyền nhau là cảnh đẹp.`
    );
  },
};

const E3 = {
  id: 'E3', grp: 'E', kind: 'auto', han: '俠', title: 'Hiệp Cốt Cứu Thôn', weight: 5, cdH: 24,
  cond: (t) => t.disciples.length >= 1,
  auto: (c) => {
    const d = rnd(c.t.disciples);
    return G(
      `Thôn nhỏ chân núi gặp lũ quét, ${d.name} đang xuống chợ mua giấy bút thì gặp. Người chẳng nói chẳng rằng, vận công đỡ một góc đê sắp vỡ suốt một canh giờ, lại cõng từng đứa trẻ qua dòng nước xiết. Dân thôn dập đầu tạ ơn, người chỉ phủi tay áo mà đi, để lại sau lưng tên hiệu một môn phái.`,
      [ { uy: 40 }, { khiVan: 2 } ],
      `Hiệp cốt cứu thôn — ${d.name} đỡ đê cứu dân lúc lũ quét, dân chân núi khắc ơn, danh tông lan trong dân gian.`
    );
  },
};

const E4 = {
  id: 'E4', grp: 'E', kind: 'auto', han: '靈', title: 'Cổ Vật Hiện Linh', weight: 5, cdH: 24,
  cond: (t) => t.disciples.length >= 1,
  auto: (c) => {
    const d = rnd(c.t.disciples);
    return G(
      `Nửa đêm Tàng Bảo Các bỗng sáng rực một góc. ${d.name} gác đêm chạy tới, thấy một món cổ vật phủ bụi từ đời khai tông đang tự ngân lên từng đợt hào quang ấm, như nhận ra người hữu duyên. Linh khí cả tông theo đó mà rộn lên một nhịp, ai nấy đều cảm thấy đạo tâm sáng tỏ hơn thường ngày.`,
      [ { khiVan: 4 } ],
      `Cổ vật hiện linh — bảo vật khai tông tự ngân hào quang trong đêm ${d.name} trực gác, linh khí tông môn dâng một nhịp.`
    );
  },
};

const E5 = {
  id: 'E5', grp: 'E', kind: 'auto', han: '聚', title: 'Môn Quy Tụ Hội', weight: 6, cdH: 24,
  cond: (t) => t.disciples.length >= 3,
  auto: (c) => {
    const d = rnd(c.t.disciples);
    return G(
      `Trăng tròn cuối tháng, cả môn tụ về đại sảnh. Rượu quê rót đầy, ${d.name} kể lại buổi mới chân ướt chân ráo nhập sơn môn, khiến cả bàn cười vang. Tiền bối luận đạo, hậu bối tỉ thí cho vui, lửa ấm hắt lên những gương mặt cùng một mái nhà. Một đêm như thế, lòng tông môn lại khít thêm một phần.`,
      [ { uy: 30 }, { khiVan: 3 } ],
      `Môn quy tụ hội — rằm tháng cả môn quây quần, ${d.name} kể chuyện cũ chọc cười cả sảnh, tình đồng môn thêm khăng khít.`
    );
  },
};

// ============================================================
// NHÓM F — KỲ NGỘ (rơi nguyên liệu hiếm): linh dược / dược đầu / cổ động / thiên tài địa bảo
// ============================================================
const F1 = {
  id: 'F1', grp: 'F', kind: 'auto', han: '採', title: 'Linh Dược Phùng Thời', weight: 6, cdH: 20,
  cond: (t) => t.disciples.length >= 1,
  auto: (c) => {
    const d = rnd(c.t.disciples);
    const pick = rnd(['mat_tulinhthao', 'mat_hantinh', 'mat_bachnien', 'mat_huyenthiet']);
    const n = 2 + Math.floor(Math.random() * 2);   // 2-3
    return G(
      `${d.name} men theo khe núi sau cơn mưa, bỗng ngửi thấy một mùi dược thơm mát lạ thường. Vạch đám rêu phong, một khóm linh dược ẩn dưới gốc cổ thụ hiện ra, lá còn đọng sương lấp lánh linh khí. Người mừng rỡ hái trọn, gói vào tay áo mang về Túi Đồ.`,
      [ { mat: { id: pick, n } }, { khiVan: 2 } ],
      `Kỳ ngộ — ${d.name} men khe núi gặp khóm linh dược ẩn dưới cổ thụ, hái về sung vào kho.`
    );
  },
};

const F2 = {
  id: 'F2', grp: 'F', kind: 'choice', han: '販', title: 'Dược Đầu Quá Môn', weight: 7, cdH: 36,
  cond: (t) => t.disciples.length >= 1,
  story: (c) =>
    `Một lão dược đầu lưng đeo sọt thuốc, râu tóc bạc phơ, gõ cổng sơn môn xin nghỉ chân. Trong sọt y lấp ló mấy vị linh dược quý hiếm, hương thơm thoảng ra cũng đủ biết là hàng tốt. "Lão phu vân du khắp chốn, gặp tông môn hữu duyên mới chịu mở sọt. Quý nhân xem có gì vừa ý chăng?"`,
  choices: [
    {
      label: 'Mua trọn sọt thuốc',
      flavor: 'Trả tiền dứt khoát, ôm cả sọt linh dược về tông.',
      resolve: (c) => G(
        `Ngươi sai người khiêng bạc ra, mua đứt cả sọt. Lão dược đầu cười khà khà, đổ hết linh dược vào Túi Đồ tông môn rồi vác sọt không thong dong xuống núi. Một phen giao dịch sòng phẳng, kho liệu tông môn dày thêm mấy phần.`,
        [ { bac: -900 }, { mat: { id: 'mat_bachnien', n: 4 } }, { mat: { id: 'mat_huyenthiet', n: 3 } } ],
        `Mua trọn sọt thuốc của lão dược đầu — tốn Bạc, đổi lấy một mẻ linh dược bậc trung.`
      ),
    },
    {
      label: 'Mặc cả tới cùng',
      flavor: 'Trả giá kì kèo từng đồng, ép lão hạ giá.',
      resolve: (c) => c.lucky(0.5)
        ? G(`Ngươi kì kèo nửa buổi, lão dược đầu chịu thua cái miệng dẻo, vừa lắc đầu vừa cười "thôi thôi bán rẻ cho xong". Rốt cuộc vừa được giá hời, lão lại tặng kèm một vị linh sâm cho đỡ tức.`,
            [ { bac: -500 }, { mat: { id: 'mat_bachnien', n: 4 } }, { mat: { id: 'mat_cuudiep', n: 1 } } ],
            `Mặc cả thắng lão dược đầu — giá hời, lại được tặng kèm Cửu Diệp Linh Sâm.`)
        : M(`Ngươi ép giá quá tay, lão dược đầu phật ý phất tay áo: "Tiếc rẻ vài đồng thì hữu duyên cũng thành vô duyên." Y vác sọt bỏ đi thẳng, chỉ để lại đúng một nắm cỏ linh rẻ tiền gọi là cho khỏi mất công.`,
            [ { mat: { id: 'mat_tulinhthao', n: 2 } }, { khiVan: -1 } ],
            `Mặc cả hỏng — lão dược đầu phật ý bỏ đi, tông môn chỉ vớt được nắm cỏ linh.`),
    },
    {
      label: 'Lấy đặc sản tông đổi hàng',
      flavor: 'Không mất bạc, đem công sức tông môn đổi ngang lấy thuốc.',
      resolve: (c) => G(
        `Ngươi sai đệ tử khiêng ra đặc sản sơn môn — trà linh, mật đá, da thú quý — đổi ngang lấy thuốc. Lão dược đầu vốn dân vân du, thấy toàn của lạ thì khoái chí, vui vẻ đổi hết sọt thuốc lấy mớ đặc sản đem đi khoe thiên hạ.`,
        [ { congHien: -60 }, { mat: { id: 'mat_huyenthiet', n: 3 } }, { mat: { id: 'mat_bachnien', n: 2 } } ],
        `Đổi đặc sản tông lấy thuốc của lão dược đầu — không tốn Bạc, hao chút Cống Hiến.`
      ),
    },
    {
      label: 'Tiễn khách, không mua',
      flavor: 'Mời lão chén trà rồi tiễn xuống núi, không giao dịch.',
      resolve: (c) => M(
        `Ngươi mời lão chén trà nóng, hàn huyên dăm câu rồi lễ phép tiễn xuống núi. Lão dược đầu cảm cái khí độ không tham, trước khi đi dúi lại một vị linh dược "kết duyên", dặn rằng đời người gặp nhau là quý. Tông môn chẳng mất gì, lại được tiếng khí khái.`,
        [ { mat: { id: 'mat_bachnien', n: 1 } }, { khiVan: 2 }, { uy: 30 } ],
        `Tiễn lão dược đầu không mua — được tặng một vị linh dược kết duyên + chút tiếng khí khái.`
      ),
    },
  ],
};

const F3 = {
  id: 'F3', grp: 'F', kind: 'choice', han: '洞', title: 'Cổ Động Khai Phong', weight: 5, cdH: 48,
  cond: (t) => t.disciples.filter((d) => !d.awaiting).length >= 1,
  pick: (t) => { const h = highApt(t.disciples.filter((d) => !d.awaiting)); return h ? [h.uid] : []; },
  story: (c) =>
    `Tiều phu chân núi hớt hải báo: sau trận sạt lở, một cổ động bị niêm phong từ thời thượng cổ lộ ra cửa. Đệ tử dò xét về, nói bên trong linh khí nồng đậm khác thường, ẩn ước có dược điền cổ — song cũng nghe cả tiếng gió rít quái dị, e có cấm chế hung hiểm. Cơ duyên hay tử địa, khó mà nói trước.`,
  choices: [
    {
      label: 'Phái cao đồ vào thám hiểm',
      flavor: 'Cử đệ tử mạnh nhất một mình đột nhập tận sâu cổ động.',
      resolve: (c) => c.lucky(0.55)
        ? G(`${c.main.name} vận khí hộ thân, lách qua mấy lớp cấm chế cổ xưa, lần tới một dược điền giấu trong lòng núi — linh sâm ngàn năm mọc thành khóm, tinh hồn thạch lấp lánh dưới khe. Người hái sạch mang ra, áo bào ám đầy linh khí, cả tông một phen reo mừng.`,
            [ { mat: { id: 'mat_cuudiep', n: 3 } }, { mat: { id: 'mat_tinhhon', n: 3 } }, { uy: 60 } ],
            `★ ${c.main.name} đột nhập cổ động, vét trọn dược điền cổ — một mẻ linh dược thượng phẩm về kho.`)
        : B(`${c.main.name} vừa vào sâu thì cấm chế kích hoạt, đá lăn lửa táp tứ phía. Người liều mạng cướp được một nắm linh dược rồi tháo chạy thoát thân, thân mang vài vết thương, hồn phách chấn động mất mấy ngày mới hoàn. Cổ động sau đó sụp kín, cơ duyên khép lại.`,
            [ { mat: { id: 'mat_cuudiep', n: 1 } }, { khiVan: -5 } ],
            `${c.main.name} kẹt cấm chế cổ động, chỉ vớt được chút linh dược mà suýt bỏ mạng — Khí Vận tổn.`),
    },
    {
      label: 'Cả tông cẩn trọng cùng vào',
      flavor: 'Dàn trận, từng bước phá cấm chế, ăn chắc mặc bền.',
      resolve: (c) => G(
        `Ngươi không phiêu lưu, điều cả tông dàn trận, người phá cấm kẻ cảnh giới, từng bước tiến sâu. Tuy không vét được tận đáy dược điền vì cấm chế quá hiểm, song cũng thu hoạch một mẻ linh dược kha khá mà chẳng ai sứt mẻ. Vững vàng, an toàn.`,
        [ { congHien: -40 }, { mat: { id: 'mat_huyenthiet', n: 3 } }, { mat: { id: 'mat_cuudiep', n: 2 } } ],
        `Cả tông cẩn trọng dò cổ động — thu một mẻ linh dược an toàn, hao chút Cống Hiến.`
      ),
    },
    {
      label: 'Niêm phong lại, không động',
      flavor: 'Thấy hung hiểm khó lường, cho lấp cửa động, không tham.',
      resolve: (c) => M(
        `Ngươi nhìn cái cửa động đen ngòm, nghe tiếng gió rít như tiếng người khóc, bèn lắc đầu cho đệ tử lấp lại. "Của trời cho mà mạng không hưởng nổi thì là họa, chẳng phải phúc." Tông môn bỏ lỡ một cơ duyên, đổi lại một đêm ngon giấc — và một bài học về sự biết đủ.`,
        [ { khiVan: 3 } ],
        `Niêm phong cổ động, không tham cơ duyên hung hiểm — Khí Vận an, lòng người vững.`
      ),
    },
  ],
};

const F4 = {
  id: 'F4', grp: 'F', kind: 'auto', han: '寶', title: 'Thiên Tài Giáng Thế', weight: 3, cdH: 72,
  cond: (t) => t.disciples.length >= 1,
  auto: (c) => {
    const d = rnd(c.t.disciples);
    return G(
      `Một đêm sao băng xối xả như mưa, một vệt sáng kéo dài rạch ngang trời rồi đáp xuống hậu sơn. ${d.name} cùng mấy đệ tử lần theo, thấy nơi sao rơi mọc lên một đóa linh chi phát quang ngũ sắc, quanh nó tinh hồn thạch kết tinh từng tảng. Thiên tài địa bảo trăm năm khó gặp — cả tông thắp hương tạ trời, rồi cung kính thu về.`,
      [ { mat: { id: 'mat_cuudiep', n: 3 } }, { mat: { id: 'mat_tinhhon', n: 4 } }, { uy: 80 }, { khiVan: 3 } ],
      `★ Thiên tài giáng thế — sao băng đáp hậu sơn nảy linh chi ngũ sắc, ${d.name} dẫn người thu trọn một mẻ địa bảo thượng phẩm.`
    );
  },
};

// ============================================================
// TỔNG HỢP — 20 sự kiện (A1-3, B1-3, C1-2, D1-3 chuỗi, E1-5 auto, F1-4 kỳ ngộ)
// ============================================================
export const TM_EVENTS = [
  A1, A2, A3,
  B1, B2, B3,
  C1, C2,
  D1, D2, D3,
  E1, E2, E3, E4, E5,
  F1, F2, F3, F4,
];

export const TM_EVENT_BY_ID = TM_EVENTS.reduce((m, e) => { m[e.id] = e; return m; }, {});

// re-export helper cho file soạn (nếu tách): tác giả có thể import { G, B, M } nếu cần.
export const _OUTCOME = { G, B, M };