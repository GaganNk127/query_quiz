import mongoose from 'mongoose';
import dotenv from 'dotenv';
import QuizQuestion from './models/QuizQuestion.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const checkCount = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const count = await QuizQuestion.countDocuments();
        console.log(`Total Quiz Questions: ${count}`);

        // Also check distribution by category if possible
        const categories = await QuizQuestion.aggregate([
            { $group: { _id: "$subcategory", count: { $sum: 1 } } }
        ]);
        console.log('Distribution:', categories);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

checkCount();
