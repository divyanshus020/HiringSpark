import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName : {type: String, required: true},
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'HR'], default: 'HR' },
  orgName: String,
  name: String
}, { timestamps: true });

userSchema.index({ email: 1 });

export const User = mongoose.model('User', userSchema);