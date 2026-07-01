// routes/catalog.js
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

const DETAILED_TOC = {
  UZ_labor: uzLaborCode,
  UZ_civil: uzCivilCode,
  UZ_civil2: uzCivilCode2,
  UZ_tax: uzTaxCode,
};

const FULLY_INDEXED_JURISDICTIONS = ['UZ', 'RU', 'TJ', 'US'];

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

// ============================================================
// KONTENT FILTRLARI — Nia indeksidagi noto'g'ri hujjatlarni
// aniqlash uchun. Bu filtrlar BARCHA chunk'larga tatbiq etiladi,
// manba domenidan QAT'I NAZAR.
// ============================================================

// 1. SALBIY FILTR — bu so'zlardan biri bo'lsa, 100% noto'g'ri hujjat
const BAD_PATTERNS = [
  /SKILL\.md/i,
  /Output format/i,
  /Amendment History/i,
  /\[Counterparty\]/i,
  /\[Provision\]/i,
  /\[date of first\]/i,
  /\[Agreement type\]/i,
  /claude-for-legal/i,
  /commercial-legal/i,
  /anthropics\//i,
  /gfw\.report/i,
  /obsidian\.md/i,
  /## What changed/i,
  /Net current state/i,
  /Watch items/i,
  /ASCII Characters Exemption/i,
  /Common Protocols Exemption/i,
  /usenixsecurity/i,
  /```markdown/i,
  /Base agreement.*date/i,
];

// 2. MANBA DOMENLAR — faqat shu domenlardan kelgan matnlar ishonchli
const TRUSTED_LAW_DOMAINS = /lex\.uz|nrm\.uz|adlia\.uz|parliament\.uz|norma\.uz|zakon\.uz|sud\.uz|gov\.uz|minjust\.uz/i;

// 3. O'ZBEK HUQUQIY KONTENT — matn kamida bitta shu so'zni o'z ichida olishi kerak
const LEGAL_WORDS = /modda|kodeks|qonun|huquq|majburiyat|shartnoma|xodim|soliq|fuqaro|tashkilot|sud|jarima|jazо|muddati|tartib/i;

function isBadContent(text) {
  return BAD_PATTERNS.some(pattern => pattern.test(text));
}

function isGoodContent(text) {
  return !isBadContent(text) && LEGAL_WORDS.test(text);
}

// ============================================================

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

router.get('/laws/:jurisdiction/:lawKey', async (req, res) => {
  try {
    const { jurisdiction, lawKey } = req.params;
    const db = LEGAL_DB[jurisdiction];
    if (!db) return res.status(404).json({ error: 'Yurisdiksiya topilmadi' });

    const law = db.laws.find((l) => l.key === lawKey);

    const tocKey = `${jurisdiction}_${lawKey}`;
    if (DETAILED_TOC[tocKey]) {
      const toc = DETAILED_TOC[tocKey];
      const tocBaseUrl = toc.BASE_URL || toc.url || '';
      const tocSections = toc.SECTIONS || toc.tocSections || [];
      return res.json({
        jurisdiction,
        law,
        title: law ? law.name : (toc.name || lawKey),
        sub: law ? law.desc : (toc.officialName || ''),
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
      jurisdiction, law,
      title: lawKey === 'const' ? db.constTitle : law.name,
      sub: lawKey === 'const' ? db.constSub : law.desc,
      official: db.official,
      officialName: db.officialName,
      fullyIndexed: isFullyIndexed,
    };

    if (!niaConfigured()) {
      return res.json({ ...baseResponse, sections: db.const || [], niaUsed: false });
    }

    const subtopics = SUBTOPICS_BY_LAW_KEY[lawKey] || [`${law.name} asosiy moddalar tuzilishi`];
    const queries = subtopics.map((topic) => `${law.name} ${db.name} ${topic}`);

    const results = await Promise.all(
      queries.map((q) => searchForJurisdiction(q, jurisdiction).catch(() => null))
    );

    const seenTexts = new Set();
    const allChunks = [];
    results.forEach((result, topicIdx) => {
      if (!result || !result.chunks.length) return;
      result.chunks.forEach((chunk) => {
        const key = chunk.text.slice(0, 100);
        if (seenTexts.has(key)) return;
        seenTexts.add(key);
        allChunks.push({ ...chunk, topicLabel: subtopics[topicIdx] });
      });
    });

    if (!allChunks.length) {
      return res.json({
        ...baseResponse,
        sections: db.const || [],
        niaUsed: false,
        notice: isFullyIndexed
          ? "Bu kodeks bo'yicha hozircha qidiruv natija bermadi. Rasmiy manbadan to'liq matnni ko'rishingiz mumkin."
          : `Bu yurisdiksiya (${db.name}) hali Nia qidiruv tizimida to'liq indekslanmagan.`,
      });
    }

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

    const notice = !isFullyIndexed
      ? `DIQQAT: ${db.name} hali Nia qidiruv tizimida TO'LIQ indekslanmagan.`
      : null;

    res.json({ ...baseResponse, sections, niaUsed: true, notice, chunksFound: allChunks.length });
  } catch (e) {
    console.error('[catalog/laws] xato:', e);
    res.status(500).json({ error: "Qonun ma'lumotini yuklashda kutilmagan xato yuz berdi" });
  }
});

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
      ? "Qonunlar, Prezident hujjatlari va Hukumat qarorlari ro'yxati bosqichma-bosqich to'ldirilmoqda."
      : `${db.name} uchun kategoriyalangan qonunlar ro'yxati hali tayyorlanmagan.`,
  });
});

