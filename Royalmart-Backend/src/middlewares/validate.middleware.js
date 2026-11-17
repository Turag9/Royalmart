/**
 * Validates request data against a Zod schema and replaces it with the parsed
 * (stripped) value. Unknown keys are dropped, which prevents mass-assignment
 * when the parsed object is handed to Prisma. ZodError -> error middleware (400).
 */
const validate = (source) => (schema) => (req, _res, next) => {
  try {
    req[source] = schema.parse(req[source] ?? {});
    next();
  } catch (err) {
    next(err);
  }
};

export const validateBody = validate('body');
export const validateQuery = validate('query');
