"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { IReward } from "@/app/(app)/rewards/action"
import { redeemReward } from "@/app/(app)/rewards/action"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useUser } from "@/contexts/user-context"

interface RedeemPointsDialogProps {
  reward: IReward
  disabled?: boolean
}

export function RedeemPointsDialog({ reward, disabled }: RedeemPointsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [redeemMethod, setRedeemMethod] = useState("web")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [ussdCode, setUssdCode] = useState("*123*456#")
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [isRedeemed, setIsRedeemed] = useState(false)
  const router = useRouter()
  const { user } = useUser()
  const userPoints = user?.points || 0

  const handleRedeem = async () => {
    try {
      setIsRedeeming(true)
      const result = await redeemReward(reward._id)
      
      if (result.success) {
        toast.success(result.message || "Reward redeemed successfully!")
        setIsOpen(false)
        router.refresh() // Refresh the page to update points
      } else {
        toast.error(result.message || "Failed to redeem reward")
      }
    } catch (error) {
      toast.error("An error occurred while redeeming the reward")
    } finally {
      setIsRedeeming(false)
    }
  }

  const canRedeem = userPoints >= reward.pointsRequired && reward.isActive && reward.quantity > 0

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="default" 
            disabled={disabled || !canRedeem}
          >
            {disabled ? "Not Enough Points" : 
             !reward.isActive || reward.quantity === 0 ? "Out of Stock" : "Redeem"}
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
              disabled={isRedeeming || disabled || !reward.isActive || reward.quantity === 0}
            >
              {isRedeeming ? "Redeeming..." : "Confirm Redeem"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
