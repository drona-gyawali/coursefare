import { courseContentRepo } from "../repository/CourseContentRepository.js";
import { CourseContentSchema } from "./validator.js";
import { paymentRepo } from "../repository/PaymentRepository.js";
import RedisService from "./RedisService.js";
import { CourseContentOwnerShip } from "../utils.js";

import { ZodError } from "zod";

class ContentService {
  async contentCreate(req, courseId, section, title, contentType, fileUrl, description, isPreview) {
    try {
      if (!req.user || !req.user.userId) {
        return { success: false, message: "User not authenticated" };
      }

      const verifiedUser = await CourseContentOwnerShip(req.user.userId, courseId.toString());
      if (!verifiedUser) return { success: false, message: "You are not owner of this course" };

      const validatedData = CourseContentSchema.parse({
        courseId,
        section,
        title,
        contentType,
        fileUrl,
        description,
        isPreview,
      });

      const contentCreated = await courseContentRepo.createCourseContent(
        validatedData.courseId,
        validatedData.section,
        validatedData.title,
        validatedData.contentType,
        validatedData.fileUrl,
        validatedData.description,
        validatedData.isPreview,
      );

      if (!contentCreated) return { success: false, message: "Course content creation failed" };
      return { success: true, data: contentCreated };
    } catch (error) {
      if (error instanceof ZodError) {
        return { success: false, message: error.errors };
      }
      return { success: false, message: error.message || error };
    }
  }

  async updateContent(req, courseId, updatedData) {
    try {
      if (!req.user || !req.user.userId) {
        return { success: false, message: "User not authenticated" };
      }

      const verifiedUser = await CourseContentOwnerShip(req.user.userId, courseId);
      if (!verifiedUser) return { success: false, message: "You are not owner of this course" };

      const updatedContent = await courseContentRepo.updateCourseContent(
        courseId.toString(),
        updatedData,
      );
      if (!updatedContent) return { success: false, message: "Update failed" };

      await RedisService.delCache(`courseContent:${courseId}*`);
      return { success: true, data: updatedContent };
    } catch (error) {
      return { success: false, message: error.message || error };
    }
  }

  async getCourseContent(req, courseId) {
    try {
      const userId = req.user.userId;
      const key = `courseContent:${courseId}-${userId}`;

      const cached = await RedisService.getCache(key);
      if (cached) return { ...cached, cached: true };

      const fetchCourse = await courseContentRepo.getCourseContent(courseId);
      if (!fetchCourse || fetchCourse.length === 0) {
        return { success: false, message: "Course content not found" };
      }

      const requiresPayment = fetchCourse.every((content) => !content.isPreview);
      if (requiresPayment) {
        const isPaid = await paymentRepo.hasUserPaidForCourse(userId, courseId);
        if (!isPaid) return { success: false, message: "Premium course access denied" };
      }

      await RedisService.setCache(key, fetchCourse);
      return fetchCourse;
    } catch (error) {
      return { success: false, message: error.message || error };
    }
  }
}

export const contentService = new ContentService();
