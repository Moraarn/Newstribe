"use server";

import AppServer from "@/lib/server";
import { PointsSource } from "@/types/points";
import { IUserProgress } from "@/types/progress";

// award user badge
export async function awardUserBadge(badgeId: string) {
  const response = await AppServer.post(`/users/badges`, {
    badgeId,
  });
  return response.data;
}

// update user progress
export async function updateUserProgress(progress: Partial<IUserProgress>) {
  const response = await AppServer.patch(`/users/progress`, {
    progress,
  });
  return response.data;
}

// redeem reward
export async function redeemReward(rewardId: string) {
  const response = await AppServer.post(`/users/rewards/redeem`, {
    rewardId,
  });
  return response.data;
}

// get comments
export async function getComments(contentId: string, query: any) {
  const response = await AppServer.get(`/content/comments/${contentId}`, {
    params: [contentId],
    query,
  });
  return response.data;
}

// create comment
export async function createComment(contentId: string, text: string) {
  const response = await AppServer.post(`/content/comments/${contentId}`, {
    text,
  });
  return response.data;
}

// like content
export async function likeContent(contentId: string) {
  const response = await AppServer.post(`/content/likes/${contentId}`);
  return response.data;
}

// share content
export async function shareContent(contentId: string) {
  const response = await AppServer.post(`/content/shares/${contentId}`);
  return response.data;
}

// rate content
export async function rateContent(contentId: string, rating: number) {
  const response = await AppServer.post(`/content/ratings/${contentId}`, {
    rating,
  });
  return response.data;
}

// generate quiz
export async function generateQuiz(contentId: string, difficulty: string) {
  const response = await AppServer.get(`/quizzes/generate/${contentId}?difficulty=${difficulty}`);
  return response.data;
}


// award points
export async function awardPoints(
  points: number,
  source: PointsSource,
  description: string
) {
  const response = await AppServer.post(`/users/points/award`, {
    source,
    points,
    description,
  });
  return response.data;
}
