'use client';

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";
import { RedeemPointsDialog } from "@/components/redeem-points-dialog";
import { IReward } from "@/app/(app)/rewards/action";
import { useUser } from "@/contexts/user-context";

interface RewardCardProps {
  reward: IReward;
}

export function RewardCard({ reward }: RewardCardProps) {
  const { user } = useUser();
  const userPoints = user?.points || 0;
  const canRedeem = userPoints >= reward.pointsRequired && reward.isActive && reward.quantity > 0;

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <Image
          src={reward.image || "/placeholder.svg"}
          alt={reward.name}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />
        {reward.quantity <= 10 && reward.quantity > 0 && (
          <Badge className="absolute top-2 left-2 bg-orange-500">
            Only {reward.quantity} left
          </Badge>
        )}
        {reward.type === 'airtime' && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            Airtime
          </Badge>
        )}
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="space-y-1">
          <Badge variant="outline" className="capitalize">{reward.type}</Badge>
          <h3 className="font-bold">{reward.name}</h3>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{reward.description}</p>
        {reward.expiryDate && (
          <p className="text-xs text-muted-foreground mt-2">
            Expires: {new Date(reward.expiryDate).toLocaleDateString()}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="font-bold">{reward.pointsRequired.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">points</span>
        </div>
        <RedeemPointsDialog reward={reward} disabled={!canRedeem} />
      </CardFooter>
    </Card>
  );
} 