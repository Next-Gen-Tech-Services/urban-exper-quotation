import { logger } from "../utils/logger.util.js";
import dotenv from "dotenv";
dotenv.config();

let log = null;

if (process.env.NODE_ENV === "development") {
  log = logger;
  global.log = log;
}
export default log;
