import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from '../errors/ApiError.js';

export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/** Translate known Prisma errors into ApiError so clients get proper 4xx codes. */
function normalizePrismaError(err) {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return err;
  switch (err.code) {
    case 'P2025':
      return ApiError.notFound('Resource not found');
    case 'P2002':
      return ApiError.conflict('Resource already exists');
    case 'P2003':
      return ApiError.badRequest('Related resource not found or still in use');
    default:
      return err;
  }
}

/**
 * Global error handler.
 * - ZodError -> 400 with field-level errors
 * - ApiError / Prisma known errors -> their mapped status
 * - everything else -> 500 (stack is logged, never sent to the client)
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(rawErr, req, res, _next) {
  if (rawErr instanceof ZodError) {
    const errors = rawErr.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    console.warn('[VALIDATION]', { method: req.method, url: req.originalUrl, errors });
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const err = normalizePrismaError(rawErr);
  const status = err.status || err.statusCode || 500;
  const log = { method: req.method, url: req.originalUrl, status, message: err.message };

  if (status >= 500) console.error('[API ERROR]', { ...log, stack: err.stack });
  else console.warn('[API WARN]', log);

  res.status(status).json({
    success: false,
    message: status >= 500 ? 'Internal server error' : err.message || 'Request failed',
  });
}
