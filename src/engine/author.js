// ============================================================
// ẤN KÝ TÁC GIẢ — chứng chỉ tác giả KÝ SỐ (ECDSA P-256 / WebCrypto).
//
//   Mục đích: nhận diện người thiết kế game, KHÔNG thể giả mạo bằng bất kỳ cách nào
//   (sửa localStorage/console/save đều vô ích) — chỉ người GIỮ KHOÁ RIÊNG mới cấp/đổi được.
//
//   Cơ chế: khoá CÔNG KHAI nhúng ở đây để game KIỂM CHỨNG; khoá RIÊNG do tác giả giữ
//   (không bao giờ nằm trong mã) là thứ duy nhất KÝ ra được chứng chỉ. Ai có toàn bộ mã
//   nguồn cũng chỉ verify được, không ký giả được (bất đối xứng). Tên hiển thị LẤY TỪ
//   chứng chỉ đã ký -> không có chuỗi "trần" để sửa; đổi tên = phải ký lại = phải có khoá riêng.
//
//   Giới hạn thành thật: đây là web client mã nguồn MỞ -> ai fork repo thì sửa bản-CỦA-HỌ
//   được (bản chất không tránh khỏi). Nhưng trong bản chính thức + với mọi tài khoản người
//   chơi, không ai làm game này công nhận một tác giả GIẢ (chữ ký sẽ sai).
//
//   >>> ĐỔI TÁC GIẢ: tạo cặp khoá mới bằng công cụ _tools/an_ky_tac_gia.html, dán
//       AUTHOR_PUBKEY (khoá công khai) + AUTHOR_CERT (chứng chỉ đã ký) vào đây.
// ============================================================

// Khoá CÔNG KHAI của tác giả (an toàn để công khai — chỉ dùng để VERIFY).
export const AUTHOR_PUBKEY = {
  kty: 'EC', crv: 'P-256',
  x: 'hEotDuyv0UgqJC4hKe8trPhW7QQrNDxiyNXOk2Pm6fA',
  y: 'HoG6PcbEAHaDcb4DNfEqlqsQs32jehKxZ9WmgGCgu1A',
};

// Chứng chỉ tác giả (đã ký bằng khoá riêng). name = tên hiển thị; uid = id tài khoản
// tác giả (để hiện huy hiệu "✓ Tác Giả" đúng tài khoản); iat = thời điểm cấp.
// >>> ĐỔI TÊN: dùng "cấp lại" trong _tools/an_ky_tac_gia.html (giữ nguyên khoá riêng)
//     -> chỉ thay AUTHOR_CERT dưới đây, KHÔNG cần đụng AUTHOR_PUBKEY.
export const AUTHOR_CERT = {
  v: 1,
  name: 'ArchisuS',
  uid: '942e0821-009d-4c43-b191-a4701656d2c1',
  iat: 1784190541,
  sig: '60rGLoxYEiD/HgjT9DZl+BHZjTMtGGpfpj/PnjOP3QBrefH8HQ2m4dBxN4huLrEIyNCF8AaULEirVXf9DrmfXw==',
};

// Thông điệp được ký — PHẢI khớp 100% với công cụ ký (khỏi bẫy canonical-JSON).
function authorMessage(c) {
  return 'tieudaoluc|author|' + c.v + '|' + c.name + '|' + c.uid + '|' + c.iat;
}

let _cache; // { name, uid, iat } | null  (verify 1 lần, cache kết quả)

// Xác minh chứng chỉ với khoá công khai nhúng. Trả { name, uid, iat } nếu HỢP LỆ, else null.
// KHÔNG bao giờ throw (mất crypto/thiếu API -> trả null, game vẫn chạy).
export async function verifyAuthorCert() {
  if (_cache !== undefined) return _cache;
  try {
    const subtle = (globalThis.crypto && globalThis.crypto.subtle) || null;
    const c = AUTHOR_CERT;
    if (!subtle || !c || !c.sig) { _cache = null; return null; }
    const key = await subtle.importKey('jwk',
      { kty: AUTHOR_PUBKEY.kty, crv: AUTHOR_PUBKEY.crv, x: AUTHOR_PUBKEY.x, y: AUTHOR_PUBKEY.y },
      { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const sig = Uint8Array.from(atob(c.sig), (ch) => ch.charCodeAt(0));
    const msg = new TextEncoder().encode(authorMessage(c));
    const ok = await subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, sig, msg);
    _cache = ok ? { name: c.name, uid: c.uid, iat: c.iat } : null;
  } catch (e) { _cache = null; }
  return _cache;
}
