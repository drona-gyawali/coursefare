import { ZodError } from "zod";
import NotificationRepository from "../repository/NotificationRepository.js";
import RedisService from "./RedisService.js";
import { NotificationSchema } from "./validator.js";

class NotificationService {
  async getNotification(userId, page, limit) {
    try {
      const key = `AllNotification:${userId}`;
      const cached = await RedisService.getCache(key);
      if (cached) return { ...cached, cached: true };
      const fetchNotification = await NotificationRepository.getNotification(
        userId.toString(),
        page,
        limit,
      );
      if (!fetchNotification) {
        return { success: false, message: "No Notification Avaliable" };
      }
      await RedisService.setCache(key, fetchNotification);
      return fetchNotification;
    } catch (error) {
      {
        return { success: false, message: JSON.stringify(error) };
      }
    }
  }

  async createNotification(userId, message, type, isRead = false, link) {
    try {
      const validateNotification = NotificationSchema.parse({
        userId,
        message,
        type,
        isRead,
        link,
      });
      const createdNotification = await NotificationRepository.createNotification(
        validateNotification.userId,
        validateNotification.message,
        validateNotification.type,
        validateNotification.isRead,
        validateNotification.link,
      );
      if (!createdNotification) {
        return { success: false, message: "unable to create Notification" };
      }
      await RedisService.delCache(`AllNotification:${userId}*`);
      return createdNotification;
    } catch (error) {
      if (error instanceof ZodError) {
        console.log(error);
        return { success: false, message: JSON.stringify(error) };
      }

      if (error) {
        console.log(error);
        return { success: false, message: JSON.stringify(error) };
      }
    }
  }

  async updateNotification(req, notidicationId, isRead) {
    try {
      const updatedNotification = await NotificationRepository.updateNotification(
        notidicationId,
        isRead,
      );
      if (!updatedNotification) return { success: false, message: "Unable to update Notification" };
      await RedisService.delCache(`AllNotification:${req.user.userId}*`);
      return updatedNotification;
    } catch (error) {
      return { success: false, message: JSON.stringify(error) };
    }
  }

  async deleteNotification(req, userId = null, NotificationId = null) {
    try {
      if (!req.user && req.userId) {
        return { success: false, message: "unauthorized user" };
      }
      const deleted = await NotificationRepository.deleteNotification(userId, NotificationId);
      if (!deleted) {
        return { success: false, message: "unable to delete Notification" };
      }
      await RedisService.delCache(`AllNotification:${req.user.userId}*`);
      return deleted;
    } catch (error) {
      return { success: false, message: JSON.stringify(error) };
    }
  }
}

export default new NotificationService();
