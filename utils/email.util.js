import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import log from "../configs/logger.config.js";
import {
  MAIL_NO_REPLAY,
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USERNAME,
  MAIL_PASSWORD,
} from "../configs/server.config.js";

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT || 465,
  secure: MAIL_PORT == 465, 
  auth: {
    user: MAIL_USERNAME,
    pass: MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  pool: true,
});

export const sendMail = async (email, subject, templateName, templateData) => {
  try {
    // Render EJS template
    const templatePath = path.join(process.cwd(), "email", `${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);

    const attachments = [];
    if (templateData.qrCodeDataURL) {
      const base64Data = templateData.qrCodeDataURL.replace(/^data:image\/png;base64,/, "");
      attachments.push({
        filename: "qr-code.png",
        content: base64Data,
        encoding: "base64",
        cid: "qr-code@para",
      });
    }

    // Send the email
    await transporter.sendMail({
      from: MAIL_NO_REPLAY,
      to: email,
      subject,
      html,
      attachments,
    });

    log.info(`utils : email : Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    log.error(`utils : email : Failed to send email to ${email}:`, error);
    return false;
  }
};
