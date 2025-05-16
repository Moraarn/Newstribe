import { IUserProgress } from "@/types/progress";
import { getCurrentUser, getProgress, getUserPoints, getUserRewards, getUserBadges } from "../actions";
import { ProfileClient } from "./profile-client";
import { IUserReward } from "@/types/reward";
import { IUserBadge } from "@/types/badge";

export default async function ProfilePage() {
  // Fetch initial data
  const [userResponse, pointsResponse, progressResponse, rewardsResponse, badgesResponse] = await Promise.all([
    getCurrentUser(),
    getUserPoints(),
    getProgress(),
    getUserRewards(),
    getUserBadges(),
  ]);

  return (
    <ProfileClient
      initialUser={userResponse.user}
      initialPoints={pointsResponse.points}
      initialProgress={progressResponse.progress as unknown as IUserProgress}
      initialRewards={rewardsResponse.rewards as unknown as IUserReward[]}
      initialBadges={badgesResponse.badges as unknown as IUserBadge[]}
    />
  );
}
