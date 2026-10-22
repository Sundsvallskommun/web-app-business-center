import { DecisionItem, DocumentItem, SourceStatus } from '@data-contracts/backend/data-contracts';
import { ApiResponse, apiService } from './api-service';

type DocumentSource = DocumentItem['source'];

// Ids on the documents API are composite, `<source key>-<id in that source>`, so a
// document can be addressed regardless of which upstream it came from. Mirrors
// DOCUMENT_SOURCE_KEYS in the backend.
const documentSourceKeys: Record<DocumentSource, string> = {
  PARTYASSETS: 'pa',
  CASEDATA: 'cd',
};

export const toDocumentId = (source: DocumentSource, nativeId: string): string =>
  `${documentSourceKeys[source]}-${nativeId}`;

export const getDecisionAttachment: (decisionId: string, attachmentId: number) => Promise<string | null> = (
  decisionId,
  attachmentId
) =>
  apiService
    .get<ApiResponse<string>>(`/documents/decisions/${decisionId}/attachments/${attachmentId}`)
    .then((res) => res.data.data)
    .catch(() => null);

const decisionOutcomeLabels: Record<string, string> = {
  APPROVAL: 'Bifall',
  REJECTION: 'Avslag',
  DISMISSAL: 'Avvisat',
  CANCELLATION: 'Avskrivning',
};

const getDecisionOutcomeLabel = (outcome?: string): string => {
  if (!outcome) return '';
  return decisionOutcomeLabels[outcome] ?? outcome;
};

export const getDecisionTitle = (decision: DecisionItem, defaultTitle: string): string => {
  if (decision.title) return decision.title;
  const outcome = getDecisionOutcomeLabel(decision.outcome);
  return outcome ? `${defaultTitle} - ${outcome}` : defaultTitle;
};

export const getUnavailableSources = (sources?: SourceStatus[]): string[] =>
  sources?.filter((source) => source.status === 'UNAVAILABLE').map((source) => source.source) ?? [];

const joinList = (items: string[], and: string): string => {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} ${and} ${items.at(-1)}`;
};

export const getSourceUnavailableMessage = (
  sources: string[],
  t: (key: string, options?: Record<string, unknown>) => string
): string => {
  const labels = sources.map((source) => t(`decisions:sources.${source}`, { defaultValue: '' }));
  if (labels.length === 0 || labels.some((label) => !label)) {
    return t('decisions:sourceUnavailable');
  }
  const list = joinList(labels, t('decisions:and'));
  return t('decisions:sourceUnavailableNamed', { sources: list.charAt(0).toUpperCase() + list.slice(1) });
};
