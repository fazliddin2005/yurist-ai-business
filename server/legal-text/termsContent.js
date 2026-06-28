// legal-text/termsContent.js
// ============================================================================
// FOYDALANISH SHARTLARI VA MAXFIYLIK SIYOSATI -- 8 tilda.
//
// HUQUQIY ASOS: bu matn O'zbekiston Respublikasining quyidagi qonunlariga
// asoslanib tuzilgan:
//   - Fuqarolik kodeksi (shartnoma erkinligi, javobgarlikni cheklash asoslari)
//   - "Shaxsga doir ma'lumotlar to'g'risida"gi Qonun (2019-yil, 547-II-son)
//   - "Sun'iy intellektdan foydalanish bilan bog'liq munosabatlarni
//     tartibga solish to'g'risida"gi Qonun (2026-yil, LRU-1115-son)
//   - "Elektron tijorat to'g'risida"gi Qonun
//
// MUHIM: bu matn YURIDIK MASLAHAT EMAS -- shablon sifatida tayyorlangan.
// Platforma egasi buni professional yurist bilan ko'rib chiqishi va o'z
// real biznes vaziyatiga moslashtirishi TAVSIYA ETILADI.
//
// MAQSAD: foydalanuvchi tizimga ANIQ, OGOHLANTIRILGAN rozilik bermasdan
// kira olmasligini ta'minlash -- bu platforma uchun MUHIM huquqiy himoya
// (masalan, "AI noto'g'ri maslahat berdi" degan da'volarga qarshi, chunki
// foydalanuvchi "AI maslahat emas, faqat ma'lumot beradi" shartiga rozi
// bo'lgani qog'ozda qoladi).
// ============================================================================

const TERMS_VERSION = '1.0'; // har safar matn o'zgarsa, bu raqamni oshiring --
// shunda eski rozilik bergan foydalanuvchilardan ham YANGI rozilik so'raladi.

