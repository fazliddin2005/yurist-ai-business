// models/Audit.js
// B2B AI Risk Audit hisobotlari.
const { mongoose } = require('./connection');
const { Schema } = mongoose;

const findingSchema = new Schema(
  { sev: String, title: String, body: String },
  { _id: false }
);
const legalRefSchema = new Schema(
  { issue: String, countryName: String, codexName: String, articleNumber: String, sourceUrl: String, excerpt: String, citationText: String },
  { _id: false }
);

const auditSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    jurisdictionId: { type: String, default: 'UZ' },
    jurisdictionSource: { type: String, default: 'default' },
    fileName: { type: String, default: '' },
    score: { type: Number, default: null },
    tier: { type: String, default: null },
    readable: { type: Boolean, default: true },
    findings: { type: [findingSchema], default: [] },
    legalRefs: { type: [legalRefSchema], default: [] },
    // SUD AMALIYOTI: eng jiddiy muammo bo'yicha topilgan sud qarori namunasi
    // (faqat UZ, RU, TJ, US uchun -- bu davlatlarning sud amaliyoti manbasi
    // Nia'da to'liq indekslangan).
    caseLawRef: {
      type: new Schema({ issue: String, excerpt: String, source: String }, { _id: false }),
      default: null,
    },
    analyzedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    createdViaApiKey: { type: Schema.Types.ObjectId, ref: 'APIKey', default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);
auditSchema.index({ organizationId: 1 });
auditSchema.virtual('id').get(function () { return this._id.toString(); });
auditSchema.set('toJSON', { virtuals: true, transform: (d, r) => { delete r._id; delete r.__v; return r; } });

module.exports = mongoose.models.Audit || mongoose.model('Audit', auditSchema);
