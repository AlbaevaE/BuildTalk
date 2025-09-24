import { Request, Response, NextFunction } from "express";
import * as client from "openid-client";
import { storage } from "./storage";

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// OpenID Connect configuration
let openidConfig: client.Configuration | null = null;

// Initialize Replit Auth configuration
export async function initializeReplitAuth() {
  try {
    const server = new URL(process.env.ISSUER_URL || "https://replit.com");
    const clientId = process.env.CLIENT_ID!;
    const clientSecret = process.env.CLIENT_SECRET!;
    
    openidConfig = await client.discovery(server, clientId, clientSecret);
    console.log('Replit Auth configuration initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Replit Auth configuration:', error);
    throw error;
  }
}

// Get authorization URL
export function getAuthorizationUrl(state?: string): string {
  if (!openidConfig) {
    throw new Error('Replit Auth not initialized');
  }

  const redirectUri = process.env.REDIRECT_URI || `${process.env.REPL_URL || 'http://localhost:5000'}/auth/callback`;

  const authUrl = client.buildAuthorizationUrl(openidConfig, {
    redirect_uri: redirectUri,
    scope: 'openid profile email',
    state: state || client.randomState(),
  });

  return authUrl.href;
}

// Handle OAuth callback
export async function handleCallback(code: string, state?: string): Promise<AuthenticatedUser> {
  if (!openidConfig) {
    throw new Error('Replit Auth not initialized');
  }

  try {
    const redirectUri = process.env.REDIRECT_URI || `${process.env.REPL_URL || 'http://localhost:5000'}/auth/callback`;
    const currentUrl = new URL(`${redirectUri}?code=${code}&state=${state}`);

    const tokens = await client.authorizationCodeGrant(openidConfig, currentUrl, {
      expectedState: state,
    });

    // For simplicity, we'll use userinfo endpoint instead of validating JWT locally
    const userInfo = await client.fetchUserInfo(openidConfig, tokens.access_token, tokens.token_type || 'Bearer');
    
    // Upsert user in database
    const userData = {
      id: String(userInfo.sub || ''),
      email: String(userInfo.email || '') || null,
      firstName: String(userInfo.given_name || userInfo.first_name || '') || null,
      lastName: String(userInfo.family_name || userInfo.last_name || '') || null,
      profileImageUrl: String(userInfo.picture || '') || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user = await storage.upsertUser(userData);
    return user;
  } catch (error) {
    console.error('Failed to handle OAuth callback:', error);
    throw error;
  }
}

// Middleware to require authentication
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

// Extend Express types
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}