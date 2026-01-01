import mongoose from 'mongoose';

const platformSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, 
  currentPrice: { type: Number, required: true },
  unit: { type: String, enum: ['PER_DAY', 'PER_MONTH', 'FIXED', 'FREE'] },
  isActive: { type: Boolean, default: true }
});

export const Platform = mongoose.model('Platform', platformSchema);