import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import QRCode from "qrcode";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { AWS_BUCKET_NAME, AWS_REGION } from "../configs/server.config.js";
import { s3 } from "../configs/aws.config.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= TEXT WRAP ================= */
function wrapText(text, font, size, maxWidth) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";

  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* ================= COMPUTE ================= */
function computeQuote(body) {
  let subtotal = 0;

  const breakdown = body.items.map((item) => {
    // ✅ USE PRE-COMPUTED VALUES IF PRESENT
    const qty = item.areaSqFt || 0;
    const rate = item.ratePerSqFt ?? item.rate ?? 0;

    const total = item.amount ?? +(rate * qty).toFixed(2);

    subtotal += total;

    return {
      process: item.process || "Fresh Paint",
      area: item.area || "Interior / Exterior",
      product: item.product,
      qty,
      rate,
      total,
    };
  });

  const discountPercent = body.discountPercent || 0;

  const discountAmount =
    body.discountAmount ?? +((subtotal * discountPercent) / 100).toFixed(2);

  const payable = body.payableAmount ?? +(subtotal - discountAmount).toFixed(2);

  return {
    id: Date.now(),
    date: body.date || new Date().toLocaleDateString("en-GB"),
    city: body.city,
    customer: body.customer,
    breakdown,
    subtotal,
    discountAmount,
    payable,
  };
}

