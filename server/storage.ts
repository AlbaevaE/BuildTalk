import { 
  type User, type UpsertUser, type Thread, type InsertThread, type Comment, type InsertComment,
  type Vote, type CreateVote, type Achievement, type UserAchievement, type Bookmark, type CreateBookmark,
  type UpdateUserProfile, users, threads, comments, votes, achievements, userAchievements, bookmarks 
} from "@shared/schema";
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

// Simple in-memory storage implementation
class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, User> = new Map();
  private threads: Map<string, Thread> = new Map();
  private comments: Map<string, Comment> = new Map();
  private votes: Map<string, Vote> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private userAchievements: Map<string, UserAchievement> = new Map();
  private bookmarks: Map<string, Bookmark> = new Map();

  constructor() {
    // Pre-populate some achievements
    this.initializeAchievements();
  }

  private initializeAchievements() {
    const baseAchievements: Achievement[] = [
      { id: '1', name: 'Первые шаги', description: 'Зарегистрироваться на форуме', icon: '🎯', category: 'karma', requirement: 0, createdAt: new Date() },
      { id: '2', name: 'Что-то понимающий', description: 'Набрать 10+ кармы', icon: '🪚', category: 'karma', requirement: 10, createdAt: new Date() },
      { id: '3', name: 'Можно доверять', description: 'Набрать 30+ кармы', icon: '🔨', category: 'karma', requirement: 30, createdAt: new Date() },
      { id: '4', name: 'Знающий мастер', description: 'Набрать 100+ кармы', icon: '⚙️', category: 'karma', requirement: 100, createdAt: new Date() },
      { id: '5', name: 'Авторитет', description: 'Набрать 300+ кармы', icon: '🧰', category: 'karma', requirement: 300, createdAt: new Date() },
      { id: '6', name: 'Профессионал', description: 'Набрать 500+ кармы', icon: '🛠️', category: 'karma', requirement: 500, createdAt: new Date() },
      { id: '7', name: 'Эксперт', description: 'Набрать 700+ кармы', icon: '🏗️', category: 'karma', requirement: 700, createdAt: new Date() },
      { id: '8', name: 'Гуру ремонта', description: 'Набрать 1000+ кармы', icon: '🏆', category: 'karma', requirement: 1000, createdAt: new Date() },
    ];

    baseAchievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  // User methods
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

  async updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = { ...user, ...updates, updatedAt: new Date() };
      this.users.set(userId, updatedUser);
      if (updatedUser.email) {
        this.usersByEmail.set(updatedUser.email, updatedUser);
      }
      return updatedUser;
    }
    return undefined;
  }

  // Thread methods
  async getThreads(category?: string): Promise<Thread[]> {
    const allThreads = Array.from(this.threads.values());
    if (category) {
      return allThreads.filter(thread => thread.category === category);
    }
    return allThreads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getThread(id: string): Promise<Thread | undefined> {
    return this.threads.get(id);
  }

  async createThread(threadData: InsertThread): Promise<Thread> {
    const id = randomUUID();
    const thread: Thread = {
      id,
      ...threadData,
      upvotes: 0,
      createdAt: new Date(),
    };
    this.threads.set(id, thread);
    console.log(`[DEBUG] Created thread in memory: ${id}`);
    return thread;
  }

  async updateThreadUpvotes(id: string, upvotes: number): Promise<Thread | undefined> {
    const thread = this.threads.get(id);
    if (thread) {
      thread.upvotes = upvotes;
      this.threads.set(id, thread);
      return thread;
    }
    return undefined;
  }

  // Comment methods
  async getComments(threadId: string): Promise<Comment[]> {
    const allComments = Array.from(this.comments.values());
    return allComments
      .filter(comment => comment.threadId === threadId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      id,
      ...commentData,
      upvotes: 0,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    console.log(`[DEBUG] Created comment in memory: ${id}`);
    return comment;
  }

  async updateCommentUpvotes(id: string, upvotes: number): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (comment) {
      comment.upvotes = upvotes;
      this.comments.set(id, comment);
      return comment;
    }
    return undefined;
  }

  // Vote methods
  async getVote(userId: string, targetType: string, targetId: string): Promise<Vote | undefined> {
    const vote = Array.from(this.votes.values()).find(v => 
      v.userId === userId && v.targetType === targetType && v.targetId === targetId
    );
    return vote;
  }

  async createOrUpdateVote(voteData: CreateVote): Promise<Vote> {
    const existingVote = await this.getVote(voteData.userId, voteData.targetType, voteData.targetId);
    
    if (existingVote) {
      existingVote.voteType = voteData.voteType;
      this.votes.set(existingVote.id, existingVote);
      return existingVote;
    } else {
      const id = randomUUID();
      const vote: Vote = {
        id,
        ...voteData,
        createdAt: new Date(),
      };
      this.votes.set(id, vote);
      return vote;
    }
  }

  async removeVote(userId: string, targetType: string, targetId: string): Promise<boolean> {
    const vote = await this.getVote(userId, targetType, targetId);
    if (vote) {
      this.votes.delete(vote.id);
      return true;
    }
    return false;
  }

  // Achievement methods
  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(ua => ua.userId === userId);
  }

  async createUserAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const id = randomUUID();
    const userAchievement: UserAchievement = {
      id,
      userId,
      achievementId,
      earnedAt: new Date(),
    };
    this.userAchievements.set(id, userAchievement);
    return userAchievement;
  }

  // Bookmark methods
  async getBookmarks(userId: string): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values())
      .filter(b => b.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createBookmark(bookmarkData: CreateBookmark): Promise<Bookmark> {
    const id = randomUUID();
    const bookmark: Bookmark = {
      id,
      ...bookmarkData,
      createdAt: new Date(),
    };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async removeBookmark(userId: string, targetType: string, targetId: string): Promise<boolean> {
    const bookmark = Array.from(this.bookmarks.values()).find(b => 
      b.userId === userId && b.targetType === targetType && b.targetId === targetId
    );
    if (bookmark) {
      this.bookmarks.delete(bookmark.id);
      return true;
    }
    return false;
  }

  // Stats method for profile
  async getUserStats(userId: string): Promise<{
    threadsCount: number;
    commentsCount: number;
    bestAnswersCount: number;
    totalUpvotes: number;
  }> {
    const userThreads = Array.from(this.threads.values()).filter(t => t.authorId === userId);
    const userComments = Array.from(this.comments.values()).filter(c => c.authorId === userId);
    const totalUpvotes = userThreads.reduce((sum, t) => sum + t.upvotes, 0) + 
                        userComments.reduce((sum, c) => sum + c.upvotes, 0);
    
    return {
      threadsCount: userThreads.length,
      commentsCount: userComments.length,
      bestAnswersCount: 0, // TODO: Implement best answers logic
      totalUpvotes,
    };
  }
}

// Use MemStorage for now
export const storage = new MemStorage();
console.log('[DEBUG] Using MemStorage for development');