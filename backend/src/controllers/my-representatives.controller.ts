import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Engagement } from '@/data-contracts/businessengagements/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponse } from '@/interfaces/service';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller()
export class MyRepresentativesController {
  /** ! Currently not included in server.ts, MyRepresentatives api Currently not working as intended */
  private apiService = new ApiService();
  private apiBase = getApiBase('myrepresentatives');

  @Get('/myrepresentatives')
  @OpenAPI({ summary: 'Return a list of business representatives for current logged in user' })
  @UseBefore(authMiddleware)
  async myAuthorities(@Req() req: RequestWithUser): Promise<ApiResponse<Engagement[]>> {
    const { partyId } = req?.user;

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/authorities`;
    const params = {
      'authorityAcquirer.type': 'pnr',
      'authorityAcquirer.partyId': partyId,
    };

    const res = await this.apiService.get<any>({ url, params });

    if (Array.isArray(res.data.authorities) && res.data.authorities.length < 1) {
      throw new HttpException(404, 'Not Found');
    }

    // engagementStructure
    const returnData: Engagement[] = res.data.authorities.map(mandate => ({
      organizationId: mandate.authorityIssuer.partyId,
      organizationName: mandate.authorityIssuer.name,
      organizationNumber: mandate.authorityIssuer.legalId,
    }));

    return { data: returnData, message: 'success' };
  }
}
