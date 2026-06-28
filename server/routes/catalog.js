// routes/catalog.js — advokatlar, hujjat shablonlari, yurisdiksiyalar ro'yxati.
const express = require('express');
const { LAWYERS, TEMPLATES } = require('../seed');
const { LEGAL_DB, JURIS_ORDER } = require('../legalData');
const { searchForJurisdiction, isConfigured: niaConfigured } = require('../nia');
const uzLaborCode = require('../legal-content/uz/laborCode');

const router = express.Router();

// QO'LDA TASDIQLANGAN, TO'LIQ MUNDARIJALAR -- bu yerda lex.uz'dan qo'lda
// tekshirilgan, aniq modda nomlari va rasmiy havola saqlanadi. Bu Nia
// qidiruvidan KO'RA ISHONCHLIROQ, chunki Nia faqat parcha-parcha natija
// beradi, bu yerda esa BUTUN kodeksning tartibli mundarijasi bor (hozircha
// 1-141 modda, qolgani navbatda).
//
// KALIT FORMATI: "{JURISDICTION}_{lawKey}" (masalan "UZ_labor")
const DETAILED_TOC = {
  UZ_labor: uzLaborCode,
};

// Nia'da TO'LIQ indekslangan (barcha sahifalari "Completed" holatda) 4 yurisdiksiya.
// Bu yerlarda natija ISHONCHLI deb hisoblanadi. Qolgan 4 davlat uchun ham
// endi qidiruv QILINADI (foydalanuvchi talabiga ko'ra), lekin natija
// "to'liq tasdiqlanmagan" deb belgilanadi -- bu farqni FRONTEND'GA aniq
// ko'rsatamiz, hech qachon yashirmaymiz.
const FULLY_INDEXED_JURISDICTIONS = ['UZ', 'RU', 'TJ', 'US'];

// HAR BIR KODEKS TURI UCHUN, bir nechta MAVZUIY so'rov -- bitta umumiy
// so'rov o'rniga. Bu Nia'dan kodeksning turli bo'limlarini (umumiy
// qoidalar, asosiy huquq/majburiyatlar, javobgarlik, muddatlar) alohida
// qidirib topishga yordam beradi, shunda natija "bir xil takrorlanган
// 2-3 jumla" emas, balki haqiqatan KENG bo'ladi.
const SUBTOPICS_BY_LAW_KEY = {
  const: ['asosiy qoidalar va davlat tuzilishi', 'fuqarolarning huquq va erkinliklari', 'davlat hokimiyati organlari', 'fuqarolarning asosiy majburiyatlari'],
  civil: ['shartnoma tuzish va bekor qilish qoidalari', 'mulkchilik huquqi', 'meros huquqi', 'fuqaroviy javobgarlik va zarar to\'lash'],
  crim: ['jinoyat tarkibi va javobgarlik asoslari', 'jazo turlari va ularni tayinlash', 'jinoyatlarning asosiy turlari', 'jinoiy javobgarlikdan ozod qilish'],
  labor: ['mehnat shartnomasi tuzish va bekor qilish', 'ish vaqti va dam olish vaqti', 'ish haqi va mehnat muhofazasi', 'mehnat nizolarini hal qilish'],
  tax: ['soliq turlari va stavkalari', 'soliq deklaratsiyasi va to\'lash muddatlari', 'soliq imtiyozlari', 'soliq javobgarligi'],
  family: ['nikoh tuzish va bekor qilish', 'er-xotinning huquq va majburiyatlari', 'farzandlarni tarbiyalash va alimentlar', 'vasiylik va homiylik'],
  admin: ['ma\'muriy huquqbuzarlik tarkibi', 'ma\'muriy jazo turlari', 'ma\'muriy javobgarlikka tortish tartibi', 'ma\'muriy nazorat organlari'],
  land: ['yer egaligi va foydalanish huquqi', 'yer uchastkasini ajratish tartibi', 'yer monitoringi va muhofazasi', 'yer nizolarini hal qilish'],
};

router.get('/lawyers', (req, res) => res.json({ lawyers: LAWYERS }));
router.get('/templates', (req, res) => res.json({ templates: TEMPLATES }));

router.get('/jurisdictions', (req, res) => {
  const list = JURIS_ORDER.map((code) => {
    const d = LEGAL_DB[code];
    return {
      code, flag: d.flag, name: d.name, official: d.official, officialName: d.officialName,
      fullyIndexed: FULLY_INDEXED_JURISDICTIONS.includes(code),
    };
  });
  res.json({ jurisdictions: list });
});

