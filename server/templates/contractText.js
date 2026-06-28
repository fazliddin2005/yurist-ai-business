// contractText.js
// Har bir hujjat turi uchun sarlavha + bo'limlar (band-bandlar) generatori.
// PDF va DOCX generatorlari ikkisi ham shu bittagina manbadan foydalanadi —
// shunday qilib matn ikki joyda alohida yozilib, bir-biridan farq qilib qolmaydi.

function today() {
  return new Date().toLocaleDateString('ru-RU');
}

// Har bir bo'lim: { type:'h1'|'h2'|'p'|'sig', text, bold, align }
function buildSections(doc) {
  const data = doc.data || {};
  const key = (doc.templateKey || '').toLowerCase();
  const name = (doc.name || '').toLowerCase();
  const is = (k) => key === k || name.includes(k);
  const S = [];
  const h1 = (t) => S.push({ type: 'h1', text: t });
  const h2 = (t) => S.push({ type: 'h2', text: t });
  const p = (t, bold) => S.push({ type: 'p', text: t, bold: !!bold });
  const right = (t) => S.push({ type: 'p', text: t, align: 'right' });
  const sig = (l1, n1, l2, n2) =>
    S.push({ type: 'sig', col1: { label: l1, name: n1 }, col2: { label: l2, name: n2 } });

  const header = (title) => {
    h1(title);
    right(`No. _______`);
    p(`${today()}, Toshkent shahri`);
  };

  // B2B erkin matnli hujjatlar (CLM shablonidan to'ldirilgan) -- bandlarga
  // ajratilmaydi, shunchaki sarlavha + paragraflar sifatida chiqariladi.
  if (is('b2b_freeform')) {
    h1(doc.name || 'Hujjat');
    right(`No. _______`);
    p(`${today()}, Toshkent shahri`);
    const text = data.obj || '';
    text.split(/\n+/).filter(Boolean).forEach((line) => p(line));
    return S;
  }

  // B2C AI tomonidan erkin so'rovdan yaratilgan hujjat -- AI o'zi to'liq
  // formatlangan matn qaytaradi, biz uni qatorma-qator h1/h2/p ga ajratamiz.
  if (is('ai_freeform')) {
    const text = data.obj || '';
    const lines = text.split(/\n+/).filter((l) => l.trim());
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (idx === 0) { h1(trimmed); return; }
      // "1. BO'LIM NOMI" yoki butunlay katta harfli qisqa qator -- bo'lim sarlavhasi
      if (/^\d+\.\s*[A-ZА-ЯӘҒҚҲ]/.test(trimmed) || (trimmed === trimmed.toUpperCase() && trimmed.length < 60 && /[A-ZА-ЯӘҒҚҲ]/.test(trimmed))) {
        h2(trimmed);
      } else if (/^№/.test(trimmed) || /^No\./.test(trimmed)) {
        right(trimmed);
      } else {
        p(trimmed);
      }
    });
    return S;
  }

  if (is('rent') || (name.includes('ijara') && !name.includes('avtomobil'))) {
    header('IJARA SHARTNOMASI');
    h2('1. SHARTNOMA TOMONLARI');
    p(`Ushbu shartnoma bir tomondan ${data.p1 || '________________'} (keyingi o'rinlarda «Ijaraga beruvchi» deb yuritiladi) va ikkinchi tomondan ${data.p2 || '________________'} (keyingi o'rinlarda «Ijarachi» deb yuritiladi), birgalikda «Tomonlar» deb yuritiluvchilar o'rtasida quyidagilar to'g'risida tuzildi.`);
    h2('2. SHARTNOMA PREDMETI');
    p(`2.1. Ijaraga beruvchi quyidagi mol-mulkni Ijarachiga vaqtinchalik egalik qilish va foydalanishga topshiradi: ${data.obj || '________________'}.`);
    p(`2.2. Mol-mulk Ijaraga beruvchiga mulk huquqi asosida tegishli bo'lib, garovga qo'yilmagan, hibsda emas va uchinchi shaxslarning huquqlari bilan cheklanmagan.`);
    p(`2.3. Mol-mulk Ijarachiga texnik soz holatda, dalolatnoma asosida topshiriladi.`);
    h2('3. IJARA HAQI VA HISOB-KITOB TARTIBI');
    p(`3.1. Oylik ijara haqi ${data.price || '________________'} so'm miqdorida belgilanadi.`);
    p(`3.2. Ijara haqi har oyning 5-sanasigacha naqd yoki bank o'tkazmasi orqali to'lab boriladi.`);
    p(`3.3. Ijarachi shartnoma imzolanganda bir oylik to'lov miqdorida kafolat puli (deposit) topshiradi.`);
    p(`3.4. Kommunal to'lovlar (elektr, suv, gaz, internet), agar Tomonlar boshqacha kelishmagan bo'lsa, Ijarachi zimmasiga yuklatiladi.`);
    h2('4. IJARA MUDDATI');
    p(`4.1. Shartnoma ${data.term || today()} sanasidan kuchga kiradi va 12 (o'n ikki) oy davomida amal qiladi.`);
    p(`4.2. Muddat tugashidan 30 kun oldin Tomonlar e'tiroz bildirmasa, shartnoma o'sha shartlarda yana bir muddatga uzaytirilgan hisoblanadi.`);
    h2('5. TOMONLARNING HUQUQ VA MAJBURIYATLARI');
    p(`5.1. Ijaraga beruvchi mol-mulkni soz holatda topshirishi, Ijarachining tinch foydalanishini ta'minlashi va kapital ta'mirlash ishlarini o'z hisobidan bajarishi shart.`);
    p(`5.2. Ijarachi mol-mulkdan faqat maqsadli foydalanishi, uni toza va soz saqlashi, ijara haqini o'z vaqtida to'lashi va joriy ta'mirlashni o'z hisobidan bajarishi shart.`);
    p(`5.3. Ijarachi Ijaraga beruvchining yozma roziligisiz mol-mulkni uchinchi shaxsga subijaraga bera olmaydi.`);
    h2('6. TOMONLARNING JAVOBGARLIGI');
    p(`6.1. Ijara haqi kechiktirib to'langan har bir kun uchun Ijarachi to'lanmagan summaning 0,1% miqdorida penya to'laydi.`);
    p(`6.2. Mol-mulkka yetkazilgan zarar aybdor tomon tomonidan to'liq qoplanadi.`);
    h2('7. SHARTNOMANI BEKOR QILISH');
    p(`7.1. Shartnoma Tomonlarning o'zaro kelishuvi bilan istalgan vaqtda bekor qilinishi mumkin.`);
    p(`7.2. Har bir Tomon kamida 30 kun oldin yozma ogohlantirish yuborib, shartnomani bir tomonlama bekor qilishga haqli.`);
    h2('8. YAKUNIY QOIDALAR');
    p(`8.1. Nizolar muzokaralar yo'li bilan, kelishuvga erishilmasa O'zbekiston Respublikasi qonunchiligiga muvofiq sud tartibida hal qilinadi.`);
    p(`8.2. Shartnoma bir xil yuridik kuchga ega ikki nusxada tuzildi.`);
    sig('IJARAGA BERUVCHI', data.p1, 'IJARACHI', data.p2);
    return S;
  }

  if (is('employment') || name.includes('mehnat')) {
    header('MEHNAT SHARTNOMASI');
    h2('1. SHARTNOMA TOMONLARI');
    p(`Ushbu mehnat shartnomasi ish beruvchi ${data.p1 || '________________'} (keyingi o'rinlarda «Ish beruvchi») va xodim ${data.p2 || '________________'} (keyingi o'rinlarda «Xodim») o'rtasida O'zbekiston Respublikasi Mehnat kodeksiga muvofiq tuzildi.`);
    h2('2. SHARTNOMA PREDMETI');
    p(`2.1. Xodim quyidagi lavozim/ish bo'yicha mehnat vazifalarini bajaradi: ${data.obj || '________________'}.`);
    p(`2.2. Ish joyi Ish beruvchining manzili bo'yicha belgilanadi.`);
    h2('3. ISH HAQI');
    p(`3.1. Xodimga oylik ish haqi ${data.price || '________________'} so'm miqdorida belgilanadi.`);
    p(`3.2. Ish haqi har oyda ikki marta, qonunda belgilangan muddatlarda to'lab boriladi.`);
    h2('4. ISH VAQTI VA DAM OLISH');
    p(`4.1. Xodimga haftasiga 40 soatlik ish vaqti belgilanadi (5 kunlik ish haftasi).`);
    p(`4.2. Xodimga yiliga kamida 21 ish kuni haq to'lanadigan mehnat ta'tili beriladi.`);
    h2('5. SINOV MUDDATI');
    p(`5.1. Xodimga 3 (uch) oygacha sinov muddati belgilanishi mumkin.`);
    h2('6. TOMONLARNING MAJBURIYATLARI');
    p(`6.1. Ish beruvchi xavfsiz mehnat sharoitini ta'minlashi va ish haqini o'z vaqtida to'lashi shart.`);
    p(`6.2. Xodim mehnat intizomiga rioya qilishi va o'z vazifalarini vijdonan bajarishi shart.`);
    h2('7. SHARTNOMANI BEKOR QILISH');
    p(`7.1. Shartnoma Mehnat kodeksida nazarda tutilgan asoslarga ko'ra bekor qilinishi mumkin.`);
    p(`7.2. Xodim kamida 2 hafta oldin yozma ariza berib ishdan bo'shashga haqli.`);
    h2('8. YAKUNIY QOIDALAR');
    p(`8.1. Nizolar muzokaralar, kelishuvga erishilmasa sud tartibida hal qilinadi.`);
    sig('ISH BERUVCHI', data.p1, 'XODIM', data.p2);
    return S;
  }

  if (is('poa') || name.includes('ishonchnoma')) {
    header('ISHONCHNOMA');
    h2('1. ISHONCH BILDIRUVCHI');
    p(`Men, ${data.p1 || '________________'}, ushbu ishonchnoma bilan quyidagi shaxsga vakolat beraman.`);
    h2('2. ISHONCHLI VAKIL');
    p(`${data.p2 || '________________'} nomiga quyidagi harakatlarni amalga oshirish vakolati beriladi.`);
    h2('3. VAKOLAT DOIRASI');
    p(`3.1. ${data.obj || '________________'}.`);
    p(`3.2. Vakil yuqoridagi vazifalarni bajarish uchun zarur barcha hujjatlarni imzolash, arizalar berish va davlat organlariga murojaat qilish huquqiga ega.`);
    h2('4. AMAL QILISH MUDDATI');
    p(`4.1. Ushbu ishonchnoma ${data.price || '________________'} muddatga beriladi.`);
    p(`4.2. Ishonchnoma Ishonch bildiruvchi tomonidan istalgan vaqtda bekor qilinishi mumkin.`);
    h2('5. YAKUNIY QOIDALAR');
    p(`5.1. Ishonchnoma O'zbekiston Respublikasi Fuqarolik kodeksiga muvofiq tuzilgan va notarial tasdiqlanishi lozim.`);
    sig('ISHONCH BILDIRUVCHI', data.p1, 'ISHONCHLI VAKIL', data.p2);
    return S;
  }

  if (is('loan') || name.includes('qarz')) {
    header('QARZ SHARTNOMASI');
    h2('1. SHARTNOMA TOMONLARI');
    p(`Ushbu shartnoma qarz beruvchi ${data.p1 || '________________'} va qarz oluvchi ${data.p2 || '________________'} o'rtasida tuzildi.`);
    h2('2. SHARTNOMA PREDMETI');
    p(`2.1. Qarz beruvchi qarz oluvchiga ${data.price || '________________'} so'm miqdorida pul mablag'ini qarzga beradi.`);
    p(`2.2. Qarz maqsadi: ${data.obj || '________________'}.`);
    h2('3. QAYTARISH TARTIBI VA MUDDATI');
    p(`3.1. Qarz oluvchi olingan summani to'liq, belgilangan muddatda qaytarishi shart.`);
    p(`3.2. Pul mablag'i naqd yoki bank o'tkazmasi orqali qaytariladi.`);
    h2('4. JAVOBGARLIK');
    p(`4.1. Qarz o'z vaqtida qaytarilmasa, har bir kechiktirilgan kun uchun qoldiq summaning 0,1% miqdorida penya undiriladi.`);
    h2('5. YAKUNIY QOIDALAR');
    p(`5.1. Nizolar muzokaralar, kelishuvga erishilmasa sud tartibida hal qilinadi.`);
    p(`5.2. Shartnoma ikki nusxada tuzildi.`);
    sig('QARZ BERUVCHI', data.p1, 'QARZ OLUVCHI', data.p2);
    return S;
  }

  if (is('car') || name.includes('avtomobil')) {
    header('AVTOMOBIL IJARASI SHARTNOMASI');
    h2('1. SHARTNOMA TOMONLARI');
    p(`Ushbu shartnoma Ijaraga beruvchi ${data.p1 || '________________'} va Ijarachi ${data.p2 || '________________'} o'rtasida tuzildi.`);
    h2('2. SHARTNOMA PREDMETI');
    p(`2.1. Ijaraga beruvchi quyidagi avtotransport vositasini ijaraga beradi: ${data.obj || '________________'}.`);
    p(`2.2. Avtomobil texnik soz holatda, ro'yxatdan o'tgan va sug'urtalangan holda topshiriladi.`);
    h2('3. IJARA HAQI');
    p(`3.1. Ijara haqi ${data.price || '________________'} so'm miqdorida belgilanadi.`);
    h2('4. TOMONLARNING MAJBURIYATLARI');
    p(`4.1. Ijarachi avtomobildan ehtiyotkorlik bilan foydalanishi, yoqilg'i va joriy xizmat ko'rsatishni o'z hisobidan ta'minlashi shart.`);
    p(`4.2. Yo'l harakati qoidalari buzilishi natijasida kelib chiqqan jarimalar Ijarachi zimmasiga yuklatiladi.`);
    h2('5. JAVOBGARLIK');
    p(`5.1. Avtomobilga yetkazilgan zarar aybdor tomon tomonidan to'liq qoplanadi.`);
    h2('6. YAKUNIY QOIDALAR');
    p(`6.1. Nizolar sud tartibida hal qilinadi. Shartnoma ikki nusxada tuzildi.`);
    sig('IJARAGA BERUVCHI', data.p1, 'IJARACHI', data.p2);
    return S;
  }

  if (is('service') || name.includes('xizmat')) {
    header("XIZMAT KO'RSATISH SHARTNOMASI");
    h2('1. SHARTNOMA TOMONLARI');
    p(`Ushbu shartnoma Buyurtmachi ${data.p1 || '________________'} va Ijrochi ${data.p2 || '________________'} o'rtasida tuzildi.`);
    h2('2. SHARTNOMA PREDMETI');
    p(`2.1. Ijrochi quyidagi xizmatlarni ko'rsatish majburiyatini oladi: ${data.obj || '________________'}.`);
    h2("3. XIZMAT QIYMATI VA TO'LOV");
    p(`3.1. Xizmatlar qiymati ${data.price || '________________'} so'm miqdorida belgilanadi.`);
    p(`3.2. To'lov ish bajarilganidan so'ng, dalolatnoma imzolangach amalga oshiriladi.`);
    h2('4. TOMONLARNING MAJBURIYATLARI');
    p(`4.1. Ijrochi xizmatni sifatli va belgilangan muddatda bajarishi shart.`);
    p(`4.2. Buyurtmachi qabul qilingan xizmat uchun o'z vaqtida to'lovni amalga oshirishi shart.`);
    h2('5. JAVOBGARLIK');
    p(`5.1. Majburiyatlar buzilganda aybdor tomon qonunchilikka muvofiq javobgar bo'ladi.`);
    h2('6. YAKUNIY QOIDALAR');
    p(`6.1. Nizolar sud tartibida hal qilinadi. Shartnoma ikki nusxada tuzildi.`);
    sig('BUYURTMACHI', data.p1, 'IJROCHI', data.p2);
    return S;
  }

  if (is('marriage') || name.includes('nikoh')) {
    header('NIKOH SHARTNOMASI');
    h2('1. SHARTNOMA TOMONLARI');
    p(`Ushbu nikoh shartnomasi ${data.p1 || '________________'} va ${data.p2 || '________________'} o'rtasida, ularning nikohi davomida va undan keyingi mol-mulkiy munosabatlarini tartibga solish maqsadida tuzildi.`);
    h2('2. SHARTNOMA PREDMETI');
    p(`2.1. ${data.obj || 'Tomonlarning nikoh davridagi va undan keyingi mol-mulkiy huquq va majburiyatlari.'}`);
    p(`2.2. Nikohgacha va nikoh davrida orttirilgan mol-mulk alohida yoki umumiy mulk sifatida belgilanadi (Tomonlar kelishuviga ko'ra).`);
    h2('3. MOL-MULKIY MUNOSABATLAR');
    p(`3.1. Umumiy qiymat: ${data.price || '________________'} so'm miqdoridagi mol-mulk ushbu shartnoma asosida taqsimlanadi.`);
    p(`3.2. Har bir tomon o'z shaxsiy mol-mulkiga (nikohdan oldin orttirilgan, meros, sovga) mustaqil egalik qiladi.`);
    h2('4. AJRALISH HOLATIDA TARTIB');
    p(`4.1. Nikoh bekor qilingan taqdirda mol-mulk ushbu shartnomada belgilangan tartibda taqsimlanadi.`);
    h2('5. YAKUNIY QOIDALAR');
    p(`5.1. Shartnoma notarial tasdiqlanishi shart (Oila kodeksi 41-modda).`);
    p(`5.2. Nizolar muzokaralar, kelishuvga erishilmasa sud tartibida hal qilinadi.`);
    sig('BIRINCHI TOMON', data.p1, 'IKKINCHI TOMON', data.p2);
    return S;
  }

  if (is('donation') || name.includes('sovga') || name.includes('hadiya')) {
    header('HADIYA (SOVGA) SHARTNOMASI');
    h2('1. SHARTNOMA TOMONLARI');
    p(`Ushbu shartnoma Hadiya etuvchi ${data.p1 || '________________'} va Hadiya oluvchi ${data.p2 || '________________'} o'rtasida tuzildi.`);
    h2('2. SHARTNOMA PREDMETI');
    p(`2.1. Hadiya etuvchi quyidagi mol-mulkni Hadiya oluvchiga bepul, qaytarib berilmaydigan tarzda topshiradi: ${data.obj || '________________'}.`);
    p(`2.2. Mol-mulk qiymati: ${data.price || '________________'} so'm.`);
    h2('3. MOL-MULKNI TOPSHIRISH TARTIBI');
    p(`3.1. Mol-mulk dalolatnoma asosida, shartnoma imzolangan kundan boshlab topshiriladi.`);
    p(`3.2. Hadiya oluvchi mol-mulkni qabul qilishga yoki rad etishga haqli.`);
    h2('4. TOMONLARNING KAFOLATLARI');
    p(`4.1. Hadiya etuvchi mol-mulkning huquqiy tozaligi (garovsiz, hibssiz) uchun javobgardir.`);
    h2('5. YAKUNIY QOIDALAR');
    p(`5.1. Ko'chmas mulk hadiya qilinganda shartnoma notarial tasdiqlanishi va davlat ro'yxatidan o'tishi shart.`);
    p(`5.2. Nizolar sud tartibida hal qilinadi.`);
    sig('HADIYA ETUVCHI', data.p1, 'HADIYA OLUVCHI', data.p2);
    return S;
  }

  if (is('nda') || name.includes('maxfiylik')) {
    header('MAXFIYLIK TO\'G\'RISIDA SHARTNOMA (NDA)');
    h2('1. SHARTNOMA TOMONLARI');
    p(`Ushbu shartnoma Oshkor qiluvchi tomon ${data.p1 || '________________'} va Qabul qiluvchi tomon ${data.p2 || '________________'} o'rtasida tuzildi.`);
    h2('2. MAXFIY MA\'LUMOT TUSHUNCHASI');
    p(`2.1. Ushbu shartnoma doirasida maxfiy ma'lumot deb quyidagilar tushuniladi: ${data.obj || 'tijorat siri, texnik, moliyaviy va boshqa oshkor etilmaydigan ma\'lumotlar'}.`);
    h2('3. TOMONLARNING MAJBURIYATLARI');
    p(`3.1. Qabul qiluvchi tomon maxfiy ma'lumotni uchinchi shaxslarga oshkor etmaslik majburiyatini oladi.`);
    p(`3.2. Maxfiy ma'lumotdan faqat shartnomada belgilangan maqsadda foydalaniladi.`);
    h2('4. AMAL QILISH MUDDATI');
    p(`4.1. Ushbu shartnoma ${data.price || '3 yil'} davomida amal qiladi, shartnoma tugagandan keyin ham maxfiylik majburiyati saqlanadi.`);
    h2('5. JAVOBGARLIK');
    p(`5.1. Maxfiylik buzilgan taqdirda aybdor tomon yetkazilgan zararni to'liq qoplaydi.`);
    h2('6. YAKUNIY QOIDALAR');
    p(`6.1. Nizolar sud tartibida hal qilinadi. Shartnoma ikki nusxada tuzildi.`);
    sig('OSHKOR QILUVCHI TOMON', data.p1, 'QABUL QILUVCHI TOMON', data.p2);
    return S;
  }

  if (is('termination') || name.includes('bekor qilish')) {
    header('SHARTNOMANI BEKOR QILISH TO\'G\'RISIDA BITIM');
    h2('1. TOMONLAR');
    p(`Ushbu bitim ${data.p1 || '________________'} va ${data.p2 || '________________'} o'rtasida ilgari tuzilgan shartnomani bekor qilish to'g'risida tuzildi.`);
    h2('2. BEKOR QILINAYOTGAN SHARTNOMA');
    p(`2.1. ${data.obj || 'Tomonlar o\'rtasida ilgari tuzilgan shartnoma'} ${data.term || today()} sanadan boshlab bekor qilinadi.`);
    h2('3. O\'ZARO HISOB-KITOBLAR');
    p(`3.1. Tomonlar o'rtasidagi moliyaviy majburiyatlar: ${data.price || '________________'} so'm miqdorida yopiladi/qaytariladi.`);
    p(`3.2. Tomonlar bir-biriga nisbatan boshqa da'volari yo'qligini tasdiqlaydilar.`);
    h2('4. YAKUNIY QOIDALAR');
    p(`4.1. Ushbu bitim imzolangan kundan boshlab asosiy shartnoma o'z kuchini yo'qotadi.`);
    p(`4.2. Nizolar sud tartibida hal qilinadi.`);
    sig('BIRINCHI TOMON', data.p1, 'IKKINCHI TOMON', data.p2);
    return S;
  }

  if (is('will') || name.includes('vasiyatnoma')) {
    header('VASIYATNOMA');
    h2('1. VASIYAT QILUVCHI');
    p(`Men, ${data.p1 || '________________'}, sog' aqlda va o'z ixtiyorim bilan ushbu vasiyatnomani tuzaman.`);
    h2('2. MEROSXO\'R(LAR)');
    p(`2.1. O'limimdan keyin quyidagi mol-mulkimni ${data.p2 || '________________'} ga vasiyat qilaman: ${data.obj || '________________'}.`);
    p(`2.2. Mol-mulk qiymati taxminan: ${data.price || '________________'} so'm.`);
    h2('3. VASIYATNI BAJARUVCHI');
    p(`3.1. Ushbu vasiyatnomani bajarish notarial idora yoki vasiy tomonidan amalga oshiriladi.`);
    h2('4. YAKUNIY QOIDALAR');
    p(`4.1. Ushbu vasiyatnoma notarial tasdiqlanishi shart (Fuqarolik kodeksi merosga oid bo'limi).`);
    p(`4.2. Vasiyat qiluvchi vasiyatnomani istalgan vaqtda o'zgartirish yoki bekor qilish huquqiga ega.`);
    sig('VASIYAT QILUVCHI', data.p1, 'GUVOH', data.p2);
    return S;
  }

  if (is('partnership') || name.includes('hamkorlik')) {
    header('HAMKORLIK (SHERIKLIK) SHARTNOMASI');
    h2('1. SHARTNOMA TOMONLARI');
    p(`Ushbu shartnoma ${data.p1 || '________________'} va ${data.p2 || '________________'} o'rtasida qo'shma faoliyat yuritish maqsadida tuzildi.`);
    h2('2. SHARTNOMA PREDMETI');
    p(`2.1. Tomonlar quyidagi sohada hamkorlik qiladilar: ${data.obj || '________________'}.`);
    h2('3. ULUSHLAR VA FOYDA TAQSIMOTI');
    p(`3.1. Umumiy investitsiya/ulush: ${data.price || '________________'} so'm.`);
    p(`3.2. Foyda va zarar tomonlar o'rtasida teng (yoki kelishilgan nisbatda) taqsimlanadi.`);
    h2('4. TOMONLARNING MAJBURIYATLARI');
    p(`4.1. Har bir tomon o'z ulushini o'z vaqtida qo'shishi va loyihada faol qatnashishi shart.`);
    h2('5. SHARTNOMANI BEKOR QILISH');
    p(`5.1. Hamkorlik tomonlarning o'zaro kelishuvi bilan yoki 30 kun oldin ogohlantirish bilan tugatilishi mumkin.`);
    h2('6. YAKUNIY QOIDALAR');
    p(`6.1. Nizolar sud tartibida hal qilinadi. Shartnoma ikki nusxada tuzildi.`);
    sig('BIRINCHI SHERIK', data.p1, 'IKKINCHI SHERIK', data.p2);
    return S;
  }

  if (is('contractor') || name.includes('pudrat')) {
    header('PUDRAT SHARTNOMASI');
    h2('1. SHARTNOMA TOMONLARI');
    p(`Ushbu shartnoma Buyurtmachi ${data.p1 || '________________'} va Pudratchi ${data.p2 || '________________'} o'rtasida tuzildi.`);
    h2('2. SHARTNOMA PREDMETI');
    p(`2.1. Pudratchi quyidagi ishlarni bajarish majburiyatini oladi: ${data.obj || '________________'}.`);
    h2('3. ISH QIYMATI VA TO\'LOV TARTIBI');
    p(`3.1. Ishning umumiy qiymati: ${data.price || '________________'} so'm.`);
    p(`3.2. To'lov bosqichma-bosqich, ish hajmi bo'yicha dalolatnoma asosida amalga oshiriladi.`);
    h2('4. ISH MUDDATI VA SIFATI');
    p(`4.1. Ish ${data.term || today()} sanagacha yakunlanishi shart.`);
    p(`4.2. Pudratchi ishni belgilangan sifat me'yorlariga muvofiq bajarishi shart, kamchiliklar aniqlansa o'z hisobidan tuzatadi.`);
    h2('5. JAVOBGARLIK');
    p(`5.1. Muddat buzilganda Pudratchi har bir kechiktirilgan kun uchun shartnoma qiymatining 0,1% miqdorida penya to'laydi.`);
    h2('6. YAKUNIY QOIDALAR');
    p(`6.1. Nizolar sud tartibida hal qilinadi. Shartnoma ikki nusxada tuzildi.`);
    sig('BUYURTMACHI', data.p1, 'PUDRATCHI', data.p2);
    return S;
  }

  if (is('renovation') || name.includes('tamir')) {
    header('TA\'MIRLASH ISHLARI SHARTNOMASI');
    h2('1. SHARTNOMA TOMONLARI');
    p(`Ushbu shartnoma Buyurtmachi ${data.p1 || '________________'} va Ijrochi ${data.p2 || '________________'} o'rtasida tuzildi.`);
    h2('2. SHARTNOMA PREDMETI');
    p(`2.1. Ijrochi quyidagi obyektda ta'mirlash ishlarini bajaradi: ${data.obj || '________________'}.`);
    h2('3. ISH QIYMATI VA TO\'LOV');
    p(`3.1. Ishlarning umumiy qiymati: ${data.price || '________________'} so'm.`);
    p(`3.2. To'lov: 30% boshlanishida, qolgani ish yakunida dalolatnoma asosida.`);
    h2('4. MATERIALLAR');
    p(`4.1. Qurilish materiallari, agar boshqacha kelishilmagan bo'lsa, Buyurtmachi tomonidan ta'minlanadi.`);
    h2('5. KAFOLAT');
    p(`5.1. Bajarilgan ishlarga 1 (bir) yil kafolat muddati beriladi.`);
    h2('6. YAKUNIY QOIDALAR');
    p(`6.1. Nizolar sud tartibida hal qilinadi. Shartnoma ikki nusxada tuzildi.`);
    sig('BUYURTMACHI', data.p1, 'IJROCHI', data.p2);
    return S;
  }

  // Standart: Oldi-sotdi / Ko'chmas mulk shartnomasi
  header((doc.name || 'OLDI-SOTDI SHARTNOMASI').toUpperCase());
  h2('1. SHARTNOMA TOMONLARI');
  p(`Ushbu shartnoma Sotuvchi ${data.p1 || '________________'} va Xaridor ${data.p2 || '________________'} o'rtasida tuzildi.`);
  h2('2. SHARTNOMA PREDMETI');
  p(`2.1. Sotuvchi quyidagi tovar/mol-mulkni Xaridorga mulk qilib beradi: ${data.obj || '________________'}.`);
  p(`2.2. Sotilayotgan mol-mulk garovda, hibsda emas va uchinchi shaxslarning huquqlari bilan cheklanmagan.`);
  h2('3. SHARTNOMA QIYMATI VA HISOB-KITOB');
  p(`3.1. Mol-mulk qiymati ${data.price || '________________'} so'm miqdorida belgilanadi.`);
  p(`3.2. To'lov naqd yoki bank o'tkazmasi orqali shartnoma imzolangan kunda amalga oshiriladi.`);
  h2("4. MULK HUQUQINING O'TISHI");
  p(`4.1. Mol-mulkka bo'lgan mulk huquqi to'lov to'liq amalga oshirilgach Xaridorga o'tadi.`);
  p(`4.2. Mol-mulk dalolatnoma asosida topshiriladi.`);
  h2('5. TOMONLARNING JAVOBGARLIGI');
  p(`5.1. Majburiyatlar buzilganda aybdor tomon qonunchilikka muvofiq javobgar bo'ladi.`);
  h2('6. YAKUNIY QOIDALAR');
  p(`6.1. Nizolar muzokaralar, kelishuvga erishilmasa sud tartibida hal qilinadi.`);
  p(`6.2. Shartnoma bir xil yuridik kuchga ega ikki nusxada tuzildi.`);
  sig('SOTUVCHI', data.p1, 'XARIDOR', data.p2);
  return S;
}

module.exports = { buildSections, today };
