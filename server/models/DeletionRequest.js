// models/DeletionRequest.js
// ============================================================================
// "HISOBNI O'CHIRISH" so'rovlarini kuzatish -- 30 kunlik fikr o'zgartirish
// muddatini (grace period) amalga oshirish uchun.
//
// ISHLASH TARTIBI:
//   1. Foydalanuvchi "hisobimni o'chir" tugmasini bosadi.
//   2. DeletionRequest yozuvi yaratiladi, scheduledPurgeAt = hozir + 30 kun.
//      Foydalanuvchi HALI HAM tizimga kira oladi -- agar fikrini o'zgartirsa,
//      so'rovni bekor qilishi mumkin.
//   3. Har kuni (yoki server ishga tushganda) bir tekshiruv funksiyasi
//      scheduledPurgeAt o'tgan barcha so'rovlarni topadi va HAQIQIY,
//      QAYTARILMAS o'chirishni amalga oshiradi.
// ============================================================================
const { mongoose } = require('./connection');
const { Schema } = mongoose;

const deletionRequestSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requestedAt: { type: Date, default: Date.now },
    scheduledPurgeAt: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'cancelled', 'completed'], default: 'pending' },
    cancelledAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    requestedIp: { type: String, default: null }, // qaysi IP'dan so'ralgani (dalil uchun)
  },
  { timestamps: true }
);

deletionRequestSchema.index({ userId: 1 });
deletionRequestSchema.index({ status: 1, scheduledPurgeAt: 1 });
deletionRequestSchema.virtual('id').get(function () { return this._id.toString(); });
deletionRequestSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret; },
});

module.exports = mongoose.models.DeletionRequest || mongoose.model('DeletionRequest', deletionRequestSchema);
