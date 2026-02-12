// Comprehensive Synthetic Quiz Data Generator

// Technical categories with question templates
const technicalTemplates = {
  // Software Engineer (General/Web)
  javascript: [
    {
      question: "What is the output of the following JavaScript code?\n```javascript\nconsole.log(typeof null);\n```",
      options: ["null", "undefined", "object", "string"],
      correct: 2,
      difficulty: "easy"
    },
    {
      question: "Which method is used to add one or more elements to the end of an array?",
      options: ["push()", "pop()", "shift()", "unshift()"],
      correct: 0,
      difficulty: "easy"
    },
    {
      question: "What does the '===' operator do in JavaScript?",
      options: [
        "Assigns a value to a variable",
        "Compares both value and type",
        "Compares only value",
        "Checks if a variable exists"
      ],
      correct: 1,
      difficulty: "medium"
    },
    {
      question: "Which of the following is a JavaScript framework?",
      options: ["Django", "React", "Laravel", "Ruby on Rails"],
      correct: 1,
      difficulty: "easy"
    },
    {
      question: "What is a closure in JavaScript?",
      options: [
        "A function that has access to variables in its outer scope",
        "A way to close browser windows",
        "A method to stop function execution",
        "A type of loop"
      ],
      correct: 0,
      difficulty: "hard"
    }
  ],
  react: [
    {
      question: "What is the correct way to pass props to a component?",
      options: [
        "<Component props={data} />",
        "<Component {data} />",
        "<Component {...data} />",
        "<Component data={data} />"
      ],
      correct: 2,
      difficulty: "medium"
    },
    {
      question: "Which hook is used to manage state in functional components?",
      options: ["useEffect", "useState", "useContext", "useReducer"],
      correct: 1,
      difficulty: "easy"
    },
    {
      question: "What is JSX?",
      options: [
        "JavaScript XML",
        "Java Syntax Extension",
        "JSON Extension",
        "JavaScript Execution"
      ],
      correct: 0,
      difficulty: "easy"
    }
  ],
  nodejs: [
    {
      question: "Which module is used to work with file systems in Node.js?",
      options: ["fs", "path", "http", "url"],
      correct: 0,
      difficulty: "easy"
    },
    {
      question: "What is npm?",
      options: [
        "Node Package Manager",
        "Node Process Manager",
        "New Project Manager",
        "Network Protocol Manager"
      ],
      correct: 0,
      difficulty: "easy"
    },
    {
      question: "Which method is used to start a Node.js server?",
      options: ["server.start()", "server.listen()", "server.run()", "server.init()"],
      correct: 1,
      difficulty: "medium"
    }
  ],
  database: [
    {
      question: "What does SQL stand for?",
      options: [
        "Structured Query Language",
        "Simple Query Language",
        "Standard Question Language",
        "System Query Language"
      ],
      correct: 0,
      difficulty: "easy"
    },
    {
      question: "Which command is used to retrieve data from a database?",
      options: ["GET", "SELECT", "FETCH", "RETRIEVE"],
      correct: 1,
      difficulty: "easy"
    },
    {
      question: "What is a primary key in a database?",
      options: [
        "The first column in a table",
        "A unique identifier for each record",
        "The most important field",
        "A foreign key reference"
      ],
      correct: 1,
      difficulty: "medium"
    },
    { // Extra DB question for Data Engineering overlap
      question: "Which of these is a NoSQL database?",
      options: ["PostgreSQL", "MySQL", "MongoDB", "Oracle"],
      correct: 2,
      difficulty: "easy"
    }
  ],
  python: [
    {
      question: "Which keyword is used to define a function in Python?",
      options: ["function", "def", "func", "define"],
      correct: 1,
      difficulty: "easy"
    },
    {
      question: "What is the correct file extension for Python files?",
      options: [".py", ".python", ".pt", ".pyt"],
      correct: 0,
      difficulty: "easy"
    },
    {
      question: "Which method is used to add an item to a list in Python?",
      options: ["add()", "append()", "insert()", "push()"],
      correct: 1,
      difficulty: "easy"
    }
  ],

  // Data Engineering
  data_engineering: [
    {
      question: "What is generally the first step in an ETL pipeline?",
      options: ["Load", "Transform", "Extract", "Visualize"],
      correct: 2,
      difficulty: "easy"
    },
    {
      question: "Which of the following is a distributed processing framework?",
      options: ["Apache Spark", "jQuery", "Flask", "React"],
      correct: 0,
      difficulty: "medium"
    },
    {
      question: "What is a Data Lake?",
      options: [
        "A structured relational database",
        "A centralized repository for structured and unstructured data",
        "A backup drive",
        "A visualization tool"
      ],
      correct: 1,
      difficulty: "medium"
    }
  ],

  // Network Security
  network_security: [
    {
      question: "What does HTTPS stand for?",
      options: [
        "Hyper Text Transfer Protocol Secure",
        "Hyper Text Transfer Protocol Standard",
        "Hyper Text Transfer Protocol System",
        "Hyper Text Transfer Protocol Simple"
      ],
      correct: 0,
      difficulty: "easy"
    },
    {
      question: "Which attack involves overwhelming a server with traffic?",
      options: ["Phishing", "DDoS", "SQL Injection", "XSS"],
      correct: 1,
      difficulty: "medium"
    },
    {
      question: "What is the purpose of a Firewall?",
      options: [
        "To cool down the server",
        "To monitor and control incoming/outgoing network traffic",
        "To speed up the internet",
        "To virus scan files"
      ],
      correct: 1,
      difficulty: "easy"
    }
  ],

  // AI / ML
  ai_ml: [
    {
      question: "What is Supervised Learning?",
      options: [
        "Learning without any data",
        "Learning where the model is trained on labeled data",
        "Learning where the model discovers patterns in unlabeled data",
        "Learning by trial and error"
      ],
      correct: 1,
      difficulty: "medium"
    },
    {
      question: "Which library is commonly used for deep learning?",
      options: ["TensorFlow", "React", "Lodash", "JQuery"],
      correct: 0,
      difficulty: "easy"
    },
    {
      question: "What is 'Overfitting' in ML?",
      options: [
        "When the model performs well on training data but poorly on new data",
        "When the model is too simple",
        "When the dataset is too small",
        "When the learning rate is too high"
      ],
      correct: 0,
      difficulty: "hard"
    }
  ],

  // DevOps
  devops: [
    {
      question: "What does CI/CD stand for?",
      options: [
        "Code Integration / Code Deployment",
        "Continuous Integration / Continuous Delivery",
        "Computer Interface / Computer Design",
        "Continuous Improvement / Continuous Development"
      ],
      correct: 1,
      difficulty: "easy"
    },
    {
      question: "Which tool is widely used for containerization?",
      options: ["Docker", "Excel", "Photoshop", "Word"],
      correct: 0,
      difficulty: "easy"
    },
    {
      question: "What is Infrastructure as Code (IaC)?",
      options: [
        "Managing infrastructure using physical hardware",
        "Managing and provisioning infrastructure through code files",
        "Writing code for infrastructure companies",
        "Building data centers"
      ],
      correct: 1,
      difficulty: "medium"
    }
  ]
};

