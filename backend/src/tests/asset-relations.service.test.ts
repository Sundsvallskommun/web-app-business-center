import { Relation } from '@/data-contracts/relations/data-contracts';
import { CaseDataNamespace } from '@/interfaces/casedata.interface';
import { findSourceErrandForAsset } from '@/services/asset-relations.service';
import { createMockApiService } from './helpers/mockApiService';
import { mockUser } from './helpers/fixtures';

const ASSET_ID = 'dace9046-ac71-4f26-ad5b-ed014a3df5a8';
const OTHER_ASSET_ID = 'befa8162-fe27-2b52-bc3a-eh513a3af6a7';
const ERRAND_ID = '5115';
const OTHER_ERRAND_ID = '1532';

const errandAssetLink = (overrides: Partial<Relation> = {}): Relation => ({
  id: 'dcb85989-d9b1-4b75-9d33-812b0260b946',
  type: 'LINK',
  source: { resourceId: ERRAND_ID, type: 'case', service: 'casedata', namespace: CaseDataNamespace.SBK_PARKING_PERMIT },
  target: { resourceId: ASSET_ID, type: 'asset', service: 'partyassets' },
  ...overrides,
});

const respondWith = (relations: Relation[]) => Promise.resolve({ data: { relations }, message: 'success' });

describe('asset-relations.service', () => {
  describe('findSourceErrandForAsset', () => {
    it('returns the source errand for the errand→asset link', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith([errandAssetLink()]));

      await expect(findSourceErrandForAsset(ASSET_ID, mockUser, api)).resolves.toEqual({
        id: ERRAND_ID,
        namespace: CaseDataNamespace.SBK_PARKING_PERMIT,
      });
    });

    it('queries relations by target.resourceId with the filter percent-encoded', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith([errandAssetLink()]));

      await findSourceErrandForAsset(ASSET_ID, mockUser, api);

      expect(api.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: expect.stringContaining(`filter=target.resourceId%3A%27${ASSET_ID}%27`) }),
        mockUser,
      );
    });

    it.each(['casedata', 'case-data', 'CASE_DATA'])('accepts source service spelled %s', async service => {
      const api = createMockApiService();
      api.get.mockReturnValue(
        respondWith([errandAssetLink({ source: { resourceId: ERRAND_ID, namespace: CaseDataNamespace.SBK_PARKING_PERMIT, type: 'case', service } })]),
      );

      await expect(findSourceErrandForAsset(ASSET_ID, mockUser, api)).resolves.toMatchObject({ id: ERRAND_ID });
    });

    it('returns undefined when the relation carries no errand id', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith([errandAssetLink({ source: { resourceId: '', type: 'case', service: 'casedata' } })]));

      await expect(findSourceErrandForAsset(ASSET_ID, mockUser, api)).resolves.toEqual(undefined);
    });

    it('returns undefined when the relation carries no namespace', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith([errandAssetLink({ source: { resourceId: ERRAND_ID, type: 'case', service: 'casedata' } })]));

      await expect(findSourceErrandForAsset(ASSET_ID, mockUser, api)).resolves.toEqual(undefined);
    });

    it.each([
      ['a non-LINK relation type', errandAssetLink({ type: 'REFERRED_FROM' })],
      ['a source that is not a case', errandAssetLink({ source: { resourceId: ERRAND_ID, type: 'asset', service: 'casedata' } })],
      ['a source in another service', errandAssetLink({ source: { resourceId: ERRAND_ID, type: 'case', service: 'supportmanagement' } })],
      ['a target that is not an asset', errandAssetLink({ target: { resourceId: ASSET_ID, type: 'case', service: 'partyassets' } })],
    ])('ignores %s', async (_label, relation) => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith([relation]));

      await expect(findSourceErrandForAsset(ASSET_ID, mockUser, api)).resolves.toBeUndefined();
    });

    it('returns undefined when the asset has no relations', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith([]));

      await expect(findSourceErrandForAsset(ASSET_ID, mockUser, api)).resolves.toBeUndefined();
    });

    it('returns undefined when the asset id does not match found relation target resource id', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith([errandAssetLink({ target: { resourceId: OTHER_ASSET_ID, type: 'asset', service: 'partyassets' } })]));

      await expect(findSourceErrandForAsset(ASSET_ID, mockUser, api)).resolves.toBeUndefined();
    });

    it('matches the target asset id regardless of casing', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(
        respondWith([errandAssetLink({ target: { resourceId: ASSET_ID.toUpperCase(), type: 'asset', service: 'partyassets' } })]),
      );

      await expect(findSourceErrandForAsset(ASSET_ID, mockUser, api)).resolves.toEqual({
        id: ERRAND_ID,
        namespace: CaseDataNamespace.SBK_PARKING_PERMIT,
      });
    });

    it('returns the correct (user owned) asset when the relation response contains multiple relations', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(
        respondWith([
          errandAssetLink({
            source: { resourceId: OTHER_ERRAND_ID, type: 'case', service: 'casedata', namespace: CaseDataNamespace.SBK_PARKING_PERMIT },
            target: { resourceId: OTHER_ASSET_ID, type: 'asset', service: 'partyassets' },
          }),
          errandAssetLink({
            source: { resourceId: ERRAND_ID, type: 'case', service: 'casedata', namespace: CaseDataNamespace.SBK_PARKING_PERMIT },
            target: { resourceId: ASSET_ID, type: 'asset', service: 'partyassets' },
          }),
        ]),
      );

      await expect(findSourceErrandForAsset(ASSET_ID, mockUser, api)).resolves.toEqual({
        id: ERRAND_ID,
        namespace: CaseDataNamespace.SBK_PARKING_PERMIT,
      });
    });

    it('returns undefined instead of throwing when the relations API fails', async () => {
      const api = createMockApiService();
      api.get.mockRejectedValue(new Error('relations unavailable'));

      await expect(findSourceErrandForAsset(ASSET_ID, mockUser, api)).resolves.toBeUndefined();
    });

    it('does not call the API without an asset id', async () => {
      const api = createMockApiService();

      await expect(findSourceErrandForAsset('', mockUser, api)).resolves.toBeUndefined();
      expect(api.get).not.toHaveBeenCalled();
    });
  });
});
