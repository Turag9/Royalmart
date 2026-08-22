/**
 * Builds a middleware that validates `req.body` against the supplied Zod
 * schema and replaces it with the parsed (and stripped) value. Anything not
 * declared in the schema is dropped, which incidentally fixes mass-assignment
 * style bugs when the parsed object is passed to Prisma.
 */
export function validateBody(schema) {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body ?? {});
      next();
    } catch (err) {
      next(err); // ZodError -> errorHandler converts to 400
    }
  };
}

export function validateQuery(schema) {
  return (req, _res, next) => {
    try {
      req.query = schema.parse(req.query ?? {});
      next();
    } catch (err) {
      next(err);
    }
  };
}
