// accuracyMetrics.js
// ============================================================================
// ANIQLIK METRIKASI -- RAGAS (Retrieval-Augmented Generation Assessment)
// metodologiyasiga asoslangan, soddalashtirilgan baholash tizimi.
//
// RAGAS odatda Python kutubxonasi sifatida ishlatiladi va alohida "judge"
// LLM chaqiruvi talab qiladi -- bu xarajatli va sekin. Bizning yondashuvimiz:
// RAGAS'ning ASOSIY G'OYALARINI (quyida) Node.js'da, kichik AI chaqiruv
// bilan amalga oshiramiz:
//
//   1) FAITHFULNESS (ishonchlilik) -- AI javobi MANBA MATNIGA qancha mos
//      keladi? Agar AI manbada yo'q narsani "to'qib chiqargan" bo'lsa, bu
//      past ball oladi.
//   2) ANSWER RELEVANCY (javobning mosligi) -- AI javobi savolga qancha
//      mos keladi (savoldan chetga chiqmasdan)?
//   3) CONTEXT PRECISION (kontekst aniqligi) -- Nia orqali topilgan manba
//      matni savolga qancha aloqador edi (keraksiz/aloqasiz parcha
//      topilmaganmi)?
//
// Har bir AI javobi uchun bu 3 ko'rsatkich hisoblanadi va saqlanadi --
// admin panelda VAQT DAVOMIDA tizim sifatini kuzatish imkonini beradi.
// ============================================================================
const AccuracyScore = require('./models/AccuracyScore');

/**
 * AI javobini baholaydi -- kichik, alohida AI chaqiruv orqali (judge LLM
 * naqshi, RAGAS'dagi kabi). Agar OpenAI mavjud bo'lmasa, baholash
 * o'tkazib yuboriladi (null qaytaradi) -- bu ASOSIY oqimni HECH QACHON
 * to'xtatmaydi, chunki baholash ikkinchi darajali, fon vazifasi.
 *
 * @param {object} params
 * @param {string} params.question - foydalanuvchi savoli
 * @param {string} params.answer - AI javobi
 * @param {string} params.contextText - Nia orqali topilgan manba matni (bo'lishi mumkin bo'sh)
 * @returns {Promise<{faithfulness:number, answerRelevancy:number, contextPrecision:number}|null>}
 *   Har bir ko'rsatkich 0-100 oralig'ida (RAGAS odatda 0-1 ishlatadi, biz
 *   foiz sifatida saqlaymiz, chunki admin panelda ko'rsatish uchun qulayroq).
 */
async function evaluateResponse({ question, answer, contextText }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null; // baholovchi AI yo'q -- baholashsiz davom etamiz

  try {
    const judgePrompt = `Sen huquqiy AI javoblarini RAGAS metodologiyasi asosida baholaydigan
mustaqil "judge" (hakam) tizimsisan. Quyidagi 3 ko'rsatkichni 0 dan 100 gacha baho ber:

1. FAITHFULNESS (ishonchlilik) -- Javob MANBA MATNIGA qanchalik mos keladi?
   Agar manba matnda yo'q narsa "to'qib chiqarilgan" bo'lsa, past ball ber.
   Agar manba matni berilmagan bo'lsa, 50 ball ber (neytral, baholab bo'lmaydi).

2. ANSWER_RELEVANCY (javobning mosligi) -- Javob savolga to'g'ridan-to'g'ri
   javob beradimi, yoki chetga chiqib ketganmi?

3. CONTEXT_PRECISION (kontekst aniqligi) -- Agar manba matni berilgan bo'lsa,
   u savolga qanchalik aloqador edi? Manba bo'lmasa, 50 ball ber.

SAVOL: ${question}

MANBA MATNI: ${contextText || '(manba berilmagan)'}

JAVOB: ${answer}

FAQAT shu formatda javob ber, hech qanday qo'shimcha so'z yozma:
FAITHFULNESS: <raqam>
ANSWER_RELEVANCY: <raqam>
CONTEXT_PRECISION: <raqam>`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: judgePrompt }],
        max_tokens: 100,
        temperature: 0, // baholash izchil bo'lishi uchun
      }),
    });
    if (!resp.ok) throw new Error(`OpenAI ${resp.status}`);
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || '';

    const faithfulness = parseScore(text, 'FAITHFULNESS');
    const answerRelevancy = parseScore(text, 'ANSWER_RELEVANCY');
    const contextPrecision = parseScore(text, 'CONTEXT_PRECISION');

    if (faithfulness === null || answerRelevancy === null || contextPrecision === null) {
      throw new Error('Judge javobini pars qilib bo\'lmadi');
    }

    return { faithfulness, answerRelevancy, contextPrecision };
  } catch (e) {
    console.error('[accuracyMetrics] baholashda xato:', e.message);
    return null;
  }
}

