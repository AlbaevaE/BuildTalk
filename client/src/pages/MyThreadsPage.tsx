import { useState } from "react";
import ThreadCard from "@/components/ThreadCard";
import SearchBar from "@/components/SearchBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data for user's threads
const mockMyThreads = [
  {
    id: "my-1",
    title: "Лучшие инструменты для ремонта в 2024",
    content: "Делюсь своим опытом использования различных инструментов за последние 10 лет работы. Какие марки действительно стоят своих денег, а на чем можно сэкономить без потери качества.",
    author: {
      name: "Текущий пользователь",
      role: "contractor" as const,
    },
    category: "construction" as const,
    upvotes: 45,
    replies: 23,
    timeAgo: "3 дня назад",
  },
  {
    id: "my-2",
    title: "Помогите выбрать материал для столешницы",
    content: "Планирую обновить кухню. Рассматриваю варианты: кварц, гранит, искусственный камень. Что посоветуете по соотношению цена/качество/практичность?",
    author: {
      name: "Текущий пользователь",
      role: "homeowner" as const,
    },
    category: "furniture" as const,
    upvotes: 28,
    replies: 15,
    timeAgo: "1 неделя назад",
  },
  {
    id: "my-3",
    title: "Опыт установки теплого пола",
    content: "Недавно закончил установку водяного теплого пола в доме. Хочу поделиться опытом: что получилось хорошо, где были сложности, и что бы сделал по-другому.",
    author: {
      name: "Текущий пользователь",
      role: "contractor" as const,
    },
    category: "construction" as const,
    upvotes: 67,
    replies: 34,
    timeAgo: "2 недели назад",
  },
];

const mockDrafts = [
  {
    id: "draft-1",
    title: "Сравнение утеплителей для дома",
    content: "Исследую различные виды утеплителей...",
    author: {
      name: "Текущий пользователь",
      role: "contractor" as const,
    },
    category: "construction" as const,
    upvotes: 0,
    replies: 0,
    timeAgo: "Черновик",
  },
];

export default function MyThreadsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredThreads = mockMyThreads.filter(thread =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDrafts = mockDrafts.filter(draft =>
    draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Мои обсуждения</h1>
          <Button asChild className="gap-2">
            <a href="/create">
              <PlusCircle className="h-4 w-4" />
              Создать новое
            </a>
          </Button>
        </div>
        <SearchBar 
          placeholder="Поиск в моих обсуждениях..."
          onSearch={setSearchQuery}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="published" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="published" data-testid="tab-published">
            Опубликованные ({mockMyThreads.length})
          </TabsTrigger>
          <TabsTrigger value="drafts" data-testid="tab-drafts">
            Черновики ({mockDrafts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="space-y-4 mt-6">
          <div className="space-y-4">
            {filteredThreads.length > 0 ? (
              filteredThreads.map((thread) => (
                <ThreadCard key={thread.id} {...thread} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Опубликованные обсуждения не найдены</p>
                {searchQuery && (
                  <p className="text-sm mt-2">
                    Попробуйте изменить поисковый запрос
                  </p>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4 mt-6">
          <div className="space-y-4">
            {filteredDrafts.length > 0 ? (
              filteredDrafts.map((draft) => (
                <ThreadCard key={draft.id} {...draft} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Черновики не найдены</p>
                {searchQuery && (
                  <p className="text-sm mt-2">
                    Попробуйте изменить поисковый запрос
                  </p>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}