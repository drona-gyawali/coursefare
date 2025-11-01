import { Router } from "express";
import userRouter from "../controller/UsersController.js";
import adminRouter from "../controller/AdminController.js";
import { Usermiddleware, Adminmiddleware } from "../middleware/AuthMiddleware.js";
import courseRouter from "../controller/CourseController.js";
import paymentRouter from "../controller/PaymentController.js";
const router = Router();

router.use("/user", userRouter);
router.use("/admin", Usermiddleware, Adminmiddleware, adminRouter);
router.use("/course", Usermiddleware, courseRouter);
router.use("/payments", Usermiddleware, paymentRouter);
export default router;
