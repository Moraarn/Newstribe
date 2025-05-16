"use server";

import AppServer, { PaginatedData } from "@/lib/server";
import { ContentType, IContent } from "@/types/content";
import { IUser } from "@/types/user";

export interface IReward {
  _id: string;
  name: string;
  description: string;
  type: 'airtime' | 'voucher' | 'experience' | 'merchandise';
  pointsRequired: number;
  quantity: number;
  image: string;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RewardResponse {
  rewards: IReward[];
  total: number;
  page: number;
  limit: number;
}

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

interface RewardQueryParams {
  type?: string;
  page?: number;
  limit?: number;
}

export async function getRewards(query: RewardQueryParams = {}): Promise<RewardResponse> {
  const response = await AppServer.get("/rewards", {
    query: {
      ...query,
      limit: query.limit || 12,
    },
  });

  return response.data as RewardResponse;
}

export async function getRewardById(id: string): Promise<IReward> {
  const response = await AppServer.get(`/rewards/${id}`);
  return response.data as IReward;
}

// get current user points
export async function getCurrentUserPoints(): Promise<{ points: number }> {
  const response = await AppServer.get("/users/profile/points");
  return response.data as { points: number };
}

// redeem points for reward
export async function redeemReward(rewardId: string): Promise<{ 
  success: boolean; 
  message: string;
  remainingPoints: number;
}> {
  const response = await AppServer.post(`/rewards/${rewardId}/redeem`);
  return response.data as { 
    success: boolean; 
    message: string;
    remainingPoints: number;
  };
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
