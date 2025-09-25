import { useLocation } from "wouter";
import CreateThreadForm from "@/components/CreateThreadForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function CreateThread() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (thread: {
    title: string;
    content: string;
    category: string;
    images: File[];
  }) => {
    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: thread.title,
          content: thread.content,
          category: thread.category,
        }),
      });

      if (response.ok) {
        toast({
          title: "Обсуждение создано!",
          description: "Ваше обсуждение успешно опубликовано.",
        });
        setLocation('/');
      } else {
        throw new Error('Ошибка при создании обсуждения');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать обсуждение. Попробуйте ещё раз.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setLocation('/');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/')}
          className="gap-2"
          data-testid="button-back-home"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к обсуждениям
        </Button>
      </div>
      
      <CreateThreadForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}