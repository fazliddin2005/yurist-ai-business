// routes/chat.js
// AI Yordamchi. Ish tartibi (RAG -- Retrieval-Augmented Generation):
//   1) JURISDICTION ROUTER: foydalanuvchi savoli/tanlovi asosida qaysi davlat
//      qonunchiligi kerakligi aniqlanadi (server/jurisdictionRouter.js).
//   2) Nia'dan shu davlatning manbasidan (lex.uz, pravo.gov.ru va h.k.)
//      tegishli qonun matni qidiriladi.
//   3) SUD AMALIYOTI: agar savol nizo/sud bilan bog'liq bo'lsa va shu davlat
//      uchun sud amaliyoti manbasi mavjud bo'lsa (UZ, RU, TJ, US), qonun
//      matnidan TASHQARI sud qarorlari ham qidiriladi -- bu AI javobini
//      "qonun shunday deydi" dan "sudlar amalda shunday qaror chiqaradi"
//      darajasiga ko'taradi.
//   4) MULTI-SOURCE CONTEXT: topilgan xom matn kodeks/modda bilan bog'lanib,
//      "Manba: [Davlat], [Kodeks], [Modda]" formatida iqtibosga aylantiriladi
//      (server/citationBuilder.js).
//   5) Topilgan real matn OpenAI'ga kontekst sifatida beriladi -- shunda
//      AI "taxmin qilmaydi", balki haqiqiy modda matniga asoslanadi.
//   6) OPENAI_API_KEY bo'lmasa ham, Nia natijasi (agar bo'lsa) to'g'ridan-to'g'ri
//      ko'rsatiladi; ikkisi ham yo'q bo'lsa -- oddiy qoidaga asoslangan javob.
const express = require('express');
const { searchForJurisdiction, isConfigured: niaConfigured, searchCaseLaw, isCaseLawAvailable } = require('../nia');
const { routeJurisdiction } = require('../jurisdictionRouter');
const { buildCitations } = require('../citationBuilder');
const { logActivity, ACTION_TYPES } = require('../activityLog');
const { requireAuth } = require('./auth');
const users = require('./users');
const { Case } = require('../models');
const { addCaseEvent } = require('./cases');
const { evaluateResponse, recordAccuracyScore } = require('../accuracyMetrics');
const router = express.Router();

const MESSAGES_PER_CREDIT = 5; // har 5 xabar uchun 1 kredit sarflanadi

const LANG_NAMES = {
  uz: "o'zbek", ru: 'rus', en: 'ingliz', kk: 'qozoq', ky: "qirg'iz",
  tg: 'tojik', tk: 'turkman', az: 'ozarbayjon',
};

