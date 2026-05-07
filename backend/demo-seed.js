import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Job from './models/Job.js';
import Candidate from './models/Candidate.js';
import QuizQuestion from './models/QuizQuestion.js';
import { quizQuestions } from './data/quizQuestions.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedDemoData = async () => {
  try {
    console.log('🚀 Starting Demo Seeding...');
    await mongoose.connect(MONGO_URI);

    // 1. Clear existing demo data (optional, but keeps it clean)
    // We only clear demo-specific accounts to avoid wiping user's real data
    await User.deleteMany({ email: { $in: ['demo-recruiter@example.com', 'demo-candidate@example.com'] } });
    await QuizQuestion.deleteMany();

    // 2. Create Recruiter
    console.log('👤 Creating Demo Recruiter...');
    const recruiterSalt = await bcrypt.genSalt(10);
    const recruiterPassword = await bcrypt.hash('password123', recruiterSalt);
    const recruiter = await User.create({
      name: 'Demo Recruiter',
      email: 'demo-recruiter@example.com',
      password: 'password123', // Model pre-save will hash it if not already hashed, but let's be safe
      role: 'recruiter',
      profile: { company: 'TechCorp' }
    });

    // 3. Create Candidate
    console.log('👤 Creating Demo Candidate...');
    const candidatePassword = await bcrypt.hash('password123', recruiterSalt);
    const candidateUser = await User.create({
      name: 'Demo Candidate',
      email: 'demo-candidate@example.com',
      password: 'password123',
      role: 'candidate'
    });

    // 4. Create Job
    console.log('💼 Creating Demo Job...');
    const job = await Job.create({
      title: 'Full Stack Developer',
      company: 'TechCorp',
      description: 'Looking for a developer proficient in React and Node.js.',
      requirements: ['React', 'Node.js', 'MongoDB'],
      experience: 'Mid Level',
      location: 'Remote',
      type: 'Full-time',
      postedBy: recruiter._id,
      status: 'active'
    });

    // 5. Create Candidate Profile & Application
    console.log('📄 Creating Candidate Profile & Application...');
    const candidate = await Candidate.create({
      user: candidateUser._id,
      resumeText: 'Full stack developer with 3 years of experience in React, Node.js, and MongoDB.',
      atsScore: 85,
      appliedJobs: [{
        job: job._id,
        appliedAt: new Date(),
        status: 'pending'
      }]
    });

    // 6. Seed Quiz Questions
    console.log(`📝 Inserting ${quizQuestions.length} quiz questions...`);
    const mappedQuestions = quizQuestions.map(q => {
      let category = q.category;
      if (category === 'problem-solving') category = 'problem_solving';
      if (category === 'analytical') category = 'logical_reasoning';
      return { ...q, category };
    });
    await QuizQuestion.insertMany(mappedQuestions);

    console.log('\n✅ Demo Seeding Completed Successfully!');
    console.log('-----------------------------------');
    console.log('Recruiter Email: demo-recruiter@example.com');
    console.log('Candidate Email: demo-candidate@example.com');
    console.log('Password: password123');
    console.log('-----------------------------------');

  } catch (error) {
    console.error('❌ Seeding Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDemoData();
