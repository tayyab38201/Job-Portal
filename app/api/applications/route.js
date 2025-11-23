// app/api/applications/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import Resume from '@/models/Resume';
import { getUserFromRequest } from '@/lib/auth';

// GET applications (seeker sees their apps, employer sees apps for their jobs)
export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    let query = {};
    
    if (user.role === 'seeker') {
      query.seeker = user.userId;
    } else if (user.role === 'employer') {
      // Get all jobs by this employer
      const employerJobs = await Job.find({ employer: user.userId }).select('_id');
      const jobIds = employerJobs.map(job => job._id);
      
      if (jobId) {
        // Verify job belongs to employer
        if (!jobIds.some(id => id.toString() === jobId)) {
          return NextResponse.json(
            { success: false, message: 'Not authorized' },
            { status: 403 }
          );
        }
        query.job = jobId;
      } else {
        query.job = { $in: jobIds };
      }
    }

    const applications = await Application.find(query)
      .populate('job', 'title company location type')
      .populate('seeker', 'name email phone skills')
      .populate('resume')
      .sort({ appliedAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: applications.length,
        applications
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Apply for a job (Seeker only)
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'seeker') {
      return NextResponse.json(
        { success: false, message: 'Only job seekers can apply' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const { jobId, coverLetter } = await request.json();

    // Validation
    if (!jobId || !coverLetter) {
      return NextResponse.json(
        { success: false, message: 'Job ID and cover letter are required' },
        { status: 400 }
      );
    }

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Job is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      seeker: user.userId
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    // Get user's resume
    const resume = await Resume.findOne({ user: user.userId }).sort({ uploadedAt: -1 });

    // Create application
    const application = await Application.create({
      job: jobId,
      seeker: user.userId,
      coverLetter,
      resume: resume?._id
    });

    // Update job application count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully',
        application
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Apply job error:', error);
    
    // Handle duplicate application error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'You have already applied to this job' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
