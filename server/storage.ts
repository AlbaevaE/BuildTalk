import { type User, type UpsertUser, type Thread, type InsertThread, type Comment, type InsertComment, users, threads, comments } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Thread methods
  getThreads(): Promise<Thread[]>;
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
  async getThreads(): Promise<Thread[]> {
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

export const storage = new DatabaseStorage();