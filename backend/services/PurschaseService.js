import { purchaseRepo } from "../repository/PurchaseRepository.js";
import { userRepo } from "../repository/UserRepository.js";
import { courseRepo } from "../repository/CourseRepository.js";
import { paymentRepo } from "../repository/PaymentRepository.js";
import RedisService from "./RedisService.js";

class PurchaseService {
  constructor() {}

  async BuyCourse(userId, courseId) {
    try {
      const userdata = await userRepo.getUserbyId(userId);
      if (!userdata) {
        return { success: false, message: "No user present with that id" };
      }
      const coursedata = await courseRepo.getCoursebyId(courseId);
      if (!coursedata) {
        return { success: false, message: "No user present with that id" };
      }
      const alreadyBought = await purchaseRepo.checkPurchase(coursedata._id, userdata._id);
      if (alreadyBought) {
        return { success: false, message: "User already purchased this course" };
      }

      const isPurchased = await paymentRepo.hasUserPaidForCourse(userdata._id, coursedata._id);
      if (!isPurchased)
        return { success: false, message: "Payment didnot recieved for the course" };
      const boughtCourse = await purchaseRepo.createPurchase(userdata._id, coursedata._id);
      if (!boughtCourse) {
        return { success: false, messge: "Error Occured while purchasing course" };
      }
      await RedisService.delCache(`purchased:${userId}:*`);
      return boughtCourse;
    } catch (error) {
      if (error) return { success: false, error: error };
    }
  }

  async createInvoice(purchaseId, userId, discount = null) {
    try {
      const purchaseData = await purchaseRepo.getPurchasebyId(purchaseId);
      if (purchaseData.userId.toString() != userId.toString()) {
        return { success: false, message: "No purchase present with that id" };
      }
      const courseDetails = await courseRepo.getCoursebyId(purchaseData.courseId);
      if (!courseDetails) {
        return { success: false, message: "No course present with that id" };
      }
      let coursePrice = courseDetails.price;
      if (discount != null) {
        coursePrice = courseDetails.price - parseInt(discount);
      }
      const payload = {
        courseTitle: courseDetails.title,
        courseDescription: courseDetails.description,
        coursePrice: coursePrice < 0 ? 0 : coursePrice,
        creatorId: courseDetails.creator,
        updated_at: courseDetails.updatedAt,
      };

      return {
        success: true,
        data: payload,
      };
    } catch (error) {
      if (error) return { success: false, error: error };
    }
  }

  async purchasedCourse(userId, page, limit) {
    try {
      if (!userId) return { success: false, error: "userId is missing" };
      const cacheKey = `purchased:${userId}:page:${page}:limit:${limit}`;
      const cached = await RedisService.getCache(cacheKey);
      if (cached) {
        return { ...cached, cached: true };
      }
      const purchasedData = await purchaseRepo.getPurchasedCoursebyUser(userId, page, limit);
      if (!purchasedData || !purchasedData.purchaseData.length) {
        return { success: true, message: "No purchased courses found" };
      }
      const coursesPayload = [];
      for (const purchase of purchasedData.purchaseData) {
        const courseDetails = await courseRepo.getCoursebyId(purchase.courseId);
        if (!courseDetails) continue;
        const coursePrice = courseDetails.price || 0;
        coursesPayload.push({
          courseTitle: courseDetails.title,
          courseDescription: courseDetails.description,
          coursePrice: coursePrice < 0 ? 0 : coursePrice,
          creatorId: courseDetails.creator,
          updated_at: courseDetails.updatedAt,
        });
      }
      const result = {
        success: true,
        page: purchasedData.page,
        limit: purchasedData.limit,
        totalPages: purchasedData.totalPages,
        totalItems: purchasedData.totalItems,
        courses: coursesPayload,
      };
      await RedisService.setCache(cacheKey, result, 900);
      return { ...result };
    } catch (error) {
      console.log(error);
      return { success: false, error: error.message || error };
    }
  }
}

export const purchaseService = new PurchaseService();
