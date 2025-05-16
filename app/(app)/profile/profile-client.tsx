"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ChevronRight, Gift, HelpCircle, Star, Trophy, User } from "lucide-react";
import { IUser } from "@/types/user";
import { IUserReward } from "@/types/reward";
import { IUserBadge } from "@/types/badge";
import { updateUser, updateUserPreferences } from "../actions";
import { toast } from "sonner";
import { IUserProgress } from "@/types/progress";

interface ProfileClientProps {
  initialUser: IUser;
  initialPoints: number;
  initialProgress: IUserProgress;
  initialRewards: IUserReward[];
  initialBadges: IUserBadge[];
}

export function ProfileClient({
  initialUser,
  initialPoints,
  initialProgress,
  initialRewards,
  initialBadges,
}: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<IUser>(initialUser);
  const [points, setPoints] = useState<number>(initialPoints);
  const [progress, setProgress] = useState<IUserProgress>(initialProgress);
  const [rewards, setRewards] = useState<IUserReward[]>(initialRewards);
  const [badges, setBadges] = useState<IUserBadge[]>(initialBadges);

  const handleUpdateProfile = async (updates: Partial<IUser>) => {
    try {
      const response = await updateUser(updates);
      if (response?.success) {
        setUser(response.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleUpdatePreferences = async (updates: {
    categories: string[];
    preferredFormats: string[];
    readingLevel: string;
    notificationPreferences: string[];
    dailyDigest: boolean;
    weeklyDigest: boolean;
    language: string;
    timezone: string;
  }) => {
    try {
      const response = await updateUserPreferences(updates);
      if (response?.success) {
        setUser(response.user);
        toast.success(response.message);
      }
    } catch (error) {
      toast.error("Failed to update preferences");
    }
  };

  const userInitials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;
  const progressPercentage = progress?.progress || 0;

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex flex-col items-center">
                  <Avatar className="h-20 w-20 mb-2">
                    <AvatarImage
                      src={user?.avatar || "/placeholder.svg"}
                      alt={user?.username || "User"}
                    />
                    <AvatarFallback>{userInitials || "U"}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground">@{user?.username}</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <User className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Points</span>
                    <span className="font-medium">{points || 0}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{progress?.pointsEarned || 0} points earned</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary mb-1" />
                    <span className="text-lg font-bold">
                      {progress?.completed ? "Completed" : "In Progress"}
                    </span>
                    <span className="text-xs text-muted-foreground">Content Status</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                    <HelpCircle className="h-5 w-5 text-primary mb-1" />
                    <span className="text-lg font-bold">{progress?.quizScore || 0}</span>
                    <span className="text-xs text-muted-foreground">Quiz Score</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                    <Trophy className="h-5 w-5 text-primary mb-1" />
                    <span className="text-lg font-bold">{progress?.pointsEarned || 0}</span>
                    <span className="text-xs text-muted-foreground">Points Earned</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                    <Gift className="h-5 w-5 text-primary mb-1" />
                    <span className="text-lg font-bold">
                      {new Date(progress?.lastEngagedAt || "").toLocaleDateString()}
                    </span>
                    <span className="text-xs text-muted-foreground">Last Activity</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/rewards">
                  Redeem Points
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Your content preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Favorite Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {user?.preferences?.categories?.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    )) || (
                      <span className="text-sm text-muted-foreground">No categories selected</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Language Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {user?.preferences?.language || "Not set"} (Primary)
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <div className="p-2 rounded-full bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{progress?.content?.title || "No content"}</p>
                        <p className="text-sm text-muted-foreground">
                          Progress: {progress?.progress || 0}%
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Last engaged:{" "}
                            {new Date(progress?.lastEngagedAt || "").toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className="text-xs gap-1">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            {progress?.pointsEarned || 0} pts
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewards" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rewards History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rewards?.map((userReward, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                      >
                        <div className="p-2 rounded-full bg-primary/10">
                          <Gift className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{userReward.reward.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {userReward.reward.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {new Date(userReward.redeemedAt).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {userReward.reward.pointsRequired} pts
                            </Badge>
                            <Badge
                              variant={userReward.status === "Redeemed" ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {userReward.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )) || <p className="text-sm text-muted-foreground">No rewards history</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/rewards">Browse Available Rewards</Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="badges" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                  <CardDescription>Your achievements and milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {badges?.map((userBadge, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center p-4 bg-muted rounded-lg"
                      >
                        <div className="w-16 h-16 mb-2">
                          <Image
                            src={userBadge.badge.image}
                            alt={userBadge.badge.name}
                            width={64}
                            height={64}
                            className="rounded-full"
                          />
                        </div>
                        <h3 className="font-medium text-center">{userBadge.badge.name}</h3>
                        <p className="text-xs text-muted-foreground text-center mt-1">
                          {userBadge.badge.description}
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          {new Date(userBadge.earnedAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    )) || <p className="text-sm text-muted-foreground">No badges earned yet</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
