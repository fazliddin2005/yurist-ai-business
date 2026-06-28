// b2b/routes/apiKeys.js
// Workspace egasi/admin shu yerda API kalitlar yaratadi va boshqaradi.
// Bu yo'llar inson (JWT) orqali kiradi -- API kalitning o'zi esa boshqa
// (tashqi) so'rovlar uchun ishlatiladi (qarang: b2b/routes/external.js).
const express = require('express');
const { requireAuth } = require('../../routes/auth');
const ws = require('../workspace');
const apiKeys = require('../apiKeys');
const { logActivity, ACTION_TYPES } = require('../../activityLog');

const router = express.Router();
router.use(requireAuth);
router.use('/:workspaceId', ws.requireWorkspaceAccess('admin'));

// GET /api/b2b/api-keys/:workspaceId -- mavjud kalitlar ro'yxati (xeshsiz, faqat preview)
router.get('/:workspaceId', async (req, res) => {
  try {
    const keys = await apiKeys.listApiKeys(req.workspace.id);
    res.json({ keys });
  } catch (e) {
    console.error('[apiKeys/list] xato:', e);
    res.status(500).json({ error: 'API kalitlar ro\'yxatini yuklashda xato yuz berdi' });
  }
});

// POST /api/b2b/api-keys/:workspaceId -- yangi kalit yaratish
router.post('/:workspaceId', async (req, res) => {
  try {
    const { label } = req.body;
    const created = await apiKeys.createApiKey(req.workspace.id, req.user.id, label);
    logActivity({
      type: ACTION_TYPES.B2B_API_KEY_CREATED,
      userId: req.user.id,
      userLabel: req.user.name,
      meta: { workspaceName: req.workspace.name, label: created.label },
    });
    // rawKey FAQAT shu javobda qaytariladi -- keyin hech qachon qayta ko'rsatilmaydi.
    res.status(201).json({
      key: {
        id: created.id, label: created.label, keyPreview: created.keyPreview,
        createdAt: created.createdAt, rawKey: created.rawKey,
      },
    });
  } catch (e) {
    console.error('[apiKeys/create] xato:', e);
    res.status(500).json({ error: 'API kalit yaratishda xato yuz berdi' });
  }
});

// DELETE /api/b2b/api-keys/:workspaceId/:keyId -- kalitni bekor qilish
router.delete('/:workspaceId/:keyId', async (req, res) => {
  try {
    const updated = await apiKeys.revokeApiKey(req.workspace.id, req.params.keyId);
    if (!updated) return res.status(404).json({ error: 'Kalit topilmadi' });
    res.json({ success: true });
  } catch (e) {
    console.error('[apiKeys/revoke] xato:', e);
    res.status(500).json({ error: 'API kalitni bekor qilishda xato yuz berdi' });
  }
});

module.exports = router;