// Behavioral questions with scenarios
const behavioralTemplates = [
  {
    question: "How would you handle a situation where you disagree with your team's approach to a problem?",
    options: [
      "Accept the team's decision without discussion",
      "Present my concerns with data and alternative solutions",
      "Work on my own solution separately",
      "Escalate to management immediately"
    ],
    correct: 1,
    difficulty: "medium"
  },
  {
    question: "Describe a time when you had to learn a new technology quickly. How did you approach it?",
    options: [
      "I avoided the project until I felt comfortable",
      "I broke it down into small, manageable steps and practiced daily",
      "I asked someone else to do the work",
      "I only read the documentation without practicing"
    ],
    correct: 1,
    difficulty: "medium"
  },
  {
    question: "How do you prioritize multiple deadlines?",
    options: [
      "Work on whatever comes first",
      "Assess impact and urgency, then communicate with stakeholders",
      "Ask my manager to prioritize for me",
      "Work on the easiest tasks first"
    ],
    correct: 1,
    difficulty: "hard"
  }
];

// Analytical reasoning questions
const analyticalTemplates = [
  {
    question: "If a code deployment takes 15 minutes and you have 4 deployments to complete, what's the minimum time needed if you can run them in parallel?",
    options: ["60 minutes", "45 minutes", "15 minutes", "30 minutes"],
    correct: 2,
    difficulty: "analytical"
  },
  {
    question: "A server handles 1000 requests per minute. If each request takes 50ms to process, what's the server's utilization?",
    options: ["50%", "83.3%", "100%", "16.7%"],
    correct: 1,
    difficulty: "analytical"
  },
  {
    question: "If 3 developers can complete 6 features in 2 weeks, how many weeks would 6 developers need to complete 12 features?",
    options: ["1 week", "2 weeks", "3 weeks", "4 weeks"],
    correct: 1,
    difficulty: "analytical"
  }
];

