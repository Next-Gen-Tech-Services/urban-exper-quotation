import express from "express";
const router = express.Router();
import log from "../configs/logger.config.js";
import { sendFail } from "../response/response.js";
import { RESPONSE_MESSAGES } from "../response/response.message.js";
import quotationControllers from "../controllers/quotation.controller.js";
import { STATUS_CODES } from "../constants/common.constant.js";
import { getRateByCityValidator } from "../validators/rate.query.validator.js";
import { validateRequest } from "../middlewares/validate.middleware.js";

router.route("/generate-quotation").post(async (req, res) => {
  try {
    const result = await quotationControllers.createQuotation(req, res);
    return result;
  } catch (error) {
    log.error("Internal Server Error : ", error);

    return sendFail(
      res,
      RESPONSE_MESSAGES.SERVER_ERROR,
      STATUS_CODES.SERVER_ERROR
    );
  }
});

router
  .route("/get-pricing")
  .get(getRateByCityValidator, validateRequest, async (req, res) => {
    try {
      const result = await quotationControllers.getPricing(req, res);
      return result;
    } catch (error) {
      log.error("Internal Server Error : ", error);

      return sendFail(
        res,
        RESPONSE_MESSAGES.SERVER_ERROR,
        STATUS_CODES.SERVER_ERROR
      );
    }
  });

router.route("/generate-crn").post(async (req, res) => {
  try {
    const result = await quotationControllers.generateCRN(req, res);
    return result;
  } catch (error) {
    log.error("Internal Server Error : ", error);

    return sendFail(
      res,
      RESPONSE_MESSAGES.SERVER_ERROR,
      STATUS_CODES.SERVER_ERROR
    );
  }
});

router.route("/payment-link-hook").post(async (req, res) => {
  try {
    const result = await quotationControllers.paymentLinkHook(req, res);
    return result;
  } catch (error) {
    log.error("Internal Server Error : ", error);

    return sendFail(
      res,
      RESPONSE_MESSAGES.SERVER_ERROR,
      STATUS_CODES.SERVER_ERROR
    );
  }
});

//payment/payment-link-hook

export default router;
