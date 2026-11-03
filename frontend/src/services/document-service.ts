import {
  Asset,
  DecisionItem,
  DocumentDetails,
  DocumentItem,
  SourceStatus,
} from '@data-contracts/backend/data-contracts';
import { ApiResponse, apiService } from './api-service';
import { formatAssetDate, formatAssetValidity } from './asset-service';

type DocumentSource = DocumentItem['source'];
type Translate = (key: string, options?: Record<string, unknown>) => string;

// Ids on the documents API are composite, `<source key>-<id in that source>`, so a
// document can be addressed regardless of which upstream it came from. Mirrors
// DOCUMENT_SOURCE_KEYS in the backend.
const documentSourceKeys: Record<DocumentSource, string> = {
  PARTYASSETS: 'pa',
  CASEDATA: 'cd',
  BYGGR: 'br',
};

export const toDocumentId = (source: DocumentSource, nativeId: string): string =>
  `${documentSourceKeys[source]}-${nativeId}`;

export const getDecisionAttachment: (decisionId: string, attachmentId: number) => Promise<string | null> = (
  decisionId,
  attachmentId
) =>
  apiService
    .get<ApiResponse<string>>(`/documents/decisions/${encodeURIComponent(decisionId)}/attachments/${attachmentId}`)
    .then((res) => res.data.data)
    .catch(() => null);

export const getDocumentSubtitle = (
  document: Pick<DocumentItem, 'source' | 'issued' | 'validTo'>,
  t: Translate
): string => {
  if (document.source === 'BYGGR' && !document.issued) return '';
  return formatAssetValidity(document, t);
};

export interface DocumentFact {
  label: string;
  value: string;
}

export const getDocumentFacts = (
  document: DocumentDetails,
  asset: Pick<Asset, 'assetId'> | undefined,
  t: Translate
): DocumentFact[] => {
  const issued = formatAssetDate(document.issued);
  const facts: { label: string; value?: string }[] =
    document.source === 'BYGGR'
      ? [
          { label: t('decisions:byggr.caseNumber'), value: document.byggr?.caseNumber },
          { label: t('decisions:byggr.propertyDesignation'), value: document.byggr?.propertyDesignation },
          { label: t('decisions:byggr.decided'), value: issued },
        ]
      : [
          { label: t('decisions:asset.cardNumber'), value: asset?.assetId },
          {
            label: t('decisions:asset.validityPeriod'),
            value: document.issued || document.validTo ? formatAssetValidity(document, t) : undefined,
          },
          { label: t('decisions:asset.decided'), value: issued },
        ];

  return facts.filter((fact): fact is DocumentFact => !!fact.value);
};

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
