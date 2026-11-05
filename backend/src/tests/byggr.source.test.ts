import { Decision as ByggrDecision, ErrandDecisions } from '@/data-contracts/byggrintegrator/data-contracts';
import {
  createByggrSource,
  fetchApplicantErrands,
  fetchErrandDecisions,
  fileExtension,
  fileTokenFrom,
  parseDecisionNativeId,
  toDecisionItem,
  toBareDocument,
  toDecisionNativeId,
  toDocument,
} from '@/services/documents/byggr.source';
import { DocumentSourceContext } from '@/services/documents/document-source';
import { mockPersonNumber } from './helpers/constants';
import { mockUser } from './helpers/fixtures';
import { createMockApiService } from './helpers/mockApiService';

const CASE_NUMBER = 'BYGG 2024-000123';
const TOKEN = '0f3b7a2e-5c1d-4e8f-9a6b-2c4d6e8f0a1b';
const FILE_URL = `https://api.example.se/byggrintegrator/2.5/2281/files/4711?token=${TOKEN}`;

const ctx: DocumentSourceContext = { partyId: 'party-1', identifier: mockPersonNumber, user: mockUser };

const decision = (overrides: Partial<ByggrDecision> = {}): ByggrDecision & { id: number } => ({
  id: 101,
  decisionNumber: '§ 12',
  heading: 'Beslut om bygglov',
  decisionDate: '2024-03-01',
  outcome: 'Bifall',
  mainDecision: true,
  instanceType: 'Delegation',
  validUntil: '2029-03-01',
  documents: [{ id: '4711', name: 'Beslut.pdf', type: 'BESLUT', typeDescription: 'Beslut', documentDate: '2024-03-01', url: FILE_URL }],
  ...overrides,
});

const errand = (overrides: Partial<ErrandDecisions> = {}): ErrandDecisions => ({
  caseNumber: CASE_NUMBER,
  description: 'Nybyggnad av garage',
  propertyDesignation: 'SUNDSVALL 1:1',
  decisions: [decision()],
  ...overrides,
});

