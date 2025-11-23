'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function ResumeBuilder() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    experience: [
      { company: '', position: '', duration: '', description: '' }
    ],
    education: [
      { institution: '', degree: '', year: '', details: '' }
    ],
    skills: '',
    languages: '',
    certifications: ''
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
    loadJsPDF();
  }, []);

  const loadJsPDF = () => {
    // Load jsPDF library dynamically
    if (!window.jspdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setFormData(prev => ({
          ...prev,
          fullName: data.user.name,
          email: data.user.email,
          phone: data.user.phone || '',
          skills: data.user.skills?.join(', ') || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { company: '', position: '', duration: '', description: '' }]
    });
  };

  const removeExperience = (index) => {
    const newExp = formData.experience.filter((_, i) => i !== index);
    setFormData({ ...formData, experience: newExp });
  };

  const updateExperience = (index, field, value) => {
    const newExp = [...formData.experience];
    newExp[index][field] = value;
    setFormData({ ...formData, experience: newExp });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { institution: '', degree: '', year: '', details: '' }]
    });
  };

  const removeEducation = (index) => {
    const newEdu = formData.education.filter((_, i) => i !== index);
    setFormData({ ...formData, education: newEdu });
  };

  const updateEducation = (index, field, value) => {
    const newEdu = [...formData.education];
    newEdu[index][field] = value;
    setFormData({ ...formData, education: newEdu });
  };

  const generatePDF = async () => {
    setSaving(true);
    setError('');
    
    try {
      // Validation
      if (!formData.fullName || !formData.email) {
        setError('Please provide at least your name and email');
        setSaving(false);
        return;
      }

      // Wait for jsPDF to load
      if (!window.jspdf) {
        setError('PDF library is loading... Please try again in a moment.');
        setSaving(false);
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      let yPosition = 20;
      const leftMargin = 20;
      const pageWidth = doc.internal.pageSize.width;
      const maxWidth = pageWidth - 40;

      // Helper function to add text with word wrap
      const addText = (text, fontSize, isBold = false, color = [0, 0, 0]) => {
        doc.setFontSize(fontSize);
        doc.setFont(undefined, isBold ? 'bold' : 'normal');
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, leftMargin, yPosition);
        yPosition += lines.length * (fontSize * 0.5) + 3;
      };

      const addSection = (title) => {
        yPosition += 5;
        doc.setDrawColor(37, 99, 235); // Blue color
        doc.setLineWidth(0.5);
        doc.line(leftMargin, yPosition, pageWidth - 20, yPosition);
        yPosition += 2;
        addText(title, 14, true, [37, 99, 235]);
        yPosition += 2;
      };

      const checkPageBreak = (neededSpace = 20) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      };

      // Header - Name
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(37, 99, 235); // Blue
      doc.text(formData.fullName, leftMargin, yPosition);
      yPosition += 12;

      // Contact Information
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      let contactInfo = '';
      if (formData.email) contactInfo += `📧 ${formData.email}  `;
      if (formData.phone) contactInfo += `📱 ${formData.phone}  `;
      if (formData.address) contactInfo += `📍 ${formData.address}`;
      doc.text(contactInfo, leftMargin, yPosition);
      yPosition += 10;

      // Professional Summary
      if (formData.summary) {
        addSection('PROFESSIONAL SUMMARY');
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        const summaryLines = doc.splitTextToSize(formData.summary, maxWidth);
        doc.text(summaryLines, leftMargin, yPosition);
        yPosition += summaryLines.length * 6 + 5;
      }

      // Work Experience
      const validExperience = formData.experience.filter(exp => exp.company);
      if (validExperience.length > 0) {
        checkPageBreak(40);
        addSection('WORK EXPERIENCE');
        
        validExperience.forEach((exp, index) => {
          checkPageBreak(30);
          
          // Position
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(exp.position || 'Position', leftMargin, yPosition);
          yPosition += 6;
          
          // Company
          doc.setFontSize(11);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(60, 60, 60);
          doc.text(exp.company, leftMargin, yPosition);
          yPosition += 5;
          
          // Duration
          if (exp.duration) {
            doc.setFontSize(10);
            doc.setFont(undefined, 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text(exp.duration, leftMargin, yPosition);
            yPosition += 5;
          }
          
          // Description
          if (exp.description) {
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            const descLines = doc.splitTextToSize(exp.description, maxWidth);
            doc.text(descLines, leftMargin, yPosition);
            yPosition += descLines.length * 5 + 8;
          } else {
            yPosition += 5;
          }
        });
      }

      // Education
      const validEducation = formData.education.filter(edu => edu.institution);
      if (validEducation.length > 0) {
        checkPageBreak(40);
        addSection('EDUCATION');
        
        validEducation.forEach((edu, index) => {
          checkPageBreak(25);
          
          // Degree
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(edu.degree || 'Degree', leftMargin, yPosition);
          yPosition += 6;
          
          // Institution
          doc.setFontSize(11);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(60, 60, 60);
          doc.text(edu.institution, leftMargin, yPosition);
          yPosition += 5;
          
          // Year
          if (edu.year) {
            doc.setFontSize(10);
            doc.setFont(undefined, 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text(edu.year, leftMargin, yPosition);
            yPosition += 5;
          }
          
          // Details
          if (edu.details) {
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            const detailLines = doc.splitTextToSize(edu.details, maxWidth);
            doc.text(detailLines, leftMargin, yPosition);
            yPosition += detailLines.length * 5 + 8;
          } else {
            yPosition += 5;
          }
        });
      }

      // Skills
      if (formData.skills) {
        checkPageBreak(30);
        addSection('SKILLS');
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        const skillsLines = doc.splitTextToSize(formData.skills, maxWidth);
        doc.text(skillsLines, leftMargin, yPosition);
        yPosition += skillsLines.length * 6 + 5;
      }

      // Languages
      if (formData.languages) {
        checkPageBreak(25);
        addSection('LANGUAGES');
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(formData.languages, leftMargin, yPosition);
        yPosition += 10;
      }

      // Certifications
      if (formData.certifications) {
        checkPageBreak(30);
        addSection('CERTIFICATIONS');
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        const certLines = doc.splitTextToSize(formData.certifications, maxWidth);
        doc.text(certLines, leftMargin, yPosition);
        yPosition += certLines.length * 6;
      }

      // Save the PDF
      const fileName = `${formData.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
      doc.save(fileName);

      setSuccess('✅ Resume downloaded successfully as PDF!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('❌ Error generating PDF. Please try again.');
    } finally {
      setSaving(false);
    }
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
              <Link href="/seeker/profile" className="text-gray-700 hover:text-blue-600">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">📄 Resume Builder</h1>
          <p className="text-gray-600 mb-8">Create your professional resume and download as PDF</p>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="City, State, Country"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Professional Summary</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief summary of your professional background..."
                />
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold text-lg">Work Experience</h3>
                <button
                  onClick={addExperience}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  + Add
                </button>
              </div>

              {formData.experience.map((exp, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                  <div className="flex justify-between">
                    <span className="font-medium">Experience {index + 1}</span>
                    {formData.experience.length > 1 && (
                      <button
                        onClick={() => removeExperience(index)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      placeholder="Company Name"
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => updateExperience(index, 'position', e.target.value)}
                      placeholder="Position/Title"
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                    placeholder="Duration (e.g., Jan 2020 - Present)"
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    placeholder="Job responsibilities and achievements..."
                    rows="3"
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold text-lg">Education</h3>
                <button
                  onClick={addEducation}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  + Add
                </button>
              </div>

              {formData.education.map((edu, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                  <div className="flex justify-between">
                    <span className="font-medium">Education {index + 1}</span>
                    {formData.education.length > 1 && (
                      <button
                        onClick={() => removeEducation(index)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      placeholder="Institution Name"
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      placeholder="Degree/Certificate"
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => updateEducation(index, 'year', e.target.value)}
                    placeholder="Year (e.g., 2020)"
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={edu.details}
                    onChange={(e) => updateEducation(index, 'details', e.target.value)}
                    placeholder="Additional details..."
                    rows="2"
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Skills, Languages, Certifications */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
                <textarea
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="JavaScript, React, Node.js"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Languages</label>
                <textarea
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="English (Fluent), Spanish (Basic)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Certifications</label>
              <textarea
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="List your certifications..."
              />
            </div>

            <button
              onClick={generatePDF}
              disabled={saving}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-blue-700 disabled:bg-gray-400 transition-all shadow-lg"
            >
              {saving ? '⏳ Generating PDF...' : '📥 Download Resume as PDF'}
            </button>

            <p className="text-sm text-gray-600 text-center">
              💡 Tip: Fill in as much information as possible for a complete professional resume
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}