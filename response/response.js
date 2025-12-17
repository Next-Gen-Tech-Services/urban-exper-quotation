import { STATUS_CODES, RESPONSE_STATUS } from "../constants/common.constant.js";

export const sendSuccess = (
  res,
  message,
  statusCode = STATUS_CODES.SUCCESS,
  data = null,
  pagination = null
) => {
  const response = {
    message,
    success: RESPONSE_STATUS.SUCCESS,
  };
  if (data) response.data = data;
  if (pagination) response.pagination = pagination;

  return res.status(statusCode).json(response);
};

export const sendFail = (
  res,
  message,
  statusCode = STATUS_CODES.UNAUTHORIZED
) => {
  return res.status(statusCode).json({
    message,
    success: RESPONSE_STATUS.FAIL,
    data: null,
  });
};
