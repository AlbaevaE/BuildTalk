import { 
  type User, type UpsertUser, type Thread, type InsertThread, type Comment, type InsertComment,
  type Vote, type CreateVote, type Achievement, type UserAchievement, type Bookmark, type CreateBookmark,
  type UpdateUserProfile, users, threads, comments, votes, achievements, userAchievements, bookmarks 
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and, count } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(userData: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<User | undefined>;

  // Thread methods
  getThreads(category?: string): Promise<Thread[]>;
  getThread(id: string): Promise<Thread | undefined>;
  createThread(threadData: InsertThread): Promise<Thread>;
  updateThreadUpvotes(id: string, upvotes: number): Promise<Thread | undefined>;

  // Comment methods
  getComments(threadId: string): Promise<Comment[]>;
  createComment(commentData: InsertComment): Promise<Comment>;
  updateCommentUpvotes(id: string, upvotes: number): Promise<Comment | undefined>;

  // Vote methods
  getVote(userId: string, targetType: string, targetId: string): Promise<Vote | undefined>;
  createOrUpdateVote(voteData: CreateVote): Promise<Vote>;
  removeVote(userId: string, targetType: string, targetId: string): Promise<boolean>;

  // Achievement methods
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  createUserAchievement(userId: string, achievementId: string): Promise<UserAchievement>;

  // Bookmark methods
  getBookmarks(userId: string): Promise<Bookmark[]>;
  createBookmark(bookmarkData: CreateBookmark): Promise<Bookmark>;
  removeBookmark(userId: string, targetType: string, targetId: string): Promise<boolean>;

  // Stats methods
  getUserStats(userId: string): Promise<{
    threadsCount: number;
    commentsCount: number;
    bestAnswersCount: number;
    totalUpvotes: number;
  }>;
}

