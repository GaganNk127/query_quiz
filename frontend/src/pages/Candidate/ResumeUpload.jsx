import { useState, useRef, useEffect } from 'react'
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Download,
  Trash2
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import axios from 'axios'
import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export default function ResumeUpload() {
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const [atsScore, setAtsScore] = useState(0)
  const [selectedJob, setSelectedJob] = useState('')
  const [jobs, setJobs] = useState([])
  const [uploadedFile, setUploadedFile] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/jobs?limit=20')
      setJobs(response.data.jobs)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const extractTextFromPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()

      fileReader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target.result)
          const pdf = await pdfjsLib.getDocument(typedarray).promise
          let fullText = ''

          // Extract text from all pages
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map(item => item.str).join(' ')
            fullText += pageText + '\n'
          }

          resolve(fullText.trim())
        } catch (error) {
          reject(error)
        }
      }

      fileReader.onerror = () => reject(new Error('Failed to read file'))
      fileReader.readAsArrayBuffer(file)
    })
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]

    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploadedFile(file)
    setAnalyzing(true)

    try {
      // Extract text from PDF
      const text = await extractTextFromPDF(file)
      setExtractedText(text)

      toast.success('Resume text extracted successfully!')
    } catch (error) {
      toast.error('Failed to extract text from PDF')
      console.error('PDF extraction error:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile || !extractedText) {
      toast.error('Please select a resume file first')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('resume', uploadedFile)
      formData.append('resumeText', extractedText)

      if (selectedJob) {
        formData.append('jobId', selectedJob)
      }

      const response = await axios.post('/api/candidates/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setAtsScore(response.data.candidate.atsScore)

      toast.success(`Resume uploaded successfully! ATS Score: ${response.data.candidate.atsScore}%`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleAnalyzeWithJob = async () => {
    if (!extractedText || !selectedJob) {
      toast.error('Please select a job to analyze against')
      return
    }

    setAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append('resumeText', extractedText)
      formData.append('jobId', selectedJob)

      const response = await axios.post('/api/candidates/upload-resume', formData)
      setAtsScore(response.data.candidate.atsScore)

      toast.success(`Analysis complete! ATS Score: ${response.data.candidate.atsScore}%`)
    } catch (error) {
      toast.error('Failed to analyze resume')
      console.error('Analysis error:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const clearUpload = () => {
    setUploadedFile(null)
    setExtractedText('')
    setAtsScore(0)
    setSelectedJob('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Resume Upload & ATS Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your resume to get AI-powered ATS scoring and job matching analysis
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Upload Resume
        </h2>

        {!uploadedFile ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                PDF files only, up to 5MB
              </p>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={clearUpload}
                className="btn btn-outline text-sm"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </button>
            </div>

            {analyzing && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="loading-spinner h-6 w-6 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">
                  Extracting text from PDF...
                </span>
              </div>
            )}

            {extractedText && !analyzing && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      Text extracted successfully
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {extractedText.split(' ').length} words extracted from resume
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Analyze against specific job (optional)
                  </label>
                  <select
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                    className="input"
                  >
                    <option value="">Select a job to analyze against</option>
                    {jobs.map((job) => (
                      <option key={job._id} value={job._id}>
                        {job.title} - {job.postedBy?.profile?.company || job.company || 'Company'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="btn btn-primary flex-1"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="loading-spinner h-4 w-4 mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Resume
                      </>
                    )}
                  </button>

                  {selectedJob && (
                    <button
                      onClick={handleAnalyzeWithJob}
                      disabled={analyzing}
                      className="btn btn-outline"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="loading-spinner h-4 w-4 mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        'Analyze for Job'
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ATS Score Results */}
      {atsScore > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            ATS Analysis Results
          </h2>

          <div className={`p-6 rounded-lg ${getScoreBgColor(atsScore)}`}>
            <div className="text-center">
              <div className={`text-5xl font-bold mb-2 ${getScoreColor(atsScore)}`}>
                {atsScore}%
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                ATS Matching Score
              </p>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${atsScore >= 80 ? 'bg-green-500' :
                      atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  style={{ width: `${atsScore}%` }}
                ></div>
              </div>

              <div className="text-left space-y-2">
                {atsScore >= 80 && (
                  <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-5 w-5" />
                    <span>Excellent match! Your resume is well-optimized.</span>
                  </div>
                )}
                {atsScore >= 60 && atsScore < 80 && (
                  <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-300">
                    <AlertCircle className="h-5 w-5" />
                    <span>Good match. Consider adding more relevant keywords.</span>
                  </div>
                )}
                {atsScore < 60 && (
                  <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                    <AlertCircle className="h-5 w-5" />
                    <span>Low match. Update your resume with relevant skills and experience.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Extracted Text Preview */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Extracted Text Preview
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {extractedText.substring(0, 1000)}
                {extractedText.length > 1000 && '...'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          💡 Tips for Better ATS Score
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Use standard section headings (Experience, Education, Skills)</li>
          <li>• Include keywords from the job description</li>
          <li>• Avoid images, tables, and complex formatting</li>
          <li>• Use bullet points for better readability</li>
          <li>• Include both acronyms and full terms (e.g., "AI" and "Artificial Intelligence")</li>
          <li>• Quantify your achievements with numbers and metrics</li>
        </ul>
      </div>
    </div>
  )
}
