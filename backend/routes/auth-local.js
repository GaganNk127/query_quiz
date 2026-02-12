import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Mock user data for development
let users = [
  {
    _id: 'candidate1',
    name: 'John Doe',
    email: 'candidate@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password123
    role: 'candidate',
    profile: {
      phone: '+1234567890',
      location: 'New York, NY',
      bio: 'Software developer with 3 years of experience',
      website: 'https://johndoe.dev',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe'
    }
  },
  {
    _id: 'recruiter1',
    name: 'Jane Smith',
    email: 'recruiter@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password123
    role: 'recruiter',
    profile: {
      phone: '+0987654321',
      location: 'San Francisco, CA',
      bio: 'Technical recruiter at TechCorp',
      website: 'https://techcorp.com',
      linkedin: 'https://linkedin.com/in/janesmith',
      github: ''
    }
  }
];

// Mock candidate data
let candidates = [
  {
    _id: 'candidate1',
    user: {
      _id: 'candidate1',
      name: 'John Doe',
      email: 'candidate@example.com'
    },
    resumeText: 'John Doe is a software developer with 3 years of experience in JavaScript, React, Node.js, and MongoDB. He has worked on several web applications and is proficient in frontend and backend development.',
    resumeUrl: '/uploads/resume_john_doe.pdf',
    atsScore: 85,
    quizScore: 78,
    quizAnswers: [],
    cheatingDetected: false,
    proctoringLog: [],
    shortlisted: false,
    appliedJobs: [],
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'HTML', 'CSS'],
    experience: 'Mid Level',
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of Technology',
        year: '2020'
      }
    ],
    portfolio: 'https://johndoe.dev'
  }
];

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, profile = {} } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      _id: `user_${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      role,
      profile
    };

    users.push(newUser);

    // Generate token
    const token = generateToken(newUser._id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    // In a real app, this would verify JWT token
    // For demo, we'll return the first user
    const user = users[0];
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        candidateData: user.role === 'candidate' ? candidates[0] : null
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message
    });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const { profile } = req.body;
    
    // In a real app, this would update the user in database
    // For demo, we'll just return success
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: error.message
    });
  }
});

export default router;