// Problem-solving scenarios
const problemSolvingTemplates = [
  {
    question: "Your application is running slowly. What's your first step in debugging?",
    options: [
      "Restart the server",
      "Check performance metrics and logs",
      "Add more servers",
      "Blame the database"
    ],
    correct: 1,
    difficulty: "medium"
  },
  {
    question: "A user reports that a feature works on their device but not on another. What's your approach?",
    options: [
      "Tell them to use a different device",
      "Check browser/device compatibility and test on similar setups",
      "Assume it's a user error",
      "Disable the feature for everyone"
    ],
    correct: 1,
    difficulty: "medium"
  }
];

// Generate comprehensive quiz questions
// Added count param to support generating arbitrary amount of questions (e.g. 1000)
export const generateSyntheticQuizQuestions = (count = 1000) => {
  const questions = [];
  let questionId = 1;

  // Flatten all available templates into a single pool with metadata
  const questionPool = [];

  // 1. Technical
  Object.entries(technicalTemplates).forEach(([category, templates]) => {
    templates.forEach(template => {
      questionPool.push({
        category: 'technical',
        subcategory: category,
        ...template,
        points: getPointsByDifficulty(template.difficulty),
        timeLimit: getTimeLimitByDifficulty(template.difficulty)
      });
    });
  });

  // 2. Behavioral
  behavioralTemplates.forEach(template => {
    questionPool.push({
      category: 'behavioral',
      ...template,
      points: getPointsByDifficulty(template.difficulty),
      timeLimit: getTimeLimitByDifficulty(template.difficulty)
    });
  });

  // 3. Analytical
  analyticalTemplates.forEach(template => {
    questionPool.push({
      category: 'analytical',
      ...template,
      points: getPointsByDifficulty(template.difficulty),
      timeLimit: getTimeLimitByDifficulty(template.difficulty)
    });
  });

  // 4. Problem Solving
  problemSolvingTemplates.forEach(template => {
    questionPool.push({
      category: 'problem-solving',
      ...template,
      points: getPointsByDifficulty(template.difficulty),
      timeLimit: getTimeLimitByDifficulty(template.difficulty)
    });
  });

  // Cycle through the pool to generate 'count' questions
  for (let i = 0; i < count; i++) {
    const templateIndex = i % questionPool.length;
    const template = questionPool[templateIndex];

    // Create a unique instance
    questions.push({
      id: questionId++,
      ...template,
      // Add a slight variance to the question text if you want them to seem distinct,
      // or just keep them as duplicates with unique IDs.
      // For now, we keep the content same but ID is unique.
      question: `${template.question} (Variation ${Math.floor(i / questionPool.length) + 1})`
    });
  }

  return questions;
};

// Helper functions
const getPointsByDifficulty = (difficulty) => {
  const pointsMap = {
    easy: 1,
    medium: 2,
    hard: 3,
    analytical: 4
  };
  return pointsMap[difficulty] || 1;
};

