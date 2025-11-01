import { Course } from "../core/schema.js";
import { validateFields } from "../utils.js";

class CourseRepo {
  constructor() {
    this.model = Course;
  }

  async createCourse(title, description, language, price, CreatorId) {
    try {
      validateFields({ title, description, language, price, CreatorId });
      const newCourse = new this.model({ title, description, language, price, creator: CreatorId });
      await newCourse.save();
      return newCourse;
    } catch (error) {
      console.error("Error in createCourse:", error.message);
      throw error;
    }
  }

  async getCoursebyId(courseId) {
    try {
      if (!courseId) {
        throw new Error("courseId is missing");
      }
      const courseData = await this.model.findById(courseId);
      if (!courseData) {
        throw new Error("course Id missing");
      }
      return courseData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getallcourse(page, limit) {
    try {
      if (limit > 100) {
        return "limit exceeded";
      }
      let skip = (page - 1) * limit;
      const totalItems = await this.model.countDocuments();
      const FetchCourses = await this.model.find({}, { __v: 0 }).skip(skip).limit(limit);
      const totalPages = Math.ceil(totalItems / limit);
      if (!FetchCourses.length) return "No courses found";
      return { FetchCourses, page, limit, totalItems, totalPages };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteCourse(CourseId) {
    try {
      if (!CourseId) throw new Error("Course Id is missing");
      const deletedCourse = await this.model.findByIdAndDelete(CourseId);
      if (!deletedCourse) throw new Error("Unable to delete course");
      return { message: "Course deleted successfully" };
    } catch (error) {
      console.error("Error in deleteCourse:", error.message);
      throw error;
    }
  }

  async updateCourse(courseId, title, description, language, price, CreatorId) {
    try {
      validateFields({ courseId, title, description, language, price, CreatorId });
      const course = await this.model.findById(courseId);
      if (!course) throw new Error("Course does not exist");
      if (course.creator.toString() !== CreatorId)
        throw new Error("Unauthorized: only creator can modify");
      const updatedCourse = await this.model.findByIdAndUpdate(
        courseId,
        { title, description, language, price },
        { new: true },
      );
      return updatedCourse;
    } catch (error) {
      console.error("Error in updateCourse:", error.message);
      throw error;
    }
  }

  async listCourse(userId, limit, page) {
    try {
      let skip = (page - 1) * limit;
      let totalItems = await this.model.countDocuments();
      const courses = await this.model.find({ creator: userId }).skip(skip).limit(limit);
      const totalPages = Math.ceil(totalItems / limit);
      if (!courses.length) return "No courses found for this user";
      return { courses, page, limit, totalPages, totalItems };
    } catch (error) {
      console.error("Error in listCourse:", error.message);
      throw error;
    }
  }
}

export const courseRepo = new CourseRepo();
