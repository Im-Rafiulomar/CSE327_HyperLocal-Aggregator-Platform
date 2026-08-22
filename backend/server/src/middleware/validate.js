import { badRequest } from "../utils/errors.js";

/** Validates req.body against a zod schema and replaces it with the parsed value. */
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(badRequest("Validation failed", result.error.flatten().fieldErrors));
  }
  req.body = result.data;
  next();
};

/** Validates req.query against a zod schema. */
export const validateQuery = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return next(badRequest("Invalid query parameters", result.error.flatten().fieldErrors));
  }
  req.validatedQuery = result.data;
  next();
};
