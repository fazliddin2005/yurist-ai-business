// models/Invite.js
// B2B xodimni workspace'ga taklif qilish havolalari.
const { mongoose } = require('./connection');
const { Schema } = mongoose;

const inviteSchema = new Schema(
  {
    token: { type: String, required: true, unique: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    identifier: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
    status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);
inviteSchema.index({ organizationId: 1, status: 1 });
inviteSchema.virtual('id').get(function () { return this._id.toString(); });
inviteSchema.set('toJSON', { virtuals: true, transform: (d, r) => { delete r._id; delete r.__v; return r; } });

module.exports = mongoose.models.Invite || mongoose.model('Invite', inviteSchema);
