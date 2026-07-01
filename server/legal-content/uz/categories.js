// server/legal-content/uz/categories.js
// ============================================================================
// "QONUNLAR" BO'LIMI -- KATEGORIYALANGAN INDEKS (faqat O'zbekiston, UZ).
//
// MUHIM ARXITEKTURA QARORI: bu yerda har bir hujjatning TO'LIQ MATNI emas,
// balki ISHONCHLI INDEKS (nomi, raqami, sanasi, qisqa tavsifi, lex.uz'ga
// to'g'ridan-to'g'ri havola) saqlanadi. Sabab:
//   1) lex.uz'da minglab qonun va yuzlab prezident/hukumat qarori bor --
//      ularning BARCHASINI to'liq matni bilan qo'lda ko'chirish amalda
//      imkonsiz va doimo eskirib turadi.
//   2) Ilovada allaqachon Nia orqali lex.uz'ni JONLI qidiradigan tizim bor
//      (server/nia.js, server/routes/chat.js) -- modda matni kerak bo'lganda
//      shu orqali eng yangi versiyasi olinadi.
//   3) Bu fayl vazifasi -- foydalanuvchiga "Qonunlar" bo'limida TARTIBLI,
//      KATEGORIYALARGA AJRATILGAN ro'yxat ko'rsatish (Kodekslar / Qonunlar /
//      Prezident hujjatlari / Hukumat qarorlari), har biri rasmiy lex.uz
//      havolasi bilan -- bu "katalog", "to'liq nusxa" emas.
//
// KENGAYTIRISH TARTIBI: quyidagi ro'yxatlar BOSHLANG'ICH (seed) holatda --
// har bir keyingi sessiyada yangi tasdiqlangan yozuvlar qo'shib boriladi.
// Hech qachon noma'lum/tasdiqlanmagan raqam yoki sana O'YLAB TOPILMAYDI --
// faqat real, tekshirilgan manbalardan kiritiladi.
// ============================================================================

// 8 ASOSIY KODEKS -- bular legalData.js'dagi LEGAL_DB.UZ.laws bilan bir xil
// (u yerda saqlanadi, bu yerga faqat moslik uchun eslatma sifatida yozilgan).
// Qarang: server/legalData.js -> LEGAL_DB.UZ.laws

// QONUNLAR -- kodeks emas, alohida qabul qilingan qonunlar (O'RQ- raqami bilan).
// Har biri: nomi, raqami, qabul qilingan sana, kuchga kirish sanasi, lex.uz havolasi.
const QONUNLAR = [
  {
    name: "2026-yil uchun O'zbekiston Respublikasining Davlat budjeti to'g'risida",
    number: "O'RQ-1105",
    adoptedDate: '2025-12-25',
    effectiveDate: '2026-01-01',
    desc: "Davlat budjeti daromad va xarajatlarining 2026-yilga mo'ljallangan asosiy ko'rsatkichlari",
    url: 'https://lex.uz',
  },
  {
    name: "O'zbekiston Respublikasining Soliq kodeksiga qo'shimcha va o'zgartirishlar kiritish to'g'risida",
    number: "O'RQ-1071",
    adoptedDate: '2025-06-26',
    effectiveDate: '2025-06-26',
    desc: 'Soliq kodeksiga kiritilgan eng so\u02bbnggi tuzatishlar',
    url: 'https://lex.uz',
  },
  {
    name: 'Banklarni sanatsiya qilish va tugatish to\u02bbg\u02bbrisida',
    number: "O'RQ-1070",
    adoptedDate: '2025-06-23',
    effectiveDate: '2025-09-25',
    desc: 'Bank sektorida moliyaviy sog\u02bblomlashtirish va tugatish tartib-taomili',
    url: 'https://lex.uz',
  },
  {
    name: "Issiqxona gazlarining chiqarilishini cheklash to'g'risida",
    number: "O'RQ-1073",
    adoptedDate: '2025-07-07',
    effectiveDate: '2026-01-09',
    desc: 'Ekologik javobgarlik va emissiyalarni cheklash bo\u02bbyicha talablar',
    url: 'https://lex.uz',
  },
  {
    name: "Davlat mudofaa buyurtmasi to'g'risida",
    number: "O'RQ-1087",
    adoptedDate: '2025-10-04',
    effectiveDate: '2026-01-07',
    desc: "Davlat mudofaa buyurtmasini shakllantirish va bajarish tartibi",
    url: 'https://lex.uz',
  },
];

