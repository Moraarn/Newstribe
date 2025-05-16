'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { IReward } from '@/app/(app)/rewards/action';
import { redeemReward } from '@/app/(app)/rewards/action';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface RedeemPointsDialogProps {
  reward: IReward;
}

export function RedeemPointsDialog({ reward }: RedeemPointsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const router = useRouter();

  const handleRedeem = async () => {
    try {
      setIsRedeeming(true);
      const result = await redeemReward(reward._id);
      
      if (result.success) {
        toast.success(result.message || 'Reward redeemed successfully!');
        setIsOpen(false);
        router.refresh(); // Refresh the page to update points
      } else {
        toast.error(result.message || 'Failed to redeem reward');
      }
    } catch (error) {
      toast.error('An error occurred while redeeming the reward');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          disabled={!reward.isActive || reward.quantity === 0}
        >
          {reward.isActive && reward.quantity > 0 ? 'Redeem' : 'Out of Stock'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Redeem {reward.name}</DialogTitle>
          <DialogDescription>
            Are you sure you want to redeem this reward for {reward.pointsRequired} points?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Reward Details:</p>
            <p className="text-sm text-muted-foreground">{reward.description}</p>
            {reward.expiryDate && (
              <p className="text-xs text-muted-foreground">
                Expires: {new Date(reward.expiryDate).toLocaleDateString()}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Available Quantity: {reward.quantity}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isRedeeming}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRedeem}
            disabled={isRedeeming || !reward.isActive || reward.quantity === 0}
          >
            {isRedeeming ? 'Redeeming...' : 'Confirm Redeem'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 