import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  hrId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  planType: { type: String, enum: ['BASIC', 'PREMIUM'], required: true },

  // BASIC PLAN SELECTIONS
  // We store the ID to know which platform it is, 
  // but we store the PRICE so it never changes for this specific bill.
  customSelections: [{
    platformId: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform' },
    name: String,     
    priceAtTime: Number,
    duration: { type: Number, default: 1 } 
  }],

  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'PAYMENT_PENDING' }
}, { timestamps: true });

export const Job = mongoose.model('Job', jobSchema);