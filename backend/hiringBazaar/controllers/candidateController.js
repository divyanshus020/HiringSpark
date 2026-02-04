import { Candidate } from '../models/Candidate.js';
import { Job } from '../models/Job.js';
import { extractTextFromFile } from '../../shared/services/extractionService.js';
import { extractResumeInfo } from '../../shared/services/aiService.js';
import path from 'path';

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
    if (!text || text.length < 100) throw new Error('Could not extract text');

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
    const candidates = await Candidate.find({ jobId: req.params.jobId }).sort({ atsScore: -1 });
    res.json({ success: true, candidates });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

export const updateCandidateFeedback = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, { hrFeedback: req.body.feedback }, { new: true });
    res.json({ success: true, candidate });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

export const getMyCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({ addedBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, candidates });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

export const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('jobId');
    res.json({ success: true, candidate });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};