// PREZIDENT HUJJATLARI -- Farmon (PF-) va Qaror (PQ-) ikkalasi ham shu
// kategoriyaga kiradi, chunki ikkisi ham Prezident tomonidan chiqariladi
// (farqi -- huquqiy kuchi va formati, lekin foydalanuvchi uchun "Prezident
// hujjatlari" deb birlashtirilgan ko'rinish qulayroq).
const PREZIDENT_HUJJATLARI = [
  {
    name: "Mahalliy ishlab chiqarish va sanoat kooperatsiyasini yangi tizim asosida rivojlantirish bo'yicha birinchi navbatdagi chora-tadbirlar to'g'risida",
    number: 'PF-17',
    type: 'Farmon',
    date: '2026-02-04',
    desc: 'Sanoat kooperatsiyasini rag\u02bbbatlantirish chora-tadbirlari',
    url: 'https://lex.uz',
  },
  {
    name: "O'zbekiston Respublikasida korrupsiyaning oldini olish va unga qarshi kurashish tizimini yanada takomillashtirish to'g'risida",
    number: 'PF-270',
    type: 'Farmon',
    date: '2025-12-30',
    desc: 'Korrupsiyaga qarshi kurashish tizimini institutsional takomillashtirish',
    url: 'https://lex.uz',
  },
  {
    name: "2022–2026-yillarga mo'ljallangan Yangi O'zbekistonning taraqqiyot strategiyasi to'g'risida",
    number: 'PF-60',
    type: 'Farmon',
    date: '2022-01-28',
    desc: "Mamlakat rivojlanishining besh yillik strategik dasturi (asosiy, ko'p hujjatlarda havola qilinadigan)",
    url: 'https://lex.uz',
  },
  {
    name: "Uy-joy va ipoteka bozorini yanada rivojlantirishga oid qo'shimcha chora-tadbirlar to'g'risida",
    number: 'PF-26',
    type: 'Farmon',
    date: '2025-02-21',
    desc: 'Ipoteka kreditlash va uy-joy qurilishini rag\u02bbbatlantirish choralari',
    url: 'https://lex.uz',
  },
  {
    name: "Zargarlik buyumlarini ishlab chiqarish sohasini qo'llab-quvvatlash bo'yicha qo'shimcha chora-tadbirlar to'g'risida",
    number: 'PQ-207',
    type: 'Qaror',
    date: '2025-06-26',
    desc: 'Zargarlik sanoatini qo\u02bbllab-quvvatlash bo\u02bbyicha amaliy chora-tadbirlar',
    url: 'https://lex.uz',
  },
  {
    name: "Respublikada mis xomashyosini chuqur qayta ishlashni yanada jadallashtirish chora-tadbirlari to'g'risida",
    number: 'PQ-77',
    type: 'Qaror',
    date: '2024-02-19',
    desc: 'Tog\u02bb-kon va metallurgiya sohasidagi chuqur qayta ishlash dasturi',
    url: 'https://lex.uz',
  },
];

// HUKUMAT (VAZIRLAR MAHKAMASI) QARORLARI -- HOZIRCHA BO'SH SEED.
// Bu kategoriya keyingi bosqichda real, tekshirilgan Vazirlar Mahkamasi
// qarorlari (raqam+sana+nomi) bilan to'ldiriladi. Hozircha noto'g'ri yoki
// taxminiy ma'lumot kiritmaslik uchun ataylab bo'sh qoldirilgan -- faqat
// rasmiy ro'yxatga havola beriladi.
const HUKUMAT_QARORLARI = [];
const HUKUMAT_QARORLARI_SOURCE_URL = 'https://gov.uz/oz/iiv/pages/o-zbekiston-respublikasi-vazirlar-mahkamasining-qarorlari';

module.exports = {
  QONUNLAR,
  PREZIDENT_HUJJATLARI,
  HUKUMAT_QARORLARI,
  HUKUMAT_QARORLARI_SOURCE_URL,
};
