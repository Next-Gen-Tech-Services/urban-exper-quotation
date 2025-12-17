import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/server.config.js";
import log from "../configs/logger.config.js";
export const createToken = async (id, role, deviceId) => {
  try {
    const token = jwt.sign({ id, role, deviceId }, JWT_SECRET, {
      expiresIn: "15d",
    });
    return token;
  } catch (error) {
    log.error("Error from [TOKEN HELPER] : ", error);
    throw error;
  }
};
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return { expired: true };
    }
    return null;
  }
};

export const generateVerificationToken = async (email, role) => {
  try {
    const token = jwt.sign({ email, role }, JWT_SECRET, {
      expiresIn: "10min",
    });
    return token;
  } catch (error) {
    log.error("Error from [TOKEN HELPER] : ", error);
    throw error;
  }
};
