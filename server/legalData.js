// legalData.js -- 8 davlat uchun qonunlar ro'yxati, rasmiy manbalar va Konstitutsiya namunalari.
// Frontend (yurist-ai.html) bilan bir xil ma'lumotlar -- backend orqali xizmat qiladi.

const LEGAL_DB = {
  UZ:{flag:'🇺🇿',name:'O‘zbekiston',official:'https://lex.uz',officialName:'lex.uz',caseLawSource:'https://sud.uz',
    constTitle:'O‘zbekiston Respublikasi Konstitutsiyasi',constSub:'Davlatning asosiy qonuni — 1992 yil 8 dekabr qabul qilingan',
    laws:[
      {ic:'📜',name:"Konstitutsiya",desc:"Davlatning asosiy qonuni",key:'const',url:'https://lex.uz/docs/6445145'},
      {ic:'⚖️',name:"Fuqarolik kodeksi",desc:"Fuqarolik huquqiy munosabatlari",key:'civil',url:'https://lex.uz/docs/-111189'},
      {ic:'🔒',name:"Jinoyat kodeksi",desc:"Jinoyat javobgarligi",key:'crim',url:'https://lex.uz/docs/-111453'},
      {ic:'💼',name:"Mehnat kodeksi",desc:"Mehnat munosabatlari",key:'labor',url:'https://lex.uz/docs/-6257288'},
      {ic:'💰',name:"Soliq kodeksi",desc:"Soliq to‘lovlari va imtiyozlar",key:'tax',url:'https://lex.uz/docs/-4674902'},
      {ic:'👨‍👩‍👧',name:"Oila kodeksi",desc:"Nikoh va oilaviy munosabatlar",key:'family',url:'https://lex.uz/docs/104723'},
      {ic:'📋',name:"Ma'muriy javobgarlik kodeksi",desc:"Ma'muriy huquqbuzarliklar",key:'admin',url:'https://lex.uz/docs/97661'},
      {ic:'🏞️',name:"Yer kodeksi",desc:"Yer huquqiy munosabatlari",key:'land',url:'https://lex.uz/docs/146859'},
    ],
    const:[
      {sec:"I BO‘LIM. ASOSIY QOIDALAR",arts:[
        {no:'1-modda',t:'Davlat suvereniteti',b:'O‘zbekiston — suveren demokratik respublika. Davlat va uning organlarining nomi bir xil ma’noga ega: O‘zbekiston Respublikasi va O‘zbekiston.'},
        {no:'2-modda',t:'Xalq hokimiyati',b:'Davlat xalq irodasini ifodalaydi va uning manfaatlariga xizmat qiladi. Davlat organlari va mansabdor shaxslar jamiyat va fuqarolar oldida javobgardirlar.'},
        {no:'4-modda',t:'Davlat tili',b:'O‘zbekiston Respublikasining davlat tili o‘zbek tilidir.'},
        {no:'6-modda',t:'Poytaxt',b:'O‘zbekiston Respublikasining poytaxti — Toshkent shahridir.'},
      ]},
      {sec:"II BO‘LIM. INSON HUQUQLARI",arts:[
        {no:'18-modda',t:'Fuqarolarning tengligi',b:'Barcha fuqarolar bir xil huquq va erkinliklarga ega bo‘lib, jinsi, irqi, millati, tili, dini, ijtimoiy kelib chiqishidan qat’i nazar, qonun oldida tengdirlar.'},
        {no:'24-modda',t:'Yashash huquqi',b:'Yashash huquqi har bir insonning uzviy huquqidir. Inson hayotiga suiqasd qilish eng og‘ir jinoyatdir.'},
      ]},
    ]},

  KZ:{flag:'🇰🇿',name:'Qozog‘iston',official:'https://adilet.zan.kz',officialName:'adilet.zan.kz',
    constTitle:'Қазақстан Республикасының Конституциясы',constSub:'Мемлекеттің негізгі заңы — 1995 жылы 30 тамызда қабылданған',
    laws:[
      {ic:'📜',name:"Конституция",desc:"Мемлекеттің негізгі заңы",key:'const',url:'https://adilet.zan.kz/kaz/docs/K950001000_'},
      {ic:'⚖️',name:"Азаматтық кодекс",desc:"Азаматтық-құқықтық қатынастар",key:'civil',url:'https://adilet.zan.kz/kaz/docs/K940001000_'},
      {ic:'🔒',name:"Қылмыстық кодекс",desc:"Қылмыстық жауаптылық",key:'crim',url:'https://adilet.zan.kz/kaz/docs/K1400000226'},
      {ic:'💼',name:"Еңбек кодексі",desc:"Еңбек қатынастары",key:'labor',url:'https://adilet.zan.kz/kaz/docs/K1500000414'},
      {ic:'💰',name:"Салық кодексі",desc:"Салықтар мен жеңілдіктер",key:'tax',url:'https://adilet.zan.kz/kaz/docs/K1700000120'},
      {ic:'👨‍👩‍👧',name:"Неке және отбасы кодексі",desc:"Неке және отбасылық қатынастар",key:'family',url:'https://adilet.zan.kz/kaz/docs/K1100000518'},
      {ic:'🏞️',name:"Жер кодексі",desc:"Жер-құқықтық қатынастар",key:'land',url:'https://adilet.zan.kz/kaz/docs/K030000442_'},
    ],
    const:[
      {sec:"I БӨЛІМ. ЖАЛПЫ ЕРЕЖЕЛЕР",arts:[
        {no:'1-бап',t:'Мемлекет негіздері',b:'Қазақстан Республикасы өзін демократиялық, зайырлы, құқықтық және әлеуметтік мемлекет ретінде орнықтырады, оның ең қымбат қазынасы — адам және адамның өмірі, құқықтары мен бостандықтары.'},
        {no:'2-бап',t:'Мемлекет құрылысы',b:'Қазақстан Республикасы — президенттік басқару нысанындағы біртұтас мемлекет. Республика өз аумағының тұтастығын, қол сұғылмаушылығын және бөлінбейтіндігін қамтамасыз етеді.'},
        {no:'3-бап',t:'Билік қайнар көзі',b:'Мемлекеттік биліктің бірден-бір қайнар көзі — халық. Халық билікті тікелей республикалық референдум мен еркін сайлау арқылы жүзеге асырады.'},
      ]},
      {sec:"II БӨЛІМ. АДАМ ЖӘНЕ АЗАМАТ",arts:[
        {no:'14-бап',t:'Заң алдындағы теңдік',b:'Барлық адам заң мен сот алдында тең. Тегіне, әлеуметтік жағдайына, лауазымына, жынысына, нәсіліне, ұлтына, тіліне немесе дініне қарай ешкімді кемсітуге болмайды.'},
      ]},
    ]},

  KG:{flag:'🇰🇬',name:'Qirg‘iziston',official:'https://cbd.minjust.gov.kg',officialName:'cbd.minjust.gov.kg',
    constTitle:'Кыргыз Республикасынын Конституциясы',constSub:'Мамлекеттин негизги мыйзамы — 2021-жылы референдумда кабыл алынган',
    laws:[
      {ic:'📜',name:"Конституция",desc:"Мамлекеттин негизги мыйзамы",key:'const',url:'https://cbd.minjust.gov.kg/112213/edition/1290127/ky'},
      {ic:'⚖️',name:"Жарандык кодекс",desc:"Жарандык-укуктук мамилелер",key:'civil',url:'https://cbd.minjust.gov.kg/4-1/edition/1117932/ky'},
      {ic:'🔒',name:"Кылмыш-жаза кодекси",desc:"Кылмыштык жоопкерчилик",key:'crim',url:'https://cbd.minjust.gov.kg/112309/edition/1292943/ky'},
      {ic:'💼',name:"Эмгек кодекси",desc:"Эмгек мамилелери",key:'labor',url:'https://cbd.minjust.gov.kg/1505/edition/1118226/ky'},
      {ic:'💰',name:"Салык кодекси",desc:"Салыктар жана жеңилдиктер",key:'tax',url:'https://cbd.minjust.gov.kg/112338/edition/1293074/ky'},
      {ic:'👨‍👩‍👧',name:"Үй-бүлө кодекси",desc:"Нике жана үй-бүлөлүк мамилелер",key:'family',url:'https://cbd.minjust.gov.kg/4-2/edition/1118207/ky'},
      {ic:'🏞️',name:"Жер кодекси",desc:"Жер-укуктук мамилелер",key:'land',url:'https://cbd.minjust.gov.kg/8/edition/1118269/ky'},
    ],
    const:[
      {sec:"I БӨЛҮМ. КОНСТИТУЦИЯЛЫК ТҮЗҮЛҮШ",arts:[
        {no:'1-берене',t:'Мамлекеттик эгемендик',b:'Кыргыз Республикасы (Кыргызстан) — эгемен, демократиялык, укуктук, светтик, унитардык, социалдык мамлекет. Эгемендик бүт аймакта бөлүнгүс жана толук.'},
        {no:'2-берене',t:'Эл бийлиги',b:'Кыргызстан эли эгемендиктин ээси жана мамлекеттик бийликтин бирден-бир булагы. Эл бийликти түздөн-түз шайлоо жана референдум аркылуу жүзөгө ашырат.'},
      ]},
      {sec:"II БӨЛҮМ. АДАМ УКУКТАРЫ",arts:[
        {no:'24-берене',t:'Теңдик',b:'Бардыгы мыйзам жана сот алдында тең. Жынысы, расасы, тили, майыптыгы, этностук таандыктыгы, ишеними же башка жагдайлары боюнча басмырлоого тыюу салынат.'},
      ]},
    ]},

  TJ:{flag:'🇹🇯',name:'Tojikiston',official:'http://mmk.tj',officialName:'mmk.tj',caseLawSource:'http://mmk.tj',
    constTitle:'Конститутсияи Ҷумҳурии Тоҷикистон',constSub:'Қонуни асосии давлат — 6 ноябри соли 1994 қабул шудааст',
    laws:[
      {ic:'📜',name:"Конститутсия",desc:"Қонуни асосии давлат",key:'const',url:'http://mmk.tj'},
      {ic:'⚖️',name:"Кодекси граждани",desc:"Муносибатҳои ҳуқуқии граждани",key:'civil',url:'http://mmk.tj'},
      {ic:'🔒',name:"Кодекси ҷиноятӣ",desc:"Ҷавобгарии ҷиноятӣ",key:'crim',url:'http://mmk.tj'},
      {ic:'💼',name:"Кодекси меҳнат",desc:"Муносибатҳои меҳнатӣ",key:'labor',url:'http://mmk.tj'},
      {ic:'💰',name:"Кодекси андоз",desc:"Андозҳо ва имтиёзҳо",key:'tax',url:'http://mmk.tj'},
      {ic:'👨‍👩‍👧',name:"Кодекси оила",desc:"Муносибатҳои оилавӣ",key:'family',url:'http://mmk.tj'},
      {ic:'🏞️',name:"Кодекси замин",desc:"Муносибатҳои ҳуқуқии замин",key:'land',url:'http://mmk.tj'},
    ],
    const:[
      {sec:"БОБИ 1. АСОСҲОИ СОХТИ КОНСТИТУТСИОНӢ",arts:[
        {no:'Моддаи 1',t:'Табиати давлат',b:'Ҷумҳурии Тоҷикистон — давлати соҳибихтиёр, демократӣ, ҳуқуқбунёд, дунявӣ ва ягона. Тоҷикистон давлати иҷтимоӣ буда, барои ҳаёти арзандаи ҳар як инсон шароит фароҳам меорад.'},
        {no:'Моддаи 6',t:'Ҳокимияти халқ',b:'Дар Тоҷикистон сарчашмаи ҳокимият халқ аст. Халқ ҳокимияти худро бевосита ва инчунин тавассути мақомоти намояндагӣ амалӣ мегардонад.'},
      ]},
      {sec:"БОБИ 2. ҲУҚУҚҲОИ ИНСОН",arts:[
        {no:'Моддаи 17',t:'Баробарӣ',b:'Ҳама дар назди қонун ва суд баробаранд. Давлат ҳуқуқу озодиҳои ҳар касро новобаста аз миллат, нажод, ҷинс, забон, эътиқод ва мавқеи иҷтимоӣ кафолат медиҳад.'},
      ]},
    ]},

  TM:{flag:'🇹🇲',name:'Turkmaniston',official:'https://minjust.gov.tm',officialName:'minjust.gov.tm',
    constTitle:'Türkmenistanyň Konstitusiýasy',constSub:'Döwletiň esasy kanuny — 1992-nji ýylyň 18-nji maýynda kabul edildi',
    laws:[
      {ic:'📜',name:"Konstitusiýa",desc:"Döwletiň esasy kanuny",key:'const',url:'https://minjust.gov.tm'},
      {ic:'⚖️',name:"Raýat kodeksi",desc:"Raýat-hukuk gatnaşyklary",key:'civil',url:'https://minjust.gov.tm'},
      {ic:'🔒',name:"Jenaýat kodeksi",desc:"Jenaýat jogapkärçiligi",key:'crim',url:'https://minjust.gov.tm'},
      {ic:'💼',name:"Zähmet kodeksi",desc:"Zähmet gatnaşyklary",key:'labor',url:'https://minjust.gov.tm'},
      {ic:'💰',name:"Salgyt kodeksi",desc:"Salgytlar we ýeňillikler",key:'tax',url:'https://minjust.gov.tm'},
      {ic:'👨‍👩‍👧',name:"Maşgala kodeksi",desc:"Maşgala gatnaşyklary",key:'family',url:'https://minjust.gov.tm'},
    ],
    const:[
      {sec:"I BÖLÜM. ESASY DÜZGÜNLER",arts:[
        {no:'1-madda',t:'Döwletiň esaslary',b:'Türkmenistan — demokratik, hukuk we dünýewi döwlet bolup, döwlet dolandyryşy prezident respublikasy görnüşinde amala aşyrylýar.'},
        {no:'3-madda',t:'Adamyň mertebesi',b:'Türkmenistanda jemgyýetiň we döwletiň iň ýokary gymmatlygy adamdyr. Döwlet her bir raýatyň hukuklaryny we azatlyklaryny goramaga jogapkärdir.'},
      ]},
    ]},

  RU:{flag:'🇷🇺',name:'Rossiya Federatsiyasi',official:'http://pravo.gov.ru',officialName:'pravo.gov.ru',caseLawSource:'http://pravo.gov.ru',
    constTitle:'Конституция Российской Федерации',constSub:'Основной закон государства — принята 12 декабря 1993 года',
    laws:[
      {ic:'📜',name:"Конституция",desc:"Основной закон государства",key:'const',url:'http://pravo.gov.ru'},
      {ic:'⚖️',name:"Гражданский кодекс",desc:"Гражданско-правовые отношения",key:'civil',url:'http://pravo.gov.ru'},
      {ic:'🔒',name:"Уголовный кодекс",desc:"Уголовная ответственность",key:'crim',url:'http://pravo.gov.ru'},
      {ic:'💼',name:"Трудовой кодекс",desc:"Трудовые отношения",key:'labor',url:'http://pravo.gov.ru'},
      {ic:'💰',name:"Налоговый кодекс",desc:"Налоги и льготы",key:'tax',url:'http://pravo.gov.ru'},
      {ic:'👨‍👩‍👧',name:"Семейный кодекс",desc:"Брачно-семейные отношения",key:'family',url:'http://pravo.gov.ru'},
      {ic:'🏞️',name:"Земельный кодекс",desc:"Земельно-правовые отношения",key:'land',url:'http://pravo.gov.ru'},
    ],
    const:[
      {sec:"ГЛАВА 1. ОСНОВЫ КОНСТИТУЦИОННОГО СТРОЯ",arts:[
        {no:'Статья 1',t:'Государственный строй',b:'Российская Федерация — Россия есть демократическое федеративное правовое государство с республиканской формой правления.'},
        {no:'Статья 2',t:'Высшая ценность',b:'Человек, его права и свободы являются высшей ценностью. Признание, соблюдение и защита прав и свобод человека — обязанность государства.'},
        {no:'Статья 3',t:'Народовластие',b:'Носителем суверенитета и единственным источником власти в Российской Федерации является её многонациональный народ.'},
      ]},
    ]},

  AZ:{flag:'🇦🇿',name:'Ozarbayjon',official:'https://e-qanun.az',officialName:'e-qanun.az',
    constTitle:'Azərbaycan Respublikasının Konstitusiyası',constSub:'Dövlətin əsas qanunu — 12 noyabr 1995-ci ildə qəbul edilib',
    laws:[
      {ic:'📜',name:"Konstitusiya",desc:"Dövlətin əsas qanunu",key:'const',url:'https://e-qanun.az'},
      {ic:'⚖️',name:"Mülki Məcəllə",desc:"Mülki-hüquqi münasibətlər",key:'civil',url:'https://e-qanun.az'},
      {ic:'🔒',name:"Cinayət Məcəlləsi",desc:"Cinayət məsuliyyəti",key:'crim',url:'https://e-qanun.az'},
      {ic:'💼',name:"Əmək Məcəlləsi",desc:"Əmək münasibətləri",key:'labor',url:'https://e-qanun.az'},
      {ic:'💰',name:"Vergi Məcəlləsi",desc:"Vergilər və güzəştlər",key:'tax',url:'https://e-qanun.az'},
      {ic:'👨‍👩‍👧',name:"Ailə Məcəlləsi",desc:"Nikah və ailə münasibətləri",key:'family',url:'https://e-qanun.az'},
    ],
    const:[
      {sec:"I BÖLMƏ. ÜMUMI MÜDDƏALAR",arts:[
        {no:'Maddə 1',t:'Hakimiyyətin mənbəyi',b:'Azərbaycan Respublikasında dövlət hakimiyyətinin yeganə mənbəyi Azərbaycan xalqıdır.'},
        {no:'Maddə 7',t:'Dövlət quruluşu',b:'Azərbaycan dövləti demokratik, hüquqi, dünyəvi, unitar respublikadır. Dövlət hakimiyyəti hakimiyyətlərin bölünməsi prinsipi əsasında qurulur.'},
      ]},
    ]},

  US:{flag:'🇺🇸',name:'Amerika Qo‘shma Shtatlari',official:'https://www.congress.gov',officialName:'congress.gov',caseLawSource:'https://www.courtlistener.com',
    constTitle:'Constitution of the United States',constSub:'The supreme law of the land — ratified 1788',
    laws:[
      {ic:'📜',name:"Constitution",desc:"The supreme law of the land",key:'const',url:'https://constitution.congress.gov'},
      {ic:'⚖️',name:"U.S. Code",desc:"Federal statutory law",key:'civil',url:'https://uscode.house.gov'},
      {ic:'🔒',name:"Criminal Law (Title 18)",desc:"Federal crimes and procedure",key:'crim',url:'https://uscode.house.gov/browse/prelim@title18'},
      {ic:'💼',name:"Labor Law (Title 29)",desc:"Employment and labor",key:'labor',url:'https://uscode.house.gov/browse/prelim@title29'},
      {ic:'💰',name:"Tax Code (Title 26)",desc:"Internal Revenue Code",key:'tax',url:'https://uscode.house.gov/browse/prelim@title26'},
    ],
    const:[
      {sec:"ARTICLES",arts:[
        {no:'Article I',t:'The Legislative Branch',b:'All legislative Powers herein granted shall be vested in a Congress of the United States, which shall consist of a Senate and House of Representatives.'},
        {no:'Article II',t:'The Executive Branch',b:'The executive Power shall be vested in a President of the United States of America.'},
        {no:'Article III',t:'The Judicial Branch',b:'The judicial Power of the United States, shall be vested in one supreme Court, and in such inferior Courts as the Congress may from time to time ordain and establish.'},
      ]},
      {sec:"BILL OF RIGHTS",arts:[
        {no:'Amendment I',t:'Freedom of Speech',b:'Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press.'},
        {no:'Amendment IV',t:'Search and Seizure',b:'The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated.'},
      ]},
    ]},
};
const JURIS_ORDER = ['UZ','KZ','KG','TJ','TM','RU','AZ','US'];

module.exports = { LEGAL_DB, JURIS_ORDER };
