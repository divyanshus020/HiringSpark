import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    sparse: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['ADMIN', 'HR'],
    default: 'HR',
    required: true
  },

  // HR specific fields
  companyName: {
    type: String
  },
  orgName: String, // Legacy field, kept for compatibility
  address: {
    type: String
  },

  // Common fields
  isActive: {
    type: Boolean,
    default: true
  },

  // Password reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Metadata
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
// Note: email index is auto-created by unique: true
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for checking if user is admin
userSchema.virtual('isAdmin').get(function () {
  return this.role === 'ADMIN';
});

// Virtual for checking if user is HR
userSchema.virtual('isHR').get(function () {
  return this.role === 'HR';
});

// Method to update last login
userSchema.methods.updateLoginInfo = function () {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

// Don't return password in JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpire;
    return ret;
  }
});

export const User = mongoose.model('User', userSchema);