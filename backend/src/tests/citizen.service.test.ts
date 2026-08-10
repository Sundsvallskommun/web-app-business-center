import { getCitizen, getCitizenPersonnumber } from '@/services/citizen.service';
import { createMockApiService } from './helpers/mockApiService';
import { mockUser } from './helpers/fixtures';
import { mockPersonNumber, TEST_CITIZEN_PARTY_ID } from './helpers/constants';

describe('citizen.service', () => {
  const req = { user: mockUser };

  describe('getCitizen', () => {
    it('returns the citizen data and requests the party endpoint', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: { personId: 'abc' } });

      const result = await getCitizen(TEST_CITIZEN_PARTY_ID, req, api);

      expect(result).toEqual({ personId: 'abc' });
      expect(api.get).toHaveBeenCalledWith({ url: expect.stringContaining(`/${TEST_CITIZEN_PARTY_ID}`) }, mockUser);
    });

    it('throws 500 when the API returns no data', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: null });

      await expect(getCitizen(TEST_CITIZEN_PARTY_ID, req, api)).rejects.toMatchObject({ status: 500 });
    });

    it('throws 500 when the API call rejects', async () => {
      const api = createMockApiService();
      api.get.mockRejectedValue(new Error('citizen down'));

      await expect(getCitizen(TEST_CITIZEN_PARTY_ID, req, api)).rejects.toMatchObject({ status: 500 });
    });
  });

  describe('getCitizenPersonnumber', () => {
    it('requests the /personnumber endpoint and returns the data', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: { personalNumber: mockPersonNumber } });

      const result = await getCitizenPersonnumber(TEST_CITIZEN_PARTY_ID, req, api);

      expect(result).toEqual({ personalNumber: mockPersonNumber });
      expect(api.get).toHaveBeenCalledWith({ url: expect.stringContaining(`/${TEST_CITIZEN_PARTY_ID}/personnumber`) }, mockUser);
    });

    it('throws 500 when the API returns no data', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: null });

      await expect(getCitizenPersonnumber(TEST_CITIZEN_PARTY_ID, req, api)).rejects.toMatchObject({ status: 500 });
    });
  });
});
