import { emptyInvoice, fetchInvoices, getInvoiceDateFrom } from '@/services/invoices.service';
import { createMockApiService } from './helpers/mockApiService';
import { mockUser } from './helpers/fixtures';
import { TEST_REPRESENTING_PARTY_ID } from './helpers/constants';

describe('invoices.service', () => {
  describe('getInvoiceDateFrom', () => {
    it('returns a date string 12 months ago in YYYY-MM-DD format', () => {
      const result = getInvoiceDateFrom();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const resultDate = new Date(result);
      const now = new Date();
      const diffMonths = (now.getFullYear() - resultDate.getFullYear()) * 12 + (now.getMonth() - resultDate.getMonth());
      expect(diffMonths).toBe(12);
    });
  });

  describe('fetchInvoices', () => {
    it('returns invoice data on success', async () => {
      const api = createMockApiService();
      const invoiceData = {
        invoices: [{ invoiceNumber: '123' }],
        _meta: { totalRecords: 1 },
      };
      api.get.mockResolvedValue({ data: invoiceData });

      const result = await fetchInvoices(TEST_REPRESENTING_PARTY_ID, mockUser, api);

      expect(result).toEqual(invoiceData);
      expect(api.get).toHaveBeenCalledWith(
        {
          url: expect.stringContaining('/PUBLIC_ADMINISTRATION'),
          params: expect.objectContaining({
            partyId: TEST_REPRESENTING_PARTY_ID,
            invoiceDateFrom: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          }),
        },
        mockUser,
      );
    });

    it('returns emptyInvoice when invoices array is empty', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: { invoices: [], _meta: {} } });

      const result = await fetchInvoices(TEST_REPRESENTING_PARTY_ID, mockUser, api);

      expect(result).toEqual(emptyInvoice);
    });

    it('returns emptyInvoice on 404 error', async () => {
      const api = createMockApiService();
      api.get.mockRejectedValue({ status: 404 });

      const result = await fetchInvoices(TEST_REPRESENTING_PARTY_ID, mockUser, api);

      expect(result).toEqual(emptyInvoice);
    });

    it('returns emptyInvoice on other errors', async () => {
      const api = createMockApiService();
      api.get.mockRejectedValue({ status: 500 });

      const result = await fetchInvoices(TEST_REPRESENTING_PARTY_ID, mockUser, api);

      expect(result).toEqual(emptyInvoice);
    });
  });
});
