import { sendFail, sendSuccess } from "../response/response.js";
import { ROLES, STATUS_CODES } from "../constants/common.constant.js";
import log from "../configs/logger.config.js";
import userDao from "../daos/user.dao.js";
import { compareItems, hashItem } from "../utils/bcrypt.util.js";
import { mapUserResponse } from "../service-helpers/signup.helper.js";
import { signUpValidator } from "../validators/auth.validator.js";
import { RESPONSE_MESSAGES } from "../response/response.message.js";
import { createToken } from "./../utils/token.util.js";

class AuthService {
  async signUpService(req, res) {
    try {
      const { name, email, contact, countryCode, role, password } = req.body;
      log.info("auth : signup request =>" + JSON.stringify(req.body));

      signUpValidator({ name, email, contact, role, password });

      const existingUser = await userDao.getUserByEmailOrContact(
        email,
        contact
      );

      if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
          return sendFail(
            res,
            RESPONSE_MESSAGES.EMAIL_EXISTS,
            STATUS_CODES.CONFLICT
          );
        }
        if (existingUser.contact === contact) {
          return sendFail(
            res,
            RESPONSE_MESSAGES.CONTACT_EXISTS,
            STATUS_CODES.CONFLICT
          );
        }
      }

      const hashedPassword = await hashItem(password);

      const newUser = await userDao.createUser({
        name,
        email: email.toLowerCase(),
        contact,
        countryCode,
        role,
        password: hashedPassword,
      });

      return sendSuccess(
        res,
        RESPONSE_MESSAGES.SIGNUP_SUCCESS,
        STATUS_CODES.SUCCESS,
        {
          user: mapUserResponse(newUser),
        }
      );
    } catch (error) {
      log.error("error from [SIGNUP SERVICE]: ", error);
      return sendFail(
        res,
        error.message || RESPONSE_MESSAGES.SERVER_ERROR,
        error.status || STATUS_CODES.SERVER_ERROR
      );
    }
  }

  async loginService(req, res) {
    try {
      let { email } = req.body;

      log.info("auth : login request =>\n" + JSON.stringify(req.body, null, 2));

      const user = await userDao.getUserByEmail({ email });

      if (!user) {
        return sendFail(
          res,
          RESPONSE_MESSAGES.USER_NOT_FOUND,
          STATUS_CODES.NOT_FOUND
        );
      }

      const token = await createToken(user._id.toString(), user.role);

      return sendSuccess(
        res,
        RESPONSE_MESSAGES.LOGIN_SUCCESS,
        STATUS_CODES.SUCCESS,
        {
          user: mapUserResponse(user),
          token,
        }
      );
    } catch (error) {
      log.error("error from [LOGIN SERVICE]: ", error);
      return sendFail(
        res,
        error.message || RESPONSE_MESSAGES.SERVER_ERROR,
        error.status || STATUS_CODES.SERVER_ERROR
      );
    }
  }
}

export default new AuthService();