const getTimeLimitByDifficulty = (difficulty) => {
  const timeMap = {
    easy: 30,
    medium: 45,
    hard: 60,
    analytical: 90
  };
  return timeMap[difficulty] || 30;
};

// Generate role-specific quizzes
export const generateRoleSpecificQuiz = (role) => {
  // Generate a smaller set for this specific utility function
  const allQuestions = generateSyntheticQuizQuestions(100);

  const roleFilters = {
    'Frontend Developer': ['javascript', 'react', 'problem-solving'],
    'Backend Developer': ['nodejs', 'database', 'python', 'problem-solving'],
    'Full Stack Developer': ['javascript', 'react', 'nodejs', 'database', 'problem-solving'],
    'Software Engineer': ['javascript', 'nodejs', 'database', 'analytical', 'problem-solving', 'software-engineer'],
    'Data Engineer': ['data_engineering', 'database', 'python', 'analytical'],
    'Network Security': ['network_security', 'analytical', 'problem-solving'],
    'AI/ML Engineer': ['ai_ml', 'python', 'analytical', 'problem-solving'],
    'DevOps Engineer': ['devops', 'python', 'problem-solving']
  };

  const categories = roleFilters[role] || ['javascript', 'problem-solving'];

  return allQuestions.filter(q =>
    categories.includes(q.subcategory) ||
    categories.includes(q.category)
  );
};

// Generate adaptive quiz based on candidate's resume
export const generateAdaptiveQuiz = (resumeText, jobDescription) => {
  // Use a reasonable pool size for adaptive generation
  const allQuestions = generateSyntheticQuizQuestions(200);

  // Extract skills from resume
  const resumeSkills = extractSkillsFromText(resumeText);
  const jobSkills = extractSkillsFromText(jobDescription);

  // Prioritize questions that match required skills
  const prioritizedQuestions = allQuestions.map(question => ({
    ...question,
    priority: calculateQuestionPriority(question, resumeSkills, jobSkills)
  }));

  // Sort by priority and select top questions
  prioritizedQuestions.sort((a, b) => b.priority - a.priority);

  return selectBalancedQuiz(prioritizedQuestions);
};

// Extract skills from text (simplified)
const extractSkillsFromText = (text) => {
  const skills = [
    'javascript', 'react', 'nodejs', 'python', 'database', 'sql',
    'html', 'css', 'typescript', 'git', 'aws', 'docker',
    'spark', 'hadoop', 'security', 'firewall', 'machine learning', 'ai', 'devops', 'ci/cd'
  ];

  const foundSkills = [];
  const textLower = text.toLowerCase();

  skills.forEach(skill => {
    if (textLower.includes(skill)) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
};

// Calculate question priority based on skill match
const calculateQuestionPriority = (question, resumeSkills, jobSkills) => {
  let priority = 1;

  if (question.subcategory && jobSkills.includes(question.subcategory)) {
    priority += 3; // High priority for job requirements
  }

  if (question.subcategory && resumeSkills.includes(question.subcategory)) {
    priority += 1; // Medium priority for candidate's existing skills
  }

  if (question.difficulty === 'hard' || question.difficulty === 'analytical') {
    priority += 1; // Slightly higher priority for challenging questions
  }

  return priority;
};

// Select balanced quiz with proper difficulty distribution
const selectBalancedQuiz = (questions) => {
  const easy = questions.filter(q => q.difficulty === 'easy').slice(0, 3);
  const medium = questions.filter(q => q.difficulty === 'medium').slice(0, 4);
  const hard = questions.filter(q => q.difficulty === 'hard').slice(0, 2);
  const analytical = questions.filter(q => q.difficulty === 'analytical').slice(0, 1);

  return [...easy, ...medium, ...hard, ...analytical];
};

// Export the main function
export default {
  generateSyntheticQuizQuestions,
  generateRoleSpecificQuiz,
  generateAdaptiveQuiz
};
