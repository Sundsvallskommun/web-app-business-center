import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Decision } from '@/data-contracts/case-data/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { toCompositeId } from '@/interfaces/document.interface';
import { User } from '@/interfaces/users.interface';
import ApiService from '@/services/api.service';
import { getDecisionAttachmentAsBase64 } from '@/services/casedata-attachment.service';
import { findOwnedDecisionAttachment, isFinalDecision, resolveDecisionNamespaces } from '@/services/decision.service';
import { logger } from '@/utils/logger';
import { DocumentSourceAdapter, DocumentSourceContext, DocumentSourceResult, SourceDecision } from './document-source';

/**
 * casedata as a decision source.
 *
 * casedata has no assets, only decisions on the party's errands. The final ones are emitted as
 * decisions keyed by their errand id, which is what the aggregator matches against the errands a
 * document is linked from. Decisions on errands that never produced a visible asset end up in the
 * unlinked list.
 */

const SOURCE = 'CASEDATA' as const;

const defaultApi = new ApiService();

interface PageDecision {
  totalElements?: number;
  totalPages?: number;
  content?: Decision[];
}

/**
 * The party scoped decision listing from casedata, across all namespaces.
 *
 * @returns the raw decisions, or an empty list when the upstream answers 404
 * @throws `HttpException` 500 when the upstream answers without a body; other upstream errors are rethrown
 */
export const fetchPartyDecisions = async (
  partyId: string,
  user: User,
  signal?: AbortSignal,
  api: Pick<ApiService, 'get'> = defaultApi,
): Promise<Decision[]> => {
  const url = `${getApiBase('case-data')}/${MUNICIPALITY_ID}/errands/${partyId}/decisions?sort=decisions.decidedAt,desc`;
  const params = {
    page: 0,
    size: 100,
  };

  try {
    const res = await api.get<PageDecision>({ url, signal, params }, user);

    if (!res.data) {
      throw new HttpException(500, 'No data from API');
    }

    return res.data.content ?? [];
  } catch (error) {
    if ((error as { status?: number })?.status === 404) {
      return [];
    }
    throw error;
  }
};

/** Only decisions with an id can be keyed and downloaded, so the rest are not emitted. */
const hasId = (decision: Decision): decision is Decision & { id: number } => Number.isInteger(decision.id);

export const toDecisionItem = (decision: Decision & { id: number }): SourceDecision => ({
  id: toCompositeId(SOURCE, decision.id),
  source: SOURCE,
  // Relation source ids are strings, so the errand id is keyed as one.
  matchKey: decision.errandId !== undefined ? String(decision.errandId) : undefined,
  outcome: decision.decisionOutcome,
  decidedAt: decision.decidedAt,
  validFrom: decision.validFrom,
  validTo: decision.validTo,
  errandId: decision.errandId,
  errandNumber: decision.errandNumber,
  attachments:
    decision.attachments
      ?.filter(attachment => !!attachment.id && !!attachment.name)
      ?.map(attachment => ({
        id: attachment.id as number,
        name: attachment.name as string,
        mimeType: attachment.mimeType,
        extension: attachment.extension,
      })) ?? [],
});

const fetch = async (ctx: DocumentSourceContext): Promise<DocumentSourceResult> => {
  const decisions = await fetchPartyDecisions(ctx.partyId, ctx.user, ctx.signal);

  return { documents: [], decisions: decisions.filter(isFinalDecision).filter(hasId).map(toDecisionItem) };
};

const toInteger = (value: string): number | undefined => (/^\d+$/.test(value) ? Number(value) : undefined);

/**
 * The attachment endpoint upstream is keyed only by ids, so a manipulated id could otherwise reach
 * another party's file. The party scoped listing is re-read and the attachment is only fetched when
 * the decision belongs to the party and the attachment sits on it. The errand id and namespace used
 * upstream come from that verified decision, never from the request.
 */
const fetchDecisionAttachment = async (decisionNativeId: string, attachmentId: string, ctx: DocumentSourceContext): Promise<string | null> => {
  const decisionId = toInteger(decisionNativeId);
  const attachmentIdNumber = toInteger(attachmentId);
  if (decisionId === undefined || attachmentIdNumber === undefined) {
    return null;
  }

  const decisions = await fetchPartyDecisions(ctx.partyId, ctx.user, ctx.signal).catch(() => [] as Decision[]);
  const owned = findOwnedDecisionAttachment(decisions, decisionId, attachmentIdNumber);
  if (!owned) {
    return null;
  }

  for (const namespace of resolveDecisionNamespaces(owned.decision, owned.attachment)) {
    const base64 = await getDecisionAttachmentAsBase64(namespace, owned.errandId, decisionId, attachmentIdNumber, ctx.user);

    if (base64) {
      return base64;
    }
  }

  logger.error(`Decision attachment ${attachmentIdNumber} on decision ${decisionId} could not be fetched from any known namespace`);
  return null;
};

export const casedataSource: DocumentSourceAdapter = {
  source: SOURCE,
  fetch,
  fetchDecisionAttachment,
};
