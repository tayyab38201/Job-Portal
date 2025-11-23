import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define JWT_SECRET in environment variables');
}

// Generate JWT token
export function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware to protect routes
export async function authMiddleware(request, allowedRoles = []) {
  try {
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Add user info to request
    request.user = decoded;
    return null; // No error, proceed
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 401 }
    );
  }
}

// Extract user from request
export function getUserFromRequest(request) {
  const token = request.cookies.get('token')?.value || 
               request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) return null;
  
  return verifyToken(token);
}
