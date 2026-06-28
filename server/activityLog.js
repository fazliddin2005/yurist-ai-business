// activityLog.js
// ============================================================================
// FAOLLIK JURNALI -- platforma egasi (admin) uchun "kim, qachon, nima qildi"
// statistikasi. MAXFIYLIK QOIDASI -- JUDA MUHIM:
//   - Bu yerda HECH QACHON shaxsiy mazmun saqlanmaydi: AI chat savol-javob
//     matni, hujjat ichidagi shaxsiy ma'lumot, parol va h.k. -- bularning
//     HECH BIRI bu jurnalga yozilmaydi.
//   - Faqat METADATA saqlanadi: amal turi, vaqt, foydalanuvchi ID/ism,
//     miqdor (masalan necha kredit), shablon turi -- statistik ahamiyatga
//     ega, lekin shaxsni "ochib tashlamaydigan" ma'lumot.
//
// Masalan: "Foydalanuvchi X 22.06.2026 14:30 da tizimga kirdi" -- YOZILADI.
//          "Foydalanuvchi X shunday savol so'radi: ..." -- HECH QACHON YOZILMAYDI.
//
// MONGODB MIGRATSIYASI: logActivity() ATAYLAB await qilinmaydi -- chunki
// bu "fire-and-forget" log yozuvi, asosiy so'rov oqimini (masalan hujjat
// yaratish) sekinlashtirmasligi yoki to'xtatib qo'ymasligi kerak. Agar
// yozishda xato bo'lsa, faqat konsolga chiqadi, foydalanuvchiga ta'sir qilmaydi.
// ============================================================================
const ActivityLog = require('./models/ActivityLog');

const MAX_LOG_SIZE = 50000; // juda ko'p o'sib ketmasligi uchun yumshoq chegara

const ACTION_TYPES = {
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  CREDIT_PURCHASED: 'credit_purchased',
  PROMO_REDEEMED: 'promo_redeemed',
  DOCUMENT_CREATED: 'document_created',
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  RISK_ANALYSIS_RUN: 'risk_analysis_run',
  WORKSPACE_CREATED: 'workspace_created',
  WORKSPACE_DELETED: 'workspace_deleted',
  B2B_MEMBER_ADDED: 'b2b_member_added',
  B2B_TEMPLATE_CREATED: 'b2b_template_created',
  B2B_AUDIT_RUN: 'b2b_audit_run',
  B2B_API_KEY_CREATED: 'b2b_api_key_created',
  ACCOUNT_DELETION_REQUESTED: 'account_deletion_requested',
  ACCOUNT_DELETION_CANCELLED: 'account_deletion_cancelled',
};

/**
 * Yangi faollik yozuvi qo'shadi. ATAYLAB sinxron interfeys saqlangan
 * (chaqiruvchi tomon `await` qilmaydi) -- ichida asinxron yozish "fire and
 * forget" tarzda amalga oshiriladi.
 */
function logActivity({ type, userId, userLabel, meta }) {
  if (!Object.values(ACTION_TYPES).includes(type)) {
    console.error(`[activityLog] Noma'lum amal turi rad etildi: ${type}`);
    return;
  }
  ActivityLog.create({ type, userId: userId || null, userLabel: userLabel || null, meta: meta || {} })
    .then(async () => {
      // Jurnal juda katta bo'lib ketmasligi uchun, vaqti-vaqti bilan eskilarini tozalaymiz
      const count = await ActivityLog.countDocuments();
      if (count > MAX_LOG_SIZE) {
        const excess = count - MAX_LOG_SIZE;
        const oldest = await ActivityLog.find().sort({ createdAt: 1 }).limit(excess).select('_id');
        await ActivityLog.deleteMany({ _id: { $in: oldest.map((o) => o._id) } });
      }
    })
    .catch((e) => console.error('[activityLog] yozishda xato:', e.message));
}

/**
 * So'nggi N faollik yozuvini qaytaradi (eng yangisi birinchi).
 */
async function getRecentActivity(limit = 100) {
  return ActivityLog.find().sort({ createdAt: -1 }).limit(limit);
}

/**
 * Berilgan vaqt oralig'idagi faollikni qaytaradi (statistika hisoblash uchun).
 */
async function getActivityInRange(sinceDate) {
  return ActivityLog.find({ createdAt: { $gte: sinceDate } });
}

module.exports = { logActivity, getRecentActivity, getActivityInRange, ACTION_TYPES };
