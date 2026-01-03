import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import platformRoutes from './routes/platformRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import planRoutes from './routes/planRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { env } from 'process';

const app = express();
const PORT = env.PORT || 3000;

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for resumes)
// uploads folder is located at project root `backend/uploads`, so serve from one level up
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'HR Recruitment API is running...',
    endpoints: {
      auth: '/api/auth',
      platforms: '/api/platforms',
      jobs: '/api/jobs',
      candidates: '/api/candidates',
      plans: '/api/plans'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/plans', planRoutes);
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

  // Multer file upload error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size too large. Maximum size is 5MB'
    });
  }

  if (err.message.includes('Only PDF, DOC, DOCX')) {
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
app.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}`);
  console.log(`📦 MongoDB: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hirespark'}`);
});