import { Link } from 'react-router-dom'
import { 
  Brain, 
  FileText, 
  Users, 
  Shield, 
  Zap, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp
} from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered ATS',
      description: 'Advanced resume analysis with TensorFlow.js for accurate candidate scoring'
    },
    {
      icon: FileText,
      title: 'Smart Quiz Generation',
      description: 'Automated quiz creation with balanced difficulty levels and comprehensive evaluation'
    },
    {
      icon: Shield,
      title: 'AI Proctoring',
      description: 'Real-time monitoring with BlazeFace detection to ensure assessment integrity'
    },
    {
      icon: Users,
      title: 'Candidate Management',
      description: 'Streamlined workflow for recruiters to manage and evaluate applicants efficiently'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get immediate feedback on ATS scores and quiz performance'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights for data-driven recruitment decisions'
    }
  ]

  const stats = [
    { label: 'ATS Accuracy', value: '95%', description: 'Resume matching precision' },
    { label: 'Time Saved', value: '70%', description: 'Reduction in screening time' },
    { label: 'Candidate Quality', value: '85%', description: 'Improvement in hire quality' },
    { label: 'Proctoring Success', value: '99%', description: 'Assessment integrity rate' }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'HR Director',
      company: 'TechCorp Inc.',
      content: 'SmartRecruit AI has transformed our hiring process. The ATS scoring is incredibly accurate, and the automated quizzes save us countless hours.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Recruitment Manager',
      company: 'StartupHub',
      content: 'The AI proctoring feature gives us confidence in remote assessments. We\'ve hired amazing candidates through this platform.',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'Software Developer',
      company: 'DevStudio',
      content: 'As a candidate, I loved the seamless experience. The quiz was challenging but fair, and I got immediate feedback on my performance.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Revolutionize Your
              <span className="block text-yellow-300">Recruitment Process</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              AI-powered applicant tracking, intelligent assessments, and automated proctoring - 
              all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/register"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg transition-colors inline-flex items-center justify-center"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-lg transition-colors inline-flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Recruitment
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to streamline your hiring process and find the perfect candidates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How SmartRecruit AI Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, efficient, and intelligent hiring in three steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Resume Upload & ATS Analysis
              </h3>
              <p className="text-gray-600">
                Candidates upload resumes and our AI analyzes them against job descriptions for accurate matching.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Automated Quiz Assessment
              </h3>
              <p className="text-gray-600">
                Qualified candidates take AI-generated quizzes with real-time proctoring to ensure authenticity.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Smart Shortlisting & Hiring
              </h3>
              <p className="text-gray-600">
                Recruiters review comprehensive candidate profiles and make data-driven hiring decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Leading Companies
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about SmartRecruit AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of companies using AI to make better hiring decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg transition-colors inline-flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/auth/login"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-lg transition-colors inline-flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
