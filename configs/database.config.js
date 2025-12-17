import mongoose from "mongoose";
import { MONGO_URI } from "./server.config.js";
mongoose.set("strictQuery", false);
import log from "./logger.config.js";
export const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    log.info(`database connected successfully`);
  } catch (error) {
    log.info(`database connection failed`, error);
  }
};