// Temporary in-memory storage for testing while database connection is being fixed
class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, User> = new Map();
  private threads: Map<string, Thread> = new Map();
  private comments: Map<string, Comment> = new Map();
  private votes: Map<string, Vote> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private userAchievements: Map<string, UserAchievement> = new Map();
  private bookmarks: Map<string, Bookmark> = new Map();

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
        karma: userData.karma ?? 0,
        role: userData.role ?? "diy",
        bio: userData.bio ?? null,
        isProfilePublic: userData.isProfilePublic ?? true,
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

  // Profile methods
  async updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<User | undefined> {
    const existingUser = this.users.get(userId);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...updates, updatedAt: new Date() };
    this.users.set(userId, updatedUser);
    if (updatedUser.email) {
      this.usersByEmail.set(updatedUser.email, updatedUser);
    }
    return updatedUser;
  }

  // Vote methods
  async createVote(voteData: CreateVote): Promise<Vote> {
    const id = randomUUID();
    const now = new Date();
    const vote: Vote = { ...voteData, id, createdAt: now };
    this.votes.set(id, vote);
    return vote;
  }

  async getVoteByUserAndTarget(userId: string, targetType: string, targetId: string): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(vote => 
      vote.userId === userId && vote.targetType === targetType && vote.targetId === targetId
    );
  }

  async deleteVote(id: string): Promise<boolean> {
    return this.votes.delete(id);
  }

  async getVoteCountsByTarget(targetType: string, targetId: string): Promise<{ upvotes: number, downvotes: number }> {
    const targetVotes = Array.from(this.votes.values()).filter(vote => 
      vote.targetType === targetType && vote.targetId === targetId
    );
    const upvotes = targetVotes.filter(vote => vote.voteType === 'up').length;
    const downvotes = targetVotes.filter(vote => vote.voteType === 'down').length;
    return { upvotes, downvotes };
  }

  // Achievement methods
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(ua => ua.userId === userId);
  }

  async awardAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const id = randomUUID();
    const now = new Date();
    const userAchievement: UserAchievement = {
      id,
      userId,
      achievementId,
      earnedAt: now
    };
    this.userAchievements.set(id, userAchievement);
    return userAchievement;
  }

  // Bookmark methods
  async createBookmark(bookmarkData: CreateBookmark): Promise<Bookmark> {
    const id = randomUUID();
    const now = new Date();
    const bookmark: Bookmark = { ...bookmarkData, id, createdAt: now };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async deleteBookmark(userId: string, targetType: string, targetId: string): Promise<boolean> {
    const bookmark = Array.from(this.bookmarks.values()).find(b => 
      b.userId === userId && b.targetType === targetType && b.targetId === targetId
    );
    if (bookmark) {
      return this.bookmarks.delete(bookmark.id);
    }
    return false;
  }

  async getUserBookmarks(userId: string): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(b => b.userId === userId);
  }

  async isBookmarked(userId: string, targetType: string, targetId: string): Promise<boolean> {
    return Array.from(this.bookmarks.values()).some(b => 
      b.userId === userId && b.targetType === targetType && b.targetId === targetId
    );
  }
}

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<User | undefined>;
  
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
  
  // Vote methods
  createVote(voteData: CreateVote): Promise<Vote>;
  getVoteByUserAndTarget(userId: string, targetType: string, targetId: string): Promise<Vote | undefined>;
  deleteVote(id: string): Promise<boolean>;
  getVoteCountsByTarget(targetType: string, targetId: string): Promise<{ upvotes: number, downvotes: number }>;
  
  // Achievement methods
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  awardAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  
  // Bookmark methods
  createBookmark(bookmarkData: CreateBookmark): Promise<Bookmark>;
  deleteBookmark(userId: string, targetType: string, targetId: string): Promise<boolean>;
  getUserBookmarks(userId: string): Promise<Bookmark[]>;
  isBookmarked(userId: string, targetType: string, targetId: string): Promise<boolean>;
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

  // Profile methods (TODO: Implement when database is connected)
  async updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<User | undefined> {
    throw new Error("updateUserProfile not implemented in DatabaseStorage yet");
  }

  // Vote methods (TODO: Implement when database is connected)
  async createVote(voteData: CreateVote): Promise<Vote> {
    throw new Error("createVote not implemented in DatabaseStorage yet");
  }

  async getVoteByUserAndTarget(userId: string, targetType: string, targetId: string): Promise<Vote | undefined> {
    throw new Error("getVoteByUserAndTarget not implemented in DatabaseStorage yet");
  }

  async deleteVote(id: string): Promise<boolean> {
    throw new Error("deleteVote not implemented in DatabaseStorage yet");
  }

  async getVoteCountsByTarget(targetType: string, targetId: string): Promise<{ upvotes: number, downvotes: number }> {
    throw new Error("getVoteCountsByTarget not implemented in DatabaseStorage yet");
  }

  // Achievement methods (TODO: Implement when database is connected)
  async getAchievements(): Promise<Achievement[]> {
    throw new Error("getAchievements not implemented in DatabaseStorage yet");
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    throw new Error("getUserAchievements not implemented in DatabaseStorage yet");
  }

  async awardAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    throw new Error("awardAchievement not implemented in DatabaseStorage yet");
  }

  // Bookmark methods (TODO: Implement when database is connected)
  async createBookmark(bookmarkData: CreateBookmark): Promise<Bookmark> {
    throw new Error("createBookmark not implemented in DatabaseStorage yet");
  }

  async deleteBookmark(userId: string, targetType: string, targetId: string): Promise<boolean> {
    throw new Error("deleteBookmark not implemented in DatabaseStorage yet");
  }

  async getUserBookmarks(userId: string): Promise<Bookmark[]> {
    throw new Error("getUserBookmarks not implemented in DatabaseStorage yet");
  }

  async isBookmarked(userId: string, targetType: string, targetId: string): Promise<boolean> {
    throw new Error("isBookmarked not implemented in DatabaseStorage yet");
  }
}

// For now, use MemStorage until we properly set up database tables
export const storage = new MemStorage();
console.log('[DEBUG] Using MemStorage for temporary testing');