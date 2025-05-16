import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles } from "lucide-react";
import { getFeaturedArticles } from "./actions";
import { ArticleCard } from "@/components/article-card";
import { ContentType } from "@/types/content";

export default async function Home() {
  const [articles, sponsored] = await Promise.all([
    getFeaturedArticles(ContentType.ARTICLE, false),
    getFeaturedArticles(ContentType.SPONSORED, true),
  ]);

  return (
    <div className="container py-6 space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">For You</h2>
          <Button variant="ghost" size="sm" className="gap-1">
            <Sparkles className="h-4 w-4" />
            AI Recommendations
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(articles.contents) &&
            articles.contents.map((article: any) => (
              <ArticleCard key={article._id} article={article} />
            ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Sponsored</h2>
          <Button variant="ghost" size="sm" className="gap-1">
            <BookOpen className="h-4 w-4" />
            View All
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(sponsored.contents) &&
            sponsored.contents.map((article: any) => (
              <ArticleCard key={article._id} article={article} />
            ))}
        </div>
      </section>
    </div>
  );
}
