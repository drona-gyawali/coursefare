import { ZodError } from "zod/v3";
import { courseRepo } from "../repository/CourseRepository.js";
import { clearCourseCache, validateFields } from "../utils.js";
import { createCourseSchema, updateCourseSchema } from "./validator.js";
import RedisService from "./RedisService.js";

class CourseService {
  constructor() {}

  async CreateCourse(title, description, language, price, creatorId) {
    try {
      validateFields(title, description, language, price, creatorId);
      const validateData = createCourseSchema.parse({
        title,
        description,
        language,
        price,
        creatorId,
      });
      const {
        title: validTitle,
        description: validDesc,
        language: validLang,
        price: validPrice,
        creatorId: validUserId,
      } = validateData;
      const courseCreated = courseRepo.createCourse(
        validTitle,
        validDesc,
        validLang,
        validPrice,
        validUserId,
      );
      if (!courseCreated) return { success: false, message: "Course cannot be created" };
      await clearCourseCache(validUserId);
      return courseCreated;
    } catch (error) {
      if (error instanceof ZodError) {
        return { success: false, message: error };
      }
      if (error) {
        return { success: false, message: error };
      }
    }
  }

  async UpdateCourse(courseId, title, description, language, price, creatorId) {
    try {
      validateFields(courseId, title, description, language, price, creatorId);
      const validateData = updateCourseSchema.parse({
        courseId,
        title,
        description,
        language,
        price,
        creatorId,
      });
      const {
        courseId: validCourseId,
        title: validTitle,
        description: validDesc,
        language: validLang,
        price: validPrice,
        creatorId: validUserId,
      } = validateData;
      const updatedCourse = await courseRepo.updateCourse(
        validCourseId,
        validTitle,
        validDesc,
        validLang,
        validPrice,
        validUserId,
      );
      if (!updatedCourse) return { success: false, message: "Updation has been failed" };
      await clearCourseCache(validUserId);
      return {
        success: true,
        data: "course doesnot exists",
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return { success: false, message: error };
      }
      if (error) {
        return { success: false, message: error };
      }
    }
  }

  // admin view course
  async getAllCourse(userId, limit, page) {
    try {
      if (limit > 100) {
        return { success: false, message: "limit cannot be exceed" };
      }
      const cacheKey = `AdminCourse:${userId}:page:${page}:limit:${limit}`;
      const cached = await RedisService.getCache(cacheKey);
      if (cached) {
        return { ...cached, cached: true };
      }
      const FetchCourse = await courseRepo.listCourse(userId, limit, page);
      if (!FetchCourse) {
        return { success: false, message: "No course found" };
      }
      const fetchCourse = { success: true, data: FetchCourse };
      await RedisService.setCache(cacheKey, fetchCourse);
      return fetchCourse;
    } catch (error) {
      if (error) {
        return { success: false, message: error };
      }
    }
  }

  async getAllCourseGlobal(limit, page) {
    try {
      const cacheKey = `globalCourse:page:${page}:limit:${limit}`;
      const cached = await RedisService.getCache(cacheKey);
      if (cached) {
        return { ...cached, cached: true };
      }
      if (limit > 100) {
        return { success: false, message: "limit cannot be exceed" };
      }
      const FetchCourse = await courseRepo.getallcourse(page, limit);
      if (!FetchCourse) {
        return { success: false, message: "No course found" };
      }
      const fetchCourse = { success: true, data: FetchCourse };
      await RedisService.setCache(cacheKey, fetchCourse);
      return fetchCourse;
    } catch (error) {
      if (error) {
        return { success: false, message: error };
      }
    }
  }

  async DeleteCourse(courseId) {
    try {
      const getCourse = await courseRepo.getCoursebyId(courseId);
      if (!getCourse) return { success: false, msg: "Course ID is missing" };
      const courseDeleted = await courseRepo.deleteCourse(getCourse._id);
      if (!courseDeleted) return false;
      await clearCourseCache(getCourse.creator.toString());
      return true;
    } catch (error) {
      if (error) {
        return { success: false, message: error };
      }
    }
  }
}

export const courseService = new CourseService();
