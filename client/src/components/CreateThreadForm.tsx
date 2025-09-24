import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ImagePlus, X } from "lucide-react";
import { useState } from "react";

interface CreateThreadFormProps {
  onSubmit?: (thread: {
    title: string;
    content: string;
    category: string;
    images: File[];
  }) => void;
  onCancel?: () => void;
}

export default function CreateThreadForm({ onSubmit, onCancel }: CreateThreadFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !category) {
      console.log('Please fill in all required fields');
      return;
    }

    onSubmit?.({
      title: title.trim(),
      content: content.trim(),
      category,
      images,
    });

    console.log('Thread created:', { title, content, category, imageCount: images.length });
    
    // Reset form
    setTitle("");
    setContent("");
    setCategory("");
    setImages([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 4)); // Max 4 images
    console.log('Images added:', files.length);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle data-testid="text-create-thread-title">Создать новое обсуждение</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Заголовок *</Label>
            <Input
              id="title"
              placeholder="Какой у вас вопрос или тема?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-thread-title"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Категория *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger data-testid="select-thread-category">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="construction">Строительство</SelectItem>
                <SelectItem value="furniture">Мебель</SelectItem>
                <SelectItem value="services">Услуги</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">Описание *</Label>
            <Textarea
              id="content"
              placeholder="Опишите ваш вопрос или поделитесь опытом..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              data-testid="textarea-thread-content"
              required
            />
          </div>

          <div>
            <Label>Изображения (опционально)</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={images.length >= 4}
                  data-testid="button-upload-image"
                >
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Добавить изображения ({images.length}/4)
                </Button>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeImage(index)}
                        data-testid={`button-remove-image-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" data-testid="button-submit-thread">
              Создать обсуждение
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                data-testid="button-cancel-thread"
              >
                Отмена
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}