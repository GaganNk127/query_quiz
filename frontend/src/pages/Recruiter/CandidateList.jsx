import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  FileText,
  Eye,
  MapPin,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'

export default function CandidateList() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    atsScoreMin: 0,
    quizScoreMin: 0,
    shortlisted: false,
    sortBy: 'atsScore',
    sortOrder: 'desc'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [recruiterJobs, setRecruiterJobs] = useState([])

  const { user, isAuthenticated } = useAuth()

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 10,
        ...filters
      })
      
      const response = await axios.get(`/api/candidates?${params}`)
      const responseData = response.data.data || response.data
      setCandidates(responseData.candidates || [])
      setPagination(responseData.pagination || { current: 1, pages: 0, total: 0 })
      
    } catch (error) {
      console.error('Error fetching candidates:', error)
      
      setCandidates([])
      setPagination({ current: 1, pages: 0, total: 0 })
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.current])

  const fetchRecruiterJobs = useCallback(async () => {
    try {
      const response = await axios.get('/api/jobs/my-jobs')
      setRecruiterJobs(response.data.jobs || [])
    } catch (error) {
      console.error('Error fetching recruiter jobs:', error)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'recruiter') {
      fetchCandidates()
      fetchRecruiterJobs()
    }
  }, [fetchCandidates, fetchRecruiterJobs, isAuthenticated, user])

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchCandidates()
  }

  const refreshCandidates = () => {
    fetchCandidates()
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      atsScoreMin: 0,
      quizScoreMin: 0,
      shortlisted: false,
      sortBy: 'atsScore',
      sortOrder: 'desc'
    })
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleShortlist = async (candidateId) => {
    try {
      await axios.post(`/api/candidates/${candidateId}/shortlist`)
      
      setCandidates(prev => prev.map(candidate => 
        candidate._id === candidateId 
          ? { ...candidate, shortlisted: true }
          : candidate
      ))
    } catch (error) {
      console.error('Error shortlisting candidate:', error)
    }
  }

  const handleBulkShortlist = async () => {
    if (selectedCandidates.length === 0) return
    
    setBulkActionLoading(true)
    try {
      const promises = selectedCandidates.map(candidateId => 
        handleShortlist(candidateId)
      )
      await Promise.all(promises)
      setSelectedCandidates([])
    } catch (error) {
      console.error('Error bulk shortlisting:', error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([])
    } else {
      setSelectedCandidates(candidates.map(c => c._id))
    }
  }

  const exportCandidates = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Location', 'ATS Score', 'Quiz Score', 'Shortlisted', 'Applied Date']
    const rows = candidates.map(candidate => [
      candidate.user?.name || '',
      candidate.user?.email || '',
      candidate.user?.profile?.phone || '',
      candidate.user?.profile?.location || '',
      candidate.atsScore || 0,
      candidate.quizScore || 0,
      candidate.shortlisted ? 'Yes' : 'No',
      new Date(candidate.createdAt).toLocaleDateString()
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `candidates_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900'
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900'
    return 'bg-red-100 dark:bg-red-900'
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Candidate Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and manage qualified candidates who have passed the ATS screening
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedCandidates.length > 0 && (
              <button
                onClick={handleBulkShortlist}
                disabled={bulkActionLoading}
                className="btn btn-primary"
              >
                {bulkActionLoading ? 'Processing...' : `Shortlist (${selectedCandidates.length})`}
              </button>
            )}
            
            <button
              onClick={exportCandidates}
              className="btn btn-outline flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates by name, email, or skills..."
              value={filters.search || ''}
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
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min ATS Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.atsScoreMin || 0}
                onChange={(e) => handleFilterChange('atsScoreMin', parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Quiz Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.quizScoreMin || 0}
                onChange={(e) => handleFilterChange('quizScoreMin', parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.shortlisted ? 'true' : 'false'}
                onChange={(e) => handleFilterChange('shortlisted', e.target.value === 'true')}
                className="input"
              >
                <option value="false">All Candidates</option>
                <option value="true">Shortlisted Only</option>
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
                <option value="atsScore-desc">ATS Score (High to Low)</option>
                <option value="atsScore-asc">ATS Score (Low to High)</option>
                <option value="quizScore-desc">Quiz Score (High to Low)</option>
                <option value="quizScore-asc">Quiz Score (Low to High)</option>
                <option value="createdAt-desc">Recent First</option>
                <option value="createdAt-asc">Oldest First</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Posting
              </label>
              <select
                value={filters.jobId || ''}
                onChange={(e) => handleFilterChange('jobId', e.target.value)}
                className="input"
              >
                <option value="">All Jobs</option>
                {recruiterJobs.map(job => (
                  <option key={job._id} value={job._id}>{job.title}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="btn btn-outline w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {candidates.length} of {pagination.total} candidates
        </p>
        {selectedCandidates.length > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedCandidates.length} selected
          </p>
        )}
      </div>

      {/* Candidate List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {candidates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={candidates.length > 0 && selectedCandidates.length === candidates.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Job Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ATS Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quiz Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {candidates.map((candidate) => (
                  <tr key={candidate._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate._id)}
                        onChange={() => handleSelectCandidate(candidate._id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-medium text-sm">
                            {candidate.user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {candidate.user?.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {candidate.experience || 'Not specified'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white space-y-1">
                        {candidate.user?.profile?.phone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                            {candidate.user.profile.phone}
                          </div>
                        )}
                        {candidate.user?.profile?.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                            {candidate.user.profile.location}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {candidate.appliedJobs && candidate.appliedJobs.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {candidate.appliedJobs.map((app, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {app.job?.title || 'Unknown Job'}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBgColor(candidate.atsScore)}`}>
                        <span className={getScoreColor(candidate.atsScore)}>
                          {candidate.atsScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {candidate.quizScore > 0 ? (
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBgColor(candidate.quizScore)}`}>
                          <span className={getScoreColor(candidate.quizScore)}>
                            {candidate.quizScore}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Not taken
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {candidate.cheatingStatus === 'rejected_cheating' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejected (Cheating)
                        </span>
                      ) : candidate.shortlisted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Shortlisted
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(candidate.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/recruiter/candidates/${candidate._id}`}
                          className="btn-outline btn-sm"
                        >
                          View
                        </Link>
                        
                        {!candidate.shortlisted && (
                          <button
                            onClick={() => handleShortlist(candidate._id)}
                            className="btn-primary btn-sm"
                          >
                            Shortlist
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No candidates found
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
                  className={`px-3 py-1 rounded ${
                    pagination.current === page
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
