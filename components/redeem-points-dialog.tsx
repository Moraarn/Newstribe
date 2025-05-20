"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IReward } from "@/app/(app)/rewards/action";
import { redeemReward } from "@/app/(app)/rewards/action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/contexts/user-context";
import { Gift, Flower2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RedeemPointsDialogProps {
  reward: IReward;
}

export function RedeemPointsDialog({ reward }: RedeemPointsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const { user, update } = useUser();
  const userPoints = user?.points || 0;

  const handleRedeem = async () => {
    try {
      setIsRedeeming(true);
      const result = await redeemReward(reward._id);
      
      if (result.success) {
        // Update user points in context
        if (user) {
          update({ points: userPoints - reward.pointsRequired });
        }
        setShowSuccess(true);
        // Close dialog after 3 seconds
        setTimeout(() => {
          setIsOpen(false);
          setShowSuccess(false);
          router.refresh();
        }, 3000);
      } else {
        toast.error(result.message || "Failed to redeem reward");
      }
    } catch (error) {
      toast.error("An error occurred while redeeming the reward");
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          disabled={!reward.isActive || reward.quantity === 0 || userPoints < reward.pointsRequired}
        >
          {!reward.isActive || reward.quantity === 0 
            ? 'Out of Stock' 
            : userPoints < reward.pointsRequired 
              ? 'Not Enough Points' 
              : 'Redeem'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-6 flex flex-col items-center text-center space-y-4"
            >
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute -top-4 -left-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Flower2 className="h-6 w-6 text-pink-500" />
                  </motion.div>
                </div>
                <div className="absolute -top-4 -right-4">
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Flower2 className="h-6 w-6 text-purple-500" />
                  </motion.div>
                </div>
                <div className="bg-primary/10 rounded-full p-6">
                  <Gift className="h-12 w-12 text-primary" />
                </div>
                <div className="absolute -bottom-4 -left-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Flower2 className="h-6 w-6 text-yellow-500" />
                  </motion.div>
                </div>
                <div className="absolute -bottom-4 -right-4">
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Flower2 className="h-6 w-6 text-blue-500" />
                  </motion.div>
                </div>
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Congratulations!
                </h3>
                <p className="text-muted-foreground">
                  You have successfully redeemed {reward.name}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>Your reward will be delivered shortly</span>
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm">Your Points:</p>
                    <p className="font-medium">{userPoints.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Required Points:</p>
                    <p className="font-medium">{reward.pointsRequired.toLocaleString()}</p>
                  </div>
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
                  disabled={isRedeeming || !reward.isActive || reward.quantity === 0 || userPoints < reward.pointsRequired}
                >
                  {isRedeeming ? 'Redeeming...' : 'Confirm Redeem'}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
