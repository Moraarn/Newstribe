'use client';

import { Star } from "lucide-react";
import { useUser } from "@/contexts/user-context";

export function RewardsHeader() {
  const { user } = useUser();
  const points = user?.points || 0;
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
      <div>
        <h1 className="text-3xl font-bold">Rewards Marketplace</h1>
        <p className="text-muted-foreground mt-1">Redeem your points for exciting rewards</p>
      </div>
      <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
        <div className="flex items-center gap-1">
          <Star className="h-5 w-5 fill-primary text-primary" />
          <span className="font-bold text-lg">{points.toLocaleString()}</span>
        </div>
        <span className="text-muted-foreground">Available Points</span>
      </div>
    </div>
  );
} 