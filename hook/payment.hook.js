import {
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_PAYMENTLINK_WEBHOOK_SECRET,
} from "../configs/server.config.js";
import Razorpay from "razorpay";
import crypto from "crypto";

import paymentModel from "../models/payment.model.js";
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});
class PaymentService {
  async generatePaymentLink(amount, name, contact, crn) {
    try {
      if (!amount) {
        return {
          message: "all fields are required",
          status: "fail",
        };
      }

      //contact
      let newContact = (contact = contact.replace(/\s+/g, ""));

      const totalAmount = amount * 100;
      const threeDaysLater = Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60;

      const options = {
        amount: totalAmount,
        currency: "INR",
        accept_partial: false,
        description: "Quotation payment",
        customer: {
          name: name,
          contact: newContact,
        },
        notify: {
          sms: false,
          email: false,
        },
        reminder_enable: true,
        notes: {
          type: "paymentLink",
          crn: crn,
        },
        expire_by: threeDaysLater,
      };

      const paymentLink = await razorpay.paymentLink.create(options);

      const payment = await paymentModel.create({
        paymentId: crypto.randomUUID(),
        contact: crn,
        razorpayOrderId: null,
        razorpayPaymentId: null,
        amount,
        status: "pending",
      });

      return {
        success: true,
        paymentLink: paymentLink.short_url,
      };
    } catch (error) {
      log.error("Error from [PAYMENT]: ", error);
      throw error;
    }
  }

  // async paymentLinkHook(req, res) {
  //   try {
  //     const webhookSignature = req.headers["x-razorpay-signature"];

  //     const requestBody = req.body;

  //     if (!webhookSignature) {
  //       let data = {
  //         message: "signature is missing",
  //         status: "fail",
  //       };
  //       return res.json(data);
  //     }

  //     const expectedSignature = crypto
  //       .createHmac("sha256", RAZORPAY_PAYMENTLINK_WEBHOOK_SECRET)
  //       .update(JSON.stringify(requestBody))
  //       .digest("hex");

  //     if (webhookSignature !== expectedSignature) {
  //       let data = {
  //         message: "Invalid signature",
  //         status: "fail",
  //       };
  //       return res.json(data);
  //     }

  //     const eventType = req.body.event;

  //     if (eventType !== "order.paid") {
  //       let data = {
  //         message: "Ignoring non-captured payment events",
  //         status: "fail",
  //       };
  //       return res.json(data);
  //     }

  //     const paymentData = req.body.payload.payment.entity;
  //     const razorpayPaymentId = paymentData.id;
  //     const notes = paymentData.notes;
  //     const amount = paymentData.amount / 100;
  //     const paymentMethod = paymentData.method;
  //     const crn = notes?.crn;
  //     if (!notes || !notes.crn) {
  //       let data = {
  //         message: "Missing quotation details in notes",
  //         status: "fail",
  //       };
  //       return res.json(data);
  //     }

  //     console.log("paymentData==>", paymentData);

  //     await paymentModel.findOneAndUpdate(
  //       { contact: crn },
  //       {
  //         $set: {
  //           status: "Paid",
  //           razorpayPaymentId,
  //           updatedAt: new Date(),
  //         },
  //       },
  //       { new: true }
  //     );

  //     let data = {
  //       success: true,
  //       message: "Payment verified and recorded successfully",
  //     };
  //     return res.json(data);
  //   } catch (error) {
  //     log.error("Error from [PAYMENT]: ", error);
  //     throw error;
  //   }
  // }

  async paymentLinkHook(req, res) {
    try {
      console.log("dskkjhsfjkhjksahfdkjhasdf");

      const webhookSignature = req.headers["x-razorpay-signature"];
      const requestBody = req.body;

      console.log("requestBody==>", requestBody);

      if (!webhookSignature) {
        return res.status(400).json({
          success: false,
          message: "Signature is missing",
        });
      }
            console.log("webhookSignature==>", webhookSignature);


      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_PAYMENTLINK_WEBHOOK_SECRET)
        .update(JSON.stringify(requestBody))
        .digest("hex");

      if (webhookSignature !== expectedSignature) {
        return res.status(400).json({
          success: false,
          message: "Invalid signature",
        });
      }

          console.log("webhookSignature==>", webhookSignature);

      /* ================= EVENT FILTER ================= */
      const eventType = requestBody.event;

      if (eventType !== "order.paid") {
        // Razorpay retries if non-200
        return res.status(200).json({
          success: true,
          message: "Event ignored",
        });
      }

      /* ================= EXTRACT DATA ================= */
      const paymentData = requestBody.payload?.payment?.entity;
      const orderData = requestBody.payload?.order?.entity;
      console.log("orderData==>", orderData);
      console.log("paymentData==>", paymentData);

      if (!paymentData || !orderData) {
        return res.status(400).json({
          success: false,
          message: "Invalid Razorpay payload",
        });
      }

      if (paymentData.status !== "captured") {
        return res.status(200).json({
          success: true,
          message: "Payment not captured yet",
        });
      }

      const razorpayPaymentId = paymentData.id;
      const razorpayOrderId = orderData.id;
      const amount = paymentData.amount / 100;
      const paymentMethod = paymentData.method;
      const crn = orderData.notes?.crn;

      if (!crn) {
        return res.status(400).json({
          success: false,
          message: "CRN missing in payment notes",
        });
      }

      /* ================= IDEMPOTENCY CHECK ================= */
      const alreadyProcessed = await paymentModel.findOne({
        razorpayPaymentId,
      });

      if (alreadyProcessed) {
        return res.status(200).json({
          success: true,
          message: "Payment already processed",
        });
      }

      /* ================= UPDATE PAYMENT ================= */

      console.log("paymentData==>", crn);

      const updatedPayment = await paymentModel.findOneAndUpdate(
        { contact: crn },
        {
          $set: {
            status: "paid",
            razorpayPaymentId,
            razorpayOrderId,
            amount,
            paymentMethod,
            paidAt: new Date(paymentData.created_at * 1000),
            updatedAt: new Date(),
            gatewayResponse: requestBody, // audit trail
          },
        },
        { new: true }
      );

      if (!updatedPayment) {
        return res.status(404).json({
          success: false,
          message: "Payment record not found for CRN",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Payment verified and updated successfully",
      });
    } catch (error) {
      console.error("Error from [PAYMENT WEBHOOK]:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
export default new PaymentService();
