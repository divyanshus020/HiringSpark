import mongoose from 'mongoose';

const jobPartnerMappingSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner',
        required: true
    },
    sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Compound index to prevent duplicate mappings
jobPartnerMappingSchema.index({ jobId: 1, partnerId: 1 }, { unique: true });

export const JobPartnerMapping = mongoose.model('JobPartnerMapping', jobPartnerMappingSchema);
