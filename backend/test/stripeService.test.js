import { jest } from "@jest/globals";

const StripeMock = jest.fn(() => ({
  paymentIntents: {
    create: jest.fn().mockResolvedValue({
      id: "pi_test_123",
      client_secret: "test_client_secret",
    }),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
}));

await jest.unstable_mockModule("stripe", () => ({ default: StripeMock }));

const { stripeService } = await import("../services/PaymentService.js");
import { paymentRepo } from "../repository/PaymentRepository.js";

paymentRepo.CreatePayment = jest.fn().mockResolvedValue(true);
paymentRepo.UpdatePayment = jest.fn().mockResolvedValue({
  id: "pi_test_123",
  status: "succeeded",
});

describe("StripeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a payment intent and save payment", async () => {
    const result = await stripeService.paymentIntent(1000, "usd", "user1", "course1");

    console.log("DEBUG RESULT:", result); // <-- This will show why it fails

    expect(result.success).toBe(true);
    expect(result.clientSecret).toBe("test_client_secret");

    expect(paymentRepo.CreatePayment).toHaveBeenCalledWith(
      "user1",
      "course1",
      "usd",
      1000,
      "card",
      "pi_test_123",
      "pending",
    );
  });

  it("should handle payment_intent.succeeded webhook", async () => {
    stripeService.stripe.webhooks.constructEvent = jest.fn().mockReturnValue({
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_test_123" } },
    });

    const req = { headers: { "stripe-signature": "test_signature" }, body: {} };
    const jsonMock = jest.fn();
    const statusMock = jest.fn(() => ({ json: jsonMock }));
    const res = { status: statusMock };

    await stripeService.paymentWebhook(req, res);

    expect(stripeService.stripe.webhooks.constructEvent).toHaveBeenCalled();
    expect(paymentRepo.UpdatePayment).toHaveBeenCalledWith("pi_test_123");
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      payment: { id: "pi_test_123", status: "succeeded" },
    });
  });

  it("should return error if stripe signature is missing", async () => {
    const req = { headers: {}, body: {} };
    const jsonMock = jest.fn();
    const statusMock = jest.fn(() => ({ json: jsonMock }));
    const res = { status: statusMock };

    await stripeService.paymentWebhook(req, res);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "No signature in headers",
    });
  });
});
