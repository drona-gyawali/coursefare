import { z } from "zod";

export const UserSchema = z.object({
  email: z.string().email().min(3).max(78),
  password: z.string().min(4).max(100),
  role: z.enum(["user", "admin"]),
});

export const LoginSchema = z.object({
  email: z.string().email().min(3).max(78),
  password: z.string().min(4).max(100),
});

export const createCourseSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(2).max(2000),
  language: z.string().min(1).max(10),
  price: z.number().int().min(0),
  creatorId: z.string(),
});

export const updateCourseSchema = z.object({
  courseId: z.string(),
  title: z.string().min(2).max(100),
  description: z.string().min(2).max(2000),
  language: z.string().min(1).max(10),
  price: z.number().int().min(0),
  creatorId: z.string(),
});

export const PaymentSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  courseId: z.string().min(1, "courseId is required"),
  currency: z.string().default("NPR"),
  amount: z.number().positive("Amount must be positive"),
});

export const CourseContentSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  section: z.string().min(1, "Section must be added e.g. intro, advanced"),
  title: z.string().min(1).max(100, "title should be short"),
  contentType: z.enum(["pdf", "video", "quiz", "assigment"]),
  fileUrl: z.string().min(1).max(100, "file url shoudl be string"),
  description: z.string().min(1).max(1000, "description shouldnot be more thatn > 1000"),
  isPreview: z.boolean().default(false),
});
