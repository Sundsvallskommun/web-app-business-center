import { emptyInvoice, fetchInvoicePdf, fetchInvoices, getInvoiceDateFrom } from '@/services/invoices.service';
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

  describe('fetchInvoicePdf', () => {
    const pdf = { fileName: 'faktura-999.pdf', file: 'base64-content' };

    // First api.get call resolves the party's invoices, second resolves the pdf.
    const mockInvoicesThenPdf = (api: ReturnType<typeof createMockApiService>, invoices: { invoiceNumber: string }[]) => {
      api.get.mockResolvedValueOnce({ data: { invoices, _meta: {} } }).mockResolvedValueOnce({ data: pdf });
    };

    it('returns the pdf when the invoice belongs to the represented party', async () => {
      const api = createMockApiService();
      mockInvoicesThenPdf(api, [{ invoiceNumber: '123' }, { invoiceNumber: '999' }]);

      const result = await fetchInvoicePdf(TEST_REPRESENTING_PARTY_ID, '999', mockUser, api);

      expect(result).toEqual(pdf);
      // The pdf request must target the requested invoice id.
      expect(api.get).toHaveBeenLastCalledWith({ url: expect.stringMatching(/\/999\/pdf$/) }, mockUser);
    });

    it('throws 404 and never requests the pdf when the invoice belongs to another party', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValueOnce({ data: { invoices: [{ invoiceNumber: '123' }], _meta: {} } });

      await expect(fetchInvoicePdf(TEST_REPRESENTING_PARTY_ID, '999', mockUser, api)).rejects.toMatchObject({ status: 404 });
      // Only the ownership lookup ran; the pdf endpoint was never reached.
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    it('throws 404 when the represented party has no invoices', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValueOnce({ data: { invoices: [], _meta: {} } });

      await expect(fetchInvoicePdf(TEST_REPRESENTING_PARTY_ID, '999', mockUser, api)).rejects.toMatchObject({ status: 404 });
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    it('throws 404 when the invoice lookup fails (fails closed)', async () => {
      const api = createMockApiService();
      // fetchInvoices swallows errors and returns an empty list, so ownership can never be proven.
      api.get.mockRejectedValueOnce({ status: 500 });

      await expect(fetchInvoicePdf(TEST_REPRESENTING_PARTY_ID, '999', mockUser, api)).rejects.toMatchObject({ status: 404 });
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });
});
