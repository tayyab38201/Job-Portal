// app/api/resume/download/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Resume from '@/models/Resume';
import Application from '@/models/Application';
import Job from '@/models/Job';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const resume = await Resume.findById(params.id);

    if (!resume) {
      return NextResponse.json(
        { success: false, message: 'Resume not found' },
        { status: 404 }
      );
    }

    // Authorization check
    let authorized = false;

    // User can download their own resume
    if (resume.user.toString() === user.userId) {
      authorized = true;
    }

    // Employer can download if they have an application from this user
    if (user.role === 'employer') {
      const employerJobs = await Job.find({ employer: user.userId }).select('_id');
      const jobIds = employerJobs.map(job => job._id);
      
      const application = await Application.findOne({
        job: { $in: jobIds },
        seeker: resume.user,
        resume: resume._id
      });

      if (application) {
        authorized = true;
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to download this resume' },
        { status: 403 }
      );
    }

    // Convert Base64 back to buffer
    const buffer = Buffer.from(resume.fileData, 'base64');

    // Return file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': resume.fileType,
        'Content-Disposition': `attachment; filename="${resume.fileName}"`,
        'Content-Length': buffer.length.toString()
      }
    });
  } catch (error) {
    console.error('Download resume error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}