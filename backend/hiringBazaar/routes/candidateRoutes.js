import express from 'express';
import {
  addCandidate,
  bulkUploadCandidates,
  getCandidatesByJob,
  updateCandidateFeedback,
  getMyCandidates,
  deleteCandidate,
  getCandidateById
} from '../controllers/candidateController.js';

import { protect, isAdmin, isHR } from '../middlewares/auth.js';
import { upload } from '../../shared/middlewares/upload.js';

const router = express.Router();

// router.use(protect, isAdmin);

router.post('/', upload.single('resume'), protect, isAdmin, addCandidate);
router.post('/bulk', upload.array('resumes', 100), protect, isAdmin, bulkUploadCandidates);
router.get('/my-candidates', protect, getMyCandidates);
router.get('/job/:jobId', protect, getCandidatesByJob);
router.get('/:id', protect, getCandidateById);
router.put('/:id/feedback', protect, updateCandidateFeedback);

router.delete('/:id', protect, isAdmin, deleteCandidate);
router.post('/:id/reparse', protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { Candidate } = await import('../models/Candidate.js');
    const { pdfQueue } = await import('../../shared/services/queueService.js');

    const candidate = await Candidate.findById(id);
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });

    candidate.parsingStatus = 'PENDING';
    candidate.parsingStatusMessage = 'Re-queued for parsing...';
    candidate.parsingProgress = 0;
    await candidate.save();

    await pdfQueue.add('process-resume', { candidateId: id });

    res.json({ success: true, message: 'Candidate re-queued for parsing' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



export default router;