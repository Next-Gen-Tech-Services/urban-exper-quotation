import { validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  log.info("errors =>\n" + JSON.stringify(errors, null, 2));

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      message: err.msg,
    }));

    return res.status(400).json({
      errors: formattedErrors,
      status: false,
    });
  }

  next();
};
