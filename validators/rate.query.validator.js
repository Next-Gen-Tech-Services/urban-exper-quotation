import { checkSchema } from "express-validator";
import { cityQuerySchema } from "./common.schema.js";

export const getRateByCityValidator = checkSchema({
  ...cityQuerySchema,
});
