import admin from "firebase-admin";
import log from "../configs/logger.config.js";

import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("./firebaseServiceAccount.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;

export const verifyFirebaseToken = async (token) => {
  try {
    if (!token) return false;

    const decoded = await admin.auth().verifyIdToken(token);

    const { uid, email, name, picture } = decoded;

    if (!uid || !email) return false;

    return { uid, email, name, picture };
  } catch (error) {
    log.error("Firebase token verification failed:", error.message);
    return false;
  }
};
