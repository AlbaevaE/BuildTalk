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

// Register new user with email and password
export async function registerWithEmail(email: string, password: string, firstName?: string, lastName?: string): Promise<SessionUser | null> {
  try {
    console.log(`[DEBUG] Attempting registration for email: ${email}`);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      console.log(`[DEBUG] User already exists with email: ${email}, id: ${existingUser.id}`);
      return null; // User already exists
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`[DEBUG] Password hashed successfully for ${email}`);
    
    // Create new user
    const newUser = await storage.upsertUser({
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      profileImageUrl: null,
      password: hashedPassword,
    });
    console.log(`[DEBUG] New user created successfully: ${newUser.id}, email: ${newUser.email}`);

    return {
      id: newUser.id,
      email: newUser.email || '',
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      profileImageUrl: newUser.profileImageUrl,
    };
  } catch (error) {
    console.error('Registration failed:', error);
    return null;
  }
}

// Login with email and password
export async function loginWithEmail(email: string, password: string): Promise<SessionUser | null> {
  try {
    console.log(`[DEBUG] Attempting login for email: ${email}`);
    
    let user = await storage.getUserByEmail(email);
    
    if (!user) {
      console.log(`[DEBUG] No user found with email: ${email}`);
      
      // For development only: create demo user with specific credentials
      if (process.env.NODE_ENV === 'development' && 
          email === 'test@example.com' && 
          password === 'password123') {
        console.log(`[DEBUG] Creating development demo user for ${email}`);
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await storage.upsertUser({
          email,
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: null,
          password: hashedPassword,
        });
        console.log(`[DEBUG] Demo user created: ${user.id}`);
      } else {
        console.log(`[DEBUG] Not creating demo user - either not development or wrong credentials`);
        return null;
      }
    } else {
      console.log(`[DEBUG] Found existing user: ${user.id}, email: ${user.email}, has password: ${!!user.password}`);
      
      // User exists, verify password
      if (!user.password) {
        console.log(`[DEBUG] User ${user.email} has no password stored`);
        return null;
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log(`[DEBUG] Password match result for ${user.email}: ${passwordMatch}`);
      if (!passwordMatch) {
        console.log(`[DEBUG] Password mismatch for user ${user.email}`);
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