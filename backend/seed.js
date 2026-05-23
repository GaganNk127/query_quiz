import mongoose from 'mongoose';
import dotenv from 'dotenv';
import QuizQuestion from './models/QuizQuestion.js';
import { quizQuestions } from './data/quizQuestions.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedQuestions = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);

    console.log('Erasing old questions...');
    await QuizQuestion.deleteMany();

    console.log(`Inserting ${quizQuestions.length} quiz questions from config...`);
    
    await QuizQuestion.insertMany(quizQuestions);

    console.log('🎉 Successfully seeded Quiz Questions from JSON config!');
  } catch (err) {
    console.error('❌ Error seeding:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedQuestions();
