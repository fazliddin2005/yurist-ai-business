// b2b/routes/external.js
// TASHQI TIZIMLAR UCHUN PUBLIC API -- 1C, Bitrix24, boshqa CRM/ERP shu yerga
// ulanadi. Autentifikatsiya JWT orqali EMAS, balki API kalit orqali
// (Authorization: Bearer yk_live_...) amalga oshiriladi -- chunki bu inson
// emas, dastur-dasturga aloqa.
//
// MISOL FOYDALANISH (tashqi tizim tomonidan):
//   curl -H "Authorization: Bearer yk_live_xxxxx" \
//        https://yourdomain.uz/api/b2b/external/templates
//
//   curl -H "Authorization: Bearer yk_live_xxxxx" \
//        -F "file=@shartnoma.pdf" -F "jurisdiction=TJ" \
//        https://yourdomain.uz/api/b2b/external/audits/analyze
//
// Bu yo'llar workspace egasi B2B paneldan API kalit yaratgandan keyin ishlay
// boshlaydi (qarang: server/b2b/routes/apiKeys.js).
const express = require('express');
const multer = require('multer');
const { Template, TemplateVersion, Document, Audit } = require('../../models');
const { requireApiKey } = require('../apiKeys');
const { analyzeText } = require('../../riskEngine');
const { extractText } = require('../../textExtraction');
const { searchForJurisdiction, isConfigured: niaConfigured } = require('../../nia');
const { routeJurisdiction } = require('../../jurisdictionRouter');
const { buildCitations } = require('../../citationBuilder');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(requireApiKey); // har bir so'rov API kalitni tekshiradi, req.workspace to'ldiriladi

// GET /api/b2b/external/templates -- workspace shablonlari (faqat o'qish)
router.get('/templates', async (req, res) => {
  try {
    const all = await Template.find({ organizationId: req.workspace.id, status: 'active' });
    res.json({ templates: all });
  } catch (e) {
    console.error('[external/templates] xato:', e);
    res.status(500).json({ error: 'Shablonlarni yuklashda xato yuz berdi' });
  }
});

// GET /api/b2b/external/templates/:id -- bitta shablon + joriy matni
router.get('/templates/:id', async (req, res) => {
  try {
    const tpl = await Template.findOne({ _id: req.params.id, organizationId: req.workspace.id });
    if (!tpl) return res.status(404).json({ error: 'Shablon topilmadi' });
    const version = await TemplateVersion.findOne({ templateId: tpl.id, versionNumber: tpl.currentVersion });
    res.json({ template: tpl, body: version?.body || '' });
  } catch (e) {
    console.error('[external/template-get] xato:', e);
    res.status(500).json({ error: 'Shablonni yuklashda xato yuz berdi' });
  }
});

// POST /api/b2b/external/templates/:id/fill -- shablonni qiymatlar bilan to'ldirish
router.post('/templates/:id/fill', async (req, res) => {
  try {
    const { values } = req.body;
    const tpl = await Template.findOne({ _id: req.params.id, organizationId: req.workspace.id });
    if (!tpl) return res.status(404).json({ error: 'Shablon topilmadi' });
    const version = await TemplateVersion.findOne({ templateId: tpl.id, versionNumber: tpl.currentVersion });
    if (!version) return res.status(404).json({ error: 'Shablon versiyasi topilmadi' });

    let filled = version.body;
    Object.entries(values || {}).forEach(([key, val]) => {
      filled = filled.replaceAll(`{{${key}}}`, String(val ?? ''));
    });
    const missing = [...filled.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1]);
    res.json({ filledBody: filled, missingFields: [...new Set(missing)] });
  } catch (e) {
    console.error('[external/template-fill] xato:', e);
    res.status(500).json({ error: 'Shablonni to\'ldirishda xato yuz berdi' });
  }
});

// GET /api/b2b/external/documents -- workspace hujjatlar arxivi (faqat o'qish)
router.get('/documents', async (req, res) => {
  try {
    const all = await Document.find({ organizationId: req.workspace.id, scope: 'b2b' });
    res.json({ documents: all });
  } catch (e) {
    console.error('[external/documents] xato:', e);
    res.status(500).json({ error: 'Hujjatlarni yuklashda xato yuz berdi' });
  }
});

