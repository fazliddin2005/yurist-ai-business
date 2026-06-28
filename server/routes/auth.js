// routes/auth.js
// Autentifikatsiya: email yoki telefon raqami + parol orqali ro'yxatdan o'tish va kirish.
// Parollar bcrypt bilan xeshlanadi (hech qachon ochiq matnda saqlanmaydi).
// Sessiya JWT token orqali boshqariladi (brauzerda localStorage'da saqlanadi).
//
// MONGODB MIGRATSIYASI: bu fayl avval fayl-asosli (fs) "ma'lumotlar bazasi"
// ishlatardi -- bu Vercel kabi serverless muhitlarda ISHLAMAYDI (disk
// o'zgarishlari saqlanmaydi, har bir so'rov yangi konteynerda ishlaydi).
// Endi barcha o'qish/yozish operatsiyalari Mongoose orqali MongoDB'ga boradi.
//
// TASDIQLASH KODI HAQIDA: ro'yxatdan o'tganda 6 xonali kod yuboriladi (SMS/email).
// Hozircha notifier.js DEMO REJIMda ishlaydi -- real xizmat (Eskiz.uz va h.k.)
// ulanmagan bo'lsa, kod faqat server terminalida ko'rinadi. Shuning uchun
// tasdiqlash IXTIYORIY: foydalanuvchi kodsiz ham to'liq ishlatishi mumkin --
// aks holda demo rejimda hech kim ro'yxatdan o'ta olmas edi. Haqiqiy SMS/email
// xizmati ulangandan keyin, agar majburiy tasdiqlash kerak bo'lsa, faqat
// pastdagi REQUIRE_VERIFICATION o'zgaruvchisini true qilish kifoya.
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { User, Verification, PasswordReset } = require('../models');
const notifier = require('../notifier');
const { logActivity, ACTION_TYPES } = require('../activityLog');
const { getCurrentTermsForLang, getCurrentVersion } = require('../termsManager');

const router = express.Router();
const STARTER_CREDITS = 5;
// XAVFSIZLIK: avval bu yerda statik ("CHANGE-IN-PRODUCTION") fallback bor edi --
// agar kim JWT_SECRET'ni sozlashni unutsa, bu qiymat ochiq kodda yotgani uchun
// HAR KIM soxta token yasashi mumkin edi. Endi: agar JWT_SECRET sozlanmagan
// bo'lsa, har server ishga tushganda TASODIFIY (xavfsiz) kalit generatsiya
// qilinadi -- bu hujumni yo'qotadi, lekin server qayta ishga tushganda eski
// tokenlar (va eski sessiyalar) haqiqiy bo'lmay qoladi. Shuning uchun
// PRODUCTION'da JWT_SECRET'ni .env/Vercel orqali albatta sozlash kerak --
// aks holda har deploy/restart'da hamma chiqib ketishga majbur bo'ladi.
const crypto = require('crypto');
let _jwtSecretWarned = false;
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (!_jwtSecretWarned) {
    console.warn('[auth] OGOHLANTIRISH: JWT_SECRET .env\'da sozlanmagan -- vaqtinchalik tasodifiy kalit generatsiya qilindi. Bu server qayta ishga tushganda BARCHA foydalanuvchi sessiyalari yaroqsiz bo\'ladi. Production uchun JWT_SECRET\'ni albatta sozlang.');
    _jwtSecretWarned = true;
  }
  return crypto.randomBytes(48).toString('hex');
})();
const TOKEN_EXPIRY = '30d';

// ---- ZO'RLAB KIRISH (BRUTE-FORCE) HIMOYASI ----
// Bir IP manzildan 15 daqiqa ichida ko'pi bilan 10 marta login/register
// urinishi mumkin. Bundan oshsa, 429 ("Too Many Requests") xatosi
// qaytariladi. Bu hacker'ning avtomatik dastur orqali minglab parolni
// ketma-ket sinab ko'rishining oldini oladi.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 10,
  message: { error: "Juda ko'p urinish. Iltimos, 15 daqiqadan keyin qaytadan urinib ko'ring." },
  standardHeaders: true,
  legacyHeaders: false,
});

const REQUIRE_VERIFICATION = false;

function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isPhone(v) { return /^\+?[0-9\s\-()]{7,20}$/.test(v); }
function normalizeIdentifier(v) {
  const trimmed = (v || '').trim();
  return isEmail(trimmed) ? trimmed.toLowerCase() : trimmed.replace(/[\s\-()]/g, '');
}
function genCode() { return String(Math.floor(100000 + Math.random() * 900000)); }

async function findUserByIdentifier(identifier) {
  const norm = normalizeIdentifier(identifier);
  return User.findOne({ $or: [{ email: norm }, { phone: norm }] });
}

