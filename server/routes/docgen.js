// routes/docgen.js
// AI orqali erkin so'rovdan hujjat (shartnoma) yaratish. Foydalanuvchi tayyor
// shablon tanlamasdan, oddiy til bilan "menga ... kerak" deb yozsa, AI
// professional shartnoma matnini to'liq band-bandlar bilan tuzib beradi.
// Bu B2C "Hujjat yaratish" sahifasidagi suhbat oynasi uchun backend.
const express = require('express');
const { requireAuth } = require('./auth');
const users = require('./users');

const router = express.Router();
const CREDIT_COST = 1;

const LANG_NAMES = {
  uz: "o'zbek", ru: 'rus', en: 'ingliz', kk: 'qozoq', ky: "qirg'iz",
  tg: 'tojik', tk: 'turkman', az: 'ozarbayjon',
};

function buildPrompt(lang) {
  const langName = LANG_NAMES[lang] || "o'zbek";
  return `Sen "Yurist AI" -- yuridik hujjat (shartnoma) tuzish bo'yicha mutaxassissan.

VAZIFA: Foydalanuvchi qaysi turdagi shartnoma/hujjat kerak ekanini oddiy tilda tasvirlab beradi
(masalan: "ikki kompaniya orasida dasturiy ta'minot ishlab chiqish bo'yicha shartnoma kerak").
Sen shu tasvirga asoslanib, TO'LIQ, PROFESSIONAL, BAND-BANDLI shartnoma matnini tuzasan.

TIL QOIDASI -- JUDA MUHIM:
Foydalanuvchi ilovada ${langName} tilini tanlagan. HUJJAT MATNI VA BARCHA IZOHLARING FAQAT
${langName.toUpperCase()} TILIDA bo'lishi SHART, foydalanuvchi so'rovni qaysi tilda yozganiga qaramasdan.

HUJJAT TUZILISHI (har doim shunga amal qil):
1. Sarlavha (hujjat nomi, katta harflar bilan)
2. "№ ___" va sana/joy qatori
3. "1. TOMONLAR" bo'limi -- agar foydalanuvchi tomon nomlarini bermagan bo'lsa, "________________" bilan bo'sh joy qoldir
4. "2. SHARTNOMA PREDMETI" -- nima haqida ekanini batafsil yoz
5. Tegishli bo'limlar: narx/to'lov, muddat, tomonlarning huquq-majburiyatlari, javobgarlik, bekor qilish tartibi
6. "YAKUNIY QOIDALAR" -- nizolarni hal qilish, nusxalar soni
7. Imzo joylari (ikki tomon uchun, manzil/pasport/imzo uchun bo'sh joy bilan)

QOIDALAR:
- Faqat huquqiy hujjat so'rovlariga javob ber. Agar so'rov hujjat/shartnoma bilan bog'liq bo'lmasa
  (masalan boshqa mavzudagi savol), xushmuomalalik bilan rad et va hujjat tasvirlab berishni so'ra.
- Agar so'rov juda noaniq bo'lsa (masalan faqat "shartnoma" deb yozilgan bo'lsa), eng keng tarqalgan
  shartnoma turini taxmin qilib, to'liq matn tuz -- savol berib vaqt yo'qotma.
- Javobingda FAQAT hujjat matnini yoz, hech qanday qo'shimcha izoh, salomlashish yoki "mana sizning hujjatingiz"
  kabi gaplar yozma -- to'g'ridan-to'g'ri hujjat sarlavhasidan boshla.
- Markdown belgilarini (masalan **, ##, va h.k.) ishlatma -- faqat oddiy matn.`;
}

// POST /api/docgen/generate  { description, lang }
router.post('/generate', requireAuth, async (req, res) => {
  const { description, lang } = req.body;
  if (!description || !description.trim()) {
    return res.status(400).json({ error: "Hujjat tasvirini kiriting" });
  }

  const user = req.user;
  if (user.credits < CREDIT_COST) {
    return res.status(402).json({ error: 'Kredit yetarli emas', code: 'NO_CREDITS' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "AI hujjat generatori hozircha ulanmagan (.env faylida OPENAI_API_KEY kerak). Tayyor shablonlardan foydalaning.",
      code: 'AI_NOT_CONFIGURED',
    });
  }

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: buildPrompt(lang) },
          { role: 'user', content: description },
        ],
        max_tokens: 1500,
      }),
    });
    if (!resp.ok) {
      const errBody = await resp.text().catch(() => '');
      throw new Error(`OpenAI ${resp.status}: ${errBody.slice(0, 200)}`);
    }
    const data = await resp.json();
    const generatedText = data.choices?.[0]?.message?.content;
    if (!generatedText) throw new Error('AI bo\'sh javob qaytardi');

    users.adjustCredits(user.id, -CREDIT_COST);

    // Sarlavhani matnning birinchi qatoridan ajratib olamiz (hujjat nomi sifatida ishlatish uchun)
    const firstLine = generatedText.split('\n').find((l) => l.trim().length > 0) || 'Hujjat';
    const title = firstLine.trim().slice(0, 80);

    res.json({
      title,
      generatedText,
      creditsLeft: user.credits - CREDIT_COST,
    });
  } catch (e) {
    console.error('[docgen] xato:', e.message);
    res.status(500).json({ error: "Hujjat yaratishda xato yuz berdi. Qaytadan urinib ko'ring." });
  }
});

module.exports = router;
