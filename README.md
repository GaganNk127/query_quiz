

# SmartRecruit AI

A comprehensive MERN stack recruitment platform that leverages AI and machine learning to streamline the hiring process for both candidates and recruiters.

## 🚀 Features

### For Candidates
- **Resume Upload & ATS Analysis**: AI-powered resume scoring using TensorFlow.js
- **Assessment Quiz**: 10-question adaptive quiz with proctoring
- **Job Search & Applications**: Browse and apply to relevant job opportunities
- **Real-time Feedback**: Instant ATS scoring with improvement suggestions
- **Profile Management**: Comprehensive profile with skills, education, and portfolio

### For Recruiters
- **Job Posting**: Create and manage job listings with detailed requirements
- **Candidate Screening**: ATS-powered candidate filtering and ranking
- **Quiz Results**: View detailed assessment results and proctoring reports
- **Email Notifications**: Automated emails for shortlisting and rejections
- **Analytics Dashboard**: Track recruitment metrics and candidate pipeline

### AI/ML Features
- **ATS Scoring**: Jaccard and cosine similarity algorithms
- **Face Detection**: BlazeFace model for quiz proctoring
- **Text Processing**: Natural language processing for resume analysis
- **Cheating Detection**: Real-time monitoring during assessments

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** with dark mode support
- **Zustand** for state management
- **React Router v6** for navigation
- **Axios** for API calls with interceptors
- **TensorFlow.js** and BlazeFace for proctoring
- **PDF.js** for resume text extraction
- **EmailJS** for email notifications
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **TensorFlow.js** for ATS scoring
- **Natural** for text processing
- **bcryptjs** for password hashing
- **Helmet** for security
- **Rate limiting** for API protection

## 📁 Project Structure

```
SmartRecruit AI/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   ├── Auth/
│   │   │   ├── Navbar/
│   │   │   └── Sidebar/
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   ├── Public/
│   │   │   ├── Candidate/
│   │   │   └── Recruiter/
│   │   ├── store/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── data/
│   ├── scripts/
│   ├── uploads/
│   ├── package.json
│   └── render.yaml
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB Atlas account
- EmailJS account (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smartrecruit-ai.git
   cd smartrecruit-ai
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   
   **Backend (.env)**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartrecruit
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   ```
   
   **Frontend (.env)**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
   VITE_EMAILJS_TEMPLATE_SHORTLIST=your_shortlist_template_id
   VITE_EMAILJS_TEMPLATE_REJECTION=your_rejection_template_id
   VITE_EMAILJS_TEMPLATE_QUIZ_ASSIGNED=your_quiz_assigned_template_id
   ```

4. **Seed the database**
   ```bash
   cd backend
   npm run seed
   ```

5. **Start the development servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  role: String, // 'candidate' or 'recruiter'
  profile: {
    phone: String,
    location: String,
    bio: String,
    website: String,
    linkedin: String,
    github: String
  }
}
```

### Job Model
```javascript
{
  title: String,
  company: String,
  description: String,
  requirements: String,
  responsibilities: String,
  skills: [String],
  experience: String,
  location: String,
  type: String,
  department: String,
  salary: {
    min: Number,
    max: Number,
    currency: String
  },
  benefits: [String],
  status: String,
  postedBy: ObjectId,
  applicants: [ObjectId]
}
```

### Candidate Model
```javascript
{
  user: ObjectId,
  resumeText: String,
  resumeUrl: String,
  atsScore: Number,
  quizAssignment: {
    questions: [Object],
    assignedAt: Date,
    expiresAt: Date
  },
  quizScore: Number,
  quizAnswers: [Object],
  cheatingDetected: Boolean,
  proctoringLog: [Object],
  shortlisted: Boolean,
  appliedJobs: [ObjectId],
  skills: [String],
  experience: String,
  education: [Object],
  portfolio: String
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create job (recruiter only)
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job (recruiter only)
- `DELETE /api/jobs/:id` - Delete job (recruiter only)
- `POST /api/jobs/:id/apply` - Apply to job (candidate only)

### Candidates
- `POST /api/candidates/upload-resume` - Upload resume
- `GET /api/candidates/profile` - Get candidate profile
- `PUT /api/candidates/profile` - Update candidate profile
- `GET /api/candidates/ats-passed` - Get ATS-qualified candidates (recruiter only)
- `POST /api/candidates/:id/shortlist` - Shortlist candidate (recruiter only)

### Quiz
- `POST /api/quiz/generate` - Generate quiz questions
- `POST /api/quiz/submit-answer` - Submit quiz answer
- `POST /api/quiz/complete` - Complete quiz
- `GET /api/quiz/results` - Get quiz results
- `POST /api/quiz/proctoring` - Log proctoring event

## 🎯 Core Features Explained

### ATS Scoring System
The ATS system uses multiple algorithms to score resumes:
- **Jaccard Similarity**: Measures keyword overlap
- **Cosine Similarity**: Analyzes semantic similarity
- **Skill Matching**: Extracts and matches required skills
- **Experience Analysis**: Evaluates experience level relevance

### Quiz Proctoring
Real-time monitoring during assessments:
- **Face Detection**: Uses BlazeFace to monitor candidate presence
- **Tab Switching**: Detects when user leaves the assessment window
- **Multiple Faces**: Alerts if multiple people are detected
- **Head Position**: Monitors if candidate is looking away

### Email Notifications
Automated emails powered by EmailJS:
- **Shortlist Notifications**: Congratulatory emails for shortlisted candidates
- **Rejection Notices**: Professional rejection emails
- **Quiz Assignments**: Notifications for assessment requirements
- **Custom Messages**: Personalized communication options

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render)
1. Connect your GitHub repository to Render
2. Configure `render.yaml` file
3. Set environment variables in Render dashboard
4. Deploy automatically on push to main branch

### Environment Variables
**Production Variables:**
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Secure JWT secret key
- `VITE_API_URL`: Production API URL
- `VITE_EMAILJS_*`: EmailJS configuration keys

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage
- Authentication flows
- API endpoints
- ATS scoring algorithms
- Quiz functionality
- Proctoring system

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Cross-origin request security
- **Helmet.js**: Security headers implementation
- **File Upload Validation**: Secure PDF upload handling
- **Input Sanitization**: Prevent XSS attacks

## 📈 Performance Optimization

- **Lazy Loading**: Code splitting for better performance
- **Image Optimization**: Responsive images with WebP support
- **Caching Strategy**: Browser and API caching
- **Database Indexing**: Optimized MongoDB queries
- **Compression**: Gzip compression for faster load times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TensorFlow.js** for machine learning capabilities
- **BlazeFace** for face detection
- **EmailJS** for email services
- **Tailwind CSS** for beautiful UI
- **Lucide** for amazing icons

## 📞 Support

For support, please email admin@smartrecruit.ai or create an issue on GitHub.

## 🗺 Roadmap

- [ ] Advanced AI matching algorithms
- [ ] Video interview integration
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with ATS systems
- [ ] Multi-language support
- [ ] Calendar integration for scheduling
- [ ] Automated interview scheduling

---

**Built with ❤️ by the SmartRecruit AI Team**
#
