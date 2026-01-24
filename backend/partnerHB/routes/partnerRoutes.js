import express from 'express';
import { getPartnerUploads } from '../controllers/partnerJobController.js';
import { protectPartner } from '../middlewares/partnerAuth.js';

const router = express.Router();

// All routes are protected
router.use(protectPartner);

router.get('/uploads', getPartnerUploads);

export default router;
