import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Briefcase, 
  FileText, 
  Users, 
  PlusCircle, 
  List,
  User,
  Settings,
  HelpCircle,
  X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useUIStore } from '../../store/authStore'

export default function Sidebar() {
  const { user, isCandidate, isRecruiter } = useAuth()
  const { sidebarOpen, closeSidebar } = useUIStore()
  const location = useLocation()

  const getCandidateNavItems = () => [
    {
      path: '/candidate/dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview and stats'
    },
    {
      path: '/candidate/jobs',
      label: 'Job Listings',
      icon: Briefcase,
      description: 'Browse available jobs'
    },
    {
      path: '/candidate/resume-upload',
      label: 'Resume Upload',
      icon: FileText,
      description: 'Upload and analyze resume'
    },
    {
      path: '/candidate/quiz',
      label: 'Quiz',
      icon: List,
      description: 'Take assessment quiz'
    },
    {
      path: '/candidate/quiz-results',
      label: 'Quiz Results',
      icon: Settings,
      description: 'View quiz performance'
    },
    {
      path: '/candidate/profile',
      label: 'Profile',
      icon: User,
      description: 'Manage your profile'
    }
  ]

  const getRecruiterNavItems = () => [
    {
      path: '/recruiter/dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview and analytics'
    },
    {
      path: '/recruiter/job-posting',
      label: 'Post Job',
      icon: PlusCircle,
      description: 'Create new job posting'
    },
    {
      path: '/recruiter/job-management',
      label: 'Manage Jobs',
      icon: Briefcase,
      description: 'View and edit job postings'
    },
    {
      path: '/recruiter/candidates',
      label: 'Candidates',
      icon: Users,
      description: 'View applicant list'
    },
    {
      path: '/recruiter/profile',
      label: 'Profile',
      icon: User,
      description: 'Manage your profile'
    }
  ]

  const navItems = isCandidate() 
    ? getCandidateNavItems() 
    : isRecruiter() 
    ? getRecruiterNavItems() 
    : []

  if (!user) return null

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <span className="text-lg font-semibold text-gray-900">
            Menu
          </span>
          <button
            onClick={closeSidebar}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SR</span>
            </div>
            <span className="ml-3 text-lg font-semibold text-gray-900">
              SmartRecruit AI
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                  }`} />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className={`text-xs ${
                      isActive ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/about"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <HelpCircle className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Help & Support</div>
                <div className="text-xs text-gray-500">
                  Get assistance
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
