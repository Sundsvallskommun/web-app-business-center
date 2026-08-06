import { getIsWhitelisted, mandateBelongsToUser } from '@/services/mandate.service';
import { createMockApiService } from './helpers/mockApiService';
import { mockUser } from './helpers/fixtures';
import { TEST_ORG_PARTY_ID } from './helpers/constants';

describe('mandate.service', () => {
  describe('getIsWhitelisted', () => {
    it('throws 400 when either party id is missing', async () => {
      const api = createMockApiService();

      await expect(getIsWhitelisted({ ...mockUser, partyId: undefined } as never, TEST_ORG_PARTY_ID, api)).rejects.toMatchObject({ status: 400 });
      await expect(getIsWhitelisted(mockUser, '', api)).rejects.toMatchObject({ status: 400 });
      expect(api.get).not.toHaveBeenCalled();
    });

    it('returns true when an active mandate is whitelisted, querying with the ACTIVE status', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: { mandateDetailsList: [{ whitelisted: false }, { whitelisted: true }] } });

      await expect(getIsWhitelisted(mockUser, TEST_ORG_PARTY_ID, api)).resolves.toBe(true);
      expect(api.get).toHaveBeenCalledWith(
        {
          url: expect.stringContaining('/mandates'),
          params: expect.objectContaining({ grantorPartyId: TEST_ORG_PARTY_ID, granteePartyId: mockUser.partyId, statuses: ['ACTIVE'] }),
        },
        mockUser,
      );
    });

    it('returns false when no mandate is whitelisted', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: { mandateDetailsList: [{ whitelisted: false }] } });

      await expect(getIsWhitelisted(mockUser, TEST_ORG_PARTY_ID, api)).resolves.toBe(false);
    });

    it('defaults to not whitelisted (rather than blocking login) when the mandate API throws', async () => {
      const api = createMockApiService();
      api.get.mockRejectedValue(new Error('mandates down'));

      await expect(getIsWhitelisted(mockUser, TEST_ORG_PARTY_ID, api)).resolves.toBe(false);
    });
  });

  describe('mandateBelongsToUser', () => {
    it('returns false without calling the API when no mandate id is given', async () => {
      const api = createMockApiService();

      await expect(mandateBelongsToUser('', mockUser, TEST_ORG_PARTY_ID, api)).resolves.toBe(false);
      expect(api.get).not.toHaveBeenCalled();
    });

    it('returns true when the mandate was granted to the user (grantee), without querying the grantor', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValueOnce({ data: { mandateDetailsList: [{ id: 'm1' }] } });

      await expect(mandateBelongsToUser('m1', mockUser, TEST_ORG_PARTY_ID, api)).resolves.toBe(true);
      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith({ url: expect.stringContaining('/mandates'), params: { granteePartyId: mockUser.partyId } }, mockUser);
    });

    it('returns true when the mandate was granted by the represented organization (grantor)', async () => {
      const api = createMockApiService();
      api.get
        .mockResolvedValueOnce({ data: { mandateDetailsList: [{ id: 'other' }] } }) // grantee lookup
        .mockResolvedValueOnce({ data: { mandateDetailsList: [{ id: 'm1' }] } }); // grantor lookup

      await expect(mandateBelongsToUser('m1', mockUser, TEST_ORG_PARTY_ID, api)).resolves.toBe(true);
      expect(api.get).toHaveBeenCalledTimes(2);
      expect(api.get).toHaveBeenLastCalledWith(
        { url: expect.stringContaining('/mandates'), params: { grantorPartyId: TEST_ORG_PARTY_ID } },
        mockUser,
      );
    });

    it('returns false when the mandate belongs to neither the user nor the represented organization', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: { mandateDetailsList: [{ id: 'other' }] } });

      await expect(mandateBelongsToUser('m1', mockUser, TEST_ORG_PARTY_ID, api)).resolves.toBe(false);
    });

    it('does not query the grantor when the user represents no organization', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValueOnce({ data: { mandateDetailsList: [] } });

      await expect(mandateBelongsToUser('m1', mockUser, undefined, api)).resolves.toBe(false);
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    it('fails closed (returns false) when the mandate lookup throws', async () => {
      const api = createMockApiService();
      api.get.mockRejectedValue(new Error('mandates down'));

      await expect(mandateBelongsToUser('m1', mockUser, TEST_ORG_PARTY_ID, api)).resolves.toBe(false);
    });
  });
});
