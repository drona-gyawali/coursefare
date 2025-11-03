import { ZodError } from "zod";
import { userRepo } from "../repository/UserRepository.js";
import { UserSchema, LoginSchema } from "./validator.js";
import WorkerService from "./WorkerService.js";
import { loginTemplate } from "../templates/login.templates.js";
import { signupTemplate } from "../templates/signup.template.js";
import {
  createJwtToken,
  setCookie,
  hashPassword,
  VerifyPassword,
  verifyJwtToken,
} from "../utils.js";
import RedisService from "./RedisService.js";

class AuthService {
  constructor() {}

  Register = async (email, password, role) => {
    try {
      const ValidatedData = UserSchema.parse({ email, password, role });
      const { email: validEmail, password: validPassword, role: validRole } = ValidatedData;
      const repo = await userRepo.getUserbyEmail(validEmail);
      if (repo) return { success: false, message: "user already exists" };
      const hashedPassword = await hashPassword(validPassword);
      const newUser = await userRepo.createUser(validEmail, hashedPassword, validRole);
      const emailqueue = WorkerService.getEmailQueue();
      await emailqueue.add("SendEmail", {
        to: validEmail,
        subject: "Coursefare: Singup Successfull",
        template: signupTemplate(validEmail.split("@")[0]),
      });
      return { success: true, data: newUser };
    } catch (error) {
      if (error instanceof ZodError) {
        return { success: false, error: error };
      }
      if (error) return { success: false, error: error };
    }
  };

  Login = async (req, res, email, password) => {
    try {
      const validateData = LoginSchema.parse({ email, password });
      const { email: validEmail, password: validPassword } = validateData;
      const repo = await userRepo.getUserbyEmail(validEmail);
      if (!repo) return { success: "false", message: "Unregistered user!" };
      const isMatch = await VerifyPassword(validPassword, repo.password);
      if (!isMatch) return { success: false, message: "credentials doesnot match" };
      const access_token = createJwtToken(repo._id.toString(), repo.role.toString(), "1h");
      const refresh_token = createJwtToken(repo._id.toString(), repo.role.toString(), "7d");
      setCookie(req, res, access_token, false);
      setCookie(req, res, refresh_token, true);
      const tokens = { access_token: access_token, refresh_token: refresh_token };
      const emailQueue = WorkerService.getEmailQueue();
      await emailQueue.add("SendEmail", {
        to: validEmail,
        subject: "Login Successfully",
        template: loginTemplate(validEmail.split("@")[0]),
      });
      return tokens;
    } catch (error) {
      if (error instanceof ZodError) {
        return { success: false, error: error };
      }
      if (error) return { success: false, error: error };
    }
  };

  refresh = (req, res, refreshToken) => {
    try {
      if (!refreshToken) return { success: "false", message: "refresh Token missing!" };
      const verifiedToken = verifyJwtToken(refreshToken);
      if (!verifiedToken) return { success: "false", message: "Unverified token!" };
      const newAccessToken = createJwtToken(verifiedToken.userId, verifiedToken.role, "1h");
      setCookie(req, res, newAccessToken, false);
      console.log(newAccessToken);
      return newAccessToken;
    } catch (error) {
      if (error) return { success: false, error: error };
    }
  };

  // TODO: invalid cache at other logic like cache dp etc..
  profile = async (req) => {
    try {
      const userId = req.user.userId;
      const cachekey = `profile:${userId}`;
      const cached = await RedisService.getCache(cachekey);
      if (cached) return { ...cached, cached: true };
      if (!userId) return { success: false, message: "Unauthorized User" };
      const userData = await userRepo.getUserbyId(userId);
      if (!userData) return { success: false, message: "Unverified User" };
      const profiledata = { userData };
      await RedisService.setCache(cachekey, profiledata);
      return profiledata;
    } catch (error) {
      if (error) return { success: false, error: error };
    }
  };
}

export const authService = new AuthService();
