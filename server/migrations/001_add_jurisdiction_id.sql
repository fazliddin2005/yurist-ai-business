-- ============================================================================
-- Migratsiya: jurisdiction_id maydonini qo'shish
-- ============================================================================
-- Maqsad: har bir hujjat, maslahat (chat xabari) va audit hisoboti qaysi
-- yurisdiksiya (davlat) qonunchiligi asosida tuzilgan/tahlil qilingani
-- doimiy saqlansin.
--
-- ESLATMA: hozirgi MVP versiya JSON fayl-asosli "ma'lumotlar bazasi"
-- (server/db.js) ishlatadi -- bu fayl loyihani PostgreSQL'ga ko'chirilganda
-- ishlatiladi. JSON tizim uchun migratsiya skripti alohida:
-- server/migrations/001_add_jurisdiction_id.js
--
-- Ishlatish: psql -U your_user -d yurist_ai -f 001_add_jurisdiction_id.sql
-- ============================================================================

BEGIN;

-- ---- 1. Yurisdiksiyalar lug'at jadvali (agar hali yo'q bo'lsa) ----
-- Bu jadval LEGAL_DB (server/legalData.js) bilan bir xil ma'lumotni saqlaydi,
-- lekin SQL darajasida -- shunda jurisdiction_id ustida FOREIGN KEY cheklovi
-- qo'yish mumkin bo'ladi (noto'g'ri davlat kodi yozib qo'yilmasligi uchun).
CREATE TABLE IF NOT EXISTS jurisdictions (
    code            VARCHAR(2) PRIMARY KEY,      -- 'UZ', 'KZ', 'KG', 'TJ', 'TM', 'RU', 'AZ', 'US'
    name            VARCHAR(100) NOT NULL,        -- "O'zbekiston", "Tojikiston" va h.k.
    official_source VARCHAR(255),                 -- "lex.uz", "mmk.tj" va h.k.
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO jurisdictions (code, name, official_source) VALUES
    ('UZ', 'O''zbekiston', 'lex.uz'),
    ('KZ', 'Qozog''iston', 'adilet.zan.kz'),
    ('KG', 'Qirg''iziston', 'cbd.minjust.gov.kg'),
    ('TJ', 'Tojikiston',   'mmk.tj'),
    ('TM', 'Turkmaniston', 'minjust.gov.tm'),
    ('RU', 'Rossiya',      'pravo.gov.ru'),
    ('AZ', 'Ozarbayjon',   'e-qanun.az'),
    ('US', 'AQSh',         'congress.gov')
ON CONFLICT (code) DO NOTHING;

-- ---- 2. documents jadvaliga jurisdiction_id qo'shish ----
ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS jurisdiction_id VARCHAR(2) NOT NULL DEFAULT 'UZ'
    REFERENCES jurisdictions(code);

CREATE INDEX IF NOT EXISTS idx_documents_jurisdiction
    ON documents (jurisdiction_id);

-- ---- 3. b2b_documents jadvaliga jurisdiction_id qo'shish ----
ALTER TABLE b2b_documents
    ADD COLUMN IF NOT EXISTS jurisdiction_id VARCHAR(2) NOT NULL DEFAULT 'UZ'
    REFERENCES jurisdictions(code);

CREATE INDEX IF NOT EXISTS idx_b2b_documents_jurisdiction
    ON b2b_documents (jurisdiction_id);

-- ---- 4. b2b_audits jadvaliga jurisdiction_id qo'shish ----
-- (audit qaysi davlat qonunchiligi asosida tahlil qilingani)
ALTER TABLE b2b_audits
    ADD COLUMN IF NOT EXISTS jurisdiction_id VARCHAR(2) NOT NULL DEFAULT 'UZ'
    REFERENCES jurisdictions(code);

ALTER TABLE b2b_audits
    ADD COLUMN IF NOT EXISTS jurisdiction_source VARCHAR(20) DEFAULT 'default';
    -- 'explicit' | 'detected' | 'default' -- qanday aniqlangani

CREATE INDEX IF NOT EXISTS idx_b2b_audits_jurisdiction
    ON b2b_audits (jurisdiction_id);

-- ---- 5. conversations (chat/maslahat) jadvaliga jurisdiction_id qo'shish ----
ALTER TABLE conversations
    ADD COLUMN IF NOT EXISTS jurisdiction_id VARCHAR(2) NOT NULL DEFAULT 'UZ'
    REFERENCES jurisdictions(code);

CREATE INDEX IF NOT EXISTS idx_conversations_jurisdiction
    ON conversations (jurisdiction_id);

-- ---- 6. b2b_workspaces jadvaliga "asosiy yurisdiksiya" qo'shish ----
-- (tashkilot odatda qaysi davlatda ishlaydi -- Dashboard'da standart tanlov uchun)
ALTER TABLE b2b_workspaces
    ADD COLUMN IF NOT EXISTS primary_jurisdiction_id VARCHAR(2) NOT NULL DEFAULT 'UZ'
    REFERENCES jurisdictions(code);

COMMIT;

-- ============================================================================
-- ORTGA QAYTARISH (rollback) -- agar migratsiyani bekor qilish kerak bo'lsa:
--
-- BEGIN;
-- ALTER TABLE b2b_workspaces DROP COLUMN IF EXISTS primary_jurisdiction_id;
-- ALTER TABLE conversations DROP COLUMN IF EXISTS jurisdiction_id;
-- ALTER TABLE b2b_audits DROP COLUMN IF EXISTS jurisdiction_source;
-- ALTER TABLE b2b_audits DROP COLUMN IF EXISTS jurisdiction_id;
-- ALTER TABLE b2b_documents DROP COLUMN IF EXISTS jurisdiction_id;
-- ALTER TABLE documents DROP COLUMN IF EXISTS jurisdiction_id;
-- DROP TABLE IF EXISTS jurisdictions;
-- COMMIT;
-- ============================================================================
