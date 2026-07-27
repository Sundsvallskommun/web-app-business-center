import { getIsWhitelisted } from '@/services/mandate.service';
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
});
