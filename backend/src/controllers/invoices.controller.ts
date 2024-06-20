import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Param, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { HttpException } from '@/exceptions/HttpException';
import { InvoicePdf, InvoicesResponse } from '@/interfaces/invoices.interface';
import { ApiResponse } from '../interfaces/service';
import { mockedInvoices } from './tmp_mocks/invoices';
import { NODE_ENV } from '../config';

const tmpTestInvoices = {
  invoices: mockedInvoices,
  _meta: {
    page: 1,
    limit: 100,
    count: mockedInvoices.length,
    totalRecords: mockedInvoices.length,
    totalPages: 1,
  },
};

const emptyInvoice = {
  invoices: [],
  _meta: undefined,
};
@Controller()
export class InvoicesController {
  private apiService = new ApiService();

  @Get('/invoices')
  @OpenAPI({ summary: 'Return a list of invoices for current represented organization' })
  @UseBefore(authMiddleware)
  async getInvoices(@Req() req: RequestWithUser): Promise<ApiResponse<InvoicesResponse>> {
    const { organizationId, organizationNumber } = req?.session?.representing;

    if (!organizationId || !organizationNumber) {
      throw new HttpException(400, 'Bad Request');
    }

    const invoiceDateFrom = new Date();
    invoiceDateFrom.setMonth(invoiceDateFrom.getMonth() - 12); // 12 months back

    const params = {
      partyId: organizationId,
      organizationNumber: 2120002411, // Issuer, municipality
      invoiceDateFrom: invoiceDateFrom.toISOString().split('T')[0],
      // page: 1, // default
      // limit: 100, // default
    };

    try {
      const url = `invoices/7.1/PUBLIC_ADMINISTRATION`;
      const res = await this.apiService.get<InvoicesResponse>({ url, params });

      if (Array.isArray(res.data) && res.data.length < 1) {
        return { data: emptyInvoice, message: 'success' };
      }

      // Remove when mockedInvoices can be removed (test-invoices from api)
      const data = NODE_ENV === 'development' ? tmpTestInvoices : res.data;

      return { data: data, message: 'success' };
    } catch (error) {
      if (error.status === 404) {
        return { data: emptyInvoice, message: '404 from api, Assumed empty array' };
      } else {
        return { data: emptyInvoice, message: 'error' };
      }
    }
  }

  @Get('/invoicepdf/:id')
  @OpenAPI({ summary: 'Return the base64 encoded pdf by invoice id' })
  @UseBefore(authMiddleware)
  async getInvoicePdf(@Req() req: RequestWithUser, @Param('id') id: string): Promise<ApiResponse<InvoicePdf>> {
    if (!id) {
      throw new HttpException(400, 'Bad Request');
    }

    // Issuer, municipality orgNr: 2120002411
    const url = `invoices/7.1/PUBLIC_ADMINISTRATION/2120002411/${id}/pdf`;
    const res = await this.apiService.get<InvoicePdf>({ url });

    return { data: res.data, message: 'success' };
  }
}
