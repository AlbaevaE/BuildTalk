import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertCommentSchema } from "@shared/schema";
import { z } from "zod";

// Extend insert schema to exclude threadId (it's provided via props)
const commentFormSchema = insertCommentSchema.omit({ threadId: true });

type CommentFormData = z.infer<typeof commentFormSchema>;

interface CommentFormProps {
  threadId: string;
  onSubmit?: (comment: CommentFormData) => void;
  onCancel?: () => void;
  placeholder?: string;
  compact?: boolean;
}

const roleLabels = {
  contractor: 'Подрядчик',
  homeowner: 'Домовладелец',
  supplier: 'Поставщик',
  architect: 'Архитектор',
  diy: 'Энтузиаст',
};

export default function CommentForm({ 
  threadId, 
  onSubmit, 
  onCancel, 
  placeholder = "Напишите комментарий...",
  compact = false
}: CommentFormProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
      authorId: "",
      authorName: "",
      authorRole: "homeowner",
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="authorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID пользователя *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ваш ID"
                        data-testid={`input-comment-author-id-${threadId}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ваше имя *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Введите ваше имя"
                        data-testid={`input-comment-author-${threadId}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authorRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ваша роль *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid={`select-comment-role-${threadId}`}>
                          <SelectValue placeholder="Выберите роль" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="contractor">{roleLabels.contractor}</SelectItem>
                        <SelectItem value="homeowner">{roleLabels.homeowner}</SelectItem>
                        <SelectItem value="supplier">{roleLabels.supplier}</SelectItem>
                        <SelectItem value="architect">{roleLabels.architect}</SelectItem>
                        <SelectItem value="diy">{roleLabels.diy}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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