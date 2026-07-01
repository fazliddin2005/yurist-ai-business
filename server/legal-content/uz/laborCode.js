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
                  { no: "141", title: "Mehnat shartnomasi taraflarining kelishuviga ko'ra xodimni vaqtincha boshqa ishga o'tkazish", articleId: "6260970" },
                  { no: "142", title: "Ish beruvchi uchun majburiy bo'lgan, xodimning tashabbusi bilan vaqtincha boshqa ishga o'tkazish" },
                  { no: "143", title: "Xodimning sog'lig'i holatiga ko'ra boshqa ishga doimiy o'tkazish" },
                  { no: "144", title: "Ish beruvchi uchun majburiy bo'lgan, xodim bilan tuzilgan mehnat shartnomasi alohida asoslarga ko'ra bekor qilinganda xodimni boshqa ishga o'tkazish" },
                  { no: "145", title: "Ish beruvchining tashabbusiga ko'ra xodimni vaqtincha boshqa ishga o'tkazish" },
                  { no: "146", title: "Ish beruvchining boshqa joyga ko'chishi" }
                ]
              },
              {
                title: "4-paragraf. Mehnat shartnomasini bekor qilish",
                articles: [
                  { no: "147", title: "Mehnat shartnomasini bekor qilish asoslari" },
                  { no: "148", title: "Taraflar kelishuviga ko'ra mehnat shartnomasini bekor qilish" },
                  { no: "149", title: "Mehnat shartnomasini muddatidan oldin bekor qilish asoslari" },
                  { no: "150", title: "Mehnat shartnomasini bekor qilish huquqidan voz kechish" },
                  { no: "151", title: "Tashkilot tugatilganda yoki yakka tartibdagi tadbirkor faoliyatini tugatganda mehnat shartnomasini bekor qilish" },
                  { no: "152", title: "Tashkilot qayta tashkil etilganda mehnat shartnomasi amal qilishining davom etishi" },
                  { no: "153", title: "Tashkilot mulkdori almashganda mehnat shartnomasining amal qilishi" },
                  { no: "154", title: "Xodim malakasi yetarli emasligi sababli lavozimiga muvofiq emasligi munosabati bilan mehnat shartnomasini bekor qilish" },
                  { no: "155", title: "Xodimning xulq-atvori bo'yicha mehnat shartnomasini bekor qilish uchun asoslar" },
                  { no: "156", title: "Rahbarni va bosh hisobchini mehnat shartnomasini bekor qilishning qo'shimcha asoslari" },
                  { no: "157", title: "Mehnat shartnomasini bekor qilishning boshqa asoslari" },
                  { no: "158", title: "Muddatli mehnat shartnomasini uning muddati tugashi munosabati bilan bekor qilish" },
                  { no: "159", title: "Muddatli mehnat shartnomasi muddatidan oldin bekor qilinganda neustoyka to'lash" },
                  { no: "160", title: "Mehnat shartnomasini xodimning tashabbusiga ko'ra bekor qilish" },
                  { no: "161", title: "Mehnat shartnomasini ish beruvchining tashabbusiga ko'ra bekor qilish" },
                  { no: "162", title: "Xodim bilan tuzilgan mehnat shartnomasini bekor qilishga olib kelishi mumkin bo'lgan mehnat majburiyatlarining bir marta qo'pol ravishda buzilishlari ro'yxatini belgilash" },
                  { no: "163", title: "Mehnat shartnomasini ish beruvchining tashabbusiga ko'ra bekor qilishni taqiqlash" },
                  { no: "164", title: "Mehnat shartnomasini ish beruvchining tashabbusiga ko'ra bekor qilishni kasaba uyushmasi qo'mitasi bilan kelishib olish" },
                  { no: "165", title: "Mehnat shartnomasini ish beruvchining tashabbusiga ko'ra bekor qilish to'g'risida ogohlantirish" },
                  { no: "166", title: "Ish beruvchining xodimlarni ishdan bo'shatish to'g'risidagi axborotni taqdim etishi" },
                  { no: "167", title: "Texnologiyaning, ishlab chiqarish va mehnatni tashkil etishning o'zgarishiga, ishlar (mahsulot, xizmatlar) hajmining qisqarishiga bog'liq bo'lgan tashkilot (uning alohida bo'linmasi), yakka tartibdagi tadbirkor xodimlarining soni (shtati) o'zgarganligi munosabati bilan mehnat shartnomasi bekor qilinganda ishda qoldirishga doir imtiyozli huquq" },
                  { no: "168", title: "Mehnat shartnomasini taraflarning xohish-irodasiga bog'liq bo'lmagan holatlarga ko'ra bekor qilish" },
                  { no: "169", title: "Mehnat shartnomasini yangi muddatga saylanmaganlik yoki tanlovdan o'tmaganlik yoxud saylashda, tanlovda ishtirok etishni rad etganlik munosabati bilan bekor qilish" },
                  { no: "170", title: "Mehnat shartnomasini bekor qilishni rasmiylashtirish" },
                  { no: "171", title: "Mehnat daftarchasini va mehnat shartnomasini bekor qilish to'g'risidagi buyruqning ko'chirma nusxasini berish" },
                  { no: "172", title: "Mehnat shartnomasi bekor qilinganda xodim bilan hisob-kitob qilish" }
                ]
              },
              {
                title: "5-paragraf. Xodimning shaxsga doir ma'lumotlarini himoya qilish",
                articles: [
                  { no: "173", title: "Xodimning shaxsga doir ma'lumotlarini saqlash tartibi" },
                  { no: "174", title: "Xodimning shaxsga doir ma'lumotlarini uzatish" },
                  { no: "175", title: "Xodimning shaxsga doir ma'lumotlariga ishlov berish maqsadlari" },
                  { no: "176", title: "Xodimning shaxsga doir ma'lumotlariga ishlov berish chog'idagi umumiy talablar va ularni himoya qilish kafolatlari" },
                  { no: "177", title: "Xodimning o'zining shaxsga doir ma'lumotlari himoya qilinishini rad etishi to'g'risidagi mehnat shartnomasi shartlarining, ichki hujjatlar qoidalarining haqiqiy emasligi" }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    part: "MAXSUS QISM (davomi)",
    chapters: [
      {
        title: "V BO'LIM. ISH VAQTI",
        sections: [
          {
            title: "13-bob. Ish vaqti",
            paragraphs: [
              {
                title: "1-paragraf. Ish vaqtining davomiyligi",
                articles: [
                  { no: "178", title: "Ish vaqti tushunchasi" },
                  { no: "179", title: "Mehnat qonunchiligida ish vaqtining normalangan me'yorlari" },
                  { no: "180", title: "Ish haftasi va ish kuni tushunchasi" },
                  { no: "181", title: "Normal ish vaqtining davomiyligi" },
                  { no: "182", title: "Qisqartirilgan ish vaqti" },
                  { no: "183", title: "Qisqartirilgan ish vaqtining davomiyligi" },
                  { no: "184", title: "To'liq bo'lmagan ish vaqti" },
                  { no: "185", title: "To'liq bo'lmagan ish vaqtining belgilanishi" },
                  { no: "186", title: "Ish vaqtidan tashqari ishlash" },
                  { no: "187", title: "Ish vaqtidan tashqari ishga jalb etish tartibi" },
                  { no: "188", title: "Ish vaqtidan tashqari ishga jalb etishni taqiqlash" },
                  { no: "189", title: "Ish vaqtidan tashqari ishning chegaralari" }
                ]
              },
              {
                title: "2-paragraf. Ish vaqti rejimi",
                articles: [
                  { no: "190", title: "Ish vaqti rejimlari" },
                  { no: "191", title: "Ish vaqtini jamlab hisobga olish" },
                  { no: "192", title: "Ish vaqtini jamlab hisobga olishning shartlari" },
                  { no: "193", title: "Smenali ish" },
                  { no: "194", title: "Navbatchilik" },
                  { no: "195", title: "Xodim boshqa ish beruvchiga vaqtincha xizmat safariga yuborilgan taqdirda ish vaqti rejimi" },
                  { no: "196", title: "Ish vaqtini hisobga olish" },
                  { no: "197", title: "Ish vaqti jadvalini tuzish" },
                  { no: "198", title: "Ish joyida bo'lish vaqti" },
                  { no: "199", title: "Tun vaqtida ishlash" },
                  { no: "200", title: "Tun vaqtidagi ishning davomiyligi" },
                  { no: "201", title: "Ish vaqti hisobi bo'yicha hujjatlashtirish" },
                  { no: "202", title: "Xodimni mehnat majburiyatlarini bajarishdan ozod etishning dam olish vaqti bo'lmagan davrlari" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "VI BO'LIM. DAM OLISH VAQTI",
        sections: [
          {
            title: "14-bob. Dam olish vaqti",
            paragraphs: [
              {
                title: "1-paragraf. Dam olish vaqtining turlari",
                articles: [
                  { no: "203", title: "Xodimning qonunchilik bilan kafolatlangan dam olish huquqini cheklaydigan hujjatlar qoidalarining haqiqiy emasligi" },
                  { no: "204", title: "Dam olish va ovqatlanish uchun tanaffuslar" },
                  { no: "205", title: "Ish kuni (smena) davomidagi qo'shimcha tanaffuslar" },
                  { no: "206", title: "Har kungi (smenalar oralig'idagi) dam olishning davomiyligi" },
                  { no: "207", title: "Dam olish kunlari (har haftalik uzluksiz dam olish)" },
                  { no: "208", title: "Dam olish kunlarini berish tartibi" },
                  { no: "209", title: "Ishlanmaydigan bayram kunlari" },
                  { no: "210", title: "Xodimlarni dam olish kunlari va ishlanmaydigan bayram kunlari ularning roziligisiz ishga jalb etishning alohida hollari" },
                  { no: "211", title: "Dam olish kunlari va ishlanmaydigan bayram kunlari ishga jalb etishni cheklash" },
                  { no: "212", title: "Xodimni dam olish kuni yoki ishlanmaydigan bayram kuni ishga jalb etishni rasmiylashtirish" }
                ]
              },
              {
                title: "2-paragraf. Mehnat ta'tillari",
                articles: [
                  { no: "213", title: "Mehnat ta'tillarining turlari" },
                  { no: "214", title: "Har yilgi asosiy mehnat ta'tilining davomiyligi" },
                  { no: "215", title: "Har yilgi qo'shimcha mehnat ta'tillari" },
                  { no: "216", title: "Zararli mehnat sharoitlaridagi ishlar uchun beriladigan yillik qo'shimcha mehnat ta'tili" },
                  { no: "217", title: "Noqulay tabiiy-iqlim sharoitlaridagi ishlar uchun yillik qo'shimcha mehnat ta'tili" },
                  { no: "218", title: "Tartibsiz ish kuni rejimida ishlash uchun yillik qo'shimcha mehnat ta'tili" },
                  { no: "219", title: "Uzoq yillik mehnat tajribasi uchun yillik qo'shimcha mehnat ta'tili" },
                  { no: "220", title: "Bitta tashkilotda yoki tarmoqda ko'p yillik ish staji uchun beriladigan har yilgi qo'shimcha mehnat ta'tili" },
                  { no: "221", title: "Har yilgi mehnat ta'tillarining davomiyligini hisoblab chiqarish" },
                  { no: "222", title: "Har yilgi asosiy va qo'shimcha mehnat ta'tillarini jamlash tartibi" },
                  { no: "223", title: "Har yilgi mehnat ta'tili davomiyligini ishlab berilgan vaqtga mutanosib ravishda hisoblab chiqarish hollari" },
                  { no: "224", title: "Har yilgi mehnat ta'tili davomiyligini ishlab berilgan vaqtga mutanosib ravishda hisoblab chiqarish tartibi" },
                  { no: "225", title: "Har yilgi mehnat ta'tilini olish huquqini beradigan ish staji" },
                  { no: "226", title: "Ta'tillarni berish tartibi" },
                  { no: "227", title: "Ta'tillarni berish vaqti va navbati" },
                  { no: "228", title: "Ta'tilni uzaytirish yoki uni boshqa muddatga ko'chirish" },
                  { no: "229", title: "Ta'tilni qismlarga bo'lish" },
                  { no: "230", title: "Ta'tildan chaqirib olish" },
                  { no: "231", title: "Ta'tillar uchun haq to'lash" },
                  { no: "232", title: "Ta'til uchun haq to'lash muddatlari" },
                  { no: "233", title: "Ta'til to'lovi miqdori" },
                  { no: "234", title: "Foydalanilmagan ta'tillar uchun pullik kompensatsiya to'lash" },
                  { no: "235", title: "Mehnat shartnomasi bekor qilinganda yillik asosiy va qo'shimcha ta'tildan foydalanish" },
                  { no: "236", title: "Ta'til berish huquqini cheklaydigan qoidalarning haqiqiy emasligi" }
                ]
              },
              {
                title: "3-paragraf. Ijtimoiy ta'tillar",
                articles: [
                  { no: "237", title: "Ijtimoiy ta'tillar tushunchasi" },
                  { no: "238", title: "Jamoa kelishuvlarida yoxud jamoa shartnomasida yoki mehnat haqidagi boshqa huquqiy hujjatlarda ijtimoiy ta'tillarni belgilash" },
                  { no: "239", title: "Ijtimoiy ta'tillar berish asoslari va xodim tomonidan ulardan foydalanishning o'ziga xos xususiyatlari" },
                  { no: "240", title: "Homiladorlik va tug'ish ta'tili" },
                  { no: "241", title: "Farzand parvarishash ta'tili" },
                  { no: "242", title: "Farzand parvarishash ta'tilida bo'lgan xodimning kafolatlari" },
                  { no: "243", title: "O'qish ta'tillari" },
                  { no: "244", title: "Ish haqi saqlanmagan holda beriladigan ta'tillar" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "VII BO'LIM. MEHNATGA HAQ TO'LASH",
        sections: [
          {
            title: "15-bob. Mehnat haqi",
            paragraphs: [
              {
                title: "1-paragraf. Umumiy qoidalar",
                articles: [
                  { no: "245", title: "Mehnat haqi tushunchasi" },
                  { no: "246", title: "Mehnat haqi tizimi" },
                  { no: "247", title: "Mehnat haqi miqdorini belgilash" },
                  { no: "248", title: "Mehnatga haq to'lash kafolatlari" },
                  { no: "249", title: "Mehnat haqining eng kam miqdori" },
                  { no: "250", title: "Mehnat haqi shartlarini o'zgartirish" },
                  { no: "251", title: "Tarif tizimi va boshqa ish haqini belgilash tizimlari" },
                  { no: "252", title: "Ishning murakkabligi, hajmi va sifati uchun ustamalar" },
                  { no: "253", title: "Ish haqi to'lovining shakli" },
                  { no: "254", title: "Ish haqi to'lash muddatlari" },
                  { no: "255", title: "Ish haqi to'lash joyi" },
                  { no: "256", title: "Ish haqidan ushlab qolishlar" },
                  { no: "257", title: "Ish haqidan ushlab qolishning chegaralari" },
                  { no: "258", title: "Ish haqini to'lash kafolatlarini buzganlik uchun javobgarlik" }
                ]
              },
              {
                title: "2-paragraf. O'rtacha ish haqi",
                articles: [
                  { no: "259", title: "O'rtacha ish haqini saqlash kafolati" },
                  { no: "260", title: "O'rtacha ish haqini hisoblab chiqarish tartibi" },
                  { no: "261", title: "O'rtacha ish haqiga kiritilmaydigan to'lovlar" },
                  { no: "262", title: "O'rtacha oylik ish haqi" }
                ]
              },
              {
                title: "3-paragraf. Maxsus sharoitlarda ish haqi",
                articles: [
                  { no: "263", title: "Ish vaqtidan tashqari ishlaganligi uchun ish haqi" },
                  { no: "264", title: "Dam olish va bayram kunlari ishlash uchun ish haqi" },
                  { no: "265", title: "Tun vaqtida ishlash uchun ish haqi" },
                  { no: "266", title: "Bir necha kasbda (lavozimda) ishlash uchun ish haqi" },
                  { no: "267", title: "Mahsulot yaroqsizligi uchun ish haqi" },
                  { no: "268", title: "To'xtatib turilgan vaqt uchun ish haqi" },
                  { no: "269", title: "Yangi ish sharoitlarida xodimning malakasiga to'g'ri kelmaydigan ish uchun ish haqi" },
                  { no: "270", title: "Xizmat safari vaqtida ish haqi" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "VIII BO'LIM. KAFOLATLAR VA KOMPENSATSIYALAR",
        sections: [
          {
            title: "16-bob. Kafolatlar va kompensatsiyalar",
            paragraphs: [
              {
                title: "1-paragraf. Umumiy qoidalar",
                articles: [
                  { no: "271", title: "Kafolatlar va kompensatsiyalar tushunchasi" },
                  { no: "272", title: "Xizmat safariga yuborishda kafolatlar" },
                  { no: "273", title: "Xizmat safari xarajatlarini qoplash" },
                  { no: "274", title: "Boshqa joydagi ish uchun ko'chirishda kafolatlar" },
                  { no: "275", title: "Boshqa joydagi ishga ko'chib borganda xarajatlarni to'lash" },
                  { no: "276", title: "Xodimga tegishli mol-mulkdan foydalanganlik uchun xarajatlarni to'lash" },
                  { no: "277", title: "Malaka oshirish va kasb ta'limi uchun kafolatlar" },
                  { no: "278", title: "Davlat yoki jamoat vazifalarini bajarish uchun kafolatlar" },
                  { no: "279", title: "Donor uchun kafolatlar" },
                  { no: "280", title: "Sog'liqni saqlash muassasalariga murojaat qilish uchun kafolatlar" },
                  { no: "281", title: "Sud va boshqa organlarga chaqirilganda kafolatlar" },
                  { no: "282", title: "Mehnat shartnomasini bekor qilishda chiqim to'lovlari" },
                  { no: "283", title: "Xodim sog'lig'iga shikast yetkazilganida yoki vafot etganida kompensatsiya" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "IX BO'LIM. MEHNAT INTIZOMI",
        sections: [
          {
            title: "17-bob. Mehnat intizomi",
            paragraphs: [
              {
                title: "1-paragraf. Umumiy qoidalar",
                articles: [
                  { no: "284", title: "Mehnat intizomi tushunchasi" },
                  { no: "285", title: "Ichki mehnat tartibi qoidalari" },
                  { no: "286", title: "Xodimlarning mehnat intizomini mustahkamlashga doir majburiyatlari" },
                  { no: "287", title: "Ish beruvchining mehnat intizomini ta'minlashga doir majburiyatlari" },
                  { no: "288", title: "Mehnat intizomini mustahkamlashning usullari" }
                ]
              },
              {
                title: "2-paragraf. Xodimlarni rag'batlantirish",
                articles: [
                  { no: "289", title: "Xodimlarni rag'batlantirish uchun asoslar" },
                  { no: "290", title: "Rag'batlantirish turlari" },
                  { no: "291", title: "Rag'batlantirishni rasmiylashtirish" },
                  { no: "292", title: "Mehnat samaradorligini oshirganligi uchun rag'batlantirish" }
                ]
              },
              {
                title: "3-paragraf. Intizomiy javobgarlik",
                articles: [
                  { no: "293", title: "Intizomiy xato tushunchasi" },
                  { no: "294", title: "Intizomiy jazolar" },
                  { no: "295", title: "Intizomiy jazo qo'llash tartibi" },
                  { no: "296", title: "Intizomiy jazo qo'llash muddatlari" },
                  { no: "297", title: "Intizomiy jazoni bekor qilish" },
                  { no: "298", title: "Intizomiy jazoning amal qilish muddati" },
                  { no: "299", title: "Intizomiy jazolarni hisobga olish" },
                  { no: "300", title: "Intizomiy jazo ustidan shikoyat berish" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "X BO'LIM. MEHNAT SHARTNOMASI TARAFLARINING MODDIY JAVOBGARLIGI",
        sections: [
          {
            title: "18-bob. Moddiy javobgarlik",
            paragraphs: [
              {
                title: "1-paragraf. Umumiy qoidalar",
                articles: [
                  { no: "301", title: "Moddiy javobgarlikning shartlari" },
                  { no: "302", title: "Moddiy javobgarlikdan ozod etish" },
                  { no: "303", title: "Moddiy javobgarlik to'g'risidagi shartnoma" }
                ]
              },
              {
                title: "2-paragraf. Ish beruvchining moddiy javobgarligi",
                articles: [
                  { no: "304", title: "Ish beruvchining xodimga yetkazilgan zararni to'lash majburiyati" },
                  { no: "305", title: "Ish beruvchining xodimni mehnat qilish imkoniyatidan g'ayriqonuniy ravishda mahrum etganligi natijasida yetkazilgan zararni to'lash majburiyati" },
                  { no: "306", title: "Ish beruvchining xodim sog'lig'iga yetkazilgan zararni to'lash majburiyati" },
                  { no: "307", title: "Xodimning sog'lig'iga shikast yetganligi munosabati bilan to'lanishi lozim bo'lgan zarar miqdori" },
                  { no: "308", title: "Xodimning sog'lig'iga shikast yetkazilganda mehnat shartnomasi taraflarining aralash javobgarligi" },
                  { no: "309", title: "Boquvchining vafot etganligi munosabati bilan zararni ish beruvchi tomonidan to'lash majburiyati" },
                  { no: "310", title: "Xodimning mol-mulkiga yetkazilgan zararni to'lash" },
                  { no: "311", title: "Ma'naviy ziyonni kompensatsiya qilish" }
                ]
              },
              {
                title: "3-paragraf. Xodimning moddiy javobgarligi",
                articles: [
                  { no: "312", title: "Xodimning moddiy javobgarligi" },
                  { no: "313", title: "Xodimning cheklangan moddiy javobgarligi" },
                  { no: "314", title: "Xodimning to'liq moddiy javobgarligi" },
                  { no: "315", title: "To'liq moddiy javobgarlik to'g'risidagi yozma shartnoma" },
                  { no: "316", title: "Jamoa (brigada) moddiy javobgarligi" },
                  { no: "317", title: "Yetkazilgan zararni aniqlash" },
                  { no: "318", title: "Zararni undirish tartibi" },
                  { no: "319", title: "Zararni xodim tomonidan ixtiyoriy qoplash" },
                  { no: "320", title: "Zararni undirishda sudga murojaat qilish muddatlari" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "XI BO'LIM. MEHNAT MUHOFAZASI",
        sections: [
          {
            title: "19-bob. Mehnat muhofazasi",
            paragraphs: [
              {
                title: "1-paragraf. Umumiy qoidalar",
                articles: [
                  { no: "321", title: "Mehnat muhofazasi tushunchasi" },
                  { no: "322", title: "Mehnat muhofazasi sohasida davlat siyosati" },
                  { no: "323", title: "Mehnat muhofazasi talablarini belgilash" },
                  { no: "324", title: "Ish beruvchining mehnat muhofazasini ta'minlash majburiyatlari" },
                  { no: "325", title: "Xodimning mehnat muhofazasi sohasidagi huquq va majburiyatlari" }
                ]
              },
              {
                title: "2-paragraf. Xodimlarni himoya vositalari bilan ta'minlash",
                articles: [
                  { no: "326", title: "Xodimlarni shaxsiy va jamoaviy himoya vositalari bilan ta'minlash" },
                  { no: "327", title: "Xodimlarni sog'lomlashtirish va davolash bilan ta'minlash" },
                  { no: "328", title: "Ishlab chiqarishdagi baxtsiz hodisalar" },
                  { no: "329", title: "Ishlab chiqarishdagi baxtsiz hodisalarni tekshirish va hisobga olish" },
                  { no: "330", title: "Kasb kasalliklari" }
                ]
              },
              {
                title: "3-paragraf. Noqulay sharoitlarda mehnat",
                articles: [
                  { no: "331", title: "Og'ir, zararli va xavfli mehnat sharoitlaridagi ishlarda mehnatni tartibga solish" },
                  { no: "332", title: "Kompensatsiyalar va imtiyozlar" },
                  { no: "333", title: "Noqulay sharoitlardagi ishga yo'l qo'ymaslik" },
                  { no: "334", title: "Ishlab chiqarishdagi baxtsiz hodisa sodir bo'lishi xavfida ishni to'xtatish" },
                  { no: "335", title: "Xavfli ish sharoitlaridan bosh tortish huquqi" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "XII BO'LIM. AYRIM TOIFADAGI XODIMLAR MEHNATINI TARTIBGA SOLISH",
        sections: [
          {
            title: "20-bob. Ayrim toifadagi xodimlar",
            paragraphs: [
              {
                title: "1-paragraf. Ayollar va oilaviy mas'uliyatlari bo'lgan shaxslar",
                articles: [
                  { no: "336", title: "Homilador ayollar va kichik yoshli bolalari bo'lgan shaxslarga kafolatlar" },
                  { no: "337", title: "Homilador ayollarni boshqa ishga o'tkazish" },
                  { no: "338", title: "Homilador ayollar va bolali ayollarni ishdan bo'shatishni taqiqlash" },
                  { no: "339", title: "Kichik yoshli bolalarni boqish uchun tanaffuslar" },
                  { no: "340", title: "Oilaviy mas'uliyatlari bo'lgan xodimlarning ishlash tartibi" }
                ]
              },
              {
                title: "2-paragraf. Voyaga yetmagan xodimlar",
                articles: [
                  { no: "341", title: "Voyaga yetmaganlar mehnatini huquqiy jihatdan tartibga solishning xususiyatlari" },
                  { no: "342", title: "Voyaga yetmagan xodimlarga ta'qiqlangan ishlar" },
                  { no: "343", title: "Voyaga yetmagan xodimlarning ish vaqti va dam olish vaqti" },
                  { no: "344", title: "Voyaga yetmagan xodimlarning ta'tili" },
                  { no: "345", title: "Voyaga yetmagan xodimlarga nisbatan intizomiy javobgarlik" }
                ]
              },
              {
                title: "3-paragraf. Nogironligi bo'lgan xodimlar",
                articles: [
                  { no: "346", title: "Nogironligi bo'lgan xodimlarni mehnatga jalb etish" },
                  { no: "347", title: "Nogironligi bo'lgan xodimlarning mehnat sharoitlari" },
                  { no: "348", title: "Nogironligi bo'lgan xodimlar uchun ish joylari" },
                  { no: "349", title: "Nogironligi bo'lgan xodimlarning ish vaqti va ta'til muddatlari" }
                ]
              },
              {
                title: "4-paragraf. Pedagogik xodimlar",
                articles: [
                  { no: "350", title: "Pedagogik xodimlar mehnatini tartibga solishning xususiyatlari" },
                  { no: "351", title: "Pedagogik xodimlarning ish vaqti" },
                  { no: "352", title: "Pedagogik xodimlar ta'tili" },
                  { no: "353", title: "Pedagogik xodimlarning qo'shimcha imtiyozlari" }
                ]
              },
              {
                title: "5-paragraf. Ijodiy xodimlar va sportchilar",
                articles: [
                  { no: "354", title: "Ommaviy axborot vositalari, teatr va boshqa ijodiy tashkilotlar xodimlarining mehnatini tartibga solishning xususiyatlari" },
                  { no: "355", title: "Sportchi va murabbiylarning mehnatini tartibga solishning xususiyatlari" },
                  { no: "356", title: "Sportchi va murabbiylar bilan tuzilgan mehnat shartnomasi" }
                ]
              },
              {
                title: "6-paragraf. Rahbar xodimlar",
                articles: [
                  { no: "357", title: "Tashkilot rahbarining mehnat huquqlari va kafolatlari" },
                  { no: "358", title: "Tashkilot rahbarining mehnat majburiyatlari" },
                  { no: "359", title: "Tashkilot rahbari bilan mehnat shartnomasini bekor qilishning xususiyatlari" },
                  { no: "360", title: "Bosh hisobchi bilan mehnat munosabatlarining xususiyatlari" }
                ]
              },
              {
                title: "7-paragraf. O'rindoshlik asosida ishlaydigan xodimlar",
                articles: [
                  { no: "361", title: "O'rindoshlik asosida ishlash tushunchasi" },
                  { no: "362", title: "O'rindoshlik asosida ishlashni cheklash" },
                  { no: "363", title: "O'rindoshlik asosida ishlovchi xodimlar bilan mehnat shartnomasini tuzishning xususiyatlari" },
                  { no: "364", title: "O'rindoshlik asosida ishlovchi xodimlar uchun ish vaqti" },
                  { no: "365", title: "O'rindoshlik asosida ishlovchi xodimlar uchun ta'til" },
                  { no: "366", title: "O'rindoshlik asosida ishlovchi xodimlar bilan tuzilgan mehnat shartnomasini bekor qilishning xususiyatlari" }
                ]
              },
              {
                title: "8-paragraf. Uy ishchilari",
                articles: [
                  { no: "367", title: "Uy ishchilari bilan mehnat munosabatlarining xususiyatlari" },
                  { no: "368", title: "Uy ishchilari bilan tuzilgan mehnat shartnomasi" },
                  { no: "369", title: "Uy ishchilarining ish vaqti va dam olish vaqti" }
                ]
              },
              {
                title: "9-paragraf. Masofaviy ishlovchi xodimlar",
                articles: [
                  { no: "370", title: "Masofaviy ish tushunchasi" },
                  { no: "371", title: "Masofaviy ishlovchi xodimlar bilan mehnat shartnomasi" },
                  { no: "372", title: "Masofaviy ishlovchi xodimlarning ish vaqti rejimi" },
                  { no: "373", title: "Masofaviy ishlovchi xodimlarning ta'minoti" },
                  { no: "374", title: "Masofaviy ishlovchi xodimlar bilan mehnat shartnomasini bekor qilish" }
                ]
              },
              {
                title: "10-paragraf. Xalqaro mehnat munosabatlaridagi xodimlar",
                articles: [
                  { no: "375", title: "Chet el fuqarolari bilan mehnat munosabatlari" },
                  { no: "376", title: "O'zbekiston Respublikasi fuqarolari xorijda ishlagan holda" },
                  { no: "377", title: "Xalqaro mehnat tashkilotlari bilan hamkorlik" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "XIII BO'LIM. KASBIY TAYYORGARLIK, MALAKA OSHIRISH VA QAYTA TAYYORLASH",
        sections: [
          {
            title: "21-bob. Kasbiy ta'lim va malaka oshirish",
            paragraphs: [
              {
                title: "1-paragraf. Kasbiy tayyorgarlik",
                articles: [
                  { no: "378", title: "Kasbiy tayyorgarlik, malaka oshirish va qayta tayyorlash to'g'risidagi umumiy qoidalar" },
                  { no: "379", title: "Kasbiy tayyorgarlik shartnomasi" },
                  { no: "380", title: "Kasbiy tayyorgarlik muddati" },
                  { no: "381", title: "Kasbiy tayyorgarlik vaqtida ish haqi" },
                  { no: "382", title: "Kasbiy tayyorgarlikni tayyor bo'lishsiz tugatishning oqibatlari" },
                  { no: "383", title: "Xizmat burchlari shartlari" }
                ]
              },
              {
                title: "2-paragraf. Malaka oshirish",
                articles: [
                  { no: "384", title: "Malaka oshirish tartibi" },
                  { no: "385", title: "Malaka oshirishda xodimning kafolatlari" },
                  { no: "386", title: "Malaka oshirish uchun xodimlarni yuborish" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "XIV BO'LIM. MEHNAT NIZOLARI",
        sections: [
          {
            title: "22-bob. Yakka tartibdagi mehnat nizolari",
            paragraphs: [
              {
                title: "1-paragraf. Umumiy qoidalar",
                articles: [
                  { no: "387", title: "Yakka tartibdagi mehnat nizo tushunchasi" },
                  { no: "388", title: "Yakka tartibdagi mehnat nizolarini ko'ruvchi organlar" },
                  { no: "389", title: "Mehnat nizolari bo'yicha komissiya" },
                  { no: "390", title: "Mehnat nizolari bo'yicha komissiyaning ish tartibi" },
                  { no: "391", title: "Mehnat nizolari bo'yicha komissiyaning qarorlari" },
                  { no: "392", title: "Mehnat nizolari bo'yicha komissiya qarorini ijro etish" },
                  { no: "393", title: "Yakka tartibdagi mehnat nizolarini sudda ko'rish" },
                  { no: "394", title: "Sudga murojaat qilish muddatlari" },
                  { no: "395", title: "Mehnat nizolari bo'yicha sud qarorlarini ijro etish" }
                ]
              }
            ]
          },
          {
            title: "23-bob. Jamoa mehnat nizolari",
            paragraphs: [
              {
                title: "1-paragraf. Jamoa mehnat nizolarini hal etish",
                articles: [
                  { no: "396", title: "Jamoa mehnat nizo tushunchasi" },
                  { no: "397", title: "Jamoa mehnat nizolarini hal etishning bosqichlari" },
                  { no: "398", title: "Murosaga kelish tartiblari" },
                  { no: "399", title: "Hakamlik murosachilari" },
                  { no: "400", title: "Mehnat arbitraji" },
                  { no: "401", title: "Mehnat arbitrajining qarorlari" }
                ]
              },
              {
                title: "2-paragraf. Ish tashlash",
                articles: [
                  { no: "402", title: "Xodimlarning ish tashlash huquqi" },
                  { no: "403", title: "Ish tashlashni e'lon qilish tartibi" },
                  { no: "404", title: "Ish tashlash paytida minimal xizmatlarni ta'minlash" },
                  { no: "405", title: "Noqonuniy ish tashlash" },
                  { no: "406", title: "Ish tashlash paytida xodimlarning kafolatlari" },
                  { no: "407", title: "Ish tashlashni taqiqlash" },
                  { no: "408", title: "Ish tashlash vaqtida ish beruvchining harakatlari" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "XV BO'LIM. MEHNAT QONUNCHILIGIGA RIOYA ETILISHI USTIDAN NAZORAT",
        sections: [
          {
            title: "24-bob. Davlat nazorati va jamoat nazorati",
            paragraphs: [
              {
                title: "1-paragraf. Davlat mehnat nazorati",
                articles: [
                  { no: "409", title: "Mehnat qonunchiligiga rioya etilishi ustidan davlat nazoratini amalga oshiruvchi organlar" },
                  { no: "410", title: "Mehnat qonunchiligiga rioya etilishi ustidan davlat nazoratini amalga oshiruvchi organlarning vakolatlari" },
                  { no: "411", title: "Mehnat inspektorlarining huquqlari" },
                  { no: "412", title: "Mehnat qonunchiligini buzganlik uchun javobgarlik" }
                ]
              },
              {
                title: "2-paragraf. Jamoat nazorati",
                articles: [
                  { no: "413", title: "Kasaba uyushmalari nazorati" },
                  { no: "414", title: "Jamoat mehnat nazorati vakillari" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "XVI BO'LIM. MAXSUS XODIMLAR GURUHLARI BILAN MEHNAT MUNOSABATLARI",
        sections: [
          {
            title: "25-bob. Kichik korxonalar va tadbirkorlar xodimlari",
            paragraphs: [
              {
                title: "1-paragraf. Kichik korxonalar xodimlari",
                articles: [
                  { no: "415", title: "Kichik korxonalar xodimlari bilan mehnat munosabatlarining xususiyatlari" },
                  { no: "416", title: "Yakka tartibdagi tadbirkor xodimlari bilan mehnat munosabatlari" }
                ]
              }
            ]
          },
          {
            title: "26-bob. Davlat xizmatchilari",
            paragraphs: [
              {
                title: "1-paragraf. Davlat fuqarolik xizmatchilari",
                articles: [
                  { no: "417", title: "Davlat fuqarolik xizmatchilari bilan mehnat munosabatlarining xususiyatlari" },
                  { no: "418", title: "Davlat fuqarolik xizmatchilari bilan mehnat shartnomasini tuzish" },
                  { no: "419", title: "Davlat fuqarolik xizmatchilari bilan mehnat shartnomasini bekor qilish" }
                ]
              }
            ]
          },
          {
            title: "27-bob. Xorijda ishlovchi xodimlar",
            paragraphs: [
              {
                title: "1-paragraf. Xorijda ishlash",
                articles: [
                  { no: "420", title: "O'zbekiston fuqarolarini xorijga ishlash uchun yuborish tartibi" },
                  { no: "421", title: "Xorijda ishlovchi xodimlarning huquqlari va kafolatlari" },
                  { no: "422", title: "Xorijda ishlovchi xodimlarning ijtimoiy himoyasi" }
                ]
              }
            ]
          },
          {
            title: "28-bob. Mehnatkash muhojirlar",
            paragraphs: [
              {
                title: "1-paragraf. Mehnatkash muhojirlar",
                articles: [
                  { no: "423", title: "Chet el mehnatkash muhojirlarining O'zbekistonda ishlash tartibi" },
                  { no: "424", title: "Mehnatkash muhojirlarning huquqlari" },
                  { no: "425", title: "Mehnatkash muhojirlarning ijtimoiy himoyasi" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "XVII BO'LIM. MEHNAT MUNOSABATLARIDA AXBOROT TEXNOLOGIYALARI",
        sections: [
          {
            title: "29-bob. Raqamli mehnat munosabatlari",
            paragraphs: [
              {
                title: "1-paragraf. Elektron mehnat hujjatlari",
                articles: [
                  { no: "426", title: "Elektron mehnat daftarchasi" },
                  { no: "427", title: "Mehnat munosabatlarida elektron hujjat aylanmasi" },
                  { no: "428", title: "Yagona milliy mehnat tizimi" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "XVIII BO'LIM. IJTIMOIY TA'MINOT VA SUGHURTA",
        sections: [
          {
            title: "30-bob. Ijtimoiy ta'minot kafolatlari",
            paragraphs: [
              {
                title: "1-paragraf. Davlat ijtimoiy sug'urtasi",
                articles: [
                  { no: "429", title: "Davlat ijtimoiy sug'urtasiga doir kafolatlar" },
                  { no: "430", title: "Ishlab chiqarishdagi baxtsiz hodisalar va kasb kasalliklaridan majburiy sug'urta" },
                  { no: "431", title: "Ish beruvchining fuqarolik javobgarligi majburiy sug'urtasi" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "XIX BO'LIM. MEHNAT QONUNCHILIGINI QOLLASHNING AYRIM MASALALARI",
        sections: [
          {
            title: "31-bob. Mehnat munosabatlarining o'ziga xos shakllari",
            paragraphs: [
              {
                title: "1-paragraf. Mehnat shartnomasi va fuqarolik-huquqiy shartnomaning farqi",
                articles: [
                  { no: "432", title: "Mehnat shartnomasi va fuqarolik-huquqiy shartnomaning farqlovchi belgilari" },
                  { no: "433", title: "Mehnat munosabatlarini fuqarolik-huquqiy munosabatlar deb nomlashning oqibatlari" },
                  { no: "434", title: "Mehnat munosabatlarini tan olish tartibi" }
                ]
              }
            ]
          },
          {
            title: "32-bob. Mehnat qonunchiligiga xilof bo'lgan hujjatlar",
            paragraphs: [
              {
                title: "1-paragraf. Haqiqiy emas hujjatlar",
                articles: [
                  { no: "435", title: "Mehnat haqidagi boshqa huquqiy hujjatlar qoidalarining va mehnat shartnomasi shartlarining haqiqiy emasligi" },
                  { no: "436", title: "Xodim mehnat huquqlarini cheklaydigan hujjatlarning haqiqiy emasligi" },
                  { no: "437", title: "Mehnat munosabatlarida hujjatlarning haqiqiy emasligini e'tirof etish tartibi" }
                ]
              }
            ]
          }
        ]
      },
      {
        title: "XX BO'LIM. UMUMIY QOIDALARGA QAYTISH VA YAKUNIY QOIDALAR",
        sections: [
          {
            title: "33-bob. Mehnat to'g'risidagi qonunchilikni amalga oshirish",
            paragraphs: [
              {
                title: "1-paragraf. Yakuniy qoidalar",
                articles: [
                  { no: "438", title: "Mehnat kodeksini amalga oshirishga doir normativ-huquqiy hujjatlar" },
                  { no: "439", title: "Ilgari tuzilgan mehnat shartnomalari va jamoa kelishuvlari" },
                  { no: "440", title: "Mehnat to'g'risidagi qonunchilikni tatbiq etish bo'yicha xalqaro hamkorlik" }
                ]
              }
            ]
          },
          {
            title: "34-bob. Xulosa qoidalar",
            paragraphs: [
              {
                title: "1-paragraf. Mehnat kodeksining kuchga kirishi",
                articles: [
                  { no: "441", title: "Mehnat kodeksining amal qilish doirasi" },
                  { no: "442", title: "Mehnat kodeksining boshqa qonunlar bilan munosabati" },
                  { no: "443", title: "Kuchini yo'qotgan normativ hujjatlar" },
                  { no: "444", title: "O'tish davri qoidalari" }
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
