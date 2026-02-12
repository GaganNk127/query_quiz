import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { generateQuiz } from './services/quizService.js';
import QuizQuestion from './models/QuizQuestion.js';

dotenv.config();

const testQuizGeneration = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Checking DB count...');
        const count = await QuizQuestion.countDocuments();
        console.log(`Total Value in DB: ${count}`);

        if (count === 0) {
            console.log('⚠️ DB is empty! Seeding failed?');
        } else {
            console.log('✅ DB has data.');

            console.log('Generating Quiz...');
            const quiz = await generateQuiz();

            console.log(`Generated ${quiz.length} questions.`);
            if (quiz.length > 0) {
                console.log('Sample Question:', quiz[0].question);
                console.log('Sample Category:', quiz[0].category);
                console.log('Sample Difficulty:', quiz[0].difficulty);
            } else {
                console.log('⚠️ Quiz is empty!');
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        mongoose.connection.close();
    }
};

testQuizGeneration();
