import express from 'express';
import { getCandidateById, getPartnerUploads } from '../controllers/partnerJobController.js';
import { protectPartner } from '../middlewares/partnerAuth.js';

const router = express.Router();

// All routes are protected
router.use(protectPartner);

router.get('/uploads', getPartnerUploads);
router.get('/uploads/:id', getCandidateById);

export default router;
