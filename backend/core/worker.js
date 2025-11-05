import WorkerService from "../WorkerService.js";
import { starter } from "../utils.js";

async function StartWorker() {
  try {
    await starter();
    WorkerService.startAll();
    console.log("Worker is Ready to accept connection");
  } catch {
    process.exit(1);
  }
}

StartWorker();
