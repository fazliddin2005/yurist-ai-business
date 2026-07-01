# Yurist AI — Backend va Ma'lumotlar Bazasi Arxitekturasi

Bu hujjat kodning O'ZIDAN o'qib chiqilgan holda yozilgan — taxmin yoki eski
versiyaga asoslanmagan. Maqsad: yangi qo'shilgan dasturchi (yoki kelajakdagi
siz) loyihaga kirib, "bu qayerda saqlanadi, bu qaysi route orqali ishlaydi"
degan savollarga tezda javob topishi.

## 1. Yuqori darajadagi rasm

Yurist AI — ikki interfeysli huquqiy-tech platforma:

| | Kim uchun | Asosiy sahifa |
|---|---|---|
| **B2C** | Jismoniy shaxs | `public/index.html` |
| **B2B "Yuridik Departament"** | Kompaniya (workspace) | `public/b2b.html` + `public/b2b.js` |
| **Super Admin** | Platforma egasi | `public/admin.html` + `public/admin.js` |

Uchtasi **bitta Express serveri** va **bitta MongoDB bazasi**ni bo'lishadi.
B2C va B2B bir xil `User` hisobi orqali kiradi (bitta login — ikki interfeys),
lekin ma'lumotlari (hujjatlar, suhbatlar) `scope`/`organizationId` orqali
qattiq ajratilgan — B2B workspace ichidagi hech narsa boshqa workspace yoki
B2C foydalanuvchisiga ko'rinmaydi.

```
Brauzer
  │
  ├─ public/index.html  (B2C, statik fayl, ichida butun JS bor)
  ├─ public/b2b.html + b2b.js (B2B)
  └─ public/admin.html + admin.js (Super Admin)
        │
        ▼  fetch('/api/...')  +  Authorization: Bearer <JWT>
  server/index.js  (Express, kirish nuqtasi)
        │
        ├─ /api/auth, /api/users, /api/documents, /api/risk, /api/chat,
        │  /api/catalog, /api/conversations, /api/cases, /api/promo,
        │  /api/docgen                              → B2C route'lar
        ├─ /api/b2b/*                                → B2B route'lar
        └─ /api/admin/*                               → Admin route'lar
        │
        ▼
  MongoDB (Mongoose modellari, server/models/)
```

## 2. Texnologiyalar

