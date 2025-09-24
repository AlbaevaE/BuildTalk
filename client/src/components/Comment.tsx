import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { useState } from "react";
import type { Comment as CommentType } from "@shared/schema";

interface CommentProps {
  comment: CommentType & {
    timeAgo: string;
  };
  onUpvote?: (commentId: string, newUpvotes: number) => void;
  onReply?: (commentId: string) => void;
}

export default function Comment({ comment, onUpvote, onReply }: CommentProps) {
  const handleUpvote = () => {
    // Simple increment by 1 - optimistic updates handled by React Query
    const newUpvotes = comment.upvotes + 1;
    onUpvote?.(comment.id, newUpvotes);
  };

  const handleReply = () => {
    onReply?.(comment.id);
  };

  return (
    <div className="ml-6 border-l-2 border-border pl-4" data-testid={`comment-${comment.id}`}>
      <Card className="hover-elevate">
        <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <UserAvatar 
              name={comment.authorName} 
              role={comment.authorRole as 'contractor' | 'homeowner' | 'supplier' | 'architect' | 'diy'} 
              size="sm" 
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground" data-testid={`text-comment-author-${comment.id}`}>
                  {comment.authorName}
                </span>
                <span>•</span>
                <span data-testid={`text-comment-time-${comment.id}`}>
                  {comment.timeAgo}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" data-testid={`button-comment-menu-${comment.id}`}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-foreground mb-4 leading-relaxed" data-testid={`text-comment-content-${comment.id}`}>
          {comment.content}
        </p>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={handleUpvote}
            data-testid={`button-comment-upvote-${comment.id}`}
          >
            <Heart className="h-4 w-4" />
            {comment.upvotes}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={handleReply}
            data-testid={`button-comment-reply-${comment.id}`}
          >
            <MessageCircle className="h-4 w-4" />
            Ответить
          </Button>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}