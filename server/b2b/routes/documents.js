// b2b/routes/documents.js
// Workspace hujjatlar arxivi -- CLM shablonlaridan to'ldirilgan hujjatlar
// shu yerda saqlanadi. B2C hujjatlaridan farqi: workspace darajasida
// izolyatsiya qilingan va istalgan vakolatli xodim ko'ra oladi (shaxsiy
// emas, jamoa arxivi).
const express = require('express');
const { Document } = require('../../models');
const { requireAuth } = require('../../routes/auth');
const { generatePdfBuffer } = require('../../templates/pdfBuilder');
const { generateDocxBuffer } = require('../../templates/docxBuilder');
const { routeJurisdiction } = require('../../jurisdictionRouter');
const ws = require('../workspace');

const router = express.Router();

function safeFileName(name) {
  return (name || 'hujjat').replace(/[^\w\u0400-\u04FF\- ]/g, '').replace(/\s+/g, '_');
}
// HTTP header (Content-Disposition) faqat ASCII belgilarni qabul qiladi --
// kirill harflari (rus tilidagi hujjat nomi) xom holda yuborilsa, Node.js
// "Invalid character in header content" xatosini tashlaydi -- shuning uchun
// kirill nomli hujjatlarni PDF/DOCX qilib yuklab bo'lmay qolardi ("PDF
// yaratishda xato yuz berdi" -- aslida xato PDF yasashda emas, shu yerda
// edi). RFC 5987 bo'yicha to'g'ri kodlaymiz: ASCII zaxira nom (eski
// brauzerlar uchun) + UTF-8 percent-encoded filename* (haqiqiy nom uchun).
function contentDispositionHeader(name, ext) {
  const safe = safeFileName(name);
  let asciiFallback = safe.replace(/[^\w\- ]/g, '').replace(/^[\s_-]+|[\s_-]+$/g, '');
  if (!/[a-zA-Z0-9]/.test(asciiFallback)) asciiFallback = 'hujjat'; // butunlay kirill nom bo'lsa, mazmunsiz "-" qolmasin
  return `attachment; filename="${asciiFallback}.${ext}"; filename*=UTF-8''${encodeURIComponent(safe)}.${ext}`;
}

router.use(requireAuth);
router.use('/:workspaceId', ws.requireWorkspaceAccess());

// GET /api/b2b/documents/:workspaceId -- workspace hujjatlar arxivi
router.get('/:workspaceId', async (req, res) => {
  try {
    const all = await Document.find({ organizationId: req.workspace.id, scope: 'b2b' }).sort({ createdAt: -1 });
    res.json({ documents: all });
  } catch (e) {
    console.error('[b2b documents/list] xato:', e);
    res.status(500).json({ error: 'Hujjatlarni yuklashda xato yuz berdi' });
  }
});

// POST /api/b2b/documents/:workspaceId -- CLM shablonidan to'ldirilgan hujjatni saqlash
router.post('/:workspaceId', ws.requireWorkspaceAccess('member'), async (req, res) => {
  try {
    const { name, templateId, filledBody, jurisdiction } = req.body;
    if (!name || !filledBody) return res.status(400).json({ error: 'name va filledBody talab qilinadi' });

    // KREDIT: B2C "Hujjat yaratish" bilan bir xil narx (1 kredit), umumiy
    // shaxsiy balansdan (req.user.credits) yechiladi.
    if (req.user.credits < 1) {
      return res.status(402).json({ error: 'Kredit yetarli emas', code: 'NO_CREDITS' });
    }

    const jurisRoute = routeJurisdiction({
      explicitJurisdiction: jurisdiction || req.workspace.primaryJurisdictionId,
      queryText: filledBody,
    });

    const doc = await Document.create({
      organizationId: req.workspace.id,
      scope: 'b2b',
      jurisdictionId: jurisRoute.code,
      templateId: templateId || null,
      name,
      filledBody,
      createdBy: req.user.id,
      status: 'Yakunlandi',
    });

    req.user.credits = Math.max(0, req.user.credits - 1);
    await req.user.save();

    res.status(201).json({ document: doc, creditsLeft: req.user.credits });
  } catch (e) {
    console.error('[b2b documents/create] xato:', e);
    res.status(500).json({ error: 'Hujjat yaratishda xato yuz berdi' });
  }
});

// GET /api/b2b/documents/:workspaceId/:docId/pdf
router.get('/:workspaceId/:docId/pdf', async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.docId, organizationId: req.workspace.id });
    if (!doc) return res.status(404).json({ error: 'Hujjat topilmadi' });
    // B2B hujjatlari erkin matn (filledBody) -- oddiy paragraf shaklida PDFga joylaymiz.
    const buffer = await generatePdfBuffer({ name: doc.name, templateKey: 'b2b_freeform', data: { obj: doc.filledBody } });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', contentDispositionHeader(doc.name, 'pdf'));
    res.send(buffer);
  } catch (e) {
    console.error('[b2b documents/pdf] xato:', e);
    res.status(500).json({ error: 'PDF yaratishda xato yuz berdi' });
  }
});

// GET /api/b2b/documents/:workspaceId/:docId/docx
router.get('/:workspaceId/:docId/docx', async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.docId, organizationId: req.workspace.id });
    if (!doc) return res.status(404).json({ error: 'Hujjat topilmadi' });
    const buffer = await generateDocxBuffer({ name: doc.name, templateKey: 'b2b_freeform', data: { obj: doc.filledBody } });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', contentDispositionHeader(doc.name, 'docx'));
    res.send(buffer);
  } catch (e) {
    console.error('[b2b documents/docx] xato:', e);
    res.status(500).json({ error: 'DOCX yaratishda xato yuz berdi' });
  }
});

// DELETE /api/b2b/documents/:workspaceId/:docId -- hujjatni arxivdan o'chirish
// FAQAT admin/egasi o'chira oladi -- bu jamoaviy arxiv, oddiy xodim (member)
// yoki ko'ruvchi (viewer) boshqalar yaratgan hujjatni o'chira olmasligi kerak.
router.delete('/:workspaceId/:docId', ws.requireWorkspaceAccess('admin'), async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.docId, organizationId: req.workspace.id });
    if (!doc) return res.status(404).json({ error: 'Hujjat topilmadi' });
    res.json({ ok: true });
  } catch (e) {
    console.error('[b2b documents/delete] xato:', e);
    res.status(500).json({ error: "Hujjatni o'chirishda xato yuz berdi" });
  }
});

module.exports = router;
