import express from 'express';
import adminPartnerRoutes from './adminPartnerRoutes.js';
import adminJobSharingRoutes from './adminJobSharingRoutes.js';
import hiringBazaarAdminRoutes from './hiringBazaarAdminRoutes.js';

const router = express.Router();

router.use('/partners', adminPartnerRoutes);
router.use('/job-sharing', adminJobSharingRoutes);
router.use('/', hiringBazaarAdminRoutes); // Mounting the main HB admin routes at root of /api/admin

export default router;
