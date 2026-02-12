import { useState, useEffect } from 'react'
import { 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Briefcase,
  Calendar,
  Target
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function QuizAssignment() {
  const [candidates, setCandidates] = useState([])
  const [jobs, setJobs] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState('')
  const [selectedJob, setSelectedJob] = useState('')
  const [loading, setLoading] = useState(false)
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    fetchCandidates()
    fetchJobs()
    fetchAssignments()
  }, [])

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/candidates')
      const data = response.data.data || response.data
      setCandidates(data.candidates || [])
    } catch (error) {
      console.error('Error fetching candidates:', error)
      toast.error('Failed to fetch candidates')
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/jobs/my-jobs')
      setJobs(response.data.jobs || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Failed to fetch jobs')
    }
  }

  const fetchAssignments = async () => {
    try {
      // Mock assignments for now - in real app, this would come from backend
      setAssignments([
        {
          id: '1',
          candidateName: 'John Doe',
          jobTitle: 'Frontend Developer',
          assignedAt: new Date().toISOString(),
          status: 'assigned'
        }
      ])
    } catch (error) {
      console.error('Error fetching assignments:', error)
    }
  }

  const handleAssignQuiz = async () => {
    if (!selectedCandidate || !selectedJob) {
      toast.error('Please select both a candidate and a job')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/quiz/assign', {
        candidateId: selectedCandidate,
        jobId: selectedJob
      })

      toast.success(response.data.message)
      
      // Reset form
      setSelectedCandidate('')
      setSelectedJob('')
      
      // Refresh assignments
      fetchAssignments()
      
    } catch (error) {
      console.error('Error assigning quiz:', error)
      toast.error(error.response?.data?.message || 'Failed to assign quiz')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Assignment</h1>
        <p className="text-gray-600">Assign quizzes to candidates based on job requirements</p>
      </div>

      {/* Assignment Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Send className="w-5 h-5 mr-2" />
          Assign New Quiz
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Select Candidate
            </label>
            <select
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a candidate...</option>
              {candidates.map((candidate) => (
                <option key={candidate._id} value={candidate._id}>
                  {candidate.user?.name} - ATS Score: {candidate.atsScore || 0}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-1" />
              Select Job
            </label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a job...</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title} - {job.type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAssignQuiz}
            disabled={loading || !selectedCandidate || !selectedJob}
            className="btn btn-primary px-6 py-2 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Assigning...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Assign Quiz
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recent Assignments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Recent Quiz Assignments
        </h2>

        {assignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No quiz assignments yet</p>
            <p className="text-sm">Assign your first quiz above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Candidate</th>
                  <th className="text-left py-3 px-4">Job Position</th>
                  <th className="text-left py-3 px-4">Assigned</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        {assignment.candidateName}
                      </div>
                    </td>
                    <td className="py-3 px-4">{assignment.jobTitle}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(assignment.assignedAt)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                        {getStatusIcon(assignment.status)}
                        <span className="ml-1 capitalize">{assignment.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">How Quiz Assignment Works</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Select a candidate who has applied to your job</li>
              <li>• Choose the job position for quiz generation</li>
              <li>• Quiz questions are automatically generated based on job description</li>
              <li>• Candidate receives notification and can attempt the quiz</li>
              <li>• Quiz expires in 7 days if not attempted</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
