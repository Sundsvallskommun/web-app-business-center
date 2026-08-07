import { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';

const errorMiddleware = (error: HttpException | MulterError, req: Request, res: Response, next: NextFunction) => {
  try {
    // A MulterError means the request violated an upload limit (file count,
    // file size, parts); that is a client error, not a server fault.
    const status: number = error instanceof MulterError ? 400 : error.status || 500;
    const message: string = error.message || 'Something went wrong';
    const validationErrors = error instanceof MulterError ? undefined : error.errors;
    const errors: string =
      validationErrors && validationErrors.length > 0
        ? JSON.stringify(validationErrors.map(error => ({ property: error.property, constraints: error.constraints })))
        : '';

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
