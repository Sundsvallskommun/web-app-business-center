import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { BusinessEngagement } from '@/interfaces/business-engagement';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, QueryParam, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

interface ResponseData {
  data: any[];
  message: string;
}

interface InformationResponseData {
  data: any;
  message: string;
}

@Controller()
export class BusinessEngagementController {
  private apiService = new ApiService();

  @Get('/businessengagements')
  @OpenAPI({ summary: 'Return a list of business engagements for current logged in user' })
  @UseBefore(authMiddleware)
  async businessEngagments(@Req() req: RequestWithUser): Promise<ResponseData> {
    const { guid, name } = req?.user;
    const url = `businessengagements/1.2/engagements/${guid}`;
    const params = {
      personalName: name,
      serviceName: 'Mina Sidor',
    };

    const res = await this.apiService.get<any>({ url, params });

    if (!res.data.engagements) {
      throw new HttpException(404, 'Not Found');
    }

    // NOTE: set representing to session so we can use it to lookup later
    req.session.representingChoices = res.data && res.data.engagements ? res.data.engagements : [];

    return { data: res.data, message: 'success' };
  }

  @Get('/businessinformation')
  @OpenAPI({ summary: 'Return businessinformation for current representing organisation' })
  @UseBefore(authMiddleware)
  async businessInformation(@Req() req: RequestWithUser, @QueryParam('engagement') engagement: BusinessEngagement): Promise<InformationResponseData> {
    if (!engagement) {
      throw new HttpException(400, 'Bad Request - No choices');
    }
    if (!engagement) {
      throw new HttpException(400, 'Bad Request - Does not exists');
    }

    if (!engagement.organizationId || !engagement.organizationName || !engagement.organizationNumber) {
      throw new HttpException(500, 'Internal Server Error - Data not complete');
    }

    const url = `businessengagements/1.2/information/${engagement.organizationId}`;
    const params = {
      organizationName: engagement.organizationName,
      serviceName: 'Mina Sidor',
    };

    const res = await this.apiService.get<any>({ url, params });

    if (!res.data) {
      throw new HttpException(404, 'Not Found');
    }

    const responseData = {
      information: {
        companyLocation: res.data.companyLocation,
      },
    };

    return { data: responseData, message: 'success' };
  }
}
