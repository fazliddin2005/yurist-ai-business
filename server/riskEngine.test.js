// server/riskEngine.test.js
// ============================================================================
// RISK ENGINE -- DOIMIY TEKSHIRUV TO'PLAMI
// ============================================================================
// MAQSAD: bu fayl shunchaki "bitta hujjat kelganda, bitta xato topib tuzatish"
// uslubidan voz kechib, TIZIMLI tekshiruvga o'tish uchun yaratilgan.
//
// QOIDA: `server/riskEngine.js` faylida CHECKS, RED_FLAGS yoki ularning
// regexlarida HAR QANDAY o'zgarish qilinganda, albatta shu faylni ishga
// tushiring:
//     node server/riskEngine.test.js
// Agar biror test FAIL bo'lsa, o'zgarish biror narsani buzgan -- joylashtirib
// yubormasdan oldin sababini topib tuzating.
//
// NIMANI TEKSHIRADI:
//   1. Real hujjatlar (ilgari foydalanuvchi yuklagan, haqiqiy muammo topilgan
//      fayllar) -- bular HECH QACHON regressiyaga uchramasligi kerak.
//   2. Har 8 tilning asosiy atamalari -- har biri alohida sinaladi.
//   3. Rus tili FE'L/OT undosh almashinishi (masalan расторг/расторж,
//      оплат/оплач) -- bu xato klassi ikki marta haqiqiy hujjatda chiqgan,
//      shuning uchun bu yerda doimiy ravishda kuzatiladi.
//   4. Yolg'on signal (false positive) himoyasi -- masalan "компания" so'zi
//      imzo bandini soxta faollashtirmasligi, yoki ikki tomonlama
//      force-majeure bandi "adolatsiz" deb belgilanmasligi kerak.
// ============================================================================

const fs = require('fs');
const path = require('path');
const { analyzeText, CHECKS, RED_FLAGS } = require('./riskEngine');

let pass = 0, fail = 0;
function check(label, condition, detail) {
  if (condition) { pass++; }
  else { fail++; console.log('  \u274c FAIL: ' + label + (detail ? '  (' + detail + ')' : '')); }
}
function section(title) { console.log('\n=== ' + title + ' ==='); }

// ----------------------------------------------------------------------------
// 1. REAL HUJJATLAR -- REGRESSIYA TESTLARI
// ----------------------------------------------------------------------------
section('1. Real hujjatlar (regressiya)');

const fixturesDir = path.join(__dirname, 'test-fixtures');
const realDocTests = [
  { file: 'uz-good.txt', minScore: 95, expectTier: 'good', label: "Sintetik yaxshi O'zbek shartnoma" },
  { file: 'uz-bad.txt', maxScore: 10, expectTier: 'bad', label: "Sintetik yomon O'zbek shartnoma" },
  { file: 'ru-real-tashcom-gigant.txt', minScore: 95, expectTier: 'good', label: 'Real TASHCOM/GIGANT savdo shartnomasi (rus)' },
  { file: 'ru-real-reklamalux.txt', minScore: 95, expectTier: 'good', label: 'Real REKLAMALUX xizmat shartnomasi (rus)' },
];
realDocTests.forEach(({ file, minScore, maxScore, expectTier, label }) => {
  const fp = path.join(fixturesDir, file);
  if (!fs.existsSync(fp)) { check(label + ' [FAYL TOPILMADI]', false, fp); return; }
  const text = fs.readFileSync(fp, 'utf8');
  const r = analyzeText(text);
  if (minScore !== undefined) check(label + ': score >= ' + minScore, r.score >= minScore, 'actual=' + r.score);
  if (maxScore !== undefined) check(label + ': score <= ' + maxScore, r.score <= maxScore, 'actual=' + r.score);
  check(label + ': tier == ' + expectTier, r.tier === expectTier, 'actual=' + r.tier);
});

// ----------------------------------------------------------------------------
// 2. HAR 8 TIL -- ASOSIY ATAMALAR (rasmiy davlat qonun manbalaridan
//    tasdiqlangan so'zlar, qarang: riskEngine.js izohlari)
// ----------------------------------------------------------------------------
section('2. 8 tilning asosiy atamalari');