describe('byggr.source', () => {
  describe('fetchApplicantErrands', () => {
    it('reads the applicant listing and keeps only the case numbers, which are the values', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({
        data: [
          { key: '1', value: CASE_NUMBER },
          { key: '2', value: 'BYGG 2023-000001' },
        ],
        message: 'success',
      });

      await expect(fetchApplicantErrands(mockPersonNumber, mockUser, undefined, api)).resolves.toEqual([CASE_NUMBER, 'BYGG 2023-000001']);
      expect(api.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: expect.stringContaining(`/applicants/${mockPersonNumber}/errands`) }),
        mockUser,
      );
    });

    it('drops blank values and repeats', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({
        data: [{ key: '1', value: ` ${CASE_NUMBER} ` }, { key: '2', value: CASE_NUMBER }, { key: '3' }, { key: '4', value: '' }],
      });

      await expect(fetchApplicantErrands(mockPersonNumber, mockUser, undefined, api)).resolves.toEqual([CASE_NUMBER]);
    });

    it('treats an upstream 404 as no errands', async () => {
      const api = createMockApiService();
      api.get.mockRejectedValue({ status: 404 });

      await expect(fetchApplicantErrands(mockPersonNumber, mockUser, undefined, api)).resolves.toEqual([]);
    });

    it('rethrows other upstream failures', async () => {
      const api = createMockApiService();
      api.get.mockRejectedValue({ status: 500 });

      await expect(fetchApplicantErrands(mockPersonNumber, mockUser, undefined, api)).rejects.toEqual({ status: 500 });
    });
  });

  describe('fetchErrandDecisions', () => {
    it('reads the decisions of one case, scoped to the applicant', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: errand(), message: 'success' });

      await expect(fetchErrandDecisions(mockPersonNumber, CASE_NUMBER, mockUser, undefined, api)).resolves.toEqual(errand());
      expect(api.get).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining(`/applicants/${mockPersonNumber}/errands/decisions`),
          params: { caseNumber: CASE_NUMBER },
        }),
        mockUser,
      );
    });

    it('treats an upstream 404 as no such errand for this applicant', async () => {
      const api = createMockApiService();
      api.get.mockRejectedValue({ status: 404 });

      await expect(fetchErrandDecisions(mockPersonNumber, CASE_NUMBER, mockUser, undefined, api)).resolves.toBeUndefined();
    });
  });

  describe('decision native ids', () => {
    it('round trips an event id and a case number', () => {
      expect(toDecisionNativeId(101, CASE_NUMBER)).toBe(`101:${CASE_NUMBER}`);
      expect(parseDecisionNativeId(toDecisionNativeId(101, CASE_NUMBER))).toEqual({ eventId: 101, caseNumber: CASE_NUMBER });
    });

    it('keeps everything after the first separator as the case number', () => {
      expect(parseDecisionNativeId('101:BYGG 2024:000123')).toEqual({ eventId: 101, caseNumber: 'BYGG 2024:000123' });
    });

    it.each(['', '101', ':BYGG', 'abc:BYGG', '101:'])('rejects %j', nativeId => {
      expect(parseDecisionNativeId(nativeId)).toBeUndefined();
    });
  });

  describe('fileExtension', () => {
    it('reads the lower cased extension off a file name', () => {
      expect(fileExtension('Beslut.PDF')).toBe('pdf');
      expect(fileExtension('ritning.rev2.dwg')).toBe('dwg');
    });

    it('has none for a name without one', () => {
      expect(fileExtension('Beslut')).toBeUndefined();
      expect(fileExtension('.hidden')).toBeUndefined();
      expect(fileExtension('Beslut.')).toBeUndefined();
    });
  });

  describe('fileTokenFrom', () => {
    it('lifts the token out of the download url', () => {
      expect(fileTokenFrom(FILE_URL)).toBe(TOKEN);
    });

    it('has none for a url without a token, a malformed token or no url at all', () => {
      expect(fileTokenFrom('https://api.example.se/files/4711')).toBeUndefined();
      expect(fileTokenFrom('https://api.example.se/files/4711?token=a%20b&x=1')).toBeUndefined();
      expect(fileTokenFrom('not a url')).toBeUndefined();
    });
  });

  describe('toDecisionItem', () => {
    it('projects the decision onto a decision item whose id carries the case number', () => {
      expect(toDecisionItem(decision(), CASE_NUMBER)).toEqual({
        id: `br-101:${CASE_NUMBER}`,
        source: 'BYGGR',
        title: 'Beslut om bygglov',
        outcome: 'Bifall',
        decidedAt: '2024-03-01',
        validTo: '2029-03-01',
        mainDecision: true,
        attachments: [{ id: 4711, name: 'Beslut.pdf', mimeType: 'application/pdf', extension: 'pdf' }],
      });
    });

    it('drops documents that cannot be downloaded or named', () => {
      const item = toDecisionItem(
        decision({ documents: [{ id: '4711', name: 'Beslut.pdf' }, { id: 'abc', name: 'Fel.pdf' }, { name: 'Utan id.pdf' }, { id: '4712' }] }),
        CASE_NUMBER,
      );

      expect(item.attachments.map(attachment => attachment.id)).toEqual([4711]);
    });

    it('leaves the media type open for a file type it does not know', () => {
      const item = toDecisionItem(
        decision({
          documents: [
            { id: '4711', name: 'Ritning.dwg' },
            { id: '4712', name: 'Beslut' },
          ],
        }),
        CASE_NUMBER,
      );

      expect(item.attachments).toEqual([
        { id: 4711, name: 'Ritning.dwg', mimeType: undefined, extension: 'dwg' },
        { id: 4712, name: 'Beslut', mimeType: undefined, extension: undefined },
      ]);
    });

    it('has no title for a blank heading, so the client falls back to its default', () => {
      expect(toDecisionItem(decision({ heading: '  ' }), CASE_NUMBER).title).toBeUndefined();
    });

    it('never emits the decision number or the instance type', () => {
      const item = toDecisionItem(decision(), CASE_NUMBER);

      expect(item).not.toHaveProperty('decisionNumber');
      expect(item).not.toHaveProperty('instanceType');
    });
  });

  describe('toBareDocument', () => {
    it('is titled by its case number, with nothing to show a status or validity from', () => {
      expect(toBareDocument(CASE_NUMBER)).toEqual({
        id: `br-${CASE_NUMBER}`,
        source: 'BYGGR',
        title: CASE_NUMBER,
        decisions: [],
        matchKeys: [],
        byggr: { caseNumber: CASE_NUMBER },
      });
    });
  });

  describe('toDocument', () => {
    it('projects the errand onto a document summarised by its main decision', () => {
      expect(toDocument(CASE_NUMBER, errand())).toMatchObject({
        id: `br-${CASE_NUMBER}`,
        source: 'BYGGR',
        title: 'Nybyggnad av garage',
        status: 'ACTIVE',
        issued: '2024-03-01',
        validTo: '2029-03-01',
        matchKeys: [],
        byggr: { caseNumber: CASE_NUMBER, description: 'Nybyggnad av garage', propertyDesignation: 'SUNDSVALL 1:1' },
      });
      expect(toDocument(CASE_NUMBER, errand()).decisions.map(d => d.id)).toEqual([`br-101:${CASE_NUMBER}`]);
    });

    it('is keyed by the requested case number even if the upstream spells it differently', () => {
      const document = toDocument(CASE_NUMBER, errand({ caseNumber: 'bygg 2024-000123' }));

      expect(document.id).toBe(`br-${CASE_NUMBER}`);
      expect(document.byggr?.caseNumber).toBe(CASE_NUMBER);
    });

    it('falls back to the case number as title when the errand has no description', () => {
      expect(toDocument(CASE_NUMBER, errand({ description: '  ' })).title).toBe(CASE_NUMBER);
      expect(toDocument(CASE_NUMBER, errand({ description: undefined })).byggr?.description).toBeUndefined();
    });

    it('prefers the decision byggR flags as main over a newer one', () => {
      const newer = decision({ id: 102, decisionDate: '2025-01-01', validUntil: undefined, mainDecision: false });
      const main = decision({ id: 101, decisionDate: '2024-03-01', validUntil: '2029-03-01', mainDecision: true });

      expect(toDocument(CASE_NUMBER, errand({ decisions: [newer, main] }))).toMatchObject({ issued: '2024-03-01', validTo: '2029-03-01' });
    });

    it('falls back to the first decision, the newest, when none is flagged as main', () => {
      const newest = decision({ id: 102, decisionDate: '2025-01-01', validUntil: undefined, mainDecision: false });
      const older = decision({ id: 101, decisionDate: '2024-03-01', mainDecision: false });

      expect(toDocument(CASE_NUMBER, errand({ decisions: [newest, older] }))).toMatchObject({
        issued: '2025-01-01',
        validTo: undefined,
        status: 'ACTIVE',
      });
    });

    it('is issued on the newest dated decision when the main decision carries no date', () => {
      const main = decision({ id: 101, decisionDate: undefined, mainDecision: true });
      const older = decision({ id: 102, decisionDate: '2023-01-01', mainDecision: false });
      const newer = decision({ id: 103, decisionDate: '2024-06-01', mainDecision: false });

      expect(toDocument(CASE_NUMBER, errand({ decisions: [main, older, newer] }))).toMatchObject({ issued: '2024-06-01', validTo: '2029-03-01' });
    });

    it('is EXPIRED once the main decision is no longer valid', () => {
      expect(toDocument(CASE_NUMBER, errand({ decisions: [decision({ validUntil: '2020-01-01' })] })).status).toBe('EXPIRED');
    });

    it('has no status, dates or decisions for an errand without decisions', () => {
      expect(toDocument(CASE_NUMBER, errand({ decisions: [] }))).toMatchObject({
        status: undefined,
        issued: undefined,
        validTo: undefined,
        decisions: [],
      });
      expect(toDocument(CASE_NUMBER, errand({ decisions: undefined })).decisions).toEqual([]);
    });

    it('skips decisions without an id, since they cannot be addressed', () => {
      expect(toDocument(CASE_NUMBER, errand({ decisions: [decision({ id: undefined }), decision({ id: 102 })] })).decisions.map(d => d.id)).toEqual([
        `br-102:${CASE_NUMBER}`,
      ]);
    });
  });

  describe('adapter', () => {
    describe('fetch', () => {
      const OTHER_CASE_NUMBER = 'BYGG 2023-000001';
      const errandList = {
        data: [
          { key: '1', value: CASE_NUMBER },
          { key: '2', value: OTHER_CASE_NUMBER },
        ],
      };

      // The errand list is read first, then the decisions of each case; the mock answers by case number.
      const byCaseNumber = (api: ReturnType<typeof createMockApiService>, answers: Record<string, () => Promise<unknown>>) => {
        api.get.mockImplementation((config: { url: string; params?: { caseNumber?: string } }) => {
          if (config.url.endsWith('/errands')) return Promise.resolve(errandList);
          return answers[config.params?.caseNumber ?? '']();
        });
      };

      it('reads the errand list and then the decisions of every errand, and emits one full document per errand', async () => {
        const api = createMockApiService();
        byCaseNumber(api, {
          [CASE_NUMBER]: () => Promise.resolve({ data: errand() }),
          [OTHER_CASE_NUMBER]: () => Promise.resolve({ data: errand({ caseNumber: OTHER_CASE_NUMBER, description: 'Tillbyggnad', decisions: [] }) }),
        });

        const result = await createByggrSource(api).fetch(ctx);

        expect(api.get).toHaveBeenCalledTimes(3);
        expect(result.decisions).toEqual([]);
        expect(result.sources).toEqual([{ source: 'BYGGR', status: 'OK' }]);
        expect(result.documents).toHaveLength(2);
        expect(result.documents[0]).toMatchObject({ id: `br-${CASE_NUMBER}`, title: 'Nybyggnad av garage', status: 'ACTIVE', issued: '2024-03-01' });
        expect(result.documents[0].decisions).toHaveLength(1);
        expect(result.documents[1]).toMatchObject({ id: `br-${OTHER_CASE_NUMBER}`, title: 'Tillbyggnad', status: undefined, decisions: [] });
      });

      it('keeps an errand whose decisions cannot be read as a bare document and reports the source unavailable', async () => {
        const api = createMockApiService();
        byCaseNumber(api, {
          [CASE_NUMBER]: () => Promise.resolve({ data: errand() }),
          [OTHER_CASE_NUMBER]: () => Promise.reject({ status: 500 }),
        });

        const result = await createByggrSource(api).fetch(ctx);

        expect(result.sources).toEqual([{ source: 'BYGGR', status: 'UNAVAILABLE' }]);
        expect(result.documents.map(document => document.title)).toEqual(['Nybyggnad av garage', OTHER_CASE_NUMBER]);
        expect(result.documents[1]).toEqual(toBareDocument(OTHER_CASE_NUMBER));
      });

      it('keeps an errand the decisions endpoint does not know as a bare document without flagging the source', async () => {
        const api = createMockApiService();
        byCaseNumber(api, {
          [CASE_NUMBER]: () => Promise.resolve({ data: errand() }),
          [OTHER_CASE_NUMBER]: () => Promise.reject({ status: 404 }),
        });

        const result = await createByggrSource(api).fetch(ctx);

        expect(result.sources).toEqual([{ source: 'BYGGR', status: 'OK' }]);
        expect(result.documents[1]).toEqual(toBareDocument(OTHER_CASE_NUMBER));
      });

      it('emits nothing, without reading any decisions, when the party has no errands', async () => {
        const api = createMockApiService();
        api.get.mockResolvedValue({ data: [] });

        const result = await createByggrSource(api).fetch(ctx);

        expect(api.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ documents: [], decisions: [], sources: [{ source: 'BYGGR', status: 'OK' }] });
      });

      it('fails, so the source is reported unavailable, when the context carries no legal id', async () => {
        const api = createMockApiService();

        await expect(createByggrSource(api).fetch({ ...ctx, identifier: undefined })).rejects.toThrow(/legal id/);
        expect(api.get).not.toHaveBeenCalled();
      });
    });

    describe('fetchDetails', () => {
      it('reads the decisions of the requested case and returns the full document', async () => {
        const api = createMockApiService();
        api.get.mockResolvedValue({ data: errand() });

        const document = await createByggrSource(api).fetchDetails!(CASE_NUMBER, ctx);

        expect(api.get).toHaveBeenCalledWith(expect.objectContaining({ params: { caseNumber: CASE_NUMBER } }), mockUser);
        expect(document).toMatchObject({ id: `br-${CASE_NUMBER}`, title: 'Nybyggnad av garage' });
        expect(document?.decisions).toHaveLength(1);
      });

      it('is undefined when the upstream does not know the case for this applicant', async () => {
        const api = createMockApiService();
        api.get.mockRejectedValue({ status: 404 });

        await expect(createByggrSource(api).fetchDetails!(CASE_NUMBER, ctx)).resolves.toBeUndefined();
      });

      it('is undefined without a legal id and never calls upstream', async () => {
        const api = createMockApiService();

        await expect(createByggrSource(api).fetchDetails!(CASE_NUMBER, { ...ctx, identifier: undefined })).resolves.toBeUndefined();
        expect(api.get).not.toHaveBeenCalled();
      });
    });

    describe('fetchDecisionAttachment', () => {
      const nativeId = toDecisionNativeId(101, CASE_NUMBER);

      it('re-reads the case, finds the document on the decision and downloads it through our own gateway base', async () => {
        const api = createMockApiService();
        api.get.mockResolvedValueOnce({ data: errand() }).mockResolvedValueOnce({ data: Buffer.from('pdf-bytes') });

        await expect(createByggrSource(api).fetchDecisionAttachment!(nativeId, '4711', ctx)).resolves.toBe(
          Buffer.from('pdf-bytes').toString('base64'),
        );

        expect(api.get).toHaveBeenCalledTimes(2);
        const [download] = api.get.mock.calls[1];
        expect(download.url).toMatch(/\/files\/4711$/);
        expect(download.url).not.toContain('api.example.se');
        expect(download.params).toEqual({ token: TOKEN });
        expect(download.responseType).toBe('arraybuffer');
      });

      it('returns null when the document does not sit on that decision', async () => {
        const api = createMockApiService();
        api.get.mockResolvedValue({ data: errand() });

        await expect(createByggrSource(api).fetchDecisionAttachment!(nativeId, '9999', ctx)).resolves.toBeNull();
        await expect(createByggrSource(api).fetchDecisionAttachment!(toDecisionNativeId(999, CASE_NUMBER), '4711', ctx)).resolves.toBeNull();
        expect(api.get).toHaveBeenCalledTimes(2);
      });

      it('returns null when the applicant does not own the case', async () => {
        const api = createMockApiService();
        api.get.mockRejectedValue({ status: 404 });

        await expect(createByggrSource(api).fetchDecisionAttachment!(nativeId, '4711', ctx)).resolves.toBeNull();
        expect(api.get).toHaveBeenCalledTimes(1);
      });

      it('returns null, without downloading, when the document carries no usable token', async () => {
        const api = createMockApiService();
        api.get.mockResolvedValue({
          data: errand({ decisions: [decision({ documents: [{ id: '4711', name: 'Beslut.pdf', url: 'https://api.example.se/files/4711' }] })] }),
        });

        await expect(createByggrSource(api).fetchDecisionAttachment!(nativeId, '4711', ctx)).resolves.toBeNull();
        expect(api.get).toHaveBeenCalledTimes(1);
      });

      it('returns null for a malformed id without touching upstream', async () => {
        const api = createMockApiService();

        await expect(createByggrSource(api).fetchDecisionAttachment!('101', '4711', ctx)).resolves.toBeNull();
        await expect(createByggrSource(api).fetchDecisionAttachment!(nativeId, 'abc', ctx)).resolves.toBeNull();
        await expect(createByggrSource(api).fetchDecisionAttachment!(nativeId, '4711', { ...ctx, identifier: undefined })).resolves.toBeNull();
        expect(api.get).not.toHaveBeenCalled();
      });

      it('returns null when the file itself is gone', async () => {
        const api = createMockApiService();
        api.get.mockResolvedValueOnce({ data: errand() }).mockRejectedValueOnce({ status: 404 });

        await expect(createByggrSource(api).fetchDecisionAttachment!(nativeId, '4711', ctx)).resolves.toBeNull();
      });

      it('rethrows other download failures', async () => {
        const api = createMockApiService();
        api.get.mockResolvedValueOnce({ data: errand() }).mockRejectedValueOnce({ status: 500 });

        await expect(createByggrSource(api).fetchDecisionAttachment!(nativeId, '4711', ctx)).rejects.toEqual({ status: 500 });
      });
    });
  });
});
