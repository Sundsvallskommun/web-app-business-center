import { USE_DECISIONS } from '@/config';
import { DecisionItem, DocumentDetails, DocumentsOverview, parseCompositeId, SourceStatus } from '@/interfaces/document.interface';
import { logger } from '@/utils/logger';
import { casedataSource } from './casedata.source';
import { DocumentSourceAdapter, DocumentSourceContext, SourceDecision, SourceDocument, toClientDecision, toClientDocument } from './document-source';
import { partyassetsSource } from './partyassets.source';

export const getDocumentSources = (): DocumentSourceAdapter[] => [partyassetsSource, ...(USE_DECISIONS ? [casedataSource] : [])];

/**
 * The key a decision and a document are matched on: a casedata errand id. Surrounding whitespace
 * is ignored; empty values never match anything.
 */
export const normalizeMatchKey = (value?: string): string | undefined => {
  const key = value?.trim();
  return key || undefined;
};

const timestamp = (date?: string): number => {
  const time = date ? new Date(date).getTime() : NaN;
  return Number.isNaN(time) ? 0 : time;
};

export const sortDecisions = (decisions: DecisionItem[]): DecisionItem[] =>
  [...decisions].sort((a, b) => timestamp(b.decidedAt) - timestamp(a.decidedAt));

export const sortDocuments = <T extends { issued?: string }>(documents: T[]): T[] =>
  [...documents].sort((a, b) => timestamp(b.issued) - timestamp(a.issued));

/**
 * Attach every decision to the documents that own it.
 *
 * A document owns a decision when one of the document's `matchKeys` equals the decision's
 * `matchKey`, both being casedata errand ids. A decision attaches to every document linked from
 * its errand. Decisions no document owns are returned as unlinked. Match keys are stripped from
 * the decisions on the way out; input arrays are not mutated.
 */
export const groupDecisionsByDocument = (
  documents: SourceDocument[],
  decisions: SourceDecision[],
): { documents: SourceDocument[]; unlinkedDecisions: DecisionItem[] } => {
  const grouped = documents.map(document => ({ ...document, decisions: [...document.decisions] }));

  const ownersByKey = new Map<string, SourceDocument[]>();
  for (const document of grouped) {
    for (const rawKey of document.matchKeys) {
      const key = normalizeMatchKey(rawKey);
      if (!key) continue;
      const owners = ownersByKey.get(key) ?? [];
      if (!owners.includes(document)) {
        ownersByKey.set(key, [...owners, document]);
      }
    }
  }

  const unlinkedDecisions: DecisionItem[] = [];
  for (const decision of decisions) {
    const key = normalizeMatchKey(decision.matchKey);
    const owners = key ? ownersByKey.get(key) : undefined;
    const clientDecision = toClientDecision(decision);

    if (!owners?.length) {
      unlinkedDecisions.push(clientDecision);
      continue;
    }
    for (const owner of owners) {
      owner.decisions.push(clientDecision);
    }
  }

  return {
    documents: grouped.map(document => ({ ...document, decisions: sortDecisions(document.decisions) })),
    unlinkedDecisions,
  };
};

interface CollectedDocuments {
  documents: SourceDocument[];
  unlinkedDecisions: DecisionItem[];
  sources: SourceStatus[];
}

export const collectDocuments = async (
  ctx: DocumentSourceContext,
  adapters: DocumentSourceAdapter[] = getDocumentSources(),
): Promise<CollectedDocuments> => {
  const settled = await Promise.allSettled(adapters.map(adapter => adapter.fetch(ctx)));

  const documents: SourceDocument[] = [];
  const decisions: SourceDecision[] = [];
  const sources: SourceStatus[] = [];

  settled.forEach((result, index) => {
    const { source } = adapters[index];

    if (result.status === 'rejected') {
      logger.error(`Document source ${source} failed: `, result.reason);
      sources.push({ source, status: 'UNAVAILABLE' });
      return;
    }

    documents.push(...result.value.documents);
    decisions.push(...result.value.decisions);
    sources.push(...(result.value.sources ?? [{ source, status: 'OK' }]));
  });

  const grouped = groupDecisionsByDocument(documents, decisions);

  return {
    documents: sortDocuments(grouped.documents),
    unlinkedDecisions: sortDecisions(grouped.unlinkedDecisions),
    sources,
  };
};

export const getDocumentsOverview = async (ctx: DocumentSourceContext, adapters?: DocumentSourceAdapter[]): Promise<DocumentsOverview> => {
  const collected = await collectDocuments(ctx, adapters);

  return {
    documents: collected.documents.map(toClientDocument),
    unlinkedDecisions: collected.unlinkedDecisions,
    sources: collected.sources,
  };
};

export const getDocumentDetails = async (
  id: string,
  ctx: DocumentSourceContext,
  adapters?: DocumentSourceAdapter[],
): Promise<DocumentDetails | undefined> => {
  if (!parseCompositeId(id)) return undefined;

  const collected = await collectDocuments(ctx, adapters);
  const document = collected.documents.find(candidate => candidate.id === id);
  if (!document) return undefined;

  return { ...toClientDocument(document), asset: document.asset };
};

export const getDecisionAttachment = async (
  decisionId: string,
  attachmentId: string,
  ctx: DocumentSourceContext,
  adapters: DocumentSourceAdapter[] = getDocumentSources(),
): Promise<string | null> => {
  const parsed = parseCompositeId(decisionId);
  if (!parsed) return null;

  const adapter = adapters.find(candidate => candidate.source === parsed.source);
  if (!adapter?.fetchDecisionAttachment) return null;

  return adapter.fetchDecisionAttachment(parsed.nativeId, attachmentId, ctx);
};
