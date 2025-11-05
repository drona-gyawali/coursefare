import { Router } from "express";
import NotificationService from "../services/NotificationService.js";
import SSE from "../core/SSE.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    if (limit > 100) {
      return res.status(400).json({ status: 400, error: "limit cannot be exceded" });
    }
    const fetch = await NotificationService.getNotification(req.user.userId, page, limit);
    if (!fetch) {
      return res.status(200).json({ status: 200, error: fetch });
    }
    return res.status(200).json({ status: 200, data: fetch });
  } catch (error) {
    return res.status(404).json({
      status: 404,
      error: error,
    });
  }
});

router.post("/create", async (req, res) => {
  try {
    const userId = req.user.userId;
    const { message, type, link } = req.body;
    const created = await NotificationService.createNotification(
      userId,
      message,
      type,
      false,
      link,
    );
    if (!created) {
      return res.status(400).json({ status: 400, error: created });
    }
    return res.status(201).json({
      status: 201,
      data: created,
    });
  } catch (error) {
    return res.status(400).json({ status: 400, error: error });
  }
});

router.put("/update/:notificationId", async (req, res) => {
  try {
    const { isRead } = req.body;
    const { notificationId } = req.params;
    const updated = await NotificationService.updateNotification(req, notificationId, isRead);
    if (!updated) return res.status(400).json({ status: 400, error: updated });
    return res.status(202).json({
      status: 201,
      data: updated,
    });
  } catch (error) {
    return res.status(404).json({
      status: 404,
      error: error,
    });
  }
});

router.delete("/delete", async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notifyId } = req.query;
    const deleted = await NotificationService.deleteNotification(
      req,
      notifyId == null ? userId : null,
      notifyId != null ? notifyId : null,
    );
    return res.status(204).json({
      status: 204,
      deleted,
    });
  } catch (error) {
    return res.status(404).json({
      status: 404,
      error: error,
    });
  }
});

router.get("/stream", (req, res) => {
  const userId = req.user.userId;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  SSE.addClients(userId, res);
  console.log(`User ${userId} connected to SSE`);

  const heartbeat = setInterval(() => {
    res.write("data:\n\n");
  }, 20000);

  req.on("close", () => {
    clearInterval(heartbeat);
    SSE.clients.delete(userId);
    console.log(`User ${userId} disconnected`);
  });
});

export default router;
