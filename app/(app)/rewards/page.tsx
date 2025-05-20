import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRewards } from "./action";
import { RewardCard } from "@/components/reward-card";
import { RewardsHeader } from "./rewards-header";

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
      <RewardsHeader />

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
