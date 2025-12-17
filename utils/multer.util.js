import multer from "multer";
import multerS3 from "multer-s3";
import { s3, DeleteObjectCommand } from "../configs/aws.config.js";
import { AWS_BUCKET_NAME, AWS_URL } from "../configs/server.config.js";
import log from "../configs/logger.config.js";
import path from "path";
import fs from "fs";

// --- Sanitize folder name ---
const sanitizeFolderName = (folder) => {
  if (!folder || folder.trim() === "") {
    throw new Error("Folder name is required");
  }

  return folder.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
};

// --- Upload to AWS S3 ---
const uploadImages = multer({
  storage: multerS3({
    s3: s3,
    bucket: AWS_BUCKET_NAME,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      try {
        const folder = sanitizeFolderName(req?.body?.folderName);
        const newFileName =
          Date.now() + "_" + file.originalname.replace(/\s+/g, "_");
        const fullPath = `${folder}/${newFileName}`;
        cb(null, fullPath);
      } catch (err) {
        cb(err); // multer will pass this error to Express
      }
    },
  }),
});

// --- Delete from S3 ---
const deleteS3 = async (url) => {
  try {
    if (!url) return;

    const key = url.replace(AWS_URL, "");
    const params = { Bucket: AWS_BUCKET_NAME, Key: key };

    await s3.send(new DeleteObjectCommand(params));
    log.info("Image removed successfully from S3");
  } catch (err) {
    log.error("Error deleting image from S3:", err);
  }
};

// --- Local Disk Upload Setup ---
const UPLOADS_DIR = path.resolve("uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const allowedFileTypes = /jpg|jpeg|png|pdf/;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const folder = sanitizeFolderName(req.body.folder);
      const dest = path.join(UPLOADS_DIR, folder);
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const newFileName =
      Date.now() + "_" + file.originalname.replace(/\s+/g, "_");
    cb(null, newFileName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedFileTypes.test(ext)) {
    return cb(new Error("Only JPG, PNG, and PDF files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter,
});

export { uploadImages, deleteS3, upload };
