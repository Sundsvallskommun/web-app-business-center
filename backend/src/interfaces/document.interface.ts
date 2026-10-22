import { AssetWithService } from '@/interfaces/asset.interface';

/** Upstream systems a document or decision can come from. Extend when a new source is wired in. */
export const DOCUMENT_SOURCES = ['PARTYASSETS', 'CASEDATA'] as const;
export type DocumentSource = (typeof DOCUMENT_SOURCES)[number];
export const DOCUMENT_STATUSES = ['ACTIVE', 'EXPIRED', 'BLOCKED', 'TEMPORARY'] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export interface DecisionAttachment {
  id: number;
  name: string;
  mimeType?: string;
  extension?: string;
}

export interface DecisionItem {
  /** Composite id, `<source key>-<id in that source>`, e.g. `pa-<uuid>` or `cd-123`. Unique across sources. */
  id: string;
  source: DocumentSource;
  title?: string;
  /** Outcome code as the source reports it, e.g. casedata APPROVAL/REJECTION. */
  outcome?: string;
  decidedAt?: string;
  validFrom?: string;
  validTo?: string;
  /** Internal case id in the source, used by the client to link to the case when there is no errand number. */
  errandId?: number;
  /** Human readable case number. Also the key a decision is matched to a document on. */
  errandNumber?: string;
  attachments: DecisionAttachment[];
}

export interface DocumentItem {
  /** Composite id, `<source key>-<id in that source>`, e.g. `pa-<uuid>` or `cd-123`. Unique across sources. */
  id: string;
  source: DocumentSource;
  title: string;
  status?: DocumentStatus;
  issued?: string;
  validTo?: string;
  decisions: DecisionItem[];
}

/** Availability of one upstream, so the client can say that part of the page is missing. */
export interface SourceStatus {
  source: string;
  status: 'OK' | 'UNAVAILABLE';
}

export interface DocumentsOverview {
  documents: DocumentItem[];
  unlinkedDecisions: DecisionItem[];
  sources: SourceStatus[];
}

export interface DocumentDetails extends DocumentItem {
  asset?: AssetWithService;
}

const DOCUMENT_SOURCE_KEYS: Record<DocumentSource, string> = {
  PARTYASSETS: 'pa',
  CASEDATA: 'cd',
};

const ID_SEPARATOR = '-';

export const toCompositeId = (source: DocumentSource, nativeId: string | number): string =>
  `${DOCUMENT_SOURCE_KEYS[source]}${ID_SEPARATOR}${nativeId}`;

const sourceByKey = (key: string): DocumentSource | undefined => DOCUMENT_SOURCES.find(source => DOCUMENT_SOURCE_KEYS[source] === key);

/**
 * Split a composite id back into its source and the id within that source.
 * Returns undefined for ids that do not name a known source, so a guessed id never reaches an upstream.
 */
export const parseCompositeId = (id: string): { source: DocumentSource; nativeId: string } | undefined => {
  const separatorIndex = id?.indexOf(ID_SEPARATOR) ?? -1;
  if (separatorIndex <= 0) return undefined;

  const source = sourceByKey(id.slice(0, separatorIndex));
  const nativeId = id.slice(separatorIndex + 1);
  if (!source || !nativeId) return undefined;

  return { source, nativeId };
};
