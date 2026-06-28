// jurisdictionRouter.js
// ============================================================================
// JURISDICTION ROUTER -- foydalanuvchi savoli/tanlovi asosida qaysi davlat
// qonunchiligidan (va shu davlatning Nia'dagi manbasidan) qidirish kerakligini
// aniqlaydi.
//
// ISHLASH TARTIBI:
//   1. Agar foydalanuvchi ANIQ yurisdiksiya tanlagan bo'lsa (masalan UI'dagi
//      davlat tanlovi), shu YETARLI -- to'g'ridan-to'g'ri shu davlat ishlatiladi.
//   2. Agar yurisdiksiya berilmagan/noaniq bo'lsa, savol matnidan davlat
//      nomini, valyutasini yoki kalit so'zlarini aniqlab, AVTOMATIK taxmin
//      qilinadi (masalan "Tojikistonda" so'zi -> TJ).
//   3. Hech narsa aniqlanmasa, standart yurisdiksiya (UZ) ishlatiladi.
// ============================================================================
const { LEGAL_DB, JURIS_ORDER } = require('./legalData');

// Har bir yurisdiksiya uchun avtomatik aniqlash kalit so'zlari (savol matnida
// davlat nomi to'g'ridan-to'g'ri aytilganda ishlaydi). Bu LEGAL_DB'dagi nomdan
// tashqari, so'zlashuvda ko'p ishlatiladigan shakllarni ham o'z ichiga oladi.
const DETECTION_KEYWORDS = {
  UZ: [/o'zbek/i, /ozbek/i, /узбек/i, /tashkent/i, /toshkent/i, /lex\.uz/i],
  KZ: [/qozoq/i, /qazaq/i, /казах/i, /almaty/i, /astana/i, /adilet\.zan\.kz/i],
  KG: [/qirg'iz/i, /qirgiz/i, /kyrgyz/i, /кырг/i, /bishkek/i, /cbd\.minjust\.gov\.kg/i],
  TJ: [/tojik/i, /tajik/i, /тадж/i, /dushanbe/i, /mmk\.tj/i],
  TM: [/turkman/i, /turkmen/i, /туркм/i, /ashgabat/i, /ashxabad/i, /minjust\.gov\.tm/i],
  RU: [/rossiya/i, /rusiya/i, /рос(?!\w*tov)/i, /moskva/i, /москва/i, /pravo\.gov\.ru/i],
  AZ: [/ozarbayjon/i, /azerbaijan/i, /азерб/i, /baku/i, /baki/i, /e-qanun\.az/i],
  US: [/amerika/i, /aqsh\b/i, /usa\b/i, /united states/i, /congress\.gov/i],
};

const DEFAULT_JURISDICTION = 'UZ';

function isValidJurisdiction(code) {
  return !!code && Object.prototype.hasOwnProperty.call(LEGAL_DB, code);
}

/**
 * Savol matnidan yurisdiksiyani avtomatik taxmin qiladi.
 * @param {string} text - foydalanuvchi savoli yoki hujjat matni
 * @returns {string|null} - topilgan yurisdiksiya kodi yoki null
 */
function detectJurisdictionFromText(text) {
  if (!text) return null;
  for (const [code, patterns] of Object.entries(DETECTION_KEYWORDS)) {
    if (patterns.some((re) => re.test(text))) return code;
  }
  return null;
}

/**
 * Asosiy router funksiyasi: aniq tanlovni ustun qo'yadi, bo'lmasa matndan
 * taxmin qiladi, hech narsa topilmasa standart qiymatga qaytadi.
 *
 * @param {object} params
 * @param {string} [params.explicitJurisdiction] - UI'dan kelgan aniq tanlov (masalan req.body.jurisdiction)
 * @param {string} [params.queryText] - savol/hujjat matni (avtomatik aniqlash uchun)
 * @returns {{ code: string, source: 'explicit'|'detected'|'default', meta: object }}
 */
function routeJurisdiction({ explicitJurisdiction, queryText } = {}) {
  if (isValidJurisdiction(explicitJurisdiction)) {
    return { code: explicitJurisdiction, source: 'explicit', meta: LEGAL_DB[explicitJurisdiction] };
  }

  const detected = detectJurisdictionFromText(queryText);
  if (isValidJurisdiction(detected)) {
    return { code: detected, source: 'detected', meta: LEGAL_DB[detected] };
  }

  return { code: DEFAULT_JURISDICTION, source: 'default', meta: LEGAL_DB[DEFAULT_JURISDICTION] };
}

/**
 * Berilgan yurisdiksiya kodi uchun kodeks ro'yxatini (nomlari, kalitlari)
 * qaytaradi -- bu Nia natijasini kodeks moddasiga bog'lashda ishlatiladi
 * (qarang: citationBuilder.js).
 */
function getCodexList(jurisdictionCode) {
  const juris = LEGAL_DB[jurisdictionCode];
  if (!juris) return [];
  return juris.laws || [];
}

module.exports = {
  routeJurisdiction,
  detectJurisdictionFromText,
  isValidJurisdiction,
  getCodexList,
  DEFAULT_JURISDICTION,
};
