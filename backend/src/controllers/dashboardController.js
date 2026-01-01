import { Job } from '../models/Job.js';
import { Candidate } from '../models/Candidate.js';
import mongoose from 'mongoose';

// @desc    Get HR Dashboard Statistics
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - 7);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // 1. Job Statistics - Single Aggregation
    const jobStats = await Job.aggregate([
      // Match user's jobs
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      
      // Group by status
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          // Get jobs created this week
          weeklyJobs: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', startOfWeek] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    // Convert to object
    const jobStatsObj = {};
    let weeklyJobGrowth = 0;
    jobStats.forEach(stat => {
      jobStatsObj[stat._id] = stat.count;
      weeklyJobGrowth += stat.weeklyJobs || 0;
    });
    
    const activeJobs = jobStatsObj.posted || 0;
    const totalJobs = Object.values(jobStatsObj).reduce((a, b) => a + b, 0);
    const pendingReviewJobs = jobStatsObj.pending || 0;
    const draftJobs = jobStatsObj.draft || 0;
    
    // 2. Candidate Statistics - Single Aggregation
    const candidateStats = await Candidate.aggregate([
      // Get candidates through user's jobs
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'jobInfo'
        }
      },
      { $unwind: '$jobInfo' },
      
      // Filter by user
      { $match: { 'jobInfo.userId': new mongoose.Types.ObjectId(userId) } },
      
      // Group by feedback status
      {
        $group: {
          _id: '$hrFeedback',
          count: { $sum: 1 },
          // Count today's candidates
          todayCount: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', today] },
                1,
                0
              ]
            }
          },
          // Count this month's hires
          monthlyHires: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$hrFeedback', 'HIRED'] },
                    { $gte: ['$createdAt', startOfMonth] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    // Process candidate stats
    const candidateStatsObj = {};
    let dailyNewApplicants = 0;
    let hiredThisMonth = 0;
    
    candidateStats.forEach(stat => {
      candidateStatsObj[stat._id] = stat.count;
      dailyNewApplicants += stat.todayCount || 0;
      if (stat._id === 'HIRED') {
        hiredThisMonth = stat.monthlyHires || 0;
      }
    });
    
    const totalApplicants = Object.values(candidateStatsObj).reduce((a, b) => a + b, 0);
    const pendingReviewCandidates = candidateStatsObj.PENDING || 0;
    const interviewScheduled = candidateStatsObj.INTERVIEW_SCHEDULED || 0;
    const hiredTotal = candidateStatsObj.HIRED || 0;
    const rejected = candidateStatsObj.REJECTED || 0;
    
    // 3. Urgent Positions (jobs with preferred date within 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const urgentPositions = await Job.countDocuments({
      userId: userId,
      status: 'posted',
      preferredDate: { 
        $lte: threeDaysFromNow,
        $gte: new Date()
      }
    });
    
    // 4. Calculate Monthly Growth Percentage
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const hiredLastMonth = await Candidate.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'jobInfo'
        }
      },
      { $unwind: '$jobInfo' },
      {
        $match: {
          'jobInfo.userId': new mongoose.Types.ObjectId(userId),
          hrFeedback: 'HIRED',
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      { $count: 'count' }
    ]);
    
    const lastMonthHiredCount = hiredLastMonth[0]?.count || 0;
    const monthlyGrowth = lastMonthHiredCount > 0 
      ? (((hiredThisMonth - lastMonthHiredCount) / lastMonthHiredCount) * 100).toFixed(1)
      : hiredThisMonth > 0 ? '100.0' : '0.0';
    
    // 5. Recent Activities (last 5 jobs and candidates)
    const recentJobs = await Job.find({ userId: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('jobTitle companyName status updatedAt');
    
    const recentCandidates = await Candidate.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'jobInfo'
        }
      },
      { $unwind: '$jobInfo' },
      { $match: { 'jobInfo.userId': new mongoose.Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: 1,
          email: 1,
          source: 1,
          hrFeedback: 1,
          createdAt: 1,
          jobTitle: '$jobInfo.jobTitle'
        }
      }
    ]);
    
    // 6. Prepare Response
    const response = {
      stats: {
        activeJobs: {
          value: activeJobs,
          change: `+${weeklyJobGrowth} this week`,
          icon: '📊',
          color: 'blue',
          tooltip: 'Active job postings'
        },
        totalApplicants: {
          value: totalApplicants,
          change: `+${dailyNewApplicants} today`,
          icon: '👥',
          color: 'green',
          tooltip: 'Total applicants across all jobs'
        },
        pendingReview: {
          value: pendingReviewCandidates,
          change: `${urgentPositions} urgent`,
          icon: '⏳',
          color: 'orange',
          tooltip: 'Candidates pending review'
        },
        hiredThisMonth: {
          value: hiredThisMonth,
          change: `${monthlyGrowth}%`,
          icon: '✅',
          color: 'purple',
          tooltip: 'Candidates hired this month'
        }
      },
      
      details: {
        jobs: {
          total: totalJobs,
          active: activeJobs,
          draft: draftJobs,
          pending: pendingReviewJobs,
          breakdown: jobStats.map(stat => ({
            status: stat._id,
            count: stat.count
          }))
        },
        candidates: {
          total: totalApplicants,
          pending: pendingReviewCandidates,
          interview: interviewScheduled,
          hired: hiredTotal,
          rejected: rejected,
          breakdown: candidateStats.map(stat => ({
            status: stat._id,
            count: stat.count
          }))
        }
      },
      
      recentActivities: {
        jobs: recentJobs.map(job => ({
          id: job._id,
          title: job.jobTitle,
          company: job.companyName,
          status: job.status,
          time: formatTimeAgo(job.updatedAt),
          timestamp: job.updatedAt
        })),
        candidates: recentCandidates.map(candidate => ({
          id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          source: candidate.source,
          status: candidate.hrFeedback,
          jobTitle: candidate.jobTitle,
          time: formatTimeAgo(candidate.createdAt),
          timestamp: candidate.createdAt
        }))
      },
      
      charts: {
        candidateStatus: [
          { status: 'Pending', count: pendingReviewCandidates, color: '#F59E0B' },
          { status: 'Interview', count: interviewScheduled, color: '#3B82F6' },
          { status: 'Hired', count: hiredTotal, color: '#10B981' },
          { status: 'Rejected', count: rejected, color: '#EF4444' }
        ],
        jobStatus: [
          { status: 'Active', count: activeJobs, color: '#10B981' },
          { status: 'Draft', count: draftJobs, color: '#6B7280' },
          { status: 'Pending', count: pendingReviewJobs, color: '#F59E0B' }
        ]
      }
    };
    
    res.json({
      success: true,
      dashboard: response,
      timestamp: new Date().toISOString(),
      user: {
        id: req.user._id,
        name: req.user.fullName,
        email: req.user.email
      }
    });
    
  } catch (error) {
    console.error('Dashboard API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function
const formatTimeAgo = (date) => {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  });
};