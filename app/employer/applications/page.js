// app/employer/applications/page.js
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ViewApplications() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (jobId) {
      fetchData();
    }
  }, [jobId, filter]);

  const fetchData = async () => {
    try {
      // Get job details
      const jobRes = await fetch(`/api/jobs/${jobId}`);
      const jobData = await jobRes.json();
      if (jobData.success) {
        setJob(jobData.job);
      }

      // Get applications
      const appRes = await fetch(`/api/applications?jobId=${jobId}`);
      const appData = await appRes.json();
      
      if (appData.success) {
        let filtered = appData.applications;
        if (filter !== 'all') {
          filtered = filtered.filter(app => app.status === filter);
        }
        setApplications(filtered);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, newStatus) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      
      if (data.success) {
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update status');
    }
  };

  const downloadResume = async (resumeId, fileName) => {
    try {
      const res = await fetch(`/api/resume/download/${resumeId}`);
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download resume');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download resume');
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
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/employer/dashboard" className="text-2xl font-bold text-blue-600">
              Job Portal
            </Link>
            <Link href="/employer/dashboard" className="text-gray-600 hover:text-gray-800">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Job Info */}
        {job && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
            <div className="text-gray-600">
              <span className="mr-4">📍 {job.location}</span>
              <span className="mr-4">💼 {job.type}</span>
              <span>{applications.length} Applications</span>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded ${
                filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('reviewed')}
              className={`px-4 py-2 rounded ${
                filter === 'reviewed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Reviewed
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-4 py-2 rounded ${
                filter === 'accepted' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded ${
                filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Applications */}
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No applications found
            </div>
          ) : (
            applications.map((app) => (
              <div key={app._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{app.seeker.name}</h3>
                    <div className="text-gray-600 text-sm space-y-1 mt-2">
                      <div>📧 {app.seeker.email}</div>
                      {app.seeker.phone && <div>📱 {app.seeker.phone}</div>}
                      <div>📅 Applied {new Date(app.appliedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded font-semibold text-sm ${getStatusColor(app.status)}`}>
                    {app.status.toUpperCase()}
                  </span>
                </div>

                {app.seeker.skills && app.seeker.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold mb-2">Skills:</div>
                    <div className="flex flex-wrap gap-2">
                      {app.seeker.skills.map((skill, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="text-sm font-semibold mb-2">Cover Letter:</div>
                  <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 whitespace-pre-wrap">
                    {app.coverLetter}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {app.resume && (
                    <button
                      onClick={() => downloadResume(app.resume._id, app.resume.fileName)}
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
                    >
                      📄 Download Resume
                    </button>
                  )}
                  
                  <button
                    onClick={() => updateStatus(app._id, 'reviewed')}
                    disabled={app.status === 'reviewed'}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm disabled:bg-gray-400"
                  >
                    Mark Reviewed
                  </button>
                  
                  <button
                    onClick={() => updateStatus(app._id, 'accepted')}
                    disabled={app.status === 'accepted'}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm disabled:bg-gray-400"
                  >
                    Accept
                  </button>
                  
                  <button
                    onClick={() => updateStatus(app._id, 'rejected')}
                    disabled={app.status === 'rejected'}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm disabled:bg-gray-400"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}