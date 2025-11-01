import { Purchase } from "../core/schema.js";
import { validateFields } from "../utils.js";

class PurchaseRepo {
  constructor() {
    this.model = Purchase;
  }

  async createPurchase(userId, courseId) {
    try {
      validateFields({ userId, courseId });
      const newPurchase = new this.model({ userId, courseId });
      await newPurchase.save();
      return newPurchase;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getPurchasebyId(purchaseId) {
    try {
      if (!purchaseId) {
        throw new Error("purchase is missing");
      }
      const purchaseData = await this.model.findById(purchaseId);
      if (!purchaseData) {
        throw new Error("purchase Id missing");
      }
      return purchaseData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async checkPurchase(courseId, userId) {
    try {
      validateFields({ courseId });
      const boughtCourse = await this.model.findOne({ courseId, userId });
      if (!boughtCourse) return false;
      return true;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getPurchasedCoursebyUser(userId, page, limit) {
    try {
      if (limit > 100) {
        throw new Error("limit exceeded");
      }
      if (!userId) {
        throw new Error("userid is missing");
      }
      let skip = (page - 1) * limit;
      const totalItems = await this.model.countDocuments();
      const totalPages = Math.ceil(totalItems / limit);
      const purchaseData = await this.model.find({ userId: userId }).skip(skip).limit(limit);
      if (!purchaseData) {
        throw new Error("user Id missing");
      }
      return { purchaseData, totalPages, totalItems, page, limit, skip };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export const purchaseRepo = new PurchaseRepo();