function signToken(user) {
  return jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

async function publicUser(user) {
  const json = user && typeof user.toJSON === 'function' ? user.toJSON() : user;
  if (!json) return json;
  // HUQUQIY DALIL: agar foydalanuvchi hali rozilik bermagan bo'lsa, yoki
  // shartlar yangi versiyaga o'zgargan bo'lsa (eski rozilik joriy versiyadan
  // farqli), frontend bosh sahifaga o'tishdan oldin rozilik panelini
  // ko'rsatishi kerakligini bildiramiz. Joriy versiya MongoDB'dan o'qiladi
  // (statik fayldan emas) -- shunda admin kelajakda yangi versiya qo'shsa,
  // bu yerga avtomatik ta'sir qiladi.
  try {
    const current = await getCurrentVersion();
    json.needsTermsConsent = json.termsAcceptedVersion !== current.version;
  } catch (e) {
    console.error('[auth/publicUser] Joriy shartlar versiyasini olishda xato:', e.message);
    // Xavfsiz fallback: xato bo'lsa, rozilik so'ramaymiz (foydalanuvchini
    // bloklab qo'ymaslik uchun) -- lekin xato konsolga yoziladi.
    json.needsTermsConsent = false;
  }
  return json;
}

async function sendAndStoreVerificationCode(user, identifier, isEmailType) {
  const code = genCode();
  await Verification.deleteMany({ userId: user.id });
  await Verification.create({
    userId: user.id, code,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });
  const result = await notifier.sendVerificationCode(identifier, code, isEmailType);
  if (result.demo) {
    console.log(`[auth] Tasdiqlash kodi (${identifier}): ${code}`);
  }
  return result;
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Tizimga kirish talab qilinadi' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.uid);
    if (!user) return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token yaroqsiz yoki muddati tugagan' });
  }
}

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { identifier, password, name } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/telefon va parol talab qilinadi' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Parol kamida 6 belgidan iborat bo'lishi kerak" });
    }
    const norm = normalizeIdentifier(identifier);
    const isEmailType = isEmail(norm);
    if (!isEmailType && !isPhone(norm)) {
      return res.status(400).json({ error: "Email yoki telefon raqami noto'g'ri formatda" });
    }
    if (await findUserByIdentifier(norm)) {
      return res.status(409).json({ error: "Bu email/telefon bilan foydalanuvchi allaqachon ro'yxatdan o'tgan" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name || (isEmailType ? norm.split('@')[0] : norm),
      email: isEmailType ? norm : null,
      phone: !isEmailType ? norm : null,
      passwordHash,
      isDemo: false,
      verified: !REQUIRE_VERIFICATION,
      credits: STARTER_CREDITS,
      jurisdiction: 'UZ',
      lang: 'uz',
    });

    logActivity({
      type: ACTION_TYPES.USER_REGISTERED,
      userId: user.id,
      userLabel: user.name,
      meta: { via: isEmailType ? 'email' : 'phone' },
    });

    const notifyResult = await sendAndStoreVerificationCode(user, norm, isEmailType);

    const token = signToken(user);
    res.status(201).json({
      user: await publicUser(user),
      token,
      verification: { sent: notifyResult.sent, demo: notifyResult.demo },
    });
  } catch (e) {
    console.error('[auth/register] xato:', e);
    res.status(500).json({ error: "Ro'yxatdan o'tishda kutilmagan xato yuz berdi" });
  }
});

router.post('/verify', authLimiter, requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Tasdiqlash kodini kiriting' });
    const v = await Verification.findOne({ userId: req.user.id, code });
    if (!v || new Date(v.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Kod yaroqsiz yoki muddati tugagan' });
    }
    req.user.verified = true;
    await req.user.save();
    await Verification.deleteMany({ userId: req.user.id });
    res.json({ success: true, user: await publicUser(req.user) });
  } catch (e) {
    console.error('[auth/verify] xato:', e);
    res.status(500).json({ error: 'Tasdiqlashda kutilmagan xato yuz berdi' });
  }
});

router.post('/resend-code', authLimiter, requireAuth, async (req, res) => {
  try {
    const identifier = req.user.email || req.user.phone;
    const isEmailType = !!req.user.email;
    const result = await sendAndStoreVerificationCode(req.user, identifier, isEmailType);
    res.json({ success: true, demo: result.demo });
  } catch (e) {
    console.error('[auth/resend-code] xato:', e);
    res.status(500).json({ error: 'Kodni qayta yuborishda xato yuz berdi' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/telefon va parol talab qilinadi' });
    }
    const user = await findUserByIdentifier(identifier);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Email/telefon yoki parol noto'g'ri" });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Email/telefon yoki parol noto'g'ri" });
    }
    if (REQUIRE_VERIFICATION && !user.verified) {
      return res.status(403).json({ error: "Akkountingiz tasdiqlanmagan. Yuborilgan kodni kiriting.", code: 'NOT_VERIFIED' });
    }
    const token = signToken(user);
    logActivity({
      type: ACTION_TYPES.USER_LOGIN,
      userId: user.id,
      userLabel: user.name,
    });
    res.json({ user: await publicUser(user), token });
  } catch (e) {
    console.error('[auth/login] xato:', e);
    res.status(500).json({ error: 'Kirishda kutilmagan xato yuz berdi' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    res.json({ user: await publicUser(req.user) });
  } catch (e) {
    console.error('[auth/me] xato:', e);
    res.status(500).json({ error: 'Kutilmagan xato yuz berdi' });
  }
});

