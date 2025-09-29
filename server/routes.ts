 import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";

if (!process.env.TESTING_STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: TESTING_STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.TESTING_STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Debug endpoint to check Stripe account info
  app.get("/api/stripe-diagnostics", async (req, res) => {
    try {
      const account = await stripe.accounts.retrieve();
      const diagnostics = {
        accountId: account.id,
        businessName: account.business_profile?.name || account.email,
        testMode: true, // We're using test keys
        keyUsed: "TESTING_STRIPE_SECRET_KEY"
      };
      console.log("Stripe Diagnostics:", diagnostics);
      res.json(diagnostics);
    } catch (error: any) {
      console.error("Diagnostics error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe payment route for one-time donations
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      
      // Debug: Log which key is being used
      console.log("Creating payment intent with key:", process.env.TESTING_STRIPE_SECRET_KEY ? "TESTING key" : "REGULAR key");
      console.log("Amount:", amount);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          type: "donation",
          app: "StudyBuddy",
          timestamp: new Date().toISOString()
        }
      });
      
      console.log("Payment intent created:", paymentIntent.id);
      console.log("Test mode:", paymentIntent.livemode === false);
      console.log("Direct link to payment:", `https://dashboard.stripe.com/test/payments/${paymentIntent.id}`);
      console.log("Client secret:", paymentIntent.client_secret?.substring(0, 20) + "...");
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        dashboardUrl: `https://dashboard.stripe.com/test/payments/${paymentIntent.id}`
      });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
