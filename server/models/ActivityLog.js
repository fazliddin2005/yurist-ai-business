// models/ActivityLog.js
// Super admin panel uchun faollik jurnali. MAXFIYLIK: bu yerda hech qachon
// AI chat matni, hujjat matni yoki boshqa shaxsiy mazmun saqlanmaydi --
// faqat amal turi va statistik metadata.
const { mongoose } = require('./connection');
const { Schema } = mongoose;

const activityLogSchema = new Schema(
  {
    type: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    userLabel: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ type: 1 });
activityLogSchema.virtual('id').get(function () { return this._id.toString(); });
activityLogSchema.set('toJSON', { virtuals: true, transform: (d, r) => { delete r._id; delete r.__v; return r; } });

module.exports = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
