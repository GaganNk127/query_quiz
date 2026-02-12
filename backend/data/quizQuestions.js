import QuizQuestion from '../models/QuizQuestion.js';

// 100 synthetic quiz questions
const quizQuestions = [
  // Easy Questions (1-25)
  {
    id: 1,
    question: "What is the primary purpose of a resume?",
    options: [
      "To list all personal achievements",
      "To secure a job interview",
      "To provide personal contact information",
      "To showcase educational background only"
    ],
    correct: 1,
    difficulty: "easy",
    category: "behavioral",
    points: 1,
    timeLimit: 30
  },
  {
    id: 2,
    question: "Which programming language is primarily used for web development?",
    options: ["Python", "JavaScript", "C++", "Java"],
    correct: 1,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 3,
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Home Tool Markup Language",
      "Hyperlinks and Text Markup Language"
    ],
    correct: 0,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 4,
    question: "Which of the following is a version control system?",
    options: ["Git", "Docker", "Webpack", "npm"],
    correct: 0,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 5,
    question: "What is the main advantage of agile development?",
    options: [
      "Fixed requirements",
      "Flexibility and adaptability",
      "Long development cycles",
      "Extensive documentation"
    ],
    correct: 1,
    difficulty: "easy",
    category: "behavioral",
    points: 1,
    timeLimit: 30
  },
  {
    id: 6,
    question: "Which database type is best for unstructured data?",
    options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
    correct: 2,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 7,
    question: "What does API stand for?",
    options: [
      "Application Programming Interface",
      "Advanced Programming Integration",
      "Automated Process Implementation",
      "Application Process Integration"
    ],
    correct: 0,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 8,
    question: "Which CSS property is used to change text color?",
    options: ["text-color", "color", "font-color", "text-style"],
    correct: 1,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 9,
    question: "What is the purpose of a code review?",
    options: [
      "To find bugs and improve quality",
      "To test the application",
      "To deploy the code",
      "To write documentation"
    ],
    correct: 0,
    difficulty: "easy",
    category: "behavioral",
    points: 1,
    timeLimit: 30
  },
  {
    id: 10,
    question: "Which HTTP method is used to retrieve data?",
    options: ["POST", "GET", "PUT", "DELETE"],
    correct: 1,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 11,
    question: "What is the primary function of an operating system?",
    options: [
      "To run applications",
      "To manage hardware resources",
      "To provide internet access",
      "To store files"
    ],
    correct: 1,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 12,
    question: "Which of the following is a cloud computing platform?",
    options: ["AWS", "GitHub", "VS Code", "Chrome"],
    correct: 0,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 13,
    question: "What does CSS stand for?",
    options: [
      "Computer Style Sheets",
      "Creative Style Sheets",
      "Cascading Style Sheets",
      "Colorful Style Sheets"
    ],
    correct: 2,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 14,
    question: "Which tool is used for package management in JavaScript?",
    options: ["Git", "npm", "Docker", "Webpack"],
    correct: 1,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 15,
    question: "What is the purpose of unit testing?",
    options: [
      "To test individual components",
      "To test the entire application",
      "To test user interfaces",
      "To test performance"
    ],
    correct: 0,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 16,
    question: "Which data structure uses LIFO principle?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correct: 1,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 17,
    question: "What is the main purpose of a firewall?",
    options: [
      "To speed up internet",
      "To block unauthorized access",
      "To store data",
      "To run applications"
    ],
    correct: 1,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 18,
    question: "Which protocol is used for secure web communication?",
    options: ["HTTP", "HTTPS", "FTP", "SMTP"],
    correct: 1,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 19,
    question: "What is the purpose of responsive design?",
    options: [
      "To make websites work on all devices",
      "To improve website speed",
      "To add animations",
      "To increase security"
    ],
    correct: 0,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 20,
    question: "Which of the following is a NoSQL database?",
    options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
    correct: 2,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 21,
    question: "What is the primary benefit of using Git?",
    options: [
      "Code collaboration and version control",
      "Code compilation",
      "Code deployment",
      "Code testing"
    ],
    correct: 0,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 22,
    question: "Which JavaScript framework is developed by Facebook?",
    options: ["Angular", "Vue", "React", "Svelte"],
    correct: 2,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 23,
    question: "What is the purpose of an algorithm?",
    options: [
      "To solve a problem step by step",
      "To store data",
      "To design UI",
      "To connect to database"
    ],
    correct: 0,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 24,
    question: "Which of the following is a mobile app development framework?",
    options: ["React Native", "React", "Angular", "Vue"],
    correct: 0,
    difficulty: "easy",
    category: "technical",
    points: 1,
    timeLimit: 30
  },
  {
    id: 25,
    question: "What is the main purpose of documentation in software development?",
    options: [
      "To explain how the code works",
      "To write tests",
      "To deploy the application",
      "To optimize performance"
    ],
    correct: 0,
    difficulty: "easy",
    category: "behavioral",
    points: 1,
    timeLimit: 30
  },

  // Medium Questions (26-50)
  {
    id: 26,
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
    correct: 1,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 27,
    question: "Which design pattern is used to create objects without specifying the exact class?",
    options: ["Singleton", "Factory", "Observer", "Decorator"],
    correct: 1,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 28,
    question: "What is the purpose of REST in web services?",
    options: [
      "To define architectural constraints",
      "To secure data transmission",
      "To format XML data",
      "To compile JavaScript"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 29,
    question: "Which of the following is a characteristic of microservices architecture?",
    options: [
      "Single monolithic application",
      "Independent deployable services",
      "Shared database for all services",
      "Centralized configuration"
    ],
    correct: 1,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 30,
    question: "What is the purpose of CI/CD in software development?",
    options: [
      "Automated testing and deployment",
      "Code documentation",
      "User interface design",
      "Database management"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 31,
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: ["Bubble Sort", "Quick Sort", "Selection Sort", "Insertion Sort"],
    correct: 1,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 32,
    question: "What is the purpose of a load balancer?",
    options: [
      "To distribute network traffic",
      "To store user data",
      "To compile code",
      "To test applications"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 33,
    question: "Which of the following is a principle of SOLID design?",
    options: [
      "Single Responsibility Principle",
      "Multiple Responsibility Principle",
      "Complex Code Principle",
      "Rigid Design Principle"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 34,
    question: "What is the purpose of indexing in databases?",
    options: [
      "To speed up data retrieval",
      "To increase storage space",
      "To encrypt data",
      "To backup data"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 35,
    question: "Which of the following is a characteristic of functional programming?",
    options: [
      "Immutable data",
      "Mutable state",
      "Object-oriented design",
      "Class inheritance"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 36,
    question: "What is the purpose of a container in DevOps?",
    options: [
      "To package applications with dependencies",
      "To store source code",
      "To compile programs",
      "To test user interfaces"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 37,
    question: "Which of the following is a NoSQL database type?",
    options: ["Document-based", "Table-based", "Relational", "Hierarchical"],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 38,
    question: "What is the purpose of middleware in Express.js?",
    options: [
      "To process requests before route handlers",
      "To store user data",
      "To render HTML",
      "To connect to database"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 39,
    question: "Which of the following is a characteristic of a good API design?",
    options: [
      "Consistent and intuitive endpoints",
      "Complex authentication",
      "Large response payloads",
      "Frequent breaking changes"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 40,
    question: "What is the purpose of caching in web applications?",
    options: [
      "To improve performance by storing frequently accessed data",
      "To increase security",
      "To backup data",
      "To compile code"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 41,
    question: "Which of the following is a type of software testing?",
    options: ["Integration testing", "Code compilation", "API design", "Database indexing"],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 42,
    question: "What is the purpose of a CDN (Content Delivery Network)?",
    options: [
      "To distribute content globally for faster access",
      "To store source code",
      "To compile applications",
      "To test user interfaces"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 43,
    question: "Which of the following is a characteristic of event-driven architecture?",
    options: [
      "Components communicate through events",
      "Synchronous communication",
      "Centralized control",
      "Monolithic structure"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 44,
    question: "What is the purpose of a reverse proxy?",
    options: [
      "To forward client requests to appropriate servers",
      "To store user data",
      "To compile code",
      "To test applications"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 45,
    question: "Which of the following is a principle of agile development?",
    options: [
      "Working software over comprehensive documentation",
      "Detailed planning over working software",
      "Large teams over small teams",
      "Fixed requirements over changing requirements"
    ],
    correct: 0,
    difficulty: "medium",
    category: "behavioral",
    points: 2,
    timeLimit: 45
  },
  {
    id: 46,
    question: "What is the purpose of a state management library in React?",
    options: [
      "To manage application state across components",
      "To style components",
      "To handle routing",
      "To make API calls"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 47,
    question: "Which of the following is a characteristic of a scalable system?",
    options: [
      "Can handle increased load by adding resources",
      "Fixed capacity",
      "Single point of failure",
      "Monolithic architecture"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 48,
    question: "What is the purpose of a build tool like Webpack?",
    options: [
      "To bundle and optimize assets",
      "To write tests",
      "To deploy applications",
      "To design user interfaces"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 49,
    question: "Which of the following is a type of database join?",
    options: ["INNER JOIN", "SELECT JOIN", "UPDATE JOIN", "DELETE JOIN"],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },
  {
    id: 50,
    question: "What is the purpose of environment variables?",
    options: [
      "To store configuration outside of code",
      "To write documentation",
      "To compile applications",
      "To test user interfaces"
    ],
    correct: 0,
    difficulty: "medium",
    category: "technical",
    points: 2,
    timeLimit: 45
  },

  // Hard Questions (51-75)
  {
    id: 51,
    question: "What is the time complexity of Dijkstra's algorithm with a binary heap?",
    options: ["O(V^2)", "O(E + V log V)", "O(V log V)", "O(E log V)"],
    correct: 1,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 52,
    question: "Which of the following is a characteristic of CAP theorem?",
    options: [
      "A distributed system can only guarantee 2 of 3 properties",
      "All distributed systems guarantee all 3 properties",
      "Only consistency is important",
      "Only availability is important"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 53,
    question: "What is the purpose of a distributed hash table?",
    options: [
      "To distribute data across multiple nodes",
      "To hash passwords",
      "To compile code",
      "To store local files"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 54,
    question: "Which of the following is a characteristic of eventual consistency?",
    options: [
      "System will become consistent over time",
      "Immediate consistency across all nodes",
      "Strong consistency guarantees",
      "No consistency guarantees"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 55,
    question: "What is the purpose of a circuit breaker pattern?",
    options: [
      "To prevent cascading failures",
      "To improve performance",
      "To store data",
      "To compile code"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 56,
    question: "Which of the following is a characteristic of a distributed transaction?",
    options: [
      "Involves multiple nodes/resources",
      "Single node transaction",
      "No rollback mechanism",
      "Immediate commit"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 57,
    question: "What is the purpose of a message queue in distributed systems?",
    options: [
      "Asynchronous communication between services",
      "Synchronous communication",
      "Data storage",
      "Code compilation"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 58,
    question: "Which of the following is a characteristic of sharding?",
    options: [
      "Horizontal partitioning of data",
      "Vertical partitioning of data",
      "Data replication",
      "Data backup"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 59,
    question: "What is the purpose of a consensus algorithm?",
    options: [
      "To achieve agreement among distributed nodes",
      "To optimize performance",
      "To store data",
      "To compile code"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 60,
    question: "Which of the following is a characteristic of a distributed cache?",
    options: [
      "Cache distributed across multiple nodes",
      "Single node cache",
      "Database storage",
      "File system storage"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 61,
    question: "What is the purpose of a service mesh?",
    options: [
      "To manage service-to-service communication",
      "To store user data",
      "To compile applications",
      "To design user interfaces"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 62,
    question: "Which of the following is a characteristic of serverless architecture?",
    options: [
      "No server management required",
      "Fixed server allocation",
      "Manual scaling",
      "Long-running processes"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 63,
    question: "What is the purpose of a distributed tracing system?",
    options: [
      "To track requests across multiple services",
      "To store user data",
      "To compile code",
      "To test applications"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 64,
    question: "Which of the following is a characteristic of a polyglot persistence system?",
    options: [
      "Using multiple database technologies",
      "Single database technology",
      "No database usage",
      "Only SQL databases"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 65,
    question: "What is the purpose of a distributed lock?",
    options: [
      "To coordinate access to shared resources",
      "To improve performance",
      "To store data",
      "To compile code"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 66,
    question: "Which of the following is a characteristic of a CQRS pattern?",
    options: [
      "Separate read and write models",
      "Single model for reads and writes",
      "No separation of concerns",
      "Only write operations"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 67,
    question: "What is the purpose of a distributed file system?",
    options: [
      "To provide file access across multiple machines",
      "To store local files only",
      "To compile code",
      "To test applications"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 68,
    question: "Which of the following is a characteristic of a blockchain?",
    options: [
      "Immutable distributed ledger",
      "Centralized database",
      "Mutable data",
      "Single point of failure"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 69,
    question: "What is the purpose of a distributed search engine?",
    options: [
      "To search across multiple nodes",
      "To search local files only",
      "To compile code",
      "To store data"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 70,
    question: "Which of the following is a characteristic of a graph database?",
    options: [
      "Stores data in nodes and relationships",
      "Tabular data structure",
      "Document-based storage",
      "Key-value pairs"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 71,
    question: "What is the purpose of a distributed computing framework?",
    options: [
      "To process large datasets across multiple nodes",
      "To process data on a single machine",
      "To store user data",
      "To compile applications"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 72,
    question: "Which of the following is a characteristic of a time-series database?",
    options: [
      "Optimized for time-based data",
      "General purpose database",
      "Document storage",
      "Graph structure"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 73,
    question: "What is the purpose of a distributed configuration service?",
    options: [
      "To manage configuration across multiple services",
      "To store user data",
      "To compile code",
      "To test applications"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 74,
    question: "Which of the following is a characteristic of a stream processing system?",
    options: [
      "Processes data in real-time",
      "Batch processing only",
      "No real-time capabilities",
      "Static data analysis"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },
  {
    id: 75,
    question: "What is the purpose of a distributed monitoring system?",
    options: [
      "To monitor multiple services and nodes",
      "To monitor a single service",
      "To compile code",
      "To store user data"
    ],
    correct: 0,
    difficulty: "hard",
    category: "technical",
    points: 3,
    timeLimit: 60
  },

  // Analytical Questions (76-100)
  {
    id: 76,
    question: "A company has 100 employees. If 20% work remotely, 30% work hybrid, and the rest work in-office, how many employees work in-office?",
    options: ["50", "60", "40", "70"],
    correct: 0,
    difficulty: "analytical",
    category: "logical_reasoning",
    points: 4,
    timeLimit: 90
  },
  {
    id: 77,
    question: "If a project takes 10 days to complete with 5 developers, how many days would it take with 10 developers (assuming linear scaling)?",
    options: ["5 days", "10 days", "2 days", "20 days"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 78,
    question: "A server can handle 1000 requests per minute. If traffic increases by 50%, how many requests per minute can the server handle after scaling?",
    options: ["1500", "1000", "2000", "500"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 79,
    question: "If a database query takes 2 seconds to execute and processes 100 records, how long would it take to process 500 records (assuming linear scaling)?",
    options: ["10 seconds", "2 seconds", "5 seconds", "20 seconds"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 80,
    question: "A team has 8 members. If they need to form pairs for code review, how many unique pairs can be formed?",
    options: ["28", "8", "16", "64"],
    correct: 0,
    difficulty: "analytical",
    category: "logical_reasoning",
    points: 4,
    timeLimit: 90
  },
  {
    id: 81,
    question: "If a bug has a 30% chance of occurring in each release, what is the probability that it occurs in at least one of three independent releases?",
    options: ["65.7%", "30%", "90%", "70%"],
    correct: 0,
    difficulty: "analytical",
    category: "logical_reasoning",
    points: 4,
    timeLimit: 90
  },
  {
    id: 82,
    question: "A website has 10,000 daily visitors. If the conversion rate is 2%, how many visitors convert to customers?",
    options: ["200", "100", "500", "1000"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 83,
    question: "If a developer can write 100 lines of code per day, how many days would it take to write a 10,000-line application?",
    options: ["100 days", "10 days", "50 days", "200 days"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 84,
    question: "A system has 99.9% uptime. How many minutes of downtime is this per month (30 days)?",
    options: ["43.2 minutes", "10 minutes", "60 minutes", "30 minutes"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 85,
    question: "If a test suite has 100 tests and 5 fail, what is the test success rate?",
    options: ["95%", "90%", "85%", "99%"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 86,
    question: "A company spends $10,000 on cloud services monthly. If they optimize and reduce costs by 25%, what is the new monthly cost?",
    options: ["$7,500", "$8,000", "$9,000", "$6,000"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 87,
    question: "If a team completes 20 sprints in a year and each sprint is 2 weeks, what percentage of the year is spent in active development?",
    options: ["76.9%", "50%", "80%", "100%"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 88,
    question: "A database has 1 million records. If the average record size is 1KB, what is the total database size?",
    options: ["1 GB", "100 MB", "10 GB", "1 TB"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 89,
    question: "If an API has a rate limit of 1000 requests per hour, how many requests per second is this approximately?",
    options: ["0.28", "16.67", "1000", "60"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 90,
    question: "A team of 5 developers works 8 hours daily. If they work on a project for 10 days, what is the total person-hours invested?",
    options: ["400 hours", "80 hours", "200 hours", "500 hours"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 91,
    question: "If a website loads in 2 seconds and we want to improve it by 50%, what should be the new loading time?",
    options: ["1 second", "1.5 seconds", "0.5 seconds", "3 seconds"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 92,
    question: "A company has 3 development teams. If each team has 4 members and 2 members are shared between teams, how many unique developers are there?",
    options: ["10", "12", "8", "14"],
    correct: 0,
    difficulty: "analytical",
    category: "logical_reasoning",
    points: 4,
    timeLimit: 90
  },
  {
    id: 93,
    question: "If a server's CPU usage is 60% and memory usage is 40%, what is the average resource utilization?",
    options: ["50%", "60%", "40%", "100%"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 94,
    question: "A project has 5 phases. If each phase takes 20% of the total time and phase 3 is delayed by 50%, what is the total project delay?",
    options: ["10%", "20%", "5%", "50%"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 95,
    question: "If a codebase has 10,000 lines and 20% are comments, how many lines of actual code are there?",
    options: ["8,000", "2,000", "10,000", "12,000"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 96,
    question: "A system processes 100 transactions per second. If we need to process 500 transactions per second, by what factor do we need to scale?",
    options: ["5x", "2x", "10x", "50x"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 97,
    question: "If a team fixes 10 bugs per week and there are 50 bugs to fix, how many weeks will it take?",
    options: ["5 weeks", "10 weeks", "2 weeks", "50 weeks"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 98,
    question: "A website has a bounce rate of 40%. If 1000 visitors come, how many stay on the site?",
    options: ["600", "400", "1000", "500"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  },
  {
    id: 99,
    question: "If a deployment pipeline has 5 stages and each stage has a 95% success rate, what is the overall success probability?",
    options: ["77.4%", "95%", "75%", "100%"],
    correct: 0,
    difficulty: "analytical",
    category: "logical_reasoning",
    points: 4,
    timeLimit: 90
  },
  {
    id: 100,
    question: "A company wants to reduce technical debt from 80% to 20%. By what percentage do they need to improve?",
    options: ["75%", "60%", "80%", "25%"],
    correct: 0,
    difficulty: "analytical",
    category: "problem_solving",
    points: 4,
    timeLimit: 90
  }
];

// Function to seed quiz questions
export const seedQuizQuestions = async () => {
  try {
    await QuizQuestion.deleteMany({});
    await QuizQuestion.insertMany(quizQuestions);
    console.log('Quiz questions seeded successfully');
  } catch (error) {
    console.error('Error seeding quiz questions:', error);
  }
};

export { quizQuestions };
export default quizQuestions;