function buildSystemPrompt(lang) {
  const langName = LANG_NAMES[lang] || "o'zbek";
  return `Sen "Yurist AI" — O'zbekiston va Markaziy Osiyo qonunchiligi bo'yicha ixtisoslashgan yuridik yordamchisan.

TIL QOIDASI — JUDA MUHIM:
Foydalanuvchi ilovada ${langName} tilini tanlagan. SEN BARCHA JAVOBLARNI FAQAT ${langName.toUpperCase()} TILIDA
YOZISHING SHART, foydalanuvchi savolni qaysi tilda yozganiga qaramasdan. Hech qachon boshqa tilga
o'tib ketma, hatto savol boshqa tilda yozilgan bo'lsa ham — javobing har doim ${langName} tilida bo'lsin.

QATTIQ QOIDA — DOIRA CHEKLOVI:
Sen FAQAT huquqiy, yuridik va qonunchilik bilan bog'liq savollarga javob berasan: qonunlar, kodekslar,
shartnomalar, huquq va majburiyatlar, sud jarayonlari, hujjatlar, biznes-yuridik masalalar va shu kabilar.
Agar savol huquqqa aloqasi bo'lmagan mavzuda bo'lsa (masalan: sport, mashhur shaxslar, ob-havo, retsept,
o'yin, umumiy bilim savollari, texnologiya va h.k.), SAVOLGA JAVOB BERMA. O'rniga aniq va xushmuomala
tarzda (${langName} tilida) tushuntir: bu mavzu siz haqiqatda yordam beradigan doiradan tashqarida ekanini
ayt, va Yurist AI faqat huquqiy savollarga (masalan: shartnomalar, qonunlar, hujjatlar, sud jarayoni)
yordam berishini eslatib, foydalanuvchidan huquqiy savol bilan murojaat qilishni so'ra. Hech qachon
mavzudan tashqari savolga to'g'ridan-to'g'ri javob berma, hatto savol oson yoki zararsiz tuyulsa ham.

Agar savol noaniq bo'lsa, lekin huquqiy mavzuga tegishli bo'lishi mumkin bo'lsa (masalan, faqat bir so'z
yozilgan), avval qaysi huquqiy mavzu nazarda tutilganini aniqlashtirish uchun qisqa savol ber.

Huquqiy savollarga: aniq, professional va tushunarli ${langName} tilida javob ber.
Agar quyida "MANBA MATNI" berilgan bo'lsa, javobingni ASOSAN shu matnga tayangan holda ber va
qaysi moddaga asoslanganingni aniq ko'rsat. Manba matnida javob bo'lmasa, buni aytib qo'y va
umumiy bilimingdan ehtiyotkorlik bilan foydalan. Agar savol murakkab bo'lsa yoki shaxsiy maslahat
kerak bo'lsa, foydalanuvchini "Advokatlar" bo'limidan mutaxassisga murojaat qilishni tavsiya qil.
Javoblaring qisqa va amaliy bo'lsin (3-6 jumla), va albatta ${langName} tilida.

SUD AMALIYOTI HAQIDA QOIDA: agar MANBA MATNI ichida "--- SUD AMALIYOTI ---" deb belgilangan
bo'lim bo'lsa, bu -- real sud qarorlaridan olingan matn (qonun moddasi emas). Javob berishda
ikkisini aniq ajratib ko'rsat: avval qonun nima deydi (modda asosida), keyin "Amaliyotda esa..."
deb sudlar bu masalada qanday qaror chiqarishini qo'sh. Bu ikkisi har doim bir xil bo'lmasligi
mumkin -- shuni ham aytib qo'y agar farq bo'lsa.

HUJJAT/SHARTNOMA YASASH QOIDASI -- JUDA MUHIM:
Agar foydalanuvchi sendan biror shartnoma, kelishuv, ariza yoki boshqa yuridik hujjat YOZIB BERISHNI
so'rasa (masalan: "menga ijara shartnomasi yoz", "konsalting shartnomasi tuzib ber", "ishonchnoma kerak"),
SEN BUNI BAJARASAN -- rad etma, "Hujjat yaratish" bo'limiga yo'naltirma. Buning o'rniga:

1. To'liq, professional, band-bandli hujjat matnini ${langName} tilida tuz.
2. Hujjat matnini ANIQ shu ikki belgi orasiga joylashtir: [[DOC_START]] va [[DOC_END]]
   (bu belgilar orasidagi matn ilovada avtomatik aniqlanadi va foydalanuvchiga PDF/DOCX
   yuklab olish tugmalari ko'rsatiladi -- shuning uchun belgilarni albatta ishlat).
3. Hujjat tuzilishi: sarlavha (katta harflar bilan) -> "№ ___" va sana/joy -> "1. TOMONLAR"
   bo'limi (agar ism-sharif berilmagan bo'lsa "________________" bilan bo'sh joy qoldir) ->
   "2. SHARTNOMA PREDMETI" -> tegishli bo'limlar (narx/to'lov, muddat, huquq-majburiyatlar,
   javobgarlik, bekor qilish tartibi) -> "YAKUNIY QOIDALAR" -> imzo joylari (ikki tomon uchun,
   manzil/pasport/imzo uchun bo'sh joy bilan).
4. [[DOC_START]] dan oldin va [[DOC_END]] dan keyin faqat juda qisqa (1 jumlagacha) izoh
   yozishing mumkin (masalan "Mana sizning shartnomangiz:"), lekin hujjat matnining O'ZI
   belgilar ichida bo'lishi SHART.
5. [[DOC_START]] va [[DOC_END]] ICHIDA HECH QANDAY MARKDOWN BELGISI ISHLATMA -- ya'ni
   **qalin matn**, __qalin matn__, # sarlavha kabi belgilarni YOZMA. Bu matn to'g'ridan-to'g'ri
   PDF/DOCX fayliga oddiy matn sifatida tushadi -- yulduzcha belgilari formatlashga aylanmaydi,
   xom holda ko'rinib qoladi. Sarlavhalarni shunchaki katta harf bilan yoz (masalan "1. TOMONLAR").
6. Agar foydalanuvchi qaysi turdagi shartnoma kerakligini aniq aytmagan bo'lsa ham, kontekstdan
   eng mos hujjat turini taxmin qilib, darhol to'liq matn tuz -- qo'shimcha savol berib
   vaqt yo'qotma, faqat juda noaniq bo'lsa qisqa aniqlashtirish savoli ber.`;
}

