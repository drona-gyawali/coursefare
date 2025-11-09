import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "./core/conf.js";
import RedisService from "./services/RedisService.js";
import { initDb } from "./core/database.js";
import { courseRepo } from "./repository/CourseRepository.js";
import WorkerService from "./WorkerService.js";
import { Purchase } from "./core/schema.js";
import { userRepo } from "./repository/UserRepository.js";
import mongoose from "mongoose";

export function generateRandomString() {
  return Math.random().toString(36).substring(2, 6);
}

export function validateFields(fields) {
  const missing = Object.entries(fields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`Missing fields: ${missing.join(", ")}`);
  }
}

export const hashPassword = async (plainPassword) => {
  try {
    if (!plainPassword) {
      throw new Error("Password is expected");
    }
    const salt = await bcrypt.genSalt(6);
    return bcrypt.hash(plainPassword, salt);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const VerifyPassword = async (plainpassword, hashedPassword) => {
  try {
    validateFields({ plainpassword, hashPassword });
    const isMatch = await bcrypt.compare(plainpassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createJwtToken = (userId, role, time) => {
  const token = jwt.sign({ userId: userId, role: role }, env.getJwtSecret(), { expiresIn: time });
  if (!token) {
    throw new Error("Error Occured while token creation");
  }
  return token;
};

export const verifyJwtToken = (token) => {
  const userdata = jwt.verify(token, env.getJwtSecret());
  if (!userdata) {
    throw new Error("Unauthorized User");
  }
  return userdata;
};

export const setCookie = (req, res, token, isRefresh) => {
  const name = isRefresh ? "refresh_token" : "access_token";
  res.cookie(name, token, {
    httpOnly: true,
    sameSite: "none",
    secure: false,
    path: "/",
  });
};

export async function clearCourseCache(creatorId) {
  try {
    await Promise.all([
      RedisService.delCache("globalCourse:*"),
      RedisService.delCache(`AdminCourse:${creatorId}*`),
    ]);
  } catch (error) {
    console.log("error del caching", error);
  }
}

export async function starter() {
  try {
    await Promise.all([initDb.ConnectDb(), RedisService.ready]);
  } catch (error) {
    console.log("Error on the initital services", error);
  }
}

export function truncateWords(text, wordLimit = 50) {
  if (!text) return "";
  const words = text.split(/\s+/);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
}

export async function CourseContentOwnerShip(userId, courseId) {
  try {
    const verifiedOwner = await courseRepo.getCoursebyId(courseId);
    if (!verifiedOwner.creator === userId.toString()) {
      return { success: false, data: "Not authorized user" };
    }
    return { success: true, data: verifiedOwner };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

export function constructFileUrl(key) {
  const Objecturl = `"${env.getObejctEndpointBucket}${env.getBucketName}/${key}"`;
  return Objecturl.toString();
}

export async function sendNotification(userId, message, type, link) {
  const { notificationQueue } = WorkerService.getQueues();
  await notificationQueue.add("notification", {
    userId,
    message,
    type,
    isRead: false,
    link,
  });
}

export async function sendEmail(email, subject, template) {
  const { emailQueue } = WorkerService.getQueues();
  await emailQueue.add("SendEmail", {
    to: email,
    subject: subject,
    template: template,
  });
}

export async function coursePurchasedEmails(courseId) {
  const purchases = await Purchase.find({
    courseId: new mongoose.Types.ObjectId(courseId),
  });

  if (!purchases || purchases.length === 0) {
    return [];
  }

  const userDataPromises = purchases.map(async (p) => {
    if (p.userId) {
      const userdetails = await userRepo.getUserbyId(p.userId.toString());
      if (userdetails?.email) {
        return {
          userId: p.userId.toString(),
          email: userdetails.email,
        };
      }
    }
    return null;
  });

  const userData = await Promise.all(userDataPromises);
  const filteredData = userData.filter(Boolean);

  return filteredData;
}
