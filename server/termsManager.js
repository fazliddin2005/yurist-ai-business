// termsManager.js
// ============================================================================
// FOYDALANISH SHARTLARI VERSIYALARINI BOSHQARISH -- har bir versiyaning
// to'liq matnini MUZLATILGAN holda saqlaydi, hech qachon o'chirmaydi.
//
// ISHLASH TARTIBI:
//   1. Server birinchi marta ishga tushganda (yoki birinchi /terms so'rovida),
//      agar bazada hech qanday versiya bo'lmasa, server/legal-text/
//      termsContent.js dagi matnni "1.0" versiyasi sifatida AVTOMATIK
//      bazaga yozadi (seed). Bu -- kodning "boshlang'ich holati".
//   2. Shundan keyin, kelajakda yangi versiya (1.1, 2.0 va h.k.) qo'shish
//      kerak bo'lsa, createNewVersion() funksiyasi orqali YANGI yozuv
//      qo'shiladi -- eskisi HECH QACHON o'zgartirilmaydi yoki o'chirilmaydi.
//   3. Foydalanuvchilarga HAR DOIM "joriy" (isCurrent=true) versiya
//      ko'rsatiladi, lekin admin istalgan eski versiyani ham to'liq
//      ko'rishi mumkin -- bu huquqiy dalil uchun muhim.
// ============================================================================
const { TermsVersion } = require('./models');
const { TERMS_CONTENT, TERMS_VERSION: INITIAL_VERSION } = require('./legal-text/termsContent');

/**
 * Bazada hech qanday versiya yo'q bo'lsa, termsContent.js dagi matnni
 * boshlang'ich versiya sifatida yozadi. Bu IDEMPOTENT -- bir necha marta
 * chaqirilsa ham, faqat birinchi safar haqiqiy yozuv qo'shadi.
 */
async function ensureSeeded() {
  const existing = await TermsVersion.findOne({ version: INITIAL_VERSION });
  if (existing) return existing;

  const seeded = await TermsVersion.create({
    version: INITIAL_VERSION,
    content: TERMS_CONTENT,
    isCurrent: true,
    changeNote: "Boshlang'ich versiya (kod bilan birga o'rnatilgan)",
  });
  console.log(`[termsManager] Boshlang'ich shartlar versiyasi (${INITIAL_VERSION}) bazaga yozildi.`);
  return seeded;
}

/**
 * Joriy (foydalanuvchilarga ko'rsatiladigan) versiyani qaytaradi.
 * Agar bazada hali hech narsa bo'lmasa, avtomatik urug'laydi.
 */
async function getCurrentVersion() {
  let current = await TermsVersion.findOne({ isCurrent: true }).sort({ publishedAt: -1 });
  if (!current) current = await ensureSeeded();
  return current;
}

/**
 * Berilgan til uchun joriy versiyaning matnini qaytaradi.
 */
async function getCurrentTermsForLang(lang) {
  const current = await getCurrentVersion();
  const content = current.content[lang] || current.content.uz;
  return { version: current.version, content };
}

/**
 * MUHIM HUQUQIY FUNKSIYA: berilgan ANIQ versiya raqami uchun, o'sha
 * vaqtda qanday matn bo'lganini qaytaradi -- bu versiya HECH QACHON
 * o'zgartirilmagan, shuning uchun bu funksiya har doim "o'sha paytdagi
 * haqiqiy matnni" qaytaradi.
 */
async function getVersionByNumber(version) {
  return TermsVersion.findOne({ version });
}

/**
 * Barcha versiyalarni (eng yangisidan eskisiga) ro'yxat qilib qaytaradi --
 * admin panelda "Shartlar tarixi" sahifasi uchun.
 */
async function listAllVersions() {
  await ensureSeeded(); // hech bo'lmaganda 1 ta versiya bo'lishini ta'minlaymiz
  return TermsVersion.find().sort({ publishedAt: -1 });
}

/**
 * Yangi versiya yaratadi va uni "joriy" deb belgilaydi (eski versiyalarning
 * isCurrent maydoni false qilinadi, lekin MATNI O'ZGARTIRILMAYDI -- faqat
 * bayroq o'zgaradi). Bu funksiya admin tomonidan chaqiriladi, kelajakda
 * shartlar matni yangilanishi kerak bo'lganda.
 */
async function createNewVersion({ version, content, changeNote }) {
  const existing = await TermsVersion.findOne({ version });
  if (existing) {
    throw new Error(`"${version}" versiyasi allaqachon mavjud -- versiya raqamlari TAKRORLANMASLIGI kerak (huquqiy dalil yaxlitligini saqlash uchun)`);
  }
  // Eski "joriy" versiyani joriy emas deb belgilaymiz -- MATNI TEGILMAYDI.
  await TermsVersion.updateMany({ isCurrent: true }, { isCurrent: false });
  return TermsVersion.create({ version, content, isCurrent: true, changeNote: changeNote || '' });
}

module.exports = {
  ensureSeeded, getCurrentVersion, getCurrentTermsForLang,
  getVersionByNumber, listAllVersions, createNewVersion,
};
