import { AssetWithService } from '@/interfaces/asset.interface';
import { DecisionItem, DocumentItem, DocumentSource, SourceStatus } from '@/interfaces/document.interface';
import { User } from '@/interfaces/users.interface';

export interface DocumentSourceContext {
  partyId: string;
  user: User;
  signal?: AbortSignal;
}

/**
 * A document as an adapter emits it, before it is serialized for the client.
 *
 * `matchKeys` are the ids of the casedata errands linked to the document, as the relations
 * service reports them. A decision whose `matchKey` equals one of them is owned by the document.
 * `asset` is the payload the detail page needs for a partyassets document. Both are stripped by
 * `toClientDocument` and never reach the listing.
 */
export interface SourceDocument extends DocumentItem {
  matchKeys: string[];
  asset?: AssetWithService;
}

/**
 * A decision as an adapter emits it. `matchKey` is the id of the casedata errand the decision was
 * made on, and is stripped by `toClientDecision`. A decision without one can never be owned.
 */
export interface SourceDecision extends DecisionItem {
  matchKey?: string;
}

export interface DocumentSourceResult {
  documents: SourceDocument[];
  decisions: SourceDecision[];
  sources?: SourceStatus[];
}

export interface DocumentSourceAdapter {
  source: DocumentSource;
  fetch(ctx: DocumentSourceContext): Promise<DocumentSourceResult>;
  fetchDecisionAttachment?(decisionNativeId: string, attachmentId: string, ctx: DocumentSourceContext): Promise<string | null>;
}

export const toClientDocument = (document: SourceDocument): DocumentItem => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { matchKeys, asset, ...clientDocument } = document;
  return clientDocument;
};

export const toClientDecision = (decision: SourceDecision): DecisionItem => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { matchKey, ...clientDecision } = decision;
  return clientDecision;
};
