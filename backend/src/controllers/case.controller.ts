import { RequestWithUser } from '@/interfaces/auth.interface';
import { Case, CasePdf } from '@/interfaces/case.interface';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Param, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { HttpException } from '@/exceptions/HttpException';
import { formatOrgNr } from '../utils/util';
import { ApiResponse } from '../interfaces/service';

@Controller()
export class CaseController {
  private apiService = new ApiService();

  @Get('/cases')
  @OpenAPI({ summary: 'Return a list of cases for current logged in user' })
  @UseBefore(authMiddleware)
  async cases(@Req() req: RequestWithUser): Promise<ApiResponse<Case[]>> {
    const { organizationNumber } = req?.session?.representing;

    if (!organizationNumber) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const url = `casestatus/2.0/${formatOrgNr(organizationNumber)}/statuses`;
      const res = await this.apiService.get<Case[]>({ url });

      if (Array.isArray(res.data) && res.data.length < 1) {
        return { data: [], message: 'success' };
      }

      return { data: res.data, message: 'success' };
    } catch (error) {
      if (error.status === 404) {
        return { data: [], message: '404 from api, Assumed empty array' };
      } else {
        return { data: [], message: 'error' };
      }
    }
  }

  @Get('/casepdf/:id')
  @OpenAPI({ summary: 'Return the base64 encoded pdf by case id' })
  @UseBefore(authMiddleware)
  async casePdf(@Req() req: RequestWithUser, @Param('id') id: string): Promise<ApiResponse<CasePdf>> {
    if (!id) {
      throw new HttpException(400, 'Bad Request');
    }

    const url = `casestatus/2.0/${id}/pdf`;
    const res = await this.apiService.get<CasePdf>({ url });

    return { data: res.data, message: 'success' };
  }
}
