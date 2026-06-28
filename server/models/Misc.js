// models/Misc.js
// Kichik yordamchi modellar: promokod ishlatish tarixi, parol tiklash
// kodlari, email/telefon tasdiqlash kodlari.
const { mongoose } = require('./connection');
const { Schema } = mongoose;

const promoRedemptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true },
    creditsGiven: { type: Number, required: true },
  },
  { timestamps: { createdAt: 'redeemedAt', updatedAt: false } }
);
promoRedemptionSchema.index({ userId: 1, code: 1 });

const passwordResetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);
passwordResetSchema.index({ userId: 1 });

const verificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);
verificationSchema.index({ userId: 1 });

const PromoRedemption = mongoose.models.PromoRedemption || mongoose.model('PromoRedemption', promoRedemptionSchema);
const PasswordReset = mongoose.models.PasswordReset || mongoose.model('PasswordReset', passwordResetSchema);
const Verification = mongoose.models.Verification || mongoose.model('Verification', verificationSchema);

module.exports = { PromoRedemption, PasswordReset, Verification };
