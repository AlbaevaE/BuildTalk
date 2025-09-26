import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, index, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  password: varchar("password"), // For email/password authentication
  karma: integer("karma").notNull().default(0), // Карма пользователя
  role: varchar("role", { length: 50 }).default("diy"), // contractor, homeowner, supplier, architect, diy
  bio: text("bio"), // Описание профиля
  isProfilePublic: boolean("is_profile_public").notNull().default(true), // Видимость профиля
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const threads = pgTable("threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // 'construction', 'furniture', 'services'
  authorId: varchar("author_id").notNull().references(() => users.id),
  upvotes: integer("upvotes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  threadId: varchar("thread_id").notNull().references(() => threads.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  upvotes: integer("upvotes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Голосование за посты и комментарии
export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  targetType: varchar("target_type", { length: 20 }).notNull(), // 'thread' или 'comment'
  targetId: varchar("target_id").notNull(), // ID поста или комментария
  voteType: varchar("vote_type", { length: 10 }).notNull(), // 'up' или 'down'
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => [
  // Один пользователь может голосовать только один раз за конкретный объект
  unique().on(table.userId, table.targetType, table.targetId)
]);

// Достижения
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(), // Иконка достижения
  category: varchar("category", { length: 50 }).notNull(), // 'karma', 'content', 'questions', 'activity', 'help'
  requirement: integer("requirement").notNull(), // Количество для получения
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Достижения пользователей
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id),
  earnedAt: timestamp("earned_at").notNull().default(sql`now()`),
}, (table) => [
  // Пользователь может получить каждое достижение только один раз
  unique().on(table.userId, table.achievementId)
]);

// Закладки
export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  targetType: varchar("target_type", { length: 20 }).notNull(), // 'thread' или 'comment'
  targetId: varchar("target_id").notNull(), // ID поста или комментария
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => [
  // Один пользователь может добавить одну закладку на объект только один раз
  unique().on(table.userId, table.targetType, table.targetId)
]);

export const insertThreadSchema = createInsertSchema(threads).omit({
  id: true,
  upvotes: true,
  createdAt: true,
});

// Client-side thread creation schema (authorId will be added by server from auth)
export const createThreadSchema = insertThreadSchema.omit({
  authorId: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  upvotes: true,
  createdAt: true,
});

// Client-side comment creation schema (authorId and threadId will be added by server from auth/URL)
export const createCommentSchema = insertCommentSchema.omit({
  authorId: true,
  threadId: true,
});

// Схемы для создания
export const createVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export const createBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
});

export const createAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const updateUserProfileSchema = createInsertSchema(users).omit({
  id: true,
  email: true,
  password: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Типы для TypeScript
export type InsertThread = z.infer<typeof insertThreadSchema>;
export type CreateThread = z.infer<typeof createThreadSchema>;
export type Thread = typeof threads.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type CreateComment = z.infer<typeof createCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type Vote = typeof votes.$inferSelect;
export type CreateVote = z.infer<typeof createVoteSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type CreateBookmark = z.infer<typeof createBookmarkSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
