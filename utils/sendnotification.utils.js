import admin from "./googleauth.util.js";
import log from "../configs/logger.config.js";
import userDao from "../daos/user.dao.js";
import notificationDao from "../daos/notification.dao.js";
export const sendNotification = async (userId, title, message, data = {}) => {
  try {
    const tokensData = await notificationDao.getTokensByUserId(userId);
    log.info("tokensData==>" + JSON.stringify(tokensData));
    const tokens = tokensData;

    if (!tokens || tokens.length === 0) {
      log.warn(`No active device tokens found for user: ${userId}`);
      return;
    }

    const multicastMessage = {
      notification: { title, body: message },
      data: {
        type: data.type || "info",
      },
      tokens: tokens.map((t) => t?.fcmToken),
    };

    const response = await admin
      .messaging()
      .sendEachForMulticast(multicastMessage);

    if (response?.responses?.length > 0) {
      response.responses.forEach((res, idx) => {
        if (!res.success) {
          const failedToken = tokens[idx]?.deviceToken;
          if (
            res.error?.code === "messaging/registration-token-not-registered" ||
            res.error?.code === "messaging/invalid-argument"
          ) {
            notificationDao.removeToken(failedToken);
            log.warn(`Removed invalid device token: ${failedToken}`);
          }
        }
      });
      log.info(
        `Notification sent successfully to ${response.successCount} devices`
      );
    }

    return response;
  } catch (error) {
    log.error("Error sending notification:", error);
    return false;
  }
};

//saveNotificationOnDatabase
export const saveNotification = async (userId, title, message, data = {}) => {
  try {
    log.info(
      "Saving notification:" +
        JSON.stringify({
          userId,
          title,
          message,
          data,
        })
    );

    // Validate user existence
    let userData = await userDao.getUserById(userId);

    if (!userData) {
      log.warn(`User not found for ID: ${userId}`);
      return false;
    }

    const notificationData = {
      userId,
      title,
      message,
      type: data.type || "info",
      link: data.link || null,
      isRead: false,
    };

    const result = await notificationDao.createNotification(notificationData);

    if (result) {
      log.info("Notification saved successfully");
      return true;
    } else {
      log.error("Failed to save notification");
      return false;
    }
  } catch (error) {
    log.error("Error saving notification:", error);
    throw error;
  }
};
