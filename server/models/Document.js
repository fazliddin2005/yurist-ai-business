// models/Document.js
// Hujjatlar -- B2C (shablondan to'ldirilgan) va B2B (CLM shablonidan
// to'ldirilgan) uchun bitta model, `scope` orqali farqlanadi.
const { mongoose } = require('./connection');
const { Schema } = mongoose;

const documentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // B2C bo'lsa
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', default: null }, // B2B bo'lsa
    scope: { type: String, enum: ['b2c', 'b2b'], default: 'b2c' },
    templateId: { type: Schema.Types.ObjectId, ref: 'Template', default: null }, // B2B CLM shablonidan bo'lsa
    templateKey: { type: String, default: 'custom' }, // B2C shablon turi (masalan 'rent')
    name: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} }, // B2C forma maydonlari
    filledBody: { type: String, default: null }, // B2B to'ldirilgan matn
    jurisdictionId: { type: String, default: 'UZ' },
    status: { type: String, default: 'Yakunlandi' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // B2B'da kim to'ldirgani
  },
  { timestamps: true }
);

documentSchema.index({ userId: 1 });
documentSchema.index({ organizationId: 1 });
documentSchema.virtual('id').get(function () { return this._id.toString(); });
documentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret; },
});

module.exports = mongoose.models.Document || mongoose.model('Document', documentSchema);
