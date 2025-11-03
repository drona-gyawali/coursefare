import { CourseContent } from "../core/schema.js";
import RedisService from "../services/RedisService.js";

class CourseContentRepo {
  constructor() {
    this.model = CourseContent;
  }

  async createCourseContent(
    courseId,
    section,
    title,
    contentType,
    fileUrl,
    description,
    isPreview,
  ) {
    try {
      const lastContent = await CourseContent.find({ courseId, section })
        .sort({ order: -1 })
        .limit(1);
      const nextOrder = lastContent.length ? lastContent[0].order + 1 : 1;
      const courseCreated = this.model({
        courseId,
        section,
        title,
        contentType,
        fileUrl,
        description,
        order: nextOrder,
        isPreview,
      });
      await courseCreated.save();
      return courseCreated;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async updateCourseContent(courseId, updateData) {
    try {
      const allowedUpdates = [
        "section",
        "title",
        "contentType",
        "fileUrl",
        "description",
        "isPreview",
      ];
      const updates = {};
      Object.keys(updateData).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          updates[key] = updateData[key];
        }
      });
      console.log(courseId);
      if (Object.keys(updates).length === 0) {
        throw new Error("No valid fields to update");
      }
      const updatedCourse = await CourseContent.findOneAndUpdate(
        { courseId: courseId.toString() },
        { $set: updates },
        { new: true, runValidators: true },
      );
      console.log(updatedCourse);
      if (!updatedCourse) {
        throw new Error("Course not found");
      }
      return updatedCourse;
    } catch (err) {
      throw new Error(`Update failed: ${err.message}`);
    }
  }

  async deleteCourseContent(courseId) {
    try {
      const deletedCourse = await CourseContent.findOneAndDelete({ courseId: courseId });
      if (!deletedCourse) throw new Error("Course not found");
      await RedisService.delCache(`courseContent:${courseId}*`);
      return { message: "Course deleted successfully", deletedCourse };
    } catch (err) {
      throw new Error(`Delete failed: ${err.message}`);
    }
  }

  async getCourseContent(courseId = null) {
    try {
      if (courseId) {
        const course = await CourseContent.find({ courseId: courseId });
        if (!course) throw new Error("Course not found");
        return course;
      } else {
        const courses = await CourseContent.find();
        return courses;
      }
    } catch (err) {
      throw new Error(`Fetch failed: ${err.message}`);
    }
  }
}

export const courseContentRepo = new CourseContentRepo();
