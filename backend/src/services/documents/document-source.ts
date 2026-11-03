import { AssetWithService } from '@/interfaces/asset.interface';
import { ByggrErrandDetails, DecisionItem, DocumentItem, DocumentSource, SourceStatus } from '@/interfaces/document.interface';
import { RepresentingMode } from '@/interfaces/representing.interface';
import { User } from '@/interfaces/users.interface';

export interface DocumentSourceContext {
  partyId: string;
  /** Legal id (personal or organisation number) of the represented party, for upstreams keyed on it rather than on party id. */
  identifier?: string;
  representingMode?: RepresentingMode;
  user: User;
  signal?: AbortSignal;
}

/**
 * A document as an adapter emits it, before it is serialized for the client.
 *
 * `matchKeys` are the ids of the casedata errands linked to the document, as the relations
 * service reports them. A decision whose `matchKey` equals one of them is owned by the document.
 * `asset` and `byggr` are the payloads the detail page needs for a partyassets and a byggR
 * document respectively. All three are stripped by `toClientDocument` and never reach the listing.
 */
export interface SourceDocument extends DocumentItem {
  matchKeys: string[];
  asset?: AssetWithService;
  byggr?: ByggrErrandDetails;
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
  fetchDetails?(nativeId: string, ctx: DocumentSourceContext): Promise<SourceDocument | undefined>;
  fetchDecisionAttachment?(decisionNativeId: string, attachmentId: string, ctx: DocumentSourceContext): Promise<string | null>;
}

export const toClientDocument = (document: SourceDocument): DocumentItem => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { matchKeys, asset, byggr, ...clientDocument } = document;
  return clientDocument;
};

export const toClientDecision = (decision: SourceDecision): DecisionItem => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { matchKey, ...clientDecision } = decision;
  return clientDecision;
};