const ARTICLE_CACHE = new Map();
const ARTICLE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

router.get('/laws/:jurisdiction/:lawKey/article/:articleNo', async (req, res) => {
  try {
    const { jurisdiction, lawKey, articleNo } = req.params;
    const db = LEGAL_DB[jurisdiction];
    if (!db) return res.status(404).json({ error: 'Yurisdiksiya topilmadi' });

    const law = db.laws.find((l) => l.key === lawKey);
    const tocKey = `${jurisdiction}_${lawKey}`;
    const toc = DETAILED_TOC[tocKey];

    const lawName = law ? law.name : (toc ? (toc.officialName || toc.name || lawKey) : lawKey);
    const lawUrl = law ? law.url : (toc ? (toc.BASE_URL || toc.url || db.official) : db.official);

    const cacheKey = `${jurisdiction}_${lawKey}_${articleNo}`;
    const cached = ARTICLE_CACHE.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json({ ...cached.data, fromCache: true });
    }

    if (!niaConfigured()) {
      return res.json({
        found: false,
        notice: "Jonli qidiruv hozircha sozlanmagan -- to'liq matnni rasmiy manbadan ko'ring.",
        officialUrl: lawUrl,
      });
    }

    const query = `${lawName} ${db.name} ${articleNo}-modda`;
    const result = await searchForJurisdiction(query, jurisdiction).catch(() => null);

    if (!result || !result.chunks.length) {
      return res.json({
        found: false,
        notice: `${articleNo}-modda matni topilmadi -- rasmiy manbadan ko'ring.`,
        officialUrl: lawUrl,
      });
    }

    // 1-QADAM: BARCHA noto'g'ri chunk'larni olib tashlaymiz
    const cleanChunks = result.chunks.filter(c => isGoodContent(c.text));

    if (!cleanChunks.length) {
      return res.json({
        found: false,
        notice: `${articleNo}-modda matni ishonchli manbada topilmadi. Rasmiy saytdan ko'ring.`,
        officialUrl: lawUrl,
      });
    }

    // 2-QADAM: Ishonchli domendan kelganlarni afzal ko'ramiz
    const trustedChunks = cleanChunks.filter(c => TRUSTED_LAW_DOMAINS.test(c.source || ''));
    const candidateChunks = trustedChunks.length > 0 ? trustedChunks : cleanChunks;

    // 3-QADAM: Aniq modda raqami bo'lgan chunk'ni qidiramiz
    const exact = candidateChunks.find(c =>
      new RegExp(`\\b${articleNo}\\s*-?\\s*modda`, 'i').test(c.text)
    );
    const chosen = exact || candidateChunks[0];

    const safeSource = TRUSTED_LAW_DOMAINS.test(chosen.source || '') ? chosen.source : lawUrl;

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
