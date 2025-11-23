// app/seeker/profile/page.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SeekerProfile() {
  const [user, setUser] = useState(null);
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

      // Get resume
      const resumeRes = await fetch('/api/resume/upload');
      const resumeData = await resumeRes.json();
      
      if (resumeData.success) {
        setResume(resumeData.resume);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF and Word documents are allowed');
      return;
    }

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Resume uploaded successfully!');
        setResume(data.resume);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm('Are you sure you want to delete your resume?')) return;

    try {
      const res = await fetch('/api/resume/upload', {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Resume deleted successfully');
        setResume(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to delete resume');
    }
  };

  const downloadResume = async () => {
    if (!resume) return;

    try {
      const res = await fetch(`/api/resume/download/${resume._id}`);
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = resume.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download resume');
      }
    } catch (error) {
      setError('Failed to download resume');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

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
              <Link href="/seeker/jobs" className="text-gray-700 hover:text-blue-600">
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Profile Info */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold mb-6">My Profile</h1>
          
          {user && (
            <div className="space-y-4">
              <div>
                <label className="text-gray-600 font-semibold">Name</label>
                <div className="text-lg">{user.name}</div>
              </div>
              
              <div>
                <label className="text-gray-600 font-semibold">Email</label>
                <div className="text-lg">{user.email}</div>
              </div>
              
              {user.phone && (
                <div>
                  <label className="text-gray-600 font-semibold">Phone</label>
                  <div className="text-lg">{user.phone}</div>
                </div>
              )}
              
              {user.skills && user.skills.length > 0 && (
                <div>
                  <label className="text-gray-600 font-semibold mb-2 block">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-gray-600 font-semibold">Member Since</label>
                <div className="text-lg">{new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          )}
        </div>

        {/* Resume Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Resume</h2>
          
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

          {resume ? (
            <div className="border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">📄</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{resume.fileName}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Size: {formatFileSize(resume.fileSize)}</div>
                      <div>Uploaded: {new Date(resume.uploadedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={downloadResume}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Download
                  </button>
                  <button
                    onClick={handleDeleteResume}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">📤</div>
              <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>
              <p className="text-gray-600 mb-6">
                Upload a PDF or Word document (max 5MB)
              </p>
              <label className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer font-semibold">
                {uploading ? 'Uploading...' : 'Choose File'}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📌 Important Notes:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your resume will be attached to all job applications</li>
              <li>• Employers can download your resume when reviewing applications</li>
              <li>• Only PDF and Word documents are supported</li>
              <li>• Maximum file size is 5MB</li>
              <li>• Your resume is stored securely in our database</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}