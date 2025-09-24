import ThreadCard from "@/components/ThreadCard";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Clock, TrendingUp } from "lucide-react";

// todo: remove mock functionality
const mockThreads = [
  {
    id: "1",
    title: "Best way to install hardwood flooring in high moisture areas?",
    content: "I'm renovating my kitchen and want to install hardwood flooring, but I'm concerned about moisture from the sink area. What are the best practices for protecting the wood and ensuring longevity? Should I use engineered hardwood instead?",
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
    content: "Planning to build a custom 8-foot dining table for my family. Torn between walnut and oak. Looking for advice on durability, cost, and appearance for a modern farmhouse style. Also considering the joinery methods.",
    author: {
      name: "Mike Chen",
      role: "diy" as const,
    },
    category: "furniture" as const,
    upvotes: 24,
    replies: 15,
    timeAgo: "4 hours ago",
  },
  {
    id: "3",
    title: "Electrical permit requirements for kitchen renovation",
    content: "I'm doing a major kitchen renovation and need to add new outlets and move some existing ones. What are the typical permit requirements and do I need a licensed electrician for everything?",
    author: {
      name: "Tom Rodriguez",
      role: "homeowner" as const,
    },
    category: "services" as const,
    upvotes: 18,
    replies: 12,
    timeAgo: "6 hours ago",
  },
  {
    id: "4",
    title: "Load-bearing wall identification tips",
    content: "Working on an open concept renovation and need to identify load-bearing walls before demo. What are the key things to look for? When should I definitely call a structural engineer?",
    author: {
      name: "Lisa Park",
      role: "contractor" as const,
    },
    category: "construction" as const,
    upvotes: 35,
    replies: 22,
    timeAgo: "8 hours ago",
  },
  {
    id: "5",
    title: "Finish recommendations for outdoor furniture",
    content: "Building some outdoor benches and planters from cedar. What finishes do you recommend for weather protection while maintaining the natural wood look? Oil vs polyurethane vs marine varnish?",
    author: {
      name: "David Kim",
      role: "diy" as const,
    },
    category: "furniture" as const,
    upvotes: 16,
    replies: 9,
    timeAgo: "12 hours ago",
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trending" className="gap-2" data-testid="tab-trending">
            <Flame className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-2" data-testid="tab-recent">
            <Clock className="h-4 w-4" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="popular" className="gap-2" data-testid="tab-popular">
            <TrendingUp className="h-4 w-4" />
            Popular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4 mt-6">
          <div className="space-y-4">
            {mockThreads.map((thread) => (
              <ThreadCard key={thread.id} {...thread} />
            ))}
          </div>
          
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">You've reached the end of trending discussions</p>
                <Button variant="outline" data-testid="button-load-more">
                  Load More
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4 mt-6">
          <div className="space-y-4">
            {mockThreads.slice().reverse().map((thread) => (
              <ThreadCard key={thread.id} {...thread} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4 mt-6">
          <div className="space-y-4">
            {mockThreads.slice().sort((a, b) => b.upvotes - a.upvotes).map((thread) => (
              <ThreadCard key={thread.id} {...thread} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}