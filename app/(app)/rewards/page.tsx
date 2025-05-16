import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";
import { getCurrentUserPoints, getRewards } from "./action";
import { RewardCard } from "@/components/reward-card";

async function RewardsHeader() {
  const pointsData = await getCurrentUserPoints();
  const points = pointsData?.points || 0;
  
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

async function RewardsGrid({ type = "all" }: { type?: string }) {
  const query = type === "all" ? {} : { type };
  const { rewards } = await getRewards(query);

  if (!rewards || rewards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No rewards available in this category</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rewards.map((reward) => (
        <RewardCard key={reward._id} reward={reward} />
      ))}
    </div>
  );
}

export default function RewardsPage() {
  return (
    <div className="container py-6 space-y-6">
      <Suspense fallback={<RewardsHeaderSkeleton />}>
        <RewardsHeader />
      </Suspense>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 md:w-[600px]">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="airtime">Airtime</TabsTrigger>
          <TabsTrigger value="voucher">Vouchers</TabsTrigger>
          <TabsTrigger value="experience">Experiences</TabsTrigger>
          <TabsTrigger value="merchandise">Merchandise</TabsTrigger>
        </TabsList>

        <Suspense 
          fallback={
            <div className="mt-6">
              <RewardsGridSkeleton />
            </div>
          }
        >
          <TabsContent value="all" className="mt-6">
            <RewardsGrid />
          </TabsContent>

          <TabsContent value="airtime" className="mt-6">
            <RewardsGrid type="airtime" />
          </TabsContent>

          <TabsContent value="voucher" className="mt-6">
            <RewardsGrid type="voucher" />
          </TabsContent>

          <TabsContent value="experience" className="mt-6">
            <RewardsGrid type="experience" />
          </TabsContent>

          <TabsContent value="merchandise" className="mt-6">
            <RewardsGrid type="merchandise" />
          </TabsContent>
        </Suspense>
      </Tabs>
    </div>
  );
}

function RewardsHeaderSkeleton() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
      <div>
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-4 w-96 bg-muted rounded mt-2 animate-pulse" />
      </div>
      <div className="h-12 w-48 bg-muted rounded animate-pulse" />
    </div>
  );
}

function RewardsGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden">
          <div className="h-48 bg-muted animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-8 w-full bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
