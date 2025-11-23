// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    
    const { name, email, password, role, phone, company, skills } = await request.json();

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    if (!['employer', 'seeker'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 400 }
      );
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      role,
      phone
    };

    if (role === 'employer' && company) {
      userData.company = company;
    }

    if (role === 'seeker' && skills) {
      userData.skills = skills;
    }

    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id, user.role);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    );

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}