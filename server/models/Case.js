// models/Case.js
// ============================================================================
// "ISH" (CASE) -- AI Associate funksiyasi uchun. Oddiy Chat (suhbat) dan
// farqi: bu bitta huquqiy masala/nizo bo'yicha OYLAR DAVOMIDA davom etadigan
// kontekst hisoblanadi. AI har bir yangi xabardan keyin ishning XULOSASINI
// (summary) yangilab boradi -- shunda foydalanuvchi haftalar o'tib qaytib
// kelsa ham, AI "ishning tarixini" eslab qoladi, lekin har safar BUTUN
// tarixni qaytadan o'qish kerak bo'lmaydi (xarajat va tezlik nazarda
// tutilgan -- faqat xulosa + so'nggi bir nechta xabar AI'ga yuboriladi).
//
// Bog'lanish: bitta Case bir nechta Chat (suhbat) ni o'z ichiga olishi
// mumkin -- masalan foydalanuvchi bugun savol so'raydi, ertaga davom
// ettiradi, lekin ikkisi ham bir xil "ish" doirasida.
// ============================================================================
const { mongoose } = require('./connection');
const { Schema } = mongoose;

const caseEventSchema = new Schema(
  {
    type: { type: String, enum: ['message', 'document', 'audit', 'note'], required: true },
    summary: { type: String, required: true }, // QISQA tasvir, to'liq matn emas
    refId: { type: Schema.Types.ObjectId, default: null }, // bog'liq Chat/Document/Audit ID'si
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const caseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // B2C bo'lsa
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', default: null }, // B2B bo'lsa
    scope: { type: String, enum: ['b2c', 'b2b'], default: 'b2c' },
    title: { type: String, required: true }, // masalan "Ijara shartnomasi nizosi -- ABC MChJ"
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    jurisdictionId: { type: String, default: 'UZ' },
    // AI tomonidan avtomatik yangilanadigan, doim QISQA (taxminan 500-800
    // so'z) xulosa -- ishning hozirgi holati, asosiy faktlar, qolgan
    // qadamlar. Bu -- "uzluksiz xotira"ning markazi.
    summary: { type: String, default: '' },
    // Ishga tegishli barcha hodisalar tarixi (qisqa yozuvlar, to'liq matn emas)
    timeline: { type: [caseEventSchema], default: [] },
    // Bu ish doirasidagi barcha Chat suhbatlari (ko'p bo'lishi mumkin)
    chatIds: { type: [Schema.Types.ObjectId], ref: 'Chat', default: [] },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

caseSchema.index({ userId: 1, status: 1 });
caseSchema.index({ organizationId: 1, status: 1 });
caseSchema.virtual('id').get(function () { return this._id.toString(); });
caseSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret; },
});

module.exports = mongoose.models.Case || mongoose.model('Case', caseSchema);
