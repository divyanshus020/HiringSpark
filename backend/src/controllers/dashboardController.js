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

    // 1. Job Statistics
    const jobStats = await Job.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          weeklyJobs: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', startOfWeek] }, 1, 0]
            }
          }
        }
      }
    ]);

    const jobStatsObj = {};
    let weeklyJobGrowth = 0;
    jobStats.forEach(stat => {
      jobStatsObj[stat._id] = stat.count;
      weeklyJobGrowth += stat.weeklyJobs || 0;
    });

    // Unify Job Statuses
    const activeJobs = (jobStatsObj.active || 0) + (jobStatsObj.posted || 0);
    const pendingReviewJobs = jobStatsObj.pending || 0;
    const draftJobs = jobStatsObj.draft || 0;
    const rejectedJobs = jobStatsObj.rejected || 0;
    const totalJobs = Object.values(jobStatsObj).reduce((a, b) => a + b, 0);

    // 2. Candidate Statistics
    const candidateStats = await Candidate.aggregate([
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
      {
        $group: {
          _id: '$hrFeedback',
          count: { $sum: 1 },
          todayCount: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', today] }, 1, 0]
            }
          },
          monthlyHires: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ['$hrFeedback', ['HIRED', 'Hired']] },
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

    const candidateStatsObj = {};
    let dailyNewApplicants = 0;
    let hiredThisMonth = 0;

    candidateStats.forEach(stat => {
      candidateStatsObj[stat._id] = stat.count;
      dailyNewApplicants += stat.todayCount || 0;
      if (['HIRED', 'Hired'].includes(stat._id)) {
        hiredThisMonth += stat.monthlyHires || 0;
      }
    });

    // Unify Candidate Statuses
    const totalApplicants = Object.values(candidateStatsObj).reduce((a, b) => a + b, 0);
    const pendingReviewCandidates = (candidateStatsObj.PENDING || 0) + (candidateStatsObj['Pending Review'] || 0);
    const interviewScheduled = (candidateStatsObj.INTERVIEW_SCHEDULED || 0) + (candidateStatsObj.Interviewed || 0);
    const hiredTotal = (candidateStatsObj.HIRED || 0) + (candidateStatsObj.Hired || 0);
    const rejectedCandidates = (candidateStatsObj.REJECTED || 0) + (candidateStatsObj.Rejected || 0);
    const shortlistedCandidates = (candidateStatsObj['Shortlisted by HR'] || 0) + (candidateStatsObj['Shortlisted by HB'] || 0);

    // 3. Urgent Positions
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const urgentPositions = await Job.countDocuments({
      userId: userId,
      status: { $in: ['posted', 'active'] },
      preferredDate: {
        $lte: threeDaysFromNow,
        $gte: new Date()
      }
    });

    // 4. Calculate Monthly Growth
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
          hrFeedback: { $in: ['HIRED', 'Hired'] },
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      { $count: 'count' }
    ]);

    const lastMonthHiredCount = hiredLastMonth[0]?.count || 0;
    const monthlyGrowth = lastMonthHiredCount > 0
      ? (((hiredThisMonth - lastMonthHiredCount) / lastMonthHiredCount) * 100).toFixed(1)
      : hiredThisMonth > 0 ? '100.0' : '0.0';

    // 5. Recent Activities
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
      { $limit: 10 },
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
          color: 'blue'
        },
        totalApplicants: {
          value: totalApplicants,
          change: `+${dailyNewApplicants} today`,
          icon: '👥',
          color: 'green'
        },
        pendingReview: {
          value: pendingReviewJobs,
          change: `${urgentPositions} urgent`,
          icon: '⏳',
          color: 'orange'
        },
        pendingCandidates: {
          value: pendingReviewCandidates,
          change: `+${dailyNewApplicants} today`,
          icon: '👥',
          color: 'yellow'
        },
        hiredThisMonth: {
          value: hiredThisMonth,
          change: `${monthlyGrowth}%`,
          icon: '✅',
          color: 'purple'
        }
      },

      details: {
        jobs: {
          total: totalJobs,
          active: activeJobs,
          draft: draftJobs,
          pending: pendingReviewJobs,
          rejected: rejectedJobs
        },
        candidates: {
          total: totalApplicants,
          pending: pendingReviewCandidates,
          interview: interviewScheduled,
          hired: hiredTotal,
          rejected: rejectedCandidates,
          shortlisted: shortlistedCandidates
        }
      },

      recentActivities: {
        jobs: recentJobs.map(job => ({
          id: job._id,
          title: job.jobTitle,
          company: job.companyName,
          status: job.status,
          time: formatTimeAgo(job.updatedAt)
        })),
        candidates: recentCandidates.map(candidate => ({
          id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          source: candidate.source,
          status: candidate.hrFeedback,
          jobTitle: candidate.jobTitle,
          time: formatTimeAgo(candidate.createdAt)
        }))
      },

      charts: {
        candidateStatus: [
          { status: 'Pending', count: pendingReviewCandidates, color: '#F59E0B' },
          { status: 'Shortlisted', count: shortlistedCandidates, color: '#8B5CF6' },
          { status: 'Interview', count: interviewScheduled, color: '#3B82F6' },
          { status: 'Hired', count: hiredTotal, color: '#10B981' },
          { status: 'Rejected', count: rejectedCandidates, color: '#EF4444' }
        ],
        jobStatus: [
          { status: 'Active', count: activeJobs, color: '#10B981' },
          { status: 'Draft', count: draftJobs, color: '#6B7280' },
          { status: 'Pending', count: pendingReviewJobs, color: '#F59E0B' },
          { status: 'Rejected', count: rejectedJobs, color: '#EF4444' }
        ]
      }
    };

    res.json({
      success: true,
      dashboard: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard statistics'
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