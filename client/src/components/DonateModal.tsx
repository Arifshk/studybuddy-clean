import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/use-toast";
import { StripeCheckout } from "./StripeCheckout";

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonateModal({ isOpen, onClose }: DonateModalProps) {
  const { snoozeDonateModal, dismissDonateModal } = useStore();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleSnooze = () => {
    snoozeDonateModal();
    toast({
      title: "Reminder set",
      description: "We'll remind you again in 7 days",
    });
    onClose();
  };

  const handleDismiss = () => {
    dismissDonateModal();
    onClose();
  };

  const handleDonate = (amount: number) => {
    setSelectedAmount(amount);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setSelectedAmount(null);
    onClose();
    // Success message is handled by StripeCheckout component
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
    setSelectedAmount(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-donate">
        <DialogHeader>
          <DialogTitle>Support StudyBuddy</DialogTitle>
          <DialogDescription>
            Consider supporting us to keep the platform free for all students!
          </DialogDescription>
        </DialogHeader>
        {showCheckout && selectedAmount ? (
          <StripeCheckout
            amount={selectedAmount}
            onSuccess={handleCheckoutSuccess}
            onCancel={handleCheckoutCancel}
          />
        ) : (
          <div className="text-center space-y-6">
          <div className="mx-auto w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-secondary-foreground" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Enjoying StudyBuddy?
            </h3>
            <p className="text-muted-foreground">
              Consider supporting us to keep the platform free for all students!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={() => handleDonate(3)}
              className="bg-primary text-primary-foreground hover:opacity-90"
              data-testid="button-donate-3"
            >
              $3
            </Button>
            <Button
              onClick={() => handleDonate(5)}
              className="bg-primary text-primary-foreground hover:opacity-90"
              data-testid="button-donate-5"
            >
              $5
            </Button>
            <Button
              onClick={() => handleDonate(10)}
              className="bg-primary text-primary-foreground hover:opacity-90"
              data-testid="button-donate-10"
            >
              $10
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSnooze}
              className="flex-1"
              data-testid="button-donate-snooze"
            >
              Remind me in 7 days
            </Button>
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="flex-1 text-muted-foreground hover:text-foreground"
              data-testid="button-donate-dismiss"
            >
              Don't show again
            </Button>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
