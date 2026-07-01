// openaiSearch.js -- Nia hech narsa topa olmaganda ishlatiladigan ZAXIRA qidiruv.
//
// MUHIM, HALOL ESLATMA: bu modul OpenAI'ning Responses API'si (web_search
// vositasi bilan) orqali real internet qidiruvini ishlatadi. Bu funksiya
// LOYIHA MUALLIFI tomonidan JONIY API kalit bilan SINALMAGAN (sandbox
// muhitida tashqi internetga OpenAI orqali chiqish imkoni yo'q edi) --
// shuning uchun har bir qadam JUDA EHTIYOTKORLIK bilan, kutilmagan javob
// shakli kelsa ham ilova BUZILMASLIGI uchun yozilgan. Agar bu funksiya
// ishlamasa (masalan API javob shakli o'zgargan bo'lsa), u shunchaki
// `null` qaytaradi -- chaqiruvchi tomon (chat.js) avtomatik ravishda eski,
// sinab ko'rilgan yo'lga (manbasiz, lekin to'liq javob) qaytadi. Hech qachon
// xato tashlamaydi, hech qachon butun so'rovni to'xtatmaydi.
//
// Foydalanuvchi DEPLOY qilgandan keyin buni albatta real savol bilan sinab
// ko'rishi va agar havola chiqmasa, konsol logini (console.error chiqishi)
// tekshirib, kerak bo'lsa OpenAI'ning eng so'nggi Responses API hujjatiga
// qarab moslashtirish kerak bo'lishi mumkin.

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const TIMEOUT_MS = 6000;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/**
 * OpenAI'ning real-vaqtli veb-qidiruv vositasi orqali savolga javob va
 * tasdiqlangan manba havolalarini topishga harakat qiladi.
 *
 * @param {string} query - foydalanuvchi savoli (yoki qidiruv uchun qisqartirilgan versiyasi)
 * @param {string} langName - javob qaysi tilda kerakligi (masalan "o'zbek")
 * @returns {Promise<{text: string, urls: string[]}|null>}
 */
async function searchViaOpenAI(query, langName) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const resp = await withTimeout(
      fetch(OPENAI_RESPONSES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          tools: [{ type: 'web_search' }],
          input: `${langName} tilida, O'zbekiston yoki Markaziy Osiyo huquqi bo'yicha quyidagi savolga rasmiy manba (masalan lex.uz) asosida qisqa javob top: ${query}`,
        }),
      }),
      TIMEOUT_MS
    );
    if (!resp || !resp.ok) return null;

    const data = await resp.json();
    if (!data || !Array.isArray(data.output)) return null;

    let text = '';
    const urls = [];
    for (const item of data.output) {
      if (item?.type !== 'message' || !Array.isArray(item.content)) continue;
      for (const c of item.content) {
        if (c?.type === 'output_text' && typeof c.text === 'string') {
          text += c.text;
          if (Array.isArray(c.annotations)) {
            for (const ann of c.annotations) {
              const url = ann?.url || ann?.url_citation?.url;
              if (url && typeof url === 'string') urls.push(url);
            }
          }
        }
      }
    }

    if (!text.trim()) return null;
    return { text: text.trim(), urls: [...new Set(urls)] };
  } catch (e) {
    console.error('[openaiSearch] Zaxira qidiruvda xato (xavfsiz e\'tiborsiz qoldiriladi):', e.message);
    return null;
  }
}

module.exports = { searchViaOpenAI };
