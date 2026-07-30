// ============================================================
// ĐẾM NGƯỢC TRƯỚC KHI CHIA BÀI — dùng CHUNG cho ba chiếu bài (Tiến Lên · Binh Xập Xám ·
// Tiến Lên Trung Quốc). User chốt 2026-07-30: ngồi xuống chiếu thì KHÔNG chia bài ngay,
// chờ khoảng 5 giây có số đếm ngược giữa bàn rồi mới chia.
//
// Chỉ đếm ở ván ĐẦU của chiếu (lúc vừa ngồi xuống). Bấm "Ván Mới" thì chia luôn — đang ngồi
// sẵn ở bàn rồi, bắt chờ thêm 5 giây mỗi ván là phiền.
// ============================================================

export const GIAY_CHIA = 5;

function themStyle() {
  if (document.getElementById('dc-style')) return;
  const st = document.createElement('style');
  st.id = 'dc-style';
  // Biến màu (--gold2 / --serif) khai trên chính thẻ gốc của bàn, thẻ này là con nên thừa hưởng.
  st.textContent = [
    '.dc-wrap{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;',
    '  justify-content:center;gap:8px;z-index:10;pointer-events:none}',
    '.dc-wrap.show{display:flex}',
    '.dc-nhan{font-family:var(--serif,Georgia,serif);font-size:13px;letter-spacing:.14em;',
    '  text-transform:uppercase;color:var(--txt2,#b6a68f);text-shadow:0 2px 10px #000}',
    '.dc-so{font-family:var(--serif,Georgia,serif);font-weight:700;font-size:86px;line-height:1;',
    '  color:var(--gold2,#f4d99a);text-shadow:0 0 30px rgba(230,192,121,.55),0 4px 16px #000;',
    '  animation:dcNhay .92s cubic-bezier(.2,.7,.3,1)}',
    // Vòng sáng mảnh quanh số cho ra dáng "đang đếm", vẫn TĨNH sau khi nảy xong.
    '.dc-so::after{content:"";position:absolute;left:50%;top:50%;width:132px;height:132px;',
    '  transform:translate(-50%,-50%);border-radius:50%;border:1px solid rgba(230,192,121,.22);',
    '  box-shadow:0 0 40px -12px rgba(230,192,121,.5) inset}',
    '.dc-so{position:relative}',
    '@keyframes dcNhay{0%{transform:scale(1.55);opacity:0}24%{transform:scale(1);opacity:1}100%{transform:scale(1);opacity:.94}}',
    '@media (prefers-reduced-motion:reduce){.dc-so{animation:none}}',
    '@media (max-width:600px){.dc-so{font-size:62px}.dc-so::after{width:100px;height:100px}.dc-nhan{font-size:11.5px}}',
  ].join('\n');
  document.head.appendChild(st);
}

/**
 * Đếm ngược giữa bàn rồi gọi `xong()`.
 * @param {Element} root   thẻ gốc của bàn (đã có sẵn biến màu)
 * @param {Function} xong  gọi khi đếm hết — chỗ đặt lệnh chia bài
 * @param {number} [giay]  số giây, mặc định GIAY_CHIA
 * @returns {Function} huỷ — gọi khi rời bàn / ván mới để dừng đồng hồ và giấu số
 */
export function demChia(root, xong, giay) {
  themStyle();
  let n = (giay == null ? GIAY_CHIA : giay), t = null, het = false;
  let el = root.querySelector('.dc-wrap');
  if (!el) {
    el = document.createElement('div');
    el.className = 'dc-wrap';
    el.innerHTML = '<div class="dc-nhan">Chia bài sau</div><div class="dc-so"></div>';
    root.appendChild(el);
  }
  const so = el.querySelector('.dc-so');
  el.classList.add('show');

  function thoi() {
    if (t) clearTimeout(t);
    t = null; het = true;
    el.classList.remove('show');
  }
  function nhip() {
    if (het) return;
    if (n <= 0) { thoi(); try { xong(); } catch (e) { if (window.console) console.error(e); } return; }
    so.textContent = n;
    // ⚠ Phải gỡ rồi ép tính lại bố cục thì animation mới chạy LẠI cho con số mới; đặt cùng
    //   một tên animation mà không gỡ thì trình duyệt coi như không có gì đổi, số nhảy khô khốc.
    so.style.animation = 'none';
    void so.offsetWidth;
    so.style.animation = '';
    n--;
    t = setTimeout(nhip, 1000);
  }
  nhip();
  return thoi;
}
