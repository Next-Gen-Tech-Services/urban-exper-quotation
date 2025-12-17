import bcrypt from "bcryptjs";
import log from "../configs/logger.config.js";
export const hashItem = async (item) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(item, salt);
  } catch (error) {
    log.error("Error from [Bcrypt HELPER]:", error);
    throw error;
  }
};

export const compareItems = async (item1, item2) => {
  try {
    const result = await bcrypt.compare(item1, item2);
    return result;
  } catch (error) {
    log.error("Error from [Bcrypt HELPER]:", error);
  }
};
