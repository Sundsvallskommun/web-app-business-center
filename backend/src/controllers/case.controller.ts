import { RequestWithUser } from '@/interfaces/auth.interface';
import { Case, CasePdf } from '@/interfaces/case.interface';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Param, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { HttpException } from '@/exceptions/HttpException';
import { MUNICIPALITY_ID } from '@/config';

interface ResponseData {
  data: Case[] | CasePdf;
  message: string;
}

@Controller()
export class CaseController {
  private apiService = new ApiService();

  @Get('/cases')
  @OpenAPI({ summary: 'Return a list of cases for current logged in user' })
  @UseBefore(authMiddleware)
  async cases(@Req() req: RequestWithUser): Promise<ResponseData> {
    const { organizationNumber } = req?.session?.representing;

    if (!organizationNumber) {
      throw new HttpException(400, 'Bad Request');
    }

    const url = `casestatus/3.0/${MUNICIPALITY_ID}/${organizationNumber}/statuses`;
    const res = await this.apiService.get<Case[]>({ url });

    if (Array.isArray(res.data) && res.data.length < 1) {
      throw new HttpException(404, 'Not Found');
    }

    return { data: res.data, message: 'success' };
  }

  @Get('/casepdf/:id')
  @OpenAPI({ summary: 'Return the base64 encoded pdf by case id' })
  @UseBefore(authMiddleware)
  async casePdf(@Req() req: RequestWithUser, @Param('id') id: string): Promise<ResponseData> {
    if (!id) {
      throw new HttpException(400, 'Bad Request');
    }

    const url = `casestatus/3.0/${MUNICIPALITY_ID}/${id}/pdf`;
    const res = await this.apiService.get<CasePdf>({ url });

    return { data: res.data, message: 'success' };
  }
}
