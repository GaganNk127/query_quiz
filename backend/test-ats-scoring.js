import { calculateATSScore, getDetailedATSScore } from './services/atsService.js';

// Test resume and job description
const testResume = `
John Doe
Email: john.doe@email.com | Phone: (555) 123-4567

PROFESSIONAL SUMMARY
Experienced software developer with 5 years of experience in JavaScript, React, and Node.js. 
Developed and implemented multiple web applications using modern technologies.

EXPERIENCE
Senior Frontend Developer | Tech Corp | 2020-Present
- Developed responsive web applications using React and TypeScript
- Implemented RESTful APIs and microservices architecture
- Led a team of 3 junior developers
- Optimized application performance, improving load times by 40%

Software Developer | StartupXYZ | 2018-2020
- Built fullstack applications using Node.js, Express, and MongoDB
- Created automated testing suites using Jest and Cypress
- Collaborated in agile/scrum development environment

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2018

SKILLS
- JavaScript, TypeScript, React, Node.js, Express
- MongoDB, SQL, REST APIs, GraphQL
- Docker, AWS, Git, Agile, Scrum
- Testing, CI/CD, Microservices
`;

const testJobDescription = `
Senior Frontend Developer Position

We are looking for a Senior Frontend Developer with 5+ years of experience to join our growing team.

REQUIREMENTS:
- 5+ years of experience in frontend development
- Strong proficiency in JavaScript, React, and TypeScript
- Experience with Node.js and backend technologies
- Bachelor's degree in Computer Science or related field
- Experience with REST APIs and microservices
- Leadership experience and ability to mentor junior developers
- Familiarity with agile/scrum methodologies

RESPONSIBILITIES:
- Develop and implement modern web applications
- Lead development team and provide technical guidance
- Optimize application performance and user experience
- Collaborate with cross-functional teams

BENEFITS:
- Competitive salary and benefits package
- Remote work opportunities
- Professional development budget
`;

// Test the scoring
async function testATSScoring() {
  console.log('🧪 Testing Rule-Based ATS Scoring System\n');
  
  try {
    // Test basic scoring
    const basicScore = await calculateATSScore(testResume, testJobDescription);
    console.log(`📊 Basic ATS Score: ${basicScore}/100\n`);
    
    // Test detailed scoring
    const detailedResult = await getDetailedATSScore(testResume, testJobDescription);
    console.log('📋 Detailed Scoring Breakdown:');
    console.log(`Total Score: ${detailedResult.totalScore}/100\n`);
    
    Object.entries(detailedResult.breakdown).forEach(([category, data]) => {
      console.log(`${category.toUpperCase()}:`);
      console.log(`  Score: ${data.score}/100 (Weight: ${data.weight}%)`);
      console.log(`  Details: ${data.details}`);
      if (data.matchedKeywords) {
        console.log(`  Matched Keywords: ${data.matchedKeywords.join(', ')}`);
      }
      if (data.matchedSkills) {
        console.log(`  Matched Skills: ${data.matchedSkills.join(', ')}`);
      }
      console.log('');
    });
    
    console.log('✅ ATS Scoring Test Completed Successfully!');
    
  } catch (error) {
    console.error('❌ ATS Scoring Test Failed:', error);
  }
}

// Run the test
testATSScoring();
