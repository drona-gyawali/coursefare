import { Router } from "express";
import { courseService } from "../services/CourseService.js";
import { purchaseService } from "../services/PurschaseService.js";
const router = Router();

router.post("/purchase/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const purchasedCourse = await purchaseService.BuyCourse(userId, id.toString());
    if (!purchasedCourse) {
      return res.status(400).json({ success: false, error: "unable to purchase the course" });
    }
    return res.status(200).json({ success: true, data: purchasedCourse });
  } catch (error) {
    return res.status(400).json({ success: true, error: error });
  }
});

router.get("/purchased/courses", async (req, res) => {
  try {
    const { page = "1", limit = "10" } = req.query;
    if (limit > 100) {
      return res.status(400).json({ success: false, error: "limit exceded" });
    }
    const userId = req.user.userId;
    const getUserPurchasedCourse = await purchaseService.purchasedCourse(
      userId,
      parseInt(page),
      parseInt(limit),
    );
    if (!getUserPurchasedCourse) {
      return res.status(200).json({ message: "No course found" });
    }
    return res.status(200).json({ data: getUserPurchasedCourse });
  } catch (error) {
    return res.status(400).json({ success: true, error: error });
  }
});

// route is accessible by anyone at db level
// TODO: migrate this to global route so anyone can access: frontendreq
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
