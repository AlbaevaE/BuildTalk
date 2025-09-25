import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import UserAvatar from "./UserAvatar";
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
      <article 
        className="p-4 mb-3 bg-card rounded-2xl border border-border cursor-pointer hover:bg-muted/30 transition-all duration-200 hover:shadow-sm" 
        data-testid={`thread-card-${id}`}
      >
        <div className="flex gap-3">
          <UserAvatar name={author.name} role={author.role} avatar={author.avatar} size="sm" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span className="font-medium text-foreground">{author.name}</span>
              <span>·</span>
              <span>{timeAgo}</span>
              <span>·</span>
              <span className="text-xs">{
                category === 'construction' ? 'Строительство' :
                category === 'furniture' ? 'Мебель' : 'Услуги'
              }</span>
              <button 
                onClick={(e) => e.stopPropagation()}
                className="ml-auto p-2 rounded-xl hover:bg-muted transition-all duration-200"
                data-testid={`button-thread-menu-${id}`}
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            <h3 className="text-base font-normal mb-1 line-clamp-2 text-foreground" data-testid={`text-thread-title-${id}`}>
              {title}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3" data-testid={`text-thread-content-${id}`}>
              {content}
            </p>
            
            {images && images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                {images.slice(0, 4).map((image, index) => (
                  <div 
                    key={index} 
                    className="aspect-video bg-muted rounded-2xl overflow-hidden"
                    data-testid={`image-thread-${id}-${index}`}
                  >
                    <img 
                      src={image} 
                      alt={`Thread image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button 
                className={`flex items-center gap-2 px-3 py-2 rounded-xl hover:text-foreground hover:bg-muted/50 transition-all duration-200 ${isUpvoted ? 'text-red-500 bg-red-50 dark:bg-red-950' : ''}`}
                onClick={handleUpvote}
                data-testid={`button-upvote-${id}`}
              >
                <Heart className={`h-4 w-4 ${isUpvoted ? 'fill-current' : ''}`} />
                <span>{upvotes}</span>
              </button>
              
              <button 
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
                data-testid={`button-reply-${id}`}
              >
                <MessageCircle className="h-4 w-4" />
                <span>{replies}</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}