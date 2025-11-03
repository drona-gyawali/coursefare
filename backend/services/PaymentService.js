import { paymentRepo } from "../repository/PaymentRepository.js";
import Stripe from "stripe";
import { env } from "../core/conf.js";
import { PaymentSchema } from "./validator.js";
import { ZodError } from "zod";
import WorkerService from "./WorkerService.js";
import { userRepo } from "../repository/UserRepository.js";
import { courseRepo } from "../repository/CourseRepository.js";
import { paymentSuccessTemplate } from "../templates/paymentSucess.template.js";
import { purchaseService } from "./PurschaseService.js";
import { truncateWords } from "../utils.js";

class StripeService {
  static instance;

  constructor() {
    if (StripeService.instance) return StripeService.instance;
    this.stripe = new Stripe(env.getStripeSecretKey());
    StripeService.instance = this;
  }

  paymentIntent = async (amount, currency, userId, courseId) => {
    try {
      const validated = PaymentSchema.parse({ userId, courseId, currency, amount });
      const decimalAmount = validated.amount * 100;
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: decimalAmount,
        currency: validated.currency,
        payment_method_types: ["card"],
        metadata: { userId: validated.userId, courseId: validated.courseId },
      });
      await paymentRepo.CreatePayment(
        validated.userId,
        validated.courseId,
        validated.currency,
        validated.amount,
        "card",
        paymentIntent.id.toString(),
        "pending",
      );
      return { success: true, clientSecret: paymentIntent.client_secret };
    } catch (error) {
      if (error instanceof ZodError) return { success: false, error: error.errors };
      console.error("PaymentIntent error:", error);
      return { success: false, error };
    }
  };

  paymentWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) return res.status(400).json({ success: false, message: "No signature in headers" });
    try {
      const event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        env.getStripeWebhookSecret(),
      );
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;

        // TODO: NEED TO VERIFY THAT transactionId === paymentIntent.id
        const updatedPayment = await paymentRepo.UpdatePayment(paymentIntent.id.toString());
        if (!updatedPayment) {
          return res.status(500).json({ success: false, message: "Unable to update payment" });
        }
        const courseGrant = await purchaseService.BuyCourse(
          updatedPayment.userId,
          updatedPayment.courseId,
        );

        if (!courseGrant.success) {
          console.warn("Failed to auto-create purchase:", courseGrant.message);
        }
        const user = await userRepo.getUserbyId(updatedPayment.userId);
        const course = await courseRepo.getCoursebyId(updatedPayment.courseId);
        const emailQueue = WorkerService.getEmailQueue();
        await emailQueue.add("SendEmail", {
          to: user.email,
          subject: "Coursefare: Payment Successful",
          html: paymentSuccessTemplate({
            username: user.username,
            courseTitle: course.title,
            courseDescription: truncateWords(course.description, 50),
            coursePrice: updatedPayment.amount,
            currency: updatedPayment.currency,
            method: updatedPayment.method,
            transactionId: updatedPayment.transactionId,
          }),
        });

        return res.status(200).json({
          success: true,
          message: "Payment succeeded and course access granted automatically",
          payment: updatedPayment,
        });
      }

      return res.status(200).json({ success: true, message: "Event received" });
    } catch (error) {
      console.error("Webhook error:", error);
      return res.status(400).json({ success: false, error: error.message });
    }
  };
}

export const stripeService = new StripeService();
