import { CreateMandateDto } from '@/dtos/mandate.dto';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { SignMandateCache } from '@/interfaces/mandates.interface';
import { handleSignCache } from '@/utils/handleSignCache';
import { logger } from '@/utils/logger';
import { HttpException } from '@exceptions/HttpException';
import { NextFunction, Response } from 'express';

const mandateMiddleware = async (req: RequestWithUser, _res: Response, next: NextFunction) => {
  const body: CreateMandateDto = req.body;
  try {
    const cacheHandler = handleSignCache(req);
    const grantorId = cacheHandler.get<SignMandateCache>('mandates', body.transactionId)?.grantorId;
    if (req.session.representing?.BUSINESS?.partyId === grantorId && req.session.representing?.BUSINESS?.isAuthorizedSignatory) {
      next();
    } else {
      next(new HttpException(403, 'You do not have permission to access this resource.'));
    }
  } catch (error) {
    logger.error('Error checking mandate', error);
    next(new HttpException(403, 'Failed to authorize'));
  }
};

export default mandateMiddleware;
