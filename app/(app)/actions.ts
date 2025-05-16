"use server";

import AppServer, { PaginatedData } from "@/lib/server";
import { IUserBadge } from "@/types/badge";
import { ContentType, IContent } from "@/types/content";
import { IUserProgress } from "@/types/progress";
import { IReward, IUserReward } from "@/types/reward";
import { IUser } from "@/types/user";

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

export async function getQuizzes(query: any): Promise<ContentResponse> {
  const response = await AppServer.get("/content", {
    query: {
      ...query,
      type: query.type || ContentType.QUIZ,
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

// get current user
export async function getCurrentUser(): Promise<{ success: boolean; user: IUser }> {
  const response = await AppServer.get("/users/profile/me");

  return response.data as { success: boolean; user: IUser };
}

// update user
export async function updateUser(
  updates: Partial<IUser>
): Promise<{ success: boolean; user: IUser }> {
  const response = await AppServer.patch("/users/profile/me", updates);

  return response.data as { success: boolean; user: IUser };
}

// update user preferences
export async function updateUserPreferences(updates: {
  categories: string[];
  preferredFormats: string[];
  readingLevel: string;
  notificationPreferences: string[];
  dailyDigest: boolean;
  weeklyDigest: boolean;
  language: string;
  timezone: string;
}): Promise<{ success: boolean; user: IUser; message: string }> {
  const response = await AppServer.post("/users/preferences", updates);

  return response.data as { success: boolean; user: IUser; message: string };
}

// get user points
export async function getUserPoints(): Promise<{ success: boolean; points: number }> {
  const response = await AppServer.get("/users/points");

  return response.data as { success: boolean; points: number };
}

// get user rewards
export async function getUserRewards(): Promise<{ success: boolean; rewards: IUserReward[] }> {
  const response = await AppServer.get("/users/rewards");

  return response.data as { success: boolean; rewards: IUserReward[] };
}

// get progress
export async function getProgress(): Promise<{ success: boolean; progress: IUserProgress }> {
  const response = await AppServer.get("/users/progress");

  return response.data as { success: boolean; progress: IUserProgress };
}

// get recommended content
export async function getRecommendedContent(): Promise<{ success: boolean; content: IContent[] }> {
  const response = await AppServer.get("/users/recommendations");

  return response.data as { success: boolean; content: IContent[] };
}

// get user badges
export async function getUserBadges(): Promise<{ success: boolean; badges: IUserBadge[] }> {
  const response = await AppServer.get("/users/badges");

  return response.data as { success: boolean; badges: IUserBadge[] };
}
