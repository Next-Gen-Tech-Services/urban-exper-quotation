import fetch from "node-fetch";
import { uploadWhiteboardToS3, generateNotesPDF } from "./s3.util.js";
import log from "../configs/logger.config.js";

const HMS_MANAGEMENT_TOKEN = process.env.HMS_MANAGEMENT_TOKEN;

export const processWhiteboardAfterClass = async (roomId, lecture) => {
  try {
    log.info(`🖼️ Fetching whiteboard frames for room: ${roomId}`);

    const response = await fetch(
      `https://api.100ms.live/v2/whiteboards/${roomId}/frames`,
      {
        headers: { Authorization: `Bearer ${HMS_MANAGEMENT_TOKEN}` },
      }
    );

    if (!response.ok) {
      log.warn("⚠️ Could not fetch whiteboard frames from 100ms API.");
      return null;
    }

    const frames = await response.json();

    if (!Array.isArray(frames) || frames.length === 0) {
      log.info("ℹ️ No whiteboard frames found for this room.");
      return null;
    }

    log.info(`📸 Found ${frames.length} whiteboard frames.`);

    // Upload all frames to S3
    const s3Urls = await uploadWhiteboardToS3(frames);

    // Generate notes PDF and upload it
    const pdfUrl = await generateNotesPDF(s3Urls);

    log.info(`📄 Notes PDF uploaded: ${pdfUrl}`);
    return pdfUrl;
  } catch (error) {
    log.error("❌ Error processing whiteboard:", error);
    return null;
  }
};
