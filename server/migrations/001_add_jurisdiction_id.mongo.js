// ============================================================================
// Migratsiya: jurisdiction_id maydonini qo'shish (MongoDB versiyasi)
// ============================================================================
// Agar PostgreSQL o'rniga MongoDB ishlatilsa, shu skript orqali migratsiya
// qilinadi. Ishlatish: mongosh "your_connection_string" 001_add_jurisdiction_id.mongo.js
// ============================================================================

const DEFAULT_JURISDICTION = 'UZ';

const JURISDICTIONS = [
  { code: 'UZ', name: "O'zbekiston", officialSource: 'lex.uz' },
  { code: 'KZ', name: "Qozog'iston", officialSource: 'adilet.zan.kz' },
  { code: 'KG', name: "Qirg'iziston", officialSource: 'cbd.minjust.gov.kg' },
  { code: 'TJ', name: 'Tojikiston', officialSource: 'mmk.tj' },
  { code: 'TM', name: 'Turkmaniston', officialSource: 'minjust.gov.tm' },
  { code: 'RU', name: 'Rossiya', officialSource: 'pravo.gov.ru' },
  { code: 'AZ', name: 'Ozarbayjon', officialSource: 'e-qanun.az' },
  { code: 'US', name: 'AQSh', officialSource: 'congress.gov' },
];

(async function migrate() {
  const dbName = 'yurist_ai'; // kerak bo'lsa o'zgartiring

  // ---- 1. Yurisdiksiyalar lug'at to'plamini (collection) to'ldirish ----
  for (const j of JURISDICTIONS) {
    db.jurisdictions.updateOne(
      { code: j.code },
      { $setOnInsert: { ...j, createdAt: new Date() } },
      { upsert: true }
    );
  }
  print('[migration] jurisdictions to\'plami tayyor: ' + db.jurisdictions.countDocuments() + ' yozuv');

  // ---- 2. documents to'plamiga jurisdictionId qo'shish (mavjud yozuvlar uchun) ----
  const docsResult = db.documents.updateMany(
    { jurisdictionId: { $exists: false } },
    { $set: { jurisdictionId: DEFAULT_JURISDICTION } }
  );
  print('[migration] documents yangilandi: ' + docsResult.modifiedCount);
  db.documents.createIndex({ jurisdictionId: 1 });

  // ---- 3. b2b_documents to'plamiga jurisdictionId qo'shish ----
  const b2bDocsResult = db.b2b_documents.updateMany(
    { jurisdictionId: { $exists: false } },
    { $set: { jurisdictionId: DEFAULT_JURISDICTION } }
  );
  print('[migration] b2b_documents yangilandi: ' + b2bDocsResult.modifiedCount);
  db.b2b_documents.createIndex({ jurisdictionId: 1 });

  // ---- 4. b2b_audits to'plamiga jurisdictionId va jurisdictionSource qo'shish ----
  const auditsResult = db.b2b_audits.updateMany(
    { jurisdictionId: { $exists: false } },
    { $set: { jurisdictionId: DEFAULT_JURISDICTION, jurisdictionSource: 'default' } }
  );
  print('[migration] b2b_audits yangilandi: ' + auditsResult.modifiedCount);
  db.b2b_audits.createIndex({ jurisdictionId: 1 });

  // ---- 5. conversations to'plamiga jurisdictionId qo'shish ----
  const convResult = db.conversations.updateMany(
    { jurisdictionId: { $exists: false } },
    { $set: { jurisdictionId: DEFAULT_JURISDICTION } }
  );
  print('[migration] conversations yangilandi: ' + convResult.modifiedCount);
  db.conversations.createIndex({ jurisdictionId: 1 });

  // ---- 6. b2b_workspaces to'plamiga primaryJurisdictionId qo'shish ----
  const wsResult = db.b2b_workspaces.updateMany(
    { primaryJurisdictionId: { $exists: false } },
    { $set: { primaryJurisdictionId: DEFAULT_JURISDICTION } }
  );
  print('[migration] b2b_workspaces yangilandi: ' + wsResult.modifiedCount);

  print('[migration] Migratsiya muvaffaqiyatli yakunlandi.');
})();

// ============================================================================
// ORTGA QAYTARISH (rollback):
//
// db.documents.updateMany({}, { $unset: { jurisdictionId: "" } });
// db.b2b_documents.updateMany({}, { $unset: { jurisdictionId: "" } });
// db.b2b_audits.updateMany({}, { $unset: { jurisdictionId: "", jurisdictionSource: "" } });
// db.conversations.updateMany({}, { $unset: { jurisdictionId: "" } });
// db.b2b_workspaces.updateMany({}, { $unset: { primaryJurisdictionId: "" } });
// db.jurisdictions.drop();
// ============================================================================
