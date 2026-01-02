import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName : {type: String, required: true},
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'HR'], default: 'HR' },
  orgName: String,
  address : {type: String, required:true },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);