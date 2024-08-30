import { InvoicesResponse } from '@interfaces/invoice';
import { ApiResponse } from '@services/api-service';
import { generatedInvoices } from 'cypress/fixtures/utils';

export const getInvoices: ApiResponse<InvoicesResponse> = {
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
};
