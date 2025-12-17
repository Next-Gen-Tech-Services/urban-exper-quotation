import axios from "axios";
import {
  FAST2SMS_API_KEY,
  FAST_2_SMS_BASE_URL,
  FAST_2_SMS_SENDER_ID,
  FAST2_SMS_MESSAGE_ID,
} from "../configs/server.config.js";
import log from "../configs/logger.config.js";

export const sendContactOTP = async (contact, otp) => {
  try {
    log.info(`Sending OTP to: ${contact}`);

    if (contact.startsWith("+91")) {
      contact = contact.replace("+91", "");
    } else if (contact.startsWith("+")) {
      contact = contact.replace("+", "");
    }

    const payload = {
      route: "dlt",
      sender_id: FAST_2_SMS_SENDER_ID,
      message: FAST2_SMS_MESSAGE_ID,
      variables_values: otp,
      flash: 0,
      numbers: contact,
    };

    const response = await axios.post(FAST_2_SMS_BASE_URL, payload, {
      headers: {
        authorization: FAST2SMS_API_KEY,
        "Content-Type": "application/json",
      },
    });

    log.info("Fast2SMS Response: " + JSON.stringify(response.data));

    if (response.data.return) {
      return response.data.request_id || true;
    } else {
      throw new Error("❌ Fast2SMS OTP sending failed");
    }
  } catch (error) {
    log.error("Fast2SMS Error: " + (error.response?.data || error.message));
    throw error;
  }
};
