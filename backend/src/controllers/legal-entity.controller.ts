import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { PersonEngagement } from '@/data-contracts/legalentity/data-contracts';
import { ClientBusinessInformation } from '@/interfaces/business-engagement';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponse } from '@/interfaces/service';
import { Engagement, getBusinessInformation, mapEngagements } from '@/services/legal-entity.service';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, QueryParam, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

interface InformationResponse {
  information: ClientBusinessInformation;
}

@Controller()
export class LegalEntityController {
  private apiService = new ApiService();
  private apiBase = getApiBase('legalentity');

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

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/engagements/person/${personNumber}`;

    const res = await this.apiService.get<PersonEngagement[]>({ url }, req.user);

    if (!res.data) {
      throw new HttpException(404, 'Not Found');
    }

    const engagements = mapEngagements(res.data);

    // NOTE: set representing to session so we can use it to lookup later
    req.session.representingBusinessChoices = engagements ?? [];

    return { data: engagements, message: 'success' };
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
