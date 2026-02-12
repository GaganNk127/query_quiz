import { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Edit,
  Save,
  X,
  Briefcase,
  GraduationCap,
  Award,
  Github
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function CandidateProfile() {
  const { user, updateProfile, candidateData } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    phone: '',
    location: '',
    bio: '',
    website: '',
    linkedin: '',
    github: '',
    skills: [],
    experience: '',
    education: [],
    portfolio: ''
  })

  useEffect(() => {
    if (user?.profile) {
      setProfileData(prev => ({
        ...prev,
        ...user.profile
      }))
    }

    if (candidateData) {
      setProfileData(prev => ({
        ...prev,
        skills: candidateData.skills || [],
        experience: candidateData.experience || '',
        education: candidateData.education || [],
        portfolio: candidateData.portfolio || ''
      }))
    }
  }, [user, candidateData])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
    setProfileData(prev => ({
      ...prev,
      skills
    }))
  }

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...profileData.education]
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    }
    setProfileData(prev => ({
      ...prev,
      education: newEducation
    }))
  }

  const addEducation = () => {
    setProfileData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '' }]
    }))
  }

  const removeEducation = (index) => {
    const newEducation = profileData.education.filter((_, i) => i !== index)
    setProfileData(prev => ({
      ...prev,
      education: newEducation
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Update user profile
      const userProfileData = {
        phone: profileData.phone,
        location: profileData.location,
        bio: profileData.bio,
        website: profileData.website,
        linkedin: profileData.linkedin,
        github: profileData.github
      }

      const result = await updateProfile(userProfileData)

      if (result.success) {
        // Update candidate profile
        await axios.put('/api/candidates/profile', {
          skills: profileData.skills,
          experience: profileData.experience,
          education: profileData.education,
          portfolio: profileData.portfolio
        })

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
    // Reset to original data
    if (user?.profile) {
      setProfileData(prev => ({
        ...prev,
        ...user.profile
      }))
    }
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card p-6 border-none shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <span className="text-2xl font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.name}
              </h1>
              <p className="text-gray-600 font-medium">
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

      {/* Contact Information */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <User className="h-5 w-5 mr-2 text-blue-600" />
          Contact Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Globe className="h-4 w-4 inline mr-1 text-gray-400" />
              Website
            </label>
            <input
              type="url"
              name="website"
              value={profileData.website}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="input disabled:bg-gray-50/50"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Github className="h-4 w-4 inline mr-1 text-gray-400" />
              GitHub
            </label>
            <input
              type="url"
              name="github"
              value={profileData.github}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="input disabled:bg-gray-50/50"
              placeholder="https://github.com/yourusername"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Globe className="h-4 w-4 inline mr-1 text-gray-400" />
              Portfolio
            </label>
            <input
              type="url"
              name="portfolio"
              value={profileData.portfolio}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="input disabled:bg-gray-50/50"
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={profileData.bio}
            onChange={handleInputChange}
            disabled={!isEditing}
            rows={4}
            className="textarea disabled:bg-gray-50/50"
            placeholder="Tell us about yourself, your experience, and what you're looking for..."
          />
        </div>
      </div>

      {/* Professional Information */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
          Professional Information
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              value={profileData.skills.join(', ')}
              onChange={handleSkillsChange}
              disabled={!isEditing}
              className="input disabled:bg-gray-50/50"
              placeholder="JavaScript, React, Node.js, Python, etc."
            />
            {profileData.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {profileData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold border border-blue-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              name="experience"
              value={profileData.experience}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="input disabled:bg-gray-50/50"
            >
              <option value="">Select experience level</option>
              <option value="Entry Level">Entry Level</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Senior Level">Senior Level</option>
              <option value="Lead/Manager">Lead/Manager</option>
            </select>
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
            Education
          </h2>
          {isEditing && (
            <button
              onClick={addEducation}
              className="btn btn-outline text-sm"
            >
              Add Education
            </button>
          )}
        </div>

        <div className="space-y-4">
          {profileData.education.length > 0 ? (
            profileData.education.map((edu, index) => (
              <div key={index} className="border border-gray-100 bg-gray-50/30 rounded-xl p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Degree
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      disabled={!isEditing}
                      className="input disabled:bg-gray-50/50"
                      placeholder="Bachelor of Science in Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Institution
                    </label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                      disabled={!isEditing}
                      className="input disabled:bg-gray-50/50"
                      placeholder="University Name"
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Year
                      </label>
                      <input
                        type="number"
                        value={edu.year}
                        onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                        disabled={!isEditing}
                        className="input disabled:bg-gray-50/50"
                        placeholder="2020"
                        min="1950"
                        max="2030"
                      />
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeEducation(index)}
                        className="btn-destructive text-sm px-4 h-11"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl text-gray-500">
              No education information added yet
              {isEditing && (
                <button
                  onClick={addEducation}
                  className="ml-2 text-primary hover:underline"
                >
                  Add Education
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
