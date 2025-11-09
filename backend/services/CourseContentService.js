import { courseContentRepo } from "../repository/CourseContentRepository.js";
import { CourseContentSchema } from "./validator.js";
import { paymentRepo } from "../repository/PaymentRepository.js";
import RedisService from "./RedisService.js";
import { CourseContentOwnerShip } from "../utils.js";
import { sendNotification, sendEmail, coursePurchasedEmails } from "../utils.js";
import { ZodError } from "zod";
import { courseContentTemplate } from "../templates/coursecontent.template.js";
import { CourseContent } from "../core/schema.js";

class ContentService {
  async contentCreate(req, courseId, section, title, contentType, fileUrl, description, isPreview) {
    try {
      if (!req.user || !req.user.userId) {
        return { success: false, message: "User not authenticated" };
      }

      const { success, data } = await CourseContentOwnerShip(req.user.userId, courseId.toString());
      if (!success) return { success: false, message: "You are not owner of this course" };

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
      console.log(courseId);
      const users = await coursePurchasedEmails(courseId);
      await Promise.all([
        ...users.map(({ email }) =>
          sendEmail(
            email,
            `CourseFare: ${data.title} has added new Content`,
            courseContentTemplate(
              contentCreated.title,
              data.title,
              contentCreated.fileUrl,
              contentCreated.contentType,
              "addded",
            ),
          ),
        ),
        ...users.map(({ userId }) =>
          sendNotification(userId, `CourseFare: ${data.title} has added new Content`, "info", "#"),
        ),
      ]);
      await RedisService.delCache(`courseContent:${courseId}*`);
      return { success: true, data: contentCreated };
    } catch (error) {
      if (error instanceof ZodError) {
        return { success: false, message: JSON.stringify(error) };
      }
      return { success: false, message: error?.message || JSON.stringify(error) };
    }
  }

  async updateContent(req, contentId, updatedData) {
    try {
      if (!req.user || !req.user.userId) {
        return { success: false, message: "User not authenticated" };
      }

      const CourseDetails = await CourseContent.findById(contentId.toString());
      if (!CourseDetails) return { success: false, message: "No course Available" };
      const { success, data } = await CourseContentOwnerShip(
        req.user.userId,
        CourseDetails.courseId.toString(),
      );
      if (!success) return { success: false, message: "You are not owner of this course" };

      const updatedContent = await courseContentRepo.updateCourseContent(
        contentId.toString(),
        updatedData,
      );
      if (!updatedContent) return { success: false, message: "Update failed" };

      const users = await coursePurchasedEmails(CourseDetails.courseId.toString());

      await Promise.all([
        ...users.map(({ email }) =>
          sendEmail(
            email,
            "CourseFare: Course has updated Content",
            courseContentTemplate(
              updatedContent.title,
              data.title,
              updatedContent.fileUrl,
              updatedContent.contentType,
              "updated",
            ),
          ),
        ),
        ...users.map(({ userId }) =>
          sendNotification(userId, "CourseFare: Course has been updated", "info", "#"),
        ),
      ]);

      await RedisService.delCache(`courseContent:${CourseDetails.courseId.toString()}*`);
      return { success: true, data: updatedContent };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || error };
    }
  }

  async getCourseContent(req, courseId, page, limit) {
    try {
      const userId = req.user.userId;
      const key = `courseContent:${courseId}-${userId}`;
      const cached = await RedisService.getCache(key);
      if (cached) return { ...cached, cached: true };
      const fetchCourse = await courseContentRepo.getCourseContent(courseId, page, limit);

      if (!fetchCourse || !fetchCourse.course || fetchCourse.course.length === 0) {
        return { success: false, message: "Course content not found" };
      }

      const filteredCourse = await Promise.all(
        fetchCourse.course.map(async (content) => {
          if (!content.isPreview) {
            const hasPaid = await paymentRepo.hasUserPaidForCourse(userId, courseId);
            if (!hasPaid) {
              return { ...content.toObject(), locked: true };
            }
          }
          return content;
        }),
      );

      fetchCourse.course = filteredCourse;

      await RedisService.setCache(key, fetchCourse);

      return fetchCourse;
    } catch (error) {
      return { success: false, message: error.message || error };
    }
  }
}

export const contentService = new ContentService();
