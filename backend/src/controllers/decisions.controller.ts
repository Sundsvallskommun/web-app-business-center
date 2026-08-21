import { MUNICIPALITY_ID, USE_DECISIONS } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Decision } from '@/data-contracts/case-data/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ClientDecision } from '@/interfaces/decision.interface';
import { ApiResponse } from '@/interfaces/service';
import authMiddleware from '@/middlewares/auth.middleware';
import ApiService from '@/services/api.service';
import { getDecisionAttachmentAsBase64 } from '@/services/casedata-attachment.service';
import { findOwnedDecisionAttachment, isFinalDecision, resolveDecisionNamespaces, toClientDecision } from '@/services/decision.service';
import { getRepresentedPartyId } from '@/utils/getRepresentedPartyId';
import { logger } from '@utils/logger';
import { Controller, Get, Param, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

interface PageDecision {
  totalElements?: number;
  totalPages?: number;
  content?: Decision[];
}

@Controller()
export class DecisionsController {
  private apiService = new ApiService();
  private apiBase = getApiBase('case-data');

  private async fetchPartyDecisions(req: RequestWithUser, partyId: string, signal?: AbortSignal): Promise<Decision[]> {
    const url = `${this.apiBase}/${MUNICIPALITY_ID}/errands/${partyId}/decisions?sort=decisions.decidedAt,desc`;
    const params = {
      page: 0,
      size: 100,
    };
    const res = await this.apiService.get<PageDecision>({ url, signal, params }, req.user);

    if (!res.data) {
      throw new HttpException(500, 'No data from API');
    }

    return res.data.content ?? [];
  }

  @Get('/decisions')
  @OpenAPI({ summary: 'Return a list of decisions for current representing entity' })
  @UseBefore(authMiddleware)
  async getDecisions(@Req() req: RequestWithUser): Promise<ApiResponse<ClientDecision[]>> {
    if (!USE_DECISIONS) {
      return { data: [], message: 'Decisions feature disabled' };
    }

    const { representing } = req.session ?? {};

    const partyId = getRepresentedPartyId(representing, req.user);
    if (!partyId) {
      throw new HttpException(400, 'No representing entity found in session');
    }

    const controller = new AbortController();
    const { signal } = controller;
    req.on('aborted', () => {
      controller.abort();
      req.destroy();
    });

    try {
      const decisions = await this.fetchPartyDecisions(req, partyId, signal);
      const finalDecisions = decisions.filter(isFinalDecision).map(toClientDecision);

      return { data: finalDecisions, message: 'success' };
    } catch (error: any) {
      if (error.status === 404) {
        return { data: [], message: '404 from api, Assumed empty array' };
      } else {
        throw new HttpException(500, 'Something went wrong');
      }
    }
  }

  @Get('/decisions/:decisionId/attachments/:attachmentId')
  @OpenAPI({ summary: 'Return the content of a decision attachment, base64 encoded' })
  @UseBefore(authMiddleware)
  async getDecisionAttachment(
    @Req() req: RequestWithUser,
    @Param('decisionId') decisionId: number,
    @Param('attachmentId') attachmentId: number,
  ): Promise<ApiResponse<string>> {
    if (!USE_DECISIONS) {
      throw new HttpException(404, 'Not found');
    }

    if (!Number.isInteger(decisionId) || !Number.isInteger(attachmentId)) {
      throw new HttpException(400, 'Bad Request');
    }

    const { representing } = req.session ?? {};

    const partyId = getRepresentedPartyId(representing, req.user);
    if (!partyId) {
      throw new HttpException(400, 'No representing entity found in session');
    }

    // The attachment endpoint is keyed only by ids, so a manipulated id could otherwise
    // reach another party's file. Re-read the party scoped listing and verify that the
    // decision belongs to the representing party and that the attachment sits on it.
    // The errand id and namespace used upstream come from that verified decision, never
    // from the request.
    const decisions = await this.fetchPartyDecisions(req, partyId).catch(() => [] as Decision[]);
    const owned = findOwnedDecisionAttachment(decisions, decisionId, attachmentId);
    if (!owned) {
      throw new HttpException(404, 'Attachment not found');
    }

    for (const namespace of resolveDecisionNamespaces(owned.decision, owned.attachment)) {
      const base64 = await getDecisionAttachmentAsBase64(namespace, owned.errandId, decisionId, attachmentId, req.user);

      if (base64) {
        return { data: base64, message: 'success' };
      }
    }

    // Deliberately a 404 rather than the `{ data: null, message: 'success' }` shape used
    // for message attachments, so the client can show an error instead of downloading an
    // empty file.
    logger.error(`Decision attachment ${attachmentId} on decision ${decisionId} could not be fetched from any known namespace`);
    throw new HttpException(404, 'Attachment not found');
  }
}
