// models/AccuracyScore.js
// RAGAS-uslubidagi aniqlik baholash yozuvlari. Admin panelda "tizim
// sifati vaqt davomida qanday" statistikasi uchun ishlatiladi.
const { mongoose } = require('./connection');
const { Schema } = mongoose;

const accuracyScoreSchema = new Schema(
  {
    scope: { type: String, enum: ['b2c', 'b2b'], default: 'b2c' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', default: null },
    jurisdictionId: { type: String, default: 'UZ' },
    faithfulness: { type: Number, required: true, min: 0, max: 100 },
    answerRelevancy: { type: Number, required: true, min: 0, max: 100 },
    contextPrecision: { type: Number, required: true, min: 0, max: 100 },
    // DIAGNOSTIKA: bu baholashda Nia orqali manba matni TOPILGAN edimi?
    // Agar yo'q bo'lsa, Faithfulness/ContextPrecision standart 50% qiymatni
    // oladi (neytral, "baholab bo'lmaydi" degani) -- bu HAQIQIY past baho
    // bilan ADASHTIRILMASLIGI uchun shu maydon kerak.
    hadContext: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

accuracyScoreSchema.index({ createdAt: -1 });
accuracyScoreSchema.index({ jurisdictionId: 1 });
accuracyScoreSchema.virtual('id').get(function () { return this._id.toString(); });
accuracyScoreSchema.set('toJSON', { virtuals: true, transform: (d, r) => { delete r._id; delete r.__v; return r; } });

module.exports = mongoose.models.AccuracyScore || mongoose.model('AccuracyScore', accuracyScoreSchema);
