// admin/auth.js
// ============================================================================
// SUPER ADMIN AUTENTIFIKATSIYASI -- bu B2C/B2B foydalanuvchi tizimidan
// BUTUNLAY ALOHIDA. Faqat platforma egasi (siz) kira oladi, bitta maxfiy
// parol orqali (.env faylida ADMIN_PASSWORD).
//
// XAVFSIZLIK ESLATMASI:
//   - Standart parol .env.example'da bo'sh -- agar o'rnatilmagan bo'lsa,
//     admin panel butunlay ISHLAMAYDI (404 qaytaradi), shunchaki ochiq
//     qolib ketmasligi uchun.
//   - Parol JWT'ga o'xshash, lekin alohida maxfiy kalit bilan imzolanadi
//     (ADMIN_JWT_SECRET) -- foydalanuvchi tokeni bilan ALMASHTIRIB
//     bo'lmaydi, ikkisi mutlaqo bog'liq emas.
//   - Token muddati qisqa (8 soat) -- uzoq muddatli sessiya xavfini kamaytirish.
// ============================================================================
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
// XAVFSIZLIK: avval statik ("CHANGE-THIS-IN-PRODUCTION-ADMIN-SECRET") fallback
// bor edi -- ochiq kodda yotgani uchun xavfli edi. Endi sozlanmagan bo'lsa,
// har ishga tushganda tasodifiy kalit generatsiya qilinadi (shu sababli admin
// sessiyalari server qayta ishga tushganda yaroqsiz bo'ladi -- shuning uchun
// production'da ADMIN_JWT_SECRET'ni albatta .env/Vercel orqali sozlang).
let _adminSecretWarned = false;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || (() => {
  if (!_adminSecretWarned) {
    console.warn('[admin/auth] OGOHLANTIRISH: ADMIN_JWT_SECRET .env\'da sozlanmagan -- vaqtinchalik tasodifiy kalit generatsiya qilindi. Production uchun buni albatta sozlang.');
    _adminSecretWarned = true;
  }
  return crypto.randomBytes(48).toString('hex');
})();
const ADMIN_TOKEN_EXPIRY = '8h';

function isAdminConfigured() {
  return !!ADMIN_PASSWORD;
}

// XAVFSIZLIK: oddiy `===` solishtirish o'rniga doimiy-vaqtli (constant-time)
// solishtirish ishlatamiz -- bu "timing attack" (javob vaqti farqidan parolni
// belgi-belgilab topish) imkoniyatini yo'qotadi. Uzunlik farqini avval
// tekshiramiz (timingSafeEqual buferlar bir xil uzunlikda bo'lishini talab
// qiladi), bu o'zi maxfiy ma'lumot oqizmaydi (parol uzunligi sir emas).
function checkPassword(password) {
  if (!isAdminConfigured()) return false;
  if (typeof password !== 'string') return false;
  const a = Buffer.from(password);
  const b = Buffer.from(ADMIN_PASSWORD);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function signAdminToken() {
  return jwt.sign({ role: 'super_admin' }, ADMIN_JWT_SECRET, { expiresIn: ADMIN_TOKEN_EXPIRY });
}

// Middleware: Authorization: Bearer <admin_token> orqali tekshiradi.
// Agar ADMIN_PASSWORD .env'da sozlanmagan bo'lsa, butun admin panel 404
// qaytaradi -- bu ataylab shunday, chunki sozlanmagan parol bilan panelni
// ochiq qoldirish xavfli.
function requireAdminAuth(req, res, next) {
  if (!isAdminConfigured()) {
    return res.status(404).json({ error: 'Topilmadi' }); // panel "yo'q" ko'rinadi
  }
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Admin tizimga kirish talab qilinadi' });
  try {
    const payload = jwt.verify(token, ADMIN_JWT_SECRET);
    if (payload.role !== 'super_admin') throw new Error('Noto\'g\'ri rol');
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Admin token yaroqsiz yoki muddati tugagan' });
  }
}

module.exports = { isAdminConfigured, checkPassword, signAdminToken, requireAdminAuth };
