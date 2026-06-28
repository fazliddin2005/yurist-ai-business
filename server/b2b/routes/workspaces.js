// b2b/routes/workspaces.js
// Workspace yaratish, a'zolarni boshqarish (taklif qilish, rolini o'zgartirish,
// o'chirish). Bu B2B "Yuridik Departament" modulining kirish nuqtasi.
const express = require('express');
const { User } = require('../../models');
const { requireAuth } = require('../../routes/auth');
const ws = require('../workspace');
const invites = require('../invites');
const { logActivity, ACTION_TYPES } = require('../../activityLog');
const { isValidJurisdiction } = require('../../jurisdictionRouter');

const router = express.Router();
// DIQQAT: bu yerda router.use(requireAuth) GLOBAL qilib qo'yilmagan -- chunki
// GET /invites/:token route'i auth TALAB QILMASLIGI kerak (taklif qilingan
// odam hali tizimga kirmagan bo'lishi mumkin). Shuning uchun requireAuth har
// bir route'ga alohida qo'shiladi.

// GET /api/b2b/workspaces -- foydalanuvchi a'zo bo'lgan barcha workspace'lar
router.get('/', requireAuth, async (req, res) => {
  try {
    const workspaces = await ws.listWorkspacesForUser(req.user.id);
    res.json({ workspaces });
  } catch (e) {
    console.error('[workspaces/list] xato:', e);
    res.status(500).json({ error: 'Workspace ro\'yxatini yuklashda xato yuz berdi' });
  }
});

// POST /api/b2b/workspaces -- yangi workspace (tashkilot) yaratish
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, industry, primaryJurisdictionId } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Tashkilot nomi talab qilinadi" });
    const created = await ws.createWorkspace({
      name: name.trim(), ownerId: req.user.id, industry, primaryJurisdictionId,
    });
    logActivity({
      type: ACTION_TYPES.WORKSPACE_CREATED,
      userId: req.user.id,
      userLabel: req.user.name,
      meta: { workspaceId: created.id, workspaceName: created.name },
    });
    const json = created.toJSON();
    json.myRole = 'owner';
    res.status(201).json({ workspace: json });
  } catch (e) {
    console.error('[workspaces/create] xato:', e);
    res.status(500).json({ error: 'Tashkilot yaratishda xato yuz berdi' });
  }
});

// PATCH /api/b2b/workspaces/:workspaceId -- workspace sozlamalarini o'zgartirish
// (hozircha faqat primaryJurisdictionId -- Dashboard'dagi yurisdiksiya tanlovi uchun)
router.patch('/:workspaceId', requireAuth, ws.requireWorkspaceAccess('admin'), async (req, res) => {
  try {
    const { primaryJurisdictionId } = req.body;
    if (!primaryJurisdictionId) return res.status(400).json({ error: 'primaryJurisdictionId talab qilinadi' });
    if (!isValidJurisdiction(primaryJurisdictionId)) {
      return res.status(400).json({ error: "Noto'g'ri yurisdiksiya kodi" });
    }
    req.workspace.primaryJurisdictionId = primaryJurisdictionId;
    await req.workspace.save();
    const json = req.workspace.toJSON();
    json.myRole = req.membership.role;
    res.json({ workspace: json });
  } catch (e) {
    console.error('[workspaces/patch] xato:', e);
    res.status(500).json({ error: 'Workspace sozlamalarini yangilashda xato yuz berdi' });
  }
});

// GET /api/b2b/workspaces/invites/:token -- taklif tafsilotlarini ko'rish.
// AUTH TALAB QILINMAYDI -- chunki taklif qilingan odam hali tizimga
// kirmagan bo'lishi mumkin (havolani ochib, avval kim taklif qilgani va
// qaysi workspace ekanini ko'rishi kerak).
// MUHIM: bu route /:workspaceId dan OLDIN bo'lishi shart, aks holda Express
// "invites" so'zini workspaceId deb tushunib, noto'g'ri yo'lga yo'naltiradi.
router.get('/invites/:token', async (req, res) => {
  try {
    const invite = await invites.findInviteByToken(req.params.token);
    if (!invite) return res.status(404).json({ error: 'Taklif topilmadi' });
    if (invite.expired) return res.status(410).json({ error: "Taklif muddati tugagan yoki allaqachon ishlatilgan" });
    const workspace = await ws.getWorkspace(invite.organizationId);
    res.json({ invite: { identifier: invite.identifier, role: invite.role, workspaceName: workspace?.name } });
  } catch (e) {
    console.error('[workspaces/invite-view] xato:', e);
    res.status(500).json({ error: 'Taklifni yuklashda xato yuz berdi' });
  }
});

