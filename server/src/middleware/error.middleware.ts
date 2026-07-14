import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

// ─── Custom error shape ───────────────────────────────────────────────────────
interface AppError extends Error {
  statusCode?: number;
  code?:       number;
}

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorMiddleware: ErrorRequestHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('❌  Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({ message: err.message });
    return;
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    res.status(400).json({ message: 'Invalid ID format' });
    return;
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    res.status(409).json({ message: 'Duplicate entry — resource already exists' });
    return;
  }

  // Known HTTP errors
  const status = err.statusCode ?? 500;
  res.status(status).json({
    message: err.message ?? 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorMiddleware;