const FALLBACKS = [
  { test: /mehnat|shartnoma/i,
    text: "Mehnat shartnomasi tuzishda quyidagilarga e'tibor bering: 1) Tomonlarning to'liq rekvizitlari; 2) Lavozim va mehnat vazifalari; 3) Ish haqi miqdori va to'lash tartibi (Mehnat kodeksi 153-modda); 4) Ish vaqti va dam olish vaqti; 5) Sinov muddati (3 oydan oshmasligi kerak). Shartnoma yozma shaklda, ikki nusxada tuziladi." },
  { test: /biznes/i,
    text: "O'zbekistonda biznes ochish uchun: 1) Tashkiliy-huquqiy shaklni tanlash (YaTT, MChJ va h.k.); 2) Davlat ro'yxatidan o'tish (my.gov.uz orqali); 3) STIR olish; 4) Bank hisob raqami ochish; 5) Kerakli litsenziya/ruxsatnomalarni olish. YaTT ro'yxati 30 daqiqada onlayn rasmiylashtiriladi." },
  { test: /ajrash|oila/i,
    text: "Ajrashish ikki yo'l bilan amalga oshiriladi: 1) FHDYo orqali — agar er-xotin rozi bo'lsa va voyaga yetmagan farzandlari bo'lmasa; 2) Sud orqali — agar nizo yoki farzand bo'lsa. Sudga ariza, nikoh guvohnomasi va bojxona to'lovi kvitansiyasi taqdim etiladi (Oila kodeksi)." },
];

// Fallback (OpenAI ulanmagan) rejimda mavzuni aniqlash uchun oddiy kalit so'z tekshiruvi.
// Bu AI emas, shuning uchun nozik emas -- lekin aniq mavzudan tashqari so'rovlarni
// (mashhur shaxslar, sport, umumiy bilim va h.k.) huquqiy javob sifatida ko'rsatib
// qo'ymaslik uchun yetarli himoya beradi.
const LEGAL_KEYWORDS = /huquq|qonun|kodeks|shartnoma|sud|advokat|jarima|javobgar|ariza|hujjat|moddasi|mehnat|biznes|soliq|mulk|meros|nikoh|ajrash|oila|ijara|pudrat|ishonchnoma|qarz|notari|jinoyat|fuqaro|vasiyat|кодекс|закон|право|суд|договор|штраф/i;
function isLikelyLegal(message) {
  return LEGAL_KEYWORDS.test(message);
}

// SUD AMALIYOTI uchun kalit so'zlar -- savol nizo, da'vo, sud jarayoni bilan
// bog'liqligini aniqlaymiz. Agar shu so'zlardan biri topilsa va joriy
// yurisdiksiya uchun sud amaliyoti manbasi mavjud bo'lsa (UZ, RU, TJ, US),
// oddiy qonun matnidan TASHQARI sud qarorlarini ham qidiramiz.
const DISPUTE_KEYWORDS = /sud|da'vo|nizo|ariza|qaror|amaliyot|precedent|appellyatsiya|kassatsiya|суд|иск|спор|решение|практика/i;
function isLikelyDispute(message) {
  return DISPUTE_KEYWORDS.test(message);
}

