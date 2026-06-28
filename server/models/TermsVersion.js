// models/TermsVersion.js
// ============================================================================
// HAR BIR FOYDALANISH SHARTLARI VERSIYASINING O'ZGARMAS (IMMUTABLE) ARXIVI.
//
// MUHIM HUQUQIY SABAB: foydalanuvchi "1.0" versiyaga rozilik berdi deb
// yozib qo'yishning o'zi YETARLI EMAS -- agar kelajakda kod ichidagi
// termsContent.js fayli yangilansa (masalan 1.0 dan 1.1 ga o'tilsa), ESKI
// 1.0 matni yo'qolib ketadi. Keyin sud/nizo paytida "1.0 versiyada aniq
// nima yozilgan edi?" degan savolga javob bera olmay qolamiz.
//
// YECHIM: har bir versiya yaratilganda (yoki o'zgartirilganda), TO'LIQ
// matn shu kolleksiyaga "muzlatilgan" holda saqlanadi va HECH QACHON
// o'chirilmaydi yoki tahrirlanmaydi. Foydalanuvchining termsAcceptedVersion
// maydoni shu yerdagi versiyaga "ishora" qiladi -- va bu ishora doim
// ishlaydi, chunki manba matn abadiy saqlanadi.
// ============================================================================
const { mongoose } = require('./connection');
const { Schema } = mongoose;

const termsVersionSchema = new Schema(
  {
    version: { type: String, required: true, unique: true }, // masalan "1.0", "1.1", "2.0"
    // Har bir tilning TO'LIQ matni shu versiya uchun -- termsContent.js
    // bilan bir xil struktura (title, sections, consentLabel va h.k.),
    // lekin Mixed turida saqlanadi, chunki til/band soni o'zgarib turishi mumkin.
    content: { type: Schema.Types.Mixed, required: true },
    // Bu versiya qachon "joriy" deb belgilangani (eng oxirgi joriy versiya
    // -- foydalanuvchilardan shu versiyaga rozilik so'raladi).
    isCurrent: { type: Boolean, default: false },
    // Versiya nimani o'zgartirgani haqida qisqa izoh (ixtiyoriy, lekin
    // tavsiya etiladi -- masalan "Maxfiylik bandiga aniqlik kiritildi").
    changeNote: { type: String, default: '' },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

termsVersionSchema.index({ isCurrent: 1 });
termsVersionSchema.virtual('id').get(function () { return this._id.toString(); });
termsVersionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret; },
});

module.exports = mongoose.models.TermsVersion || mongoose.model('TermsVersion', termsVersionSchema);
