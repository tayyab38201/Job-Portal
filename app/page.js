'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetchJobs();
  }, []);

  const checkAuthAndFetchJobs = async () => {
    try {
      // Check if user is logged in
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.success) {
        if (data.user.role === 'employer') {
          router.push('/employer/dashboard');
          return;
        } else {
          router.push('/seeker/dashboard');
          return;
        }
      }

      // Fetch jobs for non-logged-in users
      const jobsRes = await fetch('/api/jobs');
      const jobsData = await jobsRes.json();
      
      if (jobsData.success) {
        setJobs(jobsData.jobs.slice(0, 3)); // Show only 3 jobs
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (e) => {
    e.preventDefault();
    setShowLoginAlert(true);
    setTimeout(() => setShowLoginAlert(false), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Login Alert */}
      {showLoginAlert && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-bounce">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold">Login Required!</div>
              <div className="text-sm">Please login as a Job Seeker to apply for jobs</div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Connect with top employers or find talented candidates
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
              <div className="text-5xl mb-4">💼</div>
              <h2 className="text-2xl font-bold mb-4">For Employers</h2>
              <p className="text-gray-600 mb-6">
                Post jobs, manage applications, and find the perfect candidates
              </p>
              <Link
                href="/register?role=employer"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Post a Job
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold mb-4">For Job Seekers</h2>
              <p className="text-gray-600 mb-6">
                Browse jobs, apply easily, and track your applications
              </p>
              <Link
                href="/register?role=seeker"
                className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Find Jobs
              </Link>
            </div>
          </div>
          
          <p className="text-gray-600 mb-12">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-semibold">
              Log In
            </Link>
          </p>

          {/* Featured Jobs Section */}
          {jobs.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-8">Featured Job Openings</h2>
              <div className="grid gap-6">
                {jobs.map((job) => (
                  <div key={job._id} className="bg-white rounded-lg shadow-lg p-6 text-left">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                        <div className="text-gray-600 space-y-1 mb-4">
                          <div>🏢 {job.company}</div>
                          <div>📍 {job.location}</div>
                          <div>💼 {job.type}</div>
                        </div>
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {job.skills.slice(0, 4).map((skill, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleApplyClick}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition ml-4"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <p className="text-gray-600 mb-4">Want to see more jobs?</p>
                <Link
                  href="/register?role=seeker"
                  className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Register as Job Seeker
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}