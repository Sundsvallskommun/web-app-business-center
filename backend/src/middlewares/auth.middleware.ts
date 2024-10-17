import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.isAuthenticated()) {
      next();
    } else {
      if (req.session.messages?.length > 0) {
        next(new HttpException(401, req.session.messages[0]));
      } else {
        next(new HttpException(401, 'Not Authorized'));
      }
    }
  } catch (error) {
    next(new HttpException(401, 'Failed to authorize'));
  }
};

export default authMiddleware;
