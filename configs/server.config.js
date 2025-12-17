import dotenv from "dotenv";
dotenv.config();

// Basic Server + DB
export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;
export const NODE_ENV = process.env.NODE_ENV;

// Auth
export const JWT_SECRET = process.env.JWT_SECRET;

// CORS / URLs
export const BASE_URL = process.env.BASE_URL;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const IMAGE_URL = process.env.IMAGE_URL;

// Session
export const SESSION_SECRET = process.env.SESSION_SECRET;

// AWS S3
export const AWS_REGION = process.env.AWS_REGION;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
export const AWS_URL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

// Email SMTP
export const MAIL_NO_REPLAY = process.env.MAIL_NO_REPLAY;
export const MAIL_HOST = process.env.MAIL_HOST;
export const MAIL_PORT = process.env.MAIL_PORT;
export const MAIL_USERNAME = process.env.MAIL_USERNAME;
export const MAIL_PASSWORD = process.env.MAIL_PASSWORD;

// Optional common keys
export const API_KEY = process.env.API_KEY;
export const API_MESSAGE = process.env.API_MESSAGE;

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
export const RAZORPAY_PAYMENTLINK_WEBHOOK_SECRET =
  process.env.RAZORPAY_PAYMENTLINK_WEBHOOK_SECRET;
