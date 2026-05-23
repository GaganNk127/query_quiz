
import { generateQuiz } from './services/quizService.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import QuizQuestion from './models/QuizQuestion.js';

dotenv.config();

const testCategoryLogic = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('\n--- Test 1: Role matching "technical" category ---');
    const technicalQuiz = await generateQuiz('', '', 'Senior Technical Lead');
    const technicalCategories = [...new Set(technicalQuiz.map(q => q.category))];
    console.log('Categories found:', technicalCategories);
    console.log('Questions count:', technicalQuiz.length);
    
    const allTechnical = technicalQuiz.every(q => q.category === 'technical');
    console.log('Are all questions "technical"?:', allTechnical);

    console.log('\n--- Test 2: Role with no matching category ---');
    const randomQuiz = await generateQuiz('', '', 'Accountant');
    const randomCategories = [...new Set(randomQuiz.map(q => q.category))];
    console.log('Categories found in fallback:', randomCategories);
    console.log('Questions count:', randomQuiz.length);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

testCategoryLogic();
