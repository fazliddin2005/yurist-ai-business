// uz_labor_code.js
// ============================================================================
// O'ZBEKISTON RESPUBLIKASI MEHNAT KODEKSI -- TO'LIQ MUNDARIJA
// Manba: https://lex.uz/uz/docs/-6257288 (2022-yil 28-oktyabrda qabul
// qilingan, 2023-yil 30-apreldan kuchga kirgan, HOZIRDA AMALDAGI versiya)
//
// MUHIM IZOH (halollik uchun): bu fayl har bir moddaning TO'LIQ MATNINI
// o'z ichiga OLMAYDI -- chunki lex.uz moddalar matnini JavaScript orqali
// dinamik yuklaydi, va avtomatik vositalar bilan minglab moddani ishonchli,
// to'liq ko'chirib olish amalda imkonsiz (yoki juda katta xato xavfi bilan).
//
// BUNING O'RNIGA: bu fayl har bir moddaning ANIQ NOMI va TARTIB RAQAMINI
// o'z ichiga oladi, hamda lex.uz'dagi rasmiy hujjat sahifasiga havola beradi.
//
// TEXNIK IZOH (havola haqida): lex.uz sahifa ichida moddaga o'tishni
// JavaScript funksiyasi orqali (scrollText('-ID')) amalga oshiradi -- bu
// oddiy URL anchor (#ID) EMAS, shuning uchun tashqi havoladan to'g'ridan-
// to'g'ri shu moddaga "sakrab" o'tish ISHONCHLI ishlamaydi. Shu sababli,
// havola sahifaning O'ZIGA (BASE_URL) beriladi -- foydalanuvchi sahifada
// brauzerning "matn ichida qidirish" (Ctrl+F) orqali modda raqamini
// qidirib topishi mumkin. Bu "bir bosishda aniq joyga o'tish" emas, lekin
// noto'g'ri/buzilgan havola berishdan ko'ra ANCHA ishonchli.
// ============================================================================

const BASE_URL = 'https://lex.uz/uz/docs/-6257288';

