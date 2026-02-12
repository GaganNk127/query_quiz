import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Job from '../models/Job.js';
import Candidate from '../models/Candidate.js';

const router = express.Router();

router.get('/recruiter/dashboard', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .select('_id title status applicants createdAt type location')
      .sort({ createdAt: -1 })
      .lean();

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const totalApplications = jobs.reduce((sum, job) => sum + (job.applicants?.length || 0), 0);
    const jobIds = jobs.map(job => job._id);

    let appliedCandidates = [];
    if (jobIds.length > 0) {
      appliedCandidates = await Candidate.find({
        'appliedJobs.job': { $in: jobIds }
      })
        .populate('user', 'name email profile')
        .sort({ updatedAt: -1 })
        .lean();
    }

    const totalCandidates = appliedCandidates.length;
    const shortlisted = appliedCandidates.filter(candidate => candidate.shortlisted).length;
    const averageAtsScore = totalCandidates > 0
      ? Math.round(appliedCandidates.reduce((sum, candidate) => sum + (candidate.atsScore || 0), 0) / totalCandidates)
      : 0;
    const completedQuizzes = appliedCandidates.filter(candidate => candidate.quizScore > 0).length;
    const averageQuizScore = completedQuizzes > 0
      ? Math.round(appliedCandidates.reduce((sum, candidate) => sum + (candidate.quizScore || 0), 0) / completedQuizzes)
      : 0;
    const cheatingDetected = appliedCandidates.filter(candidate => candidate.cheatingStatus && candidate.cheatingStatus !== 'none').length;

    const recentCandidates = appliedCandidates.slice(0, 5);
    const recentJobs = jobs.slice(0, 5);

    const pendingMessages = appliedCandidates.filter(candidate =>
      candidate.appliedJobs?.some(app => app.status === 'pending')
    ).length;

    res.status(200).json({
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        totalCandidates,
        shortlisted,
        averageAtsScore,
        completedQuizzes,
        averageQuizScore,
        cheatingDetected,
        messages: pendingMessages,
        notifications: Math.min(totalApplications, 5)
      },
      recentCandidates,
      recentJobs
    });
  } catch (error) {
    console.error('Recruiter dashboard error:', error);
    res.status(500).json({ message: 'Failed to load recruiter dashboard' });
  }
});

router.get('/candidate/dashboard', authenticate, authorize('candidate'), async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user._id })
      .populate({
        path: 'appliedJobs.job',
        select: 'title location type experience status company'
      })
      .lean();

    const stats = {
      atsScore: candidate?.atsScore || 0,
      quizScore: candidate?.quizScore || 0,
      totalApplications: candidate?.appliedJobs?.length || 0,
      shortlisted: candidate?.appliedJobs?.filter(app => app.status === 'shortlisted').length || 0,
      interviews: candidate?.appliedJobs?.filter(app => app.status === 'reviewed').length || 0,
      messages: 0,
      notifications: candidate?.appliedJobs?.filter(app => app.status === 'pending').length || 0
    };

    const recentApplications = (candidate?.appliedJobs || [])
      .slice(-5)
      .reverse();

    const recommendedJobs = await Job.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title company location type experience status createdAt')
      .lean();

    res.status(200).json({
      stats,
      recentApplications,
      recommendedJobs
    });
  } catch (error) {
    console.error('Candidate dashboard error:', error);
    res.status(500).json({ message: 'Failed to load candidate dashboard' });
  }
});

export default router;
