import natural from 'natural';
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

let model = null;

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Stop words to remove
const stopWords = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
  'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
  'while', 'of', 'at', 'by', 'for', 'with', 'through', 'during', 'before', 'after',
  'above', 'below', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
  'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
  'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will',
  'just', 'don', 'should', 'now'
]);

// Preprocess text
export const preprocessText = (text) => {
  if (!text) return [];

  // Convert to lowercase and tokenize
  const tokens = tokenizer.tokenize(text.toLowerCase());

  // Remove stop words and non-alphabetic characters, then stem
  const processedTokens = tokens
    .filter(token => !stopWords.has(token) && /^[a-zA-Z]+$/.test(token))
    .map(token => stemmer.stem(token));

  return processedTokens;
};

// Calculate Jaccard similarity
export const jaccardSimilarity = (set1, set2) => {
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
};

// Calculate cosine similarity using TensorFlow.js
export const cosineSimilarity = async (text1, text2) => {
  const tokens1 = preprocessText(text1);
  const tokens2 = preprocessText(text2);

  // Create vocabulary
  const vocab = new Set([...tokens1, ...tokens2]);
  const vocabArray = Array.from(vocab);

  // Create vectors
  const vector1 = vocabArray.map(word => tokens1.filter(t => t === word).length);
  const vector2 = vocabArray.map(word => tokens2.filter(t => t === word).length);

  // Convert to tensors
  const tensor1 = tf.tensor1d(vector1);
  const tensor2 = tf.tensor1d(vector2);

  // Calculate cosine similarity
  const dotProduct = tf.sum(tf.mul(tensor1, tensor2));
  const norm1 = tf.sqrt(tf.sum(tf.square(tensor1)));
  const norm2 = tf.sqrt(tf.sum(tf.square(tensor2)));

  const cosineSim = dotProduct.div(norm1.mul(norm2));
  const result = await cosineSim.data();

  // Clean up tensors
  tensor1.dispose();
  tensor2.dispose();
  dotProduct.dispose();
  norm1.dispose();
  norm2.dispose();
  cosineSim.dispose();

  return result[0];
};

// Extract keywords from text
export const extractKeywords = (text) => {
  const tokens = preprocessText(text);
  const frequency = {};

  // Count word frequencies
  tokens.forEach(token => {
    frequency[token] = (frequency[token] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);
};

// Rule-based resume scoring system
export const calculateATSScore = async (resumeText, jobDescription) => {
  try {
    if (!resumeText || !jobDescription) {
      return 0;
    }

    // Initialize scores
    let scores = {
      keywordMatch: 0,
      skillMatch: 0,
      experienceMatch: 0,
      educationMatch: 0,
      formatScore: 0,
      lengthScore: 0
    };

    // 1. Keyword Matching (30% weight)
    const jobKeywords = extractJobKeywords(jobDescription);
    const resumeKeywords = extractResumeKeywords(resumeText);
    const keywordScore = calculateKeywordMatch(jobKeywords, resumeKeywords);
    scores.keywordMatch = keywordScore;

    // 2. Skill Matching (25% weight)
    const requiredSkills = extractSkills(jobDescription);
    const candidateSkills = extractSkills(resumeText);
    const skillScore = calculateSkillMatch(requiredSkills, candidateSkills);
    scores.skillMatch = skillScore;

    // 3. Experience Matching (20% weight)
    const experienceScore = calculateExperienceMatch(resumeText, jobDescription);
    scores.experienceMatch = experienceScore;

    // 4. Education Matching (10% weight)
    const educationScore = calculateEducationMatch(resumeText, jobDescription);
    scores.educationMatch = educationScore;

    // 5. Resume Format Quality (10% weight)
    const formatScore = calculateFormatScore(resumeText);
    scores.formatScore = formatScore;

    // 6. Resume Length (5% weight)
    const lengthScore = calculateLengthScore(resumeText);
    scores.lengthScore = lengthScore;

    // 7. Semantic Similarity (30% weight - high impact because it's AI)
    // Recalculate weights:
    // Keyword: 20%, Skill: 20%, Experience: 15%, Education: 10%, Format: 5%, Length: 5%, Semantic: 25%
    const semanticScore = await getSemanticScore(resumeText, jobDescription);
    scores.semanticMatch = semanticScore;

    // Calculate weighted final score
    const finalScore = Math.round(
      scores.keywordMatch * 0.20 +
      scores.skillMatch * 0.20 +
      scores.experienceMatch * 0.15 +
      scores.educationMatch * 0.10 +
      scores.formatScore * 0.05 +
      scores.lengthScore * 0.05 +
      scores.semanticMatch * 0.25
    );

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, finalScore));
  } catch (error) {
    console.error('ATS scoring error:', error);
    return 0;
  }
};

