// riskEngine.js -- Shartnoma matnini tahlil qiluvchi umumiy mexanizm.
// Bu modul B2C (server/routes/risk.js) va B2B (server/b2b/routes/audit.js)
// ikkisi tomonidan ham qayta ishlatiladi -- shunday qilib tahlil mantiqi
// FAQAT BIR JOYDA yashaydi va ikkisida bir xil natija beradi.
//
// ====================================================================
// MUHIM -- BU FAYLNI O'ZGARTIRGANDAN KEYIN ALBATTA SHUNI ISHGA TUSHIRING:
//     node server/riskEngine.test.js
// Bu doimiy test to'plami real hujjatlarda ikki marta topilgan xato
// klassini (rus fe'l/ot undosh almashinishi: расторг/расторж, оплат/оплач)
// va barcha 8 tilning asosiy atamalarini tekshiradi. Agar test FAIL
// bersa, o'zgarish biror narsani buzgan -- sababini topib tuzating.
// ====================================================================
//
// Har bir tekshiruv endi ilovaning 8 tiliga mos kalit so'zlarni o'z ichiga
// oladi: o'zbek, rus, ingliz, qozoq, qirg'iz, tojik, turkman, ozarbayjon.
// Har bir til uchun atama RASMIY yuridik manbalar (davlat qonun bazalari:
// adilet.zan.kz, andoz.tj, e-qanun.az va h.k.) asosida tekshirilgan --
// taxmin qilingan emas. Ayrim kamroq tarqalgan kategoriyalarda (masalan,
// "predmet" so'zi ba'zi tillarda) mahalliy rasmiy hujjatlarda ko'pincha
// rus tilidan to'g'ridan-to'g'ri olingan atama ishlatiladi -- bu holatlarda
// mavjud rus regexi allaqachon qisman qamrab oladi.
const CHECKS = [
  { key: 'tomonlar', label: 'Tomonlar rekvizitlari', sev: 'high',
    re: /tomon|сторон|f\.?i\.?o|ф\.?и\.?о|passport|паспорт|stir|инн|тарап|тараф|tarap|tərəf|party|parties/i,
    bad: "Hujjatda tomonlarning to'liq ismi va passport/STIR rekvizitlari aniq ko'rsatilmagan. Bu hujjatni yuridik kuchsiz qiladi." },
  { key: 'predmet', label: 'Shartnoma predmeti', sev: 'high',
    re: /predmet|предмет|mol-?mulk|объект|xizmat|услуг|tovar|товар|мавзӯъ|нысан|мәні|mövzu|subject of (this|the) (agreement|contract)/i,
    bad: 'Shartnoma predmeti (nima haqida ekani) aniq yozilmagan.' },
  { key: 'narx', label: "Narx / to'lov shartlari", sev: 'high',
    re: /so'?m|сум|narx|цена|to'?lov|оплат|оплач|summa|сумм|miqdor|нарх|баға|баа|qiymət|price|payment/i,
    bad: "To'lov miqdori yoki tartibi ko'rsatilmagan." },
  { key: 'muddat', label: 'Amal qilish muddati', sev: 'med',
    re: /muddat|срок|sana|дата|20\d\d|\d{1,2}\.\d{1,2}\.\d{2,4}|мерзім|мөөнөт|мӯҳлат|möhlet|müddət|term of|duration/i,
    bad: "Shartnomaning boshlanish/tugash muddati belgilanmagan." },
  { key: 'jarima', label: 'Jarima / javobgarlik', sev: 'med',
    re: /jarima|штраф|penya|пеня|javobgar|ответствен|neustoyka|неустойк|ҷарима|jerime|cərimə|айыппұл|айыппул|penalty|liability/i,
    bad: 'Majburiyat buzilganda jarima yoki javobgarlik nazarda tutilmagan.' },
  { key: 'bekor', label: 'Bekor qilish tartibi', sev: 'med',
    re: /bekor|расторж|расторг|прекращ|односторон|bir tomonlama|ogohlantir|уведомл|бекор|бұзу|бузуу|ləğv|xitam|termination|terminate/i,
    bad: "Shartnomani bekor qilish tartibi ko'rsatilmagan." },
  { key: 'nizo', label: 'Nizolarni hal qilish', sev: 'low',
    re: /nizo|спор|sud|суд|arbitr|арбитраж|muzokara|переговор|дау|доо|баҳс|jedel|mübahisə|dispute|negotiation/i,
    bad: "Nizolarni hal qilish tartibi ko'rsatilmagan." },
  { key: 'imzo', label: "Imzo bo'limi", sev: 'low',
    re: /imzo|подпис|m\.?o['‘]?|қолтаңба|қол қою|кол тамга|имзо|imza|signature|(?:^|\s)м\.?п\.?(?:\s|$)/i,
    bad: "Imzo va sana bo'limi yo'q." },
];

const RED_FLAGS = [
  { re: /istalgan vaqtda.*bekor|в любой момент.*раст|без объяснени|sababsiz|at any time.*terminat|without (cause|explanation)/i, sev: 'high',
    msg: "«Istalgan vaqtda sababsiz bekor qilish» kabi bir tomon foydasiga adolatsiz band aniqlandi." },
  { re: /javobgar emas|не несет ответствен|hech qanday javobgarlik|жауапкершілік көтермейді|жоопкерчилик тартпайт|ҷавобгар нест|jogapkärçilik çekmeýär|məsuliyyət daşımır|not (be )?liable|no liability/i, sev: 'high',
    msg: 'Bir tomon «hech qanday javobgarlik olmaydi» degan band bor.',
    // MUHIM: "javobgar emas" iborasi ko'pincha STANDART, ADOLATLI force-majeure
    // bandida uchraydi -- masalan "Ni odna iz storon ne neset otvetstvennosti
    // (favqulodda holatlar sababli)" -- bu HAR IKKI tomonga teng taalluqli,
    // adolatsiz emas. Shuning uchun atrofida "ikki tomon/force-majeure" signali
    // bo'lsa, bu band ADOLATSIZ deb belgilanmaydi (aks holda yaxshi, standart
    // shartnomalar ham noto'g'ri "xavfli" deb chiqib qoladi).
    exclude: /ni odna iz storon|ниодна из сторон|ни одна из сторон|neither party|force[\s-]?majeur|форс-?мажор|непреодолим|favqulodda|har ikki tomon|hech bir tomon|both parties|obe storonı|обе стороны|еш бір тарап|эч бир тарап|ҳеч як тараф|hiç bir tarap|heç bir tərəf/i },
];

function findContext(text, matchIndex, matchLength, radius) {
  const start = Math.max(0, matchIndex - radius);
  const end = Math.min(text.length, matchIndex + matchLength + radius);
  return text.slice(start, end);
}

function analyzeText(text) {
  const t = text || '';
  const readable = t.replace(/\s/g, '').length > 40;
  let findings = [];
  let earned = 0, total = 0;

  CHECKS.forEach((c) => {
    const weight = c.sev === 'high' ? 20 : c.sev === 'med' ? 12 : 7;
    total += weight;
    const present = readable ? c.re.test(t) : false;
    if (present) earned += weight;
    else findings.push({ sev: c.sev, key: c.key, title: `${c.label} — yetishmayapti`, body: c.bad });
  });

  if (readable) {
    RED_FLAGS.forEach((f) => {
      const m = f.re.exec(t);
      if (m) {
        // Agar bandning atrofida "ikki tomon/force-majeure" kabi adolatlilik
        // signali bo'lsa -- bu standart, adolatli band, "adolatsiz" deb
        // belgilanmaydi (qarang: javobgar emas qoidasidagi izoh).
        const context = findContext(t, m.index, m[0].length, 200);
        if (f.exclude && f.exclude.test(context)) return;
        findings.push({ sev: f.sev, key: 'red_flag', title: 'Adolatsiz band', body: f.msg });
        earned -= 15;
      }
    });
  }

  const score = readable ? Math.max(0, Math.min(100, Math.round((earned / total) * 100))) : null;
  const tier = score === null ? 'unknown' : score >= 80 ? 'good' : score >= 50 ? 'med' : 'bad';
  return { score, tier, readable, findings };
}

module.exports = { analyzeText, CHECKS, RED_FLAGS };
