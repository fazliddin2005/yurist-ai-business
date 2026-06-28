// routes/cases.js
// AI ASSOCIATE -- "Ish" (Case) boshqaruvi. Bu oddiy chat-tarixidan farqli:
// bitta huquqiy masala bo'yicha OYLAR DAVOMIDA davom etadigan kontekst.
// Foydalanuvchi ish yaratadi (masalan "Ijara nizosi -- ABC MChJ"), va shu
// ish doirasida bir necha kun/hafta/oy davomida savol-javob qilsa, AI har
// safar avvalgi kontekstni (xulosa orqali) eslab qoladi.
const express = require('express');
const { Case, Chat } = require('../models');
const { requireAuth } = require('./auth');
const { updateCaseSummary } = require('../caseSummarizer');

const router = express.Router();
router.use(requireAuth);

// GET /api/cases -- joriy foydalanuvchining barcha (faol) ishlari
router.get('/', async (req, res) => {
  try {
    const status = req.query.status || 'active';
    const list = await Case.find({ userId: req.user.id, scope: 'b2c', status })
      .select('title status jurisdictionId lastActivityAt createdAt')
      .sort({ lastActivityAt: -1 });
    res.json({ cases: list });
  } catch (e) {
    console.error('[cases/list] xato:', e);
    res.status(500).json({ error: 'Ishlar ro\'yxatini yuklashda xato yuz berdi' });
  }
});

// GET /api/cases/:id -- bitta ishning to'liq tafsiloti (xulosa + voqealar tarixi)
router.get('/:id', async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) return res.status(404).json({ error: 'Ish topilmadi' });
    if (String(caseDoc.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Bu ishga ruxsatingiz yo'q" });
    }
    res.json({ case: caseDoc });
  } catch (e) {
    console.error('[cases/get] xato:', e);
    res.status(500).json({ error: 'Ishni yuklashda xato yuz berdi' });
  }
});

// POST /api/cases -- yangi ish yaratish
// Body: { title, jurisdictionId }
router.post('/', async (req, res) => {
  try {
    const { title, jurisdictionId } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Ish nomi talab qilinadi' });

    const caseDoc = await Case.create({
      userId: req.user.id,
      scope: 'b2c',
      title: title.trim(),
      jurisdictionId: jurisdictionId || req.user.jurisdiction || 'UZ',
      summary: '',
      timeline: [],
      chatIds: [],
    });
    res.status(201).json({ case: caseDoc });
  } catch (e) {
    console.error('[cases/create] xato:', e);
    res.status(500).json({ error: 'Ish yaratishda xato yuz berdi' });
  }
});

// POST /api/cases/:id/events -- ishga yangi hodisa qo'shish va xulosani yangilash.
// Bu endpoint chat.js, documents.js kabi boshqa modullar tomonidan ICHKI
// chaqiriladi (alohida HTTP so'rovi sifatida emas) -- shuning uchun bu yerda
// faqat to'g'ridan-to'g'ri test/qo'lda chaqirish uchun ochiq qoldiramiz.
router.post('/:id/events', async (req, res) => {
  try {
    const { type, summary, refId } = req.body;
    if (!type || !summary) return res.status(400).json({ error: 'type va summary talab qilinadi' });

    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) return res.status(404).json({ error: 'Ish topilmadi' });
    if (String(caseDoc.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Bu ishga ruxsatingiz yo'q" });
    }

    const updated = await addCaseEvent(caseDoc, { type, summary, refId });
    res.json({ case: updated });
  } catch (e) {
    console.error('[cases/add-event] xato:', e);
    res.status(500).json({ error: 'Hodisa qo\'shishda xato yuz berdi' });
  }
});

// PATCH /api/cases/:id/close -- ishni yopish (arxivlash)
router.patch('/:id/close', async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) return res.status(404).json({ error: 'Ish topilmadi' });
    if (String(caseDoc.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Bu ishga ruxsatingiz yo'q" });
    }
    caseDoc.status = 'closed';
    await caseDoc.save();
    res.json({ case: caseDoc });
  } catch (e) {
    console.error('[cases/close] xato:', e);
    res.status(500).json({ error: 'Ishni yopishda xato yuz berdi' });
  }
});

// DELETE /api/cases/:id
router.delete('/:id', async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) return res.status(404).json({ error: 'Ish topilmadi' });
    if (String(caseDoc.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Bu ishni o'chirishga ruxsatingiz yo'q" });
    }
    await Case.deleteOne({ _id: req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (e) {
    console.error('[cases/delete] xato:', e);
    res.status(500).json({ error: "Ishni o'chirishda xato yuz berdi" });
  }
});

/**
 * Ichki yordamchi funksiya (boshqa route'lar uchun) -- ishga yangi hodisa
 * qo'shadi va AI orqali xulosani yangilaydi. MUHIM: bu funksiya xato bersa
 * ham (masalan AI ulanmagan), chaqiruvchi route'ning asosiy oqimini
 * TO'XTATMASLIGI kerak -- shuning uchun chaqiruvchi tomon buni har doim
 * try-catch ichida, "fire and forget" tarzida chaqirishi tavsiya etiladi.
 */
async function addCaseEvent(caseDoc, { type, summary, refId }) {
  const newSummary = await updateCaseSummary({
    oldSummary: caseDoc.summary,
    newEventText: summary,
    caseTitle: caseDoc.title,
  });
  caseDoc.summary = newSummary;
  caseDoc.timeline.push({ type, summary, refId: refId || null, at: new Date() });
  caseDoc.lastActivityAt = new Date();
  await caseDoc.save();
  return caseDoc;
}

module.exports = router;
module.exports.addCaseEvent = addCaseEvent;
