import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Heart, MessageCircle, Share2, MoreHorizontal, Loader2 } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import CategoryBadge from "@/components/CategoryBadge";
import Comment from "@/components/Comment";
import CommentForm from "@/components/CommentForm";
import { useToast } from "@/hooks/use-toast";
import { useThread, useComments, useUpvoteThread, useCreateComment, useUpvoteComment } from "@/hooks/useThreads";
import { useAuth, getUserDisplayName } from "@/hooks/useAuth";
import type { Thread, Comment as CommentType } from "@shared/schema";

// Helper function to format time
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "только что";
  if (diffMinutes < 60) return `${diffMinutes} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  return `${diffDays} дн назад`;
}

export default function ThreadDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data: currentUser } = useAuth();

  // API hooks
  const { data: thread, isLoading: threadLoading, error: threadError } = useThread(id!);
  const { data: comments = [], isLoading: commentsLoading, error: commentsError } = useComments(id!);
  const upvoteThreadMutation = useUpvoteThread();
  const createCommentMutation = useCreateComment();
  const upvoteCommentMutation = useUpvoteComment();

  // Handle mutation errors
  useEffect(() => {
    if (upvoteThreadMutation.error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить лайк. Попробуйте еще раз.",
      });
    }
  }, [upvoteThreadMutation.error, toast]);

  useEffect(() => {
    if (upvoteCommentMutation.error) {
      toast({
        variant: "destructive", 
        title: "Ошибка",
        description: "Не удалось обновить лайк комментария. Попробуйте еще раз.",
      });
    }
  }, [upvoteCommentMutation.error, toast]);

  useEffect(() => {
    if (createCommentMutation.error) {
      toast({
        variant: "destructive",
        title: "Ошибка", 
        description: "Не удалось отправить комментарий. Попробуйте еще раз.",
      });
    }
  }, [createCommentMutation.error, toast]);

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <h2 className="text-xl font-semibold mb-2">Обсуждение не найдено</h2>
        <p className="text-muted-foreground mb-4">Запрашиваемое обсуждение не существует или было удалено.</p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться на главную
          </Button>
        </Link>
      </div>
    );
  }

  if (threadLoading || commentsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Загрузка обсуждения...</p>
      </div>
    );
  }

  if (threadError || !thread) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <h2 className="text-xl font-semibold mb-2">Ошибка загрузки</h2>
        <p className="text-muted-foreground mb-4">
          {threadError?.message || "Не удалось загрузить обсуждение."}
        </p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться на главную
          </Button>
        </Link>
      </div>
    );
  }

  const handleThreadUpvote = () => {
    if (!thread) return;
    // Simple toggle: just increment or decrement by 1
    const newUpvotes = thread.upvotes + 1;
    upvoteThreadMutation.mutate({ id, upvotes: newUpvotes });
  };

  const handleCommentUpvote = (commentId: string, newUpvotes: number) => {
    upvoteCommentMutation.mutate({ id: commentId, upvotes: newUpvotes, threadId: id });
  };

  const handleCommentSubmit = (commentData: {
    content: string;
  }) => {
    createCommentMutation.mutate({
      threadId: id,
      content: commentData.content,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Обсуждение</h1>
      </div>

      {/* Thread Card */}
      <Card data-testid={`thread-detail-${id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <UserAvatar 
                name="Автор" 
                role="homeowner" 
                size="md" 
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Пользователь</span>
                  <span>•</span>
                  <span>{formatTimeAgo(new Date(thread.createdAt))}</span>
                </div>
                <CategoryBadge category={thread.category as 'construction' | 'furniture' | 'services'} />
              </div>
            </div>
            <Button variant="ghost" size="icon" data-testid={`button-thread-menu-${id}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <h1 className="text-2xl font-bold mb-4" data-testid={`text-thread-title-${id}`}>
            {thread.title}
          </h1>
          
          <div className="prose prose-sm max-w-none mb-6" data-testid={`text-thread-content-${id}`}>
            {thread.content.split('\n').map((paragraph, index) => (
              <p key={index} className="text-foreground leading-relaxed mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={handleThreadUpvote}
              disabled={upvoteThreadMutation.isPending}
              data-testid={`button-upvote-${id}`}
            >
              <Heart className="h-4 w-4" />
              {thread.upvotes}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              data-testid={`button-reply-${id}`}
            >
              <MessageCircle className="h-4 w-4" />
              {comments.length}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              data-testid={`button-share-${id}`}
            >
              <Share2 className="h-4 w-4" />
              Поделиться
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold" data-testid="text-comments-title">
          Комментарии ({comments.length})
        </h2>

        {/* Comment Form */}
        <CommentForm 
          threadId={id}
          onSubmit={handleCommentSubmit}
          compact={true}
        />

        {/* Comment Form Loading State */}
        {createCommentMutation.isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Отправка комментария...
          </div>
        )}

        {/* Comments List */}
        {commentsError && (
          <div className="text-center py-4">
            <p className="text-destructive">Ошибка загрузки комментариев: {commentsError.message}</p>
          </div>
        )}
        
        <div className="space-y-4" data-testid="comments-list">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={{
                ...comment,
                timeAgo: formatTimeAgo(new Date(comment.createdAt))
              }}
              onUpvote={handleCommentUpvote}
              onReply={(commentId) => console.log(`Reply to comment ${commentId}`)}
            />
          ))}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Пока нет комментариев</h3>
            <p className="text-muted-foreground">
              Станьте первым, кто прокомментирует это обсуждение!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}