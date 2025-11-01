// TODO: MIGRATE THIS MODULE TO SERVER.JS

import express from "express";
import { env } from "./backend/core/conf.js";
import cookieParser from "cookie-parser";
import routes from "./backend/routes/index.js";
import { starter } from "./backend/utils.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", routes);

async function StartServer() {
  try {
    await starter();
    app.listen(env.getPort(), () => {
      console.log(`Server started port at ${env.getPort()}`);
    });
  } catch {
    process.exit(1);
  }
}

StartServer();
