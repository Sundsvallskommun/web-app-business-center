import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';

const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (req.isAuthenticated()) {
      next();
    } else {
      if (req.session.messages?.length > 0) {
        next(new HttpException(401, req.session.messages[0]));
      } else {
        next(new HttpException(401, 'NOT_AUTHORIZED'));
      }
    }
  } catch {
    next(new HttpException(401, 'AUTH_FAILED'));
  }
};

export default authMiddleware;
