import { useState } from "react";
import ThreadCard from "@/components/ThreadCard";
import SearchBar from "@/components/SearchBar";

// Mock data for replies/comments
const mockReplies = [
  {
    id: "reply-1",
    title: "Ответ на: Лучшие инструменты для ремонта",
    content: "Полностью согласен с автором! Я использую Makita уже 5 лет и очень доволен качеством. Единственный минус - высокая цена, но она оправдывается долговечностью.",
    author: {
      name: "Текущий пользователь",
      role: "contractor" as const,
    },
    category: "construction" as const,
    upvotes: 12,
    replies: 3,
    timeAgo: "2 часа назад",
  },
  {
    id: "reply-2", 
    title: "Ответ на: Выбор материала для столешницы",
    content: "У меня дома кварцевая столешница уже 3 года. Выглядит как новая, легко чистится, не впитывает пятна. Рекомендую!",
    author: {
      name: "Текущий пользователь",
      role: "homeowner" as const,
    },
    category: "furniture" as const,
    upvotes: 8,
    replies: 1,
    timeAgo: "6 часов назад",
  },
  {
    id: "reply-3",
    title: "Ответ на: Поиск надежного электрика",
    content: "Могу порекомендовать своего мастера. Работает честно, цены адекватные, качество отличное. Могу дать контакты в личку.",
    author: {
      name: "Текущий пользователь", 
      role: "homeowner" as const,
    },
    category: "services" as const,
    upvotes: 15,
    replies: 5,
    timeAgo: "1 день назад",
  },
];

export default function RepliesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReplies = mockReplies.filter(reply =>
    reply.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reply.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Мои ответы</h1>
        <SearchBar 
          placeholder="Поиск в моих ответах..."
          onSearch={setSearchQuery}
        />
      </div>

      {/* Replies List */}
      <div className="space-y-4">
        {filteredReplies.length > 0 ? (
          filteredReplies.map((reply) => (
            <ThreadCard key={reply.id} {...reply} />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Ответы не найдены</p>
            {searchQuery && (
              <p className="text-sm mt-2">
                Попробуйте изменить поисковый запрос
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}