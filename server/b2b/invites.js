// b2b/invites.js
// Xodimni workspace'ga taklif qilish tizimi. Owner/admin email/telefon
// kiritadi, tizim noyob taklif havolasi yaratadi. Odam shu havola orqali
// ro'yxatdan o'tsa (agar yangi bo'lsa) yoki kirsa (agar mavjud bo'lsa),
// avtomatik workspace'ga qo'shiladi.
//
// DEMO REJIM HAQIDA: havola real email/SMS orqali yuborilmaydi (notifier.js
// kabi sabab -- hozircha tashqi xizmat ulanmagan). Owner havolani nusxalab,
// o'zi xodimga yuborishi mumkin (Telegram, WhatsApp va h.k. orqali).
const { v4: uuidv4 } = require('uuid');
const Invite = require('../models/Invite');

const EXPIRY_DAYS = 7;

async function createInvite(workspaceId, invitedBy, identifier, role) {
  const now = new Date();
  return Invite.create({
    token: uuidv4().replace(/-/g, ''), // havolada ishlatiladigan noyob token
    organizationId: workspaceId,
    invitedBy,
    identifier: identifier.trim(),
    role: role || 'member',
    status: 'pending',
    expiresAt: new Date(now.getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000),
  });
}

async function findInviteByToken(token) {
  const invite = await Invite.findOne({ token });
  if (!invite) return null;
  const obj = invite.toJSON();
  if (obj.status !== 'pending') return { ...obj, expired: true };
  if (new Date(obj.expiresAt) < new Date()) return { ...obj, expired: true };
  return obj;
}

async function listInvites(workspaceId) {
  return Invite.find({
    organizationId: workspaceId,
    status: 'pending',
    expiresAt: { $gte: new Date() },
  });
}

async function markAccepted(inviteId) {
  return Invite.findByIdAndUpdate(inviteId, { status: 'accepted', acceptedAt: new Date() }, { new: true });
}

async function revokeInvite(workspaceId, inviteId) {
  const result = await Invite.deleteOne({ _id: inviteId, organizationId: workspaceId });
  return result.deletedCount;
}

module.exports = { createInvite, findInviteByToken, listInvites, markAccepted, revokeInvite };
