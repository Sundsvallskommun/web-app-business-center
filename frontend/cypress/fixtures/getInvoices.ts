import { RepresentingMode } from '@interfaces/app';
import { InvoicesResponse } from '@interfaces/invoice';
import { ApiResponse } from '@services/api-service';
import { getGeneratedInvoices } from 'cypress/fixtures/utils';
import { representingModeDefault } from 'cypress/support/e2e';

export const getInvoices: (representingMode: RepresentingMode) => ApiResponse<InvoicesResponse> = (
  representingMode = representingModeDefault
) => ({
  data: {
    invoices: getGeneratedInvoices(representingMode),
    _meta: {
      page: 1,
      limit: 100,
      count: getGeneratedInvoices(representingMode).length,
      totalRecords: getGeneratedInvoices(representingMode).length,
      totalPages: 1,
    },
  },
  message: 'success',
});
