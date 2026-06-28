// routes/conversations.js
// Chat tarixi -- Claude/ChatGPT uslubida: har bir suhbat alohida saqlanadi,
// foydalanuvchi ro'yxatdan eskisini ochishi, yangisini boshlashi yoki
// o'chirib tashlashi mumkin.
const express = require('express');
const { Chat } = require('../models');
const { requireAuth } = require('./auth');

const router = express.Router();
const TITLE_MAX_LEN = 42;

function makeTitle(firstMessage) {
  if (!firstMessage) return 'Yangi suhbat';
  const clean = firstMessage.trim().replace(/\s+/g, ' ');
  return clean.length > TITLE_MAX_LEN ? clean.slice(0, TITLE_MAX_LEN) + '…' : clean;
}

router.use(requireAuth);

// GET /api/conversations -- joriy foydalanuvchining barcha suhbatlari (faqat ro'yxat uchun, xabarlarsiz)
router.get('/', async (req, res) => {
  try {
    const list = await Chat.find({ userId: req.user.id, scope: 'b2c' })
      .select('title updatedAt createdAt')
      .sort({ updatedAt: -1 });
    res.json({ conversations: list });
  } catch (e) {
    console.error('[conversations/list] xato:', e);
    res.status(500).json({ error: 'Suhbatlarni yuklashda xato yuz berdi' });
  }
});

// GET /api/conversations/:id -- bitta suhbatning to'liq xabarlari (faqat egasi)
router.get('/:id', async (req, res) => {
  try {
    const convo = await Chat.findById(req.params.id);
    if (!convo) return res.status(404).json({ error: 'Suhbat topilmadi' });
    if (String(convo.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Bu suhbatga ruxsatingiz yo'q" });
    }
    res.json({ conversation: convo });
  } catch (e) {
    console.error('[conversations/get] xato:', e);
    res.status(500).json({ error: 'Suhbatni yuklashda xato yuz berdi' });
  }
});

// POST /api/conversations -- yangi suhbat yaratish
router.post('/', async (req, res) => {
  try {
    const { firstMessage } = req.body;
    const convo = await Chat.create({
      userId: req.user.id,
      scope: 'b2c',
      title: makeTitle(firstMessage),
      messages: [],
    });
    res.status(201).json({ conversation: convo });
  } catch (e) {
    console.error('[conversations/create] xato:', e);
    res.status(500).json({ error: 'Suhbat yaratishda xato yuz berdi' });
  }
});

// POST /api/conversations/:id/messages -- suhbatga xabar qo'shish
router.post('/:id/messages', async (req, res) => {
  try {
    const { role, content } = req.body;
    if (!role || !content) return res.status(400).json({ error: 'role va content talab qilinadi' });
    const convo = await Chat.findById(req.params.id);
    if (!convo) return res.status(404).json({ error: 'Suhbat topilmadi' });
    if (String(convo.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Bu suhbatga ruxsatingiz yo'q" });
    }

    const isFirstUserMsg = role === 'user' && !convo.messages.some((m) => m.role === 'user');
    convo.messages.push({ role, content, at: new Date() });
    if (isFirstUserMsg) convo.title = makeTitle(content);
    await convo.save();

    res.json({ conversation: convo });
  } catch (e) {
    console.error('[conversations/addMessage] xato:', e);
    res.status(500).json({ error: 'Xabar qo\'shishda xato yuz berdi' });
  }
});

// DELETE /api/conversations/:id -- (faqat egasi)
router.delete('/:id', async (req, res) => {
  try {
    const convo = await Chat.findById(req.params.id);
    if (!convo) return res.status(404).json({ error: 'Suhbat topilmadi' });
    if (String(convo.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Bu suhbatni o'chirishga ruxsatingiz yo'q" });
    }
    await Chat.deleteOne({ _id: req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (e) {
    console.error('[conversations/delete] xato:', e);
    res.status(500).json({ error: "Suhbatni o'chirishda xato yuz berdi" });
  }
});

module.exports = router;
