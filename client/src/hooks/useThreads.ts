import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Thread, Comment, InsertComment } from "@shared/schema";

// Thread hooks
export function useThread(id: string) {
  return useQuery<Thread>({
    queryKey: ["/api/threads", id],
    queryFn: async () => {
      const response = await fetch(`/api/threads/${id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useThreads() {
  return useQuery<Thread[]>({
    queryKey: ["/api/threads"],
    queryFn: async () => {
      const response = await fetch("/api/threads", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      category: string;
      authorId: string;
      authorName: string;
      authorRole: string;
    }) => {
      const response = await apiRequest("POST", "/api/threads", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threads"] });
    },
  });
}

export function useUpvoteThread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, upvotes }: { id: string; upvotes: number }) => {
      const response = await apiRequest("PATCH", `/api/threads/${id}/upvotes`, { upvotes });
      return response.json();
    },
    onMutate: async ({ id, upvotes }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/threads", id] });
      
      // Snapshot the previous value
      const previousThread = queryClient.getQueryData<Thread>(["/api/threads", id]);
      
      // Optimistically update to the new value
      if (previousThread) {
        queryClient.setQueryData<Thread>(["/api/threads", id], {
          ...previousThread,
          upvotes,
        });
      }
      
      return { previousThread };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousThread) {
        queryClient.setQueryData(["/api/threads", id], context.previousThread);
      }
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/threads", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/threads"] });
    },
  });
}

// Comment hooks
export function useComments(threadId: string) {
  return useQuery<Comment[]>({
    queryKey: ["/api/threads", threadId, "comments"],
    queryFn: async () => {
      const response = await fetch(`/api/threads/${threadId}/comments`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!threadId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ threadId, ...data }: InsertComment) => {
      const response = await apiRequest("POST", `/api/threads/${threadId}/comments`, data);
      return response.json();
    },
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/threads", threadId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/threads", threadId] });
      queryClient.invalidateQueries({ queryKey: ["/api/threads"] });
    },
  });
}

export function useUpvoteComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, upvotes, threadId }: { id: string; upvotes: number; threadId: string }) => {
      const response = await apiRequest("PATCH", `/api/comments/${id}/upvotes`, { upvotes });
      return response.json();
    },
    onMutate: async ({ id, upvotes, threadId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/threads", threadId, "comments"] });
      
      // Snapshot the previous value
      const previousComments = queryClient.getQueryData<Comment[]>(["/api/threads", threadId, "comments"]);
      
      // Optimistically update to the new value
      if (previousComments) {
        queryClient.setQueryData<Comment[]>(["/api/threads", threadId, "comments"], 
          previousComments.map(comment =>
            comment.id === id ? { ...comment, upvotes } : comment
          )
        );
      }
      
      return { previousComments };
    },
    onError: (err, { threadId }, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(["/api/threads", threadId, "comments"], context.previousComments);
      }
    },
    onSettled: (_, __, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/threads", threadId, "comments"] });
    },
  });
}