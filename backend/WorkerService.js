import EmailWorker from "./workers/EmailWorker.js";
import NotificationWorker from "./workers/NotificationWorker.js";

class WorkService {
  startAll() {
    EmailWorker.start();
    NotificationWorker.start();
  }

  getQueues() {
    return {
      emailQueue: EmailWorker.emailQueue,
      notificationQueue: NotificationWorker.notificationQueue,
    };
  }
}

export default new WorkService();
