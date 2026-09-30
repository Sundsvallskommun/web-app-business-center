import { Decision, DecisionDecisionOutcomeEnum, DecisionDecisionTypeEnum } from '@/data-contracts/case-data/data-contracts';
import { Asset, Status } from '@/data-contracts/partyassets/data-contracts';
import { parseCompositeId, toCompositeId } from '@/interfaces/document.interface';
import { asOwned } from '@/interfaces/owned';
import { fetchPartyDecisions, toDecisionItem } from '@/services/documents/casedata.source';
import { assetTitle, toDocument } from '@/services/documents/partyassets.source';
import { mockUser } from './helpers/fixtures';
import { createMockApiService } from './helpers/mockApiService';

const asset = (overrides: Partial<Asset> = {}): Asset => ({
  id: 'asset-1',
  assetId: 'PRH-2026-000001',
  partyId: 'party-1',
  type: 'PARKINGPERMIT',
  description: 'Parkeringstillstånd',
  issued: '2025-01-01',
  validTo: '2027-01-01',
  status: Status.ACTIVE,
  ...overrides,
});

const decision = (overrides: Partial<Decision> = {}): Decision & { id: number } => ({
  id: 1,
  errandId: 10,
  errandNumber: 'PRH-2026-000001',
  decisionType: DecisionDecisionTypeEnum.FINAL,
  decisionOutcome: DecisionDecisionOutcomeEnum.APPROVAL,
  decidedAt: '2025-01-15T10:00:00Z',
  validFrom: '2025-01-15T00:00:00Z',
  validTo: '2027-01-15T00:00:00Z',
  attachments: [{ id: 100, name: 'beslut.pdf', mimeType: 'application/pdf', extension: 'pdf' }],
  ...overrides,
});

describe('composite ids', () => {
  it('round trips a source and a native id', () => {
    expect(parseCompositeId(toCompositeId('CASEDATA', 12))).toEqual({ source: 'CASEDATA', nativeId: '12' });
    expect(toCompositeId('PARTYASSETS', 'asset-1')).toBe('pa-asset-1');
    expect(toCompositeId('CASEDATA', 12)).toBe('cd-12');
  });

  it('keeps everything after the first separator as the native id', () => {
    expect(parseCompositeId('pa-dace9046-ac71-4f26')).toEqual({ source: 'PARTYASSETS', nativeId: 'dace9046-ac71-4f26' });
  });

  it.each(['', 'asset-1', '-asset-1', 'pa-', 'lc-1'])('rejects %j', id => {
    expect(parseCompositeId(id)).toBeUndefined();
  });
});

describe('partyassets.source', () => {
  describe('assetTitle', () => {
    it('prefers the service type over the description', () => {
      expect(assetTitle(asset(), { restyp: ['Färdtjänst', 'Riksfärdtjänst'] } as never)).toBe('Färdtjänst, Riksfärdtjänst');
    });

    it('falls back to the description, then the type', () => {
      expect(assetTitle(asset())).toBe('Parkeringstillstånd');
      expect(assetTitle(asset({ description: undefined }))).toBe('PARKINGPERMIT');
    });
  });

  describe('toDocument', () => {
    it('projects the asset onto a document keyed by the errands linked to it', () => {
      const document = toDocument(asOwned(asset()), undefined, ['5115', '1532']);

      expect(document).toMatchObject({
        id: 'pa-asset-1',
        source: 'PARTYASSETS',
        title: 'Parkeringstillstånd',
        status: 'ACTIVE',
        issued: '2025-01-01',
        validTo: '2027-01-01',
        decisions: [],
        matchKeys: ['5115', '1532'],
      });
    });

    it('has no match keys when no errand is linked to the asset', () => {
      expect(toDocument(asOwned(asset())).matchKeys).toEqual([]);
    });

    it('carries the client asset as the detail payload without internal fields', () => {
      const document = toDocument(asOwned(asset()), { restyp: ['Färdtjänst'] } as never);

      expect(document.asset).toMatchObject({ id: 'asset-1', assetId: 'PRH-2026-000001', service: { restyp: ['Färdtjänst'] } });
      expect(document.asset).not.toHaveProperty('partyId');
      expect(document.asset).not.toHaveProperty('jsonParameters');
    });

    it('leaves the status out when it is not one the card can show', () => {
      expect(toDocument(asOwned(asset({ status: Status.DRAFT }))).status).toBeUndefined();
    });
  });
});

describe('casedata.source', () => {
  describe('fetchPartyDecisions', () => {
    it('reads the party scoped listing and returns its content', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: { content: [decision()] }, message: 'success' });

      await expect(fetchPartyDecisions('party-1', mockUser, undefined, api)).resolves.toEqual([decision()]);
      expect(api.get).toHaveBeenCalledWith(expect.objectContaining({ url: expect.stringContaining('/errands/party-1/decisions') }), mockUser);
    });

    it('treats an upstream 404 as no decisions', async () => {
      const api = createMockApiService();
      api.get.mockRejectedValue({ status: 404 });

      await expect(fetchPartyDecisions('party-1', mockUser, undefined, api)).resolves.toEqual([]);
    });

    it('rethrows other upstream failures', async () => {
      const api = createMockApiService();
      api.get.mockRejectedValue({ status: 500 });

      await expect(fetchPartyDecisions('party-1', mockUser, undefined, api)).rejects.toEqual({ status: 500 });
    });
  });

  describe('toDecisionItem', () => {
    it('projects the decision onto a decision item keyed by its errand id', () => {
      expect(toDecisionItem(decision())).toEqual({
        id: 'cd-1',
        source: 'CASEDATA',
        matchKey: '10',
        outcome: 'APPROVAL',
        decidedAt: '2025-01-15T10:00:00Z',
        validFrom: '2025-01-15T00:00:00Z',
        validTo: '2027-01-15T00:00:00Z',
        errandId: 10,
        errandNumber: 'PRH-2026-000001',
        attachments: [{ id: 100, name: 'beslut.pdf', mimeType: 'application/pdf', extension: 'pdf' }],
      });
    });

    it('drops attachments that cannot be downloaded or named, and never emits the namespace', () => {
      const item = toDecisionItem(
        decision({ namespace: 'SBK_PARKING_PERMIT', attachments: [{ id: 100, name: 'beslut.pdf' }, { id: 101 }, { name: 'utan-id.pdf' }] }),
      );

      expect(item.attachments.map(a => a.id)).toEqual([100]);
      expect(item).not.toHaveProperty('namespace');
    });

    it('always carries an attachments array', () => {
      expect(toDecisionItem(decision({ attachments: undefined })).attachments).toEqual([]);
    });

    it('has no match key when the decision carries no errand id, so it can never be owned', () => {
      expect(toDecisionItem(decision({ errandId: undefined })).matchKey).toBeUndefined();
    });
  });
});
