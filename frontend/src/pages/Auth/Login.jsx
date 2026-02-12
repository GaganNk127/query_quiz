import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Briefcase, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'candidate'
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // FIX: Remove old stale token to prevent failed second-login
      localStorage.removeItem('token')

      const result = await login(formData.email, formData.password)

      if (result.success) {
        toast.success('Login successful!')

        navigate(`/${formData.role}/dashboard`)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your SmartRecruit AI account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, role: 'candidate' }))}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all 
            ${formData.role === 'candidate'
                ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
          >
            <User className="h-6 w-6 mb-2" />
            <span className="font-medium">Candidate</span>
          </button>

          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, role: 'recruiter' }))}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all 
            ${formData.role === 'recruiter'
                ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
          >
            <Briefcase className="h-6 w-6 mb-2" />
            <span className="font-medium">Recruiter</span>
          </button>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input pl-10"
              placeholder="john@example.com"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input pl-10 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Login button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3 h-12 text-base font-semibold"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Don't have an account?{" "}
          <Link to="/auth/register" className="text-blue-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
