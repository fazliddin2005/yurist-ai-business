// b2b/routes/audit.js
// AI-Powered Risk Audit -- B2B mijozlar uchun kuchaytirilgan xavf tahlili.
// Farqi B2C "Xavf tahlili"dan:
//   1) Natija workspace ichida SAQLANADI (B2C'da vaqtinchalik, faqat ko'rsatiladi)
//   2) JURISDICTION ROUTER orqali qaysi davlat qonunchiligi kerakligi aniqlanadi
//   3) Nia orqali topilgan real qonun moddalariga "Manba: [Davlat], [Kodeks],
//      [Modda]" formatidagi aniq iqtibos qo'shiladi (citationBuilder.js)
//   4) Har bir audit qaysi yurisdiksiya (davlat) uchun amal qilgani saqlanadi
//      (jurisdictionId maydoni)
//   5) Natija rasmiy "Risk Report" (audit hisoboti) shaklida qaytariladi --
//      Dashboard buni statistikaga jamlay oladi.
const express = require('express');
const multer = require('multer');
const { Audit } = require('../../models');
const { requireAuth } = require('../../routes/auth');
const { analyzeText } = require('../../riskEngine');
const { searchForJurisdiction, isConfigured: niaConfigured, searchCaseLaw, isCaseLawAvailable } = require('../../nia');
const { routeJurisdiction } = require('../../jurisdictionRouter');
const { buildCitations } = require('../../citationBuilder');
const ws = require('../workspace');
const { logActivity, ACTION_TYPES } = require('../../activityLog');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(requireAuth);
router.use('/:workspaceId', ws.requireWorkspaceAccess());

// GET /api/b2b/audit/:workspaceId -- workspace bo'yicha barcha audit hisobotlari
router.get('/:workspaceId', async (req, res) => {
  try {
    const all = await Audit.find({ organizationId: req.workspace.id }).sort({ createdAt: -1 });
    res.json({ audits: all });
  } catch (e) {
    console.error('[audit/list] xato:', e);
    res.status(500).json({ error: 'Audit hisobotlarini yuklashda xato yuz berdi' });
  }
});

// GET /api/b2b/audit/:workspaceId/:auditId -- bitta to'liq Risk Report
router.get('/:workspaceId/:auditId', async (req, res) => {
  try {
    const audit = await Audit.findOne({ _id: req.params.auditId, organizationId: req.workspace.id });
    if (!audit) return res.status(404).json({ error: 'Audit hisoboti topilmadi' });
    res.json({ audit });
  } catch (e) {
    console.error('[audit/get] xato:', e);
    res.status(500).json({ error: 'Audit hisobotini yuklashda xato yuz berdi' });
  }
});

// POST /api/b2b/audit/:workspaceId/analyze -- yangi shartnomani audit qilish
router.post('/:workspaceId/analyze', ws.requireWorkspaceAccess('member'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Fayl yuklanmadi' });
    // KREDIT: B2C "Xavf tahlili" bilan bir xil narx (1 kredit), B2C bilan
    // umumiy shaxsiy balansdan (req.user.credits) yechiladi.
    if (req.user.credits < 1) {
      return res.status(402).json({ error: 'Kredit yetarli emas', code: 'NO_CREDITS' });
    }

    let text = '';
    const mime = req.file.mimetype || '';
    const fname = req.file.originalname || '';
    try {
      text = (mime.includes('text') || fname.toLowerCase().endsWith('.txt'))
        ? req.file.buffer.toString('utf-8')
        : req.file.buffer.toString('utf-8').replace(/[^\x20-\x7E\u0400-\u04FF.,№\-]/g, ' ');
    } catch (e) {
      text = '';
    }

    const result = analyzeText(text);

    const jurisRoute = routeJurisdiction({ explicitJurisdiction: req.body.jurisdiction, queryText: text });

    let legalRefs = [];
    if (niaConfigured() && result.findings.length) {
      const topIssues = result.findings.filter((f) => f.sev === 'high').slice(0, 3);
      for (const issue of topIssues) {
        try {
          const niaResult = await searchForJurisdiction(issue.title, jurisRoute.code);
          if (niaResult && niaResult.chunks.length) {
            const citations = buildCitations([niaResult.chunks[0]], jurisRoute.code);
            if (citations.length) {
              legalRefs.push({ issue: issue.title, ...citations[0] });
            }
          }
        } catch (e) {
          console.error('[audit] Nia/citation xatosi:', e.message);
        }
      }
    }

    // SUD AMALIYOTI: eng jiddiy (birinchi "high" darajali) muammo uchun,
    // agar shu yurisdiksiyada sud amaliyoti manbasi mavjud bo'lsa, qonun
    // moddasidan TASHQARI sudlar bu masalada qanday qaror chiqarishini ham
    // qidiramiz. Faqat 1 ta muammo uchun -- har bir audit uchun Nia
    // chaqiruvlarini cheklash maqsadida (xarajat va tezlik nazorati).
    let caseLawRef = null;
    if (niaConfigured() && isCaseLawAvailable(jurisRoute.code) && result.findings.length) {
      const mostSevere = result.findings.find((f) => f.sev === 'high');
      if (mostSevere) {
        try {
          const caseLawResult = await searchCaseLaw(mostSevere.title, jurisRoute.code);
          if (caseLawResult && caseLawResult.chunks.length) {
            caseLawRef = {
              issue: mostSevere.title,
              excerpt: caseLawResult.chunks[0].text.slice(0, 400),
              source: caseLawResult.chunks[0].source,
            };
          }
        } catch (e) {
          console.error('[audit] Sud amaliyoti qidirishda xato:', e.message);
        }
      }
    }

    const audit = await Audit.create({
      organizationId: req.workspace.id,
      jurisdictionId: jurisRoute.code,
      jurisdictionSource: jurisRoute.source,
      fileName: fname,
      score: result.score,
      tier: result.tier,
      readable: result.readable,
      findings: result.findings,
      legalRefs,
      caseLawRef,
      analyzedBy: req.user.id,
    });
    logActivity({
      type: ACTION_TYPES.B2B_AUDIT_RUN,
      userId: req.user.id,
      userLabel: req.user.name,
      meta: { workspaceName: req.workspace.name, score: result.score, tier: result.tier },
    });

    req.user.credits = Math.max(0, req.user.credits - 1);
    await req.user.save();

    res.status(201).json({ audit, creditsLeft: req.user.credits });
  } catch (e) {
    console.error('[audit/analyze] xato:', e);
    res.status(500).json({ error: 'Hujjatni tahlil qilishda kutilmagan xato yuz berdi' });
  }
});

module.exports = router;
