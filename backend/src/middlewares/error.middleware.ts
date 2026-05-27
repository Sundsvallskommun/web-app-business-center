import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';

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
    res.status(status).json({ message });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
