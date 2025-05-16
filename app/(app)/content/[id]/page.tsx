import { getArticleById } from "@/app/(app)/actions";
import { ArticleView } from "@/components/article-view";
import QuizView from "@/components/quiz-view";
import { ContentType } from "@/types/content";
import { notFound } from "next/navigation";

export default async function ContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data: any = await getArticleById(id);

  console.log(data);

  // Handle different content types
  switch (data.content.type) {
    case ContentType.ARTICLE:
      return <ArticleView article={data.content} />;
    case ContentType.QUIZ:
      return <QuizView quizData={data.content} />;
    case ContentType.SPONSORED:
      return <ArticleView article={data.content} />;
    case ContentType.MINI_GAME:
      // TODO: Implement mini game view
      return <div>Mini game view coming soon</div>;
    default:
      return notFound();
  }
}