| Qatlam | Texnologiya |
|---|---|
| Backend | Node.js + Express 4 |
| Baza | MongoDB (Mongoose 8 ORM) |
| Auth | JWT (`jsonwebtoken`) + bcrypt (parol xeshlash) |
| AI | OpenAI (`gpt-4o-mini`) — chat, AI shablon yaratish |
| Huquqiy qidiruv | Nia API (Nozomio Labs) — lex.uz va boshqa rasmiy manbalardan real modda matni |
| Hujjat generatsiya | `pdfkit` (PDF), `docx` (DOCX) |
| Fayl yuklash | `multer` (xotirada, diskka yozmaydi — Vercel serverless mos) |
| Xavfsizlik | `helmet`, `express-rate-limit`, `bcryptjs`, `crypto` (API kalit xeshlash) |
| Frontend | Vanilla JS, bitta-fayl SPA (build tool yo'q, hech narsa compile qilinmaydi) |

**Nega build tool yo'q:** `public/*.html` to'g'ridan-to'g'ri brauzerda ishlaydi
— React/Vue/webpack yo'q. Bu ataylab oddiy tutilgan, chunki butun ilova bitta
kishi (siz) tomonidan boshqariladi va deploy tezligi muhim.

## 3. Papka tuzilishi (HAQIQIY, joriy holat)

```
yurist-ai-app/
├── server/
│   ├── index.js                 Express kirish nuqtasi, barcha route mount
│   ├── nia.js                    Nia API klienti (real qonun/sud qidiruvi)
│   ├── riskEngine.js             Shartnoma xavf tahlili — qoidaga asoslangan ball
│   ├── riskEngine.test.js        riskEngine.js'ni o'zgartirgandan keyin ALBATTA ishga tushiriladigan doimiy test to'plami
│   ├── textExtraction.js         PDF/DOCX/TXT fayllardan haqiqiy matn ajratish (pdf-parse, mammoth)
│   ├── jurisdictionRouter.js      Matn/parametr asosida qaysi davlat qonuni kerakligini aniqlaydi
│   ├── citationBuilder.js        AI javobiga manba havolalarini biriktiradi
│   ├── caseSummarizer.js         "Ishlarim" (Case) uchun AI orqali xulosa yangilash
│   ├── accountDeletion.js        30-kunlik kechiktirilgan o'chirish + avtomatik tozalash
│   ├── accuracyMetrics.js        RAGAS-uslubidagi javob aniqligi baholash
│   ├── activityLog.js            Admin panel uchun faollik yozish
│   ├── dataRetentionPolicy.js    "Ma'lumot qancha saqlanadi" siyosati matni
│   ├── termsManager.js           Foydalanish shartlari versiyalarini boshqarish
│   ├── notifier.js               SMS/email yuborish (hozircha demo rejim)
│   ├── legalData.js               8 davlat uchun qonun ro'yxati + rasmiy havolalar (statik ma'lumot)
│   ├── legal-content/uz/laborCode.js   Qo'lda tasdiqlangan O'zbekiston Mehnat kodeksi mundarijasi
│   ├── legal-text/termsContent.js      Foydalanish shartlari matni (8 til)
│   ├── seed.js                    B2C hujjat shablonlari ro'yxati (statik)
│   │
│   ├── models/                   -- MONGOOSE MODELLARI (bo'lim 4'ga qarang) --
│   ├── routes/                   -- B2C API route'lari (bo'lim 5'ga qarang) --
│   ├── b2b/                      -- B2B modul, B2C'dan mustaqil (bo'lim 6'ga qarang) --
│   ├── admin/                    -- Super Admin auth + route'lar --
│   ├── templates/                pdfBuilder.js, docxBuilder.js, contractText.js
│   └── migrations/               Bir martalik Mongo migratsiya skriptlari
│
├── public/
│   ├── index.html                 B2C -- to'liq SPA (HTML+CSS+JS bitta faylda)
│   ├── b2b.html + b2b.js          B2B -- alohida SPA
│   ├── admin.html + admin.js      Super Admin panel
│   └── i18n.js                    B2B uchun til lug'ati (B2C o'zining ICHKI lug'atiga ega, alohida)
│
├── package.json
├── .env.example                   Har bir environment variable izohlangan
└── README.md                      (shu fayl)
```

**Diqqat:** `server/db.js` degan fayl **YO'Q** — agar eski hujjat/eslatmada
shu nom uchrasa, eskirgan. Hozir HAMMA narsa MongoDB orqali saqlanadi.

## 4. MongoDB modellari (`server/models/`)

Har bir model `toJSON()` orqali Mongo'ning `_id`/`__v` maydonlarini olib
tashlaydi va o'rniga `id` (string) qaytaradi -- frontend hech qachon xom
ObjectId ko'rmaydi.

| Model | Fayl | Vazifasi | Asosiy bog'lanishlar |
|---|---|---|---|
| **User** | `User.js` | B2C **va** B2B foydalanuvchisi -- bitta hisob, ikkisida ham ishlaydi | -- |
| **Organization** + **Member** | `Organization.js` | B2B workspace + a'zolik (rol: owner/admin/member/viewer) | `Organization.ownerId → User`, `Member.{organizationId,userId}` |
| **Document** | `Document.js` | Yaratilgan hujjatlar -- B2C va B2B uchun BITTA model, `scope` orqali farqlanadi | `userId` (B2C) yoki `organizationId`+`templateId` (B2B) |
| **Template** + **TemplateVersion** | `Template.js` | B2B CLM shartnoma shablonlari + versiyalar tarixi | `organizationId`, alohida versiya kolleksiyasi |
| **Audit** | `Audit.js` | B2B AI Risk Audit natijalari (topilmalar, manba havolalar, sud amaliyoti) | `organizationId`, ixtiyoriy `createdViaApiKey` |
| **Case** | `Case.js` | "Ishlarim" -- ko'p oylik AI xotira (xulosa + voqealar tarixi) | `userId` (B2C) yoki `organizationId` (B2B) |
| **Chat** | `Chat.js` | AI Yordamchi suhbat tarixi -- B2C va B2B bitta model | `userId`, ixtiyoriy `organizationId` |
| **APIKey** | `APIKey.js` | B2B tashqi integratsiya kalitlari (1C, Bitrix24) -- faqat SHA-256 xesh saqlanadi | `organizationId` |
| **Invite** | `Invite.js` | Workspace'ga xodim taklif qilish havolalari | `organizationId`, `invitedBy` |
| **SecurityIncident** | `SecurityIncident.js` | Xavfsizlik hodisalari jurnali (huquqiy bildirish muddatlarini kuzatish uchun) | -- |
| **TermsVersion** | `TermsVersion.js` | Har bir Foydalanish shartlari versiyasining O'ZGARMAS arxivi | -- |
| **DeletionRequest** | `DeletionRequest.js` | Hisobni o'chirish so'rovi -- 30 kunlik kechiktirish | `userId` |
| **ActivityLog** | `ActivityLog.js` | Admin panel uchun faollik yozuvlari (shaxsiy mazmun SAQLANMAYDI) | ixtiyoriy `userId` |
| **AccuracyScore** | `AccuracyScore.js` | AI javob sifatini baholash (RAGAS-uslubida) | ixtiyoriy `userId`/`organizationId` |
| **PromoRedemption / PasswordReset / Verification** | `Misc.js` | Kichik yordamchi yozuvlar | `userId` |

### Muhim arxitektura qarori: B2C va B2B kreditlari BIR XIL balans

`Organization.credits` maydoni hali ham bazada mavjud, lekin **endi billing
uchun ishlatilmaydi** -- bu eski sxema qoldig'i. Haqiqiy kredit tekshiruvi va
yechish HAR DOIM `User.credits` orqali bo'ladi (qarang: `server/b2b/routes/chat.js`,
`audit.js`, `documents.js`, `templates.js`). Sabab: foydalanuvchi B2C'da 1
kredit sarflasa, B2B'da ham xuddi shu odam uchun 1 kam ko'rinishi kerak --
ikkalasi bitta odamning bitta balansidir, ikki xil "hovuz" emas.

