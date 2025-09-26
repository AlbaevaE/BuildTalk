import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertThreadSchema, createThreadSchema, insertCommentSchema, createCommentSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import { requireAuth, attachUser, loginWithEmail, registerWithEmail } from "./simpleAuth";

// Validation schemas for updates (no author fields - will be taken from authenticated user)
const updateThreadSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  category: z.enum(['construction', 'furniture', 'services']).optional(),
}).strict().refine(obj => Object.keys(obj).length > 0, {
  message: "At least one field is required for update"
});

const updateCommentSchema = z.object({
  content: z.string().optional(),
}).strict().refine(obj => Object.keys(obj).length > 0, {
  message: "At least one field is required for update"
});

const upvoteSchema = z.object({
  upvotes: z.number().int().min(0).finite(),
}).strict();

// Registration validation schema
const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
}).strict();

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple auth middleware
  app.use('/api', attachUser);
  
  // Simple authentication routes for development
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, provider } = req.body;
      // Only support email/password authentication
      if (provider) {
        return res.status(400).json({ error: 'Provider-based authentication not supported' });
      }
      
      const user = await loginWithEmail(email, password);
      
      if (user) {
        (req as any).session.user = user;
        res.json({ success: true, user });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/auth/user', (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    if ((req as any).session) {
      (req as any).session.destroy((err: any) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ success: true });
      });
    } else {
      res.json({ success: true });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid registration data", 
          details: fromZodError(result.error).toString() 
        });
      }

      const { email, password, firstName, lastName } = result.data;
      const user = await registerWithEmail(email, password, firstName, lastName);
      
      if (user) {
        (req as any).session.user = user;
        res.status(201).json({ success: true, user });
      } else {
        res.status(409).json({ error: 'User already exists with this email' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Thread routes
  app.get("/api/threads", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const threads = await storage.getThreads(category);
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
      const result = createThreadSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid thread data", 
          details: fromZodError(result.error).toString() 
        });
      }

      // In development mode without auth, use test user
      let authorId = (req.user as any)?.id;
      if (!authorId) {
        if (process.env.NODE_ENV === 'development') {
          // Use the test user ID that we created earlier
          authorId = '550e8400-e29b-41d4-a716-446655440001';
        } else {
          return res.status(401).json({ error: 'Authentication required' });
        }
      }

      const threadData = { ...result.data, authorId };
      const thread = await storage.createThread(threadData);
      res.status(201).json(thread);
    } catch (error) {
      console.error("Error creating thread:", error);
      res.status(500).json({ error: "Failed to create thread" });
    }
  });

  app.patch("/api/threads/:id", requireAuth, async (req, res) => {
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

  app.patch("/api/threads/:id/upvotes", requireAuth, async (req, res) => {
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

  app.delete("/api/threads/:id", requireAuth, async (req, res) => {
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

  app.post("/api/threads/:threadId/comments", requireAuth, async (req, res) => {
    try {
      // Check if thread exists
      const thread = await storage.getThread(req.params.threadId);
      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }

      const result = createCommentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid comment data", 
          details: fromZodError(result.error).toString() 
        });
      }

      const commentWithAuthor = { ...result.data, threadId: req.params.threadId, authorId: (req.user as any)!.id };
      const comment = await storage.createComment(commentWithAuthor);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.patch("/api/comments/:id", requireAuth, async (req, res) => {
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

  app.patch("/api/comments/:id/upvotes", requireAuth, async (req, res) => {
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

  app.delete("/api/comments/:id", requireAuth, async (req, res) => {
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
