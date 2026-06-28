// models/Organization.js
// B2B workspace (tashkilot). Eski JSON nomi "b2b_workspaces" edi -- kodning
// boshqa joylarida hali ham "workspace" deb ataladi, lekin so'rovingizga
// ko'ra model nomi "Organization".
const { mongoose } = require('./connection');
const { Schema } = mongoose;

const organizationSchema = new Schema(
  {
    name: { type: String, required: true },
    industry: { type: String, default: null },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['trial', 'starter', 'business', 'enterprise'], default: 'trial' },
    seatsLimit: { type: Number, default: 5 },
    credits: { type: Number, default: 20 }, // workspace umumiy kredit hovuzi
    chatMsgCount: { type: Number, default: 0 },
    primaryJurisdictionId: { type: String, default: 'UZ' },
  },
  { timestamps: true }
);

organizationSchema.virtual('id').get(function () {
  return this._id.toString();
});
organizationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret; },
});
organizationSchema.set('toObject', { virtuals: true });

// Workspace a'zoligi -- alohida kolleksiya (eski "b2b_members" jadvali).
// Bitta foydalanuvchi bir nechta tashkilotga a'zo bo'lishi mumkin, shuning
// uchun bu alohida model (Organization ichiga array qilib joylashtirish
// ko'p a'zoli tashkilotlar uchun noqulay bo'lardi).
const memberSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'admin', 'member', 'viewer'], default: 'member' },
  },
  { timestamps: { createdAt: 'joinedAt', updatedAt: false } }
);
memberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
memberSchema.virtual('id').get(function () { return this._id.toString(); });
memberSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret; },
});

const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);
const Member = mongoose.models.Member || mongoose.model('Member', memberSchema);

module.exports = { Organization, Member };
