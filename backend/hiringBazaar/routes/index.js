import authRoutes from './authRoutes.js';
import jobRoutes from './jobRoutes.js';
import candidateRoutes from './candidateRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import planRoutes from './planRoutes.js';
import platformRoutes from './platformRoutes.js';
import chatRoutes from './chatRoutes.js';

export default {
    auth: authRoutes,
    jobs: jobRoutes,
    candidates: candidateRoutes,
    dashboard: dashboardRoutes,
    plans: planRoutes,
    platforms: platformRoutes,
    chat: chatRoutes
};
