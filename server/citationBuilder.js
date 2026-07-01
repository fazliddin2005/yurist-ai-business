// citationBuilder.js
// ============================================================================
// MULTI-SOURCE CONTEXT -- Nia'dan kelgan xom matnni (chunk) tegishli davlat
// va kodeks ma'lumotlari bilan bog'lab, foydalanuvchiga aniq, tekshirilishi
// mumkin bo'lgan iqtibos (citation) ko'rinishida taqdim etadi:
//
//   "Manba: O‘zbekiston, Mehnat kodeksi, 153-modda"
//
// Bu band Nia'ning xom matnini olib, ichidan modda raqamini (agar bor bo'lsa)
// va kodeks turini aniqlab, yurisdiksiya nomi bilan birga formatlaydi.
// ============================================================================
const { LEGAL_DB } = require('./legalData');

// Nia matnida kodeks turi qaysi kalit so'zlar orqali aniqlanadi (har bir
// davlat o'z kodekslarining LEGAL_DB'dagi `laws[].name` qiymatlariga mos
// kalit so'zlarni o'z ichiga oladi -- shuning uchun har bir tilda ishlaydi).
const CODEX_KEYWORD_MAP = {
  civil: [/fuqarolik/i, /civil/i, /азаматтық/i, /граждан/i, /гражданский/i],
  crim: [/jinoyat/i, /qylmys/i, /крим/i, /уголов/i, /jeza/i],
  labor: [/mehnat/i, /eňbek/i, /enbek/i, /labor/i, /труд/i],
  tax: [/soliq/i, /salyq/i, /tax/i, /налог/i],
  family: [/oila/i, /отбасы/i, /nika/i, /никах/i, /family/i, /брач/i, /сем(?:ья|ейн)/i],
  admin: [/ma'?muriy/i, /admin/i, /әкімшілік/i],
  land: [/\byer\b/i, /жер/i, /land/i, /земел/i],
  const: [/konstitutsiya/i, /constitution/i, /конституц/i],
};

// Modda/band raqamini matndan ajratib oluvchi naqshlar -- "153-modda",
// "Статья 153", "Article 153", "153-бап" kabi ko'p tilli formatlarni qoplaydi.
const ARTICLE_PATTERNS = [
  /(\d+[\-–]?\s*modda)/i,
  /(статья\s*\d+)/i,
  /(article\s*\d+)/i,
  /(\d+[\-–]?\s*бап)/i,
  /(\d+[\-–]?\s*модда)/i,
];

/**
 * Matndan kodeks turini (CODEX_KEYWORD_MAP kalitlaridan biri) aniqlaydi.
 * @returns {string|null} - masalan 'labor', 'civil' va h.k.
 */
function detectCodexType(text) {
  if (!text) return null;
  for (const [key, patterns] of Object.entries(CODEX_KEYWORD_MAP)) {
    if (patterns.some((re) => re.test(text))) return key;
  }
  return null;
}

/**
 * Matndan modda/band raqamini ajratib oladi (agar topilsa).
 * @returns {string|null}
 */
function detectArticleNumber(text) {
  if (!text) return null;
  for (const pattern of ARTICLE_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

/**
 * Berilgan yurisdiksiya va kodeks turi uchun LEGAL_DB'dan rasmiy kodeks
 * nomini topadi (masalan 'UZ' + 'labor' -> "Mehnat kodeksi").
 */
function getCodexName(jurisdictionCode, codexType) {
  const juris = LEGAL_DB[jurisdictionCode];
  if (!juris || !codexType) return null;
  const law = (juris.laws || []).find((l) => l.key === codexType);
  return law ? law.name : null;
}

/**
 * Bitta Nia chunk'ini to'liq iqtibos obyektiga aylantiradi.
 *
 * @param {{text: string, source: string}} chunk - Nia'dan kelgan bir bo'lak
 * @param {string} jurisdictionCode - masalan 'UZ', 'TJ'
 * @returns {{
 *   countryName: string,
 *   codexName: string|null,
 *   articleNumber: string|null,
 *   sourceUrl: string,
 *   excerpt: string,
 *   citationText: string
 * }}
 */
function buildCitation(chunk, jurisdictionCode) {
  const juris = LEGAL_DB[jurisdictionCode] || {};
  const countryName = juris.name || jurisdictionCode || 'Noma\'lum davlat';

  const codexType = detectCodexType(chunk?.text);
  const codexName = getCodexName(jurisdictionCode, codexType);
  const articleNumber = detectArticleNumber(chunk?.text);

  // Talab qilingan format: "Manba: [Davlat nomi], [Kodeks nomi], [Modda] (Havola: [URL])"
  // Kodeks yoki modda topilmasa, shu qismlar tushib qoladi (lekin davlat
  // nomi har doim bo'ladi). MUHIM: havola (sourceUrl) ALBATTA citationText
  // ichiga qo'shiladi -- aks holda bu maydon faqat hisoblab chiqiladi-yu,
  // hech qayerga yuborilmay, AI uni hech qachon ko'rmay qoladi (bu xato
  // ilgari mavjud edi: AI javobida lex.uz havolasi umuman chiqmasdi).
  const parts = [countryName];
  if (codexName) parts.push(codexName);
  if (articleNumber) parts.push(articleNumber);
  const sourceUrl = chunk?.source || juris.officialName || '';

  let citationText = `Manba: ${parts.join(', ')}`;
  if (sourceUrl) citationText += ` (Havola: ${sourceUrl})`;

  return {
    countryName,
    codexName: codexName || null,
    articleNumber: articleNumber || null,
    sourceUrl,
    excerpt: (chunk?.text || '').slice(0, 300),
    citationText,
  };
}

/**
 * Nia'dan kelgan barcha chunk'larni iqtibos ro'yxatiga aylantiradi.
 * Xato/bo'sh kirish bo'lsa, bo'sh massiv qaytaradi (chaqiruvchi tomonni
 * buzmasligi uchun).
 *
 * @param {Array<{text:string, source:string}>} chunks
 * @param {string} jurisdictionCode
 * @returns {Array} - buildCitation() natijalari ro'yxati
 */
function buildCitations(chunks, jurisdictionCode) {
  if (!Array.isArray(chunks)) return [];
  return chunks
    .filter((c) => c && c.text)
    .map((c) => buildCitation(c, jurisdictionCode));
}

module.exports = { buildCitation, buildCitations, detectCodexType, detectArticleNumber, getCodexName };
