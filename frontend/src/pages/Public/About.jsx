import { Link } from 'react-router-dom'
import { 
  Target, 
  Users, 
  Brain, 
  Shield, 
  Globe, 
  Award,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

export default function About() {
  const teamMembers = [
    {
      name: 'Dr. Sarah Williams',
      role: 'CEO & Co-Founder',
      bio: 'Former HR executive at Fortune 500 companies with 15+ years in recruitment technology.',
      image: '/api/placeholder/200/200'
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-Founder',
      bio: 'AI/ML expert from Google with expertise in natural language processing and computer vision.',
      image: '/api/placeholder/200/200'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      bio: 'Product leader with experience building scalable SaaS platforms for enterprise clients.',
      image: '/api/placeholder/200/200'
    },
    {
      name: 'David Kim',
      role: 'Lead AI Engineer',
      bio: 'Specialist in TensorFlow.js and browser-based machine learning applications.',
      image: '/api/placeholder/200/200'
    }
  ]

  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      description: 'We\'re committed to making recruitment fair, efficient, and data-driven for everyone.'
    },
    {
      icon: Brain,
      title: 'Innovation First',
      description: 'Pushing the boundaries of AI to solve real-world recruitment challenges.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your data and privacy are our highest priorities with enterprise-grade security.'
    },
    {
      icon: Users,
      title: 'User-Centric',
      description: 'Every feature is designed with the user experience at its core.'
    }
  ]

  const achievements = [
    { number: '10K+', label: 'Companies Using SmartRecruit' },
    { number: '500K+', label: 'Candidates Assessed' },
    { number: '95%', label: 'Customer Satisfaction' },
    { number: '24/7', label: 'Support Available' }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About SmartRecruit AI
            </h1>
            <p className="text-xl max-w-3xl mx-auto text-white/90">
              We're revolutionizing recruitment with cutting-edge AI technology, 
              making hiring more efficient, fair, and data-driven.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                SmartRecruit AI is on a mission to transform the recruitment industry by 
                leveraging artificial intelligence to create more efficient, unbiased, and 
                data-driven hiring processes.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                We believe that the right talent can transform organizations, and our 
                platform helps companies discover that talent faster and more accurately 
                than ever before.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Reduce Hiring Bias
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      AI-powered analysis removes unconscious bias from candidate evaluation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Save Time & Resources
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Automate 80% of the screening process and focus on high-value interactions.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Improve Hiring Quality
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Data-driven insights lead to better hiring decisions and reduced turnover.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
                <Brain className="h-32 w-32 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              The experts behind SmartRecruit AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-primary font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-white/90">
              Numbers that speak for themselves
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {achievement.number}
                </div>
                <div className="text-lg text-white/90">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Cutting-Edge Technology
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Powered by the latest advances in AI and machine learning
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Our Tech Stack
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    TensorFlow.js for browser-based AI processing
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    BlazeFace model for real-time proctoring
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Natural language processing for resume analysis
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    MongoDB Atlas for scalable data storage
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    React.js for responsive user interfaces
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Security & Compliance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    GDPR compliant data handling
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    End-to-end encryption for sensitive data
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Regular security audits and penetration testing
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    SOC 2 Type II certified infrastructure
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Join the Revolution?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Experience the future of recruitment with SmartRecruit AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="btn btn-primary px-8 py-4 text-lg font-semibold"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="btn btn-outline px-8 py-4 text-lg font-semibold"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
