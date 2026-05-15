import { HttpException } from '@exceptions/HttpException';
import { LegalEntity2, PersonEngagement } from '@/data-contracts/legalentity/data-contracts';

const mockGet = jest.fn();

jest.mock('@/services/api.service', () => {
  return jest.fn().mockImplementation(() => ({
    get: mockGet,
  }));
});

jest.mock('@/config', () => ({
  MUNICIPALITY_ID: '2281',
  NAMESPACE: 'test-namespace',
  LOG_DIR: '../data/logs',
}));

jest.mock('@/config/api-config', () => ({
  getApiBase: () => '/api/legalentity',
}));

import { getGuid, getLegalEntity, getBusinessInformation, getBusinessInformationByGuid, mapEngagements } from '@/services/legal-entity.service';

const mockUser = { username: 'test-user', partyId: 'test-party-id', personNumber: '199001011234', name: 'Test User' } as any;

describe('legal-entity.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGuid', () => {
    it('should return guid when API returns data', async () => {
      mockGet.mockResolvedValue({ data: 'abc-123-guid' });

      const result = await getGuid('5591628136', mockUser);

      expect(result).toBe('abc-123-guid');
      expect(mockGet).toHaveBeenCalledWith(
        { url: '/api/legalentity/2281/5591628136/guid' },
        mockUser,
      );
    });

    it('should throw 404 when API returns no data', async () => {
      mockGet.mockResolvedValue({ data: null });

      await expect(getGuid('5591628136', mockUser)).rejects.toMatchObject({
        status: 404,
        message: 'Not Found',
      });
    });
  });

  describe('getLegalEntity', () => {
    const mockLegalEntity: Partial<LegalEntity2> = {
      name: 'Test AB',
      organizationNumber: '5591628136',
      postAddress: {
        city: 'Sundsvall',
        address1: 'Storgatan 1',
        postalCode: '85230',
        coAdress: '',
      },
    };

    it('should return legal entity when API returns data', async () => {
      mockGet.mockResolvedValue({ data: mockLegalEntity });

      const result = await getLegalEntity('abc-123-guid', mockUser);

      expect(result).toEqual(mockLegalEntity);
      expect(mockGet).toHaveBeenCalledWith(
        { url: '/api/legalentity/2281/abc-123-guid' },
        mockUser,
      );
    });

    it('should throw 404 when API returns no data', async () => {
      mockGet.mockResolvedValue({ data: null });

      await expect(getLegalEntity('abc-123-guid', mockUser)).rejects.toMatchObject({
        status: 404,
        message: 'Not Found',
      });
    });
  });

  describe('getBusinessInformationByGuid', () => {
    it('should return mapped business information', async () => {
      mockGet.mockResolvedValue({
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

      const result = await getBusinessInformationByGuid('abc-123-guid', mockUser);

      expect(result).toEqual({
        companyLocation: {
          city: 'Sundsvall',
          street: 'Storgatan 1',
          postcode: '85230',
          careOf: 'c/o Someone',
        },
      });
    });

    it('should return empty strings for missing address fields', async () => {
      mockGet.mockResolvedValue({
        data: {
          name: 'Test AB',
          postAddress: {},
        },
      });

      const result = await getBusinessInformationByGuid('abc-123-guid', mockUser);

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
    it('should call getGuid then getLegalEntity and return business info', async () => {
      // First call: getGuid
      mockGet.mockResolvedValueOnce({ data: 'abc-123-guid' });
      // Second call: getLegalEntity (inside getBusinessInformationByGuid)
      mockGet.mockResolvedValueOnce({
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

      const result = await getBusinessInformation('5591628136', mockUser);

      expect(mockGet).toHaveBeenCalledTimes(2);
      expect(mockGet).toHaveBeenNthCalledWith(1, { url: '/api/legalentity/2281/5591628136/guid' }, mockUser);
      expect(mockGet).toHaveBeenNthCalledWith(2, { url: '/api/legalentity/2281/abc-123-guid' }, mockUser);
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
    it('should map valid engagements', () => {
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

    it('should filter out engagements without name', () => {
      const input: Partial<PersonEngagement>[] = [
        { name: 'Company A', organizationNumber: '1234567890' },
        { organizationNumber: '0987654321' },
      ];

      const result = mapEngagements(input as PersonEngagement[]);

      expect(result).toHaveLength(1);
      expect(result[0].organizationName).toBe('Company A');
    });

    it('should filter out engagements without organizationNumber', () => {
      const input: Partial<PersonEngagement>[] = [
        { name: 'Company A', organizationNumber: '1234567890' },
        { name: 'Company B' },
      ];

      const result = mapEngagements(input as PersonEngagement[]);

      expect(result).toHaveLength(1);
    });

    it('should default isAuthorizedSignatory to false', () => {
      const input: Partial<PersonEngagement>[] = [
        { name: 'Company A', organizationNumber: '1234567890' },
      ];

      const result = mapEngagements(input as PersonEngagement[]);

      expect(result[0].isAuthorizedSignatory).toBe(false);
    });

    it('should return empty array for empty input', () => {
      expect(mapEngagements([])).toEqual([]);
    });
  });
});
