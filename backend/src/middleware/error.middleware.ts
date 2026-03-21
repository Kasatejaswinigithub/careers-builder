import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { config } from '../config';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message, code: err.code });
    return;
  }
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    res.status(409).json({ message: field + ' already exists', code: 'CONFLICT' });
    return;
  }
  if (err.name === 'ValidationError') {
    res.status(400).json({ message: err.message, code: 'VALIDATION_ERROR' });
    return;
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({ message: 'Invalid or expired token', code: 'UNAUTHORIZED' });
    return;
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ message: config.isDev ? err.message : 'Internal server error' });
}
