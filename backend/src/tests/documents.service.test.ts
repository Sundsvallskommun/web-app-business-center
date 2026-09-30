import { DocumentSourceAdapter, DocumentSourceContext, SourceDecision, SourceDocument } from '@/services/documents/document-source';
import {
  collectDocuments,
  getDecisionAttachment,
  getDocumentDetails,
  getDocumentsOverview,
  groupDecisionsByDocument,
  normalizeMatchKey,
  sortDecisions,
  sortDocuments,
} from '@/services/documents/documents.service';
import { mockUser } from './helpers/fixtures';

const ctx: DocumentSourceContext = { partyId: 'party-1', user: mockUser };

// Errand ids as the relations service and casedata report them.
const ERRAND_ID = '5115';
const OTHER_ERRAND_ID = '1532';

const document = (overrides: Partial<SourceDocument> = {}): SourceDocument => ({
  id: 'pa-asset-1',
  source: 'PARTYASSETS',
  title: 'Parkeringstillstånd',
  status: 'ACTIVE',
  issued: '2025-01-01',
  decisions: [],
  matchKeys: [ERRAND_ID],
  ...overrides,
});

const decision = (overrides: Partial<SourceDecision> = {}): SourceDecision => ({
  id: 'cd-1',
  source: 'CASEDATA',
  outcome: 'APPROVAL',
  decidedAt: '2025-01-15T10:00:00Z',
  errandId: Number(ERRAND_ID),
  errandNumber: 'PRH-2026-000001',
  matchKey: ERRAND_ID,
  attachments: [],
  ...overrides,
});

const clientDecision = (overrides: Partial<SourceDecision> = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { matchKey, ...rest } = decision(overrides);
  return rest;
};

const adapter = (source: DocumentSourceAdapter['source'], fetch: DocumentSourceAdapter['fetch']): DocumentSourceAdapter => ({ source, fetch });

const documentsOnly = (documents: SourceDocument[]) => adapter('PARTYASSETS', () => Promise.resolve({ documents, decisions: [] }));
const decisionsOnly = (decisions: SourceDecision[]) => adapter('CASEDATA', () => Promise.resolve({ documents: [], decisions }));