// Extract keywords from job description
const extractJobKeywords = (text) => {
  const importantWords = [];

  // Common technical keywords
  const technicalKeywords = [
    'javascript', 'python', 'java', 'react', 'node', 'express', 'mongodb',
    'sql', 'html', 'css', 'typescript', 'angular', 'vue', 'docker', 'kubernetes',
    'aws', 'azure', 'google', 'cloud', 'git', 'github', 'rest', 'api',
    'graphql', 'microservices', 'devops', 'testing', 'automation', 'machine',
    'learning', 'ai', 'data', 'analytics', 'frontend', 'backend', 'fullstack'
  ];

  // Common action verbs
  const actionVerbs = [
    'developed', 'implemented', 'designed', 'created', 'managed', 'led',
    'optimized', 'improved', 'built', 'launched', 'coordinated', 'achieved',
    'increased', 'decreased', 'reduced', 'enhanced', 'maintained', 'supported'
  ];

  // Experience level indicators
  const experienceLevels = [
    'entry', 'junior', 'mid', 'senior', 'lead', 'principal', 'staff',
    'manager', 'director', 'vp', 'chief', 'head'
  ];

  const allKeywords = [...technicalKeywords, ...actionVerbs, ...experienceLevels];
  const textLower = text.toLowerCase();

  allKeywords.forEach(keyword => {
    if (textLower.includes(keyword)) {
      importantWords.push(keyword);
    }
  });

  return [...new Set(importantWords)]; // Remove duplicates
};

// Extract keywords from resume
const extractResumeKeywords = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const importantWords = [];

  // Filter out common words and keep important ones
  words.forEach(word => {
    if (word.length > 3 && !isCommonWord(word)) {
      importantWords.push(word);
    }
  });

  return [...new Set(importantWords)];
};

// Check if word is common/stop word
const isCommonWord = (word) => {
  const commonWords = [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
    'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who',
    'boy', 'did', 'use', 'her', 'him', 'his', 'how', 'man', 'our', 'out',
    'she', 'the', 'time', 'way', 'who', 'will', 'with', 'have', 'this',
    'that', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some',
    'would', 'there', 'their', 'what', 'which', 'when', 'make', 'like'
  ];
  return commonWords.includes(word);
};

// Calculate keyword match score
const calculateKeywordMatch = (jobKeywords, resumeKeywords) => {
  if (jobKeywords.length === 0) return 0;

  const matches = jobKeywords.filter(keyword =>
    resumeKeywords.some(resumeWord => resumeWord.includes(keyword) || keyword.includes(resumeWord))
  );

  return Math.min(100, (matches.length / jobKeywords.length) * 100);
};

// Calculate skill match score
const calculateSkillMatch = (requiredSkills, candidateSkills) => {
  if (requiredSkills.length === 0) return 0;

  const matches = requiredSkills.filter(skill =>
    candidateSkills.some(candidateSkill =>
      candidateSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(candidateSkill.toLowerCase())
    )
  );

  return Math.min(100, (matches.length / requiredSkills.length) * 100);
};

