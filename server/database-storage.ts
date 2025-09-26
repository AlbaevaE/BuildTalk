import { 
  type User, type UpsertUser, type Thread, type InsertThread, type Comment, type InsertComment,
  type Vote, type CreateVote, type Achievement, type UserAchievement, type Bookmark, type CreateBookmark,
  type UpdateUserProfile, users, threads, comments, votes, achievements, userAchievements, bookmarks 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";
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

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('[DB] Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || undefined;
    } catch (error) {
      console.error('[DB] Error getting user by email:', error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      // Try to find existing user by email
      const existingUser = userData.email ? await this.getUserByEmail(userData.email) : null;
      
      if (existingUser) {
        // Update existing user
        const [updatedUser] = await db
          .update(users)
          .set({
            ...userData,
            updatedAt: new Date()
          })
          .where(eq(users.id, existingUser.id))
          .returning();
        
        console.log(`[DB] Updated user: ${updatedUser.id}`);
        return updatedUser;
      } else {
        // Create new user
        const [newUser] = await db
          .insert(users)
          .values({
            ...userData,
            karma: userData.karma ?? 0,
            role: userData.role ?? "diy",
            isProfilePublic: userData.isProfilePublic ?? true,
          })
          .returning();
        
        console.log(`[DB] Created user: ${newUser.id}`);
        return newUser;
      }
    } catch (error) {
      console.error('[DB] Error upserting user:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      
      return updatedUser || undefined;
    } catch (error) {
      console.error('[DB] Error updating user profile:', error);
      return undefined;
    }
  }

  async getThreads(category?: string): Promise<Thread[]> {
    try {
      const query = db.select().from(threads);
      if (category) {
        return await query.where(eq(threads.category, category)).orderBy(desc(threads.createdAt));
      }
      return await query.orderBy(desc(threads.createdAt));
    } catch (error) {
      console.error('[DB] Error getting threads:', error);
      return [];
    }
  }

  async getThread(id: string): Promise<Thread | undefined> {
    try {
      const [thread] = await db.select().from(threads).where(eq(threads.id, id));
      return thread || undefined;
    } catch (error) {
      console.error('[DB] Error getting thread:', error);
      return undefined;
    }
  }

  async createThread(threadData: InsertThread): Promise<Thread> {
    try {
      const [thread] = await db.insert(threads).values(threadData).returning();
      console.log(`[DB] Created thread: ${thread.id}`);
      return thread;
    } catch (error) {
      console.error('[DB] Error creating thread:', error);
      throw error;
    }
  }

  async updateThreadUpvotes(id: string, upvotes: number): Promise<Thread | undefined> {
    try {
      const [thread] = await db
        .update(threads)
        .set({ upvotes })
        .where(eq(threads.id, id))
        .returning();
      
      return thread || undefined;
    } catch (error) {
      console.error('[DB] Error updating thread upvotes:', error);
      return undefined;
    }
  }

  async getComments(threadId: string): Promise<Comment[]> {
    try {
      return await db.select().from(comments).where(eq(comments.threadId, threadId)).orderBy(desc(comments.createdAt));
    } catch (error) {
      console.error('[DB] Error getting comments:', error);
      return [];
    }
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    try {
      const [comment] = await db.insert(comments).values(commentData).returning();
      console.log(`[DB] Created comment: ${comment.id}`);
      return comment;
    } catch (error) {
      console.error('[DB] Error creating comment:', error);
      throw error;
    }
  }

  async updateCommentUpvotes(id: string, upvotes: number): Promise<Comment | undefined> {
    try {
      const [comment] = await db
        .update(comments)
        .set({ upvotes })
        .where(eq(comments.id, id))
        .returning();
      
      return comment || undefined;
    } catch (error) {
      console.error('[DB] Error updating comment upvotes:', error);
      return undefined;
    }
  }

  async getVote(userId: string, targetType: string, targetId: string): Promise<Vote | undefined> {
    try {
      const [vote] = await db
        .select()
        .from(votes)
        .where(
          and(
            eq(votes.userId, userId),
            eq(votes.targetType, targetType),
            eq(votes.targetId, targetId)
          )
        );
      
      return vote || undefined;
    } catch (error) {
      console.error('[DB] Error getting vote:', error);
      return undefined;
    }
  }

  async createOrUpdateVote(voteData: CreateVote): Promise<Vote> {
    try {
      // Use INSERT ... ON CONFLICT for upsert
      const [vote] = await db
        .insert(votes)
        .values(voteData)
        .onConflictDoUpdate({
          target: [votes.userId, votes.targetType, votes.targetId],
          set: { voteType: voteData.voteType }
        })
        .returning();
      
      return vote;
    } catch (error) {
      console.error('[DB] Error creating/updating vote:', error);
      throw error;
    }
  }

  async removeVote(userId: string, targetType: string, targetId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(votes)
        .where(
          and(
            eq(votes.userId, userId),
            eq(votes.targetType, targetType),
            eq(votes.targetId, targetId)
          )
        );
      
      return result.rowCount !== undefined && result.rowCount > 0;
    } catch (error) {
      console.error('[DB] Error removing vote:', error);
      return false;
    }
  }

  async getAllAchievements(): Promise<Achievement[]> {
    try {
      return await db.select().from(achievements).orderBy(achievements.requirement);
    } catch (error) {
      console.error('[DB] Error getting achievements:', error);
      return [];
    }
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
    } catch (error) {
      console.error('[DB] Error getting user achievements:', error);
      return [];
    }
  }

  async createUserAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    try {
      const [userAchievement] = await db
        .insert(userAchievements)
        .values({ userId, achievementId })
        .returning();
      
      console.log(`[DB] Created user achievement: ${userAchievement.id}`);
      return userAchievement;
    } catch (error) {
      console.error('[DB] Error creating user achievement:', error);
      throw error;
    }
  }

  async getBookmarks(userId: string): Promise<Bookmark[]> {
    try {
      return await db.select().from(bookmarks).where(eq(bookmarks.userId, userId)).orderBy(desc(bookmarks.createdAt));
    } catch (error) {
      console.error('[DB] Error getting bookmarks:', error);
      return [];
    }
  }

  async createBookmark(bookmarkData: CreateBookmark): Promise<Bookmark> {
    try {
      const [bookmark] = await db.insert(bookmarks).values(bookmarkData).returning();
      console.log(`[DB] Created bookmark: ${bookmark.id}`);
      return bookmark;
    } catch (error) {
      console.error('[DB] Error creating bookmark:', error);
      throw error;
    }
  }

  async removeBookmark(userId: string, targetType: string, targetId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, userId),
            eq(bookmarks.targetType, targetType),
            eq(bookmarks.targetId, targetId)
          )
        );
      
      return result.rowCount !== undefined && result.rowCount > 0;
    } catch (error) {
      console.error('[DB] Error removing bookmark:', error);
      return false;
    }
  }

  async getUserStats(userId: string): Promise<{
    threadsCount: number;
    commentsCount: number;
    bestAnswersCount: number;
    totalUpvotes: number;
  }> {
    try {
      // Get threads count
      const [threadsResult] = await db
        .select({ count: count() })
        .from(threads)
        .where(eq(threads.authorId, userId));

      // Get comments count
      const [commentsResult] = await db
        .select({ count: count() })
        .from(comments)
        .where(eq(comments.authorId, userId));

      // Get total upvotes from threads and comments
      const [threadsUpvotesResult] = await db
        .select({ total: sql<number>`COALESCE(SUM(${threads.upvotes}), 0)` })
        .from(threads)
        .where(eq(threads.authorId, userId));

      const [commentsUpvotesResult] = await db
        .select({ total: sql<number>`COALESCE(SUM(${comments.upvotes}), 0)` })
        .from(comments)
        .where(eq(comments.authorId, userId));

      return {
        threadsCount: threadsResult?.count || 0,
        commentsCount: commentsResult?.count || 0,
        bestAnswersCount: 0, // TODO: Implement best answers logic
        totalUpvotes: (threadsUpvotesResult?.total || 0) + (commentsUpvotesResult?.total || 0),
      };
    } catch (error) {
      console.error('[DB] Error getting user stats:', error);
      return {
        threadsCount: 0,
        commentsCount: 0,
        bestAnswersCount: 0,
        totalUpvotes: 0,
      };
    }
  }
}