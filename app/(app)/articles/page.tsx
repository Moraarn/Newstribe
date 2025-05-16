import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { getArticles } from "@/app/(app)/actions";
import { ArticleCard } from "@/components/article-card";
import { ArticleFilters, ArticlePagination } from "@/components/article-filters";
import { ContentType, IContent } from "@/types/content";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    type?: ContentType;
    category?: string;
    sort?: string;
    keyword?: string;
  }>;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const data: any = await getArticles(query);

  return (
    <div className="container py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" />
          Featured
        </Button>
      </div>

      <ArticleFilters
        currentFilters={{
          type: query.type,
          category: query.category,
          sort: query.sort,
          keyword: query.keyword,
        }}
      />

      <section className="space-y-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(data.contents as unknown as IContent[]).map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      </section>

      <ArticlePagination pagination={data.pagination} />
    </div>
  );
}