// Calculate experience match score
const calculateExperienceMatch = (resumeText, jobDescription) => {
  const textLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();

  let score = 50; // Base score

  // Check for years of experience
  const yearsMatch = textLower.match(/(\d+)\+?\s*years?/);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1]);
    if (jobLower.includes('entry') || jobLower.includes('junior')) {
      score = years >= 0 ? Math.min(100, 50 + years * 10) : 30;
    } else if (jobLower.includes('senior') || jobLower.includes('lead')) {
      score = years >= 5 ? Math.min(100, 50 + years * 8) : 30;
    } else {
      score = Math.min(100, 50 + years * 5);
    }
  }

  // Check for relevant experience indicators
  if (textLower.includes('developed') || textLower.includes('implemented')) score += 10;
  if (textLower.includes('managed') || textLower.includes('led')) score += 10;
  if (textLower.includes('project')) score += 5;

  return Math.min(100, score);
};

// Calculate education match score
const calculateEducationMatch = (resumeText, jobDescription) => {
  const textLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();

  let score = 0;

  // Check for education keywords
  if (textLower.includes('bachelor') || textLower.includes('degree')) score += 40;
  if (textLower.includes('master')) score += 30;
  if (textLower.includes('phd') || textLower.includes('doctorate')) score += 30;
  if (textLower.includes('computer science') || textLower.includes('engineering')) score += 20;

  // Check if job requires specific education
  if (jobLower.includes('master') && textLower.includes('master')) score += 20;
  if (jobLower.includes('bachelor') && textLower.includes('bachelor')) score += 20;

  return Math.min(100, score);
};

// Calculate resume format score
const calculateFormatScore = (resumeText) => {
  let score = 50; // Base score

  // Check for proper sections
  if (resumeText.toLowerCase().includes('experience')) score += 10;
  if (resumeText.toLowerCase().includes('education')) score += 10;
  if (resumeText.toLowerCase().includes('skills')) score += 10;
  if (resumeText.toLowerCase().includes('project')) score += 10;

  // Check for contact information
  if (resumeText.includes('@') || resumeText.includes('email')) score += 5;
  if (resumeText.match(/\d{3}.*\d{3}.*\d{4}/)) score += 5; // Phone number pattern

  // Check for bullet points or proper formatting
  if (resumeText.includes('•') || resumeText.includes('-') || resumeText.includes('*')) score += 10;

  return Math.min(100, score);
};

// Calculate resume length score
const calculateLengthScore = (resumeText) => {
  const wordCount = resumeText.split(/\s+/).length;

  if (wordCount < 100) return 20; // Too short
  if (wordCount < 300) return 60; // Short but acceptable
  if (wordCount < 600) return 100; // Good length
  if (wordCount < 1000) return 80; // A bit long but okay
  return 50; // Too long
};

