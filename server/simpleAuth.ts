import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import bcrypt from "bcryptjs";

// Simple user type for session
export interface SessionUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

// Middleware to check if user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Middleware to attach user to request
export function attachUser(req: Request, res: Response, next: NextFunction) {
  if ((req as any).session?.user) {
    req.user = (req as any).session.user;
  }
  next();
}

// Login with email and password
export async function loginWithEmail(email: string, password: string): Promise<SessionUser | null> {
  try {
    let user = await storage.getUserByEmail(email);
    
    if (!user) {
      // For development only: create demo user with specific credentials
      if (process.env.NODE_ENV === 'development' && 
          email === 'test@example.com' && 
          password === 'password123') {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await storage.upsertUser({
          email,
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: null,
          password: hashedPassword,
        });
      } else {
        return null;
      }
    } else {
      // User exists, verify password
      if (!user.password) {
        return null;
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return null;
      }
    }

    return {
      id: user.id,
      email: user.email || '',
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    };
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
}

// Google OAuth simulation for development
export async function simulateGoogleLogin(email?: string): Promise<SessionUser | null> {
  try {
    const userEmail = email || 'google.demo@example.com';
    let user = await storage.getUserByEmail(userEmail);
    
    if (!user) {
      user = await storage.upsertUser({
        email: userEmail,
        firstName: "Google",
        lastName: "User",
        profileImageUrl: "https://via.placeholder.com/64x64.png?text=G",
      });
    }

    return {
      id: user.id,
      email: user.email || '',
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    };
  } catch (error) {
    console.error('Google login simulation failed:', error);
    return null;
  }
}

// Note: Express user types already declared in replitAuth.ts