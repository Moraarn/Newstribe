import { getArticleById } from "@/app/actions";
import { ArticleView } from "@/components/article-view";
import { ContentType } from "@/types/content";
import { notFound } from "next/navigation";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data: any = await getArticleById(id);

  console.log(data);

  // Handle different content types
  switch (data.content.type) {
    case ContentType.ARTICLE:
      return <ArticleView article={data.content} />;
    case ContentType.QUIZ:
      // TODO: Implement quiz view
      return <div>Quiz view coming soon</div>;
    case ContentType.SPONSORED:
      // TODO: Implement sponsored content view
      return <div>Sponsored content view coming soon</div>;
    case ContentType.MINI_GAME:
      // TODO: Implement mini game view
      return <div>Mini game view coming soon</div>;
    default:
      return notFound();
  }
}
