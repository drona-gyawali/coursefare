import mongoose from "mongoose";
import { env } from "./conf.js";

class Mongoose {
  constructor() {
    this.connectionString = env.getConnectionString();
  }

  async ConnectDb() {
    try {
      await mongoose.connect(this.connectionString);
      console.log("DB connection established");
    } catch (error) {
      console.log("Error Occured", error);
      process.exit(1);
    }
  }
}

export const initDb = new Mongoose();
