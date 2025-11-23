
// app/api/applications/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import { getUserFromRequest } from '@/lib/auth';

// GET single application
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
    
    const application = await Application.findById(params.id)
      .populate('job')
      .populate('seeker', 'name email phone skills')
      .populate('resume');

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    // Authorization check
    if (user.role === 'seeker' && application.seeker._id.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 403 }
      );
    }

    if (user.role === 'employer') {
      const job = await Job.findById(application.job._id);
      if (job.employer.toString() !== user.userId) {
        return NextResponse.json(
          { success: false, message: 'Not authorized' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        application
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get application error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Update application status (Employer only)
export async function PUT(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'employer') {
      return NextResponse.json(
        { success: false, message: 'Only employers can update application status' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const { status } = await request.json();

    // Validation
    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    const application = await Application.findById(params.id).populate('job');
    
    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if employer owns the job
    const job = await Job.findById(application.job._id);
    if (job.employer.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 403 }
      );
    }

    // Update application
    application.status = status;
    application.updatedAt = new Date();
    await application.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Application status updated',
        application
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete application (Seeker only, own applications)
export async function DELETE(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'seeker') {
      return NextResponse.json(
        { success: false, message: 'Only seekers can withdraw applications' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const application = await Application.findById(params.id);
    
    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (application.seeker.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 403 }
      );
    }

    await Application.findByIdAndDelete(params.id);
    
    // Decrease job application count
    await Job.findByIdAndUpdate(application.job, { $inc: { applicationCount: -1 } });

    return NextResponse.json(
      {
        success: true,
        message: 'Application withdrawn successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete application error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}