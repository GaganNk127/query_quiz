import mongoose from 'mongoose';
import Candidate from './models/Candidate.js';
import User from './models/User.js';
import Job from './models/Job.js';
import dotenv from 'dotenv';

dotenv.config();

const verifyDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const candidates = await Candidate.find({});
    console.log(`Total Candidates: ${candidates.length}`);
    
    candidates.forEach(c => {
      console.log(`Candidate ID: ${c._id}, User: ${c.user}, Cheating: ${c.cheatingStatus}`);
      console.log(`Proctoring Log: ${JSON.stringify(c.proctoringLog)}`);
      console.log(`Applied Jobs: ${JSON.stringify(c.appliedJobs)}`);
    });

    const jobs = await Job.find({});
    console.log(`Total Jobs: ${jobs.length}`);
    jobs.forEach(j => {
      console.log(`Job ID: ${j._id}, PostedBy: ${j.postedBy}, Applicants Count: ${j.applicants.length}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

verifyDB();
