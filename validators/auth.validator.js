import { checkSchema } from "express-validator";
import { ROLES } from "../constants/common.constant.js";
import { RESPONSE_MESSAGES } from "../response/response.message.js";

export const signUpValidator = checkSchema({
  name: {
    notEmpty: { errorMessage: RESPONSE_MESSAGES.ALL_FIELDS_REQUIRED },
    isString: { errorMessage: "Name must be a string" },
    trim: true,
  },

  email: {
    notEmpty: { errorMessage: RESPONSE_MESSAGES.EMAIL_REQUIRED },
    isEmail: { errorMessage: RESPONSE_MESSAGES.INVALID_EMAIL },
    trim: true,
    normalizeEmail: true,
  },

  contact: {
    notEmpty: { errorMessage: RESPONSE_MESSAGES.CONTACT_REQUIRED },
    isMobilePhone: {
      options: ["any"],
      errorMessage: RESPONSE_MESSAGES.CONTACT_REQUIRED,
    },
  },

  countryCode: {
    notEmpty: { errorMessage: RESPONSE_MESSAGES.ALL_FIELDS_REQUIRED },
  },

  password: {
    notEmpty: { errorMessage: RESPONSE_MESSAGES.PASSWORD_REQUIRED },
    isLength: {
      options: { min: 6 },
      errorMessage: "Password must be at least 6 characters",
    },
  },

  "address.city": {
    optional: true,
    isString: { errorMessage: "City must be a string" },
  },

  "address.state": {
    optional: true,
    isString: { errorMessage: "State must be a string" },
  },

  "address.pin": {
    optional: true,
    isPostalCode: {
      options: "IN",
      errorMessage: "Invalid pincode",
    },
  },

  hobbies: {
    optional: true,
    isArray: { errorMessage: "Hobbies must be an array" },
  },

  "hobbies.*": {
    optional: true,
    isString: { errorMessage: "Each hobby must be a string" },
  },

  documents: {
    optional: true,
    isArray: { errorMessage: "Documents must be an array" },
  },

  "documents.*.type": {
    notEmpty: { errorMessage: "Document type is required" },
  },

  "documents.*.number": {
    notEmpty: { errorMessage: "Document number is required" },
  },
});

export const loginValidator = checkSchema({
  email: {
    notEmpty: {
      errorMessage: RESPONSE_MESSAGES.REQUIRED("Email"),
    },
    isEmail: {
      errorMessage: RESPONSE_MESSAGES.INVALID("Email"),
    },
  },
});
