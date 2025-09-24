import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import UserAvatar from "./UserAvatar";
import CategoryBadge from "./CategoryBadge";
import { useState } from "react";
import { Link } from "wouter";

interface ThreadCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    role: 'contractor' | 'homeowner' | 'supplier' | 'architect' | 'diy';
    avatar?: string;
  };
  category: 'construction' | 'furniture' | 'services';
  upvotes: number;
  replies: number;
  timeAgo: string;
  images?: string[];
}

export default function ThreadCard({ 
  id, 
  title, 
  content, 
  author, 
  category, 
  upvotes: initialUpvotes, 
  replies, 
  timeAgo, 
  images 
}: ThreadCardProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [isUpvoted, setIsUpvoted] = useState(false);

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpvoted) {
      setUpvotes(prev => prev - 1);
      setIsUpvoted(false);
    } else {
      setUpvotes(prev => prev + 1);
      setIsUpvoted(true);
    }
    console.log(`Thread ${id} ${isUpvoted ? 'unupvoted' : 'upvoted'}`);
  };

  return (
    <Link href={`/thread/${id}`}>
      <Card className="hover-elevate cursor-pointer" data-testid={`thread-card-${id}`}>
        <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <UserAvatar name={author.name} role={author.role} avatar={author.avatar} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{author.name}</span>
                <span>•</span>
                <span>{timeAgo}</span>
              </div>
              <CategoryBadge category={category} />
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => e.stopPropagation()}
            data-testid={`button-thread-menu-${id}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2" data-testid={`text-thread-title-${id}`}>
          {title}
        </h3>
        
        <p className="text-muted-foreground mb-4 line-clamp-3" data-testid={`text-thread-content-${id}`}>
          {content}
        </p>
        
        {images && images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {images.slice(0, 4).map((image, index) => (
              <div 
                key={index} 
                className="aspect-video bg-muted rounded-md overflow-hidden"
                data-testid={`image-thread-${id}-${index}`}
              >
                <img 
                  src={image} 
                  alt={`Thread image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-2 ${isUpvoted ? 'text-red-500' : ''}`}
            onClick={handleUpvote}
            data-testid={`button-upvote-${id}`}
          >
            <Heart className={`h-4 w-4 ${isUpvoted ? 'fill-current' : ''}`} />
            {upvotes}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={(e) => e.stopPropagation()}
            data-testid={`button-reply-${id}`}
          >
            <MessageCircle className="h-4 w-4" />
            {replies}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={(e) => e.stopPropagation()}
            data-testid={`button-share-${id}`}
          >
            <Share2 className="h-4 w-4" />
            Поделиться
          </Button>
        </div>
        </CardContent>
      </Card>
    </Link>
  );
}