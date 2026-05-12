import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Building,
  Filter,
  Search,
  ChevronRight,
  Calendar
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function JobListings() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    experience: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  })
  const [showFilters, setShowFilters] = useState(false)

  const [restrictionUntil, setRestrictionUntil] = useState(null)

  useEffect(() => {
    fetchJobs()
    checkRestriction()
  }, [filters, pagination.current])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 10,
        ...filters
      })

      const response = await axios.get(`/api/jobs?${params}`)
      setJobs(response.data.jobs)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkRestriction = async () => {
    try {
      const response = await axios.get('/api/candidates/profile')
      if (response.data.candidate?.restrictionUntil) {
        const restrictionDate = new Date(response.data.candidate.restrictionUntil)
        if (restrictionDate > new Date()) {
          setRestrictionUntil(restrictionDate)
        }
      }
    } catch (error) {
      console.error('Error checking restriction:', error)
    }
  }

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchJobs()
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      type: '',
      experience: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const applyToJob = async (jobId) => {
    try {
      await axios.post(`/api/jobs/${jobId}/apply`)
      // Update the job in the list to show applied status
      setJobs(prev => prev.map(job =>
        job._id === jobId
          ? { ...job, hasApplied: true }
          : job
      ))
      toast.success('Application submitted successfully!')
    } catch (error) {
      console.error('Error applying to job:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to apply to job')
      }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Job Opportunities
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and apply to jobs that match your skills and experience
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs by title, company, or keywords..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input pl-10 pr-4"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-primary text-sm px-4"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-primary hover:underline"
        >
          <Filter className="h-4 w-4" />
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="City or remote"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="input"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experience Level
              </label>
              <select
                value={filters.experience}
                onChange={(e) => handleFilterChange('experience', e.target.value)}
                className="input"
              >
                <option value="">All Levels</option>
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Lead/Manager">Lead/Manager</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-')
                  handleFilterChange('sortBy', sortBy)
                  handleFilterChange('sortOrder', sortOrder)
                }}
                className="input"
              >
                <option value="createdAt-desc">Latest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
              </select>
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {(filters.location || filters.type || filters.experience || filters.search) && (
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="btn btn-outline text-sm"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {jobs.length} of {pagination.total} jobs
        </p>
      </div>

      {/* Restriction Warning */}
      {restrictionUntil && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center space-x-3">
          <Clock className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="text-red-800 font-semibold">Job Application Restricted</h3>
            <p className="text-red-700 text-sm">
              You are restricted from applying to new jobs until <strong>{restrictionUntil.toLocaleDateString()}</strong> due to multiple proctoring violations.
            </p>
          </div>
        </div>
      )}

      {/* Job Listings */}
      <div className="space-y-4">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building className="h-6 w-6 text-gray-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            {job.postedBy?.profile?.company || job.company || 'Company Name'}
                          </p>
                        </div>

                        {job.hasApplied && (
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full">
                            Applied
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{job.experience}</span>
                        </div>
                        {job.salary?.min && job.salary?.max && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{job.salary.min} - {job.salary.max}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Posted {formatDate(job.createdAt)}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 line-clamp-2 mb-4">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills?.slice(0, 5).map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills?.length > 5 && (
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Link
                    to={`/candidate/jobs/${job._id}`}
                    className="btn btn-outline text-sm"
                  >
                    View Details
                  </Link>

                  {!job.hasApplied && (
                    <button
                      onClick={() => applyToJob(job._id)}
                      disabled={!!restrictionUntil}
                      className={`btn btn-primary text-sm ${restrictionUntil ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {restrictionUntil ? 'Restricted' : 'Apply Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={clearFilters}
              className="btn btn-outline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
            disabled={pagination.current === 1}
            className="btn btn-outline disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                  className={`px-3 py-1 rounded ${pagination.current === page
                      ? 'bg-primary text-white'
                      : 'btn btn-outline text-sm'
                    }`}
                >
                  {page}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setPagination(prev => ({ ...prev, current: Math.min(pagination.pages, prev.current + 1) }))}
            disabled={pagination.current === pagination.pages}
            className="btn btn-outline disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