const langTerms = {
  uz: { tomonlar: 'tomon', narx: "to'lov", muddat: 'muddat', jarima: 'jarima', bekor: 'bekor qilish', nizo: 'nizo', imzo: 'imzo' },
  ru: { tomonlar: 'стороны', narx: 'цена', muddat: 'срок', jarima: 'штраф', bekor: 'расторжение', nizo: 'спор', imzo: 'подпись' },
  en: { tomonlar: 'parties', narx: 'price', muddat: 'duration', jarima: 'liability', bekor: 'termination', nizo: 'dispute', imzo: 'signature' },
  kk: { tomonlar: 'тарап', narx: 'баға', muddat: 'мерзім', jarima: 'айыппұл', bekor: 'бұзу', nizo: 'дау', imzo: 'қолтаңба' },
  ky: { muddat: 'мөөнөт', imzo: 'кол тамга', narx: 'баа' },
  tg: { tomonlar: 'тарафҳо', narx: 'нарх', muddat: 'мӯҳлат', jarima: 'ҷарима', bekor: 'бекор', nizo: 'баҳс', imzo: 'имзо' },
  tk: { tomonlar: 'taraplar', jarima: 'jerime', muddat: 'möhlet', nizo: 'jedel' },
  az: { tomonlar: 'tərəflər', narx: 'qiymət', muddat: 'müddət', jarima: 'cərimə', bekor: 'ləğv', nizo: 'mübahisə', imzo: 'imza' },
};

const checksByKey = {};
CHECKS.forEach((c) => { checksByKey[c.key] = c.re; });

Object.entries(langTerms).forEach(([lang, terms]) => {
  Object.entries(terms).forEach(([key, word]) => {
    check(lang + '/' + key + ' tanidi: "' + word + '"', checksByKey[key].test(word));
  });
});

// ----------------------------------------------------------------------------
// 3. RUS TILI FE'L/OT UNDOSH ALMASHINISHI -- bu xato klassi ikki marta
//    haqiqiy hujjatda aniqlangan (расторг/расторж, оплат/оплач), shuning
//    uchun bu yerda doimiy kuzatiladi.
// ----------------------------------------------------------------------------
section("3. Rus tili fe'l/ot shakllari (consonant mutation)");

const morphTests = [
  { key: 'bekor', word: 'расторгнут', note: "fe'l shakli (расторг)" },
  { key: 'bekor', word: 'расторжение', note: 'ot shakli (расторж)' },
  { key: 'bekor', word: 'прекращение', note: 'sinonim (прекращ)' },
  { key: 'narx', word: 'оплачивает', note: "fe'l, hozirgi zamon (оплач)" },
  { key: 'narx', word: 'оплачен', note: 'sifatdosh (оплач)' },
  { key: 'narx', word: 'оплата', note: 'ot shakli (оплат)' },
  { key: 'imzo', word: 'подписания', note: 'gerundiy' },
  { key: 'imzo', word: 'М.П.', note: "muhr belgisi, nuqta bilan" },
  { key: 'imzo', word: 'Director: ___ МП', note: 'muhr belgisi, nuqtasiz, qator oxirida' },
  { key: 'jarima', word: 'несет ответственность', note: 'javobgarlik iborasi' },
];
morphTests.forEach(({ key, word, note }) => {
  check(key + ': "' + word + '" (' + note + ')', checksByKey[key].test(word));
});

// ----------------------------------------------------------------------------
// 4. YOLG'ON SIGNALGA QARSHI HIMOYA (false positive guards)
// ----------------------------------------------------------------------------
section("4. Yolg'on signalga qarshi himoya");

check('"компания" so\'zi imzo bandini SOXTA faollashtirmaydi', !checksByKey.imzo.test('ООО компания TASHCOM'));
check('"темп" so\'zi imzo bandini SOXTA faollashtirmaydi', !checksByKey.imzo.test('ишлаб чикариш темпи'));

const mutualForceMajeure = 'Ни одна из сторон не несет ответственности за неисполнение обязательств вследствие непреодолимой силы.';
const rMutual = analyzeText('Tomonlar: A va B. Predmet: tovar. Narx: 1000 som. Muddat: 2026. ' + mutualForceMajeure + ' Nizo sudda. Imzo: ___');
check("Ikki tomonlama force-majeure bandi 'adolatsiz' deb BELGILANMAYDI",
  !rMutual.findings.some((f) => f.key === 'red_flag'),
  'topilgan findings: ' + rMutual.findings.map((f) => f.key).join(','));

const oneSidedUnfair = "Ijaraga beruvchi istalgan vaqtda sababsiz shartnomani bekor qilishi mumkin.";
const rUnfair = analyzeText('Tomonlar: A va B. ' + oneSidedUnfair + ' Boshqa shartlar yo\'q.');
check("Bir tomonlama adolatsiz band TO'G'RI aniqlanadi", rUnfair.findings.some((f) => f.key === 'red_flag'));

// ----------------------------------------------------------------------------
// YAKUNIY HISOBOT
// ----------------------------------------------------------------------------
console.log('\n' + '='.repeat(60));
console.log(`NATIJA: ${pass} muvaffaqiyatli, ${fail} xato`);
console.log('='.repeat(60));
if (fail > 0) {
  console.log('\n⚠️  Diqqat: yuqoridagi FAIL qatorlarini hal qilmasdan joylashtirmang.');
  process.exit(1);
} else {
  console.log('\n✅ Hammasi o\'tdi -- riskEngine.js xavfsiz joylashtirish uchun tayyor.');
  process.exit(0);
}
