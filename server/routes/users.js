// routes/users.js
const express = require('express');
const { User } = require('../models');
const { requireAuth, publicUser } = require('./auth');
const { logActivity, ACTION_TYPES } = require('../activityLog');
const { requestDeletion, cancelDeletion, getPendingDeletion } = require('../accountDeletion');
const { GRACE_PERIOD_DAYS, RETENTION_RULES } = require('../dataRetentionPolicy');

async function getUser(id) {
  return User.findById(id);
}

async function adjustCredits(id, delta) {
  const user = await User.findById(id);
  if (!user) return null;
  user.credits = Math.max(0, (user.credits || 0) + delta);
  await user.save();
  return user;
}

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  try {
    res.json({ user: await publicUser(req.user) });
  } catch (e) {
    console.error('[users/me] xato:', e);
    res.status(500).json({ error: 'Kutilmagan xato yuz berdi' });
  }
});

router.post('/me/credits', requireAuth, async (req, res) => {
  try {
    const { delta } = req.body;
    const numDelta = Number(delta) || 0;
    const updated = await adjustCredits(req.user.id, numDelta);
    if (numDelta > 0) {
      logActivity({
        type: ACTION_TYPES.CREDIT_PURCHASED,
        userId: req.user.id,
        userLabel: req.user.name,
        meta: { amount: numDelta },
      });
    }
    res.json({ user: await publicUser(updated) });
  } catch (e) {
    console.error('[users/me/credits] xato:', e);
    res.status(500).json({ error: 'Kreditni yangilashda xato yuz berdi' });
  }
});

router.post('/me/jurisdiction', requireAuth, async (req, res) => {
  try {
    const { jurisdiction } = req.body;
    req.user.jurisdiction = jurisdiction;
    await req.user.save();
    res.json({ user: await publicUser(req.user) });
  } catch (e) {
    console.error('[users/me/jurisdiction] xato:', e);
    res.status(500).json({ error: 'Yurisdiksiyani yangilashda xato yuz berdi' });
  }
});

router.post('/me/lang', requireAuth, async (req, res) => {
  try {
    const { lang } = req.body;
    req.user.lang = lang;
    await req.user.save();
    res.json({ user: await publicUser(req.user) });
  } catch (e) {
    console.error('[users/me/lang] xato:', e);
    res.status(500).json({ error: 'Tilni yangilashda xato yuz berdi' });
  }
});

// GET /api/users/data-policy -- ma'lumotlarni saqlash siyosatini ko'rsatish.
// AUTH TALAB QILINMAYDI -- bu ham ToS kabi, login qilmasdan ham ko'rish
// mumkin bo'lishi kerak (shaffoflik talabi).
router.get('/data-policy', (req, res) => {
  res.json({ gracePeriodDays: GRACE_PERIOD_DAYS, rules: RETENTION_RULES });
});

// GET /api/users/me/deletion-status -- joriy foydalanuvchining faol
// o'chirish so'rovi bor-yo'qligini tekshirish (frontend "hisobingiz N
// kundan keyin o'chiriladi" deb ko'rsatishi uchun).
router.get('/me/deletion-status', requireAuth, async (req, res) => {
  try {
    const pending = await getPendingDeletion(req.user.id);
    res.json({
      pending: !!pending,
      scheduledPurgeAt: pending ? pending.scheduledPurgeAt : null,
      requestedAt: pending ? pending.requestedAt : null,
    });
  } catch (e) {
    console.error('[users/deletion-status] xato:', e);
    res.status(500).json({ error: 'Holatni tekshirishda xato yuz berdi' });
  }
});

// POST /api/users/me/request-deletion -- hisobni o'chirishni so'rash.
// DARHOL O'CHIRILMAYDI -- 30 kunlik muddat boshlanadi (dataRetentionPolicy.js
// ga muvofiq). Foydalanuvchi shu muddat ichida fikrini o'zgartirishi mumkin.
router.post('/me/request-deletion', requireAuth, async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || null;
    const request = await requestDeletion(req.user.id, clientIp);
    logActivity({
      type: ACTION_TYPES.ACCOUNT_DELETION_REQUESTED,
      userId: req.user.id,
      userLabel: req.user.name,
    });
    res.json({
      success: true,
      scheduledPurgeAt: request.scheduledPurgeAt,
      message: `Hisobingiz ${GRACE_PERIOD_DAYS} kundan keyin o'chiriladi. Shu muddat ichida istalgan vaqtda bekor qilishingiz mumkin.`,
    });
  } catch (e) {
    console.error('[users/request-deletion] xato:', e);
    res.status(500).json({ error: "O'chirish so'rovini yaratishda xato yuz berdi" });
  }
});

// POST /api/users/me/cancel-deletion -- fikr o'zgartirilsa, so'rovni bekor qilish.
router.post('/me/cancel-deletion', requireAuth, async (req, res) => {
  try {
    const cancelled = await cancelDeletion(req.user.id);
    if (!cancelled) return res.status(404).json({ error: "Faol o'chirish so'rovi topilmadi" });
    logActivity({
      type: ACTION_TYPES.ACCOUNT_DELETION_CANCELLED,
      userId: req.user.id,
      userLabel: req.user.name,
    });
    res.json({ success: true, message: "O'chirish so'rovi bekor qilindi. Hisobingiz normal ishlashda davom etadi." });
  } catch (e) {
    console.error('[users/cancel-deletion] xato:', e);
    res.status(500).json({ error: "Bekor qilishda xato yuz berdi" });
  }
});

module.exports = router;
module.exports.getUser = getUser;
module.exports.adjustCredits = adjustCredits;
