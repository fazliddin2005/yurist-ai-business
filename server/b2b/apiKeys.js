// b2b/apiKeys.js
// Tashqi tizimlar (1C, Bitrix24, CRM va h.k.) Yurist AI B2B API'siga ulanishi
// uchun uzoq muddatli kalitlar. JWT'dan farqi: JWT inson login qilganda
// qisqa muddatga (30 kun) beriladi, API kalit esa workspace egasi tomonidan
// generatsiya qilinadi va dastur-dasturga aloqa uchun amal qilish muddatisiz
// ishlaydi (faqat qo'lda bekor qilinmaguncha).
const crypto = require('crypto');
const APIKey = require('../models/APIKey');
const ws = require('./workspace');

const KEY_PREFIX = 'yk_live_';

function generateRawKey() {
  return KEY_PREFIX + crypto.randomBytes(24).toString('hex');
}

function hashKey(rawKey) {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

async function createApiKey(workspaceId, createdBy, label) {
  const rawKey = generateRawKey();
  const row = await APIKey.create({
    organizationId: workspaceId,
    label: label || 'API kalit',
    keyHash: hashKey(rawKey),
    keyPreview: rawKey.slice(0, 12) + '...' + rawKey.slice(-4),
    createdBy,
    lastUsedAt: null,
    revoked: false,
  });
  // rawKey FAQAT bir marta, yaratilgan paytda qaytariladi -- keyin hech qachon ko'rsatilmaydi
  const json = row.toJSON();
  json.rawKey = rawKey;
  return json;
}

async function listApiKeys(workspaceId) {
  return APIKey.find({ organizationId: workspaceId, revoked: false });
}

async function revokeApiKey(workspaceId, keyId) {
  return APIKey.findOneAndUpdate(
    { _id: keyId, organizationId: workspaceId },
    { revoked: true },
    { new: true }
  );
}

async function findByRawKey(rawKey) {
  const hash = hashKey(rawKey);
  return APIKey.findOne({ keyHash: hash, revoked: false });
}

async function touchLastUsed(keyId) {
  await APIKey.updateOne({ _id: keyId }, { lastUsedAt: new Date() });
}

// ---- Express middleware: API kalit orqali autentifikatsiya ----
// Tashqi tizimlar so'rovga "Authorization: Bearer yk_live_..." header qo'shadi.
// Bu middleware shu kalitni tekshirib, req.workspace ni to'ldiradi (req.user YO'Q,
// chunki bu inson emas, dastur-dasturga aloqa).
async function requireApiKey(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const rawKey = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!rawKey || !rawKey.startsWith(KEY_PREFIX)) {
      return res.status(401).json({ error: 'API kalit talab qilinadi (Authorization: Bearer yk_live_...)' });
    }
    const keyRow = await findByRawKey(rawKey);
    if (!keyRow) return res.status(401).json({ error: 'API kalit yaroqsiz yoki bekor qilingan' });

    const workspace = await ws.getWorkspace(keyRow.organizationId);
    if (!workspace) return res.status(404).json({ error: 'Workspace topilmadi' });

    await touchLastUsed(keyRow.id);
    req.workspace = workspace;
    req.apiKeyRow = keyRow;
    next();
  } catch (e) {
    console.error('[apiKeys/requireApiKey] xato:', e);
    res.status(500).json({ error: 'API kalitni tekshirishda kutilmagan xato yuz berdi' });
  }
}

module.exports = { createApiKey, listApiKeys, revokeApiKey, requireApiKey };
