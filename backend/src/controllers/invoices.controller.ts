import { MUNICIPALITY_ID, MUNICIPALITY_ORG_NR } from '@/config';
import { getApiBase } from '@/config/api-config';
import { PdfInvoice } from '@/data-contracts/invoices/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import { fetchInvoices } from '@/services/invoices.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Param, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { ApiResponse } from '../interfaces/service';
import { getRepresentingPartyId } from '../utils/getRepresentingPartyId';

@Controller()
export class InvoicesController {
  private apiService = new ApiService();
  private apiBase = getApiBase('invoices');

  @Get('/invoices')
  @OpenAPI({ summary: 'Return a list of invoices for current represented organization' })
  @UseBefore(authMiddleware)
  async getInvoices(@Req() req: RequestWithUser) {
    const { representing } = req.session;
    if (!representing) {
      throw new HttpException(400, 'Bad Request');
    }
    const partyId = getRepresentingPartyId(representing);

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    const data = await fetchInvoices(partyId, req.user);
    return { data, message: 'success' };
  }

  @Get('/invoicepdf/:id')
  @OpenAPI({ summary: 'Return the base64 encoded pdf by invoice id' })
  @UseBefore(authMiddleware)
  async getInvoicePdf(@Req() req: RequestWithUser, @Param('id') id: string): Promise<ApiResponse<PdfInvoice>> {
    if (!id) {
      throw new HttpException(400, 'Bad Request');
    }

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/PUBLIC_ADMINISTRATION/${MUNICIPALITY_ORG_NR}/${id}/pdf`;
    const res = await this.apiService.get<PdfInvoice>({ url }, req.user);

    return { data: res.data, message: 'success' };
  }
}
