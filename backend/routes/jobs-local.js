import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper function to read jobs from file
const readJobsFromFile = async () => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/jobs.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading jobs file:', error);
    return [];
  }
};

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await readJobsFromFile();
    const { page = 1, limit = 10, search, location, type, experience } = req.query;
    
    let filteredJobs = jobs;

    // Apply filters
    if (search) {
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (type) {
      filteredJobs = filteredJobs.filter(job => job.type === type);
    }

    if (experience) {
      filteredJobs = filteredJobs.filter(job => job.experience === experience);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: {
        jobs: paginatedJobs,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(filteredJobs.length / limit),
          total: filteredJobs.length
        }
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get jobs',
      error: error.message
    });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const jobs = await readJobsFromFile();
    const job = jobs.find(j => j._id === req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job details',
      error: error.message
    });
  }
});

// Get jobs posted by current recruiter (my-jobs)
router.get('/my-jobs', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const jobs = await readJobsFromFile();
    
    // For local development, return all jobs (assuming they're posted by current recruiter)
    const recruiterJobs = jobs.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      jobs: recruiterJobs
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recruiter jobs',
      error: error.message
    });
  }
});

// Create new job (recruiter only)
router.post('/', (req, res) => {
  try {
    const newJob = {
      _id: `job_${Date.now()}`,
      ...req.body,
      postedBy: 'recruiter1',
      applicants: [],
      createdAt: new Date().toISOString()
    };

    jobs.push(newJob);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job: newJob }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: error.message
    });
  }
});

// Update job (recruiter only)
router.put('/:id', (req, res) => {
  try {
    const jobIndex = jobs.findIndex(j => j._id === req.params.id);
    
    if (jobIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    jobs[jobIndex] = { ...jobs[jobIndex], ...req.body };

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: { job: jobs[jobIndex] }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: error.message
    });
  }
});

// Delete job (recruiter only)
router.delete('/:id', (req, res) => {
  try {
    const jobIndex = jobs.findIndex(j => j._id === req.params.id);
    
    if (jobIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    jobs.splice(jobIndex, 1);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message
    });
  }
});

// Apply to job (candidate only)
router.post('/:id/apply', (req, res) => {
  try {
    const job = jobs.find(j => j._id === req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.applicants.includes('candidate1')) {
      return res.status(400).json({
        success: false,
        message: 'Already applied to this job'
      });
    }

    job.applicants.push('candidate1');

    res.status(200).json({
      success: true,
      message: 'Applied to job successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply to job',
      error: error.message
    });
  }
});

export default router;