async function callOpenAI(message, history, niaContext, lang, caseSummary) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('[chat] OPENAI_API_KEY .env faylida topilmadi -- fallback javob ishlatiladi.');
    return null;
  }
  try {
    const contextBlock = niaContext
      ? `\n\nMANBA MATNI (${niaContext.sources.join(', ')} dan topilgan):\n${niaContext.text}`
      : '';
    // AI ASSOCIATE: agar foydalanuvchi "Ish" (Case) doirasida savol-javob
    // qilayotgan bo'lsa, ishning xulosasini ham kontekstga qo'shamiz --
    // shunda AI oylar oldin nima muhokama qilingani bilan tanish bo'ladi,
    // garchi hozirgi suhbatda bu mavzu birinchi marta ko'tarilgan bo'lsa ham.
    const caseBlock = caseSummary
      ? `\n\nISH TARIXI (avvalgi xulosalar -- bu masala oldin shu yerga yetib kelgan):\n${caseSummary}`
      : '';
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: buildSystemPrompt(lang) + contextBlock + caseBlock },
          ...(history || []).slice(-6),
          { role: 'user', content: message },
        ],
        max_tokens: 500,
      }),
    });
    if (!resp.ok) {
      const errBody = await resp.text().catch(() => '');
      throw new Error(`OpenAI ${resp.status}: ${errBody.slice(0, 300)}`);
    }
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.error('[chat] OpenAI xatosi:', e.message);
    return null;
  }
}

const GREETING_RE = /^(salom|salam|assalomu|hi|hello|hey|привет|здравствуйте|сәлем|салам)\b/i;

