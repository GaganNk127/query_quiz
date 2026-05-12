import { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Edit,
  Save,
  X,
  Building,
  Briefcase
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function RecruiterProfile() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    phone: '',
    location: '',
    bio: '',
    linkedin: '',
    company: '',
    departments: []
  })
  const [deptInput, setDeptInput] = useState('')

  useEffect(() => {
    if (user?.profile) {
      setProfileData({
        phone: user.profile.phone || '',
        location: user.profile.location || '',
        bio: user.profile.bio || '',
        linkedin: user.profile.linkedin || '',
        company: user.profile.company || '',
        departments: user.profile.departments || []
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddDept = () => {
    if (deptInput.trim() && !profileData.departments.includes(deptInput.trim())) {
      setProfileData(prev => ({
        ...prev,
        departments: [...prev.departments, deptInput.trim()]
      }))
      setDeptInput('')
    }
  }

  const handleRemoveDept = (dept) => {
    setProfileData(prev => ({
      ...prev,
      departments: prev.departments.filter(d => d !== dept)
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await updateProfile(profileData)
      if (result.success) {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (user?.profile) {
      setProfileData({
        phone: user.profile.phone || '',
        location: user.profile.location || '',
        bio: user.profile.bio || '',
        linkedin: user.profile.linkedin || '',
        company: user.profile.company || '',
        departments: user.profile.departments || []
      })
    }
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card p-6 border-none shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <span className="text-2xl font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {user?.email} • {user?.role}
              </p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-outline flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-outline flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contact & Professional Information */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <User className="h-5 w-5 mr-2 text-primary" />
          Profile Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="h-4 w-4 inline mr-1 text-gray-400" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="input disabled:bg-gray-50/50"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="h-4 w-4 inline mr-1 text-gray-400" />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={profileData.location}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="input disabled:bg-gray-50/50"
              placeholder="New York, NY"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Building className="h-4 w-4 inline mr-1 text-gray-400" />
              Company
            </label>
            <input
              type="text"
              name="company"
              value={profileData.company}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="input disabled:bg-gray-50/50"
              placeholder="TechCorp Inc."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Linkedin className="h-4 w-4 inline mr-1 text-gray-400" />
              LinkedIn
            </label>
            <input
              type="url"
              name="linkedin"
              value={profileData.linkedin}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="input disabled:bg-gray-50/50"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Departments
          </label>
          <div className="flex items-center space-x-2 mb-3">
            <input
              type="text"
              value={deptInput}
              onChange={(e) => setDeptInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDept())}
              disabled={!isEditing}
              className="input flex-1"
              placeholder="Add a department (e.g. Engineering, HR)"
            />
            <button
              type="button"
              onClick={handleAddDept}
              disabled={!isEditing}
              className="btn btn-outline h-11"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profileData.departments.map((dept, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                {dept}
                {isEditing && (
                  <button
                    onClick={() => handleRemoveDept(dept)}
                    className="ml-2 text-primary/60 hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={profileData.bio}
            onChange={handleInputChange}
            disabled={!isEditing}
            rows={4}
            className="textarea disabled:bg-gray-50/50"
            placeholder="Tell us about your role and the company..."
          />
        </div>
      </div>
    </div>
  )
}
