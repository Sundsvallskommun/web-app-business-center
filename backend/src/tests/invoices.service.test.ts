const mockGet = jest.fn();

jest.mock('@/services/api.service', () => {
  return jest.fn().mockImplementation(() => ({
    get: mockGet,
  }));
});

jest.mock('@/config', () => ({
  MUNICIPALITY_ID: '2281',
  MUNICIPALITY_ORG_NR: '2120002411',
}));

jest.mock('@/config/api-config', () => ({
  getApiBase: () => '/api/invoices',
}));

import { fetchInvoices, getInvoiceDateFrom, emptyInvoice } from '@/services/invoices.service';

const mockUser = { username: 'test-user', partyId: 'test-party-id' } as any;

describe('invoices.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInvoiceDateFrom', () => {
    it('should return a date string 12 months ago in YYYY-MM-DD format', () => {
      const result = getInvoiceDateFrom();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const resultDate = new Date(result);
      const now = new Date();
      const diffMonths = (now.getFullYear() - resultDate.getFullYear()) * 12 + (now.getMonth() - resultDate.getMonth());
      expect(diffMonths).toBe(12);
    });
  });

  describe('fetchInvoices', () => {
    it('should return invoice data on success', async () => {
      const invoiceData = {
        invoices: [{ invoiceNumber: '123' }],
        _meta: { totalRecords: 1 },
      };
      mockGet.mockResolvedValue({ data: invoiceData });

      const result = await fetchInvoices('party-123', mockUser);

      expect(result).toEqual(invoiceData);
      expect(mockGet).toHaveBeenCalledWith(
        {
          url: '/api/invoices/2281/PUBLIC_ADMINISTRATION',
          params: {
            partyId: 'party-123',
            organizationNumber: '2120002411',
            invoiceDateFrom: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          },
        },
        mockUser,
      );
    });

    it('should return emptyInvoice when invoices array is empty', async () => {
      mockGet.mockResolvedValue({ data: { invoices: [], _meta: {} } });

      const result = await fetchInvoices('party-123', mockUser);

      expect(result).toEqual(emptyInvoice);
    });

    it('should return emptyInvoice on 404 error', async () => {
      mockGet.mockRejectedValue({ status: 404 });

      const result = await fetchInvoices('party-123', mockUser);

      expect(result).toEqual(emptyInvoice);
    });

    it('should return emptyInvoice on other errors', async () => {
      mockGet.mockRejectedValue({ status: 500 });

      const result = await fetchInvoices('party-123', mockUser);

      expect(result).toEqual(emptyInvoice);
    });
  });
});