// Fallback javoblar har bir til uchun -- OpenAI ulanmagan holatda ham
// tanlangan tilga mos javob berilishi uchun.
const I18N_REPLIES = {
  uz: {
    greeting: "Salom! Men Yurist AI — sizning huquqiy yordamchingiz. Shartnomalar, qonunlar, hujjatlar yoki boshqa huquqiy savollaringiz bo'yicha yordam berishga tayyorman. Nimani bilmoqchisiz?",
    outOfScope: "Kechirasiz, bu savol Yurist AI yordam bera oladigan doiradan tashqarida. Men faqat huquqiy va qonunchilik bilan bog'liq savollarga (shartnomalar, qonunlar, hujjatlar, sud jarayoni, mehnat va biznes huquqi va h.k.) yordam beraman. Iltimos, huquqiy savol bilan murojaat qiling.",
    default: "Savolingiz uchun rahmat. Bu masala bo'yicha aniq javob berish uchun vaziyatni batafsil ko'rib chiqish lozim. Umumiy qoida sifatida, tegishli kodeks moddalariga asoslanib harakat qilish tavsiya etiladi. Aniqroq maslahat uchun «Advokatlar» bo'limidan mutaxassisga murojaat qilishingiz mumkin.",
  },
  ru: {
    greeting: "Здравствуйте! Я Yurist AI — ваш юридический помощник. Готов помочь с договорами, законами, документами и другими правовыми вопросами. Что вас интересует?",
    outOfScope: "Извините, этот вопрос находится за пределами того, с чем может помочь Yurist AI. Я отвечаю только на юридические вопросы (договоры, законы, документы, судебные процессы, трудовое и деловое право и т.д.). Пожалуйста, задайте правовой вопрос.",
    default: "Спасибо за вопрос. Для точного ответа нужно детально рассмотреть ситуацию. Как правило, следует руководствоваться соответствующими статьями кодекса. За более точной консультацией обратитесь к специалисту в разделе «Адвокаты».",
  },
  en: {
    greeting: "Hello! I'm Yurist AI — your legal assistant. I can help with contracts, laws, documents, and other legal questions. What would you like to know?",
    outOfScope: "Sorry, this question is outside what Yurist AI can help with. I only answer legal questions (contracts, laws, documents, court proceedings, labor and business law, etc.). Please ask a legal question.",
    default: "Thank you for your question. A detailed review of the situation is needed for a precise answer. As a general rule, it's best to act according to the relevant code provisions. For more specific advice, consult a specialist in the 'Lawyers' section.",
  },
  kk: {
    greeting: "Сәлем! Мен Yurist AI — сіздің құқықтық көмекшіңіз. Шарттар, заңдар, құжаттар және басқа құқықтық сұрақтар бойынша көмектесуге дайынмын. Нені білмек жатсыз?",
    outOfScope: "Кешіріңіз, бұл сұрақ Yurist AI көмектесе алатын аядан тыс. Мен тек құқықтық және заңнамалық сұрақтарға (шарттар, заңдар, құжаттар, сот процесі, еңбек және бизнес құқығы) жауап беремін. Құқықтық сұрақ қойыңыз.",
    default: "Сұрағыңыз үшін рахмет. Нақты жауап беру үшін жағдайды егжей-тегжейлі қарау қажет. Тиісті кодекс баптарына сүйену ұсынылады. Нақтырақ кеңес үшін «Адвокаттар» бөлімінен маманға хабарласыңыз.",
  },
  ky: {
    greeting: "Салам! Мен Yurist AI — сиздин укуктук жардамчыңыз. Келишимдер, мыйзамдар, документтер жана башка укуктук суроолор боюнча жардам берүүгө даярмын. Эмнени билгиле жатасыз?",
    outOfScope: "Кечиресиз, бул суроо Yurist AI жардам бере алган чөйрөдөн тышкары. Мен тек укуктук жана мыйзам маселелерине (келишимдер, мыйзамдар, документтер, сот процесси, эмгек жана бизнес укугу) жооп берем. Сураныч, укуктук суроо бериңиз.",
    default: "Сурооңуз үчүн рахмат. Так жооп берүү үчүн жагдайды кеңири карап чыгуу зарыл. Тиешелүү кодекс беренелерине таянуу сунушталат. Дагы так кеңеш үчүн «Адвокаттар» бөлүмүнөн адиске кайрылыңыз.",
  },
  tg: {
    greeting: "Салом! Ман Yurist AI — ёрдамчии ҳуқуқии шумо. Барои шартномаҳо, қонунҳо, ҳуҷҷатҳо ва дигар саволҳои ҳуқуқӣ кӣ кардан тайёрам. Чиро мехостед бидонед?",
    outOfScope: "Бубахшед, ин савол берун аз доираи кӯмаки Yurist AI аст. Ман танҳо ба саволҳои ҳуқуқӣ ва қонунгузорӣ (шартномаҳо, қонунҳо, ҳуҷҷатҳо, мурофиаи судӣ, ҳуқуқи меҳнатӣ ва тиҷоратӣ) ҷавоб медиҳам. Лутфан саволи ҳуқуқӣ диҳед.",
    default: "Барои саволатон ташаккур. Барои ҳавоби дақиқ баррасии муфассали вазъият лозим аст. Тибқи қоидаи умумӣ, амал кардан мутобиқи моддаҳои дахлдори кодекс тавсия дода мешавад. Барои маслиҳати дақиқтар ба мутахассис дар бахши «Адвокатҳо» муроҷиат кунед.",
  },
  tk: {
    greeting: "Salam! Men Yurist AI — siziň hukuk kömekçiňiz. Şertnamalar, kanunlar, resminamalar we beýleki hukuk soraglary boýunça kömek bermäge taýýar. Näme bilmek isleýärsiňiz?",
    outOfScope: "Bagyşlaň, bu sorag Yurist AI kömek berip bilýän çägiň daşynda. Men diňe hukuk we kanunçylyk soraglaryna (şertnamalar, kanunlar, resminamalar, kazyýet işi, zähmet we iş hukugy) jogap berýärin. Hukuk sorag beriň.",
    default: "Soragyňyz üçin sag boluň. Takyk jogap bermek üçin ýagdaýy jikme-jik seretmek gerek. Degişli kodeks maddalaryna esaslanmak maslahat berilýär. Has takyk maslahat üçin «Aklawçylar» bölüminden hünärmene ýüz tutuň.",
  },
  az: {
    greeting: "Salam! Mən Yurist AI — sizin hüquqi köməkçiniz. Müqavilələr, qanunlar, sənədlər və digər hüquqi suallar üzrə kömək etməyə hazıram. Nəyi bilmək istəyirsiniz?",
    outOfScope: "Üzr istəyirəm, bu sual Yurist AI-nın yardım edə biləcəyi əhatə dairəsindən kənardır. Mən yalnız hüquqi və qanunvericilik sualllarına (müqavilələr, qanunlar, sənədlər, məhkəmə prosesi, əmək və biznes hüququ) cavab verirəm. Lütfən, hüquqi sual verin.",
    default: "Sualınız üçün təşəkkür edirəm. Dəqiq cavab üçün vəziyyəti ətraflı nəzərdən keçirmək lazımdır. Ümumi qayda olaraq, müvafiq məcəllə maddələrinə əsaslanmaq tövsiyə olunur. Daha dəqiq məsləhət üçün «Vəkillər» bölməsindən mütəxəssisə müraciət edin.",
  },
};
function repliesFor(lang) { return I18N_REPLIES[lang] || I18N_REPLIES.uz; }

