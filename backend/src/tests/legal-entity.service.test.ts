import { LegalEntity2, PersonEngagement } from '@/data-contracts/legalentity/data-contracts';
import {
  getBusinessEngagements,
  getBusinessInformation,
  getBusinessInformationByGuid,
  getGuid,
  getLegalEntity,
  mapEngagements,
} from '@/services/legal-entity.service';
import { createMockApiService } from './helpers/mockApiService';
import { mockUser } from './helpers/fixtures';
import { routeByUrl } from './helpers/routeByUrl';
import { TEST_LEGAL_ENTITY_GUID, mockOrganizationNumber, mockPersonNumber } from './helpers/constants';

describe('legal-entity.service', () => {
  describe('getGuid', () => {
    it('returns guid when API returns data', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: TEST_LEGAL_ENTITY_GUID });

      const result = await getGuid(mockOrganizationNumber, mockUser, api);

      expect(result).toBe(TEST_LEGAL_ENTITY_GUID);
      expect(api.get).toHaveBeenCalledWith({ url: expect.stringContaining(`/${mockOrganizationNumber}/guid`) }, mockUser);
    });

    it('throws 404 when API returns no data', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: null });

      await expect(getGuid(mockOrganizationNumber, mockUser, api)).rejects.toMatchObject({
        status: 404,
        message: 'Not Found',
      });
    });
  });

  describe('getLegalEntity', () => {
    const mockLegalEntity: Partial<LegalEntity2> = {
      name: 'Test AB',
      organizationNumber: mockOrganizationNumber,
      postAddress: {
        city: 'Sundsvall',
        address1: 'Storgatan 1',
        postalCode: '85230',
        coAdress: '',
      },
    };

    it('returns legal entity when API returns data', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: mockLegalEntity });

      const result = await getLegalEntity(TEST_LEGAL_ENTITY_GUID, mockUser, api);

      expect(result).toEqual(mockLegalEntity);
      expect(api.get).toHaveBeenCalledWith({ url: expect.stringContaining(`/${TEST_LEGAL_ENTITY_GUID}`) }, mockUser);
    });

    it('throws 404 when API returns no data', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: null });

      await expect(getLegalEntity(TEST_LEGAL_ENTITY_GUID, mockUser, api)).rejects.toMatchObject({
        status: 404,
        message: 'Not Found',
      });
    });
  });

  describe('getBusinessInformationByGuid', () => {
    it('returns mapped business information', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({
        data: {
          name: 'Test AB',
          postAddress: {
            city: 'Sundsvall',
            address1: 'Storgatan 1',
            postalCode: '85230',
            coAdress: 'c/o Someone',
          },
        },
      });

      const result = await getBusinessInformationByGuid(TEST_LEGAL_ENTITY_GUID, mockUser, api);

      expect(result).toEqual({
        companyLocation: {
          city: 'Sundsvall',
          street: 'Storgatan 1',
          postcode: '85230',
          careOf: 'c/o Someone',
        },
      });
    });

    it('returns empty strings for missing address fields', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({
        data: {
          name: 'Test AB',
          postAddress: {},
        },
      });

      const result = await getBusinessInformationByGuid(TEST_LEGAL_ENTITY_GUID, mockUser, api);

      expect(result).toEqual({
        companyLocation: {
          city: '',
          street: '',
          postcode: '',
          careOf: '',
        },
      });
    });
  });

  describe('getBusinessInformation', () => {
    it('calls getGuid then getLegalEntity and returns business info', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValueOnce({ data: TEST_LEGAL_ENTITY_GUID }).mockResolvedValueOnce({
        data: {
          name: 'Test AB',
          postAddress: {
            city: 'Sundsvall',
            address1: 'Storgatan 1',
            postalCode: '85230',
            coAdress: '',
          },
        },
      });

      const result = await getBusinessInformation(mockOrganizationNumber, mockUser, api);

      expect(api.get).toHaveBeenCalledTimes(2);
      expect(api.get).toHaveBeenNthCalledWith(1, { url: expect.stringContaining(`/${mockOrganizationNumber}/guid`) }, mockUser);
      expect(api.get).toHaveBeenNthCalledWith(2, { url: expect.stringContaining(`/${TEST_LEGAL_ENTITY_GUID}`) }, mockUser);
      expect(result).toEqual({
        companyLocation: {
          city: 'Sundsvall',
          street: 'Storgatan 1',
          postcode: '85230',
          careOf: '',
        },
      });
    });
  });

  describe('mapEngagements', () => {
    it('maps valid engagements', () => {
      const input: Partial<PersonEngagement>[] = [
        { name: 'Company A', organizationNumber: '1234567890', isAuthorizedSignatory: true },
        { name: 'Company B', organizationNumber: '0987654321', isAuthorizedSignatory: false },
      ];

      const result = mapEngagements(input as PersonEngagement[]);

      expect(result).toEqual([
        { organizationName: 'Company A', organizationNumber: '1234567890', isAuthorizedSignatory: true },
        { organizationName: 'Company B', organizationNumber: '0987654321', isAuthorizedSignatory: false },
      ]);
    });

    it('filters out engagements without name', () => {
      const input: Partial<PersonEngagement>[] = [{ name: 'Company A', organizationNumber: '1234567890' }, { organizationNumber: '0987654321' }];

      const result = mapEngagements(input as PersonEngagement[]);

      expect(result).toHaveLength(1);
      expect(result[0].organizationName).toBe('Company A');
    });

    it('filters out engagements without organizationNumber', () => {
      const input: Partial<PersonEngagement>[] = [{ name: 'Company A', organizationNumber: '1234567890' }, { name: 'Company B' }];

      const result = mapEngagements(input as PersonEngagement[]);

      expect(result).toHaveLength(1);
    });

    it('defaults isAuthorizedSignatory to false', () => {
      const input: Partial<PersonEngagement>[] = [{ name: 'Company A', organizationNumber: '1234567890' }];

      const result = mapEngagements(input as PersonEngagement[]);

      expect(result[0].isAuthorizedSignatory).toBe(false);
    });

    it('returns empty array for empty input', () => {
      expect(mapEngagements([])).toEqual([]);
    });
  });

  describe('getBusinessEngagements', () => {
    const personEngagement = {
      organizationNumber: mockOrganizationNumber,
      name: 'Person Engagement AB',
      isAuthorizedSignatory: true,
      isSoleTrader: false,
    };

    it('throws when personNumber is missing', async () => {
      const api = createMockApiService();
      await expect(getBusinessEngagements({ ...mockUser, personNumber: undefined } as any, api)).rejects.toThrow(
        'Bad Request: personalNumber is required',
      );
    });

    it('returns person engagements when there are no mandates', async () => {
      const api = createMockApiService();
      routeByUrl(api, 'get', {
        '/engagements/person/': () => Promise.resolve({ data: [personEngagement] }),
        '/mandates': () => Promise.resolve({ data: { mandateDetailsList: [] } }),
      });

      const result = await getBusinessEngagements(mockUser, api);

      expect(result).toEqual([personEngagement]);
    });

    it('falls back to mandate-derived engagements when the engagements API fails', async () => {
      const api = createMockApiService();
      routeByUrl(api, 'get', {
        '/engagements/person/': () => Promise.reject(new Error('engagements down')),
        '/mandates': () =>
          Promise.resolve({
            data: { mandateDetailsList: [{ grantorDetails: { grantorPartyId: 'grantor-1', signatoryPartyId: 's' } }] },
          }),
        '/grantor-1': () => Promise.resolve({ data: { organizationNumber: '999', name: 'Granted Co' } }),
      });

      const result = await getBusinessEngagements(mockUser, api);

      expect(result).toEqual([{ organizationNumber: '999', name: 'Granted Co', isAuthorizedSignatory: false, isSoleTrader: null }]);
    });

    it('returns an empty array when both engagements and mandates fail', async () => {
      const api = createMockApiService();
      routeByUrl(api, 'get', {
        '/engagements/person/': () => Promise.reject(new Error('engagements down')),
        '/mandates': () => Promise.reject(new Error('mandates down')),
      });

      const result = await getBusinessEngagements(mockUser, api);

      expect(result).toEqual([]);
    });

    it('keeps successful grantor lookups when one fails (Promise.allSettled)', async () => {
      const api = createMockApiService();
      routeByUrl(api, 'get', {
        '/engagements/person/': () => Promise.resolve({ data: [] }),
        '/mandates': () =>
          Promise.resolve({
            data: {
              mandateDetailsList: [
                { grantorDetails: { grantorPartyId: 'grantor-ok', signatoryPartyId: 's' } },
                { grantorDetails: { grantorPartyId: 'grantor-fail', signatoryPartyId: 's' } },
              ],
            },
          }),
        '/grantor-ok': () => Promise.resolve({ data: { organizationNumber: '222', name: 'Granted Co' } }),
        '/grantor-fail': () => Promise.reject(new Error('grantor lookup failed')),
      });

      const result = await getBusinessEngagements(mockUser, api);

      expect(result).toEqual([{ organizationNumber: '222', name: 'Granted Co', isAuthorizedSignatory: false, isSoleTrader: null }]);
    });

    it('deduplicates by organizationNumber, keeping the direct engagement', async () => {
      const api = createMockApiService();
      routeByUrl(api, 'get', {
        '/engagements/person/': () => Promise.resolve({ data: [personEngagement] }),
        '/mandates': () =>
          Promise.resolve({
            data: { mandateDetailsList: [{ grantorDetails: { grantorPartyId: 'grantor-1', signatoryPartyId: 's' } }] },
          }),
        '/grantor-1': () => Promise.resolve({ data: { organizationNumber: mockOrganizationNumber, name: 'Same Org Via Mandate' } }),
      });

      const result = await getBusinessEngagements(mockUser, api);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(personEngagement);
    });

    it('skips the mandate lookup when the user has no partyId', async () => {
      const api = createMockApiService();
      routeByUrl(api, 'get', {
        '/engagements/person/': () => Promise.resolve({ data: [personEngagement] }),
      });

      const result = await getBusinessEngagements({ ...mockUser, partyId: undefined } as any, api);

      expect(result).toEqual([personEngagement]);
      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith({ url: expect.stringContaining(`/engagements/person/${mockPersonNumber}`) }, expect.anything());
    });
  });
});
