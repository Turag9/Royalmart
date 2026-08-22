import { ZodError } from 'zod';

/**
 * Centralized error handler.
 *
 * - Zod validation errors -> 400 with field-level message list.
 * - Errors with explicit `.status` -> use that.
 * - Everything else -> 500.
 *
 * Always logs to stderr with method, url, message and stack so production logs
 * are useful. Stack trace is NEVER returned to the client.
 */
export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    const fieldErrors = err.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    console.warn('[VALIDATION]', { method: req.method, url: req.originalUrl, fieldErrors });
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: fieldErrors,
    });
  }

  const status = err.status || err.statusCode || 500;

  // Don't spam the log with expected 4xx (auth/limit) but always log 5xx.
  if (status >= 500) {
    console.error('[API ERROR]', {
      method: req.method,
      url: req.originalUrl,
      status,
      message: err.message,
      stack: err.stack,
    });
  } else {
    console.warn('[API WARN]', {
      method: req.method,
      url: req.originalUrl,
      status,
      message: err.message,
    });
  }

  res.status(status).json({
    success: false,
    message: status >= 500 ? 'Internal server error' : err.message || 'Request failed',
  });
}
