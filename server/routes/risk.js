// routes/risk.js
const express = require('express');
const multer = require('multer');
const users = require('./users');
const { requireAuth } = require('./auth');
const { analyzeText } = require('../riskEngine');
const { extractText } = require('../textExtraction');
const { logActivity, ACTION_TYPES } = require('../activityLog');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/risk/analyze  (multipart form-data: file)
router.post('/analyze', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const user = req.user;
    if (user.credits < 1) return res.status(402).json({ error: 'Kredit yetarli emas', code: 'NO_CREDITS' });
    if (!req.file) return res.status(400).json({ error: 'Fayl yuklanmadi' });

    const extraction = await extractText(req.file.buffer, req.file.mimetype, req.file.originalname);
    const text = extraction.text;

    const result = analyzeText(text);
    const updatedUser = await users.adjustCredits(user.id, -1);
    logActivity({
      type: ACTION_TYPES.RISK_ANALYSIS_RUN,
      userId: user.id,
      userLabel: user.name,
      meta: { score: result.score, tier: result.tier },
    });

    res.json({
      fileName: req.file.originalname || '',
      score: result.score,
      tier: result.tier,
      readable: result.readable,
      findings: result.findings,
      extractionWarning: extraction.warning || null,
      creditsLeft: updatedUser ? updatedUser.credits : Math.max(0, user.credits - 1),
    });
  } catch (e) {
    console.error('[risk/analyze] xato:', e);
    res.status(500).json({ error: 'Hujjatni tahlil qilishda kutilmagan xato yuz berdi' });
  }
});

module.exports = router;
