// models/SecurityIncident.js
// ============================================================================
// XAVFSIZLIK HODISALARI JURNALI (Breach Notification Log) -- agar
// ma'lumotlar sizib chiqishi (data breach) yoki boshqa xavfsizlik hodisasi
// yuz bersa, BU YERDA qayd etiladi va kuzatiladi.
//
// NEGA BU KERAK: ko'pchilik shaxsiy ma'lumotlar qonunlari (jumladan
// O'zbekiston "Shaxsga doir ma'lumotlar to'g'risida"gi Qonuni va
// xalqaro amaliyot) sizib chiqish yuz berganda MA'LUM MUDDAT ICHIDA
// (odatda 72 soat -- aniq muddat YURISTINGIZ bilan tasdiqlanishi kerak)
// tegishli organlarga va/yoki ta'sirlangan foydalanuvchilarga xabar
// berishni talab qiladi. Agar bu muddat va jarayon HUJJATLASHTIRILMAGAN
// bo'lsa, "biz bilmagandik" degan himoya ishlamaydi.
//
// BU MODUL NIMA QILMAYDI: bu o'zi xavfsizlik hodisasini OLDINI OLMAYDI
// yoki AVTOMATIK ANIQLAMAYDI -- bu shunchaki "agar hodisa yuz bersa,
// qanday harakat qilganimiz" jurnali. Haqiqiy javob choralari (kim
// nima qiladi, qaysi muddatda) ALOHIDA, yurist tasdiqlagan runbook
// orqali belgilanishi kerak -- bu yerda faqat shu jarayonning STATUSI
// va VAQT BELGILARI saqlanadi.
// ============================================================================
const { mongoose } = require('./connection');
const { Schema } = mongoose;

const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'];
const INCIDENT_STATUSES = ['detected', 'investigating', 'contained', 'notified', 'resolved'];

const timelineEntrySchema = new Schema(
  {
    status: { type: String, enum: INCIDENT_STATUSES, required: true },
    note: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const securityIncidentSchema = new Schema(
  {
    title: { type: String, required: true },
    severity: { type: String, enum: SEVERITY_LEVELS, required: true },
    description: { type: String, required: true },
    // Ta'sirlangan ma'lumot turlari (masalan "email", "parol xeshi",
    // "shartnoma matni") -- aniq KIMLAR emas, balki QANDAY ma'lumot.
    affectedDataTypes: { type: [String], default: [] },
    // Taxminan necha foydalanuvchi/tashkilot ta'sirlangani.
    estimatedAffectedCount: { type: Number, default: 0 },
    status: { type: String, enum: INCIDENT_STATUSES, default: 'detected' },
    detectedAt: { type: Date, default: Date.now },
    // MUHIM SANALAR -- huquqiy muddatlarni kuzatish uchun:
    authorityNotifiedAt: { type: Date, default: null }, // tegishli davlat organi xabardor qilingan sana
    usersNotifiedAt: { type: Date, default: null }, // ta'sirlangan foydalanuvchilar xabardor qilingan sana
    resolvedAt: { type: Date, default: null },
    timeline: { type: [timelineEntrySchema], default: [] },
    createdBy: { type: String, default: 'admin' }, // admin panelda yagona parol ishlatilgani uchun, ism emas
  },
  { timestamps: true }
);

securityIncidentSchema.index({ status: 1 });
securityIncidentSchema.index({ detectedAt: -1 });
securityIncidentSchema.virtual('id').get(function () { return this._id.toString(); });
securityIncidentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret; },
});

module.exports = mongoose.models.SecurityIncident || mongoose.model('SecurityIncident', securityIncidentSchema);
module.exports.SEVERITY_LEVELS = SEVERITY_LEVELS;
module.exports.INCIDENT_STATUSES = INCIDENT_STATUSES;
