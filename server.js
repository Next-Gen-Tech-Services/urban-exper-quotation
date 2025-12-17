import express from "express";
import dotenv from "dotenv";
import { PORT } from "./configs/server.config.js";
import cors from "cors";

import {
  MONGO_URI,
  SESSION_SECRET,
  NODE_ENV,
} from "./configs/server.config.js";

import { connectDatabase } from "./configs/database.config.js";
import mongoStore from "connect-mongo";
import session from "express-session";
import log from "./configs/logger.config.js";

import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import { xss } from "express-xss-sanitizer";

import path from "path";
import { fileURLToPath } from "url";

// KEEP ONLY AUTH
import { Auth, Quotation } from "./routes/index.js";

dotenv.config();
const app = express();
connectDatabase();

app.use(cors("*"));

app.post(
  "/api/v1/quotation/payment-link-hook",
  express.raw({ type: "application/json" })
);

app.use(express.json());

app.use(helmet());
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5000,
  message: "Too many requests from this IP, please try again later",
});

app.use(limiter);
app.use(hpp());
app.use(xss());

app.use((req, res, next) => {
  log.info("HTTP " + req.method + " - " + req.url);
  console.log("Headers:", req.headers["content-type"]);
  log.info("body " + " - " + req.body);

  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

// ONLY AUTH ROUTE
app.use("/api/v1/auth", Auth);
app.use("/api/v1/quotation", Quotation);

app.listen(PORT, () => {
  log.info(`Server is running on port ${PORT}`);
});
