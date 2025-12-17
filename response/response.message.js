export const RESPONSE_MESSAGES = {
  REQUIRED: (field) => `${field} is required`,
  INVALID: (field) => `Invalid ${field}`,
  MUST_BE_STRING: (field) => `${field} must be a string`,
  ARRAY_REQUIRED: (field) => `${field} must be an array`,
  MIN_LENGTH: (field, len) => `${field} must be at least ${len} characters`,
  INVALID_OPTION: (field) => `Invalid value for ${field}`,

  NOT_FOUND: (field) => `${field} not found`,

  // Authentication
  UNAUTHORIZED: "Unauthorized access",
  TOKEN_MISSING: "Authentication token missing or malformed",
  TOKEN_INVALID: "Invalid or expired token",
  TOKEN_EXPIRED: "Token has expired. Please login again.",
  TOKEN_VERIFIED: "Token verified successfully",
  USER_NOT_FOUND: "User not found",
  LOGIN_SUCCESS: "Login successful",
  SIGNUP_SUCCESS: "User registered successfully",
  WRONG_PASSWORD: "Incorrect password",
  PASSWORD_RESET_SUCCESS: "Password reset successfully",
  OTP_SENT: "OTP sent successfully",
  OTP_INVALID: "Invalid OTP",
  OTP_EXPIRED: "OTP has expired",
  ACCOUNT_NOT_VERIFIED: "Account not verified",

  // General
  SUCCESS: "Request processed successfully",
  FAIL: "Request failed",
  SERVER_ERROR: "Internal server error",
  SOMETHING_WENT_WRONG: "Something went wrong",
  ACCESS_DENIED: "Access denied",
  FILE_UPLOAD_SUCCESS: "File uploaded successfully",
  FILE_UPLOAD_FAIL: "File upload failed",

  // Profile
  PROFILE_UPDATED: "Profile updated successfully",
  PROFILE_FOUND: "Profile retrieved successfully",

  // Misc
  ACTION_NOT_ALLOWED: "Action not allowed",
  TOKEN_REQUIRED: "Token is required",

  //rate
  RATE_LIST_FOUND: "Rate list fetched successful",
  ERROR_OCCURED: "Error occured",
  CRN_GENERATED: "CRN generated successful",
};
