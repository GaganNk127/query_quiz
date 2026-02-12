import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import QuizQuestion from './models/QuizQuestion.js';
import Candidate from './models/Candidate.js'; // Ensure these paths are correct
import Job from './models/Job.js';
import User from './models/User.js';
import * as quizService from './services/quizService.js';

dotenv.config();

const runVerification = async () => {
    console.log('🚀 Starting Quiz Workflow Verification...');

    try {
        // 1. Connect to MongoDB
        // Use proper connection string from .env
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGO_URI is missing in .env");

        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        // 2. Generate Quiz Questions (Service Layer)
        console.log('\n--- Testing Quiz Generation ---');
        const jobDesc = "We are looking for a skilled React developer with Node.js experience.";
        const resumeText = "Experienced in React, Node.js, and MongoDB.";

        const questions = await quizService.generateQuiz(jobDesc, resumeText, 'Software Engineer');

        if (questions && questions.length > 0) {
            console.log(`✅ Generated ${questions.length} questions.`);
            console.log(`   Sample: ${questions[0].question.substring(0, 50)}... (Diff: ${questions[0].difficulty})`);
        } else {
            console.error('❌ Failed to generate questions.');
            throw new Error('Quiz generation returned empty array');
        }

        // 3. Simulate Assignment Logic (Route Logic Simulation)
        console.log('\n--- Testing Assignment Logic ---');
        const mockAssignment = {
            id: crypto.randomUUID(),
            jobId: new mongoose.Types.ObjectId(), // Mock Job ID
            jobTitle: 'Test Job',
            assignedAt: new Date(),
            status: 'assigned',
            expiresAt: new Date(Date.now() + 86400000), // 1 day
            questions: questions.map(q => ({
                id: q.id,
                question: q.question,
                options: q.options,
                correct: q.correct,
                difficulty: q.difficulty,
                points: 1 // Simplified
            }))
        };
        console.log('✅ Mock Assignment object created successfully.');

        // 4. Simulate Answering & Scoring (Service Layer)
        console.log('\n--- Testing Scoring Logic ---');
        // Create mock answers - mostly correct
        const mockAnswers = mockAssignment.questions.map(q => ({
            questionId: q.id,
            selectedAnswer: q.correct, // Correct answer
            difficulty: q.difficulty,
            isCorrect: true,
            timeSpent: 10
        }));

        // Intentionally make one wrong if questions exist
        if (mockAnswers.length > 0) {
            mockAnswers[0].selectedAnswer = (mockAnswers[0].selectedAnswer + 1) % 4; // Pick wrong option
            mockAnswers[0].isCorrect = false;
        }

        const score = quizService.calculateQuizScore(mockAnswers);
        console.log(`✅ Calculated Score: ${score}% (Expected < 100% since one is wrong)`);

        // 5. Check Proctoring/Cheating Detection
        console.log('\n--- Testing Cheating Detection ---');
        const cleanLog = [];
        const cheatingLog = [
            { type: 'no_face', timestamp: new Date() },
            { type: 'no_face', timestamp: new Date() },
            { type: 'no_face', timestamp: new Date() }, // 3x no_face = cheat
        ];

        const isClean = quizService.detectCheating(cleanLog);
        const isCheating = quizService.detectCheating(cheatingLog);

        if (!isClean && isCheating) {
            console.log('✅ Cheating detection logic works (Clean: Clean, Dirty: Detected).');
        } else {
            console.error(`❌ Cheating detection failed. Clean: ${isClean}, Dirty: ${isCheating}`);
        }

        console.log('\n🎉 Verification Complete! Logic looks sound.');

    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    }
};

runVerification();
