// app/employer/dashboard/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EmployerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0
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

      // Get jobs
      const jobsRes = await fetch('/api/jobs?myJobs=true');
      const jobsData = await jobsRes.json();
      
      if (jobsData.success) {
        setJobs(jobsData.jobs);
        
        const totalApps = jobsData.jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0);
        const activeJobs = jobsData.jobs.filter(job => job.status === 'active').length;
        
        setStats({
          totalJobs: jobsData.jobs.length,
          activeJobs,
          totalApplications: totalApps
        });
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

  const deleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete job');
    }
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
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <Link
                href="/employer/post-job"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Post New Job
              </Link>
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

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalJobs}</div>
            <div className="text-gray-600">Total Jobs Posted</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeJobs}</div>
            <div className="text-gray-600">Active Jobs</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalApplications}</div>
            <div className="text-gray-600">Total Applications</div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold">Your Posted Jobs</h2>
          </div>
          
          {jobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No jobs posted yet. Click "Post New Job" to get started.
            </div>
          ) : (
            <div className="divide-y">
              {jobs.map((job) => (
                <div key={job._id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>📍 {job.location}</div>
                        <div>💼 {job.type}</div>
                        <div>📅 Posted {new Date(job.createdAt).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            job.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {job.status}
                          </span>
                          <span className="text-sm">
                            {job.applicationCount || 0} Applications
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Link
                        href={`/employer/applications?jobId=${job._id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                      >
                        View Applications
                      </Link>
                      <button
                        onClick={() => deleteJob(job._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
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