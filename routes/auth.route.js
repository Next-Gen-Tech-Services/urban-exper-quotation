import express from "express";
const router = express.Router();
import log from "../configs/logger.config.js";
import { sendFail } from "../response/response.js";
import { RESPONSE_MESSAGES } from "../response/response.message.js";
import authControllers from "../controllers/auth.controller.js";
import { STATUS_CODES } from "../constants/common.constant.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  loginValidator,
  signUpValidator,
} from "../validators/auth.validator.js";

router
  .route("/sign-up")
  .post(signUpValidator, validateRequest, async (req, res) => {
    try {
      const result = await authControllers.signUp(req, res);
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

router.route("/login").post(async (req, res) => {
  try {
    const result = await authControllers.login(req, res);
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
export default router;
