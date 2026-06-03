import { MUNICIPALITY_ID, USE_DECISIONS } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Decision, DecisionDecisionTypeEnum } from '@/data-contracts/case-data/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponse } from '@/interfaces/service';
import authMiddleware from '@/middlewares/auth.middleware';
import ApiService from '@/services/api.service';
import { getRepresentingPartyId } from '@/utils/getRepresentingPartyId';
import { Controller, Get, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

interface PageDecision {
  totalElements?: number;
  totalPages?: number;
  content?: Decision[];
}

export interface ClientDecision {
  id?: number;
  errandId?: number;
  errandNumber?: string;
  decisionType?: string;
  decisionOutcome?: string;
  description?: string;
  decidedAt?: string;
  validFrom?: string;
  validTo?: string;
  created?: string;
  attachments?: {
    id?: number;
    name?: string;
    file?: string;
  }[];
}

@Controller()
export class DecisionsController {
  private apiService = new ApiService();
  private apiBase = getApiBase('case-data');

  private toClientDecision = (decision: Decision): ClientDecision => {
    return {
      id: decision.id,
      errandId: decision.errandId,
      errandNumber: decision.errandNumber,
      decisionType: decision.decisionType,
      decisionOutcome: decision.decisionOutcome,
      description: decision.description,
      decidedAt: decision.decidedAt,
      validFrom: decision.validFrom,
      validTo: decision.validTo,
      created: decision.created,
      attachments: decision.attachments
        ?.filter(a => a.id && a.name && a.file)
        ?.map(att => {
          return {
            id: att.id,
            name: att.name,
            file: att.file,
          };
        }),
    };
  };

  @Get('/decisions')
  @OpenAPI({ summary: 'Return a list of decisions for current representing entity' })
  @UseBefore(authMiddleware)
  async getDecisions(@Req() req: RequestWithUser): Promise<ApiResponse<ClientDecision[]>> {
    if (!USE_DECISIONS) {
      return { data: [], message: 'Decisions feature disabled' };
    }

    const { representing } = req.session ?? {};

    if (!representing) {
      throw new HttpException(400, 'No representing entity found in session');
    }

    const controller = new AbortController();
    const { signal } = controller;
    req.on('aborted', () => {
      controller.abort();
      req.destroy();
    });

    try {
      const partyId = getRepresentingPartyId(representing);
      const url = `${this.apiBase}/${MUNICIPALITY_ID}/errands/${partyId}/decisions?sort=decisions.decidedAt,desc`;
      const params = {
        page: 0,
        size: 100,
      };
      const res = await this.apiService.get<PageDecision>({ url, signal, params }, req.user);

      if (!res.data) {
        throw new HttpException(500, 'No data from API');
      }

      const decisions = res.data.content ?? [];
      const finalDecisions = decisions.filter(d => d.decisionType === DecisionDecisionTypeEnum.FINAL).map(this.toClientDecision);

      return { data: finalDecisions, message: 'success' };
    } catch (error: any) {
      if (error.status === 404) {
        return { data: [], message: '404 from api, Assumed empty array' };
      } else {
        throw new HttpException(500, 'Something went wrong');
      }
    }
  }
}
