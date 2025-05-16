import { getQuizzes } from "@/app/(app)/actions";
import { ArticlePagination } from "@/components/article-filters";
import { IContent } from "@/types/content";
import { QuizCard } from "@/components/quiz-card";
import { QuizFilters } from "@/components/QuizFilters";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    level?: string;
    sort?: string;
    keyword?: string;
  }>;
}

export default async function QuizzesPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const data: any = await getQuizzes(query);

  return (
    <div className="container py-6 space-y-8">
      <QuizFilters
        currentFilters={{
          level: query.level,
          sort: query.sort,
          keyword: query.keyword,
        }}
      />
      <section className="space-y-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(data.contents as unknown as IContent[]).map((content) => (
            <QuizCard key={content._id} content={content} />
          ))}
        </div>
      </section>

      <ArticlePagination pagination={data.pagination} />
    </div>
  );
}
