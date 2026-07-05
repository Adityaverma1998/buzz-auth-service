import type { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import logger from '../logger.ts';
import { Config } from '../config/index.ts';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err.message || 'Internal Server Error', { error: err });

  const statusCode = err.status || err.statusCode || 500;
  const response: { message: string; stack?: string } = {
    message: err.message || 'Internal Server Error',
  };

  if (Config.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
