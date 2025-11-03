import { Worker, Queue } from "bullmq";
import EmailService from "./EmailService.js";
import RedisService from "./RedisService.js";

class WorkerService {
  static instance;
  constructor() {
    if (WorkerService.instance) {
      return WorkerService.instance;
    }
    this.connection = RedisService.getConection();
    this.emailQueue = new Queue("email-queue", { connection: this.connection });
    WorkerService.instance = this;
  }

  getEmailQueue() {
    return this.emailQueue;
  }

  startEmailWorker() {
    const worker = new Worker(
      "email-queue",
      async (job) => {
        await EmailService.SendEmail(job.data.to, job.data.subject, job.data.template);
      },
      { connection: this.connection },
    );

    worker.on("completed", (job) => {
      console.log(`Email sent to ${job.data.to}`);
    });

    worker.on("failed", (job, err) => {
      console.error(`Failed to send email to ${job.data.to}:`, err);
    });
  }
}

export default new WorkerService();
