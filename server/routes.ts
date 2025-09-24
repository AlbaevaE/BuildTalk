import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertThreadSchema, insertCommentSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";

// Validation schemas for updates
const updateThreadSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  category: z.enum(['construction', 'furniture', 'services']).optional(),
  authorName: z.string().optional(),
  authorRole: z.enum(['contractor', 'homeowner', 'supplier', 'architect', 'diy']).optional(),
}).strict().refine(obj => Object.keys(obj).length > 0, {
  message: "At least one field is required for update"
});

const updateCommentSchema = z.object({
  content: z.string().optional(),
  authorName: z.string().optional(),
  authorRole: z.enum(['contractor', 'homeowner', 'supplier', 'architect', 'diy']).optional(),
}).strict().refine(obj => Object.keys(obj).length > 0, {
  message: "At least one field is required for update"
});

const upvoteSchema = z.object({
  upvotes: z.number().int().min(0).finite(),
}).strict();

export async function registerRoutes(app: Express): Promise<Server> {
  // Thread routes
  app.get("/api/threads", async (req, res) => {
    try {
      const threads = await storage.getThreads();
      res.json(threads);
    } catch (error) {
      console.error("Error getting threads:", error);
      res.status(500).json({ error: "Failed to get threads" });
    }
  });

  app.get("/api/threads/:id", async (req, res) => {
    try {
      const thread = await storage.getThread(req.params.id);
      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }
      res.json(thread);
    } catch (error) {
      console.error("Error getting thread:", error);
      res.status(500).json({ error: "Failed to get thread" });
    }
  });

  app.post("/api/threads", async (req, res) => {
    try {
      const result = insertThreadSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid thread data", 
          details: fromZodError(result.error).toString() 
        });
      }

      const thread = await storage.createThread(result.data);
      res.status(201).json(thread);
    } catch (error) {
      console.error("Error creating thread:", error);
      res.status(500).json({ error: "Failed to create thread" });
    }
  });

  app.patch("/api/threads/:id", async (req, res) => {
    try {
      const result = updateThreadSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid thread data", 
          details: fromZodError(result.error).toString() 
        });
      }

      const thread = await storage.updateThread(req.params.id, result.data);
      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }
      res.json(thread);
    } catch (error) {
      console.error("Error updating thread:", error);
      res.status(500).json({ error: "Failed to update thread" });
    }
  });

  app.patch("/api/threads/:id/upvotes", async (req, res) => {
    try {
      const result = upvoteSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid upvotes data", 
          details: fromZodError(result.error).toString() 
        });
      }

      const thread = await storage.updateThreadUpvotes(req.params.id, result.data.upvotes);
      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }
      res.json(thread);
    } catch (error) {
      console.error("Error updating thread upvotes:", error);
      res.status(500).json({ error: "Failed to update thread upvotes" });
    }
  });

  app.delete("/api/threads/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteThread(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Thread not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting thread:", error);
      res.status(500).json({ error: "Failed to delete thread" });
    }
  });

  // Comment routes
  app.get("/api/threads/:threadId/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByThreadId(req.params.threadId);
      res.json(comments);
    } catch (error) {
      console.error("Error getting comments:", error);
      res.status(500).json({ error: "Failed to get comments" });
    }
  });

  app.get("/api/comments/:id", async (req, res) => {
    try {
      const comment = await storage.getComment(req.params.id);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json(comment);
    } catch (error) {
      console.error("Error getting comment:", error);
      res.status(500).json({ error: "Failed to get comment" });
    }
  });

  app.post("/api/threads/:threadId/comments", async (req, res) => {
    try {
      // Check if thread exists
      const thread = await storage.getThread(req.params.threadId);
      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }

      const commentData = { ...req.body, threadId: req.params.threadId };
      const result = insertCommentSchema.safeParse(commentData);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid comment data", 
          details: fromZodError(result.error).toString() 
        });
      }

      const comment = await storage.createComment(result.data);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.patch("/api/comments/:id", async (req, res) => {
    try {
      const result = updateCommentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid comment data", 
          details: fromZodError(result.error).toString() 
        });
      }

      const comment = await storage.updateComment(req.params.id, result.data);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json(comment);
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ error: "Failed to update comment" });
    }
  });

  app.patch("/api/comments/:id/upvotes", async (req, res) => {
    try {
      const result = upvoteSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid upvotes data", 
          details: fromZodError(result.error).toString() 
        });
      }

      const comment = await storage.updateCommentUpvotes(req.params.id, result.data.upvotes);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json(comment);
    } catch (error) {
      console.error("Error updating comment upvotes:", error);
      res.status(500).json({ error: "Failed to update comment upvotes" });
    }
  });

  app.delete("/api/comments/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteComment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
