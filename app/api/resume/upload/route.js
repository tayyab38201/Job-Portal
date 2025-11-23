// app/api/resume/upload/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Resume from '@/models/Resume';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'seeker') {
      return NextResponse.json(
        { success: false, message: 'Only job seekers can upload resumes' },
        { status: 403 }
      );
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get('resume');

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // File validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Only PDF and Word documents are allowed' },
        { status: 400 }
      );
    }

    // Convert file to Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');

    // Delete old resume if exists
    await Resume.deleteMany({ user: user.userId });

    // Create new resume
    const resume = await Resume.create({
      user: user.userId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileData: base64Data
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Resume uploaded successfully',
        resume: {
          id: resume._id,
          fileName: resume.fileName,
          fileSize: resume.fileSize,
          uploadedAt: resume.uploadedAt
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// GET - Get user's resume
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

    const resume = await Resume.findOne({ user: user.userId })
      .select('-fileData') // Don't send file data in list
      .sort({ uploadedAt: -1 });

    if (!resume) {
      return NextResponse.json(
        { success: false, message: 'No resume found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        resume
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get resume error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete resume
export async function DELETE(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'seeker') {
      return NextResponse.json(
        { success: false, message: 'Only job seekers can delete resumes' },
        { status: 403 }
      );
    }

    await connectDB();

    const result = await Resume.deleteMany({ user: user.userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'No resume found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Resume deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete resume error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