describe('documents.service', () => {
  describe('normalizeMatchKey', () => {
    it('ignores surrounding whitespace', () => {
      expect(normalizeMatchKey(`  ${ERRAND_ID} `)).toBe(ERRAND_ID);
    });

    it('never produces a key from an empty value', () => {
      expect(normalizeMatchKey(undefined)).toBeUndefined();
      expect(normalizeMatchKey('')).toBeUndefined();
      expect(normalizeMatchKey('   ')).toBeUndefined();
    });
  });

  describe('groupDecisionsByDocument', () => {
    it('attaches a decision to the document linked from its errand', () => {
      const result = groupDecisionsByDocument([document()], [decision()]);

      expect(result.documents[0].decisions).toEqual([clientDecision()]);
      expect(result.unlinkedDecisions).toEqual([]);
    });

    it('strips the match key from decisions, owned and unlinked alike', () => {
      const result = groupDecisionsByDocument([document()], [decision(), decision({ id: 'cd-2', matchKey: OTHER_ERRAND_ID })]);

      expect(result.documents[0].decisions[0]).not.toHaveProperty('matchKey');
      expect(result.unlinkedDecisions[0]).not.toHaveProperty('matchKey');
    });

    it('lists a decision as unlinked when no document is linked from its errand', () => {
      const result = groupDecisionsByDocument([document()], [decision({ matchKey: OTHER_ERRAND_ID })]);

      expect(result.documents[0].decisions).toEqual([]);
      expect(result.unlinkedDecisions).toEqual([clientDecision({ matchKey: OTHER_ERRAND_ID })]);
    });

    it('owns decisions from every errand the document is linked from', () => {
      const linkedTwice = document({ matchKeys: [ERRAND_ID, OTHER_ERRAND_ID] });

      const result = groupDecisionsByDocument([linkedTwice], [decision(), decision({ id: 'cd-2', matchKey: OTHER_ERRAND_ID })]);

      expect(result.documents[0].decisions.map(d => d.id)).toEqual(['cd-1', 'cd-2']);
      expect(result.unlinkedDecisions).toEqual([]);
    });

    it('does not attach the same decision twice when a key is repeated on a document', () => {
      const result = groupDecisionsByDocument([document({ matchKeys: [ERRAND_ID, ERRAND_ID] })], [decision()]);

      expect(result.documents[0].decisions).toHaveLength(1);
    });

    it('never matches a document without links to a decision without an errand id', () => {
      const result = groupDecisionsByDocument(
        [document({ matchKeys: [] }), document({ id: 'pa-asset-2', matchKeys: [''] })],
        [decision({ matchKey: undefined }), decision({ id: 'cd-2', matchKey: '' })],
      );

      expect(result.documents.every(d => d.decisions.length === 0)).toBe(true);
      expect(result.unlinkedDecisions).toHaveLength(2);
    });

    it('attaches a decision to every document linked from its errand', () => {
      const result = groupDecisionsByDocument([document(), document({ id: 'pa-asset-2' })], [decision()]);

      expect(result.documents.map(d => d.decisions.length)).toEqual([1, 1]);
      expect(result.unlinkedDecisions).toEqual([]);
    });

    it('sorts the decisions under a document newest first', () => {
      const older = decision({ id: 'cd-1', decidedAt: '2024-01-01T00:00:00Z' });
      const newer = decision({ id: 'cd-2', decidedAt: '2025-01-01T00:00:00Z' });

      const result = groupDecisionsByDocument([document()], [older, newer]);

      expect(result.documents[0].decisions.map(d => d.id)).toEqual(['cd-2', 'cd-1']);
    });

    it('does not mutate its input', () => {
      const input = document();
      const inputDecision = decision();

      groupDecisionsByDocument([input], [inputDecision]);

      expect(input.decisions).toEqual([]);
      expect(inputDecision.matchKey).toBe(ERRAND_ID);
    });
  });

  describe('sorting', () => {
    it('orders decisions newest first with undated ones last', () => {
      const sorted = sortDecisions([
        clientDecision({ id: 'a', decidedAt: undefined }),
        clientDecision({ id: 'b', decidedAt: '2024-01-01' }),
        clientDecision({ id: 'c', decidedAt: '2025-01-01' }),
      ]);

      expect(sorted.map(d => d.id)).toEqual(['c', 'b', 'a']);
    });

    it('orders documents newest first with undated ones last', () => {
      const sorted = sortDocuments([
        document({ id: 'a', issued: undefined }),
        document({ id: 'b', issued: '2024-01-01' }),
        document({ id: 'c', issued: '2025-01-01' }),
      ]);

      expect(sorted.map(d => d.id)).toEqual(['c', 'b', 'a']);
    });
  });

  describe('collectDocuments', () => {
    it('merges documents and decisions from separate adapters and reports both as OK', async () => {
      const result = await collectDocuments(ctx, [documentsOnly([document()]), decisionsOnly([decision()])]);

      expect(result.documents).toHaveLength(1);
      expect(result.documents[0].decisions).toHaveLength(1);
      expect(result.unlinkedDecisions).toEqual([]);
      expect(result.sources).toEqual([
        { source: 'PARTYASSETS', status: 'OK' },
        { source: 'CASEDATA', status: 'OK' },
      ]);
    });

    it('keeps the answering adapters when one rejects and reports the failed one as UNAVAILABLE', async () => {
      const failing = adapter('CASEDATA', () => Promise.reject(new Error('upstream down')));

      const result = await collectDocuments(ctx, [documentsOnly([document()]), failing]);

      expect(result.documents).toHaveLength(1);
      expect(result.sources).toEqual([
        { source: 'PARTYASSETS', status: 'OK' },
        { source: 'CASEDATA', status: 'UNAVAILABLE' },
      ]);
    });

    it('lets an adapter report its own fine grained source statuses', async () => {
      const detailed = adapter('CASEDATA', () =>
        Promise.resolve({
          documents: [],
          decisions: [],
          sources: [
            { source: 'CASEDATA/A', status: 'OK' },
            { source: 'CASEDATA/B', status: 'UNAVAILABLE' },
          ],
        }),
      );

      const result = await collectDocuments(ctx, [detailed]);

      expect(result.sources).toEqual([
        { source: 'CASEDATA/A', status: 'OK' },
        { source: 'CASEDATA/B', status: 'UNAVAILABLE' },
      ]);
    });

    it('hands every adapter the same context', async () => {
      const fetch = vi.fn().mockResolvedValue({ documents: [], decisions: [] });

      await collectDocuments(ctx, [adapter('PARTYASSETS', fetch), adapter('CASEDATA', fetch)]);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith(ctx);
    });
  });

  describe('getDocumentsOverview', () => {
    it('strips the match keys and the source payload from the listing', async () => {
      const asset = { id: 'asset-1', assetId: 'PRH-2026-000001' };

      const overview = await getDocumentsOverview(ctx, [documentsOnly([document({ asset })]), decisionsOnly([decision()])]);

      expect(overview.documents[0]).not.toHaveProperty('matchKeys');
      expect(overview.documents[0]).not.toHaveProperty('asset');
      expect(overview.documents[0].decisions[0]).not.toHaveProperty('matchKey');
      expect(overview.documents[0]).toMatchObject({ id: 'pa-asset-1', title: 'Parkeringstillstånd' });
    });
  });

  describe('getDocumentDetails', () => {
    it('returns the document with its decisions and the source payload', async () => {
      const asset = { id: 'asset-1', assetId: 'PRH-2026-000001' };

      const details = await getDocumentDetails('pa-asset-1', ctx, [documentsOnly([document({ asset })]), decisionsOnly([decision()])]);

      expect(details).toMatchObject({ id: 'pa-asset-1', asset });
      expect(details?.decisions).toHaveLength(1);
      expect(details).not.toHaveProperty('matchKeys');
    });

    it('returns undefined for an id the party has no document for', async () => {
      await expect(getDocumentDetails('pa-asset-2', ctx, [documentsOnly([document()])])).resolves.toBeUndefined();
    });

    it('never runs an adapter for an id that names no known source', async () => {
      const fetch = vi.fn();

      await expect(getDocumentDetails('xx-asset-1', ctx, [adapter('PARTYASSETS', fetch)])).resolves.toBeUndefined();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('getDecisionAttachment', () => {
    const attachmentAdapter = (fetchDecisionAttachment: DocumentSourceAdapter['fetchDecisionAttachment']): DocumentSourceAdapter => ({
      ...decisionsOnly([]),
      fetchDecisionAttachment,
    });

    it('dispatches to the adapter the decision came from with the id within that source', async () => {
      const fetchDecisionAttachment = vi.fn().mockResolvedValue('base64');

      await expect(getDecisionAttachment('cd-12', '34', ctx, [attachmentAdapter(fetchDecisionAttachment)])).resolves.toBe('base64');
      expect(fetchDecisionAttachment).toHaveBeenCalledWith('12', '34', ctx);
    });

    it('returns null when the source has no attachments', async () => {
      await expect(getDecisionAttachment('cd-12', '34', ctx, [decisionsOnly([])])).resolves.toBeNull();
    });

    it('returns null for a malformed or unknown id without touching any adapter', async () => {
      const fetchDecisionAttachment = vi.fn();

      await expect(getDecisionAttachment('12', '34', ctx, [attachmentAdapter(fetchDecisionAttachment)])).resolves.toBeNull();
      await expect(getDecisionAttachment('lc-12', '34', ctx, [attachmentAdapter(fetchDecisionAttachment)])).resolves.toBeNull();
      expect(fetchDecisionAttachment).not.toHaveBeenCalled();
    });
  });
});
