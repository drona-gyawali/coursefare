import { jest } from "@jest/globals";

jest.unstable_mockModule("../repository/UserRepository.js", () => {
  const mock = { getUserbyId: jest.fn() };
  return { userRepo: mock };
});

jest.unstable_mockModule("../repository/CourseRepository.js", () => {
  const mock = { getCoursebyId: jest.fn() };
  return { courseRepo: mock };
});

jest.unstable_mockModule("../repository/PurchaseRepository.js", () => {
  const mock = {
    checkPurchase: jest.fn(),
    createPurchase: jest.fn(),
    getPurchasebyId: jest.fn(),
    getPurchasedCoursebyUser: jest.fn(),
  };
  return { purchaseRepo: mock };
});

jest.unstable_mockModule("../repository/PaymentRepository.js", () => {
  const mock = { hasUserPaidForCourse: jest.fn() };
  return { paymentRepo: mock };
});

jest.unstable_mockModule("../services/RedisService.js", () => {
  const mock = {
    delCache: jest.fn(),
    getCache: jest.fn(),
    setCache: jest.fn(),
  };
  return { default: mock };
});

// === NOW IMPORT ===
const { purchaseService } = await import("../services/PurschaseService.js");
const { purchaseRepo } = await import("../repository/PurchaseRepository.js");
const { userRepo } = await import("../repository/UserRepository.js");
const { courseRepo } = await import("../repository/CourseRepository.js");
const { paymentRepo } = await import("../repository/PaymentRepository.js");
const RedisService = (await import("../services/RedisService.js")).default;

// === Test Data ===
const mockUser = { _id: "user123", name: "John Doe" };
const mockCourse = {
  _id: "course123",
  title: "JavaScript Mastery",
  description: "Learn JS in depth",
  price: 999,
  creator: "creator123",
  updatedAt: new Date(),
};

describe("PurchaseService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("BuyCourse", () => {
    it("should return error if user not found", async () => {
      userRepo.getUserbyId.mockResolvedValue(null);

      const result = await purchaseService.BuyCourse("user123", "course123");

      expect(result).toEqual({
        success: false,
        message: "No user present with that id",
      });
      expect(userRepo.getUserbyId).toHaveBeenCalledWith("user123");
    });

    it("should return error if course not found", async () => {
      userRepo.getUserbyId.mockResolvedValue(mockUser);
      courseRepo.getCoursebyId.mockResolvedValue(null);

      const result = await purchaseService.BuyCourse("user123", "course123");

      expect(result).toEqual({
        success: false,
        message: "No user present with that id",
      });
    });

    it("should return error if course already purchased", async () => {
      userRepo.getUserbyId.mockResolvedValue(mockUser);
      courseRepo.getCoursebyId.mockResolvedValue(mockCourse);
      purchaseRepo.checkPurchase.mockResolvedValue(true);

      const result = await purchaseService.BuyCourse("user123", "course123");

      expect(result).toEqual({
        success: false,
        message: "User already purchased this course",
      });
    });

    it("should return error if payment not received", async () => {
      userRepo.getUserbyId.mockResolvedValue(mockUser);
      courseRepo.getCoursebyId.mockResolvedValue(mockCourse);
      purchaseRepo.checkPurchase.mockResolvedValue(false);
      paymentRepo.hasUserPaidForCourse.mockResolvedValue(false);

      const result = await purchaseService.BuyCourse("user123", "course123");

      expect(result).toEqual({
        success: false,
        message: "Payment didnot recieved for the course",
      });
    });

    it("should successfully purchase course and clear cache", async () => {
      userRepo.getUserbyId.mockResolvedValue(mockUser);
      courseRepo.getCoursebyId.mockResolvedValue(mockCourse);
      purchaseRepo.checkPurchase.mockResolvedValue(false);
      paymentRepo.hasUserPaidForCourse.mockResolvedValue(true);
      purchaseRepo.createPurchase.mockResolvedValue({ _id: "purchase123" });

      const result = await purchaseService.BuyCourse("user123", "course123");

      expect(result).toEqual({ _id: "purchase123" });
      expect(purchaseRepo.createPurchase).toHaveBeenCalledWith("user123", "course123");
      expect(RedisService.delCache).toHaveBeenCalledWith("purchased:user123:*");
    });

    it("should handle error during purchase creation", async () => {
      userRepo.getUserbyId.mockResolvedValue(mockUser);
      courseRepo.getCoursebyId.mockResolvedValue(mockCourse);
      purchaseRepo.checkPurchase.mockResolvedValue(false);
      paymentRepo.hasUserPaidForCourse.mockResolvedValue(true);
      purchaseRepo.createPurchase.mockResolvedValue(null);

      const result = await purchaseService.BuyCourse("user123", "course123");

      expect(result).toEqual({
        success: false,
        messge: "Error Occured while purchasing course",
      });
    });

    it("should catch and return error", async () => {
      userRepo.getUserbyId.mockRejectedValue(new Error("DB Error"));

      const result = await purchaseService.BuyCourse("user123", "course123");

      expect(result).toEqual({
        success: false,
        error: expect.any(Error),
      });
    });
  });

  it("should create invoice with discount", async () => {
    purchaseRepo.getPurchasebyId.mockResolvedValue({
      userId: "user123",
      courseId: "course123",
    });
    courseRepo.getCoursebyId.mockResolvedValue(mockCourse);

    const result = await purchaseService.createInvoice("purchase123", "user123", 200);

    expect(result).toEqual({
      success: true,
      data: expect.objectContaining({
        coursePrice: 799,
      }),
    });
  });
});