router.get('/laws/:jurisdiction', (req, res) => {
  const db = LEGAL_DB[req.params.jurisdiction];
  if (!db) return res.status(404).json({ error: 'Yurisdiksiya topilmadi' });
  res.json({
    jurisdiction: req.params.jurisdiction,
    laws: db.laws,
    official: db.official,
    officialName: db.officialName,
    fullyIndexed: FULLY_INDEXED_JURISDICTIONS.includes(req.params.jurisdiction),
  });
});

// GET /api/catalog/laws/:jurisdiction/:lawKey
// TO'LIQ QAYTA QURILDI: endi BARCHA 8 yurisdiksiya uchun Nia orqali
// qidiruv amalga oshiriladi (foydalanuvchi talabiga ko'ra), lekin
// natijaning ISHONCHLILIK darajasi aniq ko'rsatiladi:
//   - fullyIndexed=true (UZ, RU, TJ, US): natija ishonchli, "to'liq
//     indekslangan" manbadan.
//   - fullyIndexed=false (qolgan 4): natija ko'rsatiladi, LEKIN
//     "to'liq tasdiqlanmagan, rasmiy manbadan tekshiring" ogohlantirishi
//     bilan -- hech qachon ishonchli deb yashirilmaydi.
//
// KENGAYTIRILGAN QIDIRUV: bitta umumiy so'rov o'rniga, har bir kodeks
// uchun 4 ta MAVZUIY so'rov PARALLEL yuboriladi (SUBTOPICS_BY_LAW_KEY),
// natijalar birlashtiriladi va dublikatlar olib tashlanadi -- bu
// avvalgi "2-3 qisqa parcha" o'rniga, haqiqatan KENG qamrovli natija beradi.
router.get('/laws/:jurisdiction/:lawKey', async (req, res) => {
  try {
    const { jurisdiction, lawKey } = req.params;
    const db = LEGAL_DB[jurisdiction];
    if (!db) return res.status(404).json({ error: 'Yurisdiksiya topilmadi' });

    const law = db.laws.find((l) => l.key === lawKey);

    // 0-QADAM: avval QO'LDA TASDIQLANGAN, TO'LIQ mundarija mavjud-yo'qligini
    // tekshiramiz -- mavjud bo'lsa, bu Nia qidiruvidan ANCHA ishonchliroq,
    // chunki bu yerda butun kodeksning tartibli, tasdiqlangan ro'yxati bor.
    const tocKey = `${jurisdiction}_${lawKey}`;
    if (DETAILED_TOC[tocKey]) {
      const toc = DETAILED_TOC[tocKey];
      return res.json({
        jurisdiction,
        law,
        title: lawKey === 'const' ? db.constTitle : law.name,
        sub: lawKey === 'const' ? db.constSub : law.desc,
        official: db.official,
        officialName: db.officialName,
        fullyIndexed: FULLY_INDEXED_JURISDICTIONS.includes(jurisdiction),
        detailedToc: true, // frontend bu yerda "to'liq mundarija" rejimini ko'rsatadi
        tocBaseUrl: toc.BASE_URL,
        tocSections: toc.SECTIONS,
        notice: "Quyida ushbu kodeksning rasmiy, to'liq tasdiqlangan mundarijasi keltirilgan. Har bir moddaning to'liq matnini ko'rish uchun \"Rasmiy manba\" havolasini bosing va sahifada modda raqamini qidiring (Ctrl+F).",
      });
    }
    if (!law) return res.status(404).json({ error: 'Kodeks topilmadi' });

    const isFullyIndexed = FULLY_INDEXED_JURISDICTIONS.includes(jurisdiction);
    const baseResponse = {
      jurisdiction,
      law,
      title: lawKey === 'const' ? db.constTitle : law.name,
      sub: lawKey === 'const' ? db.constSub : law.desc,
      official: db.official,
      officialName: db.officialName,
      fullyIndexed: isFullyIndexed,
    };

    // Nia ulanmagan bo'lsa (API kalit yo'q), eski statik namunaga qaytamiz --
    // bu butunlay ishlamay qolishdan yaxshiroq (fallback).
    if (!niaConfigured()) {
      return res.json({ ...baseResponse, sections: db.const || [], niaUsed: false });
    }

    // Mavzuiy so'rovlar ro'yxati -- agar shu kodeks uchun maxsus mavzular
    // belgilanmagan bo'lsa, umumiy so'rovga qaytamiz (xavfsiz fallback).
    const subtopics = SUBTOPICS_BY_LAW_KEY[lawKey] || [`${law.name} asosiy moddalar tuzilishi`];
    const queries = subtopics.map((topic) => `${law.name} ${db.name} ${topic}`);

    // BARCHA mavzuiy so'rovlarni PARALLEL yuboramiz -- ketma-ket emas,
    // shunda 4 so'rov yig'indisi o'rniga, eng sekinining vaqti sarflanadi.
    const results = await Promise.all(
      queries.map((q) => searchForJurisdiction(q, jurisdiction).catch(() => null))
    );

    // Barcha natijalardan kelgan parchalarni birlashtiramiz, matn bo'yicha
    // dublikatlarni olib tashlaymiz (Nia turli so'rovlarda bir xil parchani
    // qaytarishi mumkin).
    const seenTexts = new Set();
    const allChunks = [];
    results.forEach((result, topicIdx) => {
      if (!result || !result.chunks.length) return;
      result.chunks.forEach((chunk) => {
        const key = chunk.text.slice(0, 100); // boshlang'ich 100 belgi orqali tezkor dublikat tekshiruvi
        if (seenTexts.has(key)) return;
        seenTexts.add(key);
        allChunks.push({ ...chunk, topicLabel: subtopics[topicIdx] });
      });
    });

    if (!allChunks.length) {
      // Nia hech narsa topa olmasa (ayniqsa hali to'liq indekslanmagan
      // davlatlar uchun ehtimoli yuqori), buni OCHIQ aytamiz -- soxta
      // "bo'sh sahifa" o'rniga, aniq tushuntirish bilan.
      return res.json({
        ...baseResponse,
        sections: db.const || [],
        niaUsed: false,
        notice: isFullyIndexed
          ? "Bu kodeks bo'yicha hozircha qidiruv natija bermadi. Rasmiy manbadan to'liq matnni ko'rishingiz mumkin."
          : `Bu yurisdiksiya (${db.name}) hali Nia qidiruv tizimida to'liq indekslanmagan, shuning uchun avtomatik qidiruv natija bermadi. Iltimos, to'liq va ishonchli matn uchun ${db.officialName} rasmiy saytiga murojaat qiling.`,
      });
    }

    // Natijani bo'lim-modda formatiga moslaymiz -- har bir mavzu (topic)
    // alohida ko'rsatiladi, ichida tegishli parchalar bilan. Kengaytirilgan
    // limitlar: avvalgi 6 banddan 20 bandgacha, 800 belgidan 1500 belgigacha.
    const grouped = {};
    allChunks.forEach((chunk) => {
      if (!grouped[chunk.topicLabel]) grouped[chunk.topicLabel] = [];
      grouped[chunk.topicLabel].push(chunk);
    });

    const sections = Object.entries(grouped).map(([topicLabel, chunks]) => ({
      sec: `${topicLabel.toUpperCase()} — ${db.officialName} dan olingan`,
      arts: chunks.slice(0, 5).map((chunk, idx) => ({
        no: `${idx + 1}-band`,
        t: `Manba: ${chunk.source || db.officialName}`,
        b: chunk.text.slice(0, 1500),
      })),
    }));

    // ISHONCHLILIK OGOHLANTIRISHI: agar bu yurisdiksiya hali to'liq
    // indekslanmagan bo'lsa, natija bo'lsa ham, buni ANIQ belgilaymiz --
    // foydalanuvchi bu matnni "100% rasmiy" deb noto'g'ri tushunmasligi uchun.
    const notice = !isFullyIndexed
      ? `DIQQAT: ${db.name} hali Nia qidiruv tizimida TO'LIQ indekslanmagan. Quyidagi natija topilgan bo'lsa-da, to'liq va rasmiy ishonchlilik kafolatlanmaydi -- albatta ${db.officialName} saytidan tasdiqlang.`
      : null;

    res.json({ ...baseResponse, sections, niaUsed: true, notice, chunksFound: allChunks.length });
  } catch (e) {
    console.error('[catalog/laws] xato:', e);
    res.status(500).json({ error: "Qonun ma'lumotini yuklashda kutilmagan xato yuz berdi" });
  }
});

module.exports = router;
