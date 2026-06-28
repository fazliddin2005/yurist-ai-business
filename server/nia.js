// nia.js -- Nia (Nozomio Labs) API bilan ishlash uchun yordamchi modul.
// Nia -- foydalanuvchi tomonidan indekslangan rasmiy huquqiy saytlardan (lex.uz,
// pravo.gov.ru va h.k.) aniq, manbaga asoslangan matn qaytaradigan qidiruv qatlami.
// Bu Yurist AI'ning javoblarini "taxminiy" emas, balki real qonun matniga
// bog'laydi -- xuddi Tuzuk AI qilgan narsa.

const NIA_API_URL = 'https://apigcp.trynia.ai/v2/universal-search';
const NIA_TIMEOUT_MS = 5000; // 5 soniyadan ortiq kutilmaydi -- AI javobi sekinlashmasin

// Yurisdiksiya kodi -> Nia'da indekslangan domen(lar). Bu ro'yxat ilovadagi
// 8 yurisdiksiyaning rasmiy huquqiy manbalariga to'liq mos keladi
// (server/legalData.js dagi LEGAL_DB bilan bir xil saytlar).
const SOURCES_BY_JURIS = {
  UZ: ['lex.uz'],
  KZ: ['adilet.zan.kz'],
  KG: ['cbd.minjust.gov.kg'],
  TJ: ['mmk.tj'],
  TM: ['minjust.gov.tm'],
  RU: ['pravo.gov.ru'],
  AZ: ['e-qanun.az'],
  US: ['uscode.house.gov', 'congress.gov'],
};

function isConfigured() {
  return !!process.env.NIA_API_KEY;
}

/**
 * Nia javobidagi har xil shakldagi manba ma'lumotini bitta string'ga keltiradi.
 * Nia versiyasiga qarab source -- string, {url}, {domain}, {title} ko'rinishida
 * kelishi mumkin -- shularning barchasini xavfsiz qayta ishlaydi.
 */
function toSourceString(raw) {
  if (!raw) return null;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') return raw.url || raw.domain || raw.name || raw.title || null;
  return null;
}

/**
 * Nia javobidagi turli mumkin bo'lgan struktura kalitlarini (results/chunks/
 * matches) xavfsiz tarzda bitta formatga keltiradi. Har bir element kutilgan
 * shaklda bo'lmasa, shunchaki tashlab ketiladi (butun so'rovni buzmaydi).
 */
function parseNiaResponse(data, fallbackDomains) {
  if (!data || typeof data !== 'object') return [];
  const rawChunks = data.results || data.chunks || data.matches || [];
  if (!Array.isArray(rawChunks)) return [];

  return rawChunks
    .slice(0, 6)
    .map((c) => {
      if (!c || typeof c !== 'object') return null;
      const text = c.text || c.content || c.snippet || '';
      if (!text) return null;
      const src =
        toSourceString(c.source) ||
        toSourceString(c.url) ||
        toSourceString(c.metadata?.source) ||
        toSourceString(c.metadata?.url);
      return {
        text,
        source: src || (fallbackDomains && fallbackDomains[0]) || 'rasmiy manba',
      };
    })
    .filter(Boolean);
}

/**
 * Nia orqali indekslangan manbalardan qidiradi. Tarmoq xatosi, vaqt tugashi
 * (timeout) yoki kutilmagan javob shakli -- barchasi xavfsiz ushlanadi va
 * null qaytaradi, shuning uchun chaqiruvchi tomon har doim fallback rejimga
 * o'tishi mumkin (AI butunlay to'xtab qolmaydi).
 *
 * @param {string} query - qidiruv so'rovi (foydalanuvchi savoli)
 * @param {string[]} [domains] - faqat shu domenlar bo'yicha qidirish (ixtiyoriy)
 * @returns {Promise<{chunks: Array<{text:string, source:string}>, raw: any}|null>}
 */
async function searchNia(query, domains) {
  const apiKey = process.env.NIA_API_KEY;
  if (!apiKey) return null;
  if (!query || typeof query !== 'string' || !query.trim()) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NIA_TIMEOUT_MS);

  try {
    const body = { query, search_mode: 'unified' };
    if (domains && domains.length) body.sources = domains;

    const resp = await fetch(NIA_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      console.error(`[nia] So'rov muvaffaqiyatsiz: ${resp.status} ${errText.slice(0, 200)}`);
      return null;
    }

    let data;
    try {
      data = await resp.json();
    } catch (parseErr) {
      console.error('[nia] Javobni JSON sifatida o\'qishda xato:', parseErr.message);
      return null;
    }

    const chunks = parseNiaResponse(data, domains);
    return { chunks, raw: data };
  } catch (e) {
    if (e.name === 'AbortError') {
      console.error(`[nia] So'rov ${NIA_TIMEOUT_MS}ms ichida javob bermadi (timeout)`);
    } else {
      console.error('[nia] Ulanishda xato:', e.message);
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Yurisdiksiyaga mos manbalar bo'yicha qidiradi (agar mavjud bo'lsa).
 */
async function searchForJurisdiction(query, jurisdiction) {
  const domains = SOURCES_BY_JURIS[jurisdiction];
  return searchNia(query, domains);
}

// Sud amaliyoti (case law) uchun alohida domen ro'yxati -- bu odatda
// qonun matnidan FARQLI manba (masalan sud.uz, courtlistener.com).
// Faqat to'liq indekslangan 4 yurisdiksiya (UZ, RU, TJ, US) uchun mavjud.
const CASE_LAW_SOURCES_BY_JURIS = {
  UZ: ['sud.uz'],
  RU: ['pravo.gov.ru'], // Rossiyada sud qarorlari ham shu rasmiy portalda
  TJ: ['mmk.tj'],
  US: ['courtlistener.com'],
};

/**
 * Berilgan savol/vaziyat bo'yicha SUD AMALIYOTINI (court decisions, case law)
 * qidiradi -- bu oddiy qonun matnidan farqli, sudlar amalda qanday qaror
 * chiqarganini ko'rsatadi. Faqat 4 to'liq indekslangan davlat uchun ishlaydi.
 *
 * @param {string} query - vaziyat tasviri (masalan "ijara shartnomasini bekor qilish")
 * @param {string} jurisdiction - 'UZ' | 'RU' | 'TJ' | 'US'
 * @returns {Promise<{chunks: Array<{text:string, source:string}>}|null>}
 */
async function searchCaseLaw(query, jurisdiction) {
  const domains = CASE_LAW_SOURCES_BY_JURIS[jurisdiction];
  if (!domains) return null; // bu yurisdiksiya uchun sud amaliyoti manbasi yo'q
  // Qidiruv so'roviga "sud qarori", "amaliyot" kabi so'zlarni qo'shamiz --
  // shunda Nia oddiy qonun moddasi o'rniga sud qarorlariga yaqinroq natija beradi.
  const caseLawQuery = `${query} sud qarori amaliyot precedent`;
  return searchNia(caseLawQuery, domains);
}

function isCaseLawAvailable(jurisdiction) {
  return !!CASE_LAW_SOURCES_BY_JURIS[jurisdiction];
}

module.exports = {
  searchNia, searchForJurisdiction, isConfigured, SOURCES_BY_JURIS, parseNiaResponse,
  searchCaseLaw, isCaseLawAvailable, CASE_LAW_SOURCES_BY_JURIS,
};
