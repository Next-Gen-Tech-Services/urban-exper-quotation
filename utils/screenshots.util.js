import AWS from "aws-sdk";
import { PDFDocument } from "pdf-lib";
import fetch from "node-fetch";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET = process.env.AWS_S3_BUCKET;

export const uploadWhiteboardToS3 = async (frames) => {
  const urls = [];

  for (const frame of frames) {
    const imageUrl = frame.url || frame.image_url;
    if (!imageUrl) continue;

    const res = await fetch(imageUrl);
    const buffer = await res.arrayBuffer();
    const key = `whiteboards/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.png`;

    await s3
      .putObject({
        Bucket: BUCKET,
        Key: key,
        Body: Buffer.from(buffer),
        ContentType: "image/png",
      })
      .promise();

    urls.push(
      `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    );
  }

  return urls;
};

export const generateNotesPDF = async (imageUrls) => {
  const pdfDoc = await PDFDocument.create();

  for (const imgUrl of imageUrls) {
    const imgBytes = await fetch(imgUrl).then((res) => res.arrayBuffer());
    const img = await pdfDoc.embedPng(imgBytes);
    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }

  const pdfBytes = await pdfDoc.save();
  const key = `notes/lecture-${Date.now()}.pdf`;

  await s3
    .putObject({
      Bucket: BUCKET,
      Key: key,
      Body: Buffer.from(pdfBytes),
      ContentType: "application/pdf",
    })
    .promise();

  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
