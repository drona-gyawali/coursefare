import EmailWorker from "./workers/EmailWorker.js";

class WorkService {
  startAll() {
    EmailWorker.start();
  }

  getQueues() {
    return {
      emailQueue: EmailWorker.emailQueue,
    };
  }
}

export default new WorkService();
