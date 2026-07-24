import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError';

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err);
  const message = err instanceof Error ? err.message : 'Error interno';
  res.status(500).json({ error: message });
}
