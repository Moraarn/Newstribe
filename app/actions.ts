"use server";

import AppServer, { PaginatedData } from "@/lib/server";
import { ContentType, IContent } from "@/types/content";

type ContentResponse = PaginatedData<{ contents: IContent[] }>;

export async function getFeaturedArticles(
  type: ContentType,
  isSponsored: boolean
): Promise<ContentResponse> {
  const response = await AppServer.get("/content", {
    query: {
      type,
      limit: 6,
      isSponsored,
    },
  });

  return response.data as ContentResponse;
}

export async function getArticles(query: any): Promise<ContentResponse> {
  const response = await AppServer.get("/content", {
    query: {
      ...query,
      type: query.type || ContentType.ARTICLE,
      limit: query.limit || 12,
    },
  });

  return response.data as ContentResponse;
}

// get article by id
export async function getArticleById(id: string): Promise<IContent> {
  const response = await AppServer.get(`/content/${id}`);

  return response.data as IContent;
}
