import ThreadCard from '../ThreadCard';

export default function ThreadCardExample() {
  const sampleThreads = [
    {
      id: "1",
      title: "Лучший способ укладки паркета во влажных помещениях?",
      content: "Делаю ремонт на кухне и хочу уложить паркет, но беспокоюсь о влажности от раковины. Какие есть лучшие практики защиты дерева и обеспечения долговечности?",
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
      content: "Планирую построить обеденный стол длиной 2,4 метра для семьи. Выбираю между орехом и дубом. Нужен совет по долговечности, стоимости и внешнему виду в современном фермерском стиле.",
      author: {
        name: "Майк Чен",
        role: "diy" as const,
      },
      category: "furniture" as const,
      upvotes: 24,
      replies: 15,
      timeAgo: "4 часа назад",
    }
  ];

  return (
    <div className="space-y-4 p-4">
      {sampleThreads.map(thread => (
        <ThreadCard key={thread.id} {...thread} />
      ))}
    </div>
  );
}