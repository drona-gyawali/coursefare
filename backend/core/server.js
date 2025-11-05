import express from "express";
import { env } from "./conf.js";
import cookieParser from "cookie-parser";
import routes from "../routes/index.js";
import { starter } from "../utils.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

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
