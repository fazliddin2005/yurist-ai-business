// riskEngine.js -- Shartnoma matnini tahlil qiluvchi umumiy mexanizm.
// Bu modul B2C (server/routes/risk.js) va B2B (server/b2b/routes/audit.js)
// ikkisi tomonidan ham qayta ishlatiladi -- shunday qilib tahlil mantiqi
// FAQAT BIR JOYDA yashaydi va ikkisida bir xil natija beradi.
const CHECKS = [
  { key: 'tomonlar', label: 'Tomonlar rekvizitlari', sev: 'high',
    re: /tomon|сторон|f\.?i\.?o|ф\.?и\.?о|passport|паспорт|stir|инн/i,
    bad: "Hujjatda tomonlarning to'liq ismi va passport/STIR rekvizitlari aniq ko'rsatilmagan. Bu hujjatni yuridik kuchsiz qiladi." },
  { key: 'predmet', label: 'Shartnoma predmeti', sev: 'high',
    re: /predmet|предмет|mol-?mulk|объект|xizmat|услуг|tovar|товар/i,
    bad: 'Shartnoma predmeti (nima haqida ekani) aniq yozilmagan.' },
  { key: 'narx', label: "Narx / to'lov shartlari", sev: 'high',
    re: /so'?m|сум|narx|цена|to'?lov|оплат|summa|сумм|miqdor/i,
    bad: "To'lov miqdori yoki tartibi ko'rsatilmagan." },
  { key: 'muddat', label: 'Amal qilish muddati', sev: 'med',
    re: /muddat|срок|sana|дата|20\d\d|\d{1,2}\.\d{1,2}\.\d{2,4}/i,
    bad: "Shartnomaning boshlanish/tugash muddati belgilanmagan." },
  { key: 'jarima', label: 'Jarima / javobgarlik', sev: 'med',
    re: /jarima|штраф|penya|пеня|javobgar|ответствен|neustoyka|неустойк/i,
    bad: 'Majburiyat buzilganda jarima yoki javobgarlik nazarda tutilmagan.' },
  { key: 'bekor', label: 'Bekor qilish tartibi', sev: 'med',
    re: /bekor|расторж|односторон|bir tomonlama|ogohlantir|уведомл/i,
    bad: "Shartnomani bekor qilish tartibi ko'rsatilmagan." },
  { key: 'nizo', label: 'Nizolarni hal qilish', sev: 'low',
    re: /nizo|спор|sud|суд|arbitr|арбитраж|muzokara|переговор/i,
    bad: "Nizolarni hal qilish tartibi ko'rsatilmagan." },
  { key: 'imzo', label: "Imzo bo'limi", sev: 'low',
    re: /imzo|подпис|m\.?o['‘]?/i,
    bad: "Imzo va sana bo'limi yo'q." },
];

const RED_FLAGS = [
  { re: /istalgan vaqtda.*bekor|в любой момент.*раст|без объяснени|sababsiz/i, sev: 'high',
    msg: "«Istalgan vaqtda sababsiz bekor qilish» kabi bir tomon foydasiga adolatsiz band aniqlandi." },
  { re: /javobgar emas|не несет ответствен|hech qanday javobgarlik/i, sev: 'high',
    msg: 'Bir tomon «hech qanday javobgarlik olmaydi» degan band bor.' },
];

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
      if (f.re.test(t)) {
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
