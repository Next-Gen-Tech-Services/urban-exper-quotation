export const titleCase = (string) => {
  const temp = string.trim().split(" ");
  const result = temp.map((ele) => {
    return ele.charAt(0).toUpperCase() + ele.slice(1).toLowerCase();
  });
  return result.join(" ");
};

export const removeNullAndUndefined = (obj) => {
  for (let prop in obj) {
    if (obj[prop] === null || obj[prop] === undefined || obj[prop] === "") {
      delete obj[prop];
    }
  }
  return obj;
};

export const validateEmail = (email) => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email)) return false;
  const tld = email.split(".").pop().toLowerCase();

  const validTLDs = [
    "com",
    "net",
    "org",
    "edu",
    "gov",
    "mil",
    "int",
    "io",
    "co",
    "us",
    "uk",
    "in",
    "ca",
    "de",
    "jp",
    "fr",
    "au",
    "ru",
    "ch",
    "it",
    "nl",
    "se",
    "no",
    "es",
  ];

  return validTLDs.includes(tld);
};

export const validateMobileNumber = (number) => {
  const cleanNumber = number.toString().replace(/\D/g, "");
  if (cleanNumber.length === 10) {
    return /^[6-9]\d{2}[1-9]\d{6}$/.test(cleanNumber);
  }
  return false;
};

export const isNumeric = (number) => {
  return /^\d+$/.test(number);
};

export const parseDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const day = String(now.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateRandomString = (n) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < n; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const getClientIp = (req) => {
  // Handle proxies
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();

  if (req.ip) return req.ip;

  return req.connection?.remoteAddress || "unknown";
};

export const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const formatTime = (seconds = 0) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return `${h > 0 ? h + " hr " : ""}${m > 0 ? m + " min " : ""}${s} sec`.trim();
};

import crypto from "crypto";

export const generateHdfcOrderId = (orderId) => {
  // Convert numeric orderId to a random hash base (to avoid sequential pattern)
  const randomPart = crypto
    .createHash("sha1")
    .update(orderId.toString() + Date.now().toString())
    .digest("hex")
    .slice(0, 10)
    .toUpperCase();

  const finalOrderId = `ORD${randomPart}`;

  return finalOrderId.substring(0, 20);
};

export const parseLectureDateTime = (lectureDate, lectureStartTime) => {
  const dateStr = `${lectureDate} ${lectureStartTime}`;
  const dt = new Date(dateStr);

  if (isNaN(dt.getTime())) {
    console.error("Invalid date/time:", dateStr);
    return null;
  }

  return dt;
};


