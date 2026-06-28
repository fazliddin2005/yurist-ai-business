// routes/promo.js
// Promokodlar -- foydalanuvchi kodni kiritsa, unga belgilangan miqdorda kredit
// qo'shiladi. Har bir foydalanuvchi bir kodni faqat bir marta ishlatishi mumkin.
const express = require('express');
const { User, PromoRedemption } = require('../models');
const { requireAuth } = require('./auth');
const { logActivity, ACTION_TYPES } = require('../activityLog');

const router = express.Router();

// Promokodlar ro'yxati. Yangi kod qo'shish uchun shu massivga bitta qator
// qo'shish kifoya: { code, credits, label }.
const PROMO_CODES = [
  { code: '1910218898', credits: 100000, label: 'Test/ishlab chiqish kodi' },
];

function findPromo(code) {
  const norm = (code || '').trim();
  return PROMO_CODES.find((p) => p.code === norm);
}

// POST /api/promo/redeem  { code }
router.post('/redeem', requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || !code.trim()) return res.status(400).json({ error: 'Promokodni kiriting' });

    const promo = findPromo(code);
    if (!promo) return res.status(404).json({ error: "Promokod topilmadi yoki noto'g'ri" });

    const alreadyUsed = await PromoRedemption.findOne({ userId: req.user.id, code: promo.code });
    if (alreadyUsed) {
      return res.status(409).json({ error: 'Siz bu promokodni allaqachon ishlatgansiz' });
    }

    req.user.credits = (req.user.credits || 0) + promo.credits;
    await req.user.save();
    await PromoRedemption.create({ userId: req.user.id, code: promo.code, creditsGiven: promo.credits });

    logActivity({
      type: ACTION_TYPES.PROMO_REDEEMED,
      userId: req.user.id,
      userLabel: req.user.name,
      meta: { creditsGiven: promo.credits },
    });

    res.json({
      success: true,
      creditsAdded: promo.credits,
      creditsLeft: req.user.credits,
      message: `${promo.credits.toLocaleString('ru-RU')} kredit qo'shildi!`,
    });
  } catch (e) {
    console.error('[promo/redeem] xato:', e);
    res.status(500).json({ error: 'Promokodni ishlatishda kutilmagan xato yuz berdi' });
  }
});

module.exports = router;
