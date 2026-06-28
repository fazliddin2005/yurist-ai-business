// caseSummarizer.js
// ============================================================================
// "ISH" (CASE) uchun avtomatik xulosa yangilash mexanizmi -- AI Associate
// funksiyasining markazi. Har safar ishga yangi hodisa (xabar, hujjat,
// audit) qo'shilganda, bu modul AI orqali ESKI XULOSA + YANGI HODISA asosida
// YANGI, QISQA xulosani generatsiya qiladi.
//
// NEGA BUTUN TARIXNI EMAS, FAQAT XULOSANI SAQLAYMIZ:
//   - Xarajat: oylar davomidagi yuzlab xabarni har safar AI'ga yuborish
//     OpenAI tokenlarini behuda sarflaydi.
//   - Tezlik: qisqa xulosa AI javobini tezlashtiradi.
//   - Sifat: AI uzun, tarqoq tarixdan ko'ra, aniq xulosadan yaxshiroq
//     foydalanadi (LLM'lar uchun ma'lum cheklov -- "lost in the middle").
//
// XAVFSIZLIK: xulosa generatsiyasi xato bersa (OpenAI mavjud bo'lmasa va
// h.k.), oddiy "qo'shimcha qator" usuliga tushib qolamiz -- funksiya
// HECH QACHON asosiy oqimni (chat javobi, hujjat saqlash) to'xtatib qo'ymaydi.
// ============================================================================

const MAX_SUMMARY_WORDS = 600; // xulosa shu hajmdan oshmasligi kerak

/**
 * Eski xulosa + yangi hodisa asosida yangi, qisqa xulosa generatsiya qiladi.
 * OpenAI mavjud bo'lmasa, oddiy qo'shish usuliga o'tadi (fallback).
 *
 * @param {object} params
 * @param {string} params.oldSummary - ishning hozirgi xulosasi (bo'sh bo'lishi mumkin)
 * @param {string} params.newEventText - yangi hodisa matni (masalan oxirgi savol-javob)
 * @param {string} params.caseTitle - ish nomi (kontekst uchun)
 * @returns {Promise<string>} - yangilangan, qisqa xulosa
 */
async function updateCaseSummary({ oldSummary, newEventText, caseTitle }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // FALLBACK: AI mavjud bo'lmasa, oddiy qator qo'shamiz va hajmni cheklaymiz.
    return fallbackAppendSummary(oldSummary, newEventText);
  }

  try {
    const prompt = `Sen huquqiy ish (case) xulosasini yuritadigan yordamchisan.
Ish nomi: "${caseTitle}"

ESKI XULOSA (ishning hozirgi holati):
${oldSummary || '(hali xulosa yo\'q -- bu ishning birinchi hodisasi)'}

YANGI HODISA (shu yaqinda sodir bo'lgan):
${newEventText}

VAZIFA: yuqoridagi eski xulosa va yangi hodisani birlashtirib, ishning YANGI,
QISQA (${MAX_SUMMARY_WORDS} so'zdan oshmaydigan) xulosasini yoz. Xulosada:
- Asosiy faktlar va tomonlar
- Hozirgача nima muhokama qilingani / nima qilingani
- Qolgan ochiq savollar yoki keyingi qadamlar
Faqat xulosa matnini yoz, hech qanday qo'shimcha izoh yoki sarlavha qo'shma.`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 700,
      }),
    });

    if (!resp.ok) throw new Error(`OpenAI ${resp.status}`);
    const data = await resp.json();
    const newSummary = data.choices?.[0]?.message?.content?.trim();
    if (!newSummary) throw new Error('Bo\'sh javob');

    return newSummary;
  } catch (e) {
    console.error('[caseSummarizer] AI xulosa yangilashda xato, fallback ishlatiladi:', e.message);
    return fallbackAppendSummary(oldSummary, newEventText);
  }
}

/**
 * AI mavjud bo'lmaganda ishlatiladigan oddiy usul: yangi hodisani qatorga
 * qo'shadi, agar hajm chegaradan oshsa, eng eski qismini qisqartiradi.
 */
function fallbackAppendSummary(oldSummary, newEventText) {
  const combined = oldSummary ? `${oldSummary}\n\n• ${newEventText}` : `• ${newEventText}`;
  const words = combined.split(/\s+/);
  if (words.length <= MAX_SUMMARY_WORDS) return combined;
  // Eng oxirgi MAX_SUMMARY_WORDS so'zni saqlaymiz (eng yangi ma'lumot muhimroq)
  return '...' + words.slice(-MAX_SUMMARY_WORDS).join(' ');
}

module.exports = { updateCaseSummary, MAX_SUMMARY_WORDS };
