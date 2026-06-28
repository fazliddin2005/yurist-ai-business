// models/Template.js
// B2B CLM shartnoma shablonlari + versiyalash tarixi.
const { mongoose } = require('./connection');
const { Schema } = mongoose;

const templateSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'Umumiy' },
    placeholders: { type: [String], default: [] },
    currentVersion: { type: Number, default: 1 },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);
templateSchema.index({ organizationId: 1 });
templateSchema.virtual('id').get(function () { return this._id.toString(); });
templateSchema.set('toJSON', { virtuals: true, transform: (d, r) => { delete r._id; delete r.__v; return r; } });

const templateVersionSchema = new Schema(
  {
    templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
    versionNumber: { type: Number, required: true },
    body: { type: String, required: true },
    editedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changeNote: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);
templateVersionSchema.index({ templateId: 1, versionNumber: -1 });
templateVersionSchema.virtual('id').get(function () { return this._id.toString(); });
templateVersionSchema.set('toJSON', { virtuals: true, transform: (d, r) => { delete r._id; delete r.__v; return r; } });

const Template = mongoose.models.Template || mongoose.model('Template', templateSchema);
const TemplateVersion = mongoose.models.TemplateVersion || mongoose.model('TemplateVersion', templateVersionSchema);

module.exports = { Template, TemplateVersion };
