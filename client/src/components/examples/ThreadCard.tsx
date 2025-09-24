import ThreadCard from '../ThreadCard';

export default function ThreadCardExample() {
  const sampleThreads = [
    {
      id: "1",
      title: "Best way to install hardwood flooring in high moisture areas?",
      content: "I'm renovating my kitchen and want to install hardwood flooring, but I'm concerned about moisture from the sink area. What are the best practices for protecting the wood and ensuring longevity?",
      author: {
        name: "Sarah Johnson",
        role: "homeowner" as const,
      },
      category: "construction" as const,
      upvotes: 12,
      replies: 8,
      timeAgo: "2 hours ago",
    },
    {
      id: "2", 
      title: "Custom dining table build - walnut vs oak?",
      content: "Planning to build a custom 8-foot dining table for my family. Torn between walnut and oak. Looking for advice on durability, cost, and appearance for a modern farmhouse style.",
      author: {
        name: "Mike Chen",
        role: "diy" as const,
      },
      category: "furniture" as const,
      upvotes: 24,
      replies: 15,
      timeAgo: "4 hours ago",
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