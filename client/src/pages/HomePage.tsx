import ThreadCard from "@/components/ThreadCard";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Clock } from "lucide-react";

// todo: remove mock functionality
const mockThreads = [
  {
    id: "1",
    title: "Лучший способ укладки паркета во влажных помещениях?",
    content: "Делаю ремонт на кухне и хочу уложить паркет, но беспокоюсь о влажности от раковины. Какие есть лучшие практики защиты дерева и обеспечения долговечности? Стоит ли использовать инженерный паркет?",
    author: {
      name: "Сара Джонсон",
      role: "homeowner" as const,
    },
    category: "construction" as const,
    upvotes: 12,
    replies: 8,
    timeAgo: "2 часа назад",
  },
  {
    id: "2",
    title: "Изготовление стола на заказ - орех или дуб?",
    content: "Планирую построить обеденный стол длиной 2,4 метра для семьи. Выбираю между орехом и дубом. Нужен совет по долговечности, стоимости и внешнему виду в современном фермерском стиле. Также рассматриваю способы соединения.",
    author: {
      name: "Майк Чен",
      role: "diy" as const,
    },
    category: "furniture" as const,
    upvotes: 24,
    replies: 15,
    timeAgo: "4 часа назад",
  },
  {
    id: "3",
    title: "Требования к разрешениям на электрику при ремонте кухни",
    content: "Делаю масштабный ремонт кухни, нужно добавить новые розетки и перенести существующие. Какие обычно требуются разрешения и нужен ли лицензированный электрик для всех работ?",
    author: {
      name: "Том Родригес",
      role: "homeowner" as const,
    },
    category: "services" as const,
    upvotes: 18,
    replies: 12,
    timeAgo: "6 часов назад",
  },
  {
    id: "4",
    title: "Советы по определению несущих стен",
    content: "Работаю над перепланировкой в открытую планировку и нужно определить несущие стены перед демонтажем. На что обращать внимание? Когда точно нужно вызывать инженера-конструктора?",
    author: {
      name: "Лиза Парк",
      role: "contractor" as const,
    },
    category: "construction" as const,
    upvotes: 35,
    replies: 22,
    timeAgo: "8 часов назад",
  },
  {
    id: "5",
    title: "Рекомендации по покрытию для уличной мебели",
    content: "Делаю садовые скамейки и кашпо из кедра. Какое покрытие рекомендуете для защиты от погоды, сохраняя натуральный вид дерева? Масло, полиуретан или морской лак?",
    author: {
      name: "Дэвид Ким",
      role: "diy" as const,
    },
    category: "furniture" as const,
    upvotes: 16,
    replies: 9,
    timeAgo: "12 часов назад",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Search Bar */}
      <div className="flex justify-center">
        <SearchBar />
      </div>

      {/* Feed Tabs */}
      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trending" className="gap-2" data-testid="tab-trending">
            <Flame className="h-4 w-4" />
            Популярные
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-2" data-testid="tab-recent">
            <Clock className="h-4 w-4" />
            Недавние
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4 mt-6">
          <div className="space-y-4">
            {mockThreads
              .slice()
              .sort((a, b) => (b.upvotes + b.replies) - (a.upvotes + a.replies))
              .map((thread) => (
                <ThreadCard key={thread.id} {...thread} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4 mt-6">
          <div className="space-y-4">
            {mockThreads.map((thread) => (
              <ThreadCard key={thread.id} {...thread} />
            ))}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}