**Bundan kelib chiqadigan natija:** agar workspace'da bir nechta xodim bo'lsa,
har biri o'zining SHAXSIY kreditidan sarflaydi (B2B chatda/auditda/shablon
yaratishda) -- kompaniya umumiy puli degan tushuncha hozircha yo'q. Kelajakda
ko'p xodimli to'lovchi mijozlar paydo bo'lsa, bu qayta ko'rib chiqilishi mumkin.

## 5. B2C API (`server/routes/`, `/api/...` orqali mount qilingan)

| Fayl | Mount | Vazifasi |
|---|---|---|
| `auth.js` | `/api/auth` | Ro'yxatdan o'tish, kirish, parolni tiklash, shartlarga rozilik |
| `users.js` | `/api/users` | Profil, kredit, til/yurisdiksiya, ma'lumot siyosati, hisobni o'chirish |
| `documents.js` | `/api/documents` | Hujjat yaratish + PDF/DOCX yuklab olish + o'chirish |
| `risk.js` | `/api/risk` | AI Risk Audit (fayl yuklash, 1 kredit) |
| `chat.js` | `/api/chat` | AI Yordamchi (Nia + OpenAI, jurisdiksiya aniqlash) |
| `catalog.js` | `/api/catalog` | Advokatlar/shablonlar ro'yxati + qonunlar mundarijasi (Nia orqali real qidiruv) |
| `conversations.js` | `/api/conversations` | Oddiy chat tarixi (saqlash/o'chirish) |
| `cases.js` | `/api/cases` | "Ishlarim" -- ko'p oylik AI xotira |
| `promo.js` | `/api/promo` | Promokod orqali kredit olish |
| `docgen.js` | `/api/docgen` | Eski/qo'shimcha hujjat generatsiya yo'li |

To'liq endpoint ro'yxati (metod + yo'l) bo'lim 8'da.

## 6. B2B modul (`server/b2b/`) -- B2C'dan mustaqil

```
server/b2b/
├── workspace.js          requireWorkspaceAccess() middleware -- har bir B2B
│                         route'da ishlatiladi, 403 qaytaradi agar foydalanuvchi
│                         shu workspace a'zosi bo'lmasa yoki rol yetarli bo'lmasa
├── apiKeys.js            API kalit yaratish/tekshirish mantig'i (SHA-256 xesh)
├── invites.js            Taklif tokeni yaratish/tasdiqlash
└── routes/
    ├── workspaces.js      Workspace CRUD, a'zolar, rollar, takliflar
    ├── templates.js        CLM shablonlari: yaratish, versiyalash, to'ldirish,
    │                       AI bilan avtomatik yaratish (OpenAI), arxivlash
    ├── audit.js            B2B AI Risk Audit (B2C bilan bir xil riskEngine.js,
    │                       lekin workspace ko'lamida)
    ├── documents.js        To'ldirilgan hujjatlarni saqlash + yuklab olish
    ├── chat.js             AI Yordamchi (workspace konteksti bilan)
    ├── conversations.js    B2B chat tarixi
    ├── apiKeys.js          API kalit boshqaruvi (yaratish/bekor qilish)
    └── external.js         TASHQI integratsiya API'si (1C, Bitrix24 uchun) --
                            API kalit orqali autentifikatsiya qilinadi, JWT emas
```

**Ruxsat modeli:** har bir B2B route `ws.requireWorkspaceAccess('member'|'admin'|'owner')`
orqali himoyalangan. Bu middleware: (1) JWT'dan foydalanuvchini aniqlaydi,
(2) `Member` kolleksiyasidan shu odam shu `organizationId`ga a'zoligini
tekshiradi, (3) rolini talab qilingan minimal daraja bilan solishtiradi.
Mos kelmasa -- **403**, hech qachon boshqa workspace ma'lumoti oqib chiqmaydi.

**Tashqi API (`external.js`) boshqacha autentifikatsiya ishlatadi:** JWT
o'rniga `Authorization: Bearer <api_key>` -- kalit `APIKey` kolleksiyasida
SHA-256 xeshi bilan tekshiriladi (xom kalit bazada saqlanmaydi, faqat
yaratilgan paytda bir marta ko'rsatiladi).

## 7. Autentifikatsiya va xavfsizlik

- **Parollar:** `bcryptjs` orqali xeshlanadi, hech qachon ochiq saqlanmaydi.
- **Sessiya:** JWT token, 30 kun amal qiladi (B2C/B2B), admin uchun 8 soat.
  `JWT_SECRET` va `ADMIN_JWT_SECRET` **ALOHIDA** bo'lishi shart (`.env`da).
  Agar sozlanmagan bo'lsa, server HAR ISHGA TUSHGANDA tasodifiy kalit
  generatsiya qiladi -- bu xavfsiz, lekin demak har restart'da hamma chiqib
  ketadi. Production'da bu ikki kalitni albatta `.env`/Vercel orqali sozlang.
- **Rate limiting:** `/api/auth/register`, `/login`, `/verify`, `/resend-code`,
  `/forgot-password`, `/reset-password` -- barchasi `express-rate-limit`
  bilan himoyalangan (bir IP'dan 15 daqiqada 10 urinish).
- **Admin parol solishtirish:** `crypto.timingSafeEqual` orqali (timing
  hujumiga qarshi), oddiy `===` emas.
- **CORS:** standart holatda ochiq; `ALLOWED_ORIGINS` env o'zgaruvchisi
  orqali ixtiyoriy ravishda cheklash mumkin.
- **Helmet:** standart xavfsizlik sarlavhalari yoqilgan (CSP o'chirilgan,
  chunki tashqi shrift/CDN ishlatiladi).

## 8. To'liq API endpoint ro'yxati

### B2C
```
POST   /api/auth/register
POST   /api/auth/verify
POST   /api/auth/resend-code
POST   /api/auth/login
GET    /api/auth/me
GET    /api/auth/terms
POST   /api/auth/accept-terms
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/users/me
POST   /api/users/me/credits          [!] hozircha to'lov tekshiruvisiz -- bo'lim 9'ga qarang
POST   /api/users/me/jurisdiction
POST   /api/users/me/lang
GET    /api/users/data-policy
GET    /api/users/me/deletion-status
POST   /api/users/me/request-deletion
POST   /api/users/me/cancel-deletion

GET    /api/documents
GET    /api/documents/:id
POST   /api/documents              (1 kredit)
GET    /api/documents/:id/pdf
GET    /api/documents/:id/docx
DELETE /api/documents/:id

POST   /api/risk/analyze           (1 kredit)
POST   /api/chat                   (1 kredit / 5 xabar)

GET    /api/catalog/lawyers
GET    /api/catalog/templates
GET    /api/catalog/jurisdictions
GET    /api/catalog/laws/:jurisdiction
GET    /api/catalog/laws/:jurisdiction/:lawKey

GET    /api/conversations
GET    /api/conversations/:id
POST   /api/conversations
POST   /api/conversations/:id/messages
DELETE /api/conversations/:id

GET    /api/cases
GET    /api/cases/:id
POST   /api/cases
POST   /api/cases/:id/events
PATCH  /api/cases/:id/close
DELETE /api/cases/:id

POST   /api/promo/redeem
POST   /api/docgen/generate
```

### B2B (har biri `:workspaceId` talab qiladi, agar ko'rsatilmagan bo'lsa)
```
GET    /api/b2b/workspaces
POST   /api/b2b/workspaces
GET    /api/b2b/workspaces/:workspaceId
PATCH  /api/b2b/workspaces/:workspaceId
DELETE /api/b2b/workspaces/:workspaceId
GET    /api/b2b/workspaces/:workspaceId/members
POST   /api/b2b/workspaces/:workspaceId/members
PATCH  /api/b2b/workspaces/:workspaceId/members/:userId
DELETE /api/b2b/workspaces/:workspaceId/members/:userId
GET    /api/b2b/workspaces/:workspaceId/invites
POST   /api/b2b/workspaces/:workspaceId/invites
DELETE /api/b2b/workspaces/:workspaceId/invites/:inviteId
GET    /api/b2b/workspaces/invites/:token
POST   /api/b2b/workspaces/invites/:token/accept

GET    /api/b2b/templates/:workspaceId
GET    /api/b2b/templates/:workspaceId/:templateId
POST   /api/b2b/templates/:workspaceId
PUT    /api/b2b/templates/:workspaceId/:templateId
POST   /api/b2b/templates/:workspaceId/:templateId/fill
POST   /api/b2b/templates/:workspaceId/ai-draft     (1 kredit, OpenAI)
PATCH  /api/b2b/templates/:workspaceId/:templateId/archive

GET    /api/b2b/audit/:workspaceId
GET    /api/b2b/audit/:workspaceId/:auditId
POST   /api/b2b/audit/:workspaceId/analyze            (1 kredit)

GET    /api/b2b/documents/:workspaceId
POST   /api/b2b/documents/:workspaceId                (1 kredit)
GET    /api/b2b/documents/:workspaceId/:docId/pdf
GET    /api/b2b/documents/:workspaceId/:docId/docx

POST   /api/b2b/chat/:workspaceId                     (1 kredit / 5 xabar)
GET    /api/b2b/conversations/:workspaceId
GET    /api/b2b/conversations/:workspaceId/:convoId
POST   /api/b2b/conversations/:workspaceId
POST   /api/b2b/conversations/:workspaceId/:convoId/messages
DELETE /api/b2b/conversations/:workspaceId/:convoId

GET    /api/b2b/api-keys/:workspaceId
POST   /api/b2b/api-keys/:workspaceId
DELETE /api/b2b/api-keys/:workspaceId/:keyId

# Tashqi integratsiya (API kalit bilan, JWT emas):
GET    /api/b2b/external/templates
GET    /api/b2b/external/templates/:id
POST   /api/b2b/external/templates/:id/fill
GET    /api/b2b/external/documents
POST   /api/b2b/external/documents
GET    /api/b2b/external/audits
GET    /api/b2b/external/audits/:id
POST   /api/b2b/external/audits/analyze
```

### Super Admin (`/api/admin/...`, alohida login va JWT)
```
POST   /api/admin/login
GET    /api/admin/overview
GET    /api/admin/users
GET    /api/admin/users/by-ip
GET    /api/admin/activity
GET    /api/admin/workspaces
GET    /api/admin/accuracy
GET    /api/admin/terms-versions
GET    /api/admin/terms-versions/:version
POST   /api/admin/terms-versions
GET    /api/admin/incidents
GET    /api/admin/incidents/:id
POST   /api/admin/incidents
PATCH  /api/admin/incidents/:id/status
PATCH  /api/admin/incidents/:id/notify-authority
```

## 9. Bilingan cheklovlar (joriy holat, yashirilmagan)

- **"Qonunlar" bo'limi STATIK ma'lumotlar bazasi EMAS** -- bu ataylab shunday
  qilingan. lex.uz'dagi BARCHA kodekslar va minglab moddani statik nusxa
  sifatida saqlash (a) doimo eskirib qoladi (qonun o'zgarganda qayta
  yuklamasdan bilinmaydi), va (b) bir necha haftalik alohida loyiha talab
  qiladi. Buning o'rniga tizim Nia API orqali lex.uz'ni **JONLI** qidiradi --
  har bir savol uchun eng so'nggi rasmiy matnni real vaqtda topadi. AI Yordamchi
  va "Qonunlar" bo'limi ikkisi ham shu mexanizmni ishlatadi, va ikkisida ham
  endi har bir modda **aniq lex.uz havolasi** (Manba: lex.uz, bosilganda
  to'g'ridan-to'g'ri tegishli moddaga ochiladi) bilan birga ko'rsatiladi.
  Ilgari bu havola hisoblab chiqilardi-yu, AI javobiga yoki interfeysga
  yetib bormas edi (havola "yo'qolib qolardi") -- bu tuzatildi.

- **`POST /api/users/me/credits`** -- hozircha to'lov provayderi (Payme/Click)
  ulanmagan, shuning uchun bu endpoint mijoz so'rovidagi qiymatga ishonadi.
  Frontend buni "test rejimi" deb belgilab qo'ygan. Real to'lov tizimi
  ulanmaguncha, bu yerda haqiqiy pul aylanmasligi kerak.
- **Workspace kredit hovuzi** -- yuqorida (bo'lim 4) aytib o'tilgan: B2B
  kredit endi shaxsiy, jamoaviy hovuz yo'q.
- **Noto'g'ri ID format** (masalan buzilgan URL) ba'zi joylarda 404 o'rniga
  500 qaytaradi (Mongoose CastError to'liq alohida ushlanmagan) -- funksional
  emas, faqat HTTP status farqi.
- **Skanerlangan (rasm-asosli) PDF/DOCX hali qo'llab-quvvatlanmaydi** --
  `server/textExtraction.js` (`pdf-parse` + `mammoth`) faqat MATN qatlami bor
  fayllardan o'qiydi. Agar hujjat skaner qilingan rasm bo'lsa (OCR kerak
  bo'ladigan turi), matn bo'sh chiqadi va "o'qib bo'lmadi" deb ko'rsatiladi --
  bu xato emas, OCR hali ulanmagan, alohida funksiya sifatida kelajakda
  qo'shilishi mumkin.

## 10. O'rnatish va ishga tushirish

```bash
npm install
cp .env.example .env
# .env faylini ochib, kamida MONGODB_URI'ni to'ldiring
npm start
```

Minimal ishlash uchun **faqat `MONGODB_URI` shart**. `OPENAI_API_KEY` va
`NIA_API_KEY` bo'lmasa, AI oddiy (qoidaga asoslangan) javob beradi, real
qonun manbasiga ulanmaydi. `ADMIN_PASSWORD` bo'sh bo'lsa, `/admin` sahifasi
ishlamaydi (xavfsizlik uchun ataylab shunday).

Server ishga tushganda terminalda qaysi kalitlar topilgani ko'rsatiladi.
Tekshirish uchun: `http://localhost:3000/api/health/keys`

## 11. Vercel'ga joylashtirish bo'yicha eslatma

`server/index.js` ikki muhitni ham qo'llab-quvvatlaydi: agar `VERCEL` env
o'zgaruvchisi mavjud bo'lsa (Vercel buni avtomatik qo'yadi), `app.listen()`
chaqirilmaydi -- Express ilovasi shunchaki eksport qilinadi va Vercel uni
serverless funksiya sifatida ishlatadi. MongoDB ulanishi keshlanadi
(`models/connection.js`), shuning uchun har bir so'rovda qayta ulanmaydi.

Barcha maxfiy kalitlarni (`MONGODB_URI`, `JWT_SECRET`, `ADMIN_JWT_SECRET`,
`OPENAI_API_KEY`, `NIA_API_KEY`, `ADMIN_PASSWORD`) Vercel loyihasining
Settings → Environment Variables bo'limiga qo'shing -- `.env` fayli hech
qachon Vercel'ga yuklanmaydi (`.gitignore` orqali repo'ga ham tushmaydi).