function parseScore(text, label) {
  const match = text.match(new RegExp(`${label}:\\s*(\\d+)`, 'i'));
  if (!match) return null;
  const num = parseInt(match[1], 10);
  if (isNaN(num) || num < 0 || num > 100) return null;
  return num;
}

/**
 * Baholash natijasini saqlaydi -- "fire and forget" tarzida chaqirilishi
 * tavsiya etiladi (asosiy chat javobini kutdirib qo'ymaslik uchun).
 */
async function recordAccuracyScore({ scope, userId, organizationId, jurisdictionId, scores, hadContext }) {
  if (!scores) return; // baholanmagan bo'lsa, saqlamaymiz
  try {
    await AccuracyScore.create({
      scope, userId: userId || null, organizationId: organizationId || null,
      jurisdictionId: jurisdictionId || 'UZ',
      faithfulness: scores.faithfulness,
      answerRelevancy: scores.answerRelevancy,
      contextPrecision: scores.contextPrecision,
      hadContext: !!hadContext,
    });
  } catch (e) {
    console.error('[accuracyMetrics] saqlashda xato:', e.message);
  }
}

/**
 * Admin panel uchun -- so'nggi N kun ichidagi o'rtacha ko'rsatkichlarni
 * hisoblaydi (umumiy va yurisdiksiya bo'yicha).
 */
async function getAccuracyOverview(sinceDate) {
  const scores = await AccuracyScore.find({ createdAt: { $gte: sinceDate } });
  if (!scores.length) {
    return {
      count: 0, avgFaithfulness: null, avgAnswerRelevancy: null, avgContextPrecision: null,
      byJurisdiction: {}, withContext: { count: 0 }, withoutContext: { count: 0 },
    };
  }
  const avg = (arr, key) => Math.round(arr.reduce((s, r) => s + r[key], 0) / arr.length);

  const byJurisdiction = {};
  scores.forEach((s) => {
    const j = s.jurisdictionId || 'UZ';
    if (!byJurisdiction[j]) byJurisdiction[j] = { count: 0, totalFaithfulness: 0, totalRelevancy: 0, totalPrecision: 0 };
    byJurisdiction[j].count++;
    byJurisdiction[j].totalFaithfulness += s.faithfulness;
    byJurisdiction[j].totalRelevancy += s.answerRelevancy;
    byJurisdiction[j].totalPrecision += s.contextPrecision;
  });
  Object.keys(byJurisdiction).forEach((j) => {
    const d = byJurisdiction[j];
    d.avgFaithfulness = Math.round(d.totalFaithfulness / d.count);
    d.avgAnswerRelevancy = Math.round(d.totalRelevancy / d.count);
    d.avgContextPrecision = Math.round(d.totalPrecision / d.count);
    delete d.totalFaithfulness; delete d.totalRelevancy; delete d.totalPrecision;
  });

  // DIAGNOSTIKA: manba TOPILGAN va TOPILMAGAN holatlarni alohida ko'rsatamiz.
  // Bu admin uchun juda muhim -- agar "withoutContext" ko'rsatkichlari ham
  // past bo'lsa, bu standart 50% neytral qiymat (Nia manba topa olmagani),
  // HAQIQIY past sifat emas. Faqat "withContext" past bo'lsa, bu AI/Nia
  // sifatida real muammo borligini bildiradi.
  const withContextScores = scores.filter((s) => s.hadContext);
  const withoutContextScores = scores.filter((s) => !s.hadContext);

  return {
    count: scores.length,
    avgFaithfulness: avg(scores, 'faithfulness'),
    avgAnswerRelevancy: avg(scores, 'answerRelevancy'),
    avgContextPrecision: avg(scores, 'contextPrecision'),
    byJurisdiction,
    withContext: withContextScores.length
      ? {
          count: withContextScores.length,
          avgFaithfulness: avg(withContextScores, 'faithfulness'),
          avgAnswerRelevancy: avg(withContextScores, 'answerRelevancy'),
          avgContextPrecision: avg(withContextScores, 'contextPrecision'),
        }
      : { count: 0 },
    withoutContext: withoutContextScores.length
      ? {
          count: withoutContextScores.length,
          avgFaithfulness: avg(withoutContextScores, 'faithfulness'),
          avgAnswerRelevancy: avg(withoutContextScores, 'answerRelevancy'),
          avgContextPrecision: avg(withoutContextScores, 'contextPrecision'),
        }
      : { count: 0 },
  };
}

module.exports = { evaluateResponse, recordAccuracyScore, getAccuracyOverview };
