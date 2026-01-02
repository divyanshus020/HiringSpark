import { User } from '../models/User.js';
import { Platform } from '../models/Platform.js';
import { Job } from '../models/Job.js';
import { Candidate } from '../models/Candidate.js';

// --- ADMIN DASHBOARD STATS ---
export const getAdminStats = async (req, res) => {
  try {
    const totalHRs = await User.countDocuments({ role: 'HR' });
    const totalJobs = await Job.countDocuments();
    const totalCandidates = await Candidate.countDocuments();

    res.json({
      success: true,
      data: {
        totalHRs,
        totalJobs,
        totalCandidates
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// --- HR USER MANAGEMENT (RUD) ---
export const getAllHRs = async (req, res) => {
  try {
    const hrs = await User.find({ role: 'HR' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: hrs.length, hrs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHRById = async (req, res) => {
  try {
    const hr = await User.findOne({ _id: req.params.id, role: 'HR' }).select('-password');
    if (!hr) return res.status(404).json({ success: false, message: 'HR not found' });
    res.json({ success: true, hr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateHR = async (req, res) => {
  try {
    const { isActive, fullName, orgName, address } = req.body;
    const hr = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'HR' },
      { isActive, fullName, orgName, address },
      { new: true }
    ).select('-password');

    if (!hr) return res.status(404).json({ success: false, message: 'HR not found' });
    res.json({ success: true, hr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHRAndData = async (req, res) => {
  try {
    const hrId = req.params.id;

    // 1. Check if HR exists
    const hr = await User.findOne({ _id: hrId, role: 'HR' });
    if (!hr) return res.status(404).json({ success: false, message: "HR not found" });

    // 2. Find all jobs by this HR to clean up candidates
    const hrJobs = await Job.find({ userId: hrId });
    const jobIds = hrJobs.map(job => job._id);

    // 3. Delete all candidates associated with those jobs
    await Candidate.deleteMany({ jobId: { $in: jobIds } });

    // 4. Delete all jobs associated with this HR
    await Job.deleteMany({ userId: hrId });

    // 5. Finally, delete the HR user
    await User.findByIdAndDelete(hrId);

    res.json({
      success: true,
      message: `HR ${hr.email} and all associated jobs/candidates deleted successfully.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- PLATFORM MANAGEMENT (CRUD) ---
export const updatePlatform = async (req, res) => {
  try {
    const { currentPrice, isActive, name, unit } = req.body;
    const platform = await Platform.findByIdAndUpdate(
      req.params.id,
      { currentPrice, isActive, name, unit },
      { new: true }
    );
    if (!platform) return res.status(404).json({ success: false, message: 'Platform not found' });
    res.json({ success: true, platform });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- GLOBAL VIEW (Master Read) ---
export const getAllCandidatesMaster = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate('jobId', 'jobTitle')
      .populate('addedBy', 'fullName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: candidates.length, candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAllJobsMaster = async (req, res) => {
  try {
    // Admin sees every job from every HR
    const jobs = await Job.find()
      .populate('userId', 'fullName email orgName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ success: false, message: 'Not found' });

    // In a real app, you'd also delete the file from /uploads/resumes/ here
    await candidate.deleteOne();
    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};