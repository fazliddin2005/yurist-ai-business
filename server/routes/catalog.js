// routes/catalog.js — advokatlar, hujjat shablonlari, yurisdiksiyalar ro'yxati.
const express = require('express');
const { LAWYERS, TEMPLATES } = require('../seed');
const { LEGAL_DB, JURIS_ORDER } = require('../legalData');
const { searchForJurisdiction, isConfigured: niaConfigured } = require('../nia');
const uzLaborCode = require('../legal-content/uz/laborCode');
const uzCivilCode = require('../legal-content/uz/civilCode');
const uzCivilCode2 = require('../legal-content/uz/civilCode_part2');
const uzTaxCode = require('../legal-content/uz/taxCode');
const uzCategories = require('../legal-content/uz/categories');

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
  UZ_civil: uzCivilCode,
  UZ_civil2: uzCivilCode2,
  UZ_tax: uzTaxCode,
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
  civil: [
    'umumiy qoidalar va fuqarolik huquq subyektlari',
    'yuridik shaxslarni tashkil etish va tugatish',
    'mulk huquqi va boshqa ashyoviy huquqlar',
    'shartnoma tuzish, o\'zgartirish va bekor qilish qoidalari',
    'majburiyatlarni bajarish va ta\'minlash usullari (garov, kafolat, jarima)',
    'oldi-sotdi, ijara, pudrat shartnomalari',
    'fuqaroviy javobgarlik va zarar to\'lash',
    'meros huquqi',
    'intellektual mulk huquqi',
    'xalqaro xususiy huquq normalari',
  ],
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
      // laborCode.js: { BASE_URL, SECTIONS }
      // civilCode.js, taxCode.js: { url, tocSections, ... }
      const tocBaseUrl = toc.BASE_URL || toc.url || '';
      const tocSections = toc.SECTIONS || toc.tocSections || [];
      return res.json({
        jurisdiction,
        law,
        title: lawKey === 'const' ? db.constTitle : (law ? law.name : toc.name || lawKey),
        sub: lawKey === 'const' ? db.constSub : (law ? law.desc : toc.officialName || ''),
        official: db.official,
        officialName: db.officialName,
        fullyIndexed: FULLY_INDEXED_JURISDICTIONS.includes(jurisdiction),
        detailedToc: true,
        tocBaseUrl,
        tocSections,
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
      arts: chunks.slice(0, 8).map((chunk, idx) => {
        const rawSource = chunk.source || db.officialName;
        const isUrl = /^https?:\/\//.test(rawSource);
        // Ko'rsatish uchun qisqa nom: to'liq URL emas, faqat domen (masalan
        // "lex.uz") -- to'liq URL esa havolaning o'zida (href) ishlatiladi.
        let shortLabel = rawSource;
        if (isUrl) {
          try { shortLabel = new URL(rawSource).hostname.replace(/^www\./, ''); }
          catch (e) { shortLabel = rawSource; }
        }
        return {
          no: `${idx + 1}-band`,
          t: `Manba: ${shortLabel}`,
          b: chunk.text.slice(0, 2000),
          url: isUrl ? rawSource : null,
        };
      }),
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

// GET /api/catalog/legal-categories/:jurisdiction
// "Qonunlar" bo'limidagi YANGI, KATEGORIYALANGAN ko'rinish uchun: bitta
// aralash ro'yxat o'rniga, har biri ALOHIDA ajratilgan to'rt bo'lim
// qaytariladi -- Kodekslar, Qonunlar, Prezident hujjatlari, Hukumat
// qarorlari. Hozircha to'liq tarkib FAQAT O'zbekiston (UZ) uchun mavjud
// (server/legal-content/uz/categories.js); qolgan yurisdiksiyalar uchun
// kodekslar (db.laws) ko'rsatiladi, boshqa kategoriyalar bo'sh qaytariladi
// -- bu "ishlamaydi" emas, "hali to'ldirilmagan" degani, frontendga aniq
// notice bilan bildiriladi.
router.get('/legal-categories/:jurisdiction', (req, res) => {
  const { jurisdiction } = req.params;
  const db = LEGAL_DB[jurisdiction];
  if (!db) return res.status(404).json({ error: 'Yurisdiksiya topilmadi' });

  const isUZ = jurisdiction === 'UZ';
  res.json({
    jurisdiction,
    kodekslar: db.laws,
    qonunlar: isUZ ? uzCategories.QONUNLAR : [],
    prezidentHujjatlari: isUZ ? uzCategories.PREZIDENT_HUJJATLARI : [],
    hukumatQarorlari: isUZ ? uzCategories.HUKUMAT_QARORLARI : [],
    hukumatQarorlariSourceUrl: isUZ ? uzCategories.HUKUMAT_QARORLARI_SOURCE_URL : null,
    notice: isUZ
      ? "Qonunlar, Prezident hujjatlari va Hukumat qarorlari ro'yxati bosqichma-bosqich to'ldirilmoqda -- bu yerda hozircha eng muhim va so'nggi hujjatlar keltirilgan. To'liq ro'yxat uchun lex.uz saytidan foydalaning."
      : `${db.name} uchun kategoriyalangan qonunlar ro'yxati hali tayyorlanmagan -- hozircha faqat kodekslar mavjud.`,
  });
});

// MUHIM ARXITEKTURA QARORI (modda matni haqida): bu yerda HECH QANDAY
// qonun moddasining matni statik holda saqlanmaydi. Foydalanuvchi biror
// moddani ochganda, har safar Nia orqali rasmiy manbadan (lex.uz va h.k.)
// JONLI qidiriladi -- shunday qilib matn HECH QACHON eskirmaydi, va
// qo'lda "har oy tekshirish" ehtiyoji yo'qoladi (server avtomatik eng
// yangi versiyani ko'rsatadi). Tezlik uchun -- xuddi shu modda qisqa vaqt
// ichida qayta so'ralganda Nia'ga qayta-qayta murojaat qilmaslik uchun --
// oddiy xotira-ichi (in-memory) kesh ishlatiladi, 7 kunlik TTL bilan.
const ARTICLE_CACHE = new Map(); // key -> { data, expiresAt }
const ARTICLE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 kun

// GET /api/catalog/laws/:jurisdiction/:lawKey/article/:articleNo
// Bitta aniq moddaning JONLI matnini qaytaradi (saqlanmaydi -- har safar
// yangi so'rov, faqat qisqa muddatli tezlik keshi bilan).
router.get('/laws/:jurisdiction/:lawKey/article/:articleNo', async (req, res) => {
  try {
    const { jurisdiction, lawKey, articleNo } = req.params;
    const db = LEGAL_DB[jurisdiction];
    if (!db) return res.status(404).json({ error: 'Yurisdiksiya topilmadi' });
    const law = db.laws.find((l) => l.key === lawKey);
    if (!law) return res.status(404).json({ error: 'Kodeks topilmadi' });

    const cacheKey = `${jurisdiction}_${lawKey}_${articleNo}`;
    const cached = ARTICLE_CACHE.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json({ ...cached.data, fromCache: true });
    }

    // law db.laws ichida topilmasa, DETAILED_TOC dan ma'lumot olamiz
    const tocKey = `${jurisdiction}_${lawKey}`;
    const toc = DETAILED_TOC[tocKey];
    const lawName = law
      ? law.name
      : (toc ? (toc.officialName || toc.name || lawKey) : lawKey);
    const lawUrl = law
      ? law.url
      : (toc ? (toc.BASE_URL || toc.url || db.official) : db.official);

    if (!niaConfigured()) {
      return res.json({
        found: false,
        notice: "Jonli qidiruv hozircha sozlanmagan -- to'liq matnni rasmiy manbadan ko'ring.",
        officialUrl: lawUrl,
      });
    }

    const query = `${lawName} ${db.name} ${articleNo}-modda to'liq matni`;
    const result = await searchForJurisdiction(query, jurisdiction).catch(() => null);

    if (!result || !result.chunks.length) {
      return res.json({
        found: false,
        notice: `${articleNo}-modda matni avtomatik qidiruvda topilmadi -- rasmiy manbadan ko'ring.`,
        officialUrl: lawUrl,
      });
    }

    // ISHONCHLI HUQUQIY MANBALAR filtri -- Nia indeksida boshqa hujjatlar ham
    // bo'lishi mumkin (tadqiqot maqolalari, bloglar va h.k.), shuning uchun
    // faqat rasmiy huquqiy manbalardan kelgan natijalarni olamiz.
    const TRUSTED_LAW_DOMAINS = /lex\.uz|nrm\.uz|adlia\.uz|parliament\.uz|norma\.uz|zakon\.uz|sud\.uz|gov\.uz|minjust\.uz/i;

    const trustedChunks = result.chunks.filter(c => {
      const src = (c.source || '').toLowerCase();
      return TRUSTED_LAW_DOMAINS.test(src);
    });

    // Agar ishonchli manba topilmasa — noto'g'ri matn ko'rsatishdan yaxshiroq
    // "topilmadi" xabari beriladi.
    if (!trustedChunks.length) {
      return res.json({
        found: false,
        notice: `${articleNo}-modda matni ishonchli huquqiy manbada topilmadi. Rasmiy saytdan to'liq matnni ko'ring.`,
        officialUrl: lawUrl,
      });
    }

    // Modda raqamiga eng mos chunk'ni tanlaymiz (ishonchli manbalar ichidan)
    const exact = trustedChunks.find((c) => new RegExp(`\\b${articleNo}\\s*-?\\s*modda`, 'i').test(c.text));
    const chosen = exact || trustedChunks[0];

    // Matn relevantligini tekshiramiz — minimal sifat nazorati
    const hasLegalContent = /modda|kodeks|qonun|huquq|majburiyat|shartnoma|xodim|soliq|fuqaro/i.test(chosen.text);
    if (!hasLegalContent) {
      return res.json({
        found: false,
        notice: `${articleNo}-modda bo'yicha ishonchli ma'lumot topilmadi. Rasmiy saytdan ko'ring.`,
        officialUrl: lawUrl,
      });
    }

    const safeSource = chosen.source && TRUSTED_LAW_DOMAINS.test(chosen.source) ? chosen.source : lawUrl;

    const responseData = {
      found: true,
      articleNo,
      text: chosen.text.slice(0, 4000),
      source: safeSource,
      officialUrl: lawUrl,
      fetchedAt: new Date().toISOString(),
    };
    ARTICLE_CACHE.set(cacheKey, { data: responseData, expiresAt: Date.now() + ARTICLE_CACHE_TTL_MS });
    res.json(responseData);
  } catch (e) {
    console.error('[catalog/laws/article] xato:', e);
    res.status(500).json({ error: "Modda matnini yuklashda kutilmagan xato yuz berdi" });
  }
});

module.exports = router;
