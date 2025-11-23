'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SeekerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    accepted: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get user info
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      
      if (userData.success) {
        setUser(userData.user);
      }

      // Get applications
      const appRes = await fetch('/api/applications');
      const appData = await appRes.json();
      
      if (appData.success) {
        setApplications(appData.applications);
        
        const statusCount = {
          total: appData.applications.length,
          pending: 0,
          reviewed: 0,
          accepted: 0,
          rejected: 0
        };
        
        appData.applications.forEach(app => {
          statusCount[app.status]++;
        });
        
        setStats(statusCount);
      }

      // Get latest jobs
      const jobsRes = await fetch('/api/jobs');
      const jobsData = await jobsRes.json();
      
      if (jobsData.success) {
        setJobs(jobsData.jobs.slice(0, 5)); // Show only 5 latest jobs
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleApplyClick = (e, isLoggedIn) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setShowLoginMessage(true);
      setTimeout(() => setShowLoginMessage(false), 3000);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Job Portal</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/seeker/jobs"
                className="text-gray-700 hover:text-blue-600"
              >
                Browse Jobs
              </Link>
              <Link
                href="/seeker/resume-builder"
                className="text-gray-700 hover:text-blue-600"
              >
                Resume Builder
              </Link>
              <Link
                href="/seeker/profile"
                className="text-gray-700 hover:text-blue-600"
              >
                Profile
              </Link>
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Login Message */}
      {showLoginMessage && (
        <div className="fixed top-20 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-bounce">
          ⚠️ Please login as a Job Seeker to apply for jobs!
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
            <div className="text-gray-600 text-sm">Total Applications</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pending}</div>
            <div className="text-gray-600 text-sm">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.reviewed}</div>
            <div className="text-gray-600 text-sm">Reviewed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.accepted}</div>
            <div className="text-gray-600 text-sm">Accepted</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-red-600 mb-2">{stats.rejected}</div>
            <div className="text-gray-600 text-sm">Rejected</div>
          </div>
        </div>

        {/* Latest Jobs Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Latest Job Openings</h2>
            <Link
              href="/seeker/jobs"
              className="text-blue-600 hover:underline text-sm font-semibold"
            >
              View All Jobs →
            </Link>
          </div>
          
          {jobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No jobs available at the moment.
            </div>
          ) : (
            <div className="divide-y">
              {jobs.map((job) => (
                <div key={job._id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-4">
                          <span>🏢 {job.company}</span>
                          <span>📍 {job.location}</span>
                          <span>💼 {job.type}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {job.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="text-xs text-gray-500">+{job.skills.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Link
                      href="/seeker/jobs"
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 ml-4"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">My Applications</h2>
            <Link
              href="/seeker/jobs"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Browse More Jobs
            </Link>
          </div>
          
          {applications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-4">No applications yet.</div>
              <Link
                href="/seeker/jobs"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Start Applying to Jobs
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {applications.map((app) => (
                <div key={app._id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{app.job.title}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>🏢 {app.job.company}</div>
                        <div>📍 {app.job.location}</div>
                        <div>💼 {app.job.type}</div>
                        <div>📅 Applied {new Date(app.appliedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <span className={`px-3 py-1 rounded font-semibold text-sm ${getStatusColor(app.status)}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
                    <div className="font-semibold mb-1">Your Cover Letter:</div>
                    <div className="text-gray-700 line-clamp-3">{app.coverLetter}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}