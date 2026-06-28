// dataRetentionPolicy.js
// ============================================================================
// MA'LUMOTLARNI SAQLASH VA O'CHIRISH SIYOSATI -- bu fayl ikki narsani
// belgilaydi: (1) qanday ma'lumot qancha vaqt saqlanadi, (2) foydalanuvchi
// "hisobni o'chir" deganda nima sodir bo'ladi.
//
// HUQUQIY ASOS: O'zbekiston "Shaxsga doir ma'lumotlar to'g'risida"gi
// Qonuni va shunga o'xshash boshqa yurisdiksiyalardagi qonunlar odatda
// foydalanuvchiga ma'lumotini o'chirishni so'rash huquqini beradi
// ("right to erasure" / "right to be forgotten" tushunchasining mahalliy
// versiyasi). Bu modul shu huquqni AMALIY ravishda ta'minlaydi.
//
// MUHIM PRINSIP: "o'chirish" deganda biz IKKI xil ma'lumotni FARQLAYMIZ:
//   1. SHAXSIY ma'lumot (ism, email, telefon, parol) -- bular DARHOL,
//      QAYTARILMAS tarzda o'chiriladi.
//   2. STATISTIK/MOLIYAVIY yozuvlar (masalan promokod ishlatilgan
//      tarix, kredit operatsiyalari) -- bular buxgalteriya va firibgarlikka
//      qarshi kurash maqsadida ANONIMLASHTIRILGAN holda saqlanishi mumkin
//      (foydalanuvchi ID'siga bog'lanmaydi, lekin yozuv o'zi yo'qolmaydi).
//      Bu -- ko'pchilik mamlakatlarning moliyaviy hisobotlarni saqlash
//      talablariga (odatda 3-5 yil) mos kelish uchun zarur.
// ============================================================================

// Hisob o'chirilgandan keyin, foydalanuvchining shaxsiy ma'lumoti necha
// kun ichida TO'LIQ tozalanishi kerak. 30 kun -- "fikrni o'zgartirish"
// uchun yumshoq muddat (masalan tasodifan bosilgan bo'lsa), shundan keyin
// qaytarib bo'lmaydi.
const GRACE_PERIOD_DAYS = 30;

// Har bir ma'lumot turi uchun: qancha vaqt saqlanadi va nega.
const RETENTION_RULES = [
  {
    category: 'Hisob ma\'lumotlari (ism, email, telefon, parol xeshi)',
    retention: `O'chirish so'ralgandan keyin ${GRACE_PERIOD_DAYS} kun (fikr o'zgartirish uchun), so'ngra to'liq va qaytarilmas tarzda o'chiriladi.`,
    reason: 'Foydalanuvchi roziligiga asoslangan saqlash -- u so\'raganda olib tashlanadi.',
  },
  {
    category: 'AI chat va "Ish" (Case) tarixi',
    retention: `Hisob bilan birga o'chiriladi (${GRACE_PERIOD_DAYS} kunlik muddatdan keyin).`,
    reason: 'Faqat foydalanuvchining o\'ziga tegishli, boshqa hech kim foydalanmaydi.',
  },
  {
    category: 'Yaratilgan hujjatlar (shartnomalar, arizalar)',
    retention: `Hisob bilan birga o'chiriladi (${GRACE_PERIOD_DAYS} kunlik muddatdan keyin).`,
    reason: 'Shaxsiy hujjat, faqat egasiga tegishli.',
  },
  {
    category: 'Faollik jurnali (activity_log) yozuvlari',
    retention: 'Hisob o\'chirilgandan keyin, userId maydoni olib tashlanadi (anonimlashtiriladi), lekin statistik yozuv (vaqt, amal turi) saqlanib qoladi.',
    reason: 'Platforma statistikasi (masalan "kunlik faol foydalanuvchilar soni") shaxsga bog\'lanmagan holda saqlanishi kerak.',
  },
  {
    category: 'Kredit/to\'lov operatsiyalari tarixi',
    retention: 'Anonimlashtirilgan holda kamida 5 yil saqlanadi (buxgalteriya/soliq talablari uchun).',
    reason: 'Moliyaviy hisobotlarni saqlash bo\'yicha qonuniy talab -- bu shaxsiy ma\'lumot emas, balki moliyaviy yozuv.',
  },
  {
    category: 'Foydalanish shartlariga rozilik dalili (versiya, vaqt, IP)',
    retention: "Hisob o'chirilgandan keyin HAM saqlanadi -- O'CHIRILMAYDI.",
    reason: 'Bu dalil aynan "kelajakda nizo bo\'lsa" deb mo\'ljallangan -- agar hisob o\'chirilganda bu ham yo\'qolsa, dalil o\'z ma\'nosini yo\'qotadi. Shuning uchun userId saqlanadi, lekin boshqa shaxsiy ma\'lumot (ism, email) bilan ko\'rsatilmaydi -- faqat hisob ID\'si orqali.',
  },
  {
    category: 'B2B workspace ma\'lumotlari (boshqa a\'zolar yaratgan)',
    retention: 'Agar foydalanuvchi workspace egasi bo\'lmasa, faqat UNING shaxsiy bog\'lanishi o\'chiriladi -- workspace va boshqa a\'zolarning ishi davom etadi.',
    reason: 'Bir kishi hisobini o\'chirgani uchun butun jamoaning ishi yo\'qolmasligi kerak.',
  },
];

module.exports = { GRACE_PERIOD_DAYS, RETENTION_RULES };
