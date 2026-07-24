import { ENVIRONMENT, GRP_DEV_PERSONNUMBER, GRP_DISPLAY_NAME, GRP_SERVICE_ID } from '@/config';
import { SignDto, SignMandateDto } from '@/dtos/sign.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';

import {
  GrpCancelRequest,
  GrpCancelResponse,
  GrpCollectRequest,
  GrpCollectResponse,
  GrpInitiateBody,
  GrpInitiateParameters,
  GrpInitiateResponse,
  GrpInitiateResponseWithStartTime,
  GrpStatus,
  GrpSubjectIdentifierType,
} from '@/interfaces/grp.interface';
import { SignMandateCache } from '@/interfaces/mandates.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { Sign, SignApiResponse, SignCollectApiResponse } from '@/responses/grp.response';
import { ApiResponse } from '@/interfaces/service';
import GrpApiService from '@/services/grp-api.service';
import { QRGenerator } from '@/services/qr-code-generator.service';
import { handleSignCache } from '@/utils/handleSignCache';
import { logger } from '@/utils/logger';
import { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { Body, Controller, Get, Param, Post, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

// Safely read an optional `details` field off an unknown thrown value for logging.
const getErrorDetails = (error: unknown): unknown =>
  typeof error === 'object' && error !== null && 'details' in error ? (error as { details: unknown }).details : undefined;

@Controller()
@UseBefore(authMiddleware)
export class SignController {
  private readonly apiService = new GrpApiService();
  private readonly qrService = new QRGenerator();

  private readonly initiateSign = async (req: RequestWithUser, userMessage: GrpInitiateBody['userMessage']): Promise<Sign> => {
    const endUserInfo = req.ip;
    const { personNumber } = req.user;
    const transactionId = randomUUID();
    const params: GrpInitiateParameters = {
      endUserInfo: endUserInfo ?? '',
      serviceId: GRP_SERVICE_ID ?? '',
      displayName: GRP_DISPLAY_NAME ?? '',
      provider: 'bankid',
      requestType: 'SIGN',
      transactionId,
    };
    const data: GrpInitiateBody = {
      subjectIdentifier: {
        value: (ENVIRONMENT === 'TEST' ? GRP_DEV_PERSONNUMBER : personNumber) ?? '',
        type: GrpSubjectIdentifierType.Tin,
      },
      userMessage,
    };

    try {
      const response = await this.apiService.post<GrpInitiateResponse, GrpInitiateBody>({
        url: 'init',
        data,
        params,
      });

      const cacheHandler = handleSignCache(req);
      const startTime = Date.now();
      cacheHandler.set('pending', response.transactionId, { ...response, startTime });

      const qrCode = this.qrService.createQRData({ ...response, startTime }) ?? undefined;
      return { transactionId: response.transactionId, autoStartToken: response.autoStartToken, qrCode };
    } catch (error) {
      logger.error('Error initiating sign', error);
      throw error;
    }
  };

  @Post('/sign')
  @OpenAPI({ summary: 'Initiate BankID signing process' })
  @ResponseSchema(SignApiResponse)
  async sign(@Req() req: RequestWithUser, @Body() body: SignDto, @Res() res: Response<SignApiResponse>): Promise<Response<SignApiResponse>> {
    const { details, ...rest } = body;

    try {
      const cacheHandler = handleSignCache(req);
      const response = await this.initiateSign(req, rest);
      if (details) {
        cacheHandler.set('details', response.transactionId, details);
      }

      return res.send({ message: 'success', data: response });
    } catch (error) {
      logger.error('message', getErrorDetails(error));
      throw new HttpException(500, 'Failed to initiate BankID signing process');
    }
  }

  @Post('/sign/mandate')
  @OpenAPI({ summary: 'Initiate BankID signing process for mandate' })
  @ResponseSchema(SignApiResponse)
  async signMandate(
    @Req() req: RequestWithUser,
    @Body() body: SignMandateDto,
    @Res() res: Response<SignApiResponse>,
  ): Promise<Response<SignApiResponse>> {
    const { mandate, ...rest } = body;
    const grantorId = req.session.representing?.BUSINESS?.partyId;
    if (!grantorId) {
      throw new HttpException(400, 'Not representing an organization');
    }
    if (!mandate) {
      throw new HttpException(400, 'Missing mandate details');
    }
    try {
      const cacheHandler = handleSignCache(req);
      const response = await this.initiateSign(req, rest);

      cacheHandler.set<SignMandateCache>('mandates', response.transactionId, { ...mandate, grantorId });

      return res.send({ message: 'success', data: response });
    } catch (error) {
      logger.error('message', getErrorDetails(error));
      throw new HttpException(500, 'Failed to initiate BankID signing process');
    }
  }

  @Post('/sign/cancel/:transactionId')
  @OpenAPI({ summary: 'Cancel an initiated BankID signing process' })
  async cancel(
    @Req() req: RequestWithUser,
    @Param('transactionId') transactionId: string,
    @Res() res: Response<ApiResponse<null>>,
  ): Promise<Response<ApiResponse<null>>> {
    const cacheHandler = handleSignCache(req);
    try {
      const sign = cacheHandler.get<GrpInitiateResponseWithStartTime>('pending', transactionId);
      if (!sign) {
        throw new HttpException(404, 'No pending BankID signing process found');
      }
      await this.apiService.post<GrpCancelResponse, GrpCancelRequest>({
        url: 'cancel',
        data: { transactionId, refId: sign.refId },
      });
      cacheHandler.remove('pending', transactionId);
      cacheHandler.remove('details', transactionId);

      return res.send({ message: 'success', data: null });
    } catch (error) {
      logger.error('message', getErrorDetails(error));
      throw new HttpException(500, 'Failed to cancel BankID signing process');
    }
  }

  @Get('/sign/:transactionId')
  @OpenAPI({ summary: 'Get BankID signing. If not completed, returns status.' })
  @ResponseSchema(SignCollectApiResponse)
  async check(
    @Req() req: RequestWithUser,
    @Param('transactionId') transactionId: string,
    @Res() res: Response<SignCollectApiResponse>,
  ): Promise<Response<SignCollectApiResponse>> {
    try {
      const cacheHandler = handleSignCache(req);
      const sign = cacheHandler.get<GrpInitiateResponseWithStartTime>('pending', transactionId);
      if (!sign) {
        throw new HttpException(404, 'No pending BankID signing process found');
      }
      const params: GrpCollectRequest = {
        transactionId,
        refId: sign.refId,
      };
      const result = await this.apiService.get<GrpCollectResponse>({
        url: 'collect',
        params,
      });
      let qrCode: string | undefined = undefined;

      if (result.progressStatus.status === GrpStatus.Pending) {
        qrCode = this.qrService.createQRData(sign) ?? undefined;
      } else if (result.progressStatus.status === GrpStatus.Complete) {
        cacheHandler.set('completed', transactionId, { ...result, refId: sign.refId });
        cacheHandler.remove('pending', transactionId);
      } else {
        cacheHandler.remove('pending', transactionId);
        cacheHandler.remove('details', transactionId);
      }

      return res.send({ message: 'success', data: { transactionId: result.transactionId, progressStatus: result.progressStatus, qrCode } });
    } catch (error) {
      logger.error('Failed to get BankID signing process', error);
      throw new HttpException(500, 'Failed to get BankID signing process');
    }
  }
}
