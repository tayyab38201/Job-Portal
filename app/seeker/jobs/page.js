// app/seeker/jobs/page.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
    setCoverLetter('');
    setError('');
    setSuccess('');
  };

  const submitApplication = async () => {
    if (!coverLetter.trim()) {
      setError('Please write a cover letter');
      return;
    }

    setApplying(true);
    setError('');

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob._id,
          coverLetter
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Application submitted successfully!');
        setTimeout(() => {
          setShowApplyModal(false);
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/seeker/dashboard" className="text-2xl font-bold text-blue-600">
              Job Portal
            </Link>
            <div className="flex gap-4">
              <Link href="/seeker/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/seeker/profile" className="text-gray-700 hover:text-blue-600">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search jobs by title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-6">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No jobs found
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
                    <div className="text-gray-600 space-y-1">
                      <div className="flex items-center gap-4">
                        <span>🏢 {job.company}</span>
                        <span>📍 {job.location}</span>
                        <span>💼 {job.type}</span>
                      </div>
                      {job.salary?.min && job.salary?.max && (
                        <div>
                          💰 ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} {job.salary.currency}
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApply(job)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Apply Now
                  </button>
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="font-semibold mb-2">Required Skills:</div>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <div className="font-semibold mb-2">Description:</div>
                    <div className="text-gray-700 whitespace-pre-wrap">{job.description}</div>
                  </div>
                  
                  <div>
                    <div className="font-semibold mb-2">Requirements:</div>
                    <div className="text-gray-700 whitespace-pre-wrap">{job.requirements}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold mb-4">Apply for {selectedJob?.title}</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Cover Letter *
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows="10"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Tell the employer why you're a great fit for this position..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={submitApplication}
                disabled={applying}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}