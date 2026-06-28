// models/APIKey.js
// B2B tashqi integratsiya kalitlari (1C, Bitrix24 va h.k. uchun). Faqat
// XESHLANGAN holatda saqlanadi -- haqiqiy kalit hech qachon bazada
// saqlanmaydi (parol kabi), faqat yaratilgan paytda bir marta ko'rsatiladi.
const { mongoose } = require('./connection');
const { Schema } = mongoose;

const apiKeySchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    label: { type: String, default: 'API kalit' },
    keyHash: { type: String, required: true }, // sha256 xesh, haqiqiy kalit emas
    keyPreview: { type: String, required: true }, // ko'rsatish uchun, masalan "yk_live_a3f9...8d1e"
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastUsedAt: { type: Date, default: null },
    revoked: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

apiKeySchema.index({ keyHash: 1 });
apiKeySchema.virtual('id').get(function () { return this._id.toString(); });
apiKeySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id; delete ret.__v;
    delete ret.keyHash; // MAXFIYLIK: xesh hech qachon API javobida chiqmasin
    return ret;
  },
});

module.exports = mongoose.models.APIKey || mongoose.model('APIKey', apiKeySchema);
