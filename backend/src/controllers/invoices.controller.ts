import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Param, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { HttpException } from '@/exceptions/HttpException';
import { InvoicePdf, InvoicesResponse } from '@/interfaces/invoices.interface';
import { MUNICIPALITY_ID } from '@/config';

interface ResponseData {
  data: InvoicesResponse | InvoicePdf;
  message: string;
}

@Controller()
export class InvoicesController {
  private apiService = new ApiService();

  @Get('/invoices')
  @OpenAPI({ summary: 'Return a list of invoices for current represented organization' })
  @UseBefore(authMiddleware)
  async getInvoices(@Req() req: RequestWithUser): Promise<ResponseData> {
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

    const url = `invoices/8.0/${MUNICIPALITY_ID}/PUBLIC_ADMINISTRATION`;
    const res = await this.apiService.get<InvoicesResponse>({ url, params });

    if (Array.isArray(res.data) && res.data.length < 1) {
      throw new HttpException(404, 'Not Found');
    }

    return { data: res.data, message: 'success' };
  }

  @Get('/invoicepdf/:id')
  @OpenAPI({ summary: 'Return the base64 encoded pdf by invoice id' })
  @UseBefore(authMiddleware)
  async getInvoicePdf(@Req() req: RequestWithUser, @Param('id') id: string): Promise<ResponseData> {
    if (!id) {
      throw new HttpException(400, 'Bad Request');
    }

    // Issuer, municipality orgNr: 2120002411
    const url = `invoices/8.0/${MUNICIPALITY_ID}/PUBLIC_ADMINISTRATION/2120002411/${id}/pdf`;
    const res = await this.apiService.get<InvoicePdf>({ url });

    return { data: res.data, message: 'success' };
  }
}