// POST /api/b2b/workspaces/invites/:token/accept -- taklifni qabul qilish (JWT orqali, foydalanuvchi
// allaqachon tizimga kirgan -- yo'q bo'lsa avval B2C orqali ro'yxatdan o'tishi/kirishi kerak).
router.post('/invites/:token/accept', requireAuth, async (req, res) => {
  try {
    const invite = await invites.findInviteByToken(req.params.token);
    if (!invite) return res.status(404).json({ error: 'Taklif topilmadi' });
    if (invite.expired) return res.status(410).json({ error: "Taklif muddati tugagan yoki allaqachon ishlatilgan" });

    if (await ws.getMembership(invite.organizationId, req.user.id)) {
      await invites.markAccepted(invite.id);
      return res.status(409).json({ error: 'Siz allaqachon bu workspace a\'zosisiz' });
    }

    await ws.addMember(invite.organizationId, req.user.id, invite.role);
    await invites.markAccepted(invite.id);
    const workspace = await ws.getWorkspace(invite.organizationId);
    const json = workspace.toJSON();
    json.myRole = invite.role;
    res.json({ success: true, workspace: json });
  } catch (e) {
    console.error('[workspaces/invite-accept] xato:', e);
    res.status(500).json({ error: 'Taklifni qabul qilishda xato yuz berdi' });
  }
});

// GET /api/b2b/workspaces/:workspaceId -- bitta workspace tafsilotlari (a'zolik tekshiriladi)
router.get('/:workspaceId', requireAuth, ws.requireWorkspaceAccess(), (req, res) => {
  const json = req.workspace.toJSON();
  json.myRole = req.membership.role;
  res.json({ workspace: json });
});

// GET /api/b2b/workspaces/:workspaceId/members -- a'zolar ro'yxati (kamida 'viewer')
router.get('/:workspaceId/members', requireAuth, ws.requireWorkspaceAccess('viewer'), async (req, res) => {
  try {
    const members = await ws.listMembers(req.workspace.id);
    // Har bir a'zoning ism/email ma'lumotini ham qo'shamiz
    const enriched = await Promise.all(members.map(async (m) => {
      const u = await User.findById(m.userId);
      const obj = m.toJSON();
      obj.name = u?.name; obj.email = u?.email; obj.phone = u?.phone;
      return obj;
    }));
    res.json({ members: enriched });
  } catch (e) {
    console.error('[workspaces/members] xato:', e);
    res.status(500).json({ error: 'A\'zolar ro\'yxatini yuklashda xato yuz berdi' });
  }
});

// POST /api/b2b/workspaces/:workspaceId/members -- xodim qo'shish (kamida 'admin')
// Body: { identifier } -- mavjud foydalanuvchining email/telefoni
router.post('/:workspaceId/members', requireAuth, ws.requireWorkspaceAccess('admin'), async (req, res) => {
  try {
    const { identifier, role } = req.body;
    if (!identifier) return res.status(400).json({ error: 'Email yoki telefon kiritilishi shart' });

    const norm = identifier.trim().toLowerCase();
    const targetUser = await User.findOne({ $or: [{ email: norm }, { phone: identifier.trim() }] });
    if (!targetUser) {
      return res.status(404).json({ error: "Bu email/telefon bilan ro'yxatdan o'tgan foydalanuvchi topilmadi. Avval u Yurist AI'da ro'yxatdan o'tishi kerak." });
    }

    const members = await ws.listMembers(req.workspace.id);
    if (members.length >= (req.workspace.seatsLimit || 5)) {
      return res.status(403).json({ error: `Tarifingiz bo'yicha xodimlar limiti (${req.workspace.seatsLimit}) to'lgan. Tarifni oshiring.` });
    }

    const added = await ws.addMember(req.workspace.id, targetUser.id, role || 'member');
    if (!added) return res.status(409).json({ error: 'Bu foydalanuvchi allaqachon a\'zo' });
    logActivity({
      type: ACTION_TYPES.B2B_MEMBER_ADDED,
      userId: req.user.id,
      userLabel: req.user.name,
      meta: { workspaceName: req.workspace.name, role: role || 'member' },
    });

    const json = added.toJSON();
    json.name = targetUser.name; json.email = targetUser.email;
    res.status(201).json({ member: json });
  } catch (e) {
    console.error('[workspaces/add-member] xato:', e);
    res.status(500).json({ error: 'Xodim qo\'shishda xato yuz berdi' });
  }
});

// PATCH /api/b2b/workspaces/:workspaceId/members/:userId -- rolni o'zgartirish (kamida 'admin')
router.patch('/:workspaceId/members/:userId', requireAuth, ws.requireWorkspaceAccess('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!ws.ROLES.includes(role)) return res.status(400).json({ error: "Noto'g'ri rol" });
    if (String(req.params.userId) === String(req.workspace.ownerId)) {
      return res.status(403).json({ error: "Workspace egasining rolini o'zgartirib bo'lmaydi" });
    }
    const updated = await ws.updateMemberRole(req.workspace.id, req.params.userId, role);
    if (!updated) return res.status(404).json({ error: "A'zo topilmadi" });
    res.json({ member: updated });
  } catch (e) {
    console.error('[workspaces/update-role] xato:', e);
    res.status(500).json({ error: 'Rolni yangilashda xato yuz berdi' });
  }
});

