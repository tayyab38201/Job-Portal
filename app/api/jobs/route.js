// app/api/jobs/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import { getUserFromRequest } from '@/lib/auth';

// GET all jobs or employer's jobs
export async function GET(request) {
  try {
    await connectDB();
    
    const user = getUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    const myJobs = searchParams.get('myJobs') === 'true';

    let query = {};
    
    // If employer wants their jobs only
    if (myJobs && user && user.role === 'employer') {
      query.employer = user.userId;
    } else {
      // Show only active jobs for seekers
      query.status = 'active';
    }

    const jobs = await Job.find(query)
      .populate('employer', 'name email company')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: jobs.length,
        jobs
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get jobs error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create new job (Employer only)
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'employer') {
      return NextResponse.json(
        { success: false, message: 'Only employers can post jobs' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const jobData = await request.json();
    
    // Validation
    const requiredFields = ['title', 'company', 'description', 'requirements', 'location'];
    for (const field of requiredFields) {
      if (!jobData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create job
    const job = await Job.create({
      ...jobData,
      employer: user.userId
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Job posted successfully',
        job
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}