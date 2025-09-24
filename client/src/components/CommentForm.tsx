import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";

// Form schema for comment - only content is needed (threadId via props, authorId from auth)
const commentFormSchema = z.object({
  content: z.string().min(1, "Комментарий не может быть пустым").max(2000, "Комментарий слишком длинный"),
});

type CommentFormData = z.infer<typeof commentFormSchema>;

interface CommentFormProps {
  threadId: string;
  onSubmit?: (comment: CommentFormData) => void;
  onCancel?: () => void;
  placeholder?: string;
  compact?: boolean;
}


export default function CommentForm({ 
  threadId, 
  onSubmit, 
  onCancel, 
  placeholder = "Напишите комментарий...",
  compact = false
}: CommentFormProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const { data: user, isLoading } = useAuth();

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = (data: CommentFormData) => {
    onSubmit?.(data);
    console.log('Comment created:', { ...data, threadId });
    
    // Reset form
    form.reset();
    if (compact) {
      setIsExpanded(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    if (compact) {
      setIsExpanded(false);
    }
    onCancel?.();
  };

  // Show loading or auth required states
  if (isLoading) {
    return (
      <Card data-testid={`comment-form-loading-${threadId}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span>Загрузка...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card data-testid={`comment-form-auth-required-${threadId}`}>
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>Войдите, чтобы оставить комментарий</span>
            </div>
            <Button asChild variant="outline" size="sm" data-testid={`button-login-comment-${threadId}`}>
              <a href="/auth/login">Войти</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact && !isExpanded) {
    return (
      <Card className="hover-elevate cursor-pointer" onClick={() => setIsExpanded(true)} data-testid={`comment-form-compact-${threadId}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span>{placeholder}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid={`comment-form-${threadId}`}>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Комментарий *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={placeholder}
                      rows={3}
                      data-testid={`textarea-comment-content-${threadId}`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button type="submit" data-testid={`button-submit-comment-${threadId}`}>
                Отправить
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                data-testid={`button-cancel-comment-${threadId}`}
              >
                {compact && (
                  <X className="h-4 w-4 mr-2" />
                )}
                Отмена
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}