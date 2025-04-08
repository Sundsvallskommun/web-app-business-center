import { MUNICIPALITY_ID } from '@/config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { getApiBase } from '@/config/api-config';
import { CasePdfResponse, CaseStatusResponse } from '@/data-contracts/casestatus/data-contracts';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Param, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { RepresentingMode } from '../interfaces/representing.interface';
import { ApiResponse } from '../interfaces/service';
import { formatOrgNr } from '../utils/util';
@Controller()
export class CaseController {
  private apiService = new ApiService();
  private apiBase = getApiBase('casestatus');

  private setBusinesCasesCache(req: RequestWithUser, orgNumber: string, data: CaseStatusResponse[]) {
    if (!req.session.cache) {
      req.session.cache = {
        cases: {},
      };
    }

    if (!req.session.cache.cases.BUSINESS) {
      req.session.cache.cases.BUSINESS = {};
    }

    req.session.cache.cases.BUSINESS[orgNumber] = data;
  }

  private setPrivateCasesCache(req: RequestWithUser, data: CaseStatusResponse[]) {
    if (!req.session.cache) {
      req.session.cache = {
        cases: {},
      };
    }

    req.session.cache.cases.PRIVATE = data;
  }

  @Get('/cases')
  @OpenAPI({ summary: 'Return a list of cases for current logged in user' })
  @UseBefore(authMiddleware)
  async getCases(@Req() req: RequestWithUser): Promise<ApiResponse<CaseStatusResponse[]>> {
    const { representing } = req?.session;

    const controller = new AbortController();
    const { signal } = controller;
    req.on('aborted', () => {
      controller.abort();
      req.destroy();
    });

    if (representing?.mode === RepresentingMode.BUSINESS) {
      if (!representing?.BUSINESS) {
        throw new HttpException(400, 'Bad Request');
      }

      const orgNumber = formatOrgNr(representing.BUSINESS.organizationNumber);

      if (req.session.cache?.cases?.BUSINESS?.[orgNumber]) {
        return { data: req.session.cache.cases.BUSINESS[orgNumber], message: 'success' };
      }

      try {
        const url = `${this.apiBase}/${MUNICIPALITY_ID}/${orgNumber}/statuses`;
        const res = await this.apiService.get<CaseStatusResponse[]>({ url, signal }, req);

        this.setBusinesCasesCache(req, orgNumber, res.data);

        return { data: res.data, message: 'success' };
      } catch (error) {
        if (error.status === 404) {
          this.setBusinesCasesCache(req, orgNumber, []);
          return { data: [], message: '404 from api, Assumed empty array' };
        } else {
          return { data: [], message: 'error' };
        }
      }
    } else {
      if (req.session.cache?.cases?.PRIVATE) {
        return { data: req.session.cache.cases.PRIVATE, message: 'success' };
      }

      try {
        const url = `${this.apiBase}/${MUNICIPALITY_ID}/party/${req.user.partyId}/statuses`;
        const res = await this.apiService.get<CaseStatusResponse[]>({ url, signal }, req);

        this.setPrivateCasesCache(req, res.data);

        return { data: res.data, message: 'success' };
      } catch (error) {
        if (error.status === 404) {
          this.setPrivateCasesCache(req, []);
          return { data: [], message: '404 from api, Assumed empty array' };
        } else {
          return { data: [], message: 'error' };
        }
      }
    }
  }

  @Get('/cases/:caseId')
  @OpenAPI({ summary: 'Return a case' })
  @UseBefore(authMiddleware)
  async getCase(@Req() req: RequestWithUser, @Param('caseId') caseId: string): Promise<ApiResponse<CaseStatusResponse | null>> {
    if (!caseId) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const res = await this.getCases(req);

      if (!res.data) {
        return { data: null, message: 'error' };
      }

      const _case = res.data.find(c => c.caseId === caseId);

      return { data: _case, message: 'success' };
    } catch (error) {
      console.error(error);
      return { data: null, message: 'error' };
    }
  }

  @Get('/casepdf/:externalCaseId')
  @OpenAPI({ summary: 'Return the base64 encoded pdf by case externalCaseId' })
  @UseBefore(authMiddleware)
  async getCasePdf(@Req() req: RequestWithUser, @Param('externalCaseId') externalCaseId: string): Promise<ApiResponse<CasePdfResponse>> {
    if (!externalCaseId) {
      throw new HttpException(400, 'Bad Request');
    }

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/${externalCaseId}/pdf`;
    const res = await this.apiService.get<CasePdfResponse>({ url }, req);

    return { data: res.data, message: 'success' };
  }
}
