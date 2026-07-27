import { emptyInvoice, fetchInvoices, getInvoiceDateFrom } from '@/services/invoices.service';
import { createMockApiService } from './helpers/mockApiService';
import { mockUser } from './helpers/fixtures';
import { TEST_REPRESENTING_PARTY_ID } from './helpers/constants';

describe('invoices.service', () => {
  describe('getInvoiceDateFrom', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    // Frozen at a mid-month, midday-UTC instant so the result is the same date in
    // every timezone (avoids the month-boundary drift a live `new Date()` risks).
    it('returns the date exactly 12 months before now in YYYY-MM-DD format', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));

      expect(getInvoiceDateFrom()).toBe('2024-06-15');
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
