import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // 'basic', 'premium'
  displayName: { type: String, required: true },
  description: { type: String },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Plan = mongoose.model('Plan', planSchema);