// validators/common.schema.js
export const cityQuerySchema = {
  city: {
    in: ["query"],
    notEmpty: {
      errorMessage: "City is required",
    },
    isString: {
      errorMessage: "City must be a string",
    },
    trim: true,
  },
};

export const weightQuerySchema = {
  weight: {
    in: ["query"],
    notEmpty: {
      errorMessage: "Weight is required",
    },
    isFloat: {
      options: { min: 0.1 },
      errorMessage: "Weight must be a valid number",
    },
  },
};

export const paginationQuerySchema = {
  page: {
    in: ["query"],
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: "Page must be >= 1",
    },
  },
  limit: {
    in: ["query"],
    optional: true,
    isInt: {
      options: { min: 1, max: 100 },
      errorMessage: "Limit must be between 1 and 100",
    },
  },
};
