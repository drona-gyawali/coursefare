import { Notification } from "../core/schema.js";
import { validateFields } from "../utils.js";

class NotificationRepo {
  constructor() {
    this.model = Notification;
  }

  async createNotification(userId, message, type, isRead, link) {
    try {
      validateFields(userId, message, type, isRead, link);
      const notified = this.model({
        userId,
        message,
        type,
        isRead,
        link,
      });

      await notified.save();
      return notified;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async getNotification(userId, page, limit) {
    try {
      if (limit > 100) {
        throw new Error("Limit exceded");
      }
      const skip = (page - 1) * limit;
      const totalItems = await this.model.countDocuments({ userId: userId });
      const totalPages = Math.ceil(totalItems / limit);
      const fetchNotified = await this.model
        .find({ userId: userId }, { __v: 0 })
        .skip(skip)
        .limit(limit);
      if (!fetchNotified) {
        throw new Error("No notification available");
      }
      const readNotification = [];
      const notReadNotification = [];
      fetchNotified.map((notify) => {
        if (notify.isRead) {
          readNotification.push(notify);
        }

        if (!notify.isRead) {
          notReadNotification.push(notify);
        }
      });
      return {
        readNotification,
        notReadNotification,
        pagination: {
          page,
          limit,
          totalPages,
          totalItems,
        },
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateNotification(notificationId, isRead) {
    try {
      const updatedNotification = await this.model.findByIdAndUpdate(
        { _id: notificationId },
        { isRead },
        { new: true },
      );
      if (!updatedNotification) throw new Error("Notification are not able to updated");
      return updatedNotification;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteNotification(userId = null, NotificationId = null) {
    try {
      if (userId && NotificationId) {
        throw new Error("User cannot input  both at once");
      }
      // only if want to delete all content at once
      if (userId) {
        const deleteAll = await this.model.deleteMany({ userId: userId });
        if (!deleteAll) return false;
        return true;
      }
      // only if want to delete one specific notification
      if (NotificationId) {
        const deleted = await this.model.findByIdAndDelete(NotificationId);
        if (!deleted) return false;
        return true;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default new NotificationRepo();
