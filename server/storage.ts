import { type User, type InsertUser, type Thread, type InsertThread, type Comment, type InsertComment } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private threads: Map<string, Thread>;
  private comments: Map<string, Comment>;

  constructor() {
    this.users = new Map();
    this.threads = new Map();
    this.comments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Thread methods
  async getThreads(): Promise<Thread[]> {
    return Array.from(this.threads.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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
    const thread = this.threads.get(id);
    if (thread) {
      const updatedThread = { ...thread, ...updates };
      this.threads.set(id, updatedThread);
      return updatedThread;
    }
    return undefined;
  }

  async updateThreadUpvotes(id: string, upvotes: number): Promise<Thread | undefined> {
    return this.updateThread(id, { upvotes });
  }

  async deleteThread(id: string): Promise<boolean> {
    const deleted = this.threads.delete(id);
    // Also delete all comments for this thread
    if (deleted) {
      const commentIds = Array.from(this.comments.keys()).filter(
        commentId => this.comments.get(commentId)?.threadId === id
      );
      commentIds.forEach(commentId => this.comments.delete(commentId));
    }
    return deleted;
  }

  // Comment methods
  async getCommentsByThreadId(threadId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.threadId === threadId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
    const comment = this.comments.get(id);
    if (comment) {
      const updatedComment = { ...comment, ...updates };
      this.comments.set(id, updatedComment);
      return updatedComment;
    }
    return undefined;
  }

  async updateCommentUpvotes(id: string, upvotes: number): Promise<Comment | undefined> {
    return this.updateComment(id, { upvotes });
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }
}

export const storage = new MemStorage();
