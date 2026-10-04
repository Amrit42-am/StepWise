import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mode: { type: String, enum: ['approach', 'code'], required: true },
  problem: { type: String, required: true },
  code: { type: String },
  language: { type: String },
  hintLevel: { type: Number, default: 0 },
  hints: { type: [String], default: [] },
  conversation: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

sessionSchema.index({ user: 1, createdAt: -1 });

const Session = mongoose.model('Session', sessionSchema);
export default Session;
