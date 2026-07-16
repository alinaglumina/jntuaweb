import env from '../config/env.js';
import logger from '../utils/logger.js';
import { fail } from '../utils/ApiResponse.js';

export function notFound(req, res) {
  return fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Map common Mongoose errors to clean client errors instead of 500s.
  if (err.name === 'CastError') { err.statusCode = 400; err.message = `Invalid ${err.path}: ${err.value}`; }
  else if (err.name === 'ValidationError') {
    err.statusCode = 400;
    err.message = Object.values(err.errors)[0]?.message || 'Validation failed';
  } else if (err.code === 11000) {
    err.statusCode = 409;
    err.message = `Duplicate value for ${Object.keys(err.keyValue || {}).join(', ')}`;
  }
  const status = err.statusCode || 500;
  if (status >= 500) logger.error(err.stack || err.message);
  else logger.warn(`${status} ${err.message}`);
  const message = status >= 500 && env.nodeEnv === 'production'
    ? 'Internal server error'
    : err.message;
  return fail(res, message, status, err.details || null);
}