// Get detailed ATS scoring breakdown
export const getDetailedATSScore = async (resumeText, jobDescription) => {
  try {
    if (!resumeText || !jobDescription) {
      return {
        totalScore: 0,
        breakdown: {
          keywordMatch: { score: 0, weight: 30, details: 'No resume or job description provided' },
          skillMatch: { score: 0, weight: 25, details: 'No resume or job description provided' },
          experienceMatch: { score: 0, weight: 20, details: 'No resume or job description provided' },
          educationMatch: { score: 0, weight: 10, details: 'No resume or job description provided' },
          formatScore: { score: 0, weight: 10, details: 'No resume or job description provided' },
          formatScore: { score: 0, weight: 10, details: 'No resume or job description provided' },
          lengthScore: { score: 0, weight: 5, details: 'No resume or job description provided' },
          semanticMatch: { score: 0, weight: 25, details: 'No resume or job description provided' }
        }
      };
    }

    // Calculate individual scores
    const jobKeywords = extractJobKeywords(jobDescription);
    const resumeKeywords = extractResumeKeywords(resumeText);
    const keywordScore = calculateKeywordMatch(jobKeywords, resumeKeywords);

    const requiredSkills = extractSkills(jobDescription);
    const candidateSkills = extractSkills(resumeText);
    const skillScore = calculateSkillMatch(requiredSkills, candidateSkills);

    const experienceScore = calculateExperienceMatch(resumeText, jobDescription);
    const educationScore = calculateEducationMatch(resumeText, jobDescription);
    const formatScore = calculateFormatScore(resumeText);
    const lengthScore = calculateLengthScore(resumeText);

    // Calculate weighted final score
    // 7. Semantic Similarity (25% weight)
    const semanticScore = await getSemanticScore(resumeText, jobDescription);

    // Calculate weighted final score
    const totalScore = Math.round(
      keywordScore * 0.20 +
      skillScore * 0.20 +
      experienceScore * 0.15 +
      educationScore * 0.10 +
      formatScore * 0.05 +
      lengthScore * 0.05 +
      semanticScore * 0.25
    );

    // Generate detailed breakdown
    const breakdown = {
      keywordMatch: {
        score: Math.round(keywordScore),
        weight: 30,
        details: `Matched ${Math.round(keywordScore * jobKeywords.length / 100)} out of ${jobKeywords.length} key terms from job description`,
        matchedKeywords: jobKeywords.filter(keyword =>
          resumeKeywords.some(resumeWord => resumeWord.includes(keyword) || keyword.includes(resumeWord))
        ).slice(0, 10)
      },
      skillMatch: {
        score: Math.round(skillScore),
        weight: 25,
        details: `Found ${Math.round(skillScore * requiredSkills.length / 100)} out of ${requiredSkills.length} required skills`,
        matchedSkills: requiredSkills.filter(skill =>
          candidateSkills.some(candidateSkill =>
            candidateSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(candidateSkill.toLowerCase())
          )
        ).slice(0, 10)
      },
      experienceMatch: {
        score: Math.round(experienceScore),
        weight: 20,
        details: getExperienceDetails(resumeText, jobDescription)
      },
      educationMatch: {
        score: Math.round(educationScore),
        weight: 10,
        details: getEducationDetails(resumeText, jobDescription)
      },
      formatScore: {
        score: Math.round(formatScore),
        weight: 10,
        details: getFormatDetails(resumeText)
      },
      lengthScore: {
        score: Math.round(lengthScore),
        weight: 5,
        details: getLengthDetails(resumeText)
      },
      semanticMatch: {
        score: Math.round(semanticScore),
        weight: 25,
        details: `AI analysis indicates ${semanticScore}% semantic relevance between resume and job description.`
      }
    };

    return {
      totalScore: Math.max(0, Math.min(100, totalScore)),
      breakdown
    };
  } catch (error) {
    console.error('Detailed ATS scoring error:', error);
    return {
      totalScore: 0,
      breakdown: {
        error: { score: 0, weight: 100, details: 'Error occurred during scoring' }
      }
    };
  }
};

// Get experience details
const getExperienceDetails = (resumeText, jobDescription) => {
  const textLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();

  const yearsMatch = textLower.match(/(\d+)\+?\s*years?/);
  const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;

  let details = `Found ${years} years of experience. `;

  if (jobLower.includes('senior') || jobLower.includes('lead')) {
    details += years >= 5 ? 'Meets senior level requirements.' : 'Below senior level requirements.';
  } else if (jobLower.includes('entry') || jobLower.includes('junior')) {
    details += years >= 0 ? 'Suitable for entry level.' : 'Experience level unclear.';
  } else {
    details += years >= 2 ? 'Meets general experience requirements.' : 'Limited experience shown.';
  }

  if (textLower.includes('developed') || textLower.includes('implemented')) {
    details += ' Shows development experience.';
  }
  if (textLower.includes('managed') || textLower.includes('led')) {
    details += ' Demonstrates leadership experience.';
  }

  return details;
};

// Get education details
const getEducationDetails = (resumeText, jobDescription) => {
  const textLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();

  let details = '';

  if (textLower.includes('phd') || textLower.includes('doctorate')) {
    details = 'Advanced degree (PhD/Doctorate) detected. ';
  } else if (textLower.includes('master')) {
    details = 'Master\'s degree detected. ';
  } else if (textLower.includes('bachelor') || textLower.includes('degree')) {
    details = 'Bachelor\'s degree detected. ';
  } else {
    details = 'Education level unclear. ';
  }

  if (textLower.includes('computer science') || textLower.includes('engineering')) {
    details += 'Relevant technical field. ';
  }

  if (jobLower.includes('master') && textLower.includes('master')) {
    details += 'Meets master\'s degree requirement.';
  } else if (jobLower.includes('bachelor') && textLower.includes('bachelor')) {
    details += 'Meets bachelor\'s degree requirement.';
  }

  return details;
};

