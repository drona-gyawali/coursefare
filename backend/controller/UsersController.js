import { Router } from "express";
import { authService } from "../services/AuthService.js";
import { Usermiddleware } from "../middleware/AuthMiddleware.js";
import { courseService } from "../services/CourseService.js";
const router = Router();

router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;
  const registeredUser = await authService.Register(email, password, role);
  if (!registeredUser.success) {
    return res.status(400).json({ status: 400, message: registeredUser });
  }
  return res.status(201).json({ status: 201, message: "User registered successfully" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const loggedUser = await authService.Login(req, res, email, password);
  if (!loggedUser) {
    return res.status(400).json({ status: 400, message: loggedUser.message || "Login error" });
  }
  return res.status(200).json({ status: 200, tokens: loggedUser });
});

router.post("/refresh", (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(400).json({ status: 400, message: "invalid token given" });
  }
  let refreshToken = authService.refresh(req, res, token.toString());
  if (!refreshToken) {
    return res.status(400).json({ status: 400, message: "Token invalid" });
  }
  return res.status(200).json({ status: 200, refresh_token: refreshToken });
});

router.post("/profile", Usermiddleware, async (req, res) => {
  const userdata = await authService.profile(req);
  if (!userdata) {
    return res.status(400).json({ status: 400, message: "Unauthorized access" });
  }
  return res.status(200).json({ status: 200, data: userdata });
});

router.get("/courses", async (req, res) => {
  try {
    const { limit = "10", page = "1" } = req.query;
    const getCourses = await courseService.getAllCourseGlobal(parseInt(limit), parseInt(page));
    if (!getCourses) {
      return res.status(400).json({ status: 400, error: getCourses });
    }
    return res.status(200).json({ status: 200, data: getCourses });
  } catch (error) {
    {
      return res.status(400).json({ status: 400, error: error });
    }
  }
});

export default router;