// GET /api/auth/terms?lang=uz -- foydalanish shartlarining JORIY versiyasini
// olish. AUTH TALAB QILINMAYDI -- chunki bu matnni hatto ro'yxatdan
// o'tishdan oldin ham ko'rsatish mumkin bo'lishi kerak.
// MUHIM: bu endi MongoDB'dagi TermsVersion kolleksiyasidan o'qiydi (statik
// fayldan emas) -- shunda har bir versiya abadiy saqlanadi.
router.get('/terms', async (req, res) => {
  try {
    const lang = req.query.lang || 'uz';
    const { version, content } = await getCurrentTermsForLang(lang);
    res.json({ version, content });
  } catch (e) {
    console.error('[auth/terms] xato:', e);
    res.status(500).json({ error: 'Shartlar matnini yuklashda xato yuz berdi' });
  }
});

// POST /api/auth/accept-terms -- foydalanuvchi roziligini qayd etish.
// HUQUQIY DALIL UCHUN MUHIM: bu yerda IP manzil, vaqt va versiya saqlanadi --
// bu kelajakda yuzaga kelishi mumkin bo'lgan "men shartlarni ko'rmagandim"
// degan da'volarga qarshi dalil bo'ladi. Versiya raqami orqali, kelajakda
// "o'sha vaqtda 1.0 versiyada aniq nima yozilgan edi?" deb so'ralganda,
// termsManager.getVersionByNumber() orqali O'SHA ANIQ matnni qayta tiklash
// mumkin -- chunki versiyalar HECH QACHON tahrirlanmaydi.
router.post('/accept-terms', requireAuth, async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || null;
    const current = await getCurrentVersion();
    req.user.termsAcceptedVersion = current.version;
    req.user.termsAcceptedAt = new Date();
    req.user.termsAcceptedIp = clientIp;
    await req.user.save();
    res.json({ success: true, user: await publicUser(req.user) });
  } catch (e) {
    console.error('[auth/accept-terms] xato:', e);
    res.status(500).json({ error: 'Roziliklarni saqlashda xato yuz berdi' });
  }
});

router.post('/logout', requireAuth, (req, res) => {
  logActivity({
    type: ACTION_TYPES.USER_LOGOUT,
    userId: req.user.id,
    userLabel: req.user.name,
  });
  res.json({ success: true });
});

router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ error: 'Email/telefon talab qilinadi' });
    const user = await findUserByIdentifier(identifier);
    if (user) {
      const code = genCode();
      await PasswordReset.deleteMany({ userId: user.id });
      await PasswordReset.create({
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });
      const norm = normalizeIdentifier(identifier);
      const result = await notifier.sendVerificationCode(norm, code, isEmail(norm));
      if (result.demo) console.log(`[auth] Parolni tiklash kodi (${user.email || user.phone}): ${code}`);
    }
    res.json({ success: true, message: "Agar bu email/telefon ro'yxatdan o'tgan bo'lsa, tasdiqlash kodi yuborildi (demo rejimda -- server terminalida ko'rinadi)." });
  } catch (e) {
    console.error('[auth/forgot-password] xato:', e);
    res.status(500).json({ error: 'Kutilmagan xato yuz berdi' });
  }
});

router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { identifier, code, newPassword } = req.body;
    if (!identifier || !code || !newPassword) {
      return res.status(400).json({ error: 'Barcha maydonlar talab qilinadi' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Parol kamida 6 belgidan iborat bo'lishi kerak" });
    }
    const user = await findUserByIdentifier(identifier);
    if (!user) return res.status(400).json({ error: 'Kod yaroqsiz yoki muddati tugagan' });

    const reset = await PasswordReset.findOne({ userId: user.id, code });
    if (!reset || new Date(reset.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Kod yaroqsiz yoki muddati tugagan' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    await PasswordReset.deleteMany({ userId: user.id });

    res.json({ success: true, message: "Parol muvaffaqiyatli o'zgartirildi" });
  } catch (e) {
    console.error('[auth/reset-password] xato:', e);
    res.status(500).json({ error: 'Kutilmagan xato yuz berdi' });
  }
});

module.exports = router;
module.exports.requireAuth = requireAuth;
module.exports.publicUser = publicUser;
