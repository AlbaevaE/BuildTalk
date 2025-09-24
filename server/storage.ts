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
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default users
    const users = [
      { id: "user-1", username: "sara_johnson", email: "sara@example.com", role: "homeowner" as const },
      { id: "user-2", username: "mike_chen", email: "mike@example.com", role: "diy" as const },
      { id: "user-3", username: "tom_rodriguez", email: "tom@example.com", role: "homeowner" as const },
      { id: "user-4", username: "lisa_park", email: "lisa@example.com", role: "contractor" as const },
      { id: "user-5", username: "david_kim", email: "david@example.com", role: "diy" as const },
    ];

    users.forEach(user => this.users.set(user.id, user));

    // Create default threads matching HomePage mock data
    const threads = [
      {
        id: "1",
        title: "Лучший способ укладки паркета во влажных помещениях?",
        content: "Делаю ремонт на кухне и хочу уложить паркет, но беспокоюсь о влажности от раковины. Какие есть лучшие практики защиты дерева и обеспечения долговечности? Стоит ли использовать инженерный паркет?",
        authorId: "user-1",
        authorName: "Сара Джонсон",
        category: "construction" as const,
        upvotes: 12,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: "2",
        title: "Изготовление стола на заказ - орех или дуб?",
        content: "Планирую построить обеденный стол длиной 2,4 метра для семьи. Выбираю между орехом и дубом. Нужен совет по долговечности, стоимости и внешнему виду в современном фермерском стиле. Также рассматриваю способы соединения.",
        authorId: "user-2",
        authorName: "Майк Чен",
        category: "furniture" as const,
        upvotes: 24,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: "3",
        title: "Требования к разрешениям на электрику при ремонте кухни",
        content: "Делаю масштабный ремонт кухни, нужно добавить новые розетки и перенести существующие. Какие обычно требуются разрешения и нужен ли лицензированный электрик для всех работ?",
        authorId: "user-3",
        authorName: "Том Родригес",
        category: "services" as const,
        upvotes: 18,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        id: "4",
        title: "Советы по определению несущих стен",
        content: "Работаю над перепланировкой в открытую планировку и нужно определить несущие стены перед демонтажем. На что обращать внимание? Когда точно нужно вызывать инженера-конструктора?",
        authorId: "user-4",
        authorName: "Лиза Парк",
        category: "construction" as const,
        upvotes: 35,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      },
      {
        id: "5",
        title: "Рекомендации по покрытию для уличной мебели",
        content: "Делаю садовые скамейки и кашпо из кедра. Какое покрытие рекомендуете для защиты от погоды, сохраняя натуральный вид дерева? Масло, полиуретан или морской лак?",
        authorId: "user-5",
        authorName: "Дэвид Ким",
        category: "furniture" as const,
        upvotes: 16,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
    ];

    threads.forEach(thread => this.threads.set(thread.id, thread));
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
