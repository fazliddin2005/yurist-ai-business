// b2b/routes/conversations.js
// Chat tarixi -- B2C bilan bir xil model (Claude/ChatGPT uslubida), lekin
// workspace ichida saqlanadi. Har bir xodimning suhbati shaxsiy ko'rinadi
// (faqat o'zi yozgan xabarlarni ko'radi) -- workspace faqat kredit hovuzini
// ulashadi, suhbat matnini emas.
const express = require('express');
const { Chat } = require('../../models');
const { requireAuth } = require('../../routes/auth');
const ws = require('../workspace');

const router = express.Router();
const TITLE_MAX_LEN = 42;

function makeTitle(firstMessage) {
  if (!firstMessage) return 'Yangi suhbat';
  const clean = firstMessage.trim().replace(/\s+/g, ' ');
  return clean.length > TITLE_MAX_LEN ? clean.slice(0, TITLE_MAX_LEN) + '…' : clean;
}

router.use(requireAuth);
router.use('/:workspaceId', ws.requireWorkspaceAccess('member'));

// GET /api/b2b/conversations/:workspaceId -- joriy xodimning workspace ichidagi suhbatlari
router.get('/:workspaceId', async (req, res) => {
  try {
    const list = await Chat.find({ organizationId: req.workspace.id, userId: req.user.id, scope: 'b2b' })
      .select('title updatedAt createdAt')
      .sort({ updatedAt: -1 });
    res.json({ conversations: list });
  } catch (e) {
    console.error('[b2b conversations/list] xato:', e);
    res.status(500).json({ error: 'Suhbatlarni yuklashda xato yuz berdi' });
  }
});

// GET /api/b2b/conversations/:workspaceId/:convoId
router.get('/:workspaceId/:convoId', async (req, res) => {
  try {
    const convo = await Chat.findOne({ _id: req.params.convoId, organizationId: req.workspace.id });
    if (!convo) return res.status(404).json({ error: 'Suhbat topilmadi' });
    if (String(convo.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Bu suhbatga ruxsatingiz yo'q" });
    }
    res.json({ conversation: convo });
  } catch (e) {
    console.error('[b2b conversations/get] xato:', e);
    res.status(500).json({ error: 'Suhbatni yuklashda xato yuz berdi' });
  }
});

// POST /api/b2b/conversations/:workspaceId
router.post('/:workspaceId', async (req, res) => {
  try {
    const { firstMessage } = req.body;
    const convo = await Chat.create({
      organizationId: req.workspace.id, userId: req.user.id, scope: 'b2b',
      title: makeTitle(firstMessage), messages: [],
    });
    res.status(201).json({ conversation: convo });
  } catch (e) {
    console.error('[b2b conversations/create] xato:', e);
    res.status(500).json({ error: 'Suhbat yaratishda xato yuz berdi' });
  }
});

// POST /api/b2b/conversations/:workspaceId/:convoId/messages
router.post('/:workspaceId/:convoId/messages', async (req, res) => {
  try {
    const { role, content } = req.body;
    if (!role || !content) return res.status(400).json({ error: 'role va content talab qilinadi' });
    const convo = await Chat.findOne({ _id: req.params.convoId, organizationId: req.workspace.id });
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
    console.error('[b2b conversations/addMessage] xato:', e);
    res.status(500).json({ error: 'Xabar qo\'shishda xato yuz berdi' });
  }
});

// DELETE /api/b2b/conversations/:workspaceId/:convoId
router.delete('/:workspaceId/:convoId', async (req, res) => {
  try {
    const convo = await Chat.findOne({ _id: req.params.convoId, organizationId: req.workspace.id });
    if (!convo) return res.status(404).json({ error: 'Suhbat topilmadi' });
    if (String(convo.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Bu suhbatni o'chirishga ruxsatingiz yo'q" });
    }
    await Chat.deleteOne({ _id: req.params.convoId });
    res.json({ success: true, id: req.params.convoId });
  } catch (e) {
    console.error('[b2b conversations/delete] xato:', e);
    res.status(500).json({ error: "Suhbatni o'chirishda xato yuz berdi" });
  }
});

module.exports = router;
