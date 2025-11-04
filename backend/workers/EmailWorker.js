import { Worker, Queue } from "bullmq";
import EmailService from "../services/EmailService.js";
import RedisService from "../services/RedisService.js";

class EmailWorker {
  static instance;
  constructor() {
    if (EmailWorker.instance) {
      return WorkerService.instance;
    }
    this.connection = RedisService.getConection();
    this.queueName = "email-queue";
    this.emailQueue = new Queue(this.queueName, { connection: this.connection });
    EmailWorker.instance = this;
  }

  start() {
    const worker = new Worker(
      this.queueName,
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

export default new EmailWorker();
