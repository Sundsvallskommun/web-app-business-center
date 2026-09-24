import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';
import { reportError } from '@utils/error-reporter';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';
    const errors: string =
      error.errors?.length > 0 ? JSON.stringify(error.errors.map(error => ({ property: error.property, constraints: error.constraints }))) : '';

    // Strip CR/LF from user-controlled values to prevent log injection
    const strip = (value: string) => value.replace(/[\r\n]/g, '');
    const logLine = `[${strip(req.method)}] ${strip(req.path)} >> StatusCode:: ${status}, Message:: ${strip(message)}, Errors:: ${strip(errors)}`;
    console.error(logLine);
    logger.error(logLine);

    // Every unhandled controller error funnels through here, which makes this the one
    // place worth notifying from. The call is synchronous, never throws and is a no-op
    // unless a Slack webhook is configured, so the response path is unaffected.
    reportError({
      status,
      message,
      method: req.method,
      path: req.path,
      requestId: typeof req.headers['x-request-id'] === 'string' ? req.headers['x-request-id'] : undefined,
      validationErrors: errors || undefined,
      stack: error.stack,
    });

    res.status(status).json({ message });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
