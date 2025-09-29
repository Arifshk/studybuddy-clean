import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Use testing public key if available, fallback to regular public key
const stripePublicKey = import.meta.env.TESTING_VITE_STRIPE_PUBLIC_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error('Missing required Stripe public key');
}

const stripePromise = loadStripe(stripePublicKey);

interface CheckoutFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ amount, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!stripe || !elements) {
      console.log("Stripe not ready");
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donate?success=true`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("Payment error:", error);
        toast({
          title: "Payment Failed",
          description: error.message || "There was an error processing your payment.",
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast({
          title: "Thank you!",
          description: `Your $${amount} donation helps keep StudyBuddy free!`,
        });
        onSuccess();
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={!stripe || !elements || isLoading}
          className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
        >
          {isLoading ? "Processing..." : `Donate $${amount}`}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface StripeCheckoutProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StripeCheckout({ amount, onSuccess, onCancel }: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create PaymentIntent when component mounts
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error("No client secret received");
        }
      } catch (err) {
        console.error("Payment setup error:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        toast({
          title: "Payment Setup Failed",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <p className="mt-2 text-sm text-muted-foreground">Setting up payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center space-y-4">
        <p className="text-sm text-destructive">Payment setup failed: {error}</p>
        <Button onClick={onCancel} variant="outline">Go Back</Button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-4 text-center space-y-4">
        <p className="text-sm text-muted-foreground">Unable to setup payment</p>
        <Button onClick={onCancel} variant="outline">Go Back</Button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm amount={amount} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}