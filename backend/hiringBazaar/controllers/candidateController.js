import { Candidate } from '../models/Candidate.js';
import { Job } from '../models/Job.js';
import { extractTextFromFile } from '../../shared/services/extractionService.js';
import { extractResumeInfo } from '../../shared/services/aiService.js';
import path from 'path';
import { User } from '../models/User.js';

/**
 * Redacts sensitive candidate info if contact visibility is disabled for HR.
 */
function applyPrivacyFilters(candidate, user) {
  if (!candidate) return null;

  // Admins can see everything
  if (user.role === 'ADMIN') return candidate;

  const jobId = candidate.jobId;
  const isVisible = jobId && jobId.contactDetailsVisible === true;

  if (!isVisible) {
    const candidateObj = candidate.toObject ? candidate.toObject() : { ...candidate };
    const masked = {
      ...candidateObj,
      email: 'hidden@hiringspark.com',
      phoneNumber: '+91-XXXXXXXXXX',
      resumeUrl: '', // Hide resume URL
      basicInfo: {
        ...(candidateObj.basicInfo || {}),
        email: 'hidden@hiringspark.com',
        phone: '+91-XXXXXXXXXX',
        linkedin: '',
        github: '',
        links: []
      }
    };
    return masked;
  }

  return candidate;
}

/**
 * Shared Direct Parser Logic (Bypasses Queue)
 */
async function processDirectly(candidateId) {
  try {
    const candidate = await Candidate.findById(candidateId).populate('jobId');
    if (!candidate) return;

    candidate.parsingStatus = 'PROCESSING';
    candidate.parsingProgress = 20;
    await candidate.save();

    let relPath = candidate.resumeUrl.startsWith('/') ? candidate.resumeUrl.substring(1) : candidate.resumeUrl;
    const absPath = path.join(process.cwd(), relPath);

    // 1. Extract Text
    const { text, links } = await extractTextFromFile(absPath);

    candidate.parsingProgress = 50;
    await candidate.save();

    // 2. AI Analysis
    const jobContext = {
      title: candidate.jobId?.jobTitle || '',
      skillsRequired: candidate.jobId?.skills || [],
      description: candidate.jobId?.description || ''
    };

    const parsed = await extractResumeInfo(text, links, jobContext);

    // 3. Update DB
    candidate.name = parsed.basic_info.full_name || candidate.name;
    candidate.email = (parsed.basic_info.email && parsed.basic_info.email !== 'pending@parsing.com') ? parsed.basic_info.email.toLowerCase() : candidate.email;
    candidate.phoneNumber = parsed.basic_info.phone || candidate.phoneNumber;

    candidate.basicInfo = {
      fullName: parsed.basic_info.full_name,
      jobTitle: parsed.basic_info.job_title,
      location: parsed.basic_info.location,
      email: parsed.basic_info.email,
      phone: parsed.basic_info.phone,
      linkedin: parsed.basic_info.linkedin,
      github: parsed.basic_info.github,
      links: parsed.basic_info.links || [],
      experienceYears: parsed.basic_info.experience_years
    };

    candidate.executiveSummary = parsed.executive_summary?.ai_generated_summary;
    candidate.education = parsed.education;
    candidate.workExperience = parsed.work_experience;
    candidate.skills = {
      technicalSkills: parsed.skills?.technical_skills,
      softSkills: parsed.skills?.soft_skills
    };
    candidate.aiAssessment = {
      technicalFit: parsed.ai_assessment?.technical_fit,
      culturalFit: parsed.ai_assessment?.cultural_fit,
      overallScore: parsed.ai_assessment?.overall_score,
      strengths: parsed.ai_assessment?.strengths,
      areasForGrowth: parsed.ai_assessment?.areas_for_growth
    };
    candidate.atsScore = parsed.ai_assessment?.overall_score || 0;
    candidate.isParsed = true;
    candidate.parsingStatus = 'COMPLETED';
    candidate.parsingProgress = 100;
    candidate.parsingStatusMessage = 'Parsed successfully';

    await candidate.save();
    console.log(`✅ Parsed: ${candidate.name}`);
  } catch (err) {
    console.error(`❌ Parse Error (${candidateId}):`, err.message);
    await Candidate.findByIdAndUpdate(candidateId, {
      parsingStatus: 'FAILED',
      parsingStatusMessage: err.message,
      parsingProgress: 0
    });
  }
}

