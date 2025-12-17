import fs from "fs";
import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Directories
const logDir = path.resolve("logs");
const errorDir = path.join(logDir, "error");
const apiDir = path.join(logDir, "api");

// Ensure directories exist
[logDir, errorDir, apiDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Add custom colors
winston.addColors({
  info: "green",
  warn: "yellow",
  error: "red",
  debug: "blue",
});

// Unified log format for both file + console
const unifiedFormat = winston.format.printf(
  ({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}] → ${stack || message}`;
  }
);

// File transport creator
const createTransport = (level, dir, filename) =>
  new DailyRotateFile({
    level,
    filename: path.join(dir, `${filename}-%DATE%.log`),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
    // handleExceptions: level === "error",
  });

// Logger main instance
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    unifiedFormat
  ),
  transports: [
    createTransport("info", apiDir, "api"),
    createTransport("error", errorDir, "error"),
  ],
  exitOnError: false,
});

// Console output for development mode only
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: "HH:mm:ss" }),
        unifiedFormat
      ),
    })
  );
}
