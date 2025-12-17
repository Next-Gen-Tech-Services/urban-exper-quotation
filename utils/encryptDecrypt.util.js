import CryptoJS from "crypto-js";
import log from "../configs/logger.config.js";
import { ENDECRYPT_SECRET } from "../configs/server.config.js";

const secretKey = ENDECRYPT_SECRET;

// Encrypt any JavaScript object
export const encryptData = (data) => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  } catch (error) {
    log.info("Error encrypting data: " + error);
    throw error;
  }
};

// Decrypt an encrypted string
export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    log.info("Error decrypting data: " + error);
    throw error;
  }
};
