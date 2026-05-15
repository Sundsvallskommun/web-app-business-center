import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';
    const errors: string =
      error.errors?.length > 0 ? JSON.stringify(error.errors.map(error => ({ property: error.property, constraints: error.constraints }))) : '';

    const method = req.method.replace(/\n|\r/g, '');
    const path = req.path.replace(/\n|\r/g, '');
    const safeMessage = message.replace(/\n|\r/g, '');
    const safeErrors = errors.replace(/\n|\r/g, '');
    console.error(`[${method}] ${path} >> StatusCode:: ${status}, Message:: ${safeMessage}, Errors:: ${safeErrors}`);
    logger.error(`[${method}] ${path} >> StatusCode:: ${status}, Message:: ${safeMessage}, Errors:: ${safeErrors}`);
    res.status(status).json({ message });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
