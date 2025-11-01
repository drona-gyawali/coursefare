import { Router } from "express";
import { courseService } from "../services/CourseService.js";

const router = Router();

router.post("/create/course", async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, language, price } = req.body;
    const createdCourse = await courseService.CreateCourse(
      title,
      description,
      language,
      parseInt(price),
      userId,
    );
    if (!createdCourse) {
      return res.status(400).json({ status: 400, error: createdCourse });
    }
    return res.status(201).json({ status: 201, data: createdCourse });
  } catch (error) {
    {
      return res.status(400).json({ status: 400, error: error });
    }
  }
});

router.put("/update/course/:id", async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ status: 400, error: "id param missing" });
    }
    const { title, description, language, price } = req.body;
    const updatedCourse = await courseService.UpdateCourse(
      id.toString(),
      title,
      description,
      language,
      parseInt(price),
      userId.toString(),
    );
    if (!updatedCourse) {
      return res.status(400).json({ status: 400, error: updatedCourse });
    }
    return res.status(202).json({ status: 202, data: updatedCourse });
  } catch (error) {
    {
      return res.status(400).json({ status: 400, error: error });
    }
  }
});

router.delete("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ status: 400, error: "id param missing" });
    }
    const deletedCourse = await courseService.DeleteCourse(id.toString());
    if (!deletedCourse) {
      return res.status(400).json({ status: 400, error: "Error while deleting " });
    }
    return res.status(204).json({ status: 204, data: "No Content found" });
  } catch (error) {
    {
      return res.status(400).json({ status: 400, error: error });
    }
  }
});

export default router;
