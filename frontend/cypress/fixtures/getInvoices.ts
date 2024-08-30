import { RepresentingMode } from '@interfaces/app';
import { InvoicesResponse } from '@interfaces/invoice';
import { ApiResponse } from '@services/api-service';
import { generatedInvoices } from 'cypress/fixtures/utils';

export const getInvoices: (representingMode: RepresentingMode) => ApiResponse<InvoicesResponse> = (
  representingMode = representingModeDefault
) => ({
  data: {
    invoices: generatedInvoices,
    _meta: {
      page: 1,
      limit: 100,
      count: generatedInvoices.length,
      totalRecords: generatedInvoices.length,
      totalPages: 1,
    },
  },
  message: 'success',
});
