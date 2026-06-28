// accountDeletion.js
// ============================================================================
// HISOBNI O'CHIRISH MEXANIZMI -- dataRetentionPolicy.js da belgilangan
// qoidalarga muvofiq amalga oshiriladi.
//
// IKKI BOSQICHLI JARAYON:
//   1. requestDeletion() -- foydalanuvchi so'raydi, 30 kunlik muddat
//      boshlanadi, lekin hisob HALI ISHLAYDI (foydalanuvchi fikrini
//      o'zgartirishi mumkin).
//   2. performPurge() -- 30 kun o'tgandan keyin, HAQIQIY, QAYTARILMAS
//      o'chirish amalga oshiriladi. Bu funksiya kunlik avtomatik
//      ishga tushadigan vazifa (cron) orqali chaqiriladi.
//
// MUHIM: bu modul HECH QACHON quyidagilarni o'chirmaydi:
//   - Foydalanish shartlariga rozilik dalili (termsAcceptedVersion/At/Ip) --
//     bu doim saqlanadi, faqat boshqa shaxsiy ma'lumot (ism, email,
//     telefon) tozalanadi.
//   - Boshqa odamlar (B2B jamoadoshlari) yaratgan workspace ma'lumoti.
// ============================================================================
const { User, Case, Document, Chat, Audit, Member, Organization, ActivityLog } = require('./models');
const DeletionRequest = require('./models/DeletionRequest');
const { GRACE_PERIOD_DAYS } = require('./dataRetentionPolicy');

/**
 * Foydalanuvchi hisobni o'chirishni so'raydi -- darhol o'chirilmaydi,
 * 30 kunlik muddat boshlanadi.
 */
async function requestDeletion(userId, requestedIp) {
  // Agar allaqachon faol so'rov bo'lsa, qaytadan yaratmaymiz -- eskisini qaytaramiz.
  const existing = await DeletionRequest.findOne({ userId, status: 'pending' });
  if (existing) return existing;

  const scheduledPurgeAt = new Date(Date.now() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
  return DeletionRequest.create({ userId, scheduledPurgeAt, requestedIp: requestedIp || null });
}

/**
 * Foydalanuvchi fikrini o'zgartirsa -- so'rovni bekor qiladi, hisob
 * butunlay normal ishlashda davom etadi.
 */
async function cancelDeletion(userId) {
  return DeletionRequest.findOneAndUpdate(
    { userId, status: 'pending' },
    { status: 'cancelled', cancelledAt: new Date() },
    { new: true }
  );
}

/**
 * Joriy foydalanuvchi uchun faol (pending) o'chirish so'rovi bor-yo'qligini
 * tekshiradi -- frontend "hisobingiz N kundan keyin o'chiriladi" deb
 * ko'rsatishi uchun.
 */
async function getPendingDeletion(userId) {
  return DeletionRequest.findOne({ userId, status: 'pending' });
}

/**
 * HAQIQIY, QAYTARILMAS o'chirish -- faqat muddati o'tgan so'rovlar uchun.
 * dataRetentionPolicy.js dagi qoidalarga muvofiq:
 *   - Shaxsiy ma'lumot (ism, email, telefon, parol) -- TO'LIQ o'chiriladi
 *   - Shaxsiy kontent (chat, ish, hujjat) -- o'chiriladi
 *   - Faollik jurnali -- ANONIMLASHTIRILADI (userId olib tashlanadi, yozuv qoladi)
 *   - Rozilik dalili -- SAQLANADI (termsAccepted* maydonlari tegilmaydi)
 *   - B2B workspace (agar owner bo'lmasa) -- foydalanuvchi shunchaki
 *     a'zolikdan chiqariladi, workspace o'zi qolaveradi
 */
async function performPurge(deletionRequest) {
  const userId = deletionRequest.userId;
  const user = await User.findById(userId);
  if (!user) {
    // Foydalanuvchi allaqachon yo'q (masalan qo'lda o'chirilgan) -- so'rovni yopamiz.
    deletionRequest.status = 'completed';
    deletionRequest.completedAt = new Date();
    await deletionRequest.save();
    return { alreadyGone: true };
  }

  // 1) Shaxsiy kontent -- to'liq o'chiriladi
  await Chat.deleteMany({ userId, scope: 'b2c' });
  await Case.deleteMany({ userId, scope: 'b2c' });
  await Document.deleteMany({ userId, scope: 'b2c' });

  // 2) Faollik jurnali -- ANONIMLASHTIRILADI (yozuv qoladi, lekin userId va
  // userLabel olib tashlanadi -- statistika uchun foydali, shaxsga
  // bog'lanmaydi).
  await ActivityLog.updateMany(
    { userId },
    { $set: { userId: null, userLabel: '(o\'chirilgan hisob)' } }
  );

  // 3) B2B -- agar bu foydalanuvchi biror workspace egasi bo'lsa, buni
  // ALOHIDA hal qilish kerak (workspace'ni o'chirib bo'lmaydi, chunki
  // boshqa a'zolar ishlay olmay qoladi) -- shuning uchun bu holatni
  // qayd etamiz, lekin avtomatik hal qilmaymiz (qo'lda yoki alohida
  // oqim talab qiladi).
  const ownedWorkspaces = await Organization.find({ ownerId: userId });
  // Faqat a'zolikdan chiqaramiz (workspace'larga tegmaymiz, agar owner bo'lmasa)
  await Member.deleteMany({ userId });

  // 4) Shaxsiy ma'lumotni tozalaymiz -- LEKIN rozilik dalilini SAQLAB QOLAMIZ.
  user.name = '(o\'chirilgan foydalanuvchi)';
  user.email = null;
  user.phone = null;
  user.passwordHash = 'DELETED'; // hech qachon shu xesh bilan kira olmaydi
  user.credits = 0;
  // termsAcceptedVersion, termsAcceptedAt, termsAcceptedIp -- ATAYLAB TEGILMAYDI.
  await user.save();

  deletionRequest.status = 'completed';
  deletionRequest.completedAt = new Date();
  await deletionRequest.save();

  return {
    alreadyGone: false,
    ownedWorkspacesNeedingAttention: ownedWorkspaces.map((w) => ({ id: w.id, name: w.name })),
  };
}

/**
 * Muddati o'tgan BARCHA so'rovlarni topib, tozalaydi -- kunlik cron
 * vazifasi sifatida chaqirilishi kerak (server/index.js orqali, yoki
 * tashqi scheduler orqali).
 */
async function runScheduledPurge() {
  const due = await DeletionRequest.find({ status: 'pending', scheduledPurgeAt: { $lte: new Date() } });
  const results = [];
  for (const req of due) {
    try {
      const result = await performPurge(req);
      results.push({ userId: req.userId, ...result });
    } catch (e) {
      console.error(`[accountDeletion] ${req.userId} uchun tozalashda xato:`, e.message);
    }
  }
  if (results.length) console.log(`[accountDeletion] ${results.length} hisob tozalandi.`);
  return results;
}

module.exports = { requestDeletion, cancelDeletion, getPendingDeletion, performPurge, runScheduledPurge };
