import express from 'express';
import Job from '../models/Job.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create job posting (recruiter only)
router.post('/', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user._id
    };

    const job = new Job(jobData);
    await job.save();
    await job.populate('postedBy', 'name email');

    res.status(201).json({
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({ message: 'Server error creating job' });
  }
});

// Get all jobs (public)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      experience,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { status: 'active' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = new RegExp(location, 'i');
    }

    if (experience) {
      query.experience = experience;
    }

    if (type) {
      query.type = type;
    }

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const jobs = await Job.find(query)
      .populate('postedBy', 'name profile')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});

// Get jobs posted by current recruiter
router.get('/my-jobs', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { postedBy: req.user._id };
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ message: 'Server error fetching your jobs' });
  }
});

// Get jobs posted by current recruiter (alternative route)
router.get('/my/postings', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { postedBy: req.user._id };
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ message: 'Server error fetching your jobs' });
  }
});

// Get job by ID (must come after specific routes)
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email profile');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error fetching job' });
  }
});

// Update job (recruiter only - job owner)
router.put('/:id', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');

    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error updating job' });
  }
});

// Delete job (recruiter only - job owner)
router.delete('/:id', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error deleting job' });
  }
});

// Get jobs posted by current recruiter
router.get('/my/postings', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { postedBy: req.user._id };
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ message: 'Server error fetching your jobs' });
  }
});

// Apply for job (candidate only)
router.post('/:id/apply', authenticate, authorize('candidate'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ message: 'Job is not accepting applications' });
    }

    // Check if candidate exists and is restricted
    const Candidate = (await import('../models/Candidate.js')).default;
    let candidate = await Candidate.findOne({ user: req.user._id });

    if (candidate && candidate.restrictionUntil && new Date(candidate.restrictionUntil) > new Date()) {
      return res.status(403).json({ 
        message: `You are restricted from applying to jobs until ${new Date(candidate.restrictionUntil).toLocaleDateString()} due to multiple proctoring violations.`,
        restrictedUntil: candidate.restrictionUntil
      });
    }

    // Check if already applied
    const alreadyApplied = job.applicants.some(
      applicant => applicant.candidate.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Add applicant to job
    job.applicants.push({
      candidate: req.user._id,
      appliedAt: new Date(),
      status: 'pending'
    });

    await job.save();

    // Also update candidate's applied jobs
    // Create candidate profile if it doesn't exist
    if (!candidate) {
      const CandidateModel = (await import('../models/Candidate.js')).default;
      candidate = new CandidateModel({
        user: req.user._id,
        resumeText: '',
        atsScore: 0,
        quizScore: 0
      });
    }

    candidate.appliedJobs.push({
      job: job._id,
      appliedAt: new Date(),
      status: 'pending'
    });
    await candidate.save();

    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({ message: 'Server error submitting application' });
  }
});

export default router;
