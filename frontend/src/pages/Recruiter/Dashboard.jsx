/* ---------- CLEAN FIXED DASHBOARD ------------------- */

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  TrendingUp,
  FileText,
  Award,
  BarChart3,
  AlertTriangle,
  Send,
  Target,
  Calendar,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

export default function RecruiterDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalCandidates: 0,
    shortlisted: 0,
    averageAtsScore: 0,
    completedQuizzes: 0,
    averageQuizScore: 0,
    cheatingDetected: 0,
    messages: 0,
    notifications: 0,
  });

  const [recentCandidates, setRecentCandidates] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showQuizAssign, setShowQuizAssign] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [assigningQuiz, setAssigningQuiz] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        dashboardResponse,
        recentCandidatesRes,
        recentJobsRes,
        allCandidatesRes,
        allJobsRes,
      ] = await Promise.all([
        axios.get("/api/recruiter/dashboard"),
        axios.get("/api/candidates?limit=5"),
        axios.get("/api/jobs/my-jobs?limit=5"),
        axios.get("/api/candidates"),
        axios.get("/api/jobs/my-jobs"),
      ]);

      const dashboardData = dashboardResponse.data.data || dashboardResponse.data;
      setStats(dashboardData.stats || {});

      setRecentCandidates(
        recentCandidatesRes.data.data?.candidates ||
        recentCandidatesRes.data.candidates ||
        []
      );

      setRecentJobs(recentJobsRes.data.jobs || []);

      setCandidates(
        allCandidatesRes.data.data?.candidates ||
        allCandidatesRes.data.candidates ||
        []
      );

      setJobs(allJobsRes.data.jobs || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard");
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id || user?._id) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, user?.id, user?._id]);

  const handleAssignQuiz = async () => {
    if (!selectedCandidate || !selectedJob)
      return toast.error("Please select both candidate & job");

    setAssigningQuiz(true);
    try {
      const res = await axios.post("/api/quiz/assign", {
        candidateId: selectedCandidate,
        jobId: selectedJob,
      });

      toast.success(res.data.message);
      setSelectedCandidate("");
      setSelectedJob("");
      setShowQuizAssign(false);

      // Refresh dashboard data after assignment
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot assign quiz");
    } finally {
      setAssigningQuiz(false);
    }
  };

  const card = "bg-white dark:bg-gray-900 shadow-md rounded-lg border border-gray-200 dark:border-gray-700 p-6";

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString();
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name || "Recruiter"}!
        </h1>
        <p className="opacity-90">
          Here's an overview of your recruitment activity.
        </p>
      </div>

      {/* ERROR BAR */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className={card}>
          <div className="flex justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Briefcase className="text-blue-600" />
            </div>
            <span className="text-2xl font-bold">{stats.totalJobs ?? 0}</span>
          </div>
          <h3 className="font-semibold">Total Jobs Posted</h3>
          <p className="text-gray-600 text-sm">{stats.activeJobs ?? 0} active</p>
        </div>

        <div className={card}>
          <div className="flex justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Users className="text-green-600" />
            </div>
            <span className="text-2xl font-bold">{stats.totalApplications ?? 0}</span>
          </div>
          <h3 className="font-semibold">Total Applications</h3>
          <p className="text-gray-600 text-sm">{stats.shortlisted ?? 0} shortlisted</p>
        </div>

        <div className={card}>
          <div className="flex justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <TrendingUp className="text-purple-600" />
            </div>
            <span className="text-2xl font-bold">{stats.totalCandidates ?? 0}</span>
          </div>
          <h3 className="font-semibold">Total Candidates</h3>
          <p className="text-gray-600 text-sm">{stats.completedQuizzes ?? 0} quizzes</p>
        </div>

        <div className={card}>
          <div className="flex justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <FileText className="text-yellow-600" />
            </div>
            <span className="text-2xl font-bold">{stats.notifications ?? 0}</span>
          </div>
          <h3 className="font-semibold">Notifications</h3>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className={card}>
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>

          <button
            onClick={() => setShowQuizAssign(!showQuizAssign)}
            className="w-full p-4 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex justify-between items-center mb-3"
          >
            <div className="flex items-center gap-3">
              <Target className="text-purple-600" />
              <span className="font-medium">Assign Quiz</span>
            </div>
            →
          </button>

          {showQuizAssign && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border">

              <label className="text-sm">Select Candidate</label>
              <select
                className="w-full p-2 rounded-md bg-white dark:bg-gray-700 border mb-3"
                value={selectedCandidate}
                onChange={(e) => setSelectedCandidate(e.target.value)}
              >
                <option value="">Choose...</option>
                {candidates.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.user?.name || "No name"} — ATS {c.atsScore ?? 0}
                  </option>
                ))}
              </select>

              <label className="text-sm">Select Job</label>
              <select
                className="w-full p-2 rounded-md bg-white dark:bg-gray-700 border mb-3"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
              >
                <option value="">Choose...</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAssignQuiz}
                className="btn-purple w-full mt-2"
              >
                {assigningQuiz ? "Assigning..." : "Assign Quiz"}
              </button>
            </div>
          )}

          <Link to="/recruiter/job-posting" className="btn-primary w-full mb-3 justify-start">
            Post Job →
          </Link>

          <Link to="/recruiter/candidates" className="btn-secondary w-full mb-3 justify-start bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
            View Candidates →
          </Link>

          <Link to="/recruiter/job-management" className="btn-secondary w-full justify-start bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
            Manage Jobs →
          </Link>
        </div>

        {/* Performance */}
        <div className={card}>
          <h3 className="text-xl font-semibold mb-4">Performance Insights</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Application Rate</span>
              <span className="font-semibold">+12%</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Quality Score</span>
              <span className={getScoreColor(stats.averageAtsScore)}>
                {stats.averageAtsScore ?? 0}%
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Time to Hire</span>
              <span>18 days</span>
            </div>

          </div>
        </div>
      </div>

      {/* Recent Candidates */}
      <div className={card}>
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-semibold">Recent ATS-Qualified Candidates</h3>
          <Link to="/recruiter/candidates" className="text-primary text-sm">View All →</Link>
        </div>

        {recentCandidates.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No qualified candidates yet.
          </p>
        ) : (
          <div className="space-y-4">
            {recentCandidates.map((c) => (
              <div key={c._id} className="p-4 border rounded-lg flex justify-between">
                <div>
                  <h4 className="font-semibold">{c.user?.name}</h4>
                  <p className="text-sm text-gray-500">{c.user?.email}</p>
                  <p className={`font-semibold mt-1 ${getScoreColor(c.atsScore)}`}>
                    ATS: {c.atsScore ?? 0}%
                  </p>
                </div>

                <Link
                  to={`/recruiter/candidates/${c._id}`}
                  className="btn-outline btn-sm"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Jobs */}
      <div className={card}>
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-semibold">Recent Jobs</h3>
          <Link to="/recruiter/job-management" className="text-primary text-sm">Manage →</Link>
        </div>

        {recentJobs.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No jobs posted yet</p>
        ) : (
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div key={job._id} className="p-4 border rounded-lg flex justify-between">
                <div>
                  <h4 className="font-semibold">{job.title}</h4>
                  <p className="text-sm text-gray-500">{job.location} • {job.type}</p>
                </div>

                <Link
                  to={`/recruiter/job-management/${job._id}`}
                  className="btn-outline btn-sm"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
