// app/api/jobs/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import Application from '@/models/Application';
import { getUserFromRequest } from '@/lib/auth';

// GET single job
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const job = await Job.findById(params.id)
      .populate('employer', 'name email company phone');

    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        job
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get job error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Update job (Employer only, own jobs)
export async function PUT(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'employer') {
      return NextResponse.json(
        { success: false, message: 'Only employers can update jobs' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const job = await Job.findById(params.id);
    
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (job.employer.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this job' },
        { status: 403 }
      );
    }

    const updateData = await request.json();
    
    // Update job
    const updatedJob = await Job.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Job updated successfully',
        job: updatedJob
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update job error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete job (Employer only, own jobs)
export async function DELETE(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'employer') {
      return NextResponse.json(
        { success: false, message: 'Only employers can delete jobs' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const job = await Job.findById(params.id);
    
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (job.employer.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this job' },
        { status: 403 }
      );
    }

    // Delete all applications for this job
    await Application.deleteMany({ job: params.id });
    
    // Delete job
    await Job.findByIdAndDelete(params.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Job deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete job error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}