const SECTIONS = [
  {
    part: "UMUMIY QISM",
    chapters: [
      {
        title: "I BO'LIM. UMUMIY QOIDALAR",
        subchapters: [
          {
            title: "1-bob. Asosiy qoidalar",
            articles: [
              { no: "1", title: "Ushbu Kodeks bilan tartibga solinadigan munosabatlar", articleId: "6257549" },
              { no: "2", title: "Ushbu Kodeksning asosiy vazifalari", articleId: "6257576" },
              { no: "3", title: "Yakka tartibdagi mehnatga oid munosabatlarni va ular bilan bevosita bog'liq bo'lgan ijtimoiy munosabatlarni huquqiy jihatdan tartibga solishning asosiy prinsiplari", articleId: "6257590" },
              { no: "4", title: "Mehnat huquqlarining tengligi, mehnat va mashg'ulotlar sohasida kamsitishni taqiqlash prinsipi", articleId: "6257599" },
              { no: "5", title: "Mehnat erkinligi va majburiy mehnatni taqiqlash prinsipi", articleId: "6257606" },
              { no: "6", title: "Mehnat sohasidagi ijtimoiy sheriklik prinsipi", articleId: "6257622" },
              { no: "7", title: "Mehnat huquqlari ta'minlanishining va mehnat majburiyatlari bajarilishining kafolatlanganligi prinsipi", articleId: "6257631" },
              { no: "8", title: "Xodimning huquqiy holati yomonlashishiga yo'l qo'yilmasligi prinsipi", articleId: "6257637" },
              { no: "9", title: "Ushbu Kodeksda nazarda tutilgan muddatlarni hisoblash", articleId: "6257640" }
            ]
          },
          {
            title: "2-bob. Mehnat to'g'risidagi qonunchilik va mehnat haqidagi boshqa huquqiy hujjatlar",
            articles: [
              { no: "10", title: "Mehnat to'g'risidagi qonunchilik", articleId: "6257721" },
              { no: "11", title: "Mehnat to'g'risidagi qonunchilikning amal qilish sohasi", articleId: "6257726" },
              { no: "12", title: "Mehnat haqidagi boshqa huquqiy hujjatlar", articleId: "6257755" },
              { no: "13", title: "Mehnat to'g'risidagi qonunchilikning va mehnat haqidagi boshqa huquqiy hujjatlarning o'zaro nisbati", articleId: "6257762" },
              { no: "14", title: "Jamoa kelishuvlarining o'zaro nisbati va ichki hujjatlar bilan o'zaro nisbati", articleId: "6257766" },
              { no: "15", title: "Ichki hujjatlarning o'zaro nisbati", articleId: "6257771" },
              { no: "16", title: "Mehnat to'g'risidagi qonunchilikning, mehnat haqidagi boshqa huquqiy hujjatlarning va mehnat shartnomasining o'zaro nisbati", articleId: "6257777" },
              { no: "17", title: "Mehnat haqidagi boshqa huquqiy hujjatlar qoidalarining va mehnat shartnomasi shartlarining haqiqiy emasligi", articleId: "6257780" },
              { no: "18", title: "Ish beruvchining yakka tartibdagi huquqiy hujjatlari", articleId: "6257787" }
            ]
          },
          {
            title: "3-bob. Yakka tartibdagi mehnatga oid munosabatlarning subyektlari va yuzaga kelish asoslari",
            subsections: [
              {
                title: "1-paragraf. Yakka tartibdagi mehnatga oid munosabatlarning subyektlari",
                articles: [
                  { no: "19", title: "Xodim va ish beruvchi yakka tartibdagi mehnatga oid munosabatlarning subyektlari sifatida", articleId: "6257795" },
                  { no: "20", title: "Xodimning mehnatga oid huquq layoqati va muomala layoqati", articleId: "6257912" },
                  { no: "21", title: "Xodimning huquqlari", articleId: "6257916" },
                  { no: "22", title: "Xodimning majburiyatlari", articleId: "6257931" },
                  { no: "23", title: "Ish beruvchining mehnatga oid huquq layoqati va muomala layoqati", articleId: "6257945" },
                  { no: "24", title: "Ish beruvchining huquqlari", articleId: "6257964" },
                  { no: "25", title: "Ish beruvchining majburiyatlari", articleId: "6257976" }
                ]
              },
              {
                title: "2-paragraf. Yakka tartibdagi mehnatga oid munosabatlarning yuzaga kelishi asoslari",
                articles: [
                  { no: "26", title: "Yakka tartibdagi mehnatga oid munosabatlarning yuzaga kelishi", articleId: "6258000" },
                  { no: "27", title: "Lavozimga saylanish yoki tegishli lavozimni egallash uchun tanlovdan o'tish natijasida mehnat shartnomasi asosida yuzaga keladigan yakka tartibdagi mehnatga oid munosabatlar", articleId: "6258193" },
                  { no: "28", title: "Lavozimga tayinlash yoki lavozimga tasdiqlash natijasida mehnat shartnomasi asosida yuzaga keladigan yakka tartibdagi mehnatga oid munosabatlar", articleId: "6258198" },
                  { no: "29", title: "Vakolatli davlat organlari tomonidan ishga yuborish munosabati bilan mehnat shartnomasi asosida yuzaga keladigan yakka tartibdagi mehnatga oid munosabatlar", articleId: "6258202" },
                  { no: "30", title: "O'zbekiston Respublikasi hududida mehnat faoliyati huquqiga doir tasdiqnoma mavjud bo'lganda mehnat shartnomasi asosida yuzaga keladigan yakka tartibdagi mehnatga oid munosabatlar", articleId: "6258210" },
                  { no: "31", title: "Ota-onadan birining yozma roziligi mavjud bo'lganda mehnat shartnomasi asosida yuzaga keladigan yakka tartibdagi mehnatga oid munosabatlar", articleId: "6258214" },
                  { no: "32", title: "Ish beruvchining zimmasiga mehnat shartnomasini tuzish majburiyatini yuklatish to'g'risidagi sud qarori qabul qilinishi natijasida yuzaga keladigan munosabatlar", articleId: "6258216" },
                  { no: "33", title: "Shaxsiy mehnatdan foydalanish bilan bog'liq fuqarolik-huquqiy shartnoma asosidagi munosabatlarni yakka tartibdagi mehnatga oid munosabatlar deb e'tirof etish", articleId: "6258218" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "II BO'LIM. MEHNAT SOHASIDAGI IJTIMOIY SHERIKLIK",
        subchapters: [
          {
            title: "4-bob. Umumiy qoidalar",
            articles: [
              { no: "34", title: "Mehnat sohasidagi ijtimoiy sheriklik tushunchasi va asosiy prinsiplari", articleId: "6258230" },
              { no: "35", title: "Mehnat sohasidagi ijtimoiy sheriklikning darajalari", articleId: "6258314" },
              { no: "36", title: "Mehnat jamoasi", articleId: "6258324" },
              { no: "37", title: "Xodimlarning birlashish huquqi", articleId: "6258347" },
              { no: "38", title: "Ish beruvchilarning birlashish huquqi", articleId: "6258374" },
              { no: "39", title: "Ijtimoiy sheriklik taraflari", articleId: "6258383" },
              { no: "40", title: "Mehnat sohasidagi ijtimoiy sheriklikning mehnat huquqi normalarini o'z ichiga olgan huquqiy hujjatlari", articleId: "6258401" },
              { no: "41", title: "Mehnat sohasidagi ijtimoiy sheriklikni amalga oshirish shakllari", articleId: "6258410" }
            ]
          },
          {
            title: "5-bob. Xodimlarning va ish beruvchilarning ijtimoiy sheriklikdagi vakilligi",
            articles: [
              { no: "42", title: "Xodimlarning vakilligi", articleId: "6258431" },
              { no: "43", title: "Xodimlar vakillarining huquqlari", articleId: "6258539" },
              { no: "44", title: "Xodimlarning vakillik organlari tarkibiga saylangan shaxslarga beriladigan mehnat kafolatlari", articleId: "6258565" },
              { no: "45", title: "Ish beruvchilarning xodimlar vakillarining faoliyatini amalga oshirish uchun sharoitlar yaratishga doir majburiyatlari", articleId: "6258575" },
              { no: "46", title: "Ish beruvchilarning vakillari", articleId: "6258593" },
              { no: "47", title: "Xodimlar va ish beruvchilar vakillarining faoliyatiga to'sqinlik qilishni taqiqlash", articleId: "6258596" }
            ]
          },
          {
            title: "6-bob. Mehnat sohasidagi ijtimoiy sheriklik organlari",
            articles: [
              { no: "48", title: "Mehnat sohasidagi ijtimoiy sheriklik organlari tizimi", articleId: "6258603" },
              { no: "49", title: "Boshlang'ich darajadagi ijtimoiy-mehnat masalalari bo'yicha komissiya", articleId: "6258671" },
              { no: "50", title: "Ijtimoiy-mehnat masalalari bo'yicha hududiy komissiyalar", articleId: "6258674" },
              { no: "51", title: "Ijtimoiy-mehnat masalalari bo'yicha tarmoq komissiyalari", articleId: "6258681" },
              { no: "52", title: "Ijtimoiy-mehnat masalalari bo'yicha respublika komissiyasi", articleId: "6258688" },
              { no: "53", title: "Ijtimoiy-mehnat masalalari bo'yicha komissiyalar vakolatlarining muddati", articleId: "6258693" },
              { no: "54", title: "Ijtimoiy-mehnat masalalari bo'yicha komissiya a'zosining faoliyatini tugatish yoki uni vaqtincha almashtirish", articleId: "6258696" },
              { no: "55", title: "Ijtimoiy-mehnat masalalari bo'yicha komissiyalarning vakolatlari", articleId: "6258722" },
              { no: "56", title: "Ijtimoiy-mehnat masalalari bo'yicha komissiya ishini rejalashtirish", articleId: "6258741" },
              { no: "57", title: "Ijtimoiy-mehnat masalalari bo'yicha hududiy, tarmoq va respublika komissiyalarining reglamenti", articleId: "6258753" },
              { no: "58", title: "Ijtimoiy-mehnat masalalari bo'yicha komissiyalarning majlislari", articleId: "6258755" },
              { no: "59", title: "Ijtimoiy-mehnat masalalari bo'yicha komissiyalarning qarorlari", articleId: "6258761" }
            ]
          },
          {
            title: "7-bob. Jamoaviy muzokaralar",
            articles: [
              { no: "60", title: "Jamoaviy muzokaralar olib borishga bo'lgan huquq", articleId: "6258891" },
              { no: "61", title: "Jamoaviy muzokaralar boshlanadigan sana", articleId: "6258907" },
              { no: "62", title: "Jamoaviy muzokaralar olib borish", articleId: "6258909" },
              { no: "63", title: "Jamoaviy muzokaralar jarayonida yuzaga kelgan ixtiloflarni hal etish", articleId: "6258913" },
              { no: "64", title: "Jamoaviy muzokaralarda ishtirok etadigan shaxslarga beriladigan kafolatlar va kompensatsiyalar", articleId: "6258919" }
            ]
          },
          {
            title: "8-bob. Jamoa shartnomasi",
            articles: [
              { no: "65", title: "Jamoa shartnomasining tushunchasi va shakli", articleId: "6258924" },
              { no: "66", title: "Jamoa shartnomasini tuzish zarurligi to'g'risida qaror qabul qilish", articleId: "6258963" },
              { no: "67", title: "Jamoa shartnomasining mazmuni va tuzilishi", articleId: "6258966" },
              { no: "68", title: "Jamoa shartnomasi shartlarining haqiqiy emasligi", articleId: "6258981" },
              { no: "69", title: "Jamoa shartnomasining loyihasini muhokama qilish", articleId: "6258988" },
              { no: "70", title: "Jamoa shartnomasini tuzish tartibi", articleId: "6258992" },
              { no: "71", title: "Jamoa shartnomasining kuchga kirishi va amal qilish muddati", articleId: "6258996" },
              { no: "72", title: "Jamoa shartnomasi amal qilishining shaxslar doirasi bo'yicha tatbiq etilishi", articleId: "6258998" },
              { no: "73", title: "Tashkilot qayta tashkil etilgan taqdirda jamoa shartnomasi amal qilishining saqlanib qolishi", articleId: "6259001" },
              { no: "74", title: "Tashkilotning mulkdori o'zgarganda jamoa shartnomasi amal qilishining saqlanib qolishi", articleId: "6259004" },
              { no: "75", title: "Tashkilot tugatilayotganda jamoa shartnomasi amal qilishining saqlanib qolishi", articleId: "6259007" },
              { no: "76", title: "Jamoa shartnomasi amal qilishining boshqa hollarda saqlanib qolishi", articleId: "6259009" },
              { no: "77", title: "Jamoa shartnomasiga o'zgartish va qo'shimchalar kiritish", articleId: "6259011" },
              { no: "78", title: "Xodimlarni jamoa shartnomasi bilan tanishtirish", articleId: "6259013" },
              { no: "79", title: "Jamoa shartnomasining bajarilishi ustidan nazorat", articleId: "6259016" }
            ]
          },
          {
            title: "9-bob. Jamoa kelishuvlari",
            articles: [
              { no: "80", title: "Jamoa kelishuvlarining tushunchasi va shakli", articleId: "6259020" },
              { no: "81", title: "Jamoa kelishuvlarining turlari", articleId: "6259180" },
              { no: "82", title: "Hududiy jamoa kelishuvlari", articleId: "6259189" },
              { no: "83", title: "Tarmoq jamoa kelishuvlari", articleId: "6259192" },
              { no: "84", title: "Bosh jamoa kelishuvi", articleId: "6259195" },
              { no: "85", title: "Jamoa kelishuvlarining mazmuni va tuzilishi", articleId: "6259198" },
              { no: "86", title: "Jamoa kelishuvlari shartlarining haqiqiy emasligi", articleId: "6259211" },
              { no: "87", title: "Jamoa kelishuvlari loyihalarini ishlab chiqish va ushbu kelishuvlarni tuzish tartibi", articleId: "6259218" },
              { no: "88", title: "Jamoa kelishuvlarini xabardor qilish tartibida ro'yxatga olish", articleId: "6259228" },
              { no: "89", title: "Jamoa kelishuvlariga o'zgartish va qo'shimchalar kiritish", articleId: "6259234" },
              { no: "90", title: "Jamoa kelishuvlarining shaxslar doirasi bo'yicha amal qilishi", articleId: "6259238" },
              { no: "91", title: "Jamoa kelishuvlarining kuchga kirishi va amal qilish muddati", articleId: "6259244" },
              { no: "92", title: "Jamoa kelishuvlarini e'lon qilish", articleId: "6259247" },
              { no: "93", title: "Jamoa kelishuvlarining bajarilishi ustidan nazorat", articleId: "6259251" }
            ]
          }
        ]
      }
    ]
  },
  {
    part: "MAXSUS QISM",
    chapters: [
      {
        title: "III BO'LIM. ISHGA JOYLASHTIRISH",
        subchapters: [
          {
            title: "10-bob. Umumiy qoidalar",
            articles: [
              { no: "94", title: "Ishga joylashish huquqi", articleId: "6259372" },
              { no: "95", title: "Ishga joylashtirish bo'yicha davlat kafolatlari", articleId: "6259926" },
              { no: "96", title: "Aholining ijtimoiy ehtiyojmand toifalarini ishga joylashtirish sohasidagi qo'shimcha kafolatlar", articleId: "6259937" }
            ]
          },
          {
            title: "11-bob. Ish beruvchi tomonidan bandlik va ishga joylashtirish sohasida taqdim etiladigan kafolatlar",
            articles: [
              { no: "97", title: "Ish beruvchining bandlik va ishga joylashtirish sohasidagi majburiyatlari", articleId: "6259953" },
              { no: "98", title: "Xodimlarni ommaviy ravishda ishdan bo'shatish chog'idagi kafolatlar", articleId: "6259994" },
              { no: "99", title: "Ish o'rinlarining belgilangan eng kam soni hisobiga ishga joylashtirish", articleId: "6260004" },
              { no: "100", title: "Mehnat shartnomasi alohida asoslarga ko'ra bekor qilinganda o'rtacha oylik ish haqini saqlab qolish kafolatlari", articleId: "6260007" },
              { no: "101", title: "Taklif etilgan shaxslarga ishga joylashtirish sohasidagi qo'shimcha kafolatlar", articleId: "6260023" },
              { no: "102", title: "Ish beruvchi alohida asoslar bo'yicha mehnat shartnomasini bekor qilgan xodimlarni qayta ishga qabul qilish tartibi", articleId: "6260026" }
            ]
          }
        ]
      },
      {
        title: "IV BO'LIM. YAKKA TARTIBDAGI MEHNATGA OID MUNOSABATLAR",
        subchapters: [
          {
            title: "12-bob. Mehnat shartnomasi",
            subsections: [
              {
                title: "1-paragraf. Umumiy qoidalar",
                articles: [
                  { no: "103", title: "Mehnat shartnomasining tushunchasi va taraflari", articleId: "6260037" },
                  { no: "104", title: "Mehnat shartnomasining mazmuni", articleId: "6260140" },
                  { no: "105", title: "Mehnat shartnomasi shartlarining haqiqiy emasligi", articleId: "6260162" },
                  { no: "106", title: "Mehnat shartnomasining shakli", articleId: "6260169" },
                  { no: "107", title: "Mehnat shartnomasining rekvizitlari", articleId: "6260179" },
                  { no: "108", title: "Mehnat shartnomasining kuchga kirishi va ishning boshlanish sanasi", articleId: "6260204" },
                  { no: "109", title: "Mehnat shartnomasini ro'yxatdan o'tkazish", articleId: "6260212" },
                  { no: "110", title: "Mehnat shartnomasining muddati", articleId: "6260215" },
                  { no: "111", title: "Xodim bilan muddatli mehnat shartnomasini tuzishning asosliligi", articleId: "6260222" },
                  { no: "112", title: "Xodim bilan muddatli mehnat shartnomasi tuziladigan hollar", articleId: "6260238" },
                  { no: "113", title: "Xodim bilan muddatli mehnat shartnomasi tuzilishi mumkin bo'lgan hollar", articleId: "6260260" },
                  { no: "114", title: "Mehnat shartnomasining muddatini belgilash usullari", articleId: "6260278" },
                  { no: "115", title: "Mehnat shartnomasida shart qilib ko'rsatilmagan ishning bajarilishini talab qilishni taqiqlash", articleId: "6260284" },
                  { no: "116", title: "Bir necha kasbda ishlash, xizmat ko'rsatish doirasini kengaytirish, ish hajmini ko'paytirish", articleId: "6260291" },
                  { no: "117", title: "Ish bilan bog'liq hujjatlarni va ularning ko'chirma nusxalarini berish", articleId: "6260307" }
                ]
              },
              {
                title: "2-paragraf. Mehnat shartnomasini tuzish",
                articles: [
                  { no: "118", title: "Ishga qabul qilishga yo'l qo'yiladigan yosh", articleId: "6260313" },
                  { no: "119", title: "Ishga qabul qilishni qonunga xilof ravishda rad etishga yo'l qo'yilmasligi", articleId: "6260525" },
                  { no: "120", title: "Ishga qabul qilishni qonunga xilof ravishda rad etishning huquqiy oqibatlari", articleId: "6260537" },
                  { no: "121", title: "Qarindoshlarning davlat tashkilotida birga xizmat qilishini cheklash", articleId: "6260540" },
                  { no: "122", title: "Ishga qabul qilish bosqichlari", articleId: "6260542" },
                  { no: "123", title: "Ishga qabul qilish chog'idagi tanishtirish tartib-taomili", articleId: "6260548" },
                  { no: "124", title: "Ishga qabul qilish chog'ida talab etiladigan hujjatlar", articleId: "6260568" },
                  { no: "125", title: "Mehnat daftarchasi", articleId: "6260586" },
                  { no: "126", title: "Mehnat shartnomasi shartlari bo'yicha taraflarning kelishuvga erishishi va shartnomaning imzolanishi", articleId: "6260604" },
                  { no: "127", title: "Ish beruvchi tomonidan xodimni ishga qabul qilish to'g'risida buyruq chiqarishi", articleId: "6260606" },
                  { no: "128", title: "Xodimni haqiqatda ishga qo'yish", articleId: "6260613" },
                  { no: "129", title: "Ishga qabul qilish chog'idagi dastlabki sinov", articleId: "6260620" },
                  { no: "130", title: "Dastlabki sinov muddati", articleId: "6260649" },
                  { no: "131", title: "Dastlabki sinov davrida xodimga nisbatan mehnat to'g'risidagi qonunchilikning amal qilishini tatbiq etish", articleId: "6260654" },
                  { no: "132", title: "Dastlabki sinov natijasi", articleId: "6260659" }
                ]
              },
              {
                title: "3-paragraf. Mehnat shartnomasini o'zgartirish",
                articles: [
                  { no: "133", title: "Mehnat shartnomasini o'zgartirish asoslari", articleId: "6260671" },
                  { no: "134", title: "Mehnat shartlari tushunchasi", articleId: "6260910" },
                  { no: "135", title: "Mehnat shartlarini belgilash va o'zgartirish tartibi", articleId: "6260915" },
                  { no: "136", title: "Xodimning mehnat shartlarini o'zgartirish huquqi", articleId: "6260921" },
                  { no: "137", title: "Ish beruvchining mehnat shartlarini xodimning roziligisiz o'zgartirish huquqi", articleId: "6260925" },
                  { no: "138", title: "Xodimni boshqa ishga o'tkazish", articleId: "6260941" },
                  { no: "139", title: "Xodimni boshqa ishga o'tkazish muddati", articleId: "6260947" },
                  { no: "140", title: "Xodimning boshqa ishga o'tkazish uchun roziligi", articleId: "6260962" },
                  { no: "141", title: "Mehnat shartnomasi taraflarining kelishuviga ko'ra xodimni vaqtincha boshqa ishga o'tkazish", articleId: "6260970" }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

module.exports = { BASE_URL, SECTIONS };
