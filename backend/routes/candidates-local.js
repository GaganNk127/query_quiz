import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Helper functions for file operations
const readCandidatesFromFile = async () => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/candidates.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading candidates file:', error);
    return [];
  }
};

const writeCandidatesToFile = async (candidates) => {
  try {
    await fs.writeFile(path.join(__dirname, '../data/candidates.json'), JSON.stringify(candidates, null, 2));
  } catch (error) {
    console.error('Error writing candidates file:', error);
  }
};

const readJobsFromFile = async () => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/jobs.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading jobs file:', error);
    return [];
  }
};

// Get recruiter statistics
router.get('/recruiter/stats', async (req, res) => {
  try {
    const candidates = await readCandidatesFromFile();
    const jobs = await readJobsFromFile();
    
    // Calculate stats from actual data
    const stats = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(job => job.status === 'active').length,
      totalCandidates: candidates.length,
      shortlistedCandidates: candidates.filter(c => c.shortlisted).length,
      recentApplications: 8, // Mock data for now
      averageAtsScore: candidates.length > 0 
        ? Math.round(candidates.reduce((sum, c) => sum + c.atsScore, 0) / candidates.length)
        : 0,
      completedQuizzes: candidates.filter(c => c.quizScore > 0).length,
      averageQuizScore: candidates.filter(c => c.quizScore > 0).length > 0
        ? Math.round(candidates.filter(c => c.quizScore > 0).reduce((sum, c) => sum + c.quizScore, 0) / candidates.filter(c => c.quizScore > 0).length)
        : 0,
      cheatingDetected: candidates.filter(c => c.cheatingDetected).length
    };
    
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Error fetching recruiter stats:', error);
    res.status(500).json({ message: 'Failed to fetch recruiter statistics' });
  }
});

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, jobId, minScore = 0 } = req.query;
    const candidates = await readCandidatesFromFile();

    // Filter candidates with resumes
    let filteredCandidates = candidates.filter(c => 
      c.resumeText && c.resumeText.trim() !== ''
    );

    // Filter by ATS score if specified
    if (minScore > 0) {
      filteredCandidates = filteredCandidates.filter(c => c.atsScore >= parseInt(minScore));
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: {
        candidates: paginatedCandidates,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(filteredCandidates.length / limit),
          total: filteredCandidates.length
        }
      }
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get candidates',
      error: error.message
    });
  }
});

// Upload resume and calculate ATS score
router.post('/upload-resume', upload.single('resume'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Mock resume text extraction
    const mockResumeText = `Sample resume text for ${req.file.originalname}. This candidate has experience in JavaScript, React, Node.js, and MongoDB.`;

    // Mock ATS score calculation
    const mockAtsScore = Math.floor(Math.random() * 30) + 70; // Score between 70-100

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and analyzed successfully',
      data: {
        resumeText: mockResumeText,
        resumeUrl: `/uploads/${req.file.filename}`,
        atsScore: mockAtsScore,
        suggestions: [
          'Add more specific technical skills',
          'Include quantifiable achievements',
          'Add project descriptions with outcomes'
        ]
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resume',
      error: error.message
    });
  }
});

// Get candidate profile
router.get('/profile', (req, res) => {
  try {
    const mockCandidateProfile = {
      user: {
        _id: 'candidate1',
        name: 'John Doe',
        email: 'candidate@example.com'
      },
      resumeText: 'John Doe is a software developer with 3 years of experience...',
      resumeUrl: '/uploads/resume_john_doe.pdf',
      atsScore: 85,
      quizScore: 78,
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experience: 'Mid Level',
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of Technology',
          year: '2020'
        }
      ],
      portfolio: 'https://johndoe.dev'
    };

    res.status(200).json({
      success: true,
      data: mockCandidateProfile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get candidate profile',
      error: error.message
    });
  }
});

// Update candidate profile
router.put('/profile', (req, res) => {
  try {
    const { skills, experience, education, portfolio } = req.body;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        skills,
        experience,
        education,
        portfolio
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Get ATS-qualified candidates (for recruiters)
router.get('/ats-passed', (req, res) => {
  try {
    const { limit = 10, page = 1, atsScoreMin = 60 } = req.query;
    
    // Filter candidates by ATS score
    const qualifiedCandidates = candidates.filter(c => c.atsScore >= parseInt(atsScoreMin));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCandidates = qualifiedCandidates.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: {
        candidates: paginatedCandidates,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(qualifiedCandidates.length / limit),
          total: qualifiedCandidates.length
        }
      }
    });
  } catch (error) {
    console.error('Get ATS candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get candidates',
      error: error.message
    });
  }
});

// Get candidate details by ID
router.get('/:id', (req, res) => {
  try {
    const candidate = candidates.find(c => c._id === req.params.id);
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { candidate }
    });
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get candidate details',
      error: error.message
    });
  }
});

// Shortlist candidate
router.post('/:id/shortlist', (req, res) => {
  try {
    const candidate = candidates.find(c => c._id === req.params.id);
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    candidate.shortlisted = true;

    res.status(200).json({
      success: true,
      message: 'Candidate shortlisted successfully',
      data: { candidate }
    });
  } catch (error) {
    console.error('Shortlist candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to shortlist candidate',
      error: error.message
    });
  }
});

export default router;
