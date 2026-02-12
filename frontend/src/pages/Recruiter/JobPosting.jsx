import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building,
  Plus,
  X,
  Save,
  Eye,
  Users
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function JobPosting() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    responsibilities: '',
    skills: [],
    experience: '',
    location: '',
    type: 'Full-time',
    department: '',
    salary: {
      min: '',
      max: '',
      currency: 'USD'
    },
    benefits: [],
    status: 'active'
  })
  const [skillInput, setSkillInput] = useState('')
  const [benefitInput, setBenefitInput] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleAddBenefit = () => {
    if (benefitInput.trim() && !formData.benefits.includes(benefitInput.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefitInput.trim()]
      }))
      setBenefitInput('')
    }
  }

  const handleRemoveBenefit = (benefitToRemove) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(benefit => benefit !== benefitToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title || !formData.description || !formData.requirements) {
      toast.error('Please fill in all required fields')
      return
    }
    
    if (formData.skills.length === 0) {
      toast.error('Please add at least one skill')
      return
    }

    setLoading(true)
    
    try {
      const response = await axios.post('/api/jobs', formData)
      toast.success('Job posted successfully!')
      navigate('/recruiter/job-management')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    
    try {
      const draftData = { ...formData, status: 'draft' }
      await axios.post('/api/jobs', draftData)
      toast.success('Draft saved successfully!')
    } catch (error) {
      toast.error('Failed to save draft')
    } finally {
      setLoading(false)
    }
  }

  const jobTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Internship',
    'Remote',
    'Hybrid'
  ]

  const experienceLevels = [
    'Entry Level',
    'Mid Level',
    'Senior Level',
    'Lead/Manager',
    'Executive'
  ]

  const departments = [
    'Engineering',
    'Design',
    'Marketing',
    'Sales',
    'HR',
    'Finance',
    'Operations',
    'Customer Support',
    'Product',
    'Data'
  ]

  if (previewMode) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Job Preview
            </h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(false)}
                className="btn btn-outline"
              >
                Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {formData.title || 'Job Title'}
              </h2>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                <span>{formData.company || 'Company Name'}</span>
                <span>•</span>
                <span>{formData.location || 'Location'}</span>
                <span>•</span>
                <span>{formData.type}</span>
              </div>
            </div>

            {formData.salary.min && formData.salary.max && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formData.salary.currency} {formData.salary.min} - {formData.salary.max}
                  </span>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                About the Role
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {formData.description || 'Job description will appear here...'}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Responsibilities
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {formData.responsibilities || 'Responsibilities will appear here...'}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Requirements
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {formData.requirements || 'Requirements will appear here...'}
              </p>
            </div>

            {formData.skills.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {formData.benefits.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Benefits
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  {formData.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Post New Job
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create a new job posting to attract qualified candidates
            </p>
          </div>
          <button
            onClick={() => setPreviewMode(true)}
            className="btn btn-outline flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="input"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  className="input"
                  placeholder="e.g. TechCorp Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="input"
                  placeholder="e.g. New York, NY or Remote"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="input"
                >
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Experience Level *
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  required
                  className="input"
                >
                  <option value="">Select Experience Level</option>
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Salary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Compensation
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  name="salary.min"
                  value={formData.salary.min}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g. 80000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Salary
                </label>
                <input
                  type="number"
                  name="salary.max"
                  value={formData.salary.max}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g. 120000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  name="salary.currency"
                  value={formData.salary.currency}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Job Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                className="textarea"
                placeholder="Provide a comprehensive description of the role, team, and company culture..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Responsibilities *
              </label>
              <textarea
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleInputChange}
                required
                rows={4}
                className="textarea"
                placeholder="List the key responsibilities and day-to-day tasks..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Requirements *
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                required
                rows={4}
                className="textarea"
                placeholder="List the required qualifications, skills, and experience..."
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Required Skills
            </h3>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className="input flex-1"
                placeholder="Add a skill (e.g. JavaScript, React, Python)"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="btn btn-outline"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-primary/60 hover:text-primary"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Benefits & Perks
            </h3>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
                className="input flex-1"
                placeholder="Add a benefit (e.g. Health insurance, Remote work)"
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="btn btn-outline"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {formData.benefits.length > 0 && (
              <div className="space-y-2">
                {formData.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(benefit)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading}
              className="btn btn-outline"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => navigate('/recruiter/job-management')}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="loading-spinner h-4 w-4 mr-2"></div>
                    Posting Job...
                  </div>
                ) : (
                  'Post Job'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
