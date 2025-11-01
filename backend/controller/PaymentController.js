import { stripeService } from "../services/PaymentService.js";
import express from "express";

const router = express.Router();

router.post("/create-intent-stripe", async (req, res) => {
  const userId = res.user.userId;
  const { amount, currency, courseId } = req.body;
  try {
    const paymentIntented = await stripeService.paymentIntent(
      amount,
      currency,
      userId.toString(),
      courseId.toString(),
    );
    if (!paymentIntented) {
      return res.status(400).json({ status: 400, error: "unable to proceed payment" });
    }
    res.status(201).json({ status: 201, message: paymentIntented });
  } catch (error) {
    return res.status(400).json({ status: 400, error: error });
  }
});

router.post("/webhook/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const paymentWebhook = await stripeService.paymentWebhook(req, res);
    if (!paymentWebhook) {
      return res.status(400).json({ status: 400, error: "unable to proceed webhook" });
    }
    res.status(200).json({ status: 200, message: paymentWebhook });
  } catch (error) {
    return res.status(400).json({ status: 400, error: error });
  }
});

export default router;
