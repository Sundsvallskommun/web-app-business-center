import { ClientBusinessInformation } from '@/interfaces/business-engagement';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponse } from '@/interfaces/service';
import { Engagement, getBusinessEngagements, getBusinessInformation, mapEngagements } from '@/services/legal-entity.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, QueryParam, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { logger } from '@/utils/logger';

interface InformationResponse {
  information: ClientBusinessInformation;
}

@Controller()
export class LegalEntityController {
  @Get('/businessengagements')
  @OpenAPI({ summary: 'Return a list of business engagements for current logged in user' })
  @UseBefore(authMiddleware)
  async businessEngagments(@Req() req: RequestWithUser): Promise<ApiResponse<Engagement[]>> {
    const { personNumber } = req?.user;

    if (!personNumber) {
      throw new HttpException(400, 'Bad Request');
    }

    const controller = new AbortController();
    req.on('aborted', () => {
      controller.abort();
      req.destroy();
    });

    try {
      let engagements = req.session.representingBusinessChoices;

      if (!engagements || engagements.length <= 0) {
        const personEngagements = await getBusinessEngagements(req.user);
        if (!personEngagements || personEngagements.length <= 0) {
          throw new HttpException(404, 'Not Found');
        }
        engagements = mapEngagements(personEngagements) ?? [];
      }

      return { data: engagements, message: 'success' };
    } catch (error) {
      logger.error('Error getting business engagements', error);
      throw new HttpException(500, 'Internal server error');
    }
  }

  @Get('/businessinformation')
  @OpenAPI({ summary: 'Return businessinformation for current representing organisation' })
  @UseBefore(authMiddleware)
  async businessInformation(
    @Req() req: RequestWithUser,
    @QueryParam('engagement') engagement: Engagement,
  ): Promise<ApiResponse<InformationResponse>> {
    const controller = new AbortController();
    req.on('aborted', () => {
      controller.abort();
      req.destroy();
    });

    if (!engagement) {
      throw new HttpException(400, 'Bad Request - No choices');
    }

    if (!engagement.organizationName || !engagement.organizationNumber) {
      throw new HttpException(500, 'Internal Server Error - Data not complete');
    }

    const information = await getBusinessInformation(engagement.organizationNumber, req.user);

    return { data: { information }, message: 'success' };
  }
}
