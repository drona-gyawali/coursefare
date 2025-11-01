import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "./core/conf.js";
import RedisService from "./services/RedisService.js";
import { initDb } from "./core/database.js";

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
