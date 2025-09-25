import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, ArrowUp, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import type { Thread } from "@shared/schema";

const categoryNames = {
  construction: "Строительство",
  furniture: "Мебель", 
  services: "Услуги"
};

const categoryDescriptions = {
  construction: "Обсуждения о строительных работах, материалах и технологиях",
  furniture: "Всё о мебели: выбор, изготовление, дизайн и уход",
  services: "Поиск и обсуждение различных услуг в сфере строительства и ремонта"
};

export default function CategoryPage() {
  const { category: urlCategory } = useParams<{ category: string }>();
  
  // Extract category from URL parameter or query string (for legacy URLs like /category?name=construction)
  let category = urlCategory;
  if (urlCategory === 'category') {
    const urlSearchParams = new URLSearchParams(window.location.search);
    category = urlSearchParams.get('name') || '';
  }
  
  // Exclude special routes that aren't categories
  const specialRoutes = ['replies', 'my-threads', 'create', 'thread'];
  if (!category || specialRoutes.includes(category)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Страница не найдена</h1>
          <p className="text-muted-foreground">Запрашиваемая страница не существует.</p>
        </div>
      </div>
    );
  }
  
  if (!category || !categoryNames[category as keyof typeof categoryNames]) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Категория не найдена</h1>
          <p className="text-muted-foreground">Запрашиваемая категория не существует.</p>
        </div>
      </div>
    );
  }

  const { data: threads, isLoading, error } = useQuery<Thread[]>({
    queryKey: ['/api/threads', { category }],
    queryFn: async () => {
      const response = await fetch(`/api/threads?category=${category}`);
      if (!response.ok) {
        throw new Error('Failed to fetch threads');
      }
      return response.json();
    },
  });

  const categoryDisplayName = categoryNames[category as keyof typeof categoryNames];
  const categoryDescription = categoryDescriptions[category as keyof typeof categoryDescriptions];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ошибка загрузки</h1>
          <p className="text-muted-foreground">Не удалось загрузить обсуждения категории.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="category-title">
            {categoryDisplayName}
          </h1>
          <p className="text-muted-foreground" data-testid="category-description">
            {categoryDescription}
          </p>
        </div>

        <Separator />

        {/* Threads */}
        <div className="space-y-4">
          {!threads || threads.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-medium mb-2">Пока нет обсуждений</h3>
                <p className="text-muted-foreground mb-4">
                  Станьте первым, кто создаст обсуждение в этой категории!
                </p>
                <Button asChild data-testid="button-create-first-thread">
                  <a href="/create">Создать обсуждение</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            threads.map((thread) => (
              <Card key={thread.id} className="hover-elevate" data-testid={`thread-card-${thread.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-2 leading-tight" data-testid={`thread-title-${thread.id}`}>
                        <a 
                          href={`/thread/${thread.id}`}
                          className="text-foreground hover:text-primary transition-colors"
                        >
                          {thread.title}
                        </a>
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1" data-testid={`thread-author-${thread.id}`}>
                          <User className="w-4 h-4" />
                          <span>Автор: {thread.authorId.slice(0, 8)}...</span>
                        </div>
                        <div className="flex items-center gap-1" data-testid={`thread-time-${thread.id}`}>
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatDistanceToNow(new Date(thread.createdAt), { 
                              addSuffix: true, 
                              locale: ru 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 text-sm" data-testid={`thread-upvotes-${thread.id}`}>
                        <ArrowUp className="w-4 h-4" />
                        <span>{thread.upvotes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm" data-testid={`thread-replies-${thread.id}`}>
                        <MessageCircle className="w-4 h-4" />
                        <span>0</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {thread.content && (
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground line-clamp-3" data-testid={`thread-content-${thread.id}`}>
                      {thread.content}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}