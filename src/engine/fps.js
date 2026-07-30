// ============================================================
// ĐỒNG HỒ KHUNG HÌNH — bật bằng `?fps=1` trên thanh địa chỉ (máy nào cũng bật được, kể cả
// điện thoại). Hiện góc trên-phải: số khung/giây · khung chậm nhất trong một giây vừa rồi ·
// số khung TRỄ (quá 1,5 lần nhịp màn hình) — chính mấy khung trễ này mới là cái mắt thấy "giật",
// chứ số trung bình đẹp mà thỉnh thoảng rớt một khung 80ms thì vẫn cảm thấy khựng.
//
// Tự đo nhịp màn hình (60 / 90 / 120 Hz) trong giây đầu rồi lấy đó làm mốc, khỏi đoán.
// ⚠ Bản thân đồng hồ phải RẺ: chỉ ghi DOM 2 lần/giây, không tạo mảng mới mỗi khung.
// ============================================================

let dangChay = false;

export function batDongHoFPS() {
  if (dangChay) return;
  dangChay = true;

  const box = document.createElement('div');
  box.id = 'fps-box';
  box.style.cssText = [
    'position:fixed', 'right:6px', 'top:6px', 'z-index:2147483600', 'pointer-events:none',
    'font:600 11px/1.35 Consolas,monospace', 'color:#9fe4f0',
    'background:rgba(6,10,16,.82)', 'border:1px solid rgba(159,228,240,.28)',
    'border-radius:8px', 'padding:4px 8px', 'white-space:pre', 'text-align:right',
  ].join(';');
  document.body.appendChild(box);

  let khung = 0, tre = 0, teNhat = 0, moc = 0, truoc = 0;
  let nhip = 0;                 // ms giữa hai khung của MÀN HÌNH (đo được)
  let doNhip = [], soDo = 0;

  function vong(t) {
    requestAnimationFrame(vong);
    if (!truoc) { truoc = t; moc = t; return; }
    const dt = t - truoc;
    truoc = t;
    khung++;
    if (dt > teNhat) teNhat = dt;

    // Đo nhịp màn hình bằng TRUNG VỊ của 40 khung đầu — trung bình thì một khung rớt là lệch hết.
    if (soDo < 40) { doNhip.push(dt); soDo++; if (soDo === 40) { doNhip.sort((a, b) => a - b); nhip = doNhip[20]; doNhip = []; } }
    else if (dt > nhip * 1.5) tre++;

    if (t - moc < 500) return;
    const giay = (t - moc) / 1000;
    const fps = khung / giay;
    const hz = nhip ? Math.round(1000 / nhip) : 0;
    box.textContent = Math.round(fps) + ' khung/giây' + (hz ? '  (màn ' + hz + 'Hz)' : '') +
      '\ntệ nhất ' + teNhat.toFixed(1) + 'ms' +
      '\ntrễ ' + tre + ' khung/' + giay.toFixed(1) + 's';
    box.style.color = (hz && fps < hz * 0.8) || teNhat > 50 ? '#ff8f7a' : (tre ? '#f4d99a' : '#7fd6b5');
    khung = 0; tre = 0; teNhat = 0; moc = t;
  }
  requestAnimationFrame(vong);
}

/** Bật khi địa chỉ có `?fps=1`. Gọi một lần lúc dựng trang. */
export function tuBatFPS() {
  try {
    if (new URLSearchParams(location.search).get('fps')) batDongHoFPS();
  } catch (e) { }
}
