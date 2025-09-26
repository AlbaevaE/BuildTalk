import { type User, type UpsertUser, type Thread, type InsertThread, type Comment, type InsertComment, users, threads, comments } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// Temporary in-memory storage for testing while database connection is being fixed
class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, User> = new Map();
  private threads: Map<string, Thread> = new Map();
  private comments: Map<string, Comment> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.usersByEmail.get(email);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.usersByEmail.get(userData.email || '');
    if (existingUser) {
      // Update existing user
      const updatedUser: User = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
      };
      this.users.set(updatedUser.id, updatedUser);
      if (updatedUser.email) {
        this.usersByEmail.set(updatedUser.email, updatedUser);
      }
      console.log(`[DEBUG] Updated existing user: ${updatedUser.id}, email: ${updatedUser.email}`);
      return updatedUser;
    } else {
      // Create new user
      const id = randomUUID();
      const now = new Date();
      const newUser: User = {
        id,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        password: userData.password || null,
        createdAt: now,
        updatedAt: now,
      };
      this.users.set(id, newUser);
      if (newUser.email) {
        this.usersByEmail.set(newUser.email, newUser);
      }
      console.log(`[DEBUG] Created new user in memory: ${newUser.id}, email: ${newUser.email}`);
      return newUser;
    }
  }

  async getThreads(category?: string): Promise<Thread[]> {
    const allThreads = Array.from(this.threads.values());
    if (category) {
      return allThreads.filter(thread => thread.category === category);
    }
    return allThreads.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getThread(id: string): Promise<Thread | undefined> {
    return this.threads.get(id);
  }

  async createThread(insertThread: InsertThread): Promise<Thread> {
    const id = randomUUID();
    const now = new Date();
    const thread: Thread = { 
      ...insertThread, 
      id, 
      upvotes: 0, 
      createdAt: now
    };
    this.threads.set(id, thread);
    return thread;
  }

  async updateThread(id: string, updates: Partial<Omit<Thread, 'id' | 'createdAt'>>): Promise<Thread | undefined> {
    const existingThread = this.threads.get(id);
    if (!existingThread) return undefined;
    
    const updatedThread = { ...existingThread, ...updates };
    this.threads.set(id, updatedThread);
    return updatedThread;
  }

  async updateThreadUpvotes(id: string, upvotes: number): Promise<Thread | undefined> {
    return this.updateThread(id, { upvotes });
  }

  async deleteThread(id: string): Promise<boolean> {
    // Delete all comments for this thread first
    const threadComments = Array.from(this.comments.values()).filter(comment => comment.threadId === id);
    threadComments.forEach(comment => this.comments.delete(comment.id));
    
    // Delete the thread
    return this.threads.delete(id);
  }

  async getCommentsByThreadId(threadId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.threadId === threadId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getComment(id: string): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const now = new Date();
    const comment: Comment = { 
      ...insertComment, 
      id, 
      upvotes: 0, 
      createdAt: now
    };
    this.comments.set(id, comment);
    return comment;
  }

  async updateComment(id: string, updates: Partial<Omit<Comment, 'id' | 'createdAt' | 'threadId'>>): Promise<Comment | undefined> {
    const existingComment = this.comments.get(id);
    if (!existingComment) return undefined;
    
    const updatedComment = { ...existingComment, ...updates };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }

  async updateCommentUpvotes(id: string, upvotes: number): Promise<Comment | undefined> {
    return this.updateComment(id, { upvotes });
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }
}

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Thread methods
  getThreads(category?: string): Promise<Thread[]>;
  getThread(id: string): Promise<Thread | undefined>;
  createThread(thread: InsertThread): Promise<Thread>;
  updateThread(id: string, updates: Partial<Omit<Thread, 'id' | 'createdAt'>>): Promise<Thread | undefined>;
  updateThreadUpvotes(id: string, upvotes: number): Promise<Thread | undefined>;
  deleteThread(id: string): Promise<boolean>;
  
  // Comment methods
  getCommentsByThreadId(threadId: string): Promise<Comment[]>;
  getComment(id: string): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, updates: Partial<Omit<Comment, 'id' | 'createdAt' | 'threadId'>>): Promise<Comment | undefined>;
  updateCommentUpvotes(id: string, upvotes: number): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Thread methods
  async getThreads(category?: string): Promise<Thread[]> {
    if (category) {
      return await db.select().from(threads)
        .where(eq(threads.category, category))
        .orderBy(threads.createdAt);
    }
    return await db.select().from(threads).orderBy(threads.createdAt);
  }

  async getThread(id: string): Promise<Thread | undefined> {
    const [thread] = await db.select().from(threads).where(eq(threads.id, id));
    return thread;
  }

  async createThread(insertThread: InsertThread): Promise<Thread> {
    const id = randomUUID();
    const now = new Date();
    const thread: Thread = { 
      ...insertThread, 
      id, 
      upvotes: 0, 
      createdAt: now
    };
    
    await db.insert(threads).values(thread);
    return thread;
  }

  async updateThread(id: string, updates: Partial<Omit<Thread, 'id' | 'createdAt'>>): Promise<Thread | undefined> {
    const [updatedThread] = await db
      .update(threads)
      .set(updates)
      .where(eq(threads.id, id))
      .returning();
    return updatedThread;
  }

  async updateThreadUpvotes(id: string, upvotes: number): Promise<Thread | undefined> {
    return this.updateThread(id, { upvotes });
  }

  async deleteThread(id: string): Promise<boolean> {
    // Delete all comments for this thread first
    await db.delete(comments).where(eq(comments.threadId, id));
    
    // Delete the thread
    const result = await db.delete(threads).where(eq(threads.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Comment methods
  async getCommentsByThreadId(threadId: string): Promise<Comment[]> {
    return await db.select()
      .from(comments)
      .where(eq(comments.threadId, threadId))
      .orderBy(comments.createdAt);
  }

  async getComment(id: string): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const now = new Date();
    const comment: Comment = { 
      ...insertComment, 
      id, 
      upvotes: 0, 
      createdAt: now
    };
    
    await db.insert(comments).values(comment);
    return comment;
  }

  async updateComment(id: string, updates: Partial<Omit<Comment, 'id' | 'createdAt' | 'threadId'>>): Promise<Comment | undefined> {
    const [updatedComment] = await db
      .update(comments)
      .set(updates)
      .where(eq(comments.id, id))
      .returning();
    return updatedComment;
  }

  async updateCommentUpvotes(id: string, upvotes: number): Promise<Comment | undefined> {
    return this.updateComment(id, { upvotes });
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id));
    return (result.rowCount || 0) > 0;
  }
}

// Use memory storage temporarily while database connection is being fixed
// TODO: Switch back to DatabaseStorage once database connection is working
export const storage = new MemStorage();
console.log('[DEBUG] Using MemStorage for temporary testing');