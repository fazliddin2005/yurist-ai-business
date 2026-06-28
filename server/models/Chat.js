// models/Chat.js
// AI Yordamchi suhbat tarixi -- B2C va B2B uchun bitta model, `scope`
// maydoni orqali farqlanadi. Eski JSON nomi "conversations" / "b2b_conversations".
const { mongoose } = require('./connection');
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', default: null }, // B2C bo'lsa null
    scope: { type: String, enum: ['b2c', 'b2b'], default: 'b2c' },
    title: { type: String, default: 'Yangi suhbat' },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

chatSchema.index({ userId: 1, scope: 1 });
chatSchema.index({ organizationId: 1 });
chatSchema.virtual('id').get(function () { return this._id.toString(); });
chatSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret; },
});

module.exports = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
