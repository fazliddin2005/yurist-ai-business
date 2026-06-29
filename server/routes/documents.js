// routes/documents.js
const express = require('express');
const { Document } = require('../models');
const { generatePdfBuffer } = require('../templates/pdfBuilder');
const { generateDocxBuffer } = require('../templates/docxBuilder');
const { requireAuth } = require('./auth');
const users = require('./users');
const { routeJurisdiction } = require('../jurisdictionRouter');
const { logActivity, ACTION_TYPES } = require('../activityLog');

const router = express.Router();
const CREDIT_COST = 1;

function safeFileName(name) {
  return (name || 'hujjat')
    .replace(/[^\w\u0400-\u04FF\- ]/g, '')
    .replace(/\s+/g, '_');
}
// HTTP header (Content-Disposition) faqat ASCII belgilarni qabul qiladi --
// kirill harflari (rus tilidagi hujjat nomi) xom holda yuborilsa, Node.js
// "Invalid character in header content" xatosini tashlaydi. RFC 5987
// bo'yicha to'g'ri kodlaymiz: ASCII zaxira nom + UTF-8 percent-encoded filename*.
function contentDispositionHeader(name, ext) {
  const safe = safeFileName(name);
  let asciiFallback = safe.replace(/[^\w\- ]/g, '').replace(/^[\s_-]+|[\s_-]+$/g, '');
  if (!/[a-zA-Z0-9]/.test(asciiFallback)) asciiFallback = 'hujjat'; // butunlay kirill nom bo'lsa, mazmunsiz "-" qolmasin
  return `attachment; filename="${asciiFallback}.${ext}"; filename*=UTF-8''${encodeURIComponent(safe)}.${ext}`;
}

router.use(requireAuth);

// GET /api/documents — joriy foydalanuvchining hujjatlari ro'yxati
router.get('/', async (req, res) => {
  try {
    const list = await Document.find({ userId: req.user.id, scope: 'b2c' }).sort({ createdAt: -1 });
    res.json({ documents: list });
  } catch (e) {
    console.error('[documents/list] xato:', e);
    res.status(500).json({ error: 'Hujjatlarni yuklashda xato yuz berdi' });
  }
});

// GET /api/documents/:id — bitta hujjat (faqat egasi ko'ra oladi)
router.get('/:id', async (req, res) => {
  try {
    const docRow = await Document.findById(req.params.id);
    if (!docRow) return res.status(404).json({ error: 'Hujjat topilmadi' });
    if (String(docRow.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Bu hujjatga ruxsatingiz yo'q" });
    }
    res.json({ document: docRow });
  } catch (e) {
    console.error('[documents/get] xato:', e);
    res.status(500).json({ error: 'Hujjatni yuklashda xato yuz berdi' });
  }
});

// POST /api/documents — yangi hujjat yaratish (kredit yechib)
router.post('/', async (req, res) => {
  try {
    const { templateKey, name, data, jurisdiction } = req.body;
    if (!name) return res.status(400).json({ error: 'name talab qilinadi' });

    if (req.user.credits < CREDIT_COST) {
      return res.status(402).json({ error: 'Kredit yetarli emas', code: 'NO_CREDITS' });
    }

    const jurisRoute = routeJurisdiction({
      explicitJurisdiction: jurisdiction || req.user.jurisdiction,
    });

    const newDoc = await Document.create({
      userId: req.user.id,
      scope: 'b2c',
      jurisdictionId: jurisRoute.code,
      templateKey: templateKey || 'custom',
      name,
      data: data || {},
      status: 'Yakunlandi',
    });

    await users.adjustCredits(req.user.id, -CREDIT_COST);
    logActivity({
      type: ACTION_TYPES.DOCUMENT_CREATED,
      userId: req.user.id,
      userLabel: req.user.name,
      meta: { templateKey: newDoc.templateKey, jurisdictionId: jurisRoute.code },
    });

    res.status(201).json({ document: newDoc, creditsLeft: req.user.credits - CREDIT_COST });
  } catch (e) {
    console.error('[documents/create] xato:', e);
    res.status(500).json({ error: 'Hujjat yaratishda xato yuz berdi' });
  }
});

// GET /api/documents/:id/pdf — PDF yuklab olish
router.get('/:id/pdf', async (req, res) => {
  try {
    const docRow = await Document.findById(req.params.id);
    if (!docRow) return res.status(404).json({ error: 'Hujjat topilmadi' });
    if (String(docRow.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Bu hujjatga ruxsatingiz yo'q" });
    }
    const buffer = await generatePdfBuffer(docRow.toObject());
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', contentDispositionHeader(docRow.name, 'pdf'));
    res.send(buffer);
  } catch (e) {
    console.error('[documents/pdf] xato:', e);
    res.status(500).json({ error: 'PDF yaratishda xato yuz berdi' });
  }
});

// GET /api/documents/:id/docx — DOCX yuklab olish
router.get('/:id/docx', async (req, res) => {
  try {
    const docRow = await Document.findById(req.params.id);
    if (!docRow) return res.status(404).json({ error: 'Hujjat topilmadi' });
    if (String(docRow.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Bu hujjatga ruxsatingiz yo'q" });
    }
    const buffer = await generateDocxBuffer(docRow.toObject());
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', contentDispositionHeader(docRow.name, 'docx'));
    res.send(buffer);
  } catch (e) {
    console.error('[documents/docx] xato:', e);
    res.status(500).json({ error: 'DOCX yaratishda xato yuz berdi' });
  }
});

// DELETE /api/documents/:id — hujjatni o'chirish (faqat egasi)
router.delete('/:id', async (req, res) => {
  try {
    const docRow = await Document.findById(req.params.id);
    if (!docRow) return res.status(404).json({ error: 'Hujjat topilmadi' });
    if (String(docRow.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Bu hujjatni o'chirishga ruxsatingiz yo'q" });
    }
    await Document.deleteOne({ _id: req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (e) {
    console.error('[documents/delete] xato:', e);
    res.status(500).json({ error: "Hujjatni o'chirishda xato yuz berdi" });
  }
});

module.exports = router;