// DELETE /api/b2b/workspaces/:workspaceId/members/:userId -- xodimni chiqarish (kamida 'admin')
router.delete('/:workspaceId/members/:userId', requireAuth, ws.requireWorkspaceAccess('admin'), async (req, res) => {
  try {
    if (String(req.params.userId) === String(req.workspace.ownerId)) {
      return res.status(403).json({ error: "Workspace egasini o'chirib bo'lmaydi" });
    }
    const removed = await ws.removeMember(req.workspace.id, req.params.userId);
    res.json({ success: removed > 0 });
  } catch (e) {
    console.error('[workspaces/remove-member] xato:', e);
    res.status(500).json({ error: 'Xodimni chiqarishda xato yuz berdi' });
  }
});

// DELETE /api/b2b/workspaces/:workspaceId -- workspace'ni butunlay o'chirish.
// Faqat 'owner' chaqira oladi. Xavfsizlik uchun, so'rov tanasida workspace
// nomini aynan takrorlashni talab qilamiz -- shunda tasodifiy bosilib
// ketishning oldi olinadi (bu amalni qaytarib bo'lmaydi).
router.delete('/:workspaceId', requireAuth, ws.requireWorkspaceAccess('owner'), async (req, res) => {
  try {
    const { confirmName } = req.body;
    if (!confirmName || confirmName.trim() !== req.workspace.name) {
      return res.status(400).json({ error: "Tasdiqlash uchun tashkilot nomini aynan kiriting" });
    }
    logActivity({
      type: ACTION_TYPES.WORKSPACE_DELETED,
      userId: req.user.id,
      userLabel: req.user.name,
      meta: { workspaceName: req.workspace.name },
    });
    const deleted = await ws.deleteWorkspace(req.workspace.id);
    res.json({ success: deleted });
  } catch (e) {
    console.error('[workspaces/delete] xato:', e);
    res.status(500).json({ error: 'Workspace\'ni o\'chirishda xato yuz berdi' });
  }
});

// ---- XODIMNI TAKLIF QILISH (havola orqali) ----

// GET /api/b2b/workspaces/:workspaceId/invites -- faol takliflar ro'yxati (kamida 'admin')
router.get('/:workspaceId/invites', requireAuth, ws.requireWorkspaceAccess('admin'), async (req, res) => {
  try {
    const list = await invites.listInvites(req.workspace.id);
    res.json({ invites: list });
  } catch (e) {
    console.error('[workspaces/invites-list] xato:', e);
    res.status(500).json({ error: 'Takliflar ro\'yxatini yuklashda xato yuz berdi' });
  }
});

// POST /api/b2b/workspaces/:workspaceId/invites -- yangi taklif yaratish (kamida 'admin')
router.post('/:workspaceId/invites', requireAuth, ws.requireWorkspaceAccess('admin'), async (req, res) => {
  try {
    const { identifier, role } = req.body;
    if (!identifier || !identifier.trim()) return res.status(400).json({ error: 'Email yoki telefon kiritilishi shart' });
    if (role && !ws.ROLES.includes(role)) return res.status(400).json({ error: "Noto'g'ri rol" });

    const members = await ws.listMembers(req.workspace.id);
    if (members.length >= (req.workspace.seatsLimit || 5)) {
      return res.status(403).json({ error: `Tarifingiz bo'yicha xodimlar limiti (${req.workspace.seatsLimit}) to'lgan.` });
    }

    const invite = await invites.createInvite(req.workspace.id, req.user.id, identifier, role || 'member');
    res.status(201).json({ invite });
  } catch (e) {
    console.error('[workspaces/invite-create] xato:', e);
    res.status(500).json({ error: 'Taklif yaratishda xato yuz berdi' });
  }
});

// DELETE /api/b2b/workspaces/:workspaceId/invites/:inviteId -- taklifni bekor qilish (kamida 'admin')
router.delete('/:workspaceId/invites/:inviteId', requireAuth, ws.requireWorkspaceAccess('admin'), async (req, res) => {
  try {
    const removed = await invites.revokeInvite(req.workspace.id, req.params.inviteId);
    res.json({ success: removed > 0 });
  } catch (e) {
    console.error('[workspaces/invite-revoke] xato:', e);
    res.status(500).json({ error: 'Taklifni bekor qilishda xato yuz berdi' });
  }
});

module.exports = router;
