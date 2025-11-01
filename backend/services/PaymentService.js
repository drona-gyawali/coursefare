import { paymentRepo } from "../repository/PaymentRepository.js";
import Stripe from "stripe";
import { env } from "../core/conf.js";
import { PaymentSchema } from "./validator.js";
import { ZodError } from "zod";

class StripeService {
  static instance;

  constructor() {
    if (StripeService.instance) return StripeService.instance;
    this.stripe = new Stripe(env.getStripeSecretKey());
    StripeService.instance = this;
  }

  paymentIntent = async (amount, currency, userId, courseId) => {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        payment_method_types: ["card"],
        metadata: { userId, courseId },
      });
      const validated = PaymentSchema.parse({ userId, courseId, currency, amount });
      await paymentRepo.CreatePayment(
        validated.userId,
        validated.courseId,
        validated.currency,
        validated.amount,
        "card",
        paymentIntent.id.toString(),
        "pending",
      );
      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      if (error instanceof ZodError) return { success: false, error: error.errors };
      return { success: false, error };
    }
  };

  paymentWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) return res.status(400).json({ success: false, message: "No signature in headers" });

    let event;
    try {
      event = this.stripe.webhooks.constructEvent(req.body, sig, env.getStripeWebhookSecret());

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const updatedPayment = await paymentRepo.UpdatePayment(paymentIntent.id.toString());

        if (!updatedPayment) {
          return res.status(500).json({ success: false, message: "Unable to update payment" });
        }

        return res.status(200).json({ success: true, payment: updatedPayment });
      }

      return res.status(200).json({ success: true, message: "Event received" });
    } catch (error) {
      return res.status(400).json({ success: false, error });
    }
  };
}

export const stripeService = new StripeService();
