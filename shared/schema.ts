import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
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

export type InsertThread = z.infer<typeof insertThreadSchema>;
export type CreateThread = z.infer<typeof createThreadSchema>;
export type Thread = typeof threads.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type CreateComment = z.infer<typeof createCommentSchema>;
export type Comment = typeof comments.$inferSelect;