// Get format details
const getFormatDetails = (resumeText) => {
  let details = '';
  const sections = [];

  if (resumeText.toLowerCase().includes('experience')) sections.push('Experience');
  if (resumeText.toLowerCase().includes('education')) sections.push('Education');
  if (resumeText.toLowerCase().includes('skills')) sections.push('Skills');
  if (resumeText.toLowerCase().includes('project')) sections.push('Projects');

  details += `Contains sections: ${sections.join(', ') || 'Basic structure'}. `;

  if (resumeText.includes('@') || resumeText.includes('email')) {
    details += 'Contact information present. ';
  }

  if (resumeText.match(/\d{3}.*\d{3}.*\d{4}/)) {
    details += 'Phone number detected. ';
  }

  if (resumeText.includes('•') || resumeText.includes('-') || resumeText.includes('*')) {
    details += 'Good formatting with bullet points.';
  }

  return details;
};

// Get length details
const getLengthDetails = (resumeText) => {
  const wordCount = resumeText.split(/\s+/).length;

  if (wordCount < 100) {
    return `Too short (${wordCount} words). Resume should be more detailed.`;
  } else if (wordCount < 300) {
    return `Short but acceptable (${wordCount} words). Could be more detailed.`;
  } else if (wordCount < 600) {
    return `Good length (${wordCount} words). Well-detailed resume.`;
  } else if (wordCount < 1000) {
    return `Comprehensive (${wordCount} words). Very detailed resume.`;
  } else {
    return `Very long (${wordCount} words). Consider being more concise.`;
  }
};

// Extract skills from text (simplified pattern matching)
export const extractSkills = (text) => {
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node', 'express', 'mongodb',
    'sql', 'html', 'css', 'typescript', 'angular', 'vue', 'docker', 'kubernetes',
    'aws', 'azure', 'google', 'cloud', 'git', 'github', 'agile', 'scrum',
    'rest', 'api', 'graphql', 'microservices', 'devops', 'ci', 'cd', 'testing',
    'unit', 'integration', 'automation', 'machine', 'learning', 'ai', 'data',
    'analytics', 'leadership', 'communication', 'project', 'management',
    'design', 'ux', 'ui', 'frontend', 'backend', 'fullstack', 'mobile',
    'ios', 'android', 'swift', 'kotlin', 'flutter', 'react', 'native'
  ];

  const textLower = text.toLowerCase();
  const foundSkills = [];

  commonSkills.forEach(skill => {
    if (textLower.includes(skill)) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
};

// Load the Universal Sentence Encoder model
export const loadSimilarityModel = async () => {
  try {
    if (model) return model;

    console.log('Loading Universal Sentence Encoder...');
    model = await use.load();
    console.log('Universal Sentence Encoder loaded successfully');
    return model;
  } catch (error) {
    console.error('Error loading similarity model:', error);
    return null;
  }
};

// Calculate semantic similarity using USE
export const getSemanticScore = async (text1, text2) => {
  try {
    if (!text1 || !text2) return 0;

    const loadedModel = await loadSimilarityModel();
    if (!loadedModel) return 0;

    // Embed both texts
    const embeddings = await loadedModel.embed([text1, text2]);
    const embeddingsData = await embeddings.array();

    // Calculate cosine similarity between the two embeddings
    const vectorA = embeddingsData[0];
    const vectorB = embeddingsData[1];

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));

    // Clean up tensors
    embeddings.dispose();

    // Convert to percentage (similarity is usually -1 to 1, but for text typically 0 to 1)
    // We normalize to ensure positive 0-100 score
    return Math.max(0, Math.min(100, Math.round(similarity * 100)));
  } catch (error) {
    console.error('Semantic scoring error:', error);
    return 0;
  }
};

export default {
  preprocessText,
  jaccardSimilarity,
  cosineSimilarity,
  extractKeywords,
  calculateATSScore,
  getDetailedATSScore,
  extractSkills,
  loadSimilarityModel,
  getSemanticScore
};
