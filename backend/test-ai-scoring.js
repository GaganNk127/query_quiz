import atsService from './services/atsService.js';

const testScoring = async () => {
    console.log('🚀 Starting AI ATS Scoring Test...');

    const jobDescription = `
    Looking for a Senior Software Engineer with experience in MERN stack.
    Must have strong skills in React, Node.js, and MongoDB.
    Experience with Machine Learning and TensorFlow is a big plus.
    Responsibilities include building scalable web applications.
  `;

    // Resume 1: Good Match
    const goodResume = `
    Senior Full Stack Developer with 5 years of experience.
    Expert in React, Node.js, Express, and MongoDB.
    Built multiple high-traffic web apps.
    Familiar with Python and basic Machine Learning concepts using TensorFlow.
    Bachelor's in Computer Science.
  `;

    // Resume 2: Poor Match
    const badResume = `
    Experienced Chef with 10 years of culinary expertise.
    Skilled in Italian and French cuisine.
    Managed kitchen staff of 15 people.
    Looking for a change in career.
    High school diploma.
  `;

    try {
        console.log('\n--- Model Loading ---');
        await atsService.loadSimilarityModel();

        console.log('\n--- Testing Semantic Similarity Only ---');
        const goodSemantic = await atsService.getSemanticScore(goodResume, jobDescription);
        const badSemantic = await atsService.getSemanticScore(badResume, jobDescription);

        console.log(`Good Resume Semantic Score: ${goodSemantic}%`);
        console.log(`Bad Resume Semantic Score: ${badSemantic}%`);

        if (goodSemantic > badSemantic + 30) {
            console.log('✅ Semantic scoring is working (Good > Bad)');
        } else {
            console.log('❌ Semantic scoring might be random or ineffective');
        }

        console.log('\n--- Testing Full ATS Score ---');
        const goodTotal = await atsService.calculateATSScore(goodResume, jobDescription);
        const badTotal = await atsService.calculateATSScore(badResume, jobDescription);

        console.log(`Good Resume Total Score: ${goodTotal}`);
        console.log(`Bad Resume Total Score: ${badTotal}`);

        console.log('\n--- Testing Detailed Breakdown (Good Resume) ---');
        const detailed = await atsService.getDetailedATSScore(goodResume, jobDescription);
        console.log('Semantic Match Detail:', detailed.breakdown.semanticMatch);

    } catch (error) {
        console.error('Test Failed:', error);
    }
};

testScoring();