// POST /api/b2b/external/documents -- tashqi tizimdan yangi hujjat yaratish
router.post('/documents', async (req, res) => {
  try {
    const { name, templateId, filledBody } = req.body;
    if (!name || !filledBody) return res.status(400).json({ error: 'name va filledBody talab qilinadi' });
    const doc = await Document.create({
      organizationId: req.workspace.id, scope: 'b2b', templateId: templateId || null,
      name, filledBody, createdBy: null, status: 'Yakunlandi',
    });
    res.status(201).json({ document: doc });
  } catch (e) {
    console.error('[external/document-create] xato:', e);
    res.status(500).json({ error: 'Hujjat yaratishda xato yuz berdi' });
  }
});

// GET /api/b2b/external/audits -- workspace audit hisobotlari (faqat o'qish)
router.get('/audits', async (req, res) => {
  try {
    const all = await Audit.find({ organizationId: req.workspace.id });
    res.json({ audits: all });
  } catch (e) {
    console.error('[external/audits] xato:', e);
    res.status(500).json({ error: 'Auditlarni yuklashda xato yuz berdi' });
  }
});

// GET /api/b2b/external/audits/:id -- bitta audit hisoboti tafsiloti
router.get('/audits/:id', async (req, res) => {
  try {
    const audit = await Audit.findOne({ _id: req.params.id, organizationId: req.workspace.id });
    if (!audit) return res.status(404).json({ error: 'Audit hisoboti topilmadi' });
    res.json({ audit });
  } catch (e) {
    console.error('[external/audit-get] xato:', e);
    res.status(500).json({ error: 'Audit hisobotini yuklashda xato yuz berdi' });
  }
});

// POST /api/b2b/external/audits/analyze -- TASHQI TIZIM ORQALI AI RISK AUDIT
// ishga tushirish. multipart/form-data: file (majburiy), jurisdiction (ixtiyoriy)
router.post('/audits/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Fayl yuklanmadi -- multipart/form-data formatida "file" maydoni talab qilinadi' });
    }

    const fname = req.file.originalname || 'hujjat';
    let text, extraction;
    try {
      extraction = await extractText(req.file.buffer, req.file.mimetype, fname);
      text = extraction.text;
    } catch (e) {
      return res.status(422).json({ error: "Fayl matnini o'qishda xato yuz berdi -- fayl shikastlangan bo'lishi mumkin" });
    }

    if (!text.trim()) {
      return res.status(422).json({ error: extraction.warning || "Fayldan matn chiqarib bo'lmadi -- fayl bo'sh yoki qo'llab-quvvatlanmaydigan formatda" });
    }

    let result;
    try {
      result = analyzeText(text);
    } catch (e) {
      console.error('[external audit] riskEngine xatosi:', e.message);
      return res.status(500).json({ error: 'Hujjatni tahlil qilishda ichki xato yuz berdi' });
    }

    const jurisRoute = routeJurisdiction({
      explicitJurisdiction: req.body.jurisdiction || req.workspace.primaryJurisdictionId,
      queryText: text,
    });

    let legalRefs = [];
    if (niaConfigured() && result.findings.length) {
      const topIssues = result.findings.filter((f) => f.sev === 'high').slice(0, 3);
      for (const issue of topIssues) {
        try {
          const niaResult = await searchForJurisdiction(issue.title, jurisRoute.code);
          if (niaResult && niaResult.chunks.length) {
            const citations = buildCitations([niaResult.chunks[0]], jurisRoute.code);
            if (citations.length) legalRefs.push({ issue: issue.title, ...citations[0] });
          }
        } catch (e) {
          console.error('[external audit] Nia/citation xatosi:', e.message);
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
      analyzedBy: null,
      createdViaApiKey: req.apiKeyRow.id,
    });

    res.status(201).json({ audit });
  } catch (e) {
    console.error('[external/audit-analyze] xato:', e);
    res.status(500).json({ error: 'Hujjatni tahlil qilishda kutilmagan xato yuz berdi' });
  }
});

module.exports = router;
