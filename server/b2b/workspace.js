// b2b/workspace.js
// ============================================================================
// MULTI-TENANCY ARXITEKTURASI
// ============================================================================
// Har bir B2B mijoz (biznes) -- "Workspace" (Organization) deb ataladi.
// Workspace o'z ichida a'zolar, shartnoma shablonlari, hujjatlar, audit
// hisobotlarini saqlaydi. Workspace'lar bir-biridan to'liq izolyatsiya
// qilingan -- har bir B2B yozuvi o'zida organizationId saqlaydi, har bir
// so'rovda middleware avval foydalanuvchining shu workspace'ga a'zoligini
// tekshiradi.
//
// MONGODB MIGRATSIYASI: bu modul avval JSON fayl-asosli edi. Endi MongoDB
// (Mongoose) orqali ishlaydi -- BARCHA funksiyalar endi ASINXRON (Promise
// qaytaradi), shuning uchun chaqiruvchi tomon har birini `await` bilan
// chaqirishi SHART.
// ============================================================================
const { Organization, Member } = require('../models/Organization');
const { Template, TemplateVersion } = require('../models/Template');
const Audit = require('../models/Audit');
const Document = require('../models/Document');
const Chat = require('../models/Chat');

const ROLES = ['owner', 'admin', 'member', 'viewer'];
const ROLE_RANK = { owner: 4, admin: 3, member: 2, viewer: 1 };

function hasAtLeastRole(role, required) {
  return (ROLE_RANK[role] || 0) >= (ROLE_RANK[required] || 0);
}

async function createWorkspace({ name, ownerId, industry, primaryJurisdictionId }) {
  const ws = await Organization.create({
    name: name || "Yangi tashkilot",
    industry: industry || null,
    ownerId,
    plan: 'trial',
    seatsLimit: 5,
    // DIQQAT: credits/chatMsgCount endi haqiqiy billing uchun ISHLATILMAYDI --
    // B2B kredit endi B2C bilan bir xil, shaxsiy balans (User.credits) orqali
    // hisoblanadi. Bu ikki maydon faqat eski sxema moslik uchun va admin
    // panelda ko'rinish uchun qolgan, real sarflanish/yetarlilik tekshiruvi
    // bu yerga tegmaydi (qarang: b2b/routes/chat.js).
    credits: 20,
    chatMsgCount: 0,
    primaryJurisdictionId: primaryJurisdictionId || 'UZ',
  });
  // Egasi avtomatik 'owner' rolida birinchi a'zo bo'ladi
  await Member.create({ organizationId: ws.id, userId: ownerId, role: 'owner' });
  return ws;
}

async function getWorkspace(id) {
  try {
    return await Organization.findById(id);
  } catch (e) {
    return null; // noto'g'ri ObjectId formatida ham xavfsiz null qaytaramiz
  }
}

async function getMembership(workspaceId, userId) {
  return Member.findOne({ organizationId: workspaceId, userId });
}

async function listMembers(workspaceId) {
  return Member.find({ organizationId: workspaceId });
}

async function listWorkspacesForUser(userId) {
  const memberships = await Member.find({ userId });
  const workspaces = await Promise.all(
    memberships.map(async (m) => {
      const ws = await getWorkspace(m.organizationId);
      if (!ws) return null;
      const obj = ws.toJSON();
      obj.myRole = m.role;
      return obj;
    })
  );
  return workspaces.filter(Boolean);
}

async function addMember(workspaceId, userId, role) {
  if (await getMembership(workspaceId, userId)) return null; // allaqachon a'zo
  return Member.create({ organizationId: workspaceId, userId, role: role || 'member' });
}

async function updateMemberRole(workspaceId, userId, role) {
  return Member.findOneAndUpdate(
    { organizationId: workspaceId, userId },
    { role },
    { new: true }
  );
}

async function removeMember(workspaceId, userId) {
  const result = await Member.deleteOne({ organizationId: workspaceId, userId });
  return result.deletedCount;
}

// ---- Express middleware: workspace izolyatsiyasini majburlash ----
// Foydalanish: router.use('/:workspaceId/...', requireWorkspaceAccess())
// req.workspace va req.membership ni to'ldiradi.
// DIQQAT: bu middleware endi ASINXRON -- async funksiya qaytaradi.
function requireWorkspaceAccess(minRole) {
  return async (req, res, next) => {
    try {
      const workspaceId = req.params.workspaceId;
      const ws = await getWorkspace(workspaceId);
      if (!ws) return res.status(404).json({ error: 'Workspace topilmadi' });

      const membership = await getMembership(workspaceId, req.user.id);
      if (!membership) {
        // MUHIM: bu yerda "topilmadi" emas, "ruxsat yo'q" qaytariladi -- shunda
        // boshqa workspace'ning mavjudligi ham oshkor bo'lmaydi (xavfsizlik).
        return res.status(403).json({ error: "Bu workspace'ga ruxsatingiz yo'q" });
      }
      if (minRole && !hasAtLeastRole(membership.role, minRole)) {
        return res.status(403).json({ error: `Bu amal uchun kamida "${minRole}" roli kerak` });
      }

      req.workspace = ws;
      req.membership = membership;
      next();
    } catch (e) {
      console.error('[workspace/requireAccess] xato:', e);
      res.status(500).json({ error: 'Workspace tekshirishda kutilmagan xato yuz berdi' });
    }
  };
}

async function adjustWorkspaceCredits(workspaceId, delta) {
  const ws = await getWorkspace(workspaceId);
  if (!ws) return null;
  ws.credits = Math.max(0, (ws.credits || 0) + delta);
  await ws.save();
  return ws;
}

// Workspace'ni butunlay o'chirish -- unga tegishli BARCHA ma'lumotlarni
// (a'zolik, shablonlar, versiyalari, auditlar, hujjatlar, suhbatlar) tozalaydi.
// Faqat 'owner' chaqirishi mumkin -- bu tekshiruv route darajasida amalga oshiriladi.
async function deleteWorkspace(workspaceId) {
  const ws = await getWorkspace(workspaceId);
  if (!ws) return false;

  // Avval shablon ID'larini olib qo'yamiz -- versiyalar shu orqali bog'langan
  const templates = await Template.find({ organizationId: workspaceId }).select('_id');
  const templateIds = templates.map((t) => t._id);

  await Organization.deleteOne({ _id: workspaceId });
  await Member.deleteMany({ organizationId: workspaceId });
  await Template.deleteMany({ organizationId: workspaceId });
  await TemplateVersion.deleteMany({ templateId: { $in: templateIds } });
  await Audit.deleteMany({ organizationId: workspaceId });
  await Document.deleteMany({ organizationId: workspaceId });
  await Chat.deleteMany({ organizationId: workspaceId });
  return true;
}

module.exports = {
  ROLES, ROLE_RANK, hasAtLeastRole,
  createWorkspace, getWorkspace, getMembership, listMembers, listWorkspacesForUser,
  addMember, updateMemberRole, removeMember, adjustWorkspaceCredits, deleteWorkspace,
  requireWorkspaceAccess,
};
