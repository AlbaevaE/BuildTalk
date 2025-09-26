import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('[DEBUG] DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 50) + '...');

// Configure postgres-js client for Supabase with proper settings
export const client = postgres(process.env.DATABASE_URL, { 
  prepare: false, // Essential for Transaction mode pooler
  max: 1, // Maximum connections for serverless
});

export const db = drizzle(client, { schema });

// For legacy compatibility
export const pool = client;
