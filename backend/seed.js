import mongoose from 'mongoose';
import dotenv from 'dotenv';
import QuizQuestion from './models/QuizQuestion.js';
import { generateSyntheticQuizQuestions } from './data/syntheticQuizGenerator.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedQuestions = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Erasing old questions...');
    await QuizQuestion.deleteMany();

    console.log('Generating synthetic questions...');
    const rawQuestions = generateSyntheticQuizQuestions(1000);

    // Map questions to match schema enums
    const mappedQuestions = rawQuestions.map(q => {
      // Map category
      let category = q.category;
      if (category === 'problem-solving') category = 'problem_solving';
      if (category === 'analytical') category = 'logical_reasoning';

      return {
        ...q,
        category
      };
    });

    console.log(`Inserting ${mappedQuestions.length} quiz questions...`);
    await QuizQuestion.insertMany(mappedQuestions);

    console.log('🎉 Successfully seeded Quiz Questions!');
  } catch (err) {
    console.error('❌ Error seeding:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedQuestions();
