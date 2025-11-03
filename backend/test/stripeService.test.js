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

// Mock stripe module
await jest.unstable_mockModule("stripe", () => ({ default: StripeMock }));

// Mock all dependent repositories and services
await jest.unstable_mockModule("../repository/PaymentRepository.js", () => ({
  paymentRepo: {
    CreatePayment: jest.fn(),
    UpdatePayment: jest.fn(),
  },
}));

await jest.unstable_mockModule("../repository/UserRepository.js", () => ({
  userRepo: {
    getUserbyId: jest.fn(),
  },
}));

await jest.unstable_mockModule("../repository/CourseRepository.js", () => ({
  courseRepo: {
    getCoursebyId: jest.fn(),
  },
}));

await jest.unstable_mockModule("../services/PurschaseService.js", () => ({
  purchaseService: {
    BuyCourse: jest.fn(),
  },
}));

await jest.unstable_mockModule("../services/WorkerService.js", () => ({
  default: {
    getEmailQueue: jest.fn(() => ({
      add: jest.fn(),
    })),
  },
}));

await jest.unstable_mockModule("../templates/paymentSucess.template.js", () => ({
  paymentSuccessTemplate: jest.fn(),
}));

await jest.unstable_mockModule("../utils.js", () => ({
  truncateWords: jest.fn((text, n) => text.split(" ").slice(0, n).join(" ")),
}));

// Now import the main service
const { stripeService } = await import("../services/PaymentService.js");
const { paymentRepo } = await import("../repository/PaymentRepository.js");
const { userRepo } = await import("../repository/UserRepository.js");
const { courseRepo } = await import("../repository/CourseRepository.js");
const { purchaseService } = await import("../services/PurschaseService.js");

describe("StripeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a payment intent and save payment", async () => {
    const result = await stripeService.paymentIntent(1000, "usd", "user1", "course1");

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
    // Mock event
    stripeService.stripe.webhooks.constructEvent = jest.fn().mockReturnValue({
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_test_123" } },
    });

    // Mock repositories and services
    paymentRepo.UpdatePayment.mockResolvedValue({
      id: "pi_test_123",
      status: "succeeded",
      userId: "user1",
      courseId: "course1",
      amount: 1000,
      currency: "usd",
      method: "card",
      transactionId: "pi_test_123",
    });
    purchaseService.BuyCourse.mockResolvedValue({ success: true });
    userRepo.getUserbyId.mockResolvedValue({
      id: "user1",
      username: "testuser",
      email: "test@example.com",
    });
    courseRepo.getCoursebyId.mockResolvedValue({
      id: "course1",
      title: "Test Course",
      description: "This is a long description for testing purpose.",
    });

    // Mock Express req/res
    const req = { headers: { "stripe-signature": "test_signature" }, body: {} };
    const jsonMock = jest.fn();
    const statusMock = jest.fn(() => ({ json: jsonMock }));
    const res = { status: statusMock };

    await stripeService.paymentWebhook(req, res);

    expect(stripeService.stripe.webhooks.constructEvent).toHaveBeenCalled();
    expect(paymentRepo.UpdatePayment).toHaveBeenCalledWith("pi_test_123");
    expect(purchaseService.BuyCourse).toHaveBeenCalledWith("user1", "course1");
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        payment: expect.objectContaining({ id: "pi_test_123", status: "succeeded" }),
      }),
    );
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
