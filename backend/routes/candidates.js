import express from 'express';
import mongoose from 'mongoose';
import path from 'node:path';
import fs from 'node:fs';
import Candidate from '../models/Candidate.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadResume, handleUploadError } from '../middleware/upload.js';
import * as atsService from '../services/atsService.js';

const router = express.Router();

// Upload resume and calculate ATS score
router.post('/upload-resume',
  authenticate,
  authorize('candidate'),
  uploadResume,
  handleUploadError,
  async (req, res) => {
    try {
      const { resumeText, jobId } = req.body;

      if (!resumeText) {
        return res.status(400).json({ message: 'Resume text is required' });
      }

      // Find or create candidate profile
      let candidate = await Candidate.findOne({ user: req.user._id });

      if (!candidate) {
        candidate = new Candidate({ user: req.user._id });
      }

      // Update candidate data
      candidate.resumeText = resumeText;
      candidate.resumeUrl = req.file ? `/uploads/${req.file.filename}` : candidate.resumeUrl;

      // Calculate ATS score if jobId provided
      if (jobId) {
        const Job = (await import('../models/Job.js')).default;
        const job = await Job.findById(jobId);

        if (job) {
          candidate.atsScore = await atsService.calculateATSScore(resumeText, job.description);
        }
      }

      await candidate.save();

      res.json({
        message: 'Resume uploaded successfully',
        candidate: {
          id: candidate._id,
          resumeUrl: candidate.resumeUrl,
          atsScore: candidate.atsScore,
          resumeText: candidate.resumeText
        }
      });
    } catch (error) {
      console.error('Resume upload error:', error);
      res.status(500).json({ message: 'Server error uploading resume' });
    }
  }
);