// @desc    Add single candidate
export const addCandidate = async (req, res) => {
  try {
    const { jobId, name, email, phoneNumber, source } = req.body;
    const resumeUrl = req.file ? `/uploads/resumes/${req.file.filename}` : null;
    if (!resumeUrl) return res.status(400).json({ success: false, message: 'File required' });

    const candidate = await Candidate.create({
      jobId, addedBy: req.user.id, name, email, phoneNumber, resumeUrl,
      source: source || 'MANUAL_UPLOAD',
      uploadSource: req.user.role.toLowerCase(),
      uploaderId: req.user.id,
      uploaderModel: 'User',
      uploaderDetails: { name: req.user.fullName, uploaderType: req.user.role.toLowerCase() }
    });

    // Trigger Direct Processing (Async but no queue)
    processDirectly(candidate._id);

    res.status(201).json({ success: true, candidate });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

// @desc    Bulk upload (Direct parallel parsing)
export const bulkUploadCandidates = async (req, res) => {
  try {
    const { jobId, source } = req.body;
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'No files' });

    const candidatesData = req.files.map(file => ({
      jobId, addedBy: req.user.id, name: file.originalname.split('.')[0],
      email: 'pending@parsing.com', resumeUrl: `/uploads/resumes/${file.filename}`,
      source: source || 'BULK_UPLOAD',
      uploadSource: req.user.role.toLowerCase(),
      uploaderId: req.user.id,
      uploaderModel: 'User',
      uploaderDetails: { name: req.user.fullName, uploaderType: req.user.role.toLowerCase() },
      parsingStatus: 'PROCESSING'
    }));

    const created = await Candidate.insertMany(candidatesData);

    // 🔥 PARALLEL DIRECT PARSING: No queue. 
    // We trigger all at once. Node handles the promises.
    created.forEach(c => processDirectly(c._id));

    res.status(201).json({
      success: true,
      message: `${created.length} resumes are being parsed simultaneously.`,
      candidates: created
    });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

export const getCandidatesByJob = async (req, res) => {
  try {
    const candidates = await Candidate.find({ jobId: req.params.jobId })
      .populate('jobId')
      .sort({ atsScore: -1 });

    const filteredCandidates = candidates.map(c => applyPrivacyFilters(c, req.user));
    res.json({ success: true, candidates: filteredCandidates });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

export const updateCandidateFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, { hrFeedback: feedback }, { new: true }).populate('jobId');

    // Trigger Shortlist Email Notification
    if (feedback === 'SHORTLISTED' || feedback === 'Shortlisted by HB') {
      try {
        const { emailQueue } = await import('../../shared/services/queueService.js');
        await emailQueue.add('candidate-shortlisted', {
          type: 'candidate-shortlisted',
          data: {
            candidateEmail: candidate.email || candidate.basicInfo?.email,
            candidateName: candidate.name || candidate.basicInfo?.fullName,
            jobTitle: candidate.jobId?.jobTitle || 'Job Position',
            companyName: candidate.jobId?.companyName || ''
          }
        });
        console.log(`[CandidateController] 📧 Shortlist email queued for: ${candidate.email}`);
      } catch (queueErr) {
        console.error('[CandidateController] ❌ Failed to queue shortlist email:', queueErr.message);
      }
    }

    res.json({ success: true, candidate });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

export const getMyCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({ addedBy: req.user.id })
      .populate('jobId')
      .sort({ createdAt: -1 });

    const filteredCandidates = candidates.map(c => applyPrivacyFilters(c, req.user));
    res.json({ success: true, candidates: filteredCandidates });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

export const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('jobId');
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });

    const filteredCandidate = applyPrivacyFilters(candidate, req.user);
    res.json({ success: true, candidate: filteredCandidate });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};
