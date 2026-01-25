import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './shared/config/db.js';
import { env } from './shared/config/env.js';

// Import route modules
import hiringBazaarRoutes from './hiringBazaar/routes/index.js';
import partnerHBRoutes from './partnerHB/routes/index.js';
import adminRoutes from './admin/routes/index.js';

const app = express();
const PORT = env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'HiringBazaar + PartnerHB API',
        systems: {
            hiringBazaar: '/api',
            partnerHB: '/api/partner',
            admin: '/api/admin'
        }
    });
});

// ============================================
// HiringBazaar Routes (existing functionality)
// ============================================
app.use('/api/auth', hiringBazaarRoutes.auth);
app.use('/api/dashboard', hiringBazaarRoutes.dashboard);
app.use('/api/platforms', hiringBazaarRoutes.platforms);
app.use('/api/jobs', hiringBazaarRoutes.jobs);
app.use('/api/candidates', hiringBazaarRoutes.candidates);
app.use('/api/plans', hiringBazaarRoutes.plans);
// app.use('/api/admin', hiringBazaarRoutes.admin); // Moved to centralized admin folder

// ============================================
// PartnerHB Routes (new partner functionality)
// ============================================
app.use('/api/partner/auth', partnerHBRoutes.auth);
app.use('/api/partner', partnerHBRoutes.partner);
app.use('/api/partner/jobs', partnerHBRoutes.jobs);

// ============================================
// Admin Routes (centralized admin)
// ============================================
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum size is 100MB'
        });
    }

    if (err.message && err.message.includes('Only PDF, DOC, DOCX')) {
        return res.status(400).json({
            success: false,
            message: 'Only PDF, DOC, DOCX files are allowed'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, async () => {
    await connectDB();
    console.log(`🚀 Server running on port ${PORT}`);

    // Start background worker
    try {
        const { pdfWorker } = await import('./shared/workers/parsingWorker.js');
        console.log('👷 Background worker started');
    } catch (error) {
        console.error('❌ Failed to start background worker:', error);
    }

    console.log(`📡 HiringBazaar API: http://localhost:${PORT}/api`);
    console.log(`🤝 PartnerHB API: http://localhost:${PORT}/api/partner`);
    console.log(`👑 Admin API: http://localhost:${PORT}/api/admin`);
    console.log(`📦 MongoDB: ${env.MONGO_URI || 'mongodb://127.0.0.1:27017/hirespark'}`);
});