function fallbackReply(message, lang) {
  const R = repliesFor(lang);
  if (GREETING_RE.test(message.trim())) return R.greeting;
  if (!isLikelyLegal(message)) return R.outOfScope;
  const found = FALLBACKS.find((f) => f.test.test(message));
  return found ? found.text : R.default;
}

// POST /api/chat  { message, history, jurisdiction, lang, caseId }
// caseId -- IXTIYORIY. Agar berilsa, AI ASSOCIATE rejimi yoqiladi: shu
// "Ish" (Case) ning oldingi xulosasi AI'ga kontekst sifatida qo'shiladi,
// va javobdan keyin xulosa avtomatik yangilanadi.
router.post('/', requireAuth, async (req, res) => {
  try {
    const { message, history, jurisdiction, lang, caseId } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: "Savol bo'sh bo'lmasligi kerak" });

    const user = req.user;
    // Har 5 xabarga 1 kredit sarflanadi. Hisoblagich foydalanuvchi obyektida saqlanadi.
    const sentSoFar = user.chatMsgCount || 0;
    const willCrossBoundary = (sentSoFar + 1) % MESSAGES_PER_CREDIT === 0; // bu xabar 10, 20, 30... bo'lsa kredit yechiladi
    if (willCrossBoundary && user.credits < 1) {
      return res.status(402).json({ error: 'Kredit yetarli emas', code: 'NO_CREDITS' });
    }

    // AI ASSOCIATE: agar caseId berilgan bo'lsa, shu ishning egasi ekanini
    // tekshirib, joriy xulosasini olamiz. Xato (masalan ish topilmasa) butun
    // chatni to'xtatmaydi -- shunchaki caseDoc null qoladi, oddiy chat kabi davom etadi.
    let caseDoc = null;
    if (caseId) {
      try {
        const found = await Case.findById(caseId);
        if (found && String(found.userId) === String(user.id)) caseDoc = found;
      } catch (e) {
        console.error('[chat] Case yuklashda xato:', e.message);
      }
    }

    // 1-qadam: JURISDICTION ROUTER -- foydalanuvchi tanlovi (aniq) yoki savol
    // matnidan (avtomatik) qaysi davlat qonunchiligi kerakligini aniqlaymiz.
    const jurisRoute = routeJurisdiction({
      explicitJurisdiction: jurisdiction || caseDoc?.jurisdictionId,
      queryText: message,
    });

    // 2-qadam: Nia orqali qonun matni VA sud amaliyotini -- ikkisini PARALLEL
    // (bir vaqtda) qidiramiz, ketma-ket emas. Bu javob vaqtini sezilarli
    // tezlashtiradi (ikki so'rov yig'indisi o'rniga, eng sekinining vaqti).
    // Bundan tashqari, Nia 4 soniyadan ko'p javob bermasa, KUTMAYMIZ va
    // shu kontekstsiz davom etamiz -- foydalanuvchi javobni tez olishi
    // sekin-lekin to'liq manbadan ko'ra muhimroq.
    let niaContext = null;
    let citations = [];
    let caseLawUsed = false;
    const NIA_TIMEOUT_MS = 4000;
    const withTimeout = (promise, ms) =>
      Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(null), ms))]);

    if (niaConfigured()) {
      const wantsCaseLaw = isLikelyDispute(message) && isCaseLawAvailable(jurisRoute.code);

      const [lawResult, caseLawResult] = await Promise.all([
        withTimeout(searchForJurisdiction(message, jurisRoute.code), NIA_TIMEOUT_MS).catch(() => null),
        wantsCaseLaw
          ? withTimeout(searchCaseLaw(message, jurisRoute.code), NIA_TIMEOUT_MS).catch(() => null)
          : Promise.resolve(null),
      ]);

      if (lawResult && lawResult.chunks.length) {
        // MULTI-SOURCE CONTEXT: xom Nia natijasini kodeks/modda bilan bog'lab,
        // "Manba: [Davlat], [Kodeks], [Modda]" formatidagi iqtibosga aylantiramiz.
        citations = buildCitations(lawResult.chunks, jurisRoute.code);
        niaContext = {
          text: lawResult.chunks.map((c) => c.text).join('\n---\n').slice(0, 2000),
          sources: citations.map((c) => c.citationText),
        };
      }

      if (caseLawResult && caseLawResult.chunks.length) {
        const caseLawText = caseLawResult.chunks.map((c) => c.text).join('\n---\n').slice(0, 1000);
        niaContext = niaContext
          ? { ...niaContext, text: niaContext.text + `\n\n--- SUD AMALIYOTI ---\n${caseLawText}` }
          : { text: `--- SUD AMALIYOTI ---\n${caseLawText}`, sources: [] };
        caseLawUsed = true;
      }
    }

    // 3-qadam: OpenAI (Nia kontekst bilan boyitilgan, tanlangan tilda) yoki fallback
    const aiReply = await callOpenAI(message, history, niaContext, lang, caseDoc?.summary);
    const reply = aiReply || fallbackReply(message, lang);

    // 4-qadam: xabar hisoblagichini oshirish, kerak bo'lsa kredit yechish
    const newCount = sentSoFar + 1;
    user.chatMsgCount = newCount;
    if (willCrossBoundary) user.credits = Math.max(0, user.credits - 1);
    await user.save();
    const creditsLeft = user.credits;

    // VERCEL UCHUN MUHIM ESLATMA: serverless funksiyalarda res.json() dan
    // KEYIN ishga tushirilgan "fire and forget" ishlar to'xtab qolishi mumkin
    // (Vercel funksiyani "tugadi" deb yopib qo'yadi). Shuning uchun AI
    // ASSOCIATE xulosasini yangilash va RAGAS baholashni javobdan OLDIN,
    // lekin bir-biriga PARALLEL (Promise.all) qilib bajaramiz -- bu Vercel'da
    // ishonchli ishlaydi, va ketma-ket bajarishdan tezroq (faqat eng sekin
    // ikkisining vaqti qo'shiladi, ikkisining yig'indisi emas).
    const backgroundTasks = [];
    if (caseDoc) {
      backgroundTasks.push(
        addCaseEvent(caseDoc, {
          type: 'message',
          summary: `Savol: ${message.slice(0, 200)} | Javob: ${reply.slice(0, 300)}`,
        }).catch((e) => console.error('[chat] Case xulosasini yangilashda xato:', e.message))
      );
    }
    // ANIQLIK METRIKASI: TEZLIK UCHUN -- har bir xabarda emas, faqat HAR
    // 5-CHI xabarda baholaymiz. RAGAS baholash o'zi alohida OpenAI chaqiruvi
    // talab qiladi, va buni har safar bajarish javob vaqtini sezilarli
    // oshiradi. Har 5-chi xabar statistik jihatdan tizim sifatini kuzatish
    // uchun YETARLI, lekin tezlikka deyarli ta'sir qilmaydi.
    if (aiReply && newCount % 5 === 0) {
      backgroundTasks.push(
        evaluateResponse({ question: message, answer: reply, contextText: niaContext?.text })
          .then((scores) => recordAccuracyScore({
            scope: 'b2c', userId: user.id, jurisdictionId: jurisRoute.code, scores,
            hadContext: !!(niaContext && niaContext.text),
          }))
          .catch((e) => console.error('[chat] Aniqlik baholashda xato:', e.message))
      );
    }
    if (backgroundTasks.length) await Promise.all(backgroundTasks);

    // DIQQAT: savol/javob MATNI hech qachon yozilmaydi -- faqat foydalanish
    // miqdori va yurisdiksiya statistikasi (admin panel uchun).
    logActivity({
      type: 'chat_message_sent',
      userId: user.id,
      userLabel: user.name,
      meta: { jurisdictionId: jurisRoute.code, lang },
    });

    res.json({
      reply,
      source: aiReply ? (niaContext ? 'openai+nia' : 'openai') : 'fallback',
      jurisdiction: jurisRoute.code,
      jurisdictionSource: jurisRoute.source, // 'explicit' | 'detected' | 'default'
      citations: citations.length ? citations : undefined,
      niaSources: citations.length ? citations.map((c) => c.citationText) : undefined,
      caseLawUsed,
      caseId: caseDoc ? caseDoc.id : undefined,
      creditsLeft,
      msgCountInCycle: newCount % MESSAGES_PER_CREDIT === 0 ? MESSAGES_PER_CREDIT : newCount % MESSAGES_PER_CREDIT,
      creditDeducted: willCrossBoundary,
    });
  } catch (e) {
    console.error('[chat] xato:', e);
    res.status(500).json({ error: 'AI javob berishda kutilmagan xato yuz berdi' });
  }
});

module.exports = router;