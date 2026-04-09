import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { LegalEntity2, PersonEngagement } from '@/data-contracts/legalentity/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponse } from '@/interfaces/service';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, QueryParam, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

export interface Engagement {
  organizationName?: string;
  organizationNumber?: string;
}

interface InformationResponse {
  information: {
    companyLocation: LegalEntity2;
  };
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

    const engagements: Engagement[] = res.data
      .filter(e => e?.name && e?.organizationNumber)
      .map(e => ({
        organizationName: e?.name,
        organizationNumber: e?.organizationNumber,
      }));

    // NOTE: set representing to session so we can use it to lookup later
    req.session.representingBusinessChoices = engagements ?? [];

    return { data: engagements, message: 'success' };
  }

  async getGuid(organizationNumber: string, user: RequestWithUser['user']): Promise<string> {
    const guidUrl = `${this.apiBase}/${MUNICIPALITY_ID}/${organizationNumber}/guid`;
    const guidRes = await this.apiService.get<string>({ url: guidUrl }, user);

    if (!guidRes.data) {
      throw new HttpException(404, 'Not Found');
    }

    return guidRes.data;
  }

  async getLegalEntity(guid: string, user: RequestWithUser['user']): Promise<LegalEntity2> {
    const url = `${this.apiBase}/${MUNICIPALITY_ID}/${guid}`;
    const res = await this.apiService.get<LegalEntity2>({ url }, user);

    if (!res.data) {
      throw new HttpException(404, 'Not Found');
    }

    return res.data;
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

    const guid = await this.getGuid(engagement.organizationNumber, req.user);
    const legalEntity = await this.getLegalEntity(guid, req.user);

    const responseData: InformationResponse = {
      information: {
        companyLocation: legalEntity ?? null,
      },
    };

    return { data: responseData, message: 'success' };
  }
}
