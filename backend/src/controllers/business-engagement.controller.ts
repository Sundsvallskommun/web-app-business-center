import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { BusinessEngagementsResponse, BusinessInformation, Engagement } from '@/data-contracts/businessengagements/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponse } from '@/interfaces/service';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, QueryParam, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

interface InformationResponse {
  information: {
    companyLocation: BusinessInformation['companyLocation'];
  };
}

@Controller()
export class BusinessEngagementController {
  private apiService = new ApiService();
  private apiBase = getApiBase('businessengagements');

  @Get('/businessengagements')
  @OpenAPI({ summary: 'Return a list of business engagements for current logged in user' })
  @UseBefore(authMiddleware)
  async businessEngagments(@Req() req: RequestWithUser): Promise<ApiResponse<Engagement[]>> {
    const { partyId, name } = req?.user;

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    const controller = new AbortController();
    req.on('aborted', () => {
      controller.abort();
      req.destroy();
    });

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/engagements/${partyId}`;
    const params = {
      personalName: name,
      serviceName: 'Mina Sidor',
    };

    const res = await this.apiService.get<BusinessEngagementsResponse>({ url, params });

    if (!res.data?.engagements) {
      throw new HttpException(404, 'Not Found');
    }

    // NOTE: set representing to session so we can use it to lookup later
    req.session.representingBusinessChoices = res.data && res.data.engagements ? res.data.engagements : [];

    return { data: res.data.engagements, message: 'success' };
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
    if (!engagement) {
      throw new HttpException(400, 'Bad Request - Does not exists');
    }

    if (!engagement.organizationId || !engagement.organizationName || !engagement.organizationNumber) {
      throw new HttpException(500, 'Internal Server Error - Data not complete');
    }

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/information/${engagement.organizationId}`;
    const params = {
      organizationName: engagement.organizationName,
      serviceName: 'Mina Sidor',
    };

    const res = await this.apiService.get<BusinessInformation>({ url, params });

    if (!res.data) {
      throw new HttpException(404, 'Not Found');
    }

    const responseData: InformationResponse = {
      information: {
        companyLocation: res.data.companyLocation,
      },
    };

    return { data: responseData, message: 'success' };
  }
}
