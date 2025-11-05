import { Worker, Queue } from "bullmq";
import RedisService from "../services/RedisService.js";
import NotificationService from "../services/NotificationService.js";
import SSE from "../core/SSE.js";

class NotificationWorker {
  static instance;
  constructor() {
    if (NotificationWorker.instance) {
      return NotificationWorker.instance;
    }
    this.connection = RedisService.getConection();
    this.QueueName = "notification";
    this.notificationQueue = new Queue(this.QueueName, { connection: this.connection });
    NotificationWorker.instance = this;
  }

  start() {
    const worker = new Worker(
      this.QueueName,
      async (job) => {
        const { userId, message, type, isRead, link } = job.data;
        const notification = await NotificationService.createNotification(
          userId,
          message,
          type,
          isRead,
          link,
        );

        SSE.SendtoUser(userId, {
          id: notification._id,
          message,
          type,
          isRead,
          link,
          createdAt: notification.createdAt,
        });
      },
      { connection: this.connection },
    );
    worker.on("completed", (job) => {
      console.log(`Notification sent to ${job.data.userId} with ${job.data.message}`);
    });

    worker.on("failed", (job, err) => {
      console.error(`Failed to create notification to ${job.data.userId}:`, err);
    });
  }
}

export default new NotificationWorker();
