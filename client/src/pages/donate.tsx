import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StripeCheckout } from "@/components/StripeCheckout";

export function Donate() {
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const { toast } = useToast();

  const handleDonate = (amount: number | string) => {
    const donationAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (!donationAmount || donationAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount",
        variant: "destructive",
      });
      return;
    }

    setSelectedAmount(donationAmount);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setSelectedAmount(null);
    setCustomAmount("");
    // Success message is handled by StripeCheckout component
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
    setSelectedAmount(null);
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-8 h-8 text-secondary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Support StudyBuddy</h1>
          <p className="text-lg text-muted-foreground">
            Optional tips keep StudyBuddy free for students like you.
          </p>
        </div>

        <Card>
          <CardContent className="pt-8">
            {showCheckout && selectedAmount ? (
              <StripeCheckout
                amount={selectedAmount}
                onSuccess={handleCheckoutSuccess}
                onCancel={handleCheckoutCancel}
              />
            ) : (
              <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Button
                  onClick={() => handleDonate(3)}
                  className="bg-primary text-primary-foreground py-4 hover:opacity-90"
                  data-testid="button-donate-3"
                >
                  $3
                </Button>
                <Button
                  onClick={() => handleDonate(5)}
                  className="bg-primary text-primary-foreground py-4 hover:opacity-90"
                  data-testid="button-donate-5"
                >
                  $5
                </Button>
                <Button
                  onClick={() => handleDonate(10)}
                  className="bg-primary text-primary-foreground py-4 hover:opacity-90"
                  data-testid="button-donate-10"
                >
                  $10
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-amount">Custom Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="pl-8"
                    data-testid="input-custom-amount"
                  />
                </div>
              </div>

              <Button
                onClick={() => handleDonate(customAmount)}
                className="w-full bg-secondary text-secondary-foreground hover:opacity-90"
                data-testid="button-donate-custom"
              >
                Donate Now
              </Button>

              <Link href="/app">
                <Button 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="button-maybe-later"
                >
                  Maybe later
                </Button>
              </Link>
            </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-sm text-muted-foreground max-w-lg mx-auto">
          <p>
            Your contribution helps us maintain servers, improve features, and keep StudyBuddy 
            accessible to all Laurier students.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Donate;
