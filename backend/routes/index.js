import { Router } from "express";
import userRouter from "../controller/UsersController.js";
import adminRouter from "../controller/AdminController.js";
import { Usermiddleware, Adminmiddleware } from "../middleware/AuthMiddleware.js";
import courseRouter from "../controller/CourseController.js";
import paymentRouter from "../controller/PaymentController.js";
import notificationRouter from "../controller/NotificationController.js";
import RateLimiterMiddleware from "../middleware/RateLimiterMiddleware.js";

const router = Router();
const RateLimit = RateLimiterMiddleware.rateLimiterUser;

router.use("/user", userRouter);
router.use("/admin", Usermiddleware, Adminmiddleware, RateLimit, adminRouter);
router.use("/course", Usermiddleware, RateLimit, courseRouter);
router.use("/notification", Usermiddleware, RateLimit, notificationRouter);
router.use("/payments", Usermiddleware, RateLimit, paymentRouter);

export default router;
