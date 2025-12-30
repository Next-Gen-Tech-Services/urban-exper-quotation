import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import fs from "fs";
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

export const sendMail = async (
  email,
  subject,
  templateName,
  templateData = {},
  cc = []
) => {
  try {
    console.log("EMAIL--->", email, subject, templateName, templateData);
    // Render EJS template
    const templatePath = path.join(
      process.cwd(),
      "emails",
      `${templateName}.ejs`
    );

    const html = await ejs.renderFile(templatePath, templateData);

    // Attach only PDF (if provided)

    // Send Email
    await transporter.sendMail({
      from: MAIL_NO_REPLAY,
      to: email,
      cc: cc,
      subject,
      html,
      attachments: templateData.quotationUrl
        ? [
            {
              filename: "Quotation.pdf",
              path: templateData.quotationUrl, // S3 URL
            },
          ]
        : [],
    });

    log.info(`utils : email : Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    log.error(`utils : email : Failed to send email to ${email}:`, error);
    return false;
  }
};