// Get recruiter statistics
router.get('/recruiter/stats', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const userId = req.user._id;

    // Get jobs posted by this recruiter
    const Job = (await import('../models/Job.js')).default;
    const jobs = await Job.find({ postedBy: userId });
    const jobIds = jobs.map(job => job._id);

    // Get candidates who applied to this recruiter's jobs
    const candidates = await Candidate.find({
      'appliedJobs.job': { $in: jobIds }
    }).populate('user', 'name email');

    const totalCandidates = candidates.length;
    const shortlistedCandidates = candidates.filter(c => c.shortlisted).length;
    const recentApplications = candidates.filter(c =>
      c.appliedJobs.some(app => new Date(app.appliedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    ).length;

    const averageAtsScore = candidates.length > 0
      ? candidates.reduce((sum, c) => sum + c.atsScore, 0) / candidates.length
      : 0;

    res.json({
      stats: {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(job => job.status === 'active').length,
        totalCandidates,
        shortlistedCandidates,
        recentApplications,
        averageAtsScore: Math.round(averageAtsScore)
      }
    });
  } catch (error) {
    console.error('Get recruiter stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

// Get all candidates (recruiter only)
router.get('/', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const { page = 1, limit = 10, jobId, minScore = 0 } = req.query;

    // Build base query
    let query = {
      cheatingStatus: { $ne: 'rejected_cheating' }
      // 🔥 REMOVED: resumeText: { $exists: true, $ne: '' } 
      // (Relaxing this to see candidates even if resume is not processed)
    };

    // Restrict candidates to those who applied to the recruiter's jobs
    const Job = (await import('../models/Job.js')).default;
    const recruiterJobs = await Job.find({ postedBy: req.user._id }).select('_id');
    const recruiterJobIds = recruiterJobs.map(job => job._id.toString());
    const recruiterJobObjectIds = recruiterJobs.map(job => job._id);

    if (jobId) {
      // Ensure recruiter can only view their job applicants
      if (!recruiterJobIds.includes(jobId.toString())) {
        return res.json({
          candidates: [],
          pagination: {
            current: page,
            pages: 0,
            total: 0
          }
        });
      }
      query['appliedJobs.job'] = new mongoose.Types.ObjectId(jobId);
    } else {
      if (recruiterJobIds.length === 0) {
        return res.json({
          candidates: [],
          pagination: {
            current: page,
            pages: 0,
            total: 0
          }
        });
      }
      query['appliedJobs.job'] = { $in: recruiterJobObjectIds };
    }


    // Filter by ATS score if specified
    if (minScore > 0) {
      query.atsScore = { $gte: parseInt(minScore) };
    }

    const candidates = await Candidate.find(query)
      .populate('user', 'name email profile')
      .populate('appliedJobs.job', 'title location type')
      .sort({ 'appliedJobs.appliedAt': -1, atsScore: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Candidate.countDocuments(query);

    res.json({
      candidates,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get all candidates error:', error);
    res.status(500).json({ message: 'Server error fetching candidates' });
  }
});

// Get ATS-passed candidates (recruiter only)
router.get('/ats-passed', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const { page = 1, limit = 10, minScore = 60 } = req.query;

    const candidates = await Candidate.find({
      atsScore: { $gte: parseInt(minScore) },
      cheatingStatus: { $ne: 'rejected_cheating' }
    })
      .populate('user', 'name email profile')
      .sort({ atsScore: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Candidate.countDocuments({
      atsScore: { $gte: parseInt(minScore) },
      cheatingStatus: { $ne: 'rejected_cheating' }
    });

    res.json({
      candidates,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get ATS passed candidates error:', error);
    res.status(500).json({ message: 'Server error fetching candidates' });
  }
});

// Get candidate profile
router.get('/profile', authenticate, authorize('candidate'), async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user._id })
      .populate('user', 'name email profile')
      .populate('appliedJobs.job', 'title location type');

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    res.json({ candidate });
  } catch (error) {
    console.error('Get candidate profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update candidate profile
router.put('/profile', authenticate, authorize('candidate'), async (req, res) => {
  try {
    const candidate = await Candidate.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'name email profile');

    res.json({
      message: 'Profile updated successfully',
      candidate
    });
  } catch (error) {
    console.error('Update candidate profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Shortlist candidate (recruiter only)
router.post('/:id/shortlist', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    candidate.shortlisted = true;
    candidate.shortlistedBy = req.user._id;
    candidate.shortlistedAt = new Date();

    await candidate.save();
    await candidate.populate('user', 'name email');

    // Send email notification (would integrate with EmailJS here)
    // await emailService.sendShortlistEmail(candidate.user.email, candidate.user.name);

    res.json({
      message: 'Candidate shortlisted successfully',
      candidate
    });
  } catch (error) {
    console.error('Shortlist candidate error:', error);
    res.status(500).json({ message: 'Server error shortlisting candidate' });
  }
});

// Get shortlisted candidates (recruiter only)
router.get('/shortlisted', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const candidates = await Candidate.find({
      shortlisted: true,
      shortlistedBy: req.user._id
    })
      .populate('user', 'name email profile')
      .sort({ shortlistedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Candidate.countDocuments({
      shortlisted: true,
      shortlistedBy: req.user._id
    });

    res.json({
      candidates,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get shortlisted candidates error:', error);
    res.status(500).json({ message: 'Server error fetching shortlisted candidates' });
  }
});

// Get candidate details (recruiter only)
router.get('/:id', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('user', 'name email profile')
      .populate('appliedJobs.job', 'title description location type');

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({ candidate });
  } catch (error) {
    console.error('Get candidate details error:', error);
    res.status(500).json({ message: 'Server error fetching candidate details' });
  }
});

// Download candidate resume (recruiter only)
router.get('/:id/resume', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate || !candidate.resumeUrl) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Convert relative URL to absolute path
    // resumeUrl is stored as /uploads/filename
    const fileName = candidate.resumeUrl.split('/').pop();
    const filePath = path.join(process.cwd(), 'uploads', fileName);

    // Check if file exists
    try {
      await fs.promises.access(filePath);
    } catch (err) {
      console.error('Resume file not found on disk:', filePath);
      return res.status(404).json({ message: 'Resume file not found on server' });
    }

    res.download(filePath, `resume_${candidate._id}.pdf`);
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({ message: 'Server error downloading resume' });
  }
});

export default router;