/* ================= PDF ================= */
export const generateQuotationPdf = async (body) => {
  const q = computeQuote(body);

  console.log("q", q);

  const pdfDoc = await PDFDocument.create();

  const PAGE = { w: 595.28, h: 841.89, m: 40 };
  let page = pdfDoc.addPage([PAGE.w, PAGE.h]);
  let y = PAGE.h - PAGE.m;

  const normal = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const ensureSpace = (h = 20) => {
    if (y - h < PAGE.m) {
      page = pdfDoc.addPage([PAGE.w, PAGE.h]);
      y = PAGE.h - PAGE.m;
    }
  };

  const newPage = () => {
    page = pdfDoc.addPage([PAGE.w, PAGE.h]);
    y = PAGE.h - PAGE.m;
  };

  const draw = (t, x, size = 10, f = normal) =>
    page.drawText(String(t), { x, y, size, font: f });

  const hr = () => {
    page.drawLine({
      start: { x: PAGE.m, y },
      end: { x: PAGE.w - PAGE.m, y },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= 14;
  };

  /* ================= LOGO ================= */
  const logoRes = await fetch(
    "https://para-classes-prod.s3.ap-south-1.amazonaws.com/course/1765611412704_urban-experts-logo.jpg"
  );
  const logo = await pdfDoc.embedJpg(
    new Uint8Array(await logoRes.arrayBuffer())
  );
  // page.drawImage(logo, { x: PAGE.m, y: PAGE.h - 80, width: 120, height: 50 });

  const LOGO_WIDTH = 140; // adjust if needed
  const logoDims = logo.scale(LOGO_WIDTH / logo.width);

  page.drawImage(logo, {
    x: PAGE.m,
    y: PAGE.h - PAGE.m - logoDims.height + 40,
    width: logoDims.width,
    height: logoDims.height,
  });

  /* ================= CUSTOMER DETAILS ================= */
  let rx = PAGE.w - PAGE.m - 220;
  let ry = PAGE.h - 30;

  [
    `Date: ${q.date}`,
    `CRN: ${q.customer?.crn || "-"}`,
    `Name: ${q.customer?.name || "-"}`,
    `Contact: ${q.customer?.contact || "-"}`,
  ].forEach((t) => {
    page.drawText(t, { x: rx, y: ry, size: 10, font: normal });
    ry -= 14;
  });

  const addressText = `Address: ${q.customer?.address || "-"}`;
  const addressLines = wrapText(addressText, normal, 10, 200);

  addressLines.forEach((line) => {
    page.drawText(line, {
      x: rx,
      y: ry,
      size: 10,
      font: normal,
    });
    ry -= 14;
  });

  /* ================= TAGLINE ================= */
  y = PAGE.h - 140;
  wrapText(
    "Every paint stroke, in our opinion at UrbanXperts, brings your concept to life. Allow us to add a dash of greatness, quality, and accuracy to your space transformation.",
    italic,
    9,
    PAGE.w - PAGE.m * 2
  ).forEach((l) => {
    draw(l, PAGE.m, 9, italic);
    y -= 12;
  });

  hr();

  /* ================= TABLE ================= */
  const COL = {
    process: PAGE.m,
    area: PAGE.m + 70,
    product: PAGE.m + 190,
    qty: PAGE.m + 360,
    // rate: PAGE.m + 420,
    total: PAGE.m + 480,
  };

  [
    "Process",
    "Area",
    "Product",
    "SqFt",
    //  "Rate",
    "Amount",
  ].forEach((t, i) => draw(t, Object.values(COL)[i], 9, bold));

  y -= 10;
  hr();

  for (const r of q.breakdown) {
    const productLines = wrapText(r.product, normal, 9, 160);
    const rowHeight = Math.max(productLines.length * 12, 14) + 10;
    ensureSpace(rowHeight);

    draw(r.process, COL.process);
    draw(r.area, COL.area);

    productLines.forEach((l, i) =>
      page.drawText(l, {
        x: COL.product,
        y: y - i * 12,
        size: 9,
        font: normal,
      })
    );

    draw(r.qty, COL.qty, 9);
    // draw(r.rate, COL.rate, 9);
    draw(r.total.toFixed(2), COL.total, 9);

    y -= rowHeight;
  }

  y -= 10;
  hr();
  y -= 10;

  /* ================= DESCRIPTION / AMOUNT ================= */
  ensureSpace(160);

  draw("Description", PAGE.m, 11, bold);
  draw("Amount Rs.", PAGE.w - PAGE.m - 90, 11, bold);
  y -= 14;
  hr();

  draw("Total Amount", PAGE.m);
  draw(q.subtotal.toFixed(2), PAGE.w - PAGE.m - 90);
  y -= 14;

  draw("Discount", PAGE.m);
  draw(`- ${q.discountAmount.toFixed(2)}`, PAGE.w - PAGE.m - 90);
  y -= 14;

  // draw("Additional Discount", PAGE.m);
  // draw("0.00", PAGE.w - PAGE.m - 90);
  // y -= 16;

  hr();

  draw("Final Amount Payable", PAGE.m, 12, bold);
  draw(q.payable.toFixed(2), PAGE.w - PAGE.m - 90, 12, bold);
  y -= 30;

  /* ================= PAYMENT LINK (RIGHT COLUMN) ================= */

  const LEFT_X = PAGE.m;
  const RIGHT_X = PAGE.w / 2 + 20; // right vacant area
  const RIGHT_COL_WIDTH = PAGE.w / 2 - PAGE.m - 30;
  if (body.paymentLink) {
    const startY = y; // align with left content start

    let ry = startY;

    // Heading
    page.drawText("Payment Link", {
      x: RIGHT_X,
      y: ry,
      size: 11,
      font: bold,
    });

    ry -= 16;

    // Clickable link (wrapped)
    const linkLines = wrapText(body.paymentLink, normal, 9, RIGHT_COL_WIDTH);

    linkLines.forEach((line) => {
      page.drawText(line, {
        x: RIGHT_X,
        y: ry,
        size: 9,
        font: normal,
        color: rgb(0, 0, 0.8),
        link: body.paymentLink, // ✅ clickable
      });
      ry -= 12;
    });

    ry -= 10;

    // QR Code
    const qrDataUrl = await QRCode.toDataURL(body.paymentLink, {
      margin: 1,
      width: 140,
    });

    const qrBytes = Uint8Array.from(
      Buffer.from(qrDataUrl.split(",")[1], "base64")
    );

    const qrImage = await pdfDoc.embedPng(qrBytes);

    const qrSize = 110;

    page.drawImage(qrImage, {
      x: RIGHT_X + (RIGHT_COL_WIDTH - qrSize) / 2,
      y: ry - qrSize,
      width: qrSize,
      height: qrSize,
    });

    // IMPORTANT: do NOT modify `y`
  }

  /* ================= PROCESS NOTE ================= */
  ensureSpace(120);
  draw("Process Note:", PAGE.m, 11, bold);
  y -= 14;

  draw("Fresh Paint:", PAGE.m + 10, 10, bold);
  y -= 12;
  draw("• 2 coats Putty, 1 coat Primer and 2 coats of Paint", PAGE.m + 20, 9);
  y -= 14;

  draw("Re-Paint:", PAGE.m + 10, 10, bold);
  y -= 12;
  draw(
    "• Touch-up repair, 1 coat Primer(As per Quotation), 2 coats of Paint",
    PAGE.m + 20,
    9
  );
  y -= 20;

  /* ================= PAYMENT TERMS ================= */
  const isBelow1Lakh = q.payable <= 100000;

  draw("Projects Below Rs.1 Lakh Amount (Rs.)", PAGE.m, 11, bold);
  y -= 14;

  if (isBelow1Lakh) {
    draw(
      `• 25%  To book the slot = Rs. ${(q.payable * 0.25).toFixed(0)}`,
      PAGE.m + 10,
      9
    );
    y -= 12;
    draw(
      `• 75%  After completion of work = Rs. ${(q.payable * 0.75).toFixed(0)}`,
      PAGE.m + 10,
      9
    );
  } else {
    draw("• 25%  To book the slot", PAGE.m + 10, 9);
    y -= 12;
    draw("• 75%  After completion of work", PAGE.m + 10, 9);
  }

  y -= 18;

  draw("Projects Above Rs.1 Lakh Amount (Rs.)", PAGE.m, 11, bold);
  y -= 14;

  if (!isBelow1Lakh) {
    draw(
      `• 25%  To book the slot = Rs. ${(q.payable * 0.25).toFixed(0)}`,
      PAGE.m + 10,
      9
    );
    y -= 12;
    draw(
      `• 55%  After half work completion = Rs. ${(q.payable * 0.55).toFixed(
        0
      )}`,
      PAGE.m + 10,
      9
    );
    y -= 12;
    draw(
      `• 20%  After completion of work = Rs. ${(q.payable * 0.2).toFixed(0)}`,
      PAGE.m + 10,
      9
    );
  } else {
    draw("• 25%  To book the slot", PAGE.m + 10, 9);
    y -= 12;
    draw("• 55%  After half work completion", PAGE.m + 10, 9);
    y -= 12;
    draw("• 20%  After completion of work", PAGE.m + 10, 9);
  }

  y -= 20;
  hr();

  draw("Quotation valid for 30 days from issue date", PAGE.m, 9, italic);
  y -= 12;

  /* ================= PAGE 2 ================= */
  newPage();

  draw("Payment Terms and Bank Details", PAGE.m, 12, bold);
  y -= 16;

  const leftStartY = y;

  [
    "• Bank Transfer: Kotak Mahindra Bank, Connaught Place, Delhi",
    "• Account Name: UrbanXperts Home Services Pvt. Ltd.",
    "• Account No: 9554955424",
    "• IFSC: KKBK0004605",
    "• UPI ID: urbanxperts@kotak",
  ].forEach((t) => {
    draw(t, PAGE.m, 9);
    y -= 12;
  });

  const PAYMENT_IMAGE_URL =
    "https://para-classes-prod.s3.ap-south-1.amazonaws.com/user-profile/1766403554661_urban-expert-payment-image.jpg";

  const imageWidth = 120;
  const imageX = PAGE.w - PAGE.m - imageWidth;
  const imageY = leftStartY + 12;

  await drawImageFromUrl(
    PAYMENT_IMAGE_URL,
    imageX,
    imageY,
    imageWidth,
    pdfDoc,
    page
  );

  y -= 16;

  draw("Service Warranty", PAGE.m, 12, bold);
  y -= 14;

  [
    "• 1-year service warranty applicable from the date of project completion.",
    "• Warranty excludes damages due to seepage, leakage, heavy rains,",
    " structural cracks, movers/packers, or physical damages.",
    "• Any rework within the warranty period will be verified by the UrbanXperts",
    "quality team before execution.",
  ].forEach((t) => {
    ensureSpace(14);
    draw(t, PAGE.m, 9);
    y -= 12;
  });

  y -= 16;
  /* ================= PRICING & PAYMENT ================= */
  draw("Pricing & Payment", PAGE.m, 12, bold);
  y -= 14;

  [
    "• All prices quoted are based on defined scope; changes in paint brands,",
    "products, or colors may affect pricing.",
    "• Final payment must be made within 24 hours of work completion.",
    "• Security deposits (refundable or non-refundable) required by society maintenance",
    "are the customer’s responsibility,",
    " including vendor entry procedures.",
  ].forEach((t) => {
    ensureSpace(14);
    draw(t, PAGE.m, 9);
    y -= 12;
  });

  y -= 14;

  draw("Color Policy", PAGE.m, 12, bold);
  y -= 14;

  [
    "• Three wall colors are included free of charge.",
    "• Additional shades will be charged at Rs.500 per shade.",
    "• Once a chosen color code is prepared or applied, it cannot be reversed.",
  ].forEach((t) => {
    draw(t, PAGE.m, 9);
    y -= 12;
  });

  y -= 16;

  draw("Work Scope & Add-ons", PAGE.m, 12, bold);
  y -= 14;

  [
    "• Covering and masking of non-detachable objects is included.",
    "• Undulation or unevenness on walls (structural issues) is not covered under warranty.",
    "• Wallpaper removal will incur additional fees based on market rates.",
    "• Cement plastering or waterproofing, if required, may modify the quoted price and scope of work.",
    "• No sample work will be provided free of cost. If a customer requests a sample, labour and material charges will apply.",
  ].forEach((t) => {
    draw(t, PAGE.m, 9);
    y -= 12;
  });

  ensureSpace(40);
  y -= 14;

  draw(" Customer Support", PAGE.m, 12, bold);
  y -= 14;

  draw(
    "For any concerns during or after project completion, contact us at info@urbanxperts.in or 9554 9554 24.",
    PAGE.m,
    9,
    italic
  );
  y -= 14;

  hr();

  /* ================= SAVE ================= */
  const bytes = await pdfDoc.save();
  const outDir = path.join(__dirname, "../quotes");
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, `quote-${q.id}.pdf`);
  fs.writeFileSync(outPath, bytes);

  const fileName = `quotation_${Date.now()}.pdf`;

  const s3Params = {
    Bucket: AWS_BUCKET_NAME,
    Key: `quotation/${fileName}`,
    Body: bytes,
    ContentType: "application/pdf",
    ACL: "public-read",
  };

  const command = new PutObjectCommand(s3Params);
  const uploadResult = await s3.send(command);

  const fileUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/quotation/${fileName}`;

  console.log("fileUrl===>", fileUrl);

  return { filepath: fileUrl, quoteId: q.id };
};

async function drawImageFromUrl(url, x, y, width, pdfDoc, page) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch payment image");

  const bytes = await res.arrayBuffer();

  let image;
  if (url.endsWith(".png")) {
    image = await pdfDoc.embedPng(bytes);
  } else {
    image = await pdfDoc.embedJpg(bytes);
  }

  const scale = width / image.width;
  const height = image.height * scale;

  page.drawImage(image, {
    x,
    y: y - height,
    width,
    height,
  });

  return height;
}