const TERMS_CONTENT = {
  uz: {
    title: "Foydalanish shartlari va maxfiylik siyosati",
    sections: [
      {
        heading: "1. Xizmatning mohiyati",
        body: "Yurist AI — sun'iy intellekt asosida ishlaydigan huquqiy ma'lumot platformasi. Ushbu xizmat orqali taqdim etiladigan barcha javoblar, hujjat namunalari, tahlillar va tavsiyalar FAQAT umumiy ma'lumot beruvchi xarakterga ega va PROFESSIONAL YURIDIK MASLAHAT HISOBLANMAYDI."
      },
      {
        heading: "2. Javobgarlikni cheklash",
        body: "Sun'iy intellekt tizimi xato qilishi mumkin. Platforma taqdim etgan har qanday ma'lumot, hujjat yoki tahlil asosida qabul qilingan qarorlar uchun javobgarlik to'liq foydalanuvchining o'zida bo'ladi. Muhim huquqiy masalalar bo'yicha har doim malakali advokat yoki yuristga murojaat qilish tavsiya etiladi. Platforma O'zbekiston Respublikasi Fuqarolik kodeksining shartnoma erkinligi va javobgarlik asoslari to'g'risidagi qoidalariga muvofiq, AI tomonidan berilgan ma'lumotlardan kelib chiqadigan har qanday bilvosita yoki to'g'ridan-to'g'ri zarar uchun javobgarlikni o'z zimmasiga olmaydi, qonun bilan boshqacha tartib belgilanmagan hollarda."
      },
      {
        heading: "3. Shaxsiy ma'lumotlarni qayta ishlash",
        body: "Ro'yxatdan o'tish va xizmatdan foydalanish jarayonida taqdim etilgan shaxsiy ma'lumotlar (ism, email, telefon raqami) O'zbekiston Respublikasining \"Shaxsga doir ma'lumotlar to'g'risida\"gi Qonuniga muvofiq qayta ishlanadi va saqlanadi. Ma'lumotlar faqat xizmat ko'rsatish, hisob yuritish va xavfsizlikni ta'minlash maqsadlarida ishlatiladi, uchinchi shaxslarga sotilmaydi yoki tijorat maqsadida uzatilmaydi."
      },
      {
        heading: "4. Sun'iy intellektdan foydalanish",
        body: "Ushbu platforma O'zbekiston Respublikasining sun'iy intellektdan foydalanish bilan bog'liq munosabatlarni tartibga solish to'g'risidagi qonunchiligiga muvofiq ishlaydi. AI tomonidan yaratilgan barcha matn va tavsiyalar sun'iy intellekt yordamida generatsiya qilingani haqida foydalanuvchi xabardor qilinadi."
      },
      {
        heading: "5. Hujjat shablonlari haqida",
        body: "Platforma orqali yaratilgan shartnoma va boshqa hujjat namunalari umumiy shablon xarakterga ega. Ularni amalda qo'llashdan oldin, foydalanuvchi mustaqil ravishda yoki malakali yurist yordamida ularning o'z vaziyatiga mosligini tekshirishi lozim."
      },
      {
        heading: "6. Hisob xavfsizligi",
        body: "Foydalanuvchi o'z hisob ma'lumotlari (parol) maxfiyligini saqlash uchun mas'uldir. Hisob orqali amalga oshirilgan har qanday harakat uchun javobgarlik hisob egasida bo'ladi."
      },
      {
        heading: "7. Shartlarning o'zgarishi",
        body: "Platforma ushbu shartlarni istalgan vaqtda o'zgartirish huquqini saqlab qoladi. Muhim o'zgarishlar haqida foydalanuvchilar xabardor qilinadi va qayta rozilik so'raladi."
      },
    ],
    consentLabel: "Yuqoridagi Foydalanish shartlari va Maxfiylik siyosati bilan tanishdim va roziman",
    acceptButton: "Roziman, davom etish",
    declineButton: "Rozi emasman",
    declineWarning: "Xizmatdan foydalanish uchun shartlarga rozilik bildirish shart. Agar rozi bo'lmasangiz, hisobingizdan chiqib ketasiz.",
  },
  ru: {
    title: "Условия использования и политика конфиденциальности",
    sections: [
      { heading: "1. Суть сервиса", body: "Yurist AI — платформа правовой информации, работающая на основе искусственного интеллекта. Все ответы, образцы документов, анализы и рекомендации, предоставляемые через данный сервис, носят ТОЛЬКО ОБЩЕИНФОРМАЦИОННЫЙ характер и НЕ ЯВЛЯЮТСЯ ПРОФЕССИОНАЛЬНОЙ ЮРИДИЧЕСКОЙ КОНСУЛЬТАЦИЕЙ." },
      { heading: "2. Ограничение ответственности", body: "Система искусственного интеллекта может допускать ошибки. Ответственность за решения, принятые на основе любой информации, документа или анализа, предоставленного платформой, полностью лежит на пользователе. По важным правовым вопросам рекомендуется всегда обращаться к квалифицированному адвокату или юристу. В соответствии с положениями Гражданского кодекса Республики Узбекистан о свободе договора и основаниях ответственности, платформа не несёт ответственности за любой прямой или косвенный ущерб, возникший в результате информации, предоставленной AI, если иное не установлено законом." },
      { heading: "3. Обработка персональных данных", body: "Персональные данные (имя, email, номер телефона), предоставленные при регистрации и использовании сервиса, обрабатываются и хранятся в соответствии с Законом Республики Узбекистан «О персональных данных». Данные используются только для целей оказания услуг, ведения учёта и обеспечения безопасности, не продаются и не передаются третьим лицам в коммерческих целях." },
      { heading: "4. Использование искусственного интеллекта", body: "Данная платформа работает в соответствии с законодательством Республики Узбекистан, регулирующим отношения, связанные с использованием искусственного интеллекта. Пользователь уведомляется о том, что весь текст и рекомендации, созданные AI, генерируются с помощью искусственного интеллекта." },
      { heading: "5. О шаблонах документов", body: "Договоры и другие образцы документов, созданные через платформу, носят характер общих шаблонов. Перед практическим применением пользователь должен самостоятельно или с помощью квалифицированного юриста проверить их соответствие своей конкретной ситуации." },
      { heading: "6. Безопасность учётной записи", body: "Пользователь несёт ответственность за сохранение конфиденциальности данных своей учётной записи (пароля). Ответственность за любые действия, совершённые через учётную запись, лежит на её владельце." },
      { heading: "7. Изменение условий", body: "Платформа сохраняет за собой право изменять данные условия в любое время. О существенных изменениях пользователи уведомляются, и запрашивается повторное согласие." },
    ],
    consentLabel: "Я ознакомился(-ась) с Условиями использования и Политикой конфиденциальности и согласен(на)",
    acceptButton: "Согласен, продолжить",
    declineButton: "Не согласен",
    declineWarning: "Для использования сервиса необходимо согласие с условиями. Если вы не согласны, вы будете выведены из учётной записи.",
  },
  en: {
    title: "Terms of Use and Privacy Policy",
    sections: [
      { heading: "1. Nature of the Service", body: "Yurist AI is a legal information platform powered by artificial intelligence. All answers, document samples, analyses, and recommendations provided through this service are GENERAL INFORMATIONAL ONLY and DO NOT CONSTITUTE PROFESSIONAL LEGAL ADVICE." },
      { heading: "2. Limitation of Liability", body: "The artificial intelligence system may make mistakes. Full responsibility for decisions made based on any information, document, or analysis provided by the platform rests with the user. For important legal matters, consulting a qualified attorney or lawyer is always recommended. In accordance with the provisions of the Civil Code of the Republic of Uzbekistan on freedom of contract and grounds of liability, the platform assumes no responsibility for any direct or indirect damage arising from information provided by the AI, unless otherwise established by law." },
      { heading: "3. Processing of Personal Data", body: "Personal data (name, email, phone number) provided during registration and use of the service is processed and stored in accordance with the Law of the Republic of Uzbekistan \"On Personal Data\". Data is used only for service provision, record-keeping, and security purposes, and is not sold or transferred to third parties for commercial purposes." },
      { heading: "4. Use of Artificial Intelligence", body: "This platform operates in accordance with the legislation of the Republic of Uzbekistan regulating relations related to the use of artificial intelligence. The user is notified that all text and recommendations generated by AI are produced using artificial intelligence." },
      { heading: "5. About Document Templates", body: "Contracts and other document samples created through the platform are general templates in nature. Before practical application, the user should independently or with the help of a qualified lawyer verify their suitability for their specific situation." },
      { heading: "6. Account Security", body: "The user is responsible for maintaining the confidentiality of their account credentials (password). Responsibility for any actions performed through the account rests with the account holder." },
      { heading: "7. Changes to Terms", body: "The platform reserves the right to change these terms at any time. Users will be notified of significant changes and re-consent will be requested." },
    ],
    consentLabel: "I have read and agree to the Terms of Use and Privacy Policy above",
    acceptButton: "I agree, continue",
    declineButton: "I do not agree",
    declineWarning: "Agreement to the terms is required to use the service. If you do not agree, you will be logged out.",
  },
  kk: {
    title: "Пайдалану шарттары және құпиялылық саясаты",
    sections: [
      { heading: "1. Қызметтің мәні", body: "Yurist AI — жасанды интеллект негізінде жұмыс істейтін құқықтық ақпарат платформасы. Осы қызмет арқылы берілетін барлық жауаптар, құжат үлгілері, талдаулар мен ұсыныстар ТЕК ЖАЛПЫ АҚПАРАТТЫҚ сипатта болады және КӞСІБИ ЗАНГЕРЛІК КЕҢЕС БОЛЫП ЕСЕПТЕЛМЕЙДІ." },
      { heading: "2. Жауапкершілікті шектеу", body: "Жасанды интеллект жүйесі қателесуі мүмкін. Платформа ұсынған кез келген ақпарат, құжат немесе талдау негізінде қабылданған шешімдер үшін жауапкершілік толығымен пайдаланушыда болады. Маңызды құқықтық мәселелер бойынша әрқашан білікті адвокатқа немесе зангерге жүгіну ұсынылады. Өзбекстан Республикасының Азаматтық кодексінің шарт еркіндігі және жауапкершілік негіздері туралы ережелеріне сәйкес, платформа AI берген ақпараттан туындайтын кез келген тікелей немесе жанама зиян үшін жауапкершілік алмайды, заңда басқаша тәртіп белгіленбесе." },
      { heading: "3. Жеке деректерді өңдеу", body: "Тіркелу және қызметті пайдалану кезінде берілген жеке деректер (аты, электрондық пошта, телефон нөмірі) Өзбекстан Республикасының «Жеке деректер туралы» Заңына сәйкес өңделеді және сақталады. Деректер тек қызмет көрсету, есепке алу және қауіпсіздікті қамтамасыз ету мақсаттарында пайдаланылады, үшінші тұлғаларға сатылмайды немесе коммерциялық мақсатта берілмейді." },
      { heading: "4. Жасанды интеллектті пайдалану", body: "Бұл платформа Өзбекстан Республикасының жасанды интеллектті пайдалануға байланысты қатынастарды реттейтін заңнамасына сәйкес жұмыс істейді. Пайдаланушы AI жасаған барлық мәтін мен ұсыныстар жасанды интеллект арқылы жасалғаны туралы хабардар етіледі." },
      { heading: "5. Құжат үлгілері туралы", body: "Платформа арқылы жасалған шарттар және басқа құжат үлгілері жалпы үлгі сипатына ие. Оларды іс жүзінде қолданбас бұрын, пайдаланушы өзі немесе білікті зангер көмегімен олардың өз жағдайына сәйкестігін тексеруі керек." },
      { heading: "6. Есептік жазба қауіпсіздігі", body: "Пайдаланушы өзінің есептік жазба деректерінің (құпия сөзінің) құпиялығын сақтауға жауапты. Есептік жазба арқылы жасалған кез келген әрекет үшін жауапкершілік оның иесінде болады." },
      { heading: "7. Шарттардың өзгеруі", body: "Платформа осы шарттарды кез келген уақытта өзгерту құқығын сақтайды. Маңызды өзгерістер туралы пайдаланушылар хабардар етіледі және қайта келісім сұралады." },
    ],
    consentLabel: "Жоғарыдағы Пайдалану шарттары және Құпиялылық саясатымен таныстым және келісемін",
    acceptButton: "Келісемін, жалғастыру",
    declineButton: "Келіспеймін",
    declineWarning: "Қызметті пайдалану үшін шарттарға келісім қажет. Егер келіспесеңіз, есептік жазбадан шығасыз.",
  },
  ky: {
    title: "Колдонуу шарттары жана купуялуулук саясаты",
    sections: [
      { heading: "1. Кызматтын маңызы", body: "Yurist AI — жасалма интеллект негизинде иштеген укуктук маалымат платформасы. Бул кызмат аркылуу берилген бардык жоопторо, документ үлгүлөрү, талдоолор жана сунуштар ЖАЛПЫ МААЛЫМАТ мүнөзүндө гана жана КЕСИПКОЙ ЗАНГЕР КЕНЕШИ БОЛУП ЭСЕПТЕЛБЕЙТ." },
      { heading: "2. Жоопкерчиликти чектөө", body: "Жасалма интеллект тутуму ката кетирүүсү мүмкүн. Платформа сунуштаган ар кандай маалымат, документ же талдоонун негизинде кабыл алынган чечимдер үчүн жоопкерчилик толугу менен колдонуучуда болот. Маанилүү укуктук маселелер боюнча ар дайым квалификациялуу адвокатка же зангерге кайрылуу сунушталат. Өзбекстан Республикасынын Жарандык кодексинин келишим эркиндиги жана жоопкерчилик негиздери жөнүндөгү жоболоруна ылайык, платформа AI берген маалыматтан улам келип чыккан түз же кыйыр зыян үчүн жоопкерчиликти өзүнө албайт, мыйзамда башкача тартип белгиленбесе." },
      { heading: "3. Жеке маалыматтарды иштетүү", body: "Каттоо жана кызматты колдонуу учурунда берилген жеке маалыматтар (аты, электрондук почта, телефон номери) Өзбекстан Республикасынын «Жеке маалыматтар жөнүндө» Мыйзамына ылайык иштетилет жана сакталат. Маалыматтар кызмат көрсөтүү, эсепке алуу жана коопсуздукту камсыз кылуу максаттарында гана колдонулат, үчүнчү жактарга сатылбайт же коммерциялык максатта берилбейт." },
      { heading: "4. Жасалма интеллектти колдонуу", body: "Бул платформа Өзбекстан Республикасынын жасалма интеллектти колдонууга байланышкан мамилелерди жөнгө салуучу мыйзамдарына ылайык иштейт. Колдонуучу AI жараткан бардык текст жана сунуштар жасалма интеллект аркылуу жаратылганы жөнүндө кабарландырылат." },
      { heading: "5. Документ үлгүлөрү жөнүндө", body: "Платформа аркылуу жаратылган келишимдер жана башка документ үлгүлөрү жалпы үлгү мүнөзүнө ээ. Аларды иш жүзүндө колдонуудан мурун, колдонуучу өзү же квалификациялуу зангердин жардамы менен алардын өз кырдаалына ылайыктуулугун текшериши керек." },
      { heading: "6. Эсеп коопсуздугу", body: "Колдонуучу өзүнүн эсеп маалыматтарынын (сырсөздүн) купуялуулугун сактоого жооптуу. Эсеп аркылуу жасалган ар кандай аракет үчүн жоопкерчилик эсептин ээсинде болот." },
      { heading: "7. Шарттардын өзгөрүшү", body: "Платформа бул шарттарды каалаган убакта өзгөртүү укугун сактайт. Маанилүү өзгөрүүлөр жөнүндө колдонуучулар кабарландырылат жана кайра макулдук сурайт." },
    ],
    consentLabel: "Жогорудагы Колдонуу шарттары жана Купуялуулук саясаты менен таанышып, макулмун",
    acceptButton: "Макулмун, улантуу",
    declineButton: "Макул эмесмин",
    declineWarning: "Кызматты колдонуу үчүн шарттарга макулдук керек. Эгер макул болбосоңуз, эсептен чыгарыласыз.",
  },
  tg: {
    title: "Шартҳои истифода ва сиёсати махфият",
    sections: [
      { heading: "1. Моҳияти хидмат", body: "Yurist AI — платформаи иттилооти ҳуқуқӣ дар асоси зеҳни сунъӣ. Ҳамаи ҷавобҳо, намунаҳои ҳуҷҷат, таҳлилҳо ва тавсияҳое, ки тавассути ин хидмат пешниҳод мешаванд, ФАҚАТ хусусияти иттилоотии умумӣ доранд ва МАСЛИҲАТИ ҲУҲУҲИ КАСБИИ ШУМОР НАМЕШАВАНД." },
      { heading: "2. Маҳдудияти ҷавобгарӣ", body: "Системаи зеҳни сунъӣ метавонад хато кунад. Ҷавобгарӣ барои қарорҳое, ки дар асоси ҳар гуна иттилоот, ҳуҷҷат ё таҳлили пешниҳодшуда аз ҳамин платформа қабул мешаванд, пуррА ба зиммаи истифодабаранда мегузарад. Дар масъалаҳои муҳими ҳуқуқӣ ҳамеша муроҷиат ба адвокат ё ҳуқуқшиноси салоҳиятдор тавсия дода мешавад. Мувофиқи муқаррароти Кодекси граждании Ҷумҳурии Узбекистон дар бораи озодии шартнома ва асосҳои ҷавобгарӣ, платформа барои ҳар гуна зарари бевосита ё бавосита, ки аз иттилооти AI пешниҳодшуда ба миён меояд, ҷавобгарӣ намекунад, агар қонун тартиби дигар муқаррар накарда бошад." },
      { heading: "3. Коркарди маълумоти шахсӣ", body: "Маълумоти шахсӣ (ном, почтаи электронӣ, рақами телефон), ки ҳангоми сабти ном ва истифодаи хидмат пешниҳод мешавад, мувофиқи Қонуни Ҷумҳурии Узбекистон «Дар бораи маълумоти шахсӣ» коркард ва нигоҳ дошта мешавад. Маълумот танҳо барои мақсадҳои пешниҳоди хидмат, баҳисобгирӣ ва таъмини амният истифода мешавад, ба шахсони сеюм фурӯхта намешавад ё бо мақсади тиҷоратӣ дода намешавад." },
      { heading: "4. Истифодаи зеҳни сунъӣ", body: "Ин платформа мувофиқи қонунгузории Ҷумҳурии Узбекистон дар бораи танзими муносибатҳои марбут ба истифодаи зеҳни сунъӣ амал мекунад. Истифодабаранда хабардор карда мешавад, ки тамоми матн ва тавсияҳои аз ҷониби AI офарида шуда бо ёрии зеҳни сунъӣ тавлид мешаванд." },
      { heading: "5. Дар бораи намунаҳои ҳуҷҷат", body: "Шартномаҳо ва намунаҳои дигари ҳуҷҷат, ки тавассути платформа офарида мешаванд, хусусияти намунаи умумӣ доранд. Пеш аз истифодаи амалӣ, истифодабаранда бояд мустақилона ё бо ёрии ҳуқуқшиноси салоҳиятдор мутобиқати онҳоро ба вазъияти худ санҷад." },
      { heading: "6. Амнияти ҳисоб", body: "Истифодабаранда барои нигоҳ доштани махфияти маълумоти ҳисоби худ (рамз) масъул аст. Ҷавобгарӣ барои ҳар гуна амал, ки тавассути ҳисоб иҷро мешавад, ба зиммаи соҳиби ҳисоб мегузарад." },
      { heading: "7. Тағйироти шартҳо", body: "Платформа ҳуқуқи тағйир додани ин шартҳоро дар вақти дилхоҳ нигоҳ медорад. Дар бораи тағйироти муҳим истифодабарандагон хабардор карда мешаванд ва розигии нав пурсида мешавад." },
    ],
    consentLabel: "Бо Шартҳои истифода ва Сиёсати махфияти боло шинос шудам ва розӣ ҳастам",
    acceptButton: "Розӣ ҳастам, давом додан",
    declineButton: "Розӣ нестам",
    declineWarning: "Барои истифодаи хидмат розигӣ бо шартҳо зарур аст. Агар розӣ набошед, аз ҳисоб хориҷ карда мешавед.",
  },
  tk: {
    title: "Ulanyş şertleri we gizlinlik syýasaty",
    sections: [
      { heading: "1. Hyzmatyň manysy", body: "Yurist AI — emeli intellekte esaslanýan hukuk maglumat platformasy. Bu hyzmat arkaly berilýän ähli jogaplar, resminama nusgalary, seljermeler we maslahatlar DIŇE UMUMY MAGLUMAT häsiýetinde bolup, HÜNÄR HUKUK MASLAHATY HASAPLANMAÝAR." },
      { heading: "2. Jogapkärçiligi çäklendirmek", body: "Emeli intellekt ulgamy ýalňyşlyk goýberip biler. Platformanyň berýän islendik maglumaty, resminamasy ýa-da seljermesi esasynda kabul edilen kararlar üçin jogapkärçilik doly ulanyjynyň öz üstünde bolar. Möhüm hukuk meseleleri boýunça hemişe ygtybarly adwokata ýa-da hukukşynasa ýüz tutmak maslahat berilýär. Özbegistan Respublikasynyň Raýat kodeksiniň şertnama erkinligi we jogapkärçilik esaslary hakyndaky kadalaryna laýyklykda, platforma AI tarapyndan berlen maglumatdan ýüze çykýan islendik göni ýa-da gytaklaýyn zyýan üçin jogapkärçilik çekmeýär, eger kanunda başgaça tertip bellenmedik bolsa." },
      { heading: "3. Şahsy maglumatlary işläp geçmek", body: "Hasaba alynyş we hyzmatdan peýdalanyş wagtynda berlen şahsy maglumatlar (ady, e-poçta, telefon belgisi) Özbegistan Respublikasynyň «Şahsy maglumatlar hakynda» Kanunyna laýyklykda işlenýär we saklanýar. Maglumatlar diňe hyzmat etmek, hasaba almak we howpsuzlygy üpjün etmek maksatlary üçin ulanylýar, üçünji taraplara satylmaýar ýa-da täjirçilik maksady bilen berilmeýär." },
      { heading: "4. Emeli intellekti ulanmak", body: "Bu platforma Özbegistan Respublikasynyň emeli intellekti ulanmak bilen baglanyşykly gatnaşyklary düzgünleşdirýän kanunçylygyna laýyklykda işleýär. Ulanyjy AI tarapyndan döredilen ähli tekst we maslahatlaryň emeli intellekt arkaly döredilendigi barada habarly edilýär." },
      { heading: "5. Resminama nusgalary barada", body: "Platforma arkaly döredilen şertnamalar we beýleki resminama nusgalary umumy nusga häsiýetine eýedir. Ulanyjy olary amalda ulanmazdan ozal özbaşdak ýa-da ygtybarly hukukşynasynyň kömegi bilen öz ýagdaýyna laýyklygyny barlamaly." },
      { heading: "6. Hasap howpsuzlygy", body: "Ulanyjy öz hasap maglumatlarynyň (parolynyň) gizlinligini saklamaga jogapkärdir. Hasap arkaly amala aşyrylan islendik hereket üçin jogapkärçilik hasabyň eýesinde bolar." },
      { heading: "7. Şertleriň üýtgemegi", body: "Platforma bu şertleri islendik wagtda üýtgetmek hukugyny özünde saklaýar. Möhüm üýtgeşmeler barada ulanyjylar habarly edilýär we gaýtadan ylalaşyk soralýar." },
    ],
    consentLabel: "Ýokardaky Ulanyş şertleri we Gizlinlik syýasaty bilen tanyşdym we razy",
    acceptButton: "Razy, dowam etmek",
    declineButton: "Razy däl",
    declineWarning: "Hyzmatdan peýdalanmak üçin şertlere razylyk zerur. Eger razy bolmasaňyz, hasapdan çykarylarsyňyz.",
  },
  az: {
    title: "İstifadə şərtləri və məxfilik siyasəti",
    sections: [
      { heading: "1. Xidmətin mahiyyəti", body: "Yurist AI — süni intellekt əsasında işləyən hüquqi məlumat platformasıdır. Bu xidmət vasitəsilə təqdim edilən bütün cavablar, sənəd nümunələri, təhlillər və tövsiyələr YALNIZ ÜMUMİ MƏLUMAT xarakteri daşıyır və PEŞƏKAR HÜQUQİ MƏSLƏHƏT HESAB OLUNMUR." },
      { heading: "2. Məsuliyyətin məhdudlaşdırılması", body: "Süni intellekt sistemi səhv edə bilər. Platformanın təqdim etdiyi hər hansı məlumat, sənəd və ya təhlil əsasında qəbul edilən qərarlara görə məsuliyyət tamamilə istifadəçinin üzərinə düşür. Mühüm hüquqi məsələlər üzrə həmişə ixtisaslı vəkilə və ya hüquqşünasa müraciət etmək tövsiyə olunur. Özbəkistan Respublikasının Mülki Məcəlləsinin müqavilə azadlığı və məsuliyyət əsasları haqqında müddəalarına uyğun olaraq, platforma AI tərəfindən verilən məlumatdan yaranan hər hansı birbaşa və ya dolayı zərərə görə məsuliyyət daşımır, qanunda başqa qayda müəyyən edilmədiyi hallarda." },
      { heading: "3. Şəxsi məlumatların işlənməsi", body: "Qeydiyyat və xidmətdən istifadə zamanı təqdim edilən şəxsi məlumatlar (ad, e-poçt, telefon nömrəsi) Özbəkistan Respublikasının «Şəxsi məlumatlar haqqında» Qanununa uyğun olaraq işlənir və saxlanılır. Məlumatlar yalnız xidmət göstərmək, qeydiyyat aparmaq və təhlükəsizliyi təmin etmək məqsədləri üçün istifadə olunur, üçüncü şəxslərə satılmır və ya kommersiya məqsədilə verilmir." },
      { heading: "4. Süni intellektdən istifadə", body: "Bu platforma Özbəkistan Respublikasının süni intellektdən istifadə ilə bağlı münasibətləri tənzimləyən qanunvericiliyinə uyğun fəaliyyət göstərir. İstifadəçi AI tərəfindən yaradılan bütün mətn və tövsiyələrin süni intellekt vasitəsilə yaradıldığı barədə məlumatlandırılır." },
      { heading: "5. Sənəd şablonları haqqında", body: "Platforma vasitəsilə yaradılan müqavilələr və digər sənəd nümunələri ümumi şablon xarakteri daşıyır. Praktik tətbiqdən əvvəl istifadəçi müstəqil şəkildə və ya ixtisaslı hüquqşünasın köməyi ilə onların öz vəziyyətinə uyğunluğunu yoxlamalıdır." },
      { heading: "6. Hesab təhlükəsizliyi", body: "İstifadəçi öz hesab məlumatlarının (parolun) məxfiliyini saxlamağa görə məsuliyyət daşıyır. Hesab vasitəsilə həyata keçirilən hər hansı hərəkətə görə məsuliyyət hesab sahibinin üzərinə düşür." },
      { heading: "7. Şərtlərin dəyişdirilməsi", body: "Platforma bu şərtləri istənilən vaxt dəyişdirmək hüququnu özündə saxlayır. Mühüm dəyişikliklər barədə istifadəçilər məlumatlandırılır və yenidən razılıq tələb olunur." },
    ],
    consentLabel: "Yuxarıdaki İstifadə şərtləri və Məxfilik siyasəti ilə tanış oldum və razıyam",
    acceptButton: "Razıyam, davam et",
    declineButton: "Razı deyiləm",
    declineWarning: "Xidmətdən istifadə üçün şərtlərlə razılaşmaq tələb olunur. Razı olmasanız, hesabdan çıxarılacaqsınız.",
  },
};

module.exports = { TERMS_CONTENT, TERMS_VERSION };
