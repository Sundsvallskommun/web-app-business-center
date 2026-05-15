import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';

const stripCrlf = (value: string) => value.replace(/[\r\n]+/g, ' ');

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';
    const errors: string =
      error.errors?.length > 0 ? JSON.stringify(error.errors.map(error => ({ property: error.property, constraints: error.constraints }))) : '';

    const method = stripCrlf(req.method);
    const path = stripCrlf(req.path);
    console.error(`[${method}] ${path} >> StatusCode:: ${status}, Message:: ${message}, Errors:: ${errors}`);
    logger.error(`[${method}] ${path} >> StatusCode:: ${status}, Message:: ${message}, Errors:: ${errors}`);
    res.status(status).json({ message });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
